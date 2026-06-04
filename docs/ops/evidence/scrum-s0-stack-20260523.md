# Scrum S0 — L0 pilot stack evidence (P1-S0-DO-01)

**Date:** 2026-05-23  
**Owner:** DevOps  
**work_item_id:** P1-S0-DO-01  
**Sprint:** S0 | **Program:** PHASE1-SCRUM-S0  
**ack_status:** `PASS_TO_PM`

## Scope

Keep local pilot stack green for Scrum S0 (PM/QA L0 gate):

| Service | Port | Health path |
|---------|------|-------------|
| hrm-api | 28001 | `/api/hrm/` |
| xbos-api | 28002 | `/api/xbos/` |
| web-portal (Vite) | 5175 | `/` |

**Env source:** `deploy/xevn-ecosystem/.env` (present; `DB_HOST`, `HRM_BE_PORT`, `XBOS_BE_PORT`, `DB_NAME_HRM`, `DB_NAME_XBOS`, `XEVN_POC_DEV` confirmed — values not logged).

## Actions executed

1. `pnpm run qc:dev-stack` — exit **0** (xbos-api 200, web-portal 200).
2. Extended L0 smoke (business-flow-zero-defect gate expects HRM + XBOS + portal):
   - `GET http://127.0.0.1:28001/api/hrm/` → **200**
   - `GET http://127.0.0.1:28002/api/xbos/` → **200**
   - `GET http://127.0.0.1:5175/` → **200**
3. **Seeds:** Not required — APIs healthy; prior pilot evidence shows `ceo@xe.vn` membership present without re-seed. Re-run only if auth/tenant smoke fails: `pnpm seed:tenant-ceos` with deploy `.env` loaded.

## Gate table (L0)

| Gate | Command / check | Result |
|------|-----------------|--------|
| `qc:dev-stack` | `pnpm run qc:dev-stack` | **PASS** (exit 0) |
| HRM health | `:28001/api/hrm/` | **PASS** HTTP 200 |
| XBOS health | `:28002/api/xbos/` | **PASS** HTTP 200 |
| Portal | `:5175/` | **PASS** HTTP 200 |
| Deploy `.env` | `deploy/xevn-ecosystem/.env` exists | **PASS** |
| Seed | APIs up, no auth regression signal | **SKIP** (not needed) |

## Command transcript (`qc:dev-stack`)

```text
qc:dev-stack — xevn-ecosystem (XBOS + optional portal)

✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5175

XBOS healthy — có thể chấp nhận bước QC dev cho API.
```

## Notes

- `scripts/qc-dev-stack.mjs` does not probe HRM; L0 matrix in `business-flow-zero-defect-gate.mdc` requires all three — HRM verified separately above.
- Stack assumed already running from prior local pilot (`LOCAL-PILOT-STACK-01`); no restart performed this cycle.
- VPS deploy out of scope for S0 L0 local gate.

## Handoff

- **To:** PM → dispatch QA L1/L2 per `PHASE1_SCRUM_BOARD.md` when feature work lands.
- **Blockers:** None.
- **Residual risk:** If processes on 28001/28002/5175 stop, re-run `pnpm dev` / API `start:prod` per `docs/ops/evidence/local-pilot-stack-20260522.md`.
