'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GitCompareArrows, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreRing } from './score-ring'
import { cn } from '@/lib/utils'

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

interface CompareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sites: LeaderEntry[]
  initialSite?: LeaderEntry | null
}

export function CompareModal({ open, onOpenChange, sites, initialSite }: CompareModalProps) {
  const [siteA, setSiteA] = React.useState<LeaderEntry | null>(initialSite)
  const [siteB, setSiteB] = React.useState<LeaderEntry | null>(null)
  const [picker, setPicker] = React.useState<'A' | 'B' | null>(null)

  React.useEffect(() => {
    if (open) {
      setSiteA(initialSite ?? sites[0] ?? null)
      setSiteB(sites[1] ?? null)
    }
  }, [open, initialSite, sites])

  React.useEffect(() => {
    if (!open) {
      setPicker(null)
    }
  }, [open])

  // Fermer au clic sur Échap
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const availableForB = sites.filter((s) => s.id !== siteA?.id)
  const availableForA = sites.filter((s) => s.id !== siteB?.id)

  function choose(site: LeaderEntry) {
    if (picker === 'A') setSiteA(site)
    else if (picker === 'B') setSiteB(site)
    setPicker(null)
  }

  const rows: { label: string; a?: number | string; b?: number | string; better: 'lower' | 'higher'; format?: (v: number) => string }[] = [
    { label: 'Performance', a: siteA?.performance, b: siteB?.performance, better: 'higher' },
    { label: 'Accessibilité', a: siteA?.accessibility, b: siteB?.accessibility, better: 'higher' },
    { label: 'SEO', a: siteA?.seo, b: siteB?.seo, better: 'higher' },
    { label: 'Bonnes pratiques', a: siteA?.bestPractices, b: siteB?.bestPractices, better: 'higher' },
    { label: 'LCP (s)', a: siteA?.lcp, b: siteB?.lcp, better: 'lower', format: (v) => `${v}s` },
    { label: 'TBT (ms)', a: siteA?.tbt, b: siteB?.tbt, better: 'lower' },
    { label: 'CLS', a: siteA?.cls, b: siteB?.cls, better: 'lower', format: (v) => v.toFixed(3) },
    { label: 'Poids (Mo)', a: siteA?.totalWeight ? siteA.totalWeight / 1024 : undefined, b: siteB?.totalWeight ? siteB.totalWeight / 1024 : undefined, better: 'lower', format: (v) => v.toFixed(1) },
  ]

  const winner =
    siteA && siteB
      ? siteA.performance > siteB.performance
        ? siteA
        : siteB.performance > siteA.performance
        ? siteB
        : null
      : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Boîte de dialogue */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GitCompareArrows className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Comparer deux sites</h2>
                  <p className="text-xs text-muted-foreground">
                    Comparez les métriques de performance côte à côte
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
              {/* Sélecteurs */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <SiteSlot label="Site A" site={siteA} onPick={() => setPicker('A')} active={picker === 'A'} color="text-chart-1" />
                <SiteSlot label="Site B" site={siteB} onPick={() => setPicker('B')} active={picker === 'B'} color="text-chart-4" />
              </div>

              {/* Gagnant */}
              {winner && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-sm">
                  <span className="font-semibold text-primary">{winner.name}</span>{' '}
                  est en tête avec un score de {winner.performance}/100
                </div>
              )}

              {/* Comparaison */}
              {siteA && siteB ? (
                <div className="overflow-hidden rounded-2xl border border-border/60">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="text-left truncate">{siteA.name}</span>
                    <span className="px-2 text-center">Métrique</span>
                    <span className="text-right truncate">{siteB.name}</span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {rows.map((row) => {
                      const a = typeof row.a === 'number' ? row.a : undefined
                      const b = typeof row.b === 'number' ? row.b : undefined
                      const aWins = a !== undefined && b !== undefined && (row.better === 'higher' ? a > b : a < b)
                      const bWins = a !== undefined && b !== undefined && (row.better === 'higher' ? b > a : b < a)
                      const fmt = (v: number) => (row.format ? row.format(v) : String(v))
                      return (
                        <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 text-sm">
                          <span className={cn('text-left font-semibold tabular-nums', aWins && 'text-chart-2')}>
                            {a !== undefined ? fmt(a) : '—'}
                            {aWins && <span className="ml-1 text-[10px] uppercase">gagnant</span>}
                          </span>
                          <span className="px-2 text-center text-xs text-muted-foreground">{row.label}</span>
                          <span className={cn('text-right font-semibold tabular-nums', bWins && 'text-chart-2')}>
                            {b !== undefined ? fmt(b) : '—'}
                            {bWins && <span className="ml-1 text-[10px] uppercase">gagnant</span>}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Sélectionnez deux sites à comparer</p>
                </div>
              )}
            </div>

            {/* Sélecteur de site */}
            <AnimatePresence>
              {picker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="border-t border-border/60 bg-muted/30 p-4"
                >
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Choisissez un site pour le slot {picker}
                  </p>
                  <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto scrollbar-custom sm:grid-cols-3">
                    {(picker === 'A' ? availableForA : availableForB).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => choose(s)}
                        className="truncate rounded-lg border border-border/60 bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SiteSlot({
  label,
  site,
  onPick,
  active,
  color,
}: {
  label: string
  site: LeaderEntry | null
  onPick: () => void
  active: boolean
  color: string
}) {
  return (
    <button
      onClick={onPick}
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all',
        active ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/40'
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {site ? (
        <>
          <ScoreRing score={site.performance} size={96} animate={false} />
          <div className="text-center">
            <p className="truncate text-sm font-semibold">{site.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{site.url}</p>
          </div>
        </>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-border text-xs text-muted-foreground">
          Choisir
        </div>
      )}
    </button>
  )
}
