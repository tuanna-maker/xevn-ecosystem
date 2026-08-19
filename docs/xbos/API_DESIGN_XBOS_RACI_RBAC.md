# API_DESIGN — XBOS RACI · Position RBAC · CC catalogs

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-RACI-RBAC-CAT-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | Khách `SRS_XBOS_KHACH.md` **§3.13 FR-XBOS-RACI-02** Diễn biến #1–8 · **§3.14 FR-CC-P0-04** Diễn biến #1–7 · **§3.15 FR-CC-P0-05** Diễn biến #1–7 · **UF-XBOS-07** · **UF-XBOS-13** · **UF-XBOS-14** |
| **ref_techspec** | `docs/xbos/TECHSPEC.md` **§14.14–14.16** · CC P0 TechSpec §4 · `RACI_GOVERNANCE_TECHSPEC.md` (paths superseded by runtime/TECHSPEC master) |
| **ref_db** | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` |
| **ref_workflow** | `docs/xbos/API_DESIGN_XBOS_WORKFLOW.md` — task assignee / `assignment_id` soft (**must_keep**) |
| **ref_catalog_gov** | `docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md` — publish ≠ CC autosave (**must_keep**) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | F.1-complete before Dev OpenAPI deepen on raci / CC catalogs |
| **Date** | 2026-07-27 |
| **Runtime** | `RaciGovernanceController` · `PositionRbacController` · `BusinessMasterController` |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` — **ALIGNED** G-OA-W2-RACI-01 + G-OA-W2-CC-CAT-01 + G-DTO-W2-RACI-01 + G-DTO-W2-POS-01 (BE-XBOS-OA-DTO-P2-01 2026-07-27) · positionRbac* F.1 · CC kinds enum/examples |
| **Base paths** | `/api/xbos/raci-governance` · `/api/xbos/position-rbac` · `/api/xbos/business-master` |

> **Envelope:** Nest `ok(data, code, message)`.  
> **must_keep:** UF-XBOS-07/13/14 🟢 · catalog-gov / Settings · workflow soft assignment · U65 zero-seed.  
> **Rule:** Document **runtime** paths (companies/{companyId}/matrix) — not legacy shorthand in RACI_GOVERNANCE_TECHSPEC §2 alone.

---

## 0. Common contract

| Item | Value |
|------|--------|
| Auth | Bearer JWT and/or `x-internal-api-key` |
| Headers | `authorization` · optional `x-tenant-id` / `x-company-id` · `x-user-id` (actor) |
| Scope RACI | `resolveRaciMatrixJwtScope` + `assertJwtMayReadLegalEntityPartition` / `resolveCompanyMatrixScope` — list matrix vs cell mutate **same resolver** (G-SCOPE-W2-RACI) |
| Scope CC catalogs | Group CEO JWT `main` → partition **`holding`** on list/upsert |
| Scope position matrix | Tenant + `roleId`; deny write without config permission |
| Letters RACI | Wire `raci_letters` match `^[RACI]*$`; empty = clear override |

### Locale / FE

| Concern | Rule |
|---------|------|
| Labels | VI technical; invalid/null → «—» |
| Money (pricing) | FE nhóm nghìn; API `amount` số thuần |
| Empty CC list | Valid — không seed |
| After 2xx | Ô/checkbox đổi ngay; **F5** còn; pháp nhân / role khác không đổi |

---

## 1. Endpoint A — RACI catalog (read)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/raci-governance/catalog` |
| Success | HTTP 200 · **`XBOS-RACI-200`** |
| Auth | Bearer / internal + tenant scope |
| Query | Optional domain / q (runtime filter) |

### Mục đích

Cấp **catalog hoạt động RACI hiệu lực** (version + activities + default matrix mẫu) để FE vẽ lưới và chọn `activity_id` trước khi xem/ghi đè theo pháp nhân — phục vụ mở tab Nhiệm vụ và RACI (FR-XBOS-RACI-02).

### Nghiệp vụ xử lý

1. Assert auth; resolve `tenant_id`.
2. Load active `raci_catalog_version` (+ activities for tenant).
3. Return projection: activities with `activity_code`, `domain_*`, `seq_no`, `name`, `default_matrix`.
4. Missing catalog → empty/`not ready` family per runtime — **không** invent activities for UAT.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-RACI-02** | #2 Mở tab — hiện ma trận (cần catalog) | **This endpoint** (catalog leg) |
| UC-RACI-02 | Điều kiện — catalog hiệu lực | Enables |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `activities[].id` | `raci_activity_catalog.id` |
| `activity_code` / `name` / `domain_*` | columns |
| `default_matrix` | `default_matrix` JSONB |
| `version_label` | `raci_catalog_version.version_label` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Unauthorized | `XBOS-AUTH-001` | 401 | Diễn biến #1 |
| Success | `XBOS-RACI-200` | 200 | Bind grid columns |

### FE after 2xx

Catalog sẵn sàng cho filter domain; chưa mutate cell.

---

## 2. Endpoint B — Company RACI matrix (read)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/raci-governance/companies/{companyId}/matrix?domain=` |
| Success | **`XBOS-RACI-200`** |
| Auth | Bearer + **same scope resolver** as cell PUT |
| Path | `companyId` = slug **hoặc** LE UUID (assert then resolve partition) |

### Mục đích

Trả **ma trận đã merge** (mẫu tập đoàn ⊕ ghi đè pháp nhân) cho pháp nhân đang mở — người dùng xem đúng ô trước khi sửa (FR-XBOS-RACI-02 Diễn biến #2).

### Nghiệp vụ xử lý

1. Auth; `resolveCompanyMatrixScope` / JWT may-read partition — ngoài phạm vi → **409/403** (Diễn biến #3).
2. Persist key = resolved `company_id` TEXT (không ghi nhầm pháp nhân khác).
3. Load cells `company_raci_matrix_cell` for scope; merge with `default_matrix` / catalog.
4. Optional `domain` filter on activities.
5. Return matrix rows/cells for FE `CompanyRaciPanel`.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-RACI-02** | #2 Hiện ma trận | **This endpoint** |
| **FR-XBOS-RACI-02** | #3 Ngoài phạm vi | Fail path |
| **FR-XBOS-RACI-02** | #7 Tải lại | Re-GET after mutate |

### Response ↔ DB

| Wire | DB |
|------|-----|
| cells / letters | `company_raci_matrix_cell.raci_letters` + template |
| `activity_id` | FK activity |
| `org_column_id` | column |
| `companyId` | `company_id` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Out of scope | `SCOPE_CONTEXT_MISMATCH` / deny family | 409/403 | Diễn biến #3 |
| Success | `XBOS-RACI-200` | 200 | Grid filled |

### FE after 2xx

Ma trận hiển thị; pháp nhân khác khi mở tab riêng không thấy ghi đè của A.

---

## 3. Endpoint C — Upsert / clear RACI cell (mutate)

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/raci-governance/companies/{companyId}/matrix/cell` |
| Success | **`XBOS-RACI-201`** |
| Auth | Bearer + write scope = **same resolver as GET matrix** |
| Body | `{ activity_id: string; org_column_id: string; raci_letters: string; actor_id?: string }` |

### Mục đích

Cho phép **lưu một ô RACI theo pháp nhân** (hoặc xóa ghi đè khi letters rỗng) để F5 vẫn đúng và không lan sang pháp nhân khác — FR-XBOS-RACI-02 Diễn biến #5–#8 · UF-XBOS-07.

### Nghiệp vụ xử lý

1. Auth + scope assert on path `companyId` (parity with GET — G-SCOPE-W2-RACI).
2. Validate `activity_id` exists in catalog; `org_column_id` ∈ chuẩn cột; `raci_letters` ∈ `^[RACI]*$` — else **400** (Diễn biến #4).
3. If letters empty → delete/clear override row (template wins) — Diễn biến #6.
4. Else upsert `company_raci_matrix_cell` with `source=company_override`, set `updated_by`.
5. Append `raci_matrix_audit_log` (old/new letters, actor).
6. Return updated cell / matrix slice.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-XBOS-RACI-02** | #4 Ký tự lạ | Fail validate |
| **FR-XBOS-RACI-02** | #5 Lưu ô hợp lệ | **This endpoint** |
| **FR-XBOS-RACI-02** | #6 Xóa giá trị ô | Clear override |
| **FR-XBOS-RACI-02** | #7–#8 Thành công / F5 | Client re-GET + persistence |
| UF-XBOS-07 | FE sau 2xx + F5 | Evidence |

### DTO ↔ DB

| Request | DB |
|---------|-----|
| path `companyId` (resolved) | `company_raci_matrix_cell.company_id` |
| `activity_id` | `activity_id` |
| `org_column_id` | `org_column_id` |
| `raci_letters` | `raci_letters` |
| `actor_id` | audit `actor_id` / `updated_by` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Invalid letters | VAL / `XBOS-RACI-400` family | 400 | Diễn biến #4 |
| Scope mismatch | 409 family | 409 | Toast; no write |
| Success | `XBOS-RACI-201` | 200 | Ô đổi ngay |

### FE after 2xx (U65)

Ô hiển thị giá trị mới; **F5** còn; mở pháp nhân B — không đổi theo A.

---

## 4. Endpoint D — RACI capabilities / coverage (read — supporting)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/raci-governance/capabilities` · `GET …/companies/{companyId}/coverage` |
| Success | **`XBOS-RACI-200`** |
| Auth | Bearer + scope |

### Mục đích

Cấp **coverage / capability map** cho tab phụ FE (capabilities) — không thay mutate cell; hỗ trợ quan sát liên kết module↔activity.

### Nghiệp vụ xử lý

1. Auth + tenant/company scope.
2. Join `raci_ecosystem_capability` ↔ activities; coverage aggregates cells vs template.
3. Return stats/tables for FE — empty valid.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-XBOS-RACI-02** | #2 (mở rộng tab) | Supporting read |
| RACI_GOVERNANCE_TECHSPEC §4 UI | capabilities / coverage tabs | **This** |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Scope deny | 409/403 | Hide tab data |
| Success | `XBOS-RACI-200` | Tables |

---

## 5. Endpoint E — Position permission matrix (read)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/position-rbac/matrix?roleId=` |
| OpenAPI | `positionRbacGetMatrix` |
| Success | **`XBOS-POS-200`** · data `{ roleId, rows }` |
| Auth | Bearer + permission to open Settings RBAC |

### Mục đích

Tải **ma trận checkbox phân quyền** theo chức danh (`roleId`) cho màn Settings — FR-CC-P0-04 Diễn biến #2 · UF-XBOS-13.

### Nghiệp vụ xử lý

1. Auth; require config permission — else deny / read-only (Diễn biến #3).
2. Require `roleId` query non-empty.
3. SELECT `xbos_cc_permission_matrix_cell` WHERE tenant + role; map to `{ rowId, view, write, delete, approve, dataScope }`.
4. Missing rows → FE shows unchecked defaults (empty DB = valid).

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-CC-P0-04** | #2 Hiện ma trận | **This endpoint** |
| **FR-CC-P0-04** | #6 Tải lại | Re-GET |
| UF-XBOS-13 | Evidence | — |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `roleId` | `role_id` |
| `rows[].rowId` | `row_id` |
| `view/write/delete/approve` | booleans |
| `dataScope` | `data_scope` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Missing roleId | `XBOS-POS-400` | 400 | Prompt select role |
| Unauthorized | AUTH | 401/403 | Diễn biến #1/#3 |
| Success | `XBOS-POS-200` | 200 | Checkboxes |

---

## 6. Endpoint F — Position permission matrix (save)

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/position-rbac/matrix` |
| OpenAPI | `positionRbacSaveMatrix` |
| Success | **`XBOS-POS-201`** |
| Body | `{ roleId: string; rows: Array<{ rowId; view; write; delete; approve; dataScope }> }` |

### Mục đích

**Lưu gộp** trạng thái checkbox xem/ghi/xóa/duyệt (+ dataScope) theo đúng chức danh đang chọn — sau F5 còn đúng; không ghi đè nhầm role khác — FR-CC-P0-04 Diễn biến #4–#7 · UF-XBOS-13.

### Nghiệp vụ xử lý

1. Auth + config-permission write — thiếu → không lưu (Diễn biến #3).
2. Validate `roleId`; skip empty `rowId`.
3. For each row: upsert `xbos_cc_permission_matrix_cell` ON CONFLICT PK update flags + `updated_at`.
4. Return `getPermissionMatrix` for same role.
5. **Does not** mutate other `role_id` partitions.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-CC-P0-04** | #4 Đổi checkbox | Client state |
| **FR-CC-P0-04** | #5 Lưu | **This endpoint** |
| **FR-CC-P0-04** | #6–#7 F5 / khóa | Persistence proof |
| UF-XBOS-13 | FE after 2xx | Evidence |

### DTO ↔ DB

| Request | DB |
|---------|-----|
| `roleId` | `role_id` |
| `rows[].rowId` | `row_id` |
| flags | `view`/`write`/`delete`/`approve` |
| `dataScope` | `data_scope` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Validation | `XBOS-POS-400` | 400 | Keep old UI state |
| No permission | 403 | 403 | Hide save |
| Success | `XBOS-POS-201` | 200 | Checkboxes sticky |

### FE after 2xx

Checkbox giữ; **F5** khớp; role khác không đổi.

---

## 7. Endpoint G — Position assignments (supporting · WF soft)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET/POST /api/xbos/position-rbac/assignments` (+ PUT by id runtime) |
| Success | **`XBOS-POS-200`** / create family |
| Auth | Bearer + company scope |

### Mục đích

Quản lý **gán người ↔ chức danh mẫu** (`xbos_position_assignment`) — khóa mang `assignment.id` để workflow step_task soft-cite (must_keep WF pair); không thay Settings permission matrix.

### Nghiệp vụ xử lý

1. Scope `(tenant_id, company_id)`.
2. List joins template code/name; upsert requires `positionTemplateId`.
3. Persist `user_id` / `employee_id` / validity dates.
4. WF engine may store `assignment_id` on tasks — **cite only** (API_DESIGN_XBOS_WORKFLOW).

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| Org / position foundation | Assign people to hats | Supporting |
| FR-WF-* | Inbox assignee resolve | Soft FK consumer |
| FR-CC-P0-04 | Unlocked after RACI | Adjacent config |

### DTO ↔ DB

| Request | DB |
|---------|-----|
| `positionTemplateId` | `position_template_id` |
| `userId` / `employeeId` | TEXT columns |
| `orgUnitId` | `org_unit_id` |
| response `id` | Soft target for WF |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Missing template | `XBOS-POS-400` | Field error |
| Not found | `XBOS-POS-404` | Toast |
| Grant conflict (related) | `XBOS-POS-409` | Conflicts payload |

---

## 8. Endpoint H — CC catalogs list

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/business-master/command_center_catalogs/items` |
| Success | **`XBOS-MASTER-200`** |
| Auth | Bearer + group/member scope (`main`→`holding`) |
| Alias | `GET …/business-master/command_center_catalogs` (controller also lists domain) |

### Mục đích

Tải **danh sách catalog Command Center** (văn bản / đo lường / giá) trong phạm vi — empty hợp lệ — FR-CC-P0-05 Diễn biến #2 · UF-XBOS-14.

### Nghiệp vụ xử lý

1. Auth; resolve company partition (`holding` for group CEO main).
2. Assert domain whitelist includes `command_center_catalogs`.
3. SELECT entries for domain; flatten partition + row codes for FE (runtime UF-14).
4. Empty → `items: []` — **không** seed.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-CC-P0-05** | #2 Danh sách hoặc empty | **This endpoint** |
| **FR-CC-P0-05** | #3 Ngoài phạm vi | Fail |
| **FR-CC-P0-05** | #6 Tải lại | Re-GET |
| UF-XBOS-14 | Evidence | — |

### Response ↔ DB

| Wire | DB |
|------|-----|
| partition `id` ∈ regulations\|measurements\|pricing | `item_id` |
| `payload.rows` / flattened `code` | `payload` JSONB |
| `companyId` | `company_id` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Invalid domain | `XBOS-MASTER-400` | 400 | — |
| Scope | 409 | 409 | Diễn biến #3 |
| Success | `XBOS-MASTER-200` | 200 | Grid / empty |

---

## 9. Endpoint I — CC catalogs autosave (upsert)

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/business-master/command_center_catalogs/items/{itemId}` |
| Success | **`XBOS-MASTER-201`** |
| Auth | Bearer + write scope (holding for group) |
| `itemId` | `regulations` \| `measurements` \| `pricing` **or** flat row `code` |

### Mục đích

**Autosave** một partition hoặc một dòng catalog CC sau khi user sửa ô — **không** đi qua catalog-governance publish — FR-CC-P0-05 Diễn biến #5–#7 · UF-XBOS-14.

### Nghiệp vụ xử lý

1. Auth + scope (`main`→`holding` write parity with list).
2. Validate body:
   - Partition mode: `{ rows: […] }` with kind-specific fields.
   - Flat mode: requires `category ∈ {regulations,measurements,pricing}` + row fields; merge into partition payload.
3. Pricing `amount` = plain number (reject non-numeric) — FE formats thousands.
4. Upsert `xbos_business_master_entries` PK; bump `updated_at`.
5. Return saved projection; **do not** call config-sync publish.

### Bước SRS

| UC / FR | Diễn biến # | API role |
|---------|-------------|----------|
| **FR-CC-P0-05** | #4 Sai định dạng | Fail — giữ cũ |
| **FR-CC-P0-05** | #5 Autosave hợp lệ | **This endpoint** |
| **FR-CC-P0-05** | #6–#7 F5 / khóa dòng | Persistence |
| Quy tắc SRS | Không dùng publish thay autosave | Anti catalog-gov misuse |
| UF-XBOS-14 | FE after 2xx | Evidence |

### DTO ↔ DB

| Request | DB |
|---------|-----|
| path `itemId` (partition) | `item_id` |
| body `rows` / flat fields | `payload` |
| scope | `tenant_id`, `company_id` |
| `domain` literal | `command_center_catalogs` |

### Errors

| Condition | Code | HTTP | FE |
|-----------|------|------|----|
| Bad category / domain | `XBOS-MASTER-400` | 400 | Diễn biến #4 — giữ cũ |
| Scope | 409 | 409 | Toast |
| Success | `XBOS-MASTER-201` | 200 | Ô sticky |

### FE after 2xx (U65)

Ô đã tự lưu; **F5** còn; empty trước đó vẫn hợp lệ nếu chưa có dòng.

---

## 10. Error / code index (slice)

| Code | HTTP | Used by |
|------|------|---------|
| `XBOS-RACI-200` | 200 | Catalog / matrix / capabilities read |
| `XBOS-RACI-201` | 200 | Cell PUT |
| `XBOS-POS-200` | 200 | Matrix GET (+ supporting lists) |
| `XBOS-POS-201` | 200 | Matrix PUT |
| `XBOS-POS-400` / `404` / `409` | 4xx | Validation / not found / grant conflict |
| `XBOS-MASTER-200` / `201` | 200 | CC list / autosave |
| `XBOS-MASTER-400` | 400 | Domain/category validation |
| `SCOPE_CONTEXT_MISMATCH` | 409 | Scope parity fails |

---

## 11. OpenAPI residual

| Gap | work_item | Note |
|-----|-----------|------|
| G-OA-W2-RACI-01 | `BE-XBOS-OA-RACI-CC-01` | **CLOSED** 2026-07-27 — `xbos-api.yaml` paths A–D + F.1 descriptions/examples |
| G-DTO-W2-RACI-01 | `BE-XBOS-OA-DTO-P2-01` | **CLOSED** 2026-07-27 — Nest `UpsertRaciMatrixCellRequestDto` + OpenAPI align |
| G-OA-W2-CC-CAT-01 | `BE-XBOS-OA-RACI-CC-01` | **CLOSED** 2026-07-27 — CommandCenterCatalogKind enum + partition/flat examples |
| G-DTO-W2-CC-CAT-01 | gộp OA | **CLOSED** (Cc*Row components) |
| G-DTO-W2-POS-01 | `BE-XBOS-OA-DTO-P2-01` | **CLOSED** 2026-07-27 — PermissionMatrixRow / SavePermissionMatrixRequest F.1 + Nest DTO |

**must_keep:** Do not change UF-XBOS-07/13/14 runtime behavior solely to sync yaml.

---

## 12. Cross-slice must_keep

| Slice | Rule |
|-------|------|
| Catalog-gov | Publish/pull L0 ≠ Endpoint I autosave |
| Settings HRM | Unchanged consumer of catalog-gov |
| Workflow | Soft `assignment_id` ↔ Endpoint G ids |
| Org-legal / SHR | Out of scope — do not wipe |
