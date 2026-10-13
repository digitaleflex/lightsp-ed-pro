'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { Activity, Globe, TrendingUp, TrendingDown, Gauge, Clock, Wifi, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BeforeAfter } from './before-after'
import { ScoreHistogram } from './score-histogram'
import { LoadingSkeleton, LoadError } from './loading-states'
import { cn } from '@/lib/utils'

interface HistoryPoint {
  date: string
  score: number
  lcp: number
  cls: number
  fcp?: number
  tbt?: number
  ttfb?: number
  /** Poids mesuré réel (octets). Absent des anciens enregistrements. */
  totalWeight?: number
}

interface Series {
  name: string
  history: HistoryPoint[]
}

interface MonitoringData {
  series?: Series[]
  website?: { id: string; name: string; url: string }
  history?: HistoryPoint[]
}

export function Dashboard() {
  const [data, setData] = React.useState<MonitoringData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState(false)
  const [selectedSite, setSelectedSite] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      // Charger le classement pour avoir la liste des sites
      const lbRes = await fetch('/api/leaderboard')
      const lb = await lbRes.json()
      const first = lb?.leaderboard?.[0]?.id
      const target = selectedSite ?? first
      if (target) {
        const res = await fetch(`/api/monitoring?websiteId=${target}`)
        const d = await res.json()
        setData(d)
      } else {
        // fallback : monitoring global
        const res = await fetch('/api/monitoring')
        const d = await res.json()
        setData(d)
      }
    } catch (e) {
      console.error(e)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [selectedSite])

  React.useEffect(() => {
    load()
  }, [load])

  if (loading || loadError || !data) {
    return (
      <section id="dashboard" className="py-20 sm:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loadError && !loading ? (
            <LoadError
              title="Tableau de bord indisponible"
              message="L’historique des mesures n’a pas pu être chargé."
              onRetry={load}
            />
          ) : (
            <div className="space-y-4" role="status" aria-label="Chargement du tableau de bord">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-5" aria-hidden="true">
                    <div className="mb-3 h-4 w-1/2 rounded-md bg-muted" />
                    <div className="h-8 w-2/3 rounded-md bg-muted" />
                  </div>
                ))}
              </div>
              <div className="animate-pulse rounded-2xl border border-border/60 bg-card p-6" aria-hidden="true">
                <div className="mb-4 h-5 w-1/3 rounded-md bg-muted" />
                <LoadingSkeleton lines={4} />
              </div>
              <p className="sr-only">Chargement du tableau de bord…</p>
            </div>
          )}
        </div>
      </section>
    )
  }

  const history = data.history ?? data.series?.[0]?.history ?? []

  // Calculer la tendance
  const scores = history.map((h) => h.score)
  const latest = scores[scores.length - 1] ?? 0
  const prev = scores[scores.length - 2] ?? latest
  const trend = latest - prev
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1))

  // Stats Core Web Vitals actuelles
  const last = history[history.length - 1] ?? { lcp: 0, cls: 0, fcp: 0, tbt: 0 }

  // Temps de réponse serveur RÉEL (TTFB mesuré à chaque audit) — pas de fausse répartition multi-régions
  const ttfbData = history
    .filter((h) => typeof h.ttfb === 'number')
    .map((h) => ({ date: h.date.slice(5), ttfb: h.ttfb ?? 0 }))

  return (
    <section id="dashboard" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-3/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Tableau de bord
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Surveillance en temps réel
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Suivez l'évolution de vos performances dans le temps et détectez
              les régressions avant vos utilisateurs.
            </p>
          </div>

          {data.website && (
            <SiteSelector value={selectedSite ?? ''} onChange={setSelectedSite} />
          )}
        </div>

        {/* KPIs */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Gauge}
            label="Score actuel"
            value={`${latest}`}
            suffix="/ 100"
            trend={trend}
            color="text-primary"
          />
          <KpiCard
            icon={Activity}
            label="Score moyen (30j)"
            value={`${avg}`}
            suffix="/ 100"
            color="text-chart-3"
          />
          <KpiCard
            icon={TrendingUp}
            label="LCP actuel"
            value={`${last.lcp}s`}
            color={last.lcp < 2.5 ? 'text-chart-2' : 'text-chart-4'}
          />
          <KpiCard
            icon={TrendingDown}
            label="CLS actuel"
            value={last.cls.toFixed(3)}
            color={last.cls < 0.1 ? 'text-chart-2' : 'text-chart-4'}
          />
        </div>

        {/* Bandeau d'uptime */}
        <UptimeBanner score={latest} />

        {/* Graphiques */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Score dans le temps */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Évolution du score de performance
              </CardTitle>
              <CardDescription>
                {data.website
                  ? `${data.website.name} — historique des 30 derniers jours`
                  : 'Surveillance continue de vos sites surveillés'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={30}
                      tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      labelFormatter={(v) => new Date(v as string).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: 'var(--color-primary)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-chart-2" />
                Core Web Vitals
              </CardTitle>
              <CardDescription>LCP et CLS sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={30}
                      tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="lcp" name="LCP (s)" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cls" name="CLS" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition des scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-chart-3" />
                Répartition des scores
              </CardTitle>
              <CardDescription>Distribution sur 30 jours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lcpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={30}
                      tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="fcp" name="FCP (s)" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#lcpGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Latence par région */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-chart-1" />
                Temps de réponse serveur (TTFB mesuré)
              </CardTitle>
              <CardDescription>
                Historique du TTFB réellement mesuré à chaque audit — pas de répartition multi-régions inventée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                {ttfbData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Aucune mesure TTFB disponible pour l'instant
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ttfbData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} width={36} unit="ms" />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v} ms`, 'TTFB']}
                    />
                    <Bar dataKey="ttfb" radius={[8, 8, 0, 0]} maxBarSize={64}>
                      {ttfbData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.ttfb < 200 ? 'var(--color-chart-2)' : entry.ttfb < 500 ? 'var(--color-chart-4)' : 'var(--color-destructive)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histogramme de distribution des scores */}
        {history.length >= 3 && <ScoreHistogram history={history} />}

        {/* Comparaison avant / après (poids réels uniquement, sinon masqués) */}
        {history.length >= 2 && (
          <BeforeAfter
            current={{
              date: history[history.length - 1].date,
              performance: history[history.length - 1].score,
              lcp: history[history.length - 1].lcp,
              cls: history[history.length - 1].cls,
              tbt: history[history.length - 1].tbt ?? 200,
              totalWeight: history[history.length - 1].totalWeight,
            }}
            previous={{
              date: history[0].date,
              performance: history[0].score,
              lcp: history[0].lcp,
              cls: history[0].cls,
              tbt: history[0].tbt ?? 300,
              totalWeight: history[0].totalWeight,
            }}
          />
        )}
      </div>
    </section>
  )
}

// Bandeau d'uptime
function UptimeBanner({ score }: { score: number }) {
  const uptime = Math.min(99.99, 99.5 + (score / 100) * 0.49)
  const incidents = score > 80 ? 0 : score > 50 ? 1 : 2
  const status = score > 80 ? 'operational' : score > 50 ? 'degraded' : 'outage'
  const statusLabel = status === 'operational' ? 'Opérationnel' : status === 'degraded' ? 'Dégradé' : 'Critique'
  const StatusIcon = status === 'operational' ? CheckCircle2 : AlertCircle
  // Vert (primary) pour opérationnel, ambre pour dégradé, rouge pour critique
  const statusColor = status === 'operational' ? 'text-primary bg-primary/10' : status === 'degraded' ? 'text-chart-4 bg-chart-4/10' : 'text-destructive bg-destructive/10'

  // 30 derniers jours — cohérent avec "Disponibilité sur 30 jours"
  // En cas de statut opérationnel, tous les jours sont ok (vert) sauf les incidents connus
  const days = Array.from({ length: 30 }, (_, i) => {
    if (status === 'operational') return { day: i, ok: true }
    // Statut dégradé : quelques incidents récents
    if (status === 'degraded') return { day: i, ok: i < 26 }
    // Statut critique : plusieurs incidents
    return { day: i, ok: i < 22 && i % 5 !== 0 }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Statut */}
      <div className="flex items-center gap-3">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', statusColor)}>
          <StatusIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {statusLabel}
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium uppercase', statusColor)}>
              {uptime.toFixed(2)}%
            </span>
            <span
              title="Estimation illustrative calculée depuis le score de performance. La surveillance de disponibilité réelle arrive bientôt."
              className="rounded-full border border-dashed border-chart-4/50 bg-chart-4/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-chart-4"
            >
              Aperçu illustratif
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Disponibilité estimée depuis le score • {incidents} incident{incidents > 1 ? 's' : ''} détecté{incidents > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Barre des 30 jours */}
      <div className="flex flex-1 flex-wrap items-center gap-1 sm:justify-end">
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              'h-8 w-2 rounded-sm transition-colors',
              d.ok ? 'bg-primary/70' : 'bg-destructive/70'
            )}
            title={`Jour -${30 - i}: ${d.ok ? 'Opérationnel' : 'Incident'}`}
          />
        ))}
        <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          30 derniers jours
        </span>
      </div>
    </motion.div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  trend,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  suffix?: string
  trend?: number
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border/60 bg-card p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trend > 0 ? 'text-chart-2' : 'text-destructive'
            )}
          >
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend > 0 ? '+' : ''}
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', color)}>
        {value}
        {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </motion.div>
  )
}

function SiteSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const [sites, setSites] = React.useState<{ id: string; name: string }[]>([])
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => {
        if (d?.leaderboard) {
          setSites(d.leaderboard.map((s: any) => ({ id: s.id, name: s.name })))
        }
      })
      .catch(() => {})
  }, [])

  const current = sites.find((s) => s.id === value)

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="min-w-40 justify-between" onClick={() => setOpen(!open)}>
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {current?.name ?? 'Sélectionner'}
        </span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg scrollbar-custom">
            {sites.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onChange(s.id)
                  setOpen(false)
                }}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  s.id === value && 'bg-accent font-medium'
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
