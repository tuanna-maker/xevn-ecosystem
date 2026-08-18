# QA-HDSD-MUTATE-RET-03-HRM-R9 — HRM mutate retest after FE-11 + BE-02

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R9` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid 35972→36484) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-11-20260801.md` · `docs/qa/evidence/d-hdsd-mutate-be-02-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (SKIP_L0=1 after manual L0) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R9-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` (same batch run) |
| **Stamp** | `HDSDTWZH0` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-11 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| D-HDSD-MUTATE-BE-02 READY_FOR_QA | **PASS** (entry) | dev-be handoff read |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed pid **35972**; restarted `pnpm exec vite --host 127.0.0.1 --port 8080` (Vite ready 448ms); warm-up `/hr/employees` 200 |
| `node scripts/qc-dev-stack.mjs` | **services healthy** (win async assert crash exit -1073740791 waived — same as R8) |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 5 | 04-02-01, 05-03-01, **06-02-01**, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 1 | 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-07-02-01 POST 2xx + F5**; **TC-HDSD-06-02-01** and **TC-HDSD-08-02-01** primary mutate 🟢 + regression preserved.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R8

| TC | R8 | R9 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 POST **400** | 🟢 POST **201** · `position_key=CEO` · `contract_code=HD-TXP9Y` | **BE-02 promoted** — pass-through resolved to catalog key |
| TC-HDSD-07-02-01 YCTD | 🟡 storm=**374** · formReady=false | 🟡 storm=**1** · formReady=false | **FE-11 partial** — storm fixed; dept/template hydrate still blocks sentinel |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 POST 201 · F5 marker `QA-LEAVE-HDSDTWZH0` | **Preserved** |
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
| **F5** | Row `NV HDSDTWZH0` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **3ms** |
| **Network** | **`POST /api/hrm/contracts-insurance/contracts` → 201** |
| **POST body** | `position_key=CEO` · `contract_code=HD-TXP9Y` · `employee_id=8ef5ef5d-ac43-4714-bd66-e6abbd9640b5` · `contract_type=HDHV` · dates prefilled |
| **BE resolution** | `position_key=CEO` (catalog-valid) — **not** employee_code pass-through (`QAHDSDTWZH0`) — matches BE-02 design |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` · `06-02-after-f5.png` |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — department/template hydrate; storm fixed)**

| Step | Evidence |
|------|----------|
| Click path | JD library existing (count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** after 22s |
| **job-templates storm** | **1 GET** `/api/hrm/recruitment/job-templates` during create dialog — **PASS** (R8 storm=374 → R9 storm=1; FE-11 closed) |
| **Network** | GET requisitions/settings-catalogs/job-templates **200** · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — sentinel missing |
| Root cause | `isRequisitionCreateFormReady` requires `effectiveDept`; `departmentOptions` likely empty or `applyTemplate` not backfilling dept after FE-11 one-shot refetch — same class as R5/R7 dept hydrate gap |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDTWZH0` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2027-12-05` · `end_date=2027-12-07` · `reason=QA-LEAVE-HDSDTWZH0` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDTWZH0` visible** (`08-02-leave-overview-f5.png`) |

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

- **TC-HDSD-06-02-01** — POST **201** `HRM-CON-201` · `position_key`+`contract_code` on wire · BE-02 catalog resolution
- TC-HDSD-08-02-01 — POST **201** + F5 overview marker (preserved)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-07 — **job-templates storm=0 class** (1 GET during dialog — FE-11 closed R8 regression)

**Not promoted**

- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` timeout 22s; no POST 2xx; F5 persist not verified

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-YCTD-DEPT-HYDRATE-R9 | dev-fe | `D-HDSD-MUTATE-FE-12` (proposed) | YCTD create: storm fixed but `departmentOptions`/applyTemplate backfill still blocks `isRequisitionCreateFormReady` — ensure dept from settings-catalogs or ouLabels before sentinel |

**pm_dispatch_hint:** BF-03 gate **still blocked** — do **not** dispatch `QC-HDSD-BF-03-GATE-01` until TC-HDSD-07-02-01 POST 2xx. TC-HDSD-06-02-01 🟢 enables partial BF-03 progress only.

---

## completion_report

**Closed:** L0 exit 0 (fe-be 8/8); HRM embed :8080 restarted; **BE-02** TC-HDSD-06-02-01 🟢 POST **201** with catalog `position_key=CEO`; **FE-11** job-templates storm **374→1**; TC-HDSD-08-02-01 🟢; regression TC-HDSD-04/05/10 🟢.

**Open:** TC-HDSD-07-02-01 — form-ready timeout + no POST (dept hydrate gap). Primary mutate exit criteria **not fully met**.

## next_owner

pm → **dev-fe** (`D-HDSD-MUTATE-FE-12` YCTD dept hydrate)

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-12
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r9-20260801.md — TC-HDSD-07-02-01 formReady=false after 22s; job-templates storm=1 (FE-11 OK); jdEnsure existing count=1; hdsd-requisition-form-ready absent; restart HRM embed :8080 before retest
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢 + regression 04/05/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-12-20260801.md READY_FOR_QA
spec_ref: UF-HRM-07 · JobRequisitionsTab · isRequisitionCreateFormReady · resolveRequisitionDepartmentDefault
UF: UF-HRM-07
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R10 after READY; QC-HDSD-BF-03-GATE-01 only when 06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r9-20260801.md`

## ack_status

**FAIL_TO_PM**
