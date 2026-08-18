# D-OPS-REMOVE-NIPIO-01 — Remove nip.io from active source/config

**Date:** 2026-07-28  
**work_item_id:** D-OPS-REMOVE-NIPIO-01  
**from_role:** devops  
**ack_status:** READY_FOR_QA  
**HOLD_DEPLOY · U65 · NOT Phase1 DONE**

## Sponsor lock

TG-INTAKE-1785231917281 — bỏ hẳn hostname DNS tạm khỏi source + config runtime. Chỉ **local** + **dev** theo deploy SoT.

## Canonical URLs (SoT)

| Env | URL |
|-----|-----|
| Local portal | `http://127.0.0.1:5173` (or compose local ports) |
| VPS DEV portal | `http://14.225.217.232:8088` (`PORTAL_FE_PORT`) |
| VPS DEV HRM API (mobile direct) | `http://14.225.217.232:3001` (`HRM_BE_PORT`) |

## Grep proof (exit criteria)

```text
rg -n "nip\.io|14-225-217-232" apps scripts deploy
# → no matches

rg -n "nip\.io|14-225-217-232" **/.env.example*
# → no matches
```

**Result:** `GREP_ZERO_PASS apps+scripts+deploy+.env.example`

Historical evidence under `docs/qa/evidence/**` and `docs/ops/evidence/**` left unchanged (allowed).

## Smoke (L0 ops)

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://14.225.217.232:8088/command-center` | **200** |
| Probe default `PORTAL_DEV_URL` (unset → DEV SoT) | `http://14.225.217.232:8088` |
| Guard in `tmp-p1-ex-qa-https-01-probe.mjs` rejects `nip.io` in env | coded |

## Files changed (ops-owned + shared cleanup)

### deploy/
- `deploy/nginx/xevn-ecosystem-vhost.conf` — HTTP-only optional perimeter for `14.225.217.232`; TLS = corporate template comment only
- `deploy/nginx/xevn-ecosystem-vhost-http-only.conf` — `server_name 14.225.217.232`
- `deploy/nginx/upstream-replicas.conf` — comment cleanup

### scripts/
- `scripts/tmp-p1-ex-qa-https-01-probe.mjs` — default DEV `:8088`; fail if env contains forbidden DNS
- `scripts/stack-stability-login-probe.mjs`
- `scripts/qa-mobile-*.mjs`, `scripts/qa/*` leftovers
- `scripts/verify-qc-evidence-pack.mjs` — portal_url check accepts DEV IP/:8088 (not forbidden DNS)
- `scripts/qc-dev-stack.mjs`, `scripts/vps-p1-ex-do-prod-03-remote.sh`, `scripts/ops/p1-r3-do-01-b1-vps-phase-cd.sh`
- `scripts/lib/srs-bateco-body.mjs`, assorted `scripts/tmp-*`

### apps/ (config/runtime defaults + tests)
- Vite portal/HRM (already cleaned parallel FE; comments local/Docker only)
- Mobile: `pilotApiBase.ts`, `eas.json`, `build-apk.cjs`, `.env.example`, integration URL fixtures → deploy host
- CORS/spec comments scrubbed (`xbos-cors.spec.ts`, etc.)

### docs/ops (active runbooks, not evidence history)
- `docs/ops/LOCAL_DEV_STACK_L0.md` — VPS DEV section uses `:8088`
- `docs/ops/DEPLOY_GUIDE.md` — login/smoke examples without forbidden DNS

### hooks
- `.cursor/hooks/pm-dispatch-hint.mjs` — post-deploy smoke hint → DEV URL

## Residual

- VPS host nginx still may have **old** live cert/vhost for removed DNS until ops reloads from repo (HOLD_DEPLOY — not applied this wave).
- Mobile release uses cleartext `http://14.225.217.232:3001` — requires existing UAT cleartext allowlist (unchanged policy).
- Bus / `PM_INCIDENT_QUEUE.json` / historical evidence may still mention old hostnames (out of scope).

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: QA-OPS-REMOVE-NIPIO-01
role: qa
entry: docs/qa/evidence/d-ops-remove-nipio-01-20260728.md READY_FOR_QA; U65 zero-seed; HOLD_DEPLOY
exit:
  1) rg -n "nip\.io|14-225-217-232" apps scripts deploy → zero matches
  2) Confirm scripts/tmp-p1-ex-qa-https-01-probe.mjs default PORTAL_DEV_URL=http://14.225.217.232:8088 (or require env); setting PORTAL_DEV_URL with forbidden DNS exits 2
  3) Smoke: PORTAL_DEV_URL=http://14.225.217.232:8088 (or local http://127.0.0.1:5173) — login probe / L0 path; no forbidden DNS in runtime defaults
  4) Evidence docs/qa/evidence/qa-ops-remove-nipio-01-20260728.md; PASS_TO_PM
cấm: seed; claim Phase1/PROD; deploy
```
