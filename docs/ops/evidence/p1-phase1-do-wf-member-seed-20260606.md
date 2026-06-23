# P1-PHASE1-DO-WF-MEMBER-SEED — Member CEO workflow inbox seed (C-CRUDMAT-02)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-DO-WF-MEMBER-SEED` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | `2026-06-06` |
| **stack** | Local `xbos-api` `:28002` |
| **ack_status** | **READY_FOR_QA** |

---

## Problem

Member CEO `du-lich.ceo@xe.vn` had **0** pending workflow tasks on `tenantId=xe-du-lich`, blocking:

| AC | Exercise blocked |
|----|------------------|
| **AC-CRUD-CC-WF-M-RD-01** | `GET …/instances/{id}/detail` |
| **AC-CRUD-CC-WF-M-U-01** | `POST …/tasks/{id}/complete` (approve) |

Existing `pnpm seed:workflow:inbox` seeds **Group CEO** (`ceo@xe.vn`, tenant `xevn`) only.

---

## Runbook command (local L0)

**Prerequisite:** `xbos-api` listening on `:28002` (`pnpm dev:xbos-api` or `pnpm dev`).

```bash
# Seed ≥1 pending task for member CEO
pnpm run seed:workflow:member-inbox

# Optional overrides (defaults shown)
SEED_TENANT_ID=xe-du-lich SEED_COMPANY_ID=main SEED_USER_ID=du-lich.ceo@xe.vn pnpm run seed:workflow:member-inbox
```

**Verify (internal key):**

```bash
curl -s -H "x-internal-api-key: xevn-dev-internal-key" \
  "http://127.0.0.1:28002/api/xbos/workflow-engine/tasks?tenantId=xe-du-lich&status=pending&assigneeUserId=du-lich.ceo@xe.vn"
# Expect: code=XBOS-WF-203, data.items.length >= 1
```

**Portal exercise (QA L2.5):** Login `du-lich.ceo@xe.vn` / `Xevn@2026` → Command Center inbox → open task → detail + approve.

---

## Artifacts added

| Path | Purpose |
|------|---------|
| `scripts/seed-workflow-member-inbox.mjs` | Idempotent member-tenant WF definition + instance + pending step |
| `package.json` → `seed:workflow:member-inbox` | Repeatable runbook entry |

---

## Execution log (2026-06-06)

| Step | Result |
|------|--------|
| L0 `GET /api/xbos/metrics` `:28002` | **200** |
| Pre-seed probe pending count | **0** (`XBOS-WF-203`) |
| `pnpm run seed:workflow:member-inbox` | **exit 0** |
| Post-seed verify GET tasks | **1** pending task |

### Seeded entities

| Entity | ID |
|--------|-----|
| Definition | `f18aa2c8-e449-4bac-a186-4be68162e6bb` (`WF-MEMBER-INBOX-DEMO`) |
| Instance | `58a835fc-4879-4c2b-8abd-9117f40debb6` |
| Pending task | `6a7aace6-8352-407d-ac5a-702b36581270` |

Task fields: `tenant_id=xe-du-lich`, `company_id=main`, `assignee_user_id=du-lich.ceo@xe.vn`, `hat_key=member_ceo`, `business_type=member_governance`.

---

## Gate table

| Gate | Command / check | Result |
|------|-----------------|--------|
| L0 Stack | `GET http://127.0.0.1:28002/api/xbos/metrics` | **PASS** 200 |
| Seed | `pnpm run seed:workflow:member-inbox` | **PASS** exit 0 |
| Verify | `GET …/tasks?tenantId=xe-du-lich&status=pending&assigneeUserId=du-lich.ceo@xe.vn` | **PASS** count ≥ 1 |

---

## Residual

| Item | Owner | Note |
|------|-------|------|
| **C-CRUDMAT-02** matrix promotion | **qa** | Retest M-RD-01 + M-U-01 on local/nip.io; promote GWC → PASS |
| VPS/nip.io seed | **devops** (on request) | Local only this wave; VPS needs same script if member inbox empty there |
| J-XBOS-01 L2.5 browser | **qa** | Approve consumes task — re-run seed before each approve retest |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Closed P1-PHASE1-DO-WF-MEMBER-SEED: added `seed:workflow:member-inbox`, seeded 1 pending WF task for `du-lich.ceo@xe.vn` on local `:28002`; verify GET returns `XBOS-WF-203` with count=1. C-CRUDMAT-02 seed gap closed; AC promotion awaits QA retest. |
| **next_owner** | `qa` |
| **next_dispatch_prompt** | Task qa — work_item_id P1-PHASE1-QA-WF-MEMBER-RETEST: entry_criteria docs/ops/evidence/p1-phase1-do-wf-member-seed-20260606.md READY_FOR_QA + local xbos :28002 up. Run probe then exercise AC-CRUD-CC-WF-M-RD-01 (`GET …/instances/58a835fc-4879-4c2b-8abd-9117f40debb6/detail` as member JWT) and AC-CRUD-CC-WF-M-U-01 (`POST …/tasks/6a7aace6-8352-407d-ac5a-702b36581270/complete` with `du-lich.ceo@xe.vn` + `hatKey=member_ceo`). If approve consumes task, re-run `pnpm seed:workflow:member-inbox` before second pass. Promote C-CRUDMAT-02 + matrix §3 Member CEO WF cells on PASS. evidence_path docs/qa/evidence/p1-phase1-qa-wf-member-retest-20260606.md ack_status PASS_TO_PM or FAIL_TO_PM. |
| **evidence_path** | `docs/ops/evidence/p1-phase1-do-wf-member-seed-20260606.md` |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | P1-PHASE1-QA-WF-MEMBER-RETEST — close C-CRUDMAT-02 after M-RD/M-U exercised |
