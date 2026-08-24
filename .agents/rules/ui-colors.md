# UI Colors Rule
* Tác giả: Sponsor/CEO XeVN
* Ngày: 2026-08-23
* Bối cảnh: "không dùng màu xám cho các thành phần như texbox hay select hay text area hay label trên toàn bộ hệ sinh thái nhé, tôi muốn dùng màu đen để mọi người đều nhìn rõ"

## Nguyên tắc thiết kế (Design Principles)
1. **Màu sắc Textbox/Label**: TẤT CẢ các thành phần form controls bao gồm Label, Textbox (`<input>`), `<select>`, và `<textarea>` trên toàn bộ hệ sinh thái (web-portal, hrm, mobile) BẮT BUỘC sử dụng màu ĐEN (`text-black` hoặc `text-slate-900`) để đảm bảo độ tương phản cao và rõ ràng cho mọi người dùng.
2. **Nghiêm cấm màu xám**: KHÔNG sử dụng màu xám (`text-gray-*`, `text-slate-700`, `text-slate-500`, `text-muted-foreground`) cho các thành phần văn bản nhập liệu chính và nhãn dán.
3. **Đồng bộ hóa**: Bất kỳ component nào được tạo ra hoặc sử dụng lại giữa các app (như DatePicker, GroupedIntegerInput) đều phải được chia sẻ và đồng bộ hóa qua `@xevn/ui` để đảm bảo trải nghiệm thống nhất.
