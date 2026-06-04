# Template override UC (12 mục — LEGACY, không dùng cho SRS khách)

> **SRS gửi khách (v2.1+):** dùng `_TEMPLATE_FR.md` (7 mục Bateco). File này chỉ tham khảo hoặc parse ngược tương thích.

Đặt file tại: `docs/srs-overrides/{M00|M01|…|M08}/{UC-CODE}.md`

#### STT {n} — {UC-CODE}: {Tên UC}

**Metadata (Thông tin chung):**

| Trường | Giá trị |
|---|---|
| STT | {n} |
| REQ-ID | REQ-SRS-{MOD}-{NNN} |
| ID | {UC-CODE} |
| Module | M0x — … |
| API chính | `{METHOD} {PATH}` |

**Tác nhân chính:** …  
**Bên liên quan:** …  

**Điều kiện tiên quyết:** …  
**Điều kiện sau khi thành công:** …  

**Dữ liệu đầu vào và quy tắc kiểm tra:** (bảng field)  
**Dữ liệu đầu ra:** (response + side effect)  
**Luồng chính:** (≥5 bước, method + path)  
**Luồng thay thế / ngoại lệ:** (≥3 nhánh A1…)  
**Ngoại lệ (hệ thống):** timeout, offline, upstream  
**Quy tắc nghiệp vụ:** BR-ID | condition | action  
**Mã lỗi:** (≥5 dòng)  
**Sơ đồ tuần tự:** mermaid sequenceDiagram với alt/opt  
**Tiêu chí nghiệm thu:** (≥4 AC)  
**Kiểm chứng (Verify):** Test / Demo / Inspection  

---
