# Evidence — PO-ECO-TC-HRM-ATTENDANCE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-ATTENDANCE-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-attendance-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-ATTENDANCE.md` |

## Scope

World-standard **catalog** TC depth cho menu **HRM Chấm công** (`/attendance`): dashboard widgets, bản ghi, **bảng chấm công / sheets** (UF-HRM-16 · J-HRM-06b), tab Nghỉ phép + Yêu cầu liên quan, toàn dialog/field/function. **Không** chạy UAT browser wave; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-05** (bản ghi) · **UF-HRM-16** (bảng chấm công) · UF-HRM-MENU-07 |
| Journey | **J-HRM-06** · **J-HRM-06b** |
| Program | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · U82/U83 · U65/U76/U78 |
| Spine catalog cross-ref | `PO_SPEC_TEST_CASE_CATALOG.md` TC-LV-* · TC-AT-* |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `apps/web/hrm/src/pages/Attendance.tsx` | Top tabs, sheets/weekly/shifts/settings shell, dialogs |
| 2 | `apps/web/hrm/src/components/attendance/*` | LeaveTab, records, request tabs, clock-in widgets |
| 3 | `apps/web/hrm/src/hooks/useAttendanceSheets.ts` · `useAttendanceRecords.ts` · `useLeaveRequests.ts` | API + RQ storm guards |
| 4 | `apps/api/hrm-api/src/attendance/attendance.controller.ts` | `attendance-sheets` · `records` · `leave-requests` codes |
| 5 | `docs/hrm/SRS.md` · `docs/hrm/TECHSPEC.md` §12.1/§14.4 | AC-ATT-SHEET-01..06 · FR-UC-H03 leave |
| 6 | Prior runtime (cite only) | `USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-16 · `PILOT_BUSINESS_FLOW_BA_TRACE.md` UC23-S* · spine `po-e2e-spine-02-web-qa-w1-r1.md` · `r-spine-web-approve-ux-01-qa.md` |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 41 `screen_id` (§1 pack) |
| Field dictionary | ☑ 87 `field_id` (§2 pack) |
| Function inventory | ☑ 58 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU/UX | ☑ 82 TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| Storm/reload AC (Tải lại) | ☑ FD/UX TC §4.6 · AC-ATT-SHEET-04/06 |
| LV-02 ladder HOLD T_L1 | ☑ TC marked **BLOCKED/SPEC_GAP** · UI still inventoried |
| U65 precond wording | ☑ «data từ FE» · cấm seed trong execution steps |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 58 | 58 | 0 |
| Mutate fn ≥1 FD | 26 | 26 | 0 |
| Required fields ≥1 FD/BD | 22 | 22 | 0 |
| Dialogs open/cancel/submit | 16 | 16 | 0 |
| Reload/storm surfaces | 4 | 4 | 0 |

## LV-02 / T_L1 policy (pack)

| Item | Catalog status | Pack TC |
|------|----------------|---------|
| Leave 2-step ladder (`T_L1`, `N` days) | **SPEC_GAP** — cấm invent | `TC-ATT-LV-BLK-001`..`003` **BLOCKED** |
| L2 approve after L1 only | HOLD until Sponsor/SA | UI steps inventoried; expected = BLOCKED |
| Spine TC-LV-03 | SPEC_GAP in master catalog | Cross-ref only |

## Residual / notes for synth

| Item | Note |
|------|------|
| Settings → rules tabs `tablet/proxy/auto/…` | Placeholder «Đang phát triển» — TC **STUB** |
| Requests → leave-summary / compensatory / leave-plan | Shell/placeholder trong page — inventory + STUB TC |
| Shifts → schedule / overtime subviews | Partial placeholder — STUB |
| Attendance → summary submenu | Placeholder grid — STUB |
| Member CEO scope | AU TC `du-lich.ceo@xe.vn` — không rollup tập đoàn |
| Dedupe vs spine | `TC-LV-05`..`09` EVIDENCED runtime — pack dùng prefix `TC-ATT-LV-*` |

## completion_report

- **Closed:** Full menu TC pack `HRM-ATTENDANCE.md` (inventory + 82 TC **PLANNED**); trace UF-HRM-05/16 · J-HRM-06/06b; storm/reload FD; ladder BLOCKED; HDSD testids leave attach/approve wired.
- **Open:** Không execution verdict; synth dedupe vs `PO_SPEC_TEST_CASE_CATALOG.md`; Wave A sibling packs chưa SYNTH.

## next_owner

`qa-synth` (dedupe + rollup `PO_SPEC_TEST_REPORT.md` § Ecosystem depth) → PM dispatch execution QA khi synth PASS.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-A-01
from_role: pm
to_role: qa
Mission: SYNTH Wave A menu packs — dedupe TC-ID vs PO_SPEC_TEST_CASE_CATALOG + spine; merge FK cross-menu (Leave approve ↔ CC Inbox UF-XBOS-08); update docs/qa/reports/PO_SPEC_TEST_REPORT.md § Ecosystem depth và docs/qa/testcases/README.md index.
read_first: docs/qa/testcases/hrm-web/HRM-ATTENDANCE.md · docs/qa/evidence/po-eco-tc-hrm-attendance-01.md · docs/qa/testcases/hrm-web/HRM-RECRUITMENT.md (when present) · docs/qa/PO_SPEC_TEST_CASE_CATALOG.md
exit_criteria: No duplicate TC-ID; roster status READY_FOR_SYNTH→SYNTHED; coverage rollup table; ack_status PASS_TO_PM
cấm: apps/** edits · seed · UAT DONE claim
```

## ack_status

**READY_FOR_SYNTH**
