# PO-HRM-UI-BRAND-W3-ATT-E — Charts · QR clock · weekly · reports remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-E` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **RE-DISPATCH** | stall#2 evidence MISS — **CLOSED** this seat (code confirm + theme-contrast soft+strict + WRITE this file) |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-E · S05–S08, S13–S14, S29–S34, S62–S63 |
| **Prior** | ATT-D-QA PASS `docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md` |
| **change_mode** | `UPGRADE` + stall#2 `FIX` · preserve_default · mutate wires kept |
| **ack_status** | **READY_FOR_QA** |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **prop_03e_qr_card** | **SKIP** (`att-prop-03e-qr-card-skip` honesty — `EmployeeQRCard` unmounted) |
| **remaster_program_done** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense (Dialog title ≥20 bold; CTA primary `#1E40AF` / DNA status) |
| **Inventory** | S05 leave-month · S06 leave-dept · S07 leave-type pie · S08 late/early list · S13 QR scanner · S14 QR confirm · S29 records→Xuất · S30 date filter · S31 weekly · S32 cell modal · S33 weekly no-op icons · S34 summary (=records) · S62 reports · S63 reports→Xuất |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice E |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | overview/weekly/report hooks · QR `checkIn`/`checkOut` + Html5Qrcode · client XLSX export · Face `featureHold` · PROP-03e no invent · leave/OT/ATT-03d not fought · no Nest/seed · no Attendance CLOSED · no Face LIVE |

---

## Paths touched

| Path | Role |
|------|------|
| `apps/web/hrm/src/pages/Attendance.tsx` | S05–S08 charts · S31–S34 weekly/summary · PROP-03e SKIP honesty · CODE-MEMORY ATT-E |
| `apps/web/hrm/src/components/attendance/QRCodeScanner.tsx` | S13–S14 QR clock remaster; checkIn/checkOut wires kept |
| `apps/web/hrm/src/components/attendance/AttendanceExportDialog.tsx` | S29/S63 Dialog ≥20 + primary export CTA |
| `apps/web/hrm/src/components/attendance/AttendanceReportsTab.tsx` | S62–S63 reports ops-dense |
| `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx` | S29–S30 date+export chrome |

**Not touched:** Nest · seed · Face LIVE invent · LeaveTab/OT/trip/update/shift (ATT-C/D) · work-sites GPS (ATT-F) · Attendance CLOSED claim.

---

## Surfaces remastered (14 inventory)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S05 | overview leave-by-month | CardTitle ≥20; stroke `#1E40AF`; `att-chart-leave-month` |
| S06 | leave-by-department | Title ≥20; bar `#1E40AF`; `att-chart-leave-dept` |
| S07 | leave-type pie | Title ≥20; Precision palette (no purple/pink); `att-chart-leave-type` |
| S08 | late/early list | Title ≥20; sharp avatars; `att-chart-late-early-list` |
| S13 | `QRCodeScanner.tsx` | Title ≥20; start CTA primary; `att-qr-clock-precision` |
| S14 | QR confirm Dialog | DialogTitle ≥20; check-in primary; check-out DNA destructive |
| S29 | records export + dialog | `att-records-export` + export DialogTitle ≥20; primary export CTA |
| S30 | records date filter | Sharp outline; `att-records-date-filter` |
| S31 | weekly grid | `att-weekly-precision`; title ≥20; reload primary |
| S32 | weekly cell Dialog | `att-weekly-cell-dialog` / `att-weekly-cell-detail-title` ≥20 |
| S33 | weekly Pencil/Settings/Download | No-op + honesty title + `att-weekly-stub-*` |
| S34 | menu `summary` | Alias → same records wire |
| S62 | `AttendanceReportsTab.tsx` | Title ≥20; KPI ops-dense; `att-reports-precision` |
| S63 | reports → Xuất | Same `AttendanceExportDialog` client XLSX |

**OUT / SKIP:** PROP-03e S15–S16 card · Face LIVE · Nest/seed · Attendance CLOSED · remaster DONE

---

## Stall#2 delta (this seat)

| Item | Action |
|------|--------|
| Evidence MISS (twice) | **Rewrote** this file AFTER soft+strict verify exit 0 |
| QR clock | Confirmed Precision Motion + destructive checkout DNA |
| PROP-03e | Confirmed SKIP honesty `att-prop-03e-qr-card-skip` (EmployeeQRCard unmounted) |
| Face honesty | Kept `featureHold` — not remastered as LIVE |
| Charts/weekly/reports | Confirmed titles ≥20 + primary series / ops-dense KPI |

---

## Verify (mandatory — pasted this seat 2026-08-05)

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict for W3 DoD)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

Raw log: `docs/qa/evidence/_tmp-att-e-theme-contrast.txt`

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| Overview → `useAttendanceOverview` | kept |
| Weekly → `useWeeklyAttendanceSummary` | kept |
| QR `checkIn` / `checkOut` + Html5Qrcode | kept |
| Records date filter → list query | kept |
| `AttendanceExportDialog` client XLSX | kept |
| Reports `useAttendanceReports` | kept |
| Face `featureHold` honesty | untouched |
| ATT-03d / leave panel / OT mutate | not fought |
| EmployeeQRCard issuance | **SKIP** (unmounted) |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. Tổng quan — charts S05–S08 titles ≥20 + primary series
2. Clock-In → QR — scanner + PROP-03e SKIP honesty (no EmployeeQRCard)
3. Bản ghi — date filter + Xuất dialog ≥20
4. Chấm công tuần — grid + cell modal + S33 stubs
5. Báo cáo — KPI ops-dense + Xuất

---

## Residuals

| ID | Note | Owner |
|----|------|-------|
| PROP-03e card | SKIP invent (honesty only) | defer PROP-03e program |
| Weekly cell save | honesty toast — no invent API | product backlog |
| Top-tab rainbow | overview/attendance orange pills outside ATT-E surface chrome | later shell / G1 |
| Browser visual | U65 QA | **ATT-E-QA** |

**Forbidden claims:** Attendance CLOSED · remaster DONE · Face LIVE · QR invent LIVE

---

## completion_report

**Closed:** W3-ATT-E Precision Motion for S05–S08, S13–S14, S29–S34, S62–S63; PROP-03e card SKIP honesty; Face honesty kept; theme-contrast soft+strict exit 0; **evidence file WRITTEN** (stall#2 close).

**Residual / not claimed:** remaster program not DONE · Attendance not CLOSED · Face not LIVE · PROP-03e remains OUT/SKIP · browser U65 not run this seat.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-E-QA
priority: P0
role: qa
entry_criteria: L0 stack up; U65 zero-seed browser-only; FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md
scope: S05–S08 charts · S13–S14 QR clock (assert att-prop-03e-qr-card-skip; no EmployeeQRCard issuance) · S29–S34 records/export/weekly/cell · S62–S63 reports/export
account: ceo@xe.vn / Xevn@2026
AC:
  - titles ≥20 / primary CTA #1E40AF; no orange/purple AI chrome on ATT-E surfaces
  - QR confirm DialogTitle ≥20; check-in primary; check-out DNA destructive; PROP-03e SKIP visible
  - weekly stub honesty; cell dialog ≥20; export dialog ≥20
  - theme-contrast --strict exit 0 (cite FE evidence)
exit_criteria: WRITE docs/qa/evidence/po-hrm-ui-brand-w3-att-e-qa.md BEFORE finish; PASS_TO_PM
cấm: seed · Nest as UF · Attendance CLOSED · Face LIVE · QR invent · PROP-03e invent · remaster DONE
```

## ack_status

**READY_FOR_QA**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md`