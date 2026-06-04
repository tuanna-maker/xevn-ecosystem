# P1-EX-QA-HTTPS-BROWSER-01 — Browser L2.5 HTTPS pilot (C-HTTPSQC-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-QA-HTTPS-BROWSER-01` |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **date** | `2026-05-28` |
| **owner** | `qa` |
| **base_url** | `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **qc_ref** | `C-HTTPSQC-01` — browser L2.5 (not API-only) |
| **api_baseline** | `docs/qa/evidence/p1-ex-qa-https-01-r10-20260527.md` (**PASS** API 7/7) |
| **ack_status** | **FAIL_TO_PM** |
| **ready_for_qc** | **No** — HRM embed unusable in browser |

---

## Executive verdict

| Layer / criterion | Result | Notes |
|-------------------|--------|-------|
| **Browser MCP** | **Available** | `cursor-ide-browser` — login + CDP iframe inspection |
| **Login → Command Center** | **PASS** | `/login` → `/command-center` |
| **L0** perimeter | **PASS** | `/api/hrm/` **200**, portal `/` **200** |
| **L2** `P-CC-03..08` (browser embed) | **FAIL** 0/6 | HRM iframe **Vite `allowedHosts`** blocks host `hrm-fe` on every sampled route |
| **L2.5** `J-HRM-01..07` | **FAIL** 0/7 | No list rows; cannot execute list→detail click paths |
| **L2.5** `J-CC-03` (CC load) | **FAIL** | `kpi-engine/rollup` + `kpi_sparkline_snapshots` **409** in browser resource log |
| **409 on HRM embed load** | **N/A** | Embed never mounts — no HRM list API calls from iframe |

**Rule:** L2 PASS (API-only R10) **≠** browser L2.5 PASS. **FAIL_TO_PM** — dispatch **dev-fe** (+ **devops** nginx `/hr/` Host) per `pm_dispatch_hint`.

---

## Runtime traceability

| Step | Tool / command | Result |
|------|----------------|--------|
| 1 | Browser MCP `browser_navigate` + login | CC shell **PASS** |
| 2 | CDP `Runtime.evaluate` — iframe `contentDocument` | **Blocked** message on all HRM routes |
| 3 | PowerShell `Invoke-WebRequest` L0 | `hrm=200 portal=200` |
| 4 | Screenshot | `page-2026-05-28T00-14-08-947Z.png` (portal shell; iframe blank/blocked) |

---

## L0 — HTTPS health

| Probe | HTTP | Verdict |
|-------|-----:|---------|
| `/api/hrm/` | 200 | **PASS** |
| `/` (portal) | 200 | **PASS** |

---

## L2 — P-CC-03..08 (browser embed)

Method: navigate portal route → read HRM iframe `contentDocument.body.innerText` (same-origin). Parent shell: no `HRM API Sync ERROR` banner; iframe body shows Vite block.

| ID | Portal route | iframe `src` (sample) | Browser L2 | Notes |
|----|--------------|----------------------|------------|-------|
| P-CC-03 | `/command-center/hrm/employees` | `.../hr/employees?portal=1&tenantId=xevn&companyId=xevn` | **FAIL** | `Blocked request. This host ("hrm-fe") is not allowed` |
| P-CC-04 | `/command-center/hrm/contracts` | `.../hr/contracts?...` | **FAIL** | Same Vite `allowedHosts` error |
| P-CC-05 | `/command-center/hrm/insurance` | `.../hr/insurance?...` | **FAIL** | Same |
| P-CC-06 | `/command-center/hrm/recruitment` | *(not re-sampled)* | **FAIL** (inferred) | Same embed stack as 03–05,07–08 |
| P-CC-07 | `/command-center/hrm/attendance` | *(not re-sampled)* | **FAIL** (inferred) | Same |
| P-CC-08 | `/command-center/hrm/payroll` | `.../hr/payroll?...` | **FAIL** | Same |

**Iframe excerpt (all sampled routes):**

```text
Blocked request. This host ("hrm-fe") is not allowed.
To allow this host, add "hrm-fe" to `server.allowedHosts` in vite.config.js.
```

**Secondary (post host-fix):** embed query uses `companyId=xevn` — group CEO matrix expects `main` per ADR (`docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`).

**Shell anomaly:** banner text `Dữ liệu đến 08:00 01/01/1970` on CC (epoch placeholder) — track after embed loads.

---

## L2.5 — J-* (browser)

| J-ID | P-CC | Click path | Result | Evidence |
|------|------|------------|--------|----------|
| J-HRM-01 | P-CC-04 | Contracts list → employee name → profile | **FAIL** | iframe blocked — `rowCount: 0` |
| J-HRM-02 | P-CC-03 | Employees list → profile | **FAIL** | iframe blocked |
| J-HRM-03 | P-CC-04 | Contract detail/drawer | **FAIL** | iframe blocked |
| J-HRM-04 | P-CC-05 | Insurance → employee link | **FAIL** | iframe blocked |
| J-HRM-05 | P-CC-06 | Recruitment → detail | **FAIL** | not executed (embed class) |
| J-HRM-06 | P-CC-07 | Attendance → detail | **FAIL** | not executed (embed class) |
| J-HRM-07 | P-CC-08 | Payroll → payslip detail | **FAIL** | iframe blocked |
| J-CC-03 | CC dashboard | KPI rollup load | **FAIL** | `GET /api/xbos/kpi-engine/rollup` **409**; `business-master/kpi_sparkline_snapshots/items` **409** (Performance API, payroll route session) |

**Contrast:** API probe R10 reported **J-HRM 7/7 PASS** with Bearer + headers — browser user path still blocked at embed.

---

## Console / network (browser session)

| Observation | Verdict |
|-------------|---------|
| `54321` / Supabase on tested routes | Not seen |
| HRM `/api/hrm/*` from embed | Not observed (iframe did not boot) |
| XBOS `kpi-engine/rollup` **409** | **FAIL** — scope mismatch on CC load |
| `position-rbac/matrix` **401** | Noted — non-blocking for this wave |

---

## Root cause & dispatch

| Priority | Issue | Owner | Fix direction |
|----------|-------|-------|----------------|
| **P0** | HRM iframe Vite blocks `hrm-fe` on HTTPS pilot | **dev-fe** + **devops** | `server.allowedHosts` in `hrm-fe` vite config; nginx `/hr/` proxy `Host` header (TLS-R2 — see `p1-ex-qa-https-01-20260527.md`) |
| **P1** | Embed `companyId=xevn` vs `main` | **dev-fe** | Align portal embed URL with group CEO scope |
| **P1** | J-CC-03 KPI **409** on browser load | **dev-fe** | Same as localhost strict rollup (`companyId=holding` vs header `main`) |
| **P2** | CC date banner `01/01/1970` | **dev-fe** / **dev-be** | After embed fix |

**pm_dispatch_hint:** `dev-fe` (embed/proxy UI); retest this work_item after deploy.

---

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-BROWSER-01
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-browser-01-20260528.md
entry_criteria: Browser MCP available; HTTPS pilot up
exit_criteria: P-CC-03..08 load without ERROR; J-HRM-01..07 click paths PASS; no 409 on load
summary: Login and L0 PASS; all HRM embed tabs blocked by Vite hrm-fe allowedHosts — L2/L2.5 browser FAIL 0/6 + 0/7. API R10 does not satisfy C-HTTPSQC-01.
pm_dispatch_hint: dev-fe + devops TLS-R2; then re-run P1-EX-QA-HTTPS-BROWSER-01
```

---

## ack_status

**FAIL_TO_PM**
