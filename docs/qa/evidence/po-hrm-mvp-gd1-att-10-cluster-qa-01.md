# Evidence — PO-HRM-MVP-GD1-ATT-10-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-28 · UC-BP-ATT-10) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT10QA1-MSLWCDX2` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_RESIDUAL** (R-ATT-10-DISP · lines[] ABSENT) |
| **uc_ids** | `UC-BP-ATT-10` · `FR-UC-BP-ATT-10` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY second ledger · HOL/MEAL OUT · Nest `/core` DENY · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 RETAIN · BA J-* · DATA HOLD · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Dev-BE HOLD invent |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-10-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-10-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-10-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS_WITH_RESIDUAL** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim AGG=ATT-10 DONE · **DENY** ATT-11/PAY DONE · **DENY** soft/ATT-08=ATT-09 DONE · **DENY** ATT module UAT · **DENY** CFG=ATT-02 DONE · **DENY** invent PAY/printable/HOL/MEAL · **DENY** invent `att_leave_hold` · **DENY** seed · **DENY** honesty flip |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/attendance/attendance-sheets` **404** |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS_WITH_RESIDUAL** · **J-04 PASS_WITH_RESIDUAL** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` AGG** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (U65) |

**Explicit ≠ ATT-10 module UAT** · printable **false** · **C-SLICE** · **PAY OUT**.

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md` J-HRM-ATT-10-01..06 · AC-ATT-10-* · O1–O12 |
| API-01 | F-ATT-SHEET-01/AGG `POST …/attendance-sheets/{id}/aggregate` · submit MUST AGG · Nest `/core` DENY |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md` READY · R-ATT-10-DISP residual note |
| ATT-09 QC | **`ATT09QC1-MSLUTL9D`** RETAIN · DENY `att_leave_hold` · ≠ soft/ATT-08=ATT-09 DONE |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠ATT-02 DONE |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** RETAIN |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** RETAIN |
| soft≠CORE-06 | must_keep |
| PAY / ATT-11 | **OUT invent DONE** |

---

## Browser U65 — journeys (U63 template)

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Bảng chấm công** · sheet `QA-ATT-10-CLUSTER-01` (`2d1a688e-…`) · **zero-seed**.

**hdsd_align:** `att-sheets-precision` · `att-sheet-aggregate-draft` · `att-sheet-submit` · `att-10-agg-display` · `att-10-line-count` · `att-10-disp-residual` · `att-10-hol-meal-footer` · `att-10-honesty` · `att-sign-panel`.

### UF / J-HRM-ATT-10-01 — AGG · line_count SoT

- Persona / URL / click path: `ceo@xe.vn` → Chấm công → Bảng công → chọn kỳ draft → **Tổng hợp kỳ** (`att-sheet-aggregate-draft`)
- Trước mutate: draft panel visible
- Action: click Tổng hợp kỳ
- Network: **POST** `/api/hrm/attendance/attendance-sheets/{id}/aggregate` → **201** `HRM-AS-200` · `line_count=4` · `warnings=[]` · Nest `/core` **0**
- **FE sau 2xx:** `att-10-agg-display` · sheet_id · statusLabelVi Nháp · Dòng công: 4 · HOL/MEAL footer OUT · honesty ≠ AGG alone DONE · `att-10-disp-residual` (lines[] ABSENT)
- F5: (covered J-02/J-06)
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-10-LOAD/AGG/FUNNEL/FOOTER/PATH/≠-AGG-DONE

### UF / J-HRM-ATT-10-02 — Submit MUST AGG · F5

- Click path: **Gửi chờ ký** (`att-sheet-submit`)
- Network: **POST** `…/submit` → **201** `HRM-AS-200` · `status=submitted` · `line_count=4` · Nest `/core` **0**
- **FE sau 2xx:** sign panel · status Chờ ký · line_count SoT
- F5: API status **submitted** · panel còn · ≠ ATT-11 DONE honesty
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-10-SUBMIT/F5/≠-11

### UF / J-HRM-ATT-10-03 — OT weighted · FAIL raw

- Assert: LIVE AGG/submit body keys `sheet_id,status,line_count,warnings` — **no `lines[]`**
- FE residual `R-ATT-10-DISP` honest · cannot browser-assert OT×coef vs raw in table
- Nest `/core` **0** · ≠ invent second ledger
- Verdict: **🟡 PASS_WITH_RESIDUAL** (`R-ATT-10-DISP`)
- spec_ref: AC-ATT-10-OT/FAIL-RAW-OT · residual DISP

### UF / J-HRM-ATT-10-04 — Payable gold

- Assert: lines[] ABSENT → gold table N/A · FE does **not** invent rows
- unpaid/penalty display N/A until lines[] · DENY `att_leave_hold` · cite ATT-09 must_keep
- Nest `/core` **0**
- Verdict: **🟡 PASS_WITH_RESIDUAL** (`R-ATT-10-DISP`)
- spec_ref: AC-ATT-10-PAYABLE/GOLD/LEAVE/MK-ATT09

### UF / J-HRM-ATT-10-05 — Warnings + closed 409

- warnings[] envelope **PRESENT** (empty `[]` OK on this sheet — no punch-miss sample)
- Closed sheet AGG probe → **409** `HRM-ATT-SHEET-LOCKED` («Cannot aggregate a closed attendance sheet»)
- Nest `/core` **0** · ≠ invent ATT-11 block DONE
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-10-WARN/LOCKED/≠-11

### UF / J-HRM-ATT-10-06 — F5 + honesty seals

- Honesty banner visible · seals: ≠AGG-DONE · ≠ATT-11/PAY · ≠soft/ATT-08=ATT-09 · ≠ATT UAT · CFG≠ATT-02 (`ATT02QC1-MSLQZUK7`) · ATT09/08 stamps · DENY `att_leave_hold` · Nest `/core` DENY · PAY OUT · printable false · C-SLICE · HOL/MEAL OUT
- Nest `/core` non-404 **0**
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-10-F5/≠-*/H/MK-*

Screens: `01-sheets-list` … `08-j06-honesty`.

---

## Network summary

| Metric | Value |
|--------|--------|
| `POST …/aggregate` 2xx | **2** (draft AGG + post-submit AGG on panel) |
| `POST …/submit` 2xx | **1** · **201** |
| AGG gold sample | `line_count=4` · `warnings=[]` · **no lines[]** |
| Closed AGG | **409** `HRM-ATT-SHEET-LOCKED` |
| Nest `/core` AGG SoT non-404 | **0** |
| Seed | **none** |

---

## Residuals / OBS

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-10-DISP** | **P2** | optional **be** (thin GET lines[] **ONLY if** closable) | LIVE AGG/submit returns `{sheet_id,status,line_count,warnings}` without `lines[]` · FE residual honest · gold/OT UI N/A · **≠** invent rows · Dev-BE HOLD default |
| **R-ATT-10-HONESTY** | INFO | **qc** | C-SLICE · ≠ ATT-10 DONE · ≠ AGG=FR-10 · ≠ ATT-11/PAY · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · DENY `att_leave_hold` · HOL/MEAL OUT · must_keep seals |
| HOL/MEAL/−penalty | OUT GĐ1 | — | footer OUT RETAIN |
| ATT-11 / PAY | OUT invent DONE | — | QUEUED peers |

**Ops:** L0 restored mid-wave (portal+APIs) · no seed · no honesty flip · no claim module UAT.

---

## Honesty footer

```text
attendance_uat_ready=false
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
≠ AGG alone = ATT-10 DONE
≠ ATT-11 / PAY DONE
≠ soft / ATT-08 = ATT-09 DONE
≠ ATT module UAT
CFG ≠ ATT-02 DONE
printable false RETAIN
PAY OUT invent DONE
HOL/MEAL OUT GĐ1
C-SLICE ≠ ATT module UAT
U65 zero-seed · Nest /core AGG dual DENY
DENY invent att_leave_hold · DENY second hour ledger
must_keep ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-ATT-10-01..06 **PASS / PASS_WITH_RESIDUAL** · stamp **`ATT10QA1-MSLWCDX2`** · POST aggregate **201** `line_count=4` · submit **201** MUST AGG · F5 submitted · closed AGG **409** `HRM-ATT-SHEET-LOCKED` · Nest `/core` **0** · honesty seals RETAIN · **R-ATT-10-DISP** (lines[] ABSENT · FE honest · optional thin BE) · **≠** claim AGG=ATT-10 DONE · **≠** ATT UAT · printable false · C-SLICE · PAY OUT · must_keep ATT-09/08/02/PLT/CORE |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qa-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-10-CLUSTER-QC-01
role: qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-28)
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qa-01.md · stamp ATT10QA1-MSLWCDX2 · L0 stack
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md
exit_criteria:
  - GWC C-SLICE only — audit J-HRM-ATT-10-01..06 evidence (J-01/02/05/06 PASS · J-03/04 PASS_WITH_RESIDUAL R-ATT-10-DISP)
  - Explicit ≠ ATT-10 module UAT · ≠ AGG alone = ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · DENY att_leave_hold · Nest /core DENY · HOL/MEAL OUT
  - must_keep ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qc-01.md
  - ack_status PASS_TO_PM · residual R-ATT-10-DISP optional BE thin GET (HOLD invent default)
cấm: claim ATT UAT · honesty flip · invent lines[] DONE · invent PAY/printable/HOL/MEAL/ATT-11 DONE · wipe peer seals · seed
```

---

*End QA-01 · ATT10QA1-MSLWCDX2 · 2026-08-09*
