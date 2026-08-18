# Evidence — PO-HRM-MVP-GD1-ATT-04-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-ATT-04 C-SLICE only** · **not** ATT-04 module DONE · **not** ATT module UAT · **not** L1/LVRULE/grant alone = FR-04 DONE · **not** soft/ATT-09 = ATT-04 DONE · **not** catalog = ATT-01 DONE · **not** LIVE = ATT-11 DONE · **not** AGG = ATT-10 DONE · **not** CFG = ATT-02 DONE · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** PLT/CORE DONE · **not** soft = CORE-06 DONE · **not** wipe ATT-03d GPS |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-33 · seat **#35**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT04QA1-MSM21P8W`** · FE-01 `READY_FOR_QA` · BA-01 O1–O12 · API-01 CONFIRMED RETAIN · must_keep **`ATT03DQC1-MSM1CR19`** · **`ATT03BQC1-MSM0891H`** · **`ATT01QC1-MSLZ3KIM`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 · Nest `/core` DENY · PAY OUT · U65 zero-seed · R-ATT-01-ASSIGN **open** · R-ATT-03D-CNS-STATUS-CODE P2 FE parallel (peer) |
| **uc_ids** | `UC-BP-ATT-04` · `FR-UC-BP-ATT-04` · `J-HRM-ATT-04-01..06` · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-04-cluster-qa-01.md`](po-hrm-mvp-gd1-att-04-cluster-qa-01.md) · stamp **`ATT04QA1-MSM21P8W`** · raw `_tmp-po-hrm-mvp-gd1-att-04-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-04-cluster-fe-01.md`](po-hrm-mvp-gd1-att-04-cluster-fe-01.md) |
| **ba_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01.md` |
| **api_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md` |
| **stamp** | QC **`ATT04QC1-MSM22G4W`** · QA **`ATT04QA1-MSM21P8W`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · `contracts_printable_ready=false` RETAIN · L1/LVRULE/grant ≠ ATT-04 DONE · soft/ATT-09 ≠ ATT-04 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · PLT/CORE RETAIN · soft≠CORE-06 · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · R-ATT-04-FY · R-ATT-04-ENGINE **HOLD footers** · **≠** claim ATT-04 DONE |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · Thiết lập → Quy định nghỉ / Quy tắc quỹ · Nghỉ phép grant · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-04 module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim L1 / leave-type catalog alone = FR-04 DONE** | **DENIED** | must_keep ATT01 · BA O1 |
| **Claim LVRULE BE / policy admin alone = FR-04 DONE** | **DENIED** | BA O2 · ≠ ENGINE LIVE |
| **Claim PUT tracked-entitlement / grant alone = ATT-04 DONE** | **DENIED** | peer ATT09 · BA O3 |
| **Claim soft / ATT-09 hold path = ATT-04 DONE** | **DENIED** | must_keep ATT09 |
| **Claim catalog alone = ATT-01 DONE** | **DENIED** | must_keep ATT01 |
| **Claim LIVE alone = ATT-11 DONE** | **DENIED** | must_keep ATT11 |
| **Claim AGG alone = ATT-10 DONE** | **DENIED** | must_keep ATT10 |
| **Claim CFG alone = ATT-02 DONE** | **DENIED** | must_keep ATT02 |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT-09 RETAIN `pending_days` |
| **Invent ASSIGN / shift-assignments DONE** | **DENIED** | R-ATT-01-ASSIGN open |
| **Invent PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Claim PLT / CORE-10/09/07 DONE** | **DENIED** | must_keep peer stamps |
| **Claim soft Profile = CORE-06 DONE** | **DENIED** | soft≠CORE-06 |
| **Wipe / reopen ATT-03d GPS (`work-sites*`)** | **DENIED** | **`ATT03DQC1-MSM1CR19`** |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual leave SoT** | **DENIED** | L0 probe **404** · SoT non-404 **0** |
| **Reopen sealed J-HRM-ATT-03D / ATT-03B / ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*** | **DENIED** | must_keep |
| **Seed** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-33 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-04 / FR-04 DONE from this seat? | **NO** |
| May PM claim L1 alone · LVRULE alone · grant alone · panel alone = ATT-04 DONE? | **NO** |
| May PM claim soft/ATT-09 = ATT-04 DONE · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · CFG=ATT-02 DONE? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM wipe ATT-03d GPS · invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM open next UC seat **UC-BP-ATT-04b** as **sa Option**? | **YES** (U88/U89 continuous · board **#36**) |
| May PM treat **R-ATT-04-FY** / **R-ATT-04-ENGINE** HOLD as FAIL this seat GWC? | **NO** — footer HOLD · non-blocking |
| May PM treat **R-ATT-01-ASSIGN open** as FAIL this seat GWC? | **NO** — peer HOLD invent RETAIN · non-blocking |
| May PM treat **R-ATT-03D-CNS-STATUS-CODE** P2 as FAIL this seat GWC? | **NO** — peer ATT-03d residual · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-04** (physical `leave-types*` N+1 · `leave-accrual-policies` POST **201** · `PUT tracked-entitlement` **200** · panel/EFF/CNS probes · Nest `/core` **0** · U65 zero-seed · honesty seals · printable **false** · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · ATT-03d/03b/01/11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · ≠ ATT-04 DONE · ≠ ATT module UAT · FY/ENGINE HOLD footers visible) after QA stamp **`ATT04QA1-MSM21P8W`**.

Audited: QA-01 MD (pack **8/8**) · FE-01 · BA-01 · API-01 · L0/L2.5 J-01..06 · must_keep peer chain · DENY Nest `/core` · DENY L1/LVRULE/grant/soft=peer DONE · DENY ATT UAT · DENY invent ASSIGN/`att_leave_hold` · DENY invent PAY/printable · DENY honesty flip · DENY seed · DENY reopen ATT-03d GPS.

**U65 ACCEPT:** leave-types mutate **200** + F5 · accrual policy **201** + F5 · grant **200** + F5 · EFF/CNS **400** `HRM-VAL-001` when gated · Nest `/core` **0** · seed **none** · C-SLICE.

**Condition ACCEPT (non-blocking):** **R-ATT-04-FY** — FY start-month CRUD **ABSENT** · footer HOLD only · **≠** invent ATT-04 DONE.

**Condition ACCEPT (non-blocking):** **R-ATT-04-ENGINE** — **F-ATT-LEAVE-04** accrue job **HOLD GĐ1** · footer HOLD · **≠** claim ENGINE LIVE = slice DONE.

**OBS ACCEPT (non-blocking):** Peer **R-ATT-03D-CNS-STATUS-CODE** P2 · **R-ATT-01-ASSIGN** open — not re-litigated as ATT-04 FAIL.

**NOT Phase 1 DONE. NOT ATT-04 module DONE. NOT ATT module UAT. NOT L1/LVRULE/grant alone = FR-04 DONE. NOT soft/ATT-09 = ATT-04 DONE. NOT catalog/LIVE/AGG/CFG peer DONE. NOT invent PAY/printable/`att_leave_hold`/ASSIGN DONE. NOT PLT/CORE DONE. NOT soft = CORE-06 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| leave-types* · leave-accrual-policies · tracked-entitlement · panel/EFF · J-01..06 | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` leave 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| Network SoT = physical `/api/hrm/attendance/*` only | PRODUCT | **ACCEPT** |
| ≠ATT-04 DONE · ≠ATT UAT · FY/ENGINE HOLD footers · seals RETAIN | PRODUCT / GOVERNANCE | **ACCEPT** · DENY claim DONE |
| R-ATT-04-FY · R-ATT-04-ENGINE | PRODUCT residual | **ACCEPT** · non-blocking Condition |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · HOLD invent RETAIN · non-blocking |
| R-ATT-03D-CNS-STATUS-CODE P2 (peer) | PRODUCT residual | **ACCEPT** · non-blocking · parallel dev-fe |
| `verify:qc:evidence-pack` QA-01 | PROCESS | **ACCEPT** · **8/8** |
| Honesty / seed / module UAT / reopen ATT-03d | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-04-01..06 · Network leave-types* + accrual-policies + tracked-entitlement · EFF/CNS · Nest `/core` 0 · U65 | QA Network · FE-01 · BA/API | 🟢 |
| 2 | Explicit ≠ ATT-04 DONE · ≠ ATT UAT · ≠ L1/LVRULE/grant/soft=peer DONE · printable false · PAY OUT · DENY att_leave_hold · Nest `/core` DENY · R-ATT-01-ASSIGN open · FY/ENGINE HOLD · honesty false · C-SLICE | QA Honesty · FE · BA | 🟢 |
| 3 | must_keep RETAIN ATT03D GPS · ATT03B/01/11/10/09/08/02/PLT/CORE · soft≠CORE-06 · **DENY reopen ATT-03d** | QA seals cite | 🟢 **RETAIN** |
| 4 | Pack BA/API/QA/FE | evidence present · verify pack **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qa-01.md` | exit **0** · **8/8 PASS** |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** `:5173` · Nest `/core` leave probes **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** · `qc:fe-be-health` **0** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical LVT/LVRULE/grant | nest SoT non-404 **0** | PRODUCT |
| QA runner U65 J-01..06 | overall **PASS** stamp `ATT04QA1-MSM21P8W` | PRODUCT |
| Network physical | leave-types **200** · accrual-policies **201** · tracked-entitlement **200** · Nest `/core` **0** | PRODUCT |
| FE-01 vitest + build | 2 files · 8 PASS · build **0** · READY_FOR_QA | PRODUCT |
| API-01 / BA-01 | RETAIN F-ATT-CAT-LVT/EFF · F-ATT-LVRULE · grant cite ATT-09 · Nest DENY · J-01..06 AC | PRODUCT/GOV |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |
| Screens | under `screens/po-hrm-mvp-gd1-att-04-cluster-qa-01/` | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · leave-rules · grant · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-04-01..06** |
| 6 | crud_or_matrix | ✅ AC-ATT-04-* · LVT · LVRULE · grant · panel · CNS · Nest DENY · printable false · PAY OUT · DENY `att_leave_hold` · peer RETAIN · ≠ ATT-04 DONE |
| 7 | residual_section | ✅ below · FY/ENGINE HOLD · ASSIGN peer · no P0 invent |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-04-01** | **PASS** | leave-types N+1 **200** + F5 · Nest `/core` 0 · ≠ L1 alone = DONE |
| **J-HRM-ATT-04-02** | **PASS** | accrual policy **201** + F5 · ≠ ENGINE LIVE |
| **J-HRM-ATT-04-03** | **PASS** | PUT tracked-entitlement **200** + F5 · product path · ≠ seed |
| **J-HRM-ATT-04-04** | **PASS** | leave-balance-panel MVP labels |
| **J-HRM-ATT-04-05** | **PASS** | EFF picker · CNS **400** `HRM-VAL-001` when gated |
| **J-HRM-ATT-04-06** | **PASS** | att-04-honesty · FY/ENGINE HOLD · must_keep cite · ≠ ATT-04/UAT DONE |
| Module ATT / ATT-04 UAT promote | **DENIED** | C-SLICE |
| Claim L1/LVRULE/grant/soft=peer · catalog/LIVE/AGG/CFG · invent ASSIGN/PAY/printable/att_leave_hold | **DENIED** | OUT invent |
| **J-HRM-ATT-03D-*** / **ATT-03B-*** / **ATT-01-*** / **ATT-11-*** / **ATT-10-*** / **ATT-09-*** / **ATT-08-*** / **ATT-02-*** / **PLT-01-*** / **CORE-10/09/07-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen · **DENY wipe ATT-03d GPS** |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-ATT-04-01 | **PASS** |
| J-HRM-ATT-04-02 | **PASS** |
| J-HRM-ATT-04-03 | **PASS** |
| J-HRM-ATT-04-04 | **PASS** |
| J-HRM-ATT-04-05 | **PASS** |
| J-HRM-ATT-04-06 | **PASS** |

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-ATT-04-01..06 PASS with QC stamp **`ATT04QC1-MSM22G4W`** (C-SLICE · honesty false · printable false · **≠** claim ATT-04 / ATT module UAT). Update continuous board Wave-33 **SEALED GWC** · next **UC-BP-ATT-04b** SA (#36).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim ATT-04 DONE · claim L1/LVRULE/grant/soft=peer DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · invent `att_leave_hold` · invent ASSIGN DONE · invent PAY/printable DONE · soft=CORE-06 DONE · PLT/CORE DONE · seed · reopen sealed peers · **DENY wipe ATT-03d GPS**.
2. **Condition HOLD `R-ATT-04-FY`:** dedicated FY start-month CRUD **ABSENT** · footer only · **ACCEPT** non-blocking · **≠** invent ATT-04 DONE.
3. **Condition HOLD `R-ATT-04-ENGINE`:** **F-ATT-LEAVE-04** accrue job **HOLD GĐ1** · footer only · **ACCEPT** non-blocking · **≠** claim ENGINE LIVE = slice DONE.
4. **Condition HOLD `R-ATT-01-ASSIGN`:** peer ATT-01 Nest `shift-assignments*` **ABSENT** · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE · RETAIN **`ATT01QC1-MSLZ3KIM`**.
5. **Condition peer `R-ATT-03D-CNS-STATUS-CODE` P2:** ATT-03d GPS FE residual · **ACCEPT** non-blocking · **≠** ATT-04 invent FAIL.
6. **RETAIN** physical `/attendance/leave-types*` · `/leave-accrual-policies*` · `/leave-balance*` · Nest `/core` DENY · DENY `att_leave_hold` · must_keep ATT-03d **`ATT03DQC1-MSM1CR19`** · ATT-03b · ATT-01 · ATT-11 · ATT-10 · ATT-09 · ATT-08 · ATT-02 · PLT-01 · CORE-10 · CORE-09 printable false · CORE-07 · soft≠CORE-06 · U19 J-01..06.
7. **OUT** this seat: invent ASSIGN/PAY/printable/`att_leave_hold` · claim ATT-04 DONE · claim ATT module UAT · claim L1/LVRULE/grant/soft=peer DONE · claim catalog/LIVE/AGG/CFG peer DONE · wipe ATT-03d GPS.
8. **NOT** Phase 1 DONE · **NOT** ATT-04 module DONE · **NOT** ATT module UAT · Wave-33 **SEALED GWC** ≠ program exit · **C-SLICE ≠ module UAT** · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-04-FY** | HOLD | OPEN / **non-blocking GWC** · FY start-month CRUD ABSENT · footer HOLD | **ba-data** / later wave |
| **R-ATT-04-ENGINE** | HOLD | OPEN / **non-blocking GWC** · F-ATT-LEAVE-04 job HOLD GĐ1 | **pm** / SA later |
| **R-ATT-01-ASSIGN** | HOLD | OPEN / **non-blocking GWC** · peer ATT-01 · **DENY** invent DONE | **dev-be** HOLD invent · RETAIN ATT01 |
| **R-ATT-03D-CNS-STATUS-CODE** | P2 | OPEN peer / **non-blocking** | **dev-fe** parallel |
| **ATT module UAT** | INFO | `attendance_uat_ready=false` RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from in-scope ATT-04 browser matrix. FY/ENGINE/ASSIGN are **conditions**, not invent FAIL.

---

## DENY

- Flip `attendance_uat_ready` / module ATT UAT / ATT-04 DONE / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual leave SoT  
- Invent ASSIGN · invent `att_leave_hold` · invent PAY/printable DONE  
- Claim L1 alone · LVRULE alone · grant alone · panel alone = FR-04 / ATT-04 DONE  
- Claim soft/ATT-09 = ATT-04 DONE · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · CFG=ATT-02 DONE  
- Wipe ATT-03d `work-sites*` / reopen ATT-03d without regression  
- Seed · reopen sealed J-* · honesty flip · C-SLICE-as-module-DONE  

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT03DQC1-MSM1CR19`** | ATT-03d GPS RETAIN · **DENY wipe** in ATT-04 waves |
| **`ATT03BQC1-MSM0891H`** | ATT-03b holiday RETAIN |
| **`ATT01QC1-MSLZ3KIM`** | ATT-01 CAT/CNS RETAIN · R-ATT-01-ASSIGN **open** |
| **`ATT11QC1-MSLXTH9P`** | ATT-11 sign/close RETAIN |
| **`ATT10QC1-MSLWGUYH`** | ATT-10 AGG/submit RETAIN |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` · grant path cite |
| **`ATT08QC1-MSLSL36C`** | ATT-08 preview RETAIN |
| **`ATT02QC1-MSLQZUK7`** | CFG≠ATT-02 DONE |
| **`PLT01QC1-MSLPUQIU`** | PLT RETAIN |
| **`CORE10QC1-MSLP0EJB`** | CORE-10 RETAIN |
| **`CORE09QC1-MSLNBA89`** | printable **false** RETAIN |
| **`CORE07QC1-KZJTSHNT`** | CORE-07 RETAIN |
| soft≠CORE-06 | must_keep |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board **#36** **UC-BP-ATT-04b** · U88 continuous) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-04: J-HRM-ATT-04-01..06 after QA **`ATT04QA1-MSM21P8W`** (LVT/LVRULE/grant/panel/EFF · Nest `/core` **0** · U65 · printable false · PAY OUT · DENY `att_leave_hold` · must_keep ATT-03d GPS + full peer chain · FY/ENGINE HOLD footers · ≠ ATT-04 DONE · ≠ ATT module UAT · pack QA **8/8**). Conditions: honesty false · R-ATT-04-FY · R-ATT-04-ENGINE HOLD · R-ATT-01-ASSIGN peer · DENY Nest dual / seed / invent PAY / reopen ATT-03d. Stamp **`ATT04QC1-MSM22G4W`**. Next continuous: **UC-BP-ATT-04b** SA (#36). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #36 · U88 after ATT-04 QC GWC)
uc_ids: UC-BP-ATT-04b · FR-UC-BP-ATT-04b (ứng phép & thời điểm cấp / không lương bù trừ)
depends_on: QC-01 GWC PASS_TO_PM docs/qa/evidence/po-hrm-mvp-gd1-att-04-cluster-qc-01.md · stamp ATT04QC1-MSM22G4W · Wave-33 UC-BP-ATT-04 SEALED · QA ATT04QA1-MSM21P8W · must_keep ATT04QC1-MSM22G4W ≠ ATT-04 DONE · ATT03DQC1-MSM1CR19 GPS DENY wipe · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D DENY att_leave_hold · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · ≠ ATT module UAT · PAY OUT · printable false RETAIN · R-ATT-04-FY · R-ATT-04-ENGINE HOLD footers (non-blocking prior seat)
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — row **#36** UC-BP-ATT-04b «Ứng phép & thời điểm cấp / không lương bù trừ»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-04b · must_keep ATT-04 LVT/LVRULE/grant seals (≠ ATT-04 DONE alone) · ATT-03d GPS · ATT-09 pending_days · DENY invent att_leave_hold · DENY Nest /core dual · DENY wipe sealed ATT-04 J-01..06 without regression

MISSION — SA Option seat (narrow):
1) Option A/B/C for advance leave / timing / non-salary offset vs AS-IS LIVE surfaces — DENY Nest /core dual · DENY wipe ATT-04 LVT/LVRULE/grant seals · DENY wipe ATT-03d GPS · DENY invent ASSIGN/PAY/printable DONE · DENY claim ATT-04b/ATT module UAT from Option alone
2) F.1 API map + must_keep full ATT peer chain · DENY reopen sealed J-HRM-ATT-04-01..06 without regression · DENY flip attendance_uat_ready / contracts_printable_ready
3) Disposition: RETAIN cite LIVE vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · ATT-04 GWC ≠ ATT module UAT · FY/ENGINE HOLD carry · R-ATT-01-ASSIGN remains open
cấm: honesty flip · attendance_uat_ready · module ATT UAT DONE · claim ATT-04 DONE · invent att_leave_hold · seed · Nest /core dual · reopen ATT-03d/04 sealed J-* without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT04QC1-MSM22G4W` · 2026-08-09 · Wave-33 UC-BP-ATT-04 **SEALED GWC** ≠ ATT-04 module DONE · ≠ ATT module UAT · ≠ L1/LVRULE/grant/soft=peer DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-03d GPS RETAIN **`ATT03DQC1-MSM1CR19`** · ATT-03b/01/11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · Nest `/core` DENY · Condition R-ATT-04-FY · R-ATT-04-ENGINE · HOLD R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
