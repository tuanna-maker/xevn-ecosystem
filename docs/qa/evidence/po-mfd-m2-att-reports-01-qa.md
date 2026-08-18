# Evidence — PO-MFD-M2-ATT-REPORTS-01 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-REPORTS-01` |
| **from_role** | qa |
| **to_role** | pm / qc |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **hdsd_align** | CC → HRM → Chấm công → **Báo cáo** (matrix #29) · filter tháng/năm · KPI/charts/bảng · Xuất CTA spot (#30 P2) |
| **spec_ref** | ATT-C6 · matrix #29 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` · UF-HRM-05 · `useAttendanceReports` |
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
| Seed / API invent | **None** (U65) — read-only browser |

## Persona / URL

| Role | Account | Password | JWT OU | URL |
|------|---------|----------|--------|-----|
| Group CEO (admin reports) | `ceo@xe.vn` | `Xevn@2026` | `main` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |

Rationale: matrix #29 = «Báo cáo quản trị trước chốt lương» — CEO holding persona (not ESS-only).

## HDSD inventory (U76)

| # | Surface | HDSD / matrix label | Present |
|---|---------|---------------------|---------|
| — | Shell | Chấm công embed | 🟢 |
| — | Tab | **Báo cáo** | 🟢 |
| **29** | Reports | Filter tháng/năm · KPI · charts · bảng NV/PB | 🟢 |
| 30 | Export | **Xuất báo cáo** CTA | 🟡 spot only — P2 not exercised (do not claim LIVE export) |
| — | Tabs spot | Tổng quan / Chấm công / Nghỉ phép / Thiết lập | 🟢 |

SoT path: fidelity matrix C6 row 29 + UI labels (no dedicated HDSD CH «Chấm công» client HTML in `docs/client-delivery/hdsd/hrm/` — inventory from matrix + live menu).

## Click path

1. Login portal `ceo@xe.vn` → inject token → open `/hr/attendance?portal=1&companyId=main`
2. Click top tab **Báo cáo**
3. Observe load: title «Báo cáo chấm công», KPI cards, charts, no ERROR banner
4. Change month filter **Tháng 8 → Tháng 7**
5. Observe FE update (KPI / charts / date range GET) + idle settle
6. Screenshot (no seed, no export submit)

## AC results

| AC | Result | Evidence |
|----|--------|----------|
| 1 Navigate Chấm công → Báo cáo + HDSD inventory | **PASS** | tab Báo cáo 🟢; inventory table above |
| 2 Page load no ERROR; GET 2xx or honest empty | **PASS** | errorBanner=false; fan-in 4×2xx; Aug has 4 records; Jul honest 0% |
| 3 Filters apply; FE updates; no GET storm | **PASS** | Tháng 8→7; `from_date` 2026-08-01→2026-07-01; idle GET **0**/5s load+filter |
| 4 Client aggregate honesty | **PASS** (documented) | No `/attendance/reports/*` — FE aggregate records+employees+leave |
| 5 Screenshot + click path + URL | **PASS** | screens/ + URL above |
| 6 Matrix #29 stamp | **LIVE** | #30 remains **PARTIAL** (export P2) |

### Network (load — Tháng 8)

| API | Status | Code | Note |
|-----|--------|------|------|
| `GET …/attendance/records?from_date=2026-08-01&to_date=2026-08-31` | **200** | `HRM-ATT-200` | total=4 |
| `GET …/employees?status=active&page_size=1` | **200** | `HRM-EMP-200` | total=59 |
| `GET …/attendance/leave-requests` | **200** | `HRM-LEAVE-200` | total=42 |
| Idle GET / 5s | **0** | — | no storm |

### Filter (Tháng 7)

| Check | Result |
|-------|--------|
| Combo | Tháng 8 → **Tháng 7** (12 options) |
| Refetch records | `from_date=2026-07-01` **200** `HRM-ATT-200` |
| FE after | KPI attendance **0%** / ~0 lượt; công ngày=1357; charts empty-honest; trend T7 @ 0 |
| Idle GET / 5s | **0** |
| pageErrors / consoleErrors / 5xx | **0** |

## Aggregate honesty (AC4)

| Item | Fact |
|------|------|
| Dedicated reports API | **No** |
| Sources | `listAttendanceRecords` (range+pagination) + `listEmployees` (total) + `listLeaveRequests` (month filter client-side) |
| Hook | `apps/web/hrm/src/hooks/useAttendanceReports.ts` |
| Trend | Single-month point only (label UI «Xu hướng 12 tháng» vs 1 point — OBS) |
| Seat verdict | UI **LIVE** with honesty; OBS residual for BA (no dedicated API / UNMAPPED) — **not** PARTIAL invent |

## OBS (non-blocking)

| ID | Note | Owner |
|----|------|-------|
| `R-MFD-M2-ATT-REPORTS-NO-DEDICATED-API` | No Nest `/attendance/reports/*`; client RPT fan-in — documented | ba-process (OBS) |
| `OBS-MFD-M2-ATT-REPORTS-TREND-LABEL` | Chart title «Xu hướng 12 tháng» but data = 1 month point (CODE: no 12× fan-out) | dev-fe P2 polish |
| `OBS-MFD-M2-ATT-REPORTS-RATE-FORMULA` | Aug KPI «Tỷ lệ đi làm» ~0.32% (present/workDays) vs trend point 100% (present/records) — formula mismatch display | ba-process / dev-fe P2 |

## Forbidden honesty

- No seed · no API invent rows
- **uat_done=false** · Attendance **not** CLOSED
- Did **not** reopen REQUESTS / LEAVE / OT / CLOCK GWC
- Did **not** claim #30 export LIVE

## Matrix stamp (runtime)

| # | Was | Now (this seat) |
|---|-----|-----------------|
| 29 | LIVE (M1 runtime smoke, export not clicked) | **LIVE** — reconfirmed U65: load 2xx + month filter range change + idle0 + honesty |
| 30 | PARTIAL | **PARTIAL** — Xuất CTA visible; export dialog not exercised (P2) |

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-reports-01-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-reports-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/` |

### Key screens

| File | Shows |
|------|--------|
| `01-attendance-shell.png` | Attendance shell after login |
| `03-reports-loaded.png` | Báo cáo Tháng 8 · KPI 59 NV · 0.32% · charts · no ERROR |
| `04-reports-after-month-filter.png` | Tháng 7 · FE updated · 0% honest empty · Xuất CTA |

## completion_report

**Closed:** P1-4 matrix #29 Báo cáo — U65 browser as `ceo@xe.vn` / `main`. Nav HDSD tab Báo cáo; load fan-in GET 200 (`HRM-ATT-200` / `HRM-EMP-200` / `HRM-LEAVE-200`); idle GET 0; month filter Tháng 8→7 updates `from_date` + FE KPI/charts; client-aggregate honesty documented. Stamp **#29 LIVE**. L0 entry+exit PASS. No seed. `uat_done=false`. Attendance **not** CLOSED.

**Open / OBS only:** no dedicated reports API (OBS BA); trend label «12 tháng» vs 1 point; KPI vs trend rate formula mismatch (P2). #30 export remains PARTIAL P2.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-REPORTS-01-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true
hdsd_align: true
entry_criteria: QA PASS_TO_PM docs/qa/evidence/po-mfd-m2-att-reports-01-qa.md — #29 LIVE; month filter 8→7 from_date change; idle0; client aggregate honesty; L0 PASS
exit_criteria: Audit browser evidence vs AC; confirm matrix #29 LIVE / #30 PARTIAL; GO or GWC with OBS only (no dedicated reports API · trend label · rate formula); do NOT invent Attendance CLOSED; uat_done stays false; do NOT reopen REQUESTS/LEAVE/OT/CLOCK GWC without new FAIL
cấm: seed · invent ATT CLOSED · invent UAT DONE · reopen REQUESTS/LEAVE/OT/CLOCK
evidence_path: docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
