# QC Gate Decision — P1-HRM-CRUD-QC-W2-STRICT-FINAL-CONSOLIDATED

| Field | Value |
|---|---|
| work_item_id | `P1-HRM-CRUD-QC-W2-STRICT-FINAL-CONSOLIDATED` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-06-02` |
| decision | **GO WITH CONDITIONS** |
| ack_status | **PASS_TO_PM** |
| qa_primary_evidence | `docs/qa/evidence/p1-hrm-crud-qa-w2-strict-final-consolidated-20260602.md` |
| qa_supporting_evidence | `docs/qa/evidence/p1-hrm-crud-qa-w2-strict-rerun-20260602.md`, `docs/qa/evidence/p1-hrm-crud-qa-w2-pilot-flow-recovery-20260602.md` |

---
## 1) Scope and fail-closed audit baseline

QC audited strict-final consolidated HRM CRUD evidence with fail-closed interpretation:
- Any required strict command failure => NO promotion.
- Recovery claims are accepted only with reproducible as-is fail + aligned rerun pass chain.
- Residual module completeness must remain explicit (no hidden over-claim to 100%).

---
## 2) Strict command exits and targeted attendance stability checks

QC accepted the consolidated strict command table in `p1-hrm-crud-qa-w2-strict-final-consolidated-20260602.md` as follows:

| # | Command | Exit | QC verdict |
|---|---|---:|---|
| 1 | `pnpm --filter hrm-api test` | 0 | PASS |
| 2 | `pnpm --filter web-portal test` | 0 | PASS |
| 3 | `pnpm --filter web-portal build` | 0 | PASS |
| 4 | `pnpm run qc:dev-stack` | 0 | PASS |
| 5 | `pnpm run qc:fe-be-health` | 0 | PASS |
| 6 | `pnpm run test:system:uat` | 0 | PASS |
| 7 | `PORTAL_DEV_URL=http://127.0.0.1:5173 pnpm run test:pilot:flows` | 0 | PASS |
| A | `pnpm --filter hrm-api exec jest --runInBand attendance.controller.spec.ts` | 0 | PASS |

Strict gate status under fail-closed policy: **PASS**.

---
## 3) Reproducibility and fail-closed interpretation

QC validated reproducibility chain across the three QA artifacts:

1. `p1-hrm-crud-qa-w2-strict-rerun-20260602.md` captured fail-closed FAIL state with:
   - `pnpm --filter hrm-api test` exit `1`,
   - `pnpm run test:pilot:flows` exit `1` (`ECONNREFUSED 127.0.0.1:5175`).
2. `p1-hrm-crud-qa-w2-pilot-flow-recovery-20260602.md` reproduced as-is failure, then proved aligned contract recovery with `PORTAL_DEV_URL=http://127.0.0.1:5173` and `13/13 PASS`.
3. `p1-hrm-crud-qa-w2-strict-final-consolidated-20260602.md` consolidated full strict rerun with all required commands and targeted attendance check at exit `0`.

QC fail-closed interpretation:
- Prior strict failures were valid at their run context and were not waived.
- Promotion is accepted only because consolidated rerun now provides full required command green set and explicit recovery trace.

---
## 4) Residual audit: module-level CRUD completeness

QC concurs with explicit residual boundaries in the consolidated QA artifact:

### 4.1 Strictly green in this cycle
- Attendance, recruitment, payroll, employees-skills sequence: strict gate evidence and supporting smoke chains are green.

### 4.2 Partial/untested C/R/U/D in this exact strict-final cycle
- `contracts-insurance contracts`
- `insurance participants`
- `decisions`
- `settings/admin catalogs`

Residual classification:
- **Non-critical to strict operational gate closure**
- **Critical to any claim of full module-level 100% CRUD completeness**

Therefore, this gate cannot be interpreted as full HRM module CRUD completion across all domains.

---
## 5) Final QC verdict

**Decision: GO WITH CONDITIONS**

Rationale:
1. Required strict command set and targeted attendance stability checks are now fully green with explicit exits.
2. Reproducibility chain is evidence-backed (fail -> recovery -> consolidated pass), compliant with fail-closed discipline.
3. Residual module-level completeness remains partial for contracts/insurance/decisions/settings and must be tracked as open closure items.

---
## 6) Conditions and owners (no silent waiver)

1. **Condition C-W2QC-01 (module CRUD completeness closure)**
   - Owner: `pm` dispatch `qa` + `dev-be`/`dev-fe` as needed
   - Required action: execute dedicated C/R/U/D matrix reruns for contracts/insurance/decisions/settings and publish tested-vs-untested evidence with deterministic negative-path checks.
   - Rationale: strict gate PASS does not equal full module completeness.
   - Expiry: `before next claim of full HRM CRUD closeout / before release-wide completion statement`.

2. **Condition C-W2QC-02 (pilot-flow environment contract hardening)**
   - Owner: `pm` dispatch script owner lane (`dev-be` or `devops`) + `qa`
   - Required action: align default pilot-flow script/runbook port contract to avoid implicit `5175` drift; keep explicit `PORTAL_DEV_URL` in strict reruns until code/runbook alignment is merged.
   - Rationale: prevent false FAIL from environment contract mismatch.
   - Expiry: `next strict regression cycle`.

---
## Completion contract

- completion_report: QC completed fail-closed final consolidated audit for W2 HRM CRUD strict gate. Strict command set and attendance targeted stability checks are reproducibly green, so gate is promotable. Residual risk is explicitly bounded to partial module-level CRUD coverage (contracts/insurance/decisions/settings) and environment-contract hardening for pilot-flow defaults.
- next_owner: pm
- next_dispatch_prompt: `Publish PM summary for work_item_id P1-HRM-CRUD-QC-W2-STRICT-FINAL-CONSOLIDATED with decision GO_WITH_CONDITIONS. Promote only strict operational closure (commands + attendance stability) and explicitly keep C-W2QC-01/C-W2QC-02 open. Dispatch QA+Dev wave to close full CRUD matrix for contracts/insurance/decisions/settings and align pilot-flow default env contract before any 100% HRM CRUD completion claim.`
- evidence_path: `docs/qa/evidence/p1-hrm-crud-qc-w2-strict-final-consolidated-20260602.md`
- ack_status: **PASS_TO_PM**
