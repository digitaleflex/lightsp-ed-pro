"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * SessionProvider pour NextAuth côté client.
 * Permet à useSession() / signIn() / signOut() de fonctionner dans
 * n'importe quel composant client descendant.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}