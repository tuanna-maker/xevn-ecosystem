# BE-XBOS-OA-CC-CAT-01 — OpenAPI G-OA-W2-CC-CAT-01 (FR-CC-P0-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-CC-CAT-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **gap closed** | **G-OA-W2-CC-CAT-01** + **G-DTO-W2-CC-CAT-01** (TechSpec §14.16 / §14.13 — `command_center_catalogs` kinds + row schemas) |
| **scope** | OpenAPI yaml **ONLY** — no runtime / FE / seed |

> **ID SoT:** TechSpec §14.16 **FR-CC-P0-05** · SA W2 `G-OA-W2-CC-CAT-01`. **RACI yaml** = **must_keep** — **cấm** reopen.

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| tech_spec | `docs/xbos/TECHSPEC.md` **§14.16** FR-CC-P0-05 · **§14.13** G-OA-W2-CC-CAT-01 / G-DTO-W2-CC-CAT-01 · **§14.0b** W2 catalog |
| dual-ref | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` (FR-CC-P0-05) |
| SA packet | `docs/qa/evidence/sa-xbos-techspec-w2-ref-01-20260722.md` — OpenAPI generic / kinds thin → this ticket |
| runtime SoT (read-only) | `apps/api/xbos-api/src/business-master/business-master.service.ts` — `COMMAND_CENTER_CATALOG_KINDS`, domain `command_center_catalogs` |
| FE contract (read-only) | `apps/web/web-portal/src/integrations/commandCenterCatalogApi.ts` |
| OpenAPI SoT | `docs/api/openapi/xbos-api.yaml` |

**change_mode:** Enrich / ADD (contract documentation)  
**must_keep:** UF-XBOS-14 🟢 — no product behavior change; no seed; **no RACI yaml reopen**.

**spec says / code does:** Spec requires documented semantics for domain `command_center_catalogs` + kinds `regulations`\|`measurements`\|`pricing` + row DTOs in OpenAPI. Runtime already implements partition + flat upsert; yaml previously had generic Domain “see service” only. This Task closes contract gap only.

---

## 2. Micro-checklist

| # | Item | Status |
|---|------|--------|
| 1 | `spec_read_ack` TechSpec §14.16 FR-CC-P0-05 | **DONE** (§1) |
| 2 | Enrich/ADD business-master `command_center_catalogs` OpenAPI (kinds thin → explicit) | **DONE** |
| 3 | `pnpm verify:openapi-m01` exit 0 | **DONE** (see §4) |
| 4 | Evidence `docs/qa/evidence/be-xbos-oa-cc-cat-01-20260722.md` | **DONE** |
| 5 | READY_FOR_QA | **DONE** |

---

## 3. OpenAPI delta (Enrich / ADD)

### Parameters

| Component | Change |
|-----------|--------|
| `Domain` | Explicit `enum` of `BUSINESS_MASTER_ALLOWED_DOMAINS` incl. `command_center_catalogs` + FR-CC-P0-05 description |
| `ItemId` | Document partition kinds vs flat business-key upsert for CC domain |

### Paths (existing operationIds kept — must_keep M01 gate)

| Method | Path | operationId | Envelope / note |
|--------|------|-------------|-----------------|
| GET | `/business-master/{domain}/items` | `businessMasterListItems` | Tags `M01-Master`+`M01-CC`; FR-CC-P0-05 description; `XBOS-MASTER-200` + CC list schema/example |
| PUT | `/business-master/{domain}/items/{itemId}` | `businessMasterUpsertItem` | Partition `{ rows }` **or** flat+`category`; `XBOS-MASTER-201` |
| DELETE | same | `businessMasterDeleteItem` | Soft-delete note for CC partition/flat; `XBOS-MASTER-204` |

### Components (G-DTO-W2-CC-CAT-01 fold)

| Schema | Maps to |
|--------|---------|
| `CommandCenterCatalogKind` | `regulations` \| `measurements` \| `pricing` |
| `CcRegulationRow` | `{ code, title, category?, version?, active? }` |
| `CcMeasurementRow` | `{ key, unit, currency, precision, category? }` |
| `CcPricingRow` | `{ priceCode, label, amount, category? }` — amount plain number |
| `CommandCenterCatalogPartitionBody` | `{ rows: […] }` + examples |
| `CommandCenterCatalogFlatUpsertBody` | Flat row + `category`/`kind` |
| `CommandCenterCatalogListItem` / `CommandCenterCatalogListData` | List partition + flat shapes |

Error / scope codes documented on paths: `XBOS-MASTER-400`, `XBOS-AUTH-001`, `SCOPE_CONTEXT_MISMATCH`.

### Version bump

`info.version`: `1.2.4-p1-s2` → `1.2.5-p1-s2` (+ G-OA-W2-CC-CAT-01 / G-DTO-W2-CC-CAT-01 note in description).

### Files touched

| Path | Change |
|------|--------|
| `docs/api/openapi/xbos-api.yaml` | Enrich Domain/ItemId + business-master paths; ADD 8 CC schemas; version note |
| `docs/qa/evidence/be-xbos-oa-cc-cat-01-20260722.md` | this evidence |

**Not touched:** `apps/**`, seed, FE, RACI paths/schemas (must_keep), Phase1/PROD claims.

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 docs/api/openapi/xbos-api.yaml
exit 0
```

Grep confirmation (yaml):

- `operationId: businessMasterListItems` / `businessMasterUpsertItem` / `businessMasterDeleteItem` (M01 required needles kept)
- `command_center_catalogs` · `CommandCenterCatalogKind` · `CcRegulationRow` · `CcMeasurementRow` · `CcPricingRow`
- `CommandCenterCatalogPartitionBody` / `CommandCenterCatalogFlatUpsertBody`
- `G-OA-W2-CC-CAT-01` / `G-DTO-W2-CC-CAT-01` in `info.description`
- `XBOS-MASTER-200` / `XBOS-MASTER-201` / `XBOS-MASTER-204` / `XBOS-MASTER-400`
- RACI must_keep still present: `raciGovernanceListCatalog` · `UpsertRaciMatrixCellRequest` · `/raci-governance/catalog`

---

## 5. Residual

| Gap | Status | Follow-up |
|-----|--------|-----------|
| **G-OA-W2-CC-CAT-01** OpenAPI semantics + 3 kinds | **CLOSED** (this Task) | QA spot |
| **G-DTO-W2-CC-CAT-01** row schemas in yaml | **CLOSED** (folded) | Nest class-validator DTO still optional P2 if TM opens apps |
| Nest free-form payload at edge for non-CC domains | P2 residual | only if TM requires runtime DTO |
| **G-DTO-W2-POS-01** PermissionMatrixRow depth | OPEN (separate) | `BE-XBOS-OA-POS-MATRIX-DTO-01` |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/be-xbos-oa-cc-cat-01-20260722.md`
- **next_dispatch_prompt:** see completion packet below
