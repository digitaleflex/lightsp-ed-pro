import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="container mx-auto max-w-7xl px-4 py-8 flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <img src="/logo-pro.svg" alt="Vélocita" className="h-8 w-8" />
          <span>Vélocita</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/faq">FAQ</Link>
          <Link href="/status">Status</Link>
          <Link href="/benchmark">Benchmark</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </div>
    </footer>
  )
}
