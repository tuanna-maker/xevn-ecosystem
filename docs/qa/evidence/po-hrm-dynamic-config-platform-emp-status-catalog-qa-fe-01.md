# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01` **READY_FOR_QA** · Condition **R-PLT-EMP-ST-FE-01** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | `EMPSTQAFE-MSKDJH6V` |
| **stamp_l1 RETAIN** | **`EMPSTQA-MSK20G7H`** · invent → **400 `HRM-EMP-STATUS-KEY`** + **400 `HRM-EMP-STATUS-REASON-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 alone · **no wipe** EFF |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-CUSTOM/`EMPCFQA-MSK14LUH` · EXT/`EMPTOKEXTQA-MSJ57PE1` · ATT-CODE L1/FE · OT/COMP/SHIFT/leave/LVRULE · **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **FAIL** — **R-PLT-EMP-ST-FE-01 NOT CLOSABLE** (form status Select ABSENT) |
| **condition_verify** | **R-PLT-EMP-ST-FE-01** → **OPEN** · list filter Nest PASS · form Nest Select **FAIL** (basic_fields catalog gate) |
| **change_mode** | ADD verify · no `apps/**` · no seed · no ready flip · **FORBIDDEN** invent FE-ADMIN · **FORBIDDEN** invent LVRULE · **FORBIDDEN** reopen L1 |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest re-run | `useEmpEmploymentStatusesEffective` **17** + `useEmpStatusReasonsEffective` **7** + `empEmploymentStatusCatalog` **5** = **29/29** exit **0** |
| Git HEAD | (runner `env.commit`) |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01/` |
| FE parent | [`po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md`](po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md) READY_FOR_QA |
| SA Option A | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md) LOCKED |
| L1 QA | stamp **`EMPSTQA-MSK20G7H`** RETAIN |

**spec_ref:** AC-PLT-EMP-STATUS-01 / 01b / 01c · VAL-EMP-ST-CNS-02 · VAL-EMP-STR-CNS-01 · HDSD CH06e consumer hồ sơ NV status/reason

**Seed:** none · **ensureDefault:** none · **FE-ADMIN invent:** **DENIED / HOLD**.

---

## 2. Click path (U65 · HDSD CH06e · R-PLT-EMP-ST-FE-01)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Nest ST EFF baseline | **total=4** keys=`active,inactive,probation,hr_emp_st_msk20g7h` · **200** `HRM-EMP-ST-200` (reuse L1 open Nest — no wipe) |
| 2 | Nest STR EFF | **total=1** `hr_emp_str_msk20g7h` · **200** `HRM-EMP-STR-200` · `requiresReason=true` on open ST |
| 3 | Invent API spot | PATCH invent status → **400 `HRM-EMP-STATUS-KEY`** · invent reason → **400 `HRM-EMP-STATUS-REASON-KEY`** · L1 **RETAIN** |
| 4 | **HRM → Nhân sự / Employees** | `/hr/employees?portal=1&companyId=main` |
| 5 | FE GET `/employees/employment-statuses/effective` | **200** `HRM-EMP-ST-200` (Network count≥1) |
| 6 | List filter `emp-status-filter` | Nest options include **`QA EMP status EMPSTQA-MSK20G7H`** + bootstrap-named Nest rows · **not** sole hardcode-3 · **PASS** |
| 7 | Row ⋯ → **Sửa** → Edit dialog | `hdsd-employee-form-dialog` opened · tab Thông tin cơ bản |
| 8 | Status Select `emp-employment-status-select` | **ABSENT** — `hasStatusTestId=false` · labels have no «Trạng thái» · **FAIL** |
| 9 | Create dialog fallback | Same ABSENT — catalog gate confirmed on Thêm |
| 10 | Reason Select | blocked by missing status field · **FAIL** |
| 11 | Network Nest contract spot (not FE click) | PATCH `status=hr_emp_st_msk20g7h` + `status_reason_key=hr_emp_str_msk20g7h` → **200** `HRM-EMP-202` |
| 12 | F5 list | Nest badge **`QA EMP status EMPSTQA…`** visible on list · form still cannot rebind |
| 13 | EFF=0 branch | **NOTE_BLOCKED** — no wipe; cite FE-01 vitest **29** bootstrap active\|probation\|inactive |
| 14 | EMP-CUSTOM / ATT seals | GET attendance-codes/effective **200**/1 · ot-types **200**/1 · no reopen |
| 15 | FE-ADMIN | invent FE-ADMIN **HOLD_ABSENT_OK** |

**HDSD / testids:** `hdsd-employees-create-btn` · `hdsd-employee-form-dialog` · `hdsd-employee-form-submit` · `emp-status-filter` · `emp-employment-status-select` (**ABSENT**) · `emp-status-reason-select` (**ABSENT**) · `emp-employment-status-bootstrap-hint` (n/a)

**Screens:** `01-employees-list` · `02-status-filter` · `03-edit-dialog` · `03c-create-dialog` · `04..09` · `07-network-nest-patch-spot` · `08-f5-list`

---

## 3. UF matrix (dispatch)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0** | stack 200 | 200/200/200 | 🟢 |
| **2 Vitest** | 29 claimed | **29/29** | 🟢 |
| **3 EFF>0 status Select Nest** | GET employment-statuses/effective 200 · form Select Nest code+nameVi | GET **200** · **form Select ABSENT** | 🔴 |
| **4 reason Select** | when requires_reason / STR EFF>0 | blocked — status field missing | 🔴 |
| **5 Lưu Nest keys + FE+F5** | PATCH/POST 2xx Nest · FE after 2xx | FE cannot submit status · Network spot **200** Nest keys · list F5 Nest badge OBS | 🔴 / 🟡 |
| **6 EFF=0 bootstrap** | active\|probation\|inactive + CTA | **NOTE_BLOCKED** · unit cite 29 | 🟡 documented |
| **7 invent → KEY** | 400 ST/STR KEY + VI toast if testable | API **400 KEY** pair · UI Select ABSENT → toast soft OBS | 🟢 / 🟡 |
| **8 list filter Nest** | prefer Nest EFF when EFF>0 | filter shows Nest open nameVi | 🟢 |
| **9 EMP-CUSTOM / ATT RETAIN** | no regression | att-code/ot effective 200 | 🟢 |

---

## 4. Root cause (FAIL)

**Class:** FE consumer Nest bind **partial** — hooks + list filter LIVE; **form status Select gated OFF**.

| Layer | Fact |
|-------|------|
| Nest EFF | ST total=4 (incl. open `hr_emp_st_msk20g7h` requiresReason) · STR total=1 |
| FE list | `Employees.tsx` `emp-status-filter` binds Nest EFF · **PASS** |
| FE form | `EmployeeFormDialog` status Select wrapped in `hasBasicField('status')` |
| Catalog gate | `buildActiveFieldSet(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code','full_name'])` — Settings `hrm_employee_basic_fields` active items **omit** `status` → field never rendered |
| Edit + Create | both dialogs: labels = Mã NV / Họ tên / Quản lý / Bộ phận / Chức vụ / EMP-CUSTOM fields — **no Trạng thái** |
| BE contract | Nest PATCH with ST+STR keys **200 HRM-EMP-202** · invent KEY pair LIVE |

**Residual ID (named):** **R-PLT-EMP-ST-FE-01-GATE** (or keep **R-PLT-EMP-ST-FE-01** OPEN) — force `status` into required basic fields (peer `employee_code`/`full_name`) **OR** always render Nest status Select when `effectiveCount > 0` regardless of MD catalog omit.

**NOT** FE-ADMIN invent · **NOT** L1 reopen · **NOT** seed · **NOT** flip personnel UAT.

---

## 5. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200/200/200 | 🟢 |
| **Vitest** | 29 | 29/29 | 🟢 |
| **EFF>0** | Nest ST/STR LIVE | ST=4 · STR=1 | 🟢 |
| **FE GET ST effective** | Network 200 | 200 `HRM-EMP-ST-200` | 🟢 |
| **VAL-EMP-ST-CNS-02 / AC-01 form** | EFF>0 form Select Nest ≠ Settings/hardcode sole | Form Select **ABSENT** | 🔴 |
| **AC-01b reason** | companion when requires_reason | blocked | 🔴 |
| **List filter Nest** | Nest nameVi when EFF>0 | Nest open option visible | 🟢 |
| **Submit Nest keys** | FE Lưu Nest | FE blocked · Network spot 200 Nest | 🔴 |
| **F5** | retain Nest | list Nest badge after Network PATCH | 🟡 OBS |
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
     active / inactive / probation / hr_emp_st_msk20g7h (nameVi=QA EMP status EMPSTQA-MSK20G7H, requiresReason=true)

GET  /api/hrm/employees/status-reasons/effective?company_id=main&applies_to_status_key=hr_emp_st_msk20g7h
  → 200 HRM-EMP-STR-200  total=1  reasonKey=hr_emp_str_msk20g7h

PATCH /api/hrm/employees/{id}  invent status=zz_invent_emp_st_mskdjh6v
  → 400 HRM-EMP-STATUS-KEY  (L1 EMPSTQA-MSK20G7H RETAIN)

PATCH /api/hrm/employees/{id}  invent reason=zz_invent_emp_str_mskdjh6v (status=hr_emp_st_msk20g7h)
  → 400 HRM-EMP-STATUS-REASON-KEY

PATCH /api/hrm/employees/0500220b-…  Nest contract spot
  body: status=hr_emp_st_msk20g7h · status_reason_key=hr_emp_str_msk20g7h
  → 200 HRM-EMP-202

GET  /api/hrm/attendance/attendance-codes/effective → 200 total=1 (ATT RETAIN)
GET  /api/hrm/attendance/ot-types/effective → 200 total=1 (OT RETAIN)
```

**DevTools / picker:** List filter options text includes Nest `QA EMP status EMPSTQA-MSK20G7H`. Form has **no** `emp-employment-status-select`.

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
| **C-SLICE-≠-MODULE** | locked — slice FAIL ≠ module EMP UAT |

---

## 8. Verdict

| | |
|--|--|
| **overall** | **FAIL** |
| **Condition R-PLT-EMP-ST-FE-01** | **OPEN / NOT CLOSABLE** — list Nest PASS; form Nest Select ABSENT (basic_fields gate) |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **dev-fe** (residual gate) → then **qa** retest → **qc** Condition close |
| **DENY** | seed · invent FE-ADMIN · invent LVRULE · reopen L1 · flip personnel/e2e · claim module EMP UAT |

### completion_report

**Closed this seat:** L0 · Vitest 29 · EFF ST/STR LIVE · invent KEY pair · list filter Nest · FE GET effective · ATT/EMP-CUSTOM RETAIN smoke · honesty locks · root-cause evidence for form gate.

**Still open:** Form `emp-employment-status-select` / reason Select / FE Lưu Nest keys on CH06e Thêm/Sửa path — **R-PLT-EMP-ST-FE-01** remains **OPEN**.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-02
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
entry_criteria:
  - QA-FE-01 FAIL EMPSTQAFE-MSKDJH6V @ docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01.md
  - Root cause: hasBasicField('status') false — buildActiveFieldSet required only employee_code|full_name; Settings hrm_employee_basic_fields omits status → Nest Select never mounts (Edit+Create)
  - List filter Nest already PASS; L1 EMPSTQA-MSK20G7H RETAIN; KEY LIVE
exit_criteria:
  - Force status field visible when Nest EFF>0 (add 'status' to required basic fields OR bypass catalog omit when empStatusCatalogBound)
  - Thêm/Sửa: emp-employment-status-select shows Nest ST nameVi incl. open keys; reason Select when requires_reason
  - Lưu PATCH/POST Nest status (+ status_reason_key) 2xx · FE+F5
  - vitest regression; no FE-ADMIN invent; no seed; honesty false
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-fe-02.md
ack_status_target: READY_FOR_QA
must_keep: ST/STR KEY · EMP-CUSTOM · ATT seals · LVRULE HOLD
DENY: invent FE-ADMIN · invent LVRULE · reopen L1 · flip hrm_personnel_uat_ready · module EMP UAT
```

**QC note:** Do **not** dispatch `EMP-STATUS-CATALOG-QC-FE-01` Condition close until FE-02 + QA retest PASS form Select.
