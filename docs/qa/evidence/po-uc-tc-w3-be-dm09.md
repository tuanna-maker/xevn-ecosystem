# Evidence — PO-UC-TC-W3-BE-DM09 · XBOS-DM-09 clone catalog

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-BE-DM09` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **change_mode** | ADD |

---

## spec_read_ack

| Artifact | Sections / notes |
|----------|------------------|
| **srs** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 85 · `XBOS-DM-09` Sao chép bộ danh mục · by-uc Caps/FNs/TCs |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog publish/pull pattern · M01 config-sync |
| **db_design** | Reuse `config_catalogs` + `config_catalog_items` partition `(tenant_id, company_id, catalog_key)` — no new tables |
| **api_design** | OpenAPI `docs/api/openapi/xbos-api.yaml` · `POST /config-sync/catalog/{catalogKey}/clone` · `CloneCatalogBody` |
| **uc_ids** | `XBOS-DM-09` |
| **training** | `PO_PM_SENIOR_TRAINING_PACK_20260804.md` §5 Dev-BE |

---

## Spec says / code does

| Spec says | Code does (before) | Code does (after) |
|-----------|--------------------|-------------------|
| Sao chép bộ danh mục sang đích; dest độc lập | **GAP** — no dedicated clone; publish loosely claimed DM-09 in controller.spec; `apply-to-members` = DM-HRM-07 overwrite fan-out | `POST …/catalog/:catalogKey/clone` → `cloneCatalog` → `publishCatalog(dest)` |
| FD dest trùng mã → 4xx | apply-to-members **upserts** (no reject) | Default `onConflict=reject` → **`XBOS-CFG-409`** overlapping codes |
| AU member / sai CT → 403/409 | apply uses internal auth only | `assertCatalogCloneActor` → member JWT **`XBOS-AUTH-003`** |
| Self-copy invalid | apply has `XBOS-VAL-012` | Clone self → **`XBOS-VAL-013`** |
| must_keep publish/pull/approve | — | Untouched; clone reuses publish only |

**Not inventing:** Does not claim apply-to-members = DM-09 PASS. Bundle clone (`POST …/catalogs/clone-bundle`, LOG-09) remains separate (`XBOS-CFG-205`).

---

## Implementation

| Path | Change |
|------|--------|
| `apps/api/xbos-api/src/config-sync/dto/clone-catalog.dto.ts` | ADD DTO |
| `apps/api/xbos-api/src/config-sync/config-sync.service.ts` | ADD `cloneCatalog` + `findDestOverlappingCodes` · CODE-MEMORY APPEND |
| `apps/api/xbos-api/src/config-sync/config-sync.controller.ts` | ADD `POST catalog/:catalogKey/clone` → `XBOS-CFG-206` |
| `apps/api/xbos-api/src/config-sync/*.spec.ts` | ADD HP/FD/self + controller AU |
| `docs/api/openapi/xbos-api.yaml` | ADD clone + clone-bundle contracts |
| `docs/qa/professional/by-uc/XBOS-DM-09.md` | `code_readiness` → **LIKELY_PARTIAL** |

### Contract (stable codes)

| Code | When |
|------|------|
| `XBOS-CFG-206` | Clone OK |
| `XBOS-CFG-409` | Dest overlapping item codes (`reject`) |
| `XBOS-VAL-013` | Dest == source |
| `XBOS-VAL-005` | Empty source items |
| `XBOS-CFG-001` | Source catalog missing |
| `XBOS-AUTH-001` | No auth |
| `XBOS-AUTH-003` | Member JWT clone |

```http
POST /api/xbos/config-sync/catalog/job_titles/clone
Authorization: Bearer <group_ceo>
X-Internal-Api-Key: <key>
Content-Type: application/json

{
  "tenantId": "xevn",
  "companyId": "holding",
  "destTenantId": "xe-du-lich",
  "destCompanyId": "main",
  "onConflict": "reject",
  "actor": "ceo@xe.vn"
}
```

---

## Verification

```text
pnpm --filter xbos-api exec jest --testPathPatterns="config-sync.service.spec|config-sync.controller.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 42 passed · EXIT 0
```

| Case | Layer | Result |
|------|-------|--------|
| TC-DM09-CPY-HP-001 | jest service+controller | PASS |
| TC-DM09-CPY-FD-001 | jest service CFG-409 | PASS |
| TC-DM09-CPY-AU-001 | jest controller AUTH-003 | PASS |
| Self-copy VAL-013 | jest service | PASS |
| U65 browser FE | — | **deferred QA** (no seed) |

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| R-DM09-FE-WIRE | FE may still only expose Apply-to-members wizard — wire `POST …/clone` or document HDSD path | qa → (dev-fe if GAP UI) |
| R-DM09-U65 | Browser HP/FD/AU per by-uc; no seed | qa |

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W3-BE-DM09
uc_id: XBOS-DM-09
evidence_path: docs/qa/evidence/po-uc-tc-w3-be-dm09.md
next_owner: qa
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W3-QA-DM09
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
hdsd_align: true

entry_criteria:
  - BE READY_FOR_QA evidence docs/qa/evidence/po-uc-tc-w3-be-dm09.md
  - L0 stack up (xbos-api + portal) — no seed
  - by-uc docs/qa/professional/by-uc/XBOS-DM-09.md TC pack only (10 cases) — not full inventory

exit_criteria:
  - Retest TC-DM09-CPY-HP-001 / FD-001 / AU-001 via API and/or browser FE if button exists
  - API: POST /api/xbos/config-sync/catalog/{key}/clone → XBOS-CFG-206; conflict → XBOS-CFG-409; member → XBOS-AUTH-003
  - FE: if no Sao chép wired to clone → 🟡 BLOCKED UI residual (not invent PASS); do not use apply-to-members as DM-09 PASS
  - Update by-uc Dev8088 / execution notes; evidence docs/qa/evidence/po-uc-tc-w3-qa-dm09.md
  - cấm: pnpm seed:* · API fake inbox · claim 🟢 without FE/API path evidence

persona: ceo@xe.vn / Xevn@2026 (HP); du-lich.ceo@xe.vn (AU)
spec_ref: XBOS-DM-09 · TECHSPEC_HE §8.1 · OpenAPI configSyncCloneCatalog
```
