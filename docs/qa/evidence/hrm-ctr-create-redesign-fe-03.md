# HRM-CTR-CREATE-REDESIGN-FE-03 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-CTR-CREATE-REDESIGN-FE-03` |
| **role** | dev-fe |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **prior QA** | `HRM-CTR-CREATE-REDESIGN-QA-02` · stamp `CTRCREATEQA02-MSN049ZL` |
| **honesty** | `contracts_printable_ready=false` · C-SLICE · U65 zero-seed |

## Root cause (QA-02)

- `hdsd-contracts-form-ready` gated on prefilled employee + contract_type in catalog + date validation → never attached when BA-02 Q6 (no auto NV) and/or `template_list count=0`.
- Wizard step 1 UI mounted (`ctr-create-step-1`) but QA `waitFormReady` timed out 90s.

## Fix

| Area | Change |
|------|--------|
| `isContractCreateWizardFormReady` | New helper in `contractFormFieldResolver.ts` — create mode **ready when `!catalogsLoading`**; edit always ready |
| `Contracts.tsx` | `isCreateFormReady` uses helper only (submit still validates employee/type/position) |
| `ContractCreateWizardDialog.tsx` | Emit `hdsd-contracts-form-ready` when catalogs ready **and** template list fetch settled (`!templatesLoading`) |
| `ContractCreateStep1GeneralGrid.tsx` | Empty template banner + `ctr-create-template-settings-cta` → `/settings?tab=contract-templates` (embed-safe `hrmPathWithEmbedSearch`) |

## Files

- `apps/web/hrm/src/components/contracts/contractFormFieldResolver.ts`
- `apps/web/hrm/src/components/contracts/contractFormFieldResolver.test.ts`
- `apps/web/hrm/src/pages/Contracts.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/components/contracts/contractFormFieldResolver.test.ts src/lib/contractCreateWizard.source.test.ts --reporter=dot
```

**Result:** 19 tests PASS (2026-08-10).

## QA retest (U65)

- **URL:** `http://127.0.0.1:5173/command-center/hrm/contracts`
- **Persona:** `ceo@xe.vn` / `Xevn@2026`
- **Expect:** Thêm HĐ → `hdsd-contracts-form-ready` within 90s even when `template_list count=0`; banner `ctr-create-no-active-template-banner` + CTA visible; J-07 remains BLOCKED/hold without seed (honest).
- **J-01..06:** Re-run `scripts/qa/_tmp-hrm-ctr-create-redesign-qa-02.mjs` or QA-03 slice — step2 journeys still need live template + UV data from FE (no seed).

## Residual

- Full J-01..06 PASS still depends on sponsor-created template + candidate in env (U65).
- Registry-only path (J-05) should pass form-ready gate after this fix.

## must_keep

- No seed · AC-CTR-XEVN-08 registry-only · `contracts_printable_ready=false`
