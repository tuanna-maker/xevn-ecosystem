# Chương 7b — Tuyển dụng (HRM) · Danh mục giai đoạn pipeline

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-007b |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục giai đoạn; chưa đủ HDSD toàn trụ tuyển dụng) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Tuyển dụng** / **Cài đặt** |
| **Đối tượng** | HCNS quản trị danh mục giai đoạn; HRBP / Recruiter đổi trạng thái · Kanban · xếp lịch |
| **Tham chiếu SRS** | FR-UC-BP-REC-05 · 05a · 06a · 07 (khóa danh mục giai đoạn) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục giai đoạn pipeline** và cách chọn giai đoạn trên **Ứng viên / Kanban / nhận việc / xếp lịch**. **Không** khẳng định toàn bộ module tuyển dụng đã sẵn sàng nghiệm thu; **không** hướng dẫn cấu hình trường JD kéo-thả hay toàn bộ chiến dịch / tin đăng.

**Liên kết:** chương tổng [`HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md`](./HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md) · tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai màn hình — đừng nhầm

| Màn | Việc được làm | Việc không làm |
|-----|----------------|----------------|
| **Giai đoạn REC** (quản trị danh mục — Cài đặt / tab Giai đoạn REC) | Thêm mã giai đoạn mới hợp lệ; sửa nhãn / cờ nhận việc / cho phép lịch; ngừng theo dõi | Không bị chặn «chỉ chọn mã đã có» |
| **Ứng viên / Kanban / nhận việc** (vận hành) | Khi danh mục còn phần tử hiệu lực: **chọn** giai đoạn từ danh sách | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 7b.1 — Tab Giai đoạn REC · danh sách]`

---

## 2. Quản trị danh mục — thêm mã mới

1. Vào **Cài đặt** (trong Nhân sự / Tuyển dụng theo menu đơn vị) → tab **Giai đoạn REC** (hoặc nhãn tương đương).
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** mới (đúng quy ước chữ/số), **tên hiển thị**, và các cờ cần thiết (kết quả nhận việc, cho phép xếp lịch…).
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — mã vẫn còn.

Nếu mã trùng hoặc sai định dạng: hệ thống báo lỗi trên form; không tạo bản ghi.

`[Hình 7b.2 — Hộp thoại thêm giai đoạn]`

---

## 3. Chọn giai đoạn trên Ứng viên / Kanban

### 3.1 Khi danh mục còn phần tử hiệu lực

1. Mở **Tuyển dụng** → **Ứng viên** (hoặc bảng Kanban).
2. Mở **ô chọn giai đoạn** / kéo thẻ sang cột — danh sách cột và mã lấy từ danh mục giai đoạn chuẩn (không lấy danh mục mở rộng trên Cấu hình hệ thống làm nguồn duy nhất; không chỉ sáu mã khởi tạo nếu danh mục đã có mã mới).
3. Chọn mã đã có → **Lưu** / thả thẻ.
4. Kiểm tra chip / cột hiển thị đúng giai đoạn.
5. **Tải lại** — giai đoạn vẫn thuộc danh mục (không phát sinh mã lạ).

Nếu cố nhập / gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục trống

- Ô chọn / cột trống trung thực hoặc chỉ nhãn khởi tạo để hiển thị kèm hướng dẫn tạo trên tab **Giai đoạn REC**.
- **Không** dùng dữ liệu giả chỉ để «có gì chọn».
- Vẫn có thể thêm mã mới ở màn quản trị (mục 2).

`[Hình 7b.3 — Chọn giai đoạn trên Ứng viên / Kanban]`

---

## 4. Thêm ứng viên — giai đoạn ban đầu

1. **Ứng viên** → **Thêm**.
2. Chọn YCTD và các trường bắt buộc.
3. **Giai đoạn ban đầu:** khi danh mục còn phần tử — chọn từ danh sách (không gõ mã tự do).
4. **Lưu** → danh sách cập nhật → **Tải lại** vẫn thấy giai đoạn thuộc danh mục.

---

## 5. Xếp lịch phỏng vấn và cờ giai đoạn

1. Trên danh mục, có thể tắt **cho phép xếp lịch** cho một giai đoạn.
2. Ứng viên đang ở giai đoạn đó → mở xếp lịch → hệ thống **không** cho tạo lịch (thông báo rõ).
3. Bật lại cờ → xếp lịch theo quy tắc **một lịch đang hiệu lực** như hướng dẫn chung (không bỏ quy tắc một lịch).

Lỗi «giai đoạn không cho phép lịch» **khác** lỗi «đã có lịch đang hiệu lực».

---

## 6. Nhận việc

1. Chọn giai đoạn / thao tác nhận việc gắn mã **kết quả nhận việc** thuộc danh mục hiệu lực.
2. Mở hộp thoại liên kết nhân viên (nếu có) → hoàn tất.
3. **Tải lại** — liên kết còn; không dùng mã đích ngoài danh mục.

---

## 7. Ngừng theo dõi giai đoạn

1. Trên danh mục, chọn **Ngừng theo dõi** cho mã không còn dùng.
2. Mã **không** còn trong danh sách chọn / cột mặc định trên hồ sơ mới.
3. Lịch sử trạng thái vẫn đọc được mã đã gắn trước đó.

---

## 8. Lưu ý vận hành

- Funnel / biểu đồ có thể còn nhãn «sáu giai đoạn» mang tính minh họa — **không** thay nguồn sự thật của cột Kanban khi danh mục đã có mã tùy chỉnh.
- Danh mục mở rộng trên **Cấu hình hệ thống** (nếu thấy) **không** thay thế danh mục giai đoạn chuẩn khi chọn trạng thái.
- Hướng dẫn này **không** thay cho toàn bộ quy trình YCTD / JD / chiến dịch và **không** khẳng định đã chạy thử toàn trụ tuyển dụng.

---

## 9. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên danh mục | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Không chọn được giai đoạn trên Ứng viên | Kiểm tra đã tạo mã trên tab Giai đoạn REC chưa; tải lại danh sách |
| Báo lỗi khi nhập mã tự nghĩ ra | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên quản trị trước |
| Kanban không thấy mã mới vừa tạo | Tải lại trang; kiểm tra mã còn hiệu lực (chưa ngừng theo dõi) |
| Không xếp được lịch dù chưa có lịch | Kiểm tra cờ «cho phép xếp lịch» trên giai đoạn hiện tại |
| Danh sách chọn trống | Tạo mã trên quản trị; không yêu cầu kỹ thuật viên «cấy» dữ liệu giả |

---

*Hết chương 7b (DOC-DELTA danh mục giai đoạn pipeline — v0.1).*
