# Chương 6d — Trường mở rộng hồ sơ nhân sự (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006d |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi trường mở rộng NS; chưa đủ HDSD toàn trụ nhân sự) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Cài đặt HRM → nhóm trường nhân sự (cơ bản / cá nhân / công việc / tài chính) · Hồ sơ / danh sách nhân sự |
| **Đối tượng** | HCNS quản trị cấu hình trường; HCNS vận hành hồ sơ |
| **Tham chiếu SRS** | FR-UC-BP-CORE-02b · FR-UC-BP-PLT-01 |
| **Peer HDSD** | Chương 6 — Danh sách nhân sự (vận hành hồ sơ tổng quát) |

**Phạm vi bản này:** chỉ hướng dẫn **mục mở rộng trường trên Cài đặt** và cách gắn mã mở rộng trên **hồ sơ**. **Không** khẳng định toàn bộ module nhân sự đã sẵn sàng nghiệm thu; **không** thay chương 6; **không** hướng dẫn loại giấy tờ / loại hình thuê / vị trí tập đoàn (đã có luồng riêng).

---

## 1. Hai việc khác nhau

| Việc | Trên màn nào | Được làm gì | Không được |
|------|--------------|-------------|------------|
| **Quản trị mục mở rộng** | Cài đặt → nhóm trường NS | Thêm mã trường mới hợp lệ; sửa nhãn; ngừng theo dõi | Bị chặn «chỉ chọn mã đã có» |
| **Gắn giá trị trên hồ sơ** | Thêm / Sửa nhân viên · hồ sơ | Khi còn mục hiệu lực: **chọn / gắn** mã từ danh mục mở rộng | Nhập mã chữ tự do làm nguồn sự thật |

Sau khi thêm mục mở rộng đang hiệu lực, danh sách **trường trộn** (dùng xem trước / điền mẫu) cũng có trường tương ứng — tải lại vẫn còn.

---

## 2. Quản trị — thêm mã trường mới

1. Mở **Cài đặt** → chọn đúng nhóm trường nhân sự (cơ bản / cá nhân / công việc / tài chính).
2. **Thêm** mục mở rộng: nhập mã (dạng chữ–số hợp lệ) + nhãn tiếng Việt → **Lưu**.
3. **Tải lại** — mục còn trên danh sách; trường trộn tương ứng xuất hiện (khi hệ thống hỗ trợ xem danh sách trường trộn).
4. **Ngừng theo dõi** mục không còn dùng → mục ẩn khỏi chọn trên hồ sơ; giá trị lịch sử trên hồ sơ **có thể còn** mã đã ngừng (không xóa cứng bắt buộc).

Nếu mã sai định dạng hoặc trùng mục đang hiệu lực: sửa rồi Lưu lại — **không** hiểu là «hệ thống cấm thêm mã mới».

---

## 3. Hồ sơ — gắn mã mở rộng

### 3.1 Khi còn mục mở rộng hiệu lực

1. Mở **Thêm / Sửa nhân viên** (hoặc hồ sơ tương đương).
2. Với ô / khối trường mở rộng: **chọn mã đã có** trên Cài đặt — không tự nghĩ mã mới trên màn này.
3. **Lưu** → thông báo thành công; **tải lại** vẫn thấy giá trị đúng mã danh mục.

Nếu cố gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục mục mở rộng trống

- Hệ thống hướng dẫn sang **Cài đặt** để thêm mục trước.
- **Không** tự tạo dữ liệu mẫu / seed để «có trường».
- Quản trị vẫn **được** thêm mã mới trên Cài đặt.

### 3.3 Chỉ đổi giá trị trên hồ sơ

Sửa nội dung giá trị của mã đã có **không** tự tạo thêm trường trộn mới. Muốn có mã mới → thêm trên Cài đặt trước.

---

## 4. Lưu ý vận hành

- Trang mô tả / tổng quan Cài đặt **không có** thao tác thêm mục mở rộng **không** đủ làm nguồn cấu hình trường.
- **Không** mở bảng định nghĩa trường riêng ngoài mục mở rộng trên các nhóm trường NS nêu trên.
- Loại giấy tờ / loại hình thuê / vị trí–phòng ban tập đoàn là luồng **riêng** — không gộp vào trường mở rộng này.
- Bản hướng dẫn này **không** đồng nghĩa toàn bộ nhân sự đã nghiệm thu vận hành.

---

## 5. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên Cài đặt | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Báo lỗi khi nhập mã tự nghĩ ra trên hồ sơ | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên Cài đặt trước |
| Danh mục trống trên hồ sơ | Vào Cài đặt thêm mục; không dùng dữ liệu giả |
| Ngừng mục nhưng hồ sơ cũ còn mã | Bình thường với lịch sử — mã đã ngừng không còn trong danh sách chọn mới |

---

*Hết chương 6d (DOC-DELTA trường mở rộng hồ sơ nhân sự — v0.1).*
