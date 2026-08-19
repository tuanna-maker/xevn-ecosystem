# DB_DESIGN — HRM Employees master (Plane B workforce)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-EMPLOYEES-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.1 FR-HRM-EM-01** Diễn biến #1–#9 · team `docs/hrm/SRS.md` **UC-HRM-21** (embed list) · display `docs/hrm/SRS_FIELD_DISPLAY.md` F-01/F-02/U-01/U-02 (FE labels — out of BE persist) |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.1** FR-EM-01 · §17 spine `employees` · dual-plane **§19** (headcount keys subset) |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_EMPLOYEES.md` · headcount slice `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` |
| **ref_align** | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` — **same** `company_id` TEXT slug Plane B (must_keep) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on Employees CRUD / list scope |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `EmployeesService.ensureSchema` (`CREATE TABLE IF NOT EXISTS` + indexes) |

> **must_keep:** `company_id` = **TEXT operating slug** ∈ `{holding, trsport, logistics, finance, services}` — **never** XBOS `xbos_legal_entity.id` (UUID) as persist key. Dual-plane with Company list (Plane A). U72 field labels = **FE dictionary** — this file does not invent VI labels.

> **Orthogonal:** Headcount aggregation semantics live in `DB_DESIGN_HRM_CO_HC.md`. This file owns **full master row** for CRUD + list/get scope.

---

## 1. Table SoT

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`employees`** |
| Owner service | HRM (`hrm-api` · `EmployeesService`) |
| Consumers | Embed UC-HRM-21 · create FR-EM-01 · profile tabs · leave/contracts soft FK · `GET /employees/summary` · mobile directory |
| Non-owner | XBOS legal entity — must not store workforce rows |

---

## 2. Columns (physical)

| Column | Type | Null | Meaning (VI) | Scope / CRUD role | `ref_srs` |
|--------|------|------|--------------|-------------------|-----------|
| `id` | UUID PK | NO | Khóa hồ sơ NV | Path `:employeeId`; khóa mang CI/AT | FR-EM-01 #9 |
| **`company_id`** | **TEXT NOT NULL** | NO | **Operating slug Plane B** | Persist via `resolveHrmPersistCompanyIdText`; list/get filter via `resolveHrmListScope` | FR-EM-01 Quy tắc-1 · VAL-CO-HC-02 |
| `employee_code` | TEXT NOT NULL | NO | Mã NV trong đơn vị | UK với `company_id`; Diễn biến #5 trùng | FR-EM-01 #5 |
| `email` | TEXT NOT NULL | NO | Email (normalize lower) | UK active per slug | FR-EM-01 input |
| `full_name` | TEXT NOT NULL | NO | Họ và tên | List/detail paint | FR-EM-01 #4/#7 |
| `job_title_key` | TEXT | YES | Mã chức danh catalog | Soft → Settings `job_titles` / positions; assert on create/update | FR-EM-01 #3/#6 · FR-HRM-SC-* |
| `manager_id` | UUID | YES | Quản lý trực tiếp | **Soft FK** → `employees.id` (app-enforced; idx partial) | Org chart / directory |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` \| `inactive` (CHECK) | List filter; archive sets `inactive` | FR-EM-01 trạng thái · G-EM-04 residual |
| `hired_at` | DATE | YES | Ngày vào làm | SRS bắt buộc (G-EM-02: DTO optional today) | FR-EM-01 #4 |
| `archived_at` | TIMESTAMPTZ | YES | Soft-archive | Default list excludes; restore clears | UC-HRM-21 alternate |
| `avatar_url` | TEXT | YES | Ảnh đại diện | Create/update optional | Profile |
| `custom_fields` | JSONB NOT NULL DEFAULT `{}` | NO | Tenant + profile bag | `tenant_id` partition; `department`, `gender`, `employment_type`, `work_location`, phone keys, … | FR-EM-01 · SRS_FIELD_DISPLAY F-01/F-02/U-* (display FE) |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY | — |

### 2.1 Normative `company_id` (Plane B) — align CO-HC

| Slug | Notes |
|------|--------|
| `holding` \| `trsport` \| `logistics` \| `finance` \| `services` | `HRM_GROUP_MEMBER_COMPANY_SLUGS` |
| JWT `companyId=main` | Scope expands to **all five** — rows **never** stored as `company_id='main'` |
| Pilot UUID in request | Merge to slug before persist/filter; **cấm** emit/persist LE UUID as SoT key |

**FAIL** if product filters or COUNTs with `WHERE employees.company_id = <LE UUID>`.

### 2.2 Soft FKs / catalog soft refs

| Field | Target | Enforcement | Reject code |
|-------|--------|-------------|-------------|
| `manager_id` | `employees.id` | App (no DB `REFERENCES`) | 404/validation if invalid when set |
| `job_title_key` | Settings effective `job_titles` / positions catalog | `assertJobTitleKeyInCatalog` | **`HRM-EMP-JOB-TITLE`** |
| `custom_fields.department` (optional) | Settings `departments` code or free VI | Soft — summary groups by text | Catalog assert when product locks BR |
| Downstream | `leave_requests.employee_id`, contracts, insurance | Soft FK **to** this PK | Module-specific |

**Cấm:** hard FK cascade from XBOS LE; persist LE UUID into `company_id`.

### 2.3 `custom_fields` profile bag (storage — not U72 labels)

| Key (examples) | Stored as | UI label owner |
|----------------|-----------|----------------|
| `tenant_id` | TEXT in JSON | Internal partition (`xevn` default) |
| `department` | TEXT (code or VI snapshot) | SRS_FIELD_DISPLAY **U-02** → FE catalog label |
| `gender` | Enum TEXT `male`/`female`/`other` | **F-01** FE map Nam/Nữ/Khác |
| `employment_type` | Enum TEXT | **F-02** FE map Toàn thời gian… |
| `work_location` | TEXT | **U-01** FE |
| phone / ESS keys | TEXT | Self-update merge policy |

API returns raw codes in JSON; **U72** forbids showing raw on UI — FE concern (dispatch must_keep).

---

## 3. Indexes / constraints

| Name / definition | Purpose |
|-------------------|---------|
| `PRIMARY KEY (id)` | Row identity |
| `chk_employees_status` (`active` \| `inactive`) | Status domain |
| `uq_employees_company_code` UNIQUE `(company_id, employee_code)` | Diễn biến #5 mã trùng |
| `uq_employees_company_email_active` UNIQUE `(company_id, lower(email)) WHERE archived_at IS NULL` | Email active per slug |
| `idx_employees_company_archived_created_id` `(company_id, archived_at, created_at DESC, id DESC)` | List OFFSET/keyset · CO-HC scans |
| `idx_employees_company_archived_name_code_id` | Directory sort |
| `idx_employees_tenant_co_arch_created_id` expression `(COALESCE(tenant_id,'xevn'), company_id, archived_at, …)` | Master partition + slug rollup |
| `idx_employees_manager` `(manager_id) WHERE manager_id IS NOT NULL` | Org walk |

**This ADD does not require a new migration** when schema already matches `ensureSchema`. Dev verifies `\d public.employees` before claiming FR-EM-01 PASS.

**Read-only probe:**

```sql
SELECT company_id, COUNT(*) FILTER (WHERE archived_at IS NULL) AS n
FROM public.employees
WHERE company_id = ANY (ARRAY['holding','trsport','logistics','finance','services'])
GROUP BY 1 ORDER BY 1;

-- Defect: LE UUID keyed rows
SELECT COUNT(*) AS wrongly_keyed
FROM public.employees
WHERE company_id ~* '^[0-9a-f]{8}-';
```

---

## 4. Identity dual-plane (mandatory)

```text
Plane A (XBOS):  xbos_legal_entity.id UUID — Company profile / industry
Plane B (HRM):   employees.company_id TEXT slug — workforce master + COUNT
Bridge:          LE → operating_slug (BR-INT-05) before Company headcount bind
```

| Pattern | Verdict |
|---------|---------|
| Persist / filter / get-by-id scope via slug ladder | **REQUIRED** |
| `employees.company_id = xbos_legal_entity.id` | **FORBIDDEN** |
| Change `company_id` type to UUID | **FORBIDDEN** |

Full headcount aggregation → `DB_DESIGN_HRM_CO_HC.md` §5.

---

## 5. Scope keys (list ↔ get parity)

| Helper | Use |
|--------|-----|
| `resolveHrmListScope` | List, get-by-id, summary, archive/restore assert |
| `resolveHrmPersistCompanyIdText` | Create persist (`main` → `holding`) |
| `pushEmployeeListScopeFilters` | SQL `company_id = ANY(…)` + tenant partition |
| `assertResourceInHrmScope` | Update/archive — 404 vs 409 mismatch |

**Invariant (U19):** get-by-id **must** use the **same** scope resolver family as list. Divergence = block TM/QC GO.

---

## 6. Acceptance (DB plane)

| Check | PASS |
|-------|------|
| `company_id` type TEXT | information_schema |
| UK `(company_id, employee_code)` exists | `\d` |
| Sample rows use only five slugs (orphans owned) | GROUP BY |
| LE UUID key count ≈ 0 | anti-join probe |
| Soft `manager_id` index present | `\d` |
| U65 | No seed mutate for UF evidence |

---

## 7. Out of scope / must_keep

| must_keep | forbidden / out of scope |
|-----------|--------------------------|
| `DB_DESIGN_HRM_CO_HC` headcount keys + anti LE UUID | Wipe CO-HC / industry pairs |
| TEXT slug persist | Migration `company_id` → UUID |
| Soft catalog job_title | Hard FK to XBOS tables |
| U72 labels as FE | Invent BE `*_label` requirement in this wave |
| Profile sub-resources (degrees, assets, …) | Separate tables — not this slice |
| Archive/restore columns | Documented above; API detail in API_DESIGN related § |

**Gaps retained (TechSpec §14.1 — not closed by this ADD):** G-EM-01 code required vs SRS optional; G-EM-02 hired_at optional vs SRS required; G-EM-03 email always required; G-EM-04 status catalog mapping — Dev backlog with BA if product tightens.
