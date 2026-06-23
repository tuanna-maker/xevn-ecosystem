# P1-FIX-RACI-SEED-02 — W5B probe CELL-PUT (member matrix seed-* → DB UUID)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-FIX-RACI-SEED-02 |
| **date** | 2026-05-26 |
| **owner** | Dev-BE (+ PM probe script) |
| **ack_status** | **READY_FOR_QA** |

## Root cause

Member legal-entity matrix resolved partition tenant (`xe-du-lich`, …) with **no** `raci_activity_catalog` rows → `listCatalogRows` fell back to JSON → `activity_id=seed-BQT-001`. Catalog GET under group JWT used `xevn` and returned DB UUIDs. CELL-PUT with `seed-*` correctly returns **503** `XBOS-RACI-503`.

## Fix (BE)

- `raci-governance.service.ts`: catalog lookup uses **master tenant** (`MASTER_TENANT_ID` / `xevn`) for all partitions; legacy `company_raci_matrix_cell.activity_id` values `seed-{activity_code}` remap to catalog UUID on read.
- `ensureSeedCatalogLoaded`: bootstrap tenant aligned to `MASTER_TENANT_ID` (was `xe-vietnam`).
- `raci-governance.service.spec.ts`: member matrix UUID + seed override remap + 503 guard.

## Probe (PM)

- `scripts/tmp-p1-close-qa-w5b-raci-probes.mjs`: CELL-PUT picks first catalog activity with non-`seed-*` id (belt-and-suspenders).

## Verify (Dev-BE 2026-05-26)

| Check | Result |
|-------|--------|
| `pnpm --filter xbos-api test -- raci-governance` | **8/8 PASS** |
| Member matrix `f01bb8dc-…` first `activity_id` | **UUID** (0 `seed-*` rows) |
| Member CELL-PUT first row | **200** `XBOS-RACI-201` |
| `node scripts/tmp-p1-close-qa-w5b-raci-probes.mjs` | **9/9 PASS** (exit 0) |

```bash
pnpm --filter xbos-api test -- raci-governance
node scripts/tmp-p1-close-qa-w5b-raci-probes.mjs
```

## Handoff

```yaml
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/p1-fix-raci-seed-02-20260526.md
pm_dispatch_hint: QA retest W5B bundle 9/9; optional full xbos-api jest regression.
```
