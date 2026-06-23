# P1-PHASE1-QA-MOB-PENDING-PARITY-01 — C-MOBJOB-01 pending deploy parity

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-PENDING-PARITY-01` |
| **qc_condition** | **C-MOBJOB-01** (closed) |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **pilot_url** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |

---

## Scope

Confirm DevOps hook **`P1-PHASE1-DO-MOB-PENDING-PARITY-01`** (`docs/ops/evidence/p1-phase1-do-mob-pending-parity-20260604.md`):

1. nip.io manager pending **≥1** for `uat.nv0001` **without** manual `pnpm run seed:hrm:uat-mob-pilot-qual` in this QA session (pre-existing deploy/hook state).
2. After one **Duyệt** (approve), pending drains to **0**.
3. Re-running the hook seed path restores pending **≥1** (same as `bash /opt/xevn-ecosystem/scripts/vps-post-hrm-be-mob-pilot-qual.sh`).

**Journey:** supports **J-MOB-05** (manager approve) data precondition on pilot.

---

## Execution

| Step | Command / action | Result |
|------|------------------|--------|
| A — baseline | `HRM_API_BASE_URL=https://14-225-217-232.nip.io` `HRM_MOBILE_EMAIL=uat.nv0001@xe.vn` `node scripts/tmp-p1-resid-c03-probe.mjs` | exit **0** — pending **1**, payslips **1**, leave **6** |
| B — Duyệt | `node scripts/tmp-p1-phase1-qa-mob-pending-parity.mjs` phase B — `POST …/update-requests/:id/approve` | **201** `HRM-ATT-REQ-203`; pending **0** |
| C — hook restore | Same script phase C — `node scripts/seed-hrm-uat-mob-pilot-qual.mjs` (idempotent `SEED-MOB-UAT` → `status=pending`) | exit **0**; `pending_update_requests: 1` |
| D — final gate | Re-run `tmp-p1-resid-c03-probe.mjs` on nip.io | exit **0** — pending **1** |

Automation: `scripts/tmp-p1-phase1-qa-mob-pending-parity.mjs`  
Machine JSON: `docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.json`

---

## Gate table

| Check | PASS |
|-------|------|
| C-MOBJOB-01 baseline pending≥1 (nip.io, no manual seed this run) | ✅ |
| Duyệt consumes queue (pending→0) | ✅ |
| Idempotent seed restores pending≥1 | ✅ |
| C03 probe after restore | ✅ |

---

## Operator note (post-Duyệt)

Before the next **J-MOB-05** device pass, operators on VPS should run:

```bash
bash /opt/xevn-ecosystem/scripts/vps-post-hrm-be-mob-pilot-qual.sh
```

(or full `deploy.sh` after `hrm-be` recreate). QA verified the **same** seed script locally against the pilot DB wired in `deploy/xevn-ecosystem/.env`.

---

## completion_report

- **Closed:** **C-MOBJOB-01** — nip.io `uat.nv0001` pending parity; baseline, post-Duyệt drain, and hook-equivalent seed restore all **PASS**.
- **Open:** None for this work item. **C-MOBJOB-02** (push/FCM) unchanged per QC GWC.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-MOB-PENDING-PARITY-01
from_role: pm
to_role: qc
entry_criteria: docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.md PASS_TO_PM — C-MOBJOB-01 API phases A–D PASS on https://14-225-217-232.nip.io for uat.nv0001@xe.vn
exit_criteria: QC closes C-MOBJOB-01 on p1-phase1-qc-mob-jmob-20260604.md (or delta); optional qa-device J-MOB-05 spot if PM wants device evidence same day
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.md
```

## pm_dispatch_hint

Promote **C-MOBJOB-01** to closed in QC mobile gate doc; no **devops** unless C03 regresses after deploy without hook.
