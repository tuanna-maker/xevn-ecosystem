# Evidence — PO-MFD-M3-EMP-IMPORT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-IMPORT-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:19:37.654Z` (isolation retest) |
| **finishedAt** | `2026-08-04T09:20:02.464Z` |
| **commit** | `dc930c5` (runtime env) |
| **spec_ref** | HDSD CH06 §5.1 · FR-HRM-IM-01 · J-HRM-IM-01 · matrix #8–9 · must_keep #1–6 #10–12 #28 |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · no `pnpm seed:*` · FE file picker only · no invent Employees/Attendance CLOSED |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surfaces **#8–#9** |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-import-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-import-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-import-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** |
| **Attendance CLOSED** | **false** |
| **uat_done** | **false** |
| **verdict** | **PASS** |
| **commit LIVE claimed** | **false** (IM-02 not exercised) |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (before browser retest) | **ALL PASS** |
| Exit (after browser) | **ALL PASS** (harness probe + full `qc:fe-be-health`) |

## Persona / URL

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `tenantId=xevn` · `companyId=main` |
| URL | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| Login | portal proxy **201** |

## Click path (J-HRM-IM-01 · HDSD CH06 §5.1)

1. List baseline → total **60** · `HRM-EMP-200`
2. **Import Excel** → dialog «Import nhân viên từ Excel»
3. **Tải file mẫu (.xlsx)** → GET template **200** · 6457 bytes
4. Upload FE CSV (1 data row, unique `QA-IM-*`) → POST `/import/preview` **200** `SHEET-200` · `dryRun:true` · `rowCount:1` · `sessionId:null`
5. Preview table visible → **Hủy**
6. **F5** → list total **60** unchanged · preview code keyword probe **hit:false**
7. Spot **Xuất** dialog open (columns / xlsx|csv) → ESC (no Nest export claim)

## hdsd_inventory (U76)

| HDSD surface | Attempted | Result |
|--------------|-----------|--------|
| CH06 §2 list baseline | yes | GET **200** total **60** |
| CH06 §5.1 Nhập Excel open | yes | Dialog title LIVE |
| CH06 §5.1 Tải mẫu | yes | GET templates/employee_import **200** xlsx |
| CH06 §5.1 upload → preview | yes | POST preview **200** SHEET-200 dryRun |
| CH06 §5.1 Hủy | yes | Dialog closed · commitCalls=0 |
| CH06 §5.1 F5 unchanged | yes | total 60→60 · preview code absent |
| CH06 §5.2 Xuất spot | yes | Client dialog open · PARTIAL honesty |

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health entry+exit | 🟢 PASS |
| 2 | Import dialog opens (HDSD) | 🟢 PASS |
| 3 | Template download from server | 🟢 PASS |
| 4 | Preview POST 200 SHEET-200 dryRun | 🟢 PASS |
| 5 | Preview UI table | 🟢 PASS |
| 6 | Hủy → zero persist (no commit / no emp mutate) | 🟢 PASS |
| 7 | F5 list unchanged + preview code absent | 🟢 PASS |
| 8 | No pageErrors | 🟢 PASS |
| 9 | U65 zero-seed · commit LIVE not claimed | 🟢 PASS |
| 10 | Export dialog spot honesty | 🟢 PASS (PARTIAL stamp) |

## Matrix stamp (this seat)

| Surface # | Prior | After IMPORT-01 | Evidence |
|-----------|-------|-----------------|----------|
| **8** DLG-IMPORT | UNKNOWN | **LIVE** | Template + preview SHEET-200 + Hủy + F5; **IM-02 commit not exercised** |
| **9** DLG-EXPORT | UNKNOWN | **PARTIAL** | Client `EmployeeExportDialog` open; Nest spreadsheet export not exercised (P1-2) |
| **1–6** LIST | LIVE | **must_keep** | baseline/F5 list OK |
| **10–12** DETAIL | LIVE | **must_keep** | not re-opened this seat |
| **28** SCOPE | LIVE | **must_keep** | `company_id=main` list |

## Network proof (excerpt)

| Step | Request | Status |
|------|---------|--------|
| List baseline | `GET /api/hrm/employees?company_id=main&page=1&page_size=50` | **200** `HRM-EMP-200` total **60** |
| Template | `GET /api/hrm/spreadsheet/templates/employee_import?format=xlsx` | **200** · 6457 B |
| Preview | `POST /api/hrm/spreadsheet/import/preview` | **200** `SHEET-200` dryRun rowCount=1 |
| Commit | — | **0 calls** |
| Emp mutate POST/PATCH/DELETE | — | **0 calls** |
| F5 list | `GET /api/hrm/employees?…` | **200** total **60** |
| Preview code probe | `GET …&keyword=QA-IM-*` | **200** total **0** hit=false |

## Screens

| File | Content |
|------|---------|
| `01-list-baseline.png` | List total 60 |
| `02-import-dialog.png` | Import dialog upload step |
| `03-after-template.png` | After template download |
| `04-preview.png` | Preview table |
| `05-after-cancel.png` | After Hủy |
| `06-f5-after-cancel.png` | F5 list unchanged |
| `07-export-dialog.png` | Export dialog spot |

## First-run note (not FAIL product)

| Run | Outcome | Note |
|-----|---------|------|
| R1 ~09:16Z | FAIL `f5_unchanged` 59→60 | Concurrent `PO-MFD-M3-EMP-CREATE-UPDATE-01` POST **201** `QA-M3-987275` (same window) — **not** import persist; commitCalls=0 |
| R2 ~09:19Z isolation | **PASS** | total 60→60 · preview code absent |

## Defects / residuals

| ID | Severity | Status | Note |
|----|----------|--------|------|
| — | — | **none P0 import-preview** | — |
| OBS-IM-02-COMMIT | info | OPEN | Commit path not exercised this seat — do not stamp commit LIVE |
| OBS-EXPORT-NEST | P2 | OPEN | #9 PARTIAL — P1-2 `PO-MFD-M3-EMP-EXPORT-01` |
| OBS-CONCURRENT-CREATE | process | noted | Parallel CREATE +1 total on R1 — retest isolation required |

## Explicit non-claims

- Employees menu **not** CLOSED
- Attendance **not** CLOSED
- `uat_done` remains **false**
- **FR-HRM-IM-02 / commit LIVE** not claimed
- Nest employee export API not claimed LIVE

## completion_report

**Closed:** P0-5 `PO-MFD-M3-EMP-IMPORT-01` — U65 browser J-HRM-IM-01 / HDSD CH06 §5.1 for `ceo@xe.vn` / `main`: Import Excel → template → server preview (`SHEET-200` dryRun) → **Hủy** → F5 list unchanged; preview code absent; L0 entry+exit PASS; matrix **#8 LIVE** · **#9 PARTIAL**; must_keep LIST/DETAIL/SCOPE not regressed; **0** commit / emp mutates.

**Residual:** Employees not CLOSED; IM-02 commit not exercised; #9 Nest export depth = P1-2; RUNTIME-01 may still be in-flight.

**ack_status:** **PASS_TO_PM**

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-QA-RUNTIME-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true
ack_status target: PASS_TO_PM

## Entry
- IMPORT-01 PASS — docs/qa/evidence/po-mfd-m3-emp-import-01.md · #8 LIVE · #9 PARTIAL
- must_keep: LIST #1–6 · DETAIL #10–12 · CREATE #7 · SCOPE #28 · IMPORT #8 preview
- If RUNTIME-01 already in-flight: do not duplicate — intake evidence when ready

## Job
U65 RO stamp remaining UNKNOWN surfaces #13–27 (and any still UNKNOWN) LIVE|PARTIAL|STUB_UI|BROKEN.
Do NOT invent Employees CLOSED · do NOT seed · do NOT reopen Face ATT.

## Exit
evidence_path: docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md
Bus PASS_TO_PM · UNKNOWN=0 on matrix · uat_done false
```
