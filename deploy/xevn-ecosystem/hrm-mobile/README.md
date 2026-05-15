# hrm-mobile — ứng dụng Expo (HRM)

- **Code:** `apps/mobile/hrm-mobile`
- **Docker:** **không** có container trong `docker-compose.yml` ở đây (mobile chạy trên thiết bị / emulator).
- **Kết nối API:** trỏ `EXPO_PUBLIC_HRM_API_BASE_URL` (hoặc tương đương trong `.env` của app) tới HRM API trên host, ví dụ `http://<IP-VPS>:28001` nếu dùng mặc định `HRM_BE_PORT=28001` (thay IP và cổng theo `.env` thực tế).

Xem thêm `apps/mobile/hrm-mobile/README.md`.
