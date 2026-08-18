# Evidence — `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-TIER-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-TIER-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **source_tier field seat** (`R-PAY-SRC-TIER-FIELD`) · retain AC-PAY-SRC-01 / VAL-02A/B · **not** full payroll module UAT · **not** AMIS DONE |
| **priority** | P2 |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01` |
| **prior** | BE-TIER-01 `READY_FOR_QA` · QA-TIER-01 PASS stamp **`SRCTIER-ISPYVE`** · prior QC-SRC-02-01 GWC |
| **closes** | **QC gate** on GET payslip lines explicit `source_tier` key (no prefix-only assert) |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` / `company_id=main` |
| **journey_l25** | **J-HRM-07** GET lines `source_tier` (SRC-02 path retain) — **not** full process UAT / formula LIVE |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-emp-salary-history-qa-tier-01.md`](po-hrm-amis-parity-emp-salary-history-qa-tier-01.md) stamp **`SRCTIER-ISPYVE`** |
| **be_ref** | [`po-hrm-amis-parity-emp-salary-history-be-tier-01.md`](po-hrm-amis-parity-emp-salary-history-be-tier-01.md) READY_FOR_QA · jest 83 |
| **prior_qc** | [`po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md`](po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md) GWC SRC-02 |
| **machine** | [`_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.FINAL.json`](_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.FINAL.json) |
| **spec_ref** | AC-PAY-SRC-GET-TIER · BR-AMIS-PAY-SRC-02 · AC-PAY-SRC-01 · VAL-PAY-SRC-02A/B |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — seat GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / `payroll_e2e_ready=true` |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Tier-field + SRC-02 retain only |
| **Module payroll UAT / formula LIVE** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA reused SRC-02 payslip path · no seed |
| **Full J-HRM-07 process UAT** | **DENIED** | Bounded GET-TIER assert only |

---

## Verdict summary

**GO WITH CONDITIONS** — CLOSE **`R-PAY-SRC-TIER-FIELD`** after BE-TIER-01 + QA-TIER-01 stamp **`SRCTIER-ISPYVE`**. Audited QA MD + FINAL JSON (`verdict=PASS` · `AC-PAY-SRC-GET-TIER` 🟢 · `R-PAY-SRC-TIER-FIELD` 🟢 CLOSED · `AC-PAY-SRC-01` / `VAL-02A` / `VAL-02B` 🟢 retain · `honesty.payroll_e2e_ready=false` · `seed_used=false` · `amis_done=false`) + BE jest 83 + tsc PASS. Proven: L0 HRM/XBOS/portal **200** → TDZ `pay-batches-precision` → F5 stable → GET `/payroll/payslips/e9903a23-…/lines` **200** `HRM-PAY-200` · `emp_cb_refs=2` · each line has **`source_tier` key present** and **`source_tier==="emp_cb"`** (not prefix-only) · base=`13_579_000` / an=`777_000` · VAL-02B `overrideWon=false` `historyWins=true` · uncaught=0. Nested GET-by-id also exposes `source_tier` + `has_key=true`. **CONDITIONS retained:** **`R-EMP-SH-FE-CB-CLICK`** — FE-CB-01 already `READY_FOR_QA` · **`PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02` in flight** (**cấm** re-dispatch) · **`C-SLICE-≠-MODULE`**. QA pack verify **2/8** = **PROCESS OBS** (missing `command_table` + `portal_url`) — this QC consolidates **8/8**. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · formula LIVE · full J-HRM-07 process UAT. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| L0 stack | hrm/xbos/portal **200** | 🟢 **ACCEPT** |
| TDZ-GATE / F5 / UF-CONSOLE | precision · reload · uncaught=0 | 🟢 **ACCEPT** |
| **AC-PAY-SRC-GET-TIER** | emp_cb_refs=2 · failures=[] · 200/HRM-PAY-200 | 🟢 **ACCEPT** |
| **R-PAY-SRC-TIER-FIELD** | `source_tier===emp_cb` + key present (no prefix-only) | 🟢 **CLOSED** |
| **AC-PAY-SRC-01** | base=13579000@emp_cb · an=777000@emp_cb | 🟢 **RETAIN ACCEPT** |
| **VAL-PAY-SRC-02A** | an=777000 · `source_ref` emp_cb:package:…:line:… | 🟢 **RETAIN ACCEPT** |
| **VAL-PAY-SRC-02B** | overrideWon=false · historyWins=true · ovr 7.5M | 🟢 **RETAIN ACCEPT** |
| Nested GET-by-id tier | nested_tier_sample has_key=true | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty | 🟢 **DENIED promote** |
| QA pack 2/8 | command_table + portal_url | 🟡 **PROCESS OBS** — QC consolidates |
| FE Đãi ngộ click UF | out of tier scope · QA-SRC-02-02 in flight | 🟡 **CONDITION** · R-EMP-SH-FE-CB-CLICK |
| AMIS DONE / module UAT / Phase1 / ready / full J-HRM-07 | Explicit DENIED | 🟢 |
| Residual FE | bus FE-CB-01 → QA-SRC-02-02 DISPATCHED | 🟢 **OWNED · no re-dispatch** |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim full J-HRM-07 process UAT · claim module payroll UAT · claim FE Đãi ngộ save UF PASS · seed · re-dispatch FE-CB / QA-SRC-02-02.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · FE C&B click UF still awaiting QA-SRC-02-02 · tier seat ≠ module UAT |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim `R-PAY-SRC-TIER-FIELD` CLOSED + AC-PAY-SRC-01 / VAL-02A/B RETAIN? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / full J-HRM-07 / FE C&B UF? | **NO** |
| Forced residual dispatch this turn? | **NO** — QA-SRC-02-02 **already DISPATCHED**; await PASS_TO_PM |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-SRC-02-01 | `…-qc-src-02-01.md` | GWC · CONDITION TIER-FIELD | TRACE OK |
| BE-TIER-01 | `…-be-tier-01.md` | READY_FOR_QA · jest 83 · tsc | **ACCEPT** mapPayslipLine always emits tier |
| QA-TIER-01 | `…-qa-tier-01.md` | PASS_TO_PM | **ACCEPT** stamp `SRCTIER-ISPYVE` |
| Machine FINAL | `_tmp-…-qa-tier-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** — QC consolidates |
| Bus FE residual | FE-CB-01 READY_FOR_QA → QA-SRC-02-02 DISPATCHED | in flight | **OWNED · no re-dispatch** |

### Machine JSON spot (`SRCTIER-ISPYVE`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `SRCTIER-ISPYVE` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` / `amis_done` | **false** / **false** / **false** | 🟢 |
| `ac.AC-PAY-SRC-GET-TIER` | 🟢 PASS · emp_cb_refs=2 · failures=[] | 🟢 |
| `ac.R-PAY-SRC-TIER-FIELD` | 🟢 CLOSED · key present · `===emp_cb` | 🟢 |
| `ac.AC-PAY-SRC-01` | 🟢 PASS · base=13579000 · an=777000 | 🟢 |
| `ac.VAL-PAY-SRC-02A` / `VAL-PAY-SRC-02B` | 🟢 PASS · historyWins | 🟢 |
| `steps.payslip_lines_get.lines[*].source_tier` | `"emp_cb"` · `has_source_tier_key=true` ×2 | 🟢 |
| `steps.tier_assert.pass` | **true** · failures=[] | 🟢 |
| `verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| Residual cited | R-EMP-SH-FE-CB-CLICK (out of tier scope) | 🟡 CONDITION owned |

---

## Gate AC audit (tier field seat)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| AC-PAY-SRC-GET-TIER | GET lines expose `source_tier` key | 2 emp_cb lines · has_key · `===emp_cb` | 🟢 |
| R-PAY-SRC-TIER-FIELD | No prefix-only assert | CLOSED stamp SRCTIER-ISPYVE | 🟢 **CLOSED** |
| AC-PAY-SRC-01 | amounts @ emp_cb | base/an match expect | 🟢 **RETAIN** |
| VAL-PAY-SRC-02A | allowance + source_ref | an=777000 · package:line | 🟢 **RETAIN** |
| VAL-PAY-SRC-02B | history wins override | overrideWon=false | 🟢 **RETAIN** |
| FE Đãi ngộ save UF | POST 2xx from FE | out of scope · QA-SRC-02-02 in flight | 🟡 **CONDITION** |
| — | AMIS DONE / module UAT / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-TIER | QC |
|-----------------|-------|---------|-----|
| **J-HRM-07 GET lines source_tier** (in-scope) | BE READY | 🟢 GET-TIER + CLOSED defect | 🟢 **PASS / ACCEPT** (bounded) |
| J-HRM-07 SRC-02 PROCESS AC retain | QC-SRC-02 GWC | 🟢 AC-01 / VAL-02A/B | 🟢 **RETAIN ACCEPT** |
| FE Đãi ngộ C&B click save | FE-CB-01 READY | not this seat | 🟡 **CONDITION** · QA-SRC-02-02 in flight |
| Full J-HRM-07 process UAT / formula LIVE | — | not claimed | ⬜ **DEFERRED** — DENIED this seat |
| AMIS payment / ESS / catalog seats | other GWC | — | ⬜ **OUT** — do not reopen |

**U19 note:** This gate certifies **bounded J-HRM-07 GET `source_tier`** named in dispatch — **not** a claim that full J-HRM-07 / AMIS DONE / module payroll UAT is newly GO. FE C&B UF still open at QA-SRC-02-02 **forces GWC CONDITION** and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (tier read seat)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| GET payslip `/lines` source_tier | Read | **PASS** (200 · key + emp_cb) |
| GET payslip by id nested lines tier | Read | **PASS** (has_key=true) |
| Retain SRC-02 amounts / history win | Read | **PASS** (AC-01 / VAL-02A/B) |
| FE Đãi ngộ save click | Update | **OUT OF SCOPE** — QA-SRC-02-02 owns |
| PROCESS payroll (this harness) | Update | **N/A** — reused SRC-02 payslip id (U65 OK) |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **2/8** | **PROCESS OBS** | Missing `command_table` + `portal_url` on QA MD — **not** product demote; QC consolidates |
| AC-PAY-SRC-GET-TIER / R-PAY-SRC-TIER-FIELD | **PRODUCT OK** | Defect CLOSED |
| AC-PAY-SRC-01 / VAL-02A/B retain | **PRODUCT OK** | Slice ACCEPT retained |
| R-EMP-SH-FE-CB-CLICK | **PRODUCT CONDITION** | QA-SRC-02-02 in flight · does **not** demote tier CLOSE |
| AMIS / Phase1 / ready / full J-HRM-07 / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-SRC-TIER-FIELD** | P2 | `qa`/`qc` | **CLOSED** | Stamp SRCTIER-ISPYVE |
| **AC-PAY-SRC-01 / VAL-02A/B** | — | `qa`/`qc` | **RETAIN / ACCEPT** | Prior SRC-02 + this retest |
| **R-EMP-SH-FE-CB-CLICK** | P1 | `qa` | **OPEN · DISPATCHED** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02` (FE-CB-01 READY_FOR_QA) — **no re-dispatch** |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **Full J-HRM-07 process UAT** | L2.5 | `qa` later | **DEFERRED** | When FE C&B UF PASS + program opens |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0 product residuals blocking this tier WI:** none.

**CONDITION for GWC:** FE-CB click UF (owned QA-SRC-02-02) + `C-SLICE-≠-MODULE` — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / full J-HRM-07 GO; **not** product NO-GO for certified GET-TIER + SRC retain ACs.

**Idle-ok for this QC seat:** QA-SRC-02-02 already DISPATCHED — **no duplicate Task** this turn; PM awaits that QA verdict.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md` | exit **1** · **2/8** (command_table · portal_url) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-be-tier-01.md` | exit **1** · **3/8** | **PROCESS OBS** (BE handoff · not QC SoT) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md` | exit **0** · **8/8** | PRIOR QC OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-tier-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `SRCTIER-ISPYVE` | **PASS** · GET-TIER + AC retain | PRODUCT OK (cited) |
| BE jest pay-src-resolver / payroll / pay-formula | **83 passed** + tsc (BE evidence) | PRODUCT OK (cited) |
| Bus spot QA-SRC-02-02 | DISPATCHED after FE-CB-01 READY_FOR_QA | GOVERNANCE OK · no re-dispatch |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + bus audit.

---

## Evidence pack integrity (QC 8/8 consolidation)

| Check | Status |
|-------|--------|
| command_table | ✅ this QC MD |
| portal_url | ✅ `:5173` / persona |
| journey_l25 | ✅ J-HRM-07 GET source_tier bounded |
| crud_or_matrix | ✅ mutate/read matrix above |
| Classification | ✅ ENV/PROCESS vs PRODUCT |
| verdict | ✅ GO WITH CONDITIONS |
| residual / honesty | ✅ locked false + CONDITIONS |
| handoff contract | ✅ completion + next_dispatch |

---

## completion_report

### Closed

1. QC tier-field gate — **GO WITH CONDITIONS**.  
2. Audited QA-TIER-01 MD + FINAL JSON stamp `SRCTIER-ISPYVE` + BE-TIER-01 — **`R-PAY-SRC-TIER-FIELD` CLOSED**; AC-PAY-SRC-01 / VAL-02A/B **RETAIN ACCEPT**.  
3. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · full J-HRM-07 **DENIED**.  
4. FE-CB CONDITION accepted with owner **already DISPATCHED** (`QA-SRC-02-02`) — **no re-dispatch**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. Explicit **NO** to PM promote ready / AMIS DONE · CONDITIONS **`R-EMP-SH-FE-CB-CLICK`** · **`C-SLICE-≠-MODULE`**.  
7. **Idle-ok this QC seat** — do not re-dispatch FE-CB / QA-SRC-02-02 duplicates.

### Residual

- **`R-EMP-SH-FE-CB-CLICK`** OPEN · QA-SRC-02-02 in flight (FE-CB-01 READY_FOR_QA).  
- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE · **`payroll_e2e_ready=false`**.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-tier-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC TIER · stamp SRCTIER-ISPYVE · R-PAY-SRC-TIER-FIELD CLOSED · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / module UAT · await QA-SRC-02-02 · **no duplicate residual dispatch** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY (pipeline continue)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-TIER-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-tier-01.md
stamp_qa: SRCTIER-ISPYVE

## Status
- R-PAY-SRC-TIER-FIELD = CLOSED
- AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B = RETAIN ACCEPT
- CONDITIONS: R-EMP-SH-FE-CB-CLICK (QA-SRC-02-02 DISPATCHED / in flight) · C-SLICE-≠-MODULE
- payroll_e2e_ready=false LOCKED · no AMIS DONE · no module UAT · no Phase1 · no full J-HRM-07 claim

## Action
idle-ok for this QC TIER seat — do NOT re-dispatch FE-CB-01 or QA-SRC-02-02.
Await PASS_TO_PM from:
  - PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02
Then Task qc on FE C&B click UF if QA PASS (or Dev if FAIL).
Run pnpm run pm:idle:check for unrelated P0 outside this seat.

cấm: flip payroll_e2e_ready · claim AMIS DONE · Phase1 DONE · module UAT · invent FE Đãi ngộ UF PASS · re-dispatch FE-CB
```
