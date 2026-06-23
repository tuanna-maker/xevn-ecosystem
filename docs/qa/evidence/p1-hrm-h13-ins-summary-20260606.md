# P1-HRM-H13-INS-SUMMARY — D-HRM-INS-SUMMARY-01

**work_item_id:** `P1-HRM-H13-INS-SUMMARY`  
**defect:** `D-HRM-INS-SUMMARY-01`  
**owner:** dev-fe  
**date:** 2026-06-06  
**ack_status:** `READY_FOR_QA`

## Symptom (before)

Insurance tab (`P-CC-05`) summary cards **Tổng BHXH / BHYT / BHTN / Tổng cộng** showed «-» while the table listed participants (`ceo@xe.vn` / `company_id=main` embed).

**Root cause:** `contracts-insurance/insurance` list API returns `base_salary` and contribution rates as `null`. Summary used `formatCurrency(0)` → «-». List still showed policy numbers from `policy_number`.

## Fix

| Layer | Change |
|-------|--------|
| `lib/insuranceSummary.ts` | `aggregateInsuranceSummary` — monetary totals when salary+rate available; **participant count fallback** per type when amount = 0 but records exist |
| `hooks/useInsuranceList.ts` | Parallel `listInsurancePolicyParticipants` merge by `employee_code` for salary/rate enrichment |
| `pages/Insurance.tsx` | Summary cards use `formatInsuranceSummaryValue`; row/export/view use statutory default rates (8% / 1.5% / 1%) when insurance number present |

## Display rules (SRS-aligned)

- **Amount > 0** → VND currency (policy participant or row has `base_salary`)
- **Amount = 0, count > 0** → show participant count (e.g. `2`, `171`) — not «-»
- **No records** → «-»
- **U34** inline-save / dialog refetch unchanged (`refetch` on dialog close)

## Verification

```bash
pnpm -C apps/web/hrm test    # 132/132 PASS (+7 insuranceSummary)
pnpm -C apps/web/hrm build   # exit 0
```

### Regression tests

- `src/lib/insuranceSummary.test.ts` — count fallback, monetary aggregate, policy-participant merge

### Manual QA (localhost embed)

1. Login `ceo@xe.vn` / `Xevn@2026`
2. Command Center → HRM embed → **Bảo hiểm** (`/command-center/hrm/insurance`)
3. Expect summary cards **not** «-» when table has rows:
   - BHXH card ≥ 1 (count or currency)
   - Tổng cộng matches filtered list size when no salary data

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| BE list API financial fields | dev-be | `mapInsuranceListItem` still nulls rates/salary — FE enriches from policy participants + count fallback |
| Delete vs list table | dev-be | `DELETE insurance-policy-participants` may not remove `employee_insurance_records` row (pre-existing H12 note) |

## Handoff

- **next_owner:** qa  
- **J-*** retest: P-CC-05 insurance tab load; J-HRM-04 employee link unchanged  
- **pm_dispatch_hint:** QA L2 P-CC-05 + confirm D-HRM-INS-SUMMARY-01 closed on `ceo@xe.vn` embed
