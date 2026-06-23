# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R3-R1

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R3-R1` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-06-05` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R3 attendance lane (fallback-zero + Nest records + auth 5-list) |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | **PASS_TO_PM** |

## Scope audited

QC re-gate of **R3 milestone** after QA `P1-EX-QA-HTTPS-RESIDUAL-03-R3` **READY_FOR_QC** (`2026-06-05`). Entry: regression PASS vs prior R3 FAIL (`2026-05-28`). **Spot-check only** per PM dispatch unless gap found.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full HTTPS RESIDUAL-03 program closure · Excellence T6.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260605.md` | QA | **Authoritative** — `READY_FOR_QC` / PASS |
| 2 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260528.md` | QC (prior) | **NO-GO** — missing QA artifact (superseded) |
| 3 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260528.md` | QA (prior) | **FAIL** — `fallbackAllCount=8` delta baseline |
| 4 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md` | QC (chain) | GWC attendance pilot; aligns closure pattern |
| 5 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r4-20260531.md` | QC (chain) | GWC R4 — same mandatory gates |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260605.md
→ exit 1 (5/8 checks)
```

| Missing check (script) | QC adjudication |
|------------------------|-----------------|
| `work_item_id` line format | **Process GWC** — present in table header |
| `command_table` | **Process GWC** — runtime tables + Node probe cited; no consolidated exit-code table |
| `portal_url` | **MET** — `runtime_url` in QA header |
| `journey_l25` | **Out of slice** — attendance residual gate; U19 defer below |
| `crud_or_matrix` | **Out of slice** — not CRUD matrix wave |

Runtime tables are complete for mandatory gates; pack gaps do **not** block bounded GO.

## Delta vs prior R3 chain (closure audit)

| Criterion | QC R3 2026-05-28 | QA R3 2026-05-28 | QA R3 2026-06-05 | QC adjudication |
|-----------|------------------|------------------|------------------|-----------------|
| QA runtime artifact | **Missing** | Published FAIL | Published PASS | **CLOSED** (B1) |
| `fallbackAllCount` | Unproven | **8** / **8** | **0** / **0** | **CLOSED** (`8 → 0`) |
| Attendance records probe | Unproven | 200 / `HRM-ATT-200` | 200 / `HRM-ATT-200` (page_size 10) | **CLOSED** |
| Auth 5-list (browser session) | Unproven | Mixed (employees in probe set) | 5/5 **200**, no `HRM-AUTH-001` | **CLOSED** |
| `Kiểm tra lại` retry path | N/A | Clicked; still 8 | Not rendered; counts stay **0** | **PASS** — zero fallback without banner |

Prior **NO-GO (2026-05-28)** was process-blocked (no QA file). Prior **FAIL (2026-05-28)** regression is **not reproduced** on current pilot runtime.

## Gate matrix (R3 mandatory — concurred from QA)

| Gate | Expected | Actual (QA 2026-06-05 + QC spot) | QC verdict |
|------|----------|----------------------------------|------------|
| L0 attendance route | **200** | QA curl + QC `curl.exe` **200** | **PASS** |
| L0 `/hr/`, `/api/hrm/` | **200** | QA table **200** | **PASS** |
| A) `fallbackAllCount` before retry | **0** | **0** / `[]` | **PASS** |
| A) `fallbackAllCount` after retry path | **0** | **0** / `[]` | **PASS** |
| B) Attendance records `page_size=10` | **200** / `HRM-ATT-200` | Browser + Node probe | **PASS** |
| C) Auth 5 HRM endpoints in-session | 5/5 **200** | Contracts, insurance, recruitment, attendance, payroll | **PASS** |
| No `127.0.0.1:54321/rest/v1/*` | Zero | QA performance resource scan | **PASS** |
| HRM sync ERROR banner | Absent on load | QA DOM note | **PASS** |

## QC spot-check (2026-06-05)

| Check | Method | Result |
|-------|--------|--------|
| Attendance page L0 | `curl.exe` GET `…/hr/attendance?portal=1&companyId=main` | **200** |
| Full browser re-probe | Not run | QA artifact authoritative; no inconsistency found |

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Local `qc:dev-stack` not run | **ENV** | Not required for nip.io-only slice |
| Evidence pack 5/8 | **Process** | **GWC** — QA should add command_table + ack line format on next wave |
| `Kiểm tra lại` absent | **Informational** | Counts already **0**; does not reopen fallback gate |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| Attendance embed load (P-CC-07 / `/hr/attendance`) | API + zero localhost fallback | **PASS** (API/runtime layer) |
| **J-HRM-06** list→detail browser click | Not re-clicked | **Deferred (GWC)** — same pattern as R5-R1 / R4 |
| Full J-HRM **7/7** HTTPS probe | Not in R3 artifact | **Out of slice** — separate POST-DEPLOY / R4 waves |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19:** R3 exit criteria are attendance fallback-zero + records + auth 5-list — not full L2.5 matrix. Promoting **attendance lane** is valid without re-closing all J-* on HTTPS.

## Decision rationale

**GO WITH CONDITIONS** — All mandatory R3 exit criteria from PM dispatch are met on **current** pilot runtime. The **2026-05-28 R3 FAIL** (`fallbackAllCount=8`) and **2026-05-28 QC NO-GO** (missing artifact) are **superseded** by executable QA evidence showing **8 → 0**, stable **HRM-ATT-200**, and auth 5-list **200**. Aligns with prior **R5-R1** and **R4** GWC on the same attendance/auth slice.

**Bounded promotion:** `ceo@xe.vn` / `companyId=main` / nip.io attendance URL only — **not** unconditional RESIDUAL-03 program sign-off.

### Does R3-R1 close HTTPS RESIDUAL-03 attendance lane?

**Yes (bounded)** — P0 localhost Supabase fallback on audited attendance paths is **closed** for this persona/route on pilot HTTPS.

## Conditions (mandatory)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R3R1-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io only | QA | **MET** this wave |
| **C-RES03R3R1-02** | Evidence pack format 5/8 — add `command_table` + standard `work_item_id:` line | QA | **Open** (process) |
| **C-RES03R3R1-03** | Command Center embed `P-CC-07` not re-smoked separately this wave | QA | **GWC** — direct `/hr/attendance` PASS |
| **C-RES03R3R1-04** | J-HRM-06 list→detail browser click not re-proven | QA | **Deferred** |
| **C-RES03R3R1-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** |

## Residual (not promoted)

- Full **P1-EX-HTTPS-RESIDUAL-03** program bundle (all J-HRM browser, member personas, PROD).
- Broader auth waves (`P1-EX-QA-HTTPS-BROWSER-AUTH-*`) if still open on bus — out of this R3-R1 slice.

## completion_report

- **closed_scope:**
  - Audited QA `p1-ex-qa-https-residual-03-r3-20260605.md` vs prior R3 NO-GO/FAIL (2026-05-28).
  - Confirmed closure: `fallbackAllCount` **8 → 0**, attendance **HRM-ATT-200**, five HRM endpoints **200**.
  - Issued **GO WITH CONDITIONS** for **P1-EX-HTTPS-RESIDUAL-03** attendance lane on pilot HTTPS.
- **residual:**
  - Process pack format (5/8); J-HRM-06 browser; CC embed optional smoke; **NOT** Phase 1 DONE / **NOT** PROD.

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R3-R1 PASS_TO_PM: attendance lane GWC on nip.io (fallback 8→0, HRM-ATT-200, auth 5/5 200). Update TEAM_WORKING_NOW / bus — promote R3 attendance slice; do not claim Phase 1 DONE or PROD. Optional: dispatch qa narrow J-HRM-06 browser on HTTPS if PM wants L2.5 click closure; else continue open HTTPS/matrix backlog per PHASE1_CRUD_ACCEPTANCE_MATRIX.`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r1-20260605.md`
- **ack_status:** `PASS_TO_PM`
