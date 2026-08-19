# DB_DESIGN — HRM MD-BIND Layer A (position_key consumers)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1A-DB-API-01` |
| **cohort** | E1-A · `MD-BIND-LAYER-A` · `P-HRM-ERP-DATA-FIDELITY-01` |
| **change_mode** | ADD · preserve_default · **APPEND** to consumer physical designs |
| **ref_srs** | `docs/hrm/SRS.md` **§16.0 BR-HRM-MD-01** · **AC-HRM-PICKER-01** · **FR-HRM-SC-POS-01** · **FR-HRM-SC-DEC-01** · **UC-HRM-27** · FR-CI-01 (contracts) · FR-EM-01 pattern (`job_title_key`) |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` §11.4 / §14 / §16.5 / §17.6 (Lane B leftover lock) |
| **ref_catalog** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` §2.1 · §10 · §11 |
| **ref_pattern** | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` · `job_title_key` + soft assert |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` |
| **ref_evidence** | `ba-hrm-md-catalog-trace-01-20260728` · `ba-hrm-erp-settings-consumer-01-20260728` · `qa-hrm-erp-fidelity-spot-01-20260728` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice **before** Dev claim on E1-A picker + assert |
| **Date** | 2026-07-28 |
| **Cấm** | `apps/**` this WI · **apply migration** this WI · seed for U65 |

> **Invariant (must_keep):** Catalog SoT = Settings effective `job_titles` (+ alias `positions`). Consumers persist **`*_key` = catalog `code`**. Label TEXT columns = **display snapshot only** (U72). Free-text as SoT = **forbidden** (BR-HRM-MD-01). Job-templates `position_code` assert path = **pattern to reuse** — do not regress.

> **Naming lock (GAP-WH-KEY-04):** On timeline / decisions / job_postings / contracts / headcount use wire+column name **`position_key`** — **not** `job_title_key` (reserved for `employees.job_title_key`). Same catalog family.

---

## 1. Scope (in / out)

### 1.1 In-scope (E1-A Layer A)

| # | Table | Gap class | Design action |
|---|-------|-----------|---------------|
| A | `public.employee_work_timeline` | FREE_TEXT `position` · no key col | **ADD** `position_key` (+ optional `department_key`) |
| B | `public.hr_decisions` | FREE_TEXT `position` / `signer_position` | **ADD** `position_key` · `signer_position_key` |
| C | `public.job_postings` (Lane B menu) | FREE_TEXT `position` NOT NULL | **ADD** `position_key` · optional `department_key` |
| D | `public.headcount_proposals` (Lane B) | FREE_TEXT `position_name` | **ADD** `position_key` |
| E | `public.employee_contracts` | FE position/signer FREE_TEXT; **BE columns missing** | **ADD** `position` / `position_key` / `signer_position` / `signer_position_key` (+ optional dept keys) |

### 1.2 Out of scope (other cohorts)

| Item | Cohort / note |
|------|----------------|
| Settings MD panel expand (pay/shifts/grades/…) | **E1-B** |
| Payroll `component_type` HARDCODE | **E2** |
| `contract_type` catalog assert harden | E2 / residual CI |
| Attendance sheet position filter derived | P2 after keys land |
| Lane A `job_requisitions` FR-RC-01 SoT | must_keep — **cấm** rebind headcount to `job_postings` |
| Hard DB FK → catalog item rows | Soft assert only (same as employees) |

### 1.3 must_keep OK paths (do not overwrite)

| Path | Status |
|------|--------|
| `employees.job_title_key` + `assertJobTitleKeyInCatalog` | OK |
| Leave `leave_type` assert | OK |
| Decisions `decision_type` assert | OK |
| Job templates `position_code` + assert | OK |
| Settings L0→L1→L2a merge | OK |

---

## 2. Catalog soft-ref contract (normative)

| Item | Value |
|------|--------|
| Catalog family | Canonical **`job_titles`** · aliases `positions` / `employee_positions` (runtime normalize) |
| Persist value | `code` from `effectiveItems` (active) |
| Display | `label` VI via FE `getLabel()` / denormalized snapshot column — **never** show raw key as SoT UI (U72) |
| Assert helper | Reuse / generalize `assertCodeInEffectiveCatalog(tenant, company, 'job_titles', code)` (same family as `assertJobTitleKeyInCatalog`) |
| Empty catalog | Mutate **reject** — no free-text fallback |
| Scope partition | Same `resolveHrmSettingsCatalogCompanyId` / list scope ladder as Settings (`main`→holding rules) |

### 2.1 Key vs snapshot columns

| Column role | Nullability (target) | Meaning |
|-------------|----------------------|---------|
| `*_key` | Required on **new** writes when field is shown as picker; NULL allowed only for **legacy** rows until backfill | Soft catalog code |
| Snapshot TEXT (`position`, `position_name`, `signer_position`) | YES | Denormalized label at write time for list paint / audit; may be refreshed from catalog label when key set |

**Dual-write rule on create/update:** when `position_key` present → set snapshot from catalog `label` if client omits snapshot (mirror job-templates).

---

## 3. Table A — `public.employee_work_timeline` (Work History / Work Timeline)

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `EmployeeProfileService` |
| Consumers | `EmployeeWorkHistory` · `EmployeeWorkTimeline` profile tabs |
| Runtime AS-IS | `position TEXT` free-text; allowlist update includes `position`; **no** catalog assert |
| `ref_srs` | BR-HRM-MD-01 · AC-HRM-PICKER-01 · FR-HRM-SC-POS-01 Diễn biến #5/#6 · FR-EM-01 pattern |

### 3.1 Columns — ADD (physical)

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| **`position_key`** | TEXT | YES* | Mã chức danh/vị trí catalog (`job_titles.code`) | FR-HRM-SC-POS-01 #5 · BR-HRM-MD-01 |
| `department_key` | TEXT | YES | Mã phòng ban catalog (`departments.code`) — P1 harden | FR-HRM-SC-POS-01 |
| `position` *(existing)* | TEXT | YES | **Snapshot nhãn** — không còn SoT | U72 |
| `department` *(existing)* | TEXT | YES | Snapshot / migrate from name→label | PARTIAL today |

\*After cutover policy: **new INSERT/UPDATE** that set Vị trí must send `position_key` NOT NULL; legacy rows may remain NULL until FE rewrite + optional backfill WI.

### 3.2 DDL draft (design only — **do not apply** in this WI)

```sql
ALTER TABLE public.employee_work_timeline
  ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
ALTER TABLE public.employee_work_timeline
  ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
CREATE INDEX IF NOT EXISTS idx_employee_work_timeline_position_key
  ON public.employee_work_timeline (company_id, position_key)
  WHERE position_key IS NOT NULL;
```

### 3.3 Soft refs / reject

| Field | Target | Enforcement | Reject code |
|-------|--------|-------------|-------------|
| `position_key` | effective `job_titles` / `positions` | Assert on create/update when provided or when product locks required | **`HRM-WH-POS-KEY`** |
| `department_key` | effective `departments` | Assert when provided | **`HRM-WH-DEPT-KEY`** |

**Cấm:** persist invent label-only as SoT; treat `employees.job_title_key` as covering timeline (timeline is career event history — separate rows).

---

## 4. Table B — `public.hr_decisions` (Decisions)

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `DecisionsService` |
| Consumers | UC-HRM-27 Decisions embed |
| Runtime AS-IS | `decision_type` asserted OK; `position` / `signer_position` TEXT free-text |
| Baseline columns | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` §B |
| `ref_srs` | **UC-HRM-27** · **FR-HRM-SC-DEC-01** (type) · **FR-HRM-SC-POS-01** (position fields) · BR-HRM-MD-01 |

### 4.1 Columns — ADD

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| **`position_key`** | TEXT | YES* | Mã Vị trí NV liên quan | FR-HRM-SC-POS-01 · H-DEC-CREATE |
| **`signer_position_key`** | TEXT | YES | Mã chức danh người ký | FR-HRM-SC-POS-01 |
| `position` / `signer_position` *(existing)* | TEXT | YES | Snapshot nhãn | U72 |

### 4.2 DDL draft (not apply)

```sql
ALTER TABLE public.hr_decisions
  ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
ALTER TABLE public.hr_decisions
  ADD COLUMN IF NOT EXISTS signer_position_key TEXT NULL;
```

### 4.3 Soft refs / reject

| Field | Catalog | Reject |
|-------|---------|--------|
| `decision_type` | `decision_types` | **`HRM-DEC-TYPE`** (must_keep) |
| `position_key` | `job_titles` | **`HRM-DEC-POS-KEY`** |
| `signer_position_key` | `job_titles` | **`HRM-DEC-SIGNER-POS-KEY`** |

**Policy:** If FE shows Vị trí picker on create → `position_key` **required** on POST; signer key required only when signer_name/signer fields filled.

**Scope parity (U19):** list / get-by-id / PATCH / DELETE remain on `resolveHrmListScope` + `assertResourceInHrmScope` — unchanged by key ADD.

---

## 5. Table C — `public.job_postings` (Lane B — menu JD leftover)

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `RecruitmentCatalogService` |
| Consumers | JobPostingsTab |
| Runtime AS-IS | `position TEXT NOT NULL` free-text; no `position_key` |
| **must_keep** | **Not** FR-RC-01 SoT; **cấm** bind YCTD headcount to this table (§17.6 F1/F6) |
| `ref_srs` | BR-HRM-MD-01 · AC-HRM-PICKER-01 · FR-HRM-SC-POS-01 (consumer bind) · FR-HRM-SC-JT-01 pattern via templates |

### 5.1 Columns — ADD / semantics

| Column | Type | Null | Meaning (VI) |
|--------|------|------|--------------|
| **`position_key`** | TEXT | YES* → required on new write | Catalog code SoT |
| `department_key` | TEXT | YES | Catalog dept code (P1) |
| `position` *(existing)* | TEXT NOT NULL | NO | Becomes **label snapshot** (denorm from catalog when key set) |
| `department` *(existing)* | TEXT | YES | Snapshot |

### 5.2 DDL draft (not apply)

```sql
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
```

### 5.3 Soft refs / reject

| Field | Reject |
|-------|--------|
| `position_key` required + ∈ catalog | **`HRM-JP-POS-KEY`** |
| invent-only `position` without key | Reject (same class as JD `HRM-REC-JD-POS`) |

**Pattern cite:** `job_description_templates.position_code` already asserts — job_postings must align to same soft-ref depth for Vị trí.

---

## 6. Table D — `public.headcount_proposals` (Lane B leftover)

| Item | Value |
|------|--------|
| Runtime AS-IS | `position_name TEXT NOT NULL` free-text |
| **must_keep** | Not FR-RC-01 SoT (`job_requisitions.headcount` remains SoT for YCTD) |

### 6.1 Columns — ADD

| Column | Type | Null | Meaning |
|--------|------|------|---------|
| **`position_key`** | TEXT | YES* | Catalog SoT |
| `department_key` | TEXT | YES | Catalog dept |
| `position_name` / `department` | TEXT | keep | Snapshot labels |

### 6.2 Reject

| Field | Code |
|-------|------|
| Missing / invalid `position_key` on create | **`HRM-HCP-POS-KEY`** |

---

## 7. Table E — `public.employee_contracts` (Contracts profile tab)

| Item | Value |
|------|--------|
| Owner | `hrm-api` · `ContractsInsuranceService` |
| Baseline | `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` — **no** position columns today |
| FE AS-IS | `EmployeeContracts.tsx` free-text `position` / `signer_position` / dept Select by **name** |
| Gap | FE fields **orphan vs BE schema** — E1-A closes with ADD columns + keys |
| `ref_srs` | FR-CI-01 · BR-HRM-MD-01 · FR-HRM-SC-POS-01 |

### 7.1 Columns — ADD

| Column | Type | Null | Meaning (VI) | `ref_srs` |
|--------|------|------|--------------|-----------|
| `position` | TEXT | YES | Snapshot nhãn vị trí trên HĐ | U72 |
| **`position_key`** | TEXT | YES* | Catalog code SoT | FR-HRM-SC-POS-01 |
| `department` | TEXT | YES | Snapshot PB | — |
| `department_key` | TEXT | YES | Catalog dept code | FR-HRM-SC-POS-01 |
| `signer_name` | TEXT | YES | Người ký | Form |
| `signer_position` | TEXT | YES | Snapshot chức danh ký | U72 |
| **`signer_position_key`** | TEXT | YES | Catalog code người ký | FR-HRM-SC-POS-01 |
| `work_location` / `signing_date` / probation fields | TEXT/DATE/INT | YES | Align FE bag if product keeps them — **orthogonal** to MD-BIND keys; Dev may stage with keys or separate CI UX WI | FR-CI-01 residual |

> **E1-A minimum for contracts:** `position_key` (+ snapshot `position`) and `signer_position_key` (+ snapshot). Other FE-only fields remain residual CI parity (may stay FE-local until dedicated CI schema WI) — **flagged** in §10 risks.

### 7.2 DDL draft (not apply)

```sql
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS position TEXT NULL;
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS department TEXT NULL;
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS signer_name TEXT NULL;
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS signer_position TEXT NULL;
ALTER TABLE public.employee_contracts
  ADD COLUMN IF NOT EXISTS signer_position_key TEXT NULL;
```

### 7.3 Soft refs / reject

| Field | Catalog | Reject |
|-------|---------|--------|
| `position_key` | `job_titles` | **`HRM-CON-POS-KEY`** |
| `signer_position_key` | `job_titles` | **`HRM-CON-SIGNER-POS-KEY`** |
| `contract_type` | `contract_types` | Residual E2 tighten (not E1-A DoD) |

**must_keep:** G-CI-01 end_date rules · Plane B slug · soft `employee_id` · no salary SoT on contract row.

---

## 8. Validation matrix (DB / app layer)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-MDBIND-01 | Create WH with empty `position_key` when Vị trí required | Reject | 400 **`HRM-WH-POS-KEY`** |
| VAL-MDBIND-02 | `position_key` ∉ effective active `job_titles` | Reject | 400 family key code |
| VAL-MDBIND-03 | Valid key + omit snapshot | Accept; denorm `position`=`label` | 201/200 |
| VAL-MDBIND-04 | Legacy row `position` TEXT, `position_key` NULL | List/get OK; update requiring position must supply key | No silent invent |
| VAL-MDBIND-05 | Decisions `decision_type` invalid | Keep existing reject | **`HRM-DEC-TYPE`** |
| VAL-MDBIND-06 | Decisions `position_key` invalid | Reject | **`HRM-DEC-POS-KEY`** |
| VAL-MDBIND-07 | Job posting invent `position` without key | Reject | **`HRM-JP-POS-KEY`** |
| VAL-MDBIND-08 | Contract create with invent position string only | Reject after columns live | **`HRM-CON-POS-KEY`** |
| VAL-MDBIND-09 | Scope list vs get-by-id | Same scope helper | No 404 after list id (U19) |
| VAL-MDBIND-10 | Empty Settings catalog | Mutate reject honest | No free-text bypass |

---

## 9. Traceability (requirement → DB)

| Requirement | Table.column | Assert | FE consumer | Journey / UF |
|-------------|--------------|--------|-------------|--------------|
| BR-HRM-MD-01 · AC-HRM-PICKER-01 | `employee_work_timeline.position_key` | `HRM-WH-POS-KEY` | WorkHistory / WorkTimeline | UF-HRM profile career · J-* HRM profile |
| FR-HRM-SC-POS-01 #5/#6 | same + decisions/contracts/postings keys | per §3–7 | CatalogSearchPicker | Settings → picker |
| UC-HRM-27 H-DEC-CREATE | `hr_decisions.position_key` (+ type) | DEC codes | Decisions.tsx | UC-HRM-27 |
| FR-CI-01 | `employee_contracts.position_key` | CON codes | EmployeeContracts | UF-HRM-CI |
| Lane B menu bind | `job_postings.position_key` · `headcount_proposals.position_key` | JP/HCP | JobPostingsTab / HeadcountProposalTab | Rec menu (not FR-RC-01) |
| Pattern employees | `employees.job_title_key` | `HRM-EMP-JOB-TITLE` | EmployeeFormDialog | must_keep OK |

---

## 10. Data quality risks & mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Legacy free-text rows | Analytics / filter by key incomplete | Dual-read: prefer key→label; snapshot fallback; optional backfill WI after FE |
| FE contracts fields beyond keys | Schema/FE drift | E1-A ships keys+min snapshots; residual CI columns = separate WI |
| Confusing `job_title_key` vs `position_key` | Wrong DTO bind | Naming lock § header; CODE-MEMORY must cite |
| Binding FR-RC-01 to job_postings | Spec regression | Explicit must_keep §5 |
| Migration applied in governance WI | Process fail | **Cấm apply** — Dev-BE owns `ensureSchema` / migration in execution WI |

---

## 11. Acceptance (DB plane — after Dev WI)

| Check | PASS |
|-------|------|
| `\d` / information_schema shows new `*_key` columns on A–E | Yes |
| No hard FK to catalog item tables | Soft only |
| New writes reject invent-only position | Assert tests green |
| Job-templates assert still green | Regression |
| This file + API_DESIGN cited in Dev `spec_read_ack` | Yes |

---

## 12. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| Soft `*_key` = catalog `code` | Free-text SoT for position |
| Label snapshot columns for U72 display | Raw key as only UI value |
| Employees / leave / decision_type / JD template OK paths | Overwrite Settings merge / XBOS L0 |
| Lane A requisition SoT | Claim FR-RC-01 on job_postings |
| Design-only in this WI | `apps/**` · apply migration · seed U65 |

---

## 13. DOC-DELTA pointers (APPEND merge)

| Existing design | Pointer |
|-----------------|---------|
| `DB_DESIGN_HRM_SETTINGS_CATALOG.md` §10 | Consumers now include WH/DEC/JP/HCP/CI `position_key` — see this file |
| `DB_DESIGN_HRM_W2_SLICE.md` §B | ADD `position_key` / `signer_position_key` |
| `DB_DESIGN_HRM_CONTRACTS_INS.md` | ADD position/signer key columns §7 |
| `DB_DESIGN_HRM_EMPLOYEES.md` | Pattern cite only — no column change |
| `DB_DESIGN_HRM_RECRUITMENT.md` | Lane B leftover bind — not Lane A SoT |
