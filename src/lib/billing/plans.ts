// Billing — Accès DB aux plans (SERVEUR UNIQUEMENT).
//
// Source de vérité : table `Plan`, éditable en 1 clic depuis l'admin (à venir).
// Fallback : DEFAULT_PLANS (src/lib/billing/catalog.ts, client-safe) si la table
// est vide ou la DB indisponible — la pricing page ne doit jamais être vide.
//
// ⚠️ Ce module importe Prisma : ne pas l'importer depuis un composant client.
// Le catalogue (types, prix par défaut, formatage) est dans ./catalog.ts.

import { db } from '@/lib/db'
import {
  DEFAULT_PLANS,
  defaultPlanViews,
  type PlanView,
} from '@/lib/billing/catalog'

export type { PlanView, BillingInterval } from '@/lib/billing/catalog'
export { formatXof, effectivePrice, DEFAULT_PLANS } from '@/lib/billing/catalog'

/** Mappe une ligne `Plan` DB vers `PlanView`. */
function toPlanView(row: {
  id: string
  slug: string
  name: string
  description: string
  priceXof: number
  priceAnnualXof: number | null
  currency: string
  features: unknown
  highlighted: boolean
  badge: string | null
  ctaLabel: string
  sortOrder: number
}): PlanView {
  const raw = row.features
  const features = Array.isArray(raw) ? raw.filter((f): f is string => typeof f === 'string') : []
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceXof: row.priceXof,
    priceAnnualXof: row.priceAnnualXof,
    currency: row.currency,
    features,
    highlighted: row.highlighted,
    badge: row.badge,
    ctaLabel: row.ctaLabel,
    sortOrder: row.sortOrder,
  }
}

/**
 * Retourne les plans actifs, triés.
 * Fallback : si la table est vide ou la DB inaccessible → DEFAULT_PLANS.
 */
export async function getPlans(): Promise<PlanView[]> {
  try {
    const rows = await db.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (rows.length > 0) return rows.map(toPlanView)
  } catch (e) {
    console.warn('[billing] getPlans: DB indisponible, fallback DEFAULT_PLANS:', (e as Error)?.message)
  }
  return defaultPlanViews()
}

/** Récupère un plan par son slug (DB d'abord, fallback DEFAULT_PLANS). */
export async function getPlanBySlug(slug: string): Promise<PlanView | null> {
  try {
    const row = await db.plan.findUnique({ where: { slug } })
    if (row && row.active) return toPlanView(row)
  } catch (e) {
    console.warn('[billing] getPlanBySlug: DB indisponible:', (e as Error)?.message)
  }
  const fallback = defaultPlanViews().find((p) => p.slug === slug)
  return fallback ?? null
}

/**
 * Récupère un plan par ID (nécessaire au checkout : le Payment référence planId).
 * Ne fallback pas sur les plans par défaut (leur id est fictif `default:*`).
 */
export async function getPlanById(planId: string): Promise<PlanView | null> {
  try {
    const row = await db.plan.findUnique({ where: { id: planId } })
    return row ? toPlanView(row) : null
  } catch (e) {
    console.warn('[billing] getPlanById: DB indisponible:', (e as Error)?.message)
    return null
  }
}

/**
 * Seed idempotent : insère les plans par défaut SI la table est vide.
 * Ne modifie JAMAIS un plan existant (l'admin reste maître après édition).
 */
export async function ensureDefaultPlans(): Promise<{ created: number; skipped: boolean }> {
  try {
    const count = await db.plan.count()
    if (count > 0) return { created: 0, skipped: true }
    for (const p of DEFAULT_PLANS) {
      await db.plan.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          priceXof: p.priceXof,
          priceAnnualXof: p.priceAnnualXof,
          currency: p.currency,
          features: p.features,
          maxSites: p.maxSites,
          testsPerMonth: p.testsPerMonth,
          retentionDays: p.retentionDays,
          monitorIntervalMin: p.monitorIntervalMin,
          highlighted: p.highlighted,
          badge: p.badge,
          ctaLabel: p.ctaLabel,
          sortOrder: p.sortOrder,
        },
      })
    }
    console.log(`[billing] ${DEFAULT_PLANS.length} plans par défaut insérés`)
    return { created: DEFAULT_PLANS.length, skipped: false }
  } catch (e) {
    console.warn('[billing] ensureDefaultPlans: échec (DB indisponible ?):', (e as Error)?.message)
    return { created: 0, skipped: true }
  }
}
