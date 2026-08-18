# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R3 (2026-07-23 · **wave B**)

work_item_id: `P1-EX-QC-HTTPS-RESIDUAL-03-R3`
ack_status: `PASS_TO_PM`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-23` |
| wave | **B** — re-gate after independent QA `_qa_r3=20260723b` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R3 attendance / auth lane only (fallback-zero + Nest records + auth 5-list + in-pack J-HRM-06 leave→detail) |
| prior_qc (same day wave A) | This file earlier revision + `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260722.md` (**GWC** — **C-RES03R3-04 CLOSED**) — **reconfirm only; no new program closure** |
| qa_handoff | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md` (**PASS** / `READY_FOR_QC` · wave **B**) |
| pilot_url | `https://14-225-217-232.nip.io` · cache-bust `_qa_r3=20260723b` |
| persona | `ceo@xe.vn` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| U65 | zero-seed · no seed in evidence chain |
| HOLD_DEPLOY | brand / company-col — **unrelated / out of slice** |
| Phase1 / PROD / full RESIDUAL-03 claim | **NONE** |

## Scope audited

QC **wave B re-gate** of residual-03 **attendance / auth lane** after QA independent retest wave B (`P1-EX-QA-HTTPS-RESIDUAL-03-R3`, cache-bust `_qa_r3=20260723b`) **PASS** / `READY_FOR_QC`.

Purpose: **reconfirm** product gates vs same-day wave A GWC + prior-day `2026-07-22` GWC; keep **C-RES03R3-04** closed; enforce **NOT** Phase 1 / PROD / full program closure. Does **not** claim a new program milestone beyond prior same-day GWC.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full HTTPS RESIDUAL-03 program closure · Excellence T6 · UF promote from NFR alone · brand / company-col deploy (HOLD_DEPLOY).

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md` | QA wave B | **Authoritative** — PASS / `READY_FOR_QC` · `_qa_r3=20260723b` |
| 2 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723-attendance.png` | QA | Present — Dữ liệu chấm công · empty day U65 OK |
| 3 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723-leave-detail.png` | QA | Present — modal **Chi tiết yêu cầu nghỉ phép** |
| 4 | Prior QC same-day / `2026-07-22` GWC | QC | Baseline — **C-RES03R3-04 CLOSED**; this wave = **reconfirm** |
| 5 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey | **J-HRM-06** ✅ PASS (map) |
| 6 | Historical R3 FAIL (`fallbackAllCount=8`, 2026-05-28) | QA (historical) | **Superseded** — not reproduced |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260723.md
→ exit 0 (8/8 PASS) — QC wave B 2026-07-23
```

| Check | Result |
|-------|--------|
| Pack completeness (QA handoff) | **8/8 PASS** |
| Screenshots attendance + leave-detail | **Present** |

## Gate matrix (R3 mandatory — concurred · wave B)

| Gate | Expected | Actual (QA wave B + QC spot) | QC verdict |
|------|----------|------------------------------|------------|
| Auth 5-endpoint | 5/5 HTTP **200** | CON / INS / REC / ATT / PAY all **200** | **PASS** |
| A) `fallbackAllCount` before records | **0** | **0** / `localhost54321AnyCount=0` / `[]` | **PASS** |
| A) `fallbackAllCount` after records | **0** | **0** / `[]` | **PASS** |
| A) `fallbackAllCount` after refresh | **0** | **0** (QA re-check control) | **PASS** |
| No `127.0.0.1:54321` / `54321/rest/v1` | Zero | Nest samples only; buffer 216→219→230 | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | Auth table + after sub-nav — both PASS | **PASS** |
| L0 `/` · attendance · `/api/hrm/` · CC embed | **200** | QA curl + QC `curl.exe` **200/200/200/200** (wave B) | **PASS** |
| Historical R3 FAIL (`fallbackAllCount=8`) | Not reproduced | Still **0/0/0** | **CLOSED / superseded** |
| **C-RES03R3-04** J-HRM-06 leave→eye→detail | In residual pack | Modal **Chi tiết yêu cầu nghỉ phép**; HLD-0006; **Đã duyệt**; no 404/409 | **CLOSED** (reconfirmed wave B) |

## QC spot-check (2026-07-23 · wave B)

| Check | Method | Result |
|-------|--------|--------|
| `https://14-225-217-232.nip.io/` | `curl.exe` | **200** |
| `/hr/attendance?portal=1&companyId=main` | `curl.exe` | **200** |
| `/api/hrm/` | `curl.exe` | **200** |
| `/command-center/hrm/attendance` | `curl.exe` | **200** |
| Evidence pack verify (QA MD) | `pnpm run verify:qc:evidence-pack` | **8/8 exit 0** |
| Attendance screenshot | Independent visual read | **Dữ liệu chấm công** · date `23/07/2026` · empty «Không có dữ liệu chấm công» (U65 valid) · refresh control · no ERROR banner · KPI zeros |
| Leave-detail screenshot | Independent visual read | Modal **Chi tiết yêu cầu nghỉ phép**; HLD-0006; Nghỉ phép năm; 2 ngày; `15/08/2026`–`16/08/2026`; **Đã duyệt**; eye path consistent with QA §D |
| Full browser re-probe | Not re-run | QA wave B artifact authoritative + screenshots confirm product gates |

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 8/8 | **Process** | **PASS** |
| Auth 5/5 · fallback 0/0/0 · HRM-ATT-200 | **PRODUCT** | **PASS** |
| J-HRM-06 leave→detail in residual pack | **PRODUCT** | **PASS** — **C-RES03R3-04** remains **CLOSED** |
| Leave display-name `UF03-…` / `QA…` suffix noise | **PRODUCT P2 cosmetic** | Not R3 blocker; optional hygiene |
| Local `qc:dev-stack` not run | **ENV** | Not required for nip.io-only slice |
| Phase 1 / PROD / full RESIDUAL-03 | **Process** | **Forbidden claim** — **C-RES03R3-05** |
| HOLD_DEPLOY brand / company-col | **Process** | Out of slice — not gate input |
| Same-day wave A GWC already on file | **Process** | Wave B = **reconfirm**; no program upgrade |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| Attendance embed / fallback-zero (P-CC-07 class) | API + zero localhost + portal embed L0 **200** | **PASS** (runtime layer) |
| **J-HRM-06** supporting read (attendance → records Nest) | In QA artifact § L2.5 | **PASS** (supporting) |
| **J-HRM-06** list→detail browser click (leave→eye→modal) | **In residual pack** + leave-detail screenshot | **PASS** — **C-RES03R3-04 CLOSED** (reconfirmed wave B) |
| Full J-HRM **7/7** HTTPS browser | Not in R3 artifact | **Out of slice** |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19:** Mandatory L2.5 for this residual-03 R3 NFR slice (attendance runtime + leave→detail) is **PASS**. Map row J-HRM-06 remains ✅. **NO-GO not triggered.**

## Decision rationale

**GO WITH CONDITIONS** — All mandatory audit items from PM dispatch are **met** on independent 2026-07-23 wave B pilot HTTPS retest; prior closed conditions stay closed; **no upgrade** beyond same-day wave A GWC:

1. Auth 5-endpoint = **5/5 HTTP 200** (CON/INS/REC/ATT/PAY)
2. Attendance `fallbackAllCount=0` before + after records + after refresh; no localhost Supabase REST
3. Attendance records `GET …/records?…&page_size=10` = **200** `HRM-ATT-200`
4. Historical R3 FAIL (`fallbackAllCount=8`) **superseded**
5. Evidence pack **8/8**
6. **C-RES03R3-04 CLOSED** (reconfirmed wave B) — J-HRM-06 leave list → lucide-eye → modal **Chi tiết yêu cầu nghỉ phép** in residual QA pack + QC screenshot read

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / nip.io attendance + leave detail path only — **not** unconditional RESIDUAL-03 program sign-off · **NOT Phase 1 DONE** · **NOT PROD-READY**.

### Does this close HTTPS RESIDUAL-03 attendance / auth lane?

**Yes (bounded)** — P0 localhost Supabase fallback on audited attendance paths remains **closed**; in-pack L2.5 leave→detail remains **closed** as of QA + QC 2026-07-23 wave B reconfirmation. **Does not** close full RESIDUAL-03 / Phase 1 / PROD.

## Conditions

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io only | QA | **MET** (scope bound) |
| **C-RES03R3-02** | Evidence pack format | QA | **CLOSED** — verify **8/8** |
| **C-RES03R3-03** | Command Center embed `/command-center/hrm/attendance` | QA | **MET** (HTTP **200** L0) |
| **C-RES03R3-04** | J-HRM-06 list→detail inside residual artifact | QA | **CLOSED** (2026-07-22; reconfirmed wave A + **wave B** 2026-07-23) |
| **C-RES03R3-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** — **forbidden claim** (standing) |

## Residual (not promoted)

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full **P1-EX-HTTPS-RESIDUAL-03** program (all J-HRM browser, member personas, PROD) | PM | Program |
| R2 | **C-RES03R3-05** Phase 1 / PROD claim forbidden | PM/QC | Process |
| R3 | Leave display-name `UF03-…` / `QA…` suffix noise (cosmetic) | optional `dev-fe` / data | P2 (not R3 blocker) |

**No open product blocker** for residual-03 attendance / auth lane on `ceo@xe.vn` · `companyId=main` · nip.io (2026-07-23 wave B).

## completion_report

- **closed_scope:**
  - Wave B re-gate of QA `p1-ex-qa-https-residual-03-r3-20260723.md` (`_qa_r3=20260723b`) vs same-day wave A GWC + prior QC GWC `2026-07-22`.
  - Confirmed: Auth **5/5 200**, `fallbackAllCount` **0/0/0** (load → records → refresh), attendance **HRM-ATT-200**, L0 **200×4**, pack **8/8**.
  - **C-RES03R3-04 CLOSED** (reconfirmed wave B) — leave list → eye → **Chi tiết yêu cầu nghỉ phép** (QA §D + QC screenshot read).
  - Issued **GO WITH CONDITIONS** for residual-03 **attendance / auth lane only** on pilot HTTPS — **reconfirm**, not new program closure.
- **residual:**
  - Full RESIDUAL-03 program + member personas still not promoted (R1).
  - **NOT** Phase 1 DONE / **NOT** PROD (**C-RES03R3-05**).
  - Optional P2 leave display-name noise (R3) — not gate blocker.
  - HOLD_DEPLOY brand/company-col untouched / out of slice.

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3 PASS_TO_PM (wave B reconfirm): GO WITH CONDITIONS for residual-03 attendance/auth lane on https://14-225-217-232.nip.io (ceo@xe.vn / companyId=main). Independent QA wave B _qa_r3=20260723b concurs same-day wave A GWC + 2026-07-22 GWC: Auth 5/5 200 (CON/INS/REC/ATT/PAY); fallbackAllCount 0 before+after records+refresh; zero 127.0.0.1:54321 / 54321/rest/v1; GET attendance/records page_size=10 → 200 HRM-ATT-200; L0 200×4; J-HRM-06 leave→eye→Chi tiết yêu cầu nghỉ phép PASS (C-RES03R3-04 CLOSED reconfirmed). Standing: NOT Phase 1 / NOT PROD (C-RES03R3-05); full RESIDUAL-03 program not promoted; HOLD_DEPLOY brand/company-col unrelated. Evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260723.md. Update bus / TEAM_WORKING_NOW — keep R3 attendance+auth+in-pack L2.5 leave detail promoted; do not claim Phase 1 DONE or PROD-READY; do not promote UF from NFR alone; do not treat wave B as new program closure. Continue open HTTPS/matrix backlog outside this slice.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260723.md`
- **ack_status:** `PASS_TO_PM`
