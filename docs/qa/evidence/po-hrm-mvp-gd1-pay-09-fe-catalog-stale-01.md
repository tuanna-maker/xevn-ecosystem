# Evidence — PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-10 |
| **parent_qc** | `PAY09QCFE1-MSMLA8QC1` · residual **`FE-PAY09-CATALOG-LIST-STALE`** (P2) |
| **ack_status** | **READY_FOR_QA** |
| **must_keep** | PAY-08 lifecycle UI · `PAY09QC1` + `PAY09QCFE1` seals · `payroll_e2e_ready=false` · ≠ PAY module DONE |

## Problem

POST `/api/hrm/payroll/groups` **201** — row `pay-group-row-{id}` không hiện ngay sau **Lưu**; QA phải reload (cite `po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.md`).

## Fix (narrow)

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/usePayrollGroups.ts` | `payrollGroupsQueryKey` (no `undefined` status segment) · `upsertPayrollGroupInListCache` on create/update **onSuccess** · `await refreshPayrollGroupsQueries` (invalidate + refetch active) |
| `apps/web/hrm/src/components/payroll/PayrollGroupsCatalogTab.tsx` | CODE-MEMORY FIX note · giữ `refetch()` sau mutate (belt-and-suspenders) |

## spec_read_ack

- QC: `docs/qa/evidence/qc-po-hrm-mvp-gd1-pay-09-cluster-fe-gwc-01.md` § FE-PAY09-CATALOG-LIST-STALE
- QA: `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.md`

## Verify

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/payPay09GroupRing.test.ts src/lib/poHrmMvpGd1Pay09ClusterFe01.source.test.ts src/hooks/usePayrollGroups.cache.test.ts
```

**Result:** 3 files · **11 PASS** (was 8 PAY-09 cluster + 3 cache/source addendum).

## QA retest (U65 · browser)

| UF / J-* | Entry | Exit |
|----------|-------|------|
| **J-HRM-PAY-09-01** | Lương → Chính sách → Phân nhóm bảng lương · Tạo nhóm mới · Lưu | Network POST **201** · **không F5** — `pay-group-row-{id}` visible ≤20s · honesty footer |

**Persona:** `ceo@xe.vn` · `companyId=main` · portal `:5173/hr/payroll` · hrm-api `:28001`

## Residual (unchanged)

| ID | Note |
|----|------|
| `J-HRM-PAY-09-03` | HOLD scope panel deep-link |
| `J-HRM-PAY-09-04` | HOLD payslips tab filter |
| PAY module / PAY-09 DONE | **DENIED** · `payroll_e2e_ready=false` |

## Handoff

- **completion_report:** Closed P2 `FE-PAY09-CATALOG-LIST-STALE` — optimistic list upsert + awaited refetch on payroll-groups query key after POST/PATCH success.
- **next_owner:** `qa`
- **next_dispatch_prompt:** Retest `PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01` — J-HRM-PAY-09-01 create path without reload; confirm `FE-PAY09-CATALOG-LIST-STALE` cleared; retain PAY09QCFE1 honesty locks; evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01-qa.md`.
