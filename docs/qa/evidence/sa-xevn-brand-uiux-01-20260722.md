# Evidence — SA-XEVN-BRAND-UIUX-01

| Field | Value |
|-------|-------|
| **work_item_id** | `SA-XEVN-BRAND-UIUX-01` |
| **from_role** | sa |
| **to_role** | pm |
| **date** | 2026-07-22 |
| **lane** | governance (research only — no `apps/**`) |
| **ack_status** | **PASS_TO_PM** |
| **proposal_path** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` |

---

## completion_report

### Closed

- Led SoT proposal **XeVN Precision Motion** tại `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` (đầy đủ §0–§11).
- Brand audit HTML / web portal / HRM mobile từ artifact thật (grep + read — không sửa product code).
- Logo system: clear space từ bounding cánh, min size, on black/white, **cấm UNICOM** hero trên docs XeVN.
- Token table: color / radius / shadow / type / spacing với cột CSS var + Tailwind + RN.
- Signature patterns: dark shell · light chrome · list→detail · sticky glass.
- Apple HIG mapping (principles).
- Rollout P0–P3 + AC + brand test; out of scope; Option A recommend.
- Defaults plan đã khóa: light-first `#1E40AF` / dark shell only / P0→P3.

### Residual

- Peer notes ba-docs / Dev-FE / Dev-Mobile: **chưa có** trong evidence này lúc SoT — § Peer merge trống; PM merge khi các lane để note.
- Implement **blocked** đến sponsor «OK / làm P0».
- HTML BRD/SRS shell generator có thể tái nhúng UNICOM sau build — P0 phải đụng template/assets, không chỉ 1 file `00_*`.

### Key evidence cites

| Finding | Path |
|---------|------|
| Master logo (wings on black) | `assets/brand/xevn-logo-master.png` + `assets/brand/README.md` |
| UNICOM on XeVN ecosystem HTML cover | `docs/client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html` (title, header, `logo-unicom.png`, footers) |
| Client delivery README documents UNICOM logo | `docs/client-delivery/README.md` |
| Web tokens PRIMARY / card / soft | `apps/web/web-portal/tailwind.config.cjs` |
| Safe inline + glass | `apps/web/web-portal/src/index.css` |
| Login light shell (gap vs dark shell decision) | `apps/web/web-portal/src/pages/auth/LoginPage.tsx` |
| Chrome missing mark | `apps/web/web-portal/src/components/layout/TopHeader.tsx` |
| Mobile logo component | `apps/mobile/hrm-mobile/src/components/brand/XevnLogo.tsx` |
| Splash already dark Precision Motion | `apps/mobile/hrm-mobile/src/components/brand/SplashIntro.tsx` |
| RN token mirror | `apps/mobile/hrm-mobile/src/theme/tokens.ts` |
| Mobile DS (complement, not replace) | `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` |
| Luxury law | `.cursorrules` §2 |
| A11y / vi-VN | `.cursor/rules/uiux-quality-accessibility.mdc` |

### Scope discipline

- **No** edits under `apps/**` / packages / product runtime.
- **No** Phase 1 / PROD claim.
- **No** SRS/API change.

---

## Peer merge log

| Role | Notes path / summary | Merged into proposal? |
|------|----------------------|------------------------|
| ba-docs | `ba-xevn-html-brand-gap-01-20260722.md` — 5/5 UNICOM; AC-HTML-BRAND-01..06; cover template | **Yes** §1.5 + P0 AC |
| Dev-FE | `fe-xevn-brand-token-feasibility-01-20260722.md` — Tailwind SoT; no second system | **Yes** §1.5 |
| Dev-Mobile | `mob-xevn-brand-token-feasibility-01-20260722.md` — tokens.ts; Android drift | **Yes** §1.5 |

**Secondary hex chốt:** `#06B6D4` (portal accent). Print logo: export non-black-plate for white covers (P0).

---

## Architecture decision (short)

**Option A:** Dual-surface (dark brand shell + light product) + single logo SoT + HTML P0 first.  
Reject B (light-only shell) and C (full dark product).

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-XEVN-BRAND-SPONSOR-PRESENT-01
role: pm
entry_criteria: docs/program/XEVN_BRAND_UIUX_PROPOSAL.md exists; evidence docs/qa/evidence/sa-xevn-brand-uiux-01-20260722.md PASS_TO_PM
action:
  1) Present SoT «XeVN Precision Motion» to sponsor (summary §0 + audit UNICOM gap + P0–P3).
  2) Ask for explicit: «OK / làm P0» OR change requests.
  3) ONLY after OK — dispatch ba-docs P0 (HTML XeVN logo, cấm UNICOM hero) with AC from proposal §6 P0; then FE P1 / mobile P2 as sequenced.
cấm: implement apps/** before sponsor OK; claim Phase1/PROD; seed.
exit_criteria: bus note sponsor decision; if OK → DISPATCHED ba-docs P0 with evidence_path
evidence_path: docs/qa/evidence/pm-xevn-brand-sponsor-present-01.md
```

---

## ack_status

**PASS_TO_PM**
