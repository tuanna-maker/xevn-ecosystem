# BRD Ứng Dụng Di Động HRM (HRM Mobile)

## 1. Kiểm Soát Tài Liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD Ứng dụng di động HRM |
| Phiên bản | 1.1 |
| Trạng thái | Chính thức |
| Ngày hiệu lực | 2026-05-12 |
| Phạm vi | Ứng dụng di động nhân sự (HRM Mobile) trong hệ sinh thái XeVN |
| Tham chiếu bắt buộc | `docs/hrm/BRD.md` (HRM **2.3**), `docs/hrm/SRS.md`, `docs/ecosystem/BRD.md`, `docs/ecosystem/SRS.md` |

## 1.1 Quy tắc giao hàng (bắt buộc)

Tuân thủ **mục 1.1** của `docs/hrm/BRD.md`: tài liệu mobile (BRD/SRS/TechSpec này) **cập nhật trước hoặc cùng** thay đổi code trong `apps/mobile/hrm-mobile`; không merge hành vi mới chỉ có code.

## 2. Tóm Tắt Điều Hành

HRM Mobile là lớp giao diện **dành cho nhân viên và quản lý trực tiếp**, tối ưu cho **làm việc di động** (self-service, phê duyệt nhanh, chấm công, theo dõi đơn), **không** thay thế toàn bộ chức năng quản trị HRM trên web. Ứng dụng **tiêu thụ cùng hợp đồng API** với `hrm-api`, tuân **phạm vi tenant/công ty** và dữ liệu dùng chung đã đồng bộ từ XBOS theo quy tắc toàn hệ (`BR-ECO-SCOPE-*`, `UC-ECO-SCOPE-01/02`).

## 3. Bối Cảnh Nghiệp Vụ

### 3.1 Vai trò của HRM Mobile trong hệ sinh thái

- Bổ sung kênh truy cập cho **lao động tại hiện trường** và người dùng ưu tiên điện thoại.
- Giữ **một nguồn sự thật** nghiệp vụ: toàn bộ ghi nhận và phê duyệt thực hiện qua **HRM API**; mobile không tự lưu trạng thái nghiệp vụ tách rời backend.
- Đồng bộ danh mục/metadata: mobile chỉ **đọc** ảnh chụp/catalog đã đồng bộ (tham chiếu `UC-HRM-07`, `UC-HRM-08`); không kích hoạt đồng bộ lô kéo XBOS từ thiết bị cá nhân (tránh rủi ro vận hành).

### 3.2 Vấn đề cần giải quyết

- Giảm thời gian xử lý đơn và chấm công so với chỉ dùng web trên máy tính.
- Giảm sai sót do nhập liệu phức tạp trên màn hình nhỏ: ưu tiên **luồng ngắn, một việc một màn hình**.
- Bảo đảm **không vượt quyền** so với web: cùng token, cùng policy phạm vi.

### 3.3 Tham chiếu chuẩn thị trường (không ràng buộc pháp lý bên thứ ba)

Các nền tảng HRM tiên tiến thường tách mobile thành **Employee / Manager self-service**: chấm công, nghỉ phép, phê duyệt, xem phiếu lương tóm tắt, thông báo, tìm đồng nghiệp; phần **cấu hình tổ chức và import hàng loạt** giữ trên web. XeVN áp dụng nguyên tắc tương tự để giữ phạm vi kiểm soát.

## 4. Mục Tiêu Và Chỉ Số Thành Công

### 4.1 Mục tiêu

- Cung cấp **MVP self-service** ổn định: đăng nhập, phạm vi, chấm công, đơn liên quan thời gian làm việc, hộp việc cá nhân.
- Mở rộng **manager workflow** và **tóm tắt lương** sau MVP khi API và kiểm thử đủ.
- Đồng nhất trải nghiệm lỗi và mã phản hồi với chuẩn HRM API (`HRM-ERR-*`, `HRM-OK-*`).

### 4.2 Chỉ số thành công (định hướng đo sau triển khai)

- Tỷ lệ yêu cầu API từ mobile có `x-request-id` và được ghi nhật ký: 100%.
- Tỷ lệ thao tác ghi dữ liệu thất bại do lỗi client (không retry được) < ngưỡng dự án sau 3 tháng.
- 0 sự cố nghiêm trọng do **sai phạm vi tenant/công ty** trên kênh mobile.

## 5. Phạm Vi Theo Giai Đoạn

### 5.1 Trong phạm vi — Giai đoạn MVP (P0)

- Đăng nhập, duy trì phiên, đăng xuất, chọn ngữ cảnh công ty khi hợp lệ.
- Chấm công / ghi nhận điểm danh; xem lịch sử gần.
- Tạo và theo dõi **đơn/yêu cầu** thuộc module chấm công (theo khả năng API hiện có), gồm **đơn chỉnh sửa chấm công** và **đơn nghỉ phép** trên Postgres (`hrm-api`) — tham chiếu `UC-HRM-09`, `UC-HRM-10` trong `docs/hrm/SRS.md`.
- Kiểm tra sức khỏe dịch vụ (`GET /api/hrm`).
- Hiển thị thông báo trong app (in-app); **kênh realtime Socket.IO** tới `hrm-api` khi app mở (không bắt buộc Expo / FCM). Đăng ký push nền (FCM/APNs) là **tuỳ chọn** giao sau nếu hạ tầng chưa sẵn sàng.

### 5.2 Trong phạm vi — Giai đoạn mở rộng (P1)

- **Hộp việc quản lý:** danh sách đơn chờ phê duyệt, thao tác quyết định theo quyền.
- **Lương:** xem kỳ lương và tóm tắt (không in phức tạp).
- **Hợp đồng / bảo hiểm:** xem và nhắc hạn (read-first).
- **Công việc / yêu cầu dịch vụ nội bộ** (operations): xem danh sách, cập nhật trạng thái cơ bản.
- **Hồ sơ cá nhân:** xem và cập nhật trường được phép (kể cả metadata động theo catalog).

### 5.3 Trong phạm vi — Giai đoạn nâng cao (P2)

- Tuyển dụng: lịch phỏng vấn, trạng thái ứng viên (theo policy).
- Hiệu suất: xem mục tiêu/chu kỳ, ghi nhận tối thiểu.
- Đọc cache ngoại tuyến cho danh sách đã tải (read-only), đồng bộ khi có mạng.

### 5.4 Ngoài phạm vi (mobile không triển khai)

- Quản trị nền tảng, quản trị doanh nghiệp, mời nhân viên hàng loạt, reset mật khẩu nhạy cảm (`UC-HRM-02`..`05`).
- Kích hoạt **đồng bộ kéo** catalog từ XBOS bằng tay trên mobile (`UC-HRM-06`).
- Import/export bảng tính hàng loạt (`spreadsheet`).
- Cấu hình governance danh mục mở rộng / phê duyệt xóa trường (`settings-catalogs`) — chỉ web chuyên trách.
- Báo cáo BI phức tạp, dashboard điều hành cấp tập đoàn.

## 6. Bên Liên Quan Và Vai Trò

| Nhóm | Vai trò |
|---|---|
| Nhân viên | Sử dụng self-service hằng ngày |
| Quản lý trực tiếp | Phê duyệt, xem team (theo quyền) |
| HR vận hành | Định nghĩa chính sách; không bắt buộc dùng mobile cho tác vụ nặng |
| Quản trị bảo mật / CNTT | Cấu hình SSO, chứng chỉ, phân phối ứng dụng |
| FE Mobile / BE HRM | Triển khai app và API |
| QA/QC | Kiểm thử thiết bị, bảo mật, phạm vi dữ liệu |

## 7. Danh Mục Use Case

| Mã | Tên use case | Tác nhân chính | Giai đoạn |
|---|---|---|---|
| UC-HRM-MOB-01 | Đăng nhập và thiết lập phiên an toàn | Nhân viên / Quản lý | P0 |
| UC-HRM-MOB-02 | Chọn và xác nhận phạm vi công ty | Nhân viên / Quản lý | P0 |
| UC-HRM-MOB-03 | Xem bảng điều khiển cá nhân (tóm tắt) | Nhân viên / Quản lý | P0 |
| UC-HRM-MOB-04 | Ghi nhận chấm công / điểm danh | Nhân viên | P0 |
| UC-HRM-MOB-05 | Xem lịch sử chấm công | Nhân viên | P0 |
| UC-HRM-MOB-06 | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép (Postgres) | Nhân viên | P0 |
| UC-HRM-MOB-07 | Xem danh sách đơn và trạng thái (chấm công / nghỉ) | Nhân viên / Quản lý | P0 |
| UC-HRM-MOB-08 | Phê duyệt hoặc từ chối đơn chờ (chấm công + nghỉ) | Quản lý | P0 |
| UC-HRM-MOB-09 | Xem tóm tắt lương theo kỳ | Nhân viên | P1 |
| UC-HRM-MOB-10 | Xem hợp đồng và bảo hiểm (read) | Nhân viên | P1 |
| UC-HRM-MOB-11 | Quản lý công việc và yêu cầu dịch vụ nội bộ | Nhân viên / Quản lý | P1 |
| UC-HRM-MOB-12 | Xem và cập nhật hồ sơ cá nhân (metadata động) | Nhân viên | P1 |
| UC-HRM-MOB-13 | Nhận thông báo (in-app / realtime / push tuỳ chọn) | Hệ thống / Người dùng | P0/P1 |
| UC-HRM-MOB-14 | Làm việc ngoại tuyến có kiểm soát (read cache) | Nhân viên | P2 |
| UC-HRM-MOB-15 | Đăng xuất và thu hồi phiên | Nhân viên / Quản lý | P0 |

## 8. Luồng Nghiệp Vụ Tổng Quan

1. Người dùng mở HRM Mobile và xác thực.
2. Ứng dụng xác định **tenant** và **công ty** hợp lệ theo quy tắc toàn hệ.
3. Người dùng chọn nghiệp vụ self-service hoặc quản lý.
4. Ứng dụng gọi **HRM API** với token, header phạm vi, và `x-request-id`.
5. (Tuỳ chọn P0) Khi cần cập nhật tức thời lưới quản lý / nhân viên, duy trì **Socket.IO** tới cùng host API, namespace `/hrm-realtime`, song song với REST — không thay thế REST.
6. Backend kiểm tra quyền và phạm vi; trả **mã chuẩn** thành công hoặc lỗi.
7. Mobile hiển thị kết quả; với lỗi mạng hoặc phiên, hiển thị nhánh xử lý riêng (xem SRS Mobile).

## 9. Quy Tắc Nghiệp Vụ

| Mã quy tắc | Điều kiện | Hành động | Kết quả |
|---|---|---|---|
| BR-HRM-MOB-01 | Mọi ghi dữ liệu nghiệp vụ | Chỉ qua HRM API đã xác thực | Không ghi “local-only” làm nguồn sự thật |
| BR-HRM-MOB-02 | Thiếu quyền hoặc sai phạm vi | Chặn thao tác | Thông báo đồng nhất với mã `HRM-ERR-*` |
| BR-HRM-MOB-03 | Cần hiển thị biểu mẫu động | Lấy định nghĩa từ catalog đã đồng bộ | Không hardcode danh mục trái XBOS |
| BR-HRM-MOB-04 | Chức năng chỉ dành cho quản lý | Kiểm tra vai trò trước khi hiển thị menu | Giảm lỗi UX và rủi ro bảo mật |
| BR-HRM-MOB-05 | Phiên hết hạn hoặc bị thu hồi | Buộc đăng nhập lại | Không tiếp tục gọi API bằng token lỗi thời |

## 10. Yêu Cầu Dữ Liệu Mức Nghiệp Vụ

| Thành phần | Mô tả | Quy tắc chính |
|---|---|---|
| Token phiên | Xác thực người dùng | Không lưu thông tin đăng nhập dạng rõ ở bộ nhớ không mã hóa |
| tenantId / companyId | Phạm vi dữ liệu | Bắt buộc khớp quy tắc ecosystem |
| Catalog snapshot | Biểu mẫu và nhãn | Chỉ đọc từ luồng đồng bộ hiện hành |
| Đơn / chấm công | Giao dịch nghiệp vụ | Idempotent UI khi retry mạng (theo TECHSPEC Mobile) |

## 11. Ràng Buộc Phi Chức Năng

- Bảo mật: hỗ trợ sinh trắc học thiết bị tùy chọn; không log payload nhạy cảm.
- Quyền riêng tư: tuân chính sách lưu trữ tối thiểu trên thiết bị.
- Hiệu năng: danh sách phân trang; tránh tải toàn bộ org một lần.
- Khả năng sử dụng: hỗ trợ Dynamic Type / font scale hợp lý; chế độ tương phản theo chuẩn dự án.

## 12. Rủi Ro Và Biện Pháp

| Rủi ro | Tác động | Biện pháp |
|---|---|---|
| Người dùng kỳ vọng đủ chức năng như web | Tràn phạm vi, chậm phát hành | BRD phân tách P0/P1/P2 rõ ràng |
| Chấm công gian lận (mock GPS) | Sai lệch payroll | Policy vị trí theo giai đoạn; audit server-side |
| Token lộ trên thiết bị mất cắp | Rò rỉ dữ liệu | Session ngắn, refresh an toàn, remote logout |

## 13. Tiêu Chí Chấp Nhận

- Toàn bộ use case `UC-HRM-MOB-01`..`15` có đặc tả tương ứng trong `docs/hrm/SRS_MOBILE.md`.
- MVP (P0) đạt luồng: đăng nhập → chọn công ty → chấm công → tạo đơn → xem trạng thái → đăng xuất.
- Không có chức năng nào trong phạm vi P0..P1 **ghi dữ liệu** mà không qua HRM API.
