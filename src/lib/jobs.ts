// Suivi du travail de mesure en arrière-plan (seed / mesure groupée).
// État stocké sur globalThis pour survivre au rechargement à chaud de Next.js.

import { db, createSpeedTest } from './db'
import { measureUrl, type MeasureSource } from './measure'

export interface MeasureJobState {
  running: boolean
  total: number
  done: number
  current: string | null
  sources: Record<MeasureSource, number>
  errors: string[]
  startedAt: number | null
}

const EMPTY: MeasureJobState = {
  running: false,
  total: 0,
  done: 0,
  current: null,
  sources: { lighthouse: 0, pagespeed: 0, simulated: 0 },
  errors: [],
  startedAt: null,
}

function store(): { job: MeasureJobState } {
  const g = globalThis as unknown as { __lightspeedMeasureJob?: { job: MeasureJobState } }
  if (!g.__lightspeedMeasureJob) g.__lightspeedMeasureJob = { job: structuredClone(EMPTY) }
  return g.__lightspeedMeasureJob
}

export function getMeasureJob(): MeasureJobState {
  return store().job
}

/** Mesure réelle de chaque site, séquentiellement, sans bloquer la requête HTTP. */
export function startMeasureJob(sites: { id: string; url: string }[]): MeasureJobState {
  const s = store()
  if (s.job.running) return s.job

  s.job = {
    running: true,
    total: sites.length,
    done: 0,
    current: sites[0]?.url ?? null,
    sources: { lighthouse: 0, pagespeed: 0, simulated: 0 },
    errors: [],
    startedAt: Date.now(),
  }

  void (async () => {
    for (const site of sites) {
      if (!s.job.running) break
      s.job.current = site.url
      try {
        // Garde-fou : ne jamais remesurer un site déjà mesuré (évite les doublons
        // si deux jobs se lancent, ex. workers multiples du serveur de dev)
        const existing = await db.speedTest.count({ where: { websiteId: site.id } })
        if (existing > 0) {
          continue
        }
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
        s.job.sources[m.source] = (s.job.sources[m.source] ?? 0) + 1
      } catch (e) {
        s.job.errors.push(`${site.url} : ${(e as Error).message}`)
      } finally {
        s.job.done += 1
      }
    }
    s.job.running = false
    s.job.current = null
    console.log(`[measure-job] terminé — ${s.job.done}/${s.job.total} sites`, s.job.sources)
  })()

  return s.job
}
