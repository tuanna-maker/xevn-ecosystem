# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser U65 Chi trả wire UF** (not L1 API rewrite · not module UAT · not AMIS Step7 DONE · not J-HRM-07) |
| **priority** | P2 |
| **resume_chunk** | K6.4 |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-03` |
| **prior** | QA-03 **PASS** stamp **`PAYWIREQA3-IWB7V2`** · FE-01 READY_FOR_QA · L1 **QC-01 GWC SEAL** |
| **portal_url** | `http://127.0.0.1:5173` · HRM API `:28001` · XBOS `:28002` |
| **journey_l25** | Chi trả → wire-payment-batch → detail + F5 — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — browser **R-PAY-WIRE-FE** ACCEPT · **CLOSED** as browser UF |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-payment-wire-qa-03.md`](po-hrm-amis-parity-pay-payment-wire-qa-03.md) stamp **`PAYWIREQA3-IWB7V2`** |
| **fe_ref** | [`po-hrm-amis-parity-pay-payment-wire-fe-01.md`](po-hrm-amis-parity-pay-payment-wire-fe-01.md) READY_FOR_QA |
| **l1_seal** | [`po-hrm-amis-parity-pay-payment-wire-qc-01.md`](po-hrm-amis-parity-pay-payment-wire-qc-01.md) GWC L1 — **RETAINED · not reopened** |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03-browser.json`](_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-payment-wire-qa-03/` (00–06 cited in JSON) |
| **spec_ref** | AMIS Step7 Chi trả · FE CTA → `POST …/wire-payment-batch` · HDSD tab Chi trả |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no L1 BE rewrite |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser wire GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS Step7 DONE** | **DENIED** | Browser wire UF only |
| **J-HRM-07 DONE** | **DENIED** | Not claimed / not retested as process e2e |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Existing processed periods · no `pnpm seed:*` |
| **L1 wire BE rewrite** | **DENIED** | QC-01 SEAL **RETAINED** · `l1_api_spine_reopened=false` |
| **`C-SLICE-≠-MODULE`** | **RETAINED** | governance CONDITION |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 **Chi trả → wire-payment-batch** after FE-01 + QA-03 PASS stamp `PAYWIREQA3-IWB7V2`. Audited QA-03 MD + browser JSON (`overall=PASS` · `honesty.payroll_e2e_ready=false` · `seed_used=false` · `l1_api_spine_reopened=false` · all AC PASS) + FE-01 contract + L1 QC-01 SEAL. Proven chain: L0 HRM/XBOS/portal **200** → tab **Chi trả lương** → CTA **Chi trả** → picker processed period `cf38deac-…` (`QA-PAY-HIRE-1786011557288` · `main`) → **POST** `…/wire-payment-batch` **201** `HRM-PAY-WIRE-201` with body `company_id=main` · name stamp · `payment_method=bank_transfer` → FE toast + auto-open detail · records **rows=1** → F5 list/detail persist. **CLOSED:** `R-PAY-WIRE-FE` as **browser UF**. **RETAINED:** L1 QC-01 SEAL (dept-col / idempotent / process-close) — **cấm reopen**. QA pack verify **2/8** = **PROCESS OBS** (missing `command_table` · `crud_or_matrix`) — this QC consolidates **8/8**. OBS idle-ok: duplicate `pay-payment-precision` testid · Badge DOM nesting soft warnings · ENV dual `hrm-api` EADDRINUSE (resolved before PASS) · F5 rollup list may surface another batch row while detail still rows≥1. **DENIED** `payroll_e2e_ready=true` · AMIS Step7 DONE · J-HRM-07 · module UAT · Phase1 DONE · L1 BE rewrite. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Entry stamp `PAYWIREQA3-IWB7V2` | QA-03 · machine JSON | 🟢 **ACCEPT** |
| L0 stack 200 | QA-03 · this QC `qc:dev-stack` | 🟢 **ENV OK** |
| HDSD click path Chi trả | AC NAV / WIRE-DIALOG / PICK | 🟢 **ACCEPT** |
| POST wire **201** `HRM-PAY-WIRE-201` | Network · body company_id | 🟢 **ACCEPT** |
| FE detail + records after 2xx | onDetail · rows=1 · idempotent skip OK | 🟢 **ACCEPT** |
| F5 list + detail persist | F5-PERSIST PASS · rows=1 | 🟢 **ACCEPT** |
| Honesty locks / L1 not reopened | machine honesty | 🟢 **ACCEPT** |
| **R-PAY-WIRE-FE** | FE-01 → QA-03 browser | 🟢 **CLOSED** browser UF |
| L1 QC-01 SEAL | qc-01 GWC | 🟢 **RETAINED** — not reopened |
| QA pack 2/8 | command_table · crud_or_matrix | 🟡 **PROCESS OBS** — QC consolidates |
| Duplicate testid / Badge nesting | console soft | 🟡 **OBS idle-ok** P3 |
| ENV dual hrm-api | QA ENV OBS | 🟡 **ENV OBS** — not product FAIL |
| AMIS / module / Phase1 / ready / J-HRM-07 | Explicit DENIED | 🟢 |
| **C-SLICE-≠-MODULE** | governance | 🟡 **CONDITION** |

**Cấm:** invent `payroll_e2e_ready=true` · claim AMIS Step7 DONE · J-HRM-07 · module UAT · Phase1 DONE · reopen L1 wire BE rewrite · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · browser wire UF ≠ LIVE process / module UAT / AMIS Step7 DONE / J-HRM-07 |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim **R-PAY-WIRE-FE** CLOSED (browser UF)? | **YES** — this seat GWC |
| May PM claim L1 wire spine still SEALED? | **YES** — QC-01 retained · not reopened |
| May PM claim AMIS Step7 DONE / module UAT / Phase1 / J-HRM-07? | **NO** |
| Forced residual dispatch this turn? | **NO** — idle-ok P3 OBS only |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| L1 QC-01 GWC SEAL | `…-wire-qc-01.md` stamp QA-02 `PAYWIRE-MSIRV99D` | PASS_TO_PM · CONDITION was R-PAY-WIRE-FE | 🟢 **RETAIN** — cấm reopen |
| FE-01 | `…-wire-fe-01.md` | READY_FOR_QA | 🟢 **ACCEPT** CTA → L1 POST |
| QA-03 browser U65 | `…-wire-qa-03.md` | PASS_TO_PM | 🟢 **ACCEPT** stamp `PAYWIREQA3-IWB7V2` |
| Machine QA-03 | `_tmp-…-qa-03-browser.json` | overall **PASS** | 🟢 **ACCEPT** |
| Screens 00–06 | JSON `screens[]` paths | cited present | 🟢 **ACCEPT** (path cite) |
| Pack verify QA-03 | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** |
| L0 spot QC | `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** | 🟢 **ENV OK** (Windows UV assert after success = ENV OBS) |
| Pack verify QC-02 | this file | expected **PASS** exit **0** · **8/8** | QC pack SoT |

### Machine JSON spot (`PAYWIREQA3-IWB7V2`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYWIREQA3-IWB7V2` | 🟢 |
| `overall` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` | **false** | 🟢 |
| `honesty.module_uat_claimed` / `amis_step7_done_claimed` / `j_hrm_07_done_claimed` | **false** | 🟢 |
| `honesty.l1_api_spine_reopened` | **false** | 🟢 **SEAL held** |
| `l0` | hrm/xbos/portal **200** | 🟢 |
| `POST-WIRE-201` | **201** `HRM-PAY-WIRE-201` · added=0 · skipped=1 | 🟢 idempotent OK |
| `POST-BODY-COMPANY-ID` | `company_id=main` | 🟢 |
| `FE-DETAIL-RECORDS` | onDetail · rows=1 | 🟢 |
| `F5-PERSIST` | listVisible · detailRows=1 | 🟢 |
| `CONSOLE-GATE` | PASS · 2 soft validateDOMNesting | 🟢 soft ≠ Uncaught |
| `pageErrors` | **[]** | 🟢 |
| Fixture period / batch | `cf38deac-…` · batch `7d0b8e23-…` | 🟢 |

---

## Gate AC audit (browser U65 — R-PAY-WIRE-FE)

| # | Expected | Observed | QC |
|---|----------|----------|-----|
| 1 | L0 stack | 200/200/200 | 🟢 |
| 2 | ≥1 processed period · no seed | processed=6 | 🟢 |
| 3 | Tab Chi trả lương | `payroll-tab-payment` | 🟢 |
| 4 | Wire dialog open | precision dialog | 🟢 |
| 5 | Pick processed period | HIRE `main` period | 🟢 |
| 6 | POST wire 201 + code | **201** `HRM-PAY-WIRE-201` | 🟢 |
| 7 | Body `company_id` | `main` | 🟢 |
| 8 | FE detail + records | rows=1 · toast | 🟢 |
| 9 | F5 persist | list + detail | 🟢 |
| 10 | Honesty / L1 seal | ready=false · spine not reopened | 🟢 |
| 11 | AMIS / module / J-HRM-07 / Phase1 | Not claimed | ⬜ **OUT OF SCOPE** |

### L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-03 | QC |
|-----------------|-------|-------|-----|
| **Browser Chi trả → wire → detail → F5** (in-scope) | FE-01 · QC-01 CONDITION | 🟢 PASS | 🟢 **PASS / ACCEPT** · **R-PAY-WIRE-FE CLOSED** |
| **L1 wire → idempotent → process → close** | QC-01 GWC | **not reopened** | 🟢 **SEAL RETAINED** |
| **J-HRM-07** Lương → phiếu lương process | Historical | **not claimed** | ⬜ **DEFERRED** — honesty false |
| AMIS Step7 full DONE / module UAT | research | — | ⬜ **OUT** — DENIED |

**U19 note:** This gate certifies the **browser Chi trả wire UF** named in dispatch — **not** a claim that **J-HRM-07** / AMIS Step7 DONE / module payroll UAT / L1 spine rewrite is newly GO. Missing process e2e does **not** NO-GO this browser seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`. L1 QC-01 remains sealed.

### CRUD / mutate matrix (browser U65 — wire FE)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| GET payment-batches (tab load) | Read | **PASS** (200) |
| POST `…/periods/:id/wire-payment-batch` via FE CTA | Create (batch wire) | **PASS** (201 WIRE-201 · idempotent skip OK) |
| GET payment-batches/:id/records (auto detail) | Read | **PASS** (rows=1) |
| F5 → list + open detail | Read persist | **PASS** |
| Process-all / close period | Update | **N/A** — not in this browser seat (L1 sealed separately) |
| Seed / hard-delete | Seed / Delete | **N/A** — denied |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-03 pack verify **2/8** | **PROCESS OBS** | Missing `command_table` · `crud_or_matrix` on QA MD — **not** product demote; QC pack consolidates |
| Browser wire CTA → 201 → detail → F5 | **PRODUCT OK** | Closes R-PAY-WIRE-FE as browser UF |
| L1 spine not reopened | **PRODUCT OK** | QC-01 SEAL retained |
| Duplicate testid / Badge nesting soft | **OBS** | P3 polish · idle-ok |
| Dual hrm-api EADDRINUSE then recovered | **ENV OBS** | Not R-PAY-WIRE-DEPT-COL reopen |
| F5 rollup may show other batch label | **OBS** | harness still assert rows≥1 · idle-ok |
| Missing J-HRM-07 / module UAT / ready flip | **SCOPE / CONDITION** | Blocks ready=true · **not** browser wire product NO-GO |
| L0 stack 200 · Windows UV after success | **ENV OK / ENV OBS** | Product health OK |
| No P0/P1 product residual on R-PAY-WIRE-FE | **PRODUCT OK** | Slice ACCEPT |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-WIRE-FE** | P2 was | `dev-fe`/`qa` | **CLOSED** browser UF | CTA → 201 → detail → F5 |
| **L1 QC-01 SEAL** | governance | `qc`/`pm` | **RETAINED** | cấm reopen BE wire rewrite |
| **`C-SLICE-≠-MODULE`** | honesty | `pm`/`qc` | **CONDITION** | Browser wire GWC ≠ module UAT / AMIS DONE / Phase1 |
| **OBS duplicate testid** | P3 | `dev-fe` | **OBS idle-ok** | `pay-payment-precision` KPI+table |
| **OBS Badge DOM nesting** | P3 | `dev-fe` | **OBS idle-ok** | validateDOMNesting soft |
| **ENV dual hrm-api** | ops | `devops` | **OBS idle-ok** | Stabilize single `:28001` for UAT |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process UAT | L2.5 | `qa` later | **DEFERRED** | When program opens full process |

**P0/P1 product residuals for this browser wire WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` (+ idle-ok P3 OBS) — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / J-HRM-07; **not** product NO-GO for certified browser Chi trả wire UF. L1 SEAL retained separately.

**Idle-ok:** browser R-PAY-WIRE-FE board closed — **no forced residual Task** this turn.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-03.md` | exit **1** · **2/8** (command_table · crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **HTTP 200** | **ENV OK** (Windows UV assert after success ignored) |
| QA harness (prior) `node scripts/qa/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03.mjs` | **PASS** · stamp `PAYWIREQA3-IWB7V2` | PRODUCT OK (cited) |
| L1 seal cite | `po-hrm-amis-parity-pay-payment-wire-qc-01.md` GWC | PRODUCT OK · **RETAINED** |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · did **not** reopen L1 BE · observe-only pack + JSON + L0 spot.

---

## completion_report

### Closed

1. QC browser Chi trả wire UF gate — **GO WITH CONDITIONS**.  
2. Audited QA-03 MD + browser JSON stamp `PAYWIREQA3-IWB7V2` + FE-01 + L1 QC-01 — AC chain **ACCEPT**.  
3. **CLOSED:** `R-PAY-WIRE-FE` as **browser UF**.  
4. **RETAINED:** L1 QC-01 SEAL · **`C-SLICE-≠-MODULE`**.  
5. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED** · L1 rewrite **DENIED**.  
6. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
7. Explicit **NO** to PM promote ready / AMIS Step7 DONE.  
8. **Idle-ok** — no forced residual dispatch for this browser wire board.

### Residual

- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- P3 OBS duplicate testid / Badge nesting / ENV dual-watcher — idle-ok.  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS Step7 DONE · **NOT** J-HRM-07.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC browser R-PAY-WIRE-FE CLOSED · stamp PAYWIREQA3-IWB7V2 · L1 QC-01 SEAL retained · **cấm** flip `payroll_e2e_ready` / AMIS Step7 DONE / Phase1 / J-HRM-07 / module UAT · **idle-ok** unless NEW P0 outside this seat |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
priority: P2
resume_chunk: K6.4
prior: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-02 GO WITH CONDITIONS
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-03

## Mission (PM intake)
Browser Chi trả wire UF GWC ACCEPT · R-PAY-WIRE-FE CLOSED as browser UF.
RETAIN L1 QC-01 SEAL (cấm reopen API spine) · RETAIN C-SLICE-≠-MODULE.
payroll_e2e_ready=false LOCKED.

## Decision
IDLE-OK this browser wire UF seat (K6.4 browser residual closed).
Run pnpm run pm:idle:check — dispatch only if NEW P0/P1 open outside this closed seat.

## Explicit DENY
- payroll_e2e_ready=true
- AMIS Step7 DONE
- J-HRM-07 DONE
- module payroll UAT
- Phase1 DONE
- L1 wire BE rewrite / reopen QC-01

## evidence
docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-02.md
docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-03.md (stamp PAYWIREQA3-IWB7V2)
docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md (L1 SEAL)

## ack
PASS_TO_PM · idle-ok this seat
```
