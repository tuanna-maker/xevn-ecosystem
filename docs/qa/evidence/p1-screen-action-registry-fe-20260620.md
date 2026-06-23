# P1-SCREEN-ACTION-REGISTRY-FE-01 — capabilityActionRegistry catalog sync

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-SCREEN-ACTION-REGISTRY-FE-01` |
| **from_role** | dev-fe |
| **spec_ref** | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` §1–§16 |
| **ack_status** | **READY_FOR_QA** |

## Scope

Metadata-only promotion of Screen Action Catalog capability codes into `apps/web/web-portal/src/integrations/capabilityActionRegistry.ts`. **No UI wiring changes.**

## Closed

| Metric | Before | After |
|--------|-------:|------:|
| Registry entries | 20 | **49** |
| Unique catalog §1–§16 codes covered | 20/49 | **49/49** |
| Delta `ACT-*` codes promoted | 0/12 | **12/12** |

### Delta `ACT-*` promoted (12)

| capability_code | wireMode | apiRoute (summary) |
|-----------------|----------|-------------------|
| `ACT-CC-SHR-DELETE` | api | DELETE …/shareholders/:id |
| `ACT-CC-LEGAL-DOC-ADD` | api | POST …/documents |
| `ACT-CC-LEGAL-DOC-DELETE` | api | DELETE …/documents/:id |
| `ACT-CC-WF-REJECT` | api | POST …/tasks/:id/reject |
| `ACT-CC-DEPT-DELETE` | api | DELETE …/org-units/:unitId |
| `ACT-HRM-EMP-ARCHIVE` | api | POST …/employees/:id/archive |
| `ACT-HRM-INS-LINK` | api | POST\|PATCH …/insurance-policy-participants |
| `ACT-HRM-ATT-CREATE` | api | POST …/attendance/records |
| `ACT-HRM-REC-CREATE` | api | POST …/recruitment/requisitions |
| `ACT-HRM-DEC-READ` | client | mock — no API Phase 1 |
| `ACT-HRM-META-APPROVE` | api | POST …/change-requests/:id/approve |
| `ACT-HRM-META-REJECT` | api | POST …/change-requests/:id/reject |

### Additional catalog codes promoted (17)

`CC-GROUP-MEMBER-UNITS`, `CC-WORKFLOW-INBOX`, `G19-CATALOG-GOVERNANCE-API`, `SETTINGS-DEPT-CATALOG`, `CC-KPI-SPARKLINE`, `G24-KPI-ROLLUP`, `G11-RACI-GOVERNANCE`, `BTN-B1-EMPLOYEES-CREATE`, `BTN-B5-CONTRACTS-EDIT`, `HRM-EMBED-OPERATIONS`, `BTN-B3-ATTENDANCE-SAVE`, `BTN-B7-LEAVE-UNIFY`, `BTN-B2-PAYROLL-PERIODS`, `BTN-B2-PAYROLL-COMPONENTS`, `BTN-B4-RECRUITMENT-PLAN-APPROVE`, `BTN-B4-RECRUITMENT-PLAN-REJECT`, `BTN-B6-HRM-SETTINGS-SAVE`.

## Verify commands

```text
pnpm --filter web-portal test -- src/integrations/capabilityActionRegistry.test.ts
→ 6/6 PASS

pnpm --filter web-portal build
→ exit 0 (tsc + vite)
```

## Residual

- Registry metadata only — QA must still map `test_layer=uf` rows to browser evidence (`P1-SCREEN-ACTION-QA-MAP-01`).
- `ACT-HRM-DEC-READ` mutate remains blocked per catalog §14 (no API).
- `BTN-B7-LEAVE-UNIFY` Phase 2 — registry documents route; UF-HRM-14 not claimed 🟢.

## Handoff

| Field | Value |
|-------|-------|
| **next_owner** | qa |
| **next_dispatch_prompt** | `work_item_id: P1-SCREEN-ACTION-QA-MAP-01 — entry: dev-fe READY_FOR_QA docs/qa/evidence/p1-screen-action-registry-fe-20260620.md + ACTION_BUTTON_INVENTORY.md §1–§16. Exit: browser evidence template per uf row (capability_code + AC-ID + Network 2xx + F5); verify resolveCapabilityActionState/getCapabilityDefinition resolves all 49 codes; prioritize GAP-ACT-01..06 from USER_FLOW_SRS_TRACE_DELTA.md §8. evidence: docs/qa/evidence/screen-action-catalog-map-20260620.md ack READY_FOR_QC slice.` |
