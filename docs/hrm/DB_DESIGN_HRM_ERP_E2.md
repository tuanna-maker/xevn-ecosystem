# DB_DESIGN — HRM ERP E2 (PAY-CLEAN + Contract type constraint)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E2-DB-API-01` |
| **cohort** | E2 · `E-PAY-CLEAN` / `PAY-CONTRACT-CONSTRAINT` · `P-HRM-ERP-DATA-FIDELITY-01` |
| **change_mode** | ADD · preserve_default · **APPEND** pointers on Payroll + Contracts SoT |
| **ref_srs** | `docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md` **FR-HRM-PAY-CLEAN-E2-01** · **FR-HRM-CI-TYPE-E2-01** · BR-HRM-PAY-E2-01..03 · BR-HRM-CI-E2-01 · AC-E2-* · team `docs/hrm/SRS.md` UC-HRM-24/25/28/31 · **FR-HRM-SC-PAY-TYPE-01** · **FR-HRM-SC-CT-01** · **FR-HRM-SC-PAY-01** · FR-CI-01 #6 |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` §14.2 / §14.6 / §16.1 / §17 payroll + contracts spine |
| **ref_catalog** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §5.3 · §6 · `DB_DESIGN_HRM_SETTINGS_CATALOG.md` L0→L1→L2a |
| **ref_baseline** | `DB_DESIGN_HRM_PAYROLL.md` · `DB_DESIGN_HRM_CONTRACTS_INS.md` · E1-A `DB_DESIGN_HRM_MD_BIND_E1A.md` (must_keep position_key) |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_ERP_E2.md` |
| **ref_dispatch** | `docs/program/FIDELITY_PROGRAM_DISPATCH.md` Cohort 3 |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice **before** Dev claim on E2 mock-clean / nature bind / A8 |
| **Date** | 2026-07-28 |
| **Cấm** | `apps/**` this WI · **apply migration** this WI · seed U65 |

> **Key lock (normative — Q3 SRS):** UI «bản chất / loại thành phần» → column **`salary_components.component_type`** = Settings **`pay_types.code`** (aliases `component_types` / `pay_natures` / `salary_component_types`). **Cấm** treat TX table `salary_components` as Settings nature enum. Instance row identity = **`code`** (+ optional Settings dictionary bucket `salary_components` / `payroll_components`).

> **Carry:** **R-E1A-A8-CTYPE** — `employee_contracts.contract_type` soft-assert ∈ effective **`contract_types`**. E1-A `position_key` / signer keys = **must_keep**.

---

## 1. Scope (in / out)

### 1.1 In-scope (E2)

| # | Domain | Gap class | Design action |
|---|--------|-----------|---------------|
| P1 | Payroll FE mock tax / insurance islands | Mock arrays / fake policy rows | **Contract:** no new mock tables; wire live APIs or **hide** surface; DB unchanged for tax |
| P2 | `salary_components.component_type` | HARDCODE VI labels as SoT | Soft-ref **`pay_types`**; persist **code**; unique `(company_id, code)` |
| P3 | Period + component mutate constraints | Unique/assert mỏng | Document VAL + DDL unique; period overlap already `HRM-PAY-002` |
| C1–C3 | `employee_contracts.contract_type` | HARDCODE `CONTRACT_TYPES_KEYS` (A8) | Soft-assert **`contract_types`**; no column rename |

### 1.2 Out of scope

| Item | Cohort / note |
|------|----------------|
| Insurance full policy CRUD / insurer catalog | **E3** |
| Performance SM | **E3** |
| Tax settlement **new** physical tables | **Not invent** — hide UI until endpoint exists (Q1) |
| Hard DB FK → catalog item rows | Soft assert only (E1-A pattern) |
| Settings MD expand | **E1-B CLOSED** — reuse buckets |
| Position bind on contracts | **E1-A CLOSED** — must_keep |

### 1.3 must_keep

| Path | Status |
|------|--------|
| `payroll_periods` / `payroll_payslips` Plane B TEXT slug · soft emp · hard period | OK — `DB_DESIGN_HRM_PAYROLL.md` |
| Period unique date-range + overlap app check | OK |
| E1-A CI `position_key` / `signer_position_key` | OK |
| E1-B Settings `pay_types` + `contract_types` buckets | OK |
| G-CI-01 end_date by open-ended type class | OK — open-ended detection must accept **catalog codes** after A8 |

---

## 2. Catalog soft-ref contract (normative)

### 2.1 Pay nature (`component_type`)

| Item | Value |
|------|--------|
| Catalog family | Canonical **`pay_types`** · aliases `component_types`, `pay_natures`, `salary_component_types` |
| Persist column | `public.salary_components.component_type` = **`code`** (TEXT) |
| Display | FE `getLabel()` / Settings `label` VI — **never** persist VI label as SoT (U72) |
| Assert helper | `assertCodeInEffectiveCatalog({ catalogKey: 'pay_types' \| alias, code })` |
| Empty catalog | Mutate **reject** when nature required — no HARDCODE invent list |
| Sibling axis | Column `nature` (`income` \| `deduction` …) = **accounting polarity** — **not** Settings `pay_types` |

### 2.2 Contract type

| Item | Value |
|------|--------|
| Catalog family | Canonical **`contract_types`** |
| Persist column | `public.employee_contracts.contract_type` = **`code`** |
| Display | U72 F-04 FE map from catalog label (not HARDCODE i18n-only enum when items > 0) |
| Assert helper | Same `assertCodeInEffectiveCatalog(contract_types, code)` |
| Empty catalog | Empty + CTA Settings/sync; **cấm** invent HARDCODE as SoT when product locks required |
| Open-ended policy | `assertContractEndDateForCreate` must recognize open-ended **codes** from catalog (metadata flag or code allow-list documented in Dev) — labels-only detection is residual risk after A8 |

### 2.3 Hybrid: Settings `salary_components` vs TX table

| Store | Role |
|-------|------|
| Settings catalog key `salary_components` / `payroll_components` | Optional dictionary of component codes (E1-B bucket #11) |
| Table **`public.salary_components`** | Company TX CRUD (FR-HRM-SC-PAY-01) — **must_keep** module path |
| Assert on TX create | `component_type` ∈ `pay_types`; optional future: `code` ∈ Settings dictionary when bucket populated |

---

## 3. Table — `public.salary_components` (E2 delta)

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `PayrollCatalogService.ensureSalaryComponentSchema` |
| Consumers | SalaryComponentsTab · salary-templates JOIN · UC-HRM-28 |
| Runtime AS-IS | `component_type TEXT NOT NULL DEFAULT 'Lương'` — **VI label default**; **no** UNIQUE `(company_id, code)`; **no** catalog assert |
| `ref_srs` | FR-HRM-PAY-CLEAN-E2-01 #2–#5 · FR-HRM-SC-PAY-TYPE-01 · FR-HRM-SC-PAY-01 · AC-E2-PAY-NATURE-01 · VAL-E2-01/04 |

### 3.1 Columns — semantics change (no rename)

| Column | Type | Null | E2 meaning (VI) | `ref_srs` |
|--------|------|------|-----------------|-----------|
| `id` | UUID PK | NO | Khóa TP | FR-HRM-SC-PAY-01 |
| `company_id` | TEXT NOT NULL | NO | Plane B slug | SCOPE |
| `code` | TEXT NOT NULL | NO | Mã TP instance (unique per company) | FR-HRM-SC-PAY-01 · VAL-E2-04 |
| `name` | TEXT NOT NULL | NO | Tên hiển thị | U72 |
| `category_id` | UUID | YES | Soft → `salary_component_categories` | Optional FK |
| **`component_type`** | TEXT NOT NULL | NO | **`pay_types.code`** (không còn VI list SoT) | FR-HRM-SC-PAY-TYPE-01 · BR-HRM-PAY-E2-02 |
| `nature` | TEXT NOT NULL | NO | Polarity accounting (`income`/`deduction`/…) | Separate axis |
| `value_type`, money flags, formula, bounds… | (existing) | — | Unchanged | must_keep |
| timestamps | TIMESTAMPTZ | NO | Audit | — |

**Default change (design):** DEFAULT `'Lương'` → **forbidden for new writes**; Dev should stop defaulting invent VI — require explicit `component_type` code from picker (or map legacy once).

### 3.2 Constraints / indexes — ADD (design only)

| Name / definition | Purpose | Error (API) |
|-------------------|---------|-------------|
| **`uq_salary_components_company_code`** UNIQUE `(company_id, code)` WHERE active policy: prefer full unique on `(company_id, lower(code))` | VAL-E2-04 anti-duplicate | **`HRM-SC-002`** 409 |
| Index `(company_id, component_type)` | Filter by nature code | — |
| Soft assert `component_type` ∈ effective `pay_types` | BR-HRM-PAY-E2-02 | **`HRM-PAY-TYPE-KEY`** 400 |
| Soft `category_id` FK (existing) | ON DELETE SET NULL | — |

### 3.3 DDL draft (**do not apply** in this WI)

```sql
-- Design only — Dev-BE apply after SA ack
CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_components_company_code
  ON public.salary_components (company_id, lower(code));

CREATE INDEX IF NOT EXISTS idx_salary_components_company_component_type
  ON public.salary_components (company_id, component_type);

-- Optional backfill WI (separate): map legacy VI labels → pay_types.code
-- UPDATE ... SET component_type = mapped_code WHERE component_type IN ('Lương', ...);
```

### 3.4 Soft refs / reject

| Field | Target | Enforcement | Reject code |
|-------|--------|-------------|-------------|
| `component_type` | effective `pay_types` (+ aliases) | Assert on create/update when provided; **required** on create | **`HRM-PAY-TYPE-KEY`** |
| `code` | unique per `company_id` | DB unique + app pre-check | **`HRM-SC-002`** |
| `code` empty / name empty | DTO required | App | **`HRM-VAL-001`** / `HRM-SC-001` |

### 3.5 Legacy VI values (migration implication — document)

| AS-IS sample | Target | Owner |
|--------------|--------|-------|
| `Lương`, `Phụ cấp`, `Thuế`, … (FE `componentTypes` array) | Matching `pay_types.code` after Settings sync | Dev-BE backfill WI **after** E2 assert lands; until then invent VI still **400** on new writes |
| DEFAULT `'Lương'` on INSERT omit | Require body `component_type` | Dev-BE |

**Cấm:** silent accept unknown VI as “catalog”; seed `pay_types` for U65.

---

## 4. Table — `public.payroll_periods` (constraint cite — no rewrite)

| Item | Value |
|------|--------|
| Baseline | `DB_DESIGN_HRM_PAYROLL.md` §1 |
| E2 reinforce | Unique `(company_id, start_date, end_date)` + app overlap → **`HRM-PAY-002`** |
| Required fields | `company_id`, `period_label`, `start_date`, `end_date` | VAL-E2-03 |
| Out | Invent period_code column this wave |

No new columns for E2 period path.

---

## 5. Table — `public.employee_contracts` (A8 contract_type)

| Item | Value |
|------|--------|
| Baseline | `DB_DESIGN_HRM_CONTRACTS_INS.md` §1 |
| E2 change | **Semantics only** — `contract_type` = **`contract_types.code`**; assert on mutate |
| Column DDL | **No ADD** required for type (column exists) |
| E1-A position columns | must_keep — do not drop |

### 5.1 Soft refs — UPDATE residual → E2 lock

| Field | Target | Enforcement | Reject code |
|-------|--------|-------------|-------------|
| `contract_type` | effective `contract_types` | **Required** assert on create; assert on update when field present | **`HRM-CON-TYPE-KEY`** |
| Open-ended class | Catalog codes (+ legacy label bridge until cutover) | `assertContractEndDateForCreate` | `HRM-CON-002` / `HRM-CON-001` |

**Parity:** Profile EmployeeContracts and Contracts page persist the **same** code space — one DB column, one catalog family (AC-E2-CI-PARITY-01).

### 5.2 HARDCODE bridge (FE-only, temporary)

| Rule | Detail |
|------|--------|
| When `effectiveItems(contract_types).length > 0` | FE **must not** render `CONTRACT_TYPES_KEYS` as option SoT |
| When length = 0 (U65) | Empty + CTA; chặn Lưu if required — **cấm** invent five VI strings as DB SoT |
| Persist | Always **code**; if legacy rows store VI labels, list still paints via F-04 / labelMaps; new writes = code only |

---

## 6. Mock-removal data contract (P1 — no fake tables)

### 6.1 Insurance policy participants (Payroll island)

| Item | Value |
|------|--------|
| Live table | `public.hrm_insurance_policy_participants` (runtime `CatalogExtensionsService`) |
| Live API | `/api/hrm/insurance-policy-participants` (GET/POST/PATCH/DELETE) |
| FE AS-IS | `Payroll.tsx` const `insurancePolicyParticipantsData` **mock rows** |
| E2 contract | FE **DELETE mock array**; bind list/mutate to live API; empty = honest empty |
| Depth | Full insurer catalog / policy master = **E3** — E2 only removes fake island |

### 6.2 Tax settlement (Q1 — resolved for U71)

| Item | Value |
|------|--------|
| BE tax-settlement endpoints | **Absent** (grep hrm-api = none) |
| FE AS-IS | `taxSettlementsData` / employees arrays (often empty) + mock policy tab comments |
| E2 contract | **HIDE** mutate/edit tax settlement surfaces that invent rows **OR** read-only empty with BR-MOCK-02 banner — **cấm** mock fill that «chạy được» |
| New physical tables | **OUT** this cohort — do not invent `tax_settlements` DDL without sponsor CR |

### 6.3 Payment batches

| Item | Value |
|------|--------|
| Live | `payment_batches` / `payment_records` via `PayrollCatalogService` |
| FE | Prefer live `/payroll/payment-batches*` — empty arrays OK; **cấm** static fake batches |

---

## 7. Identity dual-plane + scope

| Plane | Payroll / CI E2 usage |
|-------|------------------------|
| **A** LE UUID | Never as `company_id` |
| **B** operating slug | Persist + list filter for `salary_components`, periods, contracts |
| Catalog partition | `resolveHrmSettingsCatalogCompanyId` same ladder as Settings assert |

**U19 scope_parity:** list salary-components ↔ get/update/delete by id use **same** `resolveHrmListScope` / `assertResourceInHrmScope` family (already `HRM-SC-404` / `HRM-SC-409`).

---

## 8. Validation matrix (DB / data plane)

| VAL-ID | Condition | Expected |
|--------|-----------|----------|
| VAL-E2-DB-01 | INSERT `salary_components` with unknown `component_type` | App reject **before** commit → `HRM-PAY-TYPE-KEY` |
| VAL-E2-DB-02 | Duplicate `(company_id, code)` | Unique violation / `HRM-SC-002` |
| VAL-E2-DB-03 | INSERT contract unknown `contract_type` | `HRM-CON-TYPE-KEY` |
| VAL-E2-DB-04 | Period date order / overlap | `HRM-PAY-001` / `HRM-PAY-002` (baseline) |
| VAL-E2-DB-05 | Mock FE arrays still SoT | **FAIL** AC-E2-NOMOCK (process — not DB) |
| VAL-E2-DB-06 | `component_type` stores VI label when `pay_types` has codes | **FAIL** AC-E2-PAY-NATURE (treat as invent) |
| VAL-E2-SCOPE-01 | Member slug cannot mutate other slug component | 404/409 family |

---

## 9. Acceptance (DB plane E2)

| Check | PASS |
|-------|------|
| Design documents unique + soft-ref for `component_type` / `contract_type` | This file |
| DDL draft present; **not applied** in BA WI | Evidence |
| No new tax_settlements table invented | §6.2 |
| Insurance participants SoT = existing table | §6.1 |
| Pointers APPEND on Payroll + Contracts baseline | Done in same WI |
| U65 | No seed catalog for evidence |

**Read-only probes (Dev/QA after apply — not BA):**

```sql
-- Duplicate codes
SELECT company_id, lower(code), COUNT(*)
FROM public.salary_components
GROUP BY 1, 2 HAVING COUNT(*) > 1;

-- Suspect VI labels still in component_type (post-cutover)
SELECT DISTINCT component_type FROM public.salary_components
ORDER BY 1;

-- Contract types sample
SELECT contract_type, COUNT(*) FROM public.employee_contracts GROUP BY 1 ORDER BY 2 DESC;
```

---

## 10. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| Periods/payslips baseline | Wipe `DB_DESIGN_HRM_PAYROLL.md` |
| Soft emp + TEXT slug | LE UUID persist |
| E1-A position keys on CI | Drop position_key |
| E1-B pay_types / contract_types Settings | DDL-rename live XBOS keys |
| Soft catalog assert | Hard FK to catalog item UUID this wave |
| Honest empty | Seed payslips / catalog / insurance for U65 |
| Hide tax when no API | Mock tax editor that invents participants |

---

## 11. Residuals

| ID | Finding | Owner |
|----|---------|-------|
| R-E2-BACKFILL-NATURE | Legacy VI `component_type` → code map | Dev-BE after SA |
| R-E2-OPENEND-CODE | Open-ended contract detection by catalog code/metadata | Dev-BE + BA-P if SRS gap |
| R-E2-TAX-API | Tax settlement physical API/tables | Sponsor CR / later cohort |
| R-E2-INS-DEPTH | Full insurance policy master | **E3 design CLOSED** — `DB_DESIGN_HRM_ERP_E3.md` (impl after SA/Dev) |
| G-PR-03 | Process emit payslips | Standing payroll residual |
