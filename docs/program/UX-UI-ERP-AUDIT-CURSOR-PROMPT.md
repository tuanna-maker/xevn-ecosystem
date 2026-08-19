# Writing prompt — UX-UI-ERP-ANALYSIS.md

**Ngữ cảnh:** hiện tại file đang có 59 lines placeholder. Cần viết lại hoàn toàn ở cấp độ senior PM (30 năm kinh nghiệm product) — không phải list issues thông thường.

## Files bạn cần đọc trước khi viết

1. `docs/qa/evidence/ux-ui-brand-audit-01.md` — brand audit
2. `docs/qa/evidence/ux-ui-component-inventory-01.md` — component inventory
3. `docs/qa/evidence/ux-ui-erp-screen-matrix-01.md` — 10 màn, 12 issues, backlog
4. `apps/web/hrm/tailwind.config.ts` — theme config thực tế
5. `apps/web/hrm/src/index.css` — CSS vars thực tế

## Cấu trúc file OUTPUT: docs/program/UX-UI-ERP-ANALYSIS.md

### Phần 1: Executive Summary (1 đoạn, 3 bullets)
- Brand đã có nền tốt, cần thống nhất
- 3 vấn đề P0 và business impact của từng cái
- Mobile chưa đạt chuẩn

### Phần 2: Framework đánh giá
**2.1 Nielsen 10 Heuristics** — mỗi heuristic: tên + 1 câu mô tả + applicability đến ERP
**2.2 WCAG 2.1 AA** — requirements liên quan ERP
**2.3 iOS HIG + Material 3** — mobile-specific standards
**2.4 Severity Rating** — bảng 0-4 với definition + action

### Phần 3: UX Minimum Standards (quy tắc tối thiểu)
- Visibility (breadcrumb, active state)
- Error prevention (destructive confirmation)
- Recognition > Recall
- Flexibility (bulk action)
- Recovery (undo/cancel)
- Consistency
- Loading/Empty/Error states
- Mobile touch target (44x44pt iOS, 48x48dp Android)
- iOS HIG compliance (back swipe, safe area, font scaling)

### Phần 4: Brand Identity Decision (FINAL, dùng chung)
- Color system table: Token, HEX, HSL, Usage
- Typography: Web Inter, Mobile SF Pro/Roboto
- Spacing: 7 bước 4→64px
- Radius: Input 8px, Card 12px

### Phần 5: Vấn đề theo mức độ (MỖI vấn đề PHẢI có Business Impact)
P0: Payroll crash, Attendance quá tải, EmployeeProfile 15 tabs
P1: X-BOS-Core font, spacing, mixed table, state, form validation
P2: overlay, button height, i18n

### Phần 6: Đề xuất Lanes (A/B/C/D) với owner, deliverable, priority

### Phần 7: Mobile UX Standards (iOS HIG chi tiết)
- Touch target, font size, safe area, swipe gestures
- App structure cho từng màn mobile

## Quy tắc writing
- Tiếng Việt, giọng senior PM (không linh tinh, có structure)
- Mỗi vấn đề PHẢI có business impact (không chỉ technical issue)
- Mỗi recommendation PHẢI có rationale
- Markdown format, table-heavy
- Mỗi app (HRM, Portal, XBOS, Mobile) có section riêng
