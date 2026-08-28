---
name: UI/UX Layout Patterns
description: Hướng dẫn chuẩn về bố cục giao diện (scroll, dialog, layout) để tránh lỗi UI/UX
---

# UI/UX Layout Patterns (XeVN Ecosystem)

Để tránh lặp lại các lỗi trải nghiệm người dùng (UX) và lỗi cú pháp khi chia lại bố cục (layout) trong React/Vite, mọi thao tác chỉnh sửa UI cần tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Xử lý thanh cuộn (Scrollbar) cho Danh sách / Bảng
Tuyệt đối KHÔNG áp dụng thanh cuộn (scroll) cho toàn bộ trang (outer scroll) ở các màn hình Danh sách Cài đặt (như `PaySalaryComponentList`, `PayPayslipTemplateSettingsPanel`).
- Cấu trúc chuẩn:
  - Khung bao ngoài (`Card` hoặc `Wrapper`): Khóa chiều cao theo màn hình bằng `flex flex-col h-[calc(100vh-140px)]`.
  - Khung chứa Bảng (Table wrapper): Cho phép cuộn độc lập bằng `flex-1 overflow-auto relative`.
  - Tiêu đề Bảng (`thead`): Cố định bằng `sticky top-0 z-10 bg-gray-50`.

## 2. Popup (Dialog) kích thước lớn
Khi Popup/Dialog chứa nhiều thông tin (ví dụ: chia 2 cột), Popup cần được hiển thị rộng tối đa để người dùng dễ nhìn:
- Khung DialogContent: `className="max-h-[98vh] max-w-[98vw] p-0 flex flex-col gap-0"`.
- Layout bên trong: Chia 2 cột rõ ràng nếu cần (ví dụ cột trái thông tin chung cố định chiều rộng `w-[350px]`, cột phải danh sách cuộn được `flex-1 overflow-y-auto`).

## 3. Quản lý cú pháp JSX khi Refactor Layout
Khi chia lại cột hoặc thay đổi cấu trúc thẻ `<div>`:
- LUÔN LUÔN kiểm tra số lượng thẻ mở và thẻ đóng (`<div>` và `</div>`). Việc thiếu hoặc thừa thẻ đóng sẽ gây lỗi Syntax Error (ví dụ: `Expected '</', got '<eof>'`) khiến Vite văng lỗi 500 Internal Server Error trắng màn hình.
- Chú ý xóa sạch code rác sinh ra từ trình chỉnh sửa mã (như lặp lại dòng thẻ `<Dialog open={...}>`).
