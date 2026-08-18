# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-TECH-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01` |
| from_role | sa |
| to_role | pm |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| lane | governance |
| change_mode | ADD TechSpec / API_DESIGN F.1 · **NO** `apps/**` |
| date | 2026-08-06 |
| ack_status | **PASS_TO_PM** |
| spec_path | `docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md` |
| entry | docs merge PASS `po-hrm-e2e-link-pay-cfg-docs-01.md` |

---

## Honesty locks (unchanged)

| Flag | Value |
|------|--------|
| `payroll_e2e_ready` | **false** |
| `processes_catalog_bound` | **false** |
| `settings_catalog_e2e_ready` | **false** |
| U65 zero-seed | **true** |
| apps/** touched | **no** |
| seed | **no** |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| SRS Enterprise | `SRS_HRM_ENTERPRISE.md` v0.13 **FR-UC-BP-PAY-06** Diễn biến #1–#5 · AC-PAY-HIRE-01..03 · **PAY-02** dual SoT · AC-PAY-COMP-01 |
| Team SRS | `docs/hrm/SRS.md` UC-HRM-24 · §13.1 AC-PROC-05/06 · §16.2 · §16.8 |
| BA SPEC | `PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` §A1 · §C P0-PAY-01..04 · §D1–D3 MERGED |
| Docs evidence | `po-hrm-e2e-link-pay-cfg-docs-01.md` next_dispatch |
| Enterprise TS | §7 P1–P6 · `F-PAY-PROCESS-01` / `F-PAY-PAYSLIP-01` / `F-PAY-ATT-CLOSED-01` (overlay, no wipe) |
| OS 28 | `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md` — cấm FE tự tính net / join eligibility |
| AS-IS code | `payroll.service` process = status-only; `upsertPayslip` internal; FE `addRecord` throw · `employee_count: 0` |

---

## Decisions locked

| Topic | Decision |
|-------|----------|
| Enroll/generate path | **Option B** — `POST …/enroll` + **EXPAND** `POST …/process` (generate amounts + status) |
| Enrollment SoT | `payroll_payslips` row UQ `(period_id, employee_id)` — không invent batch_records SoT |
| Formula GĐ1 | Stub BE OK nếu Q-PAY-FORMULA HOLD — **vẫn** phải có row phiếu; `calc_mode: stub` |
| OS 28 | Gross/net/eligibility/reasons = BE display-ready only |
| PROC | GET settings-catalogs/catalog-sync keys §55–58 **OR** empty + **AC-PROC-05** deep-link; **cấm** fake CRUD |
| Dual SoT | `salary_components` = mã; `pay_types` = nature; TX reference code — AC-PAY-COMP-01 |
| Dev | **HOLD** `apps/**` · `payroll_e2e_ready=false` |

### F-id map (PAY-06)

| Diễn biến | F-id | Path |
|-----------|------|------|
| #1 | F-PAY-HIRE-01 | POST/GET `/payroll/periods` |
| #2 | F-PAY-HIRE-02 | GET `…/eligibility` **ADD** |
| #3 | F-PAY-HIRE-03 | POST `…/enroll` **ADD** |
| #3–#4 | F-PAY-HIRE-04 | POST `…/process` **EXPAND** (overlay F-PAY-PROCESS-01) |
| #4 | F-PAY-HIRE-05 | GET `/payroll/payslips` |
| #5 | F-PAY-HIRE-06 | POST `…/close` |
| PROC | F-PROC-BIND-01 | GET catalog §55–58 + deep-link |
| COMP | F-PAY-COMP-01 | validate code vs `salary_components` |

---

## Residual

| ID | Residual | Owner next |
|----|----------|------------|
| R1 | ba-data confirm AS-IS tables đủ / optional `calc_mode` column | ba-data |
| R2 | Impl enroll + process generate + FE wire + gỡ fake toast | dev-be + dev-fe |
| R3 | PROC bind GET + AC-PROC-05 link | dev-fe (`PROC-BIND-01`) |
| R4 | AC-PAY-COMP-01 picker khi catalog>0 | dev-fe (+ be validate) |
| R5 | Client TECHSPEC §7 DOC-DELTA pointer (no wipe) | ba-docs optional |
| R6 | QA J-HRM-07b hire→payslip sau READY_FOR_QA | qa |

---

## completion_report

Đã phát hành TechSpec/API_DESIGN F.1 Hire-to-Pay (Option B enroll + process generate) map PAY-06 Diễn biến #1–#5; DB note soft `employee_id` + UQ payslip; PROC bind GET §55–58 hoặc empty+deep-link; dual SoT salary_components vs pay_types; OS 28 cấm FE net. Không sửa `apps/**`, không seed, `payroll_e2e_ready=false`. Residual: ba-data stamp + Dev BE/FE + PROC-BIND.

## next_owner

**pm** → **ba-data** (narrow DB) **song song sau stamp** → **dev-be** + **dev-fe** (HIRE) + **dev-fe** (PROC-BIND)

## next_dispatch_prompt

```text
# Wave A — ba-data (narrow, trước hoặc song song unlock)
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-DB-01
from_role: pm
to_role: ba-data
lane: governance
change_mode: ADD DB note confirm — NO apps/**

read_first:
1. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md §4 DB note · §3 F-PAY-HIRE-02..04
2. docs/qa/evidence/po-hrm-e2e-link-pay-hire-tech-01.md
3. AS-IS payroll_payslips / payroll_periods (TECHSPEC soft FK note)
4. DM §55–58 proposed storageKey table §6.2 — confirm hoặc chỉnh allow-list

Task:
- Stamp CONFIRMED: AS-IS tables đủ cho enroll=payslip draft UQ (period_id, employee_id)
  OR ADD minimal columns (calc_mode / skip_reason) only if required for AC-PAY-HIRE-01 UI
- Confirm require_closed_timesheet physical sheet bind path (ATT closed)
- Confirm/adjust PROC storageKeys §55–58
- Cấm invent parallel batch_records SoT; cấm hard FK migration blocking GĐ1
exit: DB_DESIGN delta short + PASS_TO_PM
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-hire-db-01.md
honesty: payroll_e2e_ready=false

---

# Wave B — sau DB stamp / PM unlock AS-IS
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-BE-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: ADD
entry: PO-HRM-E2E-LINK-PAY-HIRE-TECH-01 + DB-01 CONFIRMED (or PM AS-IS unlock)
forbidden: seed payslip; FE-owned net; status-only process claim DONE

read_first:
- docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md §3 F.1
- SRS FR-UC-BP-PAY-06 #1–#5 · AC-PAY-HIRE-*
- OS 28 display-ready

Task:
- ADD GET …/periods/:id/eligibility
- ADD POST …/periods/:id/enroll (explicit | auto_eligible) → upsert draft payslips
- EXPAND POST …/process: generate/upsert amounts (stub OK) + status draft→processed; reject 0-slip silent
- List periods: employee_count = COUNT payslips
- Validate salary component code vs salary_components when catalog>0 (AC-PAY-COMP-01)
- jest: enroll+process creates payslip for Active employee; closed reject; scope_parity
- CODE-MEMORY APPEND; solid_convention_ack FE–BE boundary
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-01.md
U65; payroll_e2e_ready=false

---

work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-FE-01
from_role: pm
to_role: dev-fe
lane: execution
parallel: với BE-01 sau contract freeze
change_mode: FIX/ADD

Task:
- Wire addRecord → enroll; fetchBatchRecords → payslips; employee_count from API
- Show eligibility reasons; no success toast on throw/void (P0-PAY-04 updateBatch)
- lockBatch: process then close only after process 2xx with slips or explicit empty reason
- SalaryComponentsTab: picker salary_components when items>0 + keep pay_types
- Cấm FE tự tính net (OS 28)
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-01.md

---

work_item_id: PO-HRM-E2E-LINK-PROC-BIND-01
from_role: pm
to_role: dev-fe
lane: execution
parallel: với HIRE-FE OK

Task:
- Replace useProcesses hard [] with GET settings-catalogs/catalog-sync keys §55–58 (TechSpec §6)
- Empty → AC-PROC-05 clickable deep-link Command Center WF/catalog admin
- Keep read-only; cấm reintroduce CRUD toast
- AC-PROC-01..06
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-e2e-link-proc-bind-01.md
processes_catalog_bound=false until QA PASS
```

## ack_status

**PASS_TO_PM**
