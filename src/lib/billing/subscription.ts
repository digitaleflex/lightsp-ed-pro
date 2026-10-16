// Billing — Cycle de vie de l'abonnement (activation idempotente).
//
// Deux chemins convergent vers `activateSubscription` :
//   1. GET  /api/billing/callback  (retour utilisateur depuis FedaPay)
//   2. POST /api/billing/webhook   (confirmation asynchrone FedaPay)
// Les deux peuvent arriver : l'activation est donc idempotente (upsert par tenant).

import { db } from '@/lib/db'
import type { BillingInterval } from '@/lib/billing/plans'
import { periodEnd } from '@/lib/billing/fedapay'

export interface ActivateInput {
  tenantId: string
  planId: string
  interval: BillingInterval
  provider: 'fedapay' | 'kkiapay'
  providerTransactionId?: string | null
  providerCustomerId?: string | null
}

/**
 * Active (ou prolonge) l'abonnement d'un tenant pour un plan donné.
 * - Si le plan et l'intervalle sont déjà actifs → prolonge simplement la période.
 * - Sinon → remplace l'abonnement courant.
 * - Marque le Payment correspondant comme `approved` (si transaction connue).
 */
export async function activateSubscription(input: ActivateInput): Promise<{
  ok: boolean
  subscriptionId?: string
  planSlug?: string
  currentPeriodEnd?: Date
  alreadyActive?: boolean
  error?: string
}> {
  const { tenantId, planId, interval, provider, providerTransactionId, providerCustomerId } = input

  try {
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) return { ok: false, error: 'Plan introuvable' }

    const now = new Date()
    const end = periodEnd(interval, now)

    // 1. Marquer le paiement comme approuvé (si on connaît la transaction)
    if (providerTransactionId) {
      await db.payment.updateMany({
        where: { providerTransactionId },
        data: { status: 'approved' },
      })
    }

    // 2. Upsert de l'abonnement du tenant
    const existing = await db.subscription.findUnique({ where: { tenantId } })
    const same =
      existing &&
      existing.planId === planId &&
      existing.interval === interval &&
      existing.status === 'active' &&
      existing.currentPeriodEnd > now

    let subscriptionId: string
    if (existing) {
      // Même plan actif → on prolonge (paiement de renouvellement)
      // Plan différent → on bascule immédiatement
      const data = {
        planId,
        interval,
        status: 'active',
        provider,
        providerCustomerId: providerCustomerId ?? existing.providerCustomerId,
        currentPeriodStart: same ? existing.currentPeriodStart : now,
        currentPeriodEnd: same && existing.currentPeriodEnd > end ? existing.currentPeriodEnd : end,
        cancelAtPeriodEnd: false,
      }
      const updated = await db.subscription.update({ where: { tenantId }, data })
      subscriptionId = updated.id
      return {
        ok: true,
        subscriptionId,
        planSlug: plan.slug,
        currentPeriodEnd: updated.currentPeriodEnd,
        alreadyActive: Boolean(same),
      }
    }

    const created = await db.subscription.create({
      data: {
        tenantId,
        planId,
        interval,
        status: 'active',
        provider,
        providerCustomerId: providerCustomerId ?? null,
        currentPeriodStart: now,
        currentPeriodEnd: end,
      },
    })
    subscriptionId = created.id

    return {
      ok: true,
      subscriptionId,
      planSlug: plan.slug,
      currentPeriodEnd: created.currentPeriodEnd,
      alreadyActive: false,
    }
  } catch (e) {
    console.error('[billing] activateSubscription:', e)
    return { ok: false, error: (e as Error)?.message ?? 'Erreur inconnue' }
  }
}

/** Abonnement actif d'un tenant, ou null. */
export async function getActiveSubscription(tenantId: string) {
  try {
    const sub = await db.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    })
    if (!sub) return null
    if (sub.status !== 'active') return sub
    if (sub.currentPeriodEnd < new Date()) {
      // Expiré côté date mais statut non mis à jour : on le signale tel quel
      return { ...sub, status: 'expired' }
    }
    return sub
  } catch (e) {
    console.warn('[billing] getActiveSubscription: DB indisponible:', (e as Error)?.message)
    return null
  }
}

/** Statut FedaPay → statut Payment interne. */
export function mapFedaPayStatus(status: string): string {
  switch (status) {
    case 'approved':
      return 'approved'
    case 'declined':
      return 'declined'
    case 'canceled':
    case 'expired':
      return status
    case 'refunded':
      return 'refunded'
    case 'pending':
    default:
      return 'pending'
  }
}
