# Billing — Facturation FedaPay (FCFA / XOF)

Implémentation de la facturation Velocita : plans en base, prix en **FCFA (XOF)**,
paiement via **FedaPay** (Mobile Money T-Money/Moov/MTN + carte bancaire).

> Marché cible : UEMOA (Togo, Bénin, Côte d'Ivoire, Sénégal, Niger).
> ⚠️ FedaPay ne supporte que **XOF** pour les transactions — le Cameroun (XAF,
> zone CEMAC) est hors périmètre tant qu'aucun second PSP n'est branché.

---

## 1. Architecture

```
pricing.tsx (client)
  │  GET /api/plans            ← prix éditables par l'admin (table Plan)
  │  POST /api/billing/checkout
  ▼
/api/billing/checkout ──► Payment(pending) ──► FedaPay POST /v1/transactions
        │                                              │
        │                                              ▼
        │                                    POST /v1/transactions/{id}/token
        │                                              │
        ▼                                              ▼
   renvoie { url }  ─────────────────────►  redirection page FedaPay
                                                        │
                        ┌───────────────────────────────┼─────────────────┐
                        ▼                               ▼                 │
        GET /api/billing/callback            POST /api/billing/webhook ◄──┘
        (retour utilisateur)                 (confirmation asynchrone)
                        └──────────► activateSubscription() ◄────────────┘
                                             (idempotent, upsert par tenant)
```

**Règle d'or** : jamais se fier au statut de l'URL de callback.
On revérifie via `GET /v1/transactions/{id}` (voir `fedapay.ts → getTransaction`).

---

## 2. Modules

| Fichier | Rôle |
|---|---|
| `src/lib/billing/catalog.ts` | **Client-safe** : types, `DEFAULT_PLANS`, `formatXof`, `effectivePrice`. Aucune importation Prisma (sinon le bundle client casse). |
| `src/lib/billing/plans.ts` | **Serveur** : lecture/seed de la table `Plan` avec fallback `DEFAULT_PLANS`. |
| `src/lib/billing/fedapay.ts` | Client REST FedaPay (fetch, pas de SDK tiers) : `createTransaction`, `createPaymentUrl`, `getTransaction`, `verifyWebhookSignature`, `periodEnd`. |
| `src/lib/billing/subscription.ts` | Cycle de vie : `activateSubscription` (idempotent), `getActiveSubscription`, `mapFedaPayStatus`. |

### Routes

| Route | Méthode | Rôle | Auth |
|---|---|---|---|
| `/api/plans` | GET | Plans actifs + **seed lazy** si la table est vide | publique |
| `/api/billing/checkout` | GET | Crée le Payment + transaction FedaPay → `{ url }` | session |
| `/api/billing/callback` | GET | Retour utilisateur → vérifie via API → active → redirige | — |
| `/api/billing/webhook` | POST | Confirmation FedaPay → vérifie → active (retryable) | signature |
| `/api/billing/subscription` | GET | Abonnement courant du tenant | session |

### Schéma Prisma

- **`Plan`** — source de vérité tarifaire : `slug`, `priceXof`, `priceAnnualXof`,
  `features Json`, limites (`maxSites`, `testsPerMonth`, `retentionDays`,
  `monitorIntervalMin`), `highlighted`, `badge`, `ctaLabel`, `sortOrder`, `active`.
- **`Subscription`** — 1 par tenant (unique), `status`, `interval`, période courante.
- **`Payment`** — `reference` (interne, ex. `VLC-…`), `providerTransactionId`,
  `amountXof`, `status`, `interval`.

---

## 3. Grille tarifaire (validée)

| Plan | slug | FCFA/mois | -20 % annuel | Cible |
|---|---|---|---|---|
| Découverte | `decouverte` | **0** | 0 | 3 sites · 10 tests/mois · histo 7 j |
| Starter | `starter` | **5 000** | 4 000 | 5 sites · tests illimités · histo 30 j |
| Pro ★ | `pro` | **15 000** | 12 000 | 10 sites · monitoring horaire · histo 12 mois |
| Entreprise | `entreprise` | **65 000** | 52 000 | Illimité · tests/5 min · RUM · API · SSO |

Prix modifiables **en 1 clic** via la table `Plan` (dashboard admin à venir) :
la pricing page refait un `GET /api/plans` au montage, sans rebuild.

---

## 4. Mise en route

### 4.1 Comptes
1. Sandbox : <https://sandbox.fedapay.com/register>
2. Live : <https://live.fedapay.com/register> (KYC requis pour les retraits)
3. Dashboard → **Clés API** et **Webhooks**

### 4.2 Variables d'env (voir `.env.example`)

```bash
FEDAPAY_MODE=sandbox            # sandbox | live — ne jamais mélanger
FEDAPAY_SECRET_KEY=             # clé secrète serveur
FEDAPAY_PUBLIC_KEY=             # optionnelle
FEDAPAY_WEBHOOK_SECRET=         # endpoint secret → vérif de signature
NEXTAUTH_URL=https://ton-domaine.fr   # base de callback_url
```

### 4.3 Base de données

```bash
npm run db:start                       # Docker Postgres
npx prisma migrate dev --name billing  # ou db:push
npm run dev
# puis ouvrir /tarifs → le seed lazy remplit la table Plan (4 plans)
```

> Sans Docker, tout reste fonctionnel : `/api/plans` et la page tombent en
> fallback sur `DEFAULT_PLANS`. En revanche le checkout échoue (503) tant que
> les plans ne sont pas en base.

### 4.4 Webhook

URL : `{NEXTAUTH_URL}/api/billing/webhook`
Événements : `transaction.approved`, `transaction.declined`, `transaction.canceled`, …

Vérification de signature : header `X-FEDAPAY-SIGNATURE`
(format `t=<unix>,s=<hmac_sha256>` — **non publié officiellement**, implémentation
défensive dans `verifyWebhookSignature`). Si `FEDAPAY_WEBHOOK_SECRET` est absent,
la signature n'est pas vérifiée **mais le statut est quand même revérifié via
l'API FedaPay** — jamais cru sur parole au payload.

### 4.5 Tests manuels (sandbox)

1. Mode `momo_test` : numéros qui réussissent `64000001` / `66000001`, autres → échec.
2. `/tarifs` → « Passer au Pro » → redirection page FedaPay → paiement test.
3. `GET /api/billing/subscription` → `plan.slug === "pro"`, `status === "active"`.
4. Table `Payment` → `status = approved`.
5. Rejouer le webhook (même payload) → **aucune** double prolongation (idempotence).

---

## 5. Reste à faire

- [ ] **Dashboard admin des plans** : CRUD `/api/admin/plans` + UI (édition en 1 clic).
- [ ] **Enforcement des limites** par plan (`maxSites`, `testsPerMonth`, …) sur les
      routes `/api/websites`, `/api/analyze` — les colonnes existent déjà.
- [ ] **Abonnement affiché** dans le dashboard (`/api/billing/subscription` prêt).
- [ ] Annulation / gestion du renouvellement (`cancelAtPeriodEnd` déjà en place).
- [ ] Facture PDF + e-mail de confirmation.
- [ ] Second PSP pour zones XAF (Cameroun) si le marché l'exige.

---

## 5bis. KKiaPay (second provider)

Second PSP, branché en parallèle de FedaPay (aucun fichier FedaPay modifié).
Client REST natif : `src/lib/billing/kkiapay.ts` (+ `kkiapay-refund.ts`).

### Flow

```
pricing.tsx (client)
  │  POST /api/billing/kkiapay/checkout   ← planSlug + interval
  ▼
/api/billing/kkiapay/checkout ──► Payment(pending, provider=kkiapay)
  │                                   │
  │  renvoie { reference, publicKey, sandbox, callback }
  ▼
openKkiapayWidget({ amount, key, callback, sandbox })  ← SDK https://cdn.kkiapay.me/k.js
  │  (onSuccess → transactionId)
  ▼
POST /api/billing/kkiapay/verify  ──► verify (transactions/status) ──► activateSubscription()
  │                                                                    (idempotent, upsert/tenant)
  ▼
GET /api/billing/kkiapay/callback?reference=…&transactionId=…
  (retour widget) ──► même logique de vérif ──► redirect /dashboard?payment=success|failed
```

**Règle d'or** : jamais confiance au statut ni au montant envoyés par le client.
`verify` (et le callback) revérifient le statut via `transactions/status`, et le
montant confirmé (`amount`) doit couvrir `Payment.amountXof`.

### Contrat REST (vérifié depuis le SDK officiel)

| Étape | Requête |
|---|---|
| Vérif | `POST {base}/api/v1/transactions/status` body `{ transactionId }` |
| Refund | `POST {base}/api/v1/transactions/revert` body `{ transactionId }` |

- `{base}` = `https://api-sandbox.kkiapay.me` (sandbox) ou `https://api.kkiapay.me` (live).
- Headers : `Accept: application/json`, `X-API-KEY: <publicKey>`,
  `X-PRIVATE-KEY: <privateKey>`, `X-SECRET-KEY: <secretKey>`.
- Réponse verify : `{ performed_at, type, status, source, amount, fees, reason,
  failureCode, income, transactionId, partnerId, client:{fullname,phone,email} }`.
- Mapping statut (`mapKkiapayStatus`) : `SUCCESS → approved`,
  `FAILED/DECLINED → declined`, `PENDING → pending`, `CANCELED → canceled`,
  `EXPIRED → expired` — mêmes valeurs internes que FedaPay.

### Variables d'env

```bash
KKIAPAY_MODE=sandbox        # sandbox | live — ne jamais mélanger
KKIAPAY_PUBLIC_KEY=         # widget + X-API-KEY
KKIAPAY_PRIVATE_KEY=        # X-PRIVATE-KEY (serveur)
KKIAPAY_SECRET_KEY=         # X-SECRET-KEY (serveur)
```

`isKkiapayEnabled()` exige les **3** clés. Pas de nouvelle dépendance npm (fetch natif).

### Routes

| Route | Méthode | Rôle | Auth |
|---|---|---|---|
| `/api/billing/kkiapay/checkout` | POST | Crée le Payment → `{ reference, publicKey, … }` | session |
| `/api/billing/kkiapay/verify` | POST | Revérifie (status) → active → `{ status, subscriptionActivated }` | session |
| `/api/billing/kkiapay/callback` | GET | Retour widget → revérifie → redirect `/dashboard` | — |

---

## 6. Notes d'implémentation

- **Pas de SDK** : FedaPay est consommé en `fetch` natif (zéro dépendance,
  contrôle total des erreurs/timeouts — `AbortSignal.timeout(15s)`).
- **Idempotence** : callback + webhook peuvent arriver dans les deux sens.
  `activateSubscription` est un upsert par `tenantId`, donc rejouer est sûr.
- **Rate-limit** : `checkout` ajouté à `RATE_POLICIES` (10/h par IP).
- **Plan gratuit** : `checkout` refuse `priceXof === 0` (le CTA pointe `/outil`).
- **Seed** : `ensureDefaultPlans()` n'insère **que** si la table est vide —
  jamais d'écrasement d'une édition admin.
