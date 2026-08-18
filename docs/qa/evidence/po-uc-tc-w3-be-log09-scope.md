# Evidence — PO-UC-TC-W3-BE-LOG09-SCOPE

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-BE-LOG09-SCOPE` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true |
| **change_mode** | FIX |
| **preserve_default** | true |
| **Leave L2** | **not touched** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **by-uc** | `docs/qa/professional/by-uc/XBOS-DM-LOG-09.md` |
| **QA residual** | `docs/qa/evidence/po-uc-tc-w3-qa-log09-r2.md` · `R-LOG09-R2-DEST-GET-SCOPE` |
| **prior BE** | `docs/qa/evidence/po-uc-tc-w3-be-log09.md` |
| **ADR** | `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §4 — config-sync uses `resolveXbosGroupLegalReadScopeContext` |
| **TechSpec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 |

### spec says / code did / code does

| Spec / QA | Before FIX | After FIX |
|-----------|------------|-----------|
| Group CEO clone-bundle → dest `logistics` | POST CFG-205 OK (dest not JWT-gated) | unchanged (must_keep) |
| Spot GET `…/catalog/log_dm_*?companyId=logistics` same persona | **409** `SCOPE_CONTEXT_MISMATCH` | **allow** → service `getCatalogForTarget(…, logistics)` |
| main/omitted → holding | OK | unchanged |
| Member CEO AUTH-003 on clone | OK | unchanged |
| Random company slug | 409 | still 409 |

---

## 2. Root cause

`GET /config-sync/catalog/:key` already called `resolveXbosGroupLegalReadScopeContext`, but that helper only aliased Group CEO JWT `main` → **`holding`** (or registry member tenants like `xe-du-lich`).

Request `tenantId=xevn&companyId=logistics` fell through to strict `resolveScopeContext` → **409** (`token=main` ≠ `request=logistics`).

Clone-bundle only resolves **source** via the helper; **dest** is body `destCompanyId` (not JWT-compared) — hence HP clone PASS while dest reload FAIL (list/clone vs GET parity gap).

---

## 3. Fix (minimal)

**File:** `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts`

- ADD `XBOS_GROUP_MEMBER_COMPANY_SLUGS` = `holding|trsport|logistics|finance|services` (ADR §4 / HRM parity).
- Group CEO + JWT `main` + master tenant request:
  - omitted / `main` → `holding` (unchanged)
  - member slug → **return that companyId** (enables LOG-09 dest verify)
  - unknown slug → still strict 409
- `@CODE-MEMORY` + CHANGE for `PO-UC-TC-W3-BE-LOG09-SCOPE`
- **must_keep:** clone-bundle CFG-205/009 · AUTH-003 · DM-09 single-key · apply-to-members · Leave L2

No OpenAPI / migration / publish write path change.

---

## 4. Verification

```text
pnpm --filter xbos-api exec jest --testPathPatterns=xbos-group-legal-scope.spec --testPathPatterns=config-sync.controller.spec --no-coverage
→ Test Suites: 2 passed · Tests: 44 passed

pnpm --filter xbos-api exec jest --testPathPatterns=config-sync.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 19 passed (clone-bundle must_keep)
```

New tests:

| Suite | Case |
|-------|------|
| `xbos-group-legal-scope.spec` | Group CEO `main` + `companyId=logistics` → `{xevn,logistics}` |
| `xbos-group-legal-scope.spec` | Group CEO `other-company` → SCOPE_CONTEXT_MISMATCH |
| `config-sync.controller.spec` | GET `log_dm_1` + `companyId=logistics` → service called with logistics |

---

## 5. Residuals

| ID | Note |
|----|------|
| Browser dest reload | QA retest only — «Tải lại khóa đích» after CFG-205 |
| UX-005 async | out of scope (P2 product) |

---

## 6. completion_report

**Closed:** Root cause documented; Group CEO catalog GET scope parity for GROUP_MEMBER slugs including `logistics`; jest regression 44+19; must_keep clone/auth/apply/DM-09/Leave L2; U65 no seed.

**Open:** Browser QA dest-reload retest.

| Field | Value |
|-------|--------|
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-uc-tc-w3-be-log09-scope.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: PASS_TO_PM

## CONTEXT
BE PO-UC-TC-W3-BE-LOG09-SCOPE READY_FOR_QA — Group CEO JWT main may GET
/api/xbos/config-sync/catalog/log_dm_*?tenantId=xevn&companyId=logistics
(no 409 SCOPE_CONTEXT_MISMATCH). Residual R-LOG09-R2-DEST-GET-SCOPE closed in BE.

## MISSION — dest reload only
1) Persona ceo@xe.vn · deep link ?settings=log_catalog_clone_bundle
2) If dest already has keys: skip full overwrite OR use existing CFG-205 state from prior wave
3) Click «Tải lại khóa đích (F5)» / spot GET — expect 2xx XBOS-CFG-201 + dest keys list non-empty (or keys from prior clone result panel)
4) Do NOT re-prove full HP overwrite / FD fail / AU unless smoke fails
5) Evidence: docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md
6) Update by-uc XBOS-DM-LOG-09 dest reload row

## CẤM
seed · invent Leave L2 · full LOG09 retest matrix beyond dest reload
```
