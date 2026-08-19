# Section 02 — Brand Identity Decision

> **WI:** UX-UI-ERP-AUDIT-01
> **Date:** 2026-07-28
> **Scope:** apps/web/hrm, web-portal, x-bos-core, apps/mobile/hrm-mobile
> **Prepared by:** L1 Brand/Layout Audit
> **Source of truth:** `apps/web/hrm/tailwind.config.ts` → `theme.extend.colors.xevn`

---

## Brand Position

XeVN's brand identity rests on a single directional axis: **trust**.

The visual system must communicate operational reliability, regulatory authority, and progressive digital capability simultaneously. Blue anchors authority and trust; teal injects forward energy; the neutral greys provide the restraint that keeps administrative complexity readable.

The locked palette below is the first and final version. No color variant may be added or substituted without a formal change request routed through the design system owner.

---

## 2.1 Color System — FINAL

All tokens below are sourced directly from `tailwind.config.ts` (keys under `theme.extend.colors.xevn`).

| Token | Tailwind class | HEX | HSL | Usage |
|---|---|---|---|---|
| Primary | `xevn-primary` | `#1E40AF` | hsl(226, 71%, 40%) | Navbar, sidebar active state, primary buttons, page headings, link color |
| Primary Pressed | `xevn-primaryPressed` | `#1E3A8A` | hsl(230, 76%, 28%) | Active/pressed states on primary controls, selected nav items |
| Accent | `xevn-accent` | `#06B6D4` | hsl(189, 95%, 43%) | Floating action buttons, progress indicators, active badges, icon accent |
| Success | `xevn-success` | `#10B981` | hsl(160, 84%, 39%) | Status badges (active, completed, approved), validation confirmations |
| Warning | `xevn-warning` | `#F59E0B` | hsl(38, 92%, 50%) | Alerts, pending states, action required badges, form field warnings |
| Error / Danger | `xevn-danger` | `#EF4444` | hsl(0, 84%, 60%) | Error states, destruction actions, validation errors, critical alerts |
| Info | `xevn-info` | `#3B82F6` | hsl(217, 91%, 60%) | Informational tooltips, non-critical notifications, helper badges |
| Neutral | `xevn-neutral` | `#6B7280` | hsl(220, 9%, 46%) | Secondary text, disabled states, placeholder text |
| Background | `xevn-background` | `#F9FAFB` | hsl(210, 20%, 98%) | Page body background (light mode) |
| Surface | `xevn-surface` | `#FFFFFF` | hsl(0, 0%, 100%) | Cards, sidebars, modals, dropdown panels |
| Text (Primary) | `xevn-text` | `#111827` | hsl(220, 13%, 18%) | Headings, body text, label text |
| Text Secondary | `xevn-textSecondary` | `#4B5563` | hsl(220, 9%, 37%) | Descriptions, captions, helper text, table cell secondary text |
| Text Muted | `xevn-textMuted` | `#6B7280` | hsl(220, 9%, 46%) | Disabled labels, timestamps, placeholder content |
| Border | `xevn-border` | `#E5E7EB` | hsl(220, 13%, 91%) | Input borders, card dividers, table gridlines, panel edges |
| Brand Shell | `xevn-brandShell` | `#000000` | hsl(0, 0%, 0%) | Favicon, meta-theme color, splash screen background |

---

## 2.2 Typography — FINAL

All tokens below are sourced directly from `tailwind.config.ts` (keys under `theme.extend.fontFamily`).

| Property | Desktop / Web | Mobile |
|---|---|---|
| Font family | Inter, system-ui, -apple-system, sans-serif | SF Pro / Roboto, fallback to system sans-serif |
| Body text size | 15 px (0.9375 rem) | 17 pt (~22.6 px) |
| Table cell text size | 14 px (0.875 rem) | 15 px (0.9375 rem) |
| Section title size | 20 px (1.25 rem) | 18 pt (~24 px) |
| Line height | 1.5 (150%) | 1.4 (140%) |
| Font weight (body) | 400 (Regular) | 400 (Regular) |
| Font weight (headings) | 600 (SemiBold) | 600 (SemiBold) |

---

## 2.3 Spacing System — FINAL

Sourced from `tailwind.config.ts` → `theme.extend.spacing`.  
A 7-step scale that covers all layout needs from micro-gaps to section-padding.  
Use the named scale tokens rather than arbitrary values to maintain grid consistency.

| Token | Value | Typical use |
|---|---|---|
| `xs` | 4 px (0.25 rem) | Icon-to-label gap, inline element spacing |
| `sm` | 8 px (0.5 rem) | Compressed card padding, tight form rows |
| `md` | 16 px (1 rem) | Standard card padding, form field spacing |
| `lg` | 24 px (1.5 rem) | Section gap, card-to-card spacing |
| `xl` | 32 px (2 rem) | Page section padding, panel inset |
| `2xl` | 48 px (3 rem) | Major layout regions, sidebar vs content gutter |
| `3xl` | 64 px (4 rem) | Max-width container padding, hero/header height |

Additional notes:
- Internal padding for cards, sidebars, and page containers: use `xl` (32 px).
- Gap between form rows within a single form block: use `md` (16 px).
- Gap between unrelated form blocks on the same page: use `lg` (24 px).
- Vertical rhythm between paragraphs and list items: use `sm` (8 px).

---

## 2.4 Border Radius

Sourced from `tailwind.config.ts` → `theme.extend.borderRadius`.

| Token | Value | Element scope |
|---|---|---|
| `input` | 8 px | All form inputs, selects, textareas, date pickers, dropdown toggles |
| `card` | 12 px | Cards, side panels, modal overlays, dropdown menus, table wrappers |

Rule: do not apply arbitrary border-radius values to any component. Every component must use one of the two tokens above or the global `lg`/`md`/`sm` scale tokens.

---

## 2.5 Dark Mode

Dark mode is already implemented via `darkMode: ["class"]` in the root Tailwind configuration (`tailwind.config.ts` line 4). No change is required.

**Activation:** dark mode is toggled by adding or removing the `dark` class on the root `<html>` element. The selector `@custom-variant dark (&:where(.dark, .dark *))` (configured in the global CSS layer) scopes all dark-prefixed tokens accordingly.

**Token parity:** every color token defined in Section 2.1 has a corresponding `--*-foreground` / dark variant managed through CSS custom properties. Component styles reference `hsl(var(--token))` so the same Tailwind class resolves to the correct value in either mode automatically.

**Decision:** Dark mode support is retained as-is. No platform will override or remove it. Future color additions must include a dark-mode equivalent custom property.

