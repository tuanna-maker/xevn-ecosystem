# BRD Phân Hệ HRM

> **SoT gửi khách (W1 2026-07-21):** `docs/client-delivery/hrm/BRD_HRM_KHACH.md` (Yêu cầu-N + Quy tắc, tiếng Việt nghiệp vụ).  
> File này giữ **bản đội ngũ** (path kỹ thuật, pipeline thông báo, env bootstrap) — **không** thay thế bản khách; **không** rút AC/BR bảng chấm công.

## 1. Kiểm Soát Tài Liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD Phân hệ HRM (team annex) |
| Phiên bản | 2.4 |
| Trạng thái | Chính thức (team) · Khách = BRD_HRM_KHACH 3.0 |
| Ngày hiệu lực | 2026-05-12 · Remaster pointer 2026-07-21 |
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
| UC-HRM-23 | Embed / vận hành — Chấm công (xem bản ghi; liên kết bảng công) | HCNS / Quản lý |
| UC-HRM-24 | Embed / vận hành — Lương | HCNS / Quản lý |
| UC-HRM-32 | App HRM — Chấm công đầy đủ (bản ghi, đơn từ, **bảng chấm công**) | Người vận hành HR |
| HRM-AT-14 | Tạo / xem / sửa / xoá **bảng chấm công** theo kỳ; sau tạo phải thấy trên danh sách và lưới kỳ | Người vận hành HR |

> **Inventory (ADD 2026-07-21):** Catalog đầy đủ 120 UC nằm tại `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md`. BRD mục 7 lịch sử chỉ liệt kê UC-HRM-01..12 (+ ADD 23/24/32/AT-14); các mã embed/app/AT/PR… **không** bị loại khỏi phạm vi sản phẩm — xem `docs/hrm/UC_INVENTORY_BRD_SRS.md`.

### 7.1 Danh mục Yêu cầu-N (freeze — §3.4.8.B)

> **Khóa W1b (`BA-HRM-BRD-YEUCAU-INVENTORY-01`):** Mỗi yêu cầu dưới đây map ≥1 UC/NFR primary trong `docs/hrm/UC_INVENTORY_BRD_SRS.md`. Đặc tả FR đầy đủ do SRS (ba-docs); BRD chỉ khóa ý nghiệp vụ + ưu tiên.

| Yêu cầu-ID | Ý nghiệp vụ | Priority | Primary UC / NFR | status |
|---|---|---|---|---|
| Yêu cầu-01 | Phạm vi dữ liệu đa công ty / RBAC | Cao | UC-HRM-SCOPE-01..03 | body_ready (W2b SCOPE-01..03) |
| Yêu cầu-02 | Quản trị nền tảng và quản trị doanh nghiệp | Cao | UC-HRM-02 · UC-HRM-03 | body_ready (W2b FR-02/03) |
| Yêu cầu-03 | Mời nhân viên hàng loạt (kết quả từng bản ghi) | Cao | UC-HRM-04 | body_ready (W2b FR-04) |
| Yêu cầu-04 | Cập nhật thông tin nhạy cảm tài khoản | Cao | UC-HRM-05 | body_ready (W2b FR-05) |
| Yêu cầu-05 | Đồng bộ / tiêu thụ danh mục dùng chung từ XBOS | Cao | UC-HRM-06..08 | body_ready (W2b FR-06/08) |
| Yêu cầu-06 | Hồ sơ nhân viên (CRUD + lưu trữ) | Cao | HRM-EM-01..05 | body_ready (W1 FR-EM-01) |
| Yêu cầu-07 | Bản ghi chấm công | Cao | HRM-AT-01..03 | body_ready (W2a FR-AT-01..03) |
| Yêu cầu-08 | Đơn chỉnh sửa chấm công + thông báo | Cao | UC-HRM-09 | body_ready (W2a FR-HRM-09) |
| Yêu cầu-09 | Đơn nghỉ phép + thông báo | Cao | UC-HRM-10 | body_ready (W1 AT-10 + W2a AT-12/13) |
| Yêu cầu-10 | Bảng chấm công theo kỳ (list/lưới/empty/không storm) | Cao | HRM-AT-14 · UC-HRM-23/32 | body_ready |
| Yêu cầu-11 | Yêu cầu dịch vụ nội bộ + thông báo | Trung bình | UC-HRM-11 | body_ready (W2c FR-11) |
| Yêu cầu-12 | Hộp thư thông báo nghiệp vụ | Cao | UC-HRM-12 | body_ready (W2b FR-12) |
| Yêu cầu-13 | Kỳ lương / phiếu lương / đối soát | Cao | HRM-PR-01..06 | body_ready (W1 PR-05 + W2a PR-01/03/04) |
| Yêu cầu-14 | Tuyển dụng (yêu cầu → ứng viên → phỏng vấn) | Cao | HRM-RC-01..06 | body_ready (W1 RC-01 + W2a RC-03/05) |
| Yêu cầu-15 | Hợp đồng lao động và bảo hiểm | Cao | HRM-CI-01..07 | body_ready (W1 FR-CI-01/02) |
| Yêu cầu-16 | Thay đổi metadata hồ sơ + hàng chờ duyệt | Cao | HRM-MD-01..05 | body_ready (W2b FR-MD-01) |
| Yêu cầu-17 | Cấu hình danh mục HRM | Cao | HRM-SC-01..09 | body_ready (W1 FR-SC-01) |
| Yêu cầu-18 | Import / export nhân sự và vault tài liệu | Cao | HRM-IM-01..04 | body_ready (W2b FR-IM-01) |
| Yêu cầu-19 | Công việc vận hành | Trung bình | HRM-OP-01..04 | body_ready (W2d FR-OP-01..04) |
| Yêu cầu-20 | Đánh giá hiệu suất | Trung bình | HRM-PF-01..04 | body_ready (W2a FR-PF-01) |
| Yêu cầu-21 | Hồ sơ xe (du lịch) | Thấp hơn | HRM-FL-01 | body_ready (W2d FR-FL-01) |
| Yêu cầu-22 | Embed Command Center — tab vận hành HRM | Cao | UC-HRM-20..27 | body_ready (W2c FR-20/21/23; W2d FR-27; leftover 22/24–26) |
| Yêu cầu-23 | Ứng dụng di động HRM | Cao | UC-HRM-MOB-01..15 | body_ready (W2c MOB-01/04/06/08; leftover khác) |
| Yêu cầu-24 | Liên kết chéo tuyển → NV → HĐ → lương | Cao | UC-HRM-INT-01..04 | body_ready (W2c INT-01..04) |
| Yêu cầu-25 | Quyết định nhân sự (embed) | Trung bình | UC-HRM-27 | body_ready (W2d FR-HRM-27) |
| Yêu cầu-26 | Kiểm tra trạng thái dịch vụ HRM | Trung bình | UC-HRM-01 | body_ready (W2d FR-HRM-01) |
| Yêu cầu-27 | NFR bảo mật / tin cậy / nhật ký / tương thích catalog | Cao | NFR-HRM-01..04 | body_ready |
| Yêu cầu-28 | Pipeline thông báo sau tạo/duyệt đơn | Cao | UC-HRM-09..12 | body_ready (09/10/12 + W2c FR-11 đóng residual) |
| Yêu cầu-29 | Ranh giới: không sở hữu org master / workflow engine | Cao | NFR-HRM-BOUND | body_ready |
| Yêu cầu-30 | Bootstrap tenant qua cấu hình; không hardcode tenant | Trung bình | BR-HRM-08 | body_ready (W2d FR-HRM-BOOT-01) |

**Quy tắc khóa (đã có — không thay bằng Yêu cầu):** mục **9** (BR-HRM-*, BR-ATT-SHEET-*) và `BR-ECO-SCOPE-*` tại `docs/ecosystem/BRD.md`.

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
| BR-ATT-SHEET-01 | Tạo bảng chấm công thành công | Hiển thị ngay trên danh sách bảng (không bắt F5) | Người dùng thấy dòng bảng mới |
| BR-ATT-SHEET-02 | Đang xem danh sách bảng công | Không gọi tải danh sách lặp vô hạn vì re-render | Tài nguyên ổn định; UX không «giật» |
| BR-ATT-SHEET-03 | Danh sách bảng rỗng hợp lệ | Empty trung thực, không mock, không banner lỗi giả | Người dùng hiểu «chưa có bảng» |
| BR-ATT-SHEET-04 | Kỳ / ngày bảng không hợp lệ hoặc trùng bị cấm | Từ chối lưu + thông báo rõ | Không tạo bản ghi sai |
| BR-ATT-SHEET-05 | Mở một bảng công | Lưới / bản ghi chỉ trong kỳ và phạm vi đơn vị của bảng | Không lộ dữ liệu ngoài phạm vi |
| BR-ATT-SHEET-06 | Tạo bảng (header) khi kỳ chưa có điểm danh | Cho phép empty lưới trung thực; không bắt buộc sinh bản ghi ngày | Người dùng hiểu «chưa có dữ liệu trong kỳ» — không ERROR giả / không reload storm |
| BR-ATT-SHEET-07 | Sau settle UI ≤10s trên list hoặc lưới tuần | Số GET cùng URL ≤ 2; không Abort×N / RATE-429 do loop | UX ổn định đo được |

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
