# QA-HDSD-MUTATE-RET-03-HRM-R14 — HRM mutate retest after FE-16

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R14` |
| **Program** | `P-HDSD-ECOSYSTEM-03` · BF-03 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid **36340**, Vite ready ~424ms) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-16-20260801.md` (API-first jdEnsure + U65 JD create + optimistic hook merge) |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r13-20260801.md` (FAIL — jdEnsure DOM false positive; API total=0) |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` (SKIP_L0=1 after manual L0) |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R6-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` |
| **Stamp** | `HDSDVS7BL` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-16 READY_FOR_QA | **PASS** (entry) | API-first `probeJobTemplatesApiCount`; JD library testids; optimistic `createTemplate` merge |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed prior listener; restarted Vite (ready ~424ms, pid **36340**); warm-up `/hr/employees` **200** |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 6 | 04-02-01, 05-03-01, **06-02-01**, **07-02-01**, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 0 | — |
| 🔴 FAIL | 0 | — |

**ack_status:** `PASS_TO_PM` — exit criteria met: **TC-HDSD-07-02-01** U65 JD create → form-ready ≤22s → POST requisition **201** + F5; **TC-HDSD-06-02-01** and **TC-HDSD-08-02-01** preserved 🟢 + regression 04/05/10 🟢.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R13

| TC | R13 | R14 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟢 POST **201** | 🟢 POST **201** · `position_key=CEO` · `contract_code=HD-VSWY5` | **Preserved** |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false · storm=2 · no POST | 🟢 **FE-16 promoted** — U65 «Thêm JD» → POST job-templates **201** → formReady=true · POST requisitions **201** · F5 | **Primary exit criteria met** |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 POST 201 · F5 marker `QA-LEAVE-HDSDVS7BL` | **Preserved** |
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
| **F5** | Row `NV HDSDVS7BL` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** after **3ms** |
| **Network** | **`POST /api/hrm/contracts-insurance/contracts` → 201** |
| **POST body** | `position_key=CEO` · `contract_code=HD-VSWY5` · `employee_id=36e2b988-8188-426d-b111-eb799f697c5b` · `contract_type=HDHV` |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` · `06-02-after-save.png` · `06-02-after-f5.png` |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | JD library U65 create → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (≤22s) → `#hdsd-requisition-form-submit` → F5 |
| **jdEnsure (in-run)** | `{ ok: false, via: "created", postStatus: 201, code: "JD-HDSDVS7BL", apiTotal: 0, apiBefore: 0 }` — **POST job-templates 201 succeeded**; in-page probe returned `apiTotal=0` due to transient **401** on `fetch('/api/hrm/recruitment/job-templates')` during jd-library navigation (see network log lines 401×2). **Not a functional block.** |
| **POST job-templates (U65 FE)** | **`POST /api/hrm/recruitment/job-templates` → 201** · body `{ code: "JD-HDSDVS7BL", title: "QA JD HDSDVS7BL", position_code: "CEO" }` |
| **Post-run API probe (portal proxy, same persona)** | **`GET job-templates` → 200** · **`total=1`** · row `JD-HDSDVS7BL` id `0fd5a36b-2664-4197-8fd3-dfff869da1ad` |
| **form-ready** | **`hdsd-requisition-form-ready` present** (within 22s wait) |
| **job-templates storm** | **0 GET** during create dialog — **PASS** (≤5; improved vs R13 storm=2) |
| **Network requisition** | **`POST /api/hrm/recruitment/requisitions` → 201** · body `{ title: "QA JD HDSDVS7BL", job_template_id: "0fd5a36b-…", headcount: 1 }` |
| **Post-run requisitions probe** | **`GET requisitions` → 200** · **`total=1`** · row title `QA JD HDSDVS7BL` |
| **F5** | `07-02-after-f5.png` captured after reload |
| **FE dialog** | `07-02-create-form.png` · `07-02-form-ready.png` — form hydrated (no «Chưa có JD» empty state vs R13) |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDVS7BL` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **POST body** | `start_date=2027-05-01` · `end_date=2027-05-03` · `reason=QA-LEAVE-HDSDVS7BL` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDVS7BL` visible** (`08-02-leave-overview-f5.png`) |

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
- **TC-HDSD-07-02-01** — U65 JD create from FE when library empty · form-ready ≤22s · POST requisitions **201** · F5 · storm=0
- **TC-HDSD-08-02-01** — POST **201** + F5 overview marker (preserved)
- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved

**Not promoted**

- (none in scope)

**Residual (non-blocking GWC)**

- **R-QA-JD-PROBE-401-R14** — harness `probeJobTemplatesApiCount` in-page fetch intermittently **401** during jd-library tab; causes `jdEnsure.apiTotal=0` while POST 201 succeeds. Recommend harness: retry probe after cookie settle or use network POST 201 as SoT when `via=created`. Does not block UF-HRM-07 promote.

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-JD-PROBE-401-R14 | qa-harness | optional follow-up | Harden `probeJobTemplatesApiCount` against 401 race; use POST 201 + post-run GET as acceptance SoT |

**pm_dispatch_hint:** **TC-HDSD-06-02-01 🟢 + TC-HDSD-07-02-01 🟢** — BF-03 mutate slice ready for **`QC-HDSD-BF-03-GATE-01`** (contract + YCTD both promoted).

---

## completion_report

**Closed:** L0 exit 0 (fe-be 8/8); HRM embed :8080 restarted (pid 36340); FE-16 fixes validated — U65 JD create from empty library via «Thêm JD» POST **201**; TC-HDSD-07-02-01 form-ready + POST requisitions **201** + F5; TC-HDSD-06-02-01 🟢 preserved; TC-HDSD-08-02-01 🟢 preserved; regression TC-HDSD-04/05/10 🟢; post-run API confirms job-templates `total=1` and requisitions `total=1` with stamp `HDSDVS7BL`.

**Open:** Harness jdEnsure in-run `apiTotal=0` false negative (401 probe) — GWC only; business path PASS.

## next_owner

pm → **qc** (`QC-HDSD-BF-03-GATE-01` — BF-03 mutate gate now that TC-06+07 both 🟢)

## next_dispatch_prompt

```
work_item_id: QC-HDSD-BF-03-GATE-01
from_role: qa | to_role: qc
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r14-20260801.md PASS_TO_PM — TC-HDSD-06-02-01 🟢 POST 201 position_key=CEO; TC-HDSD-07-02-01 🟢 U65 JD create + POST requisitions 201 + F5; TC-HDSD-08-02-01 🟢; regression 04/05/10 🟢; U65 zero-seed
exit_criteria: L3 QC GO or GO WITH CONDITIONS for BF-03 mutate slice; audit evidence paths; confirm no probe-only PASS; residual R-QA-JD-PROBE-401-R14 may be GWC harness-only
UF: UF-HRM-05, UF-HRM-07, UF-HRM-09
evidence_path: docs/qa/evidence/qc-hdsd-bf-03-gate-01-20260801.md
ack_status: PASS_TO_PM or NO-GO
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r14-20260801.md`

## ack_status

**PASS_TO_PM**
