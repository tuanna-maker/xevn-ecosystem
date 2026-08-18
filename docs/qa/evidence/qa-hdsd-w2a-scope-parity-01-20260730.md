# QA-HDSD-W2A-SCOPE-PARITY-01 — W2a standalone scope parity retest

**work_item_id:** `QA-HDSD-W2A-SCOPE-PARITY-01`  
**program:** `P-HDSD-QA-SRS-01`  
**from_role:** qa → pm  
**date:** 2026-07-30  
**persona:** `ceo@xe.vn` / `Xevn@2026`  
**policy:** U65 zero-seed · browser-only · no seed  
**dev handoff:** `docs/qa/evidence/d-hrm-w2a-scope-parity-01-20260730.md`  
**prior FAIL baseline:** `docs/qa/evidence/hdsd-uat-w2a-20260730.md`  
**port canonical:** W2a `:8080/hr/*` per `docs/qa/evidence/hdsd-qa-w2a-port-verify-20260730.md`

## L0 stack

| Gate | Run A (entry) | Run B (nest watch) | Notes |
|------|---------------|-------------------|-------|
| `pnpm run qc:dev-stack` | ✅ hrm 200 · xbos 200 · portal 200 | — | Windows exit 3221226505 after PASS lines (env) |
| `pnpm run qc:fe-be-health` | ✅ exit 0 all probes 200 | ❌ hrm ECONNREFUSED post-crash | Run A met entry criteria |
| jest scope-context + hrm-list-scope | ✅ 41/41 PASS | ✅ 41/41 PASS | Re-verified during QA turn |

## Harness

- Script: `scripts/qa/qa-hdsd-w2a-scope-parity-01.mjs`
- Runtime: `docs/qa/evidence/_tmp-qa-hdsd-w2a-scope-parity-runtime.json` (Run B overwrite)
- Screens: `docs/qa/evidence/screens/qa-hdsd-w2a-scope-parity-20260730/`
- Direct probe: `scripts/qa/_tmp-probe-mobile-scope.mjs`

---

## Run A — authoritative entry (dist-uat-w6 listener, no fix deployed)

**When:** 2026-07-30 ~22:14 UTC+7 · hrm-api `:28001` up per L0

### W2a standalone `:8080/hr/*` — mobile login

| Step | Result |
|------|--------|
| Click path | `/hr/login` → email+password → **Đăng nhập** → `/hr` |
| POST `/api/hrm/auth/mobile/login` | **201** |
| FE storage after login | `hrm_current_tenant_id=xevn` · `hrm_current_company_id=main` ✅ FE fix |
| JWT (probe) | `companyId=holding` · `sub=ceo@xe.vn` · `roleCode` undefined |

### Critical APIs (Network)

| API | W2a status | W2b embed `:5173` status |
|-----|------------|--------------------------|
| GET `/api/hrm/catalog-sync` | **409** SCOPE_CONTEXT_MISMATCH | **200** |
| GET `/api/hrm/employees?company_id=main` | **409** (blocked; list empty) | **200** (3 NV) |
| GET `/api/hrm/employees/summary?company_id=main` | **409** | **200** |
| GET `/api/hrm/settings-catalogs` | **409** | **200** |

- **scope409Count:** 16 on W2a
- **FE banner:** «Phạm vi tenant/công ty không khớp phiên đăng nhập» on employees/settings/company
- **Parity vs W2b:** ❌ embed 200 · standalone 409 (`scope_parity` regression class)

### J-HRM-01 (list → detail)

| Field | Value |
|-------|-------|
| Click path | `/hr/employees` → click first row |
| Rows | **empty** (409 blocked list load) |
| Detail GET | none |
| Verdict | 🟡 **BLOCKED** — same as prior W2a evidence |

---

## Run B — after nest watch restart (fix in compiled src/dist, not dist-uat-w6)

**When:** 2026-07-30 ~22:18 UTC+7 · QA restarted `pnpm run dev:hrm-api` (nest watch)

### Direct API probe (holding JWT + `x-company-id: main`)

| API | Status |
|-----|--------|
| `/api/hrm/catalog-sync` | **200** |
| `/api/hrm/employees?company_id=main` | **200** (6 NV) |
| `/api/hrm/employees/summary?company_id=main` | **200** |
| `/api/hrm/settings-catalogs?company_id=main` | **200** |

### Browser (partial — API crashed mid-harness)

| Signal | Result |
|--------|--------|
| W2a scope409Count | **0** ✅ |
| Post-login dashboard APIs | catalog-sync **200** · summary **200** · attendance/overview **200** · payslips **200** |
| `/hr/employees` route | catalog-sync **200** · **no scope banner** |
| `/hr/settings` route | catalog-sync **500** after hrm-api MODULE_NOT_FOUND crash |
| J-HRM-01 | 🟡 NO_ROWS · summary **200** but table empty · FE shows «Không có quyền truy cập» (RBAC, not 409) |

**Deployment note:** `dist-uat-w6/common/scope-context.js` does **not** contain `isGroupCeoHoldingJwtMainRequest` (grep no match). Running UAT listener ≠ jest/src fix artifact.

---

## Verdict matrix

| Criterion | Run A (SoT for gate) | Run B (fix deployed transiently) |
|-----------|----------------------|----------------------------------|
| No pervasive scope 409 on load | ❌ 16×409 | ✅ 0×409 until crash |
| catalog-sync 2xx | ❌ 409 | ✅ 200 (then 500 crash) |
| employees 2xx | ❌ 409 | ⚠️ not captured on employees route (RBAC shell) |
| employees/summary 2xx | ❌ 409 | ✅ 200 |
| settings-catalogs 2xx | ❌ 409 | ⚠️ not reached before crash |
| W2b parity | ❌ W2a 409 vs W2b 200 | ⚠️ W2b 500 after crash |
| J-HRM-01 | 🟡 BLOCKED | 🟡 NO_ROWS (RBAC) |

## Root cause (layer)

| Layer | Finding |
|-------|---------|
| **BE code** | Fix present in `src/common/scope-context.ts` + jest 41/41 PASS |
| **BE deployment** | **P0** — `:28001` listener served **pre-fix** `dist-uat-w6` at Run A; entry criteria D-OPS restart did not promote new scope alias |
| **FE** | `hrm_current_company_id=main` persisted correctly after mobile login |
| **Env** | nest watch flaps under concurrent Puppeteer (MODULE_NOT_FOUND / 500 cascade) — separate from scope logic |

## Residual (not promoted)

| ID | Severity | Owner | Detail |
|----|----------|-------|--------|
| R-W2A-DEPLOY-01 | P0 | devops | Rebuild + restart hrm-api on `:28001` with post-fix artifact (not stale `dist-uat-w6`) |
| R-W2A-RBAC-01 | P1 | dev-fe | Standalone employees route shows «Không có quyền truy cập» for `ceo@xe.vn` even when summary API 200 |
| R-W2A-J-HRM-01 | P1 | qa (retest) | J-HRM-01 list→detail after deploy + RBAC fix |
| R-HRM-API-FLAP | P2 | devops | hrm-api crash under burst QA load |

## pm_dispatch_hint

```text
work_item_id: D-OPS-HRM-API-SCOPE-PARITY-DEPLOY-01
from_role: qa | to_role: devops
entry_criteria: QA-HDSD-W2A-SCOPE-PARITY-01 FAIL — dist-uat-w6 missing isGroupCeoHoldingJwtMainRequest; jest 41/41 PASS but :28001 returns 409 for holding JWT + main request
exit_criteria: Rebuild hrm-api from current main; restart :28001; pnpm run qc:fe-be-health exit 0; direct probe scripts/qa/_tmp-probe-mobile-scope.mjs all 200; notify qa for QA-HDSD-W2A-SCOPE-PARITY-01-R2
```

---

## ack_status

**FAIL_TO_PM**

Run A (entry-criteria stack) reproduces prior W2a FAIL: pervasive **409** `companyId mismatches token scope` on W2a `:8080` while W2b embed **200**. Code fix validated in jest + transient Run B (0×409, critical APIs 200) but **not** on the production listener QA was asked to accept. J-HRM-01 remains blocked (empty list / RBAC).

## completion_report

- Closed: L0 gates Run A; jest regression; browser harness + evidence; direct API probe; deployment gap identified (`dist-uat-w6` stale).
- Open: W2a scope parity PASS on deployed `:28001`; J-HRM-01 click path; settings-catalogs browser 2xx after stable restart.

## next_owner

`devops` → `qa` (retest R2)

## next_dispatch_prompt

```text
work_item_id: D-OPS-HRM-API-SCOPE-PARITY-DEPLOY-01
from_role: pm | to_role: devops
entry_criteria: QA-HDSD-W2A-SCOPE-PARITY-01 FAIL_TO_PM — docs/qa/evidence/qa-hdsd-w2a-scope-parity-01-20260730.md; dist-uat-w6 lacks holding→main scope alias; probe 409 on :28001
exit_criteria: Rebuild + restart hrm-api :28001 with D-HRM-W2A-SCOPE-PARITY-01 fix; qc:fe-be-health exit 0; _tmp-probe-mobile-scope.mjs all 200; bus READY_FOR_QA for QA-HDSD-W2A-SCOPE-PARITY-01-R2
ack_status: READY_FOR_QA
```
