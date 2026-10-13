// NOTE : aucun test runner n'est configuré dans ce projet (ni vitest, ni jest, pas de
// script `test` dans package.json). Comme pour zai.test.ts, on n'installe rien :
// ce fichier documente les cas à couvrir et reste compilable (`tsc`), prêt à être branché
// dès qu'un runner sera ajouté (exposer `runFeatureFlagChecks()` dans le runner).
//
// Squelette — ne pas supprimer.
import { enabledFlags, envKeyFor, flags, isFlagEnv, isEnabled, listFlags } from '../feature-flags'
import type { FlagKey } from '../feature-flags'

interface Check {
  name: string
  fn: () => boolean | Promise<boolean>
}

function assert(name: string, cond: boolean): void {
  if (!cond) throw new Error(`[feature-flags.test] échec : ${name}`)
}

/** Exécute `fn` avec une valeur d'env temporaire, puis restore l'état précédent. */
async function withEnv(key: string, value: string | undefined, fn: () => Promise<void> | void): Promise<void> {
  const prev = process.env[key]
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
  try {
    await fn()
  } finally {
    if (prev === undefined) delete process.env[key]
    else process.env[key] = prev
  }
}

export const featureFlagChecks: Check[] = [
  {
    name: 'isEnabled() retourne la valeur par défaut sans override env',
    fn: () => {
      // aiSummary est true par défaut
      return isEnabled('aiSummary') === flags.aiSummary
    },
  },
  {
    name: 'FF_AI_SUMMARY=0 désactive aiSummary (env override)',
    fn: async () => {
      let ok = false
      await withEnv('FF_AI_SUMMARY', '0', () => {
        ok = isEnabled('aiSummary') === false
      })
      return ok
    },
  },
  {
    name: 'FF_AI_SUMMARY=false désactive aussi aiSummary',
    fn: async () => {
      let ok = false
      await withEnv('FF_AI_SUMMARY', 'false', () => {
        ok = isEnabled('aiSummary') === false
      })
      return ok
    },
  },
  {
    name: 'FF_AI_VIDEO_GEN=1 force activé (défaut false)',
    fn: async () => {
      let ok = false
      await withEnv('FF_AI_VIDEO_GEN', '1', () => {
        ok = isEnabled('aiVideoGen') === true
      })
      return ok
    },
  },
  {
    name: 'isFlagEnv() détecte un override actif',
    fn: async () => {
      let ok = false
      await withEnv('FF_AI_PODCAST', 'off', () => {
        ok = isFlagEnv('aiPodcast') === true && isEnabled('aiPodcast') === false
      })
      return ok
    },
  },
  {
    name: 'listFlags() contient tous les flags documentés',
    fn: () => {
      const listed = listFlags()
      const keys = Object.keys(flags) as FlagKey[]
      return keys.every((k) => k in listed) && listed.aiSummary.default === true
    },
  },
  {
    name: 'enabledFlags() ne contient que des valeurs activées',
    fn: () => {
      const enabled = enabledFlags()
      return enabled.every((k) => isEnabled(k))
    },
  },
  {
    name: 'envKeyFor() suit la convention FF_{KEY_UPPER}',
    fn: () => {
      return envKeyFor('aiSummary') === 'FF_AI_SUMMARY' && envKeyFor('aiVideoGen') === 'FF_AI_VIDEO_GEN'
    },
  },
  {
    name: "TS: isEnabled('unknownFlag') est refusé à la compilation (commentable)",
    fn: () => {
      // @ts-expect-error — volontaire : flag inconnu, doit être un type error
      const bad = (): boolean => isEnabled('unknownFlag')
      return typeof bad === 'function'
    },
  },
]

/** Exécute les vérifications hors runner (appelable manuellement / une fois un runner branché). */
export async function runFeatureFlagChecks(): Promise<void> {
  for (const c of featureFlagChecks) {
    assert(c.name, await c.fn())
  }
  console.log(`[feature-flags.test] ${featureFlagChecks.length}/${featureFlagChecks.length} checks OK`)
}
