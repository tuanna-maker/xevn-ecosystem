# P1-XBOS-W4-DEPT-HOLDING-TREE — holding legal-entity UUID aggregation fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-HOLDING-TREE` |
| **defects** | **D-W4-DEPT-LEGAL-MATCH-01**, **D-W4-DEPT-RELOAD-01** (BE holding slice) |
| **journey_id** | **J-XBOS-07** |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-06-06 |
| **entry** | `docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md` (QA FAIL) |

## Summary

Fixed holding department units invisible on `group-org-overview` reload when saved with a holding `legal_entity_id` different from the single row picked by `LIMIT 1`. Overview holding tree now aggregates **all** `xbos_legal_entity` rows in the `holding` partition and includes org units whose `legal_entity_id` matches **any** holding UUID (plus unlinked `NULL` units).

## Root cause

1. `listGroupOrgTreesForUser` used `LEFT JOIN … LIMIT 1` → only the first holding legal entity UUID was passed to `listOrgTreeByLegalEntity`.
2. FE `resolveDepartmentSaveContext` resolves holding UUID via `entity_type='holding'` (may differ from LIMIT 1 row when multiple holding legal entities exist in DB).
3. `listOrgTreeByLegalEntity` filtered `legal_entity_id = $1::uuid` (exact single UUID) → units linked to alternate holding UUIDs were excluded from overview tree JSON → FE hydrate blank after F5.

## Code changes

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/org-foundation/org-foundation.service.ts` | Query all holding legal entities (`company_id=holding`); pass UUID array to tree builder; `listOrgTreeByLegalEntity` uses `legal_entity_id = ANY($1::uuid[])`; `normalizeLegalEntityIds` helper |
| `apps/api/xbos-api/src/org-foundation/org-foundation.dept-tree-overview.integration.spec.ts` | **D-W4-DEPT-LEGAL-MATCH-01** regression: unit on alt holding UUID appears in overview; recursive query receives both primary + alt IDs |

## API contract (unchanged shape)

`GET /tenant-scope/group-org-overview` → `trees[]`:

| `tenantId` | Scope |
|------------|-------|
| `xbos-group-holding-root` | All holding-partition dept rows (any holding `legal_entity_id` + unlinked NULL on master main/holding) |
| `{legal-entity-uuid}` | Member pháp nhân dept rows |

## Verification

```text
cd apps/api/xbos-api
pnpm run test -- org-foundation.dept-tree-overview.integration.spec.ts  → 4/4 PASS
pnpm run test                                                         → 257/257 PASS (49 suites)
pnpm run build                                                        → PASS
```

Regression scenarios covered in spec:

- **D-W4-DEPT-OVERVIEW-01** — holding root + member trees non-empty
- **D-W4-DEPT-LEGAL-MATCH-01** — `QA-W4-PB-003` on alt holding UUID returned when primary UUID differs
- **D-W4-DEPT-RELOAD-01** — holding recursive query uses `['main','holding']` partitions + multi-UUID array

## Residual (not BE)

| ID | Owner | Note |
|----|-------|------|
| **D-W4-DEPT-DUP-SAVE-01** | dev-fe | Re-save existing code → HTTP 500; PUT/upsert UX |
| **D-W4-XBOS-STALE-RUNTIME-01** | devops/qa | Restart xbos-api after deploy (`node dist/main.js` not stale pre-W4 build) |
| Member head picker scope banner | GWC | Separate from J-XBOS-07 holding reload |

## Handoff

- **completion_report:** Closed BE slice of D-W4-DEPT-LEGAL-MATCH-01 + D-W4-DEPT-RELOAD-01. Holding overview tree aggregates all holding legal-entity UUIDs; saved units with non-primary holding UUID now included in GET overview. Full J-XBOS-07 PASS requires QA browser retest (F5 on Tập đoàn tab) + optional dev-fe dup-save fix.
- **next_owner:** **qa**
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-holding-be-fix-20260606.md`

### next_dispatch_prompt (qa)

```text
P1-XBOS-W4-DEPT-TREE — QA retest J-XBOS-07 holding F5 after BE holding UUID fix

Entry: docs/qa/evidence/p1-xbos-w4-dept-holding-be-fix-20260606.md (READY_FOR_QA)

Pre-check:
- Rebuild + restart xbos-api (pnpm run build && node dist/main.js or dev:xbos-api) — not stale dist
- pnpm run qc:dev-stack exit 0

Retest (ceo@xe.vn / Xevn@2026):
- URL: http://localhost:5173/command-center?settings=tenant_departments
- Tập đoàn tab: existing QA-W4-PB-* rows visible after F5 (no blank scaffold)
- Save QA-W4-PB-004 → F5 → row persists (D-W4-DEPT-RELOAD-01)
- API: GET group-org-overview → xbos-group-holding-root tree contains QA-W4-PB-* codes
- Member tab rows still PASS (X.E TM-DV)

J-*: J-XBOS-07 L2.5
Exit: PASS_TO_PM if holding F5 PASS; else FAIL with API JSON + screenshot
ack_status: PASS_TO_PM or FAIL_TO_PM
```
