# Evidence — PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **defect** | `DEF-CTR-G4-DOM-NESTING-P2` |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

`ContractWorkspaceViewBody` — block «Mẫu in» wrapped `packCode` `Badge` (renders `<div>`) inside `<p>`, triggering React `validateDOMNesting` on view workspace open.

Stack (QA): `Badge` → `div` inside `p` → `ContractWorkspaceViewBody`.

---

## Fix

**File:** `apps/web/hrm/src/components/contracts/ContractWorkspaceViewBody.tsx`

- Replaced `<p className="text-sm">` wrapper with `<div className="text-sm flex flex-wrap items-center gap-2">` + inner `<span>` for template code.
- Added `data-testid="hdsd-contracts-view-print-template"` for QA anchor.
- `@CODE-MEMORY-CHANGE` PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-FE-01.

**must_keep:** G3 workspace view/edit/create behavior unchanged; status badge still in `<div>` (already valid).

---

## Verify

| Command | Result |
|---------|--------|
| `pnpm exec tsc --noEmit` (apps/web/hrm) | **PASS** exit **0** |
| `pnpm exec vitest run contractWorkspace` | **18/19 PASS** — 1 pre-existing unrelated fail (`ctr-create-employee-rec-hint` vs banner constant rename in Step1; not in this WI scope) |

---

## QA retest matrix

| Scenario | Persona | Click path | Expect |
|----------|---------|------------|--------|
| View workspace | `ceo@xe.vn` / `main` | Contracts → Eye → Step1 «Mẫu in» | No `validateDOMNesting` Badge-in-`<p>`; pack badge visible when `packCode` set |
| Create workspace | same | Tạo HĐ → open dialog | No new console nesting warnings |
| Edit workspace | same | Chỉnh sửa / deep-link `?workspace=edit` | Regression PASS (G3/G4 edit deeplink) |

**U65:** browser-only · zero-seed.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed `DEF-CTR-G4-DOM-NESTING-P2` — Badge no longer nested in `<p>` on view workspace Mẫu in row. tsc PASS. |
| **next_owner** | `qa` |
| **evidence_path** | `docs/qa/evidence/po-hrm-ctr-workspace-fe-dom-nesting-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QA-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-fe-dom-nesting-01.md
  - docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md
entry_criteria: dev-fe READY_FOR_QA DEF-CTR-G4-DOM-NESTING-P2 fix merged locally
exit_criteria: Browser contracts view/create/edit open — console 0 validateDOMNesting Badge-in-p; WS-G4 view regression PASS; evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-dom-nesting-01.md; ack_status PASS_TO_PM or FAIL_TO_PM
persona: ceo@xe.vn / company_id=main · http://127.0.0.1:5173/command-center/hrm/contracts
U65: zero-seed · FE-only
must_keep: contracts_printable_ready=false; G3/G4 edit deeplink regression
```
