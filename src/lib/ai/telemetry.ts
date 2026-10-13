// M0-5 — Observabilité des appels IA : télémétrie + compteurs de quota.
//
// Deux niveaux :
//   1. `recordAICall` — un appel par provider (persistance DB, fallback in-memory)
//   2. `getAIDailyUsage` — agrégat quotidien par provider (pour M7-1 dashboard admin)
//
// Volontairement tolérant à la migration : si les tables `AICall` / `AIDailyUsage`
// n'existent pas encore, bascule sur des compteurs in-memory (perdus au reboot,
// mais suffisants pour le dev local).
//
// Voir aussi :
//   - src/lib/ai/index.ts (registre providers, appelle recordAICall)
//   - src/lib/ai/quotas.ts (constantes des quotas connus)
//   - src/app/api/admin/ai-stats/route.ts (exposition admin)

import { db } from '@/lib/db'

export interface AICallRecord {
  provider: string
  model: string
  capability: string // chat | vision | embed | asr | tts | image
  ok: boolean
  latencyMs: number
  errorCode?: string
  userId?: string
}

/** Cache in-memory (fallback si DB indisponible) */
const memoryCalls: AICallRecord[] = []
const MEMORY_MAX_CALLS = 10_000

const memoryDaily = new Map<string, number>() // `${provider}:${dayISO}` -> count

/** Normalise une date à minuit UTC (pour l'agrégation quotidienne). */
function toUTCMidnight(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/**
 * Enregistre un appel IA. Idempotent, non bloquant (fire-and-forget).
 *
 * Ne JAMAIS lever : la télémétrie ne doit pas casser le flux applicatif.
 * Logge en console les erreurs de persistance pour debug.
 */
export function recordAICall(record: AICallRecord): void {
  // 1. Persistance DB (best-effort, non bloquant)
  db.aICall
    .create({
      data: {
        provider: record.provider,
        model: record.model,
        capability: record.capability,
        success: record.ok,
        latencyMs: record.latencyMs,
        errorCode: record.errorCode?.slice(0, 200),
        userId: record.userId,
      },
    })
    .then(() => {
      // Incrémenter le compteur quotidien
      return db.aIDailyUsage.upsert({
        where: {
          provider_day: { provider: record.provider, day: toUTCMidnight() },
        },
        create: { provider: record.provider, day: toUTCMidnight(), count: 1 },
        update: { count: { increment: 1 } },
      })
    })
    .catch((e) => {
      // Table non migrée ou DB hors-ligne : fallback in-memory
      console.warn('[telemetry] DB indisponible, fallback in-memory:', (e as Error)?.message?.slice(0, 100))
      pushToMemory(record)
    })
}

/** Pousse dans le cache in-memory (fallback). */
function pushToMemory(record: AICallRecord): void {
  memoryCalls.push(record)
  if (memoryCalls.length > MEMORY_MAX_CALLS) memoryCalls.shift() // FIFO

  const dayKey = `${record.provider}:${toUTCMidnight().toISOString()}`
  memoryDaily.set(dayKey, (memoryDaily.get(dayKey) ?? 0) + 1)
}

/**
 * Agrège les appels IA sur N derniers jours. Utilisé par `/api/admin/ai-stats`.
 *
 * Retourne un tableau de `{ provider, capability, total, successRate, latencyP50, latencyP95, errors }`.
 */
export async function getAIStats(days: number = 7): Promise<{
  provider: string
  capability: string
  total: number
  success: number
  successRate: number
  latencyP50: number
  latencyP95: number
  errors: { code: string; count: number }[]
}[]> {
  const since = new Date(Date.now() - days * 86400_000)

  try {
    const calls = await db.aICall.findMany({
      where: { createdAt: { gte: since } },
      select: {
        provider: true,
        capability: true,
        success: true,
        latencyMs: true,
        errorCode: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return aggregate(calls)
  } catch (e) {
    console.warn('[telemetry] getAIStats DB indisponible, fallback in-memory:', (e as Error)?.message?.slice(0, 100))
    const memFiltered = memoryCalls.filter((c) => c.latencyMs !== undefined).slice(-10_000)
    return aggregate(memFiltered.map((c) => ({
      provider: c.provider,
      capability: c.capability,
      success: c.ok,
      latencyMs: c.latencyMs,
      errorCode: c.errorCode,
    })))
  }
}

/** Agrège un tableau de calls en stats par (provider, capability). */
function aggregate(calls: {
  provider: string
  capability: string
  success: boolean
  latencyMs: number
  errorCode?: string | null
}[]): {
  provider: string
  capability: string
  total: number
  success: number
  successRate: number
  latencyP50: number
  latencyP95: number
  errors: { code: string; count: number }[]
}[] {
  const byKey = new Map<
    string,
    {
      provider: string
      capability: string
      calls: { success: boolean; latencyMs: number; errorCode?: string | null }[]
    }
  >()

  for (const c of calls) {
    const key = `${c.provider}:${c.capability}`
    if (!byKey.has(key)) {
      byKey.set(key, { provider: c.provider, capability: c.capability, calls: [] })
    }
    byKey.get(key)!.calls.push(c)
  }

  const out: ReturnType<typeof aggregate> = []
  for (const g of byKey.values()) {
    const lats = g.calls.map((c) => c.latencyMs).sort((a, b) => a - b)
    const successCount = g.calls.filter((c) => c.success).length
    const errorCounts = new Map<string, number>()
    for (const c of g.calls) {
      if (!c.success && c.errorCode) {
        errorCounts.set(c.errorCode, (errorCounts.get(c.errorCode) ?? 0) + 1)
      }
    }
    out.push({
      provider: g.provider,
      capability: g.capability,
      total: g.calls.length,
      success: successCount,
      successRate: g.calls.length > 0 ? successCount / g.calls.length : 0,
      latencyP50: percentile(lats, 50),
      latencyP95: percentile(lats, 95),
      errors: [...errorCounts.entries()].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    })
  }
  return out.sort((a, b) => b.total - a.total)
}

/** Percentile simple sur un tableau trié. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[idx]
}

/**
 * Usage quotidien par provider (pour dashboard M7-1).
 * Retourne un tableau `{ provider, day (ISO), count }`.
 */
export async function getAIDailyUsage(days: number = 30): Promise<{ provider: string; day: string; count: number }[]> {
  const since = toUTCMidnight(new Date(Date.now() - days * 86400_000))

  try {
    const rows = await db.aIDailyUsage.findMany({
      where: { day: { gte: since } },
      orderBy: { day: 'asc' },
    })
    return rows.map((r) => ({
      provider: r.provider,
      day: r.day.toISOString().slice(0, 10),
      count: r.count,
    }))
  } catch (e) {
    console.warn('[telemetry] getAIDailyUsage DB indisponible, fallback in-memory:', (e as Error)?.message?.slice(0, 100))
    const out: { provider: string; day: string; count: number }[] = []
    for (const [key, count] of memoryDaily) {
      const [provider, dayISO] = key.split(':')
      out.push({ provider, day: dayISO.slice(0, 10), count })
    }
    return out.sort((a, b) => a.day.localeCompare(b.day))
  }
}
