"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { LogIn, LogOut, User as UserIcon, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/** SVG inline du logo Google (évite une dépendance supplémentaire). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface UserAuthButtonProps {
  /** Variante visuelle : "navbar" (compact) ou "page" (grand bouton centré). */
  variant?: "navbar" | "page";
  /** CallbackUrl après signIn/signOut (par défaut : page courante). */
  callbackUrl?: string;
}

export function UserAuthButton({ variant = "navbar", callbackUrl }: UserAuthButtonProps) {
  const { data: session, status } = useSession();

  const handleSignIn = () => {
    void signIn("google", { callbackUrl: callbackUrl ?? "/" });
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: callbackUrl ?? "/" });
  };

  if (status === "loading") {
    return (
      <Button
        variant={variant === "page" ? "outline" : "ghost"}
        size={variant === "page" ? "lg" : "sm"}
        disabled
        className="opacity-70"
        aria-label="Chargement de la session"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {variant === "page" && <span>Chargement…</span>}
      </Button>
    );
  }

  if (!session?.user) {
    if (variant === "page") {
      return (
        <Button
          variant="outline"
          size="lg"
          onClick={handleSignIn}
          className="gap-2 shadow-lg shadow-black/5"
        >
          <GoogleIcon className="h-5 w-5" />
          <span>Continuer avec Google</span>
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignIn}
        className="gap-1.5 border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
        aria-label="Se connecter avec Google"
      >
        <GoogleIcon className="h-4 w-4" />
        <span className="font-medium">Connexion</span>
      </Button>
    );
  }

  const user = session.user;
  const displayName =
    user.name?.trim() ||
    (user.email ? user.email.split("@")[0] : "Mon compte");
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group h-9 gap-2 px-2 text-foreground hover:bg-accent"
          aria-label="Ouvrir le menu utilisateur"
        >
          <span className="relative shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Avatar"}
                className="h-8 w-8 rounded-full ring-2 ring-primary/40 transition-all group-hover:ring-primary/70"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground ring-2 ring-primary/40 transition-all group-hover:ring-primary/70">
                {initial}
              </span>
            )}
            {/* Indicateur "connecté" */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </span>
          <span className="hidden max-w-[9rem] truncate text-sm font-medium sm:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-tight">
            {user.name ?? displayName}
          </span>
          {user.email && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          )}
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connecté
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            <span>Mon tableau de bord</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <UserIcon className="h-4 w-4" />
          <span>Profil (à venir)</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}