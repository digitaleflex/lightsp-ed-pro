#requires -Version 5.1
<#
    create-issues.ps1 — Crée les 34 issues + 8 milestones + labels du plan IA Velocita
    Repo cible : digitaleflex/lightsp-ed-pro

    Le script est IDEMPOTENT : relançable sans dupliquer (skip les issues déjà présentes
    par titre, `--force` sur les labels, milestones existants ignorés).

    Ce fichier peut être "dot-sourcé" par dry-run-issues.ps1 : dans ce cas la logique
    d'exécution n'est PAS lancée (garde $MyInvocation.InvocationName -ne '.').

    Usage (à lancer par l'utilisateur, APRÈS validation) :
        pwsh -File .\scripts\create-issues.ps1
        # ou (PowerShell 5.1)
        powershell -ExecutionPolicy Bypass -File .\scripts\create-issues.ps1
#>
[CmdletBinding()]
param(
    # N'appelle aucun gh : se contente de lister ce qui serait créé.
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$Repo = 'digitaleflex/lightsp-ed-pro'

# =====================================================================
#  MILESTONES (M0 → M7)
# =====================================================================
$Milestones = @(
    [pscustomobject]@{ Code = 'M0'; Title = 'M0 — Fondations';             Description = "Socle technique : config SDK Z.ai, providers IA unifiés, feature flags, rate-limit, observabilité." }
    [pscustomobject]@{ Code = 'M1'; Title = 'M1 — UX du résumé IA';        Description = "Améliorer l'expérience du résumé IA : streaming, ton de marque, multilingue, partage." }
    [pscustomobject]@{ Code = 'M2'; Title = 'M2 — Audio';                  Description = "TTS et ASR gratuits : podcast, transcription, diagnostic vocal, audioblog." }
    [pscustomobject]@{ Code = 'M3'; Title = 'M3 — Vision & audit URL';     Description = "Audits par image, capture d'écran, URL et vidéo via vision multimodale." }
    [pscustomobject]@{ Code = 'M4'; Title = 'M4 — RAG blog';               Description = "Recherche sémantique dans les articles du blog et assistant contextuel." }
    [pscustomobject]@{ Code = 'M5'; Title = 'M5 — Assets & contenu';       Description = "Génération d'images et d'assets éditoriaux gratuits." }
    [pscustomobject]@{ Code = 'M6'; Title = 'M6 — Alertes intelligentes';  Description = "Détection d'anomalies et rapports narratifs automatisés." }
    [pscustomobject]@{ Code = 'M7'; Title = 'M7 — Polish';                 Description = "Finitions : dashboard admin, tests E2E, documentation interne." }
)

# =====================================================================
#  LABELS
# =====================================================================
$Labels = @(
    [pscustomobject]@{ Name = 'effort:XS (1h)';   Color = 'BFD4F2'; Description = 'Très petit — environ 1 heure' }
    [pscustomobject]@{ Name = 'effort:S (0.5j)';  Color = 'C2E0C6'; Description = 'Petit — environ une demi-journée' }
    [pscustomobject]@{ Name = 'effort:M (1j)';    Color = 'FEF2C0'; Description = 'Moyen — environ une journée' }
    [pscustomobject]@{ Name = 'effort:L (2-3j)';  Color = 'FBCA04'; Description = 'Grand — 2 à 3 jours' }
    [pscustomobject]@{ Name = 'effort:XL (1 sem)'; Color = 'D93F0B'; Description = 'Très grand — environ une semaine' }
    [pscustomobject]@{ Name = 'area:ai';          Color = '5319E7'; Description = 'Intelligence artificielle (LLM, prompts)' }
    [pscustomobject]@{ Name = 'area:audio';       Color = '1D76DB'; Description = 'Audio — TTS, ASR, podcast' }
    [pscustomobject]@{ Name = 'area:vision';      Color = '006B75'; Description = 'Vision multimodale — images, vidéo' }
    [pscustomobject]@{ Name = 'area:rag';         Color = '0E8A16'; Description = 'RAG — recherche sémantique blog' }
    [pscustomobject]@{ Name = 'area:assets';      Color = '7057FF'; Description = "Génération d'assets et contenu" }
    [pscustomobject]@{ Name = 'area:monitoring';  Color = 'F9D0C4'; Description = 'Monitoring, alertes, anomalies' }
    [pscustomobject]@{ Name = 'area:foundation';  Color = 'BFDADC'; Description = 'Socle technique / refactoring' }
    [pscustomobject]@{ Name = 'cost:free';        Color = '3FB950'; Description = 'Repose uniquement sur des offres gratuites' }
    [pscustomobject]@{ Name = 'priority:high';    Color = 'B60205'; Description = 'Priorité haute' }
)

# =====================================================================
#  ISSUES (34)
#  Chaque entrée : Id (référence interne Mx-y), Milestone (code), Title,
#  Labels, Effort, Body (Markdown).
#  Les corps utilisent des here-strings SINGLE-quoted (@' ... '@) :
#  aucun $ ni # n'y est interprété.
# =====================================================================
$Issues = @(

    [pscustomobject]@{
        Id = 'M0-1'; Milestone = 'M0'; Effort = 'XS'
        Title = 'M0-1: Créer le fichier de configuration du SDK Z.ai'
        Labels = @('area:foundation', 'effort:XS (1h)', 'cost:free', 'priority:high')
        Body = @'
## 🎯 Objectif
Centraliser la configuration du SDK `z-ai-web-dev-sdk` dans un module serveur typé.

## 💡 Pourquoi
Le SDK est installé (`package.json`) mais jamais importé. Une configuration unique évite de disperser les clés et facilite le changement de provider. Sans ce socle, chaque feature IA réimplémente son propre client HTTP.

## ✅ Critères d'acceptation
- [ ] `src/lib/zai.ts` exporte un client singleton initialisé depuis `.env`
- [ ] Variables `ZAI_API_KEY` / `ZAI_BASE_URL` documentées dans `.env.example`
- [ ] Le module est importable côté serveur uniquement (aucune fuite de clé au client)
- [ ] `npm run build` passe sans avertissement d'import côté client

## 📁 Fichiers
- créer `src/lib/zai.ts`
- modifier `.env.example`

## 🪜 Étapes pas à pas
1. Inspecter l'API exposée dans `node_modules/z-ai-web-dev-sdk`
2. Créer `src/lib/zai.ts` avec un singleton et une garde serveur
3. Ajouter les variables manquantes à `.env.example`
4. Vérifier le build

## ⏱️ Estimation
XS (≈ 2 h)

## 🔗 Dépendances
- aucune
'@
    }

    [pscustomobject]@{
        Id = 'M0-2'; Milestone = 'M0'; Effort = 'L'
        Title = 'M0-2: Refactoriser src/lib/ai.ts vers un système de providers unifié'
        Labels = @('area:foundation', 'area:ai', 'effort:L (2-3j)', 'cost:free', 'priority:high')
        Body = @'
## 🎯 Objectif
Transformer `src/lib/ai.ts` en un système de providers unifié, extensible par capacité.

## 💡 Pourquoi
La chaîne Groq → Gemini → OpenRouter actuelle est codée en dur et ne gère que le texte. Un registre de providers (chat, vision, audio, image) permet de brancher Z.ai, Whisper ou Pollinations sans dupliquer la logique de fallback.

## ✅ Critères d'acceptation
- [ ] Interface `AiProvider` (name, capabilities, call)
- [ ] Registre + sélection par capacité (`chat`, `vision`, `audio`, `image`)
- [ ] `generateAiSummary` reste compatible (aucune régression sur `POST /api/ai-summary`)
- [ ] Chaîne de fallback configurable via variables d'environnement

## 📁 Fichiers
- modifier `src/lib/ai.ts`
- créer `src/lib/ai/providers/*.ts`
- modifier `src/app/api/ai-summary/route.ts`

## 🪜 Étapes pas à pas
1. Définir l'interface et les capacités
2. Extraire groq/gemini/openrouter en modules provider
3. Ajouter la résolution par capacité et le fallback
4. Adapter l'appelant existant et tester une génération

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M0-1
'@
    }

    [pscustomobject]@{
        Id = 'M0-3'; Milestone = 'M0'; Effort = 'S'
        Title = 'M0-3: Feature flags par cas d''usage IA'
        Labels = @('area:foundation', 'effort:S (0.5j)', 'cost:free', 'priority:high')
        Body = @'
## 🎯 Objectif
Activer ou désactiver chaque cas d'usage IA via des feature flags d'environnement.

## 💡 Pourquoi
Permet d'exposer les features progressivement et de couper une feature coûteuse (vision, TTS) sans redéploiement de code ni rollback.

## ✅ Critères d'acceptation
- [ ] `src/lib/ai/flags.ts` lit `AI_FLAG_<USE_CASE>` avec valeur par défaut explicite
- [ ] Helper `isAiEnabled('vision')` utilisable dans les routes
- [ ] Cas d'usage documentés dans `.env.example`

## 📁 Fichiers
- créer `src/lib/ai/flags.ts`
- modifier `.env.example`

## 🪜 Étapes pas à pas
1. Lister les cas d'usage (`summary`, `vision`, `audio`, `rag`, `image`)
2. Implémenter le lecteur de flags
3. Exposer `isAiEnabled(case)`
4. Documenter et tester le défaut

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M0-4'; Milestone = 'M0'; Effort = 'M'
        Title = 'M0-4: Rate-limit par utilisateur (sans Redis)'
        Labels = @('area:foundation', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Limiter le nombre d'appels IA par utilisateur, sans dépendance à Redis.

## 💡 Pourquoi
Protéger les quotas gratuits des providers et éviter l'abus. Un compteur en mémoire avec persistance légère en base suffit pour un SaaS mono-instance.

## ✅ Critères d'acceptation
- [ ] Modèle `AiUsage` (userId, window, count) ou compteur mémoire + fallback DB
- [ ] Fenêtre glissante (heure / jour) configurable par env
- [ ] Au dépassement → HTTP 429 avec message clair
- [ ] Intégré au routeur de providers de `src/lib/ai.ts`

## 📁 Fichiers
- créer `src/lib/ai/rate-limit.ts`
- modifier `prisma/schema.prisma` (+ migration)
- modifier `src/lib/ai.ts`

## 🪜 Étapes pas à pas
1. Définir la fenêtre et le seuil par défaut
2. Implémenter le compteur (mémoire + persistance)
3. Brancher le contrôle sur les appels IA
4. Tester le dépassement (429)

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M0-5'; Milestone = 'M0'; Effort = 'L'
        Title = 'M0-5: Observabilité des appels IA (compteurs, latence, erreurs)'
        Labels = @('area:foundation', 'area:monitoring', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Mesurer les appels IA (compteurs, latence, erreurs) et exposer ces métriques.

## 💡 Pourquoi
Sans observabilité, impossible de savoir quel provider ou quel quota pose problème. C'est la base nécessaire au dashboard admin M7-1.

## ✅ Critères d'acceptation
- [ ] Compteurs succès/échec par provider et par cas d'usage
- [ ] Distribution de latence simple (p50 / p95)
- [ ] Log structuré JSON par appel
- [ ] Exposé via une route interne protégée

## 📁 Fichiers
- créer `src/lib/ai/metrics.ts`
- modifier `src/lib/ai.ts`
- créer `src/app/api/admin/ai-metrics/route.ts`

## 🪜 Étapes pas à pas
1. Implémenter le store de métriques en mémoire
2. Instrumenter les appels provider (succès, latence, erreur)
3. Exposer la route interne protégée
4. Émettre des logs JSON structurés

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M1-1'; Milestone = 'M1'; Effort = 'L'
        Title = 'M1-1: Streaming SSE du résumé'
        Labels = @('area:ai', 'effort:L (2-3j)', 'cost:free', 'priority:high')
        Body = @'
## 🎯 Objectif
Streamer le résumé IA en Server-Sent Events au lieu d'attendre la réponse complète.

## 💡 Pourquoi
Le résumé est long ; le streaming réduit le temps perçu et sécurise les timeouts côté proxy. C'est l'amélioration UX la plus visible du dashboard.

## ✅ Critères d'acceptation
- [ ] `POST /api/ai-summary` renvoie un flux `text/event-stream` quand `stream=1`
- [ ] Le client affiche le texte au fil de l'eau
- [ ] Fallback non-stream conservé pour compatibilité
- [ ] Le cache DB (`aiSummary`) est écrit à la fin du flux

## 📁 Fichiers
- modifier `src/app/api/ai-summary/route.ts`
- modifier `src/lib/ai.ts`
- modifier le composant résumé du dashboard

## 🪜 Étapes pas à pas
1. Ajouter une méthode de streaming aux providers
2. Implémenter l'endpoint SSE
3. Consommer le flux côté client
4. Écrire le cache une fois le flux terminé

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M1-2'; Milestone = 'M1'; Effort = 'M'
        Title = 'M1-2: Ton de marque Velocita (prompt engineering)'
        Labels = @('area:ai', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Définir un prompt système au ton de marque Velocita, réutilisable par toutes les features.

## 💡 Pourquoi
La voix de marque doit rester cohérente (directe, experte, sans jargon inutile). Un prompt versionné est testable et centralise le style.

## ✅ Critères d'acceptation
- [ ] `src/lib/ai/prompts/brand.ts` centralise le ton
- [ ] Le résumé et les features suivantes l'utilisent
- [ ] 3 exemples few-shot intégrés

## 📁 Fichiers
- créer `src/lib/ai/prompts/brand.ts`
- modifier `src/lib/ai.ts`

## 🪜 Étapes pas à pas
1. Rédiger la charte de ton
2. Créer le module de prompt
3. Brancher `buildPrompt` dessus
4. Comparer des sorties avant/après

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M1-3'; Milestone = 'M1'; Effort = 'S'
        Title = 'M1-3: Résumé multilingue (EN/ES/DE)'
        Labels = @('area:ai', 'effort:S (0.5j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Générer le résumé en anglais, espagnol ou allemand selon la locale de l'utilisateur.

## 💡 Pourquoi
Ouvrir Velocita à l'international sans maintenir plusieurs prompts : passer la langue en paramètre suffit.

## ✅ Critères d'acceptation
- [ ] Paramètre `locale` transmis au prompt
- [ ] Détection de la locale via `next-intl` côté client
- [ ] La clé de cache DB inclut la locale

## 📁 Fichiers
- modifier `src/lib/ai.ts`
- modifier `src/app/api/ai-summary/route.ts`
- modifier `src/lib/ai/prompts/brand.ts`

## 🪜 Étapes pas à pas
1. Ajouter le paramètre `locale`
2. Ajouter l'instruction de langue au prompt
3. Propager la locale depuis le client
4. Tester EN / ES / DE

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- #M1-2
'@
    }

    [pscustomobject]@{
        Id = 'M1-4'; Milestone = 'M1'; Effort = 'L'
        Title = 'M1-4: Bouton "Partager" avec image générée'
        Labels = @('area:ai', 'area:assets', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Ajouter un bouton « Partager » qui génère une image du résumé IA.

## 💡 Pourquoi
Le partage social est un canal d'acquisition gratuit ; une carte image rend le résumé viral et identifiable à la marque.

## ✅ Critères d'acceptation
- [ ] Route générant une image OG (scores + extrait du résumé)
- [ ] Bouton dans le dashboard pour télécharger / copier
- [ ] Utilise `sharp` (déjà installé) pour la composition

## 📁 Fichiers
- créer `src/app/api/share/og/route.tsx`
- créer un composant de partage
- modifier `src/lib/ai.ts`

## 🪜 Étapes pas à pas
1. Concevoir le template image
2. Implémenter la route de génération
3. Ajouter le bouton UI
4. Vérifier le rendu partagé

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M1-1
- #M5-1
'@
    }

    [pscustomobject]@{
        Id = 'M2-1'; Milestone = 'M2'; Effort = 'S'
        Title = 'M2-1: Installer et intégrer edge-tts (TTS gratuit, sans clé)'
        Labels = @('area:audio', 'effort:S (0.5j)', 'cost:free', 'priority:high')
        Body = @'
## 🎯 Objectif
Intégrer edge-tts (synthèse vocale gratuite, sans clé API) dans le projet.

## 💡 Pourquoi
La synthèse vocale ouvre le podcast, l'audioblog et les rapports parlés sans coût API. edge-tts s'appuie sur les voix Microsoft en ligne, gratuitement.

## ✅ Critères d'acceptation
- [ ] Dépendance ajoutée (`msedge-tts` côté Node et/ou binaire Python `edge-tts`)
- [ ] `src/lib/tts.ts` synthétise un texte vers un buffer audio
- [ ] Voix française par défaut, configurable
- [ ] Documenté dans `.env.example`

## 📁 Fichiers
- créer `src/lib/tts.ts`
- modifier `package.json`
- modifier `.env.example`

## 🪜 Étapes pas à pas
1. Choisir le binding (Node ou Python)
2. Wrapper de synthèse texte → audio
3. Définir la voix par défaut
4. Tester la sortie (mp3)

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- aucune
'@
    }

    [pscustomobject]@{
        Id = 'M2-2'; Milestone = 'M2'; Effort = 'L'
        Title = 'M2-2: Mode "podcast" du résumé IA (TTS en streaming)'
        Labels = @('area:audio', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Ajouter un mode « podcast » qui lit le résumé IA au fil de sa génération (TTS).

## 💡 Pourquoi
Réutiliser le contenu déjà produit en format audio augmente le temps passé et l'accessibilité, sans produire de contenu supplémentaire.

## ✅ Critères d'acceptation
- [ ] Route qui streame l'audio (chunked) pendant la synthèse
- [ ] Lecteur audio intégré au dashboard
- [ ] Le résumé streamé (M1-1) alimente le TTS

## 📁 Fichiers
- créer `src/app/api/ai-summary/audio/route.ts`
- créer un composant lecteur audio
- modifier `src/lib/tts.ts`

## 🪜 Étapes pas à pas
1. Pipeline résumé → TTS par segments
2. Streaming HTTP de l'audio
3. Lecteur côté client
4. Test de bout en bout

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M2-1
- #M1-1
'@
    }

    [pscustomobject]@{
        Id = 'M2-3'; Milestone = 'M2'; Effort = 'M'
        Title = 'M2-3: ASR Groq Whisper : transcription d''audio uploadé'
        Labels = @('area:audio', 'area:ai', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Transcrire un fichier audio uploadé via Groq Whisper.

## 💡 Pourquoi
Permet le support vocal et l'accessibilité mobile. Groq fournit Whisper dans ses quotas gratuits, déjà exploités par `src/lib/ai.ts`.

## ✅ Critères d'acceptation
- [ ] `POST /api/transcribe` accepte un fichier audio
- [ ] Appel `audio/transcriptions` (`whisper-large-v3`) exposé via `src/lib/ai.ts`
- [ ] Limite de taille et types de fichiers autorisés

## 📁 Fichiers
- créer `src/app/api/transcribe/route.ts`
- modifier `src/lib/ai.ts`

## 🪜 Étapes pas à pas
1. Créer la route d'upload
2. Ajouter le provider audio Groq
3. Gérer taille / type / erreurs
4. Tester la transcription

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M2-4'; Milestone = 'M2'; Effort = 'L'
        Title = 'M2-4: Diagnostic vocal bout-en-bout'
        Labels = @('area:audio', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Créer un flux de diagnostic vocal : parler → transcription → analyse → réponse TTS.

## 💡 Pourquoi
Démontre une UX mains-libres différenciante : l'utilisateur dicte un problème de performance, Velocita répond en audio.

## ✅ Critères d'acceptation
- [ ] Enchaîne M2-3 (ASR) → moteur d'analyse IA → M2-1 (TTS)
- [ ] Composant micro dans le dashboard
- [ ] Réponse affichée à l'écran et lue à voix haute

## 📁 Fichiers
- créer le composant `VoiceDiagnostic`
- créer `src/app/api/voice/diagnose/route.ts`

## 🪜 Étapes pas à pas
1. Capture micro côté client
2. Transcription via `/api/transcribe`
3. Analyse IA du diagnostic
4. Synthèse TTS de la réponse

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M2-3
- #M1-1
'@
    }

    [pscustomobject]@{
        Id = 'M2-5'; Milestone = 'M2'; Effort = 'L'
        Title = 'M2-5: Audioblog : TTS des articles Core Web Vitals'
        Labels = @('area:audio', 'area:assets', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Générer une version audio des articles Core Web Vitals (audioblog).

## 💡 Pourquoi
Transformer les articles SEO en podcasts élargit l'audience et le temps de rétention, à coût nul via edge-tts.

## ✅ Critères d'acceptation
- [ ] Bouton « Écouter » sur `src/app/blog/[slug]/page.tsx`
- [ ] TTS du contenu MDX nettoyé (titres, listes, code retirés)
- [ ] Fichier audio mis en cache par article

## 📁 Fichiers
- créer `src/app/api/blog/[slug]/audio/route.ts`
- modifier `src/app/blog/[slug]/page.tsx`
- modifier `src/lib/tts.ts`

## 🪜 Étapes pas à pas
1. Extraire et nettoyer le texte de l'article
2. Synthétiser via `src/lib/tts.ts`
3. Mettre en cache le rendu audio
4. Ajouter le bouton de lecture

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M2-1
'@
    }

    [pscustomobject]@{
        Id = 'M3-1'; Milestone = 'M3'; Effort = 'M'
        Title = 'M3-1: Route d''upload d''images (Supabase Storage)'
        Labels = @('area:vision', 'area:assets', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Exposer une route d'upload d'images vers Supabase Storage.

## 💡 Pourquoi
Prérequis de tous les audits visuels. Centralise la validation, la limite de taille et le stockage.

## ✅ Critères d'acceptation
- [ ] `POST /api/upload` valide type/taille et stocke dans Supabase
- [ ] Retourne une URL signée ou publique
- [ ] Gère proprement les erreurs de quota / bucket

## 📁 Fichiers
- créer `src/app/api/upload/route.ts`
- modifier `.env.example`

## 🪜 Étapes pas à pas
1. Initialiser le client Supabase Storage
2. Valider type et taille
3. Uploader le fichier
4. Retourner l'URL

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- aucune
'@
    }

    [pscustomobject]@{
        Id = 'M3-2'; Milestone = 'M3'; Effort = 'L'
        Title = 'M3-2: Audit par capture d''écran (vision Gemini)'
        Labels = @('area:vision', 'area:ai', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Auditer une capture d'écran d'une page via la vision Gemini.

## 💡 Pourquoi
Beaucoup de problèmes (layout, contraste, hiérarchie) se voient à l'œil. La vision permet un audit sans URL publique ni code.

## ✅ Critères d'acceptation
- [ ] `POST /api/audit/screenshot` reçoit une image + un contexte → analyse
- [ ] Provider vision Gemini ajouté dans `src/lib/ai.ts`
- [ ] Résultat structuré (constats + priorités)

## 📁 Fichiers
- créer `src/app/api/audit/screenshot/route.ts`
- modifier `src/lib/ai.ts`

## 🪜 Étapes pas à pas
1. Ajouter la capacité vision au registre de providers
2. Créer la route d'audit
3. Rédiger le prompt d'audit visuel
4. Tester avec une capture réelle

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M3-1
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M3-3'; Milestone = 'M3'; Effort = 'L'
        Title = 'M3-3: Audit par URL via page_reader du SDK Z.ai'
        Labels = @('area:vision', 'area:ai', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Auditer une page à partir de son URL en lisant son contenu via le SDK Z.ai.

## 💡 Pourquoi
Éviter l'upload : coller une URL et obtenir un audit immédiat. Le SDK Z.ai fournit une lecture de page adaptée aux LLM.

## ✅ Critères d'acceptation
- [ ] `POST /api/audit/url` lit la page via `src/lib/zai.ts`
- [ ] Résumé + recommandations IA produits
- [ ] Gestion des pages bloquées ou 100 % JavaScript

## 📁 Fichiers
- créer `src/app/api/audit/url/route.ts`
- modifier `src/lib/zai.ts`

## 🪜 Étapes pas à pas
1. Vérifier l'API de lecture de page exposée par le SDK (cf. `node_modules/z-ai-web-dev-sdk`)
2. Créer la route d'audit par URL
3. Passer le contenu extrait à l'analyse IA
4. Tester sur plusieurs sites

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M0-1
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M3-4'; Milestone = 'M3'; Effort = 'L'
        Title = 'M3-4: Analyse vidéo d''un bug (vision + video_url)'
        Labels = @('area:vision', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Analyser une vidéo de bug via la vision multimodale (Gemini accepte `video_url`).

## 💡 Pourquoi
Un bug d'interaction est souvent plus clair en vidéo qu'en description textuelle ; le diagnostic gagne en précision.

## ✅ Critères d'acceptation
- [ ] `POST /api/audit/video` accepte une vidéo uploadée
- [ ] Envoi à Gemini avec la vidéo
- [ ] Rapport : étapes de reproduction + cause probable

## 📁 Fichiers
- créer `src/app/api/audit/video/route.ts`
- modifier `src/lib/ai.ts`

## 🪜 Étapes pas à pas
1. Upload de la vidéo (réutilise M3-1)
2. Ajouter la capacité vision vidéo
3. Rédiger le prompt de diagnostic
4. Tester avec une vidéo d'exemple

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M3-1
'@
    }

    [pscustomobject]@{
        Id = 'M3-5'; Milestone = 'M3'; Effort = 'M'
        Title = 'M3-5: Vision sur les graphs dashboard (commentaire IA)'
        Labels = @('area:vision', 'area:monitoring', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Commenter automatiquement les graphiques du dashboard via la vision.

## 💡 Pourquoi
Les courbes Core Web Vitals sont denses ; un commentaire IA « ce que montre ce graph » aide les utilisateurs non-experts.

## ✅ Critères d'acceptation
- [ ] Capture du graph (canvas/recharts → image) et envoi à la vision
- [ ] Commentaire affiché sous le graphique
- [ ] Fonctionnalité optionnelle, pilotée par feature flag

## 📁 Fichiers
- créer le composant `GraphInsight`
- créer `src/app/api/ai/graph-insight/route.ts`

## 🪜 Étapes pas à pas
1. Exporter le canvas du graphique en image
2. Envoyer à la vision IA
3. Afficher le commentaire
4. Encadrer par un feature flag

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M4-1'; Milestone = 'M4'; Effort = 'M'
        Title = 'M4-1: Modèle Prisma BlogChunk + indexation des articles'
        Labels = @('area:rag', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Modéliser `BlogChunk` et indexer les articles existants du blog.

## 💡 Pourquoi
Base d'un RAG maison sans pgvector : découper les articles en chunks et stocker leurs embeddings pour la recherche sémantique.

## ✅ Critères d'acceptation
- [ ] Modèle Prisma `BlogChunk` (articleId, ordre, contenu, embedding)
- [ ] Script d'indexation des articles existants
- [ ] Embeddings générés via un provider gratuit

## 📁 Fichiers
- modifier `prisma/schema.prisma` (+ migration)
- créer `scripts/index-blog.ts`
- modifier `src/lib/blog.ts`

## 🪜 Étapes pas à pas
1. Définir le schéma + migration
2. Découper les articles en chunks
3. Générer les embeddings
4. Exécuter l'indexation

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- aucune
'@
    }

    [pscustomobject]@{
        Id = 'M4-2'; Milestone = 'M4'; Effort = 'S'
        Title = 'M4-2: Recherche cosinus en SQL (sans pgvector)'
        Labels = @('area:rag', 'effort:S (0.5j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Rechercher les chunks les plus proches par similarité cosinus, en SQL.

## 💡 Pourquoi
Éviter une extension Postgres propriétaire : un calcul cosinus en SQL/JS suffit pour un blog de taille modeste.

## ✅ Critères d'acceptation
- [ ] Requête SQL/Prisma renvoyant le top-k
- [ ] Fonction `searchBlog(query, k)`
- [ ] Performance acceptable (< 200 ms pour ~1 000 chunks)

## 📁 Fichiers
- créer `src/lib/rag.ts`

## 🪜 Étapes pas à pas
1. Calculer l'embedding de la requête
2. Écrire la requête cosinus (`prisma.$queryRaw`)
3. Retourner le top-k
4. Mesurer la performance

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- #M4-1
'@
    }

    [pscustomobject]@{
        Id = 'M4-3'; Milestone = 'M4'; Effort = 'M'
        Title = 'M4-3: Résumé IA qui cite le blog (RAG appliqué à M1)'
        Labels = @('area:rag', 'area:ai', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Enrichir le résumé IA en citant les articles pertinents du blog (RAG).

## 💡 Pourquoi
Rendre les recommandations actionnables en renvoyant vers la documentation interne améliore la crédibilité et le maillage SEO.

## ✅ Critères d'acceptation
- [ ] Le résumé inclut des liens vers les articles pertinents
- [ ] Récupération via `searchBlog`
- [ ] Aucune citation si aucun chunk pertinent

## 📁 Fichiers
- modifier `src/lib/ai.ts`
- modifier `src/lib/ai/prompts/brand.ts`
- modifier `src/app/api/ai-summary/route.ts`

## 🪜 Étapes pas à pas
1. Interroger le RAG avec les données du rapport
2. Injecter le contexte récupéré dans le prompt
3. Ajouter la consigne de citation
4. Tester la pertinence des liens

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M4-2
- #M1-2
'@
    }

    [pscustomobject]@{
        Id = 'M4-4'; Milestone = 'M4'; Effort = 'L'
        Title = 'M4-4: Chat Velocita contextuel (assistant RAG)'
        Labels = @('area:rag', 'area:ai', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Ajouter un chat Velocita contextuel : assistant RAG répondant aux questions sur les CWV.

## 💡 Pourquoi
Permettre des questions libres avec réponses sourcées apporte une forte valeur perçue et augmente l'engagement produit.

## ✅ Critères d'acceptation
- [ ] Route de chat en streaming
- [ ] Contexte : site courant + chunks du blog
- [ ] Réponses citant les sources
- [ ] Historique de conversation conservé en session

## 📁 Fichiers
- créer `src/app/api/chat/route.ts`
- créer le composant `ChatPanel`
- modifier `src/lib/rag.ts`

## 🪜 Étapes pas à pas
1. Créer la route streaming
2. Assembler le contexte (site + RAG)
3. Construire l'UI de chat
4. Tester les réponses et les citations

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M4-2
- #M1-1
'@
    }

    [pscustomobject]@{
        Id = 'M5-1'; Milestone = 'M5'; Effort = 'S'
        Title = 'M5-1: Helper de génération d''image Pollinations.ai'
        Labels = @('area:assets', 'effort:S (0.5j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Créer un helper de génération d'image via Pollinations.ai.

## 💡 Pourquoi
Illustrations gratuites et sans clé pour le blog et le partage. Un wrapper central évite la répétition de la logique d'URL.

## ✅ Critères d'acceptation
- [ ] `src/lib/image.ts` génère une URL image depuis un prompt
- [ ] Paramètres taille / seed / style
- [ ] Validation et encodage des prompts

## 📁 Fichiers
- créer `src/lib/image.ts`
- modifier `.env.example`

## 🪜 Étapes pas à pas
1. Construire l'URL Pollinations
2. Wrapper typé
3. Helper de téléchargement/cache
4. Tester plusieurs prompts

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- aucune
'@
    }

    [pscustomobject]@{
        Id = 'M5-2'; Milestone = 'M5'; Effort = 'S'
        Title = 'M5-2: Vignettes auto pour articles de blog'
        Labels = @('area:assets', 'effort:S (0.5j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Générer automatiquement les vignettes des articles de blog.

## 💡 Pourquoi
Une vignette par article améliore le CTR et l'aspect professionnel du blog, sans budget design.

## ✅ Critères d'acceptation
- [ ] Helper dérivant le prompt depuis le titre / la catégorie de l'article
- [ ] Fallback si la génération est indisponible
- [ ] Affichage sur `src/app/blog/page.tsx` et la page article

## 📁 Fichiers
- modifier `src/lib/blog.ts`
- modifier `src/app/blog/page.tsx`
- modifier `src/app/blog/[slug]/page.tsx`

## 🪜 Étapes pas à pas
1. Dériver un prompt depuis le titre
2. Générer l'image (M5-1)
3. Stocker / mettre en cache
4. Afficher sur les listes et pages article

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- #M5-1
'@
    }

    [pscustomobject]@{
        Id = 'M5-3'; Milestone = 'M5'; Effort = 'L'
        Title = 'M5-3: Atelier de rédaction blog (MDX + suggestions IA)'
        Labels = @('area:assets', 'area:ai', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Créer un atelier de rédaction blog : éditeur MDX assisté par l'IA.

## 💡 Pourquoi
Accélérer la production éditoriale SEO en s'appuyant sur l'éditeur déjà installé (`@mdxeditor/editor`).

## ✅ Critères d'acceptation
- [ ] Page admin de rédaction MDX
- [ ] Suggestions IA (titre, plan, réécriture) via `src/lib/ai.ts`
- [ ] Prévisualisation de l'article

## 📁 Fichiers
- créer `src/app/admin/blog/edit/page.tsx`
- créer le composant éditeur
- modifier `src/lib/blog.ts`

## 🪜 Étapes pas à pas
1. Intégrer l'éditeur MDX
2. Ajouter les boutons de suggestion IA
3. Enregistrer les brouillons
4. Prévisualiser

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M5-1
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M5-4'; Milestone = 'M5'; Effort = 'M'
        Title = 'M5-4: Méta descriptions & alt-text auto'
        Labels = @('area:assets', 'area:ai', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Générer automatiquement les méta descriptions et les alt-text.

## 💡 Pourquoi
Améliore le SEO et l'accessibilité sans effort manuel, applicable aux articles et aux images.

## ✅ Critères d'acceptation
- [ ] Méta description auto (≤ 155 caractères) par article
- [ ] Alt-text auto pour les images (vision ou titre)
- [ ] Champs éditables dans l'admin

## 📁 Fichiers
- modifier `src/lib/blog.ts`
- créer `src/lib/ai/seo.ts`

## 🪜 Étapes pas à pas
1. Prompt de méta description
2. Prompt d'alt-text
3. Brancher sur les articles/images
4. Tester et éditer

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-2
- #M5-1
'@
    }

    [pscustomobject]@{
        Id = 'M5-5'; Milestone = 'M5'; Effort = 'S'
        Title = 'M5-5: FAQ auto-générées depuis la doc'
        Labels = @('area:assets', 'area:rag', 'effort:S (0.5j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Générer des FAQ à partir de la documentation et des articles existants.

## 💡 Pourquoi
Les FAQ captent la longue traîne SEO et réduisent les questions de support, en réutilisant le contenu déjà présent.

## ✅ Critères d'acceptation
- [ ] Extraction de questions/réponses depuis les articles
- [ ] Bloc FAQ avec données structurées `schema.org` (`FAQPage`)
- [ ] Contenu éditable après génération

## 📁 Fichiers
- créer `src/app/blog/[slug]/faq.tsx`
- modifier `src/lib/blog.ts`

## 🪜 Étapes pas à pas
1. Générer les paires question/réponse
2. Rendre le bloc FAQ
3. Émettre le JSON-LD
4. Tester le balisage

## ⏱️ Estimation
S (0,5 j)

## 🔗 Dépendances
- #M4-2
- #M0-2
'@
    }

    [pscustomobject]@{
        Id = 'M6-1'; Milestone = 'M6'; Effort = 'M'
        Title = 'M6-1: Détection d''anomalies sur les SpeedTests'
        Labels = @('area:monitoring', 'area:ai', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Détecter automatiquement les anomalies sur les séries de SpeedTests.

## 💡 Pourquoi
Repérer une dégradation (LCP qui grimpe, score qui chute) avant que l'utilisateur ne s'en aperçoive est le cœur de la valeur monitoring.

## ✅ Critères d'acceptation
- [ ] Détection par écart-type / tendance sur fenêtre glissante
- [ ] Statut par site (sain / avertissement / critique)
- [ ] Pas de faux positifs sur séries courtes

## 📁 Fichiers
- créer `src/lib/anomaly.ts`
- modifier `src/lib/performance.ts`
- modifier `src/app/api/monitoring/route.ts`

## 🪜 Étapes pas à pas
1. Calculer les statistiques de base
2. Définir les seuils d'anomalie
3. Intégrer au monitoring
4. Tester sur historiques

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- aucune
'@
    }

    [pscustomobject]@{
        Id = 'M6-2'; Milestone = 'M6'; Effort = 'L'
        Title = 'M6-2: Synthèse quotidienne en langage naturel (texte + TTS)'
        Labels = @('area:monitoring', 'area:audio', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Produire une synthèse quotidienne en langage naturel, en texte et en audio.

## 💡 Pourquoi
Un résumé quotidien automatique par site/tenant réduit le temps d'analyse et rend le monitoring proactif.

## ✅ Critères d'acceptation
- [ ] Génère une synthèse texte à partir des données et anomalies
- [ ] Version audio via `src/lib/tts.ts`
- [ ] Job planifié via `src/lib/scheduler.ts`

## 📁 Fichiers
- créer `src/lib/digest.ts`
- modifier `src/lib/scheduler.ts`
- modifier `src/lib/jobs.ts`

## 🪜 Étapes pas à pas
1. Requêter les données de la période
2. Générer le texte de synthèse
3. Ajouter la version TTS
4. Planifier l'exécution quotidienne

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M6-1
- #M2-1
'@
    }

    [pscustomobject]@{
        Id = 'M6-3'; Milestone = 'M6'; Effort = 'L'
        Title = 'M6-3: Rapport PDF agency (synthèse mensuelle multi-sites)'
        Labels = @('area:monitoring', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Générer un rapport PDF agency : synthèse mensuelle multi-sites.

## 💡 Pourquoi
Les agences doivent livrer un rapport client ; l'automatiser est un argument de vente fort et différenciant.

## ✅ Critères d'acceptation
- [ ] Génère un PDF multi-sites sur un mois
- [ ] Inclut scores, CWV, anomalies et recommandations IA
- [ ] Téléchargeable depuis le dashboard

## 📁 Fichiers
- créer `src/app/api/reports/monthly/route.ts`
- créer `src/lib/report.ts`

## 🪜 Étapes pas à pas
1. Agréger les données mensuelles
2. Concevoir le template PDF
3. Ajouter les recommandations IA
4. Exposer le téléchargement

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M6-1
- #M6-2
'@
    }

    [pscustomobject]@{
        Id = 'M7-1'; Milestone = 'M7'; Effort = 'M'
        Title = 'M7-1: Dashboard admin des quotas IA'
        Labels = @('area:ai', 'area:monitoring', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Créer un dashboard admin des quotas et de la santé des appels IA.

## 💡 Pourquoi
Visualiser la consommation, le taux d'erreur et la latence par provider permet de piloter coûts et fiabilité.

## ✅ Critères d'acceptation
- [ ] Page admin affichant les métriques de M0-5
- [ ] Détail par provider, cas d'usage et utilisateur
- [ ] Alertes de dépassement de seuil

## 📁 Fichiers
- créer `src/app/admin/ai/page.tsx`
- modifier `src/lib/ai/metrics.ts`

## 🪜 Étapes pas à pas
1. Exposer l'endpoint admin
2. Construire le tableau
3. Ajouter les graphiques
4. Définir les seuils d'alerte

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-5
- #M0-4
'@
    }

    [pscustomobject]@{
        Id = 'M7-2'; Milestone = 'M7'; Effort = 'L'
        Title = 'M7-2: Tests E2E des features IA'
        Labels = @('area:monitoring', 'area:ai', 'effort:L (2-3j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Couvrir les features IA par des tests end-to-end.

## 💡 Pourquoi
Éviter les régressions sur des flux coûteux et fragiles (streaming, TTS, vision, RAG) qui ne se voient qu'à l'exécution.

## ✅ Critères d'acceptation
- [ ] Tests sur résumé streamé, podcast, screenshot et chat RAG
- [ ] Providers mockés pour ne pas consommer les quotas
- [ ] Exécutables en CI

## 📁 Fichiers
- créer `tests/e2e/ai.spec.ts`
- créer `tests/mocks/ai.ts`

## 🪜 Étapes pas à pas
1. Choisir le runner E2E
2. Écrire les mocks providers
3. Scénariser les 4 flux
4. Brancher en CI

## ⏱️ Estimation
L (1,5–2 j)

## 🔗 Dépendances
- #M1-1
- #M2-2
- #M3-2
- #M4-4
'@
    }

    [pscustomobject]@{
        Id = 'M7-3'; Milestone = 'M7'; Effort = 'M'
        Title = 'M7-3: Documentation interne (docs/ai.md)'
        Labels = @('area:foundation', 'effort:M (1j)', 'cost:free')
        Body = @'
## 🎯 Objectif
Documenter l'architecture IA interne du projet.

## 💡 Pourquoi
Le socle providers / flags / RAG doit être compréhensible par tout contributeur ; la documentation réduit le bus factor.

## ✅ Critères d'acceptation
- [ ] `docs/ai.md` couvre providers, flags, quotas, RAG et coûts
- [ ] Schéma d'architecture
- [ ] Guide « ajouter un provider »

## 📁 Fichiers
- créer `docs/ai.md`

## 🪜 Étapes pas à pas
1. Établir le plan
2. Rédiger les sections
3. Ajouter le schéma d'architecture
4. Relecture

## ⏱️ Estimation
M (1 j)

## 🔗 Dépendances
- #M0-2
'@
    }
)

# =====================================================================
#  ASSERTIONS (exécutées au chargement, y compris en dot-source)
# =====================================================================
if ($Issues.Count -ne 34) {
    throw "Assertion échouée : 34 issues attendues, $($Issues.Count) définies."
}
if ($Milestones.Count -ne 8) {
    throw "Assertion échouée : 8 milestones attendus, $($Milestones.Count) définis."
}
if ($Labels.Count -lt 14) {
    throw "Assertion échouée : au moins 14 labels attendus, $($Labels.Count) définis."
}

# Intégrité : tous les codes de milestone référencés existent
$milestoneCodes = $Milestones | ForEach-Object { $_.Code }
foreach ($issue in $Issues) {
    if ($milestoneCodes -notcontains $issue.Milestone) {
        throw "Issue $($issue.Id) référence le milestone inconnu '$($issue.Milestone)'."
    }
}

# Intégrité : toutes les dépendances #Mx-y pointent vers une issue existante
$issueIds = $Issues | ForEach-Object { $_.Id }
$dependencyRefs = [regex]::Matches(($Issues | ForEach-Object { $_.Body }) -join "`n", '#M\d+-\d+') |
    ForEach-Object { $_.Value.Substring(1) } |
    Sort-Object -Unique
foreach ($ref in $dependencyRefs) {
    if ($issueIds -notcontains $ref) {
        throw "Dépendance inconnue détectée : #$ref (aucune issue avec l'Id '$ref')."
    }
}

# =====================================================================
#  HELPERS
# =====================================================================
function Write-Step([string]$Message) {
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}
function Write-Ok([string]$Message)   { Write-Host "    [OK]   $Message" -ForegroundColor Green }
function Write-Skip([string]$Message) { Write-Host "    [SKIP] $Message" -ForegroundColor DarkGray }
function Write-Warn([string]$Message) { Write-Host "    [WARN] $Message" -ForegroundColor Yellow }

function Assert-Gh {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "gh CLI introuvable dans le PATH. Installez-le : https://cli.github.com/"
    }
}

# =====================================================================
#  LOGIQUE D'EXÉCUTION
# =====================================================================
function Invoke-CreateIssues {
    param([switch]$DryRun)

    Assert-Gh

    Write-Host ''
    Write-Host "Velocita — création des issues IA ($Repo)" -ForegroundColor Magenta
    Write-Host "Mode : $(if ($DryRun) { 'DRY-RUN (aucun appel réseau)' } else { 'RÉEL' })" -ForegroundColor Magenta

    if ($DryRun) {
        foreach ($issue in $Issues) {
            Write-Host ("  {0,-6} [{1}] {2}" -f $issue.Id, $issue.Effort, $issue.Title)
        }
        Write-Host ''
        Write-Host "$($Issues.Count) issues seraient créées." -ForegroundColor Yellow
        return
    }

    # --- 1. Milestones ---
    Write-Step "Milestones (0/8)"
    $existingMilestones = @()
    try {
        $existingMilestones = & gh api "repos/$Repo/milestones?state=all&per_page=100" --jq '.[].title' 2>$null
    } catch {
        Write-Warn "Lecture des milestones existants impossible : $($_.Exception.Message)"
    }

    $mCount = 0
    foreach ($m in $Milestones) {
        $mCount++
        if ($existingMilestones -contains $m.Title) {
            Write-Skip "$mCount/8 $($m.Title) (déjà présent)"
        } else {
            & gh api "repos/$Repo/milestones" -X POST -f "title=$($m.Title)" -f "description=$($m.Description)" | Out-Null
            if ($LASTEXITCODE -eq 0) { Write-Ok "$mCount/8 $($m.Title) créé" }
            else { Write-Warn "$mCount/8 $($m.Title) — échec creation" }
        }
    }

    # Mapping code -> numéro de milestone (pour --milestone robuste)
    $milestoneNumberByCode = @{}
    try {
        $mJson = & gh api "repos/$Repo/milestones?state=all&per_page=100"
        foreach ($x in ($mJson | ConvertFrom-Json)) {
            $code = ($Milestones | Where-Object { $_.Title -eq $x.title }).Code
            if ($code) { $milestoneNumberByCode[$code] = $x.number }
        }
    } catch {
        Write-Warn "Mapping des milestones indisponible : $($_.Exception.Message)"
    }

    # --- 2. Labels ---
    Write-Step "Labels ($($Labels.Count))"
    foreach ($label in $Labels) {
        & gh label create $label.Name --repo $Repo --color $label.Color --description $label.Description --force | Out-Null
        if ($LASTEXITCODE -eq 0) { Write-Ok "label $($label.Name)" }
        else { Write-Warn "label $($label.Name) — échec (ignoré)" }
    }

    # --- 3. Issues existantes (idempotence par titre) ---
    Write-Step "Index des issues existantes"
    $byTitle = @{}
    try {
        $existing = & gh issue list --repo $Repo --state all --limit 500 --json number,title
        foreach ($e in ($existing | ConvertFrom-Json)) { $byTitle[$e.title] = $e.number }
        Write-Ok "$($byTitle.Count) issue(s) déjà présente(s)"
    } catch {
        Write-Warn "Lecture des issues existantes impossible : $($_.Exception.Message)"
    }

    # --- 4. Création des issues ---
    Write-Step "Création des issues"
    $idToNumber = @{}
    $created = 0; $skipped = 0; $failed = 0
    $index = 0
    foreach ($issue in $Issues) {
        $index++
        $prefix = "[$index/$($Issues.Count)]"

        if ($byTitle.ContainsKey($issue.Title)) {
            $idToNumber[$issue.Id] = $byTitle[$issue.Title]
            $skipped++
            Write-Skip "$prefix déjà présente — #$($byTitle[$issue.Title]) $($issue.Title)"
            continue
        }

        $milestoneNumber = $milestoneNumberByCode[$issue.Milestone]
        $ghArgs = @(
            'issue', 'create',
            '--repo', $Repo,
            '--title', $issue.Title,
            '--body', $issue.Body
        )
        if ($milestoneNumber) { $ghArgs += @('--milestone', "$milestoneNumber") }
        foreach ($l in $issue.Labels) { $ghArgs += @('--label', $l) }

        $out = & gh @ghArgs 2>&1
        if ($LASTEXITCODE -ne 0) {
            $failed++
            Write-Warn "$prefix ÉCHEC $($issue.Title) — $out"
            continue
        }

        $number = $null
        if ($out -match '/(\d+)\s*$') { $number = [int]$Matches[1] }
        if ($number) { $idToNumber[$issue.Id] = $number }
        $created++
        Write-Ok "$prefix #$number $($issue.Title) [M$($issue.Milestone)]"
    }

    # --- 5. Résolution des dépendances #Mx-y -> #numéro réel ---
    Write-Step "Liaison des dépendances"
    foreach ($issue in $Issues) {
        $number = $idToNumber[$issue.Id]
        if (-not $number) { continue }
        if ($issue.Body -notmatch '#M\d+-\d+') { continue }

        $newBody = [regex]::Replace($issue.Body, '#M(\d+)-(\d+)', {
                param($m)
                $key = 'M' + $m.Groups[1].Value + '-' + $m.Groups[2].Value
                if ($idToNumber.ContainsKey($key)) { '#' + $idToNumber[$key] } else { $m.Value }
            })
        if ($newBody -ne $issue.Body) {
            & gh issue edit "$number" --repo $Repo --body $newBody | Out-Null
            if ($LASTEXITCODE -eq 0) { Write-Ok "#$number dépendances liées" }
            else { Write-Warn "#$number liaison des dépendances échouée" }
        }
    }

    # --- Bilan ---
    Write-Host ''
    Write-Host "Terminé : $created créée(s), $skipped ignorée(s), $failed échec(s)." -ForegroundColor Magenta
    if ($failed -gt 0) { exit 1 }
}

# N'exécute la logique QUE si le fichier est lancé directement (pas dot-sourcé).
if ($MyInvocation.InvocationName -ne '.') {
    Invoke-CreateIssues -DryRun:$DryRun
}
