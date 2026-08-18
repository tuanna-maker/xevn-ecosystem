# QA-FE-XEVN-BRAND-PRIMITIVES-L2-01 — FE L2 brand primitives retest

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-FE-XEVN-BRAND-PRIMITIVES-L2-01` |
| **Date** | 2026-07-22 |
| **Role** | QA Lead |
| **Program** | `XEVN-BRAND-FULL-FE-REMASTER` L2 · AC-BRAND-DNA-01/02 |
| **Entry** | Dev READY — `docs/qa/evidence/fe-xevn-brand-primitives-l2-01-20260722.md` |
| **Prior** | L1 QA PASS — `docs/qa/evidence/qa-fe-xevn-brand-tokens-l1-01-20260722.md` |
| **U65** | Zero-seed · static + unit · **HOLD_DEPLOY** (no `:8088` sync required) · no Phase1 / PROD claim |
| **Verdict** | **PASS** (L2 core HRM UI primitives) |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` → dispatch `dev-fe` `FE-XEVN-BRAND-SHELL-L3-01` (and/or L4 screen waves) |
| **evidence_path** | `docs/qa/evidence/qa-fe-xevn-brand-primitives-l2-01-20260722.md` |

---

## 1) Micro-checklist (independent retest)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Core primitives use `border-xevn-border` | **PASS** | Grep hits: button, input, textarea, select, card, table, sheet, drawer, popover, dropdown-menu, hover-card, toast, sonner, alert-dialog, dialog, badge (+ CODE-MEMORY) |
| 2 | Focus DNA uses `ring-xevn-accent` | **PASS** | Grep hits: button, input, textarea, select, sheet close, dialog close, toast action, tabs, checkbox, switch, radio-group, badge |
| 3 | Dark `--primary: 226 71% 40%` + `--ring: 189 94% 43%` | **PASS** | `apps/web/hrm/src/index.css` light+`.dark`; locked by brandPrimitivesL2 |
| 4 | `.saas-table` border token | **PASS** | `index.css` th/td `@apply … border-xevn-border` |
| 5 | Portal ConfirmDialog DNA (L1 carry) | **PASS** | `.xevn-dialog-surface` + cancel `border-xevn-border` + `ring-xevn-accent` |
| 6 | Vitest L2 + a11y + ConfirmDialog | **PASS** | 12 + 5 + 4 = **21/21** exit 0 (below) |
| 7 | Seed / Phase1 / PROD / full remaster | **PASS** (absent) | U65 + HOLD_DEPLOY held |
| 8 | Browser visual smoke Dialog/Toast | **N/A waived** | HOLD_DEPLOY + entry: static+unit đủ nếu browser local khó |

---

## 2) Commands (QA re-run)

```text
cd apps/web/hrm && pnpm test -- \
  src/components/ui/__tests__/brandPrimitivesL2.test.ts \
  src/components/ui/dialogA11yPrimitive.test.ts

→ Test Files  2 passed (2)
→ Tests       17 passed (17)   # 12 brandPrimitivesL2 + 5 dialogA11y
→ exit 0  (~61s)

cd apps/web/web-portal && pnpm test -- \
  src/components/common/ConfirmDialog.test.tsx

→ Test Files  1 passed (1)
→ Tests       4 passed (4)
→ exit 0  (~65s)
```

QA **independently re-executed** Dev suites; counts match Dev READY claim.

---

## 3) Grep sanity (AC-BRAND-DNA)

### In-scope primitives — token present

| Primitive | `border-xevn-border` | `ring-xevn-accent` |
|-----------|----------------------|--------------------|
| button / input / textarea / select | ✓ | ✓ |
| card / table / sheet / drawer | ✓ | sheet ✓ (close) |
| popover / dropdown-menu / hover-card | ✓ | (surface DNA; focus via children) |
| toast / sonner | ✓ | toast ✓ |
| dialog / alert-dialog | ✓ | dialog close ✓; Action/Cancel via `buttonVariants` |
| checkbox / switch / radio / tabs / badge | badge ✓ | ✓ |

### Out-of-wave leftovers (not blocking L2 core)

Still `border-input` / `ring-ring` (residual R-L2f / L4):

- `slider.tsx`, `resizable.tsx`, `toggle.tsx`, `input-otp.tsx`
- `ViDateField.tsx`, `ViMoneyInput.tsx`

These were **outside** Dev L2 micro-checklist (button…toast/sonner + AlertDialog CTA). Logged as residual — do **not** fail this wave.

---

## 4) Scope / claim lock (U65)

| Claim | Status |
|-------|--------|
| Seed used | **No** |
| Pilot `:8088` sync / browser mutate | **Not required** (HOLD_DEPLOY) |
| L3 shell remaster | **Not claimed** |
| L4 business screen hex sweeps | **Not claimed** |
| x-bos-core / `packages/ui` | **Not claimed** |
| Phase1 / PROD | **Not claimed** |

---

## 5) Residual → L3 / L4 (not blocking L2 PASS)

| ID | Layer | Item | Owner / next work_item |
|----|-------|------|------------------------|
| **R-L3-01** | L3 shell | Login dark shell + TopHeader / Sidebar mark polish | `FE-XEVN-BRAND-SHELL-L3-01` |
| **R-L4-01** | L4 screens | Business screen hex sweeps (CC / XBOS) | `FE-XEVN-BRAND-SCREENS-CC-XBOS-01` |
| **R-L4-02** | L4 screens | HRM page rainbow REC tabs / pale body leftovers | `FE-XEVN-BRAND-SCREENS-HRM-01` |
| **R-L4-03** | L4 / separate | x-bos-core palette + `packages/ui` accent quarantine | L4 package wave |
| **R-L2f-01** | L2 follow-up | HRM secondary primitives still generic ring/border: slider, toggle, resizable, input-otp, ViDateField, ViMoneyInput | optional L2 follow-up or fold into L4 HRM |
| **R-VIS-01** | Visual QA | Optional local browser: Dialog/AlertDialog radius+border; Input focus cyan; toast DNA; dark CTA contrast after HSL | after stack up / L3 |
| **R-MOB** | Mobile | RN primitives (peer lane) | `MOB-XEVN-BRAND-PRIMITIVES-L2-01` (separate QA already in flight / done) |

---

## 6) J-* / L2.5 note

Wave is **theme DNA code audit** (U65 static + unit). No J-HRM browser journey claimed. Visual smoke = residual R-VIS-01 only.

---

## 7) Handoff

### completion_report

Closed `QA-FE-XEVN-BRAND-PRIMITIVES-L2-01`: independent grep confirms core HRM `components/ui` primitives use `border-xevn-border` + `ring-xevn-accent`; dark primary/ring HSL + saas-table token OK; portal ConfirmDialog DNA OK. Vitest **21/21** PASS (12+5+4). Residual L3 shell, L4 screens, secondary primitives (slider/toggle/Vi*), visual browser, packages.ui — **not** blocking. No seed / Phase1 / PROD / `:8088` claim.

### next_owner

`pm`

### next_dispatch_prompt

```text
You are PM. work_item_id QA-FE-XEVN-BRAND-PRIMITIVES-L2-01 PASS_TO_PM.
evidence: docs/qa/evidence/qa-fe-xevn-brand-primitives-l2-01-20260722.md
L2 FE primitives closed (static+unit). Dispatch next: FE-XEVN-BRAND-SHELL-L3-01 (dev-fe)
and/or fold R-L2f-01 secondary primitives into L4 HRM screen wave.
Cấm: Phase1/PROD claim · seed · require :8088 until HOLD_DEPLOY lifted.
Optional: QC sample close GWC theme DNA if program needs gate stamp.
```

### ack_status

`PASS_TO_PM`

### evidence_path

`docs/qa/evidence/qa-fe-xevn-brand-primitives-l2-01-20260722.md`

---

*QA Lead · FE L2 brand primitives · 2026-07-22*
