# XeVN Mobile — Design System Direction (benchmark chi tiết)

**work_item_id:** `PCOMP-W4-MOB-DS-01`  
**Ngày:** 2026-06-07  
**Owner:** PM · Dev-Mobile (implement) · Dev-FE (web parity) · QA-Device (evidence)  
**Nguồn benchmark:** Workday Canvas Mobile, Apple HIG, SAP SFUX, BambooHR, Personio  
**Liên kết:** `MOBILE_HRM_BENCHMARK_TOP_APPS.md` · `MOBILE_IOS_UX_INHERITANCE_PLAN.md` · U46

> **Mục tiêu:** Một **định hướng chung duy nhất** cho XeVN HRM mobile — đủ chi tiết đến font, cỡ chữ, vị trí nút, navigation, một/tay hai tay — **không** copy 1:1 bất kỳ vendor nào.

---

## 0) Quyết định sản phẩm (1 trang cho sponsor)

| Khía cạnh | Quyết định XeVN | Lý do (benchmark) |
|-----------|-----------------|-------------------|
| **Phân khúc UX** | Personio/BambooHR (employee ESS) + Workday patterns cho manager | Quy mô pilot 1k NV; không cần SF enterprise theme manager |
| **Navigation gốc** | **4 tab bottom** cố định — không hamburger top | Workday Canvas + Apple HIG + thumb-zone research |
| **Typography** | **SF Pro System** (iOS) · Roboto (Android) · scale 4pt grid | Canvas baseline 4px; iOS body 17pt |
| **Một tay** | Primary action **bottom 40%** màn hình | UIGuides thumb zone; Workday «Design for Thumbs» |
| **Hai tay** | Calendar drag range, form dài — optional | BambooHR kéo chọn ngày trên calendar |
| **Web parity** | Logic + label + màu từ HRM embed; layout mobile-native | Workday: không 1:1 web→mobile |
| **Phase 2** | Home hub widgets, unified manager inbox, search | Workday 2026R1 search-centric — sau core flows |

---

## 1) Typography — từng cấp (pt / dp)

**Baseline grid:** 4pt (Workday Canvas). **Minimum readable:** 13pt caption; **không dùng 11pt** (Workday min 14px ≈ 13–14pt).

| Token | iOS (pt) | Weight | Line height | Dùng ở đâu | Benchmark ref |
|-------|----------|--------|-------------|------------|---------------|
| `largeTitle` | **34** | Bold (700) | 41 | Native stack header (large title) | Apple HIG Large Title |
| `title1` | **28** | Bold | 34 | Màn hero (tên NV trên LeaveHeroCard) | SFUX card title |
| `title2` | **22** | Semibold (600) | 28 | Section header trong grouped list | Workday section 24px gap |
| `title3` | **20** | Semibold | 25 | Card title (loại nghỉ trên list row) | BambooHR category name |
| `body` | **17** | Regular (400) | 22 | Nội dung chính, giá trị DetailRow | **iOS default body** (không 16) |
| `callout` | **16** | Regular | 21 | Subtitle list row (date range) | Personio list secondary |
| `subhead` | **15** | Regular | 20 | Hint, empty state | BambooHR widget desc |
| `footnote` | **13** | Medium (500) | 18 | Label field (Từ ngày, Lý do) — **uppercase optional bỏ** | Canvas label; tránh ALL CAPS khó đọc tiếng Việt |
| `caption` | **12** | Medium | 16 | Tab bar label, badge meta | Apple tab ~10pt; min 12 XeVN |
| `tabLabel` | **10** | Medium | 12 | Chỉ tab bar (system convention) | HIG tab bar |

**Mapping hiện tại → target** (`tokens.ts`):

| Hiện tại | Target | Action |
|----------|--------|--------|
| `fontSize.base` 16 | **17** (`body`) | Bump body default |
| `fontSize.xs` 12 label ALL CAPS | **13** footnote, sentence case | DetailRow refactor |
| `fontSize['2xl']` 24 title | **22–28** theo context | AppScreenLayout title → title2 |

**Dynamic Type:** Phase 2 — test AX1 (iOS larger text); layout stack vertical khi font +2.

**Số & tiền:** `tabular-nums` equivalent — `fontVariant: ['tabular-nums']` cho payslip amounts (SFUX financial clarity).

---

## 2) Màu & contrast

Giữ palette XeVN web (`#1E40AF` primary) — đã mirror trong `tokens.ts`.

| Role | Hex | Usage |
|------|-----|--------|
| Background default | `#F9FAFB` | Plain scroll screens |
| Background grouped | `#F2F2F7` | iOS Settings-style lists |
| Surface card | `#FFFFFF` | Inset grouped sections |
| Text primary | `#1F2937` | Body |
| Text secondary | `#6B7280` | Labels, hints |
| Separator | `#C6C6C8` | iOS hairline between rows |

**Status badges:** giữ tone map hiện tại; **min contrast 4.5:1** text on bg (WCAG AA).

**Primary button:** nền `#1E40AF`, chữ `#FFFFFF`; pressed `#1E3A8A`; disabled `#93C5FD` + opacity 0.6.

---

## 3) Spacing & layout grid

| Token | Value | Usage |
|-------|-------|--------|
| `screenPaddingH` | **16pt** | Content margin (Workday mobile margin 24px → 16pt phone VN) |
| `screenPaddingBottom` | **24pt** + safe area | Above tab bar |
| `sectionGap` | **24pt** | Between SurfaceCard / sections (Canvas space.x6) |
| `itemGap` | **12pt** | Inside card between rows |
| `inlineGap` | **8pt** | Icon + text |
| `chipGap` | **8pt** | Filter chips horizontal |
| `cardPadding` | **16pt** | All SurfaceCard |
| `listRowMinHeight` | **56pt** | Touch-friendly list (Material 56dp) |
| `touchTargetMin` | **44pt** | Apple HIG minimum |
| `touchTargetComfort` | **48pt** | Workday/Material recommended primary |

**Corner radius:** input/chip **8pt** · card **12pt** · bottom sheet top **16pt** · full-screen modal **0 top**.

**Full-bleed:** Tab bar + sticky footer full width; content respects safe area.

---

## 4) Navigation architecture (chi tiết)

### 4.1 Bottom tab bar (4 tabs — **không thêm tab 5**)

| Tab | Icon (Ionicons) | Label VI | Stack depth max | Benchmark |
|-----|-----------------|----------|-----------------|-----------|
| Trang chủ | `home` / `home-outline` | Trang chủ | 2 | Personio Home widgets |
| Chấm công | `time` / `time-outline` | Chấm công | 2 | BambooHR Time Clock |
| Đơn công | `document-text` / `document-text-outline` | Đơn công | 3 | Workday absence hub |
| Thêm | `menu` / `menu-outline` | Thêm | 3 | SF Browse / settings |

**Tab bar spec:**

- Height: 49pt + `safeAreaInsets.bottom`
- Icon: **24×24pt** active filled, inactive outline
- Label: **10pt** medium, max 1 line
- Active tint: `#1E40AF`; inactive: `#6B7280`
- **Không ẩn tab bar** khi drill-down stack (HIG: user biết context) — trừ full-screen modal create
- Badge: manager pending count on «Thêm» only (đã có)

### 4.2 Stack vs modal (Workday Canvas rule)

| Pattern | XeVN screen | Transition |
|---------|-------------|------------|
| **View stack** | List → Detail (leave, payslip, history) | iOS push + swipe-back |
| **Full-screen modal** | Create leave 4-step wizard | slide from bottom, dismiss Cancel top-left |
| **Bottom sheet** | Date picker (`HrmDateField`), filter sort | half-height, tap outside dismiss |
| **Alert / confirm** | Hủy đơn fail-closed | native `Alert` — destructive button **not** default |

**Max drill depth:** **3** (Workday shallow stack). Ví dụ: Tab → Leave list → Detail ✅. Tab → More → Payslip list → Detail ✅.

### 4.3 Top bar (native stack)

- **Back:** system chevron only — không custom «Quay lại» text dài
- **Title:** truncated center · large title on list roots (Phase UX-03)
- **Right actions:** max **2** icon buttons (Edit, Filter) — text button «Sửa» OK for pending leave
- **Không** đặt primary Submit trên top-right (ngoài tầm ngón cái)

---

## 5) Ergonomics — một tay vs hai tay

### 5.1 Thumb zone map (iPhone 6.1" portrait)

```text
┌─────────────────────────┐  ← TOP 20%: khó (status, destructive, back OK)
│  ← Back    Title    ⋮   │
├─────────────────────────┤  ← MIDDLE 40%: stretch (content scroll)
│                         │
│   Hero / metrics        │
│   (scrollable)          │
│                         │
├─────────────────────────┤  ← BOTTOM 40%: EASY (primary actions)
│ [ Sticky CTA full width]│
│ [ Filter chips row     ]│
│ ═══ Tab bar ═══════════ │
└─────────────────────────┘
```

| Action type | Vị trí | Tay |
|-------------|--------|-----|
| Tab switch | Bottom bar | **1 tay** |
| Check-in primary | Home card / bottom CTA | **1 tay** |
| Gửi đơn nghỉ | Sticky footer wizard step 4 | **1 tay** |
| Filter chips | Below header, above list | **1 tay** |
| Calendar chọn range | Bottom sheet | **1–2 tay** (drag range = 2 tay OK) |
| Duyệt / Từ chối (manager) | Row swipe **hoặ** bottom sheet actions | **1 tay** (UX-03) |
| Hủy đơn (destructive) | Top-right Edit menu → confirm | **2 tay intentional** |
| Payslip scroll | Full scroll | **1 tay** |

### 5.2 Gestures (chuẩn platform — không invent)

| Gesture | Behavior |
|---------|----------|
| Swipe edge left | Pop stack |
| Pull down | Refresh list |
| Swipe row (future) | Quick approve manager |
| Long press | **Không** dùng phase 1 |

---

## 6) Components — spec từng loại

### 6.1 Primary button (`PrimaryButton`)

- Height **48pt**, width 100% (minus 32pt horizontal pad)
- Radius **12pt**, label **17pt semibold**
- Position: **sticky footer** above safe area (wizard, check-in)
- Loading: spinner inline, disable double-tap

### 6.2 List row (`ListRow`)

- Min height **56pt**, padding H **16pt**
- Title: title3 20pt semibold
- Subtitle: callout 16pt secondary color
- Trailing: StatusBadge or chevron `›` 14pt secondary
- Separator: inset left **16pt** (iOS grouped) or full-bleed plain list

### 6.3 Filter chips (leave list)

- Height **36pt**, padding H **12pt**, radius **18pt** (pill)
- Active: primary bg + white text; inactive: `#E5E7EB` bg
- Horizontal `ScrollView` — **không wrap** xuống 2 hàng (tiết kiệm vertical)

### 6.4 Leave detail (post UX-02 — polish UX-03)

- **LeaveHeroCard:** avatar 48pt circle, title1 name, footnote code/dept, badge top-right
- **DetailMetricGrid:** 2×2, cell min 72pt, label footnote 13pt, value body 17pt semibold
- **DetailNoteBlock:** padding 12pt, radius 8pt, bg `#F3F4F6`
- **Timestamps:** caption 12pt secondary at section bottom

### 6.5 Empty / error / loading

- Empty: subhead 15pt + illustration optional (Phase 3)
- Error banner: danger bg, **17pt** body — không chỉ 14pt
- Loading: skeleton rows Phase 3; hiện spinner centered OK

---

## 7) So sánh vendor — chi tiết micro-decisions

| Micro-decision | Workday | BambooHR | Personio | **XeVN chọn** |
|----------------|---------|----------|----------|---------------|
| Tab count | 3–4 hub | 4–5 bottom | 4 bottom | **4** (giữ) |
| Request entry | Hub + search | Home button | Home widget | **Home CTA + tab Đơn** (UX-02b) |
| Date pick | Native picker modal | Calendar drag | Calendar | **Bottom sheet calendar** (UX-02) |
| Balance show | In absence hub | Under category | On type select | **Step 2 wizard** placeholder |
| Label style | Sentence case | Sentence | Sentence | **Sentence case VI** — bỏ ALL CAPS |
| Body size | 18px target | ~16–17 | ~16–17 | **17pt iOS** |
| Section spacing | 24px | Generous whitespace | Card widgets | **24pt section / 16pt card pad** |
| Manager inbox | My Tasks tab | Home inbox filters | Push tasks | **More → Duyệt** + badge (UX-03 unify) |
| Destructive | High placement | Trash in edit flow | Edit screen | **Confirm dialog** — not bottom |

---

## 8) Implementation waves (team dispatch)

| Wave | ID | Scope | Owner |
|------|-----|-------|-------|
| ✅ Done | MOB-UX-01/02 | Formatters, leave hero, wizard | Dev-Mobile |
| **Next** | **MOB-UX-03** | Apply **§1–§6 tokens** globally: typography bump, footnote labels, sticky CTAs, list 56pt, chip spec, large titles | Dev-Mobile |
| **Next** | **MOB-UX-02b** | Home hub §3.2 benchmark (Personio widgets) | Dev-Mobile |
| **Next** | **MOB-UX-03b** | Manager inbox unified + thumb-zone approve | Dev-Mobile |
| QA | QA-MUX-03 | AC-DS-01..10 + J-MOB screenshot matrix | QA-Device |
| ✅ Done | **FE-DS-01** (`PCOMP-W4-FE-DS-01`) | §10 web HRM Tailwind/shadcn ↔ mobile token map + gaps | Dev-FE |

### Acceptance — Design System (AC-DS)

| ID | Pass when |
|----|-----------|
| AC-DS-01 | Body text ≥ **17pt** on detail screens |
| AC-DS-02 | Labels sentence-case **13pt**, no ALL CAPS blocks |
| AC-DS-03 | Primary CTA ≥ **48pt** height, in bottom 40% on wizards |
| AC-DS-04 | List rows ≥ **56pt** touch height |
| AC-DS-05 | Tab icons 24pt filled/outline; labels visible |
| AC-DS-06 | Screen horizontal pad **16pt** consistent |
| AC-DS-07 | Grouped bg `#F2F2F7` on list/detail roots |
| AC-DS-08 | No primary action sole placement in top-right |
| AC-DS-09 | Stack depth ≤ 3 on any J-MOB journey |
| AC-DS-10 | Vitest token snapshot / no hardcoded fontSize in feature screens |

---

## 9) Tài liệu tham khảo

- [Workday Canvas — Mobile App Design Best Practices](https://canvas.workdaydesign.com/guidelines/mobile/mobile-app-design-best-practices)
- [Workday Canvas — Type tokens](https://canvas.workday.com/styles/tokens/type/)
- [Apple HIG — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [SAP SFUX HCM design system](https://www.sap.com/design-system/hcm/introduction/introduction/usage)
- [BambooHR — Request Time Off mobile](https://help.bamboohr.com/s/article/588027)
- [Personio — Mobile product](https://www.personio.com/product/mobile/)

---

## 10) Appendix — Web HRM Tailwind/shadcn ↔ mobile tokens (FE-DS-01)

**work_item_id:** `PCOMP-W4-FE-DS-01` · **Ngày:** 2026-06-07 · **Owner:** Dev-FE  
**Nguồn web:** `apps/web/hrm/tailwind.config.ts` (Tailwind defaults — **không** override `fontSize`) · `apps/web/hrm/src/index.css` (`html { font-size: 87.5%; }`) · shadcn `components/ui/*`  
**Nguồn mobile:** `apps/mobile/hrm-mobile/src/theme/tokens.ts` · semantic scale **§1** (target MOB-UX-03)

### 10.1 Root scale — vì sao số px web ≠ số trong `tokens.ts`

| Layer | Root / base | Ghi chú |
|-------|-------------|---------|
| **HRM embed** | `html` **87.5%** → root **14px** (browser 16×0.875) | Mật độ đồng bộ portal (`index.css` L9–11) |
| **web-portal** | 100% → 16px; `tailwind.config.cjs` `fontSize.*` explicit | Mobile `tokens.ts` mirror **portal 100%** numbers |
| **Mobile RN** | Absolute **pt/dp** — không rem | `typography.fontSize.base` = **16** chưa phản ánh DS target **17** (§1) |

Mọi cột **Effective px (HRM embed)** dưới đây = `rem × 14px` (Tailwind default rem scale).

### 10.2 Tailwind utility scale — nominal vs effective (HRM embed)

| Tailwind class | Nominal @16px root | **Effective px @87.5%** | `tokens.ts` key | Mobile DS §1 target | Parity |
|----------------|-------------------|-------------------------|-----------------|---------------------|--------|
| `text-xs` | 12px | **10.5** | `xs` → 12 | `caption` **12** / `tabLabel` **10** | Web badge/table header **dưới** min readable 13pt; mobile caption OK |
| `text-sm` | 14px | **12.25** | `sm` → 14 | `footnote` **13**, `callout` **16** | Web shadcn default (Button, Label, CardDescription) **nhỏ hơn** footnote target |
| `text-base` | 16px | **14** | `base` → 16 | `body` **17** | Gap **−3pt** body (§1 mapping); web denser |
| `text-lg` | 18px | **15.75** | `lg` → 18 | `callout` **16** | Gần callout; dùng sporadic trong feature screens |
| `text-xl` | 20px | **17.5** | `xl` → 20 | `title3` **20** / `body` **17** | Page title mobile ≈ **body target**; desktop title3 |
| `text-2xl` | 24px | **21** | `2xl` → 24 | `title2` **22** | shadcn `CardTitle` default; mobile title2 sau UX-03 |
| `text-3xl` | 30px | **26.25** | `3xl` → 30 | `title1` **28** | Landing/stats hero only on web |
| `text-4xl` | 36px | **31.5** | *(none)* | `largeTitle` **34** | Web-only marketing; mobile native large title riêng |

**Line height:** Web = Tailwind default per size + shadcn `leading-none` (titles) / `leading-none` (Label). Mobile DS §1 có LH từng token — **chưa** export trong `tokens.ts` (`lineHeight` chỉ tight/normal/relaxed multiplier).

### 10.3 shadcn component defaults → mobile semantic map

| shadcn / CSS component | Web classes | Effective px | Mobile component | DS target token | Gap / action |
|------------------------|-------------|--------------|------------------|-----------------|--------------|
| `CardTitle` | `text-2xl font-semibold` | **21** | `ListRow` title | `title3` **20** / `title2` **22** | ±1–2px — OK sau UX-03 bump `2xl`→22 context |
| `CardDescription` | `text-sm text-muted-foreground` | **12.25** | row subtitle | `callout` **16** | Web secondary **−4pt** — **logic parity only** (§0) |
| `Button` | `text-sm font-medium` h-10 | **12.25** | `PrimaryButton` | **17pt semibold**, h **48** | **Platform-native** — không bump web button to 17px |
| `Label` | `text-sm font-medium` | **12.25** | `FormField` label | `footnote` **13** sentence | Web ALL CAPS trong `.saas-table th` — mobile bỏ ALL CAPS (AC-DS-02) |
| `Badge` | `text-xs font-semibold` | **10.5** | `StatusBadge` | `caption` **12** | Web badge **dưới** 13pt min; mobile giữ 12pt caption |
| `Input` / `Select` | `text-base` / `md:text-sm` | **14** / **12.25** | `FormField` | `body` **17** | iOS `@supports` force **16px** input (`index.css` L324–327) ≈ `callout`, not body |
| `Textarea` | `text-base` | **14** | multiline fields | `body` **17** | Same as Input |
| `.page-title` | `text-xl md:text-2xl` | **17.5 → 21** | `AppScreenLayout` | `title2` **22** | `@sm` breakpoint: web 2-tier; mobile single scale |
| `.saas-table` | `text-sm` / `th text-xs uppercase` | **12.25** / **10.5** | list screens | `body` / `footnote` | Web table density ≠ mobile 56pt rows |
| `.status-badge` | `text-xs` | **10.5** | `StatusBadge` | `caption` **12** | Align mobile caption; web embed có thể giữ dense |

**Font:** Web **Inter** (`tailwind.config.ts` L17) · Mobile **System** (SF Pro / Roboto) — intentional (§1).

### 10.4 Responsive `@sm` / `@md` text — web-only breakpoints

| Pattern (HRM) | Breakpoint | Size jump | Mobile equivalent |
|---------------|------------|-----------|-------------------|
| `PageHeader` `text-xl md:text-2xl` | ≥768px | 17.5→21px | Không breakpoint — một `title2` 22pt |
| Landing `text-2xl md:text-3xl` | ≥768px | 21→26.25px | N/A (no landing in app) |
| `Input` `text-base md:text-sm` | ≥768px | 14→12.25px | **Inverse** — mobile forms **larger** (17pt target) |
| `@media (max-width:768px)` `.saas-table` | mobile | force **12px** td/th | `ListRow` min 56pt, title3 20pt |

**Kết luận @sm:** Web dùng breakpoint để **thu nhỏ** typographic trên desktop embed; mobile DS **một scale** thumb-readable — không port `md:text-sm` xuống RN.

### 10.5 Gap register (P0 → MOB-UX-03, không block web)

| ID | Gap | Web today | Mobile target | Owner | Notes |
|----|-----|-----------|---------------|-------|-------|
| G-DS-01 | Body default | ~**14px** effective (`text-base` + 87.5% root) | **`body` 17pt** | Dev-Mobile | §1 `fontSize.base` 16→17 |
| G-DS-02 | Field labels | `text-sm` ~12px + table **UPPERCASE** | **`footnote` 13pt** sentence | Dev-Mobile | `DetailRow` refactor |
| G-DS-03 | Semantic tokens | Tailwind utilities only | §1 `largeTitle`…`tabLabel` | Dev-Mobile | Extend `tokens.ts` beyond xs…3xl |
| G-DS-04 | Line heights | Implicit / `leading-none` | Per-token LH §1 | Dev-Mobile | Add `typography.lineHeights.title2` etc. |
| G-DS-05 | Primary CTA text | Button `text-sm` ~12px | **17pt semibold** | — | **Accept** platform divergence (§0 layout mobile-native) |
| G-DS-06 | Badge/table meta | `text-xs` ~10.5px | **`caption` 12** min | Dev-Mobile | Web embed density OK; mobile ≥12 |
| G-DS-07 | `tokens.ts` vs portal | Numeric scale 12–30 @100% | Same numbers | Dev-Mobile | Numbers match portal **not** HRM effective px — document only |
| G-DS-08 | Missing web token | `text-4xl`, arbitrary `text-[…]` | No RN equivalent | Dev-FE audit | Grep hardcoded in feature screens (AC-DS-10) |

### 10.6 Parity rule (PM lock bổ sung)

- **Màu / label / status logic:** parity bắt buộc (`xevn.*` ↔ `colors.*` — đã test `tokens.test.ts`).
- **Cỡ chữ:** **không** 1:1 px web→mobile; follow **§1 semantic scale** on mobile, **87.5% rem** on web embed.
- **Sau MOB-UX-03:** Vitest snapshot thêm `fontSize` semantic keys; QA AC-DS-01/02 verify 17pt body + 13pt labels on device.

**Evidence:** `docs/qa/evidence/pcomp-w4-fe-ds-01-20260607.md`

---

## 11) Visual polish — sinh động, trực quan, chuyên nghiệp (U49)

**Nguyên tắc sponsor:** App mobile phải **nhìn là tin được** — cùng phân khúc Personio/HiBob, không «màn hình dev».

### 11.1 Hierarchy (nhìn 1 giây hiểu việc gì)

| Layer | Visual | Cấm |
|-------|--------|-----|
| **Urgent** | Card nền `#EFF6FF`, icon trái, badge số đỏ/xanh | Chỉ text thuần |
| **Primary action** | `HomeActionCard` accent + icon 24pt filled | Nút text link nhỏ |
| **Task row** | Icon loại (nghỉ/chấm công/inbox) + title + chevron | Raw API code |
| **Social / celebration** | Avatar vòng tròn initials, gradient banner nhẹ | Plain list tên |

### 11.2 Sinh động (có cảm xúc, không game hóa)

- **Sinh nhật / kỷ niệm:** banner gradient + emoji tối giản; confetti **chỉ** user chính, 1 lần/ngày (MOB-UX-04b)
- **Empty state:** illustration/icon 48pt + copy thân thiện + 1 CTA — không «Chưa có dữ liệu» trống
- **Success:** toast + icon check; approve → màu success semantic
- **Loading:** skeleton shimmer trên card — không full-screen spinner che Home (MOB-UX-04c)

### 11.3 Trực quan (scannable)

- **Số liệu:** tabular-nums, VND format, badge trạng thái màu (đã có `StatusBadge`)
- **Nhóm theo thời gian:** «Hôm nay» / «Tuần này» section headers title2
- **Manager:** số pending **to, đậm** trên Home — không bury trong More

### 11.4 Chuyên nghiệp (enterprise-ready)

- Không meme, không gradient chói; palette XeVN + iOS grouped
- Typography §1 — body 17pt, không ALL CAPS label tiếng Việt
- Safe area §4 — không đè status bar / nav 3 nút Android
- Accessibility: contrast ≥4.5:1, VoiceOver trên CTA chính

### 11.5 AC visualize (QA device)

| AC-ID | Pass |
|-------|------|
| AC-VIS-01 | Home có ≥2 visual layer (greeting + card/icon), không flat wall of text |
| AC-VIS-02 | Task section có badge hoặc icon phân loại |
| AC-VIS-03 | Empty state có CTA rõ |
| AC-VIS-04 | Manager pending visible on Home without opening More |

**Owner:** Dev-Mobile implement · QA-Device screenshot before/after · QC gate MOB-UX-04+

---

**PM lock:** Mọi PR mobile UX sau 2026-06-07 phải cite section trong doc này hoặc `MOBILE_IOS_UX_INHERITANCE_PLAN.md` — không tự ý đổi tab count, body 16pt, hoặc đặt Submit trên header.
