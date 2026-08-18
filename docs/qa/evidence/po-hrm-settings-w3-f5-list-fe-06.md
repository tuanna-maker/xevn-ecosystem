# PO-HRM-SETTINGS-W3-F5-LIST-FE-06 — F5 bootstrap q + parent ?focus=

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-06` |
| **prior_qa** | `SETW3RT7-MSN8NK8M` · `po-hrm-settings-w3-browser-01-retry-07.md` |
| **prior_dev** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-05` |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause (FE-06)

- QA: POST 200 + pre-F5 `settings-catalog-row-*` **4/4**; parent `page.reload()` + `goto ?tab=` → **F5 0/4**; GET still contains slug.
- FE-05 applied focus in `useLayoutEffect` (`setQ` + `setPage`) **after** first list paint with `q=''`.
- `useSettingsCatalogQueryPageSync` then reset `page` to **1** on the `q` change from `''` → focus slug, racing the focus page jump on paginated lists.
- Parent CC URL after reload had `?tab=` only — `focus` lived in iframe router until iframe remount stripped it; localStorage held slug but search state did not hydrate synchronously.

## Fix

| Change | Detail |
|--------|--------|
| `resolveSettingsCatalogInitialSearchQuery` | Sync read: `localStorage` `hrm-settings-catalog-focus:v1:{tab}` → iframe `?focus=` → parent `?focus=` |
| W3 catalog panels | `useState(() => bootstrapFocusQuery)` + `useSettingsCatalogQueryPageSync(..., { bootstrapFocusQuery })` |
| `useSettingsCatalogQueryPageSync` | Skip `setPage(1)` when `q` equals bootstrap focus slug |
| `syncSettingsCatalogFocusToPortalParent` | On mutate: parent `/command-center/hrm/settings?tab=&focus=` for CC F5 |
| `Settings.tsx` | Merge parent/store focus into iframe `?focus=`; preserve `focus` when switching tab within same session |

## Repro (matches QA runner)

```text
1. goto {PORTAL}/command-center/hrm/settings?tab=att-attendance-codes
2. Thêm → Lưu slug (lowercase)
3. expect settings-catalog-row-{slug} visible
4. page.reload({ waitUntil: 'networkidle' })
5. goto same ?tab= (runner: po-hrm-settings-w3-browser-retry-02.mjs mutateCatalog)
6. expect localStorage hrm-settings-catalog-focus:v1:att-attendance-codes === slug
7. expect parent URL includes focus={slug} after Lưu (replaceState)
8. expect search prefilled + settings-catalog-row-{slug} visible in iframe
```

## Files

- `apps/web/hrm/src/lib/settingsCatalogPagination.ts`
- `apps/web/hrm/src/lib/hrmPortalUrlSync.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogFocusPage.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogQueryPageSync.ts`
- `apps/web/hrm/src/pages/Settings.tsx`
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx`
- `apps/web/hrm/src/lib/settingsCatalogPagination.test.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogQueryPageSync.test.ts`
- `apps/web/hrm/src/components/settings/SettingsCatalogF5ListPanels.test.ts`

## Verify (agent)

```bash
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/hooks/useSettingsCatalogQueryPageSync.test.ts src/components/settings/SettingsCatalogF5ListPanels.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 25 tests PASS (2026-08-10)

## completion_report

- **Closed:** Sync F5 search bootstrap; query/page race guard; parent `?focus=` sync; Settings focus merge; vitest PASS.
- **Open:** Browser re-run F5 4/4 on live `:5173` stack.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-06.md; hard refresh dev:web :5173; L0 qc:fe-be-health exit 0
exit_criteria: node scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + pre-F5 + parent F5 settings-catalog-row-{slug} 4/4; DevTools: localStorage hrm-settings-catalog-focus:v1:* + parent ?focus= after Lưu
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-08.md
cấm: seed
```
