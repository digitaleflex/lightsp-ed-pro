'use client'

import { motion } from 'framer-motion'
import { BookOpen, Zap, Clock, Eye, MousePointerClick, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Term {
  abbr: string
  full: string
  icon: React.ElementType
  description: string
  goodThreshold: string
  avgThreshold: string
  poorThreshold: string
  color: string
}

const TERMS: Term[] = [
  {
    abbr: 'LCP',
    full: 'Largest Contentful Paint',
    icon: Clock,
    description: "Mesure le moment où le plus grand élément visible de la page s'affiche à l'écran. C'est souvent une image hero, un titre ou un bloc de texte.",
    goodThreshold: '< 2.5s',
    avgThreshold: '2.5s – 4s',
    poorThreshold: '> 4s',
    color: 'text-primary',
  },
  {
    abbr: 'INP',
    full: 'Interaction to Next Paint',
    icon: MousePointerClick,
    description: "Mesure la réactivité de la page aux interactions utilisateur (clics, taps, frappes). Remplace le FID depuis 2024.",
    goodThreshold: '< 200ms',
    avgThreshold: '200ms – 500ms',
    poorThreshold: '> 500ms',
    color: 'text-chart-3',
  },
  {
    abbr: 'CLS',
    full: 'Cumulative Layout Shift',
    icon: Eye,
    description: "Mesure la stabilité visuelle. Quantifie les décalages inattendus de la mise en page (images sans dimensions, publicités, polices).",
    goodThreshold: '< 0.1',
    avgThreshold: '0.1 – 0.25',
    poorThreshold: '> 0.25',
    color: 'text-chart-2',
  },
  {
    abbr: 'FCP',
    full: 'First Contentful Paint',
    icon: Zap,
    description: "Mesure le moment où le premier contenu (texte, image, SVG) est peint à l'écran. Indicateur de perception de vitesse initiale.",
    goodThreshold: '< 1.8s',
    avgThreshold: '1.8s – 3s',
    poorThreshold: '> 3s',
    color: 'text-chart-4',
  },
  {
    abbr: 'TTFB',
    full: 'Time to First Byte',
    icon: ShieldCheck,
    description: "Mesure le temps entre la requête et le premier octet reçu. Reflète la réactivité du serveur et du CDN.",
    goodThreshold: '< 200ms',
    avgThreshold: '200ms – 500ms',
    poorThreshold: '> 500ms',
    color: 'text-chart-5',
  },
  {
    abbr: 'TBT',
    full: 'Total Blocking Time',
    icon: Clock,
    description: "Mesure le temps total où le thread principal est bloqué, empêchant l'interaction. Indicateur de gêne pendant le chargement.",
    goodThreshold: '< 200ms',
    avgThreshold: '200ms – 600ms',
    poorThreshold: '> 600ms',
    color: 'text-chart-1',
  },
] as const

export function Glossary() {
  return (
    <section id="glossaire" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-3/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <BookOpen className="h-4 w-4" />
            Glossaire
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comprendre les Core Web Vitals
          </h2>
          <p className="mt-4 text-muted-foreground">
            Les métriques de performance expliquées simplement, avec leurs seuils
            de référence Google.
          </p>
        </div>

        {/* Grille de termes */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TERMS.map((term, i) => (
            <motion.article
              key={term.abbr}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
            >
              {/* En-tête */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <term.icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className={cn('text-2xl font-bold tracking-tight', term.color)}>{term.abbr}</h3>
                  <p className="text-xs font-medium text-muted-foreground">{term.full}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {term.description}
              </p>

              {/* Seuils */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Seuils Google
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-1.5">
                    <span className="h-1.5 w-1.5 mx-auto mb-0.5 block rounded-full bg-primary" />
                    <p className="text-[9px] text-muted-foreground">Bon</p>
                    <p className="font-mono text-[11px] font-bold text-primary">{term.goodThreshold}</p>
                  </div>
                  <div className="rounded-md border border-chart-4/20 bg-chart-4/5 p-1.5">
                    <span className="h-1.5 w-1.5 mx-auto mb-0.5 block rounded-full bg-chart-4" />
                    <p className="text-[9px] text-muted-foreground">Moyen</p>
                    <p className="font-mono text-[11px] font-bold text-chart-4">{term.avgThreshold}</p>
                  </div>
                  <div className="rounded-md border border-destructive/20 bg-destructive/5 p-1.5">
                    <span className="h-1.5 w-1.5 mx-auto mb-0.5 block rounded-full bg-destructive" />
                    <p className="text-[9px] text-muted-foreground">Faible</p>
                    <p className="font-mono text-[11px] font-bold text-destructive">{term.poorThreshold}</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bandeau d'info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:flex-row sm:text-left"
        >
          <BookOpen className="h-8 w-8 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="font-semibold">Envie d'aller plus loin ?</p>
            <p className="text-sm text-muted-foreground">
              Testez votre site avec Vélocita pour voir vos Core Web Vitals réels
              et obtenir des recommandations d'optimisation personnalisées.
            </p>
          </div>
          <a
            href="#outil"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
          >
            Tester mon site
          </a>
        </motion.div>
      </div>
    </section>
  )
}
