# Evidence — PO-MFD-M3-EMP-LIST-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-LIST-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:11:04.463Z` |
| **finishedAt** | `2026-08-04T09:11:39.984Z` |
| **commit** | `dc930c5` |
| **spec_ref** | HDSD CH06 §2.1–§2.3 · UC-HRM-21 · HRM-EM-02 · matrix #1–6 · must_keep #28 |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · no `pnpm seed:*` · no invent Employees/Attendance CLOSED |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surfaces **#1–#6** |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-list-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-list-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-list-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** |
| **Attendance CLOSED** | **false** |
| **uat_done** | **false** |
| **verdict** | **PASS** |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (before browser) | **ALL PASS** (hrm/xbos/portal + employees/catalog direct+proxy) |
| Exit (after browser) | **ALL PASS** |
| Harness probe entry/exit | hrm/xbos/portal **200** |

## Persona / URL

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `tenantId=xevn` · `companyId=main` |
| URL | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| Login | portal proxy **201** |

## hdsd_inventory (U76)

| HDSD surface | Attempted | Result |
|--------------|-----------|--------|
| CH06 §2.1 Danh sách — load | yes | GET **200** `HRM-EMP-200` · UI **50** rows · total **59** · no Sync ERROR |
| CH06 §2.2 Tìm kiếm | yes | `keyword=QA-IM-W4B1E63RYV` → **200** · total **1** |
| CH06 §2.2 Lọc trạng thái | yes | Select «Đang làm việc» → `status=active` **200** |
| CH06 §2.2 Lọc phòng ban | yes | Client filter «Nhân sự» · **0** new list GET · empty page honesty |
| CH06 §2.3 Phân trang | yes | Next → `page=2` **200** · UI `51–59 / 59` |
| CH06 §2.3 Cột công ty (nhãn VI) | yes | API/UI «Tập đoàn XeVN» · «Công ty TNHH Du lịch…» · not raw slug-only |
| F5 after page 2 | yes | no Sync ERROR · list restored |

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health entry+exit | 🟢 PASS |
| 2 | GET `/employees` 2xx · `company_id=main` | 🟢 PASS (`HRM-EMP-200`) |
| 3 | Search keyword debounce → server `keyword=` | 🟢 PASS |
| 4 | Status filter → server `status=` | 🟢 PASS |
| 5 | Dept filter present (client page) | 🟢 PASS (empty honesty on «Nhân sự») |
| 6 | Pagination next → `page=2` · range honest | 🟢 PASS |
| 7 | Company label VI (no raw-slug-only column) | 🟢 PASS |
| 8 | No Sync ERROR / pageErrors | 🟢 PASS |
| 9 | U65 zero-seed · no invent CLOSED | 🟢 PASS |

## Matrix stamp (this seat)

| Surface # | Prior | After LIST-01 | Evidence |
|-----------|-------|---------------|----------|
| **1** SCR-LIST load | UNKNOWN | **LIVE** | GET 200 · 50/59 · subtitle count |
| **2** search keyword | UNKNOWN | **LIVE** | `keyword=` 200 · total 1 |
| **3** status filter | UNKNOWN | **LIVE** | `status=active` 200 · labels VI |
| **4** dept client filter | UNKNOWN | **LIVE** | client-only · empty honesty |
| **5** pagination | UNKNOWN | **LIVE** | `page=2` · `51–59 / 59` |
| **6** company_display VI | UNKNOWN | **LIVE** | display names VI |
| **28** FN-SCOPE-PARITY | LIVE | **LIVE** must_keep | list `company_id=main` observed (deep J-* = SCOPE-01) |

## Network proof (excerpt)

| Step | Request | Status |
|------|---------|--------|
| List | `GET /api/hrm/employees?company_id=main&page=1&page_size=50` | **200** `HRM-EMP-200` total 59 |
| Search | `…&keyword=QA-IM-W4B1E63RYV` | **200** total 1 |
| Status | `…&status=active` | **200** |
| Page 2 | `…&page=2&page_size=50` | **200** · 9 items |

## Screens

| File | Content |
|------|---------|
| `01-list-load.png` | List shell main rollup |
| `02-search.png` | Keyword result |
| `03-status-active.png` | Status «Đang làm việc» |
| `04-dept-filter.png` | Dept «Nhân sự» empty honesty |
| `05-pagination.png` | Page 2 range 51–59/59 |
| `06-f5.png` | After refresh |

## Defects / residuals

| ID | Severity | Status | Note |
|----|----------|--------|------|
| — | — | **none P0 list** | — |
| OBS-DEPT-EMPTY-PAGE | P3 | OPEN | Client dept «Nhân sự» → 0 rows on current page — honesty OK, not BROKEN |
| OBS-OU-FILTER | info | noted | Filter bar also has OU rollup select (not matrix #1–6) |

## Explicit non-claims

- Employees menu **not** CLOSED
- Attendance **not** CLOSED
- `uat_done` remains **false**
- DETAIL / IMPORT / CREATE / RUNTIME seats remain open

## completion_report

**Closed:** P0-3 `PO-MFD-M3-EMP-LIST-01` — U65 browser HDSD CH06 §2 list shell for `ceo@xe.vn` / `main`: load, keyword search, status filter, dept client filter, pagination, company VI labels; L0 entry+exit PASS; matrix **#1–#6 LIVE**; must_keep **#28** not regressed on list query.

**Residual:** Employees not CLOSED; DETAIL/IMPORT/RUNTIME seats; dept empty-page OBS P3 only.

**ack_status:** **PASS_TO_PM**

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-IMPORT-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true
ack_status target: PASS_TO_PM

## Entry
- LIST-01 PASS — docs/qa/evidence/po-mfd-m3-emp-list-01.md · matrix #1–6 LIVE
- DETAIL-01 PASS — #10–12 LIVE · SCOPE #28 LIVE must_keep
- FR-HRM-IM-01/02 · J-HRM-IM-01 · HDSD CH06 import

## Job
Browser U65 ceo@xe.vn companyId=main: Nhập Excel → template/preview → **Hủy** (zero persist) + F5 list unchanged.
Optional commit only if AC allows FE-created data. Do NOT seed · do NOT invent Employees CLOSED.

## Exit
evidence_path: docs/qa/evidence/po-mfd-m3-emp-import-01.md
Bus PASS_TO_PM + stamp matrix #8 (#9 export honesty if opened)
```
