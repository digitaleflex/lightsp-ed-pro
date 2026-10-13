import { db } from '@/lib/db'
import { SEED_WEBSITES, analyzeUrl } from '@/lib/performance'

async function main() {
  await db.speedTest.deleteMany()
  await db.website.deleteMany()
  await db.user.deleteMany()
  await db.tenant.deleteMany()

  const tenant = await db.tenant.create({
    data: { id: 'default-tenant', name: 'Démo', slug: 'demo' },
  })
  const owner = await db.user.create({
    data: { email: 'demo@velocita.fr', name: 'Démo', tenantId: tenant.id },
  })
  await db.tenant.update({ where: { id: tenant.id }, data: { ownerId: owner.id } })

  const now = new Date()
  for (const w of SEED_WEBSITES) {
    const website = await db.website.create({
      data: { url: w.url, name: w.name, category: w.category, tenantId: tenant.id },
    })
    for (let i = 14; i >= 0; i--) {
      const res = analyzeUrl(w.url, 'desktop')
      const variation = (Math.sin(i) - 0.5) * 8
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
    console.log(`seeded ${w.url}`)
  }
  const [websites, tests] = await Promise.all([db.website.count(), db.speedTest.count()])
  console.log(`OK websites=${websites} tests=${tests}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
