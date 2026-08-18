# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R3 (2026-07-27)

work_item_id: `P1-EX-QC-HTTPS-RESIDUAL-03-R3`
ack_status: `PASS_TO_PM`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-27` |
| wave | Fresh re-gate after QA `_qa_r3=20260727` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R3 attendance / auth lane only (fallback-zero + Nest records + auth 5-list + in-pack J-HRM-06 leave→detail) |
| prior_qc | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260725.md` (**GWC**) — **reconfirm only; no new program closure** |
| qa_handoff | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727.md` (**PASS** / `PASS_TO_PM`) |
| pilot_url | `https://14-225-217-232.nip.io` · cache-bust `_qa_r3=20260727` |
| persona | `ceo@xe.vn` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| U65 | zero-seed · no seed in evidence chain |
| HOLD_DEPLOY | brand / company-col — **unrelated / out of slice** |
| Phase1 / PROD / full RESIDUAL-03 claim | **NONE** |

## Scope audited

QC re-gate of residual-03 **attendance / auth lane** after QA fresh independent retest (`P1-EX-QA-HTTPS-RESIDUAL-03-R3`, cache-bust `_qa_r3=20260727`) **PASS** / `PASS_TO_PM`.

Purpose: **reconfirm** product gates vs prior QC GWC `2026-07-25` (+ earlier **C-RES03R3-04 CLOSED** baseline); keep closed conditions closed; enforce **NOT** Phase 1 / PROD / full program closure. Does **not** claim a new program milestone beyond prior GWC.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full HTTPS RESIDUAL-03 program closure · Excellence T6 · UF promote from NFR alone · brand / company-col deploy (HOLD_DEPLOY).

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727.md` | QA | **Authoritative** — PASS / `PASS_TO_PM` · `_qa_r3=20260727` |
| 2 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727-attendance.png` | QA | Present — Dữ liệu chấm công · empty day `27/07/2026` U65 OK |
| 3 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727-leave-detail.png` | QA | Present — modal **Chi tiết yêu cầu nghỉ phép** · Chờ duyệt · PORTAL-GCEO |
| 4 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727-runtime.json` | QA | fallback 0/0/0/0 · Auth 5/5 · Nest samples · leaveOk |
| 5 | Prior QC `2026-07-25` GWC | QC | Baseline — **C-RES03R3-04 CLOSED**; this wave = **reconfirm** |
| 6 | Historical R3 FAIL (`fallbackAllCount=8`, 2026-05-28) | QA (historical) | **Superseded** — not reproduced |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260727.md
→ exit 0 (8/8 PASS) — QC 2026-07-27
```

| Check | Result |
|-------|--------|
| Pack completeness (QA handoff) | **8/8 PASS** |
| Screenshots attendance + leave-detail | **Present** (QC visual read) |
| Runtime JSON | **Present** (QC independent read) |

## Gate matrix (R3 mandatory — concurred · 2026-07-27)

| Gate | Expected | Actual (QA + QC spot) | QC verdict |
|------|----------|----------------------|------------|
| Auth 5-endpoint | 5/5 HTTP **200** | CON / INS / REC / ATT / PAY all **200** (runtime.json) | **PASS** |
| A) `fallbackAllCount` before records | **0** | **0** / `localhost54321AnyCount=0` / `[]` | **PASS** |
| A) `fallbackAllCount` after records | **0** | **0** / `[]` | **PASS** |
| A) `fallbackAllCount` after refresh | **0** | **0** | **PASS** |
| A) `fallbackAllCount` after Auth records | **0** | **0** | **PASS** |
| No `127.0.0.1:54321` / `54321/rest/v1` | Zero | Nest samples only; buffer 217→220→221→226; `console54321Count=0` | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | Auth table + Nest `page_size=10` in nestAttSample | **PASS** |
| L0 `/` · attendance · `/api/hrm/` · CC embed | **200** | QA curl + QC `curl.exe` **200/200/200/200** | **PASS** |
| Historical R3 FAIL (`fallbackAllCount=8`) | Not reproduced | Still **0/0/0/0** | **CLOSED / superseded** |
| **C-RES03R3-04** J-HRM-06 leave→eye→detail | In residual pack | Modal **Chi tiết yêu cầu nghỉ phép**; PORTAL-GCEO; LVT_01; **Chờ duyệt**; no 404/409 | **CLOSED** (reconfirmed 2026-07-27) |

## QC spot-check (2026-07-27)

| Check | Method | Result |
|-------|--------|--------|
| `https://14-225-217-232.nip.io/` | `curl.exe` | **200** |
| `/hr/attendance?portal=1&companyId=main` | `curl.exe` | **200** |
| `/api/hrm/` | `curl.exe` | **200** |
| `/command-center/hrm/attendance` | `curl.exe` | **200** |
| Evidence pack verify (QA MD) | `pnpm run verify:qc:evidence-pack` | **8/8 exit 0** |
| Attendance screenshot | Independent visual read | **Dữ liệu chấm công** · date `27/07/2026` · empty «Không có dữ liệu chấm công» (U65 valid) · refresh control · no ERROR banner · KPI zeros |
| Leave-detail screenshot | Independent visual read | Modal **Chi tiết yêu cầu nghỉ phép**; CEO Tập đoàn; PORTAL-GCEO; LVT_01; 1 ngày; `23/01/2027`–`23/01/2027`; **Chờ duyệt**; eye path consistent with QA §D |
| Runtime JSON | Independent read | `fallbackAllCount=0` ×4 phases; Auth 5×200; Nest `/api/hrm/attendance/*` only; `leaveDetail.hasDetailTitle=true`; `verdict.pass=true` |
| Full browser re-probe | Not re-run | QA artifact authoritative + screenshots + runtime JSON confirm product gates |

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 8/8 | **Process** | **PASS** |
| Auth 5/5 · fallback 0/0/0/0 · HRM-ATT-200 | **PRODUCT** | **PASS** |
| J-HRM-06 leave→detail in residual pack | **PRODUCT** | **PASS** — **C-RES03R3-04** remains **CLOSED** |
| Empty attendance day `27/07/2026` | **PRODUCT** (U65 valid empty) | Not FAIL |
| Optional leave display cosmetic noise | **PRODUCT P2 cosmetic** | Not R3 blocker |
| Local `qc:dev-stack` not run | **ENV** | Not required for nip.io-only slice |
| Phase 1 / PROD / full RESIDUAL-03 | **Process** | **Forbidden claim** — **C-RES03R3-05** |
| HOLD_DEPLOY brand / company-col | **Process** | Out of slice — not gate input |
| Prior GWC 2026-07-25 already on file | **Process** | This wave = **reconfirm**; no program upgrade |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| Attendance embed / fallback-zero (P-CC-07 class) | API + zero localhost + portal embed L0 **200** | **PASS** (runtime layer) |
| **J-HRM-06** supporting read (attendance → records Nest) | In QA artifact § L2.5 | **PASS** (supporting) |
| **J-HRM-06** list→detail browser click (leave→eye→modal) | **In residual pack** + leave-detail screenshot + runtime leaveDetail | **PASS** — **C-RES03R3-04 CLOSED** (reconfirmed 2026-07-27) |
| Full J-HRM **7/7** HTTPS browser | Not in R3 artifact | **Out of slice** |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19:** Mandatory L2.5 for this residual-03 R3 NFR slice (attendance runtime + leave→detail) is **PASS**. **NO-GO not triggered.**

### J-* tested vs deferred (GWC explicit)

| ID | Status |
|----|--------|
| J-HRM-06 (attendance records Nest + leave list→detail) | **PASS** (in-pack) |
| Full J-HRM 7/7 | **Deferred** — out of slice |
| Member-CEO journeys | **Deferred** — out of slice |

## Decision rationale

**GO WITH CONDITIONS** — All mandatory audit items from PM dispatch are **met** on independent 2026-07-27 pilot HTTPS retest; prior closed conditions stay closed; **no upgrade** beyond prior GWC `2026-07-25`:

1. Auth 5-endpoint = **5/5 HTTP 200** (CON/INS/REC/ATT/PAY)
2. Attendance `fallbackAllCount=0` before + after records + after refresh + after Auth fetch; no localhost Supabase REST
3. Attendance records `GET …/records?…&page_size=10` = **200** `HRM-ATT-200`
4. Historical R3 FAIL (`fallbackAllCount=8`) **superseded**
5. Evidence pack **8/8**
6. **C-RES03R3-04 CLOSED** (reconfirmed 2026-07-27) — J-HRM-06 leave list → lucide-eye → modal **Chi tiết yêu cầu nghỉ phép** in residual QA pack + QC screenshot/runtime read

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / nip.io attendance + leave detail path only — **not** unconditional RESIDUAL-03 program sign-off · **NOT Phase 1 DONE** · **NOT PROD-READY**.

### Does this close HTTPS RESIDUAL-03 attendance / auth lane?

**Yes (bounded)** — P0 localhost Supabase fallback on audited attendance paths remains **closed**; in-pack L2.5 leave→detail remains **closed** as of QA + QC 2026-07-27 reconfirmation. **Does not** close full RESIDUAL-03 / Phase 1 / PROD.

## Conditions

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io only | QA | **MET** (scope bound) |
| **C-RES03R3-02** | Evidence pack format | QA | **CLOSED** — verify **8/8** |
| **C-RES03R3-03** | Command Center embed `/command-center/hrm/attendance` | QA | **MET** (HTTP **200** L0) |
| **C-RES03R3-04** | J-HRM-06 list→detail inside residual artifact | QA | **CLOSED** (2026-07-22; reconfirmed 2026-07-23 / 2026-07-25 / **2026-07-27**) |
| **C-RES03R3-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** — **forbidden claim** (standing) |

## Residual (not promoted)

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full **P1-EX-HTTPS-RESIDUAL-03** program (all J-HRM browser, member personas, PROD) | PM | Program |
| R2 | **C-RES03R3-05** Phase 1 / PROD claim forbidden | PM/QC | Process |
| R3 | Optional leave display cosmetic noise | optional `dev-fe` / data | P2 (not R3 blocker) |

**No open product blocker** for residual-03 attendance / auth lane on `ceo@xe.vn` · `companyId=main` · nip.io (2026-07-27).

## completion_report

- **closed_scope:**
  - Re-gate of QA `p1-ex-qa-https-residual-03-r3-20260727.md` (`_qa_r3=20260727`) vs prior QC GWC `2026-07-25`.
  - Confirmed: Auth **5/5 200**, `fallbackAllCount` **0/0/0/0** (load → records → refresh → Auth), attendance **HRM-ATT-200**, L0 **200×4**, pack **8/8**.
  - **C-RES03R3-04 CLOSED** (reconfirmed 2026-07-27) — leave list → eye → **Chi tiết yêu cầu nghỉ phép** (QA §D + QC screenshot + runtime leaveDetail).
  - Issued **GO WITH CONDITIONS** for residual-03 **attendance / auth lane only** on pilot HTTPS — **reconfirm**, not new program closure.
- **residual:**
  - Full RESIDUAL-03 program + member personas still not promoted (R1).
  - **NOT** Phase 1 DONE / **NOT** PROD (**C-RES03R3-05**).
  - Optional P2 leave cosmetic (R3) — not gate blocker.
  - HOLD_DEPLOY brand/company-col untouched / out of slice.

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3 PASS_TO_PM (2026-07-27 reconfirm): GO WITH CONDITIONS for residual-03 attendance/auth lane on https://14-225-217-232.nip.io (ceo@xe.vn / companyId=main). Fresh QA _qa_r3=20260727 concurs prior GWC 2026-07-25: Auth 5/5 200 (CON/INS/REC/ATT/PAY); fallbackAllCount 0 before+after records+refresh+Auth; zero 127.0.0.1:54321 / 54321/rest/v1; GET attendance/records page_size=10 → 200 HRM-ATT-200; L0 200×4; J-HRM-06 leave→eye→Chi tiết yêu cầu nghỉ phép PASS (C-RES03R3-04 CLOSED reconfirmed). Standing: NOT Phase 1 / NOT PROD (C-RES03R3-05); full RESIDUAL-03 program not promoted; HOLD_DEPLOY brand/company-col unrelated. Evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260727.md. Update bus / TEAM_WORKING_NOW — keep R3 attendance+auth+in-pack L2.5 leave detail promoted; do not claim Phase 1 DONE or PROD-READY; do not promote UF from NFR alone; do not treat this reconfirm as new program closure. Continue open HTTPS/matrix backlog outside this slice.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260727.md`
- **ack_status:** `PASS_TO_PM`
