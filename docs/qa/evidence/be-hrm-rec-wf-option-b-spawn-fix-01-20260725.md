# D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01 — Spawn + dual-def version + local compile

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-07-25 |
| **change_mode** | UPGRADE |
| **prior FAIL** | `docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725.md` |
| **spec_ref** | ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723 §3 Option B · TechSpec §18.2 · J-REC-WF-02/03 |
| **U65** | zero-seed · HOLD_DEPLOY · **not** Phase1/PROD · **cấm** seed · Bay.vn · R2 claim |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA FAIL | `qa-hrm-rec-wf-option-b-01-20260725.md` — SPAWN-MISSING despite active def; UNIQUE on dual POST; local TS |
| Prior Option B | `be-hrm-rec-wf-option-b-01-20260723.md` |
| Live diagnose | Portal JWT + XBOS `instances/start` **201** with active `hrm_requisition_approval`; HRM submit **without** `x-user-id` → `spawnMissing:true`; **with** `x-user-id`/`JWT` → `spawnMissing:false` + `workflow_instance_id` |

---

## Root cause (closed)

| Defect | Cause | Fix |
|--------|-------|-----|
| **D-HRM-REC-WF-SPAWN-8088-01** | Submit used only `x-user-id`. Embed/API/probe often omit it → `resolveSubmitterEmployeeId` null → SPAWN-MISSING even when active def exists. XBOS start itself OK. | `resolveSubmitterUserIdFromAuth` — header else JWT `email`/`sub` on plan/req/pipeline submit handlers |
| **D-HRM-REC-WF-OPTION-B-DUAL-01** | `upsertDefinition` INSERT omitted `version` → DB DEFAULT 1 → UNIQUE `(tenant_id, workflow_code, version)` on 2nd partition row | INSERT persists `body.version` or `MAX(version)+1`; 23505 → `XBOS-WF-409` |
| **D-HRM-API-LOCAL-TS-01** | Prior watch errors on scope fields / QueryFn; `nest build` green this session; L0 hrm+xbos **200** | Coordinated with in-flight compile slice; no half-fix left on touched paths |

Defense-in-depth: recruitment `startInstanceFromWorkflowCode` also looks up defs under `MASTER_TENANT_XEVN` when spawn tenant is member.

---

## Verify

| Suite / gate | Result |
|--------------|--------|
| xbos `workflow-apply-scope` + `workflow-engine.service` | **26/26 PASS** (was 25; +1 DUAL-01 version INSERT) |
| xbos `p1-browser-e2e-inbox-spawn-wf` | **3/3 PASS** (MAX+version mock updated) |
| hrm `resolve-submitter-user-id` + `recruitment-workflow.bridge` + `recruitment.controller` | **37/37 PASS** |
| Local L0 | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** (qc script node UV assert noise after print — health lines green) |
| Live 8088 pre-deploy | With `x-user-id`: submit → `spawnMissing:false` + wi set; without → SPAWN-MISSING (explains QA FAIL). **HOLD_DEPLOY** — QA retest after devops sync of this WI |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/resolve-submitter-user-id.ts` | ADD JWT fallback helper + CODE-MEMORY |
| `apps/api/hrm-api/src/recruitment/resolve-submitter-user-id.spec.ts` | ADD unit |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | Wire helper on submit/start-pipeline |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts` | CODE-MEMORY-CHANGE |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` | version INSERT + master tenant lookup + CODE-MEMORY |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.spec.ts` | DUAL-01 + create mocks |
| `apps/api/xbos-api/src/workflow-engine/p1-browser-e2e-inbox-spawn-wf.spec.ts` | MAX(version) mock |

---

## Residual (`residual_auto_fix: true`)

| Item | Owner |
|------|-------|
| Sync/deploy this WI to Dev8088 (HOLD_DEPLOY) before browser AC-OPT-B | **devops** (PM dispatch) then **qa** |
| FE canvas dual-def: POST with version≥2 or omit for auto MAX+1; assert two active rows (group + VISUN LE) | **qa** |
| AC-REC-WF-OPT-B-03 fallback sole-member | **qa** after dual+spawn green |
| Bay.vn / R2 claim | **explicitly not claimed** |

---

## completion_report

**Closed:** SPAWN-MISSING false-negative when JWT present but `x-user-id` missing; Option B dual-def INSERT version; master-tenant recruitment def lookup for member spawn; Option B jest **26/26**; local L0 HRM+XBOS green; CODE-MEMORY updated.

**Open:** Dev8088 binary lag until sync — QA must retest after deploy/sync of this WI.

## next_owner

`qa` (after devops sync if 8088 still on old binary)

## next_dispatch_prompt

```text
work_item_id: QA-HRM-REC-WF-OPTION-B-01
from_role: pm
to_role: qa
entry_criteria: READY_FOR_QA docs/qa/evidence/be-hrm-rec-wf-option-b-spawn-fix-01-20260725.md · U65 zero-seed · HOLD_DEPLOY · confirm Dev8088 (or local) has this WI binary
exit_criteria:
  (1) J-REC-WF-02 Group CEO holding submit-workflow → spawnMissing:false + workflow_instance_id when active hrm_requisition_approval exists (Bearer alone OK even if x-user-id dropped)
  (2) AC-REC-WF-OPT-B-01/02 — dual active defs (group-wide + VISUN) via FE POST definitions (version auto or ≥2) without UNIQUE 500; member vs holding pick correct definition_id
  (3) must_keep SPAWN-MISSING banner only when truly no applicable def; J-REC-WF-03 inbox smoke if instance spawned
  (4) cấm seed · Bay.vn · R2 claim · Phase1/PROD
evidence_path: docs/qa/evidence/qa-hrm-rec-wf-option-b-01-20260725-retest.md
ack_status: PASS_TO_PM or FAIL_TO_PM
persona: ceo@xe.vn / Xevn@2026 (+ du-lich.ceo@xe.vn for member)
```

**evidence_path:** `docs/qa/evidence/be-hrm-rec-wf-option-b-spawn-fix-01-20260725.md`

**ack_status:** **READY_FOR_QA**
