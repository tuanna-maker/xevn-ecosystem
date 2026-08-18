# Evidence — D-PO-HRM-CTR-CREATE-DND-PALETTE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-PO-HRM-CTR-CREATE-DND-PALETTE-01` |
| **qa stamp** | `CTRCREATEQA1-MSMNOPAF` (retest target) |
| **date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |
| **owner** | dev-fe |

## Root cause

`ContractCreateStep2ClausePreview` called `sameNodeDragBind(dragProvided.dragHandleProps)` instead of `sameNodeDragBind(dragProvided)`. The helper expects full `DraggableProvided`; passing handle props alone left `provided.dragHandleProps` undefined → console/page error storm on palette (`isDropDisabled` path mis-attributed in QA).

Secondary: palette and canvas used **two** `DragDropContext` instances — cross-droppable drag palette → canvas could not work even after bind fix.

## Fix

1. **JD writer pattern:** `const bind = sameNodeDragBind(dragProvided)` + `ref={bind.ref}` + `{...bind.props}` on palette and canvas rows.
2. **Single** `DragDropContext` wrapping both `ctr-create-palette` (`isDropDisabled`) and `ctr-create-canvas` inside one `grid` (aligned with `JdTemplateWriterDialog.tsx`).
3. `jdDndSameNodeProps.ts` — JSDoc + `@CODE-MEMORY-CHANGE` clarifying full-`provided` contract.

## Files

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx` | DnD bind + unified context |
| `apps/web/hrm/src/lib/jdDndSameNodeProps.ts` | Doc / memory |
| `apps/web/hrm/src/lib/jdDndSameNodeProps.test.ts` | Source lock Step2 bind + single context |

## Verify (agent)

```text
pnpm exec vitest run src/lib/jdDndSameNodeProps.test.ts src/lib/contractCreateWizard.source.test.ts
→ 8 PASS (exit 0)
```

## QA retest (browser — U65)

| ID | Steps | PASS when |
|----|-------|-----------|
| **J-HRM-CTR-CREATE-02** | Step1 template → Tiếp → Step2 | No `sameNodeDragBind: dragHandleProps missing`; palette grip drags to canvas |
| **O6–O7** | DnD + preview | Drag stable; preview btn exercisable |
| **QA-CTR-REGISTRY-02** | «Chỉ lưu sổ» 2nd dialog | After Step2 stable (was timeout on create btn) |

**Persona:** `ceo@xe.vn` / `companyId=main` · `http://127.0.0.1:5173/hr/contracts` (or `:8080` embed per env).

## Residual

| ID | Owner | Note |
|----|-------|------|
| QA-CTR-REGISTRY-02 | qa | Retest O8 after this handoff |
| QA-CTR-L25-06 | qa | J-HRM-CTR-CREATE-06 after stable create |
| J-HRM-CTR-CREATE-03 | qa | Probation template HOLD — catalog gap, not FE |

## Honesty

> **contracts_printable_ready=false** · C-SLICE · cấm claim CTR module UAT from DnD fix alone

**ack_status:** **READY_FOR_QA**
