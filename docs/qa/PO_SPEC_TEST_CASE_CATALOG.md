# PO Spec Test Case Catalog

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-SPEC-TEST-CASE-CATALOG-01` |
| **Program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` (T1) |
| **Date** | 2026-08-03 |
| **Owner** | qa |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log · **cấm** invent ladder `T_L1` / `N` · **cấm** claim UAT DONE |
| **Spine SoT** | `PO_E2E_BUSINESS_SPINE_PROGRAM.md` · `po-e2e-ba-case-matrix-01.md` |
| **TC count** | **53** (P0 spine + manager_id + unit hooks) |
| **Status** | ACTIVE — master catalog; browser UF still required for EVIDENCED UI |

---

## 0. Spec read ack (cite)

| Source | Path | What cited |
|--------|------|------------|
| SRS (pack VN — thin) | `docs/brand-new-documents-20270801/SRS_VN.md` | §3 WF hai cấp / chống tự duyệt · §4 HRM: CRUD NV, nghỉ phép 2 cấp + số dư, pipeline tuyển dụng · §5 Mobile: tạo nghỉ + duyệt QL, check-in |
| SRS FR codes (runtime/BA SoT) | BA matrix + evidence cite `SRS_NEW` **FR-UC-B03 / H01 / H03 / H04 / M03** | File `SRS_NEW.md` **not on disk** this workspace snapshot — FR codes retained from BA/evidence until pack restore; **do not invent** ladder `N` |
| TechSpec VN | `docs/brand-new-documents-20270801/TECH_SPEC_VN.md` | §1 runtime · §2 JWT/auth · §5 storage attachments |
| TechSpec detail (evidence) | Cited `TECH_SPEC_NEW` §4.3 / §4.4 leave/manager | Same pack gap as SRS_NEW — cite via BE evidence until restored |
| API Contract VN | `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` | §2 Workflows approve/reject · §3 Employees PATCH · Attendance · Leave POST/GET/approve · Recruitment candidates/requisitions |
| Runtime codes (impl) | Nest evidence / OpenAPI live | `HRM-LEAVE-VAL-ATT` · `HRM-LEAVE-201` · `HRM-VAL-001` · `HRM-EMP-202` · `HRM-ATT-REQ-201/203` · `XBOS-WF-200` · `HRM-FILE-201` |
| BA case matrix | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` | HP-01..06 · LV-01..06 · AT-01..03 · **GAP-LEAVE-LADDER-01** |
| DB | `DB_DESIGN_VN.md` + evidence `employees.manager_id` | Hierarchy L1 filter |

**Status values:** `PLANNED` · `AUTOMATED` · `EVIDENCED` · `BLOCKED` · `FAIL` · `SPEC_GAP`

---

## 1. Coverage rollup (spine → TC)

| Spine / theme | Case IDs (BA) | Catalog TC range | Notes |
|---------------|---------------|------------------|-------|
| E2E-SPINE-01 Hire-to-Pay | HP-01..06 | TC-HP-01..14 + TC-UNIT-REC-* | HP-04 W4-R1 EVIDENCED (prior FAIL superseded); Inbox W3 EVIDENCED; HP-02 FAIL open |
| E2E-SPINE-02 Leave | LV-01..06 | TC-LV-01..16 + TC-UNIT-LEAVE-* | LV-03/04 GWC EVIDENCED; approve UX EVIDENCED; **LV-02 SPEC_GAP** |
| E2E-SPINE-03 Late/ESS | AT-01..03 | TC-AT-01..08 | Nav **GWC** closed; submit/approve still deferred |
| UC-H01 manager_id | R-SPINE-MGR-HIER | TC-MGR-01..06 + TC-UNIT-MGR-* | Browser set manager EVIDENCED · J-MOB-05 pending |
| Cross / auth-scope | — | TC-X-01..04 | 409/self-approve |

---

## 2. E2E-SPINE-01 — Hire / candidates / inbox

| TC-ID | UC/FR | TechSpec | API | Layer | Type | Precondition | Steps | Expected | Automate | Status | Evidence |
|-------|-------|----------|-----|-------|------|--------------|-------|----------|----------|--------|----------|
| **TC-HP-01** | FR-UC-B03 · HP-01 | TECH_SPEC_VN §2; WF canvas | PUT/POST `/api/xbos/workflow-engine/...` definitions **2xx** | UI | Happy | `ceo@xe.vn` · portal | CC → Quy trình → mở/lưu QT `hrm_recruitment_*` → reload | Definition active; no error banner; F5 còn | MANUAL / Playwright spine-01-w1 | **EVIDENCED** | `po-e2e-spine-01-qa-w1.md` (HP-01 🟢) |
| **TC-HP-02** | FR-UC-B03 · HP-02 | Recruitment plan/req | POST plan/requisition **2xx** + WF spawn | UI | Happy | HRBP or Group CEO | Tuyển dụng → Kế hoạch / YCTD → Tạo → **Gửi duyệt QT** | Row «Chờ duyệt»; F5 còn; scope 409 nếu sai CT | MANUAL | **FAIL** (prior W1 mount/JobTemplates) / retest after FE mount | `po-e2e-spine-01-qa-w1.md` · `po-e2e-spine-01-fe-rec-mount.md` |
| **TC-HP-03** | FR-UC-B03 · HP-03 · UF-XBOS-08 | Inbox complete | POST task complete **201** `XBOS-WF-200` | UI | Happy | Task tồn tại từ FE (U65) | CC → Hộp thư → task tuyển dụng → **Duyệt** → F5 | Task completed / rời inbox; stamp title visible | Playwright `po-e2e-spine-01-qa-w3` | **EVIDENCED** | `po-e2e-spine-01-qa-w3.md` |
| **TC-HP-04** | FR-UC-B03 · HP-03 · BR-WF-04 | Inbox | POST approve self | UI | Fail-deep | Same user submitter=approver | Mở task của chính mình → Duyệt | **4xx** / chặn tự duyệt; không APPROVED | MANUAL | **PLANNED** | — |
| **TC-HP-05** | HP-03 · U65 | Inbox empty | — | UI | Boundary | Inbox trống | Mở Hộp thư không seed | Verdict **BLOCKED** — không seed | MANUAL | **PLANNED** (policy) | BA matrix §U65 |
| **TC-HP-06** | UF-HRM-12 · HP-04 · J-REC-WF-04 | CreateCandidate DTO | `POST /api/hrm/recruitment/candidates` | UI | Happy | Requisition approved context | Ứng viên → **Thêm ứng viên** → Lưu | **201** create; row trên list; F5 còn | Playwright w4-r1 | **EVIDENCED** | `po-e2e-spine-01-qa-w4-r1.md` · prior FAIL `qa-w4` superseded by BE-CAND-DTO + W4-R1 **201** `HRM-REC-CP-201` |
| **TC-HP-07** | HP-04 | DTO whitelist | Same POST with FE extra fields | API | Fail-deep | Auth recruiter | POST FE-shaped → 0 validation errors; unknown prop still forbid | FE-shaped **PASS**; unknown still **400** | jest `po-e2e-spine-01-be-cand-dto-01.spec.ts` | **AUTOMATED** | `po-e2e-spine-01-be-cand-dto-01.md` · READY confirmed W4-R1 |
| **TC-HP-08** | HP-04 hire link | HireEmployeeLink | Hire/link API **2xx** | UI | Happy | Candidate created | Kéo **Đã tuyển** → HireEmployeeLinkDialog → gắn NV | `employee_id` set; chip hired; F5 | Playwright w4-r1 | **EVIDENCED** | `po-e2e-spine-01-qa-w4-r1.md` · PATCH **200** `HRM-REC-CP-200` |
| **TC-HP-09** | FR-UC-H01 · HP-05 | Employees GET | `GET /api/hrm/employees/:id` **200** | UI | Happy | After hire | Nhân sự → mở hồ sơ NV | Profile đúng CT; không 404 scope | Playwright w4-r1 | **EVIDENCED** (soft) | W4-R1 detailOk · soft residual stamp/contracts — not G-DB-01 block |
| **TC-HP-10** | HP-05 · J-HRM-03 | Contracts | GET contracts **200** | UI | Happy | NV + HĐ | Hợp đồng → HĐ active cùng CT | HĐ hiển thị | MANUAL | **PLANNED** | — |
| **TC-HP-11** | FR-UC-H04 · HP-06 | Payroll | GET payslips/periods **200** | UI | Happy | NV in period | Lương → kỳ/payslip | Row NV hoặc empty hợp lệ | MANUAL | **PLANNED** | — |
| **TC-HP-12** | FR-UC-B03 · scope | Requisitions | POST/GET recruitment | UI | Auth/scope | `du-lich.ceo@xe.vn` | List/hire ngoài CT | **403/409**; không mutate ngoài CT | MANUAL | **PLANNED** | — |
| **TC-HP-13** | J-REC-WF-01 | WF reject | POST reject ≥10 chars (API_CONTRACT_VN §2) | UI | Fail-deep | Task open | Inbox → Từ chối + lý do ngắn / đủ | Reject path 2xx khi lý do ≥10; short → 4xx | MANUAL | **PLANNED** | API_CONTRACT_VN |
| **TC-HP-14** | HP-02 spawn | Bridge spawn | WF start / SPAWN-MISSING honest | API | Boundary | Plan submit | Submit plan khi WF missing | Banner honest; không silent success | jest `recruitment-workflow.bridge.spec.ts` | **AUTOMATED** (partial) | bridge.spec |

---

## 3. E2E-SPINE-02 — Leave attach / approve / ladder

| TC-ID | UC/FR | TechSpec | API | Layer | Type | Precondition | Steps | Expected | Automate | Status | Evidence |
|-------|-------|----------|-----|-------|------|--------------|-------|----------|----------|--------|----------|
| **TC-LV-01** | FR-UC-H03 · FR-UC-M03 · LV-01 | Leave create | `POST …/attendance/leave-requests` **2xx** | MOBILE | Happy | `uat.nv####` | FAB → Tạo đơn nghỉ → wizard → Gửi | Toast «Đã gửi»; status pending; F5 list | Device / U78 | **EVIDENCED** (submit) | `po-e2e-spine-02-03-mob-qa-w1.md` |
| **TC-LV-02** | LV-01 · J-MOB-05 | Leave approve L1 | Approve **2xx** / WF complete | MOBILE | Happy | `manager_id` set → QL | QL → Phê duyệt → Nghỉ phép → Duyệt | NV → approved; balance giảm | Device | **BLOCKED** → retest after mgr hier | mob-w1 🟡; mgr browser READY |
| **TC-LV-03** | FR-UC-H03 · **LV-02** · GAP-LEAVE-LADDER-01 | WF 2-step | L1 then L2 approve | MOBILE/UI | Happy | **Sponsor chốt `T_L1`/`N` + WF 2 bước** | Submit `total_days > N` → L1 → assert not terminal → L2 → APPROVED | Chỉ sau L2 mới APPROVED | MANUAL | **SPEC_GAP / BLOCKED** | BA matrix §1.3 — **cấm invent N** |
| **TC-LV-04** | LV-02 AS-IS honesty | WF catalog 1 step | — | API | Boundary | AS-IS `hrm_leave_approval` 1 step | Inspect graph / spawn | Document AS-IS L1-only; no fake L2 PASS | MANUAL / code review | **EVIDENCED** (gap locked) | `po-e2e-ba-case-matrix-01.md` |
| **TC-LV-05** | FR-UC-H03 · LV-03 · BR-LEAVE-ATT-01 | VAL-ATT | POST leave sick≥3 no attach → **4xx** `HRM-LEAVE-VAL-ATT` **or** FE block no POST | UI | Fail-deep | `ceo@xe.vn` Attendance | Chấm công → Nghỉ phép → Ốm ≥3d · không file → Lưu | Toast VI; **no silent 201**; F5 không tạo đơn hợp lệ | Playwright w1-r1 | **EVIDENCED** (GWC) | `po-e2e-spine-02-web-qa-w1-r1.md` · `po-e2e-spine-02-web-qc-w1.md` |
| **TC-LV-06** | LV-03 BE depth | catalog LVT_02 | Same VAL-ATT on API | API/UNIT | Fail-deep | Auth | POST sick≥3 `attachment_url` null | **HRM-LEAVE-VAL-ATT** | jest `leave-requests.service.spec.ts` | **AUTOMATED** | `po-e2e-spine-02-be-lv03-val-att-01.md` |
| **TC-LV-07** | FR-UC-H03 · LV-04 | attach + create | `POST /files/upload` **201** `HRM-FILE-201` + leave **201** `HRM-LEAVE-201` | UI | Happy | Attach UI | Upload giấy → Gửi ốm≥3d | `attachment_url` non-null; F5 GET giữ | Playwright w1-r1 | **EVIDENCED** (GWC) | same R1 + QC |
| **TC-LV-08** | LV-04 path guard | VAL-ATT URL | POST attach outside `/api/hrm/files/` | UNIT | Fail-deep | — | createLeaveRequest evil URL | `HRM-LEAVE-VAL-ATT` | jest leave-requests VAL-W7-LATT-02 | **AUTOMATED** | leave-requests.service.spec.ts |
| **TC-LV-09** | LV-04 approve path · **R-SPINE-WEB-APPROVE-UX** | leave approve | POST approve / Inbox | UI | Happy | Pending leave w/ attach | Duyệt list Attendance +/or CC Inbox | approved/complete **2xx** + F5 | Playwright | **EVIDENCED** (GWC) | `r-spine-web-approve-ux-01-qa.md` · **`r-spine-web-approve-ux-01-qc.md`** GWC — condition `R-SPINE-WEB-APPROVE-UX-01` **CLOSED** |
| **TC-LV-10** | LV-05 · BR-WF-04 | Self-approve | Approve own leave | API/UI | Fail-deep | Submitter=approver | Duyệt đơn mình | **4xx** / chặn | MANUAL + bridge | **PLANNED** | BA §8 |
| **TC-LV-11** | LV-06 · scope | Cross-company approve | Approve **403/409** | API/UI | Auth/scope | Approver sai CT | Duyệt đơn CT khác | Status không đổi | MANUAL | **PLANNED** | — |
| **TC-LV-12** | FR-UC-H03 · BR-LEAVE-NOTICE-01 | Notice ≥3 calendar days | POST annual close to start | API/UI | Fail-deep | Annual leave | Gửi sát ngày (<3 ngày lịch) | **4xx** per SRS **or** residual if BE soft | MANUAL | **PLANNED** (PARTIAL cite) | BA §1.2 |
| **TC-LV-13** | Balance | VAL-BALANCE | POST over balance | UNIT/API | Fail-deep | Balance 0 | Create leave over tracked balance | `HRM-LEAVE-VAL-BALANCE` | jest leave-requests | **AUTOMATED** | leave-requests.service.spec.ts |
| **TC-LV-14** | Overlap | VAL-OVERLAP | POST overlapping | UNIT | Fail-deep | Pending exists | Overlapping range | `HRM-LEAVE-VAL-OVERLAP` | jest | **AUTOMATED** | same |
| **TC-LV-15** | J-HRM-06 list→detail | Leave list | GET leave-requests **200** | UI | Happy | Web Attendance | List → open row / F5 | No 404 scope; mount `#root` OK | Playwright | **EVIDENCED** | w1-r1 mount · leave LIVE-R1 |
| **TC-LV-16** | Bridge spawn | LeaveWorkflowBridge | Spawn `hrm_leave_approval` | UNIT | Happy | create leave | Bridge assign `direct_manager` | Task/assignee path; fallback hrbp | jest `leave-workflow.bridge.spec.ts` | **AUTOMATED** | leave-workflow.bridge.spec.ts |

---

## 4. E2E-SPINE-03 — Late / attendance ESS

| TC-ID | UC/FR | TechSpec | API | Layer | Type | Precondition | Steps | Expected | Automate | Status | Evidence |
|-------|-------|----------|-----|-------|------|--------------|-------|----------|----------|--------|----------|
| **TC-AT-01** | UC-HRM-MOB-06 · AT-01 | update-requests | `POST …/attendance/update-requests` **201** `HRM-ATT-REQ-201` | MOBILE | Happy | NV ESS | Nav HDSD → Điều chỉnh / đi muộn → (Gửi deferred) | Nav lands CreateUpdateRequest; **submit/approve out of nav GWC** | Device | **EVIDENCED** (nav-only GWC) | `r-spine-at-nav-01-qa.md` · `r-spine-at-nav-01-qc.md` · prior mob-w1 BLOCKED superseded for nav |
| **TC-AT-02** | AT-01 approve | Approve update | **203** `HRM-ATT-REQ-203` | MOBILE | Happy | Pending request | QL → Cần duyệt → tab điều chỉnh → Duyệt | NV approved; badge giảm; F5 | Device | **BLOCKED** (upstream full submit) | AT-NAV GWC nav-only — submit/approve deferred |
| **TC-AT-03** | AT-02 | Validation DTO | POST missing date/reason | MOBILE/API | Fail-deep | — | Submit thiếu field | **4xx** VI; no mutate | MANUAL | **PLANNED** | BA §4 |
| **TC-AT-04** | AT-03 · J-HRM-06 | Records after approve | GET attendance/records **200** | UI/MOBILE | Happy | After AT-01 approve | Lịch sử / web Chấm công | Bản ghi đúng kỳ; **không** epoch 1970 | MANUAL | **PLANNED** | — |
| **TC-AT-05** | SRS_VN §4 geofence | check-in | `POST /hrm/attendance/check-in` | MOBILE | Happy/Boundary | GPS | Check-in in/out range | In-range 2xx; out → `ATTENDANCE_LOCATION_OUT_OF_RANGE` 422 (contract) | MANUAL / unit | **PLANNED** | API_CONTRACT_VN §4 |
| **TC-AT-06** | J-MOB-02 regress | Check-in tile | check-in | MOBILE | Happy | Device | Home/FAB check-in | Smoke regress not broken by leave wave | Device | **PLANNED** | — |
| **TC-AT-07** | Update-requests service | attendance-requests | create/approve unit | UNIT | Happy/Fail | — | Service create + approve paths | Codes 201/203 + validation | jest `attendance-requests.service.spec.ts` | **AUTOMATED** (partial) | attendance-requests.service.spec.ts |
| **TC-AT-08** | Web mirror UF-HRM-05 | Attendance sheet | GET attendance | UI | Happy | Web | Chấm công tab load | No ERROR banner; empty hợp lệ OK | MANUAL | **PLANNED** | matrix UF-HRM-05 |

---

## 5. UC-H01 — `manager_id` hierarchy

| TC-ID | UC/FR | TechSpec | API | Layer | Type | Precondition | Steps | Expected | Automate | Status | Evidence |
|-------|-------|----------|-----|-------|------|--------------|-------|----------|----------|--------|----------|
| **TC-MGR-01** | FR-UC-H01 · Option B | Employee PATCH | `PATCH /api/hrm/employees/:id` **200** `HRM-EMP-202` + `manager_id` | UI | Happy | `ceo@xe.vn` | Nhân sự → UAT NV → picker QL HLD-0001 → **Lưu** | Body `manager_id` set; F5 GET retains | Playwright browser | **EVIDENCED** | `r-spine-mgr-hier-01-qa-browser.md` |
| **TC-MGR-02** | FR-UC-H01 | Display label | GET detail | UI | Boundary | After MGR-01 | F5 profile | Prefer `manager_label`; P2 if «—» while API id set | MANUAL | **EVIDENCED** (P2 residual) | same |
| **TC-MGR-03** | FR-UC-H03 L1 | List filter | GET leave pending `manager_employee_id` | API | Happy | manager_id edge | Probe pending for QL | NV đơn xuất hiện dưới QL (not CEO-unless-manager) | API probe / device | **PLANNED** (retest J-MOB-05) | handoff qa-device |
| **TC-MGR-04** | Self-manager | assertManagerAssignment | PATCH manager_id = self | UNIT/API | Fail-deep | — | Assign self | Reject | jest `employee-manager.validation.spec.ts` | **AUTOMATED** | employee-manager.validation.spec.ts |
| **TC-MGR-05** | Cross-company manager | same | PATCH manager other CT | UNIT | Auth/scope | — | Assign cross-company | Reject | jest | **AUTOMATED** | same |
| **TC-MGR-06** | Cycle | same | PATCH cycle | UNIT | Fail-deep | A→B→A | Assign cycle | Reject | jest | **AUTOMATED** | same |

---

## 6. Cross-cutting / unit hooks (spine-adjacent)

| TC-ID | UC/FR | TechSpec | API | Layer | Type | Precondition | Steps | Expected | Automate | Status | Evidence |
|-------|-------|----------|-----|-------|------|--------------|-------|----------|----------|--------|----------|
| **TC-UNIT-LEAVE-01** | FR-UC-H03 | Leave service | createLeaveRequest | UNIT | Happy | mocks | Persist attachment_url sick | Row has URL | jest leave-requests | **AUTOMATED** | leave-requests.service.spec.ts |
| **TC-UNIT-LEAVE-02** | FR-UC-H03 | catalog type | create with catalog LVT | UNIT | Happy/Fail | company partition | Catalog leave_type + partition | Accept/reject per BR | jest D-HRM-LEAVE-REQ-CREATE | **AUTOMATED** | same file describe catalog |
| **TC-UNIT-REC-01** | Recruitment | CreateCandidateDto | validateSync whitelist | UNIT | Fail-deep | FE-shaped body | validate forbidNonWhitelisted | 0 errors after DTO fix; was FAIL driver for HP-04 | jest `po-e2e-spine-01-be-cand-dto-01.spec.ts` | **AUTOMATED** | be-cand-dto-01 |
| **TC-UNIT-REC-02** | Recruitment controller | createCandidate | controller scope | UNIT | Auth/scope | missing tenant | createCandidate | Reject before service | jest recruitment.controller.spec.ts | **AUTOMATED** | recruitment.controller.spec.ts |
| **TC-UNIT-EMP-01** | FR-UC-H01 | employees.service | PATCH manager | UNIT | Happy | mocks | update with manager_id | Calls assertManagerAssignment | jest employees.service.spec / update-policy | **AUTOMATED** (partial) | employees.service.spec.ts |
| **TC-X-01** | Scope parity | list↔get-by-id | GET employees | API | Auth/scope | `company_id=main` | List row → GET id same scope | No 404 when list shows row | jest employees + browser | **PLANNED** / prior waves | ADR scope |
| **TC-X-02** | BR-WF-04 | Workflow | approve | API | Fail-deep | self | Approve own WF task | Reject | MANUAL | **PLANNED** | SRS_VN §3 |
| **TC-X-03** | Catalog control SPINE-04 | publish/pull | CFG sync | UI | Happy | ceo | Publish → apply → HRM pull | status_label display-ready | Playwright W1-B-03 | **EVIDENCED** (control) | `w1b-03-tc-cat-qa-r1.md` |
| **TC-X-04** | Leave mount GWC | Attendance FE | — | UI | Regression | Vite | `/hr/attendance` Nghỉ phép | `#root` children OK; no missing LeaveOverviewRecentPanel | Playwright | **EVIDENCED** | w1b-01 leave LIVE-R1 · spine-02 R1 |

---

## 7. Mapping BA case → primary TC

| BA Case | Primary TC-ID(s) | Current catalog status |
|---------|------------------|------------------------|
| HP-01 | TC-HP-01 | EVIDENCED |
| HP-02 | TC-HP-02 | FAIL / retest |
| HP-03 | TC-HP-03, TC-HP-04, TC-HP-05 | EVIDENCED (happy) · PLANNED (negatives) |
| HP-04 | TC-HP-06..08, TC-UNIT-REC-01 | **EVIDENCED** W4-R1 · AUTOMATED DTO (prior FAIL superseded) |
| HP-05 | TC-HP-09..10 | EVIDENCED soft (09) · PLANNED contracts (10) |
| HP-06 | TC-HP-11 | PLANNED |
| LV-01 | TC-LV-01..02, TC-MGR-03 | EVIDENCED submit · BLOCKED approve (J-MOB-05) |
| **LV-02** | **TC-LV-03..04** | **SPEC_GAP / EVIDENCED AS-IS — no invent T_L1** |
| LV-03 | TC-LV-05..06 | EVIDENCED GWC + AUTOMATED |
| LV-04 | TC-LV-07..09 | EVIDENCED create/attach · **TC-LV-09 approve UX GWC** |
| LV-05 | TC-LV-10 | PLANNED |
| LV-06 | TC-LV-11 | PLANNED |
| AT-01 | TC-AT-01..02 | EVIDENCED nav GWC · BLOCKED approve/submit |
| AT-02 | TC-AT-03 | PLANNED |
| AT-03 | TC-AT-04 | PLANNED |
| manager_id | TC-MGR-01..06 | EVIDENCED UI + AUTOMATED validation |

---

## 8. Policy reminders

1. Catalog **neo** spec ↔ test; **không** thay browser UF (U65/U76/U78).  
2. **LV-02 / TC-LV-03** tối đa SPEC_GAP until Sponsor/SA chốt `T_L1` + WF 2 bước.  
3. Report live: `docs/qa/reports/PO_SPEC_TEST_REPORT.md`.  
   **Sponsor UC×TC status:** `docs/qa/reports/PO_UC_TESTCASE_STATUS_ROLLUP.md`.  
   **Test Case chuyên nghiệp (UC→nghiệp vụ→chức năng→case):** `docs/qa/professional/README.md` — **SoT thiết kế mới** (catalog spine 53 = subset E2E cũ).  
4. Unit gap matrix: T2 CLOSED → `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` · IMPL in-flight `PO-SPEC-UNIT-TEST-IMPL-01` (do not re-dispatch plan).
5. Live report: T3 refresh `docs/qa/reports/PO_SPEC_TEST_REPORT.md` · evidence `po-spec-test-report-t3-01.md`.
6. **Ecosystem depth Wave A (465 TC):** neo-map §9 · synth `po-eco-tc-synth-wave-a-01.md` · report §6 — spine 53 TC unchanged.
7. **Ecosystem depth Wave C (156 TC):** neo-map §10 evidence · synth `po-eco-tc-synth-wave-c-01.md` · report §10 — spine 53 TC unchanged.

---

## 9. Ecosystem depth — Wave A neo map (SYNTH)

| Meta | Value |
|------|--------|
| **WI** | `PO-ECO-TC-SYNTH-WAVE-A-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-a-01.md` |
| **Depth TCs** | **465** PLANNED (6 packs) — **does not replace** spine 53 TC |

Spine rows remain SoT for E2E execution status. Depth packs use prefixed IDs (`TC-EMP-*`, `TC-REC-*`, …); overlaps with spine are **cross_ref** only (evidence §2.5). Rollup: `docs/qa/reports/PO_SPEC_TEST_REPORT.md` §6.

---

## 10. Ecosystem depth — Wave C neo map (SYNTH)

| Meta | Value |
|------|--------|
| **WI** | `PO-ECO-TC-SYNTH-WAVE-C-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-c-01.md` |
| **Depth TCs** | **156** PLANNED (4 packs) — **does not replace** spine 53 TC |

Login auth depth: **`TC-LGN-*`** (canonical) vs **`TC-CC-HP-001`** in CC-HOME (pointer). Team directory: **`TC-MOB-TEAM-*`**. Rollup: report §10.

---

*PO-SPEC-TEST-CASE-CATALOG-01 · 53 TC · Status sync T3 2026-08-03 · Wave A neo §9 · Wave C neo §10*
