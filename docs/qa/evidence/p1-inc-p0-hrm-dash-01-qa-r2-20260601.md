# P1-INC-P0-HRM-DASH-01-QA-R2 — post BE-META retest (nip.io)

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-QA-R2 |
| **parent** | P1-INC-P0-HRM-DASH-01 |
| **owner** | QA |
| **date** | 2026-06-01 |
| **environment** | `https://14-225-217-232.nip.io` (pilot HTTPS) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **route** | `/command-center/hrm/dashboard` |
| **be evidence** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-be-meta-20260601.md` |
| **prior qa** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-20260601.md` |
| **ack_status** | **FAIL_TO_PM** |

## Verdict summary

| Check | Result | Notes |
|-------|--------|-------|
| L0 `/api/xbos/` | **PASS** | HTTP 200 |
| L0 `/api/hrm/` | **PASS** | HTTP 200 |
| Login `ceo@xe.vn` | **PASS** | HTTP 201; `accessToken` present |
| `workspace-meta` `asOf` (API) | **FAIL** | Still `1970-01-01T00:00:00.000Z` — **unchanged from R1** |
| UI: no `01/01/1970` / epoch banner | **FAIL** | Amber: «Dữ liệu đến **08:00 01/01/1970**» |
| UI: no workspace-meta failure banner | **FAIL** | Blue: «Không tải workspace-meta…» |
| Console clean (no Uncaught / ReferenceError) | **PASS** | `window.__qaErrors=[]` on dashboard route |
| HRM embed shell (no white-screen crash) | **PASS** | Sidebar + menu; P0 `isSupabaseConfigured` **remains closed** |

**Overall FAIL_TO_PM** — BE fix is **not observable on pilot** (xbos-api image/deploy gap). Exit criteria §asOf / epoch banner **not met**.

---

## Root cause (retest)

| Layer | Finding |
|-------|---------|
| **Deploy** | Pilot `workspace-meta` body identical to R1 (`asOf` epoch). BE doc notes jest PASS locally; **nip.io still serves pre-fix behavior**. |
| **BE code** | Fix documented in `command-center.service.ts` (`resolveWorkspaceAsOf`, rollup `main`+`holding`) — **not verified live** (local `:28002` down at retest). |

---

## Execution log

### 1. API probe

Script: `scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs`  
`PORTAL_DEV_URL=https://14-225-217-232.nip.io`

```json
{
  "ts": "2026-06-01T04:08:21.117Z",
  "checks": {
    "l0_xbos": { "status": 200, "pass": true },
    "login": { "status": 201, "pass": true, "tenant": "xevn", "company": "main" },
    "workspace_meta": {
      "status": 200,
      "path": "/api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main",
      "asOf": "1970-01-01T00:00:00.000Z",
      "epoch_fail": true,
      "year": 1970,
      "pass": false
    },
    "l0_hrm": { "status": 200, "pass": true }
  },
  "verdict_api": false
}
```

Exit code: **1**

### 2. Browser (mandatory)

- URL: `https://14-225-217-232.nip.io/command-center/hrm/dashboard` (session already authenticated as group CEO)
- CDP body scan + error listeners (10s soak after navigation):

```json
{
  "qaErrors": [],
  "has1970": true,
  "hasEpochBanner": true
}
```

- Visible copy (FAIL):
  - «Không tải workspace-meta — dashboard không dùng mock khi VITE_ALLOW_MOCK_FALLBACK=false.»
  - «Dữ liệu đến **08:00 01/01/1970**»
- HRM menu: Tổng quan, Nhân sự, Hợp đồng, … — **loaded** (no ReferenceError crash)
- Screenshot: `page-2026-06-01T04-09-01-509Z.png` (MCP browser temp)

### 3. Local stack

```text
curl http://127.0.0.1:28002/api/xbos/ → ECONNREFUSED (000)
```

Cannot confirm post-fix `asOf` on dev stack without deploy/start.

---

## Comparison R1 → R2

| Signal | R1 (2026-06-01) | R2 |
|--------|----------------|-----|
| `data.asOf` | `1970-01-01T00:00:00.000Z` | **Same** |
| UI `01/01/1970` | Present | **Present** |
| Console | Clean | **Clean** |
| BE jest | N/A | Documented PASS (not on pilot) |

---

## Traceability

| ID | Result |
|----|--------|
| P1-INC-P0-HRM-DASH-01 (ReferenceError) | **PASS** (unchanged) |
| P1-INC-P0-HRM-DASH-01-BE-META | **FAIL live** — code ready; **pilot not deployed** |
| J-HRM-DASH / CC workspace-meta | **FAIL** |

---

## Residual / dispatch

| Item | Owner | Priority |
|------|-------|----------|
| Deploy/restart **xbos-api** on pilot with BE-META commit | **devops** | P0 |
| Re-run **QA-R3** after deploy: API `asOf` year ≥ 2020 + UI no 1970 | **qa** | P0 after deploy |
| FE workspace-meta first-paint race (if banner persists after API fix) | **dev-fe** | P2 |

---

## Commands run

```text
node scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs  → exit 1
MCP browser: /command-center/hrm/dashboard → CDP console + body scan
curl http://127.0.0.1:28002/api/xbos/  → connection refused
```

---

## Handoff

- **completion_report:** R2 retest on nip.io **FAIL** — `workspace-meta` still returns epoch `asOf`; UI still shows **01/01/1970** and workspace-meta failure banners. P0 crash/console criteria **PASS**. BE fix **not live** on pilot (deploy blocker).
- **next_owner:** `devops`
- **next_dispatch_prompt:** `work_item_id: P1-INC-P0-HRM-DASH-01-DO-DEPLOY — Deploy xbos-api to pilot https://14-225-217-232.nip.io with commit containing P1-INC-P0-HRM-DASH-01-BE-META (command-center.service.ts resolveWorkspaceAsOf + main/holding rollup). Evidence: docs/qa/evidence/p1-inc-p0-hrm-dash-01-be-meta-20260601.md. Exit: curl workspace-meta as ceo@xe.vn returns asOf NOT 1970-01-01T00:00:00.000Z (year≥2020); then ack READY_FOR_QA for P1-INC-P0-HRM-DASH-01-QA-R3.`
- **evidence_path:** `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r2-20260601.md`
- **ack_status:** **FAIL_TO_PM**
