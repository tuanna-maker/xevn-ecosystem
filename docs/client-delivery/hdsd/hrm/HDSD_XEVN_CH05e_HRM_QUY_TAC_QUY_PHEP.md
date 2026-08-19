# Chương 5e — Chấm công & Nghỉ phép (HRM) · Quy tắc quỹ phép (chính sách tích lũy)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-005e |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi quy tắc quỹ phép; chưa đủ HDSD toàn trụ chấm công / nghỉ phép) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Chấm công** → **Cấu hình** |
| **Đối tượng** | HCNS / C&B quản trị quy tắc quỹ phép; HCNS cấp / điều chỉnh quỹ theo quy tắc |
| **Tham chiếu SRS** | FR-UC-BP-ATT-04 · 04b · 05 · 09 (quy tắc quỹ / chính sách tích lũy phép) |
| **Peer HDSD** | Chương 5 — Danh mục **loại phép** · Chương 5b — Danh mục **điểm GPS** · Chương 5c — Danh mục **ký hiệu công** · Chương 5d — Danh mục **ca làm việc** (các chủ đề riêng — không gộp) |

**Phạm vi bản này:** chỉ hướng dẫn **quy tắc quỹ phép (chính sách tích lũy)** — cách quản trị quy tắc và cách chọn tham số quỹ khi **cấp / điều chỉnh** cho nhân viên. **Không** khẳng định toàn bộ module chấm công / nghỉ phép đã sẵn sàng nghiệm thu; **không** khẳng định việc **tự động tích lũy / cấp phát** theo quy tắc đã chạy thật; **không** hướng dẫn ký bảng công, miễn trừ đặc biệt hay toàn bộ lịch ca.

**Phân biệt với danh mục loại phép:** quy tắc quỹ **gắn với** loại phép nhưng **không** thay thế danh mục loại phép. Hướng dẫn thêm / sửa **mã loại phép** nằm ở [`HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`](./HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md); bản này chỉ nói về **quy tắc tích lũy** cho các loại phép đã có.

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai màn hình — đừng nhầm

| Màn | Việc được làm | Việc không làm |
|-----|----------------|----------------|
| **Quy tắc quỹ phép** (quản trị — Chấm công / Cấu hình → tab Quy tắc quỹ phép) | Thêm quy tắc mới hợp lệ; đặt phiên bản theo thời điểm hiệu lực; gắn quy tắc vào loại phép; ngừng theo dõi (ẩn mềm) | Không bị chặn «chỉ dùng quy tắc có sẵn»; không xóa cứng quy tắc còn số dư / lịch sử |
| **Cấp / điều chỉnh quỹ** (trên nghiệp vụ Nghỉ phép) | Khi loại phép còn quy tắc hiệu lực: **chọn tham số từ quy tắc đã phát hành** | Không nhập tay chế độ tích lũy / số ngày tự do làm nguồn sự thật |

`[Hình 5e.1 — Tab Quy tắc quỹ phép · danh sách phiên bản]`

---

## 2. Quản trị quy tắc quỹ phép — thêm quy tắc mới

Quy tắc quỹ là **danh mục chuẩn của hệ thống nhân sự**, có **phiên bản theo thời điểm hiệu lực** và **gắn với một loại phép** đang hiệu lực.

1. Vào **Chấm công** / **Cấu hình** → tab **Quy tắc quỹ phép** (hoặc nhãn tương đương trên pháp nhân).
2. Chọn **Thêm** (hoặc tương đương).
3. Chọn **loại phép** cần gắn (loại phải đang hiệu lực trong danh mục loại phép).
4. Nhập tham số quy tắc: chế độ tích lũy, số ngày / giờ theo năm, đơn vị (ngày / giờ), cờ ứng / mang sang và **khoảng thời điểm hiệu lực**.
5. Bấm **Lưu**.
6. Kiểm tra dòng quy tắc mới xuất hiện trên danh sách; mở chi tiết loại phép thấy quy tắc đã gắn.
7. **Tải lại trang** — quy tắc vẫn còn.

Có thể mở **nhiều quy tắc (N+1)** cho cùng một loại phép theo các khoảng hiệu lực khác nhau. Nếu quy tắc gắn vào **loại phép không có trong danh mục hiệu lực**, hoặc trùng khoảng hiệu lực đang bật: hệ thống báo lỗi trên form; không tạo bản ghi.

`[Hình 5e.2 — Hộp thoại thêm quy tắc quỹ theo loại phép]`

---

## 3. Ngừng theo dõi một quy tắc (ẩn mềm)

1. Trên danh sách **Quy tắc quỹ phép**, chọn quy tắc cần ngừng.
2. Chọn **Ngừng theo dõi** (hoặc tương đương) → xác nhận.
3. Quy tắc **ẩn** khỏi phần chọn mặc định; **số dư và lịch sử đã cấp vẫn còn**.
4. Bật bộ lọc **Gồm mục đã ngừng** để xem lại quy tắc cũ khi cần đối chiếu.

Không xóa cứng quy tắc khi còn số dư / lịch sử tham chiếu — chỉ ẩn mềm để tránh mất dấu vết cấp phát.

`[Hình 5e.3 — Ngừng theo dõi và bộ lọc gồm mục đã ngừng]`

---

## 4. Cấp / điều chỉnh quỹ theo quy tắc đã phát hành

### 4.1 Khi loại phép còn quy tắc hiệu lực

1. Mở nghiệp vụ **Nghỉ phép** → **Cấp / điều chỉnh quỹ** (hoặc tương đương) cho nhân viên / nhóm.
2. Chọn **loại phép** → hệ thống hiển thị **quy tắc quỹ đang phát hành** cho loại đó.
3. **Chọn tham số từ quy tắc đã phát hành** (chế độ, số ngày / giờ, mang sang). Không nhập tay tham số ngoài quy tắc.
4. Xác nhận → **Lưu**.
5. Kiểm tra số dư nhân viên cập nhật đúng theo quy tắc.
6. **Tải lại** — số dư và tham chiếu quy tắc vẫn còn.

### 4.2 Nếu cố nhập tham số ngoài quy tắc

- Hệ thống **từ chối** trên trường / cảnh báo rõ; **không** lưu tham số lạ.
- Đây là ràng buộc nghiệp vụ để mọi số dư đều bám một quy tắc đã phát hành, tránh mỗi nơi một con số.

`[Hình 5e.4 — Chọn tham số từ quy tắc đã phát hành khi cấp quỹ]`

---

## 5. Khi chưa có quy tắc hiệu lực

1. Nếu loại phép **chưa có** quy tắc quỹ nào đang hiệu lực, phần cấp theo quy tắc hiển thị **trạng thái trống** kèm gợi ý tạo quy tắc.
2. **Không** tự bịa tham số; **không** cần nhập dữ liệu mẫu để «có cái mà chọn».
3. HCNS vào màn **Quản trị quy tắc quỹ phép** tạo quy tắc trước (mục 2), sau đó quay lại cấp quỹ.

`[Hình 5e.5 — Trạng thái trống khi chưa có quy tắc]`

---

## 6. Phạm vi & giới hạn (đọc kỹ)

- Bản này hướng dẫn **quản trị quy tắc quỹ** và **chọn tham số khi cấp / điều chỉnh** — **không** khẳng định module chấm công / nghỉ phép đã nghiệm thu vận hành.
- **Tự động tích lũy / cấp phát định kỳ** theo quy tắc là **giai đoạn sau**; bản này không khẳng định đã chạy thật.
- Cấu hình hệ thống và quy tắc **chấm công – GPS** **không** phải nguồn quy tắc quỹ; nguồn quy tắc quỹ là danh mục **Quy tắc quỹ phép** của hệ thống nhân sự.
- Quy tắc quỹ **khác** danh mục loại phép, ký hiệu công, ca làm việc và điểm GPS — mỗi chủ đề có màn quản trị riêng.

---

## 7. Lưu ý nhanh

| Tình huống | Xử lý đúng |
|------------|------------|
| Cần đổi số ngày cấp năm nay | Tạo **quy tắc phiên bản mới** theo khoảng hiệu lực, không sửa đè lịch sử |
| Loại phép cũ không dùng nữa | **Ngừng theo dõi** quy tắc (ẩn mềm); số dư cũ vẫn tra được |
| Chưa thấy quy tắc để chọn khi cấp quỹ | Vào quản trị tạo quy tắc trước; không nhập tay tham số |
| Muốn nhập nhanh một con số ngoài quy tắc | Không hỗ trợ — hệ thống từ chối để giữ một nguồn quy tắc |

---

*Hết Chương 5e — quy tắc quỹ phép (chính sách tích lũy) là danh mục chuẩn có phiên bản, gắn loại phép; quản trị mở quy tắc mới ≠ nhập tay tham số quỹ trên nghiệp vụ; ngừng theo dõi = ẩn mềm; tự động tích lũy là giai đoạn sau — không đồng nghĩa module chấm công / nghỉ phép đã nghiệm thu vận hành.*