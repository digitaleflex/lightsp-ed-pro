// M0-5 + M7-1 — Observabilité des appels IA.
//
// GET /api/admin/ai-stats?days=7   → agrégats par provider/capability
// GET /api/admin/ai-stats?days=30&daily=1 → usage quotidien par provider
// GET /api/admin/ai-stats?days=7&flags=1 → feature flags courants
//
// Auth requise : session NextAuth + email dans liste blanche admin (voir ADMIN_EMAILS).
// Sert de source de données au dashboard admin (M7-1) et au monitoring quotas.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAIStats, getAIDailyUsage } from '@/lib/ai/telemetry'
import { listFlags } from '@/lib/feature-flags'

// Liste blanche admin (à étendre via .env ADMIN_EMAILS, séparée par virgules)
function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const allow = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allow.includes(email.toLowerCase())
}

async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  const email = (session as any)?.user?.email
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const url = new URL(req.url)
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get('days') ?? 7)))
    const wantDaily = url.searchParams.get('daily') === '1'
    const wantFlags = url.searchParams.get('flags') === '1'

    const payload: Record<string, unknown> = { days }

    if (wantDaily) {
      payload.daily = await getAIDailyUsage(Math.min(90, days))
    } else {
      payload.stats = await getAIStats(days)
    }

    if (wantFlags) {
      payload.flags = listFlags()
    }

    return NextResponse.json({ success: true, ...payload })
  } catch (e) {
    console.error('[admin/ai-stats]', e)
    return NextResponse.json({ error: 'Erreur lecture stats IA' }, { status: 500 })
  }
}
