# D-MOB-HOME-SUMMARY-400-01 — home/summary mobile scope + manager hydrate

| Field | Value |
|-------|-------|
| work_item_id | D-MOB-HOME-SUMMARY-400-01 |
| from_role | dev-be |
| to_role | qa |
| date | 2026-06-09 |
| ack_status | **READY_FOR_QA** |
| spec_ref | MOB-UX-13e J-MOB-37 · `companyWireScope.ts` · ADR scope ladder |

## Root cause

1. **Mobile wire mismatch (nv0002 @ trsport):** `composeHomeSummaryParams` falls back to legal `company_uuid` when JWT slug is not `holding`/`main`. `GET /home/summary?company_id=<uuid>` hit `resolveHrmListScope` with UUID partition → **HRM-HOME-404** (device QA logged as API fail blocking `summaryIsManager` hydrate).
2. **Holding rollup on member JWT:** Mobile sometimes sends `company_id=holding` with JWT `companyId=trsport` → **409 SCOPE_CONTEXT_MISMATCH** before service.
3. **Manager hero (J-MOB-37):** `uat.nv0002` COO had JWT `roles: ['employee']` only — `viewer.is_manager` stayed `false` despite MGR persona matrix.

## Fix

| Layer | Change |
|-------|--------|
| `hrm-list-scope.ts` | `normalizeHomeSummaryCompanyId` — UUID→JWT slug (reuse payroll normalizer); member JWT + `holding` query → member slug |
| `home.controller.ts` | Normalize `company_id` before `resolveScopeContext` + pass scoped query to service |
| `home.service.ts` | Apply normalized `scopedQuery` on all builders |
| `mobile-auth.service.ts` | `deriveRoles` — COO/CFO/CTO → `manager` role (MOB-UX-13e MGR persona) |

## Verification

### Jest (local)

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="home.service.spec|home.controller.spec|hrm-list-scope.spec|mobile-auth.service.spec"
```

**Result:** **61/61 PASS**

### Local probe `:28001` (mobile JWT)

| Persona | Query `company_id` | HTTP | `viewer.is_manager` |
|---------|-------------------|------|----------------------|
| uat.nv0001@xe.vn | uuid | 200 HRM-HOME-200 | true |
| uat.nv0001@xe.vn | holding | 200 HRM-HOME-200 | true |
| uat.nv0002@xe.vn | uuid | 200 HRM-HOME-200 | **true** |
| uat.nv0002@xe.vn | holding | 200 HRM-HOME-200 | **true** |
| uat.nv0002@xe.vn | trsport | 200 HRM-HOME-200 | **true** |

### nip.io (pre-deploy residual)

Pilot VPS still serves pre-fix build — expect **404/409** on uuid/holding paths until DevOps deploy. QA should retest J-MOB-37 on nip.io **after** hrm-be recycle.

## Handoff

```yaml
completion_report: |
  Closed D-MOB-HOME-SUMMARY-400-01 — normalizeHomeSummaryCompanyId + COO manager role;
  jest 61/61 PASS; local :28001 all mobile wire paths 200 with nv0002 is_manager=true.
  Residual: nip.io deploy required for device J-MOB-37; nv0001 is_manager=true at holding (J-MOB-36 EMP layout is dev-mobile persona override).
next_owner: qa
next_dispatch_prompt: |
  QA retest D-MOB-HOME-SUMMARY-400-01 / J-MOB-37 after DevOps deploy hrm-be to nip.io:
  (1) mobile login uat.nv0002@xe.vn — fresh token for COO manager role;
  (2) GET /home/summary?company_id=<company_uuid>&employee_id=<eid>&include=celebrations,whos_out → expect 200 HRM-HOME-200 viewer.is_manager=true;
  (3) repeat holding slug query — expect 200 not 409;
  (4) qa-device MOB-UX-13e — home-manager-inbox-hero present @ emulator-5554;
  evidence docs/qa/evidence/d-mob-home-summary-400-01-qa-20260609.md PASS_TO_PM or FAIL with HTTP body.
evidence_path: docs/qa/evidence/d-mob-home-summary-400-01-20260609.md
pm_dispatch_hint: DevOps deploy hrm-be nip.io before qa-device J-MOB-37; then dev-mobile if hero still absent after API 200.
ack_status: READY_FOR_QA
```
