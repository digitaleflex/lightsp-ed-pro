"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Globe, Activity, User, Settings, Bell,
  ArrowLeft, LogOut, BookOpen, Sparkles,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  /** État : "active" ou "soon" (désactivé, affiché pour info). */
  state: "active" | "soon";
  /** Description courte affichée en sous-titre. */
  description?: string;
}

const PRIMARY_NAV: NavItem[] = [
  {
    label: "Vue d'ensemble",
    href: "/dashboard",
    icon: LayoutDashboard,
    state: "active",
    description: "Tous vos sites et KPIs",
  },
  {
    label: "Mes sites",
    href: "/dashboard#sites",
    icon: Globe,
    state: "active",
    description: "Sites surveillés",
  },
  {
    label: "Tests récents",
    href: "/dashboard#tests",
    icon: Activity,
    state: "active",
    description: "Historique des mesures",
  },
];

const COMING_SOON_NAV: NavItem[] = [
  { label: "Profil", href: "/dashboard/profil", icon: User, state: "active", description: "Modifier mes infos" },
  { label: "Notifications", href: "#", icon: Bell, state: "soon", description: "Alertes Slack / e-mail" },
  { label: "Paramètres", href: "#", icon: Settings, state: "soon", description: "Tenant & équipe" },
];

const STORAGE_KEY = "dashboard-sidebar-collapsed";

/**
 * Petite tooltip affichée à droite d'un item quand la sidebar est pliée.
 * Pure CSS, pas de dépendance UI supplémentaire.
 */
function IconTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2",
          "whitespace-nowrap rounded-md border border-border/60 bg-popover px-2 py-1",
          "text-xs font-medium text-popover-foreground shadow-lg shadow-black/10",
          "opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100"
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function DashboardSidebar({
  user: userProp,
}: {
  user?: { name: string | null; email: string; image: string | null } | null;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // État replié, persisté dans localStorage. Initialisé à false côté SSR pour
  // éviter toute discordance d'hydratation — lu côté client via useEffect.
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {
      /* localStorage indisponible (mode privé etc.) — on garde l'état par défaut */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* noop */
    }
  }, [collapsed, ready]);

  function isActive(item: NavItem): boolean {
    if (item.state !== "active") return false;
    if (item.href === "/dashboard" && pathname === "/dashboard") return true;
    if (item.href.startsWith("/dashboard#")) {
      return pathname === "/dashboard";
    }
    if (item.href === "/dashboard") return pathname.startsWith("/dashboard");
    return false;
  }

  const userFromProp = userProp ? {
    name: userProp.name,
    email: userProp.email,
    image: userProp.image,
  } : null;
  const sessionUser = session?.user ? {
    name: session.user.name ?? session.user.email ?? null,
    email: session.user.email ?? '',
    image: session.user.image ?? null,
  } : null;
  const user = userFromProp ?? sessionUser;
  const displayName = user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "Mon compte");
  const initial = displayName.charAt(0).toUpperCase();

  const asideWidth = collapsed
    ? "md:w-[68px]"
    : "md:w-64 lg:w-72";

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col",
        asideWidth,
        "sticky top-0 h-screen border-r border-border/60 bg-card/40 backdrop-blur-xl",
        "transition-[width] duration-300 ease-in-out"
      )}
      aria-label="Navigation utilisateur"
      aria-expanded={!collapsed}
    >
      {/* === Brand + toggle === */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/60",
          collapsed ? "justify-center px-2" : "gap-2.5 px-3"
        )}
      >
        {!collapsed && (
          <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2.5 font-bold">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg speed-gradient text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" fill="currentColor" />
            </div>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-sm tracking-tight transition-colors group-hover:text-primary">
                Vélocita
              </span>
              <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                Mon espace
              </span>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link
            href="/"
            aria-label="Accueil — Vélocita"
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg speed-gradient text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105"
          >
            <Sparkles className="h-4 w-4" fill="currentColor" />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Étendre la barre latérale" : "Replier la barre latérale"}
          aria-pressed={collapsed}
          title={collapsed ? "Étendre (→)" : "Replier (←)"}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* === User card === */}
      {user && !collapsed && (
        <div className="border-b border-border/60 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-background/40 p-2.5 ring-1 ring-border/40">
            <span className="relative shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  className="h-9 w-9 rounded-full ring-2 ring-primary/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground ring-2 ring-primary/30">
                  {initial}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      )}
      {user && collapsed && (
        <div className="flex justify-center border-b border-border/60 py-3">
          <IconTooltip label={displayName}>
            <span className="relative inline-flex">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  className="h-9 w-9 rounded-full ring-2 ring-primary/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground ring-2 ring-primary/30">
                  {initial}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
          </IconTooltip>
        </div>
      )}

      {/* === Primary nav === */}
      <nav
        className={cn("flex-1 overflow-y-auto", collapsed ? "px-2 py-3" : "px-3 py-4")}
        aria-label="Sections principales"
      >
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
        )}
        <ul className="space-y-1">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const inner = (
              <>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    collapsed ? "" : "mt-0.5",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={1.8}
                />
                {!collapsed && (
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                )}
              </>
            );

            return (
              <li key={item.label}>
                {collapsed ? (
                  <IconTooltip label={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-center rounded-lg p-2.5 transition-all",
                        active
                          ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {inner}
                    </Link>
                  </IconTooltip>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all",
                      active
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bientôt disponible
          </p>
        )}
        {collapsed && <div className="my-3 mx-2 h-px bg-border/60" />}
        <ul className="space-y-1">
          {COMING_SOON_NAV.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    collapsed ? "" : "mt-0.5"
                  )}
                  strokeWidth={1.8}
                />
                {!collapsed && (
                  <>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-tight">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="block truncate text-[11px]">
                          {item.description}
                        </span>
                      )}
                    </span>
                    <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                  </>
                )}
              </>
            );

            return (
              <li key={item.label}>
                {collapsed ? (
                  <IconTooltip label={`${item.label} (bientôt)`}>
                    <span
                      className="flex cursor-not-allowed items-center justify-center rounded-lg p-2.5 text-muted-foreground/60"
                      aria-disabled="true"
                    >
                      {inner}
                    </span>
                  </IconTooltip>
                ) : (
                  <span
                    className="flex cursor-not-allowed items-start gap-3 rounded-lg px-3 py-2.5 text-muted-foreground/60"
                    aria-disabled="true"
                    title="Bientôt disponible"
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* === Footer === */}
      <div
        className={cn(
          "space-y-1 border-t border-border/60",
          collapsed ? "px-2 py-2" : "px-3 py-3"
        )}
      >
        {!collapsed && (
          <>
            <Link
              href="/blog"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              <span>Guides & blog</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au site</span>
            </Link>
            <div className="flex items-center justify-between gap-2 px-2 pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Apparence
              </span>
              <ThemeToggle />
            </div>
          </>
        )}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 pt-1">
            <IconTooltip label="Guides & blog">
              <Link
                href="/blog"
                aria-label="Guides & blog"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
              </Link>
            </IconTooltip>
            <IconTooltip label="Retour au site">
              <Link
                href="/"
                aria-label="Retour au site"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </IconTooltip>
            <div className="pt-1">
              <ThemeToggle />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Se déconnecter"
          className={cn(
            "text-muted-foreground hover:text-rose-600",
            collapsed ? "h-9 w-full justify-center p-0" : "w-full justify-start gap-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Se déconnecter</span>}
        </Button>
      </div>
    </aside>
  );
}