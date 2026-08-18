# BA-XEVN-HTML-BRAND-GAP-01 — Inventory HTML khách + đề xuất cover XeVN

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-XEVN-HTML-BRAND-GAP-01` |
| **from_role** | ba-docs |
| **to_role** | sa / pm |
| **date** | 2026-07-22 |
| **scope** | Research only — `docs/client-delivery/**/*.html` |
| **apps/** | Không đụng |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | sa (merge) → pm (dispatch wave brand HTML) |

---

## 1. Kết luận ngắn

| Hạng mục | Hiện trạng |
|----------|------------|
| Logo trên bìa / cover | **100% UNICOM** — không file HTML nào dùng logo XeVN |
| Asset logo client-delivery | Chỉ `docs/client-delivery/assets/logo-unicom.png` |
| Master XeVN | Có sẵn `assets/brand/xevn-logo-master.png` — **chưa** copy vào `docs/client-delivery/assets/` |
| Accent cover | Gradient UNICOM `#3d7de8` → `#0ab4d8` (không khớp token product PRIMARY `#1E40AF`) |
| Font | **Be Vietnam Pro** (Google Fonts) + fallback Segoe UI / Arial |
| Build path | Generator BRD/SRS hardcode `logo-unicom.png` + footer UNICOM |

**Không claim** Phase 1 DONE / PROD-READY. U65 N/A (docs only).

---

## 2. Inventory từng file HTML

| # | File | Loại tài liệu | Logo (src) | Brand logo | Cover header text | Accent / gradient | Header text color | Font stack | Ghi chú |
|---|------|---------------|------------|------------|-------------------|-------------------|-------------------|------------|---------|
| 1 | `docs/client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html` | Overview / BRD tổng quan | `assets/logo-unicom.png` | **UNICOM** | `UNICOM \| AI SOFTWARE FACTORY` | Bar 5px `linear-gradient(90deg,#3d7de8,#0ab4d8)` · sep cùng gradient · title `.grad` cùng | `#0d1e34` | `'Be Vietnam Pro','Segoe UI',sans-serif` · `@import` weights 400–800 | Metric `.num` dùng `#1e40af` (gần product PRIMARY); footer/inner vẫn UNICOM |
| 2 | `docs/client-delivery/01_BRD_XeVN_OS.html` | BRD OS (generated) | **base64 PNG** (embed từ `logo-unicom.png`) | **UNICOM** | `Mã tài liệu: UNICOM/BRD-XEVN-OS-001` | Accent-bar 8px `#3d7de8→#0ab4d8` · title `.eo` gradient · h1 border `#3d7de8` · th `#1e3a5f` | `#0d1e34` | `'Be Vietnam Pro','Segoe UI',Arial,sans-serif` · weights 300–900 | Shell TSCAir; footer `UNICOM TECHNOLOGY SOLUTIONS CO., LTD`; build: `scripts/build-brd-xevn-html.mjs` |
| 3 | `docs/client-delivery/02_SRS_XeVN_OS.html` | SRS OS (generated) | **base64 PNG** (cùng logo UNICOM) | **UNICOM** | `Mã tài liệu: UNICOM/SRS-XEVN-OS-001` | Giống BRD + SRS extras `--cyan:#0ab4d8` | `#0d1e34` | Cùng Be Vietnam Pro | Build: `scripts/build-srs-xevn-html.mjs` + `doc-tscair-shell.mjs` |
| 4 | `docs/client-delivery/01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` | BRD HRM Mobile | `assets/logo-unicom.png` | **UNICOM** | `UNICOM \| AI SOFTWARE FACTORY` | Bar 5px `#3d7de8→#0ab4d8` · `.grad` title | `#0d1e34` | Be Vietnam Pro 13px | Inner header/footer UNICOM; th `#1e3a5f` / `#edf2f7` |
| 5 | `docs/client-delivery/02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html` | SRS HRM Mobile | `assets/logo-unicom.png` | **UNICOM** | `UNICOM \| AI SOFTWARE FACTORY` | Cùng palette Mobile BRD | `#0d1e34` | Be Vietnam Pro 13px | Title có `<span class="grad">XeVN</span>` nhưng logo vẫn UNICOM |

### 2.1 Asset liên quan (không phải HTML)

| Path | Vai trò |
|------|---------|
| `docs/client-delivery/assets/logo-unicom.png` | **Đang dùng** — mọi HTML tham chiếu file hoặc base64 |
| `assets/brand/xevn-logo-master.png` | **Master XeVN** (wings, blue on black) — README sync apps; **chưa** có target client-delivery |
| `docs/client-delivery/assets/xevn-logo.png` | **Thiếu** — đề xuất copy target |

### 2.2 Token màu quan sát (AS-IS shell)

| Token (informal) | Hex | Nơi dùng |
|------------------|-----|----------|
| Accent blue | `#3d7de8` | Accent bar start, borders, links, gradient text |
| Accent cyan | `#0ab4d8` | Accent bar end, SRS `--cyan` |
| Ink / header | `#0d1e34` | Body text, header-code |
| Subtitle / mute | `#4a6080` / `#3a4a64` / `#52637d` | Subtitle, footer mute |
| Hairline | `#eaeff8` | Divider cover / footer |
| Table header (OS) | `#1e3a5f` | `th` BRD/SRS OS |
| Product PRIMARY (cursorrules) | `#1E40AF` | Chỉ metric trên file `00_…`; **không** là accent cover chính |
| Surface | `#FFFFFF` | `.doc-page` |

### 2.3 Font (AS-IS)

```text
@font: 'Be Vietnam Pro' (Google Fonts CDN)
@fallback: 'Segoe UI', Arial, sans-serif
@mono (OS only): Consolas, Monaco
```

Cover title: weight 800–900 · doc-label uppercase letter-spacing ~3–3.5px.

---

## 3. Root cause (docs / generator — không product UI)

1. Shell Bateco/TSCAir lịch sử gắn **vendor UNICOM** (logo + mã tài liệu `UNICOM/…` + footer công ty).
2. `scripts/build-brd-xevn-html.mjs` / `build-srs-xevn-html.mjs` + `scripts/lib/doc-tscair-shell.mjs` hardcode `LOGO = …/logo-unicom.png` và chuỗi UNICOM.
3. Bộ HRM Mobile HTML hand-authored cùng visual language UNICOM.
4. Brand XeVN đã có master asset nhưng **chưa** đưa vào pipeline client-delivery.

---

## 4. Đề xuất cover template chuẩn XeVN (mô tả — chưa rewrite HTML)

### 4.1 Cấu trúc trang bìa (A4 portrait `210mm × 297mm`)

```
┌─────────────────────────────────────────────┐
│  accent-bar (XeVN primary → secondary)      │  6–8px
├─────────────────────────────────────────────┤
│  header-left: mã TL XeVN/…                  │
│  header-right: phiên bản · tháng/năm        │
├─ divider ───────────────────────────────────┤
│                                             │
│              [ XeVN logo ]                  │  max-width ~220–280px
│                 (master)                    │  nền trắng: ưu tiên
│                                             │    bản logo có đủ clear-space
│              ── sep ──                      │  3px gradient
│           DOC-LABEL (uppercase)             │
│         Project title (XeVN + tên TL)       │
│              subtitle 1 dòng                │
│           meta: khách hàng / phạm vi        │
│                                             │
├─ footer ────────────────────────────────────┤
│  left: XeVN Group (hoặc đơn vị TL)          │
│  right: © năm — bản gửi khách               │
└─────────────────────────────────────────────┘
```

**Quy tắc brand (proposal):**

| Rule | Chi tiết |
|------|----------|
| Logo SoT | Copy `assets/brand/xevn-logo-master.png` → `docs/client-delivery/assets/xevn-logo.png` |
| Cover img | `src="assets/xevn-logo.png"` (file HTML tĩnh) hoặc base64 từ **xevn-logo** trong generator |
| Không | Logo UNICOM trên bìa gửi khách XeVN; trừ phụ lục “đơn vị triển khai” nếu sponsor yêu cầu dual-mark |
| Dual-mark (tuỳ chọn P1) | Footer nhỏ: “Phát triển bởi Unicom…” — **không** thay logo hero |
| Nền cover | `#FFFFFF`; nếu dùng master blue-on-black cần bản transparent / inverted cho print trắng (SA chốt với design) |

### 4.2 CSS token proposal (merge vào `XEVN_BRAND_UIUX_PROPOSAL.md`)

Tham chiếu `.cursorrules` Luxury + asset README splash `#000000` cho mark tối.

```css
:root {
  /* Product / docs alignment */
  --xevn-primary: #1E40AF;      /* PRIMARY — .cursorrules */
  --xevn-primary-soft: #3B82F6; /* optional mid for gradient */
  --xevn-secondary: #0EA5E9;    /* cyan support — map từ #0ab4d8 cũ nếu giữ continuity */
  --xevn-ink: #0D1E34;          /* giữ ink hiện tại (đọc tốt trên trắng) */
  --xevn-muted: #4A6080;
  --xevn-hairline: #EAEFF8;
  --xevn-surface: #FFFFFF;
  --xevn-table-head: #1E3A5F;   /* hoặc derive từ primary */

  --xevn-font-sans: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif;
  --xevn-logo-cover-max: 260px;
  --xevn-accent-bar-h: 8px;
}

.doc-page.cover .accent-bar {
  height: var(--xevn-accent-bar-h);
  background: linear-gradient(90deg, var(--xevn-primary), var(--xevn-secondary));
}
.doc-page.cover .sep {
  background: linear-gradient(90deg, var(--xevn-primary), var(--xevn-secondary));
}
.doc-page.cover .project-title .brand {
  background: linear-gradient(135deg, var(--xevn-primary), var(--xevn-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.doc-page.cover .logo-wrap img {
  width: var(--xevn-logo-cover-max);
  height: auto;
}
```

**Migration accent:** P0 ưu tiên `--xevn-primary: #1E40AF` thay `#3d7de8` trên accent-bar / title gradient / h1 border; cyan secondary có thể giữ `#0ab4d8` hoặc chuẩn hoá `#0EA5E9` (SA quyết 1 lần).

### 4.3 Snippet mẫu cover (evidence only — không apply vào HTML production)

```html
<!-- MẪU — không thay file khách trong wave này -->
<div class="doc-page cover">
  <div class="accent-bar"></div>
  <div class="header">
    <div class="header-code">Mã tài liệu: <span>XEVN/BRD-OS-001</span></div>
    <div class="header-right">Phiên bản x.y · Tháng …/20..</div>
  </div>
  <div class="divider"></div>
  <div class="main">
    <div class="logo-wrap">
      <img src="assets/xevn-logo.png" alt="XeVN" width="260" height="auto"/>
    </div>
    <div class="sep"></div>
    <div class="doc-label">BUSINESS REQUIREMENTS DOCUMENT (BRD)</div>
    <h1 class="project-title">
      <span class="brand">XeVN</span>
      <span class="sep-dot">/</span>
      <span class="rest">ECOSYSTEM OS</span>
    </h1>
    <p class="subtitle">Nền tảng đa công ty — Cổng Web · XBOS · HRM · Logistic</p>
    <div class="meta-info">
      <strong>Khách hàng:</strong> Tập đoàn XeVN Group
    </div>
  </div>
  <div class="footer">
    <div class="footer-l">XeVN Group</div>
    <div class="footer-r">© 2026 — Bản gửi khách hàng</div>
  </div>
</div>
```

---

## 5. Copy-ready section — SA merge vào `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md`

> **Hướng dẫn SA:** Dán nguyên khối dưới vào proposal (tạo file nếu chưa có). Giữ heading cấp tương thích mục lục proposal.

```markdown
## HTML client-delivery — brand gap & cover standard

### Gap (inventory 2026-07-22 — BA-XEVN-HTML-BRAND-GAP-01)

| Item | AS-IS | TO-BE |
|------|-------|--------|
| Cover logo | UNICOM (`logo-unicom.png` / base64) trên **5/5** HTML | XeVN master → `docs/client-delivery/assets/xevn-logo.png` |
| Accent | `#3d7de8` → `#0ab4d8` | Primary `#1E40AF` → secondary cyan (chốt token) |
| Font | Be Vietnam Pro | **Giữ** Be Vietnam Pro (đã phù hợp VI) |
| Doc code / footer | `UNICOM/…` + Unicom Co., Ltd | `XEVN/…` + XeVN Group trên bìa; Unicom chỉ dual-mark footer nếu cần |
| Generators | `build-brd-xevn-html.mjs`, `build-srs-xevn-html.mjs`, `doc-tscair-shell.mjs` | Đổi `LOGO` path + chuỗi footer/header |
| Hand HTML | `00_…`, `01/02_…_HRM_MOBILE.html` | Cùng template cover sau khi SA chốt token |

Evidence: `docs/qa/evidence/ba-xevn-html-brand-gap-01-20260722.md`

### Cover template (structure)

1. Accent bar (primary→secondary)  
2. Header: mã tài liệu XeVN + phiên bản  
3. Hairline divider  
4. Center: **logo XeVN** → sep → doc-label → title → subtitle → meta  
5. Footer: XeVN Group | ©  

### CSS tokens (proposal)

| Token | Value | Notes |
|-------|-------|--------|
| `--xevn-primary` | `#1E40AF` | Align product Luxury PRIMARY |
| `--xevn-secondary` | `#0ab4d8` hoặc `#0EA5E9` | SA chốt 1 |
| `--xevn-ink` | `#0D1E34` | Keep |
| `--xevn-surface` | `#FFFFFF` | Cover print |
| `--xevn-font-sans` | Be Vietnam Pro + system | Keep CDN hoặc self-host later |
| Logo path | `assets/brand/xevn-logo-master.png` → `docs/client-delivery/assets/xevn-logo.png` | Copy once; regenerate base64 in shell |

### P0 acceptance criteria (HTML brand wave)

| ID | AC | PASS khi |
|----|----|----------|
| **AC-HTML-BRAND-01** | Logo bìa | 5/5 file HTML cover dùng `xevn-logo` (file hoặc base64 từ master) — **không** `logo-unicom` trên hero |
| **AC-HTML-BRAND-02** | Accent | Accent-bar + sep + title gradient dùng `--xevn-primary` (`#1E40AF`) |
| **AC-HTML-BRAND-03** | Copy path | Tồn tại `docs/client-delivery/assets/xevn-logo.png` (hash/size khớp master hoặc bản print-ready đã duyệt) |
| **AC-HTML-BRAND-04** | Generator | `pnpm docs:brd:html` + `pnpm docs:srs:html` embed logo XeVN; footer cover không còn hero UNICOM |
| **AC-HTML-BRAND-05** | Font | Vẫn Be Vietnam Pro; không đổi sang Inter/Roboto mặc định |
| **AC-HTML-BRAND-06** | Regression nội dung | Số FR / chương Bateco SRS không đổi do wave brand (chỉ shell/cover/CSS token) |

### Out of scope P0

- Rewrite toàn bộ nội dung nghiệp vụ HTML  
- Đổi brand trong `apps/**` (wave app riêng theo `assets/brand/README.md`)  
- Claim UAT/PROD readiness từ wave docs brand  

### Suggested next work_items

| ID | Owner | Việc |
|----|-------|------|
| SA-XEVN-BRAND-HTML-MERGE-01 | sa | Merge section này vào proposal + chốt secondary hex + print logo variant |
| D-DOCS-XEVN-LOGO-COPY-01 | ba-docs / devops-docs | Copy master → `docs/client-delivery/assets/xevn-logo.png` |
| D-DOCS-SHELL-XEVN-BRAND-01 | ba-docs (+ scripts) | Sửa `doc-tscair-shell` + build BRD/SRS + 3 HTML hand |
| QA-DOCS-HTML-BRAND-01 | qa | Spot-check 5 cover vs AC-HTML-BRAND-01..06 |
```

---

## 6. Handoff

### completion_report

- Đã inventory **5/5** HTML dưới `docs/client-delivery/**/*.html`.
- Kết luận brand gap: logo **UNICOM** toàn bộ; accent UNICOM blue-cyan; font Be Vietnam Pro; master XeVN chưa vào client-delivery.
- Đã đề xuất cover structure + CSS tokens + P0 AC copy-ready cho SA.
- Không sửa `apps/**`; không rewrite HTML khách (chỉ snippet mẫu trong evidence).

### next_owner

**sa** (merge proposal) · **pm** (dispatch wave sau merge)

### next_dispatch_prompt

```text
work_item_id: SA-XEVN-BRAND-HTML-MERGE-01
role: sa
entry: đọc docs/qa/evidence/ba-xevn-html-brand-gap-01-20260722.md §5
exit: merge nguyên section "HTML client-delivery — brand gap & cover standard" vào docs/program/XEVN_BRAND_UIUX_PROPOSAL.md (tạo file nếu thiếu); chốt --xevn-secondary hex + quyết định logo print (blue-on-black vs inverted); ghi quyết định trong proposal
cấm: sửa apps/**; không claim Phase1/PROD
evidence_path: docs/qa/evidence/sa-xevn-brand-html-merge-01-YYYYMMDD.md
sau đó PM: Task ba-docs D-DOCS-SHELL-XEVN-BRAND-01 theo AC-HTML-BRAND-01..06
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/ba-xevn-html-brand-gap-01-20260722.md`
