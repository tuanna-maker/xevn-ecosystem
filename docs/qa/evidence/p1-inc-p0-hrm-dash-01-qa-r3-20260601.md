# P1-INC-P0-HRM-DASH-01-QA-R3 — post DevOps deploy retest (nip.io)

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-QA-R3 |
| **parent** | P1-INC-P0-HRM-DASH-01 |
| **owner** | QA |
| **date** | 2026-06-01 |
| **environment** | `https://14-225-217-232.nip.io` (pilot HTTPS) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **route** | `/command-center/hrm/dashboard` |
| **deploy evidence** | `docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-deploy-20260601.md` |
| **prior qa** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r2-20260601.md` |
| **ack_status** | **PASS_TO_PM** (GWC — stale FE workspace-meta banner) |

## Verdict summary

| Check | Result | Notes |
|-------|--------|-------|
| L0 `/api/xbos/` | **PASS** | HTTP 200 |
| L0 `/api/hrm/` | **PASS** | HTTP 200 |
| Login `ceo@xe.vn` | **PASS** | HTTP 201; `accessToken` present |
| `workspace-meta` `asOf` (API) | **PASS** | `2026-05-25T04:42:24.224Z` — year **2026**, not epoch |
| UI: no `01/01/1970` / epoch date | **PASS** | Amber bar: «Dữ liệu đến **11:42 25/05/2026**» |
| UI: no workspace-meta failure banner | **GWC** | Blue banner still visible; in-session fetch returns **200** with valid `asOf` — FE stale/race (P2) |
| Console clean (no Uncaught / ReferenceError) | **PASS** | `window.__qaErrors=[]` after 10s soak |
| HRM embed shell (no white-screen crash) | **PASS** | Sidebar + full menu; P0 `isSupabaseConfigured` remains closed |
| J-HRM-DASH (dashboard load L2.5) | **PASS** | Route loads; menu navigable; no 409/54321 |

**Overall PASS_TO_PM** — P0 exit criteria met: API `asOf` non-epoch, UI no 1970 display, console clean. **GWC:** stale blue «Không tải workspace-meta» banner despite live API 200 (dev-fe P2).

---

## Comparison R2 → R3

| Signal | R2 (pre-deploy) | R3 (post-deploy) |
|--------|-----------------|------------------|
| `data.asOf` | `1970-01-01T00:00:00.000Z` | **`2026-05-25T04:42:24.224Z`** |
| UI date line | `08:00 01/01/1970` | **`11:42 25/05/2026`** |
| `epoch_fail` | `true` | **`false`** |
| Console | Clean | **Clean** |
| workspace-meta blue banner | Present | **Still present (GWC)** |
| `verdict_api` | `false` | **`true`** |

---

## Execution log

### 1. API probe

Script: `scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs`  
`PORTAL_DEV_URL=https://14-225-217-232.nip.io`

```json
{
  "ts": "2026-06-01T04:15:25.015Z",
  "base": "https://14-225-217-232.nip.io",
  "checks": {
    "l0_xbos": { "status": 200, "pass": true },
    "login": { "status": 201, "pass": true, "tenant": "xevn", "company": "main" },
    "workspace_meta": {
      "status": 200,
      "path": "/api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main",
      "asOf": "2026-05-25T04:42:24.224Z",
      "epoch_fail": false,
      "year": 2026,
      "pass": true
    },
    "l0_hrm": { "status": 200, "pass": true }
  },
  "verdict_api": true
}
```

Exit code: **0** (was **1** in R2).

### 2. Browser (mandatory)

- URL: `https://14-225-217-232.nip.io/command-center/hrm/dashboard`
- Session: authenticated as group CEO (`ceo@xe.vn`)
- CDP body scan + error listeners (10s soak):

```json
{
  "qaErrors": [],
  "has1970": false,
  "hasEpochBanner": false,
  "dateLine": "Dữ liệu đến 11:42 25/05/2026",
  "workspaceMetaBanner": true
}
```

- In-browser `fetch('/api/xbos/command-center/workspace-meta?...')`:

```json
{
  "status": 200,
  "body": {
    "code": "XBOS-CC-200",
    "data": { "asOf": "2026-05-25T04:42:24.224Z", "dataSyncNote": null },
    "message": "Workspace meta loaded",
    "success": true
  }
}
```

- Fresh navigation retest (12s wait): same — date **25/05/2026**, no 1970, blue banner persists, console clean.
- HRM menu: Tổng quan (current), Nhân sự, Hợp đồng, … — **loaded**

### 3. L2.5 J-HRM-DASH

| Step | Result |
|------|--------|
| Load `/command-center/hrm/dashboard` | **PASS** — shell + sidebar |
| No 409 scope / 54321 console | **PASS** |
| workspace-meta API in session | **200** |
| Cross-nav menu visible | **PASS** |

---

## Traceability

| ID | Result |
|----|--------|
| P1-INC-P0-HRM-DASH-01 (ReferenceError) | **PASS** (unchanged since R1) |
| P1-INC-P0-HRM-DASH-01-BE-META | **PASS live** — deploy confirmed on nip.io |
| P1-INC-P0-HRM-DASH-01-DO-DEPLOY | **PASS** — QA confirms post-deploy |
| J-HRM-DASH / CC workspace-meta | **PASS** (GWC blue banner P2) |

---

## Residual / GWC

| Item | Owner | Priority | Notes |
|------|-------|----------|-------|
| Stale blue «Không tải workspace-meta» despite API 200 | **dev-fe** | P2 | First-paint race or error state not cleared after successful meta load |
| Commit + push BE-META to `main` | **dev-be / PM** | P1 governance | VPS hot-patch only; git parity per deploy doc |

---

## Commands run

```text
node scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs  → exit 0
MCP browser: /command-center/hrm/dashboard → CDP console + body scan + in-session fetch
MCP browser: fresh navigation retest → exit same (GWC banner)
```

---

## Handoff

- **completion_report:** R3 retest **PASS** — post DevOps deploy, nip.io `workspace-meta` returns `asOf` **2026-05-25** (not epoch); UI shows **25/05/2026** (no 1970); console **clean**; HRM embed shell **PASS**. **GWC:** blue workspace-meta failure banner still renders though live API returns 200 — dispatch **dev-fe** P2 if UX polish required before partner demo.
- **next_owner:** `pm` → `qc` (gate) or `dev-fe` (P2 banner only)
- **next_dispatch_prompt:** `work_item_id: P1-INC-P0-HRM-DASH-01-QC-01 — Audit QA-R3 evidence docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r3-20260601.md: P0 HRM dashboard epoch incident CLOSED on nip.io (API asOf 2026-05-25, UI no 01/01/1970, console clean). GWC: stale blue workspace-meta banner with live API 200 — accept P2 or dispatch dev-fe. Exit: GO or GO WITH CONDITIONS with git-parity note (BE-META not on origin/main).`
- **evidence_path:** `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r3-20260601.md`
- **ack_status:** **PASS_TO_PM**
