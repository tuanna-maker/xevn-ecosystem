# D-HDSD-MUTATE-BE-02 — Contract POST pass-through position_key (UF-HRM-05)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | dev-be |
| **work_item_id** | `D-HDSD-MUTATE-BE-02` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 |
| **Entry** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md` — TC-HDSD-06-02-01 POST **400** with `position_key=QAHDSDTLAAV` (FE-10 employee_code fallback) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **spec_ref** | UF-HRM-05 · `assertConPositionKey` · `resolveContractPositionKey` · `API_DESIGN_HRM_CONTRACTS_INS.md` §3 |

---

## 1. Root cause

| Layer | Finding |
|-------|---------|
| **Symptom** | `POST /api/hrm/contracts-insurance/contracts` → **400** after BE-01 fixed `HRM-VAL-001` |
| **Wire body** | `position_key=QAHDSDTLAAV` · `contract_code=HD-TM1NP` · `employee_id=20c6f74e-…` · `contract_type=fixed_term` |
| **Error** | **`HRM-CON-POS-KEY`** — explicit key not in `job_titles` catalog |
| **FE (FE-10)** | `resolveContractCreatePositionKey` pass-through `employee_code` when catalog + `job_title_key` empty |
| **BE (BE-01 gap)** | `resolveContractPositionKey` returned explicit key as-is without catalog membership check |

**E1-A preserved:** invent / free-text keys still rejected; catalog-valid explicit keys unchanged.

---

## 2. Fix

1. **`lookupActiveJobTitleCode`** — returns canonical catalog code or `null`.
2. **`resolveContractPositionKey`** — use explicit key **only when** ∈ effective `job_titles`; pass-through (employee_code / dept snapshot) → fallback chain:
   - catalog-valid `employees.job_title_key`
   - first active `job_titles` item
   - else **`HRM-CON-POS-KEY`**
3. **`assertConPositionKey`** — unchanged (E1-A must_keep).

**Files**

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

**Result:** **38/38 PASS** (+3 BE-02 cases: pass-through → catalog, valid explicit, invent reject).

### Build + restart

```bash
pnpm --filter hrm-api run build
# hrm-api restarted :28001 (dist/main.js)
```

### Live smoke (browser-equivalent · after catalog-sync pull)

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | OK |
| POST employee `QA{stamp}` (no `job_title_key`) | **201** |
| POST contract body with `position_key=QA{stamp}` (pass-through) · `contract_type=HDLD_KTH` | **201** **`HRM-CON-201`** |
| Resolved `position_key` on row | **`CEO`** (first catalog item — not employee_code) |

**Note:** Local pilot had empty catalogs until `POST /api/hrm/catalog-sync/pull/{contract_types,job_titles}`; QA R8 env had picker prefilled (`fixed_term`). BE-02 closes position_key layer regardless of `contract_type` code on wire.

---

## completion_report

**Closed:** Pass-through `position_key=employee_code` no longer fails `HRM-CON-POS-KEY` when `job_titles` catalog has items; resolves to catalog-valid key; jest 38/38; live POST **201** `HRM-CON-201` for ceo@xe.vn main scope.

**Open:** Full TC-HDSD-06-02-01 🟢 requires QA R9 browser retest (pair FE-11 YCTD storm); `contract_type=fixed_term` must exist in QA env catalog (separate from BE-02).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R9
from_role: dev-be | to_role: qa
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-be-02-20260801.md READY_FOR_QA + d-hdsd-mutate-fe-11-20260801.md (when FE-11 READY); hrm-api rebuilt/restarted :28001; HRM embed :8080 restart before run
exit_criteria: TC-HDSD-06-02-01 POST /api/hrm/contracts-insurance/contracts → 2xx HRM-CON-201 + F5 row with position_key ≠ employee_code pass-through; TC-HDSD-07-02-01 form-ready ≤22s + POST 2xx when FE-11 landed; preserve TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r9-20260801.md
UF: UF-HRM-05 · UF-HRM-07 · UF-HRM-09
policy: U65 zero-seed · browser-only
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: do not dispatch QC-HDSD-BF-03-GATE-01 until 06+07 POST 2xx
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-be-02-20260801.md`

## ack_status

**READY_FOR_QA**
