'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

interface RadarMetric {
  metric: string
  score: number // 0-100 (100 = excellent)
  fullMark: number
}

export function CoreWebVitalsRadar({
  metrics,
  target,
}: {
  metrics: RadarMetric[]
  target?: RadarMetric[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/60 bg-card p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <Target className="h-4 w-4 text-chart-3" />
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Radar de performance
        </h4>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={metrics} outerRadius="75%">
            <PolarGrid stroke="var(--color-border)" opacity={0.5} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
            />
            {target && (
              <Radar
                name="Cible"
                dataKey="score"
                stroke="var(--color-chart-4)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="var(--color-chart-4)"
                fillOpacity={0.08}
              />
            )}
            <Radar
              name="Votre site"
              dataKey="score"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="var(--color-primary)"
              fillOpacity={0.25}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}/100`, '']}
            />
            {target && <Legend wrapperStyle={{ fontSize: 11 }} />}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
