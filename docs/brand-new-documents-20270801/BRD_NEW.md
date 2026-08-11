# BRD-XEVN-NEW v1.0
## Business Requirements — Hệ sinh thái XeVN OS

---

## Lịch sử phiên bản

| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
|---|---|---|---|
| 1.0 | 2026-08-01 | Product Management — XeVN Ecosystem | Bản nháp ban đầu |

---

## Kiểm soát tài liệu (Document Control)

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD — Yêu cầu nghiệp vụ — Hệ sinh thái XeVN OS |
| Phiên bản | 1.0 |
| Trạng thái | Bản nháp (Draft) |
| Ngày hiệu lực | 2026-08-01 |
| Người tác giả | Product Management — XeVN Ecosystem |
| Phân loại | Bảo mật nội bộ (Internal Use Only) |
| Khách hàng | Tập đoàn XeVN |
| Nhà cung cấp giải pháp | Unicom Technology Solutions |
| Phê duyệt bởi | Ban điều hành XeVN Group |

---

## Tài liệu tham khảo

| Mã tài liệu | Tên tài liệu |
|---|---|
| SRS-XEVN-NEW v1 | Yêu cầu phần mềm tổng hợp |
| SRS-XEVN-HRM v1 | Yêu cầu phần mềm phân hệ Nhân sự |
| SRS-XEVN-XBOS v1 | Yêu cầu phần mềm phân hệ XBOS |
| TECH_SPEC_NEW.md | Đặc tả kỹ thuật kiến trúc |
| DB_DESIGN_NEW.md | Thiết kế cơ sở dữ liệu |
| API_CONTRACT_NEW.md | Hợp đồng API endpoint |

---

## Mục lục

1. Mục đích và Phạm vi tài liệu
2. Bối cảnh nghiệp vụ và Pain points
3. Phạm vi hệ thống và Ngoài phạm vi
4. Stakeholders và Ma trận Actor
5. Luồng nghiệp vụ chính
   5.1 Luồng Tenant Onboarding
   5.2 Luồng Employee Lifecycle
   5.3 Luồng Leave Approval
   5.4 Luồng Payroll Batch
   5.5 Luồng Recruitment Pipeline
6. Yêu cầu phi chức năng (NFR)
7. Mã lỗi nghiệp vụ
8. Truy xuất nguồn (Traceability)
9. Tiêu chí nghiệm thu (Acceptance Criteria)
10. Phụ lục A: Tài liệu liên quan chi tiết

---

## 1. Mục đích và Phạm vi tài liệu

### 1.1 Mục đích

Tài liệu này mô tả toàn bộ yêu cầu nghiệp vụ cấp chiến lược và tác nghiệp
cho hệ sinh thái **XeVN OS** — nền tảng phần mềm **đa công ty (multi-tenant)**
tập trung vào phân hệ Nhân sự (HRM), Lõi nghiệp vụ (XBOS), Cổng điều hành (Portal/CC)
và Khai thác vận tải (Logistics).

Tài liệu đóng vai trò **căn cứ pháp lý nội bộ** cho việc:
- Quyết định đầu tư và ưu tiên nguồn lực phát triển
- Phân chia rõ ràng "làm gì / không làm gì"
- Làm cơ sở kiểm thử nghiệm thu UAT
- Cung cấp audit trail đầy đủ cho Ban điều hành

### 1.2 Phạm vi tài liệu

| Nội dung | Bao gồm | Ghi chú |
|---|---|---|
| Bối cảnh nghiệp vụ | Có | Mô hình vận hành hiện tại |
| Pain points | Có | HR, Fleet, Finance |
| Phạm vi hệ thống theo giai đoạn | Có | Phase 1 & 2 phân chia rõ |
| Máy trạng thái nghiệp vụ | Có | 5 luồng chính |
| Yêu cầu phi chức năng | Có | Performance, Security, DR |
| Ma trận mã lỗi | Có | Business error codes |
| Tiêu chí nghiệm thu UAT | Có | Checklist PO chấm điểm |

### 1.3 Đối tượng độc giả

| Đối tượng | Mục đích sử dụng |
|---|---|
| Ban điều hành XeVN Group | Phê duyệt đầu tư, kiểm soát tiến độ |
| Team Product (PO/BA) | Cơ sở viết SRS, thiết kế DB, API |
| Team Kỹ thuật (BE/FE) | Hiểu nghiệp vụ, xác minh acceptance |
| Đội ngũ QA | Xây dựng test case chức năng & phi chức năng |
| Nhà cung cấp giải pháp | Hiểu rõ yêu cầu, đối chiếu đề xuất |
| Kiểm toán nội bộ | Đọc traceability, đánh giá tính đầy đủ |

---


## 2. Bối cảnh nghiệp vụ và Pain points

### 2.1 Mô hình vận hành hiện tại

Tập đoàn XeVN Group vận hành đa ngành, trọng điểm ba mảng:
- **Du lịch & Lữ hành** — Quản lý xe đưa đón khách theo tour, đoàn.
- **Vận tải & Logistics** — Tàu sắp xếp chuyến, xe khách, xe chở hàng, tài xế thuê/điều độ.
- **Dịch vụ & Cho thuê** — Cho thuê phương tiện, trạm/lượt.

Mỗi khu vực kinh doanh được tổ chức thành **pháp nhân (legal entity)** riêng,
có bộ kế toán, bộ nhân sự, bộ số liệu khác biệt.

### 2.2 Pain Points

| STT | Pain Point | Mô tả chi tiết | Mức độ | Nhóm bị ảnh hưởng |
|---|---|---|---|---|
| P-01 | **Data Silos** | HR dùng Excel, Fleet dùng Sheets, Payroll dùng phần mềm riêng. Báo cáo tổng hợp mất 3–5 ngày/tháng | Cao chí mạng | HR, Finance, Fleet |
| P-02 | **HR không chuẩn hóa** | Thang bậc, nghỉ phép, SLA phê duyệt khác nhau giữa các công ty; không có RACI | Cao | HR, Ban lãnh đạo |
| P-03 | **Đăng ký công ty mới chậm** | Setup mất 2–4 tuần: tên, chính sách, danh bạ, nhân sự khởi tạo | Trung bình | Super Admin, IT |
| P-04 | **Chấm công thủ công** | Ký sổ, bấm máy; HR mất vài ngày đối chiếu, nhập liệu | Trung bình | HR, Nhân viên |
| P-05 | **Bảng lương tính tay** | BHXH/BHYT/BHTN/PIT tính Excel, lỗi tay dễ xảy ra | Cao | Finance, HR |
| P-06 | **Tuyển dụng rời rạc** | Đơn gửi qua email, không có pipeline, offer nhầm lẫn | Trung bình | Recruiter, HR |
| P-07 | **Không có audit trail** | Không tra được ai sửa, không truy xuất nguồn cho kiểm toán | Cao | Ban lãnh đạo, IT |
| P-08 | **Rủi ro rò rỉ đa công ty** | Công ty A nhìn thấy dữ liệu B do DB không ngăn cách tenant-by-design | Cao chí mạng | Tất cả |

### 2.3 Bối cảnh kỹ thuật
- Hạ tầng: Cloud VPS, stages dùng chung port 3001 đã bị chiếm — cần tránh xung đột
- Database: phân tán, không single source of truth
- Auth: chưa có SSO, mỗi app tự login riêng
- Monitoring: log tập trung chưa có full APM

---

## 3. Phạm vi hệ thống và Ngoài phạm vi

### 3.1 Trong phạm vi (In Scope)

| Mã phân hệ | Tên đầy đủ | Giai đoạn | Ưu tiên | Mô tả |
|---|---|:---:|:---:|---|
| XBOS | X-Business Operating System | Phase 1 | P0 | Tenant CRUD, RBAC, Workflow, Catalog, Audit log, Org structure |
| HRM | Human Resource Management | Phase 1 | P0 | Employee, Attendance, Leave, Payroll, Recruitment, Reports |
| Portal/CC | Command Center | Phase 1 | P1 | SUPER_ADMIN dashboard, catalog management |
| Logistics | Vehicle/Driver/Trip Management | Phase 1 (Limited) | P1 | Vehicle, driver, trip, dispatch — giới hạn |
| Mobile | Ứng dụng Nhân viên | Phase 1 | P0 | Check-in GPS, leave submit, payslip view |

### 3.2 Ngoài phạm vi (Out of Scope)

- CRM, ERP nâng cao, AI/ML engine, Advanced BI, CMS
- Lý do: không phải lõi nghiệp vụ nội bộ, cần đánh giá kỹ sau

### 3.3 Giới hạn Phase 1
- Logistics: chỉ uỷ quyền API (tạo/xem xe, tài xế, chuyến), chưa điều độ thời gian thực
- HRM Reports: chỉ báo cáo mẫu cố định; báo cáo tùy chỉnh Phase 2
- Integration: chỉ nội bộ XBOS↔HRM↔Portal; chưa mở hệ thống bên thứ ba

---


### 3.4 Các tài liệu liên quan

| Mã tài liệu | Tên tài liệu | Mối liên hệ |
|------------|--------------|-------------|
| SRS-XEVN-NEW v1 | Tài liệu yêu cầu phần mềm | Chi tiết hóa yêu cầu nghiệp vụ thành chức năng kỹ thuật |
| BRD-XEVN-NEW v1 | Tài liệu yêu cầu nghiệp vụ | Tài liệu gốc định nghĩa bối cảnh và mục tiêu |
| TECH_SPEC | Tài liệu đặc tả kỹ thuật | Kiến trúc, hạ tầng, triển khai |
| DB_DESIGN | Tài liệu thiết kế cơ sở dữ liệu | Lược đồ chi tiết |
| API_CONTRACT | Tài liệu hợp đồng API | Định nghĩa endpoint |

---

## 2. BỐI CẢNH NGHIỆP VỤ

### 2.1 Tổng quan XeVN Group

XeVN Group là một tập đoàn đa ngành, quản lý nhiều công ty con (legal entities) hoạt động độc lập trong các lĩnh vực:

- Du lịch & lữ hành
- Vận tải & logistics
- Dịch vụ liên quan

Hiện tại mỗi công ty con tự quản lý với công cụ riêng, thiếu chuẩn hóa và khó tổng hợp dữ liệu.

### 2.2 Vấn đề nghiệp vụ & tác động

| Vấn đề | Tác động nghiệp vụ |
|---------|-------------------|
| Số liệu rời rạc | Báo cáo tổng hợp mất 3–5 ngày mỗi tháng |
| Thiếu chuẩn hóa | Quy trình khác nhau giữa các công ty |
| Onboarding chậm | 2–4 tuần mỗi công ty mới |
| Quản lý thủ công | Chấm công giấy, tính lương Excel, lỗi cao |
| Không có đa tenant | Tốn chi phí license, vận hành phân mảnh |
| Không có audit trail | Không truy xuất, không phục vụ kiểm toán |

---

## 3. MỤC TIÊU & PHẠM VI GIẢI PHÁP

### 3.1 Mục tiêu kinh doanh

1. Thay thế hoàn toàn hệ thống HR phân mảnh bằng nền tảng đa tenant thống nhất
2. Single source-of-truth cho tenant, tổ chức, nhân sự, lương bổng
3. RBAC-first với khả năng mở rộng event-driven
4- Khả năng kiểm toán (auditability) đạt chuẩn doanh nghiệp

### 3.2 Phạm vi hệ thống (Phase 1)

| Module | Tên đầy đủ | Phase | Độ ưu tiên |
|--------|------------|-------|------------|
| XBOS | X-Business Operating System (Core) | 1 | P0 — Bắt buộc |
| HRM Web | Web Portal Quản Trị Nhân Sự | 1 | P0 — Bắt buộc |
| HRM Mobile | Ứng dụng di động (React Native) | 1 | P0 — Bắt buộc |
| Portal/CC | Command Center — Quản trị Catalog | P1 — Quan trọng |
| Logistics | Quản lý xe, tài xế, chuyến | 1 (giới hạn) | P1

Ngoài phạm vi Phase 1:

---

## 4. CÁC BÊN LIÊN QUAN & MA TRẬN QUYỀN

### 4.1 Ma trận tác nhân

| Vai trò | Mô tả | Số lượng | Hệ thống tương tác | Quyền hạn chính |
|---------|-------|----------|-------------------|-----------------|
| SUPER_ADMIN | Quản trị viên nền tảng | 2–5 | Portal/CC | Tạo tenant, quản lý catalog toàn hệ thống |
| TENANT_ADMIN | Quản trị viên tenant | 1–3/tenant | Portal/CC, HRM | Cấu hình tenant, quản lý thành viên |
| HR_MANAGER | Quản lý nhân sự | 1–5/tenant | HRM | Quản lý NV, chấm công, báo cáo, tính lương |
| DEPT_MANAGER | Quản lý phòng ban | 3–20/tenant | HRM | Duyệt đơn, quản lý nhóm |
| EMPLOYEE | Nhân viên | 50–500/tenant | Mobile, HRM | Xem profile, chấm công, gửi đơn |
| FINANCE_STAFF | Nhân viên tài chính | 1–3/tenant | HRM | Xem xét, phê duyệt lương |
| RECRUITER | Nhân viên tuyển dụng | 1–5/tenant | HRM | Tạo yêu cầu TD, quản lý pipeline |
| Fleet Manager | Quản lý đội xe | 1–3/tenant | Logistics | Quản lý phương tiện, tài xế |
| Dispatcher | Phân công vận chuyển | 1–5/tenant | Logistics | Tạo chuyến, theo dõi tuyến |

---

## 5. LUỒNG NGHIỆP VỤ CHÍNH

### 5.1 Tenant Onboarding
### 5.2 Employee Lifecycle
### 5.3 Duyệt đơn nghỉ phép
### 5.4 Tính lương tháng
### 5.5 Tuyển dụng & onboarding

> Chi tiết từng luồng: xem SRS-XEVN-NEW v1 § Use Cases.

---

## 6. RÀNG BUỘC & GIẢ ĐỊNH

| Ràng buộc | Loại | Mô tả |
|-----------|-------|-------|
| Đa tenant row-level | Kỹ thuật | Mọi query phải lọc tenant_id qua DAL |
| Soft-delete only | Kỹ thuật | Không hard-delete entity nghiệp vụ |
| JWT RS256 | Bảo mật | Access token 2h, refresh 30d, rotating |
| Event-driven | Kiến trúc | Giao tiếp giữa module qua named events |
| Audit log bất biến | Tuân thủ | Append-only, không cho sửa/xóa |

---

## 7. YÊU CẦU PHI CHỨC NĂNG (NFR)

| Mã | Yêu cầu | Mục tiêu |
|----|---------|---------|
| NFR-01 | API latency P95 | < 300ms |
| NFR-02 | API latency P99 | < 800ms |
| NFR-03 | Batch payroll 500 NV | < 30 phút |
| NFR-04 | Mã hóa mật khẩu | bcrypt cost factor 12 |
| NFR-05 | Uptime | 99.5% |
| NFR-06 | DR — RTO | < 2 giờ |
| NFR-07 | DR — RPO | < 1 giờ |
| NFR-08 | Onboarding tenant | < 30 phút |

---

## 8. MÃ LỖI NGHIỆP VỤ

| Mã lỗi | HTTP | Mô tả |
|---------|-------|--------|
| TENANT_SLUG_EXISTS | 409 | Slug tenant đã tồn tại |
| TENANT_EMAIL_INVALID | 422 | Email admin không hợp lệ |
| CROSS_TENANT_ACCESS | 403 | Truy cập xuyên tenant bị chặn |
| WORKFLOW_ALREADY_APPROVED | 409 | Workflow đã lock, không duyệt lại |
| PAYROLL_ALREADY_LOCKED | 409 | Kỳ lương đã lock |
| EMPLOYEE_CODE_EXISTS | 409 | Mã NV trùng trong tenant |
| ATTENDANCE_LOCATION_OUT_OF_RANGE | 422 | GPS ngoài vùng geofence |
| LEAVE_BALANCE_INSUFFICIENT | 422 | Không đủ ngày phép |

---

## 9. TRACEABILITY

| Tài liệu | Mối liên hệ |
|----------|-------------|
| SRS-XEVN-NEW v1 | Chi tiết hóa yêu cầu nghiệp vụ thành chức năng kỹ thuật |
| TECH_SPEC_NEW.md | Kiến trúc kỹ thuật triển khai |
| DB_DESIGN_NEW.md | Schema dữ liệu hỗ trợ từng entity |
| API_CONTRACT_NEW.md | Endpoint triển khai từng yêu cầu |

---

## 10. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

- [ ] Tenant on-boarding < 30 phút end-to-end
- [ ] Cross-tenant access trả HTTP 403
- [ ] Workflow enforce two-level approval, không self-approval
- [ ] Audit log bất biến (append-only), queryable
- [ ] Payroll lock ngăn chỉnh sửa sau phê duyệt
- [ ] Employee code unique per tenant
- [ ] Leave balance chỉ trừ khi approved cuối cùng
- [ ] Catalog platform values không hard-delete
- [ ] API response dùng error envelope chuẩn
- [ ] Mobile hỗ trợ offline leave queue + sync-on-reconnect

---

*BRD-XEVN-NEW v1.0 — Chờ phê duyệt bởi Stakeholder trước khi chuyển sang SRS.*
