# Evidence — PO-MFD-M2-ATT-WEEKLY-01-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-WEEKLY-01` |
| **from_role** | qa |
| **to_role** | pm / qc |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **hdsd_align** | CC → HRM → Chấm công → ▼ → **Chấm công tuần** (#14) · **Tổng hợp công** (#15) · sheet name → weekly grid |
| **spec_ref** | fidelity matrix C2 #14–15 · `HRM-ATTENDANCE_ENTERPRISE_API_MAP` C2 · `useWeeklyAttendanceSummary` → GET `/attendance/records` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** |
| **attendance_closed** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |
| **must_keep** | SETTINGS-EMP #31 · RECORDS/REQUESTS/REPORTS/CLOCK/LEAVE/OT GWC — **not reopened** |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **PASS** |
| `pnpm run qc:fe-be-health` (exit) | **PASS** |
| Seed / invent mutate | **None** (U65) — browser read-only |

## Persona / portal_url

| Role | Account | Password | JWT OU | URL |
|------|---------|----------|--------|-----|
| Group CEO | `ceo@xe.vn` | `Xevn@2026` | `main` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |

## HDSD inventory (U76)

| # | Surface | HDSD / matrix label | FE label | Present |
|---|---------|---------------------|----------|---------|
| 14 | Weekly grid | Chấm công tuần | Chấm công tuần | 🟢 |
| 14b | Sheet → weekly | Bảng chấm công → mở tên bảng | QA-SHEET-MFD-M2… weekly shell | 🟢 |
| 15 | Summary | Tổng hợp | Tổng hợp công | 🟢 |
| — | must_keep | RECORDS/REQUESTS/REPORTS/CLOCK/LEAVE/OT/SETTINGS-EMP | not exercised / not reopened | 🟢 |

## Click path

1. Login portal `ceo@xe.vn` → inject token → open `/hr/attendance?portal=1&companyId=main` → hard reload
2. **Chấm công ▼** → **Chấm công tuần** — weekly shell (current week 03–09/08/2026) · empty honesty «Không có dữ liệu»
3. Idle 10s — records GET storm **0**
4. **Chấm công ▼** → **Bảng chấm công** → click sheet name `QA-SHEET-MFD-M2 01/07/2026-31/07/2026`
5. Weekly grid with sheet title · week footer `(30/06/2026 - 06/07/2026)` · empty honesty · GET records `from_date=2026-06-30&to_date=2026-07-06` **200** `HRM-ATT-200` rowCount=0
6. **Chấm công ▼** → **Tổng hợp công** — records table (viewMode=data) · GET records **200** `HRM-ATT-200` (today grain) · idle0
7. Screens: `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/`

## AC results

| AC | Result | Evidence |
|----|--------|----------|
| 1 L0 entry+exit | **PASS** | qc:fe-be-health ALL PASS |
| 2 Login ceo@ · main | **PASS** | token + companyId=main |
| 3 HDSD Weekly / Tổng hợp #14–15 | **PASS** | menuitems present; click path above |
| 4 Load GET 200 or honest empty; no ERROR; idle settle; no storm | **PASS** | see Network |
| 5 Matrix honesty LIVE/PARTIAL/BROKEN + Network | **PASS** | #14 LIVE · #15 LIVE (wire) + product note |
| 6 portal_url + click path + screens | **PASS** | this file + screens/ |
| 7 NOT invent Attendance CLOSED / uat_done | **PASS** | flags false |
| must_keep GWC tabs | **PASS** | not reopened |

### Network (SoT)

| Surface | API | Status | Code | Note |
|---------|-----|--------|------|------|
| #14 weekly default | `GET …/attendance/records?company_id=main&from_date=2026-08-03&to_date=2026-08-09` | **200** | `HRM-ATT-200` | rowCount=4 API · UI grid empty honesty (aggregate) |
| #14 idle 10s | records GET | **0** | — | no storm |
| #14 sheet→weekly | `GET …/attendance/records?…&from_date=2026-06-30&to_date=2026-07-06` | **200** | `HRM-ATT-200` | rowCount=**0** · honest empty · sheet week window |
| #14 sheet idle 8s | records GET | **0** | — | no storm |
| #15 summary | `GET …/attendance/records?…&from_date=2026-08-04&to_date=2026-08-04` | **200** | `HRM-ATT-200` | rowCount=4 · same records surface |
| #15 idle 10s | records GET | **0** | — | no storm |
| pageErrors / HTTP ≥500 | — | none | — | |
| Mutate | — | **0** | — | U65 read-only |

### Surfaces stamp

| # | Surface | runtime | Proof |
|---|---------|---------|-------|
| 14 | Chấm công tuần (menu) | **LIVE** | GET 200 HRM-ATT-200 · no Sync ERROR · storm0 · empty grid OK |
| 14b | Sheet name → weekly context | **LIVE** | left sheets list · title QA-SHEET-MFD-M2 · week 30/06–06/07 · GET 200 empty honesty |
| 15 | Tổng hợp công | **LIVE** | menuitem → viewMode=data · GET records 200 · storm0 · **no dedicated summary API** (API_MAP) |

## OBS (non-blocking)

| ID | Note | Owner |
|----|------|-------|
| `OBS-MFD-M2-ATT-WEEKLY-SHEET-RANGE` | Sheet July opens first week window `2026-06-30..2026-07-06` (not full month) — expected `resolveWeeklyDateRange(sheet)`; UI footer matches Network | — documented |
| `OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS` | #15 label «Tổng hợp công» = same `attendanceViewMode=data` + GET records as #13 — no payroll aggregate API (ENTERPRISE_API_MAP) · product PARTIAL semantics, wire LIVE | ba P2 / backlog P2 leave-summary sibling |

## Forbidden honesty

- No seed · no invent rows / mutate
- **uat_done=false** · Attendance **not** CLOSED
- Did **not** reopen SETTINGS-EMP / REPORTS / REQUESTS / LEAVE / OT / CLOCK GWC

## Machine / screens

| Artifact | Path |
|----------|------|
| Probe | `scripts/qa/_tmp-po-mfd-m2-att-weekly-01.mjs` |
| JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-weekly-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/01-weekly-default.png` · `02-sheets-for-context.png` · `03-weekly-sheet-context.png` · `04-summary.png` · `05-final.png` |

## Handoff

- **completion_report:** Closed **PO-MFD-M2-ATT-WEEKLY-01** browser fidelity. L0 PASS entry+exit. #14 LIVE (menu week GET 200 + sheet→weekly LIVE empty honesty GET 200 rowCount=0 · storm0). #15 LIVE wire (summary→records GET 200 storm0) + OBS same-as-records product. Residuals OBS only P2. **uat_done false**. must_keep GWC not reopened. **NOT** Attendance CLOSED.
- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-weekly-01-qa.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-WEEKLY-01-QC
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true
hdsd_align: true

entry_criteria:
- QA PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-weekly-01-qa.md
- Machine JSON: docs/qa/evidence/_tmp-po-mfd-m2-att-weekly-01-browser.json
- Screens: docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/01..05.png
- Network: GET records 200 HRM-ATT-200 · week 2026-08-03..09 · sheet week 2026-06-30..07-06 empty · summary today grain
- must_keep: SETTINGS-EMP #31 · RECORDS/REQUESTS/REPORTS/CLOCK/LEAVE/OT — do NOT reopen without new FAIL

exit_criteria:
1. Audit #14 LIVE menu+sheet context; #15 LIVE wire + OBS same-as-records; storm0; no ERROR banner
2. GO / GO WITH CONDITIONS / NO-GO — do not invent Attendance CLOSED / uat_done
3. evidence: docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md
4. ack_status PASS_TO_PM

cấm: seed · invent Attendance CLOSED · reopen SETTINGS/REPORTS/REQUESTS/LEAVE/OT/CLOCK GWC
```
