# PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01 — Evidence (Dev-FE)

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01 |
| **spec_ref** | `docs/hrm/ui-screens/PAT-DIALOG-FULL-VIEWPORT-CC-01.md` |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-08-10 |

## Thay đổi

| File | Mô tả |
|------|--------|
| `apps/web/hrm/src/lib/hrmDialogFullViewport.ts` | PAT class strings (~90vw×90vh, compact parent) |
| `JdTemplateWriterDialog.tsx` | Bỏ `portalScope="iframe"`; parent ~90vw; scroll body + footer cố định |
| `JdMasterLibrarySettingsPanel.tsx` | Dialog Xem JD — `HRM_DIALOG_FULL_VIEWPORT_SCROLL_CLASS` + `data-hrm-dialog-portal="parent"` |
| `ContractLegalPrintSettingsPanel.tsx` | Template composer full viewport parent; clause dialog compact parent |
| `jdDndSameNodeProps.ts` | CODE-MEMORY — parent portal + sameNode/rAF |
| Source tests | `JdTemplateWriterDialog.source.test.ts`, `ContractLegalPrintSettingsPanel.source.test.ts` |

## Lệnh verify (agent)

```bash
pnpm --filter @xevn/hrm-web exec vitest run src/components/recruitment/JdTemplateWriterDialog.source.test.ts src/components/settings/ContractLegalPrintSettingsPanel.source.test.ts src/lib/contractCreateWizard.source.test.ts
```

## QA browser (bắt buộc — U65 FE-only)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** `http://localhost:5173/command-center/hrm/settings?tab=jd-master-library` (hoặc tab contract-templates tương đương trong Cấu hình HRM)

### UF — Thêm JD template

1. **Thêm JD template** → overlay che header CC; panel ≥ 85% viewport width.
2. Chờ «Đang chuẩn bị bố cục kéo-thả…» biến mất → kéo nhóm palette ↔ canvas (zero `Unable to find drag handle` storm).
3. **Lưu nháp** / **Hủy** — không duplicate shell header.

### UF — Xem JD

1. Hàng list → **Xem** → dialog full viewport parent; scroll nội bộ nếu dài.

### UF — Mẫu HĐ (contract-templates)

1. Tab thư viện mẫu HĐ → **Thêm mẫu HĐ** → full viewport; DnD clause palette; **Đóng** OK.

### Console

- Không `Unable to find drag handle` (@hello-pangea/dnd) trên các bước trên.

## Residual

- Catalog mutate nhỏ (ATT/EMP/REC) vẫn `max-w-lg` nhưng **mặc định parent portal** (không `portalScope` iframe trên Dialog) — full PAT chỉ khi composer/DnD.
- QA retest Recruitment tab JD writer (cùng `JdTemplateWriterDialog`).

## next_owner

`qa`


---

## QA retest — DLGFVP-MSN0STQY

| Field | Value |
|-------|--------|
| **work_item_id** | QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01 |
| **persona** | `ceo@xe.vn` · company `main` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/settings` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **U65** | zero-seed · browser-only |
| **commit** | `dc930c5` |
| **stamp** | `DLGFVP-MSN0STQY` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |

### UF verdicts

| UF | Verdict | Note |
|----|---------|------|
| UF-JD-ADD-FULL-VIEWPORT | PASS | 1296×810 vs 1440×900 |
| UF-JD-VIEW-FULL-VIEWPORT | FAIL | skipped empty |
| UF-CTR-TPL-FULL-VIEWPORT-DND | PASS | parent=true wRatio=0.9 · 1296×810 vs 1440×900 · canvasItems=0 dndStorm=false closed=true |
| UF-NO-DUP-SHELL | PASS | header-ish count after JD close=2 |

### Console / DnD

- pangea/drag-handle storms: **0** 
- pageErrors: 0 · consoleErrors (tracked): 0

### Evidence

- JSON: `docs/qa/evidence/_tmp-po-hrm-ui-dialog-full-viewport-qa-01.json`
- Screens: `docs/qa/evidence/screens/po-hrm-ui-dialog-full-viewport-qa-01/`

### next_owner

`dev-fe`


---

## QA retest — DLGFVP-MSN0X3VU

| Field | Value |
|-------|--------|
| **work_item_id** | QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01 |
| **persona** | `ceo@xe.vn` · company `main` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/settings` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **U65** | zero-seed · browser-only |
| **commit** | `dc930c5` |
| **stamp** | `DLGFVP-MSN0X3VU` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |

### UF verdicts

| UF | Verdict | Note |
|----|---------|------|
| UF-JD-ADD-FULL-VIEWPORT | PASS | add=true parent=true wRatio=0.9 ≥0.85=true · 1296×810 vs 1440×900 · dndReady=true dndMoved=true dndStorm=false pos=true |
| UF-JD-VIEW-FULL-VIEWPORT | FAIL | no Xem after FE Lưu nháp (slug=jdn0x3vu) |
| UF-CTR-TPL-FULL-VIEWPORT-DND | PASS | parent=true wRatio=0.9 · 1296×810 vs 1440×900 · canvasItems=0 dndStorm=false closed=true |
| UF-NO-DUP-SHELL | PASS | header-ish count after JD close=2 |

### Console / DnD

- pangea/drag-handle storms: **0** 
- pageErrors: 0 · consoleErrors (tracked): 0

### Evidence

- JSON: `docs/qa/evidence/_tmp-po-hrm-ui-dialog-full-viewport-qa-01.json`
- Screens: `docs/qa/evidence/screens/po-hrm-ui-dialog-full-viewport-qa-01/`

### next_owner

`dev-fe`


---

## QA retest — DLGFVP-MSN119ON

| Field | Value |
|-------|--------|
| **work_item_id** | QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01 |
| **persona** | `ceo@xe.vn` · company `main` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/settings` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **U65** | zero-seed · browser-only |
| **commit** | `dc930c5` |
| **stamp** | `DLGFVP-MSN119ON` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |

### UF verdicts

| UF | Verdict | Note |
|----|---------|------|
| UF-JD-ADD-FULL-VIEWPORT | PASS | add=true parent=true wRatio=0.9 ≥0.85=true · 1296×810 vs 1440×900 · dndReady=true dndMoved=true dndStorm=false pos=true saveEnabled=true post=201 |
| UF-JD-VIEW-FULL-VIEWPORT | FAIL | no Xem after FE Lưu nháp (slug=jdn119on) |
| UF-CTR-TPL-FULL-VIEWPORT-DND | PASS | parent=true wRatio=0.9 · 1296×810 vs 1440×900 · canvasItems=0 dndStorm=false closed=true |
| UF-NO-DUP-SHELL | PASS | header-ish count after JD close=2 |

### Console / DnD

- pangea/drag-handle storms: **0** 
- pageErrors: 0 · consoleErrors (tracked): 0

### Evidence

- JSON: `docs/qa/evidence/_tmp-po-hrm-ui-dialog-full-viewport-qa-01.json`
- Screens: `docs/qa/evidence/screens/po-hrm-ui-dialog-full-viewport-qa-01/`

### next_owner

`dev-fe`


---

## QA retest — DLGFVP-MSN13PUC

| Field | Value |
|-------|--------|
| **work_item_id** | QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01 |
| **persona** | `ceo@xe.vn` · company `main` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/settings` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **U65** | zero-seed · browser-only |
| **commit** | `dc930c5` |
| **stamp** | `DLGFVP-MSN13PUC` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |

### UF verdicts

| UF | Verdict | Note |
|----|---------|------|
| UF-JD-ADD-FULL-VIEWPORT | PASS | add=true parent=true wRatio=0.9 ≥0.85=true · 1296×810 vs 1440×900 · dndReady=true dndMoved=true dndStorm=false pos=true saveEnabled=true post=201 |
| UF-JD-VIEW-FULL-VIEWPORT | PASS | view parent wRatio=0.9 · 1296×123 |
| UF-CTR-TPL-FULL-VIEWPORT-DND | PASS | parent=true wRatio=0.9 · 1296×810 vs 1440×900 · canvasItems=0 dndStorm=false closed=true |
| UF-NO-DUP-SHELL | PASS | header-ish count after JD close=2 |

### Console / DnD

- pangea/drag-handle storms: **0** 
- pageErrors: 0 · consoleErrors (tracked): 0

### Evidence

- JSON: `docs/qa/evidence/_tmp-po-hrm-ui-dialog-full-viewport-qa-01.json`
- Screens: `docs/qa/evidence/screens/po-hrm-ui-dialog-full-viewport-qa-01/`

### next_owner

`pm`
