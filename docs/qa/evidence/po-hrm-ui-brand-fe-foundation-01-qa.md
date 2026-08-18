# PO-HRM-UI-BRAND-FE-FOUNDATION-01-QA — W2 theme foundation gate

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-FOUNDATION-01-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §7–§10 **Accepted** |
| **FE evidence (entry)** | `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope / gate type

Token + contrast **foundation gate only** (ADR Option A hex lockstep + pale ban).

| In scope | Out of scope (cấm claim) |
|----------|--------------------------|
| `verify:xevn:theme-contrast` (+ `--strict`) | Remaster DONE / 177-screen CLOSED |
| Spot `:root --xevn-*` portal + HRM vs ADR §7 | Attendance product CLOSED |
| HRM `--muted-foreground` ≠ pale body | Product / QC GO |
| | Seed / fake DB / reopen TechSpec S3 |
| | Browser L2.5 remaster UATs (optional; skipped) |

---

## 2. Commands (reproducible)

```bash
pnpm run verify:xevn:theme-contrast
# exit 0

pnpm run verify:xevn:theme-contrast -- --strict
# exit 0
```

### 2.1 Default mode

| Check | Result |
|-------|--------|
| Exit code | **0** |
| Token lockstep | **PASS** — primary `#1E40AF` / text `#111827` / secondary `#4B5563` (portal+HRM) |
| Pale scan | scanned **818** files; pale hits=**0**; files=**0** |
| Debt vs baseline | **PASS** (debt 0 <= baseline 0) |

### 2.2 Strict mode

| Check | Result |
|-------|--------|
| Exit code | **0** |
| Token lockstep | **PASS** (same hex) |
| Pale | **STRICT PASS — 0 pale hits** |

**Baseline artifact:** `docs/qa/evidence/xevn-theme-contrast-baseline.json` · `hitCount: 0` · work_item `PO-HRM-UI-BRAND-FE-FOUNDATION-01`.

**Seed:** none (`pnpm seed:*` not run — U65).

**Browser:** not opened (dispatch: optional for token/contrast gate).

---

## 3. Spot-check — `:root --xevn-*` vs ADR §7

| Token | ADR §7 | Portal `apps/web/web-portal/src/index.css` | HRM `apps/web/hrm/src/index.css` | Verdict |
|-------|--------|-------------------------------------------|----------------------------------|---------|
| `--xevn-color-primary` | `#1E40AF` | `#1e40af` | `#1e40af` | **PASS** |
| `--xevn-color-text` | `#111827` | `#111827` | `#111827` | **PASS** |
| `--xevn-color-text-secondary` | `#4B5563` | `#4b5563` | `#4b5563` | **PASS** |
| `--xevn-color-text-muted` | `#6B7280` (placeholder/icon) | `#6b7280` | `#6b7280` | **PASS** |

### Tailwind `xevn.*` mirror

| Key | ADR §7.3 | Portal `tailwind.config.cjs` | HRM `tailwind.config.ts` | Verdict |
|-----|----------|------------------------------|--------------------------|---------|
| `primary` | `#1E40AF` | `#1E40AF` | `#1E40AF` | **PASS** |
| `text` | `#111827` | `#111827` | `#111827` | **PASS** |
| `textSecondary` | `#4B5563` | `#4B5563` | `#4B5563` | **PASS** |
| `textMuted` | `#6B7280` | `#6B7280` | `#6B7280` | **PASS** |

---

## 4. HRM muted-foreground (not pale body)

| shadcn var (light `:root`) | Value in HRM CSS | ADR §7.4 rule | Verdict |
|----------------------------|------------------|---------------|---------|
| `--primary` | `226 71% 40%` | HSL of `#1E40AF` | **PASS** |
| `--foreground` / `--card-foreground` | `220 39% 11%` | `#111827` class | **PASS** |
| `--muted-foreground` | `215 14% 34%` | ≈ `#4B5563` readable secondary — **never** slate-400 body | **PASS** |

**Law check:** Light `--muted-foreground` is Gray-600-class (~34% L), not pale slate-400 body. Dark theme `215 14% 72%` is theme inverse only — not light body path.

---

## 5. Matrix rollup

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | `verify:xevn:theme-contrast` exit 0 | **PASS** |
| 2 | `--strict` exit 0 / 0 pale | **PASS** |
| 3 | Portal + HRM `:root --xevn-*` hex ADR §7 | **PASS** |
| 4 | HRM muted-foreground not pale body | **PASS** |
| 5 | U65 zero-seed | **PASS** (no seed) |

**Overall:** **PASS_TO_PM**

---

## 6. Residual (not blockers for this gate)

| Item | Severity | Owner |
|------|----------|-------|
| W3 screen remaster batches (PORT/ATT/EMP) — pale may regress | Program | `dev-fe` + QA per batch |
| Open Questions §3 B1–B5 blank — A1–A5 interim | Governance | Sponsor / SA delta |
| Browser visual remaster UATs | Deferred to W3 QA | `qa` after READY_FOR_QA seats |

**Explicit non-claims:** remaster not DONE · Attendance not CLOSED · product not GO · TechSpec S3 not re-opened.

---

## 7. Handoff

### completion_report

W2 FE foundation **QA gate PASS**: `verify:xevn:theme-contrast` exit 0 and `--strict` 0 pale (818 files); portal+HRM `:root` / Tailwind `xevn.*` lockstep ADR §7 (`#1E40AF` / `#111827` / `#4B5563`); HRM `--muted-foreground: 215 14% 34%` ≈ secondary, not pale body. U65 honored (no seed). Browser skipped (optional). Does **not** claim remaster DONE / Attendance CLOSED / product GO.

### next_owner

`pm` — intake PASS; keep/continue W3 remaster seats already DISPATCHED; do not invent remaster CLOSED from this token gate alone.

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-FE-FOUNDATION-01-QA → PM INTAKE
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01-qa.md

PM actions (same session):
1) Bus INTAKE CLOSED foundation QA — token/contrast gate green.
2) Do NOT claim remaster DONE / Attendance CLOSED / product GO from this seat.
3) Continue W3-PORT-A / W3-ATT-A / W3-EMP-A (already DISPATCHED on bus) — each seat must re-run:
   pnpm run verify:xevn:theme-contrast
   pnpm run verify:xevn:theme-contrast -- --strict
4) After each W3 READY_FOR_QA → Task qa with inventory IDs + pale ban + U65 browser optional only if remaster claims visual AC.
5) TechSpec S3 remains HOLD — cấm reopen from UI brand lane.

cấm: seed · invent B1–B5 · purple AI theme · promote foundation PASS to product GO
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01-qa.md`
