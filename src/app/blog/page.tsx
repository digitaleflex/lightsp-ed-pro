import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/lightspeed/navbar'
import { Footer } from '@/components/lightspeed/footer'

import { BLOG_POSTS, BLOG_CATEGORIES, BLOG_AUTHOR } from '@/lib/blog'
import { BlogIndexClient } from '@/components/lightspeed/blog-index-client'
import { canonical } from '@/lib/site'
import { Rss, BookOpen, Clock, ArrowRight, Gauge } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — Core Web Vitals expliqués simplement | Vélocita',
  description:
    'Guides professionnels complets : LCP, CLS, INP, FCP, TTFB, TBT, mesures terrain vs labo, SEO et conversions. Seuils Google et plans d’optimisation avec code.',
  alternates: {
    canonical: canonical('/blog'),
    types: { 'application/rss+xml': `${canonical('/blog/rss.xml')}` },
  },
  openGraph: {
    title: 'Blog Vélocita — Core Web Vitals',
    description: 'Les métriques de performance expliquées simplement, avec plans d’action professionnels.',
    url: canonical('/blog'),
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function BlogIndex() {
  const pillar = BLOG_POSTS[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Vélocita — Core Web Vitals',
    url: canonical('/blog'),
    blogPost: BLOG_POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: canonical(`/blog/${p.slug}`),
      datePublished: p.date,
      dateModified: p.updated,
    })),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="flex-1">
        {/* En-tête */}
        <div className="relative overflow-hidden border-b border-border/60 bg-muted/30">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
          <div className="container relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <BookOpen className="h-4 w-4" />
              Blog · Ressources
            </p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Comprendre les Core Web Vitals
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Les métriques de performance expliquées simplement, avec leurs seuils de référence Google
              — et des plans d’optimisation professionnels complets, avec code.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {BLOG_CATEGORIES.map((c) => (
                <span key={c} className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-muted-foreground">
                  {c}
                </span>
              ))}
              <Link
                href="/blog/rss.xml"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Rss className="h-4 w-4" /> RSS
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Article pilier */}
          <Link
            href={`/blog/${pillar.slug}`}
            className="group mb-10 grid overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card transition-all hover:-translate-y-0.5 hover:shadow-xl lg:grid-cols-[1.4fr_1fr]"
          >
            <div className="p-6 sm:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground">Guide pilier</span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground">{pillar.category}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{pillar.readingTime} min</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Image
                    src={BLOG_AUTHOR.avatar}
                    alt={`Photo de ${BLOG_AUTHOR.name}`}
                    width={48}
                    height={48}
                    className="h-5 w-5 rounded-full object-cover"
                    sizes="20px"
                  />
                  Par {BLOG_AUTHOR.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary sm:text-3xl">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{pillar.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Lire le guide complet <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-6 sm:p-10 lg:grid-cols-1 lg:content-center">
              <div className="relative mb-4 overflow-hidden rounded-2xl border border-border/60 lg:col-span-1 lg:mb-5">
                <Image
                  src={pillar.cover}
                  alt={pillar.coverAlt}
                  width={1200}
                  height={630}
                  priority
                  className="aspect-[16/9] w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  Illustration originale Vélocita
                </span>
              </div>
              {[
                { m: 'LCP', v: '≤ 2,5 s' },
                { m: 'INP', v: '≤ 200 ms' },
                { m: 'CLS', v: '≤ 0,1' },
              ].map((t) => (
                <div key={t.m} className="rounded-2xl border border-border/60 bg-background/70 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{t.m}</p>
                  <p className="font-mono text-sm font-semibold">{t.v}</p>
                </div>
              ))}
            </div>
          </Link>

          {/* Grille des guides : recherche + filtres */}
          <BlogIndexClient />

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:flex-row sm:text-left">
            <Gauge className="h-8 w-8 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Passez de la théorie à la mesure réelle</p>
              <p className="text-sm text-muted-foreground">
                Testez votre site gratuitement : score, Core Web Vitals et recommandations personnalisées.
              </p>
            </div>
            <Link
              href="/outil"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
            >
              Tester mon site <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>


      </main>
      <Footer />
    </div>
  )
}
