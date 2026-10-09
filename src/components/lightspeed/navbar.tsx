'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X, Zap, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Outil', href: '#outil' },
  { label: 'Tableau de bord', href: '#dashboard' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'Classement', href: '#classement' },
  { label: 'Avis', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="#" className="flex items-center gap-2 font-bold">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl speed-gradient text-white shadow-lg">
              <Zap className="h-5 w-5" fill="currentColor" />
              <span className="pulse-ring absolute inset-0 rounded-xl opacity-60" />
            </div>
            <span className="text-lg tracking-tight">Lightspeed</span>
          </Link>

          {/* Liens desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-sm" asChild>
              <Link href="#outil">Connexion</Link>
            </Button>
            <Button size="sm" className="gap-1.5 shadow-sm" asChild>
              <Link href="#outil">
                <Gauge className="h-4 w-4" />
                Commencer gratuitement
              </Link>
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {open && (
          <div className="md:hidden border-t border-border/60 py-4">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 px-1">
                <Button variant="outline" size="sm" asChild>
                  <Link href="#outil">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="#outil">Commencer gratuitement</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
