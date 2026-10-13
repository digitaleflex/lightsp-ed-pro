'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const STORAGE_KEY = 'lightspeed-cookie-consent'

export type CookieChoice = 'all' | 'essential'

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1800)
      return () => clearTimeout(t)
    }
  }, [])

  // « Gérer les cookies » (footer) : efface le choix et rouvre le bandeau.
  React.useEffect(() => {
    const reopen = () => {
      localStorage.removeItem(STORAGE_KEY)
      setVisible(true)
    }
    window.addEventListener('lightspeed:manage-cookies', reopen)
    return () => window.removeEventListener('lightspeed:manage-cookies', reopen)
  }, [])

  function accept(choice: CookieChoice) {
    localStorage.setItem(STORAGE_KEY, choice)
    setVisible(false)
    toast({
      title: choice === 'all' ? 'Préférences enregistrées' : 'Cookies essentiels uniquement',
      description:
        choice === 'all'
          ? 'Merci ! Vous pouvez modifier cela à tout moment.'
          : 'Mesure d’audience désactivée. Modifiable à tout moment.',
    })
  }

  /** La croix referme SANS enregistrer de choix : le bandeau reviendra à la prochaine visite. */
  function dismiss() {
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label="Choix des cookies"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Nous respectons votre vie privée</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Nous utilisons des cookies pour le fonctionnement essentiel du site
                  et, avec votre accord, pour mesurer l’audience de façon anonyme.
                  Sans réponse de votre part, rien n’est activé.{' '}
                  <a href="/faq" className="font-medium text-primary underline hover:no-underline">
                    En savoir plus
                  </a>
                </p>
                <div className="mt-4 flex min-h-[44px] flex-wrap items-center gap-2">
                  <Button size="sm" className="min-h-[44px] gap-1.5" onClick={() => accept('all')}>
                    Tout accepter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px]"
                    onClick={() => accept('essential')}
                  >
                    Tout refuser
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-11 w-11 sm:relative sm:right-0 sm:top-0 sm:shrink-0"
                onClick={dismiss}
                aria-label="Fermer sans choisir (redemandé à la prochaine visite)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
