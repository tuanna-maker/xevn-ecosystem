# API_DESIGN — HRM Employees list / get / create / update (+ summary cross-ref)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-EMPLOYEES-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.1 FR-HRM-EM-01** Diễn biến #1–#9 · team **UC-HRM-21** · display `SRS_FIELD_DISPLAY.md` (FE only) |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.1** |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` · headcount keys `DB_DESIGN_HRM_CO_HC.md` |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `/employees`, `/employees/{employeeId}`, `/employees/summary` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API slice before Dev claim on Employees CRUD |
| **Date** | 2026-07-27 |
| **Runtime** | `EmployeesController` · `EmployeesService` · `resolveHrmListScope` |

> **must_keep:** `company_id` TEXT slug Plane B · dual-plane · **scope parity list ↔ get-by-id ↔ summary** (U19) · U72 labels = FE.  
> **Cấm:** filter/persist LE UUID as workforce SoT; PASS QA bằng seed.

Prefix: `/api/hrm`

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS |
|---|----------------|--------------|-------------|
| 1 | `GET /employees` | `HRM-EMP-200` (directory `HRM-EMP-DIR-200`) | UC-HRM-21 · FR-EM-01 #8 |
| 2 | `GET /employees/{employeeId}` | `HRM-EMP-200` | FR-EM-01 #8/#9 |
| 3 | `POST /employees` | `HRM-EMP-201` | FR-EM-01 #7 |
| 4 | `PATCH /employees/{employeeId}` | `HRM-EMP-202` | FR-EM-01 update path (same hồ sơ) |
| 5 | `GET /employees/summary` | `HRM-EMP-SUMMARY-200` | **Cross-ref only** → `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` · UC-HRM-CO-01 |

Related (not full F.1 redefinition): `POST …/archive` → `HRM-EMP-203` · `POST …/restore` → `HRM-EMP-204` — same scope helpers; soft-archive columns in DB_DESIGN.

---

## 1. Endpoint — List employees

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/employees` |
| Query | `company_id` (`main` \| slug), `keyword`/`q`, `status`, `include_archived`, `page`, `page_size`, optional `cursor` (CD-FB-05), `view=directory` |
| Headers | `x-tenant-id`, `x-company-id` |
| Auth | Bearer / internal API key |
| Success | `200` · **`HRM-EMP-200`** · page envelope; directory → **`HRM-EMP-DIR-200`** |
| Runtime | `listEmployees` / `listEmployeeDirectory` · `buildEmployeeListFilters` |

### Mục đích

Cấp **danh sách hồ sơ nhân viên** trong phạm vi JWT / đơn vị để:

1. Embed Command Center **UC-HRM-21** (bảng NV).
2. Form chọn NV (HĐ/BH/công) và sau **F5** xác nhận hồ sơ vừa tạo (FR-EM-01 #8).
3. Mobile directory (`view=directory`) — cùng scope ladder, sort khác.

### Nghiệp vụ xử lý

1. Auth (`HRM-AUTH-001` nếu thiếu).
2. `resolveScopeContext` + **`resolveHrmListScope`** — **same helper** as get-by-id and summary.
3. `company_id=main` → rollup five operating slugs; single slug → filter that slug; known pilot UUID → merge to slug; unknown UUID dropped (never treat as LE workforce key).
4. Default `archived_at IS NULL`; optional status/keyword; OFFSET or keyset cursor (not with directory).
5. Empty page = **honest empty** (not error) — UC-HRM-21 alternate.
6. Map rows: include `company_id` slug + `company_display_name` VI companion (not Khối*).
7. Does **not** join `xbos_legal_entity` for list SoT.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / sequence | API role |
|---|---------|----------------------|----------|
| 1 | **UC-HRM-21** | GET list theo scope → bảng | **This endpoint** |
| 2 | **FR-HRM-EM-01** | #2 mở form (entry từ list) | Upstream UI |
| 3 | **FR-HRM-EM-01** | **#7** Thành công — hồ sơ trên danh sách | Read-back after create |
| 4 | **FR-HRM-EM-01** | **#8** Tải lại trang — hồ sơ vẫn còn | **This endpoint** + F5 |
| 5 | **FR-HRM-EM-01** | #1 auth fail | 401 path |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `company_id=main` \| slug | `resolveHrmListScope` → `company_id = ANY(slugs)` |
| `include_archived` | Drop / keep `archived_at IS NULL` |
| `status` | `employees.status` |
| `keyword` | `full_name` / `email` / `employee_code` ILIKE |
| `cursor` | Keyset on `(created_at, id)` — `HRM-EMP-CURSOR-001/002` on invalid |

### Response DTO ↔ DB

| Wire | DB / rule | UI |
|------|-----------|-----|
| `id` | PK | Row key / deep link |
| `company_id` | TEXT slug | Scope; **F-08** style display via `company_display_name` |
| `company_display_name` | Derived VI map | Cột đơn vị |
| `employee_code`, `full_name`, `email` | Columns | List cells |
| `job_title_key` | Column | **U-02** FE → catalog label |
| `status` | Column | Badge (dictionary FE) |
| `hired_at` | DATE | `dd/MM/yyyy` |
| `custom_fields.*` | JSONB | Profile columns; U72 maps gender/employment_type |
| `manager_id`, `avatar_url`, timestamps | Columns | Detail |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Scope mismatch | `SCOPE_CONTEXT_MISMATCH` / scope | 409 |
| Invalid cursor | `HRM-EMP-CURSOR-001` | 400 |
| Cursor + directory | `HRM-EMP-CURSOR-002` | 400 |
| Empty | `HRM-EMP-200` + `items=[]` / `total=0` | 200 |

### FE after 2xx (U65)

Bảng cập nhật · empty state trung thực · F5 giữ · không mock khi API 200 (BR-MOCK-*).

---

## 2. Endpoint — Get employee by id

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/employees/{employeeId}` |
| Query | `company_id`, optional `include_archived`, directory flags |
| Success | **`HRM-EMP-200`** |
| Runtime | `getEmployeeById` · `queryEmployeeById` + **same** `resolveHrmListScope` |

### Mục đích

Cấp **chi tiết một hồ sơ** trong phạm vi để màn detail / deep link / khóa mang sang HĐ·BH·công — **không** trả hồ sơ ngoài JWT scope (kể cả đoán UUID).

### Nghiệp vụ xử lý

1. Auth + scope resolve — **identical family** to list (`resolveHrmListScope`).
2. Load by `id` **and** scope filters (company slug set + tenant partition).
3. Master partition miss → optional skip-tenant retry (existing parity) then 404.
4. Out of scope / missing → **`HRM-EMP-404`** (not leak other tenant).
5. Directory profile variant may enrich attendance-today — still same scope gate.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-EM-01** | **#8** tải lại / mở chi tiết cùng đơn vị | **This endpoint** |
| 2 | **FR-HRM-EM-01** | **#9** khóa mang (`id` / mã) | Response body |
| 3 | **FR-HRM-EM-01** | #1 ngoài phạm vi | 404/401 |
| 4 | **UC-HRM-21** | List → detail deep link (J-HRM-02) | L2.5 |

### Response DTO ↔ DB

Same Employee map as list row (full fields) — see §1 table. Path `employeeId` = `employees.id`.

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not in scope / missing | `HRM-EMP-404` | 404 |
| Auth | `HRM-AUTH-001` | 401 |
| Scope header conflict | scope / 409 | 409 |

### Scope parity (normative)

| Pair | Rule |
|------|------|
| `GET /employees` ↔ `GET /employees/{id}` | **Same** `resolveHrmListScope` + tenant partition |
| `GET /employees/{id}` ↔ `GET /employees/summary` | Same scope helper — summary never broader than list |
| Update/archive | `assertResourceInHrmScope` after get |

**FAIL GO** if get-by-id ignores list rollup / uses LE UUID filter while list uses slug.

---

## 3. Endpoint — Create employee

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/employees` |
| Body | `CreateEmployeeDto` |
| Success | `201` envelope · **`HRM-EMP-201`** |
| Runtime | `createEmployee` · `resolveHrmPersistCompanyIdText` |

### Mục đích

Cho phép HCNS **tạo hồ sơ nhân viên mới** trong đơn vị được cấp: ghi `public.employees`, hiện trên list, F5 còn, khóa `id`/`employee_code` mở FR hợp đồng / BH / công.

### Nghiệp vụ xử lý

1. Auth — Diễn biến **#1**.
2. Validate DTO: `company_id`, `employee_code`, `email`, `full_name` required (current); optional `job_title_key`, `hired_at`, `custom_fields`, `avatar_url`.
3. Persist company: **`resolveHrmPersistCompanyIdText`** → TEXT slug (`main`→`holding`); **never** LE UUID column type.
4. Scope check via `resolveHrmListScope` (Quy tắc-1 — chỉ đơn vị được cấp).
5. Stamp `custom_fields.tenant_id` from scope when missing.
6. Catalog: `assertJobTitleKeyInCatalog` when `job_title_key` set — fail → **`HRM-EMP-JOB-TITLE`** (Diễn biến **#6**).
7. `INSERT` row `status=active` default; unique violation → **`HRM-EMP-DUPLICATE`** (Diễn biến **#5**).
8. Return mapped employee (Diễn biến **#7**).

**Known gaps vs SRS (document, do not silently “fix” in design):** G-EM-01 code always required; G-EM-02 `hired_at` optional; G-EM-03 email always required; G-EM-04 status catalog — see TechSpec §14.1.

### Tham chiếu bước SRS

| # | FR-HRM-EM-01 Diễn biến | API role |
|---|------------------------|----------|
| 1 | Auth / ngoài phạm vi | Guard |
| 2–3 | Mở form + chọn PB/chức danh | FE + Settings catalogs (not this POST) |
| 4 | Thiếu bắt buộc | Validation 400 |
| 5 | Trùng mã NV | **`HRM-EMP-DUPLICATE`** |
| 6 | Danh mục hết hiệu lực | **`HRM-EMP-JOB-TITLE`** |
| **7** | **Lưu thành công** | **This endpoint** |
| **8** | Tải lại trang | GET list/get |
| 9 | Khóa mang | Response `id` / `employee_code` / `company_id` |

### DTO ↔ DB

| Request | DB column | Notes |
|---------|-----------|-------|
| `company_id` | `company_id` TEXT | Normalized slug |
| `employee_code` | `employee_code` | Trim; UK per company |
| `email` | `email` | Lower trim |
| `full_name` | `full_name` | Trim |
| `job_title_key` | `job_title_key` | Catalog code |
| `hired_at` | `hired_at` | `yyyy-MM-dd` wire; UI `dd/MM/yyyy` |
| `custom_fields` | `custom_fields` | Merge + tenant_id |
| `avatar_url` | `avatar_url` | Optional |
| — | `id` | Server UUID |
| — | `status` | Default `active` |
| — | `manager_id` | Not on Create DTO today |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Validation | pipe / `HRM-EMP-001` | 400 |
| Duplicate code/email | **`HRM-EMP-DUPLICATE`** | 409 |
| Job title ∉ catalog | **`HRM-EMP-JOB-TITLE`** | 400 |
| Auth / scope | `HRM-AUTH-001` / scope | 401/403/409 |

### FE after 2xx (U65)

Toast lưu OK · row trên list (họ tên, mã) · **F5 còn** · Network `HRM-EMP-201` · khóa mở CI/AT.  
**U72:** không hiện raw `gender`/`full_time` trên UI — FE dictionary.

---

## 4. Endpoint — Update employee

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/employees/{employeeId}` |
| Body | `UpdateEmployeeDto` (partial) |
| Success | **`HRM-EMP-202`** |
| Runtime | `updateEmployee` · get-by-id scope + `assertResourceInHrmScope` |

### Mục đích

Cho phép HCNS (hoặc ESS self theo policy) **cập nhật hồ sơ** đã tồn tại trong phạm vi — email, tên, chức danh, ngày vào, avatar, `custom_fields` — giữ `company_id` / `employee_code` ổn định trừ khi product mở đổi mã (không trong DTO hiện tại).

### Nghiệp vụ xử lý

1. Auth + `resolveScopeContext`.
2. Load existing via **get-by-id scope** (`resolveHrmListScope`) — parity with list.
3. `assertResourceInHrmScope` → **`HRM-EMP-404`** / **`HRM-EMP-409`**.
4. `assertEmployeeUpdateAllowed` (self vs manager/HR roles).
5. Optional fields: email, full_name, job_title_key (+ catalog assert), hired_at, avatar_url, custom_fields (self merges phone keys only).
6. No fields → **`HRM-EMP-002`**.
7. `UPDATE` + `updated_at`; return mapped row.
8. Does **not** change `company_id` via this DTO (prevent Plane B drift).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-EM-01** | #8 duy trì hồ sơ sau F5 / sửa form | **This endpoint** |
| 2 | **FR-HRM-EM-01** | #4 thiếu bắt buộc khi clear required | Validation |
| 3 | **FR-HRM-EM-01** | #6 danh mục chức danh | `HRM-EMP-JOB-TITLE` |
| 4 | **FR-HRM-EM-01** | #1/# phạm vi | 404/409 |
| 5 | **UC-HRM-21** | Detail save → list refresh | Read-back GET |

(Create-focused Diễn biến #7 is POST; PATCH is the mutate path for existing hồ sơ under same FR/UC.)

### DTO ↔ DB

| Request | DB | Notes |
|---------|-----|-------|
| `email` | `email` | Lower trim |
| `full_name` | `full_name` | |
| `job_title_key` | `job_title_key` | Catalog assert |
| `hired_at` | `hired_at` | |
| `custom_fields` | `custom_fields` | Self phone merge |
| `avatar_url` | `avatar_url` | null clears |
| — | `company_id` / `employee_code` | **Immutable** on this API |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| No fields | `HRM-EMP-002` | 400 |
| Not found / out of scope | `HRM-EMP-404` | 404 |
| Scope mismatch on resource | `HRM-EMP-409` | 409 |
| Job title invalid | `HRM-EMP-JOB-TITLE` | 400 |
| Duplicate email on unique | `HRM-EMP-DUPLICATE` / 23505 | 409 |
| Auth / forbidden self | auth / policy | 401/403 |

### FE after 2xx

Toast cập nhật · detail/list phản ánh field mới · F5 còn · U72 labels trên gender/employment_type/department.

---

## 5. Cross-ref — Employee summary (headcount)

**Canonical F.1:** [`API_DESIGN_HRM_EMPLOYEES_SUMMARY.md`](./API_DESIGN_HRM_EMPLOYEES_SUMMARY.md)  
**DB keys:** [`DB_DESIGN_HRM_CO_HC.md`](./DB_DESIGN_HRM_CO_HC.md)

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/employees/summary` |
| Success | `HRM-EMP-SUMMARY-200` |
| Mục đích (tóm tắt) | Card «Tổng nhân viên» + `by_company[].total` theo **slug** — không LE UUID |
| Bước SRS | **UC-HRM-CO-01** Diễn biến #4–#6 (không thay FR-EM-01 create) |
| Scope parity | **Same** `resolveHrmListScope` as `GET /employees` |

Dev/QA Employees CRUD waves **must** cite this summary file when touching Company headcount; do not duplicate F.1 body here.

---

## 6. Scope parity gate (U19)

| Endpoint | Scope helper |
|----------|--------------|
| `GET /employees` | `resolveHrmListScope` + `buildEmployeeListFilters` |
| `GET /employees/{id}` | `resolveHrmListScope` + `queryEmployeeById` |
| `GET /employees/summary` | `resolveHrmListScope` + aggregate filters |
| `POST /employees` | Persist slug + create-in-scope |
| `PATCH` / archive / restore | get-by-id + `assertResourceInHrmScope` |

Evidence: `hrm-list-scope.spec.ts` · `be-hrm-co-emp-count-01` · browser J-HRM-02 list→detail.

---

## 7. Display / U72 (explicit non-goal for BE)

| Concern | Owner |
|---------|-------|
| F-01 gender, F-02 employment_type, U-02 department/job title labels | **dev-fe** + `SRS_FIELD_DISPLAY.md` |
| Optional `*_label` companions | P2 BE — not required this ADD |
| Raw codes in JSON API | **Allowed** on wire; **forbidden** as end-user visible without dictionary |

---

## 8. QA evidence expectations (U65 · browser)

```markdown
### UF-HRM-EM-01 — Tạo / xem hồ sơ NV
- Persona / URL: ceo@xe.vn · /command-center/hrm/employees (hoặc app create)
- Action: Thêm hồ sơ → nhập bắt buộc → Lưu
- Network: POST /api/hrm/employees → 201 HRM-EMP-201 (company_id slug, not LE UUID)
- FE sau 2xx: row họ tên + mã; toast OK
- F5 / GET list: còn · GET by id cùng scope 200
- Labels: không raw male/full_time trên UI (U72)
- Verdict: 🟢 / 🟡 / 🔴
- spec_ref: FR-HRM-EM-01 Diễn biến #7–#8 · UC-HRM-21 · DB_DESIGN_HRM_EMPLOYEES · API_DESIGN_HRM_EMPLOYEES
```

**Cấm seed** để có row rồi claim PASS.

---

## 9. Out of scope / must_keep

| must_keep | forbidden |
|-----------|-----------|
| CO-HC summary F.1 pair | Redefine `by_company` LE UUID |
| TEXT slug persist | Persist LE UUID on `company_id` |
| Scope parity list↔get | Get-by-id without list resolver |
| Industry / Settings / Leave design files | Wipe |
| U72 FE labels | Require BE label rewrite this wave |

**Out of scope:** profile sub-APIs (degrees/assets/skills/…); OpenAPI deepen optional residual; closing G-EM-01..04 (BA/Dev product delta).
