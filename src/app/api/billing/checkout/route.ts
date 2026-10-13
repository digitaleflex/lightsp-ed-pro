// POST /api/billing/checkout — Crée une transaction FedaPay et renvoie l'URL de paiement.
//
// Body : { planSlug: string, interval?: 'monthly' | 'annual' }
// Réponse : { url: string, paymentId: string, reference: string }
// Erreurs : 401 (non connecté), 400 (plan invalide), 503 (FedaPay non configuré)
//
// Flux :
//   1. session NextAuth → tenantId
//   2. charge le plan depuis la DB (prix FCFA)
//   3. crée un Payment (status pending)
//   4. crée la transaction FedaPay → token → URL
//   5. met à jour le Payment avec providerTransactionId
//   6. le client redirige vers l'URL FedaPay

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPlanBySlug, ensureDefaultPlans, effectivePrice, type BillingInterval } from '@/lib/billing/plans'
import { isFedapayEnabled, createTransaction, createPaymentUrl, fedapayMode } from '@/lib/billing/fedapay'
import { RATE_POLICIES, checkRate } from '@/lib/rate-limit'

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

    // --- Rate-limit (anti-spam checkout) ----------------------------------
    const policy = RATE_POLICIES.checkout
    const rate = await checkRate(req, 'checkout', policy.max, policy.windowMs)
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Trop de tentatives de paiement', retryAfterSec: rate.retryAfterSec },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      )
    }

    // --- Config FedaPay ----------------------------------------------------
    if (!isFedapayEnabled()) {
      return NextResponse.json(
        {
          error: 'Paiement en ligne indisponible pour le moment.',
          hint: 'Configure FEDAPAY_SECRET_KEY (et FEDAPAY_MODE) dans les variables d’env.',
        },
        { status: 503 }
      )
    }

    // --- Body --------------------------------------------------------------
    const body = await req.json().catch(() => ({}))
    const planSlug: string = typeof body?.planSlug === 'string' ? body.planSlug : ''
    const interval: BillingInterval = body?.interval === 'annual' ? 'annual' : 'monthly'

    if (!planSlug) {
      return NextResponse.json({ error: 'planSlug requis' }, { status: 400 })
    }

    let plan = await getPlanBySlug(planSlug)
    if (!plan) {
      return NextResponse.json({ error: 'Plan inconnu' }, { status: 400 })
    }
    // Le Payment référencera planId → il faut une vraie ligne en DB
    if (plan.id.startsWith('default:')) {
      await ensureDefaultPlans()
      plan = await getPlanBySlug(planSlug)
    }
    if (!plan || plan.id.startsWith('default:')) {
      return NextResponse.json(
        { error: 'Plans non initialisés en base (lancer ensureDefaultPlans ou seed).' },
        { status: 503 }
      )
    }
    if (plan.priceXof === 0) {
      return NextResponse.json(
        { error: 'Ce plan est gratuit — pas de paiement nécessaire.' },
        { status: 400 }
      )
    }

    const amount = effectivePrice(plan, interval)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    // --- Payment (pending) --------------------------------------------------
    const reference = `VLC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`

    const payment = await db.payment.create({
      data: {
        tenantId,
        planId: plan.id,
        reference,
        amountXof: amount,
        currency: 'XOF',
        interval,
        status: 'pending',
      },
    })

    // --- Transaction FedaPay -------------------------------------------------
    const base =
      process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
      process.env.APP_URL?.replace(/\/$/, '') ||
      new URL(req.url).origin
    const callbackUrl = `${base}/api/billing/callback?ref=${encodeURIComponent(reference)}`

    const [firstname, ...rest] = email.split('@')[0].split(/[._\-+]+/)
    const customer = {
      firstname: firstname || 'Client',
      lastname: rest.join(' ') || 'Velocita',
      email,
    }

    const tx = await createTransaction({
      description: `Velocita ${plan.name} — ${
        interval === 'annual' ? 'annuel' : 'mensuel'
      } (${amount} FCFA)`,
      amount,
      callbackUrl,
      merchantReference: reference,
      customer,
      metadata: {
        tenantId,
        planSlug: plan.slug,
        interval,
        paymentId: payment.id,
      },
    })

    await db.payment
      .update({
        where: { id: payment.id },
        data: { providerTransactionId: String(tx.id) },
      })
      .catch((e) => console.warn('[checkout] maj transactionId échouée:', (e as Error)?.message))

    const url = await createPaymentUrl(tx.id)

    return NextResponse.json({
      url,
      paymentId: payment.id,
      reference,
      amount,
      currency: 'XOF',
      mode: fedapayMode(),
    })
  } catch (e) {
    console.error('[billing/checkout]', e)
    return NextResponse.json(
      { error: 'Impossible de démarrer le paiement. Réessaie dans un instant.' },
      { status: 502 }
    )
  }
}
