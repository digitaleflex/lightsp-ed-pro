// Point d'entrée du système de providers IA.
// Chaîne de repli : Groq → Gemini → OpenRouter → Z.ai (premier configuré qui répond).
import type { AICapability, AIProvider, AiReportInput, AiResult, ChatRequest, ChatResponse } from './types'
import { GroqProvider } from './providers/groq'
import { GeminiProvider } from './providers/gemini'
import { OpenRouterProvider } from './providers/openrouter'
import { ZaiProvider } from './providers/zai'
import { buildPrompt } from './prompts'
import { isZaiEnabled } from '@/lib/zai'
import { recordAICall } from './telemetry'

/** Tous les providers connus, dans l'ordre de repli. */
export const allProviders: AIProvider[] = [
  new GroqProvider(),
  new GeminiProvider(),
  new OpenRouterProvider(),
  new ZaiProvider(),
]

/** Un provider est « configuré » si sa clé (ou sa config Z.ai) est présente. */
function isConfigured(p: AIProvider): boolean {
  switch (p.name) {
    case 'groq':
      return Boolean(process.env.GROQ_API_KEY)
    case 'gemini':
      return Boolean(process.env.GEMINI_API_KEY)
    case 'openrouter':
      return Boolean(process.env.OPENROUTER_API_KEY)
    case 'zai':
      return isZaiEnabled()
  }
}

/** Providers actuellement configurés, ordre de repli préservé. */
export const providers: AIProvider[] = allProviders.filter(isConfigured)

/** Providers configurés supportant une capacité donnée. */
export function getProvidersByCapability(cap: AICapability): AIProvider[] {
  return providers.filter((p) => p.capabilities.includes(cap))
}

/** Noms des providers configurés (compat : même signature que l'ancienne API publique). */
export function configuredProviders(): string[] {
  return getProvidersByCapability('chat').map((p) => p.name)
}

/**
 * Tente la requête sur chaque provider configuré, dans l'ordre.
 * Retourne la première réponse réussie ; lève si tous échouent.
 */
export async function tryProviders(req: ChatRequest): Promise<ChatResponse> {
  const chain = getProvidersByCapability('chat')
  const errors: string[] = []
  for (const provider of chain) {
    const startedAt = Date.now()
    try {
      const res = await provider.chat(req)
      recordAICall({
        provider: res.provider,
        model: res.model,
        capability: 'chat',
        ok: true,
        latencyMs: Date.now() - startedAt,
      })
      return res
    } catch (e: any) {
      const message = e?.message ?? String(e)
      recordAICall({
        provider: provider.name,
        model: '',
        capability: 'chat',
        ok: false,
        latencyMs: Date.now() - startedAt,
        errorCode: message.slice(0, 200),
      })
      if (/absente/.test(message)) {
        errors.push(`${provider.name} : clé non configurée`)
        continue // provider suivant
      }
      console.warn(`[ai] ${provider.name} échec :`, message)
      errors.push(`${provider.name} : ${message}`)
    }
  }
  const detail = errors.length ? errors.join(' — ') : 'aucun provider configuré'
  throw new Error(`Aucun provider IA disponible. ${detail}`)
}

/** Génère le résumé d'un rapport en essayant les providers configurés dans l'ordre. */
export async function generateAiSummary(report: AiReportInput): Promise<AiResult> {
  const prompt = buildPrompt(report)
  const res = await tryProviders({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 800,
    temperature: 0.3,
  })
  return { summary: res.text, model: `${res.provider}/${res.model}` }
}

// ─── Streaming (M1-1) ──────────────────────────────────────────────────────────

/**
 * Streaming via le premier provider qui supporte `chatStream` et qui répond.
 * Retourne un ReadableStream de chunks texte + le nom du provider/model utilisés.
 *
 * Si AUCUN provider ne supporte le streaming, bascule sur `tryProviders` non-streamé
 * et renvoie un flux mono-chunk (compat dégradée).
 */
export async function streamChat(
  req: Omit<ChatRequest, 'stream'>
): Promise<{ stream: ReadableStream<string>; provider: string; model: string }> {
  const chain = getProvidersByCapability('chat')
  const errors: string[] = []

  for (const provider of chain) {
    if (!provider.chatStream) continue // provider sans streaming : on skip
    const startedAt = Date.now()
    try {
      const stream = await provider.chatStream(req)
      recordAICall({
        provider: provider.name,
        model: '', // on ne connaît pas le model exact avant la fin du stream
        capability: 'chat',
        ok: true,
        latencyMs: Date.now() - startedAt,
      })
      return { stream, provider: provider.name, model: provider.name }
    } catch (e: any) {
      const message = e?.message ?? String(e)
      recordAICall({
        provider: provider.name,
        model: '',
        capability: 'chat',
        ok: false,
        latencyMs: Date.now() - startedAt,
        errorCode: message.slice(0, 200),
      })
      if (/absente/.test(message)) {
        errors.push(`${provider.name} : clé non configurée`)
        continue
      }
      console.warn(`[ai] ${provider.name} échec stream :`, message)
      errors.push(`${provider.name} : ${message}`)
    }
  }

  // Fallback : aucun provider streaming disponible → essai non-streamé
  console.warn('[ai] aucun provider stream, fallback non-streamé')
  const res = await tryProviders(req)
  const single = new ReadableStream<string>({
    start(controller) {
      controller.enqueue(res.text)
      controller.close()
    },
  })
  return { stream: single, provider: res.provider, model: res.model }
}

/** Streaming du résumé d'un rapport (M1-1). */
export async function streamAiSummary(
  report: AiReportInput
): Promise<{ stream: ReadableStream<string>; provider: string; model: string }> {
  const prompt = buildPrompt(report)
  return streamChat({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 800,
    temperature: 0.3,
  })
}
