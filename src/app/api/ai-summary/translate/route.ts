// M1-3 — Traduction du résumé IA en EN / ES / DE.
//
// POST { speedTestId, lang } → traduction du résumé.
// Cache : SpeedTest.aiSummaryTranslations (Json map { "en": "...", ... }).
// Feature flag : aiSummaryTranslate.
//
// Approche : appel chat() ultra-léger (maxTokens 600, temperature 0.2) avec un
// system prompt de traduction strict (garde les emojis, le markdown, les termes techniques).

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tryProviders, configuredProviders } from '@/lib/ai'
import { isEnabled } from '@/lib/feature-flags'
import { RATE_POLICIES, checkRate } from '@/lib/rate-limit'

const SUPPORTED_LANGS = ['en', 'es', 'de'] as const
type Lang = (typeof SUPPORTED_LANGS)[number]

const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
}

export async function POST(req: NextRequest) {
  try {
    if (!isEnabled('aiSummaryTranslate')) {
      return NextResponse.json({ error: 'Traduction IA désactivée' }, { status: 503 })
    }

    const policy = RATE_POLICIES.aiSummaryTranslate
    const rate = await checkRate(req, 'aiSummaryTranslate', policy.max, policy.windowMs)
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Trop de requêtes', retryAfterSec: rate.retryAfterSec },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      )
    }

    const body = await req.json()
    const speedTestId: string = body?.speedTestId ?? ''
    const lang: string = body?.lang ?? ''

    if (!speedTestId) {
      return NextResponse.json({ error: 'speedTestId requis' }, { status: 400 })
    }
    if (!SUPPORTED_LANGS.includes(lang as Lang)) {
      return NextResponse.json(
        { error: `Langue non supportée. Utilise : ${SUPPORTED_LANGS.join(', ')}` },
        { status: 400 }
      )
    }

    const test = await db.speedTest.findUnique({ where: { id: speedTestId } })
    if (!test?.aiSummary) {
      return NextResponse.json({ error: 'Résumé IA introuvable — génère-le d\'abord' }, { status: 404 })
    }

    // Cache DB
    const translations = (test.aiSummaryTranslations as Record<string, string> | null) ?? {}
    if (translations[lang]) {
      return NextResponse.json({
        success: true,
        translation: translations[lang],
        lang,
        model: test.aiModel,
        cached: true,
      })
    }

    // Providers dispo
    if (configuredProviders().length === 0) {
      return NextResponse.json({ error: 'Aucune clé IA configurée' }, { status: 503 })
    }

    // Traduction
    const systemPrompt = [
      `Tu es un traducteur professionnel. Traduis le texte suivant en ${LANG_NAMES[lang as Lang]}.`,
      'RÈGLES :',
      '- Garde le format markdown exact (titres, **gras**, listes, blocs de code).',
      '- Garde les emojis tels quels.',
      '- Ne traduis PAS les termes techniques : LCP, INP, CLS, FCP, TBT, TTFB, Speed Index, Core Web Vitals, JavaScript, CSS, HTML, CDN, API.',
      "- Ne traduis PAS les URLs ou noms de domaine.",
      '- Conserve le ton (1ère personne pluriel, tutoiement adapté à la langue).',
      '- Ne commente PAS, ne réponds QUE par la traduction.',
      '- Max 250 mots (la source est ≤ 250 mots).',
    ].join('\n')

    const { text, model, provider } = await tryProviders({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: test.aiSummary },
      ],
      maxTokens: 700,
      temperature: 0.2,
    })

    // Persistance cache
    const updated = { ...translations, [lang]: text }
    await db.speedTest
      .update({
        where: { id: speedTestId },
        data: { aiSummaryTranslations: updated },
      })
      .catch((e) => console.warn('[translate] persistance échouée:', e?.message))

    return NextResponse.json({
      success: true,
      translation: text,
      lang,
      model: `${provider}/${model}`,
      cached: false,
    })
  } catch (e: any) {
    console.error('[ai-translate]', e)
    return NextResponse.json(
      { error: 'Erreur lors de la traduction. Réessaie dans un instant.' },
      { status: 502 }
    )
  }
}
