# HDSD — Chương 5b · Danh mục điểm GPS chấm công

| Mục | Nội dung |
|-----|----------|
| **Phân hệ** | Nhân sự — Chấm công |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục điểm GPS; chưa đủ HDSD toàn trụ chấm công) |
| **Đối tượng** | HCNS quản trị điểm GPS; NV / QL chấm GPS trên web (và mobile khi bật) |
| **Tham chiếu SRS** | FR-UC-BP-ATT-03d (khóa danh mục điểm GPS) |
| **Peer HDSD** | Chương 5 — Danh mục loại phép · Chương 5c — Danh mục ký hiệu công · Chương 5d — Danh mục ca làm việc (bốn chủ đề riêng — không gộp) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục điểm làm việc / vùng GPS** và cách **chấm GPS trong vùng**. **Không** khẳng định toàn bộ module chấm công / nghỉ phép đã sẵn sàng nghiệm thu; **không** hướng dẫn ký bảng công, miễn trừ đặc biệt, hay toàn bộ lịch ca; **không** thay chương 5 (loại phép).

---

## 1. Hai vai trò — không nhầm

| Vai trò | Được làm | Không được hiểu sai |
|---------|----------|---------------------|
| **Điểm GPS** (quản trị danh mục — Cài đặt chấm công / quy tắc GPS) | Thêm điểm mới (tên · tọa độ · bán kính); sửa; ngừng theo dõi | Không bị chặn «chỉ chọn điểm đã có» |
| **Chấm GPS** (vận hành) | Khi còn điểm hiệu lực: gửi vị trí trong bán kính | Không tự nghĩ tọa độ ngoài vùng rồi vẫn đủ công |

---

## 2. Quản trị danh mục — thêm điểm mới

1. Mở **Cài đặt chấm công** → khu vực **điểm GPS / vùng hợp lệ**.
2. Chọn **Thêm điểm** (hoặc tương đương).
3. Nhập **tên**, **vĩ độ**, **kinh độ**, **bán kính (m)**.
4. **Lưu** → danh sách có dòng mới.
5. **Tải lại** — điểm vẫn còn.

Nếu tọa độ / bán kính không hợp lệ: hệ thống từ chối với thông báo rõ; sửa rồi Lưu lại.

---

## 3. Chấm GPS theo vùng

### 3.1 Khi còn điểm hiệu lực và đã bật GPS

1. Mở màn chấm theo phương thức **GPS**.
2. Hệ thống lấy / yêu cầu **vĩ độ · kinh độ**.
3. Trong bán kính điểm hiệu lực → **Lưu / Check-in** thành công → bản ghi xuất hiện → **Tải lại** còn.
4. Ngoài mọi bán kính → hệ thống **từ chối** (ví dụ «ngoài vùng cho phép»); **không** ghi nhận đủ công vùng.

Nếu phương thức GPS đang bắt buộc vị trí mà **thiếu** tọa độ: hệ thống **từ chối** — không im lặng thành công. (Wire gửi phương thức GPS trên giao diện có thể đang hoàn thiện — vẫn không coi thiếu vị trí là đạt.)

### 3.2 Khi danh sách điểm hiệu lực trống

1. Chấm không bị từ chối vì «ngoài vùng» chỉ vì thiếu điểm.
2. Màn quản trị vẫn **Thêm điểm** được.
3. **Không** tự tạo điểm giả để «có vùng cho đẹp».

---

## 4. Ngừng theo dõi điểm

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tắt hiệu lực) cho điểm không còn dùng.
2. Điểm **không** còn trong tập vùng kiểm tra mặc định.
3. Chấm tại tọa độ cũ **không** còn khớp điểm đã ngừng.
4. Lịch sử chấm cũ **không** bị xóa chỉ vì ngừng điểm.

---

## 5. Lưu ý

- Danh sách tọa độ cấu hình cũ / mục trên **Cấu hình hệ thống** (nếu thấy) **không** thay thế danh mục điểm chuẩn khi kiểm vùng.
- **Loại phép** là danh mục / ô chọn **riêng** (chương 5) — **không** nhầm với **điểm GPS**.
- Gắn **mã điểm** trên phiếu chấm (nếu chưa thấy trên màn) = chưa mở — không tự nghĩ mã điểm ngoài danh mục.
- Hành trình chấm GPS trên **ứng dụng di động** toàn chuỗi = ngoài phạm vi bản hướng dẫn portal này.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được điểm mới | Kiểm tra tọa độ / bán kính; sửa rồi Lưu lại |
| Báo ngoài vùng khi chấm GPS | Đứng trong bán kính điểm hiệu lực hoặc cập nhật điểm trên quản trị |
| Báo thiếu vị trí khi chấm GPS | Bật GPS / cho phép vị trí; không bỏ qua bước gửi tọa độ |
| Điểm đã ngừng vẫn thấy trên list mặc định | Kiểm tra bộ lọc «gồm điểm ngừng»; list mặc định chỉ điểm hiệu lực |

*Hết chương 5b (DOC-DELTA danh mục điểm GPS — v0.1).*
