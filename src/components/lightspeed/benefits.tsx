'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Smile, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Référencement SEO',
    description:
      "Les Core Web Vitals sont désormais un facteur de classement Google important. Un site rapide grimpe dans les résultats.",
    accent: 'from-chart-2/20',
  },
  {
    icon: Smile,
    title: 'Meilleure expérience utilisateur',
    description:
      "Les utilisateurs préfèrent les sites qui se chargent rapidement. La vitesse est synonyme de confiance et de satisfaction.",
    accent: 'from-chart-1/20',
  },
  {
    icon: DollarSign,
    title: 'Plus de revenus',
    description:
      "Les études montrent qu'un site plus rapide augmente les taux de conversion. Chaque milliseconde compte pour votre chiffre d'affaires.",
    accent: 'from-chart-4/20',
  },
] as const

export function Benefits() {
  return (
    <section id="avantages" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Site plus rapide.{' '}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Utilisateurs plus heureux.
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Accélérez votre site pour augmenter vos conversions et mieux ranker
            sur les moteurs de recherche.
          </p>
        </div>

        {/* Cartes avantages */}
        <div className="grid gap-6 md:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8"
            >
              <div className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${b.accent} to-transparent blur-2xl`} />
              <div className="relative">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bandeau "Pas de code" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-10"
        >
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold">Aucune modification de code</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Vélocita ne nécessite l'ajout d'aucun script supplémentaire
                qui pourrait ralentir votre site. Configurez tout en quelques secondes.
              </p>
            </div>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
              <Link href="#outil">
                Obtenir Vélocita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
