'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Activity } from 'lucide-react'

interface StatusWidgetProps {
  compact?: boolean
}

export function StatusWidget({ compact = false }: StatusWidgetProps) {
  // Statut de démonstration (en production, viendrait d'une API de monitoring réelle)
  const status = 'operational' // operational | degraded | outage
  const uptime = 99.98
  const responseTime = 42 // ms

  const color =
    status === 'operational'
      ? 'text-primary bg-primary/10'
      : status === 'degraded'
      ? 'text-chart-4 bg-chart-4/10'
      : 'text-destructive bg-destructive/10'

  if (compact) {
    return (
      <a
        href="/status"
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40"
        aria-label="Statut du système"
      >
        <span className={`flex h-2 w-2 rounded-full ${status === 'operational' ? 'bg-primary' : 'bg-chart-4'}`}>
          <span className="h-full w-full animate-ping rounded-full opacity-75" style={{ animationDuration: '2s' }} />
        </span>
        <span className="text-muted-foreground">Tous les systèmes opérationnels</span>
        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-400">
          démo
        </span>
      </a>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Statut du système</p>
            <p className="text-xs text-muted-foreground">
              Surveillance des API Vélocita • données de démonstration
            </p>
          </div>
        </div>
        <CheckCircle2 className={`h-5 w-5 ${status === 'operational' ? 'text-primary' : 'text-chart-4'}`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Disponibilité</p>
          <p className="font-bold text-primary">{uptime}%</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <p className="text-muted-foreground">Temps de réponse</p>
          <p className="font-bold">{responseTime}ms</p>
        </div>
      </div>
    </motion.div>
  )
}
