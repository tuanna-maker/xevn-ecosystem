# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-02` **READY_FOR_QA** agent `1f916f55-c9ee-4161-8c0d-3ff90d21329f` |
| **prior_fail** | `EMPSTQAFE-MSKDJH6V` @ [`po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01.md`](po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01.md) |
| **fix** | status forced into required basic fields → `emp-employment-status-select` mounts |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | `EMPSTQAFE2-MSKE3NV1` |
| **stamp_l1 RETAIN** | **`EMPSTQA-MSK20G7H`** · invent → **400 `HRM-EMP-STATUS-KEY`** + **400 `HRM-EMP-STATUS-REASON-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 alone · **no wipe** EFF |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-CUSTOM/`EMPCFQA-MSK14LUH` · EXT/`EMPTOKEXTQA-MSJ57PE1` · ATT-CODE L1/FE · OT/COMP/SHIFT/leave/LVRULE · **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** — **R-PLT-EMP-ST-FE-01 CLOSABLE** |
| **condition_verify** | **R-PLT-EMP-ST-FE-01** → **CLOSABLE** · Edit+Create Nest Select PRESENT · reason PRESENT · FE Lưu Nest PATCH **200** · F5 Nest badge · list filter Nest RETAIN |
| **change_mode** | ADD verify · no `apps/**` product edit · no seed · no ready flip · **FORBIDDEN** invent FE-ADMIN · **FORBIDDEN** invent LVRULE · **FORBIDDEN** reopen L1 · **FORBIDDEN** QC-close this seat (QC next) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest re-run | mount-guard **7** + employment-statuses **17** + status-reasons **7** + catalog **5** = **36/36** exit **0** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-02/` (10) |
| FE parent | [`po-hrm-dynamic-config-platform-emp-status-catalog-fe-02.md`](po-hrm-dynamic-config-platform-emp-status-catalog-fe-02.md) READY_FOR_QA |
| Prior FAIL | [`qa-fe-01.md`](po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01.md) stamp `EMPSTQAFE-MSKDJH6V` |
| L1 QA | stamp **`EMPSTQA-MSK20G7H`** RETAIN |

**spec_ref:** AC-PLT-EMP-STATUS-01 / 01b / 01c · VAL-EMP-ST-CNS-02 · VAL-EMP-STR-CNS-01 · HDSD CH06e · R-PLT-EMP-ST-FE-01

**Seed:** none · **ensureDefault:** none · **FE-ADMIN invent:** **DENIED / HOLD**.

**Target employee (FE Lưu):** `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` · `Nguyễn Văn QA M3 987275` · `job_title_key=(none)` — preferred over UAT NV with `STAFF` (orthogonal `HRM-EMP-POSITION-KEY` observed on first attempt).

---

## 2. Click path (U65 · HDSD CH06e · R-PLT-EMP-ST-FE-01 retest)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Nest ST EFF baseline | **total=4** keys=`active,inactive,probation,hr_emp_st_msk20g7h` · **200** `HRM-EMP-ST-200` (reuse L1 open Nest — no wipe) |
| 2 | Nest STR EFF | **total=1** `hr_emp_str_msk20g7h` · **200** `HRM-EMP-STR-200` |
| 3 | Invent API spot | PATCH invent status → **400 `HRM-EMP-STATUS-KEY`** · invent reason → **400 `HRM-EMP-STATUS-REASON-KEY`** · L1 **RETAIN** |
| 4 | **HRM → Nhân sự / Employees** | `/hr/employees?portal=1&companyId=main` |
| 5 | FE GET `/employees/employment-statuses/effective` | **200** `HRM-EMP-ST-200` (Network count≥1) |
| 6 | List filter `emp-status-filter` | Nest options include **`QA EMP status EMPSTQA-MSK20G7H`** + Nest-named bootstrap rows · **PASS** (no regression) |
| 7 | Row ⋯ → **Sửa** → Edit dialog (prefer clean emp) | `hdsd-employee-form-dialog` · tab Thông tin cơ bản |
| 8 | Status Select `emp-employment-status-select` | **PRESENT** · `hasStatusTestId=true` · label **Trạng thái** · Nest open **`QA EMP status EMPSTQA-MSK20G7H`** · **PASS** (prior ABSENT fixed) |
| 9 | Reason Select `emp-status-reason-select` | **PRESENT** · Nest **`QA EMP reason EMPSTQA-MSK20G7H`** · STR GET ok · **PASS** |
| 10 | **Lưu** FE submit | PATCH Nest `status=hr_emp_st_msk20g7h` + `status_reason_key=hr_emp_str_msk20g7h` → **200 `HRM-EMP-202`** · toast ok · **PASS** |
| 11 | F5 list + reopen Edit | Nest badge list · status Select text Nest · reason still visible · **PASS** |
| 12 | **Thêm** Create dialog | `emp-employment-status-select` **PRESENT** · Nest open option · **PASS** (matrix #3) |
| 13 | EFF=0 branch | **NOTE_BLOCKED** — no wipe; cite vitest **36** bootstrap + FE-02 gate |
| 14 | EMP-CUSTOM / ATT seals | GET attendance-codes/effective **200**/1 · ot-types **200**/1 · no reopen |
| 15 | FE-ADMIN | invent FE-ADMIN **HOLD_ABSENT_OK** |

**HDSD / testids:** `hdsd-employees-create-btn` · `hdsd-employee-form-dialog` · `hdsd-employee-form-submit` · `emp-status-filter` · `emp-employment-status-select` (**PRESENT**) · `emp-status-reason-select` (**PRESENT**)

**Screens:** `01-employees-list` · `02-status-filter` · `03-edit-dialog` · `04-status-select-options` · `05-status-nest-selected` · `06-reason-selected` · `07-after-save` · `08-f5-list` · `09-f5-edit-status` · `10-create-status-select`

---

## 3. UF matrix (dispatch CLOSABLE)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0 + vitest 36** | stack 200 · 36 tests | 200/200/200 · **36/36** | 🟢 |
| **2 Edit Select Nest** | `emp-employment-status-select` PRESENT · Nest nameVi when EFF>0 | PRESENT · open Nest + Nest-named options | 🟢 |
| **3 Create Select** | same Select mounts | Create Nest open option visible | 🟢 |
| **4 reason Select** | when requires_reason / STR EFF>0 | PRESENT · Nest reason | 🟢 |
| **5 Lưu Nest + FE+F5** | PATCH/POST Nest status (+ reason) 2xx · FE after 2xx + F5 Nest badge | PATCH **200 HRM-EMP-202** · toast · F5 Nest · reopen Nest | 🟢 |
| **6 list filter Nest** | no regression | Nest open nameVi on filter | 🟢 |
| **7 invent KEY** | 400 ST/STR | **400 KEY** pair · L1 RETAIN | 🟢 |
| **OBS EFF=0** | bootstrap without wipe | NOTE_BLOCKED · unit cite 36 | 🟡 |
| **OBS invent UI** | Select-only | free-text invent N/A · API KEY proven | 🟡 |

---

## 4. Prior FAIL → fixed (delta)

| Item | QA-FE-01 (`EMPSTQAFE-MSKDJH6V`) | QA-FE-02 (`EMPSTQAFE2-MSKE3NV1`) |
|------|--------------------------------|----------------------------------|
| `hasBasicField('status')` | false — catalog omit | forced required peer `employee_code`/`full_name` |
| Edit `emp-employment-status-select` | **ABSENT** | **PRESENT** Nest |
| Create Select | **ABSENT** | **PRESENT** Nest |
| Reason Select | blocked | **PRESENT** Nest |
| FE Lưu Nest keys | blocked / Network spot only | **FE submit 200** Nest ST+STR |
| Condition R-PLT-EMP-ST-FE-01 | **OPEN** | **CLOSABLE** |

**Root cause closed:** FE-02 one-line required-set FIX (`['employee_code','full_name','status']`) — mount-guard R-PLT-EMP-ST-FE-02 locks regression.

---

## 5. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200/200/200 | 🟢 |
| **Vitest** | 36 | 36/36 | 🟢 |
| **EFF>0** | Nest ST/STR LIVE | ST=4 · STR=1 | 🟢 |
| **FE GET ST effective** | Network 200 | 200 `HRM-EMP-ST-200` | 🟢 |
| **VAL-EMP-ST-CNS-02 / AC-01 form** | EFF>0 form Select Nest | Edit Nest PRESENT | 🟢 |
| **AC-01 Create** | Select mounts | Create Nest PRESENT | 🟢 |
| **AC-01b reason** | companion when requires_reason | Nest reason PRESENT | 🟢 |
| **List filter Nest** | Nest nameVi when EFF>0 | Nest open option | 🟢 |
| **Submit Nest keys** | FE Lưu Nest 2xx | PATCH **200 HRM-EMP-202** | 🟢 |
| **F5** | retain Nest | list + reopen Nest | 🟢 |
| **Invent KEY** | 400 ST + STR | confirmed · L1 RETAIN | 🟢 |
| **AC-01c EFF=0** | bootstrap without wipe | NOTE_BLOCKED · unit cite | 🟡 |
| **FE-ADMIN** | HOLD | HOLD_ABSENT_OK | 🟢 |
| **01H honesty** | ready=false · C-SLICE | locked | 🟢 |
| **Console** | no Uncaught / 5xx | pageErrors=0 · bad5xx=0 | 🟢 |

---

## 6. Key network stamps

```text
GET  /api/hrm/employees/employment-statuses/effective?company_id=main
  → 200 HRM-EMP-ST-200  total=4
     active / inactive / probation / hr_emp_st_msk20g7h (nameVi=QA EMP status EMPSTQA-MSK20G7H)

GET  /api/hrm/employees/status-reasons/effective?company_id=main&applies_to_status_key=hr_emp_st_msk20g7h
  → 200 HRM-EMP-STR-200  total=1  reasonKey=hr_emp_str_msk20g7h

PATCH /api/hrm/employees/{id}  invent status=zz_invent_emp_st_mske3nv1
  → 400 HRM-EMP-STATUS-KEY  (L1 EMPSTQA-MSK20G7H RETAIN)

PATCH /api/hrm/employees/{id}  invent reason=zz_invent_emp_str_mske3nv1 (status=hr_emp_st_msk20g7h)
  → 400 HRM-EMP-STATUS-REASON-KEY

PATCH /api/hrm/employees/0f6e1369-…  FE Lưu (browser)
  body: status=hr_emp_st_msk20g7h · status_reason_key=hr_emp_str_msk20g7h
  → 200 HRM-EMP-202  (source=fe_submit)

GET  /api/hrm/attendance/attendance-codes/effective → 200 total=1 (ATT RETAIN)
GET  /api/hrm/attendance/ot-types/effective → 200 total=1 (OT RETAIN)
```

**Note (OBS, not FAIL this seat):** First browser attempt on UAT NV `job_title_key=STAFF` produced PATCH **400 `HRM-EMP-POSITION-KEY`** while Nest status+reason keys were already in body — orthogonal EMP-POS catalog residual. Retest preferred employee without STAFF → FE Lưu **200**. Does **not** reopen R-PLT-EMP-ST-FE-01.

---

## 7. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| **`employees_e2e_linkage_ready`** | **`false`** — **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** |
| L1 stamp `EMPSTQA-MSK20G7H` | **RETAIN** · KEY LIVE |
| EMP-CUSTOM / EXT / DOC-ET | **SEAL RETAIN** |
| ATT-CODE / OT / COMP / SHIFT / leave / LVRULE | **SEAL / HOLD RETAIN** |
| Invent FE-ADMIN panel | **DENIED / HOLD_ABSENT_OK** |
| Invent LVRULE 01g | **DENIED** |
| Module EMP UAT / formula LIVE | **DENIED** |
| **C-SLICE-≠-MODULE** | locked — Condition CLOSABLE ≠ module EMP UAT |

---

## 8. Verdict

| | |
|--|--|
| **overall** | **PASS_WITH_OBS** |
| **Condition R-PLT-EMP-ST-FE-01** | **CLOSABLE** — Edit+Create Nest Select PRESENT · reason PRESENT · FE Lưu Nest 200 · F5 Nest · list filter Nest RETAIN · invent KEY RETAIN |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **OBS** | EFF=0 NOTE_BLOCKED (unit cite 36) · invent UI Select-only · orthogonal POSITION KEY on STAFF rows (out of seat) |
| **DENY** | seed · invent FE-ADMIN · invent LVRULE · reopen L1 · flip personnel/e2e · claim module EMP UAT · QC-close without QC seat |

### completion_report

**Closed this seat:** Prior FAIL form Select ABSENT (`EMPSTQAFE-MSKDJH6V`) retested PASS after FE-02 gate fix. L0 · Vitest 36 · EFF ST/STR LIVE · invent KEY pair · list filter Nest · Edit Nest Select · Create Nest Select · reason Select · FE Lưu Nest PATCH 200 · FE after 2xx + F5 Nest · ATT/EMP-CUSTOM RETAIN · honesty locks · Condition **R-PLT-EMP-ST-FE-01 CLOSABLE**.

**Still open (not this seat):** FE-ADMIN HOLD · EFF=0 live wipe forbidden · orthogonal EMP-POS `STAFF` POSITION KEY on some UAT rows · module EMP UAT honesty false · C-SLICE.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QC-FE-01
from_role: pm
to_role: qc
lane: governance
priority: P2
entry_criteria:
  - QA-FE-02 PASS_WITH_OBS stamp EMPSTQAFE2-MSKE3NV1 @ docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-02.md
  - Prior FAIL EMPSTQAFE-MSKDJH6V form Select ABSENT FIXED — Edit+Create emp-employment-status-select Nest PRESENT · reason PRESENT · FE Lưu Nest PATCH 200 HRM-EMP-202 · F5 Nest · list filter Nest RETAIN
  - L1 EMPSTQA-MSK20G7H RETAIN · KEY ST/STR LIVE · vitest 36 · Condition R-PLT-EMP-ST-FE-01 CLOSABLE
exit_criteria:
  - Narrow GWC close Condition R-PLT-EMP-ST-FE-01 only
  - ACCEPT OBS: EFF=0 NOTE_BLOCKED · invent UI Select-only · orthogonal POSITION KEY STAFF rows (not status residual)
  - RETAIN FE-ADMIN HOLD · L1 KEY · EMP-CUSTOM · ATT seals · LVRULE HOLD
  - DENY flip hrm_personnel_uat_ready · module EMP UAT · Phase1 · invent FE-ADMIN · reopen L1
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qc-fe-01.md
ack_status_target: PASS_TO_PM
must_keep: ST/STR KEY · EMP-CUSTOM · ATT seals · LVRULE HOLD · C-SLICE-≠-MODULE
```
