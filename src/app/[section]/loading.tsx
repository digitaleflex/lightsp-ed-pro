import { Loader2 } from 'lucide-react'

export default function SectionLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Chargement de la page…</p>
    </div>
  )
}
