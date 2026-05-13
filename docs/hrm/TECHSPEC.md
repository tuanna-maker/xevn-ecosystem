# TechSpec Phân Hệ HRM

## 1. Mục Tiêu Kỹ Thuật

Chuẩn hóa thiết kế kỹ thuật cho HRM theo baseline toàn hệ, bảo đảm tích hợp ổn định với XBOS và FE hiện hành.

### 1.1 Quy tắc giao hàng (bắt buộc)

**Cập nhật BRD → SRS → TechSpec (và mobile nếu liên quan) trước hoặc đồng thời với code** trong cùng thay đổi có ý nghĩa nghiệp vụ; triển khai **bám đặc tả**. Ngoại lệ chỉ cho hotfix an ninh/ổn định, phải ghi rõ trong PR và bổ sung tài liệu ngay chu kỳ merge tiếp theo.

## 2. Stack Công Nghệ

- Backend: NestJS (`apps/api/hrm-api`)
- Database: PostgreSQL
- Frontend Web: React + Vite (`apps/web/hrm`)
- ORM chuẩn toàn hệ: Prisma (định hướng bắt buộc)

## 3. Hiện Trạng Runtime Cần Nắm

- BE HRM đã triển khai theo NestJS với nhiều module nghiệp vụ.
- FE HRM đang chạy React/Vite và dùng API client nội bộ cho nhiều flow.
- FE HRM hiện còn tích hợp Supabase ở một số phần (auth/client/functions/migrations) trong `apps/web/hrm`.
- BE HRM có thành phần liên quan Supabase trong nghiệp vụ admin.
- Hiện trạng code chưa thể hiện lớp Prisma runtime rõ ràng cho HRM API; cần kế hoạch chuẩn hóa dần về Prisma.

## 4. Kiến Trúc Thành Phần

### 4.1 Backend

- Mô hình lớp: Controller -> Service -> Data access.
- Nhóm API chính:
  - admin lifecycle,
  - catalog sync,
  - domain APIs nhân sự.
- Validation DTO bắt buộc tại biên API.

### 4.2 Frontend

- FE tiêu thụ API HRM qua lớp tích hợp tập trung.
- UI phải xử lý rõ trạng thái loading/success/error.
- Không hardcode logic phân quyền trong UI, ưu tiên theo contract BE.

### 4.3 Data

- Dữ liệu nghiệp vụ lưu trên PostgreSQL.
- Catalog dùng chung tiêu thụ từ XBOS và lưu snapshot phục vụ truy vấn.

## 5. API Contract Chuẩn

Envelope thành công:

```json
{
  "success": true,
  "code": "HRM-XXXX",
  "message": "Mô tả ngắn",
  "data": {},
  "timestamp": "ISO-8601"
}
```

Envelope lỗi:

```json
{
  "success": false,
  "code": "HRM-ERR-XXXX",
  "message": "Mô tả lỗi",
  "details": {},
  "timestamp": "ISO-8601"
}
```

## 6. Bảo Mật Và Phân Quyền

- Xác thực và kiểm quyền bắt buộc với endpoint bảo vệ.
- Cô lập dữ liệu theo phạm vi tenant/công ty.
- Không log lộ dữ liệu nhạy cảm.
- **Chuẩn toàn hệ (bắt buộc tham chiếu, không nhân bản văn bản):** hai chế độ *chưa đăng nhập / system admin (liên tenant)* và *đã đăng nhập / một tenant* — xem `docs/ecosystem/TECHSPEC.md`, `docs/ecosystem/SRS.md`, `docs/ecosystem/BRD.md`. Mọi phân hệ mới trong hệ sinh thái dùng chung bộ tài liệu này.

### 6.1 Tenant master / bootstrap (đa tenant sau này)

- **Không** nhúng literal tenant sản phẩm (ví dụ slug tenant cố định) trong service/controller cho phạm vi nghiệp vụ.
- Biến môi trường (triển khai đơn tenant hiện tại = tenant master): `MASTER_TENANT_ID` hoặc `DEFAULT_TENANT_ID`; `DEFAULT_COMPANY_ID` hoặc `DEFAULT_COMPANY_HEADER_ID` — đọc tập trung tại `apps/api/hrm-api/src/common/tenant-scope-env.ts`.
- DDL bootstrap bảng `synced_catalogs` (catalog-sync) dùng giá trị đã chuẩn hóa từ env; nếu thiếu env -> lỗi cấu hình rõ ràng (`HRM-SYNC-CONF`), không fallback cứng trong code.
- Runtime mọi API: `resolveScopeContext` + header `x-tenant-id` / JWT — xem `apps/api/hrm-api/src/common/scope-context.ts`.

### 6.2 Pipeline thông báo nghiệp vụ (Postgres `hrm-api`)

- Dịch vụ fanout: `apps/api/hrm-api/src/notifications/attendance-event-fanout.service.ts` (tên lịch sử; thực tế fanout **mọi** envelope trong `HrmRealtimeEventEnvelope`: đơn chấm công chỉnh sửa, nghỉ phép, yêu cầu dịch vụ).
- Thứ tự cố định mỗi sự kiện: **Socket.IO** (`HrmRealtimeService.publishAttendanceEvent`) → **ghi inbox** (`HrmInboxService.persistAttendanceEnvelope`) → **webhook** (`WebhookOutboundService`) → **push** (`PushOutboundService`).
- Bảng inbox: `public.hrm_inbox_notifications` (tạo/đảm bảo schema trong service inbox). Đơn mới: một dòng `recipient_employee_id NULL` (broadcast theo `company_id`). Quyết định: thêm dòng đích danh cho `employee_id` người gửi khi có UUID (xem SRS UC-HRM-09..12).

## 7. Hiệu Năng Và Độ Tin Cậy

- Tối ưu truy vấn theo phạm vi và key nghiệp vụ.
- Luồng tích hợp XBOS cần timeout/retry phù hợp.
- Nhánh reject không mutation dữ liệu.

## 8. Kiểm Thử Kỹ Thuật

- Unit test cho service cốt lõi.
- Contract test cho nhánh lỗi xác thực/phân quyền/validation/sync.
- Integration test cho luồng đồng bộ XBOS -> HRM.
- FE test cho mapping lỗi quan trọng.

## 9. Lộ Trình Chuẩn Hóa Kỹ Thuật

1. Ổn định contract FE/BE với mã lỗi chuẩn.
2. Rà soát vùng Supabase hiện hữu, phân loại giữ lại hay thay bằng lớp chuẩn.
3. Chuẩn hóa data access về Prisma theo lộ trình có kiểm soát rủi ro.

## 10. Tài Liệu Kèm Theo — Ứng Dụng Di Động HRM

- BRD mobile: `docs/hrm/BRD_MOBILE.md`
- SRS mobile: `docs/hrm/SRS_MOBILE.md`
- TechSpec mobile: `docs/hrm/TECHSPEC_MOBILE.md`
