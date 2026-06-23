# P1-GAP-ACT-03-WF-REJECT-DEPLOY-8088 — portal-fe :8088 sync + recreate

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-03-WF-REJECT-DEPLOY-8088` |
| **role** | devops |
| **executed_at** | 2026-06-20T20:15+07 |
| **portal** | http://14.225.217.232:8088/ |
| **prior_handoff** | `docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r2-20260620.md` (FAIL_TO_PM — stale bundle) |
| **ack_status** | **READY_FOR_QA** |

---

## Executive summary

**PASS (deploy parity)** — VPS `:8088` now serves synced `CommandCenterPage.tsx` with `promptRejectInboxFromDrawer` + `Từ chối nhiệm vụ`; `WorkflowTaskDetailDrawer.tsx` includes `onRejectRequest`. Root cause was repo/volume drift (VPS on-disk had **0** matches pre-sync).

---

## Pre-deploy audit

| Check | Pre | Post |
|-------|-----|------|
| VPS disk `grep -c promptRejectInboxFromDrawer` CommandCenterPage | **0** | **2** |
| VPS disk `grep -c onRejectRequest` WorkflowTaskDetailDrawer | **0** | **3** |
| Served `/src/.../CommandCenterPage.tsx` | **NOT FOUND** | **2× promptRejectInboxFromDrawer**, **1× Từ chối nhiệm vụ** |
| Served `/src/.../WorkflowTaskDetailDrawer.tsx` | **NOT FOUND** | **2× onRejectRequest** |

---

## Actions executed

1. **pscp sync** (targeted — no `node_modules`):
   - `apps/web/web-portal/src/**` → `/opt/xevn-ecosystem/apps/web/web-portal/src`
   - `apps/web/web-portal/public/**`, `index.html`
2. **Vite cache clear:** `docker exec xevn-portal-fe-dev rm -rf .../node_modules/.vite`
3. **Force recreate:** `docker compose --env-file .env up -d --force-recreate --no-deps portal-fe`
4. **Smoke:** `:8088/` and `:8088/command-center` → **200** (Vite ready ~6s)

Note: `portal-fe` uses bind-mount + `node:22-alpine` (no Dockerfile build). `--no-cache build` N/A; volume sync + recreate is canonical fix.

---

## curl verification (exit criteria §3)

```bash
curl -s http://127.0.0.1:8088/src/pages/command-center/CommandCenterPage.tsx \
  | grep -oE 'promptRejectInboxFromDrawer|Từ chối nhiệm vụ' | head -5
# promptRejectInboxFromDrawer
# Từ chối nhiệm vụ
# promptRejectInboxFromDrawer

curl -s http://127.0.0.1:8088/src/pages/command-center/WorkflowTaskDetailDrawer.tsx \
  | grep -c onRejectRequest
# 2
```

| Symbol / text | Served count | PASS |
|---------------|--------------|------|
| `promptRejectInboxFromDrawer` | 2 | ✅ |
| `Từ chối nhiệm vụ` | 1 | ✅ |
| `onRejectRequest` (drawer) | 2 | ✅ |

---

## Safety / non-xevn

Non-xevn containers unchanged (tasmos_*, hsbx_*, …). No `docker compose down`.

---

## QA retest scope (U65 · browser-only · no seed)

| UF / AC | Persona | Click path |
|---------|---------|------------|
| **ACT-CC-WF-REJECT** / **AC-UX-CFM-01** | `ceo@xe.vn` | CC → inbox → **Mở chi tiết** → drawer **Từ chối** → expect `[role=alertdialog]` «Từ chối nhiệm vụ» + **Hủy** (no POST) → confirm → POST **201** + F5 |

**Residual (DevOps):** none — deploy parity closed. Business UF verdict = QA.

---

## Commands reference

```powershell
# pscp src only (Windows agent)
pscp -r -batch apps\web\web-portal\src root@14.225.217.232:/opt/xevn-ecosystem/apps/web/web-portal/
```

```bash
# VPS recreate
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --force-recreate --no-deps portal-fe
```
