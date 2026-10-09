'use client'

import { motion } from 'framer-motion'
import { Globe, Activity, Gauge, Users } from 'lucide-react'
import { AnimatedCounter } from './reading-progress'
import { cn } from '@/lib/utils'

const STATS = [
  { icon: Globe, label: 'Sites surveillés', value: 12000, suffix: '+', color: 'text-chart-2' },
  { icon: Activity, label: 'Tests réalisés', value: 3, suffix: ',2 M', color: 'text-chart-1' },
  { icon: Gauge, label: 'Score moyen', value: 87, suffix: ' / 100', color: 'text-chart-3' },
  { icon: Users, label: 'Utilisateurs actifs', value: 4500, suffix: '', color: 'text-chart-4' },
] as const

const formatNumber = (v: number) => v.toLocaleString('fr-FR')

export function StatsBanner() {
  return (
    <section className="relative border-y border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
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
