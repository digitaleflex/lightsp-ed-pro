// Fonctions utilitaires pour la surveillance de performance

// Génération pseudo-aléatoire déterministe basée sur une chaîne
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export interface LighthouseResult {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  lcp: number // Largest Contentful Paint (s)
  fcp: number // First Contentful Paint (s)
  tbt: number // Total Blocking Time (ms)
  cls: number // Cumulative Layout Shift
  si: number // Speed Index
  ttfb: number // Time to First Byte (ms)
  fid: number // First Input Delay (ms)
  totalWeight: number // KB
  recommendations: { title: string; description: string; score: number; impact: string }[]
  metrics: { label: string; value: string; status: 'good' | 'average' | 'poor'; hint: string }[]
  resourceBreakdown: { name: string; size: number; color: string; requests: number }[]
  regionLatency: { region: string; latency: number }[]
}

// Simule une analyse Lighthouse pour une URL donnée
export function analyzeUrl(url: string, device: 'desktop' | 'mobile' = 'desktop'): LighthouseResult {
  const normalized = url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
  const rng = seededRandom(normalized + device)

  // Facteur de pénalité mobile
  const mobileFactor = device === 'mobile' ? 0.85 : 1

  // Détection de TLD "lents" pour plus de réalisme
  const slowHints = ['shop', 'store', 'blog.wordpress', 'wix', 'weebly']
  const isLikelySlow = slowHints.some((h) => normalized.includes(h))
  const baseRange = isLikelySlow ? 0.4 : 0.62

  const performance = Math.round((baseRange + rng() * 0.38) * 100 * mobileFactor)
  const accessibility = Math.round((0.7 + rng() * 0.3) * 100)
  const bestPractices = Math.round((0.68 + rng() * 0.3) * 100)
  const seo = Math.round((0.8 + rng() * 0.2) * 100)

  // Core Web Vitals (mobile plus lent)
  const lcp = +(0.8 + rng() * 3.2 + (device === 'mobile' ? 1 : 0)).toFixed(2)
  const fcp = +(0.4 + rng() * 2.2 + (device === 'mobile' ? 0.6 : 0)).toFixed(2)
  const tbt = Math.round(50 + rng() * 600 + (device === 'mobile' ? 200 : 0))
  const cls = +(rng() * 0.3).toFixed(3)
  const si = +(1.2 + rng() * 4 + (device === 'mobile' ? 1.5 : 0)).toFixed(2)
  const ttfb = Math.round(80 + rng() * 900)
  const fid = Math.round(2 + rng() * 200)
  const totalWeight = Math.round(180 + rng() * 4200)

  // Recommandations Lighthouse
  const allRecommendations = [
    {
      title: "Réduire le temps de réponse du serveur (TTFB)",
      description: "Votre serveur met trop de temps à répondre. Envisagez un CDN ou optimisez votre hébergement.",
      score: ttfb < 200 ? 1 : ttfb < 500 ? 0.6 : 0.2,
      impact: ttfb > 500 ? 'Élevé' : 'Moyen',
    },
    {
      title: "Précharger les ressources clés (preload)",
      description: "Utilisez preload pour les polices, images critiques et CSS afin d'accélérer le rendu initial.",
      score: fcp < 1.8 ? 0.9 : 0.4,
      impact: fcp > 1.8 ? 'Moyen' : 'Faible',
    },
    {
      title: "Diffuser les images au format moderne (WebP/AVIF)",
      description: "Convertissez vos images en WebP ou AVIF pour réduire leur taille de 25 à 50%.",
      score: totalWeight < 1000 ? 0.85 : 0.3,
      impact: totalWeight > 1500 ? 'Élevé' : 'Moyen',
    },
    {
      title: "Minifier et compresser les ressources JavaScript",
      description: "Réduisez la taille du bundle JS, code-splitting et tree-shaking.",
      score: tbt < 200 ? 0.9 : 0.35,
      impact: tbt > 300 ? 'Élevé' : 'Moyen',
    },
    {
      title: "Mettre en cache les ressources statiques",
      description: "Configurez des en-têtes Cache-Control longues pour les assets statiques.",
      score: totalWeight < 1500 ? 0.8 : 0.4,
      impact: 'Moyen',
    },
    {
      title: "Éliminer les ressources de blocage de rendu",
      description: "Reportez ou supprimez le CSS/JS non critique du chemin de rendu.",
      score: fcp < 1.5 ? 0.9 : 0.45,
      impact: fcp > 1.5 ? 'Moyen' : 'Faible',
    },
    {
      title: "Réduire les décalages de mise en page (CLS)",
      description: "Définissez des dimensions pour les images, publicités et embeds.",
      score: cls < 0.1 ? 0.95 : cls < 0.25 ? 0.6 : 0.2,
      impact: cls > 0.25 ? 'Élevé' : 'Faible',
    },
    {
      title: "Utiliser une police web optimisée",
      description: "Préchargez les polices et utilisez font-display: swap.",
      score: fcp < 1.6 ? 0.85 : 0.5,
      impact: 'Faible',
    },
  ]

  // Ne garder que les recommandations pertinentes (score < 0.8)
  const recommendations = allRecommendations
    .filter((r) => r.score < 0.85)
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)

  const status = (good: boolean, avg: boolean) => (good ? 'good' : avg ? 'average' : 'poor') as 'good' | 'average' | 'poor'

  const metrics = [
    {
      label: 'Première peinture de contenu (FCP)',
      value: `${fcp}s`,
      status: status(fcp < 1.8, fcp < 3),
      hint: 'Mesure quand le premier contenu apparaît.',
    },
    {
      label: 'Plus grande peinture de contenu (LCP)',
      value: `${lcp}s`,
      status: status(lcp < 2.5, lcp < 4),
      hint: 'Mesure le chargement du plus grand élément visible.',
    },
    {
      label: 'Temps de blocage total (TBT)',
      value: `${tbt}ms`,
      status: status(tbt < 200, tbt < 600),
      hint: "Quantifie la non-interactivité pendant le chargement.",
    },
    {
      label: 'Décalage de mise en page cumulé (CLS)',
      value: cls.toFixed(3),
      status: status(cls < 0.1, cls < 0.25),
      hint: 'Mesure la stabilité visuelle de la page.',
    },
    {
      label: 'Indice de vitesse (Speed Index)',
      value: `${si}s`,
      status: status(si < 3.4, si < 5.8),
      hint: 'Mesure la vitesse d\'affichage du contenu visible.',
    },
    {
      label: 'Temps jusqu\'au premier octet (TTFB)',
      value: `${ttfb}ms`,
      status: status(ttfb < 200, ttfb < 500),
      hint: 'Mesure la réactivité du serveur.',
    },
  ]

  // Répartition des ressources par type (style Lighthouse)
  // Les ratios ne couvrent pas 100% — "Autres" absorbe le reste pour garantir
  // que la somme des tailles == totalWeight (cohérence avec la carte "Poids total").
  const jsRatio = 0.28 + rng() * 0.2
  const imgRatio = 0.2 + rng() * 0.22
  const cssRatio = 0.07 + rng() * 0.08
  const fontRatio = 0.04 + rng() * 0.05
  const jsSize = Math.round(totalWeight * jsRatio)
  const imgSize = Math.round(totalWeight * imgRatio)
  const cssSize = Math.round(totalWeight * cssRatio)
  const fontSize = Math.round(totalWeight * fontRatio)
  const otherSize = Math.max(2, totalWeight - jsSize - imgSize - cssSize - fontSize)
  const resourceBreakdown = [
    {
      name: 'JavaScript',
      size: jsSize,
      color: 'var(--color-chart-1)',
      requests: Math.round(8 + rng() * 30),
    },
    {
      name: 'Images',
      size: imgSize,
      color: 'var(--color-chart-2)',
      requests: Math.round(12 + rng() * 40),
    },
    {
      name: 'CSS',
      size: cssSize,
      color: 'var(--color-chart-3)',
      requests: Math.round(2 + rng() * 6),
    },
    {
      name: 'Polices',
      size: fontSize,
      color: 'var(--color-chart-4)',
      requests: Math.round(2 + rng() * 5),
    },
    {
      name: 'Autres',
      size: otherSize,
      color: 'var(--color-chart-5)',
      requests: Math.round(3 + rng() * 10),
    },
  ]

  // Latence par région (ms)
  const baseLat = ttfb
  const regionLatency = [
    { region: 'Europe', latency: baseLat },
    { region: 'Amérique du Nord', latency: Math.round(baseLat * (1.05 + rng() * 0.15)) },
    { region: 'Asie-Pacifique', latency: Math.round(baseLat * (1.25 + rng() * 0.2)) },
    { region: 'Amérique du Sud', latency: Math.round(baseLat * (1.4 + rng() * 0.2)) },
  ]

  return {
    performance: Math.max(5, Math.min(100, performance)),
    accessibility,
    bestPractices,
    seo,
    lcp,
    fcp,
    tbt,
    cls,
    si,
    ttfb,
    fid,
    totalWeight,
    recommendations,
    metrics,
    resourceBreakdown,
    regionLatency,
  }
}

// Données de seed pour le classement et le monitoring
export const SEED_WEBSITES = [
  { url: 'https://vercel.com', name: 'Vercel', category: 'Tech' },
  { url: 'https://nextjs.org', name: 'Next.js', category: 'Tech' },
  { url: 'https://tailwindcss.com', name: 'Tailwind CSS', category: 'Tech' },
  { url: 'https://stripe.com', name: 'Stripe', category: 'Finance' },
  { url: 'https://linear.app', name: 'Linear', category: 'SaaS' },
  { url: 'https://notion.so', name: 'Notion', category: 'SaaS' },
  { url: 'https://figma.com', name: 'Figma', category: 'Design' },
  { url: 'https://github.com', name: 'GitHub', category: 'Tech' },
  { url: 'https://shadcn.com', name: 'shadcn/ui', category: 'Tech' },
  { url: 'https://apple.com', name: 'Apple', category: 'Tech' },
  { url: 'https://nike.com', name: 'Nike', category: 'E-commerce' },
  { url: 'https://airbnb.com', name: 'Airbnb', category: 'Voyage' },
  { url: 'https://netflix.com', name: 'Netflix', category: 'Divertissement' },
  { url: 'https://spotify.com', name: 'Spotify', category: 'Divertissement' },
  { url: 'https://shopify.com', name: 'Shopify', category: 'E-commerce' },
  { url: 'https://cloudflare.com', name: 'Cloudflare', category: 'Tech' },
]

// Génère des données de monitoring historique (30 derniers jours)
export function generateMonitoringHistory(baseScore: number, days: number = 30) {
  const rng = seededRandom(`history-${baseScore}`)
  const data: { date: string; score: number; lcp: number; cls: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const variation = (rng() - 0.5) * 12
    const trend = (days - i) * 0.3 // amélioration progressive
    const score = Math.max(20, Math.min(100, Math.round(baseScore + variation + trend)))
    const lcp = +(2 + (rng() - 0.5) * 2).toFixed(2)
    const cls = +(0.05 + rng() * 0.15).toFixed(3)
    data.push({
      date: date.toISOString().slice(0, 10),
      score,
      lcp,
      cls,
    })
  }
  return data
}
