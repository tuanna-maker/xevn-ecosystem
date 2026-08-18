# PO-E2E-BA-CASE-MATRIX-01 — Ma trận case E2E nghiệp vụ (3 spine)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-BA-CASE-MATRIX-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **program** | `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 zero-seed · U76 HDSD-aligned · U78 test-log · `no_prompt_echo: true` |
| **cấm** | Invent ngưỡng ngày L1/L2 không citation · seed inbox · claim UAT DONE |

---

## 0. Mục tiêu & actors

| Actor | Persona / account | Surface |
|-------|-------------------|---------|
| CEO tập đoàn | `ceo@xe.vn` / `Xevn@2026` · JWT `main` / `group_ceo` | Portal XBOS + HRM embed |
| CEO CT thành viên | `du-lich.ceo@xe.vn` / `Xevn@2026` | Portal scope member |
| HRBP CT | `du-lich.hr@xe.vn` / `Xevn@2026` | HRM Recruitment / Payroll |
| NV ESS | `uat.nv####@xe.vn` / `xevn-uat-2026` | Mobile |
| QL trực tiếp | `uat.nv0001@xe.vn` (manager hat) | Mobile «Cần duyệt» / Phê duyệt · web Inbox |

**Mục tiêu:** Khóa case testable cho Hire-to-Pay · Leave ladder · Late/attendance ESS — QA điền U78 log theo case ID dưới đây; **không** coi W1-B kỹ thuật = UAT hệ sinh thái.

---

## 1. Bảng ngày → cấp duyệt (L1 / L2) — citation hoặc SPEC_GAP

### 1.1 Nguồn đã đọc (không đoán)

| # | Nguồn | Kết quả trích |
|---|--------|---------------|
| A | `SRS_NEW` **FR-UC-H03** | «Phê duyệt **hai cấp**»; phép năm 12 ngày; gửi trước ≥ **3 ngày lịch**; ốm giấy bác sĩ nếu ≥ **3 ngày**. **Không** ghi ngưỡng ngày cắt L1 vs L2. |
| B | `SRS_NEW` **FR-UC-B03** / BR-WF-01..04 | Happy: gửi → duyệt L1 → duyệt L2; chống tự duyệt BR-WF-04. **Không** map ngày nghỉ → cấp. |
| C | WF catalog `buildHrmLeaveApprovalWorkflowDefinition()` · `workflow-catalog.constants.ts` | WF key **`hrm_leave_approval`**: **1 bước** `manager_approval` · `resolver_type: direct_manager` · `fallback_role_code: hrbp`. `conditions` chỉ `businessType: hrm_leave` — **không** có rule `total_days`. |
| D | `LeaveWorkflowBridge` · `leave-workflow.bridge.ts` | Spawn `workflowCode: hrm_leave_approval`; resolve QL trực tiếp; callback terminal → `approved`/`rejected`. **Không** nhánh ngày / L2. |
| E | `leave-requests.service.ts` | Fail sâu ốm ≥3 ngày thiếu đính kèm → **`HRM-LEAVE-VAL-ATT`**. Không ladder L1/L2 theo ngày. |
| F | HDSD CH07 tuyển dụng · HDSD thử nghiệm §5.2–5.3 | Menu/nút nghỉ + duyệt QL; **không** nêu ngưỡng ngày → Giám đốc. |
| G | `ENTERPRISE_HRM_BUSINESS_ANALYSIS_REPORT` UC-B03 | SLA L1 24h / L2 48h — **không** phải ngưỡng số ngày nghỉ. |

### 1.2 Ma trận ngày → approver (testable)

| total_days (phép năm) | Approver kỳ vọng (TO-BE SRS) | Approver AS-IS (code/WF) | Citation | Trạng thái BA |
|-----------------------|------------------------------|--------------------------|----------|---------------|
| (mọi giá trị hợp lệ) | L1 QL trực tiếp **và** L2 theo ngưỡng (chưa khóa) | **Chỉ L1** `direct_manager` (`manager_approval`) → terminal APPROVED sau 1 bước | WF `hrm_leave_approval` · bridge spawn · FR-UC-H03 «hai cấp» (intent) | **SPEC_GAP** — xem §1.3 |
| — | L2 Giám đốc / cấp 2 khi vượt ngưỡng | **Không có bước L2** trong graph catalog | `workflow-catalog.constants.ts` `graph.steps.length === 1` | **SPEC_GAP** |
| ốm ≥ 3 ngày, không đính kèm | Từ chối submit | `HRM-LEAVE-VAL-ATT` | FR-UC-H03 · `assertSickAttachmentIfRequired` | **LOCKED** (validation, không phải ladder) |
| phép năm, gửi sát ngày (< 3 ngày lịch báo trước) | Từ chối submit (SRS) | Kiểm chứng runtime khi QA chạy — nếu BE chưa enforce → residual Dev | FR-UC-H03 «gửi trước ≥ 3 ngày lịch» | **PARTIAL cite SRS** — QA ghi actual |

### 1.3 SPEC_GAP — proposed BR cho SA (cấm QA 🟢 ladder L2 trước khi chốt)

| ID | Gap | Proposed BR | Đề xuất nội dung (chờ Sponsor/SA chốt — **không** dùng làm số PASS tạm) |
|----|-----|-------------|------------------------------------------------------------------------|
| **GAP-LEAVE-LADDER-01** | FR-UC-H03 / FR-UC-B03 mô tả hai cấp; WF `hrm_leave_approval` chỉ 1 bước `direct_manager`; **không** có ngưỡng ngày | **BR-LEAVE-LADDER-01** | **WAIVE_L2_PHASE1 (2026-08-06):** numeric cut **WAIVED_P1**; Phase-1 AC = L1-only. Option A configurable = backlog. Reopen = sponsor `N` hoặc config-from-FE — **cấm** invent `N`. |
| **GAP-LEAVE-LADDER-02** | HDSD §5.2–5.3 không mô tả khi nào đơn lên Giám đốc | **BR-LEAVE-LADDER-HDSD-01** | Phase-1: HDSD honesty «GĐ1 = QL trực tiếp»; **không** bảng ngày→cấp đến reopen |

**Residual program:** `R-PO-LEAVE-DAY-LADDER` = **WAIVED_P1** (process) — **không** CLOSE as IMPLEMENTED; reopen → `R-LEAVE-LADDER-GĐ15` / WF-01.

**QA rule (Phase-1 under WAIVE):**

- **LV-01** (mọi `total_days` AS-IS): expect L1 QL `direct_manager` · status `approved` sau duyệt L1 — **PASS được trên AS-IS** (U65).
- **LV-02** (L2 / vượt ngưỡng): verdict tối đa **⬜ / WAIVED_P1** — **cấm** 🟢; không invent số ngày.

---

## 2. Case catalog — E2E-SPINE-01 Hire-to-Pay (Web)

| Case ID | Persona | Channel | Click path (HDSD) | Network expect | FE sau 2xx | F5 | fail_deep |
|---------|---------|---------|-------------------|----------------|------------|----|-----------|
| **HP-01** | `ceo@xe.vn` | Web portal | CC → **Quy trình / Workflow canvas** → mở/lưu QT `hrm_recruitment_*` active → reload | PUT/POST WF def **2xx** · GET definitions còn code | Canvas/definition active; không banner lỗi | Definition còn | Thiếu bước/vai → từ chối BR-WF-01 |
| **HP-02** | `du-lich.hr@xe.vn` hoặc Group CEO | Web HRM embed | CC → HRM → **Tuyển dụng** → tab **Kế hoạch tuyển dụng** → **Tạo kế hoạch** → điền → **Gửi duyệt QT** (hoặc Yêu cầu tuyển → tạo → gửi) | POST plan/req **2xx** · spawn WF start **2xx** hoặc banner `SPAWN-MISSING` trung thực | Row trạng thái «Chờ duyệt QT» / pending | Row còn | Sai CT / scope **409** |
| **HP-03** | Approver L1/L2 (đúng hat QT) | Web portal | CC → **Hộp thư / Inbox** → task tuyển dụng → **Duyệt** (+ lý do nếu từ chối) | POST complete/approve **2xx** | Task rời inbox hoặc status completed; HRM plan sync | Đồng bộ status | Inbox **trống** → **🟡 BLOCKED** (U65 — **cấm** seed) · tự duyệt → chặn BR-WF-04 |
| **HP-04** | HRBP | Web HRM | Tuyển dụng → **Ứng viên** → roadmap / kéo **Đã tuyển** → **HireEmployeeLinkDialog** gắn NV | Hire/link **2xx** · `employee_id` có | Chip hired + link NV | Link còn | Unmapped stage fail-closed |
| **HP-05** | HRBP / Group CEO | Web HRM | **Nhân sự** → tìm NV mới → mở hồ sơ; **Hợp đồng** → HĐ active cùng CT | GET employee/contract **200** | Hồ sơ + HĐ hiển thị đúng CT | Còn | Member CEO **không** thấy ngoài CT |
| **HP-06** | HRBP / Group CEO | Web HRM | **Lương** → kỳ/payslip — thấy NV mới **hoặc** bước chạy đợt nếu UI cho phép (U65) | GET payslips/periods **200** | Row/phiếu hoặc empty hợp lệ có lý do | Persist | Kỳ khóa → từ chối sửa (FR-UC-H04) |

**spec_ref:** FR-UC-B03 · FR-UC-H01 · FR-UC-H04 · HDSD CH07 · J-REC-WF-01..04 · J-HRM-01/02/03/05/07 · UF-HRM-12 · UF-XBOS-08 · UF-HRM-01..03/06

---

## 3. Case catalog — E2E-SPINE-02 Leave ladder (Web + Mobile)

| Case ID | Persona submit | Channel | Điều kiện nghiệp vụ | Approver | Click path | Network expect | FE sau 2xx | F5 | fail_deep |
|---------|----------------|---------|---------------------|----------|------------|----------------|------------|----|-----------|
| **LV-01** | NV `uat.nv####` | Mobile | Phép năm · `total_days` ngắn (AS-IS: mọi đơn → L1) | QL trực tiếp | App → **Đơn nghỉ / Nghỉ phép của tôi** → tạo (loại, kỳ, lý do) → Gửi → QL: **Phê duyệt / Cần duyệt** → tab Nghỉ phép → **Duyệt** | POST leave **2xx** · spawn `hrm_leave_approval` (hoặc honest SPAWN-MISSING) · approve **2xx** (`HRM-LEAVE-*` / WF complete) | NV: «Chờ duyệt»→«Đã duyệt»; số dư giảm đúng ngày | List + balance đúng | Số dư thiếu → `HRM-LEAVE-VAL-BALANCE` |
| **LV-02** | NV | Mobile hoặc Web | Phép năm **vượt ngưỡng L1** / cần L2 | Giám đốc / cấp 2 | (không nghiệm thu Phase-1) | — | — | — | **WAIVED_P1** / ⬜ — PM `WAIVE_L2_PHASE1`; **cấm** 🟢 · **cấm** invent `N` |
| **LV-03** | NV | Web Attendance | Ốm ≥ 3 ngày **không** đính kèm | — | CC → HRM → **Chấm công** → **Nghỉ phép** → **Tạo yêu cầu nghỉ** · loại Ốm · ≥3 ngày · không file → Lưu/Gửi | POST **4xx** · code **`HRM-LEAVE-VAL-ATT`** | Toast/banner VI; **không** row approved | Không tạo đơn hợp lệ | — |
| **LV-04** | NV | Web | Ốm ≥ 3 ngày **có** đính kèm `/api/hrm/files/...` | Theo WF AS-IS = L1 QL | Như LV-03 + upload giấy → Gửi → Inbox/QL duyệt | POST **2xx** + approve **2xx** | Status approved; đính kèm mở được | Còn | File ngoài path files → VAL-ATT |
| **LV-05** | NV=QL cùng user | Any | Tự duyệt đơn mình | — | Submit rồi cùng user bấm Duyệt | **4xx** / chặn BR-WF-04 | Không APPROVED | — | Tự duyệt |
| **LV-06** | Approver sai CT | Any | Duyệt đơn công ty khác | — | Inbox/approve với scope lệch | **403/409** | Không đổi status đơn | — | SCOPE mismatch |

**spec_ref:** FR-UC-H03 · FR-UC-M03 · FR-UC-B03 · J-MOB-03/05/07/23..29 · J-HRM-06 · UF-HRM-05 · HDSD §5.2–5.3

---

## 4. Case catalog — E2E-SPINE-03 Late / attendance ESS

| Case ID | Persona | Channel | Click path | Network expect | FE sau 2xx | F5 | fail_deep |
|---------|---------|---------|------------|----------------|------------|----|-----------|
| **AT-01** | NV mobile → QL | Mobile | NV: **Điều chỉnh chấm công** / tạo update-request (loại đi muộn hoặc điều chỉnh giờ vào) + lý do + ngày → Gửi → QL: Home **«Cần duyệt (n)»** hoặc **Phê duyệt** → tab điều chỉnh → **Duyệt** | POST `/attendance/update-requests` **201** `HRM-ATT-REQ-201` → approve **203** `HRM-ATT-REQ-203` | NV pending→approved; QL badge giảm | Status còn | — |
| **AT-02** | NV | Mobile | Tạo đơn thiếu ngày **hoặc** thiếu lý do / sai ngày | **4xx** validation VI | Không tạo bản ghi; form báo lỗi | — | Không mutate |
| **AT-03** | NV / HCNS | Mobile + Web | Sau AT-01 approve → mở **Lịch sử chấm công** (mobile) và/hoặc web **Chấm công** bản ghi / Quản lý đơn | GET records/update-requests **200** | Thấy bản ghi hoặc trạng thái approved đúng kỳ | Còn | Epoch 01/01/1970 = FAIL |

**Ghi chú API:** ESS mobile ưu tiên `update-requests` (UC-HRM-MOB-06..08). Endpoint `late-early-requests` tồn tại trên BE — nếu UI không expose nút «Đi muộn» riêng, AT-01 dùng **điều chỉnh giờ vào / late** trên update-request; ghi rõ trên test-log.

**spec_ref:** UC-HRM-09 · UC-HRM-MOB-06..08 · J-MOB-02/05/07 · J-HRM-06 · UF-HRM-05 · HDSD §5.1/5.3

---

## 5. HDSD inventory (menu / màn / nút) theo spine

### SPINE-01 — Hire-to-Pay

| # | Menu / màn | Nút / control | SoT HDSD / UI |
|---|------------|---------------|---------------|
| 1 | Command Center → Quy trình (Workflow canvas) | Lưu / kích hoạt definition | J-REC-WF-01 · portal Workflow |
| 2 | CC → **Hộp thư** | **Duyệt** / **Từ chối** (+ lý do) | UF-XBOS-08 · J-REC-WF-03 |
| 3 | HRM → **Tuyển dụng** → tab **Kế hoạch tuyển dụng** | **Tạo kế hoạch** · **Lưu nháp** · **Gửi duyệt QT** · **Duyệt kế hoạch** | HDSD CH07 §11 |
| 4 | Tuyển dụng → **Yêu cầu tuyển dụng** | Tạo / duyệt theo WF | HDSD CH07 §3 |
| 5 | Tuyển dụng → **Ứng viên** / Kanban | Kéo **Đã tuyển** · **HireEmployeeLinkDialog** | HDSD CH07 §2/§13 |
| 6 | HRM → **Nhân sự** | Mở hồ sơ NV | UF-HRM-01/03 |
| 7 | HRM → **Hợp đồng** | Xem/tạo HĐ | UF-HRM-02 · J-HRM-03 |
| 8 | HRM → **Lương** | Kỳ / phiếu lương | UF-HRM-06 · J-HRM-07 · FR-UC-H04 |

### SPINE-02 — Leave

| # | Menu / màn | Nút / control | SoT |
|---|------------|---------------|-----|
| 1 | Mobile → **Đơn nghỉ** / **Nghỉ phép của tôi** | Tạo đơn · Gửi · xem chi tiết | HDSD §5.2 · J-MOB-03/23..29 |
| 2 | Mobile → **Phê duyệt** / Home **Cần duyệt** | Tab **Nghỉ phép** · **Duyệt** / **Từ chối** | HDSD §5.3 · J-MOB-05/07 |
| 3 | Web HRM → **Chấm công** → **Nghỉ phép** | **Tạo yêu cầu nghỉ** · đính kèm · Lưu/Gửi | UI Attendance leave · FR-UC-H03 |
| 4 | Portal → **Hộp thư** (nếu task WF leave) | Duyệt task `hrm_leave` | WF `hrm_leave_approval` · UF-XBOS-08 |
| 5 | (Gap HDSD) Bảng ngày → cấp duyệt | — | **BR-LEAVE-LADDER-HDSD-01** |

### SPINE-03 — Late / ESS

| # | Menu / màn | Nút / control | SoT |
|---|------------|---------------|-----|
| 1 | Mobile → **Chấm công** | Check-in (regress) | HDSD §5.1 · J-MOB-02 |
| 2 | Mobile → **Điều chỉnh chấm công** / Create update-request | Gửi yêu cầu | UC-HRM-MOB-06 · J-MOB path ESS |
| 3 | Mobile → **Phê duyệt** / **Cần duyệt** | Tab điều chỉnh · **Duyệt** | HDSD §5.3 · J-MOB-05/07 |
| 4 | Web HRM → **Chấm công** → bản ghi / **Quản lý đơn** | Xem status sau duyệt | UF-HRM-05 · J-HRM-06 |

---

## 6. Mapping case → J-* / UF-*

| Case ID | J-* | UF-* | SRS FR |
|---------|-----|------|--------|
| HP-01 | J-REC-WF-01 | UF-XBOS-08 (def path) | FR-UC-B03 |
| HP-02 | J-REC-WF-02 · J-HRM-05 | UF-HRM-12 | FR-UC-B03 |
| HP-03 | J-REC-WF-03 | UF-XBOS-08 | FR-UC-B03 |
| HP-04 | J-REC-WF-04 · J-HRM-05 | UF-HRM-12 | — |
| HP-05 | J-HRM-01/02/03 | UF-HRM-01/02/03 | FR-UC-H01 |
| HP-06 | J-HRM-07 | UF-HRM-06 | FR-UC-H04 |
| LV-01 | J-MOB-03/05/07/23..29 | UF-HRM-05 (web mirror) | FR-UC-H03 · FR-UC-M03 |
| LV-02 | (same) — **WAIVED_P1** / ⬜ | — | FR-UC-H03 intent · **BR-LEAVE-LADDER-01 WAIVED_P1** |
| LV-03 | J-HRM-06 | UF-HRM-05 | FR-UC-H03 |
| LV-04 | J-HRM-06 · J-MOB-05 | UF-HRM-05 | FR-UC-H03 |
| LV-05 | — | UF-XBOS-08 / leave approve | BR-WF-04 |
| LV-06 | — | — | BR-SCOPE / 409 |
| AT-01 | J-MOB-05/07 (+ J-MOB-02 regress) | UF-HRM-05 | UC-HRM-09 · MOB-06..08 |
| AT-02 | — | — | validation DTO |
| AT-03 | J-HRM-06 · J-MOB-02 | UF-HRM-05 | UC-HRM-09 |

---

## 7. Cột U78 QA phải điền (mỗi case)

Theo `docs/qa/WORLD_STANDARD_TEST_LOG.md` + OS 31:

`log_id` · `work_item_id` · `tester` · `started_at`/`ended_at` · env URL/port · `spec_ref` · `hdsd_align` · U65 flag · steps (`seq`, action HDSD, expected, actual, network, result, attachment) · case matrix A fail_deep / B success / C logic · incidents · summary · `ack_status`.

Artifacts bắt buộc:

- `docs/qa/evidence/po-e2e-spine-01-qa-w1.md` + `*-test-log.{md,json}`
- `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md` + test-log
- `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` + test-log (LV-03/04)

---

## 8. Business rules (locked vs gap)

| BR | Điều kiện | Hành động | Outcome | Status |
|----|-----------|-----------|---------|--------|
| BR-WF-04 | Assignee = submitter | Từ chối duyệt | Không đổi bước | LOCKED (FR-UC-B03) |
| BR-LEAVE-ATT-01 | ốm ≥ 3 ngày & thiếu attachment | Reject create | `HRM-LEAVE-VAL-ATT` | LOCKED (code+SRS) |
| BR-LEAVE-NOTICE-01 | phép năm & báo trước < 3 ngày lịch | Reject create | Theo FR-UC-H03 | SRS LOCKED · BE enforce = QA verify |
| BR-CD-F4-02 | Spawn leave WF | Assign `direct_manager` | Task QL | LOCKED AS-IS |
| BR-CD-F4-04 | Manager null | Escalate fallback role | hrbp / group path | LOCKED bridge |
| **BR-LEAVE-LADDER-01** | `total_days` vs `N` | Route L1-only vs L1+L2 | APPROVED đúng cấp | **WAIVED_P1** (numeric) · Option A khung = backlog |
| U65 | Inbox trống | Không seed | 🟡 BLOCKED | LOCKED sponsor |

---

## 9. Handoff

### completion_report

- Đã khóa ma trận case **HP-01..06**, **LV-01..06**, **AT-01..03** với persona, channel, click path, Network, FE sau 2xx, F5, fail_deep.
- Đã trích WF/HDSD/bridge/SRS: **không** có số ngày cắt L1/L2 → **WAIVE_L2_PHASE1** stamped (DOCS-01): BR numeric + LV-02 = **WAIVED_P1**; Option A khung = backlog (không invent `N`).
- AS-IS leave = **1 bước** `hrm_leave_approval` / `direct_manager` — LV-01 executable; LV-02 **WAIVED_P1**.
- HDSD inventory + mapping J-*/UF-* đủ cho Wave A1–A3; HDSD GĐ1 = QL trực tiếp.
- Residual: `R-PO-LEAVE-DAY-LADDER` = **WAIVED_P1**; `attendance_uat_ready=false`; không claim UAT DONE.

### next_owner

`qa` (A1 SPINE-01) + `qa-device` (A2 LV-01/AT-01) — song song; SA cho GAP ladder khi PM mở.

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-QA-W1
role: qa
priority: P0
lane: execution
program: docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md
entry_criteria: BA matrix docs/qa/evidence/po-e2e-ba-case-matrix-01.md; L0 qc:dev-stack; U65 zero-seed; U76 hdsd_align; U78 test_log_required
cases: HP-01 HP-02 HP-03 HP-04 HP-05 HP-06
persona: ceo@xe.vn / Xevn@2026 (group); du-lich.hr@xe.vn khi tạo plan CT; approver đúng hat QT
URL: portal local :5175 hoặc :8088 theo stack sống
click_path: theo §2 matrix — Workflow canvas → Tuyển dụng Gửi duyệt QT → Inbox Duyệt → Hire link → Employees/Contracts → Payroll
exit_criteria: mỗi HP-* có block evidence (Network 2xx, FE sau 2xx, F5); Inbox trống = 🟡 BLOCKED không seed; test-log md+json; PASS_TO_PM
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w1.md
test_log_md: docs/qa/evidence/po-e2e-spine-01-qa-w1-test-log.md
test_log_json: docs/qa/evidence/po-e2e-spine-01-qa-w1-test-log.json
cấm: seed inbox · invent ladder ngày · claim UAT DONE

--- parallel ---

work_item_id: PO-E2E-SPINE-02-03-MOB-QA-W1
role: qa-device
priority: P0
cases: LV-01 AT-01 AT-02 AT-03
persona: uat.nv#### submit; uat.nv0001@xe.vn approve (manager)
note: LV-02 = WAIVED_P1 / ⬜ — không 🟢; HOLD Dev ladder until reopen
evidence_path: docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md
test_log_required: true
U65: zero-seed; FE chain only

--- after BA residual SA (PM) ---

work_item_id: PO-E2E-LEAVE-LADDER-SA-01
role: sa
cases: GAP-LEAVE-LADDER-01
exit: chốt N ngày + WF graph 2 bước ref_srs FR-UC-H03; TechSpec/API delta; không code apps/** trước confirm Sponsor
```

### evidence_path

`docs/qa/evidence/po-e2e-ba-case-matrix-01.md`

### ack_status

**PASS_TO_PM**
