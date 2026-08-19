# API_DESIGN — HRM Operations (tasks + reports summary)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-OPERATIONS-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.45–3.48 FR-HRM-OP-01..04** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.5** rows 45–48 · envelope `HRM-OPS-*` (≠ UC mã `HRM-OP-*`) |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `/operations/tasks*` · `/operations/reports/summary` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API before Dev claim on OP-01..04 |
| **Date** | 2026-07-27 |
| **Runtime** | `OperationsController` · `OperationsService` |

> **must_keep:** UUID persist + slug map · empty 200 honesty · U65 no seed · do not rewrite W2/Payroll/Leave/ATT/Auth/RACI/WF/catalog-gov/KPI.  
> **Cấm:** PASS QA bằng seed tasks; claim assignee/filter DONE (G-OP-01/02); Phase1/PROD claim.

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS |
|---|----------------|--------------|-------------|
| **A** | `POST /api/hrm/operations/tasks` | `HRM-OPS-201` | **FR-HRM-OP-01** #5/#6/#8 |
| **B** | `GET /api/hrm/operations/tasks` | `HRM-OPS-200` | **FR-HRM-OP-02** #2/#3/#8 |
| **C** | `PATCH /api/hrm/operations/tasks/{taskId}/status` | `HRM-OPS-202` | **FR-HRM-OP-03** #6/#7/#8 |
| **D** | `GET /api/hrm/operations/reports/summary` | `HRM-OPS-200` | **FR-HRM-OP-04** #4/#5/#8 |

**Cross-cite (no duplicate F.1 body):**

| Topic | Canonical |
|-------|-----------|
| Service-request CRUD/approve | TechSpec §16.3 **FR-HRM-11** · runtime `…/operations/service-requests*` — twin counted in §D |
| ATT / Payroll / Recruitment counts in summary | `API_DESIGN_HRM_ATT_SHEET` · `API_DESIGN_HRM_PAYROLL` · `API_DESIGN_HRM_RECRUITMENT` (DDL must_keep) |

**Note:** Dedicated `GET …/tasks/:id` **non-goal** in TechSpec (detail via list row). Scope on mutate uses load-by-id + `assertResourceInHrmScope` (parity with list).

---

## 0.1 Shared error — dual-plane anti-join LE (`HRM-PLANE-409`)

> **ADD** `BA-HRM-OP-PLANE-409-DOC-01` (2026-07-27) — document **runtime SoT** already shipping in `hrm-list-scope` / `OperationsService`. **No new FR.** Closes QC Info residual **C-OP-PLANE-API-DESIGN-409**.

### Identity (runtime)

| Item | Value |
|------|--------|
| **Code** | **`HRM-PLANE-409`** |
| **HTTP** | **409** (`HttpStatus.CONFLICT`) |
| **Message (default)** | `company_id UUID is not an HRM pilot mapped UUID (XBOS legal-entity id rejected)` |
| **Helper** | `assertHrmMappedCompanyUuidOrThrow` · `OperationsService.assertOperationsCompanyWire` |
| **Map SoT** | `HRM_COMPANY_UUID_BY_SLUG` (Plane B′); XBOS LE UUID = Plane A ∉ map |

### Mục đích

Fail-closed khi wire `company_id` là **UUID pháp nhân XBOS (Plane A)** không thuộc map pilot HRM — **cấm** list/summary trả `200` + `total=0` / zeros giả (undercount), **cấm** INSERT task với khóa LE.

### Nghiệp vụ xử lý

1. Caller gửi `company_id` dạng UUID.
2. BE kiểm tra UUID ∈ values of `HRM_COMPANY_UUID_BY_SLUG` (Plane B′).
3. Nếu **không** ∈ map (typical: XBOS LE UUID) → throw **`HRM-PLANE-409`** / **409** — **trước** SQL list / COUNT / INSERT.
4. Happy path không đổi: slug `holding`\|`trsport`\|… hoặc `main` → map UUID → 2xx; persist `company_id` = mapped UUID.

### Applies to (OP)

| Endpoint | When | Reject before |
|----------|------|---------------|
| `POST /api/hrm/operations/tasks` | body `company_id` = LE / unmapped UUID | INSERT `hrm_tasks` |
| `GET /api/hrm/operations/tasks` | query `company_id` = LE / unmapped UUID | `FROM public.hrm_tasks` |
| `GET /api/hrm/operations/reports/summary` | query `company_id` = LE / unmapped UUID | COUNT aggregates (no fake 0) |

**Out of this code name:** JWT/header scope mismatch trước plane guard → `SCOPE_CONTEXT_MISMATCH` (vẫn fail-closed, không 200/0). PATCH status dùng **`HRM-OPS-409`** (resource scope) — **khác** `HRM-PLANE-409`.

### Tham chiếu bước SRS (existing FR — no invent)

| FR | Diễn biến | Role of `HRM-PLANE-409` |
|----|-----------|-------------------------|
| **FR-HRM-OP-01** | **#4** Ngoài quyền / ĐV không hợp lệ cho persist | LE UUID ∉ map = reject create |
| **FR-HRM-OP-02** | **#2** Mở danh sách đúng phạm vi | LE wire = reject list (not empty fake) |
| **FR-HRM-OP-04** | **#4 / #5 / #7** Tổng hợp đúng phạm vi · empty trung thực · không lẫn ĐV | LE wire = reject summary (not zeros) |

**Control:** `DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.4 · evidence `be-hrm-op-dual-plane-guard-01` · `qc-hrm-op-dual-plane-01`.

---

## A. Endpoint — Create operations task

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/operations/tasks` |
| Body | `CreateTaskDto` (`company_id`, `title`, `description?`, `priority`, `due_date?`) |
| Success | `201` · **`HRM-OPS-201`** |
| Runtime | `createTask` · `resolveHrmOperationsPersistCompanyId` |

### Mục đích

**Tạo công việc vận hành** trong đơn vị được cấp để hiện dòng mới trên danh sách cùng phiên và mở khóa cập nhật trạng thái (OP-03) — không tạo giả số liệu báo cáo.

### Nghiệp vụ xử lý

1. Auth internal/JWT — thiếu / hết phiên → `HRM-AUTH-001` (OP-01 #1).
2. Validate `title` bắt buộc + `priority` ∈ low|medium|high; thiếu tiêu đề → 400 (OP-01 #3).
3. Map `company_id` slug/`main` → UUID persist (`resolveHrmOperationsPersistCompanyId`); ngoài quyền → 401/409 family (OP-01 #4).
4. Nếu `company_id` là UUID **không** ∈ `HRM_COMPANY_UUID_BY_SLUG` (XBOS LE / unknown) → **`HRM-PLANE-409`** / **409** — không INSERT (§0.1).
5. INSERT `status='todo'`; return row (`id` = khóa mang) (OP-01 #5/#8).
6. **Không** persist assignee / task_type — residual **G-OP-01** (SRS optional fields chưa có cột/DTO).
7. Không side-effect seed hoặc auto-assign ngoài body.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-OP-01** | **#1** Auth / hết phiên | Guard |
| 2 | **FR-HRM-OP-01** | **#3** Thiếu tiêu đề | 400 validation |
| 3 | **FR-HRM-OP-01** | **#4** Ngoài quyền ĐV | Scope / 409 |
| 4 | **FR-HRM-OP-01** | **#5** Lưu OK — có mã việc | **This endpoint** |
| 5 | **FR-HRM-OP-01** | **#6** List sau Lưu | Client + GET list |
| 6 | **FR-HRM-OP-01** | **#7** Assignee ngoài ĐV | Residual G-OP-01 (no field) |
| 7 | **FR-HRM-OP-01** | **#8** Thành công cuối | Response `id` |

### Request ↔ DB

| Body | Column |
|------|--------|
| `company_id` (slug) | `company_id` UUID (mapped) |
| `title` | `title` |
| `description?` | `description` |
| `priority` | `priority` |
| `due_date?` | `due_date` |
| *(default)* | `status = 'todo'` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Validation | class-validator | 400 |
| Scope conflict (JWT vs wire) | `SCOPE_CONTEXT_MISMATCH` / OPS family | 409 |
| `company_id` = XBOS LE UUID / UUID ∉ HRM map | **`HRM-PLANE-409`** | **409** |

### FE after 2xx (U65)

Dòng task mới trên list cùng phiên · F5 còn · không seed · empty trước tạo hợp lệ.

---

## B. Endpoint — List operations tasks

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/operations/tasks` |
| Query | `ListTasksQueryDto` (`company_id`, `page?`, `page_size?`) |
| Success | `200` · **`HRM-OPS-200`** · `{ total, page, page_size, data[] }` |
| Runtime | `listTasks` · `resolveHrmListScope` · `pushCompanyIdUuidFilter` |

### Mục đích

Cấp **danh sách công việc vận hành** trong phạm vi đơn vị để bảng Công việc / chọn dòng xem chi tiết (qua row) — empty trung thực khi chưa có việc.

### Nghiệp vụ xử lý

1. Auth + `resolveHrmListScope` — same family as create.
2. Wire UUID ∉ map → **`HRM-PLANE-409`** / **409** via `assertOperationsCompanyWire` — **not** `200` + empty (OP-02 #2 · §0.1).
3. Filter `company_id` UUID list (`main` → member UUIDs); never leak other units.
4. Pagination `page` / `page_size` (default 20, max 100).
5. ORDER BY `created_at DESC`.
6. Empty = `total=0`, `data=[]` — not ERROR (OP-02 #3) — chỉ khi scope slug/mapped hợp lệ.
7. Filters status/type/keyword — **not** on DTO yet → residual **G-OP-02** (SRS #4/#7).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-OP-02** | **#1** Auth | Guard |
| 2 | **FR-HRM-OP-02** | **#2** Mở danh sách | **This endpoint** |
| 3 | **FR-HRM-OP-02** | **#3** Empty trung thực | `data=[]` |
| 4 | **FR-HRM-OP-02** | **#4/#7** Lọc status/đổi lọc | Residual G-OP-02 |
| 5 | **FR-HRM-OP-02** | **#5/#6** Chi tiết trong/ngoài phạm vi | Row from list + mutate guard |
| 6 | **FR-HRM-OP-02** | **#8** List–detail khớp | Scope parity |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Empty in-scope | `HRM-OPS-200` + empty | 200 |
| Unauth | `HRM-AUTH-001` | 401 |
| `company_id` = XBOS LE UUID / UUID ∉ HRM map | **`HRM-PLANE-409`** | **409** |

### FE after 2xx

Bảng hoặc empty rõ · F5 giữ · không lộ ĐV khác.

---

## C. Endpoint — Update task status

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/operations/tasks/{taskId}/status` |
| Body | `UpdateTaskStatusDto` (`status` ∈ todo\|in_progress\|done\|blocked) |
| Headers | `x-company-id` (scope request; default runtime `main`) |
| Success | `200` · **`HRM-OPS-202`** |
| Runtime | `updateTaskStatus` · load company row · `assertResourceInHrmScope` |

### Mục đích

**Cập nhật trạng thái công việc** trong phạm vi để danh sách/chi tiết phản ánh ngay và F5 giữ trạng thái mới — phục vụ theo dõi xử lý sau khi tạo (OP-01).

### Nghiệp vụ xử lý

1. Auth — ngoài quyền / hết phiên → từ chối (OP-03 #1).
2. Load `hrm_tasks.company_id` by `taskId`; missing → **`HRM-OPS-404`**.
3. `assertResourceInHrmScope` vs requested company — mismatch → **`HRM-OPS-409`** (OP-03 #2 scope).
4. Validate `status` ∈ CHK set; invalid → 400 (OP-03 #3).
5. UPDATE `status`, `updated_at=NOW()`; return row (OP-03 #6).
6. Strict transition matrix / required note — **not** fully enforced → residual **G-OP-03** (SRS #4/#5 Info/P2).
7. Scope parity: same resolver family as list (G-SCOPE-01 on-touch).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-OP-03** | **#1** Auth / ngoài quyền | Guard |
| 2 | **FR-HRM-OP-03** | **#2** Mở việc trong phạm vi | Load + scope |
| 3 | **FR-HRM-OP-03** | **#3** Chọn trạng thái hợp lệ | DTO enum |
| 4 | **FR-HRM-OP-03** | **#4** Chuyển cấm | Residual G-OP-03 |
| 5 | **FR-HRM-OP-03** | **#5** Thiếu ghi chú bắt buộc | Residual (no note field) |
| 6 | **FR-HRM-OP-03** | **#6** Lưu OK | **This endpoint** |
| 7 | **FR-HRM-OP-03** | **#7** F5 sau Lưu | Persist VERIFY |
| 8 | **FR-HRM-OP-03** | **#8** Thành công cuối | Response status |

### Request ↔ DB

| Input | Column |
|-------|--------|
| path `taskId` | `id` |
| body `status` | `status` |
| header company | scope check only |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found | `HRM-OPS-404` | 404 |
| Scope mismatch | `HRM-OPS-409` | 409 |
| Bad status | validation | 400 |

### FE after 2xx

Status mới trên list+detail · F5 giữ · không đổi việc ngoài scope.

---

## D. Endpoint — Operations reports summary

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/operations/reports/summary` |
| Query | `tenant_id` + `company_id` (required by controller scope context) |
| Success | `200` · **`HRM-OPS-200`** |
| Runtime | `getSummary` · multi-table `countByScope` |

### Mục đích

Cấp **chỉ số tổng hợp vận hành** theo phạm vi đơn vị (tasks + service_requests + cross-domain counts) cho màn báo cáo — empty/zero trung thực khi chưa có dữ liệu (không giả số).

### Nghiệp vụ xử lý

1. Auth + `resolveScopeContext` — thiếu tenant/company → reject (OP-04 #1).
2. Wire UUID ∉ map → **`HRM-PLANE-409`** / **409** — **cấm** silent zeros (OP-04 #4/#5/#7 · §0.1).
3. `resolveHrmListScope(company_id)` — partition đúng quyền (OP-04 #6/#7).
4. Parallel COUNT:
   - `hrm_tasks` / `service_requests` — UUID mode
   - `payroll_periods` / `job_requisitions` — TEXT slug mode (must_keep pairs)
   - `attendance_records` — workforce mode (ATT must_keep)
5. Return object of numbers; zeros = empty kỳ hợp lệ (OP-04 #5) — chỉ khi slug/mapped hợp lệ.
6. Date-range / group-by status-type filters — **not** on this endpoint yet (SRS #3 optional) → FE/BA residual with **G-OP-04** bind VERIFY.
7. **Cấm** invent non-zero when COUNT=0.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-OP-04** | **#1** Auth | Guard |
| 2 | **FR-HRM-OP-04** | **#2** Mở báo cáo | Client |
| 3 | **FR-HRM-OP-04** | **#3** Kỳ không hợp lệ | Residual (no period query yet) |
| 4 | **FR-HRM-OP-04** | **#4** Tổng hợp đúng phạm vi | **This endpoint** |
| 5 | **FR-HRM-OP-04** | **#5** Empty kỳ | zeros / empty UI |
| 6 | **FR-HRM-OP-04** | **#6** Đổi ĐV lọc | Re-call with new `company_id` |
| 7 | **FR-HRM-OP-04** | **#7** Không lẫn ĐV khác | Scope filters |
| 8 | **FR-HRM-OP-04** | **#8** Thành công cuối | Response body |

### Response ↔ sources

| Field | Source |
|-------|--------|
| `tasks` | COUNT `hrm_tasks` |
| `service_requests` | COUNT `service_requests` |
| `attendance_records` | COUNT `attendance_records` |
| `payroll_periods` | COUNT `payroll_periods` |
| `job_requisitions` | COUNT `job_requisitions` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Missing tenant/company | scope context | 400 |
| Unauth | `HRM-AUTH-001` | 401 |
| Empty counts (valid slug/mapped scope) | `HRM-OPS-200` + zeros | 200 |
| `company_id` = XBOS LE UUID / UUID ∉ HRM map | **`HRM-PLANE-409`** | **409** |

### FE after 2xx (G-OP-04)

Dashboard/báo cáo bind đúng field · empty honesty · F5 ổn định · residual FE VERIFY.

---

## E. Residual register (design-time)

| ID | Sev | Owner | Exit |
|----|-----|-------|------|
| **G-OP-01** | P2 | `dev-be` | Optional assignee (+ optional task_type) columns + DTO + SRS Diễn biến #7 |
| **G-OP-02** | P2 | `dev-be` | List filters status/type/keyword |
| **G-OP-03** | Info/P2 | `ba`/`dev-be` | Strict SM + note if BA locks |
| **G-OP-04** | P2 | `dev-fe` | Summary FE bind + empty honesty VERIFY |
| **G-OP-PLANE-01** | P2 | `dev-be` | Optional UUID→TEXT slug migrate (class with G-MD-PLANE-01) |
| **C-OP-PLANE-API-DESIGN-409** | Info | `ba-process` | **CLOSED** 2026-07-27 — §0.1 names **`HRM-PLANE-409`** (runtime SoT; no new FR) |
| **G-SCOPE-01** | P0 standing | `dev-be`+`qa` | on-touch list/mutate parity tests |
| Index `hrm_tasks` | P2 | `dev-be` | ADD `idx_hrm_tasks_company_status` IF NOT EXISTS |

**Non-claims:** Phase 1 DONE · PROD-READY · UF 🟢 · seed for evidence · Fleet FL-01 (next SA) · reopen CO-HC / product GWC.
