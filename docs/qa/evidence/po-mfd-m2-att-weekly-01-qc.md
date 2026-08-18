# Evidence — `PO-MFD-M2-ATT-WEEKLY-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-WEEKLY-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance **Chấm công tuần** (#14) + **Tổng hợp công** (#15) fidelity |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-weekly-01-qa.md`](po-mfd-m2-att-weekly-01-qa.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-weekly-01-browser.json`](_tmp-po-mfd-m2-att-weekly-01-browser.json) verdict **PASS** · `uat_done: false` · `attendance_closed: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/01-weekly-default.png` · `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/02-sheets-for-context.png` · `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/03-weekly-sheet-context.png` · `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/04-summary.png` · `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/05-final.png` |
| **spec_ref** | fidelity matrix C2 #14–15 · `HRM-ATTENDANCE_ENTERPRISE_API_MAP` C2 · `useWeeklyAttendanceSummary` → GET `/attendance/records` · **J-HRM-06** / **J-HRM-06b** shell prior |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · Face LIVE · dedicated summary/payroll aggregate API · `uat_done` remains **false** |
| **do_not_reopen** | SETTINGS-EMP #31 · RECORDS / REQUESTS / REPORTS / CLOCK / LEAVE / OT · Overview year GWC · CFG-COLUMNS ACCEPTED_AS_IS_P1 · SETTINGS mapping ACCEPTED_AS_IS_P1 — without new FAIL |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: Attendance **#14 Chấm công tuần** LIVE (menu week + sheet→weekly context) and **#15 Tổng hợp công** LIVE wire after QA `PO-MFD-M2-ATT-WEEKLY-01`. Browser + runtime prove (1) menu weekly shell `from_date=2026-08-03&to_date=2026-08-09` GET records **200** `HRM-ATT-200` · UI empty honesty «Không có dữ liệu» · storm10s=0 · no Sync ERROR, (2) sheet name `QA-SHEET-MFD-M2…` → weekly title + footer `(30/06/2026 - 06/07/2026)` · GET `2026-06-30..2026-07-06` **200** rowCount=0 honesty · storm8s=0, (3) summary menuitem → `viewMode=data` · GET records today grain `2026-08-04..2026-08-04` **200** rowCount=4 · storm0 · **same-as-records OBS** (no dedicated summary API). L0 entry+exit cited **PASS**. Residuals stay **OBS** (non-blocking). **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED · Face **not** LIVE. Did **not** reopen must_keep GWC tabs.

**Conditions:** OBS sheet-range + summary-same-as-records remain non-blocking · QA pack process gap (3/8) does not demote product close · **NOT** Phase 1 / UAT DONE · **NOT** Attendance CLOSED.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-weekly-01-qa.md` | PASS_TO_PM; #14 LIVE menu+sheet; #15 LIVE wire; storm0; L0 entry+exit; uat_done false; U65; must_keep not reopened | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-weekly-01-browser.json` | verdict PASS; recordsGets week/sheet/today 200 `HRM-ATT-200`; stormOk true ×3; pageErrors=[]; mutateCalls=[]; uat_done false; attendance_closed false; surfaces row14 LIVE · row14_sheet LIVE · row15 LIVE sameAsRecordsSurface | **ACCEPT** Network SoT |
| Screens (5) | weekly default · sheets list · sheet weekly · summary · final | **ACCEPT** visual spot — see command table PNG rows |

---

## Gate AC audit (narrow M2 WEEKLY-01)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | L0 entry+exit PASS | QA cites `qc:fe-be-health` entry+exit PASS · JSON `l0` hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | Login ceo@ · main · HDSD #14/#15 | `ceo@xe.vn` / `main` · menuitems «Chấm công tuần» / «Tổng hợp công» present | 🟢 **PASS** |
| 3 | #14 menu weekly LIVE · GET week range · empty honesty · storm0 · no ERROR | GET `2026-08-03..09` **200** `HRM-ATT-200` · emptyHonesty=true · storm10s=0 · syncError=false · PNG 01 «Không có dữ liệu» · footer (03/08–09/08) | 🟢 **PASS** |
| 4 | #14 sheet→weekly LIVE · empty honesty · storm0 | sheets=2 · open QA-SHEET-MFD-M2 · GET `2026-06-30..07-06` **200** rowCount=0 · storm8s=0 · PNG 02 list + PNG 03 title+week footer | 🟢 **PASS** |
| 5 | #15 summary LIVE wire · GET records · storm0 · no ERROR | GET `2026-08-04..04` **200** rowCount=4 · storm10s=0 · PNG 04/05 cards 4 Tổng số · no ERROR banner | 🟢 **PASS** (wire) |
| 6 | OBS same-as-records / sheet-range non-blocking | productNote sameAsRecordsSurface=true · rangeUsesSheetPeriod=false documented · residuals P2 OBS | 🟡 **OBS only** (not NO-GO) |
| 7 | must_keep GWC not reopened | QA + JSON no SETTINGS/REPORTS/REQUESTS/LEAVE/OT/CLOCK/RECORDS reopen · Overview year GWC untouched | 🟢 **PASS** |
| 8 | NOT invent Attendance CLOSED / uat_done / Face LIVE / Phase1 DONE | JSON + QA flags false · Face not claimed LIVE | 🟢 **PASS** (honesty) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| Matrix **C2 #14** Chấm công tuần menu + sheet→weekly | **In-scope** this gate (fidelity L2.5-equivalent) | **PASS** (browser Network + PNG 01/03) |
| Matrix **C2 #15** Tổng hợp công wire | **In-scope** wire LIVE; product aggregate OBS | **PASS wire** · OBS product |
| **J-HRM-06** Chấm công → bản ghi / yêu cầu | Related attendance shell | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **untouched** this seat |
| **J-HRM-06b** Bảng chấm công list→open weekly | Sheet open path exercised as #14b context (read-only; no create mutate) | **PASS this seat (read path)** · prior ✅ create journey **untouched** (U65 no seed/create) |
| Attendance CLOSED / Face LIVE / full STUB cluster | Forbidden | **not claimed** |

Mandatory in-scope for this gate: C2 #14 LIVE + #15 LIVE wire **PASS**. No invent PASS on untested mandatory J-* beyond this slice. Fidelity matrix C2 weekly/summary is SoT for L2.5-equivalent (menu → weekly grid / sheet context / summary → Network).

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #14 weekly menu LIVE · #14b sheet→weekly LIVE empty honesty · #15 summary LIVE wire (GET records today) · storm0 · no ERROR banner invent |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **3/8** (missing `portal_url`, `journey_l25`, `residual_section`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / OBS** | `OBS-MFD-M2-ATT-WEEKLY-SHEET-RANGE` (first-week window expected) · `OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS` (no dedicated summary API) · Phase1/UAT DONE · Attendance CLOSED · Face LIVE · must_keep prior GWC · CFG-COLUMNS / SETTINGS mapping ACCEPTED_AS_IS |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote WEEKLY-01 close. OBS residuals are **not** product NO-GO when #14/#15 wire AC PASS and honesty documented.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| #14 menu weekly LIVE + storm0 + empty honesty | **CLOSED** this seat | — | — | No |
| #14b sheet→weekly LIVE empty honesty | **CLOSED** this seat | — | — | No |
| #15 summary LIVE wire + storm0 | **CLOSED** this seat (wire) | — | — | No |
| `OBS-MFD-M2-ATT-WEEKLY-SHEET-RANGE` | OPEN OBS | P2 | — documented (expected `resolveWeeklyDateRange(sheet)`) | No |
| `OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS` | OPEN OBS | P2 | ba-process / backlog P2 | No — wire LIVE; product aggregate not invent |
| `C-WEEKLY01-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-* + ## Residual on next QA MD |
| SETTINGS-EMP / RECORDS / REQUESTS / REPORTS / CLOCK / LEAVE / OT / Overview year GWC | **untouched** | — | — | No — not reopened |
| CFG-COLUMNS / SETTINGS mapping ACCEPTED_AS_IS_P1 | **untouched** | — | — | No |
| Phase1 / UAT DONE / Attendance CLOSED / Face LIVE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0/P1 FAIL** open for this **WEEKLY-01** #14/#15 slice. Residuals = OBS / process P3 only.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent Face LIVE or dedicated payroll/summary aggregate API as LIVE.
4. OBS sheet-range + summary-same-as-records stay **OBS** — not weekly NO-GO.
5. **Do not** reopen SETTINGS-EMP #31 · RECORDS / REQUESTS / REPORTS / CLOCK / LEAVE / OT · Overview year GWC without new FAIL evidence.
6. U65: **no seed** in acceptance path.
7. QA pack format 3/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-weekly-01-qa.md
→ FAIL 3/8 — missing portal_url, journey_l25, residual_section
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 WEEKLY-01 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md --check-assets
→ PASS exit 0 · 5 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-weekly-01-qa.md` | **FAIL** exit **1** · **3/8** missing portal_url, journey_l25, residual_section (process) |
| Disk check PNG under `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/` | **PASS** · 01–05 present |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-weekly-01-browser.json` | **PASS** · verdict PASS · week/sheet/today records 200 `HRM-ATT-200` · stormOk · pageErrors=[] · mutate=[] · uat_done false |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/01-weekly-default.png` | **PASS** · week 03–09/08/2026 · «Không có dữ liệu» · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/02-sheets-for-context.png` | **PASS** · sheets list · QA-SHEET-MFD-M2 · total 2 · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/03-weekly-sheet-context.png` | **PASS** · sheet title · week footer 30/06–06/07 · empty honesty · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/04-summary.png` | **PASS** · Dữ liệu chấm công · date 04/08/2026 · 4 rows · no ERROR |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-weekly-01/05-final.png` | **PASS** · same summary surface · cards 4 Tổng số · no ERROR |
| Matrix C2 #14/#15 vs QA/JSON | **PASS** · #14 LIVE · #15 LIVE wire + OBS same-as-records MATCH |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md --check-assets` | **PASS** exit **0** · 5 PNG OK |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health entry+exit | **PASS** | QA qc:fe-be-health · JSON l0 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** #14 weekly menu | LIVE · GET week 200 · empty honesty · storm0 | **PASS** | `HRM-ATT-200` · PNG 01 |
| **READ** #14b sheet→weekly | LIVE · GET sheet-week 200 rowCount=0 · storm0 | **PASS** | PNG 02/03 · JSON row14_sheet_context |
| **READ** #15 summary wire | LIVE wire · GET today records 200 · storm0 | **PASS** | PNG 04/05 · sameAsRecordsSurface |
| Matrix C2 L2.5-equivalent | menu→weekly / sheet→weekly / summary→records | **PASS** | this seat |
| **J-HRM-06** | related shell | **prior ✅** | untouched this seat |
| **J-HRM-06b** | sheet open weekly read path | **PASS** (read) · create prior ✅ untouched | U65 no mutate |
| Attendance CLOSED / uat_done / Face LIVE | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent Face LIVE
- Did not invent dedicated summary/payroll aggregate API as LIVE
- Did not reopen SETTINGS-EMP / RECORDS / REQUESTS / REPORTS / CLOCK / LEAVE / OT / Overview year GWC
- Did not reopen CFG-COLUMNS / SETTINGS mapping ACCEPTED_AS_IS_P1
- Did not NO-GO solely on OBS sheet-range / same-as-records or QA pack format gap
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-WEEKLY-01-QC** → **GO WITH CONDITIONS**. Matrix **#14 LIVE** (menu week GET 200 + sheet→weekly empty honesty GET 200 rowCount=0 · storm0 · no ERROR). **#15 LIVE wire** (summary→records GET 200 today grain · storm0) + OBS same-as-records product. Residuals OBS only: SHEET-RANGE · SUMMARY-SAME-AS-RECORDS · QA pack format P3. **uat_done false**. Attendance **not** CLOSED. Face **not** LIVE. U65 zero-seed. must_keep GWC + prior ACCEPTED_AS_IS **not** reopened.

**Open / residual owners:** `OBS-MFD-M2-ATT-WEEKLY-SHEET-RANGE` (documented expected); `OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS` (ba-process P2); QA pack portal_url/J-*/Residual (`qa` P3). **No product P0/P1 FAIL** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-WEEKLY-01-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-WEEKLY-01 / QA / QC as GWC #14 LIVE + #15 LIVE wire slice only; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED; NOT Face LIVE.
2) Residuals stay OPEN as OBS only: OBS-MFD-M2-ATT-WEEKLY-SHEET-RANGE · OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS — do not invent dedicated summary API LIVE / full-month sheet week.
3) Do NOT reopen SETTINGS-EMP #31 · RECORDS / REQUESTS / REPORTS / CLOCK / LEAVE / OT · Overview year GWC · CFG-COLUMNS / SETTINGS mapping ACCEPTED_AS_IS without new FAIL.
4) Next execution: await DEVICE-RULES-01 SA verdict OR dispatch next open P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix OR idle with explicit reason if no open P0 in MFD queue.
5) Optional P3: remind QA to include portal_url + J-* + ## Residual on next evidence MD (C-WEEKLY01-QA-PACK-FMT-01).
6) Do NOT claim Attendance CLOSED from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-weekly-01-qc.md`
