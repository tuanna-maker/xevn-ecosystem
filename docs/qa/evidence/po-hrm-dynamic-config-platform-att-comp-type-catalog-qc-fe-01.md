# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-FE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **Condition close only** · **R-PLT-ATT-OTC-03** · **not** module ATT UAT |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-FE-01` **PASS_WITH_OBS** stamp **`ATTCOMPQAFE-MSKBBEJW`** |
| **condition_close** | **R-PLT-ATT-OTC-03** ✅ **CLOSED ACCEPT** |
| **retain_l1** | QC-01 GWC L1 stamp **`ATTCOMPQA-MSKARXQU`** · invent → **400 `HRM-ATT-OT-COMP-KEY`** LIVE · **FORBIDDEN reopen** |
| **retain_admin** | **R-PLT-ATT-OTC-FE-ADMIN** **HOLD RETAIN** — **DENY invent** FE admin panel |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | Browser OvertimeRequestTab Nest compensation picker + Nest `compensation_type` submit **PASS** · **N/A deferred** J-HRM-ATT-COMP-* / module ATT UAT · **DENY** promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | Spot **VAL-ATT-COMP-CNS-01** · **AC-PLT-ATT-COMP-01** Nest Select + Nest submit + FE+F5 · **01c NOTE_BLOCKED** · **01H honesty** · OT-TYPE RETAIN · L1 invent KEY **RETAIN** |
| **Verdict** | **GO WITH CONDITIONS** — Condition **R-PLT-ATT-OTC-03 CLOSED ACCEPT** · L1 **`ATTCOMPQA-MSKARXQU` SEAL RETAIN** · **R-PLT-ATT-OTC-FE-ADMIN HOLD RETAIN** · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `formula_LIVE=false` · OT-TYPE L1/FE CLOSED seals RETAIN · peer seals RETAIN · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md`](po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md) stamp **`ATTCOMPQAFE-MSKBBEJW`** (12288 B) |
| **qc01_ref** | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md`](po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md) **GWC RETAIN** — L1 KEY **not reopened** · prior Condition OTC-03 |
| **fe_ref** | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md`](po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md) READY_FOR_QA · Nest EFF rebind compensation Select |
| **peer_pattern** | [`po-hrm-dynamic-config-platform-ot-type-catalog-qc-fe-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-qc-fe-01.md) OT-TYPE QC-FE GWC |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01-browser.json`](_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01/` (`01`–`07`) |
| **stamp_ref** | QA-FE `ATTCOMPQAFE-MSKBBEJW` · L1 RETAIN `ATTCOMPQA-MSKARXQU` · commit `dc930c5` |
| **spec_ref** | AC-PLT-ATT-COMP-01 / 01c · VAL-ATT-COMP-CNS-01 · QC-01 Condition R-PLT-ATT-OTC-03 · FE-01 Nest rebind |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · admin Network ensure cite ≠ seed · invent API cite ≠ UF 🟢 |
| **OS honesty** | `C-SLICE-≠-MODULE` — OTC-03 CLOSED ≠ `attendance_uat_ready` / module ATT UAT / Phase1 / formula LIVE / invent FE-ADMIN / reopen OT-TYPE |

### Honesty locks (mandatory — RETAIN · DENIED flip)

| Flag / seal | Value | QC note |
|-------------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **`formula_LIVE`** | **`false`** | Nest nameVi display-only ≠ payroll engine |
| QC-01 GWC L1 · stamp `ATTCOMPQA-MSKARXQU` | **SEAL RETAIN** | **FORBIDDEN reopen** invent KEY L1 · KEY `HRM-ATT-OT-COMP-KEY` LIVE |
| **R-PLT-ATT-OTC-03** | **CLOSED** | Nest EFF compensation picker + Nest `compensation_type` submit proven — **RETAIN closed** |
| **R-PLT-ATT-OTC-FE-ADMIN** | **HOLD RETAIN** | ABSENT panel · Network L1 OK · **DENY invent** |
| OT-TYPE L1 `ATTOTQA-MSK8VETU` / FE `ATTOTQAFE-MSK9TJDM` / FE-ADMIN HOLD | **SEAL / HOLD RETAIN** | **cấm reopen** / **DENY invent** |
| ATT-CODE `ATTCODEQA-MSK4T1A5` · leave `ATTLEAVEQA-MSJ7CPJH` · WS `ATTWSQA-MSJC3IN9` · SHIFT `ATTSHIFTQA-MSK5FXP3` · CTR `CTRTPLQA-MSK7U4CG` | **SEAL RETAIN** | **cấm reopen** |
| Fold into `att_ot_type` | **DENIED** | orthogonal COMP ≠ OT-TYPE |
| AC-PLT-ATT-COMP-01c empty | **NOTE_BLOCKED ACCEPT** | no wipe/seed · unit cite FE-01 15 |
| Invent UI Select-only | **PASS_WITH_OBS ACCEPT** | free-text invent N/A · L1 KEY cite |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 module / Phase1** | **DENIED** | OTC-03 slice ≠ module GO |
| **Seed / ensureDefault** | **DENIED** (U65) | admin Network POST ot-comp-types ensure OK · ≠ `pnpm seed:*` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Condition CLOSED ≠ module ATT UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — CLOSE only QC-01 Condition **R-PLT-ATT-OTC-03** after QA-FE stamp **`ATTCOMPQAFE-MSKBBEJW`** (`overall=PASS_WITH_OBS` · honesty false · `c_slice_ne_module=true` · U65 zero-seed · condition **CLOSABLE**). Audited QA-FE MD (12288 B) + FE-01 READY + QC-01 GWC + machine JSON + screens `01`–`07` + L0 portal **200** · HRM `:28001/api/hrm` **200**.

Proven browser U65:
1. Click path: Chấm công → Quản lý đơn → Đăng ký làm thêm → Thêm đơn tăng ca
2. GET `/attendance/ot-comp-types/effective` **200** `HRM-ATT-OTC-200` (Network · total=1)
3. Select «Hình thức bồi thường» shows Nest **nameVi** `QA FE OTC Nest mskbbejw` — **not** sole salary\|compensatory_leave SoT · `onlyBoot=false` · bootstrap hint hidden
4. Select «Loại tăng ca» **RETAIN** Nest `QC spot OT (x1.5)` · code `qc_spot_ot_msk8`
5. POST overtime-requests body Nest **compensation_type**=`qa_fe_otc_mskbbejw` · **overtime_type**=`qc_spot_ot_msk8` → **201** `HRM-OT-201` · `nestCompInBody=true`
6. FE after 2xx · **F5** list GET 200 retain · binaryInvent=false · list nameVi soft WARN ACCEPT
7. Invent UI: hard **Select-only** OBS · L1 invent KEY **`ATTCOMPQA-MSKARXQU` RETAIN** (machine inventPosts empty = cite L1 — peer idle-ok)
8. EFF=0: **NOTE_BLOCKED** + unit cite `useAttOtCompTypesEffective.test.ts` (15) + OT-TYPE regression 17 = vitest **32/32** — no wipe
9. FE-ADMIN: **HOLD_ABSENT_OK** — no invent panel

**L1 invent KEY stamp `ATTCOMPQA-MSKARXQU` SEAL NOT reopened.** **OT-TYPE L1/FE CLOSED seals RETAIN.** **R-PLT-ATT-OTC-FE-ADMIN HOLD RETAIN.** QA-FE pack verify **3/8 miss** (`command_table` · `journey_l25` · `residual_section`) = **PROCESS OBS** — this QC consolidates **8/8**.

**DENIED:** ready flips · formula LIVE · invent FE admin · reopen L1 OTC / OT-TYPE L1/FE / ATT-CODE / leave / WS / SHIFT / CTR · fold into `att_ot_type` · module ATT UAT · Phase1 DONE · seed · UF 🟢 module. **NOT Phase 1 DONE.** **NOT** module ATT UAT.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTCOMPQAFE-MSKBBEJW` · overall PASS_WITH_OBS | machine · condition CLOSABLE | 🟢 **ACCEPT** |
| Nest Select nameVi ≠ sole hardcode-2 | picker `QA FE OTC Nest mskbbejw` · onlyBoot=false | 🟢 **ACCEPT** |
| GET ot-comp-types/effective 200 | Network `HRM-ATT-OTC-200` | 🟢 **ACCEPT** |
| POST OT Nest compensation_type 201 | `compensation_type=qa_fe_otc_mskbbejw` · `HRM-OT-201` · nestCompInBody | 🟢 **ACCEPT** |
| OT-TYPE picker RETAIN | Nest `qc_spot_ot_msk8` · GET ot-types/effective 200 | 🟢 **ACCEPT RETAIN** |
| FE + F5 retain Nest code | list GET 200 · binaryInvent=false · nameVi soft WARN | 🟢 **ACCEPT** (+ OBS soft) |
| Invent Select-only OBS + L1 KEY | Select-only · cite `ATTCOMPQA-MSKARXQU` · inventPosts=[] | 🟢 **ACCEPT OBS** |
| EFF=0 NOTE_BLOCKED | unit cite FE-01 15 · vitest 32/32 · no wipe | 🟢 **ACCEPT** |
| **R-PLT-ATT-OTC-03** | Browser Nest compensation picker + Nest submit | ✅ **CLOSED ACCEPT** |
| **R-PLT-ATT-OTC-FE-ADMIN** | HOLD_ABSENT_OK | 🟡 **HOLD RETAIN** |
| L1 stamp `ATTCOMPQA-MSKARXQU` | Explicit RETAIN · KEY LIVE | 🟢 **RETAIN — not reopened** |
| OT-TYPE L1/FE CLOSED | `ATTOTQA-MSK8VETU` / `ATTOTQAFE-MSK9TJDM` | 🟢 **RETAIN — not reopened** |
| FE-01 READY Nest rebind | OvertimeRequestTab compensation → EFF when active>0 | 🟢 **ACCEPT closed** |
| Honesty / formula / module / Phase1 / seed | Explicit DENIED | 🟢 **DENIED promote** |
| QA-FE pack 3/8 miss | verify exit 1 | 🟡 **PROCESS OBS** — QC consolidates |
| L0 portal / HRM api root | portal **200** · `/api/hrm` **200** | 🟢 ENV OK |
| J-HRM-ATT-COMP-* / module ATT UAT | deferred / honesty | 🟢 **DENY promote** |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim formula LIVE · invent FE admin panel · reopen L1 invent KEY `ATTCOMPQA-MSKARXQU` · reopen OT-TYPE L1/FE · reopen peer seals · fold into `att_ot_type` · seed as evidence · treat Condition CLOSED as module GO · Phase1 DONE · UF 🟢 module.

### Conditions closed this seat

| ID | Prior (QC-01) | QC-FE disposition |
|----|---------------|-------------------|
| **R-PLT-ATT-OTC-03** | CONDITION P2 · owner dev-fe · hardcode salary\|compensatory_leave | ✅ **CLOSED ACCEPT** — QA-FE browser Nest EFF compensation picker + Nest `compensation_type` POST 201 + OT-TYPE RETAIN + FE+F5 |

### Conditions remaining

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-ATT-OTC-FE-ADMIN** | **P2 NOTE HOLD** | note_hold / later sponsor | ABSENT FE admin «Hình thức bồi thường» catalog panel · Network L1 OK · **DENY invent** this seat |
| Honesty / `C-SLICE-≠-MODULE` / formula | — | **pm** | Keep `*_ready=false` · `formula_LIVE=false` · no module ATT UAT / Phase1 · no peer / OT-TYPE seal reopen |
| Peer L1 seals OTC/OT-TYPE/CODE/leave/WS/SHIFT/CTR | must_keep | — | **do not reopen** |
| **R-PLT-ATT-OTC-CMDFMT-04** | P3 PROCESS | qa (optional) | Prior QA-01 pack fmt; QA-FE still 3/8 miss — **non-blocking** when QC consolidates |

**No residual P0/P1 product** on OTC-03 Condition. Residual open = FE-ADMIN HOLD NOTE + honesty locks only → **GWC** (not full GO).

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim formula LIVE from Nest nameVi? | **NO** |
| May PM invent FE admin OT-comp panel? | **NO** — FE-ADMIN HOLD |
| May PM reopen L1 invent KEY / OT-TYPE L1/FE / peer ATT/CTR seals? | **NO** |
| May PM fold `att_ot_comp_type` into `att_ot_type`? | **NO** |
| May PM claim module ATT UAT / Phase1 / UF 🟢 module? | **NO** |
| May PM mark **R-PLT-ATT-OTC-03 CLOSED**? | **YES** — this seat |
| May PM retain QC-01 L1 SEAL `ATTCOMPQA-MSKARXQU`? | **YES** — unchanged |
| Why | `C-SLICE-≠-MODULE` · OTC-03 CLOSED ≠ module ATT UAT · FE-ADMIN HOLD remains |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** · **`payroll_e2e_ready=false` LOCKED** · **`formula_LIVE=false`** |
| Forced residual dispatch this turn? | **U88** — seal seat · residual **ba-docs** ATT-COMP DOCS if open · else **sa/ba-process** next vertical on program board — **NOT** claim module ATT UAT |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 GWC L1 | `…-att-comp-type-catalog-qc-01.md` | GWC · OTC-03 Condition open | 🟢 **RETAIN — L1 not reopened** |
| FE-01 Nest rebind | `…-att-comp-type-catalog-fe-01.md` | READY_FOR_QA · closes OTC-03 | 🟢 **ACCEPT closed** |
| QA-FE-01 | `…-att-comp-type-catalog-qa-fe-01.md` | PASS_WITH_OBS · `ATTCOMPQAFE-MSKBBEJW` · CLOSABLE | 🟢 **ACCEPT** |
| Machine JSON | `_tmp-…-qa-fe-01-browser.json` | PASS_WITH_OBS · Nest picker + 201 Nest compensation · OT-TYPE RETAIN · F5 | 🟢 **ACCEPT** |
| Screens 01–07 | `screens/…-qa-fe-01/` | attendance · OT tab · dialog Nest · after 2xx · F5 · detail | 🟢 **ACCEPT** |
| Pack verify QA-FE | `verify:qc:evidence-pack` | exit **1** · 3/8 miss | 🟡 **PROCESS OBS** — QC consolidates |
| L0 portal / HRM | `:5173` · `:28001/api/hrm` | **200 / 200** | 🟢 ENV OK |
| Peer OT-TYPE L1/FE + seals | prior GWC CLOSED | cited honesty | 🟢 **SEAL RETAIN** |

### Machine JSON spot (`ATTCOMPQAFE-MSKBBEJW`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTCOMPQAFE-MSKBBEJW` | 🟢 |
| `overall` / `ack_status` | **PASS_WITH_OBS** | 🟢 |
| `stamp_l1_retain` | `ATTCOMPQA-MSKARXQU` | 🟢 |
| `condition` / CLOSABLE | **CLOSABLE** | 🟢 → **CLOSED** |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.formula_LIVE` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.seed_used` / `ensureDefault` | **false** / **false** | 🟢 |
| `honesty.fe_admin_hold` | R-PLT-ATT-OTC-FE-ADMIN / invent DENIED | 🟢 HOLD |
| `ac.PICKER_COMP_NEST_NAMEVI` | PASS · onlyBoot=false | 🟢 |
| `ac.FE_GET_COMP_EFFECTIVE` | **200** `HRM-ATT-OTC-200` | 🟢 |
| `ac.CREATE_SUBMIT` | **201** `HRM-OT-201` · `qa_fe_otc_mskbbejw` · `qc_spot_ot_msk8` | 🟢 |
| `create.nestCompInBody` | **true** | 🟢 |
| `ac.OT_TYPE_PICKER_RETAIN` | PASS | 🟢 RETAIN |
| `ac.FE_AFTER_2XX` / `F5_RETAIN_NEST_NAMEVI` | WARN / PASS | 🟢 ACCEPT soft OBS |
| `ac.INVENT_UI_SELECT_ONLY` | PASS_WITH_OBS | 🟢 ACCEPT |
| `ac.INVENT_KEY_L1` | PASS cite L1 KEY LIVE | 🟢 ACCEPT cite |
| `invent_api.status` | null · inventPosts=[] · cite L1 | 🟡 OBS idle-ok — L1 KEY seal RETAIN sufficient for FE Condition |
| `ac.EFF0_BOOTSTRAP` | **NOTE_BLOCKED** | 🟢 ACCEPT |
| `ac.FE_ADMIN_HOLD` | PASS / HOLD_ABSENT_OK | 🟢 HOLD |
| `ac.CONSOLE_CLEAN` | pageErrors=0 · bad5xx=0 | 🟢 |

---

## Gate AC audit (OTC-03 close scope)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| VAL-COMP-CNS-01 / AC-01 | Nest EFF Select when active>0 ≠ sole hardcode-2 | Nest nameVi · onlyBoot=false · hint hidden | 🟢 **ACCEPT** |
| Submit Nest | Nest **compensation_type** code in POST · 2xx | **201** `HRM-OT-201` · `qa_fe_otc_mskbbejw` | 🟢 **ACCEPT** |
| OT-TYPE RETAIN | Nest ot-types still works · no reopen | `qc_spot_ot_msk8` · GET OT 200 | 🟢 **ACCEPT RETAIN** |
| FE + F5 | list retain Nest code · no binary invent | list GET 200 · binaryInvent=false | 🟢 **ACCEPT** |
| GET effective | FE hook Network | **200** `HRM-ATT-OTC-200` | 🟢 **ACCEPT** |
| Invent UI | free entry OR Select-only + L1 KEY | Select-only OBS · L1 cite | 🟢 **ACCEPT OBS** |
| AC-01c empty | bootstrap without wipe | NOTE_BLOCKED · unit 15 | 🟢 **ACCEPT** |
| L1 invent KEY | prefer L1 seal · ≠ OT-TYPE-KEY | AC invent KEY PASS cite · RETAIN | 🟢 **RETAIN** |
| FE-ADMIN | HOLD / no invent | HOLD_ABSENT_OK | 🟡 **HOLD RETAIN** |
| 01H | Honesty / seals / formula | false · RETAIN · C-SLICE · U65 | 🟢 **ACCEPT** |
| — | invent ready / module ATT UAT / Phase1 / formula LIVE / invent FE admin / reopen L1 / OT-TYPE / fold / seed | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-FE | QC |
|-----------------|-------|-------|-----|
| **OTC L1** invent KEY + admin N+1 + soft-retire | QC-01 GWC `ATTCOMPQA-MSKARXQU` | RETAIN | 🟢 **SEAL RETAIN** |
| Browser `OvertimeRequestTab` Nest compensation EFF + Nest code submit | R-PLT-ATT-OTC-03 | 🟢 PASS_WITH_OBS stamp FE | ✅ **CLOSED ACCEPT** |
| OT-TYPE FE picker | OT-TYPE FE-01 CLOSED | RETAIN Nest | 🟢 **SEAL RETAIN** |
| FE admin ot-comp-types panel | FE-ADMIN NOTE | HOLD_ABSENT_OK | 🟡 **HOLD RETAIN** |
| J-HRM-ATT-COMP-* / UF-HRM / module ATT UAT | Proposed BA | **not claimed** | ⬜ **DEFERRED** — **DENY promote** |
| Peer ATT-CODE / leave / WS / SHIFT / CTR / OT-TYPE | Prior GWC | cite RETAIN | 🟢 **SEAL RETAIN** |

**U19 note:** This gate closes **R-PLT-ATT-OTC-03** only (browser Nest compensation picker + Nest `compensation_type` submit). It does **not** certify module ATT UAT, invent PROGRAM_JOURNEY_MAP J-* rows, formula LIVE, or FE admin panel. Missing module J-* does **not** NO-GO this Condition close; it keeps ready=false and **C-SLICE**. QC consolidates journey_l25 as **N/A deferred** + FE CNS browser PASS stated.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-ATT-OTC-03** | QC-01 CONDITION P2 · FE hardcode-2 | ✅ **CLOSED ACCEPT** — QA-FE browser Nest EFF compensation + Nest code 201 + OT-TYPE RETAIN + F5 |
| Invent UI free-entry | PASS_WITH_OBS | **ACCEPT** — Select-only + L1 KEY cite |
| AC-PLT-ATT-COMP-01c | NOTE_BLOCKED | **ACCEPT** — empty not isolatable without wipe/seed |
| invent_api browser status null / inventPosts=[] | cite L1 | **OBS idle-ok** — does not reopen L1 KEY SEAL; FE Condition does not require invent UF 🟢 |
| List nameVi soft WARN | FE_AFTER_2XX WARN | **ACCEPT OBS** — Network POST Nest code + list GET prove persist |
| **R-PLT-ATT-OTC-FE-ADMIN** | NOTE HOLD | **HOLD RETAIN** — DENY invent |
| QA-FE pack 3/8 miss | verify exit 1 | **PROCESS OBS** — QC consolidates 8/8 |
| **R-PLT-ATT-OTC-CMDFMT-04** | P3 prior | **PROCESS OBS RETAIN** — non-blocking |
| Peer L1 seals · OT-TYPE · formula · ready | must_keep | **SEAL RETAIN / LOCKED false** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA-FE PASS_WITH_OBS stamp `ATTCOMPQAFE-MSKBBEJW` · OTC-03 CLOSABLE | PRODUCT PASS | Yes → Condition CLOSE |
| Nest compensation picker nameVi + Nest compensation_type POST 201 + OT-TYPE RETAIN + FE+F5 | PRODUCT PASS | Yes → VAL-CNS-01 / submit |
| L1 `ATTCOMPQA-MSKARXQU` RETAIN · KEY LIVE | PRODUCT PASS | Yes → must_keep |
| Invent Select-only OBS · EFF=0 NOTE_BLOCKED · inventPosts cite L1 | PRODUCT ACCEPT | Yes → documented OBS |
| FE-ADMIN HOLD ABSENT | PRODUCT CONDITION NOTE | Yes → GWC residual (not GO) |
| Honesty / ready flips / formula LIVE / seal reopen / invent FE admin / fold OT-TYPE | PRODUCT DENIED | Yes → CONDITIONS remaining |
| QA-FE pack command_table / journey_l25 / residual miss | PROCESS OBS | No — QC consolidates |
| L0 portal 200 · HRM `/api/hrm` 200 (health path 404 noise ignore) | ENV OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-ATT-OTC-FE-ADMIN** | **P2 NOTE HOLD** | note_hold | Do **not** invent FE admin panel; Network L1 OK |
| **Honesty / C-SLICE / formula** | — | **pm** | Keep `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `formula_LIVE=false` · no module ATT UAT / Phase1 · no peer / OT-TYPE seal reopen · L1 KEY RETAIN |
| Peer seals + L1 KEY + OT-TYPE CLOSED | must_keep | — | **do not reopen** |
| **R-PLT-ATT-OTC-CMDFMT-04** | P3 PROCESS | qa optional | pack fmt polish — non-blocking |
| **U88 continuous** | — | **pm** | Seal this seat · if ATT-COMP **ba-docs** residual open → Task `ba-docs`; else Task **sa** and/or **ba-process** next vertical on `PO_HRM_CONTINUOUS_W8` board — **do not** idle program · **DENY** module ATT UAT claim |

**No residual P0/P1 product** on OTC-03. Full **module GO** still blocked by honesty / C-SLICE / FE-ADMIN HOLD (not by open OTC-03).

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-FE-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ Browser OvertimeRequestTab Nest compensation picker+submit **PASS** · J-HRM-ATT-COMP-* **N/A deferred** · DENY module |
| 4 | crud_or_matrix | ✅ VAL-ATT-COMP-CNS-01 · AC-01 Nest Select/submit/F5 · OT-TYPE RETAIN · 01c NOTE · 01H · L1 KEY RETAIN |
| 5 | Classification | ✅ PRODUCT / ENV / PROCESS OBS |
| 6 | Honesty locks | ✅ attendance/payroll/formula=false · FE-ADMIN HOLD · OT-TYPE seals RETAIN · C-SLICE · DENY invent admin |
| 7 | Residual section | ✅ FE-ADMIN HOLD · honesty · U88 ba-docs/sa-ba next · seals |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

**QA pack note:** `pnpm run verify:qc:evidence-pack -- --evidence …-qa-fe-01.md` → **FAIL 3/8** (`command_table` · `journey_l25` · `residual_section`) = **PROCESS OBS** (peer pattern OT-TYPE / ATT-SHIFT QC-FE). QC evidence is SoT pack for this gate.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| Read QA-FE + machine `ATTCOMPQAFE-MSKBBEJW` | PASS_WITH_OBS · Nest picker · 201 Nest compensation · OT-TYPE RETAIN · F5 · CLOSABLE | PRODUCT audit |
| Read FE-01 READY · QC-01 GWC L1 | Nest rebind · KEY LIVE RETAIN · OTC-03 open → close | PRODUCT audit |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md` | exit **1** · 3/8 miss | PROCESS OBS |
| Spot L0 portal `:5173` + HRM `/api/hrm` | **200 / 200** (health path 404 ignore) | ENV OK |
| `pnpm --dir apps/web/hrm exec vitest` cite FE-01 | **32/32** exit **0** (15+17) cited | PRODUCT cite |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-fe-01.md` | exit **0** · **PASS 8/8** (expected after write) | QC pack SoT |

---

## completion_report

**Closed:** Narrow Condition **R-PLT-ATT-OTC-03** — ACCEPT QA-FE stamp `ATTCOMPQAFE-MSKBBEJW` · browser U65 Nest compensation Select nameVi + GET effective 200 + POST OT **201** Nest `compensation_type=qa_fe_otc_mskbbejw` + OT-TYPE picker RETAIN `qc_spot_ot_msk8` + FE after 2xx + F5 · invent Select-only OBS ACCEPT · EFF=0 NOTE_BLOCKED ACCEPT · L1 `ATTCOMPQA-MSKARXQU` SEAL RETAIN (not reopened) · OT-TYPE L1/FE CLOSED seals RETAIN · honesty false · formula false · C-SLICE · peer seals RETAIN · U65 zero-seed · DENIED ready flip / formula LIVE / invent FE admin / fold OT-TYPE / module ATT UAT / Phase1 / UF 🟢 · QC pack 8/8 · L0 portal/HRM 200.

**Open / Conditions remaining:**
1. **R-PLT-ATT-OTC-FE-ADMIN** — P2 NOTE HOLD — DENY invent
2. Honesty / C-SLICE / formula locks — LOCKED false
3. Peer L1 + OT-TYPE CLOSED seals — RETAIN
4. U88 — seal seat · ba-docs ATT-COMP DOCS if open · else sa/ba next vertical — NOT module ATT UAT

**next_owner:** **pm**

**Forbidden claims retained:** module ATT UAT · Phase1 DONE · flip `*_ready` · formula LIVE · invent FE admin · reopen L1 / OT-TYPE / peer seals · fold into `att_ot_type` · seed waiver vs U65 · OTC-03 CLOSED = module GO.

---

## Handoff

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-FE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS
condition_closed:
  - id: R-PLT-ATT-OTC-03
    disposition: CLOSED ACCEPT
condition_retained:
  - id: R-PLT-ATT-OTC-FE-ADMIN
    disposition: HOLD RETAIN
    severity: P2 NOTE
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-fe-01.md
stamp_qa_fe: ATTCOMPQAFE-MSKBBEJW
stamp_l1_retain: ATTCOMPQA-MSKARXQU
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  formula_LIVE: false
  C-SLICE: true
  U65: zero-seed
  FE_ADMIN: HOLD
  OT_TYPE_SEALS: RETAIN
next_owner: pm
next_dispatch_prompt: |
  Seal bus seat PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-FE-01
  (GWC · R-PLT-ATT-OTC-03 CLOSED · FE-ADMIN HOLD retained).
  U88 same session — do NOT stop:
  1) If ATT-COMP client-docs residual open → Task ba-docs:
     work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DOCS-01
     evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-docs-01.md
  2) Else Task sa and/or ba-process next vertical on PO_HRM_CONTINUOUS_W8 board
     (peer after COMP: DEC/QSD/PAY residual / next catalog — read board; do not invent).
  DENY: flip attendance_uat_ready / payroll_e2e_ready / formula LIVE /
        invent FE-ADMIN / reopen OTC L1 ATTCOMPQA-MSKARXQU /
        reopen OT-TYPE L1/FE CLOSED / fold att_ot_type /
        module ATT UAT / Phase1 DONE / UF 🟢 whole ATT
```

---

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** (narrow OTC-03 Condition CLOSED only · FE-ADMIN HOLD retained · NOT module ATT UAT · NOT Phase1 DONE)