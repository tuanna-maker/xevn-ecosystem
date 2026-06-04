# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R4 (re-gate)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R4` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-05-31` |
| decision | **GO WITH CONDITIONS** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R4 attendance fallback-zero + auth 5-list on pilot HTTPS |
| pilot_url | `https://14-225-217-232.nip.io` |
| ack_status | **PASS_TO_PM** |

## Scope audited

Re-gate of **R4 milestone** after QA `P1-EX-QA-HTTPS-RESIDUAL-03-R4` **PASS_TO_PM** (`2026-05-30`). Prior QC verdict **NO-GO** (`2026-05-28`) due to `fallbackAllCount=8`.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · corporate production cutover · full Excellence T6.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260530.md` | QA | **Authoritative** — `PASS_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r4-20260528.md` | QC (prior) | **NO-GO** — delta baseline |
| 3 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md` | QC (chain) | GWC attendance pilot; R5 deploy context |

## Delta vs prior R4 NO-GO (2026-05-28)

| Criterion | R4 QC 2026-05-28 | QA R4 2026-05-30 | QC adjudication |
|-----------|------------------|------------------|-----------------|
| `fallbackAllCount` (direct + CC embed) | **8** | **0** | **CLOSED** |
| Attendance records probe | 200 / `HRM-ATT-200` | 200 / `HRM-ATT-200` | **CLOSED** |
| Auth 5-list (browser session) | 5/5 200 | 5/5 200 | **CLOSED** |
| `test:pilot:flows` (pilot) | Not in R4 artifact | **13/13** exit 0 | **PASS** |
| HTTPS-01 probe L2 / L2.5 | Not in R4 artifact | **23/23** + J-HRM **7/7** | **PASS** (script) |

## Gate matrix (R4 mandatory)

| Gate | Expected | Actual (QA + QC spot) | QC verdict |
|------|----------|----------------------|------------|
| A) `fallbackAllCount=0` direct `/hr/attendance` | 0 | 0 / `[]` | **PASS** |
| A) `fallbackAllCount=0` CC embed attendance | 0 | 0 parent+iframe | **PASS** |
| B) Attendance records in-session | 200 / `HRM-ATT-200` | before + after | **PASS** |
| D) Auth 5-list browser session | 5/5 200, no `HRM-AUTH-001` | 5/5 200 | **PASS** |
| R5 bundle guard live | present | `isRemoteLocalhostSupabaseMisconfig` (QC curl 2026-05-31) | **PASS** |
| L0 attendance route | 200 | QC `curl.exe` **200** | **PASS** |
| Workstation `qc:dev-stack` | ideal 0 | exit **1** (local `:28001`/`:5175` down) | **GWC** — pilot substitute accepted |

## L2.5 journey coverage audit (U19)

| Journey / probe | This wave | QC |
|-----------------|-----------|-----|
| J-HRM **7/7** (HTTPS-01 probe script) | **PASS** | **Concurred** — API/L2.5 probe exit 0 |
| **J-HRM-06** browser click embed | Not re-clicked; Cursor blank HRM shell | **Deferred (GWC)** — network/API gates PASS; visual click optional |
| CC embed `P-CC-07` fallback scan | `fallbackAllCount=0` | **PASS** |
| Member CEO / `du-lich.ceo@xe.vn` | Not in slice | **Out of scope** |

**U19 applied:** Script J-HRM 7/7 satisfies L2.5 **probe layer** for this bounded slice; browser list→detail click on `/hr/attendance` remains **GWC** (aligned with R5-R1 deferral pattern).

## Decision rationale

**GO WITH CONDITIONS** — R4 mandatory P0 gates that blocked the **2026-05-28 NO-GO** are **closed** on current pilot runtime evidence (`fallbackAllCount` **8 → 0**; auth + attendance probes green). QA artifact is internally consistent; QC spot-check confirms live route **200** and R5 guard in bundle.

Partial promotion only: **attendance + impacted auth list slice** on `ceo@xe.vn` / `companyId=main` pilot HTTPS — **not** unconditional program or production sign-off.

### Does R4 close HTTPS RESIDUAL-03 attendance fallback?

**Yes (bounded)** — P0 attendance localhost Supabase fallback on pilot HTTPS is **closed** for the audited URL paths. Broader RESIDUAL-03 / program obligations remain under separate waves and conditions below.

## Conditions (mandatory)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-RES03R4R1-01** | Persona/route: `ceo@xe.vn`, `companyId=main`, pilot nip.io only | QA | **MET** this wave |
| **C-RES03R4R1-02** | Workstation L0 fails when local dev stack down; pilot flows substitute | DevOps/QA | **Open** — acceptable for pilot-only gate |
| **C-RES03R4R1-03** | Cursor browser blank HRM direct shell — API/fallback PASS; real Chrome visual optional | QA | **GWC monitor** |
| **C-RES03R4R1-04** | J-HRM-06 list→detail **browser** click not re-proven post-R4 retest | QA | **Deferred** |
| **C-RES03R4R1-05** | Production / Phase 1 Program DONE | PM/QC | **NOT MET** — unchanged |

## Blocker closure (from prior R4 NO-GO)

| ID | Prior status | Now |
|----|--------------|-----|
| B-RES03R4-01 `fallbackAllCount=8` | OPEN | **CLOSED** |
| B-RES03R4-02 `127.0.0.1:54321/rest/v1/*` hits | OPEN | **CLOSED** |
| B-RES03R4-03 R4 FE guard ineffective | OPEN | **CLOSED** (R5 chain effective) |

## completion_report

- **closed_scope:**
  - Upgraded R4 from **NO-GO** → **GO WITH CONDITIONS** on QA 2026-05-30 evidence.
  - Mandatory fallback-zero + attendance probe + auth 5-list **PASS** on pilot HTTPS.
  - QC spot-check: attendance route **200**, R5 guard present in live bundle.
- **residual:**
  - **Not** Phase 1 Program DONE / **not** PROD-READY.
  - Workstation local L0 down; J-HRM-06 browser click deferred; member personas not tested.

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `PM intake P1-EX-QC-HTTPS-RESIDUAL-03-R4 GO WITH CONDITIONS (evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r4-20260531.md). R4 attendance fallback P0 closed on pilot HTTPS; auth 5-list closed. Update PROJECT_STATUS_REPORT / RESIDUAL-03 tracker — do not claim Program DONE or PROD. Optional: dispatch QA P1-EX-QA-HTTPS-J-HRM-06-BROWSER-01 for C-RES03R4R1-04 J-HRM-06 click on real Chrome if sponsor wants visual L2.5 sign-off.`
- **pm_dispatch_hint:** None P0. Optional QA browser J-HRM-06 click for C-RES03R4R1-04.
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r4-20260531.md`
- **ack_status:** `PASS_TO_PM`
