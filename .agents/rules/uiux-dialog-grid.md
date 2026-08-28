# Rule: Tối ưu không gian Dialog Form (Grid Layout)

Khi thiết kế hoặc refactor các form nhập liệu bên trong Dialog/Modal/Card:
1. **BẮT BUỘC** sử dụng `grid grid-cols-2 gap-4` (hoặc tương tự) làm container bọc ngoài form.
2. Gom nhóm các input có nội dung ngắn gọn (ví dụ: Trạng thái, Loại, Mã, Ngày tháng, Cách tính, Số lượng) để chúng hiển thị song song (mỗi field chiếm 1 cột).
3. **CHỈ SỬ DỤNG** full-width (`col-span-2` hoặc `col-span-full`) cho các trường dữ liệu dài như: Mô tả (Description), Ghi chú (Notes), Công thức (Formula) hoặc các bảng dữ liệu (Table).
4. Sắp xếp các trường có tính liên kết chặt chẽ vào cùng một dòng (VD: `Loại thưởng` đi liền với `Trạng thái`, hoặc `Cách tính` đi liền với `Giá trị`).

**Mục đích:** Tối ưu hóa không gian hiển thị, tránh form bị quá dài và tạo cảm giác chuyên nghiệp, gọn gàng (premium design).
