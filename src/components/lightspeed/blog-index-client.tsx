'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, BookOpen, Clock, Gauge, MousePointerClick, Eye, Server, Code, BarChart3, TrendingUp, SearchX } from 'lucide-react'
import { BLOG_POSTS, BLOG_CATEGORIES, formatDateFR } from '@/lib/blog'
import { cn } from '@/lib/utils'

const CATEGORY_ICON: Record<string, React.ElementType> = {
  'Core Web Vitals': Gauge,
  Mesure: BarChart3,
  Optimisation: Code,
  'SEO & Business': TrendingUp,
}

const METRIC_ICON: Record<string, React.ElementType> = {
  LCP: Gauge,
  CLS: Eye,
  INP: MousePointerClick,
  FCP: Gauge,
  TTFB: Server,
  TBT: Code,
}

/** Grille des guides avec recherche instantanée + filtre par catégorie. */
export function BlogIndexClient() {
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)

  const rest = BLOG_POSTS.slice(1)
  const filtered = rest.filter((p) => {
    if (category && p.category !== category) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    const hay = `${p.title} ${p.excerpt} ${p.metric ?? ''} ${p.keywords.join(' ')}`.toLowerCase()
    return q.split(/\s+/).every((w) => hay.includes(w))
  })

  return (
    <div>
      {/* Recherche + filtres */}
      <div className="mb-8 flex flex-col gap-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un guide (ex. CLS, serveur, SEO)…"
            aria-label="Rechercher un article"
            className="w-full rounded-xl border border-border/60 bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
          <button
            onClick={() => setCategory(null)}
            aria-pressed={category === null}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              category === null
                ? 'border-primary bg-primary font-medium text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
          >
            Tous
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              aria-pressed={category === c}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                category === c
                  ? 'border-primary bg-primary font-medium text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {(query || category) && (
          <p className="text-sm text-muted-foreground" role="status">
            {filtered.length} article{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            {category && <> dans « {category} »</>}
            {query && <> pour « {query.trim()} »</>}
          </p>
        )}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/60" />
          <p className="font-semibold">Aucun article trouvé</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Essayez un autre mot-clé (LCP, CLS, INP, serveur, SEO…) ou réinitialisez les filtres.
          </p>
          <button
            onClick={() => { setQuery(''); setCategory(null) }}
            className="mt-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tout afficher
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const Icon = (p.metric && METRIC_ICON[p.metric]) || CATEGORY_ICON[p.category] || BookOpen
            return (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={p.cover}
                    alt={p.coverAlt}
                    width={1200}
                    height={630}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {p.metric && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {p.metric}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-5 pb-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {p.metric && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">{p.metric}</span>
                    )}
                    <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">{p.category}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-base font-bold leading-snug tracking-tight group-hover:text-primary">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                    <span>{formatDateFR(p.date)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readingTime} min</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
