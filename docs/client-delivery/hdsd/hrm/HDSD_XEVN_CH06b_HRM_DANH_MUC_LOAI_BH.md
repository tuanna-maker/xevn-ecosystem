# Chương 6b — Danh mục loại bảo hiểm (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006b |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục loại BH; chưa đủ HDSD toàn trụ hợp đồng–bảo hiểm) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Cài đặt** / **Bảo hiểm** (tab **Loại BH**) |
| **Đối tượng** | HCNS quản trị danh mục loại BH; C&B / HCNS tạo chính sách và gắn người trên timeline |
| **Tham chiếu SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-CORE-02 (khóa danh mục loại BH) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục loại bảo hiểm** và cách chọn loại trên **chính sách** / **timeline gắn người**. **Không** khẳng định toàn bộ module bảo hiểm / hợp đồng đã sẵn sàng nghiệm thu; **không** hướng dẫn in hợp đồng, thư viện mẫu, hay toàn bộ action Đóng/Ngừng/Tạm hoãn.

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai màn hình — đừng nhầm

| Màn | Việc được làm | Việc không làm |
|-----|----------------|----------------|
| **Loại BH** (quản trị danh mục — Cài đặt / tab Loại BH) | Thêm mã loại mới hợp lệ; sửa nhãn; ngừng theo dõi | Không bị chặn «chỉ chọn mã đã có» |
| **Chính sách / Timeline BH** (vận hành) | Khi danh mục còn phần tử hiệu lực: **chọn** loại từ danh sách | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 6b.1 — Tab Loại BH · danh sách]`

---

## 2. Quản trị danh mục — thêm mã mới

1. Vào **Nhân sự** / **Cài đặt** → tab **Loại BH** (hoặc nhãn tương đương trên pháp nhân).
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** mới (đúng quy ước chữ/số) và **tên hiển thị**.
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — mã vẫn còn.

Nếu mã trùng hoặc sai định dạng: hệ thống báo lỗi trên form; không tạo bản ghi.

`[Hình 6b.2 — Hộp thoại thêm loại BH]`

---

## 3. Chọn loại trên chính sách / timeline

### 3.1 Khi danh mục còn phần tử hiệu lực

1. Mở **Bảo hiểm** → **Tạo / sửa chính sách**, hoặc mở **hồ sơ** → timeline bảo hiểm → **Thêm gắn người** (hoặc tương đương).
2. Mở **ô chọn loại bảo hiểm** — danh sách lấy từ danh mục loại BH chuẩn (không lấy danh mục mở rộng trên Cấu hình hệ thống làm nguồn duy nhất).
3. Chọn mã đã có → nhập các trường còn lại theo nghiệp vụ → **Lưu**.
4. Kiểm tra bản ghi hiển thị đúng loại.
5. **Tải lại** — loại vẫn thuộc danh mục (không phát sinh mã lạ).

Nếu cố nhập / gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục trống

- Ô chọn trống trung thực kèm hướng dẫn tạo trên tab **Loại BH**.
- **Không** dùng dữ liệu giả chỉ để «có gì chọn».
- Vẫn có thể thêm mã mới ở màn quản trị (mục 2).

`[Hình 6b.3 — Chọn loại trên chính sách / timeline]`

---

## 4. Ngừng theo dõi loại BH

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tương đương) cho mã không còn dùng.
2. Mã **không** còn trong danh sách chọn mặc định trên chính sách / gắn người mới.
3. Chính sách / timeline lịch sử vẫn đọc được mã đã gắn trước đó.

---

## 5. Lưu ý vận hành

- Danh mục mở rộng trên **Cấu hình hệ thống** (nếu thấy) **không** thay thế danh mục loại BH chuẩn khi chọn loại trên chính sách / timeline.
- **Nhà bảo hiểm** (đơn vị phát hành) là danh mục / ô chọn **riêng** — xem chương **6c**; không nhầm với **loại BH**.
- Hướng dẫn này **không** thay cho quy trình Đóng / Ngừng / Tạm hoãn trên timeline, in hợp đồng, hay thư viện mẫu và **không** khẳng định đã chạy thử toàn bộ trụ hợp đồng–bảo hiểm / nhân sự.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên danh mục | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Không chọn được loại trên chính sách / timeline | Kiểm tra đã tạo mã trên tab Loại BH chưa; tải lại danh sách |
| Báo lỗi khi nhập mã tự nghĩ ra | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên quản trị trước |
| Danh sách chọn trống | Tạo mã trên quản trị; không yêu cầu kỹ thuật viên «cấy» dữ liệu giả |
| Nhầm ô nhà bảo hiểm với loại BH | Chọn đúng ô — hai khái niệm khác nhau |

---

*Hết chương 6b (DOC-DELTA danh mục loại bảo hiểm — v0.1).*
