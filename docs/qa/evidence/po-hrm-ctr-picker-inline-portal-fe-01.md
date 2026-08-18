# FE evidence — CTR candidate picker inline parent portal

| Meta | Value |
|------|--------|
| **work_item_id** | `D-PO-HRM-CTR-PICKER-INLINE-PORTAL-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **defect** | `DEF-CTR-PICKER-INLINE-PORTAL-P1` (QA-04 `CTRCREATEQA4-MSMSE16S`) |

## Root cause

`searchPlacement="inline"` chỉ render `CommandInput` trên shell dialog; danh sách UV nằm trong `PopoverContent` (portal). Trên **parent-portal** CC, Playwright (`pickFirstCandidate`) không click được option dù API có UV — chặn AC-CTR-SUBJECT-02 / DND.

## Fix

| Area | Change |
|------|--------|
| **Inline mode** | Bỏ popover cho UV picker inline: combobox + search + `CommandList` cùng cây DOM dưới `data-testid="ctr-create-candidate-picker"` |
| **Harness** | Combobox `data-testid="{picker}-combobox"` · search `{picker}-search` · options `catalog-picker-option-{uuid}` |
| **cmdk** | `cmdkItemValue` = label + value; `cursor-pointer` + `onPointerDown` giữ hành vi chọn |
| **Popover mode** | Không đổi (template/loại HĐ vẫn popover) |

## Tests

```text
pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts src/lib/catalogSearchPicker.test.ts src/lib/poHrmMvpGd1Pay02ClusterFeBrowser01.source.test.ts
exit 0 (47 tests)
```

## QA entry (U65)

| Field | Value |
|-------|--------|
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **Persona** | `ceo@xe.vn` · `companyId=main` |
| **AC** | AC-CTR-SUBJECT-02 · regression SUBJECT-01 |
| **J-*** | J-HRM-CTR-CREATE-01 · J-HRM-CTR-CREATE-02 (sau SUBJECT-02 PASS) |

**PASS when:** Tab Ứng viên → gõ `QA` trong `ctr-create-candidate-picker-search` → list hiện trong picker → click `catalog-picker-option-*` hoặc role `option` → combobox không còn placeholder «Gõ tên…» → **Tiếp** → `POST` candidate draft + step 2.

## Files

- `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx`
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
