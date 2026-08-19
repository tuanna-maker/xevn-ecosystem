# API_DESIGN — HRM Settings catalogs (list / create / update / sync)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | `docs/hrm/SRS.md` UC-HRM-06..08 · **FR-HRM-SC-01** · **FR-HRM-SC-POS-01** · **FR-HRM-SC-LEAVE-01** · `SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` §2 · §4 Diễn biến |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` §11.4 · §14.8 · §16.2 (#28–29) · §18.1 |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` |
| **ref_adr** | `ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723` S1/S3 |
| **ref_xbos** | FR-XBOS-CAT-02 · FR-XBOS-CAT-05 · `GET/POST …/config-sync/catalog*` (upstream) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | F.1-complete before Dev/QA Settings claim |
| **Date** | 2026-07-27 |
| **Base paths** | `/api/hrm/settings-catalogs` · `/api/hrm/catalog-sync` |
| **Auth** | Bearer JWT and/or internal API key (same as runtime controllers) |

> **Rule:** Every mutate path is **extension overlay** or **pull from XBOS** — never “HRM invents group master SoT”. Seed routes exist for bootstrap only — **cấm** trong evidence U65.

---

## E1-B APPEND — Bucket expand + alias + sync gap (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1B-DB-API-01` |
| **Slice SoT** | **`docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md`** (A′–G′ alias-aware · F.1 complete) |
| **DB sibling** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` |
| **Sync gap** | **No new HTTP path** — `POST …/sync-from-xbos` already pull-all; gap = alias resolve + ≥10 MD surface |

Base Endpoints A–H remain SoT for leave/dept/pos CRUD semantics; E1-B deltas **extend** them for DEC live key + new buckets.

---

## 0. Shared types

### `SettingsCatalogItem`

| Wire field | DB source | Notes |
|------------|-----------|-------|
| `code` | `config_catalog_items.code` / `hrm_catalog_extension_items.code` / payload item | Persist key |
| `label` | `.label` | VI display |
| `unit` | `.unit` | Optional |
| `status` | `.status` | `active` \| `draft` |
| `origin` | derived | `xbos` \| `hrm` |

### Scope headers

| Header / query | Role |
|----------------|------|
| `x-tenant-id` / JWT tenant | Tenant partition |
| `x-company-id` or `company_id` | Company partition — resolved via `resolveHrmSettingsCatalogCompanyId` / `resolveHrmCatalogSyncScope` (`main`→holding) |

---

## 1. Endpoint A — Overview list (Settings home)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/settings-catalogs` |
| Success | `200` · `HRM-SET-200` |
| Runtime | `SettingsCatalogsController.overview` → `getOverview` |

### Mục đích

Cấp **tổng quan nhóm danh mục cấu hình** (gồm loại nghỉ, phòng ban, chức danh) cho màn Cài đặt HRM: mỗi nhóm kèm `effectiveItems` đã merge snapshot XBOS + extension — để HCNS thấy đã đồng bộ hay empty trung thực.

### Nghiệp vụ xử lý

1. Auth + resolve tenant/company catalog partition.
2. Load `synced_catalogs` (+ extension / pending requests) per known keys.
3. `mergeEffective` → `effectiveItems[]` with `origin`.
4. Empty snapshot → return groups with empty items / «chưa đồng bộ» — **không** fake mock.
5. Does **not** publish to XBOS; does **not** invent master codes.

### Bước SRS

| UC / FR | Sequence / Diễn biến | API role |
|---------|----------------------|----------|
| **FR-HRM-SC-01** / HRM-SC-01 | Diễn biến #1 auth · #2 Mở tổng quan · #3 empty chưa đồng bộ · #4 Có nhóm | **This endpoint** |
| **FR-HRM-SC-POS-01** | Diễn biến #1 «Mở Cài đặt» — list theo đơn vị | Overview includes POS keys |
| **FR-HRM-SC-LEAVE-01** | Diễn biến #1 CRUD loại — list | Overview includes `leave_types` |
| **FR-HRM-08** | Liệt kê snapshot đồng bộ | Related overview |

### Response ↔ DB

| Wire | DB / store |
|------|------------|
| `catalogs[].catalogKey` / key | `synced_catalogs.catalog_key` |
| `catalogs[].effectiveItems[]` | merge(`synced_catalogs.payload.items`, `hrm_catalog_extension_items`) |
| `catalogs[].name` / domain / version | payload + synced meta |
| pending extension counts (if exposed) | `hrm_catalog_extension_requests` |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Unauthorized | `HRM-AUTH-001` | Login / banner |
| Invalid scope | scope 409 family | Keep empty; no fake |
| Success empty | `HRM-SET-200` + empty items | Empty «chưa đồng bộ» |

---

## 2. Endpoint B — List items by catalog key

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/settings-catalogs/{catalogKey}/items` |
| Query | `q`, `active` / `status` (picker filters) |
| Success | `200` · `HRM-SET-200` (envelope per runtime) |
| Runtime | `listPickerItems` / items GET |

### Mục đích

Trả **danh sách mã hiệu lực** của một danh mục (`leave_types` \| `departments` \| `job_titles` / aliases) để bảng Cài đặt và **ô lọc có tìm kiếm** trên form consumer (hồ sơ NV, đơn nghỉ, YCTD).

### Nghiệp vụ xử lý

1. Normalize `catalogKey`; resolve company partition.
2. `getEffectiveItemsForKey` = XBOS snapshot + HRM extension merge.
3. Apply `q` (code/label contains) + active/status filter (AC-HRM-PICKER-01 / AC-SET-FS).
4. Return `{ catalog_key, company_id, total, data[] }`.
5. Empty catalog = `total:0` honest — consumer create must not accept free-text.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-POS-01** | #1 list · #5 Picker hồ sơ · #6 rỗng | **This endpoint** (POS keys) |
| **FR-HRM-SC-LEAVE-01** | #2 Picker đơn nghỉ · #4 loại ngưng không chọn | **This endpoint** (`leave_types`) |
| **UC-HRM-07** | Lấy dữ liệu dùng chung theo khóa | Related (local effective) |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `data[].code` / `label` / `unit` / `status` | merge L1+L2a |
| `data[].origin` | derived `xbos`\|`hrm` |
| `catalog_key` | path param normalized |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Invalid key format | `HRM-SET-001` | Toast; no list |
| Unauthorized | `HRM-AUTH-001` | — |
| Empty | 200 + `[]` | Empty + hướng dẫn Cài đặt / sync |

---

## 3. Endpoint C — Create catalog item (extension upsert)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/settings-catalogs/items` |
| Body | `SettingsCatalogItemMutationDto` — `company_id`, `category_key` (catalog_key), `item_key` (code), `label`, optional `unit`/`status` |
| Success | `201` envelope · `HRM-SET-201` |
| Runtime | `upsertCatalogItem` → `hrm_catalog_extension_items` |

Alternate (CC / group HR): `POST /api/hrm/settings-catalogs/{catalogKey}/extension-items` — same L2a write, TechSpec §11.4.

### Mục đích

Cho phép HCNS **thêm mã danh mục theo đơn vị** (phòng ban / chức danh / loại nghỉ extension) trên Cài đặt HRM mà **không** đè SoT master tập đoàn trên XBOS — ghi overlay `hrm_catalog_extension_items`.

### Nghiệp vụ xử lý

1. Auth + resolve mutation company id (body `company_id` vs headers).
2. Normalize catalog key ∈ POS / LEAVE (and allowed families).
3. Validate unique `(tenant, company, catalog_key, code)` — conflict → reject.
4. Upsert extension row (`status` default active).
5. **Does not** INSERT into `config_catalog_items` (XBOS SoT).
6. Group-master invent requiring governance → use extension-request / XBOS CAT WF (endpoints H), not silent master write.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-POS-01** | #2 Thêm / sửa · #3 Trùng mã · #7 Thành công F5 | **This endpoint** |
| **FR-HRM-SC-LEAVE-01** | #1 CRUD loại · #5 Thành công | **This endpoint** (`leave_types`) |
| ADR S3 | Settings CRUD UX on L1/L2a | Write = extension |

### Request ↔ DB

| DTO field | DB column |
|-----------|-----------|
| `company_id` | `hrm_catalog_extension_items.company_id` |
| `category_key` | `catalog_key` |
| `item_key` | `code` |
| `label` | `label` |
| `unit` / `status` | `unit` / `status` |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Validation | Nest `HRM-*-VAL*` / 400 | Field errors |
| Duplicate code | 409 family / service conflict | «Mã đã tồn tại» (Diễn biến #3) |
| Unauthorized | `HRM-AUTH-001` | — |
| Attempt treat as XBOS master publish | N/A — wrong API; use XBOS config-sync publish | Redirect governance |

---

## 4. Endpoint D — Update catalog item

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/settings-catalogs/items` |
| Body | Same mutation DTO (code identity + new label/status) |
| Success | `200` · `HRM-SET-202` |
| Runtime | `upsertCatalogItem` |

### Mục đích

Cập nhật **nhãn / trạng thái hiệu lực** của mã extension (hoặc overlay) theo đơn vị — hỗ trợ «ngưng dùng» thay vì xóa cứng khi đang gắn NV (FR-HRM-SC-POS-01 #4).

### Nghiệp vụ xử lý

1. Resolve scope + identity (`catalog_key` + `code`).
2. Upsert extension; prefer `status` inactive/draft for soft-stop.
3. XBOS-origin-only codes: label override policy per `mergeEffective` — **không** DELETE XBOS snapshot row.
4. After success, list/picker reflects new label/status; F5 still shows.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-POS-01** | #2 Sửa · #4 Ngưng khi đang gắn | **This endpoint** |
| **FR-HRM-SC-LEAVE-01** | #1 CRUD · #4 Loại ngưng → form mới không chọn | **This endpoint** |

### Request/Response ↔ DB

Same mapping as Endpoint C; response returns updated item projection.

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| Not found (no extension & no allow create-on-patch) | 404 family | Toast |
| Duplicate / invalid | 400/409 | Inline |
| Unauthorized | `HRM-AUTH-001` | — |

---

## 5. Endpoint E — Delete / soft-remove item

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/hrm/settings-catalogs/items` |
| Body | `company_id`, `category_key`, `item_key` |
| Success | `200` · `HRM-SET-200` |
| Related | `POST …/{catalogKey}/removal-requests` for governed removal |

### Mục đích

Gỡ hoặc khởi tạo **yêu cầu gỡ** mã extension khỏi danh mục đơn vị khi chính sách cho phép — ưu tiên không phá lịch sử consumer.

### Nghiệp vụ xử lý

1. Resolve scope; target extension row by code.
2. Soft-delete / status inactive preferred when referenced.
3. Hard delete extension only when safe; XBOS snapshot items → removal-request path, not silent wipe of L1.
4. Picker after delete must not offer code for **new** forms.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-POS-01** | #4 Ngưng / không xóa cứng mất lịch sử | Delete or removal-request |
| **FR-HRM-SC-EXT-01** | Yêu cầu gỡ / duyệt | `removal-requests` |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| In use / policy block | 409 / business code | Hướng dẫn ngưng dùng |
| Not found | 404 | — |

---

## 6. Endpoint F — Sync all from XBOS (Settings bulk pull)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/settings-catalogs/sync-from-xbos` |
| Success | `200/201` envelope · `HRM-SET-201` |
| Runtime | `syncAllFromXbos` → catalog-sync pulls → `synced_catalogs` |

### Mục đích

Đồng bộ **hàng loạt** danh mục XBOS đã gán HRM (gồm `leave_types`, `departments`, `job_titles`/aliases) vào snapshot HRM để Cài đặt và picker có SoT tập đoàn — đúng ADR S1.

### Nghiệp vụ xử lý

1. Auth + resolve catalog company.
2. Discover XBOS catalogs assigned to `hrm` for scope.
3. For each key: GET XBOS config-sync catalog → upsert `synced_catalogs` (version++, checksum, `synced_at`).
4. Write `sync_audit_logs`.
5. Preserve `hrm_catalog_extension_items` (overlay not wiped).
6. XBOS down / timeout → `HRM-SYNC-001`; missing catalog → `HRM-SYNC-002` per key policy.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-06** / **FR-HRM-06** | Đồng bộ dữ liệu dùng chung từ XBOS | **This endpoint** (bulk) |
| **FR-HRM-SC-POS-01** | #4 Sync XBOS — overlay không đè master cấm | **This endpoint** |
| **FR-HRM-SC-01** | After sync → overview có nhóm | Follow-up GET overview |

### Response ↔ DB

| Wire | DB |
|------|-----|
| pulled keys / counts | rows upserted in `synced_catalogs` |
| version / checksum | columns on synced row |
| errors[] (if partial) | per-key sync failure |

### Errors

| Condition | Code | FE |
|-----------|------|-----|
| XBOS unreachable / timeout | `HRM-SYNC-001` | Banner; keep prior snapshot |
| Catalog unavailable | `HRM-SYNC-002` | Per-key message |
| DDL/env misconfig | `HRM-SYNC-CONF` | Ops — not fake empty success |
| Unauthorized | `HRM-AUTH-001` | — |

---

## 7. Endpoint G — Catalog-sync pull one key + list/get local

### 7.1 Pull one key

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/catalog-sync/pull/{catalogKey}` |
| Success | `HRM-SYNC-200` |
| Upstream | `GET {XBOS}/api/xbos/config-sync/catalog/{catalogKey}?target=hrm&tenantId=&companyId=` |

#### Mục đích

Kéo **một** danh mục (vd. `leave_types`) từ XBOS SoT vào `synced_catalogs` — dùng khi chỉ cần sync hẹp hoặc automation per key.

#### Nghiệp vụ xử lý

1. Resolve sync scope (`resolveHrmCatalogSyncScope`).
2. HTTP GET XBOS catalog for key+scope.
3. Upsert `synced_catalogs`; bump version/checksum; audit log.
4. Return local snapshot projection.

#### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-06** / **FR-HRM-06** | Pull theo khóa | **This endpoint** |
| **FR-HRM-SC-LEAVE-01** / **POS-01** | Sync trước CRUD/picker | Enables L1 |

#### DTO ↔ DB

| Response field | DB |
|----------------|-----|
| `catalog_key` | `synced_catalogs.catalog_key` |
| `payload` / items | `payload` JSONB |
| `version` / `checksum` / `synced_at` | columns |

#### Errors

Same as Endpoint F (`HRM-SYNC-001/002/CONF`, auth).

### 7.2 List local synced catalogs

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/catalog-sync` |
| Success | `HRM-SYNC-202` |

#### Mục đích

Liệt kê snapshot đã kéo về theo đơn vị — hỗ trợ UC-HRM-08 / FR-HRM-08 và đối soát trước Settings.

#### Nghiệp vụ xử lý

Read `synced_catalogs` for scope; no XBOS call required.

#### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-08** / **FR-HRM-08** | Liệt kê dữ liệu dùng chung | **This endpoint** |

### 7.3 Get local synced catalog by key

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/catalog-sync/{catalogKey}` |
| Success | `HRM-SYNC-201` |

#### Mục đích

Đọc payload local một khóa (leave/dept/pos) sau pull — phục vụ UC-HRM-07 và debug sync.

#### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-07** | Lấy dữ liệu dùng chung theo khóa | **This endpoint** |

#### Errors

| Condition | Code |
|-----------|------|
| Not pulled yet | `HRM-SYNC-002` / 404 family |

### 7.4 Sync status

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/catalog-sync/status` |
| Success | `HRM-SYNC-203` |

#### Mục đích

Trạng thái đồng bộ (version/checksum age) cho UI Settings — không mutate.

---

## 8. Endpoint H — Extension request / XBOS governance handoff (cite)

> Full XBOS inbox F.1 → optional `docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md`. Cited here for SoT completeness.

| Method / path | Code | Mục đích ngắn | Bước SRS |
|---------------|------|---------------|----------|
| `POST /api/hrm/settings-catalogs` batches / `…/extension-requests` | pending | Tạo yêu cầu mở rộng | FR-HRM-SC-EXT-01 · FR-XBOS-CAT-02 |
| `POST …/extension-requests/{id}/approve\|reject` | approve | Duyệt → extension items | FR-XBOS-CAT-05 |
| `POST /api/xbos/catalog-governance/workflows/start` | `XBOS-CAT-211` | Start WF duyệt DM | FR-XBOS-CAT-02 Diễn biến 10a |
| `POST /api/xbos/catalog-governance/tasks/{taskId}/approve` | `XBOS-CAT-201` | Approve task | FR-XBOS-CAT-05 Diễn biến 10b |
| `POST /api/xbos/config-sync/catalog/{catalogKey}/publish` | `XBOS-CFG-203` | Publish L0 SoT | DANH_MUC · ADR S1 |

HRM Settings **consumes** after approve/publish via Endpoints F/G — does not replace XBOS publish.

---

## 9. Consumer assert (not Settings UI — contract note)

| Caller | Behavior | `ref_srs` |
|--------|----------|-----------|
| Leave create | `assertCodeInEffectiveCatalog(leave_types)` | FR-HRM-SC-LEAVE-01 #2 · BR-HRM-MD-01 |
| Employee / requisition dept/pos | Same for POS keys | FR-HRM-SC-POS-01 #5 |
| Empty catalog | **400** — no free-text SoT | VAL-SET-MD |

---

## 10. FE bind contract (Settings + pickers)

```text
MUST:
  Settings list/picker ← GET settings-catalogs[/{key}/items] effectiveItems
  Persist codes only (leave_type, department, position/job_title)
  Label UI ← item.label (U72); miss → «—»
  After POST/PATCH items or sync-from-xbos → refetch; F5 still shows

MUST NOT:
  Free-text SoT for leave/dept/position
  Seed endpoints in U65 evidence
  Treat HRM extension as XBOS group master publish
  Bind entity_type / LE UUID as catalog_key
```

---

## 11. Error taxonomy (summary)

| Code | Meaning |
|------|---------|
| `HRM-SET-200` / `201` / `202` | Settings overview / create / update OK |
| `HRM-SET-001` | Invalid catalog key format |
| `HRM-SYNC-200` / `201` / `202` / `203` | Pull / get / list / status OK |
| `HRM-SYNC-001` | XBOS upstream failure / timeout |
| `HRM-SYNC-002` | Catalog unavailable / not found |
| `HRM-SYNC-CONF` | Env DDL bootstrap missing |
| `HRM-AUTH-001` | Unauthorized |
| `XBOS-CAT-211` / `201` | Governance start / approve (XBOS) |
| `XBOS-CFG-203` | Catalog published (XBOS) |

---

## 12. Out of scope / residual

| Item | Owner |
|------|-------|
| OpenAPI yaml semantics refresh for Settings mutation DTOs | `dev-be` after this design |
| Full XBOS catalog-governance API_DESIGN file | `SA-U71-XBOS-CATALOG-GOV-DESIGN-01` |
| Seed route documentation for bootstrap-only | DevOps — never U65 |
| JT / PAY / DEC full F.1 depth | Same pattern; extend this pair or slice files |

---

## 13. F.1 completeness checklist

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| GET settings-catalogs | ✅ | ✅ | ✅ FR-HRM-SC-01 | ✅ | ✅ |
| GET …/{key}/items | ✅ | ✅ | ✅ POS/LEAVE | ✅ | ✅ |
| POST …/items | ✅ | ✅ | ✅ POS/LEAVE #2 | ✅ | ✅ |
| PATCH …/items | ✅ | ✅ | ✅ POS #2/#4 | ✅ | ✅ |
| DELETE …/items | ✅ | ✅ | ✅ POS #4 | ✅ | ✅ |
| POST …/sync-from-xbos | ✅ | ✅ | ✅ UC-HRM-06 | ✅ | ✅ |
| POST catalog-sync/pull/:key | ✅ | ✅ | ✅ UC-HRM-06 | ✅ | ✅ |
| GET catalog-sync · /:key · /status | ✅ | ✅ | ✅ UC-HRM-07/08 | ✅ | ✅ |
