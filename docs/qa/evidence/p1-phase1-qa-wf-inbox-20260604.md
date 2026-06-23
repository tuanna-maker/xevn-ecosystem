# P1-PHASE1-QA-WF-INBOX-01 — J-XBOS-01 workflow inbox approve (P0-CRUD-06)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-PHASE1-QA-WF-INBOX-01 |
| **date** | 2026-06-04 |
| **owner** | QA |
| **predecessor** | P1-PHASE1-FE-WF-INBOX-01 (`READY_FOR_QA`) |
| **matrix** | **P0-CRUD-06** · **AC-CRUD-CC-WF-G-U-01** · **BR-INBOX-01** · QC **C-CRUDQC-02** |
| **journey** | **J-XBOS-01** — pending list → instance detail → **POST complete** → pending refresh |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **verdict** | **PASS_TO_PM** |

## Environment

| Check | Command / target | Result |
|-------|------------------|--------|
| L0 | `pnpm run qc:dev-stack` | **exit 0** — hrm-api **28001**, xbos-api **28002** **200**; web-portal **5173** optional fetch failed (API path sufficient) |
| Seed | `pnpm seed:workflow:inbox` | **exit 0** — assignee `ceo@xe.vn`; pending tasks **80** after seed |
| Probe | `node scripts/tmp-p1-phase1-qa-wf-inbox-probe.mjs` | **PROBE_OK** (local xbos) |
| Pilot API | Same probe (login via xbos auth; stack local) | **PROBE_OK** — pending **11→10** after complete |

Build/trace: xbos-api on `127.0.0.1:28002`; no secrets in log.

## L2.5 — J-XBOS-01 (API contract = FE wired path)

Simulates portal strict inbox: list with `assigneeUserId`, open detail, **Hoàn thành** (`POST …/complete`), reload list.

| Step | Click path / API | HTTP | Code | Notes |
|------|------------------|-----:|------|-------|
| 1 List | `GET /api/xbos/workflow-engine/tasks?tenantId=xevn&status=pending&assigneeUserId=ceo@xe.vn` · hdr `x-company-id: main` | 200 | `XBOS-WF-203` | **12** pending (CEO assignee filter) |
| 2 Detail | `GET …/instances/{instanceId}/detail` | 200 | `XBOS-WF-204` | instance `6d2065d0-9fa6-481e-aad2-b020bcb3acea` |
| 3 Approve | `POST …/tasks/{taskId}/complete` body `{ userId, outcome: 'approved', hatKey? }` | **201** | **`XBOS-WF-200`** | task `0de2c555-f444-4fb5-9613-86b4a1772fa7` |
| 4 Refresh | Repeat list | 200 | `XBOS-WF-203` | **11** pending; completed task **removed** |

**409 / 54321:** none on exercised paths.

### Optional reject (spot)

| Step | API | HTTP | Code |
|------|-----|-----:|------|
| Từ chối | `POST …/tasks/{id}/reject` `{ userId, reason }` | **201** | **`XBOS-WF-205`** |

## P0-CRUD-06 promotion

| Before | After | Evidence |
|--------|-------|----------|
| **UNTESTED** — list probe only | **PASS** | Real pending step task; **POST complete** returns **`XBOS-WF-200`**; task leaves assignee pending list |

**C-CRUDQC-02** (workflow approve + seed, no mock-only): **closed** on API evidence. Strict UI (`VITE_ALLOW_MOCK_FALLBACK=false`) approve gating **not** re-run in browser this wave — inherited FE vitest **143/143** + build **0** from Dev-FE handoff.

## Regression commands

| # | Command | Exit |
|---|---------|-----:|
| 1 | `pnpm run qc:dev-stack` | **0** |
| 2 | `pnpm seed:workflow:inbox` | **0** |
| 3 | `node scripts/tmp-p1-phase1-qa-wf-inbox-probe.mjs` | **0** |

## Residual

| Item | Owner | Note |
|------|-------|------|
| Browser L2.5 click (drawer **Mở chi tiết** → **Hoàn thành**) | QA / optional | API probe matches FE `applyWorkflowInboxTaskDecision` contract |
| `pnpm run verify:capabilities --group A1` | QA | Not run; registry updated per FE evidence |
| Local portal **5173** down | DevOps | Optional for this API-first retest |
| `PROGRAM_JOURNEY_MAP` J-XBOS-01 | PM | Recommend **L2.5 PASS** (approve path), not only 🟡 partial list |

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/p1-phase1-qa-wf-inbox-20260604.md` |

### completion_report

- **Closed:** P0-CRUD-06 / J-XBOS-01 approve on real pending workflow step; **POST complete** **`XBOS-WF-200`**; list→detail→complete→refresh **PASS**; seed + L0 **PASS**.
- **Open:** Browser-network screenshot on nip.io CC rail (optional); capabilities group A1 verify; journey map status sync.

### next_owner

`pm`

### next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-CRUD-GATE-01
from_role: pm
to_role: qc
lane: governance

P0-CRUD-06 closed per docs/qa/evidence/p1-phase1-qa-wf-inbox-20260604.md (J-XBOS-01 approve POST XBOS-WF-200). Re-run CRUD gate: promote P0-CRUD-06 PASS, close C-CRUDQC-02 if no other UNTESTED P0 blocks. Update PHASE1_CRUD_ACCEPTANCE_MATRIX.md row P0-CRUD-06. Optional: ba-process matrix sync. Do not claim Phase 1 DONE.
```

### pm_dispatch_hint

- **qc** `P1-PHASE1-QC-CRUD-GATE-01` — C-CRUDQC-02 closure
- **ba-process** — sync `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` P0-CRUD-06 → **PASS**
- **pm** — promote `PROGRAM_JOURNEY_MAP` **J-XBOS-01** L2.5 after QC concurrence
