# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R3` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-06-05 (UTC+7)` |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_qa_r3=20260605` |
| account | `ceo@xe.vn` / `Xevn@2026` |
| historical | R3 FAIL `2026-05-28` (`fallbackAllCount=8`); R5-R1 PASS `2026-05-28` post-deploy |
| automation | Browser MCP (CDP `performance` + in-session `fetch`); Node `tmp-p1-ex-qa-https-residual-03-r3-api-probe.mjs` |

## Scope Executed

1. L0 perimeter: `curl.exe` GET attendance page, `/hr/`, `/api/hrm/` → **200**.
2. Portal API login + five HRM list probes (Node, same origin headers).
3. Browser session: login → attendance load → measure `127.0.0.1:54321/rest/v1/*` **before** retry path.
4. DOM search for `Kiểm tra lại` → click if present → re-measure fallback + attendance probe **after**.
5. In-browser session table (token present, `tokenLen=311`).

## L0 Perimeter

| Target | HTTP |
|--------|------|
| `/hr/attendance?portal=1&companyId=main` | **200** |
| `/hr/` | **200** |
| `/api/hrm/` | **200** |

## A) Attendance fallback-zero (mandatory)

| Checkpoint | `fallbackAllCount` | `fallbackSample` | Verdict |
|------------|-------------------|------------------|---------|
| After page load (before retry) | **0** | `[]` | **PASS** |
| After retry path | **0** | `[]` | **PASS** |

- **Zero** network entries matching `127.0.0.1:54321` or `54321/rest/v1` in `performance.getEntriesByType('resource')`.
- **Delta vs R3 (2026-05-28):** `8 → 0` (regression not reproduced; aligns with R5-R1 closure).
- `Kiểm tra lại`: **not rendered** on this load (no sync-error banner; HRM overview UI populated). Retry path executed via DOM query — `retryClicked=false`; post-check counts unchanged at **0**.

## B) Attendance records probe (mandatory)

`GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

| When | HTTP | Code | Verdict |
|------|------|------|---------|
| Browser session (before retry) | **200** | `HRM-ATT-200` | **PASS** |
| Browser session (after retry path) | **200** | `HRM-ATT-200` | **PASS** |
| Node probe (curl stack) | **200** | `HRM-ATT-200` | **PASS** |

## C) Auth / five HRM endpoints (browser session)

| ID | Endpoint | HTTP | Code |
|----|----------|------|------|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5` | **200** | `HRM-REC-200` |
| Attendance | `/api/hrm/attendance/records?company_id=main&page=1&page_size=5` | **200** | `HRM-ATT-200` |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page=1&page_size=5` | **200** | `HRM-PAY-200` |

- `tokenLen=311`; no `HRM-AUTH-001` on impacted flows.
- Note: insurance list returns business code `HRM-CON-200` (shared envelope); HTTP **200** satisfies gate.

## Console / UI excerpt

- No console lines captured matching `54321`, `127.0.0.1`, `Sync ERROR`, or `409`/`500` during attendance load.
- UI: attendance **Tổng quan** rendered (charts, late-list widgets); no `HRM API Sync ERROR` banner text in `document.body`.

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **ack_status** | `READY_FOR_QC` |

All mandatory exit criteria met on **current** pilot runtime (2026-06-05): fallback-zero, attendance **200 / HRM-ATT-200**, five auth endpoints **200** in browser session.

## completion_report

- **closed_scope:**
  - Regression retest of HTTPS attendance residual R3 on live nip.io.
  - `fallbackAllCount=0` before and after retry path; no localhost Supabase REST.
  - Attendance records probe **200 / HRM-ATT-200** (page_size=10) stable.
  - Five HRM auth/list endpoints **200** in authenticated browser session.
- **residual:**
  - None for **P1-EX-HTTPS-RESIDUAL-03** attendance fallback on this URL/persona.
  - `Kiểm tra lại` button absent when sync banner not shown — documented; does not block PASS (counts already zero).

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `QC re-gate P1-EX-HTTPS-RESIDUAL-03 on pilot: audit docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260605.md — confirm R3 attendance fallback-zero (fallbackAllCount=0), attendance GET page_size=10 → HRM-ATT-200, five HRM auth endpoints HTTP 200 for ceo@xe.vn on https://14-225-217-232.nip.io. Prior R3 FAIL (2026-05-28) not reproduced; align with R5-R1. Issue GO or GO WITH CONDITIONS for residual-03 lane.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260605.md`
- **ack_status:** `READY_FOR_QC`
- **pm_dispatch_hint:** _(n/a — PASS)_
