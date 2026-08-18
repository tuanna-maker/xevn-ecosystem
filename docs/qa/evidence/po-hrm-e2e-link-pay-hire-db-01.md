# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-DB-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-DB-01` |
| from_role | ba-data |
| to_role | pm |
| lane | governance |
| parent | `PO-HRM-PAY-ENROLL-DOCS-01` · `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01` |
| change_mode | ADD DB note confirm · **NO** `apps/**` · **NO migrate** |
| date | 2026-08-06 |
| ack_status | **PASS_TO_PM** |
| spec_path | `docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-DB-01.md` |

---

## Honesty locks (unchanged)

| Flag | Value |
|------|--------|
| `payroll_e2e_ready` | **false** |
| `processes_catalog_bound` | **false** |
| U65 zero-seed | **true** |
| apps/** touched | **no** |
| seed | **no** |
| Module UAT claim | **none** |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| Docs evidence | `po-hrm-pay-enroll-docs-01.md` — PAY-06 v0.16 · AC-PAY-HIRE-01..05 · Diễn biến #1–#7 |
| TechSpec | `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md` §3 F-PAY-HIRE-02..04 · §4 DB note · §6.2 PROC |
| SA evidence | `po-hrm-e2e-link-pay-hire-tech-01.md` — Option B enroll + process |
| SRS Enterprise | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-PAY-06 Diễn biến #1–#7 · AC-PAY-HIRE-01..05 · PAY-01 |
| AS-IS physical | `payroll.service.ts` `ensureSchema` · `upsertPayslip` ON CONFLICT · `attendance-sheet-schema.bootstrap.ts` |
| DM | `DANH_MUC_XBOS_CHO_HRM.md` §9 STT 55–58 |
| Logical TO-BE | `DB_DESIGN_HRM_ENTERPRISE.md` §5.1–5.2 `pay_*` — **not** GĐ1 physical rename |

---

## Verdict — **CONFIRMED AS-IS**

| Topic | Stamp |
|-------|--------|
| Enroll SoT | **`payroll_payslips`** row · UQ `(period_id, employee_id)` · status=`draft` on enroll (CHECK allows; BE must pass explicitly) |
| Period SoT | **`payroll_periods`** · SM `draft\|processed\|closed` · UQ `(company_id, start_date, end_date)` |
| ADD columns `calc_mode` / `skip_reason` | **NOT REQUIRED GĐ1** — response/ephemeral only |
| Invent `batch_records` / parallel membership | **FORBIDDEN** |
| Hard FK `employee_id → employees` | **FORBIDDEN GĐ1** (soft UUID + app assert) |
| Invent `pay_period_timesheet_bind` DDL | **FORBIDDEN** — service-read `attendance_sheets` closed |
| Migrate this wave | **none** |

**Unlock:** PM may dispatch **dev-be** + **dev-fe** on existing Nest DDL — no blocking migration.

---

## Physical cross-check (read-only AS-IS)

### `payroll_periods` / `payroll_payslips`

Source: `apps/api/hrm-api/src/payroll/payroll.service.ts` `ensureSchema()` (runtime SoT).

| Object | Confirmed |
|--------|-----------|
| `payroll_periods.id` UUID PK | yes |
| `company_id` TEXT + scope filter | yes |
| `status` CHECK draft/processed/closed | yes |
| UQ `uq_payroll_period_company_date_range` | yes |
| `payroll_payslips.period_id` HARD FK CASCADE | yes |
| `employee_id` UUID NOT NULL **without** REFERENCES | yes (soft FK) |
| Amounts NUMERIC gross/deduction/net DEFAULT 0 | yes |
| `status` CHECK draft/processed/paid | yes |
| UQ `uq_payroll_payslip_period_employee` | yes |
| `upsertPayslip` ON CONFLICT `(period_id, employee_id)` | yes |

**Implementation note (BE-01, not DB gap):** table default `status='processed'` and `upsertPayslip` fallback `'processed'` — enroll path **must** pass `status: 'draft'` per TechSpec §3.3. Schema **supports** draft; no ALTER needed.

### `require_closed_timesheet` → timesheet bind

| Item | Value |
|------|--------|
| Flag | `require_closed_timesheet` — default GĐ1 **`true`** |
| Physical | `public.attendance_sheets` · `status='closed'` (+ `closed_at` LIVE per bootstrap) |
| Algorithm | Service: company in period scope **AND** date overlap period range **AND** closed |
| Fail codes | `NO_CLOSED_SHEET` (eligibility) · `HRM-PAY-ATT-412` (process precheck) |
| DDL bind table | **none** GĐ1 — Enterprise `pay_period_timesheet_bind` = TO-BE DOC-DELTA only |

### PROC storageKeys §55–58 — CONFIRMED allow-list

Source: `DANH_MUC_XBOS_CHO_HRM.md` §9 · TechSpec §6.2.

| STT | Danh mục | Canonical `storageKey` | Aliases (try-list) |
|-----|----------|------------------------|---------------------|
| 55 | Mã QT chỉnh sửa chấm công | **`hrm_attendance_correction_wf`** | `attendance_correction_workflow`, `wf_attendance_edit` |
| 56 | Mã QT nghỉ phép | **`hrm_leave_approval`** | `leave_workflow`, `wf_leave` |
| 57 | Mã QT duyệt mở rộng danh mục HRM | **`hrm_catalog_extension_wf`** | `catalog_extension_workflow`, `wf_hrm_catalog_extension` |
| 58 | Mã QT duyệt thay đổi metadata NV | **`hrm_employee_metadata_wf`** | `employee_metadata_workflow`, `wf_metadata_change` |
| 59 | Nhóm quy trình | `hrm_workflow_groups` | — (**out_mvp**) |

**Bind rules:** read-only via `GET settings-catalogs` / catalog-sync; empty honest + AC-PROC-05 deep-link; **cấm** HRM CRUD `company_processes`; WF runtime code (e.g. `hrm_leave_approval` 1-step) ≠ invent catalog rows.

**Residual:** keys not yet in `hrm-settings-master-keys.ts` CATALOG_FAMILIES — **PROC-BIND-01** adds read try-list; not a DB DDL task.

---

## AC-PAY-HIRE-04/05 — QA/FE mandate (not DB-only)

Per SRS PAY-06 Diễn biến **#5–#6** (docs v0.16):

| AC | Layer | PASS when |
|----|-------|-----------|
| AC-PAY-HIRE-04 | **FE + DB** | Sau enroll/process **2xx**: màn Lương list/dòng kỳ cập nhật — thấy `employee_id`/mã NV **hoặc** empty có lý do; không spinner/bảng trắng |
| AC-PAY-HIRE-05 | **FE + DB** | **F5** hoặc mở lại menu → cùng kỳ: row UQ `(period_id, employee_id)` **còn**; detail đúng NV |

**Cấm:** QA PASS chỉ vì POST/GET API body — browser evidence bắt buộc (U65 · `qa-fe-outside-browser-gate.mdc`).

---

## Validation matrix (data — excerpt)

| ID | Condition | Expected |
|----|-----------|----------|
| DV-PAY-HIRE-01 | Enroll eligible | UPSERT payslip UQ; GET list contains `employee_id` |
| DV-PAY-HIRE-02 | Duplicate enroll | ON CONFLICT idempotent |
| DV-PAY-HIRE-04 | `require_closed_timesheet=true`, no closed sheet | Ineligible / 412 |
| DV-PAY-HIRE-05 | Closed period | Reject enroll/process |
| DV-PROC-01 | Keys §55–58 all 0 after live GET | Empty + AC-PROC-05 link |

Full matrix: spec §6.

---

## Residual (not blocking DB stamp)

| ID | Residual | Owner |
|----|----------|-------|
| R-DB-01 | BE enroll must pass `status:'draft'` (override default processed) | dev-be |
| R-DB-02 | PROC keys not in `hrm-settings-master-keys.ts` yet | dev-fe PROC-BIND |
| R-DB-03 | Optional P1 audit columns `calc_mode` / skip log table | future wave |
| R-DB-04 | Enterprise logical `pay_*` rename / `pay_period_timesheet_bind` physicalize | post-GĐ1 sponsor |
| R-QA-01 | J-HRM-07b browser AC-04/05 after READY_FOR_QA | qa |

---

## Forbidden (honored)

- Parallel `batch_records` SoT
- Hard FK employees migration blocking GĐ1
- Invent bind table DDL this wave
- Seed payslip/NV for UAT
- Claim `payroll_e2e_ready=true`
- Invent N-step leave ladder

---

## completion_report

**Closed:** CONFIRMED AS-IS — `payroll_periods` / `payroll_payslips` đủ enroll=draft payslip UQ `(period_id, employee_id)`; no ADD columns GĐ1; `require_closed_timesheet` binds to `attendance_sheets` closed via service (no DDL); PROC §55–58 canonical storageKeys + aliases stamped; traceability includes AC-PAY-HIRE-04/05 FE+F5 mandate. Spec published at `docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-DB-01.md`. No `apps/**`.

**Open:** Dev BE/FE implementation; PROC-BIND catalog family registration; QA browser AC-04/05. `payroll_e2e_ready=false`.

## next_owner

**pm** → parallel **dev-be** `PO-HRM-E2E-LINK-PAY-HIRE-BE-01` · **dev-fe** `PO-HRM-E2E-LINK-PAY-HIRE-FE-01` · **dev-fe** `PO-HRM-E2E-LINK-PROC-BIND-01`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-BE-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: ADD
entry: PO-HRM-E2E-LINK-PAY-HIRE-DB-01 CONFIRMED AS-IS · PO-HRM-E2E-LINK-PAY-HIRE-TECH-01 §3
forbidden: seed payslip; FE-owned net; status-only process; hard FK migration; invent batch_records

read_first:
- docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md §3 F.1
- docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-DB-01.md §2–§4
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-db-01.md
- SRS FR-UC-BP-PAY-06 #1–#7 · AC-PAY-HIRE-01..05

Task:
- ADD GET …/periods/:id/eligibility (require_closed_timesheet → attendance_sheets closed overlap)
- ADD POST …/periods/:id/enroll → upsert draft payslips UQ (period_id, employee_id); pass status='draft'
- EXPAND POST …/process: generate amounts (stub OK) + draft→processed; reject 0-slip silent
- List periods: employee_count = COUNT payslips
- jest: enroll+process creates payslip; closed reject; scope_parity; ATT-412 when no closed sheet
- CODE-MEMORY APPEND; solid_convention_ack OS 28
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-be-01.md
U65; payroll_e2e_ready=false

---

work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-FE-01
from_role: pm
to_role: dev-fe
lane: execution
parallel: sau BE contract freeze hoặc mock contract
change_mode: FIX/ADD

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-db-01.md § AC-PAY-HIRE-04/05
- PO-HRM-E2E-LINK-PAY-HIRE-TECH-01 §7 FE wire

Task:
- Wire addRecord → POST enroll; fetchBatchRecords → payslips; employee_count from API
- AC-PAY-HIRE-04: sau 2xx list/dòng kỳ cập nhật ngay — không fake toast
- AC-PAY-HIRE-05: F5 / navigate lại cùng kỳ — phiếu còn
- Eligibility reasons display; lockBatch process→close only after process 2xx
- Cấm FE tính net (OS 28)
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-01.md

---

work_item_id: PO-HRM-E2E-LINK-PROC-BIND-01
from_role: pm
to_role: dev-fe
lane: execution
parallel: với HIRE-FE

Task:
- Replace useProcesses hard [] with GET settings-catalogs keys §55–58 (canonical + aliases per DB-01 §5)
- Empty → AC-PROC-05 clickable CC deep-link
- Keep read-only; cấm CRUD toast
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-e2e-link-proc-bind-01.md
processes_catalog_bound=false until QA PASS
```

## ack_status

**PASS_TO_PM**
