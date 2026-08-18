# QA evidence — P1-HRM-MENU-QA-DECISIONS (2026-07-17)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-MENU-QA-DECISIONS` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** (GWC) |
| **verdict** | **PASS GWC** — honest empty (U65); no fake rows; API live 200 |
| **executed_at** | 2026-07-17T01:58Z (UTC+7 session) |
| **environment** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · role `group_ceo` |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/decisions` |
| **iframe** | `http://14.225.217.232:8088/hr/decisions?portal=1&tenantId=xevn&companyId=main` |
| **spec_ref** | UC-HRM-27 · `docs/hrm/SRS.md` § UC-HRM-27 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 `decisions` |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **U65** | Zero-seed — browser login → menu → load only (no mutate / no `pnpm seed:*`) |

## Executive summary

| Lớp | Verdict | Notes |
|-----|---------|-------|
| **L0** | **PASS** | Route loads; no ERROR / Sync ERROR banner; no `54321`; no 409 scope on load |
| **L2** | **PASS** | Empty table «Không có quyết định nào» · pagination `0 - 0 / 0` · type tabs all **0** · matches API `total:0` |
| **Console / UI error** | **PASS** | No red sync/ERROR banner in shell or iframe; no fake-name rows |
| **Network** | **PASS GWC** | `GET /api/hrm/decisions` → **200** `HRM-DEC-200` · `data:[]` · residual P1 latency/dupe |
| **L2.5 J-*** | **N/A** | No J-* row for decisions in `PROGRAM_JOURNEY_MAP.md`; list empty → no list→detail |
| **Mutate** | **Not in scope** | U65 load/empty honesty only; create button present but not exercised |
| **Fake / mock data** | **PASS** | 0 rows; no mock names (`Nguyễn Văn A` / `Test 123` / `QĐ-MOCK`) |
| **Spec honesty** | **GWC + spec_gap** | UI empty is honest for live API; matrix/SRS still say «deferred / no REST / mock» — **stale** |

**Overall:** **PASS GWC** for menu load + U65 empty honesty. Do **not** claim UC-HRM-27 DONE (SRS backlog AC). Promote Dev8088 empty operability; keep module **not** fidelity-complete until BA closes spec_gap + optional data density.

---

## Click path (browser)

1. Login `ceo@xe.vn` → redirect/session → Command Center HRM  
2. Sidebar **Quyết định** → URL `…/command-center/hrm/decisions`  
3. Iframe `/hr/decisions?portal=1&tenantId=xevn&companyId=main`  
4. Observe: scope «Tất cả đơn vị (rollup)» · tabs Bổ nhiệm…Gia hạn HĐ all **0** · empty cell · pagination 0  

**Screenshot:** Cursor browser capture `page-2026-07-17T01-59-17-241Z.png` (decisions empty table + sidebar current).

---

## Network (iframe Performance + API probe)

### Embed resource timings (page load)

| Endpoint | Duration (ms) | Notes |
|----------|---------------|-------|
| `GET /api/hrm/operating-units` | 930 | Scope bar |
| `GET /api/hrm/company-subscription?company_id=main` | 1925 | |
| `GET /api/hrm/settings-catalogs` | 2086 | Large (~113KB) |
| `GET /api/hrm/decisions?company_id=main` | **1024** | Decisions list |
| `GET /api/hrm/employees?company_id=main&page_size=100` | 1282 | Loaded even when list empty (form options) |
| `GET /api/hrm/decisions?company_id=main&page=1&page_size=20` | **3070** | **P1** >3s on this load |

**Duplicate:** decisions called **×2** (no-page + paged) — **P1** coalescing candidate (`PERF-HRM-DEC-DUP-01`).

### Auth probe (same env)

```text
POST /api/xbos/auth/login → XBOS-AUTH-200 · companyId=main
GET  /api/hrm/decisions?company_id=main&page=1&page_size=20
  → 200 HRM-DEC-200
  → {"success":true,"code":"HRM-DEC-200","message":"Decisions listed",
     "data":{"total":0,"page":1,"page_size":20,"data":[]}}
  → ~188–197 ms cold probe (vs 3070 ms once under embed load — env contention)
```

No seed used. Empty = true empty DB for scope, not fake fill.

---

## FE empty-state copy vs matrix AC

| Source | Expected / observed |
|--------|---------------------|
| **Matrix §2.1** | Deferred; empty must ghi «chưa triển khai API» |
| **UI observed** | «Không có quyết định nào» + `0 bản ghi` |
| **API observed** | Live REST `GET /api/hrm/decisions` **200** `total:0` |
| **SRS UC-HRM-27** | «Hiện mock — chờ BRD»; «không claim DONE» |
| **Code** | `useDecisions` → `listHrDecisions`; Nest `DecisionsController` / `hr_decisions` |

**Interpretation:** Empty copy is **honest for a live empty API**. Matrix AC requiring «chưa triển khai API» is **obsolete** given REST exists. Create (+) chrome implies CRUD capability — consistent with API, **not** with SRS «mock/backlog» wording → **spec_gap**.

---

## Defect / residual register

| ID | Sev | Owner | Description |
|----|-----|-------|-------------|
| **SPEC-GAP-HRM-DEC-01** | **P1** | `ba-process` (+ SA if ADR) | UC-HRM-27 / matrix §2.1–2.2 still «no REST / mock / deferred»; runtime has `HRM-DEC-200` + FE CRUD hooks. Update AC: live API empty OK; drop «chưa triển khai API» or mark module Implemented-empty. |
| **PERF-HRM-DEC-01** | **P1** | `dev-fe` / `dev-be` | Embed load: decisions request **3070 ms** once; also **×2** list calls. Target p95 &lt;2s; coalesce query. |
| **PERF-HRM-DEC-02** | **P2** | `dev-fe` | Loads `employees?page_size=100` (~123KB) on empty decisions list — defer until open create dialog. |

**No P0** console duplicate-key / 409 / 500 / fake-data FAIL on this menu.

---

## Comparison to prior audits

| Prior | Claim | This run |
|-------|-------|----------|
| `p1-hrm-web-audit-20260606` | decisions NOT PROMOTED — «No REST (deferred)» | **Superseded for API existence** — REST present; empty honest |
| `p1-hrm-h12-journey-qa-20260606` spot | PASS GWC empty «Không có quyết định nào» | **Reconfirmed** on `:8088` |

---

## Gate mapping (program roster)

| Criterion | Result |
|-----------|--------|
| Tab load L0 | PASS |
| UI data or empty+200 | PASS (`total:0` + empty copy) |
| Console P0 | PASS (no ERROR banner; no fake rows) |
| Network 2xx | PASS (`HRM-DEC-200`) |
| Endpoint &gt;3s | GWC residual `PERF-HRM-DEC-01` |
| Duplicate ×N | GWC residual `PERF-HRM-DEC-DUP-01` / `PERF-HRM-DEC-01` |
| L2.5 J-* | N/A (no journey row; empty list) |
| U65 no seed | PASS |

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **completion_report:** Closed browser U65 QA for exclusive menu **Quyết định** on `:8088`. L0/L2 empty honesty PASS; API live empty confirmed; no fake data. Residuals: SPEC-GAP-HRM-DEC-01 (BA), PERF-HRM-DEC-01/02 (Dev). UC-HRM-27 not DONE.
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-decisions-20260717.md`
- **next_dispatch_prompt:** |

```text
work_item_id: P1-HRM-MENU-QA-DECISIONS-INTAKE
from_role: qa | to_role: pm
Intake PASS GWC evidence docs/qa/evidence/p1-hrm-menu-decisions-20260717.md.
1) Dispatch ba-process SPEC-GAP-HRM-DEC-01: update docs/hrm/SRS.md UC-HRM-27 + HRM_MENU_DATA_LINKAGE_MATRIX.md §2.1/§2.2 — REST GET/POST /api/hrm/decisions exists (HRM-DEC-200); empty UI «Không có quyết định nào» is valid live-empty, not «chưa triển khai API»; keep không claim DONE until BRD density/CRUD AC explicit.
2) Optional same wave: Task dev-fe PERF-HRM-DEC-01 coalesce duplicate decisions list + defer employees page_size=100 until create dialog (evidence network table).
3) Continue P1-HRM-FULL-MENU-QA-PROGRAM next roster menu; do not block QC program solely on decisions GWC if other menus complete.
```
