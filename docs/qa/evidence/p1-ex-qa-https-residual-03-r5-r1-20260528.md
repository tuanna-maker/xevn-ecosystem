# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R5-R1

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R5-R1` |
| from_role | `qa` |
| to_role | `pm` |
| execution_time_utc | `2026-05-28T~17:05Z` (post-deploy) |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main` |
| account | `ceo@xe.vn` (portal session; `tokenLen=311`, `portalLen=311`) |
| entry_evidence | `docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md` |
| prior_fail | `docs/qa/evidence/p1-ex-qa-https-residual-03-r5-20260528.md` (`fallbackAllCount=8`, FE not deployed) |
| deploy_marker | `container_started: 2026-05-28T16:29:30Z`; VPS `isRemoteLocalhostSupabaseMisconfig` grep count `2` |

## Scope Executed (runtime)

1. L0 curl: attendance `/hr/attendance?portal=1&companyId=main` **200**, `/hr/` **200**, `/api/hrm/` **200**.
2. Browser runtime on live HTTPS attendance (cache-bust query `_qa_r5r1=20260528`).
3. `performance` probe for `127.0.0.1:54321/rest/v1/*` **before** `Kiểm tra lại`.
4. In-session probe: `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`.
5. Clicked **`Kiểm tra lại`** on HRM sync banner.
6. Re-measured fallback counts + attendance probe **after** retry.
7. Pilot bundle check: `GET /hr/src/lib/hrmDataMode.ts` contains `isRemoteLocalhostSupabaseMisconfig` (R5 marker).

## Runtime Results

### A) Attendance fallback-zero gate (mandatory)

| Checkpoint | `fallbackAllCount` | `localhost54321AnyCount` | Verdict |
|------------|-------------------|------------------------|---------|
| Before `Kiểm tra lại` | **0** | **0** | **PASS** |
| After `Kiểm tra lại` | **0** | **0** | **PASS** |

- `fallbackSample`: `[]` (no `departments`, `attendance_sheets`, `work_shifts`, `attendance_rules`, `attendance_records`, `leave_requests` on `127.0.0.1:54321`).
- **Delta vs R5 (pre-deploy):** `8 → 0` — R5 deploy observable on pilot runtime.

### B) Attendance records probe (mandatory)

| When | HTTP | Code | Verdict |
|------|------|------|---------|
| Before retry | 200 | `HRM-ATT-200` | **PASS** |
| After retry | 200 | `HRM-ATT-200` | **PASS** |

### C) UI sync banner (informational)

- Banner: `HRM API Sync CONNECTED` before and after retry.
- Attendance overview UI rendered (Tổng quan, charts, menu nav).

### D) Deploy / bundle verification

| Check | Result |
|-------|--------|
| Vite dev entry (`/hr/@vite/client`) | Present (pilot mode) |
| `hrmDataMode.ts` R5 guard | `isRemoteLocalhostSupabaseMisconfig` **present** (HTTP 200) |

## Delta vs prior runs

| Criterion | R4 / R5 (no deploy) | R5-R1 (this run) |
|-----------|---------------------|------------------|
| `fallbackAllCount` before | 8 | **0** |
| `fallbackAllCount` after | 8 | **0** |
| Attendance probe | 200 `HRM-ATT-200` | 200 `HRM-ATT-200` |

## Overall QA Verdict

- **ack_status:** `PASS_TO_PM`
- **Reason:** Mandatory residual gates met — zero localhost Supabase REST on attendance load and after `Kiểm tra lại`; Nest attendance records probe **200 / HRM-ATT-200** both times. Aligns with DevOps R5 deploy evidence (`2026-05-28T16:29:30Z`).

## completion_report

- **closed_scope:**
  - Post-deploy runtime QA on HTTPS attendance URL with `ceo@xe.vn`.
  - `fallbackAllCount=0` before and after `Kiểm tra lại`.
  - Attendance records in-session probe **200 / HRM-ATT-200** before and after retry.
  - Confirmed R5 FE markers on pilot bundle.
- **residual:**
  - None for **P1-EX-HTTPS-RESIDUAL-03** attendance fallback gate on this URL/persona.
  - L2.5 J-HRM list→detail not executed this wave (out of work_item exit criteria; attendance overview has rows in late-list widgets only).

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R5-R1 — Re-gate P1-EX-HTTPS-RESIDUAL-03 on pilot. Entry: docs/qa/evidence/p1-ex-qa-https-residual-03-r5-r1-20260528.md (PASS_TO_PM: fallbackAllCount=0 before+after Kiểm tra lại; HRM-ATT-200). Exit: QC GO or GO WITH CONDITIONS for residual-03; cite L0–L2 attendance row + deploy evidence docs/ops/evidence/p1-ex-do-deploy-https-residual-03-r5-20260528.md. Publish docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r5-r1-20260528.md`
- **ack_status:** `PASS_TO_PM`
