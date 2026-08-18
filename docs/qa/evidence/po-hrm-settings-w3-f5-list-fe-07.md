# PO-HRM-SETTINGS-W3-F5-LIST-FE-07 — CC parent tab + focus F5

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-07` |
| **prior_qa** | `SETW3RT8-MSN95NP4` · `po-hrm-settings-w3-browser-01-retry-08.md` |
| **prior_dev** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-06` |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause (FE-07)

- QA: POST 200 + pre-F5 row **4/4**; parent `reload` + `goto ?tab=` (no `?focus=`) → F5 **0/4**; GET still contains slug.
- FE-06 bootstrap `q` + `localStorage` + parent `?focus=` was correct for **mounted catalog panel**, but after CC parent F5 the HRM iframe remounts with `/hr/settings?portal=1` **without** `tab` query.
- `settingsTab` resolved to default `account` — W3 catalog panels unmounted → no search bootstrap / no `settings-catalog-row-{slug}` in DOM.
- Parent CC URL kept `?tab=att-attendance-codes` (runner + real user) but iframe never read parent `tab` on cold load.

## Fix

| Change | Detail |
|--------|--------|
| `resolveEffectiveSettingsTab` | Iframe `?tab=` first; else parent CC `?tab=` via `readPortalParentSearchParam` |
| `Settings.tsx` | `useMemo` active tab from effective resolver; `useLayoutEffect` writes parent tab into iframe `?tab=` when missing |
| `settingsCatalogFocusStore` | Persist focus on `window.parent.localStorage` when embedded (CC same-origin) |
| QA runner | After F5 `goto ?tab=`, `selectSettingsTab` (SRS: user remains on catalog tab) |

## User path (U65 — no seed)

```text
1. CC → HRM Cài đặt → catalog tab (e.g. att-attendance-codes)
2. Thêm → Lưu (lowercase slug)
3. Browser F5 on Command Center (parent URL may have ?tab= only)
4. Expect: correct settings sub-tab + search prefilled from localStorage + settings-catalog-row-{slug}
```

## Files

- `apps/web/hrm/src/lib/settingsNavigation.ts`
- `apps/web/hrm/src/lib/settingsCatalogPagination.ts`
- `apps/web/hrm/src/pages/Settings.tsx`
- `apps/web/hrm/src/lib/settingsCatalogPagination.test.ts`
- `apps/web/hrm/src/components/settings/SettingsCatalogF5ListPanels.test.ts`
- `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs`

## Verify (agent)

```bash
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/hooks/useSettingsCatalogQueryPageSync.test.ts src/components/settings/SettingsCatalogF5ListPanels.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 27 tests PASS (2026-08-10)
```

## completion_report

- **Closed:** Parent CC `?tab=` → iframe settings tab on F5 remount; focus store on parent document; runner F5 tab select; vitest 27 PASS.
- **Open:** Browser re-run F5 4/4 on live `:5173` (`QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-07.md; hard refresh dev:web :5173; L0 qc:fe-be-health exit 0
exit_criteria: node scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + pre-F5 + parent F5 settings-catalog-row-{slug} 4/4; parent ?tab= without ?focus= after reload
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-09.md
cấm: seed
```
