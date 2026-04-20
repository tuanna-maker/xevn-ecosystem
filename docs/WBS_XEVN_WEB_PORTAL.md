# Kế hoạch phân rã công việc (WBS)
## Cổng Web Portal (XeVN OS) — giao diện đa tenant và menu trái thống nhất

| Thuộc tính | Giá trị |
|---|---|
| Dự án | Triển khai / hoàn thiện **Cổng Web Portal** trong hệ sinh thái XeVN |
| Phạm vi | Giao diện **đa tenant** với **một menu trái thống nhất**, cấu hình phân hệ theo quyền, và các workspace dùng chung (`/dashboard/*`: tổ chức, nhân sự cấp tập đoàn, khách hàng, đối tác, chỉ số hiệu quả, danh mục cài đặt) |
| Đối tượng tài liệu | Khách hàng, ban dự án, lãnh đạo điều hành, quản trị nền tảng |
| Phiên bản | 1.1 |

*Vai trò Portal trong **gán danh mục dùng chung** cho từng phân hệ (HRM, Vận hành, …) được chốt đồng bộ với `docs/BRD_XEVN_OPERATIONS_MODULE.md` mục **§3.1.1**; các phân hệ chỉ **tải** phần đã gán và **bổ sung** danh mục riêng trong phạm vi cho phép.*

---

## Phần A — Danh mục chức năng

Các **nhóm năng lực** của Portal XeVN, xếp theo lớp điều hướng trong hệ sinh thái (từ cổng vào → điều hành → nghiệp vụ sâu):

| STT | Nhóm chức năng | Mô tả ngắn |
|---:|---|---|
| 1 | **Truy cập và điều hướng đa tenant** | Người dùng đăng nhập vào đúng tenant, thấy đúng menu trái theo quyền, chọn phân hệ nào thì hiển thị nội dung nghiệp vụ và menu con của phân hệ đó. |
| 2 | **Điều phối phân hệ trên menu trái** | Chuyển phân hệ nhanh, giữ trạng thái làm việc phù hợp, tìm nhanh chức năng, thông báo rõ khi phân hệ chưa sẵn sàng. |
| 3 | **Không gian làm việc dùng chung cấp tập đoàn** | Các khu vực nghiệp vụ dùng chung: tổ chức, nhân sự cấp tập đoàn, khách hàng, đối tác, chính sách và bảng điều khiển chỉ số hiệu quả. |
| 4 | **Cài đặt hệ thống dùng chung** | Quản lý danh mục dùng chung cho toàn hệ sinh thái: chức vụ, phòng ban, vùng địa lý, loại phương tiện, đối tác/nhà cung cấp, loại chi phí, chỉ số, công thức chỉ số. |
| 5 | **Workspace — Tổ chức** | Xem và thao tác thông tin cấu trúc tổ chức phục vụ điều hành (gắn với dữ liệu chung XeVN). |
| 6 | **Workspace — Nhân sự cấp tập đoàn** | Góc nhìn nhân sự cấp tập đoàn (khác với HRM chi tiết): tổng hợp / điều hướng theo mô hình tập đoàn. |
| 7 | **Workspace — Khách hàng (CRM)** | Danh mục và luồng làm việc với khách hàng trên nền chung XeVN. |
| 8 | **Workspace — Đối tác** | Quản lý / tra cứu đối tác, phục vụ chuỗi vận hành và kinh doanh liên kết. |
| 9 | **Workspace — Chính sách KPI** | Thiết lập và quản lý khung KPI theo chính sách tập đoàn (đồng bộ với các module báo cáo). |
| 10 | **Workspace — Bảng điều khiển KPI** | Hiển thị và theo dõi KPI đã cấu hình; hỗ trợ ra quyết định điều hành. |
| 11 | **Cài đặt hệ thống — Danh mục chức vụ** | Quản lý danh mục chức vụ dùng chung cho các phân hệ XeVN. |
| 12 | **Cài đặt hệ thống — Danh mục phòng ban** | Khai báo cơ cấu phòng ban (theo roadmap; có thể ở trạng thái placeholder cho đến khi hoàn thiện). |
| 13 | **Cài đặt hệ thống — Vùng địa lý** | Phân vùng địa lý phục vụ báo cáo, KPI, vận hành (theo roadmap). |
| 14 | **Cài đặt hệ thống — Loại phương tiện** | Danh mục loại phương tiện dùng chung (X-BOS / vận hành / báo cáo). |
| 15 | **Cài đặt hệ thống — Đối tác / nhà cung cấp** | Danh mục NCC / đối tác cấu hình. |
| 16 | **Cài đặt hệ thống — Loại chi phí** | Phân loại chi phí phục vụ kế hoạch tài chính — vận hành. |
| 17 | **Cài đặt hệ thống — KPI & Metric** | Định nghĩa chỉ số và metric dùng trong các bảng KPI. |
| 18 | **Cài đặt hệ thống — Công thức KPI** | Gán công thức tính toán cho KPI (theo roadmap; có thể placeholder). |
| 19 | **Điều hướng liên module trong hệ sinh thái** | Menu Portal liên kết các sản phẩm XeVN (X-BOS, vận tải, bảo dưỡng, …) theo quyền; HRM độc lập hoặc nhúng thống nhất trải nghiệm. |
| 20 | **Trải nghiệm người dùng & phân quyền theo tổ chức** | Đăng nhập / phân quyền theo chính sách tập đoàn; ẩn hiện menu theo vai trò; nhất quán visual XeVN. |

---

## Phần B — Danh sách kịch bản sử dụng (nhóm chính)

Bảng dưới là **nhóm kịch bản chính** để quản lý phạm vi. Danh sách **chi tiết theo tab, nút và thao tác** được chuẩn hóa tại `docs/USECASE_XEVN_WEB_PORTAL.md`, tổng **24** use case.

| STT | Nhóm kịch bản | Người dùng chính | Mục đích |
|---:|---|---|---|
| 1 | **Đăng nhập vào hệ sinh thái đa tenant** | Mọi người dùng | Truy cập đúng tenant và đúng phạm vi dữ liệu. |
| 2 | **Hiển thị menu trái theo quyền** | Mọi người dùng | Chỉ thấy phân hệ và chức năng được cấp quyền. |
| 3 | **Mở phân hệ từ menu trái** | Mọi người dùng | Bấm phân hệ để hiển thị nội dung nghiệp vụ tương ứng. |
| 4 | **Hiển thị menu con theo phân hệ** | Mọi người dùng | Vào phân hệ nào thì hiện menu con của phân hệ đó. |
| 5 | **Chuyển phân hệ đang làm việc** | Điều hành / Quản trị | Đổi ngữ cảnh làm việc nhanh giữa các phân hệ. |
| 6 | **Giữ trạng thái khi đổi menu** | Mọi người dùng | Duy trì bộ lọc/ngữ cảnh khi đổi màn hình phù hợp. |
| 7 | **Ghi nhớ phân hệ mở gần nhất** | Mọi người dùng | Quay lại nhanh khu vực làm việc đang dở. |
| 8 | **Tìm nhanh chức năng trên menu trái** | Mọi người dùng | Rút ngắn thời gian điều hướng. |
| 9 | **Thông báo phân hệ chưa sẵn sàng** | Mọi người dùng | Biết rõ trạng thái triển khai chức năng. |
| 10 | **Không gian tổ chức** | Quản trị / Điều hành | Xem cấu trúc tổ chức cấp tập đoàn. |
| 11 | **Không gian nhân sự cấp tập đoàn** | HR / Lãnh đạo | Theo dõi tổng quan nhân sự đa đơn vị. |
| 12 | **Không gian khách hàng** | Kinh doanh / Chăm sóc khách hàng | Làm việc với danh sách và thông tin khách hàng. |
| 13 | **Không gian đối tác** | Kinh doanh / Mua hàng | Làm việc với danh sách và thông tin đối tác. |
| 14 | **Không gian chính sách chỉ số hiệu quả** | Lãnh đạo / Chủ sở hữu chỉ số | Cấu hình khung chỉ số hiệu quả. |
| 15 | **Không gian bảng điều khiển chỉ số hiệu quả** | Lãnh đạo | Theo dõi chỉ số hiệu quả đã định nghĩa. |
| 16 | **Danh mục chức vụ dùng chung** | Quản trị hệ thống | Tạo, sửa, xóa chức vụ dùng chung. |
| 17 | **Danh mục phòng ban dùng chung** | Quản trị hệ thống | Tạo, sửa, xóa phòng ban dùng chung. |
| 18 | **Danh mục vùng địa lý dùng chung** | Quản trị hệ thống | Tạo, sửa, xóa vùng địa lý dùng chung. |
| 19 | **Danh mục loại phương tiện dùng chung** | Quản trị vận hành | Tạo, sửa, xóa loại phương tiện. |
| 20 | **Danh mục đối tác và nhà cung cấp dùng chung** | Quản trị hệ thống | Tạo, sửa, xóa đối tác và nhà cung cấp. |
| 21 | **Danh mục loại chi phí dùng chung** | Tài chính / Quản trị | Tạo, sửa, xóa loại chi phí. |
| 22 | **Danh mục chỉ số và chỉ tiêu đo lường** | Chủ sở hữu chỉ số | Định nghĩa chỉ số theo dõi. |
| 23 | **Danh mục công thức chỉ số hiệu quả** | Chủ sở hữu chỉ số / Quản trị nghiệp vụ | Cấu hình công thức tính chỉ số hiệu quả. |
| 24 | **Phân quyền truy cập menu và chức năng** | Quản trị hệ thống | Kiểm soát ẩn/hiện và truy cập theo vai trò. |

---

## Phần C — Cấu trúc phân rã công việc (WBS)

### C.1 Quản trị dự án
- Khởi động dự án, họp định kỳ với khách hàng.
- Chốt phạm vi Portal (đăng nhập đa tenant, menu trái thống nhất, workspace, cài đặt dùng chung) và quy tắc thay đổi phạm vi.
- Phân vai trò trách nhiệm (RACI), theo dõi rủi ro (đặc biệt: tích hợp đa module XeVN).
- Báo cáo tiến độ theo tuần / theo mốc.

**Kết quả:** Kế hoạch tổng thể, biên bản họp, nhật ký rủi ro — vận hành.

---

### C.2 Làm rõ và thống nhất nghiệp vụ
- Thống nhất **hành trình người dùng**: đăng nhập đa tenant → menu trái theo quyền → mở phân hệ → hiển thị nội dung nghiệp vụ và menu con của phân hệ.
- Làm rõ ranh giới: dữ liệu nào thuộc **Portal tổng**, dữ liệu nào thuộc **HRM**, dữ liệu nào đồng bộ **X-BOS / vận hành / KPI**.
- Chốt từ ngữ thương hiệu: **XeVN OS**, workspace tập đoàn, CRM, đối tác, KPI.

**Kết quả:** Mô tả nghiệp vụ và phạm vi đã ký nhận.

---

### C.3 Chốt tài liệu làm căn cứ triển khai
- Duyệt BRD / SRS / Tech spec (theo cấp độ áp dụng cho Portal).
- Chốt danh mục màn hình Phần B làm cơ sở nghiệm thu.

**Kết quả:** Bộ tài liệu phê duyệt làm cơ sở build và UAT.

---

### C.4 Thiết kế chi tiết và chuẩn bị vận hành thử
- Chuẩn hóa layout (header, sidebar/menu trái thống nhất, responsive).
- Chuẩn bị môi trường UAT / Production; cấu hình tenant, quyền menu và cơ chế đăng nhập thống nhất.

**Kết quả:** Môi trường sẵn sàng; kế hoạch go-live Portal.

---

### C.5 Triển khai chức năng (theo Phần A và B)

| Gói | Nội dung giao cho đội triển khai |
|---:|---|
| **1** | Đăng nhập đa tenant, hiển thị menu trái theo quyền, mở/chuyển phân hệ, giữ trạng thái và tìm nhanh chức năng. |
| **2** | Workspace dùng chung: tổ chức, nhân sự cấp tập đoàn, khách hàng, đối tác. |
| **3** | Workspace chỉ số hiệu quả: chính sách chỉ số và bảng điều khiển chỉ số. |
| **4** | Cài đặt danh mục dùng chung: chức vụ, phòng ban, vùng địa lý, loại phương tiện, đối tác/nhà cung cấp, loại chi phí. |
| **5** | Cài đặt chỉ số: danh mục chỉ số và công thức tính chỉ số hiệu quả. |
| **6** | Phân quyền menu/chức năng, xử lý trạng thái phân hệ chưa sẵn sàng, hoàn thiện các mục theo lộ trình. |

Mỗi gói kết thúc khi: giao diện đúng phạm vi, luồng điều hướng trên menu trái ổn định, các phân hệ hiển thị đúng nội dung và menu con theo cấu hình, có bằng chứng kiểm thử nội bộ.

---

### C.6 Tích hợp với hệ sinh thái XeVN
- Liên kết menu tới các ứng dụng XeVN (BOS, vận tải, bảo dưỡng, …) theo quyền và môi trường.
- **Vai trò Web Portal đối với danh mục:** Portal là nơi **khai báo và gán** danh mục dùng chung cho từng **đối tượng** và cho từng **phân hệ** (HRM, Vận hành, CRM, KPI, …). Các phân hệ **không** thay thế vai trò gán này; họ **tải** đúng phần đã gán và **bổ sung** danh mục / tham số **riêng của phân hệ** khi được phép. Triển khai workspace cài đặt (chức vụ, phòng ban, vùng, loại phương tiện, …) phải **khớp** nguyên tắc đó để tránh lệch dữ liệu giữa Portal và các module.
- Thông báo và nhật ký truy cập theo chính sách tập đoàn.

**Kết quả:** Các luồng tích hợp đã kiểm chứng; cấu hình gán danh mục được kiểm thử với ít nhất một phân hệ vệ tinh.

---

### C.7 Kiểm thử và nghiệm thu
- Kiểm thử theo các nhóm kịch bản Phần B và danh sách chi tiết **24 use case**.
- Kiểm thử điều hướng: đăng nhập đa tenant → menu trái theo quyền → phân hệ/workspace tương ứng.
- **UAT:** khách hàng chạy theo vai trò; biên bản nghiệm thu.

**Kết quả:** Biên bản UAT; lỗi chặn đã xử lý.

---

### C.8 Đưa vào vận hành, đào tạo, hỗ trợ sau go-live
- Go-live Portal; đào tạo lãnh đạo, điều hành và quản trị theo mô hình menu trái đa tenant.
- Bàn giao hướng dẫn “một cổng XeVN”.
- Hỗ trợ sau go-live theo hợp đồng.

**Kết quả:** Biên bản go-live; tài liệu đào tạo.

---

## Phần D — Các mốc đề xuất chốt với khách hàng

| Mốc | Nội dung | Điều kiện coi là đạt |
|---|---|---|
| **M1** | Phê duyệt phạm vi Portal và danh mục màn hình | Xác nhận bằng văn bản |
| **M2** | Hoàn thành **34 kịch bản** Phần B trên UAT | Demo và checklist pass |
| **M3** | Nghiệm thu UAT | Ký biên bản |
| **M4** | Go-live Portal | Portal mở cho người dùng thật |
| **M5** | Kết thúc hỗ trợ sau go-live | Tài liệu bàn giao; không lỗi chặn |

---

## Phần E — Lịch tham chiếu (có thể điều chỉnh theo hợp đồng)

| Giai đoạn | Thời lượng gợi ý |
|---|---|
| Làm rõ nghiệp vụ và phê duyệt tài liệu | 2–3 tuần |
| Nền tảng đăng nhập đa tenant + menu trái thống nhất | 2–3 tuần |
| Tích hợp HRM nhúng (full view) | 2–4 tuần |
| Workspace tổ chức / HR / CRM / Đối tác / KPI | 3–5 tuần |
| Danh mục cài đặt + placeholder nâng cấp | 2–4 tuần |
| Kiểm thử tích hợp, UAT | 2–3 tuần |
| Go-live và hỗ trợ | Theo cam kết |

---

## Phần F — Điều kiện cần phía khách hàng

- Cung cấp **cấu trúc tổ chức**, **danh mục KPI**, **CRM / đối tác** mẫu để cấu hình và UAT.
- Cử **owner nghiệp vụ** cho từng workspace (tổ chức, HR portal, CRM, KPI).
- Phê duyệt kịp thời phạm vi placeholder (phòng ban, vùng, công thức KPI).
- Cấp quyền **đăng nhập thống nhất** và chính sách bảo mật tập đoàn (nếu áp dụng).

---

*Tài liệu này mô tả công việc và kết quả từ góc nhìn **nghiệp vụ và quản lý dự án** trong hệ sinh thái **XeVN**. Chi tiết kỹ thuật triển khai do đội dự án thực hiện theo tài liệu nội bộ đã phê duyệt và không thay thế hợp đồng / phụ lục pháp lý.*
