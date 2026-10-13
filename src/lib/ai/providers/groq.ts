// Provider Groq — API compatible OpenAI (offre gratuite).
import type { AICapability, AIProvider, ChatRequest, ChatResponse } from '../types'
import { isQuotaError, parseSSEStream } from '../utils'

const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-20b'
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 60_000)

export class GroqProvider implements AIProvider {
  readonly name = 'groq' as const
  readonly capabilities: AICapability[] = ['chat']

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error('GROQ_API_KEY absente')
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: req.messages,
        max_tokens: req.maxTokens ?? 800,
        temperature: req.temperature ?? 0.3,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      const err = new Error(`Groq HTTP ${res.status}`)
      ;(err as any).quota = isQuotaError(res.status)
      throw err
    }
    const data: any = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('Groq : réponse vide')
    return { text, model: GROQ_MODEL, provider: 'groq' }
  }

  /**
   * Streaming SSE : renvoie un ReadableStream de chunks texte.
   * Format Groq/OpenAI : `data: {"choices":[{"delta":{"content":"..."}}]}\n\n`.
   */
  async chatStream(req: Omit<ChatRequest, 'stream'>): Promise<ReadableStream<string>> {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error('GROQ_API_KEY absente')
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: req.messages,
        max_tokens: req.maxTokens ?? 800,
        temperature: req.temperature ?? 0.3,
        stream: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok || !res.body) {
      const err = new Error(`Groq HTTP ${res.status} (stream)`)
      ;(err as any).quota = isQuotaError(res.status)
      throw err
    }
    return parseSSEStream(res.body)
  }
}
