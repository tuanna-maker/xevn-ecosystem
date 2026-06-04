# S1-FE-DEBT — QA retest (HRM embed Supabase debt closure)

**work_item_id:** S1-FE-DEBT  
**date:** 2026-05-23  
**role:** qa  
**environment:** local dev — portal `http://127.0.0.1:5175`, HRM proxy `/api/hrm/*`, XBOS `28002`  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**entry_evidence:** `docs/qa/evidence/s1-fe-embed-debt-20260523.md` (dev-fe READY_FOR_QA)

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** |
| **ack_status** | **PASS_TO_PM** |

PM may set `docs/program/USER_PILOT_STATUS.md` iframe section (P-CC-05..08) to **green**.

---

## L0 — `pnpm run qc:dev-stack`

| Check | HTTP | Exit |
|-------|------|------|
| xbos-api `http://127.0.0.1:28002/api/xbos` | 200 | 0 |
| web-portal `http://127.0.0.1:5175` | 200 | 0 |

**Note:** L0 script does not probe HRM `28001` directly; HRM health confirmed via `test:hrm-embed:audit` (`FE-hrm-health` 200).

---

## L1 automation

| Command | Exit | Summary |
|---------|------|---------|
| `pnpm run test:hrm-embed:audit` | **0** | P-CC-03..08 + FE-hrm-health **8/8 PASS** (portal JWT proxy) |
| `pnpm run test:pilot:flows` | **0** | **11/11 PASS** (P-CC-01..08 incl. insurance/recruitment/attendance/payroll) |
| `pnpm -C apps/web/hrm test` | **0** | **16 files, 30 tests PASS** |

---

## L2 — iframe P-CC-05..08 (browser + Performance API)

**Method:** Cursor browser @ `5175`, login CEO, navigate portal routes; read iframe `performance.getEntriesByType('resource')` for `:54321` and `/api/hrm/*` on **initial load**; recruitment **tab switch** (click “Board tuyển dụng”).

| Route | Portal path | iframe `src` pattern | `:54321` (parent+iframe) | Nest `/api/hrm/*` on load | Tab switch |
|-------|-------------|----------------------|--------------------------|---------------------------|------------|
| **P-CC-05** | `/command-center/hrm/insurance` | `/hr/insurance?portal=1&…` | **0** | `employees` **200**; `catalog-sync` **200**; `insurance/expiring` **400** (optional probe) | N/A |
| **P-CC-06** | `/command-center/hrm/recruitment` | `/hr/recruitment?portal=1&…` | **0** | `recruitment/requisitions` **200**; `candidates` **400** (secondary) | **0** `:54321` after tab click |
| **P-CC-07** | `/command-center/hrm/attendance` | `/hr/attendance?portal=1&…` | **0** | `attendance/records` **200**; `employees` **200**; `leave-requests` **400** (secondary) | N/A |
| **P-CC-08** | `/command-center/hrm/payroll` | `/hr/payroll?portal=1&…` | **0** | `payroll/payslips` **200**; `catalog-sync` **200** | N/A |

**PASS criteria met:** No required `127.0.0.1:54321` / Supabase REST on load or recruitment tab switch; primary list endpoints **200** (matches automated audit). No `ERR_CONNECTION_REFUSED` observed in parent console during spot check.

**Residual (non-blocking for S1-FE-DEBT):**

- Secondary calls may return **400** (`candidates`, `leave-requests`, `insurance/expiring`) — UI may show empty/alternate; not scope of Supabase-debt closure.
- Deep recruitment sub-tabs (interviews, campaigns) still Supabase-backed **on navigate** — per dev-fe out-of initial-load scope.

---

## Unit gate — `shouldSkipSupabaseDataFetches`

`apps/web/hrm` vitest confirms portal+API mode skips Supabase reads (`hrmDataMode.test.ts`, hook tests for attendance/recruitment/payroll).

---

## Traceability

- Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-05..08  
- Dev fix: `docs/qa/evidence/s1-fe-embed-debt-20260523.md`  
- Audit artifact refreshed: `docs/qa/evidence/hrm-embed-fe-audit-20260522.md` (script run 2026-05-23)
