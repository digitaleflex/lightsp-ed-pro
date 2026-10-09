'use client'

import { motion } from 'framer-motion'

interface WaterfallItem {
  name: string
  type: string
  color: string
  startTime: number
  duration: number
  size: number
}

export function WaterfallChart({ items, totalDuration }: { items: WaterfallItem[]; totalDuration: number }) {
  const maxEnd = Math.max(...items.map((i) => i.startTime + i.duration), totalDuration)

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* En-tête axe temps */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-medium text-muted-foreground">
        <span>Ressource</span>
        <div className="flex items-center gap-4">
          <span>0ms</span>
          <span>{Math.round(maxEnd / 2)}ms</span>
          <span>{Math.round(maxEnd)}ms</span>
        </div>
      </div>

      {/* Lignes */}
      <div className="divide-y divide-border/40">
        {items.map((item, i) => {
          const startPct = (item.startTime / maxEnd) * 100
          const widthPct = (item.duration / maxEnd) * 100
          return (
            <div key={item.name} className="flex items-center gap-3 px-4 py-1.5 text-xs hover:bg-accent/30">
              {/* Nom + type */}
              <div className="flex w-32 shrink-0 items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="truncate font-mono text-[10px] text-muted-foreground">{item.name}</span>
              </div>

              {/* Barre timeline */}
              <div className="relative h-5 flex-1 rounded bg-muted/40">
                <motion.div
                  className="absolute top-0.5 h-4 rounded"
                  style={{
                    backgroundColor: item.color,
                    left: `${startPct}%`,
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: `${widthPct}%`, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                />
                {/* Étiquette durée */}
                {widthPct > 8 && (
                  <span
                    className="absolute top-0.5 flex h-4 items-center px-1 text-[9px] font-medium text-white"
                    style={{ left: `${startPct}%` }}
                  >
                    {item.duration}ms
                  </span>
                )}
              </div>

              {/* Taille */}
              <span className="w-14 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                {(item.size / 1024).toFixed(1)} Ko
              </span>
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 bg-muted/30 px-4 py-2">
        {items.reduce<string[]>((types, item) => {
          if (!types.includes(item.type)) types.push(item.type)
          return types
        }, []).map((type) => {
          const sample = items.find((i) => i.type === type)
          return (
            <span key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: sample?.color }} />
              {type}
            </span>
          )
        })}
        <span className="ml-auto text-[10px] text-muted-foreground">
          Durée totale : {Math.round(maxEnd)}ms
        </span>
      </div>
    </div>
  )
}
