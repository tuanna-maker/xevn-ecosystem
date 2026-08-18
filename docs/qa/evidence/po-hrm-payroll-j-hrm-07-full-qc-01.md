# Evidence — `PO-HRM-PAYROLL-J-HRM-07-FULL-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-J-HRM-07-FULL-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **full-spine J-HRM-07 browser QC** (ATT→period bind→enroll→process→cards/payslip) — **not** module UAT · **not** AMIS DONE · **not** formula LIVE invent |
| **priority** | P0 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **program** | `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01` |
| **prior** | `PO-HRM-PAYROLL-J-HRM-07-FULL-QA-01` `PASS_TO_PM` stamp **`PAYJ07FULL-MSIYSHHY`** |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** — full spine browser **ACCEPT** this seat · **DENY** product/e2e-ready DONE invent without sponsor |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-j-hrm-07-full-qa-01.md`](po-hrm-payroll-j-hrm-07-full-qa-01.md) stamp **`PAYJ07FULL-MSIYSHHY`** |
| **machine** | [`_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json`](_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-j-hrm-07-full-qa-01/` (`01`…`15`) |
| **period_id** | **`95d0a627-8031-4004-8ef3-b1ffe92b9957`** (Feb/2027) — **NOT** `d92d3bbb` |
| **sheet_id** | `f76649bc-4afc-4c08-8d97-a2331ec1f69e` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` **LOCKED** · LIVE DENIED · module UAT DENIED · AMIS DONE DENIED · J-HRM-07 product DONE DENIED |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **LOCKED** in process body + warnings `PAYROLL_E2E_READY_FALSE` · machine honesty · **PM must not invent flip** |
| **Formula LIVE / customer UAT** | **DENIED** | Non-zero cards/lines observed — **no** AC promote to LIVE |
| **J-HRM-07 product DONE / e2e-ready** | **DENIED** | Full-spine GWC ≠ sponsor DONE / flag flip |
| **Module payroll UAT / AMIS DONE** | **DENIED** | Explicit |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | zero-seed retained |
| **Prior process-post / period-bind / summary-cards GWC** | **RETAINED** | **must_keep · not reopened / not demoted** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT U65 **full** browser J-HRM-07 spine after QA stamp `PAYJ07FULL-MSIYSHHY`. Audited QA MD + machine JSON + screens `14`/`15` + prior GWC seats (process-post / period-bind / summary-cards). Proven on **fresh** period **`95d0a627`** (**NOT** processed Sep `d92d3bbb`): Settings active mẫu → ATT create/sign/close sheet `f76649bc` → **POST periods 201** `HRM-PAY-201` with `paySheetTemplateId` + snapshot → enroll **UAT-0100** **201** → **POST `/process` 201** `HRM-PAY-202` · period **processed** · `payroll_e2e_ready=false` → header Gross/Net **12.345.000 ₫** (`line_aggregate` after F5) + payslip line **12.345.000 ₫** · F5 persist. Prior slice GWC **RETAINED**. Honesty **LOCKED**.

**NOT Phase 1 DONE. NOT module payroll UAT. NOT AMIS DONE. NOT formula LIVE. NOT J-HRM-07 product DONE / e2e-ready invent.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `PAYJ07FULL-MSIYSHHY` | QA MD + machine `stamp` · `verdict=PASS_TO_PM` | 🟢 **ACCEPT** |
| Target `95d0a627` ≠ `d92d3bbb` | machine `target.periodId` · `skipProcessed=d92d3bbb-…` | 🟢 **ACCEPT** |
| ATT create → sign EMP/DM/HR → close | Network 201 chain · screens `02`…`07` · `att.sheetAfter.status=closed` | 🟢 **ACCEPT** |
| Period create + tpl bind | POST **201** `HRM-PAY-201` · `paySheetTemplateId` · snapshot name | 🟢 **ACCEPT** |
| Enroll ≥1 browser | POST enroll **201** · UAT-0100 | 🟢 **ACCEPT** |
| Process POST **2xx** | **201** `HRM-PAY-202` · `periodAfter.status=processed` | 🟢 **ACCEPT** |
| Cards Gross/Net non-zero | **12.345.000 ₫** · afterF5 `line_aggregate` · screen `15` | 🟢 **ACCEPT** |
| Payslip/lines UI + F5 | UAT-0100 · **12.345.000 ₫** · screens `14`/`15` | 🟢 **ACCEPT** |
| Honesty ready=false · no flip | process body + warnings + machine honesty all false | 🟢 **LOCKED / DENIED promote** |
| must_keep prior GWC | process-post / bind / cards | 🟢 **RETAINED · not reopened** |
| QA pack verify | exit **1** · **1/8** missing `## Residual` | 🟡 **PROCESS OBS** — QC consolidates **8/8** |
| Harness `GET payslips?payroll_period_id=` **400** | while UI + `period_id=` GETs **200** | 🟡 **OBS idle-ok** |
| Console **412** close after process | `HRM-PAY-005` paid-before-close | 🟡 **OBS expected** (out of process-spine AC) |
| Module / Phase1 / LIVE / AMIS / J-HRM-07 DONE | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | governance | 🟡 **CONDITION** |

**Cấm:** invent `payroll_e2e_ready=true` · claim module UAT / AMIS DONE / J-HRM-07 product DONE · reopen prior GWC · seed · invent formula LIVE · use `d92d3bbb` as proof.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim formula LIVE / customer UAT? | **NO** |
| May PM claim J-HRM-07 product DONE / e2e-ready? | **NO** — sponsor required; spine GWC ≠ DONE invent |
| May PM claim module payroll UAT / AMIS DONE / Phase1 DONE? | **NO** |
| May PM claim full-spine browser ACCEPT this seat? | **YES** — stamp `PAYJ07FULL-MSIYSHHY` on `95d0a627` |
| May PM reopen process-post / period-bind / summary-cards GWC? | **NO** |
| Forced residual Task this turn (P0/P1 product)? | **NO** — OBS idle-ok only |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| W3 process-post QC | `po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md` stamp `PAYW3PROC2-MSIT867S` | GWC | 🟢 **RETAIN must_keep** |
| Period-bind QC | `po-hrm-amis-parity-pay-period-bind-qc-02.md` stamp `PAYBINDQA2-IT9Y27` | GWC | 🟢 **RETAIN must_keep** |
| Summary-cards QC | `po-hrm-payroll-formula-run-gap-w3-qc-summary-cards-01.md` stamp `PAYW3SUMQA-MSIWD3MS` | GWC | 🟢 **RETAIN must_keep** (re-proven on fresh period) |
| QA FULL-01 | `po-hrm-payroll-j-hrm-07-full-qa-01.md` | PASS_TO_PM | 🟢 **ACCEPT** stamp `PAYJ07FULL-MSIYSHHY` |
| Machine JSON | `_tmp-po-hrm-payroll-j-hrm-07-full-qa-01.json` | PASS_TO_PM | 🟢 **ACCEPT** |
| Screens 01–15 | `screens/po-hrm-payroll-j-hrm-07-full-qa-01/` | present (15 files) | 🟢 **ACCEPT** spot `14`/`15` |
| Pack verify QA | `verify:qc:evidence-pack` | **1/8** residual_section | 🟡 **PROCESS OBS** |
| This QC seat | this file | PASS_TO_PM | consolidates pack **8/8** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYJ07FULL-MSIYSHHY` | 🟢 |
| `target.periodId` | `95d0a627-8031-4004-8ef3-b1ffe92b9957` · status **processed** | 🟢 |
| `target.skipProcessed` | `d92d3bbb-…` | 🟢 **not proof** |
| `att.sheetAfter.status` | **closed** · sheet `f76649bc` | 🟢 |
| `pay.createPosts[0].paySheetTemplateId` | `38d61fda-…` · snapshot name | 🟢 |
| `pay.enrollPosts` / `processPosts` | **201** enroll · **201** process · `payroll_e2e_ready=false` | 🟢 |
| `cards.afterF5` | source **`line_aggregate`** · gross/net **12345000** · text **12.345.000 ₫** | 🟢 |
| `payslip.afterF5` | rowCount **1** · UAT-0100 · **hasNonZero** | 🟢 |
| `honesty.payroll_e2e_ready` / `formula_LIVE` / `seed_used` / DONE claims | **false** | 🟢 |
| `honesty.must_keep_*` / `demoted_prior_gwc` | must_keep **true** · demoted **false** | 🟢 |
| `tdzErrors` / `pageErrors` | `[]` | 🟢 |
| `pay.payslipsApi.status` | **400** (harness wrong query key) | 🟡 OBS |
| `consoleErrors` | 412 Precondition Failed (close) | 🟡 OBS expected |
| `verdict` | **PASS_TO_PM** | 🟢 |

### Screen spot-check

| Screen | Observed | QC |
|--------|----------|-----|
| `14-after-process.png` | Period **Đã duyệt** · Gross/Net **12.345.000 ₫** · UAT-0100 line | 🟢 |
| `15-after-f5.png` | Title **PAYJ07FULL-MSIYSHHY** · **02/2027** · Mẫu bound · Gross/Net **12.345.000 ₫** · emp **1** · line UAT-0100 match | 🟢 |

---

## Gate AC audit (full spine browser)

| # | AC | Observed | QC |
|---|----|----------|-----|
| AC-ATT create + sign + close | Feb/2027 sheet closed | machine + screens | 🟢 |
| AC-Period create + `paySheetTemplateId` | 201 + snapshot | Network | 🟢 |
| AC-Fresh draft ≠ `d92d3bbb` | `95d0a627` | machine | 🟢 |
| AC-Enroll ≥1 | UAT-0100 · 201 | machine | 🟢 |
| AC-Process POST 2xx | 201 `HRM-PAY-202` | Network + body | 🟢 |
| AC-Header cards non-zero | **12.345.000 ₫** · F5 `line_aggregate` | cards + screen 15 | 🟢 |
| AC-Payslip/lines + F5 | row + non-zero persist | payslip + screen 15 | 🟢 |
| Honesty ready=false | locked · no flip | body + honesty | 🟢 |
| must_keep prior GWC | not demoted | honesty flags | 🟢 |
| DENY DONE invent | locked | explicit | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA FULL-01 | QC |
|-----------------|-------|------------|-----|
| **J-HRM-07 full spine** ATT→bind→enroll→process→cards/payslip | slice GWC retained | 🟢 stamp PASS on `95d0a627` | 🟢 **PASS / ACCEPT** (browser spine) |
| **J-HRM-07 process-post** | QC process-post GWC | re-proven on fresh period | 🟢 **RETAIN ACCEPT · not reopened** |
| **J-HRM-07 period-bind** | QC bind GWC | re-proven on create | 🟢 **RETAIN ACCEPT · not reopened** |
| **J-HRM-07 summary cards** | QC cards GWC | re-proven F5 | 🟢 **RETAIN ACCEPT · not reopened** |
| **J-HRM-07 product DONE / e2e-ready** | DENIED | Explicit non-claim | ⬜ **DENIED** — sponsor + honesty |
| Formula LIVE / module UAT / AMIS / Phase1 | DENIED | Explicit non-claim | ⬜ **DENIED** |

**U19 note:** Certifies **full browser spine** named in W7 FULL-QA — **does not** flip `payroll_e2e_ready` or invent J-HRM-07 / module / AMIS DONE.

### CRUD / mutate matrix (browser U65)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Create pay-sheet template active | Create | **PASS** |
| Create ATT sheet + sign + close | Create/Update | **PASS** |
| Create period + tpl bind | Create | **PASS** (`95d0a627`) |
| Enroll employee | Update | **PASS** (UAT-0100) |
| Process (Khóa) | Update | **PASS** (201 processed) |
| Header cards / payslip lines | Read | **PASS** (non-zero) |
| F5 re-open | Read | **PASS** |
| Close period (paid gate) | Update | **N/A / OBS** — 412 expected out of spine AC |
| Proof on `d92d3bbb` | — | **N/A** — cấm |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| Full spine ATT→process→cards/payslip on `95d0a627` | **PRODUCT OK** | Stamp ACCEPT |
| Template bind + enroll + process 201 | **PRODUCT OK** | Network + machine |
| Cards/lines **12.345.000 ₫** · `line_aggregate` F5 | **PRODUCT OK** | Re-proves cards GWC |
| `payroll_e2e_ready=false` | **PRODUCT OK** | Honesty retained |
| Prior process-post / bind / cards GWC | **OK** | Not reopened |
| QA pack missing `## Residual` | **PROCESS OBS** | QC consolidates 8/8 — not product NO-GO |
| Harness payslips GET `payroll_period_id` 400 | **FE/BE OBS** | Idle-ok · UI + `period_id=` OK |
| Close 412 paid-before-chốt | **PRODUCT OBS expected** | Out of process-spine AC |
| Module / Phase1 / LIVE / AMIS / J-HRM-07 DONE | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **`C-SLICE-≠-MODULE`** | governance | pm/qc | **CONDITION** | Full-spine GWC ≠ module UAT / AMIS DONE / Phase1 / e2e-ready / formula LIVE |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | Explicit **NO** promote |
| **Prior process-post / period-bind / summary-cards GWC** | — | — | **RETAINED CLOSED** | must_keep · not reopened |
| **OBS-PAYSLIPS-LIST-GET-400** | P3 OBS | dev-be | **OPEN idle-ok** | Harness query key vs DTO; UI/process prove payslip |
| **OBS-CLOSE-412-PAID-GATE** | P3 OBS | n/a | **idle-ok expected** | Close after process without wire pay — out of spine AC |
| **OBS-QA-PACK-RESIDUAL-HEADING** | process | qa | **CLOSED by QC consolidate** | QA MD used `## OBS / residuals` — pack wants `## Residual` |

**P0/P1 product residuals for this WI:** none.

**CONDITIONS for GWC:**

1. **`C-SLICE-≠-MODULE`** — deny ready / LIVE / J-HRM-07 product DONE / module / AMIS / Phase1 invent  
2. Honesty **`payroll_e2e_ready=false` LOCKED** — no flip  
3. OBS payslips-query / close-412 — **idle-ok · no forced Task** this turn  

---

## GO WITH CONDITIONS — explicit list

### PASS / CLOSED this seat

- U65 full spine on fresh **`95d0a627`** (NOT `d92d3bbb`): ATT→bind→enroll→process→cards/payslip F5
- Stamp **`PAYJ07FULL-MSIYSHHY`** ACCEPT
- Honesty `payroll_e2e_ready=false` · LIVE DENIED · zero-seed
- Prior process-post / period-bind / summary-cards GWC **not reopened**
- Cards Gross/Net **12.345.000 ₫** · `line_aggregate` · payslip UAT-0100 match

### CONDITIONS (must remain visible)

| Condition | Scope |
|-----------|--------|
| **`C-SLICE-≠-MODULE`** | Spine GWC ≠ module UAT / Phase1 DONE / AMIS DONE / J-HRM-07 product DONE / formula LIVE / e2e_ready flip |
| **Honesty ready=false** | Locked — PM must not invent flip |
| **OBS payslips GET / close 412** | Idle-ok — no forced P0/P1 Task |

### Explicit DENY

- `payroll_e2e_ready=true`
- Formula LIVE / customer UAT
- J-HRM-07 product DONE / e2e-ready invent (without sponsor)
- Module payroll UAT
- AMIS DONE
- Phase 1 DONE
- Reopen process-post / period-bind / summary-cards GWC
- Seed
- Using `d92d3bbb` as browser proof target

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qa-01.md` | exit **1** · **1/8** (`residual_section`) | 🟡 **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qc-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYJ07FULL-MSIYSHHY` | full spine PASS · ready=false · period `95d0a627` | PRODUCT OK |
| Screens `14`/`15` | Gross/Net **12.345.000 ₫** · UAT-0100 · Đã duyệt · 02/2027 | PRODUCT OK |
| Spot-check prior GWC must_keep | process-post · bind · cards | TRACE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

---

## completion_report

### Closed

1. QC FULL-01 full-spine gate — **GO WITH CONDITIONS**.  
2. Audited QA stamp `PAYJ07FULL-MSIYSHHY` + machine + screens `14`/`15` + prior GWC must_keep.  
3. **ACCEPT** U65 ATT→period bind→enroll→process→cards/payslip on fresh **`95d0a627`** (≠ `d92d3bbb`).  
4. Honesty **LOCKED**: `payroll_e2e_ready=false` · DENY LIVE · DENY module UAT · DENY AMIS DONE · DENY J-HRM-07 product DONE invent.  
5. Prior process-post / period-bind / summary-cards GWC **not reopened**.  
6. OBS payslips-query 400 + close 412 = **idle-ok**.  
7. QA pack **1/8 PROCESS OBS**; QC consolidates this pack **8/8**.

### Residual

- **`C-SLICE-≠-MODULE`** CONDITION.  
- Honesty ready=false LOCKED.  
- OBS idle-ok (no forced P0/P1).  
- **NOT** Phase 1 DONE · **NOT** module UAT · **NOT** AMIS DONE · **NOT** e2e_ready flip · **NOT** J-HRM-07 product DONE invent.

## next_owner

**pm** — intake GWC; seal W7 full-spine browser ACCEPT on bus/plan; **do not** flip `payroll_e2e_ready` or claim module/AMIS/J-HRM-07 DONE; run `pm:idle:check` for next open P0/P1 only.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTINUOUS-W7-AFTER-J07-FULL-GWC
from_role: pm
to_role: pm
lane: governance
priority: P0
parent: PO-HRM-PAYROLL-J-HRM-07-FULL-QC-01
program: PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01

Intake:
- QC GWC: docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qc-01.md
- stamp PAYJ07FULL-MSIYSHHY · period 95d0a627 (NOT d92d3bbb)
- honesty: payroll_e2e_ready=false LOCKED · LIVE DENIED · module/AMIS/J-HRM-07 DONE DENIED
- must_keep: process-post / period-bind / summary-cards GWC RETAINED
- OBS idle-ok: payslips list GET harness 400 · close 412 paid-gate
- C-SLICE-≠-MODULE CONDITION retained

Mission:
1. Bus INTAKE GWC + update TEAM_WORKING_NOW / program note for W7 full-spine ACCEPT
2. Do NOT invent payroll_e2e_ready=true · do NOT claim module UAT / AMIS DONE / J-HRM-07 product DONE
3. Do NOT reopen prior process-post / period-bind / summary-cards GWC
4. pnpm run pm:idle:check — dispatch next open P0/P1 only if required; OBS idle-ok no forced Task
5. Cấm seed · cấm d92d3bbb as proof · C-SLICE-≠-MODULE retained

exit: PASS_TO_PM or next DISPATCHED work_item only if idle-check exit 2
evidence: docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qc-01.md
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-payroll-j-hrm-07-full-qc-01.md`
