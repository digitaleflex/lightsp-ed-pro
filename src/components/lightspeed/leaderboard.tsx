'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Loader2, ArrowUp, ArrowDown, Minus, Globe, GitCompareArrows, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScoreRing } from './score-ring'
import { Sparkline } from './sparkline'
import { CompareModal } from './compare-modal'
import { LoadingSkeleton, LoadError } from './loading-states'
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
  source?: string
  sparkline?: number[]
}

interface LeaderMeta {
  sources: Record<string, number>
  totalTests: number
  job: {
    running: boolean
    total: number
    done: number
    current: string | null
    sources: Record<string, number>
    errors: string[]
  }
}

const CATEGORIES = ['Tous', 'Tech', 'SaaS', 'E-commerce', 'Finance', 'Design', 'Divertissement', 'Voyage'] as const

const SOURCE_LABEL: Record<string, string> = {
  lighthouse: 'Mesure réelle (Lighthouse local)',
  pagespeed: 'Mesure réelle (PageSpeed Insights)',
  simulated: 'Données simulées',
}

export function Leaderboard() {
  const [entries, setEntries] = React.useState<LeaderEntry[]>([])
  const [meta, setMeta] = React.useState<LeaderMeta | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)
  const [category, setCategory] = React.useState<string>('Tous')
  const [selected, setSelected] = React.useState<string | null>(null)
  const [compareOpen, setCompareOpen] = React.useState(false)
  const [compareSite, setCompareSite] = React.useState<LeaderEntry | null>(null)
  const [remeasuring, setRemeasuring] = React.useState<string | null>(null)

  async function load() {
    setLoading(true)
    setLoadError(false)
    try {
      const res = await fetch('/api/leaderboard')
      if (!res.ok) throw new Error(`Classement indisponible (${res.status})`)
      const d = await res.json()
      if (d?.leaderboard) setEntries(d.leaderboard)
      if (d?.meta) setMeta(d.meta)
    } catch (e) {
      console.error(e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  // Re-mesure réelle d'un site indexé (ajoute un test à son historique)
  async function remeasure(id: string, name: string) {
    setRemeasuring(id)
    try {
      const res = await fetch('/api/measure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: id }),
      })
      const d = await res.json()
      if (d?.success) {
        toast({
          title: `${name} re-mesuré`,
          description: `Score ${d.result.performance}/100 — ${
            d.result.source === 'simulated' ? 'simulation (repli)' : 'mesure réelle'
          }`,
        })
        await load()
      } else {
        toast({ title: 'Échec de la mesure', description: d?.error ?? 'Erreur inconnue', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Échec de la mesure', description: String(e), variant: 'destructive' })
    } finally {
      setRemeasuring(null)
    }
  }

  // Tant que les mesures réelles tournent en arrière-plan, on rafraîchit
  React.useEffect(() => {
    if (!meta?.job?.running) return
    const t = setTimeout(load, 8000)
    return () => clearTimeout(t)
  }, [meta?.job?.running, meta?.job?.done])

  const filtered = category === 'Tous' ? entries : entries.filter((e) => e.category === category)

  // Tendance réelle : comparaison des deux dernières mesures enregistrées
  const trend = (sparkline?: number[]) => {
    if (!sparkline || sparkline.length < 2) return 'same'
    const last = sparkline[sparkline.length - 1]
    const prev = sparkline[sparkline.length - 2]
    return last > prev ? 'up' : last < prev ? 'down' : 'same'
  }

  const realTests = (meta?.sources?.lighthouse ?? 0) + (meta?.sources?.pagespeed ?? 0)
  const simulatedTests = meta?.sources?.simulated ?? 0

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

        {/* Transparence sur l'origine des mesures */}
        {meta && (
          <div
            className={cn(
              'mb-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs',
              meta.job?.running
                ? 'border-primary/30 bg-primary/5 text-foreground'
                : simulatedTests > 0 && realTests === 0
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-border/60 bg-card/60 text-muted-foreground'
            )}
          >
            {meta.job?.running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>
                  Mesure réelle en cours : <strong>{meta.job.done}/{meta.job.total}</strong> sites analysés
                  via Lighthouse{meta.job.current ? ` — en cours : ${meta.job.current}` : ''}
                </span>
              </>
            ) : simulatedTests > 0 && realTests === 0 ? (
              <span>
                ⚠️ {SOURCE_LABEL.simulated} — les scores affichés n'ont pas été mesurés
                ({simulatedTests} test{simulatedTests > 1 ? 's' : ''} simulé{simulatedTests > 1 ? 's' : ''}).
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                  {realTests} mesure{realTests > 1 ? 's' : ''} réelle{realTests > 1 ? 's' : ''} Lighthouse
                </span>
                {simulatedTests > 0 && (
                  <span className="text-muted-foreground">
                    • {simulatedTests} test{simulatedTests > 1 ? 's' : ''} simulé{simulatedTests > 1 ? 's' : ''}{' '}
                    (repli, non mesuré{simulatedTests > 1 ? 's' : ''})
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Indexation automatique */}
        <p className="mb-6 text-center text-xs text-muted-foreground">
          📥 Tout site analysé via l'outil de test est <strong>automatiquement indexé</strong> ici et
          re-mesuré périodiquement (surveillance automatique active).
        </p>

        {/* Filtres par catégorie + bouton comparer */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setCompareSite(filtered[0] ?? null)
              setCompareOpen(true)
            }}
            disabled={filtered.length < 2}
          >
            <GitCompareArrows className="h-4 w-4" />
            Comparer (jusqu'à 4)
          </Button>
        </div>

        {/* Tableau classement */}
        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card" role="status" aria-label="Chargement du classement">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 border-b border-border/40 p-4 last:border-0" aria-hidden="true">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-4 flex-1 rounded-md bg-muted" />
                <div className="h-8 w-16 rounded-md bg-muted" />
              </div>
            ))}
            <p className="sr-only">Chargement du classement…</p>
          </div>
        ) : loadError ? (
          <LoadError
            title="Classement indisponible"
            message="Les scores n’ont pas pu être récupérés."
            onRetry={load}
          />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/50 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Trophy className="h-7 w-7 opacity-50" />
            </div>
            <div>
              {meta?.job?.running ? (
                <>
                  <p className="font-semibold">Mesures réelles en cours…</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Les scores Lighthouse de chaque site arrivent progressivement ({meta.job.done}/
                    {meta.job.total} terminés).
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold">Aucun site dans cette catégorie</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Essayez une autre catégorie ou ajoutez votre propre site via l'outil de test.
                  </p>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={() => setCategory('Tous')}
            >
              Voir tous les sites
            </Button>
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
                const t = trend(e.sparkline)
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

                    {/* Perf + sparkline */}
                    <div className="flex items-center justify-center gap-2 md:text-center">
                      <span className={cn('text-base font-bold md:text-lg', scoreColor)}>{e.performance}</span>
                      {e.sparkline && e.sparkline.length >= 2 && (
                        <span className={scoreColor}>
                          <Sparkline data={e.sparkline} width={50} height={18} stroke="currentColor" />
                        </span>
                      )}
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
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setCompareSite(selectedEntry)
                  setCompareOpen(true)
                }}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                Comparer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={remeasuring === selectedEntry.id}
                onClick={() => remeasure(selectedEntry.id, selectedEntry.name)}
              >
                {remeasuring === selectedEntry.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {remeasuring === selectedEntry.id ? 'Mesure en cours…' : 'Relancer la mesure'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modale de comparaison */}
      <CompareModal
        open={compareOpen}
        onOpenChange={setCompareOpen}
        sites={entries}
        initialSite={compareSite}
      />
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
