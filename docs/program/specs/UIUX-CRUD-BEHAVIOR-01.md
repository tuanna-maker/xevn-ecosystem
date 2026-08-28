# UI/UX SPEC: Tiêu chuẩn hành vi thao tác CRUD

## 1. Bối cảnh & Mục đích
- **WorkItem:** Chuẩn hóa UIUX Hành vi Tương tác (Settings & Catalog)
- **Mục đích:** Xóa bỏ sự thiếu hụt quy chuẩn trong việc hiển thị Form, Dialog, Modal và phản hồi sau khi người dùng thực hiện tạo/sửa/xóa, đảm bảo UX mượt mà và tránh lỗi 'nhấn lưu nhưng popup không tự đóng'.

## 2. Quy tắc bắt buộc (Mandatory Rules)

### 2.1. Cấu trúc Form/Modal thao tác
- Mọi **Dialog**, **Sheet**, **Modal** hoặc Component có chứa Form nhập liệu và nút Lưu (Submit), BẮT BUỘC phải đi kèm nút **Hủy/Đóng** (Cancel/Close).
- Nút Hủy phải nằm bên trái hoặc ngay bên cạnh nút Lưu, sử dụng variant khác màu (thường là \ariant='outline'\) để tránh bấm nhầm.

### 2.2. Xử lý sau khi Mutation Thành công (onSuccess)
Khi gọi API cập nhật dữ liệu thành công (Tạo mới, Cập nhật, Xóa, Lưu cài đặt), phía FE PHẢI đảm bảo thực hiện NGAY LẬP TỨC các thao tác sau:
1. **Đóng Popup:** Tự động gọi \setIsFormOpen(false)\ hoặc hàm đóng tương đương.
2. **Reload Data:** Gọi \queryClient.invalidateQueries({ queryKey: [...] })\ để lưới dữ liệu (Data table/List) load lại bản mới nhất mà không yêu cầu user F5.
3. **Thông báo (Toast):** Bắn \	oast.success(...)\ thông báo kết quả thân thiện (VD: 'Thêm ngạch lương thành công').

### 2.3. Xử lý Lỗi (onError)
- Modal/Sheet không được phép đóng nếu API bị lỗi.
- Bắn \	oast.error(...)\ với nội dung lỗi cụ thể trích xuất từ \err.message\ hoặc \err.code\.

## 3. Khóa trạng thái (Spec Lock)
Mọi Sub-Agent và Developer KHÔNG ĐƯỢC PHÉP bypass quy định này trong quá trình implement các màn hình Cài đặt, Danh mục thuộc phân hệ HRM, XBOS.