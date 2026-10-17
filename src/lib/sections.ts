// Registre central des sections de la page d'accueil.
// Chaque entrée = 1 ancre existante -> 1 composant réutilisable -> 1 page dédiée.
// La home assemble tout (scroll + ancres), les pages /[section] donnent le détail par groupe.

export interface SectionMeta {
  /** slug d'URL : /fonctionnalites, /outil, ... */
  slug: string
  /** id d'ancre sur la home : #fonctionnalites, #outil, ... */
  anchor: string
  /** label court pour nav / footer */
  label: string
  /** titre long pour la page dédiée (SEO) */
  title: string
  /** description pour meta + intro de page dédiée */
  description: string
  /** groupe pour le bloc statique interne */
  group: 'Produit' | 'Ressources' | 'Communauté'
  keywords: string[]
}

export const SECTIONS: SectionMeta[] = [
  {
    slug: 'fonctionnalites',
    anchor: 'fonctionnalites',
    label: 'Fonctionnalités',
    title: 'Fonctionnalités — le kit de surveillance de vitesse',
    description:
      'Monitoring continu, audits Lighthouse, Core Web Vitals, tests multi-régions et multi-appareils.',
    group: 'Produit',
    keywords: ['fonctionnalités', 'monitoring', 'lighthouse', 'core web vitals'],
  },
  {
    slug: 'outil',
    anchor: 'outil',
    label: 'Outil',
    title: 'Outil — tester la vitesse d’un site gratuitement',
    description:
      'Analysez n’importe quelle URL : score de performance, Core Web Vitals et recommandations.',
    group: 'Produit',
    keywords: ['test vitesse', 'audit', 'analyser url', 'performance'],
  },
  {
    slug: 'dashboard',
    anchor: 'dashboard',
    label: 'Dashboard',
    title: 'Dashboard — surveillance en temps réel',
    description:
      'Suivez l’évolution de vos scores, détectez les régressions avant vos utilisateurs.',
    group: 'Produit',
    keywords: ['dashboard', 'monitoring temps réel', 'régressions'],
  },
  {
    slug: 'budget',
    anchor: 'budget',
    label: 'Budget perf',
    title: 'Budget performance — définissez vos objectifs',
    description:
      'Calculez vos budgets LCP, CLS, TBT et recevez des alertes en cas de dépassement.',
    group: 'Produit',
    keywords: ['budget performance', 'objectifs', 'seuils'],
  },
  {
    slug: 'benchmark',
    anchor: 'benchmark',
    label: 'Benchmark',
    title: 'Benchmark — comparez-vous à votre secteur',
    description: 'Positionnez votre score face aux médianes de votre industrie.',
    group: 'Ressources',
    keywords: ['benchmark', 'comparaison', 'secteur'],
  },
  {
    slug: 'integrations',
    anchor: 'integrations',
    label: 'Intégrations',
    title: 'Intégrations — Slack, GitHub, Vercel',
    description:
      'Connectez Vélocita à votre workflow : webhooks, CI/CD, alertes Slack.',
    group: 'Produit',
    keywords: ['intégrations', 'slack', 'github', 'webhooks', 'vercel'],
  },
  {
    slug: 'tarifs',
    anchor: 'tarifs',
    label: 'Tarifs',
    title: 'Tarifs — des plans pour chaque équipe',
    description:
      'Du gratuit au plan équipe : monitoring continu, alertes et historique complet.',
    group: 'Produit',
    keywords: ['tarifs', 'plans', 'pricing', 'abonnement'],
  },
  {
    slug: 'classement',
    anchor: 'classement',
    label: 'Classement',
    title: 'Classement — les sites les plus rapides',
    description:
      'Leaderboard communautaire des sites audités : qui tient la première place ?',
    group: 'Communauté',
    keywords: ['classement', 'leaderboard', 'top sites'],
  },
  {
    slug: 'avis',
    anchor: 'testimonials',
    label: 'Avis',
    title: 'Avis clients — ils accélèrent avec Vélocita',
    description: 'Témoignages d’équipes qui ont réduit leur temps de chargement.',
    group: 'Communauté',
    keywords: ['avis', 'témoignages', 'clients'],
  },
  {
    slug: 'defis',
    anchor: 'achievements',
    label: 'Défis',
    title: 'Défis & badges — gamifiez la performance',
    description: 'Débloquez des badges en améliorant vos scores durablement.',
    group: 'Communauté',
    keywords: ['badges', 'gamification', 'défis', 'achievements'],
  },
  {
    slug: 'astuces',
    anchor: 'astuces',
    label: 'Astuces',
    title: 'Astuces — conseils d’optimisation',
    description: 'Bonnes pratiques concrètes pour LCP, CLS, images et cache.',
    group: 'Ressources',
    keywords: ['astuces', 'conseils', 'optimisation'],
  },
  {
    slug: 'jeu',
    anchor: 'jeu',
    label: 'Jeu',
    title: 'Jeu vitesse — testez vos réflexes',
    description: 'Mini-jeu pédagogique pour comprendre l’impact de la latence.',
    group: 'Communauté',
    keywords: ['jeu', 'pédagogie', 'latence'],
  },
  {
    slug: 'glossaire',
    anchor: 'glossaire',
    label: 'Glossaire',
    title: 'Glossaire — LCP, CLS, TBT expliqués',
    description:
      'Les notions importantes de la performance web expliquées simplement.',
    group: 'Ressources',
    keywords: ['glossaire', 'lcp', 'cls', 'tbt', 'définitions'],
  },
  {
    slug: 'demarrer',
    anchor: 'demarrer',
    label: 'Démarrer',
    title: 'Démarrer — guide en 3 étapes',
    description: 'De votre première URL à la surveillance continue en 2 minutes.',
    group: 'Ressources',
    keywords: ['démarrer', 'onboarding', 'guide', 'tutoriel'],
  },
  {
    slug: 'avantages',
    anchor: 'avantages',
    label: 'Avantages',
    title: 'Avantages — pourquoi la vitesse compte',
    description: 'Conversions, SEO, expérience utilisateur : les gains mesurés.',
    group: 'Produit',
    keywords: ['avantages', 'bénéfices', 'conversion', 'seo'],
  },
  {
    slug: 'faq',
    anchor: 'faq',
    label: 'FAQ',
    title: 'FAQ — questions fréquentes',
    description: 'Tout ce qu’il faut savoir sur Vélocita, les audits et les plans.',
    group: 'Ressources',
    keywords: ['faq', 'questions', 'aide'],
  },
  {
    slug: 'newsletter',
    anchor: 'newsletter',
    label: 'Newsletter',
    title: 'Newsletter — performance web chaque mois',
    description: 'Conseils, benchmarks et nouveautés produit dans votre boîte mail.',
    group: 'Communauté',
    keywords: ['newsletter', 'email', 'actualités'],
  },
  {
    slug: 'journal',
    anchor: 'changelog',
    label: 'Journal',
    title: 'Journal des évolutions — changelog',
    description: 'Nouvelles fonctionnalités, correctifs et améliorations du produit.',
    group: 'Ressources',
    keywords: ['changelog', 'journal', 'nouveautés', 'versions'],
  },
]

export const SECTION_BY_SLUG = new Map(SECTIONS.map((s) => [s.slug, s]))
export const SECTION_SLUGS = SECTIONS.map((s) => s.slug)

/** Liens navbar principale (ancres -> pages dédiées) */
export const NAV_SECTIONS = [
  'fonctionnalites',
  'outil',
  'dashboard',
  'tarifs',
  'classement',
  'avis',
  'faq',
] as const
