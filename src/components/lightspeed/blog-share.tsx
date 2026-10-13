'use client'

import * as React from 'react'
import { Twitter, Linkedin, Mail, Link2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

/** Boutons de partage d'article : X, LinkedIn, Email + copier le lien. */
export function BlogShare({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const text = encodeURIComponent(`${title} — via Vélocita`)
  const shareUrl = encodeURIComponent(url)

  const links = [
    {
      icon: Twitter,
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      color: 'hover:bg-chart-3/10 hover:text-chart-3',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: 'hover:bg-chart-1/10 hover:text-chart-1',
    },
    {
      icon: Mail,
      label: 'Email',
      href: `mailto:?subject=${text}&body=${shareUrl}`,
      color: 'hover:bg-chart-4/10 hover:text-chart-4',
    },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({ title: 'Lien copié', description: 'Collez-le où vous voulez.' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Copie impossible', variant: 'destructive' })
    }
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="mr-1 text-xs font-medium text-muted-foreground">Partager :</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${link.label}`}
          title={link.label}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all hover:scale-110 hover:border-transparent',
            link.color
          )}
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copier le lien de l'article"
        title="Copier le lien"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all hover:scale-110 hover:bg-primary/10 hover:text-primary"
      >
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
