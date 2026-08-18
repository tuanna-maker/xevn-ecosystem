# PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01 — GET clause_layout view bind

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01` |
| **role** | dev-fe |
| **date** | 2026-08-11 |
| **spec_ref** | `docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md` §4.1 · BE `PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01` |
| **ack_status** | **READY_FOR_QA** |

## Summary

ContractWorkspace **view** mode Step 2 binds `clause_layout[]` from single GET contract detail — no `listContractClauses` / template library fetch for canvas. `can_issue` + `preview_summary` from GET gate **Lưu phiên bản in** / **Tải PDF** with VI missing hints.

Create/edit Step 2 **RETAIN** print-overlay PUT for clause order mutate (unchanged).

## Files changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | `HrmContractClauseLayoutItem`, `HrmContractPreviewSummary`, GET fields on `HrmContractRecord` |
| `apps/web/hrm/src/hooks/useContracts.ts` | `Contract` + `mapApiContract` passthrough layout/issue gate |
| `apps/web/hrm/src/lib/contractWorkspaceLayoutBind.ts` | Mapper + `formatContractPreviewSummaryVi` |
| `apps/web/hrm/src/lib/contractWorkspaceLayoutBind.test.ts` | vitest 3 |
| `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx` | `initialClauseLayout` readOnly bind |
| `apps/web/hrm/src/components/contracts/ContractWorkspaceViewBody.tsx` | GET bind + issue-blocked hint + button gates |
| `apps/web/hrm/src/lib/contractWorkspace.source.test.ts` | +1 source lock test |

## spec_read_ack

- **srs:** FR-UC-BP-CORE-09a W1/W5 · FR-UC-BP-CORE-09b
- **tech_spec:** `PO-HRM-CTR-WORKSPACE-SA-01.md` §4
- **api_design:** `API_DESIGN_HRM_CONTRACTS_INS.md` §13.1 EXPAND GET detail
- **evidence_be:** `docs/qa/evidence/po-hrm-ctr-workspace-be-layout-01.md`

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/contractWorkspace.source.test.ts src/lib/contractWorkspaceLayoutBind.test.ts
pnpm exec tsc --noEmit
```

| Check | Result |
|-------|--------|
| vitest layout bind | PASS 13/13 |
| tsc --noEmit | PASS exit 0 |

## QA entry (WS-G4-09..11 if G4 Phase B ran)

| Check | Persona | Click path |
|-------|---------|------------|
| View Step2 canvas | `ceo@xe.vn` | Hợp đồng → eye → bước 2 → `ctr-workspace-view-clause-layout` có điều khoản từ GET |
| One GET | Network | Mở view → **một** GET `contracts/{id}`; Step2 **không** gọi `contract-clauses` list |
| can_issue=false | contract thiếu field | In/PDF disabled · `ctr-workspace-view-issue-blocked-hint` VI |
| Edit mutate | `ceo@xe.vn` | Sửa → Step2 DnD → PUT `print-overlay` (RETAIN) |

**hdsd_align:** `UI-CTR-WORKSPACE.md` · testids `ctr-workspace-view-*`

## must_keep

- G3 workspace shell · no inline `body_vi` editor
- `contracts_printable_ready=false`
- U65 — no seed

## Residual

- View «Xem trước» still optional POST preview (ephemeral) — canvas bind does not require it
- Full printable module UAT HOLD (honesty)

## completion_report

View mode Step2 GET `clause_layout` bind delivered; `can_issue`/`preview_summary` gate In/PDF with VI hints; create/edit overlay PUT unchanged; vitest PASS.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01
role: qa
read_first:
- docs/qa/evidence/po-hrm-ctr-workspace-fe-layout-bind-01.md
- docs/qa/evidence/po-hrm-ctr-workspace-be-layout-01.md
- docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md §4
entry_criteria: dev-fe READY_FOR_QA FE-LAYOUT-BIND-01; L0 stack; browser-only U65
exit_criteria: WS-G4-09..11 if G4 Phase B scope — view Step2 one GET; clause_layout canvas; can_issue=false disables In/PDF + VI hint; F5; PASS_TO_PM
persona: ceo@xe.vn / Xevn@2026
hdsd_align: UI-CTR-WORKSPACE.md
cấm: seed; probe-only PASS; registry-only view PASS
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-qa-ws-g4-layout-01.md
```
