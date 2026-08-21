# BA-REC-SRS-SYNTHESIS-01

- **work_item_id**: `BA-REC-SRS-SYNTHESIS-01`
- **lane**: ba-process
- **date**: 2026-08-20
- **status**: DRAFT

## 1. Mục đích (Purpose)
Tài liệu tổng hợp đặc tả yêu cầu phần mềm (SRS) cho phân hệ Tuyển dụng (Recruitment) trong dự án XeVN Ecosystem. Tổng hợp lại luồng nghiệp vụ từ khâu Thiết lập danh mục (Catalog), Yêu cầu tuyển dụng (YCTD), cho đến Quản lý ứng viên (Candidate Pipeline) và thư mời (Offer).

## 2. Kiến trúc & Phân quyền (Architecture & Roles)
- **Module**: `recruitment` (HRM)
- **Role chính**: 
  - `HR_REC` (Chuyên viên Tuyển dụng) - Thực thi chính.
  - `HR_MGR` (Quản lý Nhân sự) - Người duyệt YCTD, Offer.
  - `DEPT_HEAD` (Trưởng bộ phận) - Người yêu cầu tuyển người.

## 3. Danh mục (Settings / Catalogs)
Các danh mục cấu hình phải hỗ trợ **Tenant & Company scoping** (không có cross-plane FK).
1. **Nguồn ứng viên (Candidate Sources)**: Nội bộ, Referral, LinkedIn, VietnamWorks, v.v.
2. **Kênh tuyển dụng (Recruitment Channels)**: Trực tiếp, Agency, Trường ĐH...
3. **Loại phỏng vấn (Interview Types)**: Phỏng vấn 1-1, Phỏng vấn nhóm, Test năng lực, Phỏng vấn văn hóa.
4. **Trạng thái vòng loại (Pipeline Stages)**: Sourcing, Screening, Interview 1, Interview 2, Offer, Hired, Rejected. (Hỗ trợ cấu hình luồng động - Dynamic Pipeline).

## 4. Quản lý Yêu cầu tuyển dụng (Job Requisition / YCTD)
- Mỗi YCTD kết nối với Master Data (Vị trí, Phòng ban, Khung lương từ `XBOS`).
- **Trạng thái (State Machine)**: `DRAFT` -> `PENDING_APPROVAL` -> `OPEN` -> `PAUSED` -> `CLOSED` -> `CANCELLED`.
- **Thông tin cốt lõi**:
  - Số lượng cần tuyển (Headcount).
  - Khung lương dự kiến.
  - Hạn chót tuyển dụng.
  - Mô tả công việc (Job Description - JD).
- **Rule**: Không cho phép xóa cứng (Hard-delete), chỉ chuyển trạng thái `CANCELLED` hoặc dùng `deleted_at`.

## 5. Quản lý Ứng viên (Candidate Pipeline)
- Ứng viên (Candidate) được liên kết vào 1 hoặc nhiều YCTD (Candidate_Job_Application).
- Kéo thả ứng viên (Kanban Board) giữa các Stage của Pipeline.
- **Tích hợp Email/Mail**: Gửi thư mời phỏng vấn, thư cảm ơn, thư từ chối tự động. Gắn kèm File/CV.

## 6. Đánh giá và Quyết định (Evaluation & Offer)
- Phỏng vấn viên nhập điểm và feedback trực tiếp vào hồ sơ ứng viên trên hệ thống.
- Yêu cầu tạo Offer: Trình duyệt lương (Tích hợp luồng duyệt nội bộ `Decisions`).
- Khi Ứng viên xác nhận Offer (Hired) -> Sinh profile nhân viên mới tại phân hệ `Profile / Onboarding`.

## 7. Các báo cáo (Reporting)
- Tỉ lệ chuyển đổi giữa các vòng (Conversion Rate).
- Thời gian tuyển dụng trung bình (Time to Hire).
- Chi phí tuyển dụng (Cost per Hire) dựa trên cấu hình nguồn và ngân sách.
