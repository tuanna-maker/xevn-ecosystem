# P1-HRM-CON-NOTES-PERSIST-01 — Contract `notes` persistence

**work_item_id:** `P1-HRM-CON-NOTES-PERSIST-01`  
**role:** dev-be  
**date:** 2026-06-20  
**defect:** `D-UF-WEB-HRM-02-01` (UF-HRM-02)  
**ack_status:** `READY_FOR_QA`

---

## Root cause

`CreateContractDto` / `UpdateContractDto` exposed `notes`, but `ContractsInsuranceService` never:

1. Added `notes` column to `employee_contracts` schema
2. Persisted `notes` on INSERT/UPDATE
3. Selected `ec.notes` on GET-by-id / list / expiring queries

POST `HRM-CON-201` succeeded; GET-by-id omitted `notes` → F5 surrogate FAIL.

---

## Fix (hrm-api)

| Area | Change |
|------|--------|
| Schema | `ALTER TABLE employee_contracts ADD COLUMN IF NOT EXISTS notes TEXT NULL` |
| `createContract` | INSERT + RETURNING includes `notes` |
| `updateContract` | `CASE WHEN $6::boolean THEN $5 ELSE notes END` partial PATCH |
| `getContractById` | SELECT `ec.notes` |
| `listContracts` | SELECT `ec.notes` |
| `listExpiringContracts` | SELECT `notes` |

**Files:** `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts`, `contracts-insurance.service.spec.ts`

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm test -- contracts-insurance.service.spec.ts` | **18/18 PASS** |
| `pnpm run build` (hrm-api) | **exit 0** |

**New specs:**

- `P1-HRM-CON-NOTES-PERSIST-01: createContract persists notes and getContractById returns it`
- `P1-HRM-CON-NOTES-PERSIST-01: updateContract persists notes when provided`

---

## QA retest (UF-HRM-02)

1. Login `ceo@xe.vn` / stack L0 up (`hrm-api :28001`)
2. POST `/api/hrm/contracts-insurance/contracts?company_id=main` with `notes: "UF02-{stamp}"`, `contract_type`, `start_date`, `end_date`, `employee_id`
3. Expect `201` `HRM-CON-201` + response includes `notes`
4. GET `/api/hrm/contracts-insurance/contracts/{id}?company_id=main` — expect `notes` equals POST value (F5 surrogate)
5. PATCH same contract with updated `notes` — GET-by-id reflects update

**Journey:** J-HRM-03 (contract create/edit + F5)

---

## Residual

None on BE scope. UF-HRM-09 HRBP PATCH 403 is separate work item (`D-UF-WEB-HRM-09-01`).
