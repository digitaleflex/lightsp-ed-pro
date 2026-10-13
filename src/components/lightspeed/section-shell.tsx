import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Home, CheckCircle2, HelpCircle } from 'lucide-react'
import type { SectionMeta } from '@/lib/sections'
import { getRelatedSections } from '@/lib/sections'
import { EDITORIAL } from '@/lib/section-editorial'
import { canonical } from '@/lib/site'
import { InternalLinks } from './internal-links'

/**
 * Coquille réutilisable pour chaque page dédiée :
 * fil d'Ariane + intro détaillée + composant section + maillage interne.
 * La home, elle, assemble tous les composants sans cette coquille.
 */
export function SectionShell({
  meta,
  children,
  anchorHref,
}: {
  meta: SectionMeta
  children: React.ReactNode
  /** lien vers l'ancre assemblée sur la home, ex: /#outil */
  anchorHref: string
}) {
  const related = getRelatedSections(meta.slug, 4)
  const editorial = EDITORIAL[meta.slug]
  const pageUrl = canonical(`/${meta.slug}`)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: canonical('/') },
      { '@type': 'ListItem', position: 2, name: meta.label, item: pageUrl },
    ],
  }
  const faqJsonLd = editorial
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: editorial.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* En-tête de page dédiée */}
      <div className="relative overflow-hidden border-b border-border/60 bg-muted/30">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="container relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* Fil d'Ariane */}
          <nav aria-label="Fil d'Ariane" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
              <Home className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-foreground">{meta.label}</span>
            <span aria-hidden="true" className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
              /{meta.slug}
            </span>
          </nav>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            {meta.group}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {meta.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/outil"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
            >
              Tester mon site
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={anchorHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Voir dans la page assemblée
            </Link>
          </div>
        </div>
      </div>

      {/* Détail éditorial : contenu unique par page (anti duplicate content) */}
      {editorial && (
        <div className="container mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="mb-3 text-xl font-semibold">En détail</h2>
              {editorial.intro.map((p, i) => (
                <p key={i} className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {p}
                </p>
              ))}
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <h2 className="mb-3 text-base font-semibold">Ce que vous trouverez</h2>
              <ul className="space-y-2.5">
                {editorial.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Le composant section réutilisé tel quel */}
      {children}

      {/* Mini-FAQ locale */}
      {editorial && (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <HelpCircle className="h-5 w-5 text-primary" />
              Questions sur {meta.label.toLowerCase()}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {editorial.faq.map((f) => (
                <div key={f.q} className="rounded-xl border border-border/50 bg-background/60 p-4">
                  <p className="mb-1.5 text-sm font-semibold">{f.q}</p>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complément : pages liées du même groupe */}
      <div className="container mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
          <h2 className="mb-3 text-lg font-semibold">Approfondir : {meta.group}</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bloc statique interne global */}
      <InternalLinks currentSlug={meta.slug} />
    </div>
  )
}
