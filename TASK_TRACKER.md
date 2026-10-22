# ChainIQ Task Tracker

**Source of truth:** `task.md` (senior engineering audit)  
**Started:** 22 Oct 2026  
**Rule:** do P0 first. Security holes before polish.

| Status | Meaning |
|--------|---------|
| `DONE` | Fixed in this pass and verified in code |
| `PARTIAL` | Core hole closed; remaining follow-up listed |
| `PENDING` | Not started |

---

## Completed

| # | Task | Severity | What shipped |
|---|------|----------|--------------|
| 1 | Public signup no longer mints `admin` | P0 | New users get `sales`. First user in an empty DB is bootstrapped as `admin` via seed/count, not a client-supplied role. Duplicate email is `P2002` → 409. |
| 2 | `/api/auth/switch-role` passwordless login | P0 | Route returns 404 unless `NODE_ENV === 'development'`. Email impersonation path removed; only the fixed `DEMO_ACCOUNTS` map is allowed. |
| 3 | Control-tower auth bypass + SSRF + exfil | P0 | Every config/webhook handler requires auth. Callers cannot set webhook URLs. Ping/dispatch use env URLs only, with HTTPS + private-IP block. Ingest requires HMAC **or** a logged-in admin. |
| 4 | Sales confirm/deliver/cancel races | P0 | Order + products locked `FOR UPDATE`. Stock mutations go through one `stock-ledger` helper with atomic SQL. Per-line `quantityReserved` makes re-confirm idempotent. |
| 5 | Order-number collisions | P1 | `SO`/`MO`/`PO` numbers come from PostgreSQL sequences (`nextval`), not “latest + 1”. |
| 6 | Audit log on a different connection | P1 | `createAuditLog` / `createAuditLogs` accept the transaction client so stock events commit or roll back with the business write. |
| 7 | Auth session gaps (partial) | P1 | `accessToken` removed from JSON. Login/register rate-limited. Register password ≥ 10 chars. Login audit action is `login`. Logout writes `logout`. |
| 8 | Unauthenticated analytics + open FastAPI | P1 | Analytics route requires auth. FastAPI requires `x-internal-secret`, takes role from header (not body), no hardcoded n8n URL, CORS restricted. Browser chat goes through `/api/ai/chat`. |
| 9 | Empty-string JWT secrets | P1 | `env.ts` validates with zod at boot (`instrumentation.ts`). Production secrets must be ≥ 32 chars. |
| 10 | 500s leak internals | P1 | ≥500 returns `"Internal Server Error"` + correlation id. Prisma `P2002`/`P2025`/`P2003` and `ZodError` mapped centrally. |
| 11 | Sales order trusts client prices | P1 | Products loaded and validated server-side. Price comes from `products.sales_price` unless admin/product_manager overrides (audited). Totals use `Prisma.Decimal`. |
| 12 | Interactive tx 5s timeout | P1 | Heavy sales/inventory transactions use `{ maxWait: 5000, timeout: 20000 }`. |

---

## Pending

| # | Task | Severity | Why still open |
|---|------|----------|----------------|
| 7b | Refresh-token revoke / rotation / sessions table | P1 | Needs a `sessions` table, family id, and reuse detection. Rate limit + cookie-only tokens are in; server-side session store is not. |
| 13 | Unpaginated lists + over-fetch | P2 | **DONE this pass:** first 5 rows, then background load of the rest. Slim list selects. Redis/Upstash cache with memory fallback. |
| 14 | Remaining query batching | P2 | Register + sales.create nested write done. BOM `createMany`, confirm bulk `UPDATE … FROM`, purchase/mfg loops still pending. |
| 15 | Derived MO status stored | P2 | `mapMOStatus` still computes waiting/ready on read. |
| 16 | Control-tower config in memory | P2 | Webhook URL is env-only now (so mode-from-env survives), but live `mode` toggle and stats still process-local. |
| 17 | Single RBAC permissions matrix | P2 | Middleware, routes, and UI still each encode roles. |
| 18 | Dual schema (`schema.sql` vs Prisma) | P2 | Sequences + CHECKs added via Prisma migration. `database/schema.sql` not deleted; CI `migrate diff` not added. |
| 19 | Split giant Onchain pages / mock flag | P3 | Pages still 700–1,200 lines; mock data still mixed in. |
| 20 | Tests + CI + stale-doc cleanup | P3 | No Vitest/CI yet. `SYSTEM_FLAWS_AND_OPTIMIZATION_ROADMAP.md` still claims older flaws are “fully resolved”. |

---

## Apply these changes locally

1. Stop the Next.js dev server (it was locking Prisma generate on Windows).
2. From `frontend/`:
   - `npx prisma generate`
   - `npx prisma migrate deploy` (or `prisma migrate dev`) so sequences, `quantity_reserved`, `login`/`logout` audit values, and stock CHECKs exist.
3. Set env (and **rotate** the old n8n webhook — it was hardcoded in source):
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (≥ 32 chars in production)
   - `DATABASE_URL` / `DIRECT_URL`
   - `FASTAPI_INTERNAL_SECRET` (same value on Next and FastAPI)
   - `FASTAPI_URL`, `FASTAPI_CORS_ORIGINS`
   - `N8N_WEBHOOK_URL` (no default)
   - `CONTROL_TOWER_WEBHOOK_URL` / `CONTROL_TOWER_WEBHOOK_SECRET` (optional)
4. Restart Next + FastAPI.

---

## This-week follow-up (recommended order)

1. `sessions` table + refresh rotation (finish Task 7)
2. Shared `paginate()` + slim list `select`s (Task 13)
3. Persist control-tower `mode` in `system_settings` (Task 16)
4. `permissions.ts` matrix (Task 17)
5. Vitest + GitHub Action for register-not-admin, route auth allow-list, concurrent confirm (Task 20)
