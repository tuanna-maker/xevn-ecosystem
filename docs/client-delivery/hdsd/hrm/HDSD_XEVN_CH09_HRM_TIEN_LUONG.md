# Chương 9 — Tiền lương (HRM) · Danh mục thành phần lương

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-009 |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục thành phần; chưa đủ HDSD toàn trụ lương) |
| **Ngày hiệu lực** | 07/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Tiền lương** |
| **Đối tượng** | C&B / HCNS quản trị danh mục; C&B vận hành mẫu phiếu và đãi ngộ |
| **Tham chiếu SRS** | FR-UC-BP-PAY-02 (khóa danh mục · AC-PAY-COMP-01) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục thành phần lương** và cách gắn mã trên mẫu / đãi ngộ. **Không** khẳng định toàn bộ module lương đã sẵn sàng nghiệm thu; **không** hướng dẫn chạy công thức tính lương chính thức.

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai màn hình — đừng nhầm

| Màn | Việc được làm | Việc không làm |
|-----|----------------|----------------|
| **Thành phần lương** (quản trị danh mục) | Thêm mã thành phần mới hợp lệ; sửa nhãn / loại; ngừng theo dõi | Không bị chặn «chỉ chọn mã đã có» |
| **Mẫu phiếu / Đãi ngộ** (gắn mã) | Khi danh mục còn phần tử hiệu lực: **chọn** mã từ danh sách | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 9.1 — Tab Thành phần lương · danh sách]`

---

## 2. Quản trị danh mục — thêm mã mới

1. Vào **Tiền lương** → tab **Thành phần lương**.
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** mới (đúng quy ước chữ/số), **tên hiển thị**, **loại / bản chất** từ danh mục loại.
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — mã vẫn còn.

Nếu mã trùng hoặc sai định dạng: hệ thống báo lỗi trên form; không tạo bản ghi.

`[Hình 9.2 — Hộp thoại thêm thành phần]`

---

## 3. Gắn mã trên mẫu phiếu / đãi ngộ

### 3.1 Khi danh mục còn phần tử hiệu lực

1. Mở **Mẫu phiếu** (hoặc gói **Đãi ngộ** nhân viên).
2. Thêm dòng thành phần → mở **ô chọn** từ danh mục thành phần chuẩn.
3. Chọn mã đã có → **Lưu**.
4. Kiểm tra mã hiển thị đúng trên lưới.
5. **Tải lại** — mã vẫn thuộc danh mục (không phát sinh mã lạ).

Nếu cố nhập / gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục trống

- Ô chọn trống trung thực kèm hướng dẫn tạo trên tab **Thành phần lương**.
- **Không** dùng dữ liệu giả chỉ để «có gì chọn».
- Vẫn có thể thêm mã mới ở màn quản trị (mục 2).

`[Hình 9.3 — Chọn mã trên mẫu phiếu]`

---

## 4. Ngừng theo dõi thành phần

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tương đương) cho mã không còn dùng.
2. Mã **không** còn trong danh sách chọn mặc định trên mẫu / đãi ngộ mới.
3. Bản ghi lịch sử / phiếu cũ vẫn đọc được mã đã gắn trước đó.

---

## 5. Lưu ý vận hành

- Danh mục mở rộng trên **Cấu hình hệ thống** (nếu thấy) **không** thay thế danh mục chuẩn trên Tiền lương khi chọn mã trên mẫu / đãi ngộ.
- Hướng dẫn này **không** thay cho quy trình soạn / phát hành công thức lương và **không** khẳng định đã chạy thử toàn bộ kỳ lương.
- Phiếu lương xem / in (nếu có menu) là luồng đọc riêng — không dùng để chứng minh đã gắn mã đúng trên mẫu.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên danh mục | Kiểm tra mã trùng / sai định dạng / thiếu loại; sửa rồi Lưu lại |
| Không chọn được mã trên mẫu | Kiểm tra đã tạo mã trên tab Thành phần lương chưa; tải lại danh sách |
| Báo lỗi khi nhập mã tự nghĩ ra | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên quản trị trước |
| Danh sách chọn trống | Tạo mã trên quản trị; không yêu cầu kỹ thuật viên «cấy» dữ liệu giả |

---

*Hết chương 9 (DOC-DELTA danh mục thành phần — v0.1).*
