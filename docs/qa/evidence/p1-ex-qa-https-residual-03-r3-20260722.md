# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R3` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-07-22 (UTC+7)` |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_qa_r3=20260722b` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| prior_qc | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260720.md` (**GWC**) |
| prior_qa | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md` (PASS) |
| historical_fail | R3 `2026-05-28` `fallbackAllCount=8` |
| U65 | zero-seed · browser-first · no `pnpm seed:*` |
| screenshots | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260722-attendance.png` · `…-leave-detail.png` |
| ack_status | **READY_FOR_QC** |

## Scope Executed

Retest HTTPS residual **R3** blockers still open vs last QC residual list (`2026-07-20`):

| QC residual / condition | This run |
|-------------------------|----------|
| Product gates (Auth 5/5, fallback 0/0, records HRM-ATT-200) | **Re-verified PASS** |
| **C-RES03R3-04** J-HRM-06 list→detail deferred in residual pack | **CLOSED in-pack** (leave list → eye → modal) |
| Full RESIDUAL-03 program / all J-HRM / member personas | **Still not promoted** |
| **C-RES03R3-05** Phase 1 / PROD | **NOT claimed** |

## Commands (pack gate)

| Command | Purpose | Result | Exit |
|---------|---------|--------|------|
| `curl.exe` L0 perimeter (4 URLs) | Stack / route live | **200/200/200/200** | **0** |
| Browser + CDP Auth 5 + fallback scan | Product residual-03 R3 | **PASS** | n/a |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260722.md` | Pack completeness | **PASS 8/8** | **0** |

## L2.5 journey matrix

| Journey | Click / probe path | Result |
|---------|-------------------|--------|
| **J-HRM-06** (supporting read) | Chấm công → **Dữ liệu chấm công** Nest records | **PASS** |
| **J-HRM-06** (list→detail — **C-RES03R3-04**) | Nghỉ phép → Danh sách yêu cầu → **lucide-eye** → modal **Chi tiết yêu cầu nghỉ phép** | **PASS** |
| Full J-HRM 7/7 | Out of residual-03 R3 slice | **Out of slice** |

## L0 Perimeter

| Target | HTTP |
|--------|------|
| `https://14-225-217-232.nip.io/` | **200** |
| `/hr/attendance?portal=1&companyId=main` | **200** |
| `/api/hrm/` | **200** |
| `/command-center/hrm/attendance` | **200** |

## A) Attendance fallback-zero (mandatory)

| Checkpoint | `fallbackAllCount` | `localhost54321AnyCount` | `fallbackSample` | Verdict |
|------------|-------------------|--------------------------|------------------|---------|
| After attendance load (before records nav) | **0** | **0** | `[]` | **PASS** |
| After Dữ liệu chấm công nav | **0** | **0** | `[]` | **PASS** |

- Resource buffer: **216** (before records) → **224** (after).
- Nest samples include:
  - `GET /api/hrm/attendance/overview?company_id=main&year=2026`
  - `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`
  - `GET /api/hrm/attendance/records?company_id=main&from_date=2026-07-22&to_date=2026-07-22&page=1&page_size=100`
  - `GET /api/hrm/attendance/attendance-sheets?company_id=main`
- **Zero** `127.0.0.1:54321` / `localhost:54321` / `54321/rest/v1`.
- «Kiểm tra lại» / `HRM API Sync ERROR`: **absent**.
- Historical R3 FAIL (`fallbackAllCount=8`) **not reproduced**.

## B) Attendance records probe (mandatory)

`GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

| When | HTTP | Code | Message | Verdict |
|------|------|------|---------|---------|
| Auth 5-list session fetch | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |
| After Dữ liệu chấm công UI | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |

UI empty day `22/07/2026` («Không có dữ liệu chấm công») = valid U65 zero-seed empty — **not FAIL**.

## C) Auth 5-endpoint runtime (HTTPS pilot · browser session JWT)

`tokenPresent=true` · `tokenLen=311` (`xevn.portal.accessToken`)

| ID | Endpoint | HTTP | Code |
|----|----------|------|------|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5` | **200** | `HRM-REC-200` |
| Attendance | `/api/hrm/attendance/records?company_id=main&page=1&page_size=10` | **200** | `HRM-ATT-200` |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page=1&page_size=5` | **200** | `HRM-PAY-200` |

Auth **5/5 HTTP 200**.

## D) J-HRM-06 leave list→detail (**C-RES03R3-04** close)

| Step | Observed | Verdict |
|------|----------|---------|
| Nghỉ phép loads | Tổng yêu cầu **91** / Chờ duyệt **32** | **PASS** |
| `GET …/leave-requests?company_id=main` | **200** `HRM-LEAVE-200` | **PASS** |
| Tab Danh sách yêu cầu | Rows visible (e.g. HLD-0006) | **PASS** |
| Eye (`lucide-eye`) → modal | Title **Chi tiết yêu cầu nghỉ phép** | **PASS** |
| Detail fields | HLD-0006 · Nghỉ phép năm · 2 ngày · 15/08/2026–16/08/2026 · Đã duyệt | **PASS** |
| Not-found copy | «Không tìm thấy» **absent** | **PASS** |
| Scope parity note | No list→detail **404/409** on UI path | **PASS** |

Screenshot: `p1-ex-qa-https-residual-03-r3-20260722-leave-detail.png`

Note: display name string contains long `UF03-…` / `QA…` suffixes (data-display noise) — **does not** reopen R3 fallback/auth gates; optional P2 hygiene for FE/data owner (not blocker for this NFR slice).

## Delta vs prior

| Criterion | R3 FAIL 2026-05-28 | QA PASS 2026-07-19 | QC GWC 2026-07-20 | **This run 2026-07-22** |
|-----------|--------------------|--------------------|-------------------|-------------------------|
| `fallbackAllCount` before/after | 8 / 8 | 0 / 0 | concurred | **0 / 0** |
| Attendance `page_size=10` | 200 | 200 `HRM-ATT-200` | concurred | **200 `HRM-ATT-200`** |
| Auth 5-list | mixed / later 5/5 | 5/5 | concurred | **5/5** |
| **C-RES03R3-04** J-HRM-06 in residual pack | — | sibling only | **Deferred** | **PASS in-pack** |

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **ack_status** | `READY_FOR_QC` |

All mandatory residual-03 R3 product gates still **PASS** on pilot HTTPS; deferred QC condition **C-RES03R3-04** closed with in-pack leave→detail click.

**Not claimed:** Phase 1 Program DONE · PROD-READY · full HTTPS RESIDUAL-03 program · UF promote from NFR alone.

## Residual (not promoted)

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full **P1-EX-HTTPS-RESIDUAL-03** program (all J-HRM browser, member personas, PROD) | PM | Program |
| R2 | **C-RES03R3-05** Phase 1 / PROD claim forbidden | PM/QC | Process |
| R3 | Leave display-name `UF03-…` / `QA…` suffix noise on HLD-0006 row (cosmetic) | optional `dev-fe` / data | P2 (not R3 blocker) |

**No open product blocker** for residual-03 attendance / auth lane on `ceo@xe.vn` · `companyId=main` · nip.io (2026-07-22).

## completion_report

- **closed_scope:**
  - Fresh retest vs QC GWC residual list `p1-ex-qc-https-residual-03-r3-20260720.md`.
  - Auth **5/5 HTTP 200**; `fallbackAllCount` **0/0**; attendance records **200 / HRM-ATT-200**; L0 **200×4**.
  - Historical `fallbackAllCount=8` still superseded.
  - **C-RES03R3-04** closed: J-HRM-06 leave list → eye → detail modal in this residual artifact.
- **residual:** program-wide RESIDUAL-03 + Phase1/PROD not promoted; optional P2 display-name noise only.

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R3 — QC re-gate after QA fresh retest 2026-07-22. Entry: docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260722.md (READY_FOR_QC: Auth 5/5 200; fallbackAllCount 0/0 before+after; GET attendance/records page_size=10 → 200 HRM-ATT-200; L0 200×4; J-HRM-06 leave→eye→Chi tiết yêu cầu nghỉ phép PASS — closes prior GWC condition C-RES03R3-04). Prior QC GWC docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260720.md. Exit: GO or GO WITH CONDITIONS for residual-03 attendance/auth lane only; confirm C-RES03R3-04 CLOSED; do NOT claim Phase 1/PROD. Publish docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260722.md.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260722.md`
- **ack_status:** `READY_FOR_QC`
- **pm_dispatch_hint:** `Dispatch qc P1-EX-QC-HTTPS-RESIDUAL-03-R3 same session — close C-RES03R3-04.`
