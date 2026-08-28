# Technical Specification: Payroll Data Source Mapping & Template Assignment

**Version:** 1.0
**Đối tượng:** Backend (NestJS), Frontend (React/Zod)

## 1. Thay đổi Database Schema

### 1.1 Bảng `pay_salary_components`
Thêm các cột mới để định nghĩa Data Source Mapping.

| Column Name | Data Type | Nullable | Description |
|-------------|-----------|----------|-------------|
| `data_source_type` | `VARCHAR(50)` | No | Enum Nguồn dữ liệu: `SYSTEM_CONTRACT`, `TIMESHEET`, `INPUT_HUB`, `FORMULA`, `CONSTANT`. Mặc định `FORMULA`. |
| `source_mapping_key` | `VARCHAR(100)`| Yes | Khóa ánh xạ. Bắt buộc nếu `data_source_type` khác `FORMULA` và `CONSTANT`. (VD: `base_salary`, `actual_working_days`). |

### 1.2 Bảng mới `pay_employee_templates` (Gán nhân viên vào Mẫu lương)
Bảng trung gian để map Nhân viên (Employee) với Mẫu bảng lương (Salary Template).

| Column Name | Data Type | Nullable | Description |
|-------------|-----------|----------|-------------|
| `id` | `UUID` / `Int` | No | Primary Key |
| `employee_id` | `UUID` | No | Khóa ngoại tới bảng `employees` |
| `template_id` | `UUID` | No | Khóa ngoại tới bảng `pay_salary_templates` |
| `effective_from` | `DATE` | No | Ngày bắt đầu áp dụng mẫu lương này |
| `effective_to` | `DATE` | Yes | Ngày kết thúc áp dụng (Null = vô thời hạn) |
| `created_at` | `TIMESTAMP` | No | |

## 2. Logic Xử lý (Backend Processor)

### Sửa đổi `payroll-processor.service.ts`
Trong hàm `calculateBatch(...)`, bước chuẩn bị `inputBag` cho từng nhân viên sẽ thay đổi logic ưu tiên:
1. Quét toàn bộ `pay_salary_components` đang có mặt trong Mẫu bảng lương.
2. Nếu Component có `data_source_type === 'SYSTEM_CONTRACT'`:
   - Tìm giá trị trong object `employee.contract[component.source_mapping_key]`.
   - Gán vào `inputBag[component.code]`.
3. Nếu Component có `data_source_type === 'TIMESHEET'`:
   - Tìm giá trị trong `employee.attendance[component.source_mapping_key]`.
   - Gán vào `inputBag[component.code]`.
4. Với `data_source_type === 'FORMULA'`: Bỏ qua bước nạp Input, để cho `FormulaCalculator` tự xử lý bằng cách đọc công thức từ `TemplateComponent` ghi đè (Override).

## 3. Frontend Validation (Zod Schema)

### Sửa đổi `salaryComponentFormSchema.ts`
Thêm Rule Zod:
```typescript
const dataSchema = z.object({
  // ... (cũ)
  dataSourceType: z.enum(['SYSTEM_CONTRACT', 'TIMESHEET', 'INPUT_HUB', 'FORMULA', 'CONSTANT']),
  sourceMappingKey: z.string().optional(),
}).superRefine((data, ctx) => {
  if (['SYSTEM_CONTRACT', 'TIMESHEET', 'INPUT_HUB'].includes(data.dataSourceType) && !data.sourceMappingKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng chọn trường ánh xạ nguồn dữ liệu',
      path: ['sourceMappingKey'],
    });
  }
});
```
