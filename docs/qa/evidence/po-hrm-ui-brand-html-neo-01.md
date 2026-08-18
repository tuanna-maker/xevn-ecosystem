# Evidence — PO-HRM-UI-BRAND-HTML-NEO-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-HTML-NEO-01` |
| **Role** | ba-docs |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` |
| **ack_status** | **PASS_TO_PM** |
| **Research (Prompt 1 — reused, not redone)** | `docs/client-delivery/hrm-enterprise-blueprint/ENTERPRISE_UI_RESEARCH_XE_VN.md` |
| **ADR locks** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` **§15** · evidence `docs/qa/evidence/po-hrm-ui-brand-adr-02.md` |
| **Prompt SoT** | `docs/program/prompts/CLAUDE_ENTERPRISE_UI_RESEARCH_PROMPT.md` (Prompt 2) |
| **Cấm honored** | No `apps/**` · no Face/QR LIVE · no purple/cream · no invent final Body/S3 · no remaster DONE |

---

## 1. Mission closed

Built static HTML neo folder for P0 brand chrome (login, ATT overview, leave dialog, OT dialog, EMP profile + quick-edit modal). Research MD already present — **not** re-run full Prompt 1.

---

## 2. Deliverable paths

| File | Role |
|------|------|
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/index.html` | Hub + CHƯA ĐẠT/ĐẠT + field→max-width table |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/login.html` | Login brandShell + card chrome |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/att-overview.html` | ATT toolbar/KPI + honesty banner Face/QR |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/dialog-leave.html` | Wide leave dialog (~920px), compact fields |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/dialog-ot.html` | Wide OT dialog, compact date/time/num |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/emp-profile.html` | Profile hero + modal sửa nhanh |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/styles.css` | Shared tokens + modal anatomy + field widths |
| `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/assets/xevn-logo.png` | Wordmark (from `assets/brand/xevn-logo-master.png`) |

Alias: `ui-neo/neo.css` = prior draft copy of styles (HTML links **`styles.css`**).

---

## 3. Q1 checklist — 5 giây nhận brand

| # | Criterion | Neo status |
|---|-----------|------------|
| 1 | Thanh/viền xanh `#1E40AF` full-bleed đầu modal | ✅ `.xevn-modal-brand-bar` on all modals + login card |
| 2 | Logo/wordmark nhỏ trái header | ✅ `assets/xevn-logo.png` + `.xevn-wordmark` |
| 3 | Title Montserrat ≥20, màu tối `#111827` | ✅ `.xevn-modal-title` 1.25rem / 700 |
| 4 | Không nhầm AI tím/cream | ✅ primary blue + light ops canvas only |
| 5 | Primary CTA `#1E40AF` | ✅ `.btn-primary` |

---

## 4. Q2 / dialog-form checklist

| # | Criterion | Neo status |
|---|-----------|------------|
| 1 | Glass/blur header nhẹ, không glow | ✅ `.xevn-modal-header-glass` |
| 2 | Body Source Sans 3 (PENDING B5) ≥12–14px sắc | ✅ Google Fonts link; body 14px `#111827` |
| 3 | Field ngắn không full-width | ✅ `.xevn-field-date|time|code|num|…` |
| 4 | Leave/OT dialog ≥ ~900px | ✅ `.xevn-modal--wide` max-width 920px |
| 5 | Footer Hủy + primary; destructive tách | ✅ leave/OT/emp footers |
| 6 | Không Face/QR LIVE | ✅ ATT honesty banner «Chưa mở» |
| 7 | Grid nhóm field | ✅ `.form-grid` 12-col |
| 8 | So CHƯA ĐẠT vs ĐẠT | ✅ compare panels on every page |

---

## 5. Residual (not invented)

| ID | Item | Owner |
|----|------|-------|
| R-B5 | Body font final A/B/C | Sponsor — SA lean **A Source Sans 3** |
| R-S3 | Stub chrome A vs B | Sponsor — SA lean **A** (neo uses A working assumption) |
| R-FE | Wire dialog chrome in product | Dev-FE after optional Body/S3 one-liner |

---

## 6. Handoff contract

```yaml
work_item_id: PO-HRM-UI-BRAND-HTML-NEO-01
from_role: ba-docs
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-html-neo-01.md
completion_report: >
  HTML neo P0 delivered under ui-neo/ (styles.css + 6 HTML + logo).
  Research path reused. Q1/Q2 checklists PASS on static demos.
  apps/** untouched. Face/QR not LIVE.
next_owner: pm
next_dispatch_prompt: >
  PM → Dev-FE foundation dialog chrome after sponsor optional Body/S3
  OR proceed with SA rec Body=A Source Sans 3 · S3=A
  (map ui-neo .xevn-modal-* + .xevn-field-* to shadcn Dialog; no API/SRS change;
  no remaster DONE claim).
pm_dispatch_hint: PO-HRM-UI-BRAND-FE-FOUNDATION-01 — wire Montserrat + Source Sans 3 interim + brand dialog chrome from ui-neo
```
