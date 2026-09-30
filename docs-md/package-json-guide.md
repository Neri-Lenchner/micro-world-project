# What each package.json does

This project is a **pnpm workspace monorepo** — one repo containing several independent packages (three backend services, one frontend app, one shared library), tied together by `pnpm-workspace.yaml` at the root:

```yaml
packages:
  - "Backend/*"
  - "Frontend/*"
  - "Libraries/*"
```

Every folder matching those patterns that has its own `package.json` is a separate package pnpm knows about. That's why there are six `package.json` files instead of one.

Two things worth understanding before reading the per-package breakdown:

- **`dependencies` vs `devDependencies`** — `dependencies` are needed for the code to actually run (e.g. `express`, `mysql2`). `devDependencies` are only needed while developing/building (e.g. `typescript`, `@types/*` type definitions, `vite`). Both get installed locally, but only `dependencies` matter if you ever ship a production build.
- **`"workspace:*"`** — you'll see this instead of a version number (e.g. `"@nltech/rest": "workspace:*"`). It means "use the local copy of this package that lives in this same repo," not a version fetched from the npm registry. pnpm symlinks it in, so any edit to `Libraries/Rest` is instantly reflected in every service that depends on it — no publishing step needed.

---

## Root — `package.json` (`@nltech/monorepo`)

The workspace root. It doesn't run any code itself — it's the entry point for operating on *all* packages at once.

```json
{
  "name": "@nltech/monorepo",
  "version": "1.0.0",
  "description": "This is my monorepo",
  "main": "index.js",
  "scripts": {
    "build": "pnpm recursive run build",
    "start": "pnpm --parallel start"
  },
  "type": "module",
  "devDependencies": {
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "typescript": "^6.0.3"
  }
}
```

- `"start": "pnpm --parallel start"` — runs every package's own `start` script simultaneously. This is what boots the whole system: Auth, Catalog, Gateway, and the Web dev server all come up together.
- `"build": "pnpm recursive run build"` — runs every package's `build` script (TypeScript compilation) in dependency order.
- `devDependencies` (`typescript`, `ts-node`, `nodemon`) — these are shared dev tools every backend service needs. Declaring them once at the root means pnpm installs a single shared copy instead of duplicating them in every service.

---

## `Libraries/Rest` — `@nltech/rest`

The shared internal library. Not a running service — it's a package that Auth, Catalog, and Gateway all import code from (`import { ... } from "@nltech/rest"`), via the `"workspace:*"` link described above.

```json
{
  "name": "@nltech/rest",
  "version": "1.0.0",
  "main": "src/index.ts",
  "dependencies": {
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3"
  }
}
```

What it holds:
- `StatusCode` — an enum of HTTP status codes, so services don't hardcode magic numbers like `404`.
- Client error classes (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ResourceNotFound`, `RouteNotFound`) — thrown anywhere in a service, caught centrally.
- `errorMiddleware` — the shared Express error handler every service registers, so all services return errors in the same JSON shape.
- `authMiddleware` — `verifyToken` (require a valid JWT), `verifyAdmin` (require a valid JWT *and* an admin role), used by both Gateway and Auth.

Dependencies: `express` (for the `Request`/`Response`/`NextFunction` types the middleware needs) and `jsonwebtoken` (to actually verify tokens). Note: `@types/express` and `@types/jsonwebtoken` sit under `dependencies` here rather than `devDependencies` — harmless (they're compile-time-only either way), just a minor pre-existing inconsistency.

---

## `Backend/Auth` — `@nltech/auth`

The Auth microservice — registration, login, and looking up a user by id. Runs on MySQL.

```json
{
  "name": "@nltech/auth",
  "version": "1.0.0",
  "description": "Auth Microservice",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "nodemon --exec ts-node src/app.ts --quiet"
  },
  "dependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/bcryptjs": "^3.0.0",
    "@types/jsonwebtoken": "^9.0.10",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mysql2": "^3.11.5",
    "@nltech/rest": "workspace:*",
    "bcrypt": "^6.0.0",
    "dotenv": "^17.4.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.6"
  }
}
```

- `express` — the web server framework.
- `mysql2` — the MySQL driver. Auth talks to MySQL directly with raw SQL (no ORM), via a connection pool.
- `bcrypt` (+ `@types/bcrypt`) — hashes passwords before storing them, and compares a submitted password against the stored hash at login.
- `jsonwebtoken` (+ `@types/jsonwebtoken`) — signs the JWT a client gets back after login/register.
- `dotenv` — loads `Backend/Auth/.env` (DB host/user/password, port, JWT secret) into `process.env`.
- `@nltech/rest` — the shared library described above.
- `@types/bcryptjs` — a leftover, unused dependency from the original template (the code uses `bcrypt`, not `bcryptjs`). Harmless, just dead weight.

---

## `Backend/Catalog` — `@nltech/catalog`

The Catalog microservice — product listings. Also MySQL-backed, same raw-SQL pattern as Auth.

```json
{
  "name": "@nltech/catalog",
  "version": "1.0.0",
  "description": "Catalog Microservice - products for sale",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "nodemon --exec ts-node src/app.ts --quiet",
    "seed": "ts-node src/seed.ts"
  },
  "dependencies": {
    "@nltech/rest": "workspace:*",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "multer": "^2.4.0",
    "mysql2": "^3.11.5"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/multer": "^2.2.0"
  }
}
```

- `express`, `mysql2`, `dotenv`, `@nltech/rest` — same roles as in Auth.
- `multer` (+ `@types/multer`) — handles file uploads (product images) from `multipart/form-data` requests. Currently configured with local disk storage (saves into an `uploads/` folder); the storage engine can be swapped for something like Cloudinary later without changing the route or controller code.
- `"seed": "ts-node src/seed.ts"` — a script to populate the database with sample products for local development, run with `pnpm --filter @nltech/catalog seed` (or `cd Backend/Catalog && pnpm seed`).

---

## `Backend/Gateway` — `@nltech/gateway`

The API Gateway — the single entry point the frontend talks to. It doesn't hold any business logic or database connection; it authenticates requests and forwards them to Auth or Catalog.

```json
{
  "name": "@nltech/gateway",
  "version": "1.0.0",
  "description": "API Gateway",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "nodemon --exec ts-node src/app.ts --quiet"
  },
  "dependencies": {
    "@nltech/rest": "workspace:*",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-http-proxy": "^2.1.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/express-http-proxy": "^1.6.6"
  }
}
```

- `express` — the web server framework.
- `express-http-proxy` (+ `@types/express-http-proxy`) — does the actual reverse-proxying: takes an incoming request to e.g. `/api/products`, forwards it to the real Catalog service, and relays the response back.
- `dotenv` — loads `Backend/Gateway/.env` (service URLs, shared JWT secret).
- `@nltech/rest` — for `errorMiddleware` and `authMiddleware` (`verifyToken`/`optionalToken`), used to gate which routes require a login before proxying through.

---

## `Frontend/Web` — `@nltech/web`

The React single-page app.

```json
{
  "name": "@nltech/web",
  "version": "1.0.0",
  "description": "Frontend Web App",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^6.0.3",
    "vite": "^5.4.6"
  }
}
```

- `react`, `react-dom` — the UI library itself.
- `react-router-dom` — client-side routing (Login, Register, Home, Products, Product Details pages all live under one page load).
- `devDependencies`: `vite` (dev server + bundler), `@vitejs/plugin-react` (lets Vite understand JSX/React), `typescript`, `@types/react` / `@types/react-dom` (type definitions — the app is TypeScript, so these aren't optional even though they're "dev-only").
- `"private": true` — a safety flag telling npm/pnpm this package should never accidentally be published to a registry.
