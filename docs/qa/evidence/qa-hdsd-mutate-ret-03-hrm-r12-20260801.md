# QA-HDSD-MUTATE-RET-03-HRM-R12 — HRM mutate retest after FE-14

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R12` |
| **Program** | `P-HDSD-ECOSYSTEM-03` · BF-03 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid 4456→16912) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-14-20260801.md` · `docs/qa/evidence/d-hdsd-mutate-be-03-20260801.md` (BE parity OK) |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r11-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (SKIP_L0=1 after manual L0) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R6-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` |
| **Stamp** | `HDSDV4RNH` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-14 READY_FOR_QA | **PASS** (entry) | shared `useJobTemplates` + direct API hydrate |
| D-HDSD-MUTATE-BE-03 BE parity | **PASS** (entry) | scope parity confirmed; no BE change required |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed pid **4456**; restarted `pnpm exec vite --host 127.0.0.1 --port 8080` (Vite ready ~692ms); warm-up `/hr/employees` 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 5 | 04-02-01, 05-03-01, **06-02-01**, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 1 | 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-07-02-01 POST 2xx + F5**; **TC-HDSD-06-02-01** and **TC-HDSD-08-02-01** primary mutate 🟢 + regression preserved.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R11

| TC | R11 | R12 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟢 POST **201** | 🟢 POST **201** · `position_key=CEO` · `contract_code=HD-V5HOL` | **Preserved** |
| TC-HDSD-07-02-01 YCTD | 🟡 storm=**1** · formReady=false | 🟡 storm=**2** · formReady=false | **FE-14 no delta on form-ready** — dialog still «Chưa có JD trong thư viện» + empty title despite jdEnsure count=1; extra GET from direct API fallback |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 POST 201 · F5 marker `QA-LEAVE-HDSDV4RNH` | **Preserved** |
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
| **F5** | Row `NV HDSDV4RNH` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **7ms** |
| **Network** | **`POST /api/hrm/contracts-insurance/contracts` → 201** |
| **POST body** | `position_key=CEO` · `contract_code=HD-V5HOL` · `employee_id=8f8d0059-459f-4071-9d95-c564e5b0e1f0` · `contract_type=HDHV` |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` · `06-02-after-f5.png` |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — `effectiveTemplates[]` still empty in create dialog despite JD library row + GET 200 ×2)**

| Step | Evidence |
|------|----------|
| Click path | JD library existing (count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** after 22s |
| **job-templates storm** | **2 GET** `/api/hrm/recruitment/job-templates?company_id=main` during create dialog — **PASS** (≤5; storm guard OK; +1 vs R11 from FE-14 direct fallback) |
| **Network** | GET requisitions/settings-catalogs/job-templates **200** · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — UI shows **«Chưa có JD trong thư viện»** + **«Chưa có mục trong danh mục»** + empty title; dept prefilled «Tập đoàn XEVN…» |
| Root cause | FE-14 shared page hook + direct `listJobDescriptionTemplates` fallback did **not** change runtime outcome vs R11: `effectiveTemplates.length===0` → `isRequisitionCreateFormReady` false; jd-library tbody row ≠ create dialog template state |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDV4RNH` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2028-03-15` · `end_date=2028-03-17` · `reason=QA-LEAVE-HDSDV4RNH` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDV4RNH` visible** (`08-02-leave-overview-f5.png`) |

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

- **TC-HDSD-06-02-01** — POST **201** · `position_key=CEO` · preserved from R11
- TC-HDSD-08-02-01 — POST **201** + F5 overview marker (preserved)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-07 — **job-templates storm ≤5** (FE-11 storm guard preserved; FE-14 added +1 GET, still within gate)

**Not promoted**

- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` timeout 22s; no POST 2xx; F5 persist not verified; **FE-14 did not change outcome vs R11**

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-YCTD-TEMPLATES-EMPTY-R12 | dev-fe | `D-HDSD-MUTATE-FE-15` (suggested) | Browser: jd-library tbody count=1 but create dialog `effectiveTemplates=[]` after FE-14 shared hook + direct API fallback; capture GET `/api/hrm/recruitment/job-templates?company_id=main` **response body** during `handleOpenCreate` (row count + ids); verify `resolveEffectiveJobTemplates` union merge receives rows; ensure `setDialogHydratedTemplates` + `applyTemplate` runs before `isRequisitionCreateFormReady` gate; if API body has rows but dialog empty → FE state/setter race; if API body `[]` while library tab shows row → investigate library tab data source vs list endpoint |

**pm_dispatch_hint:** BF-03 gate **still blocked** — do **not** dispatch `QC-HDSD-BF-03-GATE-01` until TC-HDSD-07-02-01 POST 2xx. TC-HDSD-06-02-01 🟢 only enables partial BF-03 progress.

---

## completion_report

**Closed:** L0 exit 0 (fe-be 8/8); HRM embed :8080 restarted (pid 4456→16912); TC-HDSD-06-02-01 🟢 POST **201** preserved; TC-HDSD-08-02-01 🟢; regression TC-HDSD-04/05/10 🟢; job-templates storm=2 during dialog (within gate).

**Open:** TC-HDSD-07-02-01 — **FE-14 no improvement** vs R11: form-ready timeout, create dialog shows empty JD library + empty title, `effectiveTemplates` not hydrated despite jdEnsure count=1 and GET job-templates **200** (×2 during dialog). Primary exit criteria **not met**.

## next_owner

pm → **dev-fe** (`D-HDSD-MUTATE-FE-15` — debug GET response body vs `effectiveTemplates` + applyTemplate timing) — BE triage closed by D-HDSD-MUTATE-BE-03

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-15
from_role: qa | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r12-20260801.md — TC-HDSD-07-02-01 formReady=false after 22s; jdEnsure existing count=1 but create dialog shows «Chưa có JD trong thư viện» + empty title; job-templates GET 200 storm=2; FE-14 shared hook + direct API fallback no delta vs R11; D-HDSD-MUTATE-BE-03 closed (BE parity OK); restart HRM embed :8080 before retest
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-15-20260801.md READY_FOR_QA
spec_ref: UF-HRM-07 · Recruitment.tsx sharedTemplates · JobRequisitionsTab.handleOpenCreate · resolveEffectiveJobTemplates · isRequisitionCreateFormReady · capture GET job-templates response body in DevTools during open
UF: UF-HRM-07
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R13 after READY; QC-HDSD-BF-03-GATE-01 only when 06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r12-20260801.md`

## ack_status

**FAIL_TO_PM**
