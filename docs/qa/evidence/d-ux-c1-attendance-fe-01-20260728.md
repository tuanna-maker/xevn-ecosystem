# D-UX-C1-ATTENDANCE-FE-01 — Attendance Clock-In wizard (IA slice)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-UX-C1-ATTENDANCE-FE-01` |
| **from_role** | pm (CURSOR-PM) |
| **to_role** | dev-fe |
| **date** | 2026-07-28 |
| **change_mode** | UPGRADE |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 · HOLD_DEPLOY · no x-bos-core |

## Spec / scope

- SoT: `docs/program/UX-UI-ERP-ANALYSIS.md` P0-a · `docs/qa/evidence/ux-ui-erp-screen-matrix-01.md` UX-01
- Peer plan: `docs/program/UX-UI-ERP-PEER-DIVISION-PLAN.md` C1 Attendance slice
- Goal: collapse `checkinout` / `qrcode` / `faceid` / `gps` into task-based **Chấm công / Clock-In** with in-page method selector; proxy click depth ≤2 for primary clock-in
- Out of scope: full 15-tab refactor · Profile · Payroll · formal tree test · seed · deploy

## What shipped

| Area | Change |
|------|--------|
| Menu IA | 4 technical submenu items → 1 `clock-in` («Chấm công vào/ra») + sheets/records/weekly/summary |
| Wizard | `data-testid="clock-in-wizard"` + `ClockInMethodSelector` (manual / QR / Face / GPS) |
| Widgets | Reused existing `CheckInOutWidget`, `QRCodeScanner`, `FaceIDScanner`, `GPSAttendance` — **no API contract change** |
| Nav | Primary click on tab **Chấm công** opens Clock-In (1 click); chevron keeps secondary items |
| Overview CTA | `data-testid="overview-clock-in-cta"` «Chấm công ngay» → wizard (1 click) |
| Helpers | `apps/web/hrm/src/lib/clockInMethods.ts` (+ vitest) |
| i18n | vi + en keys for clock-in title/methods/CTA |

### Files touched

- `apps/web/hrm/src/pages/Attendance.tsx` (CODE-MEMORY APPEND)
- `apps/web/hrm/src/components/attendance/ClockInMethodSelector.tsx` (ADD)
- `apps/web/hrm/src/lib/clockInMethods.ts` + `.test.ts` (ADD)
- `apps/web/hrm/src/i18n/locales/vi.json` · `en.json`

## Proxy click path (≤2) — Clock-In

### Path A — from Attendance landing (Tổng quan) — primary manual

| Step | Click | Result |
|-----:|-------|--------|
| 0 | Land `/hr/attendance` (overview) | Overview visible |
| 1 | **Chấm công ngay** (`overview-clock-in-cta`) **or** tab **Chấm công** (`attendance-tab-clock-in`) | Clock-In wizard; method **Thủ công** selected; `CheckInOutWidget` ready |

**Depth = 1** for primary manual clock-in.

### Path B — QR / Face / GPS from landing

| Step | Click | Result |
|-----:|-------|--------|
| 1 | Tab **Chấm công** (or CTA) | Wizard open |
| 2 | Method card `clock-in-method-qrcode` / `faceid` / `gps` | Matching panel ready |

**Depth = 2**.

### Path C — via dropdown (still ≤2 for hub)

| Step | Click | Result |
|-----:|-------|--------|
| 1 | Chevron `attendance-tab-menu` | Menu |
| 2 | **Chấm công vào/ra** | Wizard (manual ready) |

## QA selectors

- `overview-clock-in-cta`
- `attendance-tab-clock-in`
- `attendance-tab-menu`
- `clock-in-wizard`
- `clock-in-method-selector`
- `clock-in-method-manual` | `qrcode` | `faceid` | `gps`
- `clock-in-panel-manual` | `qrcode` | `faceid` | `gps`

## Verify (dev)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/clockInMethods.test.ts src/pages/Attendance.smoke.test.ts
```

| Suite | Result |
|-------|--------|
| `clockInMethods.test.ts` | 3 PASS |
| `Attendance.smoke.test.ts` | 1 PASS |

## Residual

- Full Attendance/Payroll IA + Profile groups → wave **C2** (sibling)
- Formal tree test protocol → Claude BA `BA-UX-C1-PROXY-01`
- Payroll null-guard → sibling `D-UX-C1-PAYROLL-FE-01` (Cursor)
- Other locale JSON (zh/my/lo/km) fall back via `t(key, fallback)` — optional i18n fill later

## completion_report

Closed: C1 Attendance Clock-In IA slice — method selector wizard, ≤2 click proxy paths documented, widgets/API preserved, vitest + smoke PASS.

Open: browser U65 QA proxy (`QA-UX-C1-01`) after payroll sibling READY.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: QA-UX-C1-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-C1-ATTENDANCE-FE-01 READY_FOR_QA + D-UX-C1-PAYROLL-FE-01 READY_FOR_QA (both Cursor FE)
read_first: docs/qa/evidence/d-ux-c1-attendance-fe-01-20260728.md · docs/qa/evidence/d-ux-c1-payroll-fe-01-20260728.md · BA proxy protocol if present (ba-ux-c1-proxy-01)
scope: Browser U65 FE-only — no seed
  1) Attendance Clock-In proxy: Path A depth≤1 (manual), Path B depth≤2 (QR/Face/GPS); assert selectors clock-in-wizard + method panels; Network/widget still loads (no API rewrite)
  2) Payroll floatingUiState null-guard — no crash on tax-settlement floating UI
exit_criteria: evidence docs/qa/evidence/qa-ux-c1-01-20260728.md · matrix note UX-01/P0-a proxy · ack_status PASS_TO_PM or FAIL with residual
locks: U65 · HOLD_DEPLOY
```

## ack_status

READY_FOR_QA
