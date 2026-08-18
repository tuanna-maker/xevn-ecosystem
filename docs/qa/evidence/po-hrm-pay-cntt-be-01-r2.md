# Evidence — D-PAY-CNTT-BE-COMPILE-01 (r2)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-PAY-CNTT-BE-COMPILE-01` |
| **parent** | `PO-HRM-PAY-CNTT-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-11 |
| **change_mode** | FIX |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · U65 zero-seed |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

`apps/api/hrm-api/src/payroll/dto/pay-period-input-line.dto.ts` had orphaned decorators/fields (L101–108) **outside** any class after `UpdatePeriodInputLineDto` closed — blocking `nest start --watch` with TS1146/TS1005/TS1128. The orphan was a broken `BridgeAdvanceToPeriodDto` missing its `export class` declaration.

---

## Fix

| Action | Detail |
|--------|--------|
| Restore `BridgeAdvanceToPeriodDto` | `payrollPeriodId` (required UUID) + optional `componentCode` |
| Keep `UpdatePeriodInputLineDto` | Unchanged fields; class closes cleanly at L100 |
| Keep `MarkAdvancePaidDto` | Retains own `payrollPeriodId` / `componentCode` (advance mark-paid path) |

**File:** `apps/api/hrm-api/src/payroll/dto/pay-period-input-line.dto.ts`

---

## Build / boot

```bash
cd apps/api/hrm-api
pnpm exec nest build          # exit 0
pnpm run dev:hrm-api          # watch: Found 0 errors; routes mapped
```

**Route map (2026-08-11 12:33):**

- `GET|POST /api/hrm/payroll/pay-policy-packs`
- `GET|POST /api/hrm/payroll/pay-input-pack-profiles`
- `GET /api/hrm/payroll/pay-setup/resolve`

---

## Jest regression

```bash
cd apps/api/hrm-api
pnpm exec jest pay-cntt-setup.service.spec.ts pay-period-input-pack.service.spec.ts pay-sheet-template.service.spec.ts --no-coverage
```

| Suite | Result |
|-------|--------|
| `pay-cntt-setup.service.spec.ts` | **PASS** |
| `pay-period-input-pack.service.spec.ts` | **PASS** |
| `pay-sheet-template.service.spec.ts` | **PASS** |

**Exit 0 · 27/27 tests**

---

## Live smoke (`:28001` after restart)

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · stamp `cnttber2_mso87gq8`

| AC | Method / path | Status | Code / note |
|----|---------------|--------|-------------|
| Policy pack CRUD | `POST /payroll/pay-policy-packs` | **201** | `HRM-PAY-POL-201` |
| Policy pack list | `GET /payroll/pay-policy-packs?company_id=main` | **200** | created pack in list |
| Input profile CRUD | `POST /payroll/pay-input-pack-profiles` | **201** | `HRM-PAY-INP-PROF-201` |
| Input profile list | `GET /payroll/pay-input-pack-profiles?company_id=main` | **200** | — |
| Setup resolve | `GET /payroll/pay-setup/resolve?company_id=main&business_line_tag=DPHH` | **200** | `recommended` present |
| Period setupContext | `POST /payroll/periods` + `paySheetTemplateId` (2025-11) | **201** | `sheet_template_snapshot_json.setupContext` has `policyPackId`, `inputPackProfileId`, `allowedSourceKinds: [manual,kpi]` |
| Profile 422 | `POST /payroll/periods/:id/input-lines` `sourceKind=revenue` | **422** | `HRM-PAY-INP-PROFILE-422` — *Cho phép: manual, kpi* |
| scope_parity U19 | `du-lich.ceo@xe.vn` `GET /pay-policy-packs/:id?company_id=main` | **404** | `HRM-PAY-POL-404` (holding pack invisible to member CEO) |

**Note for QA:** DTO bodies use `company_id` (snake_case) per `pay-cntt-setup.dto.ts`; `companyId` camelCase → `HRM-VAL-001`. Employee pick: `GET /employees?company_id=main&page_size=1` → `data.data[0].id` (not `/payroll/employees`).

---

## must_keep

- `payroll_e2e_ready=false`
- Formula evaluator **HOLD**
- Existing PAY paths unchanged (compile-only + DTO restore)

---

## completion_report

### Closed

1. Fixed TS compile blocker in `pay-period-input-line.dto.ts` (restored `BridgeAdvanceToPeriodDto`).
2. `nest build` exit 0; `dev:hrm-api` boots with CNTT routes on `:28001`.
3. Jest **27/27** PASS (same three suites).
4. Live smoke: policy/profile CRUD 2xx, resolve 200, setupContext on period bind, `HRM-PAY-INP-PROFILE-422`, member scope 404.

### Residual (not in scope)

| ID | Item | Owner |
|----|------|-------|
| R-CNTT-FE | Thiết lập hub UI | dev-fe |
| R-CNTT-QA-SCRIPT | QA probe uses `companyId` / `/payroll/employees` — align to DTO contract | qa |
| R-CNTT-SALES | sales → input-lines bridge | dev-be |

---

## next_owner

**qa** — `QA-PO-HRM-PAY-CNTT-BE-01` retest L1 live API

---

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-PAY-CNTT-BE-01-R2
from_role: dev-be
to_role: qa
lane: execution
parent: PO-HRM-PAY-CNTT-BE-01

read_first:
- docs/qa/evidence/po-hrm-pay-cntt-be-01-r2.md
- docs/qa/evidence/qa-po-hrm-pay-cntt-be-01.md (prior FAIL baseline)

entry_criteria: D-PAY-CNTT-BE-COMPILE-01 READY_FOR_QA; hrm-api :28001 up with CNTT routes

exit_criteria:
- L0 qc:dev-stack + qc:fe-be-health PASS
- L1 live: POST/GET pay-policy-packs, pay-input-pack-profiles 2xx (body company_id snake_case)
- GET pay-setup/resolve 200
- Period bind setupContext snapshot PASS
- POST input-line source_kind=revenue → HRM-PAY-INP-PROFILE-422
- scope_parity: du-lich.ceo@xe.vn GET holding policy → 404
- Jest 27/27 exit 0
- evidence docs/qa/evidence/qa-po-hrm-pay-cntt-be-01-r2.md
- ack_status PASS_TO_PM or FAIL_TO_PM
- must_keep: payroll_e2e_ready=false; U65 zero-seed; formula HOLD
```

---

## evidence_path

`docs/qa/evidence/po-hrm-pay-cntt-be-01-r2.md`
