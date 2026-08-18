# D-HRM-SETTINGS-MD-POS-SEED-BE-01 — Retire G-ORPH-BE-03 hardcode SoT

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-be |
| **work_item_id** | `D-HRM-SETTINGS-MD-POS-SEED-BE-01` |
| **QA orphan** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` G-ORPH-BE-03 |
| **BA** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` FR-HRM-SC-MD-01/02 · GAP-MD-01 |
| **change_mode** | UPGRADE |
| **U65** | zero-seed for UAT · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **must_keep** | LE company-col 🟢 · RBAC scope · empty honesty |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Problem

Dual SoT: Settings/XBOS `job_titles` + `departments*|positions` path vs live hardcode registry
`tenant-position-catalog.ts` (`departments[]` + `positionsByDept`) writable via
`POST …/settings-catalogs/seed/tenant-position-catalog*` and embedded into
`seedEmployeeProfileTemplate` → AC-SET-FS-01 FAIL / G-ORPH-BE-03 LIVE.

## 2. Fix (runtime SoT)

| Path | Behaviour after fix |
|------|---------------------|
| Picker / `assertCodeInEffectiveCatalog` / employees `job_title_key` | Unchanged — **XBOS snapshot + HRM extension** via `getEffectiveItemsForKey` (`job_titles`, …) |
| `POST seed/tenant-position-catalog` (+ `-all`) | **403** `HRM-CAT-POS-SEED-FORBIDDEN` unless `HRM_ALLOW_TENANT_POSITION_SEED=1`; **409** `HRM-CAT-POS-SEED-SOT-EXISTS` if any active POS master items already present |
| `seedEmployeeProfileTemplate` | Department/position field defs = **empty** `select:` (honest empty) — **no** hardcode embed |
| Registry file | Kept as **bootstrap-only** data + CODE-MEMORY; not runtime SoT |
| Script `scripts/seed-tenant-position-catalog.mjs` | Header documents bootstrap + env gate |

### Production SoT (normative)

1. XBOS publish → HRM `sync-from-xbos` / `catalog-sync/pull/:key` for `job_titles`, `departments`, `department_catalog`, `org_departments`, `positions`
2. Optional company extension via Settings approval queue
3. Consumers persist **catalog codes** (VAL-SET-MD-01)

### Remaining bootstrap-only

- File `apps/api/hrm-api/src/settings-catalogs/tenant-position-catalog.ts` + gated seed endpoints
- Only when sponsor explicit bootstrap-dev: set `HRM_ALLOW_TENANT_POSITION_SEED=1` **and** POS catalogs empty
- **Never** for UAT evidence (U65)

## 3. Files

- `tenant-position-catalog.ts` — BOOTSTRAP-ONLY CODE-MEMORY; `isTenantPositionSeedEnvAllowed`; `buildEmptyPositionFieldDefs`
- `settings-catalogs.service.ts` — gate + profile template empty defs; `countActivePosMasterItems`
- `settings-catalogs.controller.ts` — CODE-MEMORY CHANGE
- `be-hrm-settings-md-pos-seed-01.spec.ts` — new
- `scripts/seed-tenant-position-catalog.mjs` — bootstrap docs

## 4. Verification

| Check | Result |
|-------|--------|
| jest `be-hrm-settings-md-pos-seed-01` | **8/8 PASS** |
| jest settings-catalogs + persist suite | **57/57 PASS** |
| `tsc --noEmit -p tsconfig.build.json` | **exit 0** |
| `pnpm seed:*` / UAT seed | **none** (U65) |
| Deploy / :8088 | **HOLD** |

## 5. Residual

- Historical rows already written into `hrm_employee_basic_fields` unit `select:…` from past seeds are **not wiped** (cấm wipe employee data). QA: verify picker uses `job_titles`/departments effectiveItems; optional ops cleanup of stale extension unit strings is out of this WI.
- FE leave bootstrap / JT free-text / other G-ORPH rows — separate WI.
- Browser UF Settings retest: `QA-HRM-SETTINGS-MASTER-DATA-02` (G-ORPH-BE-03 expect CLOSED / bootstrap-gated).

## 6. Handoff

- **next_owner:** `qa`
- **ack_status:** READY_FOR_QA
- **next_dispatch_prompt:** see completion packet below
