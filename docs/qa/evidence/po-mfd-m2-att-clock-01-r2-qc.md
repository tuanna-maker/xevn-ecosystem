# Evidence — `PO-MFD-M2-ATT-CLOCK-01-R2-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-CLOCK-01-R2-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance Clock GPS lat/lon wire (#10 LIVE) + Manual must_keep + Face GĐ2-HOLD honesty |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-clock-01-r2-qa.md`](po-mfd-m2-att-clock-01-r2-qa.md) PASS_TO_PM |
| **prior_fail** | [`po-mfd-m2-att-clock-01-qa.md`](po-mfd-m2-att-clock-01-qa.md) FAIL (POST omit lat/lon) |
| **dev_fe** | [`po-mfd-m2-att-clock-gps-latlon-01.md`](po-mfd-m2-att-clock-gps-latlon-01.md) READY_FOR_QA |
| **runtime** | [`_tmp-po-mfd-m2-att-clock-01-r2-browser.json`](_tmp-po-mfd-m2-att-clock-01-r2-browser.json) verdict **PASS** · `uat_done: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/01-clock-hub.png` · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/02-face-hold.png` · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/03-gps-panel.png` · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/03b-gps-dialog.png` · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/04-gps-after-attempt.png` · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/05-manual-panel.png` · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/06-manual-after.png` |
| **spec_ref** | HRM-AT-01 · fidelity matrix #7/#9/#10 · `SRS_VN` geofence intent · Nest `HRM-ATT-GEO-001` when lat+lon + active sites |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · Face LIVE · GEO-001 reject E2E PASS · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: Clock-In **GPS FE lat/lon wire** after R1 FAIL + Dev-FE FIX + QA R2. Browser Network SoT proves (1) GPS POST `/api/hrm/attendance/records` **201** `HRM-ATT-201` with `hasLatLon=true` · `latitude=10` · `longitude=10` (closes **R-MFD-M2-CLOCK-GPS-LATLON**), (2) Manual POST **201** `HRM-ATT-201` with `hasLatLon=false` (must_keep), (3) Face remains **GĐ2-HOLD** (banner + 0 Face POST — do not promote Face LIVE), (4) GEO-001 reject **N/A** under `sitesActive=0` → `BE_SKIP_EMPTY_SITES` — accepted as **CFG OBS** (not FE silent omit; not product NO-GO on this wire seat). Matrix #10 stamp **LIVE** accepted for FE wire with GEO-001 CFG-gated. **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED.

**Conditions:** GEO-001 E2E reject remains optional CFG follow-up (`R-MFD-M2-CLOCK-GEO001-CFG`) via FE work-site create under U65 · QA pack process 2/8 · i18n/header OBS P3 · Face/QR depth not promoted · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-clock-01-qa.md` | FAIL · GPS UI coords but POST omit lat/lon · silent GEO bypass | **ACCEPT** as R1 baseline superseded |
| `docs/qa/evidence/po-mfd-m2-att-clock-gps-latlon-01.md` | READY_FOR_QA · FE wires lat/lon · vitest · must_keep Manual/Face | **ACCEPT** Dev-FE fix packet |
| `docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qa.md` | PASS_TO_PM · hasLatLon=true 201 · Manual false · Face HOLD · #10 LIVE · GEO CFG OBS · uat_done false · U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-r2-browser.json` | verdict PASS · gps_ac hasLatLon=true 201 HRM-ATT-201 · manual_spot hasLatLon=false · face banner · sitesActive=0 · uat_done false | **ACCEPT** Network SoT |
| Screens (7) | hub · face hold · gps panel · dialog · after GPS · manual · manual after | **ACCEPT** visual spot |
| Matrix fidelity #10 | stamped LIVE (`HRM-ATTENDANCE_FIDELITY_MATRIX.md` · CLOCK-01-R2) · #9 GĐ2-HOLD · #7 LIVE | **ACCEPT** (FE wire LIVE; GEO-001 CFG note — not Attendance CLOSED) |

---

## Gate AC audit (narrow CLOCK GPS R2)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | GPS POST includes latitude+longitude · 201 HRM-ATT-201 | JSON POST bodyKeys include `latitude`,`longitude` · `hasLatLon=true` · lat=10 lon=10 · status **201** `HRM-ATT-201` · emp VTH-0007 · toast «Check-in GPS thành công!» · PNG `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/03-gps-panel.png` coords 10° · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/04-gps-after-attempt.png` | 🟢 **PASS** |
| 2 | Manual still 201 without lat/lon (must_keep) | Manual POST **201** `HRM-ATT-201` · `hasLatLon=false` · emp VTH-0002 · PNG `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/06-manual-after.png` toast check-in success | 🟢 **PASS** |
| 3 | Face remains GĐ2-HOLD — do not promote Face LIVE | `surfaces.9.runtime=GĐ2-HOLD` · `banner=true` · `facePostsBeforeGpsAttempt=0` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/02-face-hold.png` red GĐ2 banner | 🟢 **PASS** (honesty HOLD) |
| 4 | GEO-001 when gps ON + ≥1 site | **N/A** — `cfg.sitesActive=0` · `expectMode=BE_SKIP_EMPTY_SITES` · `geo001=false` with lat/lon present is **expected BE skip**, not FE omit | ⚪ **CFG OBS / CONDITION** (not NO-GO on FE wire) |
| 5 | Document empty sites / BE skip | QA + JSON `mode=BE_SKIP_EMPTY_SITES` · residual `R-MFD-M2-CLOCK-GEO001-CFG` | 🟢 **PASS** (honesty) |
| 6 | R1 residual lat/lon CLOSED | Prior FAIL omit coords superseded by R2 Network hasLatLon=true | 🟢 **CLOSED** `R-MFD-M2-CLOCK-GPS-LATLON` |
| 7 | uat_done false · Attendance NOT CLOSED · NOT Phase1 DONE | JSON + QA + this QC | 🟢 **PASS** (honesty) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-HRM-06** Chấm công → bản ghi / yêu cầu (clock check-in slice) | **In-scope** this gate — GPS+Manual POST records on portal `:5173` | **PASS** (browser Network create records + UI toast) |
| **J-HRM-06b** Bảng chấm công | Related; CLOSED elsewhere (SHEETS-01 GWC) | **prior ✅** · **untouched** |
| **J-MOB-02** Check-in GPS (mobile) | Out of scope this web seat | **deferred** — not claimed |
| Face LIVE / QR mutate depth / Attendance CLOSED | Forbidden invent | **not claimed** |

Mandatory in-scope for this gate: **J-HRM-06** clock GPS lat/lon wire + Manual must_keep **PASS**. No untested mandatory J-* claimed PASS beyond this slice. GEO-001 reject path deferred as CFG CONDITION (not invent FAIL).

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | GPS POST hasLatLon=true → 201 HRM-ATT-201 (closes R1 silent GEO bypass) · Manual omit coords still 201 · Face GĐ2-HOLD honesty · matrix #10 LIVE (FE wire) |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser env PORTAL `:5173` · HRM `:28001` |
| **OUT-OF-SCOPE / CONDITION** | GEO-001 reject E2E (needs ≥1 active work-site via FE CFG — U65 no seed) · Face LIVE · QR mutate · Attendance CLOSED · Phase1/UAT DONE · i18n CTA `gpsAttendance.checkIn` · `x-company-id: main` header OBS |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote GPS wire close. GEO-001 not proven under empty sites is **CFG OBS** — **not** product NO-GO when FE lat/lon wire PASS (PM gate accept).

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| `R-MFD-M2-CLOCK-GPS-LATLON` | **CLOSED** this seat | — | — | No |
| `R-MFD-M2-CLOCK-GEO001-CFG` | OPEN OBS / CONDITION | P2 | pm → FE CFG work-site (ceo/ops; U65 create from FE, not seed) | No — optional follow-up; not FE wire NO-GO |
| `R-MFD-M2-CLOCK-I18N-GPS-CTA` | OPEN OBS | P3 | dev-fe | No — raw `gpsAttendance.checkIn` on dialog |
| `R-MFD-M2-CLOCK-HDR-MAIN` | OPEN OBS | P3 | — | No — NV session `x-company-id: main` with body `company_id=trsport` |
| Face LIVE / QR depth / Attendance CLOSED | — | — | — | No — **not claimed** |
| `C-CLOCK01R2-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-HRM-06 on next QA MD |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this **CLOCK GPS lat/lon wire** slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** promote Face LIVE — #9 remains **GĐ2-HOLD**.
4. **Do not** invent GEO-001 reject PASS — remains **CFG CONDITION** until ≥1 active work-site created from FE (U65).
5. **Do not** reopen SHEETS / OT / NT CLOSED slices from this seat.
6. U65: **no seed** in acceptance path.
7. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 CLOCK GPS wire close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check 7 PNG under `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/` | **PASS** · 01..06 + 03b present |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-r2-browser.json` | **PASS** · verdict PASS · GPS POST hasLatLon=true 201 HRM-ATT-201 lat=10 lon=10 · Manual hasLatLon=false 201 · Face HOLD · sitesActive=0 · uat_done false |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/02-face-hold.png | **PASS** · GĐ2-HOLD red banner · Face model load noise OBS |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/03-gps-panel.png | **PASS** · coords 10.000000° / 10.000000° · emp VTH-0007 |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/04-gps-after-attempt.png | **PASS** · toast «Check-in GPS thành công!» Phan Văn An 13:27:41 |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/06-manual-after.png | **PASS** · Manual VTH-0002 check-in toast · must_keep path |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | QA `qc:fe-be-health` entry+exit ALL PASS |
| **LOGIN** | `uat.nv0007@xe.vn` OU trsport | **PASS** | browser JSON env NV_EMAIL |
| **CREATE** GPS record | POST lat/lon · 201 HRM-ATT-201 | **PASS** | hasLatLon=true · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/04-gps-after-attempt.png` |
| **CREATE** Manual record | POST omit lat/lon · 201 | **PASS** | hasLatLon=false · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/06-manual-after.png` |
| **READ** Face HOLD | banner · 0 Face POST | **PASS** | GĐ2-HOLD · `docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2/02-face-hold.png` |
| **J-HRM-06** L2.5 | clock check-in GPS+Manual records | **PASS** | this seat Network SoT |
| GEO-001 reject 4xx | gps ON + ≥1 site | **CONDITION** | sitesActive=0 CFG OBS |
| Face LIVE / Attendance CLOSED / uat_done | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not promote Face LIVE
- Did not invent GEO-001 FAIL on empty sites / did not invent GEO-001 PASS
- Did not NO-GO solely on QA pack format gap or CFG empty work-sites
- Did not reopen SHEETS / OT / NT
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-CLOCK-01-R2-QC** → **GO WITH CONDITIONS**. GPS Clock-In POST now includes numeric `latitude`/`longitude` (10/10) → **201** `HRM-ATT-201` (`R-MFD-M2-CLOCK-GPS-LATLON` CLOSED vs R1 FAIL). Manual must_keep omit coords still **201**. Face **GĐ2-HOLD** (not LIVE). Matrix **#10 LIVE** accepted for FE wire; GEO-001 reject N/A under `sitesActive=0` = **CFG OBS** (`R-MFD-M2-CLOCK-GEO001-CFG` optional). **uat_done false**. Attendance **not** CLOSED. U65 zero-seed. QA pack 2/8 process-only; QC pack 8/8 + assets.

**Open / residual owners:** `R-MFD-M2-CLOCK-GEO001-CFG` (pm → FE CFG work-site P2 OBS); i18n GPS CTA + header OBS P3; QA pack portal_url/J-* (`qa` P3). **No product P0** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-CLOCK-01-R2-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-CLOCK-01-R2 / QA / QC as GWC — GPS lat/lon wire + Manual must_keep + Face GĐ2-HOLD; matrix #10 LIVE (FE wire); J-HRM-06 PASS this seat; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED; do NOT promote Face LIVE.
2) Residual OPEN OBS only: R-MFD-M2-CLOCK-GEO001-CFG (P2 — optional FE CFG create ≥1 work-site under U65, then GEO-001 retest) · R-MFD-M2-CLOCK-I18N-GPS-CTA (P3) · R-MFD-M2-CLOCK-HDR-MAIN (P3) — do not invent PASS/FAIL beyond wire.
3) Next execution: dispatch next open P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix OR idle with explicit reason if no open P0 in MFD queue.
4) Optional P3: remind QA to include portal_url + J-HRM-06 on next evidence MD (C-CLOCK01R2-QA-PACK-FMT-01).
5) Do NOT claim Attendance CLOSED / Face LIVE / GEO-001 E2E PASS from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-clock-01-r2-qc.md`

## ack_status

**PASS_TO_PM**
