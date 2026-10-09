import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Récupère les 6 tests les plus récents (tous sites confondus)
export async function GET() {
  try {
    const tests = await db.speedTest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { website: true },
    })

    const recent = tests.map((t) => ({
      id: t.id,
      url: t.website.url,
      name: t.website.name,
      performance: t.performance,
      lcp: t.lcp,
      cls: t.cls,
      device: t.device,
      region: t.region,
      createdAt: t.createdAt,
    }))

    return NextResponse.json({ success: true, recent })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
