# Cập nhật Bổ sung SRS: Thiết kế Cấu trúc Dữ liệu Bảng Lương (Data Source Mapping)

**Phiên bản:** 1.0 (Bản nâng cấp mạnh mẽ dựa trên phản hồi khách hàng XeVN)
**Tài liệu gốc:** `docs/brand-new-documents-20270801/SRS_NEW.md`

## 1. Khái quát (Overview)
Hiện tại cơ chế thiết lập Thành phần lương phụ thuộc vào cơ chế nội suy mã cột (Developer-centric mapping) và cơ chế áp dụng Bảng lương dựa trên bộ lọc ngầm (Implicit Filtering). 
Tài liệu bổ sung này định nghĩa lại 2 tính năng chính để hệ thống chuyển sang mô hình User-centric Mapping (Khai báo tường minh nguồn dữ liệu) nhằm đáp ứng triệt để yêu cầu kiểm soát dữ liệu từ kế toán tiền lương.

## 2. Yêu cầu Chức năng (Functional Requirements)

### FR-PAY-TPL-COMP-01: Định nghĩa Nguồn dữ liệu tường minh tại Mẫu Bảng Lương (Template Data Source Mapping)
- **Mô tả:** Thành phần lương (Salary Component) chỉ đóng vai trò là danh mục (Dictionary). Khi Quản trị viên (HR) cấu hình **Mẫu bảng lương (Salary Template)** và kéo một Thành phần vào Mẫu, họ bắt buộc phải chọn "Nguồn Dữ liệu" (Data Source) và các cờ tính toán (Thuế, BHXH) cho Thành phần đó **trong phạm vi của Mẫu này**.
- **Quy tắc nghiệp vụ (Business Rules):**
  - **BR-PAY-DS-01:** Hệ thống hỗ trợ 5 loại nguồn: Hợp đồng/Hồ sơ nhân sự, Dữ liệu Chấm công (Timesheet), Dữ liệu Nhập liệu ngoài (Input Hub), Công thức tính (Formula), Hằng số mặc định.
  - **BR-PAY-DS-02:** Việc chọn Nguồn dữ liệu sẽ kích hoạt một danh sách thả xuống phụ (Sub-dropdown) để chọn chính xác `source_mapping_key`. 
    - *Ví dụ:* Chọn Nguồn là Hợp đồng -> Phải chọn tiếp trường "Mức lương cơ bản" hay "Phụ cấp chức vụ".
  - **BR-PAY-DS-03:** Cùng một Thành phần lương (VD: Lương cơ bản) có thể có Nguồn dữ liệu hoặc Công thức hoàn toàn khác nhau khi nằm ở hai Mẫu bảng lương khác nhau. Bảng trung gian `SalaryTemplateComponent` sẽ chịu trách nhiệm lưu trữ các thuộc tính cấu hình này (`dataSourceType`, `mappingKey`, `formula`, `isTaxable`, `isSocialInsuranceBase`).

### FR-PAY-TPL-01: Gán Bảng lương đích danh (Explicit Template Assignment)
- **Mô tả:** Cung cấp chức năng Gán trực tiếp Mẫu bảng lương (Template) cho từng nhân viên (Employee).
- **Quy tắc nghiệp vụ (Business Rules):**
  - **BR-PAY-ASG-01:** Cho phép gán bằng cách chọn đích danh từ danh sách nhân viên thay vì chỉ dùng điều kiện lọc (Phòng ban/Vị trí) như trước.
  - **BR-PAY-ASG-02:** Một nhân viên (Employee ID) có thể tồn tại ở nhiều Mẫu bảng lương có hiệu lực (Effective From - To) trùng nhau.
  - **BR-PAY-ASG-03:** Khi chạy bảng lương, hệ thống truy vấn bảng `pay_employee_templates` để đưa nhân viên vào đúng lô tính toán (Batch). Nếu 1 nhân viên thuộc 2 bảng, họ sẽ xuất hiện 2 lần ở 2 lô khác nhau hoặc 2 dòng kết quả khác nhau.

## 3. Ca sử dụng (Use Cases)

### UC-PAY-01: Cấu hình nguồn lấy lương cơ bản
- **Actor:** HR Admin / Kế toán lương
- **Precondition:** Có quyền truy cập Cài đặt Thành phần lương.
- **Main Flow:**
  1. HR tạo thành phần lương mã `L_CB` (Lương cơ bản).
  2. Chọn Nguồn dữ liệu: `Hồ sơ Hợp đồng`.
  3. Chọn Trường ánh xạ: `salary_base` (Lương cơ bản trên Hợp đồng).
  4. Lưu lại.
- **Postcondition:** Bất cứ khi nào thành phần `L_CB` được gọi trong Mẫu Bảng Lương, lõi tính lương sẽ tự động truy vấn giá trị của trường `salary_base` trong `contracts` tương ứng với nhân viên.

### UC-PAY-02: Gán nhân viên kiêm nhiệm vào 2 Bảng lương
- **Actor:** HR Admin / Kế toán lương
- **Main Flow:**
  1. HR vào màn hình Gán Bảng Lương.
  2. Chọn nhân viên Nguyễn Văn A (Nhân viên văn phòng kiêm Lái xe cuối tuần).
  3. Gán Mẫu "Bảng Lương Văn Phòng" (Hiệu lực: 01/2026 - không thời hạn).
  4. Gán tiếp Mẫu "Bảng Lương Lái Xe Khoán" (Hiệu lực: 01/2026 - không thời hạn).
  5. Khi tạo Kỳ lương tháng 1/2026 cho 2 Mẫu trên, Nguyễn Văn A đều xuất hiện và được tính đúng theo công thức của từng bảng.
