# QA-XBOS-OA-CC-CAT-01 — OpenAPI G-OA-W2-CC-CAT-01 spot verify

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-CC-CAT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **entry** | `docs/qa/evidence/be-xbos-oa-cc-cat-01-20260722.md` |
| **gap closed** | **G-OA-W2-CC-CAT-01** + **G-DTO-W2-CC-CAT-01** (TechSpec §14.16 FR-CC-P0-05 — `command_center_catalogs` kinds + row schemas) |
| **scope** | yaml spot ≤5 + verify gate + read-only runtime kinds parity — **no** FE mutate, seed, RACI reopen, Phase1/PROD |

> **ID SoT:** TechSpec §14.16 **FR-CC-P0-05** · SA W2 `G-OA-W2-CC-CAT-01`. **RACI yaml** = **must_keep** — **not reopened**.

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | Domain enum `command_center_catalogs` | **PASS** |
| 2 | kinds + `Cc*Row` schemas | **PASS** |
| 3 | RACI must_keep still present | **PASS** |
| 4 | `pnpm verify:openapi-m01` exit 0 | **PASS** |
| 5 | Evidence this path · `PASS_TO_PM` | **PASS** |

## 2. OpenAPI yaml confirmation

**SoT:** `docs/api/openapi/xbos-api.yaml` (`info.version` `1.2.5-p1-s2`)

### 2.1 Domain enum (`command_center_catalogs`)

| Marker | Present |
|--------|---------|
| `Domain.schema.enum` includes `command_center_catalogs` | yes (~L89) |
| Description cites FR-CC-P0-05 / UF-XBOS-14 + partition kinds | yes (~L77–78) |
| `ItemId` documents partition kinds vs flat business-key upsert | yes (~L103–105) |
| `G-OA-W2-CC-CAT-01` / `G-DTO-W2-CC-CAT-01` in `info.description` | yes (L14) |

### 2.2 kinds + Cc*Row schemas (G-DTO-W2-CC-CAT-01)

| Schema | Present | Notes |
|--------|---------|-------|
| `CommandCenterCatalogKind` | yes (~L489) | enum `[regulations, measurements, pricing]` |
| `CcRegulationRow` | yes (~L495) | required `code`, `title`; optional version/active/category |
| `CcMeasurementRow` | yes (~L508) | required `key`, `unit`, `currency`, `precision` |
| `CcPricingRow` | yes (~L520) | required `priceCode`, `label`, `amount` (plain number) |
| `CommandCenterCatalogPartitionBody` | yes (~L533) | `{ rows: […] }` oneOf Cc*Row + examples |
| `CommandCenterCatalogFlatUpsertBody` | yes (~L571) | flat + `category`/`kind` refs Kind |
| `CommandCenterCatalogListItem` / `ListData` | yes (~L603 / ~L627) | GET list shapes |

### 2.3 business-master paths (M01 needles kept)

| operationId | Method | Path | Envelope |
|-------------|--------|------|----------|
| `businessMasterListItems` | GET | `/business-master/{domain}/items` | `XBOS-MASTER-200` + CC list note |
| `businessMasterUpsertItem` | PUT | `/business-master/{domain}/items/{itemId}` | partition/flat + `XBOS-MASTER-201` |
| `businessMasterDeleteItem` | DELETE | same | `XBOS-MASTER-204` |

Errors documented: `XBOS-MASTER-400`, `XBOS-AUTH-001`, `SCOPE_CONTEXT_MISMATCH`.

### 2.4 RACI must_keep (not reopened)

| Check | Result |
|-------|--------|
| `operationId: raciGovernanceListCatalog` | **present** (~L1607) |
| path `/raci-governance/catalog` | **present** |
| schema `UpsertRaciMatrixCellRequest` | **present** (~L350) |
| Scope of this QA stayed on CC-CAT yaml — no RACI edit | **OK** |

## 3. Verify gate

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
exit 0
```

(QA re-ran 2026-07-22 ICT; matches BE evidence §4.)

## 4. Runtime parity (read-only — no mutate)

**Runtime SoT:** `apps/api/xbos-api/src/business-master/business-master.service.ts`  
**OpenAPI SoT:** `docs/api/openapi/xbos-api.yaml`

| Runtime | OpenAPI | Match |
|---------|---------|-------|
| `allowedDomains` includes `'command_center_catalogs'` | `Domain.enum` includes same | **OK** |
| `COMMAND_CENTER_CATALOG_KINDS = ['regulations','measurements','pricing']` | `CommandCenterCatalogKind` enum identical | **OK** |
| Partition upsert `{ rows }` vs flat + `category` | `CommandCenterCatalogPartitionBody` / `FlatUpsertBody` | **OK** |
| Envelope codes MASTER-200/201/204/400 | path responses + error docs | **OK** |

**FE / UF:** yaml-only wave — **no** FE mutate, **no** browser UF, **U65 no seed**.  
**must_keep:** UF-XBOS-14 🟢 — not exercised; documentation-only.  
**cấm:** seed · RACI reopen · Phase1/PROD claim · `apps/**` rewrite — **not touched**.

## 5. Residual

| Item | Status | Next |
|------|--------|------|
| **G-OA-W2-CC-CAT-01** OpenAPI kinds + semantics | **CLOSED** | — |
| **G-DTO-W2-CC-CAT-01** Cc*Row schemas in yaml | **CLOSED** (folded) | Nest class-validator DTO still optional P2 if TM opens apps |
| Nest free-form payload at edge for non-CC domains | P2 residual | only if TM requires runtime DTO |
| **G-DTO-W2-POS-01** PermissionMatrixRow depth | OPEN (separate) | `BE-XBOS-OA-POS-MATRIX-DTO-01` (not this QA) |
| FE mutate / browser UF-XBOS-14 | N/A | not required this wave |
| Seed / Phase1 / PROD claim | **cấm** — not touched | — |

## 6. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-xbos-oa-cc-cat-01-20260722.md`
- **closed:** G-OA-W2-CC-CAT-01 + G-DTO-W2-CC-CAT-01 yaml Domain/kinds/Cc*Row + verify:openapi-m01 + RACI must_keep intact

### next_dispatch_prompt

```text
work_item_id: QC-XBOS-OA-CC-CAT-SAMPLE-01
from_role: pm
to_role: qc
lane: governance
priority: P2

entry: docs/qa/evidence/qa-xbos-oa-cc-cat-01-20260722.md
prior_be: docs/qa/evidence/be-xbos-oa-cc-cat-01-20260722.md

Sample gate (yaml-only):
1. Audit QA micro-checklist 5/5 PASS + verify:openapi-m01 exit 0
2. Spot Domain enum command_center_catalogs + CommandCenterCatalogKind + Cc*Row
3. Confirm RACI must_keep still present (no reopen)
4. Verdict GO / GWC — cấm seed · Phase1/PROD · apps rewrite
5. Evidence docs/qa/evidence/qc-xbos-oa-cc-cat-sample-01-20260722.md

Optional parallel residual (if backlog open): BE-XBOS-OA-POS-MATRIX-DTO-01 (G-DTO-W2-POS-01) — not blocking this CC-CAT close.
```

### completion_report

**Closed:** QA spot-verify for `BE-XBOS-OA-CC-CAT-01` — Domain `command_center_catalogs`, kinds `regulations|measurements|pricing`, 8 CC schemas, M01 business-master operationIds, RACI must_keep intact, `verify:openapi-m01` exit 0.  
**Residual:** Nest DTO edge optional P2; G-DTO-W2-POS-01 separate; no UF / seed / Phase1/PROD.
