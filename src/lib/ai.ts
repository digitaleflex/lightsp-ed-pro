// Façade de compatibilité — voir src/lib/ai/ pour l'implémentation.
// Les imports existants (`@/lib/ai`) restent valides : mêmes symboles, mêmes signatures.
export type { AiReportInput, AiResult } from './ai/types'
export { generateAiSummary, configuredProviders } from './ai/index'
