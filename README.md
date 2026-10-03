# MicroWorld

A marketplace built as a set of microservices, to make the architecture itself visible: every request moves through the services that own it, from the browser to the gateway to the service responsible for that data.

## Architecture

```
Browser → Web (nginx) → Gateway → Auth       → MySQL (micro_world_users_db)
                                → Catalog    → MySQL (micro_world_catalog_db)
                                → Order      → MySQL (micro_world_orders_db)
                                → Watchlist  → MySQL (micro_world_watchlist_db)

       Catalog ⇄ RabbitMQ ⇄ Order ⇄ RabbitMQ ⇄ Payment   → MySQL (micro_world_payments_db)
       (product.reserved/reserve-failed)  (payment.requested/approved/declined, product.release)
```

- **Web** — React + TypeScript (Vite), built as static files and served by nginx.
- **Gateway** — routes `/api/auth/*`, `/api/products/*`, `/api/orders/*`, and `/api/watchlist/*` to the right backend service, verifies JWTs, and forwards the logged-in user's identity downstream.
- **Auth** — registration/login, owns `micro_world_users_db`.
- **Catalog** — product listings and photo uploads, owns `micro_world_catalog_db`.
- **Order** — buying a listing and order history, owns `micro_world_orders_db`. Doesn't call Catalog or Payment directly: it publishes an `order.created` message to RabbitMQ, Catalog reserves the product (an atomic conditional `UPDATE`, so two simultaneous buyers can never both win) and replies with `product.reserved`/`product.reserve-failed`. A reserved order then goes through Payment the same way before resolving to `PAID` or `CANCELLED`.
- **Watchlist** — saving/unsaving listings, owns `micro_world_watchlist_db`. Plain synchronous CRUD, no messaging — it stores only `(user_id, product_id)` pairs and the frontend combines that with Catalog's own product data to render the view.
- **Payment** — a pure RabbitMQ worker with no HTTP API at all (not reachable through the Gateway). Consumes `payment.requested`, simulates processing (~15% random decline, to actually demonstrate the failure path), and replies `payment.approved`/`payment.declined`. On decline, Order publishes `product.release` so Catalog un-reserves the product — the full `Create Order → Reserve → Pay → Confirm` saga from the spec, including the rollback path, without ever touching Catalog's already-tested reservation logic.

Each service owns its own database and its own MySQL user — no service reaches into another's tables directly.

## Running with Docker

This is the fastest way to see the whole stack running — no local Node, MySQL, or `pnpm install` required.

**Prerequisites:** Docker Desktop (or another Docker Compose v2 setup).

**1. Set up secrets**

```
cp .env.example .env
```

Fill in `.env` with your own values for `MYSQL_ROOT_PASSWORD`, `AUTH_DB_PASSWORD`, `CATALOG_DB_PASSWORD`, `ORDER_DB_PASSWORD`, `WATCHLIST_DB_PASSWORD`, `PAYMENT_DB_PASSWORD`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, and `JWT_SECRET_KEY`. This file is gitignored — these are local-only secrets for your own compose stack.

**2. Build and start everything**

```
docker compose up --build
```

This builds seven images (Auth, Catalog, Order, Watchlist, Payment, Gateway, Web) and starts them alongside MySQL and RabbitMQ containers. On first run, MySQL initializes all five databases and their app users from `infrastructure/mysql/init.sh`. Services may log one `ECONNREFUSED` line before MySQL/RabbitMQ finish starting — they're set to restart automatically and will connect as soon as their dependency is healthy.

**3. Open the app**

- Frontend: http://localhost:8080
- Gateway API (direct, optional — mainly for debugging): http://localhost:8081
- RabbitMQ management UI (see the `order.created`/`product.reserved`/`product.reserve-failed` queues live): http://localhost:15672, log in with `RABBITMQ_USER`/`RABBITMQ_PASSWORD` from your `.env`

**Stopping:**

```
docker compose down       # stop everything, keep your data
docker compose down -v    # stop everything and wipe the database + uploaded photos
```

### What's in the compose file

| Service | What it does | Reachable at |
|---|---|---|
| `mysql` | Single MySQL instance, five databases/users (one per service) | internal only |
| `rabbitmq` | Message broker between Catalog, Order and Payment | `localhost:15672` (management UI), `5672` (AMQP) |
| `auth` | Registration/login | internal only (via `gateway`) |
| `catalog` | Listings + photo uploads; reserves/releases products over RabbitMQ | internal only (via `gateway`) |
| `order` | Buying a listing, order/purchase history | internal only (via `gateway`) |
| `watchlist` | Saving/unsaving listings | internal only (via `gateway`) |
| `payment` | Simulated payment processing | not reachable at all — pure RabbitMQ worker |
| `gateway` | Routes `/api/*`, verifies JWTs | `localhost:8081` |
| `web` | nginx serving the built frontend, proxies `/api/` to `gateway` | `localhost:8080` |

Data persists in two named volumes: `mysql_data` (the databases) and `catalog_uploads` (product photos) — both survive `docker compose down`/`up`, and only get wiped with the `-v` flag.

Backend images are a real multi-stage build: TypeScript is compiled in a build stage, and the runtime image runs the compiled JavaScript directly, with no `ts-node`/`typescript`/`nodemon` shipped at runtime.

## Local development without Docker

```
pnpm install
pnpm build   # builds Libraries/Rest once — required before `pnpm start` will work
pnpm start   # runs every service with nodemon + ts-node, hot-reloading on change
```

Each service under `Backend/*` needs its own `.env` (see that service's `.env.example`) pointing at a MySQL instance running on your machine.
