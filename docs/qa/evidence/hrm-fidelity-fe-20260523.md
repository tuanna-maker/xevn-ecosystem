# HRM-FIDELITY-FE — linked empty UX + scope display

**work_item_id:** `HRM-FIDELITY-FE`  
**date:** 2026-05-23  
**role:** dev-fe  
**ack_status:** `PASS_TO_PM`

## Problem

P-CC-05..08 menus showed **silent empty** tables while **Nhân sự (P-CC-03)** had rows — hides fidelity/seed gaps and confuses pilot UAT.

## Solution

| Layer | Change |
|-------|--------|
| **Portal** | `HrmEmbedScopeBar` above HRM iframe (`HrmWorkspaceRoute`) — tenant/company + group vs member hint |
| **HRM embed** | `PortalEmbedScopeBar` in portal `AppLayout` — JWT scope (`main` / subsidiary) |
| **Lists P-CC-05..08** | `LinkedDataEmptyNotice` when API list count = 0 and `GET /employees` total > 0 |
| **Actions** | Seed hint (`seed:hrm:fidelity`) + link to Command Center **Duyệt danh mục HRM** sync |

## Files

- `apps/web/hrm/src/lib/hrmLinkedDataEmpty.ts` (+ test)
- `apps/web/hrm/src/hooks/useWorkforceHeadcount.ts`
- `apps/web/hrm/src/components/hrm/LinkedDataEmptyNotice.tsx`
- `apps/web/hrm/src/components/hrm/PortalEmbedScopeBar.tsx`
- `apps/web/hrm/src/pages/Insurance.tsx`
- `apps/web/hrm/src/components/recruitment/JobPostingsTab.tsx`
- `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx`
- `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx`
- `apps/web/hrm/src/components/layout/AppLayout.tsx`
- `apps/web/web-portal/src/modules/hrm/HrmEmbedScopeBar.tsx`
- `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx`

## Matrix coverage

| Row | Surface | Empty UX owner |
|-----|---------|----------------|
| P-CC-05 | `/hr/insurance` | `Insurance.tsx` |
| P-CC-06 | `/hr/recruitment` → Job postings | `JobPostingsTab.tsx` |
| P-CC-07 | `/hr/attendance` → records table | `AttendanceRecordsTable.tsx` |
| P-CC-08 | `/hr/payroll` → Tính lương → batches | `PayrollBatchesTab.tsx` |

## Tests

```text
pnpm -C apps/web/hrm test
```

Expected: all vitest PASS (includes `hrmLinkedDataEmpty.test.ts`).

## QA L2

1. Login `ceo@xe.vn` / `Xevn@2026`, portal `http://127.0.0.1:5175`
2. Each P-CC-05..08: if employees > 0 and satellite list empty → **amber banner** + table message (not plain «Không có dữ liệu» only)
3. Scope bars visible on portal HRM routes and inside iframe header area
4. Click **Mở đồng bộ danh mục HRM** → navigates parent to `/command-center/settings/hrm_catalog_governance`

## Residual / defer

- **ADR-HRM-RBAC-SCOPE-LADDER** (SA): scope tier labels are interim (`main` = group pilot); update copy when ADR lands.
- Payroll **overview** tab still uses legacy mock blocks; primary API path is **Tính lương → Danh sách đợt** (`PayrollBatchesTab`).
- Insurance list still uses `insurance/expiring` probe (not full list GET).

## Handoff

- **QA:** L2 matrix P-CC-05..08 with workforce-full / satellite-empty scenario
- **BE/DevOps:** `pnpm seed:hrm:fidelity` to clear gap state after seed
