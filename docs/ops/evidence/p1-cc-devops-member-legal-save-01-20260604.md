# VPS deploy evidence — P1-CC-DEVOPS-MEMBER-LEGAL-SAVE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-CC-DEVOPS-MEMBER-LEGAL-SAVE-01 |
| depends_on | P1-CC-BE-MEMBER-LEGAL-SAVE-01 |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| HEAD (VPS) | `89efcdd` |
| ack_status | **PASS_TO_PM** |

## BE commit pushed (prerequisite)

```text
89efcdd fix(xbos-api): group CEO member legal entity save scope (P1-CC-BE-MEMBER-LEGAL-SAVE-01)
```

Dev-BE evidence: `docs/qa/evidence/p1-cc-be-member-legal-save-01-20260604.md` (jest 26/26).

## VPS steps (minimal blast)

1. `git pull origin main` → fast-forward `d2c9715..89efcdd`
2. `node scripts/merge-vps-port-env.mjs --apply-canonical`
3. `docker compose --env-file .env up -d --build --force-recreate xbos-be` only (portal-fe/hrm-be untouched)

Script: `scripts/tmp-vps-deploy-xbos-member-legal-20260604.sh`

## Remote smoke (post recreate, sleep 40s)

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:28002/api/xbos/metrics` | 200 |
| `https://14-225-217-232.nip.io/api/xbos/metrics` | 200 |

## HTTPS functional probe (member save — primary exit)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-cc-member-legal-save-probe.mjs
```

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | PASS |
| GET flat member list (`xevn`/`main`) | 200, count=2 |
| PUT `/org-foundation/legal-entities/{xe-tmdv entity}` headers `x-tenant-id: xe-tmdv`, `x-company-id: main` | **200** `XBOS-ORG-201` |
| **409 SCOPE_CONTEXT_MISMATCH on PUT** | **none** (exit 0) |

Entity probed: `670b65a7-7cec-4449-a0f4-e01ff093269e` (tenant `xe-tmdv`).

## Note

`GET legal-entities/:id` with member partition headers still returns **409** on pilot (read path uses `readScope`; out of scope for this deploy — PUT save path fixed).

## Non-xevn containers

No `docker compose down`. Only `xevn-xbos-be-dev` recreated.

## Residual

- QA L2.5 UI save on `?settings=company_member_units` (browser) — recommend QA confirm banner-free save.
- Optional: align GET-by-id read scope for member partition headers (separate BE item if UI load-by-id fails).

## next_owner

qa — retest Command Center member unit form save on nip.io; then pm/qc as needed.
