# PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01 — Option/F.1 · Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-8 UC-BP-REC-06 **SEALED** — stamp `REC06QC1-MSL4CU2G` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-REC-07` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#11** after REC-06 |
| **ref_sa_spine** | Peer [`…-REC-06/05/06A/04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md) · hire HTP peer [`PO-HRM-E2E-LINK-EMP-SA-01.md`](./PO-HRM-E2E-LINK-EMP-SA-01.md) F-CORE-HTP-05 · UV-YCTD [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) — **reuse · DENY reopen seals** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** RETAIN · 16 program honesty flags **false** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-07** · Diễn biến #1–#5 · AC-HTP-05-01..03 · peers **CORE-03/07/09/10** OUT-or-handoff · BR cite **BR-BP-LC-01** (matrix/API) · SRS header also **BR-BP-ONB-01** (BA reconcile — **no invent**) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_REC_004** · PPT 13 |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-07 · BR-BP-LC-01 · status **PARTIAL / PENDING** → this Option unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.4 `rec_candidate.employee_id` · §2.5 application · §2.4a `is_hired_outcome` · CORE employee/contracts |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-HIRE-01** · peers F-REC-APP-02 · F-REC-CAT-EFF-01 · F-CORE-HTP-05 — **no wipe**; EXPAND physical residual |
| **OUT** | **UC-BP-REC-03** Campaign · Nest `/rec` dual · second hire SoT · invent payslip/PAY · reopen sealed J-HRM-REC-06-01..04 · claim REC-06 mail template `offer` = hire DONE · seed · honesty flip · module REC UAT |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-9 architecture unlock: **Accept offer → create employee profile without re-key** vs AS-IS hire/onboard spine |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after REC-06 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-07 · BR-BP-LC-01 · F-REC-HIRE-01 · F-REC-APP-02 · F-REC-CAT-EFF-01 · F-CORE-HTP-05 · G-DB-01 hire soft link · U19 scope_parity · GW-HRM-02 / I-2 (REC ↛ PAY) |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **Hire = link-only (partial):** `hire-employee-link.ts` + pool/Lane paths require **existing** `employee_id` when stage ∈ hired-outcome (`HRM-REC-HIRE-400` if missing · `HRM-REC-HIRE-409` cross-company). Soft stamp on `public.candidates.employee_id` (Lane B) + soft `recruitment_candidates.employee_id` (Lane A, no hard FK G-DB-02). FE `HireEmployeeLinkDialog` picks an **already-created** employee — **does not** create hồ sơ from UV/YCTD fields. **No** Nest `POST …/accept-offer` that inserts CORE employee + prefill. Stage to hired uses catalog EFF / `isHiredOutcome` (RETAIN). **HTP-05 LIVE:** `GET /api/hrm/employees/:id/hire-readiness` (profile + active contract same `company_id` · blocker `HRM-HTP-NO-ACTIVE-CONTRACT`) — peer EMP, not invent. **Peers SEALED:** REC-06 mail+YCTD eval (template `offer` ≠ hire); REC-05 transitions + stage-history (APP-02 sole stage writer); REC-06a IV; REC-04 scan. Paper `POST /api/hrm/rec/applications/{id}/accept-offer` = naming — **no** second Nest `/rec` SoT allowed. |
| **Paper target** | FR-UC-BP-REC-07: (1) xác nhận accept offer trên đúng YCTD; (2) tạo hồ sơ NS cùng pháp nhân, **điền sẵn** field từ UV/YCTD — **không** bắt nhập lại; (3) HCNS bổ sung thiếu; (4) tạo/gắn HĐ hiệu lực cùng pháp nhân; (5) BH theo chính sách (nếu CFG); (6) checklist CORE-03. Cấm trùng hồ sơ cùng offer; REC **không** gọi lương; đích stage = `is_hired_outcome` ∈ EFF; AC-HTP-05-01..03. |
| **Gap class** | **impl_gap residual on LIVE spine** — **not** greenfield dual: (1) **create+prefill ABSENT** (only link picker); (2) accept-offer atomic API ABSENT on `/recruitment/*`; (3) risk invent Nest `/rec` dual / second hire table; (4) conflate REC-06 mail `offer` / Kanban drag hired / pool link picker = FR-07 DONE; (5) invent PAY/payslip from REC; (6) reopen sealed J-06 / APP-02 rewrite. |
| **Constraints** | U89 continuous · **preserve** REC-00..06 seals · UV-YCTD ONE soft FK · C-SLICE · DENY REC-03 · DENY seed · DENY honesty flip · DENY Nest `/rec` dual · DENY second hire SoT · DENY claim module REC UAT · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #11 stalls; BA cannot AC «không nhập lại»; Dev invents `/rec/accept-offer` dual or empty form re-key; honesty flip; regression mail≠stage / transitions / hire-link 400/409 |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-05a / UV-YCTD (RETAIN)              UC-BP-REC-05 (SEALED — must_keep)
  recruitment_candidates + applications N–N       transitions + stage-history
       soft FK requisition_id ONLY                      │
                │                                       │  hired-outcome ONLY via APP-02
                │                                       │  after accept-offer success
                ▼                                       ▼
  ┌─────────────────────────── FR-UC-BP-REC-07 ───────────────────────────┐
  │                                                                        │
  │  F-REC-HIRE-01 residual (physical prefer)                              │
  │    POST /api/hrm/recruitment/…/accept-offer  (BA O1 path)              │
  │    1) Validate UV↔YCTD application + offer-accepted gate (BA O2)       │
  │    2) CREATE employee from UV+YCTD prefill OR LINK if reverse exists   │
  │       same company_id as YCTD/offer · status «chờ hoàn thiện»          │
  │    3) Soft stamp recruitment_candidates.employee_id (+ pool mirror)    │
  │       RETAIN hire-employee-link assert · G-DB-02 no hard FK            │
  │    4) Transition stage → is_hired_outcome via F-REC-APP-02 ONLY        │
  │    5) Emit offer.accepted (event) · DENY payslip / PAY call            │
  │    paper alias ONLY: POST /api/hrm/rec/applications/{id}/accept-offer  │
  │                                                                        │
  │  Idempotent: same application already hired → return existing link     │
  │  Duplicate offer → 409 family (BA mint)                                │
  └────────────────────────────────────────────────────────────────────────┘
                │
                │  employee_id
                ▼
  CORE employees (RETAIN create/get)          F-CORE-HTP-05 hire-readiness (RETAIN LIVE)
  contracts / insurance / checklist           GET …/employees/:id/hire-readiness
  = peer CORE-09/10/03 handoff — not invent PAY · not reopen EMP seals blindly
                │
  UC-BP-REC-06 mail template `offer` (SEALED) ≠ F-REC-HIRE-01 accept
  REC-03 Campaign / pool PATCH hired alone as FR-07 SoT = OUT
```

**Label lock:** «Chấp nhận offer → hồ sơ NS» = **create/link + prefill from UV↔YCTD** — not mail template `offer`; not picker-only forever; not empty CORE form re-key.  
**Spine lock:** Nest physical `/recruitment/*` — **DENY** greenfield Nest `/rec/*` SoT.  
**Hire lock:** ONE soft `employee_id` on candidate person (paper `rec_candidate` = Lane A/B alias map) — **DENY** second hire SoT / invent payslip.  
**Stage lock:** hired-outcome write **only** via sealed APP-02 — **DENY** silent stage on accept without history.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true`.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Accept-offer API | F-REC-HIRE-01 · FR-07 #1 | **ABSENT** Nest route | **UNLOCK residual** ADD physical POST |
| Create employee from UV | FR-07 #2 · no re-key | **ABSENT** — link picker only | **UNLOCK residual** CREATE+prefill |
| Soft `employee_id` on candidate | §2.4 · G-DB-01 | LIVE soft cols + assert | **RETAIN must_keep** — stamp after create |
| Hired stage ∈ EFF | `is_hired_outcome` · STAGE-UNKNOWN | LIVE catalog + APP-02 | **RETAIN** — accept calls APP-02 |
| Stage history append | F-REC-APP-02 · FR-05 | SEALED | **RETAIN** — **DENY reopen** |
| Idempotent / no duplicate | FR-07 special | Partial (link resolve reverse) | **UNLOCK** BA O5 |
| Prefill field map UV→EMP | BR-BP-LC-01 · matrix PARTIAL | No create map | **UNLOCK** ba-data **REQUIRED** |
| Contract same company | FR-07 #3 · AC-HTP-05 | Contracts LIVE; HTP-05 LIVE | **RETAIN HTP-05** · contract mutate = **CORE peer handoff** (BA O8) |
| Insurance before payroll | FR-07 #5 | CORE-10 peer | **OUT invent** · handoff |
| Checklist CORE-03 | FR-07 #6 | Peer | **OUT invent** · handoff |
| REC ↛ PAY | GW-HRM-02 · `HRM-REC-PAY-403` | Policy | **RETAIN DENY** |
| Mail template `offer` | F-REC-MAIL-01 | SEALED REC-06 | **RETAIN ≠ hire** |
| Paper `/rec/…/accept-offer` | F-REC-HIRE-01 | Prefer `/recruitment/*` | **Alias only — DENY dual Nest** |
| Scope parity U19 | special | `resolveHrmListScope` | **RETAIN** |
| Module REC UAT / honesty | program | W1–W8 C-SLICE | **DENY flip** |
| Pool hired without YCTD | — | Prior deny patterns | **DENY pool-alone as FR-07 SoT** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE: ADD accept-offer create+prefill on LIVE hire spine (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** Nest `/api/hrm/recruitment/*` + soft hire-link + APP-02 + EFF hired-outcome + HTP-05. **ADD** physical `accept-offer` that: creates (or links) CORE `employees` from UV+YCTD display/prefill map · soft-stamps Lane A (+ pool mirror) · transitions to hired-outcome **only** via F-REC-APP-02 · emits `offer.accepted` · **DENY** PAY. Paper `/rec/applications/{id}/accept-offer` = **alias only**. RETAIN `HRM-REC-HIRE-400/409` semantics for link-only paths; create path satisfies link assert. Contract/SI/checklist = **peer CORE handoff** AC (not invent payslip). **REC-03 / reopen J-06 / claim REC-06=hire OUT.** |
| **Benefits** | Closes «không nhập lại»; reuses soft FK + stage catalog + HTP-05; no Nest `/rec` dual; preserves W1–W8 must_keep |
| **Costs** | ba-data **REQUIRED** for UV→EMP field map (+ optional offer-accept audit cols); BA locks gates, idempotency, CORE handoff AC |
| **Risks** | Dev invents `/rec/accept-offer` dual or empty re-key form — **mitigate:** DENY + O1/O3. Claims mail `offer` = hire — **mitigate:** O9. Flip honesty — **mitigate:** HOLD. |

### Option B — Greenfield Nest `/rec/*` accept-offer + second hire SoT

| | |
|--|--|
| **Description** | Implement paper path as primary Nest `/api/hrm/rec/...`; new hire/outbox tables beside LIVE soft `employee_id`; dual-write or abandon hire-employee-link / APP-02. |
| **Benefits** | Paper path name fidelity |
| **Costs** | Dual SoT; FE rewrite; break sealed transitions/mail/eval/IV consumers; high blast |
| **Risks** | Regression W1–W8 · C-SLICE · U89 delay — **REJECT** |

### Option C — HOLD / picker-only forever / claim REC-06 mail offer = FR-07 DONE / flip honesty

| | |
|--|--|
| **Description** | Treat HireEmployeeLinkDialog + stage=hired or REC-06 template `offer` GWC as FR-UC-BP-REC-07 complete; or HOLD board; or flip `recruitment_uat_ready`. |
| **Benefits** | Short-term idle |
| **Costs** | Re-key / no create-from-UV; BR-BP-LC-01 unmet; board #11 false DONE or stuck; violates U89 + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-07 + no re-key) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **8** | 2 | 7 |
| Security / scope_parity U19 + CT isolation | 15 | **9** | 4 | 5 |
| Reliability (one hire soft link + APP-02) | 15 | **9** | 3 | 3 |
| Maintainability (preserve 04/05/06/06a + HTP-05) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **8.85** | **3.55** | **3.15** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/rec/applications` accept-offer as SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Second hire table / invent payslip columns on REC | Schema review | **DENY** second hire SoT · GW-HRM-02 |
| A | Empty employee form re-key ignores UV | BA/QA AC | Prefill map mandatory · AC no re-key |
| A | Accept writes stage without APP-02 history | Network + stage-history | Accept → APP-02 only |
| A | Accept without EFF hired-outcome | Catalog assert | `HRM-REC-STAGE-UNKNOWN` RETAIN |
| A | Duplicate employee on re-accept | Idempotency test | O5 return existing / 409 |
| A | Cross-company employee | Scope test | `HRM-REC-HIRE-409` / SCOPE-409 RETAIN |
| A | Claims REC-06 mail `offer` = hire DONE | Review | **DENY** · O9 |
| A | Pool PATCH hired alone = FR-07 DONE | Review | **DENY** pool-alone SoT |
| A | Reopen sealed J-HRM-REC-06-01..04 | Bus | **DENY reopen** without regression |
| A | Flip `recruitment_uat_ready` / module UAT | QC honesty | **DENY** · C-SLICE |
| A | Seed hire for U65 | QA evidence | **DENY** seed |
| A | Invent contract/insurance as REC SoT rewrite | Scope | Peer CORE handoff · HTP-05 RETAIN |
| B | Dual SoT + FK break | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE**: ADD physical accept-offer **create+prefill+soft-link+APP-02**; paper `/rec/*` = **alias only** |
| **Why selected** | AS-IS already has soft hire-link + hired-outcome catalog + HTP-05; residual is **create-from-UV without re-key** on `/recruitment/*` — not greenfield Nest dual; preserves W1–W8 must_keep; unlocks U89 #11 BA |
| **Assumptions** | UV-YCTD soft FK ONE physical `requisition_id` **RETAIN**. REC-05 APP-02 = sole stage writer. REC-06 mail/eval **RETAIN ≠ hire**. REC-06a IV **RETAIN**. HTP-05 **RETAIN**. CORE contract/SI/checklist = peer handoff. REC-03 OUT. `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/rec` dual / second hire SoT · **C** — HOLD / picker-only / mail=`hire` / honesty flip |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | `/api/hrm/recruitment/*` only; `/rec/*` alias | Cite Network path (accept-offer) |
| **O2** | Offer-accepted gate | Accept only when application on YCTD is in offer-ready state (CFG/catalog — e.g. stage `offer` or explicit flag) · cancel-after-accept → no new emp + reason | AC special cases |
| **O3** | Create vs link | Prefer **CREATE** from UV+YCTD prefill when no reverse `employees.candidate_id`; **LINK** if reverse/existing soft id valid same company; **DENY** empty re-key form as primary | AC + FE |
| **O4** | Prefill map | ba-data **REQUIRED**: UV person (name/email/phone/…) + YCTD company/dept/position_key + expected_start_date → employees «chờ hoàn thiện»; missing required CORE fields → create pending/blocked Active (FR-07 special) | Field matrix |
| **O5** | Idempotency | Re-accept same application → return existing `{application_id, employee_id}` (2xx idempotent **or** 409 `HRM-REC-HIRE-DUP` — BA pick one; SA prefer **idempotent 2xx**) | Mint code |
| **O6** | Stage write | After create/link success → transition to `hiredOutcomeKey` / `is_hired_outcome` **only** via F-REC-APP-02 (+ history); invent stage → `HRM-REC-STAGE-UNKNOWN` | AC Network: accept + transition + history_id |
| **O7** | Soft stamp | Write `recruitment_candidates.employee_id` (+ mirror Lane B `candidates.employee_id` when dual-lane linked) · reverse `employees.candidate_id` · **no** hard FK · RETAIN HIRE-400/409 for non-create paths | ba-data + AC |
| **O8** | CORE handoff | Contract create/attach · BH · checklist = **peer** CORE UC AC (link/open existing APIs) — **not** invent PAY · HTP-05 RETAIN for AC-HTP-05-01..03 | Separate AC rows · DENY claim payroll |
| **O9** | Peers must_keep | RETAIN REC-06 mail/eval · REC-05 transitions/history · REC-06a IV · REC-04 scan · CAT STG/EFF · UV-YCTD · W1–W3 · hire-employee-link · HTP-05; **OUT** REC-03 · REC-06b matrix · claim REC-06=hire | Scope note |
| **O10** | Honesty | All flags false · C-SLICE | Footer every evidence |
| **O11** | Events / PAY | Emit `offer.accepted` (paper); client payroll payload → `HRM-REC-PAY-403` | AC DENY |
| **O12** | Display-ready | Accept response + employee GET expose prefilled fields + `employee_id` + stage hired-outcome — **no** FE aggregate invent | FE bind after API |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | F-REC-APP-02 transitions + stage-history · `rec_pipeline_stage` + EFF `hiredOutcomeKey` / `is_hired_outcome` · UV-YCTD ONE `requisition_id` · Lane A recruitment_candidates · soft `employee_id` + `hire-employee-link` HIRE-400/409 · REC-06 mail outbox+YCTD eval (≠ hire) · REC-06a interviews · REC-04 internal_scan/posted · F-CORE-HTP-05 hire-readiness · `resolveHrmListScope` · soft-delete doctrine · honesty false · G-DB-02 no hard FK |
| **DENY invent** | Nest `/rec` dual SoT · second hire SoT · greenfield ignore LIVE soft link · `job_postings` / Campaign as hire SoT · pool PATCH hired alone as FR-07 DONE · Kanban drag hired alone as FR-07 DONE · REC-06 mail template `offer` as F-REC-HIRE-01 DONE · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module REC UAT / Phase1 DONE · reopen sealed J-HRM-REC-06-01..04 / REC-05/06a/04 J-* without regression · invent payslip / PAY call from REC · hard FK candidate↔employee |
| **OUT** | UC-BP-REC-03 · Campaign / tin đăng GĐ1 · invent CORE contract/SI/checklist as REC-only rewrite · REC-06b compare UI |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` · recruitment module UAT · personnel module UAT |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1 REC-01/01b | HCELL / spawn UQ | RETAIN |
| W2 REC-02/02b | TARGET-MONTH · BOD · open_for_hire · flags | RETAIN |
| W3 REC-08 | dashboard physical | RETAIN |
| W4 REC-06a | IV one-active · soft-gate | RETAIN |
| W5 REC-00 | JD `job-templates` | RETAIN |
| W6 REC-04 | J-HRM-REC-CV-04-* | RETAIN |
| W7 REC-05 | J-HRM-REC-STG-05-* · APP-02 | RETAIN — **DENY reopen without regression** |
| W8 REC-06 | stamp **`REC06QC1-MSL4CU2G`** · J-HRM-REC-06-01..04 | RETAIN — **DENY reopen without regression** · mail≠hire |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| Accept offer → create/link emp | **F-REC-HIRE-01** | **ADD residual** | `POST /api/hrm/recruitment/applications/:id/accept-offer` *(or `/candidates/:id/accept-offer` if BA locks Lane A id — **one** primary)* | `POST /api/hrm/rec/applications/{id}/accept-offer` | FR-07 Diễn biến **#1–#2** |
| Stage → hired-outcome | **F-REC-APP-02** | **RETAIN** | `POST …/candidates/:id/transitions` | paper transitions alias | FR-07 #2 + FR-05 |
| EFF hired key | **F-REC-CAT-EFF-01** | **RETAIN** | `GET …/pipeline-stages/effective` | — | FR-07 special / STAGE-UNKNOWN |
| Hire readiness | **F-CORE-HTP-05** | **RETAIN** | `GET /api/hrm/employees/:id/hire-readiness` | — | FR-07 #3–#5 · AC-HTP-05 |
| Soft hire assert (link paths) | G-DB-01 / hire-employee-link | **RETAIN** | used by pool/Lane hired paths | — | HIRE-400/409 |
| Mail template offer | **F-REC-MAIL-01** | **RETAIN ≠ this seat** | `/recruitment/…/mail` | `/rec/…/mail` | FR-06 — **OUT as hire** |

**Mint family (BA/API):** `HRM-REC-HIRE-*` expand beyond 400/409 — e.g. DUP / OFFER-INVALID / PREFILL-FAIL (names BA); RETAIN `HRM-REC-STAGE-UNKNOWN` · `HRM-REC-PAY-403` · `HRM-SCOPE-409` · `HRM-HTP-NO-ACTIVE-CONTRACT`.

**U19:** list application / get application / accept-offer / get employee / hire-readiness = **same** `resolveHrmListScope`.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 REQUIRED (UV→EMP field map · soft stamp · optional accept audit cols)
  → sa API-01 F.1 physical LOCK
  → Dev BE-01 + FE-01
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA) + API contracts CONFIRMED per program gate.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | Accept-offer 2xx creates emp + soft stamp; re-accept idempotent; STAGE-UNKNOWN; HIRE-409 cross-CT; PAY payload 403; scope 409 |
| L2.5 J-* | FE: accept → hồ sơ prefilled (no re-key of UV fields) → F5 still linked · stage history shows hired-outcome · HTP-05 blockers when no contract |
| L3 QC | GWC C-SLICE only · honesty false · DENY module REC UAT |

**Proposed journeys (DRAFT for BA):** `J-HRM-REC-07-01` accept+create · `J-HRM-REC-07-02` idempotent re-accept · `J-HRM-REC-07-03` HTP no-contract blocker · `J-HRM-REC-07-04` scope deny.

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-REC-07: ADD physical accept-offer create+prefill+soft-link+APP-02; RETAIN hire-link/HTP-05/REC-06/05/06a/04; REJECT B Nest `/rec` dual + C HOLD/mail=hire; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md` |
