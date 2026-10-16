// GET /api/billing/kkiapay/callback — Retour utilisateur depuis le widget KKiaPay.
//
// Query : ?reference=…&transactionId=…
// IMPORTANT : on ne se fie JAMAIS au statut de l'URL, on revérifie via l'API
// KKiaPay (transactions/status) puis on redirige vers /dashboard.

import { NextRequest, NextResponse } from 'next/server'
import { finalizeKkiapayPayment, isKkiapayEnabled } from '@/lib/billing/kkiapay'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')
  const transactionId = url.searchParams.get('transactionId')

  // Base absolue : NEXT_PUBLIC_SITE_URL si défini, sinon l'origine de la requête
  // (cf. src/lib/site.ts pour l'URL canonique de prod).
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || req.nextUrl.origin
  const redirect = (payment: 'success' | 'failed') =>
    NextResponse.redirect(new URL(`/dashboard?payment=${payment}`, base))

  if (!reference || !transactionId) return redirect('failed')
  if (!isKkiapayEnabled()) return redirect('failed')

  try {
    const result = await finalizeKkiapayPayment(reference, transactionId)
    return redirect(result.status === 'approved' ? 'success' : 'failed')
  } catch (e) {
    console.error('[billing/kkiapay/callback]', e)
    return redirect('failed')
  }
}
