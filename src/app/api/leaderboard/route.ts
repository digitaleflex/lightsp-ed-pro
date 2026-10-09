import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Classement des sites par score de performance (dernier test)
export async function GET() {
  try {
    const websites = await db.website.findMany({
      include: {
        tests: {
          orderBy: { createdAt: 'desc' },
          take: 7, // 7 derniers tests pour les sparklines
        },
      },
    })

    const ranked = websites
      .map((w) => {
        const latest = w.tests[0]
        if (!latest) return null
        // Mini-historique de scores pour le sparkline (du plus ancien au plus récent)
        const sparkline = w.tests
          .map((t) => t.performance)
          .reverse()
          .slice(-7)
        return {
          id: w.id,
          name: w.name,
          url: w.url,
          category: w.category,
          performance: latest.performance,
          accessibility: latest.accessibility,
          seo: latest.seo,
          bestPractices: latest.bestPractices,
          lcp: latest.lcp,
          cls: latest.cls,
          tbt: latest.tbt,
          totalWeight: latest.totalWeight,
          createdAt: latest.createdAt,
          sparkline,
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.performance - a.performance)
      .map((w: any, i) => ({ ...w, rank: i + 1 }))

    return NextResponse.json({ success: true, leaderboard: ranked })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
