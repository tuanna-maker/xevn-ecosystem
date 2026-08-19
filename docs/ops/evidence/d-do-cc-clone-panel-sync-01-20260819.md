# D-DO-CC-CLONE-PANEL-SYNC-01 — Command Center clone panel VPS sync

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-CC-CLONE-PANEL-SYNC-01` |
| **from_role** | pm |
| **to_role** | qa |
| **executed_at** | 2026-08-19 ~12:16–12:17 ICT |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed; no `pnpm seed:*`; no DB mutate |
| **portal** | http://14.225.217.232:8088/command-center |

---

## Executive summary

Vite on `:8088` returned **HTTP 500** for `CommandCenterPage.tsx` because `CommandCenterPage` (on git) imported `./CloneCatalogPanel` and `./CloneCatalogBundlePanel` that were **never committed**. VPS bind-mount therefore had no files. DevOps copied **4 source files** via `pscp` from local workspace → `/opt/xevn-ecosystem/`. Vite HMR picked them up; **portal-fe was not recreated**. Public smoke: Command Center shell **200**, page module **200** (not 500), clone panel module **200** (~70 KB JS, not 941-byte HTML fallback). HRM `:3001` and XBOS `:28002` remain **200**. Non-xevn containers untouched.

**Did not** `git pull` on VPS (dirty `?? CommandCenterInboxPage.tsx` preserved). **Did not** commit.

---

## Pre-sync audit

| Check | Result |
|-------|--------|
| VPS HEAD | `033efd13c24d282a3a85b63210c40e4b87d2a7d0` (`033efd1` — after origin `d4de8a4d`) |
| `xevn-portal-fe-dev` | Up (8088→5173), bind-mount `../..:/app` |
| `xevn-hrm-be-dev` | Up (healthy) 3001 |
| `xevn-xbos-be-dev` | Up (healthy) 28002 |
| Clone 4 files on VPS | **MISSING** (`ls` No such file) |
| `CommandCenterInboxPage.tsx` | Present (`??` untracked, 13613 bytes, 11:56) — **kept** |
| Non-xevn (asms / tasmos / viconnec / ytexa / hsbx / hospital-training / postgresql) | All **Up** |

Vite error class (pre-copy, `docker logs`):

```
[vite] Internal server error: Failed to resolve import "./CloneCatalogPanel" from "src/pages/command-center/CommandCenterPage.tsx". Does the file exist?
```

Timestamps in container TZ: `5:09:17 AM` and `5:11:21 AM` (before copy).

---

## Files copied (pscp, no git)

Source: local workspace (untracked). Destination: `root@14.225.217.232:/opt/xevn-ecosystem/...`

| Local path | VPS path | Bytes (ls) |
|------------|----------|------------|
| `apps/web/web-portal/src/pages/command-center/CloneCatalogPanel.tsx` | same under `/opt/xevn-ecosystem/` | 17989 |
| `apps/web/web-portal/src/pages/command-center/CloneCatalogBundlePanel.tsx` | same | 20011 |
| `apps/web/web-portal/src/integrations/configSyncCloneCatalog.ts` | same | 6987 |
| `apps/web/web-portal/src/integrations/configSyncCloneBundle.ts` | same | 9787 |

Post-copy `ls -la` on VPS: all 4 exist, mtime **Aug 19 12:16**. Git status now also `??` those 4 + InboxPage. HEAD **unchanged** `033efd1`.

`*.test.ts` not copied (not required for Vite boot).

---

## portal-fe recreate

**Skipped.** After copy, Vite logged `hmr update /src/App.tsx, /src/index.css` and module GETs returned 200. No `docker compose down`. No `up -d portal-fe`.

Container start time unchanged (still Up from prior recreate ~19 min before this wave).

---

## HTTP smoke

### Public host `14.225.217.232` (workstation)

| Endpoint | HTTP | Bytes | Verdict |
|----------|------|-------|---------|
| `http://14.225.217.232:8088/command-center` | **200** | 957 | SPA HTML shell (`<!DOCTYPE html>`, Vite inject) |
| `http://14.225.217.232:8088/src/pages/command-center/CommandCenterPage.tsx` | **200** | 1,992,442 | Vite JS (`createHotContext` … CommandCenterPage) — **not 500** |
| `http://14.225.217.232:8088/src/pages/command-center/CloneCatalogPanel.tsx` | **200** | 70,636 | `Content-Type: text/javascript` — **not** HTML fallback ~941 B |
| `http://14.225.217.232:8088/src/pages/command-center/CloneCatalogBundlePanel.tsx` | **200** | 81,447 | Vite JS module |
| `http://14.225.217.232:3001/api/hrm` | **200** | 157 | `HRM-HEALTH-200` |
| `http://14.225.217.232:28002/api/xbos/metrics` | **200** | 340 | `XBOS-METRICS-200` |

Same codes on VPS `127.0.0.1`.

CloneCatalogPanel response headers (VPS curl): `HTTP/1.1 200 OK`, `Content-Type: text/javascript`, `Content-Length: 70636`.

---

## Portal log snippet

**Pre-copy (still in `--since 10m` window — historical FAIL):**

```
5:09:17 AM [vite] Internal server error: Failed to resolve import "./CloneCatalogPanel" from "src/pages/command-center/CommandCenterPage.tsx". Does the file exist?
5:11:21 AM [vite] Internal server error: Failed to resolve import "./CloneCatalogPanel" from "src/pages/command-center/CommandCenterPage.tsx". Does the file exist?
```

**Post-copy (`docker logs --since 3m` at ~12:16 ICT):**

```
5:16:02 AM [vite] hmr update /src/App.tsx, /src/index.css
```

No new `Failed to resolve import "./CloneCatalogPanel"` after file land.

---

## Non-xevn intact (`docker ps`, names without `xevn-`)

All **Up** after wave: `ytexa_*`, `hospital-training-*`, `tasmos_*`, `viconnec_web_prod`, `hsbx_*`, `asms_frontend`, `asms_backend`. No stop/rm. No compose down.

---

## Residual (PM / dev-fe)

1. **Four files still untracked on local and now also `??` on VPS.** Next clean `git pull` on a fresh clone **will drop Command Center again** unless someone `git add` + commit when sponsor allows. Same class as `CommandCenterInboxPage.tsx` (already `??` on VPS, kept).
2. DevOps L0 only — **not** browser U65 (login → Command Center → no Vite overlay → F5). Handoff QA `QA-CC-8088-SMOKE-01`.
3. VPS HEAD `033efd1` unchanged; hotfix is bind-mount drift, not git.

---

## Cấm checklist

| Action | Done? |
|--------|-------|
| seed / fake DB | No |
| `docker compose down` | No |
| stop asms/tasmos/viconnec/postgresql | No |
| change ports | No |
| commit / push | No |
| business logic edits | No (copy-only) |

---

## Handoff

- **ack_status:** READY_FOR_QA
- **next_owner:** qa
- **evidence_path:** `docs/ops/evidence/d-do-cc-clone-panel-sync-01-20260819.md`
