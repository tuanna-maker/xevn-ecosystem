# Evidence — PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-ATT-03d C-SLICE only** · **not** ATT-03d module UAT · **not** PLT WS alone = ATT-03d / FR-03d DONE · **not** residual/thin = ATT-03b DONE · **not** catalog = ATT-01 DONE · **not** LIVE = ATT-11 DONE · **not** AGG = ATT-10 DONE · **not** soft/ATT-08 = ATT-09 DONE · **not** CFG = ATT-02 DONE · **not** ATT module UAT · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** PLT/CORE DONE · **not** soft = CORE-06 DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-32 · seat **#34**) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT03DQA1-MSM1826M`** · FE-01 `READY_FOR_QA` · API-01 CONFIRMED RETAIN · BA-01 · must_keep **`ATT03BQC1-MSM0891H`** · **`ATT01QC1-MSLZ3KIM`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 · Nest `/core` DENY · **`ATTWSQA-MSJC3IN9`** · **`ATTWSQA2-MSJCG47P`** ≠ ATT-03d DONE · PAY OUT · U65 zero-seed · R-ATT-01-ASSIGN **open** |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · `J-HRM-ATT-03D-01..06` · **BR-BP-GPS-01** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-03d-cluster-qa-01.md`](po-hrm-mvp-gd1-att-03d-cluster-qa-01.md) · stamp **`ATT03DQA1-MSM1826M`** · raw `_tmp-po-hrm-mvp-gd1-att-03d-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-03d-cluster-fe-01.md`](po-hrm-mvp-gd1-att-03d-cluster-fe-01.md) |
| **ba_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md` |
| **api_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md` |
| **stamp** | QC **`ATT03DQC1-MSM1CR19`** · QA **`ATT03DQA1-MSM1826M`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · no `ensureDefaultWorkSite` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · `contracts_printable_ready=false` RETAIN · PLT WS / CNS-05 ≠ ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · PLT/CORE RETAIN · soft≠CORE-06 · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · **≠** claim ATT-03d DONE |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · Thiết lập → Quy định → Ứng dụng → Điểm GPS · Clock-In GPS · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim ATT-03d module DONE / UAT** | **DENIED** | C-SLICE |
| **Claim PLT WS / CNS-05 alone = ATT-03d / FR-03d DONE** | **DENIED** | C-SLICE · ATTWSQA* RETAIN |
| **Claim residual/thin = ATT-03b DONE** | **DENIED** | must_keep ATT03B |
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
| **Nest `/core` dual geofence SoT** | **DENIED** | L0 probe **404** · SoT non-404 **0** |
| **Reopen sealed J-HRM-ATT-03B / ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*** | **DENIED** | must_keep |
| **Seed / `ensureDefaultWorkSite` / `gps_locations` sole** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-32 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim ATT-03d / FR-03d DONE from this seat? | **NO** |
| May PM claim PLT WS / CNS-05 alone = ATT-03d DONE? | **NO** |
| May PM claim residual/thin = ATT-03b · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · CFG=ATT-02 DONE? | **NO** |
| May PM invent ASSIGN / PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM open next UC seat **UC-BP-ATT-04** as **sa Option**? | **YES** (U88/U89 continuous · board **#35**) |
| May PM treat **R-ATT-03D-CNS-STATUS-CODE** P2 as FAIL this seat GWC? | **NO** — FE residual parallel · non-blocking |
| May PM treat **R-ATT-01-ASSIGN open** as FAIL this seat GWC? | **NO** — peer HOLD invent RETAIN · non-blocking |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-03d** (physical `GET/POST/PATCH …/attendance/work-sites*` · punch `POST …/records` · **GEO-001** / **GEO-REQ** · soft-retire `active=false` · empty CTA · Nest `/core` **0** · U65 zero-seed · honesty seals · printable **false** · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · ATT-03b/01/11/10/09/08/02/PLT/CORE RETAIN · ATTWSQA* ≠ ATT-03d DONE · soft≠CORE-06 · ≠ ATT-03d DONE · ≠ PLT WS alone = DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE) after QA stamp **`ATT03DQA1-MSM1826M`**.

Audited: QA-01 MD · FE-01 · BA-01 · API-01 · L0/L2.5/network J-01..06 (J-03 **PASS_WITH_RESIDUAL**) · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE/ATTWSQA* · DENY Nest `/core` · DENY PLT WS=ATT-03d DONE · DENY catalog/LIVE/AGG DONE · DENY ATT UAT · DENY invent ASSIGN/`att_leave_hold` · DENY invent PAY/printable · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** POST work-sites **201** + F5 · PATCH soft-retire **200** · GEO-001 **400** · GEO-REQ **400** · empty CTA · Nest `/core` **0** · ensureDefault **0** · seed **none** · C-SLICE.

**Condition ACCEPT (non-blocking):** **R-ATT-03D-CNS-STATUS-CODE** P2 — GPS `checkIn` hardcodes `status=present` → `HRM-ATT-CODE-KEY` when EFF>0 · owner **dev-fe** parallel · **≠** invent ATT-03d DONE.

**OBS ACCEPT (non-blocking):** QA pack verify **1/8** FAIL (`command_table`) — **PROCESS OBS** (QC consolidates **8/8**) · peer HOLD **`R-ATT-01-ASSIGN`** remains open invent (not this seat FAIL).

**NOT Phase 1 DONE. NOT ATT-03d module UAT. NOT PLT WS alone = ATT-03d DONE. NOT residual/thin = ATT-03b DONE. NOT catalog = ATT-01 DONE. NOT LIVE = ATT-11 DONE. NOT AGG = ATT-10 DONE. NOT soft/ATT-08 = ATT-09 DONE. NOT ATT module UAT. NOT CFG = ATT-02 DONE. NOT invent PAY/printable/`att_leave_hold`/ASSIGN DONE. NOT PLT/CORE DONE. NOT soft = CORE-06 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| work-sites CRUD + soft-retire + GEO-001/GEO-REQ + empty CTA · J-01..06 | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` geofence 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| Network SoT = physical `work-sites*` + `records` only | PRODUCT | **ACCEPT** |
| ≠ATT-03d DONE · ≠PLT WS=DONE · ≠residual/thin=ATT-03b · ≠catalog/LIVE/AGG · ≠ATT UAT · printable false · seals RETAIN | PRODUCT / GOVERNANCE | **ACCEPT** · DENY claim DONE |
| R-ATT-03D-CNS-STATUS-CODE P2 (FE status hardcode) | PRODUCT residual | **ACCEPT** · non-blocking Condition · parallel **dev-fe** |
| R-ATT-01-ASSIGN open (peer ATT-01) | GOVERNANCE | **ACCEPT** · HOLD invent RETAIN · non-blocking |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / module UAT / reopen sealed J-* | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-ATT-03D-01..06 · Network work-sites* + records · GEO-001/GEO-REQ · empty CTA · soft-retire · Nest `/core` 0 · U65 | QA Network · FE-01 · BA/API | 🟢 (J-03 PASS_WITH_RESIDUAL) |
| 2 | Explicit ≠ ATT-03d DONE · ≠ PLT WS alone · ≠ residual/thin=ATT-03b · ≠ catalog/LIVE/AGG · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY att_leave_hold · Nest `/core` DENY · R-ATT-01-ASSIGN open · honesty false · C-SLICE | QA Honesty · FE · API | 🟢 |
| 3 | Condition R-ATT-03D-CNS-STATUS-CODE P2 non-blocking | QA Residual | 🟢 **ACCEPT Condition** |
| 4 | must_keep RETAIN ATT03B/01/11/10/09/08/02/PLT/CORE · ATTWSQA* · soft≠CORE-06 | QA seals cite | 🟢 **RETAIN** |
| 5 | Pack BA/API/QA/FE | evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer ATT-03b/01/11/10/09/08) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** `:5173` · Nest `/core/attendance/work-sites` **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** `:5173` · Nest `/core` work-sites **404** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical work-sites* + records | nest SoT non-404 **0** · POST work-sites **201** · PATCH **200** · records GEO | PRODUCT |
| QA runner U65 J-01..06 | overall **PASS** stamp `ATT03DQA1-MSM1826M` · J-03 PASS_WITH_RESIDUAL | PRODUCT |
| Network physical | work-sites* GET/POST/PATCH · records POST **201**/`GEO-001`/`GEO-REQ` · Nest `/core` **0** · ensureDefault **0** | PRODUCT |
| FE-01 vitest | 3 files · 24 PASS · READY_FOR_QA | PRODUCT |
| API-01 / BA-01 | RETAIN cite F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01 · Nest DENY · J-01..06 AC | PRODUCT/GOV |
| `verify:qc:evidence-pack` QA-01 | **1/8** PROCESS OBS · QC consolidates | PROCESS |
| Screens | under `screens/po-hrm-mvp-gd1-att-03d-cluster-qa-01/` | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · Điểm GPS / Clock-In GPS · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-03D-01..06** (J-03 PASS_WITH_RESIDUAL) |
| 6 | crud_or_matrix | ✅ AC-ATT-03D-* · work-sites* · records · GEO-001/GEO-REQ · empty CTA · Nest DENY · printable false · PAY OUT · DENY `att_leave_hold` · ATT-03b/01/11/10/09/08/02/PLT/CORE/ATTWSQA* RETAIN · soft≠CORE-06 · ≠ ATT-03d DONE · ≠ PLT WS alone · ≠ catalog/LIVE/AGG DONE |
| 7 | residual_section | ✅ below · CNS-STATUS P2 · HOLD ASSIGN peer · no P0 invent |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-03D-01** | **PASS** | POST work-sites **201** + F5 · statusLabelVi · Nest `/core` 0 · ≠ PLT WS=DONE |
| **J-HRM-ATT-03D-02** | **PASS** | PATCH soft-retire `active=false` · ẩn list · Nest 0 |
| **J-HRM-ATT-03D-03** | **PASS_WITH_RESIDUAL** | in-radius records **201** · residual FE status→EFF catalog (CNS-STATUS-CODE) |
| **J-HRM-ATT-03D-04** | **PASS** | OOS → **`HRM-ATT-GEO-001`** · Nest 0 |
| **J-HRM-ATT-03D-05** | **PASS** | method=gps thiếu lat/lon → **`HRM-ATT-GEO-REQ`** · silent2xx=false |
| **J-HRM-ATT-03D-06** | **PASS** | empty CTA Settings + punch · ensureDefault 0 · seals RETAIN · honesty ≠ DONE · C-SLICE |
| Module ATT / ATT-03d UAT / PLT WS=ATT-03d DONE / residual/thin=ATT-03b DONE promote | **DENIED** | C-SLICE |
| Claim invent ASSIGN / PAY/printable · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · CFG=ATT-02 · invent att_leave_hold · PLT/CORE DONE · soft=CORE-06 | **DENIED** | OUT invent |
| **J-HRM-ATT-03B-*** / **ATT-01-*** / **ATT-11-*** / **ATT-10-*** / **ATT-09-*** / **ATT-08-*** / **ATT-02-*** / **PLT-01-*** / **CORE-10/09/07-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-ATT-03D-01 | **PASS** |
| J-HRM-ATT-03D-02 | **PASS** |
| J-HRM-ATT-03D-03 | **PASS_WITH_RESIDUAL** |
| J-HRM-ATT-03D-04 | **PASS** |
| J-HRM-ATT-03D-05 | **PASS** |
| J-HRM-ATT-03D-06 | **PASS** |

### Screens

QA cite: `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-03d-cluster-qa-01/` — `01-j01-gps-before` … `11-j06-punch`.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-ATT-03D-01..06 PASS (J-03 residual noted) with QC stamp **`ATT03DQC1-MSM1CR19`** (C-SLICE · honesty false · printable false · **≠** claim ATT-03d / ATT module UAT · **≠** PLT WS alone DONE). Update continuous board Wave-32 **SEALED GWC** · next **UC-BP-ATT-04** SA (#35).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim ATT-03d DONE · claim PLT WS alone = ATT-03d DONE · claim residual/thin = ATT-03b DONE · claim catalog = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG = ATT-02 DONE · invent `att_leave_hold` · invent ASSIGN DONE · invent PAY/printable DONE · soft=CORE-06 DONE · PLT DONE · CORE-10/09/07 DONE · seed · reopen sealed J-HRM-ATT-03B-* / J-HRM-ATT-01-* / J-HRM-ATT-11-* / J-HRM-ATT-10-* / J-HRM-ATT-09-* / J-HRM-ATT-08-* / J-HRM-ATT-02-* / J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* ….
2. **Condition P2 `R-ATT-03D-CNS-STATUS-CODE`:** FE GPS punch status hardcode → EFF catalog bind · **ACCEPT** non-blocking this seat GWC · owner **dev-fe** parallel · **≠** invent ATT-03d DONE · **≠** catalog=ATT-01 DONE.
3. **Condition HOLD `R-ATT-01-ASSIGN`:** peer ATT-01 Nest `shift-assignments*` **ABSENT** · **ACCEPT** non-blocking · **DENY** invent ASSIGN DONE · RETAIN stamp **`ATT01QC1-MSLZ3KIM`**.
4. **Condition OBS pack verify 1/8:** QA missing command_table — QC consolidates 8/8 — **ACCEPT**.
5. **RETAIN** physical `work-sites*` + punch geofence · Nest `/core` DENY · DENY `att_leave_hold` · DENY `ensureDefaultWorkSite` · must_keep ATT-03b · ATT-01 · ATT-11 · ATT-10 · ATT-09 · ATT-08 · ATT-02 · PLT-01 · CORE-10 · CORE-09 printable false · CORE-07 · ATTWSQA* · soft≠CORE-06 · U19 J-01..06.
6. **OUT** this seat: invent ASSIGN DONE · invent PAY DONE · invent printable DONE · invent Nest `/core` dual · invent `att_leave_hold` · claim ATT-03d DONE · claim PLT WS = ATT-03d DONE · claim residual/thin = ATT-03b DONE · claim catalog = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim CFG=ATT-02 DONE · claim ATT module UAT · claim PLT/CORE DONE · soft=CORE-06.
7. **NOT** Phase 1 DONE · **NOT** ATT-03d module UAT · Wave-32 **SEALED GWC** ≠ program exit · **C-SLICE ≠ module UAT** · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-03D-CNS-STATUS-CODE** | P2 | OPEN / **non-blocking GWC** · GPS `checkIn` hardcodes `status=present` · peer ATT-CODE · **≠** invent ATT-03d DONE | **dev-fe** parallel |
| **R-ATT-01-ASSIGN** | HOLD | OPEN / **non-blocking GWC** · peer ATT-01 · Nest `shift-assignments*` ABSENT · **DENY** invent DONE | **dev-be** HOLD invent · RETAIN ATT01 |
| OVERLAP / SITE / MOB | HOLD | RETAIN GĐ1 | **pm** / SA later |
| **R-ATT-03D-HONESTY** | INFO | RETAIN | **pm** — DENY flip · ≠ ATT-03d DONE · ≠ PLT WS alone · ≠ residual/thin=ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY att_leave_hold · seals RETAIN |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from in-scope geofence browser matrix. CNS-STATUS P2 + ASSIGN HOLD are **conditions**, not invent FAIL.

---

## DENY

- Flip `attendance_uat_ready` / `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / personnel / ATT module UAT / ATT-03d module UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual geofence SoT  
- Invent ASSIGN / `shift-assignments` DONE · invent `att_leave_hold` dual · claim ATT-03d DONE · claim PLT WS / CNS-05 alone = ATT-03d DONE · claim residual/thin = ATT-03b DONE · claim catalog = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim FR-03d DONE  
- Claim CFG alone = ATT-02 DONE  
- Claim PLT DONE · CORE-10 DONE · CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE  
- Invent PAY / printable DONE  
- Seed / `ensureDefaultWorkSite` / `gps_locations` sole · reopen sealed J-HRM-ATT-03B-* / J-HRM-ATT-01-* / J-HRM-ATT-11-* / J-HRM-ATT-10-* / J-HRM-ATT-09-* / J-HRM-ATT-08-* / J-HRM-ATT-02-* / J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* …  
- Treat GWC as module GO · C-SLICE-as-module-DONE · honesty flip  

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT03BQC1-MSM0891H`** | ATT-03b holiday RETAIN · ≠ residual/thin=ATT-03b DONE |
| **`ATT01QC1-MSLZ3KIM`** | ATT-01 CAT/CNS RETAIN · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN **open** |
| **`ATT11QC1-MSLXTH9P`** | ATT-11 sign/close RETAIN · ≠ LIVE=ATT-11 DONE |
| **`ATT10QC1-MSLWGUYH`** | ATT-10 AGG/submit RETAIN · ≠ AGG=ATT-10 DONE · HOL/MEAL OUT |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` · ≠ soft/ATT-08=ATT-09 DONE |
| **`ATT08QC1-MSLSL36C`** | ATT-08 preview RETAIN · ≠ ATT-03d DONE alone |
| **`ATT02QC1-MSLQZUK7`** | CFG≠ATT-02 DONE |
| **`PLT01QC1-MSLPUQIU`** | PLT RETAIN ≠ DONE |
| **`CORE10QC1-MSLP0EJB`** | CORE-10 RETAIN ≠ DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false** RETAIN |
| **`CORE07QC1-KZJTSHNT`** | CORE-07 RETAIN ≠ DONE |
| **`ATTWSQA-MSJC3IN9`** | PLT WS peer · **≠** ATT-03d DONE |
| **`ATTWSQA2-MSJCG47P`** | CNS-05 peer · **≠** ATT-03d DONE |
| soft≠CORE-06 | must_keep |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board **#35** **UC-BP-ATT-04** cấp phát phép năm + danh mục loại phép · U88 continuous) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-03d: J-HRM-ATT-03D-01..06 after QA **`ATT03DQA1-MSM1826M`** (work-sites* CRUD+F5 · soft-retire · GEO-001 · GEO-REQ · empty CTA · Nest `/core` **0** · U65 · printable false · PAY OUT · DENY `att_leave_hold` · R-ATT-01-ASSIGN open · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE/ATTWSQA* · ≠ ATT-03d DONE · ≠ PLT WS alone · ≠ residual/thin=ATT-03b · ≠ catalog/LIVE/AGG DONE · ≠ ATT module UAT · CFG≠ATT-02 · pack QC 8/8). Conditions: honesty false · R-ATT-03D-CNS-STATUS-CODE P2 FE parallel · HOLD ASSIGN peer · DENY Nest dual / seed / invent PAY / reopen peers. Stamp **`ATT03DQC1-MSM1CR19`**. Next continuous: **UC-BP-ATT-04** SA Option (U88 · board #35). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous · U88 after ATT-03d QC)
uc_ids: UC-BP-ATT-04 · FR-UC-BP-ATT-04
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-01.md · stamp ATT03DQC1-MSM1CR19 · Wave-32 UC-BP-ATT-03d SEALED · QA ATT03DQA1-MSM1826M · must_keep ATT03DQC1-MSM1CR19 ≠ ATT-03d DONE · ATT03BQC1-MSM0891H ≠ residual/thin=DONE · ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ≠ LIVE=DONE · ATT10QC1-MSLWGUYH ≠ AGG=DONE · ATT09QC1-MSLUTL9D DENY att_leave_hold · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · Nest /core DENY · ≠ ATT-03d / ATT module UAT · PAY OUT invent DONE · printable false RETAIN · R-ATT-03D-CNS-STATUS-CODE P2 FE residual parallel (non-blocking prior seat)
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after ATT-03d = **UC-BP-ATT-04** «Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …)» (#35)
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-04 · Diễn biến cấp phát / danh mục loại phép · must_keep ATT-03d GPS RETAIN (work-sites* · GEO-001/GEO-REQ · Nest /core DENY · ≠ ATT-03d DONE) · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE · printable false · DENY invent PAY DONE · DENY invent printable DONE · DENY claim ATT/PLT/CORE DONE

MISSION — SA Option seat (narrow):
1) Option A/B/C for annual leave grant + leave-type catalog vs AS-IS LIVE entitlement surfaces — DENY Nest /core dual · DENY wipe ATT-03d GPS · DENY wipe ATT-03b holiday · DENY wipe ATT-01 CAT/CNS · DENY invent ASSIGN DONE · DENY wipe ATT-11/10/09/08/02 · DENY wipe PLT/CORE · DENY soft=CORE-06 DONE · DENY invent PAY/printable DONE · DENY claim ATT module UAT / ATT-03d DONE from Option alone
2) F.1 API map + must_keep ATT-03d/03b/01/11/10/09/08/02/PLT/CORE seals · DENY reopen sealed J-HRM-ATT-03D-01..06 · DENY reopen ATT-03B/01/11/10/09/08/02/PLT/CORE-* without regression · DENY flip attendance_uat_ready / contracts_printable_ready · DENY invent att_leave_hold
3) Disposition: RETAIN cite LIVE leave grant/catalog vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note ATT-03d ADD seal ≠ ATT module UAT DONE · printable false RETAIN · PAY OUT · R-ATT-01-ASSIGN remains open HOLD · note prior R-ATT-03D-CNS-STATUS-CODE P2 is FE parallel residual (not this SA invent)
cấm: honesty flip · attendance_uat_ready · contracts_printable_ready · module ATT UAT claim DONE · claim ATT-03d DONE · claim PLT WS=ATT-03d DONE · invent ASSIGN DONE · claim catalog=ATT-01 DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · invent att_leave_hold · invent PAY/printable DONE · seed · Nest /core dual · reopen sealed ATT-03d/03b/01/11/10/09/08/02/PLT/CORE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT03DQC1-MSM1CR19` · 2026-08-09 · Wave-32 UC-BP-ATT-03d **SEALED GWC** ≠ ATT-03d module UAT · ≠ PLT WS alone = ATT-03d DONE · ≠ residual/thin = ATT-03b DONE · ≠ catalog alone = ATT-01 DONE · ≠ invent ASSIGN DONE · ≠ LIVE alone = ATT-11 DONE · ≠ AGG = ATT-10 DONE · ≠ soft/ATT-08 = ATT-09 DONE · ≠ ATT module UAT · ≠ CFG = ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-03b RETAIN · ATT-01 RETAIN · ATT-11 RETAIN · ATT-10 RETAIN · ATT-09 RETAIN · ATT-08 RETAIN · ATT-02 RETAIN · PLT RETAIN · CORE-10 RETAIN · CORE-09 RETAIN · CORE-07 RETAIN · ATTWSQA* RETAIN ≠ ATT-03d DONE · soft≠CORE-06 DONE · Nest `/core` DENY · Condition R-ATT-03D-CNS-STATUS-CODE P2 · HOLD R-ATT-01-ASSIGN peer · C-SLICE ≠ module UAT · honesty flags stay false
