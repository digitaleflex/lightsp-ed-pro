'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Gauge,
  BarChart3,
  Trophy,
  Tag,
  HelpCircle,
  Rocket,
  Calculator,
  Plug,
  Award,
  Mail,
  GitCommit,
  Zap,
  Moon,
  Sun,
  Github,
  Globe,
  BookOpen,
  Compass,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { BLOG_POSTS } from '@/lib/blog'

// Correspondance slug -> id d'ancre sur la home assemblée
const SECTION_ANCHOR: Record<string, string> = {
  outil: 'outil',
  dashboard: 'dashboard',
  classement: 'classement',
  budget: 'budget',
  tarifs: 'tarifs',
  defis: 'achievements',
  integrations: 'integrations',
  journal: 'changelog',
  faq: 'faq',
  newsletter: 'newsletter',
}

interface CommandItemDef {
  icon: React.ElementType
  label: string
  hint?: string
  shortcut?: string
  action: () => void
  group: string
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Raccourci clavier Cmd/Ctrl+K pour ouvrir la palette + event personnalisé
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd+K ou Ctrl+K ouvre la palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      // Échappement ferme
      if (e.key === 'Escape' && open) setOpen(false)
    }
    // Écouteur pour ouverture externe (bouton dans la navbar)
    const onOpenEvent = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('lightspeed:open-command', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('lightspeed:open-command', onOpenEvent)
    }
  }, [open])

  const goSection = (slug: string) => {
    setOpen(false)
    // Si on est déjà sur la home, scroll fluide vers l'ancre ;
    // sinon, naviguer vers la page dédiée.
    if (window.location.pathname === '/') {
      document.getElementById(SECTION_ANCHOR[slug] ?? slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      router.push(`/${slug}`)
    }
  }

  const items: CommandItemDef[] = [
    // Navigation
    { icon: Gauge, label: 'Tester un site', hint: 'Analyser la vitesse d\'une URL', shortcut: '⌘K', action: () => goSection('outil'), group: 'Navigation' },
    { icon: BarChart3, label: 'Tableau de bord', hint: 'Voir le monitoring', action: () => goSection('dashboard'), group: 'Navigation' },
    { icon: Trophy, label: 'Classement des sites', hint: 'Sites les plus rapides', action: () => goSection('classement'), group: 'Navigation' },
    { icon: Calculator, label: 'Calculateur de budget', hint: 'Définir vos objectifs', action: () => goSection('budget'), group: 'Navigation' },
    { icon: Tag, label: 'Tarifs', hint: 'Voir les plans', action: () => goSection('tarifs'), group: 'Navigation' },
    { icon: Award, label: 'Succès & badges', hint: 'Gamification', action: () => goSection('defis'), group: 'Navigation' },
    { icon: Plug, label: 'Intégrations', hint: 'Slack, GitHub, Vercel', action: () => goSection('integrations'), group: 'Navigation' },
    { icon: GitCommit, label: 'Journal des évolutions', hint: 'Changelog', action: () => goSection('journal'), group: 'Navigation' },
    { icon: HelpCircle, label: 'FAQ', hint: 'Questions fréquentes', action: () => goSection('faq'), group: 'Navigation' },
    { icon: Mail, label: 'Newsletter', hint: 'S\'abonner', action: () => goSection('newsletter'), group: 'Navigation' },

    // Blog : index + chaque article
    {
      icon: BookOpen,
      label: 'Blog — tous les guides',
      hint: 'Core Web Vitals expliqués',
      action: () => {
        setOpen(false)
        router.push('/blog')
      },
      group: 'Blog',
    },
    ...BLOG_POSTS.map((p) => ({
      icon: BookOpen,
      label: p.metric ? `${p.metric} — ${p.title.slice(0, 52)}${p.title.length > 52 ? '…' : ''}` : p.title,
      hint: `${p.category} · ${p.readingTime} min`,
      action: () => {
        setOpen(false)
        router.push(`/blog/${p.slug}`)
      },
      group: 'Blog' as const,
    })),

    // Actions rapides
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre',
      hint: 'Basculer le thème',
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
        setOpen(false)
      },
      group: 'Actions rapides',
    },
    {
      icon: Rocket,
      label: 'Revenir en haut de page',
      hint: 'Remonter au hero',
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setOpen(false)
      },
      group: 'Actions rapides',
    },
    {
      icon: Compass,
      label: 'Visite guidée',
      hint: 'Tour des sections en 1 min',
      action: () => {
        setOpen(false)
        const start = () => window.dispatchEvent(new Event('lightspeed:start-tour'))
        if (window.location.pathname === '/') {
          start()
        } else {
          router.push('/')
          setTimeout(start, 900)
        }
      },
      group: 'Actions rapides',
    },

    // Liens externes
    {
      icon: Github,
      label: 'GitHub',
      hint: 'Voir le code source',
      action: () => window.open('https://github.com', '_blank'),
      group: 'Liens',
    },
    {
      icon: Globe,
      label: 'velocita.fr',
      hint: 'Site officiel',
      action: () => window.open('https://velocita.fr', '_blank'),
      group: 'Liens',
    },
  ]

  const groups = items.reduce<Record<string, CommandItemDef[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une section, un guide, une action…" />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        {Object.entries(groups).map(([groupName, groupItems]) => (
          <React.Fragment key={groupName}>
            <CommandGroup heading={groupName}>
              {groupItems.map((item) => (
                <CommandItem key={item.label} onSelect={() => item.action()} className="gap-2">
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-1 flex-col">
                    <span>{item.label}</span>
                    {item.hint && (
                      <span className="text-[10px] text-muted-foreground">{item.hint}</span>
                    )}
                  </div>
                  {item.shortcut && (
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
