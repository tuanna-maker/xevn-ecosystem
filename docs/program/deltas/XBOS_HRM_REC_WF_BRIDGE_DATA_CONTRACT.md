# XBOS → HRM Recruitment Workflow Bridge — Data Contract

| Field | Value |
|-------|--------|
| **work_item_id** | `XHRM-REC-WF-BD-01` |
| **from_role** | ba-data |
| **to_role** | pm → dev-be |
| **lane** | governance |
| **change_mode** | **UPGRADE** — cấm REPLACE F6 stage enum; cấm REPLACE Leave/Catalog bridges |
| **date** | 2026-07-19 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **BA process SoT** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` §7–§8 |
| **ADR SoT** | `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` (**Accepted** Option A; Q1=3 codes; Q2=step+terminal) |
| **F6 funnel must_keep** | `CUSTOMER_DEMO_HRM_DELTA_20260620.md` §6.3 · AC-CD-F6-* |
| **U65** | Zero-seed; FE-only UAT evidence |

**Purpose:** SoT for Dev-BE `XHRM-REC-WF-BE-01` — deterministic `task_type`↔`stage` map, persistence fields, callback DTOs, error codes, OpenAPI notes (ADR §5), and U68 `@CODE-MEMORY` cite requirements.

**Cấm:** REPLACE stage enum without new ADR; `pnpm seed:*` for evidence; Phase1/PROD claim.

---

## 1. Domain map (entities & ownership)

```text
XBOS (SoT process)
  workflow definitions: hrm_recruitment_plan_approval | hrm_requisition_approval | hrm_candidate_pipeline
  instance / step_task / inbox (resolver F4 only)

HRM (SoT business — DANH_MUC §13)
  recruitment_plans          + workflow_instance_id (NEW nullable UUID)
  job_requisitions           + workflow_instance_id (NEW nullable UUID)
  candidates                 + workflow_instance_id (NEW nullable UUID)
  candidate.stage            F6 enum (unchanged set)
  plan/requisition.status    extended ADDITIVE for WF lifecycle
```

| Entity | Owner | WF `business_type` | `businessId` | Spawn `workflow_code` |
|--------|-------|--------------------|--------------|------------------------|
| Plan | HRM | `hrm_recruitment_plan` | `planId` | `hrm_recruitment_plan_approval` |
| Requisition | HRM | `hrm_requisition` | `requisitionId` | `hrm_requisition_approval` |
| Candidate | HRM | `hrm_candidate` | `candidateId` | `hrm_candidate_pipeline` |

**Invariant:** Inbox assignee **only** XBOS resolver (F4). HRM passes `submitter` + org context on spawn — never assigns inbox rows.

---

## 2. Normative 1:1 map — `task_type` ↔ `candidate.stage`

### 2.1 F6 stage set (LOCKED — must_keep AC-CD-F6-*)

| `candidate.stage` | Nhãn VI | Funnel column |
|-------------------|---------|---------------|
| `new` | Mới | 1 |
| `screening` | Sàng lọc | 2 |
| `interview` | Phỏng vấn | 3 |
| `offer` | Đề nghị | 4 |
| `hired` | Đã tuyển | 5 |
| `rejected` | Từ chối | 6 |

**Cấm:** thêm/xóa/đổi mã stage trong wave này. Catalog labels STT 40 (DANH_MUC) bind display only — codes above remain SoT for API/aggregate.

### 2.2 Step callback map (`hrm_candidate_pipeline` only)

| XBOS `task_type` (step) | → `candidate.stage` | When applied | Notes |
|-------------------------|---------------------|--------------|-------|
| `rec_intake` | `new` | Step complete **or** successful pipeline spawn (initial) | Spawn without prior stage → set `new` |
| `rec_screening` | `screening` | Step complete | |
| `rec_interview` | `interview` | Step complete | Does not create interview row (AC-CD-F6-06 remains FE/API cross-nav) |
| `rec_offer` | `offer` | Step complete | |
| *(no step maps to hired/rejected)* | — | — | Terminal only — §2.3 |

**Cardinality rule (BR-REC-WF-MAP-01):** Exactly **one** F6 non-terminal stage per `task_type` above. Unknown `task_type` → **fail-closed** (§5 `HRM-REC-WF-STAGE-UNMAPPED`); stage **unchanged**.

**Directionality:** Map is **callback→HRM** only. FE must not invent `task_type` from stage PATCH when instance active (BR-REC-WF-08).

### 2.3 Terminal outcomes — candidate

| `terminalStatus` | → `candidate.stage` | Extra rule |
|------------------|---------------------|------------|
| `completed` | `hired` | **Only if** hire AC satisfied (`employee_id` / UC-HRM-INT-01 link per BR-CD-F6-05 · BR-REC-WF-05). Else: **do not** set `hired`; log `HRM-REC-WF-CALLBACK-SKIP` with reason `hire_ac_unmet`; keep last mapped stage; return 200 applied=false |
| `rejected` | `rejected` | Persist `rejected_reason` when provided; fanout notify |

**Illegal:** terminal `completed` downgrading `hired` → `rejected` → **409** business conflict (BA UC-HRM-REC-WF-06 E).

### 2.4 As-is alias note (không REPLACE enum)

| As-is DB default | Treatment under WF bridge |
|------------------|---------------------------|
| `candidates.stage` DEFAULT `'applied'` (catalog service) | **Not** a new F6 code. On pipeline spawn: if stage ∈ {`applied`, null, empty} → set `new`. Dashboard aggregate (F6) must continue counting only the 6 F6 codes; optional read-alias `applied`≡`new` is **Dev-FE/BE display only** — do not add `applied` to funnel columns. |

---

## 3. Plan / requisition status after spawn & terminal

### 3.1 Status lifecycle (ADDITIVE — must_keep UF-HRM-12)

| Status | Meaning | Set by |
|--------|---------|--------|
| `draft` | Chưa gửi duyệt / chưa spawn | FE create (optional) |
| `pending_approval` | Spawn OK **or** SPAWN-MISSING (entity waiting) | Bridge on submit |
| `approved` | Terminal `completed` (plan) | Terminal callback |
| `open` | Terminal `completed` (requisition) — hiring open | Terminal callback (prefer `open` for requisition to keep UF-HRM-12 list semantics) |
| `rejected` | Terminal `rejected` | Terminal callback |
| `cancelled` | Cancel instance (SA policy) | Explicit cancel API (out of minimal W2 if not implemented — residual) |
| `closed` / `on_hold` | Existing requisition statuses | **Keep** — no WF terminal writes these |

**As-is gap → Dev-BE migration (UPGRADE):**

| Table | As-is | Required ADD |
|-------|-------|--------------|
| `recruitment_plans.status` | DEFAULT `'pending'` | Accept `draft` \| `pending_approval` \| `approved` \| `rejected` \| `cancelled`; map legacy `pending` → treat as `pending_approval` when `workflow_instance_id` set |
| `job_requisitions.status` | CHECK (`open`,`closed`,`on_hold`) | **Extend CHECK ADDITIVE** to include `pending_approval`, `approved`, `rejected` (and optionally `draft`). **Do not remove** `open`/`closed`/`on_hold` |

### 3.2 Terminal map — plan / requisition

| Entity | After successful spawn | Terminal `completed` | Terminal `rejected` |
|--------|------------------------|----------------------|---------------------|
| Plan | `pending_approval` + `workflow_instance_id` | `approved` | `rejected` |
| Requisition | `pending_approval` + `workflow_instance_id` | `open` (canonical) · accept synonym write `approved` only if FE still filters `open` — **prefer single write `open`** | `rejected` |

**Step callbacks for plan/requisition:** Optional (ADR Q2). If received: **no status change** unless `task_type` explicitly mapped in a future ADR; default = ignore stage-like fields; may log `HRM-REC-WF-CALLBACK-SKIP` reason `plan_req_step_noop`.

---

## 4. Field list — persistence & API

### 4.1 Columns (ADD — mirror leave)

| Table | Column | Type | Null | Rule |
|-------|--------|------|------|------|
| `recruitment_plans` | `workflow_instance_id` | `UUID` | YES | Set on spawn success; clear only on cancel policy (not auto on reject) |
| `job_requisitions` | `workflow_instance_id` | `UUID` | YES | Same |
| `candidates` | `workflow_instance_id` | `UUID` | YES | Same; pipeline instance |

**Index (recommended):** `(workflow_instance_id)` WHERE NOT NULL — callback lookup.

**Active instance predicate (BR-REC-WF-08):**  
`workflow_instance_id IS NOT NULL` AND entity status/stage **not** in terminal set for that entity  
→ PATCH stage/status bypass → **409** `HRM-REC-WF-LOCKED`.

| Entity | Terminal set (unlock local PATCH) |
|--------|-----------------------------------|
| Plan | `approved`, `rejected`, `cancelled` |
| Requisition | `open`, `approved`, `rejected`, `closed`, `cancelled` |
| Candidate | `hired`, `rejected` |

When **no** instance (null id): local CRUD/PATCH allowed (BR-REC-WF-09 · UF-HRM-12).

### 4.2 Response fields (list + get parity — scope_parity)

| JSON field (snake or camel — match existing recruitment serializers) | Entities | Notes |
|----------------------------------------------------------------------|----------|-------|
| `workflow_instance_id` / `workflowInstanceId` | plan, requisition, candidate | Nullable UUID string |
| `status` | plan, requisition | Extended enums §3 |
| `stage` | candidate | F6 only after sync |
| `rejected_reason` / `rejectedReason` | all (when rejected) | From terminal payload |

**Scope parity (AC-REC-WF-09):** list and get-by-id **same** `resolveHrmListScope` / company slug rollup as existing recruitment module — flag `scope_parity` if list returns id but detail 404 under `main`.

### 4.3 Spawn request context (HRM → XBOS) — mirror leave

| Field | Required | Example |
|-------|----------|---------|
| `workflowCode` | ✓ | `hrm_candidate_pipeline` |
| `businessType` | ✓ | `hrm_candidate` |
| `businessId` | ✓ | candidate UUID |
| `submitter.userId` | ○ | JWT subject |
| `submitter.employeeId` | ○ | if known |
| `submitter.companyId` | ✓ | legal/operating id used by domain row |
| `submitter.companySlug` | ✓ | slug for resolver context |
| `context.memberTenantId` | ✓ | usually `xevn` |
| `context.memberCompanyId` | ✓ | slug |
| `context.planId` \| `requisitionId` \| `candidateId` | ✓ | echo business id |

---

## 5. Callback DTO (XBOS → HRM)

### 5.1 Endpoints (ADR §3 Q2 · §5.2)

```text
POST /api/hrm/recruitment/workflow/step
POST /api/hrm/recruitment/workflow/terminal
```

Auth: `isAuthorizedInternalRequest` (Bearer service JWT; production rejects static key alone) — same class as leave/catalog S2S.

### 5.2 Shared required fields

| Field | Type | step | terminal | Rule |
|-------|------|------|----------|------|
| `businessType` | enum string | ✓ | ✓ | ∈ {`hrm_recruitment_plan`,`hrm_requisition`,`hrm_candidate`} |
| `businessId` | UUID string | ✓ | ✓ | Domain PK |
| `workflowInstanceId` | UUID string | ✓ | ✓ | Must match persisted `workflow_instance_id` when present; mismatch → SKIP or 409 |
| `reviewerUserId` | string | ✓ | ✓ | Approver identity |
| `reviewerName` | string | ○ | ○ | Display fallback |
| `stepKey` | string | ✓ | ○ | Graph step key |
| `taskType` | string | ✓ | ○ | **Map key** for candidate (§2.2); alias accept `task_type` in body if engine sends snake_case — normalize once |
| `taskId` | string | ○ | ○ | Idempotency key with step |
| `terminalStatus` | `completed` \| `rejected` | — | ✓ | |
| `rejectedReason` | string \| null | — | when rejected | |

### 5.3 Example — step (candidate)

```json
{
  "businessType": "hrm_candidate",
  "businessId": "3f2a0c8e-1111-2222-3333-444455556666",
  "workflowInstanceId": "9aa1bb22-cccc-dddd-eeee-fff000111222",
  "stepKey": "screening_1",
  "taskType": "rec_screening",
  "taskId": "task-uuid-or-engine-id",
  "reviewerUserId": "approver@xe.vn"
}
```

**Effect:** `candidates.stage = screening` (if mapped); 200 `{ applied: true, stage: "screening" }`.

### 5.4 Example — terminal (requisition)

```json
{
  "businessType": "hrm_requisition",
  "businessId": "7b8c9d0e-aaaa-bbbb-cccc-ddddeeeeffff",
  "workflowInstanceId": "9aa1bb22-cccc-dddd-eeee-fff000111222",
  "terminalStatus": "completed",
  "reviewerUserId": "approver@xe.vn",
  "reviewerName": "Nguyễn Văn A"
}
```

**Effect:** `job_requisitions.status = open`; 200 `{ applied: true, status: "open" }`.

### 5.5 Idempotency

| Case | Result | Code / log |
|------|--------|------------|
| Duplicate terminal when already terminal | 200 no-op | `HRM-REC-WF-CALLBACK-SKIP` · `applied: false` |
| Duplicate step same `(workflowInstanceId, stepKey, taskId)` | 200 no-op; **no stage rewind** | CALLBACK-SKIP |
| Step with unmapped `taskType` | **422** | `HRM-REC-WF-STAGE-UNMAPPED` |
| Entity not found / out of scope | **404** | existing recruitment 404 code family |
| Instance active + public PATCH stage | **409** | `HRM-REC-WF-LOCKED` |

---

## 6. Error codes (deterministic)

| Code | HTTP | Condition | Entity effect | FE expectation |
|------|------|-----------|---------------|----------------|
| **`HRM-REC-WF-SPAWN-MISSING`** | spawn path: entity still **2xx** create/submit; log WARN | Definition missing / XBOS down / start non-success | Stay `pending_approval`; `workflow_instance_id` null | Banner SPAWN-MISSING; **no** silent approve (BR-REC-WF-02) |
| **`HRM-REC-WF-STAGE-UNMAPPED`** | **422** on step callback | `taskType` not in §2.2 | Stage unchanged | Surface error to ops; do not guess |
| **`HRM-REC-WF-LOCKED`** | **409** on PATCH stage/status | Active `workflow_instance_id` + non-terminal | No mutate | Disable direct approve UI |
| **`HRM-REC-WF-CALLBACK-SKIP`** | **200** with `applied: false` | Duplicate terminal/step; hire AC unmet; plan/req step noop; instance mismatch soft-skip | No change (or no hire) | Observability only |

**Envelope:** Keep existing `success` / `code` / `data` / `message` + `x-api-code` — no new public envelope (ADR §5).

**Leave parity:** Leave continues to use `HRM-WF-SPAWN-MISSING` / leave callback skip logs — **do not rename** leave codes.

---

## 7. OpenAPI field notes (cite ADR §5)

Dev **must** update YAML in the **same PR** as BE (ADR §5 checklist).

### 7.1 XBOS `docs/api/openapi/xbos-api.yaml`

| operationId / area | Note for OpenAPI |
|--------------------|------------------|
| `wfStartInstance` | Document recruitment enums: `workflowCode` ∈ {`hrm_recruitment_plan_approval`,`hrm_requisition_approval`,`hrm_candidate_pipeline`}; `businessType` ∈ {`hrm_recruitment_plan`,`hrm_requisition`,`hrm_candidate`}. Idempotent: same `(tenant, businessType, businessId)` while active → **200** same instance id (ADR §6). |
| `wfCompleteTask` / `wfRejectTask` | Document side-effect: for recruitment `businessType`, engine calls HRM `/recruitment/workflow/step` (non-terminal complete) or `/terminal` (reject / final complete). **Leave notify path unchanged.** |
| Definitions | Canvas-only for UAT (U65) — no seed operation in evidence. |

### 7.2 HRM `docs/api/openapi/hrm-api.yaml`

| Path | Note for OpenAPI |
|------|------------------|
| `/recruitment/requisitions` (+ plans/candidates schemas) | Add nullable `workflow_instance_id` (uuid). Document status extensions `pending_approval` / `rejected` / `approved` where applicable; requisition post-approve canonical `open`. |
| `POST /recruitment/workflow/step` | Internal; body §5.2; responses 200 / 422 `HRM-REC-WF-STAGE-UNMAPPED` / 401 / 404. Cite **ADR §5.2** + BR-REC-WF-03/04. |
| `POST /recruitment/workflow/terminal` | Internal; body §5.2; 200 idempotent skip; cite ADR §5.2 + BR-REC-WF-05/06/07. |
| PATCH candidate stage / plan\|req status | Document **409** `HRM-REC-WF-LOCKED` when active instance (BR-REC-WF-08). |

**Reference line for schema description blocks:**

```text
x-adr-ref: docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §5
x-data-contract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md
```

---

## 8. Validation matrix (VAL-REC-WF-*)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-REC-WF-01 | Submit plan + active definition | `workflow_instance_id` set; status `pending_approval` |
| VAL-REC-WF-02 | Submit plan + no definition | status `pending_approval`; log SPAWN-MISSING; id null |
| VAL-REC-WF-03 | Step `taskType=rec_interview` | stage=`interview` |
| VAL-REC-WF-04 | Step `taskType=rec_unknown` | 422 STAGE-UNMAPPED; stage unchanged |
| VAL-REC-WF-05 | Terminal completed + hire AC met | stage=`hired` |
| VAL-REC-WF-06 | Terminal completed + hire AC unmet | CALLBACK-SKIP; stage not `hired` |
| VAL-REC-WF-07 | Terminal rejected | stage/status `rejected` + reason |
| VAL-REC-WF-08 | Duplicate terminal | 200 applied=false |
| VAL-REC-WF-09 | PATCH stage while instance active | 409 LOCKED |
| VAL-REC-WF-10 | PATCH stage while no instance | 200 (UF-HRM-12) |
| VAL-REC-WF-11 | list vs get under `main` rollup | same scope resolver (scope_parity) |
| VAL-REC-WF-12 | Leave terminal callback regression | leave path still 200 approve/reject |

---

## 9. Traceability

| Requirement | API | DB | FE | Test |
|-------------|-----|----|----|------|
| UC-HRM-REC-WF-02 spawn | XBOS `instances/start` | `*_workflow_instance_id` | Submit plan/req | VAL-01/02 · J-REC-WF-02 |
| UC-HRM-REC-WF-03 inbox | XBOS task complete → HRM terminal | status columns | Inbox → F5 | J-REC-WF-03 |
| UC-HRM-REC-WF-04 roadmap | `POST .../workflow/step` | `candidates.stage` | Roadmap chips | VAL-03/04 · J-REC-WF-04 |
| UC-HRM-REC-WF-05 dashboard | aggregate API | stage post-callback | P-CC-06 funnel | AC-CD-F6-03 · J-REC-WF-05 |
| UC-HRM-REC-WF-06 reject | terminal rejected | rejected + reason | Notify | J-REC-WF-06 |
| BR-REC-WF-08 lock | PATCH | — | Disable approve | VAL-09 · AC-REC-WF-07 |
| AC-CD-F6-* | unchanged funnel codes | stage enum lock | 6 columns | regression |
| Leave/Catalog must_keep | leave/catalog routes | untouched leave columns | — | AC-REC-WF-11 |

**Journeys:** J-REC-WF-01..06 · J-HRM-05 · UF-HRM-12.

---

## 10. U68 CODE-MEMORY requirements (Dev — AC-REC-WF-10)

Every new/changed bridge file **FAIL** handoff without:

```text
@CODE-MEMORY
UC: UC-HRM-REC-WF-0x
SRS: docs/hrm/SRS.md §16.5 (delta) · docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
TechSpec: docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3–§6
DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2–§6
WorkItem: XHRM-REC-WF-BE-01 | XHRM-REC-WF-FE-01
must_keep: UF-HRM-12, J-HRM-05, LeaveWorkflowBridge, CatalogWorkflowBridge, AC-CD-F6-*, F4 resolver
change_mode: UPGRADE
```

| File (create/extend) | Cite map section |
|----------------------|------------------|
| `recruitment-workflow.bridge.ts` | §2 map · §4 columns · §6 codes |
| `recruitment-workflow.controller.ts` | §5 DTO · auth NFR |
| `recruitment.service.ts` lock hooks | §4.1 LOCKED |
| `workflow-engine.service.ts` notify (additive) | ADR §3 Q2; leave path untouched |
| `workflow-catalog.constants.ts` | §1 three codes only ADD |
| OpenAPI yaml | §7 ADR §5 |

**forbidden_paths:** REPLACE `leave-workflow.bridge.ts` contract; REPLACE catalog bridge; seed scripts for UAT evidence.

---

## 11. Data risks & mitigations

| ID | Risk | Mitigation |
|----|------|------------|
| R-DC-01 | Dev invents stage codes | §2.1 LOCKED + ADR |
| R-DC-02 | `applied` pollutes F6 funnel | §2.4 spawn normalize → `new` |
| R-DC-03 | Requisition CHECK blocks `pending_approval` | §3.1 ADDITIVE CHECK |
| R-DC-04 | Silent unmapped task | 422 STAGE-UNMAPPED |
| R-DC-05 | Hire without employee link | CALLBACK-SKIP hire_ac_unmet |
| R-DC-06 | scope_parity break on get-by-id | VAL-11 · same resolver as list |

---

## 12. Handoff

| Item | Value |
|------|-------|
| **Closed** | 1:1 `task_type`↔stage; plan/req terminal status; field list; callback DTO; 4 error codes; OpenAPI notes ADR §5; CODE-MEMORY cite pack |
| **Residual** | SRS §16.5 merge (ba-process governance); FE disable-bypass (`XHRM-REC-WF-FE-01`); optional `cancelled` cancel-instance API |
| **next_owner** | **pm** → dispatch **dev-be** `XHRM-REC-WF-BE-01` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: XHRM-REC-WF-BE-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: UPGRADE

## read_first (ordered)
1. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md (SoT map §2–§6)
2. docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md (Option A Accepted; Q1 three codes; Q2 step+terminal; §5 OpenAPI; §8 CODE-MEMORY)
3. docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md (UC/BR/AC)
4. apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts + leave-workflow.controller.ts (pattern — DO NOT REPLACE)
5. apps/api/hrm-api/src/recruitment/** (extend only)

## spec_read_ack (fill before code)
- srs: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md · UC-HRM-REC-WF-01..06 · BR-REC-WF-01..14
- tech_spec: ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3–§6
- data_contract: XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2–§7
- change_mode: UPGRADE

## deliver
1. RecruitmentWorkflowBridge (NEW parallel to Leave) — spawn three workflow_code values; persist workflow_instance_id on recruitment_plans, job_requisitions, candidates
2. POST /api/hrm/recruitment/workflow/step + /terminal — DTO per data contract §5; internal auth
3. Implement 1:1 task_type map §2.2; fail-closed HRM-REC-WF-STAGE-UNMAPPED; lock HRM-REC-WF-LOCKED; SPAWN-MISSING; CALLBACK-SKIP
4. XBOS notifyHrmRecruitmentCallback ADDITIVE — leave notifyHrmLeaveTerminal URL/contract untouched
5. OpenAPI hrm-api.yaml + xbos-api.yaml same PR (ADR §5 notes)
6. jest: spawn idempotent, step map, unmapped 422, lock 409, terminal idempotent, leave regression smoke
7. Every touched bridge file: @CODE-MEMORY per data contract §10 (U68)

## must_keep
UF-HRM-12, J-HRM-05, LeaveWorkflowBridge, CatalogWorkflowBridge, AC-CD-F6-*, F4 resolver

## forbidden
REPLACE F6 stage enum; REPLACE leave/catalog bridges; seed inbox/WF for evidence; Phase1/PROD claim

## exit
READY_FOR_QA + evidence_path docs/qa/evidence/xhrm-rec-wf-be-01-YYYYMMDD.md
+ next_dispatch_prompt for XHRM-REC-WF-FE-01 (roadmap bind + disable bypass + SPAWN-MISSING banner)
```

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Published normative data contract: 1:1 `rec_*` task_type → F6 stage; plan/requisition terminal status; `workflow_instance_id` on three entities; step/terminal DTO; codes SPAWN-MISSING / STAGE-UNMAPPED / LOCKED / CALLBACK-SKIP; OpenAPI notes citing ADR §5; U68 CODE-MEMORY cite pack for Dev. Residual: SRS §16.5 promote + FE wave. |
| **next_owner** | pm |
| **next_dispatch_prompt** | See §12 (XHRM-REC-WF-BE-01) |
| **evidence_path** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md` |
| **ack_status** | **PASS_TO_PM** |
