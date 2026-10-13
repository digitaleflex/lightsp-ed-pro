import Link from 'next/link'
import { SECTIONS } from '@/lib/sections'

export default function SectionNotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Page introuvable</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cette section n’existe pas</h1>
      <p className="mt-3 text-muted-foreground">
        Retournez à l’accueil assemblé ou explorez une page détaillée existante.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Accueil assemblé
        </Link>
        {SECTIONS.slice(0, 6).map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
