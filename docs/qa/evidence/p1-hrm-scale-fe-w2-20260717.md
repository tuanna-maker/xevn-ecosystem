# P1-HRM-SCALE-FE-W2 — Satellite pickers: capped / typeahead (no listAllEmployees dump)

**work_item_id:** `P1-HRM-SCALE-FE-W2`  
**date:** 2026-07-17  
**owner:** dev-fe  
**ack_status:** READY_FOR_QA  
**U65:** zero-seed (no seed used)  
**Closes condition:** `COND-SCALE-W2-PICKER` from `qc-p1-hrm-scale-w1-20260717.md`  
**NOT claimed:** Phase 1 DONE / PROD-READY

---

## spec_read_ack

| Artifact | Sections | Notes |
|----------|----------|-------|
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | §5.1 / §5.2 / §6 W2 | Pickers → keyword typeahead or capped pages; no unbounded dump |
| `docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md` | COND-SCALE-W2-PICKER | Satellite `listAllEmployees` open after W1 GO WITH CONDITIONS |
| W1 path | `useEmployeesPage` / RQ | **must stay green** — J-HRM-02, profile dedupe CLOSED |

**spec says:** Grep `listAllEmployees` = export-only (or zero on picker mount).  
**code does (after):** Pickers use `listEmployees` page=1 (+ keyword); `listAllEmployees` only Employees export/archive dialogs.

---

## Changes

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useEmployeePicker.ts` | **ADD** — `fetchEmployeePickerPage`, RQ `useEmployeePickerSearch`, debounce helper; page_size=50 default; max pages=1 |
| `apps/web/hrm/src/hooks/useEmployeePicker.test.ts` | **ADD** — cap constants, grep guards, export-only assertion |
| `apps/web/hrm/src/hooks/useEmployees.ts` | **REPLACE** `listAllEmployees` multi-page → capped `fetchEmployeePickerPage` + RQ shared cache; `total`/`isCapped`; fix InternalServices `{ enabled }` overload |
| `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx` | Keyword typeahead via `useEmployeePickerSearch` (dialog-open only) |
| `apps/web/hrm/src/components/company/CompanyMembersManagement.tsx` | Defer load to link/bulk dialogs; capped `listEmployees`; keyword search + trunc UX |
| `apps/web/hrm/src/hooks/useEmployees.pageSize.test.ts` | W2 picker cap assertions |

**Unchanged (W1 must stay green):**
- `useEmployeesPage` / Employees table mount path
- `useEmployee` RQ detail dedupe
- Portal `embedScopeKey` / soft nav
- `listAllEmployees` on Employees **export** + **deleted** dialogs only

---

## Grep exit (picker mount)

```text
listAllEmployees( / import listAllEmployees — only:
  apps/web/hrm/src/integrations/hrmApi.ts   (definition)
  apps/web/hrm/src/pages/Employees.tsx      (exportDialogOpen / deletedDialogOpen)
```

Zero calls from insurance / company members / `useEmployees` satellite path.

---

## Verification

```text
pnpm --filter vite_react_shadcn_ts test -- src/hooks/useEmployeePicker.test.ts src/hooks/useEmployees.pageSize.test.ts src/hooks/useEmployees.dedupe.test.ts src/hooks/useEmployeesPage.test.ts src/hooks/useEmployee.test.ts
→ 5 files / 24 tests PASS

pnpm --filter vite_react_shadcn_ts exec tsc --noEmit -p tsconfig.json
→ exit 0
```

---

## QA checklist (browser `:8088`, U65)

Persona: `ceo@xe.vn` / `Xevn@2026`

### Pickers (COND-SCALE-W2-PICKER)

1. **Bảo hiểm** → Thêm: dialog open → ≤1 `GET /employees?page=1&page_size=50` (optional keyword). **0** page=2..N / multi-page fan-out. Type keyword → new single-page GET with `keyword=`.
2. **Công ty → Thành viên** → Link NV / Mời hàng loạt: **0** employee list on page mount; open dialog → ≤1 capped GET per company; keyword works; trunc hint when total > page.
3. **Attendance / Payroll / Tasks** satellite Selects via `useEmployees`: ≤1 list GET (page_size≤100), shared RQ — **not** ~12-page dump.

### Regression W1 / J-HRM-02

4. HRM → Employees mount: still ≤1 `page_size=50` list (T-FANOUT).
5. List → profile → back: ≤1 detail GET; **0** multi-page list chains; iframe `_v` stable (`embedScopeKey`).
6. Console product P0 = 0.

---

## Residual

| Item | Owner |
|------|--------|
| Attendance child tabs still each call `useEmployees()` (now capped+RQ shared — OK for W2; further defer-to-dialog is P3 polish) | optional FE |
| Dept filter client-side on Employees current page (QC P3) | W2 backlog separate |
| T-CONC 1000 VU | W3 devops |
| BE typeahead endpoint polish / indexes | `P1-HRM-SCALE-BE-W2` parallel |

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md` |
| **next_owner** | **qa** |
| **completion_report** | COND-SCALE-W2-PICKER FE closed: insurance typeahead; company members deferred+capped; `useEmployees` capped RQ; `listAllEmployees` export-only. W1 Employees path untouched. Vitest 24 PASS. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: P1-HRM-SCALE-QA-W2
from_role: pm
to_role: qa
entry_criteria: P1-HRM-SCALE-FE-W2 READY_FOR_QA; evidence docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md; L0 qc:fe-be-health PASS; U65 zero-seed
read_first: ADR §6 W2; p1-hrm-scale-fe-w2-20260717.md; qc-p1-hrm-scale-w1-20260717.md COND-SCALE-W2-PICKER
persona: ceo@xe.vn / Xevn@2026 · URL http://14.225.217.232:8088
exit_criteria:
  1) Insurance Add dialog: ≤1 employees GET page=1 (keyword typeahead); 0 multi-page listAllEmployees chain
  2) Company members: 0 employees dump on mount; link/bulk dialog capped + keyword
  3) Optional smoke: Attendance leave tab Select — capped not 12-page fan-out
  4) Regression J-HRM-02 Employees: T-FANOUT ≤1; profile detail ≤1; embedScopeKey/_v stable; console P0=0
  5) Evidence docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md; PASS_TO_PM or FAIL with Network counts
cấm: seed; claim Phase 1/PROD; reopen CLOSED profile dedupe without new FAIL
```
