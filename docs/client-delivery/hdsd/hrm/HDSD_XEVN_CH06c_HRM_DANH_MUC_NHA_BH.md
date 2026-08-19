# Chương 6c — Danh mục nhà bảo hiểm (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006c |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục nhà BH; chưa đủ HDSD toàn trụ hợp đồng–bảo hiểm) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Cài đặt** / **Bảo hiểm** (tab **Nhà BH**) |
| **Đối tượng** | HCNS quản trị danh mục nhà BH; C&B / HCNS tạo chính sách gắn nhà BH |
| **Tham chiếu SRS** | FR-UC-BP-CORE-10 · FR-UC-BP-CORE-02 (khóa danh mục nhà BH) |
| **Peer HDSD** | Chương 6b — Danh mục **loại** bảo hiểm (hai danh mục riêng — không gộp) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục nhà bảo hiểm** và cách chọn nhà BH trên **chính sách** (và bản ghi mềm khi có ô mã nhà BH). **Không** khẳng định toàn bộ module bảo hiểm / hợp đồng đã sẵn sàng nghiệm thu; **không** hướng dẫn in hợp đồng, thư viện mẫu, hay toàn bộ action Đóng/Ngừng/Tạm hoãn; **không** thay chương 6b (loại BH).

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai màn hình — đừng nhầm

| Màn | Việc được làm | Việc không làm |
|-----|----------------|----------------|
| **Nhà BH** (quản trị danh mục — Cài đặt / tab Nhà BH) | Thêm mã nhà BH mới hợp lệ; sửa nhãn; ngừng theo dõi | Không bị chặn «chỉ chọn mã đã có» · không gộp vào tab **Loại BH** |
| **Chính sách BH** (vận hành) | Khi danh mục còn phần tử hiệu lực: **chọn** nhà BH từ danh sách | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 6c.1 — Tab Nhà BH · danh sách]`

---

## 2. Quản trị danh mục — thêm mã mới

1. Vào **Nhân sự** / **Cài đặt** → tab **Nhà BH** (hoặc nhãn tương đương trên pháp nhân).
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** mới (đúng quy ước chữ/số) và **tên hiển thị**.
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — mã vẫn còn.

Nếu mã trùng hoặc sai định dạng: hệ thống báo lỗi trên form; không tạo bản ghi.

`[Hình 6c.2 — Hộp thoại thêm nhà BH]`

---

## 3. Chọn nhà BH trên chính sách

### 3.1 Khi danh mục còn phần tử hiệu lực

1. Mở **Bảo hiểm** → **Tạo / sửa chính sách**.
2. Mở **ô chọn nhà bảo hiểm** — danh sách lấy từ danh mục nhà BH chuẩn (không lấy danh mục mở rộng trên Cấu hình hệ thống làm nguồn duy nhất).
3. Chọn mã đã có → nhập các trường còn lại theo nghiệp vụ (gồm **loại BH** theo chương 6b) → **Lưu**.
4. Kiểm tra bản ghi hiển thị đúng nhà BH.
5. **Tải lại** — nhà BH vẫn thuộc danh mục (không phát sinh mã lạ).

Nếu cố nhập / gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ (**khác** thông báo khi sai loại BH); sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục trống

- Ô chọn trống trung thực kèm hướng dẫn tạo trên tab **Nhà BH**.
- **Không** dùng dữ liệu giả chỉ để «có gì chọn».
- Vẫn có thể thêm mã mới ở màn quản trị (mục 2).

`[Hình 6c.3 — Chọn nhà BH trên chính sách]`

---

## 4. Ngừng theo dõi nhà BH

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tương đương) cho mã không còn dùng.
2. Mã **không** còn trong danh sách chọn mặc định trên chính sách mới.
3. Chính sách / bản ghi lịch sử vẫn đọc được mã đã gắn trước đó.

---

## 5. Lưu ý vận hành

- Danh mục mở rộng trên **Cấu hình hệ thống** (nếu thấy) **không** thay thế danh mục nhà BH chuẩn khi chọn trên chính sách.
- **Loại bảo hiểm** là danh mục / ô chọn **riêng** (chương 6b) — **không** nhầm với **nhà BH**.
- Hướng dẫn này **không** thay cho quy trình Đóng / Ngừng / Tạm hoãn trên timeline, in hợp đồng, hay thư viện mẫu và **không** khẳng định đã chạy thử toàn bộ trụ hợp đồng–bảo hiểm / nhân sự.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên danh mục | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Không chọn được nhà BH trên chính sách | Kiểm tra đã tạo mã trên tab Nhà BH chưa; tải lại danh sách |
| Báo lỗi khi nhập mã tự nghĩ ra | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên quản trị trước |
| Danh sách chọn trống | Tạo mã trên quản trị; không yêu cầu kỹ thuật viên «cấy» dữ liệu giả |
| Nhầm ô loại BH với nhà BH | Chọn đúng ô — hai khái niệm khác nhau (xem chương 6b) |

---

*Hết chương 6c (DOC-DELTA danh mục nhà bảo hiểm — v0.1).*
