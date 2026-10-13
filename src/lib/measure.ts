// Mesure RÉELLE de performance web.
//
// Ordre de priorité :
//   1. PageSpeed Insights (API Google) si PSI_API_KEY est défini
//   2. Lighthouse en local (Chrome headless installé sur la machine)
//   3. Repli sur le simulateur de performance.ts — TOUJOURS marqué source: 'simulated'
//
// Contrairement à analyzeUrl() (simulation), cette mesure charge réellement la page.

import type { LighthouseResult } from './performance'
import { analyzeUrl, buildMetrics } from './performance'

export type MeasureSource = 'lighthouse' | 'pagespeed' | 'simulated'

export interface Measurement extends LighthouseResult {
  source: MeasureSource
  measuredAt: string
  /** Message explicite quand la mesure n'est pas réelle */
  note?: string
}

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const DEFAULT_TIMEOUT_MS = Number(process.env.MEASURE_TIMEOUT_MS ?? 180_000)

// ---------------------------------------------------------------------------
// Analyse d'un rapport Lighthouse (LHR) — commun PSI et Lighthouse local
// ---------------------------------------------------------------------------

const FR_TITLES: Record<string, string> = {
  'server-response-time': 'Réduire le temps de réponse du serveur (TTFB)',
  'render-blocking-resources': 'Éliminer les ressources de blocage de rendu',
  'unused-javascript': 'Réduire le JavaScript inutilisé',
  'unused-css-rules': 'Réduire le CSS inutilisé',
  'modern-image-formats': 'Diffuser les images au format moderne (WebP/AVIF)',
  'uses-optimized-images': 'Optimiser les images',
  'uses-responsive-images': 'Servir des images adaptées à la taille d\'écran',
  'offscreen-images': 'Diffuser les images hors écran (lazy loading)',
  'uses-text-compression': 'Activer la compression textuelle',
  'uses-long-cache-ttl': 'Mettre en cache les ressources statiques',
  'total-byte-weight': 'Réduire le poids total des ressources',
  'mainthread-work-breakdown': 'Réduire le travail du thread principal',
  'bootup-time': 'Réduire le temps de démarrage JavaScript',
  'font-display': 'Utiliser une police web optimisée (font-display)',
  'cumulative-layout-shift': 'Réduire les décalages de mise en page (CLS)',
  'largest-contentful-paint-element': 'Accélérer le plus grand élément visible (LCP)',
  'unsized-images': 'Définir les dimensions des images',
  'dom-size': 'Réduire la taille du DOM',
  'efficient-animated-content': 'Optimiser les contenus animés',
  'third-party-summary': 'Réduire l\'impact des scripts tiers',
  'legacy-javascript': 'Éviter le JavaScript legacy',
  'unminified-css': 'Minifier le CSS',
  'unminified-javascript': 'Minifier le JavaScript',
  'unused-preload': 'Supprimer les preload inutilisés',
  'redirects': 'Éviter les redirections',
}

const TYPE_META: Record<string, { name: string; color: string }> = {
  Document: { name: 'Autres', color: 'var(--color-chart-5)' },
  Script: { name: 'JavaScript', color: 'var(--color-chart-1)' },
  Stylesheet: { name: 'CSS', color: 'var(--color-chart-3)' },
  Image: { name: 'Images', color: 'var(--color-chart-2)' },
  Font: { name: 'Polices', color: 'var(--color-chart-4)' },
  Media: { name: 'Autres', color: 'var(--color-chart-5)' },
  XHRFetch: { name: 'JavaScript', color: 'var(--color-chart-1)' },
  Other: { name: 'Autres', color: 'var(--color-chart-5)' },
}

const GROUP_COLOR: Record<string, string> = {
  JavaScript: 'var(--color-chart-1)',
  Images: 'var(--color-chart-2)',
  CSS: 'var(--color-chart-3)',
  Polices: 'var(--color-chart-4)',
  Autres: 'var(--color-chart-5)',
}

function stripMarkdown(text: string): string {
  return (text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function auditNum(lhr: any, id: string): number {
  const v = lhr?.audits?.[id]?.numericValue
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

/**
 * Score de catégorie recalculé en excluant les audits en échec technique
 * (PROTOCOL_TIMEOUT, etc.) : un audit non exécuté ne doit pas faire chuter
 * artificiellement la catégorie à 0.
 */
function categoryScore(lhr: any, id: string): number {
  const cat = lhr?.categories?.[id]
  if (!cat) return 0
  let num = 0
  let den = 0
  for (const ref of cat.auditRefs ?? []) {
    const audit = lhr?.audits?.[ref.id]
    if (!audit || audit.score === null || audit.score === undefined) continue
    if (audit.scoreDisplayMode === 'error' || audit.scoreDisplayMode === 'notApplicable') continue
    const w = ref.weight ?? 0
    num += audit.score * w
    den += w
  }
  if (den === 0) return Math.round((cat.score ?? 0) * 100)
  return Math.round((num / den) * 100)
}

/** Vrai si au moins les métriques principales sont exploitables */
function hasCoreMetrics(lhr: any): boolean {
  return auditNum(lhr, 'largest-contentful-paint') > 0 || auditNum(lhr, 'first-contentful-paint') > 0
}

/** Convertit un rapport Lighthouse (LHR) en LighthouseResult de l'application */
export function parseLhr(lhr: any): LighthouseResult {
  const performance = categoryScore(lhr, 'performance')
  const accessibility = categoryScore(lhr, 'accessibility')
  const bestPractices = categoryScore(lhr, 'best-practices')
  const seo = categoryScore(lhr, 'seo')

  const lcp = +(auditNum(lhr, 'largest-contentful-paint') / 1000).toFixed(2)
  const fcp = +(auditNum(lhr, 'first-contentful-paint') / 1000).toFixed(2)
  const tbt = Math.round(auditNum(lhr, 'total-blocking-time'))
  const cls = +auditNum(lhr, 'cumulative-layout-shift').toFixed(3)
  const si = +(auditNum(lhr, 'speed-index') / 1000).toFixed(2)
  const ttfb = Math.round(auditNum(lhr, 'server-response-time'))
  // INP (ms) — Core Web Vital interactivité depuis mars 2024 (remplace FID).
  // Lighthouse 12+ : audit interaction-to-next-paint ; repli max-potential-fid / estimated-input-latency.
  const inp = Math.round(
    auditNum(lhr, 'interaction-to-next-paint') ||
      auditNum(lhr, 'max-potential-fid') ||
      auditNum(lhr, 'estimated-input-latency')
  )
  const fid = inp // DEPRECATED : miroir pour compatibilité

  // Répartition des ressources (audit resource-summary) — tailles réelles transférées
  const summaryItems: any[] = lhr?.audits?.['resource-summary']?.details?.items ?? []
  const groups = new Map<string, { size: number; requests: number }>()
  for (const item of summaryItems) {
    const label: string = item?.label ?? item?.resourceType ?? 'Other'
    const type = TYPE_META[label] ?? TYPE_META[item?.resourceType] ?? TYPE_META.Other
    const acc = groups.get(type.name) ?? { size: 0, requests: 0 }
    acc.size += Math.round((item?.transferSize ?? 0) / 1024) // octets → Ko
    acc.requests += item?.requestCount ?? 0
    groups.set(type.name, acc)
  }

  const order = ['JavaScript', 'Images', 'CSS', 'Polices', 'Autres']
  let resourceBreakdown = order
    .filter((n) => groups.has(n))
    .map((n) => ({ name: n, size: groups.get(n)!.size, color: GROUP_COLOR[n], requests: groups.get(n)!.requests }))

  // Si l'audit resource-summary est absent, utiliser total-byte-weight
  const totalWeight =
    resourceBreakdown.length > 0
      ? resourceBreakdown.reduce((s, r) => s + r.size, 0)
      : Math.round(auditNum(lhr, 'total-byte-weight') / 1024)

  if (resourceBreakdown.length === 0) {
    resourceBreakdown = [{ name: 'Autres', size: totalWeight, color: GROUP_COLOR.Autres, requests: 0 }]
  }

  // Recommandations : audits Lighthouse réellement en échec, triés par économies potentielles
  const recommendations = Object.values(lhr?.audits ?? {})
    .filter((a: any) => {
      if (!a || a.score === null || a.score === undefined || a.score >= 1) return false
      if (a.scoreDisplayMode && ['notApplicable', 'informative', 'manual', 'error'].includes(a.scoreDisplayMode)) return false
      return a.details?.overallSavingsBytes !== undefined || a.details?.overallSavingsMs !== undefined
    })
    .sort((a: any, b: any) => {
      const sa = (a.details?.overallSavingsBytes ?? 0) / 1024 + (a.details?.overallSavingsMs ?? 0)
      const sb = (b.details?.overallSavingsBytes ?? 0) / 1024 + (b.details?.overallSavingsMs ?? 0)
      return sb - sa
    })
    .slice(0, 6)
    .map((a: any) => {
      const bytesKo = Math.round((a.details?.overallSavingsBytes ?? 0) / 1024)
      const ms = Math.round(a.details?.overallSavingsMs ?? 0)
      const high = bytesKo > 100 || ms > 300
      const medium = bytesKo > 30 || ms > 100
      return {
        title: FR_TITLES[a.id] ?? a.title,
        description: stripMarkdown(a.description),
        score: typeof a.score === 'number' ? a.score : 0.5,
        impact: high ? 'Élevé' : medium ? 'Moyen' : 'Faible',
      }
    })

  // Cascade de chargement RÉELLE (audit network-requests)
  const netItems: any[] = lhr?.audits?.['network-requests']?.details?.items ?? []
  const waterfall = netItems
    .map((r: any) => {
      const meta = TYPE_META[r?.resourceType] ?? TYPE_META.Other
      const start = r?.networkRequestTime ?? 0
      const end = r?.networkEndTime ?? start
      return {
        name: shortName(r?.url ?? 'ressource'),
        type: meta.name,
        color: meta.color,
        startTime: Math.round(start),
        duration: Math.max(1, Math.round(end - start)),
        size: Math.round((r?.transferSize ?? 0) / 1024),
      }
    })
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 15)

  // Latence serveur : un seul point de mesure réel (pas de fausse répartition mondiale)
  const regionLatency = [{ region: 'Point de mesure', latency: ttfb }]

  return {
    performance,
    accessibility,
    bestPractices,
    seo,
    lcp,
    fcp,
    tbt,
    cls,
    si,
    ttfb,
    inp,
    fid, // DEPRECATED : miroir de inp
    totalWeight,
    recommendations,
    metrics: buildMetrics({ fcp, lcp, tbt, inp, cls, si, ttfb }),
    resourceBreakdown,
    regionLatency,
    waterfall,
  }
}

function shortName(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname.split('/').filter(Boolean).pop() ?? u.hostname
    return path.length > 32 ? path.slice(0, 29) + '…' : path
  } catch {
    return url.slice(0, 32)
  }
}

// ---------------------------------------------------------------------------
// 1. PageSpeed Insights (API Google) — marche sans clé (quota limité par IP),
//    plus fiable avec PSI_API_KEY / PAGESPEED_API_KEY
// ---------------------------------------------------------------------------

async function runPsi(
  url: string,
  device: 'desktop' | 'mobile',
  timeoutMs: number
): Promise<{ result: LighthouseResult; warning?: string }> {
  const key = process.env.PSI_API_KEY ?? process.env.PAGESPEED_API_KEY
  const params = new URLSearchParams({ url, strategy: device })
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) params.append('category', c)
  if (key) params.set('key', key)

  const res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  })
  const data: any = await res.json()
  if (!res.ok || !data?.lighthouseResult) {
    throw new Error(data?.error?.message ?? `PageSpeed Insights HTTP ${res.status}`)
  }
  const lhr = data.lighthouseResult
  if (lhr.runtimeError && !hasCoreMetrics(lhr)) {
    throw new Error(lhr.runtimeError?.message ?? 'Erreur PageSpeed Insights')
  }
  return {
    result: parseLhr(lhr),
    warning: lhr.runtimeError ? `mesure partielle : ${lhr.runtimeError.code ?? 'erreur'}` : undefined,
  }
}

// ---------------------------------------------------------------------------
// 2. Lighthouse local (Chrome headless)
// ---------------------------------------------------------------------------

async function runLocalLighthouse(
  url: string,
  device: 'desktop' | 'mobile',
  timeoutMs: number
): Promise<{ result: LighthouseResult; warning?: string }> {
  // Imports dynamiques : ces paquets ne sont utilisés que côté serveur.
  const { launch } = await import('chrome-launcher')
  const lighthouse = (await import('lighthouse')).default

  const chrome = await launch({
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })

  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const flags: Record<string, unknown> = {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    }

    // Réglages de rapidité (sans impact sur la validité des métriques) :
    // pas de capture d'écran pleine page, attente de quiet plus courte.
    const fastSettings = {
      disableFullPageScreenshot: true,
      maxWaitForLoad: 30_000,
      pauseAfterLoadMs: 1_000,
      networkQuietThresholdMs: 1_000,
      cpuQuietThresholdMs: 1_000,
      skipAudits: ['full-page-screenshot', 'screenshot-thumbnails', 'third-party-summary'],
    }

    // Config : desktop = préréglage officiel ; mobile = défaut Lighthouse
    let config: any
    if (device === 'desktop') {
      const desktopConfig = (await import('lighthouse/core/config/desktop-config.js')).default
      config = { ...desktopConfig, settings: { ...desktopConfig.settings, ...fastSettings } }
    } else {
      config = { extends: 'lighthouse:default', settings: fastSettings }
    }

    const run = lighthouse(url, flags, config)
    // En cas de timeout local, on abandonne proprement la promesse Lighthouse
    run.catch(() => {})
    const raced = await Promise.race([
      run,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout Lighthouse (${Math.round(timeoutMs / 1000)}s)`)), timeoutMs)
      }),
    ])

    const lhr: any = (raced as any)?.lhr
    if (!lhr) {
      throw new Error('Rapport Lighthouse vide')
    }
    // Erreur runtime mais métriques principales préservées (pages lourdes,
    // timeouts de protocole sur des audits secondaires) → on garde le résultat
    if (lhr.runtimeError && !hasCoreMetrics(lhr)) {
      throw new Error(lhr.runtimeError?.message ?? 'Erreur Lighthouse')
    }

    const errored = Object.values(lhr.audits ?? {}).filter((a: any) => a?.scoreDisplayMode === 'error').length
    const warning = lhr.runtimeError
      ? `mesure partielle : ${lhr.runtimeError.code ?? 'erreur'} sur ${errored} audit(s) secondaire(s)`
      : errored > 0
        ? `${errored} audit(s) secondaire(s) non exécuté(s)`
        : undefined

    return { result: parseLhr(lhr), warning }
  } finally {
    if (timer) clearTimeout(timer)
    try {
      await chrome.kill()
    } catch {
      // extinction best-effort de Chrome
    }
  }
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

export async function measureUrl(url: string, device: 'desktop' | 'mobile' = 'desktop'): Promise<Measurement> {
  const timeoutMs = DEFAULT_TIMEOUT_MS
  const hasPsiKey = Boolean(process.env.PSI_API_KEY ?? process.env.PAGESPEED_API_KEY)

  // Choix du moteur de mesure (MEASURE_ENGINE) :
  //   'auto'      (défaut) — PageSpeed Insights si clé configurée, puis Lighthouse local
  //   'lighthouse'         — 100 % local, open source, TESTS ILLIMITÉS (aucun quota)
  //   'pagespeed'          — uniquement l'API Google (quota 25 000/jour avec clé)
  const engine = (process.env.MEASURE_ENGINE ?? 'auto').toLowerCase()
  const usePsi = engine === 'pagespeed' || (engine === 'auto' && hasPsiKey)
  const useLocal = engine !== 'pagespeed'

  // 1. PageSpeed Insights (aucune ressource locale : l'audit tourne chez Google)
  if (usePsi) {
    try {
      const { result, warning } = await runPsi(url, device, timeoutMs)
      return {
        ...result,
        source: 'pagespeed',
        measuredAt: new Date().toISOString(),
        note: `Mesure réelle — API Google PageSpeed Insights${warning ? ` (${warning})` : ''}`,
      }
    } catch (e) {
      console.warn('[measure] PageSpeed Insights indisponible, repli sur Lighthouse local :', (e as Error).message)
    }
  }

  // 2. Lighthouse local (Chrome) — open source, illimité, consomme CPU/RAM pendant le test
  if (useLocal) {
    try {
      const { result, warning } = await runLocalLighthouse(url, device, timeoutMs)
      return {
        ...result,
        source: 'lighthouse',
        measuredAt: new Date().toISOString(),
        note: `Mesure réelle — audit Lighthouse local (Chrome headless)${warning ? ` (${warning})` : ''}`,
      }
    } catch (e) {
      console.warn('[measure] Lighthouse local en échec, repli simulé :', (e as Error).message)
    }
  }

  // 3. Dernier recours : simulation (TOUJOURS identifiée comme telle)
  const simulated = analyzeUrl(url, device)
  return {
    ...simulated,
    source: 'simulated',
    measuredAt: new Date().toISOString(),
    note: 'Données simulées — moteur de mesure indisponible sur cette machine',
  }
}
