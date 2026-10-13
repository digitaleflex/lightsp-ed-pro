// GET /api/plans — Plans tarifaires publics (pricing page).
//
// Source : table `Plan` (éditable via l'admin). Fallback : DEFAULT_PLANS.
// Public : aucune auth requise (la pricing page est anonyme).
// Sert aussi de seed lazy : si la table est vide, on la remplit une fois.

import { NextResponse } from 'next/server'
import { getPlans, ensureDefaultPlans } from '@/lib/billing/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let plans = await getPlans()
    if (plans.length === 0 || plans.every((p) => p.id.startsWith('default:'))) {
      // Table vide (ou DB down) : tenter un seed une seule fois
      const seeded = await ensureDefaultPlans()
      if (seeded.created > 0) plans = await getPlans()
    }
    return NextResponse.json({ plans })
  } catch (e) {
    console.error('[api/plans]', e)
    return NextResponse.json({ error: 'Plans indisponibles' }, { status: 500 })
  }
}
