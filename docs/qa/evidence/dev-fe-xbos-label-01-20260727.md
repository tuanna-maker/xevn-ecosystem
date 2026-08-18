# Evidence — D-XBOS-LABEL-FE-01

**work_item_id:** `D-XBOS-LABEL-FE-01`  
**role:** dev-fe  
**date:** 2026-07-27  
**ack_status:** READY_FOR_QA  
**change_mode:** FIX · preserve_default · code_memory APPEND

## spec_read_ack

| Artifact | Cite |
|---|---|
| U72 label leak scope | `docs/qa/evidence/ba-display-xbos-review-01-20260727.md` — verdict FAIL F-XBOS-01..F-XBOS-11 |
| Render-point constraint | `.cursor/rules/display-label-no-raw-key.mdc` (path referenced by sponsor lock U72; if missing, follow the same rule embodied in the BA evidence) |

## What was failing (F-XBOS-01..F-XBOS-11)

Raw enum keys / technical slugs were printed directly in user-facing UI across `x-bos-core` and `web-portal` surfaces.

## Fix summary (code review level)

| F-ID | Surface / component | Before | After |
|---|---|---|---|
| F-XBOS-01 | `apps/web/x-bos-core/src/pages/OrganizationPage.tsx` | `{row.orgTypeCode}` visible | `resolveOrgTypeCodeLabel(row.orgTypeCode)` visible (unknown → `—`) |
| F-XBOS-02 | `apps/web/x-bos-core/src/pages/OrganizationPage.tsx` | `{row.status}` visible in badge | `resolveRecordStatusLabel(row.status)` visible (unknown → `—`) |
| F-XBOS-03 | `apps/web/x-bos-core/src/pages/MetadataConfigPage.tsx` | `{m.dataType}`, `{m.entityType}` visible | Vietnamese label resolvers for dataType/entityType (unknown → `—`) |
| F-XBOS-04 | `apps/web/x-bos-core/src/pages/kpi/KpiDefinitionsPage.tsx` | `row.frequency`, `row.status` visible + select option text | Resolved VI labels (unknown → `—`) |
| F-XBOS-05 | `apps/web/x-bos-core/src/pages/kpi/KpiAssignmentsPage.tsx` | Header text contained raw `h.status` | Header + summary use `resolveCascadeAllocationStatusLabel` (unknown → `—`) |
| F-XBOS-06 | `apps/web/x-bos-core/src/pages/kpi/PolicyManagementPage.tsx` | Group/policy status badges + selects used raw slugs | Vietnamese status labels (unknown → `—`) |
| F-XBOS-07 | `apps/web/x-bos-core/src/pages/kpi/RewardPenaltyCalcPage.tsx` | Run select option showed `{r.status}` | `resolveRewardPenaltyRunStatusLabel(r.status)` (unknown → `—`) |
| F-XBOS-08 | `apps/web/web-portal/src/pages/partners/PartnersPage.tsx` | Partner type badge rendered raw `supplier/distributor/service` | Local resolver maps type → VI labels; stat cards values updated consistently |
| F-XBOS-09 | `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Infra custom field modal showed blockCode in option/list/header | Block option text now uses `labelVi` only; block navigator/list and field list no longer print raw `blockCode` |
| F-XBOS-10 | `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx` | UI copy used `holding` / `Nguồn holding` | Copy now uses Vietnamese `tập đoàn` / `Nguồn tập đoàn` |
| F-XBOS-11 | `apps/web/web-portal/src/integrations/workflowInstanceMapper.ts` | Unknown status returned `status` (raw key leak) | Fail-closed: unknown status fallback returns `—` |

### Shared label resolver (x-bos-core)

- `apps/web/x-bos-core/src/utils/xbosCoreLabelMaps.ts`

## QA / browser-only verification (U65)

QA please verify via FE-only flow (no seed / no direct API claims):

1. `x-bos-core` — `OrganizationPage`
   - Verify `Loại` column never shows `holding/subsidiary/division/department` as visible text.
   - Verify `Trạng thái` badge never shows `active/inactive` as visible text; unknown → `—`.
2. `x-bos-core` — `MetadataConfigPage`
   - Verify `Kiểu` column never shows raw `text/number/date/boolean/select` or `entityType` as visible keys.
3. `x-bos-core` — `KpiDefinitionsPage`
   - Verify both table cells and select option text for `frequency` and `status` are Vietnamese labels.
4. `x-bos-core` — `KpiAssignmentsPage`
   - Verify header/summary uses Vietnamese status labels; buttons and toast messages do not include raw `pending_approval/approved/frozen`.
5. `x-bos-core` — `PolicyManagementPage`
   - Verify group/policy status badges and select option text are Vietnamese labels (no raw slugs).
6. `x-bos-core` — `RewardPenaltyCalcPage`
   - Verify run select options show Vietnamese label, and unknown → `—`.
7. `web-portal` — `PartnersPage`
   - Verify partner type badge never shows raw `supplier/distributor/service`.
8. `web-portal` — `CommandCenterPage` → infra custom field modal
   - In `Thuộc khối` options: visible text must be `labelVi` only (no `general/location/capacity` prefixes).
   - In field lists and block navigator header: visible text must not include raw `blockCode`.
9. `web-portal` — `CommandCenterPage` → Apply catalog panel
   - Verify `tập đoàn` / `Nguồn tập đoàn` wording; no `holding` in user-facing copy.
10. `web-portal` — workflow instances UI
   - Verify unknown/non-mapped workflow `status` fallback is `—` (fail-closed).

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: D-XBOS-LABEL-FE-01
role: qa
entry_criteria: U72 zero-seed browser-only evidence. Verify FE routes end-to-end after any mutation (no DB/seed). 
to_verify:
  - UF/XBOS pages: OrganizationPage, MetadataConfigPage, KpiDefinitionsPage, KpiAssignmentsPage, PolicyManagementPage, RewardPenaltyCalcPage
  - web-portal surfaces: PartnersPage, CommandCenterPage (infra custom field modal + ApplyCatalogToMembersPanel)
  - workflow instance screen fallback: workflowInstanceStatusLabelVi unknown → `—`
exit_criteria: For all F-XBOS-01..F-XBOS-11, no visible raw keys/leaks remain; unknown values render `—`. Update UX evidence screenshots + click paths; set ack_status READY_FOR_QA in handoff.
evidence_path: docs/qa/evidence/dev-fe-xbos-label-01-20260727.md
```

## ack_status

READY_FOR_QA

