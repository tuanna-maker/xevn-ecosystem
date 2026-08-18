# Evidence — PO-MFD-M2-ATT-OVERVIEW-01-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-OVERVIEW-01-QA` |
| **from_role** | qa |
| **to_role** | pm / qc |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **hdsd_align** | CC → HRM → Chấm công → **Tổng quan** · lọc năm (Năm nay / Năm trước) · honesty «theo năm» |
| **spec_ref** | matrix C1 · `po-mfd-m2-att-overview-01-fe.md` · Nest `AttendanceOverviewQueryDto` `year` only |
| **fe_handoff** | `docs/qa/evidence/po-mfd-m2-att-overview-01-fe.md` READY_FOR_QA |
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
| Seed / API invent | **None** (U65) — browser read-only |

## Persona / portal_url

| Role | Account | Password | JWT OU | URL |
|------|---------|----------|--------|-----|
| Group CEO | `ceo@xe.vn` | `Xevn@2026` | `main` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |

## HDSD inventory (U76)

| # | Surface | HDSD / matrix label | Present |
|---|---------|---------------------|---------|
| — | Shell | Chấm công embed | 🟢 |
| — | Tab | **Tổng quan** | 🟢 |
| C1 | Year filter | Select Năm nay / Năm trước + honesty «theo năm» | 🟢 |
| — | Tabs spot | Chấm công / Nghỉ phép / Báo cáo / Thiết lập | 🟢 |
| — | must_keep | RECORDS list · SETTINGS→Nhân viên | 🟢 |

SoT: fidelity matrix C1 + FE honesty label (no dedicated HDSD CH «Overview year» client HTML).

## Click path

1. Login portal `ceo@xe.vn` → inject token → open `/hr/attendance?portal=1&companyId=main`
2. Tab **Tổng quan** (default) — assert honesty `overview-year-filter-honesty` + year Select
3. Open year Select — only **Năm nay (2026)** / **Năm trước (2025)** (no day/week/month)
4. Network: `GET …/attendance/overview?company_id=main&year=2026` → **200** `HRM-ATT-OVERVIEW-200`
5. Choose **Năm trước** → `GET …&year=2025` → **200**; UI «Đang xem năm 2025»; idle GET **0**
6. Spot must_keep: **Chấm công → Bản ghi** → records GET **200**; **Thiết lập → Nhân viên** opens (table/CTA; no mutate)
7. Screenshots under `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/`

## AC results

| AC | Result | Evidence |
|----|--------|----------|
| 1 L0 entry+exit | **PASS** | qc:fe-be-health ALL PASS |
| 2 Login + Overview | **PASS** | ceo@xe.vn / main · tab Tổng quan |
| 3 Year honesty; no day/week/month Select | **PASS** | honesty text + opts=`Năm nay (2026)`,`Năm trước (2025)` |
| 4 this-year GET `year=2026` 200 | **PASS** | `HRM-ATT-OVERVIEW-200`; error UI=false; idle0 |
| 5 last-year refetch `year=2025` | **PASS** | 200 + loaded year label 2025; idle0 |
| 6 loading/error/idle; no ERROR storm | **PASS** | pageErrors=0; networkBad=0; no Sync ERROR |
| 7 must_keep RECORDS + SETTINGS-EMP | **PASS** | records 200×2; settings Nhân viên table/CTA; mutate=0 |
| 8 NOT invent Attendance CLOSED / uat_done / Face LIVE | **PASS** | flags false |
| 9 PERIOD-SPEC_GAP OBS | **PASS** (documented) | residual → ba-process non-blocking |

### Network (overview)

| API | Status | Code | Note |
|-----|--------|------|------|
| `GET …/attendance/overview?company_id=main&year=2026` | **200** | `HRM-ATT-OVERVIEW-200` | this-year |
| `GET …/attendance/overview?company_id=main&year=2025` | **200** | `HRM-ATT-OVERVIEW-200` | last-year refetch |
| Idle overview GET / 5s (load + after switch) | **0** | — | no storm |

### must_keep spot

| Surface | Result |
|---------|--------|
| RECORDS | `GET …/attendance/records` **200** `HRM-ATT-200` total=4 |
| SETTINGS-EMP | Thiết lập → Nhân viên UI LIVE (table + Lấy lại/Nhập khẩu CTAs); no mutate |

## OBS (non-blocking)

| ID | Note | Owner |
|----|------|-------|
| `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` | Nest no `period`/`from`/`to` — year grain LIVE + honesty OK; FR if product needs day/week/month | ba-process |
| `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` | Chart/list subtitles still use `new Date().getFullYear()` (`overviewYearSubtitle`) while Select/API year=2025 — label lag; API year wire OK. Align with P2 charts wave | dev-fe P2 |
| Card grain labels | KPI cards still show «Hôm nay / Tuần này / Tuần sau» as **field grains** from overview payload (not the removed fake year Select) | — documented honesty |

## Forbidden honesty

- No seed · no invent rows
- **uat_done=false** · Attendance **not** CLOSED
- Did **not** invent Face LIVE / Attendance module CLOSED
- Did **not** reopen CLOSED GWC tabs without new FAIL

## Artifacts

| Kind | Path |
|------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-overview-01-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-overview-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/` |
| FE handoff | `docs/qa/evidence/po-mfd-m2-att-overview-01-fe.md` |

## completion_report

**Closed:** P1 Overview year filter wire — U65 browser `ceo@xe.vn` / `main`. Year Select honesty (no day/week/month); GET overview `year=2026` + `year=2025` both **200** `HRM-ATT-OVERVIEW-200`; idle0; must_keep RECORDS + SETTINGS-EMP spot OK. L0 entry+exit PASS. No seed. `uat_done=false`. Attendance **not** CLOSED.

**Residual:** `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` OBS → ba-process; `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` → dev-fe P2 (non-blocking).

## next_owner

**qc**

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-OVERVIEW-01-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true

entry_criteria:
  - QA PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-overview-01-qa.md
  - browser JSON: docs/qa/evidence/_tmp-po-mfd-m2-att-overview-01-browser.json
  - FE: docs/qa/evidence/po-mfd-m2-att-overview-01-fe.md

audit:
  1. Confirm year Select honesty + GET year=2026/2025 200 (not invent)
  2. Confirm uat_done=false · Attendance NOT CLOSED
  3. must_keep RECORDS/SETTINGS-EMP spot not regressed
  4. PERIOD-SPEC_GAP + chart-subtitle OBS remain OBS (non-blocking) — do not reopen CLOSED GWC tabs
  5. L0 cited entry+exit PASS

exit_criteria:
  - evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md
  - GO / GO WITH CONDITIONS / NO-GO
  - ack_status PASS_TO_PM
```
