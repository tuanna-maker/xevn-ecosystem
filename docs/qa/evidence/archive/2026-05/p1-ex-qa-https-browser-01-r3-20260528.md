# P1-EX-QA-HTTPS-BROWSER-01-R3 — Browser L2.5 HTTPS pilot (C-HTTPSQC-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-QA-HTTPS-BROWSER-01-R3` |
| **prior** | [R2 FAIL](p1-ex-qa-https-browser-01-r2-20260528.md) |
| **fixes under test** | [FE JWT embed](p1-ex-fe-https-jwt-embed-01-20260528.md) · `P1-EX-DO-DEPLOY-PORTAL-HTTPS-01` (portal+hrm redeploy) |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | `2026-05-28` |
| **base_url** | `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **qc_ref** | `C-HTTPSQC-01` (browser L2.5) |
| **api_baseline** | `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — **J-HRM 7/7 PASS** (Bearer); browser **0/7** |
| **ack_status** | **FAIL_TO_PM** |
| **ready_for_qc** | **No** — iframe HRM **401** + Sync ERROR; no list→detail |

---

## Executive verdict

| Layer / criterion | R2 | R3 (this run) | Notes |
|-------------------|-----|---------------|-------|
| **L0** perimeter | PASS | **PASS** | `hrm=200 portal=200 hr=200` |
| **Login → CC** | PASS | **PASS** | `/login` → `/command-center` |
| **Vite / `/hr/` block** | PASS | **PASS** | iframe mounts on all routes |
| **`companyId=main` in embed** | **FAIL** (`xevn`) | **PASS** 6/6 | Deploy/identityScope **verified** |
| **L2** `P-CC-03..08` (functional) | FAIL 0/6 | **FAIL** 0/6 | Sync ERROR + iframe `/api/hrm/*` **401**; **0 rows** |
| **L2.5** `J-HRM-01..07` | FAIL 0/7 | **FAIL** 0/7 | No navigable rows / links |
| **L2.5** `J-CC-03` | FAIL | **FAIL** | `kpi-engine/rollup` **409** (out of FE-JWT scope) |

**Delta vs R2:** `companyId=main` **closed** on all HRM embed routes. **C-HTTPSQC-01 still open:** browser session does not carry JWT into iframe (`xevn.portal.accessToken` in parent **sessionStorage** only; **not** mirrored to `localStorage`; iframe `catalog-sync` **401**).

**Rule:** API probe J-HRM 7/7 **does not** close browser gate.

---

## Prerequisite / deploy traceability

| Artifact | Status |
|----------|--------|
| `docs/ops/evidence/p1-ex-do-deploy-portal-https-01-20260528.md` | **Missing** on disk — bus shows `P1-EX-DO-DEPLOY-PORTAL-HTTPS-01` **DISPATCHED**, no `PASS_TO_PM` entry before QA R3 |
| `docs/qa/evidence/p1-ex-fe-https-jwt-embed-01-20260528.md` | Read — **READY_FOR_QA** |
| L0 smoke (this run) | **PASS** — stack reachable |

**Inference:** Partial deploy effect (`companyId=main`) without full JWT-bridge bundle on running **portal-fe** / **hrm-fe**, or mirror/postMessage not executing in production build.

---

## Runtime traceability

| Step | Tool | Result |
|------|------|--------|
| 1 | PowerShell L0 curls | `hrm=200 portal=200 hr=200` |
| 2 | Browser MCP login | **PASS** |
| 3 | CDP per-route `P-CC-03..08` | 6/6 `companyId=main`; 6/6 Sync ERROR; iframe `catalog-sync` **401** |
| 4 | CDP session storage audit | Parent `sessionStorage['xevn.portal.accessToken']` **present**; parent/iframe `localStorage` **no** access token key |
| 5 | Click **Kiểm tra lại** (contracts) | Clicked; session still **401** (navigated before re-probe completed) |
| 6 | `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | L2.5 API **7/7 PASS**; `J-CC-03` **409**; `P-CC-01-jwt` FAIL (43200≠86400) |
| 7 | Screenshots | `page-2026-05-28T01-19-19-438Z.png` (employees iframe **502** transient); contracts/payroll via CDP |

---

## L0 — HTTPS health

| Probe | HTTP | Verdict |
|-------|-----:|---------|
| `/api/hrm/` | 200 | **PASS** |
| `/` (portal) | 200 | **PASS** |
| `/hr/employees?portal=1` | 200 | **PASS** |

---

## L2 — P-CC-03..08 (browser embed)

Method: `ceo@xe.vn` login → direct navigate each portal HRM route → wait 6s → CDP read iframe `src`, `body`, iframe `fetch('/api/hrm/catalog-sync/status')`.

| ID | Portal route | iframe `companyId` | Vite/502 | Sync banner | iframe `catalog-sync` | List rows | Browser L2 |
|----|--------------|-------------------|----------|-------------|----------------------|-----------|------------|
| P-CC-03 | `/command-center/hrm/employees` | **main** | No (502 seen once early) | **Yes** | **401** | 0 / loading | **FAIL** |
| P-CC-04 | `/command-center/hrm/contracts` | **main** | No | **Yes** | **401** | `Hiển thị 0 - 0 trong số 0` | **FAIL** |
| P-CC-05 | `/command-center/hrm/insurance` | **main** | No | **Yes** | **401** | `0 - 0 trong số 0` | **FAIL** |
| P-CC-06 | `/command-center/hrm/recruitment` | **main** | No | **Yes** | **401** | Sync ERROR (dashboard) | **FAIL** |
| P-CC-07 | `/command-center/hrm/attendance` | **main** | No | **Yes** | **401** | Sync ERROR | **FAIL** |
| P-CC-08 | `/command-center/hrm/payroll` | **main** | No | **Yes** | **401** | Sync ERROR | **FAIL** |

**Sample iframe `src` (all routes — improved vs R2):**

```text
https://14-225-217-232.nip.io/hr/contracts?portal=1&tenantId=xevn&companyId=main
```

**iframe excerpt (contracts):**

```text
HRM API SyncERROR
Phiên đăng nhập không hợp lệ hoặc đã hết hạn.
Kiểm tra lại
… Hiển thị 0 - 0 trong số 0 bản ghi
```

**Session bridge audit:**

| Location | `xevn.portal.accessToken` |
|----------|---------------------------|
| Parent `sessionStorage` | **Yes** |
| Parent `localStorage` | **No** |
| iframe `localStorage` | **No** (only `hrm_current_*` keys) |
| iframe `fetch /api/hrm/catalog-sync/status` | **401** `HRM-AUTH-001` |

---

## L2.5 — J-* (browser)

| J-ID | P-CC | Click path | Result | Evidence |
|------|------|------------|--------|----------|
| J-HRM-01 | P-CC-04 | Contracts → employee name → profile | **FAIL** | 0 rows; Sync ERROR; no link |
| J-HRM-02 | P-CC-03 | Employees → profile | **FAIL** | Sync ERROR; no rows |
| J-HRM-03 | P-CC-04 | Contract detail/drawer | **FAIL** | 0 rows |
| J-HRM-04 | P-CC-05 | Insurance → employee link | **FAIL** | 0 rows |
| J-HRM-05 | P-CC-06 | Recruitment → detail | **FAIL** | Sync ERROR |
| J-HRM-06 | P-CC-07 | Attendance → detail | **FAIL** | Sync ERROR |
| J-HRM-07 | P-CC-08 | Payroll → payslip | **FAIL** | Sync ERROR |
| J-CC-03 | CC dashboard | KPI rollup | **FAIL** | `GET /api/xbos/kpi-engine/rollup` **409** ×2 |

**API contrast (same pilot, probe script):** `J-HRM-01..07` **PASS** with Bearer — confirms **browser JWT/embed gap**, not missing seed (contracts/insurance totals available to API).

---

## Console / network (browser session)

| Observation | Verdict |
|-------------|---------|
| Vite `allowedHosts` / `hrm-fe` block | **Not seen** |
| iframe `/api/hrm/catalog-sync` | **401** (all sampled routes) |
| Parent `/api/xbos/auth/me` | **200** (login session valid for XBOS) |
| `companyId=main` in iframe URL | **PASS** (6/6) |
| `kpi-engine/rollup` | **409** |
| Transient iframe **502** (employees, early) | **WARN** — retest showed normal HRM shell + 401 |
| `54321` / Supabase | Not seen |
| CC date `01/01/1970` | Still present (P2) |

---

## Root cause & dispatch

| Priority | Issue | Owner | Fix direction |
|----------|-------|-------|----------------|
| **P0** | JWT bridge not active on pilot build — token stays parent **sessionStorage**; iframe calls **401** | **devops** + **dev-fe** | Rebuild/redeploy **portal-fe** + **hrm-fe** with `P1-EX-FE-HTTPS-JWT-EMBED-01`; verify `localStorage` mirror + postMessage in prod bundle; publish `p1-ex-do-deploy-portal-https-01` evidence |
| **P0** | Functional L2 **0/6** — Sync ERROR, 0 rows | **dev-fe** | Blocked on P0 JWT; retest R4 after deploy |
| **P1** | J-CC-03 KPI **409** | **dev-fe** | Rollup `companyId=holding` vs `main` (separate from JWT item) |
| **P2** | CC date `01/01/1970` | **dev-fe** / **dev-be** | After session fix |
| **P2** | `P-CC-01-jwt` probe (43200 vs 86400) | **dev-be** | API-only; not browser blocker |

**Closed this run (vs R2):** embed `companyId=main` on all `P-CC-03..08`.

**pm_dispatch_hint:** `devops` — complete `P1-EX-DO-DEPLOY-PORTAL-HTTPS-01` with evidence file; confirm FE bundle hash includes jwt bridge. `dev-fe` — verify `persistAuthSession` writes `xevn.portal.accessToken` to **localStorage** on pilot. Retest `P1-EX-QA-HTTPS-BROWSER-01-R4`.

---

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-BROWSER-01-R3
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-browser-01-r3-20260528.md
entry_criteria: FE JWT embed READY_FOR_QA + portal/hrm deploy dispatched
exit_criteria: P-CC-03..08 L2 PASS; J-HRM-01..07 click PASS; no Sync ERROR; companyId=main; /api/hrm/* 200 in iframe
summary: companyId=main fixed 6/6; JWT bridge still FAIL — iframe catalog-sync 401, Sync ERROR, 0 rows, J-HRM 0/7 browser; API 7/7 PASS.
pm_dispatch_hint: devops finish portal-fe/hrm-fe deploy with jwt bundle evidence; dev-fe localStorage mirror; R4 browser retest
residual_auto_fix: true
```

---

## Comparison table (R1 → R2 → R3)

| Check | R1 | R2 | R3 |
|-------|----|----|-----|
| Vite block | FAIL | PASS | PASS |
| `companyId` | xevn | xevn | **main** |
| iframe HRM API | 401 | 401 | **401** |
| L2 functional | 0/6 | 0/6 | **0/6** |
| J-HRM browser | 0/7 | 0/7 | **0/7** |
| J-HRM API probe | 7/7 | 7/7 | **7/7** |
