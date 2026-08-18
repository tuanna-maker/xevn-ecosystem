# D-HRM-ATT-NAV-STALL-01-ENV — hrm-fe Vite `react-dom.js` 504 repair

- **Date:** 2026-07-17
- **work_item_id:** `D-HRM-ATT-NAV-STALL-01-ENV`
- **owner:** `devops`
- **ack_status:** `READY_FOR_QA`
- **Environment:** VPS Dev8088 `http://14.225.217.232:8088` · HRM Vite `:8080`
- **Deploy HEAD (unchanged):** `96651c7` — soft-nav source left on wire (no revert)
- **Prior FAIL:** `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md` (`BLOCKED-ENV`)
- **U65:** no seed · no soft-nav PASS claim · no Phase 1 / PROD claim

## Verdict

**READY_FOR_QA** — Vite prebundle repaired; `react-dom.js` **200** on `:8080` and `:8088/hr/`; HRM embed Employees UI mounts (non-empty `#root`). Soft-nav AC remains for QA retest.

---

## Root cause

| Finding | Detail |
|---------|--------|
| Symptom | `GET …/hr/node_modules/.vite/deps/react-dom.js` → **504** (portal + direct `:8080`); `react.js` **200**; iframe `#root` empty |
| Vite log | `error while updating dependencies: ENOENT … /app/apps/web/hrm/node_modules/@supabase/supabase-js/dist/index.mjs` |
| Effect | Optimize deps aborted mid-run → stale/incomplete `.vite/deps` (had `react.js` / `react-dom_client.js`, **no** usable `react-dom.js`) |
| Note | HRM `package.json` has **no** `@supabase/supabase-js` dep; nested broken path still poisoned Vite optimizer metadata |

## Actions (minimal)

1. Audit `xevn-hrm-fe-dev` logs + curl matrix (confirmed 504 / missing file).
2. Cleared stale cache: `rm -rf /app/apps/web/hrm/node_modules/.vite`
3. `docker compose run --rm --no-deps pnpm-install` (lockfile up-to-date; residual nested supabase path remains but not required for HRM SPA boot after cache clear)
4. `docker compose up -d --no-deps --force-recreate hrm-fe` only — **no** `compose down`; non-xevn stacks left Up
5. Waited until `react-dom.js` → **200**; verified portal proxy path

Soft-nav / `App.tsx` **not** modified.

---

## Exit criteria

| # | Criteria | Result |
|---|----------|--------|
| 1 | `react-dom.js` **200** on `:8080` and `:8088/hr/` | **PASS** — see curls |
| 2 | Hard load `/command-center/hrm/employees` → Employees UI, non-empty `#root` | **PASS** — CDP `rootLen=97798`, table «Quản lý nhân viên» / 1107 NV |
| 3 | Evidence path | this file + screenshot |
| 4 | Soft-nav PASS | **NOT claimed** — QA owns |

### Curl matrix (VPS localhost + external)

| URL | HTTP |
|-----|------|
| `http://127.0.0.1:8080/hr/node_modules/.vite/deps/react-dom.js` | **200** |
| `http://127.0.0.1:8088/hr/node_modules/.vite/deps/react-dom.js` | **200** |
| `http://14.225.217.232:8080/hr/node_modules/.vite/deps/react-dom.js` | **200** |
| `http://14.225.217.232:8088/hr/node_modules/.vite/deps/react-dom.js` | **200** |
| `react.js` (same hosts/paths) | **200** |

`Content-Type: text/javascript`; stub re-exports Vite chunks (healthy prebundle).

### Browser smoke (BOD session)

- URL: `http://14.225.217.232:8088/command-center/hrm/employees`
- iframe `src`: `/hr/employees?portal=1&tenantId=xevn&companyId=main&_v=…`
- iframe `#root` text includes: **Quản lý nhân viên**, employee rows (e.g. HLD-0996 Phạm Đức Hùng)
- Screenshot: `docs/qa/evidence/d-hrm-att-nav-stall-01-env-employees-20260717.png`

### Non-xevn

`ytexa_*`, `hsbx_*`, `asms_*`, `viconnec_*` still Up — untouched.

---

## Residual

| Item | Owner |
|------|--------|
| Nested broken `@supabase/*` under `apps/web/hrm/node_modules` (orphan / incomplete) — may re-break Vite optimize if metadata reintroduces it | DevOps/FE hygiene follow-up if 504 returns; **not** blocking this READY_FOR_QA |
| Soft-nav leave Attendance ×2 + J-HRM-02 | **QA** (`D-HRM-ATT-NAV-STALL-01-QA`) |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **next_dispatch_prompt:** see completion packet below
- **pm_dispatch_hint:** Re-dispatch `D-HRM-ATT-NAV-STALL-01-QA` — env blocker cleared; do not claim soft-nav from this evidence
