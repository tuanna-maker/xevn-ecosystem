# Evidence — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) Wave-13 seat #15 |
| **uc_ids** | `UC-BP-CORE-09a` |
| **depends_on** | SA-01 Option A CONFIRMED · `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md` · peer QC **`CORE08QC1-MSL9BFFE`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

- **O1–O12 CONFIRMED** under Option A.
- Physical SoT: `/api/hrm/contracts-insurance/contract-clauses*` · Settings UX ≠ body SoT · draft in-place · issued bump-on-activate · `{{field}}` · soft retire · Nest `/core` DENY.
- AC matrix: AC-CORE-09A-01..09 · EX-01..10 · VAL-CORE-CL-01..24 · crosswalk AC-CTR-CL + AC-PLT-CTR-CL-01..06.
- Journeys DRAFT: **J-HRM-CORE-09A-01..04** minted on `PROGRAM_JOURNEY_MAP.md` + `PILOT_BUSINESS_FLOW_BA_TRACE.md` §38.
- **ba-data HOLD** default (tables LIVE · no mega-EAV).
- **DENY:** invent 09b/09c/09d · claim CORE-08=pillar DONE · note=FR-08 DONE · `contracts_printable_ready` · reopen J-CORE-08/02/01 · seed · apps/**.
- **Honesty:** all flags **false** · C-SLICE.
- **No** `apps/**` · **no** seed.

## completion_report

O1–O12 CONFIRMED for UC-BP-CORE-09a against SA Option A: physical contract-clauses* · Settings ≠ body SoT · draft F5 · issued CONFLICT→activate · snapshot freeze · `{{field}}` · soft retire · ba-data HOLD · J-HRM-CORE-09A-01..04 DRAFT · must_keep CORE-08/02/01 · Nest `/core` DENY · DENY 09b–09d invent · CORE-08≠pillar DONE · note≠FR-08 DONE · printable false · C-SLICE.

## next_owner

**ba-data** (HOLD default)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09a
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md · peer CORE-08 SEALED CORE08QC1-MSL9BFFE
spec_ref: DB hrm_contract_clauses LIVE · clauses_snapshot_json · F-CORE-CTR-CL-01..04 · BR-CTR-CL-01..04 · SA/BA O5 HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD mega clause-version EAV / second body SoT; RETAIN LIVE hrm_contract_clauses + print snapshot cols
2) Cite physical columns already LIVE (code title_vi body_vi clause_group apply_to_packs sort_order mandatory status version archived_at lineage) — DENY invent Nest /core table
3) Conditional UNLOCK prior-body admin history ONLY if BA/QA proves snapshot insufficient — default = NOT unlock
4) RETAIN CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY · snapshot freeze
5) DENY Settings/XBOS body SoT · 09b/09c/09d invent · claim CORE-08=pillar DONE · note=FR-08 DONE · contracts_printable_ready · reopen J-CORE-08/02/01 · seed · honesty flip · apps/**
6) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-CL-01..04 (or FE residual) — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE Settings residual
```
