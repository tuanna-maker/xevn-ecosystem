# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01` |
| **resume_chunk** | **K5** |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `ATTPLATQA2-MSIVNE4A` |
| **U65** | zero-seed · **browser-only** FE click path |
| **Honesty** | `attendance_uat_ready=false` · DENY module ATT UAT / J-* / Phase1 · **cấm reopen** ATT-QC-01 L1 |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (browser AC-PLT-ATT-01..02) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| HRM FE proxy | `:8080/hr/` via portal `/hr/*` |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-qa-02/01..10-*.png` |

**spec_ref:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §5 **AC-PLT-ATT-01..02** · FE-01 §3 click path · L1 baseline QA-01 / QC-01 GWC SEAL (API-only — not reopened)

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Settings** → tab **Loại phép ATT** (`settings-tab-att-leave-types`) | 🟢 panel `settings-att-leave-types` |
| 2 | Nhập key `hr_custom_09_msivne4a` · nhãn · **Tạo loại phép** (`hdsd-att-leave-type-save`) | Network **PUT** `/api/hrm/attendance/leave-types` → **200** id=`94df8e8b-…` |
| 3 | **F5** → tab lại → row `settings-att-leave-type-row-hr_custom_09_msivne4a` | 🟢 còn sau F5 |
| 4 | **Chấm công** → **Nghỉ phép** (`att-leave-precision`) → Tạo đơn | CatalogSearchPicker |
| 5 | Picker chọn `hr_custom_09_msivne4a` | GET `/leave-types/effective?company_id=main` **200** · `hasNewKey=true` · sample includes open key + `lvt_01..04` (not closed enum) |
| 6 | Leave history prep (consumer after FE catalog) | POST leave-requests → **201** `HRM-LEAVE-201` id=`f1fbed06-…` type=`hr_custom_09_msivne4a` |
| 7 | Settings → **Ngừng** (`hdsd-att-leave-type-retire-{key}`) | Retire **201** · active row gone |
| 8 | Form picker / effective | effective **không** còn key · picker search miss |
| 9 | List đơn cũ | leave id vẫn `leave_type=hr_custom_09_msivne4a` · FE text có key/label |
| 10 | must_keep | `work_shifts` **200** · `attendance-sheets` **200** · shifts UI load |

**HDSD ids exercised:** `settings-tab-att-leave-types` · `settings-att-leave-types` · `settings-att-leave-types-table` · `hdsd-att-leave-type-key|name|save|reload|retire-*` · `att-leave-precision` · `att-leave-create-dialog-precision`

**Seed:** none.

---

## 3. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-ATT-01** | Settings Tạo loại phép → 2xx → F5 row → form picker chọn mã mới | PUT **200** · F5 row · picker select `hr_custom_09_msivne4a` · effective has key | 🟢 |
| **AC-PLT-ATT-02** | Retire → picker ẩn · đơn cũ giữ key | Retire **201** · effective hide · history key intact | 🟢 |
| NO-HARDCODE | Không FE hardcode chỉ LVT_01..04 | effective sample includes `hr_custom_09_*` open keys | 🟢 |
| must_keep | work_shifts + sheets load | both **200** | 🟢 |

**Out of scope / DENIED this seat:** AC-PLT-ATT-03 browser optional (L1 already) · J-* L2.5 · module ATT UAT · `attendance_uat_ready=true` · reopen ATT-QC-01 L1.

---

## 4. Key network stamps

```text
PUT  /api/hrm/attendance/leave-types                          → 200  key=hr_custom_09_msivne4a id=94df8e8b-…
GET  /api/hrm/attendance/leave-types?company_id=main&status=active → 200 (F5 row)
GET  /api/hrm/attendance/leave-types/effective?company_id=main → 200 total≥1 hasNewKey
POST /api/hrm/attendance/leave-requests                       → 201 HRM-LEAVE-201 leave_type=hr_custom_09_msivne4a
POST /api/hrm/attendance/leave-types/:id/retire?company_id=main → 201
GET  …/leave-types/effective (after retire)                   → key absent
GET  …/leave-requests                                         → id f1fbed06-… leave_type intact
GET  …/work-shifts · …/attendance-sheets                      → 200 must_keep
```

---

## 5. Honesty locks

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** — browser AC slice PASS ≠ module UAT |
| Module ATT UAT / J-* / Phase1 DONE | **DENIED** |
| Seed | **none** |
| ATT-QC-01 L1 GWC | **SEAL retained** — not reopened |

---

## 6. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No browser blocker this stamp | — |

**OBS (process):** Portal `/hr/*` requires HRM Vite `:8080` — mid-session turbo crash → proxy 500 until `pnpm --filter vite_react_shadcn_ts dev` restarted. Not a product defect.

---

## 7. completion_report

**Closed:** K5 browser U65 AC-PLT-ATT-01..02 PASS after FE-01. Settings Loại phép ATT create open key `hr_custom_09_msivne4a` → PUT 200 → F5 row → Nghỉ phép picker selects new key from effective (not hardcode-only LVT_01..04) → retire 201 hides from picker → historical leave `f1fbed06-…` keeps `leave_type` · must_keep shifts/sheets 200. Stamp `ATTPLATQA2-MSIVNE4A`. 13/13 AC PASS. Zero-seed.

**Residual:** `attendance_uat_ready=false` until program promotes module ATT / J-* separately · DENY module UAT claim from this seat.

**Forbidden claims:** ATT module UAT-ready · Phase1 DONE · flip `attendance_uat_ready=true` · reopen L1 QC-01.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-02-browser.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02
priority: P2
resume_chunk: K5

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-02.md
2. docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-02-browser.json
3. docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md
4. docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-01.md (L1 GWC SEAL — do not reopen API-only)

## task
Narrow QC gate on browser AC-PLT-ATT-01..02 after QA-02 stamp ATTPLATQA2-MSIVNE4A.
- Audit click path Settings Loại phép ATT → PUT 2xx → F5 → Nghỉ phép picker → retire hide → history key
- must_keep shifts/sheets cited
- Honesty: attendance_uat_ready=false · C-SLICE-≠-MODULE · DENY module ATT UAT / J-* / Phase1
- Cấm: reopen ATT-QC-01 L1 · invent ready=true · seed

## exit
GO WITH CONDITIONS (browser AC accept · module UAT denied) or NO-GO with defects
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-02.md
ack_status: PASS_TO_PM
```
