# API_DESIGN — HRM Settings E1-B (bucket expand + DEC alias + sync)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1B-DB-API-01` |
| **cohort** | `E1-B` · `SETTINGS-UI-EXPAND` · U71 F.1 |
| **change_mode** | ADD · preserve_default · **no** `apps/**` this WI |
| **extends** | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` (Endpoints A–H reuse) |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` |
| **ref_srs** | FR-HRM-SC-01 · SC-POS-01 · SC-LEAVE-01 · **SC-DEC-01** · **SC-PAY-01** · UC-HRM-06..08 · UC-HRM-27 Diễn biến |
| **ref_techspec** | TECHSPEC §11.4 · §14.8 · §18.1 |
| **Base paths** | `/api/hrm/settings-catalogs` · `/api/hrm/catalog-sync` |
| **Date** | 2026-07-28 |

> **Gap summary:** Bulk sync (`POST …/sync-from-xbos`) already pulls **all** remote XBOS keys — **no new sync URL required**. Gaps are **(1)** alias resolution for `hr_decision_types`↔`decision_types`, **(2)** overview/items allow-list for ≥10 E1-B buckets, **(3)** writeKey storage resolution, **(4)** assert helper family-aware. Optional narrow sync body filter documented below if product wants bucket-scoped pull.

---

## 0. Shared — alias resolver contract

### `resolveCatalogFamily(catalogKey) → { familyId, aliases[], storageKey }`

| Input (any alias) | `familyId` | `aliases[]` | Default `storageKey` (write) |
|-------------------|------------|-------------|------------------------------|
| `decision_types` / `hr_decision_types` | `dec_types` | both | Prefer existing L1 key; else `hr_decision_types` if remote has it, else `decision_types` |
| `job_titles` / `positions` / `employee_positions` | `pos_titles` | all three | `job_titles` |
| `departments` / `department_catalog` / `org_departments` | `org_depts` | all | `departments` |
| `pay_types` / `component_types` / `pay_natures` | `pay_nature` | all | `pay_types` |
| `salary_components` / `payroll_components` | `pay_comp` | both | `salary_components` |
| `employment_types` / `employment_type` | `emp_class` | both | `employment_types` |
| `recruitment_channels` / `candidate_sources` | `rec_channel` | both | `recruitment_channels` |
| `job_grades` / `grades` | `grade` | both | `job_grades` |
| `contract_types`, `leave_types`, `shifts` | self | `[canonical]` | canonical |

**Rule:** Every Settings GET/POST/PATCH/DELETE/assert path for a key **must** call this resolver before merge/SQL filter. FE `findCatalogRowByKeys` must include **full** `aliases[]` (today DEC misses `hr_decision_types` → P0).

---

## 1. Endpoint A′ — Overview list (E1-B bucket surface)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/settings-catalogs` |
| Success | `200` · `HRM-SET-200` |
| Delta vs base A | Response **must** include E1-B families (§3.1 DB_DESIGN) when L1/L2a exist; alias families collapsed or dual-key with same `effectiveItems` |

### Mục đích

Cấp tổng quan **đủ ≥10 nhóm danh mục** cho Master Data Settings (không chỉ 4 bucket cũ), gồm loại QSĐ đã resolve từ live key `hr_decision_types`, để HCNS cấu hình ERP catalogs trên UI.

### Nghiệp vụ xử lý

1. Auth + resolve company catalog partition (`scope_parity` with sync).
2. Load synced + extension for **E1-B registry keys ∪ aliases**.
3. For DEC family: merge both keys → one overview group (or two rows with identical effective set — FE must not MISS).
4. Return empty groups honestly when unsynced.
5. Does not invent master codes; does not require seed.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-01** | #1–#4 mở tổng quan / empty / có nhóm | **This endpoint** |
| **FR-HRM-SC-DEC-01** | #1 CRUD loại — list sẵn sàng | Overview exposes DEC family |
| **FR-HRM-SC-PAY-01** | #1 Cài đặt thành phần / tính chất | Overview exposes `pay_types` ± `salary_components` |
| **FR-HRM-SC-POS-01** / **LEAVE-01** | #1 Mở Cài đặt | Keep existing groups |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `catalogs[].catalogKey` | `synced_catalogs.catalog_key` (storage) + optional `aliases[]` |
| `catalogs[].effectiveItems[]` | merge L1+L2a **per family** |
| `catalogs[].labelVi` (optional) | U72 bucket label map FE; BE may send `name` from payload |

### Errors

Same as base Endpoint A (`HRM-AUTH-001`, scope 409, empty 200).

### Gap vs runtime

| Gap | Fix owner |
|-----|-----------|
| Overview may list 76 remote keys but FE only tabs 4 | FE expand + optional BE `?mdSurface=e1b` filter |
| DEC key mismatch | Alias merge in service |

---

## 2. Endpoint B′ — List items by catalog key (alias-aware)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/settings-catalogs/{catalogKey}/items` |
| Query | `q`, `status` / `active` |
| Success | `200` · `HRM-SET-200` |

### Mục đích

Trả mã hiệu lực của **một family** (vd. gọi `decision_types` **hoặc** `hr_decision_types`) để bảng Settings + picker consumer — hết MISS live DEC.

### Nghiệp vụ xử lý

1. `resolveCatalogFamily(catalogKey)`.
2. `getEffectiveItemsForFamily` = merge all alias keys’ L1+L2a.
3. Filter `q` / active; return `{ catalog_key: storageKey, aliases, total, data[] }`.
4. Empty = `total:0` honest.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-DEC-01** | #1 list · #2 picker QSĐ | **This endpoint** |
| **FR-HRM-SC-PAY-01** | #2 chọn thành phần / tính chất | `pay_types` / `salary_components` |
| **FR-HRM-SC-POS-01** / **LEAVE-01** | #1/#5 picker | Keep |
| **UC-HRM-07** | Lấy theo khóa | Related |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `data[].code/label/status/origin` | merge family |
| `aliases` | resolver output |
| `catalog_key` | resolved `storageKey` |

### Errors

| Condition | Code |
|-----------|------|
| Key not in E1-B registry / invalid format | `HRM-SET-001` |
| Unauthorized | `HRM-AUTH-001` |

---

## 3. Endpoint C′ — Create extension item (writeKey resolve)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/settings-catalogs/items` |
| Body | `company_id`, `category_key`, `item_key`, `label`, `unit?`, `status?` |
| Success | `201` · `HRM-SET-201` |

### Mục đích

Cho HCNS **thêm mã** trên bucket E1-B mới (hợp đồng, hình thức LĐ, ca, grade, kênh TD, tính chất lương, …) và DEC với write vào storage key đúng live XBOS — không đè L0.

### Nghiệp vụ xử lý

1. Resolve family + `storageKey` (DEC → prefer `hr_decision_types` when L1 exists).
2. Validate key ∈ E1-B allow-list.
3. Upsert `hrm_catalog_extension_items` under **storageKey**.
4. Unique `(tenant, company, catalog_key, code)` — conflict 409.
5. Never INSERT XBOS `config_catalog_items`.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-DEC-01** | #1 CRUD loại · #5 F5 | **This endpoint** |
| **FR-HRM-SC-PAY-01** | #1 CRUD · #3 từ chối ngoài DM | pay buckets |
| **FR-HRM-SC-POS-01** / **LEAVE-01** | #2 Thêm | Keep |
| ADR S3 | Settings UX on L2a | Write = extension |

### Request ↔ DB

| DTO | DB column |
|-----|-----------|
| `category_key` (any alias) | stored as `storageKey` |
| `item_key` | `code` |
| `label` / `unit` / `status` | columns |

### Errors

Duplicate / validation / auth — same base C; unknown E1-B key → `HRM-SET-001`.

---

## 4. Endpoint D′ — Update item

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/settings-catalogs/items` |
| Success | `200` · `HRM-SET-202` |

### Mục đích

Cập nhật nhãn/trạng thái mã extension trên mọi bucket E1-B (gồm soft-stop «ngưng dùng»).

### Nghiệp vụ xử lý

1. Resolve family; locate extension by code across aliases (prefer storageKey row).
2. Upsert; soft-stop via `status` when referenced.
3. Do not delete XBOS L1 snapshot rows.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-DEC-01** | #1 CRUD | **This endpoint** |
| **FR-HRM-SC-POS-01** | #2 Sửa · #4 Ngưng | Keep pattern |
| **FR-HRM-SC-PAY-01** | #1 CRUD | pay buckets |

---

## 5. Endpoint E′ — Delete / removal-request

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/hrm/settings-catalogs/items` |
| Related | `POST …/{catalogKey}/removal-requests` |

### Mục đích

Gỡ hoặc gửi yêu cầu gỡ mã extension trên bucket E1-B mà không phá lịch sử consumer.

### Nghiệp vụ xử lý

Same base E + alias resolve before locate row.

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **FR-HRM-SC-DEC-01** / **POS-01** | Ngưng / không xóa cứng mất lịch sử | Delete or removal-request |
| **FR-HRM-SC-EXT-01** | Yêu cầu gỡ | removal-requests |

---

## 6. Endpoint F′ — Sync all from XBOS (reuse + E1-B expectations)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/settings-catalogs/sync-from-xbos` |
| Success | `200/201` · `HRM-SET-201` |
| Runtime today | Pulls **every** remote key assigned to HRM |

### Mục đích

Đồng bộ hàng loạt snapshot XBOS (gồm `hr_decision_types`, `contract_types`, `shifts`, …) để Settings E1-B và picker có SoT tập đoàn.

### Nghiệp vụ xử lý

1. Auth + resolve catalog company.
2. List remote XBOS catalogs → pull each → upsert `synced_catalogs`.
3. Preserve L2a extensions.
4. **E1-B acceptance:** response `pulledKeys` **should include** live DEC key when published; FE refetch overview after 2xx.
5. Optional future body `{ keys?: string[] }` — if provided, pull only resolved families (not required if runtime already pull-all).

### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-06** / **FR-HRM-06** | Đồng bộ từ XBOS | **This endpoint** |
| **FR-HRM-SC-DEC-01** | Sync trước CRUD/picker | Enables L1 `hr_decision_types` |
| **FR-HRM-SC-01** | After sync → overview có nhóm | Follow-up GET |

### Gap

| Gap | Verdict |
|-----|---------|
| New sync URL? | **Không cần** — F already pull-all |
| Missing keys on XBOS | Publish L0 on XBOS (out of HRM Settings mutate) — `HRM-SYNC-002` per key |

### Errors

`HRM-SYNC-001/002/CONF`, `HRM-AUTH-001` — base F.

---

## 7. Endpoint G′ — Pull one key (alias-aware)

### 7.1 Pull one key

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/catalog-sync/pull/{catalogKey}` |
| Success | `HRM-SYNC-200` |

#### Mục đích

Kéo **một** danh mục; nếu client gửi `decision_types` mà XBOS chỉ có `hr_decision_types`, BE **thử aliases** rồi pull storage key thành công.

#### Nghiệp vụ xử lý

1. Resolve family + ordered try-list: `[storageKey, ...aliases]`.
2. GET XBOS config-sync for first hit; upsert `synced_catalogs` under **actual remote key**.
3. Audit log actual key; return projection + `resolvedFrom` if alias used.

#### Bước SRS

| UC / FR | Diễn biến | API role |
|---------|-----------|----------|
| **UC-HRM-06** / **FR-HRM-06** | Pull theo khóa | **This endpoint** |
| **FR-HRM-SC-DEC-01** | Sync loại QSĐ | Alias try-list |

#### Errors

All aliases miss → `HRM-SYNC-002`.

### 7.2–7.4 List / get / status

Reuse base G.2–G.4. **Get by key** must accept aliases (same try-list).

| Method / path | Mục đích ngắn | Bước SRS |
|---------------|---------------|----------|
| `GET /api/hrm/catalog-sync` | Liệt kê snapshot local | UC-HRM-08 / FR-HRM-08 |
| `GET /api/hrm/catalog-sync/{catalogKey}` | Đọc một khóa (alias-aware) | UC-HRM-07 |
| `GET /api/hrm/catalog-sync/status` | Trạng thái sync UI | FR-HRM-SC-01 |

---

## 8. Endpoint H — Extension / XBOS governance (cite — no gap)

Reuse base H. Approve/reject → extension items under **storageKey**. HRM Settings consumes via F′/G′ after XBOS publish.

---

## 9. Consumer assert (contract delta — E1-B enables)

| Caller | Behavior | `ref_srs` |
|--------|----------|-----------|
| Decisions create/update | `assertCodeInEffectiveCatalog(family=dec_types)` | FR-HRM-SC-DEC-01 #2–#3 · VAL-SET-MD-03 |
| Future contracts / employment / channel / pay_types | Same helper with family id | VAL-ERP-SC-01 |
| Empty family | **400** — no hardcode fallback SoT | BR-HRM-MD-01 |

**Note:** Expanding assert callers beyond DEC is **E1-A / domain** — E1-B requires helper to be **alias-aware** so existing DEC assert does not keep failing on live key.

---

## 10. FE bind contract (Settings MD E1-B)

```text
MUST:
  MasterDataSettingsPanel ≥10 buckets from DB_DESIGN §3.1
  decisionTypes.keys INCLUDES 'hr_decision_types' AND 'decision_types'
  writeKey DEC = resolved storage (prefer hr_decision_types when L1 exists)
  After POST/PATCH/sync → refetch overview; F5 still shows
  Labels VI via getLabel / bucket title (U72) — never show raw key as sole title

MUST NOT:
  Hardcoded DECISION_TYPES / componentTypes / employment enums as Settings SoT
  Seed for U65 evidence
  Treat module-only Payroll TX as substitute for missing pay_types Settings bucket (bucket still required)
```

---

## 11. Error taxonomy (E1-B delta)

| Code | Meaning |
|------|---------|
| `HRM-SET-001` | Key outside E1-B registry / invalid |
| `HRM-SET-200/201/202` | Overview / create / update OK |
| `HRM-SYNC-200/201/202/203` | Pull / get / list / status OK |
| `HRM-SYNC-001` | XBOS upstream fail |
| `HRM-SYNC-002` | Catalog unavailable (all aliases miss) |
| `HRM-DEC-TYPE` / assert family | Consumer code ∉ effective DEC |

---

## 12. F.1 completeness checklist (E1-B)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| GET settings-catalogs (A′) | ✅ | ✅ | ✅ SC-01 / DEC / PAY | ✅ | ✅ |
| GET …/{key}/items (B′) | ✅ | ✅ | ✅ DEC #1–2 · PAY #2 | ✅ | ✅ |
| POST …/items (C′) | ✅ | ✅ | ✅ DEC #1 · PAY #1 | ✅ | ✅ |
| PATCH …/items (D′) | ✅ | ✅ | ✅ DEC/POS CRUD | ✅ | ✅ |
| DELETE …/items (E′) | ✅ | ✅ | ✅ POS #4 · EXT | ✅ | ✅ |
| POST …/sync-from-xbos (F′) | ✅ | ✅ | ✅ UC-HRM-06 | ✅ | ✅ |
| POST catalog-sync/pull/:key (G′) | ✅ | ✅ alias try | ✅ UC-HRM-06 · DEC | ✅ | ✅ |
| GET catalog-sync* | ✅ | ✅ | ✅ UC-HRM-07/08 | ✅ | ✅ |

---

## 13. Sync gap verdict

| Question | Answer |
|----------|--------|
| Missing HTTP sync endpoint? | **No** — F + G suffice |
| Missing behavior? | **Yes** — alias-aware pull/get/items/assert; FE bucket registry ≥10 |
| XBOS publish gap for empty families? | Ops/XBOS L0 — not HRM invent |

---

## 14. Out of scope

| Item | Owner |
|------|-------|
| Implement `resolveCatalogFamily` in Nest/FE | `dev-be` / `dev-fe` |
| Consumer FREE_TEXT position (E1-A) | separate WI |
| OpenAPI yaml refresh | `dev-be` after code |
| Migration / seed | **Forbidden** |
