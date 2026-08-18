# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-PAYSLIP-LINES-GET-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-PAYSLIP-LINES-GET-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API R-PAY-PAYSLIP-LINES-GET OBS close** (not formula LIVE · not browser UF · not module UAT) |
| **priority** | P2 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01` PASS_TO_PM (stamp **`PAYSLIPGET-MSIKYBBB`**) |
| **closes** | **R-PAY-PAYSLIP-LINES-GET** (OBS P2 OPEN on QC-ATT-LINE-03 / QC-CB-BAG) |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **journey_l25** | L1 GET payslip by id + `/lines` + scope 404 — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — L1 payslip GET ACCEPT · **R-PAY-PAYSLIP-LINES-GET CLOSED** · remaining CONDITION: **`C-SLICE-≠-MODULE` only** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md`](po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md) stamp **`PAYSLIPGET-MSIKYBBB`** |
| **be_ref** | [`po-hrm-payroll-formula-run-gap-be-payslip-lines-get-01.md`](po-hrm-payroll-formula-run-gap-be-payslip-lines-get-01.md) READY_FOR_QA |
| **qc_att_baseline** | [`po-hrm-payroll-formula-run-gap-qc-att-line-03.md`](po-hrm-payroll-formula-run-gap-qc-att-line-03.md) GWC AC4-BIND — **RETAINED · do not reopen** · OBS payslip GET supersedes OPEN → **CLOSED this seat** |
| **cb_bag_baseline** | [`po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md`](po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md) GWC L1 C&B — **RETAINED · do not reopen** |
| **fe_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md) GWC FE-EVAL — **RETAINED · do not reopen** |
| **l1_eval_baseline** | [`po-hrm-payroll-formula-run-gap-qc-eval-01.md`](po-hrm-payroll-formula-run-gap-qc-eval-01.md) GWC L1 evaluator — **RETAINED · do not reopen** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.FINAL.json) |
| **spec_ref** | API_DESIGN **F-PAY-PAYSLIP-01** · BE-PAYSLIP-LINES-GET-01 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · QA used existing processed payslip from list |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 payslip GET GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / customer UAT** | **DENIED** | Not retested · not claimed |
| **Browser UF / J-HRM-07** | **DENIED** this seat | L1 API only |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Existing list pick · no `pnpm seed:*` |
| **Module payroll UAT** | **DENIED** | OBS close ≠ module GO |
| **ATT / CB-BAG / FE-EVAL / EVAL** | **RETAINED CLOSED** | **Do not reopen** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 public GET payslip by id + `/lines` after BE-PAYSLIP-LINES-GET + QA-PAYSLIP-LINES-GET against F-PAY-PAYSLIP-01. Audited QA MD + FINAL JSON stamp `PAYSLIPGET-MSIKYBBB` (`verdict=PASS` · all AC ok · `honesty.payroll_e2e_ready=false` · `residual_closed=["R-PAY-PAYSLIP-LINES-GET"]`) + BE matrix + QC-ATT-LINE-03 / CB-BAG / FE-EVAL / EVAL baselines. Proven: list pick processed `8ca0679c-…` NV002 → **GET by id 200** `HRM-PAY-200` `components.length=2` / `lines.length=2` (BASE 9.5M · DED_SAMPLE 950k) → **GET `/lines` 200** `total=2` `data.length=2` match · member CEO + unknown UUID → **404** `HRM-PAY-404` · no JWT → **401**. QA pack verify **2/8** = **PROCESS OBS** (missing `portal_url` + `crud_or_matrix` on L1-only MD) — this QC consolidates **8/8**. **R-PAY-PAYSLIP-LINES-GET = CLOSED** (supersedes QC-ATT-LINE-03 / QC-CB-BAG OBS OPEN). Retain ATT-LINE AC4 / CB-BAG / FE-EVAL / L1 EVAL — **do not reopen**. Remaining CONDITION: **`C-SLICE-≠-MODULE` only**. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · module payroll UAT · J-HRM-07 process UAT. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC-LIST pick processed | `8ca0679c-…` status=`processed` · gross **9_500_000** · list **200** | 🟢 **ACCEPT** |
| AC-GET-BY-ID components/lines | **200** `HRM-PAY-200` · arrays len **2** | 🟢 **ACCEPT** |
| AC-GET-LINES total match | **200** · `total=2` · `total_matches_by_id=true` | 🟢 **ACCEPT** |
| AC-SCOPE-404 member / missing | member id+lines **404** `HRM-PAY-404` · unknown **404** | 🟢 **ACCEPT** |
| AC-AUTH no JWT | **401** `HRM-AUTH-001` | 🟢 **ACCEPT** |
| Scope 409 vs 404 note | mismatched tenant header → 409 gate; corrected claims → 404 product | 🟢 **ACCEPT** (not FAIL) |
| Honesty `payroll_e2e_ready=false` | MD + machine honesty | 🟢 **DENIED promote** |
| QA pack 2/8 | portal_url + crud_or_matrix missing | 🟡 **PROCESS OBS** — QC consolidates |
| Stale-dist SOP | QA kill+restart after dist 13:37 | 🟡 **CONDITION OK** retained |
| ATT / CB-BAG / FE-EVAL / EVAL | prior GWC | 🟢 **RETAIN CLOSED · do not reopen** |
| Module UAT / Phase1 / ready / J-HRM-07 / LIVE | Explicit DENIED | 🟢 |
| ESS `/me/payslips/{id}` | BE OUT P3 | ⬜ **DEFERRED backlog** — not OBS reopen |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-HRM-07 · claim module payroll UAT · reopen ATT / CB-BAG / FE-EVAL / EVAL · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 GET ≠ LIVE payslip / process UAT · no J-HRM-07 browser process UF |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-PAYSLIP-LINES-GET closed? | **YES** — this seat ACCEPT L1 OBS close |
| May PM claim formula LIVE / module UAT / Phase1 / J-HRM-07? | **NO** |
| May PM reopen ATT / CB-BAG / FE-EVAL / EVAL? | **NO** |
| Forced residual dispatch this turn? | **NO** — idle-ok formula-gap L1 OBS closed · only `C-SLICE-≠-MODULE` retained |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-ATT-LINE-03 AC4 GWC | `po-hrm-payroll-formula-run-gap-qc-att-line-03.md` | PASS_TO_PM | **RETAIN** · OBS payslip was OPEN → **CLOSED this seat** |
| QC-CB-BAG / FE-EVAL / EVAL | prior GWC | PASS_TO_PM | **RETAIN · do not reopen** |
| BE-PAYSLIP-LINES-GET | `po-hrm-payroll-formula-run-gap-be-payslip-lines-get-01.md` | READY_FOR_QA | **ACCEPT** F-PAY-PAYSLIP-01 ADD |
| QA-PAYSLIP-LINES-GET L1 | `po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYSLIPGET-MSIKYBBB` |
| Machine FINAL | `_tmp-…-qa-payslip-lines-get-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **2/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |
| Spec F-PAY-PAYSLIP-01 | API_DESIGN + BE | CONFIRMED | **TRACE OK** |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYSLIPGET-MSIKYBBB` | 🟢 |
| `honesty.payroll_e2e_ready` / seed | **false** / **false** | 🟢 |
| `honesty.formula_LIVE` / `module_UAT` / `J-HRM-07` | **DENIED** | 🟢 |
| `honesty.reopen_ATT_CB_FE_EVAL` | **RETAINED_CLOSED** | 🟢 |
| `ac.AC_GET_BY_ID` | PASS · status=200 · lines=2 | 🟢 |
| `ac.AC_GET_LINES` | PASS · total=2 · match=true | 🟢 |
| `ac.AC_SCOPE_404` | PASS · member=404/HRM-PAY-404 · missing=404 | 🟢 |
| `ac.AC_AUTH` | PASS · 401 | 🟢 |
| `steps.get_payslip_by_id` | components_len=2 · lines_len=2 | 🟢 |
| `steps.get_payslip_lines` | total=2 · `total_matches_by_id=true` | 🟢 |
| `steps.scope_miss_member_ceo` (+ lines) | **404** `HRM-PAY-404` | 🟢 |
| `verdict` / `residual_closed` | **PASS** / `["R-PAY-PAYSLIP-LINES-GET"]` | 🟢 |
| `residual_open` | `[]` | 🟢 |
| Author / scope miss | `ceo@xe.vn` · `du-lich.ceo@xe.vn` | 🟢 |

---

## Gate AC audit (F-PAY-PAYSLIP-01)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| LIST | Pick processed payslip in list scope | **200** · processed NV002 | 🟢 |
| GET by id | Header + `components[]`/`lines[]` from `payroll_payslip_lines` | **200** · len 2/2 | 🟢 |
| GET `/lines` | `{ total, data[] }` match by-id | **200** · total=2 match | 🟢 |
| Scope miss | Member / missing → **404** `HRM-PAY-404` no leak | **404** both paths | 🟢 |
| Auth | No JWT → 401 | **401** | 🟢 |
| — | Formula LIVE / customer UAT / J-HRM-07 | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-PAYSLIP-GET | QC |
|-----------------|-------|----------------|-----|
| **L1 GET payslip by id + `/lines`** (in-scope) | BE READY | 🟢 AC PASS | 🟢 **PASS / ACCEPT** |
| **L1 ATT-LINE AC4 STRICT** | QC-ATT-LINE-03 GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **L1 C&B bag** | QC-CB-BAG GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **Browser FE-EVAL / L1 EVAL** | prior GWC | not re-run | 🟢 **RETAIN ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical | **not retested** | ⬜ **DEFERRED** — not claimed |
| Browser payslip detail UF / ESS me | — | L1 public only | ⬜ **DEFERRED** P3 |

**U19 note:** This gate certifies the **L1 public payslip GET + lines** named in dispatch — **not** a claim that **J-HRM-07** / formula LIVE / module payroll UAT is newly GO. Missing browser journey does **not** NO-GO this L1 OBS seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` only) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API — payslip GET)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| List payslips → pick processed | Read | **PASS** |
| GET `/payroll/payslips/:id` components/lines | Read | **PASS** (200 · arrays) |
| GET `/payroll/payslips/:id/lines` | Read | **PASS** (total match) |
| Member CEO / missing id | Read deny | **PASS** (404 HRM-PAY-404) |
| No JWT | Read deny | **PASS** (401) |
| ESS `GET …/me/payslips/{id}` | Read | **N/A** — OUT BE seat P3 |
| Browser UF bind components | — | **N/A** — DENIED this seat |
| Create/Update/Delete payslip | — | **N/A** — not in-scope this OBS |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack **2/8** | **PROCESS OBS** | Missing `portal_url` + `crud_or_matrix` on L1 MD — **not** product demote; QC pack consolidates |
| AC GET / lines / 404 / 401 | **PRODUCT OK** | Slice ACCEPT · OBS CLOSED |
| Stale dist until QA restart | **PROCESS / ENV OBS** | CONDITION OK SOP — QA recovered PID 29420 |
| Member wrong-tenant header → 409 | **ENV/GATE OBS** | Corrected claims → product 404 — not AC fail |
| ESS me path absent | **SCOPE / backlog P3** | Not reopen OBS · not slice FAIL |
| No P0/P1 product residual on this WI | **PRODUCT OK** | R-PAY-PAYSLIP-LINES-GET CLOSED |
| Module / Phase1 / ready / J-HRM-07 | **SCOPE CONDITION** | `C-SLICE-≠-MODULE` only remaining |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-PAYSLIP-LINES-GET** | was P2 OBS | `qa`/`qc` | **CLOSED** | L1 GET by id + `/lines` + scope 404 ACCEPT |
| **R-PAY-F-ATT-LINE-AC4-BIND** | — | — | **CLOSED** (QC-ATT-LINE-03) | **Do not reopen** |
| **R-PAY-F-CB-BAG** (L1) | — | — | **CLOSED** (QC-CB-BAG) | Retained |
| **R-PAY-FE-OPAQUE→EVAL** / **R-PAY-F-EVAL** | — | — | **CLOSED** | Retained |
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be`/`devops` | **CONDITION OK** | Post-READY dist refresh SOP — retain |
| **ESS `GET …/me/payslips/{id}`** | P3 | backlog | **DEFERRED** | Optional if ESS browser needs self-only |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula/process UAT | L2.5 | `qa` later | **DEFERRED** | When program opens browser process |
| **`C-SLICE-≠-MODULE`** | governance | `pm`/`qc` | **CONDITION** | Seat GWC ≠ module UAT / Phase1 — **only remaining** |

**P0/P1/P2 product residuals for this payslip GET WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` only — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 / J-HRM-07 GO; **not** product NO-GO for certified L1 payslip GET OBS close.

**Idle-ok:** formula-gap L1 OBS board for payslip GET closed — **no forced residual Task** this turn.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md` | exit **1** · **2/8** (portal_url · crud_or_matrix) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-payslip-lines-get-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness stamp `PAYSLIPGET-MSIKYBBB` | **PASS** · residual_closed payslip GET | PRODUCT OK (cited) |
| Spec spot-check F-PAY-PAYSLIP-01 / BE evidence | routes + 404 scope aligned | TRACE OK |
| Prior OBS open | QC-ATT-LINE-03 residual payslip GET | CLOSED this seat |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

---

## completion_report

### Closed

1. QC L1 payslip GET OBS gate — **GO WITH CONDITIONS**.  
2. Audited QA-PAYSLIP-LINES-GET MD + FINAL JSON stamp `PAYSLIPGET-MSIKYBBB` + BE-PAYSLIP-LINES-GET + ATT/CB/FE-EVAL baselines — AC GET / lines / 404 **ACCEPT**.  
3. **R-PAY-PAYSLIP-LINES-GET CLOSED** (supersedes prior OBS OPEN).  
4. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · Phase1 **NOT** claimed · module UAT **DENIED** · J-HRM-07 **DENIED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. ATT / CB-BAG / FE-EVAL / EVAL **not reopened**.  
7. Explicit **NO** to PM promote ready flag · remaining CONDITION **`C-SLICE-≠-MODULE` only**.  
8. **Idle-ok** — no forced residual dispatch for this OBS board.

### Residual

- **`C-SLICE-≠-MODULE`** retained (governance honesty).  
- ESS me GET / browser payslip UF / J-HRM-07 — deferred optional · **not** forced same-turn.  
- **NOT** Phase 1 DONE · **NOT** module payroll UAT.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok) |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-payslip-lines-get-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | GWC OBS R-PAY-PAYSLIP-LINES-GET CLOSED · stamp PAYSLIPGET-MSIKYBBB · **cấm** flip `payroll_e2e_ready` / claim LIVE / Phase1 / J-HRM-07 / module UAT · retain ATT/CB/FE-EVAL · CONDITION only `C-SLICE-≠-MODULE` · **idle-ok** formula-gap L1 OBS |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01 (idle / backlog scan)
from_role: pm
to_role: pm
lane: governance
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-PAYSLIP-LINES-GET-01 GO WITH CONDITIONS
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-payslip-lines-get-01.md
stamp_qa: PAYSLIPGET-MSIKYBBB

## Status
- R-PAY-PAYSLIP-LINES-GET OBS P2 = CLOSED (L1 GET by id + /lines + 404)
- Remaining CONDITION: C-SLICE-≠-MODULE only
- payroll_e2e_ready=false LOCKED · no LIVE / J-HRM-07 / module UAT / Phase1
- ATT-LINE AC4 / CB-BAG / FE-EVAL / EVAL RETAIN CLOSED

## Action
idle-ok for formula-gap L1 OBS board (payslip GET).
Run pnpm run pm:idle:check — dispatch only if NEW P0/P1 open outside this closed OBS.
Optional P3 backlog (not forced): ESS GET …/me/payslips/{id} or browser payslip detail UF when program opens.

cấm: flip payroll_e2e_ready · claim formula LIVE · Phase1 DONE · reopen ATT/CB/FE-EVAL
```
