# API_DESIGN — XBOS Infrastructure settings (foundation scope key plane)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-XBOS-INF-SCOPE-KEY-PLANE-01` |
| **change_mode** | ADD · preserve_default · residual close (key plane) |
| **ref_srs** | UC-XBOS-INF-01 · UC-XBOS-INF-02 · UC-XBOS-INF-03 · UC-XBOS-CC-07 · BR-FCAT-SCOPE-* · AC-META-PROP-FND-* |
| **ref_techspec** | `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` M01-Infra · `P1-TECHSPEC-OPENAPI-DELTA-U18` · `INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` |
| **ref_adr** | `ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727` · `ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620` |
| **ref_db** | Table `public.xbos_infrastructure_settings` (JSONB columns — as-built; no new DDL this WI) |
| **must_keep** | OP/MD/CO-HC GWC · Auth/RACI/WF/catalog-gov/KPI pairs · U65 zero-seed |
| **Date** | 2026-07-27 |
| **Runtime** | `InfrastructureController` · `InfrastructureService` |
| **Base path** | `/api/xbos/infrastructure` |

> **Envelope:** Nest `ok(data, code, message)`. Success upsert code **`XBOS-INFRA-201`**.  
> **Scope of this file:** Normative **key plane** for `appliesToCompanyIds` + GET/PUT/summary F.1. Full infra site CRUD UX remains wizard/UX SoT — not rewritten here.

---

## 0. Key plane SoT (normative)

| Item | Plane | Allowed values |
|------|-------|----------------|
| `foundationCategories[].appliesToCompanyIds[]` **member** | **A** | `xbos_legal_entity.id` UUID |
| Same array **holding** | **C + synthetic** | Prefer `xbos-group-holding-root`; accept `main` · `holding` as match aliases |
| **Forbidden** | **B′** | `HRM_COMPANY_UUID_BY_SLUG` UUIDs |
| **Forbidden (as member)** | **B** | `trsport` · `logistics` · `finance` · `services` |
| Settings partition `company_id` (row PK with tenant) | JWT partition | `normalizeCompanyId` → default `holding` — **orthogonal** to array elements |
| `customFieldDefsByEntity` keys | Same as scope keys | A + holding aliases |
| Site `operatingEntityId` | **A** (or holding alias) | Must match scope for field visibility |

**Resolver (FE):** `infraEntityIdsMatch` / `isOperatingEntityInFoundationScope` / `resolveInfraScopedRecord` — holding alias-aware; **no** LE↔B′ map.

---

## 1. Endpoint A — Get settings (UC-XBOS-INF-01 read)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/infrastructure/settings` |
| Success | HTTP 200 · infra settings payload |
| Auth | Bearer + scope headers/query matching JWT |

### Mục đích

Trả cấu hình danh mục nền / điểm hạ tầng / định nghĩa trường tùy chỉnh cho partition tenant+company — phục vụ wizard và consumer Điểm hạ tầng.

### Nghiệp vụ xử lý

1. `resolveScopeContext` — tenant/company từ JWT (partition).
2. Load `xbos_infrastructure_settings` by `(tenant_id, company_id)`; nếu thiếu → default payload + upsert (as-built).
3. Return `foundationCategories` (incl. `appliesToCompanyIds`), `sites`, `customFieldDefsByEntity`, …
4. **Không** rewrite key plane on read (legacy `main`/`holding` may appear — FE alias match).

### Bước SRS

| UC | Bước / Diễn biến | API role |
|----|------------------|----------|
| UC-XBOS-INF-01 | Mở Hạ tầng / danh mục nền — tải cấu hình | **This GET** |
| UC-XBOS-CC-07 | F5 / re-open wizard — checkbox khớp GET | Round-trip `appliesToCompanyIds` |
| BR-FCAT-SCOPE-03 | Holding alias match | FE after GET |

### DTO ↔ DB

| Response field | DB |
|----------------|-----|
| `foundationCategories` | `foundation_categories` JSONB |
| `sites` | `sites` JSONB |
| `customFieldDefsByEntity` | `custom_field_defs_by_entity` JSONB |
| `companyId` | `company_id` (partition) |

### Lỗi

| Condition | Code |
|-----------|------|
| Auth/scope mismatch | 401 / 409 (platform scope) |

---

## 2. Endpoint B — Upsert settings (UC-XBOS-INF-01/02 write) **PRIMARY for scope keys**

### Identity

| Item | Value |
|------|--------|
| Method / path | `PUT /api/xbos/infrastructure/settings` |
| Success | HTTP 200 · **`XBOS-INFRA-201`** |
| Auth | Bearer + scope |

### Mục đích

Lưu danh mục nền (phạm vi pháp nhân), điểm hạ tầng, và defs trường tùy chỉnh — nguồn sự thật cho consumer Điểm hạ tầng sau apply.

### Nghiệp vụ xử lý

1. Validate body arrays/objects (DTO as-built).
2. Persist JSONB columns on `(tenant_id, company_id)` partition.
3. Emit audit `infrastructure.settings.upsert`.
4. **Key plane (normative — contract):** each `appliesToCompanyIds[]` element **SHOULD** be Plane A LE UUID or holding alias (`xbos-group-holding-root` preferred). **MUST NOT** be Plane B′. **MUST NOT** be workforce slug `trsport|logistics|finance|services`.
5. **As-built runtime:** BE may still accept opaque strings (no hard reject yet) — see backlog `D-XBOS-INF-SCOPE-KEY-VALIDATE-01`. FE **MUST** write per ADR §4.4.
6. `customFieldDefsByEntity` keys **SHOULD** use the same ids as scope / site operating entity.

### Bước SRS

| UC / BR | Bước | API role |
|---------|------|----------|
| UC-XBOS-INF-01 | Lưu / Xác nhận & áp dụng danh mục nền | **This PUT** |
| UC-XBOS-INF-02 | Cập nhật mẫu siêu dữ liệu theo pháp nhân (defs by entity) | Same PUT payload |
| BR-FCAT-SCOPE-01/02 | Phạm vi ≥1; đổi scope không silent-delete defs keys đã lưu | Payload integrity |
| AC-FCAT-S2-05 · AC-META-PROP-FND | F5 giữ `appliesToCompanyIds` | Persist + GET |

### Request (scope-relevant)

```json
{
  "foundationCategories": [
    {
      "id": "fcat-1",
      "code": "HT-01",
      "nameVi": "…",
      "appliesToCompanyIds": [
        "xbos-group-holding-root",
        "eb3fb3fc-0081-446b-8d99-2b398dddc709"
      ]
    }
  ],
  "customFieldDefsByEntity": {
    "eb3fb3fc-0081-446b-8d99-2b398dddc709": []
  },
  "sites": []
}
```

### Anti-patterns (MUST NOT)

| Anti-pattern | Why |
|--------------|-----|
| `appliesToCompanyIds: ["10000000-0000-4000-8000-000000000003"]` (B′) | ≠ site LE → fields never show |
| `appliesToCompanyIds: ["logistics"]` | Plane B workforce — not infra entity key |
| Expect slug alone to cover all member LE sites | No auto-expand to Plane A list |

### Lỗi

| Condition | Code (as-built / target) |
|-----------|---------------------------|
| Invalid DTO shape | 400 |
| Upsert failure | `XBOS-INFRA-500` |
| Forbidden key plane (target P2) | `XBOS-INFRA-400` / plane code — backlog BE |

---

## 3. Endpoint C — Summary (UC-XBOS-INF-03)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/xbos/infrastructure/summary` |
| Success | HTTP 200 |

### Mục đích

Tóm tắt số danh mục / điểm / trường — dashboard infra status.

### Nghiệp vụ xử lý

Load settings (same partition) → count foundation categories, sites, custom fields.

### Bước SRS

| UC | Bước | API role |
|----|------|----------|
| UC-XBOS-INF-03 | Xem tóm tắt trạng thái hạ tầng | **This GET** |

---

## 4. FE acceptance hooks (for QA / Dev-FE)

| ID | PASS |
|----|------|
| AC-INF-KEY-01 | Wizard tick member → PUT body LE UUID ∈ Plane A |
| AC-INF-KEY-02 | Wizard tick holding → PUT prefers `xbos-group-holding-root` |
| AC-INF-KEY-03 | Site `operatingEntityId` = LE UUID in scope → custom fields visible |
| AC-INF-KEY-04 | Scope only holding alias → member site **not** falsely claimed in-scope unless LE listed |
| AC-INF-KEY-05 | F5 → checkboxes match GET via exact + holding alias |

---

## 5. Backlog

| work_item_id | Role | Priority | Exit |
|--------------|------|----------|------|
| `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` | dev-fe | **P1** | Persist §0; normalize holding aliases on save; unit resolver; no B′/B member slugs; evidence READY_FOR_QA |
| `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` | dev-be | **P2** | Reject B′ + workforce member slugs on PUT; jest; no OP/MD/CO-HC touch |

**DB_DESIGN:** No new table this WI — JSONB as-built sufficient for key-plane lock.
