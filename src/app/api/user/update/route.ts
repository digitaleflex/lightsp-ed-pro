import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await req.json();
    const userId: string = body?.userId;
    const name: string | null = body?.name ?? null;

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    const updated = await db.user.updateMany({
      where: { id: userId, email: session.user.email },
      data: { name },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé ou non autorisé" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: updated.count });
  } catch (e: any) {
    console.error("[user/update]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
