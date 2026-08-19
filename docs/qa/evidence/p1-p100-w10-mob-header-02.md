# Xác nhận sửa lỗi MOB-HEADER (P1-P100-W10-MOB-HEADER-02)

## 1. Thông tin
- **Work Item ID:** `P1-P100-W10-MOB-HEADER-02`
- **Lỗi ban đầu:** App hiển thị UUID trên Home, nhưng các request gửi đi vẫn dính company slug (như `main`) dẫn đến lỗi 403 ở backend (HRM-AUTH-001).
- **Mô tả Fix:** Cập nhật `apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts` sử dụng hàm `resolveWireCompanyId` (thay vì đọc thẳng `auth.companyUuid`). Việc này giúp đảm bảo legal UUID luôn được lấy đúng từ JWT nếu cache bị thiếu, giúp header `x-company-id` luôn gửi đi đúng legal UUID thay vì bị chặn (blocked) thành chuỗi rỗng do "main slug".

## 2. Các file ảnh hưởng
- `apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts`: Đổi logic lấy `companyHeader`, truyền `wireUuid` thay vì `auth.companyUuid`.

## 3. Trạng thái
- **Trạng thái:** **READY_FOR_QA**
- Code đã được đưa vào. Cần build lại APK để QA test lại luồng J-MOB-02..05.
