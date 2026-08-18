# D-FE-CONSOLE-A11Y-DIALOG-RR-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-CONSOLE-A11Y-DIALOG-RR-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no ScopeBar remount |
| **date** | 2026-07-20 |
| **spec_ref** | Radix Dialog a11y · [reactrouter.com v6 future flags](https://reactrouter.com/v6/upgrading/future) |

---

## Sponsor symptoms → root cause

| Console warn | Root cause | Fix |
|--------------|------------|-----|
| `v7_startTransition` Future Flag | HRM `BrowserRouter` only had `v7_relativeSplatPath` (portal already opted in) | Enable both v7 flags on HRM; keep `flushSync` soft-nav |
| `DialogContent` requires `DialogTitle` | Parent-portal Title ids + `CommandDialog` without Title | Keep Presence-safe iframe a11y mirror; add sr-only Title on CommandDialog; AlertDialog mirror |
| Missing `Description` / `aria-describedby={undefined}` | ~49 Title-only dialogs (Leave, JobPostings, …) left Radix default `aria-describedby` pointing at missing node | Default `aria-describedby={undefined}` on shared `DialogContent` |

Grep: only `command.tsx` lacked `DialogTitle` among HRM `DialogContent` files. web-portal has no Radix `DialogContent` (ConfirmDialog already sets `aria-describedby`).

---

## Files fixed

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/ui/dialog.tsx` | Default `aria-describedby={undefined}`; keep portal a11y mirror callback-ref |
| `apps/web/hrm/src/components/ui/alert-dialog.tsx` | Portal a11y mirror (same Presence-safe pattern as Dialog) |
| `apps/web/hrm/src/components/ui/command.tsx` | `DialogTitle className="sr-only"` |
| `apps/web/hrm/src/App.tsx` | `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` |
| `apps/web/hrm/src/lib/portalEmbedSoftNavigate.ts` | Comment: flushSync remains must_keep with v7 flag on |
| `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx` | Comment sync |
| `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.test.ts` | MemoryRouter `future` flags (no RR warn in unit) |
| `apps/web/hrm/src/components/ui/dialogA11yPrimitive.test.ts` | **NEW** source/contract asserts |

**Not touched:** ScopeBar / operating-unit filter chrome · business dialog copy · seed

**Already OK:** `apps/web/web-portal/src/App.tsx` RR future flags

---

## Unit evidence

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/ui/dialogA11yPrimitive.test.ts \
  src/components/employee/employeeSalaryDialogA11y.test.ts \
  src/lib/hrmDialogPortalA11y.test.ts \
  src/lib/portalEmbedSoftNavigate.test.ts \
  src/components/layout/PortalEmbedRouterSync.test.ts
```

**Result:** 5 files · **20 tests PASS** · no RR Future Flag stderr

---

## QA spot (browser — U65)

1. Portal embed HRM Dashboard (`ceo@xe.vn`) — console: **no** `v7_startTransition` / `v7_relativeSplatPath` Future Flag Warning.
2. Open **Thêm phụ cấp** (Employee salary) — no DialogTitle / Missing Description warns.
3. Open leave create dialog + one recruitment dialog (e.g. job requisition / posting) — same.
4. Soft-nav Attendance → Employees / Recruitment — Outlet swaps without F5 (flushSync must_keep).

---

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: qa
- `completion_report`: Central Dialog a11y + RR v7 flags; AlertDialog portal mirror; CommandDialog title; soft-nav flushSync preserved.
- Residual: none for these 3 warn classes; if Title warn returns on a specific dialog, check that surface still renders `DialogTitle` (only Command was missing).
