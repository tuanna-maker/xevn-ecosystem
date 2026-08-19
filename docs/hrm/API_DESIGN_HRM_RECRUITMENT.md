# API_DESIGN — HRM Recruitment (requisitions + Lane A stages)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-RECRUITMENT-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **FR-HRM-RC-01** Diễn biến · **FR-HRM-RC-03** · **FR-HRM-RC-05** · team **UC-HRM-22** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.7** · **§16.1** · **§17.6** · **§18.2** REC-WF |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_RECRUITMENT.md` |
| **ref_adr** | `docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API slice before Dev/QA claim on recruitment |
| **Date** | 2026-07-27 |
| **Runtime** | `RecruitmentController` · `RecruitmentService` · `RecruitmentWorkflowBridge` |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `/recruitment/*` (thin; codes below are SoT) |

> **must_keep:** G-RC-01 `headcount` ≥1 on **job_requisitions**; scope parity list↔get↔mutate; `workflow_instance_id` LOCK; UF-HRM-12 create-without-submit; Lane A SoT (§17.6). **must_keep** employees / CI / leave API pairs — no overwrite.

Prefix: `/api/hrm/recruitment`

---

## 1. Endpoint A — List job requisitions

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/recruitment/requisitions` |
| Success | **`HRM-REC-200`** |
| Query | `company_id`, `page`, `page_size` / `pageSize` |
| Auth | Bearer / internal business access |

### Mục đích

Cấp danh sách **yêu cầu tuyển dụng (YCTD)** trong phạm vi đơn vị để màn Tuyển dụng (embed UC-HRM-22) hiển thị tiêu đề, số lượng, trạng thái — empty trung thực khi chưa có yêu cầu.

### Nghiệp vụ xử lý

1. Auth + `resolveHrmListScope(authorization, query.company_id, scopeContext)`.
2. `ensureSchema` (idempotent).
3. `SELECT` from `job_requisitions` filtered by scoped `company_id`(s); ORDER BY `created_at DESC`; paginate.
4. Include `headcount`, `workflow_instance_id`, JD fields.
5. Empty = `200` + `total=0` + `data=[]` (not ERROR banner).
6. **Scope parity** with get-by-id / create persist slug.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-01** | **#6** dòng mới trên list · **#7** tải lại còn | Read-back SoT |
| **UC-HRM-22** | Happy list / Alternate empty | **This endpoint** |
| TechSpec §14.7 | list `HRM-REC-200` | Same |

### Response ↔ DB

| Wire | DB column | UI |
|------|-----------|-----|
| `id`, `company_id`, `title`, `department`, `employment_type` | same | Chiến dịch / vị trí |
| **`headcount`** | `headcount` | Số lượng cần tuyển |
| `status` | `status` | Badge VI (FE map) |
| `job_description`, `requirements`, `job_template_id` | same | Detail |
| `workflow_instance_id` | same | WF linked |
| `created_at`, `updated_at` | same | Sort |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Auth / scope mismatch | auth / `SCOPE_CONTEXT_MISMATCH` | 401/409 |
| Empty | `HRM-REC-200` + `[]` | 200 |

### FE after 2xx (U65)

List paint · empty honest · F5 still same scope data.

---

## 2. Endpoint B — Create job requisition

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/recruitment/requisitions` |
| Success | `201` envelope · code **`HRM-REC-201`** |
| DTO | `CreateJobRequisitionDto` |

### Mục đích

Cho phép HCNS / quản lý **tạo yêu cầu tuyển dụng** với số lượng cần tuyển bắt buộc (>0), ghi bản ghi YCTD, hiện trên danh sách để gắn ứng viên / gửi duyệt WF sau.

### Nghiệp vụ xử lý

1. Validate DTO: `company_id`, `title`, `department`, `employment_type`, **`headcount` `@IsInt` `@Min(1)`**; optional JD/requirements/`job_template_id`.
2. Persist company: `resolveHrmPersistCompanyIdText` → **TEXT slug**.
3. Defense: `headcount < 1` → **400** `HRM-REC-400`.
4. `INSERT job_requisitions` with status **`open`** (runtime; G-RC-02 vs SRS nháp = residual P1).
5. **Không** set `workflow_instance_id` (UF-HRM-12 — create ≠ submit).
6. **Không** write `job_postings.headcount` / `headcount_proposals`.
7. Return row with `headcount` for FE list bind.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-01** | #1 auth · #3 thiếu tiêu đề/SL · **#4** số lượng ≤0 · #5 danh mục · **#6 Lưu thành công** · #8 khóa YCTD | **This endpoint** |
| **UC-HRM-22** | Create path (extend list UC) | Same |
| TechSpec §14.7 | `POST` → `HRM-REC-201` | Same |

### DTO ↔ DB

| Request field | DB column | Notes |
|---------------|-----------|-------|
| `company_id` | `company_id` TEXT | Normalized slug |
| `title` | `title` | Trim |
| `department` | `department` | Soft catalog |
| `employment_type` | `employment_type` | Required |
| **`headcount`** | **`headcount`** | ≥1 integer |
| `job_description` / `requirements` | same | Optional |
| `job_template_id` | `job_template_id` | Snapshot id |
| _(implicit)_ | `status='open'` | G-RC-02 residual |
| _(null)_ | `workflow_instance_id` | UF-HRM-12 |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Validation DTO / headcount | `HRM-ERR-VALIDATION` / **`HRM-REC-400`** | 400 |
| Scope / auth | auth / scope | 401/403/409 |
| Insert fail | `HRM-REC-500` (or envelope 500) | 500 |

### FE after 2xx (U65)

Toast OK · row with **headcount** on list · Network `HRM-REC-201` · **F5** still present (Diễn biến #7).

---

## 3. Endpoint C — Get job requisition by id

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/recruitment/requisitions/:requisitionId` |
| Success | **`HRM-REC-200`** |
| Query | `company_id` (scope) |

### Mục đích

Tải chi tiết một YCTD (số lượng, trạng thái, JD, WF id) trong cùng scope list — phục vụ màn chi tiết / edit / submit WF.

### Nghiệp vụ xử lý

1. `resolveHrmListScope` — **same resolver as list**.
2. `SELECT` by `id` + company filter; miss → **404** `HRM-REC-404`.
3. Return full spine fields including `headcount` + `workflow_instance_id`.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-01** | #6/#7 detail after create · khóa mang #8 | Detail read |
| TechSpec §14.7 | get `HRM-REC-200` | Same |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not in scope / missing | **`HRM-REC-404`** | 404 |
| Scope mismatch context | 409 family | 409 |

---

## 4. Endpoint D — Update job requisition

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/recruitment/requisitions/:requisitionId` |
| Success | **`HRM-REC-200`** |
| DTO | `UpdateJobRequisitionDto` — `status` required; optional `notes`, `headcount` ≥1 |

### Mục đích

Cho phép cập nhật **trạng thái** (và tùy chọn số lượng) của YCTD trong phạm vi — trừ khi đang bị khóa bởi instance WF đang chạy.

### Nghiệp vụ xử lý

1. Load row; `assertResourceInHrmScope` → 404/409.
2. If `workflow_instance_id` set and status locked → **409** **`HRM-REC-WF-LOCKED`** (must_keep XHRM-REC-WF).
3. Optional `headcount` revise: if present must be ≥1 else `HRM-REC-400`.
4. `UPDATE status`, `headcount = COALESCE(...)`, `updated_at`.
5. `notes` accepted for FE probe (UF-HRM-12) — may be non-persisted if column absent (must not 400 forbidNonWhitelisted).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-01** | Hậu điều kiện trạng thái · #4 nếu sửa SL ≤0 | Mutate |
| TechSpec §14.7 · §18.2 | status PATCH + LOCK | Same |
| UF-HRM-12 | notes optional | Compatibility |

### DTO ↔ DB

| Request | DB | Notes |
|---------|-----|-------|
| `status` | `status` | Domain CHECK WF-extended |
| `headcount?` | `headcount` | ≥1 when set |
| `notes?` | _(optional / non-persist)_ | FE probe |
| — | `workflow_instance_id` | **Never client-overwrite on this path** |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found / scope | `HRM-REC-404` / `HRM-REC-409` | 404/409 |
| WF lock | **`HRM-REC-WF-LOCKED`** | 409 |
| Bad headcount | `HRM-REC-400` | 400 |

### FE after 2xx

Status/badge + headcount refresh · F5 còn · LOCK → toast conflict rõ.

---

## 5. Endpoint E — Submit requisition workflow (TechSpec §14.7 / §18.2)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/recruitment/requisitions/:requisitionId/submit-workflow` |
| Success | **`HRM-REC-200`** (row + spawn meta) |
| Auth | Bearer; submitter resolved from token (Option B context) |

### Mục đích

Gửi YCTD vào **quy trình duyệt XBOS** (`hrm_requisition_*`) theo phân vùng công ty Option B — gắn `workflow_instance_id` mà không bắt buộc lúc tạo (UF-HRM-12).

### Nghiệp vụ xử lý

1. Get-by-id with **same scope** as list.
2. If `workflow_instance_id` already set → idempotent return spawn.
3. `RecruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured` with `entityCompanyId` / company partition (AC-REC-WF-OPT-B-01..03).
4. Persist `workflow_instance_id` when spawn OK; `spawnMissing` when def absent.
5. Subsequent status PATCH subject to LOCK.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-01** | Kết quả «Việc được mở khóa tiếp» — gắn quy trình duyệt khi có | **This endpoint** |
| TechSpec **§18.2** | Option B partition spawn | Same |
| J-REC-WF-* | Smoke journeys | QA evidence |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found | `HRM-REC-404` | 404 |
| Spawn / bridge fail | bridge / 5xx family | 4xx/5xx documented in bridge |

### FE after 2xx

YCTD shows WF linked · Inbox task when configured · create-without-submit still allowed on other rows.

---

## 6. Endpoint F — Create candidate (stage FR-RC-03 · Lane A)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/recruitment/candidates` **with** `body.requisition_id` |
| Success | **`HRM-REC-202`** |
| Dual-route | Missing `requisition_id` → Lane B pool (`HRM-REC-CP-201`) — **not** FR-RC-03 SoT |

### Mục đích

Tạo **hồ sơ ứng viên spine** gắn YCTD để tiếp tục pipeline phỏng vấn / tuyển — khóa mang sang FR-RC-05.

### Nghiệp vụ xử lý

1. Require `requisition_id`; resolve requisition in **same company scope**.
2. Persist `company_id` TEXT slug; `INSERT recruitment_candidates` status `new`.
3. Hard FK to `job_requisitions`; soft `employee_id` null until hire.
4. **Cấm** write `public.candidates` on this SoT path (§17.6).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-03** | #3 thiếu bắt buộc · #4 YCTD · **#7 Lưu** · #8 F5 | **This endpoint** (Lane A) |
| TechSpec §16.1 / §17.6 | `HRM-REC-202` | Same |

### DTO ↔ DB (spine)

| Request | DB | Notes |
|---------|-----|-------|
| `company_id` | `company_id` TEXT | Scope |
| `requisition_id` | `requisition_id` | Hard FK |
| `full_name`, `email`, `source` | same | Required shape |
| — | `status='new'` | Pipeline start |
| — | `employee_id` NULL | Soft hire later |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Requisition missing / out of scope | `HRM-REC-404` family | 404 |
| Validation | pipe / REC codes | 400 |

### FE after 2xx

Ứng viên trên list · F5 còn · sẵn sàng schedule interview.

---

## 7. Endpoint G — List candidates (stage read-back)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/recruitment/candidates` |
| Success | **`HRM-REC-200`** |
| Query | `company_id`, optional `requisition_id`, paging |

### Mục đích

Liệt kê ứng viên spine trong scope (lọc theo YCTD khi có) để màn tuyển dụng / gắn lịch PV.

### Nghiệp vụ xử lý

1. Same list scope resolver as requisitions.
2. `SELECT recruitment_candidates` (+ filters).
3. Empty honest `[]`.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-03** | #7/#8 list after create | Read-back |
| TechSpec §16.1 | GET candidates | Same |

---

## 8. Endpoint H — Schedule interview (stage FR-RC-05)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/recruitment/interviews` |
| Success | **`HRM-REC-203`** |
| DTO | `ScheduleInterviewDto` |

### Mục đích

Lên lịch phỏng vấn gắn **ứng viên spine** (`recruitment_candidates`) — không gắn PK catalog Lane B.

### Nghiệp vụ xử lý

1. Resolve candidate in scope; must exist on Lane A.
2. Validate `scheduled_at`, `interviewer`.
3. `INSERT recruitment_interviews` status `scheduled`; `candidate_id` → **recruitment_candidates.id** only (§17.6 F4).
4. Optional status PATCH path separate (`PATCH …/interviews/:id/status`).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-HRM-RC-05** | #3 trạng thái UV · #4 thiếu · #5 thời điểm · **#7 Lưu** · #9 khóa lịch | **This endpoint** |
| TechSpec §16.1 | `HRM-REC-203` | Same |

### DTO ↔ DB

| Request | DB | Notes |
|---------|-----|-------|
| `company_id` | `company_id` TEXT | Scope |
| `candidate_id` | `candidate_id` | HARD → recruitment_candidates |
| `scheduled_at` | `scheduled_at` | ISO wire; UI `dd/MM/yyyy HH:mm` |
| `interviewer` | `interviewer` | Display |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Candidate invalid / status | REC family | 400/404 |
| Validation | pipe | 400 |

### FE after 2xx

Lịch trên hồ sơ UV · F5 còn.

---

## 9. Scope parity matrix (mandatory)

| Operation | Resolver | Fail codes |
|-----------|----------|------------|
| List requisitions | `resolveHrmListScope` | 409 scope |
| Get / update / submit | same + `assertResourceInHrmScope` | `HRM-REC-404` / `409` / `HRM-REC-WF-LOCKED` |
| Create requisition | `resolveHrmPersistCompanyIdText` | 400 headcount |
| Candidates / interviews | same company ladder | 404 out of scope |

**FAIL** if get-by-id uses different company semantics than list.

---

## 10. Envelope codes (SoT summary)

| Code | Meaning |
|------|---------|
| `HRM-REC-200` | List/get/update/submit OK |
| `HRM-REC-201` | Create requisition |
| `HRM-REC-202` | Create spine candidate |
| `HRM-REC-203` | Schedule interview |
| `HRM-REC-400` | Headcount / business validation |
| `HRM-REC-404` | Not found in scope |
| `HRM-REC-409` | Scope mismatch on resource |
| `HRM-REC-WF-LOCKED` | Status locked under active WF |

Lane B leftovers use distinct codes (`HRM-REC-JP-*`, `HRM-REC-CP-*`, `HRM-REC-HC-*`) — **not** FR-RC primary.

---

## 11. Residual (documented — not closed by this ADD)

| ID | Note | Owner hint |
|----|------|------------|
| G-RC-02 | Create defaults `open` vs SRS nháp/chờ duyệt | dev-be + BA if AC draft |
| G-RC-03 | No `needed_by` / ngày có mặt column | ba-process P2 or later ADD |
| Catalog assert department | Soft today; BR-MD picker harden optional | settings pair |
| OpenAPI deepen | Align yaml descriptions to F.1 bước SRS | execution when Dev opens |

---

## 12. Traceability

| Artifact | Path |
|----------|------|
| DB physical | `docs/hrm/DB_DESIGN_HRM_RECRUITMENT.md` |
| Employees soft hire | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` · `API_DESIGN_HRM_EMPLOYEES.md` |
| Pointer | `docs/tech-spec/API_DESIGN_HRM_RECRUITMENT.md` |
| Evidence | `docs/qa/evidence/sa-u71-hrm-recruitment-design-01-20260727.md` |
