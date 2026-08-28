# CODE MEMORY & TRACEABILITY RULES

**MỌI LÚC** Agent tạo mới hoặc thay đổi đáng kể một file (FE, BE, DB) trong dự án `xevn-ecosystem`, Agent **BẮT BUỘC** phải:

1. **Bảo tồn @CODE-MEMORY cũ**: KHÔNG BAO GIỜ xóa các block comment `@CODE-MEMORY` hoặc `@CODE-MEMORY-CHANGE` đã có sẵn ở đầu file. Nếu thay đổi logic cốt lõi, phải ghi thêm log `@CODE-MEMORY-CHANGE` với format:
   ```typescript
   /**
    * @CODE-MEMORY-CHANGE YYYY-MM-DD
    * WorkItem: [Mã SRS/Task]
    * change_mode: UPGRADE / FIX
    * What: Mô tả ngắn gọn thay đổi
    * Why: Lý do thay đổi (Link tới SRS/TechSpec)
    */
   ```

2. **Gắn thẻ Truy xuất (Traceability Tagging) cho File Mới**: Mọi file FE (Component/Page), BE (Controller/Service), DB (Schema/Migration) tạo mới ĐỀU PHẢI có header comment tham chiếu trực tiếp đến tài liệu.
   ```typescript
   /**
    * @CODE-MEMORY
    * Module/Screen: [Tên Module/Màn hình]
    * Trace: SRS ➔ TechSpec ➔ API Contract ➔ UIUX
    * WorkItem: [Mã tham chiếu từ SRS, VD: PO-HRM-PAY-POLICY-01]
    * SOLID: Đảm bảo trách nhiệm đơn lẻ [Giải thích ngắn nếu cần]
    */
   ```

3. **Comment Nghiệp vụ tại Hàm (Function-level)**: Các hàm chứa logic tính toán, xử lý nghiệp vụ phức tạp phải có comment giải thích hàm này giải quyết **bước nào của nghiệp vụ** trong tài liệu SRS, tuyệt đối không code chay không có comment giải nghĩa.
