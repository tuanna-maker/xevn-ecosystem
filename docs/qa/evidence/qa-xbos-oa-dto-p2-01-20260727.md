# QA-XBOS-OA-DTO-P2-01 — OpenAPI/DTO contract spot (RACI + Position matrix)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-OA-DTO-P2-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · OpenAPI/DTO contract spot (browser NOT required) |
| **date** | 2026-07-27 (ICT) |
| **upstream** | `docs/qa/evidence/be-xbos-oa-dto-p2-01-20260727.md` **READY_FOR_QA** |
| **OpenAPI** | `docs/api/openapi/xbos-api.yaml` `info.version` **1.2.7-p1-s2** |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` Endpoints **C** · **E–F** |
| **U65** | zero-seed · no runtime mutate · yaml/DTO only |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope & must_keep

| Claim allowed | Claim **forbidden** |
|---------------|---------------------|
| G-DTO-W2-RACI-01 / G-DTO-W2-POS-01 CLOSED at Nest + OpenAPI | UF-XBOS-07 / 13 / 14 FE mutate PASS from this packet |
| verify:openapi-m01 + verify:openapi-p1-s2 exit 0 | Phase1 DONE / PROD-READY |
| F.1 Mục đích / Nghiệp vụ / Bước SRS on positionRbac* | Seed / DB fake to force OA |

**Separate WI (not this packet):** `G-DTO-W2-KPI-01` → `BE-XBOS-OA-KPI-DTO-01`.

---

## 2. Exit criteria checklist

| # | Criterion | Evidence | Verdict |
|---|-----------|----------|---------|
| 1 | UpsertRaciMatrixCellRequest + Nest DTO note CLOSED (G-DTO-W2-RACI-01) | OA schema L362–384: description cites **G-DTO-W2-RACI-01 CLOSED** + `UpsertRaciMatrixCellRequestDto`; PUT cell L1831 CLOSED note; Nest `upsert-raci-matrix-cell.dto.ts` `@Body() UpsertRaciMatrixCellRequestDto` on controller; API_DESIGN gap table CLOSED | ✅ PASS |
| 2 | PermissionMatrixRow + SavePermissionMatrixRequest + PermissionDataScope enum `personal\|department\|legal_entity\|group` | OA L385–421: `PermissionDataScope.enum: [personal, department, legal_entity, group]`; Nest `PERMISSION_DATA_SCOPES` + `@IsIn` on `PermissionMatrixRowDto.dataScope`; controller `@Body() SavePermissionMatrixRequestDto` | ✅ PASS |
| 3 | positionRbacGetMatrix / positionRbacSaveMatrix F.1 descriptions + examples | GET L2109–2162: Mục đích / Nghiệp vụ / Bước SRS + `matrixLoaded` example `dataScope: group`; PUT L2177–2216: F.1 + `saveMatrix` example with `group` / `legal_entity` | ✅ PASS |
| 4 | `pnpm run verify:openapi-m01 && pnpm run verify:openapi-p1-s2` exit 0 | See §3 | ✅ PASS |
| 5 | must_keep: no UF-07/13/14 FE mutate claim; U65 no seed | This evidence — contract-only; no browser; no seed | ✅ PASS |
| 6 | Evidence + PASS_TO_PM / FAIL | This file | ✅ PASS_TO_PM |
| 7 | Bus append; KPI residual separate | Bus entry + §5 | ✅ PASS |

---

## 3. Verify commands (QA re-run)

```text
pnpm run verify:openapi-m01
→ PASS verify-openapi-m01 …/docs/api/openapi/xbos-api.yaml
EXIT_M01=0

pnpm run verify:openapi-p1-s2
→ PASS verify-openapi-p1-s2 …/docs/api/openapi/xbos-api.yaml
EXIT_P1S2=0
```

Needles confirmed in scripts (PermissionMatrixRow / SavePermissionMatrixRequest / G-DTO-W2-POS-01).

---

## 4. Spot detail (spec says / OA+code does)

### 4.1 G-DTO-W2-RACI-01 (Endpoint C)

| Layer | Observation |
|-------|-------------|
| OpenAPI | `UpsertRaciMatrixCellRequest` required `[activity_id, org_column_id]`; `raci_letters` pattern `^[RACI]*$`; op `raciGovernanceUpsertMatrixCell` F.1 + examples upsertLetters / clearOverride |
| Nest | `UpsertRaciMatrixCellRequestDto` — MinLength strings; Transform trim/upper + Matches on letters; wired on `RaciGovernanceController.upsertCell` |
| API_DESIGN | §3 Endpoint C; residual table **CLOSED** 2026-07-27 |

### 4.2 G-DTO-W2-POS-01 (Endpoints E–F)

| Layer | Observation |
|-------|-------------|
| OpenAPI | `PermissionMatrixRow` / `SavePermissionMatrixRequest` / `PermissionMatrixData`; `PermissionDataScope` four values; ops `positionRbacGetMatrix` (E) + `positionRbacSaveMatrix` (F) with F.1 VI blocks |
| Nest | `PermissionMatrixRowDto` + `SavePermissionMatrixRequestDto`; `PERMISSION_DATA_SCOPES = personal\|department\|legal_entity\|group`; wired on `PositionRbacController.saveMatrix` |
| API_DESIGN | §5–§6 E–F; residual **CLOSED** 2026-07-27 |

---

## 5. Residual

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| G-DTO-W2-KPI-01 OpenAPI series/rollup depth | P2 (separate) | `BE-XBOS-OA-KPI-DTO-01` / QA after READY | **Out of this packet** — already DISPATCHED on bus |
| Optional UF-XBOS-07/13 browser retest | — | qa (optional) | yaml/DTO PASS ≠ FE mutate; prior 🟢 must_keep |
| Phase1 / PROD | — | — | **Not claimed** |

---

## 6. Handoff

### completion_report

**Closed:** Contract spot **PASS** for `QA-XBOS-OA-DTO-P2-01`. Confirmed OpenAPI **1.2.7-p1-s2**: `UpsertRaciMatrixCellRequest` + Nest DTO note **G-DTO-W2-RACI-01 CLOSED**; `PermissionMatrixRow` / `SavePermissionMatrixRequest` / `PermissionDataScope` enum `personal|department|legal_entity|group`; `positionRbacGetMatrix` / `positionRbacSaveMatrix` F.1 Mục đích/Nghiệp vụ/Bước SRS + examples. Re-ran `verify:openapi-m01` + `verify:openapi-p1-s2` **exit 0**. Nest controllers bind DTOs. **No seed · no FE mutate claim · no Phase1/PROD.**

**Residual:** `G-DTO-W2-KPI-01` tracked under separate WI `BE-XBOS-OA-KPI-DTO-01` only.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-XBOS-OA-DTO-P2-01
role: pm
lane: governance intake
entry_criteria:
  - docs/qa/evidence/qa-xbos-oa-dto-p2-01-20260727.md PASS_TO_PM
exit_criteria:
  - Mark G-DTO-W2-RACI-01 + G-DTO-W2-POS-01 CLOSED on residual tracker / TECHSPEC if still open in PM view
  - Do NOT reopen UF-XBOS-07/13/14 FE from this packet
  - Continue/monitor BE-XBOS-OA-KPI-DTO-01 for G-DTO-W2-KPI-01 (separate) → QA when READY_FOR_QA
  - No Phase1/PROD claim from OA DTO P2 alone
evidence_path: docs/qa/evidence/qa-xbos-oa-dto-p2-01-20260727.md
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qa-xbos-oa-dto-p2-01-20260727.md`

### pm_dispatch_hint

Close RACI/POS DTO residuals as verified; keep KPI DTO on `BE-XBOS-OA-KPI-DTO-01` only — do not merge into this WI.
