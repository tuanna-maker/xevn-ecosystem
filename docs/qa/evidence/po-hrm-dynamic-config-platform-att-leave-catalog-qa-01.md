# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01` **CONFIRMED** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `ATTLEAVEQA-MSJ7CPJH` |
| **U65** | zero-seed · **browser** FE click + Network · probe ≠ 🟢 UF |
| **Honesty** | `attendance_uat_ready=false` · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · EMP·DEC·PAY·EXT·CTR·LIST-TOTALS·ATT-QC-01/02 **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (9/9) |
| **change_mode** | ADD · no `apps/**` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | (runner stamp) |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01/` |

**spec_ref:** BA-01 AC-PLT-ATT-LEAVE-01* · SA-01 Option **B** · ATT-QC-02 stamp `ATTPLATQA2-MSIVNE4A` **RETAIN**

**Seed:** none.

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Settings** → tab **Loại phép ATT** | `settings-tab-att-leave-types` |
| 2 | CREATE key `hr_leave_cat_msj7cpjh` · **Tạo loại phép** | Network **PUT** `/api/hrm/attendance/leave-types` → **200** |
| 3 | **F5** → tab lại → row còn | 🟢 `settings-att-leave-type-row-hr_leave_cat_msj7cpjh` |
| 4 | **Chấm công** → **Nghỉ phép** → Tạo yêu cầu | `att-leave-precision` · dialog |
| 5 | Picker Network | **GET** `/leave-types/effective?company_id=main` → **200** · EFF count=8 · has new key |
| 6 | Chọn `hr_leave_cat_msj7cpjh` | CatalogSearchPicker UI pick=true |
| 7 | Panel quỹ | `leave-balance-panel` visible (05b) |
| 8 | Spot sick `lvt_02` ∈ EFF | picker select · panel bound (07) |
| 9 | Create leave type ∈ EFF | POST leave-requests → **201** `HRM-LEAVE-201` id=`e0dcc86d-…` · F5 type persist |
| 10 | Invent `zz_invent_leave_msj7cpjh` | POST → **400** `HRM-LEAVE-TYPE-UNKNOWN` · no persist / no hold |
| 11 | Honesty | ready=false · seals retain · C-SLICE |

**HDSD ids:** `settings-tab-att-leave-types` · `hdsd-att-leave-type-key|name|save|reload` · `att-leave-precision` · `att-leave-create-dialog-precision` · `leave-balance-panel` · `hdsd-leave-open-att-leave-types` (wire)

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-ATT-LEAVE-01** | EFF≥1 · picker GET effective · 2xx · F5 type ∈ catalog | GET effective **200** · pick UI · POST **201** type=`hr_leave_cat_msj7cpjh` · F5 persist | 🟢 |
| **AC-PLT-ATT-LEAVE-01b** | Invent → 4xx `HRM-LEAVE-TYPE-UNKNOWN` · no persist/hold ≡ AC-PLT-ATT-03 | **400** `HRM-LEAVE-TYPE-UNKNOWN` · persist=false | 🟢 |
| **AC-PLT-ATT-LEAVE-01c** | EFF=0 empty + CTA · admin CREATE still OK · no seed | Live EFF=8 — empty **not forced** (U65 no wipe seals) · CTA wire in LeaveTab · admin CREATE via **01d** PASS · no seed | 🟢 |
| **AC-PLT-ATT-LEAVE-01d** | Admin CREATE N+1 · 2xx · F5 · ATT-QC-02 RETAIN | PUT **200** · F5 row · open N+1 | 🟢 |
| **AC-PLT-ATT-LEAVE-01H** | Honesty / seals | ready=false · WAIVE/sign/J-06c + peer seals RETAIN · C-SLICE · DENY ATT UAT | 🟢 |
| **AC-PLT-ATT-LEAVE-05b** | Panel theo loại picker | `leave-balance-panel` visible after pick | 🟢 |
| **AC-PLT-ATT-LEAVE-09** | Hold after assert · invent no hold | Valid create **201**; invent **400** trước hold | 🟢 |
| **AC-PLT-ATT-LEAVE-07** | Sick type ∈ EFF | `lvt_02` picker select · panel bound | 🟢 |
| **VAL-ATT-CNS-04** | FAIL if MD alone when EFF>0 | GET effective Network **200** · MD-alone=false | 🟢 |

**OBS (01c):** Empty EFF branch not exercised live because wiping all leave types would reopen ATT-QC seals; empty CTA wire retained in `LeaveTab` (`hdsd-leave-open-att-leave-types`); admin open CREATE proven by **01d**.

---

## 4. Key network stamps

```text
PUT  /api/hrm/attendance/leave-types                          → 200  key=hr_leave_cat_msj7cpjh
GET  /api/hrm/attendance/leave-types/effective?company_id=main → 200  count=8 hasNewKey
POST /api/hrm/attendance/leave-requests                       → 201  HRM-LEAVE-201 type=hr_leave_cat_msj7cpjh id=e0dcc86d-…
POST /api/hrm/attendance/leave-requests (invent)              → 400  HRM-LEAVE-TYPE-UNKNOWN zz_invent_leave_msj7cpjh
```

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** — **cấm reopen** |
| ATT-QC-01 · ATT-QC-02 | **SEAL RETAIN** (01d = open N+1 spot, no wipe) |
| EMP · DEC · PAY · EXT · CTR · LIST-TOTALS | **SEAL RETAIN** |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |
| Settings-MD-only picker SoT | **DENIED** (VAL-ATT-CNS-04 PASS) |

---

## 6. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No residual this stamp | — |

---

## 7. completion_report

**Closed:** U65 browser AC pack for ATT leave catalog Option B — **9/9 PASS**. Stamp `ATTLEAVEQA-MSJ7CPJH`. Admin Settings Loại phép ATT open CREATE `hr_leave_cat_msj7cpjh` PUT 200 + F5 (01d · ATT-QC-02 retain). LeaveTab picker SoT = Network GET `leave-types/effective` 200 when EFF≥1 (01 · VAL-ATT-CNS-04). Create leave 201 + F5 type ∈ catalog; invent `zz_invent_leave_*` → 400 `HRM-LEAVE-TYPE-UNKNOWN` no persist (01b ≡ AC-PLT-ATT-03). Spot panel 05b · hold 09 · sick `lvt_02` 07. Honesty false · seals retain · C-SLICE · zero-seed.

**Residual:** none P0/P1. `attendance_uat_ready=false` until program promotes module ATT separately.

**Forbidden claims:** module ATT UAT · Phase1 DONE · flip ready · reopen WAIVE/sign/J-06c · reopen peer seals · wipe ATT-QC.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01-browser.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md
2. docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01-browser.json
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md

## task
Narrow QC GWC on browser AC-PLT-ATT-LEAVE-01/01b/01c/01d/01H (+05b/09/07 spot) stamp ATTLEAVEQA-MSJ7CPJH.
- Audit: Settings Loại phép ATT open N+1 → LeaveTab GET effective picker → create 2xx/F5 · invent 400 HRM-LEAVE-TYPE-UNKNOWN · VAL-ATT-CNS-04 MD-alone denied
- Honesty: attendance_uat_ready=false · C-SLICE-≠-MODULE · WAIVE/sign/J-HRM-06c SEAL RETAIN · ATT-QC-01/02 + EMP/DEC/PAY/EXT/CTR/LIST-TOTALS SEAL RETAIN
- Cấm: invent ready=true · reopen WAIVE/sign/J-06c · reopen peer seals · claim module ATT UAT · seed

## exit
GO WITH CONDITIONS (slice) or NO-GO · honesty false · must_keep seals · PASS_TO_PM
completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```
