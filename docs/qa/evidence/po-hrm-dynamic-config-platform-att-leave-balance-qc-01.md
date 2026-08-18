# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT leave accrual policy Nest Option B L1 narrow only** · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01` PASS_TO_PM stamp **`ATTLVRULEQA-MSK6G783`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 Nest admin policy + soft-retire + orphan TYPE + leave-type RETAIN · invent KEY Network = Condition wire · **J-HRM-ATT-LVRULE-*** not claimed · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-ATT-LEAVE-BAL-01b/c/d/e/f/g/H · VAL-ATT-LVRULE-CNS-* · FE 01g HOLD |
| **Verdict** | **GO WITH CONDITIONS** — ATT-LEAVE-BALANCE Nest Option B **admin L1 SEAL ACCEPT** · **Condition MANDATORY P1** `R-PLT-ATT-LVRULE-CNS-WIRE` (helper+jest LIVE · HTTP invent KEY ABSENT) · CONDITION P2 `R-PLT-ATT-LVRULE-FE-01g` HOLD · 01c NOTE_BLOCKED ACCEPT · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · engine LIVE HOLD · seals RETAIN · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md`](po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md) |
| **be_ref** | [`po-hrm-dynamic-config-platform-att-leave-balance-be-01.md`](po-hrm-dynamic-config-platform-att-leave-balance-be-01.md) READY_FOR_QA |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md) **CONFIRMED** |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) Option **B** LOCKED |
| **peer_gwc** | ATT-LEAVE type · ATT-CODE `ATTCODEQA-MSK4T1A5` · ATT-WS · ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` · ATT-SHIFT CNS-02 CLOSED · FE HOLDs · EMP/SI/CTR · **SEAL RETAIN** (cấm reopen) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.json`](_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.json) · stamp **`ATTLVRULEQA-MSK6G783`** |
| **stamp_ref** | QA `ATTLVRULEQA-MSK6G783` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-ATT-LEAVE-BAL-01* · VAL-ATT-LVRULE-CNS-* · SA Option B · F-ATT-LVRULE-01..04 · `HRM-ATT-LVRULE-KEY` · F-ATT-LEAVE-04 HOLD |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — Nest leave accrual policy admin L1 ≠ attendance module UAT / Phase1 / flip ready / engine LIVE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **F-ATT-LEAVE-04 engine LIVE** | **HOLD** | **DENIED** claim LIVE this seat |
| leave-type invent `HRM-LEAVE-TYPE-UNKNOWN` | **SEAL RETAIN** | **cấm reopen** L1 · orthogonal ≠ LVRULE-KEY |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** | **cấm reopen** · **cấm invent FE ATT-CODE HOLD** |
| ATT-WS | **SEAL RETAIN** | **cấm reopen** |
| ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` · CNS-02 CLOSED | **SEAL RETAIN** | **cấm reopen** invent KEY L1 · FE HOLDs RETAIN |
| EMP / SI / CTR / PAY / LIST-TOTALS | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 from L1** | **DENIED** | U65 · L1 ≠ browser UF |
| **Invent KEY Network LIVE** | **DENIED this seat** | Condition wire — **do not** claim KEY sealed on HTTP |
| **Seed** | **DENIED** (U65) | QA + machine honesty |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest admin L1 ≠ module ATT UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow Nest Option B **admin L1** after QA stamp **`ATTLVRULEQA-MSK6G783`** (`overall=PASS` · honesty false · seed false · C-SLICE true). Audited QA MD + BE READY + BA CONFIRMED + machine JSON + live L0 hrm/portal/xbos **200**. Proven Network: admin CREATE **201** `HRM-ATT-LVRULE-201` · F5 list/effective hit · soft-retire hide + `include_inactive` · orphan TYPE **400** `HRM-ATT-LVRULE-TYPE` · leave-type invent **400** `HRM-LEAVE-TYPE-UNKNOWN` · U19 fake **404** / member OOS **409** · unauth effective **401**. Dist/src: `HRM-ATT-LVRULE-KEY` + `assertLeaveAccrualPolicyForConsumer` LIVE · jest CNS invent KEY PASS · **controller HTTP consumer wire ABSENT** (`controller_assert_consumer_wired=false`).

**AC-01b invent KEY judgment:** Network **never** emitted `HRM-ATT-LVRULE-KEY` (grant/adjust/assert **404**; leave-request invent policy_* → **400** `HRM-VAL-001` DTO whitelist ≠ KEY). QA correctly marked `FAIL_GAP_WIRE` / Condition — **did not claim KEY LIVE**. QC **does not NO-GO** the admin L1 seal (path solid + helper/jest contract LIVE + consumer surface literally ABSENT). QC **does** attach **MANDATORY P1** Condition **`R-PLT-ATT-LVRULE-CNS-WIRE`** → owner **dev-be** (wire assert on grant/adjust or gated leave body so Network proves KEY). **NO-GO would apply** only if evidence claimed invent KEY LIVE without Network proof — that claim is **DENIED**.

FE **01g** = CONDITION P2 HOLD ACCEPT (**do not invent FE**). **01c** NOTE_BLOCKED ACCEPT (baseline active=0 · no wipe · jest CNS-05). QA pack verify **2/8** miss (`command_table` · `residual_section`) = **PROCESS OBS** — this QC consolidates **8/8**.

**DENIED:** flip ready · module ATT UAT · claim engine LIVE · reopen seals · invent FE ATT-CODE · seed · UF 🟢 · Phase1 DONE · claim invent KEY Network sealed this seat. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTLVRULEQA-MSK6G783` · overall PASS | machine `overall=PASS` · `PASS_TO_PM` | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-BAL-01d admin N+1 | POST **201** · F5 list/EFF hit `b06ac803-…` | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-BAL-01e soft-retire | retire **201** · hiddenDefault · include · effHides | 🟢 **ACCEPT** |
| VAL-ATT-LVRULE-CNS-09 orphan TYPE | **400** `HRM-ATT-LVRULE-TYPE` · no persist | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-BAL-01f type invent RETAIN | **400** `HRM-LEAVE-TYPE-UNKNOWN` | 🟢 **ACCEPT** |
| VAL-ATT-LVRULE-CNS-03 U19 | fake **404** · OOS **409** | 🟢 **ACCEPT** |
| Dist KEY + helper + jest CNS-01 | KEY present · assert LIVE · 13/13 cite | 🟢 **ACCEPT** (contract) |
| AC-PLT-ATT-LEAVE-BAL-01b invent KEY Network | `network_key_hit=false` · grant **404** · VAL-001 ≠ KEY | 🟡 **CONDITION MANDATORY P1** `R-PLT-ATT-LVRULE-CNS-WIRE` |
| AC-PLT-ATT-LEAVE-BAL-01c empty invent skip | baseline 0 · NOTE_BLOCKED · jest CNS-05 | 🟡 **ACCEPT NOTE_BLOCKED** |
| AC-PLT-ATT-LEAVE-BAL-01g panel/FE | MVP-five residual · FE HOLD | 🟡 **CONDITION P2 HOLD** `R-PLT-ATT-LVRULE-FE-01g` — **no FE invent** |
| AC-PLT-ATT-LEAVE-BAL-01H honesty | false · engine HOLD · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine | 🟢 **ACCEPT** |
| Peer leave-type/CODE/WS/SHIFT/FE HOLDs | seals | 🟢 **SEAL RETAIN** |
| invent ready / module ATT UAT / engine LIVE / KEY Network LIVE / Phase1 / UF 🟢 | Explicit DENIED | 🟢 **DENIED promote** |
| QA pack 2/8 miss | verify exit 1 | 🟡 **PROCESS OBS** — QC consolidates |
| Live L0 | hrm/portal/xbos **200** | 🟢 ENV OK |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim F-ATT-LEAVE-04 LIVE · claim invent KEY Network LIVE without wire · claim module ATT UAT DONE · reopen leave-type/CODE/WS/SHIFT L1 · invent FE ATT-CODE HOLD · seed · UF 🟢 · treat L1 GWC as module GO · Phase1 DONE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim F-ATT-LEAVE-04 engine LIVE? | **NO** |
| May PM claim invent `HRM-ATT-LVRULE-KEY` Network LIVE / AC-01b sealed? | **NO** — until CNS-WIRE QA retest proves KEY |
| May PM reopen leave-type / ATT-CODE / WS / SHIFT / FE HOLDs? | **NO** |
| May PM claim module ATT UAT / Phase1 / UF 🟢 from this L1? | **NO** |
| May PM seal ATT-LEAVE-BALANCE Nest Option B **admin L1** slice? | **YES** — this seat GWC |
| May PM invent FE Task as mandatory for L1 GO? | **NO** — R-PLT-ATT-LVRULE-FE-01g = **CONDITION HOLD P2** only |
| Why | `C-SLICE-≠-MODULE` · admin Nest L1 ≠ invent KEY Network · ≠ attendance module UAT |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** · **`payroll_e2e_ready=false` LOCKED** · engine HOLD |
| Forced residual dispatch this turn? | **YES** — **dev-be** `R-PLT-ATT-LVRULE-CNS-WIRE` (mandatory P1) · **U88** ≥1 **sa** / **ba-*** next vertical (not idle on seat seal) · ba-docs DOC-DELTA may follow after KEY wire or parallel |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA-01 Option B | `…-ATT-LEAVE-BALANCE-SA-01.md` | CONFIRMED LOCKED | **ACCEPT** (cited) |
| BA-01 AC pack | `…-ATT-LEAVE-BALANCE-BA-01.md` | CONFIRMED | **ACCEPT** |
| DATA-01 | Nest `att_leave_accrual_policy` ADD | CONFIRMED (BE cite) | **ACCEPT** |
| BE-01 | F-ATT-LVRULE-01..04 · helper KEY · jest · residual wire | READY_FOR_QA | **ACCEPT** |
| QA-01 | `…-att-leave-balance-qa-01.md` | PASS_TO_PM · `ATTLVRULEQA-MSK6G783` | **ACCEPT** |
| Machine JSON | `_tmp-…-att-leave-balance-qa-01.json` | PASS · honesty false · 01b FAIL_GAP_WIRE | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` + `residual_section` (2/8) | 🟡 **PROCESS OBS** — QC consolidates |
| Live L0 hrm / portal / xbos | `:28001/api/hrm` · `:5173` · `:28002/api/xbos` | **200** / **200** / **200** | 🟢 ENV OK |
| KEY + assert spot | constants + service assert · controller grant ABSENT | PRESENT · wire ABSENT | 🟢 / 🟡 Condition |

### Machine JSON spot (`ATTLVRULEQA-MSK6G783`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTLVRULEQA-MSK6G783` | 🟢 |
| `overall` / `ack_status` | **PASS** · **PASS_TO_PM** | 🟢 |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.F_ATT_LEAVE_04_engine_LIVE` | **HOLD** | 🟢 |
| `honesty.C_SLICE_NE_MODULE` | **true** | 🟢 |
| `honesty.U65_zero_seed` | **true** | 🟢 |
| `dist_fe.dist_has_lvrule_key` / `service_has_assert` | **true** | 🟢 |
| `dist_fe.controller_assert_consumer_wired` | **false** | 🟡 Condition wire |
| `val.AC-PLT-ATT-LEAVE-BAL-01d` | POST **201** · F5 PASS | 🟢 |
| `val.AC-PLT-ATT-LEAVE-BAL-01b` | `network_key_hit=false` · FAIL_GAP_WIRE | 🟡 **MANDATORY Condition** |
| `val.AC-PLT-ATT-LEAVE-BAL-01e` | soft-retire PASS | 🟢 |
| `val.VAL-ATT-LVRULE-CNS-09` | **400** TYPE | 🟢 |
| `val.AC-PLT-ATT-LEAVE-BAL-01f` | **400** UNKNOWN | 🟢 |
| `val.AC-PLT-ATT-LEAVE-BAL-01c` | NOTE_BLOCKED | 🟡 ACCEPT |
| `val.AC-PLT-ATT-LEAVE-BAL-01g` | HOLD | 🟡 CONDITION P2 |
| `residuals` | CNS-WIRE · FE-01g · engine OUT | 🟡 named |

---

## Gate AC audit (AC-PLT-ATT-LEAVE-BAL-01*)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01d | Admin CREATE Nest N+1 → 2xx · F5 list/EFF | POST **201** · F5 hit | 🟢 **ACCEPT** |
| 01e | Soft-retire → hide default/resolve · include_inactive | retire **201** · hide/show/eff | 🟢 **ACCEPT** |
| CNS-09 | Admin orphan type → `HRM-ATT-LVRULE-TYPE` | **400** TYPE · no persist | 🟢 **ACCEPT** |
| 01f | Leave TXN invent type → `HRM-LEAVE-TYPE-UNKNOWN` RETAIN | **400** UNKNOWN | 🟢 **ACCEPT** |
| CNS-03 U19 | get-by-id OOS / fake | **404** / **409** | 🟢 **ACCEPT** |
| 01b | Invent → Network **4xx `HRM-ATT-LVRULE-KEY`** | helper+jest LIVE · Network KEY **ABSENT** | 🟡 **CONDITION MANDATORY P1** — **not** KEY LIVE seal |
| 01c | Empty invent skip · no seed | baseline 0 · NOTE_BLOCKED · jest CNS-05 | 🟡 **ACCEPT NOTE_BLOCKED** |
| 01g | Panel ⊆ EFF · kill MVP-five sole | MVP residual · FE HOLD | 🟡 **CONDITION P2 HOLD** — **no FE invent** |
| 01H | Honesty / seals | false · engine HOLD · RETAIN · C-SLICE | 🟢 **ACCEPT** |
| — | invent ready / module ATT UAT / engine LIVE / KEY Network LIVE / Phase1 / UF 🟢 / reopen seals | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA | QC |
|-----------------|-------|-----|-----|
| **ATT-LEAVE-BALANCE Nest Option B admin L1** (01d/e · TYPE · UNKNOWN · U19) | SA/BA/DATA/BE CONFIRMED | 🟢 PASS L1 admin | 🟢 **PASS / ACCEPT** |
| Invent KEY Network (AC-01b / VAL-CNS-01) | BE helper+jest · residual wire | 🟡 FAIL_GAP_WIRE | 🟡 **CONDITION MANDATORY** R-PLT-ATT-LVRULE-CNS-WIRE |
| FE admin «Quy tắc quỹ phép» + grant bind + panel 01g | residual | 🟡 HOLD | 🟡 **CONDITION P2 HOLD** — **not** L1 NO-GO · **no FE invent** |
| J-HRM-ATT-LVRULE-* / UF-HRM / J-HRM-06* / module ATT UAT | Proposed BA | **not executed** | ⬜ **DEFERRED** — **DENY promote** |
| Leave-type / ATT-CODE / WS / SHIFT / FE HOLDs | Prior GWC | cite RETAIN only | 🟢 **SEAL RETAIN** — **DENY reopen** |

**U19 note:** This gate certifies the **ATT leave accrual policy Nest Option B admin L1** slice named in dispatch — **not** invent KEY Network LIVE, browser UF, J-*, or module ATT UAT. Missing Network KEY does **not** NO-GO admin L1 when helper+jest prove contract and QA did not claim KEY LIVE; it **forces GWC CONDITION MANDATORY P1** (CNS-WIRE → **dev-be**) and keeps attendance/payroll ready=false · engine HOLD.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-ATT-LVRULE-CNS-WIRE** | QA Condition · BE residual wire | **CONDITION MANDATORY P1** — owner **dev-be** — wire `assertLeaveAccrualPolicyForConsumer` on grant/adjust (or gated leave body) → Network **4xx `HRM-ATT-LVRULE-KEY`** · then QA retest 01b |
| **R-PLT-ATT-LVRULE-FE-01g** | QA P2 HOLD | **CONDITION HOLD P2** — owner **dev-fe** note only — **do not invent FE** as L1 mandatory |
| **01c NOTE_BLOCKED** | baseline empty · no wipe | **ACCEPT** — jest CNS-05 cite · no seed/wipe |
| **F-ATT-LEAVE-04** | OUT HOLD | **RETAIN HOLD** — DENIED LIVE claim |
| QA pack command_table + residual_section miss | verify 2/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Stale-dist / product P0 admin path | — | **NONE** on admin L1 |
| Peer leave-type/CODE/WS/SHIFT/FE HOLDs | must_keep | **SEAL RETAIN** — **FORBIDDEN reopen** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA L1 PASS stamp `ATTLVRULEQA-MSK6G783` admin path | PRODUCT PASS | Yes → GWC ACCEPT admin L1 SEAL |
| Admin 201 · soft-retire · TYPE · UNKNOWN · U19 | PRODUCT PASS | Yes → 01d/e/f · CNS-09/03 |
| Dist KEY + helper + jest invent KEY | PRODUCT PASS (contract) | Yes → supports GWC not NO-GO |
| Invent KEY Network ABSENT (grant 404 · VAL-001) | PRODUCT CONDITION | Yes → GWC **mandatory P1** CNS-WIRE (not KEY LIVE) |
| FE 01g MVP / admin HOLD | PRODUCT CONDITION | Yes → GWC P2 HOLD · no invent FE |
| Honesty / ready / engine / seal reopen / UF 🟢 | PRODUCT DENIED | Yes → CONDITIONS |
| QA pack 2/8 miss | PROCESS OBS | No — QC consolidates |
| Live L0 200 | ENV OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-ATT-LVRULE-CNS-WIRE** | **P1 MANDATORY** | **dev-be** | Wire `assertLeaveAccrualPolicyForConsumer` on grant/adjust (or gated leave mutate body) so Network emits **`HRM-ATT-LVRULE-KEY`** when active>0 invent; QA retest AC-01b before claiming KEY LIVE |
| **R-PLT-ATT-LVRULE-FE-01g** | P2 HOLD | **dev-fe** (later) | Admin «Quy tắc quỹ phép» + grant bind + panel ⊆ EFF (kill MVP-five sole) — **HOLD** · **do not invent FE** this turn as L1 mandatory |
| **01c NOTE_BLOCKED** | cite | qa | Empty invent-skip isolate without wipe — ACCEPT |
| **F-ATT-LEAVE-04** | OUT HOLD | — | Accrue engine LIVE **DENIED** |
| **Honesty / C-SLICE** | — | **pm** | Keep ready=false · no module ATT UAT / Phase1 invent · no seal reopen · no KEY LIVE claim until wire retest |
| Peer seals leave-type/CODE/WS/SHIFT/FE HOLDs | must_keep | — | **do not reopen** · **do not invent FE ATT-CODE** |
| **U88 continuous** | — | **pm** | After GWC: Task **dev-be** CNS-WIRE (mandatory) **and** ≥1 **sa** / **ba-process|ba-data** next vertical — do not idle program on this seat seal alone · ba-docs DOC-DELTA Nest F-ATT-LVRULE admin after KEY wire or parallel |

**No residual P0 on Nest admin L1 AC pack (01d/e/TYPE/UNKNOWN/U19).** Residual P1 = invent KEY Network wire (AC-01b core) — **mandatory** for claiming KEY LIVE · **not** blocking admin L1 GWC.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 admin Nest · KEY wire Condition · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-PLT-ATT-LEAVE-BAL-01* / VAL-ATT-LVRULE-CNS matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ attendance/payroll=false · engine HOLD · seals RETAIN · C-SLICE · KEY Network DENIED |
| 7 | Residual section | ✅ CNS-WIRE P1 · FE-01g P2 HOLD · engine OUT · U88 · seals retain |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md` | exit **1** · missing `command_table` + `residual_section` (2/8) | **PROCESS OBS** — QA seat |
| Live L0 `GET :28001/api/hrm` · `:5173` · `:28002/api/xbos` | **200** / **200** / **200** | ENV OK |
| Spot: machine `ATTLVRULEQA-MSK6G783` · `network_key_hit=false` · admin 201 | cited | PRODUCT audit |
| Spot: `assertLeaveAccrualPolicyForConsumer` in service · no grant route in controller | helper LIVE · wire ABSENT | PRODUCT Condition |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md` | (re-run after write) | QC pack SoT |

---

## completion_report

**Closed:** Narrow GWC on ATT leave accrual policy Nest Option B **admin L1** — ACCEPT stamp `ATTLVRULEQA-MSK6G783` · 01d CREATE N+1 · 01e soft-retire · orphan TYPE · type invent UNKNOWN RETAIN · U19 · dist KEY + jest contract · honesty false · peer seals RETAIN · C-SLICE · U65 · DENIED ready/engine/module/UF/KEY-Network-LIVE claims · QC pack 8/8 consolidate.

**Open / Conditions:**
1. **R-PLT-ATT-LVRULE-CNS-WIRE** — **P1 MANDATORY** · **dev-be** (AC-01b core — Network KEY still ABSENT)
2. **R-PLT-ATT-LVRULE-FE-01g** — P2 HOLD · **dev-fe** (do not invent)
3. **01c NOTE_BLOCKED** — ACCEPT
4. **F-ATT-LEAVE-04** engine LIVE — HOLD OUT
5. Peer seals / FE HOLDs — RETAIN

**next_owner:** **pm** (dispatch #1 **dev-be** + #2 **sa/ba** U88)

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md`

### next_dispatch_prompt #1 (copy-ready — mandatory residual)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01 GWC Condition R-PLT-ATT-LVRULE-CNS-WIRE
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md (01b FAIL_GAP_WIRE)
  - Helper assertLeaveAccrualPolicyForConsumer + jest CNS-01 LIVE; HTTP grant/adjust/assert ABSENT
  - Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · engine LIVE HOLD · C-SLICE
  - RETAIN: leave-type UNKNOWN · ATTCODEQA-MSK4T1A5 · ATT-WS · ATTSHIFTQA-MSK5FXP3 · FE HOLDs · admin L1 seal (cấm reopen)
task:
  - Wire assertLeaveAccrualPolicyForConsumer on grant/adjust (or gated leave mutate body) when product surface ships
  - When active policy for type >0: invent policy_id / ad-hoc accrual mode|days → Network 4xx HRM-ATT-LVRULE-KEY · no persist
  - Orthogonal: leave_type invent still HRM-LEAVE-TYPE-UNKNOWN · admin orphan still HRM-ATT-LVRULE-TYPE
  - Jest + READY_FOR_QA; DENY flip ready · engine LIVE · reopen seals · invent FE · seed
exit: READY_FOR_QA with Network invent KEY path documented
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-02.md
```

### next_dispatch_prompt #2 (copy-ready — U88 continuous)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-NEXT-VERTICAL-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01 GWC · U88 continuous
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md (GWC admin L1 · CNS-WIRE Condition)
  - Read docs/program/PO_HRM_CONTINUOUS_W8_20260807.md + continuous board residual
  - Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
  - RETAIN: ATT leave-type/CODE/WS/SHIFT L1 · leave-balance admin L1 GWC · FE HOLDs · DENY reopen
task:
  - Open next platform vertical Option/F.1 delta hẹp (peer ATT→REC→EMP→QSĐ/DEC → MergeToken/CTR/INS or board top residual)
  - Lock Option A/B · invent KEY class · admin≠consumer · DENY mega-EAV · DENY flip ready
  - Unlock ba-process AC pack or ba-data physical per Option; BE HOLD until BA+DATA if Nest DEFINE
exit: CONFIRMED Option + next_dispatch ba-process|ba-data
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-next-vertical-sa-01.md
```

**Alternate #2 (docs):** if PM prefers DOC-DELTA before next vertical — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DOCS-01` **ba-docs** Nest F-ATT-LVRULE-01..04 admin · KEY Condition cite · engine HOLD · C-SLICE (after or parallel CNS-WIRE).
