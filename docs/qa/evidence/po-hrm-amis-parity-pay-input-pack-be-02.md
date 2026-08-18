# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01` FAIL `PAYINPQA-MSIRS9L7` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-07 |
| **change_mode** | FIX / ADD |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed · **cấm** seed · **cấm** ready flip |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-01.md` | R-PAY-INP-BIND-SHEET-CODE-COL · R-PAY-SRC-03-PROCESS · R-PAY-ADV-EMP-API-ABSENT |
| `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md` | F-PAY-PERIOD-BIND · F-PAY-ADV-BRIDGE · PROCESS SRC-03 |
| `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01.md` | §2 bind · §4 advance · BR-PAY-ADV-BRIDGE-* |
| `apps/api/hrm-api/src/attendance/attendance-sheet-schema.bootstrap.ts` | `attendance_sheets` DDL — **no `code` column** |

**must_keep:** ATT-LINE-01 · formula F.1 · TPL F.1 · scope_parity U19 · `payroll_e2e_ready=false`

---

## Root cause → fix

| Residual | Root cause | Fix |
|----------|------------|-----|
| **R-PAY-INP-BIND-SHEET-CODE-COL** | `bindSelectSql` selected `s.code` but DDL has only `name`/`status`/dates → LIST/GET **500** | SELECT `NULL::text AS timesheet_code` + `s.name`; `timesheetDisplayLabel` from **name**; status from sheet |
| **R-PAY-SRC-03-PROCESS** | Eligibility forced `company_id = period.company_id`; legacy period `main` → **items=[]** (employees under `holding`) | AND period OU via `expandPayrollAttendanceSheetCompanyIds` (main↔holding) ∩ RBAC scope |
| **R-PAY-ADV-EMP-API-ABSENT** | Only GET employees; FE threw «API thêm NV chưa có» | **ADD** `POST /payroll/advance-requests/:requestId/employees` (`HRM-ADV-201`) while `pending`; rolls `employee_count`/`total_amount` |

---

## Deliverables

| Area | Path / contract |
|------|-----------------|
| Bind SELECT | `pay-period-input-pack.service.ts` `bindSelectSql` / `mapBind` |
| Eligibility | `payroll.service.ts` `loadPayrollEligibility` |
| Advance emp API | `POST …/advance-requests/:requestId/employees` · DTO `CreateAdvanceRequestEmployeeDto` · code `HRM-ADV-201` |
| Jest | bind no `s.code` · eligibility main→holding · VAL-INP-ADV-01 emp row · F-PAY-ADV-EMP-01 create |

### POST body (advance employee)

```json
{
  "employee_id": "<uuid optional>",
  "employee_code": "HLD-0001",
  "employee_name": "Nguyễn Văn An",
  "advance_amount": 1500000,
  "department": null,
  "position": null,
  "note": null
}
```

Mark-paid still requires `payrollPeriodId` → upserts `source_kind=advance` / `source_ref=advance_request_employee:{id}`.

---

## Verification

```bash
pnpm --filter hrm-api exec jest src/payroll --no-cache
# 9 suites · 138 tests PASS

pnpm --filter hrm-api run build
# nest build + verify-dist PASS
```

| Test ID | Spec | Verdict |
|---------|------|---------|
| R-PAY-INP-BIND-SHEET-CODE-COL | `pay-period-input-pack.service.spec.ts` | LIST SQL **no** `s.code`; label from name · status=closed |
| VAL-INP-BIND-04 | same | scope_parity + display label from name |
| VAL-INP-ADV-01 | same | bridge with emp row → `source_kind=advance` + `source_ref` |
| R-PAY-SRC-03 eligibility | `payroll.service.spec.ts` | period `main` returns HLD-0001 eligible (holding OU) |
| F-PAY-ADV-EMP-01 | `payroll.service.spec.ts` | INSERT pending OK · approved → `HRM-ADV-409` |

---

## QA retest (L1 — U65)

**Persona:** `ceo@xe.vn` · `company_id=main` · **cấm seed**

| AC | Steps |
|----|-------|
| **AC-AMIS-ATT-XFER-01** | Bind closed sheet → **GET/LIST binds 200** · `timesheetDisplayLabel` from name · `timesheetStatus=closed` → eligibility **items.length > 0** (not ATT-412) |
| **AC-PAY-SRC-03** | Input line OK → enroll explicit HLD-0001 **succeeds or honest reasons** → process (may still VARS/FORMULA-412 — not ATT-412 / ENROLL silent empty) |
| **VAL-INP-ADV-01** | Create advance → **POST …/employees** → approve → mark-paid + `payrollPeriodId` → input line `source_kind=advance` |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim module UAT / browser Step4 UF.
- Did **not** use `pnpm seed:*`.
- FE `useAdvanceRequests` still throws until **dev-fe** wires POST — L1 can call Nest directly.

---

## Residual

| Item | Owner |
|------|-------|
| FE wire `POST …/employees` (remove throw) | **dev-fe** after QA L1 |
| Browser Step4 UF packs | **dev-fe** + QA browser |
| Module UAT / ready flip | **DENIED** |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Fixed bind SQL (no sheet.code), eligibility main↔holding, ADD advance-request employees POST; jest 138 PASS; build PASS; honesty false |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-02.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02 READY_FOR_QA

entry_criteria:
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-02.md
- L0 qc:dev-stack; live dist routes timesheet-binds + advance-requests/:id/employees POST
- U65 zero-seed · payroll_e2e_ready must stay false

exit_criteria:
1) AC-AMIS-ATT-XFER-01: closed bind → LIST/GET binds 200 display-ready (name label, status=closed) — no 500 s.code
2) After bind: GET eligibility items[] not empty for HLD-0001/holding; enroll explicit can succeed OR honest ineligible reasons
3) VAL-INP-ADV-01: POST advance-requests/:id/employees → approve → mark-paid+payrollPeriodId → source_kind=advance line
4) evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md
5) ack_status PASS_TO_PM or FAIL_TO_PM

cấm: pnpm seed:* · payroll_e2e_ready flip · browser UF claim as module UAT
```
