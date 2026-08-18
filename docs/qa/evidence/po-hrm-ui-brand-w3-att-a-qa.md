# PO-HRM-UI-BRAND-W3-ATT-A-QA — Attendance Overview + Clock manual/GPS brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-A-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Portal** | `http://127.0.0.1:5173` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-A · S01–S03, S09–S12, S20–S22 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-a.md` READY_FOR_QA |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (honesty stub kept) |
| **remaster_program_done** | **false** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` (entry) | hrm/xbos/portal **200** |
| `qc:dev-stack` (exit) | hrm/xbos/portal **200** |
| Seed / API invent | **None** (U65) |
| Face LIVE invent | **None** |
| Attendance CLOSED invent | **None** |

---

## 2. Theme contrast (exit #5)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] STRICT PASS — 0 pale hits (scanned 598)
```

---

## 3. HDSD inventory (U76)

| # | Surface | HDSD / inventory | Present |
|---|---------|------------------|---------|
| S01 | Tổng quan shell | CC→HRM→Chấm công→Tổng quan | 🟢 |
| S02 | KPI cards | sharp titles ≥15 · `#111827` | 🟢 |
| S03 | «Chấm công ngay» CTA | primary `#1E40AF` | 🟢 |
| S09 | Đơn nghỉ gần đây | leave overview panel wire | 🟢 |
| S10 | Clock-In method selector | primary selected (not orange) | 🟢 |
| S11 | Manual widget | primary Check-in CTA | 🟢 |
| S12 | Manual confirm modal | `xevn-dialog-surface` + brand bar 3px `#1E40AF` | 🟢 chrome · 🟡 title floor OBS |
| S20 | GPS widget | coords + primary CTA | 🟢 |
| S21 | GPS confirm | surface + sharp labels | 🟢 chrome · 🟡 i18n key OBS |
| S22 | Bản ghi hôm nay | under clock-in | 🟢 |
| Face | Hold banner | honesty stub | 🟢 |
| QR | SKIP | W3-ATT-E | ⚪ SKIP |

---

## 4. Browser click path (U65)

1. Login inject `ceo@xe.vn` → `/hr/attendance?portal=1&companyId=main`
2. **Tổng quan** — `att-overview-precision` · KPI · CTA «Chấm công ngay»
3. CTA → **Clock-In hub** — method selector Manual selected primary
4. Manual Check-in → confirm dialog → **Hủy** (no invent mutate)
5. Method **GPS** → open confirm → submit Check-in (FE path) → Network POST lat/lon
6. Method **Face ID** — `att-faceid-hold-banner` visible; not LIVE

**Scripts:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-a-qa.mjs` · `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-a-qa-gps-wire.mjs`

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Overview KPI + CTA primary `#1E40AF`; sharp labels | **PASS** | CTA `rgb(30,64,175)`; KPI titles 15px `#111827`; leave recent visible |
| 2 | Clock-In method selector primary (not orange); Manual confirm sharp | **PASS** | Manual icon `rgb(30,64,175)`; dialog `xevn-dialog-surface` + `::before` 3px primary; 0 pale labels |
| 3 | GPS widget + confirm sharp; lat/lon on Network check-in | **PASS** | POST `/api/hrm/attendance/records` body `latitude=21.028511` `longitude=105.804817` · HTTP **400** `HRM-ATT-GEO-001` (geofence — wire preserved) |
| 4 | Face hold banner still visible | **PASS** | `att-faceid-hold-banner` · «Tính năng đang được phát triển» / GĐ2 |
| 5 | `verify:xevn:theme-contrast -- --strict` exit 0 | **PASS** | §2 |

---

## 6. Network (GPS must_keep)

| Method | URL | Status | Code | lat/lon |
|--------|-----|--------|------|---------|
| POST | `/api/hrm/attendance/records` | **400** | `HRM-ATT-GEO-001` | **yes** `21.028511` / `105.804817` |

Geofence reject expected for synthetic browser coords — **not** wire break. Body keys include `latitude`, `longitude`.

---

## 7. Screens

| # | Path |
|---|------|
| 01 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-a-qa/01-overview-kpi-cta.png` |
| 02 | `…/02-clock-in-method-selector.png` |
| 03 | `…/03-manual-confirm-dialog.png` |
| 04 | `…/04-gps-widget.png` |
| 05 | `…/05-gps-confirm-dialog.png` |
| 06 | `…/06-face-hold-banner.png` |
| 07 | `…/07-gps-wire-retest.png` |

JSON: `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-a-qa-browser.json` · `_tmp-po-hrm-ui-brand-w3-att-a-qa-gps-wire.json`

---

## 8. Residuals (non-blocking for ATT-A chrome PASS)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| `PO-HRM-UI-BRAND-FE-FOUND-01-R1` | P1 (shared) | Manual/GPS DialogTitle measured **17.5px** / weight **600** vs ADR §10 ≥20 bold — same root/`text-xl` floor as FE-FOUND Import; **do not duplicate** ATT-A-only fix | **dev-fe** (already R1) |
| `OBS-W3-ATT-A-GPS-I18N` | P2 | Raw keys `gpsAttendance.checkIn` / `gpsAttendance.gpsLocation` on VI locale | **dev-fe** · `PO-HRM-UI-BRAND-W3-ATT-A-I18N` or ATT-G batch |
| `W3-ATT-G1` | P2 | Face hold shell chrome muted — FE residual | later honesty batch |
| `W3-ATT-E` | P1 | QR + overview charts remaster | next batch |
| Top nav «Chấm công» tab orange | OBS | Outside method-selector inventory; method tiles primary OK | defer |

---

## 9. Forbidden honesty

- No seed · no Nest invent as UF
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- Did not fail ATT-A solely for W3-ATT-G1 Face chrome debt (per FE handoff)

---

## completion_report

**Closed:** W3-ATT-A brand QA — U65 browser `ceo@xe.vn` / `main`. Overview KPI + CTA `#1E40AF`; Clock-In method selector primary (not orange); Manual/GPS confirm `xevn-dialog-surface` + primary bar; GPS POST carries `latitude`+`longitude` (400 GEO expected); Face hold banner honesty; `theme-contrast --strict` exit 0. Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE.

**Residual:** DialogTitle ≥20px → `PO-HRM-UI-BRAND-FE-FOUND-01-R1` (shared); GPS i18n keys OBS; W3-ATT-E / G1 as FE backlog.

## next_owner

`pm` (dispatch next W3 batch and/or keep FE-FOUND-01-R1 in flight)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-E (or next open W3 inventory batch)
from_role: pm
to_role: dev-fe
priority: P1
entry_criteria: QA PASS docs/qa/evidence/po-hrm-ui-brand-w3-att-a-qa.md; FE-FOUND-01-R1 DialogTitle floor still open — do not block ATT-E on R1 if R1 already DISPATCHED
scope: inventory W3-ATT-E (QR S13–S14 + overview charts S05–S08) OR EMP/PORT next per program
must_keep: ATT-A GPS lat/lon + Face hold honesty; U65 zero-seed
exit: READY_FOR_QA; theme-contrast --strict 0; cấm invent Attendance CLOSED / Face LIVE / remaster DONE
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-att-e.md
optional_parallel: PO-HRM-UI-BRAND-W3-ATT-A-I18N — fix gpsAttendance.checkIn / gpsAttendance.gpsLocation VI keys (P2)
```

## ack_status

**PASS_TO_PM**
