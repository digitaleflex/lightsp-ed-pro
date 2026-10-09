'use client'

import { motion } from 'framer-motion'
import { Trophy, Zap, Globe, Crown, Rocket, Target, Award, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const BADGES = [
  {
    icon: Rocket,
    title: 'Démarrage éclair',
    description: 'Premier test de vitesse réalisé',
    unlocked: true,
    color: 'from-chart-2 to-primary',
  },
  {
    icon: Target,
    title: 'Score parfait',
    description: 'Atteindre un score de 100/100',
    unlocked: true,
    color: 'from-chart-4 to-chart-5',
  },
  {
    icon: Globe,
    title: 'Globe-trotter',
    description: 'Tester depuis les 3 régions',
    unlocked: true,
    color: 'from-chart-3 to-chart-1',
  },
  {
    icon: TrendingUp,
    title: 'Surveillance continue',
    description: '7 jours de monitoring sans interruption',
    unlocked: true,
    color: 'from-primary to-chart-2',
  },
  {
    icon: Crown,
    title: 'Top 10',
    description: 'Atteindre le top 10 du classement',
    unlocked: false,
    color: 'from-chart-4 to-chart-1',
  },
  {
    icon: Zap,
    title: 'Vitesse extrême',
    description: 'LCP inférieur à 1 seconde',
    unlocked: false,
    color: 'from-chart-5 to-chart-4',
  },
] as const

export function Achievements() {
  const unlockedCount = BADGES.filter((b) => b.unlocked).length

  return (
    <section id="achievements" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-4/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Award className="h-4 w-4" />
            Succès & badges
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Débloquez des succès en optimisant
          </h2>
          <p className="mt-4 text-muted-foreground">
            Gagnez des badges au fil de vos analyses et surveillez votre
            progression. Plus vous optimisez, plus vous montrez votre expertise.
          </p>

          {/* Progression globale */}
          <div className="mx-auto mt-6 max-w-xs">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">{unlockedCount} / {BADGES.length} succès débloqués</span>
              <span className="text-muted-foreground">{Math.round((unlockedCount / BADGES.length) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full speed-gradient"
                initial={{ width: 0 }}
                whileInView={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Grille de badges */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className={cn(
                'group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all',
                b.unlocked
                  ? 'border-primary/30 hover:border-primary/50 hover:shadow-lg'
                  : 'border-border/40 opacity-60'
              )}
            >
              {/* Halo pour les badges débloqués */}
              {b.unlocked && (
                <div
                  className={cn(
                    'pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40',
                    b.color
                  )}
                />
              )}

              <div className="relative flex items-start gap-4">
                {/* Icône badge */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg',
                      b.unlocked
                        ? `bg-gradient-to-br ${b.color} text-white`
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {b.unlocked ? (
                      <b.icon className="h-7 w-7" strokeWidth={1.8} />
                    ) : (
                      <Trophy className="h-7 w-7 opacity-50" />
                    )}
                  </div>
                  {/* Indicateur débloqué */}
                  {b.unlocked && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-chart-2 text-[10px] font-bold text-white ring-2 ring-card">
                      ✓
                    </span>
                  )}
                </div>

                {/* Texte */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                  <span
                    className={cn(
                      'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                      b.unlocked
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {b.unlocked ? 'Débloqué' : 'Verrouillé'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
