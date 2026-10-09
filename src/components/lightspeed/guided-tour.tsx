'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TourStep {
  target: string // selector
  title: string
  description: string
  position: 'top' | 'bottom' | 'center'
}

const STEPS: TourStep[] = [
  {
    target: '#outil',
    title: 'Testez votre site',
    description: "Saisissez une URL et lancez un audit Lighthouse complet en quelques secondes. Choisissez l'appareil et la région de test.",
    position: 'top',
  },
  {
    target: '#dashboard',
    title: 'Surveillez en continu',
    description: "Le tableau de bord affiche l'évolution de vos scores dans le temps, les Core Web Vitals et la latence par région.",
    position: 'top',
  },
  {
    target: '#classement',
    title: 'Comparez aux meilleurs',
    description: "Découvrez les sites les plus rapides par catégorie et comparez deux sites côte à côte avec la modale de comparaison.",
    position: 'top',
  },
  {
    target: '#tarifs',
    title: 'Choisissez votre plan',
    description: "Commencez gratuitement avec le plan Découverte, puis passez au Pro pour un monitoring continu et des alertes.",
    position: 'top',
  },
  {
    target: '#glossaire',
    title: 'Apprenez les Core Web Vitals',
    description: "Notre glossaire explique chaque métrique (LCP, CLS, TBT…) avec ses seuils de référence Google.",
    position: 'top',
  },
]

const STORAGE_KEY = 'lightspeed-tour-completed'

export function GuidedTour() {
  const [active, setActive] = React.useState(false)
  const [stepIdx, setStepIdx] = React.useState(0)
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null)

  // Démarrer le tour si l'utilisateur est nouveau (pas de localStorage)
  React.useEffect(() => {
    const completed = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (!completed) {
      const timer = setTimeout(() => setActive(true), 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Suivre la position de l'élément cible
  React.useEffect(() => {
    if (!active) return
    const step = STEPS[stepIdx]
    if (!step) return

    function updateRect() {
      const el = document.querySelector(step.target)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect())
        }, 400)
      }
    }
    updateRect()
    window.addEventListener('scroll', updateRect)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect)
      window.removeEventListener('resize', updateRect)
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

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150]"
        >
          {/* Overlay avec spotlight */}
          {targetRect && (
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              style={{
                boxShadow: `0 0 0 9999px rgba(0,0,0,0.6)`,
                borderRadius: '12px',
                // Découpe le spotlight autour de la cible
                clipPath: `polygon(
                  0 0,
                  100% 0,
                  100% 100%,
                  0 100%,
                  0 ${targetRect.top - 12}px,
                  ${targetRect.left - 12}px ${targetRect.top - 12}px,
                  ${targetRect.left - 12}px ${targetRect.bottom + 12}px,
                  0 ${targetRect.bottom + 12}px
                )`,
              }}
            />
          )}

          {/* Carte de tooltip positionnée */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={stepIdx}
              className="absolute"
              style={{
                left: Math.min(targetRect.left, window.innerWidth - 380),
                top: step.position === 'bottom'
                  ? targetRect.bottom + 20
                  : Math.max(80, targetRect.top - 200),
                width: 'min(360px, calc(100vw - 32px))',
              }}
            >
              <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-2xl">
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
                  <button onClick={skip} className="text-muted-foreground hover:text-foreground" aria-label="Fermer">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Contenu */}
                <h3 className="mb-2 text-base font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Dots */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {STEPS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === stepIdx ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40'
                        }`}
                      />
                    ))}
                  </div>
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
            </motion.div>
          )}

          {/* Pas de cible trouvée : centrer */}
          {!targetRect && (
            <div className="flex h-full items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-5 shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Étape {stepIdx + 1} / {STEPS.length}</span>
                </div>
                <h3 className="mb-2 text-base font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={skip}>Passer</Button>
                  <Button size="sm" onClick={next} className="gap-1.5">
                    {isLast ? 'Terminer' : 'Suivant'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
