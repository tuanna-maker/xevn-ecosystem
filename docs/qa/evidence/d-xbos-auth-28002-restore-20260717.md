# D-XBOS-AUTH-28002-RESTORE — XBOS auth restore on VPS

| Field | Value |
|---|---|
| `work_item_id` | `D-XBOS-AUTH-28002-RESTORE` |
| `date` | 2026-07-17 |
| `env` | VPS `14.225.217.232` · portal `http://14.225.217.232:8088` |
| `scope` | Restore/verify `xbos-be` on `:28002`; no seed; auth remains enabled |
| `ack_status` | **READY_FOR_QA** |

---

## Summary

`xbos-be` is restored on VPS and listening on `:28002`. Audit found `xevn-xbos-be-dev` already recreated recently with the known build-then-node override, so no extra restart was performed to avoid unnecessary service interruption.

No non-`xevn` containers were stopped or recreated.

---

## Commands executed

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
ss -tlnp
docker compose --env-file .env ps
docker logs --since 20m xevn-xbos-be-dev
```

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
python3 - <<'PY'
from pathlib import Path
for p in sorted(Path('.').glob('docker-compose*.yml')):
    print(p.name)
PY
docker inspect xevn-xbos-be-dev --format '{{json .Config.Cmd}}'
curl -sS -o /tmp/xbos-health.out -w '%{http_code}' http://127.0.0.1:28002/api/xbos/
curl -sS -o /tmp/portal-root.out -w '%{http_code}' http://127.0.0.1:8088/
curl -sS -o /tmp/portal-login.json -w '%{http_code}' \
  -X POST http://127.0.0.1:8088/api/xbos/auth/login \
  -H 'Content-Type: application/json' \
  --data '{"email":"ceo@xe.vn","password":"***"}'
```

---

## Audit results

| Check | Result |
|---|---|
| `xevn-xbos-be-dev` | `Up ... (healthy)` |
| Host mapping | `0.0.0.0:28002->28002/tcp`, `[::]:28002->28002/tcp` |
| Compose service | `xbos-be` |
| Override file present | `docker-compose.xbos-node.yml` |
| Runtime command | `corepack enable && cd /app/apps/api/xbos-api && rm -rf dist tsconfig.build.tsbuildinfo && pnpm run build && node dist/main.js` |
| Non-xevn containers | Still running; not touched |

Recent `xbos-be` logs show Nest boot completed and `POST /api/xbos/auth/login` returned `201`.

---

## Smoke results

| Smoke | Result |
|---|---|
| Direct XBOS health | `GET http://127.0.0.1:28002/api/xbos/` -> **200** |
| Portal root | `GET http://127.0.0.1:8088/` -> **200** |
| Portal login proxy | `POST http://127.0.0.1:8088/api/xbos/auth/login` -> **201** |
| JWT proof | `has_token=True`; token value not printed |

Portal login response keys observed without secrets: `success`, `code`, `message`, `timestamp`, `data.accessToken`, `data.user`, `data.memberships`, `data.defaultTenantId`, `data.defaultCompanyId`, `data.expiresInSec`.

---

## Gate table

| Gate | Verdict | Evidence |
|---|---:|---|
| Restore `xbos-be :28002` | PASS | Container healthy and port mapped `28002:28002` |
| Use build-then-node override | PASS | Runtime command is `pnpm run build && node dist/main.js` |
| Do not disable auth | PASS | Login requires auth endpoint and returns JWT via normal portal proxy |
| Portal remains up | PASS | `:8088/` returned 200 |
| No seed | PASS | No seed commands executed |
| No unrelated container touch | PASS | Audit only; no `docker compose down`; non-xevn containers remained running |

---

## Handoff packet

- `work_item_id:` `D-XBOS-AUTH-28002-RESTORE`
- `from_role:` devops
- `to_role:` qa
- `ack_status:` **READY_FOR_QA**
- `evidence_path:` `docs/qa/evidence/d-xbos-auth-28002-restore-20260717.md`
- `completion_report:` Restored state verified for `xbos-be` on `:28002`. Direct XBOS health is 200, portal root is 200, and portal proxy login for `ceo@xe.vn` returns 201 with JWT present. No seed used and no unrelated containers touched.
- `residual:` Browser-only QA still needs to resume `P1-HRM-FULL-MENU-QA-RETEST-01` checklist items 4b-7 from `docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md`.
- `next_owner:` qa
- `next_dispatch_prompt:` |
  ```text
  work_item_id: P1-HRM-FULL-MENU-QA-RETEST-RESUME-01
  from_role: pm
  to_role: qa
  entry_criteria: DevOps evidence docs/qa/evidence/d-xbos-auth-28002-restore-20260717.md shows xbos-be :28002 healthy, portal :8088 healthy, and portal POST /api/xbos/auth/login returns 201 with JWT present. U65 zero-seed; browser-only.
  task: Resume P1-HRM-FULL-MENU-QA-RETEST-01 residual checklist items 4b-7: Insurance happy/J-HRM-04, Internal services, Payroll "Trạng thái", Employees J-HRM-02 list-to-profile, and Báo cáo. Use login ceo@xe.vn through http://14.225.217.232:8088; observe FE after API 2xx and F5/navigate persistence where applicable.
  exit_criteria: Evidence update with browser click path, network 2xx/FE state, no auth 500, no seed, ack_status PASS_TO_PM or FAIL_TO_PM with residual owner.
  evidence_path: docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md
  ```
