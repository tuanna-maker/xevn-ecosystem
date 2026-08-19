# Chương 5 — Chấm công & Nghỉ phép (HRM) · Danh mục loại phép

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-005 |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục loại phép; chưa đủ HDSD toàn trụ chấm công) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Chấm công** |
| **Đối tượng** | HCNS quản trị danh mục loại phép; NV / QL / HCNS nộp đơn nghỉ |
| **Tham chiếu SRS** | FR-UC-BP-ATT-04 · 05b · 07 · 09 (khóa danh mục loại phép) |
| **Peer HDSD** | Chương 5b — Danh mục **điểm GPS** · Chương 5c — Danh mục **ký hiệu công** · Chương 5d — Danh mục **ca làm việc** (bốn chủ đề riêng — không gộp) · Chương 5f — Danh mục **loại tăng ca** |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục loại phép** và cách chọn loại trên form **Nghỉ phép**. **Không** khẳng định toàn bộ module chấm công / nghỉ phép đã sẵn sàng nghiệm thu; **không** hướng dẫn ký bảng công, miễn trừ đặc biệt, hay toàn bộ lịch ca.

**DOC-DELTA điểm GPS:** hướng dẫn tách quản trị vs chấm trong vùng nằm ở [`HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md`](./HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md) — **không** thay thế chương này; **không** khẳng định toàn module chấm công đã nghiệm thu.

**DOC-DELTA ký hiệu công:** hướng dẫn tách quản trị vs chọn mã trên bảng ghi công nằm ở [`HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md`](./HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md) — **không** thay thế chương này; **không** khẳng định toàn module chấm công đã nghiệm thu.

**DOC-DELTA ca làm việc:** hướng dẫn tách quản trị vs chọn ca trên đơn Đổi ca nằm ở [`HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md`](./HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md) — **không** thay thế chương này; **không** khẳng định toàn module chấm công đã nghiệm thu.

**DOC-DELTA loại tăng ca:** hướng dẫn tách quản trị danh mục loại tăng ca vs chọn loại trên đơn tăng ca (hệ số hiển thị = gợi ý ≠ công thức lương) nằm ở [`HDSD_XEVN_CH05f_HRM_DANH_MUC_LOAI_TANG_CA.md`](./HDSD_XEVN_CH05f_HRM_DANH_MUC_LOAI_TANG_CA.md) — **không** thay thế chương này; **không** khẳng định toàn module chấm công / bảng lương đã nghiệm thu.

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai màn hình — đừng nhầm

| Màn | Việc được làm | Việc không làm |
|-----|----------------|----------------|
| **Loại phép** (quản trị danh mục — Cài đặt / tab Loại phép ATT) | Thêm mã loại phép mới hợp lệ; sửa nhãn / cờ; ngừng theo dõi | Không bị chặn «chỉ chọn mã đã có» |
| **Nghỉ phép** (nộp đơn) | Khi danh mục còn phần tử hiệu lực: **chọn** loại từ danh sách | Không nhập mã chữ tự do làm nguồn sự thật |

`[Hình 5.1 — Tab Loại phép · danh sách]`

---

## 2. Quản trị danh mục — thêm mã mới

1. Vào **Chấm công** / **Cài đặt** → tab **Loại phép** (hoặc nhãn tương đương trên pháp nhân).
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** mới (đúng quy ước chữ/số), **tên hiển thị**, nhóm/loại và các cờ cần thiết (có lương, mang sang, ốm…).
4. Bấm **Lưu**.
5. Kiểm tra dòng mới xuất hiện trên danh sách.
6. **Tải lại trang** — mã vẫn còn.

Nếu mã trùng hoặc sai định dạng: hệ thống báo lỗi trên form; không tạo bản ghi.

`[Hình 5.2 — Hộp thoại thêm loại phép]`

---

## 3. Chọn loại trên form Nghỉ phép

### 3.1 Khi danh mục còn phần tử hiệu lực

1. Mở **Chấm công** → **Nghỉ phép** → **Tạo yêu cầu nghỉ** (hoặc tương đương).
2. Mở **ô chọn loại phép** — danh sách lấy từ danh mục loại phép chuẩn (không lấy danh mục mở rộng trên Cấu hình hệ thống làm nguồn duy nhất).
3. Chọn mã đã có → xem **panel quỹ** theo loại (số dư / giữ chỗ dự kiến).
4. Nhập khoảng nghỉ → **Gửi** / **Lưu**.
5. Kiểm tra đơn hiển thị đúng loại.
6. **Tải lại** — loại vẫn thuộc danh mục (không phát sinh mã lạ).

Nếu cố nhập / gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; **không** giữ chỗ quỹ với mã lạ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục trống

- Ô chọn trống trung thực kèm hướng dẫn tạo trên tab **Loại phép**.
- **Không** dùng dữ liệu giả chỉ để «có gì chọn».
- Vẫn có thể thêm mã mới ở màn quản trị (mục 2).

`[Hình 5.3 — Chọn loại trên form Nghỉ phép]`

---

## 4. Nghỉ ốm và chứng từ

1. Chọn loại nghỉ có tính chất ốm **trong danh mục** (không tự nghĩ mã ngoài danh sách).
2. Nếu quy tắc yêu cầu chứng từ theo số ngày / loại: đính kèm đủ trước khi gửi.
3. Thiếu chứng từ bắt buộc → hệ thống từ chối theo quy tắc đính kèm — **khác** với từ chối vì mã loại không thuộc danh mục.

---

## 5. Ngừng theo dõi loại phép

1. Trên danh mục, chọn **Ngừng theo dõi** (hoặc tương đương) cho mã không còn dùng.
2. Mã **không** còn trong danh sách chọn mặc định trên đơn mới.
3. Đơn / quỹ lịch sử vẫn đọc được mã đã gắn trước đó.

---

## 6. Lưu ý vận hành

- Danh mục mở rộng trên **Cấu hình hệ thống** (nếu thấy) **không** thay thế danh mục loại phép chuẩn khi chọn loại trên **Nghỉ phép**.
- Hướng dẫn này **không** thay cho quy trình duyệt đơn, ký bảng công, hay miễn trừ đặc biệt và **không** khẳng định đã chạy thử toàn bộ trụ chấm công.
- Panel quỹ chỉ **đọc** theo loại đã chọn — không tự sửa số dư tay.

---

## 7. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên danh mục | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Không chọn được loại trên form Nghỉ phép | Kiểm tra đã tạo mã trên tab Loại phép chưa; tải lại danh sách |
| Báo lỗi khi nhập mã tự nghĩ ra | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên quản trị trước |
| Danh sách chọn trống | Tạo mã trên quản trị; không yêu cầu kỹ thuật viên «cấy» dữ liệu giả |
| Báo thiếu chứng từ khi nghỉ ốm | Bổ sung file theo quy tắc — không nhầm với lỗi «mã loại không thuộc danh mục» |

---

*Hết chương 5 (DOC-DELTA danh mục loại phép — v0.1).*
