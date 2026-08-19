# PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01 — Option/F.1 · Dashboard «bao giờ đủ người»

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → TechSpec/API → Dev |
| **depends_on** | QC-01 GWC REC-02/02b physical LIVE — `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-REC-08` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#5** after REC-02/02b |
| **ref_sa_spine** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md) · [`…-REC-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md) — **reuse · do not fork SoT** |
| **ref_data_spine** | [`…-REC-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md) cell model · [`…-REC-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md) YCTD physical |
| **ref_api_spine** | [`…-REC-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md) · [`…-REC-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-08** |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` · **WBS-REC-06** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-DASH-01** |
| **ref_partner** | **REQ_REC_005** |
| **OUT** | **UC-BP-REC-03** campaign drill as primary · Nest `/rec` dual SoT · FE domain aggregation |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-3 architecture unlock: read-model dashboard / report «bao giờ đủ người» on sealed Định biên + YCTD spine |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-REC-08 · WBS-REC-06 · REQ_REC_005 · BR-BP-HC-01 (KH từ định biên) · TechSpec F-REC-DASH-01 · SOLID 25 §3.1 / display-ready · U19 scope_parity |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | Recruitment **Dashboard** tab: `useRecruitmentDashboard` + `recruitmentDashboardAggregator` **joins** kanban candidates + `listCandidateApplications` + **`listJobPostings`** on FE — charts by dept/month + cost stubs; **KH vs TT định biên không** lấy từ `months_data.need_hire` / `job_requisitions`. Reports tab: `useReportsData` builds recruitment report from **candidate list FE aggregation**. Paper **F-REC-DASH-01** `GET /api/hrm/rec/dashboard` **ABSENT** on Nest (no recruitment dashboard/report service). REC-01/02 physical spine **LIVE** (cells + YCTD mode/status/pipeline_flags). |
| **Paper target** | Một read-model: KH = định biên Cần tuyển đã duyệt; TT = pipeline / onboard gắn **YCTD**; funnel CV→PV→offer→onboard; % hoàn thành; trả lời «khi nào đủ người»; khoan **YCTD** (MVP) — không nhập tay trên dashboard; không lộ C&B; không trộn pháp nhân ngoài quyền. |
| **Gap class** | **impl_gap P0** — FE domain aggregation (DENY rule 25 §3.1); wrong SoT (`job_postings` vs plans+YCTD); no Nest display-ready dashboard; paper `/rec/dashboard` ≠ Nest physical family. |
| **Constraints** | U89 continuous · preserve REC-01/02 seals · C-SLICE · DENY REC-03 · DENY seed · DENY flip `recruitment_uat_ready` · DENY Nest `/rec` dual path · DENY reopen REC-02 seals |
| **Failure impact if unresolved** | Sponsor REQ_REC_005 idle; FE keeps fake KH; dual semantics vs sealed spine; module UAT false claim risk |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-REC-01/01b (SEALED)                 UC-BP-REC-02/02b (SEALED LIVE)
  recruitment_plans                         job_requisitions
    months_data[] cells                       headcount_mode · status open_for_hire
    need_hire · lifecycle_status              headcount_cell_id · target_month
    cell_id                                   pipeline_flags_json
         \                                   /
          \                                 /
           ▼                               ▼
     Nest RecruitmentDashboardService (NEW — read-only aggregate)
           │  resolveHrmListScope (U19 — same as list plans/requisitions)
           │  SQL / query join — NO FE formula
           ▼
     GET /api/hrm/recruitment/dashboard          (physical Option A)
     GET /api/hrm/recruitment/dashboard/yctd-drill (ADD optional same seat or API)
           │
           │  paper alias ONLY: GET /api/hrm/rec/dashboard
           ▼
     Display-ready DTO → FE bind (Recruitment tab Dashboard + Reports consumer)
           │
           └── REC-03 Campaign OUT — drill = YCTD / pipeline candidates
```

**Label lock:** «bao giờ đủ người» = **derived progress** from KH cells + YCTD fill — **not** a second write SoT.  
**Spine lock:** Sources = sealed `recruitment_plans` cells + `job_requisitions` (+ candidates/applications when present) — **DENY** invent rollup write-table as SoT; **DENY** `job_postings` as KH SoT.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS/API) | AS-IS LIVE | Verdict |
|------------|-----------------|------------|---------|
| KH định biên Cần tuyển | FR-08 · F-REC-DASH-01 `planned_need` | Cells LIVE post REC-01 (`need_hire` / `lifecycle_status`) — **not** consumed by dashboard | **GAP P0** wire read-model |
| TT / funnel / onboard | FR-08 Diễn biến #2–#3 | Candidates + applications LIVE; FE joins postings | **GAP** BE aggregate + YCTD FK |
| YCTD progress | headcount × status / pipeline_flags | YCTD LIVE REC-02 (`open_for_hire`, flags) | **UNLOCK** include in rollup query |
| Nest dashboard API | F-REC-DASH-01 `/rec/dashboard` | **ABSENT** | **UNLOCK ADD** physical `/recruitment/dashboard*` |
| FE dashboard charts | Display bind | `recruitmentDashboardAggregator` **domain join** | **UPGRADE** — FE becomes display-only |
| Reports recruitment tab | partial overlap FR-08 | FE `buildRecruitmentReportFromApi(candidates)` | **ALIGN** consume same DTO or subset — **no** second formula |
| Campaign drill | FR-08 special: GĐ2 only | SRS forbids campaign-primary MVP | **OUT / DENY** |
| Scope parity U19 | group→member→HRBP | `resolveHrmListScope` on plans/YCTD | **RETAIN** enforce on dashboard GETs |
| C&B non-leak | FR-08 BR | Cost chart stubs may invent VND | **DENY** offer salary / C&B on this surface |
| Materialized rollup table | — | ABSENT | **NOT** required MVP (Option B reject) |

---

## 3. Options

### Option A — BE on-the-fly read-model (query/view in Nest) + display-ready DTO (RECOMMENDED)

| | |
|--|--|
| **Description** | **ADD** Nest read service under physical `/api/hrm/recruitment/dashboard*` that aggregates **on request** from sealed sources: (1) approved / `need_hire_approved` cells → `planned_need`; (2) `job_requisitions` in scope (mode, status, `target_month`, `headcount`, cell link, pipeline_flags); (3) candidate/application counts by stage keyed to `requisition_id` when available. Return **display-ready** fields (`planned_need`, `filled_count`, `in_pipeline_count`, `completion_pct`, `gap_count`, `enough_people_eta`, `by_month[]`, `by_org_unit[]`, `by_yctd[]`, funnel buckets). Paper `GET /api/hrm/rec/dashboard` = **logical alias only**. FE **binds** — **cấm** join plans+YCTD+candidates to invent KH/TT/%. Optional SQL **VIEW** (non-materialized) OK if same service owns semantics. |
| **Benefits** | Zero dual SoT; always consistent with REC-01/02 writes; fastest U89; SOLID / display-ready compliant; U19 one resolver; no sync lag |
| **Costs** | Query cost on large tenants — mitigate: period filters, pagination on drill, indexes on `company_id`/`target_month`/`requisition_id` (already expected); BA seals formulas |
| **Risks** | Ambiguous «filled» (hired vs onboard) / ETA heuristic — **mitigate:** BA O* CONFIRM; empty guide when no approved plan (SRS special) |

### Option B — Materialized rollup table + refresh job

| | |
|--|--|
| **Description** | CREATE `rec_dashboard_rollup` (or similar) + trigger/cron to pre-aggregate KH/TT; Nest reads rollup only. |
| **Benefits** | Fast reads at scale; chart-friendly |
| **Costs** | New physical table; refresh correctness; stale risk after spawn/approve/hire; ba-data + DevOps; dual semantic if treated as write SoT |
| **Risks** | Drift vs sealed spine after REC-01/02 mutations; C-SLICE complexity; over-build for MVP cell volumes — **REJECT for GD1 unlock** (may revisit as P2 perf after evidence) |

### Option C — FE aggregation (AS-IS / ACCEPT hold)

| | |
|--|--|
| **Description** | Keep/extend `recruitmentDashboardAggregator` + multi-list joins; or HOLD docs-only without Nest dashboard. |
| **Benefits** | Zero BE churn short-term |
| **Costs** | Violates SOLID 25 §3.1 / FE–BE display-ready; wrong SoT (`job_postings`); persona scope bugs; formula drift |
| **Risks** | REQ_REC_005 FAIL forever; U89 stall if HOLD; sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-08 + REQ_REC_005) | 25 | **9** | 8 | 3 |
| Time to deliver (U89 continuous) | 20 | **9** | 4 | 2 |
| Complexity / blast radius | 15 | **8** | 3 | 7 |
| Security / scope_parity U19 + C&B non-leak | 15 | **9** | 7 | 3 |
| Reliability (one spine, no stale rollup) | 15 | **9** | 5 | 3 |
| Maintainability (SOLID · display-ready) | 10 | **9** | 6 | 1 |
| **Weighted (≈)** | 100 | **8.9** | **5.4** | **3.1** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | FE still joins `job_postings` for KH | Code review / QA | **DENY**; FE bind dashboard DTO only |
| A | Nest invents `/rec/dashboard` controller dual | Grep routes | Physical `/recruitment/dashboard*` only; paper alias |
| A | Materialize invent rollup «for speed» without SA | Diff schema | **DENY** Option B in this seat; P2 later |
| A | KH counts draft cells | QA formula | Only approved / `need_hire_approved` (BA O2) |
| A | TT counts cross-company | Persona probe | `resolveHrmListScope` on all GETs |
| A | Funnel invents Campaign | Spec/QA | Drill YCTD only; REC-03 OUT |
| A | C&B / offer salary on dashboard | QA | **403/omit** C&B fields |
| A | Flip `recruitment_uat_ready` after slice GWC | QC honesty | **DENY**; C-SLICE |
| B | Stale after spawn/hire | Integration | Reject B for MVP |
| C | Domain formulas on FE | lint/review | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — Nest **on-the-fly** read-model aggregation + **display-ready** DTO on physical `/api/hrm/recruitment/dashboard*` |
| **Why selected** | Reuses sealed REC-01/02 spine without dual SoT; enforces SOLID 25 §3.1 (no FE domain aggregate); matches paper F-REC-DASH-01 intent with physical-prefer path lock; unlocks U89 seat #5 with lowest blast radius |
| **Assumptions** | REC-01 cell identity + REC-02 YCTD tokens remain sealed. Candidate/application linkage to `requisition_id` exists for funnel when data present; empty funnel buckets = 0 (SRS). «Enough people ETA» may be heuristic from open YCTD `target_month` + remaining gap — **BA CONFIRM**. Perf materialization deferred until measured need. |
| **Rejected** | **B** — materialized rollup (P2 later) · **C** — FE aggregation / HOLD |

### 6.1 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | REC-01 cell identity / `need_hire` / spawn UQ · REC-02 YCTD tokens (`headcount_mode`, `open_for_hire`, pipeline_flags, CELL-QTY/BOD) · `resolveHrmListScope` · soft-delete · JD/UV peers · XBOS bridges · honesty false |
| **DENY invent** | FE domain join for KH/TT/% · Nest `/rec/dashboard` dual SoT · second rollup **write** SoT table this wave · REC-03 campaign drill primary · `job_postings` as KH SoT · seed · flip `recruitment_uat_ready` / program honesty · claim module REC UAT · reopen REC-02 seals · dual `rec_headcount_*` |
| **OUT** | UC-BP-REC-03 · Campaign CRUD GĐ1 |
| **HOLD peer** | Materialized rollup (Option B) as **P2 perf** only after QA evidence of latency |
| **Honesty** | All flags **false** · **C-SLICE** |

### 6.2 Scope ladder (U19 — mandatory)

| Persona | Scope behavior on dashboard GET |
|---------|----------------------------------|
| **Group CEO** (`main` / rollup) | Sees member units in resolved scope — **no** silent mix outside token |
| **Member CEO** | Own legal entity only — 403/409 or empty outside scope (same as list plans/YCTD) |
| **HRBP** | Narrow membership scope — same resolver as `listRecruitmentPlans` / `listJobRequisitions` |

**Invariant D-S-SCOPE:** list dashboard summary **=** drill YCTD rows **=** underlying plan/requisition get-by-id scope — **same** `resolveHrmListScope`.

---

## 7. Display-ready contract (architecture lock)

> FE **must not** compute `completion_pct`, gap, ETA, or join entities to invent KH/TT. Chart libraries may **render** arrays already shaped by BE.

### 7.1 Query params (normative intent)

| Param | Required | Rule |
|-------|----------|------|
| `year` or `from`+`to` (month range) | Yes | Within định biên year; BA seals exact |
| `company_id` / OU filter | Per auth | Scope resolver — client hint must match token |
| `department_key` / `position_key` | No | Catalog keys when filter |
| `include_yctd_drill` | No | Default summary; drill on demand |

### 7.2 Response fields (display-ready — BA/API may rename vi labels)

| Field | Meaning (KH/TT) | Source spine |
|-------|-----------------|--------------|
| `planned_need` | Σ Cần tuyển (KH) | `months_data[].need_hire` where cell counts per BA O2 |
| `filled_count` | Đã đủ / onboard|hired (TT) | Candidates/apps on YCTD — BA O3 |
| `in_pipeline_count` | Đang pipeline (not terminal reject) | Same + stage catalog |
| `open_yctd_count` | YCTD receivable / in progress | `job_requisitions` status/mode |
| `gap_count` | `max(planned_need - filled_count, 0)` | **BE only** |
| `completion_pct` | 0–100 or `null` when planned=0 | **BE only** — no FE divide |
| `enough_people_status` | enum e.g. `enough` \| `in_progress` \| `at_risk` \| `no_plan` | **BE only** |
| `enough_people_eta` | `yyyy-MM` or `null` + `enough_people_eta_label` (vi) | **BE only** — BA O5 formula |
| `funnel` | `{ cv, screening, interview, offer, onboard }` counts | Stage map — empty=0 |
| `by_month[]` | month, planned_need, filled, gap, completion_pct, eta | BE shaped rows |
| `by_org_unit[]` | org labels + same metrics | Scope-safe |
| `by_yctd[]` | drill rows: requisition id, title, mode, status, headcount, filled, pipeline, target_month, cell_id | Diễn biến #3 |
| `empty_guide` | when no approved định biên | SRS special — **no invented numbers** |
| **FORBIDDEN** | offer salary, C&B, MST, bank | FR-08 BR |

### 7.3 Formula disposition (SA → BA CONFIRM)

| ID | Topic | SA LOCK |
|----|-------|---------|
| **O2** | Which cells enter KH | Prefer: plan `approved` **and** cell `lifecycle_status=need_hire_approved` **and** `need_hire≥1` in selected period — **BA CONFIRM** edge (approved plan but cell still `need_hire` unlock?) |
| **O3** | What counts as filled/TT | Prefer: candidate/application **hired/onboard outcome** linked to YCTD in scope; KPI stop at onboard (SRS) — probation exit **does not** auto-decrement unless tenant CFG (SRS special) |
| **O4** | Funnel stage keys | Map from **effective pipeline-stage catalog** — **cấm** hardcode English-only; missing stage → 0 |
| **O5** | ETA «bao giờ đủ» | Prefer: earliest `target_month` among open YCTD with remaining gap>0; if none → `null` + status from completion; **BA CONFIRM** wording |
| **O6** | out_of_plan YCTD | **Include** in TT/funnel/drill with `headcount_mode` flag — KH still from cells only (out_of_plan does not inflate KH) |
| **O7** | Legacy unclassified mode | Follow REC-02 O4: readable; do not treat as in_plan KH fill credit without classify — **BA CONFIRM** |

---

## 8. Implementation and Validation Plan

### 8.1 Rollout steps

1. **ba-process** — AC pack REC-08 (O1–O10 · VAL · Diễn biến FE · J-* DRAFT) against Option A.
2. **SA/API (+ ba-data if needed)** — F.1 DOC-DELTA physical path + DTO↔source columns (no new SoT table).
3. **Dev-BE** — dashboard service + scope tests + empty guide + C&B omit.
4. **Dev-FE** — replace aggregator domain joins with DTO bind; preserve chart chrome; F5 after filter change.
5. **QA** — browser U65 UF/J-* · personas group/member/HRBP · **no seed**.
6. **QC** — GWC C-SLICE · honesty false · **no** module UAT claim.

### 8.2 Rollback

- Feature-flag dashboard endpoint → prior FE charts only as emergency (temporary); **prefer** forward-fix to DTO bind.
- **No** drop of REC-01/02 tables/columns.

### 8.3 Validation checkpoints

| Gate | PASS when |
|------|-----------|
| Spec | This Option A CONFIRMED + BA AC CONFIRMED |
| Contract | API F.1 cites physical `/recruitment/dashboard*` + display-ready fields |
| L0–L2.5 | Browser: filter → load metrics → drill YCTD; F5; no FE formula; scope personas |
| Honesty | Evidence stamps `recruitment_uat_ready=false` |

### 8.4 Success criteria (architecture)

- One read-model owner = Nest recruitment dashboard service.
- KH from sealed cells; TT from YCTD-linked pipeline/hire — not `job_postings` KH.
- FE display-only; completion_pct/ETA computed on BE.
- U19 scope parity; no Nest `/rec` dual; no REC-03; no honesty flip.

---

## 9. F.1 unlock list (endpoints + BA AC rows)

> Full request/response column contracts = **next** API seat after BA AC. This seat **locks** which F-ids unlock.

| F-id | Mục đích | SRS bước | Physical path (Option A) | Paper alias | Status |
|------|----------|----------|---------------------------|-------------|--------|
| **F-REC-DASH-01** | Summary KH vs TT + funnel + enough-people | FR-08 #1–#2 | `GET /api/hrm/recruitment/dashboard` | `GET /api/hrm/rec/dashboard` | **UNLOCK ADD** |
| **F-REC-DASH-02** | Drill YCTD / pipeline rows | FR-08 #3 | `GET /api/hrm/recruitment/dashboard/yctd` **or** `?include=yctd` on -01 | paper drill | **UNLOCK ADD** (same wave preferred) |
| **F-REC-HC-01** GET plans/cells | Source KH | peer | existing `/recruitment/recruitment-plans*` | `/rec/headcount-plans*` | **RETAIN** read (dashboard may internal-query, not FE re-join) |
| **F-REC-YCTD-01/02** list/get | Source YCTD | peer | `/recruitment/requisitions*` | `/rec/recruitment-requests*` | **RETAIN** |
| **F-REC-YCTD-04** flags | Pipeline flags | peer | existing | — | **RETAIN** |
| **F-REC-UV-*** / apps list | Funnel counts | peer | existing candidates/applications | — | **RETAIN** internal read |
| **F-REC-CAMPAIGN-*** | Campaign hub | FR-03 | — | — | **OUT / DENY** |

### 9.1 Domain invariants (architecture lock)

| ID | Invariant |
|----|-----------|
| **D-S1** | Dashboard is **read-only** — no mutate định biên/YCTD via dashboard endpoints |
| **D-S2** | Physical Nest family = `/api/hrm/recruitment/dashboard*` · paper `/rec/dashboard` = **alias only** |
| **D-S3** | KH SoT = REC-01 cells — **not** `job_postings.headcount` · **not** FE sum of open postings |
| **D-S4** | TT/funnel SoT = YCTD-linked candidates/applications (+ pipeline_flags) — stop KPI at onboard |
| **D-S5** | All %-gap-ETA fields computed **on BE**; FE renders only |
| **D-S6** | `out_of_plan` contributes to TT/drill **without** increasing KH |
| **D-S7** | Empty approved định biên → guide + zeros — **cấm** bịa số |
| **D-S8** | No C&B / offer compensation fields on DTO |
| **D-S9** | Scope: summary = drill = source lists via `resolveHrmListScope` |
| **D-S10** | Drill target = **YCTD** (MVP) — Campaign drill **OUT** |

### 9.2 BA AC rows required (handoff checklist)

| AC row id (suggested) | Covers | Must include |
|-----------------------|--------|--------------|
| **AC-REC-08-01** | Diễn biến #1 filter kỳ/đơn vị | Persona group/member/HRBP · ngoài scope fail |
| **AC-REC-08-02** | Diễn biến #2 tải chỉ số | Network GET dashboard 2xx · FE sau bind · F5 |
| **AC-REC-08-03** | KH vs TT numbers | Match O2/O3 formulas · empty guide |
| **AC-REC-08-04** | Funnel buckets | All stages present; missing=0 · O4 |
| **AC-REC-08-05** | «Bao giờ đủ người» | `enough_people_*` display · O5 |
| **AC-REC-08-06** | Diễn biến #3 drill YCTD | Click → YCTD rows; **not** Campaign |
| **AC-REC-08-07** | out_of_plan visibility | O6 — TT yes / KH no inflate |
| **AC-REC-08-08** | C&B non-leak | No salary/offer $ on UI/Network |
| **AC-REC-08-09** | FE no domain aggregate | Assert FE does not call multi-list join for KH/% |
| **AC-REC-08-10** | Reports tab alignment | Same contract or documented subset — **no** second formula |
| **VAL-REC-DASH-*** | Errors | SCOPE-409 · empty · invalid period |

**BA open decisions to CONFIRM:** O2–O7 (§7.3) + **O1** physical path prefer + **O8** Reports dual-surface + **O9** ETA null semantics + **O10** whether cost charts remain OUT this cluster (SA recommends **OUT / omit invent VND**).

---

## 10. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · Option **A** CONFIRMED |
| **next_owner** | **ba-process** — AC pack `PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-sa-01.md` |
| **Unlocks** | BA AC → API F.1 → Dev-BE/FE |
| **Does not unlock** | Dev without BA+API · REC-03 · honesty flips · seed · dual SoT · Option B materialize · reopen REC-02 |

---

## completion_report

- **Closed:** Option A/B/C + trade-off + F.1 disposition DASH-01/02; LIVE vs gap; display-ready contract; U19 scope ladder; REC-01/02 spine reuse; FE aggregation DENY; REC-03 OUT; honesty/C-SLICE.
- **Residual:** BA AC O1–O10 + VAL; API physical DOC-DELTA; Dev after contracts; Option B perf HOLD; parallel REC-02 target_month P2 orthogonal.
