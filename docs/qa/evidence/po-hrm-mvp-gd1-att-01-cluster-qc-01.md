# Evidence — PO-HRM-MVP-GD1-ATT-01-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-ATT-01 C-SLICE only** · **not** ATT-01 module UAT · **not** catalog alone = ATT-01 / FR-01 DONE · **not** LIVE = ATT-11 DONE · **not** AGG = ATT-10 DONE · **not** soft/ATT-08 = ATT-09 DONE · **not** ATT module UAT · **not** CFG = ATT-02 DONE · **not** invent ASSIGN / PAY / printable / `att_leave_hold` DONE · **not** PLT/CORE DONE · **not** soft = CORE-06 DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-30) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`ATT01QA1-MSLYZKGN`** · FE-01 `READY_FOR_QA` · API-01 CONFIRMED RETAIN · BA-01 · must_keep **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · **`ATT08QC1-MSLSL36C`** · **`ATT02QC1-MSLQZUK7`** · **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 · Nest `/core` DENY · PAY OUT · U65 zero-seed · Dev-BE HOLD invent ASSIGN |
| **uc_ids** | `UC-BP-ATT-01` · `FR-UC-BP-ATT-01` · `J-HRM-ATT-01-01..06` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-att-01-cluster-qa-01.md`](po-hrm-mvp-gd1-att-01-cluster-qa-01.md) · stamp **`ATT01QA1-MSLYZKGN`** · raw `_tmp-po-hrm-mvp-gd1-att-01-cluster-qa-01.json` |
| **fe_ref** | [`po-hrm-mvp-gd1-att-01-cluster-fe-01.md`](po-hrm-mvp-gd1-att-01-cluster-fe-01.md) |
| **ba_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md` |
| **api_ref** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md` |
| **stamp** | QC **`ATT01QC1-MSLZ3KIM`** · QA **`ATT01QA1-MSLYZKGN`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · `contracts_printable_ready=false` RETAIN · catalog alone ≠ ATT-01 DONE · R-ATT-01-ASSIGN **open** · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · PLT/CORE RETAIN · soft≠CORE-06 · PAY OUT · DENY invent `att_leave_hold` · **≠** claim ATT-01 DONE |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` · Ca làm việc · Đề nghị đổi ca · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`attendance_uat_ready` / ATT module UAT** | **`false`** | **DENIED** flip |
| **Claim catalog alone = ATT-01 / FR-01 DONE** | **DENIED** | C-SLICE |
| **Claim ATT-01 module UAT DONE** | **DENIED** | C-SLICE ≠ module |
| **Claim invent ASSIGN / shift-assignments DONE** | **DENIED** | R-ATT-01-ASSIGN open · Nest ABSENT |
| **Claim LIVE alone = ATT-11 DONE** | **DENIED** | must_keep ATT11 |
| **Claim AGG alone = ATT-10 DONE** | **DENIED** | must_keep ATT10 |
| **Claim soft / ATT-08 = ATT-09 DONE** | **DENIED** | must_keep ATT09/08 |
| **Claim CFG alone = ATT-02 DONE** | **DENIED** | must_keep ATT02 |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`recruitment_uat_ready` / `jd_dynamic_done` / personnel UAT** | **`false`** | **DENIED** flip |
| **Invent `att_leave_hold` dual SoT** | **DENIED** | ATT-09 RETAIN |
| **Invent PAY / printable DONE** | **DENIED** | PAY OUT · printable false |
| **Claim PLT / CORE-10/09/07 DONE** | **DENIED** | must_keep peer stamps |
| **Claim soft Profile = CORE-06 DONE** | **DENIED** | soft≠CORE-06 |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual work-shifts / CNS SoT** | **DENIED** | L0 probe **404** · SoT non-404 **0** |
| **Reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT / CORE-*** | **DENIED** | must_keep |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-30 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true` / claim ATT module UAT? | **NO** |
| May PM claim catalog alone = ATT-01 / FR-01 DONE? | **NO** |
| May PM claim ATT-01 module UAT DONE? | **NO** |
| May PM invent ASSIGN / shift-assignments DONE? | **NO** |
| May PM claim LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · CFG=ATT-02 DONE? | **NO** |
| May PM invent PAY / printable / `att_leave_hold` DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM promote `SERVICE_READINESS` / Phase1 DONE? | **NO** |
| May PM open next UC seat **UC-BP-ATT-03b** as **sa Option**? | **YES** (U88/U89 continuous · board #33) |
| May PM treat **R-ATT-01-ASSIGN / J-02 HOLD / J-03 BLOCKED** as FAIL this seat GWC? | **NO** — non-blocking CONDITIONS / HOLD invent |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-ATT-01** (physical `work-shifts*` CAT + `shift-change-requests*` CNS · invent-ban **`HRM-ATT-SHIFT-KEY`** · empty EFF CTA · Nest `/core` **0** · U65 zero-seed · honesty seals · printable **false** · PAY OUT · DENY invent `att_leave_hold` · R-ATT-01-ASSIGN **open** · J-02 HOLD · J-03 BLOCKED · ATT-11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · ≠ catalog alone = ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE) after QA stamp **`ATT01QA1-MSLYZKGN`**.

Audited: QA-01 MD · FE-01 · BA-01 · API-01 · L0/L2.5/network J-01/04/05/06 PASS · J-02 HOLD · J-03 BLOCKED · must_keep ATT-11/10/09/08/02/PLT/CORE · DENY Nest `/core` · DENY catalog=ATT-01 DONE · DENY invent ASSIGN DONE · DENY ATT UAT · DENY invent `att_leave_hold` · DENY invent PAY/printable DONE · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** POST `work-shifts` **201** + F5 · invent CNS **400** `HRM-ATT-SHIFT-KEY` · soft-retire → empty EFF CTA (restored) · Nest `/core` **0** · `shift-assignments` **404** · seed **none** · C-SLICE.

**OBS ACCEPT (non-blocking):** QA pack verify **1/8** FAIL (`command_table`) — **PROCESS OBS** (QC consolidates **8/8**) · **HOLD** **`R-ATT-01-ASSIGN`** (Nest `shift-assignments*` ABSENT · FE Lịch GĐ2-HOLD) · **BLOCKED** **`R-ATT-01-RESOLVE`** after ASSIGN · HOLD **`R-ATT-01-SCHED`** full grid OUT GĐ2.

**NOT Phase 1 DONE. NOT ATT-01 module UAT. NOT catalog alone = ATT-01 DONE. NOT invent ASSIGN DONE. NOT LIVE = ATT-11 DONE. NOT AGG = ATT-10 DONE. NOT soft/ATT-08 = ATT-09 DONE. NOT ATT module UAT. NOT CFG = ATT-02 DONE. NOT invent PAY/printable/`att_leave_hold` DONE. NOT PLT/CORE DONE. NOT soft = CORE-06 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| CAT CRUD + CNS invent-ban + empty EFF CTA · J-01/04/05/06 PASS | PRODUCT L2.5 | **ACCEPT** this seat |
| Nest `/core` work-shifts 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| Nest `shift-assignments` 404 · J-02 HOLD · R-ATT-01-ASSIGN open | PRODUCT / GOVERNANCE | **ACCEPT** · HOLD invent · **≠** FAIL invent DONE |
| J-03 RESOLVE BLOCKED after ASSIGN | PRODUCT | **ACCEPT** · BLOCKED residual |
| ≠catalog=DONE · ≠LIVE=ATT-11 · ≠AGG=ATT-10 · ≠soft/ATT-08=ATT-09 · ≠ATT UAT · printable false · seals RETAIN | PRODUCT / GOVERNANCE | **ACCEPT** · DENY claim DONE |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / module UAT / reopen sealed J-* | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01/04/05/06 PASS · Nest `/core` 0 · U65 · work-shifts* + shift-change-requests* | QA Network · FE-01 | 🟢 |
| 2 | Conditions: J-02 HOLD · J-03 BLOCKED · R-ATT-01-ASSIGN open (ABSENT) — non-blocking HOLD invent | QA Residuals · API F-ATT-SHIFT-02 | 🟢 HOLD |
| 3 | Explicit ≠ ATT-01 UAT · ≠ catalog=DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 · printable false · PAY OUT · DENY att_leave_hold · Nest `/core` DENY · honesty false · C-SLICE | QA Honesty · FE · API | 🟢 |
| 4 | must_keep RETAIN ATT11/10/09/08/02/PLT/CORE · soft≠CORE-06 | QA seals cite | 🟢 **RETAIN** |
| 5 | Pack BA/API/QA/FE | evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer ATT-11/10/09/08) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** `:5173` · Nest `/core/.../work-shifts` **404** · Nest `shift-assignments` **404** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** `:5173` · Nest `/core` ATT **404** · Nest `shift-assignments` **404** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical work-shifts* + shift-change-requests* | nest SoT non-404 **0** · POST work-shifts 201 · invent KEY 400 · assign 2xx **0** | PRODUCT |
| QA runner U65 J-01/04/05/06 PASS · J-02 HOLD · J-03 BLOCKED | overall **PASS** (CAT/CNS) stamp `ATT01QA1-MSLYZKGN` | PRODUCT |
| Network physical | work-shifts* 12 · effective 8 · shift-change-requests* 10 · shift-assignments 2xx **0** · Nest `/core` **0** | PRODUCT |
| FE-01 vitest | 3 files · 15 PASS · READY_FOR_QA | PRODUCT |
| API-01 / BA-01 | RETAIN cite F-ATT-CAT-SHIFT-01/02/EFF · F-ATT-SHIFT-CNS-01 · F-ATT-SHIFT-02 ASSIGN HOLD · Nest DENY | PRODUCT/GOV |
| `verify:qc:evidence-pack` QA-01 | **1/8** PROCESS OBS · QC consolidates | PROCESS |
| Screens | under `screens/po-hrm-mvp-gd1-att-01-cluster-qa-01/` | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` attendance · Ca / Đổi ca · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-ATT-01-01/04/05/06 PASS** · **J-02 HOLD** · **J-03 BLOCKED** |
| 6 | crud_or_matrix | ✅ AC-ATT-01-* · work-shifts* + shift-change-requests* · HRM-ATT-SHIFT-KEY · Nest DENY · ASSIGN ABSENT HOLD · printable false · PAY OUT · DENY `att_leave_hold` · ATT-11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE |
| 7 | residual_section | ✅ below · HOLD ASSIGN · BLOCKED RESOLVE · no P0 invent |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-ATT-01-01** | **PASS** | Danh sách ca CRUD Nest `work-shifts*` 201 + F5 · Nest `/core` 0 · ≠ CAT=DONE |
| **J-HRM-ATT-01-04** | **PASS** | Đổi ca invent → **400** `HRM-ATT-SHIFT-KEY` · F5 no invent · Nest 0 |
| **J-HRM-ATT-01-05** | **PASS** | Soft-retire · empty EFF CTA · restored · no seed |
| **J-HRM-ATT-01-06** | **PASS** | Honesty · seals RETAIN · printable false · PAY OUT · ASSIGN ABSENT documented |
| **J-HRM-ATT-01-02** | **HOLD** | Lịch phân ca GĐ2-HOLD · Nest `shift-assignments` **404** · **≠ invent ASSIGN DONE** |
| **J-HRM-ATT-01-03** | **BLOCKED** | Resolve depends ASSIGN · **≠ invent DONE** |
| Module ATT / ATT-01 UAT / catalog=ATT-01 DONE promote | **DENIED** | C-SLICE |
| Claim invent ASSIGN / PAY/printable · LIVE=ATT-11 · AGG=ATT-10 · soft/ATT-08=ATT-09 · CFG=ATT-02 · invent att_leave_hold · PLT/CORE DONE · soft=CORE-06 | **DENIED** | OUT invent |
| **J-HRM-ATT-11-*** / **ATT-10-*** / **ATT-09-*** / **ATT-08-*** / **ATT-02-*** / **PLT-01-*** / **CORE-10/09/07-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-ATT-01-01 | **PASS** |
| J-HRM-ATT-01-02 | **HOLD** |
| J-HRM-ATT-01-03 | **BLOCKED** |
| J-HRM-ATT-01-04 | **PASS** |
| J-HRM-ATT-01-05 | **PASS** |
| J-HRM-ATT-01-06 | **PASS** |

### Screens

QA cite: `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-01-cluster-qa-01/` — `01-shifts-list` … `06-honesty-cns` · `02-schedule-hold` · `05-empty-cta`.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-ATT-01-01/04/05/06 PASS · J-02 HOLD · J-03 BLOCKED with QC stamp **`ATT01QC1-MSLZ3KIM`** (C-SLICE · honesty false · printable false · **≠** claim ATT-01 / ATT module UAT · **≠** catalog alone DONE · **≠** invent ASSIGN DONE). Update continuous board Wave-30 **SEALED GWC** · next **UC-BP-ATT-03b** SA (#33).

---

## Conditions (GWC)

1. **Honesty:** keep `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim catalog = ATT-01 DONE · claim ATT-01 module UAT · claim invent ASSIGN DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG = ATT-02 DONE · invent `att_leave_hold` · invent PAY/printable DONE · soft=CORE-06 DONE · PLT DONE · CORE-10/09/07 DONE · seed · reopen sealed J-HRM-ATT-11-* / J-HRM-ATT-10-* / J-HRM-ATT-09-* / J-HRM-ATT-08-* / J-HRM-ATT-02-* / J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* ….
2. **Condition HOLD `R-ATT-01-ASSIGN`:** Nest `shift-assignments*` **ABSENT** · FE Lịch GĐ2-HOLD · **ACCEPT** non-blocking this seat GWC · **DENY** invent ASSIGN DONE · Dev-BE HOLD invent.
3. **Condition BLOCKED `R-ATT-01-RESOLVE`:** depends ASSIGN wire · **ACCEPT** · **≠** invent DONE.
4. **Condition HOLD `R-ATT-01-SCHED`:** full grid OUT GĐ2 · **ACCEPT**.
5. **Condition OBS pack verify 1/8:** QA missing command_table — QC consolidates 8/8 — **ACCEPT**.
6. **RETAIN** physical `work-shifts*` + `shift-change-requests*` · invent-ban **`HRM-ATT-SHIFT-KEY`** · Nest `/core` DENY · DENY `att_leave_hold` · must_keep ATT-11 · ATT-10 · ATT-09 · ATT-08 · ATT-02 · PLT-01 · CORE-10 · CORE-09 printable false · CORE-07 · soft≠CORE-06 · U19 J-01/04/05/06 PASS · J-02 HOLD · J-03 BLOCKED.
7. **OUT** this seat: invent ASSIGN DONE · invent PAY DONE · invent printable DONE · invent Nest `/core` dual · invent `att_leave_hold` · claim catalog = ATT-01 DONE · claim ATT-01 / ATT module UAT · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · soft=CORE-06.
8. **NOT** Phase 1 DONE · **NOT** ATT-01 module UAT · Wave-30 **SEALED GWC** ≠ program exit · **C-SLICE ≠ module UAT** · honesty flags stay **false**.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-ATT-01-ASSIGN** | HOLD | OPEN / **non-blocking GWC** · Nest `shift-assignments*` ABSENT · **DENY** invent DONE | **dev-be** HOLD invent · optional wire **ONLY if** closable |
| **R-ATT-01-RESOLVE** | BLOCKED | after ASSIGN · **≠** invent DONE | **dev-be** after ASSIGN |
| **R-ATT-01-SCHED** | HOLD | full grid OUT GĐ2 | pm/ba |
| **R-ATT-01-HONESTY** | INFO | RETAIN | **pm** — DENY flip · catalog≠ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY att_leave_hold · ATT-11/10/09/08/02/PLT/CORE RETAIN |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from in-scope CAT/CNS browser matrix (J-01/04/05/06). HOLD/BLOCKED ASSIGN/RESOLVE are **conditions**, not invent FAIL.

---

## DENY

- Flip `attendance_uat_ready` / `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / personnel / ATT module UAT / ATT-01 module UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual work-shifts / CNS SoT  
- Invent ASSIGN / `shift-assignments` DONE · invent `att_leave_hold` dual · claim catalog = ATT-01 DONE · claim LIVE = ATT-11 DONE · claim AGG = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim FR-01 DONE  
- Claim CFG alone = ATT-02 DONE  
- Claim PLT DONE · CORE-10 DONE · CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE  
- Invent PAY / printable DONE  
- Seed / reopen sealed J-HRM-ATT-11-* / J-HRM-ATT-10-* / J-HRM-ATT-09-* / J-HRM-ATT-08-* / J-HRM-ATT-02-* / J-HRM-PLT-01-* / J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* …  
- Treat GWC as module GO · C-SLICE-as-module-DONE · honesty flip  

---

## must_keep RETAIN (explicit)

| Stamp | Note |
|-------|------|
| **`ATT11QC1-MSLXTH9P`** | ATT-11 sign/close RETAIN · ≠ LIVE=ATT-11 DONE |
| **`ATT10QC1-MSLWGUYH`** | ATT-10 AGG/submit RETAIN · ≠ AGG=ATT-10 DONE |
| **`ATT09QC1-MSLUTL9D`** | ATT-09 hold/settle RETAIN · DENY `att_leave_hold` · ≠ soft/ATT-08=ATT-09 DONE |
| **`ATT08QC1-MSLSL36C`** | ATT-08 preview RETAIN |
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
| **next_owner** | **pm** → **sa** (board #33 **UC-BP-ATT-03b** lịch lễ/Tết · U88 continuous) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-ATT-01: J-HRM-ATT-01-01/04/05/06 PASS after QA **`ATT01QA1-MSLYZKGN`** (work-shifts* CAT · shift-change-requests* CNS · HRM-ATT-SHIFT-KEY · empty EFF CTA · Nest `/core` **0** · U65 · printable false · PAY OUT · DENY `att_leave_hold` · R-ATT-01-ASSIGN open · J-02 HOLD · J-03 BLOCKED · must_keep ATT-11/10/09/08/02/PLT/CORE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT-01 / ATT module UAT · CFG≠ATT-02 DONE · pack QC 8/8). Conditions: honesty false · HOLD ASSIGN invent · BLOCKED RESOLVE · DENY Nest dual / seed / invent PAY / reopen peers. Stamp **`ATT01QC1-MSLZ3KIM`**. Next continuous: **UC-BP-ATT-03b** SA Option (U88 · board #33). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous · U88 after ATT-01 QC)
uc_ids: UC-BP-ATT-03b · FR-UC-BP-ATT-03b
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qc-01.md · stamp ATT01QC1-MSLZ3KIM · Wave-30 UC-BP-ATT-01 SEALED · QA ATT01QA1-MSLYZKGN · must_keep ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · DENY att_leave_hold · R-ATT-01-ASSIGN open HOLD invent · ≠ catalog alone=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT-01 module UAT · ≠ ATT UAT · PAY OUT invent DONE · printable false RETAIN
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after ATT-01 = **UC-BP-ATT-03b** «Lịch lễ / Tết (dương + âm cấu hình năm)» (#33)
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03b · Diễn biến lịch lễ/Tết · must_keep ATT-01 CAT/CNS RETAIN (work-shifts* · shift-change-requests* · HRM-ATT-SHIFT-KEY · Nest /core DENY · R-ATT-01-ASSIGN open · ≠ catalog=ATT-01 DONE) · must_keep ATT-11/10/09/08/02/PLT/CORE · printable false · DENY invent PAY DONE · DENY invent printable DONE · DENY claim ATT/PLT/CORE DONE

MISSION — SA Option seat (narrow):
1) Option A/B/C for holiday calendar (dương + âm / năm cấu hình) vs AS-IS LIVE attendance holiday surfaces — DENY Nest /core dual · DENY wipe ATT-01 CAT/CNS · DENY invent ASSIGN DONE · DENY wipe ATT-11 sign/close · DENY wipe ATT-10 AGG/submit · DENY wipe ATT-09 hold · DENY wipe ATT-08 preview · DENY wipe ATT-02 late-penalty CFG · DENY wipe PLT-01 · DENY wipe CORE-10/09/07 · DENY soft=CORE-06 DONE · DENY invent PAY/printable DONE · DENY claim ATT module UAT / ATT-01 DONE from Option alone
2) F.1 API map + must_keep ATT-01/11/10/09/08/02/PLT/CORE seals · DENY reopen sealed J-HRM-ATT-01-01/04/05/06 · J-02 HOLD / J-03 BLOCKED remain residual · DENY reopen ATT-11/10/09/08/02/PLT/CORE-* without regression · DENY flip attendance_uat_ready / contracts_printable_ready · DENY invent att_leave_hold
3) Disposition: RETAIN cite LIVE holiday vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note ATT-01 ADD seal ≠ ATT module UAT DONE · printable false RETAIN · PAY OUT · R-ATT-01-ASSIGN remains open HOLD
cấm: honesty flip · attendance_uat_ready · contracts_printable_ready · module ATT UAT claim DONE · claim ATT-01 DONE · claim catalog=ATT-01 DONE · invent ASSIGN DONE · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · invent att_leave_hold · invent PAY/printable DONE · seed · Nest /core dual · reopen sealed ATT-01/11/10/09/08/02/PLT/CORE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`ATT01QC1-MSLZ3KIM` · 2026-08-09 · Wave-30 UC-BP-ATT-01 **SEALED GWC** ≠ ATT-01 module UAT · ≠ catalog alone = ATT-01 DONE · ≠ invent ASSIGN DONE · ≠ LIVE alone = ATT-11 DONE · ≠ AGG = ATT-10 DONE · ≠ soft/ATT-08 = ATT-09 DONE · ≠ ATT module UAT · ≠ CFG = ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-11 RETAIN · ATT-10 RETAIN · ATT-09 RETAIN · ATT-08 RETAIN · ATT-02 RETAIN · PLT RETAIN · CORE-10 RETAIN · CORE-09 RETAIN · CORE-07 RETAIN · soft≠CORE-06 DONE · Nest `/core` DENY · HOLD R-ATT-01-ASSIGN · BLOCKED R-ATT-01-RESOLVE · C-SLICE ≠ module UAT · honesty flags stay false
