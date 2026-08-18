# Evidence — W1-B-04-AUTH-FE-QA-RET

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-QA-RET` |
| **parent** | `W1-B-04-AUTH-FE-QA` · `docs/qa/evidence/w1b-04-auth-fe-qa.md` (BLOCKED-STACK) |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **UF / J-*** | Portal login → membership picker → select-membership → F5 |
| **U65** | zero-seed · no `pnpm seed:*` · **cấm** invent UF 🟢 from vitest |
| **URL** | `http://127.0.0.1:5173` (L0 SoT) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` (mission) · `admin@xe.vn` prepared for multi-membership select (not reached) |
| **ack_status** | **FAIL** |

## Environment / L0

| Probe | Result |
|-------|--------|
| `http://127.0.0.1:5173/` | HTTP **200** (HTML shell) |
| `http://127.0.0.1:28002/api/xbos` | HTTP **200** |
| `http://127.0.0.1:28001/api/hrm` | HTTP **200** |
| Prior L0 | `docs/qa/evidence/w1b-stack-l0-01.md` READY_FOR_QA |
| `:8088` / `:5175` | ECONNREFUSED (not running) |

**Note:** L0 health ≠ Vite module graph OK. Portal shell 200 but `GET /src/App.tsx` → **500**.

## Browser attempt (U65)

Harness: `scripts/qa/w1b-04-auth-fe-qa-ret-browser.mjs`  
Runtime: `docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret-runtime.json`  
Screens: `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret/`

| Step | Result |
|------|--------|
| Open `http://127.0.0.1:5173/login` | URL stays `/login` · **blank body** · no email/password inputs |
| Root cause | Vite transform **500**: `Failed to resolve import "./pages/command-center/CommandCenterInboxPage" from "src/App.tsx"` |
| File on disk | **MISSING** — `apps/web/web-portal/src/pages/command-center/` has no `CommandCenterInboxPage.*`; git history empty for that path |
| UI login click | **not reachable** |
| Membership picker / select / F5 | **not reachable** |

Console / Network excerpt:

```text
HTTP 500 http://127.0.0.1:5173/src/App.tsx
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Vite: Failed to resolve import "./pages/command-center/CommandCenterInboxPage" from "src/App.tsx"
```

`App.tsx` still has:

```ts
const CommandCenterInboxPage = lazy(() => import('./pages/command-center/CommandCenterInboxPage'));
// Route path="command-center/inbox"
```

## AC matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | login 2xx → picker shows BE `tenant_label` / `company_label` / `role_label` (not raw `roleCode`) | 🔴 **FAIL** | Portal whitescreen — UI login / picker not rendered |
| 2 | select-membership 2xx → session/JWT has `membershipId` | 🔴 **FAIL** | No UI path; Network select not observed in browser |
| 3 | F5 — labels persist | 🔴 **FAIL** | Session UI unreachable |
| 4 | click path + Network in evidence | 🔴 **FAIL** | Click path blocked at App bootstrap; only Vite 500 captured |

### L1 API spot (not UF 🟢 — reference only)

Direct XBOS (not claimed as browser PASS):

| Call | Result |
|------|--------|
| `POST /api/xbos/auth/login` `ceo@xe.vn` | **201** `XBOS-AUTH-200` · memberships=1 · `tenant_label=Tập đoàn XeVN` · `company_label=Công ty chính` · `role_label=CEO Tập đoàn` · `roleCode=group_ceo` · JWT `membershipId=9db4e67b-4840-42fd-8c88-b528cb278ac9` |
| `POST /api/xbos/auth/select-membership` `{tenantId:xevn}` | **201** `XBOS-AUTH-201` · JWT `membershipId` present |
| `ceo@xe.vn` membership count | **1** → TopHeader switcher would be static (not multi-picker) when UI up |
| `admin@xe.vn` membership count | **5** — intended for select-membership UI click once portal boots |

## What was **not** claimed

- Prior vitest `authSession` 11/11 from `w1b-04-auth-fe-qa.md` — **not** reused as UF 🟢
- L0 port 200 — **not** treated as FR-UC-M01 browser PASS
- API login labels — **not** substituted for FE picker evidence

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **R-AUTH-FE-VITE-INBOX** | **P0** | Missing `CommandCenterInboxPage` breaks entire portal Vite graph → login white screen | **dev-fe** |
| R-AUTH-FE-BROWSER | P0 UF | FR-UC-M01 browser AC1–4 still open after Vite fix | **qa** retest |
| R-AUTH-FE-CEO-SINGLE-MEM | P2 info | `ceo@xe.vn` has 1 membership — use `admin@xe.vn` (or add membership) to exercise switcher select click | qa / data |
| R-M01-LOCKOUT-COL | P2 | Lockout DB column still OPEN | BA/SA |

## U65 compliance

- No seed
- No invent PASS from vitest/API-only
- Honest **FAIL** — browser unavailable for UF

## completion_report

Closed W1-B-04-AUTH-FE-QA-RET with **FAIL**: L0 ports healthy (`5173`/`28001`/`28002` 200) but portal App bootstrap fails — Vite 500 missing `./pages/command-center/CommandCenterInboxPage`. UI login / membership picker / select-membership / F5 **not reachable**; AC1–4 🔴. API login still returns display-ready `*_label` + `membershipId` (L1 only). Residual **R-AUTH-FE-VITE-INBOX** → dev-fe; then QA retest same work item.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-VITE-01
role: dev-fe
priority: P0
mission: Unblock portal Vite at http://127.0.0.1:5173 — restore or stub apps/web/web-portal/src/pages/command-center/CommandCenterInboxPage (imported from App.tsx lazy route command-center/inbox) so /login renders. Then READY_FOR_QA for W1-B-04-AUTH-FE-QA-RET2.
entry: docs/qa/evidence/w1b-04-auth-fe-qa-ret.md FAIL · curl /src/App.tsx shows missing import
exit: GET http://127.0.0.1:5173/login shows email+password; no Vite 500 on App.tsx; evidence path + bus READY_FOR_QA
must_keep: authSession *_label bind; TopHeader membership display helpers; U65 no seed
cấm: delete auth display-ready wiring to “fix” build
```

## ack_status

**FAIL**
