# P1-EX-QA-HTTPS-BROWSER-01-R2 — Browser L2.5 HTTPS pilot (C-HTTPSQC-01 retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-QA-HTTPS-BROWSER-01-R2` |
| **prior** | `P1-EX-QA-HTTPS-BROWSER-01` — [FAIL](p1-ex-qa-https-browser-01-20260528.md) |
| **fixes under test** | [FE allowedHosts](p1-ex-fe-https-allowed-hosts-01-20260528.md) · [DO nginx `/hr/`](../../ops/evidence/p1-ex-do-nginx-hr-host-01-20260528.md) |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | `2026-05-28` |
| **base_url** | `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **qc_ref** | `C-HTTPSQC-01` (browser L2.5) |
| **api_baseline** | `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — **J-HRM 7/7 PASS** (Bearer); browser path **0/7** |
| **ack_status** | **FAIL_TO_PM** |
| **ready_for_qc** | **No** — HRM embed session/scope; J-* not executable |

---

## Executive verdict

| Layer / criterion | R1 (prior) | R2 (this run) | Notes |
|-------------------|------------|---------------|-------|
| **L0** perimeter | PASS | **PASS** | `hrm=200 portal=200 hr-employees=200` |
| **Login → CC** | PASS | **PASS** | `/login` → `/command-center` |
| **Vite `allowedHosts` / `/hr/` 403** | **FAIL** (blocked) | **PASS** | iframe mounts; no “host hrm-fe not allowed” |
| **L2** `P-CC-03..08` (functional) | FAIL 0/6 | **FAIL** 0/6 | **HRM API Sync ERROR** + iframe `/api/hrm/*` **401**; `companyId=xevn` |
| **L2.5** `J-HRM-01..07` | FAIL 0/7 | **FAIL** 0/7 | `Hiển thị 0 - 0` — no list→detail clicks |
| **L2.5** `J-CC-03` | FAIL | **FAIL** | `kpi-engine/rollup` **409**; `kpi_sparkline_snapshots/items` **409** |

**Delta vs R1:** Perimeter/nginx + hrm-fe **allowedHosts** fix **verified** — embed shell loads. **C-HTTPSQC-01** still **open**: browser user path lacks HRM JWT parity and `companyId=main` in iframe URL; KPI rollup **409** on CC load.

**Rule:** API probe J-HRM 7/7 **does not** close browser gate.

---

## Runtime traceability

| Step | Tool | Result |
|------|------|--------|
| 1 | PowerShell `Invoke-WebRequest` L0 | `hrm=200 portal=200 hr=200` |
| 2 | Browser MCP login `ceo@xe.vn` | CC **PASS** |
| 3 | CDP iframe `contentDocument` on P-CC-03..08 | No Vite block; **Sync ERROR** + **401** |
| 4 | `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | L2.5 API **7/7 PASS**; `J-CC-03` **409** |
| 5 | Screenshots | `page-2026-05-28T00-26-11-598Z.png` (CC shell); `page-2026-05-28T00-28-53-782Z.png` |

---

## L0 — HTTPS health

| Probe | HTTP | Verdict |
|-------|-----:|---------|
| `/api/hrm/` | 200 | **PASS** |
| `/` (portal) | 200 | **PASS** |
| `/hr/employees?portal=1` | 200 | **PASS** (no Vite 403) |

---

## L2 — P-CC-03..08 (browser embed)

Method: `ceo@xe.vn` → portal route → CDP read iframe `src` + `body.innerText` + iframe `performance` API entries.

| ID | Portal route | iframe `companyId` | Vite block | Sync banner | List rows | Browser L2 |
|----|--------------|-------------------|------------|-------------|-----------|------------|
| P-CC-03 | `/command-center/hrm/employees` | **xevn** | **No** | **Yes** | 0 | **FAIL** |
| P-CC-04 | `/command-center/hrm/contracts` | **xevn** | **No** | **Yes** | 0 (`Hiển thị 0 - 0`) | **FAIL** |
| P-CC-05 | `/command-center/hrm/insurance` | **xevn** | **No** | **Yes** | Không có dữ liệu | **FAIL** |
| P-CC-06 | `/command-center/hrm/recruitment` | **xevn** | **No** | **Yes** | — | **FAIL** |
| P-CC-07 | `/command-center/hrm/attendance` | **xevn** | **No** | **Yes** | — | **FAIL** |
| P-CC-08 | `/command-center/hrm/payroll` | **xevn** | **No** | **Yes** | — | **FAIL** |

**Sample iframe `src` (all routes):**

```text
https://14-225-217-232.nip.io/hr/contracts?portal=1&tenantId=xevn&companyId=xevn
```

**Expected (FE handoff):** `companyId=main` per `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`.

**iframe excerpt (contracts):**

```text
HRM API SyncERROR
Phiên đăng nhập không hợp lệ hoặc đã hết hạn.
Kiểm tra lại
… Hiển thị 0 - 0 trong số 0 …
```

**“Kiểm tra lại” clicked:** Sync ERROR persists; rows remain 0.

---

## L2.5 — J-* (browser)

| J-ID | P-CC | Click path | Result | Evidence |
|------|------|------------|--------|----------|
| J-HRM-01 | P-CC-04 | Contracts → employee name → profile | **FAIL** | 0 rows; Sync ERROR; no navigable link |
| J-HRM-02 | P-CC-03 | Employees → profile | **FAIL** | 0 rows |
| J-HRM-03 | P-CC-04 | Contract detail/drawer | **FAIL** | 0 rows |
| J-HRM-04 | P-CC-05 | Insurance → employee link | **FAIL** | Không có dữ liệu |
| J-HRM-05 | P-CC-06 | Recruitment → detail | **FAIL** | Sync ERROR |
| J-HRM-06 | P-CC-07 | Attendance → detail | **FAIL** | Sync ERROR |
| J-HRM-07 | P-CC-08 | Payroll → payslip | **FAIL** | Sync ERROR |
| J-CC-03 | CC dashboard | KPI rollup load | **FAIL** | `GET /api/xbos/kpi-engine/rollup` **409**; `business-master/kpi_sparkline_snapshots/items` **409** |

**API contrast (same pilot, probe script):** `J-HRM-01..07` **PASS** with Bearer + headers — confirms **browser JWT/embed gap**, not seed absence.

---

## Console / network (browser session)

| Observation | Verdict |
|-------------|---------|
| Vite `allowedHosts` / `hrm-fe` block | **Not seen** (fix **PASS**) |
| iframe `/api/hrm/catalog-sync` | **401** |
| iframe `/api/hrm/settings-catalogs` | **401** (×4) |
| Parent `/api/xbos/auth/me` | **200** |
| `kpi-engine/rollup` | **409** |
| `54321` / Supabase | Not seen |
| CC banner `01/01/1970` | Still present (P2) |

---

## Root cause & dispatch

| Priority | Issue | Owner | Fix direction |
|----------|-------|-------|----------------|
| **P0** | Portal embed still `companyId=xevn`; **identityScope** not on running `portal-fe` | **devops** + **dev-fe** | Recreate **portal-fe** with `identityScope.ts` + paths deploy; verify iframe `src` has `companyId=main` |
| **P0** | HRM iframe **401** / Sync ERROR while parent auth **200** | **dev-fe** | JWT postMessage / portal→hrm session bridge on HTTPS pilot |
| **P1** | J-CC-03 KPI **409** (`companyId=holding` vs `main`) | **dev-fe** | Align rollup query with group CEO scope (same as localhost fix) |
| **P2** | CC date `01/01/1970` | **dev-fe** / **dev-be** | After session fix |

**Closed this run:** `P1-EX-DO-NGINX-HR-HOST-01` / Vite perimeter — **C-HTTPSQC-07** evidence aligns ( `/hr/` **200** ).

**pm_dispatch_hint:** `devops` restart **portal-fe** (+ sync FE bundle); `dev-fe` HRM embed JWT + `companyId=main`; retest `P1-EX-QA-HTTPS-BROWSER-01-R3`.

---

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-BROWSER-01-R2
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-browser-01-r2-20260528.md
entry_criteria: FE allowedHosts + DO nginx /hr/ PASS evidence
exit_criteria: P-CC-03..08 functional L2; J-HRM-01..07 click PASS; no Sync ERROR; companyId=main
summary: Vite/host block cleared (6/6 embed mount); functional L2/L2.5 still FAIL — iframe 401 Sync ERROR, companyId=xevn, 0 rows, J-CC-03 409.
pm_dispatch_hint: devops portal-fe redeploy + dev-fe embed JWT/companyId=main; R3 browser retest
residual_auto_fix: true
```

---

## ack_status

**FAIL_TO_PM**
