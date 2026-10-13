"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Zap, Globe, Activity, Clock, Plus, ExternalLink, LogOut,
  Gauge, ShieldCheck, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/lightspeed/sparkline";
import { DeleteSiteButton } from "@/components/dashboard/delete-site-button";
import { DashboardFiltersBar } from "@/components/dashboard/dashboard-filters-bar";
import { DashboardPagination as PaginationBar } from "@/components/dashboard/dashboard-pagination";
import { useDashboardPolling } from "@/hooks/use-dashboard-polling";

interface UserInfo {
  name: string | null;
  email: string;
  image: string | null;
  memberSince: string | null;
}

interface SiteSummary {
  id: string;
  url: string;
  name: string;
  category: string;
  testCount: number;
  scoreHistory: number[];
  lastTest: {
    performance: number;
    lcp: number;
    cls: number;
    inp: number | null;
    device: string;
    createdAt: string;
  } | null;
}

interface DashboardStats {
  siteCount: number;
  testedSiteCount: number;
  avgScore: number | null;
  totalTests: number;
}

interface RecentTest {
  id: string;
  url: string;
  name: string;
  performance: number;
  device: string;
  createdAt: string;
}

interface DashboardPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

type SortKey = "recent" | "name" | "score-desc" | "score-asc" | "tests";

interface DashboardFilters {
  q: string;
  sort: SortKey;
}

interface DashboardClientProps {
  user: UserInfo;
  tenantId: string;
  sites: SiteSummary[];
  stats: DashboardStats;
  pagination: DashboardPagination;
  filters: DashboardFilters;
  recentTests: RecentTest[];
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.round(h / 24);
  if (days < 30) return `il y a ${days} j`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20";
  if (score >= 50) return "text-amber-600 bg-amber-500/10 ring-amber-500/20";
  return "text-rose-600 bg-rose-500/10 ring-rose-500/20";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums",
        scoreColor(score)
      )}
    >
      {score}
    </span>
  );
}

function StatCard({
  icon: Icon, label, value, hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Normalise une saisie utilisateur en URL candidate :
 *  - trim
 *  - minuscule sur le host
 *  - ajoute https:// si aucun protocole
 *  - retourne null si la chaîne ne ressemble pas à un domaine valide
 */
function normalizeUrlInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Rejette les caractères interdits dans un nom de domaine / URL
  if (/[\s<>"'`]/.test(trimmed)) return null;

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const u = new URL(candidate);
    // Vérifie qu'on a un host qui ressemble à un domaine (au moins un point,
    // pas une IP-only qui pourrait être locale).
    if (!u.hostname.includes(".") || /\s/.test(u.hostname)) return null;
    // Reconstruit l'URL propre (host en minuscule)
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return null;
  }
}

function AddSiteForm({ tenantId, onAdded }: { tenantId: string; onAdded: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const normalized = normalizeUrlInput(url);
    if (!normalized) {
      setError(
        "URL invalide. Saisissez un nom de domaine (ex. exemple.fr, monsite.com)."
      );
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: normalized, tenantId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Échec de l'analyse");
        }
        toast({
          title: "Site ajouté ✓",
          description: `${data.url} — score ${data.result?.performance ?? "?"}/100`,
        });
        setUrl("");
        onAdded();
      } catch (err) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible d'ajouter le site",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="exemple.fr ou https://exemple.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            disabled={isPending}
            className={cn(
              "flex-1 pl-9",
              error && "border-destructive focus-visible:ring-destructive/30"
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "add-site-error" : "add-site-hint"}
          />
        </div>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          {isPending ? (
            <>
              <Activity className="h-4 w-4 animate-pulse" />
              Analyse…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Ajouter
            </>
          )}
        </Button>
      </div>
      {error ? (
        <p
          id="add-site-error"
          role="alert"
          className="flex items-start gap-1.5 text-xs text-destructive"
        >
          {error}
        </p>
      ) : (
        <p id="add-site-hint" className="text-xs text-muted-foreground">
          Saisissez un nom de domaine simple (ex. <code className="rounded bg-muted px-1 py-0.5">exemple.fr</code>) ou une URL complète — le protocole <code className="rounded bg-muted px-1 py-0.5">https://</code> est ajouté automatiquement.
        </p>
      )}
    </form>
  );
}

export function DashboardClient({
  user, tenantId, sites, stats, pagination, filters, recentTests,
}: DashboardClientProps) {
  const router = useRouter();
  const { update } = useSession();

  // Refresh auto toutes les 30 s pour voir les nouveaux testsScheduler
  useDashboardPolling(30_000);

  function refresh() {
    router.refresh();
    void update();
  }

  const initials =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.email.charAt(0).toUpperCase() ||
    "?";

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      {/* === Header === */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? user.email}
              className="h-12 w-12 rounded-full ring-2 ring-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-2 ring-primary/20">
              {initials}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Bonjour
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              {user.name ?? user.email}
            </h1>
            <p className="text-xs text-muted-foreground">
              {user.email}
              {user.memberSince && (
                <>
                  {" · "}membre depuis {new Date(user.memberSince).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/">
              <Globe className="h-4 w-4" />
              Tester un nouveau site
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => {
              void signOut({ callbackUrl: "/" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* === Stat cards === */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Globe}
          label="Sites surveillés"
          value={String(stats.siteCount)}
          hint={stats.testedSiteCount > 0 ? `${stats.testedSiteCount} testés` : "Aucun test encore"}
        />
        <StatCard
          icon={Gauge}
          label="Score moyen"
          value={stats.avgScore !== null ? `${stats.avgScore}/100` : "—"}
          hint="Sur les sites testés"
        />
        <StatCard
          icon={Activity}
          label="Tests effectués"
          value={String(stats.totalTests)}
          hint="Historique cumulé"
        />
        <StatCard
          icon={Clock}
          label="Tenant"
          value={tenantId.slice(0, 10) + "…"}
          hint="Votre organisation"
        />
      </section>

      {/* === Mes sites === */}
      <section id="sites" className="mt-8 scroll-mt-4">
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Mes sites
                </CardTitle>
                <CardDescription>
                  Chaque analyse ajoute automatiquement le site à votre tenant
                  et déclenche une surveillance périodique.
                </CardDescription>
              </div>
            </div>
            <div className="mt-3">
              <AddSiteForm tenantId={tenantId} onAdded={refresh} />
            </div>
            <div className="mt-4">
              <DashboardFiltersBar
                q={filters.q}
                sort={filters.sort}
                total={pagination.total}
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {sites.length === 0 ? (
              <div className="mx-6 mb-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 px-6 py-12 text-center">
                {filters.q || stats.siteCount === 0 ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">
                      Aucun résultat{filters.q ? ` pour « ${filters.q} »` : ""}
                    </p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      {stats.siteCount === 0
                        ? "Saisissez une URL ci-dessus pour lancer votre premier audit Lighthouse."
                        : "Essayez un autre terme ou réinitialisez les filtres."}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Aucun site pour l'instant</p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      Saisissez une URL ci-dessus pour lancer votre premier audit
                      Lighthouse. Le site sera ensuite surveillé automatiquement.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {sites.map((site) => (
                  <div
                    className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/30"
                    key={site.id}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/sites/${site.id}`}
                          className="truncate text-sm font-medium transition-colors hover:text-primary"
                        >
                          {site.name}
                        </Link>
                        <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">
                          {site.category}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {site.url} · {site.testCount} test{site.testCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    {site.scoreHistory.length >= 2 ? (
                      <Sparkline
                        data={site.scoreHistory}
                        width={70}
                        height={24}
                        stroke={
                          (site.lastTest?.performance ?? 0) >= 90
                            ? "rgb(16 185 139)"
                            : (site.lastTest?.performance ?? 0) >= 50
                            ? "rgb(245 158 11)"
                            : "rgb(244 63 94)"
                        }
                        fill={
                          (site.lastTest?.performance ?? 0) >= 90
                            ? "rgb(16 185 139)"
                            : (site.lastTest?.performance ?? 0) >= 50
                            ? "rgb(245 158 11)"
                            : "rgb(244 63 94)"
                        }
                        className="hidden shrink-0 md:inline-block"
                      />
                    ) : (
                      <span className="hidden w-[70px] shrink-0 text-right text-[10px] text-muted-foreground md:inline">
                        —
                      </span>
                    )}
                    {site.lastTest ? (
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-xs text-muted-foreground md:inline">
                          LCP {site.lastTest.lcp.toFixed(2)}s ·{" "}
                          {formatRelative(site.lastTest.createdAt)}
                        </span>
                        <ScoreBadge score={site.lastTest.performance} />
                      </div>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Pas encore testé
                      </span>
                    )}
                    <div className="ml-1 flex shrink-0 items-center gap-1">
                      <Link
                        href={`/dashboard/sites/${site.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={`Détails pour ${site.name}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <DeleteSiteButton siteId={site.id} siteName={site.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {pagination.totalPages > 1 && (
            <div className="border-t border-border/40 px-6 py-3">
              <PaginationBar
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                perPage={pagination.perPage}
                q={filters.q}
                sort={filters.sort}
              />
            </div>
          )}
        </Card>
      </section>

      {/* === Tests récents === */}
      {recentTests.length > 0 && (
        <section id="tests" className="mt-8 scroll-mt-4">
          <Card className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Tests récents
              </CardTitle>
              <CardDescription>
                Les {recentTests.length} dernières mesures sur vos sites.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-2 text-left font-medium">Site</th>
                      <th className="px-3 py-2 text-left font-medium">Appareil</th>
                      <th className="px-3 py-2 text-right font-medium">Score</th>
                      <th className="px-6 py-2 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {recentTests.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-6 py-3">
                          <p className="truncate font-medium">{t.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.url}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {t.device}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <ScoreBadge score={t.performance} />
                        </td>
                        <td className="px-6 py-3 text-right text-xs text-muted-foreground">
                          {formatRelative(t.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* === Note de bas de page === */}
      <footer className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span>
          Données privées à votre tenant. Jamais partagées avec d&apos;autres
          organisations.
        </span>
      </footer>
    </main>
  );
}