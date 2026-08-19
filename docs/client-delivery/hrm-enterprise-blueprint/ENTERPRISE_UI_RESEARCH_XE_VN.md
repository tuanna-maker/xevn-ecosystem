# Nghiên cứu Enterprise UI — XeVN HRM / Ops

| Mục | Giá trị |
|-----|---------|
| **Mã** | `PO-HRM-UI-BRAND-HTML-NEO-01` |
| **Ngày** | 2026-08-05 |
| **Phạm vi** | Portal nội bộ XeVN · Chấm công · Nhân sự · Dialog đơn từ |
| **Nguồn chốt** | `SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` §3–§4–§8 |
| **HTML neo** | `ui-neo/` |
| **Cấm** | Đổi API/SRS · seed data · Face/QR LIVE invent · palette AI |

---

## 1. Benchmark enterprise UI (dialog / form density)

| # | Sản phẩm / hệ | Điểm mạnh dialog form | Điểm yếu nếu áp chấm công VN | Lib / npm liên quan |
|---|---------------|------------------------|------------------------------|---------------------|
| 1 | **SAP Fiori** (dialog + Object Page) | Header rõ hierarchy; field group theo semantic; width theo loại dữ liệu; footer action cố định | Quá “ERP cổ” nếu copy hết chrome; học phí design system cao | `@ui5/webcomponents` (nặng; không khuyến nghị thay toàn stack) |
| 2 | **Microsoft Fluent 2** | Dialog density ổn định; focus ring rõ; command bar tách khỏi form | Visual “Windows admin” — kém logistics brand nếu overuse gray | `@fluentui/react-components` |
| 3 | **Workday-lite density** | Form HR dày nhưng label/value sắc; modal rộng cho leave/OT; progressive disclosure | Closed system — chỉ học pattern, không port code | (pattern only) |
| 4 | **Ant Design Pro** | Form layout 1/2/3 cột; `Form.Item` width; Drawer + Modal sẵn | Aesthetic Ant dễ “generic CN SaaS”; cần override token mạnh | `antd` · `@ant-design/pro-components` |
| 5 | **Linear / Height** | Field compact; keyboard; spacing chặt; title sắc | Quá tối giản marketing — thiếu brand chrome bắt buộc (viền + logo) | pattern + `cmdk` |
| 6 | **Radix Themes** | Token sạch; Dialog accessible; density `compact` | Ít “enterprise HR” out-of-box; phải tự làm brand header | `@radix-ui/themes` |
| 7 | **shadcn/ui + Radix** (hiện có XeVN) | Headless + Tailwind; Dialog/Sheet/Select đã có trong monorepo | Mặc định **đơn sơ**: thiếu brand chrome, field full-width, header mỏng | `radix-ui` · `class-variance-authority` · `tailwind-merge` · `cmdk` · `vaul` |
| 8 | **React Aria / Base UI** | A11y sâu; form pattern chuẩn W3C | Learning curve; đổi nhiều component = rủi ro regression layout nghiệp vụ | `react-aria-components` · `@base-ui-components/react` |

**Kết luận benchmark:** XeVN **giữ** React + Vite + Tailwind + shadcn/Radix làm xương; **nâng** modal anatomy + field-width rules + typography theo Fiori/Workday density — không nhảy sang Ant/Fluent full-stack.

---

## 2. Gap analysis — XeVN hiện tại vs enterprise đạt

| Gap class | Hiện tại (đơn sơ) | Enterprise đạt (mục tiêu) | Sponsor lock |
|-----------|-------------------|---------------------------|--------------|
| **Typography** | Inter / system; title modal ~16–18; body dễ nhạt `slate-400` | Display **Montserrat** ≥20 title; body **Source Sans 3** (tạm, **PENDING B5**); floor 12–14px sắc `#111827` | B5, Q2, B3 |
| **Modal chrome** | Header mỏng, không logo, không viền brand | Viền xanh full-bleed đầu + wordmark trái + glass/blur header nhẹ | B2, U2, Q1 |
| **Field width** | Hầu hết `w-full` dài | Co theo loại: ngày/số/mã ngắn; textarea/lý do rộng; dialog **mở rộng** khi nhiều field | U3 |
| **Hierarchy** | Title = text thường; CTA lẫn footer | Title Montserrat SemiBold; section label rõ; primary `#1E40AF`; destructive tách | B3, Q1 |
| **Empty / stub honesty** | Stub xám hoặc nút giả LIVE (rủi ro) | Khuyến nghị Option A: chrome brand + banner «Chưa mở» — **chờ chốt S3** | S3 §8.4 |
| **Glass header** | Ít / không có trên modal ATT | `backdrop-blur` + surface/80 trên header brand; **không** purple glow | U2, B4 |
| **Brand 5s** | Screenshot modal không nhận XeVN | 5 giây: viền xanh + logo trái | Q1 |

---

## 3. Phương án cụ thể

### 3.1 Recommended — **R1: Elevate shadcn Dialog (giữ stack)**

| Hạng mục | Quyết định |
|----------|------------|
| **Modal anatomy** | (1) Thanh brand 4px `#1E40AF` full-bleed · (2) Header glass: logo 28–32px trái + title Montserrat ≥20 · (3) Body grid 12 cột / nhóm field · (4) Footer sticky: Hủy (ghost) + Primary / Destructive |
| **Field width** | Xem bảng §3.3 |
| **Dialog rộng** | Leave / OT / form ≥6 field → `max-width: 920–960px` (không dùng sm 480) |
| **Side-sheet** | Filter / lịch sử / preview phụ — `vaul` hoặc shadcn Sheet |
| **Wizard** | Chỉ khi ≥3 bước có phụ thuộc (vd. tạo NV multi-step) — **không** ép mọi đơn từ |
| **Stack** | Giữ shadcn + Radix; bổ sung nhẹ §3.4 |
| **Font** | Display Montserrat · Body **Source Sans 3** (PENDING sponsor `Body = A`) |
| **Hero visual** | Được phép trên modal (U1) — ảnh/pattern logistics nhạt phía header, **không** che field |

**Lý do chọn R1:** Khớp “thay component nếu giúp UX nhưng không đập bố cục nghiệp vụ”; rủi ro regression thấp; HTML neo map 1:1 sang class token Dev-FE.

### 3.2 Alternate — **A1: Radix Themes compact + brand chrome wrapper**

- Bọc mọi Dialog bằng `XevnBrandDialog` dùng `@radix-ui/themes` density compact.
- **Ưu:** Token density sẵn. **Nhược:** Hai hệ theme (shadcn HSL + Radix) dễ lệch primary; bundle + learning curve.
- Chỉ chọn A1 nếu R1 không đạt density sau 1 wave foundation.

### 3.3 Field → max-width (SoT cho HTML neo + Dev-FE)

| Loại field | Ví dụ | `max-width` / class gợi ý | Ghi chú |
|------------|-------|---------------------------|---------|
| Ngày | Từ ngày, Đến ngày | `8.75rem` (~140px) · `xevn-field-date` | Không full row |
| Giờ | Giờ bắt đầu OT | `6.5rem` (~104px) · `xevn-field-time` | |
| Mã NV / mã đơn | NV-1024 | `10rem` (~160px) · `xevn-field-code` | |
| Số ngắn | Số giờ OT, số ngày | `7.5rem` (~120px) · `xevn-field-num` | Có grouping vi-VN khi money — **không** áp page size |
| Điện thoại | 09… | `11.25rem` (~180px) · `xevn-field-phone` | |
| Select ngắn | Loại nghỉ, ca | `12.5rem` (~200px) · `xevn-field-select-sm` | |
| Select trung | Phòng ban, đơn vị | `17.5rem` (~280px) · `xevn-field-select-md` | |
| Họ tên | Họ và tên | `17.5rem` (~280px) · `xevn-field-name` | |
| Text 1 dòng dài | Email, địa chỉ ngắn | `24rem` / `min(100%, 24rem)` · `xevn-field-line` | |
| Textarea lý do | Lý do nghỉ/OT | `100%` cột nội dung · `xevn-field-reason` | Min 3 rows AutoResize |
| Lưới 2 cột | Cặp Từ–Đến | `grid-cols-12` · mỗi cột `col-span-4` hoặc `col-span-6` theo độ phức tạp | Neo layout `.cursorrules` 4-4-4 khi form dài |

### 3.4 Stack FE đề xuất (React + Vite + Tailwind + shadcn)

| Gói | Hành động | Lý do | Rủi ro bundle |
|-----|-----------|-------|---------------|
| `@radix-ui/react-dialog` (+ đã có qua shadcn) | **Giữ** | A11y dialog | Đã có |
| `cmdk` | **Thêm nếu chưa** trên combobox NV/đơn vị | Tìm NV nhanh trong form dày | Nhẹ (~few KB) |
| `vaul` | **Thêm** cho sheet mobile / filter | Drawer cảm giác native; cùng brand header | Nhẹ |
| `@radix-ui/react-popover` / select | **Giữ** shadcn Select | Consistency | Đã có |
| `react-aria-components` | **Không** thay hàng loạt wave 1 | A11y sâu nhưng rewrite lớn | Cao |
| `antd` / Fluent | **Không** | Đụng layout nghiệp vụ + aesthetic lệch B4 | Cao |
| `@fontsource/montserrat` + `@fontsource/source-sans-3` | **Thêm** (hoặc Google Fonts link neo) | B5 display chốt; body tạm A | ~50–80KB subset |
| `tailwindcss` tokens `xevn.*` | **Giữ + bổ sung** class field width | ADR Precision Motion | 0 |

### 3.5 Font — khuyến nghị

| Vai trò | Font | Trạng thái |
|---------|------|------------|
| Display / title modal / wordmark text | **Montserrat** SemiBold–Bold | **Chốt** sponsor |
| Body / label / table | **Source Sans 3** Regular/Medium | **Tạm — PENDING** sponsor B5 (`Body = A` khuyến nghị PM). Alternate: Be Vietnam Pro (B) · IBM Plex Sans (C) |

---

## 4. Anti-patterns (cấm)

| Anti-pattern | Vì sao |
|--------------|--------|
| Chip cluster / pill hàng trang trí | Ồn, không ops |
| Stat strip “giả sang” trên dialog đơn từ | Che field thật |
| Purple → indigo gradient / cream + terracotta / glow neon | Palette AI — B4 cấm |
| Body / label `slate-400` / `#9CA3AF` | Chữ nhạt — Q2 FAIL |
| Dialog hẹp 400px nhồi 10 field | U3: phải **mở rộng** |
| Input luôn `w-full` cho ngày/mã | Lãng phí, trông form thô |
| Fake Face/QR **LIVE** trên neo hoặc product stub | Honesty — không invent |
| Claim remaster DONE / Attendance CLOSED | Ngoài scope neo |

---

## 5. Checklist QA

### 5.1 “5 giây nhận brand” (Q1)

- [ ] Có **viền/thanh xanh** `#1E40AF` full chiều ngang đầu modal
- [ ] Có **logo hoặc wordmark XeVN** nhỏ bên trái header
- [ ] Title đọc được ngay (Montserrat ≥20, màu tối)
- [ ] Không nhầm screenshot với template AI tím/cream
- [ ] Primary CTA xanh brand (không tím)

### 5.2 “Dialog form đạt”

- [ ] Header glass/blur nhẹ (không glow)
- [ ] Body font Source Sans 3 (hoặc font B5 đã chốt) ≥12–14px sắc
- [ ] Field ngắn không kéo full width
- [ ] Dialog leave/OT ≥ ~900px khi nhiều field
- [ ] Footer: Hủy + hành động chính rõ; destructive tách màu
- [ ] Không Face/QR LIVE giả
- [ ] Grid nhóm field thẳng hàng (12-col hoặc cặp logic)
- [ ] So với wire “CHƯA ĐẠT”: có đủ chrome brand

---

## 6. Mapping HTML neo → Dev-FE (ghi chú implement)

| Neo | Dev-FE gợi ý | Cấm |
|-----|--------------|-----|
| `.xevn-modal-brand-bar` | Pseudo/`div` đầu `DialogContent` | Đổi API payload |
| `.xevn-modal-header-glass` | `backdrop-blur-md bg-white/80` | Purple glow shadow |
| `.xevn-wordmark` | `<img src=xevn-logo>` + sr-only text | Bỏ logo mọi modal |
| `.xevn-modal-title` | `font-display text-xl+ font-semibold text-xevn-text` | Title muted |
| `.xevn-field-*` | map §3.3 vào `className` Form control | `w-full` mặc định mọi input |
| `.xevn-modal--wide` | `sm:max-w-[920px]` leave/OT | Giữ `max-w-lg` cho form dày |
| Login shell | `brandShell` `#000000` + primary CTA | Cream hero AI |

**must_keep:** luồng field/API đã chốt SRS · soft-delete · scope parity · stub honesty đến khi S3 = A/B.

---

## 7. Open items (không block HTML neo)

| ID | Nội dung | Owner kế |
|----|----------|----------|
| B5 | Chốt body A/B/C | Sponsor → SA APPEND ADR |
| S3 | Stub Option A vs B | Sponsor → SA/ADR · khuyến nghị **A** |
| ADR | APPEND override §3–§4 (wordmark mọi modal, glass, Montserrat, U1 hero…) | **DONE** — `PO-HRM-UI-BRAND-ADR-02-APPEND` · ADR §15 |
| Dev-FE | Foundation tokens + `XevnBrandDialog` theo neo | PM dispatch khi HTML neo READY |

---

## 8. Tóm tắt quyết định research

| Hạng mục | Giá trị |
|----------|---------|
| **Recommended** | R1 — Elevate shadcn Dialog + brand chrome + field-width tokens |
| **Alternate** | A1 — Radix Themes compact wrapper |
| **Body font tạm** | Source Sans 3 (**PENDING B5**) |
| **Display** | Montserrat |
| **Primary** | `#1E40AF` · text `#111827` |
| **P0 neo** | Login · ATT Overview · Dialog nghỉ · Dialog OT · EMP profile+modal |
