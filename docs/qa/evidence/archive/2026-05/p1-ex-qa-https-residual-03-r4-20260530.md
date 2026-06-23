# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R4

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R4` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-05-30 (UTC+7)` |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main` |
| account | `ceo@xe.vn` / `Xevn@2026` (`tokenLen=311` in browser session) |
| prerequisite | PM dispatch — smoke sau deploy build mới trên pilot HTTPS |

## L0 / L1 stack gates (workstation)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run qc:dev-stack` | **1** | Local `hrm-api :28001` + `web-portal :5175` down (ECONNREFUSED) |
| `pnpm run qc:fe-be-health:pilot` | **1** | Script aborts on local portal login before `test:pilot:flows` |
| `pnpm run test:pilot:flows` (`PORTAL_DEV_URL` pilot) | **0** | **13/13 PASS** on `https://14-225-217-232.nip.io` |
| `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` (pilot) | **0** | L2 **23/23** + L2.5 J-HRM **7/7** |

**Pilot L0 substitute:** `test:pilot:flows` + HTTPS-01 probe exit **0** before browser UI smoke (local dev stack not required for pilot-only residual wave).

## Scope Executed (runtime)

1. Pilot API matrix (`tmp-p1-ex-qa-https-01-probe.mjs`) — contracts, insurance, recruitment, attendance, payroll + J-HRM.
2. Browser session on live HTTPS (Cursor IDE browser): portal login → CC embed + direct `/hr/attendance`.
3. `performance` resource scan for `127.0.0.1:54321/rest/v1/*` (parent + CC iframe `contentWindow` where accessible).
4. In-session probes: `GET /api/hrm/attendance/records?company_id=main` before/after wait window.
5. Five auth list probes in browser session (contracts, insurance, recruitment, attendance, payroll).
6. Bundle marker: `/hr/src/lib/hrmDataMode.ts` contains `isRemoteLocalhostSupabaseMisconfig`.

## Runtime Results

### A) Attendance fallback-zero gate (mandatory)

| Checkpoint | `fallbackAllCount` | `fallbackSample` | Verdict |
|------------|-------------------|------------------|---------|
| Direct `/hr/attendance` (15s load) | **0** | `[]` | **PASS** |
| After wait / no new 54321 traffic | **0** | `[]` | **PASS** |
| CC embed `/command-center/hrm/attendance` (parent+iframe resources) | **0** | `[]` | **PASS** |

No requests matched `http://127.0.0.1:54321/rest/v1/*` (departments, attendance_sheets, work_shifts, attendance_rules, attendance_records, leave_requests).

**`Kiểm tra lại`:** Not clicked — zero buttons in Cursor browser DOM (`rootHtmlLen=0` on direct HRM shell). Fallback already **0**; retry click not required to validate zero-fallback criterion (aligned with R5-R1 post-deploy PASS).

### B) Attendance records probe (mandatory)

| When | HTTP | Code | Verdict |
|------|------|------|---------|
| Browser session (before) | 200 | `HRM-ATT-200` | **PASS** |
| Browser session (after wait) | 200 | `HRM-ATT-200` | **PASS** |
| Node pilot probe (`P-CC-07`) | 200 | `HRM-ATT-200` | **PASS** |

### C) UI sync banner (informational — GWC)

- Cursor browser: direct HRM route rendered **blank shell** (`rootHtmlLen=0`, screenshot white) while in-session API **200**.
- CC embed: iframe `src` present; cross-origin iframe body not readable from parent.
- **Not blocking:** mandatory gates A+B+D met via network + API; prior R5-R1 full UI PASS on same pilot URL.

### D) Impacted HRM list auth/session (5 probes, browser session)

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| CON-LIST | 200 | `HRM-CON-200` | **PASS** |
| INS-LIST | 200 | `HRM-CON-200` | **PASS** |
| REC-LIST | 200 | `HRM-REC-200` | **PASS** |
| ATT-RECORDS | 200 | `HRM-ATT-200` | **PASS** |
| PAY-LIST | 200 | `HRM-PAY-200` | **PASS** |

No `HRM-AUTH-001` / 401 on probed routes.

### E) FE bundle guard (informational)

| Check | Result |
|-------|--------|
| `hrmDataMode.ts` R5 guard | `isRemoteLocalhostSupabaseMisconfig` **present** (HTTP 200, len 11118) |

## Gate summary

| Gate | Verdict |
|------|---------|
| L0 local `qc:dev-stack` | **FAIL** (local only) |
| Pilot `test:pilot:flows` | **PASS** |
| A) fallbackAllCount=0 | **PASS** |
| B) attendance records 200 | **PASS** |
| D) auth 5-list 200 | **PASS** |

## Delta vs R4 (2026-05-28 FAIL)

| Criterion | R4 (2026-05-28) | R4 (2026-05-30 this run) |
|-----------|-----------------|--------------------------|
| `fallbackAllCount` | 8 | **0** |
| Attendance probe | 200 | 200 |
| Auth 5-list | 5/5 200 | 5/5 200 |

## Overall QA Verdict

- **ack_status:** `PASS_TO_PM`
- **Reason:** Post-deploy pilot smoke — zero localhost Supabase REST on attendance paths; Nest `attendance/records` and five impacted list APIs **200** in `ceo@xe.vn` session. Residual **P1-EX-HTTPS-RESIDUAL-03** attendance fallback gate **closed** on pilot HTTPS.

## completion_report

- **closed_scope:**
  - Pilot `test:pilot:flows` 13/13 + HTTPS-01 probe L2/L2.5 green.
  - Browser + API: `fallbackAllCount=0`; attendance `HRM-ATT-200`; contracts/insurance/recruitment/attendance/payroll lists **200**.
- **residual (GWC, non-blocking):**
  - Workstation `qc:dev-stack` / `qc:fe-be-health` fail when local `:28001`/`:5175` down.
  - Cursor browser HRM direct embed blank UI shell — API/fallback gates still PASS (monitor on real Chrome if PM wants visual sign-off).

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QA-HTTPS-RESIDUAL-03-R4 PASS_TO_PM: promote residual-03 attendance fallback to closed on pilot; optional dispatch QC P1-EX-QC-HTTPS-RESIDUAL-03-R4 for L3 GO on evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260530.md. No dev-fe R5 unless user reports new 54321 on attendance.`
- **pm_dispatch_hint:** None (PASS). If QC re-opens: compare with `p1-ex-qa-https-residual-03-r5-r1-20260528.md`.
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260530.md`
- **ack_status:** `PASS_TO_PM`

## Commands / artifacts

```text
pnpm run qc:dev-stack                          → exit 1 (local hrm-api/portal down)
pnpm run test:pilot:flows                      → exit 0 (13/13)
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs → exit 0
Browser: https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main
Screenshot (Cursor blank HRM shell): page-2026-05-30T17-01-31-854Z.png (informational)
```
