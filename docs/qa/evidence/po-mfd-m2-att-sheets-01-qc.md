# Evidence — `PO-MFD-M2-ATT-SHEETS-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SHEETS-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 Attendance Bảng công / sheets fidelity (#11–12 + payroll period SoT) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-sheets-01-qa.md`](po-mfd-m2-att-sheets-01-qa.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-mfd-m2-att-sheets-01-browser.json`](_tmp-po-mfd-m2-att-sheets-01-browser.json) verdict **PASS** · `uat_done: false` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/01-sheets-list.png` · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/02-add-sheet-modal.png` · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/03-add-sheet-filled.png` · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/04-after-create.png` · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/05-after-f5.png` · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/06-sheet-grid.png` · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/07-payroll-period.png` |
| **spec_ref** | HRM-AT-14 · matrix #11–12 LIVE · UF-HRM-16 · **J-HRM-06b** · TC-HRM-AT-14-SHEET-* · M2 backlog sheets |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · columns CFG mutate PASS · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: Attendance **Bảng chấm công** (#11–12) after QA `PO-MFD-M2-ATT-SHEETS-01`. Browser + runtime prove (1) list **LIVE** (title + GET `attendance-sheets` **200** `HRM-AS-200` · storm sheets/records GET **0**/10s · no Sync ERROR), (2) create **LIVE** (POST **201** `HRM-AS-201` · toast · row · **F5** persist), (3) weekly grid **LIVE** empty honesty (records GET **200** · «Không có dữ liệu» · spinner **0**), (4) Payroll → Dữ liệu tính lương → Chấm công shows **same sheet name + period** SoT (**LIVE**). Empty-list honesty pre-create documented by QA first probe; confirm JSON is post-create (rows ≥1) — not fake-empty. Payroll CTA raw key `common.addNew` + columns HARDCODED = **OBS/CONDITION only** (no sheet AC regression). **NOT** Phase 1 / UAT DONE · Attendance **not** CLOSED.

**Conditions:** QA pack process gap (2/8) does not demote product close · Columns CFG / HARDCODED backlog remains open P1 · payroll i18n OBS P2 · duplicate July rows from re-run seats OBS under U65 · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-sheets-01-qa.md` | PASS_TO_PM; #11–12 LIVE; create 201 + F5; payroll SoT; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-sheets-01-browser.json` | verdict PASS; storm ok; POST 201 HRM-AS-201 id `3934591a-…`; f5.rowAfterF5; payrollSeesSheet+Period; pageErrors=[]; uat_done false | **ACCEPT** Network SoT |
| Screens (7) | list · modal · filled · create toast · F5 · grid · payroll | **ACCEPT** visual spot — see command table PNG rows |
| Matrix fidelity #11–12 | stamped LIVE (`HRM-ATTENDANCE_FIDELITY_MATRIX.md`) | **ACCEPT** (slice stamp only — not Attendance CLOSED) |

---

## Gate AC audit (narrow M2 SHEETS-01)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | #11 list LIVE · GET 200 · no Sync ERROR · no GET storm | `list.runtime=LIVE` · GET **200** `HRM-AS-200` · `syncError=false` · `storm10s.sheetGets=0` · `recordsGets=0` · `pageErrors=[]` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/01-sheets-list.png` (title «Bảng chấm công chi tiết» + row) | 🟢 **PASS** |
| 2 | #11b empty honesty (pre-create) | QA first probe: total/hint **0** + empty copy «Chưa có bảng…»; confirm JSON post-create `emptyCopy=false` / rows≥1 — Network SoT over re-run density | 🟢 **PASS** (honesty; U65) |
| 3 | #12 create LIVE · POST 201 · F5 | `create.posts[0]` **201** `HRM-AS-201` · `rowAfterCreate=true` · `f5.rowAfterF5=true` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/04-after-create.png` toast «Đã tạo bảng chấm công mới» · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/05-after-f5.png` | 🟢 **PASS** |
| 4 | Grid LIVE · empty OK · no storm | `grid.runtime=LIVE` · weekly title · `errorBanner=false` · `spinnerCount=0` · records GET **200** · PNG `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/06-sheet-grid.png` «Không có dữ liệu» | 🟢 **PASS** |
| 5 | Payroll period SoT LIVE | `payroll.runtime=LIVE` · `payrollSeesSheet=true` · `payrollSeesPeriod=true` · GET sheets **200** `HRM-AS-200` · PNG `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/07-payroll-period.png` same name + `01/07/2026 - 31/07/2026` | 🟢 **PASS** |
| 6 | Columns HARDCODED / payroll `common.addNew` | No sheet AC fail; i18n raw key visible on payroll CTA; columns CFG out of seat | 🟡 **OBS/CONDITION** (not NO-GO) |
| 7 | No invent Attendance CLOSED / uat_done | JSON + QA `uat_done: false` | 🟢 **PASS** (honesty) |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-HRM-06b** Bảng chấm công tạo → list → mở lưới (+ payroll consumer SoT) | **In-scope** this gate | **PASS** (browser create/F5/grid/payroll) |
| **J-HRM-06** attendance records / requests | Related; not re-certified this seat | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **untouched** |
| UF-HRM-16 Dev8088 prior promote | Prior ✅ 2026-07-21 | **must_keep**; this seat = M2 fidelity reconfirm local `:5173` |
| Attendance CLOSED / full STUB cluster | Forbidden | **not claimed** |

Mandatory in-scope for this gate: J-HRM-06b sheet AC **PASS**. No untested mandatory J-* claimed PASS beyond this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #11 list LIVE + storm-free · #12 create 201+F5 · grid empty honesty · payroll period SoT binding LIVE |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing `portal_url`, `journey_l25`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA L0 entry+exit `qc:fe-be-health` PASS; browser JSON l0 hrm/xbos/portal **200** |
| **OUT-OF-SCOPE / CONDITION** | Columns HARDCODED / CFG mutate (P1 backlog) · payroll `common.addNew` i18n P2 · duplicate July QA rows from re-run seats (U65 OBS) · Phase1/UAT DONE · Attendance CLOSED |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote SHEETS-01 close. Columns HARDCODED + payroll i18n are **not** product NO-GO when sheet AC PASS.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| #11–12 sheets list/create/F5/grid + payroll SoT | **CLOSED** this seat | — | — | No |
| `R-MFD-M2-ATT-SHEETS-PAYROLL-I18N` (`common.addNew`) | OPEN OBS | P2 | dev-fe | No — no sheet AC regression |
| Columns HARDCODED / CFG columns (P1-6) | OPEN backlog | P1 | ba / dev | No — OOS this seat; CONDITION |
| Duplicate July sheet rows (first + confirm seat) | OBS | P3 | — | No — U65 re-run density |
| `C-SHEETS01-QA-PACK-FMT-01` | OPEN process | P3 | qa | No — add portal_url + J-* on next QA MD |
| Phase1 / UAT DONE / Attendance CLOSED | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this **SHEETS-01** fidelity slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** stamp Attendance menu **CLOSED** or flip `uat_done` true.
3. **Do not** invent columns CFG mutate / HARDCODED closure — remains P1 CONDITION.
4. Payroll `common.addNew` remains **OBS P2** — optional FE i18n; not sheet NO-GO.
5. **Do not** promote Face / roster GĐ2 / leave L2 / OT from this seat.
6. U65: **no seed** in acceptance path.
7. QA pack format 2/8 remains **CONDITION (process)** — not product NO-GO.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-sheets-01-qa.md
→ FAIL 2/8 — missing portal_url, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 SHEETS-01 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-sheets-01-qa.md` | **FAIL** exit **1** · **2/8** missing portal_url, journey_l25 (process) |
| Disk check 7 PNG under `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/` | **PASS** · 01..07 present (53515…67295 bytes) |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-sheets-01-browser.json` | **PASS** · verdict PASS · POST 201 HRM-AS-201 · storm0 · f5 · payroll LIVE · pageErrors=[] · uat_done false |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/01-sheets-list.png | **PASS** · LIVE list title + July period row |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/04-after-create.png | **PASS** · toast success + row |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/05-after-f5.png | **PASS** · persist after reload |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/06-sheet-grid.png | **PASS** · weekly shell · empty honesty |
| Spot visual docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/07-payroll-period.png | **PASS** · same sheet/period · CTA common.addNew OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 hrm/xbos/portal 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser login http 201 |
| **READ** #11 sheets list | LIVE · GET 200 · no storm | **PASS** | HRM-AS-200 · storm0 · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/01-sheets-list.png` |
| **CREATE** #12 sheet | POST 201 · toast · row | **PASS** | HRM-AS-201 · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/04-after-create.png` |
| **F5** persist | row remains | **PASS** | f5.rowAfterF5 · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/05-after-f5.png` |
| **READ** weekly grid | empty OK · records 200 | **PASS** | grid LIVE · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/06-sheet-grid.png` |
| **READ** payroll SoT | same name + period | **PASS** | payrollSees* · `docs/qa/evidence/screens/po-mfd-m2-att-sheets-01/07-payroll-period.png` |
| **J-HRM-06b** L2.5 | create→list→grid (+payroll) | **PASS** | this seat |
| Columns HARDCODED mutate | Forbidden invent PASS | **CONDITION** | P1 backlog |
| Attendance CLOSED / uat_done | Forbidden | **not claimed** | uat_done false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Attendance CLOSED
- Did not invent columns CFG / HARDCODED closure
- Did not NO-GO solely on payroll `common.addNew` or QA pack format gap
- Did not GO without opening QA MD + runtime JSON + PNG spot-check

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-SHEETS-01-QC** → **GO WITH CONDITIONS**. #11 list LIVE (GET 200 HRM-AS-200 · storm 0 · empty honesty pre-create documented); #12 create LIVE (POST 201 HRM-AS-201 · F5); grid LIVE empty honesty; payroll period SoT LIVE. Residuals: payroll i18n OBS P2 · columns HARDCODED CONDITION P1 · QA pack format P3. **uat_done false**. Attendance **not** CLOSED. U65 zero-seed.

**Open / residual owners:** `R-MFD-M2-ATT-SHEETS-PAYROLL-I18N` (dev-fe P2); columns HARDCODED backlog (ba/dev P1); QA pack portal_url/J-* (`qa` P3). **No product P0** on this seat.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-SHEETS-01-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-SHEETS-01 / QA / QC as GWC sheets #11–12 + payroll period SoT slice only; J-HRM-06b PASS this seat; uat_done false; NOT Phase1/UAT DONE; NOT Attendance CLOSED.
2) Residuals stay OPEN as OBS/CONDITION only: R-MFD-M2-ATT-SHEETS-PAYROLL-I18N (P2) · columns HARDCODED (P1 backlog) — do not invent PASS.
3) Next execution: dispatch next open P0/P1 from HRM-ATTENDANCE_M2_BACKLOG / fidelity matrix OR idle with explicit reason if no open P0 in MFD queue.
4) Optional P3: remind QA to include portal_url + J-HRM-06b on next evidence MD (C-SHEETS01-QA-PACK-FMT-01).
5) Do NOT claim Attendance CLOSED from this GWC.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-sheets-01-qc.md`
