'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Globe, Activity, Gauge, Mail } from 'lucide-react'
import { AnimatedCounter } from './reading-progress'
import { cn } from '@/lib/utils'

interface Stats {
  sites: number
  tests: number
  avgScore: number
  subscribers: number
}

export function StatsBanner() {
  const [stats, setStats] = React.useState<Stats | null>(null)

  React.useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          setStats({ sites: d.sites, tests: d.tests, avgScore: d.avgScore, subscribers: d.subscribers })
        }
      })
      .catch(() => {})
  }, [])

  const items = [
    { icon: Globe, label: 'Sites surveillés', value: stats?.sites ?? 0, suffix: '', color: 'text-chart-2' },
    { icon: Activity, label: 'Tests réalisés', value: stats?.tests ?? 0, suffix: '', color: 'text-chart-1' },
    { icon: Gauge, label: 'Score moyen', value: stats?.avgScore ?? 0, suffix: ' / 100', color: 'text-chart-3' },
    { icon: Mail, label: 'Abonnés newsletter', value: stats?.subscribers ?? 0, suffix: '', color: 'text-chart-4' },
  ]

  const formatNumber = (v: number) => v.toLocaleString('fr-FR')

  return (
    <section className="relative border-y border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn('text-xl font-bold sm:text-2xl', s.color)}>
                  <AnimatedCounter
                    value={s.value}
                    format={s.value >= 1000 ? formatNumber : undefined}
                  />
                  {s.suffix}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
