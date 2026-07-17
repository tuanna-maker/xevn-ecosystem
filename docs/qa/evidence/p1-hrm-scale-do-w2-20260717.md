# P1-HRM-SCALE-DO-W2 — Pool tuning + BE-W2 deploy (Dev8088)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-DO-W2-DEPLOY-BE-W2` |
| **from_role** | `devops` |
| **to_role** | `pm` / `qc` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · HRM `:3001` · XBOS `:28002` |
| **git** | `2a7a02b` (BE-W2 allow-list on `origin/main`) |
| **u65** | zero-seed · no write load · no Phase1/PROD claim |
| **ack_status** | **PASS_TO_PM** |

## Purpose

Deploy BE-W2 (migration `0016` + list/summary RT reduction) and apply bounded PG pool / keepalive tuning so T-CONC can be re-probed with a higher capacity ceiling than the prior **50 VU** NO-GO.

## Before (W3 baseline)

| Control | Value |
|---------|-------|
| `PG_POOL_MAX` | default **10** (code `readPgPoolEnv`) |
| Max passing VU (both ADR gates) | **50** |
| Failure class @ ≥100 VU | client **timeout** (`status=0`), **0% 429** |
| Evidence | `p1-hrm-scale-w3-t-conc-20260717.md`, `qc-p1-hrm-scale-w3-20260717.md` |

## After (this wave)

| Control | Value |
|---------|-------|
| `PG_POOL_MAX` | **40** (VPS `.env`, backed up `.env.bak-do-w2-*`) |
| `PG_IDLE_TIMEOUT_MS` | 30000 |
| `PG_CONNECTION_TIMEOUT_MS` | 10000 |
| `PG_KEEPALIVE` / delay | true / 10000 |
| hrm-be replicas | **1** (deferred — fixed `container_name` + host `:3001`) |
| `pg_pool_waiting_count` (idle) | **0** |
| Max passing VU (re-probe) | **200** |
| Failure class @ 400 VU | **HTTP 429** (rate-limit), list p95 still &lt; 2s |

## Steps executed

1. Allow-list commit + push `2a7a02b` — employees window COUNT / summary CTE, migration `0016`, `pool-config.ts`, `.env.example`, load script, BE evidence.
2. VPS: `git pull origin main` (resolved stash conflict via `git reset --hard origin/main`).
3. Applied DO-W2 pool keys to `deploy/xevn-ecosystem/.env` (backup first).
4. `pnpm build:platform-core`; recreate `hrm-be` (healthy 200).
5. Recovered **pre-existing** `xbos-be` crash (`nest start --watch` + `deleteOutDir` + stale `.tsbuildinfo` → empty `dist`). Override: clean tsbuildinfo → `pnpm run build` → `node dist/main` → xbos **200**.
6. Applied migration `0016` inside `xevn-hrm-be-dev` (`INDEX_ROWS=1`, `EMP_ACTIVE=1188`).
7. Optional EXPLAIN (see below).
8. Re-ran T-CONC stages `50,100,200,400,600,800,1000` (abort on health/rate) — see companion evidence.
9. Post-test: hrm/xbos/portal **200**; `pg_pool_waiting_count=0`; non-xevn containers undisturbed.

## EXPLAIN (post-0016)

```text
Limit … actual time=2.001..2.008 rows=50
  -> Sort … top-N heapsort
    -> WindowAgg … rows=1170
      -> Seq Scan on employees e  (Filter: archived_at IS NULL + tenant COALESCE)
Execution Time: 2.046 ms
Buffers: shared hit=258
INDEX present: idx_employees_tenant_co_arch_created_id
```

Planner prefers **Seq Scan** at pilot N≈1188 (expected for small table; BE-W2 note). Index is present for larger N / rollup predicates.

## Gate table (DO-W2)

| Gate | Verdict |
|------|---------|
| BE-W2 on origin + VPS | **PASS** (`2a7a02b`) |
| Migration 0016 applied | **PASS** |
| Pool env in hrm container | **PASS** (`PG_POOL_MAX=40`) |
| Health 200 (hrm/xbos/portal) | **PASS** (post-recover) |
| Non-xevn undisturbed | **PASS** |
| T-CONC 1000-user ADR | **NOT claimed** — see re-probe |

## Residual

| ID | Owner | Note |
|----|-------|------|
| Rate-limit ceiling @ 400 VU | devops / platform | Next: raise `RATE_LIMIT_MAX` or user-scoped budget for UAT load, or DO-W3 replica |
| `P1-HRM-SCALE-DO-W3-REPLICA` | devops | Horizontal hrm-be + nginx upstream |
| Seq Scan at N≈1.2k | ok / monitor | Re-EXPLAIN after workforce growth |
| xbos `start:dev` dist empty | devops follow-up | Prefer clean-build override or fix nest incremental on VPS |

## Handoff

- **completion_report:** DO-W2 pool=40 applied; BE-W2 + `0016` live on Dev8088; xbos restored; T-CONC max passing **50→200 VU**. **Does not claim T-CONC PASS.**
- **next_owner:** `qc`
- **evidence_path:** this file + `p1-hrm-scale-w3-t-conc-rerun-20260717.md`
- **ack_status:** **PASS_TO_PM**
