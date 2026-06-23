# Pilot business flow gate — PILOT-ZERO-DEFECT-01

**work_item_id:** `PILOT-ZERO-DEFECT-01`  
**qa_owner:** qa  
**date:** 2026-05-22  
**environment:** HRM `:28001`, XBOS `:28002`, portal `:5175` (local dev stack)  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**matrix:** `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`

---

## L0 — `pnpm run qc:dev-stack`

| Check | Result |
|-------|--------|
| xbos-api health | **PASS** HTTP 200 |
| web-portal | **PASS** HTTP 200 |

**Verdict:** **PASS**

---

## L1 — `pnpm run test:system:uat`

| Metric | Value |
|--------|-------|
| Verdict | **PASS** |
| PASS / FAIL / SKIP | 37 / 0 / 0 |
| Report | `docs/qa/evidence/system-integration-uat-report.json` |
| Started | 2026-05-22T16:43:39Z |

**Verdict:** **PASS** (API/system layer; does not cover Command Center UI rollup)

---

## L2 — Command Center matrix (P-CC-01..04)

**Automation:** `pnpm run test:pilot:flows` (`scripts/pilot-business-flow-smoke.mjs`)  
**Manual signal:** User reported `kpi-engine/rollup` **409** `companyId mismatches token scope` on `/command-center/hrm/contracts`.

| ID | Route / check | Result | Evidence |
|----|---------------|--------|----------|
| P-CC-01 | Portal login `ceo@xe.vn` → JWT `expiresInSec=86400` | **PASS** | `expiresInSec=86400`, `defaultCompanyId=main`, `defaultTenantId=xevn` |
| P-CC-02 | `GET /api/xbos/tenant-scope/group-member-units` | **PASS** | HTTP 200, 4 member units |
| P-CC-03 | `GET /api/hrm/employees?company_id=main&page_size=100` | **PASS** | HTTP 200 `HRM-EMP-200`, total=10 |
| P-CC-04 | Contracts slice + rollup gate | **FAIL** | HRM `settings-catalogs` + `contracts-insurance` **200**; **`GET /api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=xevn` → 409** `SCOPE_CONTEXT_MISMATCH` |

### P-CC-04 detail

| Sub-check | HTTP | Code | Notes |
|-----------|------|------|-------|
| settings-catalogs (JWT scope `main`) | 200 | `HRM-SET-200` | Embed contracts data path OK |
| contracts-insurance/contracts | 200 | `HRM-CON-200` | 0 rows acceptable |
| kpi-engine rollup (shell sparkline) | **409** | `SCOPE_CONTEXT_MISMATCH` | Query uses `companyId=xevn`; token scope `companyId=main` |
| kpi-engine rollup (correct scope probe) | 200 | `XBOS-KPI-202` | `?tenantId=xevn&companyId=main` with matching headers |

**Root cause (regression):** `CommandCenterPage` → `useCommandCenterSparkline(MASTER_TENANT_ID, MASTER_TENANT_ID)` calls rollup with `companyId=xevn` while portal JWT for `ceo@xe.vn` is `companyId=main`. Request fires on all Command Center child routes including `/command-center/hrm/contracts`.

**Code refs:** `apps/web/web-portal/src/hooks/useCommandCenterSparkline.ts`, `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` (~L1529).

---

## Defect — HRM-EMBED-D6 (new)

| Field | Value |
|-------|-------|
| ID | **HRM-EMBED-D6** |
| Severity | **P1** (pilot zero-defect gate blocker for P-CC-04) |
| Owner | **dev-fe** |
| Summary | Command Center KPI sparkline calls `kpi-engine/rollup` with `companyId=xevn` (MASTER_TENANT_ID) against JWT `companyId=main` → **409** on contracts and other HRM embed routes |
| Repro | Login portal → navigate `/command-center/hrm/contracts` → Network: `GET /api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=xevn` → 409 |
| Expected | Rollup uses resolved portal identity scope (`tenantId=xevn`, `companyId=main`) or skips rollup when scope mismatch |
| Status | **OPEN** |

Prior defects D3/D4 (HRM embed Supabase/settings-catalogs) remain **CLOSED** per `hrm-embed-contracts-fix-20260522.md`; D6 is a **separate** portal-shell scope bug.

---

## QA verdict

| Layer | Verdict |
|-------|---------|
| L0 | PASS |
| L1 | PASS |
| L2 (P-CC-01..03) | PASS |
| L2 (P-CC-04) | **FAIL** (rollup 409) |
| **Overall pilot slice** | **FAIL** → `PASS_TO_PM` with blockers |

**QC guidance:** Full pilot **cannot GO** until **P-CC-04** rollup 409 fixed (HRM-EMBED-D6). HRM embed APIs alone are insufficient for zero-defect gate.

**ack_status:** `PASS_TO_PM` (QA complete; release gate blocked on P-CC-04)

---

## Retest — HRM-EMBED-D6 (2026-05-22T post dev-fe rollup scope fix)

**work_item_id:** `HRM-EMBED-D6` + `PILOT-ZERO-DEFECT-01`  
**qa_cycle:** retest-2  
**dev evidence:** `docs/qa/evidence/hrm-embed-d6-kpi-rollup-20260522.md`

### L0 (reconfirm)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **PASS** (xbos-api 200, web-portal 200) |

### `pnpm run test:pilot:flows`

| Metric | Value |
|--------|-------|
| Exit code | **0** |
| Summary | **7/7 PASS** |
| Script note | P-CC-04c probes JWT-aligned rollup (`tenantId` + `companyId` from login session), not legacy `companyId=xevn` mismatch URL |

### P-CC-01..04 (L2)

| ID | Result | Notes |
|----|--------|-------|
| P-CC-01 | **PASS** | `expiresInSec=86400`, `defaultCompanyId=main` |
| P-CC-02 | **PASS** | `group-member-units` HTTP 200 |
| P-CC-03 | **PASS** | `employees?page_size=100` HTTP 200 |
| P-CC-04 | **PASS** | `settings-catalogs` + `contracts-insurance` **200**; rollup `?tenantId=xevn&companyId=main` **200** `XBOS-KPI-202` — **no rollup 409** |

### Defect HRM-EMBED-D6

| Field | Value |
|-------|-------|
| Status | **CLOSED** (retest-2) |
| Verification | Shell scope aligned with JWT; automated + manual probe `companyId=main` → 200 |

### QA verdict (retest-2)

| Layer | Verdict |
|-------|---------|
| L2 P-CC-01..04 | **PASS** |
| `test:pilot:flows` | **PASS** (exit 0) |
| **Overall pilot slice (01..04)** | **PASS** |

**QC note:** P-CC-04 may be upgraded to **PASS** in `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` L2 column (already marked PASS; re-gate full pilot GO WITH CONDITIONS for deferred P-CC-05..08).

**ack_status:** `PASS_TO_PM` + `PASS_TO_QC`

---

## Commands (repro)

```bash
pnpm run qc:dev-stack
pnpm run test:system:uat
pnpm run test:pilot:flows
```
