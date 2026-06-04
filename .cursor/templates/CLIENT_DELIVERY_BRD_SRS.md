# Client delivery — BRD / SRS HTML (XeVN)

> Tài liệu **gửi khách**. Global: `~/.cursor/skills/client-delivery-brd-srs` + **`@ba-docs`** · XeVN: `PROJECT_PROFILE.md`

## Chuẩn bắt buộc

| Tài liệu | Đọc |
|----------|-----|
| Chuẩn viết | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` |
| Mẫu SRS (cách viết FR) | `E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu.md` |
| KB bài học | `.cursor/knowledge-base/client-delivery-docs.md` |

## Deliverable & build

| File | Lệnh |
|------|------|
| `docs/client-delivery/01_BRD_XeVN_OS.html` | `pnpm docs:brd:html` |
| `docs/client-delivery/02_SRS_XeVN_OS.html` | `pnpm docs:srs:audit` rồi `pnpm docs:srs:html` |

## SRS — checklist (Bateco v2.1+)

- [ ] Catalog 373 UC: `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md`
- [ ] Audit **373/373** (7 mục/FR: metadata, đầu vào, luồng, quy tắc, đặc biệt, sơ đồ, diễn biến)
- [ ] Build `fr_blocks=373`, `ok=true`
- [ ] Cấu trúc §1–§6 (không §0, không "CHI TIẾT USE CASE", không REQ-SRS)
- [ ] Không meta agent trong HTML
- [ ] Ctrl+F5 trình duyệt

## Override UC (tùy chọn)

`docs/srs-overrides/_TEMPLATE_FR.md` — không dùng mẫu 12 mục cũ cho deliverable mới.
