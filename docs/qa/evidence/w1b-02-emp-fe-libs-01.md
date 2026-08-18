# Evidence — W1-B-02-EMP-FE-LIBS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-FE-LIBS-01` |
| **defect** | `D-HRM-LIB-MISSING-01` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **parent FAIL** | `docs/qa/evidence/w1b-02-emp-qa-ret2.md` |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · no `pnpm seed:*` · no EMP BE rewrite |

## Problem

QA browser RET2: Fleet resolve **CLOSED**, but Vite still failed:

- `@/lib/hrmDialogPortalA11y` from `dialog.tsx`
- `@/lib/embedWorkingContext` from `HrmOperatingUnitFilter.tsx`

→ `#root` childCount=0 on `:8080/hr/employees` and `:5173/hr/employees`.

## Fix (restore from stash — same pattern as Fleet)

Restored from stash commit `43c479afd56531654ee3d3100a9681f60ff7c4e0` (untracked capture 2026-07-31):

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/hrmDialogPortalA11y.ts` | Portal dialog a11y mirror for Radix TitleWarning |
| `apps/web/hrm/src/lib/hrmDialogPortalA11y.test.ts` | Unit coverage |
| `apps/web/hrm/src/lib/embedWorkingContext.ts` | Compact ĐVTV + role chip helpers |
| `apps/web/hrm/src/lib/embedWorkingContext.test.ts` | Unit coverage |
| `apps/web/hrm/src/lib/scopeRoleLabels.ts` | Transitive dep (`formatRoleCodeVi`) of embedWorkingContext |
| `apps/web/hrm/src/lib/scopeRoleLabels.test.ts` | Unit coverage |

Normalized double-spaced stash blob on `hrmDialogPortalA11y*` (logic unchanged). CODE-MEMORY-CHANGE **APPEND** on the three production libs for `W1-B-02-EMP-FE-LIBS-01`.

**Untouched:** Employees · EmployeeProfile · Fleet restore · App.tsx · EMP BE · no seed.

## Verify

| Check | Result |
|-------|--------|
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/hrmDialogPortalA11y.test.ts src/lib/embedWorkingContext.test.ts src/lib/scopeRoleLabels.test.ts` | **14/14 PASS** |
| `GET :8080/hr/src/lib/hrmDialogPortalA11y.ts` | **200** · no resolve error |
| `GET :8080/hr/src/lib/embedWorkingContext.ts` | **200** |
| `GET :8080/hr/src/lib/scopeRoleLabels.ts` | **200** |
| `GET :8080/hr/src/components/ui/dialog.tsx` | **200** |
| `GET :8080/hr/src/components/hrm/HrmOperatingUnitFilter.tsx` | **200** |
| `GET :8080/hr/src/App.tsx` | **200** |
| `GET :8080/hr/src/pages/Employees.tsx` | **200** · transform OK |
| `GET :8080/hr/employees` HTML | **200** · `#root` present · no Internal Server Error |
| `GET :5173/hr/src/lib/hrmDialogPortalA11y.ts` | **200** |
| `GET :5173/hr/src/lib/embedWorkingContext.ts` | **200** |
| `GET :5173/hr/src/pages/Employees.tsx` | **200** |
| `GET :5173/hr/employees?portal=1…` HTML | **200** · `#root` present · no resolve fail |

## must_keep

- Employees + EmployeeProfile + Fleet restore paths untouched
- Portal embed OU ≠ JWT mutate; no annotation strip restore
- U65 zero-seed
- Dialog a11y mirror API (`attachPortalDialogA11yMirror`) preserved

## Residual

- Browser J-HRM-02 + case_matrix A/B/C + F5 + hdsd_align = **QA** (`W1-B-02-EMP-QA-RET3`)
- No UF EMP 🟢 claimed here (FE boot unblock only)

## Handoff

- **next_owner:** qa
- **ack_status:** READY_FOR_QA
- **next_dispatch:** `W1-B-02-EMP-QA-RET3` (see `next_dispatch_prompt` in completion packet)
