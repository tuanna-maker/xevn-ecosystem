# QA-HDSD-MUTATE-RET-03-HRM-R2 — HRM mutate retest after FE-04

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R2` |
| **Program** | `P-HDSD-QA-SRS-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` (`dist/main.js`) · HRM embed `:8080` |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-04-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-20260731.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r2-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-hrm-r2-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-hrm-r2-20260801/` |
| **Stamp** | `HDSDQG3HJ` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-04 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** — restarted `pnpm dev` in `apps/web/web-portal` |
| HRM embed `:8080` | **Up** |
| `node scripts/qc-dev-stack.mjs` | **exit 0** — hrm/xbos/portal 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 3 | 04-02-01, 05-03-01, 10-04-01 |
| 🟡 BLOCKED | 3 | 06-02-01, 07-02-01, 08-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5** and **TC-HDSD-08-02-01 F5 marker in `hdsd-leave-overview-recent`**; three primary TCs not 🟢.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM (2026-07-31)

| TC | RET-03-HRM | RET-03-HRM-R2 | Ghi chú |
|----|------------|---------------|---------|
| TC-HDSD-05-03-01 NV | 🟢 POST 201 + F5 | 🟢 **regression preserved** | — |
| TC-HDSD-06-02-01 HĐ | 🟡 no POST | 🟡 **formReady=true · still no POST** | Toast: thiếu ngày hiệu lực/hết hạn |
| TC-HDSD-07-02-01 YCTD | 🟡 no POST | 🟡 **formReady=false · no POST** | JD + Phòng ban catalog trống trên UI |
| TC-HDSD-08-02-01 leave | 🟢 POST · 🟡 F5 marker | 🟡 **POST 201 · overview panel có row · marker absent** | Panel FE-04 live; reason không hiển thị |
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
| **F5** | Row `NV HDSDQG3HJ` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-fe — form-ready incomplete vs submit validation)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` → `#hdsd-contracts-form-submit` |
| **form-ready** | **`hdsd-contracts-form-ready` present** (employee + type prefilled) |
| **Network** | GET employees/settings-catalogs 200 · **no POST/PUT contract 2xx** |
| **FE sau click Lưu** | Toast: **«Vui lòng nhập ngày hiệu lực và ngày hết hạn»** — dialog vẫn mở |
| Root cause | `isCreateFormReady` không gồm `effective_date` / `expiry_date`; submit vẫn chặn thiếu ngày → harness click Lưu không tạo POST |
| Screen | `06-02-after-save.png` |

**spec_ref:** UF-HRM-05 · D-HDSD-MUTATE-FE-04 partial — prefill type OK; **date prefill hoặc mở rộng form-ready** còn thiếu

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe / catalog — form-ready never reached)**

| Step | Evidence |
|------|----------|
| Click path | JD library probe → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → JD combobox → wait ready |
| **form-ready** | **`hdsd-requisition-form-ready` absent** (timeout 22s) |
| **Network** | GET job-templates/requisitions 200 · **no POST requisition 2xx** |
| **FE** | Dialog mở; banner **«Chưa có JD trong thư viện»** + **«Chưa có mục trong danh mục»** (Phòng ban); title/dept/JD snapshot trống |
| Root cause | Department + JD picker options empty on create dialog despite table row count=1 in harness JD tab probe — `applyTemplate` / department backfill cannot run without catalog items |
| Screen | `07-02-create-form.png` |

**spec_ref:** UF-HRM-07 · R-QA-YCTD-FORM-FILL-01 carry — FE-04 backfill chưa đạt khi catalog trống trên picker

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟡 BLOCKED (POST 🟢 · F5 overview marker ✗)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo → PORTAL-GCEO · LVT_01 · reason `QA-LEAVE-HDSDQG3HJ` → Gửi → F5 overview |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** · GET leave-requests 200 refetch |
| **FE sau 2xx** | Dialog closed |
| **F5 overview** | `[data-testid=hdsd-leave-overview-recent]` **present** · row **CEO Tập đoàn** 09/12/2026 pending visible · **marker text absent** in panel (no reason line under CEO row) |
| Root cause | `LeaveOverviewRecentPanel` renders row but **reason không hiển thị** cho đơn vừa tạo (API `reason` null/empty hoặc panel sort không surface marker) |
| Screen | `08-02-leave-overview-f5.png` |

**spec_ref:** UF-HRM-09 · FE-04 panel wired; **AC F5 marker chưa đạt**

---

## 4. Regression (confirmed 🟢)

| TC | UF | Verdict | Detail |
|----|-----|---------|--------|
| TC-HDSD-04-02-01 | UF-XBOS-10 | 🟢 | `?settings=workflow_designer` · workflow text · GET definitions **200** |
| TC-HDSD-05-03-01 | UF-HRM-02 | 🟢 | POST employees **201** + F5 |
| TC-HDSD-10-04-01 | UF-HRM-MENU-05 | 🟢 | `/hr/internal_services` → `/hr/internal-services` · no console 404 |

---

## 5. completion_report

**Closed / regression 🟢:**

- L0 stack + FE↔BE health exit 0
- TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01 preserved
- FE-04 partial: contract type prefill + `hdsd-contracts-form-ready` sentinel observable; leave overview panel mounted

**Not promoted (exit criteria FAIL):**

- **TC-HDSD-06-02-01** — form-ready true but **no POST**; toast requires effective/expiry dates
- **TC-HDSD-07-02-01** — **form-ready false**; JD + department catalog empty on create dialog
- **TC-HDSD-08-02-01** — POST 201 OK; **F5 marker `QA-LEAVE-*` not in `hdsd-leave-overview-recent`**

**Residual (dispatch dev-fe):**

| ID | Layer | Fix hint |
|----|-------|----------|
| R-QA-HD-DATE-PREFILL-01 | dev-fe | Prefill `effective_date`/`expiry_date` on create OR include in `isCreateFormReady` + harness wait |
| R-QA-YCTD-CATALOG-PICKER-01 | dev-fe | Ensure JD + department options hydrate on requisition dialog (lazy catalog / picker bind) |
| R-QA-LEAVE-OVERVIEW-REASON-01 | dev-fe | Persist + render `reason` in `LeaveOverviewRecentPanel` for newly POSTed row (sort by created_at desc) |

---

## 6. next_owner

`pm` → dispatch **dev-fe** `D-HDSD-MUTATE-FE-05` (contract dates + YCTD catalog hydrate + leave reason on overview) → **qa** RET-03-HRM-R3

---

## 7. next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-05
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r2-20260801.md FAIL_TO_PM — TC-HDSD-06-02-01 toast thiếu ngày HĐ; TC-HDSD-07-02-01 catalog JD/dept trống; TC-HDSD-08-02-01 reason absent on hdsd-leave-overview-recent after POST 201
exit_criteria: (1) Contract create — prefill or default effective/expiry dates → POST 2xx + F5; form-ready aligns with submit validation. (2) YCTD — JD pick + department backfill → hdsd-requisition-form-ready → POST 2xx. (3) Leave — reason QA-LEAVE-* visible in hdsd-leave-overview-recent after F5. Preserve 05+04+10 🟢.
read_first: qa-hdsd-mutate-ret-03-hrm-r2-20260801.md · d-hdsd-mutate-fe-04-20260801.md · Contracts.tsx · JobRequisitionsTab.tsx · LeaveOverviewRecentPanel.tsx
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R3
```

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R3
from_role: pm | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: D-HDSD-MUTATE-FE-05 READY_FOR_QA; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 + 08-02-01 all 🟢 POST 2xx + F5/marker; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r3-20260801.md
cấm: seed
ack_status: PASS_TO_PM or FAIL_TO_PM
```

---

## 8. Handoff contract

- **completion_report:** RET-03-HRM-R2 executed U65 browser harness with form-ready waits. Regression NV/WF/internal_services 🟢. Primary mutate TCs 06/07/08 remain 🟡 — FE-04 partial only.
- **next_owner:** pm → dev-fe
- **next_dispatch_prompt:** see §7
- **evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r2-20260801.md`
- **ack_status:** `FAIL_TO_PM`
