# PO-MFD-M2-ATT-SHIFTS-02 — Schedule/OT menu honesty + useWorkShifts loop verify

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SHIFTS-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **change_mode** | FIX |
| **u65_zero_seed** | true |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **uat_done** | false |

## spec_read_ack

- backlog: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md` · P0-5 · surfaces 16–18 · G-MENU-STUB · row 17 PARTIAL
- prior QA hold: `docs/qa/evidence/po-mfd-m2-att-wire-balance-01-qa.md` (schedule/OT hold already 🟢; harden menu badge)
- GD2 roster: backlog GĐ2-HOLD `PO-MFD-M2-ATT-GD2-ROSTER-01` — P0 = no LIVE claim; full roster API out of M2
- loop SoT: `docs/qa/evidence/po-uc-tc-w4-fe-att-workshift-update-loop-01.md`

## Closed

1. **Schedule/OT submenu honesty**
   - Dropdown items `Lịch phân ca` / `Ca làm thêm`: Badge **GĐ2** (`data-testid=shifts-menu-{schedule\|overtime}-gd2`) + native `title` = hold copy.
   - Panel: `featureInDev` + GĐ2 badge + hold description; CTA → Danh sách ca.
   - **No** `shifts-table` mount when `activeShiftType` is `schedule` or `overtime`.
2. **`useWorkShifts` loop must_keep**
   - Confirmed: no unstable `h` helper; `fetchShifts` deps = `[currentCompanyId, toast, t]` only.
   - CODE-MEMORY APPEND on hook + Attendance.
3. **must_keep preserved**
   - Danh sách ca still LIVE (`shifts-table` only on `list`).
   - No roster API invented; leave-balance / CFG rules paths untouched.

## Files

| Path | Change |
|------|--------|
| `apps/web/hrm/src/pages/Attendance.tsx` | GĐ2 menu badges + hardened hold panel; CODE-MEMORY APPEND |
| `apps/web/hrm/src/hooks/useWorkShifts.ts` | CODE-MEMORY APPEND (re-verify loop fix) |
| `apps/web/hrm/src/i18n/locales/vi.json` | `attPage.gd2HoldBadge` = `GĐ2` |
| `apps/web/hrm/src/i18n/locales/en.json` | `attPage.gd2HoldBadge` = `P2` |

## Dev verify (static)

```text
rg "const h =" apps/web/hrm/src/hooks/useWorkShifts.ts → 0 matches
fetchShifts deps: [currentCompanyId, toast, t]
hold early-return before shifts-table for schedule|overtime
```

## QA browser (U65 — required)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`  
**URL:** `/hr/attendance?portal=1&tenantId=xevn&companyId=main`

| # | Step | Expected |
|---|------|----------|
| 1 | Tab **Ca** → **Danh sách ca** | `shifts-table` visible; GET work-shifts 2xx; **no** Maximum update depth; no fetch storm after idle |
| 2 | Open submenu → **Lịch phân ca** | Badge GĐ2 on menu item; panel `shifts-schedule-hold` + `shifts-gd2-hold-alert`; **no** `shifts-table` |
| 3 | Submenu → **Ca làm thêm** | Badge GĐ2; `shifts-overtime-hold`; **no** `shifts-table` |
| 4 | Hold CTA → Danh sách ca | Returns to LIVE list |

## Residual

| ID | Note |
|----|------|
| Full roster API | GĐ2 — `PO-MFD-M2-ATT-GD2-ROSTER-01` — out of this FIX |
| `uat_done` | false — fidelity program gate, not this seat |

## completion_report

- **Closed:** Menu honesty for schedule/OT (GĐ2 badge + honest hold panel); useWorkShifts loop fix re-verified; CODE-MEMORY APPEND.
- **Open:** Browser QA seat; full roster deferred GĐ2.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SHIFTS-02-QA
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true

entry_criteria: FE READY_FOR_QA · docs/qa/evidence/po-mfd-m2-att-shifts-02.md · L0 stack up
exit_criteria: Browser ceo@xe.vn /hr/attendance — (1) Danh sách ca LIVE shifts-table + no Maximum update depth / no work-shifts GET storm; (2) Lịch phân ca + Ca làm thêm show GĐ2 badge + hold alert (featureInDev), shifts-table ABSENT; (3) hold CTA returns to list. Evidence markdown + screenshot. ack_status PASS_TO_PM or FAIL with defect.
cấm: seed · invent roster API · claim UAT DONE
evidence_path: docs/qa/evidence/po-mfd-m2-att-shifts-02-qa.md
```
