# QA-HDSD-W2A-SCOPE-PARITY-01-R2 — W2a standalone scope parity retest (post-deploy)

**work_item_id:** `QA-HDSD-W2A-SCOPE-PARITY-01-R2`  
**program:** `P-HDSD-QA-SRS-01`  
**from_role:** qa → pm  
**date:** 2026-07-31  
**persona:** `ceo@xe.vn` / `Xevn@2026`  
**policy:** U65 zero-seed · browser + direct probe (no seed)  
**dev handoff:** `docs/qa/evidence/d-hrm-w2a-scope-parity-01-20260730.md`  
**deploy handoff:** `docs/qa/evidence/d-ops-resume-l0-01-20260731.md`  
**prior FAIL:** `docs/qa/evidence/qa-hdsd-w2a-scope-parity-01-20260730.md`  
**port canonical:** W2a `:8080/hr/*`

---

## L0 stack

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm run qc:dev-stack` | ✅ hrm 200 · xbos 200 · portal 200 | Windows UV abort exit 3221226505 after ✓ lines (known env class) |
| `pnpm run qc:fe-be-health` | ✅ exit 0 ALL PASS | Corroborating gate |
| jest `scope-context` + `hrm-list-scope` | ✅ 41/41 PASS | Re-verified R2 |
| HRM binary | ✅ `dist/main.js` | `isGroupCeoHoldingJwtMainRequest` present in compiled `scope-context.js` |
| `dist-uat-w6` serve | ✅ 0 processes | Per D-OPS-RESUME-L0-01 |

---

## Direct API probe — holding JWT + `main` request (authoritative scope gate)

Probe artifact: `docs/qa/evidence/_tmp-qa-hdsd-w2a-scope-parity-r2-probe.json`

### Group CEO `ceo@xe.vn` — mobile login 201

| API | `:28001` direct | `:8080` proxy |
|-----|-----------------|---------------|
| GET `/api/hrm/catalog-sync` | **200** HRM-SYNC-202 | **200** |
| GET `/api/hrm/employees?company_id=main` | **200** HRM-EMP-200 (6 NV) | **200** |
| GET `/api/hrm/employees/summary?company_id=main` | **200** HRM-EMP-SUMMARY-200 | **200** |
| GET `/api/hrm/settings-catalogs?company_id=main` | **200** HRM-SET-200 | **200** |

### Negative control — `uat.nv0001@xe.vn` (non-Group-CEO)

| Request | Status | Expected |
|---------|--------|----------|
| `company_id=holding` employees | **200** | ✅ holding partition |
| `company_id=main` employees | **409** SCOPE_CONTEXT_MISMATCH | ✅ guard intact |

---

## Browser harness — W2a `:8080/hr/*`

- Script: `scripts/qa/qa-hdsd-w2a-scope-parity-01.mjs`
- Runtime: `docs/qa/evidence/_tmp-qa-hdsd-w2a-scope-parity-runtime.json` (R2 run)
- Screens: `docs/qa/evidence/screens/qa-hdsd-w2a-scope-parity-20260730/` (R2 overwrite)

### Mobile login

| Step | Result |
|------|--------|
| Click path | `/hr/login` → **Đăng nhập** → `/hr` |
| POST `/api/hrm/auth/mobile/login` | **201** |
| FE storage | `hrm_current_tenant_id=xevn` · `hrm_current_company_id=main` ✅ |
| **scope409Count** | **0** ✅ (was 16×409 in R1 FAIL) |

### Critical APIs (Network — post-login dashboard)

| API | W2a status | W2b embed `:5173` |
|-----|------------|-------------------|
| GET `/api/hrm/catalog-sync` | **200** | **200** |
| GET `/api/hrm/employees/summary?company_id=main` | **200** | **200** |
| GET `/api/hrm/employees?company_id=main` | ⚪ not fired on `/hr/employees` route (RBAC shell) | **200** |
| GET `/api/hrm/settings-catalogs` | ⚪ not fired on `/hr/settings` route (RBAC shell) | **200** |

- **Scope banner:** none on any route (was pervasive «Phạm vi tenant/công ty không khớp» in R1)
- **FE RBAC shell:** «Không có quyền truy cập» on `/hr/employees`, `/hr/company`, `/hr/settings` — **separate from scope 409** (APIs 200 when probed directly)

### J-HRM-01 (list → detail)

| Field | Value |
|-------|-------|
| Click path | `/hr/employees` → click first row |
| Rows | empty (RBAC blocks list render) |
| Detail GET | none (no row click) |
| Verdict | 🟡 **NO_ROWS** — not scope_parity; residual **R-W2A-RBAC-01** |

### W2b parity spot

| Signal | Result |
|--------|--------|
| Embed employees GET | **200** |
| scope409Count W2b | **0** |
| Parity vs R1 | ✅ W2a scope 409 class **closed** |

---

## Verdict matrix (scope parity slice)

| Criterion | R1 (FAIL) | R2 |
|-----------|-----------|-----|
| No pervasive scope 409 on load | ❌ 16×409 | ✅ **0×409** |
| catalog-sync 2xx holding persona | ❌ 409 | ✅ **200** |
| employees 2xx holding + main | ❌ 409 | ✅ **200** (direct + proxy) |
| employees/summary 2xx | ❌ 409 | ✅ **200** |
| settings-catalogs 2xx | ❌ 409 | ✅ **200** (direct + proxy) |
| W2b parity (scope layer) | ❌ W2a 409 vs W2b 200 | ✅ both **200** |
| J-HRM-01 UI click | 🟡 BLOCKED | 🟡 NO_ROWS (RBAC) |

**Harness script exit code 1:** false negative — script requires all 4 APIs captured during RBAC-blocked route navigation; direct probe + dashboard network confirm scope fix. Script limitation noted; not a scope FAIL.

---

## Matrix promotion (scope-confirmed W2a)

Confirms prior 🟢 promotions remain valid on **scope/API layer** after `dist/main.js` deploy:

| Matrix ID | Scope check | W2a R2 |
|-----------|-------------|--------|
| TC-HRM-HDSD-004 | Standalone login | 🟢 login 201 · 0×409 |
| TC-HRM-HDSD-006 | Employees list API | 🟢 GET 200 (direct/proxy); UI 🟡 RBAC |
| TC-HRM-HDSD-154 | Catalog/settings API | 🟢 GET 200 (direct/proxy) |
| TC-HRM-HDSD-106 | Headcount summary API | 🟢 GET 200 on dashboard |

Evidence pointer appended to matrix overlay in `HDSD_SRS_TESTCASE_MATRIX.md` wave row.

---

## Residual (not promoted — out of scope parity WI)

| ID | Severity | Owner | Detail |
|----|----------|-------|--------|
| R-W2A-RBAC-01 | P1 | dev-fe | Standalone `/hr/employees` shows «Không có quyền truy cập» for `ceo@xe.vn` despite employees API 200 — blocks J-HRM-01 UI |
| R-HARNESS-RBAC | P2 | qa | Update harness to accept direct-probe 4/4 when FE RBAC blocks route-level Network capture |

---

## Root cause closure

| Layer | R1 | R2 |
|-------|----|----|
| BE code | Fix in src + jest 41/41 | Unchanged ✅ |
| BE deployment | **P0** stale `dist-uat-w6` | **Closed** — `dist/main.js` on `:28001` |
| FE scope persist | ✅ main in localStorage | ✅ unchanged |
| Scope 409 | FAIL | **PASS** |

---

## ack_status

**PASS_TO_PM**

W2a standalone scope parity **closed** on deployed `dist/main.js`: holding JWT + `main` request returns **200** on all 4 critical APIs (direct `:28001` and `:8080` proxy); browser **0×409**; W2b parity restored. J-HRM-01 UI remains 🟡 NO_ROWS due to RBAC shell (P1 residual, not scope).

---

## completion_report

- **Closed:** R2 scope parity retest; L0 gates; jest 41/41; direct 4-API probe CEO 200; negative uat.nv0001 main 409; browser 0×409; matrix scope confirmation; prior R-W2A-DEPLOY-01.
- **Open:** R-W2A-RBAC-01 (dev-fe) for standalone employees list UI + J-HRM-01 click path.

## next_owner

`pm` → dispatch `dev-fe` for RBAC residual; optional `qc` scope slice audit

## next_dispatch_prompt

```text
work_item_id: D-HRM-W2A-STANDALONE-RBAC-01
from_role: pm | to_role: dev-fe
entry_criteria: QA-HDSD-W2A-SCOPE-PARITY-01-R2 PASS_TO_PM — docs/qa/evidence/qa-hdsd-w2a-scope-parity-01-r2-20260731.md; scope 409 closed; GET /employees 200 for ceo@xe.vn holding JWT but /hr/employees shows «Không có quyền truy cập»
exit_criteria: ceo@xe.vn on :8080/hr/employees renders employee list (≥1 row or honest empty with API 200 visible in Network); J-HRM-01 list→detail click GET 2xx; regression embed W2b unchanged; evidence docs/qa/evidence/d-hrm-w2a-standalone-rbac-01-YYYYMMDD.md; ack_status READY_FOR_QA
spec_ref: ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md · residual R-W2A-RBAC-01
U65: zero-seed browser-only
```
