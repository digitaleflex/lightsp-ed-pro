import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

/**
 * Configuration NextAuth.js v4 — Google OAuth uniquement.
 *
 * Variables d'environnement requises (.env.local) :
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - NEXTAUTH_SECRET
 *   - NEXTAUTH_URL (ex. http://localhost:3000 en dev)
 *
 * Redirect URI à enregistrer dans Google Cloud Console :
 *   {NEXTAUTH_URL}/api/auth/callback/google
 *
 * Session en JWT. Le provisioning `User` + `Tenant` est **paresseux** :
 * il s'exécute à chaque appel du callback `jwt` si la session n'a pas
 * encore de tenantId ou si l'utilisateur n'existe pas en DB. Idempotent
 * sur l'email — peut donc être appelé en double sans risque.
 */

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "user";
}

/**
 * Crée ou récupère un User + un Tenant personnel pour l'email fourni.
 * - Slug du tenant dérivé du préfixe email, suffixé en cas de collision.
 * - Tenant name = nom fourni ou email.
 * - Idempotent : appelable plusieurs fois sans créer de doublons.
 */
export async function ensureUserTenant(input: {
  email: string;
  name?: string | null;
  googleSub?: string;
}): Promise<{ userId: string; tenantId: string }> {
  const { email, name, googleSub } = input;

  const existing = await db.user.findUnique({
    where: { email },
    include: { tenant: true },
  });
  if (existing) {
    return { userId: existing.id, tenantId: existing.tenantId };
  }

  const baseSlug = slugify(email.split("@")[0] ?? "user");
  let slug = baseSlug;
  for (let i = 1; await db.tenant.findUnique({ where: { slug } }); i++) {
    slug = `${baseSlug}-${i}`;
  }

  const tenant = await db.tenant.create({
    data: { name: name || email, slug },
  });
  const user = await db.user.create({
    data: { email, name: name || null, tenantId: tenant.id },
  });
  await db.tenant.update({
    where: { id: tenant.id },
    data: { ownerId: user.id },
  });

  console.log(
    `[auth] provisionné user=${user.id} tenant=${tenant.id} email=${email} googleSub=${googleSub ?? "n/a"}`
  );

  return { userId: user.id, tenantId: tenant.id };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
  },
  callbacks: {
    /**
     * signIn : on profite du premier passage pour tenter le provisioning
     * rapide (échec non-bloquant — le jwt callback rattrapera au besoin).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!user.email) {
        console.warn("[auth] Google account sans email — connexion refusée");
        return false;
      }
      try {
        await ensureUserTenant({
          email: user.email,
          name: user.name ?? profile?.name ?? null,
          googleSub: account.providerAccountId,
        });
        return true;
      } catch (e) {
        // On NE refuse PAS la connexion : le jwt callback rattrapera en
        // provisioning paresseux. Refuser ici forcerait l'utilisateur à
        // réessayer alors qu'on peut corriger côté serveur.
        console.error(
          "[auth] signIn: provisioning a échoué, rattrapage prévu côté jwt:",
          e
        );
        return true;
      }
    },

    /**
     * jwt : exécuté à la création du JWT et à CHAQUE requête authentifiée.
     * On (re)hydrate toujours tenantId depuis la DB si on a un email —
     * c'est idempotent et ça rattrape :
     *   - les sessions existantes créées avant l'ajout du champ
     *   - les cas où signIn a échoué silencieusement
     *   - toute incohérence JWT/DB
     */
    async jwt({ token, account, user }) {
      // Normalise sub + email depuis account/user si disponibles (1re connexion)
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      } else if (user?.id && !token.sub) {
        token.sub = user.id;
      }
      if (user?.email && !token.email) {
        token.email = user.email;
      }
      if (user?.name && !token.name) {
        token.name = user.name;
      }
      if ((user?.image || (user as any)?.picture) && !token.image) {
        token.image = (user?.image || (user as any)?.picture) as string;
      }

      // Provisioning paresseux : si on a un email mais pas de tenantId,
      // on cherche en DB puis on crée si nécessaire.
      if (token.email && !(token as { tenantId?: string }).tenantId) {
        try {
          const existing = await db.user.findUnique({
            where: { email: token.email },
            select: { tenantId: true },
          });
          if (existing) {
            (token as { tenantId?: string }).tenantId = existing.tenantId;
          } else {
            // Pas encore en DB — provisionner maintenant
            const { tenantId } = await ensureUserTenant({
              email: token.email,
              name: (token.name as string | null | undefined) ?? null,
              googleSub: (token.sub as string | undefined) ?? "unknown",
            });
            (token as { tenantId?: string }).tenantId = tenantId;
          }
        } catch (e) {
          console.error(
            "[auth] jwt: échec provisioning paresseux pour",
            token.email,
            ":",
            e
          );
          // On laisse tenantId undefined — la page affichera le fallback
          // "Compte en préparation" plutôt que de crasher.
        }
      }

      return token;
    },

    /**
     * session : projette tenantId + id user sur la session exposée.
     */
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.name) {
        session.user.name = token.name as string;
      }
      if (session.user && token.image) {
        session.user.image = token.image as string;
      }
      const tenantId = (token as { tenantId?: string }).tenantId;
      if (tenantId) {
        (session as { tenantId?: string }).tenantId = tenantId;
      }
      return session;
    },
  },
};