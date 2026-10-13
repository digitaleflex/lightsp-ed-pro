// NOTE : aucun test runner n'est configuré dans ce projet (ni vitest, ni jest, pas de
// script `test` dans package.json). Conformément à la consigne M0-1, on n'installe rien :
// ce fichier documente les cas à couvrir et reste compilable (`tsc`), prêt à être branché
// dès qu'un runner sera ajouté (exposer `runZaiChecks()` dans le runner).
//
// Squelette — ne pas supprimer.
import { getZai, isZaiEnabled } from '../zai'

interface Check {
  name: string
  fn: () => boolean | Promise<boolean>
}

function assert(name: string, cond: boolean): void {
  if (!cond) throw new Error(`[zai.test] échec : ${name}`)
}

export const zaiChecks: Check[] = [
  {
    name: 'isZaiEnabled() est false sans ZAI_API_KEY ni .z-ai-config local',
    fn: () => {
      const prev = process.env.ZAI_API_KEY
      delete process.env.ZAI_API_KEY
      try {
        return isZaiEnabled() === false
      } finally {
        if (prev !== undefined) process.env.ZAI_API_KEY = prev
      }
    },
  },
  {
    name: 'getZai() renvoie null sans ZAI_API_KEY ni .z-ai-config local',
    fn: async () => {
      let result: boolean | null = null
      await withEnvAsync('ZAI_API_KEY', undefined, async () => {
        result = (await getZai()) === null
      })
      return result === true
    },
  },
  {
    name: 'le client Z.ai est créé (non null) quand ZAI_API_KEY est définie — mock léger, sans réseau',
    fn: async () => {
      let isClient = false
      await withEnvAsync('ZAI_API_KEY', 'test-key', async () => {
        isClient = (await getZai()) !== null
      })
      return isClient
    },
  },
]

async function withEnvAsync(key: string, value: string | undefined, fn: () => Promise<void>): Promise<void> {
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

/** Exécute les vérifications hors runner (appelable manuellement / une fois un runner branché). */
export async function runZaiChecks(): Promise<void> {
  for (const c of zaiChecks) {
    assert(c.name, await c.fn())
  }
}
