'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Calculator, Target, Zap, Clock, Gauge, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatWeight, formatSaving } from '@/lib/format'
import { ScoreRing } from './score-ring'

type Strategy = 'eco' | 'balanced' | 'aggressive'

const STRATEGIES: Record<Strategy, { label: string; description: string; targets: { lcp: number; cls: number; tbt: number; ttfb: number; weight: number } }> = {
  eco: {
    label: 'Éco',
    description: 'Site léger, idéal pour les blogs et sites vitrines',
    targets: { lcp: 2.5, cls: 0.1, tbt: 200, ttfb: 200, weight: 500 },
  },
  balanced: {
    label: 'Équilibré',
    description: 'Compromis performance/fonctionnalités pour la plupart des sites',
    targets: { lcp: 2.0, cls: 0.05, tbt: 150, ttfb: 150, weight: 800 },
  },
  aggressive: {
    label: 'Ultra-rapide',
    description: 'Performance maximale pour les sites critiques',
    targets: { lcp: 1.2, cls: 0.02, tbt: 50, ttfb: 80, weight: 300 },
  },
}

export function BudgetCalculator() {
  const [strategy, setStrategy] = React.useState<Strategy>('balanced')
  const [currentLcp, setCurrentLcp] = React.useState(2.8)
  const [currentWeight, setCurrentWeight] = React.useState(1100)

  const t = STRATEGIES[strategy].targets

  // Score estimé basé sur l'écart aux cibles
  const lcpScore = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, (currentLcp - t.lcp) / t.lcp) * 100)))
  const weightScore = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, (currentWeight - t.weight) / t.weight) * 100)))
  const overall = Math.round((lcpScore + weightScore) / 2)

  const savings = Math.max(0, currentWeight - t.weight)
  const lcpGain = Math.max(0, +(currentLcp - t.lcp).toFixed(2))

  return (
    <section id="budget" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-4/5 blur-[120px]" />
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Calculator className="h-4 w-4" />
            Outil interactif
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Calculateur de budget de performance
          </h2>
          <p className="mt-4 text-muted-foreground">
            Définissez vos objectifs de performance et voyez instantanément les
            optimisations nécessaires pour les atteindre.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            🧮 Estimation indicative (modèle de calcul) — ne remplace pas une mesure Lighthouse
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl">
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            {/* Colonne gauche : configuration */}
            <div className="border-b border-border/60 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <h3 className="mb-5 text-base font-semibold">1. Choisissez votre stratégie</h3>

              {/* Stratégies */}
              <div className="mb-6 grid grid-cols-3 gap-2">
                {(Object.keys(STRATEGIES) as Strategy[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setStrategy(key)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all',
                      strategy === key
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 hover:border-primary/40'
                    )}
                  >
                    <span className={cn('text-sm font-semibold', strategy === key && 'text-primary')}>
                      {STRATEGIES[key].label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mb-6 text-xs text-muted-foreground">{STRATEGIES[strategy].description}</p>

              {/* Cibles */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <TargetCard icon={Clock} label="LCP cible" value={`${t.lcp}s`} />
                <TargetCard icon={Gauge} label="CLS cible" value={t.cls.toFixed(2)} />
                <TargetCard icon={Zap} label="TBT cible" value={`${t.tbt}ms`} />
                <TargetCard icon={Clock} label="TTFB cible" value={`${t.ttfb}ms`} />
              </div>

              {/* Sliders pour l'état actuel */}
              <h3 className="mb-4 text-base font-semibold">2. Votre site actuel</h3>

              <div className="space-y-5">
                <SliderInput
                  label="LCP actuel"
                  value={currentLcp}
                  min={0.5}
                  max={6}
                  step={0.1}
                  unit="s"
                  onChange={setCurrentLcp}
                  target={t.lcp}
                />
                <SliderInput
                  label="Poids de la page"
                  value={currentWeight}
                  min={100}
                  max={4000}
                  step={50}
                  unit=" Ko"
                  onChange={setCurrentWeight}
                  target={t.weight}
                />
              </div>
            </div>

            {/* Colonne droite : résultats */}
            <div className="flex flex-col items-center justify-center gap-5 bg-muted/20 p-6 sm:p-8">
              <h3 className="self-start text-base font-semibold">3. Score estimé & gains</h3>

              {/* Score estimé */}
              <ScoreRing score={overall} size={150} label="Score estimé" />

              {/* Gains potentiels */}
              <div className="grid w-full grid-cols-2 gap-3">
                <GainCard
                  icon={TrendingDown}
                  label="Réduction de poids"
                  value={formatSaving(savings)}
                  positive={savings > 0}
                />
                <GainCard
                  icon={Clock}
                  label="Gain de temps LCP"
                  value={lcpGain > 0 ? `-${lcpGain}s` : '0 — objectif atteint'}
                  positive={lcpGain > 0}
                />
              </div>

              {/* Recommandations */}
              <div className="w-full rounded-2xl border border-border/60 bg-card p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Recommandations
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {currentLcp > t.lcp && (
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-primary">→</span>
                      Réduisez votre LCP de {lcpGain}s (optimisez images critiques, preload)
                    </li>
                  )}
                  {currentWeight > t.weight && (
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-primary">→</span>
                      Réduisez le poids de {formatWeight(savings)} (WebP, code-splitting)
                    </li>
                  )}
                  {currentLcp <= t.lcp && currentWeight <= t.weight && (
                    <li className="flex items-start gap-1.5 text-primary">
                      <span className="mt-0.5">✓</span>
                      Excellents ! Vous respectez déjà le budget {STRATEGIES[strategy].label}.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TargetCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="font-mono text-sm font-bold text-primary">{value}</p>
    </div>
  )
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  target,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  target: number
}) {
  const good = value <= target
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn('font-mono text-sm font-bold', good ? 'text-primary' : 'text-chart-4')}>
          {unit.trim() === 'Ko' ? formatWeight(value) : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{unit.trim() === 'Ko' ? formatWeight(min) : `${min}${unit}`}</span>
        <span className={good ? 'text-primary' : 'text-chart-4'}>
          Cible : {unit.trim() === 'Ko' ? formatWeight(target) : `${target}${unit}`}
        </span>
        <span>{unit.trim() === 'Ko' ? formatWeight(max) : `${max}${unit}`}</span>
      </div>
    </div>
  )
}

function GainCard({
  icon: Icon,
  label,
  value,
  positive,
}: {
  icon: React.ElementType
  label: string
  value: string
  positive: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border/60 bg-card p-4 text-center"
    >
      <div className={cn('mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg', positive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  )
}
