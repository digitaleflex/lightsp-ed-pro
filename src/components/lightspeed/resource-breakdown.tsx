'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

interface Resource {
  name: string
  size: number
  color: string
  requests: number
}

export function ResourceBreakdown({ resources }: { resources: Resource[] }) {
  const total = resources.reduce((sum, r) => sum + r.size, 0)
  const radius = 80
  const strokeWidth = 28
  const circumference = 2 * Math.PI * radius

  // Pré-calculer les segments (dash + offset) de manière pure via reduce
  const segments = React.useMemo(() => {
    return resources.reduce<
      { key: string; index: number; dash: number; gap: number; offset: number; color: string }[]
    >((acc, r, i) => {
      const fraction = r.size / total
      const dash = fraction * circumference
      const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0
      return [
        ...acc,
        {
          key: r.name,
          index: i,
          dash,
          gap: circumference - dash,
          offset: prevOffset,
          color: r.color,
        },
      ]
    }, [])
  }, [resources, total, circumference])

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      {/* Donut SVG */}
      <div className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center">
        <svg
          width={180}
          height={180}
          viewBox="0 0 180 180"
          className="-rotate-90"
        >
          {/* Anneau de fond */}
          <circle
            cx={90}
            cy={90}
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          {/* Segments */}
          {segments.map((s) => (
            <motion.circle
              key={s.key}
              cx={90}
              cy={90}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: s.index * 0.08 }}
            />
          ))}
        </svg>
        {/* Centre : poids total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{(total / 1024).toFixed(1)}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Mo total
          </span>
        </div>
      </div>

      {/* Légende */}
      <div className="flex-1 space-y-2.5">
        {resources.map((r) => {
          const pct = Math.round((r.size / total) * 100)
          return (
            <div key={r.name} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: r.color }}
              />
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(r.size / 1024).toFixed(2)} Mo • {r.requests} req
                </span>
              </div>
              <span className="w-9 text-right text-sm font-semibold tabular-nums">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
