import type { DefaultSession } from "next-auth";

/**
 * Augmentation des types NextAuth.
 * - `session.user.id` : Google `sub`, rempli par le callback session().
 * - `session.tenantId` : ID du Tenant personnel, rempli via le JWT callback
 *   après provisioning auto (création User + Tenant à la 1re connexion).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
    tenantId?: string;
  }
}