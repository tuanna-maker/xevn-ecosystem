# QA-HDSD-MUTATE-RET-03-HRM-R5 — HRM mutate retest after FE-07

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R5` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** before test) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-07-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r4-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r5-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R5-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R5-20260801/` |
| **Stamp** | `HDSDS7KRR` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-07 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** |
| HRM embed `:8080` | **Up** — killed stale pid 32628; restarted `pnpm dev --host 127.0.0.1 --port 8080`; warm-up `/hr/employees` |
| `node scripts/qc-dev-stack.mjs` | **exit 0** — hrm/xbos/portal 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS |

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 4 | 04-02-01, 05-03-01, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 2 | 06-02-01, 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5** all 🟢; primary mutate TCs still 🟡.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R4

| TC | R4 | R5 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 formReady=**false** · no POST | 🟡 formReady=**true** · **POST 400** | FE-07 date prefill + sentinel **fixed**; BE rejects create (400) — layer shifts dev-be/dev-fe payload |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false · job-templates storm ~40+ | 🟡 formReady=false · **jobTemplatesGets=0 storm=false** | Refetch storm **fixed**; dept/JD hydrate still not reaching sentinel within 22s |
| TC-HDSD-08-02-01 leave | 🟢 POST 201 · F5 marker | 🟢 **POST 201 · F5 marker** | preserved 🟢 |
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
| **F5** | Row `NV HDSDS7KRR` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-be/dev-fe — form-ready 🟢 but POST 400)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (≤22s) → `#hdsd-contracts-form-submit` → F5 |
| **form-ready** | **`hdsd-contracts-form-ready` present** (FE-07 fix confirmed) |
| **Network** | GET employees/settings-catalogs/contracts 200 · **`POST /api/hrm/contracts-insurance/contracts` → 400** |
| **Console** | `Failed to load resource: the server responded with a status of 400 (Bad Request)` |
| **FE dialog** | `06-02-form-ready.png` — sentinel visible; submit attempted |
| Root cause (hypothesis) | FE gate passes date/type prefill; BE `createContract` rejects payload — likely `position_key` / catalog assert (E1-A) or duplicate `contract_code` on prefilled employee row |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — dept hydrate gap; storm fixed)**

| Step | Evidence |
|------|----------|
| Click path | JD library ensure (existing count=1) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** |
| **job-templates storm** | **0 GET during create dialog window** (was ~40+ in R4) — FE-07 refetch guard **PASS** |
| **Network** | GET requisitions/settings-catalogs 200 · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` — dialog open; dept/title hydrate incomplete |
| Root cause | `buildRequisitionCreateFormDefaults` / `isCreateFormReady` requires non-empty `department`; catalog + template + OU fallback chain still yields empty dept for pilot JD row |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS (preserved 🟢 — do not regress)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDS7KRR` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDS7KRR`** visible in overview (`08-02-leave-overview-f5.png`) |

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

- TC-HDSD-08-02-01 UF-HRM-09 — POST 201 + F5 overview marker preserved
- TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01 regression preserved
- **Partial FE-07:** TC-HDSD-06 form-ready sentinel · TC-HDSD-07 job-templates refetch storm

**Not promoted**

- **TC-HDSD-06-02-01** — form-ready 🟢 but **POST 400** (not 2xx); F5 no new contract row
- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` never appears; **no POST 2xx**

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-HD-POST-400-01 | dev-be / dev-fe | `D-HDSD-MUTATE-BE-01` or `D-HDSD-MUTATE-FE-08` | Capture 400 body (`HRM-CON-*`); ensure create payload includes valid `position_key` + unique `contract_code` when form-ready true |
| R-QA-YCTD-DEPT-HYDRATE-04 | dev-fe | `D-HDSD-MUTATE-FE-08` | `buildRequisitionCreateFormDefaults` must set non-empty dept for pilot JD (catalog/position/OU); align `isCreateFormReady` with submit gate |
| OPS-HRM-EMBED-RESTART | qa note | — | Restart `:8080` mandatory before retest |

---

## completion_report

**Closed:** L0 exit 0; TC-HDSD-08-02-01 🟢 preserved; regression TC-HDSD-04/05/10 🟢; FE-07 partial — contract form-ready 🟢, job-templates storm eliminated.

**Open:** TC-HDSD-06-02-01 POST **400** (not 2xx); TC-HDSD-07-02-01 form-ready still false — primary mutate exit criteria **not met**.

## next_owner

pm → dev-fe / dev-be

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-08
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r5-20260801.md FAIL_TO_PM — TC-HDSD-06-02-01 formReady=true POST 400 on /api/hrm/contracts-insurance/contracts; TC-HDSD-07-02-01 hdsd-requisition-form-ready timeout (dept empty despite storm fix)
exit_criteria: TC-HDSD-06-02-01 POST contract 2xx + F5; TC-HDSD-07-02-01 POST requisition 2xx + F5; preserve TC-HDSD-08-02-01 🟢 + regression 05/04/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-08-20260801.md READY_FOR_QA
spec_ref: UF-HRM-05 · UF-HRM-07 · Contracts createContract payload · JobRequisitionsTab buildRequisitionCreateFormDefaults department fallback
UF: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: if 400 is HRM-CON-POS-KEY → coordinate dev-be; restart HRM embed :8080 before QA-HDSD-MUTATE-RET-03-HRM-R6
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r5-20260801.md`

## ack_status

**FAIL_TO_PM**
