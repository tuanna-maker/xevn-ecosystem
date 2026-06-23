# QA — P1-PHASE1-BE-REC-PATCH-01 retest (localhost U32)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-BE-REC-PATCH-01` |
| **batch** | `P1-PHASE1-QA-BATCH-RETST` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-phase1-be-rec-patch-20260606.md` |
| **matrix AC** | **AC-CRUD-HRM-REC-G-U-01** |

## Verdict

**PASS_TO_PM** — `PATCH /api/hrm/recruitment/requisitions/:id?company_id=main` with `{ status: 'on_hold' }` returns **200** `HRM-REC-200` (not headcount fallback **404**). **D-CRUDMAT-REC-U-01 CLOSED**.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api (direct) | `http://127.0.0.1:28001` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `company_id=main` (group CEO rollup) |

## L0 — Stack health

| Gate | Command | Result |
|------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |

## AC-CRUD-HRM-REC-G-U-01 — Requisition status PATCH

| Step | Path | HTTP | Code | Detail | Result |
|------|------|------|------|--------|--------|
| List | `GET …/recruitment/requisitions?company_id=main&page_size=5` | **200** | `HRM-REC-200` | First id `e5228749-e829-4edf-8864-f3255d8725dd`, status `open` | **PASS** |
| PATCH (portal proxy) | `PATCH …/recruitment/requisitions/{id}?company_id=main` `{ status: 'on_hold' }` | **200** | `HRM-REC-200` | `new_status=on_hold` | **PASS** |
| PATCH (direct :28001) | Same path on hrm-api direct | **200** | `HRM-REC-200` | Restored `{ status: 'open' }` after probe | **PASS** |

**scope_parity:** List returns requisition id → PATCH same `company_id=main` → **200** (no 404 mismatch).

## Defects closed

| Defect ID | Prior symptom | Retest |
|-----------|---------------|--------|
| **D-CRUDMAT-REC-U-01** | `PATCH …/requisitions/:id` → **404**; only headcount-proposals PATCH worked | **CLOSED** — **200** `HRM-REC-200` |

## Residual

| ID | Owner | Note |
|----|-------|------|
| — | — | None for this work item |

---

**completion_report:** L0 **PASS**; **AC-CRUD-HRM-REC-G-U-01 PASS** — portal + direct PATCH `on_hold` → **200** `HRM-REC-200`; **D-CRUDMAT-REC-U-01 CLOSED**. No blocking residual.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-PHASE1-BE-REC-PATCH-01` PASS_TO_PM — promote `AC-CRUD-HRM-REC-G-U-01` localhost PASS in `PHASE1_CRUD_ACCEPTANCE_MATRIX.md`; dispatch **qc** CRUD matrix gate if wave DoD requires; no dev-be re-dispatch for REC PATCH.

**evidence_path:** `docs/qa/evidence/p1-phase1-qa-rec-patch-retest-20260606.md`

**pm_dispatch_hint:** REC Update no longer GWC — full CRUD parity for requisitions list/RD/U on group CEO scope.
