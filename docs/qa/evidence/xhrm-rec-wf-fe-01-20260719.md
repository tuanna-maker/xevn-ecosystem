# XHRM-REC-WF-FE-01 — Recruitment Workflow Bridge FE (Dev-FE)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-19 |
| **change_mode** | UPGRADE |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

- srs: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · UC-HRM-REC-WF-02..05 · J-REC-WF-*
- tech_spec: `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` §7–§8
- data_contract: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md` §2–§6
- be_evidence: `docs/qa/evidence/xhrm-rec-wf-be-01-20260719.md`
- sponsor_confirm: ADR Accepted · ba-data PASS_TO_PM · BE READY_FOR_QA

## Closed

1. **Funnel / roadmap bind** — `CandidatePipelineFunnel` + `recruitmentFunnel` + CandidateDetailView roadmap use API `stage` via F6 map (`applied`→`new`); **6 columns unchanged** (AC-CD-F6-*).
2. **Disable direct stage/status** when `workflow_instance_id` active (non-terminal): Kanban drag, CandidatesTab select, JobRequisitionsTab status PATCH, plan approve/reject — surface `HRM-REC-WF-LOCKED` via `apiError` + toast/hint.
3. **SPAWN-MISSING banner** — `RecruitmentWfSpawnBanner` when submit/start returns `spawnMissing` / empty spawn id (plan, requisition, candidate).
4. **Wire FE-only paths (U65):**
   - `POST .../requisitions/:id/submit-workflow`
   - `POST .../recruitment-plans/:id/submit-workflow`
   - `POST .../candidates-pool/:id/start-pipeline`
5. **@CODE-MEMORY / @CODE-MEMORY-CHANGE** on helpers, banner, hooks, tabs, funnel (data contract §10).

## Files touched (blast)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | NEW lock + spawnMissing helpers |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.test.ts` | NEW vitest |
| `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx` | NEW banner |
| `apps/web/hrm/src/integrations/hrmApi.ts` | types + submit/start API |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | status labels ADDITIVE |
| `apps/web/hrm/src/lib/apiError.ts` | LOCKED / SPAWN-MISSING messages |
| `apps/web/hrm/src/hooks/useKanbanCandidates.ts` | lock drag/update |
| `apps/web/hrm/src/hooks/useRecruitmentPlans.ts` | submitPlanWorkflow + lock |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | submit + lock + banner |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | start-pipeline + lock |
| `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` | F6 roadmap + lock hint |
| `apps/web/hrm/src/components/recruitment/CandidatePipelineFunnel.tsx` | CODE-MEMORY-CHANGE |
| `apps/web/hrm/src/lib/recruitmentFunnel.ts` | CODE-MEMORY-CHANGE |
| `apps/web/hrm/src/pages/Recruitment.tsx` | plan WF + kanban isDragDisabled |

## Vitest

```text
pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts src/lib/jobRequisitionUi.test.ts
→ Test Files: 3 passed | Tests: 9 passed
```

## must_keep

| ID | Honored |
|----|---------|
| UF-HRM-12 | Create requisition without WF still allowed; local status PATCH when no instance |
| J-HRM-05 | Detail GET path unchanged |
| AC-CD-F6-* | 6 funnel stages; no enum REPLACE |
| Leave/Catalog bridges | Untouched (FE only recruitment) |
| F6 GWC hard path | Funnel columns + applied→new alias kept |

## Forbidden (honored)

- No F6 enum REPLACE; no seed inbox; no Phase1/PROD claim

## Residual (QA)

- Browser U65: J-REC-WF-01..06 — create plan/req/candidate from FE → submit/start → Network POST → banner or instance id → F5; Inbox approve path; regression UF-HRM-12 / leave
- Portal embed funnel still aggregates live pool stages (unchanged helper)

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: browser-only; U65 zero-seed; BE+FE READY_FOR_QA
exit_criteria: J-REC-WF-01..06 evidence with FE click path + Network 2xx; SPAWN-MISSING banner when definition missing; LOCKED when instance active; AC-CD-F6 funnel 6 cols; UF-HRM-12 create without WF PASS; no seed inbox

## read_first
1. docs/qa/evidence/xhrm-rec-wf-fe-01-20260719.md
2. docs/qa/evidence/xhrm-rec-wf-be-01-20260719.md
3. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md (J-REC-WF-*)
4. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §6

## journeys (U65)
- J-REC-WF-02: FE submit plan/req → Network POST submit-workflow → instance or SPAWN-MISSING banner
- J-REC-WF-04: start-pipeline → stage chips bind API; no direct stage when locked
- J-REC-WF-05: funnel 6 columns reflect synced stage
- Regression: UF-HRM-12 · J-HRM-05 · leave path smoke

## cấm
pnpm seed:* · API inbox seed · PASS chỉ probe
```
