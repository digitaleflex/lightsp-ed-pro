import { NextRequest, NextResponse } from 'next/server'
import { db, createSpeedTest } from '@/lib/db'
import { measureUrl } from '@/lib/measure'
import { upsertIndexedSite } from '@/lib/sites'

// Mesure RÉELLE à la demande d'un site déjà suivi (bouton « Mesurer maintenant »).
// Ajoute un nouveau test à l'historique du site, sans rien effacer.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const device: 'desktop' | 'mobile' = body?.device === 'mobile' ? 'mobile' : 'desktop'

    let website: { id: string; url: string } | null = null
    if (body?.websiteId) {
      website = await db.website.findUnique({ where: { id: body.websiteId } })
    } else if (body?.url) {
      // INDEXATION AUTOMATIQUE : mesurer un nouveau site l'indexe dans la foulée
      website = await upsertIndexedSite(db, body.url)
    }

    if (!website) {
      return NextResponse.json({ error: 'Site introuvable (websiteId ou url requis)' }, { status: 404 })
    }

    const measurement = await measureUrl(website.url, device)
    const { source, measuredAt, note, ...result } = measurement

    await createSpeedTest({
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
        region: 'europe',
        source,
    })

    return NextResponse.json({ success: true, website, result: { ...result, source, measuredAt, note } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur lors de la mesure' }, { status: 500 })
  }
}
