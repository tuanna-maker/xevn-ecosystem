# QA-HDSD-MUTATE-RET-03-HRM-R13 — HRM mutate retest after FE-15

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R13` |
| **Program** | `P-HDSD-ECOSYSTEM-03` · BF-03 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid **8820**) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-15-20260801.md` (`unwrapJobDescriptionTemplateRows` + sync hydrate) |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r12-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (SKIP_L0=1 after manual L0) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R6-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` |
| **Stamp** | `HDSDVGW2T` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-15 READY_FOR_QA | **PASS** (entry) | `unwrapJobDescriptionTemplateRows` · sync ref · `hydrateTemplates` |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed prior listener; restarted Vite (ready ~423ms, pid **8820**); warm-up `/hr/employees` **200** |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 5 | 04-02-01, 05-03-01, **06-02-01**, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 1 | 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-07-02-01 POST 2xx + F5**; **TC-HDSD-06-02-01** and **TC-HDSD-08-02-01** primary mutate 🟢 + regression preserved.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R12

| TC | R12 | R13 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟢 POST **201** | 🟢 POST **201** · `position_key=CEO` · `contract_code=HD-VHLTC` | **Preserved** |
| TC-HDSD-07-02-01 YCTD | 🟡 storm=**2** · formReady=false | 🟡 storm=**2** · formReady=false | **FE-15 no delta** — dialog still «Chưa có JD» + empty title; **API body now captured: `total=0`** |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 POST 201 · F5 marker `QA-LEAVE-HDSDVGW2T` | **Preserved** |
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
| **F5** | Row `NV HDSDVGW2T` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **3ms** |
| **Network** | **`POST /api/hrm/contracts-insurance/contracts` → 201** |
| **POST body** | `position_key=CEO` · `contract_code=HD-VHLTC` · `employee_id=108afd34-2a97-418d-98d7-48e51e227a37` · `contract_type=HDHV` |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` · `06-02-after-f5.png` |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe + harness prerequisite — API JD list empty; jdEnsure DOM false positive)**

| Step | Evidence |
|------|----------|
| Click path | JD library check → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` — **DOM tbody heuristic only** |
| **GET job-templates body (post-run probe, portal proxy, same persona)** | **`200` `HRM-REC-JD-200`** · `{ "total": 0, "data": [] }` for `company_id=main` **and** `holding` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** after 22s |
| **job-templates storm** | **2 GET** `/api/hrm/recruitment/job-templates?company_id=main` during create dialog — **PASS** (≤5; same as R12) |
| **Network** | GET requisitions/settings-catalogs/job-templates **200** · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — UI shows **«Chưa có JD trong thư viện»** + **«Chưa có mục trong danh mục»** + empty title; dept prefilled «Tập đoàn XEVN…» |
| Root cause | FE-15 unwrap/hydrate **cannot populate** `effectiveTemplates` when API returns **zero rows**. Harness skipped FE JD creation because jd-library tbody count=1 while **list API is empty** — prerequisite gap / DOM-vs-API mismatch (same class as R11 FE-14 comment). Dialog empty state is **consistent with API**. |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDVGW2T` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2028-03-02` · `end_date=2028-03-04` · `reason=QA-LEAVE-HDSDVGW2T` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDVGW2T` visible** (`08-02-leave-overview-f5.png`) |

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

- **TC-HDSD-06-02-01** — POST **201** · `position_key=CEO` · preserved
- TC-HDSD-08-02-01 — POST **201** + F5 overview marker (preserved)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-07 — **job-templates storm ≤5** (unchanged vs R12)

**Not promoted**

- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` timeout 22s; no POST 2xx; F5 persist not verified; **FE-15 did not change outcome vs R12**; API list empty explains dialog state

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-YCTD-PREREQ-JD-EMPTY-R13 | dev-fe + qa-harness | `D-HDSD-MUTATE-FE-16` (suggested) | **U65 full path:** TC-07 must **create JD from FE** (`Thêm JD` → Lưu → POST job-templates 2xx) when GET `total=0` — do not trust jdEnsure tbody count alone. Fix `ensureJdTemplateFromFe` to gate on **API row count** or force create when GET empty. After ≥1 JD exists, retest form-ready ≤22s → POST requisition 2xx + F5. If library tbody shows row while GET `[]` → investigate FE stale table vs BE scope (parity). |
| R-QA-YCTD-UNWRAP-NO-OP-R13 | dev-fe | closed pending JD data | FE-15 unwrap is **correct but no-op** when API returns `data:[]`; cannot promote until prerequisite JD row exists via FE mutate |

**pm_dispatch_hint:** BF-03 gate **still blocked** — do **not** dispatch `QC-HDSD-BF-03-GATE-01` until TC-HDSD-07-02-01 POST 2xx. TC-HDSD-06-02-01 🟢 enables partial BF-03 progress only.

---

## completion_report

**Closed:** L0 exit 0 (fe-be 8/8); HRM embed :8080 restarted (pid 8820); TC-HDSD-06-02-01 🟢 POST **201** preserved; TC-HDSD-08-02-01 🟢; regression TC-HDSD-04/05/10 🟢; job-templates storm=2 during dialog (within gate); captured GET job-templates response `{ total: 0, data: [] }`.

**Open:** TC-HDSD-07-02-01 — **FE-15 no improvement** vs R12: form-ready timeout, no POST. Root cause refined: **API JD list empty** + harness jdEnsure false positive (tbody count=1); dialog empty state matches API. Primary exit criteria **not met**.

## next_owner

pm → **dev-fe** (`D-HDSD-MUTATE-FE-16` — TC-07 U65 JD-create prerequisite + harness API gate) — BE triage only if POST job-templates fails after FE create

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-16
from_role: qa | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r13-20260801.md — TC-HDSD-07-02-01 formReady=false; GET job-templates total=0; jdEnsure tbody count=1 false positive; FE-15 unwrap no-op on empty API; preserve TC-HDSD-06/08 🟢; restart HRM embed :8080 before retest
exit_criteria: U65 browser: if GET job-templates total=0 → FE «Thêm JD» → POST job-templates 2xx → then YCTD create form-ready ≤22s → POST requisition 2xx + F5; fix qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs ensureJdTemplateFromFe to verify API count; evidence docs/qa/evidence/d-hdsd-mutate-fe-16-20260801.md READY_FOR_QA
spec_ref: UF-HRM-07 · JobTemplatesTab · ensureJdTemplateFromFe · listJobDescriptionTemplates
UF: UF-HRM-07
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R14 after READY; QC-HDSD-BF-03-GATE-01 only when 06+07 both 🟢
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r13-20260801.md`

## ack_status

**FAIL_TO_PM**
