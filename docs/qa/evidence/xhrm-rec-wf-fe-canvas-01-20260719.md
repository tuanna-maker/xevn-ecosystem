# XHRM-REC-WF-FE-CANVAS-01 — Recruitment WF canvas presets (Dev-FE)

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-FE-CANVAS-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-07-19 |
| **change_mode** | UPGRADE |
| **ack_status** | **READY_FOR_QA** |
| **U65** | Zero-seed; FE canvas only — **cấm** seed inbox |

## spec_read_ack

- srs: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · UC-HRM-REC-WF-01 · AC-REC-WF-01 · J-REC-WF-01/03/06
- tech_spec: `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` §3 Q1 · §8
- data_contract: `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md` §1–§2 (`rec_*` taskType map)
- qc_prior: `docs/qa/evidence/xhrm-rec-wf-qc-01-20260719.md` — **C-XHRM-REC-WF-03** (no active defs)
- sponsor_confirm: ADR Accepted · QC GWC deferred J-03/06 until FE canvas defs

## Closed

1. **FE path to create/activate three recruitment WF definitions** on XBOS Command Center → Cấu hình → Hệ thống quy trình:
   - Panel **Mẫu QT tuyển dụng HRM (bridge)** with chips for:
     - `hrm_recruitment_plan_approval`
     - `hrm_requisition_approval`
     - `hrm_candidate_pipeline`
   - Click → prefill canvas form (or open existing if code already in list) → **Lưu** → `POST/PUT /workflow-engine/definitions` with `status: active`.
2. **Wire spawn-ready payload** — `workflowDefinitionToApiPayload` now sets:
   - `category: hrm_recruitment`
   - `conditions.businessType` matching ADR table
   - graph steps with `stepKey`, `taskType` / `task_type`, `resolver_type` (direct_manager)
3. **Candidate pipeline** preset includes F6 map taskTypes: `rec_intake` → `rec_screening` → `rec_interview` → `rec_offer` (hired/rejected remain terminal-only).
4. **SPAWN-MISSING banner** updated to cite the three codes + canvas path (still no silent approve).
5. **@CODE-MEMORY** on presets, mapper, banner, helpers.

## Files touched

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.ts` | NEW presets + helpers |
| `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.test.ts` | NEW vitest |
| `apps/web/web-portal/src/data/workflow-graph.ts` | optional `taskType` on step |
| `apps/web/web-portal/src/integrations/workflowMapper.ts` | businessType/category + taskType round-trip |
| `apps/web/web-portal/src/integrations/workflowMapper.test.ts` | recruitment payload assert |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | preset UI + openRecruitmentWorkflowPreset |
| `apps/web/web-portal/src/utils/workflowDisplayLabels.ts` | plan/req/candidate labels |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | codes + SPAWN-MISSING copy |
| `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx` | data attrs + CODE-MEMORY |

## Vitest (command table)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm exec vitest run src/data/hrm-recruitment-workflow-presets.test.ts src/integrations/workflowMapper.test.ts src/utils/workflowDisplayLabels.test.ts` (web-portal) | **0** | 3 files / **18** tests PASS |
| `pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/recruitmentFunnel.test.ts` (hrm) | **0** | 2 files / **7** tests PASS (funnel = F6 must_keep) |

## must_keep (honored)

| ID | Honored |
|----|---------|
| UF-HRM-12 | Create requisition without WF still allowed |
| AC-CD-F6-* | Funnel 6 columns + `rec_*` map only; no stage enum REPLACE |
| LeaveWorkflowBridge | Untouched |
| Catalog / F4 resolver enum | Reuse `direct_manager`; no fork |
| U65 | No seed scripts; FE canvas create only |

## Forbidden (honored)

- No `pnpm seed:*` / inbox seed
- No Phase1 DONE / PROD claim
- No REPLACE leave bridge or F6 funnel columns

## Residual / QA scope

| Item | Note |
|------|------|
| **J-REC-WF-01** | Browser: login `ceo@xe.vn` → Command Center → Cấu hình → Hệ thống quy trình → click each Mẫu QT → Lưu → Network 2xx → F5 list still shows codes |
| **J-REC-WF-03 / J-06** | After defs active: HRM submit/start → expect **instance id** (not only SPAWN-MISSING) → Inbox duyệt/từ chối → HRM sync + F5 |
| **C-XHRM-REC-WF-04** | If spawn still SPAWN-MISSING with def present → likely XBOS 400 payload (submitter.employeeId) — optional `dev-be` |
| LOCKED UI | Testable only after successful spawn |

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XHRM-REC-WF-QA-CANVAS-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: browser-only; U65 zero-seed; FE-CANVAS READY_FOR_QA
exit_criteria: J-REC-WF-01 create/activate three codes via FE; J-REC-WF-03 and/or J-06 after successful spawn (inbox → approve/reject → HRM F5); no seed; UF-HRM-12 + F6 funnel regression

## read_first
1. docs/qa/evidence/xhrm-rec-wf-fe-canvas-01-20260719.md
2. docs/qa/evidence/xhrm-rec-wf-qc-01-20260719.md (C-XHRM-REC-WF-02/03)
3. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md J-REC-WF-01/03/06

## journeys (U65)
1. J-REC-WF-01: portal → settings workflow → Mẫu QT tuyển dụng HRM → Lưu each of hrm_recruitment_plan_approval / hrm_requisition_approval / hrm_candidate_pipeline → F5 còn
2. J-REC-WF-02/04 retest: HRM Gửi duyệt / Bắt đầu QT → prefer workflow_instance_id (not SPAWN-MISSING) when def active
3. J-REC-WF-03 / J-06: Inbox Duyệt/Từ chối → HRM status/stage sync → F5
4. Regression: UF-HRM-12 · AC-CD-F6 funnel 6 cols · leave path smoke

## cấm
pnpm seed:* · API inbox seed · PASS chỉ probe · Phase1/PROD claim
```

## ack_status

**READY_FOR_QA**
