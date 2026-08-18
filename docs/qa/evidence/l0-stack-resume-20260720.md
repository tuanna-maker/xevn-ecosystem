# PCOMP-L0-STACK-RESUME-01 — Local L0 stack resume (post PC reboot)

**Date:** 2026-07-20  
**Role:** devops  
**Sponsor:** PC reboot — all ports DOWN (5173, 5176, 8080, 28001, 28002)  
**U65:** no seed used · no Phase1/PROD claim

## Audit (pre-start)

| Port | Status |
|------|--------|
| 5173 | FREE |
| 5176 | FREE |
| 8080 | FREE |
| 28001 | FREE |
| 28002 | FREE |

## Startup executed

| Step | Command | Notes |
|------|---------|--------|
| 1 | `pnpm run dev` | FE + xbos-api turbo — Vite OK; **xbos-api** failed `Cannot find module …/dist/main` (empty/race `dist` after reboot) |
| 2 | `pnpm run dev:hrm-api` | Nest started on **:28001** |
| 3 | `pnpm --filter xbos-api run build` | Webpack emit `dist/main.js` |
| 4 | Kill stale xbos/turbo watchers that wiped FE when killing xbos race | Restored FE via step 5 |
| 5 | `pnpm run dev:web-only` | web-portal **:5173**, x-bos **:5176**, HRM vite **:8080** |
| 6 | `node dist/main.js` (cwd `apps/api/xbos-api`, `XBOS_BE_PORT=28002`) | Nest started on **:28002** (avoids nest `--watch` + `deleteOutDir` race) |

**SoT refs:** `docs/ops/LOCAL_DEV_STACK_L0.md`, `package.json` `dev` / `dev:hrm-api` / `dev:web-only`.

## Ports / processes (post-start)

| Service | Port / URL | Status |
|---------|------------|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | LISTEN · HTTP **200** |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | LISTEN · HTTP **200** |
| web-portal | `http://127.0.0.1:5173/` | LISTEN · HTTP **200** |
| x-bos-core | `http://127.0.0.1:5176/` | LISTEN · HTTP **200** |
| HRM vite | `http://127.0.0.1:8080/hr/` | LISTEN · HTTP **200** |

## Gate: `qc:dev-stack`

```
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173
HRM + XBOS healthy
```

| Run | Health lines | Process exit |
|-----|--------------|--------------|
| `pnpm run qc:dev-stack` | All ✓ HTTP 200 | Windows Node libuv assert after print (`UV_HANDLE_CLOSING`) — **not** API failure |
| `node ./scripts/qc-dev-stack.mjs` | All ✓ HTTP 200 | Same assert; treat L0 PASS from probe lines + ports LISTEN |

## Residual / ops notes

- After reboot, `nest start --watch` for **xbos-api** can report “Found 0 errors” then fail on missing `dist/main` if `compilerOptions.deleteOutDir` races with another watch / incomplete emit. Prefer one-shot `nest build` + `node dist/main.js` (or single watch) for L0 resume.
- Do **not** kill all `xbos-api`-matching node PIDs while `pnpm run dev` turbo parent owns FE filters — use `dev:web-only` + separate API processes when recovering.
- No seed. L0 only — QA owns L2.5 J-*.

## Verdict

**PASS_TO_PM** — local L0 stack resumed; all five ports listening + health 200.
