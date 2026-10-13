import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Tableau de bord — Vélocita",
  description:
    "Suivez vos sites audités, vos scores de performance et vos tests récents.",
};

export const dynamic = "force-dynamic";

interface RecentTest {
  id: string;
  url: string;
  name: string;
  performance: number;
  device: string;
  createdAt: string;
}

type SortKey = "recent" | "name" | "score-desc" | "score-asc" | "tests";

const PER_PAGE = 10;
const MAX_FETCHED = 500; // garde-fou pour les très gros tenants

interface PageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

function parseSort(raw: string | undefined): SortKey {
  switch (raw) {
    case "name":
    case "score-desc":
    case "score-asc":
    case "tests":
    case "recent":
    case undefined:
    default:
      return "recent";
  }
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/connexion?callbackUrl=/dashboard");
  }

  const tenantId = session.tenantId;
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const sort = parseSort(params.sort);
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  if (!tenantId) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center shadow-xl shadow-black/5 backdrop-blur">
          <h1 className="text-xl font-semibold">Compte en préparation…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nous finalisons la configuration de votre espace. Rafraîchissez la
            page dans quelques secondes.
          </p>
        </div>
      </main>
    );
  }

  // --- Construction du where Prisma (recherche full-text basique) ---
  const where = {
    tenantId,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { url: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // --- Ordre Prisma : on peut faire "recent", "name", "tests" en natif.
  //     Pour les tris par score, on trie côté JS après fetch. ---
  const prismaOrderBy =
    sort === "name"
      ? ({ name: "asc" } as const)
      : sort === "tests"
          ? ({ tests: { _count: "desc" } } as const)
          : ({ updatedAt: "desc" } as const);

  const [user, allWebsites, totalInDb, recentTestsRaw] = await Promise.all([
    db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.website.findMany({
      where,
      orderBy: prismaOrderBy,
      take: MAX_FETCHED,
      include: {
        tests: {
          orderBy: { createdAt: "desc" },
          take: 12,
          select: {
            id: true,
            performance: true,
            lcp: true,
            cls: true,
            inp: true,
            createdAt: true,
            device: true,
          },
        },
        _count: { select: { tests: true } },
      },
    }),
    db.website.count({ where: { tenantId } }),
    db.speedTest.findMany({
      where: { website: { tenantId } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        website: { select: { name: true, url: true } },
      },
    }),
  ]);

  // --- Tri par score côté JS (impossible en SQL pur Prisma sans sous-requête) ---
  let sortedWebsites = allWebsites;
  if (sort === "score-desc") {
    sortedWebsites = [...allWebsites].sort((a, b) => {
      const sa = a.tests[0]?.performance ?? -1;
      const sb = b.tests[0]?.performance ?? -1;
      return sb - sa;
    });
  } else if (sort === "score-asc") {
    sortedWebsites = [...allWebsites].sort((a, b) => {
      const sa = a.tests[0]?.performance ?? Number.POSITIVE_INFINITY;
      const sb = b.tests[0]?.performance ?? Number.POSITIVE_INFINITY;
      return sa - sb;
    });
  }

  // --- Pagination côté JS (après tri pour avoir la bonne page) ---
  const totalFiltered = sortedWebsites.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pagedWebsites = sortedWebsites.slice(start, start + PER_PAGE);

  const recentTests: RecentTest[] = recentTestsRaw.map((t) => ({
    id: t.id,
    url: t.website.url,
    name: t.website.name,
    performance: t.performance,
    device: t.device,
    createdAt: t.createdAt.toISOString(),
  }));

  const totalTests =
    recentTestsRaw.length > 0
      ? await db.speedTest.count({ where: { website: { tenantId } } })
      : 0;

  // Stats calculées sur l'ensemble du tenant (pas de la page)
  const tested = allWebsites.filter((w) => w.tests[0]);
  const avgScore =
    tested.length > 0
      ? Math.round(
          tested.reduce((acc, w) => acc + (w.tests[0]?.performance ?? 0), 0) /
            tested.length
        )
      : null;

  return (
    <DashboardClient
      user={{
        name: user?.name ?? session.user.name ?? null,
        email: user?.email ?? session.user.email ?? "",
        image: session.user.image ?? null,
        memberSince: user?.createdAt?.toISOString() ?? null,
      }}
      tenantId={tenantId}
      sites={pagedWebsites.map((w) => ({
        id: w.id,
        url: w.url,
        name: w.name,
        category: w.category,
        testCount: w._count.tests,
        scoreHistory: [...w.tests].reverse().map((t) => t.performance),
        lastTest: w.tests[0]
          ? {
              performance: w.tests[0].performance,
              lcp: w.tests[0].lcp,
              cls: w.tests[0].cls,
              inp: w.tests[0].inp,
              device: w.tests[0].device,
              createdAt: w.tests[0].createdAt.toISOString(),
            }
          : null,
      }))}
      stats={{
        siteCount: totalInDb,
        testedSiteCount: tested.length,
        avgScore,
        totalTests,
      }}
      pagination={{
        page: safePage,
        perPage: PER_PAGE,
        total: totalFiltered,
        totalPages,
      }}
      filters={{ q, sort }}
      recentTests={recentTests}
    />
  );
}