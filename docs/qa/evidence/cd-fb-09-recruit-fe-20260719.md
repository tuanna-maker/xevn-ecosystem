# CD-FB-09-RECRUIT — Dev-FE evidence (2026-07-19)

**work_item_id:** `CD-FB-09-RECRUIT`  
**from_role:** dev-fe  
**ack_status:** **READY_FOR_QA**  
**sponsor_lock:** U67 F6 · U65 zero-seed · no Phase1/PROD claim  
**out_of_scope:** XBOS WF recruitment E2E bridge (defer SA ADR)

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` | §6 F6 · UC-HRM-RC-07..09 · BR-CD-F6-01..06 · AC-CD-F6-01..06 |
| `docs/hrm/SRS.md` | §13 UC-HRM-22 · §14 UC-HRM-30 |
| Note | XBOS recruitment WF **not** in F6 MVP |

**spec says / code does**

| Spec | Implementation |
|------|----------------|
| UC-HRM-RC-07 JD library CRUD | Tab **Thư viện JD** → `GET/POST/PATCH/DELETE /api/hrm/recruitment/job-templates` |
| UC-HRM-RC-08 attach JD to requisition | Create requisition: picker template → snapshot `job_description` + `requirements` |
| UC-HRM-RC-09 / AC-CD-F6-03 6-column funnel | Dashboard `CandidatePipelineFunnel` + CC embed strip; stages `new…rejected` |
| BR-DQ-01 no mock 1OFFICE | Counts from `candidates-pool` / kanban API only |
| BR-CD-F6-02 snapshot not live link | Requisition stores copied text + optional `job_template_id` |

---

## Delivered

### HRM app (`apps/web/hrm`)
- `JobTemplatesTab` + `useJobTemplates` — CRUD JD library
- `JobRequisitionsTab` — template picker + JD/requirements fields on create; detail shows snapshot
- `Recruitment.tsx` — tab **Thư viện JD**; dashboard pipeline 6 stages; board 6 columns incl. rejected
- `lib/recruitmentFunnel.ts` — normative stage map (`applied`→`new`)

### Portal embed (`apps/web/web-portal`)
- Recruitment view: 6-stage funnel from `listHrmCandidatesPool` + existing requisition table
- Mapper `mapHrmRecruitmentFunnelCounts` (BR-DQ-01)

### HRM API (minimal contract for F5 persist — AC-CD-F6-01)
- Table `job_description_templates` + CRUD endpoints
- Requisition columns `job_description`, `requirements`, `job_template_id`

`@CODE-MEMORY` on: `recruitmentFunnel.ts`, `CandidatePipelineFunnel.tsx`, `JobTemplatesTab.tsx`, `useJobTemplates.ts`, `JobRequisitionsTab.tsx`, portal panel change note.

---

## Tests (agent-run)

| Suite | Result |
|-------|--------|
| `apps/web/hrm` `src/lib/recruitmentFunnel.test.ts` | **3/3 PASS** |
| `apps/web/web-portal` `hrmWorkspaceEmbedApi.test.ts` | **6/6 PASS** (incl. F6 funnel) |
| `hrm-api` `tsc -p tsconfig.build.json --noEmit` | **exit 0** |

---

## QA browser plan (U65 — no seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** HRM `/hr/recruitment` (standalone or portal open HRM)

| AC | Click path | Pass when |
|----|------------|-----------|
| AC-CD-F6-01 | Thư viện JD → Thêm JD → Lưu → F5 → row còn | Persist API |
| AC-CD-F6-02 | Yêu cầu tuyển dụng → chọn JD template → JD điền sẵn → Lưu → Chi tiết thấy snapshot | Not empty JD |
| AC-CD-F6-03 | Dashboard → 6 cột pipeline; số = candidates API | No hardcoded org |
| AC-CD-F6-04 | Scope filter ĐVTV (trsport) | Counts subset; no 1OFFICE |
| J-HRM-05 | List → Chi tiết GET-by-id | Detail dialog |
| P-CC-06 | CC HRM recruitment embed | Funnel strip + list |

**Cấm evidence:** `pnpm seed:*`, API-only PASS without FE.

---

## Residual (not blocking READY_FOR_QA for F6 MVP UI)

| Item | Owner | Note |
|------|-------|------|
| OpenAPI / jest BE job-templates suite | dev-be | Controllers ship; formal OpenAPI delta optional |
| AC-CD-F6-06 interview deep-link from funnel click | qa | Click stage → candidates tab; full interview calendar cross-nav smoke |
| XBOS recruitment WF | SA + defer | Explicit out of F6 |

---

## Handoff

**completion_report:** F6 MVP FE delivered — JD library CRUD + requisition template snapshot + 6-stage pipeline on HRM dashboard/board and CC embed. Minimal BE endpoints for persist. Unit tests PASS. No seed. No Phase1/PROD claim.

**next_owner:** qa  
**ack_status:** READY_FOR_QA  
**evidence_path:** `docs/qa/evidence/cd-fb-09-recruit-fe-20260719.md`

**next_dispatch_prompt:**
```
work_item_id: CD-FB-09-RECRUIT
from_role: pm
to_role: qa
entry_criteria: browser-only U65; L0 stack up; ceo@xe.vn
exit_criteria: AC-CD-F6-01..04 evidence blocks; J-HRM-05 list→detail; P-CC-06 funnel strip; matrix update; PASS_TO_PM or FAIL with residual
cấm: seed; API-only PASS
evidence_path: docs/qa/evidence/cd-fb-09-recruit-qa-YYYYMMDD.md
read_first: docs/qa/evidence/cd-fb-09-recruit-fe-20260719.md · CUSTOMER_DEMO_HRM_DELTA §6
```
