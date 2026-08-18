# Evidence — PO-E2E-SPINE-01-BE-INBOX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-BE-INBOX-01` |
| **from** | pm → **dev-be** |
| **date** | 2026-08-03 |
| **prior** | `docs/qa/evidence/po-e2e-spine-01-qa-w2.md` SP3 🟡 — stamp `SP2SDD8FM8` absent |
| **U65** | zero-seed · no inbox seed · no fake step_task rows |
| **ack_status** | **READY_FOR_QA** |
| **next** | `PO-E2E-SPINE-01-QA-W3` (HP-03 inbox) |

## spec_read_ack

- srs / program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` · E2E-SPINE-01 · HP-03
- journeys: J-REC-WF-02/03 · UF-XBOS-08 · UF-HRM-12
- ADR: `ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE` · ADR group CEO main↔holding
- QA W2: instance `5590cbb1-80ff-4c1b-af72-4a78ce3a3782` · requisition `34a421e7-33df-4c8b-b96c-559082b78086`
- submit URL used `company_id=holding` while portal persona `companyId=main`

## Root cause (product — not seed)

| Hypothesis | Finding |
|------------|---------|
| Assignee wrong (admin only) | **Partial** — role fan-out created `admin@xe.vn` **and** `ceo@xe.vn` via `ensureGroupApproverAmongInboxSteps`. CEO task **was** in GET `assigneeUserId=ceo@xe.vn`. |
| holding vs main list filter | **Not blocker** — inbox tasks filter by assignee (+ tenant), not company slug. Instance `company_id=holding` still listed for Group CEO. |
| Stamp / title missing on card | **P0** — spawn context lacked `subjectTitle`; Inbox card title = generic definition name `Phê duyệt yêu cầu tuyển dụng HRM` → QA `thisWave=false` despite `priorRec=true`. |

## Fix (ADD / UPGRADE)

1. **HRM** `recruitment-workflow.bridge.ts` — `resolveBusinessSubjectTitle` → pass `context.subjectTitle` / `businessTitle` on XBOS `instances/start` (YCTD title / plan / candidate).
2. **XBOS** `workflow-inbox-display.ts` — `enrichWorkflowInboxTaskRow` composes `display_title` and sets `workflow_name` (FE maps UnifiedTask.title from these fields).
3. **XBOS** `WorkflowEngineService.listStepTasks` — enrich + soft **backfill** subject from HRM GET requisition (holding↔main retry) for legacy this-wave rows; persist into instance context.
4. **XBOS** recruitment spawn — keep `ensureGroupApproverAmongInboxSteps(..., ceo@xe.vn)` so role_code fan-out cannot omit portal CEO.

### must_keep

- Leave / AUTH / EMP / CAT CLOSED lanes untouched
- U65 — no seed inbox
- Assignee filter semantics preserved

## Live verify (no seed)

Env: xbos-api `:28002` rebuilt `dist` · hrm-api `:28001` · probe `scripts/_tmp-po-e2e-inbox-probe.mjs` (dev internal key).

| Check | Result |
|-------|--------|
| HRM GET requisition `34a421e7-…?company_id=holding` | **200** title=`YCTD HireToPay SP2SDD8FM8` · `workflow_instance_id=5590cbb1-…` · status `pending_approval` |
| GET `/workflow-engine/tasks?assigneeUserId=ceo@xe.vn` hit | task `f01d0f12-…` · assignee **`ceo@xe.vn`** · `company_id=holding` |
| `workflow_name` / `subject_title` | **`… · YCTD HireToPay SP2SDD8FM8`** · subject_title set |
| Persona for QA W3 | **`ceo@xe.vn` / `Xevn@2026`** · portal `companyId=main` · Inbox `/command-center/inbox` |

## Tests (no seed)

| Suite | Result |
|-------|--------|
| `xbos-api` workflow-inbox-display + workflow-engine.service + apply-scope + resolver-registry | **41/41 PASS** |
| `hrm-api` recruitment-workflow.bridge.spec | **20/20 PASS** (spawn body `context.subjectTitle`) |
| `web-portal` commandCenterInboxApi.test.ts | **6/6 PASS** |

## Residual

| ID | Note |
|----|------|
| R-PO-SPINE01-INBOX-THISWAVE | **CLOSED for BE** — stamp now on CEO task title; QA browser HP-03 must retest |
| Parallel admin@ task | Expected any-of fan-out; CEO still has pending task — do not seed |
| leave VAL-ATT | Parallel WI — pre-existing hrm `tsc` TS2345 on leave-requests — not touched |

## Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/po-e2e-spine-01-be-inbox-01.md
work_item_id: PO-E2E-SPINE-01-QA-W3
```

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-QA-W3
role: qa
priority: P1
entry_criteria: PO-E2E-SPINE-01-BE-INBOX-01 READY_FOR_QA · docs/qa/evidence/po-e2e-spine-01-be-inbox-01.md · L0 stack · U65 zero-seed
task: Browser-only HP-03 / J-REC-WF-03 — ceo@xe.vn / Xevn@2026 · companyId=main → /command-center/inbox → find THIS-WAVE stamp SP2SDD8FM8 / YCTD HireToPay (instance 5590cbb1… or new FE submit if stale) → Duyệt 2xx → F5. Cấm prior-task approve · cấm seed inbox. If stamp absent after BE deploy, FAIL_TO_PM with Network GET tasks JSON.
exit_criteria: thisWave=true + approve 2xx OR honest BLOCKED; evidence docs/qa/evidence/po-e2e-spine-01-qa-w3.md · PASS_TO_PM
cấm: pnpm seed:* · API inbox seed · invent tasks
```
