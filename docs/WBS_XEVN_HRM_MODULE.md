# Kế hoạch phân rã công việc (WBS)
## Phân hệ HRM (Nhân sự) — liên kết hệ sinh thái XeVN

| Thuộc tính | Giá trị |
|---|---|
| Dự án | Triển khai / hoàn thiện **ứng dụng HRM** trong hệ sinh thái giao diện đa tenant (một menu trái dùng chung) |
| Phạm vi | Toàn bộ **màn hình**, **menu điều hướng**, **thao tác danh sách / nút hành động** trên các màn trọng tâm; gồm cả các **năng lực hậu trường** cần thiết cho mời thành viên, cấp quyền quản trị, trợ lý AI và hỗ trợ tài khoản (diễn đạt theo nghiệp vụ, không liệt kê chi tiết kỹ thuật triển khai). |
| Đối tượng tài liệu | Khách hàng, HRBP, quản trị doanh nghiệp, quản trị nền tảng XeVN |
| Phiên bản | 1.1 |

*Nguyên tắc chung **danh mục do Web Portal gán — phân hệ tải và bổ sung danh mục riêng** được chốt xuyên suốt với tài liệu hệ sinh thái; bản diễn đạt đầy đủ cho toàn bộ phân hệ nằm tại `docs/BRD_XEVN_OPERATIONS_MODULE.md` mục **§3.1.1** (HRM tuân thủ cùng quy tắc).*

---

## Phần A — Danh mục chức năng

Các **nhóm năng lực** HRM trong bối cảnh **XeVN**: dữ liệu nhân sự phục vụ vận hành tập đoàn; có thể mở từ **Cổng Portal** hoặc truy cập trực tiếp ứng dụng HRM.

| STT | Nhóm chức năng | Mô tả ngắn |
|---:|---|---|
| 1 | **Cổng công khai & xác thực** | Landing giới thiệu; đăng nhập / đăng ký; quên mật khẩu / đặt lại mật khẩu; onboarding doanh nghiệp; chính sách bảo mật; hướng dẫn sử dụng. |
| 2 | **Quản trị nền tảng XeVN** | Tạo **quản trị viên doanh nghiệp** cho một tổ chức khách hàng; khi có quy trình nội bộ — bổ sung **quản trị viên nền tảng**; giám sát đa tổ chức (theo màn hiện có). |
| 3 | **Hỗ trợ tài khoản có kiểm soát** | Đặt lại mật khẩu hoặc xử lý truy cập cho người dùng theo **quyền hạn và quy trình vận hành** (phục vụ bộ phận hỗ trợ / quản trị, không thay thế luồng tự phục hồi của người dùng cuối). |
| 4 | **Tổng quan điều hành HR (Dashboard)** | Biểu đồ, cảnh báo hợp đồng sắp hết hạn, chỉ số nhân sự, liên kết nhanh tới các module. |
| 5 | **Nhân viên — danh sách & hồ sơ** | Bảng nhân viên: tìm kiếm, lọc (công ty / phòng ban / trạng thái), thêm — sửa — xem — lưu trữ; thao tác hàng loạt (xuất, nhập, danh sách đã xóa); xác nhận xóa có lý do; khôi phục; chi tiết hồ sơ từng người. |
| 6 | **Khối HR cốt lõi (menu phụ)** | Hợp đồng lao động; bảo hiểm; quyết định nhân sự — thống nhất với tuân thủ và vận hành XeVN. |
| 7 | **Tuyển dụng** | Pipeline / bảng kanban (kéo thả), chiến dịch, vị trí, ứng viên; thao tác tạo — sửa — xem — đánh giá (theo màn hiện có). |
| 8 | **Chấm công** | Ca, điểm danh, ngoại lệ, quy tắc vận hành (theo màn hiện có). |
| 9 | **Lương & phúc lợi** | Kỳ lương, thành phần lương, khấu trừ, báo cáo lương (theo màn hiện có). |
| 10 | **Công ty & thành viên** | Thông tin doanh nghiệp, gói đăng ký; **gửi lời mời thành viên** (email / liên kết an toàn); quản lý vai trò nội bộ. |
| 11 | **Báo cáo HRM** | Báo cáo theo module đã bật; phục vụ lãnh đạo và Portal XeVN. |
| 12 | **Cài đặt HRM** | Tham số hệ thống, tích hợp, phân quyền chi tiết (theo màn hiện có). |
| 13 | **UniAI — trợ lý thông minh** | Chat HRM đa ngôn ngữ; widget nổi trên các màn sau đăng nhập (có thể ẩn khi mở HRM trong chế độ nhúng Portal); trả lời theo ngữ cảnh nhân sự (chấm công, lương, phép, hợp đồng, …). |
| 14 | **Trợ lý AI trên trang công khai** | Trò chuyện với khách trên landing; tách biệt phạm vi với trợ lý sau đăng nhập; không thay thế cam kết pháp lý / hợp đồng. |
| 15 | **Đọc nội dung bằng giọng nói** | (Khi bật trong sản phẩm) Hỗ trợ trải nghiệm đa phương tiện cho đào tạo hoặc chăm sóc — chuyển văn bản thành giọng đọc. |
| 16 | **Công việc (Tasks)** | Theo dõi nhiệm vụ gắn quy trình / HR. |
| 17 | **Quy trình & chính sách** | Thư viện quy trình — chính sách nội bộ. |
| 18 | **Dịch vụ nội bộ** | Yêu cầu / theo dõi dịch vụ nội bộ cho nhân viên. |
| 19 | **Công cụ & thiết bị** | Quản lý công cụ, thiết bị gắn nhân sự hoặc đơn vị. |
| 20 | **Phân quyền theo phân hệ menu** | Ẩn hiện mục menu và màn hình theo quyền từng phân hệ; chỉ truy cập được sau khi xác thực. |

---

## Phần B — Danh sách kịch bản sử dụng (nhóm chính)

Bảng dưới là **nhóm kịch bản chính** để quản lý phạm vi triển khai. Danh sách **chi tiết theo tab, nút và thao tác** được chuẩn hóa tại `docs/USECASE_XEVN_HRM_MODULE.md`, tổng **72** use case.

| STT | Tên màn hình / kịch bản | Người dùng chính | Mục đích & thao tác chính (theo triển khai hiện có) |
|---:|---|---|---|
| 1 | **Landing (công khai)** | Khách / Người dùng mới | Giới thiệu; **trò chuyện với trợ lý AI** trên landing; điều hướng đăng nhập / đăng ký. |
| 2 | **Đăng nhập** | Mọi người dùng | Vào HRM theo **doanh nghiệp / đơn vị** được cấp quyền trên nền XeVN. |
| 3 | **Đăng ký** | Quản trị mới | Tạo tài khoản ban đầu (theo luồng ứng dụng). |
| 4 | **Onboarding doanh nghiệp** | Quản trị | Hoàn tất thiết lập công ty sau đăng ký. |
| 5 | **Quên mật khẩu** | Người dùng | Gửi / hướng dẫn khôi phục truy cập. |
| 6 | **Đặt lại mật khẩu** | Người dùng | Nhập mật khẩu mới theo liên kết khôi phục. |
| 7 | **Chính sách bảo mật** | Mọi người | Đọc điều khoản; thể hiện uy tín thương hiệu XeVN. |
| 8 | **Hướng dẫn sử dụng (Guide)** | Người dùng nội bộ | Tài liệu tự phục vụ trong hệ sinh thái. |
| 9 | **Quản trị nền tảng** | Admin XeVN | **Tạo quản trị viên doanh nghiệp** cho khách hàng; các thao tác quản trị đa tổ chức khác trên màn hiện có (và các luồng hỗ trợ tài khoản có kiểm soát khi được giao diện hóa). |
| 10 | **Trang chủ so với mục Danh sách nhân viên** | HR / Lãnh đạo | **Dashboard** (trang chủ): chỉ số, biểu đồ, cảnh báo hợp đồng; liên kết module; thao tác báo cáo nhanh. *Lưu ý nghiệm thu: một mục menu có thể dẫn tới màn **Danh sách nhân viên** thay vì cùng nội dung với Dashboard — cần thống nhất nhãn và kỳ vọng người dùng.* |
| 11 | **Danh sách nhân viên** | HR | **Thanh công cụ:** thêm nhân viên, nhập file, xuất file, danh sách đã xóa, tìm kiếm, lọc công ty / phòng ban / trạng thái. **Bảng:** xem chi tiết, sửa, lưu trữ, menu thao tác thêm (xóa, …). **Hộp thoại:** tạo — sửa; xác nhận xóa có **lý do**; khôi phục từ danh sách đã xóa. Kiểm tra **giới hạn gói** khi thêm nhân viên. |
| 12 | **Hồ sơ nhân viên (chi tiết)** | HR | Xem và cập nhật chi tiết hồ sơ một nhân viên. |
| 13 | **Tuyển dụng** | HR | **Tab / bảng:** tổng quan, pipeline, vị trí, ứng viên; **kéo thả** thẻ trạng thái; nút thêm / sửa / xem / đánh giá / lịch / liên hệ (theo màn hiện có). |
| 14 | **Chấm công** | HR / Quản lý | Theo dõi và xử lý dữ liệu chấm công. |
| 15 | **Lương** | HR / Kế toán | Kỳ và bảng lương. |
| 16 | **Công ty** | Quản trị | Thông tin công ty, gói dịch vụ; **quản lý thành viên — gửi lời mời** (email / liên kết an toàn). |
| 17 | **Báo cáo** | HR / Lãnh đạo | Xuất / xem báo cáo tổng hợp. |
| 18 | **Cài đặt** | Quản trị HRM | Cấu hình tham số và quyền. |
| 19 | **Hợp đồng** | HR | Danh sách hợp đồng; thêm, sửa, gia hạn, cảnh báo (theo màn). |
| 20 | **Bảo hiểm** | HR | Theo dõi đóng — hưởng bảo hiểm. |
| 21 | **Quyết định** | HR | Lưu trữ và tra cứu quyết định nhân sự. |
| 22 | **UniAI** | Người dùng được phép | Khung chat chính; đa ngôn ngữ; trợ lý theo ngữ cảnh HRM. |
| 23 | **Công việc** | HR / Người dùng | Danh sách và cập nhật công việc. |
| 24 | **Quy trình & chính sách** | HR / Tuân thủ | Đọc / quản lý quy trình. |
| 25 | **Dịch vụ nội bộ** | Nhân viên | Đăng ký / theo dõi dịch vụ. |
| 26 | **Công cụ & thiết bị** | HR / Vận hành | Danh mục và phân bổ công cụ — thiết bị. |

**Hành vi chung:** **Widget chat HRM** (nổi) trên các màn sau đăng nhập — cùng logic với trợ lý UniAI; **ẩn widget** khi HRM được nhúng trong Portal (theo cấu hình hiển thị). Menu sidebar / mobile **lọc theo quyền** từng phân hệ (dashboard, nhân viên, hợp đồng, …).

---

## Phần C — Cấu trúc phân rã công việc (WBS)

### C.1 Quản trị dự án
- Khởi động, họp định kỳ; chốt phạm vi HRM trong **XeVN** (ứng dụng độc lập + nhúng Portal).
- RACI, rủi ro (đa tổ chức, dữ liệu nhạy cảm, AI).

**Kết quả:** Kế hoạch, biên bản, nhật ký rủi ro.

---

### C.2 Làm rõ và thống nhất nghiệp vụ
- Chuẩn hóa quy trình HR Việt Nam / **đa ngôn ngữ** (nếu áp dụng).
- Thống nhất **nhãn menu và màn hình đích** (Dashboard so với Danh sách nhân viên).
- Chính sách AI: phạm vi trả lời, dữ liệu được phép dùng, lưu vết và trách nhiệm.

**Kết quả:** Tài liệu nghiệp vụ đã ký nhận.

---

### C.3 Chốt tài liệu làm căn cứ triển khai
- BRD / SRS / checklist UAT theo **nhóm kịch bản Phần B** và danh sách chi tiết **72 use case**.

**Kết quả:** Bộ tài liệu phê duyệt.

---

### C.4 Thiết kế chi tiết và chuẩn bị vận hành thử
- Chuẩn bị môi trường **dùng thử** và **chính thức**; cấu hình đăng nhập, phân quyền, gửi email lời mời.
- **Nhận diện thương hiệu** theo từng doanh nghiệp (logo, màu sắc chủ đạo).

**Kết quả:** Sẵn sàng UAT.

---

### C.5 Triển khai chức năng (theo Phần A và B)

| Gói | Nội dung giao cho đội triển khai |
|---:|---|
| **1** | Cổng công khai và xác thực: landing, đăng nhập, đăng ký, onboarding, quên mật khẩu, đặt lại mật khẩu, hướng dẫn, chính sách bảo mật. |
| **2** | Quản trị nền tảng và tài khoản quản trị: tạo quản trị viên doanh nghiệp, khóa/mở khóa tài khoản, kiểm soát truy cập quản trị. |
| **3** | Nhân viên: dashboard nhân sự, danh sách nhân viên, hồ sơ chi tiết, thêm/sửa/lưu trữ/khôi phục, nhập/xuất, lọc và tìm kiếm. |
| **4** | Tuyển dụng: tạo đợt tuyển, quản lý ứng viên theo bước, đánh giá, lịch phỏng vấn, lọc và theo dõi tiến độ. |
| **5** | Chấm công và lương: ca làm việc, xử lý ngoại lệ, duyệt điều chỉnh công, tạo kỳ lương, tính lương, chốt bảng lương, xuất lương. |
| **6** | Công ty và thành viên: cấu hình doanh nghiệp, mời thành viên, thu hồi lời mời, phân vai trò thành viên. |
| **7** | Báo cáo và cài đặt: lọc báo cáo, xuất báo cáo, cấu hình tham số chấm công/lương, cấu hình quyền theo vai trò. |
| **8** | Nghiệp vụ HR cốt lõi: hợp đồng, bảo hiểm, quyết định nhân sự; tạo mới, gia hạn, cảnh báo, tra cứu theo tiêu chí. |
| **9** | Trợ lý thông minh và khối công việc nội bộ: trợ lý sau đăng nhập, trợ lý trang công khai, giọng nói, công việc, quy trình, dịch vụ nội bộ, công cụ thiết bị. |
| **10** | Phân quyền menu và bảo mật truy cập: ẩn/hiện chức năng theo vai trò, chặn truy cập trực tiếp không đủ quyền. |

---

### C.6 Tích hợp với hệ sinh thái XeVN
- Đăng nhập thống nhất và mở HRM từ menu trái của giao diện đa tenant.
- **Nguyên tắc danh mục chung (bắt buộc thống nhất với toàn hệ sinh thái):** Web Portal là nơi **gán** danh mục dùng chung cho từng **loại đối tượng** và cho từng **phân hệ** được phép sử dụng danh mục đó. **Mặc định**, HRM (cùng Vận hành và mọi phân hệ khác) **phải tải và áp dụng** đúng các danh mục mà Portal đã gán cho phân hệ HRM và cho ngữ cảnh đối tượng tương ứng (ví dụ tổ chức, chức vụ, phòng ban, vùng… tùy cấu hình tập đoàn). **Ngoài ra**, HRM được phép có **danh mục / tham số riêng** do chính phân hệ cấu hình, miễn không trái quy tắc chung và không tự tạo “nguồn chuẩn” trùng nghĩa với phần đã do Portal quản trị.
- Luồng dữ liệu giữa các phân hệ theo **chính sách bảo mật tập đoàn**.

**Kết quả:** Luồng tích hợp kiểm chứng; kiểm thử có checklist **danh mục được gán vs danh mục riêng HRM**.

---

### C.7 Kiểm thử và nghiệm thu
- UAT theo từng kịch bản Phần B.
- Kiểm thử: mời thành viên, cấp quản trị doanh nghiệp, trợ lý AI (sau đăng nhập và trên landing), hỗ trợ đặt lại mật khẩu (nếu có trong phạm vi giao), phân quyền menu.

**Kết quả:** Biên bản UAT.

---

### C.8 Đưa vào vận hành, đào tạo, hỗ trợ sau go-live
- Đào tạo HR, quản trị công ty, quản trị nền tảng.
- Quy trình xử lý sự cố: đăng nhập, email mời, trợ lý AI.

**Kết quả:** Go-live HRM trên XeVN.

---

## Phần D — Các mốc đề xuất chốt với khách hàng

| Mốc | Nội dung | Điều kiện coi là đạt |
|---|---|---|
| **M1** | Phê duyệt phạm vi và danh mục chức năng / màn hình | Văn bản xác nhận |
| **M2** | Đủ **26** kịch bản Phần B trên môi trường UAT | Checklist UAT pass |
| **M3** | Nghiệm thu | Biên bản ký |
| **M4** | Go-live | HRM đưa vào vận hành thật |
| **M5** | Kết thúc giai đoạn hỗ trợ tập trung | Không lỗi chặn; bàn giao tài liệu |

---

## Phần E — Lịch tham chiếu (có thể điều chỉnh theo hợp đồng)

| Giai đoạn | Thời lượng gợi ý |
|---|---|
| Làm rõ nghiệp vụ & phê duyệt | 2–4 tuần |
| Xác thực, đa tổ chức, mời thành viên, hỗ trợ tài khoản | 2–3 tuần |
| Core HR: nhân viên, hợp đồng, báo cáo | 3–5 tuần |
| Tuyển dụng, chấm công, lương | 4–6 tuần |
| UniAI, widget, trợ lý landing, đọc giọng nói (nếu có), đa ngôn ngữ | 2–4 tuần |
| Tích hợp Portal | 1–3 tuần |
| UAT, go-live | 2–4 tuần |

---

## Phần F — Điều kiện cần phía khách hàng

- Cung cấp **cấu trúc phòng ban**, **mẫu hợp đồng**, **quy tắc lương — chấm công**, **danh sách người tham gia UAT**.
- Sẵn sàng **cấu hình gửi email** (lời mời, thông báo) theo chính sách doanh nghiệp hoặc nhà cung cấp do khách hàng chỉ định.
- Chấp thuận **chính sách AI** (phạm vi dữ liệu, lưu vết, tuân thủ).
- Thỏa thuận sử dụng **dịch vụ AI và giọng đọc** (nếu bật) theo hợp đồng XeVN và nhà cung cấp liên quan.

---

*Tài liệu này mô tả công việc và kết quả từ góc nhìn **nghiệp vụ và quản lý dự án**, bám **màn hình và luồng sử dụng** đã triển khai. Chi tiết kỹ thuật do đội dự án thực hiện theo tài liệu nội bộ đã phê duyệt và không thay thế hợp đồng / phụ lục pháp lý.*
