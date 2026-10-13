'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Code2,
  Newspaper,
  Palette,
  TrendingUp,
  Award,
  Landmark,
  Plane,
  Clapperboard,
  Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardSkeletonGrid, LoadError } from './loading-states'

interface Industry {
  category: string
  avgScore: number
  avgLcp: number
  avgWeight: number // Mo
  siteCount: number
  bestName: string | null
}

interface BenchmarkData {
  real: boolean
  sampleSize: number
  sources: Record<string, number>
  industries: Industry[]
  insight: { bestCategory: string; worstCategory: string; deltaPct: number } | null
}

// Habillage visuel par catégorie (les données, elles, viennent des mesures)
const CATEGORY_STYLE: Record<string, { icon: React.ElementType; color: string; barColor: string; bg: string }> = {
  Tech: { icon: Code2, color: 'text-primary', barColor: 'bg-primary', bg: 'bg-primary/10' },
  SaaS: { icon: Gauge, color: 'text-chart-2', barColor: 'bg-chart-2', bg: 'bg-chart-2/10' },
  'E-commerce': { icon: ShoppingBag, color: 'text-chart-4', barColor: 'bg-chart-4', bg: 'bg-chart-4/10' },
  Finance: { icon: Landmark, color: 'text-chart-5', barColor: 'bg-chart-5', bg: 'bg-chart-5/10' },
  Design: { icon: Palette, color: 'text-chart-3', barColor: 'bg-chart-3', bg: 'bg-chart-3/10' },
  Divertissement: { icon: Clapperboard, color: 'text-chart-1', barColor: 'bg-chart-1', bg: 'bg-chart-1/10' },
  Voyage: { icon: Plane, color: 'text-chart-2', barColor: 'bg-chart-2', bg: 'bg-chart-2/10' },
  Médias: { icon: Newspaper, color: 'text-chart-5', barColor: 'bg-chart-5', bg: 'bg-chart-5/10' },
}
const FALLBACK_STYLE = { icon: Code2, color: 'text-primary', barColor: 'bg-primary', bg: 'bg-primary/10' }

export function Benchmark() {
  const [data, setData] = React.useState<BenchmarkData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    setLoadError(false)
    let cancelled = false
    fetch('/api/benchmark')
      .then((r) => {
        if (!r.ok) throw new Error(`Benchmark indisponible (${r.status})`)
        return r.json()
      })
      .then((d) => {
        if (!cancelled) setData(d?.industries ? d : { industries: [] })
      })
      .catch((e) => {
        console.error(e)
        if (!cancelled) setLoadError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => load(), [load])

  const maxScore = 100
  const industries = data?.industries ?? []
  const hasData = industries.length > 0

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
            Moyennes calculées à partir des mesures Lighthouse réelles des sites suivis.
            Voyez où vous situez par rapport aux leaders de votre industrie.
          </p>
          {hasData && (
            <p className="mt-2 text-xs text-muted-foreground">
              {data!.sampleSize} mesure{data!.sampleSize > 1 ? 's' : ''} réelle
              {data!.sampleSize > 1 ? 's' : ''} • dernière mesure de chaque site
            </p>
          )}
        </div>

        {/* États de chargement / erreur / vide */}
        {loading ? (
          <div role="status" aria-label="Calcul des moyennes sectorielles">
            <CardSkeletonGrid count={8} />
            <p className="sr-only">Calcul des moyennes sectorielles…</p>
          </div>
        ) : loadError ? (
          <LoadError
            title="Benchmark indisponible"
            message="Les moyennes sectorielles n’ont pas pu être calculées."
            onRetry={() => load()}
          />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <TrendingUp className="h-7 w-7 opacity-50" />
            </div>
            <div>
              <p className="font-semibold">Aucune mesure disponible pour l'instant</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Les moyennes sectorielles sont calculées à partir de mesures Lighthouse réelles.
                Elles apparaîtront dès que les premiers tests seront terminés (lancement automatique
                depuis l'outil de test).
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Grille d'industries */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {industries.slice(0, 8).map((ind, i) => {
                const style = CATEGORY_STYLE[ind.category] ?? FALLBACK_STYLE
                return (
                  <motion.div
                    key={ind.category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Halo */}
                    <div
                      className={cn(
                        'pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100',
                        style.bg
                      )}
                    />

                    <div className="relative">
                      {/* En-tête */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', style.bg)}>
                          <style.icon className={cn('h-5 w-5', style.color)} strokeWidth={1.8} />
                        </div>
                        {ind.bestName && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            <Award className="h-3 w-3" />
                            {ind.bestName}
                          </span>
                        )}
                      </div>

                      {/* Nom */}
                      <h3 className="mb-3 text-base font-semibold">
                        {ind.category}
                        <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                          ({ind.siteCount} site{ind.siteCount > 1 ? 's' : ''})
                        </span>
                      </h3>

                      {/* Score moyen */}
                      <div className="mb-3">
                        <div className="mb-1 flex items-baseline justify-between">
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Score moyen
                          </span>
                          <span className={cn('text-2xl font-bold', style.color)}>{ind.avgScore}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className={cn('h-full rounded-full', style.barColor)}
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
                )
              })}
            </div>

            {/* Insight calculé sur données mesurées */}
            {data!.insight && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Insight :</span> Les sites de{' '}
                  <span className="font-semibold">{data!.insight.bestCategory}</span> ont un LCP moyen{' '}
                  <span className="font-semibold">{data!.insight.deltaPct}% plus rapide</span> que les
                  sites de {data!.insight.worstCategory}.{' '}
                  <span className="text-xs">
                    (Calculé sur {data!.sampleSize} mesures Lighthouse réelles)
                  </span>
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
