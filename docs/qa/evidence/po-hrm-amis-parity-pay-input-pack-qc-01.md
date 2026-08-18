# Evidence — `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API Step4 input packs** (bind · eligibility/enroll · advance emp bridge) — **not** browser UF · **not** module UAT |
| **priority** | P1 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-02` |
| **prior** | QA-02 PASS_TO_PM stamp **`PAYINPQA2-MSISF85U`** · BE-02 READY_FOR_QA |
| **closes** | L1 AC-AMIS-ATT-XFER-01 · AC-PAY-ELIG-ENROLL · VAL-INP-ADV-01 + QA-01 P0 residuals (s.code · elig OU · ADV emp API) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | L1 Step4 packs API (bind→elig→enroll→ADV bridge) — **not** full **J-HRM-07** process UAT · browser Step4 **DEFERRED** (FE-01) |
| **Verdict** | **GO WITH CONDITIONS** — L1 Step4 input packs ACCEPT · CONDITIONS: **`FE-01` wire OOS** (already DISPATCHED) · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-input-pack-qa-02.md`](po-hrm-amis-parity-pay-input-pack-qa-02.md) stamp **`PAYINPQA2-MSISF85U`** |
| **be_ref** | [`po-hrm-amis-parity-pay-input-pack-be-02.md`](po-hrm-amis-parity-pay-input-pack-be-02.md) READY_FOR_QA |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json`](_tmp-po-hrm-amis-parity-pay-input-pack-qa-02.FINAL.json) |
| **spec_ref** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` F-PAY-PERIOD-BIND · F-PAY-ADV-BRIDGE · PROCESS SRC-03 · DATA-01 §2/§4 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 packs GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-HRM-07 / browser UF |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Step4 L1 API packs only |
| **Browser Step4 UF / J-HRM-07** | **DENIED** this seat | FE-01 in flight · not claimed |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Product-path L1 · no `pnpm seed:*` |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API Step4 input packs after BE-02 + QA-02 stamp `PAYINPQA2-MSISF85U`. Audited QA MD + FINAL JSON (`overall.verdict=PASS` · 3/3 AC PASS · honesty `payroll_e2e_ready=false` · no seed) + BE root-cause→fix. Proven: open bind **412** `HRM-PAY-ATT-412` · closed bind LIST/GET **200** `timesheetDisplayLabel=QA-BP-ATT-SIGN-DRAFT-SUBMIT-01` / `timesheetStatus=closed` · **no** `s.code` 500 · eligibility **200** `eligible_count=53` HLD-0001 eligible · enroll **201** `HRM-PAY-ENROLL-200` · POST advance employees **201** `HRM-ADV-201` → approve **201** `HRM-ADV-203` → mark-paid+period **201** `HRM-ADV-205` `bridgedInputLineIds.length=1` · `source_kind=advance`. QA pack verify **3/8** = **PROCESS OBS** (missing `command_table` · `portal_url` · `crud_or_matrix` on L1 MD) — this QC consolidates **8/8**. CONDITIONS: **`PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01`** (FE wire POST employees — **already DISPATCHED** 2026-08-07T18:24+07 · do not re-dispatch) · **`C-SLICE-≠-MODULE`**. CLOSED product residuals from QA-01: R-PAY-INP-BIND-SHEET-CODE-COL · R-PAY-SRC-03-PROCESS elig · R-PAY-ADV-EMP-API-ABSENT · R-VAL-INP-ADV-01-NO-EMP-ROWS. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · browser Step4 UF · J-HRM-07 process UAT flip. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC-AMIS-ATT-XFER-01 | LIST/GET 200 · name label · status=closed · no s.code · open 412 | 🟢 **ACCEPT** |
| AC-PAY-ELIG-ENROLL | elig 200 · items=53 · HLD-0001 · enroll 201 | 🟢 **ACCEPT** |
| VAL-INP-ADV-01 | POST emp 201 → approve → mark-paid+period · bridged=1 advance | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | MD + machine | 🟢 **DENIED promote** |
| QA-01 residuals CLOSED | bind code · elig OU · ADV emp · bridge | 🟢 **CLOSED** |
| QA pack 3/8 | command_table · portal_url · crud_or_matrix | 🟡 **PROCESS OBS** — QC consolidates |
| FE wire POST employees | FE-01 DISPATCHED | 🟡 **CONDITION** — OOS L1 · await READY_FOR_QA |
| AMIS DONE / module UAT / Phase1 / ready / J-HRM-07 / browser UF | Explicit DENIED | 🟢 |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · claim browser Step4 UF PASS · re-dispatch FE-01 · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 packs ≠ LIVE process / module UAT · FE Step4 UF open |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim AMIS Step4 L1 input-pack API ACCEPT? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / J-HRM-07 / browser UF? | **NO** |
| Re-dispatch FE-01? | **NO** — already DISPATCHED · await FE READY_FOR_QA → QA browser |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-02 | `po-hrm-amis-parity-pay-input-pack-be-02.md` | READY_FOR_QA | **ACCEPT** — NULL timesheet_code · expand elig OU · POST ADV emp |
| QA-02 L1 | `po-hrm-amis-parity-pay-input-pack-qa-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYINPQA2-MSISF85U` |
| Machine FINAL | `_tmp-…-qa-02.FINAL.json` | PASS | **ACCEPT** overall.verdict PASS · 3 AC |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **3/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| FE-01 | bus `pm -> dev-fe DISPATCHED` 18:24+07 | in flight | 🟡 **CONDITION** — do not duplicate |
| Spec API/DATA-01 | F-PAY-PERIOD-BIND · F-PAY-ADV-BRIDGE · SRC-03 | CONFIRMED | **TRACE OK** |

### Machine JSON spot (`PAYINPQA2-MSISF85U`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYINPQA2-MSISF85U` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` / `browser_uf` / `module_uat` | **false** | 🟢 |
| `ac.AC-AMIS-ATT-XFER-01` | PASS · list/get 200 · label name · codeColBug=false · openNeg=HRM-PAY-ATT-412 | 🟢 |
| `ac.AC-PAY-ELIG-ENROLL` | PASS · elig=200 · eligibleCount=53 · enroll=201/HRM-PAY-ENROLL-200 | 🟢 |
| `ac.VAL-INP-ADV-01` | PASS · HRM-ADV-201/203/205 · bridged=1 · source_kind=advance | 🟢 |
| `overall.verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| period / bind / advance | Sep draft `d92d3bbb-…` · bind `067c7f8a-…` · adv `fab80cac-…` | 🟢 |

---

## Gate AC audit (Step4 L1 packs)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 1 | **AC-AMIS-ATT-XFER-01** closed bind display-ready | LIST/GET **200** · label from **name** · status=closed · no `s.code` · open **412** | 🟢 |
| 2 | **AC-PAY-ELIG-ENROLL** after bind | elig **200** · 53 eligible · HLD-0001 · enroll **201** | 🟢 |
| 3 | **VAL-INP-ADV-01** ADV emp → bridge | POST emp → approve → mark-paid+period · bridged=1 · `source_kind=advance` | 🟢 |
| — | AMIS DONE / module UAT / J-HRM-07 / Phase1 / browser UF | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **L1 Step4 packs** bind→elig→enroll→ADV bridge (in-scope) | BE-02 READY | 🟢 3/3 PASS | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** Lương → phiếu lương process | Historical PASS matrix | **not retested** | ⬜ **DEFERRED** — not claimed / not flipped |
| Browser Step4 UF packs | FE throw until wire | L1 API only | ⬜ **DEFERRED** — FE-01 CONDITION |
| AMIS full parity / module UAT | research | — | ⬜ **OUT** this seat |

**U19 note:** This gate certifies the **L1 Step4 input-pack API** named in dispatch — **not** a claim that **J-HRM-07** / AMIS DONE / module payroll UAT / browser UF is newly GO. Missing browser journey does **not** NO-GO this L1 seat; it **forces GWC CONDITION** (`FE-01` + `C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — input packs)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Open timesheet bind | Create deny | **PASS** (412 HRM-PAY-ATT-412) |
| Closed timesheet bind | Create | **PASS** (insert / dup ok) |
| LIST/GET timesheet-binds | Read | **PASS** (200 · display-ready name label) |
| GET eligibility after bind | Read | **PASS** (200 · eligible_count=53) |
| POST enroll HLD-0001 | Create | **PASS** (201 HRM-PAY-ENROLL-200) |
| POST advance-request employees | Create | **PASS** (201 HRM-ADV-201) |
| Approve advance | Update | **PASS** (201 HRM-ADV-203) |
| Mark-paid without payrollPeriodId | Update deny | **PASS** (400 requires period) |
| Mark-paid + payrollPeriodId | Update + bridge | **PASS** (201 HRM-ADV-205 · bridged=1) |
| Browser Step4 UF packs | — | **N/A** — DENIED this seat · FE-01 |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **3/8** | **PROCESS OBS** | Missing command_table · portal_url · crud_or_matrix on L1 MD — **not** product demote; QC pack consolidates |
| AC 3/3 L1 packs | **PRODUCT OK** | Slice ACCEPT |
| QA-01 P0 residuals CLOSED | **PRODUCT OK** | bind SQL · elig OU · ADV emp API |
| FE POST employees throw until wire | **SCOPE CONDITION** | FE-01 already DISPATCHED — GWC CONDITION · not L1 NO-GO |
| Unauth employees probe **400** VAL (vs 401) | **PROCESS / ENV OBS** | Route live (DTO validation) · not product FAIL |
| No P0/P1 product residual on L1 AC | **PRODUCT OK** | L1 Step4 packs ACCEPT |
| AMIS / Phase1 / ready / J-HRM-07 / module / browser | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **L1 Step4 input packs AC** | — | `qa`/`qc` | **CLOSED / ACCEPT** | ATT-XFER · ELIG-ENROLL · VAL-INP-ADV |
| **R-PAY-INP-BIND-SHEET-CODE-COL** | P0 | — | **CLOSED** | no s.code · name label |
| **R-PAY-SRC-03-PROCESS** (elig empty) | P0 | — | **CLOSED** | eligible_count=53 · enroll 201 |
| **R-PAY-ADV-EMP-API-ABSENT** | P0 | — | **CLOSED** | HRM-ADV-201 product path |
| **R-VAL-INP-ADV-01-NO-EMP-ROWS** | P0 | — | **CLOSED** | bridged=1 advance |
| **PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01** | P1 | `dev-fe` | **CONDITION** · **DISPATCHED** | Wire FE POST employees · **do not re-dispatch** |
| **Browser Step4 UF** | P1 | `qa` after FE | **DEFERRED** | After FE READY_FOR_QA |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process UAT | L2.5 | `qa` later | **DEFERRED** | Not flipped this seat |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0 product residuals for this L1 WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `FE-01` (already DISPATCHED) + `C-SLICE-≠-MODULE` — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / browser UF / J-HRM-07 GO; **not** product NO-GO for certified L1 Step4 packs.

**Idle-ok for L1 packs board:** no forced new residual Task this turn — await FE-01 READY_FOR_QA then QA browser UF (PM already dispatched FE).

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-02.md` | exit **1** · **3/8** (command_table · portal_url · crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYINPQA2-MSISF85U` | **PASS** · AC 3/3 ok | PRODUCT OK (cited) |
| BE-02 jest / build (cited) | 9 suites · 138 tests PASS · nest build PASS | PRODUCT OK (cited) |
| Bus FE-01 DISPATCHED | 2026-08-07T18:24+07 | GOVERNANCE OK — CONDITION not duplicate |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 Step4 input packs gate — **GO WITH CONDITIONS**.  
2. Audited QA-02 MD + FINAL JSON stamp `PAYINPQA2-MSISF85U` + BE-02 — AC-AMIS-ATT-XFER-01 · AC-PAY-ELIG-ENROLL · VAL-INP-ADV-01 **ACCEPT**.  
3. CLOSED QA-01 P0: s.code bind · eligibility OU · ADV emp API · advance bridge.  
4. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · browser UF **DENIED** · J-HRM-07 **DENIED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. CONDITIONS **`FE-01`** (DISPATCHED · no re-dispatch) + **`C-SLICE-≠-MODULE`**.  
7. Explicit **NO** to PM promote ready / AMIS DONE / module UAT / browser UF.

### Residual

- **FE-01** CONDITION — await `dev-fe` READY_FOR_QA → QA browser Step4 UF.  
- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE · **NOT** J-HRM-07 flip.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC L1 Step4 packs · stamp PAYINPQA2-MSISF85U · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / J-HRM-07 / module UAT / browser UF · FE-01 already DISPATCHED — await FE then QA browser · **do not** re-dispatch FE-01 |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01 (await / no re-dispatch)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-01.md
stamp_qa: PAYINPQA2-MSISF85U

## Status
- L1 Step4 input packs (AC-AMIS-ATT-XFER-01 · AC-PAY-ELIG-ENROLL · VAL-INP-ADV-01) = ACCEPT GWC
- CLOSED: s.code · eligibility OU · ADV emp API + bridge
- CONDITIONS: FE-01 (already DISPATCHED) · C-SLICE-≠-MODULE
- payroll_e2e_ready=false LOCKED · no AMIS DONE · no module UAT · no Phase1 · no J-HRM-07 · no browser UF claim

## Action
1) Do NOT re-dispatch FE-01 — already DISPATCHED 2026-08-07T18:24+07
2) When FE-01 READY_FOR_QA → Task qa browser Step4 UF (U65) with evidence path from FE handoff
3) Run pnpm run pm:idle:check for other open P0 outside this closed L1 packs seat

cấm: flip payroll_e2e_ready · claim AMIS DONE · Phase1 DONE · J-HRM-07 process · module UAT · browser UF PASS without FE+QA · re-dispatch FE-01
```
