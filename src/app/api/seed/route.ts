import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SEED_WEBSITES } from '@/lib/performance'
import { getMeasureJob, startMeasureJob } from '@/lib/jobs'

// Seed : crée les sites de démonstration puis lance les MESURES RÉELLES
// (Lighthouse local / PageSpeed Insights) en arrière-plan.
// Les tests arrivent progressivement dans la base — plus aucune donnée fabriquée.

export async function POST() {
  try {
    await db.speedTest.deleteMany()
    await db.website.deleteMany()
    await db.user.deleteMany()
    await db.tenant.deleteMany()

    // Tenant de démo par défaut (id stable utilisé par /api/analyze sans auth)
    const tenant = await db.tenant.create({
      data: { id: 'default-tenant', name: 'Démo', slug: 'demo' },
    })
    const owner = await db.user.create({
      data: { email: 'demo@velocita.fr', name: 'Démo', tenantId: tenant.id },
    })
    await db.tenant.update({ where: { id: tenant.id }, data: { ownerId: owner.id } })

    const sites: { id: string; url: string }[] = []
    for (const w of SEED_WEBSITES) {
      const website = await db.website.create({
        data: { url: w.url, name: w.name, category: w.category, tenantId: tenant.id },
      })
      sites.push({ id: website.id, url: w.url })
    }

    // Mesures réelles en arrière-plan (une par site, séquentiellement)
    const job = startMeasureJob(sites)

    return NextResponse.json({ success: true, websites: sites.length, tests: 0, job })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur de seed' }, { status: 500 })
  }
}

// Indexe les sites du catalogue natif absents de la base — sans JAMAIS réinitialiser
// les sites ou mesures existants (contrairement au POST qui repart de zéro).
async function syncSeedCatalog(): Promise<number> {
  const existing = await db.website.findMany({ select: { url: true } })
  const known = new Set(existing.map((w) => w.url))
  const missing = SEED_WEBSITES.filter((w) => !known.has(w.url))
  if (missing.length === 0) return 0

  const tenant = await db.tenant.findFirst({ orderBy: { createdAt: 'asc' } })
  const tenantId = tenant?.id ?? 'default-tenant'
  for (const w of missing) {
    await db.website.create({
      data: { url: w.url, name: w.name, category: w.category, tenantId },
    })
  }
  console.log(`[seed] catalogue natif synchronisé : ${missing.length} site(s) indexé(s)`)
  return missing.length
}

export async function GET() {
  try {
    const count = await db.website.count()
    if (count === 0) {
      return POST()
    }

    // Synchronisation du catalogue vitrine (ajoute les nouveaux sites natifs)
    const added = await syncSeedCatalog()

    const websites = await db.website.count()
    const tests = await db.speedTest.count()
    const job = getMeasureJob()

    // Reprise automatique : après un redémarrage du serveur, on mesure les sites
    // qui n'ont encore aucun test (le job ne repart jamais pour les sites déjà mesurés).
    if (!job.running) {
      const sites = await db.website.findMany({ include: { tests: { take: 1 } } })
      const missing = sites.filter((w) => w.tests.length === 0).map((w) => ({ id: w.id, url: w.url }))
      if (missing.length > 0) {
        return NextResponse.json({ success: true, websites, tests, added, job: startMeasureJob(missing) })
      }
    }

    return NextResponse.json({ success: true, websites, tests, added, job })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
