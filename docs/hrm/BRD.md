# BRD Phân Hệ HRM

## 1. Kiểm Soát Tài Liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD Phân hệ HRM |
| Phiên bản | 2.3 |
| Trạng thái | Chính thức |
| Ngày hiệu lực | 2026-05-12 |
| Phạm vi | Phân hệ HRM trong hệ sinh thái XeVN |

## 1.1 Quy tắc giao hàng phần mềm (bắt buộc)

1. **Cập nhật tài liệu trước, rồi mới triển khai code** trong cùng nhánh/PR có liên quan: BRD → SRS → TechSpec (và bản mobile tương ứng nếu chạm mobile). Code **phải bám** đặc tả đã ghi; nếu phát hiện lệch thực tế, **sửa tài liệu trước** rồi mới đổi hành vi phần mềm (trừ hotfix an ninh có ghi rõ ngoại lệ trong PR).
2. **Không hardcode tenant** (hay mã định danh tenant “sản phẩm”) trong logic nghiệp vụ: phạm vi runtime lấy từ JWT / header `x-tenant-id` theo `docs/ecosystem/TECHSPEC.md`. Tenant **master** hiện triển khai đơn tenant chỉ dùng cho **bootstrap** (DDL mặc định catalog, seed khi thiếu header) qua biến môi trường `MASTER_TENANT_ID` / `DEFAULT_TENANT_ID` — xem `docs/hrm/TECHSPEC.md`.
3. Các luồng **gửi đơn → người có thẩm quyền nhận tin → quyết định → người gửi nhận phản hồi** trên Postgres (`hrm-api`) dùng **một pipeline thông báo** (realtime + inbox DB + webhook + push tuỳ cấu hình); mở rộng luồng mới phải tái sử dụng pipeline đó (đã mô tả kỹ thuật trong TechSpec).

## 2. Tóm Tắt Điều Hành

HRM là phân hệ nghiệp vụ nhân sự của hệ sinh thái XeVN, phục vụ quản trị đa công ty và xử lý các quy trình nhân sự cốt lõi.  
HRM vừa phải đáp ứng nghiệp vụ vận hành thực tế (người dùng, nhân sự, mời nhân viên, xử lý tài khoản), vừa phải dùng dữ liệu dùng chung do XBOS quản trị để bảo đảm thống nhất với các phân hệ còn lại.

## 3. Bối Cảnh Nghiệp Vụ

### 3.1 Vai trò của HRM trong hệ sinh thái

- Người dùng truy cập HRM như một phân hệ nghiệp vụ độc lập.
- HRM phải tương thích điều hướng và dữ liệu dùng chung với các phân hệ khác: Trung tâm, X-BOS, Vận hành xe, Tài chính, Cài đặt.
- Dữ liệu dùng chung giữa các phân hệ phải nhất quán để tránh sai lệch báo cáo và vận hành.

### 3.2 Vấn đề cần giải quyết

- Quản trị quyền đa công ty phức tạp, dễ sai phạm vi dữ liệu.
- Nghiệp vụ mời nhân viên hàng loạt cần kết quả rõ theo từng bản ghi.
- Nếu HRM không bám dữ liệu dùng chung từ XBOS thì màn hình nghiệp vụ dễ lệch chuẩn.

### 3.3 Quy tắc định danh và phạm vi dữ liệu (bắt buộc liên phân hệ)

Mọi nghiệp vụ HRM phải tuân thủ bộ quy tắc **chung toàn hệ sinh thái** (chế độ chưa đăng nhập coi như system admin thấy toàn tenant; chế độ đã đăng nhập chỉ thấy đúng tenant được gán). **Không** viết lại quy tắc trong tài liệu phân hệ: xem và trích dẫn mã quy tắc `BR-ECO-SCOPE-*` tại `docs/ecosystem/BRD.md`, đặc tả phần mềm `docs/ecosystem/SRS.md`, và triển khai kỹ thuật `docs/ecosystem/TECHSPEC.md`.

## 4. Mục Tiêu Và Chỉ Số Thành Công

### 4.1 Mục tiêu

- Chuẩn hóa quản trị tài khoản và phân quyền HRM theo công ty.
- Chuẩn hóa vòng đời nghiệp vụ nhân sự.
- Bảo đảm HRM sử dụng dữ liệu dùng chung đồng nhất với toàn hệ sinh thái.

### 4.2 Chỉ số thành công

- 100% yêu cầu API bảo vệ được kiểm quyền đúng vai trò.
- 100% use case dùng dữ liệu dùng chung lấy từ XBOS.
- 0 sự cố nghiêm trọng do sai phạm vi dữ liệu công ty.

## 5. Phạm Vi

### 5.1 Trong phạm vi

- Quản trị nền tảng và quản trị doanh nghiệp.
- Mời nhân viên hàng loạt, cập nhật thông tin tài khoản nhạy cảm.
- Đồng bộ dữ liệu dùng chung từ XBOS cho luồng HRM.
- Cung cấp dữ liệu nghiệp vụ cho giao diện HRM.

### 5.2 Ngoài phạm vi

- Quản trị nguồn dữ liệu dùng chung cấp tập đoàn (thuộc XBOS).
- Nghiệp vụ tài chính ngoài HRM.

### 5.3 Ranh giới sau họp Chủ tịch (2026-05)

- HRM **tiêu thụ** `position_template`, org/legal entity từ XBOS API; **không** sở hữu cây org master.
- Import NS (Excel 20–30 cột, ảnh = URL) + **document vault** versioned thuộc HRM.
- `workflow_code` trên metadata chỉ tham chiếu definition XBOS; engine runtime do XBOS.

## 6. Bên Liên Quan Và Vai Trò

| Nhóm | Vai trò |
|---|---|
| Quản trị nền tảng | Quản lý quyền cấp hệ sinh thái |
| Quản trị doanh nghiệp | Quản lý người dùng và nghiệp vụ HR nội bộ |
| Người vận hành HR | Xử lý nghiệp vụ nhân sự hằng ngày |
| FE/BE | Triển khai màn hình và dịch vụ HRM |
| QA/QC | Kiểm thử chức năng và chất lượng phát hành |

## 7. Danh Mục Use Case

| Mã | Tên use case | Tác nhân chính |
|---|---|---|
| UC-HRM-01 | Kiểm tra trạng thái dịch vụ | Hệ thống nội bộ |
| UC-HRM-02 | Tạo quản trị nền tảng | Quản trị nền tảng |
| UC-HRM-03 | Tạo/cập nhật quản trị doanh nghiệp | Quản trị nền tảng |
| UC-HRM-04 | Mời nhân viên hàng loạt | Quản trị doanh nghiệp/HR |
| UC-HRM-05 | Cập nhật thông tin nhạy cảm tài khoản | Quản trị có quyền |
| UC-HRM-06 | Đồng bộ dữ liệu dùng chung từ XBOS | Dịch vụ HRM |
| UC-HRM-07 | Lấy dữ liệu dùng chung đã đồng bộ theo khóa | FE/Dịch vụ |
| UC-HRM-08 | Liệt kê dữ liệu dùng chung đã đồng bộ | FE/Dịch vụ |
| UC-HRM-09 | Vòng đời đơn chỉnh sửa chấm công (Postgres / HRM API) + thông báo | Nhân viên / Quản lý |
| UC-HRM-10 | Vòng đời đơn nghỉ phép (Postgres / HRM API) + thông báo | Nhân viên / Quản lý |
| UC-HRM-11 | Vòng đời yêu cầu dịch vụ (operations) + thông báo | Nhân viên / Quản lý |
| UC-HRM-12 | Đọc hộp thư thông báo nghiệp vụ (`hrm_inbox_notifications`) | Người dùng trong phạm vi công ty |

## 8. Luồng Nghiệp Vụ Tổng Quan

1. Người dùng truy cập HRM theo quyền được cấp.
2. HRM xác thực và kiểm tra phạm vi công ty.
3. HRM thực thi nghiệp vụ nhân sự theo use case.
4. Khi cần dữ liệu dùng chung, HRM đồng bộ từ XBOS và sử dụng lại trong nghiệp vụ.
5. Kết quả trả về cho giao diện HRM theo trạng thái thành công/lỗi rõ ràng.

## 9. Quy Tắc Nghiệp Vụ

| Mã quy tắc | Điều kiện | Hành động | Kết quả |
|---|---|---|---|
| BR-HRM-01 | API thuộc vùng bảo vệ | Bắt buộc kiểm quyền và phạm vi | Không truy cập trái phép |
| BR-HRM-02 | Dữ liệu thuộc phạm vi công ty | Chỉ thao tác trong phạm vi được cấp | Không rò rỉ chéo công ty |
| BR-HRM-03 | Nghiệp vụ cần dữ liệu dùng chung | Lấy từ XBOS thông qua đồng bộ | Dữ liệu nhất quán liên phân hệ |
| BR-HRM-04 | Mời nhân viên hàng loạt có lỗi từng bản ghi | Xử lý theo từng bản ghi | Không dừng toàn bộ lô |
| BR-HRM-05 | Lỗi nghiệp vụ/xác thực | Trả mã lỗi chuẩn | Giao diện xử lý nhất quán |
| BR-HRM-06 | Đơn nghiệp vụ được tạo trên HRM API (chấm công chỉnh sửa, nghỉ phép, yêu cầu dịch vụ, …) | Sau khi ghi DB thành công, hệ thống phát sự kiện theo pipeline chuẩn | Người có quyền trong phạm vi công ty nhận được tín hiệu (inbox / realtime / push nếu bật) |
| BR-HRM-07 | Đơn được duyệt hoặc từ chối | Cập nhật trạng thái + phát sự kiện kết thúc | Người gửi (và phạm vi công ty) nhận thông báo lưu DB tối thiểu qua inbox |
| BR-HRM-08 | Triển khai đơn tenant master | Cấu hình tenant/company bootstrap qua env, không gắn cứng trong code | Chuẩn bị mở rộng đa tenant theo header/JWT từng request |

## 10. Yêu Cầu Dữ Liệu Mức Nghiệp Vụ

| Thành phần | Mô tả nghiệp vụ | Quy tắc chính |
|---|---|---|
| Tenant/Công ty | Phạm vi vận hành | Bắt buộc kiểm tra trước mọi thao tác |
| Tài khoản quản trị | Vai trò quản trị theo cấp | Không trùng định danh, kiểm quyền chặt |
| Dữ liệu mời nhân viên | Danh sách đầu vào theo lô | Mỗi bản ghi có kết quả riêng |
| Dữ liệu dùng chung | Dữ liệu chuẩn từ XBOS | Dùng thống nhất cho biểu mẫu và xử lý |

## 11. Ràng Buộc Phi Chức Năng

- Bảo mật: mọi luồng nhạy cảm phải có xác thực và kiểm quyền.
- Độ tin cậy: nhánh lỗi không làm thay đổi dữ liệu trái ý định.
- Vận hành: có nhật ký đủ chi tiết để xử lý sự cố.
- Tương thích: thay đổi dữ liệu dùng chung phải không phá vỡ màn hình HRM hiện hành.

## 12. Rủi Ro Và Biện Pháp

| Rủi ro | Tác động | Biện pháp |
|---|---|---|
| Sai phạm vi dữ liệu công ty | Lộ dữ liệu, sai nghiệp vụ | Kiểm quyền + kiểm phạm vi bắt buộc |
| Lệch dữ liệu dùng chung | Sai biểu mẫu và xử lý | Đồng bộ từ XBOS theo phiên bản |
| Lỗi lô mời nhân viên khó truy vết | Khó vận hành thực tế | Trả kết quả từng bản ghi có mã lỗi |

## 13. Tiêu Chí Chấp Nhận

- Tất cả use case UC-HRM-01..08 và bổ sung pilot UC-HRM-09..12 (SRS) được đặc tả và kiểm thử theo phạm vi triển khai.
- Quy tắc mục **1.1** được tuân thủ trên mọi PR có thay đổi hành vi.
- Luồng nghiệp vụ phản ánh đúng vai trò HRM trong hệ sinh thái.
- Dữ liệu dùng chung được sử dụng nhất quán, không còn dùng thuật ngữ pha tạp.

## 14. Tài Liệu Kèm Theo — Ứng Dụng Di Động HRM

- BRD mobile: `docs/hrm/BRD_MOBILE.md`
- SRS mobile: `docs/hrm/SRS_MOBILE.md`
- TechSpec mobile: `docs/hrm/TECHSPEC_MOBILE.md`
