# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **EMP department catalog Option A L1 AC narrow only** · **not** module EMP UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QA-01` PASS_TO_PM stamp **`EMPDEPTQA-MSK3VVXX`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 Option A invent KEY / admin N+1 only · browser WH/EMP dept picker deepen **HOLD** outside this seat · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-EMP-DEPT-01/01b/01d/01e/01H · VAL-EMP-DEPT-CNS-01/05/ADM · DENY Nest `emp_department`/`emp_position` · seals RETAIN · honesty 01H |
| **Verdict** | **GO WITH CONDITIONS** — EMP-DEPT-CATALOG **L1 Option A SEAL ACCEPT** · CONDITION: honesty `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR **SEAL RETAIN** · **01c** NOTE_BLOCKED (no wipe) · **P3** alias `HRM-WH-DEPT-KEY` ≡ `HRM-EMP-DEPT-KEY` **HOLD** (no BE unlock for string rename alone) · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md`](po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md) |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md) **CONFIRMED** · **AC-PLT-EMP-DEPT-01*** |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md) Option **A** LOCKED |
| **peer_gwc** | EMP-POSITION `EMPPOSQA2-MSK3CDH1` · EMP-STATUS `EMPSTQA-MSK20G7H` · EMP-CUSTOM `EMPCFQA-MSK14LUH` · MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR · **SEAL RETAIN** (cấm reopen) · pattern peer EMP-POSITION-QC-01 |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json`](_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json) · stamp **`EMPDEPTQA-MSK3VVXX`** |
| **stamp_ref** | QA `EMPDEPTQA-MSK3VVXX` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-EMP-DEPT-01* · SA Option A · Settings/XBOS `departments` EFF · `HRM-EMP-DEPT-KEY` ≡ `HRM-WH-DEPT-KEY` · FORBIDDEN Nest `emp_department` / Nest org-tree sole invent / Nest `emp_position` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · L1 probe ≠ 🟢 UF |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 EMP dept invent KEY GWC ≠ module EMP UAT / Phase1 / flip personnel·e2e·printable / reopen EMP-POSITION·STATUS·CUSTOM·EXT·DOC/ET·ATT/SI/CTR / invent EMP-STATUS FE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| EMP-POSITION L1 `EMPPOSQA2-MSK3CDH1` | **SEAL RETAIN** | **FORBIDDEN reopen** · **DENIED Nest `emp_position`** |
| EMP-STATUS L1 `EMPSTQA-MSK20G7H` | **SEAL RETAIN** | **FORBIDDEN reopen** · **DENIED invent EMP-STATUS FE** |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **SEAL RETAIN** | **FORBIDDEN reopen** |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** | **cấm reopen** EXT suite |
| EMP DOC/ET Nest | **SEAL RETAIN** | **cấm reopen** |
| ATT / SI / CTR / enrollment | **SEAL RETAIN** | **cấm reopen** |
| Nest `emp_department` | **DENIED** | Option A Settings/XBOS SoT only |
| Nest `emp_position` | **DENIED** | RETAIN position Option A |
| Nest `public.departments` org-tree sole invent | **DENIED** | Hierarchy retain ≠ invent SoT |
| **Module EMP UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 from L1 alone** | **DENIED** | U65 L1 phụ ≠ browser UF |
| **J-* L2.5 promote** | **DENIED / deferred** | L1 invent KEY only — out of scope this seat |
| **Seed** | **DENIED** (U65) | QA + machine · no seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | L1 invent KEY ≠ module EMP UAT |
| P3 alias unify string alone | **HOLD** | LIVE `HRM-WH-DEPT-KEY` ≡ class — **no BE unlock** for rename alone |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow EMP **department** catalog Option A **L1** AC after QA stamp **`EMPDEPTQA-MSK3VVXX`** (`overall=PASS` · L1 · invent KEY · no persist · admin N+1 · Nest deny · honesty personnel/e2e/printable=false · zero-seed). Audited QA-01 MD + machine JSON + BA-01 AC-PLT-EMP-DEPT-01* CONFIRMED + SA Option A LOCK + L0 hrm/xbos/portal **200/200/200** + live `GET /api/hrm/emp-department` → **404** + `GET /api/hrm/emp-position` → **404**. Proven: EFF `departments` active **4→5** · admin CREATE **201** `HRM-SET-201` · invent WH `department_key=zz_invent_emp_dept_msk3vvxx` → **400** `HRM-WH-DEPT-KEY` (≡ `HRM-EMP-DEPT-KEY`) · invent **not** persisted · WH valid `dept_01` → **201** cleaned · soft-retire invent **400** KEY · CTR invent spot **400** peer KEY · Nest catalog ABSENT. **R-EMP-POS-DEPT-01** AC companion **CLOSED** this seat (prior OUT from position GWC). **01c** NOTE_BLOCKED honest (U65 no wipe). **P3** alias observe **HOLD** — **DENIED** BE unlock for string rename alone. QA pack verify **2/8** missing `command_table` + `journey_l25` = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** personnel/e2e/printable flip · Nest `emp_department`/`emp_position` · invent EMP-STATUS FE · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · module EMP UAT · Phase1 DONE · UF 🟢 from L1 alone · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `EMPDEPTQA-MSK3VVXX` · L1 PASS | machine `overall=PASS` · val.* PASS | 🟢 **ACCEPT** |
| AC-PLT-EMP-DEPT-01b invent WH | **400** `HRM-WH-DEPT-KEY` ≡ EMP-DEPT-KEY · invent key stamped | 🟢 **ACCEPT** |
| No invent persist | GET after · `invent_persisted=false` · count 15→15 | 🟢 **ACCEPT** |
| AC-PLT-EMP-DEPT-01d admin N+1 | POST **201** `HRM-SET-201` · open in EFF active **5** | 🟢 **ACCEPT** |
| AC-PLT-EMP-DEPT-01 WH valid ∈ EFF | POST **201** `HRM-EMP-PROFILE-201` · cleaned | 🟢 **ACCEPT** |
| AC-PLT-EMP-DEPT-01e soft-retire | draft **200** · invent retired **400** KEY | 🟢 **ACCEPT** |
| Nest `emp_department` / `emp_position` deny | src/dist ABSENT · live GET **404** / **404** | 🟢 **ACCEPT** |
| EFF baseline >0 | active **4** then **5** · no seed wipe | 🟢 **ACCEPT** |
| AC-PLT-EMP-DEPT-01c EFF=0 | NOTE_BLOCKED_NO_WIPE (U65) | 🟡 **OBS / CONDITION** — empty CTA not claimed from L1 |
| P3 alias `HRM-WH-DEPT-KEY` ≡ EMP-DEPT-KEY | BA maps ≡ · LIVE WH alias | 🟡 **HOLD** — **no BE unlock** rename alone |
| AC-PLT-EMP-DEPT-01H honesty | false · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| Peer seals EMPPOS · EMPST · CUSTOM · EXT · DOC/ET · ATT/SI/CTR | cite RETAIN · `reopened=false` | 🟢 **SEAL RETAIN** |
| invent ready / module EMP UAT / Phase1 / UF 🟢 / EMP-STATUS FE | Explicit DENIED | 🟢 **DENIED promote** |
| R-EMP-POS-DEPT-01 companion AC | This seat closes OUT from position GWC | 🟢 **CLOSED (AC)** this L1 seal |
| QA pack command_table + journey_l25 miss | verify exit 1 · 2/8 | 🟡 **PROCESS OBS** — QC consolidates |
| J-* / browser UF / module UAT | Explicit DENIED | 🟢 |

**Cấm:** invent `hrm_personnel_uat_ready=true` / `employees_e2e_linkage_ready=true` / `contracts_printable_ready=true` · claim module EMP UAT DONE · reopen EMP-POSITION `EMPPOSQA2-MSK3CDH1` · reopen EMP-STATUS `EMPSTQA-MSK20G7H` · invent EMP-STATUS FE · reopen EMP-CUSTOM `EMPCFQA-MSK14LUH` · reopen EXT `EMPTOKEXTQA-MSJ57PE1` · reopen DOC/ET/ATT/SI/CTR · invent Nest `emp_department` / Nest `emp_position` · seed as evidence · treat L1 GWC as module GO · unlock BE for alias string rename alone · flip ready flags · claim Phase1 DONE · claim UF 🟢 from L1 alone.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set `employees_e2e_linkage_ready=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM reopen EMP-POSITION `EMPPOSQA2-MSK3CDH1` / invent Nest `emp_position`? | **NO** |
| May PM reopen EMP-STATUS `EMPSTQA-MSK20G7H` / invent EMP-STATUS FE? | **NO** |
| May PM reopen EMP-CUSTOM CNS `EMPCFQA-MSK14LUH`? | **NO** |
| May PM reopen MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1`? | **NO** |
| May PM reopen DOC/ET / ATT / SI / CTR seals? | **NO** |
| May PM invent Nest `emp_department` / promote org-tree sole invent SoT? | **NO** |
| May PM unlock BE solely to rename `HRM-WH-DEPT-KEY` → `HRM-EMP-DEPT-KEY`? | **NO** — P3 HOLD (BA ≡ class retain) |
| May PM claim module EMP UAT / Phase1 / UF 🟢? | **NO** |
| May PM seal EMP-DEPT-CATALOG **L1** Option A slice? | **YES** — this seat GWC |
| May PM invent FE Task for WH/dept picker as mandatory for L1 GO? | **NO** — HOLD note only |
| Why | `C-SLICE-≠-MODULE` · L1 invent KEY ≠ module EMP UAT |
| Recommended flag state | keep **`hrm_personnel_uat_ready=false`** · **`employees_e2e_linkage_ready=false`** · **`contracts_printable_ready=false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ≥1 **ba-docs** EMP-DEPT-CATALOG-DOCS-01 · next vertical on W8 board · **do not invent FE / Nest / EMP-STATUS FE / BE alias unlock** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA-01 Option A | `…-EMP-DEPT-CATALOG-SA-01.md` | CONFIRMED LOCKED | **ACCEPT** (cited) |
| BA-01 AC pack | `…-EMP-DEPT-CATALOG-BA-01.md` · AC-PLT-EMP-DEPT-01* | CONFIRMED | **ACCEPT** (cited) |
| ba-data | HOLD (Settings/XBOS LIVE) | HOLD | **ACCEPT** — Nest FORBIDDEN |
| QA-01 | `…-emp-dept-catalog-qa-01.md` | PASS_TO_PM · `EMPDEPTQA-MSK3VVXX` | **ACCEPT** |
| Machine JSON | `_tmp-…-emp-dept-catalog-qa-01.json` | PASS · invent KEY · no persist · admin N+1 · Nest deny · seals RETAIN | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` + `journey_l25` (2/8) | 🟡 **PROCESS OBS** — QC consolidates |
| L0 spot (QC) | hrm/xbos/portal | **200 / 200 / 200** | 🟢 ENV OK |
| Live Nest deny (QC) | `GET /api/hrm/emp-department` · `GET /api/hrm/emp-position` | **404** / **404** | 🟢 OK |
| Peer seals | EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR | cite RETAIN · `reopened=false` | 🟢 **CONFIRM — no reopen** |

### Machine JSON spot (`EMPDEPTQA-MSK3VVXX`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `EMPDEPTQA-MSK3VVXX` | 🟢 |
| `overall` | **PASS** | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.employees_e2e_linkage_ready` | **false** | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.deny_module_emp_uat` | **true** | 🟢 |
| `honesty.deny_nest_emp_department` | **true** | 🟢 |
| `honesty.deny_nest_emp_position` | **true** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `src_dist.src_has_WH_DEPT_KEY` / assert / `catalogKey_departments` | **true** | 🟢 |
| `src_dist.src_has_EMP_DEPT_KEY_string` | **false** (alias ≡ class) | 🟢 **PASS retain** |
| `src_dist.nest_emp_department_*` / `nest_emp_position_*` | **false** | 🟢 |
| `val.AC-PLT-EMP-DEPT-01b_WH_INVENT_4xx_KEY` | **PASS** · **400** `HRM-WH-DEPT-KEY` | 🟢 |
| `val.AC-PLT-EMP-DEPT-01b_NO_PERSIST` | **PASS** · `invent_persisted=false` | 🟢 |
| `val.AC-PLT-EMP-DEPT-01d_ADMIN_N1` | **PASS** · **201** | 🟢 |
| `val.AC-PLT-EMP-DEPT-01c_EFF0` | **NOTE_BLOCKED_NO_WIPE** | 🟡 OBS |
| `val.AC-PLT-EMP-DEPT-01H_NEST_DENY` / seals / honesty | **PASS** | 🟢 |
| `val.PLATFORM_KEY_ALIAS` | **PASS_RETAIN_WH_ALIAS_≡_EMP_DEPT_KEY** | 🟢 · P3 HOLD |
| `residuals` | P3 alias observe only | 🟢 no P0/P1 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (AC-PLT-EMP-DEPT-01* · Option A L1)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01 EFF>0 + WH valid | Settings `departments` active >0 · WH ∈ EFF | active **4→5** · WH **201** `dept_01` · no seed | 🟢 **ACCEPT** |
| 01b invent WH | Unknown `department_key` → 4xx ≡ EMP-DEPT-KEY | **400** `HRM-WH-DEPT-KEY` | 🟢 **ACCEPT** |
| 01b no persist | GET invent not written | `invent_persisted=false` | 🟢 **ACCEPT** |
| 01d admin N+1 | CREATE open key 2xx + EFF | **201** `HRM-SET-201` · open in EFF | 🟢 **ACCEPT** |
| 01e soft-retire | Hide / invent retired KEY | draft + invent **400** KEY | 🟢 **ACCEPT** |
| VAL-CNS-05 CTR spot | Invent department on CTR | **400** `HRM-CON-POS-KEY` peer class | 🟢 **ACCEPT** |
| Nest deny | No `emp_department` / `emp_position` SoT | src/dist ABSENT · routes **404** | 🟢 **ACCEPT** |
| 01c EFF=0 | Soft · no seed | NOTE_BLOCKED | 🟡 **CONDITION OBS** (U65) |
| P3 alias | WH-DEPT ≡ EMP-DEPT | LIVE WH alias · string EMP absent | 🟡 **HOLD** — no BE unlock rename |
| 01H | Honesty / seals | false · peer RETAIN · C-SLICE | 🟢 **ACCEPT** |
| R-EMP-POS-DEPT-01 | Position OUT companion | This L1 AC pack closes | 🟢 **CLOSED (AC)** |
| — | invent ready / module EMP UAT / Phase1 / reopen seals / Nest / EMP-STATUS FE / UF 🟢 | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA | QC |
|-----------------|-------|-----|-----|
| **EMP-DEPT-CATALOG L1** Option A invent KEY + admin N+1 + Nest deny (in-scope) | SA/BA CONFIRMED · QA-01 PASS | 🟢 PASS L1 | 🟢 **PASS / ACCEPT** |
| Browser WH/EMP dept picker deepen | Outside this L1 seat | ⬜ not executed | 🟡 **HOLD** — **not** this L1 seal NO-GO · **no FE invent** |
| J-HRM-EMP-DEPT-CAT-* / module EMP UAT / personnel UF | Historical seals | **not executed** | ⬜ **DEFERRED** — **DENY promote** |
| EMP-POSITION / EMP-STATUS / CUSTOM / EXT / DOC/ET / ATT/SI/CTR | Prior GWC | cite RETAIN only | 🟢 **SEAL RETAIN** — **DENY reopen** |

**U19 note:** This gate certifies the **EMP-DEPT-CATALOG L1 Option A** invent-KEY / admin N+1 slice named in dispatch — **not** browser UF, J-*, or module EMP UAT. Missing browser L2.5 does **not** NO-GO this L1 KEY pack; it **forces GWC CONDITION** (FE picker HOLD — no invent FE; 01c NOTE_BLOCKED; P3 alias HOLD) and keeps personnel/e2e/printable=false.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-EMP-POS-DEPT-01** | Position QC CONDITION/OUT | **CLOSED (AC)** — this L1 Option A seat seals dept companion AC |
| **R-EMP-DEPT-CNS-01-ALIAS-OBSERVE** | QA P3 · LIVE WH-DEPT-KEY ≡ EMP-DEPT-KEY | **HOLD / CONDITION** — **FORBIDDEN** BE unlock for string rename alone |
| **01c empty CTA** | NOTE_BLOCKED no wipe | **CONDITION OBS** — FE empty CTA not claimed from L1 · no seed |
| FE WH/dept picker deepen | Outside L1 invent KEY | **HOLD** — note only · **do not invent FE Task** this GWC |
| QA pack missing command_table + journey_l25 | verify 2/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Stale-dist / product P0 | — | **NONE** |
| Peer EMP-POSITION / STATUS / CUSTOM / EXT / DOC-ET / ATT/SI/CTR | must_keep | **SEAL RETAIN** — **FORBIDDEN reopen** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA L1 PASS stamp `EMPDEPTQA-MSK3VVXX` | PRODUCT PASS | Yes → GWC ACCEPT L1 SEAL |
| Invent 400 WH-DEPT-KEY ≡ EMP-DEPT-KEY · no persist · admin N+1 201 | PRODUCT PASS | Yes → AC-01b / 01d |
| Nest `emp_department`/`emp_position` ABSENT · routes 404 | PRODUCT PASS | Yes → Option A must_keep |
| Soft-retire invent 400 · CTR invent spot 400 | PRODUCT PASS | Yes → 01e / CNS-05 |
| Peer seals RETAIN | PRODUCT PASS | Yes → must_keep |
| 01c NOTE_BLOCKED | PRODUCT CONDITION OBS | Yes → GWC (not full GO) |
| P3 alias HOLD | PRODUCT CONDITION | Yes → GWC · **no BE unlock** |
| Honesty / ready flips / seal reopen / Nest invent | PRODUCT DENIED | Yes → CONDITIONS |
| QA pack command_table + journey miss | PROCESS OBS | No — QC consolidates |
| Live Nest 404 / L0 200 | ENV OK / PRODUCT OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep personnel/e2e/printable=false · no module EMP UAT / Phase1 invent · no EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR reopen · no Nest `emp_department`/`emp_position` · no invent EMP-STATUS FE |
| **R-EMP-DEPT-CNS-01-ALIAS-OBSERVE** | P3 HOLD | **pm** | Retain WH alias ≡ class · **FORBIDDEN** BE unlock for string rename alone |
| **01c empty CTA** | OBS | **pm** / FE later | Optional FE empty CTA if product forces EFF=0 — **HOLD** · no wipe/seed |
| FE WH/dept picker deepen | HOLD | **dev-fe** (later) | Optional deepen — **HOLD** · **do not invent FE** this turn |
| Peer seals EMP-POSITION / STATUS / CUSTOM / EXT / DOC/ET / ATT/SI/CTR | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Dispatch **ba-docs** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01` (client DOC-DELTA Settings/XBOS `departments` SoT · invent → `HRM-WH-DEPT-KEY`≡`HRM-EMP-DEPT-KEY` · admin≠consumer · Nest deny · seals retain) — do not idle program on this seat seal alone · next vertical = W8 board OPEN |

**No residual P0/P1 product** on EMP-DEPT L1 Option A invent-KEY pack. 01c + P3 alias = CONDITIONS only.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 invent KEY · no J-* promote · FE HOLD · 01c OBS · P3 alias HOLD |
| 4 | crud_or_matrix | ✅ AC-PLT-EMP-DEPT-01* / VAL-EMP-DEPT-CNS-* / Nest deny matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ personnel/e2e/printable=false · EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR RETAIN · Nest DENY · C-SLICE |
| 7 | Residual section | ✅ P3 alias HOLD · 01c OBS · U88 ba-docs · seals retain |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md` | exit **1** · missing `command_table` + `journey_l25` (2/8) | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qc-01.md` | exit **0** · **PASS** · **8/8** (re-run after write) | QC pack SoT |
| QA-01 runner stamp `EMPDEPTQA-MSK3VVXX` | **PASS** · invent KEY · no persist · admin N+1 · Nest deny · seals RETAIN | PRODUCT OK (cited machine JSON) |
| QC L0 hrm/xbos/portal | **200 / 200 / 200** | ENV OK |
| QC live Nest deny | `GET /api/hrm/emp-department` → **404** · `GET /api/hrm/emp-position` → **404** | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + L0/Nest spot.

**L2.5 / journey:** No J-* promote in-scope this seat — **deferred**. Explicit: browser UF / module EMP UAT = **N/A / not tested** for this L1 gate — **DENY promote**; FE picker HOLD — **no FE invent**.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-EMP-DEPT-01/01b/01d/01e/01H · invent → **400** `HRM-WH-DEPT-KEY` ≡ `HRM-EMP-DEPT-KEY` · no persist · admin N+1 **201** · Nest `emp_department`/`emp_position` DENY · U65 zero-seed · honesty locks · **R-EMP-POS-DEPT-01** AC CLOSED · L1 Option A slice **SEAL**.

**OUT of scope / DENIED:** Module EMP UAT · personnel/e2e/printable flip · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · Nest `emp_department`/`emp_position` · org-tree sole invent SoT · Phase 1 DONE · seed · invent FE for WH/dept picker as mandatory · claim UF 🟢 from L1 alone · claim browser picker PASS this seat · BE unlock for alias string rename alone.

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for EMP-DEPT-CATALOG **L1 Option A** (Settings/XBOS invent KEY + admin N+1) complete.
2. QA stamp **`EMPDEPTQA-MSK3VVXX`** · L1 PASS · U65 invent WH → **400** `HRM-WH-DEPT-KEY` (≡ EMP-DEPT-KEY) · invent **not** persisted · admin CREATE **201** **ACCEPT**.
3. Nest `emp_department` / `emp_position` **ABSENT** · live GET **404** / **404** **ACCEPT**.
4. L0 **200/200/200** · soft-retire invent KEY · CTR invent spot peer KEY **ACCEPT**.
5. Seals retained: EMP-POSITION `EMPPOSQA2-MSK3CDH1` · EMP-STATUS `EMPSTQA-MSK20G7H` · EMP-CUSTOM `EMPCFQA-MSK14LUH` · MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR **not reopened**.
6. Honesty locked: personnel/e2e/printable=false · DENIED module EMP UAT / Phase1 / UF 🟢 / invent EMP-STATUS FE / Nest / BE alias unlock.
7. **R-EMP-POS-DEPT-01** AC companion **CLOSED** this L1 seal (prior OUT from position GWC).
8. Verdict **GO WITH CONDITIONS** (L1-SEAL) — not full-module GO. **NOT Phase 1 DONE.**

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED ready flips / peer seal reopen / Nest invent / EMP-STATUS FE invent.
- **CONDITION HOLD:** **R-EMP-DEPT-CNS-01-ALIAS-OBSERVE** P3 — WH-DEPT ≡ EMP-DEPT · **no BE unlock** rename alone.
- **CONDITION OBS:** **01c** empty CTA NOTE_BLOCKED — no wipe/seed · not claimed from L1.
- **CONDITION HOLD:** FE WH/dept picker deepen — note only · **do not invent FE**.
- **U88 continuous:** next **ba-docs** EMP-DEPT-CATALOG-DOCS-01 + program next vertical — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`ba-docs`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01` · retain P3 alias HOLD / 01c OBS / FE HOLD (no invent) · honesty false · cấm reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · Nest deny · U88 next vertical on W8 continuous board

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-01 GWC · EMP-DEPT L1 Option A SEAL ACCEPT · stamp EMPDEPTQA-MSK3VVXX
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qc-01.md
stamp_peer: EMPDEPTQA-MSK3VVXX · EMPPOSQA2-MSK3CDH1 SEAL · EMPSTQA-MSK20G7H SEAL · EMPCFQA-MSK14LUH SEAL · EMPTOKEXTQA-MSJ57PE1 SEAL

## entry_criteria
- Read QC GWC + QA-01 + BA-01 AC-PLT-EMP-DEPT-01* + SA Option A LOCK
- Cite: invent department_key → 400 HRM-WH-DEPT-KEY ≡ HRM-EMP-DEPT-KEY · no persist · admin N+1 201 · Nest emp_department/emp_position DENY · R-EMP-POS-DEPT-01 AC CLOSED
- Retain: EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR — cấm reopen
- Honesty false · C-SLICE-≠-MODULE · DENY module EMP UAT / UF 🟢 / Phase1 / invent EMP-STATUS FE / Nest emp_department / Nest emp_position / BE alias unlock
- 01c NOTE_BLOCKED · P3 alias HOLD · FE picker HOLD — do not invent FE / BE rename as mandatory

## task
Client DOC-DELTA only (no_prompt_echo):
1) SRS/HDSD delta — EMP department: Settings/XBOS departments EFF = SoT; invent → HRM-WH-DEPT-KEY ≡ HRM-EMP-DEPT-KEY when EFF>0; admin CREATE/sync open N+1 ≠ consumer invent; FORBIDDEN Nest emp_department · Nest org-tree sole invent · Nest emp_position
2) Cite R-EMP-POS-DEPT-01 AC CLOSED (position companion dept pack sealed L1)
3) Cite peer seals EMP-POSITION · EMP-STATUS · EMP-CUSTOM · EXT · DOC/ET · ATT/SI/CTR retain — do not reopen
4) Explicit DENY free-text SoT when EFF>0 / Nest dual master / personnel flip / module EMP UAT / BE unlock for string rename alone
5) Note 01c empty CTA not forced without wipe (U65) · FE empty CTA OUT this docs seat
6) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-docs-01.md

## cấm
seed · flip personnel/e2e/printable · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · invent EMP-STATUS FE · Nest emp_department · Nest emp_position · invent FE WH picker · BE alias string unlock · module EMP UAT · Phase1 DONE · claim UF 🟢

## exit
PASS_TO_PM + completion_report + next_dispatch_prompt (U88: next vertical OPEN on W8 continuous board — do not idle after docs seal)
```

---

## evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qc-01.md` |
| **qa_evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.json` |
| **stamp** | QA **`EMPDEPTQA-MSK3VVXX`** |
| **overall** | **GO WITH CONDITIONS** (L1 Option A SEAL) |
| **ack_status** | **PASS_TO_PM** |
