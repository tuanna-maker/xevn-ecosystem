# PO-HRM-UI-BRAND-W3-PORT-B-QA — Portal PORT-09…10 + PORT-A residuals

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-PORT-B-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser visual UF |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w3-port-b.md` **READY_FOR_QA** |
| **Prior** | PORT-A-QA PASS `docs/qa/evidence/po-hrm-ui-brand-w3-port-a-qa.md` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | PORT-09 · PORT-10 · residual CC settings tables + AppHeader |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope

| In scope | Out of scope (cấm claim) |
|----------|--------------------------|
| Theme contrast gate (+ `--strict`) | Remaster DONE / 177-screen CLOSED |
| Browser PORT-09 HRM Index | Attendance CLOSED · Face LIVE invent |
| Browser PORT-10 `/cockpit` | EMP/ATT business remaster |
| CC settings table headers (member units) | Seed / API mutate for UF |
| AppHeader muted → sharp secondary | Product / QC GO |

---

## 2. L0 + theme gates

### 2.1 L0 stack

| Probe | Result |
|-------|--------|
| hrm-api `:28001/api/hrm` | **200** |
| xbos-api `:28002/api/xbos` | **200** |
| web-portal `:5173` | **200** |
| hrm-fe `:8080` | **200** |

`pnpm run qc:dev-stack` — HRM + XBOS + portal ✓ (Node UV exit noise on Windows after PASS — non-blocking; same as PORT-A-QA).

### 2.2 Theme contrast

```bash
pnpm run verify:xevn:theme-contrast
# exit 0 · token lockstep PASS · pale hits=0 · scanned 598

pnpm run verify:xevn:theme-contrast -- --strict
# exit 0 · STRICT PASS — 0 pale hits
```

**Seed:** none (U65).

---

## 3. Browser spot PORT-09 / PORT-10 / residuals

**Harness:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-port-b-qa.mjs`  
**Machine log:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-port-b-qa-browser.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-brand-w3-port-b-qa/`

| surface_id | URL / path | Dual-surface | Pale / purple | Chrome verdict | Screenshot |
|------------|------------|--------------|---------------|----------------|------------|
| **PORT-09** | `:8080/hr/` standalone | Light ops + dark sidebar; **no** brand-shell / marketing hero | purple/indigo quick-action classes **0**; primary `#1e40af` | **PASS** — ops-dense Tổng quan; EmptyState payroll honesty | `…/PORT-09-hrm-index.png` |
| **AppHeader** | co-located PORT-09 header | surface/border xevn | icons `rgb(107,114,128)` muted; labels `rgb(75,85,99)` = `#4B5563`; no `text-muted-foreground` | **PASS** — membership «CEO Tập đoàn» readable | `…/PORT-09-appheader.png` |
| **PORT-10** | `:5173/cockpit` | Light ops canvas `rgb(249,250,251)` | purple/indigo **KPI** classes/fills **0**; avatar primary; token `#1e40af` | **PASS** — ApiLoadBanner strict honesty visible; KPI tiles primary | `…/PORT-10-cockpit.png` |
| **CC-settings** | `:5173/command-center?settings=company_member_units` | Light ops | 6/6 `th` `text-xevn-textSecondary` · computed `rgb(75,85,99)` · `text-slate-500` **0** | **PASS** — Đơn vị thành viên table | `…/CC-settings-member-units-table.png` |

### 3.1 Honesty

| Spot | Evidence | Verdict |
|------|----------|---------|
| HRM catalog sync | PORT-09 — «Đồng bộ danh mục Đã kết nối…» | **Visible** |
| Payroll EmptyState | PORT-09 — «Chưa có dữ liệu lương… không hiển thị số 0 giả» | **Visible** |
| Contract warning | PORT-09 — «Hợp đồng sắp hết hạn» | **Visible** |
| Cockpit ApiLoadBanner | PORT-10 — strict: demo revenue cards hidden | **Visible** |

### 3.2 Console / pageErrors

| Class | Count | Notes |
|-------|------:|-------|
| `pageErrors` | **0** | — |
| console 404 | 1 | Non-blocking chrome noise |

---

## 4. Matrix rollup

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | `verify:xevn:theme-contrast` exit 0 | **PASS** |
| 2 | `--strict` exit 0 / 0 pale | **PASS** |
| 3 | PORT-09 HRM index sharp · no marketing hero | **PASS** |
| 4 | PORT-10 cockpit · no purple AI KPI · primary `#1E40AF` | **PASS** |
| 5 | CC settings table headers ≠ slate-500 | **PASS** (6/6 `#4B5563`) |
| 6 | AppHeader muted → sharp secondary | **PASS** |
| 7 | Honesty banners kept | **PASS** |
| 8 | U65 zero-seed | **PASS** |

**Overall:** **PASS_TO_PM**

---

## 5. Residual (non-blockers)

| Item | Severity | Owner / note |
|------|----------|--------------|
| ModuleCard **X-SCM** domain gradient `#7c2d92` in `mockExecutiveDashboardData` (not AI KPI chrome) | OBS P2 | Matches FE residual «colorful module cards»; KPI/avatar already primary — optional later token-align |
| Open Questions §3 B1–B5 blank — A1–A5 interim | Governance | Sponsor / SA |
| Parallel W3-ATT-B / EMP-B seats | Program | other seats |
| Console 404 noise | OBS | ignore for chrome gate |

**Cấm claim:** remaster DONE · Attendance CLOSED · Face LIVE · product GO.

---

## 6. Handoff

### completion_report

W3-PORT-B-QA closed: theme-contrast + `--strict` exit **0**; browser U65 `ceo@xe.vn` PASS on PORT-09 (ops-dense Index, no marketing hero), PORT-10 (`/cockpit` primary `#1E40AF`, no purple AI KPI classes, ApiLoadBanner honesty), CC settings member-units table headers all `text-xevn-textSecondary` / `#4B5563` (PORT-A P2 closed), AppHeader muted→xevn tokens. Honesty sync/EmptyState/strict banners kept. Residual OBS only (X-SCM ModuleCard domain purple). Not remaster DONE / ATT CLOSED.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-PORT-B-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-port-b-qa.md
Continue W3 brand seats in flight (ATT-B / EMP-B) or next open brand backlog.
Optional: QC chrome spot PORT-09/10 only if gate needs — do not invent remaster DONE.
OBS P2 optional later: ModuleCard X-SCM domain #7c2d92 → primary-family (not blocker).
cấm: remaster DONE · Attendance CLOSED · Face invent · seed · reopen PORT-B-QA without FAIL
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-port-b-qa.md`
