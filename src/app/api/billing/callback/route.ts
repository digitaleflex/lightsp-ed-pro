// GET /api/billing/callback — Retour utilisateur depuis la page de paiement FedaPay.
//
// FedaPay appelle `callback_url` avec ses propres paramètres (?id=…&status=…).
// On a ajouté `?ref=VLC-…` pour retrouver notre Payment sans dépendre du format
// de callback. IMPORTANT : on ne se fie JAMAIS au statut de l'URL (docs FedaPay),
// on revérifie via GET /v1/transactions/{id}.
//
// Redirige vers /dashboard avec un indicateur (?billing=…).

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTransaction, isFedapayEnabled } from '@/lib/billing/fedapay'
import { activateSubscription, mapFedaPayStatus } from '@/lib/billing/subscription'
import type { BillingInterval } from '@/lib/billing/plans'

export const dynamic = 'force-dynamic'

function redirect(query: Record<string, string>): NextResponse {
  const params = new URLSearchParams(query)
  return NextResponse.redirect(new URL(`/dashboard?${params.toString()}`, process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const ref = url.searchParams.get('ref')
  if (!ref) return redirect({ billing: 'invalid' })

  try {
    const payment = await db.payment.findUnique({
      where: { reference: ref },
      include: { plan: true },
    })
    if (!payment) return redirect({ billing: 'invalid' })

    // Déjà traité (webhook arrivé avant le callback) → état courant
    if (payment.status === 'approved') {
      return redirect({ billing: 'success', plan: payment.plan.slug })
    }

    if (!isFedapayEnabled() || !payment.providerTransactionId) {
      // Pas encore vérifiable : on laisse le webhook faire le travail
      return redirect({ billing: 'pending', plan: payment.plan.slug })
    }

    // Vérification faisant foi côté API
    const tx = await getTransaction(payment.providerTransactionId)
    const status = mapFedaPayStatus(tx.status)

    if (status !== 'approved') {
      await db.payment.update({ where: { id: payment.id }, data: { status } }).catch(() => {})
      return redirect({
        billing: status === 'declined' ? 'declined' : status === 'canceled' ? 'canceled' : 'pending',
        plan: payment.plan.slug,
      })
    }

    const result = await activateSubscription({
      tenantId: payment.tenantId,
      planId: payment.planId,
      interval: payment.interval as BillingInterval,
      provider: 'fedapay',
      providerTransactionId: payment.providerTransactionId,
    })

    if (!result.ok) {
      console.error('[billing/callback] activation échouée:', result.error)
      return redirect({ billing: 'pending', plan: payment.plan.slug })
    }

    return redirect({ billing: 'success', plan: payment.plan.slug })
  } catch (e) {
    console.error('[billing/callback]', e)
    return redirect({ billing: 'pending' })
  }
}
