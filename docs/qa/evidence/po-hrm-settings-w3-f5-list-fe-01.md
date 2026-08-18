# PO-HRM-SETTINGS-W3-F5-LIST-FE-01 — Catalog list row visible after F5

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-01` |
| **prior_qa** | `SETW3RT2-MSMYZN13` · `docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-02.md` |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause

POST/PUT 2xx persisted rows and `loadRows()` after Lưu showed them pre-F5, but **client pagination reset to page 1** on remount. Large catalogs (10+ rows/page) kept new slugs off the first page, so Playwright `data-testid*="${slug}"` / `tr:has-text` failed after reload — not a missing GET row (U65).

## Fix

1. **Stable sort** on every GET: `sortSettingsCatalogByOrderThenKey` (sortOrder → key) so page index matches between post-mutate and F5.
2. **sessionStorage focus** per settings tab id: on Lưu, `rememberFocusForReload(slug)`; on next mount after GET, `consumeSettingsCatalogFocusPage` → `setPage` so the saved row is in the rendered slice (DOM testids).
3. Hook `useSettingsCatalogFocusPage` — skips consume on the same mount cycle as mutate (ref guard).

## Files

- `apps/web/hrm/src/lib/settingsCatalogPagination.ts` (+ `settingsCatalogPagination.test.ts`)
- `apps/web/hrm/src/hooks/useSettingsCatalogFocusPage.ts`
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts` (gate strings)

## Verify (agent)

```text
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 11 tests PASS
```

## QA retest (U65)

Persona `ceo@xe.vn` · `pnpm run qc:fe-be-health` exit 0 · runner:

`node scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs`

Tabs: `att-attendance-codes`, `emp-document-types`, `emp-employment-types`, `rec-pipeline-stages` — Thêm → Lưu → POST/PUT 2xx → row pre-F5 → **F5 + navigate same tab** → lowercase slug visible in table.

## completion_report

- **Closed:** F5/list visibility for 4 W3 catalog tabs via GET + pagination focus (not optimistic-only).
- **Open:** None in scope; `contract-templates` canvas unchanged (already PASS).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-01.md; L0 qc:fe-be-health exit 0; portal :5173
exit_criteria: Re-run scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + row pre-F5 + F5 lowercase slug visible; contract-templates ctr-tpl-canvas PASS; evidence new stamp in po-hrm-settings-w3-browser-01-retry-02.md or -03.md
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-02.md
cấm: seed
```
