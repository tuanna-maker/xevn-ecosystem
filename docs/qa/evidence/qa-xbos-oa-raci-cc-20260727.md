# QA-XBOS-OA-RACI-CC-01 — OpenAPI/contract spot (RACI A–D + CC H–I)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-RACI-CC-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · OpenAPI/contract spot (yaml-only · browser NOT required) |
| **date** | 2026-07-27 (ICT) |
| **upstream** | `BE-XBOS-OA-RACI-CC-01` · `docs/qa/evidence/be-xbos-oa-raci-cc-20260727.md` **READY_FOR_QA** |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` `info.version` **1.2.6-p1-s2** |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` Endpoints A–D · H–I (F.1) |
| **workspace** | `C:\xevn-ecosystem` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no runtime mutate · no FE browser claim |
| **HOLD_DEPLOY** | stands |

---

## 1. Scope / classification

| Item | Result |
|------|--------|
| Test type | Contract / OpenAPI spot (yaml + verify scripts) |
| Browser / FE mutate | **Out of scope** — yaml-only PASS **≠** UF-XBOS-07/13/14 browser retest |
| Seed | **None** (U65) |
| Phase1 / PROD / :8088 | **Not claimed** |
| must_keep | UF-XBOS-07/13/14 🟢 runtime status preserved as prior matrix — this wave does **not** re-promote FE |

---

## 2. Checklist vs exit_criteria

### 2.1 RACI paths (API_DESIGN A–D)

| Path (servers.url `/api/xbos`) | operationId | F.1 in description | Verdict |
|--------------------------------|-------------|--------------------|---------|
| `GET /raci-governance/catalog` | `raciGovernanceListCatalog` | Mục đích · Nghiệp vụ · Bước SRS FR-XBOS-RACI-02 #2 | ✅ PASS |
| `GET /raci-governance/companies/{companyId}/matrix` | `raciGovernanceGetCompanyMatrix` | Endpoint B · scope parity note | ✅ PASS |
| `PUT /raci-governance/companies/{companyId}/matrix/cell` | `raciGovernanceUpsertMatrixCell` | Endpoint C · examples upsert + clear | ✅ PASS |
| `GET /raci-governance/capabilities` | `raciGovernanceListCapabilities` | Endpoint D supporting | ✅ PASS |
| `GET /raci-governance/companies/{companyId}/coverage` | `raciGovernanceGetCoverage` | Endpoint D coverage · same scope note | ✅ PASS |

### 2.2 CommandCenterCatalogKind (API_DESIGN H–I)

| Check | Evidence | Verdict |
|-------|----------|---------|
| Schema `CommandCenterCatalogKind` | `enum: [regulations, measurements, pricing]` | ✅ PASS |
| Examples on kind | `examples: [regulations, measurements, pricing]` | ✅ PASS |
| Partition body examples | `regulationsPartition` · `measurementsPartition` · `pricingPartition` | ✅ PASS |
| Flat upsert category kinds | category enum per row schema + flat example | ✅ PASS |
| info.version | `1.2.6-p1-s2` | ✅ PASS |
| Gap IDs cited | G-OA-W2-RACI-01 · G-OA-W2-CC-CAT-01 in yaml description | ✅ PASS |

### 2.3 Verify gates

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
exit 0

pnpm run verify:openapi-p1-s2
→ PASS verify-openapi-p1-s2 …/docs/api/openapi/xbos-api.yaml
exit 0
```

| Gate | Exit | Verdict |
|------|------|---------|
| `verify:openapi-m01` | **0** | ✅ PASS |
| `verify:openapi-p1-s2` | **0** | ✅ PASS |

---

## 3. Spec alignment (spot)

| Layer | Cite | QA note |
|-------|------|---------|
| API_DESIGN A–D | catalog · matrix · cell · capabilities/coverage | Paths + operationIds match runtime SoT cited in BE evidence |
| API_DESIGN H–I | `command_center_catalogs` items GET/PUT + kinds | Kind enum/examples present; F.1 text on business-master ops |
| BE READY_FOR_QA | `be-xbos-oa-raci-cc-20260727.md` | Gaps G-OA-W2-RACI-01 / G-OA-W2-CC-CAT-01 / G-DTO-W2-CC-CAT-01 claimed CLOSED — yaml spot confirms OA needles |

**spec says / yaml does:** U71 F.1 OpenAPI deepen for RACI + CC kinds — **confirmed**. No claim that Nest class-validator edge (G-DTO-W2-RACI-01) is closed.

---

## 4. Residual (carry — not blocking this OA spot)

| Item | Owner | Priority | Note |
|------|-------|----------|------|
| Nest class-validator `UpsertRaciMatrixCellRequest` at edge | `dev-be` | P2 `G-DTO-W2-RACI-01` | Documented in OpenAPI; runtime Record residual from BE |
| OpenAPI `PermissionMatrixRow` depth (position-rbac) | `dev-be` | P2 `G-DTO-W2-POS-01` | Out of this work_item |
| UF-XBOS-07/13/14 FE mutate retest | — | N/A this wave | must_keep prior 🟢; **do not** promote from yaml-only |

---

## 5. Explicit non-claims

- ❌ Not Phase 1 DONE / PROD-READY / :8088 UAT
- ❌ Not browser PASS for UF-XBOS-07 / UF-XBOS-13 / UF-XBOS-14
- ❌ No seed · no API mutate to force OA pass
- ❌ HOLD_DEPLOY unchanged

---

## 6. Handoff packet

### completion_report

**Closed:** OpenAPI/contract spot for `QA-XBOS-OA-RACI-CC-01` against BE `READY_FOR_QA`. Confirmed `info.version` **1.2.6-p1-s2**; RACI paths catalog|matrix|matrix/cell|capabilities|coverage with F.1 descriptions + operationIds A–D; `CommandCenterCatalogKind` enum **regulations|measurements|pricing** + examples (H–I); `pnpm run verify:openapi-m01` and `verify:openapi-p1-s2` both **exit 0**.

**Residual:** P2 class-validator RACI cell (`G-DTO-W2-RACI-01`); P2 POS matrix DTO (`G-DTO-W2-POS-01`); UF-07/13/14 browser status unchanged (yaml-only — not retested).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-XBOS-OA-RACI-CC-01
role: pm
lane: governance intake after yaml OA PASS
entry_criteria:
  - read docs/qa/evidence/qa-xbos-oa-raci-cc-20260727.md PASS_TO_PM
  - G-OA-W2-RACI-01 / G-OA-W2-CC-CAT-01 OA spot PASS (verify m01 + p1-s2 exit 0)
exit_criteria:
  - Close OA deepen wave for RACI+CC on bus (no FE claim)
  - Optional next: BE-XBOS-OA-POS-MATRIX-DTO-01 (P2 G-DTO-W2-POS-01) OR BE class-validator RACI cell G-DTO-W2-RACI-01
  - must_keep: UF-XBOS-07/13/14 🟢; HOLD_DEPLOY; U65; no Phase1/PROD claim
cấm: seed; claim FE mutate PASS from this evidence
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qa-xbos-oa-raci-cc-20260727.md`

### pm_dispatch_hint

`QA-XBOS-OA-RACI-CC-01` PASS (yaml OA) → optional `BE-XBOS-OA-POS-MATRIX-DTO-01` or `G-DTO-W2-RACI-01` class-validator; **do not** reopen UF-07/14 FE from this packet.
