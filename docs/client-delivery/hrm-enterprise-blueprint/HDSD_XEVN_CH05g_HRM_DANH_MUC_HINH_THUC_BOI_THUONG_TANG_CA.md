# Chương 5g — Chấm công & phép (HRM) — Danh mục hình thức bồi thường tăng ca (catalog mở)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-005g |
| **Phiên bản** | 0.1 (Markdown — phạm vi danh mục hình thức bồi thường tăng ca mở; chưa đủ HDSD toàn trị chấm công / bảng lương) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Cài đặt** → **Hình thức bồi thường tăng ca** (hoặc nhãn tương đương trên pháp nhân đang làm việc) |
| **Đối tượng** | HCNS / quản trị cấu hình danh mục; người nộp đơn tăng ca khi chọn hình thức bồi thường từ danh sách |
| **Tham chiếu SRS** | FR-UC-BP-PLT-01 (nền tảng cấu hình động) → FR-UC-BP-ATT-06 (đơn từ — tăng ca) — tiêu chí AC-PLT-ATT-COMP-01* |
| **Peer HDSD** | Chương 5f — Danh mục loại tăng ca; Chương 5c — Danh mục ký hiệu công; Chương 5d — Danh mục ca làm việc; Chương 5e — Quy tắc quỹ phép — **không** gộp vào bản này |

**Phạm vi bản này:** hướng dẫn **mở danh mục hình thức bồi thường tăng ca** (mã — tên tiếng Việt — nhãn / hệ số hiển thị — trạng thái) — quản trị được **thêm hình thức mới (N+1 / hình thức thứ ba trở lên)**; hai hình thức khởi tạo (trả lương / nghỉ bù) chỉ là **ví dụ khởi tạo**, không phải trần số lượng; người nộp đơn tăng ca **chọn** hình thức đang hiệu lực từ danh sách, không gõ tự do thay danh mục khi cần hình thức hiệu lực. **Không** khẳng định toàn bộ module chấm công / bảng lương đã sẵn sàng nghiệm thu; **không** coi **nhãn / hệ số hiển thị** trên hình thức bồi thường là **công thức tính lương** đã chạy; **không** hướng dẫn seed / bịa dữ liệu mẫu.

**Hai việc khác nhau:**

| Việc | Ai làm | Ý nghĩa |
|------|--------|---------|
| **Quản trị danh mục hình thức bồi thường tăng ca** | HCNS trên Cài đặt | Thêm / sửa / đưa hiệu lực / ngừng dùng hình thức — đây mới là thao tác **tạo mã mới** trên danh mục |
| **Nộp đơn tăng ca** | Nhân viên / quản lý trên màn Đơn từ → Tăng ca | **Chọn** hình thức đang hiệu lực; **không** coi việc gõ hình thức lạ trên form nghiệp vụ là cách "tạo hình thức mới" |

**Điểm khác biệt cốt lõi so với Chương 5f:** danh mục **loại tăng ca** (Chương 5f) trả lời **"khi nào được tính tăng ca"** (ngày thường / cuối tuần / ngày lễ …); danh mục **hình thức bồi thường** (bản này) trả lời **"tăng ca được bù đắp ra sao"** (trả lương hay nghỉ bù …). Hai danh mục **trực giao** — quản trị riêng, **không** gộp và **không** thay thế lẫn nhau.

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai vai trò — đừng nhầm

| Vai trò / màn | Việc được làm | Việc không làm |
|---------------|----------------|----------------|
| **Quản trị danh mục hình thức bồi thường** (Cài đặt) | Thêm hình thức mới (mã đặt + tên tiếng Việt + nhãn / hệ số hiển thị để tham khảo); sửa thông tin; đưa hiệu lực; ngừng dùng (ẩn mềm) | Không khóa danh sách chỉ hai hình thức khởi tạo; không xóa cứng hình thức còn gắn đơn tăng ca / lịch sử |
| **Nộp / duyệt đơn tăng ca** | Chọn hình thức đang hiệu lực từ danh sách; nhãn / hệ số có thể được gợi ý sẵn theo hình thức rồi vẫn xem lại trên đơn | Không nhập chữ tự do làm hình thức bồi thường thay danh mục khi cần hình thức hiệu lực; không coi cảnh báo thiếu hình thức khởi tạo là chặn thêm hình thức |

`[Hình 5g.1 — Cài đặt — danh sách hình thức bồi thường tăng ca (catalog mở)]`

---

## 2. Thêm hình thức bồi thường tăng ca mới (mã N+1 / hình thức thứ ba trở lên)

1. Vào **Cài đặt** → **Hình thức bồi thường tăng ca** theo đúng pháp nhân đang làm việc.
2. Chọn **Tạo hình thức** / **Thêm hình thức** (nút có thể ghi "hình thức thứ ba trở lên" — ý nghĩa: không bị khóa bởi hai hình thức khởi tạo).
3. Nhập **mã hình thức** (ổn định trong pháp nhân), **tên tiếng Việt**, **nhãn / hệ số hiển thị** (chỉ để tham khảo / gợi ý), bổ sung thông tin cần thiết.
4. Bấm **Lưu**.
5. Kiểm tra dòng mới trên danh sách; **tải lại trang** — hình thức vẫn còn.
6. Mở đơn tăng ca → danh sách chọn hình thức **có hình thức vừa tạo** → chọn được và nhãn gợi ý theo hình thức đó.

Có thể mở **nhiều hình thức (N+1)** theo nhu cầu pháp nhân. Thiếu mã / tên / thông tin không hợp lệ: hệ thống chặn lưu và nêu trường thiếu. Trùng mã đang hiệu lực: hệ thống báo xung đột. Mã sai định dạng: báo lỗi định dạng — **không** báo "không thuộc hai hình thức khởi tạo".

`[Hình 5g.2 — Form thêm hình thức bồi thường mới]`

---

## 3. Hai hình thức khởi tạo (trả lương / nghỉ bù) — ví dụ, không phải trần

1. Hệ thống có thể sẵn **hai hình thức ví dụ** (trả lương / nghỉ bù) sau bước khởi tạo tùy chọn.
2. Nếu thiếu một hình thức khởi tạo, giao diện có thể **cảnh báo mềm** — **không** tắt nút thêm hình thức và **không** chặn lưu hình thức mới.
3. Sau khi thêm hình thức thứ ba trở lên, số hình thức trên danh mục **lớn hơn hai** là hành vi đúng.
4. Không coi "đủ hai" là điều kiện bắt buộc để nộp đơn tăng ca hoặc để nghiệm thu vận hành.
5. Tên nghiệp vụ của hình thức "nghỉ bù" là **hình thức bồi thường bằng thời gian nghỉ** — không nhầm với danh mục loại phép hay quy tắc quỹ phép (Chương 5e); việc quy đổi tăng ca thành ngày nghỉ bù thực tế là phần tính toán giai đoạn sau.

`[Hình 5g.3 — Cảnh báo mềm thiếu hình thức khởi tạo (không chặn thêm)]`

---

## 4. Chọn hình thức khi nộp đơn tăng ca (nơi tiêu thụ — không phải nơi tạo hình thức)

1. Mở màn **Đơn từ → Tăng ca** → tạo / sửa đơn tăng ca (nút đăng ký làm thêm).
2. Khi danh mục hình thức bồi thường **có hình thức đang hiệu lực**: trường hình thức bồi thường là **danh sách chọn** từ danh mục — không gõ tự do.
3. Hệ thống gợi ý **nhãn / hệ số hiển thị** theo hình thức đã chọn; người dùng vẫn xem lại và điều chỉnh giá trị trên đơn theo nghiệp vụ.
4. **Không** gõ / dán hình thức tự do thay cho chọn danh sách khi pháp nhân cần hình thức hiệu lực. Việc tạo mã mới chỉ làm ở Cài đặt (mục 2).

Nếu cố gắn hình thức không thuộc danh mục hiệu lực: hệ thống **từ chối** và phân biệt với trường hợp "không tìm thấy hình thức theo định danh" hoặc "chưa có hình thức hiệu lực nào" — mỗi tình huống một thông báo rõ; **không** tự ép sang một trong hai hình thức khởi tạo và **không** im lặng lưu thành công.

**Trạng thái hiện tại:** màn chọn hình thức bồi thường trên đơn tăng ca **đã kết nối** với danh mục — khi có hình thức hiệu lực, người nộp chọn từ danh sách, lưu và tải lại vẫn giữ đúng hình thức đã chọn. Đây là mức bàn giao giao diện của bước chọn hình thức, **không** đồng nghĩa toàn bộ module chấm công / tính lương tăng ca đã nghiệm thu.

`[Hình 5g.4 — Chọn hình thức bồi thường trên đơn tăng ca]`

---

## 5. Nhãn / hệ số hiển thị ≠ công thức tính lương

1. **Nhãn / hệ số hiển thị** gắn trên hình thức bồi thường chỉ để **tham khảo / gợi ý** khi nộp đơn.
2. Đây **không** phải công thức tính lương tăng ca đã chạy: việc quy đổi giờ tăng ca thành tiền / ngày nghỉ bù thuộc phần tính lương và nghỉ bù (giai đoạn sau, các FR riêng).
3. Sửa nhãn / hệ số hiển thị trên Cài đặt **không** tự động thay đổi kết quả lương của kỳ đã chốt.
4. Không dùng bản hướng dẫn này để khẳng định máy tính lương / nghỉ bù đã sẵn sàng nghiệm thu.

`[Hình 5g.5 — Nhãn / hệ số hiển thị là gợi ý, không phải công thức lương]`

---

## 6. Ngừng dùng hình thức bồi thường (ẩn mềm)

1. Trên danh sách hình thức, chọn hình thức → **Ngừng dùng** (hoặc tương đương) → xác nhận.
2. Hình thức **ẩn** khỏi danh sách chọn mặc định khi nộp đơn tăng ca mới.
3. Đơn tăng ca lịch sử đã gắn hình thức đó **vẫn đọc được** hình thức và nhãn như lúc nộp.
4. Bật bộ lọc **Gồm mục đã ngừng** khi cần đối chiếu lịch sử cấu hình.

Không xóa cứng hình thức còn tham chiếu đơn / lịch sử — chỉ ẩn mềm để tránh mất dấu vết.

`[Hình 5g.6 — Ngừng dùng và bộ lọc gồm mục đã ngừng]`

---

## 7. Khi chưa có hình thức bồi thường hiệu lực

1. Nếu pháp nhân **chưa có** hình thức bồi thường đang hiệu lực: màn chọn hình thức trên đơn tăng ca hiển thị **trạng thái trống** kèm hướng dẫn vào Cài đặt.
2. **Không** tự bịa hình thức; **không** cần nhập dữ liệu hình thức giả để "có cái mà chọn".
3. Chỉ khi danh mục trống, giao diện đơn tăng ca mới được phép tạm dùng hai hình thức khởi tạo làm bước khởi động; khi danh mục có hình thức hiệu lực thì phải chọn từ danh mục.
4. Xử lý bằng cách tạo hình thức trên Cài đặt (mục 2), **không** bằng cách giả lập dữ liệu.

`[Hình 5g.7 — Trạng thái trống / chưa có hình thức bồi thường hiệu lực]`

---

## 8. Phạm vi & giới hạn (đọc kỹ)

- Bản này hướng dẫn **danh mục hình thức bồi thường tăng ca mở** (thêm N+1 — hai hình thức khởi tạo ≠ trần — chọn từ danh sách — nhãn / hệ số hiển thị chỉ gợi ý — ngừng dùng ẩn mềm) — **không** khẳng định module chấm công / bảng lương đã nghiệm thu vận hành.
- **Nhãn / hệ số hiển thị** trên hình thức bồi thường **không** phải công thức tính lương đang chạy — quy đổi tiền / nghỉ bù là giai đoạn sau.
- Hình thức bồi thường tăng ca **khác** loại tăng ca (Chương 5f), **khác** ca làm việc (Chương 5d), **khác** ký hiệu công (Chương 5c), **khác** loại phép / quy tắc quỹ phép (Chương 5e) — không gộp chung.
- Màn nghiệp vụ đơn tăng ca **không** là nơi "tạo hình thức mới" bằng chữ tự do khi cần hình thức hiệu lực.
- Bản hướng dẫn này **không** hướng dẫn seed / bịa dữ liệu — mọi hình thức đều tạo qua Cài đặt theo luồng người dùng.

---

## 9. Lưu ý nhanh

| Tình huống | Xử lý đúng |
|------------|------------|
| Cần thêm hình thức bồi thường ngoài hai hình thức khởi tạo | Cài đặt → **Tạo hình thức** mới (mã + tên + nhãn hợp lệ) → Lưu → tải lại → chọn trên đơn |
| Thấy cảnh báo thiếu hình thức khởi tạo | Được phép — vẫn thêm hình thức mới; không chờ "đủ hai" |
| Gõ hình thức lạ trên đơn khi cần hình thức hiệu lực | Không — chọn từ danh sách; tạo mã mới chỉ ở Cài đặt |
| Muốn đổi nhãn / hệ số hiển thị của hình thức | Sửa trên Cài đặt để gợi ý mới; kết quả lương kỳ đã chốt không đổi theo |
| Hiểu nhãn / hệ số hiển thị là tiền lương tăng ca | Không — đó chỉ là gợi ý; công thức lương / nghỉ bù là phần riêng |
| Danh mục trống nhưng vẫn cần nộp tăng ca | Tạo hình thức trên Cài đặt trước — không giả lập dữ liệu |
| Nhầm hình thức bồi thường với loại tăng ca | Loại tăng ca = khi nào tính (Chương 5f); hình thức bồi thường = bù đắp ra sao (bản này) — hai danh mục riêng |

---

*Hết Chương 5g — danh mục hình thức bồi thường tăng ca là catalog mở: quản trị thêm N+1 / hình thức thứ ba trở lên; hai hình thức khởi tạo (trả lương / nghỉ bù) chỉ là ví dụ không phải trần; nộp đơn tăng ca chọn từ danh sách (không bịa hình thức thay danh mục); hình thức ngừng dùng ẩn mềm giữ lịch sử; nhãn / hệ số hiển thị là gợi ý, không phải công thức lương; trực giao với danh mục loại tăng ca (Chương 5f) — không đồng nghĩa module chấm công / bảng lương đã nghiệm thu vận hành.*