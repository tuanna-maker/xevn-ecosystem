# P1-PHASE1-DEVOPS-UAT-MOB-SEED-01 — Pilot mobile UAT seed

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-DEVOPS-UAT-MOB-SEED-01` |
| **from_role** | `devops` |
| **to_role** | `qa-device` |
| **date** | 2026-06-04 |
| **ack_status** | **READY_FOR_QA** |
| **verdict** | **PASS** |

## Root cause

- `seed-hrm-1000-uat-workforce.mjs` emitted `nguyen.van.an.####@xe.vn` while docs/QA persona is `uat.nv####@xe.vn` → **401** on pilot.
- UAT0001 had leave rows but **no** payslip / pending update-request for J-MOB-04/05.

## Fix

1. **`buildUatMobileEmail(seq)`** in `scripts/lib/uat-workforce.mjs` — new seeds use `uat.nv####@xe.vn`.
2. **`scripts/seed-hrm-uat-mob-pilot-qual.mjs`** (`pnpm run seed:hrm:uat-mob-pilot-qual`) — idempotent pilot patch:
   - Rename legacy `nguyen.van.an.0001@xe.vn` → `uat.nv0001@xe.vn` + `mobile_password_hash`
   - `payroll_payslips` ≥ 1, `attendance_update_requests` pending ≥ 1, `manager_id` link for approver list

## Gates (pilot `http://14.225.217.232:3001`)

| Check | Result |
|-------|--------|
| `POST /auth/mobile/login` `uat.nv0001@xe.vn` / `xevn-uat-2026` | **200** `HRM-AUTH-200` |
| Leave list | **6** |
| Payslips | **1** |
| Pending update-requests (manager) | **1** |
| `tmp-p1-resid-c03-probe.mjs` | **exit 0** |

Machine JSON: `docs/ops/evidence/p1-phase1-devops-uat-mob-seed-20260604.json`

## VPS execution

```bash
cd /opt/xevn-ecosystem && source deploy/xevn-ecosystem/.env
node scripts/seed-hrm-uat-mob-pilot-qual.mjs
HRM_API_BASE_URL=http://127.0.0.1:3001 HRM_MOBILE_EMAIL=uat.nv0001@xe.vn \
  HRM_MOBILE_PILOT_PASSWORD=xevn-uat-2026 node scripts/tmp-p1-resid-c03-probe.mjs
```

## completion_report

- Closed: pilot + local auth for `uat.nv0001@xe.vn`; J-MOB-04/05 API preconditions (payslip ≥1, pending ≥1).
- Open: **qa-device** R1 device L2.5 (`p1-phase1-qa-mob-jmob-20260604-r1.md`); full `seed:hrm:1000-uat` re-run on pilot optional for all 1000 `uat.nv####` rows (only UAT0001 qual patched).

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R1
from_role: pm
to_role: qa-device
entry_criteria: docs/ops/evidence/p1-phase1-devops-uat-mob-seed-20260604.md READY_FOR_QA — pilot uat.nv0001 login 200; payslips>=1; pending>=1
exit_criteria: adb clear vn.xevn.hrm.mobile → login uat.nv0001@xe.vn / xevn-uat-2026 on nip.io → J-MOB-03 leave detail + J-MOB-04 payslip detail + J-MOB-05 Duyệt PASS; evidence docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r1.md
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r1.md
```

## pm_dispatch_hint

Re-dispatch **qa-device** R1 only; **dev-be** not required unless R1 still 401 after `pm clear`.
