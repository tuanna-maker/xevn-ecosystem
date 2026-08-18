# D-HRM-EMP-PROFILE-BTN-NEST-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-PROFILE-BTN-NEST-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD |
| **date** | 2026-07-20 |
| **spec_ref** | React DOM nesting · hello-pangea DnD drag handle · UF employee profile tabs |

---

## Sponsor symptom → root cause

| Console warn | Root cause | Fix |
|--------------|------------|-----|
| `validateDOMNesting(...): <button> cannot appear as a descendant of <button>` at `Button → Draggable → EmployeeProfile.tsx` | Pinned tab chrome: shadcn `Button` (`<button>`) wrapped an unpin native `<button>` (X). Drag handle was already a non-button but sat inside the same Button. | Unpin → `<span role="button" tabIndex={0}>` + keyboard; drag handle → `<div {...dragHandleProps}>` with `stopPropagation` on click |

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/EmployeeProfile.tsx` | Pinned Draggable tab: no nested native button; drag handle div; unpin span+role |
| `apps/web/hrm/src/pages/employeeProfileBtnNest.test.ts` | **NEW** source contract + carry-check Dialog/RR |

**Not touched:** tab business logic · pin order persistence · seed · ScopeBar

---

## Carry-check: D-FE-CONSOLE-A11Y-DIALOG-RR-01

Already complete (verified in source + vitest):

| Item | Status |
|------|--------|
| HRM `BrowserRouter` `v7_startTransition` + `v7_relativeSplatPath` | ✅ `App.tsx` |
| `DialogContent` default `aria-describedby={undefined}` | ✅ `dialog.tsx` |
| Evidence | `docs/qa/evidence/d-fe-console-a11y-dialog-rr-01-fe-20260720.md` |
| Regression | `dialogA11yPrimitive.test.ts` **5 PASS** |

No further code for that work item.

---

## Unit evidence

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/pages/employeeProfileBtnNest.test.ts \
  src/components/ui/dialogA11yPrimitive.test.ts
```

**Result:** 2 files · **8 tests PASS**

---

## QA spot (browser — U65, no seed)

1. Login portal → HRM → Employees → open any employee profile (`/employees/:id`).
2. Pin ≥2 tabs (via More) so DnD strip appears.
3. Open DevTools Console — **no** `validateDOMNesting` button-in-button warn while viewing/dragging pinned tabs.
4. Click tab label → switches active tab; grip drag reorders; X unpin works (keyboard Enter/Space on X too).
5. Soft regression: open one employee dialog (e.g. salary add) — no DialogTitle / Missing Description / RR Future Flag warns (carry from D-FE-CONSOLE-A11Y-DIALOG-RR-01).

---

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: qa
- `completion_report`: Nested button in EmployeeProfile pinned DnD tabs removed; Dialog/RR a11y carry already closed.
- `next_dispatch_prompt`: see below
- Residual: none for this warn class

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-EMP-PROFILE-BTN-NEST-01
from_role: pm
to_role: qa
entry_criteria: FE READY_FOR_QA; evidence docs/qa/evidence/d-hrm-emp-profile-btn-nest-01-fe-20260720.md; U65 zero-seed
exit_criteria: Browser employee profile pinned tabs — no validateDOMNesting button-in-button; pin/unpin/drag still work; optional spot no RR/Dialog a11y warns
cấm: seed · Phase1/PROD
J-*: employee list → profile (J-HRM employee profile path)
```
