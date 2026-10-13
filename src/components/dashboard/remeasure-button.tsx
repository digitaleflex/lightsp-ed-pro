"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RemeasureButtonProps {
  siteId: string;
  siteName: string;
  /** Variante visuelle : "default" (CTA principal) ou "outline" (secondaire). */
  variant?: "default" | "outline" | "ghost";
  /** Taille : "sm" ou "lg". */
  size?: "sm" | "lg";
}

export function RemeasureButton({
  siteId,
  siteName,
  variant = "default",
  size = "sm",
}: RemeasureButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);

  function handleClick() {
    setProgress("Démarrage de la mesure…");
    startTransition(async () => {
      // Petit feedback progressif pendant l'attente (mesure = 30-60s)
      const t1 = setTimeout(() => setProgress("Connexion au site…"), 5_000);
      const t2 = setTimeout(() => setProgress("Exécution de l'audit Lighthouse…"), 15_000);
      const t3 = setTimeout(
        () => setProgress("Finalisation (presque fini)…"),
        40_000
      );

      try {
        const res = await fetch(
          `/api/websites/${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ device: "desktop" }),
          }
        );
        const payload = await res.json();
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);

        if (!res.ok || !payload.success) {
          throw new Error(payload.error || "Échec de la mesure");
        }

        const score = payload.result?.performance;
        toast({
          title: `Nouvelle mesure ✓ ${siteName}`,
          description:
            typeof score === "number"
              ? `Score : ${score}/100 (source : ${payload.result?.source ?? "inconnue"})`
              : "Mesure enregistrée dans l'historique.",
        });
        setProgress(null);
        router.refresh();
      } catch (err) {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        setProgress(null);
        toast({
          title: "Échec de la mesure",
          description:
            err instanceof Error ? err.message : "Erreur inconnue",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleClick}
        disabled={isPending}
        variant={variant}
        size={size}
        className={cn(
          "gap-1.5",
          variant === "default" && "shadow-lg shadow-primary/25"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mesure…</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Re-mesurer</span>
          </>
        )}
      </Button>
      {isPending && progress && (
        <p className="text-[10px] text-muted-foreground">{progress}</p>
      )}
    </div>
  );
}