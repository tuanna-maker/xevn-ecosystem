# D-UX-C1-PAYROLL-FE-01 — Payroll tax-settlement floating UI null-guard

| Field | Value |
|-------|--------|
| **work_item_id** | `D-UX-C1-PAYROLL-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-07-28 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **Locks** | U65 · HOLD_DEPLOY · no Phase1/PROD claim |
| **Prior** | `d-ux-payroll-floating-p0-01-20260728-ABORTED.md` — now AUTHORIZED (sponsor chốt UX plan ACTIVE) |

---

## spec_read_ack

| Plane | Path · ack |
|-------|------------|
| **analysis** | `docs/program/UX-UI-ERP-ANALYSIS.md` §5 **P0-b** / UX-02 — crash floating UI tax settlement |
| **matrix** | `docs/qa/evidence/ux-ui-erp-screen-matrix-01.md` — UX-02 / P0-b `floatingUiState` |
| **ux rules** | `_vibe-team-os/UX-PRODUCT-RULES.md` §2.1 Recovery · §3.4 state smell |
| **peer plan** | `docs/program/UX-UI-ERP-PEER-DIVISION-PLAN.md` — Cursor owns C1 Payroll |
| **sponsor_confirm** | PEER-UX-SPONSOR-CHOT-01 — plan ACTIVE; Lane C1 authorized |
| **code_memory** | APPEND VI trên `Payroll.tsx` + `taxSettlementFloatingUi.ts` |

---

## completion_report

### Closed

- Introduced `apps/web/hrm/src/components/payroll/taxSettlementFloatingUi.ts`:
  - `TaxSettlementFloatingUiState` always initialized (`createEmptyTaxSettlementFloatingUiState`)
  - `normalizeTaxSettlementEmployee` / `safePayrollNumber` / `formatPayrollMoney`
  - `openTaxEmployeeEditFloatingUi` / `closeTaxEmployeeEditFloatingUi` / `applyTaxEditDialogOpenChange`
  - `patchTaxEmployeeEditForm` null-safe
- Wired `Payroll.tsx` tax-settlement employee edit dialog to `taxSettlementFloatingUi` (no bare `show` + form desync)
- Cancel / Dialog `onOpenChange(false)` fully resets employee + form (UX-06 race mitigation for this dialog)
- Table / totals / avatars use safe formatters (no `.toLocaleString` / `.split` on null)
- Vitest: **9/9 PASS** `src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts`
- Did **not** touch `apps/web/x-bos-core/**`, mobile, Profile tabs, calculate/payment API paths, seed, deploy

### Residual

- Full Payroll IA / wizard = **C2** (out of scope)
- Attendance Clock-In IA = sibling `D-UX-C1-ATTENDANCE-FE-01` — QA-UX-C1-01 should wait both FE READY
- Browser manual on live empty tax-settlement list: edit path needs ≥1 row (U65 — no seed); unit covers open/close/null cases
- Zod on tax edit form = D5 backlog (not this FIX)

### Manual note (QA)

1. Login HRM → Payroll → Tính lương → Quyết toán thuế
2. Open a settlement detail (or inject only via FE product path if list empty — do **not** seed)
3. Click pencil on employee row → dialog opens, fields numeric, no console crash
4. Cancel → reopen → no stale employee / no crash
5. Dropdown «…» (Hoàn thuế / Khấu trừ) still opens without throwing

---

## Verify commands

```bash
pnpm --filter vite_react_shadcn_ts test -- src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts
# Result 2026-07-28: 9 passed
```

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/taxSettlementFloatingUi.ts` | ADD — helpers + CODE-MEMORY |
| `apps/web/hrm/src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts` | ADD — 9 tests |
| `apps/web/hrm/src/pages/Payroll.tsx` | FIX wire + CODE-MEMORY-CHANGE APPEND |
| `docs/program/PEER_PM_COLLAB.md` | short READY note (member → PM intake) |

---

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-UX-C1-01
from_role: pm
to_role: qa
lane: execution
entry_criteria:
  - D-UX-C1-PAYROLL-FE-01 READY_FOR_QA @ docs/qa/evidence/d-ux-c1-payroll-fe-01-20260728.md
  - WAIT sibling D-UX-C1-ATTENDANCE-FE-01 READY_FOR_QA before starting combined C1 QA
  - U65 zero-seed; browser FE-only; HOLD_DEPLOY
scope:
  - UF: Payroll → calc-tax-settlement → open employee edit dialog → Cancel → reopen (no crash)
  - UF: sibling Attendance Clock-In IA slice per Attendance evidence
  - Console: zero TypeError on floating UI / tax edit
  - Do NOT claim Phase1/PROD
exit_criteria:
  - evidence_path: docs/qa/evidence/qa-ux-c1-01-20260728.md
  - matrix UX-02 / P0-b status update
  - ack_status PASS_TO_PM or FAIL_TO_PM with residuals
```

## ack_status

**READY_FOR_QA**
