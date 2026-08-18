# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 browser-only · zero-seed |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01` **READY_FOR_QA** |
| **Date** | 2026-08-09 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · OU holding · `:5173` |
| **Stamp** | `EMPSTADMQA-MSKOJZ8G` |
| **stamp_l1 RETAIN** | **`EMPSTQA-MSK20G7H`** |
| **U65** | zero-seed · browser FE click path · **no** `pnpm seed:*` · **no** API-only PASS |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **LOCKED** · **`C-SLICE-≠-MODULE`** · **DENY** module EMP UAT claim |
| **condition** | **`R-PLT-EMP-ST-FE-ADMIN` CLOSABLE** (Settings Nest ST/STR admin twin LIVE) |
| **must_keep** | L1 RETAIN · consumer FE CLOSED · Settings jd-dynamic / pos-dept SoT RETAIN · Nest pos/dept admin **DENY** · LVRULE HOLD |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** — 18/18 AC 🟢 · FAIL=0 · NOTE=0 |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** (UV assert noise exit after healthy — health green) |
| L0 `qc:fe-be-health` | **ALL PASS** (portal login · employees · catalog-sync · proxy) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01/` |
| FE parent | [`po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md`](po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md) §4 |
| L1 QA | stamp **`EMPSTQA-MSK20G7H` RETAIN** |

**Seed:** none · **API mutate for PASS:** none · Nest pos/dept admin invent: **DENIED**.

---

## 2. Click path (U65 · HDSD)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Cài đặt / Settings** → tab **Trạng thái NV EMP** | `settings-tab-emp-employment-statuses` · panel `settings-emp-status-admin` + ST/STR cards **PRESENT** |
| 2 | Baseline active rows | ST **1** → after create **2** · STR **1** |
| 3 | DENY Nest pos/dept admin | no `settings-tab-emp-positions` / `emp-department-admin` · `settings-tab-jd-dynamic` SoT **visible** |
| 4 | Invalid key `2bad` → Lưu | toast **HRM-PLT-CAT-CODE-INVALID** · invent PUT **0** |
| 5 | Create ST `hr_st_admin_qa_mskojz8g` | **PUT** `/api/hrm/employees/employment-statuses` → **200 `HRM-EMP-ST-200`** · row visible |
| 6 | F5 + reload + EFF picker | row còn · EFF pick **option_click** Nest key |
| 7 | Edit nhãn → Cập nhật | **PUT** → **200 `HRM-EMP-ST-200`** · FE label edit · F5 còn |
| 8 | Create STR `resign_personal_qa_mskojz8g` · applies_to `inactive` | **PUT** `/status-reasons` → **200 `HRM-EMP-STR-200`** · F5 còn |
| 9 | Soft-retire STR → ST | **POST** retire → **201** · rows gone from active · F5 still gone |
| 10 | Consumer smoke Employees form | `emp-employment-status-select` **PRESENT** (CLOSED RETAIN) |

**HDSD inventory (U76):**

- `settings-tab-emp-employment-statuses`
- `settings-emp-status-admin` · `settings-emp-employment-statuses` · `settings-emp-status-reasons`
- `hdsd-emp-employment-status-key|name|save|reload|retire-{key}|effective-picker`
- `hdsd-emp-status-reason-key|name|save|reload|applies-to|retire-{key}`

**Screens:** `01-settings-st-tab` · `02-invalid-key` · `03-st-create` · `04-st-f5` · `05-st-edit` · `06-str-create` · `07-str-retire` · `08-st-retire` · `09-retire-f5` · `10-consumer-select`

---

## 3. UF browser blocks (dispatch matrix)

### UF-ST-CREATE — Tạo trạng thái NV

| | |
|--|--|
| **Trước mutate** | active ST rows = **1** |
| **Action** | fill `hr_st_admin_qa_mskojz8g` + nhãn → **Tạo trạng thái** |
| **Network** | **PUT** `/api/hrm/employees/employment-statuses` → **200** `HRM-EMP-ST-200` · id `742feafe-…` |
| **FE sau 2xx** | row `settings-emp-employment-status-row-hr_st_admin_qa_mskojz8g` · rows **1→2** |
| **F5** | row còn · EFF picker chọn được mã |
| **Verdict** | 🟢 |

### UF-ST-EDIT — Cập nhật nhãn

| | |
|--|--|
| **Action** | click row → nhãn `TT QA EMPST edit mskojz8g` → **Cập nhật** |
| **Network** | **PUT** → **200** `HRM-EMP-ST-200` · nameVi edit |
| **FE sau 2xx** | table shows edit label |
| **F5** | edit label còn |
| **Verdict** | 🟢 |

### UF-STR-CREATE — Tạo lý do trạng thái

| | |
|--|--|
| **Action** | `resign_personal_qa_mskojz8g` · applies_to `inactive` → **Tạo lý do** |
| **Network** | **PUT** `/api/hrm/employees/status-reasons` → **200** `HRM-EMP-STR-200` · id `843cf869-…` |
| **FE sau 2xx** | STR row visible |
| **F5** | STR row còn |
| **Verdict** | 🟢 |

### UF-RETIRE — Soft-retire ST + STR

| | |
|--|--|
| **Action** | **Ngừng** STR rồi ST (confirm dialog) |
| **Network** | **POST** `…/status-reasons/{id}/retire` → **201** · **POST** `…/employment-statuses/{id}/retire` → **201** |
| **FE sau 2xx** | active rows gone |
| **F5** | still gone from active list |
| **Verdict** | 🟢 |

### UF-ST-INVALID + DENY + honesty

| UF | Verdict | Note |
|----|---------|------|
| Invalid `2bad` client | 🟢 | toast INVALID · inventPuts=0 |
| DENY Nest pos/dept admin | 🟢 | no invent tabs · jd-dynamic SoT visible |
| Consumer CLOSED | 🟢 | `emp-employment-status-select` PRESENT |
| Honesty / L1 RETAIN | 🟢 | false LOCKED · `EMPSTQA-MSK20G7H` RETAIN · C-SLICE |

---

## 4. AC summary

| ID | Verdict |
|----|---------|
| L0-STACK | 🟢 PASS |
| UF-TAB | 🟢 PASS |
| UF-PANEL | 🟢 PASS |
| UF-DENY-NEST-POS-DEPT | 🟢 PASS |
| UF-ST-INVALID | 🟢 PASS |
| UF-ST-CREATE | 🟢 PASS |
| UF-ST-F5 | 🟢 PASS |
| UF-ST-EFF-PICKER | 🟢 PASS |
| UF-ST-EDIT | 🟢 PASS |
| UF-ST-EDIT-F5 | 🟢 PASS |
| UF-STR-CREATE | 🟢 PASS |
| UF-STR-F5 | 🟢 PASS |
| UF-STR-RETIRE | 🟢 PASS |
| UF-ST-RETIRE | 🟢 PASS |
| UF-RETIRE-F5 | 🟢 PASS |
| UF-CONSUMER-CLOSED | 🟢 PASS |
| UF-HONESTY-LOCKED | 🟢 PASS |
| UF-L1-RETAIN | 🟢 PASS |

**Totals:** PASS=**18** · FAIL=**0** · NOTE=**0**

---

## 5. Matrix / residual note

| Residual | Status |
|----------|--------|
| **`R-PLT-EMP-ST-FE-ADMIN`** | **CLOSABLE** — Settings Nest ST/STR admin twin LIVE verified U65 create→edit→retire→F5 |
| Pack `R-PLT-EMP-FE-ADMIN-01` | may narrow to Nest **pos/dept DENY** notes only (PM board) — **not** module EMP UAT |
| Consumer FE CLOSED | **RETAIN** (smoke PRESENT only) |
| Nest pos/dept admin | **DENY RETAIN** |
| Honesty / C-SLICE | **false LOCKED** — **DENY** claim module EMP UAT / Phase1 DONE |

---

## 6. completion_report

**Closed:** U65 browser Settings **Trạng thái NV EMP** — create ST+STR · edit ST · soft-retire both · F5 persist · Network PUT/GET/retire 2xx on sealed Nest KEY only · invalid client toast · DENY Nest pos/dept admin · consumer select CLOSED smoke · honesty false · L1 `EMPSTQA-MSK20G7H` RETAIN · **`R-PLT-EMP-ST-FE-ADMIN` CLOSABLE**.

**Residual open:** none P0/P1 for this seat. Next = **qc** narrow GWC (C-SLICE honesty · no module UAT invent).

**Cấm upheld:** no seed · no API-only PASS · no Nest pos/dept invent · no module EMP UAT claim.

---

## 7. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QC-FE-01
from_role: pm
to_role: qc
lane: governance · narrow GWC
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QA-FE-01 PASS_TO_PM stamp EMPSTADMQA-MSKOJZ8G
entry_criteria: QA evidence browser 18/18 PASS · L1 EMPSTQA-MSK20G7H RETAIN · U65 zero-seed
scope: audit UF create/edit/retire/F5 + Network 2xx Nest KEY only; seal R-PLT-EMP-ST-FE-ADMIN CLOSABLE; honesty false LOCKED; C-SLICE-≠-MODULE; DENY Nest pos/dept admin; DENY module EMP UAT claim
must_keep: L1 EMPSTQA-MSK20G7H · consumer FE CLOSED · Settings job_titles/departments SoT · LVRULE HOLD
cấm: seed · flip ready · invent Nest pos/dept · claim module EMP UAT
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-qc-fe-01.md
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01.md
```
