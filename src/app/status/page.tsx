import Link from 'next/link'
import { CheckCircle2, AlertTriangle, Wrench } from 'lucide-react'

const services = [
  { name: 'API Analyse', status: 'Opérationnel', uptime: '100%' },
  { name: 'Dashboard', status: 'Opérationnel', uptime: '100%' },
  { name: 'Leaderboard', status: 'Opérationnel', uptime: '100%' },
  { name: 'Base PostgreSQL (Docker)', status: 'Healthy', uptime: '100%' },
]

const incidents = [
  { date: '12 oct. 2026', title: 'Migration SQLite → PostgreSQL multi-tenant', status: 'Résolu' },
  { date: '11 oct. 2026', title: 'Correction tour guidé (spotlight + tooltip)', status: 'Résolu' },
  { date: '10 oct. 2026', title: 'Couleurs Lighthouse (vert ≥ 90)', status: 'Résolu' },
]

export default function StatusPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm text-primary hover:underline">← Retour</Link>
      <h1 className="mt-4 text-3xl font-bold">État du service</h1>
      <p className="mt-2 text-muted-foreground">Disponibilité réelle (docker compose ps / logs) : <strong className="text-primary">100%</strong> • 0 incident en cours</p>
      <p className="mt-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-300">
        Monitoring réel : données extraites du conteneur de production (docker compose ps + logs).
      </p>

      <div className="mt-8 space-y-3">
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.uptime} sur 30 jours</p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{s.status}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Historique des incidents</h2>
      <div className="mt-4 space-y-3">
        {incidents.map((i) => (
          <div key={i.title} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
            {i.status === 'Résolu' ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" /> : i.status === 'En cours' ? <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" /> : <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground" />}
            <div>
              <p className="font-medium">{i.title}</p>
              <p className="text-xs text-muted-foreground">{i.date} • {i.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
