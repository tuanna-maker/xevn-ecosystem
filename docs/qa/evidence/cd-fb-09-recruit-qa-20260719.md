# CD-FB-09-RECRUIT — QA evidence (2026-07-19)

**work_item_id:** `CD-FB-09-RECRUIT`  
**from_role:** qa  
**to_role:** pm  
**ack_status:** **PASS_TO_PM**  
**persona:** Group CEO session on HRM embed (`JWT xevn/main`, `companyId=main`) via portal token bridge  
**env:** L0 `qc:dev-stack` — hrm-api `:28001` 200 · xbos-api `:28002` 200 · portal `:5173` 200  
**sponsor_lock:** U65 browser-only · zero-seed · no Phase1/PROD claim · XBOS WF bridge deferred  

**read_first:** `docs/qa/evidence/cd-fb-09-recruit-fe-20260719.md` · `CUSTOMER_DEMO_HRM_DELTA_20260620.md` §6  

---

## Entry / L0

| Check | Result |
|-------|--------|
| FE READY_FOR_QA | `cd-fb-09-recruit-fe-20260719.md` |
| `pnpm run qc:dev-stack` | HRM+XBOS+portal **200** |
| Seed used | **None** |

---

## AC matrix (browser FE)

### AC-CD-F6-01 — JD library CRUD — **PASS**

| Step | Evidence |
|------|----------|
| Click path | `/hr/recruitment?portal=1&tenantId=xevn&companyId=main` → **Thư viện JD** → **Thêm JD** |
| Create | Mã `JD-QA-CDF609-1907` · title `JD QA CD-FB-09 Tuyển dụng demo` · Lưu |
| Network / toast | `POST /recruitment/job-templates` → **HRM-REC-JD-201** · toast «Đã tạo JD template» |
| FE sau 2xx | Row appears in table |
| Edit | **Sửa** → title `… (đã sửa)` → toast «Đã cập nhật JD» · `PATCH /recruitment/job-templates` |
| F5 | Hard reload → Thư viện JD → row **JD-QA-CDF609-1907** still present |

### AC-CD-F6-02 — Requisition from template + snapshot — **PASS**

| Step | Evidence |
|------|----------|
| Click path | **Yêu cầu tuyển dụng** → **Thêm yêu cầu** |
| Template | Select `JD-QA-CDF609-1907 — … (đã sửa)` |
| Autofill | `job_description` = «Phối hợp kho bãi…» · `requirements` = «2 năm logistics…» (non-empty) |
| Save | **Lưu yêu cầu** → toast «Đã tạo yêu cầu tuyển dụng» + «Đã snapshot JD từ thư viện (BR-CD-F6-02)» |
| FE sau 2xx | Row `REQ QA CD-FB-09 từ JD template` · status Đang tuyển |
| Detail snapshot | See J-HRM-05 |

### AC-CD-F6-03 — Dashboard funnel 6 cột — **PASS**

| Step | Evidence |
|------|----------|
| UI | **Pipeline ứng viên (6 giai đoạn)** — Chờ CV/Mới · Sàng lọc · Phỏng vấn · Đề nghị · Đã tuyển · Từ chối |
| Rollup counts (Group CEO) | Tổng **5** · Mới **5** · others **0** |
| BR-DQ-01 | No `1OFFICE` / mock org labels on dashboard |
| Live bind | PerformanceResourceTiming: `GET …/candidates-pool?company_id=main` (and related recruitment GETs) while dashboard mounted; recent activity lists live `QA Pool *` candidates |

### AC-CD-F6-04 — Scope ĐVTV subset — **PASS**

| Step | Evidence |
|------|----------|
| Filter UI | Đơn vị thành viên → **Khối Vận tải X.E** |
| Network | `GET /api/hrm/recruitment/candidates-pool?company_id=trsport` observed after select |
| JWT | Remains `JWT xevn/main · Tập đoàn (companyId=main)` / `hrm_current_company_id=main` (AC-CD-F3-03 pattern) |
| Labels | No `1OFFICE` |
| Counts | Funnel briefly `—` then re-aggregate (subset vs rollup 5); not hardcoded |

---

## L2 / L2.5

### P-CC-06 — `/command-center/hrm/recruitment` funnel visible — **PASS**

| Check | Evidence |
|-------|----------|
| Hard nav | `http://localhost:5173/command-center/hrm/recruitment` |
| Iframe | `…/hr/recruitment?portal=1&…` |
| Funnel | **Pipeline ứng viên (6 giai đoạn)** visible inside HRM Workspace iframe · all 6 stage labels present |
| Soft-nav note | Soft click **Tuyển dụng** from Attendance can leave iframe on `/hr/attendance` while portal URL says recruitment — **hard reload / dedicated `/hr/recruitment` required** for reliable FE AC (known embed soft-nav class; not F6 product FAIL for hard path) |

### J-HRM-05 — list → detail — **PASS**

| Step | Evidence |
|------|----------|
| List | Yêu cầu tuyển dụng → row `REQ QA CD-FB-09 từ JD template` |
| Detail | **Chi tiết** → dialog **Chi tiết yêu cầu tuyển dụng** |
| Spec chrome | Copy cites `J-HRM-05 — dữ liệu từ GET /recruitment/requisitions/:id` |
| Network | `GET /api/hrm/recruitment/requisitions/5b96237c-8db2-4a13-9cb8-a2a121e9d063?company_id=holding` |
| Snapshot fields | **Mô tả công việc (snapshot)** + **Yêu cầu (snapshot)** match template text · not empty |
| Console | No detail 404/409 on open |

---

## Verdict summary

| ID | Verdict |
|----|---------|
| AC-CD-F6-01 | **PASS** |
| AC-CD-F6-02 | **PASS** |
| AC-CD-F6-03 | **PASS** |
| AC-CD-F6-04 | **PASS** |
| J-HRM-05 | **PASS** |
| P-CC-06 | **PASS** |
| Overall | **PASS_TO_PM** |

---

## Residual (not blocking PASS)

| Item | Owner | Note |
|------|-------|------|
| Soft-nav P-CC-06 iframe stall (attendance stuck) | dev-fe (known class) | Hard reload works; same family as ATT-NAV soft-nav |
| AC-CD-F6-06 interview deep-link from funnel stage | qa / next wave | Explicit residual from FE handoff; out of this exit |
| XBOS recruitment WF bridge | SA deferred | Out of F6 MVP · cấm require in this wave |
| Portal multi-tab membership pollution | ops/qa note | Parallel tab showed `du-lich.ceo` JWT; primary AC run on Group CEO `/hr/recruitment` session |

**not promoted:** Phase1 DONE · PROD-READY · AC-CD-F6-05 hire→INT · AC-CD-F6-06 · J-REC-WF-*  

---

## Handoff

**completion_report:** Browser U65 QA for CD-FB-09-RECRUIT closed AC-CD-F6-01..04 + J-HRM-05 + P-CC-06. JD CRUD persist (POST 201 + PATCH + F5). Requisition template autofill + snapshot in Chi tiết. Funnel 6 stages live, no 1OFFICE. ĐVTV Vận tải → `company_id=trsport` with JWT `main` stable. No seed. No Phase1/PROD claim. XBOS WF not required.

**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/cd-fb-09-recruit-qa-20260719.md`

**next_dispatch_prompt:**
```
work_item_id: CD-FB-09-RECRUIT
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM docs/qa/evidence/cd-fb-09-recruit-qa-20260719.md; AC-CD-F6-01..04 + J-HRM-05 + P-CC-06
exit_criteria: GO or GO WITH CONDITIONS; residual soft-nav P-CC-06 + AC-CD-F6-06 listed; cấm Phase1/PROD claim; cấm require XBOS WF
evidence_path: docs/qa/evidence/cd-fb-09-recruit-qc-YYYYMMDD.md
```

**pm_dispatch_hint:** `CD-FB-09-RECRUIT` — Task `qc` same session; optional later `dev-fe` soft-nav embed stall + `qa` AC-CD-F6-06
