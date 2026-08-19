# Chương 6e — Trạng thái nhân sự và lý do trạng thái (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006e |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục trạng thái / lý do NS; chưa đủ HDSD toàn trụ nhân sự) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Cài đặt HRM → **Trạng thái nhân sự** / **Lý do trạng thái** · Hồ sơ / danh sách nhân sự |
| **Đối tượng** | HCNS quản trị danh mục trạng thái; HCNS vận hành hồ sơ |
| **Tham chiếu SRS** | FR-UC-BP-PLT-01 (AC-PLT-EMP-STATUS-01*) |
| **Peer HDSD** | Chương 6 — Danh sách nhân sự · Chương 6d — Trường mở rộng hồ sơ NS |

**Phạm vi bản này:** chỉ hướng dẫn **danh mục trạng thái nhân sự** và **lý do trạng thái** trên Cài đặt, cùng cách chọn trạng thái / lý do trên **hồ sơ**. **Không** khẳng định toàn bộ module nhân sự đã sẵn sàng nghiệm thu; **không** thay chương 6; **không** gộp với loại hình thuê, trường mở rộng hay loại giấy tờ (đã có luồng riêng).

---

## 1. Hai việc khác nhau

| Việc | Trên màn nào | Được làm gì | Không được |
|------|--------------|-------------|------------|
| **Quản trị danh mục trạng thái / lý do** | Cài đặt → Trạng thái NV · Lý do trạng thái | Thêm mã mới hợp lệ; sửa nhãn/cờ; ngừng theo dõi | Bị chặn «chỉ chọn mã đã có» · giới hạn danh sách đóng |
| **Chọn trạng thái trên hồ sơ** | Thêm / Sửa nhân viên · đổi trạng thái | Khi còn mã hiệu lực: **chọn** trạng thái (và lý do khi bắt buộc) từ danh mục | Nhập mã / lý do chữ tự do làm nguồn sự thật |

Nguồn sự thật của danh mục là dữ liệu **theo đơn vị**; phân vùng danh mục cấp tập đoàn chỉ **tham chiếu hợp nhất chỉ đọc** — khi trùng mã thì dòng đơn vị được ưu tiên.

---

## 2. Quản trị — thêm mã trạng thái / lý do mới

1. Mở **Cài đặt** → **Trạng thái nhân sự**.
2. **Thêm** trạng thái: nhập mã (dạng chữ–số hợp lệ) + nhãn tiếng Việt + cờ (đang làm việc / trạng thái kết thúc / bắt buộc lý do…) → **Lưu**.
3. **Tải lại** — mã còn trên danh sách; form hồ sơ chọn được mã mới.
4. Với **Lý do trạng thái**: thêm mã lý do tương tự (có thể gắn áp dụng cho một số trạng thái).
5. **Ngừng theo dõi** mã không còn dùng → ẩn khỏi chọn trên hồ sơ; hồ sơ lịch sử **vẫn** đọc được mã cũ (không xóa cứng bắt buộc).

Nếu mã sai định dạng hoặc trùng mã đang hiệu lực: sửa rồi Lưu lại — **không** hiểu là «hệ thống cấm thêm mã mới».

---

## 3. Hồ sơ — chọn trạng thái và lý do

### 3.1 Khi còn mã trạng thái hiệu lực

1. Mở **Thêm / Sửa nhân viên** (hoặc thao tác đổi trạng thái).
2. Ô **Trạng thái**: **chọn mã đã có** trên Cài đặt — không tự nghĩ mã mới trên màn này.
3. Nếu trạng thái **bắt buộc lý do** (hoặc còn lý do hiệu lực cho chuyển trạng thái đó): chọn **lý do** từ danh mục.
4. **Lưu** → thông báo thành công; **tải lại** vẫn thấy trạng thái + nhãn đúng danh mục.

Nếu cố gửi trạng thái / lý do **không** thuộc danh mục: hệ thống **từ chối lưu** và thông báo rõ; sau tải lại **không** giữ mã lạ.

### 3.2 Khi danh mục trạng thái trống

- Hệ thống hướng dẫn sang **Cài đặt** để thêm mã trước.
- **Không** tự tạo dữ liệu mẫu / seed để «có trạng thái».
- Quản trị vẫn **được** thêm mã mới trên Cài đặt.

### 3.3 Chuyển trạng thái theo luật

Mở **danh sách mã** trạng thái không có nghĩa mọi luật chuyển trạng thái đều mở: các bước chuyển hợp lệ (ví dụ không cho quay ngược trái phép) vẫn do phần mềm kiểm soát.

---

## 4. Lưu ý vận hành

- Trang mô tả / tổng quan Cài đặt **không có** thao tác thêm mã **không** đủ làm nguồn danh mục trạng thái.
- Trạng thái nhân sự **khác** loại hình thuê, trường mở rộng, loại giấy tờ — **không** gộp danh mục.
- Danh mục trạng thái là **mở** — không có trần số lượng, không khóa cứng danh sách «đang hoạt động / nghỉ» cố định.
- Bản hướng dẫn này **không** đồng nghĩa toàn bộ nhân sự đã nghiệm thu vận hành.

---

## 5. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| Không lưu được mã trạng thái mới trên Cài đặt | Kiểm tra mã trùng / sai định dạng; sửa rồi Lưu lại |
| Báo lỗi khi nhập trạng thái / lý do tự nghĩ trên hồ sơ | Đúng quy tắc — chọn từ danh mục hoặc tạo mã trên Cài đặt trước |
| Trạng thái bắt buộc lý do mà chưa chọn | Chọn lý do từ danh mục lý do; nếu danh mục lý do trống và không bắt buộc thì bỏ qua |
| Danh mục trạng thái trống trên hồ sơ | Vào Cài đặt thêm mã; không dùng dữ liệu giả |
| Ngừng mã nhưng hồ sơ cũ còn mã | Bình thường với lịch sử — mã đã ngừng không còn trong danh sách chọn mới |

---

*Hết chương 6e (DOC-DELTA trạng thái nhân sự và lý do trạng thái — v0.1).*
