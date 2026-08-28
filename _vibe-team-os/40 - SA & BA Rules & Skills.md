# 29 — SA & BA Rules & Skills (Training SoT cho System Analysis & Design)

**Ban hành:** 2026-08-17
**Mục đích:** Đây là tài liệu **train + reject gate** dành riêng cho vai trò **Business Analyst (BA)** và **Solution Architect (SA)**. Tài liệu này thiết lập kỷ luật, ranh giới trách nhiệm, và chuẩn mực đầu ra (Output Standard) trước khi chuyển giao cho bộ phận Development (Dev).
**Liên kết bắt buộc đọc cùng:** `14-TRACEABILITY-SRS-TECHSPEC-CODE.md` · `25-SOLID-AND-CODING-CONVENTION.md` · `28-FE-BE-SEPARATION-DISPLAY-READY.md`

---

## 0. Ranh giới Trách nhiệm (Boundary)

| Tiêu chí | Vai trò Business Analyst (BA) | Vai trò Solution Architect (SA) |
| :--- | :--- | :--- |
| **Trọng tâm** | Giải quyết vấn đề của **Business (Nghiệp vụ)**. | Giải quyết vấn đề của **System (Hệ thống)**. |
| **Câu hỏi cốt lõi** | "Hệ thống cần làm **GÌ** để thỏa mãn người dùng và đúng logic?" | "Hệ thống làm thế **NÀO** để đáp ứng yêu cầu một cách an toàn, mở rộng và tuân thủ FE/BE SoC?" |
| **Output chính** | SRS (FR, BR, UC), Mã tham chiếu, Edge Cases. | TechSpec (TS-ID), C4 Model, API Contract (Display-ready), DB Schema. |
| **Cấm kỵ (Anti-pattern)** | Tư duy thay hệ thống (Ví dụ: Yêu cầu "Bấm nút này gọi 3 API"). | Xa rời nghiệp vụ hoặc đẩy logic sang FE (Vi phạm doctrine 28). |

---

## 1. Traceability — Chuỗi khóa phạm vi bắt buộc

Dựa theo Doctrine `14`[cite: 2], mọi thiết kế của BA và SA phải phục vụ chuỗi tham chiếu vật lý:
`SRS (UC / FR / BR) ──ref──► TechSpec (TS-ID / §) ──ref──► Code (@CODE-MEMORY)`[cite: 2]

*   **BA chịu trách nhiệm:** Sinh ra và duy trì các mã tham chiếu chuẩn (`UC-{NHÓM}-{nn}`, `FR-...`, `BR-...`) trên tài liệu SRS[cite: 2].
*   **SA chịu trách nhiệm:** Trong TechSpec, mỗi đoạn/bảng/API phải có dòng `ref_srs: ...` trỏ ngược về SRS[cite: 2].
*   **Mục đích:** Để Dev có thể đọc ngược từ SRS → TechSpec trước khi code, và ghi log tiếng Việt vào block `@CODE-MEMORY`[cite: 2].

---

## 2. Tiêu chuẩn Kỹ năng & Quy tắc (Skills & Rules)

### 2.1 Dành cho Business Analyst (BA)

#### SKILL 1: Phân rã Nghiệp vụ (INVEST & Traceability)
*   **Rule:** Mọi luồng nghiệp vụ phải được bóc tách thành các Functional Requirement (FR) và Business Rule (BR) độc lập, có mã định danh[cite: 2].
*   **Đúng:** `FR-UC-HRM-01`: Hệ thống tự động tính BHXH. `BR-HRM-01`: Công thức tính = Lương cơ bản * 8%.
*   **Sai:** Gộp chung mô tả vào một đoạn văn dài dòng không có mã đánh dấu, Dev không thể đưa vào `@CODE-MEMORY`[cite: 2].

#### SKILL 2: Xác định rõ "Kết quả trả về"
*   **Rule:** Theo bổ sung của OS `14`, BA phải định nghĩa rõ mục **Kết quả trả về khi thành công** (§3.4.6) trên SRS để SA có cơ sở viết API/DB[cite: 2].
*   **Đúng:** Nêu rõ sau khi duyệt nghỉ phép, hệ thống cập nhật bản ghi nào, trạng thái thay đổi ra sao, người dùng thấy thông báo gì[cite: 2].

#### SKILL 3: Ranh giới giao diện (UI/UX vs Business Logic)
*   **Rule:** BA thiết kế luồng (Flow) và Dữ liệu hiển thị, **KHÔNG** thiết kế màu sắc, không can thiệp sâu vào component FE[cite: 3]. Logic tính toán (BR) phải chỉ định rõ là của Server[cite: 4].

### 2.2 Dành cho Solution Architect (SA)

#### SKILL 1: Thiết kế API Contract tuân thủ "Display-Ready"
*   **Rule:** SA **BẮT BUỘC** áp dụng doctrine `28-FE-BE-SEPARATION-DISPLAY-READY.md`[cite: 4]. API Backend phải trả về payload đã hoàn thiện (display-ready) để FE chỉ việc render[cite: 4]. 
*   **Đúng:** API list trả sẵn `statusLabel`, `canApprove` (View model UI)[cite: 4].
*   **Sai:** Trả về Entity thô từ Database (VD: `status: 2`) và bắt FE phải tự map label, hoặc bắt FE gọi nhiều API rồi tự `Promise.all` merge data lại[cite: 4].

#### SKILL 2: Thiết kế Kiến trúc & Ranh giới SOLID
*   **Rule:** Áp dụng doctrine `25`, phân tách rõ Layer. Domain/lib thuần chỉ tính toán BR, Transport (Controller) chỉ map HTTP status, Infrastructure gọi DB[cite: 3].
*   **Đúng:** Trong TechSpec, chỉ định rõ công thức lương/thuế/BHXH phải nằm ở Backend[cite: 4].
*   **Sai:** Để FE tự tính toán công thức nghiệp vụ trên browser, dẫn đến Double Business Rule (FE+BE lệch nhau)[cite: 4].

#### SKILL 3: Gắn thẻ tham chiếu (Traceability Tagging)
*   **Rule:** Mọi endpoint API, schema DB thiết kế ra phải có dòng `ref_srs`[cite: 2]. Thiếu dòng này, QC TechSpec đánh NO-GO[cite: 2].

---

## 3. Anti-pattern (Reject Gate) — Dev / QA có quyền REJECT

Tài liệu từ SA/BA sẽ bị **REJECT (từ chối nhận việc / INVALID_HANDOFF)** nếu vi phạm các pattern sau:

| # | Pattern REJECT | Vì sao sai | Trách nhiệm xử lý |
| :--- | :--- | :--- | :--- |
| **R-BA-01** | SRS thiếu mã `FR-`, `BR-` hoặc thiếu bảng "Kết quả trả về". | Vi phạm doctrine `14`. Dev không có mã để điền vào `@CODE-MEMORY`[cite: 2]. SA không thể map kết quả[cite: 2]. | BA phải bổ sung mã tham chiếu. |
| **R-SA-01** | Thiết kế API bắt FE phải tự tính toán công thức nghiệp vụ (lương/BHXH/scope) hoặc merge/join nhiều list[cite: 4]. | Vi phạm doctrine `28` (FE/BE SoC)[cite: 4]. FE không phải là BFF/Query composer[cite: 4]. | SA phải thiết kế lại API thành Display-ready (View model)[cite: 4]. |
| **R-SA-02** | TechSpec (DB schema, API endpoint) không có dòng `ref_srs:`[cite: 2]. | Đứt chuỗi Traceability[cite: 2]. Dev sửa code sẽ không biết đang tác động đến UC nào[cite: 2]. | SA bổ sung `ref_srs`[cite: 2]. |
| **R-SA-03** | Trả API entity thô lồng nhau (Nested raw entity dump)[cite: 4]. | Gây storm API, phá pagination, bắt client làm writer schema[cite: 4]. | SA thiết kế payload phẳng cho write, và display-ready cho read[cite: 4]. |

---

## 4. Checklist trước `READY_FOR_DEV` (SA/BA tự điền trong evidence)

SA/BA phải hoàn thành checklist này trước khi bàn giao (Handoff) task cho team Dev. Thiếu block này → handoff INVALID.

```markdown
## sa_ba_handoff_ack
### Business Analyst (BA)
- [ ] SRS đã đánh mã `UC-`, `FR-`, `BR-` đầy đủ cho mọi nghiệp vụ[cite: 2].
- [ ] Đã hoàn thiện bảng "Kết quả trả về khi thành công" trên SRS[cite: 2].
- [ ] Mọi Edge Cases/Unhappy Paths đã được định nghĩa.

### Solution Architect (SA)
- [ ] Mọi mục thiết kế trong TechSpec đều có `ref_srs` trỏ về SRS[cite: 2].
- [ ] Tuân thủ `be_boundary`: API thiết kế trả về dạng **display-ready** (đủ field/label/statusTone cho UI bind, cấm bắt FE N+1)[cite: 4].
- [ ] API_DESIGN đã có mục "View model UI" rõ ràng (Doctrine 28)[cite: 4].
- [ ] DB Schema đảm bảo 무결성 (Integrity) và có port/repo seam test theo tiêu chuẩn SOLID[cite: 3].