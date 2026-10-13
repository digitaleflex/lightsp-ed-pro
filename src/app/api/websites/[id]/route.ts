import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, createSpeedTest } from "@/lib/db";
import { measureUrl } from "@/lib/measure";

/**
 * Routes disponibles :
 *   - DELETE /api/websites/[id]  → supprime le site + cascade SpeedTests
 *   - POST   /api/websites/[id]  → déclenche une nouvelle mesure (Lighthouse/PSI)
 *
 * Toutes deux vérifient que le site appartient au tenant de l'utilisateur.
 */

async function loadAndAuthorize(
  id: string,
  tenantId: string
): Promise<
  | { ok: true; website: { id: string; url: string; tenantId: string } }
  | { ok: false; status: number; message: string }
> {
  const website = await db.website.findUnique({
    where: { id },
    select: { id: true, url: true, tenantId: true },
  });
  if (!website) return { ok: false, status: 404, message: "Site introuvable" };
  if (website.tenantId !== tenantId) {
    return { ok: false, status: 403, message: "Accès refusé" };
  }
  return { ok: true, website };
}

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

  const result = await loadAndAuthorize(id, session.tenantId);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  let device: "desktop" | "mobile" = "desktop";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.device === "mobile") device = "mobile";
  } catch {
    /* no body, use desktop */
  }

  try {
    const measurement = await measureUrl(result.website.url, device);
    const { source, measuredAt, note, ...data } = measurement;

    const speedTest = await createSpeedTest({
      websiteId: result.website.id,
      performance: data.performance,
      accessibility: data.accessibility,
      bestPractices: data.bestPractices,
      seo: data.seo,
      lcp: data.lcp,
      inp: (data as { inp?: number }).inp ?? data.fid,
      fid: data.fid,
      cls: data.cls,
      fcp: data.fcp,
      ttfb: data.ttfb,
      tbt: data.tbt,
      si: data.si,
      totalWeight: data.totalWeight,
      device,
      region: "europe",
      source,
    });

    // Bump updatedAt pour que le tri par "Activité récente" le fasse remonter
    await db.website.update({
      where: { id: result.website.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      speedTestId: speedTest.id,
      result: { ...data, source, measuredAt, note },
    });
  } catch (e) {
    console.error("[api/websites/:id POST] error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Erreur lors de la mesure",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
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

  try {
    const website = await db.website.findUnique({
      where: { id },
      select: { id: true, tenantId: true, url: true, name: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
    }

    // Isolation multi-tenant : refuse si le site n'appartient pas au tenant
    if (website.tenantId !== session.tenantId) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // La relation Website.tests a onDelete: Cascade, donc les SpeedTests
    // sont supprimés automatiquement.
    await db.website.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      deleted: { id: website.id, url: website.url, name: website.name },
    });
  } catch (e) {
    console.error("[api/websites] delete error:", e);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}