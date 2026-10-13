import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { SiteDetailClient } from "@/components/dashboard/site-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const site = await db.website.findUnique({
    where: { id },
    select: { name: true, url: true },
  });
  if (!site) return { title: "Site introuvable — Vélocita" };
  return {
    title: `${site.name} — Vélocita`,
    description: `Historique de performance et Core Web Vitals pour ${site.url}.`,
  };
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

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/connexion?callbackUrl=/dashboard/sites/${id}`);
  }
  if (!session.tenantId) {
    redirect("/connexion?callbackUrl=/dashboard");
  }

  const site = await db.website.findUnique({
    where: { id },
    include: {
      tests: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          performance: true,
          accessibility: true,
          bestPractices: true,
          seo: true,
          lcp: true,
          cls: true,
          inp: true,
          fcp: true,
          ttfb: true,
          tbt: true,
          si: true,
          totalWeight: true,
          device: true,
          source: true,
          createdAt: true,
        },
      },
    },
  });

  // 404 si le site n'existe pas OU n'appartient pas au tenant
  // (isolation multi-tenant : on ne révèle pas l'existence d'un site d'un autre tenant)
  if (!site || site.tenantId !== session.tenantId) {
    notFound();
  }

  const tests: TestRecord[] = site.tests.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  const latest = tests.length > 0 ? tests[tests.length - 1] : null;

  // Statistiques utiles pour l'en-tête
  const scores = tests.map((t) => t.performance);
  const lcpValues = tests.map((t) => t.lcp);
  const clsValues = tests.map((t) => t.cls);
  const avgScore = tests.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const minLcp = lcpValues.length > 0 ? Math.min(...lcpValues) : null;
  const maxLcp = lcpValues.length > 0 ? Math.max(...lcpValues) : null;
  const avgLcp = lcpValues.length > 0
    ? lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length
    : null;
  const avgCls = clsValues.length > 0
    ? clsValues.reduce((a, b) => a + b, 0) / clsValues.length
    : null;
  const minScore = scores.length > 0 ? Math.min(...scores) : null;
  const maxScore = scores.length > 0 ? Math.max(...scores) : null;
  const lastTestAt = latest?.createdAt ?? null;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
      <SiteDetailClient
        site={{
          id: site.id,
          name: site.name,
          url: site.url,
          category: site.category,
          createdAt: site.createdAt.toISOString(),
        }}
        tests={tests}
        stats={{
          count: tests.length,
          avgScore,
          minScore,
          maxScore,
          avgLcp,
          minLcp,
          maxLcp,
          avgCls,
          lastTestAt,
        }}
      />
    </main>
  );
}