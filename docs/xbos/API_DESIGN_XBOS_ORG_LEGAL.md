# API_DESIGN — XBOS Org Legal (group-member-units · legal GET/PUT · documents)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-ORG-LEGAL-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | Khách `SRS_XBOS_KHACH.md` **§3.4 FR-XBOS-ORG-01** Diễn biến #1–#8 · **§3.5 FR-XBOS-ORG-03** Diễn biến #1–#9 · team **UC-XBOS-ORG-01** / **UC-XBOS-ORG-03** · UF-XBOS-02 / 03 / 06 |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§14.4–14.5** · `COMMAND_CENTER_P0_TECHSPEC.md` §4 |
| **ref_db** | `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` |
| **ref_hrm_extend** | `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` — **must_keep**; this file **extends** (legal PUT + documents F.1), does not wipe industry list contract |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API F.1 before Dev/QA claim on org legal spine |
| **Date** | 2026-07-27 |
| **Runtime** | `TenantScopeController` · `OrgFoundationController` / `OrgFoundationService` · `LegalEntityProfileController` / `LegalEntityProfileService` |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` — `tenantScopeGroupMemberUnits` · `orgFoundationListLegalEntities` · `orgFoundationUpsertLegalEntity` · `orgFoundation*Document*` |

> **must_keep:** `business_lines` on group-member-units + legal list; industry HRM pair; UF-XBOS-02/03/06 🟢 — documentation ADD only, no AC overwrite.  
> **Out of scope:** shareholders CRUD → `SA-U71-XBOS-SHAREHOLDER-DESIGN-01`.

Prefix: `/api/xbos` · Headers: `Authorization` / `x-internal-api-key` + `x-tenant-id` / `x-company-id` where required.

---

## 1. Endpoint A — `listGroupMemberUnits`

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/tenant-scope/group-member-units` |
| operationId | `tenantScopeGroupMemberUnits` |
| Runtime | `OrgFoundationService.listGroupMemberUnits` |
| Success | `200` · **`XBOS-TENANT-200`** |
| Auth | Master / group membership |

### Mục đích

Cung cấp **holding registry + danh sách pháp nhân gốc từng ĐVTV** để Command Center / HRM Company Management vẽ danh sách đơn vị thành viên, chọn khóa Plane A (`entityId`), và hiển thị hồ sơ mỏng gồm **ngành nghề** (`business_lines`).

### Nghiệp vụ xử lý

1. Auth: yêu cầu membership master/group — member-only CEO → **`XBOS-TENANT-403`**.
2. Load holding từ `xbos_tenant_registry` (`tenant_kind=master`, active).
3. Join member registry ↔ `xbos_legal_entity` trên `(tenant_id, default_company_id)`; exclude `status=deleted`.
4. Return `{ holding, members[] }` — **must include `business_lines`** (and `entity_type`, `payload`); recommended also tax/founded/address.
5. **Does not** compute headcount (Plane B — HRM summary).
6. Empty `members[]` with 200 = live-empty OK (FR-ORG-01 Diễn biến #3).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-01** / UC-XBOS-ORG-01 | #1 auth · **#2 mở danh sách** · #3 empty · #4 lọc (FE) · #5 chọn đơn vị (khóa `id`) · #7 F5 · #8 thành công | **This endpoint** (group plane) |
| **UC-HRM-CO-01** | «Lấy group-member-units» → danh sách ĐVTV | Same read plane (consumer) |
| Related | `GET …/org-foundation/org-units/tree` | Tree alternate for ORG-01 — not redefined here |

### DTO ↔ DB

| Wire field | DB | Notes |
|------------|-----|-------|
| `holding.*` | `xbos_tenant_registry` | Nav only |
| `members[].id` | `xbos_legal_entity.id` | Plane A UUID |
| `members[].code` / `name` | same | Display |
| **`members[].business_lines`** | **`business_lines`** | **must_keep** — industry SoT |
| `members[].entity_type` | `entity_type` | Loại ĐVTV — **cấm** bind → industry |
| `members[].payload` | `payload` | Fallback `companyForm.industry` |
| `members[].tenant_id` (+ names) | registry | Bridge |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|-----|
| Unauthenticated | `XBOS-AUTH-001` | 401 | Banner; no fake rows |
| Member-only CEO | `XBOS-TENANT-403` | 403 | Scope message |
| Empty members | `XBOS-TENANT-200` + `[]` | 200 | Empty trung thực |

### FE after 2xx (U65)

List/cây có dữ liệu hoặc empty · chọn dòng mang `entityId` · cột ngành nghề không hiện raw `subsidiary` · F5 còn.

---

## 2. Endpoint B — List legal entities (GET)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/org-foundation/legal-entities` |
| operationId | `orgFoundationListLegalEntities` |
| Runtime | `OrgFoundationService.listLegalEntities` / group flat when `companyId=holding` / `main` |
| Success | `200` · **`XBOS-ORG-200`** |

### Mục đích

Cấp **hồ sơ pháp nhân đầy đủ** (SELECT `le.*` gồm `business_lines`, MST, vốn, đại diện, payload) để màn hồ sơ / CO-BIND enrich sau group-member-units.

### Nghiệp vụ xử lý

1. `resolveScopeContext` + JWT/`x-tenant-id`/`x-company-id` parity (list vs later get/PUT).
2. Holding / group plane: flat member LEs when scope is group (`holding` / `main` per existing service rules).
3. Return active legal rows — includes **`business_lines`** and **`entity_type`**.
4. Soft-deleted excluded.
5. Scope mismatch → **409** `SCOPE_CONTEXT_MISMATCH`.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | **#2 mở form hồ sơ** (load dữ liệu hiện có) | **This endpoint** (list/enrich) |
| **FR-XBOS-ORG-01** | After #5 chọn đơn vị — mở chi tiết | Profile load |
| **UC-HRM-CO-01** | Enrich profile (MST, founded, ngành nghề) | CO-BIND consumer |

### DTO ↔ DB

| Wire (snake or camel) | DB column | Notes |
|-----------------------|-----------|-------|
| `id` | `id` | Plane A |
| `code` / `name` | same | Required display |
| `entity_type` / `entityType` | `entity_type` | Classification |
| **`business_lines` / `businessLines`** | **`business_lines`** | Industry SoT |
| `tax_code` / `taxCode` | `tax_code` | MST |
| `established_at` / `establishedAt` | `established_at` | Date |
| `address` | `address` | |
| `charter_capital` / `charterCapital` | `charter_capital` | Money |
| `legal_representative` / `legalRepresentative` | `legal_representative` | |
| `payload` | `payload` | JSON |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Auth | `XBOS-AUTH-001` | 401 |
| Scope mismatch | `SCOPE_CONTEXT_MISMATCH` | 409 |
| Empty list | `XBOS-ORG-200` + `[]` | 200 |

---

## 3. Endpoint C — Create legal entity (POST)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/org-foundation/legal-entities` |
| operationId | `orgFoundationCreateLegalEntity` |
| DTO | `UpsertLegalEntityDto` |
| Success | **`XBOS-ORG-201`** |

### Mục đích

**Tạo mới** bản ghi pháp nhân Plane A trong partition tenant/company khi CC / org foundation cần thêm hồ sơ ĐKKD (không thay thế shareholders).

### Nghiệp vụ xử lý

1. Scope resolve + validate DTO (`code`, `name` minLength 1).
2. Optional fields: `entityType`, `taxCode`, `establishedAt`, `address`, **`businessLines`**, `charterCapital` (≥0), `legalRepresentative`, `payload`.
3. INSERT `xbos_legal_entity`; default `entity_type='subsidiary'` if omitted.
4. Persist **`business_lines`** from `businessLines` — **cấm** map industry → `entityType`.
5. Unique `(tenant_id, company_id, code)` conflict → deterministic error (runtime / 409 family).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | #3 thiếu bắt buộc · **#4 lưu hồ sơ** (create path) · #8 F5 · #9 thành công | **This endpoint** |

### DTO ↔ DB

| Request (camel) | DB column |
|-----------------|-----------|
| `code` | `code` |
| `name` | `name` |
| `entityType` | `entity_type` |
| `taxCode` | `tax_code` |
| `establishedAt` | `established_at` |
| `address` | `address` |
| **`businessLines`** | **`business_lines`** |
| `charterCapital` | `charter_capital` |
| `legalRepresentative` | `legal_representative` |
| `payload` | `payload` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Validation / thiếu tên-mã | pipe / `XBOS-ORG-*` | 400 |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 |
| Auth | `XBOS-AUTH-001` | 401 |

### FE after 2xx

Toast tạo OK · form/list phản ánh · F5 còn · Network `XBOS-ORG-201`.

---

## 4. Endpoint D — Upsert legal entity (PUT)

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/org-foundation/legal-entities/{entityId}` |
| operationId | `orgFoundationUpsertLegalEntity` |
| DTO | `UpsertLegalEntityDto` |
| Success | **`XBOS-ORG-201`** |
| Path | `entityId` = Plane A UUID |

### Mục đích

**Lưu / cập nhật hồ sơ pháp nhân** đã chọn (tên, MST, đại diện, địa chỉ, vốn, **ngành nghề**, loại ĐVTV) trên Command Center / form pháp nhân — kết quả còn sau F5.

### Nghiệp vụ xử lý

1. Auth + scope: JWT may read/write legal partition for `entityId` (group legal resolve).
2. Validate required `code`/`name`; `charterCapital` ≥ 0 when present.
3. UPSERT/UPDATE columns including **`business_lines = businessLines`**.
4. `entityType` chỉ khi đổi **loại ĐVTV** — never from industry Select.
5. Not found / wrong partition → **`XBOS-ORG-404`** (or equivalent).
6. Money display grouping is FE NFR; API stores plain number.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | #1 auth · #2 mở form · #3 thiếu bắt buộc · **#4 Lưu hồ sơ** · #8 tải lại · #9 thành công | **This endpoint** |
| UF-XBOS-03 | Save legal profile | Same |

### DTO ↔ DB

Same matrix as Endpoint C; path `entityId` → `id`.

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|-----|
| Validation | 400 / pipe | 400 | Nêu trường; không toast success |
| Not found / partition | `XBOS-ORG-404` | 404 | Toast lỗi |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 | Banner |
| Auth | `XBOS-AUTH-001` | 401 | Re-login |

### FE after 2xx (U65)

Toast lưu thành công · form phản ánh giá trị mới · F5 còn · Network `XBOS-ORG-201` · ngành nghề VI đúng `business_lines`.

---

## 5. Endpoint E — List documents

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/org-foundation/legal-entities/{entityId}/documents` |
| operationId | `orgFoundationListDocuments` |
| Success | **`XBOS-DOC-200`** · `{ items: LegalEntityDocument[] }` |
| Runtime | `LegalEntityProfileService.listDocuments` |

### Mục đích

Hiển thị **danh sách tài liệu pháp lý active** của pháp nhân đang mở để người dùng xem metadata và mở tệp đã upload.

### Nghiệp vụ xử lý

1. Resolve entity partition + scope (`resolveXbosGroupLegalReadScopeContext`).
2. `SELECT * FROM xbos_legal_entity_document WHERE legal_entity_id=$1 AND status active`.
3. Entity missing → **`XBOS-DOC-404`**.
4. Snake_case row fields on wire.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | #2 mở form (kèm TL) · #7 xem tệp (cần list có `file_url`) · #8 F5 | **This endpoint** |
| UC-CC-P0-02 | List documents | Same |

### DTO ↔ DB

| Wire | DB |
|------|-----|
| `id` | `id` |
| `legal_entity_id` | `legal_entity_id` |
| `document_code` / `document_name` | same |
| `issued_date` / `expired_date` | DATE |
| `file_url` / `storage_path` / `mime_type` / `file_size` | same |
| `status` | `status` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Auth | `XBOS-AUTH-001` | 401 |
| Entity/partition | `XBOS-DOC-404` | 404 |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 |

---

## 6. Endpoint F — Create document metadata (POST)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/org-foundation/legal-entities/{entityId}/documents` |
| operationId | `orgFoundationCreateDocument` |
| Body | `CreateDocumentRequest` |
| Success | `201` · **`XBOS-DOC-201`** |

### Mục đích

**Thêm dòng tài liệu** (metadata) trước khi upload tệp — khóa `documentId` mang sang bước upload/xem.

### Nghiệp vụ xử lý

1. Scope mutation group legal.
2. Require `documentName` trimmed non-empty → else **`XBOS-DOC-400`**.
3. Optional `documentCode`, `issuedDate`, `expiredDate`.
4. INSERT row `status=active`; `file_url`/`storage_path` null until upload.
5. Return created snake_case row.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | **#5 Thêm tài liệu** (metadata hợp lệ) · #9 khóa tài liệu | **This endpoint** |

### DTO ↔ DB

| Request camel | DB |
|---------------|-----|
| `documentName` | `document_name` |
| `documentCode` | `document_code` |
| `issuedDate` | `issued_date` |
| `expiredDate` | `expired_date` |
| (path) `entityId` | `legal_entity_id` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Missing name | `XBOS-DOC-400` | 400 |
| Entity | `XBOS-DOC-404` | 404 |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 |

### FE after 2xx

Row mới trên bảng TL · chưa giả «đã có file» nếu chưa upload · F5 còn metadata.

---

## 7. Endpoint G — Update document metadata (PUT)

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/org-foundation/legal-entities/{entityId}/documents/{documentId}` |
| operationId | `orgFoundationUpdateDocument` (OpenAPI sibling) |
| Body | `UpdateDocumentRequest` (partial COALESCE) |
| Success | **`XBOS-DOC-200`** / `201` family per runtime envelope |

### Mục đích

Sửa metadata tài liệu (tên, mã, ngày) **không** thay thế upload binary.

### Nghiệp vụ xử lý

1. Scope + parent entity match.
2. Partial update COALESCE on provided fields.
3. Empty `documentName` if sent → `XBOS-DOC-400`.
4. Missing doc → `XBOS-DOC-404`.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | #5 (sửa metadata) · #8 F5 | **This endpoint** |

### DTO ↔ DB

Same camel→snake as create; path ids → `legal_entity_id` / `id`.

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Validation | `XBOS-DOC-400` | 400 |
| Not found | `XBOS-DOC-404` | 404 |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 |

---

## 8. Endpoint H — Soft-delete document (DELETE)

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/xbos/org-foundation/legal-entities/{entityId}/documents/{documentId}` |
| Success | **`XBOS-DOC-204`** / deleted flag envelope |

### Mục đích

Gỡ tài liệu khỏi danh sách active (soft-delete) khi user xóa dòng TL.

### Nghiệp vụ xử lý

1. Scope mutation.
2. `UPDATE status='deleted'` (không hard-delete mặc định).
3. File on disk may remain until ops GC — product must not claim success if row missing.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | Alternate path gỡ TL · #8 F5 không còn dòng | **This endpoint** |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found | `XBOS-DOC-404` | 404 |
| Scope | `SCOPE_CONTEXT_MISMATCH` | 409 |

---

## 9. Endpoint I — Upload document file (POST multipart)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/xbos/org-foundation/legal-entities/{entityId}/documents/{documentId}/upload` |
| Field | `multipart/form-data` · `file` |
| Success | **`XBOS-DOC-201`** / `200` with updated `file_url` |

### Mục đích

**Tải tệp đính kèm** vào storage và gắn `file_url` / `storage_path` / mime / size để người dùng xem lại được.

### Nghiệp vụ xử lý

1. Scope + document belongs to entity.
2. Extension ∉ `{pdf,doc,docx,xls,xlsx}` → **`XBOS-DOC-415`**.
3. Size > max → **`XBOS-DOC-413`**.
4. Write path `{root}/{tenantId}/{entityId}/{documentId}.{ext}`.
5. UPDATE document columns; build public URL via `XBOS_PUBLIC_BASE_URL`.
6. Upload fail → **không** báo thành công giả; metadata row giữ nguyên nếu đã tạo (FR-ORG-03).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | **#6 Upload tệp lỗi** · success path trước #7 xem tệp | **This endpoint** |
| UF-XBOS-06 | Upload legal doc | Same |

### DTO ↔ DB

| Source | DB |
|--------|-----|
| file bytes | → disk `storage_path` |
| detected mime / size | `mime_type` / `file_size` |
| public URL | `file_url` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Bad type | `XBOS-DOC-415` | 415 |
| Too large | `XBOS-DOC-413` | 413 |
| Missing doc | `XBOS-DOC-404` | 404 |
| Validation | `XBOS-DOC-400` | 400 |

### FE after 2xx

Có thể mở / tải tệp · F5 vẫn xem được · không toast success khi 4xx.

---

## 10. Endpoint J — Stream / download file (GET)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/org-foundation/legal-documents/{documentId}/file` |
| operationId | OpenAPI legal-documents file |
| Success | `200` binary stream |

### Mục đích

**Xem / tải nội dung tệp** đã upload thành công cho tài liệu pháp lý.

### Nghiệp vụ xử lý

1. Resolve document by id + auth/scope (proxy must not strip auth — CC P0 deploy note).
2. Missing file/row → **`XBOS-DOC-404`**.
3. Stream from `storage_path` with `mime_type`.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-ORG-03** | **#7 Xem tệp** · #8 F5 | **This endpoint** |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found | `XBOS-DOC-404` | 404 |
| Auth | `XBOS-AUTH-001` | 401 |

---

## 11. Cross-cutting contracts

### 11.1 Scope parity (U19)

| Surface | Resolver |
|---------|----------|
| List LE / PUT LE / documents* | Same group-legal / tenant-company scope family |
| group-member-units | Master membership gate (`XBOS-TENANT-403`) |
| Headcount | **Never** via these endpoints |

### 11.2 Industry bind (must_keep HRM pair)

```text
MUST:   industry ← business_lines (VI map) ?? companyForm.industry
MUST NOT: industry ← entity_type
SEE:    docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md §3
```

### 11.3 Orthogonal consumers

| Consumer | Endpoints |
|----------|-----------|
| HRM CompanyManagement | A (+ B enrich) · industry pair |
| Command Center legal profile | B/C/D + E–J |
| Shareholders | Separate API_DESIGN work item |

---

## 12. QA evidence expectations (U65 — browser)

```markdown
### UF-XBOS-02 — Danh sách ĐVTV
- Persona: ceo@xe.vn · CC / org
- Network: GET group-member-units → XBOS-TENANT-200
- FE: list/empty; chọn mang entityId; business_lines không hiện "subsidiary"
- F5: còn

### UF-XBOS-03 — Lưu hồ sơ pháp nhân
- Action: sửa form → Lưu
- Network: PUT legal-entities/{id} → XBOS-ORG-201
- FE sau 2xx: form phản ánh; F5 còn; vốn nhóm nghìn UI

### UF-XBOS-06 — Tài liệu pháp lý
- Action: Thêm TL → Upload → Xem
- Network: POST documents 201 · upload 2xx · GET file 200
- Fail type/size: XBOS-DOC-415/413 — không toast success giả
- F5: metadata + file còn
```

---

## 13. Out of scope

- Shareholders POST/PUT/DELETE F.1 (`SA-U71-XBOS-SHAREHOLDER-DESIGN-01`)
- Org-units department CRUD (FR-ORG-02)
- Rewriting `API_DESIGN_HRM_COMPANY_LIST.md`
- Seed for QA PASS (U65)
