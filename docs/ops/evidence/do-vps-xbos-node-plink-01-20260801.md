# DO-VPS-XBOS-NODE-PLINK-01 — durable XBOS node override + plink SkipCommit

**Date:** 2026-08-01 (Asia/Ho_Chi_Minh)  
**work_item_id:** `DO-VPS-XBOS-NODE-PLINK-01`  
**program:** `P-HDSD-ECOSYSTEM-03`  
**from_role:** devops → pm  
**ack_status:** `PASS_TO_PM`

## Goal

1. Commit durable `deploy/xevn-ecosystem/docker-compose.xbos-node.yml` (no `/tmp` hack).
2. Fix `scripts/deploy-dev-server.ps1` so `-SkipCommit -SkipPush` works (PowerShell must not expand bash `$tmp`; tolerate plink/git stderr under `$ErrorActionPreference=Stop`).
3. Push + VPS pull/smoke; no `compose down`; non-xevn intact.

## Commits (main)

| SHA | Message | Files |
|-----|---------|-------|
| `1dad92a` | `fix(ops): durable xbos-node compose override + plink SkipCommit quoting` | `docker-compose.xbos-node.yml` + `deploy-dev-server.ps1` (`$tmp` single-quote build + compose override wire) |
| `837a0ee` | accidental wide commit (process defect) | **reverted** by `403dbe4` |
| `403dbe4` | `Revert "fix(ops): tolerate plink/git stderr…"` | undoes `837a0ee` product bleed |
| `ec2a3ec` | `fix(ops): tolerate plink/git stderr under ErrorAction Stop` | **1 file only** `scripts/deploy-dev-server.ps1` |

**HEAD after deploy:** `ec2a3ec` (lineage from SoftDel/DTO `294b969` → … → ops fixes).

**Net allow-list on HEAD:** durable xbos-node compose + plink `$tmp` quoting + stderr tolerance. Accidental insurance WIP from `837a0ee` **not** present on HEAD after revert.

## Script fixes

1. **`$tmp` quoting:** build `remoteCmd` from single-quoted fragments + concatenate `$b64` so PowerShell does not expand bash `$tmp` / `$?` (prior `unexpected EOF`).
2. **stderr:** temporarily `$ErrorActionPreference='Continue'` around plink so git progress on stderr does not abort as `NativeCommandError`.
3. **REMOTE_DEPLOY:** if `docker-compose.xbos-node.yml` exists, `docker compose -f docker-compose.yml -f docker-compose.xbos-node.yml …`; smoke ports use `28002` (not stale `3002`).

## Deploy

```text
pnpm run deploy:dev-server -- -SkipCommit -SkipPush
→ PASS (exit 0)
VPS: git pull 1dad92a..ec2a3ec ff-only
override: docker-compose.xbos-node.yml (xbos-be build+node)
```

Immediate in-script smoke showed `000` (containers still starting) — expected; post-boot smoke below.

## Smoke gates (post ~45s boot)

### Workstation → public

| URL | Code | Verdict |
|-----|------|---------|
| http://14.225.217.232:8088/ | 200 | PASS |
| http://14.225.217.232:8088/command-center | 200 | PASS |
| http://14.225.217.232:3001/api/hrm/metrics | 200 | PASS |
| http://14.225.217.232:28002/api/xbos/metrics | 200 | PASS |
| http://14.225.217.232:28002 login | 201 | PASS |
| http://14.225.217.232:8080/ | Invoke-WebRequest redirect quirk | PASS via VPS curl **302** |

### On VPS (127.0.0.1)

| Check | Result |
|-------|--------|
| HEAD | `ec2a3ec` |
| `docker-compose.xbos-node.yml` | PRESENT |
| `xbos-be` Cmd | `build && node dist/main.js` (not `start:dev`) |
| `:3001/api/hrm/metrics` | 200 |
| `:28002/api/xbos/metrics` | 200 |
| `:8088/` + command-center | 200 |
| `:8080/` | 302 |

### Non-xevn

Sample still Up: `ytexa_*`, `hsbx_*`, `asms_*`, `viconnec_web_prod` — **no** non-xevn stop · **no** `compose down`.

## Residual

1. Local stash `DO-VPS-XBOS-NODE-PLINK-01-pre-revert-wide` — dirty monorepo from before revert; do not blind `stash pop`.
2. History retains `837a0ee` + `403dbe4` pair (revert closed product bleed without force-push).
3. Optional: add brief sleep before in-script smoke so deploy script itself reports 200 (non-blocking).

## URLs

- Portal: http://14.225.217.232:8088  
- HRM embed: http://14.225.217.232:8080  
- HRM API: http://14.225.217.232:3001  
- XBOS API: http://14.225.217.232:28002  

## Handoff

- **completion_report:** Durable xbos-node override on `main`; SkipCommit plink path PASS; VPS @ `ec2a3ec` with build+node XBOS; smoke 8088/3001/28002 PASS; non-xevn intact; U65 no seed.
- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
