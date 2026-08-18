# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD |
| **sponsor_confirm** | Q-PAY-FORMULA Option A ANSWERED · DATA-01 CONFIRMED · API-01 CONFIRMED |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim formula LIVE / evaluator UAT |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` | F.1 AUTHOR/PUBLISH/LIST · errors · paths `/api/hrm/payroll/formulas*` |
| 2 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md` §2.1 | Columns · UQ `(company_id,code,version)` · IX · soft-delete |
| 3 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-api-01.md` | Unlock bar · residual PREVIEW/PROCESS staged |
| 4 | `docs/qa/evidence/po-hrm-amis-parity-sa-01.md` | **cấm** invent `pay_sheet_template` HTTP this wave |
| 5 | Nest `payroll.service` ensureSchema + `expandPayrollPeriodCompanyIds` | Scope parity pattern (same as periods) |
| 6 | ADR §10 · R-PAY-DD-01 | Option A dual-control · Form GĐ1 — cấm DnD |

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-formula.constants.ts` | SM statuses · code format · DV-18 allow-list · error codes |
| `apps/api/hrm-api/src/payroll/dto/pay-formula.dto.ts` | List/create/update/version/preview DTOs |
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | ensureSchema + AUTHOR/PUBLISH/LIST/retire/preview stub |
| `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts` | Jest SM · dual · immutable · scope_parity |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | Routes under `payroll/formulas*` + CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/app.module.ts` | `PayFormulaService` provider |

**FORBIDDEN this wave (honored):** template HTTP · AST evaluator invent · `salary_components.formula` as engine SoT · closed formula `code` CHK IN (N) · hard-delete · U65 seed · `payroll_e2e_ready=true`.

---

## 3. Schema (ensureSchema)

`public.pay_formula_definitions`:

- Columns per DATA §2.1 (+ `meta_json` for optional label)
- UQ `uq_pay_formula_definitions_company_code_version`
- IX `(company_id, code, status) WHERE archived_at IS NULL`
- IX `(company_id, effective_from)`
- CHK status SM only (`draft|pending_publish|active|retired`) — **not** closed business code enum

Optional low-blast:

- `payroll_periods.formula_definition_id` UUID NULL
- `payroll_payslips.formula_definition_id` UUID NULL

---

## 4. HTTP map (Nest physical)

| Cap | METHOD / path |
|-----|----------------|
| LIST | `GET /api/hrm/payroll/formulas?company_id=` |
| GET | `GET /api/hrm/payroll/formulas/:id?company_id=` |
| AUTHOR create | `POST /api/hrm/payroll/formulas` |
| AUTHOR update draft | `PUT /api/hrm/payroll/formulas/:id` |
| New version | `POST /api/hrm/payroll/formulas/:code/versions` |
| Submit | `POST /api/hrm/payroll/formulas/:id/submit-publish?company_id=` |
| Withdraw | `POST /api/hrm/payroll/formulas/:id/withdraw-publish?company_id=` |
| Publish | `POST /api/hrm/payroll/formulas/:id/publish?company_id=` |
| Retire | `POST /api/hrm/payroll/formulas/:id/retire?company_id=` |
| Preview stub | `POST /api/hrm/payroll/formulas/:id/preview` → **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** |

Scope: `resolveHrmListScope` + `expandPayrollPeriodCompanyIds` + `assertResourceInHrmScope` (same as periods).

Dual-control: default **ON** (`HRM_PAY_FORMULA_DUAL_CONTROL` unset/true) → self-publish **`HRM-PAY-FORMULA-403-DUAL`**.

---

## 5. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=pay-formula.service.spec --testPathPatterns=payroll.controller.spec --no-coverage
→ Test Suites: 2 passed · Tests: 18 passed
```

Coverage intent:

| Case | Result |
|------|--------|
| ensureSchema ADD + UQ/IX · no closed code enum | PASS |
| SM draft → pending_publish → active (author ≠ publisher) | PASS |
| Self-publish → 403-DUAL | PASS |
| Update active → 409-IMMUTABLE | PASS |
| submit without required_vars → 412-VARS | PASS |
| scope_parity main→holding list/get | PASS |
| member CEO blocked on holding | PASS |
| preview stub PREVIEW-STUB | PASS |
| retire soft-delete (no DELETE FROM) | PASS |

---

## 6. completion_report

### Closed

1. ensureSchema `pay_formula_definitions` + indexes/UQ per DATA-01.  
2. Nest CRUD F-PAY-FORMULA-AUTHOR/PUBLISH/LIST + retire soft-delete.  
3. Dual-control publish deny; immutable non-draft; DV-18 required_vars gate.  
4. Scope parity with payroll periods resolver.  
5. Optional nullable `formula_definition_id` on periods/payslips.  
6. Preview honest stub (not LIVE).  
7. Jest 18 PASS; controller mock wired.  
8. Honesty: `payroll_e2e_ready=false`.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-F-QA-L1 | L1 smoke create/list/submit/publish deny dual on live :28001 | **qa** |
| R-PAY-F-EVAL | Evaluator + PROCESS lines + real PREVIEW | **dev-be** staged (after ATT line) |
| R-PAY-AMIS-TPL | Template formula override HTTP | AMIS depth — **not** this wave |
| R-PAY-FE-FORM | GĐ1 form author UI (no DnD) | **dev-fe** after QA L1 |

### Explicit non-claims

- Did **not** invent `pay_sheet_template` HTTP.  
- Did **not** ship LIVE expression evaluator / AST taxonomy.  
- Did **not** treat `salary_components.formula` as SoT.  
- Did **not** set `payroll_e2e_ready=true` / seed UF data.

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0
entry_criteria: BE-01 READY_FOR_QA · L0 hrm-api up · U65 zero-seed
exit_criteria: L1 smoke evidence for formulas CRUD + dual-control deny + scope_parity; no claim LIVE

## Mission
L1 API smoke (not browser UF primary):
1. POST draft formula (opaque expression_json + required_vars keys)
2. GET list/get same company scope (main↔holding if group CEO)
3. submit-publish → publish with second actor → active
4. Same actor publish → expect HRM-PAY-FORMULA-403-DUAL
5. PUT active → 409-IMMUTABLE
6. POST preview → 412-PREVIEW-STUB (honest)
7. Confirm no pay_sheet_template routes invented

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7

evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md
honesty: payroll_e2e_ready=false
cấm: seed · claim formula LIVE · browser UF PASS without FE form
```

---

## 8. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §6 |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | §7 |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01` L1 smoke |
