# P1-PHASE1-DO-MOB-PENDING-PARITY-01 — Mobile pending queue deploy parity

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-DO-MOB-PENDING-PARITY-01` |
| **qc_condition** | **C-MOBJOB-01** |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-06-04 |
| **pilot_url** | `https://14-225-217-232.nip.io` |
| **ack_status** | **READY_FOR_QA** |
| **verdict** | **PASS** |

---

## Problem (QC)

After `hrm-be` recreate or pilot drift, nip.io manager probe showed `pending=0` until operators ran manual `pnpm run seed:hrm:uat-mob-pilot-qual`. J-MOB-05 device tests failed when the pending queue was empty.

## Solution

| Artifact | Purpose |
|----------|---------|
| `scripts/vps-post-hrm-be-mob-pilot-qual.sh` | Idempotent seed + `tmp-p1-resid-c03-probe.mjs` gate (`pending>=1`) |
| `deploy/xevn-ecosystem/deploy.sh` | Runs hook automatically after HRM API returns 200 |
| `docs/ops/DEPLOY_GUIDE.md` | Documents manual rerun after `--force-recreate hrm-be` |
| `pnpm run ops:vps:post-hrm-mob-pilot-qual` | Local/VPS alias for the hook |

Skip hook (debug only): `XEVN_SKIP_MOB_PILOT_QUAL=1`.

### After `hrm-be` recreate only

```bash
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --force-recreate hrm-be
# wait for GET http://127.0.0.1:${HRM_BE_PORT:-3001}/api/hrm/ → 200
bash /opt/xevn-ecosystem/scripts/vps-post-hrm-be-mob-pilot-qual.sh
```

### Post-approve behaviour

Manager **Duyệt** correctly sets the seeded request to `approved` → API `pending=0`. Before the next J-MOB-05 run, re-run the same hook (or full deploy) — seed resets `SEED-MOB-UAT` row to `pending` without wiping pilot DB.

---

## VPS verification (2026-06-04)

| Step | Result |
|------|--------|
| `seed-hrm-uat-mob-pilot-qual.mjs` on VPS | **PASS** — `pending_update_requests: 1`, `ceo_payslips: 1` |
| C03 probe `http://127.0.0.1:3001` | **PASS** — pending **1**, exit **0** |
| C03 probe `https://14-225-217-232.nip.io` | **PASS** — pending **1**, exit **0** |
| `xevn-hrm-be-dev` | **Up (healthy)** |

Machine JSON: `docs/ops/evidence/p1-phase1-do-mob-pending-parity-20260604.json`

---

## Gate table

| Gate | Result |
|------|--------|
| Deploy hook documented + scripted | **PASS** |
| Hook wired in `deploy.sh` | **PASS** |
| VPS seed + loopback probe | **PASS** |
| VPS nip.io probe | **PASS** |
| Non-xevn containers untouched | **PASS** |

---

## completion_report

- **Closed:** QC **C-MOBJOB-01** — automated post-HRM seed/probe on VPS; no manual `seed:hrm:uat-mob-pilot-qual` required after standard deploy or documented `hrm-be` recreate path.
- **Open:** QA must confirm J-MOB-05 on device **after** hook (not mid-approve with consumed queue); CRLF on Windows-uploaded `.sh` — strip with `sed -i 's/\r$//'` if hook fails on VPS.

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-PENDING-PARITY-01
from_role: pm
to_role: qa
entry_criteria: docs/ops/evidence/p1-phase1-do-mob-pending-parity-20260604.md READY_FOR_QA; VPS hook PASS — nip.io uat.nv0001 pending>=1 (C03 probe exit 0)
exit_criteria: On https://14-225-217-232.nip.io confirm GET manager pending update-requests >=1 without manual seed before J-MOB-05; after one Duyệt, document that re-running bash /opt/xevn-ecosystem/scripts/vps-post-hrm-be-mob-pilot-qual.sh restores pending; update QC C-MOBJOB-01 row if PASS; evidence docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.md; ack PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.md
```

## pm_dispatch_hint

Dispatch **qa** (API + optional qa-device J-MOB-05) to close **C-MOBJOB-01**; no further **devops** unless probe regresses after deploy without hook.
