# FE-XEVN-BRAND-PRIMITIVES-L2-01 — UI primitives border + radius + focus

| Field | Value |
|-------|--------|
| **work_item_id** | `FE-XEVN-BRAND-PRIMITIVES-L2-01` |
| **Date** | 2026-07-22 |
| **Owner** | Dev-FE |
| **SoT** | `XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md` L2 · proposal §3 · L1 evidence §5 inventory |
| **entry** | QA L1 PASS `qa-fe-xevn-brand-tokens-l1-01-20260722.md` |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **product_code_changed** | `true` (HRM `components/ui/*` + `index.css` + `tailwind.config.ts`) |
| **U65** | zero-seed · no Phase1/PROD claim · no API change |

---

## 1. Verdict

L2 primitive remaster **closed for wave scope**: HRM shared UI primitives migrated to token **border** (`border-xevn-border`), **radius** (`rounded-input` / `rounded-card`), **focus** (`ring-xevn-accent`), and overlay surfaces (`shadow-soft` / `shadow-overlay`). AlertDialog Action/Cancel inherit button DNA. Optional dark `--primary`/`--ring` HSL aligned to `#1E40AF` / accent. HRM TW `spacing` xs…3xl parity with portal.

**Not claimed:** L3 shell remaster · L4 business screen hex sweeps · x-bos-core / `packages/ui` · Phase1/PROD.

---

## 2. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | button, input, textarea, select, card, table/saas-table, sheet, drawer, popover, dropdown-menu, toast/sonner | **PASS** |
| 1b | AlertDialog Action/Cancel CTA + Description secondary | **PASS** |
| 2 | Prefer `SETTINGS`/`XEVN_*` aliases + `.xevn-dialog-surface` / `.xevn-border` / `.xevn-focus-ring` | **PASS** (portal aliases unchanged; HRM uses same Tailwind class DNA + CSS utilities) |
| 3 | Dark `--primary`/`--ring` HSL align; HRM TW spacing xs…3xl | **PASS** |
| 4 | CODE-MEMORY on touched primitives; unit tests | **PASS** |
| 5 | Evidence → READY_FOR_QA | **PASS** (this file) |

---

## 3. Files changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/ui/button.tsx` | `ring-xevn-accent`; outline `border-xevn-border`; sizes keep `rounded-input` |
| `input.tsx` / `textarea.tsx` | border + focus accent; placeholder `text-xevn-textMuted` |
| `select.tsx` | trigger tokens; content `rounded-card` + border |
| `card.tsx` | `border-xevn-border`; description `textSecondary` |
| `table.tsx` | head `text-xevn-textSecondary`; row/footer borders token |
| `sheet.tsx` / `drawer.tsx` | `shadow-overlay` + `border-xevn-border`; drawer `rounded-t-card` |
| `popover.tsx` / `dropdown-menu.tsx` / `hover-card.tsx` | `rounded-card` + border + `shadow-soft` |
| `toast.tsx` / `sonner.tsx` | border DNA + soft shadow; action focus accent |
| `alert-dialog.tsx` | Action `default` / Cancel `outline` via `buttonVariants`; Description secondary |
| `dialog.tsx` | Description → `text-xevn-textSecondary` |
| `checkbox.tsx` / `switch.tsx` / `radio-group.tsx` / `tabs.tsx` / `badge.tsx` | focus `ring-xevn-accent` |
| `apps/web/hrm/src/index.css` | `.dark --primary`/`--ring`/`--sidebar-*` brand HSL; `.saas-table` border token |
| `apps/web/hrm/tailwind.config.ts` | `spacing` xs…3xl portal parity |
| `…/__tests__/brandPrimitivesL2.test.ts` | **new** static lock (12 tests) |

**Portal:** ConfirmDialog already on `.xevn-dialog-surface` (L1) — no further change this wave.

---

## 4. Tests

| Suite | Result |
|-------|--------|
| `brandPrimitivesL2.test.ts` | **12/12 PASS** |
| `dialogA11yPrimitive.test.ts` | **5/5 PASS** |
| Portal `ConfirmDialog.test.tsx` | **4/4 PASS** |

```bash
cd apps/web/hrm && pnpm test -- src/components/ui/__tests__/brandPrimitivesL2.test.ts src/components/ui/dialogA11yPrimitive.test.ts
```

---

## 5. QA smoke checklist (READY_FOR_QA)

1. HRM embed: open Dialog + AlertDialog — 12px radius, `#E5E7EB` border, overlay elevation; Action primary / Cancel outline.
2. Focus Input / Select / Button — cyan accent ring (`#06B6D4`), not generic blue.
3. Open Popover / Dropdown / Sheet — same border+radius DNA.
4. Trigger a toast (save any form) — card radius + light border.
5. Grep sanity: primitives contain `border-xevn-border` / `ring-xevn-accent`; `.dark --primary: 226 71% 40%` in HRM `index.css`.
6. **Cấm:** seed · Phase1/PROD claim · API.

---

## 6. Residual → L3 / L4

| ID | Residual | Owner wave |
|----|----------|------------|
| R1 | Login dark shell + TopHeader/Sidebar mark polish | `FE-XEVN-BRAND-SHELL-L3-01` |
| R2 | Business screen hex sweeps (CC/XBOS) | `FE-XEVN-BRAND-SCREENS-CC-XBOS-01` |
| R3 | HRM page-level rainbow REC tabs / pale body leftovers | `FE-XEVN-BRAND-SCREENS-HRM-01` |
| R4 | x-bos-core palette + `packages/ui` accent quarantine | L4 / separate |
| R5 | Visual QA dark mode embed (CTA contrast after HSL align) | QA L2 smoke + L3 |
| R6 | Mobile RN primitives | `MOB-XEVN-BRAND-PRIMITIVES-L2-01` |

---

## 7. Completion contract

```yaml
work_item_id: FE-XEVN-BRAND-PRIMITIVES-L2-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/fe-xevn-brand-primitives-l2-01-20260722.md
completion_report: |
  Closed L2: HRM UI primitives (button/input/textarea/select/card/table/sheet/drawer/
  popover/dropdown/hover-card/toast/sonner + checkbox/switch/radio/tabs/badge) migrated
  to border-xevn-border + rounded-input|card + ring-xevn-accent; AlertDialog Action/Cancel
  CTA finished; Dialog/Alert descriptions textSecondary; dark --primary/--ring brand HSL;
  HRM TW spacing xs…3xl; saas-table border token. Tests 12+5 PASS. No API/seed/Phase1 claim.
  Residual: L3 shell, L4 screens, x-bos/packages.ui, mobile L2m, dark visual QA.
next_dispatch_prompt: |
  You are QA. work_item_id QA-FE-XEVN-BRAND-PRIMITIVES-L2-01.
  entry: docs/qa/evidence/fe-xevn-brand-primitives-l2-01-20260722.md READY_FOR_QA.
  SoT: XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2 · AC-BRAND-DNA-01/02.
  Smoke (U65 browser-only, zero-seed): HRM embed Dialog+AlertDialog border/radius;
  Input/Button focus = cyan accent; Popover/Dropdown/Sheet/Toast DNA; static grep
  border-xevn-border + ring-xevn-accent on ui primitives; dark --primary 226 71% 40%.
  Re-run: cd apps/web/hrm && pnpm test -- src/components/ui/__tests__/brandPrimitivesL2.test.ts
  exit PASS_TO_PM or FAIL with residual. evidence_path
  docs/qa/evidence/qa-fe-xevn-brand-primitives-l2-01-20260722.md
  Cấm seed · Phase1/PROD claim · API mutate.
```

---

*Dev-FE · L2 brand primitives · 2026-07-22*
