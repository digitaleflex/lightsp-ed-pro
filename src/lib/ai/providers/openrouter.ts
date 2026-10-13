// Provider OpenRouter — API compatible OpenAI (modèles gratuits :free).
import type { AICapability, AIProvider, ChatRequest, ChatResponse } from '../types'
import { isQuotaError } from '../utils'

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemma-4-31b-it:free'
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 60_000)

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter' as const
  readonly capabilities: AICapability[] = ['chat']

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const key = process.env.OPENROUTER_API_KEY
    if (!key) throw new Error('OPENROUTER_API_KEY absente')
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.SITE_URL ?? 'http://localhost:3000',
        'X-Title': 'Vélocita',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: req.messages,
        max_tokens: req.maxTokens ?? 800,
        temperature: req.temperature ?? 0.3,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      const err = new Error(`OpenRouter HTTP ${res.status}`)
      ;(err as any).quota = isQuotaError(res.status)
      throw err
    }
    const data: any = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('OpenRouter : réponse vide')
    return { text, model: OPENROUTER_MODEL, provider: 'openrouter' }
  }
}
