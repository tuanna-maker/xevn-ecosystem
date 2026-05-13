# BRD — Quy tắc định danh và phạm vi dữ liệu toàn hệ sinh thái XeVN

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD — Phạm vi dữ liệu và định danh (liên phân hệ) |
| Phiên bản | 1.1 |
| Trạng thái | Chính thức |
| Ngày hiệu lực | 2026-05-04 |
| Phạm vi | Toàn bộ phân hệ trong hệ sinh thái XeVN (hiện tại và tương lai) |

## 2. Tóm tắt điều hành

Hệ sinh thái XeVN vận hành theo mô hình **đa tenant** (phân vùng dữ liệu theo đơn vị tổ chức được giao). Mọi phân hệ nghiệp vụ phải thống nhất hai chế độ sử dụng sau đây — **đây là nghiệp vụ chính**, không chỉ áp dụng riêng cho Nhân sự:

1. **Chế độ làm việc chưa xác thực người dùng (ưu tiên nghiệp vụ trước đăng nhập):** hệ thống **giả định** người dùng là **quản trị nền tảng / system admin** và được phép **xem và thao tác trên phạm vi dữ liệu của toàn bộ tenant** trong môi trường cho phép (thường là phát triển hoặc demo có kiểm soát).
2. **Chế độ đã đăng nhập với tài khoản gắn một tenant cụ thể** (theo dữ liệu seed hoặc cấp quyền thực tế): người dùng **chỉ** được xem và thao tác trên **dữ liệu thuộc phạm vi phân vùng của tenant (và đơn vị con) mà tài khoản được gán**.

Mọi BRD/SRS/TechSpec của từng phân hệ **phải** tham chiếu tài liệu này; khi bổ sung phân hệ mới **không** cần lặp lại toàn bộ quy tắc — chỉ cần tuân thủ và trích dẫn mã quy tắc tại đây.

### 2.1 Chuẩn giao hàng phần mềm (bắt buộc)

Với mọi thay đổi có ý nghĩa nghiệp vụ hoặc hợp đồng API: **cập nhật tài liệu (BRD → SRS → TechSpec phân hệ, và ecosystem nếu đụng phạm vi/tenant) trước hoặc đồng thời với code**; triển khai **bám đặc tả**. Không merge logic mới “nháp code rồi mới viết tài liệu” ngoại trừ hotfix (phải ghi rõ và hoàn tất tài liệu trong chu kỳ kế tiếp).

## 3. Phân hệ áp dụng

Quy tắc này áp dụng đồng nhất cho: **Trung tâm**, **X-BOS**, **Nhân sự**, **Vận hành xe**, **Tài chính**, **Cài đặt**, và **mọi phân hệ bổ sung** sau này.

## 4. Định nghĩa vai trò nghiệp vụ

| Khái niệm | Mô tả |
|---|---|
| Quản trị nền tảng / system admin (theo ngữ cảnh tài liệu này) | Vai trò được phép vượt phạm vi một tenant đơn lẻ để vận hành, kiểm tra liên tenant, hoặc chuẩn bị dữ liệu tập đoàn. Trong giai đoạn ưu tiên nghiệp vụ trước đăng nhập, hệ thống **mặc định** coi phiên làm việc thuộc nhóm quyền này khi **chưa** có xác thực người dùng đủ điều kiện. |
| Người dùng theo tenant | Tài khoản đã đăng nhập, gắn **đúng một** ngữ cảnh tenant (và thường kèm công ty/đơn vị) theo seed hoặc cấp quyền. |

## 5. Ma trận quy tắc nghiệp vụ

| Mã | Điều kiện | Hành động | Kết quả mong đợi |
|---|---|---|---|
| BR-ECO-SCOPE-01 | Phiên làm việc **không** có định danh người dùng đủ điều kiện (chưa đăng nhập hoặc tương đương) trong môi trường cho phép làm nghiệp vụ trước | Hệ thống áp dụng chế độ **system admin** mặc định | Người dùng thấy dữ liệu **toàn bộ tenant** (theo khả năng kỹ thuật và chính sách môi trường), không bị giới hạn một tenant đơn lẻ |
| BR-ECO-SCOPE-02 | Người dùng **đã đăng nhập** với tài khoản gắn tenant T trong seed/cấp quyền | Hệ thống áp dụng chế độ **phân vùng theo tenant** | Mọi màn hình và báo cáo chỉ hiển thị dữ liệu **thuộc phạm vi T** (và đơn vị con được phép), không lộ dữ liệu tenant khác |
| BR-ECO-SCOPE-03 | Cùng một tính năng nghiệp vụ triển khai trên nhiều phân hệ | Tuân thủ **cùng** cặp quy tắc BR-ECO-SCOPE-01 và BR-ECO-SCOPE-02 | Không có phân hệ “ngoại lệ” không khai báo |
| BR-ECO-SCOPE-04 | Bổ sung phân hệ mới | Thiết kế BRD/SRS/TechSpec phân hệ **trích dẫn** tài liệu này | Tránh trùng lặp văn bản nhưng **không** được suy giảm nghĩa vụ phân vùng |
| BR-ECO-UX-01 | Phân hệ mở từ menu chung (Trung tâm / portal) | Modal, drawer, popover, dropdown, select overlay phải **phủ viewport ứng dụng cha**, không chỉ vùng iframe | Người dùng cảm nhận **một** hệ thống thống nhất; không lộ “nhúng con” trong khung nội dung |
| BR-ECO-CAT-01 | Công ty thành viên bổ sung trường danh mục trong phân hệ | Cho phép thêm/ghi đè trường ở lớp mở rộng của công ty sau khi đã đọc dữ liệu phân vùng của mình | Công ty chủ động vận hành nhưng không phá chuẩn tập đoàn |
| BR-ECO-CAT-02 | Công ty yêu cầu xóa trường danh mục | Không xóa trực tiếp; tạo yêu cầu phê duyệt qua XBOS và nhóm email lãnh đạo cấp tập đoàn | Bảo toàn kiểm soát thay đổi, có truy vết và tránh mất dữ liệu đột ngột |

## 6. Giả định và ranh giới

- Việc “làm nghiệp vụ trước đăng nhập” phục vụ **tốc độ triển khai**; môi trường **thật** (production) phải có chính sách bảo mật và bật xác thực theo lộ trình riêng — quy tắc nghiệp vụ **vẫn** là: không đăng nhập → coi như system admin **chỉ** trong phạm vi môi trường được phép.
- Dữ liệu seed phải có **ít nhất một** tài khoản quản lý gắn rõ tenant để kiểm thử BR-ECO-SCOPE-02.
- **UX / phi chức năng (nhúng Trung tâm):** Khi phân hệ được nhúng qua Command Center, lớp phủ modal/dialog phải phủ **toàn viewport** của portal (không gói trong khung iframe), để người dùng cảm nhận một hệ thống thống nhất; chi tiết kỹ thuật: `docs/ecosystem/TECHSPEC.md` mục 4.1.

## 7. Tiêu chí chấp nhận

- Mọi phân hệ có chức năng đọc/ghi dữ liệu nghiệp vụ có bằng chứng kiểm thử cho cả hai nhánh: **chưa đăng nhập (system admin)** và **đã đăng nhập tenant**.
- Không có màn hình nghiệp vụ nào lộ dữ liệu tenant khác khi đang ở chế độ BR-ECO-SCOPE-02.

## 8. Tham chiếu kỹ thuật

- Đặc tả phần mềm chi tiết (if/else, mã lỗi): `docs/ecosystem/SRS.md`.
- Triển khai kỹ thuật (token, header, cờ môi trường): `docs/ecosystem/TECHSPEC.md`.
