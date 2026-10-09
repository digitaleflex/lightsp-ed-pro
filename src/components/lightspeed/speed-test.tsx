'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Loader2, Gauge, Smartphone, Monitor, Zap, RefreshCw, Check, AlertTriangle, XCircle, Share2, Download, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ScoreRing } from './score-ring'
import { ResourceBreakdown } from './resource-breakdown'
import { RecentSearches } from './recent-searches'
import { toast } from '@/hooks/use-toast'

interface AnalyzeResult {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  lcp: number
  fcp: number
  tbt: number
  cls: number
  si: number
  ttfb: number
  fid: number
  totalWeight: number
  recommendations: { title: string; description: string; score: number; impact: string }[]
  metrics: { label: string; value: string; status: 'good' | 'average' | 'poor'; hint: string }[]
  resourceBreakdown: { name: string; size: number; color: string; requests: number }[]
  regionLatency: { region: string; latency: number }[]
}

type Status = 'idle' | 'scanning' | 'done'

const SCAN_STEPS = [
  'Résolution du domaine…',
  'Connexion au serveur…',
  'Analyse du DOM…',
  'Mesure du First Contentful Paint…',
  'Mesure du Largest Contentful Paint…',
  'Calcul du Total Blocking Time…',
  'Audit des Core Web Vitals…',
  'Génération du rapport Lighthouse…',
]

const REGIONS = [
  { id: 'europe', label: 'Europe' },
  { id: 'na', label: 'Amérique du Nord' },
  { id: 'apac', label: 'Asie-Pacifique' },
] as const

const EXAMPLE_SITES = ['vercel.com', 'nextjs.org', 'tailwindcss.com', 'stripe.com']

export function SpeedTest() {
  const [url, setUrl] = React.useState('')
  const [device, setDevice] = React.useState<'desktop' | 'mobile'>('desktop')
  const [region, setRegion] = React.useState<string>('europe')
  const [status, setStatus] = React.useState<Status>('idle')
  const [result, setResult] = React.useState<AnalyzeResult | null>(null)
  const [stepIdx, setStepIdx] = React.useState(0)
  const [analyzedUrl, setAnalyzedUrl] = React.useState('')

  async function runAnalysis(targetUrl?: string) {
    const finalUrl = (targetUrl ?? url).trim()
    if (!finalUrl) {
      toast({ title: 'URL requise', description: 'Saisissez une URL à analyser.', variant: 'destructive' })
      return
    }
    setStatus('scanning')
    setResult(null)
    setStepIdx(0)

    const interval = setInterval(() => {
      setStepIdx((p) => Math.min(p + 1, SCAN_STEPS.length - 1))
    }, 480)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, device, region }),
      })
      const data = await res.json()
      clearInterval(interval)

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Analyse impossible')
      }

      setResult(data.result)
      setAnalyzedUrl(finalUrl)
      setStatus('done')
      toast({
        title: 'Analyse terminée',
        description: `Score de performance : ${data.result.performance}/100`,
      })
    } catch (e: any) {
      clearInterval(interval)
      setStatus('idle')
      toast({
        title: 'Erreur',
        description: e.message || 'Impossible d\'analyser cette URL.',
        variant: 'destructive',
      })
    }
  }

  return (
    <section id="outil" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[400px] -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Outil gratuit
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Analysez la vitesse de votre site
          </h2>
          <p className="mt-4 text-muted-foreground">
            Saisissez une URL et obtenez un audit Lighthouse complet avec les
            Core Web Vitals en quelques secondes.
          </p>
        </div>

        {/* Carte principale */}
        <div className="mx-auto max-w-3xl rounded-3xl border border-border/60 bg-card p-6 shadow-xl sm:p-8">
          {/* Formulaire */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="exemple.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
                  className="h-12 pl-11 text-base"
                  disabled={status === 'scanning'}
                />
              </div>
              <Button
                size="lg"
                className="h-12 gap-2 shadow-lg shadow-primary/20"
                onClick={() => runAnalysis()}
                disabled={status === 'scanning' || !url}
              >
                {status === 'scanning' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" fill="currentColor" />
                    Lancer l'analyse
                  </>
                )}
              </Button>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Appareil */}
              <div className="inline-flex rounded-lg border border-border/60 bg-background/60 p-1">
                <button
                  onClick={() => setDevice('desktop')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    device === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  Bureau
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    device === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </button>
              </div>

              {/* Région */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Région :</span>
                <div className="inline-flex rounded-lg border border-border/60 bg-background/60 p-1">
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRegion(r.id)}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                        region === r.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Exemples */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Essayez :</span>
              {EXAMPLE_SITES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setUrl(s)
                    runAnalysis(s)
                  }}
                  disabled={status === 'scanning'}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Analyses récentes (carrousel horizontal) */}
          {status === 'idle' && (
            <RecentSearches
              onPick={(u) => {
                setUrl(u)
                runAnalysis(u)
              }}
            />
          )}
        </div>

        {/* Résultats */}
        <AnimatePresence mode="wait">
          {status === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border/60 bg-card p-8"
            >
              <ScanningState stepIdx={stepIdx} steps={SCAN_STEPS} />
            </motion.div>
          )}

          {status === 'done' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto mt-8 max-w-4xl"
            >
              <ResultsView result={result} url={analyzedUrl} device={device} region={region} onRerun={() => runAnalysis(analyzedUrl)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function ScanningState({ stepIdx, steps }: { stepIdx: number; steps: string[] }) {
  const pct = Math.round(((stepIdx + 1) / steps.length) * 100)
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Jauge circulaire avec pourcentage */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
          <circle cx={48} cy={48} r={42} fill="none" stroke="var(--color-muted)" strokeWidth={6} opacity={0.4} />
          <motion.circle
            cx={48}
            cy={48}
            r={42}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-primary">{pct}%</span>
          <Gauge className="h-4 w-4 text-primary/60" />
        </div>
      </div>

      <p className="text-sm font-medium text-foreground">
        Analyse en cours… <span className="text-muted-foreground">étape {stepIdx + 1}/{steps.length}</span>
      </p>

      {/* Barre de progression */}
      <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="w-full max-w-md space-y-1.5">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors',
              i < stepIdx
                ? 'text-muted-foreground'
                : i === stepIdx
                ? 'bg-primary/5 font-medium text-foreground'
                : 'text-muted-foreground/40'
            )}
          >
            {i < stepIdx ? (
              <Check className="h-4 w-4 text-chart-2" />
            ) : i === stepIdx ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-current" />
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultsView({
  result,
  url,
  device,
  region,
  onRerun,
}: {
  result: AnalyzeResult
  url: string
  device: string
  region: string
  onRerun: () => void
}) {
  const handleShare = async () => {
    const summary = `Lightspeed — Rapport pour ${url}\nPerformance : ${result.performance}/100\nLCP : ${result.lcp}s • TBT : ${result.tbt}ms • CLS : ${result.cls}\n${result.recommendations.length} recommandations d'optimisation`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Rapport Lightspeed — ${url}`, text: summary })
      } else {
        await navigator.clipboard.writeText(summary)
        toast({ title: 'Rapport copié', description: 'Résumé copié dans le presse-papier.' })
      }
    } catch {
      // Annulation par l'utilisateur, ignorer
    }
  }

  const handleExport = () => {
    const report = {
      url,
      device,
      region,
      date: new Date().toISOString(),
      scores: {
        performance: result.performance,
        accessibility: result.accessibility,
        bestPractices: result.bestPractices,
        seo: result.seo,
      },
      coreWebVitals: {
        lcp: result.lcp,
        fcp: result.fcp,
        tbt: result.tbt,
        cls: result.cls,
        si: result.si,
        ttfb: result.ttfb,
        fid: result.fid,
      },
      totalWeight: result.totalWeight,
      resourceBreakdown: result.resourceBreakdown,
      regionLatency: result.regionLatency,
      recommendations: result.recommendations,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const slug = url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')
    link.download = `lightspeed-rapport-${slug}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    toast({ title: 'Rapport exporté', description: 'Le fichier JSON a été téléchargé.' })
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{url.replace(/^https?:\/\//, '')}</p>
            <p className="text-xs text-muted-foreground">
              {device === 'mobile' ? 'Mobile' : 'Bureau'} • {REGIONS.find((r) => r.id === region)?.label} •{' '}
              {new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Partager
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={onRerun} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Relancer
          </Button>
        </div>
      </div>

      {/* Scores principaux */}
      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-4">
          <ScoreRing score={result.performance} size={160} label="Performance" />
          <div className="grid grid-cols-3 gap-3">
            <ResultScore label="Accessibilité" value={result.accessibility} />
            <ResultScore label="Bonnes pratiques" value={result.bestPractices} />
            <ResultScore label="SEO" value={result.seo} />
          </div>
        </div>

        {/* Core Web Vitals + métriques */}
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Core Web Vitals
              </h3>
              {/* Légende de couleur */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Bon
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-chart-4" />
                  Moyen
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Faible
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <VitalCard label="LCP" value={`${result.lcp}s`} status={result.lcp < 2.5 ? 'good' : result.lcp < 4 ? 'average' : 'poor'} hint="Largest Contentful Paint" />
              <VitalCard label="TBT" value={`${result.tbt}ms`} status={result.tbt < 200 ? 'good' : result.tbt < 600 ? 'average' : 'poor'} hint="Total Blocking Time" />
              <VitalCard label="CLS" value={result.cls.toFixed(3)} status={result.cls < 0.1 ? 'good' : result.cls < 0.25 ? 'average' : 'poor'} hint="Cumulative Layout Shift" />
              <VitalCard label="FCP" value={`${result.fcp}s`} status={result.fcp < 1.8 ? 'good' : result.fcp < 3 ? 'average' : 'poor'} hint="First Contentful Paint" />
              <VitalCard label="SI" value={`${result.si}s`} status={result.si < 3.4 ? 'good' : result.si < 5.8 ? 'average' : 'poor'} hint="Speed Index" />
              <VitalCard label="TTFB" value={`${result.ttfb}ms`} status={result.ttfb < 200 ? 'good' : result.ttfb < 500 ? 'average' : 'poor'} hint="Time to First Byte" />
            </div>
          </div>

          {/* Poids total */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Poids total de la page</p>
              <p className="text-xl font-bold">{(result.totalWeight / 1024).toFixed(1)} Mo</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">First Input Delay</p>
              <p className="text-xl font-bold">{result.fid}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition des ressources */}
      <div className="border-t border-border/60 p-6 sm:p-8">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Layers className="h-4 w-4 text-chart-3" />
          Répartition des ressources
        </h3>
        <ResourceBreakdown resources={result.resourceBreakdown} />
      </div>

      {/* Latence par région */}
      <div className="border-t border-border/60 p-6 sm:p-8">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Globe className="h-4 w-4 text-chart-1" />
          Latence par région (TTFB)
        </h3>
        <div className="space-y-3">
          {result.regionLatency.map((r) => {
            const maxLat = Math.max(...result.regionLatency.map((x) => x.latency))
            const pct = (r.latency / maxLat) * 100
            const good = r.latency < 200
            const avg = r.latency < 500
            return (
              <div key={r.region} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm font-medium">{r.region}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn('h-full rounded-full', good ? 'bg-chart-2' : avg ? 'bg-chart-4' : 'bg-destructive')}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-semibold tabular-nums">{r.latency}ms</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommandations */}
      {result.recommendations.length > 0 && (
        <div className="border-t border-border/60 p-6 sm:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-chart-4" />
            Recommandations d'optimisation
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {result.recommendations.map((r) => (
              <div key={r.title} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold">{r.title}</h4>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      r.impact === 'Élevé'
                        ? 'bg-destructive/10 text-destructive'
                        : r.impact === 'Moyen'
                        ? 'bg-chart-4/15 text-chart-4'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {r.impact}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{r.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        r.score >= 0.9 ? 'bg-chart-2' : r.score >= 0.5 ? 'bg-chart-4' : 'bg-destructive'
                      )}
                      style={{ width: `${r.score * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{Math.round(r.score * 100)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultScore({ label, value }: { label: string; value: number }) {
  const color = value >= 90 ? 'text-chart-2' : value >= 50 ? 'text-chart-4' : 'text-destructive'
  return (
    <div className="rounded-lg border border-border/50 bg-background/60 p-3 text-center">
      <p className={cn('text-xl font-bold', color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function VitalCard({
  label,
  value,
  status,
  hint,
}: {
  label: string
  value: string
  status: 'good' | 'average' | 'poor'
  hint: string
}) {
  const color =
    status === 'good'
      ? 'border-chart-2/30 bg-chart-2/5'
      : status === 'average'
      ? 'border-chart-4/30 bg-chart-4/5'
      : 'border-destructive/30 bg-destructive/5'
  const dot = status === 'good' ? 'bg-chart-2' : status === 'average' ? 'bg-chart-4' : 'bg-destructive'
  const Icon = status === 'good' ? Check : status === 'average' ? AlertTriangle : XCircle
  const iconColor = status === 'good' ? 'text-chart-2' : status === 'average' ? 'text-chart-4' : 'text-destructive'
  return (
    <div className={cn('rounded-xl border p-3', color)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <Icon className={cn('h-3.5 w-3.5', iconColor)} />
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
      <span className={cn('mt-2 inline-block h-1 w-8 rounded-full', dot)} />
    </div>
  )
}
