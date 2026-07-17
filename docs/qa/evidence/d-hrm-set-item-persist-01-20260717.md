# D-HRM-SET-ITEM-PERSIST-01 — Settings catalog item write/read partition parity

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-SET-ITEM-PERSIST-01` |
| **date** | 2026-07-17 |
| **owner** | dev-be |
| **entry** | QA FAIL `docs/qa/evidence/p1-hrm-menu-settings-retest-20260717.md` — POST items 201 / overview missing item |
| **spec_ref** | HRM-SC-03 · UF-HRM-10 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · `docs/hrm/TECHSPEC.md` §11.4 |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` | HRM-SC-03 — Bổ sung giá trị danh mục mở rộng |
| `docs/hrm/TECHSPEC.md` | §11.4 Catalog → form (`GET settings-catalogs` → `effectiveItems`) |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | Settings · `hrm_catalog_extension_items` |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-HRM-10 |
| `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` | `main` ↔ `holding` catalog partition |
| Code | `resolveHrmSettingsCatalogCompanyId` · overview / sync / `:catalogKey/extension-items` already mapped |

**spec says:** Group CEO portal `company_id=main` reads/writes HRM extension catalogs under holding partition; overview must merge XBOS snapshot + `hrm_catalog_extension_items`.

**code did (bug):** `GET /settings-catalogs` + `sync-from-xbos` + `POST :catalogKey/extension-items` used `resolveHrmSettingsCatalogCompanyId` (`main`→`holding`). `POST/PATCH/DELETE /settings-catalogs/items` passed raw `body.company_id=main` into INSERT → rows orphaned under `company_id=main` while overview SELECT used `holding`.

---

## Root cause

Write/read **scope parity** gap on the FE mutate route used by UF-HRM-10:

| Path | Before | After |
|------|--------|-------|
| `GET /` overview | `holding` | `holding` (unchanged) |
| `POST sync-from-xbos` | `holding` | `holding` (unchanged) |
| `POST :catalogKey/extension-items` | `holding` | `holding` (unchanged) |
| `POST/PATCH/DELETE /items` | **`main` (bug)** | **`holding`** |

Symptom matched QA: `upserted:1` + empty `hrmExtensionItems` + ACM_01 label still XBOS.

---

## Fix

`settings-catalogs.controller.ts`:

- Helper `resolveCatalogMutationCompanyId` → same `resolveHrmSettingsCatalogCompanyId` as overview/sync.
- `createCatalogItem` / `updateCatalogItem` / `deleteCatalogItem` rewrite `company_id` to catalog partition before service upsert/delete.
- Member tenant `xe-du-lich` + `main` stays `main` (resolver unchanged).
- XBOS sync path untouched.

---

## Tests

```text
pnpm exec jest --testPathPatterns="settings-catalogs.controller|d-hrm-set-item-persist-01|p1-web-acceptance-extension|settings-catalogs.service.spec" --no-coverage
→ Test Suites: 4 passed · Tests: 44 passed
```

New: `apps/api/hrm-api/src/settings-catalogs/d-hrm-set-item-persist-01.spec.ts`

- create under `holding` → overview `hrmExtensionItems` + `effectiveItems` include row (+ XBOS ACM_01)
- edit ACM_01 under `holding` → effective label override
- orphan write to `main` invisible on overview `holding` (documents pre-fix bug)
- controller: JWT/group CEO `main` → upsert `company_id=holding`; member tenant stays `main`

---

## Residual

- Orphan rows already written under `company_id=main` on :8088 (QAFE*/ADDR*) remain orphan until optional cleanup — **not** auto-migrated this wave (U65 no seed; ops/SQL optional).
- QA must redeploy/restart hrm-api on target env before browser retest.
- XBOS sync optional re-run not required for this defect.

---

## Handoff

- **completion_report:** Closed write/read partition mismatch for `/settings-catalogs/items`. Create+edit now persist to same `holding` partition overview reads. Jest 44/44 PASS. XBOS sync path unchanged.
- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/d-hrm-set-item-persist-01-20260717.md`

### next_dispatch_prompt

```text
work_item_id: D-HRM-SET-ITEM-PERSIST-01
to_role: qa
entry_criteria: BE READY_FOR_QA — docs/qa/evidence/d-hrm-set-item-persist-01-20260717.md; hrm-api restarted/redeployed on :8088 with items main→holding fix.
exit_criteria: U65 browser UF-HRM-10 — ceo@xe.vn → /hr/settings-catalogs → Thêm mục (new key) → POST 201 → FE shows row → F5 still present; edit ACM_* label → F5 shows new label; GET overview hrmExtensionItems / effectiveItems include item. No seed. Update USER_FLOW_OPERABILITY_MATRIX UF-HRM-10. Evidence docs/qa/evidence/d-hrm-set-item-persist-01-qa-retest-*.md
spec_ref: HRM-SC-03 · UF-HRM-10
cấm: pnpm seed:* · API fake · DB insert to pass
```
