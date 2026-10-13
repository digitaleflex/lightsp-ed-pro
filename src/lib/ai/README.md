# `src/lib/ai/` — Système de providers IA

Façade de compatibilité : `src/lib/ai.ts` ré-exporte l'API publique historique
(`generateAiSummary`, `configuredProviders`, types `AiReportInput` / `AiResult`).
**Ne jamais casser ces signatures** : elles sont utilisées par
`src/app/api/ai-summary/route.ts` et, indirectement, par `speed-test.tsx`.

## Structure

| Fichier | Rôle |
| --- | --- |
| `types.ts` | Interfaces : `AIProvider`, `ChatRequest/Response`, `AiReportInput/AiResult` + capacités futures (M2/M3/M4). |
| `providers/groq.ts` | `GroqProvider` — API OpenAI-compatible. |
| `providers/gemini.ts` | `GeminiProvider` — `generateContent`. |
| `providers/openrouter.ts` | `OpenRouterProvider` — API OpenAI-compatible. |
| `providers/zai.ts` | `ZaiProvider` — SDK `z-ai-web-dev-sdk` (cf. `src/lib/zai.ts`). |
| `index.ts` | Factory : `allProviders`, `providers`, `getProvidersByCapability`, `configuredProviders`, `tryProviders`, `generateAiSummary`. |
| `prompts.ts` | `buildPrompt` + `VELOCITA_SYSTEM_PROMPT` (squelette, M1-2). |
| `utils.ts` | `isQuotaError` partagé. |
| `telemetry.ts` | `recordAICall` — squelette (M0-5), no-op. |

## Chaîne de repli

`Groq → Gemini → OpenRouter → Z.ai`. `tryProviders` tente les providers
**configurés** (clé présente) dans cet ordre et retourne la première réponse.
Z.ai s'ajoute automatiquement dès que `ZAI_API_KEY` est définie (ou qu'un
`.z-ai-config` local existe).

## Ajouter un provider

1. Créer `providers/mon-provider.ts` avec `class MonProvider implements AIProvider`.
2. L'ajouter à `allProviders` dans `index.ts`.
3. Gérer `isConfigured(p)` (clé d'env) via le `switch` de `index.ts`.
