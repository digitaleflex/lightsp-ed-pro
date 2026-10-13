"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Rafraîchit la page Next.js à intervalle régulier tant que l'onglet est
 * visible. Utile pour le dashboard : un nouveau test ajouté en arrière-plan
 * apparaît automatiquement sans action de l'utilisateur.
 *
 * Comportement :
 * - Polling toutes les `intervalMs` ms
 * - Pause automatique si l'onglet est caché (économie batterie / requêtes)
 * - Refresh immédiat quand l'onglet redevient visible (l'utilisateur revient)
 * - Cleanup propre au démontage
 */
export function useDashboardPolling(intervalMs = 30_000) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (timer) return;
      timer = setInterval(() => {
        if (
          typeof document !== "undefined" &&
          document.visibilityState === "visible"
        ) {
          router.refresh();
        }
      }, intervalMs);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        // L'utilisateur revient sur l'onglet : refresh immédiat
        router.refresh();
        start();
      } else {
        stop();
      }
    }

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);
}