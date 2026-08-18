# QA Runtime Retest Evidence - P1-EX-QA-HTTPS-RESIDUAL-03-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-RESIDUAL-03-R3` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-07-19 (UTC+7)` |
| runtime_url | `https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main&_qa_r3=20260719` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| prior_evidence | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717.md` (PASS — reference only; **not** rubber-stamped) |
| qc_context | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r2-20260717.md` (GWC) |
| historical_fail | R3 `2026-05-28` `fallbackAllCount=8` |
| U65 | zero-seed · browser-first · probes L0/L1 support only |
| screenshot | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719-attendance.png` |

## Scope Executed

1. L0 perimeter `curl.exe` on HTTPS pilot (fresh 2026-07-19).
2. Browser login `ceo@xe.vn` → session JWT (`tokenLen=311`) → attendance hard nav with cache-bust `_qa_r3=20260719`.
3. `performance.getEntriesByType('resource')` scan for `127.0.0.1:54321/rest/v1/*` **before** records sub-nav.
4. DOM search for «Kiểm tra lại» → absent (no sync banner) → re-measure fallback **after** «Dữ liệu chấm công».
5. In-session Auth 5-endpoint table (contracts / insurance / recruitment / attendance / payroll).
6. Sub-nav Chấm công → Dữ liệu chấm công (Nest records path exercised in UI).
7. Spot: portal embed route `/command-center/hrm/attendance` HTTP **200**.

## Commands (pack gate)

| Command | Purpose | Result | Exit |
|---------|---------|--------|------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md` | QC evidence-pack completeness | **PASS** (after pack polish) | **0** |
| Browser L0 + Auth 5-endpoint + fallback scan (Cursor browser / CDP) | Product residual-03 R3 retest | **PASS** | n/a (interactive) |

## L2.5 journey matrix (supporting — residual-03 NFR lane)

| Journey | Click / probe path | Result |
|---------|-------------------|--------|
| **J-HRM-06** (supporting read on attendance → records) | Portal `/command-center/hrm/attendance` → iframe Chấm công → **Dữ liệu chấm công** (Nest records) | **PASS** |
| L2.5 cross-nav note | Detail click leave→request covered in sibling `p1-ex-qa-j-hrm-06-nipio-20260719.md` | **PASS** (sibling) |

Read-only module table (Auth 5-list + attendance records): see §B / §C — all rows **PASS**.

## L0 Perimeter

| Target | HTTP |
|--------|------|
| `https://14-225-217-232.nip.io/` | **200** |
| `/hr/attendance?portal=1&companyId=main` | **200** |
| `/hr/` | **200** |
| `/api/hrm/` | **200** |
| `/command-center/hrm/attendance` | **200** |

## A) Attendance fallback-zero (mandatory)

| Checkpoint | `fallbackAllCount` | `localhost54321AnyCount` | `fallbackSample` | Verdict |
|------------|-------------------|--------------------------|------------------|---------|
| After attendance load (before records nav) | **0** | **0** | `[]` | **PASS** |
| After Dữ liệu chấm công nav | **0** | **0** | `[]` | **PASS** |

- Resource buffer size at load: **182** entries; after records nav: **190**.
- Nest samples include:
  - `GET /api/hrm/attendance/overview?company_id=main&year=2026`
  - `GET /api/hrm/attendance/records?company_id=main&from_date=2026-07-19&to_date=2026-07-19&page=1&page_size=100`
  - `GET /api/hrm/attendance/attendance-sheets?company_id=main`
- **Zero** entries matching `127.0.0.1:54321`, `localhost:54321`, or `54321/rest/v1`.
- «Kiểm tra lại»: **not rendered** (`retryClicked=false`) — no sync-error banner; UI populated (Tổng quan + Dữ liệu chấm công). Same class as QA `2026-07-17` / `2026-06-05` — counts remain **0**, gate still **PASS**.

## B) Attendance records probe (mandatory)

`GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10`

| When | HTTP | Code | Message | Verdict |
|------|------|------|---------|---------|
| Browser session (Auth table) | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |
| After Dữ liệu chấm công nav | **200** | `HRM-ATT-200` | Attendance records listed | **PASS** |

## C) Auth 5-endpoint runtime (HTTPS pilot · browser session)

| ID | Endpoint | HTTP | Code |
|----|----------|------|------|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=5` | **200** | `HRM-CON-200` |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5` | **200** | `HRM-REC-200` |
| Attendance | `/api/hrm/attendance/records?company_id=main&page=1&page_size=10` | **200** | `HRM-ATT-200` |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page=1&page_size=5` | **200** | `HRM-PAY-200` |

- Login → redirect `/command-center` with `tokenPresent=true` (`tokenLen=311` from `xevn.portal.accessToken`).
- No `HRM-AUTH-001` on impacted flows.
- Auth **5/5 HTTP 200**.

## Console / Network / UI excerpts

- No `performance` resource names matching `54321` / `rest/v1` during attendance load or records sub-nav.
- No `HRM API Sync ERROR` / `127.0.0.1:54321` text in `document.body`.
- UI: Tổng quan rendered (Đi muộn 0 / Thực tế đã nghỉ 29 / Kế hoạch nghỉ 32); Dữ liệu chấm công Nest path live (empty day 19/07/2026 OK — U65 zero-seed).
- Portal embed L0: `/command-center/hrm/attendance` → **200**.

## Delta vs prior

| Criterion | R3 FAIL 2026-05-28 | QA PASS 2026-07-17 | **This run 2026-07-19** |
|-----------|--------------------|--------------------|-------------------------|
| `fallbackAllCount` before/after | 8 / 8 | 0 / 0 | **0 / 0** |
| Attendance `page_size=10` | 200 | 200 `HRM-ATT-200` | **200 `HRM-ATT-200`** |
| Auth 5-list | mixed / later 5/5 | 5/5 | **5/5** |
| Freshness | — | — | **Fresh browser retest (not rubber-stamp)** |

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** |
| **ack_status** | `PASS_TO_PM` |

All mandatory exit criteria met on current pilot HTTPS runtime (2026-07-19): fallback-zero, attendance **200 / HRM-ATT-200**, Auth 5-endpoint **200**, no localhost Supabase REST.

**Not claimed:** Phase 1 Program DONE · PROD-READY · UF promote from NFR probe alone.

## Residual

No residual for residual-03 attendance fallback / Auth 5-endpoint gate on this URL/persona (`ceo@xe.vn` · `companyId=main` · nip.io 2026-07-19).

- «Kiểm tra lại» absent when sync banner not shown — documented; does not block PASS.
- Pack polish only (`P1-EX-QA-RES03-PACK-POLISH-02`) — product gates unchanged.

## completion_report

- **closed_scope:**
  - Fresh retest `P1-EX-QA-HTTPS-RESIDUAL-03-R3` on `https://14-225-217-232.nip.io` with `ceo@xe.vn` (2026-07-19).
  - Auth 5-endpoint table **5/5 HTTP 200**.
  - `fallbackAllCount=0` before and after records sub-nav; zero `127.0.0.1:54321/rest/v1/*`.
  - Attendance records probe **200 / HRM-ATT-200** (page_size=10) stable.
  - Evidence-pack sections completed for `verify:qc:evidence-pack` exit **0**.
- **residual:** none remaining (see ## Residual).

## Handoff Packet

- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-EX-QC-HTTPS-RESIDUAL-03-R3-R3 — QC re-gate residual-03 after QA fresh retest 2026-07-19. Entry: docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md (PASS_TO_PM: fallbackAllCount=0 before+after; GET attendance/records page_size=10 → 200 HRM-ATT-200; Auth 5-endpoint 5/5 200; no 127.0.0.1:54321). Prior QC GWC docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r2-20260717.md. Exit: GO or GO WITH CONDITIONS for residual-03 attendance lane only; do NOT claim Phase 1/PROD. Publish docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r3-20260719.md.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md`
- **ack_status:** `PASS_TO_PM`
- **pm_dispatch_hint:** `Dispatch qc P1-EX-QC-HTTPS-RESIDUAL-03-R3-R3 same session.`
