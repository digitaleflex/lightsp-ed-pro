import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Benchmark sectoriel CALCULÉ à partir des mesures réelles de la base.
// Aucun chiffre codé en dur : moyennes par catégorie (dernier test de chaque site)
// et insight comparatif déduit des données mesurées.
export async function GET() {
  try {
    const websites = await db.website.findMany({
      include: {
        tests: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    const rows = websites
      .map((w) => {
        const t = w.tests[0]
        if (!t) return null
        return {
          category: w.category,
          performance: t.performance,
          lcp: t.lcp,
          totalWeightKb: t.totalWeight,
          source: t.source,
        }
      })
      .filter(Boolean) as {
      category: string
      performance: number
      lcp: number
      totalWeightKb: number
      source: string
    }[]

    // Moyennes par catégorie
    const byCat = new Map<
      string,
      { scores: number[]; lcps: number[]; weights: number[]; best: { name: string; score: number } | null }
    >()
    for (const r of rows) {
      const acc = byCat.get(r.category) ?? { scores: [], lcps: [], weights: [], best: null }
      acc.scores.push(r.performance)
      acc.lcps.push(r.lcp)
      acc.weights.push(r.totalWeightKb)
      byCat.set(r.category, acc)
    }
    // Meilleur site de chaque catégorie (score de performance mesuré)
    for (const w of websites) {
      const t = w.tests[0]
      if (!t) continue
      const acc = byCat.get(w.category)
      if (acc && (!acc.best || t.performance > acc.best.score)) {
        acc.best = { name: w.name, score: t.performance }
      }
    }

    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)

    const industries = [...byCat.entries()]
      .map(([category, acc]) => ({
        category,
        avgScore: Math.round(avg(acc.scores)),
        avgLcp: +avg(acc.lcps).toFixed(2),
        avgWeight: +(avg(acc.weights) / 1024).toFixed(1), // Ko → Mo
        siteCount: acc.scores.length,
        bestName: acc.best?.name ?? null,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)

    // Insight : catégorie la plus rapide vs la plus lente (LCP mesuré)
    let insight: { bestCategory: string; worstCategory: string; deltaPct: number } | null = null
    const withData = industries.filter((i) => i.siteCount > 0 && i.avgLcp > 0)
    if (withData.length >= 2) {
      const byLcp = [...withData].sort((a, b) => a.avgLcp - b.avgLcp)
      const best = byLcp[0]
      const worst = byLcp[byLcp.length - 1]
      const deltaPct = Math.round(((worst.avgLcp - best.avgLcp) / worst.avgLcp) * 100)
      if (deltaPct > 0) {
        insight = { bestCategory: best.category, worstCategory: worst.category, deltaPct }
      }
    }

    const sources = rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.source] = (acc[r.source] ?? 0) + 1
      return acc
    }, {})

    // Moyenne globale (toutes catégories confondues) — utilisée par la comparaison « vs moyenne »
    const overall =
      rows.length > 0
        ? {
            avgScore: Math.round(avg(rows.map((r) => r.performance))),
            avgLcp: +avg(rows.map((r) => r.lcp)).toFixed(2),
            avgWeightKb: Math.round(avg(rows.map((r) => r.totalWeightKb))),
            siteCount: rows.length,
          }
        : null

    return NextResponse.json({
      success: true,
      real: true,
      sampleSize: rows.length,
      sources,
      overall,
      industries,
      insight,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
