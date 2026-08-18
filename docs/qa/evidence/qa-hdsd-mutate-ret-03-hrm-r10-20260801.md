# QA-HDSD-MUTATE-RET-03-HRM-R10 — HRM mutate retest after FE-12

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R10` |
| **Program** | `P-HDSD-ECOSYSTEM-03` · BF-03 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid 6792→18416) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-12-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r9-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (SKIP_L0=1 after manual L0) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R10-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` (batch run) |
| **Stamp** | `HDSDUGH5T` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-12 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed pid **6792**; restarted `pnpm exec vite --host 127.0.0.1 --port 8080` (Vite ready 560ms); warm-up `/hr/employees` 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 5 | 04-02-01, 05-03-01, **06-02-01**, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 1 | 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-07-02-01 POST 2xx + F5**; **TC-HDSD-06-02-01** and **TC-HDSD-08-02-01** primary mutate 🟢 + regression preserved.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R9

| TC | R9 | R10 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟢 POST **201** | 🟢 POST **201** · `position_key=CEO` · `contract_code=HD-UH719` | **Preserved** |
| TC-HDSD-07-02-01 YCTD | 🟡 storm=**1** · formReady=false | 🟡 storm=**1** · formReady=false | **FE-12 no delta** — dialog still shows «Chưa có JD trong thư viện» despite jdEnsure existing count=1 |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 POST 201 · F5 marker `QA-LEAVE-HDSDUGH5T` | **Preserved** |
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
| **F5** | Row `NV HDSDUGH5T` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **5ms** |
| **Network** | **`POST /api/hrm/contracts-insurance/contracts` → 201** |
| **POST body** | `position_key=CEO` · `contract_code=HD-UH719` · `employee_id=654d5856-6ce0-4b65-a92b-393c615d8d72` · `contract_type=HDHV` · dates prefilled |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` · `06-02-after-f5.png` |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — templates[] empty in create dialog despite JD library row + GET 200)**

| Step | Evidence |
|------|----------|
| Click path | JD library existing (count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** after 22s |
| **job-templates storm** | **1 GET** `/api/hrm/recruitment/job-templates` during create dialog — **PASS** (storm guard preserved) |
| **Network** | GET requisitions/settings-catalogs/job-templates **200** · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — UI shows **«Chưa có JD trong thư viện»** + empty title; dept prefilled «Tập đoàn XEVN…» |
| Root cause | `isRequisitionCreateFormReady` requires `templates[0].id`; create dialog `templates[]` still empty after FE-12 async refetch — picker/catalog gate blocks before `applyTemplate(templates[0])` runs; jd library tab row ≠ templates hook state on requisitions tab |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDUGH5T` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2028-05-07` · `end_date=2028-05-09` · `reason=QA-LEAVE-HDSDUGH5T` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDUGH5T` visible** (`08-02-leave-overview-f5.png`) |

---

### Regression matrix

| TC | UF | Verdict | Evidence |
|----|-----|---------|----------|
| TC-HDSD-04-02-01 | UF-XBOS-10 | 🟢 | `?settings=workflow_designer` · canvas dots · GET definitions **200** |
| TC-HDSD-05-03-01 | UF-HRM-02 | 🟢 | POST employees **201** + F5 |
| TC-HDSD-10-04-01 | UF-HRM-MENU-05 | 🟢 | `/hr/internal_services` → `/hr/internal-services` · no console 404 |

---

## 4. Promoted / not promoted

**Promoted 🟢**

- **TC-HDSD-06-02-01** — POST **201** · `position_key=CEO` · preserved from R9
- TC-HDSD-08-02-01 — POST **201** + F5 overview marker (preserved)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-07 — **job-templates storm ≤1** (FE-11/FE-12 storm guard preserved)

**Not promoted**

- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` timeout 22s; no POST 2xx; F5 persist not verified; **FE-12 did not change outcome vs R9**

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-YCTD-TEMPLATES-EMPTY-R10 | dev-fe | `D-HDSD-MUTATE-FE-13` (proposed) | After `handleOpenCreate` refetch: ensure `templates.length>0` before dialog render OR auto-select first template when GET 200 returns rows; fix «Chưa có JD» when jd library has rows; wire `applyTemplate(templates[0])` when catalog picker empty but API has data |

**pm_dispatch_hint:** BF-03 gate **still blocked** — do **not** dispatch `QC-HDSD-BF-03-GATE-01` until TC-HDSD-07-02-01 POST 2xx. TC-HDSD-06-02-01 🟢 only enables partial BF-03 progress.

---

## completion_report

**Closed:** L0 exit 0 (fe-be 8/8); HRM embed :8080 restarted; TC-HDSD-06-02-01 🟢 POST **201** preserved; TC-HDSD-08-02-01 🟢; regression TC-HDSD-04/05/10 🟢; job-templates storm=1 during dialog.

**Open:** TC-HDSD-07-02-01 — **FE-12 no improvement** vs R9: form-ready timeout, create dialog shows empty JD library, `templates[]` not hydrated despite jdEnsure count=1 and GET job-templates **200**. Primary exit criteria **not met**.

## next_owner

pm → **dev-fe** (`D-HDSD-MUTATE-FE-13` templates hook ↔ create dialog sync)

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-13
from_role: qa | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r10-20260801.md — TC-HDSD-07-02-01 formReady=false after 22s; jdEnsure existing count=1 but create dialog shows «Chưa có JD trong thư viện»; job-templates GET 200 storm=1; templates[] empty blocks isRequisitionCreateFormReady; restart HRM embed :8080 before retest
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-13-20260801.md READY_FOR_QA
spec_ref: UF-HRM-07 · JobRequisitionsTab · useJobTemplates · handleOpenCreate · isRequisitionCreateFormReady
UF: UF-HRM-07
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R11 after READY; QC-HDSD-BF-03-GATE-01 only when 06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r10-20260801.md`

## ack_status

**FAIL_TO_PM**
