# QA-HDSD-MUTATE-RET-03-HRM-R8 — HRM mutate retest after FE-10

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R8` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid 28220→4524) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-10-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r7-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (FE-10 retest; SKIP_L0=1 after manual L0) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R8-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` (same run batch) |
| **Stamp** | `HDSDTLAAV` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-10 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed pid **28220**; restarted `pnpm exec vite --host 127.0.0.1 --port 8080` (Vite ready 417ms); warm-up `/hr/employees` 200 |
| `node scripts/qc-dev-stack.mjs` | **exit 0** (services healthy; win async assert crash waived) |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 4 | 04-02-01, 05-03-01, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 2 | 06-02-01, 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5**; only **TC-HDSD-08-02-01** primary mutate 🟢 + regression preserved.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R7

| TC | R7 | R8 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 formReady 🟢 · **no POST** | 🟡 formReady 🟢 (3ms) · **POST 400** · `position_key`+`contract_code` on wire | **FE-10 partial** — submit path fixed; BE rejects pass-through `position_key=QAHDSDTLAAV` (employee_code fallback) |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false · storm=**0** | 🟡 formReady=false · storm=**374** | **Regression** — FE-10 internal template refetch loop; sentinel still absent 22s |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 POST 201 · F5 marker `QA-LEAVE-HDSDTLAAV` | **Preserved** |
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
| **F5** | Row `NV HDSDTLAAV` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-be — POST 400 with position_key on wire; FE-10 submit fix confirmed)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **3ms** |
| **Network** | **`POST /api/hrm/contracts-insurance/contracts` → 400** |
| **POST body** | `position_key=QAHDSDTLAAV` · `contract_code=HD-TM1NP` · `employee_id=20c6f74e-179b-4eec-973c-df8df3cabde6` · `contract_type=fixed_term` · dates prefilled |
| **Console** | `Failed to load resource: 400 (Bad Request)` on contract POST |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` — dialog stayed open after 400 |
| Root cause | FE-10 pass-through resolver emits **employee_code** as `position_key` when catalog empty; BE (`D-HDSD-MUTATE-BE-01` scope) rejects — needs catalog-valid key or BE resolver for pass-through codes |

**pm_dispatch_hint match:** POST **400** with **`position_key` present** in Network body → escalate **`D-HDSD-MUTATE-BE-01`** (or BE accepts employee_code fallback per API_DESIGN).

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — job-templates refetch storm + form-ready timeout; regression vs R7 storm=0)**

| Step | Evidence |
|------|----------|
| Click path | JD library existing (count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** after 22s |
| **job-templates storm** | **374 GET** `/api/hrm/recruitment/job-templates` during create dialog — **FAIL** (R7 storm=0) |
| **Network** | GET requisitions/settings-catalogs 200 · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — sentinel missing; storm likely from FE-10 `refetch on open if library empty` loop |
| Root cause | Internal `useJobTemplates` refetch without guard when parent prop `[]`; blocks `isRequisitionCreateFormReady` within 22s |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDTLAAV` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2027-05-09` · `end_date=2027-05-11` · `reason=QA-LEAVE-HDSDTLAAV` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDTLAAV` visible** (`08-02-leave-overview-f5.png`) |

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

- TC-HDSD-08-02-01 — POST **201** + F5 overview marker (preserved)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-06 — **POST reaches API** with `position_key` + `contract_code` on wire (FE-10 closed R7 no-POST gap)

**Not promoted**

- **TC-HDSD-06-02-01** — POST **400** not 2xx; F5 persist not verified for new contract row
- **TC-HDSD-07-02-01** — form-ready timeout + job-templates storm **374**; no POST 2xx

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-HD-POST400-POSKEY-R8 | dev-be | `D-HDSD-MUTATE-BE-01` | Contract POST 400 with `position_key=QAHDSDTLAAV` (employee_code fallback) — accept catalog resolution or map pass-through per API_DESIGN |
| R-QA-YCTD-STORM-R8 | dev-fe | `D-HDSD-MUTATE-FE-11` (proposed) | YCTD job-templates **374 GET storm** + form-ready still false — guard refetch loop from FE-10 internal fetch |

**pm_dispatch_hint:** BF-03 gate blocked; **do not** dispatch `QC-HDSD-BF-03-GATE-01`. Parallel: **BE-01** for contract 400 + **FE-11** for YCTD storm.

---

## completion_report

**Closed:** L0 exit 0; HRM embed :8080 restarted; FE-10 contract submit path — POST fires with `position_key`+`contract_code`; TC-HDSD-08-02-01 🟢; regression TC-HDSD-04/05/10 🟢.

**Open:** TC-HDSD-06-02-01 POST **400** (BE); TC-HDSD-07-02-01 form-ready + **374** job-templates storm (FE regression). Primary mutate exit criteria **not met**.

## next_owner

pm → **dev-be** (`D-HDSD-MUTATE-BE-01`) + **dev-fe** (`D-HDSD-MUTATE-FE-11` YCTD storm)

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-BE-01
from_role: qa | to_role: dev-be
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md — TC-HDSD-06-02-01 POST 400 with position_key=QAHDSDTLAAV (employee_code fallback) + contract_code=HD-TM1NP on wire; form-ready 3ms; hrm-api :28001
exit_criteria: TC-HDSD-06-02-01 browser POST → 2xx HRM-CON-201 + F5 row; preserve TC-HDSD-08-02-01 🟢; jest contracts-insurance PASS; evidence docs/qa/evidence/d-hdsd-mutate-be-01-ret-20260801.md READY_FOR_QA
spec_ref: UF-HRM-05 · API_DESIGN_HRM_CONTRACTS_INS §3 · resolveContractPositionKey pass-through
UF: UF-HRM-05
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: parallel D-HDSD-MUTATE-FE-11 for YCTD storm; QA-HDSD-MUTATE-RET-03-HRM-R9 after both READY
```

```
work_item_id: D-HDSD-MUTATE-FE-11
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md — TC-HDSD-07-02-01 job-templates storm=374 (regression vs R7 storm=0); hdsd-requisition-form-ready timeout 22s; restart HRM embed :8080 before retest
exit_criteria: TC-HDSD-07-02-01 form-ready ≤22s → POST requisition 2xx + F5; job-templates storm=0 during create dialog; preserve TC-HDSD-08-02-01 🟢 + regression 05/04/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-11-20260801.md READY_FOR_QA
spec_ref: UF-HRM-07 · JobRequisitionsTab · jobRequisitionUi isRequisitionCreateFormReady
UF: UF-HRM-07
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md`

## ack_status

**FAIL_TO_PM**
