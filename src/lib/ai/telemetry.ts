// Télémétrie des appels IA — squelette (M0-5).
// Volontairement inerte pour l'instant : l'API est stable pour brancher M0-5
// (persistance en DB : provider, modèle, latence, quotas) sans refactor.

export interface AICallRecord {
  provider: string
  model: string
  ok: boolean
  latencyMs: number
  error?: string
}

/**
 * Enregistre un appel IA.
 * M0-5 : brancher ici l'écriture en base (table ai_usage) + métriques/alerting.
 * No-op en M0.
 */
export function recordAICall(_record: AICallRecord): void {
  // no-op — voir M0-5
}
