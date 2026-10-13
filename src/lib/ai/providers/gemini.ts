// Provider Google Gemini — API generateContent (offre gratuite).
import type { AICapability, ChatMessage, AIProvider, ChatRequest, ChatResponse } from '../types'
import { isQuotaError } from '../utils'

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite'
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 60_000)

/** Traduit les rôles OpenAI vers les rôles Gemini. */
function toGeminiRole(role: ChatMessage['role']): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user'
}

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const
  readonly capabilities: AICapability[] = ['chat']

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY absente')
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: req.messages.map((m) => ({
            role: toGeminiRole(m.role),
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: req.maxTokens ?? 800,
            temperature: req.temperature ?? 0.3,
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    )
    if (!res.ok) {
      const err = new Error(`Gemini HTTP ${res.status}`)
      ;(err as any).quota = isQuotaError(res.status)
      throw err
    }
    const data: any = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('').trim()
    if (!text) throw new Error('Gemini : réponse vide')
    return { text, model: GEMINI_MODEL, provider: 'gemini' }
  }

  /** Streaming SSE Gemini — format `data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}`. */
  async chatStream(req: Omit<ChatRequest, 'stream'>): Promise<ReadableStream<string>> {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY absente')
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: req.messages.map((m) => ({
            role: toGeminiRole(m.role),
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: req.maxTokens ?? 800,
            temperature: req.temperature ?? 0.3,
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    )
    if (!res.ok || !res.body) {
      const err = new Error(`Gemini HTTP ${res.status} (stream)`)
      ;(err as any).quota = isQuotaError(res.status)
      throw err
    }
    return parseGeminiSSEStream(res.body)
  }
}

/**
 * Parse le flux SSE Gemini (format spécifique, différent d'OpenAI).
 * Chaque chunk : `data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}`.
 */
function parseGeminiSSEStream(body: ReadableStream<Uint8Array>): ReadableStream<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.slice(5).trim()
            if (!payload || payload === '[DONE]') continue
            try {
              const json = JSON.parse(payload)
              const parts = json?.candidates?.[0]?.content?.parts
              if (Array.isArray(parts)) {
                for (const part of parts) {
                  if (typeof part?.text === 'string' && part.text.length > 0) {
                    controller.enqueue(part.text)
                  }
                }
              }
            } catch {
              // chunk malformé : on ignore
            }
          }
        }
        controller.close()
      } catch (e) {
        controller.error(e)
      } finally {
        reader.releaseLock()
      }
    },
  })
}
