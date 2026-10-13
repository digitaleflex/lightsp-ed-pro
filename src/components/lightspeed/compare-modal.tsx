'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GitCompareArrows } from 'lucide-react'
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

const MAX_SITES = 4

export function CompareModal({ open, onOpenChange, sites, initialSite }: CompareModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [pickerIndex, setPickerIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (open) {
      const base: string[] = []
      if (initialSite) base.push(initialSite.id)
      for (const s of sites) {
        if (base.length >= MAX_SITES) break
        if (!base.includes(s.id)) base.push(s.id)
      }
      setSelectedIds(base)
    }
  }, [open, initialSite, sites])

  React.useEffect(() => {
    if (!open) setPickerIndex(null)
  }, [open])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const selected = selectedIds
    .map((id) => sites.find((s) => s.id === id))
    .filter((s): s is LeaderEntry => Boolean(s))

  function choose(site: LeaderEntry) {
    if (pickerIndex === null) return
    setSelectedIds((prev) => {
      const next = [...prev]
      next[pickerIndex] = site.id
      return [...new Set(next)].slice(0, MAX_SITES)
    })
    setPickerIndex(null)
  }

  function removeAt(index: number) {
    setSelectedIds((prev) => prev.filter((_, i) => i !== index))
  }

  const rows: { label: string; get: (s: LeaderEntry) => number; better: 'lower' | 'higher'; format: (v: number) => string }[] = [
    { label: 'Performance', get: (s) => s.performance, better: 'higher', format: (v) => String(v) },
    { label: 'Accessibilité', get: (s) => s.accessibility, better: 'higher', format: (v) => String(v) },
    { label: 'SEO', get: (s) => s.seo, better: 'higher', format: (v) => String(v) },
    { label: 'Bonnes pratiques', get: (s) => s.bestPractices, better: 'higher', format: (v) => String(v) },
    { label: 'LCP (s)', get: (s) => s.lcp, better: 'lower', format: (v) => `${v}s` },
    { label: 'TBT (ms)', get: (s) => s.tbt, better: 'lower', format: (v) => String(v) },
    { label: 'CLS', get: (s) => s.cls, better: 'lower', format: (v) => v.toFixed(3) },
    { label: 'Poids (Mo)', get: (s) => s.totalWeight / 1024, better: 'lower', format: (v) => v.toFixed(1) },
  ]

  const winner = selected.length >= 2 ? selected.reduce((a, b) => (b.performance > a.performance ? b : a)) : null
  const gridCols = `grid-cols-[110px_repeat(${Math.max(selected.length, 1)},1fr)]`

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GitCompareArrows className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Comparer jusqu'à 4 sites</h2>
                  <p className="text-xs text-muted-foreground">{selected.length}/4 sélectionnés — cliquez sur un slot pour changer</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-custom">
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => {
                  const site = selected[i] ?? null
                  return (
                    <div key={i} className="relative">
                      <button
                        onClick={() => setPickerIndex(i)}
                        className={cn(
                          'flex w-full flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all',
                          pickerIndex === i ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/40'
                        )}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Site {String.fromCharCode(65 + i)}</span>
                        {site ? (
                          <>
                            <ScoreRing score={site.performance} size={72} animate={false} />
                            <p className="truncate text-xs font-semibold">{site.name}</p>
                          </>
                        ) : (
                          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-dashed border-border text-[11px] text-muted-foreground">
                            Choisir
                          </div>
                        )}
                      </button>
                      {site && selected.length > 2 && (
                        <button onClick={() => removeAt(i)} className="absolute right-1 top-1 rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground hover:text-foreground" aria-label="Retirer">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {winner && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-sm">
                  <span className="font-semibold text-primary">{winner.name}</span> est en tête avec {winner.performance}/100
                </div>
              )}

              {selected.length >= 2 ? (
                <div className="overflow-x-auto rounded-2xl border border-border/60">
                  <div className={cn('grid min-w-[560px] gap-2 bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground', gridCols)}>
                    <span>Métrique</span>
                    {selected.map((s) => (
                      <span key={s.id} className="truncate text-right">{s.name}</span>
                    ))}
                  </div>
                  <div className="divide-y divide-border/60">
                    {rows.map((row) => {
                      const values = selected.map((s) => row.get(s))
                      const best = row.better === 'higher' ? Math.max(...values) : Math.min(...values)
                      return (
                        <div key={row.label} className={cn('grid min-w-[560px] items-center gap-2 px-4 py-3 text-sm', gridCols)}>
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                          {selected.map((s, idx) => {
                            const v = values[idx]
                            const isBest = v === best && new Set(values).size > 1
                            return (
                              <span key={s.id} className={cn('text-right font-semibold tabular-nums', isBest && 'text-chart-2')}>
                                {row.format(v)}
                                {isBest && <span className="ml-1 text-[10px] uppercase">gagnant</span>}
                              </span>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Sélectionnez au moins 2 sites à comparer</p>
              )}
            </div>

            <AnimatePresence>
              {pickerIndex !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="border-t border-border/60 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Choisissez un site pour le slot {String.fromCharCode(65 + pickerIndex)}</p>
                  <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto scrollbar-custom sm:grid-cols-4">
                    {sites.filter((s) => !selectedIds.includes(s.id)).map((s) => (
                      <button key={s.id} onClick={() => choose(s)} className="truncate rounded-lg border border-border/60 bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent">
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
