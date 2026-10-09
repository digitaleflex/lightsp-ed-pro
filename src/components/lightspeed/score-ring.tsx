'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  label?: string
  className?: string
  animate?: boolean
}

// Couleur du score selon la valeur Lighthouse
function scoreColor(score: number) {
  if (score >= 90) return 'var(--color-chart-2)' // vert
  if (score >= 50) return 'var(--color-chart-4)' // orange
  return 'var(--color-destructive)' // rouge
}

export function ScoreRing({
  score,
  size = 120,
  label = 'Score',
  className,
  animate = true,
}: ScoreRingProps) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <div
      className={cn('relative inline-flex flex-col items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={8}
          opacity={0.4}
        />
        {/* Cercle de progression */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold sm:text-4xl"
          style={{ color }}
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  )
}
