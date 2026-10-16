// Troisième vague du blog : métriques avancées + techniques de chargement.
// Fusionnés dans BLOG_POSTS via blog.ts. Sources externes vérifiées.

import type { BlogPost } from './blog'

export const BLOG_POSTS_P3: BlogPost[] = [
  {
    slug: 'loaf-long-animation-frames',
    title: 'Long Animation Frames (LoAF) : traquer ce qui bloque vraiment',
    excerpt:
      'Le successeur des Long Tasks : mesurer les frames > 50 ms, attribuer chaque blocage à son script et corriger durablement.',
    cover: '/blog/loaf.png',
    coverAlt: "Illustration LoAF — barres de frames longues à attribuer",
    category: 'Core Web Vitals',
    metric: 'LoAF',
    readingTime: 10,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['loaf', 'long animation frames', 'long tasks', 'inp', 'tbt', 'main thread'],
    related: [
      'inp-interaction-to-next-paint-reactivite',
      'tbt-total-blocking-time-javascript',
      'rum-web-vitals-20-minutes',
    ],
    intro: [
      'Vous savez QUAND la page bloque (TBT élevé, INP rouge), mais pas QUOI bloque : quel script, quel handler, quelle frame ? Long Animation Frames (LoAF) répond en exposant chaque frame de plus de 50 ms avec son détail : scripts, layout, paint et temps morts.',
      'LoAF ne remplace pas l’INP en tant que signal, mais c’est l’outil de diagnostic qui manquait entre le TBT de labo et l’INP terrain. Voici comment l’activer, le lire et l’exploiter.',
    ],
    sections: [
      {
        heading: 'Long Tasks vs LoAF : ce qui change vraiment',
        paragraphs: [
          'Les Long Tasks découpent le blocage par tâche de 50 ms, sans contexte : impossible de savoir si 5 tâches appartiennent à la même interaction. LoAF raisonne en frames de rendu : une entrée regroupe tout ce qui a retardé UNE image (scripts, style/layout, paint), avec les coupables nommés.',
          'Concrètement : là où le profiler montrait « tâche anonyme de 240 ms », LoAF montre « handler onClick du filtre (180 ms de script) + recalcul de styles (40 ms) ». Le plan d’action devient évident.',
        ],
        bullets: [
          'Long Tasks : quoi (durée) — LoAF : quoi + qui (script, fonction, frame).',
          'LoAF disponible via PerformanceObserver ("long-animation-frame"), Chrome 123+.',
          'Complémentaire : TBT en labo, INP en signal, LoAF en diagnostic.',
        ],
      },
      {
        heading: 'Activer LoAF en 10 lignes (labo + RUM)',
        paragraphs: [
          'En labo, l’onglet Performance de DevTools affiche déjà les longues frames. En production, un observer léger envoie les pires frames avec leur attribution (nom du script, durée par phase). Échantillonnez à 10 % sur fort trafic : les frames > 200 ms sont rares mais décisives.',
          'Filtrez sur les pages à INP rouge en priorité : 3 à 5 sessions instrumentées suffisent généralement à identifier LE script fautif.',
        ],
        code: {
          lang: 'js',
          title: 'Capturer les pires frames avec attribution',
          code: "const po = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    if (entry.duration < 200) continue // seules les pires frames\n    const scripts = (entry.scripts || []).map((s) => ({\n      src: new URL(s.sourceURL || '').pathname,\n      fn: s.sourceFunctionName || '(anonyme)',\n      ms: Math.round(s.duration),\n    }))\n    navigator.sendBeacon?.('/api/loaf', JSON.stringify({\n      page: location.pathname, ms: Math.round(entry.duration), scripts,\n    }))\n  }\n})\ntry { po.observe({ type: 'long-animation-frame', buffered: true }) } catch {}",
        },
        tip: 'Triez par durée × fréquence : une frame de 500 ms vue 2 fois vaut moins qu’une frame de 150 ms vue 2 000 fois par jour.',
      },
      {
        heading: 'Corriger : les 4 patterns qui reviennent toujours',
        paragraphs: [
          'Dans 80 % des cas, les coupables sont : un handler synchrone qui fait tout (fetch + parse + render), un recalcul de styles massif (lecture/écriture de layout en boucle), une hydratation géante au chargement, ou un tiers qui s’exécute au pire moment.',
          'Recettes : découper avec yield, séparer lecture et écriture DOM, virtualiser, différer les tiers, et déplacer le calcul pur en worker. Re-mesurez en labo (TBT) puis validez l’INP en terrain sur 7 jours.',
        ],
        bullets: [
          'Handlers : yield entre fetch, parse et render (scheduler.yield).',
          'Layout : batcher les lectures, éviter offsetWidth en boucle.',
          'Tiers : façade + idle, jamais au démarrage sur les parcours critiques.',
        ],
      },
    ],
    checklist: [
      'LoAF instrumenté (labo DevTools + RUM échantillonné sur pages INP rouges)',
      'Top 5 des scripts par durée × fréquence identifié',
      'Handlers découpés, layout batché, tiers différés',
      'TBT < 200 ms en labo puis INP ≤ 200 ms validé en terrain',
    ],
    faq: [
      {
        q: 'LoAF remplace-t-il le TBT ?',
        a: 'Non : le TBT reste l’indicateur labo synthétique (idéal en CI), LoAF est le microscope qui attribue chaque blocage à son script. Utilisez les deux : TBT pour alerter, LoAF pour diagnostiquer.',
      },
      {
        q: 'Quel support navigateur ?',
        a: 'Chrome/Edge depuis la version 123. Sur les autres navigateurs, l’instrumentation est simplement ignorée (try/catch) : mesurez en labo avec DevTools et complétez le RUM côté Chrome.',
      },
    ],
    sources: [
      { label: 'MDN — PerformanceLongTaskTiming (API Long Tasks)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming' },
      { label: 'Google — Total Blocking Time', url: 'https://web.dev/articles/tbt' },
      { label: 'Google — Interaction to Next Paint', url: 'https://web.dev/articles/inp' },
    ],
  },
  {
    slug: 'inp-attribution-debug',
    title: 'INP : attribuer chaque lenteur à son script (debug avancé)',
    excerpt:
      'Votre INP est rouge mais vous ignorez pourquoi ? Attribution API, phases input/délai/présentation et méthode de debug pas à pas.',
    cover: '/blog/inp-debug.png',
    coverAlt: "Illustration debug INP — loupe sur interaction et phases",
    category: 'Core Web Vitals',
    metric: 'INP',
    readingTime: 10,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['inp attribution', 'debug inp', 'interaction delay', 'presentation delay', 'processing duration'],
    related: [
      'inp-interaction-to-next-paint-reactivite',
      'loaf-long-animation-frames',
      'tbt-total-blocking-time-javascript',
    ],
    intro: [
      '« INP à 480 ms » ne dit pas si le problème vient de l’attente (thread occupé), du traitement (handler trop lourd) ou du rendu (frame suivante trop tard). Sans cette décomposition, on optimise à l’aveugle — et souvent au mauvais endroit.',
      'Ce guide montre comment attribuer chaque INP lent à sa phase et à son script, en labo comme en RUM, puis quoi corriger selon la phase fautive.',
    ],
    sections: [
      {
        heading: 'Les 3 phases d’une interaction (et ce qu’elles accusent)',
        paragraphs: [
          'Un INP se décompose en : input delay (temps avant que le handler démarre — thread occupé ailleurs), processing duration (exécution de vos handlers), presentation delay (attente de la frame suivante — rendu, autres handlers, layout).',
          'Lecture : input delay élevé = trop de JS global (découper, différer) ; processing élevé = CE handler est trop lourd (le profiler le montre) ; presentation élevé = rendu coûteux ou handlers concurrents (layout, animations, frameworks).',
        ],
        bullets: [
          'Input delay → alléger le thread global (moins de JS, mieux découpé).',
          'Processing → optimiser ce handler précis (voir LoAF).',
          'Presentation → réduire le coût de rendu (layout, couches, animations).',
        ],
      },
      {
        heading: 'En pratique : DevTools puis attribution en RUM',
        paragraphs: [
          'En labo : enregistrez l’interaction dans le panneau Performance, repérez la longue tâche jaune et lisez l’arbre d’appels (Bottom-Up) : le coupable est la fonction la plus coûteuse, souvent un handler inline ou un effet framework.',
          'En RUM : la librairie web-vitals expose l’attribution (cible, type d’interaction, phases, responsable du pire délai). Loggez interaction + phase dominante + URL du script pour prioriser par impact réel.',
        ],
        code: {
          lang: 'js',
          title: 'Logger la phase fautive en production',
          code: "import { onINP } from 'web-vitals'\n\nonINP((metric) => {\n  if (metric.value < 200) return\n  const a = metric.attribution || {}\n  const phases = {\n    inputDelay: a.inputDelay ?? 0,\n    processing: (a.processingDuration ?? 0),\n    presentation: (a.presentationDelay ?? 0),\n  }\n  const worst = Object.entries(phases).sort((x, y) => y[1] - x[1])[0]\n  navigator.sendBeacon?.('/api/inp-debug', JSON.stringify({\n    page: location.pathname,\n    interaction: a.interactionType || a.eventType || '?',\n    target: a.interactionTarget || '?',\n    worstPhase: worst[0],\n    value: Math.round(metric.value),\n  }))\n})",
        },
        tip: 'Regroupez par (interaction, phase, page) : le top 3 représente presque toujours 80 % de votre INP.',
      },
      {
        heading: 'Corriger selon la phase (anti-patterns courants)',
        paragraphs: [
          'Input delay : le coupable est rarement l’interaction elle-même — chassez les timers, animations et hydratations qui monopolisent le thread. Processing : découpez le handler (yield, worker, pagination/virtualisation). Presentation : évitez les layouts synchrones après mise à jour d’état et les animations sur propriétés coûteuses.',
          'Côté frameworks : un selecteur global qui re-rend toute la page à chaque frappe est le classique React ; un effet qui mesure le DOM puis écrit dedans est le classique vanilla.',
        ],
        bullets: [
          'Debounce 150–300 ms sur recherche/filtres, listes virtualisées.',
          'État local plutôt que global pour les inputs à frappe rapide.',
          'Animations en transform/opacity uniquement, couches dédiées (will-change avec parcimonie).',
        ],
      },
    ],
    checklist: [
      'Phases de l’INP comprises et mesurées (labo + RUM avec attribution)',
      'Top 3 (interaction, phase, page) identifié et quantifié',
      'Correctif ciblé selon la phase, pas de refonte globale',
      'INP ≤ 200 ms validé en terrain après 7–14 jours',
    ],
    faq: [
      {
        q: 'Pourquoi mon INP labo est bon mais le terrain rouge ?',
        a: 'Le labo teste 1–2 interactions sur machine puissante ; le terrain cumule appareils modestes, réseau réel et TOUTES les interactions (dont les pires : filtres, recherche, panier). Fiez-vous au RUM par interaction.',
      },
      {
        q: 'L’attribution fonctionne-t-elle sur tous navigateurs ?',
        a: 'L’attribution détaillée est complète sur Chromium. Sur les autres, la valeur INP reste mesurée mais avec moins de détail : segmentez par navigateur dans votre RUM.',
      },
    ],
    sources: [
      { label: 'Google — Interaction to Next Paint', url: 'https://web.dev/articles/inp' },
      { label: 'Google — Total Blocking Time', url: 'https://web.dev/articles/tbt' },
      { label: 'GoogleChrome — Librairie web-vitals (GitHub)', url: 'https://github.com/GoogleChrome/web-vitals' },
    ],
  },
  {
    slug: 'fid-vers-inp-migration',
    title: 'FID vers INP : checklist de migration pour les anciens sites',
    excerpt:
      'Le FID a été remplacé par l’INP : différences, tableau de correspondance, et checklist pour migrer vos dashboards et budgets.',
    cover: '/blog/fid.png',
    coverAlt: "Illustration migration FID vers INP — nouveaux seuils",
    category: 'Core Web Vitals',
    readingTime: 7,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['fid', 'first input delay', 'inp', 'migration fid inp', 'fid vs inp'],
    related: [
      'inp-interaction-to-next-paint-reactivite',
      'guide-complet-core-web-vitals-2026',
      'rum-web-vitals-20-minutes',
    ],
    intro: [
      'Depuis mars 2024, le First Input Delay (FID) n’est plus un Core Web Vital : l’Interaction to Next Paint (INP) l’a remplacé. Si vos dashboards, budgets ou rapports parlent encore FID, vous pilotez avec un rétroviseur qui n’existe plus.',
      'Bonne nouvelle : la migration est surtout une mise à jour de seuils et d’instrumentation. Voici les différences qui comptent et la checklist en 6 points.',
    ],
    sections: [
      {
        heading: 'FID vs INP : le tableau qui évite toute confusion',
        paragraphs: [
          'Le FID mesurait uniquement le DÉLAI de la PREMIÈRE interaction (temps avant exécution du handler). L’INP mesure le cycle COMPLET (délai + traitement + rendu) sur TOUTES les interactions, et retient les pires. Résultat : un site « bon » en FID peut être rouge en INP — c’est normal, l’exigence a changé.',
          'Conséquence pratique : les seuils ne sont pas transposables. FID bon ≤ 100 ms ; INP bon ≤ 200 ms — mais 200 ms d’INP couvrent bien plus que 100 ms de FID.',
        ],
        bullets: [
          'FID : 1re interaction, délai seul, ≤ 100 ms.',
          'INP : toutes interactions, cycle complet, ≤ 200 ms.',
          'Un bon FID ne prédit PAS un bon INP : re-mesurez tout.',
        ],
      },
      {
        heading: 'Checklist de migration en 6 points',
        paragraphs: [
          'Mettez à jour dans l’ordre : instrumentation (web-vitals onINP), dashboards (remplacer les tuiles FID), budgets et alertes (seuils 200/500 ms), rapports clients (expliquer le changement de périmètre), documentation interne, puis historique (annoter la rupture de série pour ne pas comparer FID et INP).',
          'Attention aux comparaisons avant/après : une hausse apparente après migration n’est pas une régression, c’est une métrique plus exigeante. Communiquez-le avant que quelqu’un panique devant le dashboard.',
        ],
        code: {
          lang: 'js',
          title: 'Remplacer onFID par onINP (web-vitals)',
          code: "// Avant (obsolète)\n// import { onFID } from 'web-vitals'\n// onFID(sendToAnalytics)\n\n// Après\nimport { onINP } from 'web-vitals'\n\nonINP((metric) => {\n  // metric.value en ms, metric.attribution pour le debug\n  sendToAnalytics({ name: 'INP', value: Math.round(metric.value) })\n})",
        },
        tip: 'Gardez 3 mois d’historique FID en lecture seule pour référence, mais pilotez 100 % sur l’INP dès aujourd’hui.',
      },
    ],
    checklist: [
      'Instrumentation migrée vers onINP (web-vitals à jour)',
      'Dashboards, budgets et alertes passés aux seuils 200/500 ms',
      'Rapports et docs internes mis à jour (périmètre expliqué)',
      'Rupture de série annotée (ne jamais comparer FID et INP)',
      'Plan d’optimisation INP lancé sur les pages rouges',
    ],
    faq: [
      {
        q: 'Le FID est-il encore mesuré quelque part ?',
        a: 'Oui, en diagnostic (DevTools, web-vitals en legacy), mais il ne compte plus pour Google. Ne pilotez plus rien dessus.',
      },
      {
        q: 'Mon INP est pire que mon ancien FID, dois-je m’inquiéter ?',
        a: 'Non, c’est attendu : l’INP mesure plus d’interactions et tout le cycle. Traitez-le comme une nouvelle baseline et optimisez depuis là.',
      },
    ],
    sources: [
      { label: 'Google — Interaction to Next Paint', url: 'https://web.dev/articles/inp' },
      { label: 'Google — Web Vitals (cycle de vie des métriques)', url: 'https://web.dev/articles/vitals' },
    ],
  },
  {
    slug: 'speed-index-tti-utiles',
    title: 'Speed Index et Time to Interactive : encore utiles en 2026 ?',
    excerpt:
      'Deux métriques Lighthouse historiques : ce qu’elles mesurent, quand les regarder (et quand les ignorer) face aux Core Web Vitals.',
    cover: '/blog/speedindex.png',
    coverAlt: "Illustration Speed Index et TTI — jauge de progression labo",
    category: 'Core Web Vitals',
    readingTime: 7,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['speed index', 'time to interactive', 'tti', 'lighthouse metrics', 'si'],
    related: [
      'guide-complet-core-web-vitals-2026',
      'fcp-first-contentful-paint-rapidite',
      'tbt-total-blocking-time-javascript',
    ],
    intro: [
      'Speed Index (SI) et Time to Interactive (TTI) ont bercé des années de rapports Lighthouse — puis les Core Web Vitals les ont reléguées au second plan. Faut-il encore les regarder ? Réponse nuancée : non comme objectifs, oui comme diagnostics, dans 2 cas précis.',
      'Ce guide clarifie ce qu’elles mesurent vraiment, leurs seuils de lecture, et quand elles vous font gagner du temps (splash screens, hydratation).',
    ],
    sections: [
      {
        heading: 'Speed Index : la vitesse PERÇUE image par image',
        paragraphs: [
          'Le Speed Index mesure la vitesse de remplissage visuel : plus le contenu apparaît tôt et complètement, plus le score est bas (en millisecondes, bon < 3,4 s en labo). C’est la seule métrique qui « regarde » la page comme un utilisateur, image par image.',
          'Quand l’utiliser : pages avec splash screen ou chargement progressif trompeur (bon FCP mais page vide ressentie), comparaisons avant/après de refontes visuelles, et filmstrips WebPageTest pour montrer le ressenti aux non-techniques.',
        ],
        bullets: [
          'Bon < 3 400 ms en labo (Lighthouse, mobile simulé).',
          'Idéal pour : splash screens, skeleton vs spinner, refontes visuelles.',
          'Ne pilotez jamais un bonus ou un SLA dessus : métrique labo uniquement.',
        ],
      },
      {
        heading: 'Time to Interactive : la page est-elle VRAIMENT utilisable ?',
        paragraphs: [
          'Le TTI marque le moment où la page est visuellement complète ET réactive (thread libre, handlers prêts), bon < 3,8 s en labo. Son talon d’Achille : très sensible au JS et à la variabilité, donc bruyant — Google lui a préféré TBT (stable) puis INP (terrain).',
          'Quand l’utiliser : diagnostiquer une hydratation interminable (page visible mais figée 5 s), ou comparer deux architectures JS. Sinon, pilotez TBT en labo et INP en terrain.',
        ],
        bullets: [
          'Bon < 3 800 ms en labo ; au-delà, suspectez hydratation ou JS monolithique.',
          'Remplacé en pratique par : TBT (labo, stable) + INP (terrain, réel).',
          'Gardez-le comme alerte secondaire dans Lighthouse CI, pas comme budget bloquant.',
        ],
        tip: 'Page visible mais qui ne répond pas = problème TTI/INP, pas LCP : ne confondez jamais les deux chantiers.',
      },
    ],
    checklist: [
      'Objectifs pilotés sur LCP/INP/CLS (terrain), jamais sur SI/TTI',
      'SI utilisé pour les comparaisons visuelles et les splash screens',
      'TTI surveillé comme alerte hydratation, budgets sur TBT',
      'Rapports clients : expliquer pourquoi SI/TTI ont disparu des objectifs',
    ],
    faq: [
      {
        q: 'Pourquoi Google a-t-il écarté le TTI ?',
        a: 'Trop variable et trop sensible au JS pour un signal de classement stable. L’INP mesure la réactivité réelle vécue, le TBT la prédit en labo : le duo couvre mieux le besoin.',
      },
      {
        q: 'Mon Speed Index est mauvais mais mon LCP bon, grave ?',
        a: 'Ça signale un remplissage visuel irrégulier (ex. contenu qui arrive par à-coups). Améliorez la perception (skeletons stables, ordre de chargement), même si le SEO n’est pas en jeu.',
      },
    ],
    sources: [
      { label: 'Google — Web Vitals (métriques officielles)', url: 'https://web.dev/articles/vitals' },
      { label: 'Google — First Contentful Paint', url: 'https://web.dev/articles/fcp' },
      { label: 'Google — Total Blocking Time', url: 'https://web.dev/articles/tbt' },
    ],
  },
  {
    slug: 'fetchpriority-preload-preconnect',
    title: 'fetchpriority, preload, preconnect : le plan de chargement parfait',
    excerpt:
      'Dites au navigateur quoi charger en premier : priorités, préchargements et préconnexions, avec les 5 erreurs qui coûtent une seconde.',
    cover: '/blog/fetchpriority.png',
    coverAlt: "Illustration priorités de chargement — hero prioritaire",
    category: 'Optimisation',
    readingTime: 9,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['fetchpriority', 'preload', 'preconnect', 'priorités chargement', 'resource hints'],
    related: [
      'lcp-largest-contentful-paint-optimisation',
      'fcp-first-contentful-paint-rapidite',
      'images-avif-srcset-lazy-loading',
    ],
    intro: [
      'Le navigateur devine l’ordre de chargement — et se trompe souvent : la police du footer passe devant l’image hero, le CSS critique attend après un script tiers. Les resource hints corrigent ça : fetchpriority (priorité), preload (découverte anticipée), preconnect (connexion anticipée).',
      'Bien dosés, ils font gagner 0,3 à 1 s sur LCP et FCP. Mal dosés, ils volent la bande passante aux vraies priorités. Voici le plan exact, et les 5 erreurs à éviter.',
    ],
    sections: [
      {
        heading: 'Les 3 outils et leur rôle (ne pas les confondre)',
        paragraphs: [
          'fetchpriority="high" monte la priorité d’une ressource DÉJÀ découverte (image LCP, CSS critique) ; fetchpriority="low" descend les non-critiques (images below-the-fold, iframes). preload fait découvrir TÔT une ressource tardive (font, hero, CSS/JS critique). preconnect ouvre TÔT la connexion (DNS+TLS) vers une origine tierce, sans rien télécharger.',
          'Logique : preconnect vers les origines critiques (CDN, fonts), preload pour 1–3 ressources héroïques maximum, fetchpriority pour ordonner le reste. Au-delà de 3 preloads, vous créez l’embouteillage que vous vouliez éviter.',
        ],
        bullets: [
          'preconnect : origines critiques uniquement (2–3 max, +crossorigin pour les fonts).',
          'preload : 1–3 ressources LCP (hero, font principale, CSS critique).',
          'fetchpriority high : 1 seul élément (le LCP) ; low : below-the-fold et tiers.',
        ],
        code: {
          lang: 'html',
          title: 'Le trio minimal qui marche',
          code: '<!-- 1. Connexions anticipées -->\n<link rel="preconnect" href="https://cdn.votre-site.fr" crossorigin />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n\n<!-- 2. Hero LCP découverte tôt + prioritaire -->\n<link rel="preload" as="image" href="/hero-1600.avif"\n  imagesrcset="/hero-800.avif 800w, /hero-1600.avif 1600w"\n  imagesizes="100vw" fetchpriority="high" />\n\n<!-- 3. Tiers non critique rétrogradé -->\n<iframe src="…" loading="lazy" fetchpriority="low"></iframe>',
        },
      },
      {
        heading: 'Les 5 erreurs qui coûtent une seconde',
        paragraphs: [
          'Préloader ce que le navigateur trouve déjà seul (CSS/JS du head) : zéro gain, bande passante volée. Préloader 8 polices : le LCP attend derrière. Oublier crossorigin sur le preconnect fonts : la connexion est rouverte, gain nul. Mettre fetchpriority high partout : équivaut à ne rien prioriser. Préloader une ressource non utilisée sur la page : avertissement console + poids inutile.',
          'Vérifiez dans DevTools > Network (colonne Priority) : la ressource LCP doit être Highest, le reste High/Medium/Low selon criticité.',
        ],
        bullets: [
          'Jamais de preload sur ressource déjà découverte dans le head.',
          'Un seul fetchpriority="high" par page (l’élément LCP).',
          'crossorigin obligatoire sur preconnect fonts et preload de fonts.',
          'Contrôlez la colonne Priority de DevTools après chaque changement.',
        ],
        tip: 'Règle des 3 : 3 preconnect max, 3 preloads max, 1 fetchpriority high. Tout le reste est probablement du gaspillage.',
      },
    ],
    checklist: [
      'preconnect (2–3 origines) avec crossorigin où requis',
      '1–3 preloads ciblés LCP, ressource LCP en Highest dans DevTools',
      'fetchpriority high unique, low sur below-the-fold et tiers',
      'Zéro avertissement preload inutile en console, gain LCP/FCP mesuré',
    ],
    faq: [
      {
        q: 'preload et prefetch, quelle différence ?',
        a: 'preload = pour CETTE page, priorité haute, découverte anticipée. prefetch (et Speculation Rules) = pour une FUTURE navigation probable, priorité basse. Ne les intervertissez pas.',
      },
      {
        q: 'fetchpriority remplace-t-il le lazy-loading ?',
        a: 'Non, ils se combinent : lazy-loading décide QUAND charger (au scroll), fetchpriority avec QUELLE priorité. Une image lazy + low est le réglage standard below-the-fold.',
      },
    ],
    sources: [
      { label: 'Google — Largest Contentful Paint', url: 'https://web.dev/articles/lcp' },
      { label: 'Google — First Contentful Paint', url: 'https://web.dev/articles/fcp' },
      { label: 'MDN — Guide des formats d’image', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types' },
    ],
  },
  {
    slug: 'bfcache-cache-arriere',
    title: 'bfcache : le cache retour qui rend vos pages instantanées',
    excerpt:
      '1 navigation sur 5 est un retour arrière : activez le back/forward cache (unload, no-store, connexions) et mesurez le gain.',
    cover: '/blog/bfcache.png',
    coverAlt: "Illustration bfcache — retour arrière instantané",
    category: 'Optimisation',
    readingTime: 9,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['bfcache', 'back forward cache', 'unload', 'pageshow', 'navigation retour'],
    related: [
      'field-data-vs-lab-data-crux-lighthouse',
      'inp-interaction-to-next-paint-reactivite',
      'speculation-rules-navigation-instantanee',
    ],
    intro: [
      'Sur mobile, 1 navigation sur 5 est un retour en arrière — et sans bfcache, chaque retour recharge toute la page (requêtes, JS, rendu). Le back/forward cache restaure la page depuis la mémoire : navigation quasi instantanée, zéro réseau.',
      'Problème : beaucoup de pages s’en excluent sans le savoir (listener unload, Cache-Control: no-store, connexions ouvertes). Voici comment vérifier, corriger et mesurer.',
    ],
    sections: [
      {
        heading: 'Vérifier en 2 minutes (DevTools + Lighthouse)',
        paragraphs: [
          'Dans DevTools > Application > Back-forward Cache, lancez le test : il navigue et indique si la restauration fonctionne, avec la raison exacte en cas d’échec (« unload listener », « no-store », « WebSocket ouvert »…). Lighthouse possède aussi un audit bfcache.',
          'En RUM, mesurez votre taux de restauration via l’événement pageshow (persisted=true) : sous 70 %, il y a un chantier rentable.',
        ],
        code: {
          lang: 'js',
          title: 'Mesurer le taux de restauration bfcache',
          code: "window.addEventListener('pageshow', (event) => {\n  if (event.persisted) {\n    // Restauration mémoire : quasi instantanée, ne pas confondre avec un chargement\n    navigator.sendBeacon?.('/api/vitals', JSON.stringify({\n      name: 'bfcache-restore', page: location.pathname,\n    }))\n  }\n})",
        },
      },
      {
        heading: 'Les 4 bloqueurs classiques (et leurs correctifs)',
        paragraphs: [
          'Listener unload (même via une librairie tierce) : remplacez par pagehide, qui couvre les mêmes cas sans bloquer le cache. Cache-Control: no-store sur le HTML : réservez-le aux pages vraiment sensibles, utilisez no-cache + revalidation ailleurs.',
          'Connexions ouvertes (WebSocket, IndexedDB, fetch en cours) : fermez-les sur pagehide, rouvrez sur pageshow. beforeunload inconditionnel : ne l’ajoutez que quand il y a vraiment des modifications non sauvegardées.',
        ],
        bullets: [
          'unload → pagehide (y compris dans les scripts tiers, à exiger des fournisseurs).',
          'no-store uniquement sur pages sensibles ; no-cache ailleurs.',
          'Fermer WebSocket/IndexedDB sur pagehide, rouvrir sur pageshow.',
          'beforeunload seulement si modifications non sauvegardées.',
        ],
        code: {
          lang: 'js',
          title: 'Remplacer unload par pagehide',
          code: "// Avant (bloque le bfcache)\n// window.addEventListener('unload', saveState)\n\n// Après (compatible bfcache)\nwindow.addEventListener('pagehide', (event) => {\n  if (!event.persisted) saveState() // sauvegarde réelle au départ définitif\n  closeSockets()                    // libère les connexions dans tous les cas\n})",
        },
        tip: 'Le coupable est souvent un tiers (chat, pub, tag manager) : exigez de vos fournisseurs la compatibilité bfcache, c’est contractuel.',
      },
      {
        heading: 'Analytics et métriques : ne faussez pas vos chiffres',
        paragraphs: [
          'Une restauration bfcache n’est pas un chargement : ne recomptez ni LCP plein pot ni pageview complète sans le vouloir. La librairie web-vitals gère les restaurations (INP/CLS remis à zéro, LCP approximé) — utilisez-la plutôt qu’une mesure maison.',
          'Côté analytics, envoyez un événement dédié (pas un page_view standard) pour garder des funnels propres et mesurer votre vrai taux de retour.',
        ],
        bullets: [
          'web-vitals à jour : gère nativement les restaurations bfcache.',
          'Événement analytics dédié pour les restaurations, funnels inchangés.',
          'KPI : taux de restauration > 70 %, LCP des retours < 500 ms.',
        ],
      },
    ],
    checklist: [
      'Test DevTools bfcache vert sur les templates clés',
      'Zéro listener unload, no-store réservé au sensible',
      'Connexions fermées sur pagehide, analytics dédiés aux restaurations',
      'Taux de restauration mesuré en RUM, objectif > 70 %',
    ],
    faq: [
      {
        q: 'Le bfcache fonctionne-t-il sur les SPA ?',
        a: 'Partiellement : il couvre les navigations navigateur (retour vers/depuis la SPA), pas les navigations internes au routeur. Combinez-le avec le prefetch du routeur pour les deux cas.',
      },
      {
        q: 'Pages derrière login et bfcache ?',
        a: 'Possible, mais rafraîchissez les données sensibles sur pageshow (panier, compte, état de connexion) pour ne jamais afficher un état périmé.',
      },
    ],
    sources: [
      { label: 'Google — Back/forward cache (guide complet)', url: 'https://web.dev/articles/bfcache' },
      { label: 'Google — Web Vitals (seuils et outils)', url: 'https://web.dev/articles/vitals' },
      { label: 'GoogleChrome — Librairie web-vitals (GitHub)', url: 'https://github.com/GoogleChrome/web-vitals' },
    ],
  },
  {
    slug: 'polices-web-performances',
    title: 'Polices web et performance : swap, subset et size-adjust sans CLS',
    excerpt:
      'WOFF2, display=swap, subset unicode-range, size-adjust : la méthode complète pour des textes rapides et stables.',
    cover: '/blog/polices.png',
    coverAlt: "Illustration polices web — WOFF2 stables sans décalage",
    category: 'Optimisation',
    readingTime: 9,
    date: '2026-10-16',
    updated: '2026-10-16',
    keywords: ['font-display swap', 'woff2', 'subset fonts', 'size-adjust', 'polices cls', 'unicode-range'],
    related: [
      'cls-cumulative-layout-shift-zero',
      'fcp-first-contentful-paint-rapidite',
      'nextjs-core-web-vitals-app-router',
    ],
    intro: [
      'Les polices web frappent deux fois : elles retardent le premier texte (FCP/LCP) quand elles bloquent, et décalent la mise en page (CLS) quand elles arrivent tard avec d’autres métriques. Pourtant la recette tient en 4 décisions : format, chargement, périmètre, stabilisation.',
      'Suivez ce guide pour des textes rapides ET stables, que vous soyez sur WordPress, Next.js ou HTML pur.',
    ],
    sections: [
      {
        heading: 'Format et chargement : WOFF2 auto-hébergé, 2 familles max',
        paragraphs: [
          'WOFF2 uniquement (30 % plus léger que WOFF, support universel), auto-hébergé sur votre CDN plutôt que chez un tiers quand possible : une connexion en moins, des en-têtes cache maîtrisés. Limitez à 2 familles et 2–3 graisses : chaque variante est une requête qui retarde le texte.',
          'Préchargez uniquement la variante héroïque (titres above-the-fold) et déclarez les @font-face dans le CSS critique inline pour une découverte immédiate.',
        ],
        bullets: [
          'WOFF2, auto-hébergé, 2 familles / 2–3 graisses maximum.',
          'Preload d’une seule variante (la hero), @font-face dans le CSS critique.',
          'preconnect vers le fournisseur si vous restez en tiers (avec crossorigin).',
        ],
        code: {
          lang: 'css',
          title: '@font-face performant et stable',
          code: "@font-face {\n  font-family: 'Marque';\n  src: url('/fonts/marque-700.woff2') format('woff2');\n  font-weight: 700;\n  font-display: swap;               /* texte immédiat, swap dès arrivée */\n  unicode-range: U+0000-00FF;      /* subset latin : -60 % de poids */\n  size-adjust: 92%;                 /* aligne les métriques : CLS ~ 0 */\n  ascent-override: 90%;\n  descent-override: 22%;\n}",
        },
      },
      {
        heading: 'Subset et variables : diviser le poids par 2 ou 3',
        paragraphs: [
          'Un fichier de police contient des milliers de glyphes dont vous n’utilisez qu’une fraction : le subset latin (unicode-range) télécharge uniquement les caractères nécessaires, et le navigateur ignore le reste. Les sous-ensembles par langue (latin, latin-ext) se déclarent en plusieurs @font-face.',
          'Les polices variables remplacent 6 fichiers (3 graisses × 2 styles) par un seul : indispensable dès que vous utilisez plusieurs graisses.',
        ],
        bullets: [
          'unicode-range par langue, outils : glyphhanger, subfont, Google Fonts API (paramètre text).',
          'Variable fonts dès 2+ graisses utilisées.',
          'Vérifiez la licence : subset et self-hosting autorisés dans la quasi-totalité des cas open-source.',
        ],
        tip: 'Subset latin seul : -50 à -70 % sur un WOFF2. C’est le gain le plus rapide du chantier polices.',
      },
      {
        heading: 'Stabiliser : display, size-adjust et fallback aligné',
        paragraphs: [
          'display: swap affiche le texte immédiatement (bon FCP/LCP) mais peut décaler les lignes à l’arrivée (mauvais CLS). La parade : size-adjust + ascent/descent-override pour caler le fallback sur les métriques de la webfont — le swap devient invisible.',
          'Choisissez un fallback de même chasse (Arial ↔ Helvetica-like, Georgia pour les serif) et testez le CLS avec et sans cache : l’écart doit tomber sous 0,02.',
        ],
        bullets: [
          'swap + size-adjust/ascent/descent calibrés (outil : fontpie ou calcul DevTools).',
          'Fallback de même famille visuelle, jamais de serif ↔ sans-serif.',
          'Alternative radicale : display: optional pour le corps de texte (vitesse max, police parfois non appliquée).',
        ],
      },
    ],
    checklist: [
      'WOFF2 auto-hébergé, ≤ 2 familles, 1 variante préchargée',
      'Subsets par langue + variable si plusieurs graisses',
      'swap + size-adjust calibré, CLS polices < 0,02',
      'Icônes en SVG inline, zéro font d’icônes complète',
    ],
    faq: [
      {
        q: 'Google Fonts en direct ou auto-hébergé ?',
        a: 'Auto-hébergé (ou next/font) quand vous avez un CDN : mêmes optimisations (subset, WOFF2) sans la connexion tierce ni les soucis vie privée. Sinon Google Fonts + preconnect reste très correct.',
      },
      {
        q: 'Faut-il préloader les polices ?',
        a: 'Une seule (la hero), avec crossorigin. Préloader 6 variantes vole la bande passante du LCP : c’est l’erreur la plus fréquente du chantier polices.',
      },
    ],
    sources: [
      { label: 'Google — Bonnes pratiques pour les polices', url: 'https://web.dev/articles/font-best-practices' },
      { label: 'Google — Cumulative Layout Shift', url: 'https://web.dev/articles/cls' },
      { label: 'Next.js — Optimisation des polices', url: 'https://nextjs.org/docs/app/getting-started/fonts' },
    ],
  },
]
