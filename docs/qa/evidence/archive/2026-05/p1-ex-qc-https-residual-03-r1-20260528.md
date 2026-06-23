# P1-EX-QC-HTTPS-RESIDUAL-03-R1 — Consolidated QC gate (HTTPS residual slice)

- work_item_id: `P1-EX-QC-HTTPS-RESIDUAL-03-R1`
- from_role: `pm`
- to_role: `qc`
- execution_date: `2026-05-28`
- decision: **NO-GO**
- ack_status: **PASS_TO_PM**

## Scope audited

Consolidated residual verification for HTTPS slice after QA residual wave, including preceding FE/BE/DO evidence for auth + attendance runtime behavior.

## Evidence consumed

1. `docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md` (`FAIL_TO_PM`)
2. `docs/qa/evidence/p1-ex-qa-https-attendance-fallback-03-20260528.md` (`FAIL_TO_PM`)
3. `docs/qa/evidence/p1-ex-be-https-browser-auth-02-20260528.md` (`READY_FOR_QA`)
4. `docs/qa/evidence/p1-ex-fe-https-attendance-fallback-02-20260528.md` (`READY_FOR_QA`)
5. `docs/ops/evidence/p1-ex-do-https-auth-02-deploy-20260528.md` (`READY_FOR_QA`)

## Consolidated gate verdict

### 1) Browser-auth residual (blocking)

- QA runtime retest (`...browser-auth-02-r1`) recorded `401 HRM-AUTH-001` on 5/5 required endpoints under browser-session transport (`x-access-token`/cookie, `company_id=main`).
- This is a direct failure against mandatory acceptance for this residual slice.

### 2) Attendance residual (blocking)

- QA runtime retest (`...attendance-fallback-03`) still observed local fallback traffic to `127.0.0.1:54321/rest/v1/*` (`fallbackAllCount=8`), violating zero-fallback gate.
- Same runtime evidence showed attendance records API probe returned `401`, so attendance health is not closed.

### 3) Cross-lane evidence consistency

- BE/FE/DO artifacts claim fix/deploy readiness, but QA runtime evidence remains failing on the deployed perimeter.
- For QC gate, live QA runtime behavior is authoritative over pre-promotion or deploy smoke claims when they conflict.

## Gate matrix

| Gate | Expected | Actual | Verdict |
|---|---|---|---|
| Browser-session auth on 5 mandatory HRM endpoints | Non-401 on all 5 | 5/5 returned `401 HRM-AUTH-001` | **FAIL (P0)** |
| Attendance no-fallback runtime gate | `fallbackAllCount=0` and no `127.0.0.1:54321` calls | `fallbackAllCount=8` | **FAIL (P0)** |
| Attendance runtime API health | Attendance records probe returns success in-session | Probe returned `401` | FAIL |
| Consolidated HTTPS residual readiness | Auth + attendance residuals closed | Both still open | **NO-GO** |

## L2.5 journey coverage audit note (U19)

- This residual wave did not present a passing L2.5 journey closure packet for the affected auth/attendance slices.
- Because core runtime gates remain failed, promotion to GO/GWC is not allowed.

## Residual list

1. **P0-AUTH-HTTPS-03-R1:** Browser-session auth still fails with `401 HRM-AUTH-001` on 5 mandatory endpoints.
2. **P0-ATTENDANCE-FALLBACK-03-R1:** Attendance page still issues local fallback calls to `127.0.0.1:54321/rest/v1/*`.
3. **P0-ATTENDANCE-AUTH-03-R1:** Attendance records runtime probe remains unauthorized (`401`) in target session context.
4. **P1-EVIDENCE-DRIFT-03-R1:** Deploy smoke and QA runtime outcomes are inconsistent; requires one deterministic deploy+QA chain in same wave.

## completion_report

- closed_scope:
  - Consolidated QA residual results with BE/FE/DO preceding evidence for the same HTTPS slice.
  - Issued final QC decision for this residual wave with explicit blocker mapping and severity.
- residual_open:
  - Auth and attendance runtime blockers remain open at P0 level.
  - No release/promotion gate can pass until QA runtime evidence turns green for both lanes.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-RESIDUAL-03-R2
from_role: qc
to_role: pm
ack_status target: READY_FOR_QA (dev lanes), then PASS_TO_PM (qa)

Dispatch in this order with one shared evidence chain:
1) dev-be + dev-fe joint fix for auth/attendance runtime:
   - close 5/5 browser-session auth 401 failures
   - enforce zero localhost fallback on attendance runtime
   - close attendance runtime 401 probe in-session
2) devops deploy with deterministic runtime smoke on the same target URL/environment.
3) qa rerun immediately after deploy and publish one residual evidence packet proving:
   - 5/5 auth endpoints non-401
   - fallbackAllCount=0 (before and after "Kiểm tra lại")
   - attendance records probe success in same session scope

Mandatory references:
- docs/qa/evidence/p1-ex-qc-https-residual-03-r1-20260528.md
- docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r1-20260528.md
- docs/qa/evidence/p1-ex-qa-https-attendance-fallback-03-20260528.md
- docs/ops/evidence/p1-ex-do-https-auth-02-deploy-20260528.md
```

## evidence_path

`docs/qa/evidence/p1-ex-qc-https-residual-03-r1-20260528.md`
