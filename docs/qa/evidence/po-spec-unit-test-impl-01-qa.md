# Evidence — PO-SPEC-UNIT-TEST-IMPL-01-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-SPEC-UNIT-TEST-IMPL-01-QA` |
| **from_role** | pm |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2.2 / T4 |
| **plan** | `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` |
| **impl_evidence** | `docs/qa/evidence/po-spec-unit-test-impl-01.md` |
| **U65** | honored — unit re-verify only; no seed |

---

## 1. Jest re-verify (QA executed)

```text
pnpm --filter hrm-api exec jest --testPathPatterns=hire-employee-link --testPathPatterns=po-e2e-spine-01-be-cand-dto --no-coverage
→ Test Suites: 2 passed, 2 total
→ Tests:       17 passed, 17 total
→ EXIT 0

pnpm --filter xbos-api exec jest --testPathPatterns=resolver-registry --no-coverage
→ Test Suites: 1 passed, 1 total
→ Tests:       11 passed, 11 total
→ EXIT 0
```

Counts match IMPL claim (hrm 17 / xbos 11).

---

## 2. Spot-check — plan §1.3 / §1.4 COVERED → real `it` names

### §1.3 Recruitment (G-DB-01 + helper)

| Plan gap row (claimed COVERED) | Real `it` / file | Verdict |
|-------------------------------|------------------|---------|
| create/PATCH hired without link → HIRE-400 | `G-DB-01 hire bind still requires employee_id when stage=hired` · `PATCH stage=hired without employee_id → HRM-REC-HIRE-400 (no stage stamp)` · `po-e2e-spine-01-be-cand-dto-01.spec.ts` | **OK** |
| hire-employee-link helper | `hire-employee-link.spec.ts`: `recognizes hired case-insensitively`; resolve prefer/fallback/reverse/null; assert 400/409/same-company; `assertHireEmployeeLinkOrThrow` unresolved/resolved | **OK** (10 its match plan §2 P0-1) |
| HIRE-409 cross-company | `cross-company employee → HRM-REC-HIRE-409` | **OK** |
| hire reverse link | `falls back to employees.candidate_id reverse SELECT` | **OK** |
| PATCH hired + explicit stamp | `PATCH stage=hired with explicit employee_id same company → stamps employee_id` | **OK** |

### §1.4 BR-WF-04

| Plan gap row | Real `it` / file | Verdict |
|--------------|------------------|---------|
| BR-WF-04 resolver skip-self **COVERED** | `describe('BR-WF-04 anti self-approve…')` · `direct_manager resolver skips submitter userId (depth guard)` · `fixed_user equal to submitter escalates off self when manager chain exists` · `resolver-registry.spec.ts` | **OK** |
| completeStepTask reject **PARTIAL / SPEC_GAP** | No `it` for `completeStepTask by submitter…` (plan §2 P0-3 second case not implemented) | **OK — correctly not COVERED** |

Plan columns need **no correction**.

---

## 3. HOLD confirmation (still open — do not invent)

| Hold | Plan status | Code invent check | Verdict |
|------|-------------|-------------------|---------|
| FR-UC-H03 advance-notice ≥3 calendar days (P0-4) | **MISSING** (§1.1) · §2 P0-4 HOLD | Grep `apps/api/**` — no advance-notice / today+3 leave unit | **HOLD intact** |
| Leave L2 ladder (GAP-LEAVE-LADDER-01 / LV-02) | **BLOCKED** — wait `T_L1` | Grep — no LEAVE-LADDER / T_L1 invent unit | **BLOCKED intact** |

---

## 4. Residual (explicit)

| Residual | Status | Action |
|----------|--------|--------|
| BR-WF-04 **completeStepTask** hard reject when submitter==approver | **SPEC_GAP** — no product seam; not invent | BA/SA only if LV-05 requires hard reject at complete |
| P0-4 advance-notice | HOLD | BA locks error code before unit |
| Leave L2 ladder | BLOCKED | Sponsor `T_L1` |

**cấm honored:** no seed · no invent ladder · no UAT DONE claim · no require completeStepTask reject without BA/SA.

---

## completion_report

**Closed:** QA re-ran jest (hrm-api 17 PASS · xbos-api 11 PASS); spot-checked all IMPL-claimed COVERED rows in plan §1.3 / §1.4 to real `it` names; HOLD advance-notice MISSING + ladder BLOCKED confirmed; BR-WF-04 complete reject remains SPEC_GAP (PARTIAL on plan — correct).

**Residual / open:** completeStepTask reject SPEC_GAP · P0-4 · leave L2 ladder `T_L1`. Unit wave T4 P0-1..P0-3 **verified** — not full API / not UAT DONE.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/po-spec-unit-test-impl-01-qa.md`

### next_dispatch_prompt

```text
work_item_id: PO-SPEC-UNIT-TEST-IMPL-01-QA-INTAKE
from_role: qa
to_role: pm
priority: P0
lane: governance

entry_criteria:
  - Read docs/qa/evidence/po-spec-unit-test-impl-01-qa.md
  - Plan docs/qa/PO_SPEC_UNIT_TEST_PLAN.md gap columns confirmed (no QA correction)

closed:
  - P0-1 hire-employee-link unit VERIFIED
  - P0-2 PATCH hired bind VERIFIED
  - P0-3 BR-WF-04 resolver skip-self VERIFIED
  - HOLD P0-4 + ladder unchanged

residual (do not invent):
  - BR-WF-04 completeStepTask reject = SPEC_GAP → ba-process/sa only if LV-05 product hard reject required
  - advance-notice code lock → ba-process
  - leave L2 ladder → sponsor T_L1

pm_action:
  - Update PO_SPEC_TEST_SUITE_PROGRAM T4 status / TEAM_WORKING_NOW
  - Do NOT claim UAT DONE from this unit wave
  - Optional next: ba-process SPEC_GAP packet for completeStepTask vs LV-05 OR continue program T3/T5 per roadmap

cấm: seed · invent ladder · invent complete reject · claim UAT DONE
```

### pm_dispatch_hint

`PO-SPEC-UNIT-TEST-IMPL-01` unit P0-1..P0-3 **QA PASS** → PM intake; residual SPEC_GAP complete reject → **ba-process** only if LV-05 requires product hard reject; hold advance-notice + ladder.
