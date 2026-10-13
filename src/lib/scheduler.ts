// Surveillance automatique : re-mesure périodique de TOUS les sites indexés.
// Un site analysé une fois par un utilisateur est indexé puis re-testé automatiquement,
// ce qui alimente l'historique (sparklines, tendances, monitoring).

import { db, createSpeedTest } from './db'
import { measureUrl } from './measure'
import { getMeasureJob } from './jobs'

const INTERVAL_MIN = Number(process.env.MONITOR_INTERVAL_MIN ?? 60)

function store(): { roundRunning: boolean; lastRound: { at: number; measured: number; skipped: number } | null } {
  const g = globalThis as unknown as {
    __lightspeedMonitor?: { roundRunning: boolean; lastRound: { at: number; measured: number; skipped: number } | null }
  }
  if (!g.__lightspeedMonitor) g.__lightspeedMonitor = { roundRunning: false, lastRound: null }
  return g.__lightspeedMonitor
}

export function getMonitorStatus() {
  const s = store()
  return {
    intervalMinutes: INTERVAL_MIN,
    enabled: INTERVAL_MIN > 0,
    roundRunning: s.roundRunning,
    lastRound: s.lastRound,
  }
}

/** Démarre le surveilleur périodique (idempotent, survit aux rechargements à chaud) */
export function ensureScheduler() {
  if (!(INTERVAL_MIN > 0)) return
  const g = globalThis as unknown as { __lightspeedScheduler?: ReturnType<typeof setInterval> }
  if (g.__lightspeedScheduler) return
  g.__lightspeedScheduler = setInterval(() => {
    void runMonitoringRound().catch((e) => console.error('[monitor] ronde échouée', e))
  }, INTERVAL_MIN * 60_000)
  if (typeof g.__lightspeedScheduler.unref === 'function') g.__lightspeedScheduler.unref()
  console.log(`[monitor] surveillance automatique démarrée (toutes les ${INTERVAL_MIN} min)`)
}

/**
 * Une ronde de surveillance : mesure tout site dont la dernière mesure
 * est plus ancienne que l'intervalle (ou qui n'en a jamais eu).
 */
export async function runMonitoringRound(): Promise<{ measured: number; skipped: number; errors: number }> {
  const s = store()
  if (s.roundRunning || getMeasureJob().running) {
    return { measured: 0, skipped: 0, errors: 0 }
  }
  s.roundRunning = true
  let measured = 0
  let skipped = 0
  let errors = 0

  try {
    const sites = await db.website.findMany({ orderBy: { createdAt: 'asc' } })
    const minAgeMs = INTERVAL_MIN * 60_000 * 0.9

    for (const site of sites) {
      const last = await db.speedTest.findFirst({
        where: { websiteId: site.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      if (last && Date.now() - last.createdAt.getTime() < minAgeMs) {
        skipped++
        continue
      }
      try {
        const m = await measureUrl(site.url, 'desktop')
        await createSpeedTest({
          websiteId: site.id,
          performance: m.performance,
          accessibility: m.accessibility,
          bestPractices: m.bestPractices,
          seo: m.seo,
          lcp: m.lcp,
          inp: (m as { inp?: number }).inp ?? m.fid,
          fid: m.fid, // DEPRECATED : miroir de inp
          cls: m.cls,
          fcp: m.fcp,
          ttfb: m.ttfb,
          tbt: m.tbt,
          si: m.si,
          totalWeight: m.totalWeight,
          device: 'desktop',
          region: 'europe',
          source: m.source,
        })
        measured++
      } catch (e) {
        errors++
        console.warn(`[monitor] échec pour ${site.url} :`, (e as Error).message)
      }
    }

    s.lastRound = { at: Date.now(), measured, skipped }
    if (measured > 0) {
      console.log(`[monitor] ronde terminée — ${measured} mesuré(s), ${skipped} ignoré(s), ${errors} erreur(s)`)
    }
  } finally {
    s.roundRunning = false
  }

  return { measured, skipped, errors }
}
