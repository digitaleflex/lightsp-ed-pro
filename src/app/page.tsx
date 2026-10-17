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
import { Glossary } from '@/components/lightspeed/glossary'
import { BlogHome } from '@/components/lightspeed/blog-home'
import { Benchmark } from '@/components/lightspeed/benchmark'
import { TipsCarousel } from '@/components/lightspeed/tips-carousel'
import { SpeedGame } from '@/components/lightspeed/speed-game'
import { Pricing } from '@/components/lightspeed/pricing'
import { Leaderboard } from '@/components/lightspeed/leaderboard'
import { Testimonials } from '@/components/lightspeed/testimonials'
import { Achievements } from '@/components/lightspeed/achievements'
import { FAQ } from '@/components/lightspeed/faq'
import { Newsletter } from '@/components/lightspeed/newsletter'
import { Changelog } from '@/components/lightspeed/changelog'
import { CTA } from '@/components/lightspeed/cta'
import { Footer } from '@/components/lightspeed/footer'
import { CookieConsent } from '@/components/lightspeed/cookie-consent'
import { CommandPalette } from '@/components/lightspeed/command-palette'
import { ReadingProgress } from '@/components/lightspeed/reading-progress'
import { GuidedTour } from '@/components/lightspeed/guided-tour'
import { BackToTop, ShortcutHint } from '@/components/lightspeed/floating-utils'

export default function Home() {
  // Seed automatique de la base au premier chargement
  React.useEffect(() => {
    async function seed() {
      try {
        const res = await fetch('/api/seed', { method: 'GET' })
        if (res.ok) console.log('[Vélocita] Base initialisée')
      } catch (e) {
        console.error('[Vélocita] Échec du seed', e)
      }
    }
    seed()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip link pour l'accessibilité (navigation clavier) */}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Aller au contenu
      </a>
      <ReadingProgress />
      <CommandPalette />
      <Navbar />
      <main id="contenu" className="flex-1">
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
        <Glossary />
        <BlogHome />
        <Benchmark />
        <TipsCarousel />
        <SpeedGame />
        <Pricing />
        <Leaderboard />
        <Testimonials />
        <Newsletter />
        <FAQ />
        <Changelog />
        <CTA />
      </main>
      <Footer />
      <ShortcutHint />
      <BackToTop />
      <CookieConsent />
      <GuidedTour />
    </div>
  )
}
