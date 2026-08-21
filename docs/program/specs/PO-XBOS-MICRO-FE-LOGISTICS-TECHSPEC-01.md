# PO-XBOS-MICRO-FE-LOGISTICS-TECHSPEC-01 — Kiến trúc nhúng Micro-FE Logistics (Iframe Proxy)

| Field | Value |
|-------|--------|
| work_item_id | `PO-XBOS-MICRO-FE-LOGISTICS-TECHSPEC-01` |
| lane | architecture · governance |
| change_mode | Cấu trúc chuẩn hóa |
| date | 2026-08-20 |
| ack_status | **APPROVED** |

---

## 1. Mục tiêu và Context
Hệ thống sử dụng Command Center (XBOS) đóng vai trò là Shell. Các phân hệ vệ tinh (như HRM và sắp tới là Logistics) được nhúng thông qua cơ chế Iframe Proxy.
Mục tiêu của tài liệu này là quy chuẩn cấu hình để triệt để khắc phục lỗi `[vite] Internal server error: Failed to resolve import` và đảm bảo Logistics khi nhúng vào không bị vướng mắc các vấn đề liên quan đến session, proxy, và Vite routing.

## 2. Quy tắc Nhúng Phân hệ Logistics

### 2.1. Cấu hình Vite của Phân hệ Logistics (`apps/web/logistics/vite.config.ts`)
Phân hệ vệ tinh bắt buộc phải thiết lập base path và rule bảo vệ HMR khi proxy:
- **`base`**: Bắt buộc phải là `"/logistics/"` để mọi request JS/CSS tĩnh đều khớp với proxy rule từ Shell.
- **`allowedHosts`**: Bắt buộc phải cho phép Host từ request của proxy portal (VD: `logistics-fe`).
- **`hmr`**: Trên môi trường Docker (khi Host là domain proxy), việc HMR WS kết nối tới localhost sẽ bị refuse. Bắt buộc xử lý biến môi trường để tắt HMR qua flag (ví dụ: `LOGISTICS_VITE_DISABLE_HMR=true`).

### 2.2. Cấu hình Proxy của Shell (`apps/web/web-portal/vite.config.ts`)
Shell định tuyến request UI xuống Vite server của vệ tinh:
- **Proxy rule `/logistics`**: `changeOrigin` bắt buộc phải set là **`false`**. Giữ nguyên Host gốc giúp bảo vệ tính vẹn toàn khi vệ tinh kiểm duyệt allowedHosts.

### 2.3. Logic Nhúng Iframe tại Command Center (`LogisticsWorkspaceRoute.tsx`)
Clone pattern từ `HrmWorkspaceRoute.tsx` cho Logistics:
- **Stable Key**: Thuộc tính `key` của Iframe chỉ dựa trên `tenant + company + scopeRevision`, tuyệt đối **không** dùng location path để làm key (tránh hiện tượng re-mount iframe hàng loạt khi người dùng navigate, gây quá tải API).
- **Soft Navigation (Soft-Nav)**: Sử dụng `postMessage` để push URL path xuống Iframe thay vì thay đổi src, trừ khi cross-origin iframe chưa ready.

### 2.4. Xác thực và Session Mirroring (Login Redirect)
- Ứng dụng vệ tinh không tự render màn Login nếu nó đang chạy ngoài Shell (trừ khi test độc lập).
- Hàm `isLogisticsPortalEmbedFrame()` (kiểm tra `window.top`) được dùng để bắt buộc redirect người dùng sang `/command-center` nếu họ vô tình truy cập trực tiếp URL của vệ tinh mà chưa login.
- Do Iframe (cross-origin hoặc khác port) không thể đọc trực tiếp `sessionStorage` của Shell, Shell phải phát thông điệp (`postMessage`) hoặc mirror Token xuống vùng chứa hợp lệ để Iframe tự đồng bộ quyền truy cập.

---
**Approval Note**: Cấu trúc tuân theo chuẩn Iframe Proxy thay vì Module Federation (Webpack 5) để tận dụng triệt để Vite Dev Server tốc độ cao và đảm bảo độc lập tuyệt đối về runtime (CSS/JS isolate) giữa XBOS và Logistics.
