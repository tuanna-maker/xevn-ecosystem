# CUSTOMER_DEMO_HRM_DELTA — Phản hồi demo HRM (2026-06-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-02-BA-DELTA` |
| **program** | `P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-06-20 |
| **source** | Biên bản cuộc họp rà soát HRM (B-Minutes AI) — Người nói 2 (Quản lý), Hùng (BA) |
| **source_file** | `C:\Users\ADMIN\OneDrive\Desktop\B-Minutes AI - Trợ lý phòng họp thông minh.pdf` (Biên bản họp rà soát hệ thống HRM) |
| **sponsor_lock** | **2026-07-19** — Sponsor reaffirm: nhớ và **phải sửa theo yêu cầu khách** trong biên bản; không waive F3–F6 / F-DELIVERY |
| **downstream** | `CD-FB-06-ROLE-SWITCH`, `CD-FB-07-WF-DYNAMIC`, `CD-FB-08-CONTRACT`, `CD-FB-09-RECRUIT` |

---

## 1. Purpose

Khách hàng (sau demo HRM trên Command Center + app HRM) yêu cầu đóng khoảng trống giữa **SRS hiện tại** và **kỳ vọng vận hành thật** trước mốc:

| Mốc | Thời điểm | Ý nghĩa |
|-----|-----------|---------|
| **Pilot Connect** | **Tháng 8/2026** | 1 pháp nhân tối thiểu + danh mục điều hành; HRM embed/standalone dùng được cho HCNS pilot |
| **Vận hành production** | **Tháng 9/2026** | Luồng nghiệp vụ đã UAT: chuyển vai trò rõ ràng, workflow động, HĐ–lương tách bạch, tuyển dụng có dashboard |
| **Cadence governance** | Thứ 2 + Thứ 5 hàng tuần | PM báo tiến độ wave W0–W8 theo `P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md` |

**Mục tiêu tài liệu delta:**

1. Chuẩn hóa **5 chủ đề** từ biên bản (F3–F6 nghiệp vụ + mốc pilot) thành UC/BR/AC có thể kiểm thử.
2. Traceability về `docs/hrm/SRS.md`, ADR scope, XBOS workflow — **không** thay thế SRS gốc; bổ sung §16 (delta post-demo).
3. Cung cấp handoff copy-ready cho SA (F4 engine), Dev-BE/FE (F3/F5/F6), QA (L2 + L2.5 J-*).

**Benchmark (tham chiếu only — không scope bắt buộc):** Hệ thống **Luxury / Bay.vn** được khách nhắc như chuẩn **workflow automation** (resolver theo chức danh, cấp trên, song song, tự động hóa điều kiện). XeVN **không** sao chép UI hay data model Bay.vn; chỉ đối chiếu **mức độ linh hoạt** phê duyệt tương đương trên engine XBOS + HRM leave/attendance.

**Out of scope (delta này):**

- F7 Performance HRM → `CD-FB-03`..`05` (không mở rộng AC perf tại đây).
- F1/F2 template danh mục hạ tầng → `CD-FB-01` / `XBOS_Catalog_Import_Template_v2.xlsx`.
- Thay đổi `apps/**` — governance only.

---

## 2. As-is vs to-be (tóm tắt)

| ID | Chủ đề | As-is (demo 2026-06-20) | To-be (acceptance) |
|----|--------|-------------------------|---------------------|
| **F3** | Chuyển vai trò / công ty | Company switcher một phần embed; portal đổi tenant **chưa** luôn re-issue JWT (`ADR-HRM-RBAC` §5.1 Current); user lo lẫn dữ liệu đa vai trò | UI **luôn** hiển thị ngữ cảnh active (tenant + role + ĐVTV); đổi membership → JWT mới → refetch; không stale cross-tenant |
| **F4** | Workflow phê duyệt | XBOS engine gán `assigneeUserId` cứng (`GROUP_APPROVER_USER`); HRM leave approve trực tiếp API, không resolver động | 1 luồng pilot **nghỉ phép** resolve approver theo chức danh / cấp trên / parallel; inbox task đúng người |
| **F5** | Hợp đồng lao động | `employee_contracts.salary` đơn trường; thiếu lương thử việc, phụ cấp, lịch sử phiên bản; lương gắn chặt form HĐ | HĐ = thời hạn + loại + trạng thái; **compensation package** tách entity/tab; lịch sử thay đổi lương/phụ cấp |
| **F6** | Tuyển dụng | Requisition list embed; thiếu **job detail library** chuẩn hóa; dashboard trạng thái ứng viên chưa đủ funnel | Thư viện JD/mô tả công việc tái sử dụng; dashboard pipeline (new→hired) theo scope |
| **F-DELIVERY** | Pilot Connect | Chưa go-live Connect | T8 pilot READY theo exit program §6 |

---

## 3. Feature delta F3 — Chuyển đổi vai trò / công ty (P0)

### 3.1 Process objective & actors

| Actor | Persona pilot | Hành vi mong muốn |
|-------|---------------|-------------------|
| Group CEO | `ceo@xe.vn` | Kiêm nhiệm tập đoàn; lọc ĐVTV trên embed **không** đổi JWT `companyId`; thấy rõ đang xem «Tất cả» hay `trsport`… |
| Member CEO | `du-lich.ceo@xe.vn` | Chỉ 1 tenant; switcher ẩn hoặc 1 lựa chọn; không thấy dữ liệu tập đoàn |
| User đa membership | (target) cùng email ≥2 `tenantId` | Chọn membership → **JWT re-issue** trước khi load HRM/XBOS |
| QA | Matrix personas | L2.5 J-HRM-INT-05 + AC-INT-SW-* |

### 3.2 Use-case delta

| UC-ID | Tên | Mô tả | SRS target |
|-------|-----|-------|------------|
| **UC-HRM-SCOPE-04** | Chuyển membership portal (đa tenant) | User chọn membership khác trên portal → `POST /api/xbos/auth/select-membership` → token mới → reload scope | **Delta → SRS §16.1** |
| **UC-HRM-SCOPE-05** | Hiển thị ngữ cảnh vai trò active | Mọi màn HRM embed + standalone hiển thị chip: Tên ĐVTV · Vai trò · (optional) Mã NV | **Delta → SRS §16.1** |
| **UC-HRM-SCOPE-03** *(mở rộng)* | Company switcher embed | Bổ sung AC: sau đổi filter **refetch** tab hiện tại ≤2s; banner «Đang xem: {legalName}» | **SRS §15.2** (đã có — tighten AC) |

### 3.3 Activity flow (membership switch — happy / exception)

```mermaid
sequenceDiagram
  participant U as Người dùng
  participant UI as Portal / HRM
  participant Auth as xbos-api auth
  participant HRM as hrm-api

  U->>UI: Chọn membership (tenant B, role ceo)
  UI->>Auth: POST select-membership
  alt JWT re-issue OK
    Auth-->>UI: access_token mới (tenantId, companyId, roleCode)
    UI->>UI: Persist token + clear React Query cache HRM
    UI->>HRM: GET module với headers/query khớp JWT
    HRM-->>UI: 200 dataset tenant B
  else Membership không thuộc user
    Auth-->>UI: 403
    UI-->>U: Toast lỗi; giữ membership cũ
  else Token cũ vẫn dùng (lỗi FE)
    HRM-->>UI: 409 SCOPE_CONTEXT_MISMATCH
    UI-->>U: Banner đỏ + CTA «Đồng bộ phiên»
  end
```

### 3.4 Business rules matrix (F3)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| **BR-CD-F3-01** | User có `memberships.length > 1` | Hiển thị switcher membership trên portal header | Không auto-pick silent khi user đã từng chọn |
| **BR-CD-F3-02** | User chọn membership M | Gọi select-membership; cập nhật JWT | Mọi API sau đó `tenantId`/`companyId` khớp M |
| **BR-CD-F3-03** | Group CEO chọn slug S trên embed filter | Query `company_id=S`; JWT giữ `main` | BR-INT-03 (SRS §15.4) |
| **BR-CD-F3-04** | Đổi filter/switcher | Invalidate cache module đang mở | Không hiển thị rows tenant/ĐVTV cũ |
| **BR-CD-F3-05** | Member CEO | Switcher ẩn hoặc disabled 1 giá trị | AC-INT-SW-03 |
| **BR-CD-F3-06** | Mobile HRM | `POST /api/hrm/auth/mobile/select-membership` | Parity với ADR §5.1 mobile plane |

### 3.5 Acceptance criteria (F3)

| AC-ID | Tiêu chí | Pass khi | Fail khi | Evidence |
|-------|----------|----------|----------|----------|
| **AC-CD-F3-01** | Context chip visible | Mọi tab HRM embed có chip ĐVTV + role | Thiếu chip hoặc label UUID thô | Screenshot `:8088` P-CC-03..08 |
| **AC-CD-F3-02** | Company switcher refetch | Đổi `trsport` → list NV chỉ slug đó; Network ≥1 GET mới | Rows cũ còn sau 3s | QA network trace |
| **AC-CD-F3-03** | JWT stable on embed filter | Group CEO: JWT `companyId` vẫn `main` sau filter | JWT mutate | DevTools Application |
| **AC-CD-F3-04** | Membership switch (target) | select-membership → iframe HRM reload data tenant mới | 409 hoặc data tenant cũ | `P1-PROD-INT` persona matrix |
| **AC-CD-F3-05** | Journey L2.5 | **J-HRM-INT-05** PASS sau switcher | 404 scope parity | `PROGRAM_JOURNEY_MAP.md` |
| **AC-CD-F3-06** | Negative member | `du-lich.ceo@xe.vn` không rollup group | Thấy NV `holding` | API count + UI |

### 3.6 SRS traceability (F3)

| Artifact | Section |
|----------|---------|
| `docs/hrm/SRS.md` | §1.1 scope ladder · §15.1 UC-HRM-SCOPE-01..02 · §15.2 UC-HRM-SCOPE-03 · §15.4 BR-INT-01..05 |
| `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` | §3 scope ladder · §5 multi-membership · §5.3 switch rules |
| `docs/program/governance/p1-prod-int-ba-p-01-20260607.md` | UC-HRM-SCOPE-03 · AC-INT-SW-01..03 |
| `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | P-CC-03..08 scope rows |

---

## 4. Feature delta F4 — Workflow phê duyệt động (P0)

### 4.1 Process objective

Thay **gán cứng người duyệt** bằng **resolver runtime** trên XBOS workflow engine, consumer đầu tiên: **đơn nghỉ phép HRM** (UC-HRM-10). Khách kỳ vọng mức linh hoạt tương đương benchmark Bay.vn/Luxury (chức danh, cấp trên trực tiếp, song song, automation điều kiện).

### 4.2 Use-case delta

| UC-ID | Tên | Actor | Mô tả | SRS / XBOS target |
|-------|-----|-------|-------|-------------------|
| **UC-HRM-WF-01** | Gửi đơn nghỉ phép vào workflow | NV / HCNS | Tạo leave request → spawn XBOS instance theo `workflow_code` | **Delta → SRS §16.2** · maps UC-HRM-10 |
| **UC-HRM-WF-02** | Resolver người duyệt động | Engine | Mỗi bước resolve assignee theo `resolver_type` | **Delta → SRS §16.2** |
| **UC-HRM-WF-03** | Phê duyệt song song (parallel) | N approver | N task pending cùng step_key; complete khi policy `all` hoặc `any` | **Delta → SRS §16.2** |
| **UC-HRM-WF-04** | Từ chối / recall | Approver / submitter | Từ chối → notify submitter; không orphan instance | UC-HRM-10 fanout |
| **UC-XBOS-13** *(mở rộng)* | Định nghĩa QT | Admin | Step payload thêm `resolver_type`, `resolver_config` | `docs/xbos/BRD.md` §14.3 |
| **UC-XBOS-14** *(mở rộng)* | Thực thi QT — kiêm nhiệm | User đa vai | BR-XBOS-MULTI-HAT-01: duyệt từng vai, không gộp bước | `docs/xbos/BRD.md` §14.2 |

### 4.3 Resolver types (normative pilot)

| resolver_type | Input runtime | Resolve logic | Fallback |
|---------------|---------------|---------------|----------|
| `fixed_user` | `user_id` | Gán trực tiếp | 422 nếu user inactive |
| `position_template` | `position_code`, `company_id` | `position_assignment` active → user | Escalate BR-CD-F4-04 |
| `direct_manager` | `submitter.employee_id` | `employees.manager_id` → user | HRBP role nếu null |
| `role_code` | `role_code`, `tenant_id` | Membership row match | 422 |
| `parallel_group` | `resolver_types[]` | Tạo N `step_task` cùng step | Policy `all`/`any` |

### 4.4 Business rules matrix (F4)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| **BR-CD-F4-01** | Leave request created | Start workflow instance `hrm_leave_approval` (pilot) | Inbox task cho resolver step 1 |
| **BR-CD-F4-02** | `resolver_type=direct_manager` | BE đọc org graph same `company_id` slug | Assignee = manager user account |
| **BR-CD-F4-03** | `parallel_group` policy `all` | Mọi task complete mới advance | Không skip bước |
| **BR-CD-F4-04** | Resolver trả empty | Escalate `position_template` CHRO hoặc `group_ceo` | Task vẫn spawn; log `WF-ERR-RESOLVE-ESCALATE` |
| **BR-CD-F4-05** | Approver = submitter (cùng user) | Tự động skip hoặc chuyển cấp trên | Không self-approve |
| **BR-CD-F4-06** | Instance terminal `approved` | HRM `POST leave-requests/:id/approve` side-effect hoặc consumer callback | Leave status = approved; fanout UC-HRM-10 |
| **BR-CD-F4-07** | Cùng user nhiều vai (multi-hat) | Một inbox task / hat_key; duyệt từng vai | BR-XBOS-MULTI-HAT-01 |

### 4.5 Acceptance criteria (F4)

| AC-ID | Tiêu chí | Pass khi | Fail khi | Evidence |
|-------|----------|----------|----------|----------|
| **AC-CD-F4-01** | Pilot path leave | 1 đơn nghỉ phép FE → inbox manager đúng người (không `GROUP_APPROVER_USER` cứng) | Sai assignee | U65 browser UF-HRM leave |
| **AC-CD-F4-02** | Direct manager | NV báo cáo manager A → task chỉ A (và B nếu parallel config) | Manager C unrelated | DB `xbos_workflow_step_task` |
| **AC-CD-F4-03** | Position resolver | Step config `position_template=TRUONG_PHONG` → user đang giữ assignment | Hardcoded email | jest resolver spec |
| **AC-CD-F4-04** | Parallel all | 2 approver; 1 approve → vẫn pending | Advance sớm | Inbox UI + API |
| **AC-CD-F4-05** | Reject path | Từ chối → submitter notification; leave rejected | Silent fail | UC-HRM-10 fanout |
| **AC-CD-F4-06** | Canvas definition | Admin sửa workflow graph; resolver config persist payload | Mất config sau reload | UC-XBOS-13 FE |
| **AC-CD-F4-07** | Benchmark note | Resolver ≥3 loại (manager, position, parallel) demo được | Chỉ fixed_user | PM demo checklist T8 |

### 4.6 SRS traceability (F4)

| Artifact | Section |
|----------|---------|
| `docs/hrm/SRS.md` | §2 UC-HRM-10 · §4 UC-HRM-10 lifecycle · §13 embed notifications |
| `docs/hrm/BRD.md` | §1.1 pipeline thông báo · `workflow_code` metadata → XBOS |
| `docs/xbos/BRD.md` | §14.2 BR-XBOS-MULTI-HAT-01 · §14.3 UC-XBOS-13 |
| `docs/xbos/TECHSPEC.md` | §11 workflow schema · §12.3 graph persistence |
| `docs/xbos/COMMAND_CENTER_P0_SRS.md` | UC-CC-P0-06 inbox detail |
| `apps/api/xbos-api/src/workflow-engine/` | As-is `resolveHandlerInboxTarget` (hardcoded) — replace target |

---

## 5. Feature delta F5 — Hợp đồng lao động & tách lương (P1)

### 5.1 Process objective

Tách **thỏa thuận lao động** (thời hạn, loại HĐ, trạng thái) khỏi **gói đãi ngộ** (lương chính, lương thử việc, phụ cấp, hiệu lực). Hỗ trợ **lịch sử** thay đổi compensation không rewrite HĐ cũ.

### 5.2 Use-case delta

| UC-ID | Tên | Mô tả | SRS target |
|-------|-----|-------|------------|
| **UC-HRM-CI-08** | Gói đãi ngộ NV | CRUD compensation components gắn `employee_id` + hiệu lực | **Delta → SRS §16.3** |
| **UC-HRM-CI-09** | Lương thử việc | Giai đoạn `probation` có `probation_salary` % hoặc absolute | **Delta → SRS §16.3** |
| **UC-HRM-CI-10** | Phụ cấp theo HĐ/kỳ | Allowance lines: loại (DM §33), số tiền, taxable flag | **Delta → SRS §16.3** |
| **UC-HRM-CI-11** | Lịch sử thay đổi | Mỗi thay đổi tạo version mới; HĐ giữ `contract_id` | **Delta → SRS §16.3** |
| **UC-HRM-CI-01..05** *(mở rộng)* | HĐ lao động | `salary` field deprecated → link `compensation_package_id` | **SRS §13 UC-HRM-25** · HRM-CI catalog |

### 5.3 Data contract (delta)

| Entity | Trường chính | Validation |
|--------|--------------|------------|
| `employee_contracts` | `contract_type`, `start_date`, `end_date`, `status`, `compensation_package_id?` | BR-CD-F5-02: không bắt buộc `salary` |
| `employee_compensation_packages` | `employee_id`, `company_id`, `effective_from`, `effective_to?` | FK employee; scope slug |
| `employee_compensation_lines` | `package_id`, `line_type` (`base`/`probation`/`allowance`), `amount`, `allowance_code?`, `currency` | `line_type=probation` chỉ khi NV probation |
| `employee_compensation_history` | append-only audit | BR-CD-F5-05 |

### 5.4 Business rules matrix (F5)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| **BR-CD-F5-01** | Tạo HĐ mới | HĐ lưu thời hạn + loại; compensation optional tab | Form HĐ không bắt buộc nhập lương |
| **BR-CD-F5-02** | NV trạng thái `probation` | Package có line `probation` + `base` | Hiển thị cả hai trên UI |
| **BR-CD-F5-03** | Thêm phụ cấp | Line `allowance` + mã DM XBOS «Loại phụ cấp» | Đồng bộ catalog §33 `DANH_MUC_XBOS_CHO_HRM.md` |
| **BR-CD-F5-04** | Tăng lương | `effective_from` mới; package cũ `effective_to` | Payroll đọc package active tại kỳ |
| **BR-CD-F5-05** | Sửa compensation | Không UPDATE destructive; INSERT version | Lịch sử xem được trên tab «Lịch sử» |
| **BR-CD-F5-06** | UC-HRM-INT-02 | HĐ link `employee_id`; compensation cùng slug | BR-INT-04 parity |
| **BR-CD-F5-07** | UC-HRM-INT-03 | Payroll period lấy lines từ package active | Không đọc `contracts.salary` legacy |

### 5.5 Acceptance criteria (F5)

| AC-ID | Tiêu chí | Pass khi | Fail khi | Evidence |
|-------|----------|----------|----------|----------|
| **AC-CD-F5-01** | Tách form | Tab HĐ không có trường lương bắt buộc; tab «Đãi ngộ» riêng | Single salary field required | FE contract module |
| **AC-CD-F5-02** | Probation salary | NV probation: lương thử việc hiển thị + lưu API | Chỉ 1 salary | `POST` package lines |
| **AC-CD-F5-03** | Allowance lines | ≥2 loại phụ cấp khác mã DM | Flat single amount | UI + GET package |
| **AC-CD-F5-04** | History | Đổi lương 2 lần → 2 version; xem lịch sử | Overwrite row | DB + UI timeline |
| **AC-CD-F5-05** | Embed contracts | P-CC-04 list HĐ vẫn PASS; click NV → compensation tab | 409/500 | J-HRM-01, J-HRM-03 |
| **AC-CD-F5-06** | Payroll consumer | Kỳ lương sau đổi package phản ánh số mới | Stale salary | UC-HRM-INT-03 journey |
| **AC-CD-F5-07** | FE U65 | Tạo HĐ → thêm package → F5 persist | Seed/API cheat | Browser evidence |

### 5.6 SRS traceability (F5)

| Artifact | Section |
|----------|---------|
| `docs/hrm/SRS.md` | §13 UC-HRM-25 · §14 UC-HRM-28 (salary components) · §15.3 UC-HRM-INT-02/03 |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` | HRM-CI-01..07 |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | §4.2 contracts · FK `employee_contracts` |
| `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` | §21 Trạng thái lao động · §33 Loại phụ cấp |
| `apps/api/hrm-api/.../create-contract.dto.ts` | As-is: optional `salary` only — extend via new DTOs |

---

## 6. Feature delta F6 — Tuyển dụng: job library & dashboard (P1)

### 6.1 Process objective

Bổ sung **thư viện mô tả công việc (JD)** tái sử dụng cho requisition và **dashboard pipeline** trạng thái ứng viên (funnel + KPI), thay vì chỉ list requisition trên embed.

### 6.2 Use-case delta

| UC-ID | Tên | Mô tả | SRS target |
|-------|-----|-------|------------|
| **UC-HRM-RC-07** | Thư viện JD | CRUD job detail templates (title, mô tả, yêu cầu, position link) | **Delta → SRS §16.4** |
| **UC-HRM-RC-08** | Gắn JD vào requisition | Chọn template → copy vào `job_description` | maps UC-HRM-30 |
| **UC-HRM-RC-09** | Dashboard pipeline | Widget: count theo `candidate.status` + requisition open/filled | **Delta → SRS §16.4** |
| **UC-HRM-22** *(mở rộng)* | Embed tuyển dụng | Tab dashboard + list; BR-DQ-01 labels | **SRS §13 UC-HRM-22** |
| **UC-HRM-30** *(mở rộng)* | App tuyển dụng đầy đủ | JD library screen + kanban/list dashboard | **SRS §14 UC-HRM-30** |

### 6.3 Candidate status funnel (normative)

| status | Nhãn VI | Ý nghĩa |
|--------|---------|---------|
| `new` | Mới | CV mới nhập |
| `screening` | Sàng lọc | HR đang lọc |
| `interview` | Phỏng vấn | Có lịch PV |
| `offer` | Đề nghị | Đang offer |
| `hired` | Đã tuyển | Trigger UC-HRM-INT-01 |
| `rejected` | Từ chối | Đóng hồ sơ |

### 6.4 Business rules matrix (F6)

| Mã | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| **BR-CD-F6-01** | JD template tạo mới | `code` unique per `company_id` slug | 409 trùng mã |
| **BR-CD-F6-02** | Requisition chọn template | Snapshot `job_description` + `requirements` vào requisition | Sửa template không retroactive |
| **BR-CD-F6-03** | Dashboard aggregate | Chỉ đếm candidates scope resolver (BR-INT-01) | Không mock 1OFFICE (BR-DQ-01) |
| **BR-CD-F6-04** | Widget KPI | Headcount target từ `recruitment-plans` hoặc quota API | Không literal hardcode (VAL-DQ-06) |
| **BR-CD-F6-05** | Hire transition | `hired` → `employee_id` NOT NULL | UC-HRM-INT-01 |
| **BR-CD-F6-06** | Group CEO rollup | Dashboard tổng hợp mọi slug; filter ĐVTV giống F3 | BR-INT-03 |

### 6.5 Acceptance criteria (F6)

| AC-ID | Tiêu chí | Pass khi | Fail khi | Evidence |
|-------|----------|----------|----------|----------|
| **AC-CD-F6-01** | JD library CRUD | Tạo template → list → sửa → F5 còn | Không persist | FE standalone `/recruitment` |
| **AC-CD-F6-02** | Link requisition | Tạo requisition từ template; JD điền sẵn | Empty JD | U65 browser |
| **AC-CD-F6-03** | Dashboard funnel | Biểu đồ/trạng thái 6 cột; số = API aggregate | Hardcoded/mock org | P-CC-06 + BR-DQ-01 |
| **AC-CD-F6-04** | Scope | `ceo@xe.vn` rollup; filter `trsport` subset | 1OFFICE labels | `HRM_DASHBOARD_DATA_QUALITY_RULES.md` |
| **AC-CD-F6-05** | Journey | J-HRM-05 list→detail; hire → J-HRM-INT-01 | Broken deep link | L2.5 QA |
| **AC-CD-F6-06** | Cross-nav | Click ứng viên `interview` → lịch PV | 404 | UC-HRM-30 interviews API |

### 6.6 SRS traceability (F6)

| Artifact | Section |
|----------|---------|
| `docs/hrm/SRS.md` | §13 UC-HRM-22 · §14 UC-HRM-30 · §15.3 UC-HRM-INT-01 |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` | HRM-RC-01..06 |
| `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` | BR-DQ-01 · VAL-DQ-03/06 |
| `docs/program/governance/p1-hrm-dq-data-contract-20260607.md` | Recruitment dashboard widgets |
| `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | P-CC-06 · J-HRM-05 |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | As-is `job_description` on requisition |

---

## 7. Feature delta F-DELIVERY — Mốc pilot Connect (ngữ cảnh F1)

### 7.1 Acceptance (program-level — không thay F1 spec)

| AC-ID | Tiêu chí | Pass khi |
|-------|----------|----------|
| **AC-CD-DEL-01** | Template danh mục | F2 gửi khách + import PASS | `CD-FB-01` |
| **AC-CD-DEL-02** | Connect seed | 1 DN + danh mục tối thiểu | `CD-FB-10` · `qc:fe-be-health` |
| **AC-CD-DEL-03** | HRM pilot slice | F3 UAT + F4 demo leave + F5/F6 MVP UI | Program §6 exit |
| **AC-CD-DEL-04** | Governance cadence | Biên bản họp 2×/tuần có evidence wave | PM bus |

**SRS traceability:** `docs/program/P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md` §1 F1–F2 · §6 exit.

---

## 8. Consolidated traceability matrix

| Feature | Priority | New/extended UC | Business rules | Primary SRS anchor | Downstream work_item |
|---------|----------|-----------------|----------------|--------------------|----------------------|
| F3 | P0 | UC-HRM-SCOPE-04/05; extend 03 | BR-CD-F3-01..06 | SRS §15 · ADR scope §5 | CD-FB-06-ROLE-SWITCH |
| F4 | P0 | UC-HRM-WF-01..04; extend XBOS-13/14 | BR-CD-F4-01..07 | SRS §2 UC-HRM-10 · XBOS BRD §14 | CD-FB-07-WF-DYNAMIC |
| F5 | P1 | UC-HRM-CI-08..11 | BR-CD-F5-01..07 | SRS §13–15 · HRM-CI | CD-FB-08-CONTRACT |
| F6 | P1 | UC-HRM-RC-07..09 | BR-CD-F6-01..06 | SRS §13–14 · HRM-RC | CD-FB-09-RECRUIT |
| Delivery | P0 | AC-CD-DEL-* | — | Program doc | CD-FB-01/10 + PM |

**SRS merge instruction (SA/BA):** Promote §3–§6 deltas vào `docs/hrm/SRS.md` **§16 Post-demo customer delta (2026-06-20)** trong wave governance kế; không xóa §15 U39.

---

## 9. Handoff package

### 9.1 SA (`CD-FB-07` prep)

- ADR ngắn: workflow resolver contract (`resolver_type` enum, escalation, parallel policy).
- Boundary: XBOS engine owns inbox; HRM consumer callback on terminal state.
- Review BR-XBOS-MULTI-HAT-01 vs F4 parallel.

### 9.2 Dev-BE

| Item | Entry | Exit |
|------|-------|------|
| F3 | ADR §5.3 select-membership portal endpoint | JWT re-issue + 409 eliminated on tenant switch |
| F4 | `workflow-engine.service.ts` resolver plugin | jest resolver matrix; leave consumer |
| F5 | Migration compensation tables + APIs | `contracts-insurance` backward compat |
| F6 | `recruitment/job-templates` + aggregate dashboard API | jest + OpenAPI delta |

### 9.3 Dev-FE

| Item | Entry | Exit |
|------|-------|------|
| F3 | `HrmEmbedScopeBar` + portal membership switcher | AC-CD-F3-01..03 |
| F4 | Inbox leave approval UX wired to dynamic tasks | AC-CD-F4-01 |
| F5 | Contract tabs split + compensation history | AC-CD-F5-01..04 |
| F6 | JD library UI + recruitment dashboard widgets | AC-CD-F6-01..03 |

### 9.4 QA

- **U65 zero-seed** browser-only (sponsor lock).
- Personas: `ceo@xe.vn`, `du-lich.ceo@xe.vn`.
- L2: P-CC-04, P-CC-06; L2.5: J-HRM-01,03,05, J-HRM-INT-01,05.
- Update `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` when J-* extended for F3/F6.

---

## 10. Assumptions, dependencies, open risks

| # | Type | Mô tả | Owner | Trigger reopen |
|---|------|-------|-------|----------------|
| R-CD-01 | Dependency | F4 cần org graph `manager_id` / `position_assignment` seed đủ cho demo | dev-be | Resolver empty escalate |
| R-CD-02 | Assumption | Portal `select-membership` ship trong W1 (ADR Target) | dev-be/fe | 409 on tenant switch persists |
| R-CD-03 | Risk | F5 migration ảnh hưởng payroll đọc `contracts.salary` legacy | ba-data | Payroll regression FAIL |
| R-CD-04 | Risk | F6 dashboard tái phát mock 1OFFICE nếu aggregate FE | dev-fe | BR-DQ-01 FAIL |
| R-CD-05 | Clarification closed | Embed company filter ≠ JWT membership change (F3 vs U39) | — | Sponsor yêu cầu đổi JWT khi filter |

---

## 11. Completion contract

**completion_report:** Đã tạo delta governance `CUSTOMER_DEMO_HRM_DELTA_20260620.md` — 4 feature delta **F3–F6** (role switch, workflow động, HĐ tách lương, tuyển dụng dashboard + JD library) + mốc pilot **F-DELIVERY**. Mỗi feature có UC delta, BR matrix, AC đo được, traceability SRS/XBOS/ADR. Benchmark Luxury/Bay.vn chỉ §1 Purpose. **Residual:** merge SRS §16; SA ADR resolver F4; `ba-data` compensation model F5.

**next_owner:** pm

**next_dispatch_prompt:**

```text
work_item_id: CD-FB-07-WF-DYNAMIC (SA gate trước BE)
from_role: pm
to_role: sa
entry_criteria: docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md PASS_TO_PM — §4 F4 UC-HRM-WF-01..04, resolver types, BR-CD-F4-01..07
exit_criteria: ADR ngắn workflow-resolver-dynamic-20260620.md (resolver_type enum, parallel policy, HRM leave consumer boundary, escalation BR-CD-F4-04); PASS_TO_PM; không sửa apps/**
evidence_path: docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md
ack_status: PASS_TO_PM

Parallel sau SA:
work_item_id: CD-FB-06-ROLE-SWITCH
to_role: dev-fe
entry: delta §3 + ADR-HRM-RBAC-SCOPE-LADDER §5.3 + AC-CD-F3-01..06
exit: HrmEmbedScopeBar + portal select-membership UX; READY_FOR_QA; evidence docs/qa/evidence/cd-fb-06-role-switch-YYYYMMDD.md
```

**evidence_path:** `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md`

**ack_status:** **PASS_TO_PM**
