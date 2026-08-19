# ADR: XBOS → HRM Recruitment Workflow Bridge

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE |
| **work_item_id** | `XHRM-REC-WF-SA-01` |
| **Program** | `P1-XBOS-HRM-REC-WF-BRIDGE` |
| **Status** | **Accepted** |
| **Date** | 2026-07-19 |
| **Decision owner** | SA |
| **change_mode** | **UPGRADE** — cấm REPLACE leave/catalog bridges; cấm Phase1/PROD claim |
| **BA SoT** | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` (UC-HRM-REC-WF-01..06 · BR/AC · J-REC-WF-01..06) |
| **Related ADRs** | `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` (F4 leave) · `ADR-XBOS-M01-OPENAPI-BOUNDARIES.md` · `ADR-HRM-RBAC-SCOPE-LADDER.md` |
| **Ownership SoT** | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` §1 · §6 STT 37–42 · §13 |
| **Pattern evidence** | `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` · `xbos-catalog-workflow.bridge.ts` · `workflow-engine.service.ts` `notifyHrmLeaveTerminal` |

---

## 1. Decision context

### 1.1 Problem

HRM tuyển dụng đã có CRUD 🟢 (UF-HRM-12 · J-HRM-05 · F6 JD/funnel) nhưng **không** spawn XBOS workflow instance. Khách cần: cấu hình QT trên XBOS → planning / duyệt yêu cầu / roadmap ứng viên theo instance; dashboard đọc stage đã sync.

### 1.2 Constraints (non-negotiable)

| must_keep | Rule |
|-----------|------|
| **UF-HRM-12** | Tạo/sửa requisition FE + F5 PASS khi không bật WF (BR-REC-WF-09) |
| **J-HRM-05** | list→detail requisition/candidate scope parity |
| **AC-CD-F6-01..06** | JD library + funnel 6 cột + rollup `main` |
| **LeaveWorkflowBridge** | Không sửa/REPLACE path leave spawn/callback |
| **CatalogWorkflowBridge** / `XbosCatalogWorkflowBridge` | Không regression catalog extension WF |
| **J-XBOS-02 / J-XBOS-08** | Catalog publish/sync |
| **F4 resolver path** | Reuse `resolver_type` enum — **không** fork engine |
| **U65** | Zero-seed; FE-only UAT (BR-REC-WF-14) |

### 1.3 Failure impact if unresolved

Roadmap/dashboard lệch nghiệp vụ; Dev PATCH stage bypass WF; QA seed inbox; regression leave/catalog; false Phase1 DONE.

---

## 2. Options (bridge topology)

### Option A — HRM spawn (push) — **SELECTED**

**Description:** Sau mutate domain trên HRM (submit plan / requisition / start candidate pipeline), `RecruitmentWorkflowBridge` S2S `POST /api/xbos/workflow-engine/instances/start` (mirror leave). XBOS owns instance/inbox/resolver. XBOS callbacks HRM on **step** and **terminal**.

| Benefits | Costs | Risks |
|----------|-------|-------|
| Parity Leave + Catalog bridges; causal FE→spawn; known service-JWT auth | New bridge + callback routes + OpenAPI delta | Spawn miss if XBOS down (mitigated: SPAWN-MISSING, no silent approve) |

### Option B — XBOS poll

**Description:** XBOS định kỳ poll HRM “pending needing WF” hoặc đọc outbox; XBOS tự start instance.

| Benefits | Costs | Risks |
|----------|-------|-------|
| HRM thinner | Latency; ownership blur; hard U65 FE causality; new poll NFR | Duplicate starts; inbox delay; harder AC-REC-WF-02 Network proof |

### Option C — Hybrid (spawn + reconcile)

**Description:** Option A primary + reconcile job (HRM or XBOS) re-spawn orphans (`pending_approval` + null `workflow_instance_id`).

| Benefits | Costs | Risks |
|----------|-------|-------|
| Higher reliability | Extra job + lock semantics; scope creep wave W2 | Premature complexity before BA-data map / pilot AC |

### 2.1 Trade-off matrix (1–5, higher better)

| Criteria | Weight | A | B | C |
|----------|-------:|--:|--:|--:|
| Business value (UC outcomes) | 5 | 5 | 3 | 5 |
| Time to deliver (W2) | 4 | 5 | 2 | 3 |
| Complexity | 4 | 4 | 2 | 2 |
| Security (callback auth) | 5 | 5 | 3 | 4 |
| Reliability | 4 | 4 | 3 | 5 |
| Maintainability (parity leave) | 5 | 5 | 2 | 3 |
| U65 FE evidence | 5 | 5 | 2 | 4 |
| **Weighted** | | **147** | **85** | **118** |

### 2.2 Failure modes

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|----------|------------|
| A | XBOS down at spawn | Log `HRM-REC-WF-SPAWN-MISSING`; banner | Entity stays `pending_approval`; retry submit / later C-lite |
| A | Double spawn | Unique `(business_type, business_id)` active instance | Idempotent start: return existing id (NFR §7) |
| B | Poll lag / miss | Inbox empty after FE submit | Rejected for pilot |
| C | Reconcile races | Duplicate tasks | Defer to P2 after W4 evidence |

### 2.3 Decision

- **Selected: Option A — HRM spawn.**
- **Why:** Matches F4 leave + catalog S2S; satisfies BA UC-HRM-REC-WF-02..04; U65 Network-visible start; lowest regression risk to must_keep bridges.
- **Deferred:** Option C reconcile as **NFR P2** after QA J-REC-WF-* — not in W2 exit.
- **Rejected:** Option B — breaks FE causality and OpenAPI ownership clarity.

---

## 3. Answers to BA open questions

### Q1 — Plan vs requisition: one or two definitions? (**SA + BA default**)

**Answer: Three normative `workflow_code` values (BA §6) — do not collapse for pilot.**

| workflow_code | business_type | Trigger | businessId |
|---------------|---------------|---------|------------|
| `hrm_recruitment_plan_approval` | `hrm_recruitment_plan` | Submit / gửi duyệt **recruitment plan** | `planId` |
| `hrm_requisition_approval` | `hrm_requisition` | Submit requisition / đề xuất tuyển | `requisitionId` |
| `hrm_candidate_pipeline` | `hrm_candidate` | Candidate vào pipeline (sau plan/req approved) hoặc explicit «Bắt đầu QT» | `candidateId` |

**Rationale:** Plan approval ≠ headcount requisition ≠ multi-step candidate pipeline. Collapsing into one multi-process code would blur `businessId`, resolver context, and AC/J journeys. Sponsor may later waive plan OR requisition for a thin pilot slice — **codes stay reserved**; Dev implements all three unless PM scopes W2 to a subset with bus note (AC outcomes unchanged).

**Invariant:** Inbox assignee resolution **only** in XBOS (F4). HRM passes `submitter` + `memberTenantId` / `memberCompanyId` / entity ids in `context` only.

### Q2 — Intermediate step callback vs terminal-only? (**SA**)

**Answer: Dual callback surface for recruitment — step + terminal. Leave stays terminal-only (must_keep).**

| Consumer | Callback | When | HRM effect |
|----------|----------|------|------------|
| Leave (F4) | Terminal only | Instance `completed`/`rejected` | Approve/reject leave — **unchanged** |
| Plan / requisition | **Terminal required**; step optional (single-step graphs) | Terminal → `approved`/`open` or `rejected` | BR-REC-WF-03/06/07 |
| Candidate pipeline | **Step required** + terminal | Each step complete → map `task_type`→`stage`; terminal → `hired`/`rejected` | UC-HRM-REC-WF-04 · BR-REC-WF-04/05 |

**Endpoints (HRM, internal auth):**

```text
POST /api/hrm/recruitment/workflow/step
POST /api/hrm/recruitment/workflow/terminal
```

**Payload minimum (normative):**

| Field | step | terminal |
|-------|------|----------|
| `businessType` | ✓ | ✓ |
| `businessId` | ✓ | ✓ |
| `workflowInstanceId` | ✓ | ✓ |
| `stepKey` / `taskType` | ✓ | optional |
| `terminalStatus` | — | `completed` \| `rejected` |
| `reviewerUserId` | ✓ | ✓ |
| `rejectedReason` | — | when rejected |

**Fail-closed:** Unmapped `task_type` → do **not** change stage; log/code `HRM-REC-WF-STAGE-UNMAPPED` (BR-REC-WF-04). Final map table = ba-data `XHRM-REC-WF-BD-01`.

**XBOS engine delta:** Extend `notifyHrmLeaveTerminal` pattern → `notifyHrmRecruitmentCallback` branched by `business_type` ∈ {`hrm_recruitment_plan`,`hrm_requisition`,`hrm_candidate`}; on **non-terminal** `completeStepTask` also POST `/workflow/step`. **Do not** modify leave callback path body/URL.

---

## 4. Target architecture & ownership

```text
┌─────────────────────────────────────────────────────────────────┐
│ XBOS — SoT                                                        │
│  Catalog STT 37–42 (DANH_MUC §6)                                  │
│  workflow definitions (codes §3 Q1) + resolver (F4)               │
│  xbos_workflow_instance / step_task / inbox                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ S2S start (HRM→XBOS)
                             │ S2S step/terminal callback (XBOS→HRM)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ HRM — SoT domain (DANH_MUC §13)                                   │
│  plan / requisition / candidate / interview rows                  │
│  workflow_instance_id FK (mirror leave_requests)                  │
│  RecruitmentWorkflowBridge (NEW — parallel to Leave, not replace) │
│  Dashboard aggregate UC-HRM-RC-09 (stage post-callback)           │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Owner | OpenAPI / API surface |
|-------|-------|------------------------|
| Catalog labels 37–42 | XBOS | Existing `config-sync` — HRM consume only |
| WF definition + instance + tasks | XBOS | `docs/api/openapi/xbos-api.yaml` `M01-WF` — `POST /workflow-engine/instances` (start), tasks complete/reject |
| Domain CRUD plan/req/candidate | HRM | `docs/api/openapi/hrm-api.yaml` `/recruitment/*` — **UPGRADE** fields only |
| Bridge callbacks | HRM | New `/recruitment/workflow/step|terminal` — internal JWT |
| Lock bypass | HRM | PATCH stage/status → **409** `HRM-REC-WF-LOCKED` when active instance (BR-REC-WF-08) |

**Scope parity:** list/get/mutate plan|requisition|candidate **same** scope resolver (AC-REC-WF-09 · BR-INT-01).

---

## 5. OpenAPI boundary checklist (Dev must update same PR)

### 5.1 XBOS (`xbos-api.yaml`)

| operationId | Change |
|-------------|--------|
| `wfStartInstance` | Document recruitment `workflowCode` / `businessType` enums; idempotent return existing active instance for same `(tenant, businessType, businessId)` |
| `wfCompleteTask` / `wfRejectTask` | Note side-effect: HRM step/terminal notify for recruitment types |
| (optional) definition seed via canvas only | No seed scripts in UAT evidence |

### 5.2 HRM (`hrm-api.yaml`)

| Path | Change |
|------|--------|
| `/recruitment/requisitions` (+ plans/candidates as exist) | Add nullable `workflow_instance_id`; status values include `pending_approval` where applicable |
| `POST /recruitment/workflow/step` | Internal; BR-REC-WF-03/04 |
| `POST /recruitment/workflow/terminal` | Internal; BR-REC-WF-05/06/07 |
| PATCH stage/status | Document **409** `HRM-REC-WF-LOCKED` when instance active |

**Envelope:** Keep existing `success/code/data` + `x-api-code` — no new public envelope.

---

## 6. NFR — idempotent spawn & callback auth

| NFR | Requirement | Evidence |
|-----|-------------|----------|
| **Idempotent spawn** | Re-POST start same `businessType`+`businessId` while instance `active`/`pending` → **200** same `workflowInstanceId`; no second inbox fanout | jest BE |
| **Idempotent terminal** | Duplicate terminal → 200 no-op if entity already terminal (BR-REC-WF-07) | jest + AC-REC-WF |
| **Idempotent step** | Same `(instanceId, stepKey, taskId)` applied twice → no stage rewind | jest |
| **Callback auth** | Service JWT (`Authorization: Bearer`) + scope headers; production **rejects** static key alone (same class as catalog S2S / leave) | jest `isAuthorizedInternalRequest` |
| **Observability** | Logs: `HRM-REC-WF-SPAWN-MISSING`, `HRM-REC-WF-STAGE-UNMAPPED`, `HRM-REC-WF-LOCKED`, `HRM-REC-WF-CALLBACK-SKIP` | metrics optional counter |
| **Platform** | Reuse `@xevn/platform-core` requestId; no new ad-hoc logger | NFR baseline |

---

## 7. Status / stage sync policy (normative draft → ba-data finalizes map)

| Entity | After spawn | Terminal completed | Terminal rejected |
|--------|-------------|--------------------|-------------------|
| Plan | `pending_approval` + `workflow_instance_id` | `approved` | `rejected` |
| Requisition | `pending_approval` + id | `approved` / `open` | `rejected` |
| Candidate | pipeline active | `hired` only if hire AC (BR-REC-WF-05 / UC-HRM-INT-01) | `rejected` |

F6 funnel columns **unchanged:** `new` · `screening` · `interview` · `offer` · `hired` · `rejected`.  
Suggested `task_type` draft (BA §7) — **ba-data owns 1:1 final table**.

---

## 8. CODE-MEMORY requirements (Dev — AC-REC-WF-10)

Every new/changed bridge file **must** include `@CODE-MEMORY` (APPEND mode; no silent REPLACE of leave memory):

```text
@CODE-MEMORY
UC: UC-HRM-REC-WF-0x
SRS: docs/hrm/SRS.md §16.5 (delta) · docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
TechSpec: docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3–§6
WorkItem: XHRM-REC-WF-BE-01 | XHRM-REC-WF-FE-01
must_keep: UF-HRM-12, J-HRM-05, LeaveWorkflowBridge, CatalogWorkflowBridge, AC-CD-F6-*
change_mode: UPGRADE
```

### 8.1 Allowed paths (blast radius)

| Lane | allowed_paths |
|------|----------------|
| BE HRM | `apps/api/hrm-api/src/recruitment/**` (new `*workflow*` bridge/controller); OpenAPI `hrm-api.yaml` recruitment paths |
| BE XBOS | `apps/api/xbos-api/src/workflow-engine/**` — **additive** notify for recruitment types + catalog constants codes; **forbidden:** rewrite `notifyHrmLeaveTerminal` leave URL/contract |
| FE | Roadmap/dashboard bind to synced stage; disable direct approve when instance active |
| **forbidden** | `leave-workflow.bridge.ts` REPLACE; catalog bridge REPLACE; seed scripts for UAT evidence |

### 8.2 Suggested CODE-MEMORY sections per file

| File (create/extend) | UC focus | must_keep callout |
|----------------------|----------|-------------------|
| `recruitment-workflow.bridge.ts` | WF-02 spawn, WF-04 step, WF-06 reject | Leave bridge untouched |
| `recruitment-workflow.controller.ts` | Internal step/terminal | Callback auth NFR |
| `recruitment.service.ts` (lock hooks) | BR-REC-WF-08/09 | UF-HRM-12 when no instance |
| `workflow-engine.service.ts` (notify) | WF-03/04 | Leave notify path keep |
| `workflow-catalog.constants.ts` | WF-01 codes | Additive constants only |
| FE roadmap / funnel bind | WF-04/05 | AC-CD-F6 funnel columns |

---

## 9. Traceability

| BA artifact | ADR section |
|-------------|-------------|
| UC-HRM-REC-WF-01..06 | §3 Q1, §4–§7, §10 |
| BR-REC-WF-01..14 | §3 Q2, §6–§7 |
| AC-REC-WF-01..11 | §10 validation |
| J-REC-WF-01..06 | §10 |
| BA Q1 / Q2 | **§3** |
| DANH_MUC §1/§6/§13 | §4 |

---

## 10. Implementation & validation plan

### 10.1 Rollout

1. **ba-data** `XHRM-REC-WF-BD-01` — finalize `task_type`↔stage + field list `workflow_instance_id`.
2. **dev-be** `XHRM-REC-WF-BE-01` — `RecruitmentWorkflowBridge` + XBOS notify + jest idempotent/lock/auth; CODE-MEMORY.
3. **dev-fe** `XHRM-REC-WF-FE-01` — roadmap + disable bypass + SPAWN-MISSING banner.
4. **qa** `XHRM-REC-WF-QA-01` — J-REC-WF-01..06 U65 + regression UF-HRM-12 / leave / catalog.
5. **qc** `XHRM-REC-WF-QC-01` — GO/GWC; **no** Phase1/PROD claim.

### 10.2 Rollback

Feature flag / missing definition → bridge no-op spawn (entity pending + banner); local PATCH stage remains (BR-REC-WF-09). Leave/catalog paths never gated by recruitment flag.

### 10.3 Success criteria

| Gate | Pass |
|------|------|
| AC-REC-WF-01..11 | Evidence paths under `docs/qa/evidence/xhrm-rec-wf-*` |
| must_keep smoke | Leave terminal + catalog start + UF-HRM-12 |
| OpenAPI | YAML updated same PR as BE |
| CODE-MEMORY | Preflight / TM reject if missing |

---

## 11. Risks & mitigations

| ID | Risk | Mitigation |
|----|------|------------|
| R-REC-WF-01 | PATCH bypass | BR-REC-WF-08 · AC-REC-WF-07 · 409 |
| R-REC-WF-02 | Dashboard stale | Callback then FE refresh; no mock |
| R-REC-WF-03 | Unmapped task_type | Fail-closed UNMAPPED |
| R-REC-WF-04 | Seed inbox | U65 · QC reject |
| R-REC-WF-05 | Leave regression | forbidden_paths + AC-REC-WF-11 |
| R-REC-WF-06 | Dual definition confusion | Q1: keep 3 codes; PM may scope implement subset |

---

## 12. Alignment note (BA closed)

This ADR **accepts** BA delta `XHRM-REC-WF-BA-01` without UC/BR renumbering. SA decisions that were open in BA §13:

| BA # | Resolution |
|------|------------|
| Q1 | **3 codes** (§3) — default “hai” plan+requisition **plus** candidate pipeline |
| Q2 | **Step + terminal** for recruitment; leave terminal-only |
| A1 | Rejected collapse to 1 multi-process code for pilot |
| A2 | Remains ba-data W1 |
| A3 | Hire terminal still needs employee link (F6) — Dev-BE |

**SRS promote:** After ba-data + this ADR, BA governance merges into `docs/hrm/SRS.md` §16.5 — do not delete §13/§14/§16.4 F6.
