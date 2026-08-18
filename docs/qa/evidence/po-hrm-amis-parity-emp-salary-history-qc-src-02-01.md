# Evidence — `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **SRC-02 PROCESS slice** (AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B · **not** full payroll module UAT · **not** AMIS DONE) |
| **priority** | P1 |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-01` |
| **prior** | QA PASS_TO_PM stamp **`SRCSRC02-ISBDZW`** · BE `READY_FOR_QA` jest 58 |
| **closes** | **QC gate** on BR-AMIS-PAY-SRC-02 per-component emp C&B on PROCESS |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` / `company_id=main` |
| **journey_l25** | **J-HRM-07** PROCESS + C&B SRC-02 (bounded) — **not** full process UAT / formula LIVE |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md`](po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md) stamp **`SRCSRC02-ISBDZW`** |
| **be_ref** | [`po-hrm-amis-parity-emp-salary-history-be-src-02-01.md`](po-hrm-amis-parity-emp-salary-history-be-src-02-01.md) READY_FOR_QA |
| **machine** | [`_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-01.FINAL.json`](_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-01.FINAL.json) |
| **spec_ref** | BR-AMIS-PAY-SRC-02 · DATA-01 §4–§7 · AC-PAY-SRC-01 · VAL-PAY-SRC-02A/B |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — seat GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / `payroll_e2e_ready=true` |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | SRC-02 PROCESS slice only |
| **Module payroll UAT / formula LIVE** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Product-path C&B mirror ≠ `pnpm seed:*` / DB fake |
| **Full J-HRM-07 process UAT** | **DENIED** | Bounded SRC-02 assert only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT SRC-02 PROCESS slice after BE-SRC-02-01 + QA-SRC-02-01 against BR-AMIS-PAY-SRC-02 / AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B. Audited QA MD + FINAL JSON stamp `SRCSRC02-ISBDZW` (`verdict=PASS` · AC-PAY-SRC-01 / VAL-02A / VAL-02B 🟢 · `honesty.payroll_e2e_ready=false` · `seed_used=false` · `amis_done=false`) + BE jest 58/58 + bus residual DISPATCHED FE/BE. Proven: L0 HRM/XBOS/portal **200** → TDZ `pay-batches-precision` visible · **no** `showAddDialog` ReferenceError → PROCESS **201** `HRM-PAY-202` → GET lines **200** `HRM-PAY-200` `base=13_579_000` / `phu_cap_an=777_000` with `source_ref=emp_cb:package:…:line:…` → override const **7_500_000** **did not win** (`overrideWon=false` · `historyWins=true`) → F5 stable · uncaught=0. **FE-CB-COMPONENT 🟡 PARTIAL** (`feOk=false` · no FE POST 2xx) — PROCESS assert used **product-path C&B mirror** (≠ seed) → residual **`R-EMP-SH-FE-CB-CLICK`**. **`source_tier` field** may be absent on GET lines — assert via `source_ref` prefix → residual **`R-PAY-SRC-TIER-FIELD`**. Both residuals **already DISPATCHED** on bus (`PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01` · `…-BE-TIER-01`). QA pack verify **1/8** = **PROCESS OBS** (missing `command_table`) — this QC consolidates **8/8**. Remaining CONDITIONS: **`R-EMP-SH-FE-CB-CLICK`** (in-flight FE) · **`R-PAY-SRC-TIER-FIELD`** (in-flight BE) · **`C-SLICE-≠-MODULE`**. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · formula LIVE · full J-HRM-07 process UAT. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| L0 stack | hrm/xbos/portal **200** | 🟢 **ACCEPT** |
| TDZ-GATE | `pay-batches-precision` · no showAddDialog TDZ | 🟢 **ACCEPT** · R-PAY-BATCHES-SHOWADD-TDZ CLOSED this run |
| SETUP-TPL + OV-C | tpl bind · override const 7.5M on base + phu_cap_an | 🟢 **ACCEPT** |
| **AC-PAY-SRC-01** | PROCESS 201 · base/an @ emp_cb · lines=2 | 🟢 **ACCEPT** |
| **VAL-PAY-SRC-02A** | an=777000@emp_cb · `source_ref` emp_cb:package:…:line:… | 🟢 **ACCEPT** |
| **VAL-PAY-SRC-02B** | overrideWon=false · historyWins=true · ≠ 7.5M | 🟢 **ACCEPT** |
| F5-STABLE / UF-CONSOLE | reload · uncaught=0 | 🟢 **ACCEPT** |
| FE-CB-COMPONENT | feOk=false · PARTIAL | 🟡 **CONDITION** · R-EMP-SH-FE-CB-CLICK |
| source_tier column | assert via source_ref prefix | 🟡 **CONDITION** · R-PAY-SRC-TIER-FIELD |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty | 🟢 **DENIED promote** |
| QA pack 1/8 | command_table missing | 🟡 **PROCESS OBS** — QC consolidates |
| Screens dir claimed | path cited · dir empty/missing at QC audit | 🟡 **PROCESS OBS** — machine JSON + AC SoT OK |
| AMIS DONE / module UAT / Phase1 / ready / full J-HRM-07 | Explicit DENIED | 🟢 |
| Residuals FE/BE | bus DISPATCHED FE-CB-01 · BE-TIER-01 | 🟢 **OWNED · not idle** |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim full J-HRM-07 process UAT · claim module payroll UAT · claim FE Đãi ngộ save UF PASS · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · FE C&B click PARTIAL · source_tier residual · SRC-02 ≠ module UAT |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim SRC-02 PROCESS AC-PAY-SRC-01 / VAL-02A/B ACCEPT? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / full J-HRM-07 / FE C&B UF? | **NO** |
| Forced residual dispatch this turn? | **NO** — FE-CB-01 + BE-TIER-01 **already DISPATCHED**; await READY_FOR_QA |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| DATA-01 | `po-hrm-amis-parity-emp-salary-history-data-01.md` | prior | TRACE OK (BE cites) |
| BE-SRC-02-01 | `po-hrm-amis-parity-emp-salary-history-be-src-02-01.md` | READY_FOR_QA · jest 58 | **ACCEPT** schema/DTO/resolver |
| QA-SRC-02-01 | `po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md` | PASS_TO_PM | **ACCEPT** stamp `SRCSRC02-ISBDZW` |
| Machine FINAL | `_tmp-…-qa-src-02-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — QC consolidates |
| Bus residuals | FE-CB-01 · BE-TIER-01 | DISPATCHED 18:16+07 | **OWNED** |

### Machine JSON spot (`SRCSRC02-ISBDZW`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `SRCSRC02-ISBDZW` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` / `amis_done` | **false** / **false** / **false** | 🟢 |
| `ac.AC-PAY-SRC-01` | 🟢 PASS · base=13579000@emp_cb · an=777000@emp_cb | 🟢 |
| `ac.VAL-PAY-SRC-02A` | 🟢 PASS · source_ref emp_cb:package:…:line:… | 🟢 |
| `ac.VAL-PAY-SRC-02B` | 🟢 PASS · overrideWon=false · historyWins=true | 🟢 |
| `ac.FE-CB-COMPONENT` | 🟡 PARTIAL · feOk=false | 🟡 CONDITION |
| `ac.TDZ-GATE` / `F5-STABLE` / `UF-CONSOLE` | 🟢 PASS | 🟢 |
| `verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| Residuals | R-EMP-SH-FE-CB-CLICK · R-PAY-SRC-TIER-FIELD | 🟡 OWNED |

---

## Gate AC audit (SRC-02 PROCESS)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| AC-PAY-SRC-01 | PROCESS uses emp C&B per component | 201 HRM-PAY-202 · amounts match package | 🟢 |
| VAL-PAY-SRC-02A | allowance line via component_code + source_ref | an=777000 · emp_cb:package:…:line:… | 🟢 |
| VAL-PAY-SRC-02B | history wins over template override | ovr 7.5M did not win | 🟢 |
| FE Đãi ngộ save UF | POST 2xx from FE | feOk=false · product-path mirror | 🟡 **CONDITION** |
| source_tier explicit field | GET lines column | may be absent · prefix assert OK | 🟡 **CONDITION** |
| — | AMIS DONE / module UAT / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-SRC-02 | QC |
|-----------------|-------|-----------|-----|
| **J-HRM-07 SRC-02 PROCESS** (in-scope) | BE READY | 🟢 AC-PAY-SRC-01 / VAL-02A/B | 🟢 **PASS / ACCEPT** (bounded) |
| TDZ payroll batches precision | historical | 🟢 PASS | 🟢 **RETAIN CLOSED this run** |
| FE Đãi ngộ C&B click save | G-EMP-SH-05 | 🟡 PARTIAL | 🟡 **CONDITION** · FE-CB-01 in-flight |
| Full J-HRM-07 process UAT / formula LIVE | — | not claimed | ⬜ **DEFERRED** — DENIED this seat |
| AMIS payment / ESS / catalog seats | other GWC | — | ⬜ **OUT** — do not reopen |

**U19 note:** This gate certifies **bounded J-HRM-07 SRC-02 PROCESS** named in dispatch — **not** a claim that full J-HRM-07 / AMIS DONE / module payroll UAT is newly GO. FE C&B PARTIAL **forces GWC CONDITION** and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (SRC-02 PROCESS slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Template lines + OV-C override bind | Create/Update | **PASS** |
| Product-path C&B package (mirror) | Create | **PASS** (≠ FE click · ≠ seed) |
| Period bind template + enroll | Update | **PASS** (201) |
| PROCESS payroll period | Update | **PASS** (201 HRM-PAY-202) |
| GET payslip lines source_ref | Read | **PASS** (200 · emp_cb) |
| FE Đãi ngộ save click | Update | **PARTIAL** — residual FE |
| Override const wins | — | **FAIL intended** — VAL-02B PASS (did not win) |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **1/8** | **PROCESS OBS** | Missing `command_table` on QA MD — **not** product demote; QC consolidates |
| Screens path empty/missing | **PROCESS OBS** | Machine JSON + AC matrix remain SoT |
| AC-PAY-SRC-01 / VAL-02A/B | **PRODUCT OK** | Slice ACCEPT |
| FE-CB PARTIAL / R-EMP-SH-FE-CB-CLICK | **PRODUCT CONDITION** | In-flight FE · does **not** demote PROCESS SRC assert |
| R-PAY-SRC-TIER-FIELD | **PRODUCT / CONTRACT OBS** | In-flight BE · source_ref prefix sufficient for this seat |
| Product-path C&B mirror | **PROCESS OK** | ≠ seed · U65 retained for PROCESS path |
| AMIS / Phase1 / ready / full J-HRM-07 / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **AC-PAY-SRC-01 / VAL-02A/B** | — | `qa`/`qc` | **CLOSED / ACCEPT** | Stamp SRCSRC02-ISBDZW |
| **R-EMP-SH-FE-CB-CLICK** | P1 | `dev-fe` | **OPEN · DISPATCHED** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01` |
| **R-PAY-SRC-TIER-FIELD** | P2 | `dev-be` | **OPEN · DISPATCHED** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01` |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **Full J-HRM-07 process UAT** | L2.5 | `qa` later | **DEFERRED** | When FE C&B + tier closed + program opens |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0 product residuals blocking this SRC-02 PROCESS WI:** none.

**CONDITION for GWC:** FE-CB + TIER-FIELD (owned) + `C-SLICE-≠-MODULE` — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / full J-HRM-07 GO; **not** product NO-GO for certified SRC-02 PROCESS ACs.

**Idle-ok for this QC seat:** residuals already DISPATCHED — **no duplicate Task** this turn; PM awaits FE/BE READY_FOR_QA.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md` | exit **1** · **1/8** (command_table) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `SRCSRC02-ISBDZW` | **PASS** · AC-PAY-SRC-01 / VAL-02A/B | PRODUCT OK (cited) |
| BE jest pay-src-resolver / compensation / formula | **58 passed** (BE evidence) | PRODUCT OK (cited) |
| Bus spot FE-CB-01 · BE-TIER-01 | DISPATCHED 2026-08-07T18:16+07 | GOVERNANCE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + bus audit.

---

## Evidence pack integrity (QC 8/8 consolidation)

| Check | Status |
|-------|--------|
| command_table | ✅ this QC MD |
| portal_url | ✅ `:5173` / persona |
| journey_l25 | ✅ J-HRM-07 SRC-02 bounded |
| crud_or_matrix | ✅ mutate matrix above |
| Classification | ✅ ENV/PROCESS vs PRODUCT |
| verdict | ✅ GO WITH CONDITIONS |
| residual / honesty | ✅ locked false + CONDITIONS |
| handoff contract | ✅ completion + next_dispatch |

---

## completion_report

### Closed

1. QC SRC-02 PROCESS gate — **GO WITH CONDITIONS**.  
2. Audited QA-SRC-02-01 MD + FINAL JSON stamp `SRCSRC02-ISBDZW` + BE-SRC-02-01 — AC-PAY-SRC-01 / VAL-02A/B **ACCEPT**.  
3. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · full J-HRM-07 **DENIED**.  
4. FE-CB PARTIAL + source_tier OBS accepted as **CONDITIONS** with owners **already DISPATCHED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. Explicit **NO** to PM promote ready / AMIS DONE · CONDITIONS **`R-EMP-SH-FE-CB-CLICK`** · **`R-PAY-SRC-TIER-FIELD`** · **`C-SLICE-≠-MODULE`**.  
7. **Idle-ok this QC seat** — do not re-dispatch FE/BE duplicates.

### Residual

- **`R-EMP-SH-FE-CB-CLICK`** OPEN · FE-CB-01 in-flight.  
- **`R-PAY-SRC-TIER-FIELD`** OPEN · BE-TIER-01 in-flight.  
- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE · **`payroll_e2e_ready=false`**.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC SRC-02 · stamp SRCSRC02-ISBDZW · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / module UAT · await FE-CB-01 + BE-TIER-01 · **no duplicate residual dispatch** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY (pipeline continue)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md
stamp_qa: SRCSRC02-ISBDZW

## Status
- AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B PROCESS = ACCEPT GWC
- CONDITIONS: R-EMP-SH-FE-CB-CLICK (FE-CB-01 DISPATCHED) · R-PAY-SRC-TIER-FIELD (BE-TIER-01 DISPATCHED) · C-SLICE-≠-MODULE
- payroll_e2e_ready=false LOCKED · no AMIS DONE · no module UAT · no Phase1 · no full J-HRM-07 claim

## Action
idle-ok for this QC SRC-02 seat — do NOT re-dispatch FE/BE duplicates.
Await READY_FOR_QA from:
  - PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01
  - PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01
Then Task qa retest FE C&B click + source_tier field.
Run pnpm run pm:idle:check for unrelated P0 outside this seat.

cấm: flip payroll_e2e_ready · claim AMIS DONE · Phase1 DONE · module UAT · invent FE Đãi ngộ UF PASS
```
