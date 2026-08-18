# Evidence — PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-ATT-03b C-SLICE only** · **not** ATT-03b module UAT · **not** residual alone = ATT-03b / FR-03b DONE · **not** thin year alone = ATT-03b DONE · **not** catalog = ATT-01 DONE · **not** LIVE = ATT-11 DONE · **not** AGG = ATT-10 DONE · **not** soft/ATT-08 = ATT-09 DONE · **not** CFG = ATT-02 DONE · **not** ATT module UAT · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** PLT/CORE DONE · **not** soft = CORE-06 DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-31) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT03BQA1-MSM0524Y`** · FE-02 `READY_FOR_QA` · BE-01 `READY_FOR_QA` · API-01 CONFIRMED RETAIN · BA-01 · must_keep **`ATT01QC1-MSLZ3KIM`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 · Nest `/core` DENY · PAY OUT · U65 zero-seed · R-ATT-01-ASSIGN **open** |
| **uc_ids** | `UC-BP-ATT-03b` · `FR-UC-BP-ATT-03b` · `J-HRM-ATT-03B-01..06` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-03b-cluster-qa-01.md`](po-hrm-mvp-gd1-att-03b-cluster-qa-01.md) · stamp **`ATT03BQA1-MSM0524Y`** · raw `_tmp-po-hrm-mvp-gd1-att-03b-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-03b-cluster-fe-02.md`](po-hrm-mvp-gd1-att-03b-cluster-fe-02.md) |
| **be_ref** | [`po-hrm-mvp-gd1-att-03b-cluster-be-01.md`](po-hrm-mvp-gd1-att-03b-cluster-be-01.md) |
| **ba_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01.md` |
| **api_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md` |
| **stamp** | QC **`ATT03BQC1-MSM0891H`** · QA **`ATT03BQA1-MSM0524Y`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · year **2096** CRUD via FE Lưu only |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · `contracts_printable_ready=false` RETAIN · residual alone ≠ ATT-03b DONE · thin ≠ ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · PLT/CORE RETAIN · soft≠CORE-06 · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · **≠** claim ATT-03b DONE |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · Thiết lập → Lịch lễ / Tết · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim residual alone = ATT-03b / FR-03b DONE** | **DENIED** | C-SLICE |
| **Claim thin year alone = ATT-03b DONE** | **DENIED** | C-SLICE |
| **Claim ATT-03b module UAT DONE** | **DENIED** | C-SLICE ≠ module |
| **Claim catalog alone = ATT-01 DONE** | **DENIED** | must_keep ATT01 |
| **Claim LIVE alone = ATT-11 DONE** | **DENIED** | must_keep ATT11 |
| **Claim AGG alone = ATT-10 DONE** | **DENIED** | must_keep ATT10 |
| **Claim soft / ATT-08 = ATT-09 DONE** | **DENIED** | must_keep ATT09/08 |
| **Claim CFG alone = ATT-02 DONE** | **DENIED** | must_keep ATT02 |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`recruitment_uat_ready` / `jd_dynamic_done` / personnel UAT** | **`false`** | **DENIED** flip |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT-09 RETAIN |
| **Invent ASSIGN / shift-assignments DONE** | **DENIED** | R-ATT-01-ASSIGN open |
| **Invent PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Claim PLT / CORE-10/09/07 DONE** | **DENIED** | must_keep peer stamps |
| **Claim soft Profile = CORE-06 DONE** | **DENIED** | soft≠CORE-06 |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual holiday SoT** | **DENIED** | L0 probe **404** · SoT non-404 **0** |
| **Reopen sealed J-HRM-ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*** | **DENIED** | must_keep |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-31 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim residual alone / thin year = ATT-03b / FR-03b DONE? | **NO** |
| May PM claim ATT-03b module UAT DONE? | **NO** |
| May PM claim catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · CFG=ATT-02 DONE? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM open next UC seat **UC-BP-ATT-03d** as **sa Option**? | **YES** (U88/U89 continuous · board #34) |
| May PM treat **R-ATT-01-ASSIGN open** as FAIL this seat GWC? | **NO** — peer HOLD invent RETAIN · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-03b** (physical `GET/PUT /attendance/holiday-calendars/:year` residual lunar/type/publish · `statusLabelVi`/`dayTypeLabelVi` · `midYearPendingLeaveRecalcRequired` banner on replace · HOL-MISS year ABSENT CTA peer ATT-08 · Nest `/core` **0** · U65 zero-seed · honesty seals · printable **false** · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · ATT-01/11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · ≠ residual alone = ATT-03b DONE · ≠ thin = ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE) after QA stamp **`ATT03BQA1-MSM0524Y`**.

Audited: QA-01 MD · FE-02 · BE-01 · BA-01 · API-01 · L0/L2.5/network J-01..06 **all PASS** · must_keep ATT-01/11/10/09/08/02/PLT/CORE · DENY Nest `/core` · DENY residual/thin=ATT-03b DONE · DENY catalog/LIVE/AGG DONE · DENY ATT UAT · DENY invent ASSIGN/`att_leave_hold` · DENY invent PAY/printable · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** GET/PUT `holiday-calendars/2096` **2xx** `HRM-ATT-HOL-201` + F5 dayCount=3 · lunarFlag/calendarType · dayType/isPaid · midYear banner · HOL-MISS 2030 CTA · Nest `/core` **0** · seed **none** · C-SLICE.

**OBS ACCEPT (non-blocking):** QA pack verify **1/8** FAIL (`command_table`) — **PROCESS OBS** (QC consolidates **8/8**) · peer HOLD **`R-ATT-01-ASSIGN`** remains open invent (not this seat FAIL).

**NOT Phase 1 DONE. NOT ATT-03b module UAT. NOT residual alone = ATT-03b DONE. NOT thin = ATT-03b DONE. NOT catalog = ATT-01 DONE. NOT LIVE = ATT-11 DONE. NOT AGG = ATT-10 DONE. NOT soft/ATT-08 = ATT-09 DONE. NOT ATT module UAT. NOT CFG = ATT-02 DONE. NOT invent PAY/printable/`att_leave_hold`/ASSIGN DONE. NOT PLT/CORE DONE. NOT soft = CORE-06 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Holiday residual CRUD + midYear + HOL-MISS · J-01..06 PASS | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` holiday 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| Network SoT = physical `holiday-calendars` only | PRODUCT | **ACCEPT** |
| ≠residual=DONE · ≠thin=DONE · ≠catalog/LIVE/AGG · ≠ATT UAT · printable false · seals RETAIN | PRODUCT / GOVERNANCE | **ACCEPT** · DENY claim DONE |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · HOLD invent RETAIN · non-blocking |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / module UAT / reopen sealed J-* | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-03B-01..06 PASS · Network holiday-calendars only · Nest `/core` 0 · U65 · midYear · HOL-MISS CTA | QA Network · FE-02 · BE-01 | 🟢 |
| 2 | Explicit ≠ ATT-03b module UAT · ≠ residual alone=DONE · ≠ thin alone=DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 · printable false · PAY OUT · DENY att_leave_hold · Nest `/core` DENY · R-ATT-01-ASSIGN open · honesty false · C-SLICE | QA Honesty · FE · BE · API | 🟢 |
| 3 | must_keep RETAIN ATT01/11/10/09/08/02/PLT/CORE · soft≠CORE-06 | QA seals cite | 🟢 **RETAIN** |
| 4 | Pack BA/API/QA/FE/BE | evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer ATT-01/11/10/09/08) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** `:5173` · Nest `/core/att/holiday-calendars/:year` **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** `:5173` · Nest `/core` holiday **404** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical holiday-calendars* | nest SoT non-404 **0** · GET/PUT holiday-calendars 2xx | PRODUCT |
| QA runner U65 J-01..06 PASS | overall **PASS** stamp `ATT03BQA1-MSM0524Y` | PRODUCT |
| Network physical | GET holiday-calendars **11** · PUT **4** · midYear true · HOL-MISS preview **400** · Nest `/core` **0** | PRODUCT |
| FE-02 vitest | 3 files · 14 PASS · READY_FOR_QA | PRODUCT |
| BE-01 jest | 10 PASS · ATT-08 regression 12 PASS · tsc exit 0 | PRODUCT |
| API-01 / BA-01 | RETAIN cite F-ATT-HOL-01 · Nest DENY · J-01..06 AC | PRODUCT/GOV |
| `verify:qc:evidence-pack` QA-01 | **1/8** PROCESS OBS · QC consolidates | PROCESS |
| Screens | under `screens/po-hrm-mvp-gd1-att-03b-cluster-qa-01/` | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · Lịch lễ / Tết · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-03B-01..06 all PASS** |
| 6 | crud_or_matrix | ✅ AC-ATT-03B-* · holiday-calendars* · midYear · HOL-MISS · Nest DENY · printable false · PAY OUT · DENY `att_leave_hold` · ATT-01/11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · ≠ residual/thin=ATT-03b DONE · ≠ catalog/LIVE/AGG DONE |
| 7 | residual_section | ✅ below · HOLD ASSIGN peer · no P0 invent |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-03B-01** | **PASS** | CRUD year 2096 GET/PUT holiday-calendars 2xx + F5 · Nest `/core` 0 · ≠ thin=DONE |
| **J-HRM-ATT-03B-02** | **PASS** | lunarFlag + calendarType lunar · Nest 0 |
| **J-HRM-ATT-03B-03** | **PASS** | dayType nghi/truc · isPaid false · dayTypeLabelVi · ≠ PAY DONE |
| **J-HRM-ATT-03B-04** | **PASS** | status Đã phát hành · midYear banner · replace_in_place_gd1 · DENY silent |
| **J-HRM-ATT-03B-05** | **PASS** | HOL-MISS year 2030 · CTA admin · ≠ ATT-03b DONE alone · ≠ AGG=ATT-10 |
| **J-HRM-ATT-03B-06** | **PASS** | F5 dayCount=3 · honesty footer · seals RETAIN · printable false · C-SLICE |
| Module ATT / ATT-03b UAT / residual=ATT-03b DONE / thin=DONE promote | **DENIED** | C-SLICE |
| Claim invent ASSIGN / PAY/printable · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · CFG=ATT-02 · invent att_leave_hold · PLT/CORE DONE · soft=CORE-06 | **DENIED** | OUT invent |
| **J-HRM-ATT-01-*** / **ATT-11-*** / **ATT-10-*** / **ATT-09-*** / **ATT-08-*** / **ATT-02-*** / **PLT-01-*** / **CORE-10/09/07-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-ATT-03B-01 | **PASS** |
| J-HRM-ATT-03B-02 | **PASS** |
| J-HRM-ATT-03B-03 | **PASS** |
| J-HRM-ATT-03B-04 | **PASS** |
| J-HRM-ATT-03B-05 | **PASS** |
| J-HRM-ATT-03B-06 | **PASS** |

### Screens

QA cite: `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-03b-cluster-qa-01/` — `01-holiday-admin` … `10-j06-honesty`.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-ATT-03B-01..06 PASS with QC stamp **`ATT03BQC1-MSM0891H`** (C-SLICE · honesty false · printable false · **≠** claim ATT-03b / ATT module UAT · **≠** residual/thin alone DONE). Update continuous board Wave-31 **SEALED GWC** · next **UC-BP-ATT-03d** SA (#34).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim residual = ATT-03b DONE · claim thin = ATT-03b DONE · claim ATT-03b module UAT · claim catalog = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG = ATT-02 DONE · invent `att_leave_hold` · invent ASSIGN DONE · invent PAY/printable DONE · soft=CORE-06 DONE · PLT DONE · CORE-10/09/07 DONE · seed · reopen sealed J-HRM-ATT-01-* / J-HRM-ATT-11-* / J-HRM-ATT-10-* / J-HRM-ATT-09-* / J-HRM-ATT-08-* / J-HRM-ATT-02-* / J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* ….
2. **Condition HOLD `R-ATT-01-ASSIGN`:** peer ATT-01 Nest `shift-assignments*` **ABSENT** · **ACCEPT** non-blocking this seat GWC · **DENY** invent ASSIGN DONE · RETAIN stamp **`ATT01QC1-MSLZ3KIM`**.
3. **Condition OBS pack verify 1/8:** QA missing command_table — QC consolidates 8/8 — **ACCEPT**.
4. **RETAIN** physical `holiday-calendars*` residual · midYear · HOL-MISS peer ATT-08 · Nest `/core` DENY · DENY `att_leave_hold` · must_keep ATT-01 · ATT-11 · ATT-10 · ATT-09 · ATT-08 · ATT-02 · PLT-01 · CORE-10 · CORE-09 printable false · CORE-07 · soft≠CORE-06 · U19 J-01..06 PASS.
5. **OUT** this seat: invent ASSIGN DONE · invent PAY DONE · invent printable DONE · invent Nest `/core` dual · invent `att_leave_hold` · claim residual/thin = ATT-03b DONE · claim catalog = ATT-01 DONE · claim ATT-03b / ATT module UAT · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · soft=CORE-06.
6. **NOT** Phase 1 DONE · **NOT** ATT-03b module UAT · Wave-31 **SEALED GWC** ≠ program exit · **C-SLICE ≠ module UAT** · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-01-ASSIGN** | HOLD | OPEN / **non-blocking GWC** · peer ATT-01 · Nest `shift-assignments*` ABSENT · **DENY** invent DONE | **dev-be** HOLD invent · RETAIN ATT01 |
| **R-ATT-03B-HONESTY** | INFO | RETAIN | **pm** — DENY flip · residual≠ATT-03b · thin≠ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY att_leave_hold · ATT-01/11/10/09/08/02/PLT/CORE RETAIN |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from in-scope holiday browser matrix (J-01..06 all PASS). Peer ASSIGN HOLD is **condition**, not invent FAIL.

---

## DENY

- Flip `attendance_uat_ready` / `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / personnel / ATT module UAT / ATT-03b module UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual holiday SoT  
- Invent ASSIGN / `shift-assignments` DONE · invent `att_leave_hold` dual · claim residual/thin = ATT-03b DONE · claim catalog = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim FR-03b DONE  
- Claim CFG alone = ATT-02 DONE  
- Claim PLT DONE · CORE-10 DONE · CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE  
- Invent PAY / printable DONE  
- Seed / reopen sealed J-HRM-ATT-01-* / J-HRM-ATT-11-* / J-HRM-ATT-10-* / J-HRM-ATT-09-* / J-HRM-ATT-08-* / J-HRM-ATT-02-* / J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* …  
- Treat GWC as module GO · C-SLICE-as-module-DONE · honesty flip  

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT01QC1-MSLZ3KIM`** | ATT-01 CAT/CNS RETAIN · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN **open** |
| **`ATT11QC1-MSLXTH9P`** | ATT-11 sign/close RETAIN · ≠ LIVE=ATT-11 DONE |
| **`ATT10QC1-MSLWGUYH`** | ATT-10 AGG/submit RETAIN · ≠ AGG=ATT-10 DONE · HOL/MEAL OUT |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` · ≠ soft/ATT-08=ATT-09 DONE |
| **`ATT08QC1-MSLSL36C`** | ATT-08 preview RETAIN · HOL-MISS peer · ≠ ATT-03b DONE alone |
| **`ATT02QC1-MSLQZUK7`** | CFG≠ATT-02 DONE |
| **`PLT01QC1-MSLPUQIU`** | PLT RETAIN ≠ DONE |
| **`CORE10QC1-MSLP0EJB`** | CORE-10 RETAIN ≠ DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false** RETAIN |
| **`CORE07QC1-KZJTSHNT`** | CORE-07 RETAIN ≠ DONE |
| soft≠CORE-06 | must_keep |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #34 **UC-BP-ATT-03d** GPS điểm chấm công · U88 continuous) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-03b: J-HRM-ATT-03B-01..06 PASS after QA **`ATT03BQA1-MSM0524Y`** (holiday-calendars* residual lunar/type/publish · midYear banner · HOL-MISS CTA · Nest `/core` **0** · U65 · printable false · PAY OUT · DENY `att_leave_hold` · R-ATT-01-ASSIGN open · must_keep ATT-01/11/10/09/08/02/PLT/CORE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT-03b / ATT module UAT · CFG≠ATT-02 DONE · pack QC 8/8). Conditions: honesty false · HOLD ASSIGN peer · DENY Nest dual / seed / invent PAY / reopen peers. Stamp **`ATT03BQC1-MSM0891H`**. Next continuous: **UC-BP-ATT-03d** SA Option (U88 · board #34). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous · U88 after ATT-03b QC)
uc_ids: UC-BP-ATT-03d · FR-UC-BP-ATT-03d
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-qc-01.md · stamp ATT03BQC1-MSM0891H · Wave-31 UC-BP-ATT-03b SEALED · QA ATT03BQA1-MSM0524Y · must_keep ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ≠ LIVE=DONE · ATT10QC1-MSLWGUYH ≠ AGG=DONE · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · DENY att_leave_hold · ≠ residual/thin alone=ATT-03b DONE · ≠ ATT-03b module UAT · ≠ ATT UAT · PAY OUT invent DONE · printable false RETAIN
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after ATT-03b = **UC-BP-ATT-03d** «Danh mục điểm GPS chấm công (vùng hợp lệ) — ADD MVP» (#34)
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03d · Diễn biến điểm GPS / vùng hợp lệ · must_keep ATT-03b holiday RETAIN (holiday-calendars* · midYear · HOL-MISS · Nest /core DENY · ≠ residual/thin=ATT-03b DONE) · must_keep ATT-01/11/10/09/08/02/PLT/CORE · printable false · DENY invent PAY DONE · DENY invent printable DONE · DENY claim ATT/PLT/CORE DONE

MISSION — SA Option seat (narrow):
1) Option A/B/C for GPS attendance points catalog (vùng hợp lệ) vs AS-IS LIVE punch/geo surfaces — DENY Nest /core dual · DENY wipe ATT-03b holiday residual · DENY wipe ATT-01 CAT/CNS · DENY invent ASSIGN DONE · DENY wipe ATT-11 sign/close · DENY wipe ATT-10 AGG/submit · DENY wipe ATT-09 hold · DENY wipe ATT-08 preview · DENY wipe ATT-02 late-penalty CFG · DENY wipe PLT-01 · DENY wipe CORE-10/09/07 · DENY soft=CORE-06 DONE · DENY invent PAY/printable DONE · DENY claim ATT module UAT / ATT-03b DONE from Option alone
2) F.1 API map + must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE seals · DENY reopen sealed J-HRM-ATT-03B-01..06 · DENY reopen ATT-01/11/10/09/08/02/PLT/CORE-* without regression · DENY flip attendance_uat_ready / contracts_printable_ready · DENY invent att_leave_hold
3) Disposition: RETAIN cite LIVE geo vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note ATT-03b ADD seal ≠ ATT module UAT DONE · printable false RETAIN · PAY OUT · R-ATT-01-ASSIGN remains open HOLD
cấm: honesty flip · attendance_uat_ready · contracts_printable_ready · module ATT UAT claim DONE · claim ATT-03b DONE · claim residual/thin=ATT-03b DONE · invent ASSIGN DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · invent att_leave_hold · invent PAY/printable DONE · seed · Nest /core dual · reopen sealed ATT-03b/01/11/10/09/08/02/PLT/CORE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT03BQC1-MSM0891H` · 2026-08-09 · Wave-31 UC-BP-ATT-03b **SEALED GWC** ≠ ATT-03b module UAT · ≠ residual alone = ATT-03b DONE · ≠ thin alone = ATT-03b DONE · ≠ catalog alone = ATT-01 DONE · ≠ invent ASSIGN DONE · ≠ LIVE alone = ATT-11 DONE · ≠ AGG = ATT-10 DONE · ≠ soft/ATT-08 = ATT-09 DONE · ≠ ATT module UAT · ≠ CFG = ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-01 RETAIN · ATT-11 RETAIN · ATT-10 RETAIN · ATT-09 RETAIN · ATT-08 RETAIN · ATT-02 RETAIN · PLT RETAIN · CORE-10 RETAIN · CORE-09 RETAIN · CORE-07 RETAIN · soft≠CORE-06 DONE · Nest `/core` DENY · HOLD R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
