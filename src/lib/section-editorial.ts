// Contenu éditorial différenciant par page dédiée.
// Évite le contenu dupliqué : chaque page /[slug] a son intro,
// ses points clés et sa mini-FAQ, en plus du composant réutilisé.

export interface SectionEditorial {
  intro: string[]
  bullets: string[]
  faq: Array<{ q: string; a: string }>
}

export const EDITORIAL: Record<string, SectionEditorial> = {
  fonctionnalites: {
    intro: [
      'La page Fonctionnalités détaille le kit de surveillance Vélocita : monitoring continu des Core Web Vitals, audits Lighthouse à la demande et en lot, tests multi-régions et multi-appareils.',
      'Contrairement au survol rapide de la home assemblée, vous trouverez ici comment chaque brique s’articule : mesure, alerte via webhooks, puis suivi dans le dashboard.',
    ],
    bullets: [
      'Surveillance continue 24h/24 avec historique complet',
      'Audits Lighthouse + données utilisateurs réelles (RUM)',
      'Webhooks au déploiement pour tester chaque mise en ligne',
    ],
    faq: [
      { q: 'Faut-il ajouter du code sur mon site ?', a: 'Non. Les audits se font depuis nos points de mesure, sans snippet à installer.' },
      { q: 'Quelle différence avec un audit ponctuel ?', a: 'Le monitoring continu détecte les régressions entre deux déploiements, pas seulement le jour de l’audit.' },
    ],
  },
  outil: {
    intro: [
      'L’outil gratuit analyse n’importe quelle URL publique : score de performance, LCP, CLS, TBT, poids des ressources et recommandations priorisées.',
      'Chaque résultat indique son origine (PageSpeed Insights, Lighthouse local ou simulation) pour une lecture transparente.',
    ],
    bullets: [
      'Score + Core Web Vitals + waterfall des ressources',
      'Comparaison à votre secteur et export JSON du rapport',
      'Historique conservé pour suivre vos progrès',
    ],
    faq: [
      { q: 'L’outil est-il vraiment gratuit ?', a: 'Oui, sans carte bancaire. Les plans payants ajoutent le monitoring continu et les alertes.' },
      { q: 'Mes URL testées sont-elles publiques ?', a: 'Seul le classement affiche les sites explicitement partagés ; vos tests restent privés par défaut.' },
    ],
  },
  dashboard: {
    intro: [
      'Le dashboard suit l’évolution de vos scores dans le temps : score actuel, moyenne 30 jours, LCP/CLS, TTFB et distribution des scores.',
      'L’objectif : repérer une régression avant vos utilisateurs, puis comparer l’avant/après de chaque optimisation.',
    ],
    bullets: [
      'KPIs temps réel + graphiques d’évolution',
      'Bandeau d’uptime et histogramme de distribution',
      'Comparaison avant/après par période',
    ],
    faq: [
      { q: 'À quelle fréquence les mesures sont-elles prises ?', a: 'À la demande et en continu selon votre plan ; chaque point est horodaté.' },
      { q: 'Puis-je suivre plusieurs sites ?', a: 'Oui, avec un sélecteur de site et un historique par site.' },
    ],
  },
  budget: {
    intro: [
      'Le calculateur de budget traduit vos objectifs business en seuils techniques : LCP, CLS, TBT et poids maximal par type de ressource.',
      'Dépassez un seuil et vous êtes alerté avant que l’expérience ne se dégrade.',
    ],
    bullets: [
      'Sliders interactifs avec score temps réel',
      'Seuils alignés sur les recommandations Google',
      'Base idéale pour des alertes automatiques',
    ],
    faq: [
      { q: 'Quelles valeurs cibles choisir ?', a: 'LCP < 2,5 s, CLS < 0,1 et TBT < 200 ms : les seuils « bon » de Google.' },
      { q: 'Le budget bloque-t-il les déploiements ?', a: 'Non, il alerte. Le blocage CI se configure via webhooks si vous le souhaitez.' },
    ],
  },
  benchmark: {
    intro: [
      'Le benchmark positionne votre score face aux médianes réelles de votre secteur, calculées depuis les mesures Vélocita.',
      'Utile pour prioriser : un score de 80 n’a pas le même sens dans l’e-commerce que dans un blog léger.',
    ],
    bullets: [
      'Médianes sectorielles issues de mesures réelles',
      'Insight comparatif généré depuis vos données',
      'Contexte pour fixer un objectif crédible',
    ],
    faq: [
      { q: 'D’où viennent les moyennes ?', a: 'De l’agrégation anonymisée des audits réalisés via /api/benchmark.' },
      { q: 'Mon secteur n’apparaît pas ?', a: 'Testez d’abord votre URL avec l’outil, votre catégorie sera détectée automatiquement.' },
    ],
  },
  integrations: {
    intro: [
      'Les intégrations connectent Vélocita à votre workflow : Slack pour les alertes, GitHub/Vercel via webhooks au déploiement, et API pour le CI/CD.',
      'Le panneau de flux montre l’enchaînement : déploiement → test automatique → alerte → dashboard.',
    ],
    bullets: [
      'Webhooks au déploiement avec exemple de payload',
      'Alertes Slack/Discord et API CI documentée',
      'Compatible Vercel, GitHub Actions et pipelines custom',
    ],
    faq: [
      { q: 'Les webhooks sont-ils temps réel ?', a: 'Oui, un test est déclenché à chaque événement de déploiement configuré.' },
      { q: 'Puis-je intégrer mon CI custom ?', a: 'Oui via l’API /api/measure et /api/monitoring, avec votre tenantId.' },
    ],
  },
  tarifs: {
    intro: [
      'Les tarifs vont du gratuit (audits ponctuels) aux plans équipe (monitoring continu, multi-sites, historique long et alertes).',
      'Le toggle annuel/mensuel affiche le coût réel sans surprise, sans carte bancaire pour commencer.',
    ],
    bullets: [
      'Gratuit pour tester, payant pour surveiller en continu',
      'Limites claires : sites suivis, fréquence, historique',
      'Annulable à tout moment',
    ],
    faq: [
      { q: 'Que se passe-t-il si je dépasse mes limites ?', a: 'Vous êtes notifié et pouvez changer de plan ; aucune coupure brutale.' },
      { q: 'Y a-t-il un essai des plans payants ?', a: 'Oui, commencez gratuitement puis activez le monitoring quand vous êtes prêt.' },
    ],
  },
  classement: {
    intro: [
      'Le classement affiche les sites audités les plus rapides, avec filtres par catégorie, sparklines d’évolution et transparence sur l’origine de chaque mesure.',
      'C’est la vitrine communautaire : comparez-vous et repérez les bonnes pratiques des premiers.',
    ],
    bullets: [
      'Scores réels, origine de mesure affichée',
      'Filtres par catégorie et tendance récente',
      'État vide explicite si pas encore de données',
    ],
    faq: [
      { q: 'Comment apparaître dans le classement ?', a: 'Auditez votre URL avec l’outil ; les sites partagés rejoignent le leaderboard.' },
      { q: 'Les scores sont-ils vérifiés ?', a: 'Chaque ligne précise si la mesure vient de PageSpeed, Lighthouse local ou d’une simulation.' },
    ],
  },
  avis: {
    intro: [
      'Les avis rassemblent les témoignages d’équipes qui ont réduit leur temps de chargement avec Vélocita : gains SEO, conversion et satisfaction utilisateur.',
      'Chaque citation est accompagnée de métriques avant/après quand elles sont disponibles.',
    ],
    bullets: [
      'Témoignages vérifiés avec contexte secteur',
      'Métriques de gain (LCP, conversion)',
      'Logos et cas d’usage concrets',
    ],
    faq: [
      { q: 'Ces avis sont-ils authentiques ?', a: 'Oui, issus d’utilisateurs du monitoring continu et de l’outil d’audit.' },
      { q: 'Puis-je témoigner ?', a: 'Oui via la newsletter ou le support, nous publions les cas chiffrés en priorité.' },
    ],
  },
  defis: {
    intro: [
      'Les défis gamifient la performance : badges débloqués en améliorant durablement vos scores (première optimisation, 90+, régularité 30 jours…).',
      'La barre de progression et les badges créent une dynamique d’équipe autour de la vitesse.',
    ],
    bullets: [
      '6 badges liés à des progrès réels mesurés',
      'Barre de progression et séries (streaks)',
      'Idéal pour animer un chantier perf en équipe',
    ],
    faq: [
      { q: 'Les badges sont-ils automatiques ?', a: 'Oui, ils se débloquent quand vos mesures franchissent les seuils.' },
      { q: 'Puis-je perdre un badge ?', a: 'Non, les badges restent acquis ; la progression reflète l’état courant.' },
    ],
  },
  astuces: {
    intro: [
      'Les astuces sont des conseils actionnables : optimiser le LCP (images, hero), réduire le CLS (dimensions, polices), alléger le JS et exploiter le cache.',
      'Le carrousel auto-rotatif de la home est ici consultable à votre rythme, avec le détail de chaque recommandation.',
    ],
    bullets: [
      '6 astuces priorisées par impact mesuré',
      'Lien direct avec vos audits (quoi corriger d’abord)',
      'Bonnes pratiques cache, images et polices',
    ],
    faq: [
      { q: 'Par où commencer ?', a: 'Par le LCP : c’est le facteur le plus visible pour l’utilisateur et Google.' },
      { q: 'Les astuces suffisent-elles ?', a: 'Elles couvrent 80 % des cas ; le dashboard valide ensuite chaque gain.' },
    ],
  },
  jeu: {
    intro: [
      'Le jeu « Lequel est le plus rapide ? » propose des duels entre sites réellement mesurés : devinez le meilleur score Lighthouse.',
      'Pédagogique, il montre que l’intuition trompe souvent face aux métriques réelles.',
    ],
    bullets: [
      'Duels générés depuis le leaderboard réel',
      'Score, séries et record pour rejouer',
      'Zéro score codé en dur',
    ],
    faq: [
      { q: 'Pourquoi le jeu ne se charge pas parfois ?', a: 'Il faut au moins deux sites mesurés avec des scores distincts pour créer un duel.' },
      { q: 'Le jeu mesure-t-il mon site ?', a: 'Non, il utilise les mesures existantes ; pour auditer, utilisez l’outil.' },
    ],
  },
  glossaire: {
    intro: [
      'Le glossaire explique simplement les notions importantes : LCP, CLS, TBT, TTFB, FCP et Speed Index, avec les seuils Google « bon / à améliorer / médiocre ».',
      'C’est la référence interne à garder sous la main pour lire chaque audit sans jargon.',
    ],
    bullets: [
      '6 termes avec définitions et seuils officiels',
      'Exemples concrets d’optimisation par métrique',
      'Base pour comprendre dashboard et audits',
    ],
    faq: [
      { q: 'Quelle métrique surveiller en premier ?', a: 'Le LCP (vitesse perçue), puis le CLS (stabilité) et le TBT (fluidité).' },
      { q: 'Les seuils évoluent-ils ?', a: 'Google les ajuste rarement ; le glossaire suit les recommandations officielles.' },
    ],
  },
  demarrer: {
    intro: [
      'Le guide Démarrer vous met en route en 3 étapes : testez votre première URL, fixez un budget, activez la surveillance continue.',
      'Comptez 2 minutes pour le premier audit, sans code à ajouter.',
    ],
    bullets: [
      'Parcours en 3 étapes avec jalons visuels',
      'Lien direct vers l’outil et le budget',
      'Zéro installation, zéro carte bancaire',
    ],
    faq: [
      { q: 'Faut-il créer un compte ?', a: 'Non pour le premier audit ; un compte sert ensuite à l’historique et aux alertes.' },
      { q: 'Et après le premier test ?', a: 'Fixez un budget puis surveillez le dashboard pour valider vos optimisations.' },
    ],
  },
  avantages: {
    intro: [
      'La vitesse n’est pas un luxe : un site rapide ranke mieux, convertit plus et fidélise. Google intègre les Core Web Vitals au classement.',
      'Cette page détaille les trois gains mesurés : SEO, expérience utilisateur et revenus.',
    ],
    bullets: [
      'SEO : les CWV comptent dans le classement Google',
      'UX : rapidité = confiance et satisfaction',
      'Revenus : chaque seconde gagnée augmente la conversion',
    ],
    faq: [
      { q: 'Quel gain attendre ?', a: 'Les études citées montrent jusqu’à -53 % d’abandon en passant sous 3 s de chargement.' },
      { q: 'Comment prouver le ROI ?', a: 'Comparez avant/après dans le dashboard : LCP, conversion et positionnement.' },
    ],
  },
  faq: {
    intro: [
      'La FAQ répond aux questions fréquentes : fonctionnement des audits, origine des mesures, plans, confidentialité et intégrations.',
      'Si votre question manque, la newsletter et le support prennent le relais.',
    ],
    bullets: [
      '8 questions en accordéon, recherche via Ctrl+K',
      'Réponses courtes avec liens vers les pages détail',
      'Mise à jour à chaque évolution produit',
    ],
    faq: [
      { q: 'Les mesures sont-elles réelles ?', a: 'Oui via PageSpeed Insights ou Lighthouse local ; chaque score indique sa source.' },
      { q: 'Puis-je exporter mes résultats ?', a: 'Oui en JSON depuis l’outil ; CSV/PDF prévus (voir journal).' },
    ],
  },
  newsletter: {
    intro: [
      'La newsletter mensuelle partage benchmarks, astuces et nouveautés produit, sans spam.',
      'Validation d’email instantanée, désinscription en un clic.',
    ],
    bullets: [
      'Un email par mois, contenu actionnable',
      'Benchmarks et cas clients chiffrés',
      'Zéro revente de données, hébergement Europe',
    ],
    faq: [
      { q: 'À quelle fréquence ?', a: 'Mensuelle, plus un email lors des évolutions majeures.' },
      { q: 'Comment me désinscrire ?', a: 'Via le lien en pied d’email, effet immédiat.' },
    ],
  },
  journal: {
    intro: [
      'Le journal liste les évolutions : nouvelles fonctionnalités, correctifs et améliorations du monitoring et des audits.',
      'La timeline de la home est ici complétée par le contexte de chaque version.',
    ],
    bullets: [
      'Timeline horodatée des versions',
      'Lien entre nouveauté et section concernée',
      'Transparence sur les correctifs',
    ],
    faq: [
      { q: 'Où suivre les nouveautés en direct ?', a: 'Ici et via la newsletter pour les versions majeures.' },
      { q: 'Puis-je proposer une fonctionnalité ?', a: 'Oui via le lien Feedback en pied de page.' },
    ],
  },
}
