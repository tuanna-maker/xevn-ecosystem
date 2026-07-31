# D-HDSD-BF-03-SOFTDEL-FE-01 — Soft-delete row-menu isolation

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-BF-03-SOFTDEL-FE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-SOFTDEL-01** |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **change_mode** | `FIX` |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | QA-HDSD-BF-03-MUTATE-DEFER-01 · TC-HRM-HDSD-025 · `qa-hdsd-bf-03-mutate-defer-01-20260801.md` |

## Root cause

`DataTable` `<tr onClick={onRowClick}>` received React-bubbled clicks from row overflow menu (Radix `DropdownMenuItem` portal still bubbles in React tree). Activating **Xóa** → `navigate(/employees/:id)` raced/won over `setDeleteConfirm` → AlertDialog «Xác nhận xóa nhân viên» never usable; no `POST …/archive`.

## Fix (preserve_default)

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/common/DataTable.tsx` | `isDataTableRowActionTarget` — skip `onRowClick` when target is `button` / `[role=menuitem]` / `[data-stop-row-click]` / inputs / … |
| `apps/web/hrm/src/pages/Employees.tsx` | Actions cell `stopPropagation` + `onPointerDown`; menu items use `onSelect` + `preventDefault`; `onCloseAutoFocus` prevent; CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/common/DataTable.test.ts` | 4 vitest cases |

**must_keep:** Plain row data-cell click still navigates profile · TC-041 HĐ delete · TC-06/07/08 YCTD spines untouched · no seed.

## spec_read_ack

- qa evidence: `docs/qa/evidence/qa-hdsd-bf-03-mutate-defer-01-20260801.md` · TC-025 hypothesis DataTable onRowClick
- code: `Employees.tsx` softDelete → `archiveEmployee` POST `/api/hrm/employees/{id}/archive`
- change_mode: FIX · forbidden: unrelated portal modules · seed

## Tests

```text
pnpm --filter vite_react_shadcn_ts exec vitest run src/components/common/DataTable.test.ts
→ 4/4 PASS
```

| Case | Result |
|------|--------|
| `isDataTableRowActionTarget` button/menuitem vs cell text | PASS |
| data cell → onRowClick fired | PASS |
| action button → onRowClick **not** fired | PASS |
| role=menuitem «Xóa» → onRowClick **not** fired | PASS |

## QA retest AC (U65 browser-only)

**work_item:** `QA-HDSD-BF-03-SOFTDEL-RET-01`

1. Login `ceo@xe.vn` → `/hr/employees`.
2. Create disposable NV (or use existing) → open row **⋯**.
3. Click **Xóa** → expect **AlertDialog** «Xác nhận xóa nhân viên» (URL stays list, **not** `/employees/{id}`).
4. Confirm → Network `POST /api/hrm/employees/{id}/archive` **2xx** · FE row gone / archived · F5.
5. Regression: click **name/code cell** (not ⋯) still opens profile.

## Residual

| ID | Note |
|----|------|
| R-MUTATE-BH-400-01 | Out of this FE slice (TC-049) |
| TC-06/07/08 | Not touched |

## Handoff

**completion_report:** Fixed DataTable row-action isolation + Employees menu `onSelect`/stopPropagation so soft-delete confirm path is reachable. Vitest 4/4. Ready for QA TC-025 retest.

**next_owner:** `qa`

**next_dispatch_prompt:**

```text
work_item_id: QA-HDSD-BF-03-SOFTDEL-RET-01
from_role: pm | to_role: qa
entry_criteria:
- D-HDSD-BF-03-SOFTDEL-FE-01 READY_FOR_QA
- evidence docs/qa/evidence/d-hdsd-bf-03-softdel-fe-01-20260801.md
- L0 portal+hrm up · U65 zero-seed
exit_criteria:
- TC-HRM-HDSD-025: ⋯ → Xóa → AlertDialog → POST …/archive 2xx → F5
- Plain row click still → profile
- must_keep TC-041 / TC-06/07/08 not re-broken
- evidence docs/qa/evidence/qa-hdsd-bf-03-softdel-ret-01-20260801.md
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/d-hdsd-bf-03-softdel-fe-01-20260801.md`

**ack_status:** **READY_FOR_QA**
