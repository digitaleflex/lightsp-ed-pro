'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Gauge, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreRing } from './score-ring'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Fond : grille + halos */}
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-20 h-[300px] w-[300px] rounded-full bg-chart-2/20 blur-[100px]" />

      {/* Formes flottantes animées */}
      <motion.div
        className="pointer-events-none absolute left-[6%] top-[18%] h-20 w-20 rounded-2xl border-2 border-primary/25 bg-primary/5"
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute right-[12%] top-[52%] h-14 w-14 rounded-full border-2 border-chart-3/30 bg-chart-3/5"
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="pointer-events-none absolute left-[42%] bottom-[10%] h-16 w-16 rotate-45 border-2 border-chart-4/25 bg-chart-4/5"
        animate={{ y: [0, -14, 0], rotate: [45, 100, 45] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="pointer-events-none absolute right-[30%] bottom-[20%] h-8 w-8 rounded-full border-2 border-chart-2/30 bg-chart-2/5"
        animate={{ y: [0, -22, 0], x: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Colonne texte */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Monitoring Core Web Vitals en temps réel
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Surveillance de
              <br className="hidden sm:block" />{' '}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                performance de sites
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Surveillez et optimisez les performances de vos pages pour augmenter
              vos conversions et mieux ranker sur Google. Audits Lighthouse, Core
              Web Vitals et données réelles utilisateurs.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                <Link href="#outil">
                  <Gauge className="h-4 w-4" />
                  Tester mon site gratuitement
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="#fonctionnalites">
                  Voir les fonctionnalités
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground lg:text-left text-center">
              Sans carte bancaire • Configuration en 2 minutes • Aucun code à ajouter
            </p>

            {/* Citation */}
            <figure className="mt-10 rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur">
              <blockquote className="text-sm font-medium text-foreground sm:text-base">
                «&nbsp;53% des utilisateurs mobiles abandonnent les sites qui
                mettent plus de trois secondes à charger.&nbsp;»
              </blockquote>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                — Données Google.{' '}
                <Link href="#" className="underline hover:text-foreground">
                  Source →
                </Link>
              </figcaption>
            </figure>
          </motion.div>

          {/* Colonne visuel : score + carte de monitoring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="relative rounded-3xl border border-border/60 bg-card/80 p-6 shadow-2xl backdrop-blur">
              {/* En-tête carte */}
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex shrink-0 gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-destructive/70" />
                    <span className="h-3 w-3 rounded-full bg-chart-3/70" />
                    <span className="h-3 w-3 rounded-full bg-chart-2/70" />
                  </div>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    lightspeed.run/rapport
                  </span>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  En direct
                </span>
              </div>

              {/* Score central */}
              <div className="flex flex-col items-center">
                <ScoreRing score={94} size={160} label="Performance" />
                <div className="mt-4 grid w-full grid-cols-3 gap-2">
                  <MiniScore label="SEO" value={100} />
                  <MiniScore label="Accessibilité" value={96} />
                  <MiniScore label="Bonnes pratiques" value={92} />
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border/60 pt-4">
                <Vital label="LCP" value="1.4s" good />
                <Vital label="TBT" value="120ms" good />
                <Vital label="CLS" value="0.02" good />
              </div>
            </div>

            {/* Carte flottante */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border/60 bg-card p-4 shadow-xl backdrop-blur sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temps gagné</p>
                  <p className="text-sm font-semibold">-2.3s de chargement</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const color =
    value >= 90 ? 'text-chart-2' : value >= 50 ? 'text-chart-4' : 'text-destructive'
  return (
    <div className="rounded-lg border border-border/50 bg-background/60 p-2 text-center">
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function Vital({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${good ? 'text-chart-2' : 'text-chart-4'}`}>
        {value}
      </p>
    </div>
  )
}
