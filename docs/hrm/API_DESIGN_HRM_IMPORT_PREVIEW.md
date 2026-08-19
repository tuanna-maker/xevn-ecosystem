# API_DESIGN — HRM Import preview (FR-HRM-IM-01 · non-persist)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | khách `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.32** FR-HRM-IM-01 · UC **HRM-IM-01** · Diễn biến #1–#8 |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.2** row 32 · code **`SHEET-200`** · PARTIAL (preview only; commit riêng) |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md` — **N/A table** (non-persist by design) |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` `1.3.3-im-preview-http` — `sheetPreview` F.1 + `ImportPreviewData` · HTTP **200** + `SHEET-200` (G-IM-OPENAPI-01 + G-IM-HTTP-200 **CLOSED**) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | F.1 physical API for IM-01 preview **before** any persist invent |
| **Date** | 2026-07-27 |
| **Runtime** | `SpreadsheetController` · `SpreadsheetService.previewEmployeeImport` · `SpreadsheetIngestService` |
| **Base path** | `/api/hrm/spreadsheet` |

> **must_keep:** Admin · Fleet · OP · W2 · Payroll · Leave · ATT · Employees · XBOS Auth/RACI/WF/catalog-gov/KPI — **không** rewrite. U65 no-seed.  
> **Cấm:** invent staging persist · claim IM-02 commit DONE trong wave này · Phase1/PROD claim.  
> **Non-persist invariant:** Preview **không** `INSERT`/`UPDATE` `employees` (SRS #7 · TechSpec §17.1).

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS | Persist |
|---|----------------|--------------|-------------|---------|
| **A** | `POST /api/hrm/spreadsheet/import/preview` | **`SHEET-200`** | **FR-HRM-IM-01** / HRM-IM-01 | **None** — response only |
| **B** | `GET /api/hrm/spreadsheet/limits` | `SHEET-200` | Supporting (limits for FE) | None |
| **C** | `GET /api/hrm/spreadsheet/templates/:kind` | binary stream | Supporting (mẫu tệp · HRM-IM-04 leftover) | None |

**Out of scope FR-HRM-IM-01 DONE (G-IM-01 CLOSED — BA-U71-IM-RESIDUAL-01):**

| Path | Code | FR / UC | Note |
|------|------|---------|------|
| `POST …/import/commit` | `SHEET-201` | **HRM-IM-02** | Writes `employees` — **separate FR**; not required for IM-01 PASS |
| `POST …/export` | stream | **HRM-IM-03** | Leftover catalog — **OUT** of preview DONE |

**Cross-cite (no duplicate F.1 body):**

| Topic | Canonical |
|-------|-----------|
| Employee columns after commit | `API_DESIGN_HRM_EMPLOYEES` / `DB_DESIGN_HRM_EMPLOYEES` |
| Scope headers / JWT | `API_DESIGN_XBOS_AUTH_TENANT` + `resolveScopeContext` |
| Catalog sync (khách #4) | Settings / catalog-sync — **OUT** hard-fail IM-01 (see §2 · team `SRS_HRM_IM_01_RESIDUAL_TEAM.md`) |
| Team residual lock | `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` |

### 0.1 Common contract

| Item | Value |
|------|--------|
| Auth | Bearer JWT **or** `x-internal-api-key` via `isAuthorizedInternalRequest` — else `HRM-AUTH-001` |
| Scope headers | `x-tenant-id` · `x-company-id` — `resolveScopeContext` (preview validates context; **does not persist** company rows) |
| Envelope | Nest `ok(data, code, message)` for JSON endpoints |
| Multipart | Field name **`file`** required; meta body `kind` · optional `dryRun` |
| Kind | `kind` ∈ `employee_import` only (`ImportMultipartMetaDto`) |
| dryRun | Default **true** when omitted (`undefined` or `'true'`); string `'false'` allowed — still **no DB write** on preview path |
| MIME | `assertImportUploadMime` — csv / xlsx family; else `SHEET-400` |
| Limits | Env-backed `getSpreadsheetLimits()` — default upload 10 MiB · preview rows **100** · sync ms 30s |

### 0.2 Why DB map is N/A

| Wire / response field | DB column |
|----------------------|-----------|
| Entire preview payload | **N/A** — not persisted |
| `previewRows[]` fields | Logical map to future `employees` columns **only at IM-02 commit** (cite Employees pair) |

---

## A. Endpoint — Import preview (FR-HRM-IM-01)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/spreadsheet/import/preview` |
| Success | HTTP **200** (Nest `@HttpCode(OK)` — **not** Nest POST default 201) · **`SHEET-200`** · message `Import preview` |
| Auth | Bearer or internal key |
| Body | `multipart/form-data`: `file` + `kind=employee_import` + optional `dryRun` |
| Headers | `x-tenant-id` · `x-company-id` (scope) |
| Runtime | `importPreview` → `previewEmployeeImport` |

### Mục đích

Cho phép HCNS **tải tệp import nhân sự và xem trước** bảng dòng hợp lệ / lỗi từng dòng **trước khi xác nhận import** — phục vụ màn Import (§3.32) mà **không** tạo hồ sơ nhân viên hàng loạt trên hệ thống.

### Nghiệp vụ xử lý

1. Auth spreadsheet access — thiếu/invalid → `HRM-AUTH-001` (SRS Diễn biến **#1**).
2. `resolveScopeContext` từ JWT + headers — ngoài phạm vi / thiếu context → scope 4xx/409 theo ladder (SRS **#1**/#2 privilege/unit) — **không** ghi DB.
3. Validate `kind=employee_import` — sai → validation / kind assert fail.
4. Require multipart `file` buffer — thiếu → `SHEET-400` «file is required» (SRS **#2**/#3).
5. `assertImportUploadMime` — sai MIME/extension → `SHEET-400` (SRS **#3**).
6. Parse csv/xlsx via `SpreadsheetIngestService.parseEmployeeImportFile` — empty / bad workbook / no header → `SHEET-400`; over size/rows/cols/time → `SHEET-413` / `SHEET-408` (SRS **#3** empty/sai mẫu).
7. For each data row: `validateEmployeeImportRow` — thiếu `employee_code` / `email` / `full_name`, email invalid, length, bad `hired_at` → push `errors[]` với `code: SHEET-422` (SRS **#5**).
8. Build `previewRows` (canonical fields, capped by `maxPreviewRows`) · set `truncated` · `dryRun` · **return `SHEET-200`** — **zero INSERT/UPDATE** (SRS **#6**/#7/#8).
9. FE sau 2xx: hiện bảng xem trước + lý do lỗi; user sửa tệp & tải lại hoặc chuyển **HRM-IM-02** commit (ngoài slice).

> **Spec vs runtime (LOCKED — G-IM-CATALOG-01 CLOSED):** Khách sequence vẽ `SYS→DB` đối chiếu danh mục/trùng mã. **IM-01 MVP** = parse + field validation **in-memory** only — không query `employees` trùng mã, không hard-block catalog sync. Catalog/DB-dup hard checks = **IM-02** (BR-IM-02-VAL-01). **Cấm** invent staging table.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-IM-01** / HRM-IM-01 | **#1** Auth / ngoài quyền | Guard `HRM-AUTH-001` + scope resolve |
| 2 | | **#2** Chọn đơn vị / tệp | Headers scope + multipart `file` |
| 3 | | **#3** Sai mẫu / rỗng | `SHEET-400` / `SHEET-413` / `SHEET-408` |
| 4 | | **#4** Thiếu danh mục nền | **OUT hard-fail IM-01** (AC-IM-01-VAL-02) — UX mở khóa đồng bộ danh mục; không staging |
| 5 | | **#5** Trùng mã / thiếu họ tên | In-memory: thiếu họ tên/mã/email → `errors[]`; **trùng mã DB = IM-02** (AC-IM-01-VAL-03) |
| 6 | | **#6** Dòng hợp lệ | `previewRows[]` không có error cho dòng đó |
| 7 | | **#7** Chưa xác nhận — chưa tạo hồ sơ | **Invariant:** no persist |
| 8 | | **#8** Thành công cuối — bảng xem trước | **`SHEET-200`** + payload (**no** `sessionId` — G-IM-SESSION-01) |

### Request ↔ logical fields (DB N/A)

| Wire | Logical / future employees (IM-02) | Persist on preview? |
|------|-------------------------------------|---------------------|
| `file` | Parsed grid | **No** |
| `kind` | Discriminator `employee_import` | **No** |
| `dryRun` | Echoed in response | **No** |
| `x-company-id` | Scope context (commit uses for `company_id`) | **No write** |
| response `previewRows[].employee_code` | → `employees.employee_code` | **No** |
| response `previewRows[].email` | → `employees.email` | **No** |
| response `previewRows[].full_name` | → `employees.full_name` | **No** |
| response `previewRows[].job_title_key` | → `employees.job_title_key` | **No** |
| response `previewRows[].hired_at` | → `employees.hired_at` | **No** |
| response `errors[]` | Validation messages | **No** |
| response `truncated` / `rowCount` | Preview UX | **No** |
| *(non-goal)* `sessionId` / `previewToken` | Khách «mã phiên» — **not in contract** (G-IM-SESSION-01 CLOSED) | **N/A** |

### Response shape (`SHEET-200` data)

```ts
{
  kind: 'employee_import';
  headersDetected: string[];
  canonicalHeaders: readonly string[]; // template headers
  rowCount: number;
  previewRows: Array<{
    employee_code: string;
    email: string;
    full_name: string;
    job_title_key: string;
    hired_at: string;
  }>;
  truncated: boolean;
  errors: Array<{ row: number; field?: string; code: string; message: string }>;
  dryRun: boolean;
}
```

### Errors

| Condition | Code | HTTP | FE (SRS) |
|-----------|------|------|----------|
| No/invalid auth | `HRM-AUTH-001` | 401 | #1 |
| Scope mismatch | scope codes / 409 | 4xx | #1 |
| Missing file / bad MIME / empty / bad sheet | `SHEET-400` | 400 | #3 |
| Over size / rows / columns | `SHEET-413` | 413 | #3 |
| Parse/validate timeout | `SHEET-408` | 408 | #3 |
| Row field errors (still 200 with `errors[]`) | `SHEET-422` in row | — | #5 |
| *(commit path only — out of scope)* | `SHEET-422` hard fail | 422 | IM-02 |

---

## B. Supporting — Limits snapshot

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/spreadsheet/limits` |
| Success | **`SHEET-200`** · `Spreadsheet limits` |
| Auth | Same as §A |

### Mục đích

Cấp FE **giới hạn tải / số dòng preview** để cảnh báo trước khi upload (hỗ trợ FR-IM-01 UX; không phải FR chính).

### Nghiệp vụ xử lý

1. Auth → else `HRM-AUTH-001`.
2. Return `getSpreadsheetLimits()` snapshot — no DB.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| — | FR-HRM-IM-01 | Precondition / #2 sẵn sàng phân tích | Supporting FE guardrails |

---

## C. Supporting — Download import template

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/spreadsheet/templates/:kind?format=csv\|xlsx` |
| Success | StreamableFile (csv/xlsx attachment) |
| Auth | Same as §A |
| Kind | Template kind assert (`employee_import` family) |

### Mục đích

Cho phép tải **mẫu tệp** đúng header canonical — giảm lỗi SRS #3 «sai mẫu»; liên hệ leftover **HRM-IM-04** (không claim FR-IM-04 DONE).

### Nghiệp vụ xử lý

1. Auth → else `HRM-AUTH-001`.
2. Assert kind + format ∈ csv|xlsx — else `SHEET-400`.
3. Stream template bytes — no DB.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| — | FR-HRM-IM-01 precondition «có tệp theo mẫu» · leftover IM-04 | Supporting | Template download |

---

## 1. FE acceptance (post-mutation — preview is non-mutating)

| AC | Pass |
|----|------|
| After `SHEET-200` | UI shows preview table: rowCount / errors with reasons / truncated hint (**AC-IM-01-SESSION-01** — no session id required) |
| F5 | No new `employees` from preview alone (U65 · SRS #7 · **AC-IM-01-SCOPE-01**) |
| Empty/bad file | Banner / toast from `SHEET-400` — no fake rows |
| Commit / export | **OUT** IM-01 DONE — **AC-IM-01-SCOPE-02** · IM-02 / IM-03 |
| Catalog / DB dup | Not hard-fail on preview — **AC-IM-01-VAL-02/03** |

---

## 2. Residual summary (API) — updated BA-U71-IM-RESIDUAL-01

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **G-IM-01** | Info | **CLOSED** | ba-process | Commit=`HRM-IM-02` · export=`HRM-IM-03` — OUT of IM-01 DONE · BR/AC-IM-01-SCOPE-* |
| **G-IM-SESSION-01** | Info | **CLOSED** | ba-process | «Mã phiên» = **non-goal**; SoT = ephemeral `SHEET-200` payload · AC-IM-01-SESSION-* |
| **G-IM-CATALOG-01** | P2 | **CLOSED (spec)** | ba-process | In-memory field validate IN; catalog hard-block + DB dup OUT → IM-02 · AC-IM-01-VAL-* · **no staging invent** |
| **G-IM-OPENAPI-01** | P2 | **CLOSED** | `dev-be` | 2026-07-27 multipart + ImportPreviewData + F.1 in `hrm-api.yaml` · evidence `be-hrm-oa-import-fleet-01-20260727.md` |
| **G-IM-HTTP-200** | Info/P3 | **CLOSED** | `dev-be` | 2026-07-27 SoT = HTTP **200** + `SHEET-200` (API_DESIGN §A · OpenAPI `'200'` · SRS team Network) — Nest `@HttpCode(OK)` on `importPreview`; evidence `be-hrm-im-preview-http-align-01-20260727.md` |
| Scope privilege beyond auth | P2 | Defer | `dev-be` | Narrower «quyền import» role gate if product requires |

**Team SoT AC/BR:** `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md`

---

## 3. must_keep

- Preview path **never** calls `employees.createEmployee` — commit is IM-02 only.
- Do not wipe Admin/Fleet/OP/W2/Employees/Settings or XBOS Auth/RACI/WF/catalog-gov/KPI pairs.
- U72: FE must label import stage/status fields VI (`SRS_FIELD_DISPLAY` F-11) — display-only, not this API DDL.

**Pointer:** `docs/tech-spec/API_DESIGN_HRM_IMPORT_PREVIEW.md` → this file.
