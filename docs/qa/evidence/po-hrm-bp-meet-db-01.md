# Evidence — PO-HRM-BP-MEET-DB-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-MEET-DB-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **ack_status** | `PASS_TO_PM` |

## completion_report

### Closed
- Created logical **`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`** (status **DRAFT for design** — not customer-confirmed).
- Aligned to Speaker-2 meeting wants + `DATA_OWNERSHIP_MATRIX` + `API_BOUNDARY_MAP` + ADR 4-pillar + SRS enterprise FR refs.
- **REC MVP:** `rec_job_description`, headcount plan/cells, `rec_recruitment_request` (in/out plan + new/replace), `rec_candidate`, `rec_candidate_application` N–N, stage history, interview eval template/instance; **Campaign/JobPost = GĐ2 optional** tables.
- **CORE:** public employee vs `hrm_employee_compensation` C&B, dependents, contract + doc checklist, `insurance_enrollment` + `insurance_rate_period` timeline, reward/discipline + `payroll_link_status`, asset assignment/handover stub, employment_history, termination (voluntary/dismissal).
- **ATT:** shift, assignment/schedule, holiday calendar, leave accrual policy + balance + hold, punches, timesheet header/lines with closed SoT payable hours (OT weighted pre-close).
- **PAY:** stub only — `pay_formula_definition`, `pay_insurance_rate_cfg`, `pay_payslip` (required `timesheet_header_id`), `pay_payroll_period` pointer — no invented formula depth.
- Boundaries encoded: no REC→PAY FK; no payslip→leave/OT/candidate; PAY reads closed timesheet only; C&B ring split; scope_parity/`company_id` conventions; soft-delete.

### Residual / open
- Physical DDL / Nest table alias mapping → after SRS+TechSpec confirm (SA).
- Q-REC-HEADCOUNT, Q-LEAVE-ACCRUAL/UNIT, Q-SI-SUSPEND, Q-PAY-FORMULA, contract `salary_calc_mode` enums still open — documented, not invented.
- Concurrent ba-process SRS meeting delta may rename FR labels — DB uses meeting entity names + current FR ids; reconcile if SRS renames.
- J-*/UF ids not assigned (await FR lock).

### Forbidden respected
- No migrations / `apps/**` changes.
- No PAY depth invent beyond stubs.
- No secrets.

## next_owner

`sa` (preferred for API_DESIGN/TechSpec depth) — or `pm` for intake/dispatch.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-MEET-TECH-API-01
from_role: pm
to_role: sa
lane: governance

Mission: Draft TECHSPEC depth for meeting-locked decisions + create API_DESIGN_HRM_ENTERPRISE.md.

read_first:
1. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md
2. docs/client-delivery/hrm-enterprise-blueprint/MEETING_20260804_CUSTOMER_WANTS.md
3. docs/client-delivery/hrm-enterprise-blueprint/API_BOUNDARY_MAP.md
4. docs/client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md
5. docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md
6. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md

exit_criteria:
- API_DESIGN maps each MVP table write/read surface with F.1: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS
- Enforce PAY←closed timesheet only; REC↛PAY; C&B ring endpoints
- Campaign/JobPost marked GĐ2; PAY detail HOLD (meeting unfinished)
- evidence docs/qa/evidence/po-hrm-bp-meet-tech-api-01.md · PASS_TO_PM
- no apps/** · no migrations
```

## evidence_path

- Design: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`
- This file: `docs/qa/evidence/po-hrm-bp-meet-db-01.md`

## ack_status

`PASS_TO_PM`
