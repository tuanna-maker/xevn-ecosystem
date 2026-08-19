# DB_DESIGN — HRM Company headcount (Plane B workforce keys)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-CO-HC-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | `docs/hrm/SRS.md` **UC-HRM-CO-01** / **FR-HRM-CO-HC-01** — Diễn biến headcount · Data Interaction `employee_count` / card «Tổng nhân viên» · **AC-CO-EMP-01..06** · **BR-CO-HC-01** · **BR-CO-EMP-01** · **BR-INT-05** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§19** (Company Headcount dual-plane) |
| **ref_control** | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §1 R2 · §3 BE contract |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` (physical column contract; style match `DB_DESIGN_HRM_COMPANY_DISPLAY.md`) |
| **U71** | Physical DB slice **before** Dev/QA claim on Company «Số nhân viên» / card Tổng NV |
| **Date** | 2026-07-27 |

> **Orthogonal to industry:** Plane A profile columns (`business_lines`, MST, founded) live in `DB_DESIGN_HRM_COMPANY_DISPLAY.md`. This file owns **workforce headcount keys only**.

---

## 1. Table SoT

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`employees`** |
| Owner service | HRM (`hrm-api` · `EmployeesService.ensureSchema`) |
| Consumers | `GET /api/hrm/employees/summary` (`by_company[]`) · Dashboard «Tổng nhân viên» · Company Management enrich (via summary, **not** join LE) |
| Non-owner | XBOS `xbos_legal_entity` — **must not** store or serve workforce headcount |

---

## 2. Columns used by headcount (physical)

| Column | Type | Null | Meaning (VI) | Headcount role | `ref_srs` |
|--------|------|------|--------------|----------------|-----------|
| `id` | UUID PK | NO | Khóa nhân viên | Row identity (not Company key) | FR-EM-* |
| **`company_id`** | **TEXT NOT NULL** | NO | **Operating slug Plane B** ∈ `{holding, trsport, logistics, finance, services}` | **SoT partition key for COUNT / `by_company[]`** | UC-HRM-CO-01 · VAL-CO-HC-02 |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` \| `inactive` (CHECK) | Feeds `active_count` / `inactive_count` | AC-CO-EMP-01 definition |
| `archived_at` | TIMESTAMPTZ | YES | Soft-archive marker | Feeds `archived_count`; default summary excludes archived unless `include_archived` | AC-HC-03 / AC-CO-EMP-01 |
| `custom_fields` | JSONB NOT NULL DEFAULT `{}` | NO | Tenant partition (`custom_fields->>'tenant_id'`) + extras | Master rollup filter via `resolveHrmListScope` | BR-CO-EMP-01 |
| `employee_code` | TEXT NOT NULL | NO | Mã NV trong slug | Uniqueness with `company_id` — not UI headcount | — |
| `email` / `full_name` | TEXT NOT NULL | NO | Identity display | List/dashboard — not Company count key | — |
| `hired_at` | DATE | YES | Ngày vào | `new_hires` aggregate (summary) — orthogonal to Company column | — |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit | List ORDER BY | — |

### 2.1 Normative value set — `company_id` (Plane B)

| Slug | Bridge (interim BR-INT-05 / TECHSPEC §19.1) | Cấm |
|------|---------------------------------------------|-----|
| `holding` | Tập đoàn XeVN / synthetic `xbos-group-holding-root` | LE UUID |
| `trsport` | CP Thương mại và Dịch vụ X.E | LE UUID |
| `logistics` | TNHH Du lịch Visun | LE UUID |
| `finance` | TNHH Du lịch X.E Việt Nam | LE UUID |
| `services` | TNHH X.E Việt Nam | LE UUID |

**Constant:** `HRM_GROUP_MEMBER_COMPANY_SLUGS` in `apps/api/hrm-api/src/common/hrm-list-scope.ts`.

**JWT `companyId=main` (Group CEO):** scope expands to **all five** slugs — operational rows are **never** stored as `company_id='main'`.

### 2.2 Semantic anti-confusion (normative)

| Key | IS | IS NOT |
|-----|----|--------|
| **`employees.company_id`** | Operating **TEXT slug** Plane B | XBOS `xbos_legal_entity.id` (UUID) |
| **`HRM_COMPANY_UUID_BY_SLUG`** | Ladder map for **UUID-typed** tables / pilot merge | Persist key on `employees.company_id` |
| **`xbos_legal_entity.id`** | Plane A legal identity for profile | Predicate for workforce COUNT |

**FAIL DB semantics if product COUNTs with `WHERE employees.company_id = <LE UUID>`.**

---

## 3. Indexes / constraints (existing — headcount path)

| Constraint / index | Purpose for CO-HC |
|--------------------|-------------------|
| `PRIMARY KEY (id)` | Row identity |
| `uq_employees_company_code` UNIQUE `(company_id, employee_code)` | Stable code per slug |
| `uq_employees_company_email_active` UNIQUE `(company_id, lower(email)) WHERE archived_at IS NULL` | Active email per slug |
| `idx_employees_company_archived_created_id` `(company_id, archived_at, created_at DESC, id DESC)` | List + count scans by slug |
| `idx_employees_company_archived_name_code_id` | Directory sort |
| `idx_employees_tenant_co_arch_created_id` expression on `(COALESCE(tenant_id,'xevn'), company_id, archived_at, …)` | Master partition + slug rollup |

**This ADD does not require a new migration** if `company_id` is already TEXT and indexes above exist (`EmployeesService.ensureSchema`). Dev verifies on target env before claiming AC-CO-EMP PASS.

**Recommended probe (read-only):**

```sql
-- Expect: counts by slug; anti-join LE UUID ≈ 0
SELECT company_id, COUNT(*) FILTER (WHERE archived_at IS NULL) AS total
FROM public.employees
WHERE COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn') = 'xevn'
  AND company_id = ANY (ARRAY['holding','trsport','logistics','finance','services'])
GROUP BY company_id
ORDER BY company_id;

-- Defect signature if UI used LE UUID as key:
SELECT COUNT(*) AS wrongly_keyed
FROM public.employees
WHERE company_id ~* '^[0-9a-f]{8}-';
```

---

## 4. Identity dual-plane note (mandatory)

```text
Plane A (XBOS legal):  xbos_legal_entity.id (UUID) + profile columns
                       → Company list name / MST / founded / industry
                       → NEVER headcount SoT

Plane B (HRM workforce): employees.company_id = operating slug TEXT
                       → COUNT / summary.by_company[].total
                       → Card «Tổng nhân viên» + cột «Số nhân viên»

Bridge (BR-INT-05):    LE display name/code → operating_slug
                       BEFORE any COUNT bind (VAL-CO-HC-01)
```

| Join pattern | Verdict |
|--------------|---------|
| `by_company[].company_id === operating_slug` (after bridge) | **REQUIRED** |
| `employees.company_id = xbos_legal_entity.id` | **FORBIDDEN** (anti-join) |
| Persist LE UUID into `employees.company_id` to “make column show numbers” | **FORBIDDEN** (breaks CARD-* / mobile ladder) |

Industry (`business_lines`) **never** lives on `employees`. Headcount **never** lives on `xbos_legal_entity`.

---

## 5. Aggregation semantics (SoT for summary)

| Metric | Predicate (default Group CEO / AC-CO-EMP) |
|--------|-------------------------------------------|
| `total` (per slug / rollup) | Rows in scope with `archived_at IS NULL` (align Dashboard AC-HC-03) unless query `include_archived=true` |
| `active_count` | `status = 'active'` ∧ non-archived (default) |
| `inactive_count` | `status = 'inactive'` ∧ non-archived (default) |
| `archived_count` | `archived_at IS NOT NULL` in scope |
| Rollup `company_id=main` | `SUM` across five slugs under `resolveHrmListScope` — **not** `WHERE company_id = 'main'` |

Zero-fill: missing slug in DB → emit `total=0` (and zero counts) in `by_company[]` for Group CEO — **honest empty**, not API fail.

---

## 6. Acceptance for Dev/QA (DB plane)

| Check | PASS |
|-------|------|
| `employees.company_id` type = TEXT | `\d public.employees` / information_schema |
| Sample workforce uses only five slugs (or orphan listed with owner) | SQL GROUP BY |
| `COUNT WHERE company_id = <known LE UUID>` ≈ 0 while slug COUNT > 0 | Anti-join probe |
| Scope helper uses same slug list as summary | `hrm-list-scope` + jest `be-hrm-co-emp-count-01` |
| U65 | No seed mutate for evidence |

---

## 7. Out of scope / must_keep

| must_keep | forbidden |
|-----------|-----------|
| Industry pair `DB_DESIGN_HRM_COMPANY_DISPLAY` / `API_DESIGN_HRM_COMPANY_LIST` | Wipe or rewrite those files |
| Dual-plane doctrine Plane A LE ≠ Plane B slug | New migration changing `company_id` to UUID |
| TECHSPEC §19 bridge table interim | Invent 6th operating slug without BR-INT-05 |
| Existing scale indexes | XBOS owning headcount column |

**Out of scope this slice:** full Employees CRUD DB_DESIGN (`SA-U71-HRM-EMPLOYEES-DESIGN-01`); payroll/salary_ranges physical design; bridge registry as separate table (code registry OK until BA locks 1:1).
