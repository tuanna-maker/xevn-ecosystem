# Evidence — `PO-HRM-ATT-03d-05b-DEVOPS-XBOS-DIST`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-03d-05b-DEVOPS-XBOS-DIST` |
| **from_role** | `devops` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **lane** | execution — L0 ops / local xbos-api dist durability |
| **priority** | P2 |
| **entry** | QC GWC condition `OBS-XBOS-DIST` — [`po-hrm-att-03d-05b-qc-01.md`](po-hrm-att-03d-05b-qc-01.md) |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed · no ATT product code · no `pnpm seed:*` |
| **NOT claimed** | Attendance CLOSED · TechSpec S3 GO · Phase 1 DONE · product UAT DONE · PROD-READY · reopen UF-ATT-03d/05b |

---

## Problem (OBS-XBOS-DIST)

`nest start --watch` with Nest `deleteOutDir: true` on **OneDrive / Unicode** workspace paths can wipe `apps/api/xbos-api/dist` before emit finishes → `:28002` **ECONNREFUSED** / missing `dist/main.js`. Product UF ATT-03d/05b already **ACCEPT** — this seat closes the **GWC ENV condition only**.

---

## Changes (ops only)

| Path | Change |
|------|--------|
| `apps/api/xbos-api/nest-cli.json` | `deleteOutDir: **false**` (align hrm-api — harden watch) |
| `apps/api/xbos-api/scripts/ensure-dist.mjs` | predev / prestart:dev restore spine if incomplete |
| `apps/api/xbos-api/scripts/verify-dist.mjs` | postbuild / start:node gate (`main`, `app.module`, http-exception, platform-runtime, auth.module) |
| `apps/api/xbos-api/package.json` | `build:tsc`, `build:clean`, `postbuild`, `predev`, `prestart:dev`, **`start:node`** = `tsc -p tsconfig.build.json` → verify → `node dist/main.js` |
| root `package.json` | `dev:xbos-api:node` → filter `start:node` |
| `docs/ops/LOCAL_DEV_STACK_L0.md` | Recommended durable start + ECONNREFUSED recovery table |

**Not touched:** attendance product FE/BE · seed · VPS compose (out of this P2 condition).

---

## Recommended local start

```bash
# Preferred (durable L0 / Unicode OneDrive)
pnpm run dev:xbos-api:node

# Equivalent
pnpm --filter xbos-api run start:node
# = tsc -p tsconfig.build.json && node scripts/verify-dist.mjs && node dist/main.js

# Watch (optional) — ensure-dist + deleteOutDir:false
pnpm run dev:xbos-api
```

Health URL: `GET http://127.0.0.1:28002/api/xbos` → **200** `XBOS-HEALTH-200`.

---

## Smoke executed (2026-08-05)

| Step | Result |
|------|--------|
| `pnpm --filter xbos-api run build:tsc` | **PASS** (exit 0) |
| `node apps/api/xbos-api/scripts/verify-dist.mjs` | **PASS** (exit 0) |
| `GET http://127.0.0.1:28002/api/xbos` | **200** `XBOS-HEALTH-200` |
| `qc:dev-stack` probe lines | hrm **200** · xbos **200** · portal **200** |
| `qc:dev-stack` process exit | Windows Node libuv assertion on exit (`UV_HANDLE_CLOSING`) — **OBS host**; probe lines already green; primary smoke = direct GET 200 |

Did **not** kill live `:28002` to re-bind `start:node` (avoid disrupting parallel QA/FE). Emit path of `start:node` validated via `build:tsc` + verify-dist; runtime proven by live health **200**.

---

## Gate vs exit criteria

| Exit | Status |
|------|--------|
| Document/runbook prefer tsc → node | **PASS** — `LOCAL_DEV_STACK_L0.md` + `start:node` / `dev:xbos-api:node` |
| Optional harden watch | **PASS** — `deleteOutDir: false` + ensure-dist |
| Smoke :28002 200 | **PASS** |
| No seed / no ATT product mutate | **PASS** |
| Product UF ATT-03d/05b not reopened | **PASS** |

**OBS-XBOS-DIST condition:** **CLOSED** for GWC ops (durable path documented + hardened). Residual: Windows `qc:dev-stack` exit-crash fluke (host OBS) — not xbos dist wipe.

---

## Honesty

- `attendance_closed` = **false** (unchanged)
- No invent Phase 1 DONE / TechSpec S3 / Attendance CLOSED

---

## Handoff

- **completion_report:** Durable xbos local start (`start:node` / `dev:xbos-api:node`); nest `deleteOutDir:false`; ensure/verify-dist; L0 health 200; OBS-XBOS-DIST closed as GWC condition.
- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-att-03d-05b-devops-xbos-dist-01.md`
- **next_dispatch_prompt:** (see bus / completion packet below)
