# PO-HRM-UI-BRAND-W3-PORT-A-QA — Portal + HRM shell chrome remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-PORT-A-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only visual UF |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w3-port-a.md` **READY_FOR_QA** |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` PORT-01…PORT-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope

| In scope | Out of scope (cấm claim) |
|----------|--------------------------|
| Theme contrast gate (+ `--strict`) | Remaster DONE / 177-screen CLOSED |
| Browser chrome PORT-01…08 | Attendance CLOSED · Face LIVE invent |
| Dual-surface dark login / light ops | EMP/ATT business remaster |
| Honesty banners kept where applicable | Seed / API mutate for UF |
| | Product / QC GO |

---

## 2. L0 + theme gates

### 2.1 L0 stack

| Probe | Result |
|-------|--------|
| hrm-api `:28001/api/hrm` | **200** |
| xbos-api `:28002/api/xbos` | **200** |
| web-portal `:5173` | **200** |
| hrm-fe `:8080` | **200** |

`pnpm run qc:dev-stack` — all three primary checks ✓ (Node UV exit noise on Windows after PASS — non-blocking).

### 2.2 Theme contrast

```bash
pnpm run verify:xevn:theme-contrast
# exit 0 · token lockstep PASS · pale hits=0 · scanned 598

pnpm run verify:xevn:theme-contrast -- --strict
# exit 0 · STRICT PASS — 0 pale hits
```

Foundation token gate **not re-litigated** — re-confirm only.

**Seed:** none (U65).

---

## 3. Browser spot PORT-01…08

**Harness:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-port-a-qa.mjs`  
**Machine log:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-port-a-qa-browser.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-brand-w3-port-a-qa/`

| surface_id | URL / path | Dual-surface | Pale body | Chrome verdict | Screenshot |
|------------|------------|--------------|-----------|----------------|------------|
| **PORT-01** | `:5173/login` | Dark `xevn-brand-shell` + dialog card | No | **PASS** — primary `#1e40af` · mark + form | `…/PORT-01-portal-login.png` |
| **PORT-02** | `:5173/` UnifiedShell | Light ops (no brand shell) | No | **PASS** | `…/PORT-02-unified-shell.png` |
| **PORT-03** | `:5173/command-center` | Light ops + module rail | No | **PASS** — TopHeader + BOD persona | `…/PORT-03-command-center.png` |
| **PORT-04** | `:5173/command-center/inbox` | Light ops | No | **PASS** | `…/PORT-04-inbox.png` |
| **PORT-05** | `:5173/command-center/hrm/employees` | Light embed chrome | No | **PASS** — no dark shell wrap | `…/PORT-05-hrm-embed.png` |
| **PORT-06** | TopHeader on CC | Membership / CEO Tập đoàn | No | **PASS** (co-located CC) | `…/PORT-06-topheader-membership.png` |
| **PORT-07** | `:5173/hr/login` (HRM) | Dark brand shell + dialog | No | **PASS** — no marketing left panel; sync honesty banner visible | `…/PORT-07-hrm-login.png` |
| **PORT-08** | `:8080/hr/employees` **standalone** (no `portal=1`) | Dark sidebar + light canvas | No | **PASS** — 16 `.sidebar-link`; active primary; sync banner | `…/PORT-08-hrm-sidebar.png` |

**PORT-08 note:** AppSidebar is **intentionally hidden** under `?portal=1` / embed (`AppLayout` portal branch). Standalone `:8080` without portal QS is the correct surface for PORT-08.

### 3.1 Honesty

| Spot | Evidence | Verdict |
|------|----------|---------|
| HRM login sync banner | PORT-07 — «Đồng bộ danh mục» / session message | **Visible** |
| HRM shell catalog sync | PORT-08 — «Đồng bộ danh mục Đã kết nối…» | **Visible** |
| Face GĐ2 tab banner | Attendance Face nav sample empty this run | **OBS** — not chrome FAIL; Face hold still code-must_keep |

### 3.2 Console / pageErrors

| Class | Count | Notes |
|-------|------:|-------|
| `pageErrors` | **0** | — |
| console 404/401 | few | Non-blocking for chrome (favicon/auth noise) |

---

## 4. Matrix rollup

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | `verify:xevn:theme-contrast` exit 0 | **PASS** |
| 2 | `--strict` exit 0 / 0 pale | **PASS** |
| 3 | Browser PORT-01…08 chrome spot | **PASS** 8/8 |
| 4 | No pale AI body/labels on chrome | **PASS** |
| 5 | Dual-surface dark login / light ops | **PASS** |
| 6 | Honesty banners still visible (applicable) | **PASS** (sync banners) · Face tab OBS |
| 7 | U65 zero-seed | **PASS** |

**Overall:** **PASS_TO_PM**

---

## 5. Residual (non-blockers)

| Item | Severity | Owner / work_item |
|------|----------|-------------------|
| CC settings **table** headers still `text-slate-500` (content, not shell) | P2 | `PO-HRM-UI-BRAND-W3-PORT-B` |
| AppHeader muted icon/hint density | P2 | PORT-B / header seat |
| Face GĐ2 honesty click-path empty in this harness | OBS | optional retest with ATT menu path — not remaster blocker |
| Console 404/401 noise | OBS | ignore for chrome gate |

**Explicit non-claims:** remaster not DONE · Attendance not CLOSED · Face not LIVE · EMP/ATT business remaster not started · product not GO.

---

## 6. Handoff

### completion_report

W3-PORT-A QA closed: contrast + strict exit 0; L0 up; browser PORT-01…08 PASS (dual-surface OK; sidebar verified standalone `:8080`; honesty sync banners visible). U65 no seed. Residuals P2 → PORT-B only.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-PORT-B
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
entry_criteria:
  - PO-HRM-UI-BRAND-W3-PORT-A-QA PASS_TO_PM
  - evidence docs/qa/evidence/po-hrm-ui-brand-w3-port-a-qa.md
  - inventory PORT-09…PORT-10 + residual (CC settings table slate-500 · AppHeader muted)
exit_criteria:
  - Remaster PORT-B slice only; keep honesty; verify:xevn:theme-contrast --strict exit 0
  - READY_FOR_QA + evidence path
cấm: seed · invent Face · Attendance CLOSED · claim full remaster DONE
```

### ack_status

**PASS_TO_PM**
