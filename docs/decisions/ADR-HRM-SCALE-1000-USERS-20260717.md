# ADR: HRM scale baseline — ≥1000 concurrent users + embed perf (:8088)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-SCALE-1000-USERS-20260717 |
| **work_item_id** | `P1-HRM-NFR-1000-SA` |
| **Program** | HRM UAT / customer demo perf · CD-FB-03 residual |
| **Status** | **Accepted** — **W1 FE CLOSED**; **W2 FE picker CLOSED** (QC GWC 2026-07-17); **W3 T-CONC GO WITH CONDITIONS** (QC **RERUN4** 2026-07-17: VPS-local LB **1000 VU** PASS — 0% err, list p95 **1481 ms**; hold **45s ≠ ADR 5min**; **T-P95-SUM 1183 ms** @1000; `COND-SCALE-W3-TIMEOUT-600` **CLOSED**; RERUN3 WAN ceiling 400 **superseded**; DO-W5 PG **superseded**); **DO-W3 rate-limit CLOSED**; **DO-W4 replicas+LB LIVE** |
| **Date** | 2026-07-17 |
| **Decision owner** | Technical Manager (TA lane) |
| **Consumers** | Dev-FE, Dev-BE, DevOps, QA, QC, PM |
| **Related ADRs** | `ADR-HRM-EMBED-DATA-MODE.md`, `ADR-HRM-RBAC-SCOPE-LADDER.md` |
| **Spec refs** | `docs/hrm/SRS.md` §UC-HRM-SCOPE / AC-INT-SCOPE-G-01 (≥1000 NV UAT); `docs/hrm/TECHSPEC.md` §2–4; `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §1–2 (`N_EMP(*) ≥ 1000`); `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md` |
| **Evidence (as-is)** | `docs/qa/evidence/cd-fb-03-hrm-perf-audit-20260620.md`, `p1-hrm-perf-{be-01,fe-01,fe-04}-20260620.md`, `p1-hrm-console-audit-20260716.md`, `p1-hrm-console-audit-qa-retest-20260716.md` |
| **Evidence (W1 FE close)** | `docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md`, `p1-hrm-scale-fe-w1-deploy-20260717.md`, `p1-hrm-scale-qa-w1-20260717.md`, **`qc-p1-hrm-scale-w1-20260717.md`** (GO WITH CONDITIONS) |
| **Evidence (W2 FE picker close)** | `docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md`, `p1-hrm-scale-fe-w2-deploy-20260717.md` (HEAD `5d27676`), `p1-hrm-scale-qa-w2-20260717.md`, **`qc-p1-hrm-scale-w2-20260717.md`** (GO WITH CONDITIONS) |
| **Evidence (W3 T-CONC)** | Baseline/QC: `p1-hrm-scale-w3-t-conc-20260717.md`, `qc-p1-hrm-scale-w3-20260717.md` (50 VU); DO-W2 re-run: `p1-hrm-scale-w3-t-conc-rerun-20260717.md`, `qc-p1-hrm-scale-w3-rerun-20260717.md` (200 VU, 429@400); **DO-W3:** `p1-hrm-scale-do-w3-20260717.md` (rate-limit CLOSED); **QC rerun2:** `qc-p1-hrm-scale-w3-rerun2-20260717.md`; **DO-W4:** `p1-hrm-scale-do-w4-20260717.md` + `_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` (**VPS-local** `:3101` **1000 VU PASS**, `t_conc_met=true`); WAN console `_p1-hrm-scale-do-w4-t-conc-console-20260717.txt` = **not** capacity SoT; **QC RERUN3:** `qc-p1-hrm-scale-w3-rerun3-20260717.md` (NO-GO on WAN — **superseded** for ceiling); **QC RERUN4:** `qc-p1-hrm-scale-w3-rerun4-20260717.md` (**GWC**) |

---

## 1. Decision context

### 1.1 Sponsor requirement (two distinct NFRs)

| NFR class | Meaning | Current SoT |
|-----------|---------|-------------|
| **NFR-DATA-1k** | Workforce cardinality ≥ **1000 nhân viên** in scope (group CEO rollup) | Matrix AC-FID-01 / SRS AC-INT-SCOPE-G-01 — **met** on `:8088` (~1107–1109 rows) |
| **NFR-CONC-1k** | Platform supports **≥1000 concurrent authenticated users** (sessions/requests) without p95 collapse or console P0 | **GWC (RERUN4)** — VPS-local LB **1000 VU / 45s / 0% err / list p95 1481 ms**; full ADR ideal (**5 min** hold + summary p95 &lt;1s @1000) still **conditional** |

This ADR treats **NFR-CONC-1k** as the primary target and treats **NFR-DATA-1k** as the **hot-path payload** that must stay efficient when many users open HRM embed simultaneously.

### 1.2 Pain on `:8088` (observed)

| Symptom | Class | Status (2026-07-17) |
|---------|-------|---------------------|
| Slow Employees / Dashboard mount | Perf P0/P1 | **W1 FE CLOSED** — Employees table ≤1 paged list GET (`useEmployeesPage`); summary path remains FE-04; QC GWC `qc-p1-hrm-scale-w1-20260717.md` |
| List→profile detail×2 + multi-page list chains | Perf P1 | **CLOSED** — `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` (RQ `useEmployee` + restored `embedScopeKey`) |
| React duplicate-key console | Console **P0** | **CLOSED** (QA retest PASS) after BE `ORDER BY created_at DESC, id DESC` + FE dedupe defense |
| CC parent ×2 mount APIs | Noise P1 | Residual — portal `requestCoalescer` shipped; browser call-count QA may still be open |
| Satellite pickers still `listAllEmployees` | FE cost P2 | **CLOSED W2 FE picker** — insurance typeahead + company 0 dump + leave Select capped (`COND-SCALE-W2-PICKER`); **`D-HRM-ATT-NAV-STALL-01` CLOSED** (`COND-SCALE-W2-ATT-NAV`, QC `qc-d-hrm-att-nav-stall-01-20260717.md`); **insurance list fan-out CLOSED** (`COND-SCALE-W2-INS-LIST-FANOUT`, QC `qc-p1-hrm-scale-fe-w2-ins-list-20260717.md` @ `bf5067b`); residual: contracts list same class P2 |
| Employees DataTable full ~1100 DOM | FE cost P1 | **Mitigated W1** — server page UI (page_size=50); virtualization deferred if page stays ≤50 |

### 1.3 Constraints

- U65: zero-seed for acceptance; measure on live FE flows.
- Nest list DTO: `page_size` **@Max(100)** (`HRM_API_MAX_PAGE_SIZE = 100`).
- HRM embed runs inside portal iframe (`:8088` → HRM Vite); remount cost is a first-class NFR.
- Scope ladder (`resolveHrmListScope`) must stay identical for list / summary / get-by-id.
- Do not regress UF/J-HRM-* already 🟢 (esp. J-HRM-02 list→detail).

---

## 2. Problem statement

At pilot data scale (~1100 NV), the embed path still:

1. **Over-fetches** — `useEmployees` → `listAllEmployees` sequential pages (~11–12 HTTP) for any consumer that needs the full client collection.
2. **Over-renders** — `Employees.tsx` `DataTable` mounts ~1100 rows without virtualization.
3. **Splits caching models** — HRM app uses React Query on many hooks, but `useEmployees` is manual `useEffect` fetch (no shared cache / staleTime / in-flight dedupe). Portal (no RQ) uses `requestCoalescer` for CC mounts.
4. **Risks concurrency cliff** — 1000 concurrent users × 12 list pages + COUNT queries + OFFSET deep pages amplifies DB CPU, pool wait (`pg_pool_waiting_count`), and proxy latency far beyond single-user p95.

Failure if unresolved: sponsor UAT “slow / noisy console”, false PROD-ready claims, and inability to pass a concurrent-user gate.

---

## 3. As-is architecture (code truth)

### 3.1 FE

| Component | Behavior | Gap vs 1k scale |
|-----------|----------|-----------------|
| HRM `useEmployees` / `useEmployeePicker` | Pickers: capped page + keyword typeahead (`useEmployeePicker`); `listAllEmployees` export-only | ✅ **W2 FE picker CLOSED** — QC GWC `qc-p1-hrm-scale-w2-20260717.md`; ❌ insurance **list** mount may still multi-page (P2 residual) |
| HRM `useEmployeesPage` | RQ server page `page_size=50` | ✅ W1 CLOSED — T-FANOUT ≤1 |
| HRM `useEmployee` | RQ detail key `['employee-detail', id, companyId]` | ✅ W1 — profile in-flight dedupe |
| Portal `HrmWorkspaceRoute` | Stable iframe `key={embedScopeKey}` + postMessage soft nav | ✅ FE-01 restored in W1 (was regresssed to `key={target}`) |
| HRM `dedupeEmployeesById` | First-wins unique by `id` | ✅ Defense after OFFSET dup era |
| HRM QueryClient | Default `staleTime: 60_000` (App.tsx) | ✅ Wired for Employees page + detail (W1) |
| Portal `requestCoalescer` | In-flight (+ optional TTL) GET dedupe | ✅ Correct for portal; **not** a substitute for RQ inside HRM iframe |
| `Employees.tsx` | Server-paged DataTable (page UI) | ✅ W1 — no client merge of 1100 rows on mount |

### 3.2 BE

| Component | Behavior | Gap vs 1k scale |
|-----------|----------|-----------------|
| `listEmployees` | COUNT + SELECT `ORDER BY created_at DESC, id DESC` LIMIT/OFFSET | ✅ Stable pagination (dup-key P0 closed); ❌ OFFSET cost grows with page N; COUNT every page |
| `listEmployeeDirectory` | `ORDER BY full_name, employee_code, id` | Stable; directory path separate |
| `getEmployeesSummary` | 3 aggregate SQL under same scope filters | ✅ Replaces dashboard list storm |
| Indexes | `idx_employees_company_archived (company_id, archived_at, created_at DESC)` + `uq_employees_company_code` | ⚠️ Partial cover for list ORDER BY; rollup `company_id IN (...)` + `id` tie-breaker not indexed as covering composite |
| N+1 on list | List itself is single SELECT (no per-row joins); directory optional batch attendance `ANY($1::uuid[])` | ✅ No classic ORM N+1 on list; risk is **FE multi-page + COUNT×N** and satellite menus that still fan `listEmployees` per consumer |

### 3.3 What “1000 concurrent users” implies (ops)

| Layer | Minimum control | Owner |
|-------|-----------------|-------|
| PG pool | Sized for concurrent list+summary; alert on `pg_pool_waiting_count` | devops + platform-core |
| Rate limit | Redis / platform-core per-IP+user budgets without starving UAT | devops |
| Horizontal | hrm-api replicas + sticky-not-required (stateless JWT) | devops |
| Observability | `http_request_duration_seconds` p95 on `/api/hrm/employees` + `/summary` | devops |

---

## 4. Options evaluated

### Option A — FE-only polish (coalescer everywhere, keep `listAllEmployees`)

- **Description:** Extend portal coalescer into HRM; keep fetching all pages; maybe memoize DataTable.
- **Benefits:** Fast to ship; reduces StrictMode/double-mount noise.
- **Costs:** Does not cut bytes/DOM; concurrent users still multiply fan-out.
- **Risks:** False green on Network “deduped” while p95 list still >2s under load.

### Option B — Server-driven table + RQ pages + indexes + load proof (recommended)

- **Description:** Employees UI becomes **paged server table** (page_size 20–50); React Query owns page keys; keep `listAllEmployees` only for rare offline export/search-all with hard cap + progress; add covering indexes; DevOps k6/artillery gate for 1k concurrent.
- **Benefits:** Aligns FE payload with Nest cap; cuts HTTP × DOM; measurable concurrency path.
- **Costs:** UX change (server pagination / filter); FE+BE+ops waves.
- **Risks:** Pickers that need “all names” need typeahead API instead of full dump.

### Option C — Cursor pagination + virtualization + CQRS read models

- **Description:** Replace OFFSET with keyset cursors; windowed virtual list; optional read replica / materialized headcount.
- **Benefits:** Best asymptotic scale beyond 10k NV / deep scroll.
- **Costs:** Contract churn (OpenAPI cursor); larger BE+FE rewrite.
- **Risks:** Over-engineering for current ~1.1k NV if B not exhausted.

### Trade-off matrix

| Criteria | Weight | A | B | C |
|----------|-------:|:-:|:-:|:-:|
| Business value (sponsor 1k users) | 25 | 2 | **5** | 5 |
| Time to deliver (2–3 waves) | 20 | **5** | **4** | 2 |
| Complexity / blast radius | 15 | **5** | 3 | 1 |
| Reliability under concurrency | 20 | 2 | **5** | 5 |
| Maintainability | 10 | 3 | **4** | 3 |
| Security / scope parity | 10 | 4 | **5** | 4 |
| **Weighted (approx)** | | 3.3 | **4.5** | 3.5 |

### Decision

**Selected: Option B** (phased), with **Option C deferred** as W3+ stretch if B gates pass at 1k concurrent but fail at larger workforce.

**Rejected A alone:** coalescer ≠ capacity; does not meet p95 list or DOM budget.

**Assumptions:** Pilot stays ~1–3k NV near-term; primary UX is filter/search + page, not infinite client dump; portal iframe soft nav remains.

---

## 5. Target architecture (normative)

### 5.1 FE caching model — React Query vs coalescer

| Surface | SoT cache | Rule |
|---------|-----------|------|
| **HRM iframe app** (`apps/web/hrm`) | **TanStack React Query** | All list/summary reads use `useQuery` / `useInfiniteQuery` with stable keys (`['employees', scope, page, filters]`). Default `staleTime ≥ 60s` already set — **wire `useEmployees` into RQ or replace with paged hook**. |
| **Portal shell** (`apps/web/web-portal`) | **`requestCoalescer`** | Keep for CC/KPI/tenant GETs (no RQ dependency). TTL only on read-only families; invalidate after mutate. |
| **Boundary** | Do **not** dual-cache the same HRM list in portal + iframe | Portal must not re-fetch HRM employee pages for widgets already served by iframe `/employees/summary`. |

**API dedupe target (normative):**

- Same query key in-flight → **1** network flight (RQ or coalescer).
- Dashboard mount → **≤1** `/employees/summary` (already).
- Employees table mount → **≤1** `/employees?page=&page_size=` for visible page (no silent `listAllEmployees`).
- CC tab switch → **0** iframe document reloads (already FE-01).

### 5.2 List virtualization + page_size

| Rule | Value |
|------|-------|
| Default UI page_size | **30** (directory) / **50** max for dense tables — never auto-request 100×N in a loop for table paint |
| Nest hard cap | **100** (unchanged) |
| DOM | If client must hold >200 rows (exception export preview), use **window virtualization** (`@tanstack/react-virtual` or existing DataTable virtual prop if added) |
| Prefer | Server pagination + RQ `keepPreviousData` over client merge of 1100 rows |

### 5.3 Embed iframe cost

| Cost driver | Control |
|-------------|---------|
| Remount | `key` = tenant+company only; soft nav postMessage (keep FE-01) |
| First mount | Lazy route chunks for non-default HRM menus; defer non-visible widgets |
| Parent×child duplicate | Portal coalescer for shell; HRM owns domain GETs |
| Scope change | Single intentional remount |

### 5.4 BE — pagination stability, indexes, hot-path queries

| Control | Normative |
|---------|-----------|
| Stable ORDER BY | **Keep** `created_at DESC, id DESC` (list) and `full_name, employee_code, id` (directory) — never ORDER BY single non-unique column |
| COUNT strategy | W2: optional `estimate` or cache total for unfiltered scope; or return `total` only on page=1 when agreed in OpenAPI |
| Indexes (W2) | Add covering index aligned to list filter+sort, e.g. `(company_id, archived_at, created_at DESC, id DESC)` and directory `(company_id, archived_at, full_name, employee_code, id)` — exact DDL in BE evidence |
| N+1 | Forbid per-row queries in list mappers; batch satellite (`ANY(uuid[])`) only; prefer join/CTE for summary |
| Cursor (W3 stretch) | `after_id` / `after_created_at` keyset if OFFSET p95 fails under load |

### 5.5 Measurable targets (gate)

| ID | Metric | Target | Measure |
|----|--------|--------|---------|
| **T-P95-LIST** | p95 `GET /api/hrm/employees` (page_size≤50, warm) | **< 2s** | Browser Network + Prometheus `http_request_duration_seconds` |
| **T-P95-SUM** | p95 `GET /api/hrm/employees/summary` | **< 1s** | Same |
| **T-CONSOLE-P0** | React duplicate-key / uncaught error on Employees | **0** | Browser console audit (U65) |
| **T-DEDUPE** | In-flight identical GETs collapsed | **≥1:1** (no 2× same URL parallel) | Network waterfall |
| **T-FANOUT** | Employees table initial load HTTP to `/employees` | **≤ 2** (1 list + optional count/summary) | Network |
| **T-CONC** | 1000 concurrent users sustained 5 min (login+HRM list page) | error rate **< 1%**; list p95 still **< 2s** | DevOps load script evidence |

---

## 6. Phased roadmap W1–W3

### W1 — Close residual fan-out + console hygiene (execution)

| work_item_id (suggested) | Owner | Scope | Exit | Status 2026-07-17 |
|--------------------------|-------|-------|------|-------------------|
| `P1-HRM-SCALE-FE-W1` | **dev-fe** | Replace Employees table path: RQ paged `useEmployeesPage` (no `listAllEmployees` on mount); keep `dedupeEmployeesById` defense; restore `embedScopeKey` soft nav; RQ detail `useEmployee` | Network: ≤1 list GET per page change; console P0=0; vitest on query keys | **CLOSED** — FE + deploy + QA + QC GWC |
| `P1-HRM-SCALE-BE-W1` | **dev-be** | Spot-check list SQL EXPLAIN on rollup scope; document/add missing composite index if seq scan; ensure COUNT+ORDER use index; OpenAPI note page_size guidance | EXPLAIN evidence; jest stable ORDER BY still PASS | Parallel lane (`p1-hrm-scale-be-w1-20260717.md`) — **not** folded into FE QC verdict |
| `P1-HRM-SCALE-QA-W1` | **qa** | Browser `:8088` ceo@xe.vn — Employees; assert T-FANOUT, T-CONSOLE-P0, T-DEDUPE, J-HRM-02 | Evidence md + screenshots | **CLOSED** — `p1-hrm-scale-qa-w1-20260717.md` PASS_TO_PM |
| `P1-HRM-SCALE-QC-W1` | **qc** | Gate Scale FE W1 only; W2 residuals as conditions | GO / GWC; NOT Phase 1 / NOT PROD | **CLOSED** — **GO WITH CONDITIONS** `qc-p1-hrm-scale-w1-20260717.md` |

**Entry:** This ADR Accepted; L0 `qc:fe-be-health` PASS.  
**Defer to W1 end:** Full 1000-VU load (W3).  
**W1 FE exit met:** T-FANOUT Employees table ≤1; profile dedupe CLOSED; iframe `_v` stable; J-HRM-02 PASS.

### W2 — Capacity hardening (API + pool)

| work_item_id | Owner | Scope | Exit | Status 2026-07-17 |
|--------------|-------|-------|------|-------------------|
| `P1-HRM-SCALE-BE-W2` | **dev-be** | Indexes migrated; reduce double-COUNT if needed; typeahead/search endpoint for pickers still using full dump (`keyword` + limit) | Migration + EXPLAIN; picker consumers switched off `listAllEmployees` where possible | Parallel lane — **OPEN** (not folded into FE picker QC) |
| `P1-HRM-SCALE-FE-W2` | **dev-fe** | Migrate remaining `listAllEmployees` call sites (insurance/decisions pickers → search or capped pages); settings-catalogs RQ unify if still open (FE-03) | Grep `listAllEmployees` = export-only or zero | **PICKER CLOSED** — FE + deploy `5d27676` + QA + **QC GWC** `qc-p1-hrm-scale-w2-20260717.md`; `COND-SCALE-W2-PICKER` **CLOSED** |
| `P1-HRM-SCALE-QA-W2` | **qa** | Browser `:8088` — insurance/company/leave picker Network + J-HRM-02 regression | Evidence md + screenshots | **CLOSED** — `p1-hrm-scale-qa-w2-20260717.md` PASS_TO_PM |
| `P1-HRM-SCALE-QC-W2` | **qc** | Gate Scale FE W2 picker only; residual att-nav + list fan-out as conditions | GO / GWC; NOT Phase 1 / NOT PROD | **CLOSED** — **GO WITH CONDITIONS** `qc-p1-hrm-scale-w2-20260717.md` |
| `P1-HRM-SCALE-DO-W2` | **devops** | Tune hrm-api PG pool + rate-limit for pilot; metrics dashboards for list/summary p95; document in `PRODUCTION_ENABLE_RUNBOOK` delta | `pg_pool_waiting_count` under synthetic 100 VU smoke | **OPEN** |
| `D-HRM-ATT-NAV-STALL-01` | **dev-fe** → **qc** | Soft-nav out of Attendance stalls (found in W2 QA cross-nav) | Soft-nav leave Attendance renders target view; `_v` stable | **CLOSED** — `COND-SCALE-W2-ATT-NAV` closed by QC `qc-d-hrm-att-nav-stall-01-20260717.md` @ HEAD `96651c7` (ENV Vite repair + QA retest PASS; does **not** reopen W1 profile CLOSED) |
| `P1-HRM-SCALE-FE-W2-INS-LIST` | **dev-fe** → **devops** → **qa** → **qc** | Insurance **list** mount fan-out (page=1..11) → cap page=1 + honest total + explicit «Tải thêm» | Mount ≤1–2 list GETs; 0 auto page≥2; +1 page=2 on load-more; W2 picker / ATT-NAV / J-HRM-02 regression green | **CLOSED** — `COND-SCALE-W2-INS-LIST-FANOUT` closed by QC `qc-p1-hrm-scale-fe-w2-ins-list-20260717.md` @ HEAD `bf5067b`; residual: contracts list same class P2 |

**W2 FE picker exit met:** Insurance ≤1+keyword; company 0 mount dump; leave Select capped; J-HRM-02 PASS. **ATT-NAV exit met:** soft-nav leave Attendance ×2 + J-HRM-02 @ `96651c7`. **INS-LIST exit met:** mount 1× page=1 + honest total 1043 + «Tải thêm» +1 page=2 @ `bf5067b` — `COND-SCALE-W2-INS-LIST-FANOUT` **CLOSED** (QC `qc-p1-hrm-scale-fe-w2-ins-list-20260717.md`). **Residual:** contracts list fan-out P2 (same class); T-CONC → W3.

### W3 — Concurrent-user proof + stretch

| work_item_id | Owner | Scope | Exit | Status 2026-07-17 |
|--------------|-------|-------|------|-------------------|
| `P1-HRM-SCALE-W3-T-CONC` | **devops** | Load test **1000 concurrent** (staged ramp); capture p95/error budget vs T-CONC / T-P95-LIST | Evidence under `docs/qa/evidence/` or `docs/ops/evidence/` | **GWC met (RERUN4)** — VPS-local LB **1000 VU** PASS (0% err, list p95 **1481 ms**, 45s holds); full 5min endurance still **COND-SCALE-W3-HOLD-5MIN** |
| `P1-HRM-SCALE-DO-W2` | **devops** | Tune pool/replica/runtime bottleneck identified by W3 probe; `pg_pool_waiting_count` visibility | Pool evidence + re-probe entry | **CLOSED** (pool=40; ceiling 50->200 VU) — condition for T-CONC re-run |
| `P1-HRM-SCALE-BE-W2` | **dev-be** | Covering indexes + query-count pressure reduction on list hot path | Migration/EXPLAIN + regression evidence | **CLOSED** (`0016` applied; git 2a7a02b) — condition for T-CONC re-run |
| `P1-HRM-SCALE-DO-W3-REPLICA` | **devops** | Rate-limit budget tuning + horizontal HRM-BE replicas behind nginx upstream (re-run 429 cliff @400 VU) | Re-probe 400->1000 VU + pool/429 visibility | **PARTIAL CLOSED** — rate-limit **120000**/min; `COND-SCALE-W3-RATE-LIMIT-400` **CLOSED**; timeout residual cleared by DO-W4 VPS-local |
| `P1-HRM-SCALE-DO-W4-REPLICA` | **devops** | ≥2 hrm-be + `hrm-api-lb` least_conn `:3101`; pool 20+20; `node dist/main`; T-CONC via LB | Re-probe 400→1000 via LB | **CLOSED** — topology LIVE; VPS-local **400/600/800/1000 PASS**; `t_conc_met=true`; `COND-SCALE-W3-TIMEOUT-600` **CLOSED** (QC RERUN4) |
| `P1-HRM-SCALE-DO-W5-PG-HEADROOM` | **devops** | Measure/raise Postgres headroom under 600 VU cliff; re-probe via LB; **no 4× replicas before PG proof** | PG evidence + re-probe 400→1000 | **SUPERSEDED** — timeout@600 cleared on VPS-local SoT; reopen only if 5min hold FAIL or PG saturation proven |
| `P1-HRM-SCALE-BE-W3` | **dev-be** | **Only if** T-P95-LIST still fails: keyset cursor pagination (Option C slice) | OpenAPI + ADR amend | **DEFERRED** — list p95 **PASS** (&lt;2s) @1000; optional **T-P95-SUM** residual @1000 (1183 ms) |
| `P1-HRM-SCALE-QA-W3` | **qa** | Retest UF/J-HRM-* regression + console P0=0 after any BE cursor change | PASS_TO_PM | **NOT RUN** for W3 T-CONC probe; no UF promoted |
| `P1-HRM-SCALE-QC-W3` | **qc** | Gate GO/GWC/NO-GO on T-* evidence pack | Go/No-Go | **GO WITH CONDITIONS** — **RERUN4** `qc-p1-hrm-scale-w3-rerun4-20260717.md` (VPS-local 1000 VU PASS; RERUN3 WAN NO-GO **superseded**; conditions: 45s vs 5min hold + T-P95-SUM 1183 ms); **NOT** Phase 1 / **NOT** PROD |

**W3 QC status (RERUN4):** T-CONC = **GO WITH CONDITIONS**. Capacity SoT = **VPS-local** `127.0.0.1:3101` only — **WAN Windows→:3101 is not capacity SoT** (RERUN3 console noise superseded). Proven: **1000 VU**, error **0%**, list p95 **1481 ms &lt;2s**, stages 400→1000 all PASS under **45s** holds. `COND-SCALE-W3-TIMEOUT-600` **CLOSED**. Residuals: `COND-SCALE-W3-HOLD-5MIN` (optional 5min re-probe); `COND-SCALE-W3-T-P95-SUM-1000` (summary p95 **1183 ms**). DO-W5 PG headroom **SUPERSEDED**. Read-only NFR — **no** UF promote; **not** Phase 1 / **not** PROD.

---

## 7. Failure modes and mitigation

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| FE still calls `listAllEmployees` from table | Grep + Network | W1 FE exit blocks QA PASS |
| OFFSET deep page slow | Prometheus p95 by `page` label (add if missing) | W2 index; W3 cursor |
| Pool exhaustion at 1k VU | `pg_pool_waiting_count` | devops pool + replicas; BE reduce COUNT |
| Coalescer TTL serves stale post-mutate | Bug report after approve | TTL=0 default; invalidate prefix |
| Scope parity break on summary vs list | Persona probe member CEO | Existing scope jest + QA matrix |
| Virtualization breaks row actions | QA click path | Feature-flag virtual; keep page_size 30 first |

---

## 8. Implementation and validation plan

### Rollout

1. Governance: **this ADR** (done).
2. W1 FE+BE parallel → QA browser gates T-FANOUT / T-CONSOLE-P0 / T-DEDUPE.
3. W2 indexes + eliminate remaining full dumps → devops pool smoke.
4. W3 1000-VU proof → QC gate.

### Rollback

- Feature-flag server-paged Employees UI; revert to prior hook only if J-HRM-02 regresses.
- Index migrations use `IF NOT EXISTS` / concurrent create where supported; droppable if planner regresses.

### Validation checkpoints

| Gate | Command / artifact |
|------|-------------------|
| L0 | `pnpm run qc:fe-be-health` |
| Unit | hrm-api list ORDER BY specs; HRM vitest pageSize/dedupe/RQ keys |
| L2.5 | J-HRM-02 list→detail; dashboard summary single call |
| NFR | T-P95-LIST / T-CONC evidence paths above |

### Success criteria (program)

- Console **P0 = 0** on Employees (already closed; must stay closed).
- Employees mount **not** ~12 sequential list calls.
- List p95 **< 2s** warm at pilot data scale.
- DevOps evidence for **1000 concurrent** within error budget **or** explicit GWC with capacity number actually proven.

---

## 9. Out of scope (this ADR)

- Changing SRS business UC beyond NFR/AC pointers (BA promote T-* into SRS NFR § only if PM requests delta).
- Replacing Nest `@Max(100)`.
- Mobile directory FlatList (already NFR-W7 pagination ≤50) — align later, do not block web W1.
- Seed / fidelity density scripts (U65).

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` |
| **next_owner** | **pm** → dispatch `dev-fe` + `dev-be` W1 |
| **completion_report** | ADR Accepted: Option B; FE RQ-vs-coalescer boundary; virtualization/page_size rules; BE stable ORDER BY + index plan; T-* targets; W1–W3 owners. Residual: execution not started; 1000-VU unproven. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: P1-HRM-SCALE-FE-W1
from_role: pm
to_role: dev-fe
entry_criteria: ADR docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md Accepted; L0 qc:fe-be-health PASS; U65 zero-seed
read_first: ADR §5–6; docs/qa/evidence/cd-fb-03-hrm-perf-audit-20260620.md; apps/web/hrm/src/hooks/useEmployees.ts; useEmployeesSummary.ts; Employees.tsx
spec_ref: ADR-HRM-SCALE-1000-USERS-20260717 §5.1–5.2; SRS AC-INT-SCOPE-G-01; matrix employees row page_size=100
exit_criteria: Employees table uses React Query server page (no listAllEmployees on mount); T-FANOUT ≤1 list GET per page; console P0=0 preserved; vitest keys/pageSize; READY_FOR_QA
evidence_path: docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md
ack_status: READY_FOR_QA
cấm: seed; do not remount iframe key; do not regress J-HRM-02

PARALLEL:
work_item_id: P1-HRM-SCALE-BE-W1
from_role: pm
to_role: dev-be
entry_criteria: same ADR §5.4; keep ORDER BY created_at DESC, id DESC
exit_criteria: EXPLAIN on group CEO list; add covering index if needed (migration); jest ORDER BY specs still PASS; READY_FOR_QA
evidence_path: docs/qa/evidence/p1-hrm-scale-be-w1-20260717.md
ack_status: READY_FOR_QA
```

---

## 11. Traceability

| Requirement / evidence | ADR section |
|------------------------|-------------|
| Sponsor ≥1000 concurrent users | §1.1 NFR-CONC-1k, §5.5 T-CONC, §6 W3 |
| Matrix / SRS ≥1000 NV | §1.1 NFR-DATA-1k |
| CD-FB-03 / PERF FE-01..04 / BE-01 | §1.2, §3 |
| Console dup-key closed 2026-07-16 | §1.2, §5.5 T-CONSOLE-P0 |
| requestCoalescer | §3.1, §5.1 |
| useEmployees pagination/dedupe | §3.1, §5.2, W1 |
| employees.service ORDER BY fix | §3.2, §5.4 |
