# Hướng dẫn Tích hợp Backend NestJS API cho Module HRM

Hệ thống UI hiện tại đã được cấu trúc hoàn thiện để tự động map dữ liệu trả về từ các Endpoint REST API. Việc gọi API được trừu tượng hoá thông qua lớp `hrmDataProvider`. 

Để kích hoạt chế độ gọi API NestJS, bạn chỉ cần sửa đổi file `.env.local` của project frontend.

---

## 1. Cấu hình Biến môi trường (.env.local)

Trong frontend (`apps/web-portal/.env.local`), thêm hai dòng sau để kích hoạt chế độ **REST API**:

```env
VITE_HRM_API_MODE=rest
VITE_HRM_API_BASE_URL=http://localhost:3000/api/hrm  # Thay bằng URL thực tế của NestJS server
```

Khi `VITE_HRM_API_MODE=rest`, các module (Nhân viên, Hợp đồng, Quyết định, Bảo hiểm) sẽ tự động ngắt kết nối với Mock Data / Supabase Direct và gửi request HTTP (`fetch`) đến URL đã cấu hình.

---

## 2. Các Endpoints Backend NestJS cần cung cấp

Dưới đây là danh sách các Endpoint mà Frontend đang request đến. Tên trường (Key) trả về trong cục JSON cần khớp với Data Model để Component Table tự động hiển thị mà không bị lỗi.

Tất cả các endpoints GET list đều tự động truyền 2 Query Parameters:
- `?companyId=<uuid>` (nếu có chọn lọc công ty trên header)
- `?limit=200`

### 2.1. Module Nhân sự (Employees)

**`GET /employees`**
- **Mô tả:** Lấy danh sách nhân sự.
- **Dữ liệu trả về mong đợi (Mảng các Object):**
  ```json
  [
    {
      "id": "uuid",
      "company_id": "uuid",
      "employee_code": "NV-10023",
      "full_name": "Nguyễn Minh Tuấn",
      "email": "tuan.nm@congty.com",
      "phone": "0987654321",
      "position": "Trưởng phòng",
      "department": "Khối Công nghệ",
      "status": "active", // Hoặc: 'inactive', 'on-leave', 'terminated'
      "start_date": "2024-02-01",
      "salary": 15000000,
      "avatar_url": "https://..."
      // ... (và các trường phụ như gender, birth_date, v.v...)
    }
  ]
  ```

**`GET /employees/:id`**
- **Mô tả:** Lấy thông tin chi tiết của 1 nhân sự khi bấm vào "Xem hồ sơ".
- **Dữ liệu trả về:** Object như trên nhưng là bản ghi duy nhất.

**`POST /employees`** & **`PATCH /employees/:id`** & **`DELETE /employees/:id`**
- Xử lý tương ứng Thêm mới, Cập nhật, Xóa nhân sự.

---

### 2.2. Module Hợp đồng (Contracts)

**`GET /employee-contracts`**
- **Mô tả:** Lấy danh sách hợp đồng.
- **Dữ liệu trả về mong đợi:**
  ```json
  [
    {
      "id": "uuid",
      "employee_name": "Nguyễn Minh Tuấn",
      "employee_code": "NV-10023",
      "contract_type": "Không xác định thời hạn",
      "department_name": "Khối Công nghệ", // Hoặc key 'department'
      "status": "active", // Hoặc 'expired', 'draft'
      "effective_date": "2024-02-01",
      "expiry_date": null
    }
  ]
  ```

---

### 2.3. Module Bảo hiểm (Insurance)

**`GET /insurance`**
- **Mô tả:** Lấy thông tin sổ bảo hiểm.
- **Dữ liệu trả về mong đợi:**
  ```json
  [
    {
      "id": "uuid",
      "employee_name": "Nguyễn Minh Tuấn",
      "employee_code": "NV-10023",
      "department_name": "Khối Công nghệ", // Hoặc key 'department'
      "bhxh_number": "BHXH-88421", // Hoặc key 'insurance_number'
      "bhyt_number": "BHYT-88421",
      "salary_base": 15000000,     // Hoặc key 'amount'
      "status": "Đang hiệu lực",
      "effective_date": "2024-02-01"
    }
  ]
  ```

---

### 2.4. Module Quyết định (HR Decisions)

**`GET /hr-decisions`**
- **Mô tả:** Lấy danh sách các quyết định (Bổ nhiệm, Kỷ luật, Thăng chức...).
- **Dữ liệu trả về mong đợi:**
  ```json
  [
    {
      "id": "uuid",
      "decision_number": "QĐ-HCNS-2026-08", // Hoặc key 'number'
      "decision_date": "2026-03-18",         // Hoặc key 'date'
      "decision_type": "Bổ nhiệm",           // Hoặc key 'kind'
      "title": "Bổ nhiệm Trưởng chi nhánh",  // Hoặc key 'subject'
      "employee_name": "Nguyễn Minh Tuấn",
      "employee_id": "NV-10023",
      "department": "Chi nhánh Đà Nẵng",
      "position": "Trưởng chi nhánh",
      "effective_date": "2026-04-01",
      "expiry_date": "2029-03-31",
      "signer_name": "Trần Văn Long",
      "signer_position": "Tổng Giám đốc",
      "signing_date": "2026-03-18",
      "status": "Đã ban hành",
      "content": "Nội dung chi tiết quyết định...",
      "note": "Ghi chú thêm..."
    }
  ]
  ```

---

## 3. Upload File (Xử lý Đính kèm)

Trên Frontend, chức năng kéo thả Upload File (ở màn Quyết định và Hợp đồng) đã được thiết kế sẵn.
Vì Backend sử dụng NestJS:

1. **Upload File riêng biệt:** NestJS cần cung cấp 1 endpoint (VD: `POST /api/hrm/upload`) sử dụng `Multer`. Frontend sẽ dùng `FormData` đính kèm các file vào body và POST lên endpoint này.
2. **Lưu File:** Sau khi NestJS lưu file thành công (vào ổ cứng, S3, hoặc MinIO), nó sẽ trả về danh sách URL (hoặc File ID). Frontend sẽ đưa mảng URL/ID này vào payload JSON gửi tới Endpoint `POST /hr-decisions` hoặc `POST /employee-contracts`.

---

## 4. Xử lý Lỗi và Fallback

Nếu NestJS API chưa sẵn sàng, bị lỗi mạng, hoặc trả về lỗi 500, Frontend hiện tại đang được bọc try/catch và sẽ tự động fallback về **Hiển thị Mock Data** để End-User vẫn xem được giao diện demo (tránh tình trạng bị lỗi trắng màn hình).

Sau khi API của bạn chạy ổn định 100%, bạn có thể xoá các đoạn fallback Mock Data trong các Component (bên trong block `catch (err) { ... }`) để hiển thị thông báo lỗi tường minh cho người dùng.
