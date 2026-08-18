# Evidence — PO-HRM-MVP-GD1-CORE-10-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-10) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE10QA1-MSLOTSWO` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-10` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · emp `0500220b-f289-40df-b07e-86316285439b` (UAT NV 0100 · holding) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · catalog≠DONE · enrollment CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · PAY-06 OUT · soft≠CORE-06 DONE · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 CONFIRMED RETAIN · BA-01 J-01..06 · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-10-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-10-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-10-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim catalog/CRUD/LIVE = CORE-10 DONE · **DENY** CORE-09/07/06 DONE · **DENY** invent PAY/ATT/printable/Word · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/employee-insurances` **404** |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` SI** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** · existing LIVE enrollments only (U65) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | AC-CORE-10-* · AC-SI-TL-01..05 · J-HRM-CORE-10-01..06 · O1–O12 |
| API-01 | F-CORE-SI-01/02/03 physical `/employee-insurances*` + `POST …/actions` · Nest `/core` DENY · DISP FE-derive |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-fe-01.md` READY |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN · **≠** CORE-09 DONE |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** conflate BH Hoạt động |
| CORE-06 QC | **`CORE06QC1-MSLID363`** soft≠DONE RETAIN |
| Peers | CORE-05/03/02b/09d..01 stamps RETAIN · **not reopened** |
| PAY AC-SI-TL-06 | **OUT invent DONE** |

---

## Browser U65 — journeys (BA SoT)

Persona: portal auth inject · Profile `/hr/employees/{id}?tab=insurance` · **zero-seed**.

**hdsd_align:** `hdsd-insurance-enrollments-root` · `hdsd-insurance-timeline-root` · `hdsd-insurance-action-{close\|stop\|suspend\|change_rate\|resume}-{id}` · `hdsd-insurance-action-submit` · `hdsd-insurance-periods-list` · `si-core10-honesty`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-10-01** | Profile BH load | **GET** `/api/hrm/employee-insurances?company_id=main&employee_id=…` **200** · badge **Hoạt động** · periods `Đang áp dụng` · dates `dd/MM/yyyy` · Nest `/core` **0** · honesty footer | **PASS** |
| **J-HRM-CORE-10-02** | **Đóng** + ngày → Lưu → F5 | **POST** `…/actions` `action=close` → **201** `HRM-EINS-200` · badge **Đóng** · periods 4→5 · Nest 0 | **PASS** |
| **J-HRM-CORE-10-03** | **Ngừng** on secondary enrollment → F5 | **POST** `stop` → **201** `HRM-EINS-200` · badge **Ngừng** · periods append · **≠** DELETE-only · Nest 0 | **PASS** |
| **J-HRM-CORE-10-04** | (Neg) Tạm hoãn thiếu căn cứ · (Pos) + căn cứ → F5 | Neg: FE toast «Tạm hoãn cần nhập lý do» **no POST** + force **400** `HRM-SI-ACTION-400` · Pos: **201** suspend · badge **Tạm hoãn** · periods 2→3 · căn cứ persisted | **PASS** |
| **J-HRM-CORE-10-05** | **Đổi mức** NV/DN → Lưu → F5 | **POST** `change_rate` → **201** · periods 1→2 · amounts `1.350.000` / `2.700.000` vi-VN · prior kept · Nest 0 | **PASS** |
| **J-HRM-CORE-10-06** | **Resume** → F5 + seals | **POST** `resume` → **201** · badge **Hoạt động** (= enrollment active ≠ CORE-07) · periods 3→4 · honesty catalog/CRUD/LIVE≠DONE · printable false · PAY-06 OUT · CORE-09/07 RETAIN · soft≠CORE-06 DONE · Nest 0 | **PASS** |

Screens: `01-insurance-tab` … `08-done`.

**Enrollment fixtures (LIVE, no seed):**
- Primary `ffc4aac1-889b-46ff-bb7f-7305e968a29c` — change_rate → suspend → resume → close
- Secondary `816b4c5c-89a3-4ed0-b901-e18fb77fb8f2` — stop

---

## AC map

| AC | Result |
|----|--------|
| **AC-CORE-10-01/LOAD** physical GET · Nest `/core` 0 | **PASS** |
| **AC-SI-TL-01 / CLOSE** close 201 + F5 history | **PASS** |
| **AC-SI-TL-02 / STOP** stop 201 · ≠ DELETE | **PASS** |
| **AC-SI-TL-03 / SUSPEND** thiếu → 400 ACTION-400 · đủ → 201 | **PASS** |
| **AC-SI-TL-04 / RATE** change_rate append · prior kept | **PASS** |
| **AC-SI-TL-05 / F5** prior+new periods | **PASS** |
| **AC-CORE-10-RESUME** enrollment Hoạt động ≠ CORE-07 | **PASS** |
| **AC-CORE-10-DISP** statusLabelVi · dd/MM/yyyy · vi-VN | **PASS** |
| **AC-CORE-10-≠-CAT/ENR/LIVE-DONE** | **PASS** — footer |
| **AC-CORE-10-PAY-06-OUT** | **PASS** — footer cite |
| **AC-CORE-10-MK-09/07/06** | **PASS** — seals RETAIN · printable false · soft≠DONE |
| **Nest `/core` DENY** | **PASS** |
| **Honesty / C-SLICE** | **PASS** (false · no flip · **≠** claim CORE-10 DONE) |

---

## Network summary

| Metric | Value |
|--------|-------|
| `/employee-insurances*` hits | 145 (list/get + actions) |
| `POST …/actions` 2xx | 5 (change_rate · suspend · resume · close · stop) |
| Nest `/core` SI SoT non-404 | **0** |
| Suspend neg force | **400** `HRM-SI-ACTION-400` |
| Console | expected 400 Bad Request on suspend-neg probe only |

---

## Residuals / OBS

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-10-HONESTY** | INFO | **qc** | C-SLICE · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · printable false · PAY-06 OUT · CORE-09/07 RETAIN · soft≠CORE-06 DONE · **DENY** claim CORE-10 DONE |
| **R-CORE-10-PERIOD-BOUNDS** | **P2 OBS** | optional BE | After change_rate, prior open period closed with `effective_to` same calendar day as new `effective_from` (UI showed `09/08/2026 → 08/08/2026` on one closed row) — append-only history still PASS; not P0 for this seat |

**Ops:** L0 healthy at entry — no rebuild required.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR / SI module UAT = false
C-SLICE ≠ module CORE/SI UAT
U65 zero-seed · Nest /core SI dual DENY
DENY claim catalog / enrollment CRUD / LIVE actions = CORE-10 DONE
DENY invent PAY / ATT / printable / Word DONE
DENY conflate BH Hoạt động ↔ CORE-07 activate
DENY claim CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE
CORE-09 printable false RETAIN (CORE09QC1-MSLNBA89)
CORE-07 GATE/ACT RETAIN (CORE07QC1-KZJTSHNT)
CORE-06 soft≠DONE RETAIN (CORE06QC1-MSLID363)
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-CORE-10-01..06 **all PASS** · stamp **`CORE10QA1-MSLOTSWO`** · Network physical `/employee-insurances*` + `/actions` only · Nest `/core` SI **0** · suspend thiếu căn cứ → FE block + **400** `HRM-SI-ACTION-400` · close/stop/suspend/change_rate/resume **201** + F5 append-only · statusLabelVi VI · dd/MM/yyyy · vi-VN amounts · honesty footers ≠DONE · must_keep CORE-09/07/06 · **≠** claim CORE-10 module DONE · P2 OBS period bounds optional |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qa-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-10-CLUSTER-QC-01
role: qc
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qa-01.md stamp CORE10QA1-MSLOTSWO · FE-01 READY · API-01 CONFIRMED RETAIN · U65 zero-seed evidence
exit_criteria: GWC C-SLICE only (≠ module SI/CORE/personnel UAT) · audit J-HRM-CORE-10-01..06 PASS · Network /employee-insurances* + /actions only · Nest /core SI = 0 · suspend ACTION-400 · F5 append-only · statusLabelVi · dd/MM/yyyy · vi-VN · honesty catalog≠DONE · enrollment CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · printable false · PAY AC-SI-TL-06 OUT · must_keep CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · no reopen sealed J-* · DENY claim CORE-10 DONE · stamp CORE10QC1-…
must_keep: CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE
cấm: seed · Nest /core SI SoT · claim catalog/CRUD/LIVE = CORE-10 DONE · invent PAY/ATT/printable/Word DONE · conflate BH↔CORE-07 · honesty flip · reopen sealed J-*
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qc-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md
```

---

*End QA-01 · stamp CORE10QA1-MSLOTSWO · PASS_TO_PM · C-SLICE · Nest /core DENY · no seed.*
