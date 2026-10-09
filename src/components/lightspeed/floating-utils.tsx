'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Keyboard } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollTop}
          aria-label="Remonter en haut"
          className="fixed bottom-6 right-6 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110 hover:bg-primary/90"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Raccourci clavier : Cmd/Ctrl+K pour focaliser le champ URL de l'outil de test
export function KeyboardShortcuts() {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>(
          '#outil input[type="text"], #outil input[type="url"]'
        )
        if (input) {
          input.focus()
          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Effet de surbrillance
          input.classList.add('ring-2', 'ring-primary')
          setTimeout(() => input.classList.remove('ring-2', 'ring-primary'), 1500)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}

// Indicateur visuel du raccourci (affiché sur les écrans larges)
export function ShortcutHint() {
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[70] hidden items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur lg:flex">
      <Keyboard className="h-3.5 w-3.5" />
      <span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
          Ctrl K
        </kbd>{' '}
        pour tester un site
      </span>
    </div>
  )
}
