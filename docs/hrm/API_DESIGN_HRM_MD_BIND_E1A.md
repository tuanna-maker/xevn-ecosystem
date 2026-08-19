# API_DESIGN — HRM MD-BIND Layer A (position_key assert + DTO)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1A-DB-API-01` |
| **cohort** | E1-A · `MD-BIND-LAYER-A` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | `docs/hrm/SRS.md` **§16.0 BR-HRM-MD-01** · **AC-HRM-PICKER-01** · **FR-HRM-SC-POS-01** · **FR-HRM-SC-DEC-01** · **UC-HRM-27** · FR-CI-01 · FR-EM-01 #6 pattern |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` |
| **ref_catalog_api** | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` Endpoint B (picker items) |
| **ref_pattern** | `API_DESIGN_HRM_EMPLOYEES.md` create · `assertJobTitleKeyInCatalog` · Job-templates `position_code` assert |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71 F.1** | Mỗi endpoint dưới đây đủ 3 mục + DTO↔DB + lỗi |
| **Date** | 2026-07-28 |
| **Cấm** | `apps/**` · apply migration · seed U65 evidence |

> **Rule:** Mutate paths accept **`position_key` (catalog code)** — not invent label as SoT. Snapshot label fields optional for display denorm. Picker list = existing Settings catalogs API (no new catalog endpoint required for E1-A).

---

## 0. Shared contracts

### 0.1 Assert helper (normative)

| Item | Value |
|------|--------|
| Helper | `assertCodeInEffectiveCatalog({ tenantId, companyId, catalogKey: 'job_titles' \| alias, code })` |
| Alias normalize | `positions` / `employee_positions` → `job_titles` family |
| On miss / inactive | Throw domain error → mapped HTTP **400** + stable code per endpoint |
| Empty effective catalog | Same reject — **no** free-text fallback |
| Scope | Catalog company partition = settings resolve (align list scope slug) |

### 0.2 Shared wire fields

| Wire | DB | Notes |
|------|-----|-------|
| `position_key` | `*.position_key` | Required on new writes when UI Vị trí shown |
| `position` / `position_name` | snapshot TEXT | Optional; server may fill from catalog `label` |
| `signer_position_key` | `*.signer_position_key` | Decisions / Contracts |
| `department_key` | `*.department_key` | P1 harden (WH / JP / CI / HCP) |
| `department` | snapshot TEXT | May still accept legacy name until P1 |

### 0.3 Picker dependency (not redesigned)

| Method / path | Role |
|---------------|------|
| `GET /api/hrm/settings-catalogs/{catalogKey}/items?q=&active=` | FE CatalogSearchPicker options (`job_titles` / `departments`) |
| Success empty | FE empty + hướng dẫn Cài đặt / sync — mutate still rejects invent |

### 0.4 Error envelope

| Family | HTTP | FE |
|--------|------|-----|
| Catalog key invalid / missing | **400** + `HRM-*-POS-KEY` | Field error VI «Chức danh/vị trí không hợp lệ hoặc thiếu» |
| Auth | 401 `HRM-AUTH-001` | Login |
| Scope | 404 / 409 scope family | Banner; no fake row |
| Success | 200/201 existing module envelopes | FE bind + F5 |

---

## 1. Endpoint WH-C — Create work timeline item

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/employees/:employeeId/work-timeline` |
| Body | Profile payload + **`position_key`** |
| Success | `201` (module envelope) |
| Runtime | `EmployeesController.createEmployeeWorkTimeline` → `EmployeeProfileService.createWorkTimelineItem` |

### Mục đích

Cho phép HCNS **ghi sự kiện lịch sử công tác** (bổ nhiệm / thuyên chuyển…) với **vị trí ràng buộc danh mục** Cài đặt — không còn lưu free-text Vị trí làm SoT.

### Nghiệp vụ xử lý

1. Auth + resolve employee in `resolveHrmListScope` (same as other profile tabs).
2. Validate required timeline fields (`event_date`, `title`, … per runtime).
3. **Require `position_key`** when product locks Vị trí (E1-A DoD = required for create).
4. `assertCodeInEffectiveCatalog(job_titles, position_key)` → fail **`HRM-WH-POS-KEY`**.
5. Optional `department_key` assert → **`HRM-WH-DEPT-KEY`**.
6. Denorm: if `position` omitted → set from catalog `label`.
7. `INSERT` into `employee_work_timeline` including new columns.
8. Return row; FE list refresh + F5 still shows label via key→label or snapshot.

### Bước SRS

| UC / FR | Diễn biến / AC | API role |
|---------|----------------|----------|
| **BR-HRM-MD-01** · **AC-HRM-PICKER-01** | Consumer = combo/search; cấm free-text SoT | **This endpoint** persist key |
| **FR-HRM-SC-POS-01** | #5 Picker hồ sơ / consumer · #6 mã hết hiệu lực | Assert #6 |
| FR-EM-01 #6 (pattern) | Danh mục hết hiệu lực | Same reject class |

### Request ↔ DB

| DTO | DB column |
|-----|-----------|
| `position_key` | `position_key` |
| `position?` | `position` (snapshot) |
| `department_key?` | `department_key` |
| `department?` | `department` |
| `event_date`, `title`, `description`, `event_type`, `status`, `contract_code`, `notes` | existing |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Missing/invalid `position_key` | **`HRM-WH-POS-KEY`** | 400 |
| Invalid `department_key` | **`HRM-WH-DEPT-KEY`** | 400 |
| Employee out of scope | 404/409 family | — |
| Unauthorized | `HRM-AUTH-001` | 401 |

---

## 2. Endpoint WH-U — Update work timeline item

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/employees/:employeeId/work-timeline/:itemId` |
| Body | Partial; allowlist **must include** `position_key` / `department_key` |
| Success | `200` |
| Runtime | `updateWorkTimelineItem` allowlist today: `position` only — **ADD** keys to allowlist |

### Mục đích

Cập nhật sự kiện lịch sử công tác; khi đổi Vị trí phải gửi **mã catalog**, không clear key bằng free-text.

### Nghiệp vụ xử lý

1. Load row; assert employee + item in scope.
2. If `position_key` in body: trim; empty → reject (cannot clear to invent-only); assert catalog.
3. If only `position` text sent without key on legacy row → **reject** invent-only (same JD template policy).
4. Update allowlisted columns; refresh snapshot label when key changes.
5. Return updated row.

### Bước SRS

| FR / AC | Diễn biến | API role |
|---------|-----------|----------|
| BR-HRM-MD-01 · AC-HRM-PICKER-01 | Sửa vẫn picker | **This endpoint** |
| FR-HRM-SC-POS-01 #6 | Mã hết hiệu lực | Assert |

### Request ↔ DB

Same as WH-C for key/snapshot fields; other allowlist fields unchanged.

### Errors

Same codes as WH-C; unknown `itemId` → 404.

---

## 3. Endpoint WH-L — List work timeline (read)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/employees/:employeeId/work-timeline` |
| Success | `200` + rows including `position_key` + snapshot |

### Mục đích

Trả lịch sử công tác để FE hiển thị **nhãn VI** (U72) từ key→catalog label, fallback snapshot legacy.

### Nghiệp vụ xử lý

1. Scope same as create.
2. `SELECT *` (includes new columns).
3. **No** invent mock rows when empty.

### Bước SRS

| AC | Role |
|----|------|
| Profile load honesty | List empty OK |
| U72 | FE maps label — API may return raw key + snapshot |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `position_key` | `position_key` |
| `position` | snapshot |
| … | existing columns |

### Errors

Auth / scope only.

### Scope parity

List timeline under employee that is visible on `GET /employees` / get-by-id same scope ladder.

---

## 4. Endpoint DEC-C — Create decision

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/decisions` |
| Body | `CreateDecisionDto` + **`position_key`** · **`signer_position_key?`** |
| Success | **`201` `HRM-DEC-201`** |
| Runtime | `DecisionsController` / `DecisionsService.create` |

### Mục đích

Tạo quyết định nhân sự (UC-HRM-27) với **loại QSĐ** đã assert + **vị trí / chức danh ký** ràng buộc catalog chức danh — đóng FREE_TEXT cluster Decisions.

### Nghiệp vụ xử lý

1. Auth + `resolveHrmPersistCompanyIdText` / list scope.
2. Validate required: `decision_type`, `title`, `employee_name`, … (existing).
3. **Keep** `assertCodeInEffectiveCatalog(decision_types)` → **`HRM-DEC-TYPE`**.
4. If Vị trí on form: require `position_key` → assert `job_titles` → **`HRM-DEC-POS-KEY`**.
5. If signer fields present: require/assert `signer_position_key` → **`HRM-DEC-SIGNER-POS-KEY`**.
6. Denorm snapshots `position` / `signer_position` from labels when omitted.
7. `INSERT hr_decisions`; return **`HRM-DEC-201`**.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-27** **H-DEC-CREATE** | Lưu → POST 201 → FE + F5 | **This endpoint** |
| **FR-HRM-SC-DEC-01** | Loại QSĐ catalog | `decision_type` assert (must_keep) |
| **FR-HRM-SC-POS-01** #5/#6 | Picker vị trí / hết hiệu lực | `position_key` assert |
| BR-DEC-01..06 | SoT Nest + empty honesty | Unchanged |

### Request ↔ DB

| DTO | DB |
|-----|-----|
| `decision_type` | `decision_type` |
| `position_key` | `position_key` |
| `position?` | `position` |
| `signer_position_key?` | `signer_position_key` |
| `signer_position?` | `signer_position` |
| other existing fields | unchanged |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Invalid type | **`HRM-DEC-TYPE`** | 400 |
| Invalid/missing position key | **`HRM-DEC-POS-KEY`** | 400 |
| Invalid signer position key | **`HRM-DEC-SIGNER-POS-KEY`** | 400 |
| Scope | 409 family | — |

---

## 5. Endpoint DEC-U — Update decision

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/decisions/:id` |
| Success | **`200` `HRM-DEC-200`** (or module update code) |

### Mục đích

Sửa QSĐ; đổi Vị trí/chức danh ký phải qua catalog key; giữ scope parity get-by-id.

### Nghiệp vụ xử lý

1. Load + `assertResourceInHrmScope`.
2. Re-assert `decision_type` if patched.
3. Re-assert position / signer keys if patched; reject clear-to-empty invent.
4. Update columns; return row.

### Bước SRS

| UC | Branch |
|----|--------|
| UC-HRM-27 | **A-DEC-UPDATE** |

### Errors

Same as DEC-C + 404 out of scope.

---

## 6. Endpoint JP-C — Create job posting (Lane B)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/recruitment/job-postings` |
| Body | includes **`position_key`** (SoT); `position` snapshot |
| Success | `201` module envelope |
| Runtime | `RecruitmentController` / `RecruitmentCatalogService` create job_postings |

### Mục đích

Tạo tin tuyển dụng (menu leftover) với **vị trí = mã catalog**, thống nhất độ sâu với job-templates `position_code` — **không** đổi SoT YCTD FR-RC-01.

### Nghiệp vụ xử lý

1. Auth + company slug persist.
2. Require `position_key`; assert `job_titles` → **`HRM-JP-POS-KEY`**.
3. Reject invent-only `position` without key (mirror `HRM-REC-JD-POS` policy).
4. Denorm `position` label; optional `department_key` assert.
5. `INSERT job_postings` (`headcount` remains posting field — **not** FR-RC-01 SoT).
6. Return row.

### Bước SRS

| FR / lock | Role |
|-----------|------|
| BR-HRM-MD-01 · AC-HRM-PICKER-01 | Bind picker |
| FR-HRM-SC-POS-01 #5/#6 | Assert |
| TECHSPEC §17.6 F1/F6 | **must_keep** — không claim FR-RC-01 |

### Request ↔ DB

| DTO | DB |
|-----|-----|
| `position_key` | `position_key` |
| `position` / label | `position` NOT NULL snapshot |
| `department_key?` | `department_key` |
| `department?` | `department` |
| title, employment_type, headcount, … | existing |

### Errors

| Condition | Code |
|-----------|------|
| Missing/invalid key | **`HRM-JP-POS-KEY`** |
| Auth/scope | standard |

---

## 7. Endpoint JP-U — Update job posting

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/recruitment/job-postings/:jobPostingId` |

### Mục đích

Cập nhật tin TD; không cho clear `position_key` về free-text-only.

### Nghiệp vụ xử lý

Same assert rules as JP-C on patched fields; scope assert on id.

### Bước SRS

AC-HRM-PICKER-01 maintain bind after edit + F5.

---

## 8. Endpoint HCP-C — Create headcount proposal (Lane B)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/recruitment/headcount-proposals` |
| Body | **`position_key`** + snapshot `position_name` |

### Mục đích

Đề xuất định biên menu: vị trí từ catalog — **không** thay `job_requisitions.headcount` SoT.

### Nghiệp vụ xử lý

1. Require `position_key` ∈ `job_titles` → **`HRM-HCP-POS-KEY`**.
2. Denorm `position_name` from label if omitted.
3. Optional `department_key`.
4. Insert; return.

### Bước SRS

BR-HRM-MD-01 · FR-HRM-SC-POS-01 · §17.6 leftover lock.

### Request ↔ DB

| DTO | DB |
|-----|-----|
| `position_key` | `position_key` |
| `position_name` | `position_name` |
| `department_key?` | `department_key` |
| `department` | `department` |

---

## 9. Endpoint CI-C — Create employee contract

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/contracts-insurance/contracts` (runtime controller base) |
| Body | Existing CI DTO **+** `position_key` / snapshots / signer keys per DB_DESIGN §7 |
| Success | **`201` `HRM-CON-201`** |
| Runtime | `ContractsInsuranceController.createContract` |

### Mục đích

Tạo hợp đồng gắn NV với **vị trí / chức danh người ký** từ catalog — đóng FREE_TEXT EmployeeContracts và khép schema FE↔BE.

### Nghiệp vụ xử lý

1. Auth + `resolveHrmPersistCompanyIdText`.
2. Resolve `employee_id` in scope (existing).
3. **Keep** G-CI-01 `assertContractEndDateForCreate` → `HRM-CON-001` / `HRM-CON-002`.
4. Require `position_key` when FE shows Vị trí → assert → **`HRM-CON-POS-KEY`**.
5. If signer present → assert `signer_position_key` → **`HRM-CON-SIGNER-POS-KEY`**.
6. Persist new columns; denorm snapshots.
7. Return **`HRM-CON-201`**.

### Bước SRS

| FR | Diễn biến | API role |
|----|-----------|----------|
| **FR-CI-01** | Create HĐ success / date rules | Existing + keys |
| **FR-HRM-SC-POS-01** #5/#6 | Picker vị trí | Key assert |
| BR-HRM-MD-01 | Cấm free-text SoT | **This delta** |

### Request ↔ DB

| DTO | DB |
|-----|-----|
| `position_key` | `position_key` |
| `position?` | `position` |
| `department_key?` | `department_key` |
| `department?` | `department` |
| `signer_name?` | `signer_name` |
| `signer_position_key?` | `signer_position_key` |
| `signer_position?` | `signer_position` |
| `contract_type`, dates, status, notes, … | existing CI design |

### Errors

| Condition | Code |
|-----------|------|
| Date rules | `HRM-CON-001` / `HRM-CON-002` |
| Position key | **`HRM-CON-POS-KEY`** |
| Signer position key | **`HRM-CON-SIGNER-POS-KEY`** |
| Scope | `HRM-CON-409` / 404 |

---

## 10. Endpoint CI-U — Update employee contract

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH …/contracts/:contractId` (runtime path) |
| Success | `200` |

### Mục đích

Cập nhật HĐ; re-assert keys; `assertResourceInHrmScope`.

### Nghiệp vụ xử lý

Mirror CI-C for patched key fields; keep end_date policy on type changes.

### Bước SRS

FR-CI-01 update + AC-HRM-PICKER-01 persistence after F5.

---

## 11. Deterministic error map (summary)

| Code | When | HTTP |
|------|------|------|
| `HRM-WH-POS-KEY` | WH create/update position key fail | 400 |
| `HRM-WH-DEPT-KEY` | WH department key fail | 400 |
| `HRM-DEC-TYPE` | Decisions type (must_keep) | 400 |
| `HRM-DEC-POS-KEY` | Decisions position key | 400 |
| `HRM-DEC-SIGNER-POS-KEY` | Decisions signer position key | 400 |
| `HRM-JP-POS-KEY` | Job posting position key | 400 |
| `HRM-HCP-POS-KEY` | Headcount proposal position key | 400 |
| `HRM-CON-POS-KEY` | Contract position key | 400 |
| `HRM-CON-SIGNER-POS-KEY` | Contract signer position key | 400 |
| `HRM-EMP-JOB-TITLE` | Employees (pattern cite) | 400 |
| `HRM-REC-JD-POS` | Job templates (must_keep) | 400 |

---

## 12. FE bind contract (for Dev-FE — not implemented here)

| Screen | Wire send | Display |
|--------|-----------|---------|
| EmployeeWorkHistory / WorkTimeline | `position_key` from CatalogSearchPicker | label via getLabel / snapshot |
| Decisions | `position_key`, `signer_position_key` | U72 labels |
| JobPostingsTab | `position_key` (+ dept key P1) | labels |
| HeadcountProposalTab | `position_key` | `position_name` snapshot OK |
| EmployeeContracts | `position_key`, `signer_position_key` | labels |

**Cấm FE:** submit invent `position` string as sole SoT; show raw key as primary UI text (U72).

---

## 13. Traceability (SRS → API → DB → FE → Test)

| SRS / AC | API | DB | FE | Test expectation |
|----------|-----|----|----|------------------|
| BR-HRM-MD-01 · AC-HRM-PICKER-01 | WH-C/U · DEC-C/U · JP · HCP · CI | `*_key` cols | CatalogSearchPicker | Browser create → Network body has key → F5 label OK |
| FR-HRM-SC-POS-01 #6 | all asserts | soft ref | toast invalid | 400 + no row invent |
| UC-HRM-27 H-DEC-CREATE | DEC-C | `hr_decisions` | Decisions | `HRM-DEC-201` + F5 |
| FR-CI-01 | CI-C | `employee_contracts` | EmployeeContracts | `HRM-CON-201` + keys |
| §17.6 F1/F6 | JP/HCP | Lane B tables | Rec tabs | No claim FR-RC-01 |
| U19 scope_parity | GET list↔id all modules | company_id slug | deep link | no 404 after list |

---

## 14. Acceptance (API plane — after Dev WI)

| Check | PASS |
|-------|------|
| Create WH without `position_key` → 400 `HRM-WH-POS-KEY` | Yes |
| Create WH with valid key → 201 + F5 | Yes |
| Decisions type still asserted + position key new | Yes |
| Job template position_code regression green | Yes |
| Contract create persists `position_key` | Yes |
| No seed in QA evidence (U65) | Yes |
| `spec_read_ack` cites this file + DB_DESIGN + SRS steps | Yes |

---

## 15. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| Existing envelopes `HRM-DEC-201` / `HRM-CON-201` / emp job title assert | Free-text SoT accept |
| Settings picker GET | New parallel invent catalog API |
| Lane A requisition APIs | Rebind FR-RC headcount to job_postings |
| Design-only this WI | Implement in `apps/**` under this WI |
