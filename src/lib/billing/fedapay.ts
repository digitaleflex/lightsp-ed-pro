// Billing — Client FedaPay (REST, sans SDK tiers).
//
// Pourquoi fetch plutôt que le package npm `fedapay` : l'API est un REST simple,
// l'auth est un Bearer token, et éviter une dépendance = moins de surface à
// auditer. On garde la main sur les headers, les erreurs et les timeouts.
//
// Docs : https://docs.fedapay.com/
//   - Sandbox : https://sandbox-api.fedapay.com/v1
//   - Live    : https://api.fedapay.com/v1
//   - Auth    : Authorization: Bearer <secret key>
//   - Devise  : XOF uniquement pour les transactions (FCFA)
//
// Environnement :
//   FEDAPAY_MODE           = sandbox | live            (défaut sandbox)
//   FEDAPAY_SECRET_KEY     = clé secrète (jamais exposée au client)
//   FEDAPAY_WEBHOOK_SECRET = endpoint secret (optionnel, vérif de signature)
//   FEDAPAY_CALLBACK_URL   = URL absolue de /api/billing/callback

import { createHmac, timingSafeEqual } from 'crypto'

export type FedaPayMode = 'sandbox' | 'live'

export interface FedaPayTransactionInput {
  description: string
  /** Montant entier en XOF (pas de décimales). */
  amount: number
  callbackUrl: string
  merchantReference: string
  customer?: {
    firstname: string
    lastname: string
    email: string
    phone_number?: { number: string; country: string }
  }
  metadata?: Record<string, string>
}

export interface FedaPayTransaction {
  id: number
  status: string // pending | approved | declined | canceled | refunded | expired | transferred
  amount: number
  currency?: { iso?: string }
  description?: string
  merchant_reference?: string
  payment_method?: string | null
}

export function fedapayMode(): FedaPayMode {
  return process.env.FEDAPAY_MODE === 'live' ? 'live' : 'sandbox'
}

export function fedapaySecretKey(): string | null {
  return process.env.FEDAPAY_SECRET_KEY?.trim() || null
}

/** FedaPay est utilisable uniquement si une clé secrète est configurée. */
export function isFedapayEnabled(): boolean {
  return Boolean(fedapaySecretKey())
}

function baseUrl(): string {
  return fedapayMode() === 'live'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1'
}

async function fedaFetch<T>(
  path: string,
  init: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown } = { method: 'GET' }
): Promise<T> {
  const key = fedapaySecretKey()
  if (!key) throw new Error('FEDAPAY_SECRET_KEY manquante')

  const res = await fetch(`${baseUrl()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    // FedaPay doit répondre vite : on ne bloque pas le checkout indéfiniment.
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  })

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    const msg =
      data?.message || data?.error_description || data?.error || text || res.statusText
    const err = new Error(`FedaPay ${init.method} ${path} → ${res.status}: ${msg}`)
    ;(err as any).status = res.status
    throw err
  }
  return data as T
}

/**
 * Étape 1 — crée la transaction de paiement.
 * @see POST /v1/transactions
 */
export async function createTransaction(
  input: FedaPayTransactionInput
): Promise<FedaPayTransaction> {
  const body: Record<string, unknown> = {
    description: input.description,
    amount: Math.round(input.amount),
    currency: { iso: 'XOF' },
    callback_url: input.callbackUrl,
    merchant_reference: input.merchantReference,
    custom_metadata: input.metadata ?? {},
  }
  if (input.customer) body.customer = input.customer
  return fedaFetch<FedaPayTransaction>('/transactions', { method: 'POST', body })
}

/**
 * Étape 2 — génère l'URL de la page de paiement (token).
 * @see POST /v1/transactions/{id}/token
 */
export async function createPaymentUrl(transactionId: number | string): Promise<string> {
  const data = await fedaFetch<any>(`/transactions/${transactionId}/token`, {
    method: 'POST',
    body: {},
  })
  const url: string | undefined =
    data?.token?.url ?? data?.url ?? data?.payment_url ?? data?.data?.token?.url
  if (!url) throw new Error(`FedaPay: URL de paiement absente dans la réponse (${JSON.stringify(data)})`)
  return url
}

/**
 * Vérification faisant foi d'un statut de transaction.
 * Les docs FedaPay insistent : ne JAMAIS se fier au statut de l'URL callback.
 * @see GET /v1/transactions/{id}
 */
export async function getTransaction(id: number | string): Promise<FedaPayTransaction> {
  return fedaFetch<FedaPayTransaction>(`/transactions/${id}`, { method: 'GET' })
}

/** Vérifie la signature webhook `X-FEDAPAY-SIGNATURE` (HMAC-SHA256). */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSec = 300
): { ok: boolean; reason?: string } {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET?.trim()
  if (!secret) {
    // Pas de secret configuré : on n'a pas pu vérifier. L'appelant doit alors
    // confirmer le statut via l'API (ce que le handler fait de toute façon).
    return { ok: false, reason: 'webhook_secret_absent' }
  }
  if (!signatureHeader) return { ok: false, reason: 'header_absent' }

  // Format communauté : t=<unix_ts>,s=<hex>  (algorithme non publié officiellement)
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const i = kv.indexOf('=')
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()]
    })
  )
  const ts = Number(parts.t)
  const sig = parts.s ?? ''
  if (!Number.isFinite(ts) || !sig) return { ok: false, reason: 'format_invalide' }

  if (Math.abs(Date.now() / 1000 - ts) > toleranceSec) {
    return { ok: false, reason: 'timestamp_hors_tolerance' }
  }

  const expected = createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(sig, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: 'signature_invalide' }
  }
  return { ok: true }
}

/** Détermine la période de fin d'abonnement selon l'intervalle. */
export function periodEnd(interval: 'monthly' | 'annual', from = new Date()): Date {
  const d = new Date(from)
  if (interval === 'annual') d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  return d
}
