# PO-HRM-E2E-LINK-PAY-HIRE-DB-01 — DB confirm · Hire→kỳ→phiếu (AS-IS)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-HIRE-DB-01` |
| **lane** | governance · ba-data |
| **change_mode** | ADD DB note confirm · **NO** `apps/**` · **NO migrate** (AS-IS stamp) |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED AS-IS** — unlock Dev BE/FE narrow |
| **ref_tech** | [`PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md`](./PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md) §3 · §4 · §6.2 |
| **ref_physical** | Nest `payroll.service` ensureSchema · `attendance-sheet-schema.bootstrap` |
| **ref_logical** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §5.1–5.2 (`pay_*` = Enterprise TO-BE; **not** GĐ1 physical rename) |
| **ref_dm** | [`DANH_MUC_XBOS_CHO_HRM.md`](../../hrm/DANH_MUC_XBOS_CHO_HRM.md) §9 STT 55–58 |
| **Honesty** | `payroll_e2e_ready=false` · `processes_catalog_bound=false` · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict — CONFIRMED AS-IS

| Decision | Value |
|----------|--------|
| Enroll SoT | **`payroll_payslips` row** status=`draft` · UQ `(period_id, employee_id)` |
| Period SoT | **`payroll_periods`** SM `draft\|processed\|closed` · UQ `(company_id, start_date, end_date)` |
| ADD `calc_mode` / `skip_reason` columns | **NOT REQUIRED GĐ1** — response/ephemeral only (see §3) |
| Invent `batch_records` / parallel membership table | **FORBIDDEN** |
| Hard FK `payroll_payslips.employee_id → employees` | **FORBIDDEN GĐ1** (soft UUID + app assert; G-DB-02) |
| Invent `pay_period_timesheet_bind` DDL GĐ1 | **FORBIDDEN** — service-read ATT closed |
| Invent N-step leave ladder | **FORBIDDEN** (out of scope this wave) |
| `payroll_e2e_ready` | **false** until QA J-HRM-07b |

**Unlock:** AS-IS tables **đủ** cho F-PAY-HIRE-03 enroll + F-PAY-HIRE-04 process (upsert amounts + status). Migration **không** bắt buộc trước Dev.

---

## 2. Physical map (AS-IS Nest = runtime SoT)

### 2.1 `payroll_periods`

| Column / constraint | AS-IS | GĐ1 rule |
|---------------------|-------|----------|
| `id` UUID PK | yes | keep |
| `company_id` TEXT | yes | scope_parity list↔mutate |
| `period_label`, `start_date`, `end_date` | yes | overlap → `HRM-PAY-002` |
| `status` CHECK draft\|processed\|closed | yes | keep SM |
| `processed_at` / `closed_at` | yes | keep |
| UQ `uq_payroll_period_company_date_range` | yes | keep |

### 2.2 `payroll_payslips` — enrollment evidence

| Column / constraint | AS-IS | GĐ1 rule |
|---------------------|-------|----------|
| `period_id` **HARD** FK → periods ON DELETE CASCADE | yes | keep |
| `employee_id` UUID NOT NULL **SOFT** (no REFERENCES employees) | yes | app assert Active + company |
| `employee_code` / `employee_name` | yes | denorm display-ready |
| `gross_amount` / `deduction_amount` / `net_amount` | yes | **BE-only write** |
| `status` CHECK draft\|processed\|paid | yes | enroll → `draft`; process → `processed` |
| UQ `uq_payroll_payslip_period_employee` `(period_id, employee_id)` | yes | **enroll UPSERT key** |
| `ON CONFLICT (period_id, employee_id) DO UPDATE` path | yes (`upsertPayslip`) | reuse — do not invent second SoT |

**Alias (Enterprise logical → physical GĐ1):**

| Logical (client DB_DESIGN) | Physical GĐ1 |
|----------------------------|--------------|
| `pay_payroll_period` | `payroll_periods` |
| `pay_payslip` | `payroll_payslips` |
| `pay_period_timesheet_bind` | **no table** — see §4 service bind |
| `att_timesheet_header` | `attendance_sheets` |

---

## 3. `calc_mode` / `skip_reason` — NOT ADD (rationale)

| Need | GĐ1 storage | Why not DDL |
|------|-------------|-------------|
| Stub formula honesty (`calc_mode: stub`) | **Response / process payload only** | AC-PAY-HIRE-01 PASS = **row exists** with `employee_id`; amounts may be `0` |
| Eligibility `reasons[]` | Ephemeral GET eligibility | TechSpec §4 — no new table |
| Process `skipped[]` | Ephemeral response | same |
| Audit UI later | Optional P1: `payroll_payslip_skip_log` **or** ADD nullable `calc_mode`/`skip_reason` TEXT | **wave riêng** — không block Hire-to-Pay spine |

**CONFIRMED:** no `ALTER TABLE payroll_payslips ADD COLUMN` for this work_item.

---

## 4. `require_closed_timesheet` → ATT sheet physical bind

| Item | Value |
|------|--------|
| Flag name | `require_closed_timesheet` (company setting / env — BE reads) |
| Default GĐ1 | **`true`** — ATT sheet close path **LIVE** (`POST …/attendance-sheets/:id/close` → `status=closed`) |
| Physical table | **`public.attendance_sheets`** |
| Closed predicate | `status = 'closed'` (+ optional `closed_at IS NOT NULL`) |
| Bind algorithm (service, no DDL) | Find sheet(s) where `company_id` in period scope **AND** date range **overlaps** `payroll_periods.start_date..end_date` **AND** closed; else reason `NO_CLOSED_SHEET` / `HRM-PAY-ATT-412` |
| Soft vs hard | **No** payslip/period FK to sheet GĐ1; **no** invent `pay_period_timesheet_bind` |
| Enterprise P1 later | Logical bind table stays TO-BE — DOC-DELTA only; physicalize after sponsor |

**Honesty:** If env forces `require_closed_timesheet=false` (ATT gate down), evidence must note it — default remains **true**.

---

## 5. PROC storageKeys §55–58 — CONFIRMED allow-list

Source: DM §9 STT 55–58 · TechSpec §6.2 · team SRS §13.1 AC-PROC-05/06.

| STT | Danh mục (DM) | Canonical `storageKey` | Aliases (read try-list, storageKey-first) | MVP |
|-----|---------------|------------------------|-------------------------------------------|-----|
| 55 | Mã QT chỉnh sửa chấm công | **`hrm_attendance_correction_wf`** | `attendance_correction_workflow`, `wf_attendance_edit` | **in** |
| 56 | Mã QT nghỉ phép | **`hrm_leave_approval`** | `leave_workflow`, `wf_leave` | **in** |
| 57 | Mã QT duyệt mở rộng danh mục HRM | **`hrm_catalog_extension_wf`** | `catalog_extension_workflow`, `wf_hrm_catalog_extension` (prefix match OK on pull) | **in** |
| 58 | Mã QT duyệt thay đổi metadata NV | **`hrm_employee_metadata_wf`** | `employee_metadata_workflow`, `wf_metadata_change` | **in** |
| 59 | Nhóm quy trình | `hrm_workflow_groups` | — | **out_mvp** list filter |

**Bind rules:**

1. FE/BE read via `GET settings-catalogs` / catalog-sync **effective** for keys above — merge display-ready `{ code, name, catalog_key, status }`.
2. Empty after live GET → AC-PROC-03 + **AC-PROC-05** clickable CC deep-link (not hard `queryFn → []` forever).
3. **Cấm** HRM CRUD `company_processes`; **cấm** invent leave N-step ladder for PROC menu.
4. WF runtime codes (e.g. `hrm_leave_approval` 1-step L1) ≠ invent catalog rows — catalog empty is honest until XBOS publish + pull.

---

## 6. Validation matrix (data)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| DV-PAY-HIRE-01 | Enroll eligible NV | UPSERT payslip UQ `(period_id, employee_id)` status=`draft` | Row exists; GET payslips contains `employee_id` |
| DV-PAY-HIRE-02 | Enroll duplicate | ON CONFLICT update denorm; keep identity | Idempotent; no second row |
| DV-PAY-HIRE-03 | Process 0 slips + auto empty | Fail closed `HRM-PAY-ENROLL-REQUIRED` / `ENROLL-EMPTY` | **No** status-only success |
| DV-PAY-HIRE-04 | `require_closed_timesheet=true` · no closed sheet | Ineligible / 412 | `NO_CLOSED_SHEET` · `HRM-PAY-ATT-412` |
| DV-PAY-HIRE-05 | Closed period | Reject enroll/process | `HRM-PAY-003` / CLOSED |
| DV-PAY-HIRE-06 | Client sends `net_amount` as SoT | Reject / ignore as authority | BE owns amounts |
| DV-PAY-HIRE-07 | Hard FK employees migration | Not in GĐ1 | Soft UUID only |
| DV-PROC-01 | Catalog keys §55–58 all 0 | Empty list + deep-link | AC-PROC-05 |
| DV-PROC-02 | Pull has items | List length ≥ 1 from snapshot | AC-PROC-06 |

---

## 7. Traceability (requirement → DB → API → FE → test)

| BR/AC | API F-id | DB | FE | Test evidence when Dev done |
|-------|----------|-----|----|------------------------------|
| AC-PAY-HIRE-01 | F-PAY-HIRE-03/04/05 | `payroll_payslips` UQ | batches + payslip list | J-HRM-07b browser U65 |
| AC-PAY-HIRE-02 | enroll/process | — | no toast on throw | FE unit + browser |
| AC-PAY-HIRE-03 | close + guards | period status | lock UI | jest closed reject |
| AC-PAY-HIRE-04 | F-PAY-HIRE-03/05 | row persisted (UQ) | **FE sau 2xx** — list/period row cập nhật ngay; không chỉ API body | browser Diễn biến **#5** · U65 |
| AC-PAY-HIRE-05 | F-PAY-HIRE-05 | same UQ row | **F5 / navigate lại** — phiếu còn; detail đúng NV | browser Diễn biến **#6** · U65 |
| PAY-01 sheet | F-PAY-HIRE-02/04 | `attendance_sheets` closed | eligibility reasons | jest ATT-412 |
| AC-PROC-05/06 | F-PROC-BIND-01 | synced_catalogs / settings keys | `useProcesses` GET | PROC-BIND QA |
| OS 28 | process | amounts columns BE write | no FE net | solid_convention_ack |

**scope_parity:** list periods/payslips + get-by-id (if any) + enroll/process mutate = same `resolveHrmListScope` / `assertResourceInHrmScope`.

---

## 8. Forbidden (hard)

- Parallel **`batch_records`** (or any second membership SoT)  
- Hard FK `employee_id → employees` blocking GĐ1  
- DDL invent `pay_period_timesheet_bind` / rename to `pay_*` in Nest this wave  
- Seed payslip/NV for UAT evidence (U65)  
- Claim `payroll_e2e_ready=true`  
- Invent N-step leave approval ladder  

---

## Completion

- `evidence_path`: `docs/qa/evidence/po-hrm-e2e-link-pay-hire-db-01.md`
- `ack_status`: **PASS_TO_PM**
- `next_owner`: **pm** → parallel **dev-be** · **dev-fe** · **dev-fe PROC-BIND**
