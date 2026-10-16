# Déploiement PROD — Vélocita (VPS + Traefik)

Déploiement conteneurisé (Next.js standalone + Bun + Prisma + PostgreSQL)
derrière un **Traefik déjà présent** sur le VPS. Aucun port hôte n'est publié :
Traefik est l'unique point d'entrée.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `Dockerfile.prod` | image de prod multi-stage (deps → build → runtime slim + Chromium) |
| `docker-entrypoint-prod.sh` | `prisma migrate deploy` puis démarrage Bun |
| `compose.prod.yml` | `velocita-prod-app` + `velocita-prod-db` (+ `velocita-prod-studio` profil `admin`), réseaux `proxy`/`backend` (`velocita-prod-backend`) |
| `exemple.env.prod` | modèle de variables (copier vers `.env.prod`) |
| `.dockerignore` | contexte de build minimal |

## Prérequis VPS

- Docker Engine + plugin `docker compose`.
- Traefik en fonction, configuré avec :
  - un entrypoint HTTP `web` et un entrypoint HTTPS `websecure` ;
  - un certresolver nommé `letsencrypt` (surchargeable via `TRAEFIK_CERT_RESOLVER`) ;
  - un réseau Docker externe **`proxy`** partagé avec les apps :
    ```sh
    docker network create proxy   # à ne faire qu'une fois, si absent
    ```
- Enregistrement DNS : `A`/`CNAME` `tryvelocita.eurinhash.com` → IP du VPS.
- Les ports 80/443 doivent être ouverts (Traefik seulement).

## Étapes

```sh
# 1. Récupérer le code sur le VPS
cd /opt/velocita            # (ou votre chemin)

# 2. Créer le fichier d'environnement de prod (JAMAIS versionné)
cp exemple.env.prod .env.prod
#   -> renseigner APP_HOST, POSTGRES_PASSWORD, DATABASE_URL, NEXTAUTH_SECRET,
#      clés IA / PSP. Générer les secrets, ex :
#      openssl rand -base64 48   # pour NEXTAUTH_SECRET
#      openssl rand -base64 32   # pour POSTGRES_PASSWORD

# 3. Build + démarrage (les migrations s'appliquent au démarrage de l'app)
docker compose --env-file .env.prod -f compose.prod.yml up -d --build

# 4. Suivre les logs (migrations + serveur)
docker compose --env-file .env.prod -f compose.prod.yml logs -f velocita-prod-app

# 5. État des services
docker compose --env-file .env.prod -f compose.prod.yml ps
```

> ⚠️ `--env-file .env.prod` est **obligatoire** : `env_file:` injecte les variables
> dans le conteneur, mais l'interpolation `${APP_HOST}` des labels Traefik est faite
> par Compose au moment du rendu du fichier.

Le premier certificat TLS est émis par Traefik (Let's Encrypt) dès que le DNS
pointe sur le VPS et que le conteneur `velocita-prod-app` est healthy.

## Migrations

Appliquées automatiquement par `docker-entrypoint-prod.sh` (`prisma migrate deploy`,
idempotent). Pour les jouer manuellement :

```sh
docker compose --env-file .env.prod -f compose.prod.yml exec velocita-prod-app \
  prisma migrate deploy --schema ./prisma/schema.prisma
```

## Studio (admin DB optionnel)

Non exposé par défaut (ni Traefik, ni port hôte). Pour un accès admin, décommenter
temporairement le mapping `ports` du service `velocita-prod-studio` dans `compose.prod.yml`,
puis :

```sh
docker compose --env-file .env.prod -f compose.prod.yml --profile admin up -d velocita-prod-studio
# accès via tunnel SSH : ssh -L 54323:127.0.0.1:54323 user@vps  -> http://localhost:54323
```

## Mise à jour / rollback

```sh
# Rebuild et redéploiement
git pull
docker compose --env-file .env.prod -f compose.prod.yml up -d --build

# Rollback : changer APP_IMAGE_TAG dans .env.prod vers un tag précédent conservé,
# puis relancer la même commande.
```

## Rotation des secrets

1. `POSTGRES_PASSWORD` — côté base : `ALTER USER postgres PASSWORD '<nouveau>'`
   (via `exec db psql`), puis mettre à jour `POSTGRES_PASSWORD` **et** `DATABASE_URL`
   dans `.env.prod`.
2. `NEXTAUTH_SECRET`, clés IA/PSP — régénérer, mettre à jour `.env.prod`.
3. Redémarrer : `docker compose --env-file .env.prod -f compose.prod.yml up -d`
   (recrée `velocita-prod-app` avec les nouvelles variables).
4. Ne jamais committer `.env.prod`.

## Sauvegarde / restauration de la base

Le volume de prod est **`velocita-prod-pgdata`** (distinct du volume dev `supabase_db_data`).

```sh
# Sauvegarde logique (recommandée)
docker compose --env-file .env.prod -f compose.prod.yml exec -T velocita-prod-db \
  pg_dump -U postgres postgres | gzip > backup_$(date +%F_%H%M).sql.gz

# Restauration
gunzip -c backup_YYYY-MM-DD_HHMM.sql.gz | \
  docker compose --env-file .env.prod -f compose.prod.yml exec -T velocita-prod-db \
  psql -U postgres -d postgres
```

Sauvegarder aussi le volume (`docker run --rm -v velocita-prod-pgdata:/data ...`)
si l'on veut une copie physique complète.

## Notes d'exploitation

- **Un seul réplica** (`deploy.replicas: 1`) : le scheduler de surveillance
  tourne dans le process de l'app.
- Le réseau `backend` (nom Docker `velocita-prod-backend`) n'est **pas** `internal: true` :
  l'app a besoin d'un accès Internet sortant (mesures PSI/Lighthouse, APIs IA, PSP).
- Tous les noms (services, conteneurs, réseau backend, volume, image, labels Traefik)
  sont préfixés `velocita-prod` pour ne jamais entrer en conflit avec le compose de
  dev (`docker-compose.yml`) ni d'anciens déploiements.
- `MEASURE_ENGINE=lighthouse|auto` requiert Chromium, déjà installé dans l'image
  (`CHROME_PATH=/usr/bin/chromium`).
- Le `Caddyfile` n'est plus utilisé pour la prod (remplacé par Traefik).

## Points paramétrables

| Variable | Défaut | Description |
| --- | --- | --- |
| `APP_HOST` | — | domaine public servi par Traefik |
| `TRAEFIK_NETWORK` | `proxy` | nom du réseau Docker externe de Traefik |
| `TRAEFIK_CERT_RESOLVER` | `letsencrypt` | nom du certresolver Traefik |
| `MEASURE_ENGINE` | `auto` | `auto` \| `lighthouse` \| `pagespeed` |
| `APP_IMAGE_TAG` | `prod` | tag d'image pour rollback |
