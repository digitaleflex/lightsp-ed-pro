import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db, createSpeedTest } from '@/lib/db'
import { measureUrl } from '@/lib/measure'
import { upsertIndexedSite } from '@/lib/sites'
import { ensureScheduler } from '@/lib/scheduler'

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

    // Mesure RÉELLE (Lighthouse local / PageSpeed Insights), repli simulé explicitement marqué
    const measurement = await measureUrl(url, device)
    const { source, measuredAt, note, ...result } = measurement

    const session = await getServerSession(authOptions)
    const tenantId = (session as { tenantId?: string })?.tenantId ?? 'default-tenant'

    // INDEXATION AUTOMATIQUE : tout site analysé est ajouté à la base (dédoublonné
    // sur l'URL canonique : www/casse/slash) puis re-mesuré périodiquement.
    ensureScheduler()
    const website = await upsertIndexedSite(db, url, { tenantId })

    const speedTest = await createSpeedTest({
        websiteId: website.id,
        performance: result.performance,
        accessibility: result.accessibility,
        bestPractices: result.bestPractices,
        seo: result.seo,
        lcp: result.lcp,
        inp: (result as { inp?: number }).inp ?? result.fid,
        fid: result.fid, // DEPRECATED : miroir de inp
        cls: result.cls,
        fcp: result.fcp,
        ttfb: result.ttfb,
        tbt: result.tbt,
        si: result.si,
        totalWeight: result.totalWeight,
        device,
        region,
        source,
    })

    return NextResponse.json({ success: true, url, website, speedTestId: speedTest.id, result: { ...result, source, measuredAt, note } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur lors de l\'analyse' }, { status: 500 })
  }
}
