'use client'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { UserAuthButton } from '@/components/auth/user-auth-button'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <img src="/logo-pro.svg" alt="Vélocita" className="h-8 w-8" />
          <span>Vélocita</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/outil" className="hover:text-primary">Outil</Link>
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <Link href="/benchmark" className="hover:text-primary">Benchmark</Link>
          <Link href="/blog" className="hover:text-primary">Blog</Link>
          <UserAuthButton />
        </div>
      </div>
    </nav>
  )
}
