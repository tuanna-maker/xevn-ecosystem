# FE-XEVN-BRAND-TOKENS-L1-01 — CSS `:root` + Tailwind SoT + Dialog border bootstrap

| Field | Value |
|-------|--------|
| **work_item_id** | `FE-XEVN-BRAND-TOKENS-L1-01` |
| **Date** | 2026-07-22 |
| **Owner** | Dev-FE |
| **SoT** | `XEVN_BRAND_UIUX_PROPOSAL.md` §3 · `XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md` L1 · feasibility `fe-xevn-brand-token-feasibility-01-20260722.md` |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` (token smoke) → then PM dispatch `FE-XEVN-BRAND-PRIMITIVES-L2-01` |
| **product_code_changed** | `true` (portal + HRM CSS / Dialog / ConfirmDialog only) |

---

## 1. Verdict

L1 token foundation is **closed for wave scope**: portal + HRM `:root --xevn-*` aligned to proposal §3; Tailwind `xevn.*` remains **class SoT**; shared utilities `.xevn-border` / `.xevn-focus-ring` / `.xevn-dialog-surface` + settings aliases; **safe Dialog/AlertDialog/ConfirmDialog** border+radius+overlay wired. **Not** claiming full-app remaster (L2–L4 remain).

---

## 2. CSS `:root` map (proposal §3 → vars)

| Proposal token | CSS var | Hex / value |
|----------------|---------|-------------|
| Primary | `--xevn-color-primary` | `#1E40AF` |
| Primary pressed | `--xevn-color-primary-pressed` | `#1E3A8A` |
| Accent | `--xevn-color-accent` | `#06B6D4` |
| Success / Warning / Danger / Info | `--xevn-color-*` | DNA hex |
| Surface / Background | `--xevn-color-surface` / `background` | `#FFFFFF` / `#F9FAFB` |
| Text / secondary / muted | `--xevn-color-text*` | `#111827` / `#4B5563` / `#6B7280` |
| Border | `--xevn-color-border` | `#E5E7EB` |
| Brand shell | `--xevn-color-brand-shell` | `#000000` |
| Radius input / card | `--xevn-radius-input` / `card` | `8px` / `12px` |
| Shadow soft / overlay | `--xevn-shadow-*` | proposal formulas |
| Space xs…3xl | `--xevn-space-*` | 4…64px (**added L1**) |

**Files:** `apps/web/web-portal/src/index.css` · `apps/web/hrm/src/index.css`

**Also wired to vars (portal):** `*:focus-visible`, `::selection`, scrollbar track/thumb, `.gradient-text`.

---

## 3. Tailwind `xevn.*` SoT map (document)

| Intent | Tailwind class(es) | Config site |
|--------|-------------------|-------------|
| Primary CTA | `bg-xevn-primary`, `text-xevn-primary`, `ring-xevn-primary` | `web-portal/tailwind.config.cjs` (+ HRM `xevn` block) |
| Accent / focus | `ring-xevn-accent`, `border-xevn-accent` | same |
| Surface / canvas | `bg-xevn-surface`, `bg-xevn-background` | same |
| Text floors | `text-xevn-text`, `textSecondary`, `textMuted` | same |
| Border | `border-xevn-border` | same |
| Radius | `rounded-input` (8) · `rounded-card` (12) | `borderRadius.input|card` |
| Shadow | `shadow-soft` · `shadow-overlay` | `boxShadow.soft|overlay` |
| Aliases | `SETTINGS_RADIUS_*`, `XEVN_BORDER`, `XEVN_FOCUS_RING`, `XEVN_DIALOG_SURFACE` | `settings-form-pattern.tsx` |
| CSS utilities | `.xevn-dialog-surface`, `.xevn-border`, `.xevn-focus-ring`, `.xevn-safe-inline` | `index.css` |

**Law:** Do **not** invent parallel names (`brand-blue`, etc.). Hex in Tailwind config must match `:root` (comment lock on portal config).

---

## 4. L1 code delivered (minimal)

| Change | Path |
|--------|------|
| `:root` + space + focus/selection + utilities | `apps/web/web-portal/src/index.css` |
| Same vars + utilities + dark-primary drift note | `apps/web/hrm/src/index.css` |
| ConfirmDialog → `.xevn-dialog-surface` + danger DNA | `apps/web/web-portal/src/components/common/ConfirmDialog.tsx` |
| DialogContent token border/radius/overlay | `apps/web/hrm/src/components/ui/dialog.tsx` |
| AlertDialogContent same | `apps/web/hrm/src/components/ui/alert-dialog.tsx` |
| Pattern aliases for L2 | `settings-form-pattern.tsx` |
| Config SoT comment | `web-portal/tailwind.config.cjs` |

**Tests:** `ConfirmDialog.test.tsx` 4/4 PASS · `dialogA11yPrimitive.test.ts` 5/5 PASS.

---

## 5. L2 primitive inventory (migrate next)

| Primitive | Path | L2 focus |
|-----------|------|----------|
| Dialog | `apps/web/hrm/src/components/ui/dialog.tsx` | **Started L1** — finish focus/title tokens, Description muted→secondary |
| AlertDialog | `apps/web/hrm/src/components/ui/alert-dialog.tsx` | **Started L1** — Action/Cancel → xevn CTA |
| ConfirmDialog (portal) | `apps/web/web-portal/src/components/common/ConfirmDialog.tsx` | **Started L1** — smoke only |
| Sheet / Drawer | `hrm/.../sheet.tsx`, `drawer.tsx` | border + overlay shadow |
| Popover / Dropdown / HoverCard | `popover.tsx`, `dropdown-menu.tsx`, `hover-card.tsx` | `border-xevn-border` + `rounded-card` |
| Toast / Sonner | `toast.tsx`, `toaster.tsx`, `sonner.tsx` | border DNA |
| Button | `button.tsx` | `focus-visible:ring-xevn-accent`; outline=`border-xevn-border` |
| Input / Textarea / Select | `input.tsx`, `textarea.tsx`, `select.tsx` | `rounded-input` + focus ring |
| Card | `card.tsx` | already `rounded-card`/`shadow-soft` — lock `border-xevn-border` |
| Table | `table.tsx` + `.saas-table` in HRM `index.css` | header `text-xevn-textSecondary` |
| Checkbox / Switch / Radio | `checkbox.tsx`, `switch.tsx`, `radio-group.tsx` | ring/accent |
| Tabs / Badge | `tabs.tsx`, `badge.tsx` | primary DNA; demote rainbow REC later (L4b) |
| Portal chrome popovers | `TopHeader.tsx` membership/profile menus | already mostly token — verify |

**Out of L2 (→ L4):** business page hex sweeps, x-bos-core palette parity, `packages/ui` accent quarantine.

---

## 6. HRM shadcn `--primary` drift (ticket — do not break UF)

| Mode | `--primary` today | vs `#1E40AF` |
|------|-------------------|--------------|
| **Light** | `226 71% 40%` | **Aligned** (FE-00) |
| **`.dark`** | `221 83% 60%` | **Drift** — blue-600-ish |
| `--radius` | `0.5rem` (8px) | OK for input; card uses `rounded-card` 12px separately |
| `--ring` light | accent cyan HSL | OK |
| `--ring` dark | `221 83% 60%` | Drift with dark primary |

**Ticket for L2 / L4b:** Remap `.dark --primary` / `--sidebar-primary` / `--ring` to brand HSL; visual QA embed dark (if used). **L1 deliberately did not change dark HSL** to avoid UF regressions.

---

## 7. QA smoke checklist (READY_FOR_QA)

1. Portal login / any ConfirmDialog: panel has 12px radius + light gray border + overlay elevation (not generic `rounded-lg` + `shadow-lg`).
2. HRM embed: open any Dialog / AlertDialog — same border/radius DNA; a11y Title still present; no console TitleWarning regression.
3. Focus a portal input: accent outline/ring (cyan `#06B6D4`), not random blue.
4. Grep sanity: `--xevn-color-primary` present in portal + HRM `index.css`; no claim of full FE remaster.

**Cấm:** seed · Phase1/PROD claim · API changes.

---

## 8. Completion contract

```yaml
work_item_id: FE-XEVN-BRAND-TOKENS-L1-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/fe-xevn-brand-tokens-l1-01-20260722.md
completion_report: |
  Closed L1: :root --xevn-* (+ space) on portal/HRM; Tailwind xevn.* documented as class SoT;
  utilities .xevn-dialog-surface / border / focus-ring; ConfirmDialog + HRM Dialog/AlertDialog
  token border/radius/overlay; settings aliases; dark --primary drift ticketed for L2/L4b.
  Tests: ConfirmDialog 4 PASS; dialogA11yPrimitive 5 PASS.
  Residual: full L2 primitive migrate; x-bos/packages.ui drift; dark HSL primary; L3/L4 screens.
next_dispatch_prompt: |
  You are Dev-FE. work_item_id FE-XEVN-BRAND-PRIMITIVES-L2-01.
  SoT: docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2 · proposal §3 ·
  evidence docs/qa/evidence/fe-xevn-brand-tokens-l1-01-20260722.md §5 inventory.
  Migrate HRM ui primitives border+radius+focus ring from tokens:
  button, input, textarea, select, card (border-xevn-border), table/saas-table,
  sheet, drawer, popover, dropdown-menu, toast/sonner; finish AlertDialog Action/Cancel CTA;
  optional dark --primary HSL align if visual QA green.
  Prefer SETTINGS / XEVN_* aliases and .xevn-dialog-surface. Cấm seed · Phase1 claim · API.
  exit READY_FOR_QA. evidence_path docs/qa/evidence/fe-xevn-brand-primitives-l2-01-20260722.md
  code_memory_required: true.
```

---

*Dev-FE · L1 tokens foundation · 2026-07-22*
