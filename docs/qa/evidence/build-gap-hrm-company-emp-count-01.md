# BUILD-GAP-HRM-COMPANY-EMP-COUNT-01 — evidence

**work_item_id:** BUILD-GAP-HRM-COMPANY-EMP-COUNT-01  
**role:** dev-fe  
**date:** 2026-08-03  
**spec_ref:** UC-HRM-03 · BR-INT-05 · HRM_MENU_DATA_LINKAGE_MATRIX §2.2 `/company`

## Problem

After `metadataWorkflowLabel` restore, `vite build` failed on next missing lib:

```text
ENOENT src/lib/hrmCompanyEmployeeCount (CompanyManagement.tsx)
```

## Root cause

`apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts` (+ test) absent from working tree; `CompanyManagement.tsx` still imported:

- `enrichHrmCompaniesWithWorkforceCounts`
- `formatHrmEmployeeCount`
- `sumKnownEmployeeCounts`

## Fix (restore from git 43c479a)

| File | Action |
|------|--------|
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts` | Restored + `@CODE-MEMORY-CHANGE` BUILD-GAP-HRM-COMPANY-EMP-COUNT-01 |
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.test.ts` | Restored from same commit |

**must_keep respected:** metadataWorkflowLabel · decisionListUi · CompanyManagement CO-BIND / date picker — no edits outside lib restore.

## Commands & results

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/hrmCompanyEmployeeCount.test.ts
# exit 0 — 5 tests passed

pnpm run build
# hrmCompanyEmployeeCount: RESOLVED (2901 modules transformed)
# exit 1 — next blocker (out of scope this item):
#   ENOENT src/lib/insurancePolicyFormSchema (InsurancePolicyMasterPanel.tsx)
```

## Vitest summary

| Suite | Tests | Verdict |
|-------|-------|---------|
| `hrmCompanyEmployeeCount.test.ts` | 5 | PASS |

## Residual (for PM / next build-gap)

- **BUILD-GAP follow-up:** restore or recreate `@/lib/insurancePolicyFormSchema` for `InsurancePolicyMasterPanel.tsx` if full HRM `vite build` green is required program-wide.

## QA handoff (next)

- **UF / path:** HRM → `/hr/company` (CompanyManagement) — bảng + card **Tổng nhân viên**; cột NV hiển thị số hoặc `—` (không ép 0 khi API fail).
- **Persona:** group CEO `ceo@xe.vn` · U65 zero-seed · FE-only · F5 after load.
- **J-***: company list cross-nav per `PROGRAM_JOURNEY_MAP.md` if in-scope sprint.
- **Network:** GET `/api/hrm/employees/summary` (rollup `main` hoặc per-slug) sau group-member-units load — không banner đỏ.

## ack_status

**READY_FOR_QA** — scope of this work_item closed; full production build still blocked by unrelated missing lib (documented above).
