# BE-XBOS-OA-RACI-CC-01 — OpenAPI F.1 deepen (RACI + CC catalogs)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-RACI-CC-01` |
| **aliases** | `BE-XBOS-OA-RACI-GOVERNANCE-01` + `BE-XBOS-OA-CC-CATALOGS-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution · OpenAPI deepen only |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD/UPGRADE OpenAPI · preserve_default |
| **ack_status** | **READY_FOR_QA** |
| **gaps closed** | **G-OA-W2-RACI-01** · **G-OA-W2-CC-CAT-01** · **G-DTO-W2-CC-CAT-01** (components) |

---

## 1. spec_read_ack

| Layer | Cite |
|-------|------|
| **srs** | `SRS_XBOS_KHACH.md` §3.13 FR-XBOS-RACI-02 Diễn biến #1–8 · §3.15 FR-CC-P0-05 Diễn biến #1–7 · UF-XBOS-07/14 |
| **tech_spec** | `docs/xbos/TECHSPEC.md` §14.14–14.16 · residual §14.13 |
| **db_design** | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` Endpoints A–D · H–I (F.1 Mục đích · Nghiệp vụ · Bước SRS) |
| **SA packet** | `docs/qa/evidence/sa-u71-xbos-raci-rbac-design-01-20260727.md` |
| **runtime SoT** | `RaciGovernanceController` · `BusinessMasterController` / `COMMAND_CENTER_CATALOG_KINDS` |
| **OpenAPI SoT** | `docs/api/openapi/xbos-api.yaml` `info.version` **1.2.6-p1-s2** |

**spec says / code does:** U71 F.1 requires OpenAPI paths for `raci-governance/*` + CC kinds enum/examples aligned to API_DESIGN. Runtime already implements UF-07/14 🟢 — this wave **documents only** (no merge/scope/autosave behavior change).

**must_keep:** UF-XBOS-07/13/14 🟢 · catalog-gov publish ≠ CC autosave · workflow soft assignment · U65 zero-seed.

---

## 2. Paths changed

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | UPGRADE F.1 descriptions (Mục đích/Nghiệp vụ/Bước SRS) for RACI A–D + CC H–I; examples catalog/matrix/cell + CC partition/flat/empty; ItemId examples; `CommandCenterCatalogKind` examples; version **1.2.6-p1-s2** |
| `scripts/verify-openapi-m01.mjs` | ADD needles: raci operationIds, CommandCenterCatalogKind, G-OA-W2-* |
| `scripts/verify-openapi-p1-s2.mjs` | Accept `1.2.x-p1-s2`; ADD RACI + CC kind needles |
| `apps/api/xbos-api/src/raci-governance/raci-governance.controller.ts` | ADD `@CODE-MEMORY` + CHANGE (spec_read_ack db+api) — **no logic change** |
| `apps/api/xbos-api/src/business-master/business-master.controller.ts` | ADD `@CODE-MEMORY` + CHANGE — **no logic change** |
| `docs/xbos/TECHSPEC.md` | Mark G-OA-W2-RACI-01 / G-OA-W2-CC-CAT-01 / G-DTO-W2-CC-CAT-01 **CLOSED**; FR rows ALIGNED |
| `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` | §11 residual CLOSED; OpenAPI header ALIGNED |
| `docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md` | this evidence |

**Not touched:** seed · FE · catalog-gov/WF designs wipe · matrix merge semantics · position-rbac DTO depth (P2 residual).

---

## 3. OpenAPI coverage checklist

| Endpoint (API_DESIGN) | operationId | F.1 in description | Examples |
|----------------------|-------------|--------------------|----------|
| A GET catalog | `raciGovernanceListCatalog` | ✅ | ✅ |
| B GET matrix | `raciGovernanceGetCompanyMatrix` | ✅ | ✅ |
| C PUT cell | `raciGovernanceUpsertMatrixCell` | ✅ | ✅ upsert + clear |
| D capabilities / coverage | `raciGovernanceListCapabilities` / `GetCoverage` | ✅ | — |
| H GET CC items | `businessMasterListItems` (domain=command_center_catalogs) | ✅ | ✅ partition + empty |
| I PUT CC autosave | `businessMasterUpsertItem` | ✅ | ✅ 3 partitions + flat |
| Kind enum | `CommandCenterCatalogKind` | ✅ | regulations\|measurements\|pricing |

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/xbos-api.yaml
exit 0

pnpm run verify:openapi-p1-s2
→ PASS verify-openapi-p1-s2 …/xbos-api.yaml
exit 0

pnpm -C apps/api/xbos-api exec jest --testPathPatterns=raci-governance --no-coverage
→ Test Suites: 2 passed · Tests: 11 passed
exit 0
```

---

## 5. Residual

| Item | Owner | Priority |
|------|-------|----------|
| Nest class-validator `UpsertRaciMatrixCellRequest` at edge | `dev-be` | P2 G-DTO-W2-RACI-01 |
| OpenAPI `PermissionMatrixRow` depth | `dev-be` | P2 G-DTO-W2-POS-01 |
| QA spot OpenAPI/contract smoke | `qa` | this handoff |

---

## 6. Handoff

### completion_report

**Closed:** Combined OpenAPI deepen for RACI governance (Endpoints A–D) + CC catalog kinds (H–I) against U71 API_DESIGN F.1; verify-openapi-m01 + p1-s2 gates extended; CODE-MEMORY APPEND on RACI + business-master controllers; TECHSPEC/API_DESIGN residual CLOSED for G-OA-W2-RACI-01 / G-OA-W2-CC-CAT-01. **No runtime contract break** — UF-07/14 must_keep.

**Residual:** class-validator RACI cell P2; POS matrix DTO P2; QA spot-verify yaml.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-RACI-CC-01
role: qa
lane: execution · OpenAPI/contract spot (browser not required for yaml-only)
entry_criteria:
  - read docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md
  - docs/api/openapi/xbos-api.yaml version 1.2.6-p1-s2
  - API_DESIGN_XBOS_RACI_RBAC.md Endpoints A–D · H–I
exit_criteria:
  - Confirm paths: /raci-governance/catalog|matrix|matrix/cell|capabilities|coverage
  - Confirm CommandCenterCatalogKind enum regulations|measurements|pricing + examples
  - pnpm run verify:openapi-m01 && pnpm run verify:openapi-p1-s2 exit 0
  - must_keep: no claim UF-07/14 regression without browser (yaml-only PASS ≠ FE mutate)
  - PASS_TO_PM or FAIL with residual
evidence_path: docs/qa/evidence/qa-xbos-oa-raci-cc-20260727.md
cấm: seed; mutate runtime to force OA pass
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md`

### pm_dispatch_hint

`QA-XBOS-OA-RACI-CC-01` — spot OpenAPI F.1 RACI+CC; then optional `BE-XBOS-OA-POS-MATRIX-DTO-01` (P2) or class-validator RACI cell.
