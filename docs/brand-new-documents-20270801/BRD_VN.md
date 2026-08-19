# Tài liệu Yêu cầu Nghiệp vụ — Hệ sinh thái XeVN OS
Ngày: 2026-08-01

## 1. Mục tiêu
- Thay thế ngăn xếp HR phân mảnh bằng nền tảng đa tenant thống nhất
- Nguồn dữ liệu duy nhất: tenant, tổ chức, nhân sự, dữ liệu bảng lương
- Ưu tiên RBAC, khả năng mở rộng hướng sự kiện, khả năng kiểm toán doanh nghiệp

## 2. Phạm vi không bao gồm
- Công cụ di dời dữ liệu cũ
- Thay thế toàn bộ ERP
- Chấm công thời gian thực

## 3. Nguyên tắc kiến trúc
- Cô lập dữ liệu theo hàng (row-level) theo tenant
- API không trạng thái, JWT RS256
- Liên kết giữa các phân hệ theo hướng sự kiện (event-first)
- Không xóa vĩnh viễn (no hard delete)

## 4. Nhóm người dùng
Super Admin, Tenant Admin, HR Manager, Dept Manager, Employee, Finance Staff, Recruiter, Fleet Manager, Dispatcher

## 5. Phân hệ
- XBOS: vòng đời tenant, RBAC, workflow engine, catalog governance, audit log
- HRM: hồ sơ nhân viên, chấm công, nghỉ phép, bảng lương, tuyển dụng, báo cáo
- HRM Mobile: đăng nhập, check-in, nghỉ phép, phiếu lương, thông báo đẩy, offline
- Portal/CC: bảng điều khiển, quản lý catalog, panel quản trị tenant
- Logistics: phương tiện, tài xế, chuyến xe, theo dõi

## 6. Tóm tắt tiêu chí chấp nhận
Onboard tenant dưới 30 phút, truy cập xuyên tenant bị từ chối với 403, workflow thực thi phê duyệt hai cấp, audit log không thể thay đổi, khóa bảng lương ngăn chỉnh sửa sau phê duyệt.
