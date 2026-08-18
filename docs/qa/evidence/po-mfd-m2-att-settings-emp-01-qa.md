# Evidence — PO-MFD-M2-ATT-SETTINGS-EMP-01 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-EMP-01` |
| **from_role** | qa |
| **to_role** | pm / qc |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **hdsd_align** | CC → HRM → Chấm công → **Thiết lập** → **Nhân viên** (matrix #31) · list · Lấy lại dữ liệu · Nhập khẩu |
| **spec_ref** | ATT-C7 · matrix #31 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` · `useEmployees` list · SPEC_GAP import/refresh |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** |
| **attendance_closed** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **PASS** |
| `pnpm run qc:fe-be-health` (exit) | **PASS** |
| Seed / API invent | **None** (U65) — browser only |

## Persona / URL

| Role | Account | Password | JWT OU | URL |
|------|---------|----------|--------|-----|
| Group CEO (settings admin) | `ceo@xe.vn` | `Xevn@2026` | `main` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |

Rationale: matrix #31 Settings → Nhân viên chấm công — admin CFG surface (not ESS-only).

## HDSD inventory (U76)

| # | Surface | HDSD / matrix label | Present |
|---|---------|---------------------|---------|
| — | Shell | Chấm công embed | 🟢 |
| — | Tab | **Thiết lập** (UI label; matrix «Cài đặt») | 🟢 |
| — | Sidebar | **Nhân viên** | 🟢 |
| **31** | Employees panel | Tìm; lọc trạng thái; **Lấy lại dữ liệu**; **Nhập khẩu**; bảng mã NV / họ tên / đơn vị / mã chấm công | 🟢 UI · 🟡 CTA wire |
| — | Tabs spot | Tổng quan / Chấm công / Báo cáo / Nghỉ phép | 🟢 |

SoT path: fidelity matrix C7 row 31 + live VI labels (`attPage.refreshData` = «Lấy lại dữ liệu», `attPage.import` = «Nhập khẩu»). No dedicated HDSD CH «Chấm công → Cài đặt → Nhân viên» client HTML in `docs/client-delivery/hdsd/hrm/`.

## Click path

1. Login portal `ceo@xe.vn` → inject token → open `/hr/attendance?portal=1&companyId=main`
2. Click top tab **Thiết lập**
3. Click sidebar **Nhân viên** (default `activeSidebarItem=employees`)
4. Observe load: title Nhân viên, table 59 rows, search + status filter, no ERROR banner
5. Click **Lấy lại dữ liệu** once → observe Network (expect wire or SPEC_GAP)
6. Click **Nhập khẩu** once → observe Network / file dialog (expect wire or SPEC_GAP)
7. F5 skipped (no mutate) · screenshots

## AC results

| AC | Result | Evidence |
|----|--------|----------|
| 1 Navigate HDSD Thiết lập → Nhân viên + inventory | **PASS** | tabs/sidebar 🟢; inventory above |
| 2 Page load no ERROR; list honest LIVE/PARTIAL | **PASS** | errorBanner=false; GET employees **200** `HRM-EMP-200` total=59; tableRows=59 |
| 3 Import/Refresh CTA exercise → 2xx **or** SPEC_GAP residual | **PASS** (documented SPEC_GAP) | both clicked; **0** network; no file dialog — residual below |
| 4 No GET storm; F5 if mutate | **PASS** | idle emp GET **0**/5s; idle all HRM GET **0**; F5 SKIP (no mutate) |
| 5 Matrix #31 stamp honesty | **PARTIAL** | list LIVE; import/refresh unwired |

### Network (load)

| API | Status | Code | Note |
|-----|--------|------|------|
| `GET …/employees?company_id=main&include_archived=false&page=1&page_size=100` | **200** | `HRM-EMP-200` | total=59 · rowCount=59 · x-company-id=main |
| Idle GET employees / 5s | **0** | — | no storm |
| Idle GET all `/api/hrm` / 5s | **0** | — | no storm |
| pageErrors / consoleErrors / 5xx | **0** | — | |

### CTA exercise

| CTA | Label | Clicked | Network after click | Dialog / file | Verdict |
|-----|-------|---------|---------------------|---------------|---------|
| Refresh | **Lấy lại dữ liệu** | yes | employeesGets=0 · allHrm=0 · mutate=0 | — | **SPEC_GAP / unwired** |
| Import | **Nhập khẩu** | yes | employeesGets=0 · allHrm=0 · mutate=0 | fileChooser=false | **SPEC_GAP / unwired** |

Code read confirms: `Attendance.tsx` `renderSettingsContent` employees branch — both `<Button>` have **no `onClick`**.

## Honesty

| Item | Fact |
|------|------|
| List source | `useEmployees` → `GET /api/hrm/employees` (employee master REF) |
| Refresh | UI only — no refetch handler |
| Import | UI only — no upload / file input / API |
| Mã chấm công column | Displays `employee_code` (no dedicated attendance mapping API) |
| Ngày phép column | Static `—` (not leave-balance wire on this panel) |
| Seat stamp | **PARTIAL** — list LIVE; Import/Refresh not LIVE |

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` | **P1** | **dev-fe** | Wire `Lấy lại dữ liệu` → employees refetch + `Nhập khẩu` → import flow (or honest disable + SPEC_GAP badge). Buttons render without onClick/network. |
| `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` | OBS | ba-process | Mapping mã chấm công / attendance allow-list FR — UI = employee master list only; leave days = —. UNMAPPED. Non-blocking for PARTIAL. |

## Forbidden honesty

- No seed · no API invent rows
- **uat_done=false** · Attendance **not** CLOSED
- Did **not** reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC
- Did **not** invent #31 LIVE (import/refresh unwired)

## Matrix stamp (runtime)

| # | Was | Now (this seat) |
|---|-----|-----------------|
| 31 | PARTIAL (import/refresh wiring unclear) · M1 runtime log said LIVE (table only) | **PARTIAL** — U65: list GET 200 + 59 rows + idle0; Refresh/Import clicked = **0** network → SPEC_GAP residual |

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-settings-emp-01-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-settings-emp-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-settings-emp-01/` |

### Key screens

| File | Shows |
|------|--------|
| `01-attendance-shell.png` | Attendance shell after login |
| `03-settings-employees-loaded.png` | Thiết lập → Nhân viên · table · Lấy lại dữ liệu · Nhập khẩu · no ERROR |
| `04-after-refresh-click.png` | After Refresh click — UI unchanged · no refetch spin |
| `05-after-import-click.png` | After Import click — no dialog |

## completion_report

**Closed:** P1-5 matrix #31 Settings→Nhân viên — U65 browser as `ceo@xe.vn` / `main`. Nav HDSD Thiết lập → Nhân viên; list GET **200** `HRM-EMP-200` (59 rows); no ERROR; idle GET 0; Import + Refresh CTAs exercised once and documented **unwired** (SPEC_GAP residual → dev-fe). Stamp **#31 PARTIAL**. L0 entry+exit PASS. No seed. `uat_done=false`. Attendance **not** CLOSED.

**Open:** `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` (P1 FE) · OBS mapping SPEC_GAP (BA).

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SETTINGS-EMP-01-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true
hdsd_align: true
entry_criteria: QA PASS_TO_PM docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qa.md — #31 PARTIAL; list GET 200 HRM-EMP-200 59 rows; idle0; Refresh «Lấy lại dữ liệu» + Import «Nhập khẩu» clicked with 0 network (SPEC_GAP residual R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED → dev-fe); L0 PASS
exit_criteria: Audit browser evidence vs AC; confirm matrix #31 PARTIAL (do NOT invent LIVE); GWC with CONDITION wire Import/Refresh OR GO WITH CONDITIONS; do NOT invent Attendance CLOSED; uat_done stays false; do NOT reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK GWC without new FAIL
cấm: seed · invent ATT CLOSED · invent UAT DONE · invent #31 LIVE · reopen REPORTS/REQUESTS/LEAVE/OT/CLOCK
evidence_path: docs/qa/evidence/po-mfd-m2-att-settings-emp-01-qc.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
