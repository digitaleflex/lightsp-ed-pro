'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Check, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export function Newsletter() {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done'>('idle')
  const [count, setCount] = React.useState<number | null>(null)

  React.useEffect(() => {
    fetch('/api/newsletter')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.subscribers === 'number') setCount(d.subscribers)
      })
      .catch(() => {})
  }, [])

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
      if (typeof data?.subscribers === 'number') setCount(data.subscribers)
      setStatus('done')
      toast({
        title: 'Inscription confirmée',
        description: 'Vous recevrez nos conseils performance chaque mardi.',
      })
      setEmail('')
    } catch (err: any) {
      setStatus('idle')
      toast({ title: 'Erreur', description: err.message || "Impossible de s'inscrire.", variant: 'destructive' })
    }
  }

  return (
    <section id="newsletter" className="relative py-20 sm:py-24">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-xl sm:p-12"
        >
          {/* Décor */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-chart-3/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            {/* Texte */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Mail className="h-3.5 w-3.5" />
                Newsletter performance
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Recevez des conseils concrets pour{' '}
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  accélérer votre site
                </span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Un email par semaine : études de cas, benchmarks Core Web Vitals
                et techniques d'optimisation. Pas de spam, désinscription en un clic.
              </p>

              {/* Preuves sociales */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="flex -space-x-2">
                    {['A', 'M', 'L', 'J'].map((c, i) => (
                      <span
                        key={c}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary/20 text-[10px] font-bold text-primary"
                        style={{ zIndex: 10 - i }}
                      >
                        {c}
                      </span>
                    ))}
                  </span>
                  {count !== null ? `${count.toLocaleString('fr-FR')} développeur${count > 1 ? 's' : ''} abonné${count > 1 ? 's' : ''}` : 'Newsletter performance'}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Désinscription en 1 clic
                </span>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={submit} className="space-y-3">
              {status === 'done' ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-6 w-6" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold">Bienvenue à bord !</p>
                    <p className="text-xs text-muted-foreground">
                      Vérifiez votre boîte mail pour confirmer.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus('idle')}
                    className="text-xs"
                  >
                    S'inscrire avec une autre adresse
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="vous@entreprise.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11 text-base"
                      disabled={status === 'loading'}
                      aria-label="Adresse email"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 shadow-lg shadow-primary/20"
                    disabled={status === 'loading' || !email}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Inscription…
                      </>
                    ) : (
                      <>
                        Je m'abonne gratuitement
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground">
                    En vous inscrivant, vous acceptez notre{' '}
                    <Link href="/faq" className="underline hover:text-foreground">politique de confidentialité</Link>.
                  </p>
                </>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
