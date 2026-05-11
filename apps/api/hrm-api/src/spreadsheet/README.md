# SpreadsheetModule (M2)

Server-side CSV + `.xlsx` (exceljs) for `hrm-api`. Auth and scope match other modules (`internal-auth`, `resolveScopeContext`).

## Routes (global prefix `api/hrm`)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/spreadsheet/limits` | Active byte/row/cell/time caps (env-tunable). |
| GET | `/spreadsheet/templates/:kind?format=csv\|xlsx` | Template download; `kind=employee_import` only in this slice. |
| POST | `/spreadsheet/import/preview` | `multipart/form-data`: `file`, `kind` (`employee_import`), optional `dryRun` (`true` default). JSON envelope **`SHEET-200`** with `errors[]` populated when row rules fail (**no DB writes**). |
| POST | `/spreadsheet/import/commit` | Same multipart; persists via `EmployeesService` (**no cross-row DB transaction** — mid-batch failure may leave earlier rows committed). Optional `Idempotency-Key` (reserved). |
| POST | `/spreadsheet/export` | JSON `{ kind, format, filter }`; `kind=employee_export`, `format=csv`; `filter` matches `ListEmployeesQueryDto`. |

## `kind` values (initial)

- `employee_import` — import preview/commit.
- `employee_export` — CSV export of employees (list DTO filter).

Unknown `kind` → `SHEET-400`.

## Limits (defaults; override via env)

- `SPREADSHEET_MAX_UPLOAD_BYTES` — default 10 MiB.
- `SPREADSHEET_MAX_CSV_ROWS` — default 50_000.
- `SPREADSHEET_MAX_XLSX_ROWS` — default 20_000.
- `SPREADSHEET_MAX_CELL_CHARS` — default 32 KiB.
- `SPREADSHEET_MAX_SYNC_MS` — default 30_000 ms.
- `SPREADSHEET_MAX_COLUMNS`, `SPREADSHEET_MAX_PREVIEW_ROWS` — column cap and preview row cap in JSON.

## Error codes (`ApiException`)

| HTTP | Code | When |
|------|------|------|
| 400 | SHEET-400 | Bad `kind`, missing file, malformed workbook/CSV |
| 401 | HRM-AUTH-001 | Unauthenticated (existing pattern) |
| 408 | SHEET-408 | Wall-clock budget exceeded |
| 413 | SHEET-413 | File/row/column/cell limits |
| 415 | SHEET-415 | Disallowed MIME/extension |
| 422 | SHEET-422 | Row/business validation or commit failures |
| 500 | SHEET-500 | Unexpected generation failure (reserved) |

## Hybrid parsing

- CSV: UTF-8, RFC4180-style quotes, streaming-friendly row caps.
- `.xlsx`: exceljs workbook, first worksheet only.
