# HDSD — Chương 5d · Danh mục ca làm việc

| Mục | Nội dung |
|-----|----------|
| **Phân hệ** | Nhân sự — Chấm công |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục ca làm việc; chưa đủ HDSD toàn trụ chấm công) |
| **Đối tượng** | HCNS quản trị ca; HCNS / QL tạo đơn **Đổi ca** |
| **Tham chiếu SRS** | FR-UC-BP-PLT-01 (AC-PLT-ATT-SHIFT-01*) · FR-UC-BP-ATT-01 |
| **Peer HDSD** | Chương 5 — loại phép · 5b — điểm GPS · 5c — ký hiệu công (bốn chủ đề riêng — không gộp) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục ca làm việc** và cách **chọn ca trên đơn Đổi ca**. **Không** khẳng định toàn bộ module chấm công / nghỉ phép đã sẵn sàng nghiệm thu; **không** hướng dẫn ký bảng công, miễn trừ đặc biệt, hay lưới phân ca đầy đủ; **không** thay chương 5 / 5b / 5c.

---

## 1. Hai vai trò — không nhầm

| Vai trò | Được làm | Không được hiểu sai |
|---------|----------|---------------------|
| **Ca** (quản trị danh mục — Cài đặt chấm công / tab **Ca**) | Thêm ca mới hợp lệ (mã · tên · giờ vào/ra · hệ số); sửa; ngừng theo dõi | Không bị chặn «chỉ năm mã khóa cứng» |
| **Đổi ca** (vận hành) | Khi còn ca hiệu lực: **chọn** ca hiện tại / ca đề nghị từ danh sách hiệu lực | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 5d.1 — Tab Ca · danh sách]`

---

## 2. Quản trị danh mục — thêm ca mới

1. Mở **Cài đặt chấm công** → khu vực / tab **Ca** (hoặc nhãn tương đương trên pháp nhân).
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** ca mới, **tên hiển thị**, **giờ vào / giờ ra**, **hệ số** (nếu dùng) và các trường hợp lệ khác.
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — ca vẫn còn.

Nếu mã trùng hoặc giờ không hợp lệ: hệ thống từ chối với thông báo rõ; sửa rồi Lưu lại. Mục khung tập đoàn / Cài đặt `shifts` (nếu thấy) chỉ là **tham chiếu hợp nhất** — danh mục ca Nest theo đơn vị vẫn là nguồn sự thật vận hành.

---

## 3. Đơn đổi ca theo danh mục Nest

### 3.1 Khi còn ca hiệu lực

1. Mở **Chấm công → Đơn từ → Đổi ca** (hoặc nhãn tương đương).
2. Hệ thống lấy danh sách ca **hiệu lực** từ danh mục Nest (không tự nghĩ danh sách khóa cứng trên màn khi Nest còn phần tử).
3. Chọn ca hiện tại / ca đề nghị → **Lưu** thành công → danh sách hiện đúng mã / nhãn giờ → **Tải lại** còn.
4. Cố nhập / gửi mã ca **không** thuộc danh sách hiệu lực → hệ thống **từ chối**; **không** giữ mã lạ sau tải lại.

### 3.2 Khi danh sách ca hiệu lực trống

1. Ô chọn trống kèm hướng dẫn vào Cài đặt → tab **Ca**.
2. Màn quản trị vẫn **Thêm ca** được.
3. **Không** tự tạo ca giả để «có danh sách cho đẹp».
4. Danh sách khóa cứng trên màn (nếu còn) chỉ dùng tạm khi danh mục trống — **không** coi đó là nguồn sự thật khi đã có ca Nest.

---

## 4. Ngừng theo dõi ca

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tắt hiệu lực) cho ca không còn dùng.
2. Ca **không** còn trong danh sách chọn mặc định trên đơn đổi ca.
3. Đơn đổi ca lịch sử **vẫn** đọc được mã ca cũ (không mất lịch sử chỉ vì ngừng ca).
4. Quản trị có thể bật bộ lọc «gồm ca đã ngừng» để kiểm tra — list mặc định chỉ ca hiệu lực.

---

## 5. Lưu ý

- **Loại phép** (chương 5), **điểm GPS** (chương 5b) và **ký hiệu công** (chương 5c) là danh mục / ô chọn **riêng** — **không** nhầm với **ca làm việc**.
- Mục trên **Cấu hình hệ thống** / khung tập đoàn `shifts` (nếu thấy) **không** thay thế danh mục Nest chuẩn khi còn ca hiệu lực theo đơn vị.
- Ô chọn trên đơn **Đổi ca** gắn danh mục Nest có thể đang hoàn thiện trên giao diện — vẫn **không** coi danh sách khóa cứng làm nguồn sự thật khi danh mục Nest còn phần tử.
- Lưới phân ca / «Lịch ca» đầy đủ có thể thuộc giai đoạn sau — bản hướng dẫn này **không** bao phủ.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được ca mới trên tab Ca | Kiểm tra quy ước mã / trùng mã / giờ; sửa rồi Lưu lại |
| Lưu đổi ca bị từ chối vì mã lạ | Chọn ca thuộc danh sách hiệu lực hoặc thêm ca trên tab Ca rồi tải lại |
| Danh sách chọn trống | Thêm ca trên tab Ca; không tự bịa mã trên đơn đổi ca |
| Ca đã ngừng vẫn thấy trên list mặc định | Kiểm tra bộ lọc «gồm ca ngừng»; list mặc định chỉ ca hiệu lực |
| Nhầm với loại phép / điểm GPS / ký hiệu công | Dùng đúng tab / chương hướng dẫn tương ứng |

*Hết chương 5d (DOC-DELTA danh mục ca làm việc — v0.1).*
