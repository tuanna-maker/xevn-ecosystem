# UX-UI-BRAND-AUDIT-01 — Brand identity + layout pattern audit

| Field | Value |
|-------|-------|
| **work_item** | UX-UI-ERP-AUDIT-01 (L1) |
| **scope** | apps/web/hrm, web-portal, x-bos-core, mobile |
| **date** | 2026-07-28 |

## 1. Màu hệ thống (Color System)

| Màu | HEX | Usage | Apps |
|-----|-----|-------|------|
| Primary | #1E40AF | Brand, header, sidebar active | HRM, Portal, Mobile |
| Accent | #06B6D4 | Focus, link, secondary CTA | HRM, Portal |
| Success | #10B981 | Active, approved, success state | All |
| Warning | #F59E0B | Pending, expiring, attention | All |
| Error | #EF4444 | Fail, cancel, destructive | All |
| Background | #F9FAFB | Page bg, card bg | Web |
| Text primary | #111827 | Headings, body | Web |

Mobile: recruitment purple, attendance teal, payroll amber.

Verdict: Brand DNA nhất quán 3 apps web, có đúc design token tập trung.

## 2. Typography

| Layer | Font | Floor size | Scale |
|-------|------|-----------|-------|
| Web | Inter | 15px body (14px table) | rem, 20px title |
| Mobile | SF Pro / Roboto | 17pt body | pt per HIG |
| X-BOS-Core | KHONG import Inter | — | — |

ISSUE P1: X-BOS-Core thiếu @import Inter → font fallback khac.

## 3. Spacing

7-step scale (4px-64px), input 8px, card 12px. Mobile 16px H, 48px CTA, 44px touch min.

ISSUES:
- P1: xevn-safe-inline clamp khac HRM (3rem) vs Portal (2rem)
- P1: X-BOS-Core p-8 hardcode

## 4. Layout Patterns

HRM: dual-mode sidebar+header vs embed, dark gradient sidebar, 4-tab mobile bottom nav.
Portal: MainLayout sidebar vs ExecutiveDashboard full-width, membership switcher + tenant badges.
X-BOS-Core: glass-morphism sidebar, no shadcn, missing dark mode (P1).
Mobile: iOS HIG grouped + ESS stat rows.

## 5. Dialog / Popup

HRM: shadcn Dialog max-w-lg, zoom+slide.
Portal: ConfirmDialog max-w-md, fade.
Mobile: bottom-sheet slide up.

ISSUES:
- P2: Overlay opacity khac nhau
- P2: Button height 40/42/~36px khac nhau

## 6. Issue register

| ID | Issue | Priority |
|----|-------|----------|
| UX-BR-01 | X-BOS-Core missing Inter | P1 |
| UX-BR-02 | safe-inline clamp inconsistent | P1 |
| UX-BR-03 | X-BOS-Core p-8 hardcode | P2 |
| UX-BR-04 | Dialog overlay opacity | P2 |
| UX-BR-05 | Button height inconsistent | P2 |
| UX-BR-06 | X-BOS-Core missing dark mode | P1 |
