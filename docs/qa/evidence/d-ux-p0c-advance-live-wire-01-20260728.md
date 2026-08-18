# D-UX-P0C-ADVANCE-LIVE-WIRE-01 — Advance live Add atomic reset (DEF-P0C-ADV-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-UX-P0C-ADVANCE-LIVE-WIRE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-07-28 |
| **qa_fail** | `docs/qa/evidence/qa-ux-p0c-01-20260728.md` §4b · **DEF-P0C-ADV-01** |
| **spec_ref** | `docs/program/UX-UI-ERP-ANALYSIS.md` §5 **P0-c** / UX-06 |
| **change_mode** | `FIX` |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · no seed · no deploy |

---

## spec_read_ack

| Plane | Path / note |
|-------|-------------|
| **defect** | QA-UX-P0C-01 FAIL — live `AdvanceRequestsTab` Cancel→reopen retains `QA_P0C_ADV_STALE` / `2099-99` |
| **pattern** | Mirror SalaryComponentsTab `openAddDialog`/`closeAddDialog` + tax `OPEN/CLOSE_*` atomic reset |
| **must_keep** | taxSettlementFloatingUi C1 · SalaryComponentsTab Zod+RHF D5 · Clock-In · Payroll mount |

---

## Root cause

Live CTA **Tạo bảng tạm ứng** opens `AdvanceRequestsTab` local dialog with `onOpenChange={setShowAddDialog}` — boolean only, **no form reset**.  
`Payroll.tsx` domain-reducer Advance Dialog (`onAddAdvanceOpenChange`) remains **orphan** (no `set(true)` from UI) and uses a different form shape — not the live path.

---

## Fix

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/advanceRequestFormUi.ts` | **NEW** — `createEmptyAdvanceRequestFormData` + `resolveAdvanceAddDialogOpenChange` (open/close → empty) |
| `apps/web/hrm/src/components/payroll/AdvanceRequestsTab.tsx` | Wire `openAddDialog` / `closeAddDialog` / `onAddOpenChange`; CTA + Hủy + create success; CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/payroll/__tests__/advanceRequestFormUi.test.ts` | **NEW** — close→empty + fill→close→reopen (no stale) |

**Not changed (must_keep):** `taxSettlementFloatingUi.ts` · `SalaryComponentsTab` Zod · `Attendance` / Clock-In · no seed/deploy.

**Orphan note (Info P2):** `Payroll.tsx` Add Advance Dialog still present but not reachable from calc-advance CTA — left in place to avoid REPLACE shell dialog (form shape differs). Live path is `AdvanceRequestsTab` only.

---

## Verification (dev)

```bash
cd apps/web/hrm && pnpm exec vitest run \
  src/components/payroll/__tests__/advanceRequestFormUi.test.ts \
  src/components/payroll/__tests__/payrollDomainUi.test.ts \
  src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts \
  src/components/payroll/__tests__/salaryComponentFormSchema.test.ts
```

| Suite | Result |
|-------|--------|
| `advanceRequestFormUi` | **4/4 PASS** |
| `payrollDomainUi` | **13/13 PASS** |
| `taxSettlementFloatingUi` C1 | **9/9 PASS** |
| `salaryComponentFormSchema` D5 | **5/5 PASS** |
| **Total** | **31/31 PASS** |
| Seed / deploy | **None** |

---

## QA retest focus (copy)

1. Login `ceo@xe.vn` → `/hr/payroll` → Tính lương → **Tạm ứng**
2. **Tạo bảng tạm ứng** → type `QA_P0C_ADV_STALE` + `2099-99` → **Hủy**
3. Reopen → inputs must **not** contain those values (name empty / period default)
4. Esc path same
5. Smoke must_keep: tax cancel→reopen · D5 Zod · Clock-In

```bash
node scripts/qa/qa-ux-p0c-01-browser.mjs
```

Expect: `UF-P0C-ux06-advance-cancel-reopen` **ok=true** · runtime `verdict: PASS`

---

## Handoff

- `completion_report`: Fixed live Advance Add UX-06 — atomic open/close reset via `advanceRequestFormUi`; vitest 31/31 (new 4 + C1/D5/domain); must_keep untouched; HOLD_DEPLOY; orphan Payroll Advance Dialog noted P2.
- `next_owner`: `qa`
- `ack_status`: **READY_FOR_QA**
- `evidence_path`: `docs/qa/evidence/d-ux-p0c-advance-live-wire-01-20260728.md`

### next_dispatch_prompt

```text
work_item_id: QA-UX-P0C-01
from_role: pm
to_role: qa
lane: execution
residual_auto_fix: true
entry_criteria: D-UX-P0C-ADVANCE-LIVE-WIRE-01 READY_FOR_QA @ docs/qa/evidence/d-ux-p0c-advance-live-wire-01-20260728.md
spec_ref: docs/program/UX-UI-ERP-ANALYSIS.md §5 P0-c / UX-06
focus: UF-P0C-ux06-advance-cancel-reopen (live AdvanceRequestsTab) + must_keep tax/D5/C1/Clock-In smoke
account: ceo@xe.vn / Xevn@2026 · http://127.0.0.1:5173
script: node scripts/qa/qa-ux-p0c-01-browser.mjs
exit_criteria: runtime verdict PASS · hardFails=[] · evidence docs/qa/evidence/qa-ux-p0c-01-20260728.md (retest) · PASS_TO_PM
cấm: seed · deploy · HOLD_DEPLOY
```
