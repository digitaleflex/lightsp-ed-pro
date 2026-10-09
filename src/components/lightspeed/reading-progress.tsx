'use client'

import * as React from 'react'
import { motion, useScroll, useSpring, useInView } from 'framer-motion'

// Barre de progression de lecture en haut de la page
export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left speed-gradient"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}

// Compteur animé qui s'incrémente au scroll
interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: (v: number) => string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  format,
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    let raf: number
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      // Easing easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      }
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {format ? format(display) : display}
    </span>
  )
}
