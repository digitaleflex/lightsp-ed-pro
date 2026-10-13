import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Statistiques globales réelles (depuis la base)
export async function GET() {
  try {
    const [sites, tests, agg, subscribers] = await Promise.all([
      db.website.count(),
      db.speedTest.count(),
      db.speedTest.aggregate({ _avg: { performance: true } }),
      db.subscriber.count(),
    ])
    return NextResponse.json({
      success: true,
      sites,
      tests,
      avgScore: Math.round(agg._avg.performance ?? 0),
      subscribers,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
