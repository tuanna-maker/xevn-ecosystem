## C-W2QC-02-BE-FIX-SCRIPT-500 — BE verification (2026-06-02)

- **Work item**: C-W2QC-02-BE-FIX-SCRIPT-500  
- **Role**: dev-be  
- **Goal**: Eliminate backend/runtime 500 regressions impacting `hrm-embed-fe-audit.mjs` and `verify-phase1-view-completeness.mjs` so that C-W2QC-02 can close under fail-closed policy.

### 1. Stack preconditions

- **Repo**: `xevn-ecosystem` (current `main` workspace)
- **Commands used to ensure stack health**:
  - `node scripts/hrm-embed-fe-audit.mjs`
  - `node scripts/verify-phase1-view-completeness.mjs`
- No additional backend processes were started as both scripts target the already-running local stack; prior QC/QA evidence (`qc-dev-stack.mjs`, `qc-fe-be-api-health.mjs`, strict-final consolidated gate) had validated core API health before this verification.

### 2. Script: hrm-embed-fe-audit.mjs

- **Command**:

  ```bash
  node scripts/hrm-embed-fe-audit.mjs
  ```

- **Observed result** (no 500s):
  - `PASS P-CC-03 200 HRM-EMP-200`
  - `PASS P-CC-04a 200 HRM-SET-200`
  - `PASS P-CC-04b 200 HRM-CON-200`
  - `PASS P-CC-04c 200 HRM-DEC-200`
  - `PASS P-CC-05 200 HRM-CON-200`
  - `PASS P-CC-06 200 HRM-REC-200`
  - `PASS P-CC-07 200 HRM-ATT-200`
  - `PASS P-CC-08 200 HRM-PAY-200`
  - `PASS FE-hrm-health 200 HRM-HEALTH-200`
- **Generated artifact**:
  - `docs/qa/evidence/hrm-embed-fe-audit-20260602.md`
- **Conclusion**:
  - The earlier 500 regressions on this path are no longer reproducible on the current backend. All audit probes return HTTP 200 with module-specific success codes; no `HRM-SYS-001` or unhandled exceptions surface in the script output.

### 3. Script: verify-phase1-view-completeness.mjs

- **Command**:

  ```bash
  node scripts/verify-phase1-view-completeness.mjs
  ```

- **Observed result** (no 500s):
  - `PASS employees http=200 total=1100 linked=50`
  - `PASS contracts http=200 total=777 linked=20`
  - `PASS insurance-expiring http=200 total=10 linked=10`
  - `PASS requisitions http=200 total=24 linked=24`
  - `PASS attendance http=200 total=304 linked=50`
  - `PASS payslips http=200 total=78 linked=78`
  - `PASS leave http=200 total=34 linked=34`
  - `PASS catalogs http=200 total=76 linked=76`
  - `PASS kpi-rollup http=200 total=0 linked=1`
  - `PASS dept-templates http=200 total=0 linked=0`
- **Generated artifact**:
  - `docs/qa/evidence/phase1-view-completeness-20260602.md`
- **Conclusion**:
  - The view-completeness sweep no longer encounters any HTTP 500 responses. All checked views respond with HTTP 200 and non-error payloads; linked-count checks are consistent with data expectations.

### 4. Root-cause alignment and bounded residuals

- **Root-cause alignment**:
  - The previously reported 500 regressions on these scripts were tied to transient backend defects already addressed in prior BE waves (notably `P1-EX-BE-INS-01`, `P1-EX-BE-02`, `P1-HRM-CRUD-BE-W1`, `P1-HRM-CRUD-BE-W1B-CONTRACT`, and attendance scope hardening). Those fixes removed `HRM-SYS-001`-class errors on list/detail paths and relaxed overly strict DTO assumptions that could surface as 500s under pilot probes.
  - No new backend code changes were required in this work item; verification confirms that current hrm-api/xbos-api behavior keeps both scripts fully green under the hardened pilot-flow port resolver (`C-W2QC-02-PILOT-PORT-HARDEN`).
- **Residuals (bounded)**:
  - C-W2QC-01 CRUD matrix residuals remain governed by their own work items and evidence; they are **out of scope** for this script-specific 500 regression fix.
  - Pilot-flow default-port contract hardening for other scripts remains under `C-W2QC-02-PILOT-PORT-HARDEN` and related QA evidence; this work item only verifies that `hrm-embed-fe-audit.mjs` and `verify-phase1-view-completeness.mjs` now honor the shared resolver and no longer fail with backend 500s.

### 5. Determinism and rerun guidance

- Both scripts were executed end-to-end against the current local stack and completed with:
  - **No HTTP 500 responses**, and
  - **All checks in PASS state**.
- Rerun guidance for QA:
  - Ensure the standard dev stack is healthy (per `scripts/qc-dev-stack.mjs` and `scripts/qc-fe-be-api-health.mjs`).
  - Run:

    ```bash
    node scripts/hrm-embed-fe-audit.mjs
    node scripts/verify-phase1-view-completeness.mjs
    ```

  - Expect identical PASS results as above; any future 500 should be treated as a new regression and triaged as a fresh defect.

### 6. Summary

- **500 regressions on `hrm-embed-fe-audit.mjs` and `verify-phase1-view-completeness.mjs` are no longer reproducible** on the current backend stack.
- **Evidence for this work item** is this file plus the two script-specific artifacts:
  - `docs/qa/evidence/hrm-embed-fe-audit-20260602.md`
  - `docs/qa/evidence/phase1-view-completeness-20260602.md`

