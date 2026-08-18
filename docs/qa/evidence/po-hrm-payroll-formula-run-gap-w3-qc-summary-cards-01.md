# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-SUMMARY-CARDS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-SUMMARY-CARDS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **W3 FE summary-cards browser slice** (R-PAY-W3-FE-SUMMARY-ZERO) — **not** formula LIVE · **not** J-HRM-07 e2e-ready · **not** module UAT |
| **priority** | P3 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01` |
| **prior** | QA stamp **`PAYW3SUMQA-MSIWD3MS`** PASS_TO_PM · FE-SUMMARY-CARDS READY_FOR_QA · process-post QC GWC **must_keep** |
| **closes** | **R-PAY-W3-FE-SUMMARY-ZERO** (browser) — supersedes process-post GWC OBS idle-ok |
| **resume_chunk** | **K6.5** |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** header summary cards slice only — **DENY** full e2e / DoD |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.md`](po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.md) stamp **`PAYW3SUMQA-MSIWD3MS`** |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md`](po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md) |
| **qc_process_baseline** | [`po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md`](po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md) GWC — **RETAINED · do not reopen** · OBS summary-cards-zero → **CLOSED this seat** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.json`](_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01/` (cited `04-after-f5.png`) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` locked · LIVE DENIED · J-HRM-07 e2e DENIED |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **LOCKED** — QA no process this run; prior process body false retained · **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | Cards = display-ready line aggregate — **no** FE formula invent |
| **J-HRM-07 e2e-ready / full DoD** | **DENIED** | Cards slice only |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | `u65=zero-seed` · `seed_used=false` |
| **process-post GWC / TDZ / SRC** | **RETAINED CLOSED** | **must_keep · not reopened** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT W3 browser **summary-cards** slice after FE line-aggregate bind + QA U65 retest stamp `PAYW3SUMQA-MSIWD3MS`. Audited QA MD + machine JSON + screen `04-after-f5.png` + FE evidence + process-post QC GWC must_keep. Proven on processed Aug period **`cf38deac`** (**NOT** `d92d3bbb`): header **Tổng lương Gross / Net = 12.345.000 ₫** match payslip line UAT-0100 + API `gross_amount`/`net_amount` **12345000**; `data-totals-source=line_aggregate`; F5 → re-open → same. **R-PAY-W3-FE-SUMMARY-ZERO CLOSED**. Process-post GWC / TDZ / SRC **not reopened**. Honesty **LOCKED** `payroll_e2e_ready=false`.

**NOT Phase 1 DONE. NOT module payroll UAT. NOT formula LIVE. NOT J-HRM-07 e2e-ready / full DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `PAYW3SUMQA-MSIWD3MS` | QA MD + machine `stamp` · `verdict=PASS` | 🟢 **ACCEPT** |
| Target `cf38deac` ≠ `d92d3bbb` | `periodId=cf38deac-…` · `skipProcessed=d92d3bbb-…` | 🟢 **ACCEPT** |
| Cards Gross/Net **12.345.000 ₫** | beforeF5 + afterF5 · screen `04-after-f5.png` | 🟢 **ACCEPT** |
| Cards = line UAT-0100 | table base/net **12.345.000 ₫** · machine `cards_match_line_ui` | 🟢 **ACCEPT** |
| Cards = API | GET payslips period **200** · gross/net **12345000** | 🟢 **ACCEPT** |
| `data-totals-source` | **`line_aggregate`** | 🟢 **ACCEPT** |
| F5 persist | reload → filter → re-open · afterF5 match | 🟢 **ACCEPT** |
| TDZ / pageErrors | `tdzErrors=[]` · `pageErrors=[]` | 🟢 **RETAIN CLEAR** |
| Honesty ready=false · LIVE · seed | machine honesty all false · no process | 🟢 **LOCKED / DENIED promote** |
| process-post GWC / TDZ / SRC | QA + QC must_keep | 🟢 **NOT REOPENED** |
| QA pack verify | exit **0** · **8/8** | 🟢 **PASS** |
| Optional BE list totals | `R-PAY-PERIOD-LIST-TOTALS` | 🟡 **OBS idle-ok** |
| Module / Phase1 / LIVE / J-HRM-07 e2e | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | governance | 🟡 **CONDITION** |

**Cấm:** flip `payroll_e2e_ready` · claim J-HRM-07 full DONE/e2e-ready · claim module UAT · reopen process-post GWC / TDZ / SRC · seed · invent formula LIVE · use `d92d3bbb` as proof.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim formula LIVE / customer UAT? | **NO** |
| May PM claim J-HRM-07 e2e-ready / full DONE? | **NO** — cards slice only |
| May PM claim module payroll UAT / Phase1 DONE? | **NO** |
| May PM claim R-PAY-W3-FE-SUMMARY-ZERO closed? | **YES** — this seat |
| May PM reopen process-post GWC / TDZ / SRC? | **NO** |
| Forced residual Task this turn? | **NO** — BE list totals OBS idle-ok |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC process-post-02 GWC | `…-w3-qc-process-post-02.md` | PASS_TO_PM | **RETAIN must_keep** · OBS cards-zero → **CLOSED this seat** |
| FE-SUMMARY-CARDS | `…-w3-fe-summary-cards-01.md` | READY_FOR_QA | **ACCEPT** line_aggregate bind · no formula invent |
| QA-SUMMARY-CARDS | `…-w3-qa-summary-cards-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYW3SUMQA-MSIWD3MS` |
| Machine JSON | `_tmp-…-qa-summary-cards-01.json` | PASS | **ACCEPT** |
| Screen `04-after-f5.png` | Gross/Net **12.345.000 ₫** · line UAT-0100 match | present | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 **PASS** |
| Resume K6.5 | parent dispatch | aligned | **ALIGNED** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYW3SUMQA-MSIWD3MS` | 🟢 |
| `target.periodId` | `cf38deac-8b64-474d-9aee-b34249c0f5a1` · status **processed** | 🟢 |
| `target.skipProcessed` | `d92d3bbb-…` | 🟢 **not proof** |
| `honesty.payroll_e2e_ready` / `formula_LIVE` / `seed_used` | **false** | 🟢 |
| `honesty.process_post_gwc_reopened` / `tdz_reopened` / `src_reopened` | **false** | 🟢 |
| `criteria.AC_Cards_F5` / match api/line / `data_totals_source` | **PASS** | 🟢 |
| `cards.beforeF5` / `afterF5` | source **`line_aggregate`** · gross/net **12345000** · text **12.345.000 ₫** | 🟢 |
| `payslip.api` | **200** · UAT-0100 · gross/net **12345000** | 🟢 |
| `tdzErrors` / `pageErrors` / `consoleErrors` | `[]` | 🟢 |
| `verdict` | **PASS** | 🟢 |

### Screen spot-check (`04-after-f5.png`)

| Surface | Observed | QC |
|---------|----------|-----|
| Header Gross | **12.345.000 ₫** | 🟢 |
| Header Net | **12.345.000 ₫** | 🟢 |
| Line UAT-0100 base / Net | **12.345.000 ₫** | 🟢 |
| Emp count | **1** | 🟢 |
| Period | 08/2026 · Đã duyệt | 🟢 aligned with processed `cf38deac` |

---

## Gate AC audit (summary-cards browser)

| # | AC | Observed | QC |
|---|----|----------|-----|
| AC-Cards-F5 | Gross/Net cards = line/API non-zero · F5 holds | **12.345.000 ₫** · F5 PASS | 🟢 |
| `data-totals-source` | `line_aggregate` | machine before/after | 🟢 |
| ≠ `d92d3bbb` proof | `cf38deac` only | skipProcessed held | 🟢 |
| Honesty ready=false | locked · no process | machine | 🟢 |
| DENY LIVE invent | FE bind display-ready only | FE + QA | 🟢 |
| Cấm reopen process-post / TDZ / SRC | must_keep | honesty false | 🟢 |
| AC-Cards-Process (optional) | N/A existing processed | OK out of seat | ⬜ N/A |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-SUMMARY-CARDS | QC |
|-----------------|-------|------------------|-----|
| **J-HRM-07 header summary cards** | process-post OBS cards 0 | 🟢 stamp PASS | 🟢 **PASS / ACCEPT** (slice) |
| **J-HRM-07 process-post spine** | QC process-post GWC | not re-run | 🟢 **RETAIN ACCEPT · not reopened** |
| **J-HRM-07 load + TDZ** | prior GWC | `tdzErrors=[]` | 🟢 **RETAIN CLOSED** |
| **J-HRM-07 e2e-ready / full DoD** | DENIED | Explicit non-claim | ⬜ **DENIED** — `C-SLICE-≠-MODULE` |
| Formula LIVE / module UAT / Phase1 | DENIED | Explicit non-claim | ⬜ **DENIED** |

**U19 note:** Certifies **header cards bind** named in K6.5 — **does not** flip J-HRM-07 into e2e-ready or formula LIVE.

### CRUD / mutate matrix (browser U65)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Open processed period detail | Read | **PASS** (`cf38deac`) |
| Header cards Gross/Net | Read (display bind) | **PASS** (**12.345.000 ₫**) |
| Payslip line table | Read | **PASS** (UAT-0100 match) |
| F5 re-open | Read | **PASS** |
| Fresh process Khóa | Update | **N/A** — optional AC not run this seat |
| Proof on `d92d3bbb` | — | **N/A** — cấm |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| Cards Gross/Net match line/API | **PRODUCT OK** | R-PAY-W3-FE-SUMMARY-ZERO CLOSED |
| `line_aggregate` source | **PRODUCT OK** | Display-ready bind · not formula invent |
| F5 persist | **PRODUCT OK** | |
| `payroll_e2e_ready=false` | **PRODUCT OK** | Honesty retained |
| process-post / TDZ / SRC | **OK** | Not reopened |
| BE period list omit totals | **FE/BE OBS** | Idle-ok · detail OK |
| Module / Phase1 / LIVE / J-HRM-07 e2e | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-W3-FE-SUMMARY-ZERO** | was P3 OBS | fe/qa/qc | **CLOSED** | Cards = line/API on `cf38deac` |
| **R-PAY-PERIOD-LIST-TOTALS** | P3 OBS | dev-be | **OPEN idle-ok** | List/get period still omit totals — detail OK |
| **process-post GWC / TDZ / SRC** | — | — | **RETAINED CLOSED** | must_keep · not reopened |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | Explicit **NO** promote |
| **`C-SLICE-≠-MODULE`** | governance | pm/qc | **CONDITION** | Seat ≠ module UAT / Phase1 / e2e-ready |

**P0/P1 product residuals for this WI:** none.

**CONDITIONS for GWC:**

1. **`C-SLICE-≠-MODULE`** — deny ready / LIVE / J-HRM-07 e2e / module / Phase1  
2. OBS `R-PAY-PERIOD-LIST-TOTALS` idle-ok — **no forced Task** this turn  

---

## GO WITH CONDITIONS — explicit list

### PASS / CLOSED this seat

- U65 browser cards Gross/Net **12.345.000 ₫** = line + API on **`cf38deac`** (NOT `d92d3bbb`)
- `data-totals-source=line_aggregate` · F5 stable
- **R-PAY-W3-FE-SUMMARY-ZERO CLOSED**
- Honesty `payroll_e2e_ready=false` · LIVE DENIED · zero-seed
- process-post GWC / TDZ / SRC **not reopened**

### CONDITIONS (must remain visible)

| Condition | Scope |
|-----------|--------|
| **`C-SLICE-≠-MODULE`** | Cards GWC ≠ module UAT / Phase1 DONE / J-HRM-07 e2e-ready / formula LIVE |
| **OBS `R-PAY-PERIOD-LIST-TOTALS`** | Idle-ok — optional BE list column polish |

### Explicit DENY

- `payroll_e2e_ready=true`
- Formula LIVE / customer UAT
- J-HRM-07 e2e-ready / full DONE
- Module payroll UAT
- Phase 1 DONE
- Reopen process-post GWC / TDZ / SRC
- Seed
- Using `d92d3bbb` as browser proof target

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.md` | exit **0** · **8/8** | 🟢 **PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-summary-cards-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYW3SUMQA-MSIWD3MS` | cards = line/API · source line_aggregate · F5 · ready=false | PRODUCT OK |
| Screen `04-after-f5.png` | Gross/Net **12.345.000 ₫** · UAT-0100 match | PRODUCT OK |
| Spot-check FE + process-post GWC must_keep | bind path · retain prior GWC | TRACE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

---

## completion_report

### Closed

1. QC K6.5 summary-cards gate — **GO WITH CONDITIONS**.  
2. Audited QA stamp `PAYW3SUMQA-MSIWD3MS` + machine + `04-after-f5.png` + FE + process-post must_keep.  
3. **ACCEPT** U65 cards Gross/Net **12.345.000 ₫** = line/API on **`cf38deac`** · source **`line_aggregate`** · F5.  
4. **CLOSED** `R-PAY-W3-FE-SUMMARY-ZERO` (browser).  
5. process-post GWC / TDZ / SRC **not reopened**.  
6. Honesty **LOCKED**: `payroll_e2e_ready=false` · DENY LIVE · DENY J-HRM-07 e2e · DENY module UAT.  
7. OBS BE list totals = **idle-ok**.  
8. QA pack **8/8** PASS; QC consolidates this pack.

### Residual

- **`C-SLICE-≠-MODULE`** CONDITION.  
- OBS `R-PAY-PERIOD-LIST-TOTALS` idle-ok (no forced dispatch).  
- **NOT** Phase 1 DONE · **NOT** module UAT · **NOT** e2e_ready flip · **NOT** J-HRM-07 full DONE.

## next_owner

**pm** — seal K6.5 cards OBS on resume plan; continue open K-chunks / idle-ok — **do not** flip `payroll_e2e_ready` or claim J-HRM-07 e2e.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-RESUME-AFTER-K6.5-SUMMARY-CARDS-GWC
from_role: pm
to_role: pm
lane: governance
priority: P3
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-SUMMARY-CARDS-01

Intake:
- QC GWC: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-summary-cards-01.md
- stamp PAYW3SUMQA-MSIWD3MS · R-PAY-W3-FE-SUMMARY-ZERO CLOSED
- honesty: payroll_e2e_ready=false · LIVE DENIED · J-HRM-07 e2e DENIED
- process-post GWC / TDZ / SRC RETAINED · not reopened
- OBS idle-ok: R-PAY-PERIOD-LIST-TOTALS (optional BE)

Mission:
1. Mark K6.5 summary-cards SEAL on resume plan / bus
2. Do NOT flip payroll_e2e_ready / claim J-HRM-07 full DONE / reopen process-post
3. Run pnpm run pm:idle:check — dispatch next open P0/P1 only if required; OBS list-totals idle-ok
4. Cấm seed · cấm d92d3bbb proof · cấm module UAT claim from this slice
```

## ack_status

**`PASS_TO_PM`**
