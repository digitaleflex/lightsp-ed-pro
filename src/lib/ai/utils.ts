/** Helpers partagés entre providers. */

/** Détecte un échec de quota / limite (partagé par tous les providers). */
export function isQuotaError(status: number): boolean {
  return status === 429 || status === 402 || status === 403
}

/**
 * Parse un flux SSE OpenAI-compatible en un ReadableStream de chunks texte.
 * Utilisable par tous les providers compatibles OpenAI (Groq, OpenRouter, etc.).
 *
 * Format attendu :
 *   data: {"choices":[{"delta":{"content":"..."}}]}\n\n
 *   data: [DONE]\n\n
 */
export function parseSSEStream(body: ReadableStream<Uint8Array>): ReadableStream<string> {
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
          // Traite les lignes SSE complètes
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? '' // garde le dernier fragment incomplet
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.slice(5).trim()
            if (payload === '[DONE]') {
              controller.close()
              return
            }
            try {
              const json = JSON.parse(payload)
              const delta = json?.choices?.[0]?.delta?.content
              if (typeof delta === 'string' && delta.length > 0) {
                controller.enqueue(delta)
              }
            } catch {
              // chunk malformé : on ignore (peut arriver avec des keep-alive)
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
