# VPS deploy evidence — P1-CC-DEVOPS-LEGAL-TEST-DEPLOY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-CC-DEVOPS-LEGAL-TEST-DEPLOY-01 |
| depends_on | P1-CC-BE-MEMBER-LEGAL-SAVE-01 |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| HEAD (local + VPS) | `4e55d31` |
| ack_status | **PASS_TO_PM** |

## Commits pushed

```text
89efcdd fix(xbos-api): group CEO member legal entity save scope (P1-CC-BE-MEMBER-LEGAL-SAVE-01)
4e55d31 test(xbos-api): legal entity service spec + CC member-save probe (P1-CC-DEVOPS-LEGAL-TEST-DEPLOY-01)
```

Artifacts in `4e55d31`:

- `apps/api/xbos-api/src/org-foundation/org-foundation.service.spec.ts`
- `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts` (xe-du-lich regression)
- `scripts/tmp-cc-legal-entity-member-save-probe.mjs`
- `package.json` — `test:xbos:cc-member-save`, `test:xbos:legal-entity`, `test:xbos:cc-legal-crud`

## VPS steps (xbos-be only)

1. `git pull origin main` → fast-forward `89efcdd..4e55d31`
2. `node scripts/merge-vps-port-env.mjs --apply-canonical` (ports unchanged: XBOS_BE_PORT=28002)
3. `docker compose --env-file .env up -d --build --force-recreate xbos-be`

No `docker compose down`. Non-xevn containers untouched.

## Remote smoke (post recreate, sleep 45s)

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:28002/api/xbos/metrics` | 200 |
| `https://14-225-217-232.nip.io/api/xbos/metrics` | 200 |

## Primary exit — member save probe (4/4 PUT)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | PASS |
| GET group-member-units | 200, members=4 |
| PUT XE_TMDV (xe-tmdv) | **200** `XBOS-ORG-201` |
| PUT VISUN (visun) | **200** `XBOS-ORG-201` |
| PUT XE_DU_LICH (xe-du-lich) | **200** `XBOS-ORG-201` |
| PUT XE_VIETNAM (xe-vietnam) | **200** `XBOS-ORG-201` |
| POST-save reload group-member-units | 200 |
| **Exit code** | **0** |

No **409 SCOPE_CONTEXT_MISMATCH** on any member PUT.

## Residual

- QA L2.5 browser save on `?settings=company_member_units` — recommend confirm banner-free UI save (J-* if mapped).
- GET-by-id read scope for member partition headers may still 409 (separate BE item; out of scope for this deploy).

## next_owner

qa — L2 Command Center member unit form on nip.io; pm/qc per wave.
