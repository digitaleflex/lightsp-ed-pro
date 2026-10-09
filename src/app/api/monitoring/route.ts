import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateMonitoringHistory } from '@/lib/performance'

// Données de monitoring pour les graphiques
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
      }))

      return NextResponse.json({
        success: true,
        website,
        history: data,
      })
    }

    // Sinon : données de monitoring globales de démo
    const websites = await db.website.findMany({
      include: { tests: { orderBy: { createdAt: 'desc' }, take: 1 } },
      take: 6,
    })

    const series = websites.map((w) => {
      const latest = w.tests[0]
      const base = latest?.performance ?? 70
      return {
      name: w.name,
      history: generateMonitoringHistory(base, 30),
      }
    })

    return NextResponse.json({ success: true, series })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
