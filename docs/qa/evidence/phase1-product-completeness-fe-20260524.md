# PHASE1-PRODUCT-COMPLETENESS — Dev-FE evidence

**work_item_id:** `PHASE1-PRODUCT-COMPLETENESS`  
**date:** 2026-05-24  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`

## Summary

Closed false-empty UX on Command Center HRM embed satellite menus, switched insurance list to full Nest `GET /insurance`, surfaced HRM effective catalog counts on catalog governance rail, and documented dept template seed path with HTTP 404 banner.

## Changes

| Area | Change |
|------|--------|
| **Insurance (P-CC-05)** | `useInsuranceList` → `listInsuranceRecords` (`GET /api/hrm/contracts-insurance/insurance`); linked-empty uses full `insuranceList.length` |
| **Contracts** | `LinkedDataEmptyNotice` + `renderListEmptyContent` on `Contracts.tsx` (menu `contracts`) |
| **Recruitment candidates** | Linked-data banner + table empty on `CandidatesTab` (API mode) |
| **Catalog governance** | Header shows **N nhóm / M mục** from `GET /api/hrm/settings-catalogs` (`hrmCatalogStats.ts`) |
| **Dept templates rail** | `deptTemplatesLoadErrorMessage` + `loadNotFound` — seed `pnpm seed:business-master:settings-md` on 404 |
| **BE (supporting)** | `listInsurance` on `contracts-insurance` service + controller |

## Files (primary)

- `apps/web/hrm/src/hooks/useInsuranceList.ts` (+ test)
- `apps/web/hrm/src/lib/hrmLinkedDataEmpty.ts` (+ test)
- `apps/web/hrm/src/pages/Insurance.tsx`, `Contracts.tsx`
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx`
- `apps/web/web-portal/src/pages/command-center/CatalogGovernancePanel.tsx`
- `apps/web/web-portal/src/integrations/hrmCatalogStats.ts` (+ test)
- `apps/web/web-portal/src/integrations/deptSystemTemplatesApi.ts` (+ test)
- `apps/web/web-portal/src/hooks/useDeptSystemTemplates.ts`
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.{service,controller}.ts`

## Tests

```text
pnpm -C apps/web/hrm test     → 36/36 PASS
pnpm -C apps/web/web-portal test → 45/45 PASS
```

## QA L2 (portal `ceo@xe.vn` / `http://127.0.0.1:5175`)

1. **HRM embed** — Insurance / Contracts / Recruitment (candidates): workforce > 0 + satellite API empty → amber linked-data notice (not plain «Không có dữ liệu» only).
2. **Insurance** — With seed/fidelity data, table shows **all** insurance rows (not only near-expiry window).
3. **Settings → Duyệt danh mục HRM** — Toolbar shows effective catalog count (nhóm / mục).
4. **Settings → Hệ thống Phòng/Ban → Danh mục khung** — If `dept_system_templates` 404, banner cites `pnpm seed:business-master:settings-md`.

## Residual

- Payroll **overview** mock blocks unchanged; primary API path remains **Tính lương → Danh sách đợt** (`PayrollBatchesTab`).
- Catalog stats require HRM API `:28001` up (`qc:fe-be-health`).

## Handoff

- **QA:** L2 matrix P-CC-05..08 + contracts + catalog governance count + dept templates 404 path.
- **BE:** Deploy `GET insurance` with hrm-api restart if list still empty after seed.
