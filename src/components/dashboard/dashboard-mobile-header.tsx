"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { UserAuthButton } from "@/components/auth/user-auth-button";

/**
 * Barre supérieure compacte, visible uniquement sur mobile (<md).
 * Sur desktop, la DashboardSidebar joue ce rôle avec navigation complète.
 */
export function DashboardMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-card/70 px-4 backdrop-blur-xl md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg speed-gradient text-white shadow-md shadow-primary/30">
          <Sparkles className="h-4 w-4" fill="currentColor" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm tracking-tight">Vélocita</span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            Mon espace
          </span>
        </div>
      </Link>
      <UserAuthButton />
    </header>
  );
}