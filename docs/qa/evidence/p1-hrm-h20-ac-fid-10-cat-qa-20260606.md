# QA — P1-HRM-H20-AC-FID-10-CAT retest (synced catalogs per pilot company)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H20-AC-FID-10-CAT-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h20-ac-fid-10-cat-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-10 · settings catalogs |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **8/8 PASS** (`catalog-fidelity`: all five UAT slugs **74** distinct keys ≥ **8**); independent AC-FID-10 SQL probe **PASS** all slugs; L0 stack exit 0; `GET /api/hrm/settings-catalogs?company_id=` **200** `HRM-SET-200` for **main** + four member slugs — **76** catalogs each, no **409**.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| xbos-api | `http://127.0.0.1:28002` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | Group CEO — `main` + member slugs |
| DB | `xevn_hrm` via deploy env |

## L0 — Stack + density gates

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |
| Menu density | `pnpm run verify:hrm:menu-density` | **exit 0** — **8/8 PASS** |

### catalog-fidelity line (QA session)

```
PASS  catalog-fidelity  synced_catalog_keys need>=8/company (holding=74, trsport=74, logistics=74, finance=74, services=74)
=== Summary: 8/8 PASS ===
```

**Member slug uplift vs prior baseline:** trsport/logistics/finance/services **0 → 74** keys (296-row seed per dev evidence).

## AC-FID-10 — Per-company distinct catalog_key ≥ 8

Probe: `node ./scripts/tmp-p1-hrm-h20-cat-qa-probe.mjs` (inline SQL)

| company_id | distinct_keys (DB) | target | Result |
|------------|-------------------|--------|--------|
| **holding** | **74** | ≥ **8** | **PASS** |
| **trsport** | **74** | ≥ **8** | **PASS** |
| **logistics** | **74** | ≥ **8** | **PASS** |
| **finance** | **74** | ≥ **8** | **PASS** |
| **services** | **74** | ≥ **8** | **PASS** |

## L2 — Settings catalogs API (P-CC settings / HRM embed)

| query_company_id | API | HTTP | Code | catalog_count | 409 | Result |
|------------------|-----|------|------|---------------|-----|--------|
| **main** (holding) | `GET /api/hrm/settings-catalogs?company_id=main` | **200** | HRM-SET-200 | **76** | none | **PASS** |
| **trsport** | `GET /api/hrm/settings-catalogs?company_id=trsport` | **200** | HRM-SET-200 | **76** | none | **PASS** |
| **logistics** | `GET /api/hrm/settings-catalogs?company_id=logistics` | **200** | HRM-SET-200 | **76** | none | **PASS** |
| **finance** | `GET /api/hrm/settings-catalogs?company_id=finance` | **200** | HRM-SET-200 | **76** | none | **PASS** |
| **services** | `GET /api/hrm/settings-catalogs?company_id=services` | **200** | HRM-SET-200 | **76** | none | **PASS** |

**Note:** API overview count (**76**) includes extension/merged catalog entries vs DB `synced_catalogs` distinct keys (**74**) — both exceed AC-FID-10 threshold **≥ 8**.

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-10** catalog keys per slug | member slugs **0** keys | **CLOSED** (all five slugs **74** DB / **76** API) |
| **menu-density catalog-fidelity** | not in 7/7 gate | **PASS** at **8/8** |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| **AC-FID-11+** | backlog | Metadata change requests / ops tasks — separate waves |
| Import side-effect | dev-be | `seed-hrm-catalog-density.mjs` runs `main()` on import — probe avoids import (GWC noisy stdout) |
| Browser settings iframe | qa | API L2 PASS; full CC settings tab iframe not re-run |

---

**completion_report:** **AC-FID-10 catalog density wave CLOSED** — all five UAT slugs **74** distinct `catalog_key` in DB (≥ **8**); global menu-density **8/8** (`catalog-fidelity` gate); L0 stack exit 0; settings-catalogs API **200** for main + four member slugs (**76** catalogs each), no **409**. Residual: browser iframe GWC; AC-FID-11+ backlog.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H20-AC-FID-10-CAT-QA` PASS_TO_PM — mark AC-FID-10 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; with H19 PASS closes AC-FID-09+10 pair; dispatch **qc** narrow fidelity batch re-gate (AC-FID-04..10) or next AC-FID-11 wave per backlog.

**evidence_path:** `docs/qa/evidence/p1-hrm-h20-ac-fid-10-cat-qa-20260606.md`

**pm_dispatch_hint:** Member CEO settings tab should now show catalogs — member-slug API probe confirms non-empty; optional du-lich.ceo browser spot deferred.
