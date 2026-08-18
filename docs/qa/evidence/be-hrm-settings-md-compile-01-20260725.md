# D-HRM-SETTINGS-MD-COMPILE-BE-01 — hrm-api Nest compile unblock

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-be |
| **work_item_id** | `D-HRM-SETTINGS-MD-COMPILE-BE-01` |
| **QA FAIL ref** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` §0+§4 |
| **change_mode** | UPGRADE (compile/types) |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Root cause

| Defect | Status |
|--------|--------|
| `employees.service.ts` `assertJobTitleKeyInCatalog` read `memberTenantId` / `masterTenantPartition` on `HrmListScopeContext` (only `{ tenantId? }`) → **TS2339** | **FIXED** |
| `operating-units` QueryFn **TS2322** (`CompanyDisplayQueryFn`) | **Already fixed** in-flight `D-HRM-EMP-COMPANY-COL-BE-02` — generic forward `(sql, params) => this.db.query<T>(sql, params ?? [])`; verified clean in this wave |

---

## 2. Fix

**File:** `apps/api/hrm-api/src/employees/employees.service.ts`

- Use `scopeContext?.tenantId?.trim() || MASTER_TENANT_ID` for catalog assert tenant (matches `toHrmListScopeContext`).
- Appended `@CODE-MEMORY-CHANGE` for this work item.
- **must_keep:** company_display_name LE SoT; list scope RBAC ladder (`resolveHrmListScope` / `HrmListScope` unchanged).

---

## 3. Verification

| Check | Result |
|-------|--------|
| `pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json` | **exit 0** (0 errors) |
| `nest start --watch` (`pnpm run start:dev` in hrm-api) | **Found 0 errors** · Nest started · listens **:28001** |
| `GET http://127.0.0.1:28001/api/hrm` | **HTTP 200** `HRM-HEALTH-200` |
| `pnpm run qc:dev-stack` | **hrm-api 200** · **xbos-api 200** · **web-portal :5173 200** (script then hit Node win UV assert noise — checks printed PASS first) |
| jest `hrm-list-scope-context` + `be-hrm-emp-company-col-01` + `operating-units.service.spec` | **15/15 PASS** |
| jest `employees.service.spec` | **22/22 PASS** |
| Seed | **none** (U65) |

---

## 4. Residual (not this wave)

- Settings master-data product gaps (G-ORPH-BE-03 POS seed, JT DTO free-text, FE leave bootstrap / dept name fallback) — queued `POS-SEED` / `JT-BE` / FE items after compile.
- Browser Settings UF still needs QA re-open (`QA-HRM-SETTINGS-MASTER-DATA-02`) once FE lanes + stack stay up.

---

## 5. Handoff

- **next_owner:** `qa` (smoke stack + unblock Settings browser wave) then `pm` for POS-SEED / JT wave
- **ack_status:** READY_FOR_QA
