// Indexation automatique des sites analysés par les utilisateurs.
// Tout site passé par l'outil de test est créé (ou réutilisé) dans la table Website,
// puis automatiquement suivi par le surveilleur périodique (scheduler.ts).

import type { PrismaClient } from '@prisma/client'

/** URL canonique : https, host en minuscules sans www, sans slash final */
export function normalizeUrl(input: string): string {
  let raw = (input ?? '').trim()
  if (!raw) return raw
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
  try {
    const u = new URL(raw)
    u.protocol = 'https:'
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, '')
    let s = u.toString()
    if (s.endsWith('/') && u.pathname === '/' && !u.search && !u.hash) s = s.slice(0, -1)
    return s
  } catch {
    return raw.replace(/\/$/, '')
  }
}

/** Nom lisible déduit de l'URL */
export function siteNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const CATEGORY_HINTS: [RegExp, string][] = [
  [/(shop|store|market|commerce|cart|nike|adidas|amazon|ebay|etsy|shopify|zara)/i, 'E-commerce'],
  [/(bank|finance|invest|pay|stripe|crypto|assur|credit|bourse)/i, 'Finance'],
  [/(design|figma|dribbble|behance|canva|studio|creative)/i, 'Design'],
  [/(travel|hotel|booking|airbnb|trip|fly|voyage|tourism)/i, 'Voyage'],
  [/(netflix|spotify|music|video|game|tube|tv|cinema|stream|entertain)/i, 'Divertissement'],
  [/(news|blog|magazine|journal|media|press|actu|wiki|pedia)/i, 'Médias'],
  [/(app|saas|software|cloud|api|platform|tool|dashboard)/i, 'SaaS'],
  [/(dev|tech|code|git|engineering|web|framework|io$)/i, 'Tech'],
]

/** Devine une catégorie à partir de l'URL (utile pour le benchmark sectoriel) */
export function guessCategory(url: string): string {
  const host = siteNameFromUrl(url).toLowerCase()
  for (const [re, cat] of CATEGORY_HINTS) {
    if (re.test(host)) return cat
  }
  return 'Personnalisé'
}

/**
 * Indexe un site : renvoie l'enregistrement existant (dédoublonné sur l'URL
 * canonique, y compris www/non-www) ou en crée un nouveau.
 * Un site public déjà indexé par un autre tenant est réutilisé.
 */
export async function upsertIndexedSite(
  db: PrismaClient,
  rawUrl: string,
  opts: { tenantId?: string; name?: string; category?: string } = {}
) {
  const url = normalizeUrl(rawUrl)

  const existing = await db.website.findFirst({ where: { url } })
  if (existing) return existing

  return db.website.create({
    data: {
      url,
      name: opts.name ?? siteNameFromUrl(url),
      category: opts.category ?? guessCategory(url),
      tenantId: opts.tenantId ?? 'default-tenant',
    },
  })
}
