# Evidence — PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01` |
| **role** | dev-fe |
| **date** | 2026-08-10 |
| **depends_on** | QC GWC PAY01QC1-MSMBGWC1 · API-01 §4.3–4.5 · BE-01 READY |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · C-SLICE · **≠ PAY-01 / PAY module UAT DONE** |
| **must_keep** | ATT12QC1-MSMAIGWC1 · ATT11QC1-MSLXTH9P · PAY01 boundary · no flip payroll_e2e_ready |

## spec_read_ack

- BA: `docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01.md` — AC-PAY-01-BIND-* · G-PAY-01-BIND-FE
- API: `docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md` §4.3 bind POST · §4.5 eligibility banner fields
- QA prior: `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qa-01.md` — residual G-PAY-01-BIND-FE UI

## Closed scope (G-PAY-01-BIND-FE)

| Item | Status |
|------|--------|
| `GET/POST …/payroll/periods/:id/timesheet-binds` in `hrmApi.ts` | PASS |
| `PayrollPeriodTimesheetBindPanel` on batch detail (`PayrollBatchesTab`) | PASS |
| Display `timesheetStatus` · closed label · bind list F5 via React Query | PASS |
| Draft/submitted picker warning + toast on **412** `HRM-PAY-ATT-412` | PASS |
| Period banner when `require_closed_timesheet && !has_closed_sheet` | PASS |
| `lockBatch` process path surfaces **HRM-PAY-ATT-412** toast (J-04 FE) | PASS |
| Honesty footer · ATT11/12 stamp cite · no Nest `/core` hour SoT | PASS |

## Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/lib/payPay01BindRing.ts` (+ `.test.ts`)
- `apps/web/hrm/src/lib/poHrmMvpGd1Pay01ClusterFe01.source.test.ts`
- `apps/web/hrm/src/lib/apiError.ts` — `HRM-PAY-ATT-412` VI
- `apps/web/hrm/src/hooks/usePayrollPeriodTimesheetBinds.ts`
- `apps/web/hrm/src/hooks/usePayrollBatches.ts` — process 412 toast
- `apps/web/hrm/src/components/payroll/PayrollPeriodTimesheetBindPanel.tsx`
- `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx`

## U65 click path (QA)

```text
Persona: ceo@xe.vn · companyId=main
1) HRM → Lương → Tính lương → Danh sách kỳ → mở chi tiết kỳ (pay_batch_id deep link OK)
2) Khối «Gắn bảng chấm công (chốt)» — GET timesheet-binds 2xx · list (empty or rows)
3) Chọn header closed → «Gắn với kỳ lương» → POST timesheet-binds 2xx (or 409-DUP if exists)
   → FE: row + badge «Đã chốt» · toast · F5 list còn
4) Chọn header submitted/draft → POST → 412 HRM-PAY-ATT-412 · toast VI · không row mới
5) (J-04) Khóa/chạy lương khi chưa bind closed → 412 toast (nếu policy require closed)
6) DevTools: bind/process on /api/hrm/payroll/* · no Nest /core hour SoT
7) Footer honesty: payroll_e2e_ready=false · ≠ PAY-01 DONE
```

## Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/payPay01BindRing.test.ts \
  src/lib/poHrmMvpGd1Pay01ClusterFe01.source.test.ts \
  src/components/payroll/__tests__/payrollDomainUi.test.ts
```

**Result:** 21 tests PASS (2026-08-10)

## Residual (not promoted)

- **G-PAY-01-ELIG-FE** full list surface on main PAY tab (enroll dialog already shows `NO_CLOSED_SHEET`)
- **J-HRM-PAY-01-05** `HRM-PAY-FORMULA-412` — PAY-02/06 HOLD
- **≠** `payroll_e2e_ready` · **≠** PAY module UAT

## completion_report

**Closed:** G-PAY-01-BIND-FE — bind UI wired to timesheet-binds API with closed status display, draft→412 UX, eligibility period banner, process 412 toast; vitest + source guards; honesty/must_keep ATT11+ATT12.

**Residual:** QA U65 browser evidence J-HRM-PAY-01-02/03/04; G-PAY-01-ELIG-FE widen; formula wave HOLD.

**next_owner:** qa

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-fe-01.md`
