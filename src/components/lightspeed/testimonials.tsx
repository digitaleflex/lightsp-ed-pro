'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:
      "Vélocita a transformé notre approche de la performance. Nous avons détecté une régression Lighthouse 2h après un déploiement, avant qu'elle n'impacte nos utilisateurs.",
    name: 'Camille Laurent',
    role: 'Lead Frontend, Drift',
    avatar: 'CL',
    initials: 'CL',
    color: 'from-chart-1 to-chart-2',
    rating: 5,
  },
  {
    quote:
      "Le tableau de bord de monitoring est devenu notre source de vérité. On a gagné 18 points de score Lighthouse moyen en 3 mois.",
    name: 'Thomas Mercier',
    role: 'CTO, Polarify',
    avatar: 'TM',
    initials: 'TM',
    color: 'from-chart-3 to-chart-1',
    rating: 5,
  },
  {
    quote:
      "Enfin un outil qui parle le langage des Core Web Vitals sans jargon. Notre SEO a grimpé de 4 positions en moyenne sur les pages surveillées.",
    name: 'Sophie Nguyen',
    role: 'Responsable SEO, Maison Kazoo',
    avatar: 'SN',
    initials: 'SN',
    color: 'from-chart-4 to-chart-5',
    rating: 5,
  },
] as const

const LOGOS = ['Vercel', 'Linear', 'Notion', 'Stripe', 'Figma', 'Cloudflare']

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Témoignages
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ils ont accéléré avec Vélocita
          </h2>
          <p className="mt-4 text-muted-foreground">
            Plus de 4 500 équipes font confiance à Vélocita pour surveiller
            et optimiser leurs performances web.
          </p>
        </div>

        {/* Nuage de logos */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-60">
          {LOGOS.map((l) => (
            <span
              key={l}
              className="text-lg font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground sm:text-xl"
            >
              {l}
            </span>
          ))}
        </div>

        {/* Cartes témoignages */}
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-lg"
            >
              {/* Quote icon */}
              <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/15" fill="currentColor" />

              {/* Étoiles */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-chart-2 text-chart-2" />
                ))}
              </div>

              {/* Citation */}
              <blockquote className="relative flex-1 text-sm leading-relaxed text-foreground/90">
                «&nbsp;{t.quote}&nbsp;»
              </blockquote>

              {/* Auteur */}
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* Bandeau métriques */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:grid-cols-3"
        >
          <Metric value="4 500+" label="Équipes clientes" />
          <Metric value="18 pts" label="Score Lighthouse gagné en moyenne" />
          <Metric value="4,9 / 5" label="Satisfaction utilisateur" />
        </motion.div>
      </div>
    </section>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-primary sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  )
}
