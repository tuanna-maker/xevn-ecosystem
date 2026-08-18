# PO-HRM-SETTINGS-W3-F5-LIST-FE-02 — F5 list focus (retry after SETW3RT3)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-02` |
| **prior_qa** | `SETW3RT3-MSN1JWGH` · `docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-03.md` |
| **prior_dev** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-01` |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause (FE-02)

1. **Consume-before-match cleared sessionStorage** when GET list was not ready or row index failed — remount (React Strict Mode / iframe reload) could not re-apply focus.
2. **Storage key** did not normalize `catalogTabId` case (defensive for CC embed / QA tab strings).
3. **Focus applied in `useEffect`** could lose to `setPage(1)` on search `q` in the same tick; moved apply to **`useLayoutEffect`** after GET success.
4. **No `?focus=` fallback** when pagination alone did not surface the slug in the DOM.

## Fix

| Change | Detail |
|--------|--------|
| `readSettingsCatalogFocus` / `clearSettingsCatalogFocus` | Peek without clear; clear only after successful page jump |
| `consumeSettingsCatalogFocusPage` | Clear storage only when row found in rows |
| `settingsCatalogFocusStorageKey` | Lowercase tab id segment |
| `useSettingsCatalogFocusPage` | After `!loading && items.length`, resolve slug from storage then `?focus=`; `setPage` + clear storage; URL fallback → `setSearchQuery(focus)` + page 1; `rememberFocusForReload` writes storage + `focus` query (replace) |
| Panels (4) | Pass `setQ` into hook |

## Files

- `apps/web/hrm/src/lib/settingsCatalogPagination.ts`
- `apps/web/hrm/src/lib/settingsCatalogPagination.test.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogFocusPage.ts`
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx`

## Verify (agent)

```text
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 13 tests PASS
```

## Manual F5 repro (U65 — sponsor / QA)

Persona: `ceo@xe.vn` / `Xevn@2026` · company `main` · portal `http://127.0.0.1:5173`

1. `pnpm run qc:fe-be-health` (exit 0).
2. Open `http://127.0.0.1:5173/command-center/hrm/settings?tab=att-attendance-codes`.
3. **Thêm mã chấm công** → nhập slug lowercase (vd. `f5test01att`) + nhãn → **Lưu** → Network POST/PUT 2xx.
4. **Pre-F5:** row visible — `data-testid` contains slug or `tr` shows slug text.
5. **F5** (full reload) → same URL `?tab=att-attendance-codes` (optional: `&focus=f5test01att` after Lưu).
6. **Post-F5:** slug still visible in table (pagination may be > page 1; row must be in DOM).
7. Repeat steps 2–6 for tabs: `emp-document-types`, `emp-employment-types`, `rec-pipeline-stages`.

**DevTools check (optional):** After Lưu, iframe `sessionStorage` key `hrm-settings-catalog-focus:v1:att-attendance-codes` = lowercase slug until focus applies post-GET.

## completion_report

- **Closed:** F5 focus persistence + URL/search fallback + strict consume semantics for 4 W3 catalog tabs.
- **Open:** None in scope; QA browser re-run `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-02.md; L0 qc:fe-be-health exit 0; portal :5173; commit includes FE-02
exit_criteria: Re-run scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + row pre-F5 + F5 lowercase slug visible; contract-templates ctr-tpl-canvas PASS; evidence stamp in po-hrm-settings-w3-browser-01-retry-03.md or -04.md
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-03.md
cấm: seed
```
