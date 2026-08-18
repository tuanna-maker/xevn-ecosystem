# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **Condition close only** · **R-PLT-ATT-SHIFT-CNS-02** · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01` PASS_TO_PM stamp **`ATTSHIFTQAFE-MSK6AJ8Z`** |
| **retain** | QC-01 GWC L1 stamp **`ATTSHIFTQA-MSK5FXP3`** · **FORBIDDEN reopen** invent KEY L1 |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | Browser CNS-02 Nest picker + Nest code submit **PASS** (Đổi ca) · **N/A deferred** J-HRM-ATT-SHIFT-CAT-* / module ATT UAT · **DENY** promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | Spot **VAL-ATT-SHIFT-CNS-02** · **AC-PLT-ATT-SHIFT-01 submit/FE+F5** · **01c NOTE_BLOCKED** · **01H honesty** — QA-01 L1 invent KEY **RETAIN** |
| **Verdict** | **GO WITH CONDITIONS** — Condition **R-PLT-ATT-SHIFT-CNS-02 CLOSED ACCEPT** · QC-01 ATT-SHIFT L1 **SEAL RETAIN** · CONDITION residual: honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE/`leave`/WS/EMP/SI/CTR · aggregate · ATT-CODE FE HOLD **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.md) |
| **qc01_ref** | [`po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md) **GWC RETAIN** — L1 **not reopened** |
| **fe_ref** | [`po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md) READY · Nest EFF rebind |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01-browser.json`](_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01-browser.json) · stamp **`ATTSHIFTQAFE-MSK6AJ8Z`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01/` (`03` tab · `04` dialog Nest · `05` after 2xx · `06` F5) |
| **stamp_ref** | QA-FE `ATTSHIFTQAFE-MSK6AJ8Z` · L1 RETAIN `ATTSHIFTQA-MSK5FXP3` · commit `dc930c5` |
| **spec_ref** | VAL-ATT-SHIFT-CNS-02 · AC-PLT-ATT-SHIFT-01 · QC-01 Condition R-PLT-ATT-SHIFT-CNS-02 · FE-01 Nest rebind |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · invent API spot ≠ UF 🟢 |
| **OS honesty** | `C-SLICE-≠-MODULE` — CNS-02 FE CLOSED ≠ `attendance_uat_ready` / module ATT UAT / Phase1 / reopen L1 KEY |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| QC-01 GWC L1 · stamp `ATTSHIFTQA-MSK5FXP3` | **SEAL RETAIN** | **FORBIDDEN reopen** invent KEY L1 |
| ATT-CODE `ATTCODEQA-MSK4T1A5` · R-PLT-ATT-CODE-FE-01 HOLD | **SEAL RETAIN** | **cấm reopen L1** · **cấm invent FE ATT-CODE HOLD** |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** | **cấm reopen** |
| ATT worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** | **cấm reopen** |
| EMP / SI / CTR / PAY / LIST-TOTALS · aggregate GĐ1 | **SEAL RETAIN** | **cấm reopen** |
| **R-PLT-ATT-SHIFT-CNS-02** | **CLOSED** | Nest EFF picker + Nest code submit proven — **RETAIN closed** |
| AC-PLT-ATT-SHIFT-01c empty | **NOTE_BLOCKED ACCEPT** | no wipe/seed |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 module / Phase1** | **DENIED** | CNS-02 slice ≠ module GO |
| **Seed** | **DENIED** (U65) | QA + machine · no seed |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | FE CNS-02 ≠ module ATT UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — CLOSE only QC-01 Condition **R-PLT-ATT-SHIFT-CNS-02** after QA-FE stamp **`ATTSHIFTQAFE-MSK6AJ8Z`** (`overall=PASS` · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `c_slice_ne_module=true` · U65 zero-seed · residual CNS-02 **CLOSED**). Audited QA-FE MD + FE-01 READY + QC-01 GWC + machine JSON + screens `03`–`06` + live L0 hrm/xbos/portal **200**. Proven browser U65: Nest EFF **N=2** (admin FE CREATE earlier session, no seed) → Đổi ca picker Nest display-ready labels (`QA FE Ca Nest B msk66y0i (14:00 - 22:00)` · `QA FE Ca Nest msk64coh (08:00 - 17:00)`) · `onlyBootText=false` · GET EFF **200** `HRM-WS-200` → submit POST body Nest **codes** `qa_fe_shift_b_msk66y` / `qa_fe_shift_msk64coh` → **201** `HRM-SC-201` → FE list + **F5** retain Nest labels (list total=1). **L1 invent KEY stamp `ATTSHIFTQA-MSK5FXP3` SEAL NOT reopened.** 01c empty **NOTE_BLOCKED ACCEPT**. Invent spot API **400** `HRM-VAL-001` (not UF; KEY cite L1). QA-FE pack verify **1/8** missing `journey_l25` = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** ready flips · invent FE ATT-CODE HOLD · reopen ATT-CODE L1 / leave / WS / EMP / SI / CTR / aggregate · module ATT UAT · Phase1 DONE · seed · UF 🟢 module. **NOT Phase 1 DONE.** Residual product Conditions on ATT-SHIFT seat = **none** (CNS-02 closed); residual = **honesty locks only**.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTSHIFTQAFE-MSK6AJ8Z` · overall PASS | machine `overall=PASS` · residual CNS-02 CLOSED | 🟢 **ACCEPT** |
| **VAL-ATT-SHIFT-CNS-02** picker Nest | nestNames=2 · onlyBootText=false · time labels | 🟢 **ACCEPT** |
| **AC-PLT-ATT-SHIFT-01 submit** Nest code | POST **201** `HRM-SC-201` · nestBody=true | 🟢 **ACCEPT** |
| **FE + F5** | feShowsNest · f5ok · list total=1 | 🟢 **ACCEPT** |
| **AC-PLT-ATT-SHIFT-01c** empty | NOTE_BLOCKED · no wipe | 🟢 **ACCEPT** documented |
| **AC-PLT-ATT-SHIFT-01H** honesty | false · seals RETAIN · C-SLICE · U65 | 🟢 **ACCEPT** |
| **R-PLT-ATT-SHIFT-CNS-02** | Browser Nest picker + Nest code submit | ✅ **CLOSED ACCEPT** |
| L1 stamp `ATTSHIFTQA-MSK5FXP3` | Explicit RETAIN | 🟢 **RETAIN — not reopened** |
| FE-01 READY Nest rebind | ShiftChange → EFF when active>0 | 🟢 **ACCEPT closed** |
| invent ready / module ATT UAT / Phase1 / invent FE ATT-CODE | Explicit DENIED | 🟢 **DENIED promote** |
| QA-FE pack journey_l25 miss | verify exit 1 · 1/8 | 🟡 **PROCESS OBS** — QC consolidates |
| L0 hrm / xbos / portal | **200 / 200 / 200** | 🟢 ENV OK |
| J-HRM-ATT-SHIFT-CAT-* / module ATT UAT | deferred / honesty | 🟢 **DENY promote** |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim module ATT UAT DONE · reopen L1 invent KEY `ATTSHIFTQA-MSK5FXP3` · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · reopen leave/WS/EMP/SI/CTR/aggregate · seed as evidence · treat Condition CLOSED as module GO · Phase1 DONE · UF 🟢 module promote.

### Conditions closed this seat

| ID | Prior (QC-01) | QC-02 disposition |
|----|---------------|-------------------|
| **R-PLT-ATT-SHIFT-CNS-02** | CONDITION P2 · owner dev-fe | ✅ **CLOSED ACCEPT** — QA-FE browser Nest EFF picker + Nest code POST 201 + FE+F5 |

### Conditions remaining (honesty only)

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| Honesty / `C-SLICE-≠-MODULE` | — | **pm** | Keep `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no module ATT UAT / Phase1 · no peer seal reopen · no invent FE ATT-CODE HOLD |
| Peer seals ATT-CODE/leave/WS/EMP/SI/CTR/agg · L1 KEY | must_keep | — | **do not reopen** |

**No residual P0/P1/P2 product** on ATT-SHIFT Condition seat after CNS-02 close.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM reopen L1 invent KEY / ATT-CODE / leave / WS / EMP / SI / CTR / aggregate? | **NO** |
| May PM invent FE ATT-CODE HOLD? | **NO** |
| May PM claim module ATT UAT / Phase1 / UF 🟢 module? | **NO** |
| May PM mark **R-PLT-ATT-SHIFT-CNS-02 CLOSED**? | **YES** — this seat |
| May PM retain QC-01 ATT-SHIFT L1 SEAL `ATTSHIFTQA-MSK5FXP3`? | **YES** — unchanged |
| Why | `C-SLICE-≠-MODULE` · FE CNS-02 CLOSED ≠ module ATT UAT |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** · **`payroll_e2e_ready=false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — prefer peer **`qa`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01` (BE READY) — do not idle program on seat seal alone |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 GWC L1 | `…-att-shift-catalog-qc-01.md` | GWC · CNS-02 Condition | 🟢 **RETAIN — L1 not reopened** |
| FE-01 Nest rebind | `…-att-shift-catalog-fe-01.md` | READY · closes CNS-02 | 🟢 **ACCEPT closed** |
| QA-FE-01 | `…-att-shift-catalog-qa-fe-01.md` | PASS_TO_PM · `ATTSHIFTQAFE-MSK6AJ8Z` | 🟢 **ACCEPT** |
| Machine JSON | `_tmp-…-qa-fe-01-browser.json` | PASS · Nest picker + 201 Nest code · F5 | 🟢 **ACCEPT** |
| Screens 03–06 | `screens/…-qa-fe-01/` | tab · dialog Nest · after 2xx · F5 | 🟢 **ACCEPT** |
| Pack verify QA-FE | `verify:qc:evidence-pack` | exit **1** · missing `journey_l25` (1/8) | 🟡 **PROCESS OBS** — QC consolidates |
| L0 hrm / xbos / portal | `:28001` · `:28002` · `:5173` | **200 / 200 / 200** | 🟢 ENV OK |
| Peer ATT-CODE/leave/WS/EMP/SI/CTR/agg | prior GWC | cited honesty | 🟢 **SEAL RETAIN** |

### Machine JSON spot (`ATTSHIFTQAFE-MSK6AJ8Z`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTSHIFTQAFE-MSK6AJ8Z` | 🟢 |
| `overall` / `ack_status` | **PASS** · **PASS_TO_PM** | 🟢 |
| `stamp_l1_retain` | `ATTSHIFTQA-MSK5FXP3` | 🟢 |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.seed_used` / `ensureDefault` | **false** / **false** | 🟢 |
| `honesty.deny_invent_fe_att_code` | **true** | 🟢 |
| `ac.VAL-ATT-SHIFT-CNS-02-picker` | PASS · nestNames=2 · onlyBootText=false | 🟢 |
| `ac.AC-PLT-ATT-SHIFT-01-submit` | **201** `HRM-SC-201` · nestBody · Nest codes | 🟢 |
| `ac.AC-PLT-ATT-SHIFT-01-fe-f5` | feShowsNest · f5ok | 🟢 |
| `ac.AC-PLT-ATT-SHIFT-01c-empty` | **NOTE_BLOCKED** | 🟢 ACCEPT |
| `residual[R-PLT-ATT-SHIFT-CNS-02]` | **CLOSED** | 🟢 |
| `consoleErrors` / `pageErrors` / `bad5xx` | empty | 🟢 |

---

## Gate AC audit (CNS-02 close scope)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| CNS-02 / 01 | Nest EFF picker when active>0 ≠ closed 5-id sole | 2 Nest name+time labels · onlyBootText=false | 🟢 **ACCEPT** |
| 01 submit | Nest **code** in POST · 2xx | **201** `HRM-SC-201` · codes in body | 🟢 **ACCEPT** |
| FE + F5 | list persist Nest labels | feShowsNest · f5ok · total=1 | 🟢 **ACCEPT** |
| 01d admin Nest | active>0 via FE Ca CREATE (session) | N=2 · no seed | 🟢 **ACCEPT** (cited) |
| 01c empty | bootstrap without wipe | NOTE_BLOCKED | 🟢 **ACCEPT** |
| 01b invent | prefer L1 KEY seal | API 400 VAL-001 · not UF · L1 RETAIN | ⬜ HOLD cite L1 |
| 01H | Honesty / seals | false · RETAIN · C-SLICE · U65 | 🟢 **ACCEPT** |
| — | invent ready / module ATT UAT / Phase1 / invent FE ATT-CODE / reopen L1 / seed | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-FE | QC |
|-----------------|-------|-------|-----|
| **ATT-SHIFT L1** invent KEY + admin N+1 + soft-retire | QC-01 GWC | RETAIN | 🟢 **SEAL RETAIN** |
| Browser `ShiftChangeRequestTab` Nest EFF + Nest code submit | R-PLT-ATT-SHIFT-CNS-02 | 🟢 PASS stamp FE | ✅ **CLOSED ACCEPT** |
| J-HRM-ATT-SHIFT-CAT-* / UF-HRM / module ATT UAT | Proposed BA | **not claimed** | ⬜ **DEFERRED** — **DENY promote** |
| ATT-CODE / leave / worksite / EMP / SI / CTR / aggregate | Prior GWC | cite RETAIN | 🟢 **SEAL RETAIN** |

**U19 note:** This gate closes **R-PLT-ATT-SHIFT-CNS-02** only (browser Nest picker + Nest code submit). It does **not** certify module ATT UAT or invent PROGRAM_JOURNEY_MAP J-* rows absent from map. Missing module J-* does **not** NO-GO this Condition close; it keeps ready=false and **C-SLICE**.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-ATT-SHIFT-CNS-02** | QC-01 CONDITION P2 · FE hardcode | ✅ **CLOSED ACCEPT** — QA-FE browser Nest EFF + Nest code 201 + F5 |
| AC-PLT-ATT-SHIFT-01c | NOTE_BLOCKED | **ACCEPT** — empty not isolatable without wipe/seed |
| QA-FE pack missing journey_l25 | verify 1/8 | **PROCESS OBS** — QC consolidates 8/8 (`journey_l25` N/A deferred + CNS-02 PASS stated) |
| Peer ATT-CODE/leave/WS/EMP/SI/CTR/agg · L1 KEY | must_keep | **SEAL RETAIN** — **FORBIDDEN reopen** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA-FE PASS stamp `ATTSHIFTQAFE-MSK6AJ8Z` · CNS-02 CLOSED | PRODUCT PASS | Yes → Condition CLOSE |
| Nest picker labels + Nest code POST 201 + FE+F5 | PRODUCT PASS | Yes → VAL-CNS-02 / submit |
| L1 `ATTSHIFTQA-MSK5FXP3` RETAIN | PRODUCT PASS | Yes → must_keep |
| 01c NOTE_BLOCKED documented | PRODUCT ACCEPT | Yes → no wipe/seed |
| Honesty / ready flips / seal reopen / invent FE ATT-CODE | PRODUCT DENIED | Yes → CONDITIONS remaining |
| QA-FE pack journey_l25 miss | PROCESS OBS | No — QC consolidates |
| L0 200 | ENV OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no module ATT UAT / Phase1 invent · no ATT-CODE/leave/WS/EMP/SI/CTR/agg reopen · no invent FE ATT-CODE HOLD · L1 KEY RETAIN |
| Peer seals + L1 KEY | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Prefer **`qa`** leave-balance L1 (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01` — BE READY) — do not idle program on this seat seal alone |

**No residual P0/P1/P2 product** on ATT-SHIFT CNS-02. Full **module GO** still blocked by honesty / C-SLICE (not by open FE Condition).

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-02` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ Browser CNS-02 Nest picker **PASS** · J-HRM-ATT-SHIFT-CAT-* / module ATT UAT **N/A deferred DENY** |
| 4 | crud_or_matrix | ✅ VAL-CNS-02 · submit Nest code · FE+F5 · 01c · 01H |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ attendance/payroll=false · ATT-CODE/leave/WS/EMP/SI/CTR/agg · L1 RETAIN · C-SLICE |
| 7 | Residual section | ✅ honesty only · U88 leave-balance QA · seals retain |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · Conditions closed: R-PLT-ATT-SHIFT-CNS-02 · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.md` | exit **1** · missing `journey_l25` (1/8) | **PROCESS OBS** — QA-FE seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qc-02.md` | exit **0** · **PASS** · **8/8** (re-run after write) | QC pack SoT |
| QA-FE runner stamp `ATTSHIFTQAFE-MSK6AJ8Z` | **PASS** · Nest picker · Nest code 201 · F5 · CNS-02 CLOSED | PRODUCT OK (cited machine JSON) |
| QC L0 `pnpm run qc:dev-stack` | hrm/xbos/portal **200 / 200 / 200** | ENV OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + L0 spot.

**L2.5 / journey:** CNS-02 browser Đổi ca Nest path **PASS** in-scope. Module J-* / ATT UAT = **deferred DENY promote**.

---

## Scope statement (bounded)

**IN scope ACCEPT:** Close **R-PLT-ATT-SHIFT-CNS-02** after QA-FE Nest EFF picker + Nest code submit 201 + FE+F5 · L1 `ATTSHIFTQA-MSK5FXP3` RETAIN · 01c NOTE_BLOCKED · honesty locks · C-SLICE.

**OUT of scope / DENIED:** Module ATT UAT · `attendance_uat_ready` / `payroll_e2e_ready` flip · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · reopen leave/worksite/EMP/SI/CTR · aggregate rewrite · Phase 1 DONE · seed · claim UF 🟢 module · reopen L1 invent KEY.

---

## completion_report

### Closed

1. Narrow QC Condition close for **R-PLT-ATT-SHIFT-CNS-02** complete — **CLOSED ACCEPT**.
2. QA-FE stamp **`ATTSHIFTQAFE-MSK6AJ8Z`** · browser U65 Nest picker labels + Nest code POST **201** `HRM-SC-201` · FE+F5 **ACCEPT**.
3. L1 invent KEY stamp **`ATTSHIFTQA-MSK5FXP3` SEAL RETAIN** — **not reopened**.
4. 01c NOTE_BLOCKED **ACCEPT** (no wipe/seed).
5. L0 **200/200/200**.
6. Seals retained: ATT-CODE `ATTCODEQA-MSK4T1A5` · leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` · EMP/SI/CTR · aggregate · ATT-CODE FE HOLD **not invented**.
7. Honesty locked: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · DENIED module ATT UAT / Phase1 / UF 🟢 module / invent FE ATT-CODE HOLD.
8. Verdict **GO WITH CONDITIONS** — Conditions closed list: **R-PLT-ATT-SHIFT-CNS-02**; residual = honesty locks only. **NOT Phase 1 DONE.** **NOT module ATT UAT.**

### Residual

- **CONDITION (honesty only):** `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` · peer seals + L1 KEY RETAIN · DENIED invent FE ATT-CODE.
- **U88 continuous:** next prefer **`qa`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01` (BE READY) — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`qa`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01` · honesty false · cấm reopen ATT-SHIFT L1 / ATT-CODE / leave-type / WS · cấm invent FE ATT-CODE HOLD · U88 continuous

---

## next_dispatch_prompt (copy-ready — prefer leave-balance QA peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01 READY_FOR_QA
ref_be: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-01.md
ref_peer_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qc-02.md
stamp_peer: ATTSHIFTQAFE-MSK6AJ8Z · ATTSHIFTQA-MSK5FXP3 RETAIN · ATTCODEQA-MSK4T1A5 SEAL

## entry_criteria
- Read BE-01 READY + BA-01 CONFIRMED + DATA-01 CONFIRMED · Option B Nest att_leave_accrual_policy
- L0 stack if needed; U65 zero-seed
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · F-ATT-LEAVE-04 engine LIVE HOLD · C-SLICE-≠-MODULE
- RETAIN: leave-type invent HRM-LEAVE-TYPE-UNKNOWN · ATT-CODE/WS/SHIFT L1 seals · FE HOLDs · ATT-SHIFT CNS-02 CLOSED (do not reopen)

## task
1) L1 invent KEY LIVE: when ≥1 active policy for type, invent policy_id / ad-hoc accrual mode|days → Network 4xx HRM-ATT-LVRULE-KEY
2) Admin CREATE N+1 bound EFF leave_type_key → 2xx · F5 list · resolve effective sees row
3) Soft-retire → default resolve hides · include_inactive OK
4) Empty active → soft empty · no seed
5) Orphan admin type → 4xx HRM-ATT-LVRULE-TYPE
6) RETAIN: leave-type invent still HRM-LEAVE-TYPE-UNKNOWN · ATT-CODE/WS/SHIFT seals · FE HOLDs · no engine LIVE claim · no flip ready

## cấm
seed · flip attendance_uat/payroll_e2e · reopen ATT-SHIFT L1 / ATT-CODE L1 / leave-type L1 · invent FE ATT-CODE HOLD · claim module ATT UAT · Phase1 DONE · F-ATT-LEAVE-04 LIVE

## exit
PASS_TO_PM or FAIL_TO_PM
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md
```

---

## Self-check

- [x] Evidence file on disk · CNS-02 CLOSED from browser Nest picker + Nest code 201+F5
- [x] Verdict **GO WITH CONDITIONS** · Conditions closed list named · residual honesty only
- [x] L1 `ATTSHIFTQA-MSK5FXP3` RETAIN · honesty false · seals RETAIN · C-SLICE · DENIED module ATT UAT / Phase1 / invent FE ATT-CODE
- [x] QA-FE pack OBS consolidated · L0 200
- [x] completion_report · next_owner **pm** · next_dispatch_prompt leave-balance QA · ack_status **PASS_TO_PM**
