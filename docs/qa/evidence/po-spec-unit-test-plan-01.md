# Evidence — PO-SPEC-UNIT-TEST-PLAN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-SPEC-UNIT-TEST-PLAN-01` |
| **from_role** | pm+po |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2.2 |
| **deliverable** | `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` |
| **U65** | honored — plan only; no seed; no jest impl this Task |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **program** | `PO_SPEC_TEST_SUITE_PROGRAM.md` §2.2 Unit Test Plan columns |
| **api_contract** | `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` Leave / Employees / Recruitment / Workflows paths |
| **api_contract_new** | **MISSING on disk** — binding codes from TECHSPEC + BE evidence (`HRM-LEAVE-VAL-ATT`, `HRM-REC-HIRE-*`, `HRM-EMP-MGR-*`) |
| **tech_spec** | `docs/hrm/TECHSPEC.md` FR-HRM-AT-10/12/13 · RC-03 · INT-01 · EM manager |
| **ba_matrix** | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` HP-04 · LV-03/04 · LV-02 HOLD · LV-05 BR-WF-04 |
| **be evidence** | `po-e2e-spine-02-be-lv03-val-att-01` · `po-e2e-spine-01-be-cand-dto-01` · `r-spine-mgr-hier-01-be` · inbox BE-INBOX-01 |
| **change_mode** | ADD (plan artifact only) |
| **must_keep** | leave VAL-ATT GWC · manager_id must_keep leave list SQL · dual recruitment · U65 |
| **forbidden** | invent leave ladder unit without `T_L1` · seed · claim full API coverage · implement jest (except cite) |

---

## Method (grep / cite — no product code)

1. Grep jest `describe`/`it` in:
   - `leave-requests.service.spec.ts` (VAL-ATT LVT_02 / sick / overlap / balance / approve)
   - `employee-manager.validation.spec.ts` + `employees.service.spec.ts` (`HRM-EMP-MGR-CYCLE` / SELF / SCOPE)
   - `po-e2e-spine-01-be-cand-dto-01.spec.ts` (CreateCandidateDto + create hired 400)
   - `recruitment-workflow.bridge.spec.ts` (hire AC skip/stamp)
   - `workflow-inbox-display.spec.ts` + `workflow-engine.service.spec.ts` (subjectTitle)
2. Confirmed **absent**: `be-hrm-g-db-01-hire-link-01.spec.ts` / `hire-employee-link.spec.ts` (CODE-MEMORY LastVerified stale).
3. Confirmed **no** `it` for `HRM-REC-HIRE-409` or PATCH `updateCandidatePool` hired bind.
4. LV-02 ladder → **BLOCKED** in plan (not MISSING Dev).

---

## Verdict snapshot

| P0 theme | Gap |
|----------|-----|
| Leave VAL-ATT (sick / LVT_02 / metadata) | **COVERED** |
| Leave approve/reject happy + scope | **COVERED** |
| Leave L2 day ladder | **BLOCKED** (`T_L1`) |
| Candidate DTO whitelist FE | **COVERED** |
| G-DB-01 create hired no link | **PARTIAL** |
| G-DB-01 hire-employee-link + HIRE-409 + PATCH hired | **MISSING** |
| Employee `manager_id` cycle/self/scope | **COVERED** |
| Inbox display_title stamp | **COVERED** |
| BR-WF-04 / LV-05 self-approve unit | **MISSING** (PARTIAL product) |
| Advance notice ≥3 calendar days | **MISSING** (hold code name) |

**Top MISSING for Dev:** §2 P0-1 + P0-2 in `PO_SPEC_UNIT_TEST_PLAN.md`.

---

## completion_report

**Closed:** Published unit test plan matrix for spine P0 endpoints (leave VAL-ATT, candidates DTO, manager_id, hire G-DB-01, workflow inbox) with COVERED|PARTIAL|MISSING|BLOCKED; listed copy-ready jest `describe`/`it` names for MISSING P0; did **not** implement jest; did **not** invent leave ladder units.

**Residual / open:**
- `PO-SPEC-UNIT-TEST-IMPL-01` — dev-be implement MISSING P0-1..P0-3
- `API_CONTRACT_NEW.md` restore (docs) — process residual for SA/ba-docs (not blocking unit names)
- Catalog T1 / Report T3 — separate waves

**ack_status:** PASS_TO_PM  
**next_owner:** pm → **dev-be**  
**evidence_path:** `docs/qa/evidence/po-spec-unit-test-plan-01.md`  
**plan_path:** `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md`

### next_dispatch_prompt

```text
work_item_id: PO-SPEC-UNIT-TEST-IMPL-01
from_role: pm
to_role: dev-be
priority: P0
lane: execution

entry_criteria:
  - Read docs/qa/PO_SPEC_UNIT_TEST_PLAN.md §2 MISSING P0
  - Cite evidence docs/qa/evidence/po-spec-unit-test-plan-01.md
  - U65 no seed

implement (order):
  1) Create apps/api/hrm-api/src/recruitment/hire-employee-link.spec.ts — describe/it names in plan §2 P0-1
     (isHiredStage, resolveHireEmployeeId, assertEmployeeInCandidateCompany HIRE-400/409, assertHireEmployeeLinkOrThrow)
  2) Extend catalog/cand-dto spec — PATCH updateCandidatePool stage=hired without employee_id → HRM-REC-HIRE-400; with valid employee_id stamps (§2 P0-2)
  3) XBOS BR-WF-04 unit — resolver skip-self + completeStepTask reject when submitter==approver (§2 P0-3); do not weaken must_keep leave/recruit bridges

hold:
  - P0-4 advance-notice until BA locks error code
  - Leave L2 ladder units — cấm without sponsor T_L1

exit_criteria:
  - pnpm --filter hrm-api exec jest --testPathPatterns=hire-employee-link --testPathPatterns=po-e2e-spine-01-be-cand-dto --no-coverage EXIT 0
  - pnpm --filter xbos-api exec jest --testPathPatterns=resolver-registry --testPathPatterns=workflow-engine.service --no-coverage EXIT 0 (for P0-3)
  - evidence_path: docs/qa/evidence/po-spec-unit-test-impl-01.md
  - ack_status READY_FOR_QA
  - CODE-MEMORY APPEND on touched files; fix LastVerified path for hire-employee-link.ts

cấm: seed · invent leave ladder N · claim full API coverage · touch leave VAL-ATT happy path except regression run
```

### pm_dispatch_hint

`PO-SPEC-UNIT-TEST-IMPL-01` → **dev-be** — top MISSING = G-DB-01 `hire-employee-link.spec.ts` + PATCH hired bind; then BR-WF-04 unit on xbos-api.
