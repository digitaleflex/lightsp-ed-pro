// GET /api/billing/subscription — Abonnement courant du tenant connecté.
//
// Réponse : { subscription: {...} | null, plan: PlanView | null }
// Public : session requise. Sert au dashboard et aux tests manuels.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getActiveSubscription } from '@/lib/billing/subscription'
import { getPlanBySlug } from '@/lib/billing/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = (session as { user?: { email?: string } })?.user?.email
  if (!email) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }
  const tenantId = (session as { tenantId?: string })?.tenantId
  if (!tenantId) {
    return NextResponse.json({ subscription: null, plan: null })
  }

  try {
    const sub = await getActiveSubscription(tenantId)
    if (!sub) {
      // Pas d'abonnement → plan gratuit par défaut
      const free = await getPlanBySlug('decouverte')
      return NextResponse.json({ subscription: null, plan: free })
    }
    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        interval: sub.interval,
        provider: sub.provider,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      },
      plan: {
        slug: sub.plan.slug,
        name: sub.plan.name,
        priceXof: sub.plan.priceXof,
        currency: sub.plan.currency,
      },
    })
  } catch (e) {
    console.error('[billing/subscription]', e)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
