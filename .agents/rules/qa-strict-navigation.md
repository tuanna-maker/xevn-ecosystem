# Rule: QA Strict Navigation

Khi thực hiện QA trên trình duyệt (Browser Subagent):
1. **Bám sát Spec**: Luôn phải đối chiếu với UI/UX spec và tài liệu SRS nghiệp vụ (nếu có) để biết chính xác luồng cần đi, **KHÔNG ĐƯỢC** bấm lung tung thăm dò mù quáng.
2. **Đi thẳng vào mục tiêu**:
   - Từ trang Cockpit (Executive Dashboard / Command Center), nhấp thẳng vào Tenant liên quan để vào hệ thống nghiệp vụ (Workspace Portal / HRM / Portal).
   - Không click vào các nút điều hướng ngoài luồng hệ thống.
3. **Tự sửa sai (Self-Correction)**: Nếu lỡ click nhầm và bị điều hướng sang trang không liên quan (ví dụ: màn hình danh sách thư mục `Index of...`, trang 404, hoặc phân hệ khác), **PHẢI QUAY LẠI NGAY LẬP TỨC** bằng cách gõ lại URL `http://localhost:5173` hoặc dùng Javascript `history.back()`. Không tiếp tục chuỗi thao tác sai.
