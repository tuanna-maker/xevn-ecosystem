# FE evidence — CTR create DnD parent portal (FE-04)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-FE-04-DND-PARENT` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

## Root cause (DEF-CTR-DND-PARENT-P0)

`@hello-pangea/dnd` `findDragHandle` queries the **iframe** `document`, while create wizard step 2 renders drag handles in the **parent-portaled** `DialogContent` (SA-02 Option A). Validation logged `Unable to find drag handle` (13×) and blocked palette→canvas on `command-center/hrm/contracts`.

## Fix summary

| Area | Change |
|------|--------|
| **DnD** | `installHrmPangeaParentPortalQueryPatch()` at HRM boot + `HrmDragDropContext` wrapper; iframe `document.querySelector(All)` falls back to `parent.document` for `data-rfd-*` selectors |
| **Palette** | Dedupe clause ids on template seed + palette list (duplicate React keys) |
| **UV picker** | `searchPlacement="inline"` on candidate picker; hide UUID on trigger/list when no business `code` |
| **C&B card** | `ctr-create-cb-card` always visible on step 1 (empty snapshot OK) |

## spec_read_ack

- **srs:** `PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` · AC-CTR-DND-01/02 · AC-CTR-SUBJECT-01 · AC-CTR-FIELD-04
- **tech_spec:** `PO-HRM-CTR-CREATE-REDESIGN-SA-02.md` §3.2 Path A (parent portal retained)
- **prior QA:** `docs/qa/evidence/po-hrm-ctr-create-redesign-qa-03.md`

## Tests

```text
pnpm exec vitest run src/lib/hrmPangeaParentPortalQueryPatch.test.ts src/lib/contractCreateWizard.source.test.ts src/lib/jdDndSameNodeProps.test.ts
exit 0 (15 tests)
```

## QA entry (U65)

| Field | Value |
|-------|--------|
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **Persona** | `ceo@xe.vn` · `companyId=main` |
| **J-*** | J-HRM-CTR-CREATE-02 (DnD + Gỡ) · J-HRM-CTR-CREATE-01 regression |
| **AC** | AC-CTR-DND-01 · DND-02 · SUBJECT-01 · FIELD-04 |

**PASS when:** Step 2 palette drag or «Thêm» increases canvas `.cursor-grab` count; «Gỡ» visible; **no** console `Unable to find drag handle`; UV trigger label without raw UUID; `ctr-create-cb-card` visible on step 1.

## Files touched

- `apps/web/hrm/src/lib/hrmPangeaParentPortalQueryPatch.ts` (+ test)
- `apps/web/hrm/src/components/contracts/HrmDragDropContext.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/components/contracts/ContractCbReadOnlyCard.tsx`
- `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx`
- `apps/web/hrm/src/main.tsx`
- `apps/web/hrm/src/lib/jdDndSameNodeProps.test.ts`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
