# UX + Product Design Rules — XeVN OS / X-BOS

> Source: PEER-PM 19-COLLAB + UX-UI-ERP-AUDIT-01 findings (2026-07-28).
> Target: future Cursor/Claude PMs + Dev-FE/Dev-Mobile leads.
> Status: ACTIVE from audit sign-off onwards.

---

## 1. Design Token Discipline

### 1.1 Canonical source

`apps/web/hrm/tailwind.config.ts` (`xevn.*` + HSL `--xevn-color-*`) is the **Single Source of Truth** for color, spacing, radius, shadow, and type. The same hex values are mirrored in `apps/web/web-portal` and must be propagated to `apps/web/x-bos-core` via shared packages or import.

### 1.2 Forbidden patterns (DO NOT)

- Do NOT introduce per-screen inline color without a `xevn.*` or shadcn token that maps back to the canonical HSL.
- Do NOT hardcode `p-8`, `h-40`, `text-blue-600` style values in X-BOS-Core (caused UX-BR-03 / stack drift).
- Do NOT add new brand color without SA sign-off + CSS var addition in `apps/web/hrm/src/index.css` `:root` block.
- Do NOT use two different primary values across HRM and Portal (`xevn-primary` must be identical).

### 1.3 Module tints rule

HRM module tints are **accent-only** — they decorate icons/chips/empty-state glyphs. They never replace `--xevn-color-primary`. If a feature asks for a new tint color, route through the **Brand DNA** queue (FE-XEVN-BRAND-PRIMITIVES-L2-01) — do not unilaterally add.

---

## 2. UX Quality Gates (Mandatory Before Merge)

### 2.1 Nielsen filter (ERP context)

Every new screen or refactor PR must pass these questions:

| Gate | Question | Example pass criteria |
|------|----------|-----------------------|
| Visibility | User knows the system is working? | Loading skeleton or progress bar present |
| Error prevention | Destructive action has typed reason / confirm? | Delete payroll run → typed reason dialog |
| Recognition | Options visible without memorization? | Filter pills, not hidden tab codes |
| Flexibility | Bulk toolbar present when checkboxes shown? | Or remove checkboxes entirely |
| Recovery | Cancel safe / undo exists? | Cancel restores prior state, not crash |

### 2.2 WCAG 2.2 AA (non-negotiable) — latest W3C Rec (Oct 2023)

- **1.4.3 Contrast**: `#111827` text on `#F9FAFB` bg. Never pale gray on gray — "AI trim" style is blocked.
- **2.1.1 Keyboard**: Every dialog primary path and table row action must be reachable without a pointer.
- **2.4.7 Focus visible**: Use `--ring: 189 94% 43%` (cyan) — the utility `xevn-focus-ring` is already in `index.css`.
- **2.4.12 Focus not obscured** (NEW 2.2): CTA must not be hidden by home indicator on mobile screens.
- **3.3.1 / 3.3.2**: Form errors must have inline labels in Vietnamese; no silent Zod skip.

---

## 3. ERP Anti-Patterns (Forbidden by Default)

### 3.1 Tab/Sub-tab explosions

Attendance=15+ sub-tabs, Payroll=12+ sub-tabs, EmployeeProfile=15 tabs. This is P0 territory.

Rules:
- Target max **2 click levels** for any frequent task (daily / weekly / monthly rhythm).
- Do NOT add another tab as a fix — collapse via accordion, wizard, or contextual section.
- If a new domain area is needed, propose a **hub + detail** pattern, not a tab.

### 3.2 God components

Files > 500 LOC in the HR route are **blocked from increment** unless justified in PR description. Preferred splitting:
- Container shell ≤ 250 LOC
- Domain block (form/table) ≤ 350 LOC
- Shared sub-block extracted to `components/ui/`

### 3.3 Mixed table paradigms

`apps/web/hrm/src/components/ui/` already has `DataTable` (shadcn). Do NOT introduce plain `<table>` for list views — it lacks sort, a11y, and keyboard nav.

### 3.4 State proliferation

`useState` count > 10 in a single component is a **smell flagged at review**. Route to `useReducer` grouped by domain (attendanceBlock, payrollBlock, employeeBlock). Race UI/data "nhảy" symptoms = state proliferation root cause.

---

## 4. Mobile HIG Compliance (iOS-first, Android parity)

### 4.1 Touch and layout (non-negotiable)

| Constraint | Minimum | iOS / Android |
|------------|---------|---------------|
| Tap target | 44×44 pt | 44×44 pt (iOS) / 48×48 dp (M3) |
| Body text | 17 pt | 17 pt |
| CTA primary full-width | Yes, when form > 2 fields | ≥ 44pt tall |
| Safe area | Bottom padding `env(safe-area-inset-bottom)` | Required |
| Font scaling | Dynamic Type / "font size in settings" | Supported |

### 4.2 Navigation hard limits

- **Tab bar ≤ 5 items** — if more hub is needed, use "More" overflow (not 6-tab bar).
- **Back swipe** must work (native iOS pattern); edge case back from WebView is fine.
- **Profile is a stack**, not a tab — deep-link to sections, do not collapse into a single screen.

### 4.3 Data parity with web

Mobile must NOT just "port web tabs." Every mobile hub:
- Has a corresponding web section (parity sign-off by BA-B).
- Uses mobile-optimized density (card list > table) except where row-by-row action is primary.
- Brand DNA matches: same primary, accent, module tint roles.

### 4.4 Empty and error honesty (U65 tie-in)

Empty states must say the truth — never "Không có dữ liệu" without a next action. Pattern: label + CTA (or "Liên hệ HR" when permission gap). Never silent null.

---

## 5. Component Library Contract (Lane B)

When Lane B ships `XButton`, `XDialog`, `XTable`, `EmptyState`, `PermissionFallback`:

- **All new list views** MUST use `XTable` or `DataTable` (no plain table).
- **All destructive actions** MUST use `ConfirmDestructive` variant (typed reason at P0 threshold).
- **Permission-gated content** MUST use `PermissionFallback` with Vietnamese message — never silent null.
- **Empty states** MUST provide an actionable CTA, not just a description.
- **Loading states** MUST be Skeleton (not spinner-only) in ERP context.

---

## 6. Brand Escalation Path

If ANY of these arise, stop and file through the Brand governance instead of fast-fixing:

1. New color value (even gray scale adjustment)
2. New font face or weight introduced outside Inter/SF Pro/Roboto
3. Module tint added for a new domain not listed in §1.3
4. Overlay opacity / button height diverging from `shadow-overlay` / `h-10`

Authority: SA-U71 (spec) → FE-XEVN-BRAND-PRIMITIVES-L2-01 (token lock) → SA sign-off.

---

## 7. Lanes Ownership Summary

| Lane | Tracking | Primary Owner | Dependency |
|------|----------|---------------|------------|
| A — Design tokens | UX-UI-ERP-AUDIT-01 §6 | Dev-FE (FE lead) | SA-U71 token sign-off |
| B — Component library | UX-UI-ERP-AUDIT-01 §6 | Dev-FE (FE lead) | Lane A tokens |
| C — Screen refactor (P0) | UX-UI-ERP-AUDIT-01 §6 | Dev-FE + BA AC | Independent of A/B, parallel |
| D — Mobile parity | D-MOB label | Dev-Mobile | Lane C P0-b first; does not block |

---

## 8. Traceability (Audit Chain)

Every UX decision in this project traces to:
- `docs/qa/evidence/ux-ui-brand-audit-01.md` (brand baseline)
- `docs/qa/evidence/ux-ui-erp-screen-matrix-01.md` (10-screen analysis)
- `docs/program/UX-UI-ERP-ANALYSIS.md` (this file's synthesis)
- `docs/program/UX-UI-ERP-AUDIT-CURSOR-PROMPT.md` (writing prompt)

Do NOT overwrite any evidence file without BA-DUAL-PLANE delta.

---

## 9. Runtime Contract (What future PMs MUST preserve)

| Principle | Enforcement mechanism |
|-----------|----------------------|
| Token SoT enforced at build | Lint rule / grep CI on `text-blue-`, `p-8` in X-BOS-Core |
| a11y baseline enforced | axe-core CI step (or manual audit checkpoint at J-MOB) |
| State smell flagged | ESLint complexity rule on `useState` count |
| Tab depth bounded | Design review gate — >2 levels requires AC delta |
| Mobile touch floor | Device Farm test: 44×44pt tap target sample |

---

## 10. UI Copy Discipline — Cấm jargon nội bộ / dev-test artifact trong Production

> Nguồn: sponsor phản ánh trực tiếp qua browser (2026-08-13) — dialog "Danh mục nghiệp vụ" lộ `(extension HRM)`, ghi chú `U65`/`SoT`/`soft-stop`, mã `FR-HRM-SC-*` render thẳng ra UI, và widget dev-test `PickerSmokePreview` còn sót trong production. Audit mở rộng (`PO-HRM-SETTINGS-COPY-HYGIENE-FE-01`, `BA-HRM-SETTINGS-PANEL-IA-AUDIT-01`) xác nhận đây là lỗi **hệ thống, lặp lại ở nhiều màn**, không phải 1 màn đơn lẻ.

### 10.1 Quy tắc cứng (bắt buộc, áp dụng mọi PR — kể cả Cursor)

| # | Quy tắc | Cấm |
|---|---------|-----|
| R1 | Mã tracing (`FR-*`, `AC-*`, `BR-*`, `U6x`/`U7x`, WorkItem ID, Queue ID) chỉ được xuất hiện trong **code comment** (`//`, `/* */`) hoặc khối `@CODE-MEMORY` | Xuất hiện trong bất kỳ chuỗi nào render ra `DialogTitle`, `CardTitle`/`CardDescription`, toast `title`/`description`, placeholder, label, empty-state, thông báo lỗi validate |
| R2 | Thuật ngữ vận hành nội bộ team (`SoT`, `smoke`, `seed/fake`, `soft-stop`, `RETAIN`, `junction`, tên bảng/cột DB snake_case, raw API method+path `GET …/POST …/PUT …`) | Cấm render thẳng cho end-user dưới mọi hình thức — kể cả trong ngoặc đơn phụ chú |
| R3 | Tên đợt/wave nội bộ (`E1-A`, `E1-B`, `E3`, tên ADR, tên epic) | Cấm trong copy user-facing; được phép trong `description` field ở tầng dữ liệu/registry nếu field đó không render trực tiếp (nhưng nên tách riêng field `internalNote` nếu cần giữ, không trộn vào field hiển thị) |
| R4 | Component/section mang tính dev-test ("Thử …", "Preview", "Smoke", "Demo") | Không được mount trong cây render của bất kỳ trang production nào — nếu cần giữ để dev tự kiểm tra cục bộ, gate bằng `import.meta.env.DEV` và tag rõ `// DEV-ONLY`, hoặc xoá hẳn sau khi hết mục đích chẩn đoán (không "để đó" quá 1 sprint) |
| R5 | Dialog tiêu đề phải **cụ thể theo entity + theo chế độ** (`Thêm mới {Tên đối tượng}` / `Cập nhật {Tên đối tượng}`), không dùng cụm chung chung kèm hậu tố kỹ thuật | Cấm tiêu đề tĩnh kiểu "Thêm / cập nhật mục (tên hệ thống nội bộ)" |

### 10.2 Dialog chrome — logo nhất quán

`apps/web/hrm/src/components/ui/dialog.tsx` — `DialogHeader` mặc định `brandChrome = true` đã tự render logo (`/xevn-logo.png`, 32×32, nền trắng) bên trái mọi tiêu đề Dialog. Đây là **chuẩn duy nhất** — mọi Dialog nghiệp vụ PHẢI dùng `<DialogHeader>` mặc định (không truyền `brandChrome={false}`) để tiêu đề popup luôn đồng nhất, logo luôn hiện đầu tiên. Ngoại lệ (sr-only shell, ví dụ `CommandDialog`) phải có SA sign-off ghi rõ trong CODE-MEMORY.

### 10.3 IA chuẩn cho màn danh mục (catalog) trong Cài đặt

Nhắc lại `PAT-SETTINGS-CATALOG-01` (đã khóa sponsor — `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` §3):

- **List**: chỉ bảng + ô tìm kiếm mã/tên + phân trang. Không có block form nào hiện cố định dưới bảng.
- **Mutate**: Dialog/popup — mở qua nút "Thêm mới" cạnh tiêu đề, hoặc click 1 dòng trong bảng để mở Dialog ở chế độ sửa (prefill).
- Mọi tab catalog trong Cài đặt PHẢI theo đúng pattern này hoặc ghi **exception** kèm SA sign-off trong CODE-MEMORY của file đó.

### 10.4 Tự-kiểm trước khi báo READY_FOR_QA (dev-fe)

Chạy grep sau trên file vừa sửa, loại trừ dòng bắt đầu `//`/`/*`/`*` (comment/CODE-MEMORY được phép):

```bash
grep -nE "FR-HRM-|FR-XBOS-|AC-[A-Z-]+-[0-9]|BR-[A-Z-]+-[0-9]|U6[0-9]\)|U7[0-9]\)| SoT\b|seed/fake|smoke only" <file-vừa-sửa> | grep -v "^\s*//\|^\s*\*"
```

Nếu còn match nằm trong JSX text/toast/description/placeholder → chưa xong, phải sửa tiếp trước khi dispatch QA.

### 10.5 Truy vết

- `docs/program/AGENT_MESSAGE_BUS.md` 2026-08-13T12:15 (phát hiện) · `PO-HRM-SETTINGS-COPY-HYGIENE-FE-01` (fix Master Data + 5 file) · `BA-HRM-SETTINGS-PANEL-IA-AUDIT-01` (audit toàn menu Cài đặt còn lại).
- Cross-ref: §1–§2 (token/a11y gates), §3 (anti-pattern God component/tab explosion) trong file này; `PAT-SETTINGS-CATALOG-01` (`PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md`).
