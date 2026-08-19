# Chương 5f — Chấm công & phép (HRM) — Danh mục loại tăng ca (catalog mở)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-005f |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục loại tăng ca mở; chưa đủ HDSD toàn trị chấm công / bảng lương) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Cài đặt** → **Loại tăng ca** (hoặc nhãn tương đương trên pháp nhân đang làm việc) |
| **Đối tượng** | HCNS / quản trị cấu hình danh mục; người nộp đơn tăng ca khi chọn loại tăng ca từ danh sách |
| **Tham chiếu SRS** | FR-UC-BP-PLT-01 (nền tảng cấu hình động) · FR-UC-BP-ATT-06 (nghỉ bù từ tăng ca) · tiêu chí AC-PLT-ATT-OT-01* |
| **Peer HDSD** | Chương 5c — Danh mục ký hiệu công; Chương 5d — Danh mục ca làm việc; Chương 5e — Quy tắc quỹ phép — **không** gộp vào bản này |

**Phạm vi bản này:** hướng dẫn **mở danh mục loại tăng ca** (mã — tên tiếng Việt — hệ số hiển thị — trạng thái) — quản trị được **thêm loại mới (N+1 / loại thứ chín trở lên)**; ba loại khởi tạo (ngày thường / cuối tuần / ngày lễ) chỉ là **ví dụ khởi tạo**, không phải trần số lượng; người nộp đơn tăng ca **chọn** loại đang hiệu lực từ danh sách, không gõ tự do thay danh mục khi còn loại hiệu lực. **Không** khẳng định toàn bộ module chấm công / bảng lương đã sẵn sàng nghiệm thu; **không** coi **hệ số hiển thị** trên loại tăng ca là **công thức tính lương** đã chạy; **không** hướng dẫn seed / bịa dữ liệu mẫu.

**Hai việc khác nhau:**

| Việc | Ai làm | Ý nghĩa |
|------|--------|---------|
| **Quản trị danh mục loại tăng ca** | HCNS trên Cài đặt | Thêm / sửa / đưa hiệu lực / ngừng dùng loại — đây mới là thao tác **tạo mã mới** trên catalog |
| **Nộp đơn tăng ca** | Nhân viên / quản lý trên màn Đơn từ → Tăng ca | **Chọn** loại đang hiệu lực; **không** coi việc gõ loại lạ trên form nghiệp vụ là cách "tạo loại mới" |

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai vai trò — đừng nhầm

| Vai trò / màn | Việc được làm | Việc không làm |
|---------------|----------------|----------------|
| **Quản trị danh mục loại tăng ca** (Cài đặt) | Thêm loại mới (mã đặt + tên tiếng Việt + hệ số hiển thị ≥ 0); sửa metadata; đưa hiệu lực; ngừng dùng (ẩn mềm) | Không khóa danh sách chỉ ba loại khởi tạo; không xóa cứng loại còn gắn đơn tăng ca / lịch sử |
| **Nộp / duyệt đơn tăng ca** | Chọn loại đang hiệu lực từ danh sách; hệ số có thể được gợi ý sẵn theo loại rồi vẫn điều chỉnh trên đơn | Không nhập chữ tự do làm loại tăng ca thay danh mục khi còn loại hiệu lực; không coi cảnh báo thiếu loại khởi tạo là chặn thêm loại |

`[Hình 5f.1 — Cài đặt — danh sách loại tăng ca (catalog mở)]`

---

## 2. Thêm loại tăng ca mới (mã N+1 / loại thứ chín trở lên)

1. Vào **Cài đặt** → **Loại tăng ca** theo đúng pháp nhân đang làm việc.
2. Chọn **Tạo loại** / **Thêm loại** (nút có thể ghi "loại thứ chín trở lên" — ý nghĩa: không bị khóa bởi ba loại khởi tạo).
3. Nhập **mã loại** (ổn định trong pháp nhân), **tên tiếng Việt**, **hệ số hiển thị** (số ≥ 0 dùng để tham khảo / gợi ý), bổ sung metadata cần thiết.
4. Bấm **Lưu**.
5. Kiểm tra dòng mới trên danh sách; **tải lại trang** — loại vẫn còn.
6. Mở đơn tăng ca → danh sách chọn loại **có loại vừa tạo** → chọn được và hệ số gợi ý theo loại đó.

Có thể mở **nhiều loại (N+1)** theo nhu cầu pháp nhân. Thiếu mã / tên / hệ số không hợp lệ: hệ thống chặn lưu và nêu trường thiếu. Trùng mã đang hiệu lực: hệ thống báo xung đột. Mã sai định dạng: báo lỗi định dạng — **không** báo "không thuộc ba loại khởi tạo".

`[Hình 5f.2 — Form thêm loại tăng ca mới]`

---

## 3. Ba loại khởi tạo — ví dụ, không phải trần

1. Hệ thống có thể sẵn **ba loại ví dụ** (ngày thường / cuối tuần / ngày lễ) sau bước khởi tạo tùy chọn.
2. Nếu thiếu một số loại khởi tạo, giao diện có thể **cảnh báo mềm** — **không** tắt nút thêm loại và **không** chặn lưu loại mới.
3. Sau khi thêm loại thứ chín trở lên, số loại trên catalog **lớn hơn ba** là hành vi đúng.
4. Không coi "đủ ba" là điều kiện bắt buộc để nộp đơn tăng ca hoặc để nghiệm thu vận hành.

`[Hình 5f.3 — Cảnh báo mềm thiếu loại khởi tạo (không chặn thêm)]`

---

## 4. Chọn loại khi nộp đơn tăng ca (consumer ≠ tạo loại)

1. Mở màn **Đơn từ → Tăng ca** → tạo / sửa đơn tăng ca.
2. Khi danh mục loại tăng ca **còn loại đang hiệu lực**: trường loại tăng ca là **danh sách chọn** từ danh mục Nest — không gõ tự do.
3. Hệ thống gợi ý **hệ số hiển thị** theo loại đã chọn; người dùng vẫn có thể điều chỉnh giá trị trên đơn theo nghiệp vụ.
4. **Không** gõ / dán loại tự do thay cho chọn danh sách khi pháp nhân còn loại hiệu lực. Việc tạo mã mới chỉ làm ở Cài đặt (mục 2).

Nếu cố gắn loại không thuộc danh mục hiệu lực: hệ thống **từ chối** và phân biệt với trường hợp "không tìm thấy loại theo định danh" hoặc "chưa có loại hiệu lực nào" — mỗi tình huống một thông báo rõ; **không** tự áp sang một trong ba loại khởi tạo và **không** im lặng lưu thành công.

`[Hình 5f.4 — Chọn loại tăng ca trên đơn tăng ca]`

---

## 5. Hệ số hiển thị ≠ công thức tính lương

1. **Hệ số hiển thị** gắn trên loại tăng ca chỉ để **tham khảo / gợi ý** khi nộp đơn.
2. Đây **không** phải công thức tính lương tăng ca đã chạy: việc quy đổi giờ tăng ca thành tiền / phép nghỉ bù thuộc phần tính lương và nghỉ bù (giai đoạn sau, các FR riêng).
3. Sửa hệ số hiển thị trên Cài đặt **không** tự động thay đổi kết quả lương của kỳ đã chốt.
4. Không dùng bản hướng dẫn này để khẳng định máy tính lương / nghỉ bù đã sẵn sàng nghiệm thu.

`[Hình 5f.5 — Hệ số hiển thị là gợi ý, không phải công thức lương]`

---

## 6. Ngừng dùng loại tăng ca (ẩn mềm)

1. Trên danh sách loại, chọn loại → **Ngừng dùng** (hoặc tương đương) → xác nhận.
2. Loại **ẩn** khỏi danh sách chọn mặc định khi nộp đơn tăng ca mới.
3. Đơn tăng ca lịch sử đã gắn loại đó **vẫn đọc được** loại và hệ số như lúc nộp.
4. Bật bộ lọc **Gồm mục đã ngừng** khi cần đối chiếu lịch sử cấu hình.

Không xóa cứng loại còn tham chiếu đơn / lịch sử — chỉ ẩn mềm để tránh mất dấu vết.

`[Hình 5f.6 — Ngừng dùng và bộ lọc gồm mục đã ngừng]`

---

## 7. Khi chưa có loại tăng ca hiệu lực

1. Nếu pháp nhân **chưa có** loại tăng ca đang hiệu lực: màn chọn loại trên đơn tăng ca hiển thị **trạng thái trống** kèm hướng dẫn vào Cài đặt.
2. **Không** tự bịa loại; **không** cần nhập dữ liệu loại giả để "có cái mà chọn".
3. Chỉ khi danh mục trống, giao diện đơn tăng ca mới được phép tạm dùng ba loại khởi tạo làm bước khởi động; khi danh mục còn loại hiệu lực thì phải chọn từ danh mục.
4. Xử lý bằng cách tạo loại trên Cài đặt (mục 2), **không** bằng cách giả lập dữ liệu.

`[Hình 5f.7 — Trạng thái trống / chưa có loại tăng ca hiệu lực]`

---

## 8. Phạm vi & giới hạn (đọc kỹ)

- Bản này hướng dẫn **danh mục loại tăng ca mở** (thêm N+1 — ba loại khởi tạo ≠ trần — chọn từ danh sách — hệ số hiển thị chỉ gợi ý — ngừng dùng ẩn mềm) — **không** khẳng định module chấm công / bảng lương đã nghiệm thu vận hành.
- **Hệ số hiển thị** trên loại tăng ca **không** phải công thức tính lương đang chạy — quy đổi tiền / nghỉ bù là giai đoạn sau.
- Loại tăng ca **khác** ca làm việc (Chương 5d), **khác** ký hiệu công (Chương 5c), **khác** loại phép / quy tắc quỹ phép (Chương 5e) — không gộp chung.
- Màn nghiệp vụ đơn tăng ca **không** là nơi "tạo loại mới" bằng chữ tự do khi còn loại hiệu lực.
- Bản hướng dẫn này **không** hướng dẫn seed / bịa dữ liệu — mọi loại đều tạo qua Cài đặt theo luồng người dùng.

---

## 9. Lưu ý nhanh

| Tình huống | Xử lý đúng |
|------------|------------|
| Cần thêm loại tăng ca ngoài ba loại khởi tạo | Cài đặt → **Tạo loại** mới (mã + tên + hệ số hợp lệ) → Lưu → tải lại → chọn trên đơn |
| Thấy cảnh báo thiếu loại khởi tạo | Được phép — vẫn thêm loại mới; không chờ "đủ ba" |
| Gõ loại tăng ca lạ trên đơn khi còn loại hiệu lực | Không — chọn từ danh sách; tạo mã mới chỉ ở Cài đặt |
| Muốn đổi hệ số hiển thị của loại | Sửa trên Cài đặt để gợi ý mới; kết quả lương kỳ đã chốt không đổi theo |
| Hiểu hệ số hiển thị là tiền lương tăng ca | Không — đó chỉ là gợi ý; công thức lương / nghỉ bù là phần riêng |
| Danh mục trống nhưng vẫn cần nộp tăng ca | Tạo loại trên Cài đặt trước — không giả lập dữ liệu |

---

*Hết Chương 5f — danh mục loại tăng ca là catalog mở: quản trị thêm N+1 / loại thứ chín trở lên; ba loại khởi tạo chỉ là ví dụ không phải trần; nộp đơn tăng ca chọn từ danh sách (không bịa loại thay danh mục); loại ngừng dùng ẩn mềm giữ lịch sử; hệ số hiển thị là gợi ý, không phải công thức lương — không đồng nghĩa module chấm công / bảng lương đã nghiệm thu vận hành.*