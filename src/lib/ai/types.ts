// Types du système de providers IA de Vélocita.
// L'API publique historique (AiReportInput / AiResult) vit ici pour rester
// ré-exportée par la façade src/lib/ai.ts.

/** Capacités qu'un provider peut exposer. Seul `chat` est utilisé en M0. */
export type AICapability = 'chat' | 'vision' | 'embed' | 'asr' | 'tts' | 'image'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
}

export interface ChatResponse {
  text: string
  model: string
  provider: string
}

export interface AIProvider {
  name: 'groq' | 'gemini' | 'openrouter' | 'zai'
  capabilities: AICapability[]
  chat(req: ChatRequest): Promise<ChatResponse>
}

// ─── Rapport d'audit (API publique historique) ────────────────────────────────

export interface AiReportInput {
  url: string
  device: string
  source: string
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  lcp: number
  fcp: number
  tbt: number
  cls: number
  si: number
  ttfb: number
  totalWeight: number
  recommendations: { title: string; description: string; impact: string }[]
}

export interface AiResult {
  summary: string
  model: string // "groq/openai/gpt-oss-20b", "gemini/gemini-2.5-flash-lite", ...
}

// ─── Capacités additionnelles — à activer dans M2 / M3 / M4 ───────────────────
// Interfaces déjà prêtes pour les issues futures ; non utilisées en M0.

/** M2 — analyse d'images. */
export interface VisionRequest {
  prompt: string
  imageUrls: string[]
}
export interface VisionResponse {
  text: string
  model: string
  provider: string
}

/** M3 — embeddings. */
export interface EmbedRequest {
  input: string[]
  model?: string
}
export interface EmbedResponse {
  embeddings: number[][]
  model: string
  provider: string
}

/** M4 — audio (ASR + TTS). */
export interface AudioRequest {
  kind: 'asr' | 'tts'
  /** ASR : audio encodé base64. */
  audioBase64?: string
  /** TTS : texte à synthétiser. */
  text?: string
  voice?: string
}
export interface AudioResponse {
  /** TTS : audio encodé base64. ASR : transcription. */
  data: string
  model: string
  provider: string
}

/** M4 — génération d'images. */
export interface ImageRequest {
  prompt: string
  size?: string
}
export interface ImageResponse {
  imagesBase64: string[]
  model: string
  provider: string
}
