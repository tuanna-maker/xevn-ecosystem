# D-BE-ERP-E1B-ALIAS-KEYS-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `D-BE-ERP-E1B-ALIAS-KEYS-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **date** | 2026-07-28 |
| **change_mode** | ADD · preserve_default |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` | FR-HRM-SC-SET-UI-01 · BR-ALIAS · AC-SC-DEC-ALIAS-* |
| `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §3.2 | DEC dual-read; no DDL |
| `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md` §0–§7 | `resolveCatalogFamily` · pull try-list |
| `docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md` | storageKey prefer `hr_decision_types`; no new sync URL |

## Closed scope

1. **`resolveCatalogFamily` / `catalogAliasTryList` / E1-B allow-list** — `hrm-settings-master-keys.ts`
   - Families: pos_titles, org_depts, leave, **dec_types**, contract, emp_class, shift, grade, rec_channel, pay_nature, pay_comp (+ pay_tpl)
   - DEC: `{ hr_decision_types, decision_types }` · `storageKey = hr_decision_types`
   - SA alias unions: pay_types (+ component_types, pay_natures, salary_component_types); recruitment_channels (+ candidate_sources, channels)
   - **Cấm** `work_shifts` as catalog alias (no dual-write)

2. **GET / assert family merge** — `settings-catalogs.service.ts`
   - `getEffectiveItemsForKey` merges all alias L1+L2a
   - Overview dual keys share identical `effectiveItems` + `aliases` / `familyId`
   - `listPickerItems` returns `catalog_key` = resolved storage + `aliases`
   - `assertCodeInEffectiveCatalog` → family merge (Decisions via `HRM_SC_DEC_KEY` sees live `hr_decision_types`)
   - Write/delete/removal resolve storageKey for E1-B families; non-MD keys (employee fields) unchanged

3. **Pull alias try-list** — `catalog-sync.service.ts`
   - `pullCatalogFromXbos` tries `[storageKey, ...aliases]`; stores under actual remote key; `resolvedFrom`
   - `getSyncedCatalog` alias-aware; `getSyncedCatalogExact` for family merge
   - **No** new sync URL

4. **CODE-MEMORY APPEND** on master-keys, settings-catalogs.service, catalog-sync.service, decisions.service

5. **Jest** — `d-be-erp-e1b-alias-keys-01.spec.ts` + regression suites

## Forbidden (verified not done)

| Forbidden | Status |
|-----------|--------|
| Migration rename `hr_decision_types` | Not applied |
| Invent L0 in HRM | Not done |
| Seed | Not run |
| New sync URL | Reused pull + sync-from-xbos |
| `work_shifts` dual-write | Not aliased |

## Verification

```bash
pnpm --filter hrm-api exec jest --runInBand \
  src/settings-catalogs/d-be-erp-e1b-alias-keys-01.spec.ts \
  src/settings-catalogs/settings-catalogs.service.spec.ts \
  src/catalog-sync/catalog-sync.controller.spec.ts \
  src/settings-catalogs/d-hrm-set-item-persist-01.spec.ts
```

**Result:** 4 suites · **30/30 PASS** · exit 0

### Jest coverage (E1-B)

| Case | Result |
|------|--------|
| resolveCatalogFamily DEC dual → `dec_types` / storage `hr_decision_types` | PASS |
| try-list prefers `hr_decision_types` | PASS |
| ≥10 E1-B families; `work_shifts` not alias | PASS |
| GET items via `decision_types` merges live `hr_decision_types` (3 items) | PASS |
| assert via `decision_types` accepts code from `hr_decision_types` | PASS |
| listPickerItems storageKey + aliases | PASS |
| pull `decision_types` → store `hr_decision_types` + `resolvedFrom` | PASS |
| getSyncedCatalog alias hit | PASS |
| all aliases miss → `HRM-SYNC-002` | PASS |

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` | Family registry + resolver |
| `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts` | Merge / write / overview |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | Pull/get try-list |
| `apps/api/hrm-api/src/decisions/decisions.service.ts` | CODE-MEMORY APPEND only |
| `apps/api/hrm-api/src/settings-catalogs/d-be-erp-e1b-alias-keys-01.spec.ts` | New |
| `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.spec.ts` | Mock exact sync |

## Residual / not promoted

| Item | Owner |
|------|-------|
| FE MasterDataSettingsPanel ≥10 buckets + DEC keys both | `D-FE-ERP-E1B-MD-PANEL-01` |
| Browser U65 AC-SET-UI-05 / AC-SC-DEC-ALIAS-* | QA |
| OpenAPI yaml refresh (optional) | later BE |
| Consumer FREE_TEXT bind beyond DEC assert | E1-A |
| SA-P1-SHIFTS-SOT (`work_shifts` ↔ `shifts`) | governance HOLD |

## Handoff

```yaml
work_item_id: D-BE-ERP-E1B-ALIAS-KEYS-01
from_role: dev-be
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md
entry_criteria: L0 stack; U65 zero-seed; SA DESIGN READY
exit_criteria: >
  Browser or API probe: GET settings-catalogs/{decision_types}/items sees
  hr_decision_types L1 items; pull decision_types resolves; assert DEC OK;
  no regression POS/LEAVE; matrix AC-SC-DEC-ALIAS-* / AC-SET-UI-05
```

## Completion contract

- **completion_report:** E1-B BE alias keys closed — `resolveCatalogFamily`, DEC family merge GET/assert, pull try-list, E1-B master allow-list, jest 30/30. No migration/seed/new sync URL/work_shifts dual-write.
- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md`
- **next_dispatch_prompt:** |
    work_item_id: QA-ERP-E1B-ALIAS-KEYS-01
    from_role: pm
    to_role: qa
    lane: execution E1-B
    read_first:
      - docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md
      - docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md §0 §2 §7
      - docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md AC-SET-UI-05 · AC-SC-DEC-ALIAS-*
    entry_criteria: L0 PASS; U65 zero-seed; BE READY_FOR_QA
    exit_criteria: >
      GET …/settings-catalogs/decision_types/items (or overview) shows items when
      only hr_decision_types L1 has data; POST catalog-sync/pull/decision_types
      stores/resolves hr_decision_types; Decisions assert not MISS; POS/LEAVE
      regression OK; evidence browser or Network; PASS_TO_PM
    evidence_path: docs/qa/evidence/qa-erp-e1b-alias-keys-01-20260728.md
    cấm: seed; invent L0; claim UF 🟢 on probe-only without FE when FE wave also in scope
