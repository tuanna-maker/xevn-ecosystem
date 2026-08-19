# Slice — DOC-ENT-P0-XBOS-WF

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-XBOS-WF |
| **Epic / lane** | DOC-ENT P0 · Workflow engine |
| **Owner** | W1-B Team Claude → Cursor review |
| **UC / FR** | **FR-UC-B03** · UC-B03 · BR-WF-01..04 |
| **AC** | Diễn biến #2–7 · reject reason ≥10 · no self-approve |
| **Flow test** | FE: định nghĩa → start instance → inbox → complete/reject · optional leave bridge |
| **change_mode** | UPGRADE |
| **work_item_id** | OS-STD-W1-A-SLICE-01 |
| **status** | DRAFT |
| **W1-B priority** | **P0-4** (trước/cùng leave approve bridge) |

## spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_NEW.md v1.1 §3.2 · FR-UC-B03
- tech_spec: TECH_SPEC_NEW.md v1.1 · workflow ownership xbos-api
- db_design: DB_DESIGN_NEW.md §3.4–3.6 — xbos_workflow_definition, xbos_workflow_instance, xbos_workflow_step_task
- api_design: API_CONTRACT_NEW.md v1.1 §1
- slice: docs/program/slices/DOC-ENT-P0-XBOS-WF.md
- change_mode: UPGRADE
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| API §1 · DB §3.4–3.6 | READ | SoT |
| This slice | ADD | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed)

| Layer | Path | Neo tag | must_keep | Owner |
| --- | --- | --- | --- | --- |
| BE WF | `apps/api/xbos-api/src/workflow-engine/**` | @CODE-MEMORY | SM + self-approve block BR-WF-04; reject reason ≥10 | dev-be |
| FE API client | `apps/web/web-portal/src/integrations/workflowEngineApi.ts` · `workflowMapper.ts` · `workflowInstanceMapper.ts` | @CODE-MEMORY | inbox/complete/reject wire | dev-fe |
| FE CC UI | `apps/web/web-portal/src/pages/command-center/WorkflowCanvas.tsx` · `WorkflowTaskDetailDrawer.tsx` | @CODE-MEMORY | dashed reject UX; display labels | dev-fe |
| FE labels | `apps/web/web-portal/src/utils/workflowDisplayLabels.ts` | @CODE-MEMORY | prefer BE labels when available (`28`) | dev-fe |
| Inbox | `apps/web/web-portal/src/integrations/commandCenterInboxApi.ts` | @CODE-MEMORY | empty inbox hợp lệ — không seed | dev-fe |

### API endpoints

| Method | Path |
| --- | --- |
| POST | `/api/xbos/workflow-engine/instances` (alias `…/instances/start`) |
| GET | `/api/xbos/workflow-engine/tasks` |
| POST | `/api/xbos/workflow-engine/tasks/:taskId/complete` |
| POST | `/api/xbos/workflow-engine/tasks/:taskId/reject` |
| GET | `/api/xbos/workflow-engine/instances/:instanceId/detail` |
| GET/POST/PUT | `/definitions` · `/definitions/:id` (P0 phụ) |

### Tables

`xbos_workflow_definition` · `xbos_workflow_instance` · `xbos_workflow_step_task`

## C. Ops

| Path | Neo | Note |
| --- | --- | --- |
| — | — | U65: không `seed:workflow:inbox` |

## D. Forbidden

- Seed inbox để pass QA
- Self-approve bypass
- Reject không validate độ dài lý do
- apps/** ngoài B · rewrite NEW docs

## E. Residual

| id | Mô tả | ack |
| --- | --- | --- |
| R-WF-LEAVE-BRIDGE | Optional bind leave `workflow_instance_id` — coordinate DOC-ENT-P0-HRM-LEAVE | OPEN |

## F. Verify (W1-B)

- [ ] Full FE chuỗi tạo nguồn → inbox → duyệt/từ chối
- [ ] Empty inbox = 🟡/hợp lệ — không fake seed
- [ ] diff ⊆ slice

## Team Claude note

```text
xbos-api only for engine; leave sync is separate slice with optional FK.
Draft OK; Cursor REVIEW_ACCEPT before QA. Override 28 filename until C-OS-29-NAME-01.
```
