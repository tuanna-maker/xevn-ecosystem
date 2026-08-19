# Chương 8 — Quy trình & quy định (HRM · chỉ đọc)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-008 |
| **Phiên bản** | 1.0 (Markdown — placeholder ảnh) |
| **Ngày hiệu lực** | 06/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Quy trình** (menu **Quy trình & quy định**) |
| **Route embed** | `…/command-center/hrm/processes` · độc lập HRM: `/hr/processes` |
| **Đối tượng** | HCNS, lãnh đạo đơn vị (xem); quản trị mã quy trình trên Command Center |
| **Tham chiếu SRS** | FR-UC-BP-PROC-01 · XBOS-DM-HRM-14 (gán mã trên nền tảng) |

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md) (đăng nhập cổng, phạm vi công ty).

---

## 1. Giới thiệu

Màn **Quy trình & quy định** trên Nhân sự dùng để:

- **Xem** các mã quy trình / nhóm phê duyệt đã đồng bộ từ nền tảng (ví dụ chỉnh sửa chấm công, nghỉ phép, duyệt mở rộng danh mục, duyệt thay đổi hồ sơ).
- **Không** tạo, sửa hay xóa định nghĩa quy trình tại đây — quản trị mã thực hiện trên **Command Center**.
- Khi chưa có mã sau đồng bộ: màn trống trung thực và có **nút hoặc liên kết** mở được sang Command Center để quản trị.

`[Hình 8.0 — Màn Quy trình & quy định]`

---

## 2. Vào màn hình

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Đăng nhập Cổng Web | Vào Command Center, không banner lỗi đồng bộ Nhân sự giả |
| 2 | Chọn đúng công ty / pháp nhân nếu hệ thống hỏi | Phạm vi khớp đơn vị đang làm việc |
| 3 | Mở menu **Quy trình** (Quy trình & quy định) | Hiện danh sách chỉ đọc **hoặc** trạng thái trống có nút/liên kết Command Center |

**Lưu ý:** Không có nút **Thêm** / **Sửa** / **Xóa** quy trình trên màn này. Nếu thấy các nút đó báo thành công giả — coi là **chưa đạt**.

---

## 3. Khi đã có mã sau đồng bộ

| Thành phần | Cách dùng | Kết quả mong đợi |
|------------|-----------|------------------|
| Bảng / danh sách | Xem mã, tên, nhóm (nếu có) | Ít nhất một dòng khi danh mục nền tảng đã phát hành và Nhân sự đã đồng bộ |
| Tìm kiếm (nếu có) | Gõ từ khóa | Lọc trên tập đã đồng bộ — không tạo mã mới |
| **Xem** / mắt | Mở chi tiết | Chỉ đọc — không form lưu thay đổi định nghĩa |

**Kiểm chứng nhanh (AC-PROC-06):** Sau khi quản trị đã phát hành mã trên Command Center và Nhân sự đã đồng bộ danh mục, mở lại màn này → **phải thấy dòng**. Danh sách trống mãi dù danh mục đã có mã = **không đạt**.

---

## 4. Khi chưa có mã (trống trung thực)

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Mở màn khi danh mục sau đồng bộ = 0 phần tử | Thông báo kiểu «Chưa có quy trình/quy định» (không «chưa triển khai») |
| 2 | Tìm **nút hoặc liên kết** «Quản trị mã quy trình trên Command Center» (hoặc nhãn tương đương) | Control **bấm được** — không chỉ đoạn chữ |
| 3 | Bấm nút/liên kết | Mở màn quản trị mã / quy trình trên Command Center |
| 4 | Tạo hoặc gán mã trên Command Center → đồng bộ lại Nhân sự → quay lại màn này | Danh sách có dòng (mục 3) |

**Kiểm chứng nhanh (AC-PROC-05):** Empty mà chỉ có chữ, không điều hướng được → **không đạt**.

---

## 5. Việc không làm trên màn này

| Việc | Nơi đúng |
|------|----------|
| Tạo / sửa / xóa định nghĩa quy trình | Command Center — quản trị mã / workflow |
| Duyệt đơn nghỉ / tuyển dụng trong hộp thư | Inbox / luồng đơn tương ứng (không thay bằng CRUD trên menu Quy trình) |
| Điền dữ liệu giả để «có dòng cho đẹp» | Không — empty trung thực khi danh mục thật sự trống |

---

## 6. Xử lý sự cố thường gặp

| Triệu chứng | Hướng xử lý |
|-------------|-------------|
| Banner lỗi đỏ / Sync ERROR | Kiểm tra dịch vụ Nhân sự và phạm vi công ty — không dùng dữ liệu giả |
| Luôn trống dù đã phát hành mã trên Command Center | Kiểm tra bước đồng bộ danh mục vào Nhân sự; ghi nhận lệch bind (cần đội kỹ thuật) |
| Không thấy nút sang Command Center khi trống | Ghi nhận thiếu deep-link — chưa đạt hướng dẫn vận hành mục 4 |
| Có Thêm/Sửa/Xóa báo đã lưu | Không dùng — báo đội sản phẩm; màn này chỉ đọc |

---

*Tài liệu thuộc bộ HDSD phân hệ Nhân sự — bản Markdown phục vụ pilot và đối chiếu kịch bản kiểm thử. Ảnh màn hình bổ sung khi chụp trên môi trường nghiệm thu. Tài liệu **không** khẳng định module Quy trình đã nghiệm thu vận hành toàn phần.*
