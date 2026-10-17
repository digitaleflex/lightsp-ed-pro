import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserProfileForm } from "@/components/dashboard/user-profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/connexion?callbackUrl=/dashboard/profil");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { tenant: true },
  });

  if (!user) redirect("/connexion?callbackUrl=/dashboard/profil");

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
      <p className="mt-2 text-muted-foreground">Gérez vos informations personnelles et votre organisation.</p>
      <div className="mt-8 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-xl backdrop-blur">
        <UserProfileForm
          user={{
            id: user.id,
            email: user.email,
            name: user.name,
            memberSince: user.createdAt.toISOString(),
            tenantId: user.tenantId,
            tenantName: user.tenant?.name ?? "",
          }}
        />
      </div>
    </main>
  );
}
