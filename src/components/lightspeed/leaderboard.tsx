'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Loader2, ArrowUp, ArrowDown, Minus, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScoreRing } from './score-ring'
import { toast } from '@/hooks/use-toast'

interface LeaderEntry {
  id: string
  rank: number
  name: string
  url: string
  category: string
  performance: number
  accessibility: number
  seo: number
  bestPractices: number
  lcp: number
  cls: number
  tbt: number
  totalWeight: number
}

const CATEGORIES = ['Tous', 'Tech', 'SaaS', 'E-commerce', 'Finance', 'Design', 'Divertissement', 'Voyage'] as const

export function Leaderboard() {
  const [entries, setEntries] = React.useState<LeaderEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [category, setCategory] = React.useState<string>('Tous')
  const [selected, setSelected] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/leaderboard')
      const d = await res.json()
      if (d?.leaderboard) setEntries(d.leaderboard)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  const filtered = category === 'Tous' ? entries : entries.filter((e) => e.category === category)

  // Tendance simulée déterministe
  const trend = (rank: number) => {
    const v = Math.sin(rank * 1.7)
    return v > 0.3 ? 'up' : v < -0.3 ? 'down' : 'same'
  }

  const selectedEntry = entries.find((e) => e.id === selected)

  return (
    <section id="classement" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-4/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Trophy className="h-4 w-4" />
            Classement
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Les sites les plus rapides
          </h2>
          <p className="mt-4 text-muted-foreground">
            Découvrez les sites les plus performants selon leur score Lighthouse.
            Comparez et inspirez-vous pour optimiser le vôtre.
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                category === c
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Tableau classement */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement du classement…</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            {/* En-tête desktop */}
            <div className="hidden grid-cols-[60px_1fr_100px_100px_100px_100px_120px_60px] gap-3 border-b border-border/60 bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Rang</span>
              <span>Site</span>
              <span className="text-center">Perf.</span>
              <span className="text-center">Access.</span>
              <span className="text-center">SEO</span>
              <span className="text-center">LCP</span>
              <span className="text-center">Catégorie</span>
              <span className="text-center">Tendance</span>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-border/60">
              {filtered.map((e, i) => {
                const t = trend(e.rank)
                const scoreColor = e.performance >= 90 ? 'text-chart-2' : e.performance >= 50 ? 'text-chart-4' : 'text-destructive'
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(e.id)}
                    className={cn(
                      'grid cursor-pointer grid-cols-[40px_1fr_60px] items-center gap-2 px-4 py-3 transition-colors hover:bg-accent/40 md:grid-cols-[60px_1fr_100px_100px_100px_100px_120px_60px] md:gap-3 md:px-5',
                      selected === e.id && 'bg-accent/60'
                    )}
                  >
                    {/* Rang */}
                    <div className="flex items-center justify-center">
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          e.rank === 1
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : e.rank === 2
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : e.rank === 3
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {e.rank}
                      </span>
                    </div>

                    {/* Site */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Globe className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{e.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{e.url}</p>
                        </div>
                      </div>
                    </div>

                    {/* Perf */}
                    <div className="text-center md:text-center">
                      <span className={cn('text-base font-bold md:text-lg', scoreColor)}>{e.performance}</span>
                    </div>

                    {/* Access */}
                    <div className="hidden text-center md:block">
                      <span className={cn('text-sm font-semibold', e.accessibility >= 90 ? 'text-chart-2' : 'text-chart-4')}>
                        {e.accessibility}
                      </span>
                    </div>

                    {/* SEO */}
                    <div className="hidden text-center md:block">
                      <span className={cn('text-sm font-semibold', e.seo >= 90 ? 'text-chart-2' : 'text-chart-4')}>
                        {e.seo}
                      </span>
                    </div>

                    {/* LCP */}
                    <div className="hidden text-center md:block">
                      <span className={cn('text-sm font-semibold', e.lcp < 2.5 ? 'text-chart-2' : 'text-chart-4')}>
                        {e.lcp}s
                      </span>
                    </div>

                    {/* Catégorie */}
                    <div className="hidden text-center md:block">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {e.category}
                      </span>
                    </div>

                    {/* Tendance */}
                    <div className="hidden items-center justify-center md:flex">
                      {t === 'up' ? (
                        <span className="flex items-center text-chart-2"><ArrowUp className="h-4 w-4" /></span>
                      ) : t === 'down' ? (
                        <span className="flex items-center text-destructive"><ArrowDown className="h-4 w-4" /></span>
                      ) : (
                        <span className="flex items-center text-muted-foreground"><Minus className="h-4 w-4" /></span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Détail du site sélectionné */}
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-lg"
          >
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ScoreRing score={selectedEntry.performance} size={140} label="Performance" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{selectedEntry.name}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {selectedEntry.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEntry.url}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <DetailStat label="LCP" value={`${selectedEntry.lcp}s`} good={selectedEntry.lcp < 2.5} />
                  <DetailStat label="CLS" value={selectedEntry.cls.toFixed(3)} good={selectedEntry.cls < 0.1} />
                  <DetailStat label="TBT" value={`${selectedEntry.tbt}ms`} good={selectedEntry.tbt < 200} />
                  <DetailStat label="Poids" value={`${(selectedEntry.totalWeight / 1024).toFixed(1)} Mo`} good={selectedEntry.totalWeight < 1500} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelected(null)
                  toast({ title: `Analyse de ${selectedEntry.name} ajoutée au tableau de bord` })
                }}
              >
                Voir dans le tableau de bord →
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function DetailStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-semibold', good ? 'text-chart-2' : 'text-chart-4')}>{value}</p>
    </div>
  )
}
