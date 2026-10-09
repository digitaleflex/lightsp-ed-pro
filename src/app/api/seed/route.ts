import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SEED_WEBSITES, analyzeUrl } from '@/lib/performance'

// Seed : remplit la base avec des sites de démo et des tests historiques
export async function POST() {
  try {
    await db.speedTest.deleteMany()
    await db.website.deleteMany()

    const now = new Date()

    for (const w of SEED_WEBSITES) {
      const website = await db.website.create({
        data: { url: w.url, name: w.name, category: w.category },
      })

      // Historique de tests (15 points sur 45 jours)
      for (let i = 14; i >= 0; i--) {
        const res = analyzeUrl(w.url, 'desktop')
        const variation = (Math.sin(i) + Math.random() - 0.5) * 8
        const date = new Date(now)
        date.setDate(date.getDate() - i * 3)
        await db.speedTest.create({
          data: {
            websiteId: website.id,
            performance: Math.max(10, Math.min(100, Math.round(res.performance + variation))),
            accessibility: res.accessibility,
            bestPractices: res.bestPractices,
            seo: res.seo,
            lcp: res.lcp,
            fid: res.fid,
            cls: res.cls,
            fcp: res.fcp,
            ttfb: res.ttfb,
            tbt: res.tbt,
            si: res.si,
            totalWeight: res.totalWeight,
            device: 'desktop',
            region: 'europe',
            createdAt: date,
          },
        })
      }
    }

    const count = await db.website.count()
    const tests = await db.speedTest.count()
    return NextResponse.json({ success: true, websites: count, tests })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur de seed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const count = await db.website.count()
    if (count === 0) {
      return POST()
    }
    const tests = await db.speedTest.count()
    return NextResponse.json({ success: true, websites: count, tests })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
