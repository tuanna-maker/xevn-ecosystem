# XEVN-THM-QA-W1-TITLE-01 — QA retest CC/chrome product title → XeVN OS

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QA-W1-TITLE-01` |
| **Date** | 2026-07-22 |
| **Owner** | QA |
| **Program** | `P1-XEVN-THEME-REMASTER` (QC GWC **C1** close) |
| **entry** | `XEVN-THM-FE-W1-TITLE-01` READY_FOR_QA · `docs/qa/evidence/xevn-thm-fe-w1-title-01-20260722.md` |
| **spec_ref** | `XEVN_BRAND_UIUX_PROPOSAL.md` §0–§2 · QC `xevn-thm-qc-fe-w1-01-20260722.md` **C1** |
| **Persona** | `ceo@xe.vn` (session already authenticated on `:5173`) |
| **U65** | zero-seed — title/chrome visual only; no mutate/seed |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |

---

## 1. Scope / cấm

| In scope | Explicitly out |
|----------|----------------|
| Browser `:5173` CC hero «XeVN OS» + subtitle «Command Center» | Full remaster DONE claim |
| TopHeader `portal-brand-mark` + wordmark «XeVN» regression | Reopen FE-W1 chrome beyond title AC |
| Document title contains XeVN OS | Seed / API mutate UF |
| `verify:xevn:theme-contrast` exit 0 | Phase1 / PROD DONE |

---

## 2. Exit criteria map

| # | Criterion | Method | Observed | Result |
|---|-----------|--------|----------|--------|
| 1 | Hero «XeVN OS», subtitle «Command Center» (not «X-BOS Unified Portal») | Browser `http://localhost:5173/command-center` + CDP | `h1` = **XeVN OS**; next sibling = **Command Center**; `hasXbosUnifiedPortal=false` | **PASS** |
| 2 | TopHeader `data-testid=portal-brand-mark` + wordmark XeVN still visible | Unlock `sessionStorage xevn.portal.unlocked=1` → `/dashboard/organization` + CDP | mark **present**; `aria-label` = `XeVN — về Command Center`; wordmark **XeVN**; logo `/xevn-logo.png` 40×40 `h-10 w-10`; sticky `h-14` glass header | **PASS** |
| 3 | Document title contains XeVN OS; contrast gate exit 0 | Browser title + `pnpm run verify:xevn:theme-contrast` | title = **`XeVN OS \| Command Center`**; contrast scanned 715; pale hits=0; debt **0 ≤ baseline 0**; exit **0** | **PASS** |
| 4 | This evidence | Write | `docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md` | **PASS** |

---

## 3. Browser evidence (CDP)

### 3.1 Command Center hero (`/command-center`)

```json
{
  "url": "http://localhost:5173/command-center",
  "documentTitle": "XeVN OS | Command Center",
  "heroH1": "XeVN OS",
  "heroSubtitle": "Command Center",
  "hasXbosUnifiedPortal": false,
  "hasXeVnOs": true,
  "hasCommandCenterLabel": true
}
```

Note: CC workspace uses its own page header (not MainLayout TopHeader). Hero strings are the product-title SoT for C1.

### 3.2 TopHeader regression (`/dashboard/organization`)

```json
{
  "surface": "TopHeader@/dashboard/organization",
  "documentTitle": "XeVN OS | Command Center",
  "portalBrandMarkPresent": true,
  "ariaLabel": "XeVN — về Command Center",
  "wordmark": "XeVN",
  "logoSrc": "/xevn-logo.png",
  "logoWidthAttr": "40",
  "logoHeightAttr": "40",
  "logoClass": "h-10 w-10 object-contain",
  "hasXbosUnifiedPortal": false
}
```

Unlock path (same as `XEVN-THM-QA-W1`): `sessionStorage.setItem('xevn.portal.unlocked','1')` then navigate MainLayout route.

### 3.3 Source spot (supporting)

- `apps/web/web-portal` rg `X-BOS Unified Portal` → **0 hits**
- `TopHeader.tsx` still has `data-testid="portal-brand-mark"` + wordmark span `XeVN` (FE title wave did not edit TopHeader)

---

## 4. Contrast gate

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] scanned 715 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict after W1)
EXIT: 0
```

---

## 5. Residual / not promoted

| ID | Note |
|----|------|
| Full remaster / inventory P1–P2 | **not claimed** |
| VPS `:8088` deploy lag for title string | ENV — local `:5173` SoT for this C1 close |
| Sidebar module label «X-BOS» on MainLayout | Technical module name secondary — out of title AC |
| FE-W1 chrome beyond title | **cấm reopen** per PM |

---

## 6. Handoff

```yaml
work_item_id: XEVN-THM-QA-W1-TITLE-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md
completion_report: >
  PASS — C1 title AC closed on :5173. CC hero XeVN OS + subtitle Command Center;
  no X-BOS Unified Portal; document title XeVN OS | Command Center;
  TopHeader portal-brand-mark + wordmark XeVN intact on /dashboard/organization;
  verify:xevn:theme-contrast exit 0 debt 0. U65 zero-seed. Full remaster NOT claimed.
next_owner: pm
```

**next_dispatch_prompt:**

```text
work_item_id: XEVN-THM-QC-W1-TITLE-C1-01
from_role: pm
to_role: qc
entry_criteria: XEVN-THM-QA-W1-TITLE-01 PASS_TO_PM · docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md · closes QC GWC C1 from xevn-thm-qc-fe-w1-01-20260722.md
exit_criteria:
1) Sample-audit QA browser CDP: CC hero XeVN OS + Command Center; no X-BOS Unified Portal
2) TopHeader portal-brand-mark + wordmark XeVN still present (source or :5173)
3) Document title contains XeVN OS; contrast gate exit 0 cited
4) Evidence docs/qa/evidence/xevn-thm-qc-w1-title-c1-01-20260722.md · close C1 or GWC residual list
cấm: seed; claim full remaster / Phase1 / PROD DONE; reopen FE-W1 chrome beyond title
ack_status: PASS_TO_PM
```
