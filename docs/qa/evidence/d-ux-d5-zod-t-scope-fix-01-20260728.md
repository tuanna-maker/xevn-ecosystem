# D-UX-D5-ZOD-T-SCOPE-FIX-01 — Payroll Zod `t()` scope fix

| Field | Value |
|-------|--------|
| **work_item_id** | `D-UX-D5-ZOD-T-SCOPE-FIX-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · no seed · no deploy · no UX-09 unlock |
| **root** | `C:\xevn-ecosystem` (junction → OneDrive workspace) |
| **parent residual** | `QA-UX-UX03-01` FAIL_TO_PM must_keep Payroll |

---

## Defect (intake)

| Item | Detail |
|------|--------|
| Symptom | `/hr/payroll` `#root` length **0** (white screen) |
| Error | `ReferenceError: t is not defined` |
| Cause | In-flight `D-UX-D5-ZOD-TAX-01` briefly bound Zod messages with `t('payroll.salaryComponents.*')` at **module scope** (outside `useTranslation`) |
| Source QA | `docs/qa/evidence/qa-ux-ux03-01-20260728.md` |

---

## Fix (change_mode: FIX)

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/salaryComponentFormSchema.ts` | Pure factory `createSalaryComponentFormSchema(messages, getExistingCodes)` — **no** `useTranslation` / `t()` in module |
| `apps/web/hrm/src/pages/Payroll.tsx` | After `useTranslation`: `useMemo` → `salaryComponentFormMessages` from `t(...)`; `useMemo` → schema; `useForm` + `zodResolver`; Add dialog wired with `Form` / `FormField` |
| CODE-MEMORY | APPEND VI on Payroll + schema (`D-UX-D5-ZOD-T-SCOPE-FIX-01`) |

### Pattern (locked)

```ts
// ❌ NEVER at module top-level
// const schema = z.object({ code: z.string().min(1, t('…')) })

// ✅ Factory + inject after useTranslation
const messages = useMemo(() => ({ codeRequired: t('…'), … }), [t]);
const schema = useMemo(
  () => createSalaryComponentFormSchema(messages, () => codesRef.current),
  [messages],
);
```

---

## must_keep (not touched)

| Guard | Status |
|-------|--------|
| `taxSettlementFloatingUi` C1 null-guard | **KEEP** — no rewrite of `taxSettlementFloatingUi.ts` |
| UX-03 debounce Attendance / Contracts | **KEEP** — no edits under Attendance/Contracts / `useDebouncedValue` |
| Profile tabs / UX-09 unlock | **HOLD** — not claimed |

---

## Verification

### Unit

```bash
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/payroll/__tests__/salaryComponentFormSchema.test.ts \
  src/components/payroll/__tests__/taxSettlementFloatingUi.test.ts
```

| Suite | Result |
|-------|--------|
| `salaryComponentFormSchema.test.ts` | **5/5 PASS** |
| `taxSettlementFloatingUi.test.ts` | **9/9 PASS** (C1 must_keep) |

### Browser smoke (U65, no seed)

Script: `docs/qa/evidence/_tmp-d-ux-d5-zod-t-scope-fix-01-smoke.mjs`  
Runtime: `docs/qa/evidence/_tmp-d-ux-d5-zod-t-scope-fix-01-runtime.json`

| Check | Result |
|-------|--------|
| Account | `ceo@xe.vn` · `companyId=main` · `:5173` |
| `/hr/payroll` `#root` length | **35205** (>80) |
| `ReferenceError` / `t is not defined` | **0** |
| Open **Tính lương** → **Bảng quyết toán thuế** | **PASS** (`taxVia=menuitem`, `onTax=true`) |
| Seed / deploy | **None** |

---

## Completes D5 Zod+RHF

| Item | Status |
|------|--------|
| Schema factory extracted | **DONE** |
| RHF `useForm` + `zodResolver` on add-component dialog | **DONE** |
| Field `FormMessage` wire (code/name/type/units/…) | **DONE** |
| Unit coverage zero-tolerance rules | **DONE** 5/5 |
| Module-scope `t()` eliminated | **DONE** (this WI) |

Related evidence pointer: `docs/qa/evidence/d-ux-d5-zod-tax-01-20260728.md` (D5 implementation closure — t-scope residual closed here).

---

## Handoff

- `completion_report`: Closed Payroll white-screen — Zod messages via factory after `useTranslation`; salary-component Zod+RHF complete; C1 floatingUi + UX-03 paths untouched. Browser `#root=35205`, tax settlement opens, no `t is not defined`.
- `next_owner`: **qa**
- `ack_status`: **READY_FOR_QA**
- `evidence_path`: `docs/qa/evidence/d-ux-d5-zod-t-scope-fix-01-20260728.md`

### next_dispatch_prompt

```text
work_item_id: QA-UX-UX03-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-D5-ZOD-T-SCOPE-FIX-01 READY_FOR_QA @ docs/qa/evidence/d-ux-d5-zod-t-scope-fix-01-20260728.md
retest: full QA-UX-UX03-01 (Shifts + Contracts debounce) + must_keep
must_keep:
  - Clock-In wizard C1
  - /hr/payroll #root>80; Tính lương → Bảng quyết toán thuế — no ReferenceError / no white-screen
  - taxSettlementFloatingUi null-guard still green
cấm: seed · deploy
exit_criteria: overall PASS_TO_PM only if must_keep Payroll green; unlock UX-09 only if PASS
evidence_path: docs/qa/evidence/qa-ux-ux03-01-retest-20260728.md (or append retest section)
```
