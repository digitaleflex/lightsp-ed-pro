'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TourStep {
  target: string
  title: string
  description: string
}

const STEPS: TourStep[] = [
  {
    target: '#outil input',
    title: 'Testez votre site',
    description: "Saisissez une URL ici et lancez un audit Lighthouse complet en quelques secondes. Choisissez l'appareil et la région de test.",
  },
  {
    target: '#dashboard h2',
    title: 'Surveillez en continu',
    description: "Le tableau de bord affiche l'évolution de vos scores, les Core Web Vitals et la latence par région.",
  },
  {
    target: '#classement h2',
    title: 'Comparez aux meilleurs',
    description: "Découvrez les sites les plus rapides par catégorie et comparez deux sites côte à côte.",
  },
  {
    target: '#tarifs h2',
    title: 'Choisissez votre plan',
    description: "Commencez gratuitement, puis passez au Pro pour un monitoring continu et des alertes.",
  },
  {
    target: '#glossaire h2',
    title: 'Apprenez les Core Web Vitals',
    description: "Notre glossaire explique chaque métrique (LCP, CLS, TBT…) avec ses seuils de référence Google.",
  },
]

const STORAGE_KEY = 'lightspeed-tour-completed'

export function GuidedTour() {
  const [active, setActive] = React.useState(false)
  const [stepIdx, setStepIdx] = React.useState(0)
  const [spotlight, setSpotlight] = React.useState<{ top: number; left: number; width: number; height: number } | null>(null)

  // Démarrage UNIQUEMENT sur demande explicite (bouton « Visite guidée »,
  // palette de commande). Plus d'auto-start : on ne confisque jamais le scroll.
  React.useEffect(() => {
    const start = () => {
      setStepIdx(0)
      setActive(true)
    }
    window.addEventListener('lightspeed:start-tour', start)
    return () => window.removeEventListener('lightspeed:start-tour', start)
  }, [])

  // Mesurer et suivre la position du spotlight
  React.useEffect(() => {
    if (!active) return

    const step = STEPS[stepIdx]
    if (!step) return

    let scrollTimeout: ReturnType<typeof setTimeout>
    let rafId: number

    function measure() {
      const el = document.querySelector(step.target)
      if (el) {
        const rect = el.getBoundingClientRect()
        setSpotlight({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        })
      }
    }

    function scrollToTarget() {
      const el = document.querySelector(step.target)
      if (!el) return

      el.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Suivre le scroll et mesurer quand il se stabilise
      let lastScrollY = -1
      const checkStable = () => {
        const currentY = window.scrollY
        if (currentY !== lastScrollY) {
          lastScrollY = currentY
          // Pendant le scroll, mesurer en continu pour suivre la position
          measure()
        }
        clearTimeout(scrollTimeout)
        // Quand le scroll s'arrête, faire une dernière mesure précise
        scrollTimeout = setTimeout(() => {
          measure()
        }, 150)
        rafId = requestAnimationFrame(checkStable)
      }
      // Arrêter la boucle après 3s (le scroll smooth devrait être fini)
      setTimeout(() => cancelAnimationFrame(rafId), 3000)
      checkStable()
    }

    // Démarrer immédiatement pour mesurer la position actuelle
    measure()
    // Puis scroller et suivre
    const startTimer = setTimeout(scrollToTarget, 50)

    // Recalculer au resize
    const resizeListener = () => measure()
    window.addEventListener('resize', resizeListener)
    return () => {
      clearTimeout(scrollTimeout)
      clearTimeout(startTimer)
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeListener)
    }
  }, [active, stepIdx])

  function next() {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((p) => p + 1)
    } else {
      finish()
    }
  }

  function prev() {
    if (stepIdx > 0) setStepIdx((p) => p - 1)
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setActive(false)
    setStepIdx(0)
  }

  function skip() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setActive(false)
  }

  const step = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1

  // Position du tooltip
  const tooltipPos = React.useMemo(() => {
    if (!spotlight) return { top: 120, left: '50%', transform: 'translateX(-50%)' }
    const spaceBelow = window.innerHeight - (spotlight.top + spotlight.height)
    const placeBelow = spaceBelow > 280
    return {
      top: placeBelow ? spotlight.top + spotlight.height + 16 : Math.max(80, spotlight.top - 220),
      left: Math.max(16, Math.min(spotlight.left, window.innerWidth - 380)),
      transform: 'none',
    }
  }, [spotlight])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150]"
          style={{ pointerEvents: 'none' }}
        >
          {/* Spotlight avec box-shadow géant qui crée l'overlay sombre autour du trou */}
          {spotlight && (
            <div
              className="absolute rounded-xl border-2 border-primary"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                // Le box-shadow géant crée l'overlay sombre autour du spotlight
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(2px)',
                pointerEvents: 'auto',
                transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
              }}
            >
              {/* Coins animés */}
              <span className="absolute -left-1.5 -top-1.5 h-5 w-5 border-l-[3px] border-t-[3px] border-primary rounded-tl-lg" />
              <span className="absolute -right-1.5 -top-1.5 h-5 w-5 border-r-[3px] border-t-[3px] border-primary rounded-tr-lg" />
              <span className="absolute -left-1.5 -bottom-1.5 h-5 w-5 border-l-[3px] border-b-[3px] border-primary rounded-bl-lg" />
              <span className="absolute -right-1.5 -bottom-1.5 h-5 w-5 border-r-[3px] border-b-[3px] border-primary rounded-br-lg" />
            </div>
          )}

          {/* Overlay quand pas de spotlight (pendant le scroll initial) */}
          {!spotlight && (
            <div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              style={{ pointerEvents: 'auto' }}
              onClick={skip}
            />
          )}

          {/* Carte tooltip */}
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute z-30"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: 'min(360px, calc(100vw - 32px))',
              transform: tooltipPos.transform,
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-2xl">
              {/* Bande dégradée en haut */}
              <div className="h-1 speed-gradient" />

              <div className="p-5">
                {/* En-tête */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Étape {stepIdx + 1} / {STEPS.length}
                    </span>
                  </div>
                  <button onClick={skip} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Fermer le tour">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Contenu */}
                <h3 className="mb-2 text-base font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Navigation */}
                <div className="mt-4 flex items-center justify-between">
                  {/* Dots */}
                  <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStepIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === stepIdx ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                        }`}
                        aria-label={`Aller à l'étape ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Boutons */}
                  <div className="flex items-center gap-2">
                    {stepIdx > 0 && (
                      <Button variant="ghost" size="sm" onClick={prev} className="gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                    )}
                    <Button size="sm" onClick={next} className="gap-1.5">
                      {isLast ? (
                        <>
                          <Check className="h-4 w-4" />
                          Terminer
                        </>
                      ) : (
                        <>
                          Suivant
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
