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
}
