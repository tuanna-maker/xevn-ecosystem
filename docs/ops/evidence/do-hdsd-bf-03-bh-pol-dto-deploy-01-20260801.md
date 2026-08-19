# DO-HDSD-BF-03-BH-POL-DTO-DEPLOY-01 — server-dev deploy evidence

**Date:** 2026-08-01 (Asia/Ho_Chi_Minh)  
**work_item_id:** `DO-HDSD-BF-03-BH-POL-DTO-DEPLOY-01`  
**program:** `P-HDSD-ECOSYSTEM-03` · **closes:** `C-HOLD-DEPLOY-DTO`  
**from_role:** devops → pm  
**ack_status:** `PASS_TO_PM`

## Goal

Commit QC-closed insurance policy DTO residuals (create omit `insurer_label`; SM status-only PATCH + `company_id` on query), push `origin/main`, deploy VPS server-dev (`hrm-fe` + `portal-fe`), keep XBOS node override, smoke. No seed · no demote TC-049/025/041.

## Commit

| Field | Value |
|-------|-------|
| SHA | `294b9690522451112bad3ba0aa57b7c4a74b98e3` |
| short | `294b969` |
| parent SoftDel+BH | `424ddaf` (already on VPS) |
| message | `fix(hrm): insurance policy create/SM DTO payloads` |
| branch | `main` → `origin/main` |
| files | **7** (allow-list only) |

### Staged / committed

- `apps/web/hrm/src/lib/insurancePolicyPayload.ts` (new)
- `apps/web/hrm/src/lib/insurancePolicyPayload.test.ts` (new)
- `apps/web/hrm/src/integrations/hrmApi.ts` (modified)
- `docs/qa/evidence/d-hdsd-bf-03-bh-pol-dto-01-20260801.md`
- `docs/qa/evidence/qa-hdsd-bf-03-bh-pol-dto-ret-01-20260801.md`
- `docs/qa/evidence/qc-hdsd-bf-03-bh-pol-dto-close-01-20260801.md`
- `docs/ops/evidence/do-hdsd-mutate-softdel-bh-deploy-01-20260801.md`

### Skipped (clean / unchanged)

- `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx` — no local diff vs `424ddaf` (already on VPS from SoftDel+BH enroll wave)

**Not committed:** dirty monorepo (`.cursor/hooks*`, unrelated docs/apps).

## Deploy steps

1. `git push origin HEAD` → `424ddaf..294b969` on `main`.
2. Plink + **base64 remote script** (avoid `deploy-dev-server.ps1` `$tmp` quoting FAIL).
3. VPS: `git pull --ff-only origin main` → HEAD `294b969`.
4. `node scripts/merge-vps-port-env.mjs --apply-canonical` (ports unchanged: 8088/8080/5173/3001/28002).
5. First attempt with **only** `-f /tmp/docker-compose.xbos-node.yml` → **FAIL** (`xbos-be` has neither image nor build). Corrected to `-f docker-compose.yml` + optional override.
6. `docker compose … up -d --build --no-deps hrm-fe` then `portal-fe`; ensure `xbos-be` with `/tmp/docker-compose.xbos-node.yml`.
7. **No** `compose down`. Non-xevn left Up.
8. FE bind-mount `/opt/xevn-ecosystem` → `/app` — pull delivers DTO sources; container recreate restarts Vite.

## Smoke gates

### On VPS (127.0.0.1)

| Endpoint | Code | Verdict |
|----------|------|---------|
| `:3001/api/hrm/metrics` | 200 | PASS |
| `:28002/api/xbos/metrics` | 200 | PASS |
| `:28002` POST `/api/xbos/auth/login` | 201 | PASS |
| `:8088/` | 200 | PASS |
| `:8088/command-center` | 200 | PASS |
| `:8080/` | 302 | PASS (SPA redirect OK) |

### Workstation → public host

| URL | Code | Verdict |
|-----|------|---------|
| http://14.225.217.232:8088/ | 200 | PASS |
| http://14.225.217.232:8088/command-center | 200 | PASS |
| http://14.225.217.232:3001/api/hrm/metrics | 200 | PASS |
| http://14.225.217.232:28002/api/xbos/metrics | 200 | PASS |
| http://14.225.217.232:28002 login | 201 | PASS |
| http://14.225.217.232:8080/ | Invoke-WebRequest redirect quirk | PASS via VPS curl 302 |

### Source presence on VPS

- `apps/web/hrm/src/lib/insurancePolicyPayload.ts` present @ `294b969`
- Grep confirms create omits `insurer_label`; SM status-only PATCH notes

### Containers

| Name | Status |
|------|--------|
| `xevn-hrm-fe-dev` | Up (recreated) |
| `xevn-portal-fe-dev` | Up (recreated) |
| `xevn-xbos-be-dev` | Up (healthy) after override recreate |
| `xevn-hrm-be-dev` | Up (healthy) |
| `xevn-xbos-fe-dev` | Up |

Non-xevn still Up (sample): `ytexa_*`, `hsbx_*`, `asms_*`, `viconnec_web_prod`.

## Residual / follow-ups (non-blocking DTO hold)

1. **Compose override alone** — must always pair `-f docker-compose.yml -f /tmp/docker-compose.xbos-node.yml`.
2. **`scripts/deploy-dev-server.ps1` `$tmp` quoting** — still broken; prefer base64 plink until fixed.
3. Commit `docker-compose.xbos-node.yml` to `main` (still local/`/tmp` only) — separate WI.
4. Optional QA browser create/SM on :8088 — not required for this FE-rebuild exit.

## URLs

- Portal: http://14.225.217.232:8088  
- HRM embed: http://14.225.217.232:8080  
- HRM API: http://14.225.217.232:3001  
- XBOS API: http://14.225.217.232:28002  

## Handoff

- **completion_report:** DTO slice on `main` @ `294b969`; server-dev `hrm-fe`/`portal-fe` recreated; smoke PASS; `C-HOLD-DEPLOY-DTO` closable; XBOS override kept; no seed.
- **next_owner:** `pm` (close hold · Phase2 DONE stamp) or optional `qa` browser create/SM spot
- **ack_status:** `PASS_TO_PM`
