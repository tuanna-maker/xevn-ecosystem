# PO-HRM-REC-PLAN-CONSOLE-FE-01 — Plan console FIX (dev-fe)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-REC-PLAN-CONSOLE-FE-01` |
| **role** | dev-fe |
| **change_mode** | FIX |
| **date** | 2026-08-06 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · browser probe mutates=0 |
| **must_keep** | plan mutate APIs · định biên SoT · no rewrite compare/candidate (BA owns) · no remaster_done · no jd_dynamic_done |

## Spec / scope

- Surface: `/command-center/hrm/recruitment?tab=plans` → list → plan detail (TMDV-PLAN-*)
- Seat: **stop console crash/warnings on plan path only**
- BA E2E linkage (position SELECT / compare) = parallel — **out of scope**

## Before (sponsor log + live probe)

### Sponsor console (`docs/qa/evidence/sponsor-console-20260806-recruitment.log`)

Mixed session (JD designer + recruitment shell). Plan-relevant **Uncaught** messages (not only stack):

| Message | Count (class) | Stack through |
|---------|---------------|---------------|
| `Uncaught ReferenceError: getDialogPortalContainer is not defined` | **11** | `DialogContent` → CandidateForm/Import/Hire/Comparison → `Recruitment` → AppLayout / ProtectedRoute / HrmOperatingUnitFilterProvider |
| `Uncaught ReferenceError: LayoutDashboard is not defined` | **3** | `CommandCenterPage` (parent shell HMR) |
| `@hello-pangea/dnd` drag-handle invariant | **hundreds** | JD canvas (out of this seat — HEADER-JD-DND wave) |

> Note: `getDialogPortalContainer` / `LayoutDashboard` were already closed by `PO-HRM-UI-HEADER-JD-DND-FE-01` (source lock). Live plan probe **before** this FIX already showed **0** for those classes.

### Live probe BEFORE key FIX (plan list + open detail)

Probe: `scripts/qa/_tmp-po-hrm-rec-plan-console-fe-01.mjs`  
Artifact: `docs/qa/evidence/_tmp-po-hrm-rec-plan-console-fe-01.json` (overwritten by after-run; counts captured below)

| Metric | Before |
|--------|--------|
| `pageErrors` (Uncaught) | **0** |
| `consoleErrors` | **1** |
| `consoleWarnings` | **0** |
| `getDialogPortalContainer` | **0** |
| `LayoutDashboard` | **0** |
| `dragHandle` | **0** |
| `uniqueKey` | **1** |
| `ReferenceError` / `TypeError` | **0** |

**Actual warning text:**

```text
Warning: Each child in a list should have a unique "key" prop.
Check the render method of `Recruitment`.
```

Root cause: plan create dialog `planDepartments.map` and plan detail `departments.map` used `<>…</>` without `key`. Create-dialog children expressions still evaluate on list render (JSX children of closed Dialog) → console red on plan surface.

## Fix (minimal)

File: `apps/web/hrm/src/pages/Recruitment.tsx`

1. Import `Fragment`.
2. Create-plan table: `<Fragment key={dept.id}>` instead of unkeyed `<>`.
3. Plan detail table: `<Fragment key={dept.id \|\| …}>` instead of unkeyed `<>`.
4. Defensive creator display: `(plan.creator \|\| '?').charAt(0)`.
5. `@CODE-MEMORY-CHANGE` APPEND for this work item.

**Not touched:** plan mutate API clients · định biên SoT · CandidateComparison / position SELECT UX · JD DnD · remaster.

## After (live probe)

Same probe, plan open + detail click:

| Metric | After |
|--------|-------|
| `pageErrors` (Uncaught) | **0** |
| `consoleErrors` | **0** |
| `consoleWarnings` | **0** |
| `getDialogPortalContainer` | **0** |
| `LayoutDashboard` | **0** |
| `dragHandle` | **0** |
| `uniqueKey` | **0** |
| `ReferenceError` / `TypeError` | **0** |
| `openedDetail` | **true** |

## Residual

| Item | Owner |
|------|-------|
| BA E2E linkage — UV position SELECT / compare empty | `PO-HRM-REC-E2E-LINKAGE-SPEC-01` (ba-process) — not this seat |
| JD DnD storm if user opens JD designer | closed by HEADER-JD-DND; out of plan path |

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-PLAN-CONSOLE-QA-01
role: qa
entry: L0 portal :5173 + hrm-api; U65 zero-seed; FE READY_FOR_QA evidence docs/qa/evidence/po-hrm-rec-plan-console-fe-01.md
steps:
  1. Login ceo@xe.vn → /command-center/hrm/recruitment?tab=plans
  2. Open plan list; open a plan detail (TMDV-PLAN-* if present)
  3. Console: assert pageErrors=0 · zero Uncaught · zero unique-key warning on that path
  4. Do NOT invent position SELECT / compare assertions (BA wave)
exit: PASS_TO_PM with before/after console class counts; fail if any Uncaught on plan path
evidence: docs/qa/evidence/po-hrm-rec-plan-console-qa-01.md
```

## completion_report

- Closed: plan-surface React unique-key console error (create + detail dept maps).
- Verified live: Uncaught=0, consoleErrors=0 after FIX.
- Residual: BA linkage UX out of scope.
