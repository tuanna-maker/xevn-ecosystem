# Evidence — PO-UC-TC-W4-BE-WF-SELF-FD-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-BE-WF-SELF-FD-02` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **U65** | honored — no seed; live probe on existing pending inbox rows |
| **prior QA FAIL** | `docs/qa/evidence/po-uc-tc-w4-qa-self-fd-01.md` |
| **prior BE** | `docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-01.md` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **QA FAIL** | `po-uc-tc-w4-qa-self-fd-01.md` — self POST complete **201** vs expect **422** |
| **domain** | `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §3.1 BR-WF-04 |
| **by-uc** | UC-CC-P0-06 · TC-CC-P0-06-INB-SELF-FD-001 · UC-XBOS-CC-06 SELF-FD |
| **code** | `workflow-engine.service.ts` `completeStepTask` |
| **must_keep** | non-self **201** `XBOS-WF-200` · AUTH-003 · Leave L2 SPEC_GAP · resolver skip-self |
| **forbidden** | seed inbox · invent Leave L2 · weaken AUTH-003 |

---

## Root cause

1. **JOIN row shaping:** `SELECT t.*, …, i.context` left BR-WF-04 reading ambiguous `task.context`. LIVE fix prefers **`i.context AS instance_context`** + `parseInstanceContextFromTaskRow` (alias first, fallback `context`).
2. **Stale Nest / empty dist race:** `nest-cli` `deleteOutDir: true` + incremental `.tsbuildinfo` can wipe `dist/` then emit nothing; watch process served stale/broken module while Jest (src) stayed green. Cleared tsbuildinfo, full `tsc`, restarted **`start:prod`** on `:28002`.

---

## Implemented

- SQL in `completeStepTask`: `i.context AS instance_context`
- Helper `parseInstanceContextFromTaskRow` — prefer `instance_context`, fallback `context`
- Actor also accepts `body.user_id`
- `@CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-BE-WF-SELF-FD-02`
- Jest mocks use `instance_context`; assert SELECT contains alias; fallback `context` still rejects

---

## Jest

```text
pnpm --filter xbos-api exec jest --testPathPatterns=workflow-engine.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 17 passed · EXIT 0

pnpm --filter xbos-api exec jest --testPathPatterns=resolver-registry --no-coverage
→ Test Suites: 1 passed · Tests: 11 passed · EXIT 0 (must_keep)
```

---

## Live proof (U65 — no seed)

| Check | Result |
|-------|--------|
| L0 `GET /api/xbos` | **200** |
| Login `ceo@xe.vn` | **201** `XBOS-AUTH-200` |
| Pending assignee ceo | **42** tasks |
| **Self** task `3a537d82-…` · instance `15bc3761-…` · `hrm_candidate` · submitter=`ceo@xe.vn` | POST complete → **422** `XBOS-WF-422` «Self-approve forbidden… (BR-WF-04)» |
| After reject | task **pending** · instance **pending** · retry still **422** |
| **Control** task `c5ae80d8-…` · `hrm_catalog_extension` · submitter=`null` | POST complete → **201** `XBOS-WF-200` |

Runtime: xbos-api `node dist/main` on **28002** after clean rebuild (contains `instance_context` + Self-approve).

---

## Contract (unchanged semantics)

| Path | Code | HTTP |
|------|------|------|
| Self-approve complete | `XBOS-WF-422` | **422** |
| Non-self complete | `XBOS-WF-200` | **201** |

Leave L2 / AUTH-003 / reject path: **untouched**.

---

## completion_report

**Closed:** Live BR-WF-04 on `completeStepTask` via `instance_context` JOIN alias; Nest restarted on rebuilt dist; live self **422** + non-self **201**; Jest 17/17 + resolver 11/11; CODE-MEMORY APPEND; U65 no seed.

**Residual / open:**
- QA browser retest `PO-UC-TC-W4-QA-SELF-FD-02` (HDSD inbox Duyệt path)
- Leave L2 still SPEC_GAP — not invented
- Ops note: if `dist/` missing after watch, delete `tsconfig.build.tsbuildinfo` + `tsc -p tsconfig.build.json` before restart

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-02.md`

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-SELF-FD-02
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: PASS_TO_PM

## MISSION
Browser-only retest BR-WF-04 self-approve FD after BE SELF-FD-02 (instance_context JOIN + Nest restart).

entry_criteria:
- L0 stack up (hrm :28001 · xbos :28002 · portal)
- BE evidence: docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-02.md
  (live: self complete → 422 XBOS-WF-422; non-self → 201 XBOS-WF-200)
- U65 zero-seed · U76 HDSD · cấm invent Leave L2 · cấm seed inbox

exit_criteria:
1) Proven case: instance.context.submitter.userId === actor who clicks Duyệt
   → Network POST …/tasks/:id/complete → **422 XBOS-WF-422** (message BR-WF-04)
   → task NOT completed · F5 still pending
2) Control: non-self (submitter null or ≠ actor) → **201 XBOS-WF-200**
3) Update by-uc TC-CC-P0-06-INB-SELF-FD-001 / TC-DM-CC-06-CV-SELF-FD-001
   + close residual R-W4E1-SELF-BR-WF-04 if PASS
4) Evidence: docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02.md (HDSD inventory + Network)
5) If FAIL again → FAIL_TO_PM with Network capture (do not invent Leave L2)

cấm: pnpm seed:* · API seed inbox · invent Leave L2 UAT PASS · weaken AUTH-003
```
