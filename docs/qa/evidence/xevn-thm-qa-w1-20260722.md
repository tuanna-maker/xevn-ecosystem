# XEVN-THM-QA-W1 — Portal FE-W1 remaster browser spot

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QA-W1` |
| **Date** | 2026-07-22 |
| **Owner** | QA |
| **from_role** | pm |
| **Program** | `P1-XEVN-THEME-REMASTER` FE-W1 portal |
| **spec_ref** | `ADR-XEVN-THEME-SHARP-OPS-20260722` · FE evidence `xevn-thm-fe-w1-20260722.md` · inventory FE-W1 P0 |
| **entry** | Dev-FE READY `docs/qa/evidence/xevn-thm-fe-w1-20260722.md` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed; browser login → CC / dashboard only |
| **env** | Local portal `http://localhost:5173` (FE-W1 source) + API proxy → `http://14.225.217.232:8088` · persona `ceo@xe.vn` |

---

## 1. Verdict

| Gate | Result |
|------|--------|
| Login → Command Center | **PASS** |
| TopHeader mark + wordmark «XeVN» brand test | **PASS** (`data-testid=portal-brand-mark` on `/dashboard/organization`) |
| CC settings labels not pale | **PASS** (`?settings=company_member_units` — 0 `text-slate/gray-400` in DOM) |
| `pnpm run verify:xevn:theme-contrast` exit 0 · debt ≤ 16 | **PASS** (debt **0** ≤ baseline **0**; also ≤16) |
| Do **not** fail `apps/web/hrm` pale | **PASS** — waived per dispatch; baseline now 0 after FE-W1-HRM (out of this Task scope) |

**Overall: PASS_TO_PM** — FE-W1 portal chrome/settings accepted. Not full theme remaster DONE / not Phase1 PROD.

---

## 2. Exit criteria map

| # | Criterion | Method | Result |
|---|-----------|--------|--------|
| 1 | Login → CC | Browser `ceo@xe.vn` → `/command-center` | **PASS** |
| 2 | TopHeader mark + wordmark brand | After unlock → `/dashboard/organization`; CDP assert testid + «XeVN» | **PASS** |
| 3 | CC settings labels not pale | Open rail **Cài đặt hệ thống** → Đơn vị thành viên; CDP + screenshot | **PASS** |
| 4 | Contrast gate debt ≤ 16 | `pnpm run verify:xevn:theme-contrast` | **PASS** exit 0 |
| 5 | Do not FAIL HRM pale (FE-W1-HRM) | Policy | **PASS** (not used as FAIL) |

---

## 3. Browser evidence (U65)

### 3.1 Command Center chrome

- URL: `http://localhost:5173/command-center`
- CC page header title remains product string **«X-BOS Unified Portal»** + subtitle Command Center (tokens `text-xevn-text` / `text-xevn-textSecondary`) — **not** TopHeader; sticky glass present.
- Module rail labels use `text-xevn-textSecondary` (`rgb(75, 85, 99)`).
- Screenshot: `xevn-thm-qa-w1-cc-header.png` (agent temp).

### 3.2 CC settings (not pale)

- Click path: CC → **Cài đặt hệ thống** → `?settings=company_member_units`
- CDP: `paleClassHits=0` for `text-slate-400|text-gray-400|text-slate-300` on labels/captions sampled.
- Captions readable (`text-slate-500` / primary bold); table headers dark `#111827`.
- Screenshot: `xevn-thm-qa-w1-cc-settings.png`.

### 3.3 TopHeader brand test (MainLayout)

- Unlock: `sessionStorage xevn.portal.unlocked=1` → `/dashboard/organization`
- Assert:
  - `data-testid=portal-brand-mark` **present**
  - `aria-label` = `XeVN — về Command Center`
  - Wordmark span text = **`XeVN`**
  - Logo `src=/xevn-logo.png` (~h-10)
  - Header `h-14` + `bg-xevn-surface/80 backdrop-blur-md`
- Membership / profile readable; no purple avatar gradient observed.
- Screenshot: `xevn-thm-qa-w1-topheader.png`.

### 3.4 Env note

- VPS `:8088` TopHeader.tsx **pre-FE-W1** (no `portal-brand-mark`) — **not** used as SoT for this remaster spot.
- Local xbos-api `nest start` failed (`dist/main` missing / webpack path); QA used **local Vite + remote API proxy** for login.

---

## 4. Contrast gate

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] scanned 715 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict after W1)
EXIT:0
```

Baseline SoT at run time: `docs/qa/evidence/xevn-theme-contrast-baseline.json` (`work_item_id=XEVN-THM-FE-W1-HRM`, `hitCount=0`).

Portal source pale ban (`text-slate-400|text-gray-400|text-slate-300` under `apps/web/web-portal/src`): **0** hits.

---

## 5. Residual / not promoted

| ID | Note |
|----|------|
| CC title «X-BOS Unified Portal» vs TopHeader «XeVN» | Product dual naming — **not** FAIL this wave; optional FE polish |
| `--strict` program DoD | After density polish waves (FE evidence) |
| Full inventory P1/P2 rows | Continue remaster waves — not claimed DONE |
| Sidebar dark-rail HRM labels on MainLayout | Visual pale-on-dark possible; gate uses class ban — deferred density |

---

## 6. Handoff

```
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/xevn-thm-qa-w1-20260722.md
completion_report: XEVN-THM-QA-W1 PASS — TopHeader XeVN mark+wordmark; CC settings company_member_units labels not pale; verify:xevn:theme-contrast exit 0 debt 0≤16; HRM pale not failed.
next_dispatch_prompt: Intake XEVN-THM-QA-W1 PASS_TO_PM. If FE-W1-HRM READY_FOR_QA still open → Task qa that work_item; else continue theme inventory P1/MOB-W2 or QC sample theme wave. Do not claim full remaster DONE.
```
