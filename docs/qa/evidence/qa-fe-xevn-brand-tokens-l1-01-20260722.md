# QA-FE-XEVN-BRAND-TOKENS-L1-01 — CSS `:root` ↔ Tailwind `xevn.*` L1

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-FE-XEVN-BRAND-TOKENS-L1-01` |
| **Date** | 2026-07-22 |
| **Owner** | QA |
| **from_role** | pm / Dev-FE READY |
| **SoT** | `XEVN_BRAND_UIUX_PROPOSAL.md` §3 · Full FE remaster L1 · `fe-xevn-brand-tokens-l1-01-20260722.md` |
| **entry** | `docs/qa/evidence/fe-xevn-brand-tokens-l1-01-20260722.md` READY_FOR_QA |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no Phase1/PROD claim · static + unit only |

---

## 1. Verdict

| Gate | Result |
|------|--------|
| Proposal §3 hex ↔ portal/HRM `:root --xevn-*` | **PASS** |
| `:root` ↔ Tailwind `xevn.*` lockstep (case-insensitive) | **PASS** (`HEX_LOCKSTEP_PASS`) |
| Radius / shadow / space CSS vars | **PASS** |
| Utilities `.xevn-border` / `.xevn-focus-ring` / `.xevn-dialog-surface` / `.xevn-safe-inline` | **PASS** (portal + HRM) |
| ConfirmDialog + HRM Dialog/AlertDialog border/radius/overlay | **PASS** (static) |
| Settings aliases `XEVN_*` / `SETTINGS_RADIUS_*` | **PASS** |
| Unit: ConfirmDialog 4/4 · dialogA11yPrimitive 5/5 | **PASS** |
| Full FE remaster / L2–L4 | **NOT claimed** |
| HRM shadcn `.dark --primary` / `--ring` | **Residual → L2/L4** (not L1 FAIL) |

**Overall: PASS_TO_PM** — L1 token foundation accepted. Next: `FE-XEVN-BRAND-PRIMITIVES-L2-01`.

---

## 2. Micro-checklist

| # | Check | Method | Result |
|---|--------|--------|--------|
| 1 | CSS `:root` / Tailwind `xevn.*` alignment | Diff proposal §3.1–3.2 vs both `index.css` + both TW configs | **PASS** |
| 2 | Spot ring/border utilities | Grep `.xevn-border`, `.xevn-focus-ring`, `ring-xevn-accent`, `border-xevn-border` | **PASS** |
| 3 | Residual HRM shadcn primary drift L2/L4 | Read HRM `:root` light vs `.dark` | **NOTED** (below) |
| 4 | Evidence this file → PASS_TO_PM | Written | **PASS** |
| 5 | `next_dispatch_prompt` L2 | §7 | **PASS** |

---

## 3. `:root` ↔ Tailwind lockstep (proposal §3)

| Token | Proposal | Portal CSS | HRM CSS | Portal TW `xevn.*` | HRM TW `xevn.*` |
|-------|----------|------------|---------|--------------------|-----------------|
| Primary | `#1E40AF` | `--xevn-color-primary` | same | `primary` | same |
| Primary pressed | `#1E3A8A` | `--xevn-color-primary-pressed` | same | `primaryPressed` | same |
| Accent | `#06B6D4` | `--xevn-color-accent` | same | `accent` | same |
| Success / Warning / Danger / Info | DNA hex | present | present | present | present |
| Surface / Background | `#FFFFFF` / `#F9FAFB` | present | present | present | present |
| Text / secondary / muted | `#111827` / `#4B5563` / `#6B7280` | present | present | present | present |
| Border | `#E5E7EB` | present | present | present | present |
| Brand shell | `#000000` | present | present | `brandShell` | same |
| Radius input / card | `8px` / `12px` | CSS vars | CSS vars | `rounded-input` / `rounded-card` | same |
| Shadow soft / overlay | proposal formulas | CSS vars | CSS vars | `shadow-soft` / `shadow-overlay` | same |
| Space xs…3xl | 4…64px | `--xevn-space-*` both apps | same | portal TW `spacing` extend | **CSS only** (HRM TW no `spacing` extend — L2 soft) |

**Files:** `apps/web/web-portal/src/index.css` · `apps/web/hrm/src/index.css` · `web-portal/tailwind.config.cjs` · `hrm/tailwind.config.ts`

**Also verified (portal):** `*:focus-visible` → `--xevn-color-accent`; selection / scrollbar / `.gradient-text` use `--xevn-*`.

---

## 4. Ring / border utilities spot

| Utility / class | Portal | HRM | Notes |
|-----------------|--------|-----|-------|
| `.xevn-border` | `@layer utilities` → `var(--xevn-color-border)` | same | **PASS** |
| `.xevn-focus-ring` | accent outline + soft box-shadow | accent outline (no box-shadow twin) | **PASS** (portal richer; OK L1) |
| `.xevn-dialog-surface` | radius-card + border + surface + overlay shadow | same | **PASS** |
| `.xevn-safe-inline` | present | present | **PASS** |
| `ConfirmDialog` | `className="xevn-dialog-surface …"`; cancel `border-xevn-border` + `ring-xevn-accent` | — | **PASS** |
| HRM `DialogContent` | — | `rounded-card border-xevn-border shadow-overlay`; close `focus:ring-xevn-accent` | **PASS** |
| HRM `AlertDialogContent` | — | same border/radius/overlay DNA | **PASS** |
| Aliases | `XEVN_BORDER` / `XEVN_FOCUS_RING` / `XEVN_DIALOG_SURFACE` / `SETTINGS_RADIUS_*` in `settings-form-pattern.tsx` | — | **PASS** |

---

## 5. HRM shadcn `--primary` drift (residual L2 / L4)

| Mode | `--primary` today | vs `#1E40AF` | QA |
|------|-------------------|--------------|-----|
| **Light** | `226 71% 40%` | Aligned | OK |
| **`.dark`** | `221 83% 60%` | Drift (blue-600-ish) | **Ticket L2/L4** |
| `--ring` light | `189 94% 43%` (cyan ≈ accent) | OK | OK |
| `--ring` / `--sidebar-primary` dark | `221 83% 60%` | Drift with dark primary | **Ticket L2/L4** |
| Dark `--accent` | `173 80% 45%` (teal) | ≠ `#06B6D4` cyan | Soft residual L2/L4 |
| `--radius` | `0.5rem` (8px) | OK for input; cards use `rounded-card` 12px | OK |

**L1 policy confirmed:** dark HSL left unchanged to avoid UF regressions — **not** an L1 FAIL.

---

## 6. Unit evidence

| Suite | Command | Result |
|-------|---------|--------|
| Portal ConfirmDialog | `pnpm --filter web-portal exec vitest run src/components/common/ConfirmDialog.test.tsx` | **4/4 PASS** |
| HRM dialog a11y | `pnpm --filter vite_react_shadcn_ts exec vitest run src/components/ui/dialogA11yPrimitive.test.ts` | **5/5 PASS** |

Browser live Dialog smoke: **N/A** this wave (token/static gate; U65 no seed). Visual Dialog chrome remains smoke item on L2 handoff.

---

## 7. Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R1 | Full L2 primitive migrate (button/input/select/sheet/drawer/popover/toast/table…) | Dev-FE `FE-XEVN-BRAND-PRIMITIVES-L2-01` |
| R2 | HRM `.dark --primary` / `--ring` / `--sidebar-primary` (+ optional dark accent cyan) | L2 optional or L4b |
| R3 | HRM Tailwind missing `spacing` xs…3xl extend (CSS vars exist) | L2 soft |
| R4 | x-bos-core / `packages/ui` palette parity | L4 (out of L1/L2) |
| R5 | Business page hex sweeps | L3/L4 |

**Cấm claim:** Phase1 DONE · PROD-READY · full FE remaster.

---

## 8. Completion contract

```yaml
work_item_id: QA-FE-XEVN-BRAND-TOKENS-L1-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/qa-fe-xevn-brand-tokens-l1-01-20260722.md
completion_report: |
  Closed L1 QA: proposal §3 hex lockstep CSS:root ↔ Tailwind xevn.* (portal+HRM);
  utilities .xevn-border / .xevn-focus-ring / .xevn-dialog-surface verified;
  ConfirmDialog + HRM Dialog/AlertDialog token border/radius/overlay static PASS;
  unit 4+5 PASS. Residual: dark shadcn primary/ring drift + L2 primitives + HRM spacing TW.
  No Phase1/PROD/full-remaster claim.
next_dispatch_prompt: |
  You are Dev-FE. work_item_id FE-XEVN-BRAND-PRIMITIVES-L2-01.
  SoT: docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2 · proposal §3 ·
  evidence docs/qa/evidence/fe-xevn-brand-tokens-l1-01-20260722.md §5 inventory ·
  QA residual docs/qa/evidence/qa-fe-xevn-brand-tokens-l1-01-20260722.md §5–§7.
  Migrate HRM ui primitives border+radius+focus ring from tokens:
  button, input, textarea, select, card (border-xevn-border), table/saas-table,
  sheet, drawer, popover, dropdown-menu, toast/sonner; finish AlertDialog Action/Cancel CTA;
  optional: dark --primary/--ring/--sidebar-primary HSL align if visual QA green;
  optional: HRM tailwind spacing xs…3xl extend parity with portal.
  Prefer SETTINGS / XEVN_* aliases and .xevn-dialog-surface.
  Cấm seed · Phase1 claim · API. exit READY_FOR_QA.
  evidence_path docs/qa/evidence/fe-xevn-brand-primitives-l2-01-20260722.md
  code_memory_required: true.
```

---

*QA · L1 brand tokens · 2026-07-22*
