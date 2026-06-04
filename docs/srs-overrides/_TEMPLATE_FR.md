# Mẫu override FR — Bateco (7 mục bắt buộc)

> Lưu tại `docs/srs-overrides/{Mxx}/{UC-CODE}.md`. Build merge với template nếu thiếu mục.

```markdown
#### FR-{UC-CODE}: {Tên nghiệp vụ}

| Thuộc tính | Mô tả |
|-----------|-------|
| **Actor** | ... |
| **Ưu tiên** | Cao / Trung bình / Thấp |
| **Điều kiện tiên quyết** | ... |
| **Điều kiện hậu** | ... |

**Dữ liệu đầu vào:**

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|--------|------|----------|-----------|
| Authorization | string | Có* | Bearer JWT |
| x-tenant-id | UUID | Có* | UC-ECO-SCOPE-02 |
| ... | ... | ... | ... |

**Luồng chính:**
1. ...
2. ...
3. ...
4. ...

**Quy tắc nghiệp vụ:**
- **BR-ECO-SCOPE-02:** ...
- **BR-XXX:** ...

**Trường hợp đặc biệt:**
- **[A1]** ... → HTTP 400 ...
- **[A2]** ... → HTTP 403 ...

**Sơ đồ tương tác:**

\`\`\`mermaid
sequenceDiagram
  ...
\`\`\`

**Diễn biến nghiệp vụ (theo sơ đồ):**

| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |
|---|---------|--------|--------|
| 1 | ... | ... | ... |
```

**Không** dùng trong override khách: Metadata STT/REQ-SRS, Kiểm chứng, Phụ lục, bảng Mã lỗi 6 dòng (chuyển sang Trường hợp đặc biệt).
