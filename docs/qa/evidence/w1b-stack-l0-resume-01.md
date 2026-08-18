# W1-B-STACK-L0-RESUME-01 — Post-reboot local UAT L0 + AVD

| Field | Value |
|-------|-------|
| work_item_id | `W1-B-STACK-L0-RESUME-01` |
| role | devops |
| date | 2026-08-03 (~20:21 ICT) |
| trigger | Post-reboot resume for parked QA retests; sponsor escalate APIs down |
| U65 | **no seed** — no `pnpm seed:*` |

## Processes (local)

| Process | Port | PID | Start / note |
|---------|------|-----|--------------|
| hrm-api | **28001** | **26452** | `node --enable-source-maps apps/api/hrm-api/dist/main` |
| xbos-api | **28002** | **21548** | `node dist/main.js` (cwd `apps/api/xbos-api`) — **not** `nest start --watch` (deleteOutDir race) |
| web-portal | **5173** | **23728** | Vite `web-portal` |
| HRM FE | **8080** | **6028** | `vite --host 127.0.0.1 --port 8080` (cwd `apps/web/hrm`) |

## Android AVD

| Item | Value |
|------|-------|
| AVD | `xevn_api34` |
| adb serial | **emulator-5554** |
| state | `device` |
| `sys.boot_completed` | **1** |

## Health URLs

| Check | URL | Result |
|-------|-----|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | **HTTP 200** |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | **HTTP 200** |
| web-portal | `http://127.0.0.1:5173/` | **HTTP 200** |
| HRM FE | `http://127.0.0.1:8080/hr/` | **HTTP 200** |

## Gates

### `pnpm run qc:fe-be-health`

**Exit 0** — `=== Summary: ALL PASS ===`

- portal-login token ok
- hrm-employees-direct 200 (`company_id=main`)
- portal-proxy-hrm-employees 200
- catalog-sync direct + proxy 200

## Ops notes (resume)

1. Concurrent `pnpm run dev:hrm-api` / `dev:web-only` hit **EADDRINUSE** when listeners already existed — prefer health probe before restart.
2. `nest start --watch` on xbos can fail `Cannot find module …/dist/main` (NodeNext + `deleteOutDir`) — stable L0: `pnpm run build` then `node dist/main.js`.
3. Fleet / CommandCenterInboxPage working-tree files **not** deleted.
4. No seed executed.

## Residual

- Do not claim product DONE — L0 only.
- QA must complete parked UF/J-* retests from FE (U65).

## ack_status

**READY_FOR_QA**

## next_owner

`qa` (+ `qa-device` for mobile auth)

## next_dispatch_prompt

```
1) work_item_id: W1-B-02-EMP-QA-RET2
role: qa
entry: L0 PASS · docs/qa/evidence/w1b-stack-l0-resume-01.md
URL: http://127.0.0.1:5173 · APIs :28001/:28002 · U65 zero-seed
mission: Retest EMP live L1 + browser (display-ready, GET :id, PATCH, F5)
exit: docs/qa/evidence/w1b-02-emp-qa-ret2.md

2) work_item_id: W1-B-04-AUTH-FE-QA-RET2
role: qa
entry: same L0 evidence · portal :5173
mission: Auth FE retest (login membership/scope display) U65 browser-only
exit: docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md

3) work_item_id: W1-B-04-AUTH-MOB-QA-R2
role: qa-device
entry: adb serial emulator-5554 · boot_completed=1 · APIs 200
mission: Mobile auth retest on xevn_api34
exit: docs/qa/evidence/w1b-04-auth-mob-qa-r2.md
```
