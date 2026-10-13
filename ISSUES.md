# Vélocita — Plan IA : 34 issues / 8 milestones

> Repo cible : `digitaleflex/lightsp-ed-pro` — généré depuis `scripts/create-issues.ps1`.

| Milestone | # | Titre | Effort | Priorité |
| --- | --- | --- | --- | --- |
| M0 | M0-1 | M0-1: Créer le fichier de configuration du SDK Z.ai | XS | haute |
| M0 | M0-2 | M0-2: Refactoriser src/lib/ai.ts vers un système de providers unifié | L | haute |
| M0 | M0-3 | M0-3: Feature flags par cas d'usage IA | S | haute |
| M0 | M0-4 | M0-4: Rate-limit par utilisateur (sans Redis) | M | normale |
| M0 | M0-5 | M0-5: Observabilité des appels IA (compteurs, latence, erreurs) | L | normale |
| M1 | M1-1 | M1-1: Streaming SSE du résumé | L | haute |
| M1 | M1-2 | M1-2: Ton de marque Velocita (prompt engineering) | M | normale |
| M1 | M1-3 | M1-3: Résumé multilingue (EN/ES/DE) | S | normale |
| M1 | M1-4 | M1-4: Bouton "Partager" avec image générée | L | normale |
| M2 | M2-1 | M2-1: Installer et intégrer edge-tts (TTS gratuit, sans clé) | S | haute |
| M2 | M2-2 | M2-2: Mode "podcast" du résumé IA (TTS en streaming) | L | normale |
| M2 | M2-3 | M2-3: ASR Groq Whisper : transcription d'audio uploadé | M | normale |
| M2 | M2-4 | M2-4: Diagnostic vocal bout-en-bout | L | normale |
| M2 | M2-5 | M2-5: Audioblog : TTS des articles Core Web Vitals | L | normale |
| M3 | M3-1 | M3-1: Route d'upload d'images (Supabase Storage) | M | normale |
| M3 | M3-2 | M3-2: Audit par capture d'écran (vision Gemini) | L | normale |
| M3 | M3-3 | M3-3: Audit par URL via page_reader du SDK Z.ai | L | normale |
| M3 | M3-4 | M3-4: Analyse vidéo d'un bug (vision + video_url) | L | normale |
| M3 | M3-5 | M3-5: Vision sur les graphs dashboard (commentaire IA) | M | normale |
| M4 | M4-1 | M4-1: Modèle Prisma BlogChunk + indexation des articles | M | normale |
| M4 | M4-2 | M4-2: Recherche cosinus en SQL (sans pgvector) | S | normale |
| M4 | M4-3 | M4-3: Résumé IA qui cite le blog (RAG appliqué à M1) | M | normale |
| M4 | M4-4 | M4-4: Chat Velocita contextuel (assistant RAG) | L | normale |
| M5 | M5-1 | M5-1: Helper de génération d'image Pollinations.ai | S | normale |
| M5 | M5-2 | M5-2: Vignettes auto pour articles de blog | S | normale |
| M5 | M5-3 | M5-3: Atelier de rédaction blog (MDX + suggestions IA) | L | normale |
| M5 | M5-4 | M5-4: Méta descriptions & alt-text auto | M | normale |
| M5 | M5-5 | M5-5: FAQ auto-générées depuis la doc | S | normale |
| M6 | M6-1 | M6-1: Détection d'anomalies sur les SpeedTests | M | normale |
| M6 | M6-2 | M6-2: Synthèse quotidienne en langage naturel (texte + TTS) | L | normale |
| M6 | M6-3 | M6-3: Rapport PDF agency (synthèse mensuelle multi-sites) | L | normale |
| M7 | M7-1 | M7-1: Dashboard admin des quotas IA | M | normale |
| M7 | M7-2 | M7-2: Tests E2E des features IA | L | normale |
| M7 | M7-3 | M7-3: Documentation interne (docs/ai.md) | M | normale |

## Dépendances

| # | Dépend de |
| --- | --- |
| M0-1 | — |
| M0-2 | #M0-1 |
| M0-3 | #M0-2 |
| M0-4 | #M0-2 |
| M0-5 | #M0-2 |
| M1-1 | #M0-2 |
| M1-2 | #M0-2 |
| M1-3 | #M1-2 |
| M1-4 | #M1-1, #M5-1 |
| M2-1 | — |
| M2-2 | #M1-1, #M2-1 |
| M2-3 | #M0-2 |
| M2-4 | #M1-1, #M2-3 |
| M2-5 | #M2-1 |
| M3-1 | — |
| M3-2 | #M0-2, #M3-1 |
| M3-3 | #M0-1, #M0-2 |
| M3-4 | #M3-1 |
| M3-5 | #M0-2 |
| M4-1 | — |
| M4-2 | #M4-1 |
| M4-3 | #M1-2, #M4-2 |
| M4-4 | #M1-1, #M4-2 |
| M5-1 | — |
| M5-2 | #M5-1 |
| M5-3 | #M0-2, #M5-1 |
| M5-4 | #M0-2, #M5-1 |
| M5-5 | #M0-2, #M4-2 |
| M6-1 | — |
| M6-2 | #M2-1, #M6-1 |
| M6-3 | #M6-1, #M6-2 |
| M7-1 | #M0-4, #M0-5 |
| M7-2 | #M1-1, #M2-2, #M3-2, #M4-4 |
| M7-3 | #M0-2 |

## Répartition par milestone

| Milestone | Issues |
| --- | --- |
| M0 — Fondations | 5 |
| M1 — UX du résumé IA | 4 |
| M2 — Audio | 5 |
| M3 — Vision & audit URL | 5 |
| M4 — RAG blog | 4 |
| M5 — Assets & contenu | 5 |
| M6 — Alertes intelligentes | 3 |
| M7 — Polish | 3 |

## Estimation (effort)

- **XS** (1) : M0-1
- **S** (7) : M0-3, M1-3, M2-1, M4-2, M5-1, M5-2, M5-5
- **M** (11) : M0-4, M1-2, M2-3, M3-1, M3-5, M4-1, M4-3, M5-4, M6-1, M7-1, M7-3
- **L** (15) : M0-2, M0-5, M1-1, M1-4, M2-2, M2-4, M2-5, M3-2, M3-3, M3-4, M4-4, M5-3, M6-2, M6-3, M7-2
