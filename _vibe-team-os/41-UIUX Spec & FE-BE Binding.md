# 27 — UI/UX Spec & FE-BE Binding (SoT cho Agent & Dev-FE)

**Mục đích:** Tài liệu này thiết lập luật chơi cho Frontend Developer và các AI Agents (Cursor, Claude, Lovable...). Nó định nghĩa cách BA mô tả UI trên SRS, cách FE bind API vào Form/Nút, phân định Validation, và ép buộc tính tái sử dụng (DRY/SOLID) để chống duplicate code.
**Liên kết:** `25-SOLID-AND-CODING-CONVENTION.md` · `28-FE-BE-SEPARATION-DISPLAY-READY.md`

---

## 1. Tiêu chuẩn BA Mô tả UI/UX trên SRS

BA không cần vẽ pixel-perfect Figma, nhưng **BẮT BUỘC** phải mô tả hành vi dữ liệu của UI trong SRS để Agent không phải đoán.

| Thành phần UI | Cấm mô tả hời hợt | Mô tả Chuẩn (Phải ghi rõ) |
| :--- | :--- | :--- |
| **Select / Dropdown** | "Chọn phòng ban" | "Dropdown 'Phòng ban': Call API lấy danh sách phòng ban đang active. Gõ để search (Async)." |
| **Bảng (Table)** | "Hiển thị danh sách" | "Bảng 5 cột (Mã, Tên, Số tiền, Trạng thái, Hành động). Có phân trang (Pagination). Click 1 dòng mở Popup chi tiết." |
| **Nút bấm (Button)** | "Nút Lưu" | "Nút 'Lưu': Gọi API POST `/invoices`. Disable nút nếu form chưa điền đủ field bắt buộc." |

---

## 2. Bản đồ Binding: Form/Nút ↔ API (Chống Agent tự đoán)

Trước khi Agent hoặc Dev-FE gõ code một màn hình, phải có một bản đồ mapping rõ ràng (nằm ở TechSpec UI hoặc mô tả Task). **Cấm Agent tự suy diễn endpoint.**

**Mẫu Mapping bắt buộc:**
- **Khu vực:** Form Tạo Hóa Đơn (Create Invoice Modal)
- **Nút Trigger:** "Xác nhận tạo"
- **Gọi API:** `POST /api/v1/invoices`
- **Input (Payload):** Lấy từ Zod Form (customerId, amount, items[]).
- **Phản hồi (On Success):** Đóng popup, invalidate query để load lại bảng danh sách, hiện Toast xanh "Tạo thành công".

---

## 3. Quyền tự chủ Tối ưu UX (UX Refactoring Autonomy)

Dù UI cũ đã có sẵn (do team cũ code hoặc render từ Lovable), Dev-FE và Agent **CÓ QUYỀN VÀ NGHĨA VỤ** tự động tối ưu lại layout nếu UX hiện tại đang gây ức chế, miễn là bám sát nghiệp vụ.

*   **Tình huống (Case Study):** Form nhập thông tin có 15 trường, nhưng đang bị nhét vào một cái Popup/Modal quá nhỏ, khiến người dùng phải scroll chuột liên tục bên trong rất khó chịu.
*   **Quy tắc xử lý (Agent Action):** 
    1. Chủ động mở rộng kích thước Popup (vd: `max-w-4xl` hoặc `full-screen modal`).
    2. Tự động chia lại Grid layout (chia thành 2-3 cột đối xứng thay vì 1 cột dọc).
    3. Phân nhóm các trường thông tin bằng Divider hoặc các Section (vd: Thông tin chung, Chi tiết thanh toán) sao cho đúng chuẩn thẩm mỹ và logic.
*   **Nguyên tắc:** UI sinh ra phải phục vụ sự thoải mái của user. Thấy UI cũ "chật chội" là phải tự tái cấu trúc ngay mà không cần chờ nhắc.

---

## 4. Phân định ranh giới Validation (FE vs BE vs Cả 2)

Để tránh cãi nhau xem lỗi do ai bắt, quy định Validation như sau:

| Loại Validation | Thằng nào làm? | Ví dụ chi tiết |
| :--- | :--- | :--- |
| **Định dạng (Format) & UX sớm** | **Chỉ FE làm** | Rỗng/Bắt buộc (Required), Max length, định dạng Email, Số điện thoại. FE dùng Zod bọc Form lại. Nút Submit bị mờ (disabled) nếu Zod báo lỗi. |
| **Ràng buộc Dữ liệu (Integrity)** | **CẢ FE VÀ BE** | FE giới hạn ngày kết thúc phải sau ngày bắt đầu để UX mượt. BE **BẮT BUỘC** check lại logic này ở tầng Controller/DTO để chống bypass API[cite: 1, 3]. |
| **Quy tắc Nghiệp vụ (Business Rule)** | **Chỉ BE làm** | Số dư tài khoản không đủ, Lô thuốc đã hết hạn, Tài khoản không có quyền duyệt ca này. FE **TUYỆT ĐỐI KHÔNG** tự tính toán mà chỉ chờ API BE ném mã lỗi ra để show Toast[cite: 4]. |

---

## 5. Kỷ luật SOLID & Chống Duplicate Code (DRY)

Con bệnh nặng nhất của AI là lười đọc code cũ và thích tạo file mới. Đây là chốt chặn vật lý.

**Ví dụ thực tế:** Dự án có tính năng "Xem chi tiết Hóa đơn (Invoice)". Tính năng này được gọi ở màn "Danh sách Hóa đơn", màn "Lịch sử khách hàng", và màn "Báo cáo".
*   **CẤM:** Tuyệt đối cấm Agent/Dev tạo ra 3 file giao diện: `InvoiceDetailList.tsx`, `InvoiceCustomer.tsx`, `InvoiceReport.tsx`.
*   **BẮT BUỘC (DRY):** Phải tạo một component gốc duy nhất: `@/components/features/invoices/InvoiceDetailModal.tsx`. 
*   **Thực thi (DIP - Dependency Inversion):** Component này nhận dữ liệu qua `props` (như `invoiceId`). Khi gọi từ các màn hình khác nhau, chỉ import đúng component này vào dùng.

**Nếu BE cũng vậy:** Hàm `generateInvoicePDF` phải nằm ở một Shared Service, các Controller khác nhau chỉ inject Service đó vào để dùng[cite: 1, 3]. 

> **Reject Gate:** Nếu Code Review thấy Agent đẻ ra một component mới tinh để xử lý một UI đã tồn tại ở chức năng khác -> **REJECT**, bắt refactor gom về 1 component dùng chung.

---

## 6. Lệnh cấu hình cho Multi-Agent (Cursor / Claude / Lovable)

Khi cấp quyền cho Agent code giao diện, PM/Lead phải chèn thêm đoạn prompt này vào System Prompt (hoặc `.cursorrules`):

```yaml
ui_ux_agent_rules:
  - "NEVER guess API endpoints. Map every form/button explicitly to the provided TechSpec API Contract."
  - "UX Autonomy: If you detect poor UI layout (e.g., cramped modals, excessive scrolling for forms), you MUST proactively refactor the CSS/Layout (e.g., widen the modal, use multi-column grids) to improve user comfort, while maintaining standard design tokens."
  - "DRY Enforcement: Before building a UI component (like an Invoice view), search the `@/components/` and `@/features/` directories. Reuse existing components via Props. DO NOT duplicate files."
  - "Validation: Implement Zod schema strictly for Client-side fast feedback, but NEVER hardcode Business Rules on the frontend[cite: 4]."