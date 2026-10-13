// Prompts du résumé IA Vélocita.
import type { AiReportInput } from './types'

/**
 * System prompt Vélocita — squelette.
 * M1-2 : à étoffer (ton de marque, garde-fous anti-hallucination, format markdown).
 * Volontairement NON branché sur generateAiSummary pour l'instant, afin de préserver
 * le comportement runtime actuel (port exact de l'ancien prompt utilisateur).
 */
export const VELOCITA_SYSTEM_PROMPT = [
  "Tu es un expert performance web qui rédige des résumés d'audit concis, en français.",
  "N'invente aucun chiffre : utilise uniquement les données fournies.",
].join('\n')

/** Construit le prompt utilisateur à partir d'un rapport d'audit. */
export function buildPrompt(r: AiReportInput): string {
  const recos = r.recommendations
    .slice(0, 6)
    .map((x) => `- ${x.title} (impact ${x.impact}) : ${x.description}`)
    .join('\n')
  return [
    "Tu es un expert performance web. Analyse ce rapport d'audit (données RÉELLES, en français).",
    "Règles strictes : n'invente AUCUN chiffre, utilise uniquement ceux fournis.",
    'Réponds en français, format markdown court :',
    '1. **Verdict** (2 phrases max, ton direct)',
    '2. **Top 3 priorités** (ordonnées par gain estimé, 1 ligne chacune)',
    '3. **Snippet** (un seul bloc de code concret pour la priorité n°1)',
    '',
    `Site : ${r.url} (${r.device}, source mesure : ${r.source})`,
    `Scores : Performance ${r.performance}/100, Accessibilité ${r.accessibility}, Bonnes pratiques ${r.bestPractices}, SEO ${r.seo}`,
    `Core Web Vitals : LCP ${r.lcp}s, FCP ${r.fcp}s, TBT ${r.tbt}ms, CLS ${r.cls}, Speed Index ${r.si}s, TTFB ${r.ttfb}ms`,
    `Poids total : ${(r.totalWeight / 1024).toFixed(1)} Mo`,
    'Recommandations détectées :',
    recos || '(aucune)',
  ].join('\n')
}
