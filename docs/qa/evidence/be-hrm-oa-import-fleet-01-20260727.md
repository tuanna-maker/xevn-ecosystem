# BE-HRM-OA-IMPORT-FLEET-01 — OpenAPI deepen Import preview + Fleet

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-OA-IMPORT-FLEET-01` |
| **from_role** | `pm` |
| **to_role** | `dev-be` |
| **lane** | execution · OpenAPI deepen residuals |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Plane | Path · ack |
|-------|------------|
| **srs** | khách `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.32 FR-HRM-IM-01 Diễn biến #1–#8 · §3.49 FR-HRM-FL-01 #1/#2/#3/#6/#8 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.2 SHEET-200 · §16.5 HRM-FLEET-200 · §17.1 import preview no persist |
| **db_design** | `DB_DESIGN_HRM_IMPORT_PREVIEW.md` **N/A table** (non-persist) · `DB_DESIGN_HRM_FLEET.md` `hrm_fleet_vehicles` TEXT Plane B |
| **api_design** | `API_DESIGN_HRM_IMPORT_PREVIEW.md` §A F.1 · `API_DESIGN_HRM_FLEET.md` §A F.1 |
| **uc_ids** | FR-HRM-IM-01 / HRM-IM-01 · FR-HRM-FL-01 |
| **sponsor_confirm** | PM DISPATCHED soft residual wave 2026-07-27 · U65 · no invent staging/commit DONE |
| **must_keep** | IM-01 non-persist · FL-01 GET list only · U65 · no invent commit as DONE |

---

## 2. Deliverables

| Artifact | Change |
|----------|--------|
| `docs/api/openapi/hrm-api.yaml` | version `1.3.2-oa-import-fleet` · tag **Fleet** · schemas `ImportPreviewData` / `FleetVehicleList` · deepen `sheetPreview` multipart F.1 · ADD `GET /fleet/vehicles` F.1 |
| `scripts/verify-openapi-hrm-p1-s3b.mjs` | Needles: Fleet tag · `fleetListVehicles` · `/fleet/vehicles` · Mục đích IM/FL · `ImportPreviewData` · `zero INSERT/UPDATE` · version bump |
| `spreadsheet.controller.ts` | `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` APPEND |
| `fleet.controller.ts` | `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` APPEND |
| `API_DESIGN_HRM_IMPORT_PREVIEW.md` | OpenAPI pointer + **G-IM-OPENAPI-01 CLOSED** |
| `API_DESIGN_HRM_FLEET.md` | OpenAPI pointer + OpenAPI fleet path **CLOSED** |

**forbidden honored:** no staging/commit tables invent · no seed · no FE apps · no Phase1/PROD claim · runtime preview/list logic unchanged (OpenAPI + CODE-MEMORY only).

---

## 3. F.1 checklist (OpenAPI)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | Multipart / schema | Verdict |
|----------|----------|-----------|----------|--------------------|---------|
| `POST /spreadsheet/import/preview` | ✅ HCNS xem trước import | ✅ auth→scope→file→MIME→parse→validate→SHEET-200 · zero INSERT | FR-HRM-IM-01 #1–#8 | ✅ `multipart/form-data` + `ImportPreviewData` | **PASS** — closes **G-IM-OPENAPI-01** |
| `GET /fleet/vehicles` | ✅ danh sách xe / empty | ✅ resolveHrmListScope + TEXT filter + status/limit | FR-HRM-FL-01 #1/#2/#3/#6/#8 | ✅ `FleetVehicleList` · HRM-FLEET-200 | **PASS** — closes OpenAPI fleet residual |

---

## 4. Verification

| Command | Result |
|---------|--------|
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** · 53 checks · EXIT 0 |
| `pnpm --filter hrm-api exec jest --testPathPatterns="spreadsheet.controller.spec\|fleet.controller.spec" --no-coverage` | **PASS** · 2 suites · **10** tests · EXIT 0 |

---

## 5. Residual (honest)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-IM-CATALOG-01** | P2 | ba closed (spec) / optional later BE | Catalog hard-block + DB dup still OUT of preview runtime — not this WI |
| **G-FL-02** | P2 | `dev-be` optional | Keyword plate/name filter — not opened |
| **G-FL-01** / **G-FL-UPSERT** | Info | ba / future write FR | Detail get-by-id · public upsert — must_keep non-goal |
| **G-SCOPE-01** | P0 standing | on-touch | Fleet list already covered in controller spec rollup |

**Non-claims:** IM-02 commit DONE · Phase1/PROD · UF 🟢 via seed · invent staging table.

---

## 6. Handoff

### completion_report

**Closed:** G-IM-OPENAPI-01 (multipart OpenAPI + ImportPreviewData + F.1 Mục đích/Nghiệp vụ/Bước SRS) and Fleet OpenAPI residual (`GET /fleet/vehicles` F.1 + FleetVehicleList); verify script needles extended; CODE-MEMORY APPEND on spreadsheet + fleet controllers; API_DESIGN residual flags CLOSED; no runtime behavior change; no staging invent; U65 honored.

**Residual:** G-FL-02 keyword · G-FL-UPSERT public write (future FR) · G-IM-CATALOG runtime hard-block if product later requires.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-OA-IMPORT-FLEET-01
from_role: pm
to_role: qa
lane: execution · contract gate
entry_criteria: BE-HRM-OA-IMPORT-FLEET-01 READY_FOR_QA · evidence docs/qa/evidence/be-hrm-oa-import-fleet-01-20260727.md
read_first:
  - docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md §A (F.1)
  - docs/hrm/API_DESIGN_HRM_FLEET.md §A (F.1)
  - docs/api/openapi/hrm-api.yaml paths /spreadsheet/import/preview + /fleet/vehicles
  - docs/qa/evidence/be-hrm-oa-import-fleet-01-20260727.md
exit_criteria:
  - pnpm run verify:openapi-hrm-p1-s3b EXIT 0 (53+ needles incl. Mục đích IM/FL, ImportPreviewData, FleetVehicleList, /fleet/vehicles)
  - Confirm OpenAPI description contains F.1 Mục đích + Nghiệp vụ + Bước SRS for sheetPreview + fleetListVehicles
  - Confirm multipart required [file, kind] + response schema ImportPreviewData; fleet GET list-only (no POST vehicles)
  - Confirm G-IM-OPENAPI-01 CLOSED in API_DESIGN_HRM_IMPORT_PREVIEW residual table
  - Optional L1 smoke (if stack up): POST preview dry-run returns SHEET-200 with zero employees insert; GET fleet HRM-FLEET-200 empty OK — U65 no seed
  - evidence: docs/qa/evidence/qa-hrm-oa-import-fleet-01-20260727.md · PASS_TO_PM or FAIL with residual
cấm: seed · invent staging · claim IM-02/Phase1/PROD · PASS only by reading chat without running verify
```

### evidence_path

`docs/qa/evidence/be-hrm-oa-import-fleet-01-20260727.md`

### ack_status

**READY_FOR_QA**

### pm_dispatch_hint

`QA-HRM-OA-IMPORT-FLEET-01` — static OpenAPI F.1 + verify needles; browser UF optional if stack up (U65).
