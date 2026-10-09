'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { Menu, X, Zap, Gauge, Search, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#fonctionnalites', emoji: '⚡' },
  { label: 'Outil', href: '#outil', emoji: '🔍' },
  { label: 'Dashboard', href: '#dashboard', emoji: '📊' },
  { label: 'Tarifs', href: '#tarifs', emoji: '💎' },
  { label: 'Classement', href: '#classement', emoji: '🏆' },
  { label: 'Avis', href: '#testimonials', emoji: '⭐' },
  { label: 'FAQ', href: '#faq', emoji: '❓' },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500',
        scrolled
          ? 'border-b border-border/40 bg-background/80 shadow-lg shadow-black/[0.03] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70'
          : 'border-b border-transparent bg-gradient-to-b from-background/60 to-transparent backdrop-blur-sm'
      )}
    >
      {/* Barre de progression de scroll intégrée */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] origin-left speed-gradient"
        style={{ scaleX }}
        aria-hidden="true"
      />

      {/* Bordure dégradée animée quand scrollé */}
      {scrolled && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      )}

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* === Logo captivant === */}
          <Link href="#" className="group flex items-center gap-2.5 font-bold">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl speed-gradient text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" />
              {/* Halo pulsant */}
              <span className="pulse-ring absolute inset-0 rounded-xl opacity-50" />
              {/* Étincelle au survol */}
              <motion.span
                className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Sparkles className="h-3 w-3 text-chart-2" fill="currentColor" />
              </motion.span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg tracking-tight transition-colors group-hover:text-primary">Lightspeed</span>
              <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                Web Performance
              </span>
            </div>
          </Link>

          {/* === Liens desktop avec underline animé === */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => setHoveredLink(l.href)}
                onMouseLeave={() => setHoveredLink(null)}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="relative z-10">{l.label}</span>
                {/* Underline animé */}
                <motion.span
                  className="absolute inset-x-2 bottom-1 h-[2px] rounded-full speed-gradient"
                  initial={false}
                  animate={{
                    scaleX: hoveredLink === l.href ? 1 : 0,
                    opacity: hoveredLink === l.href ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{ transformOrigin: 'left' }}
                />
                {/* Fond pill au survol */}
                <motion.span
                  className="absolute inset-0 rounded-lg bg-primary/5"
                  initial={false}
                  animate={{
                    opacity: hoveredLink === l.href ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </nav>

          {/* === Actions === */}
          <div className="flex items-center gap-2">
            {/* Indicateur live (score moyen) */}
            <div className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 xl:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-primary">87/100</span>
              <span className="text-[10px] text-muted-foreground">moy.</span>
            </div>

            {/* Bouton recherche avec badge */}
            <Button
              variant="ghost"
              size="sm"
              className="group relative gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => window.dispatchEvent(new Event('lightspeed:open-command'))}
            >
              <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="hidden xl:inline">Rechercher</span>
              <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-foreground xl:inline">
                Ctrl K
              </kbd>
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="sm" className="hidden text-sm sm:inline-flex" asChild>
              <Link href="#outil">Connexion</Link>
            </Button>

            {/* CTA avec effet shimmer */}
            <Button
              size="sm"
              className="group relative hidden overflow-hidden gap-1.5 shadow-lg shadow-primary/25 transition-transform hover:scale-105 sm:inline-flex"
              asChild
            >
              <Link href="#outil">
                {/* Effet shimmer au survol */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Gauge className="relative h-4 w-4 transition-transform group-hover:rotate-12" />
                <span className="relative">Commencer</span>
                <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            {/* Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* === Menu mobile animé === */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-0.5 py-4">
                {/* Indicateur live mobile */}
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-primary">Score moyen global : 87/100</span>
                </div>

                {NAV_LINKS.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span className="text-base">{l.emoji}</span>
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-3 flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="#outil" onClick={() => setOpen(false)}>Connexion</Link>
                  </Button>
                  <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/20" asChild>
                    <Link href="#outil" onClick={() => setOpen(false)}>
                      <Gauge className="h-4 w-4" />
                      Commencer gratuitement
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
