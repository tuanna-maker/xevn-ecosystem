# QA-HDSD-MUTATE-RET-03-HRM-R3 — HRM mutate retest after FE-05

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R3` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (restarted FE-05 bundle) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-05-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r2-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r3-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-hrm-r3-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-hrm-r3-20260801/` |
| **Stamp** | `HDSDR3XKW` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-05 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** |
| HRM embed `:8080` | **Up** — stale bundle on first run; **restarted** `pnpm dev` in `apps/web/hrm` after killing pid on `:8080` |
| `node scripts/qc-dev-stack.mjs` | **checks PASS** — hrm/xbos/portal 200 (Windows UV crash exit waived) |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 4 | 04-02-01, 05-03-01, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 2 | 06-02-01, 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5** all 🟢; two primary TCs still not 🟢.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R2

| TC | R2 | R3 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 no POST | 🟡 **formReady=true · still no POST** | Toast thiếu ngày; date fields absent from dialog UI |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false | 🟡 **formReady=false · no POST** | JD/dept CatalogSearchPicker empty despite JD library row |
| TC-HDSD-08-02-01 leave | 🟡 POST 201 · no F5 marker | 🟢 **POST 201 · F5 marker in overview** | FE-05 verified after HRM restart + unique leave window |
| TC-HDSD-04-02-01 WF | 🟢 | 🟢 | regression preserved |
| TC-HDSD-10-04-01 internal | 🟢 | 🟢 | regression preserved |

---

## 3. TC evidence (U65 browser · data-testid)

### TC-HDSD-05-03-01 · UF-HRM-02 — Tạo nhân viên (regression)

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/employees?portal=1&…` → `#hdsd-employees-create-btn` → fill → `#hdsd-employee-form-submit` → F5 |
| **Network** | **`POST /api/hrm/employees` → 201** |
| **F5** | Row `NV HDSDR3XKW` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-fe — form-ready vs submit gate parity)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` → `#hdsd-contracts-form-submit` |
| **form-ready** | **`hdsd-contracts-form-ready` present** (employee + type + code prefilled) |
| **Network** | GET employees/settings-catalogs/contracts 200 · **no POST/PUT contract 2xx** |
| **FE sau click Lưu** | Toast: **«Vui lòng nhập ngày hiệu lực và ngày hết hạn»** — dialog vẫn mở |
| **Screenshot** | `06-02-form-ready.png` — dialog chỉ hiện NV/mã/tên; **không có trường ngày** |
| Root cause | `activeFormFields` (catalog `hrm_contract_form_fields`) **không gồm** `effective_date`/`expiry_date` → `isCreateFormReady` bỏ qua date gate; **`createContract` vẫn gọi `validateContractDatesForSubmit`** → toast chặn POST |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — catalog hydrate / picker binding)**

| Step | Evidence |
|------|----------|
| Click path | JD library ensure → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` → Lưu |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` — bảng Thư viện JD có 1 row |
| **form-ready** | **`hdsd-requisition-form-ready` absent** (timeout 22s) |
| **Network** | GET `job-templates` 200 · GET `settings-catalogs` 200 · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` — CatalogSearchPicker JD + Phòng ban: **«Chưa có mục trong danh mục»** |
| Root cause | `templates`/`departmentOptionsFromCatalog` không hydrate vào picker dù API 200; `applyTemplate(first JD)` không chạy → department/title/JD trống → form-ready false |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDR3XKW` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDR3XKW`** visible in overview (`08-02-leave-overview-f5.png`) |
| Note | Run 1 hit **409 overlap** (harness date collision); run 2 after HRM restart + unique date window → 🟢 |

---

### Regression matrix

| TC | UF | Verdict | Evidence |
|----|-----|---------|----------|
| TC-HDSD-04-02-01 | UF-XBOS-10 | 🟢 | `?settings=workflow_designer` · workflow text · GET definitions **200** |
| TC-HDSD-05-03-01 | UF-HRM-02 | 🟢 | POST employees **201** + F5 |
| TC-HDSD-10-04-01 | UF-HRM-MENU-05 | 🟢 | `/hr/internal_services` → `/hr/internal-services` · no console 404 |

---

## 4. Promoted / not promoted

**Promoted 🟢**

- TC-HDSD-08-02-01 UF-HRM-09 — **POST 201 + F5 marker in `hdsd-leave-overview-recent`** (FE-05 leave reason/overview fix verified)
- TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01 regression preserved

**Not promoted**

- **TC-HDSD-06-02-01** — form-ready true but **no POST 2xx**; form-ready/submit date gate mismatch when catalog omits date fields from UI
- **TC-HDSD-07-02-01** — **form-ready false**; CatalogSearchPicker JD/dept empty on create dialog despite library row + API 200

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-HD-DATE-PREFILL-02 | dev-fe | `D-HDSD-MUTATE-FE-06` | Align `createContract` date validation with `activeFormFields` OR always prefill dates when type requires end_date even if fields hidden |
| R-QA-YCTD-CATALOG-PICKER-02 | dev-fe | `D-HDSD-MUTATE-FE-06` | Fix templates/catalog → CatalogSearchPicker hydrate on create open; ensure `hdsd-requisition-form-ready` when JD library non-empty |
| OPS-HRM-EMBED-RESTART | devops/qa | note | Portal `:5173` proxies `/hr` → `:8080`; stale HRM vite blocked FE-04/05 until restart |

---

## completion_report

**Closed:** TC-HDSD-08-02-01 🟢 (FE-05 leave overview reason F5); regression TC-HDSD-04/05/10 🟢; L0 stack healthy.

**Open:** TC-HDSD-06-02-01 + TC-HDSD-07-02-01 remain 🟡 — primary mutate exit criteria not met.

## next_owner

pm → dev-fe

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-06
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r3-20260801.md FAIL_TO_PM — TC-HDSD-06-02-01 formReady=true but createContract toast thiếu ngày (date fields omitted from activeFormFields); TC-HDSD-07-02-01 CatalogSearchPicker JD/dept empty despite job-templates GET 200 + library row
exit_criteria: TC-HDSD-06-02-01 POST contract 2xx + F5 after wait hdsd-contracts-form-ready; TC-HDSD-07-02-01 POST requisition 2xx after wait hdsd-requisition-form-ready; preserve TC-HDSD-08-02-01 🟢 + regression 05/04/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-06-20260801.md READY_FOR_QA
spec_ref: UF-HRM-05 · UF-HRM-07 · Contracts.tsx isCreateFormReady vs useContracts.createContract · JobRequisitionsTab catalog hydrate
ack_status: READY_FOR_QA
pm_dispatch_hint: ensure HRM embed :8080 restarted before QA retest QA-HDSD-MUTATE-RET-03-HRM-R4
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r3-20260801.md`

## ack_status

**FAIL_TO_PM**
