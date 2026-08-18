# BUILD-GAP-MD-PANEL-01 — MasterDataSettingsPanel restore

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-MD-PANEL-01 |
| role | dev-fe |
| ack_status | READY_FOR_QA |
| spec_ref | UF-HRM-10 · HRM-SETTINGS SCR-TAB-MASTER · `mdBucketRegistry.ts` |
| date | 2026-08-03 |

## Problem (QA)

`apps/web/hrm/src/pages/Settings.tsx` imports `@/components/settings/MasterDataSettingsPanel` but **file absent** → Vite resolve failure on tab «Danh mục nghiệp vụ» (`value=master-data`).

Prior evidence: `docs/qa/evidence/po-eco-tc-hrm-settings-01.md` (BUILD_GAP-MD-PANEL-01).

## Fix

1. Confirmed import in `Settings.tsx` L38 + render L380–381 (`TabsContent value="master-data"`).
2. Restored from git commit `43c479a` (same stash-restore pattern as EmptyState / JobTemplatesTab):
   - `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx`
   - `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.test.ts`
3. `@CODE-MEMORY-CHANGE` APPEND on both files (BUILD-GAP-MD-PANEL-01).
4. **must_keep:** Settings.tsx not rewritten; `mdBucketRegistry` (14 buckets) unchanged; Leave/LV · AUTH/EMP/CAT · catalog sync deps already on disk.

## Wiring check

- Panel imports `MD_BUCKET_META`, `MD_BUCKET_ORDER` from `@/lib/mdBucketRegistry` — registry on disk has 14 buckets (E1-B + E3 insurers/insuranceTypes/kpiLibrary).
- Supporting libs present: `catalogSearchPicker.ts`, `CatalogSearchPicker.tsx`, `hrmSettingsCatalogItem.ts`, `useSettingsCatalogsOverview` (via panel imports).

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run \
  src/components/settings/MasterDataSettingsPanel.test.ts \
  src/lib/catalogSearchPicker.test.ts \
  src/lib/hrmSettingsCatalogItem.test.ts \
  --reporter=dot
# Test Files 3 passed · Tests 36 passed
```

Full `pnpm exec vite build` in `apps/web/hrm` still fails on **unrelated** missing `performanceFormSchema` (Performance.tsx) — pre-existing; **not** introduced by this wave. MD panel module is on disk and passes E1-B source/registry gate tests.

## QA entry (U65)

- Persona: `ceo@xe.vn` / `Xevn@2026`
- URL: `/hr/settings` (or embed Settings route per matrix)
- Click: tab **Danh mục nghiệp vụ** (`master-data`)
- PASS: no Vite overlay; panel mounts (bucket tabs / empty+CTA per catalog); no seed in evidence path
- UF: UF-HRM-10 · TC pack `docs/qa/testcases/hrm-web/HRM-SETTINGS.md` §4.4

## Residual

- None for MD panel file gap.
- Program-wide HRM vite build: Performance.tsx missing `performanceFormSchema` — separate work item if QA hits Performance route.
