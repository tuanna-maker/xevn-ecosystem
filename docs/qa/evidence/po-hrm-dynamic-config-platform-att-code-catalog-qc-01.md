# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT attendance-code catalog Option B L1 narrow only** · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-01` PASS_TO_PM stamp **`ATTCODEQA-MSK4T1A5`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 Nest invent KEY + DTO open + EFF admin · **J-HRM-ATT-CODE-CAT-*** not claimed · **no** J-HRM-06c reopen · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-ATT-CODE-01b/c/d/e/H · VAL-ATT-CODE-CNS-07/08/09/10 · FE 01/01f HOLD |
| **Verdict** | **GO WITH CONDITIONS** — ATT-CODE-CATALOG **L1 SEAL ACCEPT** · CONDITION: honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · leave/worksite/EMP/SI/CTR · aggregate GĐ1 **SEAL RETAIN** · **R-PLT-ATT-CODE-FE-01** P2 HOLD (**do not invent FE**) · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md`](po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md) |
| **be_ref** | [`po-hrm-dynamic-config-platform-att-code-catalog-be-01.md`](po-hrm-dynamic-config-platform-att-code-catalog-be-01.md) READY_FOR_QA |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md) **CONFIRMED** |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) Option **B** LOCKED |
| **peer_gwc** | ATT-LEAVE · ATT-WORKSITE · EMPDEPT/EMPPOS/EMPST · EMP-CUSTOM/EXT · SI/CTR · LIST-TOTALS/aggregate · **SEAL RETAIN** (cấm reopen) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-01.json`](_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-01.json) · stamp **`ATTCODEQA-MSK4T1A5`** |
| **stamp_ref** | QA `ATTCODEQA-MSK4T1A5` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-ATT-CODE-01* · VAL-ATT-CODE-CNS-* · SA Option B · F-ATT-CAT-CODE/EFF · `HRM-ATT-CODE-KEY` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — Nest day-code catalog L1 ≠ attendance module UAT / Phase1 / flip ready / aggregate rewrite |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** | **cấm reopen** |
| ATT worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** | **cấm reopen** |
| EMP `EMPDEPTQA-MSK3VVXX` · `EMPPOSQA2-MSK3CDH1` · `EMPSTQA-MSK20G7H` · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** | **cấm reopen** |
| SI / CTR / PAY / LIST-TOTALS | **SEAL RETAIN** | **cấm reopen** |
| Aggregate / counting GĐ1 | **SEAL RETAIN** | **FORBIDDEN** rewrite this seat (**L-ATT-CODE-07**) |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 from L1** | **DENIED** | U65 · L1 ≠ browser UF |
| **Seed** | **DENIED** (U65) | QA + machine `seed_used=false` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest KEY ≠ module ATT UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow ATT attendance-code catalog Option B **L1** after QA stamp **`ATTCODEQA-MSK4T1A5`** (`overall=PASS` · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `seed_used=false` · `c_slice_ne_module=true`). Audited QA MD + BE READY + BA CONFIRMED + machine JSON + live L0 hrm/portal **200** · xbos `/api/xbos` **200** · unauth `GET …/attendance-codes/effective` → **401** · KEY + open DTO spot in src. Proven: invent POST+PATCH → **400** `HRM-ATT-CODE-KEY` (≠ leave/EMP); DTO open (no closed `@IsIn(4)` on status); admin CREATE `wfh_qa_msk4t1a5` **201** · F5 EFF N+1; open slug persist **201** + `status_label`/`symbol=WF`; soft-retire → EFF hide; aggregate sealed (no att-code import). FE Select rebind = **CONDITION HOLD** **R-PLT-ATT-CODE-FE-01** — **QC does not invent FE as mandatory for L1 GO**. QA pack verify **1/8** missing `command_table` = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** `attendance_uat_ready` / `payroll_e2e_ready` flip · reopen leave/worksite/EMP/SI/CTR · aggregate rewrite · module ATT UAT · Phase1 DONE · seed · UF 🟢 · invent FE Task. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTCODEQA-MSK4T1A5` · overall PASS | machine `overall=PASS` · `ack_status=PASS_TO_PM` | 🟢 **ACCEPT** |
| AC-PLT-ATT-CODE-01b invent KEY | POST+PATCH **400** `HRM-ATT-CODE-KEY` | 🟢 **ACCEPT** |
| DTO open (no IsIn4 ceiling) | Create/Update status open · check_in_method IsIn only | 🟢 **ACCEPT** |
| VAL-ATT-CODE-CNS-07 open slug persist | **201** `status=wfh_qa_msk4t1a5` | 🟢 **ACCEPT** |
| AC-PLT-ATT-CODE-01d admin N+1 | POST **201** · EFF hasOpen · F5 | 🟢 **ACCEPT** |
| AC-PLT-ATT-CODE-01e soft-retire | retire **201** · EFF hidden | 🟢 **ACCEPT** |
| VAL-ATT-CODE-CNS-08 display | `status_label` + `symbol=WF` | 🟢 **ACCEPT** |
| VAL-ATT-CODE-CNS-09 KEY taxonomy | `HRM-ATT-CODE-KEY` only · ≠ leave/EMP | 🟢 **ACCEPT** |
| VAL-ATT-CODE-CNS-10 aggregate sealed | no att-code import · GĐ1 RETAIN | 🟢 **ACCEPT** |
| AC-PLT-ATT-CODE-01c empty baseline | EFF total=0 before N+1 · no seed | 🟢 **ACCEPT** |
| AC-PLT-ATT-CODE-01 / 01f FE picker | Nest EFF Select rebind | 🟡 **CONDITION HOLD** R-PLT-ATT-CODE-FE-01 — **no FE invent** |
| AC-PLT-ATT-CODE-01H honesty | false · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine | 🟢 **ACCEPT** |
| Peer leave/WS/EMP/SI/CTR/agg | seals | 🟢 **SEAL RETAIN** |
| invent ready / module ATT UAT / Phase1 / UF 🟢 | Explicit DENIED | 🟢 **DENIED promote** |
| QA pack command_table miss | verify exit 1 · 1/8 | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth EFF / L0 | **401** · hrm/portal/xbos OK | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim module ATT UAT DONE · reopen leave/worksite/EMP/SI/CTR · aggregate rewrite PASS · seed as evidence · invent FE Task for R-PLT-ATT-CODE-FE-01 as L1 mandatory · treat L1 GWC as module GO · Phase1 DONE · UF 🟢 from L1.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM reopen leave / worksite / EMPDEPT/EMPPOS/EMPST / SI/CTR / aggregate? | **NO** |
| May PM claim module ATT UAT / Phase1 / UF 🟢 from this L1? | **NO** |
| May PM seal ATT-CODE-CATALOG Option B **L1** slice? | **YES** — this seat GWC |
| May PM invent FE Task as mandatory for L1 GO? | **NO** — R-PLT-ATT-CODE-FE-01 = **CONDITION HOLD** only |
| Why | `C-SLICE-≠-MODULE` · Nest day-code KEY ≠ attendance module UAT |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** · **`payroll_e2e_ready=false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ≥1 **ba-docs** ATT-CODE DOC-DELTA · retain FE HOLD (no invent) · next vertical if W8 board continues |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA-01 Option B | `…-ATT-CODE-CATALOG-SA-01.md` | CONFIRMED LOCKED | **ACCEPT** (cited) |
| BA-01 AC pack | `…-ATT-CODE-CATALOG-BA-01.md` | CONFIRMED | **ACCEPT** |
| DATA-01 | Nest `att_attendance_code` ADD | CONFIRMED (BE cite) | **ACCEPT** |
| BE-01 | F-ATT-CAT-CODE/EFF · CNS KEY · DTO open · jest | READY_FOR_QA | **ACCEPT** |
| QA-01 | `…-att-code-catalog-qa-01.md` | PASS_TO_PM · `ATTCODEQA-MSK4T1A5` | **ACCEPT** |
| Machine JSON | `_tmp-…-att-code-catalog-qa-01.json` | PASS · honesty false | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth spot (QC) | `GET …/attendance-codes/effective?company_id=main` | **401** | 🟢 OK (not 404/500) |
| L0 hrm / portal / xbos | `:28001/api/hrm` · `:5173` · `:28002/api/xbos` | **200** / **200** / **200** | 🟢 ENV OK |
| KEY + DTO open spot | `HRM_ATT_CODE_KEY` · Create DTO no status IsIn4 | PRESENT · open | 🟢 |
| Aggregate sealed spot | `att-attendance-code.service.ts` no aggregate import | sealed | 🟢 |

### Machine JSON spot (`ATTCODEQA-MSK4T1A5`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTCODEQA-MSK4T1A5` | 🟢 |
| `overall` / `ack_status` | **PASS** · **PASS_TO_PM** | 🟢 |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.deny_aggregate_rewrite` | **true** | 🟢 |
| `dist.src_create_dto_no_isin4` / `src_update_dto_no_isin4` | **true** | 🟢 |
| `dist.aggregate_untouched_spot` / `stale_dist` | **true** / **false** | 🟢 |
| `val.AC-PLT-ATT-CODE-01b` | POST+PATCH **400** `HRM-ATT-CODE-KEY` | 🟢 |
| `val.AC-PLT-ATT-CODE-01d` | POST **201** · open `wfh_qa_msk4t1a5` | 🟢 |
| `val.VAL-ATT-CODE-CNS-07` | **201** open slug persist | 🟢 |
| `val.VAL-ATT-CODE-CNS-08` | label + `symbol=WF` | 🟢 |
| `val.AC-PLT-ATT-CODE-01e` | soft-retire · EFF hidden | 🟢 |
| `val.VAL-ATT-CODE-CNS-10` | aggregate_imports_att_code=false | 🟢 |
| `seals.reopened` | **false** | 🟢 |
| `residuals[0]` | R-PLT-ATT-CODE-FE-01 HOLD P2 | 🟡 CONDITION (no invent FE) |

---

## Gate AC audit (AC-PLT-ATT-CODE-01*)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01b | Invent day-code → 4xx `HRM-ATT-CODE-KEY` | POST+PATCH **400** KEY | 🟢 **ACCEPT** |
| 01c | GET effective 200 · empty [] OK · no seed | baseline total=0 · no seed | 🟢 **ACCEPT** |
| 01d | Admin CREATE Nest N+1 → 2xx · F5 EFF | POST **201** · EFF hasOpen | 🟢 **ACCEPT** |
| 01e | Soft-retire → hide default EFF | retire **201** · hidden | 🟢 **ACCEPT** |
| CNS-07 | Open slug persists (no IsIn4) | **201** `wfh_qa_msk4t1a5` | 🟢 **ACCEPT** |
| CNS-08 | `status_label` + `symbol` from catalog | label + `WF` | 🟢 **ACCEPT** |
| CNS-09 | KEY ≠ leave/EMP | `HRM-ATT-CODE-KEY` only | 🟢 **ACCEPT** |
| CNS-10 | No aggregate rewrite | sealed spot | 🟢 **ACCEPT** |
| 01 / 01f FE | Nest EFF picker + early_leave/on_leave | HOLD | 🟡 **CONDITION** R-PLT-ATT-CODE-FE-01 — **no FE invent** |
| 01H | Honesty / seals | false · RETAIN · C-SLICE | 🟢 **ACCEPT** |
| — | invent ready / module ATT UAT / Phase1 / UF 🟢 / reopen seals / agg rewrite | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA | QC |
|-----------------|-------|-----|-----|
| **ATT-CODE-CATALOG L1** invent KEY + DTO open + admin N+1 + display + soft-retire (in-scope) | SA/BA/DATA/BE CONFIRMED | 🟢 PASS L1 | 🟢 **PASS / ACCEPT** |
| Browser `AttendanceRecordsTable` Nest EFF Select | R-PLT-ATT-CODE-FE-01 | 🟡 HOLD | 🟡 **CONDITION** — **not** this L1 seal NO-GO · **no FE invent** |
| J-HRM-ATT-CODE-CAT-* / UF-HRM-05 / J-HRM-06* / module ATT UAT | Historical seals | **not executed** | ⬜ **DEFERRED** — **DENY promote** |
| Leave / worksite / EMP / SI / CTR / aggregate | Prior GWC | cite RETAIN only | 🟢 **SEAL RETAIN** — **DENY reopen** |

**U19 note:** This gate certifies the **ATT-CODE-CATALOG L1** slice named in dispatch — **not** browser UF, J-*, or module ATT UAT. Missing browser L2.5 does **not** NO-GO this L1 KEY pack; it **forces GWC CONDITION** (R-PLT-ATT-CODE-FE-01 P2 HOLD — no FE invent) and keeps attendance/payroll ready=false.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-ATT-CODE-FE-01** | QA P2 HOLD · FE Nest EFF Select rebind | **CONDITION HOLD** — owner **dev-fe** note only — **do not invent FE Task** this GWC as L1 mandatory |
| QA pack missing command_table | verify 1/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Stale-dist / product P0 | — | **NONE** |
| Peer leave/WS/EMP/SI/CTR/agg | must_keep | **SEAL RETAIN** — **FORBIDDEN reopen** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA L1 PASS stamp `ATTCODEQA-MSK4T1A5` | PRODUCT PASS | Yes → GWC ACCEPT L1 SEAL |
| Invent 400 `HRM-ATT-CODE-KEY` · open persist · display · soft-retire | PRODUCT PASS | Yes → 01b/d/e · CNS-07/08/09 |
| DTO open · aggregate sealed | PRODUCT PASS | Yes → ceiling DROP · L-ATT-CODE-07 |
| Peer seals RETAIN | PRODUCT PASS | Yes → must_keep |
| FE Nest EFF Select HOLD | PRODUCT CONDITION | Yes → GWC (not full GO) · no invent FE |
| Honesty / ready flips / seal reopen / UF 🟢 | PRODUCT DENIED | Yes → CONDITIONS |
| QA pack command_table miss | PROCESS OBS | No — QC consolidates |
| Live unauth 401 / L0 200 | ENV OK / PRODUCT OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no module ATT UAT / Phase1 invent · no leave/WS/EMP/SI/CTR/agg reopen |
| **R-PLT-ATT-CODE-FE-01** | P2 HOLD | **dev-fe** (later) | Nest EFF Select rebind + early_leave/on_leave — **HOLD** · **do not invent FE** this turn as L1 mandatory |
| Peer seals leave/WS/EMP/SI/CTR/agg | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Dispatch **ba-docs** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01` (client DOC-DELTA Nest F-ATT-CAT-CODE/EFF · admin≠consumer · `HRM-ATT-CODE-KEY` · DTO open cite · counting sealed GĐ1) — do not idle program on this seat seal alone · next vertical if W8 board continues |

**No residual P0 product** on ATT-CODE L1 AC pack. P2 FE residual HOLD note only — **not** mandatory for L1 GWC.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 invent KEY · FE HOLD · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-PLT-ATT-CODE-01* / VAL-ATT-CODE-CNS matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ attendance/payroll=false · leave/WS/EMP/SI/CTR/agg RETAIN · C-SLICE |
| 7 | Residual section | ✅ R-PLT-ATT-CODE-FE-01 HOLD · U88 ba-docs · seals retain |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md` | exit **1** · missing `command_table` (1/8) | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md` | exit **0** · **PASS** · **8/8** (re-run after write) | QC pack SoT |
| QA-01 runner stamp `ATTCODEQA-MSK4T1A5` | **PASS** · invent KEY · DTO open · seals RETAIN | PRODUCT OK (cited machine JSON) |
| QC L0 hrm / portal / xbos `/api/xbos` | **200 / 200 / 200** | ENV OK |
| QC unauth attendance-codes/effective | **401** | PRODUCT OK |
| QC KEY + DTO open + aggregate seal spot | `HRM-ATT-CODE-KEY` PRESENT · status IsIn4 ABSENT · no att-code→aggregate import | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + L0/KEY/DTO spot.

**L2.5 / journey:** No J-* promote in-scope this seat — **deferred**. Explicit: browser UF / module ATT UAT = **N/A / not tested** for this L1 gate — **DENY promote**; R-PLT-ATT-CODE-FE-01 P2 HOLD — **no FE invent**.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-ATT-CODE-01b/c/d/e · VAL-ATT-CODE-CNS-07/08/09/10 · invent → `HRM-ATT-CODE-KEY` · DTO open · admin N+1 · soft-retire · display label/symbol · U65 zero-seed · honesty locks · L1 slice **SEAL**.

**OUT of scope / DENIED:** Module ATT UAT · `attendance_uat_ready` / `payroll_e2e_ready` flip · reopen leave/worksite/EMP/SI/CTR · aggregate rewrite · Phase 1 DONE · seed · invent FE for R-PLT-ATT-CODE-FE-01 as mandatory for L1 GO · claim UF 🟢 from L1 alone · claim browser picker PASS this seat · restore closed `@IsIn(4)` ceiling.

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for ATT-CODE-CATALOG **L1** (Option B invent KEY + DTO open + EFF admin) complete.
2. QA stamp **`ATTCODEQA-MSK4T1A5`** · L1 PASS · U65 invent **400** `HRM-ATT-CODE-KEY` (POST+PATCH) **ACCEPT**.
3. DTO open · open slug persist **201** · admin N+1 **201** · soft-retire EFF hide · display `status_label`/`symbol=WF` **ACCEPT**.
4. L0 **200/200/200** · KEY **PRESENT** · unauth effective **401** · aggregate sealed spot.
5. Seals retained: leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` · EMPDEPT/EMPPOS/EMPST · EMP-CUSTOM/EXT · SI/CTR · aggregate GĐ1 **not reopened**.
6. Honesty locked: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · DENIED module ATT UAT / Phase1 / UF 🟢 / aggregate rewrite.
7. Confirmed **R-PLT-ATT-CODE-FE-01** P2 HOLD — **no invent FE Task** as L1 mandatory.
8. Verdict **GO WITH CONDITIONS** (L1-SEAL) — not full-module GO. **NOT Phase 1 DONE.**

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED ready flips / peer seal reopen / aggregate rewrite.
- **CONDITION P2 HOLD:** R-PLT-ATT-CODE-FE-01 Nest EFF Select — note only · **do not invent FE**.
- **U88 continuous:** next **ba-docs** ATT-CODE-CATALOG-DOCS-01 — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`ba-docs`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01` · **retain** R-PLT-ATT-CODE-FE-01 P2 HOLD (no invent FE) · honesty false · cấm reopen leave/WS/EMP/SI/CTR/aggregate · U88 next vertical if W8 board continues

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01 GWC · ATT-CODE L1 SEAL ACCEPT stamp ATTCODEQA-MSK4T1A5
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md
stamp_peer: ATTCODEQA-MSK4T1A5 · leave ATTLEAVEQA-MSJ7CPJH SEAL · worksite ATTWSQA-MSJC3IN9 SEAL · EMPDEPT/EMPPOS/EMPST seals

## entry_criteria
- Read QC GWC + QA-01 + BA-01 AC-PLT-ATT-CODE-01* + SA Option B
- Cite: invent → HRM-ATT-CODE-KEY · DTO open (no IsIn4) · admin N+1 · open slug persist · status_label/symbol · soft-retire
- Retain: leave/worksite/EMP/SI/CTR · aggregate counting sealed GĐ1 — cấm reopen / rewrite
- Honesty false · C-SLICE-≠-MODULE · DENY module ATT UAT / UF 🟢 / Phase1 / attendance_uat / payroll_e2e flip
- R-PLT-ATT-CODE-FE-01 P2 HOLD — do not invent FE as mandatory

## task
Client DOC-DELTA only (no_prompt_echo):
1) SRS/HDSD delta — ATT ký hiệu công / attendance codes: Nest F-ATT-CAT-CODE/EFF SoT; Settings REF merge-read only; invent KEY when EFF>0; admin CREATE open N+1 ≠ consumer invent
2) Cite DTO open — closed @IsIn(pending/present/absent/leave) ceiling DROP; display status_label + symbol from catalog
3) Cite L-ATT-CODE-07 counting sealed GĐ1 — flags physical only; ≠ leave-type / worksite / shifts fold
4) Cite peer seals leave/worksite/EMP/SI/CTR retain — do not reopen
5) Explicit DENY Settings-MD-alone / FE hardcode sole SoT when EFF>0 / attendance_uat flip / module ATT UAT
6) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-docs-01.md

## exit_criteria
- DOC-DELTA committed paths listed · PASS_TO_PM · no apps/** · no seed · no ready flip
- next_dispatch_prompt for PM U88 next vertical (program board) if continuous W8 still open

## cấm
seed · flip attendance_uat/payroll_e2e · invent FE · reopen seals · aggregate rewrite · module ATT UAT · Phase1 DONE · prompt-echo in client docs
```

---

## ack_status

**PASS_TO_PM**
