'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Code2, Newspaper, Palette, TrendingUp, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Industry {
  name: string
  icon: React.ElementType
  avgScore: number
  avgLcp: number
  avgWeight: number // Mo
  color: string
  barColor: string
  bg: string
  best: string
}

const INDUSTRIES: Industry[] = [
  {
    name: 'Tech / SaaS',
    icon: Code2,
    avgScore: 87,
    avgLcp: 1.8,
    avgWeight: 1.2,
    color: 'text-primary',
    barColor: 'bg-primary',
    bg: 'bg-primary/10',
    best: 'Vercel',
  },
  {
    name: 'E-commerce',
    icon: ShoppingBag,
    avgScore: 62,
    avgLcp: 3.4,
    avgWeight: 2.8,
    color: 'text-chart-4',
    barColor: 'bg-chart-4',
    bg: 'bg-chart-4/10',
    best: 'Shopify',
  },
  {
    name: 'Médias',
    icon: Newspaper,
    avgScore: 54,
    avgLcp: 4.1,
    avgWeight: 3.5,
    color: 'text-chart-5',
    barColor: 'bg-chart-5',
    bg: 'bg-chart-5/10',
    best: 'Medium',
  },
  {
    name: 'Design',
    icon: Palette,
    avgScore: 91,
    avgLcp: 1.5,
    avgWeight: 0.9,
    color: 'text-chart-3',
    barColor: 'bg-chart-3',
    bg: 'bg-chart-3/10',
    best: 'Figma',
  },
] as const

export function Benchmark() {
  const maxScore = 100
  return (
    <section id="benchmark" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-2/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <TrendingUp className="h-4 w-4" />
            Benchmark sectoriel
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comparez-vous à votre secteur
          </h2>
          <p className="mt-4 text-muted-foreground">
            Les performances moyennes varient fortement selon le type de site.
            Voyez où vous situez par rapport aux leaders de votre industrie.
          </p>
        </div>

        {/* Grille d'industries */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Halo */}
              <div className={cn('pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100', ind.bg)} />

              <div className="relative">
                {/* En-tête */}
                <div className="mb-4 flex items-center justify-between">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', ind.bg)}>
                    <ind.icon className={cn('h-5 w-5', ind.color)} strokeWidth={1.8} />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <Award className="h-3 w-3" />
                    {ind.best}
                  </span>
                </div>

                {/* Nom */}
                <h3 className="mb-3 text-base font-semibold">{ind.name}</h3>

                {/* Score moyen */}
                <div className="mb-3">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Score moyen</span>
                    <span className={cn('text-2xl font-bold', ind.color)}>{ind.avgScore}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn('h-full rounded-full', ind.barColor)}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(ind.avgScore / maxScore) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Stats secondaires */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-[9px] uppercase text-muted-foreground">LCP moyen</p>
                    <p className="font-mono text-sm font-bold">{ind.avgLcp}s</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-[9px] uppercase text-muted-foreground">Poids moyen</p>
                    <p className="font-mono text-sm font-bold">{ind.avgWeight} Mo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Insight :</span> Les sites de Design
            sont en moyenne <span className="font-semibold">47% plus rapides</span> que les sites
            e-commerce. Optimiser le poids des images reste le levier n°1 pour les boutiques en ligne.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
