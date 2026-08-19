# Chương 6f — Danh mục chức danh / vị trí (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006f |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi chức danh; chưa đủ HDSD toàn trụ nhân sự) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Cài đặt HRM → danh mục chức danh (đồng bộ khung tập đoàn khi có) · Hồ sơ nhân sự · Lịch sử công tác · Quyết định bổ nhiệm / thuyên chuyển |
| **Đối tượng** | HCNS quản trị danh mục; HCNS vận hành hồ sơ và lịch sử công tác |
| **Tham chiếu SRS** | FR-UC-BP-PLT-01 · FR-UC-BP-CORE-01a · AC-PLT-EMP-01* |
| **Peer HDSD** | Chương 6 — Danh sách nhân sự (vận hành hồ sơ tổng quát) |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục chức danh** trên Cài đặt / đồng bộ khung tập đoàn và cách **chọn mã chức danh** trên hồ sơ / lịch sử công tác. **Không** khẳng định toàn bộ module nhân sự đã sẵn sàng nghiệm thu; **không** thay chương 6; phòng ban xem chương 6g; **không** gộp với trạng thái nhân sự hay trường mở rộng.

---

## 1. Hai việc khác nhau

| Việc | Trên màn nào | Được làm gì | Không được |
|------|--------------|-------------|------------|
| **Quản trị / đồng bộ danh mục** | Cài đặt → chức danh · hoặc đồng bộ khung tập đoàn | Thêm mã chức danh mới hợp lệ; sửa nhãn; ngừng theo dõi; nhận mã từ khung đã công bố | Bị chặn «chỉ chọn mã đã có trong danh sách khởi tạo» |
| **Chọn chức danh trên nghiệp vụ** | Thêm / Sửa nhân viên · lịch sử công tác · quyết định gắn chức danh | Khi còn mã hiệu lực: **chọn** từ danh mục | Nhập chữ tự do làm nguồn sự thật · tự nghĩ mã mới trên màn này |

Sau khi thêm hoặc đồng bộ mã đang hiệu lực, form hồ sơ / lịch sử công tác phải chọn được mã đó — tải lại vẫn còn.

---

## 2. Quản trị — thêm hoặc đồng bộ mã chức danh

1. Mở **Cài đặt** → **danh mục chức danh** (hoặc thao tác đồng bộ khung tập đoàn khi được phân quyền).
2. **Thêm** mã mới: nhập mã (dạng chữ–số hợp lệ) + nhãn tiếng Việt → **Lưu**; hoặc nhận mã mới sau đồng bộ.
3. **Tải lại** — mã còn trên danh sách; form nghiệp vụ chọn được mã mới.
4. **Ngừng theo dõi** mã không còn dùng → mã ẩn khỏi chọn mới; dòng lịch sử / hồ sơ cũ **có thể còn** mã đã ngừng (không xóa cứng bắt buộc).

Nếu mã sai định dạng hoặc trùng mã đang hiệu lực: sửa rồi Lưu lại — **không** hiểu là «hệ thống cấm thêm mã mới».

---

## 3. Hồ sơ / lịch sử công tác — chọn chức danh

### 3.1 Khi còn mã chức danh hiệu lực

1. Mở **Thêm / Sửa nhân viên**, **lịch sử công tác**, hoặc quyết định có gắn chức danh.
2. Ô chức danh / vị trí: **chọn mã đã có** trên danh mục — không tự nghĩ mã mới trên màn này.
3. **Lưu** → thông báo thành công; **tải lại** vẫn thấy đúng mã / nhãn danh mục.

Nếu cố gửi mã **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục chức danh trống

- Hệ thống hướng dẫn sang **Cài đặt** (hoặc đồng bộ khung) để có mã trước.
- **Không** tự tạo dữ liệu mẫu để «có chức danh».
- Quản trị vẫn **được** thêm / đồng bộ mã mới trên Cài đặt.

### 3.3 Ngừng mã nhưng hồ sơ cũ còn

Bình thường với lịch sử — mã đã ngừng không còn trong danh sách chọn mới; dòng cũ vẫn đọc được.

---

## 4. Lưu ý vận hành

- Nguồn sự thật chức danh = danh mục Cài đặt / khung tập đoàn đã đồng bộ — **không** dùng bảng chức danh riêng ngoài danh mục này làm nguồn thay thế.
- **Không** gộp chức danh vào trạng thái nhân sự, lý do trạng thái, trường mở rộng hồ sơ, loại giấy tờ hay loại hình thuê.
- Phòng ban dùng cùng nguyên tắc chọn từ danh mục — xem [`HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md`](./HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md).
- Bản hướng dẫn này **không** đồng nghĩa toàn bộ nhân sự đã nghiệm thu vận hành.

---

## 5. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã mới trên Cài đặt | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Báo lỗi khi nhập chữ tự nghĩ ra trên hồ sơ / lịch sử | Đúng quy tắc — chọn từ danh mục hoặc tạo / đồng bộ mã trên Cài đặt trước |
| Danh mục trống trên form | Vào Cài đặt thêm hoặc đồng bộ; không dùng dữ liệu giả |
| Ngừng mã nhưng hồ sơ / lịch sử cũ còn mã | Bình thường — mã đã ngừng không còn trong danh sách chọn mới |

---

*Hết chương 6f (DOC-DELTA danh mục chức danh — v0.1).*
