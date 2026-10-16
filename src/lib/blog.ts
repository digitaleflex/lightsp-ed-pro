// Registre central du Blog Vélocita — Core Web Vitals.
// Chaque article = 1 slug -> /blog/[slug], avec contenu structuré complet.

import { BLOG_POSTS_P2 } from './blog-p2'
import { BLOG_POSTS_P3 } from './blog-p3'

export interface BlogAuthor {
  name: string
  role: string
  bio: string
  initials: string
  avatar: string
}

/** Auteur unique des guides du blog. */
export const BLOG_AUTHOR: BlogAuthor = {
  name: 'Eurin HASH',
  role: 'Auteur · Performance web',
  bio: 'Eurin HASH écrit les guides performance de Vélocita : Core Web Vitals, mesure terrain et optimisations concrètes, avec des méthodes testées sur des sites réels.',
  initials: 'EH',
  avatar: '/eurinhash.webp',
}

export interface BlogCode {
  lang: string
  title?: string
  code: string
}

export interface BlogSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
  code?: BlogCode
  tip?: string
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: 'Core Web Vitals' | 'Mesure' | 'Optimisation' | 'SEO & Business'
  metric?: string
  thresholds?: { bon: string; moyen: string; mauvais: string }
  cover: string
  coverAlt: string
  readingTime: number
  date: string
  updated: string
  keywords: string[]
  related: string[]
  intro: string[]
  sections: BlogSection[]
  checklist: string[]
  faq: { q: string; a: string }[]
  /** Sources externes d'autorité (docs Google, MDN…) affichées en bas d'article. */
  sources?: { label: string; url: string }[]
}

const BLOG_POSTS_V1: BlogPost[] = [
  {
    slug: 'guide-complet-core-web-vitals-2026',
    title: 'Guide complet des Core Web Vitals en 2026 : seuils, mesures et priorités',
    excerpt:
      'LCP, INP, CLS : ce que Google mesure vraiment, les seuils officiels 2026, la différence entre données labo et terrain, et par où commencer.',
    cover: '/blog/cwv-guide.png',
    coverAlt: "Illustration guide Core Web Vitals — jauge de performance et trio LCP, INP, CLS",
    category: 'Core Web Vitals',
    readingTime: 12,
    date: '2026-09-15',
    updated: '2026-10-01',
    keywords: ['core web vitals', 'lcp', 'inp', 'cls', 'google', 'seo', 'performance'],
    related: [
      'lcp-largest-contentful-paint-optimisation',
      'cls-cumulative-layout-shift-zero',
      'inp-interaction-to-next-paint-reactivite',
    
      'wordpress-core-web-vitals-sans-tout-casser',
      'loaf-long-animation-frames',],
    intro: [
      'Les Core Web Vitals sont le sous-ensemble de métriques que Google utilise pour juger de l’expérience utilisateur réelle : vitesse de chargement, réactivité et stabilité visuelle. Depuis 2024, le trio officiel est LCP (chargement), INP (réactivité) et CLS (stabilité).',
      'Ce guide pilier vous donne l’essentiel : définitions simples, seuils Google à viser (au 75e percentile des visites réelles), outils de mesure fiables et ordre de priorité pour optimiser sans vous disperser.',
    ],
    sections: [
      {
        heading: 'Les 3 Core Web Vitals officiels (et les métriques de diagnostic)',
        paragraphs: [
          'Google distingue les signaux (ce qui compte pour le classement) des métriques de diagnostic (ce qui aide à comprendre). En 2026, les trois signaux sont : Largest Contentful Paint pour le chargement, Interaction to Next Paint pour la réactivité, Cumulative Layout Shift pour la stabilité.',
          'Autour gravitent des métriques de diagnostic très utiles : First Contentful Paint (premier rendu), Time to First Byte (réactivité serveur) et Total Blocking Time (blocage JS en labo). Elles n’entrent pas directement dans le signal, mais elles expliquent presque toujours un mauvais LCP ou un mauvais INP.',
        ],
        bullets: [
          'LCP — Largest Contentful Paint : quand le plus grand élément visible s’affiche. Bon < 2,5 s.',
          'INP — Interaction to Next Paint : réactivité sur l’ensemble de la visite. Bon < 200 ms.',
          'CLS — Cumulative Layout Shift : stabilité visuelle cumulée. Bon < 0,1.',
          'FCP < 1,8 s, TTFB < 800 ms (données terrain), TBT < 200 ms : excellents indicateurs de diagnostic.',
        ],
      },
      {
        heading: 'Les seuils Google à viser (75e percentile)',
        paragraphs: [
          'Google évalue au 75e percentile des expériences réelles (données CrUX, Chrome User Experience Report) sur 28 jours glissants, séparément mobile et desktop. Autrement dit : 75 % de vos visites réelles doivent être « vertes ».',
          'Un test Lighthouse « vert » en labo ne suffit pas : il faut valider avec des données terrain (PageSpeed Insights → section « Ce que vos utilisateurs vivent », Search Console → rapport Signaux Web Essentiels, ou la librairie web-vitals en production).',
        ],
        bullets: [
          'LCP : bon ≤ 2,5 s · à améliorer 2,5–4 s · médiocre > 4 s',
          'INP : bon ≤ 200 ms · à améliorer 200–500 ms · médiocre > 500 ms',
          'CLS : bon ≤ 0,1 · à améliorer 0,1–0,25 · médiocre > 0,25',
          'Objectif : 75 % des pages vues dans le vert, sur mobile ET desktop.',
        ],
        tip: 'Testez toujours la version mobile en premier : c’est elle que Google utilise pour l’indexation et c’est souvent la plus pénalisée (CPU bridé, 4G).',
      },
      {
        heading: 'Par où commencer : l’ordre de priorité qui paie',
        paragraphs: [
          'Ne traitez pas les trois métriques en même temps. L’expérience montre un ordre rentable : d’abord le serveur et le chargement (TTFB → FCP → LCP), ensuite la stabilité (CLS, rapide à corriger), enfin la réactivité (INP, souvent du JS à alléger).',
          'Concrètement : un TTFB > 800 ms plombe tout le reste. Un CLS > 0,25 se corrige en une journée (dimensions d’images, espaces réservés pub). Un INP > 500 ms demande un audit JS (longues tâches, hydratation, listeners lourds).',
        ],
        bullets: [
          'Étape 1 — Serveur : TTFB, cache, CDN, compression Brotli, HTTP/2 ou 3.',
          'Étape 2 — Chargement : image hero préchargée, CSS critique, polices display=swap.',
          'Étape 3 — Stabilité : width/height, aspect-ratio, skeleton, pas d’injection au-dessus du contenu.',
          'Étape 4 — Réactivité : découper le JS, différer le non-critique, web workers, yield au thread principal.',
        ],
        code: {
          lang: 'bash',
          title: 'Mesurer en 2 minutes',
          code: '# 1. Données terrain (réelles)\n# PageSpeed Insights > onglet Mobile > "Ce que vos utilisateurs vivent"\n# Search Console > Expérience > Signaux Web Essentiels\n\n# 2. Données labo (reproductibles)\nnpx lighthouse https://votre-site.fr --only-categories=performance --view',
        },
      },
      {
        heading: 'Erreurs fréquentes qui faussent le diagnostic',
        paragraphs: [
          'Tester uniquement sur fibre avec un MacBook Pro, oublier le cache froid, ou ne regarder que la home : trois classiques. Testez les templates qui comptent (home, catégorie, fiche produit, article, checkout) sur un profil « Moto G + 4G ».',
          'Autre piège : optimiser le score Lighthouse au lieu de l’expérience. Un score de 100 avec un LCP terrain à 4 s ne sert à rien. Fiez-vous aux données terrain pour décider, au labo pour itérer.',
        ],
        bullets: [
          'Toujours comparer mobile vs desktop, cache froid vs cache chaud.',
          'Auditer 4–5 templates, pas seulement la home.',
          'Surveiller en continu : une régression JS ou une pub mal intégrée casse un CLS en une mise en prod.',
        ],
      },
    ],
    checklist: [
      'LCP ≤ 2,5 s au 75e percentile mobile (données terrain)',
      'INP ≤ 200 ms sur les parcours clés (menu, recherche, ajout panier)',
      'CLS ≤ 0,1 sans injection tardive ni image sans dimensions',
      'TTFB < 800 ms et FCP < 1,8 s comme garde-fous',
      'Monitoring continu + alertes sur régression (ex. Vélocita)',
    ],
    faq: [
      {
        q: 'Les Core Web Vitals influencent-ils vraiment le SEO ?',
        a: 'Oui, mais comme signal parmi d’autres : un site au contenu excellent et lent battra un site rapide et médiocre. En revanche, à contenu égal, le site vert gagne, et surtout la vitesse augmente conversions et engagement.',
      },
      {
        q: 'Faut-il viser 100/100 sur Lighthouse ?',
        a: 'Non. Visez le vert terrain sur LCP, INP et CLS. Un score labo de 90+ avec des Core Web Vitals terrain verts est un excellent objectif réaliste.',
      },
      {
        q: 'FID existe-t-il encore ?',
        a: 'FID (First Input Delay) a été remplacé par INP comme Core Web Vital en mars 2024. INP mesure toutes les interactions de la visite, pas seulement la première.',
      },
    ],
  },
  {
    slug: 'lcp-largest-contentful-paint-optimisation',
    title: 'LCP (Largest Contentful Paint) : comprendre et passer sous 2,5 s',
    excerpt:
      'Quel élément compte pour le LCP, pourquoi il est lent (serveur, image hero, CSS, polices) et le plan d’optimisation complet avec code.',
    cover: '/blog/lcp.png',
    coverAlt: "Illustration LCP — icône d’image hero et objectif 2,5 secondes",
    category: 'Core Web Vitals',
    metric: 'LCP',
    thresholds: { bon: '≤ 2,5 s', moyen: '2,5 – 4 s', mauvais: '> 4 s' },
    readingTime: 10,
    date: '2026-09-18',
    updated: '2026-10-02',
    keywords: ['lcp', 'largest contentful paint', 'image hero', 'preload', 'fcp', 'ttfb'],
    related: [
      'guide-complet-core-web-vitals-2026',
      'fcp-first-contentful-paint-rapidite',
      'ttfb-time-to-first-byte-serveur',
    
      'images-avif-srcset-lazy-loading',
      'wordpress-core-web-vitals-sans-tout-casser',
      'fetchpriority-preload-preconnect',],
    intro: [
      'Le LCP mesure le moment où le plus grand élément visible (image hero, bannière, gros titre) devient visible. C’est le meilleur proxy de « la page a-t-elle chargé ? » selon l’utilisateur.',
      'Seuil Google : bon à 2,5 secondes ou moins, au 75e percentile mobile. En pratique, 4 causes expliquent 90 % des mauvais LCP : serveur lent, image hero trop lourde ou tardive, CSS/JS bloquants, polices web lentes.',
    ],
    sections: [
      {
        heading: 'Identifier votre élément LCP',
        paragraphs: [
          'Dans PageSpeed Insights ou Lighthouse, la section « Diagnostic » nomme l’élément LCP (souvent une <img> hero ou un <h1> avec image de fond). Vérifiez aussi s’il s’agit d’une image de fond CSS — c’est un anti-pattern pour le LCP car non préchargeable ni priorisable facilement.',
          'Préférez une vraie balise <img> avec fetchpriority="high", srcset responsive et dimensions explicites. Les images de fond CSS arrivent tard et ne bénéficient pas du preload scanner aussi efficacement.',
        ],
        code: {
          lang: 'html',
          title: 'Image hero optimisée pour le LCP',
          code: '<!-- Préchargement dans le <head> -->\n<link rel="preload" as="image"\n  href="/hero-1600.avif"\n  imagesrcset="/hero-800.avif 800w, /hero-1600.avif 1600w"\n  imagesizes="100vw" fetchpriority="high" />\n\n<!-- Balise image LCP -->\n<img src="/hero-1600.avif"\n  srcset="/hero-800.avif 800w, /hero-1600.avif 1600w"\n  sizes="100vw" fetchpriority="high" decoding="async"\n  width="1600" height="900" alt="…" />',
        },
      },
      {
        heading: 'Les 4 leviers : serveur, image, CSS/JS, polices',
        paragraphs: [
          'Le LCP se décompose en : TTFB (serveur) + délai de chargement de la ressource + délai de rendu. Réduisez chaque segment : cache + CDN pour le TTFB, formats AVIF/WebP + compression + responsive pour l’image, CSS critique inline pour le rendu.',
          'Côté polices : utilisez font-display: swap, préchargez les 2 variantes critiques maximum (woff2), et évitez le FOUT qui retarde la peinture du titre LCP.',
        ],
        bullets: [
          'Serveur : cache page, CDN, Brotli, HTTP/3, TTFB < 800 ms (idéal < 200 ms en labo).',
          'Image : AVIF/WebP, < 200 Ko sur mobile, responsive, preload + fetchpriority high.',
          'CSS/JS : CSS critique inline, JS non critique en defer, supprimez les bloqueurs above-the-fold.',
          'Polices : preload woff2, display=swap, limitez à 2 familles / 2 graisses.',
        ],
        code: {
          lang: 'html',
          title: 'CSS critique et polices',
          code: '<!-- CSS critique inline, reste différé -->\n<style>/* styles above-the-fold uniquement */</style>\n<link rel="preload" href="/styles.css" as="style"\n  onload="this.onload=null;this.rel=\'stylesheet\'" />\n\n<!-- Polices : préchargement + swap -->\n<link rel="preload" href="/fonts/inter-700.woff2"\n  as="font" type="font/woff2" crossorigin />\n<style>@font-face{font-family:Inter;font-display:swap;src:url(/fonts/inter-700.woff2) format(woff2)}</style>',
        },
        tip: 'Règle 80/20 du LCP : dans 8 cas sur 10, précharger l’image hero + servir AVIF responsive + réduire le TTFB suffit à passer sous 2,5 s.',
      },
      {
        heading: 'Cas Next.js / React : images et lazy-loading',
        paragraphs: [
          'Avec next/image, marquez l’image hero en priority (équivalent fetchpriority high + preload automatique) et ne la lazy-loadez jamais. Réservez loading="lazy" aux images below-the-fold.',
          'Évitez les carrousels hero lourds et les animations JS qui retardent la peinture. Un hero statique optimisé bat presque toujours un slider en LCP.',
        ],
        code: {
          lang: 'tsx',
          title: 'next/image : hero prioritaire',
          code: "import Image from 'next/image'\n\n<Image src=\"/hero.avif\" alt=\"…\" width={1600} height={900}\n  priority sizes=\"100vw\"\n  style={{ width: '100%', height: 'auto' }} />",
        },
      },
    ],
    checklist: [
      'Élément LCP identifié (PageSpeed / Lighthouse)',
      'Image hero en <img> AVIF/WebP responsive, préchargée, fetchpriority high',
      'TTFB < 800 ms via cache + CDN + Brotli',
      'CSS critique inline, JS différé, polices swap + preload',
      'LCP ≤ 2,5 s au 75e percentile mobile vérifié en données terrain',
    ],
    faq: [
      {
        q: 'Mon LCP est un texte, pas une image. Que faire ?',
        a: 'Optimisez FCP : TTFB, CSS critique, polices (swap + preload). Un gros titre stylé avec une police lente est souvent la cause.',
      },
      {
        q: 'Lazy-loading sur l’image hero ?',
        a: 'Jamais. Le lazy-loading retarde l’image LCP. Réservez-le aux images below-the-fold.',
      },
    ],
  },
  {
    slug: 'cls-cumulative-layout-shift-zero',
    title: 'CLS (Cumulative Layout Shift) : atteindre un score proche de zéro',
    excerpt:
      'Pourquoi la page « saute » (images, pubs, polices, injections) et les recettes concrètes pour un CLS < 0,1 durable.',
    cover: '/blog/cls.png',
    coverAlt: "Illustration CLS — blocs de mise en page stables et objectif 0,1",
    category: 'Core Web Vitals',
    metric: 'CLS',
    thresholds: { bon: '≤ 0,1', moyen: '0,1 – 0,25', mauvais: '> 0,25' },
    readingTime: 8,
    date: '2026-09-20',
    updated: '2026-10-02',
    keywords: ['cls', 'cumulative layout shift', 'stabilité visuelle', 'images', 'publicités', 'polices'],
    related: [
      'guide-complet-core-web-vitals-2026',
      'lcp-largest-contentful-paint-optimisation',
      'core-web-vitals-seo-conversions-optimisation',
    
      'images-avif-srcset-lazy-loading',
      'polices-web-performances',],
    intro: [
      'Le CLS quantifie les décalages inattendus de mise en page pendant le chargement et l’utilisation : une image sans dimensions qui pousse le texte, une pub qui s’insère en haut, une police qui change la hauteur des lignes.',
      'Seuil Google : bon à 0,1 ou moins. Bonne nouvelle : c’est la métrique la plus rapide à corriger, souvent en une journée, avec des règles simples et durables.',
    ],
    sections: [
      {
        heading: 'Les 5 causes classiques de CLS',
        paragraphs: [
          'Images, iframes et vidéos sans width/height : le navigateur ne peut pas réserver l’espace avant le chargement. Publicités et embeds injectés tardivement au-dessus du contenu. Polices web qui modifient les métriques (FOUT/FOIT). Contenu dynamique (bandeaux cookies, alertes) inséré sans espace réservé. Animations qui modifient layout au lieu de transform.',
        ],
        bullets: [
          'Médias sans dimensions → toujours width/height ou aspect-ratio.',
          'Pubs/iframes → conteneur avec taille réservée (min-height).',
          'Polices → font-display: optional/swap + size-adjust pour limiter le décalage.',
          'Bandeaux/alertes → espace réservé ou overlay (position fixed), jamais d’insertion au-dessus.',
          'Animations → transform et opacity uniquement (compositor), pas top/left/width.',
        ],
      },
      {
        heading: 'Recettes code : dimensions, aspect-ratio, skeletons',
        paragraphs: [
          'La règle d’or : tout contenu qui arrive après le premier rendu doit avoir un espace réservé de taille connue. Pour les images responsives, aspect-ratio CSS verrouille le ratio même avant le chargement.',
          'Pour les zones dynamiques (pubs, recommandations), affichez un skeleton de même hauteur. L’utilisateur perçoit du progrès sans décalage.',
        ],
        code: {
          lang: 'css',
          title: 'Réserver l’espace (CSS)',
          code: '/* Images responsives sans CLS */\nimg { width: 100%; height: auto; aspect-ratio: 16 / 9; }\n\n/* Emplacement pub / embed */\n.ad-slot { min-height: 250px; background: var(--muted); border-radius: 12px; }\n@media (min-width: 768px) { .ad-slot { min-height: 90px; } }\n\n/* Skeleton de chargement */\n.skeleton { min-height: 180px; animation: pulse 1.2s infinite; }',
        },
        tip: 'Ajoutez width et height HTML sur chaque <img> / <video> / <iframe> : le navigateur calcule le ratio avant même le CSS.',
      },
      {
        heading: 'Tester et verrouiller : éviter les régressions',
        paragraphs: [
          'Le CLS se cumule sur toute la visite, y compris après interaction (scroll, filtres). Testez les parcours, pas seulement le chargement initial : ouvrez le menu, filtrez, ajoutez au panier.',
          'En CI, bloquez les PR qui ajoutent des images sans dimensions ou des iframes sans conteneur. En prod, surveillez le CLS au 75e percentile par template — une seule régie pub mal configurée peut tout casser.',
        ],
        bullets: [
          'Lighthouse → « Évitez les changements de mise en page importants » liste les coupables.',
          'Web Vitals JS : remontez le CLS réel par page/template.',
          'Règle d’équipe : aucune image/iframe sans dimensions, aucune injection au-dessus du contenu.',
        ],
      },
    ],
    checklist: [
      'Toutes les images/vidéos/iframes ont width/height ou aspect-ratio',
      'Pubs et embeds dans des conteneurs à taille réservée',
      'Polices avec swap + métriques stabilisées',
      'Bandeaux en overlay ou avec espace réservé, animations en transform',
      'CLS ≤ 0,1 au 75e percentile, par template clé',
    ],
    faq: [
      {
        q: 'Un CLS de 0 est-il réaliste ?',
        a: 'Oui sur des pages maîtrisées. Visez 0 en labo et ≤ 0,1 en terrain. Les pubs tierces rendent le 0 parfait parfois difficile : réservez-leur un espace strict.',
      },
      {
        q: 'Le scroll infini pénalise-t-il le CLS ?',
        a: 'Non s’il ajoute du contenu en dessous sans déplacer l’existant. Évitez d’insérer au-dessus ou de redimensionner les cartes déjà affichées.',
      },
    ],
  },
  {
    slug: 'inp-interaction-to-next-paint-reactivite',
    title: 'INP (Interaction to Next Paint) : rendre chaque clic instantané (< 200 ms)',
    excerpt:
      'Le successeur du FID : ce qu’INP mesure (pire interaction), pourquoi le JS bloque, et comment découper, différer et céder au thread principal.',
    cover: '/blog/inp.png',
    coverAlt: "Illustration INP — bouton cliqué par un curseur et objectif 200 millisecondes",
    category: 'Core Web Vitals',
    metric: 'INP',
    thresholds: { bon: '≤ 200 ms', moyen: '200 – 500 ms', mauvais: '> 500 ms' },
    readingTime: 11,
    date: '2026-09-22',
    updated: '2026-10-03',
    keywords: ['inp', 'interaction to next paint', 'fid', 'réactivité', 'javascript', 'long tasks', 'tbt'],
    related: [
      'tbt-total-blocking-time-javascript',
      'guide-complet-core-web-vitals-2026',
      'core-web-vitals-seo-conversions-optimisation',
    
      'rum-web-vitals-20-minutes',
      'inp-attribution-debug',
      'fid-vers-inp-migration',],
    intro: [
      'INP mesure la réactivité : le délai entre une interaction (clic, tap, frappe) et la prochaine image affichée. Google retient la pire interaction (en pratique proche du 98e percentile) sur la visite — une seule interaction lente suffit à plomber la métrique.',
      'Depuis mars 2024, INP remplace FID comme Core Web Vital. Seuil : 200 ms ou moins. Les coupables habituels : longues tâches JS (> 50 ms), hydratation lourde, listeners synchrones coûteux, frameworks qui re-rendent trop.',
    ],
    sections: [
      {
        heading: 'Comprendre : input delay, traitement, présentation',
        paragraphs: [
          'INP = délai d’entrée (thread occupé) + durée du handler + rendu du frame suivant. Réduire l’INP, c’est donc libérer le thread principal : moins de JS, mieux découpé, exécuté au bon moment.',
          'Mesurez en labo avec le profilage (longues tâches, Total Blocking Time) et en terrain avec la librairie web-vitals : elle identifie quelles interactions (menu, filtre, ajout panier) sont lentes.',
        ],
        code: {
          lang: 'js',
          title: 'Mesurer l’INP réel en production',
          code: "import { onINP } from 'web-vitals'\n\nonINP((metric) => {\n  // metric.value, metric.entries[].name, .target\n  fetch('/api/vitals', {\n    method: 'POST',\n    body: JSON.stringify({ name: 'INP', value: metric.value, page: location.pathname }),\n  })\n})",
        },
      },
      {
        heading: 'Le plan d’action : découper, différer, céder',
        paragraphs: [
          'Découper : code-splitting par route et par interaction (import dynamique au clic, pas au chargement). Différer : tout ce qui n’est pas critique passe en defer, lazy ou après interaction (analytics, chat, trackers). Céder : découpez les grosses boucles avec yield (scheduler.yield ou setTimeout) pour laisser le navigateur peindre.',
          'Côté frameworks : réduisez l’hydratation (composants islands, server components), mémorisez les listes, débouncing sur recherche/filtres, et évitez les re-renders synchrones sur chaque frappe.',
        ],
        bullets: [
          'Code-splitting : React.lazy / next/dynamic, import() au besoin.',
          'Différer : defer, lazy-hydration, chargement du chat/widgets après interaction ou idle.',
          'Céder : découper les tâches > 50 ms, scheduler.yield, requestIdleCallback pour le non-urgent.',
          'Événements : listeners passifs, délégation, debounce 150–300 ms sur inputs.',
        ],
        code: {
          lang: 'tsx',
          title: 'Charger le lourd uniquement au besoin',
          code: "import dynamic from 'next/dynamic'\n\n// Lourd : chargé seulement quand l'utilisateur ouvre le panneau\nconst FiltersPanel = dynamic(() => import('./FiltersPanel'), { ssr: false })\n\nfunction onClick() {\n  // Ou import() manuel au clic\n  import('./heavy-chart').then(({ renderChart }) => renderChart())\n}",
        },
        tip: 'Cherchez les « longues tâches » > 200 ms dans le profiler : une seule suffit à rater l’INP. Découpez-la en premier.',
      },
      {
        heading: 'Pièges React/Next.js et trackers tiers',
        paragraphs: [
          'Hydratation complète d’une grosse page, context qui re-rend tout, effets synchrones au mount : trois classiques. Préférez les Server Components, l’hydratation partielle et les listes virtualisées.',
          'Les scripts tiers (A/B test, consent, pub, chat) sont des tueurs d’INP : chargez-les après interaction ou en idle, avec Partytown/web worker si possible, et auditez leur poids chaque trimestre.',
        ],
        bullets: [
          'Server Components par défaut, Client Components au strict nécessaire.',
          'Virtualisation des longues listes (react-window), pagination plutôt que 500 cartes.',
          'Tiers : facades (fausse vidéo/chat cliquable), chargement idle, budget tiers < 200 Ko.',
        ],
      },
    ],
    checklist: [
      'Interactions clés identifiées (menu, recherche, filtres, panier) et mesurées en terrain',
      'JS découpé/différé, longues tâches < 50 ms, TBT < 200 ms en labo',
      'Hydratation minimale, listes virtualisées, inputs debouncés',
      'Scripts tiers en idle/facade, budget respecté',
      'INP ≤ 200 ms au 75e percentile mobile',
    ],
    faq: [
      {
        q: 'Quelle différence entre FID et INP ?',
        a: 'FID mesurait uniquement le délai de la première interaction. INP mesure le cycle complet (délai + traitement + rendu) sur toutes les interactions et retient les pires. C’est plus représentatif et plus exigeant.',
      },
      {
        q: 'Un bon TBT garantit-il un bon INP ?',
        a: 'Non, mais c’est un excellent signal labo : un TBT < 200 ms prédit généralement un bon INP. Validez toujours avec des données terrain.',
      },
    ],
  },
  {
    slug: 'fcp-first-contentful-paint-rapidite',
    title: 'FCP (First Contentful Paint) : afficher le premier contenu en < 1,8 s',
    excerpt:
      'Le premier rendu qui rassure : TTFB, CSS bloquant, polices, et la checklist pour un FCP rapide et stable.',
    cover: '/blog/fcp.png',
    coverAlt: "Illustration FCP — éclair de vitesse et objectif 1,8 seconde",
    category: 'Core Web Vitals',
    metric: 'FCP',
    thresholds: { bon: '< 1,8 s', moyen: '1,8 – 3 s', mauvais: '> 3 s' },
    readingTime: 7,
    date: '2026-09-24',
    updated: '2026-10-03',
    keywords: ['fcp', 'first contentful paint', 'css critique', 'polices', 'ttfb', 'rendu'],
    related: [
      'lcp-largest-contentful-paint-optimisation',
      'ttfb-time-to-first-byte-serveur',
      'guide-complet-core-web-vitals-2026',
    
      'speculation-rules-navigation-instantanee',
      'fetchpriority-preload-preconnect',
      'polices-web-performances',],
    intro: [
      'Le FCP mesure le moment où le premier contenu (texte, image, SVG, canvas) est peint. Ce n’est pas un Core Web Vital officiel, mais c’est le meilleur indicateur de « quelque chose se passe » — et un prérequis à un bon LCP.',
      'Seuil : moins de 1,8 s en bon. Un FCP lent vient presque toujours de trois choses : serveur lent, CSS bloquant, polices bloquantes.',
    ],
    sections: [
      {
        heading: 'Les 3 freins au premier rendu',
        paragraphs: [
          'TTFB élevé : chaque milliseconde serveur retarde tout. CSS bloquant : une feuille de 300 Ko bloque le rendu jusqu’à téléchargement + parsing. Polices : @font-face sans display=swap bloque le texte (FOIT).',
          'Lighthouse le dit clairement : « Éliminez les ressources bloquant le rendu ». L’objectif n’est pas zéro CSS, mais un chemin critique minimal.',
        ],
        bullets: [
          'TTFB : cache, CDN, compression, early hints (103).',
          'CSS : critical inline + reste différé, minification, suppression de l’inutilisé.',
          'Polices : preload woff2, display=swap, 2 variantes max.',
        ],
      },
      {
        heading: 'Mise en œuvre : chemin critique minimal',
        paragraphs: [
          'Inlinez le CSS above-the-fold (10–15 Ko), chargez le reste en non-bloquant (media print + onload), préconnectez les domaines critiques (fonts, CDN images).',
          'Ajoutez un fond et un skeleton immédiats : même avec un FCP à 1,2 s, l’utilisateur perçoit de la vitesse si quelque chose de stable s’affiche tôt.',
        ],
        code: {
          lang: 'html',
          title: 'Chemin critique rapide',
          code: '<!-- Connexions anticipées -->\n<link rel="preconnect" href="https://cdn.votre-site.fr" crossorigin />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n\n<!-- CSS critique inline -->\n<style>body{margin:0}header{...}</style>\n<link rel="stylesheet" href="/app.css" media="print" onload="this.media=\'all\'" />',
        },
        tip: 'Mesurez le FCP en « 4G lente + CPU x4 » : si vous êtes sous 1,8 s dans ces conditions, vous êtes serein en terrain.',
      },
    ],
    checklist: [
      'TTFB < 800 ms, idéal < 200 ms en labo',
      'CSS critique inline, reste différé, inutilisé supprimé',
      'Polices preload + swap, 2 variantes max',
      'Preconnect CDN/fonts, pas de JS bloquant dans le <head>',
      'FCP < 1,8 s sur mobile bridé',
    ],
    faq: [
      {
        q: 'FCP et LCP, quelle différence ?',
        a: 'FCP = premier contenu (n’importe lequel). LCP = plus grand contenu visible. Un bon FCP ne garantit pas un bon LCP, mais un mauvais FCP garantit presque un mauvais LCP.',
      },
    ],
  },
  {
    slug: 'ttfb-time-to-first-byte-serveur',
    title: 'TTFB (Time to First Byte) : un serveur rapide, fondation de tout',
    excerpt:
      'DNS, TLS, cache, CDN, compression : réduire le TTFB sous 800 ms (et viser 200 ms) pour débloquer FCP et LCP.',
    cover: '/blog/ttfb.png',
    coverAlt: "Illustration TTFB — serveurs et objectif 800 millisecondes",
    category: 'Core Web Vitals',
    metric: 'TTFB',
    thresholds: { bon: '< 800 ms', moyen: '800 – 1800 ms', mauvais: '> 1800 ms' },
    readingTime: 8,
    date: '2026-09-26',
    updated: '2026-10-04',
    keywords: ['ttfb', 'time to first byte', 'serveur', 'cdn', 'cache', 'compression'],
    related: [
      'fcp-first-contentful-paint-rapidite',
      'lcp-largest-contentful-paint-optimisation',
      'field-data-vs-lab-data-crux-lighthouse',
    ],
    intro: [
      'Le TTFB mesure le temps entre la requête et le premier octet reçu : DNS + connexion + TLS + attente serveur + premier transfert. C’est la fondation : chaque milliseconde de TTFB retarde FCP, LCP et INP.',
      'Seuil terrain : bon sous 800 ms (Google recommande même < 200 ms en labo pour les pages servies). Au-delà de 1,8 s, considérez le TTFB comme prioritaire avant toute optimisation front.',
    ],
    sections: [
      {
        heading: 'Diagnostiquer : où part le temps ?',
        paragraphs: [
          'Décomposez : redirection (évitez les chaînes), DNS (préconnectez, TTL adaptés), TLS (TLS 1.3, session resumption), attente serveur (requêtes DB, SSR lent, pas de cache), transfert (compression, HTTP/2-3).',
          'Outils : onglet Réseau (attente vs téléchargement), Server-Timing, WebPageTest (détail DNS/TLS/TTFB par origine), logs APM côté serveur.',
        ],
        bullets: [
          'Redirections : maximum 1, en 301/308, jamais de chaîne http→https→www→…',
          'DNS : fournisseur rapide, preconnect/preload des origines critiques.',
          'Serveur : cache page/edge, requêtes DB indexées, SSR streamé, ISR plutôt que SSR pur.',
          'Réseau : Brotli (niveau 4–6), HTTP/2 ou 3, CDN proche des utilisateurs, Early Hints 103.',
        ],
      },
      {
        heading: 'Le trio gagnant : cache, CDN, compression',
        paragraphs: [
          'Cache : mettez en cache tout ce qui est cacheable (HTML statique/ISR, assets avec hash + Cache-Control immutable d’un an). Le premier appel construit, les suivants servent depuis l’edge en < 50 ms.',
          'CDN : servez depuis le PoP le plus proche, avec stale-while-revalidate pour ne jamais bloquer sur l’origine. Compression Brotli : -15 à -25 % vs gzip sur HTML/CSS/JS.',
        ],
        code: {
          lang: 'http',
          title: 'En-têtes cache efficaces',
          code: '# Assets versionnés (hash) : cache long\nCache-Control: public, max-age=31536000, immutable\n\n# HTML ISR / edge : frais + tolérance\nCache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400\n\n# Compression négociée\nAccept-Encoding: br, gzip',
        },
        tip: 'Activez les Early Hints (103) : le navigateur précharge CSS/polices/hero pendant que le serveur génère le HTML — gain direct sur LCP.',
      },
    ],
    checklist: [
      'Zéro chaîne de redirection, DNS rapide, TLS 1.3',
      'Cache page/edge + CDN, SWR, assets immutable',
      'Brotli, HTTP/2 ou 3, Early Hints',
      'SSR streamé / ISR, DB indexée, APM sans requête N+1',
      'TTFB < 800 ms terrain (p75), < 200 ms labo sur cache chaud',
    ],
    faq: [
      {
        q: 'TTFB et hébergeur mutualisé, que faire ?',
        a: 'Mettez un CDN devant (cache HTML edge), activez le cache page et la compression. Si le TTFB origine reste > 1 s, migrez vers un hébergement avec edge/cache.',
      },
    ],
  },
  {
    slug: 'tbt-total-blocking-time-javascript',
    title: 'TBT (Total Blocking Time) : alléger le JavaScript qui bloque',
    excerpt:
      "Le jumeau labo de l'INP : comprendre les longues tâches, auditer le JS tiers, et passer sous 200 ms.",
    cover: '/blog/tbt.png',
    coverAlt: "Illustration TBT — symboles de code et objectif 200 millisecondes",
    category: 'Core Web Vitals',
    metric: 'TBT',
    thresholds: { bon: '< 200 ms', moyen: '200 – 600 ms', mauvais: '> 600 ms' },
    readingTime: 8,
    date: '2026-09-28',
    updated: '2026-10-04',
    keywords: ['tbt', 'total blocking time', 'javascript', 'long tasks', 'code splitting'],
    related: [
      'inp-interaction-to-next-paint-reactivite',
      'fcp-first-contentful-paint-rapidite',
      'core-web-vitals-seo-conversions-optimisation',
    
      'nextjs-core-web-vitals-app-router',
      'loaf-long-animation-frames',],
    intro: [
      'Le TBT mesure, en labo, le temps total où le thread principal est bloqué (> 50 ms par tâche) entre FCP et fin de chargement. C’est le meilleur proxy labo de la réactivité (INP) : un TBT élevé prédit un INP élevé.',
      'Seuil : moins de 200 ms en bon. Les causes : bundle JS trop gros, hydratation massive, scripts tiers, polyfills inutiles, parsing de gros JSON synchrone.',
    ],
    sections: [
      {
        heading: 'Auditer : qui bloque le thread ?',
        paragraphs: [
          'Dans Lighthouse, « Réduisez le travail du thread principal » et « Réduisez le JS inutilisé » listent les coupables avec le gain estimé. Dans DevTools Performance, filtrez les Long Tasks (> 50 ms) et regardez l’appelant.',
          'Règle : tout script > 100 Ko (ou > 50 ms d’exécution) doit justifier sa présence au chargement. Le reste part en différé ou au besoin.',
        ],
        bullets: [
          'Bundle : analyse (next/bundle-analyzer), suppression des dépendances lourdes (moment → date-fns, lodash → utilitaires).',
          'Splitting : par route + par interaction, dynamic import, lazy-hydration.',
          'Tiers : facade, chargement idle/après consentement, budget tiers.',
          'Parsing : JSON volumineux en streaming/worker, pas de regex géantes au mount.',
        ],
        code: {
          lang: 'js',
          title: 'Différer le non-critique',
          code: "// Au lieu de tout charger au démarrage…\n// import { initChat } from './chat'\n\n// …chargez après idle ou première interaction\nconst idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500))\nidle(() => import('./chat').then(({ initChat }) => initChat()))\n\ndocument.addEventListener('pointerdown', () =>\n  import('./analytics-extra').then(({ init }) => init()),\n{ once: true })",
        },
      },
      {
        heading: 'Stratégies qui marchent : moins, plus tard, ailleurs',
        paragraphs: [
          'Moins : supprimez (audit trimestriel des dépendances), remplacez les libs lourdes, tree-shaking strict. Plus tard : defer/lazy, chargement à l’interaction, route-based splitting. Ailleurs : web workers pour calculs/parsing, Partytown pour les tiers.',
          'Côté React : Server Components, mémorisation ciblée, virtualisation, et surtout pas d’hydratation globale d’une page de 2 Mo de JS.',
        ],
        tip: 'Fixez un budget JS : < 200 Ko gzippé initial sur mobile. Bloquez les PR qui le dépassent.',
      },
    ],
    checklist: [
      'TBT < 200 ms sur mobile bridé (Moto G + 4G)',
      'Budget JS respecté, inutilisé supprimé, polyfills ciblés',
      'Splitting par route/interaction, tiers en facade/idle',
      'Long Tasks > 50 ms traquées, calculs lourds en worker',
      'INP terrain validé après baisse du TBT',
    ],
    faq: [
      {
        q: 'TBT à 0, est-ce possible ?',
        a: 'Oui sur des pages sobres. Visez < 200 ms ; en dessous de 100 ms, concentrez-vous sur l’INP terrain plutôt que sur le 0 absolu.',
      },
    ],
  },
  {
    slug: 'field-data-vs-lab-data-crux-lighthouse',
    title: 'Données terrain vs labo : CrUX, PageSpeed et Lighthouse sans se tromper',
    excerpt:
      'Pourquoi Lighthouse dit 95 et vos utilisateurs vivent 4 s : CrUX, RUM, labo, et la méthode de mesure fiable.',
    cover: '/blog/mesure.png',
    coverAlt: "Illustration mesure — courbes de données terrain et laboratoire",
    category: 'Mesure',
    readingTime: 9,
    date: '2026-09-30',
    updated: '2026-10-05',
    keywords: ['crux', 'field data', 'lab data', 'lighthouse', 'pagespeed', 'rum', 'web-vitals'],
    related: [
      'guide-complet-core-web-vitals-2026',
      'ttfb-time-to-first-byte-serveur',
      'core-web-vitals-seo-conversions-optimisation',
    
      'rum-web-vitals-20-minutes',
      'bfcache-cache-arriere',],
    intro: [
      'Le malentendu n°1 : confondre score labo (Lighthouse, test unique, environnement simulé) et expérience terrain (CrUX, 75e percentile de vrais Chrome sur 28 jours). Google classe sur le terrain, pas sur votre test du matin.',
      'Bonne méthode : terrain pour décider (CrUX via PageSpeed/Search Console/RUM), labo pour diagnostiquer et itérer (Lighthouse/WebPageTest à profil constant).',
    ],
    sections: [
      {
        heading: 'Le terrain : CrUX, PageSpeed, Search Console, RUM',
        paragraphs: [
          'CrUX (Chrome UX Report) agrège les visites réelles Chrome opt-in : c’est la source du signal Google. PageSpeed Insights affiche CrUX (terrain, 28 jours) + Lighthouse (labo, instantané) : lisez d’abord le terrain.',
          'Search Console → Signaux Web Essentiels montre les groupes d’URL bons/à améliorer/médiocres. Le RUM (web-vitals en prod) complète avec le détail par template, pays, appareil — indispensable pour prioriser.',
        ],
        bullets: [
          'Terrain = verdict (SEO + utilisateurs). Labo = microscope (reproductible).',
          'Toujours segmenter : mobile vs desktop, par template, par pays.',
          '28 jours glissants : une correction met 2–4 semaines à verdir dans CrUX.',
        ],
        code: {
          lang: 'js',
          title: 'RUM minimal avec web-vitals',
          code: "import { onLCP, onINP, onCLS } from 'web-vitals'\n\nfor (const fn of [onLCP, onINP, onCLS]) {\n  fn((m) => navigator.sendBeacon('/api/vitals', JSON.stringify({\n    name: m.name, value: m.value,\n    page: location.pathname, ua: navigator.userAgent,\n  })))\n}",
        },
      },
      {
        heading: 'Le labo : protocole reproductible',
        paragraphs: [
          'Figez le protocole : même lieu, même profil (Moto G / 4G lente, CPU x4), 3–5 runs médians, cache froid + chaud, fenêtre incognito sans extensions. Sinon vous comparez du bruit.',
          'WebPageTest pour le filmstrip et le waterfall (TTFB, image hero, bloqueurs), Lighthouse pour les opportunités chiffrées, DevTools Performance pour les Long Tasks (INP/TBT).',
        ],
        bullets: [
          '3–5 runs, médiane, mobile bridé en priorité.',
          'Auditez chaque template clé, pas seulement la home.',
          'Versionnez : chaque PR majeure = run comparé (CI Lighthouse).',
        ],
        tip: 'Un écart labo/terrain énorme (95 labo, rouge terrain) pointe vers : trafic mobile réel faible qualité réseau, pubs/tarpages tiers en prod, ou échantillon CrUX dominé par des appareils modestes.',
      },
    ],
    checklist: [
      'Verdict terrain lu en premier (CrUX p75, mobile)',
      'RUM par template/appareil/pays en place',
      'Protocole labo figé et runs médians',
      'Search Console suivie après chaque correctif (2–4 semaines)',
      'Alertes sur régression terrain, pas seulement score labo',
    ],
    faq: [
      {
        q: 'Pourquoi mon CrUX est vide / insuffisant ?',
        a: 'Trafic trop faible ou pages trop récentes : CrUX exige un volume minimal. Utilisez le RUM en attendant, et PageSpeed labo pour itérer.',
      },
      {
        q: 'Quel outil pour le suivi continu ?',
        a: 'Un monitoring qui combine runs labo planifiés + import CrUX/RUM + alertes (c’est exactement le rôle de Vélocita : historique, régressions, comparaison avant/après).',
      },
    ],
  },
  {
    slug: 'core-web-vitals-seo-conversions-optimisation',
    title: 'Core Web Vitals, SEO et conversions : transformer la vitesse en revenus',
    excerpt:
      'Impact business prouvé, priorisation ROI, budgets de performance et méthode d’optimisation continue sans régression.',
    cover: '/blog/seo.png',
    coverAlt: "Illustration SEO — flèche de croissance des conversions",
    category: 'SEO & Business',
    readingTime: 10,
    date: '2026-10-02',
    updated: '2026-10-06',
    keywords: ['seo', 'conversions', 'roi', 'budget performance', 'optimisation', 'business'],
    related: [
      'guide-complet-core-web-vitals-2026',
      'inp-interaction-to-next-paint-reactivite',
      'lcp-largest-contentful-paint-optimisation',
    
      'etude-cas-lcp-fiche-produit',
      'wordpress-core-web-vitals-sans-tout-casser',
      'speed-index-tti-utiles',],
    intro: [
      'La vitesse n’est pas un gadget technique : chaque seconde de LCP en moins augmente conversions, pages vues et satisfaction — et sécurise le signal SEO « expérience de page ». Le raisonnement gagnant : prioriser par ROI (trafic × valeur × effort).',
      'Cet article donne la méthode pro : quantifier l’enjeu, fixer des budgets, exécuter par sprints courts, et verrouiller avec du monitoring pour ne jamais régresser.',
    ],
    sections: [
      {
        heading: 'Ce que disent les données : vitesse = business',
        paragraphs: [
          'Ordres de grandeur constatés dans l’industrie : +1 s de chargement peut coûter ~7 % de conversions e-commerce ; un LCP qui passe de 4 s à 2 s augmente sensiblement engagement et taux de rebond inversé ; un CLS élevé fait chuter clics et confiance (clics involontaires, formulaires qui sautent).',
          'Côté SEO : les Core Web Vitals sont un signal de départage. À contenu et autorité égaux, la page verte gagne. Et indirectement, la vitesse améliore crawl, exploration et signaux d’usage que Google adore.',
        ],
        bullets: [
          'E-commerce : priorisez fiche produit, panier, checkout (INP + LCP).',
          'Média/blog : LCP + CLS (lecture stable, pubs non intrusives).',
          'SaaS/lead : FCP + LCP hero + INP du formulaire/demo.',
        ],
      },
      {
        heading: 'Méthode ROI : budgets, sprints, verrouillage',
        paragraphs: [
          'Fixez des budgets par template : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1, poids < 1,5 Mo mobile, JS < 200 Ko, requêtes < 50. Tout dépassement bloque ou alerte en CI.',
          'Travaillez en sprints d’une semaine : un template, une métrique, un avant/après mesuré en labo + RUM. Commencez par le template à plus fort trafic×valeur (souvent fiche produit ou landing principale).',
        ],
        bullets: [
          'Sprint 1 : TTFB + image hero du top template (gain LCP immédiat).',
          'Sprint 2 : CLS global (dimensions, pubs, polices — rapide, visible).',
          'Sprint 3 : INP des parcours (découper/différer JS, tiers en facade).',
          'Verrouillage : CI Lighthouse + RUM + alertes régression (Vélocita).',
        ],
        code: {
          lang: 'js',
          title: 'Budget performance (ex. Lighthouse CI)',
          code: "{\n  \"ci\": {\n    \"assert\": {\n      \"assertions\": {\n        \"largest-contentful-paint\": [\"error\", { \"maxNumericValue\": 2500 }],\n        \"cumulative-layout-shift\": [\"error\", { \"maxNumericValue\": 0.1 }],\n        \"interactive\": [\"warn\", { \"maxNumericValue\": 3500 }],\n        \"total-byte-weight\": [\"warn\", { \"maxNumericValue\": 1536000 }]\n      }\n    }\n  }\n}",
        },
        tip: 'Présentez chaque sprint en euros : « LCP 3,8 s → 2,2 s sur fiches produits = +X % conversion estimée ». C’est ce qui débloque les budgets.',
      },
      {
        heading: 'Checklist WordPress / Next.js express',
        paragraphs: [
          'WordPress : cache + CDN, images AVIF adaptatives, thème léger, 10 plugins max utiles, JS différé, polices système ou swap, pas de slider hero. Next.js : Server Components, next/image priority sur hero, dynamic import, ISR/edge, tiers en facade.',
          'Dans les deux cas : mesurez avant/après en terrain, pas seulement en labo, et laissez 28 jours à CrUX pour verdir.',
        ],
        bullets: [
          'Commun : CDN, Brotli, cache, AVIF/WebP, budgets, monitoring.',
          'WordPress : WP Rocket/LiteSpeed + Cloudflare APO, Perfmatters pour différer.',
          'Next.js : Image priority, font optimization, bundle-analyzer, Partytown pour tiers.',
        ],
      },
    ],
    checklist: [
      'Enjeu chiffré par template (trafic × valeur)',
      'Budgets définis et enforced en CI',
      '3 sprints exécutés (LCP → CLS → INP) avec avant/après',
      'Monitoring continu + alertes (terrain + labo)',
      'Revue trimestrielle tiers/poids/INP',
    ],
    faq: [
      {
        q: 'Faut-il refondre pour être vert ?',
        a: 'Rarement. 80 % des gains viennent de : cache/CDN, image hero, CSS critique, polices, JS différé et pubs cadrées. Refondre sans méthode coûte plus cher et régresse souvent.',
      },
      {
        q: 'Combien de temps pour verdir dans Google ?',
        a: 'Comptez 2 à 4 semaines après déploiement pour voir CrUX/Search Console passer au vert (28 jours glissants). Le RUM montre l’effet en quelques jours.',
      },
    ],
  },
]

export const BLOG_POSTS: BlogPost[] = [...BLOG_POSTS_V1, ...BLOG_POSTS_P2, ...BLOG_POSTS_P3]

export const BLOG_BY_SLUG = new Map(BLOG_POSTS.map((p) => [p.slug, p]))

export const BLOG_CATEGORIES = ['Core Web Vitals', 'Mesure', 'Optimisation', 'SEO & Business'] as const

export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  const current = BLOG_BY_SLUG.get(slug)
  if (!current) return BLOG_POSTS.slice(0, count)
  const explicit = current.related
    .map((s) => BLOG_BY_SLUG.get(s))
    .filter((p): p is BlogPost => Boolean(p))
  const others = BLOG_POSTS.filter((p) => p.slug !== slug && !current.related.includes(p.slug))
  return [...explicit, ...others].slice(0, count)
}

export function formatDateFR(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Ancre URL-safe pour le sommaire (ex. "Identifier votre élément LCP" -> "identifier-votre-element-lcp"). */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Navigation précédent / suivant dans l'ordre éditorial. */
export function getPrevNextPost(slug: string): { prev: BlogPost | null; next: BlogPost | null } {
  const i = BLOG_POSTS.findIndex((p) => p.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return {
    prev: i > 0 ? BLOG_POSTS[i - 1] : null,
    next: i < BLOG_POSTS.length - 1 ? BLOG_POSTS[i + 1] : null,
  }
}
