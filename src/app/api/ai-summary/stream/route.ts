// M1-1 — Streaming SSE du résumé IA.
//
// POST { speedTestId, recommendations? } → résumé IA en streaming SSE.
//
// Format SSE émis :
//   data: {"delta":"..."}\n\n     (chunk de texte)
//   data: {"done":true,"model":"..."}\n\n  (fin)
//   data: [DONE]\n\n              (marqueur fin)
//
// Cache DB : on ne stocke que la version finale complète, pas les chunks.
// Feature flag : `aiSummaryStream` (si désactivé, bascule sur l'ancien endpoint JSON).
//
// Voir aussi :
//   - src/app/api/ai-summary/route.ts (endpoint JSON classique, non-streamé)
//   - src/lib/ai/index.ts (streamChat, streamAiSummary)
//   - src/lib/rate-limit.ts (protection quotas)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { streamAiSummary, configuredProviders } from '@/lib/ai'
import { isEnabled } from '@/lib/feature-flags'
import { RATE_POLICIES, checkRate } from '@/lib/rate-limit'
import type { AiReportInput } from '@/lib/ai/types'

export async function POST(req: NextRequest) {
  try {
    // Feature flags
    if (!isEnabled('aiSummary')) {
      return NextResponse.json({ error: 'Fonctionnalité IA désactivée' }, { status: 503 })
    }
    if (!isEnabled('aiSummaryStream')) {
      return NextResponse.json(
        { error: 'Streaming désactivé, utilise /api/ai-summary' },
        { status: 503 }
      )
    }

    // Rate-limit (même politique que l'endpoint non-streamé)
    const policy = RATE_POLICIES.aiSummaryStream
    const rate = await checkRate(req, 'aiSummaryStream', policy.max, policy.windowMs)
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Trop de requêtes — réessaie plus tard', retryAfterSec: rate.retryAfterSec },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSec),
            'X-RateLimit-Limit': String(policy.max),
          },
        }
      )
    }

    const body = await req.json()
    const speedTestId: string = body?.speedTestId ?? ''
    if (!speedTestId) {
      return NextResponse.json({ error: 'speedTestId requis' }, { status: 400 })
    }

    // Récupère le SpeedTest
    const test = await db.speedTest.findUnique({
      where: { id: speedTestId },
      include: { website: true },
    })
    if (!test) {
      return NextResponse.json({ error: 'Test introuvable' }, { status: 404 })
    }

    // Cache DB : si déjà généré, on renvoie en mono-chunk (le client met à jour l'UI)
    if (test.aiSummary) {
      const cachedStream = new ReadableStream<string>({
        start(controller) {
          controller.enqueue(JSON.stringify({ delta: test.aiSummary }))
          controller.enqueue(JSON.stringify({ done: true, model: test.aiModel, cached: true }))
          controller.enqueue('[DONE]')
          controller.close()
        },
      })
      return sseResponse(cachedStream)
    }

    // Providers dispo
    const providers = configuredProviders()
    if (providers.length === 0) {
      return NextResponse.json(
        { error: 'Aucune clé IA configurée (GROQ_API_KEY, GEMINI_API_KEY ou OPENROUTER_API_KEY)' },
        { status: 503 }
      )
    }

    // Recommandations (non stockées en DB, comme l'endpoint JSON)
    const recommendations: { title: string; description: string; impact: string }[] = Array.isArray(
      body?.recommendations
    )
      ? body.recommendations.slice(0, 6)
      : []

    const report: AiReportInput = {
      url: test.website.url,
      device: test.device,
      source: test.source,
      performance: test.performance,
      accessibility: test.accessibility,
      bestPractices: test.bestPractices,
      seo: test.seo,
      lcp: test.lcp,
      fcp: test.fcp,
      tbt: test.tbt,
      cls: test.cls,
      si: test.si,
      ttfb: test.ttfb,
      totalWeight: test.totalWeight,
      recommendations,
    }

    // Lancement du streaming
    const { stream, provider, model } = await streamAiSummary(report)

    // Wrapper : émet les chunks SSE + un message final pour persister en DB
    const encoder = new TextEncoder()
    let fullText = ''

    const sseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const reader = stream.getReader()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            fullText += value
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: value })}\n\n`))
          }

          // Persiste le résumé complet en DB (économie de quota la prochaine fois)
          const finalModel = `${provider}/${model}`
          await db.speedTest
            .update({
              where: { id: speedTestId },
              data: { aiSummary: fullText, aiModel: finalModel },
            })
            .catch((e) => console.warn('[ai-summary-stream] persistance échouée:', e?.message))

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, model: finalModel, cached: false })}\n\n`)
          )
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e: any) {
          // Erreur pendant le stream : on notifie le client
          const errMsg = e?.message ?? 'Erreur streaming'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          )
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return sseResponseFromBytes(sseStream)
  } catch (e: any) {
    console.error('[ai-summary-stream]', e)
    const msg = /Aucun provider|quota|429/i.test(e?.message ?? '')
      ? 'Quotas gratuits épuisés sur tous les providers, réessaie dans quelques minutes.'
      : 'Erreur lors de la génération du résumé IA.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

/** Construit une Response SSE à partir d'un ReadableStream<string> (chunks texte). */
function sseResponse(stream: ReadableStream<string>): Response {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = stream.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(encoder.encode(value))
        }
        controller.close()
      },
    }),
    sseHeaders()
  )
}

/** Construit une Response SSE à partir d'un ReadableStream<Uint8Array> (déjà encodé). */
function sseResponseFromBytes(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, sseHeaders())
}

function sseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // disable proxy buffering (nginx)
  }
}
