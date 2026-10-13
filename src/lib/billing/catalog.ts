// Billing — Catalogue des plans (client-safe : AUCUNE importation Prisma).
//
// Ce module est importé par la pricing page ('use client') — il ne doit donc
// jamais importer `@/lib/db`. La source de vérité reste la table `Plan`
// (voir src/lib/billing/plans.ts côté serveur) ; DEFAULT_PLANS sert de seed
// et de fallback d'affichage.
//
// Devise : XOF (FCFA) — imposée par FedaPay.
// Parité de référence : 1 EUR = 655,957 XOF.

export type BillingInterval = 'monthly' | 'annual'

/** Représentation d'un plan telle que renvoyée par /api/plans. */
export interface PlanView {
  id: string
  slug: string
  name: string
  description: string
  priceXof: number
  priceAnnualXof: number | null
  currency: string
  features: string[]
  highlighted: boolean
  badge: string | null
  ctaLabel: string
  sortOrder: number
}

/** Plans par défaut (seed). Grille validée : 0 / 5 000 / 15 000 / 65 000 FCFA/mois. */
export const DEFAULT_PLANS: Array<
  Omit<PlanView, 'id'> & {
    maxSites: number | null
    testsPerMonth: number | null
    retentionDays: number | null
    monitorIntervalMin: number | null
  }
> = [
  {
    slug: 'decouverte',
    name: 'Découverte',
    description: 'Pour découvrir et mesurer la vitesse de votre site.',
    priceXof: 0,
    priceAnnualXof: 0,
    currency: 'XOF',
    features: [
      'Jusqu’à 3 sites surveillés',
      '10 tests par mois',
      'Appareil mobile & bureau',
      'Audit Lighthouse',
      'Historique 7 jours',
      'Score Core Web Vitals',
    ],
    maxSites: 3,
    testsPerMonth: 10,
    retentionDays: 7,
    monitorIntervalMin: 1440,
    highlighted: false,
    badge: null,
    ctaLabel: 'Commencer gratuitement',
    sortOrder: 0,
  },
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Pour les indépendants et petites structures qui suivent leur perf.',
    priceXof: 5_000,
    priceAnnualXof: 4_000,
    currency: 'XOF',
    features: [
      'Jusqu’à 5 sites surveillés',
      'Tests illimités',
      'Historique 30 jours',
      'Alertes par email',
      'Audit Lighthouse complet',
      'Support par email',
    ],
    maxSites: 5,
    testsPerMonth: null,
    retentionDays: 30,
    monitorIntervalMin: 1440,
    highlighted: false,
    badge: null,
    ctaLabel: 'Passer au Starter',
    sortOrder: 1,
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Pour les équipes qui veulent rester rapides en continu.',
    priceXof: 15_000,
    priceAnnualXof: 12_000,
    currency: 'XOF',
    features: [
      '10 sites surveillés',
      'Tests illimités',
      'Monitoring continu (toutes les heures)',
      'Toutes les régions (NA, EU, APAC)',
      'Historique 12 mois',
      'Webhooks de déploiement',
      'Alertes par email',
      'Rapports PDF',
    ],
    maxSites: 10,
    testsPerMonth: null,
    retentionDays: 365,
    monitorIntervalMin: 60,
    highlighted: true,
    badge: 'Le plus populaire',
    ctaLabel: 'Passer au Pro',
    sortOrder: 2,
  },
  {
    slug: 'entreprise',
    name: 'Entreprise',
    description: 'Pour les organisations avec des besoins avancés.',
    priceXof: 65_000,
    priceAnnualXof: 52_000,
    currency: 'XOF',
    features: [
      'Tout le plan Pro',
      'Sites surveillés illimités',
      'Tests toutes les 5 minutes',
      'Données utilisateurs réelles (RUM)',
      'API & intégrations',
      'SSO / SAML',
      'SLA 99.9 %',
      'Support prioritaire',
    ],
    maxSites: null,
    testsPerMonth: null,
    retentionDays: 730,
    monitorIntervalMin: 5,
    highlighted: false,
    badge: null,
    ctaLabel: 'Passer à l’Entreprise',
    sortOrder: 3,
  },
]

/** Formate un montant XOF : 15000 → "15 000". */
export function formatXof(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount)
}

/** Prix effectif selon l'intervalle choisi. */
export function effectivePrice(plan: PlanView, interval: BillingInterval): number {
  if (interval === 'annual') return plan.priceAnnualXof ?? plan.priceXof
  return plan.priceXof
}

/** Plans par défaut sous forme de PlanView (fallback d'affichage). */
export function defaultPlanViews(): PlanView[] {
  return DEFAULT_PLANS.map((p) => ({
    id: `default:${p.slug}`,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceXof: p.priceXof,
    priceAnnualXof: p.priceAnnualXof,
    currency: p.currency,
    features: p.features,
    highlighted: p.highlighted,
    badge: p.badge,
    ctaLabel: p.ctaLabel,
    sortOrder: p.sortOrder,
  }))
}
