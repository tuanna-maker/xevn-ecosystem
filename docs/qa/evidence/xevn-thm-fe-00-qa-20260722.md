# XEVN-THM-FE-00-QA — Theme foundation spot (portal + HRM)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-FE-00-QA` |
| **Date** | 2026-07-22 |
| **Owner** | QA |
| **from_role** | pm |
| **Program** | `P1-XEVN-THEME-REMASTER` W0/W1a foundation |
| **spec_ref** | `ADR-XEVN-THEME-SHARP-OPS-20260722` §4 · `docs/qa/evidence/xevn-thm-fe-00-20260722.md` |
| **entry** | Dev-FE READY `xevn-thm-fe-00-20260722.md` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed; login smoke only if stack up |

---

## 1. Verdict

| Gate | Result |
|------|--------|
| Portal + HRM tokens `#111827` / `#4B5563` / `#6B7280` | **PASS** |
| Type utilities `.xevn-type-*` + `.xevn-brand-shell` | **PASS** |
| `pnpm run verify:xevn:theme-contrast` | **PASS** exit **0** (debt 62 ≤ baseline 62) |
| Login dark shell brand spot (static) | **PASS** |
| Browser login smoke | **N/A** — local stack DOWN (`:5175` / `:28001` / `:28002`) |
| Pale debt 62 (FE-W1) | **NOT FAIL** — in-scope residual only |

**Overall: PASS_TO_PM** — FE-00 foundation accepted for W1 remaster dispatch. Not Phase1/PROD; not full remaster DONE.

---

## 2. Exit criteria map

| # | Criterion | Method | Result |
|---|-----------|--------|--------|
| 1 | Tokens text / textSecondary / textMuted | Static read portal + HRM CSS + Tailwind | **PASS** |
| 2 | Type utilities body/table/title/label + brand shell | Both `index.css` `@layer utilities` | **PASS** |
| 3 | Contrast grep gate exit 0 | `pnpm run verify:xevn:theme-contrast` | **PASS** |
| 4 | Login dark shell P1 brand test | `LoginPage.tsx` static review | **PASS** |
| 5 | Do not fail 62 pale debt | Baseline policy | **PASS** (documented residual → FE-W1) |

---

## 3. Token assert (ADR §4.1)

### Portal `apps/web/web-portal`

| Source | text | textSecondary | textMuted |
|--------|------|---------------|-----------|
| `src/index.css` `:root` | `--xevn-color-text: #111827` | `--xevn-color-text-secondary: #4b5563` | `--xevn-color-text-muted: #6b7280` |
| `tailwind.config.cjs` `xevn.*` | `#111827` | `#4B5563` | `#6B7280` |
| brandShell | `#000000` (`--xevn-color-brand-shell`) | | |

### HRM `apps/web/hrm`

| Source | Assert |
|--------|--------|
| `src/index.css` `:root` hex SoT | same `#111827` / `#4b5563` / `#6b7280` |
| shadcn bridge | `--foreground: 220 39% 11%` (~text); `--primary: 226 71% 40%` (#1E40AF); `--muted-foreground: 215 14% 34%` (~#4B5563 readable floor — not pale slate-400) |
| `tailwind.config.ts` `xevn.*` | `#111827` / `#4B5563` / `#6B7280` |

### Type floors (both apps)

Present: `.xevn-type-body` · `.xevn-type-table` · `.xevn-type-title` · `.xevn-type-label` · `.xevn-brand-shell`  
Floors: body ≥15px (prefer 16), table ≥14, title ≥20, label ≥14 + secondary color.

---

## 4. Contrast gate

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] scanned 715 files; pale hits=62 files=31
[xevn-theme-contrast] PASS (debt 62 ≤ baseline 62; use --strict after W1)
EXIT:0
```

Baseline SoT: `docs/qa/evidence/xevn-theme-contrast-baseline.json` (`hitCount=62`, `fileCount=31`).

**QA policy this wave:** 62 hits = **known FE-W1 debt**, not FE-00 FAIL. `--strict` deferred until post-W1 DoD.

---

## 5. Login dark shell — brand spot

**File:** `apps/web/web-portal/src/pages/auth/LoginPage.tsx`

| Check | Evidence |
|-------|----------|
| Dark shell | root `className="xevn-brand-shell …"` → `#000` canvas |
| Mark ≥64 | `<img … width={64} height={64} className="h-16 w-16" alt="XeVN">` |
| Wordmark | `h1.xevn-type-title text-xevn-text` = «XeVN Portal» (hero brand signal, no nav) |
| Surface card | `rounded-card … bg-xevn-surface … shadow-soft` |
| Labels sharp | `.xevn-type-label` (secondary floor); icons `text-xevn-textMuted` only |
| No pale ops classes | no `text-slate-400` / `text-gray-400` on LoginPage |
| CTA primary | `bg-xevn-primary` / `hover:bg-xevn-primaryPressed` |

**Browser live:** N/A — `:5175` / APIs unreachable at QA time. U65: static brand shell assert accepted for foundation; optional live re-spot when stack up (not blocker for PASS).

---

## 6. Residual (not promoted — not FAIL)

| ID | Owner | Note |
|----|-------|------|
| Pale debt 62 / 31 files | **XEVN-THM-FE-W1** (+ HRM batch) | TopHeader, Sidebar, CC, settings, HRM components |
| Live login smoke | devops / QA follow-up | When `qc:dev-stack` up |
| Full remaster DONE | — | Out of scope FE-00 |

---

## 7. Handoff

```
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/xevn-thm-fe-00-qa-20260722.md
pm_dispatch_hint: XEVN-THM-FE-W1 portal chrome remaster; lower pale baseline
```

### next_dispatch_prompt (copy-ready)

```
work_item_id: XEVN-THM-FE-W1
from_role: pm
to_role: dev-fe
entry_criteria: XEVN-THM-FE-00-QA PASS_TO_PM; tokens live #111827/#4B5563/#6B7280; contrast debt 62 baseline locked.
exit_criteria: Remaster portal TopHeader (mark+wordmark) + Command Center chrome/settings batch; replace text-slate-400/text-gray-400 on remastered files with text-xevn-text|textSecondary|textMuted; run verify:xevn:theme-contrast --write-baseline with lower hitCount; evidence docs/qa/evidence/xevn-thm-fe-w1-YYYYMMDD.md.
forbidden: API/business logic; do not claim full program remaster DONE; do not reopen FE-00 token SoT.
ack_status: READY_FOR_QA
```
