# QA-HDSD-MUTATE-RET-03-HRM-R4 — HRM mutate retest after FE-06

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM-R4` |
| **Program** | `P-HDSD-QA-SRS-01` · BF-03 Đ0 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · HRM embed `:8080` (**restarted** before test) |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior dev** | `docs/qa/evidence/d-hdsd-mutate-fe-06-20260801.md` |
| **Prior QA** | `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r3-20260801.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-r4-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-HRM-R4-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-HRM-R4-20260801/` |
| **Stamp** | `HDSDROYR7` |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| D-HDSD-MUTATE-FE-06 READY_FOR_QA | **PASS** (entry) | dev-fe handoff read |
| Portal `:5173` | **Up** |
| HRM embed `:8080` | **Up** — killed stale pid, restarted `pnpm dev` in `apps/web/hrm`; warm-up navigate `/hr/employees` before TCs |
| `node scripts/qc-dev-stack.mjs` | **exit 0** — hrm/xbos/portal 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS |

Run 1 aborted (HRM vite crash mid-run, employees create-btn timeout). Run 2 complete with harness warm-up + extended waits.

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 4 | 04-02-01, 05-03-01, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 2 | 06-02-01, 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5** all 🟢; primary mutate TCs still 🟡.

### Delta vs QA-HDSD-MUTATE-RET-03-HRM-R3

| TC | R3 | R4 | Ghi chú |
|----|-----|-----|---------|
| TC-HDSD-05-03-01 NV | 🟢 | 🟢 | regression preserved |
| TC-HDSD-06-02-01 HĐ | 🟡 formReady=**true** · no POST · toast thiếu ngày | 🟡 **formReady=false** · no POST | FE-06 aligned `isCreateFormReady` with date gate — sentinel no longer true while submit blocked; **still no POST** |
| TC-HDSD-07-02-01 YCTD | 🟡 formReady=false · picker empty | 🟡 **formReady=false** · no POST | GET `job-templates` 200 (many refetches) · `applyTemplate`/dept hydrate still not reaching form-ready |
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
| **F5** | Row `NV HDSDROYR7` visible |

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-fe — form-ready sentinel never appears; no POST)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (22s) → submit skipped |
| **form-ready** | **`hdsd-contracts-form-ready` absent** (timeout) |
| **Network** | GET employees/settings-catalogs/contracts 200 · **no POST/PUT contract 2xx** |
| **FE dialog** | `06-02-create-form.png` — dialog opens with NV/mã/tên prefilled |
| Root cause | FE-06 `isCreateFormReady` now always runs `validateContractDatesForSubmit`; effective/expiry prefill via `useEffect` on `activeFormFields`/`contract_type` **not satisfied within wait window** → sentinel stays hidden; harness correctly skips submit per AC |

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe — catalog hydrate / auto-pick JD)**

| Step | Evidence |
|------|----------|
| Click path | JD library ensure → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` (22s) → submit skipped |
| **jdEnsure** | `{ ok: true, via: "existing", count: 1 }` |
| **form-ready** | **`hdsd-requisition-form-ready` absent** |
| **Network** | GET `job-templates` **200** (storm ~40+ refetches during dialog) · GET settings-catalogs 200 · **no POST requisitions 2xx** |
| **FE dialog** | `07-02-create-form.png` — CatalogSearchPicker JD/dept still empty or auto-pick not completing |
| Root cause | Prefetch + `applyTemplate(templates[0])` path not populating title/department/`job_template_id` before sentinel; department catalog fallback insufficient in pilot |

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST + overview F5 marker

**Verdict: 🟢 PASS (preserved 🟢 — do not regress)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu → reason `QA-LEAVE-HDSDROYR7` → Gửi → F5 Tổng quan |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** |
| **FE sau 2xx** | Overview panel `[data-testid=hdsd-leave-overview-recent]` present |
| **F5 marker** | **`QA-LEAVE-HDSDROYR7`** visible in overview (`08-02-leave-overview-f5.png`) |

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

**Not promoted**

- **TC-HDSD-06-02-01** — `hdsd-contracts-form-ready` never appears; **no POST 2xx**; date prefill + form-ready gate still not browser-ready within AC wait
- **TC-HDSD-07-02-01** — `hdsd-requisition-form-ready` never appears; **no POST 2xx**; JD/dept hydrate + auto-pick gap persists despite FE-06 prefetch

---

## 5. Residual / PM dispatch

| ID | Layer | Owner | Action |
|----|-------|-------|--------|
| R-QA-HD-DATE-PREFILL-03 | dev-fe | `D-HDSD-MUTATE-FE-07` | Sync date prefill on dialog open (not only type-change effect); ensure `hdsd-contracts-form-ready` within 22s when employees list non-empty |
| R-QA-YCTD-CATALOG-PICKER-03 | dev-fe | `D-HDSD-MUTATE-FE-07` | Stop job-templates refetch storm; verify `applyTemplate` sets title/dept/JD id synchronously on create open; dept fallback from OU when catalog empty |
| OPS-HRM-EMBED-RESTART | qa note | — | Restart `:8080` mandatory; first run crashed vite during WF step |

---

## completion_report

**Closed:** L0 exit 0; TC-HDSD-08-02-01 🟢 preserved; regression TC-HDSD-04/05/10 🟢; full browser harness run 2 with evidence + screenshots.

**Open:** TC-HDSD-06-02-01 + TC-HDSD-07-02-01 remain 🟡 — primary mutate exit criteria **not met** (no POST 2xx).

## next_owner

pm → dev-fe

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-07
from_role: qa | to_role: dev-fe
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r4-20260801.md FAIL_TO_PM — TC-HDSD-06-02-01 hdsd-contracts-form-ready timeout (date prefill not ready); TC-HDSD-07-02-01 hdsd-requisition-form-ready timeout (job-templates GET 200 storm, applyTemplate/dept empty)
exit_criteria: TC-HDSD-06-02-01 wait form-ready → POST contract 2xx + F5; TC-HDSD-07-02-01 wait form-ready → POST requisition 2xx + F5; preserve TC-HDSD-08-02-01 🟢 + regression 05/04/10; evidence docs/qa/evidence/d-hdsd-mutate-fe-07-20260801.md READY_FOR_QA
spec_ref: UF-HRM-05 · UF-HRM-07 · Contracts.tsx isCreateFormReady date prefill on open · JobRequisitionsTab applyTemplate + requisitionDepartmentPickerOptions
UF: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: READY_FOR_QA
pm_dispatch_hint: restart HRM embed :8080 before QA-HDSD-MUTATE-RET-03-HRM-R5
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r4-20260801.md`

## ack_status

**FAIL_TO_PM**
