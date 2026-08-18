# BE-XBOS-OA-DTO-P2-01 — Nest DTO + OpenAPI PermissionMatrixRow

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-XBOS-OA-DTO-P2-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution · close soft residuals G-DTO-W2-RACI-01 · G-DTO-W2-POS-01 |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD/UPGRADE · preserve_default |
| **ack_status** | **READY_FOR_QA** |
| **gaps closed** | **G-DTO-W2-RACI-01** · **G-DTO-W2-POS-01** |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` `info.version` **1.2.7-p1-s2** |
| **U65** | zero-seed · no runtime mutate for evidence |
| **HOLD_DEPLOY** | stands |
| **must_keep** | UF-XBOS-07/13/14 🟢 — DTO/OA deepen only; no catalog-gov/WF wipe |

---

## 1. spec_read_ack

| Layer | Cite |
|-------|------|
| **srs** | `SRS_XBOS_KHACH.md` §3.13 FR-XBOS-RACI-02 Diễn biến #4–#6 · §3.14 FR-CC-P0-04 Diễn biến #2–#7 · UF-XBOS-07/13 |
| **tech_spec** | `docs/xbos/TECHSPEC.md` §14.14–14.15 · residual G-DTO-W2-RACI-01 / G-DTO-W2-POS-01 → **CLOSED** |
| **db_design** | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` — `company_raci_matrix_cell` · `xbos_cc_permission_matrix_cell` |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` Endpoints **C** (cell) · **E–F** (position matrix) F.1 |
| **upstream QA residual** | `docs/qa/evidence/qa-xbos-oa-raci-cc-20260727.md` §4 G-DTO-W2-RACI-01 · G-DTO-W2-POS-01 |
| **runtime SoT** | `RaciGovernanceController` · `PositionRbacController` |
| **OpenAPI SoT** | `docs/api/openapi/xbos-api.yaml` **1.2.7-p1-s2** |

**spec says / code does:** Sponsor zero-idle — close Nest class-validator for RACI cell PUT + OpenAPI `PermissionMatrixRow` depth vs API_DESIGN. Runtime merge/scope/UF-07/13 paths preserved; ValidationPipe whitelist at edge.

---

## 2. Paths changed

| Path | Change |
|------|--------|
| `apps/api/xbos-api/src/raci-governance/dto/upsert-raci-matrix-cell.dto.ts` | **ADD** `UpsertRaciMatrixCellRequestDto` + CODE-MEMORY |
| `apps/api/xbos-api/src/raci-governance/dto/upsert-raci-matrix-cell.dto.spec.ts` | **ADD** ValidationPipe jest |
| `apps/api/xbos-api/src/raci-governance/raci-governance.controller.ts` | **UPGRADE** body DTO; CODE-MEMORY-CHANGE APPEND |
| `apps/api/xbos-api/src/position-rbac/dto/save-permission-matrix.dto.ts` | **ADD** `PermissionMatrixRowDto` + `SavePermissionMatrixRequestDto` |
| `apps/api/xbos-api/src/position-rbac/dto/save-permission-matrix.dto.spec.ts` | **ADD** ValidationPipe jest |
| `apps/api/xbos-api/src/position-rbac/position-rbac.controller.ts` | **UPGRADE** PUT matrix DTO + CODE-MEMORY |
| `apps/api/xbos-api/src/position-rbac/position-rbac.controller.spec.ts` | **ADD** saveMatrix UC-CC-P0-04 case |
| `docs/api/openapi/xbos-api.yaml` | **UPGRADE** 1.2.7-p1-s2; PermissionMatrix* schemas; F.1 GET/PUT matrix; RACI DTO CLOSED note |
| `scripts/verify-openapi-m01.mjs` / `verify-openapi-p1-s2.mjs` | **ADD** PermissionMatrixRow / SavePermissionMatrixRequest needles |
| `docs/xbos/TECHSPEC.md` · `API_DESIGN_XBOS_RACI_RBAC.md` · `DB_DESIGN_XBOS_RACI_RBAC.md` | Mark G-DTO residuals **CLOSED** |

**Not touched:** seed · FE · catalog-gov publish · WF soft assignment wipe · Phase1/PROD claim.

---

## 3. Contract checklist

| Gap | Deliverable | Verdict |
|-----|-------------|---------|
| G-DTO-W2-RACI-01 | Nest `UpsertRaciMatrixCellRequestDto` + OpenAPI schema note CLOSED | ✅ |
| G-DTO-W2-POS-01 | `PermissionMatrixRow` · `SavePermissionMatrixRequest` · `PermissionDataScope` enum · F.1 E–F | ✅ |
| Letters | `^[RACI]*$` + Transform trim/upper at edge | ✅ |
| dataScope | `personal\|department\|legal_entity\|group` (FE enum) | ✅ |

---

## 4. Verify

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/xbos-api.yaml
exit 0

pnpm run verify:openapi-p1-s2
→ PASS verify-openapi-p1-s2 …/xbos-api.yaml
exit 0

pnpm -C apps/api/xbos-api exec jest --testPathPatterns="upsert-raci-matrix-cell|save-permission-matrix|raci-governance.controller|position-rbac.controller" --no-coverage
→ Test Suites: 4 passed · Tests: 24 passed
exit 0
```

---

## 5. Residual

| Item | Owner | Note |
|------|-------|------|
| UF-XBOS-07/13 browser retest | qa (optional) | yaml/DTO PASS ≠ FE mutate; must_keep prior 🟢 |
| Edge ValidationPipe fail code | — | Missing fields → `XBOS-VAL-001` (global filter); service letters still `XBOS-RACI-400` |
| G-DTO-W2-KPI-01 series depth | separate WI | Out of this packet |

---

## 6. Handoff

### completion_report

**Closed:** G-DTO-W2-RACI-01 (Nest class-validator `UpsertRaciMatrixCellRequestDto` on PUT cell) + G-DTO-W2-POS-01 (OpenAPI `PermissionMatrixRow` / `SavePermissionMatrixRequest` / `PermissionDataScope` F.1 + Nest DTO on PUT matrix). OpenAPI **1.2.7-p1-s2**; verify m01 + p1-s2 exit 0; jest 24/24; TECHSPEC/API_DESIGN/DB_DESIGN residuals marked CLOSED. **No seed · no UF-07/13/14 behavior wipe.**

**Residual:** Optional QA yaml/DTO spot; browser UF retest not required for this contract wave; KPI DTO P2 out of scope.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-OA-DTO-P2-01
role: qa
lane: execution · OpenAPI/DTO contract spot (browser NOT required)
entry_criteria:
  - read docs/qa/evidence/be-xbos-oa-dto-p2-01-20260727.md READY_FOR_QA
  - docs/api/openapi/xbos-api.yaml version 1.2.7-p1-s2
  - API_DESIGN_XBOS_RACI_RBAC.md Endpoints C · E–F
exit_criteria:
  - Confirm UpsertRaciMatrixCellRequest + Nest DTO note CLOSED (G-DTO-W2-RACI-01)
  - Confirm PermissionMatrixRow + SavePermissionMatrixRequest + PermissionDataScope enum personal|department|legal_entity|group
  - Confirm positionRbacGetMatrix / positionRbacSaveMatrix F.1 descriptions + examples
  - pnpm run verify:openapi-m01 && pnpm run verify:openapi-p1-s2 exit 0
  - must_keep: no claim UF-07/13/14 FE mutate from yaml-only; U65 no seed
  - PASS_TO_PM or FAIL with residual
evidence_path: docs/qa/evidence/qa-xbos-oa-dto-p2-01-20260727.md
cấm: seed; mutate runtime to force OA pass; Phase1/PROD claim
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/be-xbos-oa-dto-p2-01-20260727.md`

### pm_dispatch_hint

`QA-XBOS-OA-DTO-P2-01` — spot OpenAPI 1.2.7-p1-s2 + G-DTO-W2-RACI-01/POS-01 CLOSED; do not reopen UF-07/14 FE from this packet.
