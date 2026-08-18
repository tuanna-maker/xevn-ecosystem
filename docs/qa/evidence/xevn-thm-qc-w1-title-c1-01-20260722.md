# QC Gate — XEVN-THM-QC-W1-TITLE-C1-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QC-W1-TITLE-C1-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` (ICT ~22:39–22:45) |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO** |
| **scope** | Close QC GWC **C1** (CC product title → XeVN OS) ONLY — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full remaster DONE |
| **entry** | `XEVN-THM-QA-W1-TITLE-01` PASS_TO_PM · `docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md` · parent GWC `xevn-thm-qc-fe-w1-01-20260722.md` **C1** |
| **runtime_SoT** | Local `:5173` browser CDP + source · ADR Sharp Ops |
| **U65** | zero-seed — QC sample browser + contrast only; **no** `pnpm seed:*`; QC did **not** edit `apps/**` |
| **PORTAL_DEV_URL** | `http://localhost:5173` |
| **api_base** | N/A (title/chrome visual only) |

---

## Scope (bounded — C1 title close)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Sample-audit CC hero «XeVN OS» + subtitle «Command Center» | Full remaster / Phase1 / PROD DONE |
| No «X-BOS Unified Portal» on CC / document title | Reopen FE-W1 chrome beyond title AC |
| TopHeader `portal-brand-mark` + wordmark «XeVN» regression | Seed / mutate UF |
| Document title contains XeVN OS; contrast exit 0 | Claiming `:8088` already remastered |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/xevn-thm-qc-fe-w1-01-20260722.md` | QC parent | GWC — **C1** title dual-naming condition |
| `docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md` | QA | PASS_TO_PM **PASS** — CDP hero + TopHeader + contrast |
| `docs/qa/evidence/xevn-thm-fe-w1-title-01-20260722.md` | Dev-FE (entry) | Title wave READY_FOR_QA (cited by QA) |
| Source `CommandCenterPage.tsx` / `index.html` / `TopHeader.tsx` | QC | Hero XeVN OS; title tag; mark untouched |

---

## Micro-checklist (exit_criteria)

| # | Exit criteria | QC method | Observed | Result |
|---|---------------|-----------|----------|--------|
| **1** | CC hero XeVN OS + Command Center; no X-BOS Unified Portal | Independent CDP `:5173/command-center` | `heroH1=XeVN OS`; `heroSubtitle=Command Center`; `hasXbosUnifiedPortal=false` | **PASS** |
| **2** | TopHeader portal-brand-mark + wordmark XeVN | Unlock → `/dashboard/organization` CDP + source | mark present; aria `XeVN — về Command Center`; wordmark **XeVN**; logo 40×40 `/xevn-logo.png` | **PASS** |
| **3** | Document title contains XeVN OS; contrast exit 0 | CDP title + independent `verify:xevn:theme-contrast` | title `XeVN OS \| Command Center`; scanned 715; pale 0; debt **0**; exit **0** | **PASS** |
| **4** | This evidence · close C1 | Write + adjudicate | **C1 CLOSED**; residual list below | **PASS** |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC finding |
|--------|-------|------------|
| CC hero «XeVN OS» / subtitle «Command Center» | **PRODUCT** | **PASS** — C1 closed |
| Absence of «X-BOS Unified Portal» (portal src + live DOM) | **PRODUCT** | **PASS** — rg 0 hits; CDP false |
| TopHeader brand mark regression | **PRODUCT** | **PASS** — untouched / intact |
| Document title XeVN OS | **PRODUCT** | **PASS** |
| Theme contrast debt 0 | **PRODUCT** | **PASS** |
| QA MD Layer-B incomplete (3/8) | **PROCESS-P3** | Not product NO-GO — theme title slice; QC pack must 8/8 |
| VPS `:8088` deploy lag (parent **C2**) | **ENV** | Remains open — not this C1 slice; local `:5173` SoT |
| Seed | **PROCESS U65** | **PASS** — none |
| Phase1 / PROD / full remaster DONE | **OUT OF SLICE** | **NOT claimed** |

---

## Command / probe table

| Command / probe | Result | Classification |
|-----------------|--------|----------------|
| CDP `/command-center` hero + title | **PASS** — see § Independent CDP | PRODUCT |
| CDP `/dashboard/organization` TopHeader | **PASS** — portal-brand-mark + XeVN | PRODUCT |
| `pnpm run verify:xevn:theme-contrast` | **PASS** · pale 0 · debt **0** · exit **0** · ~22:40 | PRODUCT |
| Source rg `X-BOS Unified Portal` under `apps/web/web-portal` | **0 hits** · **PASS** | PRODUCT |
| Source `CommandCenterPage.tsx` h1 / subtitle | **XeVN OS** / **Command Center** | PRODUCT |
| Source `TopHeader.tsx` `portal-brand-mark` + wordmark | **PASS** (unchanged by title wave) | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-qa-w1-title-01-20260722.md` | **FAIL 3/8** — journey_l25 / crud_or_matrix / residual_section | **PROCESS-P3** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-qc-w1-title-c1-01-20260722.md` | **PASS 8/8** · exit **0** (this QC pack) | PROCESS |

---

## Independent CDP (QC sample)

### Command Center hero

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

### TopHeader regression

```json
{
  "url": "http://localhost:5173/dashboard/organization",
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

Unlock: `sessionStorage xevn.portal.unlocked=1` then MainLayout route (same as QA).

---

## L2.5 / journey coverage

| J-ID / surface | Status | Note |
|----------------|--------|------|
| **WP-CC-HOME** title chrome (hero product name) | **PASS** | QC independent CDP + QA pack |
| **WP-SHELL-HEADER** TopHeader brand regression | **PASS** | portal-brand-mark + wordmark XeVN |
| **J-CC-*** / **J-HRM-*** business mutate | **N/A** | Out of title C1 slice — no CRUD UF |
| Portal full L2.5 promote | **DEFERRED** | Not required to close C1 |

**L2.5 note:** Gate is **title polish close (C1)**, not business journey promote. Theme surfaces listed **PASS**.

---

## Read-only theme AC matrix (C1 title)

| screen_id / module | Read (title / brand) | Update | Delete | QC |
|--------------------|----------------------|--------|--------|-----|
| WP-CC-HOME hero | h1 XeVN OS · subtitle Command Center · no X-BOS Unified Portal | N/A | N/A | **PASS** |
| Document title | contains XeVN OS | N/A | N/A | **PASS** |
| WP-SHELL-HEADER | portal-brand-mark + wordmark XeVN | N/A regression | N/A | **PASS** |
| Contrast gate | debt 0 · exit 0 | N/A | N/A | **PASS** |

---

## Residual

| # | Residual | Severity | Owner | Blocks C1 close? |
|---|----------|----------|-------|------------------|
| **C1** | CC title «X-BOS Unified Portal» dual naming | — | — | **CLOSED** this gate |
| **C2** | VPS `:8088` deploy lag (parent FE-W1 GWC) | **ENV** | devops when sponsor deploy | **No** — not C1 |
| **C3** | `--strict` contrast DoD after density waves | P2 | theme program | No |
| **C4** | Full inventory P1/P2 remaster | P2 | FE waves | No — not claimed |
| **C5** | QA title MD Layer-B 3/8 | PROCESS-P3 | qa template | No — QC pack 8/8 |

**Explicit:** This **GO** closes **C1** only. It does **not** close Phase 1, PROD-READY, or full remaster. Parent FE-W1 GWC **C2** ENV remains until deploy parity.

---

## Gate verdict

### **GO** — C1 title polish closed

- Independent QC sample of exit_criteria **1–4** = **PASS**.
- Parent GWC condition **C1** = **CLOSED**.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT full remaster GO.**

---

## completion_report

- **Closed:** QC sample-audit C1 — CC hero XeVN OS + Command Center; no X-BOS Unified Portal; document title XeVN OS; TopHeader portal-brand-mark + wordmark XeVN intact; contrast exit 0 debt 0.
- **Residual:** Parent **C2** `:8088` ENV; C3–C5 non-blocking. Full remaster / Phase1 / PROD **not** claimed.
- **Did not:** seed; reopen FE-W1 chrome beyond title; edit `apps/**`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-PM-INTAKE-C1-CLOSED-01
from_role: qc
to_role: pm
entry_criteria: XEVN-THM-QC-W1-TITLE-C1-01 GO — docs/qa/evidence/xevn-thm-qc-w1-title-c1-01-20260722.md · C1 CLOSED
exit_criteria:
1) Bus INTAKE — FE-W1 GWC C1 closed; update TEAM_WORKING_NOW / theme program residual (C2 ENV remain)
2) Continue open theme waves (HRM/MOB/inventory P1–P2) — do NOT claim full remaster / Phase1 / PROD DONE
3) When sponsor wants live VPS parity → Task devops deploy web-portal then QA spot title+TopHeader on :8088 (close C2)
cấm: seed; Phase1/PROD/full remaster DONE claim; reopen FE-W1 P0 chrome without contrast+brand regression
evidence_path: docs/program/AGENT_MESSAGE_BUS.md (append) + docs/program/TEAM_WORKING_NOW.md
ack_status: DISPATCHED next wave
```

## ack_status

**PASS_TO_PM** — gate_verdict **GO** (C1 closed)
