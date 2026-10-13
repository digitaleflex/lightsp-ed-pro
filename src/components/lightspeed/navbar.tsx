'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import {
  Menu, X, Zap, Gauge, Search, Sparkles, ArrowRight, ChevronDown,
  BarChart3, Calculator, Plug, Tag, BookOpen, BookMarked, Scale,
  Lightbulb, Rocket, HelpCircle, GitCommit, Trophy, Star,
  Award, Gamepad2, Mail, Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAuthButton } from '@/components/auth/user-auth-button'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  desc: string
  icon: React.ElementType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Produit',
    items: [
      { label: 'Outil de test', href: '/outil', desc: 'Auditez la vitesse de n’importe quelle URL', icon: Gauge },
      { label: 'Fonctionnalités', href: '/fonctionnalites', desc: 'Monitoring, Lighthouse, multi-régions', icon: Zap },
      { label: 'Dashboard', href: '/dashboard', desc: 'Suivi temps réel et détection de régressions', icon: BarChart3 },
      { label: 'Budget perf', href: '/budget', desc: 'Objectifs LCP, CLS, TBT et alertes', icon: Calculator },
      { label: 'Intégrations', href: '/integrations', desc: 'Slack, GitHub, Vercel, webhooks', icon: Plug },
      { label: 'Avantages', href: '/avantages', desc: 'Conversions, SEO, expérience utilisateur', icon: Sparkles },
    ],
  },
  {
    label: 'Ressources',
    items: [
      { label: 'Blog', href: '/blog', desc: 'Guides Core Web Vitals par Eurin HASH', icon: BookOpen },
      { label: 'Glossaire', href: '/glossaire', desc: 'LCP, CLS, INP expliqués simplement', icon: BookMarked },
      { label: 'Benchmark', href: '/benchmark', desc: 'Comparez-vous à votre secteur', icon: Scale },
      { label: 'Astuces', href: '/astuces', desc: 'Optimisations concrètes et éprouvées', icon: Lightbulb },
      { label: 'Démarrer', href: '/demarrer', desc: 'Votre première surveillance en 2 minutes', icon: Rocket },
      { label: 'FAQ', href: '/faq', desc: 'Questions fréquentes et aide', icon: HelpCircle },
      { label: 'Journal', href: '/journal', desc: 'Nouveautés et évolutions du produit', icon: GitCommit },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { label: 'Classement', href: '/classement', desc: 'Les sites les plus rapides audités', icon: Trophy },
      { label: 'Avis clients', href: '/avis', desc: 'Ils accélèrent avec Vélocita', icon: Star },
      { label: 'Défis & badges', href: '/defis', desc: 'Gamifiez vos optimisations', icon: Award },
      { label: 'Jeu vitesse', href: '/jeu', desc: 'Comprenez la latence en jouant', icon: Gamepad2 },
      { label: 'Newsletter', href: '/newsletter', desc: 'Performance web chaque mois', icon: Mail },
    ],
  },
]

/** Liens directs conservés hors menus, pour l’accès en 1 clic. */
const DIRECT_LINKS = [
  { label: 'Tarifs', href: '/tarifs', icon: Tag },
  { label: 'Blog', href: '/blog', icon: BookOpen },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const [mobileGroup, setMobileGroup] = React.useState<string | null>(null)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const [avgScore, setAvgScore] = React.useState<number | null>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  React.useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.avgScore === 'number') setAvgScore(d.avgScore)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fermer les menus au clavier (Échap) et au clic extérieur via focus perdu
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

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

      {scrolled && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      )}

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* === Logo === */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 font-bold">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl speed-gradient text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" />
              <span className="pulse-ring absolute inset-0 rounded-xl opacity-50" />
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
              <span className="text-lg tracking-tight transition-colors group-hover:text-primary">Vélocita</span>
              <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                Web Performance
              </span>
            </div>
          </Link>

          {/* === Navigation desktop : 3 menus + 2 directs === */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
            {NAV_GROUPS.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => {
                  cancelClose()
                  setOpenMenu(group.label)
                }}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                  aria-expanded={openMenu === group.label}
                  aria-haspopup="true"
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    openMenu === group.label ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {group.label}
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', openMenu === group.label && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {openMenu === group.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute left-1/2 top-full z-50 w-[380px] -translate-x-1/2 pt-2"
                    >
                      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
                          >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                              <item.icon className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                              <span className="block truncate text-xs text-muted-foreground">{item.desc}</span>
                            </span>
                            <ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:opacity-100" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {DIRECT_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* === Actions === */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Indicateur live (score moyen) */}
            <div className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 xl:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-primary">{avgScore !== null ? `${avgScore}/100` : '…/100'}</span>
              <span className="text-[10px] text-muted-foreground">moy.</span>
            </div>

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

            <div className="hidden sm:inline-flex">
              <UserAuthButton />
            </div>

            <Button
              size="sm"
              className="group relative hidden overflow-hidden gap-1.5 shadow-lg shadow-primary/25 transition-transform hover:scale-105 sm:inline-flex"
              asChild
            >
              <Link href="/outil">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Gauge className="relative h-4 w-4 transition-transform group-hover:rotate-12" />
                <span className="relative">Tester mon site</span>
                <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            {/* Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={open}
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

        {/* === Menu mobile : accordéons par groupe === */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden lg:hidden"
              aria-label="Menu mobile"
            >
              <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto py-4">
                {/* Tester : CTA direct en premier */}
                <Link
                  href="/outil"
                  onClick={() => setOpen(false)}
                  className="mb-2 flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  Tester mon site gratuitement
                </Link>

                {NAV_GROUPS.map((group) => (
                  <div key={group.label} className="overflow-hidden rounded-xl border border-border/50">
                    <button
                      onClick={() => setMobileGroup(mobileGroup === group.label ? null : group.label)}
                      aria-expanded={mobileGroup === group.label}
                      className="flex w-full items-center justify-between bg-card/60 px-4 py-3 text-sm font-semibold"
                    >
                      {group.label}
                      <ChevronDown
                        className={cn('h-4 w-4 text-muted-foreground transition-transform', mobileGroup === group.label && 'rotate-180')}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {mobileGroup === group.label && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 p-2 pt-0">
                            {group.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <item.icon className="h-4 w-4" strokeWidth={1.8} />
                                </span>
                                <span>
                                  <span className="block text-sm font-medium">{item.label}</span>
                                  <span className="block text-xs text-muted-foreground">{item.desc}</span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Directs */}
                <div className="flex gap-2">
                  {DIRECT_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/60 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <l.icon className="h-4 w-4" />
                      {l.label}
                    </Link>
                  ))}
                </div>

                {/* Auth (mobile) */}
                <div className="mt-1 flex justify-center border-t border-border/40 pt-3">
                  <UserAuthButton callbackUrl="/" />
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-primary">Score moyen global : {avgScore !== null ? `${avgScore}/100` : '…'}</span>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
