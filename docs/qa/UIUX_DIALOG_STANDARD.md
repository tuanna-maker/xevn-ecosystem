# Tiêu chuẩn UI/UX cho Popup (Dialog) trên toàn hệ thống 8088

Tài liệu này định nghĩa các tiêu chuẩn khắt khe về UI/UX cho tất cả các màn hình dạng Popup (Dialog) trên phân hệ XBOS & HRM. Các QA/QC sẽ dùng tài liệu này như một checklist (testcase) để nghiệm thu giao diện.

## 1. Typography (Kích cỡ chữ)
Hệ thống cũ có xu hướng dùng `text-xs` quá nhiều khiến UI khó đọc so với các nền tảng SaaS hiện đại.
- **Tiêu chuẩn Nhãn (Label):** Bắt buộc sử dụng `text-sm text-muted-foreground` (Tuyệt đối không dùng `text-xs` cho label của form/chi tiết).
- **Tiêu chuẩn Dữ liệu (Value):** Sử dụng `text-base` hoặc tối thiểu `text-sm font-medium` để dữ liệu nổi bật, dễ quét bằng mắt.
- **Dữ liệu mờ / phụ:** Chỉ sử dụng `text-xs` cho các thông tin râu ria như dòng chữ "Lúc: 14:00" ở log, hoặc hint giải thích phụ dưới các checkbox.

## 2. Kích thước & Lưới Layout (Grid)
- **Tuyệt đối tránh khoảng trắng thừa:** Các khối dữ liệu ít chữ nhưng hiển thị trên 1 dòng dài phải được chia cột (ví dụ: `grid-cols-2` hoặc `grid-cols-3`) để tận dụng không gian.
- **Độ rộng Popup:** Các popup chứa nhiều dữ liệu phức tạp (như màn hình Chi tiết) phải được mở rộng giới hạn từ `max-w-2xl` lên đến `max-w-4xl` hoặc `max-w-5xl`. Tuyệt đối không để người dùng phải cuộn ngang màn hình hoặc cuộn dọc quá nhiều chỉ vì popup bị bó hẹp vô lý.

## 3. Chống lẹm Footer (Sticky Action Buttons)
Các nút thao tác chính yếu (như Lưu, Gửi duyệt, Đóng) thuộc khu vực `DialogFooter` **phải luôn luôn hiển thị (sticky)** trên màn hình người dùng, bất kể nội dung bên trong dài đến đâu.
- **Lỗi vi phạm:** Thiết lập `overflow-y-auto` trên lớp ngoài cùng `DialogContent`, khiến thanh cuộn (scrollbar) nuốt luôn cả phần Footer bên dưới.
- **Thiết kế chuẩn:**
  1. `DialogContent` phải có class `flex flex-col overflow-hidden max-h-[90vh]`.
  2. Bọc toàn bộ nội dung body vào một thẻ `<div className="flex-1 overflow-y-auto min-h-0 ...">`.
  3. Đặt `DialogFooter` nằm **ngoài** thẻ bọc cuộn đó. 

QA khi test nếu thấy chỉ cần cuộn nhẹ một chút xíu mới thấy hết nút thì lập tức report bug UI.
