# Evidence — `PO-HRM-AMIS-PARITY-PAY-SRC-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-SRC-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **PAY-SRC D-PAY-SRC-01 retest gate** (AC-PAY-SRC-01/06/GET-TIER · **not** full payroll module UAT · **not** AMIS DONE · **not** J-HRM-07 e2e-ready) |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-02` |
| **prior** | QA PASS_TO_PM stamp **`PAYSRCQA2-ISVZ0J`** · BE-02 `READY_FOR_QA` jest **78** · prior QA-01 **FAIL** `D-PAY-SRC-01` |
| **closes** | **QC gate** on D-PAY-SRC-01 retest · AC-PAY-SRC-01/06/GET-TIER ACCEPT · ATT-412 retained |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` / `company_id=holding` |
| **journey_l25** | **J-HRM-07** payroll → payslip lines (bounded SRC verify) — **not** full process UAT / e2e-ready |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-src-qa-02.md`](po-hrm-amis-parity-pay-src-qa-02.md) stamp **`PAYSRCQA2-ISVZ0J`** |
| **be_ref** | [`po-hrm-amis-parity-pay-src-be-02.md`](po-hrm-amis-parity-pay-src-be-02.md) READY_FOR_QA · D-PAY-SRC-01 FIX |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-src-qa-02.FINAL.json`](_tmp-po-hrm-amis-parity-pay-src-qa-02.FINAL.json) |
| **spec_ref** | AC-PAY-SRC-01/04/05/06 · AC-PAY-SRC-GET-TIER · BR-AMIS-PAY-SRC-02 (trace via BE-02) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — seat GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / `payroll_e2e_ready=true` / J-HRM-07 e2e-ready |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | D-PAY-SRC-01 slice only |
| **Module payroll UAT / formula LIVE** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Product-path verify ≠ `pnpm seed:*` |
| **J-HRM-07 e2e-ready / full process UAT** | **DENIED** | Bounded `verify_processed` + ATT-412 only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT D-PAY-SRC-01 retest after BE-02 FIX + QA-02 U65 against AC-PAY-SRC-01/06/GET-TIER. Audited QA MD + FINAL JSON stamp `PAYSRCQA2-ISVZ0J` (`verdict=PASS` · `honesty.payroll_e2e_ready=false` · `seed_used=false` · `amis_done=false`) + BE-02 (jest 78 · live NV002 process emp_cb). Proven: L0 **200** → NV002 C&B base **9_500_000** · closed-sheet Sep period `d92d3bbb` **processed** → GET lines **200** `HRM-PAY-200` base **9500000** · **`source_tier=emp_cb`** · **`source_ref=emp_cb:package:084a6c66-…:line:87c46658-…`** · mode **`verify_processed`** documented → AC-PAY-SRC-04 process `2035-06` → **412** `HRM-PAY-ATT-412` retained → F5 · pageErrors=0. **AC-PAY-SRC-GET-TIER CLOSED** (2/2 lines expose `source_tier`) — supersedes prior SRC-02 CONDITION `R-PAY-SRC-TIER-FIELD` for this PAY-SRC seat. Fresh PROCESS slot unavailable this wave → residual **`R-PAY-SRC-FRESH-PROCESS-SLOT`** (CONDITION OK — verify_processed proves emp_cb SoT). OBS FE payslip deep-link **404** P3 (API OK). QA pack verify **1/8** = **PROCESS OBS** (missing `command_table`) — this QC consolidates **8/8**. Remaining CONDITIONS: **`R-PAY-SRC-FRESH-PROCESS-SLOT`** · **`OBS-PAYSLIP-DEEP-LINK`** P3 · **`R-PAY-SRC-05-PROBE-NARROW`** · **`C-SLICE-≠-MODULE`**. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · **J-HRM-07 e2e-ready**. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| L0 stack | hrm/xbos/portal **200** | 🟢 **ACCEPT** |
| BE-02 D-PAY-SRC-01 FIX | jest 78 · live NV002 emp_cb process | 🟢 **ACCEPT** (cited) |
| **D-PAY-SRC-01** | Prior 412 FORMULA «No SRC amount for BASE» | 🟢 **CLOSED** |
| **AC-PAY-SRC-01** | amt=**9500000**=C&B · `source_tier=emp_cb` · `source_ref` emp_cb:package:… · mode=`verify_processed` | 🟢 **ACCEPT** |
| **AC-PAY-SRC-06** | ≥1 line (2 lines) after closed-sheet process | 🟢 **ACCEPT** |
| **AC-PAY-SRC-GET-TIER** | `source_tier` on **2/2** lines | 🟢 **CLOSED / ACCEPT** |
| **AC-PAY-SRC-04** | **412** `HRM-PAY-ATT-412` | 🟢 **ACCEPT** retained |
| **AC-PAY-SRC-05** | fail-fast retained (QA-01/BE-02); live no-CB narrow | 🟢 **ACCEPT** · residual probe note |
| F5-STABLE / UF-CONSOLE | reload · pageErrors=0 · deep-link 404 OBS only | 🟢 **ACCEPT** · OBS P3 |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty | 🟢 **DENIED promote** |
| QA pack 1/8 | command_table missing | 🟡 **PROCESS OBS** — QC consolidates |
| Screens dir claimed | path cited · dir empty/missing at QC audit | 🟡 **PROCESS OBS** — machine JSON + AC SoT OK |
| AMIS DONE / module UAT / Phase1 / ready / J-HRM-07 e2e | Explicit DENIED | 🟢 |
| Residuals freshness / deep-link / slice | R-PAY-SRC-FRESH-PROCESS-SLOT · OBS P3 · C-SLICE | 🟡 **CONDITION** |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 e2e-ready · claim module payroll UAT · claim fresh PROCESS this wave · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · mode=`verify_processed` (no fresh PROCESS slot) · OBS deep-link · PAY-SRC ≠ module UAT |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim D-PAY-SRC-01 CLOSED + AC-PAY-SRC-01/06/GET-TIER ACCEPT? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / J-HRM-07 e2e-ready? | **NO** |
| Forced residual dispatch this turn? | **NO** — freshness = later QA wave; deep-link = optional P3 FE; honesty lock only |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-02 | `po-hrm-amis-parity-pay-src-be-02.md` | READY_FOR_QA · jest 78 · live emp_cb | 🟢 **ACCEPT** |
| QA-01 (prior FAIL) | `po-hrm-amis-parity-pay-src-qa-01.md` | FAIL D-PAY-SRC-01 | TRACE OK — defect closed by BE-02+QA-02 |
| QA-02 | `po-hrm-amis-parity-pay-src-qa-02.md` | PASS_TO_PM | 🟢 **ACCEPT** stamp `PAYSRCQA2-ISVZ0J` |
| Machine FINAL | `_tmp-…-pay-src-qa-02.FINAL.json` | PASS | 🟢 **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — QC consolidates |
| Pack verify QC | this file | exit **0** · **8/8** | 🟢 SoT |

### Machine JSON spot (`PAYSRCQA2-ISVZ0J`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYSRCQA2-ISVZ0J` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` / `amis_done` | **false** / **false** / **false** | 🟢 |
| `ac.AC-PAY-SRC-01` | 🟢 PASS · mode=`verify_processed` · tier=emp_cb · amt=9500000 · ref emp_cb:package:084a6c66-…:line:87c46658-… | 🟢 |
| `ac.AC-PAY-SRC-06` | 🟢 PASS · lines=2 | 🟢 |
| `ac.AC-PAY-SRC-GET-TIER` | 🟢 PASS · source_tier on 2/2 | 🟢 |
| `ac.AC-PAY-SRC-04` | 🟢 PASS · HTTP 412 `HRM-PAY-ATT-412` | 🟢 |
| `steps.payslip_lines.lines[0]` | base / 9500000 / emp_cb / emp_cb:package:… | 🟢 |
| `processMode` | `verify_processed` | 🟢 documented |
| `consoleErrors` | FE route 404 `/payroll/payslips/{id}` ×2 | 🟡 OBS P3 |
| `verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| Residuals | R-PAY-SRC-FRESH-PROCESS-SLOT · R-PAY-SRC-05-PROBE-NARROW | 🟡 CONDITION |

---

## Gate AC audit (PAY-SRC retest)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| D-PAY-SRC-01 | PROCESS emp_cb BASE when C&B present | QA-02 CLOSED · BE-02 root-cause alias/asOf/GET-tier | 🟢 **CLOSED** |
| AC-PAY-SRC-01 | amount = C&B · source_tier=emp_cb · source_ref | 9.5M · emp_cb · emp_cb:package:… | 🟢 |
| AC-PAY-SRC-06 | payslip lines after process | 2 lines · GET 200 | 🟢 |
| AC-PAY-SRC-GET-TIER | GET lines expose source_tier | 2/2 | 🟢 **CLOSED** (prior R-PAY-SRC-TIER-FIELD for this seat) |
| AC-PAY-SRC-04 | ATT closed gate | 412 HRM-PAY-ATT-412 | 🟢 |
| AC-PAY-SRC-05 | FORMULA-412 not silent 0 | retained + ATT-412; live no-CB narrow | 🟢 · residual note |
| Mode | Fresh PROCESS vs verify | **`verify_processed`** (Sep already processed) | 🟡 **CONDITION** freshness |
| — | AMIS DONE / module UAT / Phase1 / ready / J-HRM-07 e2e | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **J-HRM-07 PAY-SRC verify** (in-scope) | QA-01 FAIL D-PAY-SRC-01 | 🟢 browser period + GET lines emp_cb | 🟢 **PASS / ACCEPT** (bounded · `verify_processed`) |
| ATT-412 fail-fast | BE/QA retained | 🟢 PASS | 🟢 **RETAIN** |
| Payslip FE deep-link `/payroll/payslips/:id` | — | 🟡 OBS 404 (API OK) | 🟡 **CONDITION** P3 · optional FE |
| Fresh PROCESS on closed-sheet month | — | unavailable | 🟡 **DEFERRED** R-PAY-SRC-FRESH-PROCESS-SLOT |
| Full J-HRM-07 e2e-ready / process UAT | map historical PASS ≠ this seat | not claimed | ⬜ **DEFERRED** — **DENIED** this seat |
| AMIS payment / ESS / catalog seats | other GWC | — | ⬜ **OUT** — do not reopen |

**U19 note:** This gate certifies **bounded J-HRM-07 PAY-SRC** (emp_cb source + ATT-412) named in dispatch — **not** a claim that full J-HRM-07 is newly e2e-ready / AMIS DONE / module payroll UAT. Mode `verify_processed` **forces GWC CONDITION** and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (PAY-SRC slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Template create + BASE lines | Create | **PASS** (SETUP-TPL) |
| Period create overlap | Create | **409** expected → reuse processed |
| Browser payroll list → period | Read | **PASS** |
| GET payslip lines emp_cb | Read | **PASS** (200 · 9.5M · source_tier) |
| Far-future PROCESS without closed ATT | Update | **PASS intended FAIL** — 412 ATT-412 |
| Fresh PROCESS this wave | Update | **N/A** — residual freshness |
| FE payslip deep-link | Read | **OBS FAIL route** — API OK · P3 |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **1/8** | **PROCESS OBS** | Missing `command_table` on QA MD — **not** product demote; QC consolidates |
| Screens path empty/missing | **PROCESS OBS** | Machine JSON + AC matrix remain SoT |
| D-PAY-SRC-01 / AC-PAY-SRC-01/06/GET-TIER | **PRODUCT OK** | Slice ACCEPT · defect CLOSED |
| ATT-412 retained | **PRODUCT OK** | Fail-fast honesty |
| mode=`verify_processed` / R-PAY-SRC-FRESH-PROCESS-SLOT | **PRODUCT CONDITION** | Does **not** demote emp_cb SoT proof; blocks e2e-ready promote |
| OBS payslip deep-link 404 | **PRODUCT OBS P3** | Console only · GET lines API 200 · optional FE |
| R-PAY-SRC-05-PROBE-NARROW | **PRODUCT OBS** | FORMULA-412 live no-CB not re-hit; retained prior PASS |
| AMIS / Phase1 / ready / J-HRM-07 e2e / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **D-PAY-SRC-01** | P0 | be/qa/qc | **CLOSED** | Stamp PAYSRCQA2-ISVZ0J |
| **AC-PAY-SRC-01/06/GET-TIER** | — | qa/qc | **CLOSED / ACCEPT** | emp_cb 9.5M + tier field |
| **AC-PAY-SRC-04 ATT-412** | — | qa/qc | **CLOSED / RETAINED** | |
| **R-PAY-SRC-TIER-FIELD** (prior SRC-02) | P2 | — | **CLOSED this seat** | GET-TIER 2/2 |
| **R-PAY-SRC-FRESH-PROCESS-SLOT** | P2 | `qa` later | **OPEN** | No free draft on closed-sheet month |
| **R-PAY-SRC-05-PROBE-NARROW** | P3 | `qa` | **OPEN** | Live no-CB FORMULA-412 not re-hit |
| **R-PAY-SRC-MULTI** | known | qa note | **RETAIN** | Mixed enroll fail-fast first NV w/o C&B |
| **OBS-PAYSLIP-DEEP-LINK** | P3 | `dev-fe` optional | **OPEN** | FE `/payroll/payslips/:id` 404 |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07 e2e-ready** | L2.5 | `qa` later | **DEFERRED / DENIED** | Bounded verify ≠ e2e-ready |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0 product residuals blocking this PAY-SRC WI:** none.

**CONDITION for GWC:** freshness slot · OBS deep-link P3 · probe narrow · `C-SLICE-≠-MODULE` — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / J-HRM-07 e2e-ready; **not** product NO-GO for certified AC-PAY-SRC-01/06/GET-TIER + ATT-412.

**Idle-ok for this QC seat:** no forced P0 Task — optional later QA freshness wave / optional P3 FE deep-link; PM keeps honesty locks.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md` | exit **1** · **1/8** (command_table) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-src-qc-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYSRCQA2-ISVZ0J` | **PASS** · AC-PAY-SRC-01/06/GET-TIER/04 | PRODUCT OK (cited) |
| BE jest pay-src-resolver / pay-formula / payroll.service | **78 passed** (BE-02 evidence) | PRODUCT OK (cited) |
| Spot-check machine FINAL + QA MD + BE-02 | QC read | PRODUCT OK |

---

## completion_report

**Closed:** QC gate on `PO-HRM-AMIS-PARITY-PAY-SRC-QA-02` → **GO WITH CONDITIONS**. D-PAY-SRC-01 **CLOSED**. AC-PAY-SRC-01/06/GET-TIER **ACCEPT**. ATT-412 **RETAINED**. mode=`verify_processed` documented and honesty-locked. Pack consolidated **8/8**. BE-02 cited.

**Residual:** R-PAY-SRC-FRESH-PROCESS-SLOT · R-PAY-SRC-05-PROBE-NARROW · OBS-PAYSLIP-DEEP-LINK P3 · C-SLICE-≠-MODULE · `payroll_e2e_ready=false` LOCKED.

**Explicit non-claims:** Did **not** set `payroll_e2e_ready=true` · Did **not** claim AMIS DONE · Did **not** claim J-HRM-07 e2e-ready · Did **not** claim module payroll UAT / Phase1 DONE · Did **not** claim fresh PROCESS this wave.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-AMIS-PARITY-PAY-SRC-QC-02
priority: P0

## Mission
INTAKE QC GWC on PAY-SRC D-PAY-SRC-01 retest.
Evidence: docs/qa/evidence/po-hrm-amis-parity-pay-src-qc-02.md
CLOSED: D-PAY-SRC-01 · AC-PAY-SRC-01/06/GET-TIER · ATT-412 retained · source_tier=emp_cb · base 9.5M · mode verify_processed.
Honesty LOCKED: payroll_e2e_ready=false · cấm AMIS DONE · cấm J-HRM-07 e2e-ready · C-SLICE-≠-MODULE.
Residuals (idle-ok this seat): R-PAY-SRC-FRESH-PROCESS-SLOT (later QA) · OBS-PAYSLIP-DEEP-LINK P3 optional FE · R-PAY-SRC-05-PROBE-NARROW.
Action: bus INTAKE + update TEAM_WORKING_NOW; do NOT flip payroll_e2e_ready; optional later wave freshness PROCESS when closed-sheet draft free — no forced P0 dispatch now.
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § completion_report |
| **next_owner** | `pm` |
| **next_dispatch_prompt** | § next_dispatch_prompt |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-src-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **GO WITH CONDITIONS** |
