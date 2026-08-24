# Tài liệu Yêu cầu Phần mềm — Hệ sinh thái XeVN OS
Dựa trên: BRD-XEVN-NEW v1 | Ngày: 2026-08-01

## 1. Công nghệ sử dụng
Node.js, Express, TypeScript, React, React Native, Postgres 16, Redis.

## 2. Mô hình tenant
Mọi bảng đều có cột tenant_id. JWT chứa tenantId, membershipId, roles[]. Không bao giờ xóa giá trị do nền tảng sở hữu khi mở rộng catalog theo tenant.

## 3. Yêu cầu XBOS
- Vòng đời tenant với tính năng cấp phát tự động tài khoản admin (adminEmail, adminPassword) từ Command Center, và xóa mềm (soft delete)
- RBAC: SUPER_ADMIN, TENANT_ADMIN, HR_MANAGER, DEPT_MANAGER, FINANCE_STAFF, RECRUITER, EMPLOYEE
- Phạm vi tài nguyên: phòng ban và kỳ lương
- Máy trạng thái workflow với phê duyệt hai cấp, chống tự phê duyệt, SLA 24h và 48h, leo thang, nhắc nhở
- Kế thừa catalog và hợp đồng sự kiện hủy bỏ
- Audit log chỉ ghi thêm (append-only) với thời gian lưu và API truy vấn

## 4. Yêu cầu HRM
- CRUD hồ sơ nhân viên với kiểm tra: CCCD duy nhất, tuổi 15-70, mức lương tối thiểu theo khu vực
- Chấm công với geofence GPS 200m, tự checkout sau 10h, chặn GPS giả mạo
- Nghỉ phép với 5 loại, giới hạn số dư; phê duyệt giai đoạn 1 = quản lý trực tiếp (một cấp). Thang duyệt thêm cấp theo số ngày nghỉ thuộc giai đoạn sau — chưa nghiệm thu giai đoạn 1; không khóa cứng số ngày cắt cấp trong bản này
- Công thức tính bảng lương theo đợt với vấn đề và khóa
- Cố định pipeline trạng thái tuyển dụng
- Placeholder báo cáo HR

## 5. Yêu cầu Mobile
- Đăng nhập đa tenant với lựa chọn membership
- Mở khóa sinh trắc học sau lần đăng nhập đầu tiên thành công
- Check-in GPS với fallback thủ công
- Tạo đơn nghỉ phép và phê duyệt của quản lý
- Xem phiếu lương và tải PDF
- Thông báo đẩy và hàng đợi cache offline

## 6. Yêu cầu phi chức năng (NFRs)
P95 < 300ms, P99 < 800ms. Xử lý bảng lương 500 nhân viên dưới 30 phút. HTTPS bắt buộc. bcrypt cost 12. Thời gian hoạt động 99.5%, RTO dưới 2h, RPO dưới 1h.

## 7. Hợp đồng tích hợp
Sự kiện: EMPLOYEE_CREATED, EMPLOYEE_UPDATED, WORKFLOW_APPROVED, WORKFLOW_REJECTED, PAYROLL_LOCKED, CATALOG_UPDATED, TENANT_SUSPENDED, NOTIFICATION_SENT. Giao với bảo đảm ít nhất một lần (at-least-once) có thử lại và hàng đợi thư chết (dead-letter queue).
