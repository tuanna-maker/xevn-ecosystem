# XeVN Brand & UI/UX — Đề xuất SoT

| Thuộc tính | Giá trị |
|------------|---------|
| **work_item_id** | `SA-XEVN-BRAND-UIUX-01` |
| **Concept khóa** | **XeVN Precision Motion** |
| **Ngày** | 2026-07-22 |
| **Owner** | SA (SoT) · PM (trình sponsor) · Dev-FE / Dev-Mobile / ba-docs (implement sau OK) |
| **Trạng thái** | **APPROVED-SPONSOR** (2026-07-22 tạm OK) — execution qua `P1-XEVN-THEME-REMASTER-PROGRAM.md` |
| **Addendum sponsor** | Chữ **sắc nét**; **cấm** màu chữ nhạt / cỡ nhỏ kiểu AI; **focus nghiệp vụ** — ít chrome thừa; **toàn bộ** màn web + mobile |
| **Evidence** | `docs/qa/evidence/sa-xevn-brand-uiux-01-20260722.md` |

---

## 0. Tóm tắt điều hành (1 trang)

**XeVN Precision Motion** = nhận diện vận tải–logistics chính xác: cánh/đường ngang đối xứng trong vòng tròn (master logo), chuyển động có kiểm soát (splash scale+fade, `active:scale`, Bezier workflow), bề mặt sáng cho tác nghiệp, vỏ tối chỉ cho khoảnh khắc thương hiệu.

| Đã chốt (plan) | Nội dung |
|----------------|----------|
| Product | **Light-first** — `PRIMARY #1E40AF`, `SURFACE #FFFFFF` (`.cursorrules` §2) |
| Dark | **Chỉ brand shell:** login / splash / bìa HTML gửi khách |
| Logo SoT | `assets/brand/xevn-logo-master.png` · sync theo `assets/brand/README.md` |
| Rollout | Tokens → HTML P0 → web login/chrome P1 → mobile splash/header P2 → business screens P3 |

**Brand test (mọi phase):** bỏ thanh điều hướng / menu — vẫn nhận ra XeVN nhờ logo cánh xanh + primary blue + (shell tối khi ở login/splash/bìa).

**Không** claim Phase 1 DONE / PROD-READY từ đề xuất này. **Không** đổi SRS nghiệp vụ hay API.

---

## 1. Audit hiện trạng (HTML · Web · Mobile)

### 1.1 Ma trận nhanh

| Bề mặt | Logo XeVN | Primary `#1E40AF` | Dark shell | Sticky glass / chrome | Gap chính |
|--------|-----------|-------------------|------------|------------------------|-----------|
| **HTML khách** (`docs/client-delivery/00_*.html`, BRD/SRS shell) | ❌ **UNICOM** (`logo-unicom.png` / data-URI) | Một phần (`#1e40af` metrics; accent `#3d7de8`) | ❌ Bìa trắng | N/A | **P0:** cấm UNICOM làm hero brand XeVN docs |
| **Web portal login** | ✅ `/xevn-logo.png` 48px | ✅ nút cứng `#1E40AF` | ❌ nền `#F9FAFB` + card trắng | N/A | **P1:** shell tối theo concept |
| **Web portal chrome** | ❌ `TopHeader` không logo | ✅ `xevn.primary` Tailwind | ❌ | ✅ `shadow-soft` + `backdrop-blur-md` + `xevn-safe-inline` | **P1:** wordmark/mark trong header |
| **HRM mobile splash** | ✅ `SplashIntro` + asset | Glow gần primary | ✅ `#000000` | N/A | **P2:** chuẩn hóa glow = token primary |
| **HRM mobile login** | ✅ `XevnLogo` | ✅ `colors.primary` | ⚠ nền light `colors.background` | Card surface | **P2:** dark shell login (option A) hoặc giữ light + hero mark lớn (option B — chọn sau P0) |
| **Mobile tokens** | — | ✅ mirror web | — | radius `input`/`card` khớp | Đã có SoT mobile: `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` |

### 1.2 HTML gửi khách — gap UNICOM (P0)

**Evidence:** `docs/client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html`

- `<title>` và header/footer lặp **UNICOM | AI SOFTWARE FACTORY**.
- Bìa: `<img src="assets/logo-unicom.png" alt="UNICOM">` — không phải master XeVN.
- Accent bar / gradient dùng `#3d7de8` / `#0ab4d8` (gần accent portal nhưng **không** khóa PRIMARY `#1E40AF` làm trục).
- Cùng pattern trên BRD/SRS HTML (`01_BRD_*`, `02_SRS_*`) và README client-delivery ghi rõ logo UNICOM.

**Kiến trúc nội dung (không nhầm vai):** UNICOM có thể còn là **nhà cung cấp / mã tài liệu** trong meta nội bộ — nhưng **không** được là logo hero trên tài liệu mang tên **XeVN OS**. Đề xuất P0: bìa + header/footer khách = **XeVN mark**; dòng “soạn bởi …” tách phụ chú nhỏ (nếu sponsor vẫn cần).

### 1.3 Web portal

| File | Phát hiện |
|------|-----------|
| `apps/web/web-portal/tailwind.config.cjs` | Palette `xevn.*` đầy đủ; `rounded-card` 12px / `rounded-input` 8px; `shadow-soft` |
| `apps/web/web-portal/src/index.css` | `.xevn-safe-inline`; glass utilities; Inter + system stack |
| `LoginPage.tsx` | Logo có; **light shell** — lệch quyết định dark shell |
| `TopHeader.tsx` | Membership / profile; **thiếu** mark XeVN → brand test FAIL nếu bỏ sidebar |
| Settings / CC panels | Sticky glass + `SETTINGS_RADIUS_*` — đã gần Luxury Style Guide |

### 1.4 Mobile HRM

| File | Phát hiện |
|------|-----------|
| `XevnLogo.tsx` | Component chuẩn; `accessibilityLabel="XeVN"`; default 72 |
| `SplashIntro.tsx` | Dark `#000`; logo 160; motion scale+fade — **đã khớp Precision Motion** |
| `theme/tokens.ts` | Mirror web; HIG touch ≥44; `iosGroupedBackground` |
| Login | Logo lớn trên nền light — chưa dark shell |

### 1.5 Peer notes (merged 2026-07-22)

| Role | Evidence | Kết luận merge |
|------|----------|----------------|
| **ba-docs** | `docs/qa/evidence/ba-xevn-html-brand-gap-01-20260722.md` | **5/5** HTML cover = UNICOM; accent `#3d7de8→#0ab4d8`; font Be Vietnam Pro; generator `build-brd/srs` + `doc-tscair-shell` hardcode logo UNICOM. P0 AC: **AC-HTML-BRAND-01..06**. Cover template §4 evidence → áp dụng P0. |
| **Dev-FE** | `docs/qa/evidence/fe-xevn-brand-token-feasibility-01-20260722.md` | Portal đã có `xevn.*` + `rounded-card/input` + `shadow-soft`. Feasible surface-by-surface (login→chrome→CC). Risk: hardcoded `#1E40AF`, HRM shadcn HSL dual theme, `gradient-text` không token. **Không** invent second token system. |
| **Dev-Mobile** | `docs/qa/evidence/mob-xevn-brand-token-feasibility-01-20260722.md` | `theme/tokens.ts` ~110 consumers; splash dark đã khớp. Drift: Android splash `#0f172a`, `colorPrimary` `#023c69`. P2 = splash/tab/header; later screens = hex cleanup. Touch ≥44 đã có trong tokens. |

**Quyết định SA sau merge:** `--xevn-secondary` / accent document HTML = **`#06B6D4`** (khớp portal `xevn.accent`); bỏ gradient UNICOM `#3d7de8` trên cover. Logo print trên nền trắng: dùng bản mark **không plate đen** (export P0) hoặc clear-space trên surface; master blue-on-black giữ cho shell tối.

---

## 2. Hệ thống logo

### 2.1 Master

| Mục | Quy tắc |
|-----|---------|
| **File SoT** | `assets/brand/xevn-logo-master.png` |
| **Hình** | Vòng tròn + cánh ngang đối xứng (3 thanh mỗi bên), xanh primary trên nền đen, stroke sáng mỏng |
| **Ý nghĩa** | Chuyển động có khung (Precision Motion) — vận tải / hệ sinh thái / ổn định |
| **Sync** | Copy theo bảng `assets/brand/README.md` → portal / HRM web / X-BOS / mobile `icon`·`splash`·`xevn-logo.png` |

### 2.2 Clear space & kích thước tối thiểu

| Quy tắc | Giá trị | Ghi chú |
|---------|---------|---------|
| **Bounding box** | Đo từ **đầu cánh ngoài cùng**, không chỉ bán kính vòng | Cánh vượt vòng |
| **Clear space** | ≥ **¼ chiều cao bounding box** bốn phía | Không text / control đụng cánh |
| **Favicon / tab** | ≥ **16×16** CSS px (asset nguồn ≥32) | Stroke mỏng — tránh scale quá nhỏ |
| **Header web** | Mark ≥ **32×32**; khuyến nghị **40×40** | Kèm wordmark «XeVN» semibold |
| **Login / splash web** | Mark ≥ **64×64** (splash HTML/cover ≥ **120**) | Dark shell |
| **Mobile splash** | Giữ **160** (hiện tại `SplashIntro`) | |
| **Mobile chrome** | Mark ≥ **28**; touch row ≥ **44** | |

### 2.3 Biến thể nền

| Nền | Biến thể | Quy tắc |
|-----|----------|---------|
| **Đen / near-black** (`#000`–`#0B1220`) | Master full-color (như file SoT) | **Shell bắt buộc** cho splash / login brand / bìa dark |
| **Trắng / surface** | Full-color **hoặc** mark không nền đen trong PNG | Không đặt PNG nền đen nguyên khối lên header trắng |
| **Primary blue** | Mark trắng / knockout (cần export P0 nếu thiếu) | Chỉ badge đặc biệt — không thay master |
| **Ảnh / gradient ồn** | Mark trong vòng tròn đen 8–12% padding | Clear space giữ |

### 2.4 Cấm tuyệt đối

1. **Logo UNICOM** làm hero / bìa / favicon / splash của tài liệu hoặc app **XeVN**.
2. Kéo mép cắt cánh; xoay lệch trục; đổ bóng 3D / glow neon marketing.
3. Đổi hue primary lệch `#1E40AF` trên mark chính thức.
4. Chèn logo đối tác lớn hơn mark XeVN trên cùng hàng chrome.

---

## 3. Design tokens (CSS vars · Tailwind · React Native)

> **SoT runtime (law):** [`ADR-XEVN-THEME-SHARP-OPS-20260722.md`](../architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md) — locks **L-CONTRAST / L-TYPE / L-OPS**. FE-00 / MOB-00 **must** implement that ADR; bảng dưới = mirror brand. Không đổi API.
>
> **AS-IS drift (2026-07-22):** portal `xevn.text` vẫn `#1F2937`, `textSecondary` vẫn `#6B7280`; mobile `tokens.ts` mirror — **cấm** giữ; migrate → `#111827` / `#4B5563`, demote `#6B7280` → **muted only**.

### 3.1 Màu

| Token | Hex | CSS var | Tailwind / class | RN (`tokens.ts`) | Dùng |
|-------|-----|---------|------------------|------------------|------|
| Primary | `#1E40AF` | `--xevn-color-primary` | `xevn-primary` | `colors.primary` | CTA, link, mark |
| Primary pressed | `#1E3A8A` | `--xevn-color-primary-pressed` | (extend) | `primaryPressed` | Pressed |
| Accent | `#06B6D4` | `--xevn-color-accent` | `xevn-accent` | `accent` | Focus ring, highlight |
| Success | `#10B981` | `--xevn-color-success` | `xevn-success` | `success` | DNA Active |
| Warning | `#F59E0B` | `--xevn-color-warning` | `xevn-warning` | `warning` | DNA Pending |
| Danger | `#EF4444` | `--xevn-color-danger` | `xevn-danger` | `danger` | DNA Error |
| Info | `#3B82F6` | `--xevn-color-info` | `xevn-info` | `info` | Informational |
| Surface | `#FFFFFF` | `--xevn-color-surface` | `xevn-surface` | `surface` | Card / form |
| Background | `#F9FAFB` | `--xevn-color-background` | `xevn-background` | `background` | App canvas light |
| Text | **`#111827`** | `--xevn-color-text` | `xevn-text` | `text` | Body / table value — **sắc nét** (thay `#1F2937`) |
| Text secondary | **`#4B5563`** | `--xevn-color-text-secondary` | `xevn-textSecondary` | `textSecondary` | Hint đọc được — **cấm** `#9CA3AF` / `slate-400` / giữ `#6B7280` làm secondary |
| Text muted | **`#6B7280`** | `--xevn-color-text-muted` | `xevn-textMuted` | `textMuted` | **Chỉ** placeholder / icon phụ — **không** label bảng / body |
| Border | `#E5E7EB` | `--xevn-color-border` | `xevn-border` | `border` | Divider |
| Brand shell bg | `#000000` | `--xevn-color-brand-shell` | (utility) | splash `#000` | Login/splash/bìa dark |
| Grouped (iOS) | `#F2F2F7` | — | — | `iosGroupedBackground` | Mobile list only |

**Ban (ops readable):** `text-slate-400`, `text-gray-400`, `text-muted-foreground` trên body/label/cell — chi tiết ADR §5.

**WCAG:** chữ trên primary / danger ≥ 4.5:1; trạng thái **không** chỉ dựa vào màu (icon + text) — `uiux-quality-accessibility.mdc`.

### 3.2 Radius · shadow · spacing

| Token | Giá trị | CSS var | Web | RN |
|-------|---------|---------|-----|-----|
| Radius input | `8px` | `--xevn-radius-input` | `rounded-input` | `radius.input` |
| Radius card | `12px` | `--xevn-radius-card` | `rounded-card` | `radius.card` |
| Shadow soft | `0 4px 24px -4px rgba(15,23,42,0.08)` | `--xevn-shadow-soft` | `shadow-soft` | elevation map tương đương |
| Shadow overlay | `0 25px 50px -12px rgba(15,23,42,0.18)` | `--xevn-shadow-overlay` | `shadow-overlay` | modal |
| Space xs…3xl | 4 / 8 / 16 / 24 / 32 / 48 / 64 | `--xevn-space-*` | Tailwind `spacing` extend | `spacing.*` |
| Safe inline | clamp ~20–32px | (utility) | `.xevn-safe-inline` | `layout.screenPaddingH` 16 (mobile) |

### 3.3 Typography (L-TYPE floors)

| Cấp | Web | Mobile | Ghi chú |
|-----|-----|--------|---------|
| Family product | Inter + system | System / SF Pro | Brand **shell** HTML: Be Vietnam Pro OK |
| Body ops | **≥15px** (ưu tiên **16px**); table **≥14px** | **≥17** body | **Cấm** `text-xs` / `text-[11px]` cho nghiệp vụ chính |
| Title page | **≥20px** bold/semibold, h-10 axis với search | title2/title1 | `.cursorrules` Header Axis |
| Label form | **≥14px** medium, màu ≥ `#4B5563` | ≥15 (footnote 13 chỉ chrome field) | Không label xám nhạt / muted |
| Tabular nums | `tabular-nums` tiền / số liệu | `fontVariant` | Locale vi-VN — `UX_VI_DATE_NUMBER_FORMAT_AC.md` |
| L-OPS | 1 title + 1 vùng data + CTA rõ | Cùng nguyên tắc | Cấm stats-strip / pill cluster che form — ADR §4.4 |

### 3.4 Motion (Precision Motion)

| Token ý niệm | Web | Mobile |
|--------------|-----|--------|
| Press | `active:scale-95` / `0.99` | Press opacity + HIG |
| Enter | fade/slide 200ms ease-out | Splash 650ms + spring |
| Workflow edge | Bezier; reject = dashed | N/A |
| **Cấm** | Parallax nặng, confetti, infinite neon pulse trên form nghiệp vụ | Giữ splash một lần cold start |

---

## 4. Signature patterns

### 4.1 Dark brand shell (login / splash / HTML cover)

```
[ nền #000 ]
     │
     ▼
[ Mark XeVN ≥ clear space ]  ← hero duy nhất
     │
     ▼
[ Wordmark / 1 dòng phụ ngắn ]  (tuỳ chọn)
     │
     ▼
[ Form / CTA trong card surface hoặc input sáng tương phản ]
```

- **Brand test:** bỏ mọi nav — vẫn XeVN.
- Web login **đích:** đổi từ `#F9FAFB` → shell đen + card form (P1).
- HTML bìa **đích:** dark hoặc light-with-XeVN-mark; **không** UNICOM hero (P0).

### 4.2 Light product chrome

- Nền `background` / surface trắng; primary chỉ accent.
- Header: mark 32–40 + tên sản phẩm; `xevn-safe-inline`; sticky `bg-white/80 backdrop-blur-md shadow-soft`.
- Grid 12 · neo 4-4-4; header title + search cùng trục `h-10`.

### 4.3 List → detail

- Master–detail (1/4–3/4) hoặc stack mobile; deep link giữ scope (ADR scope — ngoài brand nhưng không phá).
- Empty / loading / error có copy + recovery — không spinner vô hạn.

### 4.4 Sticky glass

- Sticky header/footer: `backdrop-blur-md` + `bg-surface/80` (+ border nhẹ).
- Không glass trên toàn page scroll (mệt mắt / a11y).

---

## 5. Ánh xạ Apple HIG (nguyên tắc — không copy pixel)

| Nguyên tắc HIG | Áp dụng XeVN Precision Motion |
|----------------|-------------------------------|
| Clarity | Primary một màu; type đủ cỡ; icon + label trạng thái |
| Deference | Content (bảng NV, phiếu duyệt) trên brand chrome; logo không tranh với data |
| Depth | Shadow soft / overlay có tầng; không flat “dashboard SaaS tím” |
| Touch ≥ 44pt | Mobile `touchTargetMin: 44` — giữ |
| System materials | Sticky glass ≈ material mỏng — không blur toàn màn |
| Motion purposeful | Splash + press feedback; không animation trang trí form |
| Dark Mode hệ thống | **Không** bật dark mode toàn app Phase này — dark chỉ shell thương hiệu |
| SF font | Mobile System; web Inter — chấp nhận dual; không nhồi font display marketing vào form |

Tham chiếu mobile chi tiết: `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` (không thay đề xuất brand này; **bổ sung** lớp identity).

---

## 6. Rollout — **FULL FE remaster** (sponsor lock 2026-07-22)

> **Sponsor:** duyệt concept + *«không còn UNICOM»* + *muốn sửa **toàn bộ FE web lẫn mobile*** — nhìn một cái nhận logo/DNA XeVN; **popup, border, đường viền** cũng trong phạm vi.  
> P0–P3 ban đầu chỉ là **cửa vào**; SoT thi công = chương trình **Full FE Remaster** (layer → mọi màn), không dừng ở login/header.  
> Chi tiết wave: `docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md`.

### 6.0 Lớp thi công (bắt buộc — không “vài màn”)

| Layer | Phạm vi | Web | Mobile |
|-------|---------|-----|--------|
| **L0** | HTML khách + generators (UNICOM purge) | ba-docs | — |
| **L1** | Design tokens SoT (color/radius/border/shadow/type/motion) | Tailwind + CSS vars | `theme/tokens.ts` |
| **L2** | **Primitives** — Button, Input, Card, Table, Dialog/Modal/Drawer, Toast, Tabs, Badge, Empty/Error | mọi `apps/web/**` UI kit | mọi `components/ui` + overlays |
| **L3** | **Shell** — login dark, splash, topbar/sidebar/tabbar, brand mark mọi chrome | portal + HRM embed + x-bos | splash/login/headers/tabs |
| **L4** | **All business screens** — CC, XBOS, HRM embed, settings… bind primitives (không hex cứng) | full FE | full ESS + manager |
| **L5** | QA brand test + a11y + U65 regression theo module | QA | qa-device |

**Brand test (mọi layer):** bỏ nav / đọc blur popup — vẫn nhận XeVN (primary + radius DNA + mark khi shell).

### P0 — Design tokens + HTML khách (ưu tiên sponsor)

| Việc | Owner gợi ý | AC |
|------|-------------|-----|
| Xuất CSS vars SoT (doc + optional `:root` snippet trong proposal đã có bảng) | Dev-FE (sau OK) | Bảng §3 được PM/sponsor xác nhận |
| Copy `xevn-logo-master` → `docs/client-delivery/assets/xevn-logo.png` | ba-docs / DevOps docs | File tồn tại; README client-delivery cập nhật |
| Thay hero UNICOM → XeVN trên `00_Mo_ta_he_sinh_thai_XEVN.html` (+ template shell nếu dùng chung) | ba-docs | Grep bìa: **0** `logo-unicom` ở hero; alt «XeVN» |
| Header/footer khách: «XeVN OS» thay hero UNICOM | ba-docs | Brand test trang bìa PASS |
| Khóa accent bar bìa về `#1E40AF` → `#06B6D4` (khớp portal) | ba-docs | Không còn `#3d7de8` làm trục bìa XeVN |
| Generator BRD/SRS + 3 HTML hand | ba-docs | **AC-HTML-BRAND-01..06** (evidence ba-docs) — 0 `logo-unicom` hero; `docs/client-delivery/assets/xevn-logo.png` tồn tại |

**AC phase P0:** Mở HTML bìa trong browser — nhận XeVN không cần đọc title dài; **cấm** UNICOM làm logo chính.

### P1 — Web login + chrome

| Việc | AC |
|------|-----|
| `LoginPage` dark shell + mark ≥64 + form card | Screenshot brand test PASS |
| `TopHeader` (và shell tương đương HRM/X-BOS nếu cùng wave) gắn mark + wordmark | Bỏ sidebar vẫn nhận XeVN |
| Favicon / `public/xevn-logo.png` = sync master | Hash/visual khớp master |
| Không regression UF login (vẫn 2xx + redirect) | QA smoke login `ceo@xe.vn` |

### P2 — Mobile splash / header

| Việc | AC |
|------|-----|
| Splash giữ dark; glow dùng alpha của `#1E40AF` | Visual + cold start 1 lần |
| Login: dark shell **hoặc** light + mark ≥88 (chốt option khi P0 OK) | Brand test |
| Header/tab: mark nhỏ hoặc tint primary nhất quán | Không UNICOM / asset lệch |
| Touch target không giảm dưới 44 | QA-device spot |

### P3 — Business screens (polish)

| Việc | AC |
|------|-----|
| Thay hardcoded hex lệch token → token | Grep giảm `#1E40AF` rải rác không qua token |
| Empty/error illustration nhẹ theo cánh/primary | Không stock “generic SaaS” |
| Sticky glass đồng bộ settings/CC | Pattern §4.4 |
| **Không** redesign SRS flow / không đổi copy nghiệp vụ trừ brand string | Diff chỉ UI token/chrome |

**Gate chung mọi phase:** U65 zero-seed; QA browser/device theo UF — không PASS chỉ vì đổi CSS.

---

## 7. Ngoài phạm vi (Out of scope)

| Ngoài scope | Lý do |
|-------------|--------|
| Viết lại SRS/UC/BR nghiệp vụ | Brand ≠ remaster FR |
| Đổi API / OpenAPI / scope resolver | Không thuộc UI identity |
| Claim Phase 1 DONE / UAT-PASS / PROD-READY | Chỉ proposal + AC phase |
| Dark mode toàn hệ thống | Chỉ shell; HIG dark OS = phase sau |
| Thay font product sang display marketing | Giữ Inter/System; HTML cover có thể Be Vietnam Pro |
| Pixel-copy Apple / Workday UI kit | Chỉ nguyên tắc HIG + token XeVN |
| Seed data để “có màn đẹp” | U65 |

---

## 8. Quyết định kiến trúc (options)

| Option | Mô tả | Khi nào |
|--------|--------|---------|
| **A — Recommend** | Dual-surface: dark shell brand + light product; logo master một SoT; HTML P0 trước web/mobile | Mặc định plan đã chốt |
| B | Light-only mọi nơi (kể login) | Từ chối — lệch master logo (thiết kế trên đen) + concept Motion |
| C | Full dark product | Từ chối — phá `.cursorrules` light-first + mật độ bảng HRM |

**Khuyến nghị:** Option A. Rollout P0→P3 như §6. Implement **chỉ sau** sponsor «OK / làm P0».

---

## 9. Rủi ro & giảm thiểu

| Rủi ro | Mức | Mitigation |
|--------|-----|------------|
| HTML BRD/SRS build pipeline nhúng lại UNICOM | P0 | Sửa shell generator (`doc-tscair-shell` / assets) + AC grep |
| PNG master nền đen lộ khung trên header trắng | P1 | Export biến thể transparent / trim; QA visual |
| Dev hardcode hex song song token | P3 | Lint/grep gate nhẹ; CODE-MEMORY token path |
| Đụng regression login | P1 | QA UF login trước merge |
| Nhầm đề xuất = đã ship brand | — | Trạng thái PROPOSAL trên header doc |

---

## 10. Validation & evidence plan

| Phase | Evidence path gợi ý | Ai |
|-------|---------------------|-----|
| SoT (này) | `docs/qa/evidence/sa-xevn-brand-uiux-01-20260722.md` | SA |
| P0 HTML | `docs/qa/evidence/ba-xevn-brand-html-p0-*.md` | ba-docs + QA spot |
| P1 web | `docs/qa/evidence/fe-xevn-brand-login-chrome-*.md` | Dev-FE → QA |
| P2 mobile | `docs/qa/evidence/mob-xevn-brand-splash-*.md` | Dev-Mobile → qa-device |

---

## 11. Liên kết SoT

| Artifact | Path |
|----------|------|
| **Theme sharp ADR (runtime law)** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` |
| Remaster program | `docs/program/P1-XEVN-THEME-REMASTER-PROGRAM.md` |
| Master logo + sync | `assets/brand/README.md` |
| Luxury UI law | `.cursorrules` §2 |
| A11y + vi-VN format | `.cursor/rules/uiux-quality-accessibility.mdc` |
| Mobile DS | `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` |
| Sample HTML gap | `docs/client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html` |
| Web tokens | `apps/web/web-portal/tailwind.config.cjs` |
| Mobile logo | `apps/mobile/hrm-mobile/src/components/brand/XevnLogo.tsx` |

---

*Document owner: Solution Architect · XeVN Ecosystem · SA-XEVN-BRAND-UIUX-01*
