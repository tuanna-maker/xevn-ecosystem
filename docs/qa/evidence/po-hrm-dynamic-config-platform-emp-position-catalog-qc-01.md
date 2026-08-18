# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **EMP position catalog Option A L1 AC narrow only** · **not** module EMP UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02` PASS_TO_PM stamp **`EMPPOSQA2-MSK3CDH1`** |
| **ref_be** | [`po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md`](po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md) READY_FOR_QA · closes **R-PLT-EMP-POS-BE-01** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 Option A invent KEY only · browser WH/EMP picker deepen **HOLD** outside this seat · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-EMP-01b · VAL-EMP-POS-CNS-03 · DENY Nest `emp_position` · seals RETAIN · honesty 01H |
| **Verdict** | **GO WITH CONDITIONS** — EMP-POSITION-CATALOG **L1 Option A SEAL ACCEPT** · CONDITION: honesty `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR **SEAL RETAIN** · **R-EMP-POS-DEPT-01** OUT follow-on (dept companion — note only) · FE WH picker deepen HOLD (no invent FE) · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md`](po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md) |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md) **CONFIRMED** · **AC-PLT-EMP-01b** |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md) Option **A** LOCKED |
| **peer_gwc** | EMP-STATUS `EMPSTQA-MSK20G7H` · EMP-CUSTOM `EMPCFQA-MSK14LUH` · MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR · **SEAL RETAIN** (cấm reopen) · pattern peer EMP-STATUS-QC-01 / EMP-CUSTOM-QC-01 |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.json`](_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.json) · stamp **`EMPPOSQA2-MSK3CDH1`** |
| **stamp_ref** | QA `EMPPOSQA2-MSK3CDH1` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-EMP-01b · SA Option A · Settings/XBOS `job_titles` EFF · `HRM-EMP-POSITION-KEY` ≡ `HRM-WH-PICK-REQUIRED` · FORBIDDEN Nest `emp_position` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · L1 probe ≠ 🟢 UF |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 EMP position invent KEY GWC ≠ module EMP UAT / Phase1 / flip personnel·e2e·printable / reopen EMP-STATUS·CUSTOM·EXT·DOC/ET·ATT/SI/CTR / invent EMP-STATUS FE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| EMP-STATUS L1 `EMPSTQA-MSK20G7H` | **SEAL RETAIN** | **FORBIDDEN reopen** · **DENIED invent EMP-STATUS FE** |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **SEAL RETAIN** | **FORBIDDEN reopen** |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** | **cấm reopen** EXT suite |
| EMP DOC/ET Nest | **SEAL RETAIN** | **cấm reopen** |
| ATT / SI / CTR / enrollment | **SEAL RETAIN** | **cấm reopen** |
| Nest `emp_position` | **DENIED** | Option A Settings/XBOS SoT only |
| **Module EMP UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 from L1 alone** | **DENIED** | U65 L1 phụ ≠ browser UF |
| **J-* L2.5 promote** | **DENIED / deferred** | L1 invent KEY only — out of scope this seat |
| **Seed** | **DENIED** (U65) | QA + machine · no seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | L1 invent KEY ≠ module EMP UAT |
| Primary dept AC (`departments`) | **OUT** | **R-EMP-POS-DEPT-01** follow-on WI · Condition note only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow EMP **position** catalog Option A **L1** AC after QA stamp **`EMPPOSQA2-MSK3CDH1`** (`overall=PASS` · L1 · invent KEY · no persist · Nest deny · honesty personnel/e2e/printable=false · zero-seed). Audited QA-02 MD + machine JSON + BE-01 READY + BA-01 AC-PLT-EMP-01b CONFIRMED + SA Option A LOCK + L0 hrm/xbos/portal **200/200/200** + live `GET /api/hrm/emp-position` → **404** `HRM-DATA-404` + KEY/assert **PRESENT** in `employees.service.ts` · `EmployeesModule` imports `SettingsCatalogsModule`. Proven: EFF `job_titles` active **8** · invent PATCH `job_title_key=zz_invent_emp_pos_msk3cdh1` → **400** `HRM-EMP-POSITION-KEY` · invent **not** persisted (`STAFF` retained) · create invent spot **400** same KEY · **R-PLT-EMP-POS-BE-01 CLOSED**. Dept companion = **CONDITION/OUT** follow-on note only. FE WH picker deepen HOLD — **QC does not invent FE Task**. QA pack verify **2/8** missing `command_table` + `journey_l25` = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** personnel/e2e/printable flip · Nest `emp_position` · invent EMP-STATUS FE · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · module EMP UAT · Phase1 DONE · UF 🟢 from L1 alone · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `EMPPOSQA2-MSK3CDH1` · L1 PASS | machine `overall=PASS` · val.* PASS | 🟢 **ACCEPT** |
| AC-PLT-EMP-01b invent PATCH | **400** `HRM-EMP-POSITION-KEY` · invent key stamped | 🟢 **ACCEPT** |
| No invent persist | GET after · `job_title_key=STAFF` · `invent_persisted=false` | 🟢 **ACCEPT** |
| VAL-EMP-POS-CNS-03 create invent | POST **400** same KEY | 🟢 **ACCEPT** |
| R-PLT-EMP-POS-BE-01 CLOSED | BE DI wire + LIVE 400 (not prior 200) | 🟢 **ACCEPT CLOSED** |
| Nest `emp_position` deny | src/dist ABSENT · live GET **404** | 🟢 **ACCEPT** |
| EFF baseline >0 | active **8** · no seed wipe | 🟢 **ACCEPT** |
| AC-PLT-EMP-01c EFF=0 | NOTE_NO_WIPE (U65) | 🟡 **OBS** — soft path retained in BE/jest · not forced |
| AC-PLT-EMP-01H honesty | false · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| Peer seals EMP-STATUS · CUSTOM · EXT · DOC/ET · ATT/SI/CTR | cite RETAIN · `reopened=false` | 🟢 **SEAL RETAIN** |
| invent ready / module EMP UAT / Phase1 / UF 🟢 / EMP-STATUS FE | Explicit DENIED | 🟢 **DENIED promote** |
| Dept companion primary AC | BA OUT follow-on | 🟡 **CONDITION/OUT** R-EMP-POS-DEPT-01 |
| FE WH picker deepen | Outside L1 invent KEY seat | 🟡 **HOLD** — **no FE invent** |
| QA pack command_table + journey_l25 miss | verify exit 1 · 2/8 | 🟡 **PROCESS OBS** — QC consolidates |
| J-* / browser UF / module UAT | Explicit DENIED | 🟢 |

**Cấm:** invent `hrm_personnel_uat_ready=true` / `employees_e2e_linkage_ready=true` / `contracts_printable_ready=true` · claim module EMP UAT DONE · reopen EMP-STATUS `EMPSTQA-MSK20G7H` · reopen EMP-CUSTOM `EMPCFQA-MSK14LUH` · reopen EXT `EMPTOKEXTQA-MSJ57PE1` · reopen DOC/ET/ATT/SI/CTR · invent Nest `emp_position` · invent EMP-STATUS FE · seed as evidence · treat L1 GWC as module GO · invent FE Task as mandatory for L1 GO · flip ready flags · claim Phase1 DONE · claim UF 🟢 from L1 alone.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set `employees_e2e_linkage_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM reopen EMP-STATUS `EMPSTQA-MSK20G7H` / invent EMP-STATUS FE? | **NO** |
| May PM reopen EMP-CUSTOM CNS `EMPCFQA-MSK14LUH`? | **NO** |
| May PM reopen MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1`? | **NO** |
| May PM reopen DOC/ET / ATT / SI / CTR seals? | **NO** |
| May PM invent Nest `emp_position`? | **NO** |
| May PM claim module EMP UAT / Phase1 / UF 🟢? | **NO** |
| May PM seal EMP-POSITION-CATALOG **L1** Option A slice? | **YES** — this seat GWC |
| May PM invent FE Task for WH picker as mandatory for L1 GO? | **NO** — HOLD note only |
| May PM open dept companion as Condition/OUT follow-on note? | **YES** — `…-EMP-DEPT-CATALOG-*` later · same Option A · **not** reopen this seal |
| Why | `C-SLICE-≠-MODULE` · L1 invent KEY ≠ module EMP UAT |
| Recommended flag state | keep **`hrm_personnel_uat_ready=false`** · **`employees_e2e_linkage_ready=false`** · **`contracts_printable_ready=false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ≥1 **ba-docs** EMP-POSITION-CATALOG-DOCS-01 · optional next vertical (dept companion / program board) · **do not invent FE / Nest / EMP-STATUS FE** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA-01 Option A | `…-EMP-POSITION-CATALOG-SA-01.md` | CONFIRMED LOCKED | **ACCEPT** (cited) |
| BA-01 AC pack | `…-EMP-POSITION-CATALOG-BA-01.md` · AC-PLT-EMP-01b | CONFIRMED | **ACCEPT** (cited) |
| ba-data | HOLD (Settings/XBOS LIVE) | HOLD | **ACCEPT** — Nest FORBIDDEN |
| BE-01 | `…-emp-position-catalog-be-01.md` | READY_FOR_QA · closes R-PLT-EMP-POS-BE-01 | **ACCEPT** |
| QA-02 | `…-emp-position-catalog-qa-02.md` | PASS_TO_PM · `EMPPOSQA2-MSK3CDH1` | **ACCEPT** |
| Machine JSON | `_tmp-…-emp-position-catalog-qa-02.json` | PASS · invent KEY · no persist · Nest deny · seals RETAIN | **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` + `journey_l25` (2/8) | 🟡 **PROCESS OBS** — QC consolidates |
| L0 spot (QC) | hrm/xbos/portal | **200 / 200 / 200** | 🟢 ENV OK |
| Live Nest deny (QC) | `GET /api/hrm/emp-position` | **404** `HRM-DATA-404` | 🟢 OK |
| KEY + DI wire | `HRM_EMP_POSITION_KEY` · `assertJobTitleKeyInCatalog` · `EmployeesModule`→`SettingsCatalogsModule` | **PRESENT** | 🟢 |
| Peer seals | EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR | cite RETAIN · `reopened=false` | 🟢 **CONFIRM — no reopen** |

### Machine JSON spot (`EMPPOSQA2-MSK3CDH1`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `EMPPOSQA2-MSK3CDH1` | 🟢 |
| `overall` | **PASS** | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.employees_e2e_linkage_ready` | **false** | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.deny_module_emp_uat` | **true** | 🟢 |
| `honesty.deny_nest_emp_position` | **true** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `src_dist.src_has_POSITION_KEY` / WH alias / assert | **true** | 🟢 |
| `src_dist.employees_module_imports_settings` | **true** | 🟢 |
| `src_dist.nest_emp_position_*` | **false** | 🟢 |
| `val.AC-PLT-EMP-01b_PATCH_INVENT_4xx_KEY` | **PASS** · **400** `HRM-EMP-POSITION-KEY` | 🟢 |
| `val.AC-PLT-EMP-01b_NO_PERSIST` | **PASS** · `STAFF` retained | 🟢 |
| `val.VAL-EMP-POS-CNS-03_CREATE_SPOT` | **PASS** · **400** KEY | 🟢 |
| `val.DENY_NEST_EMP_POSITION` | **PASS** | 🟢 |
| `val.SEALS_RETAIN` / `HONESTY_FALSE_LOCKED` | **PASS** | 🟢 |
| `residuals` | **[]** | 🟢 none P0/P1 this seat |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (AC-PLT-EMP-01b · Option A L1)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01b EFF>0 | Settings `job_titles` active >0 | active **8** · no seed | 🟢 **ACCEPT** |
| 01b invent PATCH | Unknown `job_title_key` → 4xx `HRM-EMP-POSITION-KEY` | **400** KEY | 🟢 **ACCEPT** |
| 01b no persist | GET/F5 invent not written | `STAFF` retained · `persisted=false` | 🟢 **ACCEPT** |
| VAL-EMP-POS-CNS-03 | Create invent same KEY | POST **400** | 🟢 **ACCEPT** |
| R-PLT-EMP-POS-BE-01 | Prior invent **200** wiring gap | Now LIVE **400** · DI wired | 🟢 **CLOSED** |
| Nest deny | No `emp_position` SoT | src/dist ABSENT · route **404** | 🟢 **ACCEPT** |
| 01c EFF=0 | Soft · no seed | NOTE_NO_WIPE | 🟡 **OBS** (U65) |
| 01H | Honesty / seals | false · peer RETAIN · C-SLICE | 🟢 **ACCEPT** |
| Dept OUT | Primary dept AC | Follow-on WI | 🟡 **CONDITION/OUT** |
| — | invent ready / module EMP UAT / Phase1 / reopen seals / Nest / EMP-STATUS FE / UF 🟢 | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA | QC |
|-----------------|-------|-----|-----|
| **EMP-POSITION-CATALOG L1** Option A invent KEY + Nest deny (in-scope) | SA/BA/BE CONFIRMED · QA-02 PASS | 🟢 PASS L1 | 🟢 **PASS / ACCEPT** |
| Browser WH/EMP position picker deepen | Outside this L1 seat | ⬜ not executed | 🟡 **HOLD** — **not** this L1 seal NO-GO · **no FE invent** |
| J-HRM-EMP-POS-CAT-* / module EMP UAT / personnel UF | Historical seals | **not executed** | ⬜ **DEFERRED** — **DENY promote** |
| Dept companion `…-EMP-DEPT-CATALOG-*` | BA OUT | **not executed** | 🟡 **CONDITION/OUT** follow-on |
| EMP-STATUS / CUSTOM / EXT / DOC/ET / ATT/SI/CTR | Prior GWC | cite RETAIN only | 🟢 **SEAL RETAIN** — **DENY reopen** |

**U19 note:** This gate certifies the **EMP-POSITION-CATALOG L1 Option A** invent-KEY slice named in dispatch — **not** browser UF, J-*, dept primary AC, or module EMP UAT. Missing browser L2.5 does **not** NO-GO this L1 KEY pack; it **forces GWC CONDITION** (FE picker HOLD — no invent FE; dept OUT follow-on) and keeps personnel/e2e/printable=false.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-EMP-POS-BE-01** | QA-01 invent **200** · DI `@Optional()` no-op | **CLOSED** — LIVE **400** KEY · BE-01 + QA-02 |
| **R-EMP-POS-DEPT-01** | BA OUT primary dept | **CONDITION/OUT** — follow-on WI · same Option A · **do not invent this seat** |
| FE WH picker deepen | Outside L1 invent KEY | **HOLD** — note only · **do not invent FE Task** this GWC |
| QA pack missing command_table + journey_l25 | verify 2/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Stale-dist / product P0 | — | **NONE** |
| Peer EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT/SI/CTR | must_keep | **SEAL RETAIN** — **FORBIDDEN reopen** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA L1 PASS stamp `EMPPOSQA2-MSK3CDH1` | PRODUCT PASS | Yes → GWC ACCEPT L1 SEAL |
| Invent 400 POSITION-KEY · no persist · create invent 400 | PRODUCT PASS | Yes → AC-01b / CNS-03 |
| Nest `emp_position` ABSENT · route 404 | PRODUCT PASS | Yes → Option A must_keep |
| R-PLT-EMP-POS-BE-01 CLOSED | PRODUCT PASS | Yes → residual closed |
| Peer seals RETAIN | PRODUCT PASS | Yes → must_keep |
| Dept companion OUT | PRODUCT CONDITION/OUT | Yes → GWC (not full GO) · follow-on note |
| FE picker HOLD | PRODUCT CONDITION | Yes → GWC · no invent FE |
| Honesty / ready flips / seal reopen / Nest invent | PRODUCT DENIED | Yes → CONDITIONS |
| QA pack command_table + journey miss | PROCESS OBS | No — QC consolidates |
| Live Nest 404 / L0 200 | ENV OK / PRODUCT OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep personnel/e2e/printable=false · no module EMP UAT / Phase1 invent · no EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR reopen · no Nest `emp_position` · no invent EMP-STATUS FE |
| **R-EMP-POS-DEPT-01** | OUT / P2 | **pm** (later) | Follow-on `…-EMP-DEPT-CATALOG-*` same Option A — **CONDITION/OUT note** · not this seal reopen |
| FE WH picker deepen | HOLD | **dev-fe** (later) | Optional deepen — **HOLD** · **do not invent FE** this turn |
| Peer seals EMP-STATUS / CUSTOM / EXT / DOC/ET / ATT/SI/CTR | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Dispatch **ba-docs** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01` (client DOC-DELTA Settings/XBOS `job_titles` SoT · invent → `HRM-EMP-POSITION-KEY` · admin≠consumer · Nest deny · seals retain) — do not idle program on this seat seal alone · next vertical = dept companion **or** program board next OPEN |

**No residual P0 product** on EMP-POSITION L1 Option A invent-KEY pack. Dept OUT + FE HOLD = note only.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 invent KEY · no J-* promote · FE HOLD · dept OUT |
| 4 | crud_or_matrix | ✅ AC-PLT-EMP-01b / VAL-EMP-POS-CNS-03 / Nest deny matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ personnel/e2e/printable=false · EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR RETAIN · Nest DENY · C-SLICE |
| 7 | Residual section | ✅ R-EMP-POS-DEPT-01 OUT · FE HOLD · U88 ba-docs · seals retain |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md` | exit **1** · missing `command_table` + `journey_l25` (2/8) | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md` | exit **0** · **PASS** · **8/8** (re-run after write) | QC pack SoT |
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200/200/200** | ENV OK |
| QA-02 runner stamp `EMPPOSQA2-MSK3CDH1` | **PASS** · invent KEY · no persist · Nest deny · seals RETAIN | PRODUCT OK (cited machine JSON) |
| QC L0 hrm/xbos/portal | **200 / 200 / 200** | ENV OK |
| QC live Nest deny | `GET /api/hrm/emp-position` → **404** `HRM-DATA-404` | PRODUCT OK |
| QC KEY + DI spot | `HRM-EMP-POSITION-KEY` · `assertJobTitleKeyInCatalog` · SettingsCatalogsModule import **PRESENT** | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + L0/Nest/KEY spot.

**L2.5 / journey:** No J-* promote in-scope this seat — **deferred**. Explicit: browser UF / module EMP UAT = **N/A / not tested** for this L1 gate — **DENY promote**; FE picker HOLD — **no FE invent**; dept companion = **OUT follow-on**.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-EMP-01b invent → **400** `HRM-EMP-POSITION-KEY` · no persist · VAL-EMP-POS-CNS-03 create invent · **R-PLT-EMP-POS-BE-01 CLOSED** · Nest `emp_position` DENY · U65 zero-seed · honesty locks · L1 Option A slice **SEAL**.

**OUT of scope / DENIED:** Module EMP UAT · personnel/e2e/printable flip · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · Nest `emp_position` · Phase 1 DONE · seed · invent FE for WH picker as mandatory · claim UF 🟢 from L1 alone · claim browser picker PASS this seat · primary dept AC pack (follow-on only).

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for EMP-POSITION-CATALOG **L1 Option A** (Settings/XBOS invent KEY) complete.
2. QA stamp **`EMPPOSQA2-MSK3CDH1`** · L1 PASS · U65 invent PATCH **400** `HRM-EMP-POSITION-KEY` · invent **not** persisted · create invent **400** **ACCEPT**.
3. **R-PLT-EMP-POS-BE-01 CLOSED** (prior invent 200 wiring gap → LIVE 400).
4. Nest `emp_position` **ABSENT** · live GET **404** **ACCEPT**.
5. L0 **200/200/200** · KEY + DI wire **PRESENT**.
6. Seals retained: EMP-STATUS `EMPSTQA-MSK20G7H` · EMP-CUSTOM `EMPCFQA-MSK14LUH` · MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR **not reopened**.
7. Honesty locked: personnel/e2e/printable=false · DENIED module EMP UAT / Phase1 / UF 🟢 / invent EMP-STATUS FE / Nest.
8. Verdict **GO WITH CONDITIONS** (L1-SEAL) — not full-module GO. **NOT Phase 1 DONE.**

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED ready flips / peer seal reopen / Nest invent / EMP-STATUS FE invent.
- **CONDITION/OUT:** **R-EMP-POS-DEPT-01** dept companion follow-on WI — note only.
- **CONDITION HOLD:** FE WH picker deepen — note only · **do not invent FE**.
- **U88 continuous:** next **ba-docs** EMP-POSITION-CATALOG-DOCS-01 + program next vertical — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`ba-docs`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01` · retain dept OUT / FE HOLD (no invent) · honesty false · cấm reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · Nest deny · optional next vertical (`…-EMP-DEPT-CATALOG-*` or W8 board OPEN)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-01 GWC · EMP-POSITION L1 Option A SEAL ACCEPT · stamp EMPPOSQA2-MSK3CDH1
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md
stamp_peer: EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H SEAL · EMPCFQA-MSK14LUH SEAL · EMPTOKEXTQA-MSJ57PE1 SEAL

## entry_criteria
- Read QC GWC + QA-02 + BE-01 + BA-01 AC-PLT-EMP-01b + SA Option A
- Cite: invent job_title_key → 400 HRM-EMP-POSITION-KEY · no persist · R-PLT-EMP-POS-BE-01 CLOSED · no Nest emp_position
- Retain: EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR — cấm reopen
- Honesty false · C-SLICE-≠-MODULE · DENY module EMP UAT / UF 🟢 / Phase1 / invent EMP-STATUS FE / Nest emp_position
- Dept companion R-EMP-POS-DEPT-01 OUT follow-on note OK · FE WH picker HOLD — do not invent FE as mandatory

## task
Client DOC-DELTA only (no_prompt_echo):
1) SRS/HDSD delta — EMP position: Settings/XBOS job_titles EFF = SoT; invent → HRM-EMP-POSITION-KEY when EFF>0; admin CREATE/sync open N+1 ≠ consumer invent; FORBIDDEN Nest emp_position
2) Cite R-PLT-EMP-POS-BE-01 CLOSED (DI SettingsCatalogs into EmployeesModule)
3) Cite peer seals EMP-STATUS · EMP-CUSTOM · EXT · DOC/ET · ATT/SI/CTR retain — do not reopen
4) Explicit DENY free-text SoT when EFF>0 / Nest dual master / personnel flip / module EMP UAT
5) Note dept companion OUT follow-on (same Option A architecture) — do not invent primary dept AC this docs seat
6) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-docs-01.md

## cấm
seed · flip personnel/e2e/printable · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · Nest emp_position · invent FE WH picker · module EMP UAT · Phase1 DONE · claim UF 🟢

## exit
PASS_TO_PM + completion_report + next_dispatch_prompt (U88: next vertical — EMP-DEPT companion SA/BA OR next OPEN on W8 continuous board)
```

---

## evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md` |
| **qa_evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.json` |
| **stamp** | QA **`EMPPOSQA2-MSK3CDH1`** |
| **overall** | **GO WITH CONDITIONS** (L1 Option A SEAL) |
| **ack_status** | **PASS_TO_PM** |
