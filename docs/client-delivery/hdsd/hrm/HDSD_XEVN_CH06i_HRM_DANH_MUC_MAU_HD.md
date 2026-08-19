# Chương 6i — Nhân sự (HRM) · Danh mục mẫu hợp đồng (catalog mở)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006i |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi danh mục mẫu mở; chưa đủ HDSD toàn trụ hợp đồng / bản in) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Cài đặt** → **Mẫu hợp đồng** / in pháp lý (hoặc nhãn tương đương trên pháp nhân) |
| **Đối tượng** | HCNS / quản trị cấu hình mẫu; người soạn hợp đồng khi chọn mẫu / xem trước / lưu phiên bản in |
| **Tham chiếu SRS** | FR-UC-BP-CORE-09d (catalog mẫu mở) · liên kết 09 · 09a · 09b · 09c · PLT-01 |
| **Peer HDSD** | Chương 6h — Thư viện điều khoản; Chương 6 — Hồ sơ nhân sự · tab Hợp đồng (sổ đăng ký) — **không** gộp vào bản này |

**Phạm vi bản này:** hướng dẫn **mở danh mục mẫu hợp đồng** (mã · tên tiếng Việt · gói nghề · trạng thái) — quản trị được **thêm mẫu mới (N+1 / mã thứ chín trở lên)**; tám mã khởi tạo theo loại × khối chỉ là **ví dụ**, không phải trần số lượng; người soạn hợp đồng **chọn** mẫu đang hiệu lực từ danh sách, không gõ mã tự do thay danh mục khi còn mẫu hiệu lực; phiên bản in đã lưu **giữ mã mẫu và khung** tại thời điểm ban hành. **Không** khẳng định toàn bộ module hợp đồng / bản in PDF đã sẵn sàng nghiệm thu; **không** hướng dẫn tải tệp DOCX làm nguồn mẫu; **không** hướng dẫn kéo-thả sắp xếp thứ tự điều khoản trên mẫu (chủ đề bố cục riêng).

**Hai việc khác nhau:**

| Việc | Ai làm | Ý nghĩa |
|------|--------|---------|
| **Quản trị danh mục mẫu** | HCNS trên Cài đặt | Thêm / sửa / đưa hiệu lực / ngừng dùng mẫu — đây mới là thao tác **tạo mã mới** trên catalog |
| **Soạn hợp đồng / xem trước** | Người soạn trên màn Hợp đồng | **Chọn** mẫu đang hiệu lực; **không** coi việc gõ mã lạ trên form nghiệp vụ là cách «tạo mẫu mới» |

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai vai trò — đừng nhầm

| Vai trò / màn | Việc được làm | Việc không làm |
|---------------|----------------|----------------|
| **Quản trị danh mục mẫu** (Cài đặt) | Thêm mẫu mới (mã HR đặt + tên + gói nghề thuộc gói đã cấu hình); sửa metadata bản nháp / chưa gắn bản in đã phát hành; đưa hiệu lực; ngừng dùng (ẩn mềm) | Không khóa danh sách chỉ tám mã khởi tạo; không xóa cứng mẫu còn gắn phiên bản in / lịch sử |
| **Soạn / xem trước / lưu phiên bản in** | Chọn mẫu đang hiệu lực từ danh sách; xem trước theo mã; lưu phiên bản → hệ thống **giữ mã mẫu và khung** tại thời điểm lưu | Không nhập chữ tự do làm mã mẫu thay danh mục khi còn mẫu hiệu lực; không coi cảnh báo thiếu tám mã khởi tạo là chặn thêm mẫu |

`[Hình 6i.1 — Cài đặt · danh sách mẫu hợp đồng (catalog mở)]`

---

## 2. Thêm mẫu mới (mở N+1 / mã thứ chín trở lên)

1. Vào **Cài đặt** → **Mẫu hợp đồng** (hoặc tab tương đương) theo đúng pháp nhân đang làm việc.
2. Chọn **Tạo mẫu** / **Thêm mẫu** (nhãn có thể ghi «mẫu thứ chín trở lên» — ý nghĩa: không bị khóa bởi tám mã khởi tạo).
3. Nhập **mã mẫu** (ổn định trong pháp nhân), **tên tiếng Việt**, chọn **gói nghề** thuộc gói đã cấu hình, bổ sung metadata cần thiết (nhãn loại, thời hạn gợi ý…).
4. Bấm **Lưu**.
5. Kiểm tra dòng mới trên danh sách; **tải lại trang** — mẫu vẫn còn.
6. Mở tạo / sửa hợp đồng → danh sách chọn mẫu **có mã vừa tạo** → chọn được và xem trước theo mã đó.

Có thể mở **nhiều mẫu (N+1)** theo nhu cầu pháp nhân. Thiếu mã / tên / gói: hệ thống chặn lưu và nêu trường thiếu. Trùng mã đang hiệu lực: hệ thống báo xung đột. Mã sai định dạng: báo lỗi định dạng — **không** báo «không thuộc tám mã khởi tạo».

`[Hình 6i.2 — Form thêm mẫu mới]`

---

## 3. Tám mã khởi tạo — ví dụ, không phải trần

1. Hệ thống có thể sẵn **tám mã ví dụ** theo loại hợp đồng × khối nghề (thử việc / xác định thời hạn / không xác định × văn phòng / lái xe) sau bước khởi tạo tùy chọn.
2. Nếu thiếu một số mã khởi tạo, giao diện có thể **cảnh báo mềm** — **không** tắt nút thêm mẫu và **không** chặn lưu mẫu mới.
3. Sau khi thêm mẫu thứ chín trở lên, số mẫu trên catalog **lớn hơn tám** là hành vi đúng.
4. Không coi «đủ đúng tám» là điều kiện bắt buộc để soạn hợp đồng hoặc để nghiệm thu vận hành.

`[Hình 6i.3 — Cảnh báo mềm thiếu mã khởi tạo (không chặn thêm)]`

---

## 4. Chọn mẫu khi soạn hợp đồng (consumer ≠ tạo mẫu)

1. Mở tạo / sửa hợp đồng — sổ đăng ký (mã · loại · hiệu lực · trạng thái) **vẫn nhập được** khi chưa chọn mẫu in.
2. Khi cần sinh từ mẫu: mở danh sách **mẫu đang hiệu lực** → chọn một mã (khởi tạo hoặc mã HR đã thêm).
3. Hệ thống gợi ý gói nghề, nhãn loại, khoảng thời hạn mặc định theo cấu hình mẫu.
4. Xem trước phản ánh đúng mã đã chọn (ví dụ văn phòng không khối giấy phép lái xe; lái xe có khối tương ứng khi mẫu yêu cầu).
5. **Không** gõ / dán mã mẫu tự do thay cho chọn danh sách khi pháp nhân còn mẫu hiệu lực. Việc tạo mã mới chỉ làm ở Cài đặt (mục 2).

Nếu cố gắn mã không thuộc danh mục hiệu lực: hệ thống **từ chối** và phân biệt với trường hợp «không tìm thấy mẫu theo định danh» hoặc «chưa có mẫu hiệu lực nào» — mỗi tình huống một thông báo rõ; **không** tự ép sang một trong tám mã khởi tạo.

`[Hình 6i.4 — Chọn mẫu trên màn hợp đồng / xem trước]`

---

## 5. Lưu phiên bản in và giữ mã mẫu (đóng băng)

1. Trên luồng hợp đồng: chọn mẫu đủ điều kiện → xem trước → **lưu phiên bản in** / phát hành theo hướng dẫn màn hình.
2. Tại thời điểm lưu, hệ thống ghi nhận **mã mẫu** và **khung / cấu trúc** đã gắn.
3. Sau đó, dù quản trị sửa tên, gói, hoặc khung mẫu trên Cài đặt, khi **mở lại phiên bản đã lưu** vẫn thấy mã mẫu và khung **như lúc ban hành**.
4. Bản nháp / phiên bản mới sau đó dùng cấu hình mẫu hiện hành.

Đây là ràng buộc để văn bản đã giao / đã lưu sổ không bị đổi hồi tố khi HCNS chỉnh danh mục mẫu.

`[Hình 6i.5 — Phiên bản đã lưu giữ mã mẫu sau khi sửa catalog]`

---

## 6. Ngừng dùng mẫu (ẩn mềm)

1. Trên danh sách mẫu, chọn mẫu → **Ngừng dùng** (hoặc tương đương) → xác nhận.
2. Mẫu **ẩn** khỏi danh sách chọn mặc định khi soạn hợp đồng mới / xem trước mới.
3. Phiên bản in / hợp đồng lịch sử **vẫn đọc được** mã mẫu và khung đã đóng băng.
4. Bật bộ lọc **Gồm mục đã ngừng** khi cần đối chiếu lịch sử cấu hình.

Không xóa cứng mẫu còn tham chiếu / phiên bản đã lưu — chỉ ẩn mềm để tránh mất dấu vết.

`[Hình 6i.6 — Ngừng dùng và bộ lọc gồm mục đã ngừng]`

---

## 7. Khi chưa có mẫu hiệu lực

1. Nếu pháp nhân **chưa có** mẫu đang hiệu lực: màn chọn mẫu / xem trước từ mẫu hiển thị **trạng thái trống** kèm hướng dẫn vào Cài đặt.
2. **Không** tự bịa mẫu; **không** cần nhập dữ liệu mẫu giả để «có cái mà in».
3. Sổ đăng ký hợp đồng (không chọn mẫu in) vẫn tạo / sửa / tải lại được theo hướng dẫn tab Hợp đồng.
4. Khi luồng in **bắt buộc** có mẫu mà catalog trống: hệ thống chặn và hướng dẫn cấu hình — xử lý bằng cách tạo mẫu trên Cài đặt (mục 2), không bằng cách giả lập dữ liệu.

`[Hình 6i.7 — Trạng thái trống / chưa có mẫu hiệu lực]`

---

## 8. Phạm vi & giới hạn (đọc kỹ)

- Bản này hướng dẫn **danh mục mẫu mở** (thêm N+1 · tám mã khởi tạo ≠ trần · chọn từ danh sách · đóng băng mã khi lưu phiên bản in · ngừng dùng ẩn mềm) — **không** khẳng định module hợp đồng / bản in PDF đã nghiệm thu vận hành.
- **Tải / dựng tệp DOCX** làm nguồn hoặc đầu ra chính là **giai đoạn sau** — không thuộc hướng dẫn bản này.
- **Kéo-thả sắp xếp thứ tự điều khoản trên mẫu** là chủ đề cấu hình bố cục riêng — không gộp vào danh mục mẫu ở đây (xem FR / hướng dẫn bố cục khi có).
- **Nội dung điều khoản tiếng Việt** (câu / đoạn luật) quản trị ở **Chương 6h — Thư viện điều khoản** — khác danh mục mẫu loại × khối của bản này.
- Màn nghiệp vụ hợp đồng **không** là nơi «tạo mã mẫu mới» bằng chữ tự do khi còn mẫu hiệu lực.
- Danh mục mẫu **khác** sổ đăng ký hợp đồng (tab Hợp đồng trên hồ sơ) và **khác** thư viện điều khoản.

---

## 9. Lưu ý nhanh

| Tình huống | Xử lý đúng |
|------------|------------|
| Cần thêm loại HĐ / thời hạn mới ngoài tám mã | Cài đặt → **Tạo mẫu** mới (mã HR + gói hợp lệ) → Lưu → tải lại → chọn trên HĐ |
| Thấy cảnh báo thiếu mã khởi tạo | Được phép — vẫn thêm mẫu mới; không chờ «đủ tám» |
| Muốn đổi khung mẫu sau khi đã lưu phiên bản in | Sửa trên Cài đặt chỉ ảnh hưởng bản nháp / phiên bản mới; bản đã lưu giữ khung cũ |
| Gõ mã mẫu lạ trên form HĐ khi còn mẫu hiệu lực | Không — chọn từ danh sách; tạo mã mới chỉ ở Cài đặt |
| Muốn sắp xếp lại thứ tự điều khoản bằng kéo-thả | Ngoài phạm vi bản này — xem hướng dẫn cấu hình bố cục khi có |
| Muốn tải DOCX làm mẫu | Giai đoạn sau — chưa thuộc bản hướng dẫn này |
| Catalog trống nhưng vẫn cần ghi sổ HĐ | Tạo / sửa sổ đăng ký **không** chọn mẫu in — vẫn được |

---

*Hết Chương 6i — danh mục mẫu hợp đồng là catalog mở: quản trị thêm N+1 / mã thứ chín trở lên; tám mã khởi tạo chỉ là ví dụ không phải trần; soạn HĐ chọn từ danh sách (không bịa mã thay danh mục); phiên bản in đã lưu giữ mã mẫu; DOCX và kéo-thả bố cục = ngoài phạm vi / giai đoạn sau — không đồng nghĩa module hợp đồng / bản in đã nghiệm thu vận hành.*
