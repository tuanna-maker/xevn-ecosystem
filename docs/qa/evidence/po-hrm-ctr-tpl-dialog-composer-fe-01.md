# PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01

**work_item_id:** `PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01`  
**spec:** `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` §6 PAT-CTR-TEMPLATE-COMPOSER-01  
**file:** `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx`

## Change summary

| AS-IS | TO-BE |
|-------|-------|
| `view=templates`: Dialog «Sửa mẫu HĐ» = hint + Đóng; composer Card below list | Full composer (fields + `ctr-tpl-palette` + `ctr-tpl-canvas` + Lưu mẫu) inside `DialogContent` when `templatesDedicated && tplDialogOpen` |
| Condition `(!templatesDedicated \|\| tplDialogOpen)` rendered Card under list while dialog open | Dedicated view: list shell only; composer only in modal |

**Implementation:** `renderTemplateComposerInner(inDialog)` shared by tab Card (`false`) and templates dialog (`true`). Dialog selects use `SettingsDialogSelectContent` (parent portal); tab view keeps `portalScope="iframe"`. Matrix filter in composer hidden on dedicated view (filter remains in list shell `filterSlot`).

## must_keep verified (static)

- `sameNodeDragBind` + `DragDropContext` / `ctr-palette` / `ctr-canvas` retained
- `data-testid`: `settings-contract-templates-dialog`, `ctr-tpl-*` unchanged
- `CONTRACTS_PRINTABLE_READY` / honesty flags not touched
- W3 `SettingsCatalogScreenShell` list unchanged

## Build / test

```text
cd apps/web/hrm
pnpm build   # exit 0
pnpm test src/lib/poHrmMvpGd1Core09dClusterFe01.source.test.ts \
          src/lib/poHrmMvpGd1Core09dClusterFe02.source.test.ts \
          src/lib/poHrmMvpGd1Core09aClusterFe01.source.test.ts
# 11 passed
```

## QA click path (browser — U65 FE-only)

1. Login `ceo@xe.vn` / portal HRM embed
2. **Cấu hình HRM** → menu **Mẫu hợp đồng** (dedicated `view=contract-templates` / `settings-contract-templates`)
3. Row **Sửa** (`ctr-tpl-open-{code}`)
4. **PASS:** Modal `settings-contract-templates-dialog` shows form fields, `ctr-tpl-palette`, `ctr-tpl-canvas`, **Lưu mẫu** — **no** composer Card visible below table
5. **FAIL:** Hint-only dialog or canvas outside modal

## ack_status

`READY_FOR_QA`
