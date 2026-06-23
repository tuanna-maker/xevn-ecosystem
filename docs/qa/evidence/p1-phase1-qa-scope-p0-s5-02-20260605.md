# P1-PHASE1-QA-SCOPE-P0-S5-02 — Post-deploy scope parity retest

| Field | Value |
|-------|-------|
| work_item_id | P1-PHASE1-QA-SCOPE-P0-S5-02 |
| owner | qa |
| entry | `docs/ops/evidence/p1-phase1-do-hrm-scope-s5-02-20260605.md` (READY_FOR_QA) |
| pilot | `https://14-225-217-232.nip.io` |
| executed_at | 2026-06-05T01:56:54Z |
| ack_status | **PASS_TO_PM** |

## Environment

| Layer | Result | Notes |
|-------|--------|-------|
| L0 local `qc:dev-stack` | **SKIP** | not required — nip.io substitute per work_item |
| L0 nip.io substitute | **PASS** | portal **200**, hrm metrics **200**, xbos metrics **200** |

Accounts: `ceo@xe.vn` / `Xevn@2026`; `du-lich.ceo@xe.vn` / `Xevn@2026`

## Command

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-qa-scope-p0-s5-probe.mjs
# exit 0 — SCOPE_P0_S5_PROBE_OK
```

(QA executed equivalent from temp copy when local OneDrive path encoding blocked `cd`; script body matches repo `scripts/tmp-p1-phase1-qa-scope-p0-s5-probe.mjs`.)

## Verdict summary

| Item | Prior (QA-01) | This retest |
|------|---------------|-------------|
| **D-SCOPE-S5-HRM-RESTORE-01** | **OPEN** — member restore **201** `HRM-EMP-204` | **CLOSED** — **404** `HRM-EMP-404` |
| **TM-S5-P0-01** (HRM restore scope) | FAIL member cross-partition | **PASS** |
| **TM-S5-P0-02** (XBOS legal partition) | PASS | **PASS** |

## Results matrix

| Check | TM / defect | Result | Detail |
|-------|-------------|--------|--------|
| LOGIN-GROUP-CEO | — | **PASS** | HTTP **201** |
| LOGIN-MEMBER-CEO | — | **PASS** | HTTP **201** |
| L0 portal + metrics | L0 | **PASS** | all **200** |
| HRM-RESTORE-CREATE | TM-S5-P0-01 | **PASS** | **201** `HRM-EMP-201` |
| HRM-RESTORE-ARCHIVE | TM-S5-P0-01 | **PASS** | **201** `HRM-EMP-203` |
| HRM-RESTORE-OOS-404 | TM-S5-P0-01 | **PASS** | **404** `HRM-EMP-404` |
| **HRM-RESTORE-MEMBER-CEO-OOS-BLOCKED** | **D-SCOPE-S5-HRM-RESTORE-01** | **PASS** | **404** `HRM-EMP-404` (was **201** pre-deploy) |
| HRM-RESTORE-SCOPED | TM-S5-P0-01 | **PASS** | **201** `HRM-EMP-204` |
| HRM-RESTORE-VISIBLE | TM-S5-P0-01 | **PASS** | GET **200** `HRM-EMP-200` |
| XBOS-GROUP-CEO-MEMBER-GET-200 | TM-S5-P0-02 | **PASS** | **200** `XE_DU_LICH` |
| XBOS-MEMBER-CEO-CROSS-PARTITION-409 | TM-S5-P0-02 | **PASS** | **409** `SCOPE_CONTEXT_MISMATCH` |
| XBOS-MEMBER-CEO-OWN-GET-200 | TM-S5-P0-02 | **PASS** | **200** `XBOS-ORG-200` |
| J-CC-03 KPI rollup | L2.5 | **PASS** | **200** `XBOS-KPI-202` |
| J-HRM-01 contract→employee | L2.5 | **PASS** | GET employee **200** |
| J-HRM-02 list→detail | L2.5 | **PASS** | list row → GET **200** |

**Probe exit code:** **0** · marker: `SCOPE_P0_S5_PROBE_OK`

## Defect closure — D-SCOPE-S5-HRM-RESTORE-01

- **Status:** **CLOSED** on pilot after `P1-PHASE1-DO-HRM-SCOPE-S5-02` hrm-be redeploy.
- **Repro no longer holds:** `du-lich.ceo@xe.vn` POST restore on group-archived holding employee → **404** `HRM-EMP-404` (not **201**).
- **Prior evidence:** `docs/qa/evidence/p1-phase1-qa-scope-p0-s5-20260605.md` (FAIL_TO_PM).

## Residual (out of work_item — not blocking PASS)

| Item | Owner | Notes |
|------|-------|-------|
| Push BE scope fix to `origin/main` | dev-be / PM | VPS at `68ec457` + pscp per DevOps — avoid drift on next pull |
| SA P0-3/P0-4 catalog-sync batch GET | sa | unchanged |
| Full L2 browser J-* matrix | qa | API spot-checks only this wave; browser L2.5 not re-run |

## completion_report

- **Closed:** Formal QA retest after DevOps hrm-be deploy; probe exit **0**; **D-SCOPE-S5-HRM-RESTORE-01** closed; **TM-S5-P0-01** and **TM-S5-P0-02** green on nip.io; J-CC-03 / J-HRM-01 / J-HRM-02 API parity spot-checks PASS.
- **Open:** None in scope for this work_item.

## next_owner

`qc` (optional S5 scope slice re-gate) → `pm`

## next_dispatch_prompt

```
work_item_id: P1-S5-QC-SCOPE-P0-02
from_role: qa
to_role: qc
entry_criteria: P1-PHASE1-QA-SCOPE-P0-S5-02 PASS_TO_PM — D-SCOPE-S5-HRM-RESTORE-01 closed on nip.io; probe exit 0; TM-S5-P0-01 member restore 404 HRM-EMP-404; TM-S5-P0-02 partition assert unchanged PASS; evidence docs/qa/evidence/p1-phase1-qa-scope-p0-s5-02-20260605.md
exit_criteria: QC audit TM-S5 P0 scope slice vs prior NO-GO/GWC; update docs/qa/PHASE1_GATE_REPORT.md if scope P0 promoted; GO or GO WITH CONDITIONS with residual list (main push, SA P0-3/4)
evidence_path: docs/qa/evidence/p1-phase1-qa-scope-p0-s5-02-20260605.md
ack_status: PASS_TO_PM or READY_FOR_PM
```

## pm_dispatch_hint

Promote **D-SCOPE-S5-HRM-RESTORE-01** closed in defect register; dispatch **dev-be** to merge/push hrm scope files to `main` before next VPS pull-only deploy.
