# QA-HDSD-MUTATE-RET-03-HRM-R6 — HRM mutate retest after FE-08

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R6` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** pid 1640→37664) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-08-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r5-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R6-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R6-20260801/` |
| **Stamp** | `HDSDST8G8` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-08 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** HTTP 200 |
| HRM embed `:8080` | **Up** — killed stale pid **1640**; restarted `pnpm dev --host 127.0.0.1 --port 8080` (Vite ready 437ms); warm-up `/hr/employees` 200 |
| `node scripts/qc-dev-stack.mjs` | **exit 0** — hrm/xbos/portal 200 (win async assert crash waived — services healthy) |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS 8/8 |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 3 | 04-02-01, 05-03-01, 10-04-01 |
| 🟡 BLOCKED | 3 | 06-02-01, 07-02-01, 08-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5** and **TC-HDSD-08-02-01 🟢 preserved**; all three primary TCs still 🟡.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R5

| TC | R5 | R6 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 formReady=**true** · **POST 400** | 🟡 formReady=**false** (22009ms) · **no POST** | **Regression** on form-ready sentinel vs R5; FE-08 position_key gate may block `hdsd-contracts-form-ready` within 22s |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false · storm=0 | 🟡 formReady=false · storm=0 | No improvement — dept hydrate still not reaching sentinel |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟡 **POST 409** overlap · F5 marker absent | **Not preserved** — `Leave request overlaps an existing pending or approved leave` (prior browser mutate data, not seed) |
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
| **F5** | Row `NV HDSDST8G8` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-fe — form-ready timeout; no POST to verify position_key)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → submit skipped |
| **form-ready** | **`hdsd-contracts-form-ready` absent** after **22009ms** (timeout) |
| **Network** | GET employees/settings-catalogs/contracts 200 · **no POST** `/api/hrm/contracts-insurance/contracts` |
| **POST body check** | `position_key=false` · `contract_code=false` (no submit — FE-08 payload not exercised) |
| **FE dialog** | `06-02-create-form.png` · `06-02-form-ready.png` — dialog open; sentinel missing |
| Root cause (hypothesis) | FE-08 `isCreateFormReady` / `resolveContractCreatePositionKey` waits for position catalog resolution; pilot employee row may lack resolvable `job_title_key` within 22s — **regression vs R5** where sentinel appeared but POST 400 |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — dept hydrate gap persists)**

| Step | Evidence |
|------|----------|
| Click path | JD library existing (count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** |
| **job-templates storm** | **0 GET** during create dialog — refetch guard still **PASS** |
| **Network** | GET requisitions/settings-catalogs 200 · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` — dialog open; dept/title hydrate incomplete |
| Root cause | FE-08 `resolveRequisitionDepartmentDefault` + backfill effects still do not satisfy `isCreateFormReady` for pilot JD within 22s |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟡 BLOCKED (layer: data overlap — not preserved 🟢)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDST8G8` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 409** |
| **Console** | `Leave request overlaps an existing pending or approved leave` |
| **POST body** | `start_date=2027-05-05` · `end_date=2027-05-07` · `reason=QA-LEAVE-HDSDST8G8` · `company_id=holding` |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present but **marker absent after F5** |
| **F5 marker** | **`QA-LEAVE-HDSDST8G8` not visible** (`08-02-leave-overview-f5.png`) |
| Note | Overlap from prior U65 browser mutate leave rows (not seed); harness date salt insufficient — **TC not promoted** per exit criteria preserve 🟢 |

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

- TC-HDSD-04-02-01 · TC-HDSD-05-03-01 · TC-HDSD-10-04-01 regression preserved
- TC-HDSD-07 job-templates refetch storm still 0

**Not promoted**

- **TC-HDSD-06-02-01** — form-ready timeout; no POST; cannot verify FE-08 `position_key` + `contract_code` in Network body
- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` never appears; no POST 2xx
- **TC-HDSD-08-02-01** — POST **409** overlap; F5 overview marker missing — **was 🟢 in R5, not preserved**

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-HD-FORMREADY-REGRESS-R6 | dev-fe | `D-HDSD-MUTATE-FE-09` | Contract `hdsd-contracts-form-ready` regressed vs R5 (true→false); ensure `resolveContractCreatePositionKey` resolves within 22s for pilot employee or relax gate with explicit loading state |
| R-QA-YCTD-DEPT-HYDRATE-05 | dev-fe | `D-HDSD-MUTATE-FE-09` | YCTD dept backfill still empty for existing JD; align `isCreateFormReady` with FE-visible dept |
| R-QA-LEAVE-409-OVERLAP | dev-fe / qa harness | `D-HDSD-MUTATE-FE-09` or harness | Leave POST 409 on date window 2027-05-05..07 — improve unique-date picker or document cleanup path without seed |
| OPS-HRM-EMBED-RESTART | qa note | — | Restart `:8080` done this run — mandatory before retest |

**pm_dispatch_hint:** POST 400 with valid `position_key` → `D-HDSD-MUTATE-BE-01` — **not reached** (no contract POST this run).

---

## completion_report

**Closed:** L0 exit 0; regression TC-HDSD-04/05/10 🟢; HRM embed :8080 restarted; R6 harness with POST body capture deployed.

**Open:** TC-HDSD-06-02-01 form-ready **regressed** (R5 true → R6 false, 22s timeout); TC-HDSD-07-02-01 still blocked; TC-HDSD-08-02-01 **not preserved** (409 overlap). Primary mutate exit criteria **not met**.

## next_owner

pm → dev-fe

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-09
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r6-20260801.md FAIL_TO_PM — TC-HDSD-06-02-01 formReady regressed (R5 true→R6 false 22009ms, no POST); TC-HDSD-07-02-01 hdsd-requisition-form-ready still timeout; TC-HDSD-08-02-01 POST 409 leave overlap (was 🟢 R5)
exit_criteria: TC-HDSD-06-02-01 form-ready ≤22s → POST contract 2xx + Network body has position_key + contract_code + F5; TC-HDSD-07-02-01 form-ready → POST requisition 2xx + F5; TC-HDSD-08-02-01 🟢 preserved (unique leave dates); regression 05+04+10 🟢; evidence docs/qa/evidence/d-hdsd-mutate-fe-09-20260801.md READY_FOR_QA
spec_ref: UF-HRM-05 · UF-HRM-07 · UF-HRM-09 · contractCreatePayload · jobRequisitionUi dept resolver · leave date uniqueness
UF: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: restart HRM embed :8080 before QA-HDSD-MUTATE-RET-03-HRM-R7; if POST 400 with position_key in body → D-HDSD-MUTATE-BE-01
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r6-20260801.md`

## ack_status

**FAIL_TO_PM**
