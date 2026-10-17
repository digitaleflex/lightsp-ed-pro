# Déploiement Production — Vélocita

Déploiement conteneurisé (Next.js standalone · Bun · Prisma · PostgreSQL) via Docker Compose, exposé uniquement par le reverse-proxy Traefik (réseau `proxy`). Aucun port hôte n'est publié directement.

---

## 1. Prérequis VPS

- Docker Engine + plugin `compose`.
- Traefik actif avec entrypoints `web` / `websecure`, certresolver `letsencrypt`, et réseau externe `proxy` :
  ```sh
  docker network create proxy
  ```
- DNS : `APP_HOST` (ex. `tryvelocita.eurinhash.com`) doit pointer vers l'IP du VPS.
- Ports 80 et 443 ouverts (uniquement pour Traefik).

---

## 2. Fichiers clés

| Fichier | Rôle |
|---|---|
| `Dockerfile.prod` | Image multi-stage (build → runtime slim + Chromium) |
| `docker-entrypoint-prod.sh` | Migrations (`prisma migrate deploy`) puis démarrage Bun |
| `compose.prod.yml` | Services `velocita-prod-app`, `velocita-prod-db`, `velocita-prod-studio` (profil `admin`) |
| `exemple.env.prod` | Modèle d'environnement → copier en `.env.prod` |

---

## 3. Déploiement initial

```sh
# Récupérer le code
cd /opt/velocita

# Créer et renseigner l'environnement (jamais versionné)
cp exemple.env.prod .env.prod
# → APP_HOST, POSTGRES_PASSWORD, DATABASE_URL, NEXTAUTH_SECRET, clés IA/PSP
# Générer un secret : openssl rand -base64 48

# Lancer le build et le démarrage
docker compose --env-file .env.prod -f compose.prod.yml up -d --build
```

> **Note technique :** `--env-file .env.prod` est obligatoire. L'interpolation `${APP_HOST}` dans les labels Traefik est réalisée par Compose au rendu.

Le certificat TLS (Let's Encrypt) est émis automatiquement dès que le DNS est propagé et que le service `velocita-prod-app` est healthy.

---

## 4. Commandes d'exploitation

| Action | Commande |
|---|---|
| Logs applicatifs | `docker compose --env-file .env.prod -f compose.prod.yml logs -f velocita-prod-app` |
| État des services | `docker compose --env-file .env.prod -f compose.prod.yml ps` |
| Mise à jour (pull + rebuild) | `git pull && docker compose --env-file .env.prod -f compose.prod.yml up -d --build` |
| Redémarrage après rotation de secrets | `docker compose --env-file .env.prod -f compose.prod.yml up -d` |

---

## 5. Migrations

Appliquées automatiquement au démarrage (`prisma migrate deploy`, idempotent). Pour une exécution manuelle :

```sh
docker compose --env-file .env.prod -f compose.prod.yml exec velocita-prod-app \
  prisma migrate deploy --schema ./prisma/schema.prisma
```

---

## 6. Base de données

### Sauvegarde logique (recommandée)

```sh
docker compose --env-file .env.prod -f compose.prod.yml exec -T velocita-prod-db \
  pg_dump -U postgres postgres | gzip > backup_$(date +%F_%H%M).sql.gz
```

### Restauration

```sh
gunzip -c backup_YYYY-MM-DD_HHMM.sql.gz | \
  docker compose --env-file .env.prod -f compose.prod.yml exec -T velocita-prod-db \
  psql -U postgres -d postgres
```

Le volume de production est `velocita-prod-pgdata` (isolé du volume de développement).

---

## 7. Studio (administration DB — optionnel)

Le service `velocita-prod-studio` n'est pas exposé par défaut. Pour un accès temporaire :

```sh
# Décommenter le mapping `ports` dans compose.prod.yml si nécessaire, puis :
docker compose --env-file .env.prod -f compose.prod.yml --profile admin up -d velocita-prod-studio
# Accès via tunnel SSH : ssh -L 54323:127.0.0.1:54323 user@vps
```

---

## 8. Points paramétrables

| Variable | Défaut | Description |
|---|---|---|
| `APP_HOST` | — | Domaine public (Traefik) |
| `TRAEFIK_NETWORK` | `proxy` | Réseau Docker externe |
| `TRAEFIK_CERT_RESOLVER` | `letsencrypt` | Résolveur TLS |
| `MEASURE_ENGINE` | `auto` | `auto` · `lighthouse` · `pagespeed` |
| `APP_IMAGE_TAG` | `prod` | Tag d'image (rollback) |

---

## 9. Sécurité et bonnes pratiques

- `.env.prod` ne doit **jamais** être commité.
- Rotation des secrets : mettre à jour `.env.prod`, puis redémarrer (`up -d`).
- Rollback : modifier `APP_IMAGE_TAG` vers un tag antérieur, puis relancer la commande de mise à jour.
- Un seul réplica est déployé (`replicas: 1`) ; le planificateur tourne dans le processus applicatif.

---

*Document simplifié et professionnalisé. Pour un déploiement automatisé, utiliser le script `scripts/deploy.sh`.*
