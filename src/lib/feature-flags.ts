// Feature flags par cas d'usage IA — Velocita.
//
// But : pouvoir activer/désactiver chaque feature IA individuellement sans redéployer.
// Utilisation principale : si un provider gratuit devient payant, on coupe en 1 ligne
// (env var) et on protège le budget.
//
// Priorité : variable d'env `FF_{KEY_UPPER}` > valeur par défaut dans `flags`.
// Exemples :
//   FF_AI_SUMMARY=0        → désactive le résumé IA
//   FF_AI_VIDEO_GEN=1      → active la vidéo générée (sinon off par défaut)
//   FF_AI_PODCAST=off      → désactive le TTS du résumé
//
// Voir aussi :
//   - src/lib/ai/index.ts (registre des providers IA)
//   - src/lib/ai/README.md (archi providers)
//
// Ajouter un flag : ajouter une clé dans `flags` + documenter son rôle. Aucune autre modif.

/** Tous les flags IA connus (et leur valeur par défaut). */
export const flags = {
  aiSummary: true, // résumé IA du SpeedTest (feature actuelle)
  aiSummaryStream: true, // streaming SSE du résumé (M1-1)
  aiSummaryTranslate: true, // résumé multilingue (M1-3)
  aiPodcast: true, // TTS du résumé (M2-2)
  aiVoiceAsr: true, // transcription audio (M2-3)
  aiVoiceDiagnostic: true, // diagnostic vocal bout-en-bout (M2-4)
  aiVisionAudit: true, // audit screenshot vision (M3-2)
  aiUrlAudit: true, // audit par URL page_reader (M3-3)
  aiVideoBug: true, // analyse vidéo bug (M3-4)
  aiGraphComment: true, // commentaire IA sur graphs (M3-5)
  aiBlogRag: true, // RAG sur le blog (M4)
  aiAssistant: true, // chat dashboard (M4-4)
  aiImageGen: true, // génération d'images (M5)
  aiAlerts: true, // alertes intelligentes (M6)
  aiVideoGen: false, // vidéo générée — payant, off par défaut
} as const

export type FlagKey = keyof typeof flags

/** Retire les comments/whitespace d'une valeur d'env pour tolérer des formats variés. */
function normalizeEnv(value: string): string {
  return value.trim().toLowerCase()
}

/** true si la valeur env force le flag activé. */
function isTruthy(value: string): boolean {
  return value === '1' || value === 'true' || value === 'on' || value === 'yes'
}

/** true si la valeur env force le flag désactivé. */
function isFalsy(value: string): boolean {
  return value === '0' || value === 'false' || value === 'off' || value === 'no'
}

/** Nom de la variable d'env pour un flag donné. */
export function envKeyFor(key: FlagKey): string {
  return `FF_${key.toUpperCase()}`
}

/** true si la variable d'env existe pour ce flag. */
export function isFlagEnv(key: FlagKey): boolean {
  return process.env[envKeyFor(key)] !== undefined
}

/** Valeur actuelle du flag, en tenant compte de l'override env. */
export function isEnabled(key: FlagKey): boolean {
  const envRaw = process.env[envKeyFor(key)]
  if (envRaw !== undefined) {
    const value = normalizeEnv(envRaw)
    if (isTruthy(value)) return true
    if (isFalsy(value)) return false
    // Valeur inconnue → on retombe sur le défaut (log warn pour debug)
    console.warn(`[feature-flags] valeur d'env inconnue pour ${envKeyFor(key)}="${envRaw}", défaut utilisé`)
  }
  return flags[key]
}

/** Liste complète des flags avec état courant (pour UI admin, debug, etc.). */
export function listFlags(): Record<FlagKey, { default: boolean; current: boolean; source: 'env' | 'default' }> {
  const out = {} as Record<FlagKey, { default: boolean; current: boolean; source: 'env' | 'default' }>
  for (const key of Object.keys(flags) as FlagKey[]) {
    out[key] = {
      default: flags[key],
      current: isEnabled(key),
      source: isFlagEnv(key) ? 'env' : 'default',
    }
  }
  return out
}

/** Helper pratique : liste des flags activés actuellement. */
export function enabledFlags(): FlagKey[] {
  return (Object.keys(flags) as FlagKey[]).filter((k) => isEnabled(k))
}
