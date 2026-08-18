# PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02` |
| **lane** | execution · dev-be |
| **program** | PO-HRM-MVP-GD1-CONTINUOUS (U89) |
| **uc_ids** | UC-BP-REC-07 |
| **depends_on** | QA-01 FAIL · stamp `REC07QA-MSL5905D` |
| **ack_status** | **READY_FOR_QA** |
| **coded** | 2026-08-09 |
| **honesty** | `recruitment_uat_ready=false` · C-SLICE · **no flip** |

## Mission closed

| Defect | Sev | Fix |
|--------|-----|-----|
| **R-REC-07-SOFT-LINK-PROJECTION** | P0 | `listCandidates` / `getCandidateById` SELECT `c.employee_id::text AS employee_id` → display-ready on DTO (list↔get parity) |
| **R-REC-07-IDEMPOTENT-OFFER-GATE** | P0 | Soft/reverse link check **before** `assertOfferReadyOrThrow`; offer-ready only on **unlinked** CREATE path — re-accept after hired-outcome → idempotent `HIRE-200` same `employee_id` |
| **R-REC-07-ASSERT-BYPASS** | P1 | ADD `assertPersistedHireSoftLinkOrThrow` — re-reads Lane A soft + reverse from DB after stamp (no in-memory `existingEmployeeId` bypass) |

## Spec / preserve

| Item | Status |
|------|--------|
| CREATE+prefill 201 path | **RETAIN** |
| PAY-403 · HIRE-400/409 · CANCELLED | **RETAIN** |
| APP-02 sole hired-outcome (no silent stage) | **RETAIN** |
| Nest `/rec` dual · second hire SoT · hard FK | **DENY** |
| Seed · honesty flip · reopen J-06 · REC UAT DONE | **DENY** |

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | list/get `employee_id`; accept-offer gate order; persisted assert |
| `apps/api/hrm-api/src/recruitment/hire-employee-link.ts` | ADD `assertPersistedHireSoftLinkOrThrow` |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-07-cluster-be-02.spec.ts` | **ADD** regression |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-07-cluster-be-01.spec.ts` | mock harden for persisted assert |
| `apps/api/hrm-api/src/recruitment/hire-employee-link.spec.ts` | persisted assert unit |

## Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-07-cluster-be-0" --testPathPatterns="hire-employee-link.spec" --no-coverage
Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
```

Coverage: BE-01 (RETAIN) + BE-02 soft projection · hired-outcome idempotent · unlinked OFFER-INVALID · persisted soft/reverse · DENY /rec.

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-be-02.md` |
| **completion_report** | Fixed P0 soft-link projection (list/get `employee_id`) + P0 idempotent gate order (soft/reverse before offer-ready) + P1 persisted DB assert. jest 30 PASS. Honesty false · Nest /rec DENY · no seed. |
| **residual** | QA-02 U65 retest J-01 F5 soft link + J-02 re-accept HIRE-200; optional P2 PAY HTTP VAL-001 peer |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: BE-02 READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-be-02.md
entry_criteria: L0; browser-only U65 zero-seed; honesty false; C-SLICE
MISSION: Retest J-HRM-REC-07-01 F5 soft link (GET candidate employee_id after accept+transitions); J-02 re-accept after hired-outcome → 200 HRM-REC-HIRE-200 same employee_id; J-03 HTP RETAIN; J-04 Nest/rec DENY; matrix stamp.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-02.md · PASS_TO_PM or FAIL with residual
cấm: seed · Nest /rec dual · honesty flip · claim REC UAT DONE
```
