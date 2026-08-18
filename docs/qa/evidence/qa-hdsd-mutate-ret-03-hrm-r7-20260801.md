# QA-HDSD-MUTATE-RET-03-HRM-R7 — HRM mutate retest after FE-09

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R7` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid 18032→21312) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-09-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r6-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (FE-09 updated harness) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R7-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` (same run batch) |
| **Stamp** | `HDSDTA1G6` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-09 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed pid **18032**; restarted `pnpm dev --host 127.0.0.1 --port 8080` (Vite ready 426ms); warm-up `/hr/employees` 200 |
| `node scripts/qc-dev-stack.mjs` | **exit 0** (services healthy; win async assert crash waived) |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 4 | 04-02-01, 05-03-01, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 2 | 06-02-01, 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5**; only **TC-HDSD-08-02-01** primary mutate 🟢.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R6

| TC | R6 | R7 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 formReady=**false** (22009ms) · no POST | 🟡 formReady=**true** (3ms) · **no POST** | **Partial fix** — FE-09 sentinel restored; submit still blocked client-side (no Network POST) |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false · storm=0 | 🟡 formReady=false · storm=0 | **No improvement** — `hdsd-requisition-form-ready` still absent within 22s |
| TC-HDSD-08-02-01 leave | 🟡 POST **409** overlap | 🟢 **POST 201** · F5 marker `QA-LEAVE-HDSDTA1G6` | **Fixed** — FE-09 overlap prefill + STAMP-hash dates |
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
| **F5** | Row `NV HDSDTA1G6` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-fe — form-ready 🟢 but no POST; cannot verify position_key on wire)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **3ms** (FE-09 fix confirmed) |
| **Network** | GET employees/settings-catalogs/contracts 200 · **no POST** `/api/hrm/contracts-insurance/contracts` |
| **POST body check** | `position_key=false` · `contract_code=false` (no submit reached API) |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` — dialog open; sentinel visible; save click did not emit POST |
| Root cause (hypothesis) | Client-side submit guard still blocks before API despite form-ready sentinel — likely missing employee/type selection in harness path or `resolveContractCreatePositionKey` only runs on submit but validation fails silently |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — dept/template readiness gap persists)**

| Step | Evidence |
|------|----------|
| Click path | JD library existing (count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** after 22s |
| **job-templates storm** | **0 GET** during create dialog — refetch guard still **PASS** |
| **Network** | GET requisitions/settings-catalogs 200 · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — dialog open; sentinel missing |
| Root cause | FE-09 `isRequisitionCreateFormReady` template fallback does not surface sentinel for pilot JD within 22s |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDTA1G6` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2027-07-11` · `end_date=2027-07-13` · `reason=QA-LEAVE-HDSDTA1G6` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDTA1G6` visible** (`08-02-leave-overview-f5.png`) |

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

- TC-HDSD-08-02-01 — POST **201** + F5 overview marker (restored vs R6 409)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-06 form-ready sentinel (3ms vs R6 timeout) — partial progress only

**Not promoted**

- **TC-HDSD-06-02-01** — no POST; cannot verify `position_key` + `contract_code` in Network body or F5 persist
- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` never appears; no POST 2xx

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-HD-SUBMIT-NO-POST-R7 | dev-fe | `D-HDSD-MUTATE-FE-10` (proposed) | Contract form-ready 🟢 but `#hdsd-contracts-form-submit` click yields no POST — wire employee picker + submit path; ensure `resolveContractCreatePositionKey` runs and POST fires |
| R-QA-YCTD-FORMREADY-R7 | dev-fe | `D-HDSD-MUTATE-FE-10` (proposed) | YCTD `isRequisitionCreateFormReady` still false for existing JD — align sentinel with template fallback |
| R-QA-HD-BE-400 | dev-be | `D-HDSD-MUTATE-BE-01` | **Not reached** — no contract POST this run |

**pm_dispatch_hint:** BF-03 gate blocked until 06+07 POST 2xx; do **not** dispatch `QC-HDSD-BF-03-GATE-01` yet.

---

## completion_report

**Closed:** L0 exit 0; HRM embed :8080 restarted; TC-HDSD-08-02-01 🟢 (leave overlap fixed); TC-HDSD-06 form-ready restored (3ms); regression TC-HDSD-04/05/10 🟢.

**Open:** TC-HDSD-06-02-01 — form-ready without POST; TC-HDSD-07-02-01 — requisition form-ready still timeout. Primary mutate exit criteria **not met**.

## next_owner

pm → dev-fe (contract submit + YCTD form-ready)

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-10
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r7-20260801.md FAIL_TO_PM — TC-HDSD-06-02-01 formReady=true (3ms) but no POST (position_key/contract_code not on wire); TC-HDSD-07-02-01 hdsd-requisition-form-ready still timeout 22s; TC-HDSD-08-02-01 🟢 preserved
exit_criteria: TC-HDSD-06-02-01 form-ready ≤22s → POST contract 2xx + Network body position_key + contract_code + F5; TC-HDSD-07-02-01 form-ready → POST requisition 2xx + F5; TC-HDSD-08-02-01 🟢 preserved; regression 05+04+10 🟢; evidence docs/qa/evidence/d-hdsd-mutate-fe-10-20260801.md READY_FOR_QA
spec_ref: UF-HRM-05 · UF-HRM-07 · UF-HRM-09 · Contracts.tsx submit path · jobRequisitionUi isRequisitionCreateFormReady
UF: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: restart HRM embed :8080 before QA-HDSD-MUTATE-RET-03-HRM-R8; if POST 400 with position_key in body → D-HDSD-MUTATE-BE-01
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r7-20260801.md`

## ack_status

**FAIL_TO_PM**
