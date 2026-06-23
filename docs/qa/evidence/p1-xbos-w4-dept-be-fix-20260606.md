# P1-XBOS-W4-DEPT-BE — group-org-overview + holding tree fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-BE` |
| **defects** | **D-W4-DEPT-OVERVIEW-01**, **D-W4-DEPT-RELOAD-01** (BE slice) |
| **journey_id** | **J-XBOS-07** |
| **from_role** | dev-be |
| **to_role** | dev-fe + qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-06-06 |

## Summary

Fixed empty `trees: []` on `GET /tenant-scope/group-org-overview` for `ceo@xe.vn` (master-only membership). Holding/master org units saved under `company_id=holding|main` now aggregate into overview; member legal-entity trees keyed by legal-entity UUID (FE match) with legacy `xevn/{member-slug}` partition support.

## Root cause (BE)

1. `listGroupOrgTreesForUser` queried only `tenant_kind='member'` via user membership — group CEO often has **master-only** membership → zero trees.
2. `listMemberOrgTree` mapped `company_id=holding` → `main`, so saved holding units were never returned.
3. Member dept units in legacy seed live under `tenant_id=xevn, company_id={member-slug}` with `legal_entity_id` — prior query used `tenant_id=member, company_id=main` only.

## Code changes

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/common/tenant.constants.ts` | `GROUP_HOLDING_ROOT_ID` (`xbos-group-holding-root`) |
| `apps/api/xbos-api/src/org-foundation/org-foundation.service.ts` | Rebuilt `listGroupOrgTreesForUser`; `listMemberOrgTree` queries `main`+`holding`; `listOrgTreeByLegalEntity` filters by `legal_entity_id` + legacy member slug; holding includes unlinked units (`legal_entity_id IS NULL`) |
| `apps/api/xbos-api/src/tenant-scope/tenant-scope.service.ts` | `groupOrgOverview` delegates to `listGroupOrgTreesForUser` |
| `apps/api/xbos-api/src/org-foundation/org-foundation.dept-tree-overview.integration.spec.ts` | Regression: overview non-empty after holding POST pattern |
| `apps/api/xbos-api/src/tenant-scope/tenant-scope.service.spec.ts` | Updated group overview expectations |

## API contract (FE coordination)

`group-org-overview.trees[]`:

| `tenantId` | Scope |
|------------|-------|
| `xbos-group-holding-root` | Tập đoàn holding dept rows (`company_id` holding/main on master) |
| `{legal-entity-uuid}` | Member pháp nhân dept rows (match `Company.id` on CC tabs) |

`loadLegalEntityDepartmentTree` should match `trees.find(t => t.tenantId === legalEntityId)` — holding tab id `xbos-group-holding-root` now populated.

## Verification

```text
cd apps/api/xbos-api
pnpm run test   → 256/256 PASS (49 suites)
pnpm run build  → PASS
```

Targeted: `org-foundation.dept-tree-overview.integration.spec.ts` — D-W4-DEPT-OVERVIEW-01, D-W4-DEPT-RELOAD-01.

## Residual (not BE)

| ID | Owner | Note |
|----|-------|------|
| D-W4-DEPT-HEAD-MOCK-01 | dev-fe | Static `DEPT_HEAD_OPTIONS` |
| D-W4-DEPT-LEGAL-ID-01 | dev-fe | Save omitting `legalEntityId` on holding tab |
| D-W4-DEPT-MEMBER-EMPTY-01 | dev-fe + qa | FE hydrate skip on stale blank row |

## Handoff

- **completion_report:** BE closed D-W4-DEPT-OVERVIEW-01 + BE slice of D-W4-DEPT-RELOAD-01. Overview returns holding + member trees for master-only group CEO. Full J-XBOS-07 retest requires dev-fe hydrate fixes + QA browser F5.
- **next_owner:** **dev-fe** (parallel) then **qa**
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-be-fix-20260606.md`

### next_dispatch_prompt (dev-fe)

```text
P1-XBOS-W4-DEPT-FE — coordinate with BE fix docs/qa/evidence/p1-xbos-w4-dept-be-fix-20260606.md

Entry: group-org-overview now returns trees with tenantId `xbos-group-holding-root` (holding) and member legal-entity UUIDs.

Fix D-W4-DEPT-LEGAL-ID-01 + hydrate:
- loadLegalEntityDepartmentTree: match holding tab via `xbos-group-holding-root`; re-fetch on F5 (do not skip when stale blank row).
- submitDepartmentRow: always pass legalEntityId (resolve holding UUID from fetchHoldingLegalEntities).
- D-W4-DEPT-HEAD-MOCK-01: replace DEPT_HEAD_OPTIONS or disable with banner.

Files: CommandCenterPage.tsx, orgFoundationApi.ts
Exit: READY_FOR_QA with dev-be evidence linked.
```

### next_dispatch_prompt (qa)

```text
P1-XBOS-W4-DEPT-TREE-RETEST — J-XBOS-07 after dev-fe handoff

Entry: BE docs/qa/evidence/p1-xbos-w4-dept-be-fix-20260606.md READY_FOR_QA; FE hydrate must land first.

Probe: GET /api/xbos/tenant-scope/group-org-overview as ceo@xe.vn — trees non-empty; holding entry tenantId=xbos-group-holding-root contains saved dept codes.

Browser: add QA-W4-PB-001 → Lưu dòng → F5 → row persists.
Evidence: docs/qa/evidence/p1-xbos-w4-dept-tree-retest-YYYYMMDD.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
