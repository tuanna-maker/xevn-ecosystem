# Evidence — PO-UC-TC-W4-BE-WF-SELF-FD-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-BE-WF-SELF-FD-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **U65** | honored — unit mocks only; no seed |
| **prior residual** | `R-W4E1-SELF-FD-EVIDENCE` (`po-uc-tc-w4-qa-e1-p1-l2-self.md`) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **by-uc** | `docs/qa/professional/by-uc/UC-CC-P0-06.md` · TC-CC-P0-06-INB-SELF-FD-001 · CAP-INB-CTRL / FN-INB-SELF |
| **by-uc** | `docs/qa/professional/by-uc/UC-XBOS-CC-06.md` · TC-DM-CC-06-CV-SELF-FD-001 · CAP-CV-CTRL / FN-CV-SELF |
| **domain** | `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §3.1 — chống tự duyệt BR-WF-04 |
| **code** | `workflow-engine.service.ts` `completeStepTask` · prior SPEC_GAP in `po-spec-unit-test-impl-01.md` |
| **resolver (kept)** | `resolver-registry.ts` `resolveWithSelfApproveGuard` — assign-time skip-self unchanged |
| **must_keep** | Leave ladder untouched · inbox approve XBOS-WF-200 non-self · DEPT VAL-014 · clone paths · AUTH-003 |
| **forbidden** | seed · invent Leave L2 UAT · weaken AUTH-003 |

---

## Implemented

### BR-WF-04 on `completeStepTask`

After task load, before multi-hat / UPDATE:

- Parse `instance.context.submitter.userId` (or `user_id`)
- Normalize actor + submitter with `trim().toLowerCase()`
- When both non-empty and equal → **`ApiException('XBOS-WF-422', … BR-WF-04 …, 422)`**
- No status UPDATE / no advance / no HRM notify on self path

`@CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-BE-WF-SELF-FD-01` appended on service file.

### Jest (`workflow-engine.service.spec.ts`)

| Case | Expect |
|------|--------|
| actor `ceo@xe.vn` === submitter | **`XBOS-WF-422`** · no `SET status = 'completed'` |
| actor `CEO@xe.vn` (case) === submitter | **422** · message contains `BR-WF-04` |
| actor `manager.a@xe.vn` ≠ submitter `nv0003@xe.vn` | complete succeeds · `instanceCompleted=true` |

---

## Jest evidence

```text
pnpm --filter xbos-api exec jest --testPathPatterns=workflow-engine.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 17 passed · EXIT 0

pnpm --filter xbos-api exec jest --testPathPatterns=resolver-registry --no-coverage
→ Test Suites: 1 passed · Tests: 11 passed · EXIT 0 (must_keep assign-time BR-WF-04)
```

---

## Contract note (FE / QA)

| Path | Code | HTTP |
|------|------|------|
| Self-approve `POST …/tasks/:id/complete` | **`XBOS-WF-422`** | **422** |
| Non-self approve (unchanged) | **`XBOS-WF-200`** | **201** (controller ok envelope) |

Reject path / Leave ladder / DEPT / clone / AUTH-003: **not modified**.

---

## completion_report

**Closed:** BR-WF-04 enforced on `completeStepTask` when actor userId === instance submitter; stable `XBOS-WF-422` 4xx; Jest self-fail + non-self happy path; CODE-MEMORY APPEND; U65 no seed.

**Residual / open:**
- Browser self-approve FD still needs FE path with proven submitter=assignee (QA) — BE seam ready
- Leave L2 ladder still SPEC_GAP — not invented
- Unit plan row BR-WF-04 complete seam → can flip PARTIAL→COVERED by QA/PM after retest

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-SELF-FD-01
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
ack_status_target: PASS_TO_PM

## MISSION
Browser-only retest BR-WF-04 self-approve FD after BE seam on completeStepTask.

entry_criteria:
- L0 stack up (hrm :28001 · xbos :28002 · portal)
- BE evidence: docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-01.md (XBOS-WF-422 on self)
- U65 zero-seed · U76 HDSD · cấm invent Leave L2 · cấm seed inbox

exit_criteria:
1) Proven case: instance submitter.userId === actor who clicks Duyệt/complete
   → Network POST …/tasks/:id/complete → **4xx XBOS-WF-422** (message BR-WF-04)
   → task NOT completed · F5 still pending (or UI error)
2) Control: different approver on non-self task → **201 XBOS-WF-200** still works
3) Update by-uc TC-CC-P0-06-INB-SELF-FD-001 / TC-DM-CC-06-CV-SELF-FD-001 + residual R-W4E1-SELF-FD-EVIDENCE
4) Evidence: docs/qa/evidence/po-uc-tc-w4-qa-self-fd-01.md (HDSD inventory + click path + Network codes)
5) If FE spawn cannot prove submitter=approver → BLOCKED honest (not FAIL invent); cite BE unit PASS

cấm: pnpm seed:* · API seed inbox · invent Leave L2 UAT PASS · weaken AUTH-003
```
