# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173 (2026-07-30)

work_item_id: `P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173`
ack_status: `PASS_TO_PM`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173` |
| parent_slice | `P1-EX-HTTPS-RESIDUAL-03` — R3 attendance / auth lane |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-30` |
| wave | Re-gate after QA local Unified Portal `:5173` retest (`_qa_r3=20260730local5173`) |
| decision | **GO WITH CONDITIONS** |
| slice | R3 attendance / auth lane — fallback-zero + Nest records + auth 5-list + in-pack J-HRM-06 leave→detail |
| prior_qc | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260727.md` (**GWC** nip.io) |
| qa_handoff | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md` (**PASS** / `READY_FOR_QC`) |
| runtime_url | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main&_qa_r3=20260730local5173` |
| persona | `ceo@xe.vn` · `companyId=main` |
| U65 | zero-seed · no seed in evidence chain |
| HOLD_DEPLOY | brand / company-col — **unrelated / out of slice** |
| Phase1 / PROD / full RESIDUAL-03 claim | **NONE** |

## Scope audited

QC re-gate of residual-03 **attendance / auth lane** after QA fresh local Unified Portal retest (`P1-EX-QA-HTTPS-RESIDUAL-03-R3`, cache-bust `_qa_r3=20260730local5173`) **PASS** / `READY_FOR_QC`.

Purpose: confirm **local :5173 parity** with prior nip.io GWC `2026-07-27`; keep closed conditions closed; enforce **NOT** Phase 1 / PROD / full program closure. Does **not** upgrade beyond prior GWC scope.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full HTTPS RESIDUAL-03 program closure · Excellence T6 · UF promote from NFR alone · brand / company-col deploy (HOLD_DEPLOY).

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md` | QA | **Authoritative** — PASS / `READY_FOR_QC` |
| 2 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173-attendance.png` | QA | Present — Dữ liệu chấm công · empty day `30/07/2026` U65 OK · no ERROR banner |
| 3 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173-leave-detail.png` | QA | Present — modal **Chi tiết yêu cầu nghỉ phép** · Chờ duyệt · PORTAL-GCEO |
| 4 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173-runtime.json` | QA | fallback 0/0/0/0 · Auth 5/5 · Nest samples · leaveOk · verdict.pass=true |
| 5 | Prior QC `2026-07-27` GWC (nip.io) | QC | Baseline — **C-RES03R3-04 CLOSED**; this wave = **local5173 parity extension** |
| 6 | Historical R3 FAIL (`fallbackAllCount=8`, 2026-05-28) | QA (historical) | **Superseded** — not reproduced |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md
→ exit 0 (8/8 PASS) — QC 2026-07-30
```

| Check | Result |
|-------|--------|
| Pack completeness (QA handoff) | **8/8 PASS** |
| Screenshots attendance + leave-detail | **Present** (QC visual read) |
| Runtime JSON | **Present** (QC independent read) |

## Gate matrix (R3 mandatory — concurred · 2026-07-30 local5173)

| Gate | Expected | Actual (QA + QC spot) | QC verdict |
|------|----------|----------------------|------------|
| Auth 5-endpoint | 5/5 HTTP **200** | CON / INS / REC / ATT / PAY all **200** (runtime.json) | **PASS** |
| A) `fallbackAllCount` before records | **0** | **0** / `localhost54321AnyCount=0` / `[]` | **PASS** |
| A) `fallbackAllCount` after records | **0** | **0** / `[]` | **PASS** |
| A) `fallbackAllCount` after refresh-equiv | **0** | **0** (auth-records-refetch; toolbar «Tải lại» absent — acceptable per QA R4) | **PASS** |
| A) `fallbackAllCount` after Auth records | **0** | **0** | **PASS** |
| No `127.0.0.1:54321` / `54321/rest/v1` | Zero | Nest `/api/hrm/*` only; buffer 408→412→413→417; `console54321Count=0` | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | Auth table + Nest `page_size=10` in nestAttSample | **PASS** |
| L0 `/` · attendance · `/api/hrm/` · CC embed | **200** | QA curl + QC `curl.exe` **200/200/200/200** | **PASS** |
| Historical R3 FAIL (`fallbackAllCount=8`) | Not reproduced | Still **0/0/0/0** | **CLOSED / superseded** |
| **C-RES03R3-04** J-HRM-06 leave→eye→detail | In residual pack | Modal **Chi tiết yêu cầu nghỉ phép**; PORTAL-GCEO; Phép năm; **Chờ duyệt**; no 404/409 | **CLOSED** (reconfirmed local5173 2026-07-30) |

## Parity vs nip.io 2026-07-27

| Criterion | nip.io QC 2026-07-27 | local5173 QC 2026-07-30 | Parity |
|-----------|----------------------|-------------------------|--------|
| Auth 5/5 HTTP 200 | PASS | PASS | **YES** |
| `fallbackAllCount` 0/0/0/0 | PASS | PASS | **YES** |
| Attendance `HRM-ATT-200` page_size=10 | PASS | PASS | **YES** |
| J-HRM-06 leave→eye→detail | PASS | PASS | **YES** |
| L0 200×4 | PASS (HTTPS nip.io) | PASS (HTTP :5173) | **YES** (host differs; product gates match) |
| Zero `:54321` | PASS | PASS | **YES** |

## QC spot-check (2026-07-30)

| Check | Method | Result |
|-------|--------|--------|
| `http://127.0.0.1:5173/` | `curl.exe` | **200** |
| `/hr/attendance?portal=1&companyId=main` | `curl.exe` | **200** |
| `/api/hrm/` | `curl.exe` | **200** |
| `/command-center/hrm/attendance` | `curl.exe` | **200** |
| Evidence pack verify (QA MD) | `pnpm run verify:qc:evidence-pack` | **8/8 exit 0** |
| Attendance screenshot | Independent visual read | **Dữ liệu chấm công hôm nay** · date `30/07/2026` · empty «Không có dữ liệu chấm công» (U65 valid) · KPI zeros · no ERROR banner |
| Leave-detail screenshot | Independent visual read | Modal **Chi tiết yêu cầu nghỉ phép**; CEO; PORTAL-GCEO; Phép năm; 1 ngày; `24/12/2026`–`24/12/2026`; **Chờ duyệt**; eye path consistent with QA §D |
| Runtime JSON | Independent read | `verdict.pass=true`; `fallbackAllCount=0` ×4 phases; Auth 5×200; Nest `/api/hrm/attendance/*` only; `leaveDetail.hasDetailTitle=true`; `hasNotFound=false` |
| Full browser re-probe | Not re-run | QA artifact authoritative + screenshots + runtime JSON confirm product gates |

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 8/8 | **Process** | **PASS** |
| Auth 5/5 · fallback 0/0/0/0 · HRM-ATT-200 | **PRODUCT** | **PASS** |
| J-HRM-06 leave→detail in residual pack | **PRODUCT** | **PASS** — **C-RES03R3-04** remains **CLOSED** |
| Empty attendance day `30/07/2026` | **PRODUCT** (U65 valid empty) | Not FAIL |
| Toolbar «Tải lại» not found — refresh-equiv refetch | **AUTOMATION P3** | Not R3 blocker (QA R4) |
| HRM-api dist restart ops note | **ENV P2** | Not product NO-GO (QA R3) |
| Phase 1 / PROD / full RESIDUAL-03 | **Process** | **Forbidden claim** — **C-RES03R3-05** |
| HOLD_DEPLOY brand / company-col | **Process** | Out of slice — not gate input |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| Attendance embed / fallback-zero (P-CC-07 class) | API + zero localhost + portal embed L0 **200** | **PASS** (runtime layer) |
| **J-HRM-06** supporting read (attendance → records Nest) | In QA artifact § L2.5 | **PASS** (supporting) |
| **J-HRM-06** list→detail browser click (leave→eye→modal) | **In residual pack** + leave-detail screenshot + runtime leaveDetail | **PASS** — **C-RES03R3-04 CLOSED** (reconfirmed 2026-07-30 local5173) |
| Full J-HRM **7/7** HTTPS browser | Not in R3 artifact | **Out of slice** |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19:** Mandatory L2.5 for this residual-03 R3 NFR slice (attendance runtime + leave→detail) is **PASS** on local5173. **NO-GO not triggered.**

### J-* tested vs deferred (GWC explicit)

| ID | Status |
|----|--------|
| J-HRM-06 (attendance records Nest + leave list→detail) | **PASS** (in-pack) — nip.io + local5173 |
| Full J-HRM 7/7 | **Deferred** — out of slice |
| Member-CEO journeys | **Deferred** — out of slice |

## Decision rationale

**GO WITH CONDITIONS** — All mandatory audit items from PM dispatch are **met** on independent 2026-07-30 local Unified Portal `:5173` retest; **parity with nip.io GWC 2026-07-27 confirmed**; prior closed conditions stay closed; **no upgrade** beyond bounded R3 slice:

1. Auth 5-endpoint = **5/5 HTTP 200** (CON/INS/REC/ATT/PAY)
2. Attendance `fallbackAllCount=0` before + after records + after refresh-equiv + after Auth fetch; no localhost Supabase REST
3. Attendance records `GET …/records?…&page_size=10` = **200** `HRM-ATT-200`
4. Historical R3 FAIL (`fallbackAllCount=8`) **superseded**
5. Evidence pack **8/8**
6. **C-RES03R3-04 CLOSED** (reconfirmed 2026-07-30 local5173) — J-HRM-06 leave list → eye → modal **Chi tiết yêu cầu nghỉ phép**

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / **local :5173** + prior **nip.io** attendance + leave detail path — **not** unconditional RESIDUAL-03 program sign-off · **NOT Phase 1 DONE** · **NOT PROD-READY**.

### Does this close HTTPS RESIDUAL-03 attendance / auth lane?

**Yes (bounded, dual-host)** — P0 localhost Supabase fallback on audited attendance paths remains **closed** on both nip.io (2026-07-27) and local5173 (2026-07-30); in-pack L2.5 leave→detail remains **closed**. **Does not** close full RESIDUAL-03 / Phase 1 / PROD.

## Conditions

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io **and** local :5173 | QA | **MET** (scope bound — dual host) |
| **C-RES03R3-02** | Evidence pack format | QA | **CLOSED** — verify **8/8** |
| **C-RES03R3-03** | Command Center embed `/command-center/hrm/attendance` | QA | **MET** (HTTP **200** L0) |
| **C-RES03R3-04** | J-HRM-06 list→detail inside residual artifact | QA | **CLOSED** (reconfirmed nip.io 2026-07-27 + **local5173 2026-07-30**) |
| **C-RES03R3-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** — **forbidden claim** (standing) |

## Residual (not promoted)

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full **P1-EX-HTTPS-RESIDUAL-03** program (all J-HRM browser, member personas, PROD) | PM | Program |
| R2 | **C-RES03R3-05** Phase 1 / PROD claim forbidden | PM/QC | Process |
| R3 | HRM-api `dev:hrm-api` ENOTEMPTY dist flake — `dist-uat-w6` restart workaround | devops | P2 ops |
| R4 | Toolbar «Tải lại» automation gap — refresh-equiv refetch used | QA | P3 automation |

**No open product blocker** for residual-03 attendance / auth lane on `ceo@xe.vn` · `companyId=main` · local :5173 (2026-07-30) or nip.io (2026-07-27).

## completion_report

- **closed_scope:**
  - Re-gate of QA `p1-ex-qa-https-residual-03-r3-20260730-local5173.md` (`_qa_r3=20260730local5173`) vs prior QC GWC nip.io `2026-07-27`.
  - Confirmed: Auth **5/5 200**, `fallbackAllCount` **0/0/0/0** (load → records → refresh-equiv → Auth), attendance **HRM-ATT-200**, L0 **200×4**, pack **8/8**, zero `:54321`.
  - **Local5173 parity with nip.io** on all mandatory R3 product gates.
  - **C-RES03R3-04 CLOSED** (reconfirmed 2026-07-30 local5173) — leave list → eye → **Chi tiết yêu cầu nghỉ phép**.
  - Issued **GO WITH CONDITIONS** for residual-03 **attendance / auth lane** on local Unified Portal — bounded extension, not new program closure.
- **residual:**
  - Full RESIDUAL-03 program + member personas still not promoted (R1).
  - **NOT** Phase 1 DONE / **NOT** PROD (**C-RES03R3-05**).
  - P2 HRM-api dist restart ops (R3) + P3 refresh automation (R4) — not gate blockers.
  - HOLD_DEPLOY brand/company-col untouched / out of slice.

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173 PASS_TO_PM (2026-07-30): GO WITH CONDITIONS for residual-03 attendance/auth lane on http://127.0.0.1:5173 (ceo@xe.vn / companyId=main) — parity with nip.io GWC 2026-07-27 confirmed. Fresh QA _qa_r3=20260730local5173: Auth 5/5 200 (CON/INS/REC/ATT/PAY); fallbackAllCount 0 before+after records+refresh-equiv+Auth; zero 127.0.0.1:54321 / 54321/rest/v1; GET attendance/records page_size=10 → 200 HRM-ATT-200; L0 200×4; J-HRM-06 leave→eye→Chi tiết yêu cầu nghỉ phép PASS (C-RES03R3-04 CLOSED reconfirmed local5173). Standing: NOT Phase 1 / NOT PROD (C-RES03R3-05); full RESIDUAL-03 program not promoted; HOLD_DEPLOY brand/company-col unrelated. Evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260730-local5173.md. Update bus / TEAM_WORKING_NOW — promote dual-host R3 attendance+auth+in-pack L2.5 leave detail; do not claim Phase 1 DONE or PROD-READY; continue open HTTPS/matrix backlog outside this slice.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260730-local5173.md`
- **ack_status:** `PASS_TO_PM`

---

# § r2 QC Re-gate — P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173-R2 (2026-07-30)

work_item_id: `P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173-R2`
ack_status: `PASS_TO_PM`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173-R2` |
| parent_slice | `P1-EX-HTTPS-RESIDUAL-03` — R3 attendance / auth / **dashboard** lane |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-30` |
| wave | Re-gate after QA local5173 **r2** retest incl. **INC-HRM-DASH-500** dashboard spot |
| decision | **GO WITH CONDITIONS** |
| slice | R3 attendance + auth + dashboard embed — fallback-zero + Nest records + auth 5-list + J-HRM-06 leave→detail + dashboard summary/overview |
| prior_qc_r1 | § above (GWC local5173 **without** dashboard gate) |
| prior_qc_nipio | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260727.md` (GWC nip.io) |
| qa_handoff | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md` (**PASS** / `READY_FOR_QC` · r2) |
| runtime_json | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173-runtime.json` |
| runtime_url | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main&_qa_r3=20260730local5173r2` |
| dashboard_url | `http://127.0.0.1:5173/command-center/hrm/dashboard?companyId=main&_qa_r3=20260730local5173r2` |
| persona | `ceo@xe.vn` · `companyId=main` |
| U65 | zero-seed · no seed in evidence chain |
| HOLD_DEPLOY | brand / company-col — **unrelated / out of slice** |
| Phase1 / PROD / full RESIDUAL-03 claim | **NONE** |

## Delta vs r1 QC (same file § above)

| Criterion | r1 QC (2026-07-30) | **r2 QC (2026-07-30)** |
|-----------|-------------------|------------------------|
| Cache-bust | `_qa_r3=20260730local5173` | **`_qa_r3=20260730local5173r2`** |
| Dashboard `employees/summary` + `attendance/overview` | **Not in gate** | **PASS** — INC-HRM-DASH-500 **not reproduced** |
| PNG screenshots | Referenced (attendance + leave-detail) | **Runtime JSON primary** (PNG not persisted r2 — acceptable) |
| Chevron records UI nav | Assumed via screenshot | Automation **missed** — records gate via **auth refetch** + `HRM-ATT-200` (not product FAIL) |

## Evidence consumed (r2)

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md` | QA r2 | **Authoritative** — PASS / `READY_FOR_QC` |
| 2 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173-runtime.json` | QA | QC independent read — dashboardSpot + fallback 0×4 + Auth 5/5 + leaveOk |
| 3 | Prior QC r1 (this file § above) | QC | Baseline — attendance/auth GWC; r2 **extends** with dashboard |
| 4 | Prior QC nip.io 2026-07-27 GWC | QC | Baseline dual-host |

## Evidence pack integrity (r2)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260730-local5173.md
→ exit 0 (8/8 PASS) — QC independent 2026-07-30 r2
```

## Gate matrix (r2 mandatory — QC concurred)

| Gate | Expected | Actual (QA + QC audit) | QC verdict |
|------|----------|------------------------|------------|
| Auth 5-endpoint | 5/5 HTTP **200** | CON / INS / REC / ATT / PAY all **200** (runtime.json `authFive.results`) | **PASS** |
| A) `fallbackAllCount` ×4 phases | **0** each | **0/0/0/0** — load → records → refresh-equiv → Auth (`fallbackBefore` … `fallbackAfterAuth`) | **PASS** |
| No `:54321` / Supabase REST fallback | Zero | `localhost54321AnyCount=0`; `console54321=[]`; Nest `/api/hrm/*` only | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | `verdict.attHttp=200` · `attCode=HRM-ATT-200` | **PASS** |
| **E) Dashboard INC-HRM-DASH-500** | summary + overview **200** | `dashboardSpot.api`: `HRM-EMP-SUMMARY-200` + `HRM-ATT-OVERVIEW-200`; `bodyHasSyncError=false`; `fallbackAllCount=0` | **PASS** |
| J-HRM-06 leave→eye→detail | Modal Chi tiết | `leaveDetail.hasDetailTitle=true` · `hasNotFound=false` · `dialogOpen=true` | **PASS** — **C-RES03R3-04 CLOSED** |
| L0 perimeter :5173 | **200×5** incl. dashboard | QC curl: root/attendance/api_hrm/cc_att/**dashboard** all **200** | **PASS** |
| L0 stack HRM/XBOS/portal | Health **200** | QC `qc:dev-stack`: HRM/XBOS/5173 **200** (UV_HANDLE exit flake — ENV, not product) | **PASS** |
| Historical R3 FAIL (`fallbackAllCount=8`) | Not reproduced | Still **0/0/0/0** | **CLOSED / superseded** |

## QC spot-check (r2 independent)

| Check | Method | Result |
|-------|--------|--------|
| Evidence pack | `verify:qc:evidence-pack` | **8/8 exit 0** |
| L0 :5173 (5 routes) | `curl.exe` | **200** root · attendance · `/api/hrm/` · CC attendance · **dashboard** |
| Runtime JSON dashboard | Independent read | summary **200** · overview **200** · no sync error banner |
| Runtime JSON fallback/auth/leave | Independent read | `verdict.pass=true` · Auth 5×200 · leaveOk=true |
| Direct HRM curl (no JWT) | QC note only | **401** HRM-AUTH-001 — expected without browser JWT; **not** used to override QA browser session |
| Full browser re-probe | Not re-run | QA runtime JSON authoritative for authenticated dashboard path |

## Classification (r2)

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 8/8 | **Process** | **PASS** |
| Auth 5/5 · fallback 0×4 · HRM-ATT-200 | **PRODUCT** | **PASS** |
| Dashboard summary+overview 200 | **PRODUCT** (INC-HRM-DASH-500) | **PASS** — **C-RES03R3-06 CLOSED** |
| J-HRM-06 leave→detail | **PRODUCT** | **PASS** — **C-RES03R3-04 CLOSED** |
| Chevron menu automation miss | **AUTOMATION P3** | Not R3 blocker (records via auth refetch) |
| HRM-api transient down / dist restart | **ENV P2** | Not product NO-GO |
| `qc:dev-stack` UV_HANDLE exit flake | **ENV P3** | All health **200** before flake |
| Phase 1 / PROD / full RESIDUAL-03 | **Process** | **Forbidden** — **C-RES03R3-05** standing |

## L2.5 journey coverage (U19 — r2)

| Journey / probe | Status |
|-----------------|--------|
| Attendance embed fallback-zero | **PASS** |
| J-HRM-06 supporting read (records Nest) | **PASS** |
| J-HRM-06 list→detail (leave→eye→modal) | **PASS** — in-pack |
| Dashboard embed (INC-HRM-DASH-500 class) | **PASS** — **new in r2** |
| Full J-HRM 7/7 | **Deferred** — out of slice |
| Member CEO personas | **Deferred** — out of slice |

## Decision rationale (r2)

**GO WITH CONDITIONS** — All PM dispatch exit criteria for r2 are **met** on independent audit:

1. Auth **5/5 HTTP 200** (CON/INS/REC/ATT/PAY)
2. `fallbackAllCount=0` ×4 phases; zero `:54321`
3. Attendance records **200 / HRM-ATT-200** (`page_size=10`)
4. J-HRM-06 leave list → eye → **Chi tiết yêu cầu nghỉ phép**
5. **Dashboard spot:** `employees/summary` + `attendance/overview` **200** — INC-HRM-DASH-500 **not reproduced**
6. Evidence pack **8/8**; L0 **200×5** on :5173

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / local **:5173** + prior **nip.io** — attendance + auth + **dashboard embed** + in-pack leave detail. **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full RESIDUAL-03 program closure.

### Does r2 close INC-HRM-DASH-500 on local5173?

**Yes (bounded)** — dashboard mount on `:5173` with authenticated browser session shows summary+overview **200** and no sync error banner. Does **not** close PROD or all CC dashboard personas.

## Conditions (r2 updated)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3-01** | Persona `ceo@xe.vn` / `companyId=main` · nip.io + local :5173 | QA | **MET** |
| **C-RES03R3-02** | Evidence pack format | QA | **CLOSED** — 8/8 |
| **C-RES03R3-03** | CC embed `/command-center/hrm/attendance` L0 **200** | QA | **MET** |
| **C-RES03R3-04** | J-HRM-06 list→detail in residual pack | QA | **CLOSED** (r2 reconfirmed) |
| **C-RES03R3-06** | Dashboard INC-HRM-DASH-500 spot local5173 r2 | QA/QC | **CLOSED** (new r2) |
| **C-RES03R3-05** | Phase 1 / PROD claim | PM/QC | **NOT MET** — forbidden (standing) |

## Residual (r2 — not promoted)

| ID | Item | Owner | Severity |
|----|------|-------|----------|
| R1 | Full P1-EX-HTTPS-RESIDUAL-03 program (all J-HRM, member personas, PROD) | PM | Program |
| R2 | C-RES03R3-05 Phase 1 / PROD forbidden | PM/QC | Process |
| R3 | HRM-api dist restart ops flake | devops | P2 ops |
| R4 | Chevron «Dữ liệu chấm công» automation flake | QA | P3 automation |
| R5 | Toolbar «Tải lại» absent — refresh-equiv refetch | QA | P3 automation |

**No open product blocker** for residual-03 attendance / auth / **dashboard** slice on local :5173 r2.

## completion_report (r2)

- **closed_scope:**
  - Independent QC re-gate of QA r2 (`_qa_r3=20260730local5173r2`) incl. **dashboard spot** vs prior r1 GWC without dashboard.
  - Confirmed: Auth **5/5 200**; `fallbackAllCount` **0×4**; zero `:54321`; **HRM-ATT-200**; J-HRM-06 leave→detail; dashboard **HRM-EMP-SUMMARY-200** + **HRM-ATT-OVERVIEW-200**; pack **8/8**; L0 **200×5**.
  - **C-RES03R3-06 CLOSED** — INC-HRM-DASH-500 not reproduced on local5173.
  - **GO WITH CONDITIONS** for residual-03 attendance/auth/**dashboard** on Unified Portal :5173.
- **residual:** Full RESIDUAL-03 + Phase1/PROD not promoted; P2/P3 ops/automation notes; HOLD_DEPLOY untouched.

## Handoff Packet (r2)

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3-LOCAL5173-R2 PASS_TO_PM (2026-07-30 r2): GO WITH CONDITIONS for residual-03 attendance/auth/dashboard slice on http://127.0.0.1:5173 (ceo@xe.vn / companyId=main). QA r2 _qa_r3=20260730local5173r2: Auth 5/5 200; fallbackAllCount 0×4; zero :54321; HRM-ATT-200 page_size=10; J-HRM-06 leave→eye→Chi tiết PASS (C-RES03R3-04 CLOSED); dashboard GET employees/summary + attendance/overview → 200 (C-RES03R3-06 CLOSED — INC-HRM-DASH-500 not reproduced); L0 200×5; pack 8/8. Standing: NOT Phase 1 / NOT PROD (C-RES03R3-05); full RESIDUAL-03 not promoted; HOLD_DEPLOY brand/company-col unrelated. Evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260730-local5173.md § r2. Update bus / TEAM_WORKING_NOW — promote dual-host R3 attendance+auth+dashboard+leave detail; continue program backlog outside slice.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260730-local5173.md`
- **ack_status:** `PASS_TO_PM`
