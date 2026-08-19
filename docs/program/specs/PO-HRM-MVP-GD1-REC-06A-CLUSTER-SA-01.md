# PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01 — Option/F.1 · Một lịch PV đang hiệu lực

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/API residual → Dev |
| **depends_on** | W1–W3 **SEALED GWC** (REC-01/01b · REC-02/02b+BOD · REC-08) · prior **REC-IV one-active** slice GWC `po-hrm-rec-iv-one-active-qc-slice-01.md` |
| **uc_ids** | `UC-BP-REC-06a` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#6** after REC-08 |
| **ref_sa_spine** | [`PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md`](./PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md) · peer [`…-REC-01/02/08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md) — **reuse · DENY reopen seals** |
| **ref_ba_draft** | [`PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md`](./PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06a** (+ cross-ref REC-05/05a · REC-06 · soft-gate giai đoạn) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-REC-04** |
| **ref_inventory** | `UC_INVENTORY.md` · **UC-BP-REC-06a** · **ADD** · REQ_REC_004 |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` · **F-REC-IV-SCHED-SOFT** (overlay) · paper `/rec/interviews*` = **alias only** |
| **OUT** | **UC-BP-REC-03** campaign/tin đăng · Nest `/rec` dual SoT · greenfield dual interview table |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-4 architecture unlock: xếp / hủy / đổi lịch PV — **tối đa một lịch đang hiệu lực** / ứng viên × pháp nhân (pipeline context) |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · RE-DISPATCH after interrupt (05:22 DISPATCHED no evidence) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-06a · BR-BP-REC-IV-01..06 · AC-REC-IV-01..07 · WBS-REC-04 · REQ_REC_004 · U19 scope_parity · soft-gate `allows_interview_schedule` · SOLID display-ready |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | Lane A spine **`recruitment_interviews`** enforces one-active (`scheduled`\|`confirmed`) via service gate + partial unique `uniq_recruitment_interviews_active_candidate`; `POST /api/hrm/recruitment/interviews` → 201 / **409 `HRM-REC-IV-409-ACTIVE`**; candidate list returns display-ready `active_interview` (badge «Đã có lịch» + `dd/MM/yyyy HH:mm`); soft-gate **`HRM-REC-IV-400-STAGE-DISALLOW`** RETAIN (≠ 409 ACTIVE). Slice browser GWC sealed 2026-08-06 (create + duplicate toast + badge F5). |
| **Paper target** | FR-UC-BP-REC-06a: xếp / hủy / hoàn tất / không đến / đổi lịch; ≤1 ACTIVE / ứng viên × pháp nhân; list badge; soft-delete cancel trail; stage flag layer; **không** campaign. |
| **Gap class** | **impl_gap residual P1/P2** on sealed spine — **not** greenfield: (1) R-A **đổi ngày giờ** thiếu PATCH `scheduled_at` (chỉ PATCH status); (2) `no_show` chưa trong DTO TERMINAL; (3) cancel/complete **browser UF** deferred from slice; (4) Lane B `public.interviews` create **không** one-active — dual surface risk; (5) prior OPEN-Q1..Q4 paper still stamped OPEN while LIVE already chose Q4/Q2 interim. |
| **Constraints** | U89 continuous · **preserve** IV one-active LIVE · **DENY reopen** W1–W3 seals · C-SLICE · DENY REC-03 · DENY seed · DENY flip `recruitment_uat_ready` · DENY Nest `/rec` dual path · DENY invent UV×YCTD concurrency |
| **Failure impact if unresolved** | Board #6 stalls; BA cannot AC residual cancel/reschedule; Lane B may bypass BR; sponsor sees «đã GWC slice» nhưng FR Diễn biến #5–#7 incomplete |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-05/05a (pipeline stage catalog — peer RETAIN)
       allows_interview_schedule ──► soft-gate DISALLOW (≠ one-active)
                │
  recruitment_candidates (spine UV)
                │
                ▼
  recruitment_interviews  ◄──── Sole mutate SoT for FR-UC-BP-REC-06a (OPEN-Q4 LOCK)
       ACTIVE = scheduled | confirmed
       TERMINAL = cancelled | completed | no_show (+ passed|failed legacy ≈ completed)
       partial UNIQUE (company_id, candidate_id) WHERE ACTIVE
                │
                │  resolveHrmListScope (U19 — list = get = mutate)
                ▼
  POST   /api/hrm/recruitment/interviews              (RETAIN LIVE)
  PATCH  /api/hrm/recruitment/interviews/:id/status   (RETAIN + residual browser)
  PATCH  /api/hrm/recruitment/interviews/:id          (UNLOCK ADD — R-A scheduled_at)
  GET    candidates* → active_interview projection    (RETAIN LIVE)
                │
                │  paper alias ONLY: /api/hrm/rec/interviews*
                ▼
  FE CandidatesTab / ScheduleInterviewDialog — bind display-ready · U65 FE→API
                │
                └── public.interviews (Lane B catalog) ≠ FR-06a SoT — DENY dual-write as one-active source
```

**Cardinality lock (board vs SRS):** Continuous board text «ứng viên × pipeline» = **context** (lịch nằm trong pipeline UV, không campaign). **Cardinality SoT** = **`(company_id, candidate_id)`** — khớp SRS BR-BP-REC-IV-01 / glossary «Lịch phỏng vấn đang hiệu lực». **DENY** concurrent ACTIVE theo từng YCTD (OPEN-Q1 LOCK = UV × pháp nhân).

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS) | AS-IS LIVE | Verdict |
|------------|-------------|------------|---------|
| One-active create gate | BR-IV-01 · AC-IV-02 | Lane A 409 + unique index | **RETAIN** |
| Badge list + vi-VN + F5 | BR-IV-04 · AC-IV-01 | `active_interview` projection + FE badge | **RETAIN** |
| Confirm stays ACTIVE | Diễn biến #4 | `confirmed` ∈ ACTIVE set | **RETAIN** |
| Cancel → create new | BR-IV-02 · AC-IV-03 | Status gate API; **browser UF deferred** | **UPGRADE residual** FE/QA |
| Complete → round 2 | AC-IV-04 | `completed`/`passed`/`failed` terminal in filter | **RETAIN** + browser residual |
| `no_show` terminal | BR-IV-02 · Diễn biến #6 | **Missing** from UpdateInterviewStatusDto | **UNLOCK ADD** status |
| Reschedule R-A datetime | BR-IV-03 · Diễn biến #5/7 | **No** PATCH `scheduled_at` on spine | **UNLOCK ADD** |
| Stage soft-gate | AC-IV-07 | `HRM-REC-IV-400-STAGE-DISALLOW` LIVE | **RETAIN** peer |
| Soft-delete / no hard delete | BR-IV-06 | Cancel = status update | **RETAIN** |
| Scope parity U19 | special case scope | `resolveHrmListScope` on schedule/update/list | **RETAIN** |
| Lane B catalog `interviews` | — | Create **without** one-active | **DENY as SoT** · ALIGN/redirect residual |
| Nest `/rec/interviews` | paper alias | Prefer physical `/recruitment/interviews*` | **Alias only** |
| REC-03 campaign schedule | OUT | — | **OUT** |
| Module REC UAT | honesty | slice GWC only | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE on LIVE spine (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** sealed IV one-active on physical SoT `recruitment_interviews` + display-ready candidate projection + soft-gate stage. **CLOSE** OPEN-Q1/Q2/Q4 from LIVE + bus interim. **UPGRADE residual** only: (1) R-A PATCH datetime on same ACTIVE row; (2) ADD `no_show` TERMINAL; (3) browser cancel/complete/reschedule UF + AC-IV-03..06; (4) FE must call Lane A only — Lane B catalog **not** FR-06a SoT (ALIGN: soft-deny create when ACTIVE exists **or** deprecate schedule path to spine). Paper `/rec/*` = alias. |
| **Benefits** | Zero dual SoT; honors prior GWC; fastest U89 seat #6; preserve_default; measurable residual vs full rewrite |
| **Costs** | BA must pack AC against residual Diễn biến #5–#7; small BE ADD for PATCH datetime + `no_show` |
| **Risks** | Lane B bypass if FE still posts catalog — **mitigate:** BA O* + Dev FE path lock + QA Network assert `/recruitment/interviews` |

### Option B — Greenfield rewrite / UV×YCTD cardinality / Nest `/rec` dual

| | |
|--|--|
| **Description** | New table or one-active per UV×YCTD; or stand up Nest `/rec/interviews` beside `/recruitment/interviews`; or force R-B atomic close+create as only SoT. |
| **Benefits** | Matches alternate product readings of «× pipeline» as YCTD key |
| **Costs** | Breaks sealed IV GWC + partial unique; ba-data migration; dual Nest path; reopen W1–W3 must_keep IV peers |
| **Risks** | Dual ACTIVE semantics; honesty drift; U89 delay — **REJECT** |

### Option C — HOLD / claim slice = module DONE / reopen W1–W3

| | |
|--|--|
| **Description** | Treat prior slice GWC as FR-06a complete; or HOLD Option until sponsor reopens; or reopen REC-01/02/08. |
| **Benefits** | Short-term idle |
| **Costs** | Residual Diễn biến #5–#7 + `no_show` + R-A datetime remain paper-only; Lane B hole; U89 board #6 stuck |
| **Risks** | False module UAT; C-SLICE violation — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-06a full Diễn biến) | 25 | **9** | 6 | 3 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 8 |
| Security / scope_parity U19 | 15 | **9** | 4 | 5 |
| Reliability (one spine, race-safe unique) | 15 | **9** | 3 | 6 |
| Maintainability (preserve GWC + OPEN-Q close) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.0** | **3.3** | **3.8** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | FE posts Lane B `interviews` bypassing 409 | Network QA | Path lock O1; DENY catalog as SoT; optional BE ALIGN one-active on Lane B or disable schedule CTA |
| A | Dev invents Nest `/rec/interviews` controller | Grep routes | Physical `/recruitment/interviews*` only; paper alias |
| A | Reschedule implemented as R-B only without atomic txn | Code review | Prefer R-A PATCH datetime; if R-B used → single transaction + never ≥2 ACTIVE |
| A | `no_show` still counts ACTIVE | Jest + QA | TERMINAL set includes `no_show` |
| A | Hard DELETE to «né» one-active | Diff | Soft status only (BR-IV-06) |
| A | Flip `recruitment_uat_ready` after GWC | QC honesty | **DENY**; C-SLICE |
| A | Reopen REC-01/02/08 for «schedule depends on YCTD» | Bus | **DENY**; YCTD attach is REC-05 peer EXPAND later |
| B | Dual SoT ACTIVE | Integration | Reject B |
| C | Board idle | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE** on LIVE `recruitment_interviews` one-active spine |
| **Why selected** | Spine + 409 + badge already GWC; closes OPEN-Q from evidence; unlocks residual FR Diễn biến without dual SoT or seal reopen; matches U89 continuous + preserve_default |
| **Assumptions** | W1–W3 seals RETAIN. Soft-gate stage catalog RETAIN. Candidate list projection remains BE display-ready (FE không suy diễn ACTIVE). Prior slice GWC ≠ module UAT. |
| **Rejected** | **B** — greenfield / UV×YCTD / Nest dual · **C** — HOLD / false DONE |

### 6.1 OPEN-Q closure (this seat — LOCK)

| ID | Prior | **LOCK now** | Rationale |
|----|-------|--------------|-----------|
| **OPEN-Q1** | OPEN (UV vs UV×YCTD) | **`(company_id, candidate_id)`** — UV × pháp nhân | SRS BR-IV-01 + glossary; board «× pipeline» = context not YCTD key |
| **OPEN-Q2** | Interim bus R-A | **R-A primary** — PATCH datetime same ACTIVE row; new row only after TERMINAL | Bus 2026-08-06 CONFIRM-ON-BUS; BR-IV-03; lowest blast |
| **OPEN-Q3** | OPEN | **`no_show` ∈ TERMINAL** | SRS BR-IV-02 · Diễn biến #6 · AC-IV-04 family |
| **OPEN-Q4** | OPEN (paper) | **`recruitment_interviews` SoT** · paper `/rec/interviews*` alias · Lane B ≠ SoT | LIVE BE-01..03 + controller CODE-MEMORY Lane A |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | `recruitment_interviews` one-active unique + 409 `HRM-REC-IV-409-ACTIVE` · `active_interview` display-ready · soft-gate `HRM-REC-IV-400-STAGE-DISALLOW` · `resolveHrmListScope` · soft status cancel · W1–W3 seals · JD/UV/YCTD peers · honesty false |
| **DENY invent** | Nest `/rec/interviews` dual SoT · second interview write table as FR-06a SoT · UV×YCTD concurrent ACTIVE · REC-03 campaign schedule · hard DELETE · seed · flip `recruitment_uat_ready` / program honesty · claim module REC UAT · reopen REC-01/02/08 · invent FE-only ACTIVE inference |
| **OUT** | UC-BP-REC-03 · Campaign / tin đăng schedule hub |
| **HOLD peer** | Full REC-06 mail+eval · REC-06b compare · REC-05 history EXPAND — **not** this seat |
| **Honesty** | All flags **false** · **C-SLICE** |

### 6.3 Scope ladder (U19 — mandatory)

| Persona | Scope behavior on schedule / status / reschedule |
|---------|--------------------------------------------------|
| **Group CEO** | Member units in resolved scope — no silent cross-tenant ACTIVE |
| **Member CEO** | Own legal entity only — 404/409 out of scope |
| **HRBP** | Narrow membership — same resolver as candidate list |

**Invariant IV-S-SCOPE:** list candidates projection **=** get interview **=** create/update/reschedule — **same** `resolveHrmListScope`.

---

## 7. Status dictionary (architecture lock)

| Group | Status values | Rule |
|-------|---------------|------|
| **ACTIVE** | `scheduled`, `confirmed` | Count ≤ 1 per `(company_id, candidate_id)` |
| **TERMINAL** | `cancelled`, `completed`, `no_show` | Allows create new ACTIVE |
| **TERMINAL legacy** | `passed`, `failed` | Treat as completed-family for one-active filter (RETAIN backward rows) |
| **Not ACTIVE** | `rescheduled` (if ever used for R-B) | Superseded row only inside atomic R-B — **not** default MVP path |

**Error taxonomy (RETAIN + ADD):**

| Code | HTTP | Meaning |
|------|------|---------|
| `HRM-REC-IV-409-ACTIVE` | 409 | Already ACTIVE — details include active_interview_id / status / at |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | Stage flag blocks schedule (**≠** 409 ACTIVE) |
| `HRM-REC-IV-400-INVALID-TRANSITION` | 400 | Illegal status / reschedule on non-ACTIVE |
| `HRM-REC-405` / `HRM-REC-406` | 404 | Candidate / interview not found or out of scope |
| Scope mismatch | 409 | Same resolver family as list |

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC. This seat **locks** which F-ids unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-IV-01** | Tạo lịch khi ACTIVE=0 | FR-06a #1–#3 · AC-IV-01/02 | `POST /api/hrm/recruitment/interviews` | `/api/hrm/rec/interviews` | **RETAIN LIVE** |
| **F-REC-IV-02** | Confirm / cancel / complete / no_show | #4–#6 · AC-IV-03/04 | `PATCH …/interviews/:id/status` | same family | **RETAIN + UPGRADE** (`no_show` ADD) |
| **F-REC-IV-03** | Đổi lịch R-A (datetime ± interviewer) | #5/#7 · AC-IV-05 | `PATCH …/interviews/:id` (scheduled_at) **ADD** | paper | **UNLOCK ADD** |
| **F-REC-IV-04** | Projection badge list UV | #3/#7 · AC-IV-01/06 | `GET …/candidates*` `active_interview` | — | **RETAIN LIVE** |
| **F-REC-IV-05** | List interviews by candidate (optional) | AC-IV-06 | `GET …/interviews?candidate_id=` | — | **P2 residual** (QC noted) — **not** block BA unlock |
| **F-REC-IV-SCHED-SOFT** | Soft-gate stage | AC-IV-07 | overlay on POST | — | **RETAIN** peer |
| **F-REC-CAMPAIGN-*** | Campaign hub | FR-03 | — | — | **OUT / DENY** |

### 8.1 Domain invariants (architecture lock)

| ID | Invariant |
|----|-----------|
| **IV-S1** | Sole physical FR-06a mutate SoT = `recruitment_interviews` |
| **IV-S2** | ACTIVE count ≤ 1 for `(company_id, candidate_id)` at all times (txn + unique) |
| **IV-S3** | Create requires ACTIVE=0 **and** stage allows (order: soft-gate then one-active — both may apply; codes distinct) |
| **IV-S4** | R-A reschedule never creates second ACTIVE row |
| **IV-S5** | TERMINAL includes `no_show`; after TERMINAL, create allowed |
| **IV-S6** | Cancel = status trail — **no** hard DELETE |
| **IV-S7** | List badge fields BE display-ready — FE binds only |
| **IV-S8** | Lane B `public.interviews` ≠ FR-06a SoT |
| **IV-S9** | Paper `/rec/*` ≠ second Nest implementation |
| **IV-S10** | Slice/module honesty: GWC ≠ `recruitment_uat_ready=true` |

---

## 9. Implementation and Validation Plan

### 9.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack FR-06a against Option A (O* CONFIRM · VAL · Diễn biến FE · J-* DRAFT) — **next_owner**.
2. **SA/API or ba-data** — DOC-DELTA F-REC-IV-02/03 physical (`no_show` · PATCH datetime) — narrow after BA.
3. **Dev-BE** — ADD `no_show` + PATCH scheduled_at; optional Lane B ALIGN; regression jest one-active; **no** reopen W1–W3.
4. **Dev-FE** — Cancel/complete/reschedule UX on spine path; 409 vs DISALLOW toast distinct; F5 badge; Network → `/recruitment/interviews*`.
5. **QA** — browser U65 AC-IV-01..07 residual · **no seed**.
6. **QC** — GWC C-SLICE · honesty footer false · **no** module UAT.

### 9.2 Rollback

- Feature-flag R-A PATCH off → prior status-only path; **never** drop unique ACTIVE index.
- No drop of `recruitment_interviews` / projection / soft-gate.

### 9.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| Spec | This Option A CONFIRMED + BA AC CONFIRMED |
| Physical | API F.1 cites `/recruitment/interviews*` + DTO↔column |
| L0–L2.5 | Browser FE path create/dup/cancel/reschedule; F5 badge; codes 409 ≠ DISALLOW |
| Honesty | Evidence stamps `recruitment_uat_ready=false` |

### 9.4 Success criteria (architecture)

- One ACTIVE max per UV × pháp nhân on spine.
- R-A datetime change keeps one ACTIVE.
- `no_show` unlocks next schedule.
- Lane B not used as FR-06a SoT.
- No Nest `/rec` dual · no REC-03 · no honesty flip · W1–W3 untouched.

---

## 10. BA CONFIRM checklist (O* — copy into BA-01)

| ID | Question for BA | SA default (Option A) |
|----|-----------------|------------------------|
| **O1** | Mutate path FE = `POST/PATCH /recruitment/interviews*` only? | **YES** — Lane B OUT as SoT |
| **O2** | Cardinality = UV × `company_id` (not UV×YCTD)? | **YES** — OPEN-Q1 LOCK |
| **O3** | Reschedule = R-A PATCH datetime? | **YES** — OPEN-Q2 LOCK |
| **O4** | `no_show` TERMINAL? | **YES** — OPEN-Q3 LOCK |
| **O5** | Soft-gate error UX ≠ 409 ACTIVE? | **YES** — AC-IV-07 |
| **O6** | Cancel reason required? | Tenant CFG — BA seals; default optional unless SRS tenant policy says required |
| **O7** | Past datetime policy? | Tenant CFG — BA seals message; do not invent global hard ban without SRS Decision |
| **O8** | GET list interviews required MVP? | **P2** — AC-IV-06 may use `active_interview_id` from 409/details / candidate projection |
| **O9** | Reports/dashboard consume IV counts? | **OUT this seat** — REC-08 sealed; no reopen |
| **O10** | Honesty after GWC? | **false** — C-SLICE |

---

## 11. next_dispatch_prompt (BA-01)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: SA-01 Option A CONFIRMED docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-sa-01.md
ref_srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
ref_prior_slice: docs/qa/evidence/po-hrm-rec-iv-one-active-qc-slice-01.md (RETAIN · do not reopen as module UAT)

MISSION: AC pack for UC-BP-REC-06a against Option A (ACCEPT_AS_IS_UPGRADE spine recruitment_interviews).
CONFIRM O1–O10 (path Lane A, cardinality UV×company, R-A, no_show TERMINAL, soft-gate ≠ 409, cancel reason, past datetime, GET list P2, no REC-08 reopen, honesty false).
Deliver AC-REC-IV-01..07 mapped + residual AC for cancel/complete/reschedule browser + VAL-REC-IV-* + Diễn biến FE + J-* DRAFT.
must_keep: REC-03 OUT · honesty false · C-SLICE · sealed W1–W3 · prior IV 409/badge LIVE · U65
DENY: invent UV×YCTD ACTIVE · Nest /rec dual · Lane B as SoT · seed · flip recruitment_uat_ready · reopen REC-01/02/08

EXIT: PASS_TO_PM CONFIRMED · next_owner sa|ba-data API/DB F.1 residual (F-REC-IV-02/03) · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md
```

---

## 12. completion_report

| | |
|--|--|
| **Closed** | Option **A LOCKED** for `UC-BP-REC-06a`; OPEN-Q1..Q4 **CLOSED**; F.1 IV-01..04 + SCHED-SOFT disposition; LIVE vs gap map; U19 scope; DENY dual Nest / Lane B SoT / UV×YCTD / REC-03 / honesty flip / W1–W3 reopen |
| **Residual** | BA AC pack; API DOC-DELTA `no_show` + R-A PATCH; Dev/QA residual cancel/reschedule browser; GET list P2 |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **next_owner** | **ba-process** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-sa-01.md` |
