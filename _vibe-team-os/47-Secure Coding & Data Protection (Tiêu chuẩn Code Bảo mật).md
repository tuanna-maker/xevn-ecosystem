# 47 — Secure Coding & Data Protection (Tiêu chuẩn Code Bảo mật)

**Ban hành:** 2026-08-17
**Mục đích:** Thiết lập kỷ luật lập trình an toàn (Secure Coding) cho toàn bộ hệ sinh thái. Ngăn chặn triệt để các rủi ro bảo mật mã nguồn do AI Agent hoặc Dev sinh ra (Hardcode, XSS, IDOR, Data Exposure). File này đóng vai trò là "Luật Hình sự" trong quá trình Review Code.
**Liên kết:** `28-FE-BE-SEPARATION-DISPLAY-READY.md` · `40-SA-BA-RULES-AND-SKILLS.md`

---

## 1. Bảo vệ Dữ liệu & Chống Rò rỉ (Data Exposure & Hardcode)

AI Agent thường có xu hướng "code cho nhanh chạy được" nên rất hay vướng vào các lỗi lộ lọt dữ liệu tĩnh. Toàn bộ team phải tuân thủ:

### 1.1 Cấm tuyệt đối Hardcode (No Secrets in Code)
*   **Luật:** Không một API Key, Secret Key, Database URL, hay Mật khẩu nào được phép viết cứng dạng Text vào trong file `.ts`, `.js`, `.json` (kể cả code dùng để test).
*   **Thực thi:** Bắt buộc dùng biến môi trường (Environment Variables) thông qua `process.env` hoặc `ConfigService` của NestJS.

### 1.2 Chặn Rò rỉ Dữ liệu Nhạy cảm (Sensitive Data Exposure)
*   **Lỗi thường gặp:** Truy vấn `prisma.user.findUnique()` rồi ném thẳng toàn bộ object User trả về cho Frontend, làm lộ luôn cột `password_hash`, `salt`, `reset_token`.
*   **Thực thi:** Backend **BẮT BUỘC** phải dùng DTO (Data Transfer Object) để lọc dữ liệu trước khi `return`. Chỉ trả về đúng những trường Frontend cần hiển thị (Tuân thủ nguyên tắc *Display-Ready* của File 28).

---

## 2. Bảo vệ Cửa ngõ API (Backend Security)

### 2.1 Chống Lỗ hổng IDOR (Insecure Direct Object Reference)
*   **Tình huống:** User A (ID: 1) đăng nhập, nhưng lại gửi request `DELETE /api/users/2/invoices/99` để xóa hóa đơn của User B. Nếu Backend chỉ check "có Token đăng nhập chưa" thì hệ thống sẽ bị hack.
*   **Thực thi:** Trong mọi hàm xử lý (Update, Delete, Get Detail), Backend phải verify quyền sở hữu. So khớp `userId` lấy từ JWT Token (người đang thao tác) với `ownerId` của bản ghi trong Database. Nếu không khớp, ném lỗi `403 Forbidden`.

### 2.2 Chống SQL/NoSQL Injection
*   **Thực thi:** Cấm tuyệt đối việc cộng chuỗi (String concatenation) khi viết câu lệnh truy vấn Database. Bắt buộc sử dụng Query Builder hoặc phương thức chuẩn của Prisma/TypeORM để ORM tự động sanitize dữ liệu đầu vào.

---

## 3. An toàn Giao diện Frontend (React / Vite)

### 3.1 Chống XSS (Cross-Site Scripting)
*   **Luật:** Mặc định React đã tự động encode HTML để chống XSS. Tuy nhiên, **Nghiêm cấm** Dev/Agent sử dụng thuộc tính `dangerouslySetInnerHTML` trừ khi có yêu cầu nghiệp vụ bắt buộc (VD: render bài viết Rich Text).
*   **Bảo vệ:** Nếu bắt buộc phải dùng `dangerouslySetInnerHTML`, dữ liệu đầu vào BẮT BUỘC phải được làm sạch bằng thư viện `DOMPurify` trước khi render.

### 3.2 Quản trị Token & State (Client Security)
*   **Luật:** KHÔNG lưu trữ Access Token (đặc biệt là Token có thời hạn dài) hoặc Refresh Token trong `localStorage` hay `sessionStorage` (rất dễ bị đánh cắp qua XSS).
*   **Tiêu chuẩn:** Token nhạy cảm phải được lưu trong **HttpOnly, Secure Cookies**.

---

## 4. Chốt chặn Review Code (Security Reject Gates)

Tech Lead và PM BẮT BUỘC **REJECT (Từ chối Merge)** ngay lập tức và đánh dấu **[CRITICAL BUG]** nếu phát hiện các dấu hiệu sau trong Pull Request (dù là do người hay AI viết):

| Dấu hiệu Code bẩn (Red Flags) | Lý do Reject & Xử lý |
| :--- | :--- |
| `apiKey: "sk-live-1234..."` nằm trong file `.ts` | **REJECT.** Cảnh báo bảo mật cấp cao. Yêu cầu đưa vào `.env`. Nếu PR đã lỡ commit key thật, phải thực hiện Rotate/Revoke key ngay lập tức. |
| `dangerouslySetInnerHTML={{ __html: data }}` (Không có hàm sanitize) | **REJECT.** Mở toang cửa cho Hacker chèn mã độc XSS vào hệ thống. Ép dùng `DOMPurify`. |
| API Update/Delete không có logic check `req.user.id === record.ownerId` | **REJECT.** Vi phạm quy tắc chống IDOR. Ai cũng có quyền sửa/xóa data của người khác. |
| Trả về Frontend object chứa: `password`, `token`, `is_admin_hidden` | **REJECT.** Rò rỉ dữ liệu. Ép Backend ánh xạ qua DTO để gọt bỏ các trường nhạy cảm. |

---

## 5. Hướng dẫn Dispatch cho PM/PO (Prompt Template)

Khi giao task cho AI (Cursor/Claude) thao tác trên các tính năng nhạy cảm (Đăng nhập, Thanh toán, Quản lý User), hãy gắn khối lệnh bảo mật sau vào Prompt:

```yaml
security_directives:
  - "OWASP Adherence: Strictly prevent IDOR. All mutate/delete APIs must verify resource ownership against the authenticated JWT user."
  - "No Data Exposure: Filter all outgoing API responses through rigorous DTOs. NEVER return password hashes, salts, or internal tokens to the client."
  - "No Hardcoding: All secrets, API URLs, and configuration keys MUST be accessed via environment variables."
  - "XSS Prevention: Do not use dangerouslySetInnerHTML. If HTML rendering is explicitly required, you MUST implement DOMPurify."