# BRD Phân Hệ XBOS

## 1. Kiểm Soát Tài Liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD Phân hệ XBOS |
| Phiên bản | 2.3 |
| Trạng thái | Chính thức |
| Ngày hiệu lực | 2026-05-15 |
| Phạm vi | Phân hệ XBOS trong hệ sinh thái XeVN |

## 2. Tóm Tắt Điều Hành

XBOS là lõi quản trị tập đoàn của XeVN, chịu trách nhiệm thống nhất dữ liệu dùng chung và điều phối cấu hình cho các phân hệ trong hệ sinh thái.  
Mục tiêu không chỉ là cung cấp dữ liệu kỹ thuật, mà là bảo đảm người dùng vận hành toàn hệ thống bằng một ngôn ngữ nghiệp vụ thống nhất, từ lớp menu điều hướng đến các màn nghiệp vụ chi tiết.

## 3. Bối Cảnh Nghiệp Vụ

### 3.1 Cấu trúc hệ sinh thái

XeVN là đơn vị vận hành theo mô hình doanh nghiệp dịch vụ vận tải - logistics đa công ty, cần quản trị tập trung nhưng triển khai tác nghiệp phân tán theo từng bộ phận chuyên môn.

Các phân hệ nghiệp vụ hiện hữu trong hệ thống gồm:

- Trung tâm,
- X-BOS,
- Nhân sự,
- Vận hành xe,
- Tài chính,
- Cài đặt.

Trong bối cảnh này, X-BOS là nơi quản trị dữ liệu dùng chung cho toàn bộ các phân hệ, không thay thế nghiệp vụ chuyên sâu của từng phân hệ.

### 3.2 Bản đồ nghiệp vụ theo từng phân hệ

| Phân hệ | Mục tiêu nghiệp vụ | Đối tượng sử dụng chính | Dữ liệu nghiệp vụ trọng tâm | Năng lực cốt lõi cần quản trị |
|---|---|---|---|---|
| Trung tâm | Điều hành tổng hợp và giám sát vận hành toàn đơn vị | Ban điều hành, quản lý trung tâm | Chỉ số điều hành, cảnh báo, tiến độ xử lý, SLA | Tổng quan tức thời, cảnh báo trọng điểm, theo dõi chéo phân hệ |
| X-BOS | Quản trị lõi dữ liệu dùng chung và quy tắc hệ thống | Quản trị hệ thống, quản trị dữ liệu | Danh mục dùng chung, siêu dữ liệu, phân quyền, quy trình, nhật ký kiểm toán | Quản trị dữ liệu chuẩn, phát hành phiên bản dữ liệu, kiểm soát thay đổi |
| Nhân sự | Quản trị vòng đời nhân sự đa công ty | Quản trị nhân sự, quản trị doanh nghiệp | Hồ sơ nhân sự, tài khoản, vai trò, mời nhân viên, quyết định nhân sự | Quản trị người dùng, phân quyền theo phạm vi, xử lý nghiệp vụ nhân sự theo lô |
| Vận hành xe | Tổ chức và kiểm soát hoạt động xe/tuyến/chuyến | Điều phối, giám sát vận hành, đội hiện trường | Lệnh điều xe, tuyến, chuyến, trạng thái xe, bảo dưỡng, phân bổ nguồn lực | Điều phối xe theo thời gian thực, kiểm soát công suất, xử lý ngoại lệ vận hành |
| Tài chính | Kiểm soát thu chi và hiệu quả tài chính theo đơn vị | Kế toán, tài chính, quản trị doanh nghiệp | Khoản mục chi phí, doanh thu, công nợ, đối soát, kỳ báo cáo | Ghi nhận giao dịch tài chính, đối soát, kiểm soát ngân sách và dòng tiền |
| Cài đặt | Quản trị tham số vận hành và chính sách hệ thống | Quản trị hệ thống, quản trị nghiệp vụ | Cấu hình hệ thống, mẫu dữ liệu, tham số nghiệp vụ, chính sách hiệu lực | Thiết lập tham số đồng bộ, quản trị phạm vi áp dụng, chuẩn hóa cấu hình toàn hệ |

### 3.3 Vấn đề nghiệp vụ hiện hữu

- Danh mục dùng chung dễ bị lệch giữa các phân hệ nếu thiếu quản trị tập trung.
- Khi thêm phân hệ mới, rủi ro sai phạm vi dữ liệu tăng cao.
- Khó truy vết thay đổi nếu cấu hình thay đổi nhưng không có cơ chế kiểm soát phát hành.

### 3.4 Quy tắc định danh và phạm vi dữ liệu (bắt buộc liên phân hệ)

XBOS là trung tâm cấu hình nhưng **không** miễn áp dụng quy tắc phạm vi dữ liệu chung: mọi luồng quản trị và tiêu thụ API phải bám `BR-ECO-SCOPE-*` trong `docs/ecosystem/BRD.md`, `docs/ecosystem/SRS.md`, `docs/ecosystem/TECHSPEC.md`. Phân hệ mới trong hệ sinh thái chỉ cần trích dẫn bộ tài liệu ecosystem này.

## 4. Mục Tiêu Và Chỉ Số Thành Công

### 4.1 Mục tiêu

- Thiết lập XBOS thành nguồn chuẩn duy nhất cho dữ liệu dùng chung.
- Bảo đảm các phân hệ Trung tâm, Nhân sự, Vận hành xe, Tài chính, Cài đặt nhận dữ liệu đúng phạm vi, đúng phiên bản.
- Bảo đảm thay đổi cấu hình nhạy cảm có quy trình duyệt và truy vết đầy đủ.

### 4.2 Chỉ số thành công

- 100% phân hệ lấy dữ liệu dùng chung từ XBOS.
- 0 sự cố nghiêm trọng do sai phạm vi dữ liệu giữa các phân hệ.
- 100% thay đổi phát hành có nhật ký kiểm toán và bằng chứng kiểm thử.

## 5. Phạm Vi

### 5.1 Trong phạm vi

- Quản trị danh mục dùng chung.
- Quản trị siêu dữ liệu động phục vụ biểu mẫu và màn nghiệp vụ.
- Gán dữ liệu dùng chung theo phân hệ đích, công ty, phạm vi tổ chức.
- Phát hành hợp đồng dữ liệu theo phiên bản.
- Ghi nhật ký kiểm toán, truy vết và giám sát thay đổi.

### 5.2 Ngoài phạm vi

- Xử lý giao dịch chuyên sâu của Nhân sự, Vận hành xe, Tài chính.
- Thay thế quy trình nghiệp vụ đặc thù của các phân hệ.

## 6. Bên Liên Quan Và Vai Trò

| Nhóm | Vai trò |
|---|---|
| Ban điều hành | Quyết định chính sách dữ liệu dùng chung |
| Quản trị XBOS | Cấu hình, phát hành, kiểm soát thay đổi |
| Chủ sở hữu phân hệ | Sử dụng dữ liệu dùng chung cho phân hệ phụ trách |
| FE/BE | Tích hợp màn hình và dịch vụ theo hợp đồng dữ liệu |
| QA/QC | Kiểm thử, đánh giá chất lượng phát hành |

## 7. Danh Mục Use Case

| Mã | Tên use case | Tác nhân chính |
|---|---|---|
| UC-XBOS-01 | Kiểm tra trạng thái dịch vụ | Hệ thống nội bộ |
| UC-XBOS-02 | Khởi tạo/cập nhật danh mục dùng chung | Quản trị XBOS |
| UC-XBOS-03 | Lấy danh mục theo khóa và phân hệ đích | FE/BE phân hệ |
| UC-XBOS-04 | Liệt kê danh mục theo phân hệ đích | FE/BE phân hệ |
| UC-XBOS-05 | Phát hành phiên bản hợp đồng dữ liệu | Quản trị XBOS |
| UC-XBOS-06 | Truy vấn nhật ký kiểm toán | Quản trị/kiểm soát |
| UC-XBOS-07 | Tiếp nhận cảnh báo từ phân hệ vệ tinh | Dịch vụ phân hệ |

## 8. Luồng Nghiệp Vụ Tổng Quan

1. Quản trị XBOS cập nhật dữ liệu dùng chung.
2. Hệ thống kiểm tra điều kiện phát hành và ghi nhật ký kiểm toán.
3. XBOS phát hành phiên bản hợp đồng dữ liệu mới.
4. Các phân hệ đồng bộ dữ liệu theo phân hệ đích và phạm vi.
5. Người dùng vận hành trên từng phân hệ với dữ liệu đã thống nhất.

## 9. Quy Tắc Nghiệp Vụ

| Mã quy tắc | Điều kiện | Hành động | Kết quả |
|---|---|---|---|
| BR-XBOS-01 | Dữ liệu dùng chung phát sinh mới | Chỉ quản trị tại XBOS | Không tạo nguồn chuẩn song song |
| BR-XBOS-02 | Yêu cầu có phân hệ đích không hợp lệ | Từ chối | Trả mã lỗi chuẩn |
| BR-XBOS-03 | Dữ liệu chưa được gán cho phân hệ | Không cấp phát | Bảo đảm đúng phạm vi sử dụng |
| BR-XBOS-04 | Thay đổi nhạy cảm | Bắt buộc duyệt và ghi nhật ký | Truy vết đầy đủ trước/sau |
| BR-XBOS-05 | Có phiên bản mới | Phát tín hiệu đồng bộ | Các phân hệ cập nhật đúng phiên bản |

## 10. Yêu Cầu Dữ Liệu Mức Nghiệp Vụ

| Thành phần | Mô tả nghiệp vụ | Quy tắc chính |
|---|---|---|
| Khóa danh mục | Định danh dữ liệu dùng chung | Không trùng, bắt buộc tồn tại trước khi cấp phát |
| Phân hệ đích | Phân hệ được phép sử dụng | Bắt buộc thuộc danh mục phân hệ hợp lệ |
| Phiên bản lược đồ | Phiên bản hợp đồng dữ liệu | Tăng tuần tự, có thời điểm hiệu lực |
| Phạm vi tổ chức | Tenant/công ty/đơn vị áp dụng | Bắt buộc kiểm tra trước khi trả dữ liệu |

## 11. Ràng Buộc Phi Chức Năng

- Bảo mật: kiểm soát xác thực, phân quyền, phạm vi dữ liệu ở mọi yêu cầu.
- Độ tin cậy: nhánh từ chối không làm thay đổi trạng thái dữ liệu.
- Vận hành: phải có nhật ký kiểm toán và khả năng truy xuất theo giao dịch.
- Mở rộng: thêm phân hệ mới không phá vỡ dữ liệu hiện hành.

## 12. Rủi Ro Và Biện Pháp

| Rủi ro | Tác động | Biện pháp |
|---|---|---|
| Lệch dữ liệu giữa các phân hệ | Sai nghiệp vụ, sai báo cáo | Bắt buộc đồng bộ qua XBOS |
| Trôi hợp đồng dữ liệu FE/BE | Lỗi tích hợp màn hình | Khóa phiên bản và kiểm thử tương thích |
| Thiếu truy vết thay đổi | Khó kiểm soát phát hành | Bắt buộc nhật ký kiểm toán |

## 13. Tiêu Chí Chấp Nhận

- Tất cả use case UC-XBOS-01..16 có thể kiểm thử đầy đủ nhánh thành công/lỗi.
- Dữ liệu dùng chung cấp phát đúng phân hệ đích và đúng phạm vi.
- Cơ chế phát hành phiên bản và nhật ký kiểm toán hoạt động nhất quán.

## 14. Bổ sung sau họp Chủ tịch Nam (2026-05)

### 14.1 Mảng kinh doanh & pháp nhân

- **Mảng kinh doanh (`business_segment`):** Công ty con ảo; `promote_to_subsidiary` gán pháp nhân, giữ ID/lịch sử (UC-XBOS-10).
- **Hồ sơ pháp nhân:** MST, ngày TL, địa chỉ, ngành nghề, vốn ĐL, ĐDPL; tab tổng quan group (mẹ + con + liên kết).

### 14.2 Chức danh, JD, phân quyền

- **Thư viện chức danh:** `position_template` — khai chức danh trước người; copy sang công ty con (UC-XBOS-11).
- **Gán vị trí:** `position_assignment` — kiêm nhiệm đa công ty (UC-XBOS-11).
- **Mã quyền:** Tự sinh; check trùng khi gán; phạm vi group/subsidiary; `valid_from`/`valid_to` (UC-XBOS-12).
- **BR-XBOS-MULTI-HAT-01:** Cùng user, nhiều vai trong một instance → phê duyệt từng vai, không gộp bước (UC-XBOS-14).

### 14.3 Workflow & báo cáo

- Nhóm QT (NS/VH/KT); QT tập đoàn bắt buộc vs con tự xây; điều kiện số tiền/phòng/nhóm chi phí; **không import** definition từ Excel (UC-XBOS-13).
- **`reporting_route`:** Rollup kết quả QT tách khỏi bước workflow (UC-XBOS-15).

### 14.4 Tài sản ↔ Kế toán

- Orchestration 5 bước: khai báo → KT xác nhận → ghi nhận → gán NV/phòng (UC-XBOS-16).
