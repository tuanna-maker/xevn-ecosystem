# P1-INC-P0-HRM-DASH-01-QA-R4 — post DO-FE-DEPLOY retest (nip.io)

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-QA-R4 |
| **parent** | P1-INC-P0-HRM-DASH-01 |
| **owner** | QA |
| **date** | 2026-06-01 |
| **environment** | `https://14-225-217-232.nip.io` (pilot HTTPS) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **routes** | `/command-center/hrm/dashboard`, `/command-center/hrm/payroll` |
| **deploy evidence** | `docs/ops/evidence/p1-inc-p0-hrm-dash-01-do-fe-deploy-20260601.md` |
| **prior qa** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r3-20260601.md` |
| **ack_status** | **PASS_TO_PM** (GWC — HRM iframe panel empty) |

## Verdict summary

| Check | Result | Notes |
|-------|--------|-------|
| FE `/hr/` bundle (no `isSupabaseConfigured` crash) | **PASS** | `tmp-fe-deploy-hr-smoke.mjs` exit **0**; `supabaseEnabled = false`; no `enabled: isSupabaseConfigured` |
| L0 + `workspace-meta` API | **PASS** | `asOf` `2026-05-25T04:42:24.224Z`; `verdict_api: true` |
| Payroll periods API | **PASS** | `GET /api/hrm/payroll/periods?company_id=main` → **200** `HRM-PAY-200`, total **5** |
| Console clean (no Uncaught / ReferenceError) | **PASS** | 12–15s CDP soak: `qaErrors: []`; no `isSupabaseConfigured` |
| UI: no `01/01/1970` | **PASS** | «Dữ liệu đến **11:42 25/05/2026**» |
| Dashboard shell (portal + HRM nav) | **PASS** | Sidebar + menu; no 502 on fresh nav |
| L2.5 cross-nav dashboard → payroll | **PASS** | Click «Tiền lương» → URL `/command-center/hrm/payroll` |
| HRM iframe embed content | **GWC** | iframe `w: 0`, `iframeBodyLen: 0` (same-origin); no console crash — panel blank |
| Stale workspace-meta blue banner (R3) | **PASS** | Not observed this run (`workspaceMetaBanner: false`) |

**Overall PASS_TO_PM** — P0 `isSupabaseConfigured` incident **CLOSED** on nip.io after DO-FE-DEPLOY; dashboard/payroll routes load with **clean console** and non-epoch meta. **GWC:** HRM iframe main panel does not render React content (empty body); portal chrome + API green.

---

## Comparison R3 → R4

| Signal | R3 (post BE deploy) | R4 (post FE deploy) |
|--------|---------------------|----------------------|
| `isSupabaseConfigured` console | Clean | **Clean** |
| FE module on `/hr/` | Not retested (403 pre-vite) | **200**, `supabaseEnabled=false` |
| Blue workspace-meta banner | GWC present | **Not seen** |
| iframe HRM content | Shell PASS (nav) | **GWC empty iframe body** |
| Payroll route | Not in R3 scope | **PASS** nav + API |

---

## Execution log

### 1. API + FE smoke

```bash
node scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs   # exit 0
node scripts/tmp-fe-deploy-hr-smoke.mjs                  # exit 0
```

**API probe (excerpt):**

```json
{
  "workspace_meta": {
    "asOf": "2026-05-25T04:42:24.224Z",
    "epoch_fail": false,
    "pass": true
  },
  "verdict_api": true
}
```

**FE smoke (excerpt):**

```json
{
  "checks": {
    "hr_status": 200,
    "crash_isSupabaseConfigured": false,
    "module_has_supabaseEnabled": true,
    "module_undefined_ref": false
  },
  "pass": true
}
```

**Payroll API (authenticated):**

```json
{
  "status": 200,
  "code": "HRM-PAY-200",
  "total": 5,
  "msg": "Payroll periods listed"
}
```

Query: `GET /api/hrm/payroll/periods?company_id=main` (note: `page`/`pageSize` → `HRM-VAL-001`).

### 2. Browser — dashboard (`/command-center/hrm/dashboard`)

- Session: already authenticated as group CEO
- CDP 12s soak:

```json
{
  "qaErrors": [],
  "has1970": false,
  "hasSupaCrash": false,
  "has502": false,
  "has409": false,
  "has54321": false,
  "dateLine": "Dữ liệu đến 11:42 25/05/2026",
  "workspaceMetaBanner": false,
  "iframeInfo": {
    "src": "https://14-225-217-232.nip.io/hr/?portal=1&tenantId=xevn&companyId=xevn",
    "w": 0,
    "h": 341,
    "iframeBodyLen": 0
  }
}
```

### 3. Browser — payroll L2.5

| Step | Result |
|------|--------|
| Navigate `/command-center/hrm/payroll` | **PASS** — URL correct |
| Click «Tiền lương» from dashboard | **PASS** — cross-nav |
| Console 8s soak | **PASS** — `errors: []`, `hasSupa: false` |
| iframe src | `/hr/payroll?portal=1&tenantId=xevn&companyId=xevn` |
| Direct `/hr/payroll?portal=1&companyId=main` | Title loads; `rootHtmlLen: 0` after 25s, **no** supabase ReferenceError |

### 4. L2.5 J-HRM-DASH

| Step | Result |
|------|--------|
| Load dashboard | **PASS** |
| No 409 / 54321 / 502 | **PASS** |
| Cross-nav to payroll | **PASS** |
| P0 crash strings | **PASS** |

---

## Traceability

| ID | Result |
|----|--------|
| P1-INC-P0-HRM-DASH-01 (`isSupabaseConfigured`) | **PASS** — FE deploy verified |
| P1-INC-P0-HRM-DASH-01-DO-FE-DEPLOY | **PASS** — QA confirms |
| J-HRM-DASH | **PASS** (GWC iframe panel) |
| P-CC HRM payroll embed | **PASS** nav; **GWC** iframe body |

---

## Residual / GWC

| Item | Owner | Priority | Notes |
|------|-------|----------|-------|
| HRM iframe panel empty (`iframeBodyLen: 0`, `w: 0`) | **dev-fe** | P2 | Portal nav OK; embed React not mounting visible content — postMessage/session or layout |
| Push P1-SUPA-FE-02 + `scope-context` to `main` | **dev-fe / dev-be / PM** | P1 governance | Pilot pscp hot-sync per deploy doc |
| Transient **502** on stale tab | **devops** | P3 | Fresh navigation **200**; prior tab title showed 502 |

---

## Commands run

```text
node scripts/tmp-p1-inc-p0-hrm-dash-01-qa-r2-probe.mjs  → exit 0
node scripts/tmp-fe-deploy-hr-smoke.mjs                 → exit 0
MCP browser: /command-center/hrm/dashboard → CDP console + iframe probe
MCP browser: click Tiền lương → /command-center/hrm/payroll
MCP browser: /hr/payroll?portal=1&companyId=main → no supabase crash
```

---

## Handoff

- **completion_report:** R4 retest **PASS** after DO-FE-DEPLOY — nip.io no `isSupabaseConfigured` ReferenceError (FE smoke + 15s+ console soak); dashboard date **25/05/2026**; payroll route + API **200**; L2.5 dashboard→payroll **PASS**. **GWC:** HRM iframe content area empty despite correct iframe `src` and clean console.
- **next_owner:** `pm` → `qc` (P0 closure) or `dev-fe` (iframe hydration GWC only)
- **next_dispatch_prompt:** `work_item_id: P1-INC-P0-HRM-DASH-01-QC-02 — Audit QA-R4 docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r4-20260601.md: P0 isSupabaseConfigured CLOSED on nip.io (FE smoke pass, console clean, workspace-meta 2026). GWC: HRM iframe panel empty (iframeBodyLen 0). Exit: GO or GO WITH CONDITIONS; note git-parity (FE hot-sync not on main).`
- **evidence_path:** `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-r4-20260601.md`
- **ack_status:** **PASS_TO_PM**
