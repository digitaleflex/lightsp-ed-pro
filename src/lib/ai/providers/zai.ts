// Provider Z.ai — via le SDK z-ai-web-dev-sdk (cf. src/lib/zai.ts).
import type { AICapability, AIProvider, ChatRequest, ChatResponse } from '../types'
import { isQuotaError } from '../utils'
import { getZai, ZAI_MODEL } from '@/lib/zai'

export class ZaiProvider implements AIProvider {
  readonly name = 'zai' as const
  readonly capabilities: AICapability[] = ['chat']

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const client = await getZai()
    // Fallback gracieux : pas de clé → on laisse la chaîne essayer les autres providers.
    if (!client) throw new Error('ZAI_API_KEY absente')
    try {
      const completion: any = await client.chat.completions.create({
        messages: req.messages,
        max_tokens: req.maxTokens ?? 800,
        temperature: req.temperature ?? 0.3,
      })
      const text = completion?.choices?.[0]?.message?.content?.trim()
      if (!text) throw new Error('Z.ai : réponse vide')
      return { text, model: ZAI_MODEL, provider: 'zai' }
    } catch (e: any) {
      // Le SDK lève « API request failed with status 429: ... » → on expose le quota.
      const status = Number(/status (\d+)/.exec(e?.message ?? '')?.[1])
      if (Number.isFinite(status)) (e as any).quota = isQuotaError(status)
      throw e
    }
  }
}
