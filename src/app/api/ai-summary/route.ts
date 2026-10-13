import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateAiSummary, configuredProviders } from '@/lib/ai'
import { isEnabled } from '@/lib/feature-flags'

// POST { speedTestId } → résumé IA (cache DB, quotas gratuits économisés)
export async function POST(req: NextRequest) {
  try {
    // Feature flag M0-3 : permet de couper le résumé IA sans redéployer (ex: quota payant)
    if (!isEnabled('aiSummary')) {
      return NextResponse.json({ error: 'Fonctionnalité IA désactivée' }, { status: 503 })
    }

    const body = await req.json()
    const speedTestId: string = body?.speedTestId ?? ''
    if (!speedTestId) {
      return NextResponse.json({ error: 'speedTestId requis' }, { status: 400 })
    }

    const test = await db.speedTest.findUnique({
      where: { id: speedTestId },
      include: { website: true },
    })
    if (!test) {
      return NextResponse.json({ error: 'Test introuvable' }, { status: 404 })
    }

    // Cache : ne pas consommer de quota si déjà généré
    if (test.aiSummary) {
      return NextResponse.json({ success: true, summary: test.aiSummary, model: test.aiModel, cached: true })
    }

    const providers = configuredProviders()
    if (providers.length === 0) {
      return NextResponse.json(
        { error: 'Aucune clé IA configurée (GROQ_API_KEY, GEMINI_API_KEY ou OPENROUTER_API_KEY)' },
        { status: 503 }
      )
    }

    // Recommandations transmises par le client (non stockées en DB)
    const recommendations: { title: string; description: string; impact: string }[] = Array.isArray(
      body?.recommendations
    )
      ? body.recommendations.slice(0, 6)
      : []
    const { summary, model } = await generateAiSummary({
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
    })

    await db.speedTest.update({
      where: { id: speedTestId },
      data: { aiSummary: summary, aiModel: model },
    })

    return NextResponse.json({ success: true, summary, model, cached: false })
  } catch (e: any) {
    console.error(e)
    const msg = /Aucun provider|quota|429/i.test(e.message)
      ? 'Quotas gratuits épuisés sur tous les providers, réessaie dans quelques minutes.'
      : 'Erreur lors de la génération du résumé IA.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
