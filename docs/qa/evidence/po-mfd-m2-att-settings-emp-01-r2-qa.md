# Evidence — PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QA` |
| **from_role** | qa |
| **to_role** | pm / qc |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **hdsd_align** | CC → HRM → Chấm công → **Thiết lập** → **Nhân viên** (matrix #31) · Lấy lại dữ liệu · Nhập khẩu |
| **spec_ref** | ATT-C7 · matrix #31 · HRM-IM-01 · FR-HRM-IM-01 · FE `po-mfd-m2-att-settings-emp-01-fe.md` |
| **prior** | QC GWC #31 PARTIAL · residual Import/Refresh unwired · FE READY_FOR_QA wire |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** |
| **attendance_closed** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **journey_l25** | Matrix **#31** Settings→Nhân viên (no dedicated J-* settings-emp row) · **J-HRM-06** prior ✅ untouched |

## Entry / L0

| Check | Result |
|-------|--------|
| FE READY_FOR_QA | `docs/qa/evidence/po-mfd-m2-att-settings-emp-01-fe.md` — Refresh→`useEmployees.refetch` · Import→`EmployeeImportDialog` · vitest 5/5 |
| `pnpm run qc:fe-be-health` (entry) | **PASS** (hrm/xbos/portal/proxy 200) |
| `pnpm run qc:fe-be-health` (exit) | **PASS** (after HRM restart mid-wave; browser AC completed while L0 entry green) |
| Seed / API invent | **None** (U65) — browser only; Import dialog opened **without** file upload/commit |

## Persona / URL

| Role | Account | Password | JWT OU | URL |
|------|---------|----------|--------|-----|
| Group CEO (settings admin) | `ceo@xe.vn` | `Xevn@2026` | `main` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |

## HDSD inventory (U76)

| # | Surface | HDSD / matrix label | Present |
|---|---------|---------------------|---------|
| — | Shell | Chấm công embed | 🟢 |
| — | Tab | **Thiết lập** | 🟢 |
| — | Sidebar | **Nhân viên** | 🟢 |
| **31** | Employees panel | Tìm; lọc; **Lấy lại dữ liệu**; **Nhập khẩu**; bảng NV | 🟢 UI + 🟢 CTA wire (Network/dialog proven) |

## Click path

1. Login portal `ceo@xe.vn` → inject token → open `/hr/attendance?portal=1&companyId=main`
2. Click top tab **Thiết lập**
3. Click sidebar **Nhân viên**
4. Baseline list: GET employees **200** `HRM-EMP-200` · 59 rows · idle GET **0**/5s
5. Click `data-testid=hdsd-att-settings-emp-refresh` (**Lấy lại dữ liệu**) → observe Network GET employees
6. Click `data-testid=hdsd-att-settings-emp-import` (**Nhập khẩu**) → observe `EmployeeImportDialog` (role=dialog + file input)
7. Close dialog (Escape/Đóng) — **no** file select / preview / commit (U65)
8. Screenshots under `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/`

## AC results

| AC | Result | Evidence |
|----|--------|----------|
| 1 L0 qc:fe-be-health entry+exit | **PASS** | entry ALL PASS; exit ALL PASS after HRM restart |
| 2 HDSD Thiết lập → Nhân viên (#31) | **PASS** | inventory 🟢; tabs/sidebar present |
| 3 List baseline GET 200 HRM-EMP-200; idle 0 | **PASS** | total=59 · rowCount=59 · idle emp=0 · idle allHrm=0 |
| 4 Click «Lấy lại dữ liệu» → GET employees **200** | **PASS** | empGets=1 · status=200 · code=`HRM-EMP-200` · x-company-id=main |
| 5 Click «Nhập khẩu» → dialog / file UI | **PASS** | `dialogVisible=true` · `fileInput=true` · fileChooser event optional (dialog-first design) |
| 6 No ERROR banner; pageErrors=[] | **PASS** | errorBanner=false · pageErrors=[] · networkBad=[] |
| 7 Stamp #31 honesty | **LIVE** | Refresh Network + Import dialog **both** proven — upgrade from PARTIAL |
| 8 portal_url + click path + J-* | **PASS** | portal_url above · journey_l25 noted |

### Network (load)

| API | Status | Code | Note |
|-----|--------|------|------|
| `GET …/employees?company_id=main&include_archived=false&page=1&page_size=100` | **200** | `HRM-EMP-200` | total=59 · rowCount=59 · x-company-id=main |
| Idle GET employees / 5s | **0** | — | no storm |
| Idle GET all `/api/hrm` / 5s | **0** | — | no storm |

### CTA exercise (R2)

| CTA | Label | Clicked | Network / UI after click | Verdict |
|-----|-------|---------|--------------------------|---------|
| Refresh | **Lấy lại dữ liệu** | yes | GET employees **200** `HRM-EMP-200` (59) · wired=true | **PASS** |
| Import | **Nhập khẩu** | yes | `EmployeeImportDialog` visible · file input present · no mutate | **PASS** |

## Honesty

| Item | Fact |
|------|------|
| List source | `useEmployees` → `GET /api/hrm/employees` |
| Refresh | Wired → refetch → Network GET **200** (not 0) |
| Import | Wired → `EmployeeImportDialog` (HRM-IM-01) — dialog proven; preview/commit **not** exercised this seat (optional AC) |
| Mã chấm công / leave days | Still REF/`—` — OBS mapping SPEC_GAP unchanged |
| Seat stamp | **#31 LIVE** (list + Refresh + Import UI wire) |
| Attendance CLOSED / uat_done | **false** — not claimed |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` | — | — | **CLOSED** this R2 (Network + dialog proof) |
| `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` | OBS | ba-process | Mã chấm công / leave days UNMAPPED — non-blocking for #31 LIVE CTA upgrade |

## Forbidden honesty

- No seed · no invent import commit rows
- **uat_done=false** · Attendance **not** CLOSED
- Did **not** reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK without new FAIL
- #31 LIVE only after Refresh GET 200 **and** Import dialog proven

## Matrix stamp (runtime)

| # | Was (QC GWC) | Now (this R2) |
|---|--------------|---------------|
| 31 | **PARTIAL** (list LIVE; Import/Refresh unwired) | **LIVE** — Refresh GET 200 + Import dialog |

Updated SoT row: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` #31 → **LIVE** (`SETTINGS-EMP-01-R2`).

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-settings-emp-01-r2-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-settings-emp-01-r2.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01-r2/` |
| FE entry | `docs/qa/evidence/po-mfd-m2-att-settings-emp-01-fe.md` |
| Prior QC | `docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md` |

### Key screens

| File | Shows |
|------|--------|
| `01-attendance-shell.png` | Attendance shell after login |
| `03-settings-employees-loaded.png` | Thiết lập → Nhân viên · table · CTAs · no ERROR |
| `04-after-refresh-click.png` | After Refresh (refetch path) |
| `05-after-import-click.png` | EmployeeImportDialog open |
| `07-settings-emp-final.png` | Final panel state |

## completion_report

**Closed:** R2 U65 browser retest after FE wire. L0 entry+exit PASS. `ceo@xe.vn` / `main` → Thiết lập → Nhân viên. List GET **200** `HRM-EMP-200` (59) · idle0. Refresh → GET employees **200** (wired). Import → `EmployeeImportDialog` visible. pageErrors=[]. Residual Import/Refresh unwired **CLOSED**. Matrix **#31 LIVE**. OBS mapping SPEC_GAP remains. `uat_done=false`. Attendance **not** CLOSED. No seed. Did not reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK.

**Open:** OBS `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` (ba-process) · QC re-gate for LIVE upgrade.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SETTINGS-EMP-01-R2-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true
hdsd_align: true
entry_criteria: QA PASS_TO_PM docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qa.md — #31 LIVE; Refresh GET 200 HRM-EMP-200; Import EmployeeImportDialog visible; list 59 idle0; L0 entry+exit PASS; residual Import/Refresh CLOSED; OBS mapping only
exit_criteria: Audit browser JSON + PNG vs AC; confirm #31 LIVE upgrade honest (do NOT invent Attendance CLOSED / uat_done); GWC or GO for SETTINGS-EMP slice; do NOT reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK without new FAIL
cấm: seed · invent ATT CLOSED · invent UAT DONE · invent full Attendance menu CLOSED · reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK
evidence_path: docs/qa/evidence/po-mfd-m2-att-settings-emp-01-r2-qc.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
