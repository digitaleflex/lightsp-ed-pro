'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronLeft, ChevronRight, Image as ImageIcon, Code, Server, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Tip {
  icon: React.ElementType
  category: string
  title: string
  content: string
  impact: string
  color: string
}

const TIPS: Tip[] = [
  {
    icon: ImageIcon,
    category: 'Images',
    title: 'Convertissez en WebP/AVIF',
    content: "Les formats modernes WebP et AVIF réduisent la taille des images de 25 à 50% sans perte visible. Utilisez <picture> avec fallback pour la compatibilité.",
    impact: '-40% poids images',
    color: 'text-chart-2',
  },
  {
    icon: Code,
    category: 'JavaScript',
    title: 'Code-splitting dynamique',
    content: "Utilisez import() dynamique pour charger le JS non critique uniquement quand nécessaire. React.lazy() et Next.js dynamic() sont vos amis.",
    impact: '-60% JS initial',
    color: 'text-chart-1',
  },
  {
    icon: Server,
    category: 'Serveur',
    title: 'Activez le cache CDN',
    content: "Configurez des en-têtes Cache-Control longues pour les assets statiques. Un CDN comme Cloudflare peut diviser votre TTFB par 3.",
    impact: '-70% TTFB',
    color: 'text-chart-3',
  },
  {
    icon: Zap,
    category: 'Rendu',
    title: 'Préchargez les ressources critiques',
    content: "Utilisez <link rel='preload'> pour les polices, images hero et CSS critique. Le navigateur les récupère plus tôt dans le cycle de chargement.",
    impact: '-0.5s FCP',
    color: 'text-chart-4',
  },
  {
    icon: ImageIcon,
    category: 'Images',
    title: 'Dimensions explicites',
    content: "Définissez toujours width et height sur les images pour éviter les décalages de mise en page (CLS). Utilisez aspect-ratio en CSS.",
    impact: 'CLS → 0',
    color: 'text-chart-2',
  },
  {
    icon: Code,
    category: 'CSS',
    title: 'Inline critical CSS',
    content: "Extrayez le CSS above-the-fold et inlinez-le dans <style>. Reportez le reste via media='print' onload pour un rendu non bloquant.",
    impact: '-0.3s FCP',
    color: 'text-chart-1',
  },
] as const

export function TipsCarousel() {
  const [index, setIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const next = React.useCallback(() => {
    setDirection(1)
    setIndex((p) => (p + 1) % TIPS.length)
  }, [])

  const prev = React.useCallback(() => {
    setDirection(-1)
    setIndex((p) => (p - 1 + TIPS.length) % TIPS.length)
  }, [])

  // Auto-rotation
  React.useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const tip = TIPS[index]

  return (
    <section id="astuces" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-4/5 blur-[120px]" />
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Lightbulb className="h-4 w-4" />
            Astuces d'expert
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Optimisez votre site comme un pro
          </h2>
          <p className="mt-4 text-muted-foreground">
            Des conseils concrets et éprouvés pour améliorer vos Core Web Vitals.
          </p>
        </div>

        {/* Carrousel */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg">
          <div className="relative min-h-[280px] sm:min-h-[240px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 p-6 sm:p-10"
              >
                <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Icône */}
                  <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted/50', tip.color)}>
                    <tip.icon className="h-8 w-8" strokeWidth={1.6} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                        {tip.category}
                      </span>
                      <span className={cn('text-xs font-semibold', tip.color)}>
                        {tip.impact}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{tip.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {tip.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1)
                    setIndex(i)
                  }}
                  aria-label={`Astuce ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground'
                  )}
                />
              ))}
            </div>

            {/* Flèches */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev} aria-label="Précédent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs tabular-nums text-muted-foreground">
                {index + 1} / {TIPS.length}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next} aria-label="Suivant">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
