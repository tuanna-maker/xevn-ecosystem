# PO-MFD-M2-ATT-SHIFTS-02-QA

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SHIFTS-02-QA` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Prior FE** | `docs/qa/evidence/po-mfd-m2-att-shifts-02.md` · READY_FOR_QA |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **hdsd_align** | Attendance → Ca (Ca làm việc submenu) |
| **U65** | zero-seed · browser-only · no roster invent |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-shifts-02-qa.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-shifts-02-qa-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` (honesty seat only — roster API remains GĐ2) |

## Click path (U65)

1. Login API → inject portal auth (`companyId=main`)
2. Goto `/hr/attendance?portal=1&…&companyId=main` → **hard reload**
3. Submenu **Ca làm việc** → **Danh sách ca** (`shifts-menu-list`)
4. Idle 5s — assert no work-shifts GET storm / no Maximum update depth
5. Submenu → **Lịch phân ca** — assert GĐ2 menu badge + hold panel; `shifts-table` absent
6. Submenu → **Ca làm thêm** — assert GĐ2 menu badge + hold panel; `shifts-table` absent
7. Hold CTA `shifts-hold-goto-list` → back to **Danh sách ca** (`shifts-table` visible)

## Exit criteria results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Danh sách ca LIVE: `shifts-table` · no Maximum update depth · no work-shifts GET storm | **PASS** — table visible; GET work-shifts **1×** HTTP **200** (`company_id=main`); idle 5s gets=**0**; `pageErrors=[]` |
| 2 | Lịch phân ca: GĐ2 badge + featureInDev hold · `shifts-table` ABSENT | **PASS** — menu `shifts-menu-schedule-gd2`=GĐ2; panel `shifts-schedule-hold` + `shifts-gd2-hold-alert`; badge GĐ2; table count=0 |
| 3 | Ca làm thêm: GĐ2 badge + hold · `shifts-table` ABSENT | **PASS** — menu `shifts-menu-overtime-gd2`=GĐ2; panel `shifts-overtime-hold` + alert; table count=0 |
| 4 | Hold CTA → Danh sách ca | **PASS** — CTA click → `shifts-table` back; hold panels gone |
| 5 | Evidence + screenshots | **PASS** (this file + 4 PNGs) |
| 6 | ack_status | **PASS_TO_PM** |
| 7 | uat_done | **false** — cấm invent roster LIVE / UAT DONE |

## Network / console (SoT)

| Check | Detail |
|-------|--------|
| GET `/api/hrm/attendance/work-shifts?company_id=main` | **200** ×1 on list open (no storm) |
| Maximum update depth | **Not observed** |
| pageErrors / consoleErrors | `[]` / `[]` |
| HTTP ≥500 HRM | none |

## Screenshots

- `screens/po-mfd-m2-att-shifts-02-qa/01-danh-sach-ca.png` — LIVE list shell + empty table (0 rows OK under U65)
- `screens/po-mfd-m2-att-shifts-02-qa/02-lich-phan-ca-hold.png` — featureInDev + GĐ2 + schedule hold; no table
- `screens/po-mfd-m2-att-shifts-02-qa/03-ca-lam-them-hold.png` — featureInDev + GĐ2 + OT hold; no table
- `screens/po-mfd-m2-att-shifts-02-qa/04-cta-back-to-list.png` — CTA returns to LIVE list

## Residuals (not this seat)

| id | Status | Note |
|----|--------|------|
| Full roster API `PO-MFD-M2-ATT-GD2-ROSTER-01` | Open GĐ2 | **Not** LIVE — hold is correct |
| `uat_done` / Attendance CLOSED | Forbidden | `uat_done=false` |
| Empty shifts list (0 rows) | OBS | LIVE surface + GET 200; density/seed out of seat (U65) |

## Handoff

- **completion_report:** Closed **PO-MFD-M2-ATT-SHIFTS-02-QA**. L0 PASS entry+exit; hard-reload browser U65 ceo@ main: Danh sách ca LIVE (`shifts-table`, GET work-shifts 1×200, no depth/storm); Lịch phân ca + Ca làm thêm show GĐ2 menu badge + featureInDev hold alert with `shifts-table` ABSENT; hold CTA returns to list. **uat_done false**. No roster API claimed LIVE.
- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-shifts-02-qa.md`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-SHIFTS-02-QC
from_role: pm
to_role: qc
lane: governance
priority: P0
u65_zero_seed: true

entry_criteria:
- QA PASS_TO_PM: docs/qa/evidence/po-mfd-m2-att-shifts-02-qa.md
- Machine JSON: docs/qa/evidence/_tmp-po-mfd-m2-att-shifts-02-qa-browser.json (verdict PASS)
- Screens: docs/qa/evidence/screens/po-mfd-m2-att-shifts-02-qa/01..04.png
- FE prior: docs/qa/evidence/po-mfd-m2-att-shifts-02.md

exit_criteria:
1. Audit C1–C4: list LIVE + schedule/OT GĐ2 hold + CTA back — PNG + Network SoT (work-shifts GET ≤1 storm-free)
2. Confirm shifts-table ABSENT on schedule/OT holds; present on list
3. GO / GO WITH CONDITIONS / NO-GO with residual wording
4. cấm: invent roster API LIVE · claim uat_done · claim Attendance CLOSED
5. evidence_path: docs/qa/evidence/po-mfd-m2-att-shifts-02-qc.md
ack_status: PASS_TO_PM
```
