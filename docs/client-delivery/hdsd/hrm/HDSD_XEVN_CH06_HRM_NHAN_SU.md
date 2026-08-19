# Chương 6 — Danh sách nhân sự (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006 |
| **Phiên bản** | 1.0 (Markdown — placeholder ảnh) |
| **Ngày hiệu lực** | 03/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Danh sách nhân sự** (menu **Nhân sự**) |
| **Route embed** | `…/command-center/hrm/employees` · độc lập HRM: `/hr/employees` |
| **Đối tượng** | HRBP, HR tổng hợp, quản lý có quyền xem/sửa hồ sơ trong phạm vi công ty |
| **Tham chiếu SRS** | UC-HRM-21 · §15 Hồ sơ nhân viên · FR-HRM-IM-01 (nhập Excel) · quản lý trực tiếp FR-UC-H01 |

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md) (đăng nhập cổng, phạm vi công ty).

**DOC-DELTA trường mở rộng NS:** hướng dẫn tách quản trị mục mở rộng trên Cài đặt vs gắn mã trên hồ sơ nằm ở [`HDSD_XEVN_CH06d_HRM_TRUONG_MO_RONG_NS.md`](./HDSD_XEVN_CH06d_HRM_TRUONG_MO_RONG_NS.md) — **không** thay thế chương này; **không** khẳng định toàn module nhân sự đã nghiệm thu.

**DOC-DELTA trạng thái / lý do NS:** hướng dẫn danh mục **trạng thái nhân sự** và **lý do trạng thái** (quản trị mở mã trên Cài đặt vs chọn trạng thái trên hồ sơ) nằm ở [`HDSD_XEVN_CH06e_HRM_TRANG_THAI_NS.md`](./HDSD_XEVN_CH06e_HRM_TRANG_THAI_NS.md) — **không** thay thế chương này; **không** khẳng định toàn module nhân sự đã nghiệm thu.

**DOC-DELTA chức danh / vị trí:** hướng dẫn danh mục **chức danh** (Cài đặt / đồng bộ khung tập đoàn vs chọn trên hồ sơ / lịch sử công tác) nằm ở [`HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md`](./HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md) — **không** thay thế chương này; **không** khẳng định toàn module nhân sự đã nghiệm thu.

**DOC-DELTA phòng ban / bộ phận:** hướng dẫn danh mục **phòng ban** (Cài đặt / đồng bộ khung tập đoàn vs chọn trên hồ sơ / lịch sử công tác) nằm ở [`HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md`](./HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md) — **không** thay thế chương này; **không** khẳng định toàn module nhân sự đã nghiệm thu.

**DOC-DELTA thư viện điều khoản HĐ:** hướng dẫn nội dung điều khoản có phiên bản nằm ở [`HDSD_XEVN_CH06h_HRM_THU_VIEN_DIEU_KHOAN_HD.md`](./HDSD_XEVN_CH06h_HRM_THU_VIEN_DIEU_KHOAN_HD.md) — **không** thay thế chương này; **không** khẳng định module hợp đồng / bản in đã nghiệm thu.

**DOC-DELTA danh mục mẫu HĐ (catalog mở):** hướng dẫn mở mẫu N+1 / mã thứ chín trở lên · tám mã khởi tạo ≠ trần · chọn mẫu trên nghiệp vụ ≠ tạo mã mới · đóng băng mã khi lưu phiên bản in nằm ở [`HDSD_XEVN_CH06i_HRM_DANH_MUC_MAU_HD.md`](./HDSD_XEVN_CH06i_HRM_DANH_MUC_MAU_HD.md) — **không** thay thế chương này; **không** khẳng định module hợp đồng / bản in đã nghiệm thu.

---

## 1. Giới thiệu

Module **Danh sách nhân sự** là điểm vào chính để:

- Tra cứu, lọc và phân trang danh sách nhân viên trong **phạm vi công ty** đang chọn.
- **Tạo mới** hoặc **sửa** thông tin cốt lõi qua hộp thoại nhiều tab.
- **Nhập** danh sách từ Excel (xem trước trước khi ghi) và **xuất** báo cáo theo cột đã chọn.
- Mở **hồ sơ chi tiết** (nhiều tab: hợp đồng, lương, đào tạo, gia đình, …).
- **Xóa mềm** (ẩn khỏi danh sách đang làm việc) và **khôi phục** khi cần.

`[Hình 6.0 — Màn danh sách nhân sự]`

---

## 2. Màn danh sách

### 2.1. Vào màn hình

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | Đăng nhập Cổng Web (ví dụ tài khoản điều hành tập đoàn) | Vào Command Center, không báo lỗi đồng bộ Nhân sự |
| 2 | Chọn **tenant / công ty** nếu hệ thống hỏi | Phạm vi dữ liệu khớp công ty đã chọn |
| 3 | Mở tab hoặc menu **Nhân sự** | Hiển thị bảng danh sách; tiêu đề kèm tổng số bản ghi (nếu API trả về) |

**Lưu ý:** Nếu bảng trống nhưng có banner lỗi đỏ hoặc «Sync ERROR», coi là **chưa đạt** — kiểm tra dịch vụ Nhân sự và phạm vi (xem tài liệu pilot mục xử lý sự cố).

### 2.2. Tìm kiếm và bộ lọc

| Thành phần | Cách dùng | Ghi chú |
|------------|-----------|---------|
| **Tìm kiếm** | Gõ họ tên hoặc từ khóa; chờ hệ thống cập nhật danh sách | Lọc phía máy chủ; không cần bấm Enter |
| **Phòng ban** | Chọn một phòng ban trên danh mục | Lọc trên trang hiện tại theo tên phòng ban hiển thị |
| **Trạng thái** | Chọn *Đang làm*, *Thử việc*, *Ngừng*, … | Badge trạng thái hiển thị bằng nhãn tiếng Việt |

### 2.3. Bảng dữ liệu

| Cột (tham khảo) | Ý nghĩa |
|-----------------|--------|
| Mã NV | Mã định danh nội bộ; bấm dòng để mở hồ sơ |
| Họ tên | Tên đầy đủ; có thể kèm email phụ |
| Thông tin công ty | Tên công ty / đơn vị (nhãn hiển thị, không phải mã kỹ thuật) |
| Phòng ban · Chức vụ | Theo danh mục tập đoàn đã đồng bộ |
| Ngày vào làm | Định dạng **dd/MM/yyyy**; nếu chưa có → dấu «—» |
| Trạng thái | Badge màu theo trạng thái làm việc |

**Phân trang:** dùng nút trang trước / sau; dòng chữ «m–n / tổng» phải khớp số dòng đang xem.

### 2.4. Thao tác trên từng dòng

| Thao tác | Mô tả |
|----------|--------|
| **Bấm dòng** (ngoài menu ⋯) | Mở **hồ sơ chi tiết** `/employees/:id` |
| **⋯ → Xem** | Mở hồ sơ (không xóa) |
| **⋯ → Sửa** | Mở hộp thoại sửa (nếu được phân quyền) |
| **⋯ → Xóa** | Mở hộp thoại xác nhận **xóa mềm** (mục 4) |

Menu **⋯** không được điều hướng nhầm sang hồ sơ khi chỉ mở menu.

### 2.5. Nút trên đầu trang

| Nút | Chức năng |
|-----|-----------|
| **Thêm nhân viên** | Mở hộp thoại tạo mới (mục 3) |
| **Nhập Excel** | Mở luồng nhập (mục 5.1) |
| **Xuất** | Mở luồng xuất (mục 5.2) |
| **Đã xóa (n)** | Danh sách bản ghi đã xóa mềm (mục 4.3) |

Nếu tài khoản chỉ được **xem**, các nút tạo / sửa / xóa / nhập có thể **ẩn** hoặc từ chối khi thao tác.

---

## 3. Tạo và sửa nhân viên

Hộp thoại **Thêm nhân viên** / **Sửa** gồm các tab nội bộ (hiển thị theo quyền và danh mục):

| Tab | Nội dung chính |
|-----|----------------|
| **Thông tin cơ bản** | Mã NV, họ tên, email, SĐT, phòng ban, chức vụ, quản lý trực tiếp, ngày vào làm, trạng thái, ảnh đại diện |
| **Thông tin cá nhân** | Giới tính, ngày sinh, giấy tờ, địa chỉ, liên hệ khẩn |
| **Công việc** | Loại hình, nơi làm việc (nếu bật) |
| **Tài chính** | Lương cơ bản, thuế, ngân hàng (chỉ khi vai trò được xem/sửa lương) |

`[Hình 6.1 — Hộp thoại thêm/sửa nhân viên]`

### 3.1. Tạo mới (luồng chính)

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | **Thêm nhân viên** | Hộp thoại mở; tab **Thông tin cơ bản** |
| 2 | Điền **Mã NV**, **Họ và tên** (bắt buộc) | Trường bắt buộc có dấu hoặc thông báo khi thiếu |
| 3 | Chọn **Phòng ban**, **Chức vụ** từ danh mục (tìm kiếm trong picker) | Không nhập mã danh mục tùy ý ngoài danh sách |
| 4 | (Tuỳ chọn) Chọn **Quản lý trực tiếp** | Không chọn chính nhân viên đang tạo |
| 5 | (Tuỳ chọn) Nhập **Lương cơ bản** | Khi gõ, hệ thống nhóm nghìn kiểu Việt Nam; khi lưu vẫn đúng số |
| 6 | **Lưu** / **Thêm** | Thông báo thành công; dòng mới trên danh sách; **F5** vẫn thấy bản ghi |

**Sửa:** từ danh sách **⋯ → Sửa** hoặc từ hồ sơ nút **Sửa** — **Mã NV** thường **không đổi** khi sửa.

**Hủy / ESC:** đóng hộp thoại, **không** tạo bản ghi mới.

### 3.2. Trường hợp thường gặp

| Tình huống | Hành vi mong đợi |
|------------|------------------|
| Thiếu mã hoặc họ tên | Thông báo trên form; **không** gửi lưu |
| Email sai định dạng | Thông báo validation |
| Trùng mã nhân viên | Thông báo lỗi; hộp thoại vẫn mở để sửa |
| Danh mục phòng ban trống | Picker trống; hướng dẫn cấu hình danh mục (Cài đặt / đồng bộ tập đoàn) |
| Tài khoản thuộc nhiều công ty | Phải chọn **Công ty** trước khi lưu |

---

## 4. Xóa mềm và khôi phục

Hệ thống **không xóa vĩnh viễn** ngay trên màn hình danh sách — thao tác **Xóa** là **ẩn** khỏi danh sách đang làm việc (archive).

### 4.1. Xóa mềm

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | **⋯ → Xóa** trên dòng | Hộp thoại xác nhận (có thể nhập lý do) |
| 2 | **Xóa** / xác nhận | Nhân viên biến mất khỏi bảng chính |
| 3 | **F5** trang danh sách | Vẫn không thấy trên danh sách active |

Bấm **Hủy** trên hộp thoại → nhân viên **vẫn** trên danh sách.

### 4.2. Lưu ý thao tác

- Chọn **Xóa** trên menu **⋯** **không** được mở hồ sơ chi tiết thay vì hộp thoại xóa.
- Người không có quyền xóa: mục **Xóa** **ẩn**.

### 4.3. Khôi phục

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | **Đã xóa (n)** trên đầu trang | Hộp thoại liệt kê bản ghi đã archive |
| 2 | **Khôi phục** trên dòng | Xác nhận nếu có |
| 3 | Đóng hộp thoại; **F5** danh sách chính | Nhân viên xuất hiện lại với trạng thái trước xóa mềm |

---

## 5. Nhập và xuất Excel

### 5.1. Nhập Excel

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | **Nhập Excel** → **Tải mẫu** (nếu cần) | File `.xlsx` mẫu tải về |
| 2 | Chọn file Excel hợp lệ | Bảng **xem trước**: dòng hợp lệ / không hợp lệ |
| 3 | **Hủy** trên xem trước → **F5** danh sách | **Không** thêm bản ghi (chưa commit) |
| 4 | **Import** / xác nhận ghi | Thông báo thành công; danh sách tải lại; số dòng tăng đúng phần hợp lệ |

| Tình huống | Hành vi mong đợi |
|------------|------------------|
| File không phải Excel | Thông báo loại file không hợp lệ |
| File rỗng | Thông báo không có dữ liệu |
| Chưa chọn phạm vi công ty | Thông báo thiếu phạm vi; không import |

### 5.2. Xuất

| Bước | Thao tác | Kết quả mong đợi |
|------|----------|------------------|
| 1 | **Xuất** | Chọn cột cần xuất, bộ lọc (nếu có), định dạng |
| 2 | **Tải xuống** | File `.xlsx` hoặc `.csv` mở được; có ít nhất một dòng khi danh sách không trống |
| 3 | Bỏ chọn **tất cả** cột | Không tải file; có cảnh báo |

---

## 6. Hồ sơ nhân viên (chi tiết)

Sau khi mở hồ sơ từ danh sách:

| Thành phần | Mô tả |
|------------|--------|
| **← Danh sách** | Quay lại bảng; không lỗi 404 phạm vi |
| **Sửa** (header) | Cùng hộp thoại như mục 3 |
| **Thanh tab** | Nhóm **Cốt lõi** (Thông tin chung, Việc làm, Hợp đồng, Lương, Bảo hiểm) và nhóm mở rộng qua **Nhóm HR / Sự nghiệp / Cá nhân** |
| **Ghim tab** | Ghim tab hay dùng lên thanh ngang; thứ tự có thể kéo thả |

`[Hình 6.2 — Hồ sơ — tab Thông tin chung]`

### 6.1. Tab cốt lõi (tóm tắt thao tác)

| Tab | Việc người dùng thường làm |
|-----|----------------------------|
| **Thông tin chung** | Xem radar / timeline; thêm mốc quá trình làm việc |
| **Việc làm** | Gán / sửa công việc nội bộ (form riêng) |
| **Hợp đồng** | Thêm, sửa, gia hạn, xóa hợp đồng lao động |
| **Lương** | Xem biểu đồ và phụ cấp (cần quyền xem lương) |
| **Bảo hiểm** | BHXH/BHYT, phúc lợi (dialog thêm/sửa) |

### 6.2. Tab nhóm HR / Sự nghiệp / Cá nhân

| Nhóm | Tab (ví dụ) | Thao tác |
|------|-------------|----------|
| HR | Đào tạo, Tài sản, Khen thưởng / Kỷ luật | **Thêm** → điền form → **Lưu** → **F5** còn dòng |
| Sự nghiệp | CV & file, KPI, Quá trình, Bằng cấp, Chứng chỉ, Kỹ năng | Upload CV; CRUD từng loại bản ghi |
| Cá nhân | Gia đình | Thành viên gia đình; liên hệ khẩn |

Một số tab tải **lazy** (spinner ngắn rồi nội dung). Tab **KPI** / **Việc làm** có thể phụ thuộc dữ liệu pilot — nếu trống vẫn phải hiển thị trạng thái trống hợp lý, không lỗi trắng màn hình.

### 6.3. Nhãn hiển thị và quyền

| Quy tắc | Mô tả |
|---------|--------|
| Giới tính, trạng thái, danh mục | Hiển thị **nhãn tiếng Việt**, không hiện mã enum thô cho người dùng |
| Quản lý trực tiếp | Hiển thị **tên**, không chỉ mã nội bộ |
| Không có quyền xem lương | Tab Lương / Bảo hiểm: khung thông báo quyền; **không** lộ số nhạy cảm |

---

## 7. Phạm vi công ty và phân quyền

| Nguyên tắc | Giải thích ngắn |
|------------|-----------------|
| Phạm vi sau đăng nhập | Chỉ thấy nhân viên thuộc công ty / rollup được phép |
| List → hồ sơ | Mở từ dòng trên danh sách phải **cùng phạm vi** với GET chi tiết — không «Không tìm thấy» oan |
| CEO công ty thành viên | Không thấy dữ liệu tập đoàn ngoài phạm vi membership |
| Embed Command Center | Cùng hành vi với mở trực tiếp `/hr/employees` trong phạm vi đã chọn |

Chi tiết khái niệm tenant / membership: tài liệu pilot **mục 6**.

---

## 8. Tiêu chí đạt khi chạy thử (checklist ngắn)

Dùng khi nghiệm thu trên trình duyệt (không thay thế kiểm thử tích hợp API):

| # | Luồng | Đạt khi |
|---|--------|---------|
| A | Danh sách load | Không banner Sync ERROR; bảng hoặc empty hợp lệ |
| B | Tạo NV từ FE | Lưu thành công → dòng mới → F5 còn |
| C | Sửa / xóa mềm / khôi phục | FE cập nhật sau 2xx; F5 khớp |
| D | Nhập: preview → Hủy | Không đổi số lượng list |
| E | List → hồ sơ → quay lại | Không 404 scope |
| F | Import commit (nếu có file mẫu) | Toast OK; list refetch |

---

*Tài liệu thuộc bộ HDSD phân hệ Nhân sự — bản Markdown phục vụ pilot và đối chiếu kịch bản kiểm thử. Ảnh màn hình bổ sung khi chụp trên môi trường nghiệm thu.*
