# FE evidence — CTR create DnD parent portal (FE-04-DND-PARENT-02)

| Meta | Value |
|------|--------|
| **work_item_id** | `D-PO-HRM-CTR-CREATE-REDESIGN-FE-04-DND-PARENT-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

## Root cause (DEF-CTR-DND-PARENT-P2)

QA `CTRPICKQA1-MSMSODO2`: **0** DnD console storms (parent `querySelector` patch OK) but `canvasAfter=0` / `goVisible=false` because step 2 showed a **second loading gate** (`dndReady` double-rAF) **without** `ctr-create-clause-palette` / `.cursor-grab` / «Thêm» while `ctr-create-step-2` was already visible. Playwright called `dragPaletteToCanvas` immediately after step 2 open → no interactable palette rows.

## Fix summary

| Area | Change |
|------|--------|
| **DnD mount** | Remove `dndReady` defer — mount `HrmDragDropContext` as soon as clause library loads |
| **QA hook** | `data-testid="ctr-create-clause-dnd-ready"` when palette/canvas DnD tree is live |
| **Canvas ids** | Prune orphan/duplicate `canvasIds` vs catalog; dedupe `canvasClauses` render keys |
| **React keys** | `missingClauseItems` list keys include index (DEF-CTR-CLAUSE-KEY-WARN) |
| **Patch** | `shouldInstallParentPortalQueryPatch()` uses `isHrmPortalEmbedFrame()` + portal mode (unchanged behavior, explicit guard) |

## spec_read_ack

- **srs:** `PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` · AC-CTR-DND-01/02 · SUBJECT-02 must_keep
- **tech_spec:** `PO-HRM-CTR-CREATE-REDESIGN-SA-02.md` §3.2 Path A (parent portal)
- **prior QA:** `docs/qa/evidence/po-hrm-ctr-picker-inline-portal-qa-01.md` (SUBJECT-02 PASS)

## Tests

```text
pnpm exec vitest run src/lib/hrmPangeaParentPortalQueryPatch.test.ts src/lib/contractCreateWizard.source.test.ts src/lib/jdDndSameNodeProps.test.ts
exit 0 (16 tests)
```

## QA entry (U65)

| Field | Value |
|-------|--------|
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **Persona** | `ceo@xe.vn` · `companyId=main` |
| **J-*** | J-HRM-CTR-CREATE-02 · regression SUBJECT-02 inline picker |
| **AC** | AC-CTR-DND-01 · AC-CTR-DND-02 |
| **Wait** | After step 2: optional `ctr-create-clause-dnd-ready` OR palette `.cursor-grab` / «Thêm» |

**PASS when:** Palette drag or «Thêm» → canvas `.cursor-grab` ≥ 1; «Gỡ» visible; no `Unable to find drag handle` storms; inline UV picker unchanged.

## Files touched

- `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`
- `apps/web/hrm/src/lib/hrmPangeaParentPortalQueryPatch.ts`
- `apps/web/hrm/src/lib/hrmPangeaParentPortalQueryPatch.test.ts`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
