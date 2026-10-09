'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Globe2,
  LineChart,
  MousePointerClick,
  Smartphone,
  Webhook,
  Gauge,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Activity,
    title: 'Surveillance continue',
    description:
      "Monitoring automatique des performances et des Core Web Vitals pour votre site, 24h/24.",
    accent: 'from-chart-2/20 to-chart-2/5',
  },
  {
    icon: LineChart,
    title: 'Suivi de performance',
    description:
      'Suivez votre score de performance dans le temps et soyez alerté dès qu\'il change.',
    accent: 'from-chart-1/20 to-chart-1/5',
  },
  {
    icon: Globe2,
    title: 'Mesure globale',
    description:
      'Testez depuis l\'Amérique du Nord, l\'Europe ou la zone Asie-Pacifique.',
    accent: 'from-chart-3/20 to-chart-3/5',
  },
  {
    icon: MousePointerClick,
    title: 'Tests à la demande & par lot',
    description:
      'Testez toutes vos pages importantes en un seul clic, en mode batch.',
    accent: 'from-chart-4/20 to-chart-4/5',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description:
      'Déclenchez automatiquement des tests dès que vous déployez votre site.',
    accent: 'from-chart-5/20 to-chart-5/5',
  },
  {
    icon: Smartphone,
    title: 'Multi-appareil',
    description:
      'Surveillez votre site sur mobile et sur desktop, simultanément.',
    accent: 'from-chart-1/20 to-chart-2/5',
  },
  {
    icon: Gauge,
    title: 'Audits Lighthouse',
    description:
      'Obtenez les dernières recommandations Lighthouse pour optimiser vos pages.',
    accent: 'from-chart-2/20 to-chart-3/5',
  },
  {
    icon: Users,
    title: 'Données utilisateurs réelles',
    description:
      'Découvrez les Core Web Vitals basés sur les visites réelles de vos visiteurs.',
    accent: 'from-chart-4/20 to-chart-1/5',
  },
] as const

export function Features() {
  return (
    <section id="fonctionnalites" className="relative py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            La boîte à outils
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Le kit de surveillance de vitesse
          </h2>
          <p className="mt-4 text-muted-foreground">
            Lightspeed inclut toutes les fonctionnalités dont vous avez besoin
            pour surveiller les performances et obtenir des informations de
            vitesse pour votre site web.
          </p>
        </div>

        {/* Grille de fonctionnalités */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Halo d'accent au survol */}
              <div
                className={cn(
                  'pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
                  f.accent
                )}
              />
              {/* Numéro discret en arrière-plan */}
              <span className="pointer-events-none absolute right-5 top-4 select-none font-mono text-5xl font-bold text-muted-foreground/10 transition-colors group-hover:text-primary/20 dark:text-muted-foreground/5 dark:group-hover:text-primary/10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/30">
                  <f.icon className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h3 className="mb-2 text-base font-semibold leading-tight">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA bas de section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Prêt à accélérer votre site ?{' '}
            <a href="#outil" className="font-semibold text-primary hover:underline">
              Essayez gratuitement →
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
