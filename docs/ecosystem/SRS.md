# SRS — Định danh và phạm vi dữ liệu toàn hệ sinh thái XeVN

## 1. Mục đích

Đặc tả yêu cầu phần mềm **chung cho mọi phân hệ**, bảo đảm:

- đồng nhất với `docs/ecosystem/BRD.md` (BR-ECO-SCOPE-*),
- mọi API và giao diện có hành vi phân vùng **dự đoán được** ở hai chế độ: system admin (chưa đăng nhập / môi trường cho phép) và người dùng theo một tenant,
- khi thêm phân hệ mới, chỉ cần tham chiếu tài liệu này thay vì sao chép toàn bộ.

## 2. Danh mục use case liên phân hệ

| Mã | Tên | Áp dụng |
|---|---|---|
| UC-ECO-SCOPE-01 | Truy cập nghiệp vụ khi chưa có định danh người dùng đủ điều kiện | Toàn phân hệ có yêu cầu phạm vi tenant |
| UC-ECO-SCOPE-02 | Truy cập nghiệp vụ khi đã đăng nhập theo tài khoản một tenant (seed/cấp quyền) | Toàn phân hệ có yêu cầu phạm vi tenant |

## 3. UC-ECO-SCOPE-01 — Chưa đăng nhập, giả định system admin

### 3.1 Điều kiện tiên quyết

- Môi trường triển khai cho phép làm việc nghiệp vụ trước đăng nhập (theo cấu hình an toàn của môi trường đó).

### 3.2 Luồng xử lý (if / else)

- **If** yêu cầu không mang đủ thông tin định danh người dùng để gắn một tenant cụ thể **và** hệ thống đang ở chế độ cho phép UC-ECO-SCOPE-01 **then** coi phiên làm việc thuộc **quyền system admin** và áp dụng truy vấn **không giới hạn một tenant** (liên tenant / toàn bộ tenant mà lớp dữ liệu hỗ trợ).
- **Else if** yêu cầu có định danh đủ điều kiện **then** chuyển sang UC-ECO-SCOPE-02 (không áp dụng nhánh system admin mặc định).
- **Else** từ chối hoặc báo lỗi thiếu phạm vi theo chính sách môi trường.

### 3.3 Tiêu chí thành công / thất bại

- **Thành công:** người dùng thực hiện được nghiệp vụ và thấy tập dữ liệu **gộp theo toàn tenant** (hoặc theo bộ lọc admin tương đương) mà không bị ép vào một tenant đơn lẻ.
- **Thất bại:** hệ thống trả lỗi thiếu `tenantId` / phạm vi khi vẫn đang trong UC-ECO-SCOPE-01 hợp lệ — trừ khi có quyết định thiết kế tạm dùng giá trị mặc định kỹ thuật (xem TECHSPEC).

## 4. UC-ECO-SCOPE-02 — Đã đăng nhập, phạm vi một tenant

### 4.1 Điều kiện tiên quyết

- Người dùng đã xác thực.
- Token hoặc phiên có claim / bản ghi membership xác định **tenant** (và khi cần **companyId** / đơn vị) khớp seed hoặc cấp quyền.

### 4.2 Luồng xử lý (if / else)

- **If** yêu cầu đọc/ghi dữ liệu nghiệp vụ **then** lọc mọi truy vấn theo tenant (và đơn vị con được phép) của tài khoản.
- **Else if** yêu cầu nhắm tới dữ liệu ngoài phạm vi **then** từ chối với mã lỗi phân quyền / phạm vi chuẩn của phân hệ.
- **Else** xử lý theo luồng hợp lệ của use case cụ thể.

### 4.3 Tiêu chí thành công / thất bại

- **Thành công:** chỉ dữ liệu thuộc tenant được phép được trả về hoặc cập nhật.
- **Thất bại:** lộ bản ghi của tenant khác (lỗi nghiêm trọng, chặn phát hành).

## 5. Ma trận mã lỗi gợi ý (liên phân hệ)

Các phân hệ có thể dùng mã riêng (ví dụ `HRM-*`, `XBOS-*`) nhưng **ngữ nghĩa** phải tương ứng:

| Tình huống | HTTP gợi ý | Mã logic gợi ý |
|---|---|---|
| Thiếu tenant khi bắt buộc có phạm vi tenant | 400 | `SCOPE_TENANT_REQUIRED` (hoặc tương đương) |
| Thiếu company khi bắt buộc | 400 | `SCOPE_COMPANY_REQUIRED` (hoặc tương đương) |
| Đủ đăng nhập nhưng truy cập ngoài tenant | 403 | Mã `FORBIDDEN` / phân quyền của phân hệ |

## 6. Yêu cầu phi chức năng

- **Bảo mật:** chế độ system admin mặc định **không** bật trên production trừ khi có quyết định và kiểm soát riêng.
- **Nhất quán:** cùng một quy tắc BR-ECO trên mọi phân hệ.
- **Kiểm thử:** bắt buộc có ca kiểm thử regression cho hai chế độ khi chạm dữ liệu nghiệp vụ.
- **Trải nghiệm giao diện (BR-ECO-UX-01):** khi phân hệ chạy nhúng trong portal, mở dialog/modal hoặc lớp phủ tương đương → backdrop và nội dung phải che toàn bộ viewport trình duyệt (kể cả thanh điều hướng portal); các lớp nổi phụ (select, popover, menu) phải dùng cùng document/container với dialog để không cắt xén hoặc lệch tầng.

## 7. Tham chiếu

- BRD nghiệp vụ: `docs/ecosystem/BRD.md`.
- Triển khai: `docs/ecosystem/TECHSPEC.md`.

## 8. Bổ sung use case nền cho Full Ecosystem Wave

| Mã | Tên | Mô tả ngắn |
|---|---|---|
| UC-ECO-MASTER-01 | Quản lý master-data theo tenant/company | Các màn settings, customers, partners, organization đọc/ghi qua API và DB thật theo phạm vi tenant/company |
| UC-ECO-MASTER-02 | Mở rộng tenant mới với xevn là master tenant | Không xóa dữ liệu tenant khác trong runtime; tenant master dùng để bootstrap mặc định, không cưỡng bức single-tenant |

### 8.1 UC-ECO-MASTER-01 — if/else bắt buộc

- **If** request có đủ `tenantId` + `companyId` hợp lệ **then** cho phép CRUD master-data trong scope đó.
- **Else if** thiếu scope bắt buộc **then** trả lỗi `SCOPE_TENANT_REQUIRED` hoặc `SCOPE_COMPANY_REQUIRED`.
- **Else if** token scope khác request scope **then** trả lỗi xung đột scope (`SCOPE_CONTEXT_MISMATCH`).

### 8.2 UC-ECO-MASTER-02 — if/else bắt buộc

- **If** tạo tenant mới **then** hệ thống khởi tạo dữ liệu mặc định theo tenant mới, không tác động tenant hiện hữu.
- **Else if** thao tác cleanup tenant chéo **then** chỉ cho phép qua luồng admin tường minh có cờ bảo vệ vận hành.
- **Else** giữ nguyên hành vi phân vùng dữ liệu `(tenant_id, company_id)` cho mọi nghiệp vụ.
