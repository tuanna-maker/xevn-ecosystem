# QA — P1-PHASE1-DO-WF-MEMBER-SEED retest (localhost U32)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-DO-WF-MEMBER-SEED` |
| **batch** | `P1-PHASE1-QA-BATCH-RETST` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/ops/evidence/p1-phase1-do-wf-member-seed-20260606.md` |
| **matrix** | C-CRUDMAT-02 · **AC-CRUD-CC-WF-M-RD-01** · **AC-CRUD-CC-WF-M-U-01** |

## Verdict

**PASS_TO_PM** — Member CEO `du-lich.ceo@xe.vn` has **≥1** pending workflow task; instance **detail** and task **complete** (approve) both **200**; **C-CRUDMAT-02 seed gap CLOSED**; matrix cells promotable localhost U32.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| xbos-api | `http://127.0.0.1:28002` |
| Account | `du-lich.ceo@xe.vn` / `Xevn@2026` |
| Tenant | `xe-du-lich` |
| Scope | `company_id=main` (member unit) |

## L0 — Stack health

| Gate | Command | Result |
|------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |

## Pre-exercise — Pending task probe

Internal key probe before JWT exercise:

```
GET /api/xbos/workflow-engine/tasks?tenantId=xe-du-lich&status=pending&assigneeUserId=du-lich.ceo@xe.vn
→ HTTP 200, code=XBOS-WF-203, pending=2
```

Task exercised: `c3d66523-a4ab-4671-ae72-eefa8fcdc191` · instance `a05c8ee7-a9e7-45ee-a6db-58920adaed52`

## AC exercise — Member CEO workflow (API L2.5)

Probe: `QA_EMAIL=du-lich.ceo@xe.vn` `MASTER_TENANT_ID=xe-du-lich` `node scripts/tmp-p1-phase1-qa-wf-inbox-probe.mjs`

| AC / Journey | Action | HTTP | Code | Result |
|--------------|--------|------|------|--------|
| **AC-CRUD-CC-WF-M-RD-01** | `GET …/instances/{id}/detail` | **200** | `XBOS-WF-204` | **PASS** |
| **AC-CRUD-CC-WF-M-U-01** | `POST …/tasks/{id}/complete` `{ outcome: 'approved', hatKey: 'member_ceo' }` | **201** | `XBOS-WF-200` | **PASS** |
| List refresh | Pending after complete | — | `XBOS-WF-203` | **PASS** — task removed; pending **2→1** |

## Defects / matrix promotion

| ID | Prior symptom | Retest |
|----|---------------|--------|
| **C-CRUDMAT-02** | Member CEO **0** pending tasks — M-RD/M-U blocked | **CLOSED** — seed + exercise PASS |
| **AC-CRUD-CC-WF-M-RD-01** | No instance detail without seed | **PASS** localhost U32 |
| **AC-CRUD-CC-WF-M-U-01** | No approve path without seed | **PASS** localhost U32 |

## Residual

| ID | Owner | Note |
|----|-------|------|
| J-XBOS-01 browser | qa | API L2.5 PASS; CC inbox iframe click-path not re-run this batch |
| VPS/nip.io seed | devops | Local only verified; nip.io needs `seed:workflow:member-inbox` if empty |
| Re-approve retest | qa/devops | Approve consumes task — re-run `pnpm run seed:workflow:member-inbox` before next approve cycle |

---

**completion_report:** L0 **PASS**; member CEO pending **≥1**; **AC-CRUD-CC-WF-M-RD-01** detail **200** `XBOS-WF-204`; **AC-CRUD-CC-WF-M-U-01** complete **201** `XBOS-WF-200`; **C-CRUDMAT-02 CLOSED**. GWC: browser CC inbox UI not re-run.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-PHASE1-DO-WF-MEMBER-SEED` PASS_TO_PM — promote C-CRUDMAT-02 + Member CEO WF matrix cells localhost PASS; dispatch **qc** CRUD matrix gate if wave DoD requires; note approve consumed one task (1 pending remains); re-seed before next M-U retest.

**evidence_path:** `docs/qa/evidence/p1-phase1-qa-wf-member-retest-20260606.md`

**pm_dispatch_hint:** Member WF seed script `seed:workflow:member-inbox` is repeatable runbook; VPS parity on request.
