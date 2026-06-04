# P1-EX-FE-HTTPS-J-HRM-06-ATTENDANCE-BLANK-01 — Attendance embed route shell

| Field | Value |
|---|---|
| work_item_id | `P1-EX-FE-HTTPS-J-HRM-06-ATTENDANCE-BLANK-01` |
| from_role | `dev-fe` |
| to_role | `qa` |
| date | `2026-05-29` |
| entry QA fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md` (`attendance_route_blank`, `#root` empty while profile route mounts) |
| ack_status | **READY_FOR_QA** |

## Root cause

- `pages/Attendance.tsx` is a **~3.7k-line** module with heavy static imports (recharts, many tabs). Dynamic import in vitest took **~16s**; `App.tsx` wrapped the route in `Suspense` with **`fallback={null}`**, so on HTTPS pilot (Vite dev cold compile / large chunk) the iframe showed **`#root` with no visible UI** for extended periods even though `GET /api/hrm/attendance/records` returned **200**.
- Employee profile route uses a separate lazy chunk and mounted in QA R3; attendance never committed visible UI before QA timeout.

## Fix

1. **`AttendanceEntry.tsx`** — thin route shell (eager) with visible loading state (`data-testid="attendance-entry-loading"`), inner `lazy(() => import('./Attendance'))`, and preload via shared `attendanceWorkbenchImport` promise.
2. **`RouteErrorBoundary.tsx`** — catch chunk/render failures; show retry UI instead of blank root (`data-testid="route-error-boundary"`).
3. **`App.tsx`** — `/attendance` uses `AttendanceEntry` directly (no outer `withSuspense(null)` on the heavy page).
4. **`main.tsx`** — when pathname includes `attendance`, start preloading `./pages/Attendance` before `createRoot` render.

List → profile navigation (J-HRM-06) unchanged: `AttendanceRecordsTable` + overview late list use `hrmPathWithEmbedSearch('/employees/:id')`.

## Verification

```bash
pnpm --dir apps/web/hrm test -- src/pages/AttendanceEntry.test.ts src/pages/Attendance.smoke.test.ts src/lib/hrmDataMode.test.ts
pnpm --dir apps/web/hrm run build
```

| Check | Result |
|-------|--------|
| vitest | **16/16** PASS (incl. `AttendanceEntry` import &lt; 5s) |
| `vite build` | **PASS** — separate chunk `Attendance-*.js` retained |

## QA retest (J-HRM-06 + P-CC-07)

| Path | Expected |
|------|----------|
| `https://…/hr/attendance?portal=1&companyId=main` | `#root` &gt; 0; **HRM API Sync CONNECTED** (or CHECKING→CONNECTED); overview/records visible after load |
| `https://…/command-center/hrm/attendance?companyId=main` | iframe same; no `bodyLen=0` after 30s |
| J-HRM-06 L2.5 | Attendance **Dữ liệu chấm công** row click → profile (no not-found when API 200) |
| Network | `fallback54321=0`; `GET …/attendance/records?company_id=main` **200** |

## completion_report

- **Closed:** Attendance route blank-root on HTTPS pilot — thin entry shell + error boundary + preload; build/tests PASS.
- **Residual:** First cold load of `Attendance` chunk may still take several seconds on Vite dev — loading spinner should remain visible (not empty `#root`).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R4
from_role: dev-fe
to_role: qa
entry_criteria: docs/qa/evidence/p1-ex-fe-https-j-hrm-06-attendance-blank-01-20260529.md deployed on https://14-225-217-232.nip.io — AttendanceEntry + RouteErrorBoundary merged
exit_criteria: J-HRM-06 L2.5 PASS (attendance list/row → profile) + P-CC-07 UI CONNECTED on /hr/attendance and CC iframe; #root not empty after 30s; fallback54321=0
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r4-20260529.md
ack_status: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/p1-ex-fe-https-j-hrm-06-attendance-blank-01-20260529.md`
