# Evidence — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) Wave-14 seat #16 |
| **uc_ids** | `UC-BP-CORE-09b` |
| **depends_on** | SA-01 Option A CONFIRMED · `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md` · peer QC **`CORE09AQC1-MSLA4LX9`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

- **O1–O12 CONFIRMED** under Option A.
- Physical SoT: `GET …/pack-resolve` + `POST …/contracts/:id/preview` · pack MVP GENERAL/IT_OFFICE/DRIVER · ephemeral (no VER INSERT) · C&B `cb_masked` · mandatory `can_issue` · IT↔DRIVER clause diff · registry must_keep · Nest `/core` DENY.
- AC matrix: AC-CORE-09B-01..09 · EX-01..10 · VAL-CORE-PREV-01..24 · crosswalk AC-CTR-PRINT-01..03/06..08.
- Journeys DRAFT: **J-HRM-CORE-09B-01..04** minted on `PROGRAM_JOURNEY_MAP.md` + `PILOT_BUSINESS_FLOW_BA_TRACE.md` §39.
- **ba-data HOLD** default (tables LIVE · no schema invent).
- **DENY:** invent 09c VER/PDF · 09d TPL as this WI DONE · claim CORE-09a=printable DONE · `contracts_printable_ready` · reopen J-HRM-CORE-09A/08/02/01 · seed · apps/**.
- **Honesty:** all flags **false** · C-SLICE.
- **No** `apps/**` · **no** seed.

## completion_report

O1–O12 CONFIRMED for UC-BP-CORE-09b against SA Option A: physical pack-resolve + POST …/preview · pack MVP · ephemeral preview · C&B mask · mandatory can_issue · pack switch · registry must_keep · ba-data HOLD · J-HRM-CORE-09B-01..04 DRAFT · must_keep CORE-09a/08/02/01 · Nest `/core` DENY · DENY 09c/09d invent · CORE-09a≠printable · printable false · C-SLICE.

## next_owner

**ba-data** (HOLD default)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md · peer CORE-09a SEALED CORE09AQC1-MSLA4LX9
spec_ref: DB pack_rules · templates · clauses · contracts LIVE · F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · must_keep F-CORE-CTR-CL-01..04 · SA/BA HOLD

MISSION — Physical DATA lock (docs-only · HOLD default):
1) CONFIRM HOLD — no ADD schema / mega-EAV / second preview-persist store / Nest /core table; RETAIN LIVE hrm_contract_pack_rules + templates + clauses + contracts
2) Cite physical columns already LIVE for pack-resolve + ephemeral preview (no VER invent as 09b)
3) Conditional UNLOCK ONLY if BA/QA proves preview field column gap — default = NOT unlock
4) RETAIN CORE-09a clause body SoT + snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY
5) DENY invent 09c VER/PDF · 09d TPL as CORE-09b DONE · claim CORE-09a=printable · contracts_printable_ready · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/**
6) Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API RETAIN or Dev-FE preview fidelity
```
