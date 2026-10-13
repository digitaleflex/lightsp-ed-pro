// M0-5 — Quotas connus par provider (documentaires, pour alerting M7-1).
//
// Sources : pages officielles des providers (gratuites au moment de la rédaction).
// Ces valeurs sont VOLONTAIREMENT approximatives et peuvent changer sans préavis.
// Elles servent à :
//   1. Alimenter le dashboard admin (M7-1) — barre de progression vs quota
//   2. Déclencher une alerte si on approche de 80% (surveillance proactive)
//
// Pour mettre à jour : modifier ce fichier + relancer le seed ou éditer via
// le dashboard admin (quand M7-1 sera livré). Aucune dépendance DB ici.

export interface ProviderQuota {
  provider: string
  label: string
  // Quotas documentés (null = pas de limite connue ou non applicable)
  requestsPerMinute: number | null
  requestsPerDay: number | null
  tokensPerDay: number | null
  notes: string
  docsUrl: string
}

/**
 * Quota gratuit connu par provider, tel que documenté au moment de la rédaction.
 * ⚠️ Les offres gratuites changent souvent — vérifier les docs avant de se fier aveuglément.
 */
export const PROVIDER_QUOTAS: ProviderQuota[] = [
  {
    provider: 'groq',
    label: 'Groq',
    requestsPerMinute: 30,
    requestsPerDay: 14400, // 30/min * 24h * 60min (indicatif)
    tokensPerDay: null,
    notes: 'Modèles open-source (llama, mixtral, gpt-oss-20b). Free tier généreux.',
    docsUrl: 'https://console.groq.com/docs/rate-limits',
  },
  {
    provider: 'gemini',
    label: 'Google AI Studio',
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    tokensPerDay: 1_000_000,
    notes: 'Gemini 2.5 Flash gratuit. Vision + embeddings inclus.',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/rate-limits',
  },
  {
    provider: 'openrouter',
    label: 'OpenRouter',
    requestsPerMinute: 20,
    requestsPerDay: 1000,
    tokensPerDay: null,
    notes: 'Modèles `:free` (gemma, llama). Quotas par modèle, peuvent varier.',
    docsUrl: 'https://openrouter.ai/docs/api-reference/limits',
  },
  {
    provider: 'zai',
    label: 'Z.ai (ChatGLM)',
    requestsPerMinute: null,
    requestsPerDay: null,
    tokensPerDay: null,
    notes: 'SDK z-ai-web-dev-sdk. Free tier dépend de la région/plan — vérifier au cas par cas.',
    docsUrl: 'https://www.npmjs.com/package/z-ai-web-dev-sdk',
  },
]

/** Retourne le quota connu pour un provider (ou null si inconnu). */
export function getQuota(provider: string): ProviderQuota | null {
  return PROVIDER_QUOTAS.find((q) => q.provider === provider) ?? null
}

/**
 * Calcule le pourcentage d'usage d'un provider pour aujourd'hui.
 * Retourne `{ used, limit, pct }` ou `null` si pas de limite connue.
 */
export function computeUsagePct(usedToday: number, provider: string): { used: number; limit: number; pct: number } | null {
  const q = getQuota(provider)
  if (!q?.requestsPerDay) return null
  return {
    used: usedToday,
    limit: q.requestsPerDay,
    pct: Math.min(100, Math.round((usedToday / q.requestsPerDay) * 100)),
  }
}
