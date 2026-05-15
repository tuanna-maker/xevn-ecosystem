# XeVN HRM Mobile

Ứng dụng di động **React Native + Expo** theo `docs/hrm/TECHSPEC_MOBILE.md` và `docs/hrm/SRS_MOBILE.md`.

## Build APK (mặc định: local, Android Studio)

Xem **`LOCAL_ANDROID_BUILD.md`**: `pnpm run android:link-plugin` rồi mở thư mục `android` trong Android Studio, hoặc `pnpm run android:apk`.

Expo / EAS cloud chỉ là phương án tuỳ chọn — `EXPO_BUILD_CHECKLIST.md`.

## Biến môi trường

| Biến | Mô tả |
|---|---|
| `EXPO_PUBLIC_HRM_API_BASE_URL` | Gốc HTTP của `hrm-api`, **không** kèm `/api/hrm` (ví dụ `http://192.168.1.10:3001`) |

## Chạy local

```bash
pnpm install
pnpm --filter hrm-mobile start
```

## Build / kiểm tra tĩnh

```bash
pnpm --filter hrm-mobile run build
pnpm --filter hrm-mobile run test
```

## Phạm vi công ty (UC-02)

Sau đăng nhập, mở **Thêm → Phạm vi công ty** (`ScopeScreen`) hoặc **Cài đặt** để chỉnh `tenantId`, `companyId` header, UUID chấm công/lương, `employeeId`.

## Pilot XeVN & Docker API

- Checklist pilot: `docs/hrm/PLAN_HRM_MOBILE_IMPLEMENTATION.md` mục **§8**.
- Chạy `hrm-be` bằng Docker (dev): từ `deploy/xevn-ecosystem`, tạo `apps/api/hrm-api/.env` rồi `docker compose up hrm-be` (xem `docker-compose.yml`).

## Đăng nhập dev

1. Chạy `hrm-api` (ví dụ cổng 3001).
2. Tạo JWT nội bộ HS256 (issuer/audience/secret khớp `apps/api/hrm-api`) hoặc dùng `x-internal-api-key` khi `NODE_ENV !== production`.
3. Nhập `tenantId`, `companyId` (header, ví dụ `holding`), và **UUID công ty** riêng cho các endpoint chấm công/lương/tasks nếu DB dùng UUID (xem `docs/hrm/PLAN_HRM_MOBILE_IMPLEMENTATION.md`).

## Kế hoạch chi tiết

Xem `docs/hrm/PLAN_HRM_MOBILE_IMPLEMENTATION.md`.
