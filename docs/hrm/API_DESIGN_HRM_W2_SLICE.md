# API_DESIGN — HRM W2 slice (Performance · Decisions · Metadata · Mobile)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-W2-SLICE-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.20 FR-HRM-PF-01** · **§3.31 FR-HRM-MD-01** · **§3.41–3.44 MOB-01/04/06/08** · **§3.50 FR-HRM-27** · team UC-HRM-27 · UC-HRM-MOB-* |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.1 / §16.2 / §16.3 / §16.5** · `TECHSPEC_MOBILE.md` §5.2 |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` · soft emp `DB_DESIGN_HRM_EMPLOYEES.md` · MOB mutate cite ATT/Leave pairs |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `/performance/*` · `/decisions*` · `/employee-metadata/*` · `/auth/mobile/*` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API batch before Dev claim on W2 P2 |
| **Date** | 2026-07-27 |
| **Runtime** | `PerformanceController` · `DecisionsController` · `EmployeeMetadataController` · `MobileAuthController` |

> **must_keep:** TEXT slug scope (Perf/Dec) · Metadata slug→UUID map · empty 200 honesty · U65 no seed · do not rewrite ATT/Leave/Employees/Payroll/CO-HC/Settings SoT.  
> **Cấm:** filter/persist LE UUID on Perf/Dec; PASS QA bằng seed; claim Phase1/PROD.

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS |
|---|----------------|--------------|-------------|
| **A1** | `POST /api/hrm/performance/cycles` | `HRM-PERF-201` | **FR-HRM-PF-01** #8 |
| **A2** | `GET /api/hrm/performance/cycles` | `HRM-PERF-200` | FR-HRM-PF-01 #8/#9 · list |
| **A3** | `POST /api/hrm/performance/evaluations` | `HRM-PERF-202` (runtime envelope) | PF unlock after cycle |
| **A4** | `GET /api/hrm/performance/evaluations` | `HRM-PERF-200` | List eval by cycle |

> **DOC-DELTA 2026-07-28 (`BA-ERP-E3-DB-API-01`):** E3 ADD `PATCH/DELETE /performance/cycles/{id}` · `PATCH/DELETE /performance/evaluations/{id}` + eval SM + KPI soft keys — F.1 SoT `docs/hrm/API_DESIGN_HRM_ERP_E3.md` (do not duplicate full bodies here).
| **B1** | `GET /api/hrm/decisions` | `HRM-DEC-200` | **FR-HRM-27** #2/#3 |
| **B2** | `POST /api/hrm/decisions` | `HRM-DEC-201` | FR-HRM-27 #6 |
| **B3** | `GET /api/hrm/decisions/{decisionId}` | `HRM-DEC-200` | FR-HRM-27 #8 |
| **B4** | `PATCH /api/hrm/decisions/{decisionId}` | `HRM-DEC-200` | FR-HRM-27 #9 mutate |
| **B5** | `DELETE /api/hrm/decisions/{decisionId}` | `HRM-DEC-200` | FR-HRM-27 delete |
| **C1** | `POST /api/hrm/employee-metadata/change-requests` | `HRM-META-201` | **FR-HRM-MD-01** #6 |
| **C2** | `GET /api/hrm/employee-metadata/change-requests` | `HRM-META-200` | MD-01 #7 · MD-02 queue |
| **C3** | `POST …/change-requests/{id}/approve` | `HRM-META-202` | MD-03 · embed UC-26 |
| **C4** | `POST …/change-requests/{id}/reject` | `HRM-META-203` | MD-04 |
| **D1** | `POST /api/hrm/auth/mobile/login` | `HRM-AUTH-200` | **FR-HRM-MOB-01** #4 |
| **D2** | `POST /api/hrm/auth/mobile/select-membership` | `HRM-AUTH-203` | MOB-01 #5 · MOB-02 |
| **D3** | `POST /api/hrm/auth/mobile/refresh` | `HRM-AUTH-201` | MOB-01 #6 |

**Cross-cite (no duplicate F.1 body — must_keep):**

| FR | Canonical API_DESIGN | Path |
|----|----------------------|------|
| MOB-04 | `API_DESIGN_HRM_ATT_SHEET.md` (+ records create) | `POST/GET …/attendance/records` |
| MOB-06 / MOB-08 | `API_DESIGN_HRM_LEAVE.md` | leave create / approve / reject (+ update-requests) |

---

## A1. Endpoint — Create performance cycle

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/performance/cycles` |
| Body | `CreatePerformanceCycleDto` (`company_id`, `cycle_name`, `start_date`, `end_date`, `created_by?`) |
| Success | `201` · **`HRM-PERF-201`** |
| Runtime | `createCycle` · `resolveHrmPersistCompanyIdText` |

### Mục đích

**Tạo chu kỳ đánh giá hiệu suất** (nháp) trong đơn vị được cấp để mở khóa danh sách chu kỳ và tạo phiếu đánh giá sau — **không** tự sinh hàng loạt phiếu đánh giá khi chỉ tạo chu kỳ.

### Nghiệp vụ xử lý

1. Auth — thiếu / hết phiên → từ chối (PF-01 #1).
2. Validate tên + ngày bắt buộc; `start_date <= end_date` → else **`HRM-PERF-001`**.
3. Persist TEXT slug via `resolveHrmPersistCompanyIdText` — **cấm** LE UUID.
4. INSERT `status='draft'`; return cycle row.
5. Không side-effect evaluations.
6. Scope ngoài quyền → 401/409 family.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PF-01** | **#1** Auth / ngoài phạm vi | Guard |
| 2 | **FR-HRM-PF-01** | **#3** Thiếu tên/ngày | 400 validation |
| 3 | **FR-HRM-PF-01** | **#4** Ngày sai thứ tự | `HRM-PERF-001` |
| 4 | **FR-HRM-PF-01** | **#5** Chồng chu kỳ (khi cấm) | Reject / residual G-PF-OVERLAP |
| 5 | **FR-HRM-PF-01** | **#6** Ngoài phạm vi | Scope |
| 6 | **FR-HRM-PF-01** | **#8** Lưu thành công | **This endpoint** |
| 7 | **FR-HRM-PF-01** | **#9** Khóa chu kỳ | Response `id` |

### Request ↔ DB

| Body | Column |
|------|--------|
| `company_id` | TEXT slug |
| `cycle_name` | `cycle_name` |
| `start_date` / `end_date` | DATE |
| `created_by?` | `created_by` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Date order | `HRM-PERF-001` | 400 |
| Unauth / scope | AUTH / 409 | 401/409 |

### FE after 2xx (U65)

Dòng chu kỳ trên list · F5 còn · status `draft` · không hiện phiếu đánh giá giả.

---

## A2. Endpoint — List performance cycles

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/performance/cycles` |
| Query | `company_id`, optional `status` |
| Success | `200` · **`HRM-PERF-200`** · `{ total, data[] }` |
| Runtime | `listCycles` · `resolveHrmListScope` |

### Mục đích

Cấp **danh sách chu kỳ đánh giá** trong phạm vi để picker / màn chu kỳ sau tạo (PF-01 #8/#9) và trước khi tạo phiếu đánh giá.

### Nghiệp vụ xử lý

1. Auth + `resolveHrmListScope` — same family as create.
2. `company_id=main` → rollup five slugs; never LE UUID as workforce key.
3. Optional `status` filter.
4. Empty = honest empty.
5. ORDER BY `start_date DESC, created_at DESC`.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PF-01** | **#8** Chu kỳ trên danh sách | **This endpoint** read-back |
| 2 | **FR-HRM-PF-01** | **#9** / Kết quả trả về | List paint |
| 3 | SCOPE-* | Partition | `resolveHrmListScope` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Empty | `HRM-PERF-200` + `data=[]` | 200 |

### FE after 2xx

Bảng/picker cập nhật · empty trung thực · F5 giữ.

---

## A3 / A4. Evaluations (brief F.1 — unlock after PF-01)

### A3 Create evaluation — Mục đích

Ghi **phiếu đánh giá** gắn NV + chu kỳ đã tồn tại trong scope — mở khóa sau chu kỳ (PF Kết quả «tạo phiếu»).

### Nghiệp vụ xử lý

1. Resolve scope; load cycle by id **in scope** → else `HRM-PERF-404`.
2. INSERT soft `employee_id` + hard `cycle_id`; denorm `company_id` from cycle.
3. Score 0–100 CHK.

### Bước SRS

| # | FR | Diễn biến | Role |
|---|-----|-----------|------|
| 1 | FR-HRM-PF-01 | Kết quả → Việc mở khóa PF-03 | Unlock path |
| 2 | SCOPE | Cycle must be in scope | Guard |

### A4 List evaluations — Mục đích

Đọc phiếu theo scope / cycle — empty OK.

---

## B1. Endpoint — List decisions

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/decisions` |
| Query | `company_id`, optional `decision_type`, `status`, `page`, `page_size` |
| Success | `200` · **`HRM-DEC-200`** · `{ total, page, page_size, data[] }` |
| Runtime | `listDecisions` · `resolveHrmListScope` |

### Mục đích

Cấp **danh sách quyết định nhân sự** theo đơn vị trên cổng nhúng để:

1. Empty trung thực «Không có quyết định nào» khi chưa có (FR-27 #3).
2. Sau tạo / F5 xác nhận dòng còn (#6/#7).
3. Lọc loại / trạng thái vận hành.

### Nghiệp vụ xử lý

1. Auth (#1).
2. `resolveHrmListScope` — member partition / holding rollup.
3. Optional filters `decision_type` / `status`.
4. Paginate in-memory slice after ORDER BY `created_at DESC` (runtime today).
5. Empty = **200 + []** — **không** fake «chưa triển khai».

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-27** | **#2** Mở Quyết định | Frame load → **this** |
| 2 | **FR-HRM-27** | **#3** Empty | Honest empty |
| 3 | **FR-HRM-27** | **#4** Fake copy | Reject UX (FE) |
| 4 | **FR-HRM-27** | **#7** F5 | **This endpoint** |
| 5 | SCOPE-* | Đúng ĐV | Scope filter |

### FE after 2xx

List hoặc empty rõ · không banner ERROR khi empty hợp lệ · F5 giữ.

---

## B2. Endpoint — Create decision

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/decisions` |
| Body | `CreateDecisionDto` |
| Success | `201` · **`HRM-DEC-201`** |
| Runtime | `createDecision` · catalog assert `decision_types` |

### Mục đích

**Tạo quyết định nhân sự** trong phạm vi để dòng xuất hiện trên list cùng phiên và còn sau F5 — loại QSĐ thuộc danh mục Cài đặt (FR-HRM-SC-DEC-01).

### Nghiệp vụ xử lý

1. Auth + persist TEXT slug.
2. Validate title / type — thiếu → 400 (#5).
3. `assertCodeInEffectiveCatalog(decision_types)` → else **`HRM-DEC-TYPE`**.
4. Auto `decision_code` nếu trống; optional soft `employee_id`.
5. INSERT; return row — không seed.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-27** | **#5** Thiếu trường | Validation |
| 2 | **FR-HRM-27** | **#6** Lưu OK | **This endpoint** |
| 3 | FR-HRM-SC-DEC-01 | Loại ∈ catalog | `HRM-DEC-TYPE` |
| 4 | **FR-HRM-27** | **#7** F5 | GET list |

### FE after 2xx

Row xuất hiện · F5 còn · empty message không còn nếu đã có ≥1 dòng.

---

## B3. Endpoint — Get decision by id

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/decisions/{decisionId}` |
| Success | `200` · **`HRM-DEC-200`** |
| Runtime | get + `assertResourceInHrmScope` — **same resolver family as list** |

### Mục đích

Mở **chi tiết QSĐ** đúng phạm vi — cấm lộ ĐV khác (FR-27 #8).

### Nghiệp vụ xử lý

1. Load by id; `assertResourceInHrmScope` với `resolveHrmListScope` từ query/header company.
2. Out of scope → 404/409 family (không leak).
3. **Scope parity** với list (G-SCOPE-01).

### Tham chiếu bước SRS

| # | FR | Diễn biến | Role |
|---|-----|-----------|------|
| 1 | **FR-HRM-27** | **#8** Chi tiết ngoài phạm vi | Guard fail |
| 2 | **FR-HRM-27** | **#9** Thành công | **This endpoint** |

---

## B4 / B5. Patch / Delete decision (brief F.1)

### Mục đích

Sửa / xóa QSĐ trong phạm vi khi được phép (FR-27 Kết quả «Sửa / xóa»).

### Nghiệp vụ xử lý

1. Same scope assert as get-by-id.
2. PATCH field subset; DELETE remove row.
3. Catalog re-assert on type change.

### Bước SRS

| # | FR | Diễn biến | Role |
|---|-----|-----------|------|
| 1 | FR-HRM-27 | #8/#9 + Kết quả mở khóa | Mutate in scope |

---

## C1. Endpoint — Submit metadata change request

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/employee-metadata/change-requests` |
| Body | `SubmitEmployeeMetadataChangeDto` |
| Success | `201` · **`HRM-META-201`** |
| Runtime | `submitChangeRequest` · `resolveHrmCompanyUuidForSlug` |

### Mục đích

**Gửi yêu cầu đổi metadata hồ sơ** vào hàng chờ duyệt — **không** áp giá trị lên hồ sơ ngay (trừ cấu hình tự áp ngoài FR này).

### Nghiệp vụ xử lý

1. Auth (#1).
2. Map `company_id` slug|UUID → UUID persist (`resolveHrmCompanyUuidForSlug`) — else `HRM-VAL-001`.
3. Validate `field_key` + `requested_value` JSON — thiếu → 400 (#3).
4. INSERT `status='pending'`; soft `employee_id`.
5. Không UPDATE `employee_metadata_values` on submit alone.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-MD-01** | **#1** Auth / ngoài quyền | Guard |
| 2 | **FR-HRM-MD-01** | **#2** Chọn hồ sơ/trường | Body |
| 3 | **FR-HRM-MD-01** | **#3** Thiếu bắt buộc | 400 |
| 4 | **FR-HRM-MD-01** | **#4** Danh mục hết hiệu lực | Reject catalog |
| 5 | **FR-HRM-MD-01** | **#5** Trường không đổi qua YC | Reject |
| 6 | **FR-HRM-MD-01** | **#6** Gửi thành công | **This endpoint** |
| 7 | **FR-HRM-MD-01** | **#8** Khóa yêu cầu | Response `id` |

### Request ↔ DB

| Body | Column |
|------|--------|
| `company_id` (slug) | Mapped UUID `company_id` |
| `employee_id` | Soft UUID |
| `field_key` | `field_key` |
| `requested_value` (JSON string/object) | `requested_value` JSONB |
| `reason?` | `reason` |

### FE after 2xx

Toast gửi OK · trạng thái chờ duyệt · F5 còn trên queue · hồ sơ gốc chưa đổi.

---

## C2. Endpoint — List metadata change requests

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/employee-metadata/change-requests` |
| Query | `company_id`, optional `employee_id`, `status`, `field_key`, page |
| Success | `200` · **`HRM-META-200`** |
| Runtime | `listChangeRequests` · `resolveHrmListScope` |

### Mục đích

Cấp **hàng chờ / lịch sử yêu cầu** metadata trong phạm vi (MD-01 #7 · MD-02).

### Nghiệp vụ xử lý

1. Scope via list resolver (slug wire).
2. Filter status/field/employee.
3. Empty honest.

### Tham chiếu bước SRS

| # | FR | Diễn biến | Role |
|---|-----|-----------|------|
| 1 | **FR-HRM-MD-01** | **#7** Xem lại trạng thái | **This endpoint** |
| 2 | MD-02 | Hàng chờ | List pending |

---

## C3 / C4. Approve / Reject metadata (brief F.1)

### Mục đích

**Duyệt / từ chối** yêu cầu đang `pending` trong scope (MD-03/04 · embed UC-26) — approve mới áp `employee_metadata_values`.

### Nghiệp vụ xử lý

1. Load request; `assertResourceInHrmScope` (same family as list) → `HRM-META-404` / `409`.
2. Approve: status→approved + write values; Reject: status→rejected + note.
3. Non-pending → `HRM-META-409`.

### Bước SRS

| # | FR / UC | Diễn biến | Role |
|---|---------|-----------|------|
| 1 | MD-03 / UC-26 | Duyệt | C3 |
| 2 | MD-04 | Từ chối | C4 |
| 3 | MD-01 Quy tắc | Submit ≠ apply | Guarded by status machine |

---

## D1. Endpoint — Mobile login

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/auth/mobile/login` |
| Body | `{ email, password }` |
| Headers | `x-tenant-id`, `x-company-id` (hints) |
| Success | `200` · **`HRM-AUTH-200`** · `access_token`, `refresh_token`, `expires_in_sec`, `employee`, `roles[]` |
| Runtime | `MobileAuthService.login` |

### Mục đích

**Đăng nhập và thiết lập phiên** trên HRM Mobile để mở khóa chấm công / đơn / duyệt (MOB-01 → MOB-04/06/08).

### Nghiệp vụ xử lý

1. Validate credentials — sai → **`HRM-AUTH-401`** (không lộ nội bộ).
2. Resolve employee scope — thiếu → `HRM-AUTH-404`.
3. Empty membership / forbidden → **`HRM-AUTH-403`** (hợp lệ — không fake membership).
4. Issue JWT claims Plane B `companyId` slug + `employee_id` + roles.
5. **No session table insert.**

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-MOB-01** | **#2** Nhập sai | `HRM-AUTH-401` |
| 2 | **FR-HRM-MOB-01** | **#3** Tài khoản khóa | Từ chối |
| 3 | **FR-HRM-MOB-01** | **#4** Đăng nhập đúng | **This endpoint** |
| 4 | **FR-HRM-MOB-01** | **#7** Không mạng | Client `HRM-MOB-ERR-NETWORK` |
| 5 | **FR-HRM-MOB-01** | **#8** Thành công | Tokens + employee |

### FE / App after 2xx

SecureStore refresh · vào home hoặc chọn ĐV · không vào nghiệp vụ nếu 401/403.

---

## D2. Endpoint — Select membership

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/auth/mobile/select-membership` |
| Auth | Bearer access |
| Success | `200` · **`HRM-AUTH-203`** |
| Runtime | `selectMembership` |

### Mục đích

Chọn **đơn vị / membership** khi user có nhiều phạm vi — khóa mang `companyId` slug cho các API sau (MOB-01 #5).

### Nghiệp vụ xử lý

1. Require valid access token — else `HRM-AUTH-401`.
2. Verify membership in allowed set; re-issue JWT with selected Plane B slug.
3. Out-of-set → 403/404 family.

### Tham chiếu bước SRS

| # | FR | Diễn biến | Role |
|---|-----|-----------|------|
| 1 | **FR-HRM-MOB-01** | **#5** Vào chức năng / chọn ĐV | **This endpoint** |
| 2 | TECHSPEC_MOBILE §5.2 | Membership select | Contract |

---

## D3. Endpoint — Refresh token

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/auth/mobile/refresh` |
| Body | `{ refresh_token }` |
| Success | `200` · **`HRM-AUTH-201`** |

### Mục đích

**Làm mới phiên** khi access hết hạn mà refresh còn hiệu lực — thất bại → buộc MOB-01 lại (#6).

### Nghiệp vụ xử lý

1. Validate refresh JWT `typ: refresh` — invalid → `HRM-AUTH-401`.
2. Re-issue access (+ refresh policy per runtime).
3. Missing scope claims → `HRM-AUTH-401`.

### Tham chiếu bước SRS

| # | FR | Diễn biến | Role |
|---|-----|-----------|------|
| 1 | **FR-HRM-MOB-01** | **#6** Hết phiên giữa chừng | Refresh or re-login |
| 2 | TECHSPEC_MOBILE §5.2 | Refresh contract | **This endpoint** |

---

## D′. Mobile mutate — cross-cite F.1 pointer

| FR | Mục đích (VI) | Nghiệp vụ | Bước SRS | Canonical |
|----|---------------|-----------|----------|-----------|
| **MOB-04** | Ghi nhận chấm công từ app | Same ATT create + scope employee self | MOB-04 Diễn biến + FR-AT-01 | `API_DESIGN_HRM_ATT_SHEET.md` |
| **MOB-06** | Tạo đơn nghỉ / update-request | Shared Leave / update-requests create | MOB-06 + AT-10 / FR-09 | `API_DESIGN_HRM_LEAVE.md` |
| **MOB-08** | Duyệt/từ chối nghỉ (manager) | Same approve/reject + role gate MOB | MOB-08 + AT-12/13 | `API_DESIGN_HRM_LEAVE.md` |

**Cấm:** duplicate column packs; mobile-only alternate tables.

---

## Errors taxonomy (slice)

| Code | Domain | Meaning |
|------|--------|---------|
| `HRM-PERF-001` | PF | Date order |
| `HRM-PERF-404` | PF | Cycle not in scope |
| `HRM-DEC-TYPE` | DEC | Type not in catalog |
| `HRM-DEC-200/201` | DEC | List/create OK |
| `HRM-META-201/200/202/203` | MD | Submit/list/decide |
| `HRM-META-404/409` | MD | Not found / not pending / scope |
| `HRM-VAL-001` | MD | company_id map fail |
| `HRM-AUTH-200/201/203` | MOB | Login / refresh / membership |
| `HRM-AUTH-401/403/404` | MOB | Creds / forbidden / scope missing |

---

## must_keep / residual

| Keep | Residual |
|------|----------|
| ATT/Leave/Employees/Payroll/CO-HC/Settings pairs | **G-MD-PLANE-01** UUID persist |
| XBOS Auth/KPI/RACI/WF/catalog-gov | **G-PF-OVERLAP** enforcement verify |
| U65 zero-seed · empty honesty | **G-SCOPE-01** on-touch decisions/metadata |
| OpenAPI deepen optional | **G-MOB-LEFT** leftover MOB FR |
