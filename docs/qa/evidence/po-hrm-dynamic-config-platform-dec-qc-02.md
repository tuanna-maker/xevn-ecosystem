# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser** DEC FE UF after QA-02 · **cấm wipe** DEC-QC-01 L1 SEAL `DECPLATQA-MSJ1FB3D` |
| **priority** | P0 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02` PASS_TO_PM |
| **prior_fe** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01` READY_FOR_QA |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` · `companyId=main` / API `holding` |
| **journey_l25** | **N/A deferred** — browser AC-PLT-DEC slice only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | Browser AC-PLT-DEC (Settings CFG + Decisions picker · format · HRD_* · create/F5 · CNS · retire/history · must_keep) — see § Gate AC audit |
| **Verdict** | **GO WITH CONDITIONS** — browser DEC UF SEAL ACCEPT · **CLOSE** `R-PLT-DEC-FE-01` · **RETAIN** L1 SEAL · CONDITIONS: **`C-SLICE-≠-MODULE`** · DENY decisions UAT / `*_ready` flip / module GO / Phase1 |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-dec-qa-02.md`](po-hrm-dynamic-config-platform-dec-qa-02.md) |
| **fe_ref** | [`po-hrm-dynamic-config-platform-dec-fe-01.md`](po-hrm-dynamic-config-platform-dec-fe-01.md) |
| **l1_seal** | [`po-hrm-dynamic-config-platform-dec-qc-01.md`](po-hrm-dynamic-config-platform-dec-qc-01.md) — stamp **`DECPLATQA-MSJ1FB3D`** · **SEAL RETAINED** · not wiped |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-dec-qa-02-browser.json`](_tmp-po-hrm-dynamic-config-platform-dec-qa-02-browser.json) · stamp **`DECPLATQA2-MSJ21R6Z`** · retest [`…-qa-02-retest.json`](_tmp-po-hrm-dynamic-config-platform-dec-qa-02-retest.json) **`DECPLATQA2R-MSJ2CPVI`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-dec-qa-02/` (01–24 + retest) |
| **spec_ref** | FE-01 §3 click path · AC-PLT-DEC · L1 SEAL `DECPLATQA-MSJ1FB3D` · QC-01 CONDITION `R-PLT-DEC-FE-01` |
| **U65** | zero-seed · browser FE click · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser AC GWC ≠ decisions module UAT / Phase1 DONE / personnel·e2e·pay·att·rec·printable ready |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **Decisions / QSĐ module UAT** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **Browser DEC FE UF (`R-PLT-DEC-FE-01`)** | **SEALED this seat** | CLOSED prior QC-01 CONDITION HOLD |
| **Module decisions UAT** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5** | **DENIED / deferred** | Out of scope this browser AC seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA browser zero-seed · machine `seed_used=false` |
| **DEC-QC-01 L1** | **SEAL RETAINED** | **Cấm wipe / reopen** API L1 `DECPLATQA-MSJ1FB3D` |
| **F-CORE-DEC / EMP DOC-ET / ATT leave / REC** | **must_keep** | Smoke PASS · not wiped |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT U65 browser Settings **Loại quyết định DEC** + Decisions effective-picker UF after FE-01 + QA-02 stamps **`DECPLATQA2-MSJ21R6Z`** + retest **`DECPLATQA2R-MSJ2CPVI`** (`overall=PASS` · `passes=21` · `fails=0` · honesty all **false** · `deny_wipe_l1_seal=true`). Audited QA MD + machine JSON (first + retest) + FE-01 + QC-01 L1 seal + spot screens (`04-open-after-create` · `23-retest-cns`). Proven: format INVALID toast · open key **PUT 200** `HRM-DEC-TYP-200` `hr_custom_dec_09_msj21r6z` · **HRD_*** **PUT 200** (case allowed) · F5 row + Settings effective picker · Decisions form binds effective · retest **POST decisions 201** `HRM-DEC-201` · CNS **400** `HRM-DEC-TYPE-UNKNOWN` + FE toast · retire hide · history keeps key · must_keep DEC/EMP/ATT/REC. **CLOSE** QC-01 CONDITION `R-PLT-DEC-FE-01`. **RETAIN** L1 QC-01 GWC SEAL `DECPLATQA-MSJ1FB3D` (not wiped — L1 key still visible in Settings table). QA pack verify **3/8** = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** invent decisions UAT · flip `*_ready` · claim module GO · Phase1 DONE · seed · wipe L1. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `DECPLATQA2-MSJ21R6Z` + retest `DECPLATQA2R-MSJ2CPVI` · **21/21** | machine `summary.passes=21` · `fails=0` · `overall=PASS` | 🟢 **ACCEPT** |
| PUT decision-types 2xx open key | `200 HRM-DEC-TYP-200` · id `9b733ebe-…` | 🟢 **ACCEPT** |
| HRD_* case VALID | `200` `HRD_QA_MSJ21R6Z` · not CODE-INVALID | 🟢 **ACCEPT** |
| F5 row + effective picker | row + picker has open key | 🟢 **ACCEPT** · **CLOSE HOLD** |
| Decisions form effective bind | form option PASS | 🟢 **ACCEPT** |
| POST decisions 201 | retest `HRM-DEC-201` · type `hr_custom_dec_09_msj2cpvi` | 🟢 **ACCEPT** |
| CNS 400 TYPE-UNKNOWN + toast | `400 HRM-DEC-TYPE-UNKNOWN` · `toastOk=true` | 🟢 **ACCEPT** |
| Retire hide + history key | active gone · form hide · history type intact | 🟢 **ACCEPT** |
| must_keep DEC/EMP/ATT/REC | all PASS · WH hint | 🟢 **ACCEPT** |
| U65 zero-seed | machine `seed_used=false` · MD | 🟢 **ACCEPT** |
| Honesty ready flags false | MD + JSON both stamps | 🟢 **DENIED promote** |
| L1 SEAL `DECPLATQA-MSJ1FB3D` | not wiped · screen row still shows L1 HRD key | 🟢 **RETAIN** |
| QA pack 3/8 | verify exit 1 | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / J-* / Phase1 / ready | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | Residual CONDITION | 🟡 **CONDITION OPEN** |

**Cấm:** invent decisions UAT · invent personnel/e2e/pay/att/rec/printable ready · Phase1 DONE · claim J-* / module DEC UAT · wipe L1 SEAL · seed as evidence.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set decisions / QSĐ module UAT ready? | **NO** |
| May PM set personnel / e2e / PAY / ATT / REC / printable ready true? | **NO** |
| Why | `C-SLICE-≠-MODULE` · browser AC seal ≠ module decisions UAT / J-* / Phase1 |
| Recommended flag state | keep all honesty flags **`false` LOCKED** |
| May PM claim browser DEC FE UF (`R-PLT-DEC-FE-01`) SEALED? | **YES** — this seat GWC |
| May PM claim L1 F-DEC-CAT still SEALED? | **YES** — QC-01 retained · stamp `DECPLATQA-MSJ1FB3D` |
| May PM claim module decisions UAT / Phase1 / J-*? | **NO** |
| Forced residual P0 this turn? | **NO product P0** — U88 continuous → **EXT-SA-01** / EMP lane (do not idle program) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 GWC | `po-hrm-dynamic-config-platform-dec-qc-01.md` | GWC · browser HOLD `R-PLT-DEC-FE-01` · stamp `DECPLATQA-MSJ1FB3D` | **SEAL RETAINED** |
| FE-01 | `po-hrm-dynamic-config-platform-dec-fe-01.md` | READY_FOR_QA · vitest cited | **ACCEPT** |
| QA-02 browser | `po-hrm-dynamic-config-platform-dec-qa-02.md` | PASS_TO_PM · 21/21 | **ACCEPT** |
| Machine first | `_tmp-…-qa-02-browser.json` | stamp `DECPLATQA2-MSJ21R6Z` · PASS · honesty false | **ACCEPT** |
| Machine retest | `_tmp-…-qa-02-retest.json` | stamp `DECPLATQA2R-MSJ2CPVI` · create/CNS/history PASS | **ACCEPT** |
| Screens 01–24 | `screens/po-hrm-dynamic-config-platform-dec-qa-02/` | create + CNS spot-check | **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **3/8** | 🟡 **PROCESS OBS** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| First stamp | `DECPLATQA2-MSJ21R6Z` | 🟢 |
| Retest stamp | `DECPLATQA2R-MSJ2CPVI` · `prior_stamp` matches | 🟢 |
| `stamp_ref_l1` | `DECPLATQA-MSJ1FB3D` | 🟢 **not wiped** |
| `u65` | zero-seed · browser-only · FE after 2xx + F5 | 🟢 |
| `honesty.decisions_uat_ready` (+ personnel/e2e/pay/att/rec/printable) | all **false** | 🟢 |
| `honesty.seed_used` / `deny_wipe_l1_seal` / `deny_module_decisions_uat` | **false** / **true** / **true** | 🟢 |
| `overall` / summary | **PASS** · **21/0** · note first-pass 18/21 + retest | 🟢 |
| PUT open | **200** `HRM-DEC-TYP-200` · `hr_custom_dec_09_msj21r6z` | 🟢 |
| PUT HRD_* | **200** `HRD_QA_MSJ21R6Z` | 🟢 |
| POST create (retest) | **201** `HRM-DEC-201` · id `c8a10aa6-…` | 🟢 |
| CNS (retest) | **400** `HRM-DEC-TYPE-UNKNOWN` · toastOk | 🟢 |
| Retire / history | **201** · `apiType=hr_custom_dec_09_msj2cpvi` | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

### Screen spot-check (QC)

| Screen | Observation | QC |
|--------|-------------|-----|
| `04-open-after-create.png` | Toast «Đã tạo loại quyết định» · row `hr_custom_dec_09_msj21r6z` · effective picker has key · honesty banner **UAT=false** · L1 row `HRD_QA_MSJ1FB3D` still listed | 🟢 |
| `23-retest-cns.png` | Decisions form + toast catalog TYPE-UNKNOWN copy · list shows `QA-DEC-R-MSJ2CPVI` | 🟢 |

---

## Gate AC audit

| # | Spec / AC | Browser observed | Prior QC-01 | QC |
|---|-----------|------------------|-------------|-----|
| L0-STACK | portal/hrm/xbos 200 | PASS | — | 🟢 |
| AC-PLT-DEC-TAB / PANEL | Settings DEC tab+panel | PASS | HOLD FE | 🟢 **CLOSE HOLD** |
| AC-PLT-DEC-FORMAT-* | space/digit → CODE-INVALID toast | PASS | L1 had API | 🟢 |
| AC-PLT-DEC-CREATE-2XX | PUT decision-types 2xx | **200** | HOLD FE | 🟢 **CLOSE HOLD** |
| AC-PLT-DEC-HRD-CASE-VALID | HRD_* uppercase VALID | **200** | L1 had API | 🟢 |
| AC-PLT-DEC-F5-ROW / EFFECTIVE-PICKER | F5 + picker | PASS | HOLD FE | 🟢 **CLOSE HOLD** |
| AC-PLT-DEC-FORM-* | Decisions binds effective | PASS | HOLD FE | 🟢 **CLOSE HOLD** |
| AC-PLT-DEC-MUSTKEEP-CREATE | POST decisions 201 | retest **201** | — | 🟢 |
| AC-PLT-DEC-CNS-UNKNOWN | 400 TYPE-UNKNOWN + toast | retest **400** + toast | L1 had API | 🟢 **CLOSE HOLD** |
| AC-PLT-DEC-RETIRE-* / HISTORY | retire hide · history key | PASS | HOLD FE | 🟢 **CLOSE HOLD** |
| must_keep DEC/EMP/ATT/REC | surfaces load | PASS | must_keep | 🟢 |
| L1 QC-01 | F-DEC-CAT/EFF | not wiped | SEAL | 🟢 **RETAIN** |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | — | 🟢 **DENIED** |

**OBS (not blocker):**
1. First-pass create/CNS blocked by FE `emptyForm.isPersonBound` default **true** — retest selected employee → PASS (QA OBS process).
2. CNS proven via one-shot POST rewrite when unknown ∉ effective picker — valid when EFF>0 (peer REC pattern).

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-DEC-FE-01** | QC-01 CONDITION OPEN (browser HOLD) | **CLOSED** — QA-02 21/21 stamps `DECPLATQA2-MSJ21R6Z` / `DECPLATQA2R-MSJ2CPVI` |
| PersonBound first-pass OBS | QA OBS | **PROCESS OBS** — not product demote |
| QA pack missing command_table / portal_url / journey_l25 | verify 3/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Product blockers | none | **NONE** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| Browser 21/21 PASS stamps | PRODUCT PASS | Yes → GWC ACCEPT browser SEAL |
| Close `R-PLT-DEC-FE-01` | PRODUCT CLOSE | Yes → CONDITIONS reduced |
| L1 SEAL retained | PRODUCT RETAIN | Yes — cấm wipe |
| `C-SLICE-≠-MODULE` · DENY ready/module/J-*/Phase1 | PRODUCT CONDITION | Yes → GWC (not clean GO) |
| QA pack 3/8 · personBound OBS | PROCESS OBS | No — QC consolidates |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **C-SLICE-≠-MODULE** | — | **pm** | Keep decisions UAT / all `*_ready=false` · no J-* / Phase1 / module invent |
| **R-EMP-TOK-EXT** | P2 HOLD | **pm / sa** | Peer `MERGE-TOKEN-EMP-EXT-SA-01` (U88 continuous — already on W8 board) · **DENIED** invent `custom.emp.*` LIVE here |
| OBS-personBound-default | P3 soft | **dev-fe** (optional) | Document/HDSD person Select for person-bound types — **not** forced this turn |

**DEC platform browser chain:** SA → DATA → BE → DevOps → QA-01 → QC-01 L1 → FE-01 → QA-02 → **QC-02** = **CLOSED** for Settings/DEC CFG UF. **NOT** module decisions UAT.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-02` |
| 2 | portal_url | ✅ `:5173` + HRM `:28001` + XBOS `:28002` |
| 3 | journey_l25 | ✅ **N/A deferred** — browser AC slice · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-PLT-DEC browser matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ decisions UAT=false · personnel/e2e/pay/att/rec/printable=false · L1 SEAL retain |
| 7 | Residual section | ✅ C-SLICE + R-EMP-TOK-EXT peer · R-PLT-DEC-FE-01 CLOSED |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-02.md` | exit **1** · **3/8** (`command_table` · `portal_url` · `journey_l25`) | **PROCESS OBS** — browser QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-02.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-02 runner stamp `DECPLATQA2-MSJ21R6Z` + retest `DECPLATQA2R-MSJ2CPVI` | **PASS** · 21/21 · fails=0 | PRODUCT OK (cited machine JSON) |
| DEC-QC-01 L1 | GWC SEAL retained · stamp `DECPLATQA-MSJ1FB3D` · not re-run | PROCESS OK — cấm wipe |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: decisions J-* rows = **N/A / not tested** for this browser AC gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** Browser Settings DEC CFG create/format/HRD_*/F5/effective picker · Decisions form bind · create QSĐ 201 · CNS 400 TYPE-UNKNOWN + toast · retire hide · history key · must_keep DEC/EMP/ATT/REC · U65 zero-seed · close QC-01 browser CONDITION `R-PLT-DEC-FE-01` · retain L1 SEAL.

**OUT of scope / DENIED:** Module decisions UAT · invent `*_ready=true` · J-* L2.5 promote · Phase 1 DONE · wipe DEC-QC-01 L1 · invent full-module GO · seed.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC browser GWC for DEC FE UF complete after QA-02 stamps **`DECPLATQA2-MSJ21R6Z`** / **`DECPLATQA2R-MSJ2CPVI`** · **21/21**.
2. **CLOSED** prior CONDITION `R-PLT-DEC-FE-01`.
3. L1 DEC-QC-01 GWC **SEAL RETAINED** — stamp **`DECPLATQA-MSJ1FB3D`** not wiped.
4. Honesty locked: decisions UAT=false · personnel/e2e/pay/att/rec/printable=false · DENY module UAT / J-* / Phase1.
5. DEC platform Settings/DEC CFG browser chain (SA→…→FE→QA→QC) **CLOSED** for this UF slice.

### Residual

- **CONDITION:** `C-SLICE-≠-MODULE` only (honesty residual) for this seat.
- Peer **R-EMP-TOK-EXT** remains HOLD — U88 continuous → `MERGE-TOKEN-EMP-EXT-SA-01` (do not invent LIVE).
- Soft OBS personBound default — optional FE polish, not forced.

---

## next_owner

**pm** — intake GWC · seal bus · continue U88 W8 (`MERGE-TOKEN-EMP-EXT-SA-01` / EMP-FE) · **cấm** invent decisions UAT

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-02 GWC · peer MERGE-TOKEN-EMP-QC-01 GWC (R-EMP-TOK-EXT HOLD)
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc_dec: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-02.md
ref_qc_tok: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md

## context
DEC browser QC-02 GWC SEALED (stamps DECPLATQA2-MSJ21R6Z / DECPLATQA2R-MSJ2CPVI · 21/21).
R-PLT-DEC-FE-01 CLOSED. L1 DECPLATQA-MSJ1FB3D RETAINED.
Honesty: decisions UAT=false · all *_ready=false LOCKED · C-SLICE-≠-MODULE.
U88: do not idle after DEC seat seal — open/continue R-EMP-TOK-EXT Option F.1 for custom.emp.* extension producer.

## task
1) Intake DEC-QC-02 GWC on bus · update TEAM_WORKING_NOW: DEC browser CLOSED
2) SA Option/F.1 narrow for custom.emp.* (R-EMP-TOK-EXT) — no second token table · DENY invent LIVE / personnel UAT / reopen sealed GWC
3) If EXT-SA already in-flight: do not duplicate Task — await PASS then ba-data/BE; else DISPATCH EXT-SA-01 now
4) Parallel OK: EMP-FE-01 → QA browser when READY (separate seat)

## exit
PASS_TO_PM · completion_report · next_owner ba-data|dev-be · next_dispatch_prompt · evidence_path
Cấm: decisions_uat_ready=true · flip *_ready · wipe DEC L1/browser seals · seed
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-02.md`

## ack_status

**PASS_TO_PM**

## decisions_uat_ready

**false**

## hrm_personnel_uat_ready / employees_e2e_linkage_ready / payroll_e2e_ready / attendance_uat_ready / recruitment_uat_ready / contracts_printable_ready

**false** (all LOCKED)
