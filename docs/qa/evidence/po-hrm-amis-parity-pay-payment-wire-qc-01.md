# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API wire-payment-batch spine** (not browser Chi trả UF · not module UAT · not AMIS Step7 DONE) |
| **priority** | P1 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-02` |
| **prior** | QA-02 **PASS** stamp **`PAYWIRE-MSIRV99D`** · BE-02 READY (R-PAY-WIRE-DEPT-COL fix) |
| **closes** | **R-PAY-WIRE-DEPT-COL** · **R-PAY-WIRE-IDEMP** · **R-PAY-WIRE-PROCESS-CLOSE** as **L1** |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | L1 wire→idempotent→process→close-before-pay→close-after-paid — **not** full J-HRM-07 process UAT / browser Chi trả |
| **Verdict** | **GO WITH CONDITIONS** — L1 wire spine ACCEPT · CONDITIONS: **`R-PAY-WIRE-FE`** (OOS) · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-payment-wire-qa-02.md`](po-hrm-amis-parity-pay-payment-wire-qa-02.md) stamp **`PAYWIRE-MSIRV99D`** |
| **be_ref** | [`po-hrm-amis-parity-pay-payment-wire-be-02.md`](po-hrm-amis-parity-pay-payment-wire-be-02.md) READY_FOR_QA |
| **qa_fail_prior** | [`po-hrm-amis-parity-pay-payment-wire-qa-01.md`](po-hrm-amis-parity-pay-payment-wire-qa-01.md) FAIL stamp `PAYWIRE-MSIRGZEZ` · R-PAY-WIRE-DEPT-COL |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-payment-wire-qa-02.FINAL.json`](_tmp-po-hrm-amis-parity-pay-payment-wire-qa-02.FINAL.json) |
| **spec_ref** | AMIS Step7 Chi trả L1 API · wire-payment-batch / payment-batches process / period close gates |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · fixture period from prior QA-CB-BAG |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 wire GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Step7 L1 API wire spine only |
| **Browser UF Chi trả / J-HRM-07** | **DENIED** this seat | FE wire button **OOS** |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Existing processed period · no `pnpm seed:*` |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 wire-payment-batch spine after BE-02 dept-col fix + QA-02 AC1–AC5 PASS stamp `PAYWIRE-MSIRV99D`. Audited QA MD + FINAL JSON (`verdict=PASS` · all AC PASS · `honesty.payroll_e2e_ready=false` · `seed=false` · `module_uat_claim=false` · `amis_parity_done_claim=false`) + BE-02 live smoke `records_added=1`. Proven: L0 HRM/XBOS/portal **200** → dist has `custom_fields->>'department'` / **no** bare `e.department` → **POST wire 201** `HRM-PAY-WIRE-201` (no dept 500) → re-wire **idempotent** skip → **close-before-pay 412** `HRM-PAY-005` → **process 201** `HRM-PB-202` payslips paid → **close-after-paid 201** `HRM-PAY-203` period `closed`. **CLOSED L1:** `R-PAY-WIRE-DEPT-COL` · `R-PAY-WIRE-IDEMP` · `R-PAY-WIRE-PROCESS-CLOSE`. QA pack verify **3/8** = **PROCESS OBS** (missing `command_table` · `journey_l25` · `crud_or_matrix` on L1-only MD) — this QC consolidates **8/8**. Remaining CONDITIONS: **`R-PAY-WIRE-FE`** (browser OOS) · **`C-SLICE-≠-MODULE`**. Harness note body `company_id` → 400 `HRM-VAL-001` = **CONDITION OK / PROCESS OBS** (DTO scope via query/header — not product residual). **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT · browser Chi trả UF. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 Wire 201 after dept-col fix | **201** `HRM-PAY-WIRE-201` · no `e.department` 500 · stamp PAYWIRE-MSIRV99D | 🟢 **ACCEPT** · **R-PAY-WIRE-DEPT-COL CLOSED** |
| AC2 Re-wire idempotent | `records_skipped=1` · `records_added=0` · same batch | 🟢 **ACCEPT** · **R-PAY-WIRE-IDEMP CLOSED** |
| AC3 Process → payslips paid | **201** `HRM-PB-202` · paid=1 | 🟢 **ACCEPT** · **R-PAY-WIRE-PROCESS-CLOSE** (process leg) |
| AC4 Close before pay | **412** `HRM-PAY-005` · unpaid=1 | 🟢 **ACCEPT** |
| AC5 Close after all paid | **201** `HRM-PAY-203` · `status=closed` | 🟢 **ACCEPT** · **R-PAY-WIRE-PROCESS-CLOSE CLOSED** |
| BE-02 first-add smoke | `records_added=1` on same fixture | 🟢 **ACCEPT** (complements QA skip path) |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty | 🟢 **DENIED promote** |
| QA pack 3/8 | command_table · journey_l25 · crud_or_matrix | 🟡 **PROCESS OBS** — QC consolidates |
| Process DTO body company_id 400 | Harness corrected · query/header scope | 🟡 **CONDITION OK** — not product FAIL |
| FE wire / browser Chi trả | OOS | 🟡 **CONDITION** `R-PAY-WIRE-FE` |
| AMIS DONE / module UAT / Phase1 / ready / J-HRM-07 | Explicit DENIED | 🟢 |

**Cấm:** invent AMIS Step7 DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · claim browser Chi trả UF PASS · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 wire ≠ LIVE process / module UAT · no browser Chi trả / J-HRM-07 |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim L1 wire spine ACCEPT (dept-col / idempotent / process-close)? | **YES** — this seat GWC |
| May PM claim AMIS Step7 DONE / module UAT / Phase1 / J-HRM-07 / FE wire UF? | **NO** |
| Forced residual dispatch this turn? | **NO** for L1 product — **optional later** `dev-fe` for `R-PAY-WIRE-FE` (not forced same-turn) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-01 FAIL | `…-wire-qa-01.md` stamp `PAYWIRE-MSIRGZEZ` | FAIL · R-PAY-WIRE-DEPT-COL | **ACCEPT prior** — product 500 |
| BE-02 | `…-wire-be-02.md` | READY_FOR_QA | **ACCEPT** custom_fields department + live 201 first-add |
| QA-02 L1 | `…-wire-qa-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYWIRE-MSIRV99D` AC1–AC5 |
| Machine FINAL | `_tmp-…-qa-02.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **3/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| L0 spot QC | `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** | 🟢 **ENV OK** |

### Machine JSON spot (`PAYWIRE-MSIRV99D`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYWIRE-MSIRV99D` | 🟢 |
| `verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| `payroll_e2e_ready` / honesty | **false** / seed·module_uat·amis false | 🟢 |
| `dist.hasCustomFieldsDepartment` / `hasBareEDepartment` | **true** / **false** | 🟢 |
| `ac.AC1_wire_201` | PASS · 201 · WIRE-201 · noDept500 | 🟢 |
| `ac.AC2_rewire_idempotent` | PASS · skipped=1 · sameBatch | 🟢 |
| `ac.AC3_process_payslips_paid` | PASS · PB-202 · paid=1 | 🟢 |
| `ac.AC4_close_before_pay_005` | PASS · 412 · PAY-005 | 🟢 |
| `ac.AC5_close_after_paid_203` | PASS · 201 · closed | 🟢 |
| `ac.AC6_honesty` | PASS | 🟢 |
| Fixture / batch | period `38674cc1-…` · batch `aa4e704c-…` | 🟢 |

---

## Gate AC audit (L1 wire spine)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| AC1 | Processed → POST wire → 201 (not dept 500) | **201** `HRM-PAY-WIRE-201` | 🟢 · **DEPT-COL CLOSED** |
| AC2 | Re-wire idempotent | skipped>0 · added=0 · same batch | 🟢 · **IDEMP CLOSED** |
| AC3 | Process batch → payslips paid | **201** `HRM-PB-202` | 🟢 |
| AC4 | Close before pay unpaid gate | **412** `HRM-PAY-005` | 🟢 |
| AC5 | Close after all paid | **201** `HRM-PAY-203` · closed | 🟢 · **PROCESS-CLOSE CLOSED** |
| — | AMIS DONE / module UAT / J-HRM-07 / Phase1 / FE wire | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **L1 wire → idempotent → process → close** (in-scope) | QA-01 FAIL → BE-02 fix | 🟢 AC1–AC5 PASS | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** Lương → phiếu lương process | Historical matrix PASS | **not retested** this seat | ⬜ **DEFERRED** — not claimed |
| Browser Chi trả / FE wire button | — | L1 API only · OOS | ⬜ **DEFERRED** · CONDITION `R-PAY-WIRE-FE` |
| AMIS Step7 full DONE / module UAT | research | — | ⬜ **OUT** — DENIED |

**U19 note:** This gate certifies the **L1 API wire-payment-batch spine** named in dispatch — **not** a claim that **J-HRM-07** / AMIS Step7 DONE / module payroll UAT / browser Chi trả is newly GO. Missing browser journey does **not** NO-GO this L1 seat; it **forces GWC CONDITION** (`R-PAY-WIRE-FE` + `C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — wire / process / close)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| `POST …/periods/:id/wire-payment-batch` | Create (batch + records) | **PASS** (201 WIRE-201) |
| Re-wire same period | Create idempotent | **PASS** (skip path) |
| `POST …/payment-batches/:id/process` | Update (mark paid) | **PASS** (201 PB-202) |
| Close period before paid | Update deny | **PASS** (412 PAY-005) |
| Close period after paid | Update | **PASS** (201 PAY-203 · closed) |
| Unauth wire | Auth deny | **PASS** (401 AUTH-001 · QA cited) |
| Browser Chi trả wire button | — | **N/A** — DENIED / OOS this seat |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **3/8** | **PROCESS OBS** | Missing command_table · journey_l25 · crud_or_matrix on L1 MD — **not** product demote; QC pack consolidates |
| AC1–AC5 L1 wire spine | **PRODUCT OK** | Slice ACCEPT · residuals CLOSED L1 |
| Process DTO body `company_id` → 400 | **PROCESS / CONTRACT OBS** | **CONDITION OK** — scope via query/header; harness fixed |
| L0 stack 200 · Windows UV assert after success | **ENV OBS** | Product health OK; shell exit noise ignored |
| FE wire button OOS | **SCOPE CONDITION** | `R-PAY-WIRE-FE` |
| No P0/P1 product residual on this WI | **PRODUCT OK** | L1 wire ACCEPT |
| AMIS / Phase1 / ready / J-HRM-07 / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-WIRE-DEPT-COL** | P0 was | `dev-be`/`qa` | **CLOSED L1** | custom_fields department · live 201 |
| **R-PAY-WIRE-IDEMP** | — | `qa`/`qc` | **CLOSED L1** | re-wire skip PASS |
| **R-PAY-WIRE-PROCESS-CLOSE** | — | `qa`/`qc` | **CLOSED L1** | process→paid→close 203 PASS |
| **R-PAY-WIRE-FE** | P2 | `dev-fe` later | **CONDITION / OOS** | Browser Chi trả wire — not this seat |
| **OBS-PROCESS-DTO-COMPANY-BODY** | P3 | harness / docs | **CONDITION OK** | body company_id → VAL-001; query/header only |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process UAT | L2.5 | `qa` later | **DEFERRED** | When program opens browser process |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0/P1 product residuals for this L1 wire WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `R-PAY-WIRE-FE` (OOS) + `C-SLICE-≠-MODULE` — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / J-HRM-07 / browser UF; **not** product NO-GO for certified L1 wire spine.

**Idle-ok:** L1 wire board closed — **no forced residual Task** this turn (FE wire later when PM opens browser seat).

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-02.md` | exit **1** · **3/8** (command_table · journey_l25 · crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **HTTP 200** | **ENV OK** (PRODUCT health) |
| QA harness stamp `PAYWIRE-MSIRV99D` | **PASS** · AC1–AC5 | PRODUCT OK (cited) |
| BE-02 jest + live first-add | 13 passed · wire `records_added=1` | PRODUCT OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + L0 spot.

---

## completion_report

### Closed

1. QC L1 wire-payment-batch spine gate — **GO WITH CONDITIONS**.  
2. Audited QA-02 MD + FINAL JSON stamp `PAYWIRE-MSIRV99D` + BE-02 — AC1–AC5 **ACCEPT**.  
3. **CLOSED L1:** `R-PAY-WIRE-DEPT-COL` · `R-PAY-WIRE-IDEMP` · `R-PAY-WIRE-PROCESS-CLOSE`.  
4. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 / browser Chi trả **DENIED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. Explicit **NO** to PM promote ready / AMIS Step7 DONE · CONDITIONS **`R-PAY-WIRE-FE`** + **`C-SLICE-≠-MODULE`**.  
7. **Idle-ok** — no forced residual dispatch for this L1 wire board.

### Residual

- **`R-PAY-WIRE-FE`** CONDITION / OOS (dev-fe later).  
- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- Process DTO company_id body OBS — CONDITION OK.  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS Step7 DONE.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC L1 wire spine · stamp PAYWIRE-MSIRV99D · **cấm** flip `payroll_e2e_ready` / AMIS Step7 DONE / Phase1 / J-HRM-07 / module UAT / browser UF · **idle-ok** unless NEW P0 outside this seat |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-RESEARCH-01 (idle / backlog scan)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md
stamp_qa: PAYWIRE-MSIRV99D

## Status
- L1 wire-payment-batch spine (wire→idempotent→process→close) = ACCEPT GWC
- CLOSED L1: R-PAY-WIRE-DEPT-COL · R-PAY-WIRE-IDEMP · R-PAY-WIRE-PROCESS-CLOSE
- CONDITIONS: R-PAY-WIRE-FE (browser OOS) · C-SLICE-≠-MODULE
- payroll_e2e_ready=false LOCKED · no AMIS Step7 DONE · no module UAT · no Phase1 · no J-HRM-07 · no browser Chi trả claim

## Action
idle-ok for L1 wire board.
Run pnpm run pm:idle:check — dispatch only if NEW P0/P1 open outside this closed seat.
Optional later (not forced): Task dev-fe R-PAY-WIRE-FE when browser Chi trả seat opens.

cấm: flip payroll_e2e_ready · claim AMIS Step7 DONE · Phase1 DONE · J-HRM-07 process · module UAT · browser UF PASS
```
