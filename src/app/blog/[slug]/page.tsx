import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/lightspeed/navbar'
import { Footer } from '@/components/lightspeed/footer'

import { ReadingProgress } from '@/components/lightspeed/reading-progress'
import { BlogShare } from '@/components/lightspeed/blog-share'
import { BlogNewsletter } from '@/components/lightspeed/blog-newsletter'
import { BLOG_BY_SLUG, BLOG_POSTS, BLOG_AUTHOR, getRelatedPosts, getPrevNextPost, slugifyHeading, formatDateFR } from '@/lib/blog'
import { canonical } from '@/lib/site'
import {
  ArrowLeft, ArrowRight, Clock, CalendarDays, CheckCircle2,
  Lightbulb, ListChecks, ListOrdered, HelpCircle, Home, BookOpen, Gauge, ExternalLink,
} from 'lucide-react'

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_BY_SLUG.get(slug)
  if (!post) return {}
  const url = canonical(`/blog/${post.slug}`)
  return {
    title: `${post.title} | Blog Vélocita`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: BLOG_AUTHOR.name }],
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} | Blog Vélocita`,
      description: post.excerpt,
      url,
      type: 'article',
      locale: 'fr_FR',
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [BLOG_AUTHOR.name],
      images: [{ url: post.cover, width: 1200, height: 630, alt: post.coverAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Blog Vélocita`,
      description: post.excerpt,
      images: [post.cover],
    },
  }
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = BLOG_BY_SLUG.get(slug)
  if (!post) notFound()
  const related = getRelatedPosts(post.slug, 3)
  const { prev, next } = getPrevNextPost(post.slug)
  const pageUrl = canonical(`/blog/${post.slug}`)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.date,
    dateModified: post.updated,
    mainEntityOfPage: pageUrl,
    author: { '@type': 'Person', name: BLOG_AUTHOR.name, jobTitle: BLOG_AUTHOR.role },
  }
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: canonical('/') },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: canonical('/blog') },
      { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ReadingProgress />
      <Navbar />
      <main className="flex-1">
        {/* En-tête article */}
        <div className="relative overflow-hidden border-b border-border/60 bg-muted/30">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
          <div className="container relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
            <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground"><Home className="h-3.5 w-3.5" />Accueil</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
              <span>/</span>
              <span className="font-medium text-foreground">{post.metric ?? post.category}</span>
            </nav>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              {post.metric && <span className="rounded-full bg-primary px-2.5 py-1 font-bold text-primary-foreground">{post.metric}</span>}
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground">{post.category}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Mis à jour le {formatDateFR(post.updated)}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{post.readingTime} min de lecture</span>
            </div>
            <div className="mb-5 flex items-center gap-3">
              <Image
                src={BLOG_AUTHOR.avatar}
                alt={`Photo de ${BLOG_AUTHOR.name}`}
                width={96}
                height={96}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/30"
                sizes="44px"
              />
              <div className="text-sm">
                <p className="font-semibold">Par {BLOG_AUTHOR.name}</p>
                <p className="text-muted-foreground">{BLOG_AUTHOR.role} · Mis à jour le {formatDateFR(post.updated)}</p>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{post.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <BlogShare url={pageUrl} title={post.title} />
              <a href="#sommaire" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <ListOrdered className="h-4 w-4" /> Aller au sommaire
              </a>
            </div>
            <figure className="mt-8 overflow-hidden rounded-2xl border border-border/60">
              <Image
                src={post.cover}
                alt={post.coverAlt}
                width={1200}
                height={630}
                priority
                className="aspect-[16/9] w-full object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
              <figcaption className="border-t border-border/60 bg-card/60 px-4 py-2 text-center text-xs text-muted-foreground">
                Illustration originale Vélocita — {post.metric ?? post.category}
              </figcaption>
            </figure>
            {post.thresholds && (
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Bon', value: post.thresholds.bon, cls: 'border-primary/20 bg-primary/5 text-primary' },
                  { label: 'À améliorer', value: post.thresholds.moyen, cls: 'border-chart-4/20 bg-chart-4/5 text-chart-4' },
                  { label: 'Médiocre', value: post.thresholds.mauvais, cls: 'border-destructive/20 bg-destructive/5 text-destructive' },
                ].map((t) => (
                  <div key={t.label} className={`rounded-xl border p-3 ${t.cls}`}>
                    <p className="text-[11px] uppercase tracking-wide opacity-70">{t.label}</p>
                    <p className="font-mono text-sm font-bold sm:text-base">{t.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {/* Intro */}
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            {post.intro.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-lg font-medium text-foreground' : ''}>{p}</p>
            ))}
          </div>

          {/* Sommaire */}
          <nav id="sommaire" aria-label="Sommaire de l'article" className="mt-8 scroll-mt-24 rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-7">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <ListOrdered className="h-5 w-5 text-primary" /> Sommaire
            </h2>
            <ol className="space-y-1.5">
              {post.sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#${slugifyHeading(s.heading)}`} className="group flex items-baseline gap-2.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <span className="font-mono text-xs font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                    <span className="group-hover:underline">{s.heading}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href="#checklist" className="group flex items-baseline gap-2.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <span className="font-mono text-xs font-bold text-primary">{String(post.sections.length + 1).padStart(2, '0')}</span>
                  <span className="group-hover:underline">Checklist — validez votre optimisation</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="group flex items-baseline gap-2.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <span className="font-mono text-xs font-bold text-primary">{String(post.sections.length + 2).padStart(2, '0')}</span>
                  <span className="group-hover:underline">Questions fréquentes</span>
                </a>
              </li>
              {post.sources && post.sources.length > 0 && (
                <li>
                  <a href="#sources" className="group flex items-baseline gap-2.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <span className="font-mono text-xs font-bold text-primary">{String(post.sections.length + 3).padStart(2, '0')}</span>
                    <span className="group-hover:underline">Sources et références</span>
                  </a>
                </li>
              )}
            </ol>
          </nav>

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {post.sections.map((s, i) => (
              <section key={s.heading} id={slugifyHeading(s.heading)} className="scroll-mt-24 rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
                <h2 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="mr-2 font-mono text-sm text-primary">{String(i + 1).padStart(2, '0')}</span>
                  {s.heading}
                </h2>
                <div className="space-y-3">
                  {s.paragraphs.map((p, j) => (
                    <p key={j} className="text-sm leading-relaxed text-muted-foreground sm:text-base">{p}</p>
                  ))}
                </div>
                {s.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm sm:text-base">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.code && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-border bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                      <span className="text-xs font-medium text-zinc-400">{s.code.title ?? s.code.lang}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-300">{s.code.lang}</span>
                    </div>
                    <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-zinc-100"><code>{s.code.code}</code></pre>
                  </div>
                )}
                {s.tip && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-chart-4/25 bg-chart-4/5 p-4 text-sm">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
                    <p><span className="font-semibold">Conseil pro : </span>{s.tip}</p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Checklist */}
          <div id="checklist" className="mt-10 scroll-mt-24 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ListChecks className="h-5 w-5 text-primary" />Checklist — validez votre optimisation</h2>
            <ul className="space-y-2.5">
              {post.checklist.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div id="faq" className="mt-10 scroll-mt-24 rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><HelpCircle className="h-5 w-5 text-primary" />Questions fréquentes</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {post.faq.map((f) => (
                <div key={f.q} className="rounded-xl border border-border/50 bg-background/60 p-4">
                  <p className="mb-1.5 text-sm font-semibold">{f.q}</p>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sources externes */}
          {post.sources && post.sources.length > 0 && (
            <div id="sources" className="mt-10 scroll-mt-24 rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
                <BookOpen className="h-5 w-5 text-primary" /> Sources et références
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Documentation officielle et références vérifiées utilisées pour cet article.
              </p>
              <ul className="space-y-2">
                {post.sources.map((src) => (
                  <li key={src.url}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-sm transition-colors hover:border-primary/40"
                    >
                      <span className="font-medium group-hover:text-primary">{src.label}</span>
                      <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        {new URL(src.url).hostname.replace(/^www\./, '')}
                        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:flex-row sm:text-left">
            <Gauge className="h-8 w-8 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Mesurez {post.metric ?? 'vos Core Web Vitals'} sur votre site</p>
              <p className="text-sm text-muted-foreground">Audit gratuit : score, métriques réelles et recommandations personnalisées.</p>
            </div>
            <Link href="/outil" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              Tester mon site <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Newsletter */}
          <div className="mt-10">
            <BlogNewsletter />
          </div>

          {/* Auteur */}
          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 sm:flex-row sm:items-center sm:p-7">
            <Image
              src={BLOG_AUTHOR.avatar}
              alt={`Photo de ${BLOG_AUTHOR.name}`}
              width={128}
              height={128}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
              sizes="56px"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Écrit par</p>
              <p className="text-base font-bold">{BLOG_AUTHOR.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{BLOG_AUTHOR.bio}</p>
            </div>
          </div>

          {/* Précédent / Suivant */}
          <nav aria-label="Navigation entre articles" className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="group rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
                <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Précédent
                </span>
                <span className="mt-1.5 block text-sm font-bold leading-snug group-hover:text-primary">
                  {prev.metric ? `${prev.metric} — ` : ''}{prev.title.length > 70 ? `${prev.title.slice(0, 70)}…` : prev.title}
                </span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="group rounded-2xl border border-border/60 bg-card p-4 text-right transition-all hover:border-primary/30 hover:shadow-md">
                <span className="flex items-center justify-end gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Suivant <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1.5 block text-sm font-bold leading-snug group-hover:text-primary">
                  {next.metric ? `${next.metric} — ` : ''}{next.title.length > 70 ? `${next.title.slice(0, 70)}…` : next.title}
                </span>
              </Link>
            ) : <span />}
          </nav>

          {/* Articles liés */}
          <div className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5 text-primary" />Continuer votre lecture</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
                  <Image
                    src={r.cover}
                    alt={r.coverAlt}
                    width={1200}
                    height={630}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="p-5">
                    {r.metric && <span className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{r.metric}</span>}
                    <p className="text-sm font-bold leading-snug group-hover:text-primary">{r.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{r.readingTime} min · {r.category}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" /> Retour au blog
              </Link>
              <BlogShare url={pageUrl} title={post.title} />
            </div>
          </div>
        </div>


      </main>
      <Footer />
    </div>
  )
}
