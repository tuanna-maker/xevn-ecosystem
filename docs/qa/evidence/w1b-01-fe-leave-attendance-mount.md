# Evidence — W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT` |
| **defect** | `R-LEAVE-FE-ATTENDANCE-MOUNT` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **parent FAIL** | `docs/qa/evidence/w1b-01-qa-leave-live.md` |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · no `pnpm seed:*` · no leave BE rewrite |
| **change_mode** | FIX · preserve_default true |

## Problem

QA LIVE: L1 leave API PASS, browser UF A/B/C + **J-HRM-06** blocked:

```text
Failed to resolve import "@/components/attendance/LeaveOverviewRecentPanel"
from "src/pages/Attendance.tsx"
```

→ `#root` childCount=0 on `:5173` / `:8080/hr/attendance`.

## Fix (restore from git `43c479a`)

### Primary (dispatch)

| Path | Role |
|------|------|
| `apps/web/hrm/src/components/attendance/LeaveOverviewRecentPanel.tsx` | Overview F5 marker — recent leave reasons |

### Transitive (required for Attendance eager graph)

After primary restore, Vite still 500 on next missing eager imports:

| Missing import | Restored path(s) |
|----------------|------------------|
| `@/components/attendance/ClockInMethodSelector` | `ClockInMethodSelector.tsx` + `lib/clockInMethods.ts` (+ test) |
| `@/lib/shiftSelection` | `shiftSelection.ts` (+ test) |
| `@/hooks/useDebouncedValue` | `useDebouncedValue.ts` |
| `@/lib/leaveRequestDateWindow` | `leaveRequestDateWindow.ts` (+ test) — LeaveTab transitive |

CODE-MEMORY-CHANGE **APPEND** on restored production modules for `W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT`.

**Untouched:** `LeaveTab.tsx` create/list path · AUTH/EMP CLOSED residuals · leave BE · no seed.

## Verify

| Check | Result |
|-------|--------|
| vitest `clockInMethods` + `shiftSelection` + `leaveRequestDateWindow` | **9/9 PASS** |
| `GET :8080/hr/src/pages/Attendance.tsx` | **200** · no `Failed to resolve` |
| `GET :8080/hr/src/components/attendance/LeaveOverviewRecentPanel.tsx` | **200** |
| `GET :8080/hr/src/components/attendance/LeaveTab.tsx` | **200** |
| `GET :8080/hr/src/components/attendance/ClockInMethodSelector.tsx` | **200** |
| `GET :8080/hr/src/hooks/useDebouncedValue.ts` | **200** |
| `GET :8080/hr/src/lib/leaveRequestDateWindow.ts` | **200** |
| `GET :8080/hr/attendance` SPA shell | **200** |
| `GET :5173/hr/src/pages/Attendance.tsx` (portal proxy) | **200** · no resolve fail |
| Portal `:5173/` | **200** (stack up) |
| Seed | none |

## must_keep

- LeaveTab create/list path (file not rewritten)
- AUTH / EMP CLOSED residuals not reopened
- U65 zero-seed
- No leave BE rewrite

## Residual

- Browser Cases A/B/C + **J-HRM-06** + HDSD tab Nghỉ phép + F5 + U78 test_log = **QA** (`W1-B-01-QA-LEAVE-LIVE-R1`)
- No UF leave 🟢 claimed here (mount unblock only)
- `R-LEAVE-TYPE-LABEL-DEPTH` P2 / `R-LEAVE-WF-FULL` P2 — defer (prior LIVE)

## Handoff

- **next_owner:** qa
- **next_dispatch:** `W1-B-01-QA-LEAVE-LIVE-R1`
- **ack_status:** `READY_FOR_QA`
