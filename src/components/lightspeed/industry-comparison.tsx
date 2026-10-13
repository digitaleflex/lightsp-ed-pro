'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IndustryComparisonProps {
  performance: number
  lcp: number
  weight: number // KB
}

// Moyennes RÉELLES calculées depuis les mesures Lighthouse en base (/api/benchmark)
interface Averages {
  avgScore: number
  avgLcp: number
  avgWeightKb: number
  siteCount: number
}

export function IndustryComparison({ performance, lcp, weight }: IndustryComparisonProps) {
  const [avg, setAvg] = React.useState<Averages | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/benchmark')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.overall) setAvg(d.overall)
      })
      .catch((e) => console.error(e))
    return () => {
      cancelled = true
    }
  }, [])

  const metrics = avg
    ? [
        {
          label: 'Score de performance',
          yourValue: performance,
          avgValue: avg.avgScore,
          unit: '',
          invert: false, // plus haut = mieux
        },
        {
          label: 'LCP',
          yourValue: lcp,
          avgValue: avg.avgLcp,
          unit: 's',
          invert: true, // plus bas = mieux
        },
        {
          label: 'Poids de la page',
          yourValue: +(weight / 1024).toFixed(1),
          avgValue: +(avg.avgWeightKb / 1024).toFixed(1),
          unit: ' Mo',
          invert: true,
        },
      ]
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border/60 bg-card p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-chart-3" />
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comparé à la moyenne des sites mesurés
        </h4>
        {avg && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {avg.siteCount} site{avg.siteCount > 1 ? 's' : ''} mesuré{avg.siteCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!avg ? (
        <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-center text-xs text-muted-foreground">
          Moyenne indisponible : aucune mesure en base pour l'instant. Lancez un test ou attendez la
          fin des mesures du classement.
        </p>
      ) : (
        <>
          <div className="space-y-2.5">
            {metrics.map((m) => {
              const diff = m.yourValue - m.avgValue
              const isBetter = m.invert ? diff < 0 : diff > 0
              const isSame = Math.abs(diff) < (m.invert ? 0.05 : 1)
              const pct = m.avgValue !== 0 ? Math.abs((diff / m.avgValue) * 100) : 0
              const Icon = isSame ? Minus : isBetter ? ArrowUp : ArrowDown
              // Pour les métriques inversées, une baisse est "mieux" → flèche verte vers le bas
              const color = isSame ? 'text-muted-foreground' : isBetter ? 'text-primary' : 'text-chart-4'

              return (
                <div key={m.label} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">{m.label}</span>

                  {/* Votre valeur */}
                  <span className="w-14 shrink-0 text-right font-mono font-bold">
                    {m.yourValue}{m.unit}
                  </span>

                  {/* Indicateur de différence */}
                  <span className={cn('flex w-20 shrink-0 items-center justify-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    isSame ? 'bg-muted text-muted-foreground' : isBetter ? 'bg-primary/10 text-primary' : 'bg-chart-4/10 text-chart-4'
                  )}>
                    <Icon className={cn('h-3 w-3', color)} />
                    {pct > 0.5 ? `${pct.toFixed(0)}%` : '='}
                  </span>

                  {/* Moyenne */}
                  <span className="ml-auto text-xs text-muted-foreground">
                    Moy. <span className="font-mono font-semibold">{m.avgValue}{m.unit}</span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Verdict */}
          <div className={cn(
            'mt-3 rounded-lg border p-2.5 text-center text-xs',
            performance > avg.avgScore + 10
              ? 'border-primary/30 bg-primary/5 text-primary'
              : performance < avg.avgScore - 10
              ? 'border-chart-4/30 bg-chart-4/5 text-chart-4'
              : 'border-border/60 bg-muted/30 text-muted-foreground'
          )}>
            {performance > avg.avgScore + 10
              ? `✓ Votre site est ${(performance - avg.avgScore).toString()} points au-dessus de la moyenne des sites mesurés`
              : performance < avg.avgScore - 10
              ? `⚠ Votre site est ${(avg.avgScore - performance).toString()} points en dessous de la moyenne des sites mesurés`
              : 'Votre site est dans la moyenne des sites mesurés'}
          </div>
        </>
      )}
    </motion.div>
  )
}
