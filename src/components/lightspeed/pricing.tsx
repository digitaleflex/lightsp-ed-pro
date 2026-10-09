'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const PLANS = [
  {
    name: 'Découverte',
    price: 0,
    period: '/mois',
    description: 'Pour découvrir et tester la vitesse de votre site.',
    features: [
      'Jusqu\'à 5 sites surveillés',
      '10 tests par mois',
      'Appareil mobile & bureau',
      'Audit Lighthouse',
      'Historique 7 jours',
      'Score Core Web Vitals',
    ],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 19,
    period: '/mois',
    description: 'Pour les équipes qui veulent rester rapides en continu.',
    features: [
      'Sites surveillés illimités',
      'Tests illimités',
      'Monitoring continu (toutes les heures)',
      'Toutes les régions (NA, EU, APAC)',
      'Historique 12 mois',
      'Webhooks de déploiement',
      'Alertes par email',
      'Rapports PDF',
    ],
    cta: 'Essayer Pro 14 jours',
    highlighted: true,
    badge: 'Le plus populaire',
  },
  {
    name: 'Entreprise',
    price: 99,
    period: '/mois',
    description: 'Pour les organisations avec des besoins avancés.',
    features: [
      'Tout le plan Pro',
      'Tests toutes les 5 minutes',
      'Données utilisateurs réelles (RUM)',
      'API & intégrations',
      'SSO / SAML',
      'SLA 99.9 %',
      'Support prioritaire',
      'Gestionnaire de compte dédié',
    ],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
] as const

export function Pricing() {
  const [annual, setAnnual] = React.useState(false)

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
            annulable à tout moment.
          </p>
        </div>

        {/* Toggle annuel / mensuel */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className={cn('text-sm', !annual && 'font-semibold')}>Mensuel</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={cn(
              'relative h-7 w-14 rounded-full border border-border transition-colors',
              annual ? 'bg-primary' : 'bg-muted'
            )}
            aria-label="Basculer annuel"
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-background shadow transition-transform',
                annual ? 'translate-x-8' : 'translate-x-1'
              )}
            />
          </button>
          <span className={cn('text-sm', annual && 'font-semibold')}>
            Annuel{' '}
            <span className="rounded-full bg-chart-2/15 px-2 py-0.5 text-xs font-medium text-chart-2">
              -20%
            </span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const price = annual ? Math.round(p.price * 0.8) : p.price
            return (
              <motion.div
                key={p.name}
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
                      {p.badge}
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{price}€</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>

                <Button
                  className={cn('mb-6 gap-2', p.highlighted && 'shadow-lg shadow-primary/20')}
                  variant={p.highlighted ? 'default' : 'outline'}
                  onClick={() => toast({ title: `${p.name} sélectionné`, description: 'Redirection vers le paiement…' })}
                >
                  <Zap className="h-4 w-4" fill="currentColor" />
                  {p.cta}
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

        {/* Note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Tous les prix sont en euros, hors taxes. Sans carte bancaire pour le
          plan Découverte.
        </p>
      </div>
    </section>
  )
}
