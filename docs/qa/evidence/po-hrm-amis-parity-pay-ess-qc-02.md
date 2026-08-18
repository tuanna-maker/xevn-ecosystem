# Evidence — `PO-HRM-AMIS-PARITY-PAY-ESS-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser U65 ESS Phiếu của tôi** (not L1 BE rewrite · not AMIS DONE · not J-HRM-07 · not module UAT) |
| **priority** | P1 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02` **PASS_TO_PM** stamp **`PAYESSQA2-IZE9S5`** · AC5 **`PAYESSQA2-AC5R-ZLJ9L`** |
| **closes_defect** | **`D-PAY-ESS-FE-SCOPE-COERCE`** — **CLOSED** (QC ACCEPT) |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | ESS tab → list holding → open → confirm → F5 · CEO 403 — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — browser ESS AC1–AC5 ACCEPT · defect CLOSED · L1 QC-01 SEAL **RETAINED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-ess-qa-02.md`](po-hrm-amis-parity-pay-ess-qa-02.md) |
| **fe_ref** | [`po-hrm-amis-parity-pay-ess-fe-02.md`](po-hrm-amis-parity-pay-ess-fe-02.md) READY_FOR_QA → QA PASS |
| **l1_seal** | [`po-hrm-amis-parity-pay-ess-qc-01.md`](po-hrm-amis-parity-pay-ess-qc-01.md) GWC L1 — **RETAINED · not reopened** |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-ess-qa-02-retest-rollup.json`](_tmp-po-hrm-amis-parity-pay-ess-qa-02-retest-rollup.json) · AC5 [`_tmp-…-ac5-retest.json`](_tmp-po-hrm-amis-parity-pay-ess-qa-02-ac5-retest.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-ess-qa-02/` (01–05 · 06b) |
| **spec_ref** | API_DESIGN **F-PAY-PAYSLIP-01** · SRS **FR-UC-BP-PAY-08** |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no L1 BE rewrite |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser ESS GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS DONE** | **DENIED** | Browser ESS UF only |
| **J-HRM-07 DONE** | **DENIED** | Not claimed / not retested as process e2e |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Existing slip `e1ac365a-…` · no `pnpm seed:*` |
| **L1 ESS BE rewrite** | **DENIED** | QC-01 SEAL **RETAINED** · `l1_api_spine_reopened=false` |
| **`C-SLICE-≠-MODULE`** | **RETAINED** | governance CONDITION |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 **Phiếu của tôi** after FE-02 scope fix + QA-02 retest PASS stamps `PAYESSQA2-IZE9S5` / AC5 `PAYESSQA2-AC5R-ZLJ9L`. Audited QA-02 MD + retest rollup (`overall=PASS` · honesty all false · defect CLOSED) + FE-02 `resolveEssPayslipCompanyId` + L1 QC-01 SEAL + screens 01–05 + 06b (QC visual spot-check). Proven chain: L0 HRM/XBOS/portal **200** → ESS JWT `holding` → tab **Phiếu của tôi** → **GET** `me/payslips?company_id=holding` **200** `HRM-PAY-200` FE rows=2 (**NOT** main / **NOT** 409) → open detail **200** → **POST** confirm **201** `HRM-PAY-204-ESS` · badge **Đã xác nhận** + toast → F5 `ess_confirmed=true` · CTA hidden → CEO `company_id=main` **403** `HRM-PAY-403-ESS` · honest banner · **0** rows. **CLOSED:** `D-PAY-ESS-FE-SCOPE-COERCE`. **RETAINED:** L1 QC-01 SEAL — **cấm reopen**. QA pack verify **2/8** = **PROCESS OBS** (missing `command_table` · `crud_or_matrix`) — this QC consolidates **8/8**. Harness first-pass AC3/AC5 testid race = **OBS OK** (product proven by Network + screens + hardened AC5 JSON). Console admin `usePayrollPayslips` 409 on ESS session = **OBS idle-ok** (not ESS `me/payslips` path). **DENIED** `payroll_e2e_ready=true` · AMIS DONE · J-HRM-07 · module UAT · Phase1 DONE · L1 BE rewrite. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Entry stamp `PAYESSQA2-IZE9S5` + AC5 `PAYESSQA2-AC5R-ZLJ9L` | QA-02 · rollup · AC5 JSON | 🟢 **ACCEPT** |
| L0 stack 200 | QA-02 · this QC `qc:dev-stack` | 🟢 **ENV OK** (Windows UV assert after success = ENV OBS) |
| **D-PAY-ESS-FE-SCOPE-COERCE** CLOSED | Network `holding` **200** (was main→409) | 🟢 **CLOSED** |
| AC1 list holding 200 · FE rows | shot 02 · Network holding | 🟢 **ACCEPT** |
| AC2 detail GET 200 | shot 03 · Network | 🟢 **ACCEPT** |
| AC3 confirm POST 201 + badge | shot 04 green **Đã xác nhận** + toast | 🟢 **ACCEPT** (harness testid OBS) |
| AC4 F5 persist | shot 05 · `ess_confirmed=true` | 🟢 **ACCEPT** |
| AC5 CEO 403 + banner + 0 rows | shot 06b · AC5 JSON | 🟢 **ACCEPT** |
| Honesty locks / no seed | rollup honesty | 🟢 **ACCEPT** |
| L1 QC-01 SEAL | qc-01 GWC | 🟢 **RETAINED** — not reopened |
| QA pack 2/8 | command_table · crud_or_matrix | 🟡 **PROCESS OBS** — QC consolidates |
| Harness badge / AC5 race | OBS | 🟡 **OBS idle-ok** P3 |
| Admin payslips 409 console on ESS | OBS | 🟡 **OBS idle-ok** P3 |
| AMIS / module / Phase1 / ready / J-HRM-07 | Explicit DENIED | 🟢 |
| **C-SLICE-≠-MODULE** | governance | 🟡 **CONDITION** |

**Cấm:** invent `payroll_e2e_ready=true` · claim AMIS DONE · J-HRM-07 · module UAT · Phase1 DONE · reopen L1 ESS BE · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · browser ESS UF ≠ LIVE process / module UAT / AMIS DONE / J-HRM-07 |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim **D-PAY-ESS-FE-SCOPE-COERCE** CLOSED? | **YES** — this seat GWC |
| May PM claim browser ESS AC1–AC5 ACCEPT (U65)? | **YES** — this seat GWC |
| May PM claim L1 ESS spine still SEALED? | **YES** — QC-01 retained · not reopened |
| May PM claim AMIS DONE / module UAT / Phase1 / J-HRM-07? | **NO** |
| Forced residual dispatch this turn? | **NO** — idle-ok P3 OBS only |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| L1 QC-01 GWC SEAL | `…-pay-ess-qc-01.md` stamp QA-01 `PAYESS-MSIRE93Q` | PASS_TO_PM · CONDITION was browser FE | 🟢 **RETAIN** — cấm reopen |
| FE-02 scope fix | `…-pay-ess-fe-02.md` | READY_FOR_QA | 🟢 **ACCEPT** `resolveEssPayslipCompanyId` |
| QA-02 browser U65 retest | `…-pay-ess-qa-02.md` | PASS_TO_PM | 🟢 **ACCEPT** stamp `PAYESSQA2-IZE9S5` |
| Retest rollup | `_tmp-…-retest-rollup.json` | overall **PASS** | 🟢 **ACCEPT** |
| AC5 hardened | `_tmp-…-ac5-retest.json` | `ac5=PASS` · banner403=true · rows=0 | 🟢 **ACCEPT** |
| Screens 01–05 + 06b | folder present · QC visual | badge + CEO banner | 🟢 **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** |
| L0 spot QC | `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** | 🟢 **ENV OK** (UV assert = ENV OBS) |
| Pack verify QC-02 | this file | expected **PASS** exit **0** · **8/8** | QC pack SoT |

### Machine JSON spot (`PAYESSQA2-IZE9S5` rollup)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` / `ac5_hardened_stamp` | `PAYESSQA2-IZE9S5` / `PAYESSQA2-AC5R-ZLJ9L` | 🟢 |
| `overall` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` | **false** | 🟢 |
| `honesty.module_uat_claimed` / `amis_done_claimed` / `j_hrm_07_done_claimed` | **false** | 🟢 |
| `defect_closed.id` / `status` | `D-PAY-ESS-FE-SCOPE-COERCE` / **CLOSED** | 🟢 |
| `ac.AC1` | holding **200** · NOT main/409 | 🟢 |
| `ac.AC2`–`AC4` | detail · POST 201 · F5 persist | 🟢 |
| `ac.AC5` | CEO 403 · banner · 0 rows | 🟢 |

### Note on raw browser JSON

First-pass `_tmp-…-qa-02-browser.json` still ends `overall=FAIL` on harness testid races (AC3 badge `isVisible` · AC5 banner wait). **QC does not use that as product FAIL** — authoritative SoT for this gate = **retest rollup + AC5 hardened JSON + screens** cited in QA-02 MD. Product Network codes (holding 200 · confirm 201 · CEO 403) are present in the same browser JSON network log.

---

## Gate AC audit (browser ESS U65)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| AC1 | GET `company_id=holding` **200** own rows · NOT main/409 | Network holding **200** · FE 2 rows · shot 02 | 🟢 |
| AC2 | Detail GET **200** · `ess_confirmed` | **200** · shot 03 | 🟢 |
| AC3 | POST confirm 2xx · FE badge Đã xác nhận | **201** `HRM-PAY-204-ESS` · shot 04 badge + toast | 🟢 |
| AC4 | F5 still confirmed · CTA hidden | F5 **200** `ess_confirmed=true` · shot 05 | 🟢 |
| AC5 | CEO **403** · honest banner · no invent | **403** `HRM-PAY-403-ESS` · shot 06b · rows=0 | 🟢 |
| Defect | Scope coerce CLOSED | holding 200 after FE-02 | 🟢 **CLOSED** |
| — | AMIS DONE / module UAT / J-HRM-07 / Phase1 | Explicit non-claim | 🟢 **DENIED** |

### L2.5 / U19

| Item | Status |
|------|--------|
| In-scope browser ESS click path | **PASS** (this seat) |
| Full **J-HRM-07** process UAT | **DENIED / DEFERRED** — not this seat |
| Missing J-HRM-07 | Does **not** NO-GO this narrow browser seat; forces **GWC** `C-SLICE-≠-MODULE` |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Holding list **200** after FE-02 | PRODUCT PASS | ACCEPT · defect CLOSED |
| Confirm **201** + F5 persist | PRODUCT PASS | ACCEPT |
| CEO **403** + banner + 0 rows | PRODUCT PASS | ACCEPT must_keep |
| QA pack 2/8 | PROCESS OBS | QC consolidates 8/8 |
| Harness AC3/AC5 testid race | PROCESS OBS | Idle-ok · product OK via screens |
| Admin `usePayrollPayslips` 409 console on ESS JWT | PRODUCT OBS P3 | Idle-ok — not ESS me/payslips path |
| Windows UV assert after `qc:dev-stack` 200 | ENV OBS | Not product FAIL |
| `payroll_e2e_ready` / AMIS / J-HRM-07 / module / Phase1 | SCOPE CONDITION | `C-SLICE-≠-MODULE` |

---

## Conditions (GWC)

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE / J-HRM-07 |
| **OBS-HARNESS-TESTID** | P3 | qa optional | **OBS idle-ok** | Badge/banner wait polish |
| **OBS-ADMIN-PAYSLIPS-409-ON-ESS** | P3 | backlog | **OBS idle-ok** | Admin list hook on ESS session |
| **L1 QC-01 SEAL** | — | — | **RETAINED** | cấm reopen BE |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | |

**CONDITION for GWC:** `C-SLICE-≠-MODULE` — sufficient to deny ready flip and deny AMIS / module / Phase1 / J-HRM-07 GO; **not** product NO-GO for certified browser ESS AC1–AC5.

---

## Evidence pack commands

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md` | exit **1** · **2/8** · missing `command_table` · `crud_or_matrix` → **PROCESS OBS** |
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** · Windows UV assert after success = ENV OBS |
| QC pack SoT | this file — portal_url · journey · AC matrix · Classification · residual · honesty · command table · L2.5 note |

| Check | Status |
|-------|--------|
| portal_url | 🟢 |
| journey_l25 / ESS click path | 🟢 |
| AC / CRUD matrix rows PASS | 🟢 |
| Classification ENV vs PRODUCT | 🟢 |
| Honesty locks | 🟢 |
| Residual / Conditions | 🟢 |
| command_table (this QC) | 🟢 |
| Screens cited + spot-checked | 🟢 |
| **QC pack** | **8/8** |

---

## completion_report

### Closed

1. QC browser ESS Phiếu của tôi gate — **GO WITH CONDITIONS**.  
2. Audited QA-02 + FE-02 + L1 QC-01 + screens — AC1–AC5 **ACCEPT**.  
3. **CLOSED:** `D-PAY-ESS-FE-SCOPE-COERCE` (holding **200**, not main/409).  
4. **RETAINED:** L1 QC-01 SEAL · **`C-SLICE-≠-MODULE`**.  
5. must_keep verified: CEO 403 banner · F5 after confirm · no invent rows.  
6. Honesty locks held: `payroll_e2e_ready=false` · AMIS **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED** · L1 rewrite **DENIED** · seed **DENIED**.  
7. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
8. Explicit **NO** to PM promote ready / AMIS DONE.  
9. **Idle-ok** — no forced residual dispatch for this browser ESS board.

### Residual

- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- P3 OBS harness testid / admin payslips 409 on ESS — idle-ok.  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE · **NOT** J-HRM-07.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC browser ESS AC1–AC5 · D-PAY-ESS-FE-SCOPE-COERCE CLOSED · stamps PAYESSQA2-IZE9S5 / PAYESSQA2-AC5R-ZLJ9L · L1 QC-01 SEAL retained · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / J-HRM-07 / module UAT · **idle-ok** unless NEW P0 outside this seat |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-ESS-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
priority: P1
prior: PO-HRM-AMIS-PARITY-PAY-ESS-QC-02 GO WITH CONDITIONS
parent: PO-HRM-CONTINUOUS-W7-20260807
closes_defect: D-PAY-ESS-FE-SCOPE-COERCE (QC ACCEPT CLOSED)

## Mission (PM intake)
Browser ESS Phiếu của tôi GWC ACCEPT · AC1–AC5 U65 PASS after FE-02.
CLOSED D-PAY-ESS-FE-SCOPE-COERCE (Network company_id=holding 200).
RETAIN L1 ESS QC-01 SEAL (cấm reopen BE) · RETAIN C-SLICE-≠-MODULE.
payroll_e2e_ready=false LOCKED.

## Decision
IDLE-OK this browser ESS seat.
Run pnpm run pm:idle:check — dispatch only if NEW P0/P1 open outside this closed seat.

## Explicit DENY
- payroll_e2e_ready=true
- AMIS DONE
- J-HRM-07 DONE
- module payroll UAT
- Phase1 DONE
- L1 ESS BE rewrite / reopen QC-01

## evidence
docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-02.md
docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md (stamps PAYESSQA2-IZE9S5 · PAYESSQA2-AC5R-ZLJ9L)
docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-01.md (L1 SEAL)

## ack
PASS_TO_PM · idle-ok this seat
```
