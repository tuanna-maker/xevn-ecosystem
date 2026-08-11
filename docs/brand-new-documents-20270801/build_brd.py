print(1+1)
p = "docs/brand-new-documents-20270801/BRD_NEW.md"
c = open(p, "r", encoding="utf-8").read()
s4 = """

---

## 4. Luồng Nghiệp Vụ Chính

### 4.1 Tenant Onboarding

SUPER_ADMIN tạo tenant tại Portal/CC -> hệ thống gửi email kích hoạt (hợp lệ 48h).
Trạng thái: PROVISIONING -> ACTIVE.
Thời gian on-boarding mục tiêu: < 30 phút end-to-end.

### 4.2 Employee Lifecycle

HR_MANAGER tạo hồ sơ -> hệ thống phát sinh employee_code (duy nhất theo tenant).
Nhân viên hoàn thiện profile qua Mobile -> Manager phân bổ phòng ban + chức vụ.

### 4.3 Leave Approval (Two-Level)

EMPLOYEE gửi đơn -> DEPT_MANAGER (L1) duyệt trong 24h -> HR_MANAGER (L2) duyệt trong 48h.
Từ chối yêu cầu lý do tối thiểu 10 ký tự.
Không cho self-approval ở tầng dữ liệu.

### 4.4 Payroll Batch

Chạy vào ngày 25 hàng tháng (hoặc ngày làm việc gần nhất).
Công thức: Net = Gross - BHXH(8%) - BHYT(1.5%) - BHTN(1%) - PIT(thang thuế lũy tiến).
Chuỗi duyệt: Batch -> HR Review -> Finance Approve -> Tenant Admin Confirm -> Issue -> Lock.
Lock là application-level + database write guard.
"""
open(p, "w", encoding="utf-8").write(c + s4)
print("SECTION4_APPENDED")
