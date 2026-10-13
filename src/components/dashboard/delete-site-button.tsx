"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DeleteSiteButtonProps {
  siteId: string;
  siteName: string;
  /** Si vrai, après suppression on navigue vers /dashboard. */
  redirectAfter?: boolean;
  className?: string;
}

export function DeleteSiteButton({
  siteId,
  siteName,
  redirectAfter = false,
  className,
}: DeleteSiteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function startConfirm() {
    setConfirming(true);
  }

  function cancel() {
    if (isPending) return;
    setConfirming(false);
  }

  function confirm() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/websites/${encodeURIComponent(siteId)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Échec de la suppression");
        }
        toast({
          title: "Site supprimé",
          description: `${siteName} a été retiré de votre tableau de bord.`,
        });
        setConfirming(false);
        if (redirectAfter) {
          router.push("/dashboard");
        } else {
          router.refresh();
        }
      } catch (err) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Suppression impossible",
          variant: "destructive",
        });
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={startConfirm}
        aria-label={`Supprimer ${siteName}`}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600",
          className
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 p-0.5",
        className
      )}
      role="group"
      aria-label={`Confirmer la suppression de ${siteName}`}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={cancel}
        disabled={isPending}
        className="h-7 px-2 text-muted-foreground hover:text-foreground"
        aria-label="Annuler"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        onClick={confirm}
        disabled={isPending}
        className="h-7 gap-1 bg-rose-600 px-2 text-white hover:bg-rose-700"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        <span className="text-xs font-medium">Supprimer</span>
      </Button>
    </div>
  );
}