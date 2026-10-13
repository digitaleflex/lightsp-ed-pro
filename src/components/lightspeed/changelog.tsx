'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { GitCommit, Sparkles, Zap, Shield, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChangeType = 'feature' | 'improvement' | 'security' | 'metric'

const CHANGELOG: { version: string; date: string; type: ChangeType; title: string; description: string }[] = [
  {
    version: '2.4',
    date: '2026-10',
    type: 'feature',
    title: 'Cascade de chargement (waterfall)',
    description: "Visualisez la timeline de chargement de chaque ressource, comme dans Lighthouse.",
  },
  {
    version: '2.3',
    date: '2026-09',
    type: 'improvement',
    title: 'Calculateur de budget de performance',
    description: "Définissez vos objectifs et obtenez des recommandations d'optimisation ciblées.",
  },
  {
    version: '2.2',
    date: '2026-09',
    type: 'feature',
    title: 'Comparaison de sites côte à côte',
    description: "Comparez deux sites sur 8 métriques avec mise en évidence du gagnant.",
  },
  {
    version: '2.1',
    date: '2026-08',
    type: 'security',
    title: 'Conformité RGPD & consentement cookies',
    description: "Bannière de consentement granulaire et respect total de la vie privée.",
  },
  {
    version: '2.0',
    date: '2026-07',
    type: 'metric',
    title: "Données utilisateurs réelles (RUM)",
    description: "Core Web Vitals basés sur les visites réelles, pas seulement sur des tests synthétiques.",
  },
]

const TYPE_CONFIG: Record<ChangeType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  feature: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', label: 'Fonctionnalité' },
  improvement: { icon: Zap, color: 'text-chart-2', bg: 'bg-chart-2/10', label: 'Amélioration' },
  security: { icon: Shield, color: 'text-chart-3', bg: 'bg-chart-3/10', label: 'Sécurité' },
  metric: { icon: BarChart3, color: 'text-chart-4', bg: 'bg-chart-4/10', label: 'Métrique' },
}

export function Changelog() {
  return (
    <section id="changelog" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-5/5 blur-[120px]" />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <GitCommit className="h-4 w-4" />
            Journal des évolutions
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Vélocita s'améliore en continu
          </h2>
          <p className="mt-4 text-muted-foreground">
            Nous publions des mises à jour régulièrement. Voici les dernières
            évolutions du produit.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent sm:left-8" />

          <div className="space-y-6">
            {CHANGELOG.map((entry, i) => {
              const cfg = TYPE_CONFIG[entry.type]
              const Icon = cfg.icon
              return (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative flex gap-4 sm:gap-6"
                >
                  {/* Point timeline */}
                  <div className={cn('relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ring-background', cfg.bg)}>
                    <Icon className={cn('h-5 w-5', cfg.color)} />
                  </div>

                  {/* Carte */}
                  <div className="flex-1 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold">v{entry.version}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                    <h3 className="text-base font-semibold">{entry.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA en bas */}
          <div className="mt-8 flex items-center gap-2 pl-16 sm:pl-20">
            <GitCommit className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Voir l'historique complet sur{' '}
              <Link href="/journal" className="font-medium text-primary hover:underline">Journal</Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
