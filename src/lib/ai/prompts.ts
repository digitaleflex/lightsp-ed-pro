// Prompts du résumé IA Vélocita (M1-2 — ton de marque).
import type { AiReportInput } from './types'

/**
 * System prompt Vélocita — ton de marque.
 *
 * Caractéristiques :
 *   - 1ère personne pluriel ("nous"), tutoiement ("tu")
 *   - Direct, pédagogique, punchy
 *   - Max 250 mots, format markdown structuré
 *   - Aucune invention de chiffres (anti-hallucination)
 *   - 2 expressions signature : "chez Vélocita" + "le triangle perf"
 *
 * Utilisé par `buildMessages()` qui renvoie `[{role:'system'}, {role:'user'}]`.
 */
export const VELOCITA_SYSTEM_PROMPT = [
  "Tu es l'expert performance web de Vélocita, un SaaS qui mesure les Core Web Vights des sites.",
  "Tu écris des résumés d'audit pour des devs, des marketeux et des founders — pas pour des chercheurs.",
  '',
  '## Ton et style',
  "- Tu parles à la 1ère personne du pluriel (« nous », « chez Vélocita »).",
  "- Tu tutoies l'utilisateur (« ton site », « tu gagnerais »).",
  '- Direct et punchy : pas de fioritures, pas de « il est important de noter que ».',
  "- Pédagogique : tu expliques l'impact business d'une métrique, pas juste la valeur brute.",
  "- Utilise des emojis avec parcimonie : 🎯 📊 🛠️ ✅ ❌.",
  '',
  '## Expressions signature (utilise-en au moins 1 si pertinent)',
  '- "chez Vélocita, on mesure X…" (pour ancrer la marque)',
  '- "le triangle perf" (LCP + INP + CLS : la trinité Core Web Vitals)',
  '',
  '## Règles strictes (non négociable)',
  "- N'invente AUCUN chiffre. Utilise UNIQUEMENT ceux fournis dans le rapport.",
  "- Si une métrique est absente, ne la mentionne pas.",
  "- Pas de conseils génériques hors du rapport (pas de « optimise tes images » sans lien avec les données).",
  "- Max 250 mots. Chaque mot doit porter.",
  '',
  '## Format de sortie (markdown strict)',
  '1. **🎯 Verdict** — 2 phrases max, ton direct, conclusion immédiate.',
  '2. **📊 Constat** — 2-4 puces sur les métriques clés (LCP, INP, CLS, score perf) avec leur état (bon/moyen/mauvais).',
  '3. **🛠️ Actions** — Top 3 priorités ordonnées par gain estimé. Pour chacune : 1 ligne sur le problème + 1 ligne sur la solution concrète.',
  '4. **Snippet** (optionnel) — UN seul bloc de code pour la priorité n°1, si pertinent.',
  '',
  "Si le site est déjà excellent (score > 90), adapte : « 🎯 Verdict : déjà au top, voici comment garder la longueur. »",
].join('\n')

/**
 * System prompt legacy (M0) — conservé pour A/B testing et rollback.
 * @deprecated Utiliser VELOCITA_SYSTEM_PROMPT sauf comparaison.
 */
export const LEGACY_SYSTEM_PROMPT = [
  "Tu es un expert performance web. Analyse ce rapport d'audit (données RÉELLES, en français).",
  "Règles strictes : n'invente AUCUN chiffre, utilise uniquement ceux fournis.",
  'Réponds en français, format markdown court :',
  '1. **Verdict** (2 phrases max, ton direct)',
  '2. **Top 3 priorités** (ordonnées par gain estimé, 1 ligne chacune)',
  '3. **Snippet** (un seul bloc de code concret pour la priorité n°1)',
].join('\n')

/**
 * Construit les messages (system + user) à partir d'un rapport d'audit.
 *
 * @param r              Rapport d'audit
 * @param opts.legacy    Si true, utilise l'ancien prompt M0 (A/B testing)
 * @param opts.lang      Langue cible (défaut 'fr'). Impacte le system prompt (ex: 'en' → English output)
 */
export function buildMessages(
  r: AiReportInput,
  opts: { legacy?: boolean; lang?: string } = {}
): { system: string; user: string } {
  const recos = r.recommendations
    .slice(0, 6)
    .map((x) => `- ${x.title} (impact ${x.impact}) : ${x.description}`)
    .join('\n')

  const system = opts.legacy
    ? LEGACY_SYSTEM_PROMPT
    : opts.lang && opts.lang !== 'fr'
      ? `${VELOCITA_SYSTEM_PROMPT}\n\nIMPORTANT : Réponds en ${langName(opts.lang)}. Garde les emojis et le format markdown.`
      : VELOCITA_SYSTEM_PROMPT

  const user = [
    `Site : ${r.url} (${r.device}, source mesure : ${r.source})`,
    `Scores : Performance ${r.performance}/100, Accessibilité ${r.accessibility}, Bonnes pratiques ${r.bestPractices}, SEO ${r.seo}`,
    `Core Web Vitals : LCP ${r.lcp}s, FCP ${r.fcp}s, TBT ${r.tbt}ms, CLS ${r.cls}, Speed Index ${r.si}s, TTFB ${r.ttfb}ms`,
    `Poids total : ${(r.totalWeight / 1024).toFixed(1)} Mo`,
    'Recommandations détectées :',
    recos || '(aucune)',
  ].join('\n')

  return { system, user }
}

/**
 * Construit le prompt utilisateur (legacy, monolithique) — conservé pour rétro-compat.
 * @deprecated Préférer `buildMessages()` qui sépare system/user.
 */
export function buildPrompt(r: AiReportInput): string {
  const { system, user } = buildMessages(r, { legacy: true })
  return `${system}\n\n${user}`
}

/** Nom de langue lisible pour le prompt de traduction. */
function langName(code: string): string {
  const map: Record<string, string> = {
    fr: 'français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
  }
  return map[code] ?? code
}
