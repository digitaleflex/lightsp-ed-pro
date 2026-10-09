'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Trophy, Zap, RotateCcw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GameSite {
  name: string
  score: number
  lcp: number
}

// Paires de sites réels avec scores Lighthouse (simulés mais réalistes)
const PAIRS: { a: GameSite; b: GameSite }[] = [
  { a: { name: 'Vercel', score: 99, lcp: 0.9 }, b: { name: 'Stripe', score: 94, lcp: 1.4 } },
  { a: { name: 'Figma', score: 97, lcp: 1.2 }, b: { name: 'Notion', score: 78, lcp: 3.1 } },
  { a: { name: 'GitHub', score: 72, lcp: 2.8 }, b: { name: 'Linear', score: 95, lcp: 1.1 } },
  { a: { name: 'Next.js', score: 96, lcp: 1.3 }, b: { name: 'Apple', score: 89, lcp: 1.9 } },
  { a: { name: 'Tailwind', score: 93, lcp: 1.6 }, b: { name: 'Shopify', score: 61, lcp: 3.5 } },
  { a: { name: 'Cloudflare', score: 98, lcp: 1.0 }, b: { name: 'Netflix', score: 76, lcp: 2.9 } },
]

export function SpeedGame() {
  const [pairIdx, setPairIdx] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const [choice, setChoice] = React.useState<'a' | 'b' | null>(null)
  const [score, setScore] = React.useState(0)
  const [streak, setStreak] = React.useState(0)
  const [bestStreak, setBestStreak] = React.useState(0)
  const [finished, setFinished] = React.useState(false)

  const pair = PAIRS[pairIdx]
  const winner = pair.a.score >= pair.b.score ? 'a' : 'b'
  const isCorrect = choice === winner

  function choose(side: 'a' | 'b') {
    if (revealed) return
    setChoice(side)
    setRevealed(true)
    if (side === winner) {
      setScore((s) => s + 1)
      setStreak((s) => {
        const ns = s + 1
        setBestStreak((b) => Math.max(b, ns))
        return ns
      })
    } else {
      setStreak(0)
    }
  }

  function next() {
    if (pairIdx < PAIRS.length - 1) {
      setPairIdx((p) => p + 1)
      setRevealed(false)
      setChoice(null)
    } else {
      setFinished(true)
    }
  }

  function restart() {
    setPairIdx(0)
    setRevealed(false)
    setChoice(null)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setFinished(false)
  }

  return (
    <section id="jeu" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-5/5 blur-[120px]" />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Gamepad2 className="h-4 w-4" />
            Mini-jeu
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lequel est le plus rapide ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Devinez quel site a le meilleur score Lighthouse. Testez votre
            intuition et enchaînez les bonnes réponses !
          </p>
        </div>

        {/* Stats du jeu */}
        <div className="mx-auto mb-6 flex max-w-md items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Trophy className="h-4 w-4" />
            Score : {score}/{PAIRS.length}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-chart-4/10 px-3 py-1.5 text-sm font-medium text-chart-4">
            <Zap className="h-4 w-4" />
            Série : {streak}
          </div>
          {bestStreak > 0 && (
            <div className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
              Record : {bestStreak}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {finished ? (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full speed-gradient text-white shadow-lg">
                <Trophy className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">
                {score === PAIRS.length ? 'Parfait ! 🏆' : score >= PAIRS.length / 2 ? 'Bien joué !' : 'Continue à t\'entraîner !'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                Vous avez obtenu <span className="font-bold text-primary">{score}</span> sur {PAIRS.length}
                {bestStreak >= 3 && (
                  <> avec une série record de <span className="font-bold text-chart-4">{bestStreak}</span> ✨</>
                )}
              </p>
              <Button onClick={restart} className="gap-2 shadow-lg">
                <RotateCcw className="h-4 w-4" />
                Rejouer
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={pairIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-xl sm:p-8"
            >
              {/* Compteur */}
              <p className="mb-4 text-center text-xs text-muted-foreground">
                Duel {pairIdx + 1} / {PAIRS.length}
              </p>

              {/* Duel */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                {/* Site A */}
                <GameCard
                  site={pair.a}
                  revealed={revealed}
                  isChoice={choice === 'a'}
                  isWinner={winner === 'a'}
                  onClick={() => choose('a')}
                />

                {/* VS */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl font-black text-muted-foreground/40 sm:text-2xl">VS</span>
                </div>

                {/* Site B */}
                <GameCard
                  site={pair.b}
                  revealed={revealed}
                  isChoice={choice === 'b'}
                  isWinner={winner === 'b'}
                  onClick={() => choose('b')}
                />
              </div>

              {/* Feedback + bouton suivant */}
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className={cn(
                      'mb-4 rounded-xl border p-4 text-center',
                      isCorrect ? 'border-primary/30 bg-primary/5' : 'border-chart-4/30 bg-chart-4/5'
                    )}>
                      <p className="flex items-center justify-center gap-2 text-sm font-semibold">
                        {isCorrect ? (
                          <><Check className="h-4 w-4 text-primary" /> Correct ! +1 point</>
                        ) : (
                          <><X className="h-4 w-4 text-chart-4" /> Raté ! Le plus rapide était {winner === 'a' ? pair.a.name : pair.b.name}</>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {pair.a.name} : {pair.a.score}/100 (LCP {pair.a.lcp}s) • {pair.b.name} : {pair.b.score}/100 (LCP {pair.b.lcp}s)
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={next} className="gap-1.5 shadow-lg">
                        {pairIdx < PAIRS.length - 1 ? 'Duel suivant' : 'Voir mon score'}
                        →
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function GameCard({
  site,
  revealed,
  isChoice,
  isWinner,
  onClick,
}: {
  site: GameSite
  revealed: boolean
  isChoice: boolean
  isWinner: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all sm:p-7',
        !revealed && 'hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg cursor-pointer',
        revealed && isWinner && 'border-primary bg-primary/5',
        revealed && isChoice && !isWinner && 'border-chart-4 bg-chart-4/5',
        revealed && !isWinner && !isChoice && 'border-border/40 opacity-50',
        !revealed && 'border-border/60 bg-background/40'
      )}
    >
      {/* Icône */}
      <div className={cn(
        'flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold transition-colors',
        !revealed && 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
        revealed && isWinner && 'bg-primary text-primary-foreground',
        revealed && !isWinner && 'bg-muted text-muted-foreground'
      )}>
        {site.name.charAt(0)}
      </div>

      {/* Nom */}
      <span className="text-base font-bold sm:text-lg">{site.name}</span>

      {/* Score (révélé) */}
      {revealed ? (
        <div className="text-center">
          <p className={cn(
            'text-3xl font-black',
            site.score >= 90 ? 'text-primary' : site.score >= 50 ? 'text-chart-4' : 'text-destructive'
          )}>
            {site.score}
          </p>
          <p className="text-[10px] uppercase text-muted-foreground">Score</p>
          <p className="mt-1 text-xs text-muted-foreground">LCP {site.lcp}s</p>
        </div>
      ) : (
        <div className="flex h-[68px] items-center text-xs text-muted-foreground">
          Cliquez pour deviner
        </div>
      )}

      {/* Badge résultat */}
      {revealed && isWinner && (
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
      {revealed && isChoice && !isWinner && (
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-chart-4 text-white shadow-lg">
          <X className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}
