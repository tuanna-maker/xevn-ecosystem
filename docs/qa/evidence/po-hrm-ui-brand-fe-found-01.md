# PO-HRM-UI-BRAND-FE-FOUND-01 — W2 theme foundation (modal chrome + pale gate)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-FOUND-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` → `pm` (W3 squads) |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · Wave **W2** |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §7–§10 **Accepted** |
| **Sibling evidence** | `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md` (parallel FOUNDATION-01 — token confirm) |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §7 token table · §7.4 muted ≠ body · §8 pale ban · §9 dual-surface · §10 modal |
| Program | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W2 |
| Inventory | `HRM_UI_BRAND_SCREEN_INVENTORY.md` — batch ids only (no 177 remaster) |
| Skill | `xevn-precision-motion-theme` sharp locks |
| change_mode | UPGRADE foundation only |
| code_memory_mode | APPEND |

---

## 1. Scope closed

| # | Exit | Result |
|---|------|--------|
| 1 | Portal + HRM `:root` / Tailwind / shadcn bridge = ADR hex | **PASS** — primary `#1E40AF` · text `#111827` · secondary `#4B5563` · muted `#6B7280` |
| 2 | HRM `--muted-foreground` ≠ pale body | **PASS** — light `215 14% 34%` ≈ `#4B5563`; gate L&lt;55% |
| 3 | Pale grep/lint gate | **PASS** — `pnpm run verify:xevn:theme-contrast` exit 0 · `--strict` exit 0 · debt 0 |
| 4 | Dual-surface — no second palette | **PASS** — same `--xevn-*` portal shell + HRM iframe |
| 5 | Modal chrome baseline (shared) | **PASS** — `.xevn-dialog-surface` + thin primary `::before` bar · `.xevn-dialog-footer-sticky` · DialogContent wired |
| 6 | @CODE-MEMORY / @STYLE-MEMORY | **PASS** — portal + HRM CSS; dialog APPEND |
| 7 | Smoke | **PARTIAL** — portal `vite build` OK (~9s); live `:5175`/`:8088`/`:5173` **down** this seat → QA browser |

**Cấm honored:** no full remaster · no Nest/API/SRS · no seed · no purple AI · PROP-03e OUT · Face web honesty kept · ATT GPS wire not fought.

---

## 2. Contrast notes (foundation — not screenshot browser)

| Check | Before (W0 ADR residual) | After this seat |
|-------|--------------------------|-----------------|
| Contrast script | **MISSING** (`package.json` listed script) | Restored + TW hex + muted-fg L-check + BOM-safe baseline |
| Pale classes `text-slate-400` / `text-gray-400` / `text-[#9CA3AF]` | n/a gate | **0 hits** / 598 scanned files |
| Body vs muted | Risk: shadcn pale muted as labels | Body `#111827`; muted-fg secondary; `text-muted-foreground` remaining usages = **W3 remaster debt** (not gate FAIL — gate bans slate-400 class) |
| Modal brand | Utility without brand bar | 3px primary bar on `.xevn-dialog-surface` (A4 — no full-bleed) |

**QA browser (recommended):** login `ceo@xe.vn` → portal shell → one HRM embed (ATT or EMP) → open any Dialog — expect sharp title `#111827` + thin blue top bar; no purple theme.

---

## 3. Verify log (reproducible)

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict for W3 DoD)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0

> apps/web/web-portal: pnpm exec vite build --mode development
✓ built in 9.32s
```

Baseline: `docs/qa/evidence/xevn-theme-contrast-baseline.json` (`hitCount: 0`).

Rule pointer: `.cursor/rules/xevn-theme-sharp-ops.mdc` → ADR-20260805.

---

## 4. Files touched (this seat delta)

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/index.css` | STYLE/CODE-MEMORY → ADR-20260805; dialog brand-bar + sticky footer util |
| `apps/web/hrm/src/index.css` | STYLE/CODE-MEMORY; dialog brand-bar; coordinate ATT utilities kept |
| `apps/web/hrm/src/components/ui/dialog.tsx` | `xevn-dialog-surface` + title type floor ≥20 bold |
| `apps/web/web-portal/tailwind.config.cjs` | Comment cite ADR-20260805 |
| `apps/web/hrm/tailwind.config.ts` | Comment cite ADR-20260805 |
| `scripts/verify-xevn-theme-contrast.mjs` | Full gate: pale + CSS hex + TW hex + muted-fg + BOM-safe JSON |
| `docs/qa/evidence/xevn-theme-contrast-baseline.json` | hitCount 0 |
| `.cursor/rules/xevn-theme-sharp-ops.mdc` | Pointer rule |
| `docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md` | W2 foundation checkbox |
| `docs/qa/evidence/po-hrm-ui-brand-fe-found-01.md` | This file |

---

## 5. Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Browser smoke login + HRM embed + Dialog brand bar (stack was down) | **QA** |
| R2 | W3 squad remaster PORT/ATT/EMP (inventory batches) — `text-muted-foreground` → secondary tokens where used as labels | **dev-fe** parallel |
| R3 | Open Q §3 B1–B5 blank — A1–A5 interim | Sponsor / SA |
| R4 | Portal pre-existing `tsc` `HrmWorkspacePanel` missing `fleet` key | Out of scope (not introduced here) |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-FE-FOUND-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-found-01.md
completion_report: |
  W2 foundation: ADR hex lockstep portal+HRM+TW; muted-fg readable;
  pale gate restored (soft+strict exit 0); shared modal brand-bar chrome;
  DialogContent wired. No 177 remaster. Portal vite build PASS; live stack down.
next_owner: qa
next_dispatch_prompt: |
  Task qa work_item_id=PO-HRM-UI-BRAND-FE-FOUND-01-QA
  entry: L0 stack up (portal+HRM); U65 zero-seed; browser-only
  checks:
    1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
    2) ceo@xe.vn login → portal shell — primary #1E40AF / sharp text (no purple)
    3) Open one HRM embed (ATT or EMP) — shell loads; open Dialog — thin primary bar + title ≥20 bold #111827
    4) Contrast note / screenshot before-after optional
  exit: evidence docs/qa/evidence/po-hrm-ui-brand-fe-found-01-qa.md · PASS_TO_PM
  cấm: seed · claim remaster DONE · fail for W3 label debt on text-muted-foreground
pm_dispatch_hint: |
  After QA PASS — parallel W3 squads (inventory):
  W3-PORT-A (PORT-01..08) · W3-ATT-A (S01..) · W3-EMP-A (EMP batch)
  — do not wait serial; foundation gate green.
```

### next_dispatch_prompt (copy-ready — PM after QA)

```text
Task dev-fe work_item_id=PO-HRM-UI-BRAND-W3-PORT-A
role: dev-fe · squad FE-PORTAL · inventory PORT-01..PORT-08
read_first: ADR-20260805 §8–§10 · HRM_UI_BRAND_SCREEN_INVENTORY.md §1 · evidence po-hrm-ui-brand-fe-found-01.md
entry: verify:xevn:theme-contrast --strict exit 0; foundation READY
exit: remaster chrome PORT batch only; screenshots; keep honesty; READY_FOR_QA
evidence: docs/qa/evidence/po-hrm-ui-brand-w3-port-a.md
parallel same session:
  Task dev-fe PO-HRM-UI-BRAND-W3-ATT-A (FE-ATT P0 slice — coordinate ATT-03d GPS wire: tokens/classes only)
  Task dev-fe PO-HRM-UI-BRAND-W3-EMP-A (FE-EMP P0 slice)
cấm: remaster all 177 · seed · Nest · PROP-03e
```
