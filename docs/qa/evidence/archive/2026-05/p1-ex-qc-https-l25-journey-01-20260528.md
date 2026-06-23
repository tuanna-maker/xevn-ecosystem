# P1-EX-QC-HTTPS-L25-JOURNEY-01 — L2.5 data-aware journey gate

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-L25-JOURNEY-01` |
| from_role | `pm` |
| to_role | `qc -> pm` |
| date | `2026-05-28` |
| owner | `qc` |
| scope | HTTPS L2.5 journey slice (`ceo@xe.vn`, `company_id=main`) |
| entry_criteria | QA data-aware L2.5 wave completed (`P1-EX-QA-HTTPS-L25-DATA-JOURNEY-01` intake mapped to latest QA evidence chain) |

## Evidence audited

1. `docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r2-20260528.md`
2. `docs/qa/evidence/p1-ex-qa-https-residual-03-r1-20260528.md`
3. `docs/program/PROGRAM_JOURNEY_MAP.md`
4. `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`

## Executive verdict

**Decision: NO-GO (for L2.5 journey closure claim).**

Rationale:
- QA confirmed auth regression closure on list APIs (5/5 `200`) for `P-CC-04..08`.
- However, mandatory L2.5 cross-navigation journeys remain non-executable in this wave (all relevant lists returned `rowCount=0`).
- Additional runtime blocker remains on attendance path (`127.0.0.1:54321` fallback traffic and in-session attendance probe `401`), so journey reliability is not yet clean.
- Under U19 L2.5 rule, mandatory J-* not executed with real list->detail evidence cannot be promoted as closed.

## L2.5 adjudication table

| Area | Result | QC assessment |
|---|---|---|
| L2 list API auth (`P-CC-04..08`) | PASS | 5/5 endpoints `200`, no `HRM-AUTH-001` regression on list APIs |
| L2.5 list->detail executability (`J-HRM-01,03,04,05,06,07`) | FAIL | Not executable in QA run due `rowCount=0`; no click-path evidence |
| Attendance runtime hygiene (`J-HRM-06` readiness) | FAIL | Residual fallback calls to `127.0.0.1:54321` and runtime attendance probe `401` |
| Mandatory journey closure claim | FAIL | Not enough evidence to mark L2.5 closure |

## Closure vs remaining blockers classification

### Closed
- **Runtime auth regression closure (list API level):**
  - `contracts`, `insurance`, `requisitions`, `attendance records`, `payslips` all return `200`.
  - This closes the prior auth blocker for list endpoint access.

### Remaining blockers

1. **data blocker**
   - Journey rows not available (`rowCount=0`) across targeted modules.
   - Effect: cannot execute mandatory list->detail L2.5 journeys.

2. **seed blocker**
   - Dataset not sufficient for deterministic L2.5 click-path execution (`J-HRM-01,03,04,05,06,07`).
   - Effect: QA cannot produce PASS evidence for mandatory J-* rows.

3. **runtime blocker**
   - Attendance route still emits localhost fallback traffic (`127.0.0.1:54321/rest/v1/*`).
   - In-session attendance API probe on runtime page still returns `401 HRM-AUTH-001`.
   - Effect: L2.5 attendance journey reliability remains blocked.

## Gate recommendation

- **Current wave recommendation:** keep L2.5 journey slice at **NO-GO**.
- **Promotion condition to leave NO-GO:**
  1) seeded data available for each required module journey,
  2) QA evidence shows executable list->detail clicks for mandatory J-*,
  3) attendance runtime shows zero localhost fallback traffic and attendance runtime probe `200`.

## completion_report

- closed_scope:
  - Audited latest QA data-aware L2.5 evidence and mapped closure status.
  - Confirmed auth list-access issue is closed.
- residual_open:
  - L2.5 mandatory journeys not executable due data/seed gap.
  - Attendance runtime still has fallback/auth defects.
  - L2.5 closure claim cannot be accepted in this wave.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-L25-JOURNEY-01-R2
from_role: pm
to_role: qa
entry_criteria: QC NO-GO in docs/qa/evidence/p1-ex-qc-https-l25-journey-01-20260528.md with auth list APIs closed but L2.5 journeys blocked by data/seed/runtime gaps.
action: run strict L2.5 retest with seeded rows for J-HRM-01,03,04,05,06,07 on https://14-225-217-232.nip.io (ceo@xe.vn, company_id=main); capture list->detail click-path evidence per J-*; for attendance include zero-localhost-fallback proof and runtime attendance probe 200.
exit_criteria: QA artifact includes executable PASS/FAIL table for each mandatory J-* plus blocker classification and reproducible runtime logs; only then request QC re-gate.
evidence_path: docs/qa/evidence/p1-ex-qa-https-l25-data-journey-01-r2-20260528.md
ack_status target: PASS_TO_PM or FAIL_TO_PM
```

## evidence_path

`docs/qa/evidence/p1-ex-qc-https-l25-journey-01-20260528.md`

## ack_status

**PASS_TO_PM**
