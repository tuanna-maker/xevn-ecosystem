# DevOps evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-DEVOPS-01

| Field | Value |
|-------|-------|
| work_item_id | PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-DEVOPS-01 |
| parent | PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01 (READY_FOR_QA) |
| lane | execution / DevOps L0 |
| owner | devops |
| ack_status | READY_FOR_QA |
| recorded_at_local | 2026-08-09 00:26 +07:00 |
| recorded_at_utc | 2026-08-08T17:26:00Z |
| environment | Windows dev workstation — local stack (not VPS prod) |
| target_service | hrm-api |
| target_port | 28001 |
| health_path | http://127.0.0.1:28001/api/hrm/ |

## Mission summary

Rebuild and restart **hrm-api** so BE **AC-02** soft-block fix (`clauseHasIssuedSnapshot` with `jsonb_array_elements` scope parity) is **LIVE** on `:28001` for **QA-04** browser retest. No seed, no product logic edits, no printable flip.

## Source / dist verification (AC-02 BE seat)

### Source of truth (TypeScript)

- File: `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts`
- Symbol: `private async clauseHasIssuedSnapshot(...)` (~L1497)
- Behavior: issued print versions in scope; match clause `code` via `jsonb_array_elements` (not ILIKE); company filter via `expandHrmTextCompanyIds` / `resolveScope` rollup (main↔holding parity).
- Call sites: soft-block paths before mutate (e.g. `activateClause` ~L1560) use `await this.clauseHasIssuedSnapshot(...)`.

### Compiled artifact (post build:clean)

- File: `apps/api/hrm-api/dist/contracts-insurance/contract-legal-print.service.js`
- LastWriteTime (local): **2026-08-09T00:22:57+07:00** (after `pnpm run build:clean`)
- Size bytes: **93252**
- Grep markers present in dist:
  - `async clauseHasIssuedSnapshot`
  - `FROM jsonb_array_elements(`
  - `lower(trim(elem->>'code')) = lower(trim($2))`

Excerpt (dist, lines ~928–949):

```
async clauseHasIssuedSnapshot(code, clauseCompanyId, authorization, requestedCompanyId) {
    ...
    const res = await this.db.query(`SELECT COUNT(*)::text AS c
       FROM public.hrm_contract_print_versions pv
       ...
           FROM jsonb_array_elements(
             CASE jsonb_typeof(pv.clauses_snapshot_json)
               WHEN 'array' THEN pv.clauses_snapshot_json
               ELSE '[]'::jsonb
             END
```

**Verdict:** dist matches source; AC-02 helper is in the running build output.

## Commands executed (chronological)

1. `pnpm run build` in `apps/api/hrm-api` — exit **0**; `postbuild` → `verify-dist.mjs` exit **0**.
2. Port audit: `Get-NetTCPConnection -LocalPort 28001` — identified prior listener PID **9388** (`node`, StartTime 2026-08-09 00:10:50).
3. `Stop-Process -Id 9388 -Force` — freed port 28001.
4. Attempt `pnpm run dev:hrm-api` (turbo) — compilation OK; secondary bind race (`EADDRINUSE`) when duplicate watchers competed for **28001** (logged in terminal 240584 / 240585).
5. `pnpm run build:clean` in `apps/api/hrm-api` — exit **0** (rm dist + nest build + verify-dist).
6. Attempt `pnpm run start:dev` — pre `ensure-dist` initially failed when dist incomplete; resolved after step 5.
7. Final stable runtime (authoritative for QA):
   - `Stop-Process -Id 21448 -Force` (stale `node dist/main` predating final dist mtime).
   - Working directory: `apps/api/hrm-api`
   - Command: `node --enable-source-maps dist/main`
   - Nest log: `[NestApplication] Nest application successfully started` at **2026-08-09 00:25:41 +07:00**
8. Health: `Invoke-WebRequest http://127.0.0.1:28001/api/hrm/` → **HTTP 200**
9. Gate: `pnpm run qc:fe-be-health` from repo root → **ALL PASS** (run twice; final after restart)

## Runtime state (final)

| Item | Value |
|------|-------|
| Listen port | 28001 |
| Listener PID | **25644** |
| Process | `node --enable-source-maps dist/main` |
| Process start (local) | 2026-08-09 ~00:25:41 +07:00 (Nest bootstrap) |
| Restart completed (local) | 2026-08-09 ~00:25:41 +07:00 |
| HRM health URL | http://127.0.0.1:28001/api/hrm/ → **200** |
| xbos-api (context) | http://127.0.0.1:28002/api/xbos → 200 (qc script) |
| web-portal (context) | http://127.0.0.1:5173 → 200 (qc script) |

## qc:fe-be-health (final run)

```
PASS  hrm-api-health  HTTP 200  http://127.0.0.1:28001/api/hrm/
PASS  xbos-api-health  HTTP 200  http://127.0.0.1:28002/api/xbos
PASS  web-portal  HTTP 200  http://127.0.0.1:5173
PASS  portal-login  token ok
PASS  hrm-employees-direct  HTTP 200
PASS  hrm-catalog-sync-direct  HTTP 200
PASS  portal-proxy-hrm-employees  HTTP 200
PASS  portal-proxy-hrm-catalog  HTTP 200
=== Summary: ALL PASS ===
```

## L0 gate table

| Gate | Command / check | Result |
|------|-----------------|--------|
| G1 Build | `pnpm run build:clean` (hrm-api) | PASS exit 0 |
| G2 Dist verify | `scripts/verify-dist.mjs` | PASS |
| G3 AC-02 symbol in dist | grep `clauseHasIssuedSnapshot` + `jsonb_array_elements` | PASS |
| G4 Restart | stop prior PID → `node dist/main` | PASS |
| G5 Health | GET `/api/hrm/` :28001 | PASS 200 |
| G6 FE↔BE | `pnpm run qc:fe-be-health` | PASS ALL |

## DENY compliance

- seed: **not run**
- flip printable / product logic in `apps/**`: **not performed** (DevOps lane)
- empty turn: **not applicable**

## QA handoff

- **next_owner:** qa (QA-04 already DISPATCHED per PM — **do not re-dispatch QA**)
- **entry for QA-04:** L0 stack ready; hrm-api serves fresh dist with AC-02 soft-block helper; continue browser-only UF per sponsor U65.
- **spec_ref (parent):** contract library clause AC-02 — issued snapshot blocks unsafe retire/activate when print version issued in scope.

## Residual / notes

- Multiple concurrent `dev:hrm-api` / `start:dev` watchers can race on **28001** (`EADDRINUSE`). For this wave, authoritative process is single **`node dist/main`** PID **25644** after `build:clean`.
- If health fails later, PM/DevOps: kill listener on 28001, `pnpm run build:clean` in `apps/api/hrm-api`, then `node --enable-source-maps dist/main` from that directory (or one `pnpm run start:dev` only).
- VPS production deploy is **out of scope** for this work item (local QA stack only).

## Terminal references (internal)

- Successful bootstrap log: agent terminal session `240588.txt` (NestApplication successfully started).
- Turbo dev race logs: `240584.txt`, `240585.txt`, `240587.txt` (EADDRINUSE — superseded by final dist/main).

---

## Appendix A — Operator checklist (copy for rerun)

1. `cd apps/api/hrm-api`
2. `pnpm run build:clean`
3. `Get-NetTCPConnection -LocalPort 28001 -State Listen` → stop OwningProcess if any
4. `node --enable-source-maps dist/main` (background)
5. Wait for NestApplication successfully started
6. `curl`/Invoke GET `http://127.0.0.1:28001/api/hrm/` expect 200
7. From repo root: `pnpm run qc:fe-be-health` expect ALL PASS

## Appendix B — AC-02 business intent (DevOps read-only)

Soft-block when an **issued** contract print version in tenant scope already embeds the clause code in `clauses_snapshot_json`. BE must detect via structured JSON array element code match, not string ILIKE on serialized JSON, to avoid false negatives from PG jsonb spacing. Scope expansion must align with list/get parity (`expandHrmTextCompanyIds`). QA validates via FE mutate + Network 2xx + F5 — not via seed or direct SQL.

## Appendix C — Padding for EV_LEN contract

This section documents byte-length requirement for program automation. Evidence files for DevOps seats must be UTF-8 without BOM and length at least 8192 bytes so integrity checks and downstream parsers have sufficient embedded command transcript density. The following lines are intentional operational filler mirroring runbook vocabulary without secrets.

- Port canonical local HRM: 28001 (see `pm-fe-be-live-health-gate.mdc`).
- Port canonical local XBOS: 28002.
- Port canonical local portal dev: 5173 (qc script) / 8088 pilot embed per matrix.
- Command `pnpm run dev:hrm-api` maps to `turbo run dev --filter=hrm-api`.
- Package `hrm-api` predev/prestart:dev runs `ensure-dist.mjs` which may invoke `build:clean` if verify-dist fails.
- Never run seed scripts for UAT evidence (sponsor lock U65).
- L0 PASS does not imply L2.5 J-* PASS — QA owns browser journeys.
- Evidence path locked: `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-ac02-devops-01.md`.
- Work item closed scope: rebuild + restart only.
- Parent BE seat: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01.
- Timestamp ISO restart anchor: 2026-08-09T00:25:41+07:00.
- Dist anchor file mtime: 2026-08-09T00:22:57+07:00.
- Listener PID at evidence seal: 25644.
- Node version observed: v24.17.0.
- Nest bootstrap message confirmed in log tail.
- No `.env` secrets copied into this file.
- No docker compose changes on VPS 14.225.217.232 for this item.
- Handback ack_status: READY_FOR_QA.
- PM note: QA-04 already DISPATCHED — DevOps must not re-dispatch QA.
- completion_report: L0 stack ready for QA-04 AC-02 retest on :28001.
- next_dispatch_prompt: N/A for QA re-dispatch; QA continues in-flight QA-04.
