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
  inp: number // Interaction to Next Paint (ms) — Core Web Vital depuis 2024, bon ≤ 200
  /** @deprecated miroir de inp, conservé pour compatibilité */
  fid: number
  totalWeight: number // KB
  recommendations: { title: string; description: string; score: number; impact: string }[]
  metrics: { label: string; value: string; status: 'good' | 'average' | 'poor'; hint: string }[]
  resourceBreakdown: { name: string; size: number; color: string; requests: number }[]
  regionLatency: { region: string; latency: number }[]
  waterfall: { name: string; type: string; color: string; startTime: number; duration: number; size: number }[]
}

// Construit la liste de métriques affichée (seuils Lighthouse officiels)
export function buildMetrics(v: {
  fcp: number
  lcp: number
  tbt: number
  inp: number
  cls: number
  si: number
  ttfb: number
}): LighthouseResult['metrics'] {
  const status = (good: boolean, avg: boolean) => (good ? 'good' : avg ? 'average' : 'poor') as 'good' | 'average' | 'poor'

  return [
    {
      label: 'Première peinture de contenu (FCP)',
      value: `${v.fcp}s`,
      status: status(v.fcp < 1.8, v.fcp < 3),
      hint: 'Mesure quand le premier contenu apparaît.',
    },
    {
      label: 'Plus grande peinture de contenu (LCP)',
      value: `${v.lcp}s`,
      status: status(v.lcp < 2.5, v.lcp < 4),
      hint: 'Mesure le chargement du plus grand élément visible.',
    },
    {
      label: 'Temps de blocage total (TBT)',
      value: `${v.tbt}ms`,
      status: status(v.tbt < 200, v.tbt < 600),
      hint: 'Quantifie la non-interactivité pendant le chargement (proxy lab de l’INP).',
    },
    {
      label: 'Interaction to Next Paint (INP)',
      value: `${v.inp}ms`,
      status: status(v.inp <= 200, v.inp <= 500),
      hint: 'Core Web Vital interactivité depuis 2024 : réactivité réelle aux clics/taps.',
    },
    {
      label: 'Décalage de mise en page cumulé (CLS)',
      value: v.cls.toFixed(3),
      status: status(v.cls < 0.1, v.cls < 0.25),
      hint: 'Mesure la stabilité visuelle de la page.',
    },
    {
      label: 'Indice de vitesse (Speed Index)',
      value: `${v.si}s`,
      status: status(v.si < 3.4, v.si < 5.8),
      hint: "Mesure la vitesse d'affichage du contenu visible.",
    },
    {
      label: "Temps jusqu'au premier octet (TTFB)",
      value: `${v.ttfb}ms`,
      status: status(v.ttfb < 200, v.ttfb < 500),
      hint: 'Mesure la réactivité du serveur.',
    },
  ]
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

  // Core Web Vitals — plages resserrées pour des démos majoritairement vertes/ambres
  // (cohérent avec des sites populaires réels : Vercel, Stripe, etc.)
  // Seuils Lighthouse : LCP < 2.5s vert, < 4s ambre ; TBT < 200ms vert, < 600ms ambre ;
  // CLS < 0.1 vert, < 0.25 ambre ; FCP < 1.8s vert, < 3s ambre ; SI < 3.4s vert, < 5.8s ambre ;
  // TTFB < 200ms vert, < 500ms ambre.
  const lcp = +(1.0 + rng() * 2.0 + (device === 'mobile' ? 0.8 : 0)).toFixed(2)
  const fcp = +(0.5 + rng() * 1.6 + (device === 'mobile' ? 0.5 : 0)).toFixed(2)
  const tbt = Math.round(30 + rng() * 280 + (device === 'mobile' ? 150 : 0))
  const cls = +(rng() * 0.18).toFixed(3)
  const si = +(1.3 + rng() * 2.6 + (device === 'mobile' ? 1.2 : 0)).toFixed(2)
  const ttfb = Math.round(90 + rng() * 420)
  // INP : seuils Google bon ≤ 200ms, à améliorer ≤ 500ms
  const inp = Math.round(60 + rng() * 320 + (device === 'mobile' ? 80 : 0))
  const fid = inp // DEPRECATED : miroir pour compatibilité
  const totalWeight = Math.round(220 + rng() * 3200)

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

  const metrics = buildMetrics({ fcp, lcp, tbt, inp, cls, si, ttfb })

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

  // Cascade de chargement des ressources (waterfall) — style Lighthouse
  const totalDuration = Math.round(si * 1000) // durée totale en ms basée sur le Speed Index
  const waterfall = resourceBreakdown.flatMap((r, groupIdx) => {
    const count = Math.min(5, r.requests) // limiter à 5 req par type pour la lisibilité
    return Array.from({ length: count }, (_, i) => {
      const startTime = Math.round(rng() * totalDuration * 0.6)
      const duration = Math.round(40 + rng() * 600)
      return {
        name: `${r.name.toLowerCase()}-${i + 1}`,
        type: r.name,
        color: r.color,
        startTime,
        duration: Math.min(duration, totalDuration - startTime),
        size: Math.round(r.size / count * (0.5 + rng() * 0.8)),
      }
    })
  }).sort((a, b) => a.startTime - b.startTime).slice(0, 12)

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
    inp,
    fid, // DEPRECATED : miroir de inp
    totalWeight,
    recommendations,
    metrics,
    resourceBreakdown,
    regionLatency,
    waterfall,
  }
}

// Données de seed : les VRAIS sites qui seront mesurés en réel au démarrage
export const SEED_WEBSITES = [
  { url: 'https://vercel.com', name: 'Vercel', category: 'Tech' },
  { url: 'https://nextjs.org', name: 'Next.js', category: 'Tech' },
  { url: 'https://stripe.com', name: 'Stripe', category: 'Finance' },
  { url: 'https://apple.com', name: 'Apple', category: 'Tech' },
  { url: 'https://github.com', name: 'GitHub', category: 'Tech' },
  { url: 'https://netflix.com', name: 'Netflix', category: 'Divertissement' },
  { url: 'https://lemonde.fr', name: 'Le Monde', category: 'Médias' },
  { url: 'https://amazon.fr', name: 'Amazon', category: 'E-commerce' },
  { url: 'https://wikipedia.org', name: 'Wikipedia', category: 'Éducation' },
  { url: 'https://linkedin.com', name: 'LinkedIn', category: 'Professionnel' },
]
