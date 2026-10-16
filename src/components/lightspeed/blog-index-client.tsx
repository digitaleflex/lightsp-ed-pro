'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, BookOpen, Clock, Gauge, MousePointerClick, Eye, Server, Code, BarChart3, TrendingUp, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
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

/** Nombre de cartes rendues par page : DOM léger, images lazy, perf préservée. */
const PAGE_SIZE = 9

/** Grille des guides avec recherche instantanée + filtre par catégorie + pagination. */
export function BlogIndexClient() {
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const topRef = React.useRef<HTMLDivElement>(null)

  const rest = BLOG_POSTS.slice(1)
  const filtered = rest.filter((p) => {
    if (category && p.category !== category) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    const hay = `${p.title} ${p.excerpt} ${p.metric ?? ''} ${p.keywords.join(' ')}`.toLowerCase()
    return q.split(/\s+/).every((w) => hay.includes(w))
  })

  // Pagination : 9 cartes par page pour ne pas tout charger d'un coup.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages))
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Retour page 1 dès que la recherche ou le filtre change.
  React.useEffect(() => {
    setPage(1)
  }, [query, category])

  return (
    <div ref={topRef} className="scroll-mt-24">
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
            className="mt-1 min-h-[44px] rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tout afficher
          </button>
        </div>
      ) : (
        <>
        <p className="mb-4 text-sm text-muted-foreground" role="status">
          Articles {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} sur {filtered.length}
          {totalPages > 1 && <> · page {safePage}/{totalPages}</>}
        </p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Pagination des articles" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Page précédente"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1
              // Fenêtre compacte : 1 … voisine … dernière
              if (totalPages > 7 && n !== 1 && n !== totalPages && Math.abs(n - safePage) > 1) {
                if (n === 2 || n === totalPages - 1) {
                  return <span key={n} className="px-1 text-muted-foreground">…</span>
                }
                return null
              }
              return (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? 'page' : undefined}
                  className={cn(
                    'min-h-[44px] min-w-[44px] rounded-xl border px-3 text-sm font-medium tabular-nums transition-colors',
                    n === safePage
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {n}
                </button>
              )
            })}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Page suivante"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
        </>
      )}
    </div>
  )
}
