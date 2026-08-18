# QA-HDSD-MUTATE-RET-02 — HDSD mutate browser retest (FE-02 + BE-02)

**work_item_id:** `QA-HDSD-MUTATE-RET-02`  
**from_role:** dev-fe / dev-be → **to_role:** qa → **next:** pm  
**Program:** `P-HDSD-QA-SRS-01`  
**Date:** 2026-07-30  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Portal:** `http://127.0.0.1:5173` only (U65 zero-seed · cấm seed)  
**Harness:** `node scripts/qa/qa-hdsd-mutate-ret-02-browser.mjs`  
**Prior dev handoff:** `docs/qa/evidence/d-hdsd-mutate-fe-02-20260730.md` · `docs/qa/evidence/d-hdsd-mutate-be-01-20260730.md`  
**Baseline RET-01:** `docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md`  
**Runtime JSON:** `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-02-runtime.json` (stamp `HDSDNGT1N` — primary complete pass)  
**Screens:** `docs/qa/evidence/screens/hdsd-mutate-ret-02-20260730/`

---

## L0 gates (primary run — start of browser window)

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm run qc:dev-stack` | **exit 0** | hrm-api :28001 · xbos-api :28002 · portal :5173 — all HTTP 200 at harness start |
| `pnpm run qc:fe-be-health` | **exit 0** | ALL PASS — portal proxy HRM employees + catalog-sync 200 |

---

## Wave summary

| Verdict | Count |
|---------|-------|
| 🟢 PASS | 2 |
| 🟡 BLOCKED / partial | 3 |
| 🔴 FAIL | 2 |

**ack_status:** `FAIL_TO_PM` — exit criteria chưa đủ; có tiến bộ so RET-01 nhưng HRM mutate POST+F5 chưa PASS ổn định.

### Delta vs QA-HDSD-MUTATE-RET-01

| TC | RET-01 | RET-02 | Ghi chú |
|----|--------|--------|---------|
| TC-HDSD-03-02-01 shareholder | 🔴 no POST | 🟡 **POST 201** · F5 ✗ | FE-02 testid + save **đóng POST** |
| TC-HDSD-05-03-01 NV | 🔴 dialog miss | 🔴 dialog ✓ testid · POST **500** | FE wiring OK; hrm-api crash mid-burst |
| TC-HDSD-06-02-01 HĐ | 🟡 no POST | 🟡 dialog ✓ testid · no POST 2xx | hrm-api 500 cascade |
| TC-HDSD-07-02-01 YCTD | 🔴 form miss | 🟡 form ✓ testid · no POST | JD library có sẵn; POST blocked |
| TC-HDSD-08-02-01 leave | 🟡 (not run) | 🔴 no POST | dist-uat-w6 chưa chắc BE-02 lazy pull; harness date |
| UF-XBOS-10 WF | 🟢 | 🟢 | regression preserved |
| internal_services | 🟢 | 🟢 | regression preserved |

---

## TC evidence (U65 browser · data-testid selectors)

### TC-HDSD-03-02-01 · UF-XBOS-05 — Thêm cổ đông holding

- **Click path:** CC → Settings `company_member_units` → TẬP ĐOÀN → Chỉnh sửa → `#hdsd-shareholder-add-row` → `[data-testid^=hdsd-shareholder-name-]` → `[data-testid^=hdsd-shareholder-save-]` → F5
- **Action:** Puppeteer type `QA HDSDNGT1N`; click save testid on new row
- **Network:** `POST /api/xbos/org-foundation/legal-entities/.../shareholders` → **201**
- **FE sau mutate:** POST thành công; row chưa thấy sau F5 + mở lại holding edit (`F5=false` — có thể list chưa refresh hoặc tên hiển thị khác stamp)
- **Screenshot:** `03-02-holding-edit.png`, `03-02-after-save.png`, `03-02-after-f5.png`
- **Verdict:** 🟡 **PARTIAL** — R-HDSD-W1-01 POST **đóng**; F5 persist cần dev-fe hoặc QA re-check display binding
- **spec_ref:** UF-XBOS-05

### TC-HDSD-04-02-01 · UF-XBOS-10 — WF canvas deep link (regression 🟢)

- **Click path:** `/command-center?settings=workflow_designer`
- **Network:** GET `/api/xbos/workflow-engine/definitions` → **200**
- **FE:** Workflow text/canvas visible; alias `settings=workflow_designer` OK
- **Screenshot:** `04-02-wf-canvas.png`
- **Verdict:** 🟢 **PASS**

### TC-HDSD-05-03-01 · UF-HRM-02 — Tạo nhân viên

- **Click path:** `/hr/employees?portal=1&…` → `#hdsd-employees-create-btn` → `[data-testid=hdsd-employee-form-dialog]` → `input[name=full_name]` → `#hdsd-employee-form-submit` → F5
- **Action:** Dialog mở đúng testid; fill `NV HDSDNGT1N`
- **Network:** `POST /api/hrm/employees` → **500** (hrm-api crash — burst GET 500 trước/sau trên employees, settings-catalogs, operating-units)
- **Console:** `Error creating employee: ApiClientError: Không xử lý được yêu cầu HRM (500)`
- **F5:** Row không có
- **Screenshot:** `05-03-create-form.png`, `05-03-after-save.png`, `05-03-after-f5.png`
- **Verdict:** 🔴 **FAIL** — FE-02 **dialog wiring PASS**; blocker = **hrm-api stability** (L0 PASS lúc đầu ≠ giữ 200 suốt Puppeteer burst)
- **spec_ref:** UF-HRM-02

### TC-HDSD-06-02-01 · UF-HRM-05 — Tạo hợp đồng

- **Click path:** `/hr/contracts?portal=1&…` → `#hdsd-contracts-create-btn` → `[data-testid=hdsd-contracts-form-dialog]` → `#hdsd-contracts-form-submit` → F5
- **Network:** Không POST contract 2xx (hrm GET contracts/settings **500** cascade)
- **FE:** Dialog mở qua testid; prefill NV không verify được do API down
- **Screenshot:** `06-02-create-form.png`, `06-02-after-save.png`, `06-02-after-f5.png`
- **Verdict:** 🟡 **BLOCKED** — FE dialog entry PASS; mutate POST blocked by stack
- **spec_ref:** UF-HRM-05

### TC-HDSD-07-02-01 · UF-HRM-07 — Tạo YCTD

- **Click path:** Thư viện JD (existing 1 row U65) → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → JD picker → Lưu
- **Network:** GET job-templates/requisitions mixed 500 then partial recovery; **no POST** requisition 2xx
- **FE:** `[data-testid=hdsd-requisition-form-dialog]` **opens** (FE-02 fix vs RET-01 🔴)
- **Screenshot:** `07-02-requisitions.png`, `07-02-create-form.png`, `07-02-after-save.png`
- **Verdict:** 🟡 **BLOCKED** — form entry PASS; POST chưa verify (stack + cần chọn JD + submit 2xx)
- **spec_ref:** UF-HRM-07

### TC-HDSD-08-02-01 · UF-HRM-09 — Leave POST (BE-02)

- **Click path:** `/hr/attendance` → Nghỉ phép → Tạo yêu cầu nghỉ → LVT_01 → Gửi → F5
- **Network:** Attendance tab recovered **200** sau burst; **no POST** leave-requests captured
- **Note:** Running `:28001` = `dist-uat-w6` freeze — **may not include** D-HDSD-MUTATE-BE-01 lazy `leave_types` pull until rebuild/restart from fresh `dist/`
- **Screenshot:** `08-02-leave-after-submit.png`
- **Verdict:** 🔴 **FAIL** — retest cần hrm-api build BE-02 + harness date `dd/MM/yyyy` placeholders (pattern từ `qa-hdsd-w4-int-03-r2-browser.mjs`)
- **spec_ref:** UF-HRM-09 · R-HDSD-W2-02

### TC-HDSD-10-04-01 · internal_services redirect (regression 🟢)

- **Click path:** `/hr/internal_services?portal=1&…`
- **FE:** Redirect `→ /hr/internal-services`; no console 404 embed
- **Screenshot:** `10-04-internal-services.png`
- **Verdict:** 🟢 **PASS**

---

## Stack / environment incidents (this session)

| Incident | Impact | Owner |
|----------|--------|-------|
| hrm-api **500 cascade** ~15:10:34Z during HRM embed routes (employees, catalogs, contracts, recruitment) | TC 05–07 FAIL/BLOCKED | devops — restart + burst resilience |
| hrm-api **down** after portal proxy ECONNREFUSED :28001 mid-session | Follow-up runs aborted | devops |
| `dist/main.js` MODULE_NOT_FOUND | Cannot `start:prod` without rebuild | dev-be |
| Portal :5173 **crash** under heavy Puppeteer (TIME_WAIT storm) | Re-run incomplete | devops — stable dev stack |
| Shareholder POST 201 but **F5 list** not showing stamp | TC 03 partial | dev-fe — post-save list refresh |

---

## completion_report

**Closed / promoted 🟢:**

- UF-XBOS-10 workflow canvas deep link (regression)
- UF-HRM internal_services → `/internal-services` redirect (regression)
- UF-XBOS-05 shareholder mutate **POST 201** via FE-02 `data-testid` harness (tiến bộ vs RET-01)

**Partial 🟡 (FE entry OK, mutate chưa đủ AC):**

- Shareholder F5 persist
- HRM contract dialog + testid submit path
- YCTD form opens + JD library exists (U65)

**Not promoted 🔴:**

- NV POST 201 + F5
- Contract POST 2xx + F5
- YCTD POST 2xx
- Leave POST 2xx + F5 (BE-02 not verified on running dist)

---

## next_owner

pm → dispatch **devops** (stack stability + hrm-api rebuild/restart with BE-02) then **qa** RET-03; **dev-fe** shareholder F5 refresh if POST-only not enough for AC

---

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-DO-01
from_role: pm | to_role: devops
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-02-20260730.md FAIL hrm-api 500 cascade + portal crash under Puppeteer
exit_criteria: hrm-api :28001 stable under concurrent embed load; rebuild dist with D-HDSD-MUTATE-BE-01 if dist-uat-w6 stale; portal :5173 + hrm vite embed up; pnpm run qc:dev-stack + qc:fe-be-health exit 0 before QA handback
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03 after stack stable
```

```
work_item_id: D-HDSD-MUTATE-FE-03
from_role: pm | to_role: dev-fe
entry_criteria: qa-hdsd-mutate-ret-02 shareholder POST 201 but F5 list missing row QA HDSDNGT1N
exit_criteria: After POST 201, F5 + reopen holding edit shows new shareholder row; no regression WF/internal_services
ack_status: READY_FOR_QA
```

```
work_item_id: QA-HDSD-MUTATE-RET-03
from_role: pm | to_role: qa
entry_criteria: D-HDSD-MUTATE-DO-01 READY_FOR_QA; L0 exit 0; portal :5173; U65 zero-seed
exit_criteria: Re-run TC-HDSD-03-02-01 (POST+F5), 05-03-01 (POST 201+F5), 06-02-01, 07-02-01, 08-02-01 (leave lazy catalog cold); regression UF-XBOS-10 + internal_services 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-20260730.md
cấm: seed
ack_status: PASS_TO_PM or FAIL_TO_PM
read_first: qa-hdsd-mutate-ret-02-20260730.md
```

---

**ack_status:** `FAIL_TO_PM`
