# Chương 6h — Nhân sự (HRM) · Thư viện điều khoản hợp đồng

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-006h |
| **Phiên bản** | 0.1 (Markdown — DOC-DELTA phạm vi nội dung điều khoản có phiên bản; chưa đủ HDSD toàn trụ hợp đồng / bản in) |
| **Ngày hiệu lực** | 08/08/2026 |
| **Đường vào** | Command Center → module **Nhân sự** → **Cài đặt** → **Thư viện điều khoản hợp đồng** (hoặc nhãn tương đương trên pháp nhân) |
| **Đối tượng** | HCNS / quản trị cấu hình mẫu và điều khoản; người soạn hợp đồng khi xem trước / phát hành bản in |
| **Tham chiếu SRS** | FR-UC-BP-CORE-09a (thư viện điều khoản) · liên kết 09 · 09b · 09c · 09d |
| **Peer HDSD** | Chương 6 — Hồ sơ nhân sự · tab Hợp đồng (sổ đăng ký); các chương danh mục nhân sự / bảo hiểm riêng — **không** gộp vào bản này |

**Phạm vi bản này:** hướng dẫn **quản trị nội dung điều khoản tiếng Việt** trong thư viện (mã · tiêu đề · nội dung · nhóm · gói nghề · phiên bản) và cách hệ thống **giữ nội dung cũ** trên hợp đồng đã phát hành khi thư viện được sửa. **Không** khẳng định toàn bộ module hợp đồng / bản in PDF đã sẵn sàng nghiệm thu; **không** hướng dẫn tải tệp DOCX làm nguồn nội dung; **không** hướng dẫn kéo-thả sắp xếp thứ tự điều khoản trên mẫu (chủ đề riêng).

**Nguồn nội dung điều khoản:** nội dung dài lấy từ **thư viện điều khoản có phiên bản** của hệ thống nhân sự. Màn tạo / xem hợp đồng **chỉ lấy** nội dung từ thư viện hoặc từ **ảnh chụp** đã lưu khi phát hành — **không** nhúng sẵn cả đoạn văn luật dài trên giao diện nghiệp vụ.

**Liên kết pilot:** tài liệu tổng [`03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`](../../03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md).

---

## 1. Hai vai trò — đừng nhầm

| Vai trò / màn | Việc được làm | Việc không làm |
|---------------|----------------|----------------|
| **Quản trị thư viện điều khoản** (Cài đặt) | Thêm điều khoản mới; sửa nội dung bản nháp / chưa gắn bản in đã phát hành; tăng phiên bản khi điều khoản đã gắn hợp đồng đã phát hành; ngừng dùng (ẩn mềm) | Không xóa cứng điều khoản còn ảnh chụp trên hợp đồng cũ; không coi danh mục Cấu hình hệ thống khác là nguồn nội dung điều khoản |
| **Soạn / xem trước / phát hành HĐ** | Chọn mẫu · gói nghề; xem nội dung đã gắn; phát hành bản in → hệ thống lưu **ảnh chụp** nội dung tại thời điểm phát hành | Không gõ / dán cả đoạn điều khoản dài làm nguồn sự thật trên màn hợp đồng |

`[Hình 6h.1 — Thư viện điều khoản · danh sách theo nhóm]`

---

## 2. Thêm điều khoản mới (mở N+1)

1. Vào **Cài đặt** → **Thư viện điều khoản hợp đồng** theo đúng pháp nhân đang làm việc.
2. Chọn **Thêm** (hoặc tương đương).
3. Nhập **mã** (ổn định trong pháp nhân), **tiêu đề tiếng Việt**, **nội dung tiếng Việt**.
4. Chọn **nhóm điều khoản**, **gói nghề áp dụng**, **thứ tự**, cờ **bắt buộc** khi gắn gói.
5. Trong nội dung có thể dùng **chỗ điền sẵn** dạng `{{tên_trường}}` (ví dụ họ tên, chức danh) — **một** kiểu chỗ điền trong cùng một mẫu; không trộn nhiều kiểu ký hiệu khác nhau.
6. Bấm **Lưu**.
7. Kiểm tra dòng mới trên danh sách; **tải lại trang** — điều khoản vẫn còn.

Có thể mở **nhiều điều khoản (N+1)** theo nhu cầu pháp nhân. Thiếu mã hoặc nội dung: hệ thống chặn lưu và nêu trường thiếu. Trùng mã đang hiệu lực: hệ thống báo xung đột — xử lý ngừng bản cũ hoặc đổi mã trước khi lưu.

`[Hình 6h.2 — Form thêm / sửa nội dung điều khoản]`

---

## 3. Sửa nội dung — bản nháp so với đã phát hành

### 3.1 Điều khoản nháp hoặc chưa gắn bản in đã phát hành

1. Mở điều khoản → sửa **nội dung tiếng Việt** (đổi câu / đoạn cần thiết; **không** cần dán cả văn bản hợp đồng đầy đủ vào ô này để «chứng minh»).
2. **Lưu** → danh sách và chi tiết cập nhật.
3. **Tải lại** — nội dung mới còn; bản xem trước nháp dùng nội dung mới.

### 3.2 Điều khoản đã gắn hợp đồng đã phát hành

1. Sửa nội dung → **Lưu**: hệ thống **không ghi đè im lặng**; yêu cầu **đưa sang phiên bản mới / kích hoạt lại** (tăng số phiên bản).
2. Sau khi tăng phiên bản: bản **mới** dùng cho hợp đồng / xem trước sắp tới.
3. Mở lại hợp đồng **đã phát hành trước đó**: nội dung điều khoản **giữ nguyên** theo **ảnh chụp** lúc phát hành — không đổi theo sửa thư viện sau này.

Đây là ràng buộc để văn bản đã giao cho người lao động / đã lưu sổ không bị đổi hồi tố khi HCNS chỉnh thư viện.

`[Hình 6h.3 — Cảnh báo tăng phiên bản khi điều khoản đã gắn bản phát hành]`

---

## 4. Phát hành bản in và ảnh chụp nội dung

1. Trên luồng hợp đồng: chọn mẫu / gói nghề đủ điều khoản bắt buộc → **xem trước** → **phát hành** (lưu phiên bản in / PDF theo hướng dẫn màn hình).
2. Tại thời điểm phát hành, hệ thống lưu **ảnh chụp** bộ điều khoản đã gắn.
3. Sau đó, dù thư viện được sửa hoặc tăng phiên bản, **bản đã phát hành** khi mở lại vẫn hiển thị nội dung trong ảnh chụp.
4. Bản nháp / hợp đồng mới sau đó dùng nội dung thư viện phiên bản hiện hành.

Nếu thiếu điều khoản đánh dấu **bắt buộc** theo gói: hệ thống **chặn phát hành** và liệt kê thiếu — vào thư viện bổ sung / đưa hiệu lực trước khi thử lại.

`[Hình 6h.4 — Xem trước và phát hành với ảnh chụp điều khoản]`

---

## 5. Ngừng dùng điều khoản (ẩn mềm)

1. Trên danh sách thư viện, chọn điều khoản → **Ngừng dùng** (hoặc tương đương) → xác nhận.
2. Điều khoản **ẩn** khỏi bộ chọn mặc định khi gắn mẫu / gói mới.
3. Hợp đồng đã phát hành **vẫn đọc được** nội dung từ ảnh chụp cũ.
4. Bật bộ lọc **Gồm mục đã ngừng** khi cần đối chiếu lịch sử cấu hình.

Không xóa cứng điều khoản còn tham chiếu / ảnh chụp — chỉ ẩn mềm để tránh mất dấu vết pháp lý.

`[Hình 6h.5 — Ngừng dùng và bộ lọc gồm mục đã ngừng]`

---

## 6. Khi thư viện trống hoặc chưa đủ

1. Nếu chưa có điều khoản hiệu lực cho gói nghề đang chọn, màn xem trước / gắn mẫu hiển thị **trạng thái trống** hoặc danh sách thiếu kèm gợi ý cấu hình.
2. **Không** tự bịa nội dung điều khoản; **không** cần nhập dữ liệu mẫu giả để «có cái mà in».
3. HCNS vào thư viện tạo / đưa hiệu lực đủ điều khoản bắt buộc (mục 2–3), rồi quay lại soạn hợp đồng.

`[Hình 6h.6 — Trạng thái trống / thiếu điều khoản bắt buộc]`

---

## 7. Phạm vi & giới hạn (đọc kỹ)

- Bản này hướng dẫn **nội dung điều khoản có phiên bản** và **ảnh chụp khi phát hành** — **không** khẳng định module hợp đồng / bản in PDF đã nghiệm thu vận hành.
- **Tải / dựng tệp DOCX** làm nguồn hoặc đầu ra chính là **giai đoạn sau** — không thuộc hướng dẫn bản này.
- **Kéo-thả sắp xếp thứ tự điều khoản trên mẫu** là chủ đề cấu hình bố cục riêng — không gộp vào thư viện nội dung ở đây.
- Màn nghiệp vụ hợp đồng **không** được dùng làm nơi nhúng sẵn cả đoạn văn luật dài; nội dung luôn lấy từ thư viện hoặc ảnh chụp.
- Chỗ điền sẵn trong nội dung dùng dạng `{{tên_trường}}`; không trộn nhiều kiểu ký hiệu khác trên cùng một mẫu.
- Thư viện điều khoản **khác** sổ đăng ký hợp đồng (tab Hợp đồng trên hồ sơ) và **khác** danh mục mẫu loại × khối — mỗi màn một việc.

---

## 8. Lưu ý nhanh

| Tình huống | Xử lý đúng |
|------------|------------|
| Cần đổi câu điều khoản cho HĐ mới | Sửa thư viện (nháp) hoặc **tăng phiên bản** nếu đã gắn bản phát hành; HĐ cũ giữ ảnh chụp |
| Muốn HĐ cũ cũng đổi theo câu mới | Không hỗ trợ ghi đè hồi tố — phát hành phụ lục / bản mới theo quy trình pháp lý riêng |
| Dán cả văn bản HĐ dài vào màn tạo HĐ | Không — đưa nội dung vào thư viện điều khoản |
| Thấy cảnh báo khi lưu sau khi đã phát hành | Làm theo hướng dẫn **tăng phiên bản / kích hoạt** — không bỏ qua |
| Muốn sắp xếp lại thứ tự trên mẫu bằng kéo-thả | Ngoài phạm vi bản này — xem hướng dẫn cấu hình mẫu / bố cục khi có |
| Muốn tải DOCX làm mẫu | Giai đoạn sau — chưa thuộc bản hướng dẫn này |

---

*Hết Chương 6h — thư viện điều khoản hợp đồng là nguồn nội dung tiếng Việt có phiên bản; sửa sau phát hành = tăng phiên bản, hợp đồng cũ giữ ảnh chụp; màn nghiệp vụ không hardcode văn bản luật dài; DOCX và kéo-thả bố cục = ngoài phạm vi / giai đoạn sau — không đồng nghĩa module hợp đồng / bản in đã nghiệm thu vận hành.*