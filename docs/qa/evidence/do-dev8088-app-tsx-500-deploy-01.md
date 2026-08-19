# DO-DEV8088-APP-TSX-500-DEPLOY-01 — portal `:8088` Vite 500

| Meta | Value |
|------|--------|
| **When** | 2026-08-19 |
| **Host** | `http://14.225.217.232:8088/` |
| **ack_status** | PASS (hotfix pscp, không full git pull) |

## Root cause

Portal chạy **Vite bind-mount** (`xevn-portal-fe-dev`, host `8088→5173`). HTML nạp `/src/main.tsx` → transform `App.tsx` **500**:

`Failed to resolve import "./pages/command-center/CommandCenterInboxPage" from "src/App.tsx"`

VPS `/opt/xevn-ecosystem` HEAD `033efd1` **không có** file đó. Local `main` đã commit `d4de8a4d` nhưng **ahead 3** vs `origin/main`; `git push` treo (pack transcript quá lớn) → **không** push `main`.

## Fix (U65, không seed, không `compose down`)

1. `pscp` `CommandCenterInboxPage.tsx` → VPS command-center dir.
2. `docker restart xevn-portal-fe-dev`.
3. XBOS crash-loop `Restarting (1)`: thiếu `apps/api/xbos-api/scripts/verify-dist.mjs` (postbuild). `pscp` file → `docker restart xevn-xbos-be-dev`.
4. Non-xevn containers không đụng.

## Smoke (sau hotfix)

| URL | Code |
|-----|------|
| `GET /src/App.tsx` | **200** (trước **500**) |
| `GET /src/pages/command-center/CommandCenterInboxPage.tsx` | **200** |
| `GET /` · `/command-center` | **200** |
| `GET :3001/api/hrm/metrics` | **200** |
| `GET :28002/api/xbos/metrics` | **200** (trước connect fail) |

VPS git HEAD vẫn `033efd1` (drift file pscp vs origin). Full `git pull` + compose rebuild **chưa** chạy.

## Residual

- Local `main` **ahead 3** (gồm dump transcript) — **cấm** `git add -A` / push mù.
- Push origin khi đã tách commit portal/XBOS khỏi pack transcript.
- CC-embed / login browser L2.5 chưa chạy wave này.
