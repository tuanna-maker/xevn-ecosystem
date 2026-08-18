# P1-HRM-MENU-QA-PERFORMANCE — Đánh giá (performance)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-PERFORMANCE` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **spec_ref** | HRM-PF-01..04 · `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` · OpenAPI `/performance/cycles`, `/evaluations` · matrix `HRM_MENU_DATA_LINKAGE_MATRIX.md` `/performance` |
| **U65** | zero-seed · browser FE + read-only API probe (Bearer); no `pnpm seed:*` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GWC** (GO WITH CONDITIONS) |

---

## Verdict

**GWC** — HRM app deep-link `/hr/performance` lists cycles/evaluations correctly (HRM-PF-02/04). Portal Command Center **does not** expose menu «Đánh giá»; deep-link `/command-center/hrm/performance` **redirects to dashboard** (`registry.ts` gap — documented, not HTTP 404). Mutate HRM-PF-01/03 **not verified** this wave (`RATE-429` under parallel menu QA load). Perf P1 residuals: list latency >3s and ×N duplicate GETs/POSTs.

| Gate | Result |
|------|--------|
| L0 portal deep-link `/command-center/hrm/performance` | **GWC / spec_gap** — SPA 200 → `Navigate` → `/command-center/hrm/dashboard`; no ERROR banner; menu has no «Đánh giá» |
| L0/L2 HRM app `/hr/performance?portal=1&companyId=main` | **PASS** — title «Hiệu suất - Chu kỳ đánh giá»; lists **14** cycles / **300** evals; no Sync ERROR |
| Network list GET cycles / evaluations | **PASS** — `200` `HRM-PERF-200` (read probe + page resource) |
| Console P0 (duplicate key / uncaught) | **PASS** (no error hooks on list load; toast only on mutate 429) |
| Mutate HRM-PF-01 «Tạo chu kỳ» FE | **BLOCKED** — `POST /api/hrm/performance/cycles` → **429** `RATE-429` (×3–4 per click) |
| Mutate HRM-PF-03 «Tạo đánh giá» FE | **NOT RUN** (blocked by same rate-limit window) |
| L2.5 J-* performance | **N/A** — no `J-HRM-*` performance row in `PROGRAM_JOURNEY_MAP.md` |
| Perf / scale notes | **P1 residual** — evaluations GET wall ~3.9–11s; cycles/evals/subscription called ×2–×4 |

---

## Environment / click path

| Item | Value |
|------|-------|
| Portal URL tried | `http://14.225.217.232:8088/command-center/hrm/performance` |
| Portal result | Redirect → `…/command-center/hrm/dashboard`; iframe ` /hr/?portal=1&tenantId=xevn&companyId=main&_v=…` |
| Portal sidebar | MENU CHÍNH **without** «Đánh giá» (matches `HrmWorkspaceMenuKey` / `HRM_ALL_VIEWS` — no `performance`) |
| HRM app URL | `http://14.225.217.232:8088/hr/performance?portal=1&tenantId=xevn&companyId=main` |
| HRM app title | UNICOM HRM — page «Hiệu suất - Chu kỳ đánh giá» |
| Screenshot | agent capture `page-2026-07-17T02-10-26-044Z.png` (local Temp/cursor/screenshots) |

### Portal registry gap (U65 / program note)

- Code: `apps/web/web-portal/src/modules/hrm/types.ts` + `registry.ts` — `performance` **absent**.
- `HrmWorkspaceRoute`: `!viewValid` → `<Navigate to={hrmPortalPath('dashboard')} replace />`.
- HRM app sidebar **does** include `{ path: '/performance', module: 'performance' }` (`AppSidebar.tsx`).
- **Classification:** `spec_gap` / product gap vs matrix row `/performance` — **not** HTTP 404 body; deep-link silently falls back to dashboard.
- Program expected this: `P1-HRM-FULL-MENU-QA-PROGRAM.md` footnote — «portal registry chưa liệt kê — QA deep-link URL; ghi spec_gap nếu 404».

---

## API evidence (HRM-PF-02 / HRM-PF-04)

Auth: `POST /api/xbos/auth/login` as `ceo@xe.vn` → Bearer JWT `companyId=main`.

| Endpoint | HTTP | code | total | wall (sample) |
|----------|------|------|-------|----------------|
| `GET /api/hrm/performance/cycles?company_id=main` | **200** | `HRM-PERF-200` | **14** | ~1.0–10.4s (resource); probe ~2.5s |
| `GET /api/hrm/performance/evaluations?company_id=main` | **200** | `HRM-PERF-200` | **300** | ~1.4–11.3s (resource); probe ~3.9s |

Unauthenticated probe (control): `401` `HRM-AUTH-001` «Unauthorized performance access».

Later parallel-wave probes returned `429 RATE-429` — env contention, not contract fail.

AC-FID-13 density (cycles ≥5, evals ≥300): **met** on live list totals (14 / 300).

---

## FE after load (HRM app)

- Headings: «Danh sách chu kỳ (14)», «Danh sách đánh giá (300)».
- Sample cycle rows: `QA cycle vis2…`, `Q2 2026` (active), `Q1 2026` (closed).
- Sample eval rows: `Employee {uuid} - {score} điểm` (seed labels visible in summary text — historical density data, not this-wave seed).
- Forms present: «Tạo chu kỳ», «Tạo đánh giá» (UUID employee/cycle — UX crude vs luxury SRS, out of gate for this menu smoke).

---

## Mutate attempt (HRM-PF-01) — U65 FE

1. Fill `QA-PF-MENU-20260717B`, start `2026-07-01`, end `2026-09-30`.
2. Click **Tạo chu kỳ**.
3. Network: `POST /api/hrm/performance/cycles` → **429** `RATE-429` «Too many requests» (observed **×3–×4** identical POSTs per one click).
4. Toast: «Too many requests».
5. List count stayed **(14)**; new name **not** in UI.

**defer_reason:** rate-limit under concurrent P1-HRM-MENU-QA-* waves on `:8088`. Retest mutate when RATE-429 clears.

---

## Console / Network / Perf

| Check | Observation |
|-------|-------------|
| Banner ERROR / 409 scope / 54321 | **None** on `/hr/performance` |
| Duplicate React key | **Not observed** on this page |
| GET ×N | cycles / evaluations / `company-subscription` each **×2–×4** on load — P1 (aligns CD-FB-03 mount×2 class) |
| Latency >3s | evaluations + subscription often **>3s** (P1; NFR owner `P1-HRM-NFR-1000-SA`) |
| POST ×N | single «Tạo chu kỳ» → **3–4** POSTs (P1 — StrictMode or mutation fire bug; retest after 429 clears) |

---

## Conditions / residuals (PM dispatch)

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **COND-PF-PORTAL-01** | P1 product/spec_gap | `dev-fe` (+ BA if AC) | Add `performance` to portal `HrmWorkspaceMenuKey` / `HRM_ALL_VIEWS` / Sidebar + iframe map `/hr/performance`, or BA waive as app-only with matrix note |
| **COND-PF-MUTATE-01** | P1 verify gap | `qa` | Retest HRM-PF-01/03 FE create → 2xx → F5 when `:8088` not RATE-429 |
| **COND-PF-PERF-01** | P1 NFR | `technical-manager` / `P1-HRM-NFR-1000-SA` | p95 list <2s @ scale; coalesce duplicate GETs |
| **COND-PF-POST-XN** | P2 | `dev-fe` | Investigate ×3–4 POST on one «Tạo chu kỳ» click |

---

## completion_report

**Closed:** Browser QA for menu «Đánh giá» / performance on Dev8088 — portal registry gap documented; HRM app L2 list PASS for HRM-PF-02/04 with live totals 14/300 and `HRM-PERF-200`.

**Open:** Portal embed/menu wiring; mutate FE blocked by RATE-429; perf latency + duplicate calls; no J-* row for performance.

---

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-performance-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-MENU-QA-PERFORMANCE-FOLLOWUP
from_role: qa
to_role: pm
entry_criteria: evidence docs/qa/evidence/p1-hrm-menu-performance-20260717.md (GWC)
actions:
1) Dispatch dev-fe COND-PF-PORTAL-01 — add performance to portal registry/sidebar OR BA waive + matrix note (spec_gap vs HRM_MENU_DATA_LINKAGE_MATRIX /performance).
2) When :8088 RATE-429 clears, re-dispatch qa COND-PF-MUTATE-01 — FE Tạo chu kỳ + Tạo đánh giá → POST 2xx → F5; also confirm POST×1 not ×3–4.
3) Keep P1-HRM-NFR-1000-SA ownership of COND-PF-PERF-01 (evals list >3s, GET×N).
exit_criteria: PM bus DISPATCHED for portal gap and mutate retest; no claim DONE on performance menu until COND-PF-MUTATE-01 closed or waived with owner+expiry.
```
