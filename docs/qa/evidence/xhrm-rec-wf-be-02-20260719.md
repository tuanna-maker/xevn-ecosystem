# XHRM-REC-WF-BE-02 — Fix submit-workflow scope context (Dev-BE)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BE-02` |
| **from_role** | dev-be |
| **to_role** | qa → pm |
| **date** | 2026-07-19 |
| **change_mode** | FIX |
| **residual_auto_fix** | true |
| **ack_status** | **READY_FOR_QA** |
| **parent_fail** | `docs/qa/evidence/xhrm-rec-wf-qa-01-20260719.md` · D-XHRM-REC-WF-SUBMIT-SCOPE |

## spec_read_ack

- srs: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · J-REC-WF-02 · AC-REC-WF-*
- tech_spec: `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` §3–§6
- prior BE: `docs/qa/evidence/xhrm-rec-wf-be-01-20260719.md`
- QA FAIL: `docs/qa/evidence/xhrm-rec-wf-qa-01-20260719.md` — `tenantId?.trim is not a function` HTTP 500

## Root cause (closed)

`submitJobRequisitionWorkflow` passed Nest `@Headers()` bag into `toHrmListScopeContext`, which expected `string | undefined` and called `.trim()` → **500** `HRM-SYS-001`.

## Fix

1. **Call site:** `toHrmListScopeContext(tenantId)` from `@Headers('x-tenant-id')` — mirrors list/get/update requisitions.
2. **Helper guard:** `typeof tenantId !== 'string'` → `undefined` (no throw) — belt-and-suspenders for future misuse.
3. **@CODE-MEMORY-CHANGE** on `recruitment.controller.ts` + `hrm-list-scope-context.ts`.

## Sibling audit

| Endpoint | Scope / tenant usage | Verdict |
|----------|----------------------|---------|
| `POST .../requisitions/:id/submit-workflow` | `toHrmListScopeContext(tenantId)` | **FIXED** |
| `POST .../recruitment-plans/:id/submit-workflow` | No `toHrmListScopeContext`; passes `tenantId` string in options | **OK** (already 201 SPAWN-MISSING in QA) |
| `POST .../candidates-pool/:id/start-pipeline` | Same pattern as plan | **OK** |
| Leave / catalog bridges | Untouched | **must_keep** |
| Other HRM controllers using helper | All `toHrmListScopeContext(tenantId)` | **OK** (grep: no `headers` arg) |

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="hrm-list-scope-context.spec|recruitment.controller.spec|recruitment.service.spec|recruitment-catalog.service.spec|recruitment-workflow.bridge|p1-phase1-be-rec-patch|p1-phase1-be-crud-rd-parity|leave-workflow.bridge.spec" --no-coverage
→ Test Suites: 8 passed | Tests: 53 passed (incl. new helper 3 + submit-workflow spawnMissing)
```

Coverage for exit criteria:

- submit-workflow → `HRM-REC-WF-200` + `spawnMissing: true` when def missing (**not** 500)
- scope arg is `{ tenantId: 'xevn' }` (string), not headers bag
- helper does not throw on object-shaped misuse
- leave-workflow.bridge + recruitment-workflow.bridge PASS (must_keep)

## must_keep

| ID | Evidence |
|----|----------|
| Leave bridge | `leave-workflow.bridge.spec` PASS — no code touch |
| Catalog / F6 | recruitment-workflow map specs PASS — no F6 REPLACE |
| UF-HRM-12 | `p1-phase1-be-rec-patch` / crud-rd-parity PASS |

## Forbidden honored

- No seed · no leave/catalog REPLACE · no F6 enum REPLACE · no Phase1/PROD claim

## Residual (QA)

- Browser retest **J-REC-WF-02** U65: «Gửi duyệt QT» → 2xx SPAWN-MISSING **or** instance id (if def exists via FE canvas)
- J-03/06 remain blocked until FE-created def + spawn produces inbox task (U65 cấm seed)

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-02
from_role: pm
to_role: qa
lane: execution
change_mode: RETEST
residual_auto_fix: true

## read_first
1. docs/qa/evidence/xhrm-rec-wf-be-02-20260719.md
2. docs/qa/evidence/xhrm-rec-wf-qa-01-20260719.md (prior FAIL)
3. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md J-REC-WF-02

## entry
L0 stack up; U65 zero-seed; browser-only; persona ceo@xe.vn

## deliver
1. Retest J-REC-WF-02: Recruitment → Yêu cầu → Gửi duyệt QT
   - Network POST .../requisitions/:id/submit-workflow → **2xx** (not 500)
   - FE: SPAWN-MISSING banner if no def, OR workflow_instance_id when def active
2. Smoke J-REC-WF-04 still SPAWN-MISSING/2xx; UF-HRM-12 create without WF still PASS
3. If spawn succeeds with instance → attempt J-03/06 inbox (still no seed)
4. Evidence: docs/qa/evidence/xhrm-rec-wf-qa-02-YYYYMMDD.md

## exit
PASS_TO_PM or FAIL_TO_PM with residual table; no Phase1/PROD claim
```

## ack_status

**READY_FOR_QA**
