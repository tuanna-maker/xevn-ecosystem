# DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01 — server-dev deploy evidence

**Date:** 2026-08-01 (Asia/Ho_Chi_Minh)  
**work_item_id:** `DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01`  
**program:** `P-HDSD-ECOSYSTEM-03`  
**from_role:** devops → pm  
**ack_status:** `PASS_TO_PM`

## Goal

Commit allow-list SoftDel + BH enroll (QA PASS), push `origin/main`, deploy VPS server-dev, smoke. Did not wait QC-BH-CLOSE / DTO residual.

## Commit

| Field | Value |
|-------|-------|
| SHA | `424ddafffa3e72e94bd12deb3d4fcfaac1895a0e` |
| short | `424ddaf` |
| message | `fix(hrm): soft-delete row menu + insurance enroll policy_id` |
| branch | `main` → `origin/main` |
| files | **16** (allow-list only; skipped untracked `docs/hrm/API_DESIGN_HRM_ERP_E3.md`) |

Allow-list paths committed:

- `apps/web/hrm/src/components/common/DataTable.tsx`
- `apps/web/hrm/src/components/common/DataTable.test.ts`
- `apps/web/hrm/src/pages/Employees.tsx`
- `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx`
- `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx`
- `apps/web/hrm/src/lib/insuranceParticipantLink.ts`
- `apps/web/hrm/src/lib/insuranceParticipantLink.test.ts`
- `apps/api/hrm-api/src/catalog-extensions/catalog-extensions.service.ts`
- `apps/api/hrm-api/src/catalog-extensions/d-hdsd-bf-03-bh-400-01.spec.ts`
- QA/QC evidence markdown under `docs/qa/evidence/*softdel*` / `*bh*` (7 files)

**Not committed:** dirty monorepo tree, secrets, `dist-uat`, `API_DESIGN_*`, accidental `scripts/tmp-p1-ex-qa-https-01-probe.mjs` (unstaged before final commit).

## Deploy steps

1. `pnpm run deploy:dev-server -- -SkipCommit -SkipPush` → **FAIL** (plink remoteCmd quoting: PowerShell expanded `$tmp` → bash `unexpected EOF`).
2. Manual plink + base64 remote script (skill-aligned): VPS `git stash` (local dirty blocked merge) → `git pull origin main` → `merge-vps-port-env.mjs --apply-canonical` → `docker compose up -d --build --remove-orphans`.
3. VPS HEAD after pull: `424ddaf`.
4. Post-recreate: `xbos-be` crash `Cannot find module .../dist/main` under `pnpm start:dev` watch.
5. Restored XBOS with **runtime** override (file not on `main`; local untracked `docker-compose.xbos-node.yml`):  
   `build && node dist/main.js` via `/tmp/docker-compose.xbos-node.yml` on VPS — **no** `docker compose down`; non-xevn left Up.

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
| http://14.225.217.232:8080/ | 302 on VPS curl; Invoke-WebRequest may surface redirect as error | PASS (VPS) |

### Containers

| Name | Status |
|------|--------|
| `xevn-hrm-be-dev` | Up (healthy) |
| `xevn-hrm-fe-dev` | Up |
| `xevn-portal-fe-dev` | Up |
| `xevn-xbos-be-dev` | Up (after build+node override) |
| `xevn-xbos-fe-dev` | Up |

Non-xevn still Up (sample): `ytexa_*`, `hsbx_*`, `asms_*`, `viconnec_web_prod` — **no** non-xevn stop.

## Residual / follow-ups (not blocking SoftDel+BH UAT)

1. **`scripts/deploy-dev-server.ps1` remoteCmd quoting** — `$tmp` expanded by PowerShell; SkipCommit path broken until fixed (separate WI).
2. **`xbos-be` `start:dev` on VPS** — watch can fail `dist/main`; prefer committed `docker-compose.xbos-node.yml` override on `main` (currently local `??` only).
3. VPS stash left: `stash@{0}: DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01-pre-pull` — do not blind `stash pop` onto SoftDel files.

## URLs for sponsor / QA

- Portal: http://14.225.217.232:8088  
- HRM embed: http://14.225.217.232:8080  
- HRM API: http://14.225.217.232:3001  
- XBOS API: http://14.225.217.232:28002  

## Handoff

- **completion_report:** SoftDel+BH slice on `main` @ `424ddaf`; server-dev rebuilt; HRM+portal+xbos smoke PASS; non-xevn intact.
- **next_owner:** `qa` (optional browser SoftDel+BH on :8088) or `pm`
- **ack_status:** `PASS_TO_PM`
