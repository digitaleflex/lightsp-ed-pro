'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { BLOG_POSTS } from '@/lib/blog'

/**
 * Section Blog pour la home : aperçu des 3 guides phares + lien vers /blog.
 * Ancre : #blog
 */
export function BlogHome() {
  const featured = BLOG_POSTS.slice(0, 3)

  return (
    <section id="blog" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <BookOpen className="h-4 w-4" />
            Blog
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comprendre les Core Web Vitals
          </h2>
          <p className="mt-4 text-muted-foreground">
            Les métriques de performance expliquées simplement, avec leurs seuils
            de référence Google — et des guides d’optimisation complets.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={p.cover}
                    alt={p.coverAlt}
                    width={1200}
                    height={630}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6 pt-4">
                <div className="mb-3 flex items-center gap-2 text-[11px]">
                  {p.metric ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">{p.metric}</span>
                  ) : (
                    <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">Guide pilier</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />{p.readingTime} min
                  </span>
                </div>
                <h3 className="text-base font-bold leading-snug tracking-tight group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Lire l’article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            Voir tous les guides ({BLOG_POSTS.length} articles)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
