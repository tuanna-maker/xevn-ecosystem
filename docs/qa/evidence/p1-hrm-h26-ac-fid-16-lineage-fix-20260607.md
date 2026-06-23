# Dev-BE — P1-HRM-H26-AC-FID-16-LINEAGE-FIX

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H26-AC-FID-16-LINEAGE-FIX` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **executed_at** | 2026-06-07 |
| **prior_fail** | `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-20260607.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` **AC-FID-16** · BR-LINK-03 |

## Verdict

**READY_FOR_QA** — BR-LINK-03 closed on all five pilot slugs. Distinct-code probe **40/40 PASS** (exit **0**). Row-level lineage **1.000** on contracts / insurance / attendance / leave_type for every slug.

## Root cause (confirmed)

Transactional columns stored Vietnamese labels or English enums instead of `synced_catalogs.payload.items[].code`. `job_titles` snapshot had only **4** codes vs **25** `UAT_ROLES`.

## Fix applied

| Area | Change |
|------|--------|
| **Snapshot** | `synced_catalogs.job_titles` expanded to **25** UAT role codes per slug (`holding`, `trsport`, `logistics`, `finance`, `services`) |
| **Contracts** | `employee_contracts.contract_type` migrated **1169** rows → `HDLD_*` / `HDTV_60` / `HDHV` keys |
| **Leave** | `leave_requests.leave_type` migrated **100** rows → `LVT_01`…`LVT_03` |
| **Recruitment** | `recruitment_candidates.source` migrated **99** rows → `CSO_01`…`CSO_04` |
| **Forward seeds** | `seed-hrm-contracts-density`, `seed-hrm-leave-density`, `seed-hrm-recruitment-density`, `seed-hrm-satellite-from-workforce` now write catalog **codes** |
| **XBOS defs** | `hrm-xbos-catalog-defs.mjs` `job_titles` uses full `UAT_ROLES` template |

## Artifacts

| Path | Purpose |
|------|---------|
| `scripts/lib/hrm-catalog-lineage.mjs` | Shared code maps + job title catalog builder |
| `scripts/seed-hrm-catalog-lineage-fix.mjs` | Idempotent migration/seed |
| `pnpm run seed:hrm:catalog-lineage-fix` | Package entry |

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Migration (1st run) | `pnpm run seed:hrm:catalog-lineage-fix` | contracts **1169**, leave **100**, candidates **99** updated |
| Idempotent (2nd run) | same | **0** row updates; job_titles **25**/slug |
| Distinct-code probe | `node ./scripts/tmp-p1-hrm-acfid16-lineage-probe.mjs` | **exit 0** — `=== AC-FID-16 PASS ===` |
| Probe JSON | `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-probe-20260607.json` | 5/5 slugs pass, 0 fail_probes |
| Row-level lineage | `node ./scripts/tmp-p1-hrm-acfid16-row-level.mjs` | all modules **lineage_pct: 1** |
| Menu density regression | `pnpm run verify:hrm:menu-density` | **11/11 PASS** |

### Row-level sample (post-fix)

| company_id | contracts | insurance job | attendance job | leave_type |
|------------|-----------|---------------|----------------|------------|
| holding | 1.000 | 1.000 | 1.000 | 1.000 |
| trsport | 1.000 | 1.000 | 1.000 | 1.000 |
| logistics | 1.000 | 1.000 | 1.000 | 1.000 |
| finance | 1.000 | 1.000 | 1.000 | 1.000 |
| services | 1.000 | 1.000 | 1.000 | 1.000 |

## Residual

| ID | Owner | Note |
|----|-------|------|
| AC-FID-15 | qa | UI fidelity — separate wave |
| `verify:hrm:catalog-lineage` gate | backlog | Optional menu-density add-on (not blocking this fix) |

## QA retest scope

1. Re-run both probe scripts on pilot DB (expect exit 0 / 100% lineage).
2. Spot-check HRM embed: contracts list shows `HDLD_*` keys; leave/recruitment filters resolve labels from catalog.
3. L2.5 J-* only if UI showed catalog-missing badges before fix.

---

**completion_report:** AC-FID-16 BR-LINK-03 fixed — expanded `job_titles` snapshot to 25 UAT roles × 5 slugs; migrated contract_type (1169), leave_type (100), candidate source (99) to synced catalog codes; updated forward seed scripts + XBOS defs. Probes exit 0; row-level lineage 100%; menu-density 11/11 unchanged.

**next_owner:** qa

**next_dispatch_prompt:** QA retest `P1-HRM-H26-AC-FID-16-LINEAGE`: run `node ./scripts/tmp-p1-hrm-acfid16-lineage-probe.mjs` (exit 0) + `node ./scripts/tmp-p1-hrm-acfid16-row-level.mjs` (all lineage_pct=1.000) on five slugs; confirm AC-FID-16 closable for QC final 15–16. Evidence baseline: `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-fix-20260607.md`.

**evidence_path:** `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-fix-20260607.md`

**pm_dispatch_hint:** Unblock `P1-HRM-FIDELITY-QC-FINAL-15-16` after QA PASS on AC-FID-16 probes.
