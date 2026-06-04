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

- **Nguồn sự thật nghiệp vụ:** `apps/api/hrm-api` (NestJS) + PostgreSQL (`xevn_hrm`, migration `migrations/hrm/*`).
- FE HRM (`apps/web/hrm`) tiêu thụ REST qua `integrations/hrmApi.ts` (`VITE_HRM_API_ORIGIN` → `/api/hrm/...`).
- **Không** dùng Supabase làm database/runtime cho HRM. Thư mục `apps/web/hrm/supabase/` chỉ là di sản Lovable (migrations/functions cũ) — không phải lớp vận hành chuẩn.
- Một số hook FE hoặc `hrm-admin` trong repo có thể còn import `@supabase/supabase-js` (auth/admin tạm); ưu tiên thay bằng endpoint Postgres + JWT `hrm-api` khi gặp trong PR.
- Data access BE: `pg` pool (`HrmDbService`); định hướng chuẩn hóa Prisma theo lộ trình §9.

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
2. Gỡ hoàn toàn import Supabase còn sót trên FE/BE (auth admin, hook fallback).
3. Chuẩn hóa data access về Prisma theo lộ trình có kiểm soát rủi ro.
4. Căn tenant HRM với membership X-BOS (`x-tenant-id`, `company_id=main` trên tenant thành viên).

## 10. Tài Liệu Kèm Theo — Ứng Dụng Di Động HRM

- BRD mobile: `docs/hrm/BRD_MOBILE.md`
- SRS mobile: `docs/hrm/SRS_MOBILE.md`
- TechSpec mobile: `docs/hrm/TECHSPEC_MOBILE.md`

## 11. Portal embed — Web Portal (`apps/web/web-portal`)

**Data-mode ADR (Supabase vs Nest trong iframe):** [`docs/decisions/ADR-HRM-EMBED-DATA-MODE.md`](../decisions/ADR-HRM-EMBED-DATA-MODE.md) — `shouldSkipSupabaseDataFetches`, `portalAuthBridge`, identity scope, backlog Supabase theo view, contract `GET /employees/:id`.

### 11.1 Kiến trúc

- Module: `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx`
- Client: `apps/web/web-portal/src/modules/hrm/hrmApiClient.ts`
- Proxy Vite: `/api/hrm` → `VITE_DEV_PROXY_HRM_API` (mặc định `http://127.0.0.1:28001`)
- Scope: `resolveIdentityScope` + headers `x-tenant-id`, `x-company-id`, `x-internal-api-key`

### 11.2 Bảng endpoint ↔ tab embed

| Tab (`:view`) | HTTP | Ghi chú |
|---------------|------|---------|
| `employees` | `GET /api/hrm/employees` | Fallback `mockEmployees` cần gỡ production |
| `payroll` | `GET /api/hrm/payroll/payslips` | |
| `recruitment` | `GET /api/hrm/recruitment/requisitions` | |
| `attendance` | `GET /api/hrm/attendance/records` | |
| `contracts`, `insurance` | `GET /api/hrm/contracts-insurance/contracts` | |
| `dashboard` | employees + payslips + metadata queue | |
| metadata (queue) | `GET /api/hrm/employee-metadata/change-requests` | Approve/reject POST |
| `decisions`, `reports`, `hrm_ai`, `tasks`, … | — | Mock; backlog BRD |

### 11.3 Anti-mock policy (FE)

| Quy tắc | Triển khai |
|---------|------------|
| BR-MOCK-01 | `data.length === 0` → component empty, không gán mock array |
| BR-MOCK-02 | `catch` → `setError(banner)`; mock chỉ khi `import.meta.env.DEV && VITE_ALLOW_MOCK_FALLBACK=true` |
| Nguồn công ty sidebar | `fetchGroupMemberUnitsForCommandCenter()` thay `mockCompanies` |

### 11.4 Catalog → form (shared với app HRM)

1. Command Center `groupHrCatalogApi` → `POST .../settings-catalogs/{key}/extension-items`
2. `GET /api/hrm/settings-catalogs` → `effectiveItems`
3. `apps/web/hrm` `EmployeeFormDialog` đọc cùng catalog keys (`hrm_employee_*_fields`)

Field map: `apps/web/web-portal/src/integrations/groupHrCatalogApi.ts` + `group-hr-catalog-presets.ts` (tenant `xe-du-lich`).

## 12. App HRM native — thay mock (`apps/web/hrm`)

| Component / Page | Mock hiện tại | API mục tiêu |
|------------------|---------------|-------------|
| `EmployeeSalary.tsx` | `mockSalaryData`, allowances | `payroll/*` |
| `Payroll.tsx` | mock periods | `payroll/payslips`, periods |
| `Recruitment.tsx` | partial mock | `recruitment/*` |
| `Attendance.tsx` | hooks API (ưu tiên) | `attendance/*` |
| `EmployeeWorkHistory.tsx` | static arrays | employee payload / history table (BRD) |

Client chuẩn: `apps/web/hrm/src/integrations/hrmApi.ts` (`VITE_HRM_API_ORIGIN`).
