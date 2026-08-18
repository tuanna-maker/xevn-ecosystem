# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-20` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R3 attendance / auth lane only (fallback-zero + Nest records + auth 5-list) |
| pilot_url | `https://14-225-217-232.nip.io` |
| persona | `ceo@xe.vn` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| U65 | zero-seed · no seed in evidence chain |

## Scope audited

QC gate of residual-03 **attendance / auth lane** after QA `P1-EX-QA-HTTPS-RESIDUAL-03-R3` **PASS** (`2026-07-19`). Prior QC: `P1-EX-QC-HTTPS-RESIDUAL-03-R3-R3` **GWC** (`2026-07-19`) + `P1-EX-QC-HTTPS-RESIDUAL-03-R3-R2` **GWC** (`2026-07-17`). Spot-check L0 only; full browser re-probe not required — QA artifact consistent, no product regression vs prior GWC exit criteria.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full HTTPS RESIDUAL-03 program closure · Excellence T6 · UF promote from NFR alone.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md` | QA | **Authoritative** — PASS / `PASS_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719-attendance.png` | QA | Screenshot present (58 252 bytes) |
| 3 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r3-20260719.md` | QC (prior) | **GWC** — baseline; process pack was 3/8 |
| 4 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r2-20260717.md` | QC (prior) | **GWC** — product baseline |
| 5 | Historical R3 FAIL (`fallbackAllCount=8`, 2026-05-28) | QA (historical) | **Superseded** — not reproduced |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md
→ exit 0 (8/8 PASS)
```

| Check | Result |
|-------|--------|
| Pack completeness | **8/8 PASS** |
| Prior QC (2026-07-19 R3-R3) process gap 3/8 | **CLOSED** by QA pack polish (command_table + journey_l25 + crud_or_matrix present) |

**Process:** prior **C-RES03R3R3-02** / **C-RES03R3R2-02** pack format — **CLOSED** this wave. Does **not** reopen product gates.

## Gate matrix (R3 mandatory — concurred from QA + QC spot)

| Gate | Expected | Actual (QA 2026-07-19 + QC spot 2026-07-20) | QC verdict |
|------|----------|---------------------------------------------|------------|
| Auth 5-endpoint | 5/5 HTTP **200** | Contracts / insurance / recruitment / attendance / payroll all **200** | **PASS** |
| A) `fallbackAllCount` before | **0** | **0** / `localhost54321AnyCount=0` / `[]` | **PASS** |
| A) `fallbackAllCount` after | **0** | **0** / `[]` | **PASS** |
| No `127.0.0.1:54321/rest/v1/*` | Zero | QA performance resource scan (182→190 entries) | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | Browser Auth table + after sub-nav — both PASS | **PASS** |
| L0 attendance / `/` / `/api/hrm/` / CC embed | **200** | QA curl + QC `curl.exe` **200/200/200/200** (2026-07-20) | **PASS** |
| Historical R3 FAIL (`fallbackAllCount=8`) | Not reproduced | Still **0/0** on 2026-07-19 QA | **CLOSED / superseded** |

## QC spot-check (2026-07-20)

| Check | Method | Result |
|-------|--------|--------|
| `https://14-225-217-232.nip.io/` | `curl.exe` | **200** |
| `/hr/attendance?portal=1&companyId=main` | `curl.exe` | **200** |
| `/api/hrm/` | `curl.exe` | **200** |
| `/command-center/hrm/attendance` | `curl.exe` | **200** |
| Evidence pack verify | `pnpm run verify:qc:evidence-pack` | **8/8 exit 0** |
| Full browser re-probe | Not run | QA artifact authoritative; no inconsistency vs R3-R3/R2 exit criteria |

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 8/8 | **Process** | **PASS** — closes prior format GWC |
| Local `qc:dev-stack` not run | **ENV** | Not required for nip.io-only slice |
| «Kiểm tra lại» absent | **Informational** | Counts already **0**; does not reopen fallback gate |
| All mandatory product gates | **PRODUCT** | **PASS** |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| Attendance embed / fallback-zero (P-CC-07 class) | API + zero localhost + portal embed L0 **200** | **PASS** (runtime layer) |
| **J-HRM-06** supporting read (attendance → records Nest) | In QA artifact § L2.5 | **PASS** (supporting) |
| **J-HRM-06** list→detail browser click (leave→request) | Sibling `p1-ex-qa-j-hrm-06-nipio-20260719.md`; map ✅ via R6 | **Deferred refresh in residual artifact** — map already PASS; not product NO-GO |
| Full J-HRM **7/7** HTTPS | Not in R3 artifact | **Out of slice** |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19:** R3 exit criteria remain attendance fallback-zero + records + auth 5-list. Promoting **attendance lane** is valid without re-closing all J-* on this wave. **NO-GO not triggered** — mandatory J-* for this NFR residual slice is runtime attendance path, not full journey matrix.

## Decision rationale

**GO WITH CONDITIONS** — All mandatory audit items from PM dispatch are **met** on current pilot HTTPS:

1. Auth 5-endpoint = **5/5 HTTP 200**
2. Attendance `fallbackAllCount=0` before + after; no `127.0.0.1:54321/rest/v1/*`
3. Attendance records `GET …/records?company_id=main&page=1&page_size=10` = **200** `HRM-ATT-200`
4. Historical R3 FAIL (`fallbackAllCount=8`) **superseded**
5. Evidence pack **8/8** (closes prior process condition from R3-R3 / R3-R2)

Aligns with prior **R3-R3** / **R3-R2** GWC on the same product slice; pack polish **upgrades process** without changing product closure.

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / nip.io attendance URL only — **not** unconditional RESIDUAL-03 program sign-off · **NOT Phase 1 DONE** · **NOT PROD-READY**.

### Does this close HTTPS RESIDUAL-03 attendance lane?

**Yes (bounded)** — P0 localhost Supabase fallback on audited attendance paths remains **closed** for this persona/route on pilot HTTPS as of QA 2026-07-19 + QC L0 2026-07-20.

## Conditions (mandatory)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io only | QA | **MET** this wave |
| **C-RES03R3-02** | Evidence pack format (was 3/8) | QA | **CLOSED** — verify **8/8 exit 0** (2026-07-20) |
| **C-RES03R3-03** | Command Center embed `/command-center/hrm/attendance` | QA | **MET** (HTTP **200** L0 in QA + QC spot) |
| **C-RES03R3-04** | J-HRM-06 list→detail not re-clicked inside residual artifact | QA | **Deferred** (map ✅ R6 + sibling 2026-07-19; optional same-day in-pack refresh) |
| **C-RES03R3-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** — **forbidden claim** |

## Residual (not promoted)

- Full **P1-EX-HTTPS-RESIDUAL-03** program bundle (all J-HRM browser, member personas, PROD).
- Optional same-day J-HRM-06 leave→request click inside residual pack (**C-RES03R3-04**).
- **NOT** Phase 1 DONE · **NOT** PROD-READY · **no UF promote from NFR alone**.

## completion_report

- **closed_scope:**
  - Audited QA `p1-ex-qa-https-residual-03-r3-20260719.md` vs prior QC GWC R3-R3 / R3-R2 and historical R3 FAIL.
  - Confirmed: Auth **5/5 200**, `fallbackAllCount` **0/0**, attendance **HRM-ATT-200**, zero localhost Supabase REST; QC L0 spot **200/200/200/200**.
  - Evidence pack verify **8/8 exit 0** — closed prior process pack GWC (**C-RES03R3-02**).
  - Issued **GO WITH CONDITIONS** for residual-03 **attendance / auth lane only** on pilot HTTPS.
- **residual:**
  - J-HRM-06 list→detail not in residual artifact (**C-RES03R3-04** deferred; map PASS).
  - **NOT** Phase 1 DONE / **NOT** PROD (**C-RES03R3-05**).

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3 PASS_TO_PM: GO WITH CONDITIONS for residual-03 attendance/auth lane on https://14-225-217-232.nip.io (ceo@xe.vn / companyId=main). Product gates PASS: Auth 5/5 200, fallbackAllCount 0/0, GET attendance/records page_size=10 → 200 HRM-ATT-200, historical fallbackAllCount=8 superseded. Process pack CLOSED 8/8 (C-RES03R3-02). Open conditions: J-HRM-06 list→detail deferred in residual pack (C-RES03R3-04; map PASS via R6); NOT Phase 1 / NOT PROD (C-RES03R3-05). Evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260720.md. Update bus / TEAM_WORKING_NOW — promote R3 attendance slice; do not claim Phase 1 DONE or PROD-READY; do not promote UF from NFR alone. Optional next: narrow qa J-HRM-06 leave→request click if PM wants in-pack L2.5 refresh; else continue open HTTPS/matrix backlog.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260720.md`
- **ack_status:** `PASS_TO_PM`
