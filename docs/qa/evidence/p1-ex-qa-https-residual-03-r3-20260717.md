# QA Runtime Retest Evidence - P1-EX-QA-HTTPS-RESIDUAL-03-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R3` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-07-17 (UTC+7)` |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_qa_r3=20260717` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| prior_evidence | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260605.md` (PASS) |
| qc_context | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r1-20260605.md` (GWC) |
| historical_fail | R3 `2026-05-28` `fallbackAllCount=8` |
| U65 | zero-seed · browser-first · probes L0/L1 support only |
| screenshot | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717-attendance.png` |

## Scope Executed

1. L0 perimeter `curl.exe` on HTTPS pilot.
2. Browser session (existing portal JWT `tokenLen=311`) -> attendance hard reload with cache-bust.
3. `performance.getEntriesByType('resource')` scan for `127.0.0.1:54321/rest/v1/*` **before** retry path.
4. DOM search for «Kiem tra lai» -> click if present -> re-measure fallback + attendance probe **after**.
5. In-session Auth 5-endpoint table (contracts / insurance / recruitment / attendance / payroll).
6. Sub-nav Cham cong -> Du lieu cham cong (Nest records path exercised in UI).
7. Spot: portal embed route `/command-center/hrm/attendance` HTTP **200**.

## L0 Perimeter

| Target | HTTP |
|--------|------|
| `https://14-225-217-232.nip.io/` | **200** |
| `/hr/attendance?portal=1&companyId=main` | **200** |
| `/hr/` | **200** |
| `/api/hrm/` | **200** |
| FE guard `hrmDataMode.ts` contains `isRemoteLocalhostSupabaseMisconfig` | **present** |

## A) Attendance fallback-zero (mandatory)

| Checkpoint | `fallbackAllCount` | `localhost54321AnyCount` | `fallbackSample` | Verdict |
|------------|-------------------|--------------------------|------------------|---------|
| After hard reload (before retry) | **0** | **0** | `[]` | **PASS** |
| After retry path / post-nav | **0** | **0** | `[]` | **PASS** |

- Resource buffer size at load: **181** entries; Nest samples include:
  - `GET /api/hrm/attendance/overview?company_id=main&year=2026`
  - `GET /api/hrm/attendance/records?company_id=main&from_date=2026-07-17&to_date=2026-07-17&page=1&page_size=100` (Du lieu cham cong)
  - `GET /api/hrm/attendance/attendance-sheets?company_id=main`
- **Zero** entries matching `127.0.0.1:54321`, `localhost:54321`, or `54321/rest/v1`.
- «Kiem tra lai»: **not rendered** (`retryClicked=false`) — no sync-error banner; UI populated (Tong quan). Same class as QA `2026-06-05` — counts remain **0**, gate still **PASS**.

## B) Attendance records probe (mandatory)

`GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

| When | HTTP | Code | Message | Verdict |
|------|------|------|---------|---------|
| Browser session (before retry) | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |
| Browser session (after retry path) | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |
| After Du lieu cham cong nav | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |

## C) Auth 5-endpoint runtime (HTTPS pilot · browser session)

| ID | Endpoint | HTTP | Code |
|----|----------|------|------|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5` | **200** | `HRM-REC-200` |
| Attendance | `/api/hrm/attendance/records?company_id=main&page=1&page_size=10` | **200** | `HRM-ATT-200` |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page=1&page_size=5` | **200** | `HRM-PAY-200` |

- `tokenPresent=true` (`tokenLen=311` from `xevn.portal.accessToken`).
- No `HRM-AUTH-001` on impacted flows.
- Insurance list returns business code `HRM-CON-200` (shared envelope); HTTP **200** satisfies gate.

## Console / Network / UI excerpts

- No `performance` resource names matching `54321` / `rest/v1` during attendance load or records sub-nav.
- No `HRM API Sync ERROR` / `127.0.0.1:54321` text in `document.body`.
- UI: Tong quan rendered (Di muon 0 / Thuc te da nghi 38 / Ke hoach nghi 29); Du lieu cham cong Nest path live (empty day OK).
- Portal embed L0: `/command-center/hrm/attendance` -> **200**.

## Delta vs prior

| Criterion | R3 FAIL 2026-05-28 | QA PASS 2026-06-05 | **This run 2026-07-17** |
|-----------|--------------------|--------------------|-------------------------|
| `fallbackAllCount` before/after | 8 / 8 | 0 / 0 | **0 / 0** |
| Attendance `page_size=10` | 200 | 200 `HRM-ATT-200` | **200 `HRM-ATT-200`** |
| Auth 5-list | mixed / later 5/5 | 5/5 | **5/5** |
| Regression vs R3 FAIL | — | not reproduced | **still not reproduced** |

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **ack_status** | `PASS_TO_PM` |

All mandatory exit criteria met on current pilot HTTPS runtime (2026-07-17): fallback-zero, attendance **200 / HRM-ATT-200**, Auth 5-endpoint **200**, no localhost Supabase REST.

**Not claimed:** Phase 1 Program DONE · PROD-READY.

## completion_report

- **closed_scope:**
  - Retest `P1-EX-QA-HTTPS-RESIDUAL-03-R3` on `https://14-225-217-232.nip.io` with `ceo@xe.vn`.
  - Auth 5-endpoint table **5/5 HTTP 200**.
  - `fallbackAllCount=0` before and after retry path; zero `127.0.0.1:54321/rest/v1/*`.
  - Attendance records probe **200 / HRM-ATT-200** (page_size=10) stable.
- **residual:**
  - None for residual-03 attendance fallback gate on this URL/persona.
  - «Kiem tra lai» absent when sync banner not shown — documented; does not block PASS.

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R3-R2 — QC re-gate residual-03 after QA retest 2026-07-17. Entry: docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717.md (PASS_TO_PM: fallbackAllCount=0 before+after; GET attendance/records page_size=10 → 200 HRM-ATT-200; Auth 5-endpoint 5/5 200; no 127.0.0.1:54321). Prior QC GWC docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r1-20260605.md. Exit: GO or GO WITH CONDITIONS for residual-03 attendance lane only; do NOT claim Phase 1/PROD. Publish docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r2-20260717.md.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717.md`
- **ack_status:** `PASS_TO_PM`
- **pm_dispatch_hint:** `Dispatch qc P1-EX-QC-HTTPS-RESIDUAL-03-R3-R2 same session.`

