'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Globe, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentItem {
  id: string
  url: string
  name: string
  performance: number
  lcp: number
  cls: number
  device: string
  region: string
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `il y a ${days} j`
}

export function RecentSearches({ onPick }: { onPick?: (url: string) => void }) {
  const [items, setItems] = React.useState<RecentItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/recent')
        const d = await res.json()
        if (active && d?.recent) setItems(d.recent)
      } catch {
        // silencieux
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading || items.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground">
          Analyses récentes
        </h3>
        <span className="text-xs text-muted-foreground/60">({items.length})</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-custom">
        {items.map((item) => {
          const scoreColor =
            item.performance >= 90 ? 'text-primary' : item.performance >= 50 ? 'text-chart-4' : 'text-destructive'
          const ringColor =
            item.performance >= 90 ? 'border-primary/40 bg-primary/5' : item.performance >= 50 ? 'border-chart-4/40 bg-chart-4/5' : 'border-destructive/40 bg-destructive/5'
          return (
            <button
              key={item.id}
              onClick={() => onPick?.(item.url)}
              className={cn(
                'group flex min-w-[220px] shrink-0 flex-col gap-2 rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                ringColor
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-semibold">{item.name}</span>
                </div>
                <span className={cn('shrink-0 text-lg font-bold tabular-nums', scoreColor)}>
                  {item.performance}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>LCP {item.lcp}s</span>
                <span>CLS {item.cls.toFixed(3)}</span>
                <span>{timeAgo(item.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Réanalyser
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
