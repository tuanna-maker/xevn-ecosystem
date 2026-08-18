# D-UX-VI-FORMAT-PORTAL-01 — FE evidence (2026-07-20)

**work_item_id:** `D-UX-VI-FORMAT-PORTAL-01`  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**spec_ref:** `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` · inventory `d-ux-vi-format-inventory-01-20260720.md` §A3/B5 · shared `d-ux-vi-format-shared-01-fe-20260720.md`

## Scope closed

### Money MUST → `ViGroupedIntegerInput` (@xevn/ui)

| Surface | Field | Notes |
|---------|-------|-------|
| Settings Vendors | `creditLimit` | VNĐ; empty ↔ undefined |
| Settings Expense | `maxAmountNoApproval` | VNĐ; empty ↔ undefined |
| Settings Vehicle | `maintenanceIntervalKm` | large qty km (P1 inventory) |
| Settings KPI | `targetValue` / `warningThreshold` / `criticalThreshold` | **only when** unit is VNĐ/VND/đồng (`isKpiMoneyUnit`) |
| CC metadata `dataType=number` | money-hint labels/codes | via `isViMoneyFieldHint` + `MetadataNumberOrMoneyInput` |

### must_keep (unchanged)

- Command Center **charterCapital** (AutoResizeTextarea + `formatViGroupedInteger` / `parseViGroupedInteger`)
- Shareholder **contributedValue** (`ViGroupedIntegerInput`)
- Shareholder **ratioPercent** stays `type="number"` (EXEMPT %)

### EXEMPT left as `type="number"`

- Vendor `discountRate` %
- Vehicle payload (tấn), fuel L/100km
- KPI thresholds when unit is `%` / non-money
- CC SLA hours, field order, Org/RACI numeric cells
- Chart `XAxis type="number"` on KPI dashboard
- Metadata number when label/code is not money-hint

### Dates → `ViDateInput` (dd/MM/yyyy text ↔ ISO `yyyy-MM-dd`)

Portal has no Calendar/Popover package — used shared text date input (preferred over native `type=date` chrome).

| Surface | Fields |
|---------|--------|
| CC company | `firstIssueDate` |
| CC legal docs | `issuedDate`, `expiredDate` |
| CC infra | `leaseLegalEndDate` |
| CC metadata + employee preview | all `dataType=date` |

**SoT added in `@xevn/ui`:** `ViDateInput`, `formatIsoDateToViDisplay`, `parseViDisplayToIsoDate`, `isViMoneyFieldHint`.

## Files touched

- `packages/ui/src/lib/viDateFormat.ts` (new)
- `packages/ui/src/components/ViDateInput.tsx` (new)
- `packages/ui/src/index.ts` (exports)
- `apps/web/web-portal/src/pages/settings/VendorsSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/ExpenseCategoriesSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/VehicleTypesSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/KPIMetricsSettingsPage.tsx`
- `apps/web/web-portal/src/pages/settings/kpiMoneyUnit.ts` (new)
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/pages/command-center/MetadataTypedFieldControls.tsx` (new)
- `apps/web/web-portal/src/utils/viNumberFormat.test.ts`

## Tests

```text
pnpm --filter web-portal test -- src/utils/viNumberFormat.test.ts
→ 10 PASS (format/parse + date ISO↔VI + money hint + KPI unit gate + credit/expense/charter parse samples)
```

## Residual

- Portal still lacks shadcn Calendar/Popover — `ViDateInput` is text entry; future wave may add picker chrome.
- Metadata money detection is label/code heuristic — edge labels without money keywords stay plain number (documented).
- SLA hours / RACI numeric / sort order intentionally EXEMPT.

## Cấm respected

- No seed · no Phase1/PROD claim · shareholder/charter flows not rewritten · API payloads remain numeric / ISO date strings

## next_dispatch_prompt

```text
work_item_id: QA-UX-VI-FORMAT-PORTAL-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-VI-FORMAT-PORTAL-01 READY_FOR_QA; L0 stack up; U65 browser-only zero-seed
exit_criteria: evidence browser samples below; Network body numeric/ISO; F5 display ok; ack PASS_TO_PM
evidence_path: docs/qa/evidence/qa-ux-vi-format-portal-01-20260720.md
cấm: seed · API-only PASS · break CC shareholder

## Samples (must cover)
1) UF-XBOS charter capital — gõ 20000000 → UI 20.000.000; Lưu → Network number; F5 grouped
2) Shareholder contributedValue — same; ratio % still plain (no 1.000 for 100)
3) Settings Vendors creditLimit — grouped typing; submit number
4) Settings Expense maxAmountNoApproval — grouped typing; submit number
5) CC company firstIssueDate — enter/display dd/MM/yyyy; Network/store yyyy-MM-dd; F5 still dd/MM/yyyy
```
