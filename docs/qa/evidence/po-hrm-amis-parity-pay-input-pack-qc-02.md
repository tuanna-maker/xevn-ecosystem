# Evidence — `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **FE Thêm NV advance slice** (browser U65) — **not** full Step4 module UAT · **not** L1 API reopen |
| **priority** | P1 |
| **parent** | `PO-HRM-RESUME-QC-WAVE-K1-K4` · resume_chunk **K3** |
| **prior** | QA-03 PASS_TO_PM stamp **`PAYINPQA3-IT3RY3`** · FE-01 READY_FOR_QA · QC-01 L1 GWC (retain · **do not reopen** API packs) |
| **closes** | QC-01 CONDITION **`FE-01`** (wire POST employees) · browser Step4 **Thêm NV** UF |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1&companyId=main` |
| **journey_l25** | FE advance **Thêm NV** only — **not** full **J-HRM-07** process UAT · mark-paid picker **OOS** |
| **Verdict** | **GO WITH CONDITIONS** — FE Thêm NV slice ACCEPT · CONDITIONS: **`C-SLICE-≠-MODULE`** · residuals OOS idle-ok |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-input-pack-qa-03.md`](po-hrm-amis-parity-pay-input-pack-qa-03.md) stamp **`PAYINPQA3-IT3RY3`** |
| **qc_prior** | [`po-hrm-amis-parity-pay-input-pack-qc-01.md`](po-hrm-amis-parity-pay-input-pack-qc-01.md) — L1 packs **SEAL** · **cấm reopen** |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-input-pack-qa-03-browser.json`](_tmp-po-hrm-amis-parity-pay-input-pack-qa-03-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-input-pack-qa-03/` |
| **spec_ref** | Nest `POST …/advance-requests/:id/employees` · `HRM-ADV-201` · FE-01 wire · K3 `PO_HRM_RESUME_PLAN_20260807.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — FE Thêm NV GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-HRM-07 / `payroll_e2e_ready=true` |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Thêm NV FE wire slice only |
| **Module payroll UAT / Step4 full** | **DENIED** | Seat ≠ module GO |
| **J-HRM-07** process UAT | **DENIED** | Not retested / not flipped |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser product-path · no `pnpm seed:*` |
| **QC-01 L1 API packs** | **SEAL** | **Do not reopen** this seat |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT FE Thêm NV advance slice after FE-01 + QA-03 stamp `PAYINPQA3-IT3RY3`. Audited QA MD + browser JSON (`overall=PASS` · all AC PASS · honesty `payroll_e2e_ready=false` · `seed_used=false`) + screens `06-after-add` / `07-after-f5`. Proven: pending advance `QA-ADV-EMP-IT3RY3` → **Thêm nhân viên** → POST `…/employees?company_id=holding` **201** `HRM-ADV-201` with `employee_code=UAT-0100` · `employee_name=UAT NV 0100` · `advance_amount=1250000` · toast **Đã thêm nhân viên** (no stub) · list empty→row · F5 row remains · 0 fatal console. QA pack verify **8/8** PASS. Closes QC-01 CONDITION **FE-01**. Retains QC-01 L1 ACCEPT (no reopen). CONDITIONS: **`C-SLICE-≠-MODULE`**. Residuals OOS idle-ok: mark-paid `payrollPeriodId` picker · removeEmployee Nest stubs. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 flip. **NOT Phase 1 DONE.** **K3 exit:** Step4 API+FE Thêm NV GWC.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| POST …/employees **201** `HRM-ADV-201` | MD + JSON `postEmployees` · network | 🟢 **ACCEPT** |
| Body code/name/amount | `UAT-0100` · `UAT NV 0100` · `1250000` | 🟢 **ACCEPT** |
| No stub toast | Toast «Đã thêm nhân viên» · no «API thêm NV chưa có» | 🟢 **ACCEPT** |
| FE list refresh + F5 | screens 06/07 · probes afterAdd/afterF5 | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | MD + machine | 🟢 **DENIED promote** |
| QA pack 8/8 | `verify:qc:evidence-pack` exit 0 | 🟢 |
| QC-01 L1 packs | prior GWC SEAL | 🟢 **RETAIN · no reopen** |
| FE-01 CONDITION | now proven QA-03 | 🟢 **CLOSED** |
| AMIS / module UAT / Phase1 / ready / J-HRM-07 | Explicit DENIED | 🟢 |
| mark-paid picker / removeEmployee | OOS | ⬜ **idle-ok** |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · expand Step4 full UAT · reopen QC-01 L1 · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · Thêm NV FE ≠ LIVE process / module UAT / AMIS DONE |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim FE Thêm NV slice ACCEPT? | **YES** — this seat GWC |
| May PM claim K3 Step4 API+FE Thêm NV GWC? | **YES** — with L1 QC-01 retain |
| May PM claim AMIS DONE / module UAT / Phase1 / J-HRM-07? | **NO** |
| Reopen L1 packs / re-dispatch FE-01? | **NO** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 | `po-hrm-amis-parity-pay-input-pack-qc-01.md` | GWC PASS_TO_PM | **RETAIN SEAL** — cấm reopen API |
| FE-01 | prior READY_FOR_QA | closed via QA-03 | **ACCEPT** wire proven |
| QA-03 browser | `po-hrm-amis-parity-pay-input-pack-qa-03.md` | PASS_TO_PM | **ACCEPT** stamp `PAYINPQA3-IT3RY3` |
| Machine JSON | `_tmp-…-qa-03-browser.json` | PASS | **ACCEPT** overall PASS · all AC |
| Pack verify QA | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |
| Screens 06/07 | after-add · after-f5 | visual | 🟢 UAT-0100 · 1.250.000 ₫ |
| K3 plan | `PO_HRM_RESUME_PLAN_20260807.md` §K3 | exit criteria | **ALIGNED** |

### Machine JSON spot (`PAYINPQA3-IT3RY3` / env.stamp `IT3RY3`)

| Signal | Value | QC |
|--------|-------|-----|
| `honesty.payroll_e2e_ready` / `seed_used` / `module_uat` / `amis_done` | **false** | 🟢 |
| `ac.POST-EMPLOYEES-201` | PASS · 201 · `HRM-ADV-201` · holding query | 🟢 |
| `ac.POST-BODY-FIELDS` | code/name/amount snake_case | 🟢 |
| `ac.NO-STUB-TOAST` | «Đã thêm nhân viên» | 🟢 |
| `ac.FE-LIST-REFRESH` / `F5-ROW-REMAINS` | empty→`UAT-0100` · F5 persists | 🟢 |
| `ac.CONSOLE-GATE` | 0 fatal | 🟢 |
| `overall` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| advance id | `e331f739-…` · name `QA-ADV-EMP-IT3RY3` | 🟢 |

---

## Gate AC audit (FE Thêm NV)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 1 | POST …/employees **201** `HRM-ADV-201` | Network + JSON postEmployees | 🟢 |
| 2 | Body `employee_code` / `employee_name` / `advance_amount` | UAT-0100 · UAT NV 0100 · 1250000 | 🟢 |
| 3 | FE list refresh after 2xx | screen 06 · toast success | 🟢 |
| 4 | F5 row remains | screen 07 | 🟢 |
| 5 | No stub toast | stub absent | 🟢 |
| — | AMIS DONE / module UAT / J-HRM-07 / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-03 | QC |
|-----------------|-------|-------|-----|
| **L1 Step4 packs** (QC-01) | 🟢 ACCEPT GWC | not retested | 🟢 **RETAIN SEAL** |
| **FE Thêm NV** (in-scope) | FE-01 CONDITION | 🟢 PASS stamp | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** Lương → phiếu lương process | Historical | **not retested** | ⬜ **DEFERRED** — not claimed |
| mark-paid period picker | residual | OOS | ⬜ **idle-ok** |
| AMIS full / module UAT | research | — | ⬜ **OUT** this seat |

**U19 note:** This gate certifies **FE Thêm NV on pending advance** named in dispatch — **not** J-HRM-07 / AMIS DONE / module payroll UAT. Missing full journey does **not** NO-GO this seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (FE Thêm NV slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Create pending advance (setup) | Create | **PASS** (201 HRM-ADV-201 · QA harness) |
| POST advance employees via FE | Create | **PASS** (201 HRM-ADV-201 · body fields) |
| List employees after add | Read | **PASS** (row UAT-0100 · 1.250.000 ₫) |
| F5 persistence | Read | **PASS** |
| mark-paid + payrollPeriodId picker | Update | **N/A** — OOS idle-ok |
| removeEmployee | Delete | **N/A** — Nest stub OOS idle-ok |
| Full Step4 / J-HRM-07 | — | **N/A** — DENIED this seat |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| POST employees 201 + FE refresh + F5 | **PRODUCT OK** | Slice ACCEPT |
| FE-01 CONDITION CLOSED | **PRODUCT OK** | QC-01 CONDITION resolved |
| QA pack **8/8** | **PROCESS OK** | No OBS |
| mark-paid picker / removeEmployee | **SCOPE OBS** | OOS idle-ok — not product NO-GO |
| AMIS / Phase1 / ready / J-HRM-07 / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |
| QC-01 L1 API | **GOVERNANCE OK** | SEAL · no reopen |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **FE Thêm NV UF** | — | `qa`/`qc` | **CLOSED / ACCEPT** | stamp PAYINPQA3-IT3RY3 |
| **PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01** | P1 | — | **CLOSED** | Was QC-01 CONDITION |
| **QC-01 L1 Step4 packs** | — | — | **SEAL RETAIN** | cấm reopen |
| **mark-paid UI payrollPeriodId picker** | P2 | `dev-fe` optional | **OOS idle-ok** | Not this WI |
| **removeEmployee / update/delete Nest stubs** | P2 | `dev-be` optional | **OOS idle-ok** | Not this WI |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process UAT | L2.5 | `qa` later | **DEFERRED** | Not flipped |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0/P1 product residuals for this FE Thêm NV WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` only — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / J-HRM-07 GO; **not** product NO-GO for certified FE Thêm NV.

**Idle-ok for K3 seat:** no forced residual Task — OOS picker/stubs optional backlog K3b; PM may continue K1–K4 wave peers.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-03.md` | exit **0** · **8/8** | **PROCESS OK** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYINPQA3-IT3RY3` | **PASS** · all AC · POST 201 | PRODUCT OK (cited) |
| Spot-check screens 06/07 | UAT-0100 · 1.250.000 ₫ · F5 | PRODUCT OK |
| QC-01 L1 SEAL | retain · no reopen | GOVERNANCE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

---

## completion_report

### Closed

1. QC FE Thêm NV advance gate — **GO WITH CONDITIONS**.  
2. Audited QA-03 MD + browser JSON stamp `PAYINPQA3-IT3RY3` + screens 06/07 — POST employees **201** `HRM-ADV-201` + body fields + list refresh + F5 **ACCEPT**.  
3. CLOSED QC-01 CONDITION **FE-01**.  
4. Retained QC-01 L1 Step4 packs SEAL (no reopen).  
5. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED**.  
6. QA pack 8/8 · QC pack consolidates 8/8.  
7. CONDITION **`C-SLICE-≠-MODULE`** · residuals mark-paid picker / removeEmployee **OOS idle-ok**.  
8. K3 exit: Step4 API+FE Thêm NV GWC.

### Residual

- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- mark-paid picker / removeEmployee — **idle-ok** (optional K3b).  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE · **NOT** J-HRM-07 flip · **NOT** `payroll_e2e_ready=true`.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC FE Thêm NV · stamp PAYINPQA3-IT3RY3 · K3 CLOSED · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / J-HRM-07 / module UAT · continue resume wave K1/K2/K4 peers · **do not** reopen QC-01 L1 · idle-ok OOS picker/stubs |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-RESUME-QC-WAVE-K1-K4 (continue peers)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QC-02 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-02.md
stamp_qa: PAYINPQA3-IT3RY3
resume_chunk: K3 CLOSED

## Status
- FE Thêm NV advance (POST employees 201 HRM-ADV-201 + list + F5) = ACCEPT GWC
- CLOSED: FE-01 CONDITION from QC-01
- RETAIN SEAL: QC-01 L1 Step4 packs (cấm reopen)
- CONDITION: C-SLICE-≠-MODULE only
- OOS idle-ok: mark-paid payrollPeriodId picker · removeEmployee Nest stubs
- payroll_e2e_ready=false LOCKED · no AMIS DONE · no module UAT · no Phase1 · no J-HRM-07

## Action
1) Mark K3 exit in PO_HRM_RESUME_PLAN / TEAM_WORKING_NOW — Step4 API+FE Thêm NV GWC
2) Continue open resume peers (K1 FE-CB QC / K2 PROCESS-POST QC / K4 PERIOD-BIND QC) via pnpm run pm:idle:check
3) Do NOT force Task for mark-paid picker or removeEmployee stubs (idle-ok)

cấm: flip payroll_e2e_ready · claim AMIS DONE · Phase1 DONE · J-HRM-07 process · module UAT · reopen QC-01 L1 · seed
```
