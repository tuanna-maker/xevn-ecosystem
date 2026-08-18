# XHRM-REC-WF-BE-SPAWN-02 — Group CEO submitter.employeeId resolve

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BE-SPAWN-02` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-19 |
| **lane** | execution |
| **change_mode** | FIX |
| **parent_fail** | `docs/qa/evidence/xhrm-rec-wf-qa-canvas-02-20260719.md` |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · data contract §4.3 |

## Root cause

CANVAS-02: payload class closed (no XBOS-WF-400). Live `ceo@xe.vn` still SPAWN-MISSING because `resolveSubmitterEmployeeId` only matched `employees.email`. Dense holding workforce skips `ensureSeedData` bootstrap (`ceo@xe.vn` / NV001), so Group CEO portal identity has **no** employees row by email.

## Fix (product — not QA seed)

| Step | Resolve path |
|------|----------------|
| 1 | Explicit `submitterEmployeeId` |
| 2 | UUID `submitterUserId` |
| 3 | `employees.email` (company expand + email-only) — SPAWN-01 |
| 4 | `user_company_memberships.employee_id` by portal email |
| 5 | Holding master: `PORTAL-GCEO` code, or bootstrap id when email already `ceo@xe.vn` |
| 6 | **Idempotent ensure** holding employee (`PORTAL-GCEO` / `ceo@xe.vn`) for documented portal Group CEO only |

Unknown emails still fail-closed SPAWN-MISSING (no XBOS call). Leave bridge + F6 `REC_WF_TASK_TYPE_TO_STAGE` untouched.

## Jest evidence

```text
pnpm --filter hrm-api exec jest \
  src/recruitment/recruitment-workflow.bridge.spec.ts \
  src/attendance/leave-workflow.bridge.spec.ts \
  --no-coverage
→ Test Suites: 2 passed · Tests: 22 passed
```

| Case | Assert |
|------|--------|
| unresolved `unknown@xe.vn` | SPAWN-MISSING; **no** fetch |
| email resolve (SPAWN-01) | instance id + body.employeeId |
| **SPAWN-02 ensure** `ceo@xe.vn` no email row | INSERT holding `PORTAL-GCEO` → `workflow_instance_id` set |
| **SPAWN-02 membership** | membership.employee_id used; no INSERT |

## Forbidden honored

- No `pnpm seed:*` / inbox seed / QA DB mutate for evidence
- No Phase1 / PROD claim
- Leave bridge + F6 map not modified (must_keep UF-HRM-12 · F6)

## Residual for QA

- Browser retest J-REC-WF-02 prefer instance when def active (`ceo@xe.vn`); then J-03/06
- First spawn after fix may log `HRM-REC-WF-SUBMITTER-ENSURE` once (product ensure)

## completion_report

**Closed:** Group CEO portal identity resolves to valid `employees.id` (membership / holding master / ensure); unresolved still SPAWN-MISSING; jest spawn success when def active simulated; leave + F6 must_keep.

**Open:** Browser QA canvas retest.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-CANVAS-03
from_role: pm
to_role: qa
lane: execution
change_mode: RETEST
residual_auto_fix: true

## entry
XHRM-REC-WF-BE-SPAWN-02 READY_FOR_QA — docs/qa/evidence/xhrm-rec-wf-be-spawn-02-20260719.md
U65 zero-seed · browser-only · ceo@xe.vn
Defs already active from J-REC-WF-01

## deliver
1. J-REC-WF-02: Gửi duyệt QT → prefer workflow_instance_id NOT null / spawnMissing false (Network XBOS start 2xx + HRM persists id)
2. If spawn PASS: J-REC-WF-03 approve + J-REC-WF-06 reject (Inbox → HRM sync → F5)
3. Regression: UF-HRM-12 · AC-CD-F6 · leave tab smoke
4. Evidence: docs/qa/evidence/xhrm-rec-wf-qa-canvas-03-20260719.md

## cấm
seed · Phase1/PROD claim · PASS only on probe without FE click path
```

## ack_status

**READY_FOR_QA**
