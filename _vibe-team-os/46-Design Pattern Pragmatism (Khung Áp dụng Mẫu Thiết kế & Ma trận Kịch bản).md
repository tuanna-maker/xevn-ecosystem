# 46 — Design Pattern Pragmatism (Khung Áp dụng Mẫu Thiết kế & Ma trận Kịch bản)

**Ban hành:** 2026-08-17
**Mục đích:** Khẳng định vai trò của Design Pattern như một ngôn ngữ giao tiếp chung và công cụ "Nén ngữ cảnh" (Prompt Compression) giữa PM/PO, Dev, và AI Agent. Thiết lập **Ma trận Kịch bản đóng đinh** để quy định chính xác lúc nào dùng Pattern nào, chấm dứt việc Dev/AI tự ý đoán mò hoặc lạm dụng (Over-engineering).
**Liên kết:** `25-SOLID-AND-CODING-CONVENTION.md` (Design Pattern là cách thực thi SOLID) · `40-SA-BA-RULES-AND-SKILLS.md` (SA quy định Pattern trên TechSpec).

---

## 1. Định hướng Tư duy cho PM/PO (Train the Trainer)

Khi tiếp nhận dự án, PM/PO không cần phải code, nhưng BẮT BUỘC phải hiểu Design Pattern ở góc độ quản trị:

*   **Với Dev con người:** Design Pattern là ngôn ngữ chung. Thay vì giải thích dông dài, gọi tên Pattern là Dev hiểu ngay cấu trúc file phải tạo.
*   **Với AI Agent (Cursor/Claude):** Design Pattern là **"Từ khóa ma thuật" (Prompt Compression)**. Đưa tên Pattern vào yêu cầu sẽ ép AI sinh ra code có kiến trúc chuẩn, dễ mở rộng, thay vì một mớ `if/else` rối rắm.
*   **CẤM LINH HOẠT TÙY HỨNG:** Quyết định dùng Pattern nào KHÔNG PHẢI là việc của Dev/AI lúc đang gõ phím, mà phải dựa vào **Ma trận Kịch bản** (Mục 2) và được chỉ định từ khâu thiết kế (TechSpec)[cite: 5, 7].

---

## 2. Ma trận Kịch bản Áp dụng Pattern (Strict Mapping)

Để mọi thành viên và Sub-agent biết chính xác phải code như thế nào, hệ thống quy định **áp dụng cứng 5 Pattern lõi** cho 5 kịch bản nghiệp vụ sau. Mọi kịch bản ngoài danh sách này mặc định dùng **KISS (Controller → Service thuần → Repository)**[cite: 1, 3].

| Kịch bản Nghiệp vụ (Dấu hiệu trên SRS) | Pattern Bắt buộc | Cách Code Thực thi |
| :--- | :--- | :--- |
| **1. Logic tính toán phân nhánh**<br>*(VD: Tính lương, Thuế, Chiết khấu. "Nếu là đối tượng A thì tính kiểu 1, đối tượng B tính kiểu 2")* | **`STRATEGY`** | Tách mỗi công thức tính thành 1 Class riêng biệt (implement cùng 1 interface). Service chính chỉ gọi interface thay vì dùng `if/else` dài hàng trăm dòng. |
| **2. Tích hợp Hệ thống ngoài**<br>*(VD: Gọi VNPay, Gửi SMS Zalo, Lấy dữ liệu từ SAP đối tác)* | **`ADAPTER`** | Cấm gọi HTTP/Thư viện thẳng từ Service nghiệp vụ. Bắt buộc tạo `Interface` rồi viết lớp Adapter bọc lại (VD: `VNPayAdapter`). (Tuân thủ Dependency Inversion)[cite: 1, 3]. |
| **3. Hiệu ứng dây chuyền**<br>*(VD: Tạo User xong tự động gửi Email, cấp quyền, bắn Notification)* | **`OBSERVER`** (Pub/Sub) | Service chính KHÔNG ĐƯỢC gọi các hàm phụ. Nó chỉ được phát ra sự kiện (`emit('user.created')`). Các module khác tự "lắng nghe" và thực thi. |
| **4. Khởi tạo Dữ liệu phức tạp**<br>*(VD: Xuất file Hợp đồng gồm Thông tin chung, Điều khoản, Phụ lục, Chữ ký số)* | **`BUILDER`** | Cấm nhồi hàng chục tham số vào hàm khởi tạo. Tách thành các hàm lắp ráp: `.buildHeader()`, `.buildTerms()`, `.getResult()`. |
| **5. Máy trạng thái (Workflow)**<br>*(VD: Hồ sơ từ Nháp → Chờ duyệt → Đã duyệt. Mỗi trạng thái có quyền khác nhau)* | **`STATE`** | Không dùng `if (status === 'DRAFT')` rải rác. Trạng thái phải quyết định hành vi. Tách các trạng thái thành lớp/cấu hình riêng. |

---

## 3. Quy trình "Ép Khuôn" (Enforcement Workflow)

Để hệ thống tự vận hành trơn tru từ khâu thiết kế đến khâu code, PM/PO phải quản trị theo 3 bước:

1.  **Khâu SA Thiết kế (Tại File 40 / 13):** Khi SA viết `API_DESIGN` trên TechSpec, SA phải ghi rõ vào mục *Nghiệp vụ xử lý*: *"Luồng này áp dụng Strategy Pattern cho việc tính thuế"*[cite: 5, 7].
2.  **Khâu PM Giao việc:** Khi PM giao task cho AI (Cursor/Claude) hoặc Dev, prompt lệnh phải trích dẫn rõ yêu cầu Pattern từ TechSpec.
3.  **Khâu Code (Tại File 25):** Quy định rõ: *"Cấm tự ý sáng tạo Design Pattern ngoài 5 kịch bản đã chốt trong File 46. Vi phạm → REJECT."*[cite: 1, 3].

---

## 4. Lằn ranh Đỏ: Chống "Ngộ độc Pattern" (Anti-Patterns)

Việc áp dụng Pattern sai chỗ (Over-engineering) sẽ tạo ra "Nợ kỹ thuật". Tech Lead và QA có quyền **REJECT (Từ chối Merge)** nếu phát hiện:

### 🚫 Tội 1: Lạm dụng Pattern khởi tạo cho CRUD cơ bản
*   **Triệu chứng:** Dùng `Abstract Factory`, `Builder Pattern` phức tạp chỉ để lưu và đọc một bảng "Danh mục" đơn giản.
*   **Phán quyết:** **REJECT.** Bắt buộc áp dụng KISS. Khởi tạo đối tượng trực tiếp từ DTO, không vẽ vời.

### 🚫 Tội 2: Bọc (Wrap) ORM hiện đại một cách mù quáng
*   **Triệu chứng:** Dùng Prisma/TypeORM nhưng lại tạo ra lớp `BaseRepository<T>` rồi viết đè lại toàn bộ các hàm `find`, `create`, làm mất tính năng gợi ý code (Type-safe).
*   **Phán quyết:** **REJECT.** ORM hiện đại đã là Repository. Chỉ tạo Custom Repository khi query thực sự phức tạp. Không bọc lại những gì Framework đã làm tốt.

### 🚫 Tội 3: Mang Pattern của Backend lên Frontend UI
*   **Triệu chứng:** Nhồi nhét `Factory` hay `Strategy` vào tận bên trong các file giao diện (`.tsx`, `.jsx`).
*   **Phán quyết:** **REJECT.** UI Component sinh ra để hiển thị (Declarative UI). Mọi xử lý Pattern nghiệp vụ sâu phải đẩy xuống Backend hoặc ra file Logic thuần túy (Hooks/Utils)[cite: 1, 3].

---

## 5. Hướng dẫn Dispatch cho PM/PO (Prompt Template)

Khi PM/PO giao Task, hãy luôn gắn khối lệnh này vào để thiết lập luật chơi cho AI và Dev:

```yaml
architecture_directives:
  - "Pragmatic Design: Do NOT over-engineer. Use KISS for generic CRUD functions."
  - "Strict Pattern Mapping: Follow the 5 core scenarios in OS-46. For example, if branching logic exists, strictly implement Strategy Pattern."
  - "Third-Party Isolation: ALL external SDKs/APIs MUST be isolated using Adapter Pattern."
  - "SOLID Adherence: Ensure patterns physically separate logic to prevent God Classes (Ref: OS-25)[cite: 1, 3]."