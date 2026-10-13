'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Placeholder de chargement qui épouse la forme du contenu (ne bloque pas la mise en page). */
export function LoadingSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('animate-pulse space-y-3', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-md bg-muted"
          style={{ width: `${100 - ((i * 17) % 40)}%` }}
        />
      ))}
    </div>
  )
}

/** Grille de cartes skeleton (dashboard, benchmark, leaderboard). */
export function CardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-6" aria-hidden="true">
          <div className="mb-4 h-10 w-10 rounded-xl bg-muted" />
          <div className="mb-2 h-5 w-2/3 rounded-md bg-muted" />
          <LoadingSkeleton lines={2} />
        </div>
      ))}
    </div>
  )
}

/** État d'erreur avec action : réessayer + lien statut. */
export function LoadError({
  title = 'Chargement impossible',
  message = 'Les données n’ont pas pu être récupérées. Vérifiez votre connexion puis réessayez.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-14 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Réessayer
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <a href="/status">Voir le statut</a>
        </Button>
      </div>
    </div>
  )
}
