'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl speed-gradient px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          {/* Effets de fond */}
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Zap className="h-8 w-8 text-white" fill="currentColor" />
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prêt à accélérer votre site web ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/90">
              Rejoignez les milliers d'équipes qui utilisent Lightspeed pour
              surveiller et optimiser leurs performances en continu.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" className="gap-2 shadow-xl" asChild>
                <Link href="#outil">
                  <Gauge className="h-4 w-4" />
                  Tester mon site maintenant
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="#tarifs">
                  Voir les tarifs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-white/70">
              Sans carte bancaire • Configuration en 2 minutes • Annulable à tout moment
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
