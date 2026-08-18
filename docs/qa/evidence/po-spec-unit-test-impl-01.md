# Evidence — PO-SPEC-UNIT-TEST-IMPL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-SPEC-UNIT-TEST-IMPL-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2.2 / T4 |
| **plan** | `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` §2 |
| **U65** | honored — unit-only mocks; no seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **unit_plan** | `PO_SPEC_UNIT_TEST_PLAN.md` §2 P0-1..P0-3 · hold P0-4 / ladder |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §17.2–17.3 FR-HRM-INT-01 / G-DB-01 |
| **hire helper** | `apps/api/hrm-api/src/recruitment/hire-employee-link.ts` (`HRM-REC-HIRE-400` / `409`) |
| **catalog** | `RecruitmentCatalogService.updateCandidatePool` hired bind |
| **wf** | `resolver-registry.ts` `resolveWithSelfApproveGuard` (depth &lt; 2 skip-self) |
| **change_mode** | ADD (test-only + LastVerified APPEND on hire helper) |
| **must_keep** | leave VAL-ATT · candidate DTO · manager_id specs green |
| **forbidden** | invent leave ladder · advance-notice without BA code · seed · claim UAT DONE |

---

## Implemented

### P0-1 — `hire-employee-link.spec.ts` (new)

| Case | Expect |
|------|--------|
| `isHiredStage` case-insensitive | true/false |
| `resolveHireEmployeeId` prefer explicit | no DB |
| fallback existing | no DB |
| reverse `employees.candidate_id` | SELECT returns id |
| cold/empty | null |
| missing employee | **`HRM-REC-HIRE-400`** |
| cross-company | **`HRM-REC-HIRE-409`** |
| same company | returns uuid |
| unresolved `assertHireEmployeeLinkOrThrow` | **`HRM-REC-HIRE-400`** |
| resolved + same company | returns id |

### P0-2 — PATCH `updateCandidatePool` hired bind

File: `po-e2e-spine-01-be-cand-dto-01.spec.ts`

| Case | Expect |
|------|--------|
| PATCH `stage=hired` no `employee_id` / reverse | **`HRM-REC-HIRE-400`**, no UPDATE stage stamp |
| PATCH `stage=hired` + explicit same company | UPDATE stamps `employee_id` |

### P0-3 — BR-WF-04

File: `resolver-registry.spec.ts`

| Case | Expect |
|------|--------|
| `direct_manager` resolves to submitter email | escalates → assignee ≠ submitter |
| `fixed_user` = submitter + manager chain | escalates off self |

**completeStepTask reject for submitter==approver:** **not implemented** — no product seam (complete does not check submitter vs assignee). Residual SPEC_GAP for BA/SA if LV-05 requires hard reject at complete (not invent reject in this wave).

### Hold (unchanged)

- P0-4 advance-notice ≥3 calendar days — wait BA error code  
- Leave L2 ladder — BLOCKED without sponsor `T_L1`

---

## Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=hire-employee-link --testPathPatterns=po-e2e-spine-01-be-cand-dto --no-coverage
→ Test Suites: 2 passed · Tests: 17 passed · EXIT 0

pnpm --filter xbos-api exec jest --testPathPatterns=resolver-registry --no-coverage
→ Test Suites: 1 passed · Tests: 11 passed · EXIT 0

must_keep regression:
pnpm --filter hrm-api exec jest --testPathPatterns=leave-requests.service.spec --testPathPatterns=employee-manager.validation --no-coverage
→ Test Suites: 2 passed · Tests: 41 passed · EXIT 0
```

---

## Plan gap column updates

| Plan row | Before | After |
|----------|--------|-------|
| create/PATCH hired no link | PARTIAL | **COVERED** |
| hire-employee-link helper | MISSING | **COVERED** |
| HIRE-409 cross-company | MISSING | **COVERED** |
| reverse link resolve | MISSING | **COVERED** |
| BR-WF-04 | MISSING | **COVERED** (resolver) / **PARTIAL** (complete reject SPEC_GAP) |
| advance-notice / ladder | MISSING / BLOCKED | unchanged HOLD |

---

## completion_report

**Closed:** P0-1 hire-employee-link unit (HIRE-400/409 + resolve priority + reverse); P0-2 PATCH updateCandidatePool hired bind; P0-3 BR-WF-04 resolver skip-self units; plan gap columns updated; LastVerified on `hire-employee-link.ts` APPEND; must_keep leave VAL-ATT + manager_id green.

**Residual / open:**
- BR-WF-04 **completeStepTask** hard reject when submitter completes own leave task — SPEC_GAP (no seam); do not invent
- P0-4 advance-notice — BA code lock
- Leave L2 ladder — sponsor `T_L1`
- QA spot-check plan rows → COVERED

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/po-spec-unit-test-impl-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-SPEC-UNIT-TEST-IMPL-01-QA
from_role: pm
to_role: qa
priority: P0
lane: execution

entry_criteria:
  - Read docs/qa/evidence/po-spec-unit-test-impl-01.md
  - Read docs/qa/PO_SPEC_UNIT_TEST_PLAN.md gap columns (COVERED updates)
  - U65 no seed

re-verify:
  1) Re-run jest:
     pnpm --filter hrm-api exec jest --testPathPatterns=hire-employee-link --testPathPatterns=po-e2e-spine-01-be-cand-dto --no-coverage
     pnpm --filter xbos-api exec jest --testPathPatterns=resolver-registry --no-coverage
  2) Spot-check plan §1.3 / §1.4 rows that IMPL claimed COVERED map to real `it` names
  3) Confirm HOLD rows still BLOCKED/MISSING: advance-notice · leave L2 ladder
  4) Note residual: BR-WF-04 completeStepTask reject = SPEC_GAP (not COVERED for complete path)

exit_criteria:
  - evidence_path: docs/qa/evidence/po-spec-unit-test-impl-01-qa.md
  - ack_status PASS_TO_PM
  - matrix/plan status columns confirmed or corrected

cấm: seed · invent ladder unit · claim UAT DONE · require completeStepTask reject without BA/SA product decision
```

### pm_dispatch_hint

`PO-SPEC-UNIT-TEST-IMPL-01-QA` → **qa** spot-check COVERED; residual SPEC_GAP complete reject → ba-process only if LV-05 requires product hard reject.
