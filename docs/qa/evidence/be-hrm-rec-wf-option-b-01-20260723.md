# D-HRM-REC-WF-OPTION-B-BE-01 — REC-WF Option B company partition

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-REC-WF-OPTION-B-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-23 |
| **change_mode** | ADD |
| **spec_ref** | `ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` §3 Option B · TechSpec §18.2 · `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620` (reuse; R2 **not** closed) |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR Option B | `docs/decisions/ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723.md` §3 — resolve `(tenant_id, workflow_code, company_id\|applyingEntity)`; fallback group-wide only if no member override |
| SA evidence | `docs/qa/evidence/sa-hrm-settings-rec-wf-01-20260723.md` |
| F4 resolver ADR | Pilot leave; REC soft-fallback = R2 gap — **not** changed this WI |
| TechSpec | `docs/hrm/TECHSPEC.md` §18.2 updated IMPLEMENTED + AC-REC-WF-OPT-B-01..03 |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` `wfStartInstance` — Option B description + context keys |

---

## completion_report

### Closed

1. **XBOS** `pickActiveDefinitionForCompanyPartition` in `workflow-apply-scope.ts` — member override → group-wide → G-BM-REC-02 applicable only; unrelated member → `null` (no silent wrong graph).
2. **`findActiveDefinitionByCode(tenant, code, partition?)`** — without partition = legacy highest version (ensure/catalog must_keep); with partition = Option B pick + LE UUID enrich.
3. **`startInstanceFromWorkflowCode`** passes spawn/context/`entityCompanyId` into partition pick.
4. **HRM** `RecruitmentWorkflowBridge` spawn context adds `entityCompanyId` + normalized `memberCompanyId` (Group CEO main→holding; member slug kept).
5. **Jest:** apply-scope Option B (7) + engine service Option B (2) + existing BM spawn/fallback still PASS.
6. **Docs:** TechSpec §18.2 · OpenAPI note. **No** seed · **no** deploy · **no** Option C fan-out · **no** Bay.vn UI claim · **no** R2 fail-closed change.

### Verify

| Suite | Result |
|-------|--------|
| `xbos-api` `workflow-apply-scope\|workflow-engine.service` | **25/25 PASS** |
| `hrm-api` `recruitment-workflow.bridge` | **20/20 PASS** |

### Residual

| Item | Owner |
|------|-------|
| Browser U65: dual active defs (group + member) → spawn picks correct graph; J-REC-WF-02/03 smoke not broken | **qa** |
| UNIQUE `(tenant_id, workflow_code, version)` — multi-company rows need distinct versions (schema tighten optional later) | backlog / sa |
| R2 REC fail-closed (no soft GROUP_APPROVER) | separate WI after F4 C-03 |
| Canvas FE «Đơn vị áp dụng» UX polish | optional fe |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/xbos-api/src/workflow-engine/workflow-apply-scope.ts` | Option B pick helpers + CODE-MEMORY |
| `apps/api/xbos-api/src/workflow-engine/workflow-apply-scope.spec.ts` | AC-REC-WF-OPT-B-* unit |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` | partition find + spawn wire |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.spec.ts` | member vs holding pick |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts` | entityCompanyId context |
| `docs/hrm/TECHSPEC.md` §18.2 | IMPLEMENTED + AC |
| `docs/api/openapi/xbos-api.yaml` | Option B contract note |

---

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-HRM-REC-WF-OPTION-B-01
from_role: pm
to_role: qa
entry_criteria: READY_FOR_QA docs/qa/evidence/be-hrm-rec-wf-option-b-01-20260723.md · U65 zero-seed · L0 stack up
exit_criteria:
  (1) AC-REC-WF-OPT-B-01 — member company submit-workflow uses member override def when both group+member active (Network start → instance definition_id / applyingEntity matches member; no silent group graph)
  (2) AC-REC-WF-OPT-B-02 — holding/main Group CEO spawn uses group-wide when present
  (3) must_keep J-REC-WF-02/03 spawn smoke still PASS (SPAWN-MISSING banner rules unchanged)
  (4) cấm seed · cấm Bay.vn UI claim · cấm assert R2 fail-closed
evidence_path: docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260723.md
ack_status: PASS_TO_PM or FAIL_TO_PM
persona: ceo@xe.vn / Xevn@2026 (+ member CEO if dual-def canvas available)
```

**evidence_path:** `docs/qa/evidence/be-hrm-rec-wf-option-b-01-20260723.md`

**ack_status:** **READY_FOR_QA**
