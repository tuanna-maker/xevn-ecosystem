# Evidence — `PO-MFD-M2-ATT-OVERVIEW-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-OVERVIEW-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance **Tổng quan** year filter wire (matrix C1 / rows ~1,4,5 filter honesty) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-overview-01-qa.md`](po-mfd-m2-att-overview-01-qa.md) PASS_TO_PM · FE [`po-mfd-m2-att-overview-01-fe.md`](po-mfd-m2-att-overview-01-fe.md) READY_FOR_QA |
| **runtime** | [`_tmp-po-mfd-m2-att-overview-01-browser.json`](_tmp-po-mfd-m2-att-overview-01-browser.json) verdict **PASS** · `uat_done: false` · `attendance_closed: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/01-overview-this-year.png` · `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/02-year-select-open.png` · `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/03-overview-last-year.png` · `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/04-mustkeep-records.png` · `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/05-mustkeep-settings-emp.png` |
| **spec_ref** | matrix C1 · Nest `AttendanceOverviewQueryDto` `year` only · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` rows 1/4/5 · FE honesty · **J-HRM-06** shell prior |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · Face LIVE · day/week/month API · `uat_done` remains **false** |
| **do_not_reopen** | RECORDS / SETTINGS-EMP / CLOCK / SHEETS / LEAVE / OT / REQUESTS / REPORTS prior GWC without new FAIL |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance **Tổng quan** year Select wire after QA `PO-MFD-M2-ATT-OVERVIEW-01-QA`. Browser + runtime prove (1) year Select honesty — only **Năm nay (2026)** / **Năm trước (2025)** · no day/week/month · honesty text «Lọc theo năm (API)…», (2) `GET …/attendance/overview?company_id=main&year=2026` **200** `HRM-ATT-OVERVIEW-200` · switch last-year → `year=2025` **200** · UI «Đang xem năm 2025» · idle overview GET **0**, (3) must_keep RECORDS `HRM-ATT-200` + SETTINGS→Nhân viên table/CTA · mutate=0. L0 entry+exit cited **PASS**. Residuals stay **OBS** (non-blocking): `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` (PM already DISPATCHED `ba-process`) · `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` (chart subtitle lag on year=2025 — confirmed on PNG 03). **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED · Face **not** LIVE. Did **not** reopen CLOSED GWC tabs.

**Conditions:** PERIOD-SPEC_GAP + chart-subtitle remain OBS · QA pack process gap (2/8) does not demote product close · **NOT** Phase 1 / UAT DONE · **NOT** Attendance CLOSED.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-overview-01-qa.md` | PASS_TO_PM; year honesty; GET 2026/2025 200; idle0; must_keep RECORDS+SETTINGS-EMP; L0 entry+exit; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-overview-01-browser.json` | verdict PASS; overviewGets year=2026+2025 200 `HRM-ATT-OVERVIEW-200`; optionTexts 2 year-only; hasUnsupportedTimeOptions=false; idle0; recordsGets 200×2; settings_emp ok mutate=0; pageErrors=[]; uat_done false; attendance_closed false | **ACCEPT** Network SoT |
| FE `po-mfd-m2-att-overview-01-fe.md` | READY_FOR_QA; Nest year-only WIRE; day/week/month removed + SPEC_GAP; vitest 7/7 | **ACCEPT** (entry chain) |
| Screens (5) | this-year · select open · last-year · records · settings-emp | **ACCEPT** visual spot — see command table PNG rows |

---

## Gate AC audit (narrow M2 OVERVIEW-01)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | L0 entry+exit PASS | QA cites `qc:fe-be-health` entry+exit PASS · JSON `l0` hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | Login + Overview tab | `ceo@xe.vn` / `main` · tab **Tổng quan** · PNG 01 | 🟢 **PASS** |
| 3 | Year Select honesty; no day/week/month | honestyVisible=true · opts=`Năm nay (2026)`,`Năm trước (2025)` · hasUnsupportedTimeOptions=false · PNG 02 | 🟢 **PASS** |
| 4 | this-year GET `year=2026` 200 | status=200 · code=`HRM-ATT-OVERVIEW-200` · idle=0 · errUI=false · PNG 01 «Đang xem năm 2026» | 🟢 **PASS** (not invent) |
| 5 | last-year refetch `year=2025` | status=200 · year=2025 · loaded=`Đang xem năm 2025` · idleAfterSwitch=0 · PNG 03 | 🟢 **PASS** (not invent) |
| 6 | loading/error/idle; no ERROR storm | pageErrors=0 · networkBad=[] · errorBannerStorm=false | 🟢 **PASS** |
| 7 | must_keep RECORDS + SETTINGS-EMP | records GET **200** `HRM-ATT-200` total=4 · settings Nhân viên table+CTA · mutate=0 · PNG 04/05 | 🟢 **PASS** (no regression) |
| 8 | NOT invent Attendance CLOSED / uat_done / Face LIVE | JSON + QA flags false · Face not claimed LIVE | 🟢 **PASS** (honesty) |
| 9 | PERIOD-SPEC_GAP + chart-subtitle OBS | residuals severity OBS · PNG 03 chart subtitle still `01/01/2026–31/12/2026` while Select=2025 | 🟡 **OBS only** (not NO-GO) · ba-process DISPATCHED |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| Matrix **C1** Overview year filter → GET `year=` → FE update (fidelity rows 1/4/5 filter honesty) | **In-scope** this gate (no dedicated J-* overview-year row in SoT) | **PASS** (browser Network + PNG) |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Related attendance shell; must_keep RECORDS spot only | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **untouched** (spot PASS, not re-certify full journey) |
| **J-HRM-06b** Bảng chấm công | Out of this seat | **prior ✅** · **untouched** |
| Attendance CLOSED / full STUB cluster / Face LIVE | Forbidden | **not claimed** |

Mandatory in-scope for this gate: C1 year-filter AC **PASS**. No invent PASS on untested mandatory J-* beyond this slice. Fidelity matrix C1 year wire is SoT for L2.5-equivalent (tab → year Select → Network refetch).

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | C1 Overview year Select LIVE — honesty year-only · GET `year=2026`/`year=2025` 200 `HRM-ATT-OVERVIEW-200` · idle0 · must_keep RECORDS+SETTINGS-EMP spot |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / OBS** | `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` (ba-process DISPATCHED) · `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` (dev-fe P2) · KPI card grain labels Hôm nay/Tuần này (payload field grains, not fake Select) · Phase1/UAT DONE · Attendance CLOSED · Face LIVE · prior GWC tabs |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote OVERVIEW-01 close. OBS residuals are **not** product NO-GO when year wire AC PASS and honesty documented.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| C1 Overview year Select + GET year=2026/2025 + idle0 + honesty | **CLOSED** this seat | — | — | No |
| must_keep RECORDS / SETTINGS-EMP spot | **CLOSED** this seat (no regression) | — | — | No |
| `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` | OPEN OBS | P2 | ba-process (`PO-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC-01` DISPATCHED) | No — honesty year-only OK |
| `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` | OPEN OBS | P2 | dev-fe | No — API year wire OK; subtitle lag on PNG 03 |
| `C-OVERVIEW01-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-* on next QA MD |
| RECORDS / SETTINGS / CLOCK / SHEETS / LEAVE / OT / REQUESTS / REPORTS prior GWC | **untouched** | — | — | No — not reopened |
| Phase1 / UAT DONE / Attendance CLOSED / Face LIVE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0/P1 FAIL** open for this **OVERVIEW-01** year-wire slice. Residuals = OBS / process P3 only.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent Face LIVE or day/week/month Nest period API.
4. PERIOD-SPEC_GAP + chart-subtitle stay **OBS** — ba-process already DISPATCHED; chart P2 optional; not overview NO-GO.
5. **Do not** reopen RECORDS / SETTINGS-EMP / CLOCK / SHEETS / LEAVE / OT / REQUESTS / REPORTS GWC without new FAIL evidence.
6. U65: **no seed** in acceptance path.
7. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 OVERVIEW-01 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md --check-assets
→ PASS exit 0 · 5 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check PNG under `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/` | **PASS** · 01–05 present |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-overview-01-browser.json` | **PASS** · verdict PASS · year=2026+2025 200 · honesty · idle0 · must_keep · pageErrors=[] · uat_done false |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/01-overview-this-year.png` | **PASS** · Năm nay (2026) · Đang xem năm 2026 · honesty period Nest · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/02-year-select-open.png` | **PASS** · only Năm nay (2026) / Năm trước (2025) |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/03-overview-last-year.png` | **PASS** · Năm trước (2025) · Đang xem năm 2025 · chart subtitle still 2026 = OBS |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/04-mustkeep-records.png` | **PASS** · Chấm công / records list LIVE · total 4 |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-overview-01/05-mustkeep-settings-emp.png` | **PASS** · Thiết lập → Nhân viên table + Lấy lại/Nhập khẩu |
| Matrix C1 year wire vs FE/QA | **PASS** · year LIVE + period SPEC_GAP honesty MATCH |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md --check-assets` | **PASS** exit **0** · 5 PNG OK |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health entry+exit | **PASS** | QA qc:fe-be-health · JSON l0 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** C1 overview this-year | LIVE · GET year=2026 200 | **PASS** | `HRM-ATT-OVERVIEW-200` · PNG 01 |
| **FILTER** year → last-year | GET year=2025 · FE label update · idle0 | **PASS** | PNG 03 · JSON yearSwitch |
| **READ** honesty year-only | no day/week/month Select | **PASS** | PNG 02 · optionCount=2 |
| **READ** must_keep RECORDS | GET records 200 | **PASS** | `HRM-ATT-200` · PNG 04 |
| **READ** must_keep SETTINGS-EMP | Nhân viên UI LIVE · no mutate | **PASS** | PNG 05 · mutate=0 |
| Matrix C1 L2.5-equivalent | tab→year Select→refetch | **PASS** | this seat |
| **J-HRM-06** | related shell | **prior ✅** | untouched this seat (spot only) |
| Attendance CLOSED / uat_done / Face LIVE | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent Face LIVE
- Did not invent day/week/month Nest period as LIVE
- Did not reopen RECORDS / SETTINGS / CLOCK / SHEETS / LEAVE / OT / REQUESTS / REPORTS GWC
- Did not NO-GO solely on OBS chart-subtitle or PERIOD-SPEC_GAP or QA pack format gap
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-OVERVIEW-01-QC** → **GO WITH CONDITIONS**. Matrix **C1** Overview year filter LIVE (Select honesty year-only · GET `year=2026` + `year=2025` **200** `HRM-ATT-OVERVIEW-200` · idle GET 0 · must_keep RECORDS + SETTINGS-EMP spot). Residuals OBS only: PERIOD-SPEC_GAP (ba-process DISPATCHED) · chart-subtitle year lag (dev-fe P2) · QA pack format P3. **uat_done false**. Attendance **not** CLOSED. Face **not** LIVE. U65 zero-seed. Prior GWC tabs **not** reopened.

**Open / residual owners:** `R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP` (ba-process OBS, already DISPATCHED); `OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR` (dev-fe P2); QA pack portal_url/J-* (`qa` P3). **No product P0/P1 FAIL** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-OVERVIEW-01-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-OVERVIEW-01 / QA / QC as GWC overview C1 year-wire slice only; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED; NOT Face LIVE.
2) Residuals stay OPEN as OBS only: R-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC_GAP (ba-process already DISPATCHED PO-MFD-M2-ATT-OVERVIEW-PERIOD-SPEC-01) · OBS-MFD-M2-ATT-OVERVIEW-CHART-SUBTITLE-YEAR (dev-fe P2) — do not invent period API LIVE / chart subtitle fixed.
3) Do NOT reopen RECORDS / SETTINGS-EMP / CLOCK / SHEETS / LEAVE / OT / REQUESTS / REPORTS GWC without new FAIL.
4) Next execution: await ba-process PERIOD-SPEC verdict OR dispatch next open P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix OR idle with explicit reason if no open P0 in MFD queue.
5) Optional P3: remind QA to include portal_url + J-* on next evidence MD (C-OVERVIEW01-QA-PACK-FMT-01).
6) Do NOT claim Attendance CLOSED from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-overview-01-qc.md`
