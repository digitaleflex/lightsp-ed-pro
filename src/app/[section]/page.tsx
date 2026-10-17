import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/lightspeed/navbar'
import { Footer } from '@/components/lightspeed/footer'
import { SectionShell } from '@/components/lightspeed/section-shell'
import { SECTION_BY_SLUG, SECTION_SLUGS } from '@/lib/sections'
import { canonical } from '@/lib/site'

// Chaque slug réutilise EXACTEMENT le même composant que la home assemblée.
import { Features } from '@/components/lightspeed/features'
import { SpeedTest } from '@/components/lightspeed/speed-test'
import { Dashboard } from '@/components/lightspeed/dashboard'
import { BudgetCalculator } from '@/components/lightspeed/budget-calculator'
import { Benchmark } from '@/components/lightspeed/benchmark'
import { Integrations } from '@/components/lightspeed/integrations'
import { Pricing } from '@/components/lightspeed/pricing'
import { Leaderboard } from '@/components/lightspeed/leaderboard'
import { Testimonials } from '@/components/lightspeed/testimonials'
import { Achievements } from '@/components/lightspeed/achievements'
import { TipsCarousel } from '@/components/lightspeed/tips-carousel'
import { SpeedGame } from '@/components/lightspeed/speed-game'
import { Glossary } from '@/components/lightspeed/glossary'
import { Onboarding } from '@/components/lightspeed/onboarding'
import { Benefits } from '@/components/lightspeed/benefits'
import { FAQ } from '@/components/lightspeed/faq'
import { Newsletter } from '@/components/lightspeed/newsletter'
import { Changelog } from '@/components/lightspeed/changelog'

const COMPONENTS: Record<string, React.ComponentType> = {
  fonctionnalites: Features,
  outil: SpeedTest,
  dashboard: Dashboard,
  budget: BudgetCalculator,
  benchmark: Benchmark,
  integrations: Integrations,
  tarifs: Pricing,
  classement: Leaderboard,
  avis: Testimonials,
  defis: Achievements,
  astuces: TipsCarousel,
  jeu: SpeedGame,
  glossaire: Glossary,
  demarrer: Onboarding,
  avantages: Benefits,
  faq: FAQ,
  newsletter: Newsletter,
  journal: Changelog,
}

export function generateStaticParams() {
  return SECTION_SLUGS.map((section) => ({ section }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const meta = SECTION_BY_SLUG.get(section)
  if (!meta) return {}
  const url = canonical(`/${meta.slug}`)
  return {
    title: `${meta.title} | Vélocita`,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${meta.title} | Vélocita`,
      description: meta.description,
      url,
      type: 'article',
      locale: 'fr_FR',
    },
  }
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const meta = SECTION_BY_SLUG.get(section)
  const Component = COMPONENTS[section]
  if (!meta || !Component) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu" className="flex-1">
        <SectionShell meta={meta}>
          <Component />
        </SectionShell>
      </main>
      <Footer />
    </div>
  )
}
