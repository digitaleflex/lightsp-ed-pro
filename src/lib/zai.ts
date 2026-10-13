// Wrapper d'initialisation lazy du SDK Z.ai (z-ai-web-dev-sdk).
//
// lazy init: le SDK ne se connecte pas tant qu'on n'appelle pas une méthode
// (le constructeur ne fait qu'enregistrer la config ; le réseau n'a lieu qu'au chat).
// On crée donc le client à la première demande, jamais au chargement du module.
//
// Priorité de configuration :
//   1. process.env.ZAI_API_KEY (+ ZAI_BASE_URL optionnel) — priorité (prod)
//   2. fichier .z-ai-config local / home (fallback dev)
//
// Ref : https://www.npmjs.com/package/z-ai-web-dev-sdk
import fs from 'fs'
import os from 'os'
import path from 'path'
import ZAI, { type ZAIConfig } from 'z-ai-web-dev-sdk'

/** Type de l'instance du client Z.ai. */
export type ZaiClient = ZAI

/** Modèle affiché par défaut (surchargeable via ZAI_MODEL). */
export const ZAI_MODEL = process.env.ZAI_MODEL ?? 'glm-4.5'

const DEFAULT_BASE_URL = process.env.ZAI_BASE_URL ?? 'https://api.z.ai'
const CONFIG_FILENAME = '.z-ai-config'

/** Retire les lignes de commentaire (# ou //) pour tolérer un fichier d'exemple copié tel quel. */
function stripComments(raw: string): string {
  return raw
    .split('\n')
    .filter((line) => {
      const t = line.trim()
      return !t.startsWith('//') && !t.startsWith('#')
    })
    .join('\n')
}

/** Lit .z-ai-config (cwd puis home) — retourne null si absent ou invalide. */
function readLocalConfig(): ZAIConfig | null {
  const candidates = [path.join(process.cwd(), CONFIG_FILENAME), path.join(os.homedir(), CONFIG_FILENAME)]
  for (const file of candidates) {
    try {
      const cfg = JSON.parse(stripComments(fs.readFileSync(file, 'utf-8'))) as ZAIConfig
      if (cfg?.baseUrl && cfg?.apiKey) return cfg
    } catch {
      // fichier absent ou JSON invalide → on tente le candidat suivant
    }
  }
  return null
}

/** Résout la config : variable d'env prioritaire, sinon fichier .z-ai-config. */
function resolveConfig(): ZAIConfig | null {
  const envKey = process.env.ZAI_API_KEY?.trim()
  if (envKey) return { baseUrl: DEFAULT_BASE_URL, apiKey: envKey }
  return readLocalConfig()
}

/**
 * true si une configuration Z.ai est disponible (clé d'env OU fichier local).
 * Aucune connexion réseau, aucune création de client : simple lecture de config.
 */
export function isZaiEnabled(): boolean {
  return resolveConfig() !== null
}

// Le constructeur du SDK est déclaré `private` uniquement pour forcer ZAI.create().
// Or create() ne lit QUE le fichier .z-ai-config : on instancie directement pour pouvoir
// injecter une config issue de l'env. Le constructeur ne fait aucun appel réseau.
const ZAIClass = ZAI as unknown as { new (config: ZAIConfig): ZaiClient }

function instantiate(config: ZAIConfig): ZaiClient | null {
  try {
    return new ZAIClass(config)
  } catch (e) {
    console.warn('[zai] instanciation impossible :', (e as Error)?.message)
    return null
  }
}

// Client mis en cache une fois créé. Tant qu'aucune clé n'est configurée, on renvoie null
// sans mettre en cache (l'env peut apparaître plus tard, ex. tests).
let client: ZaiClient | null = null

/**
 * Retourne le client Z.ai (créé une seule fois, à la première demande).
 * Retourne `null` si aucune clé n'est configurée. Ne lève jamais.
 */
export async function getZai(): Promise<ZaiClient | null> {
  if (client) return client
  const config = resolveConfig()
  if (!config) return null
  client = instantiate(config)
  return client
}
