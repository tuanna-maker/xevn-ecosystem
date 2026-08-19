# HDSD — Chương 5c · Danh mục ký hiệu công

| Mục | Nội dung |
|-----|----------|
| **Phân hệ** | Nhân sự — Chấm công |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục ký hiệu công; chưa đủ HDSD toàn trụ chấm công) |
| **Đối tượng** | HCNS quản trị ký hiệu công; HCNS / QL ghi công trên bảng ghi công |
| **Tham chiếu SRS** | FR-UC-BP-PLT-01 (AC-PLT-ATT-CODE-01*) · FR-UC-BP-ATT-10 (phễu — không đổi luật đếm ở bản này) |
| **Peer HDSD** | Chương 5 — loại phép · Chương 5b — điểm GPS · Chương 5d — ca làm việc (bốn chủ đề riêng — không gộp) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục ký hiệu công** (mã ngày công) và cách **chọn mã trên bảng ghi công**. **Không** khẳng định toàn bộ module chấm công / nghỉ phép đã sẵn sàng nghiệm thu; **không** hướng dẫn ký bảng công, miễn trừ đặc biệt, hay toàn bộ lịch ca; **không** thay chương 5 (loại phép) hay 5b (điểm GPS).

---

## 1. Hai vai trò — không nhầm

| Vai trò | Được làm | Không được hiểu sai |
|---------|----------|---------------------|
| **Ký hiệu công** (quản trị danh mục — Cài đặt chấm công / tab Ký hiệu công) | Thêm mã mới hợp lệ (ví dụ công tác, làm từ xa, nửa ngày) kèm nhãn / ký hiệu / cờ mô tả; sửa; ngừng theo dõi | Không bị chặn «chỉ chọn bốn mã sẵn» |
| **Bảng ghi công** (vận hành) | Khi còn mã hiệu lực: **chọn** mã từ danh sách hiệu lực | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 5c.1 — Tab Ký hiệu công · danh sách]`

---

## 2. Quản trị danh mục — thêm mã mới

1. Mở **Cài đặt chấm công** → khu vực **Ký hiệu công** (hoặc nhãn tương đương trên pháp nhân).
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** mới (đúng quy ước chữ/số), **tên hiển thị**, **ký hiệu** (nếu dùng), và các cờ mô tả cần thiết (ví dụ tính công / có lương…).
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — mã vẫn còn.

Nếu mã trùng hoặc sai quy ước: hệ thống từ chối với thông báo rõ; sửa rồi Lưu lại. Mục khung tập đoàn (nếu thấy) chỉ là **tham chiếu hợp nhất** — danh mục chuẩn theo đơn vị vẫn là nơi mở mã vận hành.

---

## 3. Ghi công theo ký hiệu

### 3.1 Khi còn mã hiệu lực

1. Mở **Chấm công → bảng ghi công** (hoặc lưới bản ghi tương đương).
2. Hệ thống lấy danh sách mã **hiệu lực** (không tự nghĩ danh sách khóa cứng trên màn khi danh mục Nest còn phần tử).
3. Chọn mã → **Lưu** thành công → danh sách hiện đúng mã + nhãn / ký hiệu → **Tải lại** còn.
4. Cố nhập / gửi mã **không** thuộc danh sách hiệu lực → hệ thống **từ chối**; **không** giữ mã lạ sau tải lại.

### 3.2 Khi danh sách mã hiệu lực trống

1. Ô chọn trống kèm hướng dẫn vào Cài đặt → Ký hiệu công.
2. Màn quản trị vẫn **Thêm mã** được.
3. **Không** tự tạo mã giả để «có danh sách cho đẹp».
4. Bản đồ nhãn khóa cứng trên màn (nếu còn) chỉ dùng tạm khi danh mục trống — **không** coi đó là nguồn sự thật khi đã có mã Nest.

---

## 4. Ngừng theo dõi mã

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tắt hiệu lực) cho mã không còn dùng.
2. Mã **không** còn trong danh sách chọn mặc định trên bảng ghi công.
3. Bản ghi lịch sử **vẫn** đọc được mã cũ (không mất lịch sử chỉ vì ngừng mã).

---

## 5. Lưu ý

- **Loại phép** (chương 5), **điểm GPS** (chương 5b) và **ca làm việc** (chương 5d) là danh mục / ô chọn **riêng** — **không** nhầm với **ký hiệu công**.
- Mục trên **Cấu hình hệ thống** / khung tập đoàn (nếu thấy) **không** thay thế danh mục Nest chuẩn khi còn mã hiệu lực theo đơn vị.
- Mở thêm mã ký hiệu **không** tự đổi cách **đếm / tổng hợp** giờ công trên bảng công ở giai đoạn này.
- Wire ô chọn trên bảng ghi công gắn danh mục Nest có thể đang hoàn thiện trên giao diện — vẫn **không** coi danh sách khóa cứng làm nguồn sự thật khi danh mục Nest còn phần tử.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên Cài đặt | Kiểm tra quy ước mã / trùng mã; sửa rồi Lưu lại |
| Lưu bản ghi bị từ chối vì mã lạ | Chọn mã thuộc danh sách hiệu lực hoặc thêm mã trên Cài đặt rồi tải lại |
| Danh sách chọn trống | Thêm mã trên Cài đặt; không tự bịa mã trên bảng ghi công |
| Mã đã ngừng vẫn thấy trên list mặc định | Kiểm tra bộ lọc «gồm mã ngừng»; list mặc định chỉ mã hiệu lực |
| Nhầm với loại phép / điểm GPS | Dùng đúng tab / chương hướng dẫn tương ứng |

*Hết chương 5c (DOC-DELTA danh mục ký hiệu công — v0.1).*
