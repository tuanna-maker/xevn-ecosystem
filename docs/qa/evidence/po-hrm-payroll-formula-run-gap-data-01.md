# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **honesty** | `payroll_e2e_ready=false` · cấm invent LIVE formula engine · cấm `apps/**` |
| **ack_status** | `PASS_TO_PM` |

---

## Mission

Physical data contract gap: paper `pay_*` / Q-PAY-FORMULA vs **live Nest HRM** (`ensureSchema` / catalogs). Unlock path for customer-configurable formulas **without code deploy** — without inventing a runtime engine in this seat.

## read_first (ack)

| # | Artifact | Result |
|---|----------|--------|
| 1 | Program `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md` | W0 DATA seat; GĐ1 form + dual-control; `payroll_e2e_ready=false` |
| 2 | `DB_DESIGN_HRM_ENTERPRISE.md` §5 (v0.3.0-DRAFT) | Logical `pay_formula_definition` · period · payslip · lines · bind |
| 3 | `po-hrm-bp-synth-pay-db-01.md` | P1–P6 logical CLOSED; expression opaque HOLD |
| 4 | `DECISION_PACKET_Q_PAY_FORMULA.md` + ADR §10 | Option A dual-control; paper **ANSWERED** / SRS Đã chốt; `expression_json` opaque |
| 5 | Nest READ-ONLY: `payroll.service` · `payroll-catalog.service` · ATT sheet bootstrap · `employee-compensation.service` | Live periods/payslips/components; **no** `pay_formula_*` |
| 6 | `PO-HRM-E2E-LINK-PAY-HIRE-DB-01` | AS-IS enroll = `payroll_payslips` draft; no bind DDL GĐ1 |

**Status legend**

| Status | Meaning |
|--------|---------|
| **PAPER** | Only client DB_DESIGN / ADR — **no** Nest `CREATE TABLE` / ensureSchema |
| **PARTIAL_LIVE** | Table/API exists; missing dual-control / version / line / formula bind columns for customer-ready GĐ1 |
| **LIVE** | Physical columns usable for stated purpose (≠ UAT module ready) |

---

## 1. Entity list — PAPER | PARTIAL_LIVE | LIVE

| Entity (logical / ask) | Paper SoT | Live physical | Status | Gap summary |
|------------------------|-----------|---------------|--------|-------------|
| **`pay_formula_definition`** | DB §5.3 · ADR §10 | **Absent** — no table / ensureSchema | **PAPER** | Blocks F-PAY-FORMULA-* entirely |
| **Formula versions** | `version` + UQ `(company_id, code, version)` on same table | Absent | **PAPER** | No immutable published snapshot |
| **`salary_components`** | Platform PAY catalog + payslip `component_code` | `public.salary_components` (+ categories) via `PayrollCatalogService.ensureSalaryComponentSchema` | **PARTIAL_LIVE** | Has `formula TEXT` (free string) — **≠** versioned `expression_json` / dual-control; no publish SM |
| **`pay_types`** | Catalog key for `component_type` | Settings catalog `pay_types` (assert on create/patch) — not PAY DDL | **LIVE** (catalog) | OK as REF for component_type; not formula engine |
| **Period** | Logical `pay_payroll_period` | `public.payroll_periods` | **PARTIAL_LIVE** | No `formula_definition_id`; SM `draft\|processed\|closed` ≠ paper `open\|processing\|closed\|cancelled`; labels `period_label`/`start_date`/`end_date` |
| **Enrollment** | Payslip membership / hire→pay | `payroll_payslips` UQ `(period_id, employee_id)` status `draft` | **PARTIAL_LIVE** | AS-IS enroll OK (prior DATA); no formula/timesheet FK on row |
| **`payslip_line`** | `pay_payslip_line` §5.7 | **Absent** — only header `gross_amount` / `deduction_amount` / `net_amount` | **PAPER** | Cannot explain component lines from engine |
| **Timesheet bind** | `pay_period_timesheet_bind` §5.2 | **No table** — service EXISTS on `attendance_sheets.status=closed` | **PARTIAL_LIVE** (service-only) | Prior HIRE-DB: invent bind DDL GĐ1 FORBIDDEN until sponsor; formula vars still need **line** SoT |
| **`att_timesheet_line`** | §4.6 payable/OT/leave hours | **ABSENT AS-IS** (DOC-DELTA ADD-plan) | **PAPER** | Q-PAY-F-3 variables **blocked** at line grain |
| **`attendance_sheets`** | Alias `att_timesheet_header` | Header LIVE (`closed_at`/`closed_by`) | **LIVE** (header) | Close gate OK; not variable bag |
| **CORE C&B** | `hrm_employee_compensation` logical | `employee_compensation_packages` + `_lines` + `_history` | **PARTIAL_LIVE** | Usable read-path for base/allowance; not wired to PAY process formula |
| **`salary_templates`** | Template pack of components | `salary_templates` + `hrm_salary_template_components` | **PARTIAL_LIVE** | Pack/defaults only — **not** dual-control formula definition |
| Split / settlement / rate CFG / payroll group | §5.4–5.5, 5.8–5.10 | Absent in Nest payroll ensureSchema | **PAPER** | Out of formula author critical path; note for later waves |

**Alias lock (must_keep — do not rename prod blindly)**

| Logical (Enterprise) | Physical GĐ1 AS-IS |
|----------------------|--------------------|
| `pay_payroll_period` | `payroll_periods` |
| `pay_payslip` | `payroll_payslips` |
| `pay_formula_definition` | **(none)** → ADD plan |
| `pay_payslip_line` | **(none)** → ADD plan |
| `att_timesheet_header` | `attendance_sheets` |
| `att_timesheet_line` | **(none)** → ADD plan (ATT AGG) |
| C&B compensation | `employee_compensation_*` |

---

## 2. Required columns — dual-control author/publish + effective dating

> Paper §5.3 + ADR §10 Option A + Decision Packet (soạn → phát hành).  
> **ADD-plan** physical name: recommend **`pay_formula_definitions`** (Nest plural convention) **or** keep logical `pay_formula_definition` with alias in API — SA picks one name in F.1; ba-data locks **columns**.

### 2.1 `pay_formula_definition` — CONFIRMED ADD-plan (not LIVE)

| Column | Type | Null | Dual-control / dating role |
|--------|------|------|----------------------------|
| `id` | uuid PK | NO | |
| `company_id` | text | NO | Tenant/OU scope (slug Plane B) |
| `code` | text | NO | Stable formula key per company |
| `version` | int | NO | Monotonic per `(company_id, code)` — **immutable after publish** |
| `status` | text | NO | `draft` → `pending_publish` → `active` → `retired` |
| `expression_json` | jsonb | YES | **Opaque** AST/form payload — **cấm** invent inner schema this seat |
| `required_vars_json` | jsonb | YES | Declared vars (ATT closed + CORE C&B keys) — DV-18 gate |
| `authored_by` | uuid/text | YES | C&B author (≠ publisher) |
| `authored_at` | timestamptz | YES | Draft audit |
| `published_by` | uuid/text | YES | Technical publisher — **must ≠ authored_by** when dual-control policy on |
| `published_at` | timestamptz | YES | Publish stamp |
| `effective_from` | date | YES | Legal-entity dating |
| `effective_to` | date | YES | Open-ended null OK |
| `archived_at` | timestamptz | YES | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | Audit |

| Constraint | Rule |
|------------|------|
| **UQ** | `(company_id, code, version)` |
| **IX** | `(company_id, code, status)` partial `archived_at IS NULL`; `(company_id, effective_from)` |
| **Publish** | Only `pending_publish` → `active`; block if `required_vars_json` missing keys (DV-18) |
| **Immutability** | `active` row: **no** in-place edit of `expression_json` — new `version` |
| **Period bind** | Period may store `formula_definition_id` → **active** version only |
| **FORBIDDEN** | Hardcode tenant coefficients in Nest process path; self-publish if policy dual; drag-drop DDL GĐ2 |

### 2.2 Period / payslip EXPAND (when formula run binds)

| Table | ADD / EXPAND | Purpose |
|-------|--------------|---------|
| `payroll_periods` | ADD nullable `formula_definition_id` uuid | Freeze formula version for kỳ |
| `payroll_payslips` | ADD nullable `formula_definition_id` (+ optional `timesheet_sheet_id` later) | Audit which version calculated row |
| **NEW** `payroll_payslip_lines` (alias `pay_payslip_line`) | ADD | `component_code`, `amount`, `source_ref`, `sort_order` — engine output |

**Not this seat:** invent evaluator code; invent `expression_json` node taxonomy.

### 2.3 Do **not** treat as formula engine

| Live artifact | Why insufficient |
|---------------|------------------|
| `salary_components.formula` TEXT | Unversioned free-text; no author/publish SM; no effective dating; no dual-control |
| `salary_templates` | Component pack defaults — not PAY-02 engine |
| Process stub amounts `0` / `calc_mode` ephemeral | Honesty for hire enroll — not configurable formula |

---

## 3. Variable ownership — closed attendance vs CORE C&B

**Invariant (Q-PAY-F-3 · DATA_OWNERSHIP · ADR I-3):** PAY formula variables for **hours / OT / paid|unpaid leave** come **only** from **closed timesheet** grain — **never** live from `leave_requests` / OT requests / punches.

| Variable class (required_vars key intent) | Owner pillar | Physical SoT (paper) | Live today | Ownership rule |
|-------------------------------------------|--------------|----------------------|------------|----------------|
| `payable_hours` / `standard_hours` | ATT | `att_timesheet_line.*` | **PAPER** (line ABSENT) | PAY **read-only** after `attendance_sheets.status=closed` |
| `ot_hours_weighted` | ATT | line OT đã × hệ số | **PAPER** | Same; no PAY re-weight |
| `paid_leave_hours` / `unpaid_leave_hours` | ATT | line (leave funnel → sheet) | **PAPER** / funnel soft FK on records only | PAY must not FK leave_request |
| Sheet period identity | ATT | `attendance_sheets.start_date/end_date` + `closed_at` | **LIVE** | Eligibility EXISTS closed for period month |
| `base_salary` / allowance amounts | CORE C&B | `employee_compensation_lines` (`base` / `allowance` + `allowance_code`) | **PARTIAL_LIVE** | PAY read package effective for period cutoff; **no** copy C&B columns onto payslip long-term (snapshot amounts OK on lines) |
| Dependents / GTCG inputs | CORE | dependents / C&B ring | PARTIAL (elsewhere) | Static once on payslip header (BR-BP-SPL) |
| SI rates / ceiling | PAY CFG paper `pay_insurance_rate_cfg` | **PAPER** | Live may use other insurance paths — **not** formula author SoT |
| `component_code` catalog | PAY + Settings | `salary_components.code` + `pay_types` | **PARTIAL_LIVE** | Lines reference code; formula maps to components — **not** FE net |
| Reward/discipline money | CORE → PAY link | soft RD + optional `pay_reward_link` | **PAPER** link table | Process may soft-read later; not author vars GĐ1 must |

**FK / ownership matrix (fail-closed)**

| From | To | Allowed? |
|------|-----|----------|
| `pay_formula_definition` | — | Standalone CFG; no ATT/CORE FK required |
| Period / payslip | `pay_formula_definition.id` | Soft FK yes (app assert `active`) |
| Payslip / process | `attendance_sheets` closed | Soft / service assert — hard FK optional later |
| Payslip | `leave_requests` / OT / punch | **FORBIDDEN** |
| Payslip | `candidates` / REC | **FORBIDDEN** |
| Formula vars | `employee_compensation_*` | Read-only soft; version by `effective_from` |
| `salary_components.formula` TEXT | Runtime engine | **FORBIDDEN** as SoT after ADD `pay_formula_definition` |

---

## 4. Gaps blocking F-PAY-FORMULA API F.1

API_DESIGN today: **`F-PAY-FORMULA-*` HOLD authoring** (pointer only). Physical blockers for unlock:

| ID | Gap | Blocks F.1 |
|----|-----|------------|
| **G-PAY-F-01** | No `pay_formula_definition` table | AUTHOR / GET / list / version |
| **G-PAY-F-02** | No dual-control columns (`authored_by` ≠ `published_by`, status SM) | PUBLISH + AuthZ deny self-publish |
| **G-PAY-F-03** | No `expression_json` / `required_vars_json` storage | PREVIEW / EVAL input contract |
| **G-PAY-F-04** | No period/payslip `formula_definition_id` | PROCESS bind + `HRM-PAY-FORMULA-412` |
| **G-PAY-F-05** | No `payroll_payslip_lines` | Response “giải thích dòng”; ESS line item |
| **G-PAY-F-06** | `att_timesheet_line` ABSENT | Q-PAY-F-3 required_vars for hours — preview/eval fail-closed or dishonest |
| **G-PAY-F-07** | Live `salary_components.formula` TEXT can be mistaken for engine | Spec must **deprecate** as SoT; F.1 must not CRUD that column as versioned formula |
| **G-PAY-F-08** | Soft-delete: periods/payslips lack `archived_at`; components use `is_active` only | List/detail parity + retire semantics for formula rows |
| **G-PAY-F-09** | Platform Option B PAY vertical not shipped | Catalog/FormSchema for formula **form** GĐ1 still unbound (MergeToken CTR ≠ PAY) |

**Minimum to unlock SA F.1 drafts (still no Dev until SA+program unlock):**

1. CONFIRMED ADD `pay_formula_definition` columns §2.1 (`expression_json` opaque).  
2. Document alias map Nest names.  
3. Explicit **REJECT** using `salary_components.formula` as F-PAY-FORMULA SoT.  
4. Note dependency: hours vars → ATT line ADD (may stage: formula CFG CRUD before eval-with-hours).

**Staged honesty:** F.1 AUTHOR/PUBLISH/LIST can ship before ATT line AGG; F.1 EVAL/PROCESS with real hours **BLOCKED** until line SoT or explicit stub preview flag (must not claim customer-ready run).

---

## 5. Indexes / soft-delete / tenant scope parity

### 5.1 Indexes (ADD-plan + live)

| Object | Live today | Required for formula/run |
|--------|------------|--------------------------|
| `uq_payroll_period_company_date_range` | YES | keep |
| `uq_payroll_payslip_period_employee` | YES | keep (enroll) |
| `uq_salary_components_company_code` | YES `(company_id, lower(code))` | keep |
| `idx_salary_components_company_component_type` | YES | keep |
| Formula UQ `(company_id, code, version)` | NO | **ADD** |
| Formula IX active-by-company | NO | **ADD** |
| Payslip lines `(payslip_id, component_code)` | NO | **ADD** with lines table |
| Comp packages `(company_id, employee_id, effective_from DESC)` | YES | keep — C&B var resolve |

### 5.2 Soft-delete

| Entity | Live | Paper / target |
|--------|------|----------------|
| `pay_formula_definition` | n/a | `archived_at` + status `retired` |
| `salary_components` | `is_active` boolean | Prefer keep `is_active`; optional later `archived_at` — do not hard DELETE |
| `payroll_periods` / `payroll_payslips` | No `archived_at` | Soft archive **gap**; hard DELETE CASCADE period→payslips exists — **must_keep** caution; formula wave should not add hard delete of formula versions |
| Employees eligibility | `archived_at IS NULL` filter | LIVE |

### 5.3 Tenant / scope parity (U19)

| Surface | Live behavior | Note |
|---------|---------------|------|
| List/get periods & payslips | `resolveHrmListScope` + company filter expand | **must_keep** same resolver for future formula list/get-by-id |
| Salary components list/get | Same scope helpers | Parity OK pattern to copy |
| Formula ADD | Must use **same** `company_id` TEXT slug semantics as periods | Group CEO `main` rollup = same as payroll list |
| ATT closed check | `expandPayrollAttendanceSheetCompanyIds` | Formula eval must reuse — not a second scope dialect |
| C&B packages | Indexed by `company_id` + employee | Read under same persist company id |

**Defect class if ignored:** list returns formula id under `main` rollup → get-by-id 404 = `scope_parity` P0.

---

## 6. Validation hints (for SA / QA later)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-PAY-F-01 | Publish when `authored_by = published_by` and dual-control on | 403 / deny |
| VAL-PAY-F-02 | Edit `expression_json` on `active` in place | Reject → new version |
| VAL-PAY-F-03 | Activate without required ATT/C&B vars declared | DV-18 block |
| VAL-PAY-F-04 | Process period with no `active` formula bind | `HRM-PAY-FORMULA-412` (no silent hardcode) |
| VAL-PAY-F-05 | Process with open sheet when require_closed | `HRM-PAY-ATT-412` / `NO_CLOSED_SHEET` |
| VAL-PAY-F-06 | Payslip line FK to leave_request | Schema review FAIL |
| VAL-PAY-F-07 | FE posts net / computes formula | Reject / OS28 — BE-only |

---

## 7. Traceability (short)

| Requirement | Paper | Live | Test intent |
|-------------|-------|------|-------------|
| FR-UC-BP-PAY-02 · Q-PAY-FORMULA | §5.3 + ADR §10 | **PAPER** | Dual-control publish TC after ensureSchema |
| FR-UC-BP-PAY-06 enroll | HIRE-DB AS-IS | **PARTIAL_LIVE** | J-HRM-07b — separate from formula |
| Q-PAY-F-3 hours from closed sheet | §4.6 lines | Header LIVE / lines PAPER | Block eval UAT until lines |
| Platform PAY catalog | ADR dynamic config | `salary_components` PARTIAL | Picker ≠ engine |
| F-PAY-FORMULA-* | API HOLD | — | SA unlock after this DATA |

---

## completion_report

### Closed

1. Entity status matrix: formula definition/versions + payslip_line = **PAPER**; components/period/enroll/templates = **PARTIAL_LIVE**; `pay_types` catalog + sheet header = **LIVE**.  
2. Dual-control + effective-dating **column contract** for ADD-plan `pay_formula_definition` (`expression_json` **opaque**).  
3. Variable ownership FK matrix: ATT closed lines vs CORE `employee_compensation_*`; FORBIDDEN leave/OT/punch/REC.  
4. Gap list **G-PAY-F-01..09** blocking F-PAY-FORMULA F.1.  
5. Indexes / soft-delete / scope_parity notes for Nest AS-IS aliases.  
6. Explicit **non-claim**: no LIVE formula engine; `salary_components.formula` TEXT ≠ SoT; `payroll_e2e_ready=false`.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-F-SA-F1 | Unlock F-PAY-FORMULA AUTHOR/PUBLISH/LIST F.1 + error codes from §4–§6 | **sa** |
| R-PAY-F-BE-DDL | ensureSchema ADD formula table + optional period/payslip FK cols (after SA) | **dev-be** |
| R-PAY-F-ATT-LINE | `att_timesheet_line` ADD for hours vars (ATT AGG / funnel staged B) | ba-data/ATT lane + **dev-be** |
| R-PAY-F-LINES | `payroll_payslip_lines` ADD with process write | **dev-be** after F.1 |
| R-PAY-F-DEPRECATE-SC-FORMULA | DOC + API: stop treating `salary_components.formula` as engine | sa + ba-docs |
| Product UAT | Browser formula + lập bảng | qa→qc — **deny** invent `payroll_e2e_ready` |

### Explicit non-claims

- Did **not** edit `apps/**` / migrations.  
- Did **not** invent expression AST / drag-drop DDL / LIVE evaluator.  
- Did **not** set `payroll_e2e_ready=true`.  
- Paper Q-PAY-FORMULA **ANSWERED** ≠ physical LIVE ≠ module UAT.

---

## next_owner

**pm** → dispatch **sa** (API F.1) then **dev-be** ensureSchema (after SA unlock)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01

## Mission
Unlock path for F-PAY-FORMULA-* API F.1 (AUTHOR / PUBLISH / LIST / PREVIEW stub) using ba-data physical contract. Align API_DESIGN HOLD → DRAFT F.1 outlines; map Nest aliases (payroll_periods / payroll_payslips / salary_components ≠ engine). Keep expression_json opaque; Option A dual-control; deprecate salary_components.formula as SoT. Platform PAY vertical bind AC only — no MergeToken invent.

## read_first
1. docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md
2. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §5.3 · §5.7
3. docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-PAY-FORMULA-* HOLD
4. ADR-HRM-4-PILLAR-API-BOUNDARY.md §10 · DECISION_PACKET_Q_PAY_FORMULA.md
5. docs/program/PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md

## Exit
- evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md · PASS_TO_PM
- F.1 table: METHOD/path · mục đích · bước SRS · DTO↔columns · errors (FORMULA-412, dual-control deny)
- Staged note: EVAL-with-hours BLOCKED until att_timesheet_line
- next_dispatch_prompt copy-ready for PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01 (ensureSchema only)
- cấm: apps/** · invent LIVE engine · claim payroll_e2e_ready · OpenAPI “đầy đủ designer GĐ2”
```

**Follow-on (after SA PASS — PM copy when unlocking execution):**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0

## Mission
ensureSchema ADD pay_formula_definition (columns per DATA-01 §2.1) + soft indexes; optional nullable formula_definition_id on payroll_periods/payslips. Jest lifecycle draft→pending_publish→active; dual-control deny; no evaluator invent; no salary_components.formula as engine. U65 no seed.

## read_first
docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md · SA evidence F.1 · Nest payroll.service ensureSchema pattern

## Exit
READY_FOR_QA evidence; payroll_e2e_ready remains false; cấm FE net; cấm hardcode tenant coefficients
```

---

## evidence_path

`docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md`

## ack_status

`PASS_TO_PM`
