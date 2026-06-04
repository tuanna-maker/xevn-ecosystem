---
name: client-delivery-docs
description: >-
  Profile dự án XeVN cho tài liệu khách. Mọi quy trình BRD/SRS HTML dùng skill global
  client-delivery-brd-srs và subagent @ba-docs — không nhân bản hướng dẫn tại đây.
---

# XeVN — client delivery (project profile only)

## Đọc trước (bắt buộc)

1. **Global:** `C:\Users\ADMIN\.cursor\skills\client-delivery-brd-srs\SKILL.md`
2. **Global KB:** `C:\Users\ADMIN\.cursor\knowledge-base\client-delivery-brd-srs.md`
3. **Tag agent:** **`@ba-docs`**
4. **Manifest repo:** [PROJECT_PROFILE.md](./PROJECT_PROFILE.md) (đường dẫn build, 373 UC)
5. Chuẩn repo: `docs/standards/BRD_SRS_WRITING_STANDARDS.md`
6. Bài học repo: `.cursor/knowledge-base/client-delivery-docs.md`

## Lệnh nhanh (XeVN)

```bash
pnpm docs:srs:api-hints
pnpm docs:srs:audit      # 373/373
pnpm docs:srs:html
pnpm docs:brd:html
pnpm docs:client-delivery:html
```

## Không làm lại trên XeVN

- SRS 8 chương + 12 mục/UC + REQ-SRS trong HTML khách
- Sửa tay `docs/client-delivery/*.html`
