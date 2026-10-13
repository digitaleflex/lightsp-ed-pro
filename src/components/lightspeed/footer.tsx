'use client'

import Link from 'next/link'
import { Zap, Mail, Globe, Leaf, Shield } from 'lucide-react'
import { StatusWidget } from './status-widget'

const FOOTER_LINKS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '/fonctionnalites' },
      { label: 'Outil de test', href: '/outil' },
      { label: 'Tableau de bord', href: '/dashboard' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'Classement', href: '/classement' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Flux RSS', href: '/blog/rss.xml' },
      { label: 'Glossaire', href: '/glossaire' },
      { label: 'Benchmark', href: '/benchmark' },
      { label: 'Astuces', href: '/astuces' },
      { label: 'Budget perf', href: '/budget' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    title: 'Communauté',
    links: [
      { label: 'Avis clients', href: '/avis' },
      { label: 'Défis & badges', href: '/defis' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Démarrer', href: '/demarrer' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Cookies : gérer', action: 'cookies' },
      { label: 'Conditions', href: '/faq' },
      { label: 'Confidentialité', href: '/faq' },
      { label: 'RGPD', href: '/faq' },
      { label: 'Sécurité', href: '/status' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Section principale */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_3fr]">
          {/* Marque */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl speed-gradient text-white shadow-lg">
                <Zap className="h-5 w-5" fill="currentColor" />
              </div>
              <span className="text-lg tracking-tight">Vélocita</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              L'outil de surveillance de performance web qui vous aide à
              construire un internet plus rapide, pour des utilisateurs plus
              heureux.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <a href="mailto:support@velocita.fr" className="flex items-center gap-2 transition-colors hover:text-foreground">
                <Mail className="h-4 w-4" />
                support@velocita.fr
              </a>
              <Link href="/" className="flex items-center gap-2 transition-colors hover:text-foreground">
                <Globe className="h-4 w-4" />
                velocita.fr
              </Link>
            </div>
            {/* Widget de statut système */}
            <div className="mt-4">
              <StatusWidget compact />
            </div>
          </div>

          {/* Liens */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((l) =>
                    'action' in l && l.action === 'cookies' ? (
                      <li key={l.label}>
                        <button
                          onClick={() => window.dispatchEvent(new Event('lightspeed:manage-cookies'))}
                          className="min-h-[44px] py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:py-0"
                        >
                          {l.label}
                        </button>
                      </li>
                    ) : (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="inline-block min-h-[44px] py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:py-0"
                        >
                          {l.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="my-8 border-t border-border/60" />

        {/* Bas de page */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} Vélocita. Tous droits réservés.</span>
            <span className="flex items-center gap-1.5 rounded-full bg-chart-2/10 px-2.5 py-0.5 text-xs font-medium text-chart-2">
              <Leaf className="h-3 w-3" />
              Climat neutre
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <Shield className="h-3 w-3" />
              Données hébergées en Europe
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/newsletter" className="transition-colors hover:text-foreground">Feedback</Link>
            <span className="text-border">•</span>
            <Link href="/status" className="transition-colors hover:text-foreground">Statut</Link>
            <span className="text-border">•</span>
            <Link href="/journal" className="transition-colors hover:text-foreground">Conditions</Link>
            <span className="text-border">•</span>
            <Link href="/faq" className="transition-colors hover:text-foreground">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
