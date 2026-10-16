#!/bin/sh
# =============================================================================
#  Vélocita — entrypoint PROD
#  1) applique les migrations Prisma (idempotent : `migrate deploy`)
#  2) démarre le serveur Next.js standalone via Bun
#  Aucun secret n'est écrit ici : DATABASE_URL vient de l'environnement.
# =============================================================================
set -eu

echo "[velocita] Prisma migrate deploy…"
prisma migrate deploy --schema ./prisma/schema.prisma

echo "[velocita] Démarrage du serveur (port ${PORT:-3000})…"
exec bun .next/standalone/server.js
