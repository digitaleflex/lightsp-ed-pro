/**
 * Affiché automatiquement par Next.js pendant les transitions entre pages
 * du dashboard (changement d'URL, navigation interne). Réduit le perceived lag.
 */
export default function DashboardLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-5 py-10">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-3 w-64 rounded bg-muted" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/60" />
          ))}
        </div>
        {/* Sites card skeleton */}
        <div className="rounded-xl border border-border/60 bg-card/70 p-6">
          <div className="mb-4 space-y-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-3 w-64 rounded bg-muted" />
          </div>
          <div className="h-10 w-full rounded bg-muted/60" />
          <div className="mt-4 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}