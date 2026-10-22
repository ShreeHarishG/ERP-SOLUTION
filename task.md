# ERP-SOLUTION (ChainIQ) — Senior Engineering Audit

> **Live status sheet:** see [`TASK_TRACKER.md`](./TASK_TRACKER.md) for completed vs pending work. This file is the original audit. Do not treat it as the current board.

**Repo reviewed:** `ShreeHarishG/ERP-SOLUTION` @ `35b3787` (cloned and read directly)
**Stack:** Next.js 15 (App Router, API routes as backend), Prisma 5 + PostgreSQL (Supabase), FastAPI AI copilot, JWT cookie auth, Zustand + React Query.

**How to read this:** every problem is a numbered **TASK** with Severity, Where, What's wrong, Why it hurts, and Fix. Tasks marked **[verified]** I confirmed by reading the code. Tasks marked **[verify]** are strong suspicions I did not have time to fully confirm. Do P0 first. They are real security holes, not style issues.

> **Important:** your own `SYSTEM_FLAWS_AND_OPTIMIZATION_ROADMAP.md` is **partly outdated**. It lists flaws that are already fixed (inventory race in `inventory.service.ts`, manufacturing N+1, FastAPI pool settings, hardcoded demo password in `Topbar.tsx`), and it misses the biggest holes below. See Task 20.

---

## Summary table

| # | Task | Severity | Type |
|---|------|----------|------|
| 1 | Every public signup becomes `admin` | P0 | Security |
| 2 | `/api/auth/switch-role` = passwordless login as anyone | P0 | Security |
| 3 | Control-tower config/webhook: auth bypass + SSRF + data redirect | P0 | Security |
| 4 | Sales confirm/deliver/cancel are race-prone (no lock, check outside tx) | P0 | Data integrity |
| 5 | Order-number generator creates duplicates under concurrency | P1 | Data integrity |
| 6 | Audit log uses a different DB connection than the transaction | P1 | Correctness/perf |
| 7 | Auth session design (no revoke, no rotation, token in JSON, stale role) | P1 | Security |
| 8 | Unauthenticated routes + FastAPI wide open and trusts client `role` | P1 | Security |
| 9 | No env validation; JWT secrets default to empty string | P1 | Reliability |
| 10 | Error handler leaks internal messages on 500 | P1 | Security |
| 11 | Sales order trusts client prices and product IDs | P1 | Integrity |
| 12 | Interactive transaction timeouts and Supabase pooler config | P1 | Reliability |
| 13 | Unpaginated list endpoints and over-fetching | P2 | Performance |
| 14 | "3 round trips that should be 1" (batch of quick wins) | P2 | Performance |
| 15 | Derived status computed on read, never stored | P2 | Design |
| 16 | In-memory control-tower state (breaks on serverless/multi-instance) | P2 | Design |
| 17 | RBAC rules duplicated in middleware and routes (drift) | P2 | Design |
| 18 | Two schema sources of truth (`schema.sql` vs Prisma) | P2 | Maintainability |
| 19 | Giant page components and mock data mixed with real code | P3 | Maintainability |
| 20 | Stale docs, stray test scripts, no automated tests/CI | P3 | Hygiene |

---

# P0 — FIX BEFORE ANYONE ELSE USES THIS

## TASK 1 — Every public signup becomes an admin  [verified]
- **Where:** `frontend/lib/server/modules/auth/auth.service.ts` → `register()`
- **What's wrong:** the user is created with a hardcoded `role: 'admin'`. `registerSchema` does not take a role, so *anyone* who calls `POST /api/auth/register` gets full admin: user management, audit logs, everything.
- **Why it hurts:** total authorization failure. Admin-only checks in middleware and routes are meaningless if anybody can mint an admin.
- **Fix:**
  1. Default new users to the least-privileged role (e.g. `sales`), or `pending` with `isActive: false` until an admin approves.
  2. Only an admin-only `POST /api/users` may set a role.
  3. If the first user must be admin, bootstrap it via a seed script (you already have `prisma/seed.ts`), not through public signup.
  4. Consider disabling public registration entirely for an internal ERP.

## TASK 2 — `/api/auth/switch-role` lets anyone log in as anyone  [verified]
- **Where:** `frontend/app/api/auth/switch-role/route.ts`
- **What's wrong:**
  - There is **no authentication**.
  - It accepts `body.email` and issues a full access plus 7-day refresh token for that user. No password is checked.
  - The only guard is `NODE_ENV === 'production' && ENABLE_ROLE_SWITCHER !== 'true'`. In dev, staging, preview deployments, or any prod with that flag set, anyone can POST `{"email":"admin@shivfurniture.com"}` and become admin.
- **Fix:**
  - Delete the route for production builds (best). Put it behind `if (process.env.NODE_ENV !== 'development') return 404`.
  - Remove the `body.email` path. Allow only the fixed `DEMO_ACCOUNTS` map keyed by role.
  - Don't ship the flag at all; a leaked env var shouldn't be able to turn this on.
  - Rotate any credentials that were ever exposed (see Task 20).

## TASK 3 — Control-tower endpoints: auth bypass, SSRF, and data redirect  [verified]
- **Where:** `frontend/app/api/control-tower/config/route.ts`, `.../webhook/route.ts`, `lib/server/control-tower/webhook-service.ts`
- **What's wrong:**
  1. `POST /config` checks `if (user && user.role !== 'admin')`. If there's **no user at all** (`null`), the condition is false, so **anonymous requests pass** and can call `updateConfig(body)`.
  2. `updateConfig` lets the caller set `webhookUrl`. An attacker points it at their own server. Every later webhook payload (supply-chain agent data) is then POSTed to them. That's **data exfiltration**.
  3. `PUT /config` is fully unauthenticated and calls `pingWebhook(body.url)` with **any URL** → **SSRF**. They can probe your internal network and cloud metadata endpoints.
  4. `POST /webhook` has **no auth** and triggers outbound `fetch`.
- **Fix:**
  ```ts
  // every handler
  const user = await requireRole('admin');
  if (isErrorResponse(user)) return user;
  ```
  - Validate URLs with zod: https only, an allow-list of hostnames, and block private/loopback/link-local IPs (127.0.0.0/8, 10/8, 172.16/12, 192.168/16, 169.254.169.254).
  - Never let API callers set the webhook URL. Read it from env only, and make the admin UI toggle `mode` only.
  - Webhook ingestion should require a shared-secret HMAC signature header, not a browser session.

## TASK 4 — Sales confirm / deliver / cancel are race-prone  [verified]
- **Where:** `frontend/lib/server/modules/sales/sales.service.ts` → `confirm()`, `deliver()`, `cancel()`
- **What's wrong:** `inventory.service.ts` correctly uses `SELECT … FOR UPDATE`. The sales service does **not**, and it is the heavier user of stock:
  - The status check (`order.status === 'ready'`) happens **outside** the transaction. Two double-clicks or retries both pass the check.
  - Inside the transaction, stock is read with plain `findUnique` (no lock), then written as an absolute value (`onHandQuantity: newOnHand`). Last-write-wins.
  - Double **deliver** → stock deducted twice. Double **confirm** → stock reserved twice. A re-confirm of a `shortage_detected` order **re-reserves on top of its earlier partial reservation**, so reserved stock inflates.
  - `confirm()` computes shortages (and BOM explosions) *before* the transaction from a stale snapshot, then reserves from fresh data. The shortage report can disagree with what was actually reserved.
- **Fix:**
  1. Do everything in one transaction. First lock the order row: `SELECT … FROM sales_orders WHERE id=$1 FOR UPDATE`. Re-check status after locking.
  2. Lock all product rows in a stable order: `WHERE id = ANY($1) ORDER BY id FOR UPDATE`. This avoids deadlocks.
  3. Use atomic arithmetic, not absolute overwrites:
     ```sql
     UPDATE products SET reserved_quantity = reserved_quantity + $1
     WHERE id=$2 AND on_hand_quantity - reserved_quantity >= $1;
     ```
     Check the affected row count.
  4. Make reservation idempotent: store per-order-item `reservedQty` and reserve only the *difference*.
  5. Optionally also accept an `Idempotency-Key` header on state-changing endpoints.
  6. Move the same hardened helper (`lockProducts`, `reserve`, `release`, `deduct`) into `inventory.service.ts` and have sales, manufacturing and purchase **call it**, so there is one place that mutates stock.

---

# P1 — FIX NEXT

## TASK 5 — Order numbers collide under concurrency  [verified]
- **Where:** `lib/server/utils/order-number.ts`
- **What's wrong:** "find latest order, add 1" is a classic race. Two requests read `SO-041` and both try `SO-042`. The unique constraint makes one fail with a raw 500. It also orders by `createdAt`, not by the number itself. The MO/PO versions fall back to scanning the **whole table** (`findMany` of all orders) if the latest row is malformed.
- **Fix:** use PostgreSQL sequences (`CREATE SEQUENCE so_seq;`) and `SELECT 'SO-' || lpad(nextval('so_seq')::text,3,'0')`. It is atomic, lock-free, and 1 query. Backfill with `setval` to the current max.

## TASK 6 — Audit log runs on a different DB connection than the transaction  [verified]
- **Where:** `utils/auditLog.ts` (uses the global `prisma`), called from inside `$transaction` in `inventory.service.ts` (`reserveStock`, `releaseStock`) and `sales.service.ts` (`confirm`, per item).
- **What's wrong:**
  - Inside a transaction the audit insert goes through **another pooled connection**. If the transaction later rolls back, the audit row still says "stock reserved". The audit trail lies.
  - Each interactive transaction holds one connection and then asks for a second. With a small pool this can **self-deadlock under load**.
  - Elsewhere the audit write is *after* the commit and swallows errors, so a committed stock change can have **no audit row**.
- **Fix:** give `createAuditLog` an optional `tx` argument and write audit rows **in the same transaction** for business-critical events. For high-volume or non-critical events, use a transactional outbox table and a worker. Use `createMany` for per-item rows instead of one insert per loop iteration.

## TASK 7 — Auth/session design gaps  [verified]
- **Where:** `auth.service.ts`, `auth/login|refresh/route.ts`, `utils/jwt.ts`, `cookies.ts`, `middleware.ts`
- **What's wrong:**
  1. **Refresh tokens can't be revoked or rotated.** A stolen token works for 7 days, and logout can't kill it.
  2. **Access token is also returned in the JSON body** (`{ user, accessToken }`) on login, register and refresh, which defeats the purpose of `httpOnly` cookies. Any XSS or logging layer can capture it.
  3. **Role and `isActive` live in the JWT.** `requireAuth` never hits the DB, so a deactivated or demoted user keeps full access for up to 15 minutes.
  4. **Middleware treats the mere *presence* of `refresh_token` as authenticated** and decodes the JWT **without verifying the signature**. As UX redirects that is acceptable, but it must never be the security boundary, so every API route must enforce auth itself (see Task 8).
  5. **No rate limiting or lockout** on login/register. Password minimum is 6 characters.
  6. Login writes an audit row with action `user_updated` (wrong action name; makes reports misleading).
- **Fix:**
  - Store refresh tokens (hashed) in a `sessions` table with `family_id`, `expires_at`, `revoked_at`. Rotate on every refresh and revoke the whole family if an old token is reused.
  - Remove `accessToken` from JSON responses.
  - On sensitive actions (or every N minutes) re-check `isActive`/role from the DB, or keep access tokens at ~5 min.
  - Add rate limiting (Upstash/Redis or a DB-backed counter) per IP and per email; require 10+ char passwords.
  - Add a `login`/`logout` value to the audit action enum.

## TASK 8 — Unauthenticated routes, and FastAPI is wide open  [verified]
- **Where:** `app/api/onchain-insights/analytics/route.ts` (no auth call found), `fastapi/main.py`
- **What's wrong:**
  - The route-scan found `onchain-insights/analytics` has no `requireAuth/requireRole/getCurrentUser`. (The other no-auth routes, `health`, `login`, `register`, `refresh`, `logout`, are expected, except Tasks 2 and 3.)
  - FastAPI `/api/chat`: **no authentication**; `allow_origins=["*"]` combined with `allow_credentials=True`; and it forwards the **client-supplied `role`** to the n8n/AI agent. Anyone can call it directly, claim `role: "admin"`, and get admin-level answers.
  - A default n8n webhook URL (`https://api.agents.snsihub.ai/webhook-test/<uuid>`) is **hardcoded as the fallback** in source. Treat it as a leaked secret.
- **Fix:**
  - Add `requireAuth()` to the analytics route. Add a lint/test that fails if any file under `app/api/**/route.ts` lacks an auth call and isn't on an explicit public allow-list.
  - FastAPI: only accept calls from the Next.js server (shared secret header or signed JWT), never from browsers. Derive `role` from the verified token, not the request body. Restrict CORS to your real origin.
  - Remove the hardcoded webhook default, require `N8N_WEBHOOK_URL` in env, and **rotate that webhook**.

## TASK 9 — No environment validation; empty-string secrets  [verified]
- **Where:** `lib/server/env.ts`
- **What's wrong:** `JWT_ACCESS_SECRET: process.env.… ?? ''`. If the variable is missing the app *boots fine* and fails at the first login with "secretOrPrivateKey must have a value", or worse, someone later "fixes" it with a weak value.
- **Fix:** validate at startup with zod. Fail fast with a clear message; require secrets ≥ 32 chars; require `DATABASE_URL`, `DIRECT_URL`, AI keys, etc. Import this `env` module from `instrumentation.ts` so it runs at boot.

## TASK 10 — Error handler leaks internals  [verified]
- **Where:** `lib/server/handle-route.ts`
- **What's wrong:** for status ≥ 500 it still returns `error.message` to the client. Prisma errors contain table/column names and query details. In development it also returns the stack.
- **Fix:** for ≥ 500 return `"Internal Server Error"` plus a correlation id; log the real error server-side. Map known Prisma errors (`P2002` unique → 409, `P2025` not found → 404, `P2003` FK → 400). Also catch `ZodError` → 400 centrally, and malformed JSON (`request.json()` throwing) → 400, not 500.

## TASK 11 — Sales order trusts client prices and product ids  [verified]
- **Where:** `sales.service.ts` → `create()`
- **What's wrong:** `totalAmount` and each line's `unitPrice` come straight from the request. A sales user can create a ₹1 order for an expensive product. Product existence/`isActive` isn't validated before inserts (you rely on an FK error → 500).
- **Fix:** load products in one query (`where id in …`), reject unknown/inactive ids, take the default price from the product table, and only allow a price override for roles that have that permission (record it in the audit log). Compute totals on the server with decimal math (`Prisma.Decimal`), not JS floats.

## TASK 12 — Transaction timeouts and pooler config  [verify]
- **Where:** all `prisma.$transaction(async tx => …)` blocks; `prisma/schema.prisma` datasource.
- **What's wrong:** Prisma's interactive transactions time out at **5 s** by default. `confirm()`/`complete()` loops do 3–5 queries per item against a remote Supabase DB, so large orders can time out and roll back. Also check that the datasource uses a pooled `DATABASE_URL` with `?pgbouncer=true&connection_limit=…` for runtime and a `DIRECT_URL` for migrations.
- **Fix:** set `{ maxWait: 5000, timeout: 20000 }` on heavy transactions, **batch work** (Task 14), and keep slow work (BOM explosion, AI calls, HTTP) **outside** transactions.

---

# P2 — PERFORMANCE & DESIGN

## TASK 13 — Unpaginated lists and over-fetching  [verified in part]
- `InventoryService.list()` returns `findMany` of **all products** with no `take`. Check `products.service.list`, `purchase.service.list` and `dashboard.service` the same way [verify].
- `sales.list` / `manufacturing.list` do paginate, but with `skip`/`take` only. They return no total count and use `include: { product: true }` several levels deep, which ships every column of every related row. A manufacturing list row carries the full BOM and every component.
- **Fix:** shared `paginate()` helper with a max page size; cursor/keyset pagination (`createdAt,id`) for big tables (ledger, audit, orders); return `{ items, nextCursor, total? }`. Replace `include: { product: true }` with explicit `select: { id, sku, name }` for list views, and load detail only on the detail page.

## TASK 14 — "Three handshakes that should be one"  [verified]
Quick wins, each saves round trips (a round trip to a remote Supabase DB is ~20–80 ms):
| Where | Today | Do this instead |
|---|---|---|
| `register()` | `findUnique(email)` then `create` (2 queries) | Just `create`; catch Prisma `P2002` → 409. **1 query**, and it fixes the signup race. |
| `login()` | find user → bcrypt → **await** audit insert | Don't await the audit write on the hot path (or batch via outbox). |
| `sales.create()` | tx: create order, then `Promise.all(items.create)`, **then** `getById` re-fetch (4+ queries, extra join) | Nested write `items: { create: [...] }` plus `include` in the same call. **1 query, no re-fetch.** (`Promise.all` inside one interactive tx doesn't parallelise anyway; it uses one connection.) |
| `bom.create/update()` | `Promise.all(item.create)` in tx | `createMany` (1 statement). |
| `sales.confirm()` | `findUnique` order → per item: `explode()` (several queries) → then re-read **every product again** inside tx → per item: update + movement insert + audit insert | One locked read of all products, compute in memory, then `updateMany`/raw `UPDATE … FROM (VALUES …)`, `inventoryMovement.createMany`, `auditLog.createMany`. From ~6N queries to ~5 total. |
| `adjust/reserve/release` | `FOR UPDATE` select → update → movement insert → audit | Fine as-is; merge update+movement via raw atomic `UPDATE … RETURNING`. |
| `purchase.receive` / `mfg.complete` | loops of `findUnique` per item/component inside tx | Fetch all needed products once with `where id in`, build a map, then bulk update. |

## TASK 15 — Derived status computed on every read  [verified]
- **Where:** `manufacturing.service.ts` → `mapMOStatus` (also check `purchase.service` and dashboards)
- **What's wrong:** `confirmed` is rewritten in memory to `WAITING_FOR_PROCUREMENT` or `READY_TO_START`, but the DB still says `confirmed`. Filtering by status in SQL, dashboards, and any future API consumer disagree with the UI. The function also mutates the Prisma result object. The N+1 is gone (good), but it now requires loading the full BOM + components on every list call just to colour a badge.
- **Fix:** make shortage state explicit and stored (`hasShortage` boolean or a real status), updated in the same transaction as the stock movements that affect it. Show lists without BOM joins.

## TASK 16 — Control-tower state lives in process memory  [verified]
- **Where:** `webhook-service.ts` (`towerConfig`, stats)
- **What's wrong:** config and stats are module variables. On Vercel/serverless or more than one Node process, each instance has its own copy; they reset on every deploy and cold start, so "admin switched to webhook mode" silently reverts.
- **Fix:** persist config in a DB table (`system_settings`) and event/stat counters in a table or Redis. Keep the fetch timeouts you already have (4–6 s), and add retries with backoff plus a dead-letter log.

## TASK 17 — RBAC rules duplicated in middleware and routes  [verified]
- Role→route rules are hand-written in `middleware.ts`, again inside each route (`requireRole('admin', …)`), and again in the UI (menu hiding, `Topbar`). They will drift.
- **Fix:** one `permissions.ts` matrix (`resource → action → roles[]`) imported by middleware, API routes and UI. Use it as `requirePermission('sales:confirm')`. Add a test that asserts every API route declares a permission.

## TASK 18 — Two sources of truth for the schema  [verified]
- Both `database/schema.sql` (+ `seed.sql`) and `frontend/prisma/schema.prisma` + a single migration exist. They will diverge (and the raw SQL in `inventory.service.ts` hardcodes column names like `on_hand_quantity`).
- **Fix:** make Prisma migrations the only source; delete or auto-generate `schema.sql`. Add a CI step `prisma migrate diff --exit-code` plus a test that runs the raw queries against a test DB. Add CHECK constraints in SQL: `on_hand_quantity >= 0`, `reserved_quantity >= 0`, `reserved_quantity <= on_hand_quantity`. These are the last line of defence against race bugs.

---

# P3 — MAINTAINABILITY

## TASK 19 — Giant components, and mock data mixed with real code  [verified]
- Page files of 700 to 1,278 lines (`onchain-insights/analytics/page.tsx` 1,278, `mitigation` 1,174, `disruptions` 1,014, `sku-transition` 972). About 45k lines of repo code; a large share is `lib/mock-data/**` and `types/onchain-insights.ts` (1,318 lines).
- The Onchain Insights module appears driven mostly by mock data [verify which routes hit the DB]. Real and fake paths share the same service layer, so it's easy to ship mock numbers as if they were real.
- **Fix:** split pages into a server page + small client components (table, filters, charts); lazy-load chart libs with `next/dynamic({ ssr:false })`; move mock data behind one `USE_MOCK_DATA` flag in a clearly separated `mocks/` adapter implementing the same interface as the real service; add a visible "demo data" banner in the UI.

## TASK 20 — Stale docs, stray scripts, no tests  [verified]
- `SYSTEM_FLAWS_AND_OPTIMIZATION_ROADMAP.md` has local Windows paths (`file:///w:/chainiq/...`) and describes bugs that are fixed; it doesn't mention Tasks 1–11. Update or delete it so it can't mislead reviewers.
- `frontend/` root contains `test_purchase_flow.ts`, `test_rejection_flow.ts`, `test_ai_engine.ts`, `scratch_test.ts`, `test-db.ts`, and `fastapi/test_*.py`. These look like manual scripts. Check that none contain real credentials, URLs or user data (also run `git log -p | grep -i "password\|secret\|key"` over history). Convert the good ones into real tests and delete the rest.
- No test runner in `package.json` (only `lint`). No CI.
- **Fix:** add Vitest + a test Postgres (docker compose). Priority tests: (a) concurrent confirm/deliver on the same order (Task 4), (b) register cannot create admin (Task 1), (c) every route requires auth unless allow-listed, (d) order-number uniqueness under parallel creates. Add a GitHub Action: `lint → typecheck → prisma validate → test`.

---

# System design review

## What's good (keep it)
- Clean module layout: `lib/server/modules/<domain>/{service,validation}` + thin route handlers + `handleRoute` wrapper.
- zod validation at the edge; httpOnly cookies; bcrypt; audit-log concept; stock ledger (`inventoryMovement` with before/after) is the right idea; `FOR UPDATE` in `inventory.service.ts` is the correct pattern.
- FastAPI pool settings are already production-grade (`pool_pre_ping`, recycle).

## What's wrong with the design
1. **Stock logic is copy-pasted** across 4 services, and only one is correct. → One `StockLedger` module.
2. **State machines are implicit strings** (`draft → ready/shortage_detected → delivered/cancelled`), checked ad hoc outside transactions. → Explicit transition table + checks under lock.
3. **Side effects are inline** (audit, AI calls, BOM explosion, webhook HTTP) inside request/transaction scope. → Outbox + background worker.
4. **No idempotency**: retries and double-clicks repeat money/stock effects.
5. **Cross-service coupling**: `sales → boms`, `manufacturing → boms/sales/purchase`, `purchase → manufacturing` (waiting-MO re-check). → Move cross-domain reactions to domain events ("StockReceived" → "RecheckWaitingMOs").
6. **Security is by convention**, not by construction (each route must remember to call `requireRole`).
7. **Process-local state** for control tower config/stats.

## How I'd rebuild it (target architecture)
```
Browser ── Next.js (UI only, server components + small client islands)
              │  session cookie (httpOnly, rotating refresh, sessions table)
              ▼
        API layer (route handlers)  ── withAuth(permission) wrapper: auth + RBAC + zod + errors + rate-limit
              ▼
        Domain services (sales, purchasing, manufacturing, inventory, boms)
              │   all stock changes only via ──► StockLedger (locks, atomic SQL, movements, audit in same tx)
              │   emits events ──► outbox table
              ▼
        PostgreSQL (Prisma migrations only; CHECK constraints; sequences for doc numbers)
              ▲
        Worker (cron / queue): outbox → audit enrichment, notifications, n8n/AI webhooks (retry, DLQ)

FastAPI AI copilot: private network / shared-secret only, role derived from verified session, no browser access
```

### Phased plan
| Phase | Goal | Tasks |
|---|---|---|
| **0 — Today (hours)** | Stop the bleeding | 1, 2, 3, 8 (analytics auth + FastAPI secret, rotate webhook), 9 |
| **1 — This week** | Data integrity | 4, 5, 6, 11, 12, DB CHECK constraints (18) |
| **2 — Next 2 weeks** | Session + errors + speed | 7, 10, 13, 14, 15 |
| **3 — Month** | Structure | 16, 17, `StockLedger`, state-machine tables, outbox + worker, tests + CI (20) |
| **4 — Later** | Hygiene | 18, 19, doc cleanup |

---

# How the code works (so you can explain it)

**Request path:** Browser → `middleware.ts` (redirect-only auth check, role redirects) → `app/api/**/route.ts` → `handleRoute()` (try/catch → JSON) → `requireAuth/requireRole()` (verifies JWT from the cookie) → zod schema → **service class** → Prisma → PostgreSQL → `createAuditLog()`.

**Core business flow (the heart of the ERP):**
```
Sales Order (draft)
   └─ confirm ──► reserve free stock per line
        ├─ everything reserved ──► status READY ──► deliver ──► on_hand↓, reserved↓ ──► DELIVERED
        └─ shortage ──► status SHORTAGE_DETECTED (+ BOM explosion report in notes)
              ├─ product has BOM ──► Manufacturing Order (confirmed → WAITING_FOR_PROCUREMENT | READY_TO_START)
              │       └─ start ──► consume components ──► complete ──► finished goods in stock ──► re-check waiting SO
              └─ raw material short ──► Purchase Order (RFQ → quotation → confirm → receive)
                      └─ receive ──► stock↑ ──► re-check waiting Manufacturing Orders
```
Every stock change writes an **InventoryMovement** row (before/after quantities), which forms your ledger. That's why centralizing writes (Task 4) matters: one buggy path corrupts the ledger for everyone.

**Auth flow:** login → bcrypt compare → sign access JWT (15 m) + refresh JWT (7 d) → set httpOnly cookies. Access token expires → client calls `/api/auth/refresh` → new access token. Middleware redirects unauthenticated browsers; **the API routes are the real gatekeepers**.

**AI parts:** `lib/server/ai/*` builds a context from DB data and calls an LLM (Grok service) for dashboards and insights. The FastAPI app is a separate copilot that forwards chat to an n8n webhook. The "Control Tower" is a unified webhook gateway that either calls an external webhook or returns simulated mock results.

---

# Scope notes (what I did and did not cover)
- **Read in full:** auth, cookies, JWT, env, handle-route, switch-role, control-tower routes, inventory + sales services, order-number utility, audit log, middleware, FastAPI `main.py`/`database.py`, `next.config.ts`, `package.json`.
- **Scanned (patterns only):** manufacturing, purchase, BOM services; Prisma schema indexes; all API routes for auth calls.
- **Not reviewed in depth:** most frontend pages and components, `ai-*.service.ts`, `dashboard.service.ts`, `risk-scoring.ts`, `purchase.service.ts` internals. Anything marked **[verify]** needs a quick look before you act on it. Send me those files and I'll extend this report.