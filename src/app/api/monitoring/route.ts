import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureScheduler, getMonitorStatus, runMonitoringRound } from '@/lib/scheduler'

// POST : lance immédiatement une ronde de surveillance (mesure de tous les
// sites indexés dont la dernière mesure dépasse l'intervalle).
// Non bloquant : la ronde tourne en arrière-plan, le statut se récupère via GET.
export async function POST() {
  try {
    ensureScheduler()
    void runMonitoringRound().catch((e) => console.error('[monitor] ronde échouée', e))
    return NextResponse.json({ success: true, started: true, monitor: getMonitorStatus() })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur de surveillance' }, { status: 500 })
  }
}

// Données de monitoring — UNIQUEMENT issues de mesures réelles stockées en base.
// Plus aucune génération d'historique fictif : si un site n'a qu'un seul test,
// la courbe ne contient qu'un point (elle se remplira au fil des mesures).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const websiteId = searchParams.get('websiteId')

    if (websiteId) {
      // Historique réel d'un site spécifique
      const tests = await db.speedTest.findMany({
        where: { websiteId },
        orderBy: { createdAt: 'asc' },
        take: 30,
      })

      const website = await db.website.findUnique({ where: { id: websiteId } })

      const data = tests.map((t) => ({
        date: t.createdAt.toISOString().slice(0, 10),
        score: t.performance,
        lcp: t.lcp,
        cls: t.cls,
        fcp: t.fcp,
        tbt: t.tbt,
        ttfb: t.ttfb,
        totalWeight: t.totalWeight,
        source: t.source,
      }))

      return NextResponse.json({
        success: true,
        website,
        history: data,
        monitor: getMonitorStatus(),
      })
    }

    // Sinon : historique réel des 6 premiers sites suivis
    const websites = await db.website.findMany({
      include: { tests: { orderBy: { createdAt: 'asc' }, take: 30 } },
      take: 6,
    })

    const series = websites
      .filter((w) => w.tests.length > 0)
      .map((w) => ({
        name: w.name,
        history: w.tests.map((t) => ({
          date: t.createdAt.toISOString().slice(0, 10),
          score: t.performance,
          lcp: t.lcp,
          cls: t.cls,
          ttfb: t.ttfb,
          totalWeight: t.totalWeight,
        })),
      }))

    return NextResponse.json({ success: true, series, monitor: getMonitorStatus() })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
