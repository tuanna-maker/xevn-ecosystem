# QA Runtime Retest Evidence — P1-EX-QA-HTTPS-RESIDUAL-03-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R3` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-07-23 ~14:00 (UTC+7)` — **independent retest wave B** |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_qa_r3=20260723b` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| prior_qa (same-day A) | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md` wave A (**PASS** / `READY_FOR_QC`) |
| prior_qa (prior day) | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260722.md` (**PASS**) |
| prior_qc | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260722.md` (**GWC**) |
| historical_fail | R3 `2026-05-28` `fallbackAllCount=8` |
| U65 | zero-seed · browser-first · no `pnpm seed:*` |
| HOLD_DEPLOY | brand / company-col unrelated — **out of slice** |
| screenshots | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723-attendance.png` · `…-leave-detail.png` |
| ack_status | **READY_FOR_QC** |

## Scope Executed

Independent fresh retest (wave **B**, cache-bust `_qa_r3=20260723b`) of HTTPS residual **R3** attendance / auth lane — not a copy of wave A:

| Gate | This run (B) |
|------|--------------|
| Auth 5-endpoint (CON/INS/REC/ATT/PAY) HTTP 200 | **PASS** |
| `fallbackAllCount=0` before + after records nav + refresh | **PASS** |
| Zero `127.0.0.1:54321` / `54321/rest/v1` | **PASS** |
| Attendance records probe `HRM-ATT-200` | **PASS** |
| J-HRM-06 leave list → eye → modal Chi tiết yêu cầu nghỉ phép | **PASS** |
| Full RESIDUAL-03 / Phase 1 / PROD | **NOT claimed** |

## Commands (pack gate)

| Command | Purpose | Result | Exit |
|---------|---------|--------|------|
| `curl.exe` L0 perimeter (4 URLs) | Stack / route live | **200/200/200/200** | **0** |
| Browser + CDP Auth 5 + fallback scan | Product residual-03 R3 | **PASS** | n/a |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md` | Pack completeness | **PASS 8/8** | **0** |

## L2.5 journey matrix

| Journey | Click / probe path | Result |
|---------|-------------------|--------|
| **J-HRM-06** (supporting read) | Chấm công → **Dữ liệu chấm công** Nest records | **PASS** |
| **J-HRM-06** (list→detail) | Nghỉ phép → Danh sách yêu cầu → **lucide-eye** → modal **Chi tiết yêu cầu nghỉ phép** | **PASS** |
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
| After **Dữ liệu chấm công** nav | **0** | **0** | `[]` | **PASS** |
| After toolbar refresh (re-check control) | **0** | **0** | `[]` | **PASS** |

- Resource buffer: **216** (before records) → **219** (after records) → **230** (after refresh + Auth 5 fetches).
- Nest samples include:
  - `GET /api/hrm/attendance/overview?company_id=main&year=2026`
  - `GET /api/hrm/attendance/records?company_id=main&from_date=2026-07-23&to_date=2026-07-23&page=1&page_size=100`
- **Zero** `127.0.0.1:54321` / `localhost:54321` / `54321/rest/v1`.
- Error banner «Kiểm tra lại» / `HRM API Sync ERROR`: **absent** (healthy path; refresh control exercised).
- Historical R3 FAIL (`fallbackAllCount=8`) **not reproduced**.

## B) Attendance records probe (mandatory)

`GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

| When | HTTP | Code | Message | Verdict |
|------|------|------|---------|---------|
| Auth 5-list session fetch | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |
| After Dữ liệu chấm công UI | **200** | (Nest resource observed `page_size=100` day filter) | **PASS** |

UI empty day `23/07/2026` («Không có dữ liệu chấm công») = valid U65 zero-seed empty — **not FAIL**.

Screenshot: `p1-ex-qa-https-residual-03-r3-20260723-attendance.png`

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

## D) J-HRM-06 leave list→detail

| Step | Observed | Verdict |
|------|----------|---------|
| Nghỉ phép loads | Tổng yêu cầu **91** / Chờ duyệt **32** | **PASS** |
| `GET …/leave-requests?company_id=main` | **200** `HRM-LEAVE-200` | **PASS** |
| Tab Danh sách yêu cầu | Rows visible (HLD-0006 first) | **PASS** |
| Eye (`lucide-eye`) → modal | Title **Chi tiết yêu cầu nghỉ phép** | **PASS** |
| Detail fields | HLD-0006 · Nghỉ phép năm · 2 ngày · 15/08/2026–16/08/2026 · **Đã duyệt** | **PASS** |
| Not-found copy | «Không tìm thấy» **absent** | **PASS** |
| Scope parity note | No list→detail **404/409** on UI path | **PASS** |
| Fallback during leave path | `fallbackAllCount=0` | **PASS** |

Screenshot: `p1-ex-qa-https-residual-03-r3-20260723-leave-detail.png`

Note: display name still carries long `UF03-…` / `QA…` suffixes — cosmetic P2 only; **does not** reopen R3 fallback/auth gates.

## Delta vs prior

| Criterion | R3 FAIL 2026-05-28 | QA 2026-07-22 | QA wave A 2026-07-23 | **This run wave B 2026-07-23** |
|-----------|--------------------|---------------|----------------------|--------------------------------|
| `fallbackAllCount` before/after | 8 / 8 | 0 / 0 | 0 / 0 / 0 | **0 / 0 / 0** |
| Attendance `page_size=10` | 200 | 200 `HRM-ATT-200` | 200 `HRM-ATT-200` | **200 `HRM-ATT-200`** |
| Auth 5-list | mixed / later 5/5 | 5/5 | 5/5 | **5/5** |
| J-HRM-06 leave→eye→detail | — | PASS | PASS | **PASS** |

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **ack_status** | `READY_FOR_QC` |

All mandatory residual-03 R3 product gates **PASS** on pilot HTTPS (independent 2026-07-23 wave B retest).

**Not claimed:** Phase 1 Program DONE · PROD-READY · full HTTPS RESIDUAL-03 program · UF promote from NFR alone · brand / company-col deploy.

## Residual (not promoted)

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full **P1-EX-HTTPS-RESIDUAL-03** program (all J-HRM browser, member personas, PROD) | PM | Program |
| R2 | Phase 1 / PROD claim forbidden | PM/QC | Process |
| R3 | Leave display-name `UF03-…` / `QA…` suffix noise (cosmetic) | optional `dev-fe` / data | P2 (not R3 blocker) |

**No open product blocker** for residual-03 attendance / auth lane on `ceo@xe.vn` · `companyId=main` · nip.io (2026-07-23 wave B).

## completion_report

- **closed_scope:**
  - Fresh independent retest wave B (`_qa_r3=20260723b`) vs prior same-day wave A PASS + QC GWC `2026-07-22`.
  - Auth **5/5 HTTP 200**; `fallbackAllCount` **0/0/0** (load → records → refresh); attendance records **200 / HRM-ATT-200**; L0 **200×4**.
  - Historical `fallbackAllCount=8` still superseded.
  - J-HRM-06 leave list → eye → modal **Chi tiết yêu cầu nghỉ phép** PASS in residual pack.
- **residual:** program-wide RESIDUAL-03 + Phase1/PROD not promoted; optional P2 display-name noise only; HOLD_DEPLOY brand/company-col untouched.

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R3 — QC re-gate after QA independent retest wave B 2026-07-23. Entry: docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md (READY_FOR_QC: Auth 5/5 200 CON/INS/REC/ATT/PAY; fallbackAllCount 0 before+after records nav+refresh; zero 127.0.0.1:54321 / 54321/rest/v1; GET attendance/records page_size=10 → 200 HRM-ATT-200; L0 200×4; J-HRM-06 leave→eye→Chi tiết yêu cầu nghỉ phép PASS; pack 8/8). Screenshots: …-20260723-attendance.png · …-leave-detail.png. Cache-bust _qa_r3=20260723b. Prior: QA wave A same-day PASS + QC GWC 20260722. Exit: GO or GO WITH CONDITIONS for residual-03 attendance/auth lane only; do NOT claim Phase 1/PROD; HOLD_DEPLOY brand/company-col unrelated. Publish docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260723.md.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md`
- **ack_status:** `READY_FOR_QC`
- **pm_dispatch_hint:** `Dispatch qc P1-EX-QC-HTTPS-RESIDUAL-03-R3 same session — independent 2026-07-23 wave B retest PASS.`
