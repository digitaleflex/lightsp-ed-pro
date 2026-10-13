'use client'

import { motion } from 'framer-motion'
import { Link2, Play, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    number: '01',
    icon: Link2,
    title: 'Ajoutez votre URL',
    description:
      "Saisissez l'adresse de votre site. Aucun script à installer, aucune modification de code nécessaire. Vélocita analyse votre page en quelques secondes.",
    badge: '30 secondes',
  },
  {
    number: '02',
    icon: Play,
    title: 'Lancez l\'analyse',
    description:
      "Un audit Lighthouse complet s'exécute : Core Web Vitals, score de performance, accessibilité, SEO. Choisissez l'appareil et la région de test.",
    badge: 'Audit complet',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Surveillez & optimisez',
    description:
      "Suivez l'évolution de vos scores dans le temps, recevez des recommandations concrètes et soyez alerté dès qu'une régression apparaît.",
    badge: 'Monitoring continu',
  },
] as const

export function Onboarding() {
  return (
    <section id="demarrer" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Démarrage rapide
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Configurez en 3 étapes simples
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pas besoin d'être expert en performance. Vélocita s'occupe de tout,
            de la mesure au monitoring continu.
          </p>
        </div>

        {/* Étapes */}
        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Ligne de connexion décorative */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className="relative flex h-full flex-col items-center rounded-3xl border border-border/60 bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                {/* Numéro + icône */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <step.icon className="h-9 w-9" strokeWidth={1.6} />
                  </div>
                  {/* Badge numéro */}
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground shadow-lg ring-4 ring-background">
                    {step.number}
                  </span>
                </div>

                {/* Badge durée */}
                <span className="mb-3 inline-block rounded-full bg-muted px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {step.badge}
                </span>

                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Flèche entre les étapes (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="#outil">
                Tester mon site maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.dispatchEvent(new Event('lightspeed:start-tour'))}
            >
              <Play className="h-4 w-4" />
              Visite guidée · 1 min
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sans carte bancaire • Résultats en 30 secondes
          </p>
        </div>
      </div>
    </section>
  )
}
