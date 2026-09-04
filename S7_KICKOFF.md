# Sprint S7 Kickoff — Wave B + G8 Fix

Date: 2026-07-29
Owner: PM (Claude + Cursor)
Mode: PEER PM Collab (Claude docs/binding, Cursor FE)

## P0 blockers (must resolve before anything else)
- HOOK-qa-276034_5 / HOOK-qa-309fd5_5: 28 suppressed followups from Vite/OneDrive EPERM
- G8 mobile ILA avg < 16/20. Needs targeted audit + fix.

## P1 dispatch queue
- HRM-MD-PICKER-SPOT-01: qc DISPATCHED required
- 4 other dispatchRequired from PM_OPEN_BACKLOG

## Wave B residuals (CLOSED GWC conditions — no new code)
- R-ES-BLAND-LIST P2: ≥2 DataTable surfaces bland empty
- R-C2-01 P3: deny-persona under non-portal JWT (cấm remove bypass)
- R-QA-WAVEB-PACK P3: amend QA MDs for 8/8 evidence-pack headings

## Constraints (unchanged)
- HOLD_DEPLOY active
- U65 zero-seed
- must_keep C1/D5/P0-c/Profile
- Portal bypass must remain

## Next action
1. Fix OneDrive .vite EPERM path issue
2. Dispatch HRM-MD-PICKER-SPOT-01 to qc
3. Start G8 ILA targeted re-audit
