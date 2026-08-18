# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01` **READY_FOR_QA** · closes Condition **R-PLT-ATT-OTC-03** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | `ATTCOMPQAFE-MSKBBEJW` |
| **stamp_l1 RETAIN** | **`ATTCOMPQA-MSKARXQU`** · invent → **400 `HRM-ATT-OT-COMP-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · admin Network POST ot-comp-types only if EFF=0 (this run) · invent API spot ≠ UF 🟢 |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `formula_LIVE=false` · OT-TYPE L1/`ATTOTQA-MSK8VETU` · OT-TYPE FE/`ATTOTQAFE-MSK9TJDM` · CODE/`ATTCODEQA-MSK4T1A5` · leave/`ATTLEAVEQA-MSJ7CPJH` · WS/`ATTWSQA-MSJC3IN9` · SHIFT/`ATTSHIFTQA-MSK5FXP3` · CTR/`CTRTPLQA-MSK7U4CG` · **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** — **R-PLT-ATT-OTC-03 CLOSABLE** |
| **condition_verify** | **R-PLT-ATT-OTC-03** → **CLOSABLE** (Nest compensation picker + Nest submit + F5/list proven) |
| **change_mode** | ADD verify · no `apps/**` · no seed · no ready flip · **FORBIDDEN** invent FE-ADMIN · **FORBIDDEN** reopen OT-TYPE L1/FE-01 |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest re-run | `useAttOtCompTypesEffective` **15** + `useAttOtTypesEffective` **17** = **32/32** exit **0** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01/` (01..07 png) |
| FE parent | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md`](po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md) READY_FOR_QA |
| L1 QA | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.md`](po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.md) stamp **`ATTCOMPQA-MSKARXQU`** |
| QC Condition | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md`](po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md) **R-PLT-ATT-OTC-03** |

**spec_ref:** AC-PLT-ATT-COMP-01 / 01c · VAL-ATT-COMP-CNS-01 · BA-01 · FE-01 Nest rebind OvertimeRequestTab compensation Select

**Seed:** none · **ensureDefault:** none · **FE-ADMIN invent:** **DENIED / HOLD**.

---

## 2. Click path (U65 · HDSD · R-PLT-ATT-OTC-03)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Nest OTC EFF baseline | **total=0** → admin Network **POST** ot-comp-types `qa_fe_otc_mskbbejw` **201** `HRM-ATT-OTC-201` (U65 ≠ seed) → EFF **total=1** |
| 2 | Invent API spot `zz_invent_att_otc_qafe_*` (full DTO) | **400 `HRM-ATT-OT-COMP-KEY`** · wrongKey=false · L1 stamp **RETAIN** |
| 3 | **Chấm công** → **Quản lý đơn** → **Đăng ký làm thêm** | `requests-menu-overtime` · `att-ot-precision` visible |
| 4 | GET `/attendance/ot-comp-types/effective` (FE hook) | **200** `HRM-ATT-OTC-200` (Network count≥1) |
| 5 | Open **Thêm đơn tăng ca** | `att-ot-add-dialog-precision` |
| 6 | Select «Hình thức bồi thường» `att-ot-comp-type-select` | Nest **nameVi** `QA FE OTC Nest mskbbejw` — **not** sole salary\|compensatory_leave SoT |
| 7 | Select «Loại tăng ca» `att-ot-type-select` **RETAIN** | Nest `QC spot OT (x1.5)` · code `qc_spot_ot_msk8` |
| 8 | Emp + date + reason → Thêm | Network **POST** body Nest **compensation_type**=`qa_fe_otc_mskbbejw` · **overtime_type**=`qc_spot_ot_msk8` |
| 9 | FE sau 2xx | **201** `HRM-OT-201` · list GET total 5→6 |
| 10 | F5 · re-nav OT tab | list GET **200** · row retained · no binary invent flag |
| 11 | Invent UI | Hard **Select-only** — no free-text invent (PASS_WITH_OBS OK) |
| 12 | EFF=0 branch | **NOTE_BLOCKED** — no wipe; cite FE-01 vitest 15 (bootstrap salary\|compensatory_leave) |
| 13 | FE-ADMIN | invent FE-ADMIN **HOLD_ABSENT_OK** |

**HDSD / testids:** `requests-menu-overtime` · `att-ot-precision` · `att-ot-add-dialog-precision` · `att-ot-comp-type-select` · `att-ot-type-select` · `att-ot-comp-type-bootstrap-hint` (hidden when EFF>0) · `att-ot-comp-type-detail`

**Screens:** `01-attendance` · `02-ot-tab` · `03-add-dialog` · `04-dialog-filled-nest` · `05-after-submit` · `06-f5-ot-tab` · `07-detail-comp`

---

## 3. UF-ATT-COMP-FE matrix (dispatch)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0** | stack 200 | 200/200/200 | 🟢 |
| **2 EFF>0 Select Nest nameVi** | GET ot-comp-types/effective 200 · options Nest | 200 `HRM-ATT-OTC-200` · option `QA FE OTC Nest mskbbejw` · onlyBoot=false · bootstrap hint hidden | 🟢 |
| **3 Submit Nest compensation** | POST overtime 2xx Nest code | **201** `HRM-OT-201` · `compensation_type=qa_fe_otc_mskbbejw` | 🟢 |
| **4 F5 / detail Nest nameVi** | not binary invent salary/time_off only | list GET 200 retain · binaryInvent=false · feShowsNest text soft WARN (list may omit nameVi column) | 🟢 / 🟡 OBS |
| **5 OT-TYPE picker RETAIN** | Nest ot-types still works | Select `QC spot OT (x1.5)` · GET ot-types/effective 200 · no reopen L1/FE | 🟢 |
| **6 Invent → KEY** | toast/Network 400 `HRM-ATT-OT-COMP-KEY` ≠ OT-TYPE-KEY | Select-only UI · API invent **400 KEY** · wrongKey=false | 🟢 / 🟡 Select-only OBS |
| **7 EFF=0 bootstrap** | soft salary\|compensatory_leave | **NOTE_BLOCKED** — EFF>0 after admin ensure · unit cite 32/32 | 🟡 documented |

---

## 4. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200/200/200 | 🟢 |
| **EFF>0 ensure** | active catalog via Network POST if needed OR existing | created N=1 `qa_fe_otc_mskbbejw` (baseline EFF=0) | 🟢 |
| **FE GET effective** | Network GET ot-comp-types/effective 200 | 200 `HRM-ATT-OTC-200` | 🟢 |
| **VAL-ATT-COMP-CNS-01 / AC-01** | EFF>0 Select Nest nameVi ≠ sole hardcode-2 | Nest nameVi visible · onlyBoot=false | 🟢 |
| **AC submit Nest** | Nest code in POST · 2xx · FE update | **201** · compensation_type Nest · OT type peer retain | 🟢 |
| **FE + F5** | row/detail retain Nest | list GET 200 · binaryInvent=false · nameVi list text soft WARN | 🟢 / 🟡 |
| **Invent UI** | free entry OR Select-only + L1 KEY | Select-only · API invent **400 KEY** | 🟡 PASS_WITH_OBS |
| **AC-PLT-ATT-COMP-01c** | EFF=0 bootstrap without wipe | **NOTE_BLOCKED** · unit cite FE-01 | 🟡 documented |
| **L1 KEY LIVE** | invent → 400 `HRM-ATT-OT-COMP-KEY` | confirmed this seat (full DTO re-probe) · stamp L1 RETAIN | 🟢 |
| **OT-TYPE RETAIN** | no regression / no reopen | Nest picker + `qc_spot_ot_msk8` submit | 🟢 |
| **FE-ADMIN** | HOLD / no invent panel | HOLD_ABSENT_OK | 🟢 |
| **01H honesty** | ready=false · formula false · C-SLICE | locked | 🟢 |
| **Console** | no Uncaught / mojibake / 5xx | pageErrors=0 · bad5xx=0 | 🟢 |

---

## 5. Key network stamps

```text
GET  /api/hrm/attendance/ot-comp-types/effective?company_id=main
  → 200 HRM-ATT-OTC-200  total=1  code=qa_fe_otc_mskbbejw  nameVi=QA FE OTC Nest mskbbejw

POST /api/hrm/attendance/ot-comp-types
  body: code=qa_fe_otc_mskbbejw · nameVi=QA FE OTC Nest mskbbejw
  → 201 HRM-ATT-OTC-201  (admin Network ensure · U65 ≠ seed)

POST /api/hrm/attendance/overtime-requests  invent zz_invent_att_otc_qafe_*
  → 400 HRM-ATT-OT-COMP-KEY  (LIVE this seat · L1 ATTCOMPQA-MSKARXQU RETAIN)
  msg: compensation_type not in effective OT compensation catalog (invent forbidden when EFF ≠ empty)
  wrongKey=false (≠ HRM-ATT-OT-TYPE-KEY)

GET  /api/hrm/attendance/ot-types/effective
  → 200 HRM-ATT-OT-200  total=1  code=qc_spot_ot_msk8  (OT-TYPE RETAIN)

POST /api/hrm/attendance/overtime-requests
  body: compensation_type=qa_fe_otc_mskbbejw · overtime_type=qc_spot_ot_msk8 · coefficient=1.5
  → 201 HRM-OT-201

GET  /api/hrm/attendance/overtime-requests?company_id=main (after F5)
  → 200  total=6 (was 5) · row retained
```

**DevTools confirm:** submit body uses Nest **compensation_type** code (not i18n-only salary/compensatory_leave as sole SoT when EFF>0).

**Picker snapshot:** compensation option text = Nest nameVi; OT-TYPE option = Nest nameVi + `(x1.5)` (RETAIN · ≠ payroll formula LIVE).

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **`formula_LIVE`** | **`false`** |
| L1 stamp `ATTCOMPQA-MSKARXQU` | **RETAIN** · KEY LIVE |
| OT-TYPE L1 `ATTOTQA-MSK8VETU` / FE `ATTOTQAFE-MSK9TJDM` | **RETAIN** · **DENIED** reopen |
| ATT-CODE / leave / WS / SHIFT / CTR | **SEAL RETAIN** |
| Invent FE-ADMIN panel | **DENIED / HOLD_ABSENT_OK** |
| Fold into `att_ot_type` | **DENIED** |
| Module ATT UAT / UF 🟢 whole ATT / Phase1 DONE | **DENIED** (`C-SLICE-≠-MODULE`) |
| Seed / `pnpm seed:*` | **none** |

---

## 7. Residual / OBS

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **Select-only invent UI** | P3 OBS | Expected — KEY proven via API invent when EFF>0 | QC ACCEPT |
| **EFF=0 bootstrap live** | P3 NOTE_BLOCKED | No wipe active Nest rows (U65); vitest 15 covers bootstrap | QC ACCEPT |
| **List nameVi text soft** | P3 OBS | feShowsNest=false on list text scan; Network POST body + list GET prove Nest code persist | QC ACCEPT |
| **R-PLT-ATT-OTC-03** | — | **CLOSABLE** this seat | **qc** narrow Condition close |

---

## 8. Handoff

- **completion_report:** Closed browser U65 UF-ATT-COMP-FE matrix for Nest compensation picker on OvertimeRequestTab. L0 200 · vitest **32/32** · EFF ensure admin Network (baseline 0→1) · Select Nest nameVi · POST **201** Nest `compensation_type` · OT-TYPE RETAIN · invent **400 `HRM-ATT-OT-COMP-KEY`** (≠ OT-TYPE-KEY) · F5 list retain · EFF=0 NOTE_BLOCKED · FE-ADMIN HOLD. Condition **R-PLT-ATT-OTC-03 CLOSABLE**. DENY seed / invent FE-ADMIN / reopen OT-TYPE / flip ready / formula LIVE / module ATT UAT. Stamp **`ATTCOMPQAFE-MSKBBEJW`**. overall **PASS_WITH_OBS**.
- **next_owner:** **qc**
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-FE-01
from_role: pm
to_role: qc
lane: governance

QA-FE-01 PASS_WITH_OBS stamp ATTCOMPQAFE-MSKBBEJW closed browser Nest compensation picker.
Closes QC Condition R-PLT-ATT-OTC-03 (narrow).
entry: L1 GWC RETAIN docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md · KEY ATTCOMPQA-MSKARXQU HRM-ATT-OT-COMP-KEY LIVE
       QA-FE evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md
       FE parent READY_FOR_QA closed · vitest 32/32 · U65 zero-seed
exit: GWC or GO_WITH_CONDITIONS · Condition R-PLT-ATT-OTC-03 CLOSED|CLOSABLE wording
      ACCEPT Select-only invent OBS + EFF=0 NOTE_BLOCKED
      RETAIN OT-TYPE L1/FE seals · invent FE-ADMIN HOLD
      DENY flip attendance_uat_ready / payroll_e2e_ready / formula LIVE / module ATT UAT / reopen OT-TYPE / invent FE-ADMIN / UF 🟢 whole ATT
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-fe-01.md
```

---

## 9. Footer

| Item | Value |
|------|-------|
| Stamp | `ATTCOMPQAFE-MSKBBEJW` |
| overall | **PASS_WITH_OBS** |
| ack_status | **PASS_TO_PM** |
| condition | **R-PLT-ATT-OTC-03 = CLOSABLE** |
| Length gate | WriteAllText NFD `.git` tree · expect ≥3KB |