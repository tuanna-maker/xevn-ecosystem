# KB — Client delivery BRD/SRS HTML (XeVN repo)

> **Tri thức toàn Cursor:** `C:\Users\ADMIN\.cursor\knowledge-base\client-delivery-brd-srs.md`  
> **Skill global:** `client-delivery-brd-srs` · **Agent:** `@ba-docs`

## Entry 1 — Không meta agent trong HTML khách

### Context

User từ chối meta ngôn ngữ prompt/agent trong bìa và changelog SRS.

### Action

- `stripClientDeliveryMeta()` trong `doc-markdown-prep.mjs`
- Subtitle SRS: *Yêu cầu phần mềm — Hệ sinh thái đa phân hệ*

### Outcome

HTML không lộ pipeline/audit/Writing Standards.

### Evidence

Phiên 2026-05-21; `02_SRS_XeVN_OS.html`.

### Reuse-tag

`client-delivery`, `no-agent-meta`

---

## Entry 2 — SRS theo mẫu Bateco E-Office (373 FR × 7 mục)

### Context

SRS cũ (~9MB) nhúng 373 UC × 12 mục ISO (REQ-SRS, Kiểm chứng, bảng lỗi…) — khách khó đọc, không giống deliverable Bateco (`E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu`). User yêu cầu đủ 373 UC nhưng **cùng một bộ mục**, không FR nào thiếu sơ đồ/đầu vào.

### Action

1. **Cấu trúc SRS 6 chương** (thay 8 chương): Giới thiệu → Tổng quan → **Yêu cầu chức năng (373 FR)** → NFR → Giao diện ngoài → Ràng buộc BR.
2. **Generator mới:** `srs-bateco-body.mjs` + `srs-fr-spec.mjs`; `build-srs-xevn-html.mjs` chỉ gọi pipeline này.
3. **Mỗi FR = 1 UC:** tiêu đề `#### FR-{Mã UC} — {tên}`; module MOD-M00…M08 trong Ch.3.
4. **7 mục bắt buộc mọi FR:** metadata (Actor, Ưu tiên, Tiên quyết, Hậu) · Dữ liệu đầu vào · Luồng chính · Quy tắc nghiệp vụ · Trường hợp đặc biệt · Sơ đồ tương tác · Diễn biến (7 dòng).
5. **Bỏ** `frTier` short/standard/full; `auditFrBlock()` gate 7 sections.
6. **Override:** `convertOverrideToFr()` merge file `docs/srs-overrides/` — thiếu mục thì fill template.
7. **Sửa lỗi kỹ thuật:** `sliceBetween` regex cờ `m`; CSS `srs-delivery-styles.mjs`; blank line trước list markdown.
8. **Tri thức agent:** skill + rule + template `_TEMPLATE_FR.md` + cập nhật `BRD_SRS_WRITING_STANDARDS.md` §3.

### Outcome

- `02_SRS_XeVN_OS.html` v2.1, ~8.6MB, `fr_blocks=373`, audit **373/373**
- Cấu trúc giống Bateco; không Phụ lục A/B trace trong SRS khách
- User không cần nhắc lại "làm SRS kiểu Bateco" — đọc skill/rule là đủ

### Evidence

- `pnpm docs:srs:audit` → 373/373 pass (uniform FR 7 sections)
- `pnpm docs:srs:html` → `ok=true`
- Mẫu: `../E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu.md`
- Code: `scripts/lib/srs-fr-spec.mjs`, `scripts/lib/srs-bateco-body.mjs`

### Reuse-tag

`SRS-Bateco-FR-7sections`, `373-FR-uniform`, `client-delivery`, `TSCAir`

---

## Quick reference (agent)

| Câu hỏi user | Làm ngay |
|--------------|----------|
| "Làm/cập nhật SRS khách" | Đọc skill → `docs:srs:api-hints` → `docs:srs:audit` → `docs:srs:html` |
| "Thêm UC" | Sửa `BANG_TONG_HOP_USECASE_XEVN.md` → rebuild (FR tự sinh) |
| "UC vàng / viết tay" | `docs/srs-overrides/_TEMPLATE_FR.md` + folder Mxx |
| "SRS thiếu mục" | Không sửa HTML — sửa `srs-fr-spec.mjs` / bỏ tier — audit |
| "Giống Bateco" | Đã là mặc định từ v2.1 — không revert sang 12 mục |

**Không dùng cho SRS khách:** `srs-body-markdown.mjs` (8 chương legacy), `srs-uc-spec.mjs` Ch.5 12 mục (trừ `parseUcRowsFromCatalog`).
