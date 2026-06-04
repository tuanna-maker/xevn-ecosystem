# Kế Hoạch Triển Khai Chi Tiết — HRM Mobile

## 1. Kiểm Soát Tài Liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | Kế hoạch triển khai HRM Mobile |
| Phiên bản | 1.0 |
| Ngày | 2026-05-12 |
| Tham chiếu | `docs/hrm/BRD_MOBILE.md`, `docs/hrm/SRS_MOBILE.md`, `docs/hrm/TECHSPEC_MOBILE.md` |
| Mã nguồn | `apps/mobile/hrm-mobile` |

## 2. Nguyên Tắc Triển Khai

- Mỗi use case `UC-HRM-MOB-*` có **màn hình hoặc luồng** tương ứng; giai đoạn P2 có thể là stub + banner.
- Mọi gọi API dùng client tập trung: `Authorization` (Bearer JWT) **hoặc** `x-internal-api-key` (chỉ dev), `x-tenant-id`, `x-company-id`, `x-request-id`.
- Base URL: `EXPO_PUBLIC_HRM_API_BASE_URL` (ví dụ `http://localhost:3001` — **không** nối thừa `/api/hrm`; client tự tiền tố `/api/hrm`).
- Lỗi: map `HRM-ERR-*` từ envelope + `HRM-MOB-ERR-*` client theo `SRS_MOBILE.md`.

## 3. Ma Trận Use Case → Hạng Mục Công Việc

Backlog chi tiết: [`MOBILE_BACKLOG.md`](MOBILE_BACKLOG.md).

| UC | work_item_id | Tên | Màn hình / module | API chính (hrm-api) | Giai đoạn | Ghi chú triển khai |
|---|---|---|---|---|---|---|
| UC-HRM-MOB-01 | MOB-103 | Đăng nhập & phiên | `features/auth/LoginScreen.tsx` | `POST /api/hrm/auth/mobile/login`, `POST .../refresh` | P0.5 | Email/password pilot + dev JWT; SecureStore |
| UC-HRM-MOB-02 | Phạm vi công ty | `features/auth/ScopeScreen.tsx` + Cài đặt + `AuthContext` | Headers mọi request | P0 | `ScopeScreen`: chỉnh tenant / companyId / UUID / employeeId, lưu SecureStore |
| UC-HRM-MOB-03 | Dashboard | `features/dashboard/DashboardScreen.tsx` | `GET /api/hrm`, `GET .../employees`, `GET .../attendance/records` | P0 | `Promise.allSettled` tối đa 4 request; card lỗi từng phần |
| UC-HRM-MOB-04 | Chấm công | `features/attendance/CheckInScreen.tsx` | `POST /api/hrm/attendance/records` | P0 | Body `CreateAttendanceRecordDto`; chọn `employee_id` từ danh sách |
| UC-HRM-MOB-05 | Lịch sử chấm công | `features/attendance/AttendanceHistoryScreen.tsx` | `GET /api/hrm/attendance/records` | P0 | Query `company_id`, `employee_id`, `from_date`, `to_date` |
| UC-HRM-MOB-06 | Tạo đơn cập nhật công | `features/attendance/CreateUpdateRequestScreen.tsx` | `POST /api/hrm/attendance/update-requests` | P0 | Form tối thiểu theo `CreateAttendanceUpdateRequestDto` |
| UC-HRM-MOB-07 | MOB-101 | Danh sách đơn nghỉ | `LeaveRequestsListScreen.tsx` | `GET .../leave-requests?employee_id=` | P0.5 | MOB-BE-01 |
| UC-HRM-MOB-07 | MOB-104 | Danh sách / chi tiết đơn công | `UpdateRequestsScreen.tsx`, `UpdateRequestDetailScreen.tsx` | `GET .../update-requests` | P0.5 | `employee_id` filter |
| UC-HRM-MOB-08 | MOB-301 | Phê duyệt đơn | `ManagerApprovalsScreen.tsx` | approve/reject + `manager_employee_id` | P1 | MOB-BE-02 team scope |
| UC-HRM-MOB-09 | MOB-202 | Tóm tắt lương | `PayrollSummaryScreen.tsx`, `PayslipList/Detail` | `GET .../payroll/payslips` | P1 | MOB-BE-05 |
| UC-HRM-MOB-10 | Hợp đồng / BH | `features/contracts/ContractsScreen.tsx` | `GET /api/hrm/contracts-insurance/...` | P1 | Read-only list |
| UC-HRM-MOB-11 | Tasks / dịch vụ | `features/operations/OperationsScreen.tsx` | `GET /api/hrm/operations/...` | P1 | Tab danh sách |
| UC-HRM-MOB-12 | Hồ sơ cá nhân | `features/profile/ProfileScreen.tsx` | `GET/PATCH .../employees/:id` | P1 | `employee_id` từ cấu hình hoặc danh sách |
| UC-HRM-MOB-13 | MOB-201 | Thông báo | `InAppNotificationsScreen.tsx` | inbox + mark read; MOB-205 push | P1 | Badge manager tab |
| UC-HRM-MOB-14 | MOB-401 | Ngoại tuyến | `offlineQueue.ts`, `OfflineSync` | Queue POST khi offline | P2 | Flush khi online |
| UC-HRM-MOB-15 | Đăng xuất | `features/settings/SettingsScreen.tsx` | Xoá SecureStore | P0 | Nút đăng xuất |

## 4. Cấu Trúc Thư Mục (Đích)

```
apps/mobile/hrm-mobile/
  app.json
  babel.config.js
  metro.config.js
  tsconfig.json
  package.json
  index.ts
  App.tsx
  src/
    integrations/
      hrmApiClient.ts
      hrmEmployees.ts
      mapApiError.ts
      envelope.ts
      networkState.ts
      types.ts
      __tests__/mapApiError.test.ts
      __tests__/envelope.test.ts
    context/
      AuthContext.tsx
      NetworkContext.tsx
    hooks/
      useOfflineWriteGuard.ts
    components/
      OfflineBanner.tsx
    navigation/
      RootNavigator.tsx
      types.ts
    features/
      auth/LoginScreen.tsx
      auth/ScopeScreen.tsx
      dashboard/DashboardScreen.tsx
      attendance/*.tsx
      payroll/PayrollSummaryScreen.tsx
      contracts/ContractsScreen.tsx
      operations/OperationsScreen.tsx
      profile/ProfileScreen.tsx
      notifications/InAppNotificationsScreen.tsx
      settings/SettingsScreen.tsx
    storage/
      keys.ts
      asyncKeys.ts
    i18n/
      vi.ts
    utils/
      uuid.ts
  README.md
```

## 5. Lộ Trình Sprint

| Sprint | Nội dung | UC |
|---|---|---|
| S0 | Bootstrap Expo, Metro monorepo, lint/tsc/build script | — |
| S1 | Client API + Auth + Scope + Dashboard + Settings logout | 01,02,03,15 |
| S2 | Chấm công + lịch sử + đơn + tạo đơn | 04,05,06,07 |
| S3 | Phê duyệt + các màn P1 stub có điều hướng | 08..12 |
| S4 | Thông báo in-app + offline banner (P2) | 13,14 |

## 6. Kiểm Thử Tối Thiểu

- Unit: `mapApiError` (HTTP, envelope `success: false`, timeout).
- Thủ công: login → health 200 → tạo bản ghi chấm công (môi trường dev có `hrm-api`).

## 7. Định Nghĩa Hoàn Thành (DoD)

- `pnpm --filter hrm-mobile run build` thành công trên CI/local.
- `pnpm --filter hrm-mobile run lint` và `type-check` (nếu có) xanh.
- README mô tả biến `EXPO_PUBLIC_HRM_API_BASE_URL` và luồng token dev.

## 8. Kế Hoạch Chạy Thử Pilot — Công Ty XeVN

Mục tiêu: **hrm-api + Postgres `xevn_hrm` + HRM Mobile** chạy được một vòng nghiệp vụ thật (chấm công, đơn, lương, hợp đồng…) cho pilot nội bộ XeVN.

### 8.1 Chuẩn Bị Hạ Tầng & Biến Môi Trường

| Việc | Chi tiết |
|---|---|
| Database HRM | Chuỗi kết nối `DATABASE_URL_HRM` trỏ tới DB pilot (ví dụ `xevn_hrm` trên server dev). Tham chiếu `apps/api/hrm-api/.env.example`. |
| File env API | Copy `apps/api/hrm-api/.env.example` → `.env`, điền `DATABASE_URL_HRM`, giữ `PORT=3001` trừ khi đổi cổng. |
| Khóa nội bộ | `INTERNAL_API_KEY` (mặc định ví dụ `xevn-dev-internal-key`) — dùng header `x-internal-api-key` trên mobile **chỉ** môi trường không phải production. |
| JWT dịch vụ (tuỳ chọn) | `SERVICE_JWT_SECRET`, `SERVICE_JWT_ISSUER`, `SERVICE_JWT_AUDIENCE` — Bearer HS256; script mẫu: `scripts/simulate-hrm-uat-business-flow.ps1` (`New-ServiceJwt`). |
| Mobile | `EXPO_PUBLIC_HRM_API_BASE_URL`: máy thật dùng IP LAN (vd `http://192.168.x.x:3001`); Android emulator dùng `http://10.0.2.2:3001`. |

**Lưu ý phạm vi (SRS UC-02):** `x-tenant-id` / `x-company-id` (header) phải khớp seed và JWT (nếu JWT khai báo `tenantId` / `companyId` trong payload). Module **employees / contracts** dùng `company_id` **chuỗi** (vd `holding`). Module **attendance / payroll / operations (tasks, service-requests)** dùng `company_id` **UUID** trong query/body — mobile có trường **UUID công ty** riêng; pilot cần **một UUID cố định** ghi trong runbook (có thể lấy từ bản ghi đầu tiên sau seed, hoặc chọn một UUID và dùng thống nhất cho mọi POST chấm công / đơn / kỳ lương pilot). |

### 8.2 Migration & Seed Dữ Liệu XeVN

| Thứ tự | Lệnh / hành động |
|---:|---|
| 1 | Áp dụng migration HRM theo quy trình repo (vd `pnpm run migrate:hrm:apply` hoặc pipeline nội bộ đang dùng). |
| 2 | Seed nhân sự / đa tenant: vd `pnpm run seed:hrm:100-employees` hoặc `pnpm run seed:ecosystem:full` tùy pilot cần ít/nhiều dữ liệu. |
| 3 | Kiểm tra nhanh: `pnpm run seed:hrm:100-employees` có script verify `scripts/verify-hrm-100-employees.mjs` (các `company_id` chuỗi `holding`, `trsport`, …). |
| 4 | Ghi **runbook pilot**: `tenantId`, `companyId` header, `companyUuid` (UUID), ít nhất một `employeeId` (UUID) lấy từ `GET /api/hrm/employees?company_id=holding`. |

### 8.3 Chạy API & Kiểm Tra Sức Khỏe

| Bước | Việc |
|---:|---|
| 1 | Từ root: `pnpm run dev:hrm-api` (hoặc `pnpm --filter hrm-api run start:dev`). **Hoặc** Docker: service `hrm-api` trong [`deploy/dev-server/docker-compose.yml`](../../deploy/dev-server/docker-compose.yml) (cần `apps/api/hrm-api/.env`). |
| 2 | `curl` hoặc trình duyệt: `GET http://<host>:3001/api/hrm` → envelope `success: true`. |
| 3 | (Tuỳ chọn) Chạy luồng UAT một lần: `scripts/simulate-hrm-uat-business-flow.ps1` để xác nhận chuỗi API end-to-end trên cùng host/cổng. |

### 8.4 Chạy HRM Mobile & Đăng Nhập Pilot

| Bước | Việc |
|---:|---|
| 1 | `pnpm install` (root), `pnpm --filter hrm-mobile start` (Expo). |
| 2 | Màn đăng nhập: `HRM_API_BASE_URL`, `tenantId` (vd `xevn`), `companyId` header (vd `holding`), **UUID công ty** (attendance/payroll/ops), **employeeId** (UUID nhân viên), và **Bearer JWT** hoặc **`x-internal-api-key`** trùng `.env` API. |
| 3 | Vào **Trang chủ** → làm mới: 4 card tải được (hoặc partial lỗi có thông điệp). |
| 4 | **Cài đặt**: lưu lại UUID / employeeId vào SecureStore nếu pilot đổi máy. |

### 8.5 Kịch Bản Nghiệm Thu Pilot (Gợi Ý)

| # | Kịch bản | Màn / UC |
|---:|---|---|
| 1 | Check-in một ngày | Chấm công · UC-04 |
| 2 | Xem lịch sử 14 ngày | Lịch sử · UC-05 |
| 3 | Tạo đơn điều chỉnh công, xem danh sách theo filter | Đơn công · UC-06/07 |
| 4 | Duyệt / từ chối (tài khoản quản lý) | Phê duyệt · UC-08 |
| 5 | Xem kỳ lương | Lương · UC-09 |
| 6 | Xem hợp đồng + BH sắp hết hạn | Hợp đồng · UC-10 |
| 7 | Tạo task, duyệt yêu cầu dịch vụ pending | Vận hành · UC-11 |
| 8 | Sửa họ tên / chức danh (PATCH) | Hồ sơ · UC-12 |
| 9 | Làm mới tổng hợp in-app | Thông báo · UC-13 |
| 10 | Tắt mạng → banner offline, thử ghi → chặn | UC-14 |
| 11 | Đăng xuất, đăng nhập lại | UC-15 |

### 8.6 Việc Còn Lại / Rủi Ro (Backlog Pilot)

| Mục | Ghi chú |
|---|---|
| Docker một nút cho `hrm-api` + Postgres pilot | Đã thêm service `hrm-api` vào compose dev (DB vẫn dùng `DATABASE_URL_HRM` từ `.env`). Postgres trong compose: backlog nếu cần sandbox hoàn toàn cục bộ. |
| JWT theo user thật (Keycloak/SSO) | Pilot đang dùng JWT nội bộ hoặc internal key; production cần luồng SSO theo BRD. |
| Map `holding` ↔ UUID tổ chức | Nếu business yêu cầu một UUID duy nhất trùng “công ty holding”, cần bảng nguồn sự thật hoặc API trả `companyUuid` sau đăng nhập — mobile hiện nhập tay / Cài đặt. |
| Chứng chỉ TLS + domain | Pilot LAN có thể HTTP; production bắt HTTPS + pinning tuỳ policy. |
| FCM/APNs | UC-13 push: backlog TECHSPEC; pilot chỉ in-app. |
| Runbook một trang | Xuất file nội bộ: URL API, khóa, UUID pilot, 3 employeeId mẫu, ngày pilot. |

Phiên bản mục 8: cập nhật ngày **2026-05-12** cùng tài liệu này.
