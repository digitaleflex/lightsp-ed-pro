'use client'

import * as React from 'react'
import { Mail, Check, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

/** Encart newsletter compact à glisser dans les articles du blog. */
export function BlogNewsletter() {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Email invalide', description: 'Saisissez une adresse email valide.', variant: 'destructive' })
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur d'inscription")
      setStatus('done')
      toast({ title: 'Inscription confirmée', description: 'Vous recevrez nos guides performance chaque mois.' })
      setEmail('')
    } catch (err: any) {
      setStatus('idle')
      toast({ title: 'Erreur', description: err.message || "Impossible de s'inscrire.", variant: 'destructive' })
    }
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Mail className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold tracking-tight">Recevez nos guides performance</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Un email par mois : Core Web Vitals, benchmarks et nouveautés. Zéro spam, désinscription en 1 clic.
          </p>
        </div>
      </div>
      {status === 'done' ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <Check className="h-4 w-4" /> Merci ! Vérifiez votre boîte mail pour confirmer.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            aria-label="Adresse email"
            className="flex-1"
            disabled={status === 'loading'}
          />
          <Button type="submit" disabled={status === 'loading'} className="gap-1.5">
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            S’abonner
          </Button>
        </form>
      )}
    </div>
  )
}
