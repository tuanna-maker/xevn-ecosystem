# Evidence — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) Wave-15 seat #17 |
| **uc_ids** | `UC-BP-CORE-09c` |
| **depends_on** | SA-01 Option A CONFIRMED · `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md` · peer QC **`CORE09BQC1-MSLB05DZ`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

- **O1–O12 CONFIRMED** under Option A.
- Physical SoT: `POST/GET …/print-versions*` + `GET …/print-versions/:versionId/pdf` · server re-preview + `can_issue` · snapshot freeze · amend supersede · PREV remains ephemeral · PDF from snapshot only · Nest `/core` DENY.
- AC matrix: AC-CORE-09C-01..08 · EX-01..11 · VAL-CORE-VER-01..24 · crosswalk AC-CTR-PRINT-01/04/05/06/08.
- Journeys DRAFT: **J-HRM-CORE-09C-01..04** minted on `PROGRAM_JOURNEY_MAP.md` + `PILOT_BUSINESS_FLOW_BA_TRACE.md` §40.
- **ba-data HOLD** default (table LIVE `hrm_contract_print_versions` · no schema invent).
- **DENY:** invent 09d TPL as this WI DONE · claim CORE-09b=printable DONE · `contracts_printable_ready` · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · apps/**.
- **Carry OBS:** `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → peer **09d**.
- **Honesty:** all flags **false** · C-SLICE.
- **No** `apps/**` · **no** seed.

## completion_report

O1–O12 CONFIRMED for UC-BP-CORE-09c against SA Option A: physical POST/GET print-versions* + GET …/pdf · server can_issue · snapshot freeze · amend supersede · PREV ephemeral · PDF-from-snapshot · ba-data HOLD · J-HRM-CORE-09C-01..04 DRAFT · must_keep CORE-09b/09a/08/02/01 · Nest `/core` DENY · DENY 09d invent · CORE-09b≠printable · printable false · carry OBS → 09d · C-SLICE.

## next_owner

**ba-data** (HOLD default)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md · peer CORE-09b SEALED CORE09BQC1-MSLB05DZ
spec_ref: DB hrm_contract_print_versions LIVE · denorm pack/template on employee_contracts · F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · must_keep F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · SA/BA HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD schema / mega-EAV / second VER store / Nest /core table / wipe print_versions; RETAIN LIVE hrm_contract_print_versions + denorm cols
2) Cite physical columns already LIVE for issued VER snapshots (merged_fields_json · clauses_snapshot_json · compensation_snapshot_json · version_no · pack_code · status issued/superseded · pdf_artifact_ref)
3) Conditional UNLOCK ONLY if BA/QA proves VER/PDF field column gap — default = NOT unlock
4) RETAIN CORE-09b PACK+PREV ephemeral · CORE-09a clause body SoT + snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY
5) DENY invent 09d TPL as CORE-09c DONE · claim CORE-09b=printable · contracts_printable_ready · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip · apps/**
6) Carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY → peer 09d (not invent TPL DONE here)
7) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE save/PDF fidelity
```
