# D-HDSD-MUTATE-BE-01 — Contract create POST 400 (UF-HRM-05)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | dev-be |
| **work_item_id** | `D-HDSD-MUTATE-BE-01` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 |
| **Entry** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r5-20260801.md` — TC-HDSD-06-02-01 form-ready 🟢 · POST **400** |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **spec_ref** | UF-HRM-05 · FR-HRM-CI-01 · `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §3 |

---

## 1. Root cause

| Layer | Finding |
|-------|---------|
| **Symptom** | `POST /api/hrm/contracts-insurance/contracts` → **400** after `hdsd-contracts-form-ready` |
| **Error (before fix)** | `HRM-VAL-001` — `position_key must be a string` (DTO required field missing) |
| **FE payload** | `Contracts.tsx` → `useContracts.createContract` sends `company_id`, `employee_id`, `contract_type`, `start_date`, `end_date` — **no `position_key`** (E1-A field exists on EmployeeContracts tab only) |
| **BE (E1-A)** | `CreateContractDto.position_key` was `@IsString()` required; service `assertConPositionKey(..., true)` |

**Not primary:** duplicate `contract_code` (INSERT allows NULL); QA hypothesis catalog assert applies only after validation passes.

---

## 2. Fix (preserve E1-A assert)

1. **`CreateContractDto`** — `position_key` → `@IsOptional()` (browser / HDSD list create may omit).
2. **`ContractsInsuranceService.resolveContractPositionKey`** — resolve before assert:
   - explicit `body.position_key`
   - else `employees.job_title_key` for `employee_id`
   - else first active `job_titles` catalog item (`getEffectiveItemsForKey`)
   - else **`HRM-CON-POS-KEY`** (deterministic)
3. **`createContract`** — uses resolved key → existing `assertConPositionKey` unchanged.

**Files**

- `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts`
- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts`
- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.spec.ts`

---

## 3. Verification

### Jest

```bash
cd apps/api/hrm-api
pnpm exec jest --runInBand \
  src/contracts-insurance/contracts-insurance.service.spec.ts \
  src/contracts-insurance/contracts-insurance.controller.spec.ts
```

**Result:** **35/35 PASS** (incl. 3 new `D-HDSD-MUTATE-BE-01` cases).

### Live smoke (portal proxy · after `build:clean` + hrm-api restart `:28001`)

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | OK |
| POST browser-equivalent body **without** `position_key` | **Before fix:** `400` `HRM-VAL-001` (position_key) |
| Same after fix | Passes DTO validation; reaches business asserts |
| With ad-hoc `contract_type=fixed_term` (not in catalog) | `400` `HRM-CON-TYPE-KEY` (expected — FE must send catalog code from picker) |

**Note:** Local pilot DB may have sparse `contract_types` / `job_titles` in picker; QA R5 env had catalog rows (form-ready + type prefill). Pair with **D-HDSD-MUTATE-FE-08** for `contract_code` on wire + dept/requisition hydrate.

---

## 4. FE handoff (non-blocking for BE READY_FOR_QA)

| Item | Owner | Detail |
|------|-------|--------|
| `position_key` on `/hr/contracts` create | dev-fe (optional hardening) | May send `employee.job_title_key` when picker absent |
| `contract_code` in POST body | dev-fe | Form prefills stamp; `useContracts` still omits — list row label only |

---

## completion_report

**Closed:** Identified `HRM-VAL-001` missing `position_key`; BE resolves from employee/catalog; regression jest 35/35; live confirms validation layer fixed.

**Open:** Full TC-HDSD-06-02-01 🟢 requires QA R6 browser retest on stack with catalog + FE-08 optional `contract_code` wire; requisition dept (FE-08) out of BE scope.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R6
from_role: dev-be | to_role: qa
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-be-01-20260801.md READY_FOR_QA — hrm-api rebuilt/restarted :28001; D-HDSD-MUTATE-FE-08 may land same wave
exit_criteria: TC-HDSD-06-02-01 POST /api/hrm/contracts-insurance/contracts → 2xx HRM-CON-201 + F5 row; preserve TC-HDSD-08-02-01 🟢 + regression 04/05/10; restart HRM embed :8080 before run; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r6-20260801.md
UF: UF-HRM-05 · UF-HRM-09
policy: U65 zero-seed · browser-only
ack_status: PASS_TO_PM or FAIL_TO_PM
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-be-01-20260801.md`

## ack_status

**READY_FOR_QA**
