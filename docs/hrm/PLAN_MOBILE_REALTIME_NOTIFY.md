# Kế hoạch — Thông báo realtime HRM Mobile (Socket.IO, không bắt buộc Expo Push)

## 1. Mục tiêu

- Hai chiều **khi app đang mở**: quản lý thấy đơn công mới; nhân viên thấy phê duyệt/từ chối, **không phụ thuộc** FCM/APNs/Expo Notifications.
- Giữ **một nguồn sự thật** nghiệp vụ: mọi thay đổi vẫn qua REST `hrm-api`; Socket chỉ **phát sự kiện** sau khi ghi DB thành công.
- Xác thực realtime **cùng chuẩn** REST: JWT dịch vụ (`Authorization: Bearer`) hoặc `x-internal-api-key` (dev/pilot), xem `internal-auth.ts`.

## 2. Phạm vi kỹ thuật

| Thành phần | Nội dung |
|---|---|
| Backend | Namespace Socket.IO `/hrm-realtime`, path mặc định `/socket.io/`, sự kiện `hrm:event`, message `hrm:join` |
| Phòng (rooms) | `company:{uuid}` — đơn mới; `company:{uuid}` + `employee:{uuid}` — quyết định duyệt/từ chối |
| Mobile | `socket.io-client`, kết nối cùng `HRM_API_BASE_URL`, `RealtimeProvider`, màn UC-HRM-MOB-13 hiển thị log gần nhất |
| Inbox DB | Bảng `hrm_inbox_notifications`, `GET/PATCH /api/hrm/notifications/inbox*` |
| Webhook | `HRM_EVENT_WEBHOOK_URLS` (comma), `HRM_EVENT_WEBHOOK_SECRET` (HMAC body, optional) |
| Push | Bảng `hrm_push_device_tokens`, `POST /notifications/push-tokens`; Expo HTTP API + FCM qua `firebase-admin` nếu cấu hình |

## 3. Pha triển khai

1. **Docs trước** — cập nhật `BRD_MOBILE.md`, `SRS_MOBILE.md`, `TECHSPEC_MOBILE.md` (UC-13, §7) và tham chiếu `docs/hrm/BRD.md` mục 1.1 (quy tắc giao hàng toàn phân hệ HRM).
2. **BE — gateway** (`HrmRealtimeGateway`, `HrmRealtimeService`, `IoAdapter` trong `main.ts`), đăng ký `AppModule`.
3. **BE — hook nghiệp vụ** (attendance, leave, operations service-requests): emit/fanout sau ghi DB thành công.
4. **Mobile** — client + context + UI thông báo.
5. **BE — fan-out** (`AttendanceEventFanoutService`): sau ghi DB → Socket + inbox + webhook + push (inbox await; webhook/push async).
6. **Kiểm thử** — unit realtime + attendance mock; build/test hrm-api + hrm-mobile.

## 4. Rủi ro và xử lý

| Rủi ro | Cách xử lý |
|---|---|
| App nền / tắt màn hình | REST + pull-to-refresh; push là P1 tuỳ chọn |
| Mất mạng | Socket tự reconnect; UI hiển thị trạng thái `connecting` / `error` |
| Sai phòng | Client chỉ `join` sau `connect` với `companyUuid` + `employeeId` đã lưu phiên |

## 5. Tiêu chí xong

- Tạo đơn công → client đang join `company:*` nhận `attendance_update_request.created`.
- Duyệt/từ chối → nhân viên (room `employee:*`) và quản lý (room `company:*`) nhận sự kiện tương ứng.
- `jest` hrm-api và `vitest` hrm-mobile pass trên CI local.
