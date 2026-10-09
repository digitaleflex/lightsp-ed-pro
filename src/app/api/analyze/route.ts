import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { analyzeUrl } from '@/lib/performance'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let url: string = body?.url ?? ''
    const device: 'desktop' | 'mobile' = body?.device === 'mobile' ? 'mobile' : 'desktop'
    const region: string = body?.region ?? 'europe'

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
    }

    const result = analyzeUrl(url, device)

    let website = await db.website.findUnique({ where: { url } })
    if (!website) {
      const name = url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
      website = await db.website.create({ data: { url, name, category: 'Personnalisé' } })
    }

    await db.speedTest.create({
      data: {
        websiteId: website.id,
        performance: result.performance,
        accessibility: result.accessibility,
        bestPractices: result.bestPractices,
        seo: result.seo,
        lcp: result.lcp,
        fid: result.fid,
        cls: result.cls,
        fcp: result.fcp,
        ttfb: result.ttfb,
        tbt: result.tbt,
        si: result.si,
        totalWeight: result.totalWeight,
        device,
        region,
      },
    })

    return NextResponse.json({ success: true, url, website, result })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur lors de l\'analyse' }, { status: 500 })
  }
}
