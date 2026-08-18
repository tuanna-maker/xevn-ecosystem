# Evidence — PO-MFD-M3-EMP-CREATE-UPDATE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-CREATE-UPDATE-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:16:27.275Z` |
| **finishedAt** | `2026-08-04T09:16:53.572Z` |
| **commit** | `dc930c5` |
| **spec_ref** | HRM-EM-01/03 · UF-HRM-03 · FR-UC-H01 · HDSD CH06 §3 · matrix #7 |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · FE-only mutate · no `pnpm seed:*` · no invent Employees CLOSED |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surface **#7** |
| **must_keep** | LIST #1–6 · DETAIL #10–12 · SCOPE #28 — not regressed |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-create-update-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-create-update-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-create-update-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** — create/update seat only |
| **Attendance CLOSED** | **false** — not invented |
| **uat_done** | **false** |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (before browser) | **ALL PASS** (portal `:5173` · hrm `:28001` · xbos `:28002`) |
| Harness exit probe | **portal/hrm/xbos 200** (in-run) |
| Post-run `qc:fe-be-health` | **portal ECONNREFUSED** — OBS ops (Vite dropped after run); **not** product FAIL for this seat |

## Persona

| Persona | Account | Scope |
|---------|---------|-------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `tenantId=xevn` · `companyId=main` rollup |

## hdsd_inventory (U76)

| HDSD / journey surface | Attempted | Result |
|------------------------|-----------|--------|
| Login Group CEO | API login portal proxy | **201/ok** · scope `main` |
| CH06 §2 Danh sách | `/hr/employees?…companyId=main` | GET **200** total **59** → after create **60** |
| CH06 §3.1 **Thêm nhân viên** | `hdsd-employees-create-btn` | Dialog `hdsd-employee-form-dialog` visible · tab cơ bản |
| CH06 §3.2 thiếu bắt buộc | Clear mã + họ tên → Lưu | Validation UI · **0** success POST |
| CH06 §3.1 điền + Lưu | Mã `QA-M3-987275` · Họ tên XEVN · Lưu | **POST 201** `HRM-EMP-201` |
| FE sau 2xx | Dialog đóng · row trên list | 🟢 `feRow=true` · `dialogGone=true` |
| F5 persist | Reload + keyword search | GET keyword **200** total **1** · code còn |
| CH06 §3 Sửa (fallback) | — | **SKIPPED** — create PASS (job allows edit only if create blocked) |

## Click path (U65)

1. Inject session `ceo@xe.vn` / `companyId=main`
2. Nav `/hr/employees?portal=1&tenantId=xevn&companyId=main`
3. **Thêm nhân viên** → clear required → **Lưu** → validation (no 2xx)
4. ESC → **Thêm nhân viên** → fill `QA-M3-987275` / `Nguyễn Văn QA M3 987275` → **Lưu**
5. Network **POST** `/api/hrm/employees` → **201**
6. FE list shows new code · F5 + keyword → still present

## Network (mutate)

| Step | Method | Status | Code | Note |
|------|--------|--------|------|------|
| Create | `POST /api/hrm/employees` | **201** | `HRM-EMP-201` | req `company_id=main` · body persist `company_id=holding` · id `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` |
| List after | `GET …/employees?company_id=main` | **200** | `HRM-EMP-200` | total **60** · first = new NV |
| F5 keyword | `GET …&keyword=QA-M3-987275` | **200** | `HRM-EMP-200` | total **1** |

Mutates count: **1** POST only (validation produced **0** success mutates).

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health entry (+ harness exit 200) | 🟢 PASS |
| 2 | HDSD Thêm NV dialog open (testid) | 🟢 PASS |
| 3 | Validation FD — empty required · no 2xx | 🟢 PASS |
| 4 | Create POST 2xx + FE after 2xx | 🟢 PASS (`201` · row) |
| 5 | F5 còn data | 🟢 PASS |
| 6 | U65 zero-seed · not invent Employees CLOSED | 🟢 PASS |
| 7 | must_keep LIST/DETAIL/SCOPE not claimed broken | 🟢 PASS |
| 8 | Edit fallback | ⚪ SKIPPED (create PASS) |

## Matrix stamp (this seat)

| Surface # | Prior | After CREATE-UPDATE-01 | Note |
|-----------|-------|-------------------------|------|
| **7** Thêm / Sửa NV | UNKNOWN | **LIVE** | Create POST 201 + F5; validation FD; edit skipped same dialog |
| **1–6 / 10–12 / 28** | LIVE | **must_keep** | Not reopened |

## Defects / residuals / OBS

| ID | Severity | Status | Note |
|----|----------|--------|------|
| OBS-CREATE-MAIN-TO-HOLDING | P3 honesty | OPEN | POST body `company_id=main` → stored `holding` (BE remap). Company picker absent in dialog this persona. Not FAIL — row visible under main rollup. Depth → P1 catalog/manager seats. |
| OBS-PORTAL-EXIT-FLAP | ops | OPEN | Post-run Vite `:5173` ECONNREFUSED; in-run portal OK. Restart portal before next browser seat. |
| R-MFD-M3-EMP-EDIT-SPOT | P2 | OPEN | Explicit **Sửa**/PATCH path not re-run this seat (create enough per job). Prior RET4 PATCH evidence exists; P1-3 manager seat will touch edit. |
| — | — | **none P0** | No Dev fix required for #7 LIVE |

## Screens

| File | Content |
|------|---------|
| `01-list.png` | Employees list main |
| `02-create-dialog.png` | Thêm nhân viên dialog |
| `03-validation-fail.png` | Empty required + validation |
| `04-create-fill.png` / `05-create-ready.png` | Filled form |
| `06-create-after-save.png` | After POST 201 |
| `07-create-fe-list.png` | Keyword row |
| `08-create-f5.png` | After F5 persist |

## Explicit non-claims

- Employees menu **not** CLOSED
- Attendance **not** CLOSED
- `uat_done` remains **false**
- IMPORT / SOFTDEL / RUNTIME remainder seats remain open
- Do **not** invent #7 CLOSED as whole Employees CLOSED

## completion_report

**Closed:** P0-6 `PO-MFD-M3-EMP-CREATE-UPDATE-01` — U65 browser HDSD CH06 §3 create for `ceo@xe.vn` / `main`: validation FD PASS; **Thêm nhân viên** → POST **201** `HRM-EMP-201` (`QA-M3-987275` → `holding` under main rollup) → FE row → F5 keyword persist; matrix **#7 LIVE**; must_keep LIST/DETAIL/SCOPE; no seed; Employees not CLOSED.

**Residual:** OBS main→holding remap P3; portal flap post-run; edit spot deferred P2 / P1-3; IMPORT/SOFTDEL still open.

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
- LIST-01 PASS — #1–6 LIVE
- DETAIL-01 PASS — #10–12 LIVE · SCOPE #28 must_keep
- CREATE-UPDATE-01 PASS — #7 LIVE · docs/qa/evidence/po-mfd-m3-emp-create-update-01.md
- FR-HRM-IM-01/02 · J-HRM-IM-01 · HDSD CH06 import
- L0: ensure portal :5173 up (OBS flap after CREATE seat)

## Job
Browser U65 ceo@xe.vn companyId=main: Nhập Excel → template/preview → **Hủy** (zero persist) + F5 list unchanged.
Optional commit only if AC allows FE-created data. Do NOT seed · do NOT invent Employees CLOSED.

## Exit
evidence_path: docs/qa/evidence/po-mfd-m3-emp-import-01.md
Bus PASS_TO_PM + stamp matrix #8 (#9 export honesty if opened)
```
