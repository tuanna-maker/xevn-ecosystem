# QC Re-gate — MOB-UX-18 (Chrome dedup)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-18-QC-RECHECK-20260616` |
| **from_role** | `pm` |
| **to_role** | `qc` |
| **date** | 2026-06-16 |
| **ack_status** | **PASS_TO_PM** |
| **decision_scope** | Mobile UX fix re-gate for ILA-05 chrome dedup on latest APK lineage |
| **input_evidence** | `docs/qa/evidence/mob-ux-18-chrome-qa-20260616.md`, `docs/qa/evidence/mob-ux-18-apk-build-20260616.md`, `docs/qa/evidence/qc-mob-ux-18-20260616.md` |

## Gate objective

Re-gate MOB-UX-18 and verify closure of all prior NO-GO conditions issued in `qc-mob-ux-18-20260616.md`.

## Prior NO-GO conditions closure audit

### Condition C1 — latest APK artifact lineage + hash

- Prior status: **OPEN** (APK not present at QC time).
- Current evidence:
  - Artifact file exists: `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk`
  - APK lineage file: `docs/qa/evidence/mob-ux-18-apk-build-20260616.md`
  - SHA-256 in evidence: `8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B`
  - QC recomputed SHA command:
    - `certutil -hashfile "apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk" SHA256`
  - QC recomputed SHA result:
    - `8cffd70940bbdb651aeea7025e76c9227aaffe173ecde2bf57f7c78b1e47544b`
- Closure: **CLOSED**.

### Condition C2 — evidence-pack completeness (`## Residual` required)

- Prior status: **OPEN** (missing `## Residual` section in previous QA artifact).
- Current evidence:
  - New QA evidence includes `## Residual` section with explicit statement.
  - QC verifier command:
    - `pnpm -s run verify:qc:evidence-pack -- --evidence "docs/qa/evidence/mob-ux-18-chrome-qa-20260616.md"`
  - Result: `PASS: QC evidence pack ready (8/8)`
- Closure: **CLOSED**.

### Condition C3 — quick device recheck on target screens (latest APK)

- Prior status: **OPEN** (could not be accepted without latest lineage + complete pack).
- Current evidence (`mob-ux-18-chrome-qa-20260616.md`):
  - `J-MOB-23` Leave empty tab `Từ chối`: single `Đăng ký nghỉ` CTA, no duplicate footer CTA.
  - `J-MOB-04` Payslip tab: no duplicate title/chrome, no duplicate in-content H1.
  - Log safety checks: no `x-company-id: main`, no fatal exceptions.
- Closure: **CLOSED**.

## L2.5 scoped journey audit

- Scoped journeys covered in QA recheck:
  - `J-MOB-23` (Leave UX empty-state dedup) — **PASS**
  - `J-MOB-04` (Payslip chrome/title dedup) — **PASS**
- This gate is limited to MOB-UX-18 UX defect slice and does not claim full mobile program closure.

## QC verdict

**GO** for `MOB-UX-18-QC-RECHECK-20260616` scoped re-gate.

### Decision statement

- All prior NO-GO conditions (`C1`, `C2`, `C3`) are closed with reproducible evidence.
- Evidence-pack integrity is PASS and APK lineage hash is verifiable on the current artifact.
- Targeted UX defect behavior is corrected on both mandated screens for this work item scope.

## Residual

- No release-blocking residual within MOB-UX-18 scoped gate.
- Program-level status remains governed by broader PM/QA/QC wave gates; this GO does not imply Phase 1 DONE or production readiness.

## completion_report

- Re-gated MOB-UX-18 against latest QA evidence and APK lineage artifact.
- Verified closure of all prior NO-GO conditions:
  - `C1` APK artifact and hash lineage: closed.
  - `C2` evidence-pack completeness and verifier PASS: closed.
  - `C3` device recheck on Leave/Payslip dedup: closed.
- Issued **GO (scoped)** verdict for MOB-UX-18 with no blocking residual in this slice.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: MOB-UX-18-PM-CLOSE-20260616
from_role: qc
to_role: pm
entry_criteria:
- QC re-gate GO published: docs/qa/evidence/qc-mob-ux-18-recheck-20260616.md
- Prior NO-GO conditions C1/C2/C3 confirmed closed with command evidence
exit_criteria:
- Update program tracker/bus to mark MOB-UX-18 closed in scoped mobile UX lane
- Continue dispatch for next open mobile/J-MOB residual item (if any)
evidence_path: docs/qa/evidence/qc-mob-ux-18-recheck-20260616.md
ack_status: PASS_TO_PM
```
