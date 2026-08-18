# XHRM-REC-WF-BE-01 — Recruitment Workflow Bridge (Dev-BE)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa → pm |
| **date** | 2026-07-19 |
| **change_mode** | UPGRADE |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

- srs: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · UC-HRM-REC-WF-01..06 · BR-REC-WF-01..14
- tech_spec: `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` §3–§6 (Option A Accepted)
- data_contract: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md` §2–§7
- sponsor_confirm: ADR Accepted 2026-07-19 · ba-data PASS_TO_PM

## Closed

1. **RecruitmentWorkflowBridge** (NEW parallel Leave) — spawn three `workflow_code` values; persist `workflow_instance_id` on `recruitment_plans`, `job_requisitions`, `candidates`
2. **POST** `/api/hrm/recruitment/workflow/step` + `/terminal` — DTO per data contract §5; `isAuthorizedInternalRequest`
3. **1:1 map** `rec_intake|screening|interview|offer` → F6 stages; fail-closed `HRM-REC-WF-STAGE-UNMAPPED` (422); `HRM-REC-WF-LOCKED` (409); `HRM-REC-WF-SPAWN-MISSING`; `HRM-REC-WF-CALLBACK-SKIP`
4. **XBOS** `notifyHrmRecruitmentCallback` ADDITIVE — leave `notifyHrmLeaveTerminal` URL/body untouched
5. **OpenAPI** `hrm-api.yaml` + `xbos-api.yaml` same change set (ADR §5)
6. **Submit/start entry points:** `POST .../submit-workflow`, `POST .../start-pipeline`
7. **@CODE-MEMORY** on bridge/controller + `@CODE-MEMORY-CHANGE` on service/catalog/engine

## must_keep verified (jest)

| must_keep | Evidence |
|-----------|----------|
| LeaveWorkflowBridge | `leave-workflow.bridge.spec.ts` PASS (untouched contract) |
| UF-HRM-12 / J-HRM-05 | recruitment service + patch + rd-parity specs PASS |
| AC-CD-F6-* | map helpers only use 6 F6 codes; no enum REPLACE |
| F4 resolver | leave resolve path unchanged |

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="recruitment-workflow.bridge|recruitment.service.spec|recruitment-catalog.service.spec|p1-phase1-be-rec-patch|p1-phase1-be-crud-rd-parity|leave-workflow.bridge.spec|recruitment.controller.spec" --no-coverage
→ Test Suites: 7 passed | Tests: 48 passed
```

VAL coverage: map 1:1, UNMAPPED, LOCKED, hire_ac_unmet SKIP, hired, rejected, duplicate terminal, plan/req step noop, spawn OK / SPAWN-MISSING.

## Residual (FE / QA)

- FE: roadmap bind synced stage; disable PATCH bypass when `workflow_instance_id` active; SPAWN-MISSING banner (`XHRM-REC-WF-FE-01`)
- QA: J-REC-WF-01..06 U65 browser; regression UF-HRM-12 / leave / catalog — **no seed**
- Optional: cancel-instance API (`cancelled`) deferred

## Forbidden (honored)

- No REPLACE F6 stage enum; no REPLACE leave/catalog bridges; no seed; no Phase1/PROD claim

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-FE-01
from_role: pm
to_role: dev-fe
lane: execution
change_mode: UPGRADE

## read_first
1. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2–§6
2. docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §7–§8
3. docs/qa/evidence/xhrm-rec-wf-be-01-20260719.md
4. apps/api/hrm-api recruitment submit-workflow / start-pipeline / workflow callbacks (contract only)

## deliver
1. Bind roadmap / funnel chips to API stage after WF sync (AC-CD-F6 columns unchanged)
2. Disable direct stage/status approve when workflow_instance_id active (409 LOCKED)
3. SPAWN-MISSING banner when submit returns spawnMissing / null instance
4. Wire submit-workflow + start-pipeline from FE (U65 FE-only)
5. @CODE-MEMORY per data contract §10

## must_keep
UF-HRM-12, J-HRM-05, AC-CD-F6-*, Leave/Catalog bridges

## forbidden
REPLACE F6 enum; seed inbox; Phase1/PROD claim

## exit
READY_FOR_QA + evidence docs/qa/evidence/xhrm-rec-wf-fe-01-YYYYMMDD.md
```
