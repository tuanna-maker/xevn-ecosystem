# D-HDSD-MUTATE-FE-VIMONEY-01 — evidence (2026-08-01)

**work_item_id:** `D-HDSD-MUTATE-FE-VIMONEY-01`  
**program:** `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-BH-VIMONEY-01`  
**from_role:** dev-fe · **to_role:** devops / qa  
**ack_status:** `READY_FOR_QA`  
**priority:** P0  
**change_mode:** ADD · **preserve_default:** true  
**U65:** no seed · no demote TC-025/049 · no rewrite BH dialog business

## Entry criteria (met)

- DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02 `PASS_TO_PM` · HEAD `ea2df15` SoftDel Vite CLOSED  
- Residual: `AddInsuranceDialog` cannot resolve `@/components/ui/ViMoneyInput` (file never on main)  
- Evidence prior: `docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-02-20260801.md`

## Closed scope

1. Mapped call-site API from `AddInsuranceDialog` (+ Payroll / Employee / Recruitment / InsurancePolicyTab):
   - props: `value: number`, `onValueChange: (n: number) => void`, `onBlur`, `name`, `placeholder`, `className`, `disabled`, `aria-label`, …
   - named exports: `amountStringToNumber`, `numberToAmountString`
2. **Added** `apps/web/hrm/src/components/ui/ViMoneyInput.tsx` (+ `@CODE-MEMORY`)
   - vi-VN thousand grouping while typing (`15.000.000`)
   - commit via `onValueChange` = plain number
   - `numberToAmountString` = plain digits (safe for `parseFloat` / API — avoids `parseFloat("15.000.000") === 15`)
3. **Added** `apps/web/hrm/src/components/ui/ViMoneyInput.test.ts` — **6/6 PASS**
4. **Did not** modify `AddInsuranceDialog.tsx` business (import already present; SoftDel · CatalogSearchPicker · policy_id · TC-041 untouched)

## Local verify

| Check | Result |
|-------|--------|
| `vitest run src/components/ui/ViMoneyInput.test.ts` | **6/6 PASS** |
| Vite `GET http://127.0.0.1:8080/hr/src/components/insurance/AddInsuranceDialog.tsx` | **200** · no `Failed to resolve` |
| Vite `GET http://127.0.0.1:8080/hr/src/components/ui/ViMoneyInput.tsx` | **200** · module body OK |
| `tsc -p tsconfig.app.json` filtered `ViMoneyInput` | **0 hits** (touch clean; repo still has unrelated missing `ViDateField` etc.) |

## must_keep (unchanged)

- SoftDel row-action isolation  
- CatalogSearchPicker (insurer / type)  
- `policy_id` picker + CTA «Tạo chính sách BH»  
- TC-041 / U65 zero-seed  

## Allow-list for DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03

```
apps/web/hrm/src/components/ui/ViMoneyInput.tsx
apps/web/hrm/src/components/ui/ViMoneyInput.test.ts
docs/qa/evidence/d-hdsd-mutate-fe-vimoney-01-20260801.md
```

## Residual

- **VPS / :8088** still 500 until DevOps redeploy-03 ships allow-list above.  
- Unrelated HRM missing modules (`ViDateField`, …) remain out of this work_item.

## next_owner

`devops` → `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03` (allow-list ViMoney* only) → then `qa` → `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03`
