// M0-4 — Rate-limit par utilisateur, sans Redis.
//
// Stratégie : sliding window en DB (table `RateLimit`) avec fallback in-memory
// si la table n'existe pas encore (tolérant à la migration, cf. `createSpeedTest`
// dans src/lib/db.ts).
//
// Clé : `user:<id>` si authentifié, sinon `ip:<ip>` (x-forwarded-for ou socket).
//
// Usage dans une route :
//   const rate = await checkRate(req, 'aiSummary', 10, 3600_000) // 10/heure
//   if (!rate.ok) {
//     return NextResponse.json(
//       { error: 'Trop de requêtes' },
//       { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
//     )
//   }
//
// Ou via wrapper :
//   export const POST = withRateLimit('aiSummary', 10, 3600_000, handler)
//
// Voir aussi :
//   - src/lib/ai/telemetry.ts (observabilité des appels IA, M0-5)
//   - src/app/api/ai-summary/route.ts (exemple d'intégration)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export interface RateCheck {
  ok: boolean
  remaining: number
  retryAfterSec: number
  key: string
}

/** Cache in-memory (fallback si DB indisponible) — Map<key, timestamps[]> */
const memoryStore = new Map<string, number[]>()
const MEMORY_MAX_ENTRIES = 10_000
const MEMORY_PRUNE_INTERVAL_MS = 60_000
let lastPrune = 0

/** Nettoyage périodique du cache in-memory. */
function pruneMemoryStore(): void {
  const now = Date.now()
  if (now - lastPrune < MEMORY_PRUNE_INTERVAL_MS) return
  lastPrune = now
  for (const [key, timestamps] of memoryStore) {
    const valid = timestamps.filter((t) => now - t < 3600_000) // 1h max
    if (valid.length === 0) memoryStore.delete(key)
    else memoryStore.set(key, valid)
  }
  // Protection mémoire
  if (memoryStore.size > MEMORY_MAX_ENTRIES) {
    console.warn(`[rate-limit] memoryStore trop grand (${memoryStore.size}), prune forcé`)
    for (const [key, timestamps] of memoryStore) {
      if (timestamps.filter((t) => now - t < 3600_000).length === 0) memoryStore.delete(key)
    }
  }
}

/** Extrait l'IP du client (x-forwarded-for, sinon x-real-ip, sinon inconnu). */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Construit la clé de rate-limit : user authentifié ou IP anonyme. */
export async function getRateLimitKey(req: NextRequest): Promise<string> {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id
    if (userId) return `user:${userId}`
  } catch {
    // session indispensible — on retombe sur IP
  }
  return `ip:${getClientIp(req)}`
}

/**
 * Vérifie et incrémente le compteur pour l'action donnée.
 * Retourne `{ ok: false, retryAfterSec }` si la limite est atteinte.
 *
 * @param req      Requête Next.js (pour extraire user/IP)
 * @param action   Nom de l'action (ex: 'aiSummary')
 * @param max      Nombre max d'appels par fenêtre
 * @param windowMs Durée de la fenêtre en ms (ex: 3600_000 = 1h)
 */
export async function checkRate(
  req: NextRequest,
  action: string,
  max: number,
  windowMs: number
): Promise<RateCheck> {
  const key = await getRateLimitKey(req)
  const now = Date.now()
  const windowStart = new Date(now - windowMs)

  // 1. Tentative en DB
  try {
    const record = await db.rateLimit.findUnique({
      where: { userId_action: { userId: key, action } },
    })

    if (!record || now - new Date(record.windowStart).getTime() > windowMs) {
      // Première fenêtre ou fenêtre expirée : créer/réinitialiser
      await db.rateLimit.upsert({
        where: { userId_action: { userId: key, action } },
        create: { userId: key, action, windowStart: new Date(now), count: 1 },
        update: { windowStart: new Date(now), count: 1 },
      })
      return { ok: true, remaining: max - 1, retryAfterSec: 0, key }
    }

    if (record.count >= max) {
      const resetAt = new Date(record.windowStart).getTime() + windowMs
      return {
        ok: false,
        remaining: 0,
        retryAfterSec: Math.ceil((resetAt - now) / 1000),
        key,
      }
    }

    await db.rateLimit.update({
      where: { id: record.id },
      data: { count: { increment: 1 } },
    })
    return { ok: true, remaining: max - record.count - 1, retryAfterSec: 0, key }
  } catch (e) {
    // Table RateLimit pas encore migrée : fallback in-memory (best effort)
    console.warn('[rate-limit] DB indisponible, fallback in-memory:', (e as Error)?.message?.slice(0, 100))
    return checkRateInMemory(key, action, max, windowMs)
  }
}

/** Fallback in-memory (si DB indisponible ou table non migrée). */
function checkRateInMemory(key: string, action: string, max: number, windowMs: number): RateCheck {
  pruneMemoryStore()
  const mapKey = `${key}:${action}`
  const now = Date.now()
  const timestamps = (memoryStore.get(mapKey) ?? []).filter((t) => now - t < windowMs)

  if (timestamps.length >= max) {
    const oldest = timestamps[0]
    const resetAt = oldest + windowMs
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((resetAt - now) / 1000),
      key,
    }
  }

  timestamps.push(now)
  memoryStore.set(mapKey, timestamps)
  return { ok: true, remaining: max - timestamps.length, retryAfterSec: 0, key }
}

/**
 * Wrapper pour une route API : applique le rate-limit puis délègue au handler.
 * Retourne 429 + Retry-After si la limite est atteinte.
 */
export function withRateLimit(
  action: string,
  max: number,
  windowMs: number,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rate = await checkRate(req, action, max, windowMs)
    if (!rate.ok) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes — réessaie plus tard',
          retryAfterSec: rate.retryAfterSec,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSec),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }
    const res = await handler(req)
    // En-têtes informatifs sur les réponses réussies aussi
    res.headers.set('X-RateLimit-Limit', String(max))
    res.headers.set('X-RateLimit-Remaining', String(rate.remaining))
    return res
  }
}

/**
 * Politique de rate-limit par défaut pour les features IA.
 * Extensible : ajouter une entrée ici suffit pour activer la limite.
 */
export const RATE_POLICIES = {
  aiSummary: { max: 10, windowMs: 3600_000 },        // 10/heure
  aiSummaryStream: { max: 10, windowMs: 3600_000 },   // 10/heure
  aiSummaryTranslate: { max: 20, windowMs: 3600_000 }, // 20/heure
  aiVision: { max: 5, windowMs: 86400_000 },          // 5/jour
  aiAsr: { max: 20, windowMs: 86400_000 },            // 20/jour
  aiImageGen: { max: 20, windowMs: 86400_000 },       // 20/jour
  aiUrlAudit: { max: 10, windowMs: 86400_000 },       // 10/jour
  aiVideoBug: { max: 3, windowMs: 86400_000 },        // 3/jour
  aiPodcast: { max: 30, windowMs: 86400_000 },        // 30/jour
} as const

export type RateAction = keyof typeof RATE_POLICIES
