# XEVN-THM-FE-W1-TITLE-01 — CC/chrome product title → XeVN brand

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-FE-W1-TITLE-01` |
| **Date** | 2026-07-22 |
| **Owner** | Dev-FE |
| **Program** | `P1-XEVN-THEME-REMASTER` (C1 close from QC GWC) |
| **spec_ref** | `XEVN_BRAND_UIUX_PROPOSAL.md` §0–§2 · TopHeader CODE-MEMORY · QC `xevn-thm-qc-fe-w1-01-20260722.md` **C1** |
| **Locks** | L-OPS brand hero · must_keep TopHeader `portal-brand-mark` |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **U65** | zero-seed — title string only; no mutate/seed |

---

## 1. Verdict

QC condition **C1** closed in source: Command Center hero title is **XeVN OS** (not «X-BOS Unified Portal»). Secondary module label remains **Command Center**. TopHeader `portal-brand-mark` + contrast gate **unchanged / PASS**. **Not** claiming full remaster DONE.

---

## 2. Exit criteria map

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Align user-facing CC/chrome product title to XeVN brand; technical module names secondary | **PASS** | `CommandCenterPage.tsx` h1 → `XeVN OS`; subtitle `Command Center`; `index.html` `<title>` → `XeVN OS \| Command Center`; x-bos-core redirect copy aligned |
| 2 | Do NOT regress TopHeader `portal-brand-mark` / contrast gate | **PASS** | `TopHeader.tsx` **not edited**; `data-testid=portal-brand-mark` + mark 40 + wordmark XeVN intact; `pnpm run verify:xevn:theme-contrast` exit **0**, pale hits=0, debt **0 ≤ baseline 0** |
| 3 | This evidence | **PASS** | `docs/qa/evidence/xevn-thm-fe-w1-title-01-20260722.md` |

---

## 3. Before / after (hero strings)

| Surface | Before | After |
|---------|--------|-------|
| CC page `<h1>` | `X-BOS Unified Portal` | `XeVN OS` |
| CC subtitle | `Command Center` | `Command Center` (kept secondary) |
| Document `<title>` | `X-BOS \| Hệ điều hành Tập đoàn XeVN` | `XeVN OS \| Command Center` |
| x-bos-core redirect toast | `X-BOS Unified Portal (Command Center)` | `XeVN OS (Command Center)` |
| TopHeader wordmark | `XeVN` + mark 40 | **unchanged** |

---

## 4. Files touched

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Hero title + CODE-MEMORY-CHANGE comment |
| `apps/web/web-portal/index.html` | Browser tab title |
| `apps/web/x-bos-core/src/components/UnifiedPortalRedirect.tsx` | Redirect copy (same product string) |

**Explicitly untouched:** `TopHeader.tsx`, FE-W1 chrome remaster beyond title, HRM embeds, seed.

---

## 5. Commands

| Command | Result |
|---------|--------|
| `pnpm run verify:xevn:theme-contrast` | **PASS** · scanned 715 · pale hits=0 · debt 0 ≤ baseline 0 · exit 0 |
| `rg "X-BOS Unified Portal" apps/web/web-portal` | **0 hits** (product string removed from portal) |

---

## 6. QA retest (copy-ready)

- URL: `http://localhost:5173/command-center` (after login `ceo@xe.vn` / `Xevn@2026`)
- Assert: page hero **XeVN OS** + subtitle Command Center; TopHeader still shows mark + wordmark **XeVN** (`portal-brand-mark`)
- Tab title: **XeVN OS | Command Center**
- No seed; theme-only — no CRUD UF required for C1 close
- Optional: `pnpm run verify:xevn:theme-contrast` exit 0

---

## Handoff

```yaml
work_item_id: XEVN-THM-FE-W1-TITLE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/xevn-thm-fe-w1-title-01-20260722.md
entry_criteria: Dev C1 title align READY; TopHeader untouched; contrast exit 0
exit_criteria: Browser CC hero XeVN OS; portal-brand-mark present; no X-BOS Unified Portal hero; PASS_TO_PM (or FAIL with screenshot)
```

**next_dispatch_prompt:**

```text
work_item_id: XEVN-THM-QA-W1-TITLE-01
from_role: pm
to_role: qa
entry_criteria: XEVN-THM-FE-W1-TITLE-01 READY_FOR_QA · docs/qa/evidence/xevn-thm-fe-w1-title-01-20260722.md
exit_criteria:
1) Browser :5173 /command-center — hero title «XeVN OS», subtitle «Command Center» (not «X-BOS Unified Portal»)
2) TopHeader data-testid=portal-brand-mark + wordmark XeVN still visible
3) Document title contains XeVN OS; verify:xevn:theme-contrast exit 0
4) Evidence docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md · ack PASS_TO_PM
cấm: seed; claim full remaster DONE; reopen FE-W1 chrome beyond title AC
U65: browser-only title/chrome visual
```
