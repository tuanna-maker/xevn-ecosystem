# Kế hoạch phân rã công việc (WBS)
## Phân hệ Quản lý vận hành — XeVN

| Thuộc tính | Giá trị |
|---|---|
| Dự án | Triển khai phân hệ Quản lý vận hành |
| Phạm vi đợt 1 | Các chức năng vận hành xe tuyến đến hết **Thiết lập giá nhiên liệu** (theo thỏa thuận với khách hàng) |
| Đối tượng tài liệu | Khách hàng, ban dự án, điều hành vận tải |
| Phiên bản | 2.1 |

*Nguyên tắc **Web Portal gán danh mục — phân hệ tải và bổ sung danh mục riêng** được chốt tại mục **§3.1.1** trong `docs/BRD_XEVN_OPERATIONS_MODULE.md` và nhắc lại ở Phần **C.6** dưới đây.*

---

## Phần A — Danh mục chức năng (đợt 1)

Các **nhóm năng lực** cần có sau triển khai đợt 1:

| STT | Nhóm chức năng | Mô tả ngắn |
|---:|---|---|
| 1 | **Bảng tải** | Theo dõi trạng thái xe và lái xe theo từng nhóm trạng thái vận hành; lọc theo tuyến, ngày, tìm kiếm. |
| 2 | **Thiết lập bảng tải và băng tải** | Cấu hình khung giờ / chuyến theo tuyến (mặc định hoặc thủ công); quản lý lịch sử thiết lập băng tải thủ công và hủy áp dụng. |
| 3 | **Thiết lập tuyến** | Quản lý tuyến, lộ trình và điểm dừng động; thêm, sửa, xóa theo quyền. |
| 4 | **Thiết lập điểm đón trả** | Tạo và sửa điểm trên biểu mẫu; tra cứu danh sách có lọc; xem chi tiết, sửa, xóa, in. |
| 5 | **Tài khoản nhân viên vận hành** | Tạo và cập nhật hồ sơ gắn với tài khoản đăng nhập do hệ thống chung cấp; danh sách nhân viên. |
| 6 | **Phân quyền phần mềm** | Gán quyền sử dụng các phần phân hệ vận hành theo vai trò và phạm vi được phép. |
| 7 | **Nhật ký thiết lập** | Xem lịch sử thay đổi cấu hình và thao tác quan trọng (người thực hiện, thời gian, nội dung thay đổi). |
| 8 | **Lệnh điều xe** | Lập lệnh **xe tăng cường**; lập lệnh **xe đi tour** (khách hàng, lịch trình, điểm đón động, thanh toán, chọn xe). |
| 9 | **Lịch và bảng công lái xe** | Xem tổng hợp lịch lái theo tuyến và ngày; xem bảng công theo tháng và chi tiết chấm công từng ngày. |
| 10 | **Bảo dưỡng sửa chữa (BDSC)** | Lịch bảo dưỡng theo tháng / xe; danh sách phiếu chờ; xem và cập nhật chi tiết phiếu; in phiếu. |
| 11 | **Vệ sinh nội thất chuyên sâu** | Lịch và thao tác tương tự kênh BDSC, tách báo cáo theo loại công việc VSNT. |
| 12 | **Giá nhiên liệu** | Nhập ma trận giá theo vùng và loại nhiên liệu, có thời điểm hiệu lực; xem và tra cứu lịch sử điều chỉnh. |

---

## Phần B — Danh sách kịch bản sử dụng (theo từng màn hình nghiệp vụ)

Bảng dưới là **nhóm kịch bản chính** cần hoàn thành trong đợt 1. Danh sách **chi tiết theo tab, nút và thao tác** được chuẩn hóa tại `docs/USECASE_XEVN_OPERATIONS_MODULE.md`, tổng **38** use case.

| STT | Tên màn hình / kịch bản | Người dùng chính | Mục đích |
|---:|---|---|---|
| 1 | **Bảng tải** | Điều hành | Xem danh sách xe và lái xe theo từng tab trạng thái; lọc và tìm kiếm. |
| 2 | **Thiết lập bảng tải** | Điều hành / Quản trị | Cấu hình và lưu bảng tải (chế độ mặc định hoặc thủ công, sinh khung giờ / chuyến). |
| 3 | **Lịch sử thiết lập băng tải** | Điều hành | Xem lịch sử thiết lập băng tải thủ công; hủy áp dụng khi được phép. |
| 4 | **Thiết lập tuyến** | Quản trị vận hành | Thêm, sửa, xóa tuyến và điểm dừng trên lộ trình. |
| 5 | **Biểu mẫu điểm đón trả** | Quản trị vận hành | Tạo hoặc cập nhật một điểm đón trả (gắn tuyến, loại điểm, địa chỉ, liên hệ). |
| 6 | **Danh sách điểm đón trả** | Điều hành | Tra cứu toàn bộ điểm có lọc và phân trang; mở chi tiết. |
| 7 | **Chi tiết điểm đón trả** | Điều hành | Xem đầy đủ; sửa hoặc xóa; in. |
| 8 | **Thiết lập tài khoản nhân viên** | Quản trị | Tạo / cập nhật nhân viên vận hành và liên kết tài khoản đăng nhập. |
| 9 | **Phân quyền phần mềm** | Quản trị | Gán hoặc thu hồi quyền theo vai trò và phạm vi. |
| 10 | **Nhật ký thiết lập** | Quản trị / Kiểm toán nội bộ | Tra cứu nhật ký thay đổi cấu hình. |
| 11 | **Lệnh xe tăng cường** | Điều hành | Lập lệnh tăng cường (xe, lái, tuyến, khung giờ, lý do). |
| 12 | **Lệnh xe đi tour** | Điều hành | Lập lệnh tour (khách, lịch, điểm đón động, thanh toán, xe nếu có). |
| 13 | **Tổng hợp lịch lái xe theo tuyến** | Điều hành / Nhân sự vận hành | Xem bảng tổng hợp theo ngày và tuyến. |
| 14 | **Bảng công lái xe** | Điều hành | Xem lưới công theo tháng; mở chi tiết chấm công từng ngày. |
| 15 | **Lịch BDSC và danh sách chờ** | Điều hành / Kỹ thuật | Xem lịch bảo dưỡng và danh sách phiếu chờ xử lý. |
| 16 | **Chi tiết phiếu BDSC** | Điều hành | Xem và cập nhật phiếu; in phiếu. |
| 17 | **Lịch vệ sinh nội thất chuyên sâu** | Điều hành | Quản lý lịch và thao tác VSNT (bố cục tương tự kênh BDSC). |
| 18 | **Thiết lập giá nhiên liệu** | Quản trị | Nhập phiên bản giá; ma trận theo vùng và loại nhiên liệu; lịch sử. |

---

## Phần C — Cấu trúc phân rã công việc (WBS)

### C.1 Quản trị dự án
- Khởi động dự án, họp định kỳ với khách hàng.
- Chốt phạm vi đợt 1 và cách xử lý thay đổi phạm vi.
- Phân vai trò trách nhiệm (RACI), theo dõi rủi ro và vướng mắc.
- Báo cáo tiến độ theo tuần / theo mốc.

**Kết quả:** Kế hoạch tổng thể, biên bản họp, nhật ký rủiều — vận hành.

---

### C.2 Làm rõ và thống nhất nghiệp vụ
- Thu thập quy trình vận hành hiện tại (điều hành xe, tuyến, lệnh, lịch lái, bảo dưỡng).
- Thống nhất từ ngữ và quy tắc nghiệp vụ với khách hàng.
- Phân định phạm vi **có** / **không** trong đợt 1 (ví dụ: quản lý khách hàng vé / hợp đồng; định mức nhiên liệu theo xe nếu thuộc đợt sau).

**Kết quả:** Tài liệu mô tả nghiệp vụ và phạm vi đã ký nhận.

---

### C.3 Chốt tài liệu làm căn cứ triển khai
- Duyệt yêu cầu nghiệp vụ tổng quan (BRD).
- Duyệt đặc tả chi tiết chức năng và kịch bản kiểm thử chấp nhận (SRS).
- Duyệt phương án triển khai kỹ thuật và tích hợp (tài liệu kỹ thuật nội bộ — khách hàng ký phần liên quan phạm vi và nghiệm thu).

**Kết quả:** Bộ tài liệu đã được phê duyệt làm cơ sở build và nghiệm thu.

---

### C.4 Thiết kế chi tiết và chuẩn bị vận hành thử
- Hoàn thiện mô hình dữ liệu và luồng xử lý chi tiết (do đội kỹ thuật thực hiện).
- Chuẩn bị môi trường dùng thử và môi trường chính thức theo kế hoạch.
- Chuẩn bị kế hoạch chuyển đổi dữ liệu nếu có.

**Kết quả:** Môi trường sẵn sàng; kế hoạch chuyển đổi và go-live.

---

### C.5 Triển khai chức năng đợt 1 (theo Phần A và B)

Gói công việc gắn với **từng nhóm màn hình** đã thống nhất:

| Gói | Nội dung giao cho đội triển khai |
|---:|---|
| **1** | Bảng tải vận hành: xem trạng thái, lọc theo tuyến/ngày, xem chi tiết xe và lái xe. |
| **2** | Thiết lập bảng tải và lịch chuyến: thiết lập mặc định/thủ công, sinh khung giờ, lịch sử và hủy phiên đã áp dụng. |
| **3** | Quản lý tuyến: thêm/sửa/xóa tuyến, quản lý điểm dừng, kích hoạt hoặc tạm ngưng tuyến. |
| **4** | Quản lý điểm đón trả: biểu mẫu, danh sách, chi tiết, in dữ liệu tác nghiệp. |
| **5** | Nhân sự vận hành và truy cập: tài khoản nhân viên, khóa/mở khóa, phân quyền theo nhóm chức năng, nhật ký và lọc nhật ký. |
| **6** | Điều xe: lệnh xe tăng cường, duyệt lệnh, lệnh xe đi tour, cập nhật trạng thái thực hiện. |
| **7** | Lịch lái và công lái: tổng hợp lịch theo tuyến, lọc theo tài xế/tuyến, xem và chỉnh sửa công lái theo ngày. |
| **8** | Bảo dưỡng sửa chữa và vệ sinh nội thất: lịch, danh sách chờ, tạo/cập nhật/đóng phiếu, theo dõi vòng đời xử lý. |
| **9** | Nhiên liệu: thiết lập giá, kích hoạt phiên bản theo hiệu lực, tra cứu lịch sử thay đổi giá. |

Mỗi gói kết thúc khi: giao diện đúng phạm vi, luồng nghiệp vụ chạy được trên môi trường thử, có bằng chứng kiểm thử nội bộ và khách hàng có thể xem demo theo kế hoạch.

---

### C.6 Tích hợp với hệ thống chung (nếu áp dụng)
- Đăng nhập thống nhất và phân quyền theo tổ chức.
- **Nguyên tắc danh mục (bắt buộc thống nhất với toàn hệ sinh thái):** Web Portal **gán** danh mục dùng chung cho từng **đối tượng** và cho **phân hệ Vận hành** (ví dụ tuyến, điểm, vùng, loại nhiên liệu, loại xe, đơn vị tổ chức… tùy cấu hình tập đoàn). Phân hệ Vận hành **mặc định phải tải và sử dụng** đúng các danh mục đã được gán; **đồng thời** được phép có **danh mục / tham số riêng** nội bộ vận hành (bảng tải, ca, phiếu BDSC, …) miễn không trái quy tắc chung và không nhân đôi “nguồn chuẩn” thuộc phạm vi Portal.
- Thông báo (email / tin nhắn) theo chính sách đã chốt.

**Kết quả:** Các luồng tích hợp đã kiểm chứng với bên cung cấp nền tảng; kiểm thử có checklist **danh mục Portal gán vs danh mục riêng vận hành**.

---

### C.7 Kiểm thử và nghiệm thu
- Kiểm thử chức năng theo từng kịch bản Phần B.
- Kiểm thử hiệu năng và bảo mật ở mức đã thỏa thuận trong hợp đồng / phụ lục.
- **UAT:** khách hàng chạy kịch bản theo vai trò; ghi nhận lỗi và xử lý; ký biên bản nghiệm thu chấp nhận.

**Kết quả:** Biên bản UAT; danh sách lỗi đã đóng; xác nhận đạt tiêu chí nghiệm thu đợt 1.

---

### C.8 Đưa vào vận hành, đào tạo, hỗ trợ sau go-live
- Kế hoạch cắt sang hệ thống mới và phương án quay lại nếu sự cố.
- Đào tạo người dùng (điều hành, quản trị, kỹ thuật xe — theo danh sách khách hàng cung cấp).
- Bàn giao tài liệu hướng dẫn sử dụng và quy trình vận hành.
- Hỗ trợ tập trung sau ngày go-live (thời hạn theo hợp đồng).

**Kết quả:** Biên bản go-live; tài liệu đào tạo; kết thúc giai đoạn hỗ trợ theo cam kết.

---

## Phần D — Các mốc đề xuất chốt với khách hàng

| Mốc | Nội dung | Điều kiện coi là đạt |
|---|---|---|
| **M1** | Phê duyệt tài liệu nghiệp vụ và phạm vi | Khách hàng ký / xác nhận bằng văn bản |
| **M2** | Hoàn thành triển khai các nhóm kịch bản Phần B và danh sách chi tiết **38 use case** | Chạy thử thành công trên môi trường UAT theo danh mục đã chốt |
| **M3** | Nghiệm thu UAT | Đạt tiêu chí chấp nhận đã ghi trong đặc tả / phụ lục nghiệm thu |
| **M4** | Go-live đợt 1 | Đưa phân hệ vào sử dụng thật theo kế hoạch |
| **M5** | Kết thúc hỗ trợ sau go-live | Không còn lỗi chặn sản xuất; bàn giao xong tài liệu |

*(Mở rộng sau đợt 1 — ví dụ: quản lý đơn hàng hóa, kho, giao nhận tại chỗ, thuê ngoài, báo cáo chốt ca nâng cao — được chốt ở giai đoạn và hợp đồng riêng.)*

---

## Phần E — Lịch tham chiếu (có thể điều chỉnh theo hợp đồng)

| Giai đoạn | Thời lượng gợi ý |
|---|---|
| Làm rõ nghiệp vụ và phê duyệt tài liệu | 2–4 tuần |
| Thiết kế chi tiết và môi trường | 1–2 tuần |
| Triển khai gói 1–3 (bảng tải, thiết lập tuyến / điểm / băng tải) | 3–4 tuần |
| Triển khai gói 4–6 (điểm đón trả, tài khoản, quyền, nhật ký, lệnh xe) | 3–4 tuần |
| Triển khai gói 7–9 (lịch lái, BDSC, VSNT, giá nhiên liệu) | 3–4 tuần |
| Kiểm thử tích hợp, UAT, chỉnh sửa | 2–3 tuần |
| Go-live và hỗ trợ sau vận hành | Theo cam kết |

---

## Phần F — Điều kiện cần phía khách hàng

- Cung cấp đúng hạn **danh mục dữ liệu nền** (tuyến, xe, lái xe, địa bàn, vùng giá nhiên liệu, …) theo format thống nhất.
- Cử **người phụ trách nghiệp vụ** và **người tham gia UAT** theo từng vai trò.
- Phê duyệt kịp thời các quyết định phạm vi và ngoại lệ nghiệp vụ phát sinh.
- Cấp quyền truy cập hệ thống chung (đăng nhập, phân quyền) theo quy trình tập đoàn nếu có.

---

*Tài liệu này mô tả công việc và kết quả từ góc nhìn **nghiệp vụ và quản lý dự án**. Chi tiết kỹ thuật triển khai do đội dự án thực hiện theo tài liệu nội bộ đã phê duyệt và không thay thế hợp đồng / phụ lục pháp lý.*
