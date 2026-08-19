# PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01 — Option/F.1 · Lịch sử trạng thái ứng viên gắn YCTD

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/DB/API residual → Dev |
| **depends_on** | QC-01 GWC Wave-6 UC-BP-REC-04 **SEALED** — stamp `REC04QC1-MSL1LU4H` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-REC-05` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#9** WAVE-7 after REC-04 |
| **ref_sa_spine** | [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) · [`PO-HRM-REC-UV-YCTD-DB-01.md`](./PO-HRM-REC-UV-YCTD-DB-01.md) · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) · peer [`…-REC-04/00/01/02/08/06A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md) — **reuse · DENY reopen seals** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** RETAIN · 16 program honesty flags **false** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-05** · **BR-BP-CV-02** · Diễn biến #0a–#2 · Thành công · peer **FR-UC-BP-REC-05a** RETAIN |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · partner **REQ_REC_002** |
| **ref_br_depth** | `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-05 · BR-BP-CV-02 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §2.4a `rec_pipeline_stage` · §2.5 `rec_candidate_application` · §2.6 `rec_candidate_stage_history` |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-APP-02** · **F-REC-CAT-STG/EFF-*** · F-REC-UV-YCTD-* · F-REC-CMP-* — **no wipe**; EXPAND APP-02 physical timeline residual |
| **OUT** | **UC-BP-REC-03** Campaign / tin đăng SoT · Nest `/rec` dual · second pipeline catalog SoT · second history SoT · seed · honesty flip · reopen REC-04 J-* |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-7 architecture unlock: **Lịch sử trạng thái UV gắn YCTD** vs AS-IS applications + stage catalog |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after REC-04 QC-01 GWC |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-05 · BR-BP-CV-02 · peer 05a (BR-BP-CV-03) · F-REC-APP-02 · F-REC-CAT-* · UV-YCTD · REC-04 must_keep · 06a soft-gate · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **Catalog (SEALED platform):** `public.rec_pipeline_stage` + Nest **`/api/hrm/recruitment/pipeline-stages*`** (STG-01/02 · EFF-01) + consumer assert `HRM-REC-STAGE-UNKNOWN` / IV `HRM-REC-IV-400-STAGE-DISALLOW`. **UV↔YCTD (SEALED):** Lane A `public.recruitment_candidates` (`requisition_id` NOT NULL) + `GET applications` / `GET compare` + create via F-REC-UV-YCTD-*. Current stage column on Lane A = **`status`** with **closed CHK** `new\|screening\|interview\|offer\|hired\|rejected` (six-ceiling risk vs BR-PLT-05). **Legacy Lane B apps:** `public.candidate_applications` + `PATCH …/candidate-applications/:id/stage` still keyed **`job_posting_id`** (REC-03 leftover ≠ YCTD SoT) — APP-02 assert wired but **overwrite-only** stage. **Pool person stage:** `PATCH …/candidates-pool/:id/stage` = person/INT-01 surface — **≠** FR-05 YCTD-link timeline. **History table:** paper `rec_candidate_stage_history` / `candidate_stage_history` — **ABSENT** in Nest ensureSchema (no append-only timeline). Paper `POST /api/hrm/rec/applications/{id}/transitions` = naming alias — **no** second Nest `/rec` SoT allowed. |
| **Paper target** | FR-UC-BP-REC-05: đổi trạng thái trên **từng liên kết UV–YCTD**; picker từ danh mục hiệu lực khi còn phần tử; **append lịch sử** (không ghi đè mất); timeline theo YCTD / UV; từ chối bắt buộc lý do; admin catalog ≠ consumer invent; Kanban cột = EFF khi còn phần tử; PV/eval **trong** pipeline — không Campaign. BR-BP-CV-02: timeline ≥ nguồn / từ chối / desired salary — không mất lịch sử. |
| **Gap class** | **impl_gap residual on LIVE spine** — **not** greenfield: (1) **no append-only history**; (2) Lane A closed six CHK vs open catalog; (3) transition surface incomplete for YCTD-bound link (F-REC-APP-02 residual); (4) risk invent Nest `/rec` dual or second catalog/history SoT; (5) conflate 05a create / pool stage / posting apps with FR-05 DONE; (6) reopen REC-03 via `job_posting_id` apps. |
| **Constraints** | U89 continuous · **preserve** REC-00/01/02/08/06a/**04** seals · UV-YCTD ONE soft FK · catalog STG/EFF RETAIN · C-SLICE · DENY REC-03 · DENY seed · DENY honesty flip · DENY Nest `/rec` dual · DENY second SoT · **cấm code until Option CONFIRMED** (this seat) |
| **Failure impact if unresolved** | Board #9 stalls; BA cannot AC FR-05; Dev invents `/rec/transitions` dual / second history table beside paper without YCTD FK; overwrites stage without audit; honesty flip; regression UV / IV soft-gate / REC-04 scan |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-05a / UV-YCTD (RETAIN)              UC-BP-REC-04 (SEALED — must_keep)
  recruitment_candidates + applications N–N       internal_scan_* / posted gate
       soft FK requisition_id ONLY
                │
                │  current stage on YCTD-link
                │  (Lane A status ↔ DTO stage · N–N application.stage when present)
                ▼
  F-REC-CAT-EFF-01 ── picker / Kanban SoT ── public.rec_pipeline_stage (RETAIN)
       admin STG-02 opens N+1 ≠ consumer invent
                │
                │  F-REC-APP-02 residual (Option A)
                ▼
  PATCH/POST transition on YCTD-bound link (physical /recruitment/*)
       1) assert to_stage ∈ EFF when EFF>0 → else HRM-REC-STAGE-UNKNOWN
       2) UPDATE current stage (open key — DENY closed-six ceiling when EFF>0)
       3) APPEND history row (from_stage, to_stage, note, changed_by, changed_at)
       4) reject outcome ⇒ note/reason required (BR-BP-CV-02)
                │
                ▼
  ADD physical append-only history SoT
       paper: rec_candidate_stage_history / candidate_stage_history
       FK → application_id AND/OR recruitment_candidate_id (BA O2/O3 lock)
                │
  GET timeline by application | candidate | requisition_id
                │
  paper alias ONLY: /api/hrm/rec/applications/{id}/transitions
                ▼
  REC-03 Campaign / job_postings / candidate_applications.job_posting_id  = OUT — NOT FR-05 SoT
  Pool PATCH …/candidates-pool/:id/stage = person/INT surface — NOT FR-05 timeline SoT
```

**Label lock:** «Pipeline UV» = **liên kết UV↔YCTD** — not person-pool stage alone; not Campaign.  
**Spine lock:** Nest physical `/recruitment/*` — **DENY** greenfield Nest `/rec/*` SoT.  
**Catalog lock:** ONE `rec_pipeline_stage` — **DENY** second catalog table.  
**History lock:** ONE append-only history SoT — **DENY** dual history tables / overwrite-only as DONE.  
**Honesty lock:** Slice GWC later **≠** `recruitment_uat_ready=true` · **≠** `jd_dynamic_done=true`.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / DB / API) | AS-IS LIVE | Verdict |
|------------|------------------------|------------|---------|
| Stage catalog admin/effective | §2.4a · F-REC-CAT-STG/EFF | `rec_pipeline_stage` + `/pipeline-stages*` | **LIVE — RETAIN must_keep** |
| Consumer invent ban | `HRM-REC-STAGE-UNKNOWN` | assert on APP-02 / pool / IV soft-gate | **RETAIN** |
| UV↔YCTD create / N–N | F-REC-UV-YCTD-* · §2.5 | Lane A + applications/compare | **RETAIN must_keep** (05a) |
| Current stage on link | application.`stage` | Lane A `status` + closed CHK six; legacy posting apps `stage` | **UNLOCK residual** — open catalog + YCTD-bound SoT |
| Append history | §2.6 · F-REC-APP-02 | **ABSENT** table; overwrite stage only | **UNLOCK residual** ADD history |
| Transition API | F-REC-APP-02 physical prefer | Partial PATCH posting-apps / pool; no YCTD timeline transition complete | **UNLOCK residual** on `/recruitment/*` |
| Timeline GET | FR-05 #2 | Absent | **UNLOCK residual** |
| Reject reason | FR-05 input · BR-BP-CV-02 | Weak / optional | **UNLOCK residual** VAL |
| Reverse stage | FR-05 special CFG | Absent / unclear | **BA O6** |
| Kanban columns = EFF | FR-05 #5 optional | Peer CNS Kanban seals exist | **RETAIN peer** · AC depth BA |
| IV soft-gate by stage flag | F-REC-IV-SCHED-SOFT | LIVE 06a | **RETAIN must_keep** |
| REC-04 scan / posted | F-REC-CV-SCAN-* | SEALED Wave-6 | **RETAIN must_keep** — **DENY reopen J-*** |
| External Campaign | REC-03 | OUT GĐ1 · `job_postings` leftover | **OUT / DENY** as FR-05 SoT |
| Paper `/rec/…/transitions` | F-REC-APP-02 | Prefer physical `/recruitment/*` | **Alias only — DENY dual Nest** |
| Scope parity U19 | special | `resolveHrmListScope` on recruitment | **RETAIN** |
| Module REC UAT / honesty | program | W1–W6 C-SLICE only | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_UPGRADE on LIVE applications + catalog + ADD history (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** physical Nest `/api/hrm/recruitment/pipeline-stages*` (catalog SoT) + UV-YCTD Lane A `/candidates*` + `GET applications` / `GET compare` + REC-04 YCTD `pipeline_flags` / scan gate + 06a interviews soft-gate. Treat paper `rec_candidate_application` / `rec_candidate_stage_history` / `/rec/applications/*/transitions` as **logical aliases** of LIVE YCTD-bound link + **one** append-only history table (physical name BA/ba-data). **RETAIN** admin≠consumer, `HRM-REC-STAGE-UNKNOWN`, ONE soft FK `requisition_id`. **UPGRADE residual only** for FR-UC-BP-REC-05: (1) transition write on **YCTD-bound** link (Lane A `status`↔DTO `stage` and/or N–N application with `requisition_id` — **not** `job_posting_id`); (2) when EFF>0, `to_stage` ∈ effective; (3) **ADD** append-only history row per successful transition; (4) GET timeline by YCTD / UV / application; (5) reject-outcome requires note/reason; (6) relax/replace closed six CHK so open catalog keys persist when EFF>0 (BR-PLT-05); (7) Kanban/picker consume EFF — no free-text SoT. **REC-03 remains OUT.** Pool stage + posting-application stage remain non-SoT for this FR. |
| **Benefits** | Zero second catalog; reuses UV-YCTD + CAT seals; matches Option A physical-prefer; unlocks BA without Nest `/rec` dual; preserves REC-04/06a |
| **Costs** | ba-data likely **REQUIRED** for history table (+ optional CHK migrate); BA must lock link home (Lane A vs N–N application) and reverse-transition CFG |
| **Risks** | Dev invents `/rec/transitions` dual or second history — **mitigate:** DENY + alias. Uses posting apps as SoT — **mitigate:** OUT. Claims 05a create = FR-05 DONE — **mitigate:** O7. Flip honesty — **mitigate:** HOLD. |

### Option B — Greenfield `rec_candidate_application` + Nest `/rec/*` + dual history/catalog

| | |
|--|--|
| **Description** | Implement paper tables/routes as new SoT; dual-run off Lane A / `rec_pipeline_stage`; new Nest `/rec/applications` controller as primary. |
| **Benefits** | Clean paper name fidelity |
| **Costs** | Dual SoT migration; rewrite FE UV + Kanban + IV soft-gate consumers; break UV-YCTD / CAT / REC-04 seals; high blast |
| **Risks** | Regression W1–W6 · C-SLICE · U89 delay — **REJECT** |

### Option C — HOLD / claim catalog CNS or 05a create = FR-05 DONE / flip honesty

| | |
|--|--|
| **Description** | Treat stage-catalog CNS, UV create, or overwrite-only PATCH as FR-UC-BP-REC-05 complete; or HOLD; or flip `recruitment_uat_ready`. |
| **Benefits** | Short-term idle |
| **Costs** | No append history / timeline AC; BR-BP-CV-02 unenforced; board #9 false DONE or stuck; violates U89 continuous + honesty HOLD |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-05 + BR-BP-CV-02) | 25 | **9** | 8 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **8** | 2 | 8 |
| Security / scope_parity U19 + CT isolation | 15 | **9** | 4 | 5 |
| Reliability (one catalog + one history + YCTD link) | 15 | **9** | 3 | 3 |
| Maintainability (preserve UV-YCTD + W1–W6) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **8.85** | **3.55** | **3.25** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Dev creates Nest `/rec/applications` transition SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Second catalog table beside `rec_pipeline_stage` | Schema review | **DENY**; RETAIN §2.4a |
| A | Second history SoT / overwrite-only claimed DONE | QA timeline F5 | **DENY**; require append row + GET |
| A | Uses `job_posting_id` apps as FR-05 SoT | Code review | **DENY** · REC-03 OUT |
| A | Closed six CHK rejects 7th catalog key | BA/QA open catalog | CHK migrate / open text when EFF>0 |
| A | Transition without history append | Integration test | Atomic write stage+history |
| A | Reject without reason | VAL | **400** family `HRM-REC-STAGE-*` / APP mint |
| A | Cross-company timeline leak | U19 tests | Same `resolveHrmListScope` |
| A | Reopen REC-04 scan J-* / flip posted gate | Bus | **DENY reopen** without regression |
| A | Flip `recruitment_uat_ready` / `jd_dynamic_done` | QC honesty | **DENY** · C-SLICE |
| A | Seed apps for U65 | QA evidence | **DENY** seed |
| B | Dual SoT + FK break | Integration | Reject B |
| C | Board idle / false DONE | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_UPGRADE** on LIVE catalog + YCTD-bound applications/Lane A; **ADD** one append-only history; paper `/rec/*` = **alias only** |
| **Why selected** | Catalog + UV↔YCTD already LIVE/sealed; FR-05 residual is timeline + open-key transition — not greenfield; preserves W1–W6 + REC-04/06a must_keep; unlocks U89 #9 BA |
| **Assumptions** | UV-YCTD soft FK ONE physical `requisition_id` **RETAIN**. Catalog ONE SoT **RETAIN**. REC-03 OUT. 05a create ≠ FR-05 timeline DONE. Pool/person stage ≠ YCTD-link SoT. `jd_dynamic_done=false` · `recruitment_uat_ready=false`. |
| **Rejected** | **B** — Nest `/rec` dual / second SoT · **C** — HOLD / honesty flip / false DONE |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | `/api/hrm/recruitment/*` only; `/rec/*` alias | Cite in AC Network |
| **O2** | History persist | **ADD** one append-only physical table (paper `rec_candidate_stage_history` / `candidate_stage_history`); columns `from_stage`, `to_stage`, `note`, `changed_by`, `changed_at` + FK to link; **DENY** overwrite-only as DONE; **DENY** dual history tables | ba-data **REQUIRED** for table/CHK; lock physical name + FK |
| **O3** | Stage home (link SoT) | Prefer **YCTD-bound** current stage on Lane A `recruitment_candidates.status` (DTO `stage`) **and** keep N–N application.stage in sync when application row exists; **DENY** `job_posting_id` apps as SoT | AC which id FE transitions (candidate_id vs application_id) |
| **O4** | Open catalog vs CHK six | When EFF>0: persist any effective `stage_key`; migrate/drop closed six ceiling on Lane A; when EFF=0: empty picker + admin guide (SRS) — no fake starter SoT | AC BR-PLT-05 / empty EFF |
| **O5** | Reject / terminal reason | `is_reject_outcome` (or reject class) ⇒ `note`/reason **required** | VAL + FE |
| **O6** | Reverse transitions | Allowed only if CFG/catalog policy; always append history | AC special case |
| **O7** | Peers must_keep | RETAIN 05a UV-YCTD · REC-04 scan/posted · 06a IV soft-gate · CMP · CAT STG/EFF · W1–W3; FR-05 AC may cite create but **not** redefine 05a / scan / IV SoT | Scope note |
| **O8** | Honesty | All flags false · C-SLICE | Footer every evidence |
| **O9** | Kanban | Optional P2 in MVP if list+detail+timeline PASS; columns must = EFF when EFF>0 | Scope Kanban in/out of this seat |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | `rec_pipeline_stage` + `/pipeline-stages*` · UV-YCTD ONE `requisition_id` · Lane A `/candidates*` · `GET applications` / `GET compare` · REC-04 `internal_scan_*` + posted gate · W2 `open_for_hire` + flags family · W4 IV one-active + soft-gate DISALLOW · W5 JD soft FK · W1 cell/spawn · W3 dashboard physical · `resolveHrmListScope` · soft-delete · honesty false · F-REC-APP-02 stub intent (append history) |
| **DENY invent** | Nest `/rec` dual SoT · second catalog table · second history SoT · `job_postings` / Campaign as UV/pipeline SoT · closed-six ceiling as sole SoT when EFF>0 · seed for evidence · flip `jd_dynamic_done` / `recruitment_uat_ready` / program honesty · claim module REC UAT / Phase1 DONE · reopen sealed REC-04 J-HRM-REC-CV-04-01..04 / W1–W5 without regression |
| **OUT** | UC-BP-REC-03 · Campaign / tin đăng GĐ1 |
| **HOLD peer** | `R-PLT-JD-DYNAMIC-DONE-01` · recruitment module UAT |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1 REC-01/01b | HCELL / spawn UQ | RETAIN |
| W2 REC-02/02b | TARGET-MONTH · BOD · open_for_hire · flags · JD soft FK | RETAIN |
| W3 REC-08 | dashboard physical | RETAIN |
| W4 REC-06a | IV one-active · soft-gate | RETAIN |
| W5 REC-00 | JD `job-templates` | RETAIN |
| W6 REC-04 | `REC04QC1-MSL1LU4H` · J-HRM-REC-CV-04-01..04 | RETAIN — **DENY reopen without regression** |
| UV-YCTD | API/DB CONFIRMED | RETAIN ONE soft FK · 05a |
| Stage catalog | REC-STAGE-CATALOG DOCS + CNS | RETAIN STG/EFF · UNKNOWN · DISALLOW |
| JD-DYNAMIC | HOLD `jd_dynamic_done=false` | RETAIN |

---

## 7. Implementation and Validation Plan

### 7.1 Rollout steps (governance → execution)

1. **BA-process** — AC pack FR-UC-BP-REC-05 (O1–O9 · VAL · Diễn biến FE · J-* DRAFT) against this Option A; cite BR-BP-CV-02; **depends_on** this CONFIRMED; **cấm invent** beyond SRS; unlock residual transition+history only.
2. **ba-data** — **REQUIRED** for ADD history table (+ Lane A CHK open-catalog migrate if O4); **NOT** second catalog.
3. **SA API** — F.1 DOC-DELTA physical prefer `F-REC-APP-02` UPGRADE + timeline GET; paper `/rec` alias; mint `HRM-REC-STAGE-*` as needed after BA.
4. **Dev-BE / Dev-FE** — after AC + DATA/API CONFIRMED — residual only (no greenfield Nest `/rec`).
5. **QA** — U65 browser: UV on YCTD → đổi stage từ EFF → F5 timeline còn → invent stage bị chặn → reject+reason → Network physical paths; **no seed**; **no** reopen REC-04 journeys as rewrite.
6. **QC** — GWC C-SLICE; honesty false; DENY module UAT.

### 7.2 Rollback

- Docs Option stamp only until Dev; if Dev regresses UV-YCTD / catalog / REC-04 flags → revert residual; seals W1–W6 untouched.

### 7.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| SA | This file CONFIRMED Option A |
| BA | AC pack cites O1–O9 · no Nest dual · no honesty invent · no REC-03 · no reopen REC-04 |
| DATA | One history table · no second catalog · CHK open when EFF>0 |
| API | Physical prefer transition+timeline · alias paper |
| QA | UF FR-05 Diễn biến #1–#2 browser + F5 history + Network 2xx + UNKNOWN on invent |
| QC | GWC · C-SLICE · `jd_dynamic_done=false` · `recruitment_uat_ready=false` |

### 7.4 Success criteria

- One catalog SoT; one history SoT; stage on YCTD-link; paper `/rec` not second Nest controller; BA unlocked; no honesty flip; REC-03 OUT; REC-04 seals intact.

---

## 8. F.1 API matrix (disposition — physical prefer Option A)

> Full request/response column contracts = **next** TechSpec/API seat after BA AC (+ ba-data). This seat **locks** SoT + path + which F-ids RETAIN vs residual unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-APP-02** | Đổi stage + append lịch sử | FR-05 #1 · BR-BP-CV-02 | `PATCH /api/hrm/recruitment/candidates/:id` (stage) **and/or** `POST …/candidates/:id/transitions` **and/or** `PATCH …/applications/:id/stage` on **YCTD-bound** link — BA O3 picks primary | `POST /api/hrm/rec/applications/{id}/transitions` | **UNLOCK residual** UPGRADE |
| **F-REC-APP-02-TL** (disposition) | GET timeline | FR-05 #2 | `GET …/candidates/:id/stage-history` **or** `GET …/applications/:id/stage-history` (+ filter `requisition_id`) | `/rec/…/stage-history` | **UNLOCK residual** ADD |
| **F-REC-CAT-STG-01/02** | Admin mở danh mục | FR-05 #0a | `/recruitment/pipeline-stages*` | `/rec/pipeline-stages*` | **RETAIN must_keep** |
| **F-REC-CAT-EFF-01** | Picker / Kanban SoT | FR-05 #0b/#5 | `GET …/pipeline-stages/effective` | same alias | **RETAIN must_keep** |
| **F-REC-UV-YCTD-01..05** | Create/list UV+YCTD | peer 05a | `/requisitions?receivable` · `/candidates*` | `/rec/candidates*` | **RETAIN must_keep** |
| **F-REC-CMP-01/02** | Apps + compare | peer / 06b | `GET applications` · `GET compare` | `/rec/applications` · `/rec/compare` | **RETAIN** |
| **F-REC-IV-SCHED-SOFT** | Soft-gate PV by stage flag | peer 06a | `/recruitment/interviews*` | `/rec/interviews*` | **RETAIN must_keep** |
| **F-REC-CV-SCAN-*** | Internal scan / posted | peer REC-04 | `/candidates-pool` · `/requisitions/…/internal-scan` · flags | `/rec/…` | **RETAIN must_keep** — **DENY reopen** |
| **F-REC-APP-01** | Paper create stub | 05a overlay | Alias of UV-YCTD create | `/rec/candidates*` | **Alias / RETAIN stub** — **DENY Nest dual** |

### 8.1 Scope parity (U19)

List candidates / get-by-id / transition / timeline / applications by YCTD — **same** `resolveHrmListScope` + company persist rules as existing recruitment module. **DENY** cross-CT timeline leak.

### 8.2 Error family (RETAIN + residual mint)

| Code family | Use |
|-------------|-----|
| `HRM-REC-STAGE-UNKNOWN` | Invent / OOS `to_stage` when EFF>0 (**RETAIN**) |
| `HRM-REC-IV-400-STAGE-DISALLOW` | IV soft-gate (**RETAIN** · ≠ UNKNOWN) |
| `HRM-REC-UV-YCTD-*` | Attach / receivable / position (**RETAIN**) |
| `HRM-REC-CV-SCAN-*` | Scan/posted (**RETAIN** · do not redefine) |
| **`HRM-REC-STAGE-*`** (residual mint) | Reject reason missing · reverse forbidden · history persist fail · WF-locked | Mint in API seat after BA — **no invent** in BA without SA/API |

---

## 9. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED |
| **next_owner** | **ba-process** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-sa-01.md` |
| **Unlocks** | BA AC pack `PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01` against Option A |
| **Does not unlock** | Dev code · honesty flips · REC-03 · Nest `/rec` dual · reopen W1–W6 / REC-04 J-* · `jd_dynamic_done=true` · `recruitment_uat_ready=true` |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition; LIVE vs gap vs FR-UC-BP-REC-05 / BR-BP-CV-02; paper alias lock; must_keep REC-04/UV-YCTD/W2/06a/CAT; DENY Nest dual / Campaign / second SoT / seed / honesty flip; O1–O9 for BA; unlock BA AC; **cấm code** until contracts.
- **Residual:** BA AC (stage home; history FK; reverse CFG; Kanban scope); ba-data history table; SA API F.1; Dev after contracts.
