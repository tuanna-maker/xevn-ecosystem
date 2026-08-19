# PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01 — Option/F.1 · Thư tuyển theo mẫu + đánh giá PV trong pipeline

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-7 UC-BP-REC-05 **SEALED** — stamp `REC05QC1-MSL35D49` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-REC-06` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#10** WAVE-8 after REC-05 |
| **ref_sa_spine** | Peer [`…-REC-05/06A/04/00/01/02/08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md) · UV-YCTD [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) — **reuse · DENY reopen seals** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** RETAIN · 16 program honesty flags **false** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06** · **BR-BP-REC-MAIL-01** / **BR-BP-MAIL-01** · Diễn biến #1–#2 · Thành công · peers **06a** / **06b** / **05** / **07** OUT-or-RETAIN as below |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_REC_004** · WBS-REC-04 |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-06 · BR-BP-MAIL-01 · status **MISSING** → this Option unlocks BA (not DONE claim) |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.7 `rec_interview_eval_template` + `rec_interview_evaluation` · §2.9 `rec_mail_outbox` + `rec_mail_log` |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-APP-03** · **F-REC-MAIL-01** · peers F-REC-APP-02 · F-REC-IV-* · F-REC-HIRE-01 — **no wipe**; EXPAND physical residual |
| **OUT** | **UC-BP-REC-03** Campaign / tin đăng SoT · Nest `/rec` dual · second mail/eval SoT · pool-as-FR-05 · seed · honesty flip · reopen REC-05/06a/04 · **UC-BP-REC-07** hire/accept-offer as FR-06 DONE · **UC-BP-REC-06b** compare matrix as this seat implement |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-8 architecture unlock: **Gửi thư tuyển theo mẫu + đánh giá PV** trong pipeline UV↔YCTD vs AS-IS |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after REC-05 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-06 · BR-BP-MAIL-01 / BR-BP-REC-MAIL-01 · F-REC-APP-03 · F-REC-MAIL-01 · peers 06a IV · 05 stage-history · 04 scan · UV-YCTD · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **Eval (partial LIVE — wrong spine home):** Nest **`GET/POST/DELETE /api/hrm/recruitment/candidate-evaluations*`** + **`evaluation-criteria-templates*`** on tables `public.candidate_evaluations` + `public.evaluation_criteria_templates` (ensureSchema in `recruitment-catalog.service.ts`). List JOIN **`public.candidates`** (Lane B person/pool) by `candidate_id` — **not** Lane A `recruitment_candidates` / UV↔YCTD application. `result` defaults **`pending`** (paper requires pass\|fail on chốt). Hard **DELETE** (platform soft-delete preference). Prior FE storm/`RATE-429` history on evaluations — **≠** FR-06 business PASS. **Mail (ABSENT):** grep Nest `rec_mail_outbox` / `mail_outbox` / F-REC-MAIL path → **0** — no outbox, no send log, no template enqueue. **Peers SEALED:** REC-06a `recruitment_interviews` one-active + soft-gate; REC-05 Lane A transitions + `stage-history`; REC-04 scan/posted; UV-YCTD ONE soft FK. Paper `/api/hrm/rec/applications/{id}/mail` + `/interview-evals` = naming alias — **no** second Nest `/rec` SoT allowed. |
| **Paper target** | FR-UC-BP-REC-06: (1) chọn UV trên YCTD → gửi thư theo mẫu tenant (fail_cv / interview_invite / offer …) → ghi đã gửi + thời điểm; fail → giữ nháp, **không** đổi stage giả; interview_invite **bắt buộc CC** interviewer. (2) Người PV nhập đánh giá Pass/Fail (+ nhận xét / đề xuất lương) **gắn liên kết UV–YCTD**; mỗi vòng PV một bản đánh giá sau khi lịch ACTIVE kết thúc (06a). (3) Cập nhật pipeline theo kết quả (via stage catalog / APP-02 — không Campaign). Điểm = đầu vào FR-06b (peer). |
| **Gap class** | **impl_gap residual on LIVE spine** — **not** greenfield dual: (1) **mail outbox+log ABSENT**; (2) eval LIVE but **person-pool home ≠ YCTD-link SoT**; (3) Pass/Fail not enforced; (4) pipeline update after eval not wired to REC-05 transitions; (5) risk invent Nest `/rec` dual / second eval+mail tables beside LIVE without YCTD FK; (6) conflate pool eval / stage drag `offer` / 06a schedule = FR-06 DONE; (7) reopen REC-03 via job_posting apps. |
| **Constraints** | U89 continuous · **preserve** REC-00/01/02/08/06a/**04/**05 seals · UV-YCTD ONE soft FK · C-SLICE · DENY REC-03 · DENY seed · DENY honesty flip · DENY Nest `/rec` dual · DENY pool-as-FR-05 · DENY claim module REC UAT · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #10 stalls; BA cannot AC FR-06; Dev invents `/rec/mail` dual + second eval table off pool; honesty flip; regression IV one-active / stage-history / scan gate; 06b compare has no YCTD-bound scores |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-05a / UV-YCTD (RETAIN)                 UC-BP-REC-05 (SEALED — must_keep)
  recruitment_candidates + applications N–N          transitions + stage-history
       soft FK requisition_id ONLY                         │
                │                                          │  after Pass/Fail →
                │                                          │  pipeline update ONLY via APP-02
                ▼                                          ▼
  ┌─────────────────────────────── FR-UC-BP-REC-06 ───────────────────────────────┐
  │                                                                                │
  │  A) F-REC-MAIL-01 residual                                                     │
  │     Physical prefer: POST /api/hrm/recruitment/…/mail (BA O1 path)             │
  │     ADD outbox + append log (paper rec_mail_outbox / rec_mail_log)             │
  │     template_code ∈ tenant CFG (fail_cv | interview_invite | offer | …)        │
  │     interview_invite ⇒ cc_interviewers required → else VAL 400                 │
  │     send fail ⇒ draft/queued retain · DENY fake stage change                   │
  │     paper alias ONLY: POST /api/hrm/rec/applications/{id}/mail                 │
  │                                                                                │
  │  B) F-REC-APP-03 residual                                                      │
  │     UPGRADE LIVE candidate_evaluations + evaluation_criteria_templates         │
  │       → YCTD-bound home (application_id AND/OR recruitment_candidate_id)       │
  │     Pass|Fail required on submit (chốt); scores_json; salary_recommendation    │
  │     Optional FK interview_id → recruitment_interviews (06a TERMINAL round)     │
  │     Physical prefer: POST /api/hrm/recruitment/…/interview-evals | evaluations │
  │     paper alias ONLY: POST /api/hrm/rec/applications/{id}/interview-evals      │
  │     Soft-delete prefer · DENY hard-delete as MVP SoT without BA waiver         │
  └────────────────────────────────────────────────────────────────────────────────┘
                │
                │  one eval per PV round after 06a ACTIVE ended (BR-BP-REC-IV-05)
                ▼
  UC-BP-REC-06a interviews (SEALED — must_keep)     UC-BP-REC-06b compare (PEER OUT seat)
  one-active + soft-gate DISALLOW                     consumes YCTD-bound scores — not implement here
                │
  UC-BP-REC-07 accept-offer / hire (PEER OUT) — F-REC-HIRE-01 ≠ FR-06 mail template `offer`
  REC-03 Campaign / job_postings / pool PATCH stage as FR-05/06 SoT = OUT
```

**Label lock:** «Thư tuyển / đánh giá PV» = **trong pipeline UV↔YCTD** — not Campaign; not person-pool-only eval; not Kanban drag `offer` alone.  
**Spine lock:** Nest physical `/recruitment/*` — **DENY** greenfield Nest `/rec/*` SoT.  
**Mail lock:** ONE outbox + ONE append log — **DENY** dual mail SoT / silent send without log.  
**Eval lock:** ONE evaluation SoT neo **YCTD-link** — **DENY** pool `candidates` as FR-06 score SoT; paper `rec_interview_evaluation` = **logical alias** of upgraded LIVE.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true`.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Mail enqueue by template | §2.9 · F-REC-MAIL-01 · FR-06 #1 | **ABSENT** Nest tables/routes | **UNLOCK residual** ADD outbox+log + physical POST |
| Mail send log / retry | `rec_mail_log` append | Absent | **UNLOCK residual** |
| interview_invite CC required | BR-BP-MAIL-01 · VAL | Absent | **UNLOCK residual** VAL |
| Send fail → no fake stage | FR-06 special | N/A | **UNLOCK** + RETAIN APP-02 as only stage writer |
| Eval template CFG | §2.7 template · criteria_json | `evaluation_criteria_templates` (category/weight rows) | **UPGRADE residual** — map ↔ paper template (BA O4) |
| Eval instance Pass/Fail | §2.7 · F-REC-APP-03 · FR-06 #2 | `candidate_evaluations` on **pool** `candidates` · `pending` default · hard DELETE | **UNLOCK residual** — re-home YCTD + enforce pass\|fail |
| Eval neo UV↔YCTD | application_id / link | `candidate_id` → Lane B only | **UNLOCK residual** |
| Pipeline update after result | FR-06 #4 / Thành công | Not wired to REC-05 transitions | **UNLOCK** via **RETAIN** F-REC-APP-02 only |
| Multi-round eval | BR-BP-REC-IV-05 · one eval / round after 06a end | Weak / no gate | **BA O6** + RETAIN 06a TERMINAL |
| IV schedule one-active | FR-06a | LIVE SEALED | **RETAIN must_keep** |
| Stage history / EFF | FR-05 | LIVE SEALED | **RETAIN must_keep** — **DENY reopen** without regression |
| REC-04 scan / posted | F-REC-CV-SCAN-* | SEALED | **RETAIN must_keep** |
| Compare by YCTD | FR-06b | Peer | **OUT this seat** — scores must be YCTD-ready |
| Accept offer → employee | F-REC-HIRE-01 · REC-07 | Peer | **OUT this seat** — template_code `offer` ≠ hire |
| External Campaign | REC-03 | OUT GĐ1 | **OUT / DENY** as FR-06 SoT |
| Paper `/rec/…/mail` · `/interview-evals` | F-REC-MAIL-01 · APP-03 | Prefer physical `/recruitment/*` | **Alias only — DENY dual Nest** |
| Scope parity U19 | special | `resolveHrmListScope` on recruitment | **RETAIN** |
| Module REC UAT / honesty | program | W1–W7 C-SLICE only | **DENY flip** |
| Pool stage / FR-05 claim | — | Prior deny | **DENY pool-as-FR-05** · pool eval ≠ FR-06 SoT |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE on LIVE eval + ADD mail (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** physical Nest `/api/hrm/recruitment/*` spine: UV-YCTD Lane A, REC-05 transitions+history, REC-06a interviews, REC-04 flags, catalog STG/EFF. Treat paper `rec_interview_evaluation` / `rec_interview_eval_template` / `/rec/applications/*/interview-evals` as **logical aliases** of **UPGRADED** LIVE `candidate_evaluations` + `evaluation_criteria_templates` re-homed to **YCTD-bound** link (application_id and/or `recruitment_candidate_id` + company scope — BA O2). **ADD** physical mail outbox + append log (paper `rec_mail_outbox` / `rec_mail_log`) + enqueue API on `/recruitment/*` (BA O1); paper `/rec/…/mail` = alias only. **Enforce** Pass\|Fail on chốt; interview_invite CC; send-fail no fake stage; pipeline update **only** via sealed F-REC-APP-02. Soft-delete prefer on eval. **REC-03 / REC-07 / REC-06b implement remain OUT.** |
| **Benefits** | Reuses LIVE eval surface + seals; closes MISSING mail; YCTD scores unlock 06b later; no Nest `/rec` dual; preserves 04/05/06a |
| **Costs** | ba-data **REQUIRED** for mail tables + eval FK/home migrate; BA locks path names, Pass/Fail draft rules, auto vs manual stage after result |
| **Risks** | Dev invents `/rec/mail` dual or second eval SoT — **mitigate:** DENY + alias. Keeps pool JOIN as SoT — **mitigate:** O2. Claims Kanban `offer` / 06a schedule = FR-06 DONE — **mitigate:** O9. Flip honesty — **mitigate:** HOLD. |

### Option B — Greenfield `rec_interview_evaluation` + `rec_mail_*` + Nest `/rec/*` dual

| | |
|--|--|
| **Description** | Implement paper tables/routes as new SoT; dual-run off LIVE `candidate_evaluations`; new Nest `/rec/applications` mail/eval controllers as primary; abandon pool eval without migrate. |
| **Benefits** | Clean paper name fidelity |
| **Costs** | Dual SoT migration; rewrite FE eval hooks; break UV-YCTD / IV / stage seals consumers; high blast |
| **Risks** | Regression W1–W7 · C-SLICE · U89 delay — **REJECT** |

### Option C — HOLD / claim pool eval or stage `offer` = FR-06 DONE / flip honesty

| | |
|--|--|
| **Description** | Treat existing `candidate-evaluations` (pool) or Kanban drag to `offer` or 06a schedule GWC as FR-UC-BP-REC-06 complete; or HOLD board; or flip `recruitment_uat_ready`. |
| **Benefits** | Short-term idle |
| **Costs** | No mail AC; scores not YCTD-bound for 06b; BR-BP-MAIL-01 unenforced; board #10 false DONE or stuck; violates U89 + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-06 + BR-BP-MAIL-01) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **8** | 2 | 8 |
| Security / scope_parity U19 + CT isolation | 15 | **9** | 4 | 5 |
| Reliability (one mail + one eval YCTD SoT) | 15 | **9** | 3 | 3 |
| Maintainability (preserve 04/05/06a + UV-YCTD) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **8.85** | **3.55** | **3.25** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dev creates Nest `/rec/applications` mail/eval SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Second mail outbox beside ADD tables | Schema review | **DENY** dual mail SoT |
| A | Second eval table beside upgraded LIVE | Schema review | **DENY**; UPGRADE in place |
| A | Keeps JOIN `public.candidates` as FR-06 score SoT | Code review / 06b prep | **DENY**; O2 YCTD home |
| A | Send success without append log | Integration test | Require log row per attempt |
| A | interview_invite without CC | VAL test | **400** family `HRM-REC-MAIL-*` / VAL |
| A | Send fail but stage flipped to interview/offer | QA Network + stage-history | **DENY** fake stage; only APP-02 |
| A | Pass/Fail optional / free-text only | BA/QA | Enforce pass\|fail on chốt |
| A | Eval before 06a ACTIVE ended (parallel rounds) | Gate | BA O6 + RETAIN IV one-active |
| A | Pipeline update bypasses REC-05 history | QA F5 timeline | Must call APP-02 transition |
| A | Uses `job_posting_id` apps as FR-06 SoT | Code review | **DENY** · REC-03 OUT |
| A | Claims pool PATCH stage / FR-05 = FR-06 | Review | **DENY pool-as-FR-05** |
| A | Implements REC-07 hire in this seat | Scope | **OUT** F-REC-HIRE-01 |
| A | Flip `recruitment_uat_ready` / `jd_dynamic_done` | QC honesty | **DENY** · C-SLICE |
| A | Seed evals/mail for U65 | QA evidence | **DENY** seed |
| A | Reopen REC-05/06a/04 J-* as rewrite | Bus | **DENY reopen** without regression |
| B | Dual SoT + FK break | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE** on LIVE eval+templates; **ADD** mail outbox+log; paper `/rec/*` = **alias only** |
| **Why selected** | Eval surface already LIVE but wrong home; mail ABSENT; FR-06 residual is YCTD re-home + mail + Pass/Fail + APP-02 wire — not greenfield Nest dual; preserves W1–W7 must_keep; unlocks U89 #10 BA |
| **Assumptions** | UV-YCTD soft FK ONE physical `requisition_id` **RETAIN**. REC-05 transitions = sole stage writer after eval. REC-06a = sole interview schedule SoT. REC-03 OUT. REC-07 hire OUT. REC-06b consume-only later. `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/rec` dual / second SoT · **C** — HOLD / honesty flip / false DONE |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | `/api/hrm/recruitment/*` only; `/rec/*` alias | Cite in AC Network (mail + eval) |
| **O2** | Eval persist home | **UPGRADE** LIVE `candidate_evaluations` neo **YCTD-bound** (`application_id` and/or `recruitment_candidate_id` + `company_id`); optional `interview_id` → `recruitment_interviews`; **DENY** Lane B `candidates` as FR-06 score SoT; paper `rec_interview_evaluation` = alias | ba-data **REQUIRED**; lock FK columns + migrate rule for legacy pool rows (read-only / exclude from 06b) |
| **O3** | Mail persist | **ADD** one outbox + one append log (paper `rec_mail_outbox` / `rec_mail_log`); physical names BA/ba-data; status queued\|sending\|sent\|failed; **DENY** dual mail SoT | ba-data **REQUIRED**; AC send+log F5 |
| **O4** | Template SoT | **UPGRADE** `evaluation_criteria_templates` ↔ paper eval template (criteria/weight); mail `template_code` from tenant CFG catalog (fail_cv \| interview_invite \| offer \| …) — **no hardcode body**; XBOS sync later P2 | AC CRUD/picker; DENY invent second template SoT |
| **O5** | Pass/Fail | On **chốt** submit: `result` ∈ {pass, fail} **required**; draft/`pending` only if CFG allows explicit draft — default **no silent pending as DONE** | VAL + FE |
| **O6** | Round gate | New eval only when prior ACTIVE interview TERMINAL (completed\|cancelled\|no_show) per 06a — or explicit «vòng» link; **DENY** two ACTIVE schedules | AC + cite BR-BP-REC-IV-05 |
| **O7** | Pipeline after result | Pass/Fail **may** propose stage; **write stage only** via sealed F-REC-APP-02 (EFF assert + history append); send-fail **never** writes stage | AC Network: mail ≠ transition; eval chốt → optional transition 2xx + history_id |
| **O8** | Mail CC / fail | `interview_invite` ⇒ `cc_interviewers[]` required; fail ⇒ retain draft/queued + error; retry appends log | AC BR-BP-MAIL-01 |
| **O9** | Peers must_keep | RETAIN 05a UV-YCTD · REC-05 transitions/history · 06a IV · REC-04 scan/posted · CAT STG/EFF · CMP stub · W1–W3; FR-06 AC **not** redefine those SoTs; **OUT** REC-03 · REC-07 hire · REC-06b matrix implement · CSVC onboard task **P2/OUT** unless BA narrows | Scope note |
| **O10** | Honesty | All flags false · C-SLICE | Footer every evidence |
| **O11** | Soft-delete | Prefer soft-delete / archive on eval+outbox; hard DELETE LIVE path = residual fix (not expand as SoT) | AC + ba-data |
| **O12** | Display-ready | List/detail DTO expose mail status + last_sent_at + eval result/scores for FE — **no** FE aggregate invent | FE bind after API |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | REC-05 F-REC-APP-02 transitions + stage-history · `rec_pipeline_stage` + EFF · UV-YCTD ONE `requisition_id` · Lane A `/candidates*` · REC-06a `recruitment_interviews` one-active + soft-gate DISALLOW · REC-04 `internal_scan_*` + posted · W2 `open_for_hire` + flags · W5 JD soft FK · W1 cell/spawn · W3 dashboard · `resolveHrmListScope` · soft-delete doctrine · honesty false · LIVE eval route family as **upgrade base** (not delete wholesale) |
| **DENY invent** | Nest `/rec` dual SoT · second mail SoT · second eval SoT · greenfield ignore LIVE tables · `job_postings` / Campaign as UV/mail/eval SoT · pool `candidates` eval as FR-06 DONE · pool-as-FR-05 · Kanban drag `offer` alone as FR-06 DONE · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module REC UAT / Phase1 DONE · reopen sealed REC-05 J-HRM-REC-STG-05-* / REC-06a / REC-04 J-* / W1–W5 without regression · implement F-REC-HIRE-01 in this seat |
| **OUT** | UC-BP-REC-03 · Campaign / tin đăng GĐ1 · UC-BP-REC-07 hire as FR-06 · UC-BP-REC-06b compare UI (peer) |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` · recruitment module UAT |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1 REC-01/01b | HCELL / spawn UQ | RETAIN |
| W2 REC-02/02b | TARGET-MONTH · BOD · open_for_hire · flags · JD soft FK | RETAIN |
| W3 REC-08 | dashboard physical | RETAIN |
| W4 REC-06a | IV one-active · soft-gate · `REC06AQC2-MSKZAM58` | RETAIN — **DENY reopen without regression** |
| W5 REC-00 | JD `job-templates` | RETAIN |
| W6 REC-04 | `REC04QC1-MSL1LU4H` · J-HRM-REC-CV-04-01..04 | RETAIN |
| W7 REC-05 | `REC05QC1-MSL35D49` · J-HRM-REC-STG-05-01..04 | RETAIN — **DENY reopen without regression** |
| UV-YCTD | API/DB CONFIRMED | RETAIN ONE soft FK · 05a |
| Stage catalog | REC-STAGE-CATALOG DOCS + CNS | RETAIN STG/EFF · UNKNOWN · DISALLOW |
| JD-DYNAMIC | HOLD `jd_dynamic_done=false` | RETAIN |

---

## 7. Implementation and Validation Plan

### 7.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack FR-UC-BP-REC-06 (O1–O12 · VAL · Diễn biến FE · J-* DRAFT) against this Option A; cite BR-BP-MAIL-01; **depends_on** this CONFIRMED; **cấm invent** beyond SRS; unlock residual mail+YCTD-eval only.
2. **ba-data** — **REQUIRED** for ADD mail tables + eval FK/home migrate (+ soft-delete columns if needed); **NOT** second Nest path / Campaign tables.
3. **SA API** — F.1 DOC-DELTA physical prefer `F-REC-MAIL-01` ADD + `F-REC-APP-03` UPGRADE; paper `/rec` alias; mint `HRM-REC-MAIL-*` / `HRM-REC-EVAL-*` as needed after BA.
4. **Dev-BE / Dev-FE** — after AC + DATA/API CONFIRMED — residual only (no greenfield Nest `/rec`).
5. **QA** — U65 browser: UV on YCTD → Gửi thư mẫu → Network 2xx + log F5 → eval Pass/Fail → optional stage via APP-02 + history → invent/missing CC blocked; **no seed**; **no** reopen REC-05/06a/04 as rewrite.
6. **QC** — GWC C-SLICE; honesty false; DENY module UAT.

### 7.2 Rollback

- Docs Option stamp only until Dev; if Dev regresses UV-YCTD / IV / stage-history / REC-04 flags → revert residual; seals W1–W7 untouched.

### 7.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| SA | This file CONFIRMED Option A |
| BA | AC pack cites O1–O12 · no Nest dual · no honesty invent · no REC-03 · no reopen 05/06a/04 · REC-07 OUT |
| DATA | One mail outbox+log · one upgraded eval home YCTD · no second SoT |
| API | Physical prefer mail+eval · alias paper · APP-02 sole stage writer |
| QA | UF FR-06 Diễn biến #1–#2 browser + F5 log/eval + Network 2xx + CC VAL + no fake stage on mail fail |
| QC | GWC · C-SLICE · `jd_dynamic_done=false` · `recruitment_uat_ready=false` |

### 7.4 Success criteria

- One mail SoT; one YCTD-bound eval SoT; paper `/rec` not second Nest controller; BA unlocked; no honesty flip; REC-03 OUT; REC-05/06a/04 seals intact; REC-07 not smuggled.

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC (+ ba-data). This seat **locks** SoT + path + which F-ids RETAIN vs residual unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-MAIL-01** | Enqueue thư theo mẫu + log | FR-06 #1 · BR-BP-MAIL-01 | `POST /api/hrm/recruitment/candidates/:id/mail` **and/or** `POST …/applications/:id/mail` on **YCTD-bound** link — BA O1 picks primary; GET outbox/log as needed | `POST /api/hrm/rec/applications/{id}/mail` | **UNLOCK residual** ADD |
| **F-REC-APP-03** | Đánh giá PV động Pass/Fail | FR-06 #2 | `POST/GET /api/hrm/recruitment/candidate-evaluations*` **UPGRADE** home **or** `…/applications/:id/interview-evals` — BA O2; templates `evaluation-criteria-templates*` UPGRADE | `POST /api/hrm/rec/applications/{id}/interview-evals` | **UNLOCK residual** UPGRADE |
| **F-REC-APP-02** | Đổi stage + history sau kết quả | FR-06 Thành công / #4 | `POST …/candidates/:id/transitions` (+ stage-history) | `/rec/…/transitions` | **RETAIN must_keep** — sole stage writer |
| **F-REC-IV-01..04 / SCHED-SOFT** | Lịch PV one-active | peer 06a | `/recruitment/interviews*` | `/rec/interviews*` | **RETAIN must_keep** |
| **F-REC-CAT-STG/EFF-*** | Catalog giai đoạn | peer 05 | `/pipeline-stages*` | `/rec/pipeline-stages*` | **RETAIN must_keep** |
| **F-REC-UV-YCTD-*** | Create/list UV+YCTD | peer 05a | `/candidates*` · `/requisitions*` | `/rec/candidates*` | **RETAIN must_keep** |
| **F-REC-CV-SCAN-*** | Internal scan / posted | peer REC-04 | pool + flags | `/rec/…` | **RETAIN must_keep** — **DENY reopen** |
| **F-REC-CMP-01/02** | Apps + compare | peer 06b | `GET applications` · `GET compare` | `/rec/compare` | **RETAIN stub** — **OUT** matrix depth this seat |
| **F-REC-HIRE-01** | Accept offer → employee | REC-07 | — | `/rec/…/accept-offer` | **OUT this seat** |

### 8.1 Scope parity (U19)

List/get/mutate mail outbox + eval by candidate/application/YCTD — **same** `resolveHrmListScope` + company persist rules as existing recruitment module. **DENY** cross-CT mail/eval leak.

### 8.2 Error family (RETAIN + residual mint)

| Code family | Use |
|-------------|-----|
| `HRM-REC-STAGE-UNKNOWN` / `HRM-REC-STAGE-*` | Stage invent / reject / reverse (**RETAIN** REC-05) |
| `HRM-REC-IV-409-ACTIVE` / `HRM-REC-IV-400-STAGE-DISALLOW` / PAST | IV gates (**RETAIN** 06a) |
| `HRM-REC-UV-YCTD-*` | Attach / receivable (**RETAIN**) |
| `HRM-REC-CV-SCAN-*` | Scan/posted (**RETAIN**) |
| `HRM-REC-EVAL-*` (LIVE partial) | Eval 200/201/404 — **EXPAND** residual for Pass/Fail VAL · wrong home · round gate |
| **`HRM-REC-MAIL-*`** (residual mint) | Missing CC · template inactive · enqueue fail · outbox not found | Mint in API seat after BA — **no invent** in BA without SA/API |
| `HRM-VAL-400` | Paper alias for missing interviewer email — may map to MAIL mint |

---

## 9. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED |
| **next_owner** | **ba-process** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-sa-01.md` |
| **Unlocks** | BA AC pack `PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01` against Option A |
| **Does not unlock** | Dev code · honesty flips · REC-03 · Nest `/rec` dual · reopen W1–W7 / REC-05/06a/04 J-* · REC-07 · `jd_dynamic_done=true` · `recruitment_uat_ready=true` |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition; LIVE vs gap vs FR-UC-BP-REC-06 / BR-BP-MAIL-01; paper alias lock; must_keep REC-05/06a/04/UV-YCTD; DENY Nest dual / Campaign / pool-as-FR-05 / second SoT / seed / honesty flip / REC-07 smuggle; O1–O12 for BA; unlock BA AC; **cấm code** until contracts.
- **Residual:** BA AC (eval home; mail tables; Pass/Fail; CC; round gate; stage-via-APP-02); ba-data mail+FK; SA API F.1; Dev after contracts.
