// POST /api/billing/kkiapay/checkout — Crée un Payment KKiaPay (pending).
//
// Body : { planSlug: string, interval?: 'monthly' | 'annual' }
// Réponse : { reference, amountXof, currency: 'XOF', publicKey, sandbox, callback }
//
// Flux (le widget KKiaPay est monté côté client avec ces valeurs) :
//   1. session NextAuth → tenantId
//   2. charge le plan depuis la DB (prix FCFA)
//   3. crée un Payment (provider=kkiapay, status=pending)
//   4. renvoie la référence + la clé publique + l'URL de callback
//   → le client ouvre openKkiapayWidget(...) puis appelle /verify.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPlanBySlug, ensureDefaultPlans, effectivePrice } from '@/lib/billing/plans'
import { isKkiapayEnabled, kkiapayPublicKey, kkiapayMode } from '@/lib/billing/kkiapay'
import { RATE_POLICIES, checkRate } from '@/lib/rate-limit'

const BodySchema = z.object({
  planSlug: z.string().min(1),
  interval: z.enum(['monthly', 'annual']).default('monthly'),
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

    // --- Rate-limit (anti-spam checkout) ----------------------------------
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
        {
          error: 'Paiement en ligne indisponible pour le moment.',
          hint: 'Configure KKIAPAY_PUBLIC_KEY, KKIAPAY_PRIVATE_KEY et KKIAPAY_SECRET_KEY (et KKIAPAY_MODE).',
        },
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
    const { planSlug, interval } = parsed.data

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
    const reference = `kkp_${randomUUID().replace(/-/g, '').slice(0, 10)}`

    await db.payment.create({
      data: {
        tenantId,
        planId: plan.id,
        provider: 'kkiapay',
        reference,
        amountXof: amount,
        currency: 'XOF',
        interval,
        status: 'pending',
      },
    })

    return NextResponse.json({
      reference,
      amountXof: amount,
      currency: 'XOF',
      publicKey: kkiapayPublicKey(),
      sandbox: kkiapayMode() !== 'live',
      callback: '/api/billing/kkiapay/callback',
    })
  } catch (e) {
    console.error('[billing/kkiapay/checkout]', e)
    return NextResponse.json(
      { error: 'Impossible de démarrer le paiement. Réessaie dans un instant.' },
      { status: 502 }
    )
  }
}
