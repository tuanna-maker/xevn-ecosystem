# PO-HRM-SETTINGS-W3-F5-LIST-FE-04 — F5 list focus (q/page race)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-04` |
| **prior_qa** | `SETW3RT5-MSN2J1C4` · `docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-05.md` |
| **prior_dev** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-03` (localStorage — GET has slug; F5 still 0/4) |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause (FE-04)

QA: GET list includes slug after parent F5; DOM assert **0/4** on four catalog tabs.

- `useSettingsCatalogFocusPage` `useLayoutEffect` sets `setPage(N)` when slug is in full list.
- Each panel had `useEffect(() => setPage(1), [q])` which **also runs on mount** (`q === ''`).
- React order: layout effect jumps page → **passive effect on mount resets page to 1** → focused row off page 1 → row not in DOM.

localStorage (FE-03) was necessary but not sufficient until mount `setPage(1)` is suppressed.

## Fix

| Change | Detail |
|--------|--------|
| `useSettingsCatalogQueryPageSync` | New hook: reset page when `q` **changes**; skip first effect (mount) |
| 4 catalog panels | Replace inline `useEffect([q])` with `useSettingsCatalogQueryPageSync(q, setPage)` |
| `useSettingsCatalogFocusPage` | Comment cross-ref FE-04; behavior unchanged |

## Files

- `apps/web/hrm/src/hooks/useSettingsCatalogQueryPageSync.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogQueryPageSync.test.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogFocusPage.ts`
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/SettingsCatalogF5ListPanels.test.ts`
- `apps/web/hrm/src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts`

## Verify (agent)

```text
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/hooks/useSettingsCatalogQueryPageSync.test.ts src/components/settings/SettingsCatalogF5ListPanels.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 21 tests PASS (2026-08-10 agent run)
```

## Sponsor / QA — dev server

**Restart or hard-refresh portal after pull** (`pnpm run dev:web` or parent `:5173`) so Vite HMR picks up hook + panel changes. Stale iframe bundle reproduces 0/4 even when GET is correct.

## Manual F5 (U65)

1. `http://127.0.0.1:5173/command-center/hrm/settings?tab=att-attendance-codes`
2. Thêm → Lưu slug lowercase → row visible pre-F5.
3. Parent F5, URL `?tab=` only (no `focus=`).
4. Post-F5: `tr` / `data-testid` contains slug; pagination shows page containing row.
5. Repeat: `emp-document-types`, `emp-employment-types`, `rec-pipeline-stages`.

## completion_report

- **Closed:** Mount race between focus page jump and `setPage(1)` on `[q]`; vitest pagination + query sync + 4-panel source gates.
- **Open:** QA browser re-run `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` (expect F5 4/4 after dev restart).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-04.md; restart dev:web :5173 (HMR not sufficient if iframe cached); L0 qc:fe-be-health exit 0
exit_criteria: scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + pre-F5 + parent F5 lowercase slug 4/4; stamp retry-06 or update retry-05; on fail capture Network GET includes slug + current page in pagination UI
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-06.md
cấm: seed
```
