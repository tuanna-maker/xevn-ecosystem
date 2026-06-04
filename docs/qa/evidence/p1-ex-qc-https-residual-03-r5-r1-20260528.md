# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R5-R1

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R5-R1` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-05-28` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — HTTPS attendance pilot (fallback-zero + Nest records probe) |
| ack_status | **PASS_TO_PM** |

## Scope audited

Re-gate of **attendance residual** on HTTPS pilot after DevOps R5 deploy and QA post-deploy runtime retest (`R5-R1`). Entry per PM dispatch; exit: GO or GWC for attendance pilot only.

**Out of this gate:** consolidated auth 5-endpoint slice (separate wave `P1-EX-QA-HTTPS-BROWSER-AUTH-02-R2`); full program / Production / Excellence T6.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r5-r1-20260528.md` | QA | **Authoritative** — `PASS_TO_PM` |
| 2 | `docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md` | DevOps | Deploy chain + timestamps |
| 3 | `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r5-20260528.md` | Dev-FE | Fix root cause + unit tests |
| 4 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r5-20260528.md` | QA (prior) | FAIL baseline `8→0` delta proof |
| 5 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r1-20260528.md` | QC (prior) | NO-GO superseded **for attendance lane only** |

## QC reproduction (2026-05-28)

| Check | Method | Result |
|-------|--------|--------|
| L0 attendance route | `HEAD` `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main` | **200** |
| L0 HRM API root | `HEAD` `https://14-225-217-232.nip.io/api/hrm/` | **200** |
| R5 bundle marker | `GET` `/hr/src/lib/hrmDataMode.ts` contains `isRemoteLocalhostSupabaseMisconfig` | **present** |
| `fallbackAllCount` browser probe | QA-owned (not re-run by QC) | **0 / 0** per QA artifact |
| Attendance records probe | QA in-session `GET …/attendance/records?company_id=main` | **200 / HRM-ATT-200** ×2 |

QC concurs: **live QA runtime overrides deploy smoke alone**; here deploy smoke **and** QA runtime align after `container_started: 2026-05-28T16:29:30Z`.

## Gate matrix (attendance pilot)

| Gate | Expected | Actual (QA R5-R1 + QC L0) | Verdict |
|------|----------|---------------------------|---------|
| Deploy → runtime chain | R5 on VPS before PASS | Sync + recreate `hrm-fe`; QA after deploy | **PASS** |
| `fallbackAllCount` before `Kiểm tra lại` | `0` | `0` | **PASS** |
| `fallbackAllCount` after `Kiểm tra lại` | `0` | `0` | **PASS** |
| No `127.0.0.1:54321/rest/v1/*` on attendance load | Zero hits | `fallbackSample: []` | **PASS** |
| Attendance records API (in-session) | `200` + `HRM-ATT-200` | Before + after retry | **PASS** |
| HRM sync banner | CONNECTED acceptable | CONNECTED before/after | **PASS** (informational) |
| Delta vs R5 pre-deploy | Improvement required | `8 → 0` | **PASS** |
| L2.5 J-HRM-06 click path on HTTPS | Executable journey if in-scope | **Not run** this wave | **DEFER** (condition) |
| Production / Phase 1 DONE | Explicitly out | Not claimed | N/A |

## L2.5 journey coverage audit (U19)

| Journey | Requirement | This wave | QC |
|---------|-------------|-----------|-----|
| **J-HRM-06** | P-CC-07 attendance list → detail | Not re-executed on HTTPS embed URL | **Deferred** — map shows historical ✅ (W5B local); HTTPS `/hr/attendance` embed not re-clicked |
| J-HRM-01..05, 07 | Other HRM tabs | Out of slice | Not evaluated |

**Rationale:** QA exit for `R5-R1` was attendance fallback-zero + records probe only. Promoting **attendance pilot** slice is allowed without re-closing all J-HRM on HTTPS; full L2.5 HTTPS matrix remains a **separate** QA/QC obligation.

## Conditions (mandatory before broader promotion)

| ID | Condition | Owner | Trigger to close |
|----|-----------|-------|------------------|
| **C-RES03R5R1-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, URL `…/hr/attendance?portal=1` only | QA | Re-test member CEO / `du-lich.ceo@xe.vn` if in-scope |
| **C-RES03R5R1-02** | Command Center embed `P-CC-07` (`/command-center/hrm/attendance`) not re-smoked on HTTPS this wave | QA | L2 row + no 54321 on CC path |
| **C-RES03R5R1-03** | J-HRM-06 list→detail not re-proven on HTTPS after R5 | QA | Publish L2.5 click evidence on pilot |
| **C-RES03R5R1-04** | Pilot runs Vite dev HRM FE — not production static cutover | DevOps | Prod build + `verify:production-env` per NFR runbook |
| **C-RES03R5R1-05** | Cache-bust / hard refresh after each FE deploy | DevOps/QA | Next deploy wave includes probe in evidence |

## Residual (post-gate)

| ID | Severity | Status | Note |
|----|----------|--------|------|
| P0-ATTENDANCE-FALLBACK-03 | P0 | **CLOSED** | `fallbackAllCount=0` post R5 deploy (R5-R1) |
| P0-ATTENDANCE-AUTH-03-R1 | P0 | **CLOSED** (attendance probe) | `HRM-ATT-200` in-session; was `401` at R1 |
| P0-AUTH-HTTPS-03-R1 (5-endpoint) | P0 | **Out of slice** | Tracked under browser-auth waves; not re-audited here |
| P1-EVIDENCE-DRIFT-03-R1 | P1 | **CLOSED** (attendance chain) | Deploy timestamp + QA runtime match |

## Decision summary

**GO WITH CONDITIONS** for **P1-EX-HTTPS-RESIDUAL-03 attendance pilot** on `https://14-225-217-232.nip.io` — mandatory residual gates (zero localhost Supabase REST + Nest attendance records **200/HRM-ATT-200** before and after `Kiểm tra lại`) are **met** with a complete deploy→QA evidence chain.

**Not approved:** Production release, Phase 1 / Excellence DONE, full consolidated RESIDUAL-03 sign-off, or unconditional GO for all HTTPS HRM journeys.

## completion_report

- **closed_scope:**
  - Audited QA R5-R1 runtime PASS vs DevOps R5 deploy and FE R5 fix pack.
  - QC reproduced L0 **200** and live R5 FE marker on pilot bundle.
  - Closed attendance P0 blockers from `P1-EX-QC-HTTPS-RESIDUAL-03-R1` for the **attendance lane** only.
  - Issued **GO WITH CONDITIONS** with explicit J-HRM-06 / P-CC-07 deferrals per U19.
- **residual_open:**
  - HTTPS L2.5 re-click for J-HRM-06 and P-CC-07 on command-center path.
  - Member persona and production cutover remain outside this slice.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-PM-HTTPS-RESIDUAL-03-CLOSE
from_role: qc
to_role: pm
ack_status target: DISPATCHED

PM: Attendance pilot GWC issued (docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md). Dispatch qa for narrow L2.5 follow-up: on https://14-225-217-232.nip.io with ceo@xe.vn — (1) J-HRM-06 click list→detail on /command-center/hrm/attendance AND /hr/attendance embed; (2) P-CC-07 matrix row with zero 54321; publish dated evidence. If PASS, update PROGRAM_JOURNEY_MAP HTTPS note. Optional: dispatch technical-manager for scope_parity advisory only if J-HRM-06 fails. Do not claim Production or Phase 1 DONE.
```

## Handoff packet

```yaml
work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R5-R1
from_role: qc
to_role: pm
entry_criteria: QA PASS docs/qa/evidence/p1-ex-qa-https-residual-03-r5-r1-20260528.md + deploy docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md
exit_criteria: GO or GWC for P1-EX-HTTPS-RESIDUAL-03 attendance pilot
evidence_path: docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
conditions: C-RES03R5R1-01..05
```
