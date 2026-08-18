# PO-HRM-UI-BRAND-W3-ATT-B — Attendance sheets/records + shifts CRUD remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-B` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-B · S23–S28, S35–S38 |
| **Prior** | W3-ATT-A-QA PASS · RE-DISPATCH stall after Dialog R1 CLOSED |
| **Coordinate** | `dialog.tsx` FE-FOUND-01-R1 — **not modified**; titles inherit shared ≥20 bold |
| **change_mode** | `UPGRADE` · preserve_default · stub honesty |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface iframe · §10 ops-dense modal |
| **Inventory** | S23 sheets list · S24 add sheet · S25 delete sheet · S26 records tab · S27 edit status · S28 delete record · S35 shifts list · S36 add/edit shift · S37 bulk delete · S38 single delete |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice B |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | Sheet create/delete wires · shift CRUD/bulk delete · records PATCH/delete + date harden · Face honesty · GPS lat/lon (ATT-A) · ATT-03d work-sites (W3-ATT-F — not touched) · dialog R1 · no QR clock (W3-ATT-E) · no Attendance CLOSED · no Nest/seed |

---

## Surfaces remastered (10)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S23 | `Attendance.tsx` `renderAttendanceSheetsList` | Title bold `text-xevn-text`; Add CTA primary; table `rounded-card` / `border-xevn-border`; labels secondary; link cells primary; `data-testid=att-sheets-precision` |
| S24 | Add sheet `Dialog` | Labels `text-xevn-text`; radio accent primary; Save `bg-xevn-primary`; inherits `xevn-dialog-surface` brand bar |
| S25 | Delete sheet `AlertDialog` | Title ≥20 bold `text-xevn-text`; destructive confirm kept |
| S26 | Records tab shell + `AttendanceRecordsTable` | Page title sharp; summary cards ops-dense (no pale gray); table border xevn |
| S27 | Records edit status Dialog | Labels sharp; Save primary (was orange); PATCH wire kept |
| S28 | Records delete `AlertDialog` | Title ≥20 bold; deleteRecord wire kept |
| S35 | `renderShiftsContent` list | Header/filters/table Precision Motion; Add primary; GD2 hold alert secondary (honesty kept) |
| S36 | Shift add/edit Dialog | Labels/helper secondary; sticky footer primary CTA; create/update wire kept |
| S37 | Bulk delete `AlertDialog` | Title ≥20 bold; bulkDeleteShifts wire kept |
| S38 | Single delete `AlertDialog` | Title ≥20 bold; single delete wire kept |

**Also chrome (sheet weekly detail from S23):** weekly grid + cell detail dialog → xevn tokens (not separate inventory id).

**OUT / SKIP this seat:**
- W3-ATT-E QR clock (S13–S14)
- W3-ATT-F work-sites GPS (S74/S75) — not opened
- Settings / leave request modals (W3-ATT-C/D)
- Face LIVE invent / Attendance CLOSED claim

---

## CODE-MEMORY

APPEND `@CODE-MEMORY-CHANGE` `PO-HRM-UI-BRAND-W3-ATT-B` + ADR-20260805 on:

- `apps/web/hrm/src/pages/Attendance.tsx`
- `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx`

**Not touched:** `apps/web/hrm/src/components/ui/dialog.tsx` (R1 settled).

---

## Verify

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| `createSheet` / `deleteSheetDB` | kept |
| `createShift` / `updateShift` / `deleteShiftDB` / `bulkDeleteShifts` | kept |
| `AttendanceRecordsTable` `updateRecord` PATCH + date harden + x-company-id | kept |
| `deleteRecord` | kept |
| Face `featureHold` honesty (ATT-A) | untouched |
| GPS lat/lon + work-sites (ATT-03d) | untouched (W3-ATT-F) |
| QR clock | SKIP (W3-ATT-E) |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. ATT → Bảng chấm công — sharp title + primary Thêm + table secondary cells
2. Thêm bảng Dialog — thin primary bar + Save primary
3. Xóa bảng AlertDialog — title ≥20 bold
4. Bản ghi chấm công — summary cards + table; Edit status Dialog Save primary → PATCH
5. Xóa bản ghi AlertDialog
6. Ca → Danh sách — shifts table + Thêm; add/edit Dialog
7. Bulk delete + single delete confirms

---

## Residual

| Item | Severity | Owner |
|------|----------|-------|
| ATT settings / customize / leave request modals still orange/muted | P1 | **W3-ATT-C/D** |
| QR clock chrome | P1 | **W3-ATT-E** |
| Work-sites GPS remaster | P1 | **W3-ATT-F** |
| Nav tab orange chips on Attendance shell | P2 | later ATT nav batch |
| Browser visual spot | QA | this work_item QA |

---

## Handoff

### completion_report

W3-ATT-B closed: remastered sheets/records + shifts CRUD (S23–S28, S35–S38) to Precision Motion. Shared `dialog.tsx` R1 left alone. Sheet/shift/records mutate wires preserved. ATT-03d work-sites and QR clock not opened. Soft + strict theme-contrast exit 0. No Nest/seed/Attendance CLOSED invent.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-B-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: L0 stack up; U65 zero-seed browser-only; W3-ATT-B READY_FOR_QA
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-b.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md W3-ATT-B
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → HRM→Chấm công→Bảng chấm công — sharp title; Thêm primary #1E40AF; table no pale slate-400 body labels
  3) Thêm bảng Dialog — thin primary bar; DialogTitle ≥20 bold; Lưu primary (wire create kept)
  4) Xóa bảng AlertDialog — title ≥20 bold text-xevn-text
  5) Bản ghi chấm công — summary/table sharp; Sửa trạng thái Dialog Save primary; PATCH path not broken
  6) Xóa bản ghi AlertDialog title sharp
  7) Ca→Danh sách — shifts table sharp; Thêm/Sửa Dialog primary CTA; bulk + single delete confirms title ≥20
  8) must_keep spot: Face honesty still on clock (ATT-A); no work-sites fight; no QR invent
exit_criteria: evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-b-qa.md · PASS_TO_PM or FAIL with surface_id
cấm: seed · Nest probe as UF · claim Attendance CLOSED · remaster program DONE · fail for W3-ATT-C/D/E residual
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-b.md`
