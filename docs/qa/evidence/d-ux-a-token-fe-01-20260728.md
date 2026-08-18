# D-UX-A-TOKEN-FE-01 — XBOS-Core Inter + token cleanup

**Date:** 2026-07-28
**Work item:** D-UX-A-TOKEN-FE-01
**Agent:** CLAUDE-PM (FE deputy, LANE-A wave 1 per PEER-UX-SPONSOR-CHOT-01)
**Scope:** apps/web/x-bos-core/src/  — do NOT touch apps/web/hrm/

---

## 1. Pre-fix audit

### 1.1 Inter font import

- **index.html** line 10 already had `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />`.
- **tailwind.config.cjs** lines 17–25 already had `fontFamily.sans: ['Inter', 'SF Pro Display', ...]`.
- **No fix needed** — Inter was pre-loaded and pre-configured.

### 1.2 Rogue token scan

Searched full `src/` for `text-blue-`, `bg-blue-`, `hover:bg-blue-`, `hover:text-blue-`, `xevn-neutral`:

| File | Line | Before | After |
|------|------|--------|-------|
| `MasterDataPage.tsx` | 96 | `text-xevn-neutral` | `text-xevn-muted` |
| `MasterDataPage.tsx` | 167 | `text-xevn-neutral` | `text-xevn-muted` |
| `MasterDataPage.tsx` | 333 | `hover:bg-blue-800` | `hover:bg-xevn-accent` |
| `OrganizationPage.tsx` | 100 | `hover:bg-blue-800` | `hover:bg-xevn-accent` |
| `KpiDefinitionsPage.tsx` | 149 | `hover:bg-blue-800` | `hover:bg-xevn-accent` |
| `PolicyManagementPage.tsx` | 326 | `hover:bg-blue-800` | `hover:bg-xevn-accent` |
| `PolicyManagementPage.tsx` | 436 | `hover:bg-blue-800` | `hover:bg-xevn-accent` |

### 1.3 Hardcoded `p-8` / `gap-8`

- `MainLayout.tsx` line 12 had `p-8` on `<main>`. No xevn spacing token exists for this; kept as-is (reasonable layout padding).
- `MasterDataPage.tsx` line 64 had `gap-8` on grid. Insignificant; kept.

## 2. Files changed

1. `apps/web/x-bos-core/src/pages/MasterDataPage.tsx` — 3 fixes (2 × xevn-neutral → xevn-muted, 1 × hover:bg-blue-800 → hover:bg-xevn-accent)
2. `apps/web/x-bos-core/src/pages/OrganizationPage.tsx` — 1 fix (hover:bg-blue-800 → hover:bg-xevn-accent)
3. `apps/web/x-bos-core/src/pages/kpi/KpiDefinitionsPage.tsx` — 1 fix (hover:bg-blue-800 → hover:bg-xevn-accent)
4. `apps/web/x-bos-core/src/pages/kpi/PolicyManagementPage.tsx` — 2 fixes (hover:bg-blue-800 → hover:bg-xevn-accent, × 2 buttons)

**Total: 4 files, 7 token replacements.**

## 3. post-fix grep (rogue tokens)

```bash
# No matches found:
grep -rE 'text-blue-|bg-blue-|hover:bg-blue|hover:text-blue|xevn-neutral' apps/web/x-bos-core/src/
# → (empty)
```

## 4. Inter import (NO CHANGE — pre-existing)

```bash
grep -rE 'Inter' apps/web/x-bos-core/src/ apps/web/x-bos-core/tailwind.config.cjs apps/web/x-bos-core/index.html
# index.html:10:    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
# tailwind.config.cjs:18-25:   fontFamily: { sans: ['Inter', 'SF Pro Display', ...] }
```

## 5. Source of truth for tokens

`apps/web/x-bos-core/tailwind.config.cjs` defines:

```js
colors: {
  xevn: {
    primary: '#1E40AF',
    accent: '#06B6D4',
    surface: '#FFFFFF',
    background: '#F5F5F7',
    text: '#1D1D1F',
    muted: '#6E6E73',
    border: 'rgba(0,0,0,0.06)',
  },
},
```

No `neutral` token — `muted` is the canonical light-gray for secondary text.
