import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, createSpeedTest } from "@/lib/db";
import { measureUrl } from "@/lib/measure";

/**
 * POST /api/websites/[id]/remeasure
 *
 * Déclenche une mesure réelle (Lighthouse / PSI / simulée) sur un site déjà
 * suivi et ajoute le résultat à l'historique. Auth + ownership requis.
 * Utilisable depuis le bouton "Re-mesurer" de la page détail.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.tenantId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }

  let device: "desktop" | "mobile" = "desktop";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.device === "mobile") device = "mobile";
  } catch {
    /* no body, use desktop */
  }

  const website = await db.website.findUnique({
    where: { id },
    select: { id: true, url: true, tenantId: true },
  });

  if (!website) {
    return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  }

  // Isolation multi-tenant
  if (website.tenantId !== session.tenantId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const measurement = await measureUrl(website.url, device);
    const { source, measuredAt, note, ...result } = measurement;

    const speedTest = await createSpeedTest({
      websiteId: website.id,
      performance: result.performance,
      accessibility: result.accessibility,
      bestPractices: result.bestPractices,
      seo: result.seo,
      lcp: result.lcp,
      inp: (result as { inp?: number }).inp ?? result.fid,
      fid: result.fid,
      cls: result.cls,
      fcp: result.fcp,
      ttfb: result.ttfb,
      tbt: result.tbt,
      si: result.si,
      totalWeight: result.totalWeight,
      device,
      region: "europe",
      source,
      // Le site vient d'être re-mesuré : on bump updatedAt pour le tri "recent"
      ...({} as Record<string, never>),
    });

    // Bump updatedAt du site pour qu'il remonte en tête
    await db.website.update({
      where: { id: website.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      speedTestId: speedTest.id,
      result: { ...result, source, measuredAt, note },
    });
  } catch (e) {
    console.error("[api/remeasure] error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Erreur lors de la mesure",
      },
      { status: 500 }
    );
  }
}