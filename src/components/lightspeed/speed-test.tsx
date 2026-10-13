'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Loader2, Gauge, Smartphone, Monitor, Zap, RefreshCw, Check, AlertTriangle, XCircle, Download, Layers, Activity, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ScoreRing } from './score-ring'
import { ResourceBreakdown } from './resource-breakdown'
import { CoreWebVitalsRadar } from './core-vitals-radar'
import { IndustryComparison } from './industry-comparison'
import { SocialShare } from './social-share'
import { WaterfallChart } from './waterfall-chart'
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
  inp: number
  /** @deprecated miroir de inp */
  fid?: number
  totalWeight: number
  recommendations: { title: string; description: string; score: number; impact: string }[]
  metrics: { label: string; value: string; status: 'good' | 'average' | 'poor'; hint: string }[]
  resourceBreakdown: { name: string; size: number; color: string; requests: number }[]
  regionLatency: { region: string; latency: number }[]
  waterfall: { name: string; type: string; color: string; startTime: number; duration: number; size: number }[]
  /** Origine de la mesure : lighthouse | pagespeed (réelles) | simulated (démo) */
  source?: string
  measuredAt?: string
  note?: string
}

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  lighthouse: { label: 'Mesure réelle — Lighthouse', className: 'bg-chart-2/15 text-chart-2 border-chart-2/30' },
  pagespeed: { label: 'Mesure réelle — PageSpeed Insights', className: 'bg-chart-2/15 text-chart-2 border-chart-2/30' },
  simulated: { label: 'Simulation — non mesuré', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
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
  const [speedTestId, setSpeedTestId] = React.useState<string | null>(null)
  const [urlError, setUrlError] = React.useState<string | null>(null)
  const [scanError, setScanError] = React.useState<string | null>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  /** Validation locale : format, protocole, longueur. Retourne l'URL normalisée ou null. */
  function validateUrl(raw: string): string | null {
    const trimmed = raw.trim()
    if (!trimmed) {
      setUrlError('Saisissez une URL à analyser, par exemple exemple.com.')
      return null
    }
    if (trimmed.length > 2048) {
      setUrlError('Cette URL est trop longue (2048 caractères max).')
      return null
    }
    if (/[\s<>"]/.test(trimmed)) {
      setUrlError('Cette URL contient des caractères invalides (espaces, <, >, ").')
      return null
    }
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    try {
      const parsed = new URL(withProto)
      if (!parsed.hostname.includes('.')) {
        setUrlError(`« ${trimmed} » ne ressemble pas à un nom de domaine (ex. exemple.com).`)
        return null
      }
      setUrlError(null)
      return withProto
    } catch {
      setUrlError(`« ${trimmed} » n'est pas une URL valide. Vérifiez l'orthographe (ex. exemple.com).`)
      return null
    }
  }

  /** Traduit une erreur technique en message actionnable. */
  function explainError(e: any, resStatus?: number): string {
    if (e?.name === 'AbortError') return 'ANNULÉE'
    const msg = String(e?.message ?? '')
    if (!navigator.onLine || /failed to fetch|networkerror|load failed/i.test(msg)) {
      return "Impossible de joindre le serveur d'analyse. Vérifiez votre connexion puis réessayez."
    }
    if (resStatus === 400 || /URL (requise|invalide)/i.test(msg)) {
      return `${msg || 'URL invalide.'} Vérifiez l'orthographe du domaine.`
    }
    if (resStatus === 429 || /trop de requêtes|rate limit/i.test(msg)) {
      return 'Trop d’analyses en peu de temps. Patientez une minute puis réessayez.'
    }
    if (resStatus === 504 || /timeout|délai|dépassé/i.test(msg)) {
      return "L'analyse a pris trop de temps (site lent ou injoignable). Réessayez ou testez la version mobile."
    }
    if (resStatus && resStatus >= 500) {
      return "Le service d'analyse rencontre un problème. Réessayez dans un instant ou consultez la page Statut."
    }
    return msg || "Impossible d'analyser cette URL pour le moment. Réessayez."
  }

  function cancelScan() {
    abortRef.current?.abort()
    abortRef.current = null
  }

  async function runAnalysis(targetUrl?: string) {
    const finalUrl = validateUrl(targetUrl ?? url)
    if (!finalUrl) return
    setStatus('scanning')
    setResult(null)
    setScanError(null)
    setStepIdx(0)

    const controller = new AbortController()
    abortRef.current = controller

    const interval = setInterval(() => {
      setStepIdx((p) => Math.min(p + 1, SCAN_STEPS.length - 1))
    }, 480)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, device, region }),
        signal: controller.signal,
      })
      const data = await res.json()
      clearInterval(interval)

      if (!res.ok || data.error) {
        throw Object.assign(new Error(data.error || 'Analyse impossible'), { resStatus: res.status })
      }

      setResult(data.result)
      setAnalyzedUrl(finalUrl)
      setSpeedTestId(data.speedTestId ?? null)
      setStatus('done')
      toast({
        title: 'Analyse terminée',
        description: `Score de performance : ${data.result.performance}/100 — site indexé automatiquement et suivi par la surveillance périodique`,
      })
    } catch (e: any) {
      clearInterval(interval)
      setStatus('idle')
      const explanation = explainError(e, e?.resStatus)
      if (explanation === 'ANNULÉE') {
        toast({ title: 'Analyse annulée', description: 'Aucune donnée n’a été enregistrée.' })
      } else {
        setScanError(explanation)
      }
    } finally {
      abortRef.current = null
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
                  inputMode="url"
                  autoComplete="url"
                  placeholder="exemple.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (urlError) setUrlError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
                  className={cn('h-12 pl-11 text-base', urlError && 'border-destructive focus-visible:ring-destructive/30')}
                  disabled={status === 'scanning'}
                  aria-invalid={urlError ? true : undefined}
                  aria-describedby={urlError ? 'outil-url-erreur' : undefined}
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

            {/* Erreur de saisie inline */}
            {urlError && (
              <p id="outil-url-erreur" role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {urlError}
              </p>
            )}

            {/* Erreur d'analyse avec action */}
            {scanError && status === 'idle' && (
              <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center">
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                <p className="flex-1 text-sm">{scanError}</p>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => runAnalysis()}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Réessayer
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href="/status">Statut</a>
                  </Button>
                </div>
              </div>
            )}

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
              <ScanningState stepIdx={stepIdx} steps={SCAN_STEPS} onCancel={cancelScan} />
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
              <ResultsView result={result} url={analyzedUrl} device={device} region={region} speedTestId={speedTestId} onRerun={() => runAnalysis(analyzedUrl)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function ScanningState({ stepIdx, steps, onCancel }: { stepIdx: number; steps: string[]; onCancel: () => void }) {
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
      <p className="max-w-md text-center text-xs text-muted-foreground">
        Progression indicative — la mesure réelle peut prendre jusqu’à une minute selon le site.
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

      <Button variant="outline" size="sm" onClick={onCancel} className="gap-1.5">
        <XCircle className="h-4 w-4" />
        Annuler l’analyse
      </Button>
    </div>
  )
}

function ResultsView({
  result,
  url,
  device,
  region,
  speedTestId,
  onRerun,
}: {
  result: AnalyzeResult
  url: string
  device: string
  region: string
  speedTestId: string | null
  onRerun: () => void
}) {
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
        inp: result.inp,
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
    link.download = `velocita-rapport-${slug}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    toast({ title: 'Rapport exporté', description: 'Le fichier JSON a été téléchargé.' })
  }

  const handleExportCSV = () => {
    const rows: [string, string | number][] = [
      ['url', url],
      ['device', device],
      ['region', region],
      ['date', new Date().toISOString()],
      ['performance', result.performance],
      ['accessibility', result.accessibility],
      ['bestPractices', result.bestPractices],
      ['seo', result.seo],
      ['lcp_s', result.lcp],
      ['fcp_s', result.fcp],
      ['tbt_ms', result.tbt],
      ['cls', result.cls],
      ['si_s', result.si],
      ['ttfb_ms', result.ttfb],
      ['inp_ms', result.inp],
      ['totalWeight_kb', result.totalWeight],
    ]
    const csv = ['metrique,valeur', ...rows.map(([k, v]) => `"${String(k).replace(/"/g, '""')}","${String(v).replace(/"/g, '""')}"`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const slug = url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')
    link.download = `velocita-rapport-${slug}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    toast({ title: 'CSV exporté', description: 'Le fichier CSV a été téléchargé.' })
  }

  const handleExportPDF = () => {
    const slug = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) {
      toast({ title: 'Bloqué', description: 'Autorisez les popups pour générer le PDF.', variant: 'destructive' })
      return
    }
    const rows = result.metrics?.map((m) => `<tr><td>${m.label}</td><td>${m.value}</td><td>${m.hint}</td></tr>`).join('') ?? ''
    const recos = result.recommendations.map((r) => `<li><strong>${r.title}</strong> (${r.impact}) — ${r.description}</li>`).join('')
    win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport Vélocita — ${slug}</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111}h1{font-size:22px}table{border-collapse:collapse;width:100%;margin:16px 0}td,th{border:1px solid #ddd;padding:8px;font-size:13px}ul{font-size:13px}</style></head><body><h1>Rapport Vélocita — ${slug}</h1><p>Performance : <strong>${result.performance}/100</strong> • Accessibilité ${result.accessibility} • SEO ${result.seo} • Bonnes pratiques ${result.bestPractices}</p><p>LCP ${result.lcp}s • FCP ${result.fcp}s • TBT ${result.tbt}ms • CLS ${result.cls} • SI ${result.si}s • TTFB ${result.ttfb}ms • Poids ${(result.totalWeight / 1024).toFixed(1)} Mo • ${device} • ${region} • ${new Date().toLocaleString('fr-FR')}</p><h2>Métriques</h2><table><tr><th>Métrique</th><th>Valeur</th><th>Détail</th></tr>${rows}</table><h2>Recommandations</h2><ul>${recos}</ul><script>window.onload=()=>{window.print()}<\/script></body></html>`)
    win.document.close()
    toast({ title: 'PDF prêt', description: 'Utilisez "Enregistrer en PDF" dans la boîte de dialogue.' })
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
            {result.source && (
              <span
                className={cn(
                  'mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  SOURCE_BADGE[result.source]?.className ?? 'bg-muted text-muted-foreground border-border/60'
                )}
                title={result.note}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    result.source === 'simulated' ? 'bg-amber-500' : 'bg-chart-2'
                  )}
                />
                {SOURCE_BADGE[result.source]?.label ?? result.source}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SocialShare
            url={url}
            score={result.performance}
            lcp={result.lcp}
            cls={result.cls}
          />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            PDF
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
              <VitalCard label="INP" value={`${result.inp ?? result.fid ?? 0}ms`} status={(result.inp ?? result.fid ?? 0) <= 200 ? 'good' : (result.inp ?? result.fid ?? 0) <= 500 ? 'average' : 'poor'} hint="Interaction to Next Paint — Core Web Vital depuis 2024" />
              <VitalCard label="CLS" value={result.cls.toFixed(3)} status={result.cls < 0.1 ? 'good' : result.cls < 0.25 ? 'average' : 'poor'} hint="Cumulative Layout Shift" />
              <VitalCard label="TBT" value={`${result.tbt}ms`} status={result.tbt < 200 ? 'good' : result.tbt < 600 ? 'average' : 'poor'} hint="Total Blocking Time — proxy lab de l'INP" />
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
              <p className="text-xs text-muted-foreground">Interaction to Next Paint</p>
              <p className="text-xl font-bold">{result.inp ?? result.fid ?? 0}ms</p>
            </div>
          </div>

          {/* Radar des Core Web Vitals */}
          <CoreWebVitalsRadar
            metrics={[
              { metric: 'LCP', score: Math.max(0, Math.min(100, Math.round(100 - (result.lcp / 4) * 100))), fullMark: 100 },
              { metric: 'INP', score: Math.max(0, Math.min(100, Math.round(100 - ((result.inp ?? result.fid ?? 0) / 500) * 100))), fullMark: 100 },
              { metric: 'CLS', score: Math.max(0, Math.min(100, Math.round(100 - (result.cls / 0.25) * 100))), fullMark: 100 },
              { metric: 'FCP', score: Math.max(0, Math.min(100, Math.round(100 - (result.fcp / 3) * 100))), fullMark: 100 },
              { metric: 'SI', score: Math.max(0, Math.min(100, Math.round(100 - (result.si / 5.8) * 100))), fullMark: 100 },
              { metric: 'TTFB', score: Math.max(0, Math.min(100, Math.round(100 - (result.ttfb / 500) * 100))), fullMark: 100 },
            ]}
            target={[
              { metric: 'LCP', score: 100, fullMark: 100 },
              { metric: 'INP', score: 100, fullMark: 100 },
              { metric: 'CLS', score: 100, fullMark: 100 },
              { metric: 'FCP', score: 100, fullMark: 100 },
              { metric: 'SI', score: 100, fullMark: 100 },
              { metric: 'TTFB', score: 100, fullMark: 100 },
            ]}
          />

          {/* Comparaison à la moyenne du web */}
          <IndustryComparison
            performance={result.performance}
            lcp={result.lcp}
            weight={result.totalWeight}
          />
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
          Temps de réponse serveur (TTFB — point de mesure)
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Valeur réellement mesurée lors de cet audit. Une mesure multi-régions nécessiterait
          des points de mesure dans chaque région (non disponible actuellement).
        </p>
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

      {/* Cascade de chargement (waterfall) */}
      {result.waterfall && result.waterfall.length > 0 && (
        <div className="border-t border-border/60 p-6 sm:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Activity className="h-4 w-4 text-chart-3" />
            Cascade de chargement des ressources
          </h3>
          <WaterfallChart items={result.waterfall} totalDuration={Math.round(result.si * 1000)} />
        </div>
      )}

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
      {/* Résumé IA (quotas gratuits, cache DB) */}
      <div className="border-t border-border/60 p-6 sm:p-8">
        <AiSummary result={result} url={url} device={device} speedTestId={speedTestId} />
      </div>
    </div>
  )
}

function AiSummary({
  result,
  url,
  device,
  speedTestId,
}: {
  result: AnalyzeResult
  url: string
  device: string
  speedTestId: string | null
}) {
  const [state, setState] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [summary, setSummary] = React.useState<string | null>(null)
  const [model, setModel] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [lang, setLang] = React.useState<'fr' | 'en' | 'es' | 'de'>('fr')
  const [translations, setTranslations] = React.useState<Record<string, string>>({})
  const [translating, setTranslating] = React.useState<string | null>(null)
  const [summaryFr, setSummaryFr] = React.useState<string | null>(null)

  // Reset à chaque nouvelle analyse
  React.useEffect(() => {
    setState('idle')
    setSummary(null)
    setSummaryFr(null)
    setModel(null)
    setError(null)
    setIsStreaming(false)
    setLang('fr')
    setTranslations({})
    setTranslating(null)
  }, [speedTestId])

  async function generate() {
    if (!speedTestId) {
      setError("Analyse non enregistrée en base, relancez le test.")
      setState('error')
      return
    }
    setState('loading')
    setError(null)
    setIsStreaming(true)

    // 1. Tenter le streaming (M1-1)
    try {
      const streamRes = await fetch('/api/ai-summary/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speedTestId,
          recommendations: result.recommendations.map((r) => ({
            title: r.title,
            description: r.description,
            impact: r.impact,
          })),
        }),
      })

      if (streamRes.ok && streamRes.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = streamRes.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          let buffer = ''
          let accumulated = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const payload = trimmed.slice(5).trim()
              if (payload === '[DONE]') continue
              try {
                const json = JSON.parse(payload)
                if (json.delta) {
                  accumulated += json.delta
                  setSummary(accumulated)
                }
                if (json.done) {
                  setModel(json.model)
                }
                if (json.error) {
                  throw new Error(json.error)
                }
              } catch {
                // chunk malformé : on ignore
              }
            }
          }

          setSummaryFr(accumulated)
          setState('done')
          setIsStreaming(false)
          return
        }
      }
      // Si le stream a échoué (404, 503, etc.), on bascule sur l'ancien endpoint
      throw new Error('stream non supporté')
    } catch (streamErr: any) {
      // 2. Fallback : ancien endpoint JSON (M0 non-streamé)
      console.warn('[AiSummary] stream échoué, fallback JSON:', streamErr?.message)
      setIsStreaming(false)
    }

    // 3. Ancien endpoint JSON
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speedTestId,
          recommendations: result.recommendations.map((r) => ({
            title: r.title,
            description: r.description,
            impact: r.impact,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Génération impossible')
      setSummary(data.summary)
      setSummaryFr(data.summary)
      setModel(data.model)
      setState('done')
    } catch (e: any) {
      setError(e.message || 'Impossible de générer le résumé.')
      setState('error')
    }
  }

  async function translate(targetLang: 'en' | 'es' | 'de') {
    if (!speedTestId || !summaryFr) return
    setLang(targetLang)
    setTranslating(targetLang)

    // Si déjà traduit, afficher direct
    if (translations[targetLang]) {
      setSummary(translations[targetLang])
      setTranslating(null)
      return
    }

    try {
      const res = await fetch('/api/ai-summary/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speedTestId, lang: targetLang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Traduction impossible')
      setTranslations((prev) => ({ ...prev, [targetLang]: data.translation }))
      setSummary(data.translation)
    } catch (e: any) {
      console.warn('[AiSummary] traduction échouée:', e?.message)
      // Fallback : garder la version FR
      setLang('fr')
    } finally {
      setTranslating(null)
    }
  }

  function switchToFr() {
    setLang('fr')
    setSummary(summaryFr)
  }

  const langButtons = [
    { code: 'fr', label: '🇫🇷 FR', active: lang === 'fr', onClick: switchToFr },
    { code: 'en', label: '🇬🇧 EN', active: lang === 'en', onClick: () => translate('en') },
    { code: 'es', label: '🇪🇸 ES', active: lang === 'es', onClick: () => translate('es') },
    { code: 'de', label: '🇩🇪 DE', active: lang === 'de', onClick: () => translate('de') },
  ]

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Résumé IA
        {model && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium normal-case text-primary">
            {model} • quota gratuit
          </span>
        )}
        {state === 'done' && summaryFr && (
          <span className="ml-auto flex gap-1">
            {langButtons.map((b) => (
              <button
                key={b.code}
                onClick={b.onClick}
                disabled={translating !== null && translating !== b.code}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  b.active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                } ${translating === b.code ? 'animate-pulse' : ''}`}
                title={b.code === 'fr' ? 'Français' : b.code === 'en' ? 'English' : b.code === 'es' ? 'Español' : 'Deutsch'}
              >
                {b.label}
              </button>
            ))}
          </span>
        )}
      </h3>
      {state === 'done' && summary ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {summary}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
          )}
        </div>
      ) : state === 'loading' && summary ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {summary}
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border/60 bg-background/40 p-4">
          <p className="text-xs text-muted-foreground">
            Analyse experte de ce rapport en français : verdict, top 3 priorités et snippet de correction.
            Généré via Groq / Gemini / OpenRouter (offres gratuites), résultat mis en cache.
          </p>
          {state === 'error' && error && <p className="text-xs text-destructive">{error}</p>}
          <Button size="sm" onClick={generate} disabled={state === 'loading'} className="gap-1.5">
            {state === 'loading' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Générer le résumé IA
              </>
            )}
          </Button>
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
