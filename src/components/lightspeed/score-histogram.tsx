'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface HistoryPoint {
  date: string
  score: number
  lcp: number
  cls: number
}

export function ScoreHistogram({ history }: { history: HistoryPoint[] }) {
  // Grouper les scores par tranche de 10
  const buckets = [
    { range: '0-9', min: 0, max: 9, count: 0, color: 'var(--color-destructive)' },
    { range: '10-19', min: 10, max: 19, count: 0, color: 'var(--color-destructive)' },
    { range: '20-29', min: 20, max: 29, count: 0, color: 'var(--color-destructive)' },
    { range: '30-39', min: 30, max: 39, count: 0, color: 'var(--color-chart-4)' },
    { range: '40-49', min: 40, max: 49, count: 0, color: 'var(--color-chart-4)' },
    { range: '50-59', min: 50, max: 59, count: 0, color: 'var(--color-chart-4)' },
    { range: '60-69', min: 60, max: 69, count: 0, color: 'var(--color-chart-4)' },
    { range: '70-79', min: 70, max: 79, count: 0, color: 'var(--color-chart-4)' },
    { range: '80-89', min: 80, max: 89, count: 0, color: 'var(--color-chart-2)' },
    { range: '90-100', min: 90, max: 100, count: 0, color: 'var(--color-primary)' },
  ]

  history.forEach((h) => {
    const b = buckets.find((b) => h.score >= b.min && h.score <= b.max)
    if (b) b.count++
  })

  const total = history.length || 1
  const goodCount = buckets.slice(8).reduce((s, b) => s + b.count, 0)
  const avgCount = buckets.slice(5, 8).reduce((s, b) => s + b.count, 0)
  const poorCount = buckets.slice(0, 5).reduce((s, b) => s + b.count, 0)

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-chart-1" />
          Distribution des scores
        </CardTitle>
        <CardDescription>
          Répartition par tranche sur {history.length} mesures
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats de répartition */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-center">
            <p className="text-lg font-bold text-primary">{Math.round((goodCount / total) * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">Bon (≥80)</p>
          </div>
          <div className="rounded-lg border border-chart-4/20 bg-chart-4/5 p-2.5 text-center">
            <p className="text-lg font-bold text-chart-4">{Math.round((avgCount / total) * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">Moyen (50-79)</p>
          </div>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-center">
            <p className="text-lg font-bold text-destructive">{Math.round((poorCount / total) * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">Faible (&lt;50)</p>
          </div>
        </div>

        {/* Histogramme */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v} mesure${v > 1 ? 's' : ''}`, 'Score']}
                labelFormatter={(l) => `Tranche ${l}`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {buckets.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
