# P1-PHASE1-QA-SCOPE-P0-S5-01 — Post-S5 scope parity retest

| Field | Value |
|-------|-------|
| work_item_id | P1-PHASE1-QA-SCOPE-P0-S5-01 |
| owner | qa |
| entry | `docs/qa/evidence/p1-phase1-be-scope-p0-s5-20260605.md` (READY_FOR_QA) |
| pilot | `https://14-225-217-232.nip.io` |
| executed_at | 2026-06-05T01:46–01:48Z |
| ack_status | **FAIL_TO_PM** |

## Environment

| Layer | Result | Notes |
|-------|--------|-------|
| L0 local `qc:dev-stack` | **SKIP** | exit **1** — hrm/xbos/portal down locally |
| L0 nip.io substitute | **PASS** | portal **200**, hrm metrics **200**, xbos metrics **200** (transient hrm **502** on one retry) |

Accounts: `ceo@xe.vn` / `Xevn@2026`; `du-lich.ceo@xe.vn` / `Xevn@2026`

## Commands

```bash
# Primary probe
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-phase1-qa-scope-p0-s5-probe.mjs

# XBOS regression
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs

# Isolated member-restore IDOR repro
node -e "<inline — see § Defect>"
```

## Results matrix

| Criterion | TM ID | Result | Evidence |
|-----------|-------|--------|----------|
| Group CEO scoped restore archived employee | TM-S5-P0-01 | **PASS** | `HRM-EMP-204` **201** → GET **200** (`R1` 01:46:01Z) |
| Out-of-scope restore (phantom UUID) | TM-S5-P0-01 | **PASS** | `HRM-EMP-404` **404** |
| Member CEO restore cross-partition employee | TM-S5-P0-01 | **FAIL** | **D-SCOPE-S5-HRM-RESTORE-01** — see § Defect |
| Group CEO GET member legal-entity UUID | TM-S5-P0-02 | **PASS** | **200** `XE_DU_LICH` |
| Member CEO cross-partition legal GET | TM-S5-P0-02 | **PASS** | **409** `SCOPE_CONTEXT_MISMATCH` (xevn/main headers) |
| Member CEO own legal GET | TM-S5-P0-02 | **PASS** | **200** `XBOS-ORG-200` |
| J-CC-03 KPI rollup | journey | **PASS** | **200** `XBOS-KPI-202` |
| J-HRM-01 contract→employee | journey | **PASS** | list FK → GET employee **200** |
| J-HRM-02 list→detail | journey | **PASS** | list row → GET **200** |
| `tmp-phase1-be-scope-crud-probe` | regression | **PASS** | exit **0** `PROBE_OK` |

## Defect — D-SCOPE-S5-HRM-RESTORE-01 (P0)

**Summary:** Member CEO (`du-lich.ceo@xe.vn`, tenant `xe-du-lich`) can **restore** a group-created archived employee in the **holding / xevn** partition.

**Repro (isolated, 2026-06-05T01:48Z):**

1. Login `ceo@xe.vn` → POST employee `company_id=main` → persisted `company_id=holding`, `custom_fields.tenant_id=xevn`
2. POST archive → **201** `HRM-EMP-203`
3. Login `du-lich.ceo@xe.vn` → POST `/employees/{id}/restore?company_id=main` → **201** `HRM-EMP-204` (**unexpected**)
4. Group CEO restore same id → **409** `HRM-EMP-409` (already active — side effect of step 3)

**Expected:** **404** `HRM-EMP-404` or **409** `HRM-SCOPE-409` / `HRM-EMP-409` per `hrm-list-scope.spec.ts` `member CEO scope rejects holding employee restore guard`.

**Tag:** `scope_parity` · **owner:** `dev-be` · **retest after:** fix + optional `devops` hrm-be nip.io redeploy

**Note:** XBOS legal-entity partition assert (TM-S5-P0-02) is **live on pilot** — no xbos-be redeploy required for that slice. HRM restore scope fix is **not fully enforced** on pilot for member CEO cross-partition path.

## Deploy assessment

| Service | Redeploy needed? | Rationale |
|---------|------------------|-----------|
| xbos-be | **No** | TM-S5-P0-02 partition assert verified **409** live |
| hrm-be | **Likely yes** after BE fix | TM-S5-P0-01 member-restore IDOR reproduces on current pilot; group-CEO restore path works (partial) |

## Residual (out of work_item)

- SA audit P0-3/P0-4 (`catalog-sync`, `settings-catalogs` batch GET) — unchanged per BE handoff
- Transient nip.io hrm **502** (~8s cooldown) — infra flake, not scope defect

## completion_report

- **Closed:** L0 nip.io; XBOS TM-S5-P0-02 (group GET **200**, member cross-partition **409**); J-CC-03 / J-HRM-01 / J-HRM-02 API spot-checks; group CEO restore happy path; phantom-id **404**.
- **Open:** **D-SCOPE-S5-HRM-RESTORE-01** — member CEO cross-partition employee restore **201** on pilot.

## next_owner

`dev-be` (fix + READY_FOR_QA) → `devops` (hrm-be redeploy if VPS image stale) → `qa` (retest)

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-BE-SCOPE-P0-S5-02
from_role: qa
to_role: dev-be
entry_criteria: QA FAIL D-SCOPE-S5-HRM-RESTORE-01 — du-lich.ceo@xe.vn POST restore on group holding employee returns 201 HRM-EMP-204 on nip.io; evidence docs/qa/evidence/p1-phase1-qa-scope-p0-s5-20260605.md
exit_criteria: member CEO restore on holding/xevn archived employee → 404 or HRM-SCOPE-409; jest hrm-list-scope + employees.service.spec green; READY_FOR_QA with evidence_path
evidence_path: docs/qa/evidence/p1-phase1-be-scope-p0-s5-20260605.md (append fix section)
ack_status: READY_FOR_QA
Fix restoreEmployee assertResourceInHrmScope for member CEO on holding partition rows (TM-S5-P0-01). After fix dispatch devops hrm-be redeploy to nip.io if VPS not auto-synced.
```

## pm_dispatch_hint

`P1-PHASE1-BE-SCOPE-P0-S5-02` — close **D-SCOPE-S5-HRM-RESTORE-01** before QC promotes TM-S5 P0 closure.
