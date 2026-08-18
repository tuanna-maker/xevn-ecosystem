# Evidence — PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **defect** | `DEF-CTR-G4-CREATE-START-DATE-400` (P0) |
| **upstream** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md` |

---

## spec_read_ack

| Artifact | Ref |
|----------|-----|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.2 FR-HRM-CI-01 — Diễn biến #4 ngày bắt đầu · #7 Lưu |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §14.2 · §16.9 G-CI-01 |
| **db_design** | `docs/hrm/DB_DESIGN_HRM.md` — `employee_contracts.start_date DATE NOT NULL` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §3 POST `/contracts` — `start_date` → cột `start_date` |
| **change_mode** | FIX — default effective date on wizard Step1→2 draft when body omits `start_date` |
| **must_keep** | G-CI-01 end_date policy · scope parity · GET `clause_layout` expand |

---

## Root cause

NV-first CREATE Step1→Tiếp: `POST /api/hrm/contracts-insurance/contracts` failed **before** service with **`HRM-VAL-001`** — `CreateContractDto.start_date` was **required** `@IsDateString()` while wizard draft may omit the field (FE prefill race / minimal employee+template payload).

---

## Fix (BE)

1. **`CreateContractDto`** — `start_date` → `@IsOptional()`; empty string → `undefined` via `@Transform`; add **`effective_from`** alias (SA-01 field map).
2. **`resolveContractStartDateForCreate`** (`contract-end-date-policy.ts`) — resolve `start_date` → `effective_from` → **today `Asia/Ho_Chi_Minh`** (`en-CA` yyyy-MM-dd).
3. **`createContract`** — use resolved `startDate` for G-CI-01 assert + INSERT.

**API contract (documented):** Wizard Step1→2 draft may POST without `start_date`; BE defaults to **calendar today (HCM)**. Explicit `start_date` or `effective_from` still wins. G-CI-01 `end_date` rules unchanged.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts` | Optional `start_date` + `effective_from` alias |
| `apps/api/hrm-api/src/contracts-insurance/contract-end-date-policy.ts` | `resolveContractStartDateForCreate` |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` | Wire resolver in `createContract` |
| `apps/api/hrm-api/src/contracts-insurance/contract-end-date-policy.spec.ts` | Resolver unit tests |
| `apps/api/hrm-api/src/contracts-insurance/po-hrm-ctr-workspace-g4-create-start-date-fix-01.spec.ts` | Wizard draft + alias tests |

---

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="po-hrm-ctr-workspace-g4-create-start-date-fix-01|contract-end-date-policy|contracts-insurance.service.spec"
pnpm exec nest build
```

| Check | Result |
|-------|--------|
| `contract-end-date-policy.spec.ts` | **PASS** (14 tests incl. resolver) |
| `po-hrm-ctr-workspace-g4-create-start-date-fix-01.spec.ts` | **PASS** (2 tests) |
| `contracts-insurance.service.spec.ts` | **PASS** (31 tests) |
| `nest build` | **PASS** |

---

## QA retest scope

| Row / Journey | Expect after fix |
|---------------|------------------|
| **WS-G4-02** | NV pick → Tiếp → POST **2xx** · Step2 open |
| **WS-G4-06 / 07** | DnD + mandatory gỡ unblocked |
| **J-HRM-CTR-CREATE-01 / 02** | CREATE mutate chain |
| **U65** | Browser-only · no seed |

**Residual (out of scope BE):** `DEF-CTR-G4-EDIT-DEEPLINK-P1` (dev-fe) · `contracts_printable_ready=false` unchanged.

---

## completion_report

**Closed:** DTO no longer rejects wizard draft POST missing `start_date`; service defaults effective date (HCM today) or accepts `effective_from`; G-CI-01 + scope parity preserved; jest + nest build PASS.

**Open:** QA browser retest WS-G4-02/06/07; edit deep-link P1 (FE).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-RETEST-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-be-create-start-date-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md § DEF-CTR-G4-CREATE-START-DATE-400
entry_criteria: dev-be READY_FOR_QA — restart hrm-api :28001 if needed
exit_criteria: U65 browser WS-G4-02/06/07 PASS; J-HRM-CTR-CREATE-01/02; POST contracts 2xx on NV-first Tiếp; evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-create-start-date-retest-01.md; ack_status PASS_TO_PM or FAIL_TO_PM
hdsd_align: UI-HRM-CTR-WORKSPACE.md
persona: ceo@xe.vn / Xevn@2026 · company_id=main
must_keep: contracts_printable_ready=false · zero-seed
```
