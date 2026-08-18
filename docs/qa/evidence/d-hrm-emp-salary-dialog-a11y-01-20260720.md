# D-HRM-EMP-SALARY-DIALOG-A11Y-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-DIALOG-A11Y-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no reopen Invalid time |
| **date** | 2026-07-20 |
| **QA residual** | R1 from `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qa-20260720.md` |

---

## Root cause

Radix `@radix-ui/react-dialog` `TitleWarning` / `DescriptionWarning` call **`document.getElementById`** on the **iframe** document.

HRM embed (`?portal=1`) portals `DialogContent` to **`window.parent.document.body`**, so the real `DialogTitle` / `DialogDescription` nodes live in the **parent** document. Title was visibly correct (`h2` «Thêm phụ cấp mới») but iframe lookup failed → false-positive console error.

Separately, add/edit allowance dialogs had **DialogTitle only** — no `DialogDescription` → Description / `aria-describedby` warn.

---

## Fix

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmDialogPortalA11y.ts` | `mirrorPortalDialogA11yIdsForRadixWarnings` — mirror `aria-labelledby` / `aria-describedby` ids into iframe doc |
| `apps/web/hrm/src/components/ui/dialog.tsx` | `useLayoutEffect` (before Radix `useEffect` warnings) when parent-portal |
| `apps/web/hrm/src/components/employee/EmployeeSalary.tsx` | `DialogDescription` (sr-only) on add + edit allowance |
| `vi.json` / `en.json` | `salary.addAllowanceA11yDesc` / `editAllowanceA11yDesc` |

**must_keep:** UF-HRM-06 payDate/`formatPayrollPayDateCell` path untouched; F5 compensation not reopened.

---

## Unit evidence

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/lib/hrmDialogPortalA11y.test.ts \
  src/components/employee/employeeSalaryDialogA11y.test.ts \
  src/lib/formatDisplayDate.test.ts
→ 13/13 PASS
```

---

## QA retest (narrow — browser)

1. Login `ceo@xe.vn` → Command Center HRM employees embed
2. Employee with salary tab → **Lương & Phụ cấp**
3. Open **Thêm phụ cấp**
4. **Pass when:** iframe console has **0** matches for `DialogContent` requires a `DialogTitle` **and** `Missing Description` / `aria-describedby`
5. Visible title still «Thêm phụ cấp mới»; optional open **Sửa phụ cấp** — same console clean
6. Smoke: payroll table still no `Invalid time` (must_keep)

**cấm:** seed · Phase1/PROD claim · reopen Invalid time fix

---

## completion_report

Closed: Portal-aware Dialog a11y mirror + DialogDescription on EmployeeSalary add/edit allowance; vitest 13 PASS; Invalid time path untouched. Residual: browser confirm console warn gone (QA).

**next_owner:** qa

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-DIALOG-A11Y-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: FE READY_FOR_QA; evidence docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-20260720.md
exit_criteria: Browser ceo@xe.vn → employee → Lương → Thêm phụ cấp — iframe console 0× DialogTitle/Description warn; title visible; no Invalid time regression; U65 no seed
cấm: seed · Phase1/PROD · reopen Invalid time
evidence_path: docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md
```

**ack_status:** READY_FOR_QA  
**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-20260720.md`
