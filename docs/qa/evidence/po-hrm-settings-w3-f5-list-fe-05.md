# PO-HRM-SETTINGS-W3-F5-LIST-FE-05 — F5 row discoverable (setQ + testid)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-05` |
| **prior_qa** | `SETW3RT6-MSN2VJGX` · F5 0/4 after FE-04 + dev restart |
| **prior_dev** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-04` |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause (FE-05)

- GET after parent F5 includes slug; Playwright `rowVisibleAny` still **0/4**.
- FE-04 fixed mount `setPage(1)` race; residual:
  1. Focus hook only jumped **page** on full list — row could stay off DOM when client page + filter state diverged after iframe remount.
  2. **Eager `clearSettingsCatalogFocus` + URL `focus` delete** on apply → React Strict Mode / double mount could lose focus before second paint (storage empty, row on wrong page).
  3. Row testids were panel-specific; QA substring match worked but **no stable `settings-catalog-row-{slug}`**.

## Fix

| Change | Detail |
|--------|--------|
| `useSettingsCatalogFocusPage` | On GET complete: read localStorage/`focus` → **`setQ(normalizedSlug)`** + **`setPage(settingsCatalogFocusPageAfterSearch(...))`**; **do not clear** storage/URL on apply |
| `rememberFocusForReload` | `pendingFocusFromStorageRef = true` after mutate (re-read on next load) |
| `settingsCatalogPagination` | `settingsCatalogRowTestId`, `settingsCatalogFocusPageAfterSearch` |
| 4 W3 catalog panels | `data-testid={settingsCatalogRowTestId(key)}` |
| QA runner | `getByTestId('settings-catalog-row-{slug}')` first; parent F5 `networkidle` |

## Files

- `apps/web/hrm/src/hooks/useSettingsCatalogFocusPage.ts`
- `apps/web/hrm/src/lib/settingsCatalogPagination.ts`
- `apps/web/hrm/src/lib/settingsCatalogPagination.test.ts`
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/SettingsCatalogF5ListPanels.test.ts`
- `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs`

## Verify (agent)

```text
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/hooks/useSettingsCatalogQueryPageSync.test.ts src/components/settings/SettingsCatalogF5ListPanels.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 23 tests PASS (2026-08-10)
```

## Manual / QA (U65)

1. Hard refresh portal `:5173` after pull.
2. `command-center/hrm/settings?tab=att-attendance-codes` → Thêm → Lưu lowercase slug.
3. Parent F5 → DevTools Application → `localStorage` key `hrm-settings-catalog-focus:v1:att-attendance-codes` may still hold slug until next mutate.
4. Post-F5: search box prefilled with slug; `[data-testid="settings-catalog-row-{slug}"]` visible in iframe.
5. Repeat 4 catalog tabs in `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs`.

## completion_report

- **Closed:** Post-F5 focus applies search + page; stable row testid; QA selector + networkidle; vitest 23 PASS.
- **Open:** Browser re-run 4/4 F5 on live stack.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-05.md; hard refresh dev:web :5173; L0 qc:fe-be-health exit 0
exit_criteria: node scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + pre-F5 + parent F5 slug via settings-catalog-row-{slug} 4/4; stamp in retry-06 md/json
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-06.md
cấm: seed
```
