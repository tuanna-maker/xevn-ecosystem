# P1-EX-QC-HTTPS-AUTH-02-R1

- work_item_id: `P1-EX-QC-HTTPS-AUTH-02-R1`
- from_role: `pm`
- to_role: `qc`
- execution_date: `2026-05-28`
- scope: HTTPS auth slice gate after deploy + QA retest

## Evidence Reviewed

1. `docs/qa/evidence/p1-ex-be-https-browser-auth-02-20260528.md`
2. `docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md`

## Gate Checklist Audit

| Gate item | Expected | Actual evidence | Result |
|---|---|---|---|
| Deploy wave completed | Auth deep-fix deployed and handed to QA | QA entry notes deploy wave reviewed | PASS |
| QA retest completeness | 5/5 target endpoints retested with browser-session transport | QA executed all 5 endpoints (`contracts`, `insurance`, `requisitions`, `attendance`, `payslips`) | PASS |
| Runtime auth outcome | 5/5 endpoints must be non-401 under `company_id=main` | 5/5 returned `401 HRM-AUTH-001` | FAIL |
| L2.5 business executability | List APIs must authorize before list->detail execution | Blocked by uniform 401 on list APIs | FAIL |

## QC Verdict

**NO-GO** for HTTPS auth slice promotion.

Rationale:
- Entry contract for this wave required runtime behavioral confirmation after deploy.
- QA retest shows deterministic failure pattern across all in-scope endpoints: `401 HRM-AUTH-001` (5/5).
- This is a release-blocking auth boundary defect, not an isolated endpoint regression.

## Explicit Residual

1. Browser-session token transport (`x-access-token` / `x-portal-access-token` / `xevn.portal.accessToken` cookie) is still rejected in live HTTPS runtime for all 5 HRM list APIs.
2. L2.5 journey chain remains non-executable for auth-dependent HRM routes because list authorization fails at gateway boundary.
3. Deploy evidence is not yet behaviorally effective at runtime; additional BE fix + redeploy + QA retest is mandatory before re-gate.

## completion_report

- closed_scope:
  - Audited latest auth deep-fix evidence and latest post-deploy QA retest artifact.
  - Executed QC gate decision for HTTPS auth slice with explicit compliance verdict and residual mapping.
- residual:
  - Runtime auth still fails 5/5 endpoints with `401 HRM-AUTH-001`; gate cannot be promoted.
  - QC re-gate required after new BE remediation evidence and fresh QA PASS retest.

## next_owner

`pm`

## next_dispatch_prompt

`work_item_id: P1-EX-BE-HTTPS-BROWSER-AUTH-02-R2`  
`from_role: pm`  
`to_role: dev-be`  
`entry_criteria: QC NO-GO evidence docs/qa/evidence/p1-ex-qc-https-auth-02-r1-20260528.md and QA FAIL docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md show 5/5 browser-session calls still return 401 HRM-AUTH-001 on https://14-225-217-232.nip.io for company_id=main.`  
`action: fix live runtime auth acceptance path for browser-session transport across contracts-insurance contracts+insurance, recruitment requisitions, attendance records, payroll payslips; include deploy verification proving running instance actually uses patched auth boundary.`  
`exit_criteria: publish dev-be evidence with runtime command outputs showing non-401 on all 5 endpoints using browser-session transport, then dispatch QA to produce PASS_TO_PM retest artifact for the same 5 endpoints.`  

evidence_path: `docs/qa/evidence/p1-ex-qc-https-auth-02-r1-20260528.md`  
ack_status: `PASS_TO_PM`
