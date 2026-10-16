// POST /api/billing/kkiapay/verify — Vérifie une transaction KKiaPay et active l'abonnement.
//
// Body : { reference: string, transactionId: string }
// Réponse : { status, subscriptionActivated }
//
// Sécurité : le statut/montant ne viennent JAMAIS du client → on revérifie via
// l'API KKiaPay (transactions/status). L'activation est idempotente (voir
// finalizeKkiapayPayment) : rejouer un Payment déjà approuvé ne réactive rien.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { finalizeKkiapayPayment, isKkiapayEnabled } from '@/lib/billing/kkiapay'
import { RATE_POLICIES, checkRate } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  reference: z.string().min(1),
  transactionId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    // --- Auth -------------------------------------------------------------
    const session = await getServerSession(authOptions)
    const email = (session as { user?: { email?: string } })?.user?.email
    const tenantId = (session as { tenantId?: string })?.tenantId
    if (!email) {
      return NextResponse.json(
        { error: 'Connexion requise', redirectTo: '/connexion?callbackUrl=/tarifs' },
        { status: 401 }
      )
    }
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Compte non initialisé, recharge la page et réessaie.' },
        { status: 409 }
      )
    }

    // --- Rate-limit -------------------------------------------------------
    const policy = RATE_POLICIES.checkout
    const rate = await checkRate(req, 'checkout', policy.max, policy.windowMs)
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Trop de tentatives de paiement', retryAfterSec: rate.retryAfterSec },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      )
    }

    // --- Config KKiaPay ----------------------------------------------------
    if (!isKkiapayEnabled()) {
      return NextResponse.json(
        { error: 'Paiement en ligne indisponible pour le moment.' },
        { status: 503 }
      )
    }

    // --- Body --------------------------------------------------------------
    const raw = await req.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Body invalide', issues: parsed.error.issues },
        { status: 400 }
      )
    }
    const { reference, transactionId } = parsed.data

    const result = await finalizeKkiapayPayment(reference, transactionId, tenantId)
    if (result.status === 'invalid') {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      status: result.status,
      subscriptionActivated: result.subscriptionActivated,
    })
  } catch (e) {
    console.error('[billing/kkiapay/verify]', e)
    return NextResponse.json(
      { error: 'Vérification du paiement impossible. Réessaie dans un instant.' },
      { status: 502 }
    )
  }
}
