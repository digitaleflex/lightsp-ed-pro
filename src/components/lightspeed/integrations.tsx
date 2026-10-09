'use client'

import { motion } from 'framer-motion'
import {
  Github,
  Slack,
  Triangle,
  Mail,
  Webhook,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const INTEGRATIONS = [
  {
    icon: Github,
    name: 'GitHub',
    description: 'Déclenchez des tests à chaque push ou pull request.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: Triangle,
    name: 'Vercel',
    description: 'Surveillez automatiquement après chaque déploiement.',
    color: 'text-foreground',
    bg: 'bg-foreground/5',
  },
  {
    icon: Slack,
    name: 'Slack',
    description: 'Recevez les alertes de régression sur vos canaux.',
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
  },
  {
    icon: Mail,
    name: 'Email',
    description: 'Notifications par email dès qu\'un score baisse.',
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
  },
  {
    icon: Webhook,
    name: 'Webhooks',
    description: 'Intégrez Lightspeed à votre CI/CD via webhooks.',
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
  },
  {
    icon: Bell,
    name: 'Alertes',
    description: 'Seuils personnalisés et rapports planifiés.',
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
  },
] as const

const FLOW_STEPS = [
  'Déploiement détecté',
  'Test Lighthouse automatique',
  'Comparaison avec le seuil',
  'Alerte envoyée si régression',
]

export function Integrations() {
  return (
    <section id="integrations" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-chart-3/5 blur-[120px]" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Intégrations
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lightspeed s'intègre à votre workflow
          </h2>
          <p className="mt-4 text-muted-foreground">
            Connectez vos outils de développement et de communication pour
            automatiser la surveillance de vos performances.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          {/* Grille d'intégrations */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((int, i) => (
              <motion.div
                key={int.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', int.bg)}>
                  <int.icon className={cn('h-5 w-5', int.color)} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{int.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {int.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  Disponible
                </span>
              </motion.div>
            ))}
          </div>

          {/* Schéma de flux d'automatisation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <h3 className="mb-1 text-lg font-semibold">Automatisation des déploiements</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Workflow type : de votre commit à l'alerte
              </p>

              {/* Étapes du flux */}
              <div className="space-y-3">
                {FLOW_STEPS.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.12 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                    {i < FLOW_STEPS.length - 1 && (
                      <span className="ml-auto text-muted-foreground/40">↓</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Exemple de webhook */}
              <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Exemple de webhook
                </p>
                <code className="block break-all font-mono text-[11px] text-foreground/80">
                  <span className="text-primary">POST</span>{' '}
                  https://lightspeed.run/api/hooks/vercel
                </code>
              </div>

              <Button size="sm" variant="outline" className="mt-5 w-full gap-1.5" asChild>
                <Link href="#tarifs">
                  Configurer mes webhooks
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
