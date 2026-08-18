# XEVN-THM-QA-FE-W1-TITLE-01 — Pilot :8088 CC title after DevOps sync

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QA-FE-W1-TITLE-01` |
| **Date** | 2026-07-22 |
| **Owner** | QA |
| **from_role** | pm |
| **Program** | `P1-XEVN-THEME-REMASTER` C1 title close on pilot |
| **entry** | DevOps READY_FOR_QA — `docs/qa/evidence/xevn-thm-do-sync-fe-w1-title-01-20260722.md` |
| **prior** | Local `:5173` title PASS — `xevn-thm-qa-w1-title-01-20260722.md`; QC C1 GO |
| **URL** | `http://14.225.217.232:8088/command-center` |
| **Account** | `ceo@xe.vn` (authenticated session; U65 zero-seed) |
| **U65** | browser-only; no seed; no curl-only PASS |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |

---

## 1. Scope / cấm

| In scope | Explicitly out |
|----------|----------------|
| Hard-refresh + DOM assert on pilot `:8088` | Seed / API mutate |
| CC hero `XeVN OS` + subtitle `Command Center` | Claim Phase1 / full remaster DONE |
| Tab title `XeVN OS \| Command Center` | Curl/Vite source alone as PASS |
| TopHeader `portal-brand-mark` + wordmark `XeVN` (org chrome) | Sidebar module label `X-BOS (Tập đoàn)` rename |

---

## 2. Exit criteria map

| # | Criterion | Method | Observed | Result |
|---|-----------|--------|----------|--------|
| 1 | Hard-refresh (Ctrl+Shift+R) after login | Browser on `:8088/command-center` | Ctrl+Shift+R executed; page reloaded; CDP re-assert after reload | **PASS** |
| 2 | CC hero h1 = `XeVN OS` (not `X-BOS Unified Portal`) | CDP + screenshot | `h1.page-title` = **XeVN OS**; `hasXBos=false` | **PASS** |
| 3 | Subtitle still `Command Center` | CDP | next sibling of h1 = **Command Center** | **PASS** |
| 4 | Tab title contains `XeVN OS \| Command Center` | Browser page title | **`XeVN OS \| Command Center`** | **PASS** |
| 5 | TopHeader `portal-brand-mark` + wordmark XeVN | Unlock → `/dashboard/organization` + CDP + screenshot | mark **present**; `aria-label` = `XeVN — về Command Center`; wordmark **XeVN**; logo `/xevn-logo.png` 40×40 | **PASS** |
| 6 | This evidence | Write | `docs/qa/evidence/xevn-thm-qa-fe-w1-title-01-20260722.md` | **PASS** |

**Overall: PASS_TO_PM** — C1 title closed on sponsor pilot `:8088`. Full remaster **not** claimed.

---

## 3. Browser evidence (CDP)

### 3.1 Command Center after hard-refresh

```json
{
  "url": "http://14.225.217.232:8088/command-center",
  "title": "XeVN OS | Command Center",
  "h1": "XeVN OS",
  "subtitle": "Command Center",
  "hasXBos": false
}
```

Screenshot: `page-2026-07-22T15-48-38-783Z.png` (CC hero XeVN OS + Command Center visible).

### 3.2 TopHeader regression (`/dashboard/organization`)

Unlock: `sessionStorage.setItem('xevn.portal.unlocked','1')` then navigate MainLayout route (same path as local title QA).

```json
{
  "url": "http://14.225.217.232:8088/dashboard/organization",
  "title": "XeVN OS | Command Center",
  "portalBrandMarkPresent": true,
  "ariaLabel": "XeVN — về Command Center",
  "wordmark": "XeVN",
  "imgs": [
    {
      "src": "/xevn-logo.png",
      "alt": "",
      "w": "40",
      "h": "40",
      "class": "h-10 w-10 object-contain"
    }
  ],
  "hasXBos": false
}
```

Screenshot: `page-2026-07-22T15-46-50-061Z.png` (TopHeader logo + wordmark XeVN).

---

## 4. Residual / not promoted

| ID | Note |
|----|------|
| Full theme remaster / FE-W1 inventory beyond title | **not claimed** |
| Sidebar module string `X-BOS (Tập đoàn)` | Secondary module label — out of this title AC |
| Contrast gate on VPS | Not re-run this wave (title/chrome only; local C1 already exit 0) |
| Phase1 / PROD DONE | **not claimed** |

---

## 5. Handoff

```yaml
work_item_id: XEVN-THM-QA-FE-W1-TITLE-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/xevn-thm-qa-fe-w1-title-01-20260722.md
completion_report: >
  PASS — Pilot :8088 after DevOps title sync. Hard-refresh CC: h1=XeVN OS,
  subtitle=Command Center, no X-BOS Unified Portal; document title
  XeVN OS | Command Center; TopHeader portal-brand-mark + wordmark XeVN intact
  on /dashboard/organization. U65 browser-only. Full remaster NOT claimed.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: XEVN-THM-QC-FE-W1-TITLE-01
  from_role: pm
  to_role: qc
  entry_criteria: QA PASS_TO_PM — docs/qa/evidence/xevn-thm-qa-fe-w1-title-01-20260722.md
  URL: http://14.225.217.232:8088/command-center
  account: ceo@xe.vn / Xevn@2026
  exit_criteria:
    1) Sample audit QA evidence vs AC (hard-refresh, h1 XeVN OS, subtitle Command Center, tab title, TopHeader mark)
    2) Close QC GWC C1 for pilot :8088 title slice OR record residual with owner
    3) Evidence docs/qa/evidence/xevn-thm-qc-fe-w1-title-01-20260722.md
  cấm: seed; claim Phase1/full remaster DONE; reopen FE-W1 beyond title AC
  ack_status: PASS_TO_PM (GO / GO WITH CONDITIONS / NO-GO)
```
