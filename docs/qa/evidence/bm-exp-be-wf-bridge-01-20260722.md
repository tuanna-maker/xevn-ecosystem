# BM-EXP-BE-WF-BRIDGE-01 — BE inventory (apps/api only)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-EXP-BE-WF-BRIDGE-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | explore |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **dated** | 2026-07-22 |
| **scope** | Inventory ONLY — no `apps/**` edits · no seed |
| **thoroughness** | very thorough |

## Spec read ack

| Artifact | Use |
|----------|-----|
| `docs/program/BMINUTES_CUSTOMER_RETEST_PROGRAM.md` | BM-03..BM-07 packages |
| `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` | F4 resolver · F6 JD |
| `docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` | `resolver_type` enum (not `assigneeType`) |
| `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` | Spawn/callback SoT |
| `docs/hrm/TECHSPEC.md` §14.7 / §14.8 · `UC-HRM-RC-07` delta | RC + JD + SC |
| `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` | XBOS-DM-HRM-07..10 |

---

## 1) Recruitment workflow bridge — spawn / callback

### Files

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts` | Spawn XBOS `instances/start` · step/terminal apply · LOCK map |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.controller.ts` | Internal S2S callbacks |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | FE spawn triggers |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` | `notifyHrmRecruitmentCallback` → HRM |

### Spawn triggers (HRM → XBOS)

| Endpoint | Code | `businessType` | `workflowCode` | Table updated |
|----------|------|----------------|----------------|---------------|
| `POST /api/hrm/recruitment/recruitment-plans/:planId/submit-workflow` | `HRM-REC-PLAN-WF-200` | `hrm_recruitment_plan` | `hrm_recruitment_plan_approval` | `recruitment_plans` (`pending_approval` + `workflow_instance_id`) |
| `POST /api/hrm/recruitment/requisitions/:requisitionId/submit-workflow` | `HRM-REC-WF-200` | `hrm_requisition` | `hrm_requisition_approval` | `job_requisitions` |
| `POST /api/hrm/recruitment/candidates-pool/:candidateId/start-pipeline` | `HRM-REC-CP-WF-200` | `hrm_candidate` | `hrm_candidate_pipeline` | `candidates` (stage → `new`) |

Upstream: `POST {XBOS}/api/xbos/workflow-engine/instances/start` with `submitter.employeeId` (fail-closed `HRM-REC-WF-SPAWN-MISSING` if unresolved).

### Callbacks (XBOS → HRM, internal auth)

| Endpoint | When | Effect |
|----------|------|--------|
| `POST /api/hrm/recruitment/workflow/step` | Step complete on candidate pipeline | Map `taskType` → stage via `REC_WF_TASK_TYPE_TO_STAGE` (`rec_intake`→`new` … `rec_offer`→`offer`); plan/req = noop skip |
| `POST /api/hrm/recruitment/workflow/terminal` | Instance terminal | Plan → `approved`/`rejected`; Req → `open`/`rejected`; Candidate → `hired` (hire AC) / `rejected` |

XBOS paths in `notifyHrmRecruitmentCallback`: `/api/hrm/recruitment/workflow/step|terminal`.

### Existence verdict

| Capability | Status |
|------------|--------|
| Bridge + spawn + callbacks | **PRESENT** |
| Schema cols `workflow_instance_id` / fingerprint / rejected_reason | **PRESENT** (ensureSchema) |
| Auto-ensure active WF definitions in DB | **ABSENT** — builders in `workflow-catalog.constants.ts` are canvas-ready only (U65); spawn needs definition already active |

---

## 2) XBOS WF definition — assigneeType / role / title / parallel

### Naming SoT (important)

There is **no** field named `assigneeType` in `apps/api`. Normative field = **`resolver_type`** (ADR-WORKFLOW-RESOLVER-DYNAMIC §5).

Legacy / shim fields still present on graph steps:

| Field | Meaning | Notes |
|-------|---------|-------|
| `resolver_type` | Dynamic assignee | `fixed_user` · `position_template` · `direct_manager` · `role_code` · `parallel_group` |
| `resolver_config` | Type-specific | e.g. `position_code`, `role_code`, `parallel_policy`, `fallback_role_code` |
| `hatKey` / `handlerRoleId` | Legacy hat | Shim → `fixed_user` / inbox target when `resolver_type` absent |
| `assigneeUserId` | Fixed person | Deprecation path; catalog WF still uses `GROUP_APPROVER_USER` |

### Parallel

| Mechanism | Location | Status |
|-----------|----------|--------|
| `resolver_type=parallel_group` + `parallel_policy` `all`\|`any` | `resolver-registry.ts` | **PRESENT** |
| Task payload `parallelGroupId` / `parallelPolicy` | engine completeStep | **PRESENT** |
| Same-hat first-wins (legacy fan-out without parallelGroupId) | `applySameStepHatAnyPolicy` | **PRESENT** (must_keep F4) |

### Recruitment catalog builders (`workflow-catalog.constants.ts`)

| Definition | Steps | resolver_type | Gap vs BM-03 |
|------------|-------|---------------|--------------|
| `buildHrmRecruitmentPlanApprovalDefinition` | 1× `plan_approval` | `direct_manager` | OK baseline manager; no position/parallel demo in template |
| `buildHrmRequisitionApprovalDefinition` | 1× `requisition_approval` | `direct_manager` | Same |
| `buildHrmCandidatePipelineDefinition` | intake→offer (4 steps) | **none** | **GAP** — no dynamic resolver on pipeline steps |

### Existence matrix (BM-03 customer ask)

| Customer concept | Code concept | Engine | Recruitment templates |
|------------------|--------------|--------|------------------------|
| Chức danh | `position_template` + `position_code` | **YES** | Not in rec builders |
| Cấp trên | `direct_manager` | **YES** | Plan + requisition only |
| Song song | `parallel_group` | **YES** | Not in rec builders |
| Role | `role_code` | **YES** | Escalation / leave patterns |
| Title catalog as assignee | `job_titles` config item ≠ resolver | N/A | Titles ≠ WF assignee |

---

## 3) Catalog publish · apply-to-members · HRM recruitment keys

### Publish endpoints (single scope only)

| Endpoint | Codes | Tables |
|----------|-------|--------|
| `POST /api/xbos/config-sync/catalog/:catalogKey/publish` | `XBOS-CFG-203` | `config_catalogs` · `config_catalog_items` |
| `POST /api/xbos/catalog-governance/publish?catalogKey=` | `XBOS-CFG-203` | Same (delegates) |

`publishCatalog(tenantId, companyId, …)` upserts **one** `(tenant_id, company_id, catalog_key)` partition. **No** `applyToMembers` / fan-out / copy-to-subsidiaries parameter or method in config-sync / catalog-governance / business-master.

### Bootstrap keys (holding only)

`bootstrapXevnGroupConfig`: `job_titles`, `cost_centers`, `kpi_library` — **no** `recruitment_*` / JD / WF definition catalog keys.

### HRM pull (member consumes holding snapshot)

| Endpoint | Role |
|----------|------|
| `POST /api/hrm/catalog-sync/pull/:catalogKey` | Pull one key into `synced_catalogs` |
| `POST /api/hrm/settings-catalogs/sync-from-xbos` | Bulk pull into settings snapshot |
| `GET /api/hrm/settings-catalogs` | Overview (FR-HRM-SC-01) |

### XBOS-DM-HRM-07 (sao chép chức danh → công ty con)

| Spec says | Code does |
|-----------|-----------|
| Copy title library to member companies | **No dedicated copy/apply-to-members API** |
| Partial matrix (`PHASE1_UC…` Một phần) | Workaround: `POST …/settings-catalogs/seed/tenant-position-catalog` (+ `-all`) — **seed path, U65 cấm for UAT evidence** |

### BM-06 (XBOS cấu hình tuyển dụng → áp dụng đơn vị → HRM WF)

| Needed | Present? |
|--------|----------|
| Publish recruitment process / WF graph to members | **NO** — WF defs live in `xbos_workflow_definition` via canvas/API, not config-sync catalog |
| Apply published catalog keys for recruitment | **NO** recruitment-specific keys |
| Member HRM spawn uses group WF | **PARTIAL** — spawn by `workflowCode`; definition must exist in XBOS for that scope |

---

## 4) Job-templates API + `job_requisitions.job_template_id`

### API (HRM)

| Method | Path | Codes | Service |
|--------|------|-------|---------|
| GET | `/api/hrm/recruitment/job-templates` | `HRM-REC-JD-200` | `listJobDescriptionTemplates` |
| POST | `/api/hrm/recruitment/job-templates` | `HRM-REC-JD-201` | `createJobDescriptionTemplate` |
| PATCH | `/api/hrm/recruitment/job-templates/:templateId` | `HRM-REC-JD-200` | `update…` |
| DELETE | `/api/hrm/recruitment/job-templates/:templateId` | `HRM-REC-JD-200` | `delete…` |

### Table

`public.job_description_templates` — `(id UUID, company_id, code UNIQUE(company_id,code), title, position_name, job_description, requirements, notes, …)`.

### Link on requisition

| Column | Type | FK? | Notes |
|--------|------|-----|-------|
| `job_requisitions.job_template_id` | **TEXT** | **No** | Soft id + JD/requirements **snapshot** on create (`CreateJobRequisitionDto`); BR-CD-F6-02 |

DTO optional `job_template_id` MaxLength 64 — stores template UUID as text, not `REFERENCES job_description_templates`.

### Spec map

| SRS / UC | Status |
|----------|--------|
| UC-HRM-RC-07 / AC-CD-F6-01 JD library | **PRESENT** (CRUD) |
| FR-HRM-RC-01 bind JD on create | **PARTIAL** — optional snapshot fields present; live FK not required by current BR |

---

## 5) Position / job_title catalog — tables & endpoints

### XBOS master (titles + org positions)

| Surface | Endpoints / tables |
|---------|-------------------|
| Config catalog `job_titles` | publish/get via config-sync · `config_catalogs` / `config_catalog_items` |
| Position RBAC | `GET/POST /api/xbos/position-rbac/templates` · `…/assignments` · `PUT …/job-descriptions/:templateId` |
| Tables | `xbos_position_template` · `xbos_position_assignment` · `xbos_job_description` |

### HRM consumer

| Surface | Endpoints / tables |
|---------|-------------------|
| Settings catalogs | `GET/POST/PATCH/DELETE /api/hrm/settings-catalogs…` · extension items · sync-from-xbos |
| Synced snapshot | `synced_catalogs` · `hrm_catalog_extension_items` |
| Tenant position seed | `POST …/seed/tenant-position-catalog` — hardcoded `tenant-position-catalog.ts` (**seed**) |
| Employee field | `employees.job_title_key` TEXT (not FK to catalog) |

### Dual JD / title surfaces (BM-05 / BM-07 risk)

| Store | Owner | Use |
|-------|-------|-----|
| `job_description_templates` | HRM recruitment | F6 JD library |
| `xbos_job_description` | XBOS position-rbac | Position MTCV |
| `config_catalog_items` key=`job_titles` | XBOS → HRM sync | Title codes/labels |

---

## Master matrix — endpoint | table | SRS FR | gap

| # | Endpoint / capability | Table(s) | SRS / UC / FR | Gap ID | Verdict |
|---|----------------------|----------|---------------|--------|---------|
| 1 | `POST …/recruitment-plans/:id/submit-workflow` | `recruitment_plans` | UC-HRM-REC-WF-* · ADR bridge | — | PRESENT |
| 2 | `POST …/requisitions/:id/submit-workflow` | `job_requisitions` | FR-HRM-RC-01 + WF · UF-HRM-12 | — | PRESENT |
| 3 | `POST …/candidates-pool/:id/start-pipeline` | `candidates` | UC-HRM-REC-WF · INT-01 hire path | — | PRESENT |
| 4 | `POST …/recruitment/workflow/step` | `candidates` | BR-REC-WF stage map F6 | — | PRESENT |
| 5 | `POST …/recruitment/workflow/terminal` | plans / reqs / candidates | BR-REC-WF terminal | — | PRESENT |
| 6 | Definition field `assigneeType` | — | BM-03 customer wording | **G-BM-01** | **ABSENT** (use `resolver_type`) |
| 7 | Engine `resolver_type` enum + parallel | `xbos_workflow_*` | AC-CD-F4-* · ADR §5 | — | PRESENT |
| 8 | Rec WF builders: position + parallel | (definition JSON) | BM-03 · BM-06 | **G-BM-02** | **GAP** — candidate steps lack resolver; templates no parallel/position |
| 9 | `POST …/config-sync/…/publish` | `config_catalogs` | XBOS-DM-HRM-09 · FR-HRM-SC-01 consumer | — | PRESENT (single scope) |
| 10 | Apply-to-members / copy titles to subsidiaries | — | XBOS-DM-HRM-07 · BM-06 | **G-BM-03** | **ABSENT** |
| 11 | Catalog keys for recruitment/JD/WF | — | BM-05 · BM-06 | **G-BM-04** | **ABSENT** — only job_titles/cost_centers/kpi_library |
| 12 | `CRUD …/job-templates` | `job_description_templates` | UC-HRM-RC-07 · AC-CD-F6-01 | — | PRESENT |
| 13 | `job_requisitions.job_template_id` FK | `job_requisitions` | BR-CD-F6-02 snapshot | **G-BM-05** | **SOFT TEXT** — no FK (may be ACCEPT if BA confirms snapshot) |
| 14 | XBOS `position-rbac/templates|assignments` | `xbos_position_*` | BM-07 · position_template resolver | — | PRESENT |
| 15 | HRM settings `job_titles` + seed position | `synced_catalogs` / extensions | FR-HRM-SC-01 · XBOS-DM-HRM-06/07 | **G-BM-06** | **PARTIAL** — seed-only copy path |
| 16 | Create requisition status=`open` without submit-workflow | `job_requisitions` | BM-06 WF gán | **G-BM-07** | **PRODUCT GAP** — create skips `pending_approval` unless FE calls submit |
| 17 | Dual JD: HRM templates vs XBOS position JD | both | BM-05 / BM-07 | **G-BM-08** | **DUAL SURFACE** — no sync bridge |

---

## Gap register → Dev-BE work_items (narrow)

| Gap | Severity | Proposed `work_item_id` | Outcome |
|-----|----------|-------------------------|---------|
| **G-BM-01** | P2 docs/FE alias | `BM-BA-AC-MATRIX-01` (already open) + optional FE label | Document `assigneeType` ≡ `resolver_type`; no BE rename unless sponsor |
| **G-BM-02** | P0 BM-03/06 | `BM-BE-REC-WF-RESOLVER-TEMPLATES-01` | Enrich rec builders: pipeline steps + optional `position_template` / `parallel_group` examples; ensure/activate path without seed |
| **G-BM-03** | P0 BM-06 / DM-07 | `BM-BE-CFG-APPLY-MEMBERS-01` | `POST …/catalog/:key/apply-to-members` (or clone holding→member companyIds) for `job_titles` (+ allow-list) |
| **G-BM-04** | P1 BM-06 | `BM-BE-CFG-REC-KEYS-01` | Decide: publish WF definition package vs new catalog keys; implement SoT after SA `BM-SA-XBOS-HRM-REC-TRACE-01` |
| **G-BM-05** | P2 | `BM-BE-REC-JD-FK-01` **or** BA ACCEPT | Optional UUID FK + validate template exists; keep snapshot columns |
| **G-BM-06** | P1 BM-07 | Covered by G-BM-03 + non-seed sync | Replace seed-only copy with apply-to-members + pull |
| **G-BM-07** | P1 BM-06 | `BM-BE-REC-REQ-CREATE-STATUS-01` | Align create status with WF (`draft`/`pending_approval`) or auto-spawn on create per SRS |
| **G-BM-08** | P2 | `BM-SA` then `BM-BE-JD-DUAL-TRACE-01` | Trace which JD SoT FE should use; avoid silent dual write |

---

## completion_report

**Closed:** Full BE inventory for bridge spawn/callback, WF resolver vs assigneeType, catalog publish (no apply-to-members), job-templates + soft `job_template_id`, position/job_title surfaces.

**Open:** Gaps **G-BM-02..G-BM-04 / G-BM-07** are P0/P1 for BM-03/BM-06 customer asks; G-BM-01 is naming; G-BM-05/08 need BA/SA confirm before code.

**Not claimed:** Phase1 / PROD / UF PASS — inventory only.

## next_owner

`pm`

## next_dispatch_prompt (copy-ready)

```text
work_item_id: BM-BE-CFG-APPLY-MEMBERS-01
from_role: pm
to_role: dev-be
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: BM-EXP-BE-WF-BRIDGE-01 evidence docs/qa/evidence/bm-exp-be-wf-bridge-01-20260722.md · G-BM-03 · wait BM-SA-XBOS-HRM-REC-TRACE-01 if sequence conflicts
exit_criteria: API apply/copy job_titles (allow-list) from holding → member company partitions without seed; jest; READY_FOR_QA
allowed_paths: apps/api/xbos-api/src/config-sync/** · apps/api/xbos-api/src/catalog-governance/**
forbidden_paths: seed scripts for UAT evidence
evidence_path: docs/qa/evidence/bm-be-cfg-apply-members-01-YYYYMMDD.md
spec_ref: XBOS-DM-HRM-07 · BM-06 · FR-HRM-SC-01
```

```text
work_item_id: BM-BE-REC-WF-RESOLVER-TEMPLATES-01
from_role: pm
to_role: dev-be
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: evidence bm-exp-be-wf-bridge-01 · G-BM-02 · ADR-WORKFLOW-RESOLVER-DYNAMIC §5
exit_criteria: recruitment definition builders include resolver_type on candidate pipeline; demo path for position_template + parallel_group; jest resolver/rec bridge; no leave bridge regression
allowed_paths: apps/api/xbos-api/src/workflow-engine/workflow-catalog.constants.ts · related ensure helpers if any
evidence_path: docs/qa/evidence/bm-be-rec-wf-resolver-templates-01-YYYYMMDD.md
spec_ref: BM-03 · AC-CD-F4-* · ADR bridge
```

```text
work_item_id: BM-BE-REC-REQ-CREATE-STATUS-01
from_role: pm
to_role: dev-be
priority: P1
depends_on: BA confirm create→WF (BM-BA-AC-MATRIX-01)
entry_criteria: G-BM-07 · FR-HRM-RC-01 + REC-WF delta
exit_criteria: create requisition status aligns with WF spawn AC; regression UF-HRM-12 green paths
evidence_path: docs/qa/evidence/bm-be-rec-req-create-status-01-YYYYMMDD.md
```

## Residual / defer

| Item | defer_reason | trigger |
|------|--------------|---------|
| G-BM-05 FK | Snapshot BR may be intentional | BA ACCEPT or sponsor wants live link |
| G-BM-08 dual JD | Needs SA SoT pick | After `BM-SA-XBOS-HRM-REC-TRACE-01` |
| Auto-ensure WF defs | U65 canvas activate policy | Product decision with G-BM-04 |

## pm_dispatch_hint

1. `BM-BE-CFG-APPLY-MEMBERS-01` (G-BM-03)  
2. `BM-BE-REC-WF-RESOLVER-TEMPLATES-01` (G-BM-02)  
3. Hold `BM-BE-REC-REQ-CREATE-STATUS-01` until BA AC matrix  
4. Do not claim BM-06 browser PASS until apply-to-members + WF resolver templates + QA `BM-QA-REC-E2E-8088-01`
