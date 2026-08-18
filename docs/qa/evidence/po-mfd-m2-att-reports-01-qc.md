# Evidence — `PO-MFD-M2-ATT-REPORTS-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-REPORTS-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance **Báo cáo** fidelity (matrix #29 LIVE · #30 PARTIAL) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-reports-01-qa.md`](po-mfd-m2-att-reports-01-qa.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-reports-01-browser.json`](_tmp-po-mfd-m2-att-reports-01-browser.json) verdict **PASS** · `uat_done: false` · `attendance_closed: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/01-attendance-shell.png` · `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/03-reports-loaded.png` · `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/04-reports-after-month-filter.png` |
| **spec_ref** | ATT-C6 · matrix #29/#30 · UF-HRM-05 · `useAttendanceReports` · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · #30 export LIVE · dedicated `/attendance/reports/*` · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance **Báo cáo** (#29) after QA `PO-MFD-M2-ATT-REPORTS-01`. Browser + runtime prove (1) tab **Báo cáo** load with fan-in GET **200** (`HRM-ATT-200` / `HRM-EMP-200` / `HRM-LEAVE-200`) · errorBanner=false · idle GET **0**/5s · no 5xx, (2) month filter **Tháng 8 → Tháng 7** changes `from_date` `2026-08-01` → `2026-07-01` · FE KPI/charts update · Jul honest **0%** / 0 records, (3) client-aggregate honesty documented (no Nest `/attendance/reports/*`). Stamp **#29 LIVE** · **#30 PARTIAL** (Xuất CTA visible; export dialog not exercised — P2). OBS only: no dedicated reports API · trend label «12 tháng» vs 1 point · KPI vs trend rate formula. **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED. Did **not** reopen REQUESTS / LEAVE / OT / CLOCK GWC.

**Conditions:** QA pack process gap (3/8) does not demote product close · #30 export remains PARTIAL P2 · OBS residuals non-blocking · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-reports-01-qa.md` | PASS_TO_PM; #29 LIVE; filter 8→7; idle0; honesty; #30 PARTIAL; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-reports-01-browser.json` | verdict PASS; load idleGets=0; filter rangeChanged + idleGets=0; matrix_stamp 29=LIVE 30=PARTIAL; dedicated_reports_api=false; pageErrors=[]; uat_done false | **ACCEPT** Network SoT |
| Screens (3 key) | shell · reports Tháng 8 · reports Tháng 7 + Xuất CTA | **ACCEPT** visual spot — see command table PNG rows |
| Matrix fidelity #29 / #30 | #29 **LIVE** · #30 **PARTIAL** (`HRM-ATTENDANCE_FIDELITY_MATRIX.md`) | **ACCEPT** MATCH (slice stamp only — not Attendance CLOSED) |

---

## Gate AC audit (narrow M2 REPORTS-01)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | Navigate Chấm công → Báo cáo + HDSD inventory | `steps.nav_reports` PASS · inventory surface 29 🟢 · PNG shell + reports tab active | 🟢 **PASS** |
| 2 | Page load no ERROR; GET 2xx or honest empty | `errorBanner=false` · records **200** `HRM-ATT-200` total=4 · employees **200** `HRM-EMP-200` total=59 · leave **200** `HRM-LEAVE-200` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/03-reports-loaded.png` KPI 59 / 0.32% | 🟢 **PASS** |
| 3 | Filters apply; FE updates; no GET storm | Tháng 8→7 · `from_date` 2026-08-01→2026-07-01 · Jul records total=0 · idleGets load+filter **0** · storm=false · PNG `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/04-reports-after-month-filter.png` Tháng 7 · 0% | 🟢 **PASS** |
| 4 | Client aggregate honesty | `honesty.dedicated_reports_api=false` · sources records+employees+leave · FE `useAttendanceReports` | 🟢 **PASS** (documented LIVE, not invent PARTIAL) |
| 5 | Screenshot + click path + URL | 3 PNG + portal_url above | 🟢 **PASS** |
| 6 | Matrix #29 LIVE / #30 PARTIAL | matrix file + JSON stamp MATCH · exportBtn=true · dialog not exercised | 🟢 **PASS** (#30 stays PARTIAL) |
| 7 | No invent Attendance CLOSED / uat_done | JSON + QA `uat_done: false` · `attendance_closed: false` | 🟢 **PASS** (honesty) |
| 8 | OBS: no dedicated API · trend 12m · KPI formula | PNG trend single T8/T7 point · KPI 0.32% vs trend 100% Aug | 🟡 **OBS only** (not NO-GO) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| Matrix **#29** Báo cáo load → month filter → FE update (UF-HRM-05 fidelity) | **In-scope** this gate (no dedicated J-* reports row in SoT) | **PASS** (browser Network + PNG) |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Related attendance shell; not re-certified this seat | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **untouched** |
| **J-HRM-06b** Bảng chấm công | Out of this seat | **prior ✅** · **untouched** |
| Attendance CLOSED / full STUB cluster | Forbidden | **not claimed** |

Mandatory in-scope for this gate: matrix #29 reports AC **PASS**. No invent PASS on untested mandatory J-* beyond this slice. No dedicated reports J-* exists → fidelity matrix #29 is SoT for L2.5-equivalent cross-nav (tab → filter → FE).

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #29 Báo cáo LIVE — fan-in GET 2xx · month filter range change · idle0 · FE update · client-aggregate honesty |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **3/8** (missing `portal_url`, `journey_l25`, `residual_section`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / OBS** | #30 export dialog exercise (PARTIAL P2) · no dedicated `/attendance/reports/*` (OBS BA) · trend «12 tháng» vs 1 point (P2 polish) · KPI vs trend rate formula (P2) · Phase1/UAT DONE · Attendance CLOSED · REQUESTS/LEAVE/OT/CLOCK prior GWC |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote REPORTS-01 close. OBS residuals are **not** product NO-GO when #29 AC PASS and honesty documented.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| #29 Báo cáo load + month filter + idle0 + honesty | **CLOSED** this seat | — | — | No |
| #30 Xuất báo cáo export dialog | OPEN **PARTIAL** | P2 | qa / dev-fe (future seat) | No — CTA spot only; do not invent LIVE |
| `R-MFD-M2-ATT-REPORTS-NO-DEDICATED-API` | OPEN OBS | P2 | ba-process | No — honesty documented; UI LIVE OK |
| `OBS-MFD-M2-ATT-REPORTS-TREND-LABEL` | OPEN OBS | P2 | dev-fe | No — label vs 1-point data |
| `OBS-MFD-M2-ATT-REPORTS-RATE-FORMULA` | OPEN OBS | P2 | ba-process / dev-fe | No — display formula mismatch |
| `C-REPORTS01-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-* + ## Residual on next QA MD |
| REQUESTS / LEAVE / OT / CLOCK prior GWC | **untouched** | — | — | No — not reopened |
| Phase1 / UAT DONE / Attendance CLOSED | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0/P1 FAIL** open for this **REPORTS-01** fidelity slice. Residuals = OBS / PARTIAL P2 only.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent #30 export LIVE — remains **PARTIAL** until export dialog seat under U65.
4. OBS (no dedicated reports API · trend 12m label · KPI formula) stay **OBS** — optional BA/FE P2; not reports NO-GO.
5. **Do not** reopen REQUESTS / LEAVE / OT / CLOCK GWC without new FAIL evidence.
6. U65: **no seed** in acceptance path.
7. QA pack format 3/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-reports-01-qa.md
→ FAIL 3/8 — missing portal_url, journey_l25, residual_section
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 REPORTS-01 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-reports-01-qa.md` | **FAIL** exit **1** · **3/8** missing portal_url, journey_l25, residual_section (process) |
| Disk check PNG under `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/` | **PASS** · 01 / 03 / 04 / 05 present |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-reports-01-browser.json` | **PASS** · verdict PASS · Aug→Jul from_date · idleGets=0 · honesty · matrix 29=LIVE 30=PARTIAL · pageErrors=[] · uat_done false |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-reports-01/01-attendance-shell.png | **PASS** · attendance shell · Báo cáo tab present |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-reports-01/03-reports-loaded.png | **PASS** · Tháng 8 · KPI 59 / 0.32% · Xuất CTA · trend T8 single point · no ERROR |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-reports-01/04-reports-after-month-filter.png | **PASS** · Tháng 7 · 0% honest empty · Xuất CTA · trend T7 @ 0 |
| Matrix #29/#30 vs `HRM-ATTENDANCE_FIDELITY_MATRIX.md` | **PASS** · #29 LIVE · #30 PARTIAL MATCH |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md` | **PASS** exit **0** (8/8) [post-write] |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md --check-assets` | **PASS** exit **0** [post-write] |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 hrm/xbos/portal 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** #29 reports load | LIVE · fan-in GET 2xx · no ERROR · idle0 | **PASS** | HRM-ATT-200 · HRM-EMP-200 · HRM-LEAVE-200 · `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/03-reports-loaded.png` |
| **FILTER** month 8→7 | from_date change · FE update · idle0 | **PASS** | Jul HRM-ATT-200 total=0 · `docs/qa/evidence/screens/po-mfd-m2-att-reports-01/04-reports-after-month-filter.png` |
| **READ** aggregate honesty | no dedicated reports API | **PASS** | honesty.dedicated_reports_api=false |
| **#30** export | CTA only · dialog not exercised | **PARTIAL** | exportBtn=true · P2 |
| Matrix #29 L2.5-equivalent | tab→filter→FE | **PASS** | this seat |
| **J-HRM-06** | related shell | **prior ✅** | untouched this seat |
| Attendance CLOSED / uat_done | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent #30 export LIVE
- Did not invent dedicated reports API as present
- Did not reopen REQUESTS / LEAVE / OT / CLOCK GWC
- Did not NO-GO solely on OBS trend/KPI formula or QA pack format gap
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-REPORTS-01-QC** → **GO WITH CONDITIONS**. Matrix **#29 LIVE** (fan-in GET 200 · month filter 8→7 `from_date` change · idle GET 0 · FE update · client-aggregate honesty). **#30 PARTIAL** (Xuất CTA only). Residuals OBS only: no dedicated reports API · trend 12m label · KPI/trend formula · QA pack format P3. **uat_done false**. Attendance **not** CLOSED. U65 zero-seed. REQUESTS/LEAVE/OT/CLOCK **not** reopened.

**Open / residual owners:** `R-MFD-M2-ATT-REPORTS-NO-DEDICATED-API` (ba-process OBS); `OBS-MFD-M2-ATT-REPORTS-TREND-LABEL` (dev-fe P2); `OBS-MFD-M2-ATT-REPORTS-RATE-FORMULA` (ba/dev-fe P2); #30 export PARTIAL (future P2 seat); QA pack portal_url/J-*/Residual (`qa` P3). **No product P0/P1 FAIL** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-REPORTS-01-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-REPORTS-01 / QA / QC as GWC reports #29 LIVE + #30 PARTIAL slice only; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED.
2) Residuals stay OPEN as OBS/PARTIAL only: R-MFD-M2-ATT-REPORTS-NO-DEDICATED-API · OBS trend-label · OBS rate-formula · #30 export P2 — do not invent PASS / LIVE export.
3) Do NOT reopen REQUESTS / LEAVE / OT / CLOCK GWC without new FAIL.
4) Next execution: dispatch next open P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix OR idle with explicit reason if no open P0 in MFD queue.
5) Optional P3: remind QA to include portal_url + J-* + ## Residual on next evidence MD (C-REPORTS01-QA-PACK-FMT-01).
6) Do NOT claim Attendance CLOSED from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-reports-01-qc.md`
