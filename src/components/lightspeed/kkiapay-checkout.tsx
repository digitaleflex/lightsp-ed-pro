'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { BillingInterval } from '@/lib/billing/catalog'

export interface KkiapayCheckoutProps {
  planSlug: string
  planName: string
  interval: BillingInterval
  /** Texte du bouton. Défaut : "Payer par Mobile Money / Carte (KKiaPay)". */
  label?: string
  className?: string
  disabled?: boolean
}

type Status = 'idle' | 'loading' | 'verifying'

/** Réponse contratée de POST /api/billing/kkiapay/checkout (champs validés avant usage). */
interface CheckoutApiResponse {
  reference?: unknown
  amountXof?: unknown
  currency?: unknown
  publicKey?: unknown
  sandbox?: unknown
  callback?: unknown
  error?: unknown
  redirectTo?: unknown
}

interface VerifyApiResponse {
  status?: unknown
  subscriptionActivated?: unknown
  error?: unknown
}

/** Réponse du listener "success" KKiaPay — l'id vient d'ici, jamais de l'URL. */
interface KkiapaySuccessResponse {
  transactionId?: unknown
  transaction_id?: unknown
}

interface KkiapayWidgetOptions {
  amount: number
  key: string
  callback: string
  sandbox: boolean
  partnerId: string
  reason: string
}

declare global {
  interface Window {
    openKkiapayWidget?: (options: KkiapayWidgetOptions) => void
    addKkiapayListener?: (
      event: 'success' | 'failed',
      handler: (response: KkiapaySuccessResponse) => void,
    ) => void
  }
}

const KKIAPAY_CDN_URL = 'https://cdn.kkiapay.me/k.js'
const DEFAULT_LABEL = 'Payer par Mobile Money / Carte (KKiaPay)'

/** Charge le script KKiaPay une seule fois (balise unique, en fin de <body>). */
let kkiapayScriptPromise: Promise<void> | null = null

function loadKkiapayScript(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Paiement indisponible sur cet appareil.'))
  }
  if (
    typeof window.openKkiapayWidget === 'function' &&
    typeof window.addKkiapayListener === 'function'
  ) {
    return Promise.resolve()
  }
  if (kkiapayScriptPromise) return kkiapayScriptPromise
  kkiapayScriptPromise = new Promise<void>((resolve, reject) => {
    const fail = () => {
      kkiapayScriptPromise = null
      reject(new Error('Paiement indisponible sur cet appareil.'))
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${KKIAPAY_CDN_URL}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', fail, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = KKIAPAY_CDN_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = fail
    // Doc KKiaPay : balise script unique, juste avant </body>.
    document.body.appendChild(script)
  })
  return kkiapayScriptPromise
}

/** Le widget exige une URL de callback absolue. */
function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

function errorMessage(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

/**
 * Option de paiement KKiaPay (Mobile Money MTN/Moov + carte Visa/Mastercard, XOF).
 * Secondaire : le flux FedaPay existant reste le CTA primaire, inchangé.
 * Si le backend répond 503 (KKiaPay non configuré), l'option devient invisible.
 */
export function KkiapayCheckout({
  planSlug,
  planName,
  interval,
  label,
  className,
  disabled = false,
}: KkiapayCheckoutProps) {
  const router = useRouter()
  const [status, setStatus] = React.useState<Status>('idle')
  const [error, setError] = React.useState<string | null>(null)
  const [unavailable, setUnavailable] = React.useState(false)
  /** Évite qu'un listener d'une tentative précédente traite le paiement en cours. */
  const attemptRef = React.useRef(0)

  const busy = status !== 'idle'

  const verifyAndRedirect = React.useCallback(
    async (reference: string, transactionId: string) => {
      setStatus('verifying')
      setError(null)
      try {
        const res = await fetch('/api/billing/kkiapay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, transactionId }),
        })
        const data = (await res.json().catch(() => ({}))) as VerifyApiResponse

        if (res.status === 401) {
          router.push('/connexion?callbackUrl=/tarifs')
          return
        }
        if (!res.ok) {
          throw new Error(
            errorMessage(data.error, 'La vérification du paiement a échoué.'),
          )
        }
        // La redirection "success" n'a lieu qu'après vérif serveur approuvée.
        if (data.status === 'approved') {
          toast({
            title: 'Paiement confirmé',
            description: `Ton abonnement ${planName} est activé.`,
          })
          router.push('/dashboard?payment=success')
          return
        }
        if (data.status === 'pending') {
          toast({
            title: 'Paiement en attente',
            description: 'Ton paiement est en cours de confirmation. Reviens dans un moment.',
          })
        } else {
          toast({
            title: 'Paiement refusé',
            description: 'Le paiement n’a pas abouti. Réessaie.',
            variant: 'destructive',
          })
        }
        router.push('/dashboard?payment=failed')
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'La vérification du paiement a échoué.'
        setError(message)
        toast({
          title: 'Vérification impossible',
          description: message,
          variant: 'destructive',
        })
        setStatus('idle')
      }
    },
    [planName, router],
  )

  async function handleClick() {
    if (busy || disabled) return
    setError(null)
    setStatus('loading')
    attemptRef.current += 1
    const attempt = attemptRef.current

    try {
      // 1. Le widget ne s'ouvre qu'après une réponse 200 du checkout.
      const res = await fetch('/api/billing/kkiapay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, interval }),
      })
      const data = (await res.json().catch(() => ({}))) as CheckoutApiResponse

      if (res.status === 401) {
        const redirectTo =
          typeof data.redirectTo === 'string' && data.redirectTo.length > 0
            ? data.redirectTo
            : '/connexion?callbackUrl=/tarifs'
        router.push(redirectTo)
        setStatus('idle')
        return
      }
      if (res.status === 503) {
        // KKiaPay non configuré côté serveur : on masque l'option sans rien casser.
        setUnavailable(true)
        setStatus('idle')
        return
      }
      if (
        !res.ok ||
        typeof data.reference !== 'string' ||
        typeof data.publicKey !== 'string' ||
        typeof data.amountXof !== 'number' ||
        typeof data.callback !== 'string'
      ) {
        throw new Error(
          errorMessage(data.error, 'Paiement KKiaPay indisponible pour le moment.'),
        )
      }
      const reference = data.reference
      const sandbox = data.sandbox === true

      try {
        await loadKkiapayScript()
      } catch {
        throw new Error(
          'Impossible de charger le module de paiement. Vérifie ta connexion puis réessaie.',
        )
      }
      if (
        typeof window.openKkiapayWidget !== 'function' ||
        typeof window.addKkiapayListener !== 'function'
      ) {
        throw new Error('Module de paiement indisponible. Réessaie dans un moment.')
      }

      // 2. Listeners : le transactionId vient du "success", jamais de l'URL.
      window.addKkiapayListener('success', (response) => {
        if (attemptRef.current !== attempt) return
        const rawId = response?.transactionId ?? response?.transaction_id
        if (typeof rawId !== 'string' || rawId.length === 0) {
          setError('Paiement reçu mais identifiant manquant. Contacte le support.')
          toast({
            title: 'Paiement à vérifier',
            description: 'Contacte le support avec ta référence de commande.',
            variant: 'destructive',
          })
          setStatus('idle')
          return
        }
        void verifyAndRedirect(reference, rawId)
      })
      window.addKkiapayListener('failed', () => {
        if (attemptRef.current !== attempt) return
        setStatus('idle')
        const message = 'Le paiement a échoué. Réessaie ou choisis un autre moyen de paiement.'
        setError(message)
        toast({ title: 'Paiement échoué', description: message, variant: 'destructive' })
      })

      // 3. Ouverture du widget (sans "paymentmethod" : le client choisit momo ou carte).
      window.openKkiapayWidget({
        amount: data.amountXof,
        key: data.publicKey,
        callback: toAbsoluteUrl(data.callback),
        sandbox,
        partnerId: reference,
        reason: `subscription:${planSlug}:${interval}`,
      })
      // Le widget modal a pris le relais : on libère le bouton. Le "success"
      // repassera en "verifying" pendant l'appel de vérification serveur.
      if (attemptRef.current === attempt) setStatus('idle')
    } catch (e) {
      if (attemptRef.current !== attempt) return
      const message =
        e instanceof Error ? e.message : 'Impossible de démarrer le paiement. Réessaie.'
      setError(message)
      toast({
        title: 'Paiement indisponible',
        description: message,
        variant: 'destructive',
      })
      setStatus('idle')
    }
  }

  // 503 au clic : option invisible, aucun changement de mise en page.
  if (unavailable) return null

  const buttonLabel = label ?? DEFAULT_LABEL

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || busy}
        aria-busy={busy}
        aria-label={`${buttonLabel} — ${planName}`}
        onClick={() => void handleClick()}
        className="h-auto min-h-9 w-full gap-2 py-2 text-center leading-snug whitespace-normal"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {status === 'verifying'
            ? 'Vérification du paiement…'
            : status === 'loading'
              ? 'Ouverture du paiement…'
              : buttonLabel}
        </span>
      </Button>
      {error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
