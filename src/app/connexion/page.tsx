import type { Metadata } from "next";
import { UserAuthButton } from "@/components/auth/user-auth-button";
import { Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion — Vélocita",
  description:
    "Connectez-vous à Vélocita avec votre compte Google pour accéder à vos audits et tableaux de bord.",
};

export default function ConnexionPage() {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-3 px-8 pt-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl speed-gradient text-white shadow-lg shadow-primary/30">
              <Zap className="h-6 w-6" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Bienvenue
            </h1>
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour suivre vos audits de performance et
              retrouver vos sites en un clic.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 px-8 py-8">
            <UserAuthButton variant="page" callbackUrl="/dashboard" />
            <p className="text-center text-xs text-muted-foreground">
              En continuant, vous acceptez nos conditions d&apos;utilisation et
              notre politique de confidentialité.
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Authentification sécurisée via Google OAuth. Aucun mot de passe
              stocké chez Vélocita.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}