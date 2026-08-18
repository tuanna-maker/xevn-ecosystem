# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R3-R2

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3-R2` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-17` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R3 attendance lane only (fallback-zero + Nest records + auth 5-list) |
| pilot_url | `https://14-225-217-232.nip.io` |
| persona | `ceo@xe.vn` · `companyId=main` |
| ack_status | **PASS_TO_PM** |
| U65 | zero-seed · no seed in evidence chain |

## Scope audited

QC re-gate of residual-03 **attendance lane** after QA `P1-EX-QA-HTTPS-RESIDUAL-03-R3` **PASS_TO_PM** (`2026-07-17`). Prior QC: `P1-EX-QC-HTTPS-RESIDUAL-03-R3-R1` **GWC** (`2026-06-05`). Spot-check L0 only unless inconsistency found.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full HTTPS RESIDUAL-03 program closure · Excellence T6.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717.md` | QA | **Authoritative** — PASS / `PASS_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717-attendance.png` | QA | Screenshot present |
| 3 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r1-20260605.md` | QC (prior) | **GWC** — baseline conditions |
| 4 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260605.md` | QA (prior) | PASS — superseded by July 17 retest for freshness |
| 5 | Historical R3 FAIL (`fallbackAllCount=8`, 2026-05-28) | QA (historical) | **Superseded** — not reproduced |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260717.md
→ exit 1 (3/8 checks FAIL)
```

| Missing check (script) | QC adjudication |
|------------------------|-----------------|
| `command_table` | **Process GWC** — runtime L0/fallback/auth tables present; no consolidated exit-code command table |
| `journey_l25` | **Out of slice** — R3 residual gate ≠ full J-* matrix; U19 defer below |
| `crud_or_matrix` | **Out of slice** — not CRUD matrix wave |

Runtime tables cover all **mandatory** PM audit items (auth 5/5, fallback-zero, attendance records). Pack gaps do **not** reopen product NO-GO for this bounded attendance lane (same pattern as R3-R1).

**Not NO-GO (process):** file exists, readable, and product exit criteria are executable in-artifact; fail is format/coverage-script only for out-of-slice checks.

## Gate matrix (R3 mandatory — concurred from QA + QC spot)

| Gate | Expected | Actual (QA 2026-07-17 + QC spot) | QC verdict |
|------|----------|----------------------------------|------------|
| Auth 5-endpoint | 5/5 HTTP **200** | Contracts / insurance / recruitment / attendance / payroll all **200** | **PASS** |
| A) `fallbackAllCount` before | **0** | **0** / `localhost54321AnyCount=0` / `[]` | **PASS** |
| A) `fallbackAllCount` after | **0** | **0** / `[]` | **PASS** |
| No `127.0.0.1:54321/rest/v1/*` | Zero | QA performance resource scan (181 entries) | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | Before / after / after sub-nav — all PASS | **PASS** |
| L0 attendance / `/` / `/api/hrm/` | **200** | QA curl + QC `curl.exe` **200/200/200** | **PASS** |
| Historical R3 FAIL (`fallbackAllCount=8`) | Not reproduced | Still **0/0** on 2026-07-17 | **CLOSED / superseded** |

## QC spot-check (2026-07-17)

| Check | Method | Result |
|-------|--------|--------|
| `https://14-225-217-232.nip.io/` | `curl.exe` | **200** |
| `/hr/attendance?portal=1&companyId=main` | `curl.exe` | **200** |
| `/api/hrm/` | `curl.exe` | **200** |
| Full browser re-probe | Not run | QA artifact authoritative; no inconsistency vs R1/R3 exit criteria |

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 3/8 (command_table / journey_l25 / crud_or_matrix) | **Process** | **GWC** — do not drive product NO-GO |
| Local `qc:dev-stack` not run | **ENV** | Not required for nip.io-only slice |
| «Kiểm tra lại» absent | **Informational** | Counts already **0**; does not reopen fallback gate |
| All mandatory product gates | **PRODUCT** | **PASS** |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| Attendance embed / fallback-zero (P-CC-07 class) | API + zero localhost + portal embed L0 **200** | **PASS** (runtime layer) |
| **J-HRM-06** list→detail browser click | Not re-clicked in July 17 artifact | **Deferred (GWC)** — journey map already ✅ PASS via prior HTTPS R6; not re-proven this residual retest |
| Full J-HRM **7/7** HTTPS | Not in R3 artifact | **Out of slice** |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19:** R3 exit criteria remain attendance fallback-zero + records + auth 5-list. Promoting **attendance lane** is valid without re-closing all J-* on this wave.

## Decision rationale

**GO WITH CONDITIONS** — All mandatory audit items from PM dispatch are **met** on current pilot HTTPS (`2026-07-17`):

1. Auth 5-endpoint = **5/5 HTTP 200**
2. Attendance `fallbackAllCount=0` before + after; no `127.0.0.1:54321/rest/v1/*`
3. Attendance records `GET …/records?company_id=main&page=1&page_size=10` = **200** `HRM-ATT-200`
4. Historical R3 FAIL (`fallbackAllCount=8`) **superseded** by July 17 PASS (and prior June 05 PASS)

Aligns with prior **R3-R1** GWC on the same slice; freshness retest **confirms** closure holds.

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / nip.io attendance URL only — **not** unconditional RESIDUAL-03 program sign-off · **NOT Phase 1 DONE** · **NOT PROD-READY**.

### Does R3-R2 close HTTPS RESIDUAL-03 attendance lane?

**Yes (bounded)** — P0 localhost Supabase fallback on audited attendance paths remains **closed** for this persona/route on pilot HTTPS as of 2026-07-17.

## Conditions (mandatory)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3R2-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io only | QA | **MET** this wave |
| **C-RES03R3R2-02** | Evidence pack format 3/8 — add `command_table` + J-* row + matrix row on next QA pack for this URL | QA | **Open** (process) |
| **C-RES03R3R2-03** | Command Center embed `/command-center/hrm/attendance` | QA | **MET** this wave (HTTP **200** L0 spot in QA) — closes prior **C-RES03R3R1-03** |
| **C-RES03R3R2-04** | J-HRM-06 list→detail browser click not re-proven in this residual artifact | QA | **Deferred** (map PASS via R6; optional refresh if PM wants same-day click) |
| **C-RES03R3R2-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** — **forbidden claim** |

## Residual (not promoted)

- Full **P1-EX-HTTPS-RESIDUAL-03** program bundle (all J-HRM browser, member personas, PROD).
- Process pack completeness for minigate script (3/8).
- Optional same-day J-HRM-06 browser click refresh on nip.io.
- **NOT** Phase 1 DONE · **NOT** PROD-READY.

## completion_report

- **closed_scope:**
  - Audited QA `p1-ex-qa-https-residual-03-r3-20260717.md` vs prior QC GWC R3-R1 and historical R3 FAIL.
  - Confirmed: Auth **5/5 200**, `fallbackAllCount` **0/0**, attendance **HRM-ATT-200**, zero localhost Supabase REST; QC L0 spot **200/200/200**.
  - Closed prior condition **C-RES03R3R1-03** (CC embed L0) via QA July 17 spot.
  - Issued **GO WITH CONDITIONS** for residual-03 **attendance lane only** on pilot HTTPS.
- **residual:**
  - Process pack 3/8 (**C-RES03R3R2-02**).
  - J-HRM-06 browser click not in this artifact (**C-RES03R3R2-04** deferred).
  - **NOT** Phase 1 DONE / **NOT** PROD (**C-RES03R3R2-05**).

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3-R2 PASS_TO_PM: GO WITH CONDITIONS for residual-03 attendance lane on https://14-225-217-232.nip.io (ceo@xe.vn / companyId=main). Product gates PASS: Auth 5/5 200, fallbackAllCount 0/0, GET attendance/records page_size=10 → 200 HRM-ATT-200, historical fallbackAllCount=8 superseded. Conditions open: process pack 3/8; J-HRM-06 click deferred (map already PASS via R6); NOT Phase 1 / NOT PROD. Evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r2-20260717.md. Update bus / TEAM_WORKING_NOW — promote R3 attendance slice freshness; do not claim Phase 1 DONE or PROD-READY. Optional next: qa narrow J-HRM-06 browser click on nip.io if PM wants L2.5 same-day refresh; else continue open HTTPS/matrix backlog.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r2-20260717.md`
- **ack_status:** `PASS_TO_PM`
