# JSX Safety Rule

**Description:** Đảm bảo tính toàn vẹn của mã nguồn React/JSX sau khi thực hiện chỉnh sửa, ngăn chặn các lỗi cú pháp (Syntax Error) nghiêm trọng như thiếu thẻ đóng/mở làm gián đoạn quá trình biên dịch (Vite).

## Yêu cầu bắt buộc (Mandatory Requirements)

Mỗi khi bạn (AI Agent) sử dụng công cụ để sửa đổi (`replace_file_content` hoặc `multi_replace_file_content`) mã nguồn React/JSX (.jsx, .tsx), BẠN PHẢI thực hiện ít nhất MỘT TRONG HAI hành động sau **trước khi kết thúc lượt phản hồi và báo cáo hoàn thành cho người dùng**:

1. **Kiểm tra trực quan (Visual Check):** Sử dụng công cụ `view_file` để đọc lại chính xác vùng code vừa sửa đổi. Tự rà soát cẩn thận số lượng thẻ mở (ví dụ: `<div...>`, `<Sheet>`) và thẻ đóng (ví dụ: `</div>`, `</Sheet>`) để đảm bảo chúng khớp nhau hoàn toàn.
2. **Kiểm tra tự động (Automated Check):** Sử dụng công cụ `run_command` để chạy ngầm linter hoặc compiler (ví dụ: `npm run lint` hoặc `tsc --noEmit` hoặc tương tự tuỳ dự án) để hệ thống tự động phát hiện lỗi cú pháp.

Tuyệt đối không bỏ qua bước này khi sửa đổi các khối UI lớn hoặc thay đổi cấu trúc bọc (wrapper components).
