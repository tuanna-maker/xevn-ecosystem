---
description: Nguyên tắc thiết kế Danh mục phân hệ Lương (Payroll Master Data)
---

# Nguyên tắc Thiết kế Danh mục Phân hệ Lương (Payroll Master Data)

1. **Phân tách Danh mục Phẳng vs Danh mục Cấu trúc:** Bất kỳ danh mục Master Data nào được dùng làm gốc tính toán cho Policy Engine (ví dụ: Ngạch Bậc, Bảng Hệ số) TUYỆT ĐỐI KHÔNG ĐƯỢC lưu dưới dạng từ điển phẳng (key-value catalog).
2. **Specialized UI:** Các danh mục này phải có giao diện CRUD chuyên biệt (Specialized Popup) bên trong màn hình Cài đặt (Settings), cho phép người dùng cấu hình chi tiết cấu trúc bậc thang (Tiers/Steps), hệ số, v.v.
3. **SSOT (Single Source of Truth):** Policy Engine không được phép hardcode các lựa chọn (như Quyết định, Bảng lương). Tất cả phải gọi API động để load dữ liệu từ các danh mục Master Data đã được cấu hình.
