'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FAQS = [
  {
    q: "Comment fonctionne le test de performance Vélocita ?",
    a: "Vélocita analyse votre page avec un moteur d'audit Lighthouse. Il mesure le temps de chargement, les Core Web Vitals (LCP, CLS, TBT) et génère un score de performance de 0 à 100, accompagné de recommandations d'optimisation concrètes.",
  },
  {
    q: "Qu'est-ce que les Core Web Vitals exactement ?",
    a: "Les Core Web Vitals sont trois métriques clés de Google qui mesurent l'expérience utilisateur : le LCP (chargement du plus grand élément), l'INP (interactivité, qui a remplacé le FID en 2024) et le CLS (stabilité visuelle). Ils font partie des facteurs de classement Google depuis 2021.",
  },
  {
    q: "Dois-je installer un script sur mon site ?",
    a: "Non. Vélocita ne nécessite aucune modification de code ni l'ajout d'un script de suivi qui pourrait ralentir votre site. Vous pouvez tester n'importe quelle URL publique en quelques secondes.",
  },
  {
    q: "À quelle fréquence mon site est-il testé ?",
    a: "Le plan Découverte vous donne 10 tests par mois. Les plans Pro et Entreprise permettent une surveillance continue (toutes les heures ou toutes les 5 minutes) pour détecter les régressions avant vos utilisateurs.",
  },
  {
    q: "Depuis quelles régions puis-je tester ?",
    a: "Chaque test est un vrai audit Lighthouse exécuté depuis le serveur Vélocita (ou via l'API Google PageSpeed Insights lorsqu'elle est configurée). Le sélecteur de région permet d'étiqueter la zone de référence de votre audience ; les points de mesure multi-régions sont prévus dans une prochaine version.",
  },
  {
    q: "Puis-je être alerté quand mon score baisse ?",
    a: "Oui. Les plans Pro et Entreprise envoient des alertes par email dès que votre score de performance chute sous un seuil défini, ou dès qu'un déploiement déclenche une régression détectée via webhooks.",
  },
  {
    q: "Les données sont-elles disponibles en temps réel ?",
    a: "Les audits Lighthouse s'exécutent à la demande ou selon votre planning de surveillance. Les données utilisateurs réelles (RUM) du plan Entreprise, elles, sont agrégées en continu depuis les visites de vos visiteurs.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Absolument. Tous les plans sont sans engagement. Le plan Découverte est gratuit à vie, et vous pouvez upgrader/downgrader ou annuler à tout moment depuis votre tableau de bord.",
  },
] as const

export function FAQ() {
  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tout ce que vous devez savoir sur Vélocita et la surveillance de
            performance web.
          </p>
        </div>

        {/* Accordéon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="space-y-3"
          >
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card px-5 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-0 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bloc contact */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Vous avez d'autres questions ?</p>
              <p className="text-sm text-muted-foreground">
                Notre équipe répond généralement en moins de 24h.
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-1.5" asChild>
            <a href="mailto:support@velocita.fr">
              Contacter le support
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
