# API CONTRACT: Thiết lập Payroll & Danh mục

## 1. Bối cảnh & Mục đích
- **WorkItem:** Chuẩn hóa giao thức dữ liệu trả về giữa Frontend và Backend cho khối Setting/Payroll.
- **Lý do:** Tránh lỗi bất đồng bộ (VD: Backend trả về chỉ có {success:true} nhưng lõi hrmApi.ts của FE lại đi tìm trường data và văng lỗi 'HRM-NO-DATA', khiến flow UI bị gãy đổ).

## 2. Quy tắc bắt buộc (Mandatory Rules)

### 2.1. GET Requests (Lấy dữ liệu)
- Backend PHẢI trả về theo cấu trúc HrmEnvelope chứa trường \data\.
- FE nhận diện và parse trường \data\ để render danh sách / đối tượng.
- Trong một số trường hợp, nếu BE trả về thẳng Array \[...]\ thì \hrmApi.ts\ phải có cơ chế bypass đọc trực tiếp Array đó thay vì báo lỗi thiếu property \data\.

### 2.2. POST, PATCH, DELETE Requests (Thao tác thay đổi)
- Với các hành động như Create (Tạo ngạch), Update (Sửa ngạch), Archive/Delete (Xóa ngạch), Backend CHỈ CẦN trả về: \{ success: true }\ (HTTP 200/201).
- Tuyệt đối không bắt buộc phải có payload \data\ (trừ khi cần trả về ID của record vừa tạo, khi đó \data\ sẽ chứa ID/Object).
- Lõi \hrmApi.ts\ ở Frontend ĐƯỢC CẤM quăng lỗi \HRM-NO-DATA\ nếu method gọi là POST/PATCH/DELETE và nhận được \success: true\ (tức là giao dịch đã hoàn tất phía DB).

## 3. Khóa trạng thái (Spec Lock)
Mọi Sub-Agent và Developer khi code API Controller ở NestJS, và React Query Mutation ở React, phải tuân thủ tuyệt đối chuẩn này. Nếu vi phạm, Unit Test và System Audit sẽ đánh dấu Fail.