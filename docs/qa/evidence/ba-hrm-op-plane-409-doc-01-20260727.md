# BA-Process — BA-HRM-OP-PLANE-409-DOC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-OP-PLANE-409-DOC-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance · Info close from `QC-HRM-OP-DUAL-PLANE-01` |
| **change_mode** | ADD |
| **date** | 2026-07-27 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | true |

---

## Objective

Close QC Info residual **C-OP-PLANE-API-DESIGN-409** by documenting runtime error **`HRM-PLANE-409`** in `API_DESIGN_HRM_OPERATIONS.md` — **no new FR**, no product reopen, no `apps/**`.

---

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| `docs/qa/evidence/qc-hrm-op-dual-plane-01-20260727.md` | GWC; residual **C-OP-PLANE-API-DESIGN-409** Info OPEN → owner ba-process |
| `docs/hrm/API_DESIGN_HRM_OPERATIONS.md` | Pre-delta: Errors tables generic 409; code name missing |
| `docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md` | Persist/list/summary → `HRM-PLANE-409` |
| Runtime `apps/api/hrm-api/src/common/hrm-list-scope.ts` | Read-only SoT for code/message/HTTP |

```yaml
spec_read_ack:
  srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.45–3.48 · FR-HRM-OP-01 #4 · FR-HRM-OP-02 #2 · FR-HRM-OP-04 #4/#5/#7
  tech_spec: docs/hrm/TECHSPEC.md §16.5
  db_design: docs/hrm/DB_DESIGN_HRM_OPERATIONS.md · Plane B′ UUID map
  api_design: docs/hrm/API_DESIGN_HRM_OPERATIONS.md §0.1 + §§A/B/D Errors (this WI)
  change_mode: ADD
  must_keep: [existing FR-HRM-OP-01..04, CO-HC GWC CLOSED, HOLD_DEPLOY, U65]
  forbidden: [new FR invent, apps/**, seed, Phase1/PROD claim, reopen product GWC]
```

---

## Runtime SoT captured (read-only)

| Item | Value |
|------|--------|
| **Code** | `HRM-PLANE-409` |
| **HTTP** | `409` (`HttpStatus.CONFLICT`) |
| **Message** | `company_id UUID is not an HRM pilot mapped UUID (XBOS legal-entity id rejected)` |
| **Throw site** | `assertHrmMappedCompanyUuidOrThrow` → used by persist + `OperationsService.assertOperationsCompanyWire` |
| **Condition** | `company_id` UUID **not** ∈ `HRM_COMPANY_UUID_BY_SLUG` values (XBOS LE / unknown) |
| **Happy path (unchanged)** | slug `holding`\|`main`… → mapped UUID → 2xx |

Representative LE (QC): `78b8a663-f5e5-4f4d-a020-b8f950ec2037`  
Plane B′ holding map: `10000000-0000-4000-8000-000000000001`

---

## Delta applied

| Location | Change |
|----------|--------|
| `API_DESIGN_HRM_OPERATIONS.md` **§0.1** | ADD shared error: Mục đích · Nghiệp vụ · Applies to POST/GET tasks + GET summary · SRS bước map |
| §§**A / B / D** Errors | ADD row **`HRM-PLANE-409`** / **409** |
| §§A/B/D Nghiệp vụ | ADD fail-closed step before SQL (document only) |
| Residual register | **C-OP-PLANE-API-DESIGN-409** → **CLOSED** |
| `qc-hrm-op-dual-plane-01-20260727.md` Residual table | **C-OP-PLANE-API-DESIGN-409** → **CLOSED** |

**Not changed:** FR text in SRS · OpenAPI yaml (optional follow-up SA) · product code · CO-HC · MD non-OP residual (`C-OP-PLANE-NONOP-UUID-FILTER` remains OPEN / MD WI).

---

## Exit criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | ADD API_DESIGN: `HRM-PLANE-409` · HTTP 409 · when `company_id` XBOS LE ∉ HRM map · bước SRS/ref | **PASS** — §0.1 + A/B/D |
| 2 | Do not invent new FR; document current runtime SoT | **PASS** |
| 3 | Evidence this file → PASS_TO_PM | **PASS** |
| 4 | Mark Info residual CLOSED | **PASS** — QC + API_DESIGN register |

---

## completion_report

**Closed:** Info residual **C-OP-PLANE-API-DESIGN-409** — `API_DESIGN_HRM_OPERATIONS.md` §0.1 names **`HRM-PLANE-409`** / **409** / default message from `assertHrmMappedCompanyUuidOrThrow`; mapped to existing **FR-HRM-OP-01 #4**, **FR-HRM-OP-02 #2**, **FR-HRM-OP-04 #4/#5/#7**; Errors rows on create/list/summary; QC residual marked **CLOSED**. No new FR. No `apps/**`. No seed. No Phase1/PROD. No CO-HC / product GWC reopen.

**Residual (unchanged / out of WI):** `C-OP-PLANE-NONOP-UUID-FILTER` (MD WI) · QA pack P3 enrich optional · browser UF OP not claimed · HOLD_DEPLOY.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-BA-HRM-OP-PLANE-409-DOC-01
from_role: ba-process
to_role: pm
lane: governance intake · Info residual close
priority: P2 (does not block MD dual-plane)

entry_criteria:
- BA-HRM-OP-PLANE-409-DOC-01 PASS_TO_PM
- evidence: docs/qa/evidence/ba-hrm-op-plane-409-doc-01-20260727.md
- API_DESIGN: docs/hrm/API_DESIGN_HRM_OPERATIONS.md §0.1

action:
1. Bus INTAKE: mark C-OP-PLANE-API-DESIGN-409 CLOSED under QC-HRM-OP-DUAL-PLANE-01 GWC conditions
2. Continue dual-plane residual #2 if open: D-HRM-MD-DUAL-PLANE-GUARD-01 (non-OP UUID filter)
3. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088; do NOT reopen CO-HC
4. pnpm run pm:idle:check → next P1 from DATA_LINKAGE §6.2 / backlog
cấm: seed · reopen product GWC · treat doc close as browser UF PASS
```

### evidence_path

`docs/qa/evidence/ba-hrm-op-plane-409-doc-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`PM-INTAKE` — Info **C-OP-PLANE-API-DESIGN-409** CLOSED; continue MD dual-plane if open; HOLD_DEPLOY · NOT Phase1/PROD · no CO-HC reopen.
