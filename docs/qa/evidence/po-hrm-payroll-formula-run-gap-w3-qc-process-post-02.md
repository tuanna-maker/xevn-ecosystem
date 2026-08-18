# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-PROCESS-POST-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-PROCESS-POST-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **W3 process-post browser slice** (fresh Aug draft → POST `/process` 201 → F5 line non-zero) — **not** formula LIVE · **not** J-HRM-07 e2e-ready · **not** module UAT |
| **priority** | P0 |
| **parent** | `PO-HRM-RESUME-QC-WAVE-K1-K4` · resume_chunk **K2** |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-PROCESS-POST-02` `PASS_TO_PM` (stamp **`PAYW3PROC2-MSIT867S`**) · BE-412 `READY_FOR_QA` · prior QC-W3-J-HRM-07 GWC (TDZ CLOSED; process-post was CONDITION) |
| **closes** | **R-PAY-W3-PROCESS-POST-UNPROVEN** · **R-PAY-W3-PROCESS-FORMULA-412-VARS** (browser) |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · HRM `:28001` · XBOS `:28002` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** — **PARTIAL ACCEPT** process-post spine (enroll → Khóa → process 201 → F5 lines) · **DENY** e2e-ready / full DoD / LIVE |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md`](po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md) stamp **`PAYW3PROC2-MSIT867S`** |
| **be_ref** | [`po-hrm-payroll-formula-run-gap-w3-be-process-formula-412-01.md`](po-hrm-payroll-formula-run-gap-w3-be-process-formula-412-01.md) |
| **qc_tdz_baseline** | [`po-hrm-payroll-formula-run-gap-qc-w3-j-hrm-07-01.md`](po-hrm-payroll-formula-run-gap-qc-w3-j-hrm-07-01.md) GWC TDZ — **RETAINED · do not reopen** |
| **resume_plan** | [`docs/program/PO_HRM_RESUME_PLAN_20260807.md`](../../program/PO_HRM_RESUME_PLAN_20260807.md) §K2 |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.json`](_tmp-po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-process-post-02/` (`01`…`11-after-f5.png`) |
| **U65** | zero-seed · browser-only · QC observe · no `apps/**` · no `pnpm seed:*` · **cấm** proof on `d92d3bbb` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `payroll_e2e_ready=false` locked · LIVE DENIED · J-HRM-07 e2e DENIED · formula LIVE DENIED |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **LOCKED** in process body + warnings `PAYROLL_E2E_READY_FALSE` · **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | Non-zero F5 line ≠ LIVE invent / AC promote |
| **J-HRM-07 e2e-ready / process DONE** | **DENIED** | Slice process-post ACCEPT ≠ journey DoD |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | zero-seed retained |
| **R-PAY-BATCHES-SHOWADD-TDZ** | **CLOSED retained** | `tdzErrors=[]` · **not reopened** |
| **Proof target `d92d3bbb`** | **DENIED** | Already processed Sep — BE live-proof only; browser target = **`cf38deac`** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT W3 browser **process-post** slice after BE expression-only var gate + QA U65 retest stamp `PAYW3PROC2-MSIT867S`. Audited QA MD + machine JSON + screens + BE-412 context + resume §K2. Proven on **fresh Aug draft `cf38deac`** (**NOT** processed Sep `d92d3bbb`): ATT closed same month → enroll 1 (`UAT-0100`) **201** → **POST `/process` 201** `HRM-PAY-202` · period **processed** · `payroll_e2e_ready=false` · F5 payslip line **12.345.000 ₫** (`hasNonZero=true`). **R-PAY-W3-PROCESS-POST-UNPROVEN CLOSED** (supersedes QC-W3-J-HRM-07 CONDITION). **R-PAY-W3-PROCESS-FORMULA-412-VARS CLOSED** for browser. TDZ **not reopened**.

**NOT Phase 1 DONE. NOT module payroll UAT. NOT formula LIVE. NOT J-HRM-07 e2e-ready.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Target ≠ `d92d3bbb` | period `cf38deac-8b64-474d-9aee-b34249c0f5a1` · machine `skipProcessed` | 🟢 **ACCEPT** |
| Fresh draft + ATT closed Aug | draft before → ATT `74aba4d4` closed · month 8/2026 | 🟢 **ACCEPT** |
| Enroll browser ≥1 | POST enroll **201** `HRM-PAY-ENROLL-200` · emp→1 | 🟢 **ACCEPT** |
| POST `/process` **2xx** | **201** `HRM-PAY-202` · Network + machine | 🟢 **ACCEPT** |
| Period processed + F5 line non-zero | `periodAfter.status=processed` · F5 sample **12.345.000 ₫** | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | body + warnings + machine honesty | 🟢 **LOCKED / DENIED promote** |
| TDZ not reopened | `tdzErrors=[]` · prior GWC retained | 🟢 **RETAIN CLOSED** |
| QA pack verify | exit **0** · **8/8** | 🟢 **PASS** |
| Summary Gross/Net cards 0 | FE OBS while line non-zero | 🟡 **OBS idle-ok** |
| Bad-tpl-D SRC `bb194e52` | SKIPPED · out of AC | 🟡 **OBS idle-ok** |
| Sep create 409 overlap | `HRM-PAY-002` vs processed Sep | 🟡 **OBS idle-ok** |
| Module / Phase1 / LIVE / J-HRM-07 e2e | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | governance | 🟡 **CONDITION** |

**Cấm:** flip `payroll_e2e_ready` · claim J-HRM-07 DONE/e2e-ready · reopen TDZ · seed · use `d92d3bbb` as proof target · invent formula LIVE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim formula LIVE / customer UAT? | **NO** |
| May PM claim J-HRM-07 e2e-ready / process DONE? | **NO** — process-post slice only |
| May PM claim R-PAY-W3-PROCESS-POST / FORMULA-412-VARS closed? | **YES** — this seat |
| May PM reopen TDZ? | **NO** |
| Forced residual Task this turn? | **NO** — OBS idle-ok (summary cards / bad-tpl-D / Sep overlap) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-PROCESS-FORMULA-412 | `…-w3-be-process-formula-412-01.md` | READY_FOR_QA | **ACCEPT** expression-only gate · live Sep processed (context only) |
| QC-W3-J-HRM-07 TDZ | `…-qc-w3-j-hrm-07-01.md` | GWC | **RETAIN** · process-post CONDITION → **CLOSED this seat** |
| QA-PROCESS-POST-02 | `…-w3-qa-process-post-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYW3PROC2-MSIT867S` |
| Machine JSON | `_tmp-…-process-post-02.json` | PASS_TO_PM | **ACCEPT** |
| Screens `01`…`11` | screens dir | present | **ACCEPT** (incl. `11-after-f5.png`) |
| Pack verify QA | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 **PASS** |
| Resume §K2 | `PO_HRM_RESUME_PLAN_20260807.md` | K2 exit | **ALIGNED** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYW3PROC2-MSIT867S` | 🟢 |
| `target.periodId` | `cf38deac-…` | 🟢 |
| `target.skipProcessed` | `d92d3bbb-…` status processed | 🟢 **not proof target** |
| `honesty.payroll_e2e_ready` / `formula_LIVE` / `seed_used` | **false** | 🟢 |
| `criteria.process` / `f5` / `period_processed` / `tdz_cleared` | **PASS** | 🟢 |
| `pay.processPosts[0]` | **201** `HRM-PAY-202` · `payroll_e2e_ready=false` | 🟢 |
| `payslip.afterF5.hasNonZero` | **true** · **12.345.000 ₫** | 🟢 |
| `tdzErrors` / `pageErrors` | `[]` | 🟢 |
| Close POST **412** `HRM-PAY-005` | paid-before-close guard | 🟡 **OBS OK** — out of process-post AC |
| Harness `honesty.non_zero_observed=false` vs F5 `hasNonZero=true` | harness flag lag | 🟡 **PROCESS OBS** — F5 sample authoritative |

---

## Gate AC audit (process-post / FORMULA-412 browser)

| # | AC | Observed | QC |
|---|----|----------|-----|
| AC-ATT | Draft + ATT closed same month ≠ processed Sep | Aug `cf38deac` + ATT `74aba4d4` | 🟢 |
| AC-Enroll | Browser ≥1 | `UAT-0100` enroll **201** | 🟢 |
| AC-Process | POST `/process` **2xx** Network + machine | **201** `HRM-PAY-202` | 🟢 |
| AC-Payslip/F5 | Lines after process + F5 non-zero | F5 **12.345.000 ₫** · processed | 🟢 |
| Honesty | `payroll_e2e_ready=false` | body + warnings | 🟢 |
| DENY LIVE invent | No AC promote / summary cards 0 OBS | Held | 🟢 |
| Cấm TDZ reopen | `tdzErrors=[]` | Held | 🟢 |
| Cấm `d92d3bbb` proof | Skipped / used as skipProcessed only | Held | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-PROCESS-POST-02 | QC |
|-----------------|-------|--------------------|-----|
| **J-HRM-07 process-post** (enroll→Khóa→process→F5) | QC-W3 CONDITION unproven | 🟢 stamp PASS | 🟢 **PASS / ACCEPT** (slice) |
| **J-HRM-07 load + TDZ** | QC-W3-J-HRM-07 GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **J-HRM-07 e2e-ready / full DoD** | DENIED | Explicit non-claim | ⬜ **DENIED** — CONDITION `C-SLICE-≠-MODULE` |
| Formula LIVE / module UAT / Phase1 | DENIED | Explicit non-claim | ⬜ **DENIED** |

**U19 note:** Certifies **process-post spine** named in K2 — **does not** flip J-HRM-07 historical PASS into e2e-ready or formula LIVE. Missing full journey DoD **forces GWC CONDITION**, not product NO-GO of this slice.

### CRUD / mutate matrix (browser U65)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Enroll NV into draft period | Create (enroll) | **PASS** (201) |
| POST `/process` Khóa | Update (process) | **PASS** (201 · processed) |
| F5 payslip/lines read | Read | **PASS** (non-zero line) |
| Process on `d92d3bbb` | — | **N/A** — cấm proof target |
| Process on `bb194e52` D-only tpl | — | **N/A** — SKIPPED OBS |
| Sep second draft create | Create | **OBS** 409 overlap idle-ok |
| Period close after process | Update | **N/A** — 412 paid-before-close OBS |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| POST `/process` **201** on `cf38deac` | **PRODUCT OK** | BE-412 holds on fresh draft+ATT |
| F5 non-zero line | **PRODUCT OK** | Persist OK · **not** LIVE invent |
| `payroll_e2e_ready=false` | **PRODUCT OK** | Honesty retained |
| Summary cards Gross/Net **0 ₫** | **FE OBS** | Idle-ok · not demote process-post |
| Bad-tpl-D SRC 412 | **SCOPE OBS** | Out of AC · idle-ok |
| Sep create 409 | **PRODUCT OBS** | Uniqueness expected · idle-ok |
| Close 412 `HRM-PAY-005` | **PRODUCT OBS** | Wire/paid spine OOS this seat |
| TDZ | **OK** | Not reopened |
| Module / Phase1 / LIVE / J-HRM-07 e2e | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-W3-PROCESS-POST-UNPROVEN** | was P1 | qa/qc | **CLOSED** | POST `/process` 201 proven on `cf38deac` |
| **R-PAY-W3-PROCESS-FORMULA-412-VARS** | was P1 | be/qa | **CLOSED** | Browser 2xx after BE gate |
| **R-PAY-BATCHES-SHOWADD-TDZ** | — | — | **CLOSED** | Retained · **do not reopen** |
| **R-PAY-W3-FE-SUMMARY-ZERO** | P3 OBS | dev-fe | **OPEN idle-ok** | Line 12.345.000 ₫ · header cards 0 ₫ |
| **R-PAY-W3-BAD-TPL-D-SRC** | P2 OBS | ba/dev | **OPEN idle-ok** | `bb194e52` D-only → 412 SRC · not this AC |
| **R-PAY-W3-SEP-CREATE-OVERLAP** | P3 OBS | pm | **OPEN idle-ok** | Sep FE create 409 vs processed Sep |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | Explicit **NO** promote |
| **`C-SLICE-≠-MODULE`** | governance | pm/qc | **CONDITION** | Seat ≠ module UAT / Phase1 / e2e-ready |

**P0/P1 product residuals for this WI:** none blocking slice ACCEPT.

**CONDITIONS for GWC:**

1. **`C-SLICE-≠-MODULE`** — deny ready / LIVE / J-HRM-07 e2e / module / Phase1  
2. OBS idle-ok listed above — **no forced Task** this turn  

---

## GO WITH CONDITIONS — explicit list

### PASS / CLOSED this seat

- U65 browser POST `/process` **201** on Aug draft **`cf38deac`** (NOT `d92d3bbb`)
- F5 line non-zero **12.345.000 ₫** · period processed
- `payroll_e2e_ready=false` honesty held
- **R-PAY-W3-PROCESS-POST** / **FORMULA-412-VARS** **CLOSED**
- TDZ **CLOSED retained**

### CONDITIONS (must remain visible)

| Condition | Scope |
|-----------|--------|
| **`C-SLICE-≠-MODULE`** | Process-post GWC ≠ module UAT / Phase1 DONE / J-HRM-07 e2e-ready / formula LIVE |
| **OBS FE summary cards 0** | Idle-ok — optional FE rollup later |
| **OBS bad-tpl-D SRC** | Idle-ok — out of AC |
| **OBS Sep create overlap** | Idle-ok — uniqueness |

### Explicit DENY

- `payroll_e2e_ready=true`
- Formula LIVE / customer UAT
- J-HRM-07 e2e-ready / process DONE
- Module payroll UAT
- Phase 1 DONE
- Reopen TDZ
- Seed
- Using `d92d3bbb` as browser proof target

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md` | exit **0** · **8/8** | 🟢 **PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYW3PROC2-MSIT867S` | process **201** · F5 non-zero · ready=false | PRODUCT OK |
| Screens `06`/`10`/`11` | before / after process / F5 | PRODUCT OK (cited) |
| Spot-check BE-412 + resume §K2 | expression-only gate · K2 exit criteria | TRACE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

---

## completion_report

### Closed

1. QC K2 process-post gate — **GO WITH CONDITIONS**.  
2. Audited QA stamp `PAYW3PROC2-MSIT867S` + machine + screens + BE-412 + resume §K2.  
3. **ACCEPT** U65 POST `/process` **201** on **`cf38deac`** (NOT `d92d3bbb`) · F5 **12.345.000 ₫** · ready=false.  
4. **CLOSED** `R-PAY-W3-PROCESS-POST-UNPROVEN` + browser `R-PAY-W3-PROCESS-FORMULA-412-VARS`.  
5. TDZ **not reopened**.  
6. Honesty **LOCKED**: `payroll_e2e_ready=false` · DENY LIVE · DENY J-HRM-07 e2e-ready · DENY formula LIVE.  
7. OBS summary-cards-zero / bad-tpl-D / Sep overlap = **idle-ok**.  
8. QA pack **8/8** PASS; QC consolidates this pack.

### Residual

- **`C-SLICE-≠-MODULE`** CONDITION.  
- OBS P2/P3 idle-ok (no forced dispatch).  
- **NOT** Phase 1 DONE · **NOT** module UAT · **NOT** e2e_ready flip.

## next_owner

**pm** — seal K2 on resume plan; continue K3/K4 QC wave per `PO_HRM_RESUME_PLAN_20260807.md` (no reopen this seat).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-RESUME-QC-WAVE-K1-K4 (continue after K2 SEAL)
from_role: pm
to_role: pm
lane: governance
priority: P0
parent: PO_HRM_RESUME_PLAN_20260807 §K2 CLOSED GWC

Intake:
- QC GWC: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md
- stamp PAYW3PROC2-MSIT867S · R-PAY-W3-PROCESS-POST / FORMULA-412-VARS CLOSED
- honesty: payroll_e2e_ready=false · LIVE DENIED · J-HRM-07 e2e DENIED · TDZ not reopened
- OBS idle-ok: FE summary cards 0 · bad-tpl-D SRC · Sep create 409

Mission:
1. Mark K2 SEAL on docs/program/PO_HRM_RESUME_PLAN_20260807.md
2. Do NOT flip payroll_e2e_ready / claim J-HRM-07 e2e-ready / reopen TDZ
3. Dispatch next open chunk (K3 INPUT-PACK-QC-02 and/or K4 PERIOD-BIND-QC-02) per resume plan — Task same turn
4. Cấm seed · cấm d92d3bbb as proof · cấm reopen W3 process-post seat
```

## ack_status

**`PASS_TO_PM`** — verdict **GO WITH CONDITIONS**
