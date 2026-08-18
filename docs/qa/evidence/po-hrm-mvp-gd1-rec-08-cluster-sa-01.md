# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md` |
| **depends_on** | QC-01 GWC REC-02/02b — `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-REC-08` |
| **board_seat** | #5 · «bao giờ đủ người» |
| **selected_option** | **A** — Nest on-the-fly read-model + display-ready DTO · physical `/api/hrm/recruitment/dashboard*` |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **change_mode** | Docs-only · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | REC-01 SA-01 + DATA-01 | Cell model `need_hire` / lifecycle / cell_id — **reuse** KH source |
| 2 | REC-02 SA/DATA/API + QC-01 | YCTD physical LIVE (`open_for_hire`, mode, flags) — **reuse** TT source |
| 3 | SRS FR-UC-BP-REC-08 | 7-mục · KH vs TT · funnel · drill YCTD · no C&B · no invent empty |
| 4 | WBS-REC-06 · REQ_REC_005 | Partner «Khi nào có đủ người» |
| 5 | Paper F-REC-DASH-01 | `GET /api/hrm/rec/dashboard` — logical; physical prefer `/recruitment/dashboard*` |
| 6 | AS-IS FE/BE | §2 |
| 7 | ADR Option template §§1–7 + F.1 | Applied in spec |
| 8 | SOLID 25 §3.1 / display-ready | FE aggregation = **DENY** |

---

## 2. AS-IS probes (facts)

| Probe | Evidence |
|-------|----------|
| Nest dashboard route | **ABSENT** — no `dashboard`/`report` under `apps/api/hrm-api/src/recruitment` |
| FE Recruitment Dashboard | `useRecruitmentDashboard.ts` joins kanban + `listCandidateApplications` + **`listJobPostings`**; `recruitmentDashboardAggregator.ts` builds dept/month/cost on FE |
| FE Reports recruitment | `useReportsData.ts` → `buildRecruitmentReportFromApi(candidates)` — FE aggregate |
| KH spine LIVE | REC-01 `months_data` need_hire / lifecycle — **not** wired to dashboard |
| YCTD spine LIVE | REC-02 `job_requisitions` mode/status/pipeline_flags — **not** wired as KH/TT SoT on dashboard |
| Wrong SoT risk | Charts use **job_postings** headcount sum — ≠ định biên cells |
| Paper response shape | `{ planned_need, hired, in_pipeline, completion_pct[], by_org_unit[] }` |
| Honesty | `recruitment_uat_ready=false` must_keep |

---

## 3. Disposition summary

| Item | Value |
|------|-------|
| Option A | BE on-the-fly aggregate · display-ready · physical `/recruitment/dashboard*` |
| Option B | Materialized rollup table — **REJECTED** (MVP) · P2 perf HOLD |
| Option C | FE aggregation / HOLD — **REJECTED** (SOLID + U89) |
| F.1 unlock | **F-REC-DASH-01** ADD · **F-REC-DASH-02** drill ADD · HC/YCTD/UV **RETAIN** · Campaign **OUT** |
| Invariants | D-S1..D-S10 |
| Scope | U19 `resolveHrmListScope` group CEO → member CEO → HRBP |
| DENY | FE domain join · Nest `/rec` dual · rollup write SoT · REC-03 · seed · honesty flip · reopen REC-02 · module UAT |

---

## 4. Honesty / C-SLICE footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
no dual rec_headcount_*
REC-01/02 Option A spine RETAIN
no FE domain aggregation for KH/TT/%
```

---

## 5. BA handoff notes

| Item | Note |
|------|------|
| next_owner | **ba-process** |
| work_item | `PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01` |
| CONFIRM | O1 physical path · O2 KH cells · O3 filled/onboard · O4 funnel keys · O5 ETA · O6 out_of_plan · O7 legacy mode · O8 Reports align · O9 ETA null · O10 cost charts OUT |
| AC rows | AC-REC-08-01..10 · VAL-REC-DASH-* |
| J-* | DRAFT browser: filter → metrics → YCTD drill · personas |

---

## 6. Spec size

| Artifact | Note |
|----------|------|
| Spec | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md` |
| Evidence | this file |

---

## completion_report

- **Closed:** Option A LOCKED for UC-BP-REC-08; F.1 DASH-01/02 unlock list; display-ready contract; U19 scope; DENY FE aggregate / dual Nest / REC-03 / honesty flip.
- **Residual:** BA AC pack; API F.1; Dev after contracts; Option B P2 HOLD.

## next_owner

**ba-process**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: SA-01 Option A CONFIRMED docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-sa-01.md

MISSION: AC pack FR-UC-BP-REC-08 against Option A (Nest on-the-fly dashboard · display-ready · physical /api/hrm/recruitment/dashboard*).
CONFIRM O1–O10 (KH cells, filled/onboard, funnel keys, ETA, out_of_plan, legacy mode, Reports align, cost OUT).
Deliver AC-REC-08-01..10 + VAL-REC-DASH-* + Diễn biến FE + J-* DRAFT.
must_keep: REC-01/02 seals · honesty false · C-SLICE · REC-03 OUT · no seed · no FE domain aggregate · no Nest /rec dual.
DENY: invent Campaign drill · reopen REC-02 · module REC UAT claim · Option B materialize unlock.
exit: PASS_TO_PM CONFIRMED · evidence docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md + docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-ba-01.md
next_owner: sa or ba-data/API for F.1 DOC-DELTA after AC CONFIRMED
```

## ack_status

**PASS_TO_PM** CONFIRMED
