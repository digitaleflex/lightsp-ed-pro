// Billing — Client KKiaPay (REST natif, sans SDK tiers).
//
// Second PSP après FedaPay. Même philosophie : l'API est un REST simple, on
// l'appelle en `fetch` natif pour garder la main sur les headers, les erreurs
// et les timeouts (zéro dépendance npm supplémentaire).
//
// Docs / contrat (vérifié depuis le SDK officiel) :
//   - Sandbox : https://api-sandbox.kkiapay.me
//   - Live    : https://api.kkiapay.me
//   - Vérif   : POST {base}/api/v1/transactions/status  body { "transactionId": "..." }
//   - Refund  : POST {base}/api/v1/transactions/revert  (même body/headers)
//   - Headers : Accept: application/json,
//               X-API-KEY: <publicKey>, X-PRIVATE-KEY: <privateKey>,
//               X-SECRET-KEY: <secretKey>
//
// Environnement :
//   KKIAPAY_MODE       = sandbox | live   (défaut sandbox)
//   KKIAPAY_PUBLIC_KEY = clé publique (widget client + header X-API-KEY)
//   KKIAPAY_PRIVATE_KEY= clé privée serveur (jamais exposée)
//   KKIAPAY_SECRET_KEY = clé secrète serveur (jamais exposée)

import { db } from '@/lib/db'
import { activateSubscription } from '@/lib/billing/subscription'
import type { BillingInterval } from '@/lib/billing/plans'

export type KkiapayMode = 'sandbox' | 'live'

/** Réponse de POST /api/v1/transactions/status. */
export interface KkiapayVerifyResult {
  performed_at?: string
  type?: string // DEBIT | ...
  status: string // SUCCESS | FAILED | PENDING | DECLINED | ...
  source?: string // MOBILE_MONEY | CARD
  source_common_name?: string
  amount?: number
  fees?: number
  reason?: string
  failureCode?: string
  feeSupportedBy?: string
  income?: number
  transactionId?: string
  partnerId?: string
  client?: { fullname?: string; phone?: string; email?: string }
}

export function kkiapayMode(): KkiapayMode {
  return process.env.KKIAPAY_MODE === 'live' ? 'live' : 'sandbox'
}

export function kkiapayBaseUrl(): string {
  return kkiapayMode() === 'live'
    ? 'https://api.kkiapay.me'
    : 'https://api-sandbox.kkiapay.me'
}

export function kkiapayPublicKey(): string | null {
  return process.env.KKIAPAY_PUBLIC_KEY?.trim() || null
}

export function kkiapayPrivateKey(): string | null {
  return process.env.KKIAPAY_PRIVATE_KEY?.trim() || null
}

export function kkiapaySecretKey(): string | null {
  return process.env.KKIAPAY_SECRET_KEY?.trim() || null
}

/** KKiaPay est utilisable uniquement si les 3 clés sont configurées. */
export function isKkiapayEnabled(): boolean {
  return Boolean(kkiapayPublicKey() && kkiapayPrivateKey() && kkiapaySecretKey())
}

/** En-têtes d'authentification KKiaPay (partagés verify/revert). */
export function kkiapayAuthHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-API-KEY': kkiapayPublicKey() ?? '',
    'X-PRIVATE-KEY': kkiapayPrivateKey() ?? '',
    'X-SECRET-KEY': kkiapaySecretKey() ?? '',
  }
}

async function kkiapayFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!isKkiapayEnabled()) throw new Error('KKiaPay non configuré (clés manquantes)')

  const res = await fetch(`${kkiapayBaseUrl()}${path}`, {
    method: 'POST',
    headers: kkiapayAuthHeaders(),
    body: JSON.stringify(body),
    // KKiaPay doit répondre vite : on ne bloque pas la vérification indéfiniment.
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

  if (res.status !== 200) {
    const msg = data?.message || data?.error || data?.reason || text || res.statusText
    const err = new Error(`KKiaPay POST ${path} → ${res.status}: ${msg}`)
    ;(err as any).status = res.status
    throw err
  }
  return data as T
}

/**
 * Vérification faisant foi d'un statut de transaction.
 * Ne JAMAIS se fier au statut renvoyé dans l'URL de callback.
 * @throws si HTTP !== 200.
 */
export async function verifyKkiapayTransaction(transactionId: string): Promise<KkiapayVerifyResult> {
  const data = await kkiapayFetch<any>('/api/v1/transactions/status', { transactionId })
  // Défensif : certaines réponses sont encapsulées (data.data). On privilégie
  // l'objet qui porte déjà `status`.
  const payload = data && typeof data === 'object' && 'status' in data ? data : data?.data ?? data
  return payload as KkiapayVerifyResult
}

/** Statut KKiaPay → statut Payment interne (mêmes valeurs que FedaPay). */
export function mapKkiapayStatus(status: string): 'pending' | 'approved' | 'declined' | 'canceled' | 'expired' {
  switch (String(status).toUpperCase()) {
    case 'SUCCESS':
      return 'approved'
    case 'FAILED':
    case 'DECLINED':
      return 'declined'
    case 'CANCELED':
    case 'CANCELLED':
      return 'canceled'
    case 'EXPIRED':
      return 'expired'
    case 'PENDING':
    default:
      return 'pending'
  }
}

export interface KkiapayFinalizeResult {
  status: 'pending' | 'approved' | 'declined' | 'canceled' | 'expired' | 'invalid'
  subscriptionActivated: boolean
  planSlug?: string
  paymentId?: string
  error?: string
}

/**
 * Logique partagée verify + callback : vérifie la transaction puis met à jour le
 * Payment et active l'abonnement. Idempotent (rejouer un Payment déjà approuvé
 * ne réactive rien).
 *
 * @param tenantId optionnel : si fourni, on exige que le Payment appartienne au tenant.
 */
export async function finalizeKkiapayPayment(
  reference: string,
  transactionId: string,
  tenantId?: string
): Promise<KkiapayFinalizeResult> {
  const payment = await db.payment.findUnique({
    where: { reference },
    include: { plan: true },
  })
  if (!payment || (tenantId && payment.tenantId !== tenantId)) {
    return { status: 'invalid', subscriptionActivated: false, error: 'payment_introuvable' }
  }

  // Idempotence : déjà approuvé (verify/webhook antérieur) → ne rien refaire.
  if (payment.status === 'approved') {
    return {
      status: 'approved',
      subscriptionActivated: false,
      planSlug: payment.plan.slug,
      paymentId: payment.id,
    }
  }

  // Vérification faisant foi côté API KKiaPay.
  const verify = await verifyKkiapayTransaction(transactionId)
  const status = mapKkiapayStatus(verify.status)

  if (status !== 'approved') {
    await db.payment
      .update({
        where: { id: payment.id },
        data: { status, method: verify.source ?? payment.method },
      })
      .catch((e) => console.warn('[billing/kkiapay] maj payment échouée:', (e as Error)?.message))
    return { status, subscriptionActivated: false, planSlug: payment.plan.slug, paymentId: payment.id }
  }

  // Ne jamais faire confiance au montant déclaré côté client : le montant
  // confirmé par KKiaPay doit couvrir ce qui a été facturé.
  if (typeof verify.amount === 'number' && verify.amount < payment.amountXof) {
    await db.payment
      .update({
        where: { id: payment.id },
        data: { status: 'declined', method: verify.source ?? null },
      })
      .catch(() => {})
    return {
      status: 'declined',
      subscriptionActivated: false,
      planSlug: payment.plan.slug,
      paymentId: payment.id,
      error: 'montant_insuffisant',
    }
  }

  await db.payment
    .update({
      where: { id: payment.id },
      data: {
        status: 'approved',
        method: verify.source ?? payment.method,
        providerTransactionId: transactionId,
      },
    })
    .catch((e) => console.warn('[billing/kkiapay] maj payment échouée:', (e as Error)?.message))

  const result = await activateSubscription({
    tenantId: payment.tenantId,
    planId: payment.planId,
    interval: payment.interval as BillingInterval,
    provider: 'kkiapay',
    providerTransactionId: transactionId,
  })

  if (!result.ok) {
    return {
      status: 'approved',
      subscriptionActivated: false,
      planSlug: payment.plan.slug,
      paymentId: payment.id,
      error: result.error,
    }
  }

  return {
    status: 'approved',
    subscriptionActivated: true,
    planSlug: payment.plan.slug,
    paymentId: payment.id,
  }
}
