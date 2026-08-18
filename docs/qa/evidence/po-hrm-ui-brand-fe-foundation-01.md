# PO-HRM-UI-BRAND-FE-FOUNDATION-01 — W2 theme foundation (UI tokens only)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-FOUNDATION-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` (smoke gate) → `pm` dispatch W3 |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §7–§10 **Accepted** |
| **Inventory SoT** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` (CLOSED) |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Scope closed (this seat)

| # | Exit criteria (ADR §13 / dispatch) | Result |
|---|--------------------------------------|--------|
| 1 | Read ADR §7–§10 | Done — Option A hex table + pale ban + dual-surface + modal ops-dense |
| 2 | Portal + HRM `:root --xevn-*` lock primary `#1E40AF` · text `#111827` · secondary `#4B5563` | **PASS** — both `index.css` match ADR §7.1 snippet |
| 3 | HRM shadcn bridge §7.4 (`--primary` 226 71% 40%; `--muted-foreground` ≈ `#4B5563`) | **PASS** — already wired; confirmed |
| 4 | Tailwind `xevn.*` portal + HRM hex mirror | **PASS** — `tailwind.config.cjs` / `tailwind.config.ts` |
| 5 | Restore `scripts/verify-xevn-theme-contrast.mjs` + `pnpm run verify:xevn:theme-contrast` exit **0** | **PASS** (token lockstep + pale debt 0 ≤ baseline 0; `--strict` also 0) |
| 6 | CODE-MEMORY / STYLE-MEMORY APPEND cite ADR-20260805 on CSS | **PASS** — both portal + HRM |
| 7 | Evidence this file | Done |

**Cấm honored:** no 177-screen remaster · no Nest · no seed · no ATT GPS business (other seat).

---

## 2. Token lock (spec says / code does)

| Token | ADR §7 | Portal `index.css` | HRM `index.css` |
|-------|--------|--------------------|-----------------|
| `--xevn-color-primary` | `#1E40AF` | `#1e40af` | `#1e40af` |
| `--xevn-color-text` | `#111827` | `#111827` | `#111827` |
| `--xevn-color-text-secondary` | `#4B5563` | `#4b5563` | `#4b5563` |
| `--xevn-color-text-muted` | `#6B7280` placeholder/icon | `#6b7280` | `#6b7280` |
| `--muted-foreground` (HRM) | ≈ `#4B5563` | n/a | `215 14% 34%` |

---

## 3. Verify commands (reproducible)

```bash
pnpm run verify:xevn:theme-contrast
# → token lockstep PASS; pale hits=0; PASS (debt 0 <= baseline 0); exit 0

pnpm run verify:xevn:theme-contrast -- --strict
# → STRICT PASS - 0 pale hits; exit 0
```

**Artifacts:**

- `scripts/verify-xevn-theme-contrast.mjs` — pale ban + ADR §7 hex lockstep on portal/HRM CSS
- `package.json` → `"verify:xevn:theme-contrast": "node scripts/verify-xevn-theme-contrast.mjs"`
- `docs/qa/evidence/xevn-theme-contrast-baseline.json` — `hitCount: 0`

---

## 4. Files touched

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/index.css` | Confirm hex; APPEND `@CODE-MEMORY-CHANGE` FOUNDATION-01 + ADR cite |
| `apps/web/hrm/src/index.css` | Confirm hex + shadcn bridge; APPEND CODE/STYLE-MEMORY ADR-20260805 |
| `scripts/verify-xevn-theme-contrast.mjs` | Restored/enhanced — pale scan + token lockstep + baseline auto-seed |
| `docs/qa/evidence/xevn-theme-contrast-baseline.json` | Fresh baseline hitCount=0 |
| `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md` | This evidence |

**Not touched:** Nest, Prisma, seed scripts, ATT GPS business screens, inventory (already CLOSED).

---

## 5. Residual

| Item | Severity | Owner |
|------|----------|-------|
| W3 screen-by-screen remaster (PORT/ATT/EMP batches) | Program next | `dev-fe` squads |
| Open Questions §3 B1–B5 still blank — A1–A5 interim | Governance | Sponsor / SA delta if answered |
| Pale `--strict` on future remastered paths may regress if W3 introduces `text-slate-400` | P2 gate | QA each W3 batch |

---

## 6. Handoff

### completion_report

W2 FE foundation closed: ADR-20260805 token hex lockstep on portal+HRM `:root`, shadcn bridge confirmed, `verify:xevn:theme-contrast` exit 0 (default + strict), CODE-MEMORY cites ADR on both CSS files. No screen remaster / Nest / seed.

### next_owner

`qa` (optional contrast smoke) → **`pm`** dispatch parallel W3 remaster seats.

### next_dispatch_prompt

```text
work_item_id: W3-PORT-A + W3-ATT-A + W3-EMP-A (parallel, max 3)
from_role: pm
to_role: dev-fe (3 seats)
entry_criteria:
  - PO-HRM-UI-BRAND-FE-FOUNDATION-01 READY_FOR_QA evidence PASS
  - ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 Accepted
  - Inventory CLOSED: docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md
  - pnpm run verify:xevn:theme-contrast exit 0
exit_criteria:
  - W3-PORT-A: remaster PORT-01…PORT-08 per inventory; screenshots; pale ban
  - W3-ATT-A: remaster ATT S01–S03,S09–S12,S20–S22 (10); ops-dense modals A4; honesty stubs stay
  - W3-EMP-A: remaster EMP E01–E08,E10–E11,E28 (11); list/create/profile shell
  - Each seat: CODE-MEMORY APPEND; no Nest/seed; run verify:xevn:theme-contrast exit 0
evidence_path:
  - docs/qa/evidence/po-hrm-ui-brand-w3-port-a.md
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-a.md
  - docs/qa/evidence/po-hrm-ui-brand-w3-emp-a.md
ack_status target: READY_FOR_QA
cấm: invent B1–B5 palette · purple AI theme · ATT GPS business logic seat · seed
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md`

### pm_dispatch_hint

Dispatch **W3-PORT-A**, **W3-ATT-A**, **W3-EMP-A** in parallel after QA smoke of `verify:xevn:theme-contrast` (or skip smoke if PM accepts gate exit 0 as L0 theme).
