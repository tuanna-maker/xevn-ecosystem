# 13 — BRD · SRS · TechSpec Quality (Client Deliverable Hygiene & Deep Depth)

**Ban hành:** 2026-08-17
**Mục đích:** Thiết lập tiêu chuẩn chất lượng (Quality Gate) bắt buộc cho các tài liệu giao tiếp với khách hàng (SRS) và tài liệu kỹ thuật (TechSpec). Trọng tâm là khắc phục tình trạng phân tích "nông", hời hợt, chỉ có "Happy Path" và đứt gãy kết nối giữa BA và SA.
**Neo:** `OS-STD-DOC-QUALITY-01`

---

## 1. Tiêu chuẩn Tài liệu SRS (Dành cho BA)

### 1.1 Yêu cầu bắt buộc cho mỗi Functional Requirement (FR/UC)
Mỗi User Case (UC) trên SRS bắt buộc phải có đủ 7 mục sau:
1. Bảng thuộc tính (Vai trò, Mã UC, Tiên quyết).
2. Dữ liệu đầu vào (Input).
3. **Luồng chính (Main Flow):** Phải có ≥ 4 bước nghiệp vụ (không tính bước "Đăng nhập/Kiểm tra quyền")[cite: 5].
4. Quy tắc nghiệp vụ (Business Rules - Nếu/thì...)[cite: 5].
5. Sơ đồ `sequenceDiagram` (autonumber)[cite: 5].
6. Bảng **Diễn biến** (4 cột khớp với sơ đồ)[cite: 5].
7. Mục **Kết quả trả về khi thành công** (Chi tiết tại phần 1.3)[cite: 5].

### 1.2 Tỷ lệ nội dung "Diễn biến" & Quy tắc "Fail nghiệp vụ sâu"
Một UC chuẩn không được phép chỉ có 1 dòng Fail quyền và 1 dòng Thành công[cite: 5]. Tỷ lệ nội dung bảng Diễn biến (và Sơ đồ tuần tự) phải tuân thủ:

*   **Auth / Quyền đơn vị:** ≤ 2 dòng (gom vào đầu)[cite: 5].
*   **Fail nghiệp vụ sâu:** **≥ 30%** số dòng[cite: 5]. 
    *   *Ví dụ (Domain Y tế/Logistics):* Hết tồn kho, Lệch mã LIS, Hết hạn lô, Đã thu tiền không cho sửa, Không tìm thấy hồ sơ[cite: 5].
*   **Bước luồng chính thành công:** **≥ 40%** số dòng[cite: 5].
    *   *Ví dụ:* Nhập CCCD → Tìm hồ sơ → Mở ca → Hiện số phiếu[cite: 5].
*   **Thành công cuối:** 1 dòng (Thông báo/trạng thái sau)[cite: 5].

**Thứ tự trình bày:** Check Auth/Quyền → Check Fail nghiệp vụ sâu → Luồng thành công → Các nhánh logic phụ[cite: 5].

### 1.3 Cầu nối SRS → TechSpec: Mục "Kết quả trả về"
Đây là điểm đứt gãy thường gặp nhất. Nếu UC kết thúc bằng "Thành công" mà không nói hệ thống đã làm gì, SA sẽ không thể thiết kế DB/API[cite: 5].
Mỗi UC kết thúc phải liệt kê rõ bằng ngôn ngữ nghiệp vụ tiếng Việt (cấm dùng từ ngữ SQL/JSON/HTTP trên bản khách)[cite: 5]:

| Mục trên SRS | TechSpec sẽ dịch thành |
| :--- | :--- |
| **Bản ghi tạo/cập nhật** (VD: Tạo hồ sơ cư dân mới, Đổi trạng thái ca) | Bảng DB / Trạng thái Prisma[cite: 5] |
| **Khóa nghiệp vụ trả về** (VD: Trả về Số phiếu, Mã bệnh nhân) | Response fields / Zod schema[cite: 5] |
| **Người dùng thấy gì** (VD: Toast "Tiếp nhận thành công số 12") | UI Bind / Frontend xử lý[cite: 5] |
| **Mở khóa UC kế tiếp** (VD: Mở luồng In phiếu) | API nào FE sẽ gọi tiếp theo[cite: 5] |

---

## 2. Tiêu chuẩn Tài liệu TechSpec (Dành cho SA)

TechSpec không được là bản thiết kế "khái niệm" mơ hồ. Nó phải chi tiết đến mức Frontend và Backend có thể code độc lập mà không cần hỏi nhau[cite: 5].

### 2.1 Thiết kế Cơ sở dữ liệu (DB Design) trên TechSpec Khách
Phải chứa đủ các thành phần logic:
1. **ERD:** Quan hệ 1-N, N-N đủ thực thể[cite: 5].
2. **Catalog thực thể:** Mục đích, PK, **FK trỏ rõ bảng đích**, trường trạng thái, `ref_srs`[cite: 5].
3. **Máy trạng thái (State Machine):** Các bước chuyển đổi trạng thái hợp lệ, khớp với bảng Diễn biến trên SRS[cite: 5].

### 2.2 Thiết kế API Contract (API_DESIGN F.1 - Chốt chặn bắt buộc)
Mỗi function/endpoint trong API_DESIGN **PHẢI** có khối định nghĩa này (Thiếu = NO-GO)[cite: 5]:

1. **Mục đích:** 1–3 câu tiếng Việt mô tả API này phục vụ việc gì trên UI[cite: 5].
2. **Nghiệp vụ xử lý:** Các nhánh logic Backend thực hiện (validate, ghi DB). Không dùng "CRUD generic"[cite: 5].
3. **Tham chiếu bước SRS (`ref_srs`):** Mã `UC-...` và **Số thứ tự Diễn biến** mà API này hiện thực[cite: 5].
4. **Display-Ready View Model:** Liệt kê các field UI được bind (Tuân thủ doctrine 28).
5. **Lỗi nghiệp vụ:** Mã lỗi khớp với "Fail nghiệp vụ sâu" trên SRS[cite: 5].

### 2.3 Ma trận truy vết (Traceability Matrix)
Mỗi hàng là một bước nghiệp vụ, bắt buộc có các cột:
`UC` · `Bước Diễn biến #` · `Endpoint API` · `Tên Service` · `Bảng đọc (Select)` · `Bảng ghi (Insert/Update)` · `ref_srs`[cite: 5].

---

## 3. Quy tắc "Bản sao kép" (Dual-Doc: Bản Khách vs Bản Team)

Tài liệu dự án phải được chia làm 2 lớp vật lý để bảo vệ SoT gốc[cite: 5]:

| Tiêu chí | Bản Khách (SoT Gốc) | Bản Team (`*_team.md`) |
| :--- | :--- | :--- |
| **Vai trò** | Đọc, confirm, nghiệm thu với C-Level/Chủ đầu tư[cite: 5]. | Dành cho Dev và AI Agent đọc để code[cite: 5]. |
| **Nội dung** | 100% tiếng Việt, văn phong chuyên nghiệp. Đầy đủ luồng, DB Logic, Ma trận[cite: 5]. Cấm dùng thuật ngữ lóng (Orphan, tảng băng chìm), cấm lộ mã nội bộ[cite: 5]. | Clone 100% từ bản khách + Bổ sung Path repo (Nest/Prisma/Route) + Mã nội bộ[cite: 5]. |
| **Quy tắc sửa** | **BẮT BUỘC SỬA BẢN KHÁCH TRƯỚC**[cite: 5]. | Clone từ bản khách sang sau khi khách đã chốt. Cấm thêm logic vào bản team mà bản khách không có[cite: 5]. |

---

## 4. Anti-pattern (Reject Gate)

| Vi phạm | Trách nhiệm xử lý | Phân loại |
| :--- | :--- | :--- |
| SRS luồng chính có < 4 bước nghiệp vụ, hoặc bảng diễn biến toàn lỗi check quyền[cite: 5]. | BA phải bổ sung nhánh "Fail nghiệp vụ sâu"[cite: 5]. | NO-GO |
| Dòng kết thúc UC chỉ ghi "Thành công" mà không liệt kê bản ghi, trạng thái, màn hình nhận gì[cite: 5]. | BA phải bổ sung mục "Kết quả trả về"[cite: 5]. | NO-GO |
| TechSpec (API) không map với số thứ tự Diễn biến trên SRS[cite: 5]. | SA phải bổ sung `ref_srs` và số bước vào API_DESIGN[cite: 5]. | P0 Depth (Residual) |
| Tài liệu khách chứa từ lóng ("Bateco", "mặt nổi", HTTP status code)[cite: 5]. | PM/BA xóa bỏ và viết lại bằng ngôn ngữ nghiệp vụ[cite: 5]. | C-SPEC-SHALLOW |
| Viết nghiệp vụ/DB chỉ trên bản Team, để bản Khách mỏng dính[cite: 5]. | BA/SA đưa SoT về lại bản Khách rồi mới clone[cite: 5]. | P0 Process (Residual)[cite: 5] |

---
*Lưu ý: Mọi dự án Vibe Coding phải chạy kịch bản kiểm tra (Skeleton & Inventory check) trước khi bàn giao. Nếu số lượng UC trên khung (Skeleton) giảm so với BRD gốc mà không có xác nhận từ Sponsor, lập tức Rollback toàn bộ đợt giao việc.*[cite: 5]