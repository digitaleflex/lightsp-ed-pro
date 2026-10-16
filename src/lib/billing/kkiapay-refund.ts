// Billing — Remboursement KKiaPay (endpoint REST `transactions/revert`).
//
// Optionnel : la surface de remboursement n'est pas encore branchée côté UI.
// @see POST {base}/api/v1/transactions/revert  body { "transactionId": "..." }

import { isKkiapayEnabled, kkiapayAuthHeaders, kkiapayBaseUrl } from '@/lib/billing/kkiapay'

export interface KkiapayRefundResult {
  [key: string]: unknown
}

/**
 * Revert d'une transaction KKiaPay (remboursement).
 * @throws si KKiaPay n'est pas configuré ou si HTTP !== 200.
 */
export async function refundKkiapayTransaction(
  transactionId: string
): Promise<KkiapayRefundResult> {
  if (!isKkiapayEnabled()) throw new Error('KKiaPay non configuré (clés manquantes)')

  const res = await fetch(`${kkiapayBaseUrl()}/api/v1/transactions/revert`, {
    method: 'POST',
    headers: kkiapayAuthHeaders(),
    body: JSON.stringify({ transactionId }),
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
    const err = new Error(`KKiaPay revert ${transactionId} → ${res.status}: ${msg}`)
    ;(err as any).status = res.status
    throw err
  }
  return data as KkiapayRefundResult
}
