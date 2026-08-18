# Evidence — PO-HRM-AMIS-PARITY-PAY-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-DATA-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-SA-01` PASS · `PO-HRM-AMIS-PARITY-BA-01` PASS |
| **extends** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` (do **not** duplicate formula engine DDL — **extend** with sheet-template + SRC storage) |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **honesty** | `payroll_e2e_ready=false` · **cấm** invent LIVE engine · **cấm** `apps/**` · U65 |
| **ack_status** | **PASS_TO_PM** |

---

## Mission

Physicalize AMIS-class **mẫu bảng lương** (`pay_sheet_template` + lines) + column order + per-template formula override + **SRC precedence storage** — vs live Nest (`salary_templates` pack ≠ mẫu). Unlock SA **F-PAY-SHEET-TPL-01** F.1 after this contract (COMP/EVAL stay on formula API wave).

---

## 0. read_first (ack)

| # | Artifact | Result |
|---|----------|--------|
| 1 | `po-hrm-amis-parity-sa-01.md` | Option **B** ADD `pay_sheet_template` · precedence Emp > Period > Template > Catalog · keep enroll `salary_templates` |
| 2 | `po-hrm-amis-parity-ba-01.md` | PAY Step3 **GAP** · BR-AMIS-PAY-SRC-01..05 · AC-AMIS-PAY-TPL-* |
| 3 | `po-hrm-payroll-formula-run-gap-data-01.md` | `pay_formula_definition` **PAPER** ADD-plan · `salary_components.formula` TEXT ≠ engine · templates PARTIAL pack |
| 4 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §3 | Spine bước 3–5 · priority nguồn · cấu trúc từ mẫu |
| 5 | Nest READ-ONLY `payroll.service` / `payroll-catalog.service` / C&B | Live DDL below — **no** edits |

**Status legend** (same as formula DATA-01)

| Status | Meaning |
|--------|---------|
| **PAPER** | ADD-plan only — no Nest `CREATE TABLE` / ensureSchema yet |
| **PARTIAL_LIVE** | Table/API exists; missing mẫu/override/SRC columns for AMIS GĐ1 |
| **LIVE** | Physical usable for stated purpose (≠ module UAT) |

---

## 1. AS-IS Nest (READ-ONLY) — pack ≠ mẫu

### 1.1 Live tables (relevant)

| Physical | Purpose today | AMIS mẫu? |
|----------|---------------|-----------|
| `salary_templates` | Hire/enroll **component pack** (`code`, `name`, `is_default`, `status`) | **No** — no OU/position applicability, no formula override, no period snapshot |
| `hrm_salary_template_components` | Pack lines: `component_id`, `default_value`, `is_required`, `sort_order` | **No** — amount default only; **no** `display_label` / override / formula ref |
| `salary_components` | Open-ish catalog (`code`, `nature`, `component_type`, `formula TEXT`, `default_value`, `is_active`) | Catalog OK direction; **`formula TEXT` ≠ engine** (G-PAY-F-07) |
| `payroll_periods` / `payroll_payslips` | Period + enroll header amounts | **No** `pay_sheet_template_id` / column snapshot / lines |
| `employee_compensation_packages` + `_lines` + `_history` | CORE C&B amounts | SRC tier **1** read-path PARTIAL — not wired to process |
| Period input packs (other income / advance) | — | **PAPER** / shallow APIs — SRC tier **2** storage absent as PAY input SoT |

**Live DDL facts (must_keep alias — do not rename blindly)**

```text
salary_templates:
  id, company_id, code, name, description, is_default, status, created_at, updated_at
  UQ (company_id, code)
  DELETE hard on remove (soft-delete GAP)

hrm_salary_template_components:
  id, template_id, company_id, component_id, default_value, is_required, sort_order, created_at, updated_at
  JOIN salary_components — pack membership only
```

### 1.2 Alias lock

| Logical (AMIS / SA) | Physical GĐ1 |
|---------------------|--------------|
| Enroll / hire component **pack** | `salary_templates` + `hrm_salary_template_components` — **keep** until BA merge/deprecate |
| **Mẫu bảng lương** (period sheet structure) | **ADD** `pay_sheet_templates` + `pay_sheet_template_lines` |
| Formula version SoT | **ADD** `pay_formula_definitions` (formula DATA-01 §2.1 — do not redefine here) |
| Component catalog | `salary_components` PARTIAL_LIVE |
| Emp salary history / fixed PC | `employee_compensation_*` PARTIAL_LIVE |
| Period / payslip | `payroll_periods` / `payroll_payslips` PARTIAL_LIVE |

**FORBIDDEN:** Deepen `salary_templates` alone into AMIS mẫu (SA Option A **rejected** — conflates hire pack with kỳ structure).

---

## 2. CONFIRMED ADD-plan — `pay_sheet_template` + line

> Nest plural naming recommended (`pay_sheet_templates` / `pay_sheet_template_lines`).  
> Logical SA name `pay_sheet_template_column` ≡ physical **`pay_sheet_template_lines`**.  
> **PAPER** until BE ensureSchema after SA F.1 unlock.

### 2.1 `pay_sheet_templates` (header)

| Column | Type | Null | Role |
|--------|------|------|------|
| `id` | uuid PK | NO | |
| `company_id` | text | NO | Tenant slug Plane B — same as payroll |
| `code` | text | NO | Stable template key per company |
| `name` | text | NO | Display name (VI UI) |
| `description` | text | YES | |
| `status` | text | NO | `draft` \| `active` \| `retired` (app SM — **no** `CHK IN` closed enum of business codes) |
| `is_default` | boolean | NO | Default mẫu per company (one default recommended) |
| `applicability_scope` | text | NO | `company` \| `ou` \| `position` \| `employee` (open string catalog — **no** `CHK IN (N)` of template codes) |
| `ou_id` | text/uuid | YES | Soft OU bind when scope=`ou` |
| `position_key` | text | YES | Soft position when scope=`position` |
| `employee_id` | uuid | YES | Soft employee when scope=`employee` |
| `archived_at` | timestamptz | YES | Soft-delete |
| `created_by` / `updated_by` | text | YES | Audit |
| `created_at` / `updated_at` | timestamptz | NO | |

| Constraint | Rule |
|------------|------|
| **UQ** | `(company_id, lower(code))` WHERE `archived_at IS NULL` (partial) **or** plain UQ + archive sets code suffix — SA picks; ba-data requires unique active code |
| **IX** | `(company_id, status)` partial active; `(company_id, is_default)` |
| **Open catalog** | **FORBIDDEN** `CHECK (code IN (...))` / reject N+1th template — same CORR pattern as HĐ |
| **Soft-delete** | Prefer `archived_at` — **do not** copy live pack `DELETE FROM salary_templates` pattern |

### 2.2 `pay_sheet_template_lines` (columns / thành phần trên mẫu)

| Column | Type | Null | Role |
|--------|------|------|------|
| `id` | uuid PK | NO | |
| `template_id` | uuid | NO | Soft FK → `pay_sheet_templates.id` |
| `company_id` | text | NO | Denormalized scope (parity with pack lines) |
| `component_id` | uuid | NO | Soft FK → `salary_components.id` |
| `component_code` | text | NO | Stable code snapshot for resolve (avoid orphan rename) |
| `display_label` | text | YES | Override cột label (AMIS display name); null → component `name` |
| `sort_order` | int | NO | Column order (GĐ1 form reorder OK; DnD canvas GĐ2 UI only) |
| `group_key` | text | YES | Optional group header key (open string) |
| `is_visible` | boolean | NO | Default true |
| `is_identity_or_total` | boolean | NO | Platform defaults (STT/họ tên/tổng) — not tenant formula |
| `formula_override_definition_id` | uuid | YES | Soft FK → `pay_formula_definitions.id` (**preferred** override SoT) |
| `formula_override_json` | jsonb | YES | Opaque local expression (**secondary** — see §3) |
| `archived_at` | timestamptz | YES | Soft-delete line |
| `created_at` / `updated_at` | timestamptz | NO | |

| Constraint | Rule |
|------------|------|
| **UQ** | `(template_id, component_id)` WHERE `archived_at IS NULL` — one column per component per mẫu |
| **IX** | `(template_id, sort_order)`; `(company_id, component_code)` |
| **FK style** | Soft FK (app assert) — no CASCADE wipe of formula versions |
| **Override presence** | If both override cols set → **definition_id wins**; both null → fall to SRC tier 4 |

### 2.3 Period bind / snapshot (EXPAND — not invent engine)

| Table | ADD / EXPAND | Purpose |
|-------|--------------|---------|
| `payroll_periods` | ADD nullable `pay_sheet_template_id` uuid | Which mẫu opened the kỳ |
| `payroll_periods` | ADD nullable `sheet_template_snapshot_json` jsonb | **Immutable** column set after process start / on create (SA §3.2) |
| `payroll_payslips` | optional later `sheet_template_id` | Audit only |
| **NEW** `payroll_payslip_lines` | cite formula DATA-01 | Engine output — **not** redefined here |

**Snapshot must include per column:** `component_code`, `display_label`, `sort_order`, resolved `formula_definition_id` (if any), `override_applied` boolean.

---

## 3. Override ↔ `pay_formula_definition` (storage choice LOCK)

**Cite:** BA Q2 · SA §3.2–3.3 · formula DATA-01 §2.1 · Q-PAY-FORMULA Option **A** ANSWERED.

### 3.1 Decision package

| Option | Storage | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **OV-A** | Only `formula_override_json` on line | Fast UX | Bypasses dual-control; duplicates engine SoT | **Reject** as sole process SoT |
| **OV-B** | Only soft FK `formula_override_definition_id` → versioned `pay_formula_definitions` | Aligns Option A; audit + publish | Requires formula CRUD before template override | **RECOMMEND primary** |
| **OV-C** | Dual columns: FK preferred + optional jsonb draft | GĐ1 author can stash draft AST before publish | Two-path discipline needed | **CONFIRMED GĐ1 physical** |

**Selected: OV-C (CONFIRMED ADD-plan)**

```text
Template line override resolve:
  IF formula_override_definition_id IS NOT NULL
    → load pay_formula_definitions row (prefer status=active for process;
       draft allowed for preview only)
  ELSE IF formula_override_json IS NOT NULL
    → use opaque AST for PREVIEW only
    → PROCESS / customer-ready run: FORBIDDEN until promoted to definition + publish
  ELSE
    → no template override (fall to SRC tier 4)
```

| Rule ID | Rule |
|---------|------|
| **VAL-PAY-TPL-OV-01** | Process with only `formula_override_json` (no published definition) → `HRM-PAY-FORMULA-412` / VI reason — no silent Nest % |
| **VAL-PAY-TPL-OV-02** | `formula_override_definition_id` must belong to same `company_id` scope (or holding rollup parity) |
| **VAL-PAY-TPL-OV-03** | Active definition immutable — change override = new formula version + re-bind line |
| **VAL-PAY-TPL-OV-04** | Component catalog `salary_components.formula` TEXT **never** read as override or default engine |

**Relation to component default (tier 4):** published `pay_formula_definitions` bound by `(company_id, code)` where `code` matches component formula key **or** separate `component_default_formula_id` on `salary_components` (EXPAND later — **HOLD** column invent this seat; resolver may map `component_code` → formula `code` convention until EXPAND).

---

## 4. SRC precedence — where stored (BR-AMIS-PAY-SRC)

**Resolve order (AMIS / SA / program §3) — must_keep:**

```text
1. Emp history / C&B fixed amount for component   — highest
2. Period input pack (other income / advance / tay) 
3. pay_sheet_template_line formula override
4. Component / published formula default           — lowest
```

| Tier | BR | Physical storage (GĐ1) | Status | Enforcement note |
|------|-----|------------------------|--------|------------------|
| **1** | SRC-02 | `employee_compensation_lines` (+ package effective dating / `_history`) matched by `allowance_code` / `component_code` / line type | **PARTIAL_LIVE** | Read-only at process; **no** FE invent; no copy long-term onto payslip except line amount snapshot |
| **2** | SRC-03 | **ADD-plan** `pay_period_input_lines` *(recommended name)*: `(period_id, employee_id, component_code, amount, source_kind, archived_at)` — packs for other-income / advance / manual | **PAPER** | Win when row exists for component typed period-variable; ignore → silent 0 = FAIL |
| **2b** | SRC-01 | Hour/OT/leave vars from **closed** `attendance_sheets` (+ future `att_timesheet_line`) — not emp history | Header **LIVE** / line **PAPER** | Q-PAY-F-3; open sheet → `HRM-PAY-ATT-412` |
| **3** | SRC-04 | `pay_sheet_template_lines.formula_override_*` (§2.2–§3) | **PAPER** | Wins catalog default when override present |
| **4** | SRC-05 | Published `pay_formula_definitions` (and/or component `default_value` for fixed-amount-only) | Formula **PAPER** · `default_value` **PARTIAL_LIVE** | Catalog TEXT formula **FORBIDDEN** |

**Where precedence is NOT stored:** no single “priority enum” column on component — **resolver algorithm** in BE process (document in F.1 PROCESS deepen). Optional audit on `payroll_payslip_lines.source_ref` / `source_tier` (`emp_cb` \| `period_input` \| `template_override` \| `formula_default`) when lines ADD (formula DATA-01).

**Period input table (minimal ADD-plan — do not invent LIVE APIs here)**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `company_id` | text | |
| `period_id` | uuid | Soft FK payroll_periods |
| `employee_id` | uuid | |
| `component_code` | text | Open catalog code |
| `amount` | numeric | |
| `source_kind` | text | `other_income` \| `advance` \| `manual` \| `rd_transfer` — **open string**, no CHK IN N |
| `note` | text | YES |
| `archived_at` | timestamptz | Soft-delete |
| UQ | `(period_id, employee_id, component_code, source_kind)` active | |

---

## 5. Entity status matrix — PAPER | PARTIAL_LIVE | LIVE

| Entity | Status | Gap vs AMIS mẫu / SRC |
|--------|--------|------------------------|
| `pay_sheet_templates` | **PAPER** | Blocks F-PAY-SHEET-TPL-01 |
| `pay_sheet_template_lines` | **PAPER** | Column order + override + label |
| Period `pay_sheet_template_id` + snapshot | **PAPER** | Lập bảng from mẫu |
| `pay_period_input_lines` | **PAPER** | SRC tier 2 |
| `pay_formula_definitions` | **PAPER** | Cite formula DATA-01 — not duplicated |
| `payroll_payslip_lines` | **PAPER** | Cite formula DATA-01 |
| `salary_templates` pack | **PARTIAL_LIVE** | ≠ mẫu; keep for hire/enroll |
| `hrm_salary_template_components` | **PARTIAL_LIVE** | default_value/sort only |
| `salary_components` | **PARTIAL_LIVE** | Open catalog OK; formula TEXT ≠ engine; deepen nature/type OK |
| `payroll_periods` / enroll payslips | **PARTIAL_LIVE** | Shell OK; no template bind |
| `employee_compensation_*` | **PARTIAL_LIVE** | SRC-1 storage exists; not process-wired |
| `attendance_sheets` closed | **LIVE** (header) | SRC-2b gate OK |
| `att_timesheet_line` | **PAPER** | Hour vars blocked |
| `pay_types` settings catalog | **LIVE** (REF) | component_type REF |

---

## 6. Soft-delete · tenant scope · open catalog

### 6.1 Soft-delete

| Entity | Target | Anti-pattern |
|--------|--------|--------------|
| `pay_sheet_templates` / `_lines` | `archived_at` | Live pack **hard DELETE** on `salary_templates` — **do not** copy |
| Formula versions | `archived_at` + status `retired` (DATA-01) | In-place wipe active expression |
| Period input lines | `archived_at` | Hard delete pack rows mid-process |
| Components | Keep `is_active` (live) + optional later `archived_at` | `DELETE FROM salary_components` as retire |

### 6.2 Tenant / scope_parity (U19)

| Surface | Rule |
|---------|------|
| List/get template | Same `resolveHrmListScope` as `listSalaryTemplates` / periods |
| Persist | `resolveHrmPersistCompanyIdText` |
| Get-by-id | **Same** company filter expand as list — else `scope_parity` P0 |
| Override formula id | Must resolve under same company / rollup as template |
| Group CEO `main` | Rollup must return template ids that get-by-id can open |

### 6.3 Open catalog (no CHK IN N)

| Rule | Detail |
|------|--------|
| Template `code` | Tenant-defined; starter rows bootstrap only |
| `applicability_scope` / `source_kind` / `group_key` | Open strings + app validation — **FORBIDDEN** DB `CHECK (... IN (fixed N))` for business codes |
| Component bind | Must exist in `salary_components` for company (soft assert) — not FE hardcode card list |
| Align | AC-PLT-PAY-01 picker · CORR HĐ open-catalog lesson |

---

## 7. Validation matrix (deterministic)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-PAY-TPL-01 | Create template without `company_id` / code | 400 |
| VAL-PAY-TPL-02 | Duplicate active `(company_id, code)` | 409 |
| VAL-PAY-TPL-03 | Line `component_id` not in company catalog | 404/422 |
| VAL-PAY-TPL-04 | Two active lines same `component_id` on one template | 409 |
| VAL-PAY-TPL-05 | Process period without template snapshot when policy require-mẫu | 412 VI |
| VAL-PAY-TPL-OV-01..04 | §3 | Formula-412 / scope deny |
| VAL-PAY-SRC-01 | Emp C&B amount present + no period input → line uses tier 1 | Amount = C&B; `source_tier=emp_cb` |
| VAL-PAY-SRC-02 | Period input row present → wins over template/catalog | `source_tier=period_input` |
| VAL-PAY-SRC-03 | Template override published → wins catalog default | Evaluate override definition |
| VAL-PAY-SRC-04 | Open timesheet when require closed | `HRM-PAY-ATT-412` |
| VAL-PAY-SRC-05 | FE posts computed net / override amount as SoT | Reject OS28 |

---

## 8. Traceability (short)

| Requirement | Spec / BR | Physical | Test intent |
|-------------|-----------|----------|-------------|
| AMIS Step3 mẫu + override | Program §3 · BA §2.3 · SA Option B | `pay_sheet_templates*` PAPER | AC-AMIS-PAY-TPL-01/02 |
| Column order | SA GĐ1 form reorder | `sort_order` | Reorder → F5 persist |
| SRC priority | BR-AMIS-PAY-SRC-01..05 | §4 storage map | AC-AMIS-PAY-SRC-01 |
| Formula Option A | ADR §10 · DATA-01 | `formula_override_definition_id` | Dual-control publish then bind |
| Hire pack separate | SA reject Option A deepen | Keep `salary_templates` | Regression hire→pay enroll |
| F-PAY-SHEET-TPL-01 | API next | This contract | SA F.1 |

**J-* / UF:** Period create-from-template + process lines → extend J-HRM-07 / UF-HRM-06 after product; research seat does **not** flip matrix.

---

## 9. Gaps blocking F-PAY-SHEET-TPL API F.1

| ID | Gap | Blocks |
|----|-----|--------|
| **G-PAY-TPL-01** | No `pay_sheet_templates` table | CRUD/list template |
| **G-PAY-TPL-02** | No template lines (label/order/override) | Column designer / bind |
| **G-PAY-TPL-03** | No period `pay_sheet_template_id` + snapshot | Lập bảng from mẫu |
| **G-PAY-TPL-04** | Override storage undecided before this seat | Closed here as OV-C |
| **G-PAY-TPL-05** | Conflate pack `salary_templates` with mẫu | Spec must keep Option B split |
| **G-PAY-TPL-06** | SRC tier 2 input lines PAPER | Full AMIS Step4 — stage after TPL CRUD OK |
| **G-PAY-F-*** | Formula definition PAPER | Override FK useless until formula DATA→API wave |

**Minimum unlock SA F.1 TPL:** §§2–3 CONFIRMED + alias vs pack + soft-delete/scope/open-catalog notes.  
**Staged:** TPL CRUD/list before period snapshot; PROCESS deepen after formula EVAL + SRC resolver.

---

## 10. Non-claims / FORBIDDEN

| Claim / action | Status |
|----------------|--------|
| Invent LIVE evaluator / Nest tenant % | **FORBIDDEN** |
| Edit `apps/**` / migrations this seat | **FORBIDDEN** |
| `payroll_e2e_ready=true` / parity DONE / Phase1 DONE | **FORBIDDEN** |
| Treat `salary_templates` as mẫu SoT | **FORBIDDEN** |
| Treat `salary_components.formula` TEXT as engine | **FORBIDDEN** |
| Mega-EAV one table for all HR templates | **FORBIDDEN** |
| GĐ1 formula DnD DDL | **FORBIDDEN** (R-PAY-DD-01) |
| Redefine full `pay_formula_definition` columns | Cite DATA-01 — **extend only** |

---

## completion_report

### Closed

1. **ADD-plan DDL** `pay_sheet_templates` + `pay_sheet_template_lines` (`component_id`, `display_label`, `sort_order`, override cols) — Option B separate from enroll pack.  
2. **Override storage OV-C LOCK:** preferred `formula_override_definition_id` → `pay_formula_definitions`; optional `formula_override_json` preview-only; process requires published definition.  
3. **SRC precedence storage map** tiers 1–4 + recommended `pay_period_input_lines` PAPER + closed-sheet hour vars.  
4. **PAPER | PARTIAL_LIVE | LIVE** matrix vs `salary_templates` / `salary_components` / periods / C&B.  
5. Soft-delete · scope_parity · **open catalog no CHK IN N**.  
6. Extends formula DATA-01 without duplicate engine invent; `payroll_e2e_ready=false`.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-TPL-API | F-PAY-SHEET-TPL-01 F.1 (CRUD/list/lines · scope_parity · errors) | **sa** |
| R-PAY-F-API | F-PAY-FORMULA COMP/AUTHOR/PUBLISH/EVAL (peer wave) | **sa** |
| R-PAY-TPL-BE | ensureSchema ADD templates/lines + period snapshot cols | **dev-be** after SA |
| R-PAY-SRC-2 | Physicalize input packs APIs after TPL | ba-data/sa later |
| R-PAY-ATT-LINE | `att_timesheet_line` for hour vars | ATT lane |
| Product UAT | Browser mẫu→kỳ→lines | qa→qc — deny ready flip |

### Explicit non-claims

- No LIVE pay sheet template / override engine.  
- No apps/** changes.  
- Research physical intent ≠ UAT.

---

## next_owner

**pm** → dispatch **sa** (`F-PAY-SHEET-TPL-01` F.1); COMP/EVAL remain on formula API wave (may parallel after formula DATA CONFIRMED).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-API-01
from_role: pm
to_role: sa
lane: governance
priority: P0
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
depends_on: PO-HRM-AMIS-PARITY-PAY-DATA-01 PASS

## Mission
Unlock API_DESIGN F.1 for F-PAY-SHEET-TPL-01 (and deepen PROCESS bind notes) using ba-data physical contract.
Map DTO↔columns for pay_sheet_templates / pay_sheet_template_lines; alias lock vs salary_templates enroll pack;
document override OV-C (formula_override_definition_id preferred; formula_override_json preview-only);
SRC precedence as resolver (not a DB enum); scope_parity list↔get; soft-delete archived_at; open catalog no CHK IN N.

COMP / EVAL / AUTHOR / PUBLISH stay on F-PAY-FORMULA-* wave (cite po-hrm-payroll-formula-run-gap-data-01 + SA formula seat) — do not invent evaluator here.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md
2. docs/qa/evidence/po-hrm-amis-parity-sa-01.md §3.2–3.3 · §6
3. docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md
4. docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md (PAY HOLD pointers)
5. ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md Option B · Q-PAY-FORMULA Option A ANSWERED

## Deliverable
docs/qa/evidence/po-hrm-amis-parity-pay-tpl-api-01.md
- F.1 table: METHOD/path · Mục đích · Nghiệp vụ · Tham chiếu bước SRS · DTO↔cột · lỗi (412 formula/att, 409 duplicate, scope)
- Period create-from-template snapshot contract
- next_dispatch_prompt for PO-HRM-AMIS-PARITY-PAY-TPL-BE-01 (ensureSchema only) after F.1 PASS
- Explicit: payroll_e2e_ready=false · Dev HOLD until DATA+API · cấm apps/** · cấm LIVE engine invent

## Exit
PASS_TO_PM · F-PAY-SHEET-TPL-01 F.1 outlines CONFIRMED · no apps/** · no payroll_e2e_ready flip
```

**Parallel (if formula F.1 not yet unlocked):**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01
from_role: pm
to_role: sa
lane: governance
priority: P0
## Mission
Continue F-PAY-FORMULA-* / F-PAY-COMP-CATALOG-01 F.1 from formula DATA-01 — required before template override process SoT (OV-C definition_id).
## Exit
PASS_TO_PM · cite po-hrm-payroll-formula-run-gap-data-01.md · payroll_e2e_ready=false
```

---

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md`

## ack_status

**PASS_TO_PM**
