# QA-HDSD-MUTATE-RET-03-HRM — HRM mutate browser retest (NV/HĐ/YCTD/leave)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-31 (ICT) |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-HRM` |
| **Program** | `P-HDSD-QA-SRS-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` (`dist/main.js`) · xbos `:28002` · HRM embed `:8080` |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Prior** | `qa-hdsd-mutate-ret-02-20260730.md` · `qa-hdsd-mutate-ret-03-shr-20260731.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-hrm-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-hrm-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-hrm-20260731/` |
| **Stamp** | `HDSDQ2ASY` (primary complete run) |

---

## 1. Entry / L0

| Gate | Result | Notes |
|------|--------|-------|
| QA-HDSD-MUTATE-RET-03-SHR PASS | **PASS** (entry) | UF-XBOS-05 out of scope this WI |
| Portal `:5173` | **Up** — restarted `pnpm dev` in `apps/web/web-portal` after turbo crash under Puppeteer |
| HRM embed `:8080` | **Up** — portal proxy `/hr` |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS (direct + proxy employees/catalog) |
| `node scripts/qc-dev-stack.mjs` | probes ✓ hrm/xbos/portal 200 (Windows UV teardown abort — known class) |

**Run 1 note:** First harness attempt aborted — portal crashed (`ERR_CONNECTION_REFUSED`) mid NV save; fixed `waitHrmHealthy` (no unauthenticated fetch 401 loop) + web-portal-only restart. **Run 2** = authoritative evidence below.

---

## 2. Wave summary

| Verdict | Count | TC ids |
|---------|-------|--------|
| 🟢 PASS | 4 | 04-02-01, 05-03-01, 08-02-01, 10-04-01 |
| 🟡 BLOCKED | 2 | 06-02-01, 07-02-01 |
| 🔴 FAIL | 0 | — |

**ack_status:** `FAIL_TO_PM` — exit criteria require **all four** HRM mutate TCs (05–08) POST/PUT **2xx + FE after mutate + F5**; HĐ + YCTD chưa POST; leave F5 marker soft.

### Delta vs QA-HDSD-MUTATE-RET-02

| TC | RET-02 | RET-03-HRM | Ghi chú |
|----|--------|------------|---------|
| TC-HDSD-05-03-01 NV | 🔴 POST 500 | 🟢 **POST 201 + F5** | Stack stable + harness fix |
| TC-HDSD-06-02-01 HĐ | 🟡 no POST | 🟡 dialog ✓ · **no POST** | Validation: cần chọn loại HĐ / prefill race |
| TC-HDSD-07-02-01 YCTD | 🟡 no POST | 🟡 form ✓ · JD có · **no POST** | Harness chưa fill title/dept/headcount + JD picker |
| TC-HDSD-08-02-01 leave | 🔴 no POST | 🟢 **POST 201** · F5 marker ✗ | BE-02 lazy catalog cold OK on `dist/main.js` |
| UF-XBOS-10 | 🟢 | 🟢 | regression preserved |
| internal_services | 🟢 | 🟢 | regression preserved |

---

## 3. TC evidence (U65 browser · data-testid)

### TC-HDSD-05-03-01 · UF-HRM-02 — Tạo nhân viên

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/employees?portal=1&…` → `#hdsd-employees-create-btn` → `[data-testid=hdsd-employee-form-dialog]` → `full_name` + `employee_code` → `#hdsd-employee-form-submit` → F5 |
| Action | Fill `NV HDSDQ2ASY` / `QAHDSDQ2ASY` |
| **Network** | **`POST /api/hrm/employees` → 201** |
| **FE sau 2xx** | List refetch GET employees **200** immediately after POST |
| **F5** | Row visible (`innerText` contains stamp) |
| Screens | `05-03-create-form.png` · `05-03-after-save.png` · `05-03-after-f5.png` |

**spec_ref:** UF-HRM-02 · SRS mutate AC POST 201 → row → F5

---

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

**Verdict: 🟡 BLOCKED (layer: dev-fe / qa harness)**

| Step | Evidence |
|------|----------|
| Click path | `/hr/contracts?portal=1&…` → `#hdsd-contracts-create-btn` → `[data-testid=hdsd-contracts-form-dialog]` → `#hdsd-contracts-form-submit` → F5 |
| **Network** | GET employees **200** (picker load) · **no POST/PUT contract 2xx** |
| **FE** | Dialog opens via testid; submit clicked without observable validation toast in harness |
| Root cause | Form requires `employee_id` + **contract type** (+ catalog fields); harness clicks Lưu before type combobox filled — client validation blocks POST |
| Screens | `06-02-create-form.png` · `06-02-after-save.png` · `06-02-after-f5.png` |

**spec_ref:** UF-HRM-05 · R-QA-HD-CREATE-01 (carry from RET-01)

---

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

**Verdict: 🟡 BLOCKED (layer: dev-fe / qa harness)**

| Step | Evidence |
|------|----------|
| Click path | JD library **1 row existing (U65)** → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → JD combobox attempt → Lưu |
| **Network** | GET job-templates/requisitions **200** · **no POST requisition 2xx** |
| **FE** | `[data-testid=hdsd-requisition-form-dialog]` opens; schema requires `title`, `department`, `employment_type`, `headcount`, `job_template_id` — harness only partial JD pick |
| Screens | `07-02-requisitions.png` · `07-02-create-form.png` · `07-02-after-save.png` |

**spec_ref:** UF-HRM-07 · R-QA-YCTD-JD-U65

---

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST (lazy catalog cold)

**Verdict: 🟢 PASS (POST); 🟡 F5 marker**

| Step | Evidence |
|------|----------|
| Click path | `/hr/attendance` → Nghỉ phép → Tạo yêu cầu nghỉ → employee **PORTAL-GCEO** · **LVT_01** · dates `dd/MM/yyyy` · Gửi → F5 |
| **Network** | **`POST /api/hrm/attendance/leave-requests` → 201** · GET leave-requests **200** refetch |
| **FE sau 2xx** | Dialog closed; list refetch observed |
| **F5** | Marker `QA-LEAVE-HDSDQ2ASY` not in attendance overview tab body (`F5marker=false`) — need «Danh sách yêu cầu» tab for persist AC |
| Catalog | Cold lazy pull OK — no manual seed/pull (BE-02 on `dist/main.js`) |
| Screen | `08-02-leave-after-submit.png` |

**spec_ref:** UF-HRM-09 · promoted POST aligns RET-01 dedicated leave run

---

## 4. Regression (no SHR — RET-03-SHR 🟢)

| TC | UF | Verdict | Detail |
|----|-----|---------|--------|
| TC-HDSD-04-02-01 | UF-XBOS-10 | 🟢 | `?settings=workflow_designer` · workflow text · GET definitions **200** |
| TC-HDSD-10-04-01 | UF-HRM-MENU-05 | 🟢 | `/hr/internal_services` → `/hr/internal-services` · no console 404 |

---

## 5. Environment incidents

| Incident | Impact | Mitigation |
|----------|--------|------------|
| Portal `:5173` crash run 1 (turbo dev:web-only + Puppeteer) | NV POST `Failed to fetch` | Restart web-portal only; SKIP_L0 run 2 |
| `waitHrmHealthy` unauthenticated fetch → 401 spam | False unhealthy signal | Patched harness to use network log |

---

## 6. completion_report

**Closed / promoted 🟢:**

- TC-HDSD-05-03-01 UF-HRM-02 — **POST 201 + F5** NV create (U65 browser)
- TC-HDSD-08-02-01 UF-HRM-09 — **POST 201** leave LVT_01 cold catalog (BE-02 verified on stable stack)
- Regression UF-XBOS-10 + internal_services **🟢** (no SHR regression)

**Not promoted:**

- TC-HDSD-06-02-01 — contract dialog OK · **no POST 2xx** (validation/harness)
- TC-HDSD-07-02-01 — YCTD form OK · **no POST 2xx** (full form fill gap)
- TC-HDSD-08-02-01 F5 list marker on attendance tab

**Residual:** R-QA-HD-CREATE-01 · R-QA-YCTD-FORM-FILL-01 · leave F5 tab switch in harness

---

## 7. next_owner

`pm` → dispatch **dev-fe** (contract type + YCTD form harness) then **qa** RET-03-HRM-R2

---

## 8. next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-04
from_role: pm | to_role: dev-fe
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-20260731.md FAIL_TO_PM — TC-HDSD-06-02-01 + 07-02-01 no POST; leave F5 soft
exit_criteria: Contract create — wait employee prefill + pick contract_type from catalog → POST 2xx + F5; YCTD — fill title/dept/employment_type/headcount + job_template_id → POST 2xx; optional testids for contract type combobox; no regression NV/leave/WF/internal_services 🟢
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R2
read_first: qa-hdsd-mutate-ret-03-hrm-20260731.md · d-hdsd-mutate-fe-02-20260730.md
```

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R2
from_role: pm | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: D-HDSD-MUTATE-FE-04 READY_FOR_QA; L0 exit 0; portal :5173; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5; confirm 05+08 still 🟢; regression UF-XBOS-10 + internal_services; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r2-20260731.md
cấm: seed
ack_status: PASS_TO_PM or FAIL_TO_PM
```

---

**ack_status:** `FAIL_TO_PM`  
**evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-20260731.md`  
**layer:** dev-fe (HĐ/YCTD mutate depth) · qa (leave F5 tab harness)
