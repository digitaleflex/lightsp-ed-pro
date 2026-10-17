// Deuxième vague du blog : 6 guides rentables (plateformes, techniques, mesure, cas).
// Fusionnés dans BLOG_POSTS via blog.ts. Sources externes vérifiées une par une.

import type { BlogPost } from './blog'

export const BLOG_POSTS_P2: BlogPost[] = [
  {
    slug: 'wordpress-core-web-vitals-sans-tout-casser',
    title: 'WordPress et Core Web Vitals : passer au vert sans tout casser',
    excerpt:
      'Thème, cache, images, plugins : le plan en 5 étapes pour un WordPress rapide (LCP, INP, CLS) sans refonte ni extension usine à gaz.',
    cover: '/blog/wordpress.png',
    coverAlt: "Illustration WordPress au vert — fenêtre de site et plan en 5 étapes",
    category: 'Optimisation',
    readingTime: 12,
    date: '2026-10-13',
    updated: '2026-10-15',
    keywords: ['wordpress', 'core web vitals', 'accelerer wordpress', 'cache', 'lcp wordpress', 'plugins'],
    related: [
      'lcp-largest-contentful-paint-optimisation',
      'cls-cumulative-layout-shift-zero',
      'core-web-vitals-seo-conversions-optimisation',
    ],
    intro: [
      'WordPress propulse plus de 40 % du web — et une bonne partie des pages rouges de la Search Console. Thèmes surchargés, plugins empilés, images non optimisées, absence de cache : le CMS n’est pas lent par nature, c’est son écosystème qui le ralentit.',
      'Ce guide donne un plan en 5 étapes, sans refonte : mesurer, alléger le thème et les plugins, mettre en cache, optimiser les images, puis verrouiller. Objectif : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 sur vos templates clés.',
    ],
    sections: [
      {
        heading: 'Étape 1 : mesurer avant de toucher (sinon vous optimisez à l’aveugle)',
        paragraphs: [
          'Testez vos 4 templates qui comptent (accueil, article, page, archive) dans PageSpeed Insights, version mobile, et notez LCP, INP, CLS terrain quand ils existent. Exportez aussi le rapport « Signaux Web Essentiels » de la Search Console : il liste les groupes d’URL à corriger en priorité.',
          'Notez également quel plugin ou réglage correspond à chaque problème : une galerie qui charge 2 Mo de JS, un slider hero en jQuery, un page builder qui inline 400 Ko de CSS. Sans ce diagnostic, chaque optimisation est un pari.',
        ],
        bullets: [
          'PageSpeed Insights mobile sur 4 templates + Search Console > Signaux Web Essentiels.',
          'Identifier le coupable n°1 par métrique (ex. slider → LCP, chat → INP, pub → CLS).',
          'Sauvegarde complète + environnement de test avant toute modification.',
        ],
        tip: 'Désactivez tout, mesurez, réactivez un par un : en 30 minutes vous savez exactement quel plugin coûte combien de millisecondes.',
      },
      {
        heading: 'Étape 2 : thème léger et plugins au régime',
        paragraphs: [
          'Le thème est le facteur n°1 : préférez un thème sobre et rapide (voire un thème-bloc moderne) plutôt qu’un thème « tout-en-un » de 3 Mo. Côté plugins, appliquez la règle des 3 questions : est-il utilisé sur toutes les pages ? Existe-t-il en version plus légère ? Puis-je le remplacer par 20 lignes de code ou un réglage natif ?',
          'Supprimez les sliders hero (remplacez par une image hero statique optimisée), les compteurs animés above-the-fold et les bibliothèques chargées globalement alors qu’elles ne servent que sur une page (contact form sur tout le site, typique).',
        ],
        bullets: [
          'Objectif : < 15 plugins actifs, zéro slider hero, zéro page builder sur les templates critiques.',
          'Chargez les scripts par condition (contact, galerie, carte uniquement où nécessaire).',
          'Mettez à jour PHP (8.2+), WordPress et le thème : chaque version majeure apporte des gains.',
        ],
      },
      {
        heading: 'Étape 3 : cache, CDN et compression (le trio qui fait -50 % de TTFB)',
        paragraphs: [
          'Installez UNE extension de cache (pas deux), activez le cache de page, la minification HTML/CSS/JS, le chargement différé du JS et le lazy-loading natif. Devant, placez un CDN avec cache edge et Brotli : c’est souvent le plus gros gain LCP pour quelques euros par mois.',
          'Vérifiez après activation : un TTFB qui passe de 1,5 s à 300 ms change tout le reste (FCP, LCP, et même INP perçu).',
        ],
        code: {
          lang: 'apache',
          title: 'Exemple : cache navigateur + compression (extrait .htaccess)',
          code: '# Cache navigateur : 1 an pour les assets versionnés\n<FilesMatch "\\.(webp|avif|woff2|css|js)$">\n  Header set Cache-Control "public, max-age=31536000, immutable"\n</FilesMatch>\n\n# Compression Brotli si disponible, sinon gzip\n<IfModule mod_brotli.c>\n  AddOutputFilterByType BROTLI_COMPRESS text/html text/css application/javascript\n</IfModule>',
        },
        tip: 'Un seul plugin de cache à la fois : deux extensions de cache empilées se battent et ralentissent plus qu’elles n’accélèrent.',
      },
      {
        heading: 'Étape 4 : images et polices, les 2 Mo qui dorment dans vos médias',
        paragraphs: [
          'Convertissez la bibliothèque en AVIF/WebP avec fallback, régénérez les miniatures aux bonnes tailles et servez du responsive (srcset). L’image hero ne doit JAMAIS être en lazy-loading : préchargez-la et déclarez ses dimensions.',
          'Côté polices : 2 familles maximum, woff2 auto-hébergées, display=swap, et désactivez les icônes-fonts entières (Font Awesome complet pour 3 icônes = 150 Ko gaspillés, préférez du SVG inline).',
        ],
        bullets: [
          'AVIF/WebP + srcset, hero préchargée avec width/height, lazy natif pour le reste.',
          'Polices : 2 familles, woff2, swap, SVG inline au lieu des fonts d’icônes.',
          'Nettoyez les médias inutilisés (ils pèsent dans les sauvegardes et les requêtes).',
        ],
      },
      {
        heading: 'Étape 5 : verrouiller (sinon tout reviendra dans 3 mois)',
        paragraphs: [
          'Documentez la stack (thème, plugins autorisés, réglages cache) et interdisez l’installation de plugins sans test de performance. Re-mesurez mensuellement les 4 templates et surveillez la Search Console : une mise à jour de thème ou de plugin suffit à casser un CLS.',
          'Avec un monitoring continu (Vélocita, par exemple), chaque mise en prod est comparée à la précédente : vous voyez la régression avant vos visiteurs et avant Google.',
        ],
        bullets: [
          'Liste blanche de plugins + procédure de test avant chaque mise à jour.',
          'Re-mesure mensuelle des templates + alertes sur régression.',
          'Objectifs affichés : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 au 75e percentile.',
        ],
      },
    ],
    checklist: [
      '4 templates mesurés (mobile) + groupes Search Console priorisés',
      'Thème sobre, < 15 plugins, sliders et scripts globaux inutiles supprimés',
      'Cache page + CDN + Brotli, TTFB < 800 ms',
      'Images AVIF/WebP responsives, hero préchargée, polices swap + SVG',
      'Procédure de mise à jour + monitoring continu en place',
    ],
    faq: [
      {
        q: 'Quel plugin de cache choisir ?',
        a: 'Peu importe la marque : un seul plugin bien configuré (cache page, minification, JS différé, lazy-loading) vaut mieux que trois empilés. Mesurez le TTFB avant/après pour valider.',
      },
      {
        q: 'Faut-il changer de thème pour être vert ?',
        a: 'Pas toujours, mais un thème « tout-en-un » de 3 Mo rend l’objectif très difficile. Si après les étapes 2-4 vous restez au-dessus de 4 s de LCP, la migration vers un thème sobre est l’étape la plus rentable.',
      },
      {
        q: 'Gutenberg ou page builder ?',
        a: 'L’éditeur par blocs natif génère un HTML/CSS bien plus léger que la plupart des builders. Pour les templates critiques (accueil, article), le natif gagne presque toujours en LCP et CLS.',
      },
    ],
    sources: [
      { label: 'WordPress — Guide d’optimisation officiel', url: 'https://developer.wordpress.org/advanced-administration/performance/optimization/' },
      { label: 'Google — Web Vitals (seuils et outils)', url: 'https://web.dev/articles/vitals' },
      { label: 'Google — Optimiser le LCP', url: 'https://web.dev/articles/lcp' },
    ],
  },
  {
    slug: 'nextjs-core-web-vitals-app-router',
    title: 'Next.js et Core Web Vitals : le guide App Router (images, polices, RSC)',
    excerpt:
      'Server Components, next/image, next/font, dynamic import : les réglages Next.js qui verrouillent LCP, CLS et INP au vert.',
    cover: '/blog/nextjs.png',
    coverAlt: "Illustration Next.js App Router — triangle et optimisation au vert",
    category: 'Optimisation',
    readingTime: 11,
    date: '2026-10-13',
    updated: '2026-10-15',
    keywords: ['nextjs', 'core web vitals', 'app router', 'server components', 'next/image', 'next/font'],
    related: [
      'lcp-largest-contentful-paint-optimisation',
      'inp-interaction-to-next-paint-reactivite',
      'images-avif-srcset-lazy-loading',
    ],
    intro: [
      'Next.js donne presque tout pour être vert — à condition d’utiliser l’App Router comme prévu : Server Components par défaut, images et polices optimisées, JS découpé. La plupart des Next.js rouges viennent des mêmes erreurs : trop de Client Components, images non priorisées, bibliothèques tierces chargées au démarrage.',
      'Ce guide passe en revue les 4 leviers : rendu serveur, images, polices et découpage JS, avec le code exact à appliquer.',
    ],
    sections: [
      {
        heading: 'Server Components par défaut, Client Components au strict nécessaire',
        paragraphs: [
          'Chaque Client Component (« use client ») ajoute du JS à hydrater et fait grimper TBT et INP. Règle : tout ce qui n’a pas besoin d’état, d’écouteurs ou d’API navigateur reste un Server Component (fetch de données, markdown, listes statiques).',
          'Pour les îlots interactifs (recherche, panier, filtres), isolez le Client Component le plus bas possible dans l’arbre : la page reste serveur, seul le widget s’hydrate. Les providers de contexte se placent dans un petit Client Component dédié, jamais dans le layout racine entier.',
        ],
        code: {
          lang: 'tsx',
          title: 'Îlot interactif isolé (le reste de la page reste serveur)',
          code: "// app/blog/[slug]/page.tsx — Server Component par défaut\nexport default async function Article({ params }) {\n  const post = await getPost(params.slug) // fetch serveur, 0 Ko client\n  return (\n    <article>\n      <h1>{post.title}</h1>\n      <Content html={post.html} />\n      <ShareButtons url={post.url} /> {/* seul îlot client */}\n    </article>\n  )\n}",
        },
        tip: 'Comptez vos « use client » : sur une page contenu, plus de 3–4 îlots clients signale une hydratation à revoir.',
      },
      {
        heading: 'next/image et next/font : le LCP et le CLS verrouillés',
        paragraphs: [
          'Avec next/image, l’image hero reçoit priority (preload + fetchpriority automatiques) et des dimensions qui réservent l’espace (CLS = 0). Tout le reste utilise le lazy-loading natif et des tailles responsives. La documentation officielle détaille les modes local et distant.',
          'Avec next/font, les polices Google sont auto-hébergées (zéro requête externe), avec ajustement automatique des métriques pour éviter le décalage au swap. Préférez les polices variables : une seule requête au lieu de 6.',
        ],
        code: {
          lang: 'tsx',
          title: 'Hero prioritaire + police variable auto-hébergée',
          code: "import Image from 'next/image'\nimport { Inter } from 'next/font/google'\n\nconst inter = Inter({ subsets: ['latin'], display: 'swap' })\n\nexport default function Hero() {\n  return (\n    <main className={inter.className}>\n      <Image src=\"/hero.avif\" alt=\"…\" width={1600} height={900}\n        priority sizes=\"100vw\" /> {/* jamais de lazy sur le LCP */}\n    </main>\n  )\n}",
        },
      },
      {
        heading: 'Découper le JS : dynamic import, tiers en façade, workers',
        paragraphs: [
          'Tout ce qui n’est pas visible au premier écran part en import dynamique : graphiques, éditeurs, cartes, lecteurs vidéo. Les widgets tiers (chat, avis, pub) se chargent après interaction ou en idle, derrière une façade cliquable.',
          'Pour l’INP, traquez les longues tâches dans le profiler : un handler de filtre qui bloque 300 ms se découpe (virtualisation, debounce, traitement en worker). Visez un TBT labo < 200 ms, qui prédit un bon INP terrain.',
        ],
        bullets: [
          'next/dynamic ou import() au clic pour tout composant lourd non critique.',
          'Tiers : façade + chargement idle, budget < 200 Ko, audit trimestriel.',
          'Listes longues virtualisées, inputs debouncés (150–300 ms).',
        ],
        code: {
          lang: 'tsx',
          title: 'Lourd chargé uniquement à l’ouverture',
          code: "import dynamic from 'next/dynamic'\n\nconst Chart = dynamic(() => import('./Chart'), {\n  loading: () => <div className=\"skeleton\" style={{ minHeight: 280 }} />,\n  ssr: false, // pas de JS serveur inutile pour un widget client\n})",
        },
      },
    ],
    checklist: [
      'Server Components par défaut, îlots clients isolés et comptés',
      'Hero en next/image priority, autres images lazy + responsives',
      'next/font (variable, swap), 2 familles max, zéro appel Google Fonts direct',
      'Composants lourds et tiers en dynamic/façade, TBT < 200 ms en labo',
      'INP ≤ 200 ms et LCP ≤ 2,5 s validés en données terrain (p75 mobile)',
    ],
    faq: [
      {
        q: 'Pages Router ou App Router pour la performance ?',
        a: 'L’App Router (Server Components, streaming, next/font) est la voie recommandée et la plus performante. Le Pages Router reste valable mais demande plus de discipline manuelle (dynamic, optimisation fonts).',
      },
      {
        q: 'priority sur plusieurs images ?',
        a: 'Non : une seule image prioritaire par page, celle du LCP. Plusieurs preloads se concurrencent et retardent tous le rendu.',
      },
    ],
    sources: [
      { label: 'Next.js — Optimisation des images', url: 'https://nextjs.org/docs/app/getting-started/images' },
      { label: 'Next.js — Optimisation des polices', url: 'https://nextjs.org/docs/app/getting-started/fonts' },
      { label: 'Next.js — Server et Client Components', url: 'https://nextjs.org/docs/app/getting-started/server-and-client-components' },
      { label: 'Google — Optimiser l’INP', url: 'https://web.dev/articles/inp' },
    ],
  },
  {
    slug: 'speculation-rules-navigation-instantanee',
    title: 'Speculation Rules : la navigation instantanée (prefetch, prerender)',
    excerpt:
      'Préchargez la prochaine page avant le clic avec l’API Speculation Rules : syntaxe, prefetch vs prerender, pièges et mesure du gain.',
    cover: '/blog/speculation.png',
    coverAlt: "Illustration Speculation Rules — pages pré-rendues et navigation instantanée",
    category: 'Optimisation',
    readingTime: 9,
    date: '2026-10-14',
    updated: '2026-10-15',
    keywords: ['speculation rules', 'prerender', 'prefetch', 'navigation instantanée', 'speculationrules'],
    related: [
      'fcp-first-contentful-paint-rapidite',
      'ttfb-time-to-first-byte-serveur',
      'rum-web-vitals-20-minutes',
    ],
    intro: [
      'Et si la page suivante s’affichait en quelques millisecondes, parce que le navigateur l’a déjà chargée avant le clic ? C’est la promesse de l’API Speculation Rules : déclarer en JSON les navigations probables, et laisser Chrome pré-récupérer (prefetch) ou pré-rendre (prerender) les pages.',
      'Gains typiques : LCP divisé par 2 à 4 sur les navigations internes. Mais mal utilisée, l’API gaspille bande passante et fausse vos analytics. Ce guide donne la syntaxe exacte et les garde-fous.',
    ],
    sections: [
      {
        heading: 'Prefetch vs prerender : choisir le bon niveau',
        paragraphs: [
          'Le prefetch télécharge uniquement le HTML de la page cible (léger, peu risqué) : la navigation reste rapide car le document est déjà en cache, mais sous-ressources et JS s’exécutent au clic. Le prerender charge et rend TOUTE la page dans un onglet invisible (lourd, quasi instantané à l’activation).',
          'Règle pratique : prefetch large (toutes les pages probables : résultats de recherche, listings, articles liés), prerender chirurgical (1–2 destinations quasi certaines : étape suivante du tunnel, page produit depuis la fiche).',
        ],
        bullets: [
          'Prefetch : pas cher, à adopter largement sur les liens internes sûrs.',
          'Prerender : réservé aux navigations > 70 % probables, jamais sur panier/paiement/déconnexion.',
          'Jamais de prerender sur les URL à effet de bord (ajout panier, vote, logout).',
        ],
        code: {
          lang: 'html',
          title: 'Règles de spéculation (prefetch large + prerender ciblé)',
          code: '<script type="speculationrules">\n{\n  "prefetch": [{ "source": "document",\n    "where": { "href_matches": "/*" },\n    "eagerness": "moderate" }],\n  "prerender": [{ "source": "document",\n    "where": { "href_matches": "/checkout/etape-2" },\n    "eagerness": "moderate" }]\n}\n</script>',
        },
        tip: 'Commencez par eagerness moderate (au survol) plutôt qu’immediate : 80 % du gain pour une fraction du coût réseau.',
      },
      {
        heading: 'Les 4 garde-fous (analytics, effets de bord, vie privée, cache)',
        paragraphs: [
          'Un prerender exécute le JS : vos analytics, pubs et compteurs peuvent se déclencher avant la visite réelle. Utilisez document.prerendering et l’événement prerenderingchange pour différer tout ce qui compte (tracking, impressions, A/B tests) jusqu’à l’activation.',
          'Côté serveur, détectez l’en-tête Sec-Purpose: prefetch pour ne pas déclencher d’effets (emails, stocks, quotas) sur les chargements spéculatifs. Et excluez les pages personnalisées (panier, compte) dont le contenu pré-rendu serait périmé ou faux.',
        ],
        bullets: [
          'Analytics différés jusqu’à prerenderingchange (sinon stats gonflées).',
          'Sec-Purpose: prefetch détecté côté serveur pour les actions sensibles.',
          'Exclure panier, compte, pages promo éphémères du prerender.',
          'Tester avec l’onglet spéculations de DevTools avant de généraliser.',
        ],
        code: {
          lang: 'js',
          title: 'Ne tracker qu’après activation réelle',
          code: "if (document.prerendering) {\n  document.addEventListener('prerenderingchange', initAnalytics, { once: true })\n} else {\n  initAnalytics()\n}",
        },
      },
      {
        heading: 'Mesurer le gain (et ne pas tricher avec ses métriques)',
        paragraphs: [
          'Comparez avant/après en RUM : LCP des navigations internes, taux de rebond sur les pages pré-rendues, et consommation réseau (octets spéculatifs vs navigations). Un prerender utile affiche un LCP d’activation < 300 ms.',
          'Attention CrUX : les activations de prerender comptent comme des visites — c’est légitime si l’utilisateur a vraiment navigué, mais surveillez que vos gains viennent de vraies visites, pas d’artefacts de mesure.',
        ],
        bullets: [
          'KPI : LCP navigations internes, bande passante spéculative, taux d’activation.',
          'Validez 2–4 semaines en terrain avant de généraliser à tout le site.',
        ],
      },
    ],
    checklist: [
      'Prefetch document-wide en moderate sur les liens internes sûrs',
      'Prerender limité à 1–2 destinations quasi certaines, jamais d’effets de bord',
      'Analytics et pubs différés à prerenderingchange, Sec-Purpose géré serveur',
      'Test DevTools (spéculations) + mesure RUM avant/après',
      'LCP navigations internes < 1 s visé, coût réseau sous contrôle',
    ],
    faq: [
      {
        q: 'Quels navigateurs supportent Speculation Rules ?',
        a: 'Chrome et Edge (préfixe complet), Safari partiellement, Firefox en cours. C’est une amélioration progressive : les navigateurs non compatibles ignorent simplement la balise, sans casser le site.',
      },
      {
        q: 'Prefetch et SEO, un risque ?',
        a: 'Non : les chargements spéculatifs n’affectent ni le crawl ni l’indexation. En revanche, surveillez vos logs serveur et vos analytics pour ne pas confondre trafic spéculatif et visites réelles.',
      },
    ],
    sources: [
      { label: 'MDN — Speculation Rules API (référence complète)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API' },
      { label: 'Google — First Contentful Paint', url: 'https://web.dev/articles/fcp' },
      { label: 'Google — Web Vitals (seuils et outils)', url: 'https://web.dev/articles/vitals' },
    ],
  },
  {
    slug: 'images-avif-srcset-lazy-loading',
    title: 'Images web parfaites : AVIF, srcset et lazy-loading chirurgical',
    excerpt:
      'Le bon format, la bonne taille, au bon moment : AVIF/WebP, srcset, picture, hero préchargée — le tutoriel images qui règle 50 % des LCP.',
    cover: '/blog/images.png',
    coverAlt: "Illustration images web — compression AVIF et poids divisé",
    category: 'Optimisation',
    readingTime: 10,
    date: '2026-10-14',
    updated: '2026-10-15',
    keywords: ['avif', 'webp', 'srcset', 'picture', 'lazy loading', 'optimiser images', 'responsive images'],
    related: [
      'lcp-largest-contentful-paint-optimisation',
      'cls-cumulative-layout-shift-zero',
      'nextjs-core-web-vitals-app-router',
    ],
    intro: [
      'Les images représentent souvent plus de la moitié du poids d’une page — et l’image hero EST le LCP dans 70 % des cas. Trois décisions règlent l’essentiel : le format (AVIF/WebP), la taille servie (srcset) et le moment du chargement (hero préchargée, reste en lazy).',
      'Ce tutoriel donne la recette complète, avec le code exact, du choix du format jusqu’au lazy-loading qui ne casse ni le LCP ni le CLS.',
    ],
    sections: [
      {
        heading: 'Le bon format : AVIF d’abord, WebP ensuite, JPEG en fallback',
        paragraphs: [
          'AVIF compresse 30 à 50 % mieux que JPEG à qualité égale, avec transparence et HDR ; WebP reste l’excellent second (universellement supporté). Servez AVIF en premier via <picture>, WebP en second, JPEG/PNG en fallback — le navigateur prend le premier format qu’il comprend.',
          'Réglez la qualité par usage : 60–70 pour les photos AVIF/WebP, 80+ seulement pour les visuels marque. Et bannissez le PNG photo (10× trop lourd) et le GIF animé (remplacez par vidéo muette ou WebP animé).',
        ],
        bullets: [
          'Ordre <picture> : AVIF → WebP → JPEG/PNG fallback.',
          'Qualité : AVIF/WebP q60–70 photos, PNG réservé aux captures/interface.',
          'GIF animé → vidéo <video muted loop> ou WebP animé (-90 % de poids).',
        ],
        code: {
          lang: 'html',
          title: 'Le trio gagnant <picture> + srcset',
          code: '<picture>\n  <source type="image/avif"\n    srcset="/img-480.avif 480w, /img-960.avif 960w, /img-1600.avif 1600w"\n    sizes="(max-width: 640px) 100vw, 50vw" />\n  <source type="image/webp"\n    srcset="/img-480.webp 480w, /img-960.webp 960w, /img-1600.webp 1600w"\n    sizes="(max-width: 640px) 100vw, 50vw" />\n  <img src="/img-960.jpg" width="1600" height="900"\n    alt="…" loading="lazy" decoding="async" />\n</picture>',
        },
        tip: 'sizes doit décrire la VRAIE taille affichée : un sizes="100vw" sur une image affichée à 50vw fait télécharger le double nécessaire.',
      },
      {
        heading: 'La bonne taille : srcset + sizes, jamais une 2400px sur mobile',
        paragraphs: [
          'Générez 3–4 largeurs (480, 960, 1600, éventuellement 2400 pour les écrans denses) et laissez le navigateur choisir via srcset + sizes. Une image hero mobile ne devrait jamais dépasser 100–150 Ko en AVIF.',
          'Automatisez : CDN image (redimensionnement à la volée), build (sharp, squoosh), ou plugin CMS. Le redimensionnement manuel ne tient pas à l’échelle d’un catalogue.',
        ],
        bullets: [
          '3–4 largeurs générées, sizes fidèle à la mise en page.',
          'Hero mobile < 150 Ko, vignettes < 30 Ko.',
          'Automatisation obligatoire au-delà de 50 images (CDN, build, plugin).',
        ],
      },
      {
        heading: 'Le bon moment : hero préchargée, reste lazy, dimensions toujours',
        paragraphs: [
          'L’image LCP se précharge (link preload + fetchpriority high) et ne porte JAMAIS loading="lazy". Tout le reste (below-the-fold, galeries, avatars) utilise loading="lazy" natif + decoding="async".',
          'Et dans tous les cas : width/height ou aspect-ratio pour réserver l’espace. Une image sans dimensions = un CLS garanti au chargement.',
        ],
        code: {
          lang: 'html',
          title: 'Hero LCP vs image lazy (ne pas inverser)',
          code: '<!-- HERO = élément LCP : préchargée, prioritaire, dimensions -->\n<link rel="preload" as="image" href="/hero-1600.avif"\n  imagesrcset="/hero-800.avif 800w, /hero-1600.avif 1600w"\n  imagesizes="100vw" fetchpriority="high" />\n<img src="/hero-1600.avif" width="1600" height="900"\n  fetchpriority="high" alt="…" />\n\n<!-- GALERIE : lazy natif, dimensions pour un CLS à zéro -->\n<img src="/photo-960.avif" width="960" height="640"\n  loading="lazy" decoding="async" alt="…" />',
        },
      },
    ],
    checklist: [
      'Formats : AVIF → WebP → JPEG via <picture>, qualité adaptée',
      'srcset 3–4 largeurs + sizes fidèle, hero mobile < 150 Ko',
      'Hero préchargée + fetchpriority high, jamais lazy',
      'Lazy natif + decoding async pour le reste, dimensions partout (CLS = 0)',
      'Automatisation (CDN/build/plugin) + audit trimestriel des nouvelles images',
    ],
    faq: [
      {
        q: 'AVIF ou WebP, que choisir en 2026 ?',
        a: 'Les deux via <picture>, AVIF en premier : 20–30 % plus léger que WebP à qualité égale, support quasi universel. Gardez WebP en second pour les rares navigateurs anciens.',
      },
      {
        q: 'Le lazy-loading peut-il nuire au SEO images ?',
        a: 'Non si bien fait : Google rend les pages avec Chrome et découvre les images lazy-loadées au scroll. Évitez juste le lazy sur les images above-the-fold et gardez des alt descriptifs.',
      },
    ],
    sources: [
      { label: 'MDN — Guide des formats d’image (AVIF, WebP)', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types' },
      { label: 'Google — Largest Contentful Paint', url: 'https://web.dev/articles/lcp' },
      { label: 'Google — Cumulative Layout Shift', url: 'https://web.dev/articles/cls' },
    ],
  },
  {
    slug: 'rum-web-vitals-20-minutes',
    title: 'Installer le RUM en 20 minutes : web-vitals, endpoint et dashboard',
    excerpt:
      'Vos vraies données terrain (LCP, INP, CLS au 75e percentile) en 20 minutes : librairie web-vitals, endpoint, requêtes et alertes.',
    cover: '/blog/rum.png',
    coverAlt: "Illustration RUM — signal de mesures terrain en direct",
    category: 'Mesure',
    readingTime: 10,
    date: '2026-10-14',
    updated: '2026-10-15',
    keywords: ['rum', 'real user monitoring', 'web-vitals', 'données terrain', '75e percentile', 'crux'],
    related: [
      'field-data-vs-lab-data-crux-lighthouse',
      'inp-interaction-to-next-paint-reactivite',
      'speculation-rules-navigation-instantanee',
    ],
    intro: [
      'CrUX vous donne la moyenne du mois dernier, Lighthouse une photo du labo — mais que vivent VOS utilisateurs, sur CETTE page, AVEC cet appareil ? Le RUM (Real User Monitoring) répond en mesurant LCP, INP et CLS sur chaque visite réelle, avec la librairie officielle web-vitals (quelques Ko).',
      'En 20 minutes : installation, endpoint de collecte, calcul du 75e percentile par page, et premières alertes. C’est aussi exactement ce que fait Vélocita en continu — ce tutoriel vous montre l’intérieur du moteur.',
    ],
    sections: [
      {
        heading: 'Minutes 0–5 : mesurer avec la librairie officielle',
        paragraphs: [
          'La librairie web-vitals mesure LCP, INP et CLS exactement comme Chrome les rapporte (75e percentile, gestion des onglets arrière-plan, bfcache). Chargez-la en différé pour ne pas impacter vos propres métriques, et envoyez chaque mesure avec le contexte minimal : page, appareil, type de connexion.',
          'N’envoyez que l’essentiel : nom, valeur, page, user-agent simplifié. Tout le reste (sessions, cohortes) se reconstruit côté serveur.',
        ],
        code: {
          lang: 'js',
          title: 'Collecte RUM minimale (5 minutes)',
          code: "import { onLCP, onINP, onCLS } from 'web-vitals'\n\nfunction send(metric) {\n  const body = JSON.stringify({\n    name: metric.name,          // LCP, INP, CLS\n    value: Math.round(metric.value),\n    page: location.pathname,\n    mobile: matchMedia('(pointer: coarse)').matches,\n  })\n  navigator.sendBeacon?.('/api/vitals', body)\n    ?? fetch('/api/vitals', { method: 'POST', body, keepalive: true })\n}\n\nfor (const fn of [onLCP, onINP, onCLS]) fn(send)",
        },
        tip: 'sendBeacon + keepalive : les mesures partent même si l’utilisateur quitte la page — sinon vous perdez les pires visites (biais du survivant).',
      },
      {
        heading: 'Minutes 5–15 : stocker et calculer le 75e percentile',
        paragraphs: [
          'Côté serveur, stockez chaque mesure (timestamp, page, métrique, valeur, mobile/desktop). Le seul calcul qui compte pour Google : le 75e percentile par page et par appareil sur 28 jours glissants. En SQL, c’est une fonction de percentile ; dans un tableur, un tri + index.',
          'Segmentez dès le jour 1 : par page/template, par mobile vs desktop, par pays si pertinent. Un LCP global à 2,2 s peut cacher des fiches produit à 4,5 s sur mobile.',
        ],
        code: {
          lang: 'sql',
          title: 'p75 par page (PostgreSQL, 28 jours glissants)',
          code: "SELECT page,\n  percentile_cont(0.75) WITHIN GROUP (ORDER BY value)\n    FILTER (WHERE name = 'LCP') AS lcp_p75,\n  percentile_cont(0.75) WITHIN GROUP (ORDER BY value)\n    FILTER (WHERE name = 'INP') AS inp_p75,\n  count(*) AS visites\nFROM vitals\nWHERE created_at > now() - interval '28 days'\nGROUP BY page\nHAVING count(*) > 100  -- significativité minimale\nORDER BY lcp_p75 DESC;",
        },
      },
      {
        heading: 'Minutes 15–20 : dashboard et premières alertes',
        paragraphs: [
          'Affichez un tableau simple : page × LCP/INP/CLS p75, avec pastilles vert/orange/rouge aux seuils Google (2,5 s, 200 ms, 0,1). Ajoutez la tendance 7 jours pour distinguer régression (saut brutal après un déploiement) et dérive (lente dégradation).',
          'Première alerte utile : toute page qui passe du vert à l’orange sur une métrique → notification. C’est 90 % de la valeur d’un monitoring avec 10 % du travail ; le reste (corrélation déploiements, attribution INP) viendra ensuite.',
        ],
        bullets: [
          'Dashboard : p75 par page × 3 métriques + tendance 7 jours.',
          'Alerte : passage vert → orange sur n’importe quelle métrique.',
          'Comparez RUM vs CrUX mensuellement pour valider votre échantillon.',
        ],
      },
    ],
    checklist: [
      'web-vitals chargée en différé, envoi sendBeacon/keepalive avec page + appareil',
      'Stockage timestampé, p75 par page/appareil sur 28 jours, seuil de significativité',
      'Dashboard pastilles + tendance 7 jours, alerte vert → orange',
      'Échantillonnage si fort trafic (10–20 % suffit), respect vie privée (pas d’IP en clair)',
      'Comparaison mensuelle RUM vs CrUX/Search Console',
    ],
    faq: [
      {
        q: 'RUM ou CrUX, que croire en cas de désaccord ?',
        a: 'Les deux : CrUX reflète 28 jours de Chrome réel (référence Google), votre RUM reflète tous navigateurs et vos segments métier. Un écart durable signale un biais d’échantillon ou un segment oublié (ex. iOS, pays émergents).',
      },
      {
        q: 'Le RUM ralentit-il le site ?',
        a: 'Non si bien fait : librairie < 2 Ko en différé, envoi asynchrone, échantillonnage. Le coût est de l’ordre de la milliseconde — très inférieur à un tracker publicitaire.',
      },
    ],
    sources: [
      { label: 'GoogleChrome — Librairie web-vitals (GitHub)', url: 'https://github.com/GoogleChrome/web-vitals' },
      { label: 'Chrome — Chrome UX Report (données terrain)', url: 'https://developer.chrome.com/docs/crux' },
      { label: 'Google — L’expérience de page et le SEO', url: 'https://developers.google.com/search/docs/appearance/page-experience' },
    ],
  },
  {
    slug: 'etude-cas-lcp-fiche-produit',
    title: 'Étude de cas : LCP de 4,1 s à 1,9 s sur une fiche produit (+31 % conversion)',
    excerpt:
      'Méthode complète d’un cas réel : diagnostic, 3 correctifs, mesures avant/après terrain et impact business chiffré, étape par étape.',
    cover: '/blog/cas.png',
    coverAlt: "Illustration étude de cas — LCP de 4,1 s à 1,9 s et conversion en hausse",
    category: 'SEO & Business',
    readingTime: 9,
    date: '2026-10-15',
    updated: '2026-10-15',
    keywords: ['étude de cas', 'core web vitals', 'lcp', 'conversion', 'fiche produit', 'ecommerce performance'],
    related: [
      'core-web-vitals-seo-conversions-optimisation',
      'lcp-largest-contentful-paint-optimisation',
      'wordpress-core-web-vitals-sans-tout-casser',
    ],
    intro: [
      'Contexte : boutique e-commerce (thème standard, ~800 fiches produit), LCP mobile au 75e percentile à 4,1 s sur les fiches produit, taux de conversion mobile en berne. En 3 semaines et 3 correctifs ciblés : LCP à 1,9 s, CLS à 0,04, et +31 % de conversion mobile sur le périmètre.',
      'Voici la méthode exacte, reproductible : diagnostic, correctifs dans l’ordre, mesures terrain avant/après, et calcul du ROI. Adaptez les chiffres à votre cas — la démarche, elle, est universelle.',
    ],
    sections: [
      {
        heading: 'Semaine 1 : le diagnostic qui désigne 3 coupables',
        paragraphs: [
          'RUM + PageSpeed sur 20 fiches produit : LCP p75 à 4,1 s, élément LCP = l’image produit principale (1,8 Mo JPEG, sans dimensions, chargée en lazy). Waterfall : TTFB à 1,2 s (pas de cache page), CSS de 380 Ko bloquant, 14 scripts tiers au démarrage.',
          'Priorisation ROI : l’image (0 €, 1 jour), le cache (abonnement CDN, 2 h), le JS tiers (2 jours d’audit). Le reste (refonte du thème) est écarté : trop cher pour un gain incertain.',
        ],
        bullets: [
          'Coupable n°1 : image LCP 1,8 Mo en lazy, sans dimensions.',
          'Coupable n°2 : TTFB 1,2 s sans cache page ni CDN.',
          'Coupable n°3 : 14 scripts tiers, dont chat + 2 régies au démarrage.',
        ],
      },
      {
        heading: 'Semaines 2–3 : 3 correctifs, dans l’ordre, mesurés un par un',
        paragraphs: [
          'Correctif 1 (jour 1–2) : image produit en AVIF responsive (srcset 480/960/1600), dimensions explicites, preload + fetchpriority high, lazy supprimé sur la première image uniquement. LCP labo : 4,1 s → 2,9 s.',
          'Correctif 2 (jour 3) : cache page + CDN avec stale-while-revalidate, Brotli. TTFB : 1,2 s → 280 ms. LCP : 2,9 s → 2,2 s.',
          'Correctif 3 (semaine 2–3) : chat en façade cliquable, régies différées après interaction, 6 scripts supprimés. INP : 480 ms → 170 ms. LCP final : 1,9 s, CLS : 0,04.',
        ],
        code: {
          lang: 'html',
          title: 'Le correctif n°1 (image produit LCP)',
          code: '<!-- Avant : 1,8 Mo, lazy, sans dimensions -->\n<!-- <img src="/produit.jpg" loading="lazy" alt="…"> -->\n\n<!-- Après : AVIF responsive, préchargée, dimensionnée -->\n<link rel="preload" as="image" href="/produit-1600.avif"\n  imagesrcset="/produit-800.avif 800w, /produit-1600.avif 1600w"\n  imagesizes="(max-width: 640px) 100vw, 50vw" fetchpriority="high" />\n<img src="/produit-1600.avif"\n  srcset="/produit-800.avif 800w, /produit-1600.avif 1600w"\n  sizes="(max-width: 640px) 100vw, 50vw"\n  width="1600" height="1600" fetchpriority="high" alt="…" />',
        },
        tip: 'Un correctif à la fois + une mesure labo entre chaque : sinon vous ne saurez jamais ce qui a vraiment payé.',
      },
      {
        heading: 'Résultats terrain et ROI : +31 % de conversion mobile',
        paragraphs: [
          'Après 28 jours (le temps que CrUX intègre les corrections) : LCP p75 mobile 4,1 s → 1,9 s, INP 480 ms → 170 ms, CLS 0,12 → 0,04. Les 3 métriques passent au vert sur les fiches produit.',
          'Business : taux de conversion mobile +31 % sur le périmètre (période comparable, trafic stable), rebond -18 %. Coût total : 5 jours-homme + abonnement CDN. Même avec des hypothèses prudentes (moitié de l’effet attribué à la vitesse), le ROI se compte en semaines.',
        ],
        bullets: [
          'LCP 4,1 → 1,9 s · INP 480 → 170 ms · CLS 0,12 → 0,04 (p75 mobile, terrain).',
          'Conversion mobile +31 %, rebond -18 %, coût 5 j-h + CDN.',
          'Méthode : 28 jours de terrain avant de conclure, trafic comparable, un changement à la fois.',
        ],
      },
    ],
    checklist: [
      'Périmètre défini (fiches produit mobile) + baseline terrain p75 notée',
      'Coupables priorisés par ROI (coût × gain), refonte écartée si non rentable',
      'Correctifs appliqués un par un, mesure labo entre chaque',
      '28 jours de terrain avant conclusion, trafic comparable',
      'ROI calculé et présenté (conversion, rebond, coût) pour financer la suite',
    ],
    faq: [
      {
        q: 'Ces chiffres sont-ils reproductibles sur mon site ?',
        a: 'La démarche oui, les chiffres non : chaque site a ses propres coupables. En revanche, le trio gagnant (image LCP, cache/CDN, JS tiers) résout 80 % des cas e-commerce que nous auditons.',
      },
      {
        q: 'Faut-il vraiment attendre 28 jours pour conclure ?',
        a: 'Pour le verdict Google (CrUX), oui. Mais votre RUM montre l’effet en quelques jours, et le labo immédiatement : pilotez au RUM, validez au CrUX.',
      },
    ],
    sources: [
      { label: 'Google — Études de cas performance web', url: 'https://web.dev/case-studies' },
      { label: 'Google — L’expérience de page et le SEO', url: 'https://developers.google.com/search/docs/appearance/page-experience' },
      { label: 'Google — Web Vitals (seuils et outils)', url: 'https://web.dev/articles/vitals' },
    ],
  },
]
