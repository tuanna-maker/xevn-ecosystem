# Rule: Chuẩn hóa Form Input Ngày tháng (ViDatePickerField)

Khi người dùng yêu cầu tạo hoặc sửa một màn hình/form có các trường nhập ngày tháng (Date/Time), bạn **TUYỆT ĐỐI KHÔNG** được sử dụng các thẻ HTML cơ bản như `<Input type="date" />` hay `<input type="date">`. 

Bạn cũng **KHÔNG NÊN** dùng `<ViDateField />` nếu nghiệp vụ cần người dùng bấm chọn lịch.

Thay vào đó, **BẮT BUỘC** phải dùng component chuẩn của XeVN:
`import { ViDatePickerField } from "@/components/ui/ViDatePickerField";`

**Lý do:** Đảm bảo chuẩn format ngày tháng vi-VN (`dd/MM/yyyy`) và hiển thị popup lịch Calendar (DatePicker) đồng nhất, đúng chuẩn UI/UX của hệ thống (tham chiếu màn hình Tuyển dụng).
