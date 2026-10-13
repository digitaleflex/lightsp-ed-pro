'use client'

import Link from 'next/link'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { SECTIONS, type SectionMeta } from '@/lib/sections'
import { cn } from '@/lib/utils'

/**
 * Bloc statique interne : exposer les notions importantes + maillage SEO.
 * Utilisé sur la home (avant le footer) et en bas de chaque page dédiée.
 */
export function InternalLinks({
  currentSlug,
  title = 'Explorer aussi',
  compact = false,
}: {
  currentSlug?: string
  title?: string
  compact?: boolean
}) {
  const groups: Array<{ name: SectionMeta['group']; items: SectionMeta[] }> = (
    ['Produit', 'Ressources', 'Communauté'] as const
  ).map((name) => ({
    name,
    items: SECTIONS.filter((s) => s.group === name && s.slug !== currentSlug),
  }))

  return (
    <section
      aria-label="Navigation interne"
      className={cn('relative', compact ? 'py-10' : 'py-16 sm:py-20')}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/50 p-6 sm:p-10">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <LayoutGrid className="h-4 w-4" />
                Maillage interne
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Chaque section de la page d’accueil a sa page détaillée. Naviguez par
                groupe pour approfondir les notions importantes.
              </p>
            </div>
            <Link
              href="/"
              className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Voir la page assemblée
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {groups.map((g) => (
              <nav key={g.name} aria-label={g.name}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {g.name}
                </h3>
                <ul className="space-y-1">
                  {g.items.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/${s.slug}`}
                        className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <span>{s.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
