# DB_DESIGN — HRM Payroll periods + payslips

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-PAYROLL-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.6 FR-HRM-PR-05** Diễn biến #1–#8 · **§3.15 FR-HRM-PR-01** · **§3.16 FR-HRM-PR-03** · **§3.17 FR-HRM-PR-04** · **§3.35 FR-HRM-INT-03** · team `docs/hrm/SRS.md` **UC-HRM-24** / **UC-HRM-28** / **UC-HRM-31** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.6** FR-PR-05 · **§16.1** PR-01/03/04 · **§17.1** payroll rows · INT-03 soft emp · hard period |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_PAYROLL.md` |
| **ref_align** | Soft employee hub `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` · Plane B TEXT slug (CO-HC / Leave / CI must_keep) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on Payroll periods / payslips |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `PayrollService.ensureSchema` (`CREATE TABLE IF NOT EXISTS` + indexes) |

> **must_keep:** `company_id` = **TEXT operating slug** (Plane B) — **not** XBOS LE UUID. Soft `employee_id` (no DB `REFERENCES employees` — G-DB-02). Hard `period_id` → `payroll_periods`. U65: empty payslip list = honest empty (no seed). Do **not** touch employees / CI / leave / recruitment physical pairs.

> **Out of scope this slice:** `advance_requests*` · salary-templates / components catalog (G-DB-05 / annex) — cite only; separate U71 if sponsor opens.

---

## E2 APPEND — PAY-CLEAN nature + unique (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E2-DB-API-01` |
| **Slice SoT** | **`docs/hrm/DB_DESIGN_HRM_ERP_E2.md`** (normative for `salary_components.component_type` → `pay_types.code`, unique `(company_id, code)`, mock-removal contract) |
| **API sibling** | `docs/hrm/API_DESIGN_HRM_ERP_E2.md` |
| **change_mode** | ADD pointer only — **no** wipe periods/payslips · **no** migration in BA WI |

**Supersedes for E2 scope:** annex «components catalog cite only» → physical TX + soft-assert SoT lives in E2 slice. §1–§7 periods/payslips remain baseline must_keep.

---

## 1. Table SoT — `public.payroll_periods`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`payroll_periods`** |
| Owner service | HRM (`hrm-api` · `PayrollService`) |
| Consumers | Embed UC-HRM-24 · App UC-HRM-31 · process/close · payslip JOIN · ops summary counts |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa kỳ lương | FR-HRM-PR-01 #9 khóa mang |
| **`company_id`** | **TEXT NOT NULL** | NO | Đơn vị vận hành (slug ladder) | PR-01 #6 · SCOPE |
| `period_label` | TEXT NOT NULL | NO | Tên / nhãn kỳ hiển thị | PR-01 #2/#7 |
| `start_date` | DATE NOT NULL | NO | Từ ngày | PR-01 #4 |
| `end_date` | DATE NOT NULL | NO | Đến ngày | PR-01 #4 |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | `draft` \| `processed` \| `closed` | PR-01/03/04 lifecycle |
| `created_by` | TEXT | YES | Người tạo (display / id string) | PR-01 audit |
| `processed_at` | TIMESTAMPTZ | YES | Thời điểm tính lương | PR-03 #6/#9 |
| `closed_at` | TIMESTAMPTZ | YES | Thời điểm chốt kỳ | PR-04 |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `chk_payroll_status` (`draft` \| `processed` \| `closed`) | PR lifecycle |
| `chk_payroll_date_range` (`start_date <= end_date`) | PR-01 #4 → `HRM-PAY-001` |
| `uq_payroll_period_company_date_range` UNIQUE `(company_id, start_date, end_date)` | Anti exact-range duplicate |
| App overlap check | `daterange(start,end,'[]') &&` same `company_id` → **`HRM-PAY-002`** (PR-01 #5) |
| List index (recommended) | `(company_id, start_date DESC)` — list periods by scope |

**Cấm:** persist LE UUID into `company_id`; cast `company_id::uuid` for scope match.

### 1.3 Status machine (periods)

```text
draft ──(POST …/process)──► processed ──(POST …/close)──► closed
                │                         ▲
                └── re-process / mutate phiếu thường: cấm khi closed (PR-04)
```

| Transition | Guard | Error |
|------------|-------|-------|
| → `processed` | Current = `draft` | `HRM-PAY-003` |
| → `closed` | Current = `processed` | `HRM-PAY-004` |
| Out of scope | `assertResourceInHrmScope` | `HRM-PAY-404` / `HRM-PAY-409` |

---

## 2. Table SoT — `public.payroll_payslips`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`payroll_payslips`** |
| Owner | HRM payroll |
| Role | Phiếu lương theo NV × kỳ — **read SoT** for FR-PR-05; rows emitted by process / upsert (PR-03) |

### 2.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | Soft/Hard | `ref_srs` |
|--------|------|------|--------------|-----------|-----------|
| `id` | UUID PK | NO | Khóa phiếu | — | PR-05 #7/#8 · INT-03 |
| **`company_id`** | **TEXT NOT NULL** | NO | Slug đơn vị (denormalized từ kỳ / NV) | Plane B | PR-05 #6 · SCOPE |
| **`period_id`** | UUID NOT NULL | NO | Kỳ lương | **HARD** `REFERENCES payroll_periods(id) ON DELETE CASCADE` | PR-05 #2 · INT-03 |
| **`employee_id`** | UUID NOT NULL | NO | Hồ sơ NV | **SOFT** → `employees.id` (app-enforced; G-DB-02) | INT-03 · PR-05 |
| `employee_code` | TEXT NOT NULL | NO | Mã NV snapshot | Denorm list paint | PR-05 #4 |
| `employee_name` | TEXT NOT NULL | NO | Tên NV snapshot | Denorm list paint | PR-05 #4 |
| `gross_amount` | NUMERIC(15,2) NOT NULL DEFAULT 0 | NO | Tổng thu nhập | Money | PR-05 #7 · NFR-HRM-05 |
| `deduction_amount` | NUMERIC(15,2) NOT NULL DEFAULT 0 | NO | Khấu trừ | Money | PR-05 |
| `net_amount` | NUMERIC(15,2) NOT NULL DEFAULT 0 | NO | Thực nhận | Money | PR-05 #7 |
| `currency` | TEXT NOT NULL DEFAULT `'VND'` | NO | Tiền tệ | Display | NFR-HRM-05 |
| `status` | TEXT NOT NULL DEFAULT `'processed'` | NO | `draft` \| `processed` \| `paid` | Payslip lifecycle | PR-03/05 |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | — | — |

### 2.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `chk_payslip_status` (`draft` \| `processed` \| `paid`) | Payslip domain |
| `uq_payroll_payslip_period_employee` UNIQUE `(period_id, employee_id)` | One slip per NV per kỳ; upsert ON CONFLICT |
| FK `period_id` → `payroll_periods` | Hard cascade with period delete |
| Soft `employee_id` | **No** `REFERENCES employees` — process must only emit in-scope employees (TechSpec §17.2) |
| List filter index (recommended) | `(company_id, period_id)` · `(employee_id)` for PR-05 filters |

### 2.3 Soft FK — `employee_id` (employees soft ref)

| Rule | Detail |
|------|--------|
| Target | `public.employees.id` — see `DB_DESIGN_HRM_EMPLOYEES.md` |
| Enforcement | App: process / upsert only for employees in `resolveHrmListScope` / workforce filter |
| List scope | `listPayslips` uses `pushWorkforceEmployeeScopeFilter` on `p.employee_id` when tenant partition applies; else `p.company_id = ANY(slugs)` |
| Orphan | Probe only (G-DB-02); do not invent hard FK this wave |
| INT-03 | Same `employee_id` + period `company_id` slug as employee Plane B |

**Cấm:** invent payslip amounts when period just created (PR-01 Quy tắc — không bịa số); seed slips for U65 evidence.

---

## 3. Identity dual-plane

| Plane | Key | Payroll usage |
|-------|-----|---------------|
| **A** | XBOS LE UUID | **Never** as `payroll_*.company_id` |
| **B** | Operating slug | Persist + list filter for periods and payslips |

`company_id=main` (JWT) → rollup five slugs on **read**; rows **never** stored as `main`.

---

## 4. Logical linkage (INT spine)

```text
employees (hub, soft)
    └── payroll_payslips.employee_id
            └── HARD period_id → payroll_periods
```

| Link | Spec | DB enforce | SA rule |
|------|------|------------|---------|
| Payslip → period | PR-05 · INT-03 | **Hard** FK | Cascade delete with period |
| Payslip → employee | INT-03 · PR-05 | Soft UUID | Process emits only in-scope NV |
| Period → company | PR-01 · SCOPE | TEXT slug | Same ladder as Leave/CI/Employees |

---

## 5. Gap / residual (document only — not invent)

| ID | Finding | Owner |
|----|---------|-------|
| **G-PR-03** | TechSpec PARTIAL — `POST …/process` must leave payslips visible to PR-05; runtime today may flip period status without bulk emit | `dev-be`+`dev-fe` |
| **G-DB-02** | Soft `employee_id` (standing) | Optional migration wave |
| Get-by-id payslip | TechSpec §14.6: missing `GET …/payslips/:id` = **non-blocking** if list+row đủ | API_DESIGN §4 target |

---

## 6. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| TEXT `company_id` slug | LE UUID as persist key |
| Hard `period_id` FK | Drop CASCADE without impact note |
| Soft `employee_id` spine | Hard FK cascade wipe employees |
| Honest empty list | Seed payslips for QA U65 |
| Employees / CI / Leave / Recruitment DB pairs | Wipe or rewrite those SoT files |

---

## 7. Verification probes (read-only)

```sql
-- Periods by slug
SELECT company_id, status, COUNT(*) 
FROM public.payroll_periods
WHERE company_id = ANY (ARRAY['holding','trsport','logistics','finance','services'])
GROUP BY 1, 2 ORDER BY 1, 2;

-- Payslips join periods (INT-03)
SELECT p.company_id, pp.status AS period_status, COUNT(*) AS slips
FROM public.payroll_payslips p
JOIN public.payroll_periods pp ON pp.id = p.period_id
GROUP BY 1, 2;

-- Defect: LE UUID keyed
SELECT COUNT(*) AS wrongly_keyed
FROM public.payroll_periods
WHERE company_id ~* '^[0-9a-f]{8}-';
```

---

## CNTT APPEND — `pay_policy_pack` · `pay_input_pack_profile` · template FK (2026-08-11)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-API-01` · data prior `PO-HRM-PAY-CNTT-BA-DATA-01` |
| **Parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **API sibling** | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` · `docs/hrm/API_DESIGN_HRM_PAYROLL.md` CNTT APPEND |
| **ADR** | `ADR-HRM-PAY-MULTI-TEMPLATE-01` §4.2–4.3 · `ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01` |
| **change_mode** | ADD physical · EXPAND `pay_sheet_templates` nullable FKs · **PAPER** until dev-be ensureSchema |
| **Honesty** | `payroll_e2e_ready=false` · **cấm** `apps/**` this seat |

> **must_keep:** TEXT `company_id` slug · soft-delete `archived_at` · open catalog codes · **FORBIDDEN** `CHECK (code IN ('DPHH',…))` · enroll `salary_templates` ≠ mẫu.

### 8.1 Table ADD — `public.pay_policy_pack`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`pay_policy_pack`** |
| Owner | HRM `hrm-api` · Thiết lập lương L4 |
| AMIS map | Step **1 Thiết lập** — QĐ/PDF + scalar params |

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa gói chính sách | UC-BP-PAY-STP-01 |
| **`company_id`** | **TEXT NOT NULL** | NO | Pháp nhân slug Plane B | SCOPE |
| `code` | TEXT NOT NULL | NO | Mã gói (`POL_DPHH_2025`, `POL_KPI_1500_1731`, …) | STP-02 open catalog |
| `name_vi` | TEXT NOT NULL | NO | Tên hiển thị | STP-01 |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | `draft` \| `active` \| `retired` | lifecycle |
| `scope` | TEXT NOT NULL | NO | `CHUNG` \| `RIENG` | STP-01/02 fragment rule |
| `business_line_tag` | TEXT | YES | `DPHH` \| `TDHK` \| `LX_ROUTE` … open | STP-02 RIÊNG |
| `effective_from` | DATE NOT NULL | NO | Hiệu lực từ | BR-PAY-STP-02 |
| `effective_to` | DATE | YES | Hiệu lực đến | BR-PAY-STP-02 |
| `policy_doc_refs_json` | JSONB | YES | `{doc_id, path, fragment_ids[]}` refs | POLICY-READ-METHOD |
| `rate_params_json` | JSONB | YES | KPI ngưỡng · đơn giá · % DT (opaque keys) | STP-03/05/06 |
| `archived_at` | TIMESTAMPTZ | YES | Soft-delete | Platform L1 |
| `created_by` / `updated_by` | TEXT | YES | Audit | |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | |

| Constraint / index | Rule |
|--------------------|------|
| **UQ** (partial) | `(company_id, lower(code))` WHERE `archived_at IS NULL` |
| **CHK** | `scope IN ('CHUNG','RIENG')` — **only** closed enum on scope, not business codes |
| **IX** | `(company_id, status)` · `(company_id, business_line_tag)` · `(company_id, effective_from DESC)` |
| **FK style** | App assert company scope — no CASCADE to templates |

### 8.2 Table ADD — `public.pay_input_pack_profile`

| Item | Value |
|------|--------|
| Table | **`pay_input_pack_profile`** |
| Owner | HRM `hrm-api` · Thiết lập lương L5 |
| AMIS map | Step **4** input pack taxonomy |

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `id` | UUID PK | NO | Khóa profile | UC-BP-PAY-STP-12 |
| **`company_id`** | **TEXT NOT NULL** | NO | Pháp nhân slug | SCOPE |
| `code` | TEXT NOT NULL | NO | `INP_DPHH_DLL`, `INP_TDHK_KPI`, … | DATA §3 open |
| `name_vi` | TEXT NOT NULL | NO | Tên profile | STP-12 |
| `status` | TEXT NOT NULL DEFAULT `'draft'` | NO | `draft` \| `active` \| `retired` | |
| `allowed_source_kinds_json` | JSONB NOT NULL | NO | Allowed `pay_period_input_lines.source_kind` | DATA §4 · BR-DATA-INP-01 |
| `required_component_codes_json` | JSONB | YES | Required `component_code` when policy mandates | VAL-CNTT-07 |
| `column_hints_json` | JSONB | YES | `input_pack_type` → `component_code[]` | DATA §3 BA map |
| `archived_at` | TIMESTAMPTZ | YES | Soft-delete | |
| `created_by` / `updated_by` | TEXT | YES | Audit | |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | |

| Constraint / index | Rule |
|--------------------|------|
| **UQ** (partial) | `(company_id, lower(code))` WHERE `archived_at IS NULL` |
| **IX** | `(company_id, status)` |
| **Validation** | App: each `required_component_codes_json` entry ∈ active `salary_components` |

**Starter profile codes (onboarding suggestion — not DB enum):**

| Code | Models | `allowed_source_kinds_json` (summary) |
|------|--------|--------------------------------------|
| `INP_DPHH_DLL` | ĐPHH | `manual`, `dll_cpn`, `other_income`, `rd_transfer` |
| `INP_TDHK_KPI` | TĐHK | `kpi`, `manual`, `other_income`, `rd_transfer` |
| `INP_TG_BCC` | TG | `manual`, `other_income`, `rd_transfer` (hours via ATT bind) |
| `INP_LXT_ROUTE` | LX-T | `cpsc`, `cldv`, `manual`, `other_income`, `rd_transfer` |
| `INP_LXT_TRUCK` | LX-TR | `revenue`, `advance`, `xdtn`, `manual`, `other_income`, `rd_transfer` |
| `INP_VP_PROV` | VP-T | `vp_cost`, `vp_allowance`, `manual`, `other_income`, `rd_transfer` |

### 8.3 EXPAND — `public.pay_sheet_templates` (nullable FKs)

> Base DDL cite `po-hrm-amis-parity-pay-data-01.md` §2.1 — **APPEND columns only**.

| ADD column | Type | Null | FK / rule |
|------------|------|------|-----------|
| `business_line_tag` | TEXT | YES | Open string — links OU/BP applicability (STP-11 multi-tỉnh) |
| `policy_pack_id` | UUID | YES | Soft FK → `pay_policy_pack.id` — same `company_id` |
| `input_pack_profile_id` | UUID | YES | Soft FK → `pay_input_pack_profile.id` — same `company_id` |

| Index | Purpose |
|-------|---------|
| `(company_id, business_line_tag)` partial active | Filter picker by BP |
| `(policy_pack_id)` · `(input_pack_profile_id)` | Usage / integrity checks |

**Rollback:** Nullable FKs — templates without pack/profile remain valid.

### 8.4 EXPAND — period snapshot (`payroll_periods`)

| Field | Location | Content |
|-------|----------|---------|
| `sheet_template_snapshot_json.setupContext` | jsonb sibling | `{ policyPackId, policyPackCode, policyPackVersionAt, policyPackRateParams, inputPackProfileId, inputPackProfileCode, inputPackProfileVersionAt, allowedSourceKinds[], requiredComponentCodes[] }` |

Version = source row `updated_at` at period bind — drives **`HRM-PAY-INP-PROFILE-422`** on input-lines.

### 8.5 Logical linkage (CNTT slice)

```text
pay_policy_pack ──┐
pay_input_pack_profile ──┼──► pay_sheet_templates (FK) ──► payroll_periods (snapshot)
salary_components ◄── pay_sheet_template_lines
pay_period_input_lines ◄── validated by snapshot allowedSourceKinds
pay_period_timesheet_bind ◄── ATT (orthogonal to profile)
```

| From | To | Rule |
|------|-----|------|
| `pay_sheet_templates.policy_pack_id` | `pay_policy_pack.id` | N:1 optional · same company |
| `pay_sheet_templates.input_pack_profile_id` | `pay_input_pack_profile.id` | N:1 optional |
| `pay_period_input_lines.source_kind` | profile snapshot | Must ∈ `allowed_source_kinds_json` |
| `hrm_sales_data` | `pay_period_input_lines` | Bridge GĐ2 · BR-DATA-SALES-01 · not DDL here |

### 8.6 Verification probes (post ensureSchema)

```sql
-- Policy packs by company
SELECT company_id, scope, status, COUNT(*)
FROM public.pay_policy_pack
WHERE archived_at IS NULL
GROUP BY 1, 2, 3 ORDER BY 1;

-- Templates with setup FKs
SELECT company_id, business_line_tag,
       COUNT(*) FILTER (WHERE policy_pack_id IS NOT NULL) AS with_policy,
       COUNT(*) FILTER (WHERE input_pack_profile_id IS NOT NULL) AS with_profile
FROM public.pay_sheet_templates
WHERE archived_at IS NULL
GROUP BY 1, 2;
```

### 8.7 EXPAND — `public.pay_sheet_template_lines` (fragment bind — SA-FRAGMENT-MAP-02)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` |
| **ADR** | `ADR-HRM-PAY-FRAGMENT-BIND-01` |
| **change_mode** | ADD columns · **PAPER** until dev-be ensureSchema |

| ADD column | Type | Null | Meaning (VI) | `ref_srs` |
|------------|------|------|--------------|-----------|
| `fragment_id` | TEXT | YES | Mã fragment catalog `FRG-*` — traceability tới QĐ/PDF | STP-03 · XLSX-COLUMN-MAP |
| `fragment_bind_mode` | TEXT | YES | `CHUNG_ONLY` \| `RIENG_OVERRIDE` \| `STATUTORY` \| `IDENTITY` \| `INPUT_PACK` \| `DEDUCTION_GAP` | STP-03 |

| Constraint | Rule |
|------------|------|
| **CHK** | `fragment_bind_mode` ∈ allowed set when NOT NULL |
| **CHK** | `fragment_id IS NOT NULL` ⇒ `fragment_bind_mode` IN (`CHUNG_ONLY`,`RIENG_OVERRIDE`) |
| **IX** | `(fragment_id)` partial WHERE `fragment_id IS NOT NULL` — audit only |

Period snapshot lines copy `fragment_id` + `resolved_fragment_id` + `resolver_trace_json` from bind-time resolver (`ADR-HRM-PAY-FRAGMENT-BIND-01` §5).

### 8.8 EXPAND — period snapshot dual-template bind (GAP-CNTT-08/10)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02` |
| **ADR** | `ADR-HRM-PAY-FRAGMENT-BIND-01` §6 Option A |
| **Location** | `payroll_periods.sheet_template_snapshot_json` (jsonb — no new columns) |

| JSON path | Type | Rule |
|-----------|------|------|
| `primaryTemplateId` | UUID string | SoT primary mẫu (existing `pay_sheet_template_id` mirror) |
| `secondaryTemplates[]` | array | `{ templateId, templateCode, policyPackId, lines[], resolvedFragments[] }` |
| `mergeRule` | string | Required when `secondaryTemplates.length > 0` — starter: `DPHH_BHXH_NET_ONCE` · `TDHK_STATUTORY_ONCE` |
| `siBaseSource` | string | Architecture hint GĐ1 — formula wave deferred |
| `lines[].resolved_fragment_id` | string | Output resolver at bind |
| `lines[].resolver_trace_json` | object | Audit chain — no amount eval |

**GAP-CNTT-09:** LX summary sheet — **no** `secondaryTemplates` entry; detail template only.

