# P1-EX-QA-HTTPS-BROWSER-01-R5-R2 - QA promotion addendum (evidence reconciliation)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-BROWSER-01-R5-R2` |
| from_role | `pm` |
| to_role | `qa` |
| date | `2026-05-28` |
| base_url | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| previous QA evidence | `docs/qa/evidence/p1-ex-qa-https-browser-01-r5-20260528.md` |
| deploy evidence (now available) | `docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md` |
| ack_status | **PASS_TO_PM** |

## Reconciliation scope

This addendum reconciles the prior mixed verdict:
- Functional/browser checks in R5 evidence were already PASS.
- Gate remained FAIL only because deploy evidence file was missing at that intake time.

Minimal verification performed for R2:
1. Re-read prior QA evidence (`p1-ex-qa-https-browser-01-r5-20260528.md`) to confirm functional findings.
2. Verified deploy artifact now exists and contains required deploy + smoke proof (`p1-ex-do-deploy-https-r5-pack-20260528.md`).
3. Confirmed no new blocker introduced in the deploy handoff content relevant to this QA gate.

No full browser rerun was executed (not necessary for this reconciliation task).

## Evidence consistency decision

### Prior blocker status
- Prior blocker: missing deploy artifact `docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md`.
- Current status: **RESOLVED** (artifact exists and includes smoke outputs).

### Functional status carried from R5 QA evidence
- `P-CC-03..08` sync gate checks: PASS (no Sync ERROR).
- `GET /api/hrm/catalog-sync/status?company_id=main`: PASS (`200`, `HRM-SYNC-203`).
- iframe scope param `companyId=main`: PASS.
- `J-HRM-02` list -> employee profile: PASS (detail API 200, no false banner).

### Deploy artifact confirmation
Deploy evidence explicitly includes:
- Targeted service deploy/recreate steps.
- L0 health checks PASS.
- Catalog sync status contract PASS (`200`, `HRM-SYNC-203`).
- Browser click journey PASS for employee profile path.

## QA verdict

Given the previously missing precondition is now satisfied and no new blocking contradiction is found in the provided evidence set:

- `ack_status`: **PASS_TO_PM**
- promotion decision: **Promote R5 browser wave to PM**

## completion_report

- Closed scope:
  - Reconciled R5 inconsistency between functional PASS and artifact-gated FAIL.
  - Verified deploy artifact now exists and closes the prior precondition gap.
  - Issued final promotion addendum for wave `P1-EX-QA-HTTPS-BROWSER-01-R5-R2`.
- Residual (non-blocking for this promotion):
  - Attendance module message `"Không thể tải quy định chấm công"` was noted in prior R5 evidence as outside the sync/profile regression scope; keep under separate follow-up if PM wants additional hardening.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QC-HTTPS-BROWSER-01-R5-R2
from_role: pm
to_role: qc
ack_status target: GO or GO_WITH_CONDITIONS

Please run QC gate using this reconciled QA package:
- docs/qa/evidence/p1-ex-qa-https-browser-01-r5-20260528.md
- docs/qa/evidence/p1-ex-qa-https-browser-01-r5-r2-20260528.md
- docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md

Focus:
1) confirm precondition closure (deploy evidence exists),
2) confirm QA promotion consistency for P-CC-03..08 + J-HRM-02 browser path,
3) return release posture (GO or GO_WITH_CONDITIONS) with residual statement.
```

## evidence_path

`docs/qa/evidence/p1-ex-qa-https-browser-01-r5-r2-20260528.md`
