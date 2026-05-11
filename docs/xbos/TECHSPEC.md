# TechSpec Phân Hệ XBOS

## 1. Mục Tiêu Kỹ Thuật

Chuẩn hóa thiết kế kỹ thuật cho XBOS theo baseline toàn hệ, bảo đảm khả năng mở rộng và tích hợp ổn định.

## 2. Stack Công Nghệ

- Backend: NestJS
- Database: PostgreSQL
- Frontend quản trị: React + Vite (ứng dụng `x-bos-core`, tích hợp hiển thị trên portal)
- ORM chuẩn toàn hệ: Prisma (định hướng bắt buộc)

## 3. Hiện Trạng Runtime Cần Nắm

- BE XBOS đã chạy theo NestJS (`apps/api/xbos-api`).
- FE XBOS đang dùng React/Vite (`apps/web/x-bos-core`, `apps/web/web-portal`).
- Hiện trạng code chưa thể hiện lớp Prisma runtime rõ ràng trong XBOS API; cần kế hoạch chuẩn hóa dần về Prisma theo baseline chung.
- Supabase không phải lớp dữ liệu chuẩn cho XBOS.

## 4. Kiến Trúc Thành Phần

### 4.1 Backend

- Mô hình lớp: Controller -> Service -> Data access.
- API chính: config-sync và các dịch vụ liên quan tài sản/cấu hình.
- Bắt buộc validate đầu vào ở biên API.

### 4.2 Frontend

- Ứng dụng quản trị hiển thị danh mục/cấu hình.
- FE đọc dữ liệu qua API contract ổn định, không hardcode logic dữ liệu nguồn.

### 4.3 Data

- Nguồn dữ liệu chuẩn PostgreSQL.
- Thiết kế bảng theo key catalog và cấu trúc item có khả năng truy vấn theo target.

## 5. API Contract Chuẩn

Envelope thành công:

```json
{
  "success": true,
  "code": "XBOS-XXXX",
  "message": "Mô tả ngắn",
  "data": {},
  "timestamp": "ISO-8601"
}
```

Envelope lỗi:

```json
{
  "success": false,
  "code": "XBOS-ERR-XXXX",
  "message": "Mô tả lỗi",
  "details": {},
  "timestamp": "ISO-8601"
}
```

## 6. Bảo Mật Và Phân Quyền

- Kiểm tra xác thực và quyền ngay tại biên API.
- Chặn truy cập trái target/phạm vi.
- Log tối thiểu thông tin truy vết, không lộ dữ liệu nhạy cảm.
- **Chuẩn toàn hệ (bắt buộc tham chiếu):** định danh system admin khi chưa đăng nhập (liên tenant) vs người dùng một tenant sau đăng nhập — `docs/ecosystem/TECHSPEC.md`, `docs/ecosystem/SRS.md`, `docs/ecosystem/BRD.md`. Phân hệ mới chỉ trích dẫn, không viết lại quy tắc.

## 7. Hiệu Năng Và Độ Tin Cậy

- Tối ưu truy vấn theo key/target.
- Timeout và xử lý lỗi nhất quán cho tích hợp liên dịch vụ.
- Không ghi dữ liệu trong nhánh reject.

## 8. Kiểm Thử Kỹ Thuật

- Unit test cho service xử lý catalog.
- Contract test cho nhánh success/error chính.
- Integration test cho đường dẫn cấp phát catalog tới downstream.

## 9. Lộ Trình Chuẩn Hóa Kỹ Thuật

1. Duy trì hợp đồng API ổn định.
2. Chuẩn hóa data access theo Prisma cho phần chưa hoàn tất.
3. Chuẩn hóa logging/metrics phục vụ vận hành dài hạn.

## 10. Bổ sung thiết kế Business Master (Wave Full Ecosystem)

- Thêm bảng chuẩn `public.xbos_business_master_entries` cho CRUD danh mục nghiệp vụ theo scope:
  - khóa chính: `(tenant_id, company_id, domain, item_id)`
  - cột dữ liệu: `payload JSONB`, `status`, `created_at`, `updated_at`
- Dải domain hiện tại:
  - `companies`
  - `kpi_metrics`
  - `positions`
  - `vendors`
  - `expense_categories`
  - `organizations`
  - `customers`
  - `partners`
- Nguyên tắc truy vấn:
  - luôn lọc theo `tenant_id + company_id + domain`
  - soft-delete qua `status = 'deleted'`, không xóa cứng mặc định
  - index `tenant_id, company_id, domain, updated_at DESC` cho read path danh sách.
