# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **ATT leave catalog Option B browser AC narrow only** · **not** module ATT UAT |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01` PASS_TO_PM stamp **`ATTLEAVEQA-MSJ7CPJH`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — ATT leave catalog admin open + consumer EFF picker invent KEY (U65) · **no** J-HRM-06c reopen / promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-ATT-LEAVE-01 / 01b / 01c / 01d / 01H · 05b / 09 / 07 · VAL-ATT-CNS-04 |
| **Verdict** | **GO WITH CONDITIONS** — ATT-LEAVE-CATALOG **SEAL ACCEPT** · CONDITION: honesty `attendance_uat_ready=false` · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · ATT-QC-01/02 + peer seals **RETAIN** · OBS 01c empty branch **idle-ok** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md`](po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md) |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) **CONFIRMED** |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) Option **B** LOCKED |
| **peer_gwc** | ATT-QC-01 · ATT-QC-02 stamp `ATTPLATQA2-MSIVNE4A` · EMP·DEC·PAY·EXT·CTR·LIST-TOTALS · WAIVE/sign/J-HRM-06c · **SEAL RETAIN** (cấm reopen) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01-browser.json`](_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01-browser.json) · stamp **`ATTLEAVEQA-MSJ7CPJH`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01/` (`01`…`07`) |
| **stamp_ref** | QA `ATTLEAVEQA-MSJ7CPJH` · commit `dc930c5` |
| **spec_ref** | BA-01 AC-PLT-ATT-LEAVE-01* · SA Option B · F-ATT-CAT-LVT/EFF · `HRM-LEAVE-TYPE-UNKNOWN` · VAL-ATT-CNS-04 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — leave catalog GWC ≠ attendance module UAT / Phase1 / reopen WAIVE·sign·J-06c / flip `attendance_uat_ready` |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** | **cấm reopen** |
| **ATT-QC-01 · ATT-QC-02** | **SEAL RETAIN** | 01d = open N+1 spot only — **no wipe** |
| **EMP · DEC · PAY · EXT · CTR · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5 promote (J-HRM-06c)** | **DENIED / deferred** | Out of scope this seat |
| **Seed** | **DENIED** (U65) | QA + machine `seed_used=false` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest EFF picker + invent KEY ≠ module ATT UAT |
| Settings-MD-only picker SoT | **DENIED** | VAL-ATT-CNS-04 PASS |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow ATT leave catalog Option B browser AC after QA stamp **`ATTLEAVEQA-MSJ7CPJH`** (`overall=PASS` · pass **9/9** · fail **0** · honesty `attendance_uat_ready=false` · `seed_used=false`). Audited QA MD + machine JSON + screens `02`/`06` + BA/SA CONFIRMED + live unauth `GET …/leave-types/effective?company_id=main` → **401** + `HRM_LEAVE_TYPE_UNKNOWN` in `att-leave-type.constants.ts`. Proven: Settings Loại phép ATT admin CREATE `hr_leave_cat_msj7cpjh` → **PUT 200** → F5 row (01d · ATT-QC-02 retain); LeaveTab Network **GET** `/leave-types/effective` **200** EFF=8 · MD-alone=false (01 · VAL-ATT-CNS-04); pick UI · panel 05b · sick `lvt_02` 07 · POST leave **201** `HRM-LEAVE-201` + F5 type persist (01 · 09); invent `zz_invent_leave_msj7cpjh` → **400** `HRM-LEAVE-TYPE-UNKNOWN` · no persist (01b). QA pack verify **7/8** missing `command_table` = **PROCESS OBS** — this QC consolidates **8/8**. **OBS-01c** empty EFF branch = **CONDITION idle-ok** (live EFF=8; wipe seals forbidden). **DENIED** `attendance_uat_ready` flip · reopen WAIVE/sign/J-06c · reopen peer/ATT-QC seals · module ATT UAT · Phase1 DONE · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTLEAVEQA-MSJ7CPJH` · 9/9 PASS | machine `overall=PASS` · `probes.rollup.failReq=[]` | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-01d admin CREATE N+1 | PUT **200** · key `hr_leave_cat_msj7cpjh` · screen `02` toast + row | 🟢 **ACCEPT** · ATT-QC-02 RETAIN |
| AC-PLT-ATT-LEAVE-01 EFF picker | GET effective **200** · count=8 · hasNewKey · pick UI | 🟢 **ACCEPT** |
| VAL-ATT-CNS-04 MD-alone denied | Network effective hits≥1 · settingsCatalogHits=0 | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-01 create 2xx/F5 | POST **201** `HRM-LEAVE-201` · F5 found type | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-01b invent | **400** `HRM-LEAVE-TYPE-UNKNOWN` · persist=false | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-05b / 09 / 07 | panel visible · hold after assert · `lvt_02` pick | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-01c empty EFF | Live EFF=8 — empty not forced · CTA wire | 🟡 **CONDITION idle-ok** |
| AC-PLT-ATT-LEAVE-01H honesty | false · seals RETAIN · C-SLICE | 🟢 **ACCEPT** |
| KEY constant present | `HRM_LEAVE_TYPE_UNKNOWN` in constants | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine `seed_used=false` | 🟢 **ACCEPT** |
| Peer / ATT-QC / WAIVE / J-06c | seals | 🟢 **SEAL RETAIN** |
| invent ready / module ATT UAT / Phase1 | Explicit DENIED | 🟢 **DENIED promote** |
| QA pack command_table miss | verify exit 1 · 7/8 | 🟡 **PROCESS OBS** — QC consolidates |
| J-HRM-06c / module ATT UAT | Explicit DENIED | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · claim module ATT UAT DONE · reopen WAIVE/sign/J-HRM-06c · reopen ATT-QC-01/02 · reopen EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · seed as evidence · treat leave-catalog GWC as module GO · wipe GĐ1 seals · flip ready flags.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM reopen leave WAIVE / sign / **J-HRM-06c**? | **NO** |
| May PM reopen ATT-QC-01/02 or EMP/DEC/PAY/EXT/CTR/LIST-TOTALS? | **NO** |
| May PM claim module ATT UAT / Phase1 / J-HRM-06c new GO? | **NO** |
| May PM seal ATT leave catalog Option B browser AC slice? | **YES** — this seat GWC |
| Why | `C-SLICE-≠-MODULE` · Nest EFF picker + invent KEY ≠ attendance module UAT |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** |
| Forced residual dispatch this turn? | **U88** — ≥1 **ba-docs** ATT leave catalog DOC-DELTA · OBS 01c empty **idle-ok** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA-01 Option B | `…-ATT-LEAVE-CATALOG-SA-01.md` | CONFIRMED LOCKED | **ACCEPT** (cited) |
| BA-01 AC pack | `…-ATT-LEAVE-CATALOG-BA-01.md` | CONFIRMED | **ACCEPT** (cited) |
| ATT-QC-01/02 peer | prior GWC stamps | SEAL | **SEAL RETAIN** — not reopened |
| QA-01 | `…-att-leave-catalog-qa-01.md` | PASS_TO_PM · `ATTLEAVEQA-MSJ7CPJH` | **ACCEPT** |
| Machine JSON | `_tmp-…-qa-01-browser.json` | PASS · 9/9 · fail 0 | **ACCEPT** |
| Screens | `02` admin create · `06` picker selected | path present | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · missing `command_table` | 🟡 **PROCESS OBS** — QC consolidates |
| Live unauth spot (QC) | `GET …/leave-types/effective?company_id=main` | **401** | 🟢 OK (not 404/500) |
| L0 portal / hrm health | `:5173` · `:28001/api/hrm` | **200** | 🟢 ENV OK |
| KEY constant | `att-leave-type.constants.ts` | `HRM_LEAVE_TYPE_UNKNOWN` | 🟢 |

### Machine JSON spot (`ATTLEAVEQA-MSJ7CPJH`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTLEAVEQA-MSJ7CPJH` | 🟢 |
| `overall` / rollup | **PASS** · pass **9** · fail **0** | 🟢 |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `honesty.c_slice_ne_module` | **true** | 🟢 |
| `honesty.deny_j_hrm_06c_reopen` | **true** | 🟢 |
| `ac.AC-PLT-ATT-LEAVE-01d` | PUT **200** · F5 row · ATT-QC-02 retain | 🟢 |
| `ac.VAL-ATT-CNS-04` | GET effective **200** · MD-alone=false | 🟢 |
| `ac.AC-PLT-ATT-LEAVE-01` | POST **201** · F5 persist | 🟢 |
| `ac.AC-PLT-ATT-LEAVE-01b` | **400** `HRM-LEAVE-TYPE-UNKNOWN` | 🟢 |
| `ac.AC-PLT-ATT-LEAVE-01c` | EFF=8 · empty not forced · CTA wire | 🟡 idle-ok OBS |
| `ac.AC-PLT-ATT-LEAVE-01H` | honesty false · seals retain | 🟢 |
| `consoleErrors` | expected 400 resource only | 🟢 (invent path) |
| `pageErrors` | `[]` | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

### Screenshot spot-check (QC)

| Screen | Observed | QC |
|--------|----------|-----|
| `02-after-admin-create.png` | Toast «Đã tạo loại phép» · row `hr_leave_cat_msj7cpjh` · honesty banner `attendance_uat_ready=false` | 🟢 |
| `06-picker-selected.png` | Create dialog picker = `hr_leave_cat_msj7cpjh Phép QA LeaveCat msj7cpjh` | 🟢 |
| `07-leave-list-f5.png` | LeaveTab calendar surface after mutate (API F5 proven in machine) | 🟢 cite machine `leaveF5.found=true` |

---

## Gate AC audit (AC-PLT-ATT-LEAVE-01*)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 01d | Admin CREATE Nest N+1 → 2xx · F5 · ATT-QC-02 retain | PUT **200** · F5 row | 🟢 **ACCEPT** |
| 01 | EFF≥1 · GET effective picker · create 2xx · F5 type ∈ catalog | GET **200** · POST **201** · F5 | 🟢 **ACCEPT** |
| 01b | Invent → 4xx `HRM-LEAVE-TYPE-UNKNOWN` · no persist/hold | **400** · persist=false | 🟢 **ACCEPT** |
| 01c | Empty EFF empty+CTA · admin CREATE still OK · no seed | Live EFF=8 · CTA wire · 01d PASS | 🟡 **CONDITION idle-ok** |
| 01H | Honesty / seals | false · RETAIN · C-SLICE | 🟢 **ACCEPT** |
| 05b | Panel theo loại picker | `leave-balance-panel` visible | 🟢 **ACCEPT** |
| 09 | Hold after assert · invent no hold | 201 then invent 400 trước hold | 🟢 **ACCEPT** |
| 07 | Sick type ∈ EFF | `lvt_02` pick · panel bound | 🟢 **ACCEPT** |
| VAL-ATT-CNS-04 | FAIL if MD alone when EFF>0 | Network effective · MD-alone=false | 🟢 **ACCEPT** |
| — | invent ready / module ATT UAT / Phase1 / reopen seals | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA | QC |
|-----------------|-------|-----|-----|
| **ATT leave catalog** admin open + EFF picker invent KEY (in-scope) | SA/BA CONFIRMED | 🟢 PASS 9/9 | 🟢 **PASS / ACCEPT** |
| **J-HRM-06c** leave funnel / WAIVE path | Historical SEAL | **not retested** | ⬜ **DEFERRED** — **DENY reopen** |
| Module ATT UAT / sheet-sign | staged | not claimed | ⬜ **DEFERRED** — honesty |
| Empty EFF consumer UX (01c live wipe) | FE wire | 🟡 OBS not forced | 🟡 **CONDITION idle-ok** |

**U19 note:** This gate certifies the **ATT-LEAVE-CATALOG** slice named in dispatch — **not** J-HRM-06c reopen or attendance module UAT. Missing process L2.5 promote does **not** NO-GO this KEY/picker pack; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `attendance_uat_ready=false`.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **OBS-01c-EMPTY-EFF** | QA OBS · live EFF=8 | **CONDITION idle-ok** — wipe all LVT would reopen ATT-QC seals; CTA wire + 01d prove admin CREATE · **not** NO-GO |
| QA pack missing command_table | verify 7/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Stale-dist / product blockers | — | **NONE** |
| L1/product FAIL on AC pack | none | **NONE** — do not invent defect |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA 9/9 PASS stamp `ATTLEAVEQA-MSJ7CPJH` | PRODUCT PASS | Yes → GWC ACCEPT leave-catalog SEAL |
| Admin PUT 200 + F5 | PRODUCT PASS | Yes → 01d |
| GET effective + invent 400 KEY | PRODUCT PASS | Yes → 01 / 01b / VAL-ATT-CNS-04 |
| Honesty / ready flips | PRODUCT DENIED | Yes → CONDITIONS (not full GO) |
| 01c empty EFF not forced | PRODUCT OBS P2 | Soft CONDITION idle-ok only |
| QA pack command_table miss | PROCESS OBS | No — QC consolidates |
| Live unauth 401 / L0 200 | ENV OK / PRODUCT OK | Spot-check only |
| Console 400 on invent POST | PRODUCT OK | Expected invent path |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **Honesty / C-SLICE** | — | **pm** | Keep `attendance_uat_ready=false` · no module ATT UAT / Phase1 invent · no WAIVE/sign/J-06c reopen · no ATT-QC/peer seal reopen |
| **OBS-01c-EMPTY-EFF** | P2 OBS | **pm** | Empty EFF live path — **idle-ok** this seat (no wipe) |
| Peer seals ATT-QC / EMP / DEC / PAY / EXT / CTR / LIST-TOTALS / WAIVE / J-06c | must_keep | — | **do not reopen** |
| **U88 continuous** | — | **pm** | Dispatch **ba-docs** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` (client DOC-DELTA Nest LVT/EFF · admin≠consumer picker) — do not idle program on this seat seal alone |

**No residual P0/P1 product** on ATT leave catalog AC pack.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — leave catalog admin+picker invent · no J-* promote · L2.5 deferred |
| 4 | crud_or_matrix | ✅ AC-PLT-ATT-LEAVE-01* · 05b/09/07 · VAL-ATT-CNS-04 matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ `attendance_uat_ready=false` · DENIED WAIVE reopen · seals retain |
| 7 | Residual section | ✅ C-SLICE · OBS 01c idle-ok · U88 ba-docs |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md` | exit **1** · missing `command_table` | **PROCESS OBS** — QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-01 runner stamp `ATTLEAVEQA-MSJ7CPJH` | **PASS** · 9/9 · fail 0 | PRODUCT OK (cited machine JSON) |
| QC live spot unauth `:28001` `/attendance/leave-types/effective?company_id=main` | **401** | PRODUCT OK (spot-check) |
| QC L0 portal `:5173` · hrm `/api/hrm` | **200** / **200** | ENV OK |
| QC KEY spot `HRM_LEAVE_TYPE_UNKNOWN` in `att-leave-type.constants.ts` | **PRESENT** | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + unauth/L0/screen spot.

**L2.5 / journey:** No J-* promote in-scope this seat — **deferred**. Explicit: J-HRM-06c / module ATT UAT = **N/A / not tested** for this leave-catalog gate — **DENY reopen**.

---

## Scope statement (bounded)

**IN scope ACCEPT:** AC-PLT-ATT-LEAVE-01 / 01b / 01d / 01H · VAL-ATT-CNS-04 · 05b / 09 / 07 spots · U65 zero-seed · peer + ATT-QC + WAIVE/J-06c seals retain · leave-catalog slice **SEAL**.

**OUT of scope / DENIED:** Module ATT UAT · `attendance_uat_ready` flip · reopen WAIVE/sign/J-HRM-06c · reopen ATT-QC-01/02 · reopen EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · Phase 1 DONE · seed · claim empty-EFF live wipe PASS this seat · claim Settings MD sole picker SoT.

---

## completion_report

### Closed

1. Narrow QC GWC **SEAL** for ATT-LEAVE-CATALOG (AC-PLT-ATT-LEAVE-01* + 05b/09/07 + VAL-ATT-CNS-04) complete.
2. QA stamp **`ATTLEAVEQA-MSJ7CPJH`** · **9/9 PASS** · U65 admin **PUT 200** + EFF picker + invent **400** `HRM-LEAVE-TYPE-UNKNOWN` **ACCEPT**.
3. Live unauth **401** · L0 **200** · KEY constant **PRESENT** · screens `02`/`06` spot-check PASS.
4. Seals retained: ATT-QC-01/02 · WAIVE/sign/J-HRM-06c · EMP·DEC·PAY·EXT·CTR·LIST-TOTALS **not reopened**.
5. Honesty locked: `attendance_uat_ready=false` · DENIED module ATT UAT / Phase1.
6. Verdict **GO WITH CONDITIONS** (slice-SEAL) — not full-module GO.

### Residual

- **CONDITION:** honesty / `C-SLICE-≠-MODULE` retained · DENIED ready flips / seal reopen.
- **CONDITION OBS P2 idle-ok:** empty EFF live branch (01c) — do not wipe ATT-QC seals.
- **U88 continuous:** next **ba-docs** ATT leave catalog DOC-DELTA — do not idle program on this seat seal alone.

---

## next_owner

**pm** → dispatch **`ba-docs`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` · retain honesty false · cấm reopen sealed GWC

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QC-01 GWC · ATT leave catalog SEAL ACCEPT
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qc-01.md
stamp_peer: ATTLEAVEQA-MSJ7CPJH · ATT-QC-01/02 · WAIVE/sign/J-HRM-06c · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS SEAL retain
spec_ref: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md · SA Option B · F-ATT-CAT-LVT/EFF · HRM-LEAVE-TYPE-UNKNOWN
peer_docs: PAY-CATALOG-DOCS-01 / MERGE-TOKEN-EMP-DOCS-01 pattern (ADD-only DOC-DELTA · no wipe)

## entry_criteria
ATT-LEAVE-CATALOG-QC-01 GWC sealed; honesty attendance_uat_ready=false LOCKED; peer + WAIVE/sign/J-06c seals retained (cấm reopen)

## task
Client DOC-DELTA (ADD-only) for Nest att_leave_type / leave-types effective platform catalog:
- Admin F-ATT-CAT-LVT-02 open N+1 ≠ consumer invent
- Consumer pickers F-ATT-CAT-EFF-01 Nest SoT when EFF>0 · invent → HRM-LEAVE-TYPE-UNKNOWN
- HDSD / SRS client delta only — no prompt-echo · no wipe prior seals
- DENY attendance_uat_ready flip · DENY reopen WAIVE/sign/J-HRM-06c · DENY module ATT UAT claim
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-docs-01.md (+ client DOC path if applicable)

## cấm
seed · flip ready flags · invent module ATT UAT · reopen sealed GWC · wipe prior GĐ1 seals · claim Phase1 DONE

## exit
PASS_TO_PM · DOC-DELTA ACCEPT or HOLD-WITH-RATIONALE · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qc-01.md`

## ack_status

**PASS_TO_PM**

## attendance_uat_ready

**false**

## C-SLICE-≠-MODULE

**RETAIN**
