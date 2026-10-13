'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DEFAULT_PLANS,
  formatXof,
  type BillingInterval,
  type PlanView,
} from '@/lib/billing/catalog'

const SALES_EMAIL = 'support@velocita.fr'

/** Plans fallback pendant le chargement de /api/plans (client-safe, sans DB). */
const FALLBACK_PLANS: PlanView[] = DEFAULT_PLANS.map((p) => ({
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

export function Pricing() {
  const [annual, setAnnual] = React.useState(false)
  const [plans, setPlans] = React.useState<PlanView[]>(FALLBACK_PLANS)
  const [checkoutSlug, setCheckoutSlug] = React.useState<string | null>(null)
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null)

  // Les prix viennent de la table `Plan` (éditable via l'admin) — re-fetch au
  // montage pour refléter une édition sans rebuild. Fallback : DEFAULT_PLANS.
  React.useEffect(() => {
    let cancelled = false
    fetch('/api/plans', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.plans) && data.plans.length > 0) {
          setPlans(data.plans)
        }
      })
      .catch(() => {
        /* on garde le fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function startCheckout(plan: PlanView) {
    setCheckoutError(null)
    setCheckoutSlug(plan.slug)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug: plan.slug, interval: (annual ? 'annual' : 'monthly') as BillingInterval }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) {
        // Non connecté → on renvoie vers la connexion avec retour sur /tarifs
        window.location.href = data?.redirectTo ?? '/connexion?callbackUrl=/tarifs'
        return
      }
      if (!res.ok) {
        setCheckoutError(data?.error ?? 'Paiement indisponible.')
        return
      }
      if (data?.url) {
        window.location.href = data.url
        return
      }
      setCheckoutError('Réponse de paiement invalide.')
    } catch {
      setCheckoutError('Impossible de démarrer le paiement. Réessaie.')
    } finally {
      setCheckoutSlug(null)
    }
  }

  function handleCta(plan: PlanView) {
    if (plan.priceXof === 0) {
      // Plan gratuit → directement vers l'outil
      window.location.href = '/outil'
      return
    }
    void startCheckout(plan)
  }

  return (
    <section id="tarifs" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Tarification
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Des prix simples et transparents
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choisissez le plan qui correspond à vos besoins. Sans engagement,
            annulable à tout moment. Payez en FCFA par Mobile Money ou carte.
          </p>
        </div>

        {/* Toggle annuel / mensuel */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <span id="billing-monthly" className={cn('text-sm', !annual && 'font-semibold')}>Mensuel</span>
          <button
            role="switch"
            aria-checked={annual}
            aria-labelledby="billing-monthly billing-annual"
            onClick={() => setAnnual(!annual)}
            className={cn(
              'relative h-7 w-14 rounded-full border border-border transition-colors',
              annual ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-transform',
                annual ? 'translate-x-8' : 'translate-x-1'
              )}
            />
          </button>
          <span id="billing-annual" className={cn('text-sm', annual && 'font-semibold')}>
            Annuel{' '}
            <span className="rounded-full bg-chart-2/15 px-2 py-0.5 text-xs font-medium text-chart-2">
              -20%
            </span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => {
            const price = annual ? (p.priceAnnualXof ?? p.priceXof) : p.priceXof
            const annualTotal = (p.priceAnnualXof ?? p.priceXof) * 12
            const isFree = p.priceXof === 0
            const loading = checkoutSlug === p.slug
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  'relative flex flex-col rounded-3xl border bg-card p-8',
                  p.highlighted
                    ? 'border-primary/40 shadow-xl shadow-primary/10'
                    : 'border-border/60'
                )}
              >
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      {p.badge ?? 'Recommandé'}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                </div>

                <div className="mb-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {formatXof(price)}
                      <span className="ml-1 text-lg font-semibold">FCFA</span>
                    </span>
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                  {annual && !isFree && (
                    <span className="text-xs text-muted-foreground">
                      soit {formatXof(annualTotal)} FCFA facturés une fois par an
                    </span>
                  )}
                  {isFree && (
                    <span className="text-xs text-muted-foreground">
                      Gratuit, sans carte bancaire
                    </span>
                  )}
                </div>

                <Button
                  className={cn('mb-6 gap-2', p.highlighted && 'shadow-lg shadow-primary/20')}
                  variant={p.highlighted ? 'default' : 'outline'}
                  disabled={loading}
                  onClick={() => handleCta(p)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ouverture du paiement…
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" fill="currentColor" />
                      {p.ctaLabel}
                    </>
                  )}
                </Button>

                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>

        {checkoutError && (
          <p className="mt-6 text-center text-sm text-destructive">{checkoutError}</p>
        )}

        {/* Note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Tous les prix sont en FCFA (XOF), TTC. Paiement sécurisé par Mobile Money
          (T-Money, Moov, MTN) ou carte bancaire via FedaPay.{' '}
          <a href={`mailto:${SALES_EMAIL}`} className="underline hover:text-foreground">
            Une facture entreprise ? Contacte-nous
          </a>
          .
        </p>
      </div>
    </section>
  )
}
