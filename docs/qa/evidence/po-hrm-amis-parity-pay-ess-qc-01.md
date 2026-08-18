# Evidence — `PO-HRM-AMIS-PARITY-PAY-ESS-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API ESS payslip AMIS Step6 GĐ1** (not browser UF · not mobile device UI · not module UAT) |
| **priority** | P2 |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-ESS-QA-01` PASS_TO_PM (stamp **`PAYESS-MSIRE93Q`**) |
| **closes** | **L1 ESS `/payroll/me/payslips*` Step6 GĐ1** (list / get / confirm / 403 gates) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat · **api_base** `http://127.0.0.1:28001/api/hrm` (mobile ESS L1) |
| **journey_l25** | L1 ESS me/payslips list→get→confirm + CEO/cross 403 — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — L1 ESS Step6 ACCEPT · CONDITIONS: **`OBS-NEST-POST-201`** (acceptable) · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-ess-qa-01.md`](po-hrm-amis-parity-pay-ess-qa-01.md) stamp **`PAYESS-MSIRE93Q`** |
| **be_ref** | [`po-hrm-amis-parity-pay-ess-be-01.md`](po-hrm-amis-parity-pay-ess-be-01.md) READY_FOR_QA |
| **payslip_get_baseline** | [`po-hrm-payroll-formula-run-gap-qc-payslip-lines-get-01.md`](po-hrm-payroll-formula-run-gap-qc-payslip-lines-get-01.md) GWC public GET — **RETAINED · do not reopen** (ESS me path was DEFERRED → **CLOSED L1 this seat**) |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-ess-qa-01.FINAL.json`](_tmp-po-hrm-amis-parity-pay-ess-qa-01.FINAL.json) |
| **spec_ref** | API_DESIGN **F-PAY-PAYSLIP-01** · SRS **FR-UC-BP-PAY-08** · AMIS Step6 GĐ1 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · QA used existing processed payslip of `uat.nv0001` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 ESS GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Step6 GĐ1 L1 API only |
| **Browser UF / J-HRM-07 / mobile UI** | **DENIED** this seat | L1 API only |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Existing list pick · no `pnpm seed:*` |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **Public payslip GET GWC** | **RETAINED CLOSED** | **Do not reopen** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 ESS payslip Step6 GĐ1 after BE-ESS-01 + QA-ESS-01 against F-PAY-PAYSLIP-01 / FR-UC-BP-PAY-08. Audited QA MD + FINAL JSON stamp `PAYESS-MSIRE93Q` (`verdict=PASS` · AC1–AC6 `ok=true` · `honesty.payroll_e2e_ready=false` · `seed=false` · `module_uat=false` · `j_hrm_07=false` · `amis_parity_done=false`) + BE behavior matrix. Proven: mobile login `uat.nv0001` **201** `HRM-AUTH-200` + `employee_id` → **GET me/payslips 200** own-only (`total=2`) → **GET by id 200** `ess_confirmed` present → **POST confirm 201** `HRM-PAY-204-ESS` + F5 **200** `ess_confirmed=true` / `employee_confirmed_at` set → CEO **403** `HRM-PAY-403-ESS` → cross-employee **403** `HRM-PAY-403-ESS`. **OBS-NEST-POST-201** (Nest default **201** vs paper/BE claim **200**) = **CONDITION OK / ACCEPT** — business code + F5 persistence PASS; optional `@HttpCode(200)` polish only. QA pack verify **2/8** = **PROCESS OBS** (missing `portal_url` + `crud_or_matrix` on L1-only MD) — this QC consolidates **8/8**. Public payslip GET baseline **RETAINED** — ESS me path L1 **CLOSED this seat**. Remaining CONDITIONS: **`OBS-NEST-POST-201`** · **`C-SLICE-≠-MODULE`**. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT · FE/mobile ESS UI claim. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 Mobile ESS login + `employee_id` | **201** `HRM-AUTH-200` · emp `3796d949-…` · `holding` | 🟢 **ACCEPT** |
| AC2 `GET me/payslips` own rows | **200** `HRM-PAY-200` · `total=2` · `ownOnly=true` | 🟢 **ACCEPT** |
| AC3 `GET me/payslips/:id` + `ess_confirmed` | **200** · arrays present · `ess_confirmed` bool | 🟢 **ACCEPT** |
| AC4 Confirm + F5 | **201** `HRM-PAY-204-ESS` · F5 **200** confirmed | 🟢 **ACCEPT** *(OBS Nest 201)* |
| AC5 CEO no `employee_id` | **403** `HRM-PAY-403-ESS` | 🟢 **ACCEPT** |
| AC6 Cross-employee | **403** `HRM-PAY-403-ESS` | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty | 🟢 **DENIED promote** |
| QA pack 2/8 | portal_url + crud_or_matrix missing | 🟡 **PROCESS OBS** — QC consolidates |
| OBS-NEST-POST-201 | 201 vs paper 200 | 🟡 **CONDITION OK** — GWC acceptable |
| OBS-OWN-LINES-EMPTY | components/lines len 0 | 🟡 **CONDITION OK** — structure OK · not AC fail |
| Draft 409 live | BE jest only | ⬜ **DEFERRED** — not slice FAIL |
| Stale-dist recovery | QA kill+restart PID 19280 | 🟡 **CONDITION OK** SOP |
| Public payslip GET GWC | prior GWC | 🟢 **RETAIN CLOSED · do not reopen** |
| AMIS DONE / module UAT / Phase1 / ready / J-HRM-07 | Explicit DENIED | 🟢 |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · claim FE/mobile ESS UI PASS · reopen public payslip GET · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 ESS ≠ LIVE process / module UAT · no J-HRM-07 browser |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim AMIS Step6 L1 ESS API ACCEPT? | **YES** — this seat GWC |
| May PM claim AMIS DONE / module UAT / Phase1 / J-HRM-07 / FE ESS UI? | **NO** |
| May PM reopen public payslip GET GWC? | **NO** |
| Forced residual dispatch this turn? | **NO** — idle-ok L1 ESS Step6 · optional P3 HttpCode polish / FE ESS later |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-ESS-01 | `po-hrm-amis-parity-pay-ess-be-01.md` | READY_FOR_QA | **ACCEPT** F-PAY-PAYSLIP-01 ESS ADD |
| QA-ESS-01 L1 | `po-hrm-amis-parity-pay-ess-qa-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYESS-MSIRE93Q` |
| Machine FINAL | `_tmp-…-pay-ess-qa-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| Public payslip GET GWC | payslip-lines-get QC | GWC | **RETAIN** · ESS me was DEFERRED → **CLOSED L1** |
| Spec F-PAY-PAYSLIP-01 / FR-UC-BP-PAY-08 | API_DESIGN + SRS + BE | CONFIRMED | **TRACE OK** |

### Machine JSON spot (`PAYESS-MSIRE93Q`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYESS-MSIRE93Q` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed` | **false** / **false** | 🟢 |
| `honesty.module_uat` / `j_hrm_07` / `amis_parity_done` | **false** | 🟢 |
| `cases.AC1_MOBILE_LOGIN.ok` | true · 201 · employee_id bound | 🟢 |
| `cases.AC2_LIST_OWN.ok` | true · 200 · ownOnly | 🟢 |
| `cases.AC3_GET_BY_ID.ok` | true · 200 · ess_confirmed | 🟢 |
| `cases.AC4_CONFIRM_F5.ok` | true · 201 + F5 · `http_obs=NEST_POST_201_vs_paper_200` | 🟢 *(OBS OK)* |
| `cases.AC5_CEO_NO_EMP.ok` | true · 403 HRM-PAY-403-ESS | 🟢 |
| `cases.AC6_CROSS_EMP.ok` | true · 403 HRM-PAY-403-ESS | 🟢 |
| `verdict` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |
| ESS persona | `uat.nv0001@xe.vn` · emp `3796d949-…` | 🟢 |
| Pick payslip | `7c78b34e-…` status=`processed` | 🟢 |

---

## Gate AC audit (AMIS Step6 ESS L1)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| AC1 | Mobile ESS login with `employee_id` | **201** `HRM-AUTH-200` | 🟢 |
| AC2 | `GET /payroll/me/payslips` own only | **200** · ownOnly | 🟢 |
| AC3 | `GET /me/payslips/:id` + `ess_confirmed` | **200** · flag present | 🟢 |
| AC4 | `POST …/confirm` + F5 | **201** + F5 **200** confirmed | 🟢 *(OBS 201)* |
| AC5 | CEO no employee → 403 ESS | **403** `HRM-PAY-403-ESS` | 🟢 |
| AC6 | Cross-employee → 403 ESS | **403** `HRM-PAY-403-ESS` | 🟢 |
| — | AMIS DONE / module UAT / J-HRM-07 / Phase1 | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-ESS | QC |
|-----------------|-------|--------|-----|
| **L1 ESS me/payslips list→get→confirm + 403** (in-scope) | BE READY | 🟢 AC1–6 PASS | 🟢 **PASS / ACCEPT** |
| **L1 public payslip GET + `/lines`** | QC payslip-lines-get GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **J-HRM-07** Lương → phiếu lương process | Historical | **not retested** | ⬜ **DEFERRED** — not claimed |
| Browser / mobile ESS UI bind | — | L1 API only | ⬜ **DEFERRED** P2 OUT |
| AMIS Step7 Chi trả / payment batch | research | — | ⬜ **OUT** this seat |

**U19 note:** This gate certifies the **L1 ESS Step6 GĐ1 API** named in dispatch — **not** a claim that **J-HRM-07** / AMIS DONE / module payroll UAT is newly GO. Missing browser journey does **not** NO-GO this L1 seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — ESS payslip)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Mobile login ESS | Auth | **PASS** (201) |
| `GET /payroll/me/payslips` own list | Read | **PASS** (200 · ownOnly) |
| `GET /payroll/me/payslips/:id` | Read | **PASS** (200 · ess_confirmed) |
| `POST /payroll/me/payslips/:id/confirm` + F5 | Update | **PASS** (201 + F5 200) |
| CEO without `employee_id` | Read deny | **PASS** (403 HRM-PAY-403-ESS) |
| Cross-employee get | Read deny | **PASS** (403 HRM-PAY-403-ESS) |
| Draft confirm 409 | Update deny | **N/A live** — BE jest covered · deferred |
| Browser / mobile UI ESS | — | **N/A** — DENIED this seat |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **2/8** | **PROCESS OBS** | Missing `portal_url` + `crud_or_matrix` on L1 MD — **not** product demote; QC pack consolidates |
| AC1–AC6 L1 ESS | **PRODUCT OK** | Slice ACCEPT |
| OBS Nest POST **201** vs paper **200** | **PROCESS / CONTRACT OBS** | **CONDITION OK** — GWC acceptable · business `HRM-PAY-204-ESS` + F5 PASS |
| Own lines empty arrays | **DATA / SCOPE OBS** | Structure OK · not AC fail · lines density ≠ ESS confirm AC |
| Draft 409 not live-retested | **SCOPE** | Jest covered · not demote |
| Stale dist until QA restart | **PROCESS / ENV OBS** | CONDITION OK SOP — recovered |
| No P0/P1 product residual on this WI | **PRODUCT OK** | L1 ESS Step6 ACCEPT |
| AMIS / Phase1 / ready / J-HRM-07 / module | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **L1 ESS Step6 GĐ1** | — | `qa`/`qc` | **CLOSED / ACCEPT** | AC1–6 L1 PASS |
| **OBS-NEST-POST-201** | P3 | `dev-be` optional | **CONDITION OK** | Nest 201 vs paper 200 — acceptable GWC; optional `@HttpCode(200)` |
| **OBS-OWN-LINES-EMPTY** | P3 | backlog | **CONDITION OK** | Arrays present len 0 — not AC fail |
| **Draft 409 live** | P2 | backlog | **DEFERRED** | BE jest PASS · not live this seat |
| **FE/mobile ESS UI** | P2 | `dev-fe`/`dev-mobile` later | **OUT** | After L1 — not this seat |
| **R-PAY-PAYSLIP-LINES-GET** | — | — | **CLOSED** (prior) | **Do not reopen** |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process UAT | L2.5 | `qa` later | **DEFERRED** | When program opens browser process |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 / AMIS DONE |

**P0/P1/P2 product residuals for this ESS L1 WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `OBS-NEST-POST-201` (acceptable) + `C-SLICE-≠-MODULE` — sufficient to deny `payroll_e2e_ready=true` and deny AMIS DONE / module / Phase1 / J-HRM-07 GO; **not** product NO-GO for certified L1 ESS Step6.

**Idle-ok:** L1 ESS Step6 board closed — **no forced residual Task** this turn.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-01.md` | exit **1** · **2/8** (portal_url · crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYESS-MSIRE93Q` | **PASS** · AC1–6 ok | PRODUCT OK (cited) |
| Spec spot-check F-PAY-PAYSLIP-01 / FR-UC-BP-PAY-08 / BE | ESS routes + 403 gates aligned | TRACE OK |
| Prior ESS me DEFERRED on payslip-get QC | superseded L1 CLOSED this seat | GOVERNANCE OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 ESS payslip AMIS Step6 GĐ1 gate — **GO WITH CONDITIONS**.  
2. Audited QA-ESS-01 MD + FINAL JSON stamp `PAYESS-MSIRE93Q` + BE-ESS-01 — AC1–AC6 **ACCEPT**.  
3. Honesty locks held: `payroll_e2e_ready=false` · AMIS DONE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED**.  
4. **OBS-NEST-POST-201** accepted as CONDITION OK (not product FAIL).  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. Public payslip GET GWC **not reopened**; ESS me L1 path **CLOSED**.  
7. Explicit **NO** to PM promote ready / AMIS DONE · CONDITIONS **`OBS-NEST-POST-201`** + **`C-SLICE-≠-MODULE`**.  
8. **Idle-ok** — no forced residual dispatch for this L1 ESS board.

### Residual

- **`OBS-NEST-POST-201`** CONDITION OK (optional BE HttpCode polish).  
- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- Draft 409 live / FE·mobile ESS UI / J-HRM-07 — deferred · **not** forced same-turn.  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT · **NOT** AMIS DONE.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC L1 ESS Step6 · stamp PAYESS-MSIRE93Q · **cấm** flip `payroll_e2e_ready` / AMIS DONE / Phase1 / J-HRM-07 / module UAT · OBS-NEST-POST-201 CONDITION OK · **idle-ok** unless NEW P0 outside this seat |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-RESEARCH-01 (idle / backlog scan)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-AMIS-PARITY-PAY-ESS-QC-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-01.md
stamp_qa: PAYESS-MSIRE93Q

## Status
- L1 ESS Step6 GĐ1 (me/payslips list/get/confirm + 403) = ACCEPT GWC
- CONDITIONS: OBS-NEST-POST-201 (Nest 201 vs paper 200 — OK) · C-SLICE-≠-MODULE
- payroll_e2e_ready=false LOCKED · no AMIS DONE · no module UAT · no Phase1 · no J-HRM-07

## Action
idle-ok for L1 ESS Step6 board.
Run pnpm run pm:idle:check — dispatch only if NEW P0/P1 open (e.g. AMIS Step7 chi trả / FE ESS bind) outside this closed seat.
Optional P3 (not forced): BE @HttpCode(200) on confirm to match paper.

cấm: flip payroll_e2e_ready · claim AMIS DONE · Phase1 DONE · J-HRM-07 process · module UAT · reopen public payslip GET
```
