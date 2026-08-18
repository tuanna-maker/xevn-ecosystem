# PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01` |
| **Parent smoke** | `PO-MFD-M1-ATT-RUNTIME-SMOKE-01` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX (preserve catalog publish/pull, U65 no seed) |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.8 · FR-HRM-SC-01 — GET tổng quan danh mục; empty «chưa đồng bộ» hợp lệ
- **tech_spec:** `docs/hrm/TECHSPEC.md` §14.8 · §18.1 — overview merge L1+L2a; picker invalid key → 400
- **db_design:** `public.synced_catalogs.catalog_key` · `hrm_catalog_extension_items.catalog_key`
- **api_design:** `GET /api/hrm/settings-catalogs` · `GET /api/hrm/settings-catalogs/:catalogKey/items`
- **sponsor_confirm:** PO-MFD-M2 wave · Attendance settings `useDepartments` → `getSettingsCatalogsOverview`

## Root cause

Attendance **Thiết lập** bật `useDepartments` → `listDepartmentsFromSettingsCatalog` → **GET `/api/hrm/settings-catalogs`**.

`SettingsCatalogsService.getOverview` gom mọi `catalog_key` từ `synced_catalogs` + extension rows, rồi gọi `resolveCatalogFamily(catalogKey)` (`.trim()`). Hàng L1/L2 có **`catalog_key` null/rỗng/không hợp lệ** (hoặc `key` undefined sau map) → **`TypeError`** → filter **`HRM-SYS-001` / HTTP 500** — trùng triệu chứng QA trên tab **Tùy chỉnh** (request in-flight từ lúc mở Thiết lập).

## Fix (BE)

1. **`isValidCatalogKeyFormat`** — pure guard trong `hrm-settings-master-keys.ts`
2. **`getOverview`** — `tryNormalizeOverviewCatalogKey`: bỏ qua key hỏng; không 500 cả overview
3. **`CatalogSyncService.listSyncedCatalogs`** — lọc `catalog_key` hợp lệ trước `mapSyncedCatalogRow`
4. **`:catalogKey/items` picker** — giữ **`HRM-SET-001` 400** qua `normalizeCatalogKey` (không nuốt lỗi thành 500)

## Verification

```bash
pnpm --filter hrm-api exec jest settings-catalogs.service.spec --no-coverage
# 14 passed (incl. corrupt-key overview + invalid picker)

# Live (dev stack):
# GET http://127.0.0.1:28001/api/hrm/settings-catalogs
#   x-internal-api-key + x-tenant-id=xevn + x-company-id=main → 200
# ceo@ JWT Bearer + x-company-id=main → 200
```

## QA retest (U65 · U76)

- Persona: `ceo@xe.vn` / `Xevn@2026`
- Path: Portal → `/hr/attendance?portal=1&companyId=main` → **Thiết lập** → **Quy định chấm công** → **Tùy chỉnh**
- **PASS:** Network `GET /api/hrm/settings-catalogs` **200** `HRM-SET-200`; không banner Sync ERROR; tab không BROKEN
- **J-***: Attendance settings shell (matrix `rules-Tùy chỉnh` row)

## Residual

- FE Attendance customize vẫn mock cột (không gọi catalog type riêng) — ngoài scope BE slice này
- 7 STUB_UI settings sidebar — **dev-fe** / BA CFG

---

### completion_report

Closed P0 **settings-catalogs 500** root cause (corrupt catalog_key → TypeError). Hardened overview + listSyncedCatalogs; deterministic **HRM-SET-001** on invalid picker key. Jest green; live GET 200 ceo@/main.

### next_owner

**qa**

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01
from_role: dev-be
to_role: qa
lane: execution
u65_zero_seed: true

entry_criteria: L0 PASS (hrm-api :28001); evidence docs/qa/evidence/po-mfd-m2-att-settings-catalog-500-01.md
exit_criteria: Browser ceo@ → Attendance → Thiết lập → Quy định chấm công → Tùy chỉnh — GET /api/hrm/settings-catalogs 200 HRM-SET-200; no HRM Sync ERROR; update HRM-ATTENDANCE_RUNTIME_LOG rules-Tùy chỉnh ≠ BROKEN
evidence_path: docs/qa/evidence/po-mfd-m2-att-settings-catalog-500-01-qa.md
ack_status: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/po-mfd-m2-att-settings-catalog-500-01.md`
