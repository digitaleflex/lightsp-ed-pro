// POST /api/billing/webhook — Confirmation asynchrone FedaPay.
//
// Événements notifiables : transaction.approved | .declined | .canceled | ...
// Configuration : dashboard FedaPay → Webhooks → URL = {APP_URL}/api/billing/webhook
//
// Sécurité (3 niveaux, cumulatifs) :
//   1. Signature `X-FEDAPAY-SIGNATURE` si FEDAPAY_WEBHOOK_SECRET est défini.
//   2. Re-vérification du statut via GET /v1/transactions/{id} (jamais le payload).
//   3. Idempotence : l'activation est un upsert par tenant.
//
// ⚠️ Le format de signature et le schéma exact du payload ne sont pas publiés
// officiellement : le parsing ci-dessous est défensif (on tolère plusieurs
// emplacements pour l'ID de transaction).

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  getTransaction,
  isFedapayEnabled,
  verifyWebhookSignature,
} from '@/lib/billing/fedapay'
import { activateSubscription, mapFedaPayStatus } from '@/lib/billing/subscription'
import type { BillingInterval } from '@/lib/billing/plans'

export const dynamic = 'force-dynamic'

/** Extrait l'ID de transaction FedaPay quel que soit l'emplatement du payload. */
function extractTransactionId(body: any): string | null {
  const candidates = [
    body?.transaction?.id,
    body?.event?.data?.id,
    body?.event?.transaction?.id,
    body?.data?.id,
    body?.data?.transaction?.id,
    body?.id,
  ]
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).length > 0) return String(c)
  }
  return null
}

export async function POST(req: NextRequest) {
  const raw = await req.text()

  // 1. Signature (si un secret est configuré)
  const sig = req.headers.get('x-fedapay-signature')
  const check = verifyWebhookSignature(raw, sig)
  if (!check.ok && check.reason !== 'webhook_secret_absent') {
    console.warn('[billing/webhook] signature rejetée:', check.reason)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }
  if (check.reason === 'webhook_secret_absent') {
    console.warn('[billing/webhook] FEDAPAY_WEBHOOK_SECRET absent — signature non vérifiée (recommandé)')
  }

  if (!isFedapayEnabled()) {
    return NextResponse.json({ error: 'FedaPay non configuré' }, { status: 503 })
  }

  // 2. Parsing défensif du payload
  let body: any
  try {
    body = JSON.parse(raw || '{}')
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const txId = extractTransactionId(body)
  if (!txId) {
    // On répond 200 pour éviter les retries inutiles sur les événements non liés
    console.warn('[billing/webhook] aucun ID transaction dans le payload:', raw.slice(0, 300))
    return NextResponse.json({ received: true })
  }

  try {
    // 3. Vérification faisant foi
    const tx = await getTransaction(txId)
    const reference = tx.merchant_reference
    if (!reference) return NextResponse.json({ received: true })

    const payment = await db.payment.findUnique({
      where: { reference },
      include: { plan: true },
    })
    if (!payment) return NextResponse.json({ received: true, note: 'payment inconnu' })

    const status = mapFedaPayStatus(tx.status)
    await db.payment
      .update({ where: { id: payment.id }, data: { status } })
      .catch((e) => console.warn('[billing/webhook] maj payment:', (e as Error)?.message))

    if (status === 'approved') {
      const result = await activateSubscription({
        tenantId: payment.tenantId,
        planId: payment.planId,
        interval: payment.interval as BillingInterval,
        provider: 'fedapay',
        providerTransactionId: txId,
      })
      console.log(
        `[billing/webhook] activation ${result.ok ? 'OK' : 'ÉCHEC'} tenant=${payment.tenantId} plan=${payment.plan.slug}`
      )
      if (!result.ok) {
        // 500 → FedaPay retry : c'est le comportement voulu si l'écriture échoue
        return NextResponse.json({ error: result.error ?? 'activation échouée' }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true, status })
  } catch (e) {
    console.error('[billing/webhook]', e)
    // 500 → retry automatique FedaPay (traitements transitoires)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }
}
