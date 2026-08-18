# QA-HRM-OA-IMPORT-FLEET-01 — OpenAPI contract gate (Import preview + Fleet)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-OA-IMPORT-FLEET-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · contract gate (yaml/verify primary) |
| **date** | 2026-07-27 |
| **workspace** | `C:\xevn-ecosystem` (+ OneDrive mirror used by pnpm) |
| **entry** | `BE-HRM-OA-IMPORT-FLEET-01` READY_FOR_QA · `docs/qa/evidence/be-hrm-oa-import-fleet-01-20260727.md` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — no seed · no invent staging · L1 dry-run CSV only (temp file, not DB seed) |

---

## 1. Commands

| Command | Result |
|---------|--------|
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** · **53** checks · **EXIT 0** |
| Optional L1 `GET /api/hrm/fleet/vehicles?limit=5` (internal key, `x-company-id=main`) | **PASS** · HTTP **200** · envelope `HRM-FLEET-200` · `total=0` `data=[]` (empty OK) |
| Optional L1 `POST /api/hrm/spreadsheet/import/preview` multipart `file`+`kind=employee_import`+`dryRun=true` | **PASS** · envelope **`SHEET-200`** · `dryRun=true` · `previewRows` len=1 · zero persist claim (preview path) |

**Note:** Preview HTTP status observed **201** with body `code: SHEET-200` (envelope SoT). OpenAPI documents `'200'` for this operation — informational mismatch only; not a gate fail for this WI (needles + F.1 + SHEET-200 code PASS).

---

## 2. Exit criteria checklist

| # | Criteria | Verdict |
|---|----------|---------|
| 1 | `verify:openapi-hrm-p1-s3b` EXIT 0 (needles Mục đích IM/FL, ImportPreviewData, FleetVehicleList, `/fleet/vehicles`) | **PASS** · 53/53 |
| 2 | OpenAPI F.1 Mục đích + Nghiệp vụ + Bước SRS for `sheetPreview` + `fleetListVehicles` | **PASS** |
| 3 | multipart `required: [file, kind]` + `ImportPreviewData`; fleet GET list-only (no POST vehicles) | **PASS** |
| 4 | `G-IM-OPENAPI-01` **CLOSED** in API_DESIGN residual table | **PASS** |
| 5 | Optional L1 if stack up: preview SHEET-200; fleet empty OK — U65 no seed | **PASS** (stack up) |
| 6 | Evidence + PASS_TO_PM / FAIL + next_dispatch_prompt | **PASS** (this file) |
| 7 | Append bus | **PASS** |

---

## 3. OpenAPI F.1 audit (static)

### 3.1 `POST /spreadsheet/import/preview` · `operationId: sheetPreview`

| F.1 field | Evidence in `hrm-api.yaml` |
|-----------|----------------------------|
| **Mục đích** | «Cho phép HCNS tải tệp import… xem trước… không tạo hồ sơ nhân viên hàng loạt» |
| **Nghiệp vụ** | Auth → scope → kind → multipart `file` → MIME → parse → validate → SHEET-200 · **zero INSERT/UPDATE** |
| **Bước SRS** | FR-HRM-IM-01 / UC HRM-IM-01 Diễn biến **#1–#8** (`SRS_HRM_KHACH.md` §3.32) |
| Multipart | `requestBody.required: true` · `multipart/form-data` · schema `required: [file, kind]` · `kind` enum `employee_import` |
| Response schema | `200` allOf → `code: SHEET-200` · `data: $ref ImportPreviewData` |
| Schema | `components.schemas.ImportPreviewData` required: kind, headersDetected, canonicalHeaders, rowCount, previewRows, truncated, errors, dryRun |

### 3.2 `GET /fleet/vehicles` · `operationId: fleetListVehicles`

| F.1 field | Evidence in `hrm-api.yaml` |
|-----------|----------------------------|
| **Mục đích** | «Cấp danh sách hồ sơ xe… empty trung thực… không lộ xe đơn vị khác» |
| **Nghiệp vụ** | Auth → resolveScopeContext → resolveHrmListScope → TEXT filter → status/limit → HRM-FLEET-200 · no side-effect seed · no write |
| **Bước SRS** | FR-HRM-FL-01 Diễn biến **#1/#2/#3/#6/#8** (`SRS_HRM_KHACH.md` §3.49) |
| Methods | Path has **`get:` only** — next path is `/operations/tasks` (no `post:` under `/fleet/vehicles`) |
| Response schema | `code: HRM-FLEET-200` · `data: $ref FleetVehicleList` (`total` + `data[]`) |

### 3.3 API_DESIGN residual

| ID | File | Status confirmed |
|----|------|------------------|
| **G-IM-OPENAPI-01** | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` §2 residual table | **CLOSED** · owner `dev-be` · 2026-07-27 · cites BE evidence |
| OpenAPI fleet path | `docs/hrm/API_DESIGN_HRM_FLEET.md` §C residual | **CLOSED** 2026-07-27 · `/fleet/vehicles` + F.1 + FleetVehicleList |

---

## 4. Classification

| Layer | Result |
|-------|--------|
| L0 stack | HRM `:28001` `/api/hrm` → `HRM-HEALTH-200` |
| Contract / OpenAPI | **PASS** (primary gate) |
| L1 optional | **PASS** fleet empty + preview SHEET-200 dryRun |
| L2 / L2.5 browser UF | **OUT of scope** this WI (contract gate) — browser IM-01 AC is separate `QA-HRM-IM-01-PREVIEW-AC-01` if dispatched |
| Phase1 / PROD / IM-02 DONE | **NOT claimed** |

---

## 5. Residual (honest — not blockers for this WI)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| Preview HTTP **201** vs OpenAPI `'200'` | Info/P3 | `dev-be` optional | Envelope `SHEET-200` correct; align status code in controller or yaml when touched |
| **G-FL-02** keyword filter | P2 | `dev-be` optional | Not opened |
| **G-FL-UPSERT** / **G-FL-01** detail | Info | future FR | must_keep FL-01 GET list only |
| **G-IM-CATALOG-01** runtime hard-block | P2 | product later | Spec CLOSED; runtime OUT of preview |
| Browser UF IM-01 | — | `qa` separate WI | Not this contract gate |

**Non-claims:** IM-02 commit DONE · Phase1/PROD · UF 🟢 · seed evidence.

---

## 6. Handoff

### completion_report

**Closed:** Contract gate `QA-HRM-OA-IMPORT-FLEET-01` — `verify:openapi-hrm-p1-s3b` **53 PASS EXIT 0**; OpenAPI F.1 Mục đích/Nghiệp vụ/Bước SRS confirmed for `sheetPreview` + `fleetListVehicles`; multipart `required: [file, kind]` + `ImportPreviewData`; fleet **GET list-only** (no POST `/fleet/vehicles`); **G-IM-OPENAPI-01 CLOSED** in API_DESIGN; optional L1 fleet empty `HRM-FLEET-200` + preview `SHEET-200` dryRun (U65, no seed).

**Residual:** HTTP 201 vs OpenAPI 200 (info); G-FL-02 / G-FL-UPSERT / browser IM AC = other WIs.

### next_owner

`pm` (optional: `qc` only if program requires formal GO on OpenAPI residual close; else close WI and continue parallel browser IM if needed)

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-HRM-OA-IMPORT-FLEET-01
from_role: qa
to_role: pm
lane: governance intake
entry_criteria: QA-HRM-OA-IMPORT-FLEET-01 PASS_TO_PM · evidence docs/qa/evidence/qa-hrm-oa-import-fleet-01-20260727.md
action:
  1) Mark G-IM-OPENAPI-01 + Fleet OpenAPI residual CLOSED at program bus / residual tracker
  2) Do NOT claim IM-02 / Phase1 / PROD
  3) If browser AC for FR-HRM-IM-01 still open: keep/continue QA-HRM-IM-01-PREVIEW-AC-01 (U65 FE flow) — separate from this contract PASS
  4) Optional P3: align preview HTTP status 201 vs OpenAPI 200 when next BE touch (not blocker)
exit_criteria: bus INTAKE recorded · next execution WI from backlog (not re-open OA import/fleet unless regression)
cấm: seed · invent staging · treat contract PASS as UF browser PASS
```

### evidence_path

`docs/qa/evidence/qa-hrm-oa-import-fleet-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Close OA residual tracker; do not reopen BE-HRM-OA-IMPORT-FLEET-01 unless verify fails; browser IM AC = `QA-HRM-IM-01-PREVIEW-AC-01` if still DISPATCHED.
