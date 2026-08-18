# PO-HRM-UI-BRAND-W3-ATT-A — Attendance Overview + clock manual/GPS remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-A` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-A · S01–S03, S09–S12, S20–S22 |
| **Foundation** | `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md` (+ FE-FOUND-01) |
| **Coordinate** | ATT-03d/05b GPS + leave panel wires **preserved** (tokens/chrome only) |
| **change_mode** | `UPGRADE` · preserve_default · Face honesty kept · QR SKIP |
| **ack_status** | **READY_FOR_QA** |
| **Prior** | RE-DISPATCH after stall `579544da` n=1 |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface iframe · §10 ops-dense modal |
| **Inventory** | S01 Overview · S02 KPI · S03 Chấm công ngay · S09 Đơn nghỉ gần đây · S10 Clock hub · S11 Manual · S12 Manual Confirm · S20 GPS · S21 GPS Confirm · S22 Bản ghi hôm nay |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice A |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | ATT-03d work-sites + leave-balance panel wires · Face `featureHold` honesty · PROP-03e QR no invent · no Nest/seed · no Attendance CLOSED |

---

## Surfaces remastered (10)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S01 | `Attendance.tsx` `renderOverview` | Page chrome `text-xevn-text` / secondary; `data-testid=att-overview-precision` |
| S02 | Overview KPI cards | Sharp titles ≥15px · `rounded-card` · `border-xevn-border` · primary link CTA |
| S03 | Overview CTA | `overview-clock-in-cta` → `bg-xevn-primary` opens manual wizard |
| S09 | `LeaveOverviewRecentPanel.tsx` | Panel sharp text; leave list wire + sanitize + F5 testid kept |
| S10 | `ClockInMethodSelector.tsx` + wizard shell | Method tiles primary selected; no orange accent |
| S11 | `CheckInOutWidget.tsx` | Card/labels/status → xevn tokens; primary Check-in CTA |
| S12 | CheckInOut confirm `DialogContent` | Title ≥20 bold; inherits `xevn-dialog-surface` brand bar; mutate wire kept |
| S20 | `GPSAttendance.tsx` | GPS clock chrome sharp; lat/lon POST wire kept |
| S21 | GPS confirm dialog | Ops-dense labels; Dialog surface brand bar; confirm handlers kept |
| S22 | `AttendanceRecordsTable.tsx` (under clock-in) | Table/edit dialog labels → `text-xevn-textSecondary`; PATCH edit kept |

**Face web honesty (must_keep):** `clock-in-panel-faceid` + `att-faceid-hold-banner` + `FaceIDScanner/FaceRegistration featureHold` — not claimed LIVE (product = W4-MOB-A).

**QR SKIP:** `clock-in-panel-qrcode` left untouched this batch (PROP-03e / W3-ATT-E later).

---

## CODE-MEMORY

APPEND `@CODE-MEMORY-CHANGE` `PO-HRM-UI-BRAND-W3-ATT-A` on:

- `Attendance.tsx`
- `CheckInOutWidget.tsx`
- `GPSAttendance.tsx`
- `ClockInMethodSelector.tsx`
- `LeaveOverviewRecentPanel.tsx`
- `AttendanceRecordsTable.tsx`

---

## Verify

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK
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
| Overview year → `useAttendanceOverview(year)` | kept |
| Leave overview recent → `useLeaveRequests` | kept |
| Manual `checkIn`/`checkOut` | kept |
| GPS `checkIn` with `latitude`+`longitude` | kept |
| Records PATCH edit + date harden | kept |
| Face `featureHold` block mutate | kept |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. ATT Tổng quan — KPI + CTA primary + year honesty
2. Overview → Chấm công ngay → method selector (manual selected)
3. Manual widget + Confirm dialog (thin primary bar)
4. Method GPS — coords + Confirm
5. Face method — destructive honesty banner visible (not LIVE)
6. Today records panel under clock-in — sharp table labels

---

## Residual

| Item | Severity | Owner |
|------|----------|-------|
| FaceIDScanner/FaceRegistration still have `text-muted-foreground` inside hold shell | P2 | **W3-ATT-G1** (honesty batch) |
| QR clock chrome remaster | P1 | **W3-ATT-E** (S13–S14) |
| Charts on overview (S05–S08) | P1 | **W3-ATT-E** |
| LeaveTab / request tabs pale labels | P1 | **W3-ATT-C/D** |
| Browser visual spot | QA | this work_item QA |

---

## Handoff

### completion_report

W3-ATT-A closed: remastered Overview + Clock-In manual/GPS P0 surfaces (S01–S03, S09–S12, S20–S22) to Precision Motion tokens (ADR §8–§10). Preserved ATT-03d/05b GPS lat/lon + leave overview wires. Face web honesty stub kept; QR SKIP. `verify:xevn:theme-contrast` soft + `--strict` exit 0. No Nest/seed/Attendance CLOSED invent.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-A-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: L0 stack up; U65 zero-seed browser-only; foundation theme gate green
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-a.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md W3-ATT-A
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → CC→HRM→Chấm công→Tổng quan — sharp KPI/titles; CTA «Chấm công ngay» primary #1E40AF
  3) CTA → Clock-In hub — method selector; Manual confirm Dialog thin primary bar + title bold
  4) Method GPS — panel loads; Confirm dialog ops-dense (no pale slate-400 labels)
  5) Method Face — honesty banner visible; UI not claimed LIVE
  6) QR method — no invent claim; SKIP OK this batch
  7) J-* spot: overview leave recent panel still lists leave reasons (wire not broken)
exit_criteria: evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-a-qa.md · PASS_TO_PM or FAIL with surface_id
cấm: seed · Nest probe as UF · claim Attendance CLOSED · fail for W3-ATT-G1 Face chrome debt
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-a.md`
