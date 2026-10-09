'use client'

import * as React from 'react'
import { Navbar } from '@/components/lightspeed/navbar'
import { Hero } from '@/components/lightspeed/hero'
import { Onboarding } from '@/components/lightspeed/onboarding'
import { StatsBanner } from '@/components/lightspeed/stats-banner'
import { Features } from '@/components/lightspeed/features'
import { SpeedTest } from '@/components/lightspeed/speed-test'
import { Dashboard } from '@/components/lightspeed/dashboard'
import { BudgetCalculator } from '@/components/lightspeed/budget-calculator'
import { Benefits } from '@/components/lightspeed/benefits'
import { Integrations } from '@/components/lightspeed/integrations'
import { Pricing } from '@/components/lightspeed/pricing'
import { Leaderboard } from '@/components/lightspeed/leaderboard'
import { Testimonials } from '@/components/lightspeed/testimonials'
import { Achievements } from '@/components/lightspeed/achievements'
import { FAQ } from '@/components/lightspeed/faq'
import { Newsletter } from '@/components/lightspeed/newsletter'
import { CTA } from '@/components/lightspeed/cta'
import { Footer } from '@/components/lightspeed/footer'
import { CookieConsent } from '@/components/lightspeed/cookie-consent'
import { BackToTop, KeyboardShortcuts, ShortcutHint } from '@/components/lightspeed/floating-utils'

export default function Home() {
  // Seed automatique de la base au premier chargement
  React.useEffect(() => {
    async function seed() {
      try {
        const res = await fetch('/api/seed', { method: 'GET' })
        if (res.ok) console.log('[Lightspeed] Base initialisée')
      } catch (e) {
        console.error('[Lightspeed] Échec du seed', e)
      }
    }
    seed()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <KeyboardShortcuts />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Onboarding />
        <StatsBanner />
        <Features />
        <SpeedTest />
        <Dashboard />
        <BudgetCalculator />
        <Benefits />
        <Integrations />
        <Achievements />
        <Pricing />
        <Leaderboard />
        <Testimonials />
        <Newsletter />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <ShortcutHint />
      <BackToTop />
      <CookieConsent />
    </div>
  )
}
