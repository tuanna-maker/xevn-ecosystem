# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R5

- work_item_id: `P1-EX-QA-HTTPS-RESIDUAL-03-R5`
- from_role: `qa`
- to_role: `pm`
- execution_time_local: `2026-05-28 (UTC+7)`
- runtime_url: `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main`
- account: `ceo@xe.vn` (portal session; `tokenLen=311`, `portalLen=311`)
- entry_evidence: `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r5-20260528.md` (dev-fe READY_FOR_QA)
- prior_fail: `docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260528.md` (`fallbackAllCount=8`)

## Scope Executed (runtime)

1. Browser runtime on live HTTPS attendance URL (existing portal session on pilot).
2. Measured `performance` resource entries for `127.0.0.1:54321/rest/v1/*` **before** `Kiểm tra lại`.
3. In-session probe: `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`.
4. Clicked **`Kiểm tra lại`** on attendance sync banner.
5. Re-measured fallback counts and re-ran attendance records probe.
6. L0 curl: portal root `200`; `/api/hrm/health` `404` (non-blocking for this gate).

## Deploy precondition note

- No `docs/ops/evidence/*residual-03-r5*` deploy artifact found on disk.
- Pilot HRM HTML serves **Vite dev** entry (`/hr/@vite/client`, `/hr/src/main.tsx`) — runtime behavior **unchanged vs R4** (see delta table).

## Runtime Results

### A) Attendance fallback-zero gate (mandatory)

| Checkpoint | `fallbackAllCount` | Verdict |
|------------|-------------------|---------|
| Before `Kiểm tra lại` | **8** | FAIL |
| After `Kiểm tra lại` | **8** | FAIL |

Matched localhost samples (same set as R4):

- `http://127.0.0.1:54321/rest/v1/departments?...company_id=eq.main...`
- `http://127.0.0.1:54321/rest/v1/attendance_sheets?...`
- `http://127.0.0.1:54321/rest/v1/work_shifts?...`
- `http://127.0.0.1:54321/rest/v1/attendance_rules?...`
- `http://127.0.0.1:54321/rest/v1/attendance_records?...attendance_date=eq.2026-05-28`
- `http://127.0.0.1:54321/rest/v1/leave_requests?...` (year + week ranges)

**Expected:** `fallbackAllCount = 0` and zero `127.0.0.1:54321/rest/v1/*` before **and** after retry.

**Verdict:** **FAIL** — R5 runtime gate not met on deployed pilot.

### B) Attendance records probe (mandatory)

| When | HTTP | Code | Message |
|------|------|------|---------|
| Before retry | 200 | `HRM-ATT-200` | Attendance records listed |
| After retry | 200 | `HRM-ATT-200` | Attendance records listed |

**Verdict:** **PASS**

### C) UI sync banner (informational)

- Banner: `HRM API Sync CONNECTED` (no ERROR after `Kiểm tra lại`).
- Attendance overview UI rendered (Tổng quan, charts).

## Delta vs R4

| Criterion | R4 | R5 (this run) |
|-----------|----|----|
| `fallbackAllCount` before retry | 8 | **8** (no change) |
| `fallbackAllCount` after retry | 8 | **8** (no change) |
| Attendance probe | 200 `HRM-ATT-200` | 200 `HRM-ATT-200` |
| Fallback URL pattern | 8 Supabase REST | **Identical** |

## Overall QA Verdict

- **ack_status:** `FAIL_TO_PM`
- **Reason:** Mandatory fallback-zero gate still open (`fallbackAllCount=8` before and after `Kiểm tra lại`). Nest attendance records probe is green, but **P1-EX-HTTPS-RESIDUAL-03** cannot close until localhost Supabase REST traffic is eliminated on pilot runtime. Likely **R5 FE patch not yet on pilot** (no deploy evidence; runtime identical to R4).

## completion_report

- **closed_scope:**
  - Executed live browser QA on requested HTTPS attendance URL with `ceo@xe.vn` portal session.
  - Verified attendance records probe **200 / HRM-ATT-200** before and after `Kiểm tra lại`.
  - Documented deploy precondition gap and unchanged fallback fingerprint vs R4.
- **residual:**
  - `fallbackAllCount=8` — eight `127.0.0.1:54321/rest/v1/*` requests still fire on attendance load/retry.
  - DevOps must deploy/sync R5 HRM FE to pilot, then QA **R5-R1** rerun before promoting residual gate.

## Handoff Packet

- **next_owner:** `devops` (then `qa`)
- **next_dispatch_prompt:** `Deploy P1-EX-FE-BE-HTTPS-RESIDUAL-03-R5 HRM web to pilot VPS (sync apps/web/hrm including supabaseRestGuard + hrmDataMode remote-host block). Publish deploy evidence at docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md with build timestamp. Then dispatch QA R5-R1: on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main (ceo@xe.vn), confirm fallbackAllCount=0 before AND after Kiểm tra lại and GET /api/hrm/attendance/records returns 200 HRM-ATT-200.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r5-20260528.md`
- **ack_status:** `FAIL_TO_PM`
