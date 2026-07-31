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

## Entry 3 — HTML cover còn brand UNICOM (gap XeVN)

### Context

Sponsor/PM cần brand XeVN trên HTML khách; master logo đã có tại `assets/brand/xevn-logo-master.png`.

### Action

Inventory 5 HTML `docs/client-delivery/**/*.html` (2026-07-22): hero logo = UNICOM; accent `#3d7de8→#0ab4d8`; font Be Vietnam Pro; generators hardcode `logo-unicom.png`.

### Outcome

Evidence + cover template + P0 AC copy-ready cho SA merge proposal — chưa rewrite HTML trong wave research.

### Evidence

`docs/qa/evidence/ba-xevn-html-brand-gap-01-20260722.md`

### Reuse-tag

`client-delivery`, `brand-gap`, `xevn-logo`, `cover-template`

---

## Entry 4 — Dual-mark UNICOM text + orphan logo (P1 C1/C4)

### Context

QC-DOCS-HTML-BRAND-SAMPLE-01 GWC: hero XeVN PASS nhưng inner/footer còn «UNICOM»; `assets/logo-unicom.png` còn file dù HTML refs = 0.

### Action

Replace brand chrome/author/footer → XeVN / XeVN Group trong `docs/client-delivery/**`; delete `logo-unicom.png`; align generators (`doc-tscair-shell`, `srs-bateco-body`, BRD/SRS build, commercial pptx) + rule/standards logo path.

### Outcome

Grep client-delivery **0** UNICOM/`logo-unicom`; assets chỉ `xevn-logo.png`; C1+C4 closed — evidence P1 dualmark.

### Evidence

`docs/qa/evidence/xevn-thm-docs-p1-dualmark-01-20260722.md`

### Reuse-tag

`client-delivery`, `dual-mark`, `xevn-logo`, `no-unicom-hero`

---

## Entry 5 — P0 shell brand XeVN (sponsor lock 2026-07-22)

### Context

Sponsor OK Precision Motion; **không còn UNICOM** trên tài liệu khách — P0 HTML shell.

### Action

- Sync `xevn-logo-master.png` → `docs/client-delivery/assets/xevn-logo.png`
- Generators: LOGO XeVN; `rewriteLegacyUnicomAccentCss` (`#3d7de8`→`#1E40AF`, `#0ab4d8`→`#06B6D4`); cover tokens `#1E40AF`→`#06B6D4`
- `loadStyleSourceHtml(primary, fallback OUT)` khi thiếu file TSCAir trên máy
- Rebuild BRD/SRS `ok=true`; FR=373 giữ nguyên

### Outcome

AC-HTML-BRAND-01..06 **PASS**; grep `logo-unicom` / `UNICOM | AI SOFTWARE FACTORY` / `#3d7de8` = 0 trên HTML khách.

### Evidence

`docs/qa/evidence/ba-xevn-brand-html-p0-20260722.md`

### Reuse-tag

`xevn-brand-p0`, `doc-tscair-shell`, `cover-accent`, `style-fallback`

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
