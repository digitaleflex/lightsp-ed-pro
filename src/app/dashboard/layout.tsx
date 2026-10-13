import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardMobileHeader } from "@/components/dashboard/dashboard-mobile-header";

export const dynamic = "force-dynamic";

/**
 * Layout dédié à l'espace utilisateur (/dashboard/*).
 * - Protégé : redirige vers /connexion si non authentifié
 * - Sidebar permanente sur desktop (md+) + barre slim mobile (<md)
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/connexion?callbackUrl=/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardMobileHeader />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}