# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-03` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution — **narrow EMPTY-DATE Condition close** only |
| **prior** | BE-03 **READY_FOR_QA** · QC-02 GWC Condition **OBS-PLT-SI-INS-EMPTY-DATE** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Stamp** | **`SIINSQA3-MSJBDWZ5`** |
| **U65** | zero-seed · API spot (dispatch allows Browser or API) · L1 probe ≠ 🟢 UF |
| **Retain** | L1 **`SIINSQA-MSJA2Z7H`** · QC-01 GWC L1 · QC-02 FE enrollment SEAL **`SIINSQA2R2-MSJB0DY7`** · CTR · EMP-BE-02 ONE SoT · DTO-ISIN · invent KEY · **R-PLT-SI-INS-03 CLOSED** — **NOT reopened** |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · **DENY** module SI/CTR UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** — empty `""` dates → **400 `HRM-VAL-001`** (not 500 `HRM-SYS-001`); retain open 201 + invent KEY |
| **change_mode** | ADD verify · no `apps/**` · no seed · no ready flip · no L1/QC-02 seal reopen |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.json` |
| Git HEAD | `dc930c5` |
| Seed | **none** |
| Open key (prior R2) | `hr_si_cat_msjb0dy7` ∈ EFF (count=9) |

**spec_ref:** BE-03 · QC-02 Condition EMPTY-DATE · BA-01 AC-PLT-SI-INS-01-ENROLLMENT / 01b

---

## 2. AC stamp table (narrow + retain)

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200 | 🟢 |
| **OBS-PLT-SI-INS-EMPTY-DATE** both `""` | **400 `HRM-VAL-001`** not 500 SYS | **400** `HRM-VAL-001` · `start_date`/`end_date` must be valid ISO 8601 | 🟢 **CLOSED** |
| **OBS empty start only** | 400 VAL-001 | **400** `HRM-VAL-001` · start_date ISO | 🟢 |
| **OBS empty end only** | 400 VAL-001 | **400** `HRM-VAL-001` · end_date ISO | 🟢 |
| **AC-PLT-SI-INS-01-ENROLLMENT RETAIN** | Open key ∈ EFF + valid dates → **201** | `hr_si_cat_msjb0dy7` → **201 `HRM-EINS-201`** | 🟢 **RETAIN** |
| **AC-PLT-SI-INS-01b-ENROLLMENT RETAIN** | Invent ∉ EFF → **400 `HRM-INS-TYPE-KEY`** | `zz_invent_si_msjbdwz5` → **400 `HRM-INS-TYPE-KEY`** | 🟢 **RETAIN** |
| **DTO-ISIN / L1 / QC-02** | Not reopen | Explicit RETAIN | 🟢 |
| **AC-PLT-SI-INS-01H** | Honesty / C-SLICE | false · DENY UAT | 🟢 |

---

## 3. Network stamps (API)

```text
POST /api/hrm/employee-insurances  start_date="" end_date=""
  → 400 HRM-VAL-001  "start_date must be a valid ISO 8601 date string; end_date must be a valid ISO 8601 date string"
POST /api/hrm/employee-insurances  start_date="" end_date=2026-12-31
  → 400 HRM-VAL-001  "start_date must be a valid ISO 8601 date string"
POST /api/hrm/employee-insurances  start_date=2026-08-01 end_date=""
  → 400 HRM-VAL-001  "end_date must be a valid ISO 8601 date string"
POST /api/hrm/employee-insurances  type=zz_invent_si_msjbdwz5 (valid dates)
  → 400 HRM-INS-TYPE-KEY
POST /api/hrm/employee-insurances  type=hr_si_cat_msjb0dy7 start=2026-08-01 end=2026-12-31
  → 201 HRM-EINS-201
```

**Prior defect (QA-02-R2):** blank `""` → **500 `HRM-SYS-001`** `invalid input syntax for type date: ""` — **no longer observed**.

---

## 4. Defect / residual register

| ID | Prior | This seat |
|----|-------|-----------|
| **OBS-PLT-SI-INS-EMPTY-DATE** | QC-02 **CONDITION P2** · 500 SYS | ✅ **CLOSED** — 400 `HRM-VAL-001` on blank dates |
| **D-PLT-SI-INS-DTO-ISIN** | CLOSED | **RETAIN CLOSED** — not reopened |
| **R-PLT-SI-INS-03** | CLOSED | **RETAIN CLOSED** |
| L1 / QC-01 / QC-02 FE enrollment SEAL | SEAL | **RETAIN** — not rewritten |
| Module SI / CTR UAT | DENIED | **DENIED** |

**Residual product P0/P1:** none this seat.

**Note (non-blocking):** FE blank ViDateField may still POST `""` — now deterministic **4xx** (UX toast polish optional FE — not Condition reopen).

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| L1 QA-01 `SIINSQA-MSJA2Z7H` · QC-01 GWC L1 | **RETAIN** |
| QC-02 FE enrollment SEAL `SIINSQA2R2-MSJB0DY7` | **RETAIN** — Condition EMPTY-DATE stamp closed only |
| CTR legal-print · EMP-BE-02 ONE SoT | **SEAL RETAIN** |
| Module SI / CTR UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 6. Journey / matrix (U19)

| Journey / slice | This seat |
|-----------------|-----------|
| **OBS EMPTY-DATE Condition** | 🟢 PASS / CLOSED |
| SI-INS-CATALOG FE enrollment (QC-02) | ⬜ **RETAIN SEAL** — not re-promoted as new L1 |
| **J-HRM-04** module SI UAT | ⬜ **DENY** re-promote |
| Module SI·CTR UAT | ⬜ **DENIED** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.json` |
| **next_owner** | **qc** (narrow Condition close — QC-02-R2 or note on QC-02) |
| **completion_report** | See §8 |
| **next_dispatch_prompt** | See §9 |

---

## 8. completion_report

**Closed:** **OBS-PLT-SI-INS-EMPTY-DATE** — POST `/employee-insurances` with `start_date`/`end_date` = `""` (both, start-only, end-only) returns **400 `HRM-VAL-001`** with ISO date message — **not** 500 `HRM-SYS-001`. Stamp **`SIINSQA3-MSJBDWZ5`**. Retain smoke: open `hr_si_cat_msjb0dy7` ∈ EFF → **201 `HRM-EINS-201`**; invent → **400 `HRM-INS-TYPE-KEY`**. Honesty printable/personnel=false LOCKED. L1 / QC-01 / QC-02 FE enrollment seals **not reopened**. U65 zero-seed. **DENIED** module SI/CTR UAT · Phase1 · ready flip.

**Residual:** none product. Next = QC narrow Condition close (stamp OBS closed on QC-02-R2 note). Optional FE toast polish out of scope.

---

## 9. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QC-02-R2
from_role: pm
to_role: qc
lane: governance
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807
prior: QA-03 PASS_TO_PM stamp SIINSQA3-MSJBDWZ5 · OBS-PLT-SI-INS-EMPTY-DATE CLOSED
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.md
ref_qc_prior: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qc-02.md
retain: L1 SIINSQA-MSJA2Z7H · QC-01 GWC L1 · QC-02 FE enrollment SEAL SIINSQA2R2-MSJB0DY7 · DTO-ISIN · invent KEY · CTR · EMP-BE-02

## entry_criteria
- QA-03 PASS · machine JSON empty dates → 400 HRM-VAL-001
- Honesty printable/personnel=false LOCKED · C-SLICE-≠-MODULE · U65 zero-seed

## task (narrow Condition close only)
- Audit QA-03 evidence + machine JSON
- Stamp OBS-PLT-SI-INS-EMPTY-DATE CLOSED on QC-02 Condition (QC-02-R2 note or short evidence)
- Do NOT reopen L1 / QC-02 FE enrollment SEAL wording
- DENY module SI/CTR UAT · no seed · no ready flip

## exit
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qc-02-r2.md (or QC-02 DOC-DELTA)
- ack_status PASS_TO_PM · completion_report · next_dispatch_prompt

## cấm
seed · flip ready · reopen L1/QC-02 FE SEAL · claim module UAT · invent unrelated seats
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.md`

## ack_status

**PASS_TO_PM**

## contracts_printable_ready

**false**

## hrm_personnel_uat_ready

**false**

## C-SLICE-≠-MODULE

**RETAIN**

## OBS-PLT-SI-INS-EMPTY-DATE

**CLOSED** (stamp `SIINSQA3-MSJBDWZ5`)
