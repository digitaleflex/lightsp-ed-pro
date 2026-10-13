# État du projet — Lightspeed Clone (v1 Multi-tenant)

## ✅ FONCTIONNALITÉS PRÉSENTES (développées + vérifiées)

### Landing & UI (21 sections)
- Hero (animé, badge live, score ring, formes flottantes)
- Onboarding (3 étapes)
- StatsBanner (compteur animé)
- Features (8 cartes, numéros décoratifs, hover)
- SpeedTest (outil interactif : input URL, mesure Lighthouse réelle — PSI ou Chrome local — résultats complets, badge origine de la mesure)
  - Score ring couleur (vert/ambre/rouge corrigé)
  - Donut ressources (JS/Images/CSS/Polices/Autres)
  - Latence par région (4 barres animées)
  - Cascade Waterfall (12 ressources, timeline)
  - Radar Core Web Vitals (6 axes)
  - Comparaison industrie (vs moyenne du web)
  - Légende Bon/Moyen/Faible
- Dashboard (KPIs, 3 graphiques Recharts + histogramme + sparklines)
- BudgetCalculator (sliders interactifs, score temps réel)
- Benefits (3 cartes + bandeau)
- Integrations (6 cartes + panneau flux)
- Achievements (6 badges gamification, barre 67%)
- Glossary (6 termes CWV avec seuils Google)
- Benchmark (moyennes sectorielles CALCULÉES depuis les mesures réelles via `/api/benchmark`, insight comparatif déduit des données)
- TipsCarousel (6 astuces, auto-rotation)
- SpeedGame (mini-jeu comparaison vitesse)
- Pricing (3 plans, toggle annuel)
- Leaderboard (tableau, filtres catégorie, sparklines, tendance réelle (2 dernières mesures), transparence sur l'origine des mesures, état vide)
- Testimonials (3 citations, logos, métriques)
- Newsletter (validation email, états loading/done)
- FAQ (8 questions accordéon Radix)
- Changelog (5 entrées timeline)
- CTA (speed-gradient)
- Footer (sticky, 4 colonnes, status widget, mentions)

### Interactivité & UX
- Command Palette (Ctrl+K, 14 items, recherche instantanée)
- Tour guidé (5 étapes, spotlight corrigé, tooltip dynamique)
- Comparaison 2 sites (modale overlay, badges GAGNANT)
- Partage social (Twitter, LinkedIn, Email, Copier)
- Export JSON résultats (téléchargement auto)
- Cookie consent RGPD (différé 1.8s, localStorage)
- Retour en haut (animation scroll)
- Skip link accessibilité
- Barre de progression lecture (speed-gradient)
- Mode clair/sombre fonctionnel (toggle corrigé)

### Backend / API
- Prisma (postgresql) avec schéma multi-tenant (User, Tenant, Website, SpeedTest)
- `/api/seed` (crée les sites + lance les mesures réelles en arrière-plan, reprise auto)
- `/api/analyze` (analyse URL réelle, enregistre test avec `tenantId`)
- `/api/measure` (mesure réelle à la demande d'un site suivi)
- `/api/leaderboard` (classement par score + origine des mesures)
- `/api/benchmark` (moyennes sectorielles calculées sur données mesurées)
- `/api/monitoring` (historique site/série — uniquement mesures réelles)
- `/api/recent` (6 derniers tests)

### Infrastructure
- Docker Compose (Supabase self-hosted : Postgres + Studio)
- `.env.local` avec DATABASE_URL
- `.gitignore` créé
- `package.json` automatisé (`launch`, `dev:full`, `db:start`, etc.)
- PWA manifest (`public/site.webmanifest`)

---

## ❌ FONCTIONNALITÉS MANQUANTES (promises / futures / non développées)

### Authentification & SaaS
- Connexion / inscription (NextAuth ou Better Auth) — **absente**
- Isolation réelle par session/auth (le `tenantId` est passé en header/body, pas par session sécurisée)
- Dashboard personnel (chaque utilisateur voit seulement ses données)

### Paiement & Limites
- Intégration Stripe / facturation réelle — **absente** (page pricing statique)
- Limites par plan (tests/mois, sites max) — **absent**
- Gestion des abonnements / annulations

### Mesures réelles
- ~~Lighthouse simulé~~ → **mesures réelles** : `src/lib/measure.ts` (PageSpeed Insights, repli Lighthouse local Chrome, repli simulé explicitement marqué)
- Points de mesure multi-régions — **absents** (mesure depuis le serveur, l'étiquette région est indicative)
- Webhooks réels (Vercel/GitHub) — **exemple payload uniquement**
- Notifications email / alertes (resend/nodemailer) — **absente**
- Alertes Slack/Discord

### Rapports & Exports
- Export PDF — **absent**
- Export CSV/Excel historique — **absent**

### Comparaison avancée
- Multi-comparaison (jusqu'à 4 sites en parallèle) — **absent** (seulement 2 dans modale)
- Comparaison évolution avant/après par site dans le temps — **partielle** (before/after statique dans dashboard)

### Autres
- Service worker PWA / mode hors-ligne — **absent** (manifest présent, pas de cache)
- Page documentation interactive intégrée
- Tests A/B de variantes
- API publique CI/CD documentée
- Mode démo guidée interactive (pas à pas)
- Heatmap CWV par région
- Timeline des incidents avec annotations
- Partage social natif (Twitter, LinkedIn) — présent dans résultats mais pas intégré au niveau réseau
- Mode chrono dans le jeu
- Badges bonus jeu

---

## 🟡 ÉTAT ACTUEL
- Clone fonctionnel et visuellement complet (21 sections, 0 erreur lint, serveur 200)
- Multi-tenant technique ajouté (DB + API) mais sans couche auth
- Docker + Supabase auto-hosté opérationnel (DB healthy)
- Automatisation package.json complète
- Pas de facturation réelle ni de points de mesure multi-régions (nécessaire pour un vrai SaaS rentable)
- Mesures Lighthouse réelles opérationnelles (PageSpeed Insights / Chrome local) — chaque score affiché indique son origine (réel vs simulé)
