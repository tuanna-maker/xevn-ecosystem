# PO-HRM-SETTINGS-W3-CAT-C-FE-01 — Settings catalog shell (merge / pay-sheet / contract templates)

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-SETTINGS-W3-CAT-C-FE-01 |
| **role** | dev-fe |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-08-10 |
| **U65** | Zero seed · mutate + F5 from FE |

## Scope closed

| Panel | Pattern | Notes |
|-------|---------|--------|
| `MergeTokenSettingsPanel` | `SettingsCatalogScreenShell` compact + search + pagination + dialog upsert | `SettingsDialogSelectContent` in dialog; resolve-preview retained below list |
| `PaySheetTemplateSettingsPanel` | Same shell + dialog (header + lines editor) | No DnD formula (must_keep) |
| `ContractLegalPrintSettingsPanel` `view=templates` | List shell + pagination; composer + DnD when dialog open | `clauses` view untouched; full tab keeps inline composer + list |

## Build

```text
cd apps/web/hrm && pnpm run build
exit 0 (2026-08-10)
```

## QA handoff (browser)

- URL: `http://localhost:5173/command-center/hrm/settings?tab=merge-tokens` | `pay-sheet-tpl` | `contract-templates`
- Account: `ceo@xe.vn` / `Xevn@2026`
- Per tab: Thêm → Lưu → Network 2xx → F5 row visible; dialog Select opens (`SettingsDialogSelectContent`)
- Contract templates: Thêm mẫu → dialog → DnD canvas (`ctr-tpl-canvas`) same-node handle retained

## Residual

- Contract `templates` dedicated: composer renders below list while dialog open (DnD intact); future slice may portal full composer into dialog body only.
