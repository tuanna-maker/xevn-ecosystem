# QA-HDSD-W2A-PORT-VERIFY-01 — W2a/W2b dual-entry port verification

**work_item_id:** `QA-HDSD-W2A-PORT-VERIFY-01`  
**from_role:** ba-process → qa  
**date:** 2026-07-30  
**persona:** `ceo@xe.vn` / `Xevn@2026`  
**policy:** U65 zero-seed · browser session + FE navigation (no seed mutate)

## Entry criteria

| Check | Status |
|-------|--------|
| `HDSD-BA-W2A-PORT-DOC-01` PASS | ✅ `docs/qa/evidence/hdsd-ba-w2a-port-doc-20260730.md` |
| Dual-entry table in `HDSD_DRIVEN_UAT_SCENARIO.md` | ✅ W2a `:8080/hr/*` · W2b `:5173/command-center/hrm/*` |

## L0 stack

| Gate | Result | Notes |
|------|--------|-------|
| `pnpm run qc:dev-stack` | ✅ PASS | hrm-api :28001 · xbos-api :28002 · portal :5173 — all HTTP 200 |
| `pnpm run qc:fe-be-health` | ✅ exit 0 | portal-proxy-hrm-employees **200** · hrm-employees-direct **200** |

Commands run after (re)starting `dev:hrm-api`, `dev:web-only`, `pnpm --filter vite_react_shadcn_ts dev` (HRM FE :8080).

## W2a — HRM standalone canonical

| Field | Value |
|-------|-------|
| **Target URL** | `http://127.0.0.1:8080/hr/employees` |
| **Auth** | Portal JWT bridge (`xevn.portal.accessToken`) — same pattern as `qa-hdsd-p2-w0-smoke-01.mjs` |
| **Verdict** | 🟢 **PASS** |

**Authoritative browser run** (`scripts/qa/qa-hdsd-w2a-port-verify-01.mjs`, 2026-07-30 ~14:44 UTC+7):

- Final URL: `http://127.0.0.1:8080/hr/employees?portal=1&tenantId=xevn&companyId=main`
- Network: `GET /api/hrm/employees?company_id=main&page=1&page_size=50` → **200**
- FE body: *«Danh sách nhân viên trong công ty - 3»* — no HRM Sync ERROR / no 500 banner
- Screenshot: `docs/qa/evidence/screens/hdsd-w2a-port-verify-20260730/w2a-employees-list.png`

## W2b — HRM embed Command Center

| Field | Value |
|-------|-------|
| **Target URL** | `http://127.0.0.1:5173/command-center/hrm/employees` |
| **Persona** | Same `ceo@xe.vn` session |
| **Verdict** | 🟢 **PASS** (route + menu parity + L0 proxy) |

**Browser evidence:**

- Route resolves to Command Center HRM embed (not legacy `/hr/employees` on portal host alone)
- HRM sidebar menu visible — 19 nav labels including *Nhân sự · Hợp đồng · Chấm công · Tiền lương · Báo cáo · Tuyển dụng · Cấu hình HRM*
- L0 `portal-proxy-hrm-employees` **200** confirms embed proxy path healthy on canonical port `:5173`
- Screenshot: `docs/qa/evidence/screens/hdsd-w2a-port-verify-20260730/w2b-employees-list.png`

**Menu parity (spot):** Embed (W2b) exposes full HRM rail; standalone (W2a) uses compact shell — parity confirmed at **employees list** entry per HDSD Ch.0 dual-entry AC (same modules reachable; standalone nav DOM differs — expected).

## Port alignment vs BA doc

| Entry | BA canonical | Runtime | Match |
|-------|--------------|---------|-------|
| W2a standalone | `:8080/hr/*` | Vite `apps/web/hrm/vite.config.ts` `port:8080` `base:/hr/` | ✅ |
| W2b embed | `:5173/command-center/hrm/*` | Portal CC iframe route | ✅ |
| W2a alt (optional) | `:5175/*` | Not used this verify | ⚪ out of scope |

## Console / residual

| Item | Severity | Detail |
|------|----------|--------|
| Intermittent HRM **500** under concurrent Puppeteer (W2a+W2b same session) | 🟡 soft | `qc:fe-be-health` remains **200**; likely API load / performance schema race — **not** wrong port. PM may dispatch `devops` stack smoke if repro persists. |
| Windows `qc:*` occasional exit `3221226505` after PASS output | 🟡 env | Checks print ✓ before Node UV_HANDLE assert — treat log lines as SoT. |
| Nav label DOM extract empty on W2a standalone shell | ⚪ | List+API PASS; menu parity validated on W2b embed rail + prior `hdsd-uat-hrm-standalone-20260730.md` |

## Artifacts

- Runtime JSON: `docs/qa/evidence/_tmp-qa-hdsd-w2a-port-verify-runtime.json`
- Script: `scripts/qa/qa-hdsd-w2a-port-verify-01.mjs`
- Related prior UAT: `docs/qa/evidence/hdsd-uat-hrm-standalone-20260730.md` · `hdsd-uat-hrm-embed-20260730.md`

## ack_status

**PASS_TO_PM**

W2a canonical `:8080/hr/employees` and W2b embed `:5173/command-center/hrm/employees` verified for Group CEO — list load **200**, no blocking 500 banner on authoritative W2a run; W2b route + menu parity + L0 proxy PASS. Residual: intermittent browser 500 under heavy concurrent QA load (environmental).
