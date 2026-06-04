# P1-HRM-CRUD-TM-TRAINING-W1

Date: 2026-06-02  
Owner: technical-manager  
Scope: immediate coaching package for CRUD delivery quality (execution lane)

## 1) CRUD quality signals reviewed (why this package exists)

- `docs/qa/evidence/cc-legal-entity-save-crud-20260601.md`: real CRUD broke on holding save path (early return, UUID resolution mismatch, poor error visibility at footer action).
- `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r4-20260601.md`: P0 crash closed, but GWC remained (`iframeBodyLen: 0`) proving "console clean" is not enough for CRUD readiness.
- `docs/qa/evidence/p1-s2-fe-01-action-buttons-20260524.md`: capability wiring + disabled reason pattern works when tested and registry-driven.
- `docs/ecosystem/ACTION_BUTTON_INVENTORY.md`: capability inventory is available and must be used as source-of-truth for button/API mapping.
- `docs/program/TEAM_OPERATING_MODEL.md`: execution ownership is Dev+QA; PM/TA enforce handoff and residual closure loop.

## 2) Role checklists (short, actionable, enforceable)

### Dev-BE checklist (contract validation, deterministic errors, tests)

- [ ] Validate all CRUD DTO fields explicitly (no silent coercion for `company_id`, id, pagination fields).
- [ ] Return deterministic error envelope for validation/authorization/business conflict (`code`, `message`, optional `details`) with stable codes.
- [ ] Enforce scope parity between list and get-by-id in same module before `READY_FOR_QA`.
- [ ] For C/U/D, ensure idempotent and auditable behavior (repeat submit, missing id, mismatched scope).
- [ ] Add/extend tests for positive + negative CRUD branches in touched module (`test` must include reject path assertions).

### Dev-FE checklist (CRUD UX states, API error handling, no silent fallback)

- [ ] Every C/R/U/D interaction has explicit UI states: loading, success, empty, error.
- [ ] Show error near action point (button/form), not only at panel top; include deterministic error code when available.
- [ ] Never silently fallback to mock/localhost path if API call fails; fail closed and show actionable error.
- [ ] Respect capability registry mapping (`capability_code`, `wireMode`, disabled reason) before enabling action buttons.
- [ ] Validate required inputs before submit and preserve user input on API error for quick retry.

### QA checklist (C/R/U/D evidence, negative cases, reproducibility)

- [ ] Evidence must show all CRUD paths: create, read/list-detail, update, delete (or explicit N/A with reason).
- [ ] Include negative cases: invalid payload, missing scope, cross-company mismatch, and retry behavior.
- [ ] Reproducibility required: account, route, command list, timestamp, and exact expected/actual API codes.
- [ ] Verify UI and API together (not API-only): button state, banner location, table refresh, detail consistency.
- [ ] Gate rule: PASS only when no hidden fallback and no residual that blocks business action; otherwise `FAIL_TO_PM` or GWC with owner.

### PM dispatch checklist (handoff packet quality, zero-residual loop)

- [ ] Dispatch packets include full contract fields: `work_item_id`, entry/exit criteria, evidence path, owner, `ack_status`.
- [ ] Reject incomplete handoff (missing `completion_report` or `next_dispatch_prompt`) as `INVALID-HANDOFF`.
- [ ] After `PASS_TO_PM`, dispatch next owner in same session (no defer-only closure message).
- [ ] Apply zero-residual loop: any open P0/P1/P2 CRUD defect gets immediate owner dispatch.
- [ ] Keep capability inventory and QA evidence aligned when promoting status to QC/user.

## 3) Strict pre-merge mini-gate for CRUD changes

Fail-closed policy: any missing command result or missing evidence artifact = NOT READY.

### Required commands

```bash
pnpm --filter hrm-api test
pnpm --filter web-portal test
pnpm --filter web-portal build
pnpm run qc:dev-stack
pnpm run verify:capabilities -- --group A1
pnpm run test:pilot:flows
```

If scope touches platform shared libs or release path, add:

```bash
pnpm run build:platform-core
pnpm run test:system:uat
```

### Required evidence in the same wave

- One QA evidence file under `docs/qa/evidence/` showing CRUD C/R/U/D table + negative cases.
- Capability mapping reference (from `ACTION_BUTTON_INVENTORY.md` or updated registry rows).
- Handoff packet with explicit residual section and next owner.
- For any GWC: owner + closure condition + re-test command must be listed.

## 4) Immediate adoption rule for next waves

- Use this checklist at dispatch time (not after defects happen).
- No CRUD wave can claim DONE with only route-load/API-200 proof.
- Quality bar is executable C/R/U/D behavior + deterministic error handling + reproducible evidence.
