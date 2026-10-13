'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { GitCompare, TrendingUp, TrendingDown, ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatWeight } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Snapshot {
  date: string
  performance: number
  lcp: number
  cls: number
  tbt: number
  /** Poids mesuré réel. Si absent (anciens enregistrements), la ligne est masquée. */
  totalWeight?: number
}

interface BeforeAfterProps {
  current: Snapshot
  previous: Snapshot
}

export function BeforeAfter({ current, previous }: BeforeAfterProps) {
  const metrics: { key: keyof Snapshot; label: string; unit: string; invert: boolean; format: (v: number) => string }[] = [
    { key: 'performance', label: 'Score', unit: '/100', invert: false, format: (v) => String(Math.round(v)) },
    { key: 'lcp', label: 'LCP', unit: 's', invert: true, format: (v) => v.toFixed(2) },
    { key: 'cls', label: 'CLS', unit: '', invert: true, format: (v) => v.toFixed(3) },
    { key: 'tbt', label: 'TBT', unit: 'ms', invert: true, format: (v) => String(Math.round(v)) },
    { key: 'totalWeight', label: 'Poids', unit: '', invert: true, format: (v) => formatWeight(v) },
  ]

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const hasRealWeights = current.totalWeight != null && previous.totalWeight != null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-chart-1" />
          Évolution avant / après optimisation
        </CardTitle>
        <CardDescription>
          Comparez les métriques entre deux snapshots pour mesurer l'impact de vos optimisations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* En-tête colonnes */}
        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Avant
            </div>
            <p className="mt-0.5 text-sm font-semibold">{formatDate(previous.date)}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center justify-center gap-1 text-xs text-primary">
              <Clock className="h-3 w-3" />
              Après
            </div>
            <p className="mt-0.5 text-sm font-semibold">{formatDate(current.date)}</p>
          </div>
        </div>

        {/* Métriques comparées (le poids n'apparaît que s'il a été réellement mesuré) */}
        <div className="space-y-2.5">
          {metrics
            .filter((m) => m.key !== 'totalWeight' || hasRealWeights)
            .map((m, i) => {
            const prevVal = previous[m.key] as number
            const currVal = current[m.key] as number
            const diff = currVal - prevVal
            // Pour les métriques inversées (plus petit = mieux), une baisse est positive
            const isBetter = m.invert ? diff < 0 : diff > 0
            const isWorse = m.invert ? diff > 0 : diff < 0
            const pctChange = prevVal !== 0 ? Math.abs((diff / prevVal) * 100) : 0
            const Icon = isBetter ? TrendingUp : isWorse ? TrendingDown : GitCompare
            const color = isBetter ? 'text-primary' : isWorse ? 'text-destructive' : 'text-muted-foreground'

            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-border/40 bg-background/40 p-3 text-center"
              >
                {/* Avant */}
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.label}</span>
                  <p className="font-mono text-base font-semibold text-muted-foreground">
                    {m.format(prevVal)}{m.unit}
                  </p>
                </div>

                {/* Variation */}
                <div className={cn('flex flex-col items-center gap-0.5', color)}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-bold">
                    {diff > 0 ? '+' : ''}{diff > 0.01 || diff < -0.01 ? m.format(diff) : '0'}{m.unit}
                  </span>
                  {pctChange > 0.1 && (
                    <span className="text-[9px] opacity-70">
                      {pctChange.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Après */}
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wide text-primary">{m.label}</span>
                  <p className={cn('font-mono text-base font-bold', color)}>
                    {m.format(currVal)}{m.unit}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Résumé */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary/5 p-3 text-center text-sm">
          <span className="font-semibold text-primary">Bilan :</span>
          <span className="text-muted-foreground">
            Score {previous.performance < current.performance ? 'amélioré' : previous.performance > current.performance ? 'dégradé' : 'stable'} de {Math.abs(previous.performance - current.performance)} points
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
