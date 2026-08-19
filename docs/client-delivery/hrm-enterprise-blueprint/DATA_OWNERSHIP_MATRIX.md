# Ma trận sở hữu dữ liệu — HRM Enterprise (4 trụ)

| Field | Value |
|-------|--------|
| **Doc ID** | DATA-OWN-HRM-4P |
| **work_item_id** | `PO-HRM-BP-DATA-OWNERSHIP-01` |
| **Status** | Draft governance — HOLD DB_DESIGN đến sau SRS confirm |
| **Date** | 2026-08-04 |
| **Program** | [`PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md`](../../program/customer-blueprint/PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md) §2–§3 |
| **PPT neo** | image2 (4 trụ) · image6 (C&B ring) · image10 (bảng công SoT) · image11–12 (payroll engine / split-month) |
| **Companion** | [`API_BOUNDARY_MAP.md`](./API_BOUNDARY_MAP.md) · [`ADR-HRM-4-PILLAR-API-BOUNDARY.md`](./ADR-HRM-4-PILLAR-API-BOUNDARY.md) |
| **Preserve** | Không đè `docs/hrm/SRS.md` · không Dev `apps/**` trong wave này |

> **Mục đích:** Khóa SoT từng entity — một writer hợp lệ, consumers rõ, cấm chồng dữ liệu giữa trụ. Feed wave **DB_DESIGN / API_DESIGN** sau khi khách confirm SRS.

---

## 0. Legend

### 0.1 Owning pillar (4 trụ)

| Code | Trụ | SoT module |
|------|-----|------------|
| **REC** | Quản lý Tuyển dụng | Định biên, tin, ứng viên, offer / hire handoff |
| **CORE** | Quản lý Nhân sự | Hồ sơ (public + C&B), HĐ, tài sản, khen thưởng / KL |
| **ATT** | Chấm công & Nghỉ phép | Ca, punch, phép, **bảng công chốt** |
| **PAY** | Tiền lương & Phúc lợi | Cấu trúc lương, BH/thuế CFG, phiếu lương |

### 0.2 Sensitivity

| Ring | Ý nghĩa (PPT image6) | Ai thấy |
|------|----------------------|---------|
| **Public** | Vòng ngoài — hành chính / dùng chung | Hồ sơ chung, bộ phận, QL trực tiếp (theo RBAC) |
| **C&B** | Vòng trong — khóa cao; **không** hiện trên Profile chung | Role C&B / Payroll; không lộ qua API public employee |

### 0.3 Write API convention

- Path dạng **logical** `/api/hrm/{pillar}/…` — khớp AS-IS Nest khi đã có; còn lại = **target** cho `API_DESIGN_HRM_ENTERPRISE.md`.
- `Write` = create / update / transition trạng thái / soft-delete của **SoT row**.
- Consumer chỉ **GET** (hoặc nhận event) — không PATCH SoT của trụ khác.

---

## 1. Domain map (entity · quan hệ · lifecycle)

```text
headcount_plan (REC)
    └─► candidate (REC) ──hire──► employee_* (CORE)
                                      ├─► contract (CORE) ──baseline──► PAY read
                                      ├─► asset (CORE)
                                      ├─► leave_balance (ATT) ← activate
                                      └─► attendance_raw + shift_rule (ATT)
                                              └─► timesheet_closed (ATT) ──only──► payslip (PAY)
                                                                                    ▲
insurance_rate (PAY CFG) ──────────────────────────────────────────────────────────┘
employee C&B (CORE) ──salary/dependents──► PAY formula vars
```

| Entity | Lifecycle (happy) | Invalid transition (fail-closed) |
|--------|-------------------|----------------------------------|
| `headcount_plan` | draft → submitted → approved / rejected → (fulfilled) | mutate sau `approved` trừ revise có UC |
| `candidate` | pool → screening → interview → offer → hired / rejected | `hired` không rollback im lặng; không tạo payslip |
| `employee public` | onboard → active → terminated | active trước hire link = cấm |
| `employee C&B` | versioned effective-date segments | ghi đè history kỳ đã trả lương |
| `contract` | draft → active → amended → ended | 2 HĐ active chồng kỳ (trừ BR split-month) |
| `asset` | allocated → returned / lost | allocate khi NV terminated |
| `attendance_raw` | punched → (optional) corrected via update-request | sửa punch kỳ đã `timesheet_closed` |
| `shift_rule` | draft → active → retired | xóa cứng nếu đã có punch tham chiếu |
| `leave_balance` | enroll → accrue → consume → adjust | âm số dư khi BR cấm; ATT-only write |
| `timesheet_closed` | open → submitted → **closed** (immutable) | reopen không UC; PAY không ghi |
| `payslip` | calculated → confirmed → paid | tính khi sheet ≠ closed; khấu trừ kép split-month |
| `insurance_rate` | CFG version effective | PAY run dùng rate chưa hiệu lực |

---

## 2. Data ownership matrix (SoT)

| Entity | Owning pillar | Write API (logical / AS-IS) | Read consumers | Forbidden writers | Sensitivity | Notes |
|--------|---------------|----------------------------|----------------|-------------------|-------------|-------|
| **headcount_plan** | **REC** | `POST/PATCH /api/hrm/recruitment/headcount-proposals` · status `PATCH …/:id/status` · plans `…/recruitment-plans` | REC UI · CORE (read định biên khi mở HĐ/vị trí) · báo cáo REC | CORE · ATT · PAY · XBOS catalog publish (không ghi plan HRM) | Public | SoT nhu cầu nhân sự; không nhân bản sang employee/payslip. Duyệt cuối = câu hỏi quản trị program §6. |
| **candidate** | **REC** | `POST/PATCH/DELETE …/recruitment/candidates[-pool]` · stage · interviews · applications | REC UI · CORE **read-only** audit/link sau hire (`candidate_id`) | CORE (mutate stage) · ATT · **PAY** · tạo employee ngoài hire UC | Public (+ PII CV) | Hire → soft-link `employee_id` do **CORE** tạo; REC **không** gọi PAY. OCR CV = optional đến khi khách chốt. |
| **employee public** | **CORE** | `POST/PATCH /api/hrm/employees` · degrees/training public fields | CORE UI · ATT (resolve NV/manager) · REC (sau hire, display) · portal directory | REC (sau khi đã có `employee_id`) · ATT · PAY · ghi field C&B vào endpoint public | **Public** | Họ tên, SĐT, email nội bộ, bộ phận, chức vụ, **gia đình (tuổi con → quà 1/6)**. Profile chung **cấm** bind lương/MST/STK/BHXH. |
| **employee C&B** | **CORE** | `POST/PATCH …/contracts-insurance/compensation-packages` · revise · compensation-history · (target) employee C&B sub-resource | **PAY** (formula vars: base, phụ cấp, GTCG) · C&B UI | REC · ATT · endpoint employees public · role không C&B | **C&B** | Lương CB, phụ cấp, MST, ngân hàng, số BHXH. Version theo ngày hiệu lực — feed split-month (image12). |
| **contract** | **CORE** | `POST/PATCH/DELETE …/contracts-insurance/contracts` | CORE UI · PAY (active contract / phụ lục lương) · ATT (eligibility nghỉ chế độ nếu BR) | REC · ATT · PAY (không tự sinh HĐ từ payslip) | Public metadata · **C&B** các điều khoản lương | Mẫu HĐ + phụ lục đổi lương thuộc CORE; PAY chỉ đọc baseline. |
| **asset** | **CORE** | `POST/PATCH/DELETE …/employees/:id/assets` | CORE UI · offboard checklist · (optional) báo cáo | REC · ATT · PAY | Public (trong CT) | Cấp phát / thu hồi khi nghỉ (image7). Không gắn payroll trừ BR khấu trừ tài sản riêng (khi có — PAY đọc **event/CORE**, không sở hữu asset). |
| **attendance_raw** | **ATT** | `POST/PATCH …/attendance/records` · update-requests approve/reject · clock GPS/manual | ATT UI · Mobile ESS · **không** PAY | CORE · REC · **PAY** · sửa sau `timesheet_closed` | Public (trong CT) | Punch / giải trình. Hệ số OT **chưa** phải là SoT lương — chỉ sau khi vào dòng bảng công. |
| **shift_rule** | **ATT** | `POST/PATCH/DELETE …/attendance/work-shifts` · `PATCH …/attendance/rules` · work-sites | ATT UI · Mobile (rule chấm) · CORE read display ca | REC · PAY · CORE mutate · XBOS catalog = SoT **khung loại ca** (pull); instance phân ca = ATT | Public | Ca + rule làm tròn/phạt muộn (image8). Catalog nhóm từ XBOS; phân ca bộ phận = ATT write. |
| **leave_balance** | **ATT** | Accrual/adjust nội bộ ATT · leave-requests approve (consume) · enroll sau `employee.activated` | ATT UI · ESS · CORE **read** (display quỹ) | CORE mutate số dư · REC · **PAY** · seed để pass QA | Public (số ngày) · lý do ốm có thể PII | Quỹ phép / OT bù / chế độ BH (image9). PAY **cấm** `GET leave-requests` để trừ công. |
| **timesheet_closed** | **ATT** | `POST/PATCH …/attendance/attendance-sheets` · transition → `closed` (+ close job tổng hợp) | **PAY** (bắt buộc) · ATT UI · HR ký chốt | **PAY** · REC · CORE · reopen im lặng · ghi đè dòng sau chốt | Public (giờ công) trong CT | **SoT độc nhất tính lương** (image10). Dòng: giờ chuẩn + OT đã hệ số + phép có lương − không lương/muộn. Unit: **giờ công tính lương**. |
| **payslip** | **PAY** | `POST …/payroll/periods/:id/process` · close · payment-batches · (target) confirm/send | PAY UI · ESS phiếu lương (NV chỉ phiếu mình) · báo cáo đối soát | REC · ATT · CORE · sửa tay vượt engine không UC · tính từ OT/Leave API | **C&B** | Engine kéo-thả (image11). Split-month: cộng dồn giờ/gross; thuế·GTCG·trần BH **một lần** (image12). |
| **insurance_rate** | **PAY** | `POST/PATCH …/contracts-insurance/insurance-policies` · (target) rate tables / mức đóng % | PAY run · C&B UI · (read) tăng/giảm BH | CORE ghi % vào employee public · REC · ATT · hardcode % trong code | **C&B** | Mức đóng NV/CTTY (image6/11). Participant gắn NV có thể đọc từ CORE id; **rate SoT = PAY CFG**. |

---

## 3. Validation matrix (điều kiện → hành vi)

| ID | Entity | Condition | Rule | Expected result |
|----|--------|-----------|------|-----------------|
| V-01 | headcount_plan | Duyệt khi thiếu vị trí/OU | Bắt buộc position + company scope | `4xx` validation; không tạo tin |
| V-02 | candidate | `stage=hired` mà chưa có CORE employee | Hire UC phải tạo/link CORE trước khi đóng pipeline | Fail hoặc saga bù; **không** tạo payslip |
| V-03 | employee public | PATCH chứa lương / MST / STK | Field thuộc C&B ring | Reject `HRM-CORE-CB-403` (proposed) |
| V-04 | employee C&B | Role ≠ C&B đọc compensation | RBAC ring | `403` · không lộ payload |
| V-05 | contract | 2 HĐ `active` chồng ngày (không split BR) | Uniqueness kỳ | `409` conflict |
| V-06 | asset | Allocate khi `employee.status=terminated` | Offboard lock | `409` / business reject |
| V-07 | attendance_raw | PATCH punch thuộc sheet `closed` | Immutability sau chốt | `409 HRM-ATT-SHEET-LOCKED` (proposed) |
| V-08 | shift_rule | Hard-delete ca đã có punch | Soft-retire only | `409` |
| V-09 | leave_balance | Approve phép vượt quỹ (BR cấm âm) | Balance check | `409` / leave business code |
| V-10 | timesheet_closed | PAY process khi sheet `open`/`draft` | PAY←closed only | `412 HRM-PAY-ATT-412` (xem API map) |
| V-11 | timesheet_closed | PAY gọi `leave-requests` / `overtime-requests` trong calculate | Boundary I-3 | Deny gateway / module fence |
| V-12 | payslip | Split-month 2 đoạn | GTCG + trần BH + TNCN **một lần** / kỳ | Net đúng; không double deduct |
| V-13 | insurance_rate | Run dùng rate `effective_to < period` | Version pick | Fail hoặc dùng version đúng kỳ — không silent 0% |
| V-14 | Mọi entity | `company_id` list ≠ get-by-id semantics | **scope_parity** | Cùng resolver; cấm list 200 + detail 404 dưới `main` |

---

## 4. Forbidden overlap (không chồng data)

| Anti-pattern | Vì sao sai | Correct SoT |
|--------------|------------|-------------|
| PAY đọc OT/Leave API để nhân hệ số / trừ phép | PPT image10 — phá nút thắt chốt công | Chỉ `timesheet_closed` lines |
| REC tạo salary structure / payslip khi hired | PPT slide 14 · ADR I-2 | CORE compensation → ATT kỳ → PAY |
| Employee public API trả lương / BHXH / STK | PPT image6 | Tách resource C&B + role |
| CORE ghi quỹ phép / punch | Sai trụ | ATT owns leave_balance & attendance_raw |
| ATT ghi payslip / insurance % | Sai trụ | PAY |
| Hai bảng «công tính lương» (ATT sheet + PAY shadow hours) | Dual SoT | PAY **không** materialize lại giờ từ raw |
| FE join candidates + payroll components rồi POST | Option C ADR | Gateway + module fence |
| Catalog XBOS bị HRM overwrite làm SoT nhóm | Program catalog rule | XBOS publish/pull; ATT/CORE chỉ instance |

---

## 5. Event handoff (ownership không chuyển SoT)

| Event | Emitter | Consumer | Consumer được làm | Consumer **không** được |
|-------|---------|----------|-------------------|-------------------------|
| `offer.accepted` | REC | CORE | Mở hồ sơ / onboard | Tạo payslip |
| `employee.activated` | CORE | ATT · PAY (CFG subject) | Enroll phép/ca; đăng ký subject lương | ATT ghi C&B |
| `timesheet.closed` | ATT | PAY | Kéo sheet closed + chạy engine | Gọi Leave/OT; ghi đè sheet |
| `termination.started` | CORE | ATT · PAY | Dừng phát sinh; tất toán theo BR | Xóa history công/lương |

Payload sự kiện **không** thay thế SoT (không nhồi full giờ công vào event — PAY kéo API whitelist).

---

## 6. Traceability (artifact → API → DB → FE → test)

| Entity | Spec neo | Write surface | DB (logical table — DB_DESIGN sau) | FE consumer | Test / AC ý tưởng |
|--------|----------|---------------|-------------------------------------|-------------|-------------------|
| headcount_plan | Program §2.1 · UC định biên | recruitment headcount/plans | `headcount_proposals` / plans | REC Headcount tab | Duyệt→tin; scope CT |
| candidate | §2.1 · image5 | recruitment candidates | `candidates` / pool | REC pipeline | Hire→employee link; **no PAY** |
| employee public | §2.2 · image6 outer | employees | `employees` (+ family) | Hồ sơ chung | Quà 1/6 theo tuổi con; không lộ C&B |
| employee C&B | §2.2 · image6 inner · image11 | compensation-packages | compensation / C&B extension | C&B only screens | 403 non-C&B |
| contract | §2.2 | contracts-insurance/contracts | `employee_contracts` | HĐ UI | Phụ lục đổi lương → event PAY |
| asset | §2.2 · image7 | employees/:id/assets | employee_assets | Tài sản UI | Thu hồi khi offboard |
| attendance_raw | §2.3 · image8 | attendance/records | attendance_records | Chấm công / Mobile | U65 FE clock; không seed |
| shift_rule | §2.3 | work-shifts · rules · work-sites | shifts / rules / sites | ATT settings | XBOS catalog ≠ instance |
| leave_balance | §2.3 · image9 | leave-balance · leave-requests | `employee_leave_balances` | Phép UI | Âm quỹ FD |
| timesheet_closed | §2.3 · image10 | attendance-sheets → closed | attendance_sheets + lines | Bảng công · PAY | PAY open sheet → 412 |
| payslip | §2.4 · image11–12 | payroll periods/process | `payroll_payslips` | Phiếu lương | Split-month no double tax |
| insurance_rate | §2.4 · image6/11 | insurance-policies / rate CFG | insurance policy / rate version | C&B BH | Version theo kỳ |

**J-* / UF:** gắn khi SRS enterprise khóa FR — tối thiểu journey: hire (REC→CORE) · chốt công (ATT) · chạy lương (PAY←closed) · profile public vs C&B.

---

## 7. Error envelope (deterministic — proposed)

| Code | When | HTTP | Client action |
|------|------|------|---------------|
| `HRM-CORE-CB-403` | Đọc/ghi C&B thiếu role | 403 | Ẩn field; không retry |
| `HRM-ATT-SHEET-LOCKED` | Sửa punch/leave ảnh hưởng sheet closed | 409 | Mở kỳ điều chỉnh có UC |
| `HRM-PAY-ATT-412` | Payroll khi sheet ≠ closed | 412 | Chờ HR chốt công |
| `HRM-PAY-BOUNDARY-403` | PAY gọi Leave/OT trong calculate | 403 | Fix integration |
| `HRM-REC-PAY-403` | REC gọi PAY write | 403 | Dùng hire→CORE |
| `HRM-SCOPE-409` | companyId ≠ token / dual-plane | 409 | Sửa header/membership |

Envelope giữ chuẩn platform: `{ code, message, details? }` — chi tiết DTO khóa ở API_DESIGN.

---

## 8. Data quality risks & mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dual SoT giờ công (sheet + PAY shadow) | Lương lệch OT/phép | CI boundary + V-10/V-11; DB_DESIGN cấm bảng shadow |
| C&B leak qua employee list DTO | Tuân thủ / tin cậy | Tách serializer Public vs C&B; QA persona non-C&B |
| scope_parity list≠detail | CEO tập đoàn 404 | Cùng `resolveHrmListScope` |
| Split-month double GTCG/BH | Sai net, khiếu nại | BR image12 trong engine tests |
| Catalog XBOS vs ATT shift instance nhầm SoT | Mất chuẩn tập đoàn | Ownership row shift_rule Notes |
| AS-IS monolith import chéo | Vi phạm ADR Option A | Module fence + map §4 |

---

## 9. Feed DB_DESIGN (checklist sau SRS confirm)

1. Mỗi hàng §2 → **một** bảng (hoặc extension C&B rõ ràng) + `company_id` + soft-delete.
2. `timesheet_closed` lines: cột đơn vị **giờ công tính lương**; immutable flag khi `status=closed`.
3. `employee` tách cột/JSON **ring** hoặc bảng `employee_compensation` — RLS/role C&B.
4. FK: `payslip.timesheet_sheet_id` **bắt buộc** (hoặc equivalent) khi process từ công.
5. **Không** FK `payslip` → `leave_requests` / `overtime_requests` / `candidates`.
6. `insurance_rate` versioned (`effective_from`/`to`); participant ≠ rate master.
7. Index search: employee public vs cấm index lộ C&B trên replica reporting không kiểm soát.

---

## 10. Exit

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **completion_report** | Đã khóa ma trận sở hữu 12 entity bắt buộc + validation/error/trace/risk; neo PPT image6/10/11/12 + program §2–3; khớp API_BOUNDARY (PAY←closed only, REC↛PAY, C&B ring). |
| **residual** | Logical Write API chờ `API_DESIGN` sau SRS confirm; mã lỗi proposed chưa gắn OpenAPI AS-IS; J-*/UF ids gắn khi FR enterprise khóa. |
| **next_owner** | `pm` → sau Sponsor CONFIRM SRS: `ba-data` + `sa` wave DB_DESIGN / API_DESIGN |
| **evidence_path** | `docs/client-delivery/hrm-enterprise-blueprint/DATA_OWNERSHIP_MATRIX.md` |
