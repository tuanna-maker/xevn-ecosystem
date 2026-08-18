# PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT — ATT remaining dialog chrome

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · W4 dialog extend (not remaster DONE) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCKED** (Montserrat + Source Sans 3 · S3=A · B4 cấm AI) |
| **Foundation** | `PO-HRM-UI-BRAND-FE-DIALOG-01` CLOSED (QA PASS) — shared Dialog/AlertDialog glass + 4px `#1E40AF` + wordmark |
| **ack_status** | **READY_FOR_QA** |
| **stall** | **#2 CLOSE** — prior seat evidence stall#1 incomplete vs Attendance.tsx/clock shells; this seat **WRITE** evidence after wire + gate |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR §16 | Fonts Display=Montserrat · Body=Source Sans 3 · S3=A chrome+honesty · B4 no AI purple/cream/glow |
| ADR §15.4 / §10 | Modal: 4px primary brand bar · glass header · title ≥20 bold · wordmark |
| FE-DIALOG-01 | Shared `dialog.tsx` / `alert-dialog.tsx` already ship chrome — consumers wire width + fields + testids |
| ui-neo | `.xevn-field-*` widths · leave/OT neo pattern |
| change_mode | ADD (extend consumers; no shell rewrite) |
| code_memory_mode | APPEND |
| must_keep | Leave/OT create wires · records edit PATCH + legacy delete/sheet/shift/gps/clock testids · Face HOLD · U65 zero-seed · no Nest invent |
| forbidden | seed · Face LIVE · Attendance CLOSED · remaster DONE claim |

---

## 1. Scope closed

### A — Request tabs + export/import (stall#1 kept)

| # | Surface | Result |
|---|---------|--------|
| 1 | Late/early add/detail/delete | **PASS** — `att-late-early-*-dialog-precision` · `sm:max-w-[920px]` add · compact select/date/time/reason |
| 2 | Trip add/detail/delete | **PASS** — `att-trip-*-dialog-precision` · wide add + compact fields |
| 3 | Shift-change add/detail/delete | **PASS** — `att-shift-change-*-dialog-precision` · compact date/select/name/reason |
| 4 | Update add/detail/delete | **PASS** — `att-update-*-dialog-precision` · compact HH:mm fields |
| 5 | OT detail/delete | **PASS** — `att-ot-*-dialog-precision` (create already FE-DIALOG-01) |
| 6 | Leave detail/reject/delete | **PASS** — `att-leave-*-dialog-precision` (create already FE-DIALOG-01) |
| 7 | Export | **PASS** — `att-export-dialog-precision` · year/month `xevn-field-select-sm` |
| 8 | Import (ATT settings S65) | **PASS** — `att-import-dialog-precision` |
| 9 | Records edit/delete | **PASS** — edit `attendance-record-edit-dialog-precision` title ≥20 + compact; delete legacy `attendance-record-delete-dialog` kept |

### B — Attendance.tsx shells + clock confirms (stall#2 this seat)

| # | Surface | Result |
|---|---------|--------|
| 10 | Weekly cell | **PASS** — `att-weekly-cell-dialog-precision` · stub honesty Alert · compact time fields |
| 11 | GPS sites add/edit | **PASS** — legacy `att-gps-add-dialog` / `att-gps-edit-dialog` + compact name/line/num · title ≥20 |
| 12 | Shift form | **PASS** — legacy `att-shift-form-dialog` · title ≥20 · compact code/name/select/time/num |
| 13 | Add sheet | **PASS** — legacy `att-add-sheet-dialog` · title ≥20 · compact select/line |
| 14 | Page leave create/detail (residual shells) | **PASS** — `att-page-leave-create-dialog-precision` / `att-page-leave-detail-dialog-precision` · compact fields (LIVE create remains LeaveTab) |
| 15 | Page attendance edit (legacy shell) | **PASS** — `att-page-attendance-edit-dialog-precision` · compact name/date/time |
| 16 | Manual clock confirm | **PASS** — legacy `clock-in-manual-confirm-dialog` · title ≥20 · compact select/line/reason |
| 17 | GPS clock confirm | **PASS** — legacy `clock-in-gps-confirm-dialog` · title ≥20 · pale ban · primary check-in CTA · compact select/reason |
| 18 | Face confirm/delete | **PASS (HOLD)** — shared Alert/Dialog chrome · `att-faceid-confirm-dialog` / `att-face-delete-dialog` · featureHold honesty — **not** LIVE |
| 19 | `pnpm run verify:xevn:theme-contrast -- --strict` | **PASS** — exit **0** · pale hits=0 · token lockstep primary `#1E40AF` |
| 20 | Evidence + bus | **PASS** — this file WRITE (stall#2) · bus `READY_FOR_QA` |

**Cấm honored:** no seed · Face not LIVE · Attendance not CLOSED · no remaster DONE · no Nest/API/SRS rewrite.

---

## 2. Files touched (stall#2 this seat)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/attendance/CheckInOutWidget.tsx` | W4 CODE-MEMORY · confirm title ≥20 + compact select/line/reason |
| `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` | W4 CODE-MEMORY · confirm chrome + pale ban + primary CTA + compact fields |
| `apps/web/hrm/src/pages/Attendance.tsx` | W4 stall#2 CODE-MEMORY · shift/sheet/page-leave/page-edit compact + title ≥20 |

**Confirmed still wired (stall#1 / prior):** LateEarly · Trip · ShiftChange · Update · OT · LeaveTab · Export · Import · RecordsTable · weekly cell + GPS sites.

Shared shell **not** re-touched (already FE-DIALOG-01): `dialog.tsx` · `alert-dialog.tsx` · fonts/index.css.

---

## 3. testid inventory (QA click targets)

| Modal | data-testid |
|-------|-------------|
| Late/early / trip / shift-change / update / OT / leave request | `att-*-dialog-precision` (see stall#1 table) |
| Export | `att-export-dialog-precision` |
| Import (settings) | `att-import-dialog-precision` |
| Records edit | `attendance-record-edit-dialog-precision` |
| Records delete (legacy) | `attendance-record-delete-dialog` |
| Weekly cell | `att-weekly-cell-dialog-precision` |
| GPS sites (legacy) | `att-gps-add-dialog` · `att-gps-edit-dialog` |
| Shift form (legacy) | `att-shift-form-dialog` |
| Add sheet (legacy) | `att-add-sheet-dialog` |
| Page leave create/detail | `att-page-leave-create-dialog-precision` · `att-page-leave-detail-dialog-precision` |
| Page attendance edit | `att-page-attendance-edit-dialog-precision` |
| Manual clock confirm (legacy) | `clock-in-manual-confirm-dialog` |
| GPS clock confirm (legacy) | `clock-in-gps-confirm-dialog` |
| Face (HOLD) | `att-faceid-confirm-dialog` · `att-face-delete-dialog` |
| Wordmark (shared) | `xevn-dialog-wordmark` |

---

## 4. Verify log (reproducible)

```text
> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## 5. QA browser checklist (U65 · zero-seed)

| Check | Persona / path | Expect |
|-------|----------------|--------|
| Q1 late/early | `ceo@xe.vn` → ATT → Đi muộn/Về sớm → Thêm | 4px `#1E40AF` · logo · glass · title ≥20 · compact |
| Q2 shift form | ATT → Ca làm → Thêm/Sửa | `att-shift-form-dialog` · title ≥20 · compact code/time |
| Q3 add sheet | ATT → Bảng công → Thêm bảng | `att-add-sheet-dialog` · compact selects |
| Q4 manual confirm | ATT → Clock-in Thủ công → confirm | title ≥20 · compact select/reason · primary CTA |
| Q5 GPS confirm | ATT → Clock-in GPS → confirm | title ≥20 · no muted/orange chrome · primary check-in |
| Q6 weekly cell | ATT → Tuần → click cell | stub honesty Alert · not LIVE API |
| Face | ATT Face | HOLD / featureHold — **not** LIVE |
| F5 | After open dialog | Chrome persists |

**Mutates:** optional smoke only; U65 — do not seed inbox/data.

---

## 6. Residual / not claimed

| Item | Status |
|------|--------|
| Full ATT 90 remaster DONE | **OUT** |
| Face LIVE | **OUT** — HOLD |
| Attendance CLOSED | **OUT** |
| Browser screenshot this seat | **QA** |
| Nest / API / seed | **OUT** |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
next_owner: qa
next_dispatch_prompt: |
  Task qa PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA — browser U65 zero-seed ceo@xe.vn;
  spot late/early add + shift form att-shift-form-dialog + add-sheet + manual/GPS clock confirms —
  assert 4px #1E40AF + logo + glass + title>=20 + compact fields; Face HOLD; weekly cell stub honesty;
  theme-contrast --strict already exit 0 on FE seat;
  evidence docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext-qa.md;
  cấm seed / Face LIVE / Attendance CLOSED / remaster DONE
```

---

## completion_report

**Closed:** Extended shared Dialog/AlertDialog chrome to remaining ATT modals beyond Leave/OT create — request tabs (stall#1) + Attendance.tsx shift/sheet/page-leave/page-edit + weekly/GPS sites + manual/GPS clock confirms (stall#2). Compact `xevn-field-*` + title ≥20; legacy QA testids preserved for clock/sheet/shift/gps. Face HOLD honesty kept. `theme-contrast --strict` exit 0. Evidence WRITE this seat (stall#2 CLOSE).

**Residual:** Browser U65 acceptance → QA; Face HOLD; remaster/Attendance CLOSED not claimed.
