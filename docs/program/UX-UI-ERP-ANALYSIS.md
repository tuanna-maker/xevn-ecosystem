# UX-UI ERP Analysis — XeVN OS / X-BOS

| Field | Value |
|-------|-------|
| **work_item_id** | `UX-UI-ERP-AUDIT-01` |
| **Date** | 2026-07-28 |
| **Scope** | HRM web · Web Portal · X-BOS-Core · HRM Mobile |
| **Sources** | `ux-ui-brand-audit-01.md` · `ux-ui-erp-screen-matrix-01.md` · `ux-ui-component-inventory-01.md` (stub) · `apps/web/hrm/tailwind.config.ts` · `apps/web/hrm/src/index.css` |
| **Author** | Cursor-PM (synthesis for Claude-PM review) |
| **Locks** | HOLD_DEPLOY · U65 · NOT Phase1/PROD claim từ doc này |

> Mục đích: brief sản phẩm cấp senior PM — quyết định brand + chuẩn UX tối thiểu + backlog có **business impact**, không phải danh sách bug kỹ thuật.

---

## 1. Executive Summary

XeVN đã có **nền brand DNA đủ mạnh** (Primary `#1E40AF`, accent cyan, DNA status green/orange/red, radius 8/12, Inter trên HRM) — **không cần rebuild brand**. Việc còn lại là **thống nhất áp dụng** qua Portal / X-BOS-Core / Mobile và **cắt độ phức tạp ERP** trên các màn "nhà máy".

**Ba P0 và tác động kinh doanh**

| P0 | Vấn đề | Business impact |
|----|--------|-----------------|
| **P0-1** | Payroll runtime crash (`floatingUiState` / floating UI) | HR/Kế toán **không chốt được kỳ lương / quyết toán thuế** → chậm chi trả, rủi ro tuân thủ, mất tin tưởng hệ thống lương |
| **P0-2** | Attendance "nhà máy" (~3658 LOC, 15+ sub-tab, 30+ `useState`) | Chấm công là luồng hàng ngày; quá tải nhận thức → thao tác sai ca/phép, tăng ticket helpdesk, giảm adoption tablet/GPS |
| **P0-3** | EmployeeProfile 15 tabs (+ overflow) | HRBP/CEO mất thời gian tìm thông tin NV; ẩn lương bằng `null` im lặng → hiểu nhầm "mất dữ liệu", khiếu nại nội bộ |

**Mobile:** ESS đã có journey directory/profile PASS gần đây, nhưng **chưa đạt chuẩn iOS HIG đồng bộ** (touch, safe area, parity visual với web DNA trên mọi hub). Mobile phải là lane riêng, không "port web xuống".

---

## 2. Framework đánh giá

### 2.1 Nielsen — 10 heuristics (góc ERP)

| # | Heuristic | Mô tả ngắn | Current state / Evidence | Gap to standard |
|---|-----------|------------|------------------------|-----------------|
| 1 | Visibility of system status | User luôn biết hệ thống đang làm gì | `isExporting` chỉ đổi text button → spinner + % mất (UX-04). Attendance/Payroll sub-tab: no skeleton guard | Thiếu real progress indicator; blank content area không có feedback |
| 2 | Match real world | Ngôn ngữ & mô hình = nghiệp vụ | Attendance: "checkinout/qrcode/faceid/gps/sheets/records" là kỹ thuật mapping, không phải task flow (UX-01) | Tab đặt tên theo implementation, không theo user goal — cần refactor task-based IA |
| 3 | User control & freedom | Undo / hủy / thoát an toàn | Cancel đóng dialog nhưng modal state không reset (UX-06: race condition khi reopen) | UX-06: cancel rồi mở lại có thể thấy stale data — mất niềm tin |
| 4 | Consistency & standards | Cùng hành động → cùng pattern | D1: Employees/Contracts dùng DataTable; Attendance shifts/Payroll tax-settlement dùng plain `<table>` (không sort/a11y) | D1: 2 paradigms → hành động xóa/sửa khác nhau giữa các màn, user confusion |
| 5 | Error prevention | Chặn lỗi trước khi xảy ra | D5: Payroll tax settlement form không có Zod — submit lọt input invalid vào DB | D5: dữ liệu thuế/lương có thể invalid → BHXH sai, phạt tuân thủ |
| 6 | Recognition rather than recall | Hiện lựa chọn, đừng bắt nhớ | UX-03: Shifts search có placeholder nhưng chưa wire onChange → user tưởng tính năng hỏng, bỏ dùng | UX-03: search im lặng → feature waste + user frustration |
| 7 | Flexibility & efficiency | Shortcut / bulk cho power user | UX-09: Shifts có checkbox nhưng không có bulk toolbar — flexibility giả, misleading UI | UX-09: checkbox không có action bar → user kỳ vọng bulk xóa/sao lưu, thất vọng |
| 8 | Aesthetic & minimalist | Chỉ thông tin cần cho task | P0-a: Attendance 15 sub-tabs (3658 LOC), Payroll 12 sub-tabs (4779 LOC), Profile 15 tabs — cognitive overload P0 | P0-a: user mất 4–5 click cho task phổ biến → click depth cần giảm xuống ≤2; chưa validated bằng tree test (ước tính) |
| 9 | Help users recover errors | Thông báo rõ + cách sửa | UX-04: sub-tab content không có guard — crash/blank screen không có CTA → user stuck, gọi HR | UX-04: thiếu ErrorState có action → recovery time tăng, helpdesk cost cao |
| 10 | Help & documentation | Gợi ý tại chỗ khi cần | UX-10: Dashboard no-data fallback là bland text, không có CTA → user không biết next step | UX-10: empty state không actionable → adoption giảm, user nghĩ hệ thống lỗi |

### 2.2 WCAG 2.2 AA (ERP-relevant) — latest W3C Rec (Oct 2023)

| Requirement | Ý nghĩa cho XeVN |
|-------------|------------------|
| **1.4.3 Contrast** | Text `#111827` / muted `#4B5563` trên surface — cấm chữ nhạt kiểu AI trim text-on-gray |
| **2.1.1 Keyboard** | Mọi dialog/table primary path dùng được bằng bàn phím — ưu tiên mobile-first keyboard tray |
| **2.4.3 Focus order** | Tab order trong form lương/thuế logic theo cột nghiệp vụ (tên → số → ngày) |
| **2.4.7 Focus visible** | Ring accent `#06B6D4` (đã có `--ring`) |
| **2.4.12 Focus not obscured** (NEW 2.2) | CTA không bị home indicator che trên mobile — hiện AttendanceEntry có `.safe-area-bottom` nhưng chưa verify tất cả screen |
| **3.3.1 / 3.3.2** | Lỗi form + nhãn rõ (Zod + message VI) — không silent skip |
| **4.1.2 Name/Role/Value** | shadcn/Radix đúng role; tránh plain `<table>` thiếu sort/a11y — liên quan D1 |

### 2.3 iOS HIG + Material 3 (mobile)

| Standard | Yêu cầu tối thiểu |
|----------|-------------------|
| **iOS HIG** | Touch ≥ 44×44 pt; Dynamic Type; safe-area; back swipe; tab bar ≤ 5 |
| **Material 3** | Touch ≥ 48×48 dp; FAB/CTA rõ hierarchy; list → detail pattern |
| **XeVN mobile** | Đồng bộ DNA màu; ESS card density ops-first; không copy desktop tab dump |

### 2.4 Severity rating (0–4)

| Score | Definition | Action |
|------:|------------|--------|
| **4** | Chặn nghiệp vụ / crash / mất dữ liệu | Block release / fix trong wave P0 |
| **3** | Hỏng luồng chính hoặc adoption sụt mạnh | Sprint hiện tại / kế tiếp bắt buộc |
| **2** | Ma sát đáng kể, có workaround | Backlog có owner + ETA |
| **1** | Phiền nhỏ, không lệch SoT lớn | Fix khi chạm file |
| **0** | Thuần thẩm mỹ | Không lên lịch riêng |

---

## 3. UX Minimum Standards (quy tắc tối thiểu — bắt buộc)

| Quy tắc | Chuẩn PASS |
|---------|------------|
| **Visibility** | Breadcrumb/embed title + menu active; tab active rõ (màu primary / underline) |
| **Error prevention** | Mọi destructive (xóa NV, xóa bảng lương, hủy kỳ) → Confirm; high-impact → typed reason |
| **Recognition > Recall** | Filter/options nhìn thấy; không bắt nhớ mã tab ẩn |
| **Flexibility** | List có checkbox **chỉ khi** có bulk toolbar (Archive/Export/Delete) |
| **Recovery** | Cancel đóng dialog không mất điều hướng; Undo khi phù hợp (hoặc "khôi phục từ nháp") |
| **Consistency** | Cùng entity → cùng DataTable + dialog pattern giữa HRM/Portal |
| **Loading / Empty / Error** | Mỗi vùng nội dung: Skeleton **hoặc** EmptyState có CTA **hoặc** ErrorState — cấm vùng trắng |
| **Mobile touch** | iOS ≥ 44×44 pt · Android ≥ 48×48 dp |
| **iOS HIG** | Safe area; edge back; font scale; không che CTA bởi home indicator |

---

## 4. Brand Identity Decision (FINAL — dùng chung)

### 4.1 Color system

| Token | HEX | HSL (bridge) | Usage |
|-------|-----|--------------|-------|
| **primary** | `#1E40AF` | `226 71% 40%` | Brand, header, sidebar active, CTA chính |
| **primaryPressed** | `#1E3A8A` | — | Pressed / active deep |
| **accent** | `#06B6D4` | `189 94% 43%` | Focus ring, link, secondary CTA |
| **success** | `#10B981` | `160 84% 39%` | Active, approved, DNA Active |
| **warning** | `#F59E0B` | `38 92% 50%` | Pending, expiring |
| **danger / error** | `#EF4444` | `0 84% 60%` | Fail, destructive |
| **info** | `#3B82F6` | — | Informational chips |
| **background** | `#F9FAFB` | `210 20% 98%` | Page canvas |
| **surface** | `#FFFFFF` | — | Card / sheet |
| **text** | `#111827` | `220 39% 11%` | Heading + body |
| **textSecondary** | `#4B5563` | — | Secondary readable |
| **textMuted** | `#6B7280` | — | Meta only (không dùng body) |
| **border** | `#E5E7EB` | — | Dividers, inputs |
| **brandShell** | `#000000` | — | Shell / sidebar near-black |

HRM module tints (recruitment / attendance / payroll) **chỉ** dùng làm accent module — không thay Primary tập đoàn.

### 4.2 Typography

| Surface | Font | Floor |
|---------|------|-------|
| Web (HRM, Portal) | **Inter** | Body ≥ 15px (`0.9375rem` @ 87.5% root); table ≥ 14px; title ≥ 20px |
| Mobile | **SF Pro** (iOS) / **Roboto** (Android) | Body ≥ 17pt (HIG) |
| X-BOS-Core | **Bắt buộc Inter** (hiện thiếu import — P1) | Đồng bộ HRM |

### 4.3 Spacing (7 bước)

| Step | Token | Size |
|------|-------|------|
| 1 | `xs` | 4px (`0.25rem`) |
| 2 | `sm` | 8px |
| 3 | `md` | 16px |
| 4 | `lg` | 24px |
| 5 | `xl` | 32px |
| 6 | `2xl` | 48px |
| 7 | `3xl` | 64px |

Safe inline: **thống nhất một clamp** (đề xuất Portal = HRM `3rem` max hoặc ADR ghi rõ 2 tier — hiện lệch 3rem vs 2rem = P1).

### 4.4 Radius & elevation

| Element | Radius |
|---------|--------|
| Input / control | **8px** (`rounded-input`) |
| Card / panel | **12px** (`rounded-card`) |
| Shadow | `shadow-soft` / overlay theo CSS vars hiện có |

---

## 5. Vấn đề theo mức độ (có Business Impact)

### 5.1 P0 — Critical

| ID | Vấn đề | App / màn | Sev | Business impact | Recommendation | Rationale |
|----|--------|-----------|-----|-----------------|----------------|-----------|
| **P0-b** | Crash floating UI / `floatingUiState` | HRM Payroll — tax settlement dialog | 4 | Khi HR mở dialog sửa NV trên kỳ lương → `floatingUiState.undefined` throw. Kịch bản: kỳ lương tháng 7, 28/7 đóng sổ → HR không thể verify → chậm chốt 1–2 ngày → BHXH/nộp thuế trễ | Null-guard + init state + regression test mở dialog | UX-02: runtime crash trong chức năng tiền mặt — mất niềm tin |
| **P0-a** | Tab depth vượt giới hạn nhận thức | Attendance (15 sub-tabs, 3658 LOC), Payroll (12 sub-tabs, 4779 LOC) | 3–4 | Theo screen matrix: user cần 4–5 click cho task phổ biến → sai ca, nhầm phép, sai cấu phần lương → ticket helpdesk tăng, adoption tablet/GPS giảm | Gộp sub-tab → section/accordion/wizard; mục tiêu ≤ 2 cấp click | UX-01: Attendance/Payroll tab depth; chưa validated bằng tree test (ước tính) |
| **P0-c** | State proliferation (Attendance 30+, Payroll 25+ `useState`) | Attendance, Payroll | 3 | Race UI/data giật giữa nested modal, tab switch, form edit — khó QA → defect lặp → downtime HR | `useReducer` grouped by domain + lazy route cho Payroll/Profile | UX-06: cùng root cause P0-b (modal state không reset) |

**EmployeeProfile 15 tabs** (matrix COMPLEX): xếp **P0-product / P1-tech** — impact gần P0 về thời gian tìm kiếm; remediation nhóm tab (Core/HR/Career/Personal) trong Lane C.

### 5.2 P1 — High

| ID | Vấn đề | Business impact | Recommendation | Rationale |
|----|--------|-----------------|----------------|-----------|
| **UX-BR-01** | X-BOS-Core thiếu Inter | Brand "hai mặt" khi CEO nhảy XBOS↔HRM → cảm giác sản phẩm chưa chín | `@import` Inter + fontFamily đồng bộ | Consistency heuristic #4 |
| **UX-BR-02** | `xevn-safe-inline` lệch HRM/Portal | Layout "nhảy" khi embed ↔ portal full | Một utility SoT | Symmetrical grid law |
| **UX-BR-06** | X-BOS-Core thiếu dark mode parity | Ops đêm / CEO dark preference lệch | Align `.dark` tokens như HRM L2 | Đã có precedent FE brand L2 |
| **UX-03** | Search shifts/contracts chưa wire | User tưởng search hỏng → bỏ tính năng | Debounce 300ms + binding | Recognition + feedback prevention |
| **UX-08 / UX-12** | Confirm destructive không chuẩn | Xóa nhầm hoặc sợ bấm → chậm vận hành | Typed reason (high) / AlertDialog destructive (low) | Chuẩn hóa = giảm incident |
| **UX-09** | Checkbox shifts không có bulk bar | Misleading control → mất tin UI | Toolbar hoặc bỏ checkbox | Flexibility thật, không giả |
| **D1** | Mixed DataTable vs plain `<table>` | A11y + sort kém → chậm đối soát | Chuẩn DataTable | WCAG + tốc độ audit |
| **D5** | Form Payroll thiếu Zod | Dữ liệu thuế/lương invalid lọt | Zod + RHF như Employees | Tiền = zero tolerance validation |
| **D2** | State init gaps | Crash/partial render | Convention init + null-guard | Cùng gốc P0-b |

### 5.3 P2 — Medium

| ID | Vấn đề | Business impact | Recommendation |
|----|--------|-----------------|----------------|
| Overlay opacity / button height lệch | Cảm giác "nhiều sản phẩm" | Token overlay + `h-10` CTA chuẩn |
| Empty/loading không đều | User nghĩ hệ thống treo | SkeletonGrid / EmptyState / ErrorState SoT |
| PermissionGate silent null | Hiểu nhầm mất dữ liệu lương | `PermissionFallback` VI |
| i18n hardcode JSX | Block mở rộng ngôn ngữ sau này | Mọi string qua `t()` |
| Profile overflow 11 tabs | Tìm field chậm | Group dropdown theo domain |

---

## 6. Đề xuất Lanes (A/B/C/D)

| Lane | Owner | Priority | Deliverable | Exit criteria |
|------|-------|----------|-------------|---------------|
| **A — Design tokens package** | Dev-FE (+ SA sign-off token) | P1 | Package/`packages` hoặc shared CSS: color, space, radius, type floors; Portal + XBOS + HRM import chung | Grep không còn hardcode primary lệch; XBOS có Inter |
| **B — Component library** | Dev-FE | P1 | `XButton`, `XDialog`/`ConfirmDestructive`, `XTable` (DataTable wrapper), `EmptyState`, `PermissionFallback` | Mọi list mới bắt buộc XTable; destructive dùng 1 API |
| **C — Screen refactor** | Dev-FE (+ BA AC delta) | **P0** | (1) Payroll crash fix (2) Attendance IA collapse (3) Payroll IA/wizard (4) Profile tab groups + lazy | P0-b closed + click depth ≤ 2 trên happy path chấm công/tính lương |
| **D — Mobile parity** | Dev-Mobile + qa-device | P1 | HIG touch/safe-area; hub Celebrations/Who's out; visual DNA; không dump desktop tabs | J-MOB hub + profile/directory regression xanh; touch audit sample PASS |

**Thứ tự khuyến nghị:** C(P0-b) → C(IA) song song A → B consume A → D không block C.

### 6.1 Definition of Done (mỗi Lane)

| Lane | PASS criteria |
|------|---------------|
| **A — tokens** | `grep -r "text-blue-" apps/web/x-bos-core` = zero; XBOS `@import Inter`; Portal/HRM/×BOS `xevn-primary` hex identical; CI lint pass |
| **B — components** | Mỗi component có `__examples__/` story; axe-core a11y scan = 0 violation; visual regression (Chromatic/Percy) pass; BA sign-off happy path |
| **C — screen refactor** | P0-b: zero `floatingUiState.undefined` in test + prod replay; IA: click depth ≤2 trên 3 task chính (chấm công, xin phép, tính lương) đo bằng tree test; Profile lazy + tab groups ship |
| **D — mobile** | J-MOB-08/09 device regression xanh; touch audit sample 5 screen × 3 task = PASS 44×44pt; no desktop tab dump trong mobile route |

---

## 7. Theo ứng dụng

### 7.1 HRM Web (`apps/web/hrm`)

| Điểm mạnh | Gap |
|-----------|-----|
| Token `xevn.*` + CSS vars Precision Motion đã SoT | Payroll/Attendance god-files |
| Inter + density 87.5% | Mixed table; Permission silent |
| shadcn Dialog/DataTable trên nhiều màn | Lazy mới có AttendanceEntry — Payroll/Profile vẫn eager |

**Ưu tiên HRM:** P0-b → Attendance/Payroll IA → Profile groups → form Zod parity.

### 7.2 Web Portal (`apps/web/web-portal`)

| Điểm mạnh | Gap |
|-----------|-----|
| MainLayout + ExecutiveDashboard; membership switcher | `xevn-safe-inline` clamp ≠ HRM |
| ConfirmDialog pattern | Cần align overlay/button height với HRM (Lane B) |

**Ưu tiên Portal:** thống nhất safe-inline + consume token package A.

### 7.3 X-BOS-Core (`apps/web/x-bos-core`)

| Điểm mạnh | Gap |
|-----------|-----|
| Glass sidebar, identity riêng vẫn Primary DNA | **Thiếu Inter**; p-8 hardcode; dark mode thiếu |

**Ưu tiên XBOS:** UX-BR-01/03/06 trong Lane A — CEO không được cảm giác "app khác".

### 7.4 HRM Mobile (`apps/mobile/hrm-mobile`)

| Điểm mạnh | Gap |
|-----------|-----|
| ESS patterns; directory/profile Plane B đã có device PASS gần đây | Hub J-MOB-08/09; HIG đầy đủ; module tint ≠ loạn Primary |
| Bottom nav 4 tab hợp lý | Touch/safe-area audit chưa systematic |

**Ưu tiên Mobile:** Lane D — HIG + hub QA; **không** mang 15 tab Profile web xuống mobile.

---

## 8. Mobile UX Standards (iOS HIG — chi tiết)

| Topic | Standard |
|-------|----------|
| Touch target | ≥ 44×44 pt (iOS) / 48×48 dp (Android); CTA primary full-width khi form dài |
| Font | Body ≥ 17pt; hỗ trợ Dynamic Type; không truncate nghĩa vụ pháp lý |
| Safe area | Padding bottom cho home indicator; header dưới status bar |
| Gestures | Edge back = pop stack; swipe row chỉ với action rõ (Sửa/Xóa) + confirm |
| Lists | Card/grouped list → detail; pull-to-refresh nơi có list server |
| Navigation | Tab bar ≤ 5; Profile = stack riêng; Directory search debounce ≥ 2 ký tự (đã có pattern) |
| Feedback | Toast sau PATCH; empty «Không tìm thấy…» trung thực (U65) |
| Brand | Primary `#1E40AF`; module tint chỉ icon/chip |

**Cấu trúc màn gợi ý**

| Màn | Structure |
|-----|-----------|
| Home | Stat rows + announcements; deep link Attendance/Leave |
| Directory | Search + list + detail (Plane B slug) |
| Profile ESS | Dynamic form sections (không 15 tabs web) |
| Approvals / Leave | Queue cards + detail sheet |
| Celebrations / Who's out | Hub cards; empty OK |

---

## 9. Component inventory note

`docs/qa/evidence/ux-ui-component-inventory-01.md` hiện **chỉ header stub** (chưa có bảng component).

**Minimum inventory scope (trước khi Lane B migrate hàng loạt):**

| Component | Variants required |
|-----------|-------------------|
| `XButton` | primary / secondary / destructive / ghost — size: sm / md / lg |
| `XDialog` | max-width: sm (480px) / md (640px) / lg (800px) / 2xl (1100px) — zod-driven |
| `XTable` (DataTable wrapper) | sort + filter + bulk checkbox row — accessible (ARIA) |
| `EmptyState` | 3 moods: none (no data yet) / error (system fail) / permission (restricted) |
| `PermissionFallback` | Vietnamese message + CTA "Liên hệ HR" — liên quan UX-07 |

Owner: **Dev-FE**. Deadline: ngay sau Lane A tokens sign-off. DoD: mỗi component có 1 example screen trong `apps/web/hrm/src/components/__examples__/` để QA visual regression.

---

## 10. Trace & next step

| Artifact | Path |
|----------|------|
| Brand audit | `docs/qa/evidence/ux-ui-brand-audit-01.md` |
| Screen matrix | `docs/qa/evidence/ux-ui-erp-screen-matrix-01.md` |
| Component inventory | `docs/qa/evidence/ux-ui-component-inventory-01.md` (**cần bổ sung**) |
| Prompt nguồn | `docs/program/UX-UI-ERP-AUDIT-CURSOR-PROMPT.md` |
| Theme SoT | `apps/web/hrm/tailwind.config.ts` · `apps/web/hrm/src/index.css` |

**Cho Cursor-PM:** file này sẵn sàng **review + fine-tune**. Sau sign-off, Cursor-PM sẽ mở Lane C P0-b (Payroll crash) + Lane A tokens theo thứ tự §6 — không claim Phase1/PROD từ audit.

**ack_status (Claude):** `PASS_TO_PEER` — chờ Cursor review. Nếu Cursor approve, chuyển sang D-MOB mobile lane sau.
