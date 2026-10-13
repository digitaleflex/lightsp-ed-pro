"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart,
} from "recharts";
import {
  Globe, Gauge, Zap, Clock, Activity, ExternalLink, ArrowLeft,
  Monitor, Smartphone, Layers, Database,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/lightspeed/sparkline";
import { DeleteSiteButton } from "@/components/dashboard/delete-site-button";
import { RemeasureButton } from "@/components/dashboard/remeasure-button";
import { useDashboardPolling } from "@/hooks/use-dashboard-polling";
import { cn } from "@/lib/utils";

interface SiteInfo {
  id: string;
  name: string;
  url: string;
  category: string;
  createdAt: string;
}

interface TestRecord {
  id: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  cls: number;
  inp: number | null;
  fcp: number;
  ttfb: number;
  tbt: number;
  si: number;
  totalWeight: number;
  device: string;
  source: string;
  createdAt: string;
}

interface Stats {
  count: number;
  avgScore: number | null;
  minScore: number | null;
  maxScore: number | null;
  avgLcp: number | null;
  minLcp: number | null;
  maxLcp: number | null;
  avgCls: number | null;
  lastTestAt: string | null;
}

interface SiteDetailClientProps {
  site: SiteInfo;
  tests: TestRecord[];
  stats: Stats;
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
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20";
  if (score >= 50) return "text-amber-600 bg-amber-500/10 ring-amber-500/20";
  return "text-rose-600 bg-rose-500/10 ring-rose-500/20";
}

function scoreTrend(prev: number | undefined, current: number): {
  delta: number;
  label: string;
  tone: "up" | "down" | "flat";
} {
  if (prev === undefined || prev === current) {
    return { delta: 0, label: "stable", tone: "flat" };
  }
  const delta = current - prev;
  return {
    delta,
    label: delta > 0 ? `+${delta}` : `${delta}`,
    tone: delta > 0 ? "up" : "down",
  };
}

function StatMini({
  icon: Icon, value, label, hint, tone = "default",
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    default: "text-foreground",
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-rose-600",
  }[tone];
  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-1 text-xl font-semibold tabular-nums", toneClass)}>
            {value}
          </p>
          {hint && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteDetailClient({ site, tests, stats }: SiteDetailClientProps) {
  const [metric, setMetric] = useState<"performance" | "lcp" | "cls" | "inp">("performance");

  // Refresh automatique toutes les 15 s pour voir arriver les nouvelles
  // mesures déclenchées par le scheduler global ou par un autre onglet.
  useDashboardPolling(15_000);
  const latest = tests.length > 0 ? tests[tests.length - 1] : null;
  const previous = tests.length > 1 ? tests[tests.length - 2] : undefined;

  // Données formatées pour recharts
  const chartData = useMemo(
    () =>
      tests.map((t) => ({
        date: formatShortDate(t.createdAt),
        dateFull: new Date(t.createdAt).toLocaleString("fr-FR"),
        performance: t.performance,
        lcp: Number(t.lcp.toFixed(2)),
        cls: Number(t.cls.toFixed(3)),
        inp: t.inp !== null ? Number(t.inp.toFixed(0)) : null,
      })),
    [tests]
  );

  const metricConfig = {
    performance: {
      label: "Score de performance",
      unit: "/100",
      domain: [0, 100] as [number, number],
      color: "hsl(var(--primary))",
      goodDirection: "up",
    },
    lcp: {
      label: "Largest Contentful Paint",
      unit: "s",
      domain: [0, "auto" as const] as [number, number | "auto"],
      color: "#f59e0b",
      goodDirection: "down",
    },
    cls: {
      label: "Cumulative Layout Shift",
      unit: "",
      domain: [0, "auto" as const] as [number, number | "auto"],
      color: "#10b981",
      goodDirection: "down",
    },
    inp: {
      label: "Interaction to Next Paint",
      unit: "ms",
      domain: [0, "auto" as const] as [number, number | "auto"],
      color: "#3b82f6",
      goodDirection: "down",
    },
  } as const;

  const cfg = metricConfig[metric];

  const perfTrend = metric === "performance" && latest && previous
    ? scoreTrend(previous.performance, latest.performance)
    : null;

  const scoreHistory = tests.map((t) => t.performance);

  return (
    <>
      {/* === Header === */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Globe className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {site.name}
              </h1>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {site.category}
              </span>
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="truncate">{site.url}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ajouté le {new Date(site.createdAt).toLocaleDateString("fr-FR")} ·{" "}
              {stats.count} mesure{stats.count > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
          <RemeasureButton
            siteId={site.id}
            siteName={site.name}
            variant="default"
          />
          <DeleteSiteButton
            siteId={site.id}
            siteName={site.name}
            redirectAfter
          />
        </div>
      </header>

      {/* === Stats d'en-tête === */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatMini
          icon={Gauge}
          label="Dernier score"
          value={latest ? `${latest.performance}/100` : "—"}
          hint={latest ? formatRelative(latest.createdAt) : "Aucun test"}
          tone={
            latest
              ? latest.performance >= 90
                ? "good"
                : latest.performance >= 50
                ? "warn"
                : "bad"
              : "default"
          }
        />
        <StatMini
          icon={Activity}
          label="Score moyen"
          value={stats.avgScore !== null ? `${stats.avgScore}/100` : "—"}
          hint={
            stats.minScore !== null && stats.maxScore !== null
              ? `min ${stats.minScore} · max ${stats.maxScore}`
              : undefined
          }
        />
        <StatMini
          icon={Zap}
          label="LCP moyen"
          value={stats.avgLcp !== null ? `${stats.avgLcp.toFixed(2)} s` : "—"}
          hint={
            stats.minLcp !== null && stats.maxLcp !== null
              ? `min ${stats.minLcp.toFixed(2)} · max ${stats.maxLcp.toFixed(2)}`
              : undefined
          }
          tone={
            stats.avgLcp !== null
              ? stats.avgLcp <= 2.5
                ? "good"
                : stats.avgLcp <= 4.0
                ? "warn"
                : "bad"
              : "default"
          }
        />
        <StatMini
          icon={Layers}
          label="CLS moyen"
          value={stats.avgCls !== null ? stats.avgCls.toFixed(3) : "—"}
          tone={
            stats.avgCls !== null
              ? stats.avgCls <= 0.1
                ? "good"
                : stats.avgCls <= 0.25
                ? "warn"
                : "bad"
              : "default"
          }
        />
      </section>

      {/* === Graphique principal === */}
      {tests.length >= 1 && (
        <section className="mt-6">
          <Card className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Évolution dans le temps
                </CardTitle>
                <CardDescription>
                  {tests.length} mesure{tests.length > 1 ? "s" : ""}
                  {perfTrend && (
                    <>
                      {" · "}
                      <span
                        className={
                          perfTrend.tone === "up"
                            ? "text-emerald-600"
                            : perfTrend.tone === "down"
                            ? "text-rose-600"
                            : "text-muted-foreground"
                        }
                      >
                        {perfTrend.tone === "up" ? "↑" : perfTrend.tone === "down" ? "↓" : "→"}{" "}
                        {perfTrend.label} pts
                      </span>
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
                {(["performance", "lcp", "cls", "inp"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetric(m)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      metric === m
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m === "performance" ? "Score" : m.toUpperCase()}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={cfg.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={cfg.color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      stroke="var(--color-border)"
                    />
                    <YAxis
                      domain={cfg.domain}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      stroke="var(--color-border)"
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelFormatter={(_label, payload) => {
                        const item = payload?.[0]?.payload as { dateFull?: string } | undefined;
                        return item?.dateFull ?? "";
                      }}
                      formatter={(value: number | string) => [`${value}${cfg.unit}`, cfg.label]}
                    />
                    <Area
                      type="monotone"
                      dataKey={metric}
                      stroke={cfg.color}
                      strokeWidth={2.5}
                      fill={`url(#grad-${metric})`}
                      dot={{ r: 3, strokeWidth: 2, fill: "var(--color-background)" }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={tests.length < 50}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {metric !== "performance" && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Seuils Google (75e percentile terrain) :{" "}
                  {metric === "lcp" && "bon ≤ 2.5 s · moyen ≤ 4.0 s"}
                  {metric === "cls" && "bon ≤ 0.1 · moyen ≤ 0.25"}
                  {metric === "inp" && "bon ≤ 200 ms · moyen ≤ 500 ms"}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* === Dernier test (détails) === */}
      {latest && (
        <section className="mt-6">
          <Card className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                Dernière mesure
              </CardTitle>
              <CardDescription>
                {formatRelative(latest.createdAt)} · {latest.device} · source {latest.source}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {[
                  { label: "Performance", value: latest.performance, suffix: "/100" },
                  { label: "Accessibilité", value: latest.accessibility, suffix: "/100" },
                  { label: "Bonnes pratiques", value: latest.bestPractices, suffix: "/100" },
                  { label: "SEO", value: latest.seo, suffix: "/100" },
                  { label: "LCP", value: latest.lcp.toFixed(2), suffix: "s" },
                  { label: "CLS", value: latest.cls.toFixed(3), suffix: "" },
                  { label: "INP", value: latest.inp !== null ? latest.inp.toFixed(0) : "—", suffix: "ms" },
                  { label: "FCP", value: latest.fcp.toFixed(2), suffix: "s" },
                  { label: "TTFB", value: latest.ttfb.toFixed(0), suffix: "ms" },
                  { label: "TBT", value: latest.tbt.toFixed(0), suffix: "ms" },
                  { label: "Speed Index", value: latest.si.toFixed(2), suffix: "s" },
                  { label: "Poids total", value: (latest.totalWeight / 1024).toFixed(1), suffix: "MB" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-border/40 bg-background/40 p-3"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums">
                      {m.value}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        {m.suffix}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {latest.device === "mobile" ? (
                    <Smartphone className="h-3.5 w-3.5" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5" />
                  )}
                  {latest.device}
                </span>
                <span>·</span>
                <span>source : {latest.source}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* === Historique complet === */}
      <section className="mt-6">
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Historique complet
              {scoreHistory.length >= 2 && (
                <Sparkline
                  data={scoreHistory}
                  width={80}
                  height={20}
                  stroke="currentColor"
                  className="ml-2 text-primary"
                />
              )}
            </CardTitle>
            <CardDescription>
              {tests.length} mesure{tests.length > 1 ? "s" : ""} au total
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {tests.length === 0 ? (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                Aucune mesure pour ce site.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Appareil</th>
                      <th className="px-3 py-2 text-right font-medium">Score</th>
                      <th className="px-3 py-2 text-right font-medium">LCP</th>
                      <th className="px-3 py-2 text-right font-medium">CLS</th>
                      <th className="px-3 py-2 text-right font-medium">INP</th>
                      <th className="px-3 py-2 text-right font-medium">TTFB</th>
                      <th className="px-6 py-2 text-right font-medium">Poids</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[...tests].reverse().map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-6 py-2.5 text-xs">
                          <div className="font-medium">{formatRelative(t.createdAt)}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(t.createdAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {t.device}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums",
                              scoreColor(t.performance)
                            )}
                          >
                            {t.performance}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                          {t.lcp.toFixed(2)}s
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                          {t.cls.toFixed(3)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                          {t.inp !== null ? `${t.inp.toFixed(0)}ms` : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs">
                          {t.ttfb.toFixed(0)}ms
                        </td>
                        <td className="px-6 py-2.5 text-right tabular-nums text-xs">
                          {(t.totalWeight / 1024).toFixed(1)}MB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}