# TechSpec Ứng Dụng Di Động HRM (HRM Mobile)

## 1. Mục Tiêu Kỹ Thuật

Chuẩn hóa triển khai **HRM Mobile** theo baseline toàn hệ XeVN: cùng **hợp đồng API** và nguyên tắc bảo mật/phạm vi với `hrm-api`, tách biệt rõ **lớp client** (mạng, cache, push) khỏi **lớp nghiệp vụ** (server).

### 1.1 Quy tắc giao hàng (bắt buộc)

Đồng bộ với `docs/hrm/BRD.md` mục 1.1 và `docs/hrm/BRD_MOBILE.md` mục 1.1: **TechSpec/SRS mobile cập nhật trước hoặc cùng** thay đổi hành vi trong `apps/mobile/hrm-mobile`.

## 2. Tham Chiếu Tài Liệu

| Tài liệu | Vai trò |
|---|---|
| `docs/hrm/BRD_MOBILE.md` | Phạm vi nghiệp vụ và giai đoạn P0/P1/P2 |
| `docs/hrm/PLAN_MOBILE_REALTIME_NOTIFY.md` | Pilot Socket.IO realtime (UC-13) |
| `docs/hrm/SRS_MOBILE.md` | Use case, mã lỗi, luồng if/else |
| `docs/hrm/TECHSPEC.md` | Chuẩn HRM chung (envelope, stack BE/FE web) |
| `docs/ecosystem/TECHSPEC.md` | Chuẩn multi-tenant, scope, auth toàn hệ |

## 3. Stack Công Nghệ Đề Xuất

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Ứng dụng di động | **React Native** + **TypeScript** + **Expo** (định hướng mặc định) | Đồng nhất hệ sinh thái với React (web); khởi tạo tại `apps/mobile/hrm-mobile` khi bootstrap |
| Gọi API | `fetch` hoặc thư viện HTTP có timeout/cancel | Bắt buộc timeout mặc định (ví dụ 30s) có thể cấu hình |
| Realtime (tuỳ năng lực pilot) | **socket.io-client** tới namespace `/hrm-realtime` trên cùng `HRM_API_BASE_URL` | Không đi qua tiền tố HTTP `/api/hrm`; xác thực handshake giống REST (`auth.authorization` hoặc `auth.internalApiKey`) |
| Lưu token | **expo-secure-store** (Expo) hoặc **Keychain / Keystore** (native) | Không dùng `AsyncStorage` cho refresh token |
| i18n | Cùng nguyên tắc web: **mặc định tiếng Việt** | Tệp locale tách module |

Nếu dự án sau này chọn Flutter, cần sửa TechSpec này bằng phiên bản mới và cập nhật ma trận rủi ro (không tự động trong phạm vi 1.0).

## 4. Kiến Trúc Thành Phần

### 4.1 Cấu trúc thư mục (mục tiêu)

```
apps/mobile/hrm-mobile/
  src/
    app/                 # điều hướng, shell, deep link
    features/            # theo domain: attendance, payroll, ...
    integrations/        # client HRM API, interceptors, mapping lỗi
    components/          # UI dùng chung
    i18n/
```

Tham chiếu placeholder: `apps/mobile/README.md`.

### 4.2 Lớp tích hợp API (`integrations`)

- Một **HTTP client** duy nhất cấu hình:
  - `baseUrl` từ biến môi trường build (ví dụ `HRM_API_BASE_URL`),
  - header `Authorization`,
  - header phạm vi `x-tenant-id` / `x-company-id` (đúng contract BE hiện hành — đồng bộ với web),
  - giá trị gợi ý ban đầu trên form đăng nhập từ biến build **`EXPO_PUBLIC_DEFAULT_TENANT_ID`** / **`EXPO_PUBLIC_DEFAULT_COMPANY_ID`** (xem `apps/mobile/hrm-mobile/.env.example` và `src/config/tenantDefaults.ts`) — **không** thay thế SecureStore/phiên; không hardcode slug tenant trong mã nguồn,
  - header `x-request-id` sinh UUID mỗi request,
  - xử lý envelope `success` / `code` / `message` theo `docs/hrm/TECHSPEC.md`.
- Mapper lỗi:
  - HTTP + `code` từ body -> hiển thị người dùng,
  - lỗi mạng -> `HRM-MOB-ERR-NETWORK` (`docs/hrm/SRS_MOBILE.md`).
- **Hộp thư & push:** `GET /api/hrm/notifications/inbox`, `PATCH .../inbox/:id/read`, `POST /api/hrm/notifications/push-tokens` — cùng header auth với các endpoint nghiệp vụ khác.

### 4.3 Tách “feature flags” theo quyền

- Menu và nút hành động được quyết định từ **quyền thực tế** (claims hoặc kết quả probe API), không hardcode theo job title chuỗi tự do.

## 5. Bảo Mật Và Tuân Thủ

### 5.1 Vận tải và chứng chỉ

- Chỉ **HTTPS** cho môi trường thật; chặn trust user CA trên build production (theo policy cửa hàng ứng dụng).

### 5.2 Phiên và làm mới token

- Access token ngắn hạn; refresh token trong secure storage.
- If refresh thất bại -> xoá state và buộc UC-HRM-MOB-01.

### 5.3 Thu hồi từ xa

- Nếu `hrm-api` cung cấp endpoint revoke/session invalidate trong tương lai, mobile phải gọi tại UC-HRM-MOB-15; nếu chưa có, fallback xoá cục bộ và ghi log vận hành.

### 5.4 Tham chiếu toàn hệ

- Hai chế độ *chưa đăng nhập / system admin* và *đã đăng nhập / một tenant* — **bắt buộc** tuân `docs/ecosystem/TECHSPEC.md`. Mobile **mặc định** chỉ hỗ trợ **đã đăng nhập**; không triển khai chế độ system admin trên thiết bị cá nhân.

## 6. Hiệu Năng Và Độ Tin Cậy

- **Retry có điều kiện**: chỉ với lỗi mạng tạm thời và GET idempotent; không tự retry POST trừ khi API hỗ trợ idempotency key (tương lai).
- **Hủy request** khi unmount màn hình để tránh race.
- **Pagination**: mọi danh sách dài dùng cursor/page theo contract BE.

## 7. Deep Link Và Thông Báo

### 7.1 Deep link

- Schema đề xuất: `xevn://hrm/{feature}/{id?}` (cần thống nhất với portal); map sang màn hình nội bộ.
- If app chưa cài -> mở cửa hàng hoặc trang landing theo policy marketing.

### 7.2 Realtime in-app (P0 pilot)

- **Socket.IO** trên `hrm-api`: namespace `/hrm-realtime`, path mặc định `/socket.io/`, sự kiện server → client `hrm:event`, client → server `hrm:join` với `{ companyUuid, employeeId? }`.
- Phòng: `company:{uuid}` (đơn công mới cho quản lý), `employee:{uuid}` + `company:{uuid}` khi phát sự kiện duyệt/từ chối.
- **Không thay thế** REST: client vẫn dùng `GET` để hiển thị nguồn sự thật; socket chỉ kích hoạt làm mới UI.

### 7.3 Push nền (P1, tuỳ chọn)

- FCM (Android) / APNs (iOS); token đăng ký lưu an toàn phía backend (endpoint riêng ngoài phạm vi `hrm-api` lõi nếu cần — ghi rõ trong backlog). **Không bắt buộc** dùng Expo Push; có thể triển khai native hoặc dịch vụ trung gian sau.

## 8. Ngoại Tuyến (P2)

- SQLite hoặc MMKV chỉ cho **read model** đã đồng bộ; TTL và kích thước tối đa.
- Banner “chỉ xem” luôn hiển thị khi dữ liệu từ cache.

## 9. Kiểm Thử Kỹ Thuật

| Loại | Nội dung |
|---|---|
| Unit | Mapper lỗi, reducer phạm vi công ty, util format ngày giờ |
| Integration (mock server) | Đường đi API chính attendance/employees |
| E2E (thiết bị / simulator) | Luồng P0: login → check-in → tạo đơn |
| Bảo mật | Không lộ token trong log; screenshot policy màn nhạy cảm |

## 10. CI/CD và Biến Môi Trường

| Biến | Mô tả |
|---|---|
| `HRM_API_BASE_URL` | Gốc API, ví dụ `https://api.example.com` (không nối path `/api/hrm` hai lần nếu client đã cố định) |
| `HRM_MOBILE_ENV` | `development` / `staging` / `production` |
| `HRM_EVENT_WEBHOOK_URLS` | (hrm-api) Danh sách URL webhook, phân tách dấu phẩy; POST JSON `{ source, envelope }` |
| `HRM_EVENT_WEBHOOK_SECRET` | (hrm-api) Tuỳ chọn: HMAC-SHA256 hex của body, header `X-HRM-Signature=sha256=...` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | (hrm-api) Chuỗi JSON service account để gửi FCM (`platform: fcm`) |
| `EXPO_ACCESS_TOKEN` | (hrm-api) Bearer Expo cho `exp.host` push (khuyến nghị production) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | (mobile) EAS project UUID khi cần `getExpoPushTokenAsync` |

- Pipeline tối thiểu: **lint**, **typecheck**, **unit test**, build **preview** (EAS hoặc tương đương).

## 11. Lộ Trình Triển Khai Kỹ Thuật

1. Khởi tạo `apps/mobile/hrm-mobile` + client API + đăng nhập + health.
2. Hoàn thiện P0: attendance self-service + đơn + dashboard read.
3. Bật P1: manager approval, payroll summary, operations, profile/metadata.
4. P2: offline read, push nền đầy đủ (FCM/APNs, có thể không qua Expo), idempotency ghi nếu BE hỗ trợ.

## 12. Ràng Buộc Tương Thích Với BE Hiện Tại

- Tiền tố toàn cục NestJS cho **HTTP**: `api/hrm` (xem `apps/api/hrm-api/src/main.ts`). **WebSocket** Socket.IO **không** nằm dưới tiền tố đó; client nối tới `{HRM_API_BASE_URL}/hrm-realtime`.
- Mọi thay đổi contract trong `apps/api/hrm-api` phải được phản ánh trong `integrations` và cập nhật `docs/hrm/SRS_MOBILE.md` mục 2–3.

## 13. Tiêu Chí Xong Kỹ Thuật (Definition of Done — Mobile)

- Client tuân envelope và mã lỗi trong `docs/hrm/TECHSPEC.md` + mã client trong `docs/hrm/SRS_MOBILE.md`.
- Không chứa secret cứng trong mã nguồn; dùng biến môi trường build và kho an toàn thiết bị.
- Có `README.md` trong `apps/mobile/hrm-mobile` mô tả chạy local và nối API dev.
